import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailRequest {
    to: string;
    receiverName: string;
    teamName: string;
    budget: string;
    assignerName?: string;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    // Only allow POST
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method not allowed" }),
        };
    }

    // Check for API key
    if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY not configured");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Email service not configured" }),
        };
    }

    try {
        const body: SendEmailRequest = JSON.parse(event.body || "{}");
        const { to, receiverName, teamName, budget, assignerName } = body;

        if (!to || !receiverName || !teamName) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing required fields" }),
            };
        }

        const fromEmail = process.env.FROM_EMAIL || "Secret Santa <noreply@resend.dev>";

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: [to],
            subject: `🎄 Your Secret Santa assignment for ${teamName}!`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #D93849 0%, #b82d3a 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 32px; font-family: serif;">🎁 Secret Santa</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Ho ho ho! Names have been drawn!</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Great news! The Secret Santa names have been drawn for <strong>${teamName}</strong>.
              </p>
              
              <div style="background: linear-gradient(135deg, #4CA977 0%, #3d8a60 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="color: rgba(255,255,255,0.9); margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">You are gifting to:</p>
                <h2 style="color: white; margin: 0; font-size: 36px; font-family: serif;">${receiverName}</h2>
                ${budget ? `<p style="color: rgba(255,255,255,0.8); margin: 15px 0 0 0; font-size: 14px;">Budget: ${budget}</p>` : ''}
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                Log in to the Secret Santa app to see their wishlist and find the perfect gift!
              </p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.SITE_URL || 'https://your-app.netlify.app'}" 
                   style="display: inline-block; background: #D93849; color: white; padding: 14px 30px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  View Your Assignment 🎄
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Happy gifting! 🎁
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
        });

        if (error) {
            console.error("Resend error:", error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Failed to send email" }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, messageId: data?.id }),
        };
    } catch (error: any) {
        console.error("Send email error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};

export { handler };
