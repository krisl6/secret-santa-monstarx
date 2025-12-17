#!/bin/bash
set -e

echo "🚀 Secret Santa Deployment Script"
echo "=================================="
echo ""

# Check if built
if [ ! -d "dist/public" ]; then
    echo "📦 Building application..."
    npm run build
    echo "✅ Build complete!"
    echo ""
fi

# Check Netlify CLI
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Install it with: npm install -g netlify-cli"
    exit 1
fi

echo "📋 Deployment Options:"
echo "1. Deploy via Netlify Dashboard (recommended)"
echo "2. Deploy via Netlify CLI"
echo ""
read -p "Choose option (1 or 2): " option

if [ "$option" = "1" ]; then
    echo ""
    echo "✅ Build complete! Next steps:"
    echo ""
    echo "1. Push to GitHub:"
    echo "   git add ."
    echo "   git commit -m 'Ready for deployment'"
    echo "   git push origin main"
    echo ""
    echo "2. Go to https://app.netlify.com"
    echo "   - Add new site → Import from GitHub"
    echo "   - Select: krisl6/secret-santa-monstarx"
    echo "   - Set environment variables (see DEPLOY_NOW.md)"
    echo ""
elif [ "$option" = "2" ]; then
    echo ""
    echo "🔗 Linking to Netlify..."
    netlify link || echo "⚠️  Link failed or cancelled"
    echo ""
    echo "🚀 Deploying to production..."
    netlify deploy --prod --dir=dist/public
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "⚠️  Don't forget to set environment variables:"
    echo "   netlify env:set VITE_SUPABASE_URL 'your-url'"
    echo "   netlify env:set VITE_SUPABASE_ANON_KEY 'your-key'"
    echo "   # ... see DEPLOY_NOW.md for full list"
else
    echo "❌ Invalid option"
    exit 1
fi
