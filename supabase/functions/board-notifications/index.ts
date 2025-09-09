import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'feedback_created' | 'feedback_updated' | 'feedback_voted' | 'feedback_commented';
  email: string;
  boardName: string;
  feedbackTitle: string;
  feedbackId: string;
  boardId: string;
  userDisplayName?: string;
  message?: string;
  boardUrl: string;
}

const getEmailTemplate = (data: NotificationRequest) => {
  const { type, boardName, feedbackTitle, userDisplayName, message, boardUrl } = data;
  
  let subject = '';
  let heading = '';
  let content = '';
  let emoji = '';
  
  switch (type) {
    case 'feedback_created':
      emoji = '💡';
      subject = `New feedback submitted in ${boardName}`;
      heading = 'New Feedback Submitted';
      content = `${userDisplayName || 'Someone'} has submitted new feedback: <strong>${feedbackTitle}</strong>`;
      break;
    case 'feedback_updated':
      emoji = '📝';
      subject = `Feedback updated in ${boardName}`;
      heading = 'Feedback Status Updated';
      content = `The feedback "<strong>${feedbackTitle}</strong>" has been updated${message ? `: ${message}` : ''}.`;
      break;
    case 'feedback_voted':
      emoji = '🗳️';
      subject = `New vote on "${feedbackTitle}"`;
      heading = 'New Vote Received';
      content = `${userDisplayName || 'Someone'} voted on the feedback: <strong>${feedbackTitle}</strong>`;
      break;
    case 'feedback_commented':
      emoji = '💬';
      subject = `New comment on "${feedbackTitle}"`;
      heading = 'New Comment Added';
      content = `${userDisplayName || 'Someone'} commented on: <strong>${feedbackTitle}</strong>${message ? `<br><br><em>"${message}"</em>` : ''}`;
      break;
  }

  return {
    subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
          .content { padding: 30px; }
          .feedback-info { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; }
          .cta-button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #718096; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${emoji} ${heading}</h1>
          </div>
          
          <div class="content">
            <p>${content}</p>
            
            <div class="feedback-info">
              <h3 style="margin: 0 0 10px; color: #2d3748;">📋 ${boardName}</h3>
              <p style="margin: 0; color: #4a5568;">${feedbackTitle}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${boardUrl}" class="cta-button">View Feedback →</a>
            </div>
          </div>
          
          <div class="footer">
            <p>You're receiving this because you're subscribed to notifications for ${boardName}</p>
            <p style="margin: 5px 0 0; font-size: 12px;">You can manage your notification preferences in your board settings.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: NotificationRequest = await req.json();
    const { subject, html } = getEmailTemplate(data);

    const emailResponse = await resend.emails.send({
      from: "ProductHub <noreply@productloom.io>",
      to: [data.email],
      subject,
      html,
    });

    console.log("Board notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
    
  } catch (error: any) {
    console.error("Error sending board notification email:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send notification email",
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      },
    );
  }
};

serve(handler);