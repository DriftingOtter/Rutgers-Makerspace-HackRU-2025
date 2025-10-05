#!/bin/bash

# Start API server for Rutgers Makerspace

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Rutgers Makerspace API...${NC}"

# Check if we're in the right directory
if [ ! -d "api" ]; then
    echo -e "${RED}❌ This script must be run from the project root directory${NC}"
    exit 1
fi

# Check if API dependencies are installed
if [ ! -d "api/node_modules" ]; then
    echo -e "${CYAN}📦 Installing API dependencies...${NC}"
    cd api && npm install && cd ..
fi

# Start the API
cd api
echo -e "${GREEN}✅ API starting on http://localhost:8080${NC}"
echo -e "${CYAN}ℹ️  Press Ctrl+C to stop${NC}"
echo

npm start