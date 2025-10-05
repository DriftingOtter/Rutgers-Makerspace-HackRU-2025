#!/bin/bash

# Rutgers Makerspace Frontend Startup Script
# This script starts the React frontend on port 8085

echo "🚀 Starting Rutgers Makerspace Frontend..."
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected to find: frontend/package.json"
    exit 1
fi

# Navigate to frontend directory
cd frontend

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
        echo "   Please update .env with your Firebase configuration"
    else
        echo "   Creating basic .env file..."
        cat > .env << EOF
# Firebase Configuration
# Replace with your actual Firebase project configuration
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your_app_id

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8080
EOF
        echo "   Created .env file - please update with your Firebase configuration"
    fi
fi

# Check if Firebase config is properly set
if grep -q "your_api_key_here" .env; then
    echo "⚠️  Warning: Firebase configuration not set in .env file"
    echo "   Please update .env with your actual Firebase project configuration"
    echo "   See FIREBASE_SETUP.md for detailed instructions"
fi

# Start the development server on port 8085
echo "🌐 Starting development server on port 8085..."
echo "   Frontend will be available at: http://localhost:8085"
echo "   Press Ctrl+C to stop the server"
echo ""

PORT=8085 npm start