#!/bin/bash

# Rutgers Makerspace Authentication Test Script
# Run this AFTER enabling Authentication in Firebase Console

echo "🚀 Rutgers Makerspace Authentication Test"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "frontend/.env" ]; then
    echo "❌ Error: frontend/.env file not found"
    echo "   Please run this script from the project root directory"
    exit 1
fi

echo "🔍 Pre-flight Checks:"
echo "===================="

# Check Firebase configuration
if grep -q "AIzaSyA4TisqHRc_XP5qKbAI3Xgc3tqmOitQnKo" frontend/.env; then
    echo "✅ Firebase configuration is set"
else
    echo "❌ Firebase configuration not found"
    echo "   Please update frontend/.env with your Firebase credentials"
    exit 1
fi

# Check if dependencies are installed
cd frontend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Error: Failed to install dependencies"
        exit 1
    fi
else
    echo "✅ Dependencies are installed"
fi

echo ""
echo "🔥 Firebase Console Setup Reminder:"
echo "=================================="
echo "Before testing, make sure you've enabled Authentication in Firebase Console:"
echo ""
echo "1. Go to: https://console.firebase.google.com/project/hackathon2025-7fb72"
echo "2. Click 'Authentication' → 'Get started'"
echo "3. Go to 'Sign-in method' tab"
echo "4. Enable 'Email/Password'"
echo "5. Enable 'Google' (optional but recommended)"
echo "6. Add 'localhost' to authorized domains for Google sign-in"
echo ""

read -p "Have you enabled Authentication in Firebase Console? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⚠️  Please enable Authentication in Firebase Console first, then run this script again"
    echo "   Go to: https://console.firebase.google.com/project/hackathon2025-7fb72"
    exit 1
fi

echo ""
echo "🎯 Starting Authentication Test..."
echo "================================="
echo ""

# Start the frontend
echo "🌐 Starting frontend on port 8085..."
echo "   URL: http://localhost:8085"
echo ""

echo "📋 Test Checklist:"
echo "=================="
echo "1. ✅ Open http://localhost:8085 in your browser"
echo "2. ✅ Click 'Login' in the navbar"
echo "3. ✅ Test Sign Up:"
echo "   - Click 'Sign Up' toggle"
echo "   - Enter name, email, password"
echo "   - Click 'Create Account'"
echo "   - Check for success message"
echo "4. ✅ Test Sign In:"
echo "   - Enter email and password"
echo "   - Click 'Sign In'"
echo "   - Should redirect to User Dashboard"
echo "5. ✅ Test User Dashboard:"
echo "   - Check dashboard shows your stats"
echo "   - Test 'Community' tab for public requests"
echo "   - Test 'History' tab for your print requests"
echo "   - Test 'Create New Print Request' button"
echo "6. ✅ Test Navigation:"
echo "   - Check navbar shows 'Dashboard' link"
echo "   - Test navigation between pages"
echo "7. ✅ Test User Info:"
echo "   - Check navbar shows your name/email"
echo "8. ✅ Test Logout:"
echo "   - Click 'Logout' button"
echo "   - Should redirect to home page"
echo "9. ✅ Test Google Sign-In (if enabled):"
echo "   - Click 'Continue with Google'"
echo "   - Complete Google authentication"
echo ""

echo "🚨 If you see errors:"
echo "   - Check browser console (F12) for error messages"
echo "   - Verify Authentication is enabled in Firebase Console"
echo "   - Make sure authorized domains include 'localhost'"
echo "   - Check that your Firebase project is active"
echo ""

echo "🎉 Starting development server..."
echo "   Press Ctrl+C to stop the server"
echo ""

# Start the development server
PORT=8085 npm start