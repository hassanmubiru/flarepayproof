#!/bin/bash

# FlarePayProof - Development Test Script
# This script verifies the development environment is working correctly

echo "🚀 FlarePayProof - Development Environment Test"
echo "=================================================="
echo ""

# Check Node version
echo "✓ Checking Node.js version..."
node --version
if [ $? -ne 0 ]; then
  echo "❌ Node.js not found. Please install Node.js 16+"
  exit 1
fi
echo ""

# Check npm version
echo "✓ Checking npm version..."
npm --version
if [ $? -ne 0 ]; then
  echo "❌ npm not found. Please install npm"
  exit 1
fi
echo ""

# Check if dependencies are installed
echo "✓ Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo "⚠️  Dependencies not installed. Running npm install..."
  npm install --legacy-peer-deps
  if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
  fi
else
  echo "✓ Dependencies already installed"
fi
echo ""

# Check if .env exists
echo "✓ Checking environment configuration..."
if [ ! -f ".env" ]; then
  echo "⚠️  .env file not found. Creating from .env.example..."
  cp .env.example .env
  echo "✓ Created .env file. Please add your API keys for full functionality."
else
  echo "✓ .env file exists"
fi
echo ""

# Run build test
echo "✓ Testing production build..."
npm run build > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "❌ Build failed. Running with output..."
  npm run build
  exit 1
else
  echo "✓ Production build successful"
fi
echo ""

# Check build size
if [ -d "build" ]; then
  BUILD_SIZE=$(du -sh build | cut -f1)
  echo "✓ Build size: $BUILD_SIZE"
fi
echo ""

# Final summary
echo "=================================================="
echo "✅ All tests passed!"
echo ""
echo "Next steps:"
echo "  1. Review .env and add your API keys (optional for testing)"
echo "  2. Run 'npm start' to start development server"
echo "  3. Open http://localhost:3000 in your browser"
echo "  4. Connect MetaMask to Flare mainnet"
echo "  5. Start creating payments!"
echo ""
echo "For deployment:"
echo "  - Vercel: vercel --prod"
echo "  - Netlify: netlify deploy --prod --dir=build"
echo ""
echo "Documentation:"
echo "  - Quick Start: QUICKSTART.md"
echo "  - Full Docs: README.md"
echo "  - Deployment: DEPLOYMENT.md"
echo ""
echo "Happy building! 🎉"
