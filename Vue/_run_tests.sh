#!/bin/bash

# Detect Operating System
OS="$(uname -s)"
OS_VERSION="$(uname -r)"
ARCH="$(uname -m)"
echo "Detected OS: $OS ($OS_VERSION, $ARCH)"

# Check for existing Vite development server
PORT_TO_CHECK=5173
EXISTING_PROCESS=$(lsof -ti :$PORT_TO_CHECK)

if [ ! -z "$EXISTING_PROCESS" ]; then
  echo "WARNING: A process is already running on port $PORT_TO_CHECK (PID: $EXISTING_PROCESS)."
  echo "Expected process: Vite development server. If this is something else, stopping it may be risky."
  read -p "Do you want to stop the existing Vite server before running tests? (yes/no or y/n): " choice
  case "$choice" in
    y|Y|yes|Yes)
      echo "Stopping existing Vite development server on port $PORT_TO_CHECK..."
      kill -15 $EXISTING_PROCESS
      sleep 2
      if ps -p $EXISTING_PROCESS > /dev/null; then
        echo "Process $EXISTING_PROCESS is still running. Force killing..."
        kill -9 $EXISTING_PROCESS
      else
        echo "Existing Vite process successfully terminated."
      fi
      ;;
    n|N|no|No)
      echo "Keeping existing process. This may cause conflicts if another Vite server is running."
      ;;
    *)
      echo "Invalid input. Keeping existing process."
      ;;
  esac
else
  echo "No Vite process found running on port $PORT_TO_CHECK. Proceeding..."
fi

# Check if .env exists and prompt before overwriting
if [ -f .env ]; then
  echo ".env file already exists. Overwriting will replace your current settings."
  read -p "Do you want to overwrite .env with .env.template? (yes/no or y/n): " choice
  case "$choice" in
    y|Y|yes|Yes)
      echo "Overwriting .env with .env.template..."
      cp .env.template .env
      ;;
    n|N|no|No)
      echo "Keeping existing .env file."
      ;;
    *)
      echo "Invalid input. Keeping existing .env file."
      ;;
  esac
else
  echo ".env file not found. Creating one from .env.template..."
  cp .env.template .env
fi

# Load environment variables
echo "Loading environment variables..."
source .env

# Ensure dependencies are installed using npm ci
echo "Installing dependencies with npm ci..."
npm ci

# macOS (Darwin) Apple Silicon specific setup
if [ "$OS" = "Darwin" ]; then
  echo "Detected macOS. Running Apple Silicon setup if required..."
  npm run mac-arm:setup
fi

# Install Playwright system-specific dependencies
echo "Installing Playwright system dependencies..."
npm run playwright-setup

# Start the Vite development server
echo "Starting the Vite development server..."
npm run dev &  # Run server in background
DEV_PID=$!

# Wait for server to be ready
echo "Waiting for Vite server to be ready..."
sleep 5

# Capture the running server URL
SERVER_URL=$(grep PLAYWRIGHT_BASE_URL .env | cut -d '=' -f2)
echo "Vite application is running at: $SERVER_URL"

# Confirm server availability
echo "Checking if the Vite server is accessible..."
curl -I $SERVER_URL

# Run Playwright tests
echo "Running Playwright tests..."
npm run test
TEST_EXIT_CODE=$?

# I didn't need 'wait $DEV_PID' here, Playwright tests have their own lifecycle and would complete, Vite server is meant to stay alive for them >_<

echo "Stopping Vite development server gracefully..."
kill -15 $DEV_PID
sleep 2  # Time for cleanup

# Wait for DEV_PID if we want to ensure it's truly gone, ensures `kill` command has had time to work before checking or force-killing.
wait $DEV_PID 2>/dev/null # Add 2>/dev/null to suppress "wait: no such process" if it's already gone

# Verify if process is still running
if ps -p $DEV_PID > /dev/null; then
  echo "Vite server (PID: $DEV_PID) is still running. Trying a more forceful shutdown..."
  kill -9 $DEV_PID  # Force kill if didn't terminate gracefully
else
  echo "Vite server (PID: $DEV_PID) has been successfully terminated."
fi

# Capture UTC Date & Time
CURRENT_DATE_UTC=$(date -u +"%A, %d %B %Y")
CURRENT_TIME_UTC=$(date -u +"%H:%M:%S UTC")

# Final message
if [ "$TEST_EXIT_CODE" -ne 0 ]; then
  echo "Playwright tests failed. Exiting with error."
  exit 1
else
  echo "All Playwright tests completed successfully!"
  echo "These tests were run on $OS ($OS_VERSION, $ARCH) at $CURRENT_DATE_UTC, $CURRENT_TIME_UTC."
  echo "Vite application was running at: $SERVER_URL"
  exit 0
fi
