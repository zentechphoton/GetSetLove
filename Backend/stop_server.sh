#!/bin/bash
# Stop backend server on port 8080

echo "🔍 Finding process on port 8080..."

# Windows - Find PID using port
PID=$(netstat -ano | grep ":8080.*LISTENING" | awk '{print $5}' | head -1)

if [ ! -z "$PID" ]; then
    echo "Found process: $PID"
    echo "Stopping server..."
    taskkill //PID $PID //F 2>/dev/null || kill -9 $PID 2>/dev/null
    echo "✅ Server stopped!"
else
    echo "❌ No process found on port 8080"
    echo "Server is not running"
fi

