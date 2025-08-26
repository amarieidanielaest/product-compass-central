import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CustomerInvitationRequest {
  email: string;
  boardName: string;
  inviterName: string;
  invitationUrl: string;
  role: string;
  organizationName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log(`${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      boardName, 
      inviterName, 
      invitationUrl, 
      role,
      organizationName 
    }: CustomerInvitationRequest = await req.json();

    console.log("Sending customer invitation email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Loom Product <onboarding@resend.dev>",
      to: [email],
      subject: `You're invited to join ${boardName}${organizationName ? ` - ${organizationName}` : ''}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Customer Board Invitation</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
            .logo { width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; }
            .content { padding: 30px 0; }
            .invitation-card { background: #f8f9fa; border-radius: 8px; padding: 24px; margin: 20px 0; border-left: 4px solid #667eea; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
            .button:hover { opacity: 0.9; }
            .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #666; font-size: 14px; }
            .role-badge { background: #e3f2fd; color: #1976d2; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">L</div>
              <h1 style="margin: 0; color: #333;">Customer Board Invitation</h1>
            </div>
            
            <div class="content">
              <p>Hi there,</p>
              
              <p><strong>${inviterName}</strong> has invited you to join the customer board for <strong>${boardName}</strong>${organizationName ? ` at ${organizationName}` : ''}.</p>
              
              <div class="invitation-card">
                <h3 style="margin-top: 0; color: #667eea;">🎉 You're invited!</h3>
                <p><strong>Board:</strong> ${boardName}</p>
                ${organizationName ? `<p><strong>Organization:</strong> ${organizationName}</p>` : ''}
                <p><strong>Your Role:</strong> <span class="role-badge">${role.charAt(0).toUpperCase() + role.slice(1)}</span></p>
              </div>
              
              <p>As a ${role}, you'll be able to:</p>
              <ul>
                <li>Submit and view feedback</li>
                <li>Track feature requests and updates</li>
                <li>Access the product roadmap</li>
                <li>Browse the knowledge center</li>
                ${role === 'admin' || role === 'moderator' ? '<li>Moderate discussions and feedback</li>' : ''}
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${invitationUrl}" class="button">Accept Invitation</a>
              </div>
              
              <p style="font-size: 14px; color: #666;">
                This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
              </p>
              
              <p style="font-size: 14px; color: #666;">
                Having trouble with the button? Copy and paste this link into your browser:<br>
                <a href="${invitationUrl}">${invitationUrl}</a>
              </p>
            </div>
            
            <div class="footer">
              <p>This email was sent by Loom Product Management Platform</p>
              <p>© 2024 Loom. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Customer invitation email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResponse.data?.id 
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending customer invitation email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);