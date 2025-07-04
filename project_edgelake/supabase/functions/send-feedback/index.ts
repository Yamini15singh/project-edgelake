
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface FeedbackRequest {
  feedback: string;
  userId: string;
  email?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Received request to send-feedback function");
  
  // Handle CORS preflight requests immediately
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request with CORS headers");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  // Add CORS headers to all responses
  const headers = { ...corsHeaders, "Content-Type": "application/json" };

  try {
    console.log("Processing feedback request");
    
    // Check if we have the required environment variables
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration is missing" }),
        { headers, status: 500 }
      );
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not found in environment variables");
      return new Response(
        JSON.stringify({ error: "Email service configuration is missing" }),
        { headers, status: 500 }
      );
    }

    // Parse the request body
    const requestData = await req.json();
    const { feedback, userId, email }: FeedbackRequest = requestData;
    
    console.log("Processing feedback request:", JSON.stringify({ 
      userId, 
      email: email ? "provided" : "not provided",
      feedbackLength: feedback?.length
    }));

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user's profile information
    const { data: profile, error: profileError } = await supabase
      .from("decrypted_profiles")
      .select("first_name, last_name")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    }

    const userName = profile ? `${profile.first_name} ${profile.last_name}` : "A user";
    console.log("User info retrieved:", { userName });

    // Send email using Resend
    console.log("Sending email to Resend API");
    
    // Prepare the email content
    const emailContent = {
      from: "User Feedback <onboarding@resend.dev>",
      to: ["eme@liecha.se"],
      subject: "New User Feedback",
      html: `
        <h2>New User Feedback</h2>
        <p><strong>From:</strong> ${userName}</p>
        ${email ? `<p><strong>Email:</strong> ${email}</p>` : ''}
        <p><strong>Feedback:</strong> ${feedback}</p>
      `,
    };
    
    console.log("Email content prepared");
    
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify(emailContent),
      });

      const responseText = await res.text();
      console.log(`Resend API response status: ${res.status}, body: ${responseText}`);

      if (!res.ok) {
        console.error(`Resend API error: ${res.status} ${res.statusText}`, responseText);
        throw new Error(`Failed to send email: ${res.status} ${res.statusText}`);
      }

      let resData;
      try {
        resData = JSON.parse(responseText);
      } catch (e) {
        console.log("Could not parse response as JSON:", responseText);
        resData = { raw: responseText };
      }

      console.log("Email sent successfully:", resData);

      return new Response(JSON.stringify({ success: true, data: resData }), {
        headers,
        status: 200,
      });
    } catch (emailError: any) {
      console.error("Email sending error:", emailError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send email notification",
          details: emailError.message
        }),
        { headers, status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in send-feedback function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred",
        stack: error.stack
      }),
      { headers, status: 500 }
    );
  }
};

serve(handler);
