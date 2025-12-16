#!/bin/bash

echo "🔍 Getting your Convex deployment URL..."
echo ""

export PATH="/tmp/node-v20.19.6-darwin-x64/bin:$PATH"

# Try to get the URL from Convex CLI
if command -v npx &> /dev/null; then
    echo "Checking for existing Convex deployment..."
    
    # Try to get deployment info
    DEPLOYMENT=$(npx convex deployments 2>&1)
    
    if [[ $DEPLOYMENT == *"http"* ]] || [[ $DEPLOYMENT == *"convex.cloud"* ]]; then
        echo "Found deployment info:"
        echo "$DEPLOYMENT"
    else
        echo "No deployment found. You need to authenticate first."
        echo ""
        echo "To get your Convex URL:"
        echo "1. Run: npx convex dev"
        echo "2. This will open a browser to authenticate"
        echo "3. After authentication, it will show your CONVEX_URL"
        echo "4. Copy that URL and set it as an environment variable:"
        echo "   export CONVEX_URL='your-url-here'"
        echo ""
        echo "Or check your Convex dashboard at: https://dashboard.convex.dev"
    fi
fi

