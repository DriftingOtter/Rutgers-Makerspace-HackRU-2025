#!/bin/bash

# Rutgers Makerspace HackRU 2025 - Demo Setup Script
# This script prepares the database and starts both API and frontend for demo

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print functions
print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}  Rutgers Makerspace Setup${NC}"
    echo -e "${PURPLE}  HackRU 2025 Demo Ready${NC}"
    echo -e "${PURPLE}================================${NC}"
    echo
}

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Safety check - ensure we're in the right directory
check_directory() {
    if [ ! -f "package.json" ] && [ ! -d "frontend" ] && [ ! -d "api" ]; then
        print_error "This script must be run from the project root directory"
        print_info "Make sure you're in the Rutgers-Makerspace-HackRU-2025 directory"
        exit 1
    fi
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check system requirements
check_requirements() {
    print_step "Checking system requirements..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "System requirements met"
}

# Install dependencies
install_dependencies() {
    print_step "Installing dependencies..."
    
    # Install API dependencies
    print_info "Installing API dependencies..."
    cd api
    if [ ! -d "node_modules" ]; then
        npm install --silent
    else
        print_info "API dependencies already installed"
    fi
    cd ..
    
    # Install Frontend dependencies
    print_info "Installing Frontend dependencies..."
    cd frontend
    if [ ! -d "node_modules" ]; then
        npm install --silent
    else
        print_info "Frontend dependencies already installed"
    fi
    cd ..
    
    print_success "All dependencies installed"
}

# Check environment files
check_environment() {
    print_step "Checking environment configuration..."
    
    # Check API .env
    if [ ! -f "api/.env" ]; then
        print_error "API .env file not found. Please create it with your Snowflake credentials."
        print_info "Required variables: SF_ACCOUNT, SF_USER, SF_PASSWORD, SF_WAREHOUSE, SF_DATABASE, SF_SCHEMA, SF_ROLE"
        exit 1
    fi
    
    # Check Frontend .env
    if [ ! -f "frontend/.env" ]; then
        print_error "Frontend .env file not found. Please create it with your Firebase credentials."
        print_info "Required variables: REACT_APP_FIREBASE_API_KEY, REACT_APP_FIREBASE_AUTH_DOMAIN, etc."
        exit 1
    fi
    
    print_success "Environment files found"
}

# Test database connection
test_database() {
    print_step "Testing Snowflake database connection..."
    
    cd api
    if node -e "
        require('dotenv').config();
        const snowflakeClient = require('./src/database/snowflakeClient');
        snowflakeClient.connect().then(() => {
            console.log('Database connection successful');
            process.exit(0);
        }).catch(err => {
            console.log('Database connection failed:', err.message);
            process.exit(1);
        });
    " 2>/dev/null; then
        print_success "Database connection working"
    else
        print_warning "Database connection failed - will use mock data"
    fi
    cd ..
}

# Find available port
find_available_port() {
    local start_port=$1
    local port=$start_port
    local max_attempts=10
    local attempts=0
    
    # Check if lsof is available, if not use netstat
    local port_check_cmd="lsof -i :$port"
    if ! command -v lsof >/dev/null 2>&1; then
        if command -v netstat >/dev/null 2>&1; then
            port_check_cmd="netstat -tlnp | grep :$port"
        else
            # If neither lsof nor netstat is available, just try the port
            echo $port
            return 0
        fi
    fi
    
    while [ $attempts -lt $max_attempts ]; do
        if ! eval "$port_check_cmd" >/dev/null 2>&1; then
            echo $port
            return 0
        fi
        port=$((port + 1))
        attempts=$((attempts + 1))
    done
    
    return 1
}

# Check and set up ports
setup_ports() {
    print_step "Checking port availability..."
    
    # Check API port (8080)
    API_PORT=$(find_available_port 8080)
    if [ $? -eq 0 ]; then
        print_success "API port $API_PORT is available"
    else
        print_error "No available ports found for API (tried 8080-8089)"
        exit 1
    fi
    
    # Check frontend port (8085)
    FRONTEND_PORT=$(find_available_port 8085)
    if [ $? -eq 0 ]; then
        print_success "Frontend port $FRONTEND_PORT is available"
    else
        print_error "No available ports found for frontend (tried 8085-8094)"
        exit 1
    fi
    
    # Set the ports in environment
    export API_PORT=$API_PORT
    export FRONTEND_PORT=$FRONTEND_PORT
    export REACT_APP_API_BASE_URL=http://localhost:$API_PORT
    
    print_info "API will start on port $API_PORT"
    print_info "Frontend will start on port $FRONTEND_PORT"
}

# Create demo data
create_demo_data() {
    print_step "Creating realistic demo data..."
    
    cd api
    if node populate-database.js 2>/dev/null; then
        print_success "Realistic demo data created"
    else
        print_warning "Demo data creation failed - will use existing data"
    fi
    cd ..
}

# Start API server
start_api() {
    print_step "Starting API server..."
    
    cd api
    
    # Set the port
    export PORT=$API_PORT
    
    print_info "Starting API server on port $API_PORT..."
    print_info "API URL: http://localhost:$API_PORT"
    print_info "API Health: http://localhost:$API_PORT/api/health"
    
    # Start API in background
    npm start &
    API_PID=$!
    
    # Wait a moment for API to start
    sleep 3
    
    # Test if API is running with retries
    local max_retries=5
    local retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        if curl -s http://localhost:$API_PORT/api/health >/dev/null 2>&1; then
            print_success "API server started successfully"
            break
        else
            retry_count=$((retry_count + 1))
            print_info "Waiting for API to start... (attempt $retry_count/$max_retries)"
            sleep 2
        fi
    done
    
    if [ $retry_count -eq $max_retries ]; then
        print_warning "API server may not be fully ready yet, but continuing..."
    fi
    
    cd ..
}

# Start frontend
start_frontend() {
    print_step "Starting frontend..."
    
    cd frontend
    
    # Set the port
    export PORT=$FRONTEND_PORT
    
    print_info "Starting React frontend on port $FRONTEND_PORT..."
    print_info "Frontend URL: http://localhost:$FRONTEND_PORT"
    print_info "Press Ctrl+C to stop both services"
    echo
    
    # Start the frontend
    npm start
}

# Cleanup function
cleanup() {
    echo
    print_info "Cleaning up..."
    
    # Kill API server if running
    if [ ! -z "$API_PID" ]; then
        print_info "Stopping API server (PID: $API_PID)..."
        kill $API_PID 2>/dev/null || true
    fi
    
    # Kill any other background processes
    jobs -p | xargs -r kill 2>/dev/null || true
    
    print_success "Cleanup completed"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Main setup function
main() {
    print_header
    
    print_info "This script will prepare the database and start both API and frontend for demo"
    print_info "Make sure you have your .env files configured with Firebase and Snowflake credentials"
    echo
    
    check_directory
    check_requirements
    install_dependencies
    check_environment
    test_database
    setup_ports
    create_demo_data
    
    echo
    print_success "🎉 Setup completed successfully!"
    echo
    print_info "Starting services for demo..."
    echo
    
    # Start the API server first
    start_api
    
    echo
    print_info "Starting frontend..."
    echo
    
    # Start the frontend (this will block until stopped)
    start_frontend
}

# Run main function
main "$@"