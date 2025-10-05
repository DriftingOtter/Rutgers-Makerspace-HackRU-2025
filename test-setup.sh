#!/bin/bash

# Rutgers Makerspace Setup Test Script
# This script tests if the project is properly configured

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🧪 Testing Rutgers Makerspace Project Setup"
echo "==========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "api" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_success "Project structure verified ✓"

# Check Node.js and npm
print_status "Checking Node.js and npm..."
if ! command -v node >/dev/null 2>&1; then
    print_error "Node.js is not installed"
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    print_error "npm is not installed"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_warning "Node.js version $NODE_VERSION detected. Recommended: v18 or higher"
else
    print_success "Node.js version $NODE_VERSION ✓"
fi

# Check dependencies
print_status "Checking dependencies..."

if [ ! -d "frontend/node_modules" ]; then
    print_error "Frontend dependencies not installed. Run: cd frontend && npm install"
    exit 1
fi

if [ ! -d "api/node_modules" ]; then
    print_error "API dependencies not installed. Run: cd api && npm install"
    exit 1
fi

print_success "Dependencies installed ✓"

# Check environment files
print_status "Checking environment files..."

if [ ! -f "frontend/.env" ]; then
    print_error "Frontend .env file not found. Run ./setup-project.sh first"
    exit 1
fi

if [ ! -f "api/.env" ]; then
    print_error "API .env file not found. Run ./setup-project.sh first"
    exit 1
fi

print_success "Environment files found ✓"

# Check Firebase configuration
print_status "Checking Firebase configuration..."

if grep -q "your_api_key_here" frontend/.env; then
    print_warning "Firebase configuration appears to be using placeholder values"
    print_warning "Make sure to update frontend/.env with your actual Firebase credentials"
else
    print_success "Firebase configuration appears to be set ✓"
fi

# Check API configuration
print_status "Checking API configuration..."

if grep -q "your_gemini_api_key_here" api/.env; then
    print_warning "Gemini API key appears to be using placeholder value"
    print_warning "Update api/.env with your actual Gemini API key for full functionality"
else
    print_success "API configuration appears to be set ✓"
fi

# Test if ports are available
print_status "Checking port availability..."

if lsof -i :8080 >/dev/null 2>&1; then
    print_warning "Port 8080 is already in use (API port)"
else
    print_success "Port 8080 is available ✓"
fi

if lsof -i :8085 >/dev/null 2>&1; then
    print_warning "Port 8085 is already in use (Frontend port)"
else
    print_success "Port 8085 is available ✓"
fi

# Test script permissions
print_status "Checking script permissions..."

if [ ! -x "start-all.sh" ]; then
    print_warning "start-all.sh is not executable. Fixing..."
    chmod +x start-all.sh
fi

if [ ! -x "start-frontend.sh" ]; then
    print_warning "start-frontend.sh is not executable. Fixing..."
    chmod +x start-frontend.sh
fi

if [ ! -x "start-api.sh" ]; then
    print_warning "start-api.sh is not executable. Fixing..."
    chmod +x start-api.sh
fi

print_success "Script permissions verified ✓"

echo ""
print_success "🎉 Setup test completed!"
echo ""
echo "Next steps:"
echo "1. If you see warnings above, address them as needed"
echo "2. Run './start-all.sh' to start the application"
echo "3. Open http://localhost:8085 in your browser"
echo "4. Test the authentication by creating an account"
echo ""
echo "For detailed setup instructions, see SETUP_INSTRUCTIONS.md"