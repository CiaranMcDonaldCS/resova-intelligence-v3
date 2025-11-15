#!/bin/bash
# Guests API Test Commands
# Quick reference for testing the Guests Reporting API

# Configuration - UPDATE THESE VALUES
API_KEY="your-api-key-here"
STORE_URL="https://your-store.resova.com"
API_ENDPOINT="http://localhost:3000/api/reporting/guests"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Guests Reporting API - Test Commands${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Test 1: Health Check
echo -e "${GREEN}Test 1: Health Check${NC}"
echo "GET $API_ENDPOINT"
curl -s "$API_ENDPOINT" | jq '.'
echo -e "\n"

# Test 2: Get guests who attended in last 30 days
echo -e "${GREEN}Test 2: Guests who attended (last 30 days)${NC}"
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "'"$API_KEY"'",
      "storeUrl": "'"$STORE_URL"'"
    },
    "payload": {
      "date_range": { "range": "30" },
      "type": "by_date_attended",
      "items": "all"
    }
  }' | jq '.'
echo -e "\n"

# Test 3: Get guests by purchase date
echo -e "${GREEN}Test 3: Guests by purchase date (last 30 days)${NC}"
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "'"$API_KEY"'",
      "storeUrl": "'"$STORE_URL"'"
    },
    "payload": {
      "date_range": { "range": "30" },
      "type": "by_date_purchased",
      "items": "all"
    }
  }' | jq '.'
echo -e "\n"

# Test 4: Get guests for last 7 days (attended)
echo -e "${GREEN}Test 4: Guests for last 7 days${NC}"
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "'"$API_KEY"'",
      "storeUrl": "'"$STORE_URL"'"
    },
    "payload": {
      "date_range": { "range": "7" },
      "type": "by_date_attended",
      "items": "all"
    }
  }' | jq '.'
echo -e "\n"

# Test 5: Get guests for current month
echo -e "${GREEN}Test 5: Guests for current month${NC}"
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "'"$API_KEY"'",
      "storeUrl": "'"$STORE_URL"'"
    },
    "payload": {
      "date_range": { "range": "current_month" },
      "type": "by_date_attended",
      "items": "all"
    }
  }' | jq '.'
echo -e "\n"

# Test 6: Get guests for specific items (update IDs as needed)
echo -e "${GREEN}Test 6: Guests for specific items${NC}"
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "'"$API_KEY"'",
      "storeUrl": "'"$STORE_URL"'"
    },
    "payload": {
      "date_range": { "range": "30" },
      "type": "by_date_attended",
      "items": "123,456,789"
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
      "type": "by_date_attended",
      "items": "all"
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

# Test 10: Get guest count summary
echo -e "${GREEN}Test 10: Guest count summary${NC}"
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "'"$API_KEY"'",
      "storeUrl": "'"$STORE_URL"'"
    },
    "payload": {
      "date_range": { "range": "30" },
      "type": "by_date_attended",
      "items": "all"
    }
  }' | jq '{success, count, total_guests: .count}'
echo -e "\n"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Testing Complete${NC}"
echo -e "${BLUE}========================================${NC}"
