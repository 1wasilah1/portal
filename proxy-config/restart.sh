#!/bin/bash

echo "🔄 Restarting Proxy Service and Applications..."
echo "=============================================="

# Stop all processes first
echo "🛑 Stopping all processes..."
./stop-apps.sh

# Wait a moment
sleep 2

# Start all applications
echo ""
echo "🚀 Starting all applications..."
./start-apps.sh

echo ""
echo "✅ Restart completed!"
echo ""
echo "🔗 Access URLs:"
echo "==============="
echo "📱 Login App: https://localhost:1500/login"
echo "🗺️  FE App: https://localhost:1500/fe"
echo "📊 Portal Data: https://localhost:1500/portal"
echo "❤️  Health Check: https://localhost:1500/health"
echo "📈 Status Check: https://localhost:1500/status" 