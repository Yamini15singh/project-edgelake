
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

import { AIModelConfig, AIProvider } from './models/provider/types.ts';
import { createAIModel } from "./models/index.ts";
import { processDocumentContent} from "../utils.ts";
import { getConfig, getProviderDetails } from "../config.ts";

// load all app configs
const config = getConfig();

// get provider details. This will be used to get the API key and model name for the configured provider
// This function will throw an error if the API key or model name is not defined
const providerDetails= getProviderDetails(config);

// Environment variables
const supabaseUrl = config.supabase.url;
const supabaseServiceKey = config.supabase.serviceRoleKey;

// AI Model configuration
const aiConfig: AIModelConfig = {
  apiKey: providerDetails.apiKey, // get the API key for the configured provider
  modelName: providerDetails.modelName || 'gpt-4o-mini',
  temperature: config.ai.temperature || 0.7,
  maxTokens: config.ai.maxTokens || 500,
  aiProvider: config.ai.provider as AIProvider,
};

// Create AI model instance based on environment
const aiModel = createAIModel(aiConfig.aiProvider, aiConfig);

serve(async (req) => {
  console.log("config: ", config);
  console.log("provider details: ", providerDetails);

  // Add detailed request logging for debugging
  console.log(`Received ${req.method} request to chatlifeatlas function`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { 
      headers: corsHeaders 
    });
  }

  try {
    // Log the API key presence (not the key itself)
    console.log(`AI Provider: ${aiConfig.aiProvider}`);
    console.log(`API key configured: ${aiConfig.apiKey ? 'Yes' : 'No'}`);
    
    // Get the request payload
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Successfully parsed request body");
    } catch (error: unknown) {
      const parseError = error as Error;
      console.error("Error parsing request body:", parseError.message);
      throw new Error("Invalid request format: could not parse JSON body");
    }
    
    const { message, userId } = requestBody;
    
    if (!message || typeof message !== 'string' || !message.trim()) {
      console.error("Invalid message in request:", message);
      throw new Error("Invalid or empty message");
    }

    if (!userId) {
      console.error("Missing userId in request");
      throw new Error("User ID is required");
    }

    console.log(`ChatLifeAtlas query from user ${userId}: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`);

    // Fetch user's health documents content
    let documentContext = 'No health documents have been uploaded yet.';
    
    if (supabaseUrl && supabaseServiceKey) {
      try {
        console.log("Initializing Supabase client to fetch health documents");
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // Fetch extracted content from documents for this specific user
        const { data: extractedContent, error: contentError } = await supabase
          .from('extracted_content_for_bot')
          .select(`
            content,
            file_id,
            health_data_files!inner (
              filename
            )
          `)
          .eq('user_id', userId);

        if (contentError) {
          console.error('Error fetching extracted content:', contentError);
        } else if (extractedContent && extractedContent.length > 0) {
          console.log(`Found ${extractedContent.length} document(s) for user ${userId}`);
          
          // Use new document processing function to handle token limits
          documentContext = processDocumentContent(extractedContent);
          console.log(`Processed document context, approx size: ${documentContext.length} characters`);
        } else {
          console.log(`No document content found for user ${userId}`);
        }
      } catch (dbError) {
        console.error("Error accessing document database:", dbError);
        // Fall back to default message if database access fails
      }
    } else {
      console.log("Supabase credentials not available, skipping document fetch");
    }
    console.log("document context for user:  ", userId,  documentContext);

    // Create system prompt for Life Atlas assistant with document context
    const systemPrompt = `You are Life Atlas AI, an intelligent assistant integrated with the Life Atlas application. 
Your purpose is to help users reflect on their life's journey, make sense of their experiences, and plan for the future. 
Your tone is thoughtful, empathetic, and encouraging.

${documentContext}

Follow these guidelines:
- When the user asks about their health documents, reference specific document names and content
- Provide thoughtful, personalized responses to users' questions
- Offer insights to help users connect the dots between their past experiences and future aspirations
- Encourage reflection and personal growth
- Respond to general life questions with wisdom and clarity
- Keep responses concise (100-200 words) but meaningful
- When you don't know something, be honest about it
- Never make up information about the user's data

Remember that you are a supportive companion on the user's life journey.`;

    // Check if API key is configured
    if (!aiConfig.apiKey) {
      console.error("AI API key is not configured");
      return new Response(
        JSON.stringify({ 
          response: "I'm currently unable to respond due to a configuration issue. Please contact the administrator to ensure the AI API key is properly set up.",
          error: "AI API key not configured"
        }),
        { 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          },
          status: 200
        }
      );
    }

    console.log("Preparing to call AI API");
    
    // Generate response using the AI model
    const aiResponse = await aiModel.generateResponse(systemPrompt, message);
    
    console.log(`ChatLifeAtlas response: "${aiResponse.content.substring(0, 100)}${aiResponse.content.length > 100 ? '...' : ''}"`);

    // Return the response
    return new Response(
      JSON.stringify({ 
        response: aiResponse.content,
        usage: aiResponse.usage
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 200
      }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error in chatlifeatlas function:", err.message, err.stack);
    
    return new Response(
      JSON.stringify({ 
        error: err.message || "An error occurred while processing your request" 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
