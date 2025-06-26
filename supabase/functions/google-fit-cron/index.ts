
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Google Fit cron job triggered at:', new Date().toISOString());
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Google Fit cron sync...');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    console.log('Supabase configuration validated');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all users with connected Google Fit
    const { data: connections, error: connectionsError } = await supabase
      .from('connected_services')
      .select('user_id, access_token')
      .eq('service_name', 'Google Fit')
      .not('access_token', 'is', null);

    if (connectionsError) {
      console.error('Error fetching connections:', connectionsError);
      throw connectionsError;
    }

    console.log(`Found ${connections?.length || 0} users with Google Fit connections`);

    // Sync data for each connected user
    const syncPromises = connections?.map(async (connection) => {
      if (!connection.access_token || !connection.user_id) {
        console.log(`Skipping sync for user ${connection.user_id}: Missing access token`);
        return;
      }

      try {
        console.log(`Starting sync for user ${connection.user_id}`);
        const response = await fetch(`${supabaseUrl}/functions/v1/google-fit-sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            userId: connection.user_id,
            accessToken: connection.access_token,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Sync failed for user ${connection.user_id}:`, errorText);
          throw new Error(`Sync failed: ${errorText}`);
        }

        const result = await response.json();
        console.log(`Successfully synced data for user ${connection.user_id}:`, result);
      } catch (error) {
        console.error(`Error syncing data for user ${connection.user_id}:`, error);
      }
    }) || [];

    await Promise.all(syncPromises);
    console.log('Cron sync completed successfully');

    return new Response(
      JSON.stringify({ message: 'Cron sync completed', timestamp: new Date().toISOString() }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in cron function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        timestamp: new Date().toISOString() 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
