# 🎄 Secret Santa App - Deployment Guide

This app has been migrated to **Supabase** (database + auth) and is ready to deploy on **Netlify**.

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Netlify       │     │    Supabase      │     │     Resend      │
│   (Frontend)    │────▶│   (Database +    │     │    (Emails)     │
│                 │     │    Auth)         │     │                 │
│  - React App    │     │  - PostgreSQL    │     │  - Assignment   │
│  - Functions    │────▶│  - Google OAuth  │     │    notifications│
│    (Serverless) │     │  - Magic Links   │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

---

## Step 1: Set Up Supabase

### 1.1 Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Click **New Project**
3. Choose a name (e.g., "secret-santa")
4. Set a strong database password
5. Select a region close to your users

### 1.2 Run the Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase/schema.sql` from this project
3. Paste and click **Run**
4. This creates all tables with proper security (Row Level Security)

### 1.3 Enable Google OAuth
1. Go to **Authentication** → **Providers**
2. Enable **Google**
3. You'll need to create a Google OAuth app:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Go to **APIs & Services** → **Credentials**
   - Create **OAuth client ID** (Web application)
   - Add authorized redirect URI: `https://YOUR_SUPABASE_URL/auth/v1/callback`
   - Copy the Client ID and Client Secret to Supabase

### 1.4 Get Your API Keys
From **Settings** → **API**, copy:
- **Project URL** (e.g., `https://xxxxx.supabase.co`)
- **anon/public key** (for frontend)
- **service_role key** (for Netlify functions - keep secret!)

---

## Step 2: Set Up Resend (Email)

1. Go to [resend.com](https://resend.com) and sign up
2. Go to **API Keys** → Create a new key
3. Copy the API key (starts with `re_`)

> **Note**: Free tier allows 100 emails/day. For production, verify a domain.

---

## Step 3: Deploy to Netlify

### 3.1 Push to GitHub
```bash
git add .
git commit -m "Migrate to Supabase + Netlify"
git push origin main
```

### 3.2 Connect to Netlify
1. Go to [netlify.com](https://netlify.com) and log in
2. Click **Add new site** → **Import an existing project**
3. Connect your GitHub repo
4. Netlify will auto-detect the config from `netlify.toml`

### 3.3 Set Environment Variables
In Netlify dashboard → **Site settings** → **Environment variables**:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | Supabase anon key (safe for frontend) |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Same as above (for functions) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase service role key (SECRET) |
| `RESEND_API_KEY` | `re_xxx` | Your Resend API key |
| `SITE_URL` | `https://your-app.netlify.app` | Your Netlify site URL |
| `FROM_EMAIL` | `Secret Santa <noreply@resend.dev>` | Email sender (or your verified domain) |

### 3.4 Update Supabase Redirect URLs
In Supabase **Authentication** → **URL Configuration**:
- **Site URL**: `https://your-app.netlify.app`
- **Redirect URLs**: Add `https://your-app.netlify.app/*`

---

## Step 4: Test Everything

### 4.1 Test Authentication
1. Visit your Netlify URL
2. Try **Sign in with Google**
3. Try email magic link sign-in

### 4.2 Test Team Flow
1. Create a new team with budget (e.g., S$20 - S$50)
2. Copy the invite code (e.g., `ABC123`)
3. Open in incognito, join with the code
4. Add wishlist items
5. As owner, draw names
6. Check assignment reveal works

### 4.3 Test Email Notifications
1. After drawing names, check if emails are sent
2. Check Resend dashboard for delivery status

### 4.4 Test Invite Link Preview
Share a link like `https://your-app.netlify.app/join/ABC123` in:
- iMessage
- WhatsApp
- Slack

You should see a rich preview with team name and budget!

---

## Troubleshooting

### "VITE_SUPABASE_URL is not defined"
- Make sure environment variables are set in Netlify AND start with `VITE_` for frontend access
- Redeploy after adding env vars

### Google sign-in fails
- Check redirect URI in Google Cloud Console matches Supabase
- Ensure Google provider is enabled in Supabase

### Emails not sending
- Check Resend API key is correct
- Check Netlify function logs for errors
- Verify your domain in Resend for production

### "Row Level Security policy violation"
- Make sure user is authenticated before making requests
- Check RLS policies in Supabase SQL Editor

---

## File Structure (New)

```
├── client/
│   └── src/
│       ├── hooks/use-auth.ts      # Supabase auth hook
│       ├── lib/
│       │   ├── supabase.ts        # Supabase client
│       │   ├── database.ts        # Database operations
│       │   ├── types.ts           # TypeScript types
│       │   └── email.ts           # Email helper
│       └── pages/
│           ├── landing.tsx        # Google/email sign-in
│           ├── dashboard.tsx      # Teams with budget/currency
│           └── team.tsx           # Multiple wishlist items
├── netlify/
│   └── functions/
│       ├── send-email.ts          # Assignment email sender
│       └── invite-preview.ts      # OpenGraph previews
├── supabase/
│   └── schema.sql                 # Database schema
├── netlify.toml                   # Netlify config
├── .env.example                   # Environment template
└── package.json
```

---

## Features Summary

| Feature | Status |
|---------|--------|
| Google Sign-in | ✅ |
| Email Magic Link | ✅ |
| Team Budget (SGD/JPY/MYR) | ✅ |
| 6-character Invite Codes | ✅ |
| Exchange Date | ✅ |
| Multiple Wishlist Items (max 3) | ✅ |
| Invite Link Previews | ✅ |
| Assignment Email Notifications | ✅ |
| Responsive (Phone + Laptop) | ✅ |

---

## Need Help?

If you run into issues:
1. Check Netlify **Functions** tab for serverless function logs
2. Check Supabase **Logs** for database errors
3. Check browser console for frontend errors
