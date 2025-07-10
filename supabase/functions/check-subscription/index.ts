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
    console.log("Check subscription function started");
    
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    
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

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      console.log("No Stripe customer found");
      
      // Get usage data from profiles and ensure demo limits
      const { data: profileData } = await supabaseClient
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          subscription_plan: null,
          subscription_active: false,
          subscription_end: null,
          rfq_count: 0, // Initialize counts for new users
          proposal_count: 0
        }, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select('rfq_count, proposal_count')
        .single();

      return new Response(
        JSON.stringify({ 
          subscribed: false,
          plan: null,
          subscription_end: null,
          rfq_count: profileData?.rfq_count || 0,
          proposal_count: profileData?.proposal_count || 0
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const customerId = customers.data[0].id;
    console.log("Found Stripe customer:", customerId);

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let planName = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      
      // Get the price to determine plan
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      
      console.log("Subscription price amount:", amount);
      
      // Match price to plan from database
      const { data: pricingData } = await supabaseClient
        .from('plan_pricing')
        .select('plan_name, monthly_price, annual_price');
      
      console.log("Available pricing plans:", pricingData);
      
      for (const plan of pricingData || []) {
        const monthlyInCents = plan.monthly_price * 100;
        const annualInCents = plan.annual_price * 100;
        
        console.log(`Checking plan ${plan.plan_name}: monthly=${monthlyInCents}, annual=${annualInCents}, actual=${amount}`);
        
        if (amount === monthlyInCents || amount === annualInCents) {
          planName = plan.plan_name;
          console.log("Matched plan:", planName);
          break;
        }
      }
      
      // If we couldn't match by price, check by product name or description
      if (!planName) {
        const product = await stripe.products.retrieve(price.product as string);
        console.log("Product details:", product.name, product.description);
        
        if (product.name.toLowerCase().includes('premium')) {
          planName = 'Premium';
        } else if (product.name.toLowerCase().includes('professional')) {
          planName = 'Professional';
        }
      }
      
      console.log("Final determined plan:", planName);
      console.log("Active subscription found:", { planName, subscriptionEnd });
    }

    // Update user profile with subscription status and get usage data
    const { data: profileData } = await supabaseClient
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        subscription_plan: planName,
        subscription_active: hasActiveSub,
        subscription_end: subscriptionEnd,
        // Don't reset counts here - keep existing usage
      }, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select('rfq_count, proposal_count')
      .single();

    console.log("Updated profile with subscription info:", {
      subscribed: hasActiveSub,
      plan: planName,
      rfq_count: profileData?.rfq_count || 0,
      proposal_count: profileData?.proposal_count || 0
    });

    return new Response(
      JSON.stringify({
        subscribed: hasActiveSub,
        plan: planName,
        subscription_end: subscriptionEnd,
        rfq_count: profileData?.rfq_count || 0,
        proposal_count: profileData?.proposal_count || 0
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error checking subscription:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        subscribed: false,
        plan: null 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
