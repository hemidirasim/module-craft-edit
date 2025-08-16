#!/bin/bash

# Start Auto-Push and Development Server for module-craft-edit
echo "🚀 Starting module-craft-edit with auto-push functionality..."

# Function to cleanup background processes
cleanup() {
    echo "🛑 Stopping all processes..."
    kill $DEV_PID $AUTO_PUSH_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start development server in background
echo "🌐 Starting development server..."
npm run dev &
DEV_PID=$!

# Wait a moment for dev server to start
sleep 3

# Start auto-push in background
echo "📤 Starting auto-push script..."
npm run auto-push &
AUTO_PUSH_PID=$!

echo "✅ Both services are running!"
echo "🌐 Development server: http://localhost:5173"
echo "📤 Auto-push: Active (checking every 3 seconds)"
echo ""
echo "💡 Press Ctrl+C to stop both services"

# Wait for background processes
wait
