#!/bin/bash

echo "🛑 Stopping all applications..."
echo "================================"

# Function to kill process on port
kill_port() {
    local port=$1
    local app_name=$2
    
    echo "🛑 Stopping $app_name on port $port..."
    
    # Find and kill process on port
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "   Found process $pid on port $port"
        kill -9 $pid
        echo "   ✅ $app_name stopped"
    else
        echo "   ❌ No process found on port $port"
    fi
}

# Stop all applications
kill_port 1225 "Login App"
kill_port 9000 "FE App"
kill_port 5500 "Portal Data App"
kill_port 1500 "Proxy Service"

# Kill any remaining node processes (be careful with this)
echo ""
echo "🧹 Cleaning up remaining Node.js processes..."
pkill -f "node server.js" 2>/dev/null || echo "   No proxy service found"
pkill -f "react-scripts" 2>/dev/null || echo "   No React apps found"
pkill -f "vite" 2>/dev/null || echo "   No Vite apps found"

echo ""
echo "✅ All applications stopped!"
echo ""
echo "📊 Final Status:"
echo "================"

# Check if any processes are still running
if lsof -Pi :1225 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "❌ Login App (port 1225) - Still running"
else
    echo "✅ Login App (port 1225) - Stopped"
fi

if lsof -Pi :9000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "❌ FE App (port 9000) - Still running"
else
    echo "✅ FE App (port 9000) - Stopped"
fi

if lsof -Pi :5500 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "❌ Portal Data App (port 5500) - Still running"
else
    echo "✅ Portal Data App (port 5500) - Stopped"
fi

if lsof -Pi :1500 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "❌ Proxy Service (port 1500) - Still running"
else
    echo "✅ Proxy Service (port 1500) - Stopped"
fi 