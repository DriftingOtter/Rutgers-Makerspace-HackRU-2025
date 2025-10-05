#!/bin/bash

# Rutgers Makerspace Full Stack Startup Script
# This script starts both the API backend and React frontend

echo "🚀 Starting Rutgers Makerspace Full Stack Application..."
echo "======================================================="

# Check if we're in the right directory
if [ ! -f "api/package.json" ] || [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected to find: api/package.json and frontend/package.json"
    exit 1
fi

# Function to check if port is in use
check_port() {
    local port=$1
    if command -v lsof >/dev/null 2>&1; then
        if lsof -i :$port >/dev/null 2>&1; then
            return 0  # Port is in use
        fi
    elif command -v netstat >/dev/null 2>&1; then
        if netstat -tuln | grep -q ":$port "; then
            return 0  # Port is in use
        fi
    fi
    return 1  # Port is free
}

# Check if ports are available
echo "🔍 Checking port availability..."

if check_port 8080; then
    echo "⚠️  Warning: Port 8080 is already in use (API port)"
    echo "   The API might already be running or another service is using this port"
fi

if check_port 8085; then
    echo "⚠️  Warning: Port 8085 is already in use (Frontend port)"
    echo "   The frontend might already be running or another service is using this port"
fi

# Start API in background
echo ""
echo "🔧 Starting API backend..."
cd api

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "   Creating .env from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
    fi
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "   Installing API dependencies..."
    npm install
fi

# Start API in background
echo "   Starting API on port 8080..."
npm start &
API_PID=$!

# Wait a moment for API to start
sleep 3

# Go back to root and start frontend
cd ../frontend

echo ""
echo "🎨 Starting React frontend..."

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "   Creating .env from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
    fi
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "   Installing frontend dependencies..."
    npm install
fi

# Start frontend
echo "   Starting frontend on port 8085..."
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:8085"
echo "   API: http://localhost:8080"
echo "   API Docs: http://localhost:8080/api/config"
echo ""
echo "Press Ctrl+C to stop both services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $API_PID 2>/dev/null
    echo "   API stopped"
    echo "   Frontend stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start frontend (this will block)
PORT=8085 npm start

# If we get here, frontend stopped
cleanup