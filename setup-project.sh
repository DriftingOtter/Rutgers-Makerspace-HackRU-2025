#!/bin/bash

# Rutgers Makerspace Project Setup Script
# This script automates the setup of Firebase and environment variables

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate email format
validate_email() {
    local email=$1
    if [[ $email =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Function to create .env file
create_env_file() {
    local env_path=$1
    local env_content=$2
    
    if [ -f "$env_path" ]; then
        print_warning "Environment file already exists at $env_path"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Skipping $env_path"
            return 0
        fi
    fi
    
    echo "$env_content" > "$env_path"
    print_success "Created $env_path"
}

# Main setup function
main() {
    echo "🚀 Rutgers Makerspace Project Setup"
    echo "=================================="
    echo ""
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "api" ]; then
        print_error "Please run this script from the project root directory"
        print_error "Expected to find: package.json, frontend/, api/"
        exit 1
    fi
    
    print_status "Project structure verified ✓"
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js (v18 or higher)"
        print_error "Download from: https://nodejs.org/"
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm"
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_warning "Node.js version $NODE_VERSION detected. Recommended: v18 or higher"
    fi
    
    print_success "Prerequisites check passed ✓"
    
    # Install dependencies
    print_status "Installing dependencies..."
    
    if [ -d "frontend/node_modules" ]; then
        print_status "Frontend dependencies already installed"
    else
        print_status "Installing frontend dependencies..."
        cd frontend && npm install && cd ..
    fi
    
    if [ -d "api/node_modules" ]; then
        print_status "API dependencies already installed"
    else
        print_status "Installing API dependencies..."
        cd api && npm install && cd ..
    fi
    
    print_success "Dependencies installed ✓"
    
    # Firebase setup
    echo ""
    print_status "Setting up Firebase configuration..."
    echo ""
    
    # Get Firebase project details
    echo "Please provide your Firebase project details:"
    echo ""
    
    # Firebase Project ID
    while true; do
        read -p "Firebase Project ID: " FIREBASE_PROJECT_ID
        if [ -n "$FIREBASE_PROJECT_ID" ]; then
            break
        else
            print_error "Project ID cannot be empty"
        fi
    done
    
    # Firebase API Key
    while true; do
        read -p "Firebase API Key: " FIREBASE_API_KEY
        if [ -n "$FIREBASE_API_KEY" ]; then
            break
        else
            print_error "API Key cannot be empty"
        fi
    done
    
    # Firebase Auth Domain
    FIREBASE_AUTH_DOMAIN="${FIREBASE_PROJECT_ID}.firebaseapp.com"
    print_status "Auth Domain: $FIREBASE_AUTH_DOMAIN"
    
    # Firebase Storage Bucket
    FIREBASE_STORAGE_BUCKET="${FIREBASE_PROJECT_ID}.appspot.com"
    print_status "Storage Bucket: $FIREBASE_STORAGE_BUCKET"
    
    # Firebase Messaging Sender ID
    while true; do
        read -p "Firebase Messaging Sender ID: " FIREBASE_MESSAGING_SENDER_ID
        if [ -n "$FIREBASE_MESSAGING_SENDER_ID" ]; then
            break
        else
            print_error "Messaging Sender ID cannot be empty"
        fi
    done
    
    # Firebase App ID
    while true; do
        read -p "Firebase App ID: " FIREBASE_APP_ID
        if [ -n "$FIREBASE_APP_ID" ]; then
            break
        else
            print_error "App ID cannot be empty"
        fi
    done
    
    # Gemini API Key
    echo ""
    print_status "Setting up Google Gemini API..."
    while true; do
        read -p "Google Gemini API Key (optional, press Enter to skip): " GEMINI_API_KEY
        if [ -z "$GEMINI_API_KEY" ]; then
            GEMINI_API_KEY="your_gemini_api_key_here"
            print_warning "Gemini API key not provided. You can add it later in api/.env"
            break
        else
            break
        fi
    done
    
    # Create frontend .env file
    print_status "Creating frontend environment file..."
    FRONTEND_ENV_CONTENT="# Firebase Configuration
# Generated by setup script on $(date)
REACT_APP_FIREBASE_API_KEY=$FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID=$FIREBASE_APP_ID

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8080"
    
    create_env_file "frontend/.env" "$FRONTEND_ENV_CONTENT"
    
    # Create API .env file
    print_status "Creating API environment file..."
    API_ENV_CONTENT="# Rutgers Makerspace 3D Printing API Configuration
# Generated by setup script on $(date)

# Server Configuration
PORT=8080
NODE_ENV=development
DEBUG=true

# Google Gemini API Configuration
GEMINI_API_KEY=$GEMINI_API_KEY
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent

# Rutgers Makerspace Configuration
MAKERSPACE_NAME=Rutgers Makerspace
MAKERSPACE_LOCATION=Engineering Building, Rutgers University

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Snowflake Configuration (Optional - Add your credentials if needed)
# SF_ACCOUNT=your_account_identifier
# SF_USER=your_username
# SF_PASSWORD=your_password
# SF_WAREHOUSE=COMPUTE_WH
# SF_DATABASE=makerspace_dev
# SF_SCHEMA=api
# SF_ROLE=ACCOUNTADMIN"
    
    create_env_file "api/.env" "$API_ENV_CONTENT"
    
    print_success "Environment files created ✓"
    
    # Firebase Console setup instructions
    echo ""
    print_status "Firebase Console Setup Required:"
    echo "====================================="
    echo ""
    echo "1. Go to: https://console.firebase.google.com/project/$FIREBASE_PROJECT_ID"
    echo "2. Click 'Authentication' in the left sidebar"
    echo "3. Click 'Get started'"
    echo "4. Go to 'Sign-in method' tab"
    echo "5. Enable these providers:"
    echo "   ✅ Email/Password - Click and toggle 'Enable'"
    echo "   ✅ Google - Click and toggle 'Enable' (optional but recommended)"
    echo "6. For Google sign-in, add authorized domains:"
    echo "   - Add 'localhost' for development"
    echo "   - Add your production domain when ready"
    echo ""
    
    # Test the setup
    echo ""
    read -p "Do you want to test the setup now? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Testing the setup..."
        echo ""
        echo "Starting the application..."
        echo "Frontend will be available at: http://localhost:8085"
        echo "API will be available at: http://localhost:8080"
        echo ""
        echo "Press Ctrl+C to stop the servers"
        echo ""
        
        # Start the application
        ./start-all.sh
    else
        print_status "Setup complete! You can start the application later with:"
        echo ""
        echo "  ./start-all.sh          # Start both frontend and API"
        echo "  ./start-frontend.sh     # Start frontend only"
        echo "  ./start-api.sh          # Start API only"
        echo ""
    fi
    
    print_success "🎉 Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Complete Firebase Console setup (see instructions above)"
    echo "2. Run './start-all.sh' to start the application"
    echo "3. Open http://localhost:8085 in your browser"
    echo "4. Test the authentication by creating an account"
    echo ""
    echo "For help, check the README.md files in frontend/ and api/ directories"
}

# Run the main function
main "$@"