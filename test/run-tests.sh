#!/usr/bin/env bash

# Set strict mode
set -euo pipefail

# Change to the script's directory
cd "$(dirname "$0")"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Make sure jq is installed
if ! command -v jq &> /dev/null; then
  echo -e "${RED}Error: jq is not installed. Please install it to run the tests.${NC}"
  echo "Debian/Ubuntu: sudo apt-get install jq"
  echo "macOS: brew install jq"
  exit 1
fi

# Make sure curl is installed
if ! command -v curl &> /dev/null; then
  echo -e "${RED}Error: curl is not installed. Please install it to run the tests.${NC}"
  exit 1
fi

# Make sure skaffold is installed
if ! command -v skaffold &> /dev/null; then
  echo -e "${RED}Error: skaffold is not installed. Please install it to run the services required for the tests.${NC}"
  echo "Visit: https://skaffold.dev/docs/install/"
  exit 1
fi

# Make sure kubectl is installed
if ! command -v kubectl &> /dev/null; then
  echo -e "${RED}Error: kubectl is not installed. Please install it to run the tests.${NC}"
  echo "Visit: https://kubernetes.io/docs/tasks/tools/install-kubectl/"
  exit 1
fi


# Check if API server is running or start it
check_or_start_api() {
  if curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/health" | grep -q "200"; then
    echo -e "${GREEN}API server is already running.${NC}"
  else
    echo -e "${YELLOW}API server is not running. Starting it...${NC}"
    # Start API server in the background
    (skaffold run) &
    # (kubectl port-forward service/api 3000:3000) &
    
    # Save the process ID
    API_PID=$!
    
    # Wait for API to become available
    echo "Waiting for API server to start..."
    for i in {1..30}; do
      # Note: You need to start the services first using:
      # skaffold dev --port-forward
      # This will start both the API and web-app services with port forwarding enabled

      # Check if services are up
      if ! kubectl get service api &>/dev/null || ! kubectl get service web-app &>/dev/null; then
        echo -e "${RED}Required services not found in cluster. Please start them first using:${NC}"
        echo -e "${YELLOW}skaffold dev --port-forward${NC}"
        exit 1
      fi

      # Port forward services if not already forwarded
      if ! pgrep -f "kubectl port-forward service/api 3000:3000" &>/dev/null; then
        kubectl port-forward service/api 3000:3000 &
        API_FWD_PID=$!
        trap "kill $API_FWD_PID 2>/dev/null || true" EXIT
      fi

      if ! pgrep -f "kubectl port-forward service/web-app 4173:4173" &>/dev/null; then
        kubectl port-forward service/web-app 4173:4173 &
        WEB_FWD_PID=$!
        trap "kill $WEB_FWD_PID 2>/dev/null || true" EXIT
      fi
      if curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/health" | grep -q "200"; then
        echo -e "${GREEN}API server started successfully.${NC}"
        break
      fi
      
      if [ $i -eq 30 ]; then
        echo -e "${RED}Failed to start API server.${NC}"
        echo -e "${YELLOW}Note: You may need to manually start the services first using:${NC}"
        echo -e "${YELLOW}skaffold dev --port-forward${NC}"
        echo -e "${YELLOW}This will start both the API and web-app services with port forwarding enabled${NC}"
        kill $API_PID 2>/dev/null || true
        exit 1
      fi
      
      echo "Waiting... ($i/30)"
      sleep 1
    done
    
    # Register a trap to kill the API server on exit
    trap "echo 'Stopping services...'; skaffold delete" EXIT
  fi
}

# Main function to run tests
run_tests() {
  local test_path="${1:-api}"
  
  echo -e "${GREEN}Running tests in $test_path...${NC}"
  
  # Use mise to run bats
  mise exec -- bats -r "$test_path"
}

# Handle command line arguments
main() {
  check_or_start_api
  
  if [ $# -eq 0 ]; then
    # Run all tests
    run_tests "api"
  else
    # Run specific tests
    run_tests "$1"
  fi
}

main "$@" 