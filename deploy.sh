#!/bin/bash

echo "🚀 Deploying World Operation to Firebase Hosting..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please login to Firebase first:"
    echo "   firebase login"
    echo "   Then run this script again."
    exit 1
fi

# Build the frontend
echo "📦 Building frontend..."
cd frontend
pnpm run build
cd ..

# Deploy to Firebase Hosting
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "✅ Deployment complete!"
echo "🌐 Your app is live at: https://world-operation.web.app"
echo ""
echo "🎯 Test your app:"
echo "   - Create epics, chapters, and scenes"
echo "   - Write content in the rich text editor"
echo "   - Test authentication and CRUD operations"
