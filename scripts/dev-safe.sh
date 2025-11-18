#!/bin/bash

# Safe dev server script with error monitoring
# - Ensures only one instance runs
# - Monitors for errors and auto-kills after 10 seconds

# Color codes for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Checking for existing Next.js dev servers...${NC}"

# Kill any existing Next.js dev servers on port 3000
if lsof -ti:3000 > /dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  Found existing process on port 3000, killing...${NC}"
  lsof -ti:3000 | xargs kill -9
  sleep 1
fi

# Kill any node processes running 'next dev'
if pgrep -f "next dev" > /dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  Found existing 'next dev' processes, killing...${NC}"
  pkill -f "next dev"
  sleep 1
fi

echo -e "${GREEN}✅ No existing dev servers found${NC}"
echo -e "${BLUE}🚀 Starting dev server with error monitoring...${NC}"
echo -e "${YELLOW}⚠️  Server will auto-shutdown 10 seconds after critical errors${NC}"

# Create a temporary log file
LOG_FILE="/tmp/next-dev-$$.log"
ERROR_COUNT=0
ERROR_TIMER=""

# Cleanup function
cleanup() {
  echo -e "\n${YELLOW}🛑 Shutting down dev server...${NC}"

  # Kill the background timer if it exists
  if [ ! -z "$ERROR_TIMER" ]; then
    kill $ERROR_TIMER 2>/dev/null
  fi

  # Kill all related processes
  if lsof -ti:3000 > /dev/null 2>&1; then
    lsof -ti:3000 | xargs kill -9 2>/dev/null
  fi
  pkill -f "next dev" 2>/dev/null

  # Clean up log file
  rm -f "$LOG_FILE"

  echo -e "${GREEN}✅ Cleanup complete${NC}"
  exit 0
}

# Set up trap to catch Ctrl+C and other termination signals
trap cleanup SIGINT SIGTERM EXIT

# Error monitoring function
monitor_errors() {
  while IFS= read -r line; do
    echo "$line"

    # Check for critical errors
    if echo "$line" | grep -qiE "error|failed|exception|ECONNREFUSED|EADDRINUSE|TypeError|ReferenceError|SyntaxError|Too many connections|Resova API error|NetworkError|ApiError"; then

      # Ignore certain non-critical errors
      if echo "$line" | grep -qE "Failed to load resource|ConfigStorage|localStorage|Download the React DevTools|authentication_error|Unauthorized|401|Failed to fetch baskets|Failed to fetch abandoned carts|Abandoned carts endpoint not available"; then
        continue
      fi

      # Critical error detected
      ERROR_COUNT=$((ERROR_COUNT + 1))

      # DISABLED: Auto-shutdown temporarily disabled to allow data loading to complete
      # if [ $ERROR_COUNT -eq 1 ]; then
      #   echo -e "${RED}❌ Critical error detected! Auto-shutdown in 20 seconds...${NC}"
      #   echo -e "${YELLOW}   Press Ctrl+C now to cancel shutdown${NC}"
      #   echo -e "${YELLOW}   Note: Data loading is intentionally slow (~10-15s) to protect Resova API${NC}"

      #   # Start background timer (increased to 20 seconds for slow loading)
      #   (
      #     sleep 20
      #     echo -e "${RED}⏱️  20 seconds elapsed. Shutting down...${NC}"
      #     cleanup
      #   ) &
      #   ERROR_TIMER=$!
      # fi
    fi

    # Check for successful compilation (reset error count)
    if echo "$line" | grep -qE "✓ Compiled|✓ Ready"; then
      if [ ! -z "$ERROR_TIMER" ]; then
        echo -e "${GREEN}✅ Compilation successful, canceling auto-shutdown${NC}"
        kill $ERROR_TIMER 2>/dev/null
        ERROR_TIMER=""
      fi
      ERROR_COUNT=0
    fi
  done
}

# Start the dev server and pipe output through error monitor
npm run dev 2>&1 | tee "$LOG_FILE" | monitor_errors

# This should never be reached due to trap, but just in case
cleanup
