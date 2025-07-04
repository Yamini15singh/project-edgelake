import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const FDA_API_KEY = Deno.env.get('FDA_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchTerm } = await req.json();
    
    // Search FDA API for conditions/diseases
    const fdaResponse = await fetch(
      `https://api.fda.gov/drug/label.json?api_key=${FDA_API_KEY}&search=indications_and_usage:"${searchTerm}"&limit=10`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    const fdaData = await fdaResponse.json();
    
    // If FDA API returns an error about no matches, return an empty results array
    if (fdaData.error && fdaData.error.code === "NOT_FOUND") {
      console.log('No matches found in FDA API for term:', searchTerm);
      return new Response(
        JSON.stringify({ results: [] }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 // Return 200 with empty results instead of error
        }
      );
    }

    if (fdaData.error) {
      console.error('FDA API error:', fdaData.error);
      throw new Error(fdaData.error.message);
    }

    // Extract unique conditions from the FDA response
    const conditions = new Set();
    fdaData.results?.forEach((result: any) => {
      const indications = result.indications_and_usage?.[0] || '';
      // Split the text into sentences and extract condition names
      const sentences = indications.split(/[.;]\s+/);
      sentences.forEach((sentence: string) => {
        // Look for common patterns that indicate conditions
        const matches = sentence.match(/(?:treats?|for|in)\s+([^.;:]+?)(?=\s+(?:in patients?|when|if|or|and|\.|\n|$))/gi);
        if (matches) {
          matches.forEach((match: string) => {
            const condition = match.replace(/^(?:treats?|for|in)\s+/i, '').trim();
            if (condition.length > 3 && condition.length < 100) {
              conditions.add({
                name: condition,
                type: 'condition',
                source: 'FDA'
              });
            }
          });
        }
      });
    });

    const uniqueConditions = Array.from(conditions);
    console.log('Processed conditions:', uniqueConditions);

    return new Response(
      JSON.stringify({ results: uniqueConditions }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in condition search:', error);
    // Return a 200 status with empty results for any error
    return new Response(
      JSON.stringify({ 
        results: [],
        error: error.message 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Always return 200 to prevent frontend errors
      }
    );
  }
});