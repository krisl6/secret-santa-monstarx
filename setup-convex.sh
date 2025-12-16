#!/bin/bash

echo "🚀 Setting up Convex for Wish-Santa..."
echo ""
echo "This will:"
echo "1. Authenticate you with Convex (opens browser)"
echo "2. Create/link a Convex project"
echo "3. Deploy your functions"
echo "4. Set your CONVEX_URL"
echo ""
read -p "Press Enter to continue..."

export PATH="/tmp/node-v20.19.6-darwin-x64/bin:$PATH"

# Run convex dev which will handle authentication and deployment
npx convex dev

echo ""
echo "✅ Convex setup complete!"
echo "Your CONVEX_URL has been saved. You can now run: npm run dev"

