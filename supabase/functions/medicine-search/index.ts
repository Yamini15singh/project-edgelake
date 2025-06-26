
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const OPENFDA_API_BASE = "https://api.fda.gov/drug/label.json"
const RXNORM_API_BASE = "https://rxnav.nlm.nih.gov/REST/drugs.json"
const FDA_API_KEY = Deno.env.get("FDA_API_KEY")

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { searchTerm } = await req.json()
    
    if (!searchTerm || searchTerm.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Search term must be at least 2 characters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Starting medicine search for term:', searchTerm);
    const medicines = new Set();
    const errors = [];

    // Search RxNorm API with partial match
    try {
      console.log('Searching RxNorm API...');
      const rxnormUrl = `${RXNORM_API_BASE}?name=${encodeURIComponent(searchTerm)}`
      
      console.log('RxNorm API URL:', rxnormUrl);
      const rxnormResponse = await fetch(rxnormUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      });

      if (!rxnormResponse.ok) {
        throw new Error(`RxNorm API responded with status: ${rxnormResponse.status}`);
      }

      const rxnormData = await rxnormResponse.json();
      console.log('RxNorm API Response:', JSON.stringify(rxnormData, null, 2));

      if (rxnormData.drugGroup?.conceptGroup) {
        rxnormData.drugGroup.conceptGroup.forEach((group: any) => {
          if (group.conceptProperties) {
            group.conceptProperties.forEach((prop: any) => {
              if (prop.name) {
                medicines.add({
                  name: prop.name,
                  description: `RxNorm ID: ${prop.rxcui}, Type: ${group.tty || 'N/A'}`,
                  dosage_form: prop.synonym || null,
                  strength: prop.strength || null,
                  source: 'RxNorm'
                });
              }
            });
          }
        });
      }
    } catch (rxnormError) {
      console.error('RxNorm API error:', rxnormError);
      errors.push({source: 'RxNorm', message: rxnormError.message});
    }

    // Search OpenFDA API with partial match using fuzzy search
    try {
      console.log('Searching FDA API...');
      const query = encodeURIComponent(`openfda.brand_name:${searchTerm}* openfda.generic_name:${searchTerm}* openfda.substance_name:${searchTerm}*`)
      const apiKeyParam = FDA_API_KEY ? `&api_key=${FDA_API_KEY}` : ''
      const fdaUrl = `${OPENFDA_API_BASE}?search=${query}&limit=10${apiKeyParam}`
      
      console.log('FDA API URL:', fdaUrl);
      const fdaResponse = await fetch(fdaUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      });

      if (!fdaResponse.ok) {
        throw new Error(`FDA API responded with status: ${fdaResponse.status}`);
      }

      const contentType = fdaResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`FDA API returned non-JSON response: ${contentType}`);
      }

      const fdaData = await fdaResponse.json();
      console.log('FDA API Response:', JSON.stringify(fdaData, null, 2));

      if (fdaData.results) {
        fdaData.results.forEach((result: any) => {
          const brandNames = result.openfda?.brand_name || [];
          const genericNames = result.openfda?.generic_name || [];
          const substanceNames = result.openfda?.substance_name || [];
          const names = [...new Set([...brandNames, ...genericNames])];
          
          names.forEach(name => {
            if (name) {
              medicines.add({
                name,
                description: result.description?.[0]?.slice(0, 500) || 
                            result.indications_and_usage?.[0]?.slice(0, 500) ||
                            `Active substances: ${substanceNames.join(', ')}`,
                dosage_form: result.dosage_and_administration?.[0]?.slice(0, 200),
                strength: result.openfda?.strength?.[0] || 
                         result.dosage_forms_and_strengths?.[0],
                source: 'FDA'
              });
            }
          });

          // Also add entries for substance names if they match the search
          substanceNames.forEach(substanceName => {
            if (substanceName && substanceName.toLowerCase().includes(searchTerm.toLowerCase())) {
              medicines.add({
                name: substanceName,
                description: `Active substance found in: ${brandNames.join(', ') || 'Various medications'}`,
                dosage_form: result.dosage_and_administration?.[0]?.slice(0, 200),
                strength: result.openfda?.strength?.[0],
                source: 'FDA (Active Substance)'
              });
            }
          });
        });
      }
    } catch (fdaError) {
      console.error('FDA API error:', fdaError);
      errors.push({source: 'FDA', message: fdaError.message});
      // Continue execution - we might still have results from RxNorm
    }

    // If both APIs failed and we have no medicines, return fallback data
    if (errors.length >= 2 && medicines.size === 0) {
      console.log('All APIs failed, returning fallback data');
      
      // Add fallback medicines based on search term
      medicines.add({
        name: `${searchTerm} (Generic)`,
        description: "Fallback entry created when external APIs are unavailable",
        dosage_form: "Various",
        strength: "Various",
        source: "System Fallback"
      });
      
      return new Response(
        JSON.stringify({ 
          medicines: Array.from(medicines),
          errors
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert Set to Array and filter out duplicates and invalid entries
    const uniqueMedicines = Array.from(medicines)
      .filter((medicine: any) => medicine.name && typeof medicine.name === 'string')
      // Remove duplicates based on name (case-insensitive)
      .filter((medicine: any, index: number, self: any[]) => 
        index === self.findIndex((m: any) => 
          m.name.toLowerCase() === medicine.name.toLowerCase()
        )
      );

    console.log('Combined results:', uniqueMedicines);

    // If there are errors but we have results, include them in the response
    const responseData = {
      medicines: uniqueMedicines,
      ...(errors.length > 0 && { errors })
    };

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in medicine-search function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch medicine data', 
        details: error.message,
        medicines: [{
          name: "Offline Mode",
          description: "The medicine search service is currently unavailable. Please try again later or enter medicines manually.",
          dosage_form: "N/A",
          strength: "N/A",
          source: "System Message"
        }]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
