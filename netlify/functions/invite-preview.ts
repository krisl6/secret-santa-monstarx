import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for server-side
);

// This function provides OpenGraph metadata for invite links
// When shared on iMessage, WhatsApp, etc., these previews will show
const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    // Extract invite code from path
    const pathParts = event.path.split('/');
    const inviteCode = pathParts[pathParts.length - 1]?.toUpperCase();

    if (!inviteCode || inviteCode.length !== 6) {
        return {
            statusCode: 404,
            body: "Team not found",
        };
    }

    try {
        // Fetch team by invite code
        const { data: team, error } = await supabase
            .from('teams')
            .select('name, budget_min, budget_max, currency, exchange_date')
            .eq('invite_code', inviteCode)
            .single();

        if (error || !team) {
            return {
                statusCode: 404,
                body: "Team not found",
            };
        }

        const currencySymbol = { SGD: 'S$', JPY: '¥', MYR: 'RM' }[team.currency] || '$';
        const budget = `${currencySymbol}${team.budget_min} - ${currencySymbol}${team.budget_max}`;
        const siteUrl = process.env.SITE_URL || 'https://your-app.netlify.app';
        const ogImage = `${siteUrl}/og-image.png`;

        // Return HTML with OpenGraph meta tags
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Join ${team.name}'s Secret Santa!</title>
  
  <!-- OpenGraph Meta Tags -->
  <meta property="og:title" content="🎄 Join ${team.name}'s Secret Santa!" />
  <meta property="og:description" content="You've been invited to a Secret Santa gift exchange! Budget: ${budget}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${siteUrl}/join/${inviteCode}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="🎄 Join ${team.name}'s Secret Santa!" />
  <meta name="twitter:description" content="You've been invited to a Secret Santa gift exchange! Budget: ${budget}" />
  <meta name="twitter:image" content="${ogImage}" />
  
  <!-- Redirect to app -->
  <meta http-equiv="refresh" content="0;url=${siteUrl}/?join=${inviteCode}" />
  
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #D93849 0%, #4CA977 100%);
      color: white;
      text-align: center;
      padding: 20px;
    }
    .container {
      max-width: 400px;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    p {
      font-size: 1.1rem;
      opacity: 0.9;
    }
    a {
      color: white;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎄 Redirecting...</h1>
    <p>Taking you to ${team.name}'s Secret Santa</p>
    <p><a href="${siteUrl}/?join=${inviteCode}">Click here if not redirected</a></p>
  </div>
</body>
</html>
    `;

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Cache-Control": "public, max-age=3600", // Cache for 1 hour
            },
            body: html,
        };
    } catch (error: any) {
        console.error("Preview error:", error);
        return {
            statusCode: 500,
            body: "Error loading team preview",
        };
    }
};

export { handler };
