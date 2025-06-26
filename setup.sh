#!/bin/bash

# VigiLynx-Web Quick Setup Script
# This script sets up the project for local development

echo "🚀 Setting up VigiLynx-Web project..."

# Clean previous installations
echo "🧹 Cleaning previous installations..."
rm -rf node_modules package-lock.json .vite 2>/dev/null || true
rm -rf client/node_modules client/package-lock.json client/.vite 2>/dev/null || true  
rm -rf server/node_modules server/package-lock.json 2>/dev/null || true

# Install dependencies
echo "📦 Installing dependencies..."

echo "Installing client dependencies..."
cd client
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
    echo "❌ Client dependency installation failed"
    exit 1
fi

echo "Installing server dependencies..." 
cd ../server
npm install
if [ $? -ne 0 ]; then
    echo "❌ Server dependency installation failed"
    exit 1
fi

cd ..

# Test builds
echo "🔨 Testing builds..."

echo "Testing client build..."
cd client
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Client build failed"
    exit 1
fi

cd ..

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Start server: cd server && npm start"
echo "2. Start client: cd client && npm run dev"
echo "3. Open http://localhost:3000"
echo ""
echo "📖 See HOSTING_GUIDE.md for deployment instructions"
