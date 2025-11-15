#!/bin/bash
# Extras API Test Commands
# Quick reference for testing the Extras Reporting API

# Configuration - UPDATE THESE VALUES
API_KEY="your-api-key-here"
STORE_URL="https://your-store.resova.com"
API_ENDPOINT="http://localhost:3002/api/reporting/extras"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Extras Reporting API - Test Commands${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Test 1: Health Check
echo -e "${GREEN}Test 1: Health Check${NC}"
echo "GET $API_ENDPOINT"
curl -s "$API_ENDPOINT" | jq '.'
echo -e "\n"

# Test 2: Get all active extras for last 30 days
echo -e "${GREEN}Test 2: All active extras (last 30 days)${NC}"
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "'"$API_KEY"'",
      "storeUrl": "'"$STORE_URL"'"
    },
    "payload": {
      "date_range": { "range": "30" },
      "extras": "all",
      "transaction_status": "active"
    }
  }' | jq '.'
echo -e "\n"

# Test 3: Get all extras (including cancelled)
echo -e "${GREEN}Test 3: All extras including cancelled${NC}"
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "'"$API_KEY"'",
      "storeUrl": "'"$STORE_URL"'"
    },
    "payload": {
      "date_range": { "range": "30" },
      "extras": "all",
      "transaction_status": "all"
    }
  }' | jq '.'
echo -e "\n"

# Test 4: Get extras for last 7 days
echo -e "${GREEN}Test 4: Extras for last 7 days${NC}"
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "'"$API_KEY"'",
      "storeUrl": "'"$STORE_URL"'"
    },
    "payload": {
      "date_range": { "range": "7" },
      "extras": "all",
      "transaction_status": "active"
    }
  }' | jq '.'
echo -e "\n"

# Test 5: Get extras for current month
echo -e "${GREEN}Test 5: Extras for current month${NC}"
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "'"$API_KEY"'",
      "storeUrl": "'"$STORE_URL"'"
    },
    "payload": {
      "date_range": { "range": "current_month" },
      "extras": "all",
      "transaction_status": "active"
    }
  }' | jq '.'
echo -e "\n"

# Test 6: Get specific extras by ID (update IDs as needed)
echo -e "${GREEN}Test 6: Specific extras by ID${NC}"
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "'"$API_KEY"'",
      "storeUrl": "'"$STORE_URL"'"
    },
    "payload": {
      "date_range": { "range": "30" },
      "extras": "123,456,789",
      "transaction_status": "active"
    }
  }' | jq '.'
echo -e "\n"

# Test 7: Custom date range
echo -e "${GREEN}Test 7: Custom date range${NC}"
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "'"$API_KEY"'",
      "storeUrl": "'"$STORE_URL"'"
    },
    "payload": {
      "date_range": {
        "start_date": "2024-10-01",
        "end_date": "2024-11-13"
      },
      "extras": "all",
      "transaction_status": "all"
    }
  }' | jq '.'
echo -e "\n"

# Test 8: Error handling - missing credentials
echo -e "${GREEN}Test 8: Error handling - missing credentials${NC}"
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "date_range": { "range": "30" }
    }
  }' | jq '.'
echo -e "\n"

# Test 9: Error handling - missing payload
echo -e "${GREEN}Test 9: Error handling - missing payload${NC}"
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "'"$API_KEY"'",
      "storeUrl": "'"$STORE_URL"'"
    }
  }' | jq '.'
echo -e "\n"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Testing Complete${NC}"
echo -e "${BLUE}========================================${NC}"
