
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Create checkout function started");
    
    // Check if Stripe secret key is available
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY environment variable is not set");
      throw new Error("Stripe configuration error - secret key not found");
    }
    
    console.log("Stripe secret key found, length:", stripeSecretKey.length);
    
    const { planName, promoCode, isAnnual } = await req.json();
    console.log("Plan requested:", planName, "Promo code:", promoCode, "Annual:", isAnnual);
    
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user?.email) {
      console.error("User authentication error:", userError);
      throw new Error("User not authenticated");
    }
    
    console.log("User authenticated:", user.email);

    // Get pricing from database
    console.log("Fetching pricing from database for plan:", planName);
    const { data: pricingData, error: pricingError } = await supabaseClient
      .from('plan_pricing')
      .select('monthly_price, annual_price')
      .eq('plan_name', planName)
      .single();

    if (pricingError || !pricingData) {
      console.error("Pricing error:", pricingError);
      throw new Error(`Pricing not found for plan: ${planName}`);
    }

    console.log("Database pricing:", pricingData);

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    console.log("Checking for existing customer...");
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Found existing customer:", customerId);
    } else {
      console.log("No existing customer found");
    }

    // Use database pricing
    let priceAmount = isAnnual ? pricingData.annual_price * 100 : pricingData.monthly_price * 100; // Convert to cents
    let productName = isAnnual ? `${planName} Plan (Annual)` : `${planName} Plan (Monthly)`;
    let interval = isAnnual ? "year" : "month";
    
    console.log("Original price amount (cents):", priceAmount);

    // Apply promo code discount if provided
    let discountAmount = 0;
    let finalAmount = priceAmount;
    
    if (promoCode) {
      console.log("Applying promo code:", promoCode);
      try {
        const { data: promoData, error: promoError } = await supabaseClient.rpc('get_promo_discount', {
          promo_code: promoCode
        });

        if (!promoError && promoData && promoData.length > 0) {
          const discount = promoData[0];
          console.log("Promo discount found:", discount);
          
          if (discount.discount_type === 'percentage') {
            discountAmount = Math.round(priceAmount * (discount.discount_value / 100));
          } else {
            discountAmount = Math.round(discount.discount_value * 100); // Convert to cents
          }
          
          finalAmount = Math.max(0, priceAmount - discountAmount);
          console.log("Original price:", priceAmount, "Discount:", discountAmount, "Final:", finalAmount);
        }
      } catch (error) {
        console.error("Error applying promo code:", error);
        // Continue without discount if promo code fails
      }
    }
    
    console.log("Creating checkout session for:", productName, "Price:", finalAmount);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName,
            },
            unit_amount: finalAmount,
            recurring: {
              interval: interval as "month" | "year",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/pricing`,
      metadata: {
        user_id: user.id,
        plan_name: planName,
        promo_code: promoCode || '',
        original_amount: priceAmount.toString(),
        discount_amount: discountAmount.toString(),
      },
    });

    console.log("Checkout session created successfully:", session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Please check that your Stripe secret key is properly configured"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
