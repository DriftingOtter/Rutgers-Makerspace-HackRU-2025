#!/bin/bash

# Rutgers Makerspace 3D Printing API - Quick Start Script

echo "🚀 Starting Rutgers Makerspace 3D Printing API..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your Gemini API key"
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Create logs directory if it doesn't exist
mkdir -p logs

echo "🌍 Environment: ${NODE_ENV:-development}"
echo "🔧 Debug Mode: ${DEBUG:-false}"
echo ""

# Start the application
echo "🚀 Starting API server..."
npm start