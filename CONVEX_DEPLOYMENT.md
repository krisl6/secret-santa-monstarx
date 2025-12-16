# Convex Deployment Guide

This app has been migrated from PostgreSQL/Drizzle to Convex. Follow these steps to deploy:

## Prerequisites

- Node.js installed (already done)
- Convex account (free tier available)

## Step 1: Authenticate with Convex

Run the following command and follow the prompts to log in or create a Convex account:

```bash
npx convex dev
```

This will:
- Authenticate you with Convex
- Create a new Convex project (or link to an existing one)
- Generate the `_generated` types
- Set up your `CONVEX_URL` environment variable

## Step 2: Set Environment Variables

After running `npx convex dev`, you'll get a `CONVEX_URL`. Add it to your environment:

```bash
export CONVEX_URL="https://your-project.convex.cloud"
```

Or create a `.env` file:
```
CONVEX_URL=https://your-project.convex.cloud
SESSION_SECRET=your-session-secret-here
```

## Step 3: Deploy Convex Functions

The Convex functions are already created in the `convex/` directory. When you run `npx convex dev`, they will be automatically deployed to your Convex project.

## Step 4: Run the App

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Production Deployment

For production:

1. Deploy Convex functions:
   ```bash
   npx convex deploy --prod
   ```

2. Set production environment variables:
   - `CONVEX_URL` - Your production Convex URL
   - `SESSION_SECRET` - A secure random string
   - `NODE_ENV=production`

3. Build and start:
   ```bash
   npm run build
   npm start
   ```

## What Changed

- **Database**: Migrated from PostgreSQL to Convex
- **Schema**: Converted from Drizzle ORM to Convex schema (`convex/schema.ts`)
- **Queries/Mutations**: All database operations now use Convex functions
- **Session Storage**: Custom Convex session store replaces PostgreSQL session store
- **No DATABASE_URL needed**: The app no longer requires a PostgreSQL connection string

## Troubleshooting

- If you see "CONVEX_URL not set" errors, make sure you've run `npx convex dev` and set the environment variable
- The `_generated` folder will be auto-generated when you run `npx convex dev` or `npx convex codegen`
- All Convex functions are in the `convex/` directory and will be automatically deployed

