#!/bin/bash

echo "🚀 Setting up Proxy Service for Frontend Applications"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created successfully!"
else
    echo "✅ .env file already exists"
fi

# Create SSL directory
if [ ! -d ssl ]; then
    echo "📁 Creating SSL directory..."
    mkdir -p ssl
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file if needed"
echo "2. Start the proxy service: npm start"
echo "3. Or run in development mode: npm run dev"
echo ""
echo "🔗 Access URLs:"
echo "   - Login App: http://localhost:1500/login"
echo "   - FE App: http://localhost:1500/fe"
echo "   - Portal Data: http://localhost:1500/portal"
echo "   - Health Check: http://localhost:1500/health"
echo ""
echo "🔐 For HTTPS support:"
echo "   - Run: npm run generate-ssl"
echo "   - Set USE_SSL=true in .env file"
echo "   - Restart the service" 