#!/bin/bash
# Gift Vouchers API Test Commands
# Quick reference for testing the Gift Vouchers Reporting API

# Configuration - UPDATE THESE VALUES
API_KEY="your-api-key-here"
STORE_URL="https://your-store.resova.com"
API_ENDPOINT="http://localhost:3000/api/reporting/gift-vouchers"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Gift Vouchers API - Test Commands${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Test 1: Health Check
echo -e "${GREEN}Test 1: Health Check${NC}"
echo "GET $API_ENDPOINT"
curl -s "$API_ENDPOINT" | jq '.'
echo -e "\n"

# Test 2: Get all active gift vouchers (last 30 days)
echo -e "${GREEN}Test 2: All active gift vouchers (last 30 days)${NC}"
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "'"$API_KEY"'",
      "storeUrl": "'"$STORE_URL"'"
    },
    "payload": {
      "date_range": { "range": "30" },
      "type": "all_gifts",
      "transaction_status": "active",
      "gift_status": "active_codes"
    }
  }' | jq '.'
echo -e "\n"

# Test 3: Get all vouchers including inactive
echo -e "${GREEN}Test 3: All vouchers including inactive${NC}"
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "'"$API_KEY"'",
      "storeUrl": "'"$STORE_URL"'"
    },
    "payload": {
      "date_range": { "range": "30" },
      "type": "all_gifts",
      "transaction_status": "all",
      "gift_status": "all"
    }
  }' | jq '.'
echo -e "\n"

# Test 4: Get activity-specific vouchers
echo -e "${GREEN}Test 4: Activity-specific gift vouchers${NC}"
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "'"$API_KEY"'",
      "storeUrl": "'"$STORE_URL"'"
    },
    "payload": {
      "date_range": { "range": "7" },
      "type": "by_activity",
      "transaction_status": "active",
      "gift_status": "active_codes"
    }
  }' | jq '.'
echo -e "\n"

# Test 5: Get vouchers for current month
echo -e "${GREEN}Test 5: Vouchers for current month${NC}"
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "'"$API_KEY"'",
      "storeUrl": "'"$STORE_URL"'"
    },
    "payload": {
      "date_range": { "range": "current_month" },
      "type": "all_gifts",
      "transaction_status": "active",
      "gift_status": "active_codes"
    }
  }' | jq '.'
echo -e "\n"

# Test 6: Get only inactive voucher codes
echo -e "${GREEN}Test 6: Inactive voucher codes only${NC}"
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "'"$API_KEY"'",
      "storeUrl": "'"$STORE_URL"'"
    },
    "payload": {
      "date_range": { "range": "30" },
      "type": "all_gifts",
      "transaction_status": "all",
      "gift_status": "inactive_codes"
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
      "type": "all_gifts",
      "transaction_status": "all",
      "gift_status": "all"
    }
  }' | jq '.'
echo -e "\n"

# Test 8: Cancelled transactions only
echo -e "${GREEN}Test 8: Cancelled transactions only${NC}"
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "'"$API_KEY"'",
      "storeUrl": "'"$STORE_URL"'"
    },
    "payload": {
      "date_range": { "range": "30" },
      "type": "all_gifts",
      "transaction_status": "cancelled",
      "gift_status": "all"
    }
  }' | jq '.'
echo -e "\n"

# Test 9: Error handling - missing credentials
echo -e "${GREEN}Test 9: Error handling - missing credentials${NC}"
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "date_range": { "range": "30" }
    }
  }' | jq '.'
echo -e "\n"

# Test 10: Financial summary
echo -e "${GREEN}Test 10: Financial summary (total remaining value)${NC}"
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "'"$API_KEY"'",
      "storeUrl": "'"$STORE_URL"'"
    },
    "payload": {
      "date_range": { "range": "30" },
      "type": "all_gifts",
      "transaction_status": "active",
      "gift_status": "active_codes"
    }
  }' | jq '{
    success,
    count,
    vouchers: .count,
    total_remaining: [.data[].total_remaining | tonumber] | add
  }'
echo -e "\n"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Testing Complete${NC}"
echo -e "${BLUE}========================================${NC}"
