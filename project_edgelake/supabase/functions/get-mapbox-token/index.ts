
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Define comprehensive CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control, pragma',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Expose-Headers': 'Content-Length, X-JSON',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
};

serve(async (req) => {
  const requestStartTime = Date.now();
  console.log(`Request received: ${req.method} at ${new Date().toISOString()}`);
  
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      console.log('Handling OPTIONS request for CORS preflight');
      return new Response(null, { 
        status: 204, 
        headers: corsHeaders 
      });
    }

    // Only process GET or POST requests
    if (req.method !== 'GET' && req.method !== 'POST') {
      console.error(`Unsupported method: ${req.method}`);
      return new Response(
        JSON.stringify({ error: `Unsupported method: ${req.method}` }),
        { 
          status: 405,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    console.log('Processing request for Mapbox token');
    
    // Get the token from environment, or use a fallback public token
    let mapboxToken = Deno.env.get("MAPBOX_TOKEN");
    
    console.log('Mapbox token from environment:', 
      mapboxToken ? `${mapboxToken.substring(0, 5)}...` : 'undefined');
    
    // If no token is set in environment or it's not a public token, use fallback
    if (!mapboxToken || !mapboxToken.startsWith('pk.')) {
      console.log("Using fallback public Mapbox token - token missing or not a public token");
      // This is a Mapbox public token for development purposes only
      mapboxToken = "pk.eyJ1IjoibGllY2hhIiwiYSI6ImNtN3N1bDI1bzBpdDUyaXJiMmM2OG5qczYifQ.tH9u1oFFmkf11xWOtc0bYQ";
    }

    const response = {
      token: mapboxToken,
      retrieved: true,
      timestamp: new Date().toISOString()
    };

    console.log(`Request completed in ${Date.now() - requestStartTime}ms`);
    
    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error("Error in get-mapbox-token function:", error);
    
    // Return fallback public token in case of any error
    const fallbackToken = "pk.eyJ1IjoibGllY2hhIiwiYSI6ImNtN3N1bDI1bzBpdDUyaXJiMmM2OG5qczYifQ.tH9u1oFFmkf11xWOtc0bYQ";
    
    return new Response(
      JSON.stringify({ 
        token: fallbackToken,
        error: error instanceof Error ? error.message : String(error),
        errorType: typeof error,
        stack: error instanceof Error ? error.stack : undefined,
      }),
      { 
        status: 200, // Return 200 with fallback token instead of error
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
});
