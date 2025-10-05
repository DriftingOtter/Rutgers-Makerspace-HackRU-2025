#!/bin/bash

# Rutgers Makerspace API Startup Script
# This script starts the Node.js API backend

echo "🚀 Starting Rutgers Makerspace API..."
echo "====================================="

# Check if we're in the right directory
if [ ! -f "api/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected to find: api/package.json"
    exit 1
fi

# Navigate to API directory
cd api

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Error: Failed to install dependencies"
        exit 1
    fi
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "   Creating .env from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "   Please update .env with your configuration"
    else
        echo "   .env.example not found - using default configuration"
    fi
fi

# Start the API server
echo "🌐 Starting API server on port 8080..."
echo "   API will be available at: http://localhost:8080"
echo "   API Documentation: http://localhost:8080/api/config"
echo "   Health Check: http://localhost:8080/api/health"
echo "   Press Ctrl+C to stop the server"
echo ""

npm start