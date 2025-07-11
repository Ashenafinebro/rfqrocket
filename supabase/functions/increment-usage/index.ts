
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const { type } = await req.json();
    
    if (!type || !['rfq', 'proposal'].includes(type)) {
      throw new Error("Invalid usage type. Must be 'rfq' or 'proposal'");
    }

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create client for auth verification
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
    
    if (userError || !user) {
      console.error("User authentication failed:", userError);
      throw new Error("User not authenticated");
    }

    console.log("Authenticated user:", user.id);

    // Create service role client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Increment the appropriate counter using the database function
    const columnToIncrement = type === 'rfq' ? 'rfq_count' : 'proposal_count';
    
    console.log(`Incrementing ${columnToIncrement} for user ${user.id}`);
    
    const { error: updateError } = await supabaseService.rpc('increment_usage_count', {
      user_id: user.id,
      usage_type: columnToIncrement
    });

    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }

    console.log(`Successfully incremented ${columnToIncrement}`);

    return new Response(
      JSON.stringify({ success: true, message: `${type} count incremented` }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error incrementing usage:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
