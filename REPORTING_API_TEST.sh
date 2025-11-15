#!/bin/bash

# Resova Intelligence V3 - Reporting API Integration Test
# Tests all 7 Resova Reporting APIs

API_KEY="${RESOVA_API_KEY}"
BASE_URL="http://localhost:3000"

echo "=========================================="
echo "Resova Reporting API Integration Tests"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_api() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4

    echo -e "${YELLOW}Testing:${NC} $name"
    echo "Endpoint: $method $endpoint"

    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" \
            -X GET \
            -H "x-api-key: $API_KEY" \
            -H "Accept: application/json" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" \
            -X POST \
            -H "x-api-key: $API_KEY" \
            -H "Content-Type: application/json" \
            -H "Accept: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" == "200" ]; then
        echo -e "${GREEN}✓ Success${NC} (HTTP $http_code)"
        echo "Response: $(echo $body | jq -r '.data[0].id // .message // "Success"' 2>/dev/null || echo 'OK')"
    else
        echo -e "${RED}✗ Failed${NC} (HTTP $http_code)"
        echo "Error: $(echo $body | jq -r '.error // .message' 2>/dev/null || echo $body)"
    fi
    echo ""
}

# Test date range payload for POST requests
DATE_RANGE_7_DAYS='{
  "date_range": {
    "range": "7"
  }
}'

DATE_RANGE_CURRENT_MONTH='{
  "date_range": {
    "range": "current_month"
  }
}'

DATE_RANGE_CUSTOM='{
  "date_range": {
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  }
}'

echo "=== NEW API INTEGRATIONS (V3) ==="
echo ""

# 1. Transactions API (GET)
test_api \
    "Transactions Reporting API" \
    "GET" \
    "/api/reporting/transactions?range=7&limit=10" \
    ""

# 2. Itemized Revenue API (POST)
test_api \
    "Itemized Revenue Reporting API" \
    "POST" \
    "/api/reporting/itemized-revenue" \
    "$DATE_RANGE_7_DAYS"

# 3. All Bookings API (POST)
test_api \
    "All Bookings Reporting API" \
    "POST" \
    "/api/reporting/bookings" \
    "$DATE_RANGE_CURRENT_MONTH"

# 4. All Payments API (POST)
test_api \
    "All Payments Reporting API" \
    "POST" \
    "/api/reporting/payments" \
    "$DATE_RANGE_7_DAYS"

echo "=== EXISTING API INTEGRATIONS ==="
echo ""

# 5. Guests API (POST)
test_api \
    "Guests Reporting API" \
    "POST" \
    "/api/reporting/guests" \
    "$DATE_RANGE_7_DAYS"

# 6. Gift Vouchers API (POST)
test_api \
    "Gift Vouchers Reporting API" \
    "POST" \
    "/api/reporting/gift-vouchers" \
    "$DATE_RANGE_CURRENT_MONTH"

# 7. Extras API (POST)
test_api \
    "Extras Reporting API" \
    "POST" \
    "/api/reporting/extras" \
    "$DATE_RANGE_7_DAYS"

echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo ""
echo "All 7 Resova Reporting APIs tested:"
echo "  - 4 NEW integrations (Transactions, Itemized Revenue, Bookings, Payments)"
echo "  - 3 EXISTING integrations (Guests, Gift Vouchers, Extras)"
echo ""
echo "To run this test:"
echo "  export RESOVA_API_KEY='your-api-key'"
echo "  chmod +x REPORTING_API_TEST.sh"
echo "  ./REPORTING_API_TEST.sh"
echo ""
