#!/bin/bash

# Rutgers Makerspace API Startup Script
# This script starts only the API server

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
    echo -e "${PURPLE}  Rutgers Makerspace API${NC}"
    echo -e "${PURPLE}  Starting Server${NC}"
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

# Check if we're in the right directory
if [ ! -d "api" ]; then
    print_error "This script must be run from the project root directory"
    print_info "Make sure you're in the Rutgers-Makerspace-HackRU-2025 directory"
    exit 1
fi

# Check if .env exists
if [ ! -f "api/.env" ]; then
    print_error "API .env file not found. Please create it with your Snowflake credentials."
    print_info "Required variables: SF_ACCOUNT, SF_USER, SF_PASSWORD, SF_WAREHOUSE, SF_DATABASE, SF_SCHEMA, SF_ROLE"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "api/node_modules" ]; then
    print_step "Installing API dependencies..."
    cd api
    npm install
    cd ..
fi

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

# Cleanup function
cleanup() {
    echo
    print_info "Stopping API server..."
    # Kill any background processes
    jobs -p | xargs -r kill 2>/dev/null || true
    print_success "API server stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Main function
main() {
    print_header
    
    # Find available port
    API_PORT=$(find_available_port 8080)
    if [ $? -eq 0 ]; then
        print_success "API port $API_PORT is available"
    else
        print_error "No available ports found for API (tried 8080-8089)"
        exit 1
    fi
    
    # Set the port
    export PORT=$API_PORT
    
    print_info "Starting API server on port $API_PORT..."
    print_info "API URL: http://localhost:$API_PORT"
    print_info "API Health: http://localhost:$API_PORT/api/health"
    print_info "Press Ctrl+C to stop"
    echo
    
    # Start the API
    cd api
    npm start
}

# Run main function
main "$@"