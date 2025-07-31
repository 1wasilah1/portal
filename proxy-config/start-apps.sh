#!/bin/bash

echo "🚀 Starting all applications..."
echo "================================"

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "✅ Port $1 is already in use"
        return 0
    else
        echo "❌ Port $1 is not in use"
        return 1
    fi
}

# Function to start app if not running
start_app() {
    local app_name=$1
    local port=$2
    local dir=$3
    local command=$4
    
    echo ""
    echo "📱 Starting $app_name on port $port..."
    
    if check_port $port; then
        echo "   $app_name is already running on port $port"
    else
        echo "   Starting $app_name..."
        cd "$dir" && $command > /dev/null 2>&1 &
        echo "   ✅ $app_name started in background"
    fi
}

# Start Login App (port 1225)
start_app "Login App" 1225 "../login" "npm start"

# Start FE App (port 9000)
start_app "FE App" 9000 "../fe" "npm run dev"

# Start Portal Data App (port 5500)
start_app "Portal Data App" 5500 "../portaldata-fe" "npm start"

# Wait a moment for apps to start
echo ""
echo "⏳ Waiting for applications to start..."
sleep 5

# Check status of all apps
echo ""
echo "📊 Application Status:"
echo "======================"

check_port 1225 && echo "✅ Login App (port 1225) - Running" || echo "❌ Login App (port 1225) - Not running"
check_port 9000 && echo "✅ FE App (port 9000) - Running" || echo "❌ FE App (port 9000) - Not running"
check_port 5500 && echo "✅ Portal Data App (port 5500) - Running" || echo "❌ Portal Data App (port 5500) - Not running"

echo ""
echo "🔗 Access URLs:"
echo "==============="
echo "📱 Login App: https://localhost:1500/login"
echo "🗺️  FE App: https://localhost:1500/fe"
echo "📊 Portal Data: https://localhost:1500/portal"
echo "❤️  Health Check: https://localhost:1500/health"
echo "📈 Status Check: https://localhost:1500/status"

echo ""
echo "💡 To stop all applications, run: ./stop-apps.sh" 