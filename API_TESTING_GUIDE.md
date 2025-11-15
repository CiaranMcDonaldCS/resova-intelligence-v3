# Resova Intelligence V3 - API Testing Guide

Complete guide for testing all integrated Resova API endpoints.

## Current Status

**✅ API Routes Created**: 18 endpoints (proxy/passthrough routes)
**⚠️ AI Integration**: NOT YET CONNECTED to the AI assistant
**🎯 Next Step**: Test endpoints, then integrate with AI

---

## Prerequisites

Before testing, ensure you have:

1. **Resova API Key** - From Resova Settings > General Settings > Developer
2. **Server IP Whitelisted** - In Resova dashboard
3. **Environment Variables** - Set in `.env.local`:
   ```bash
   NEXT_PUBLIC_RESOVA_API_KEY=your_api_key_here
   NEXT_PUBLIC_RESOVA_API_URL=https://api.resova.io/v1  # or .us, .eu
   ```
4. **Dev Server Running** - `npm run dev` on port 3000

---

## Testing Methods

### Method 1: Command Line (curl)

Quick tests using terminal commands.

### Method 2: API Test Scripts

Use the provided test scripts:
- `REPORTING_API_TEST.sh` - Tests all 7 reporting APIs
- Create similar scripts for new APIs

### Method 3: Postman/Insomnia

Import endpoints into API testing tools.

### Method 4: Browser DevTools

Test via browser fetch/console.

---

## Test Cases by Category

## 1. Reporting APIs (7 endpoints)

### Test 1.1: Transactions Reporting
```bash
# GET with query parameters
curl -X GET "http://localhost:3000/api/reporting/transactions?range=7&limit=10" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Accept: application/json"

# Expected: List of transactions from last 7 days
# Status: 200 OK
# Response: { data: [...], pagination: {...} }
```

### Test 1.2: Itemized Revenue
```bash
# POST with date range
curl -X POST "http://localhost:3000/api/reporting/itemized-revenue" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "date_range": {
      "range": "current_month"
    }
  }'

# Expected: Revenue breakdown by product/service
# Status: 200 OK
```

### Test 1.3: All Bookings
```bash
curl -X POST "http://localhost:3000/api/reporting/bookings" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "date_range": {
      "range": "7"
    }
  }'

# Expected: Booking details with customer info
# Status: 200 OK
```

### Test 1.4: All Payments
```bash
curl -X POST "http://localhost:3000/api/reporting/payments" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "date_range": {
      "range": "7"
    }
  }'

# Expected: Payment details with status
# Status: 200 OK
```

### Test 1.5: Guests
```bash
curl -X POST "http://localhost:3000/api/reporting/guests" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "date_range": {
      "range": "7"
    }
  }'

# Expected: Guest participation data
# Status: 200 OK
```

### Test 1.6: Gift Vouchers (Reporting)
```bash
curl -X POST "http://localhost:3000/api/reporting/gift-vouchers" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "date_range": {
      "range": "current_month"
    }
  }'

# Expected: Voucher sales and redemptions
# Status: 200 OK
```

### Test 1.7: Extras
```bash
curl -X POST "http://localhost:3000/api/reporting/extras" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "date_range": {
      "range": "7"
    }
  }'

# Expected: Extras sales and inventory
# Status: 200 OK
```

---

## 2. Items APIs (5 endpoints)

### Test 2.1: List All Items
```bash
curl -X GET "http://localhost:3000/api/resova/items" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Accept: application/json"

# Expected: Array of all bookable items/services
# Status: 200 OK
# Response: { data: [{ id, name, description, pricing, ... }] }
```

### Test 2.2: Get Item Details
```bash
# Replace ITEM_ID with actual item ID from Test 2.1
curl -X GET "http://localhost:3000/api/resova/items/ITEM_ID" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Accept: application/json"

# Expected: Detailed item information
# Status: 200 OK
```

### Test 2.3: Get Booking Questions
```bash
curl -X GET "http://localhost:3000/api/resova/items/ITEM_ID/booking-questions" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Accept: application/json"

# Expected: Custom questions for booking flow
# Status: 200 OK
```

### Test 2.4: Get Item Reviews
```bash
curl -X GET "http://localhost:3000/api/resova/items/ITEM_ID/reviews" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Accept: application/json"

# Expected: Customer reviews and ratings
# Status: 200 OK
```

### Test 2.5: Get Item Extras
```bash
curl -X GET "http://localhost:3000/api/resova/items/ITEM_ID/extras" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Accept: application/json"

# Expected: Available add-ons/extras with pricing
# Status: 200 OK
```

---

## 3. Availability APIs (3 endpoints)

### Test 3.1: Daily Availability Calendar
```bash
curl -X GET "http://localhost:3000/api/resova/availability/daily?item_id=ITEM_ID&start_date=2025-01-01&end_date=2025-01-31" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Accept: application/json"

# Expected: Available dates and instances
# Status: 200 OK
```

### Test 3.2: Instance Details
```bash
# Replace INSTANCE_ID with actual instance ID from Test 3.1
curl -X GET "http://localhost:3000/api/resova/availability/instance/INSTANCE_ID" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Accept: application/json"

# Expected: Capacity, availability, time details
# Status: 200 OK
```

### Test 3.3: Calculate Pricing
```bash
curl -X POST "http://localhost:3000/api/resova/availability/instance/INSTANCE_ID/pricing" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "quantities": {
      "PARTICIPANT_TYPE_ID": 2
    }
  }'

# Expected: Price breakdown (base, discounts, taxes, total)
# Status: 200 OK
```

---

## 4. Customer APIs (1 endpoint)

### Test 4.1: Get Customer Details
```bash
# Replace CUSTOMER_ID with actual customer ID
curl -X GET "http://localhost:3000/api/resova/customers/CUSTOMER_ID" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Accept: application/json"

# Expected: Customer profile and account details
# Status: 200 OK
```

---

## 5. Gift Voucher APIs (2 endpoints)

### Test 5.1: List All Gift Vouchers
```bash
curl -X GET "http://localhost:3000/api/resova/gift-vouchers" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Accept: application/json"

# Expected: Array of gift vouchers
# Status: 200 OK
```

### Test 5.2: Get Gift Voucher Details
```bash
# Replace VOUCHER_ID with actual voucher ID
curl -X GET "http://localhost:3000/api/resova/gift-vouchers/VOUCHER_ID" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Accept: application/json"

# Expected: Voucher code, value, status, expiration
# Status: 200 OK
```

---

## Common Error Responses

### 401 Unauthorized
```json
{
  "error": "API key is required"
}
```
**Fix**: Check that `x-api-key` header is included

### 400 Bad Request
```json
{
  "error": "date_range is required in request body"
}
```
**Fix**: Ensure request body includes required fields

### 404 Not Found
```json
{
  "error": "Failed to fetch item",
  "details": "Item not found"
}
```
**Fix**: Verify the ID exists in your Resova account

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "..."
}
```
**Fix**: Check server logs, verify Resova API is accessible

---

## Automated Test Script

Create `test-all-apis.sh`:

```bash
#!/bin/bash

API_KEY="${RESOVA_API_KEY}"
BASE_URL="http://localhost:3000"

echo "Testing Resova Intelligence V3 APIs..."
echo "========================================"

# Test 1: Items
echo "1. Testing Items API..."
curl -s -o /dev/null -w "Status: %{http_code}\n" \
  -X GET "$BASE_URL/api/resova/items" \
  -H "x-api-key: $API_KEY"

# Test 2: Availability
echo "2. Testing Availability API..."
curl -s -o /dev/null -w "Status: %{http_code}\n" \
  -X GET "$BASE_URL/api/resova/availability/daily" \
  -H "x-api-key: $API_KEY"

# Test 3: Gift Vouchers
echo "3. Testing Gift Vouchers API..."
curl -s -o /dev/null -w "Status: %{http_code}\n" \
  -X GET "$BASE_URL/api/resova/gift-vouchers" \
  -H "x-api-key: $API_KEY"

# Test 4: Transactions Reporting
echo "4. Testing Transactions Reporting API..."
curl -s -o /dev/null -w "Status: %{http_code}\n" \
  -X GET "$BASE_URL/api/reporting/transactions?range=7" \
  -H "x-api-key: $API_KEY"

echo "========================================"
echo "All tests complete!"
```

**Run**:
```bash
chmod +x test-all-apis.sh
export RESOVA_API_KEY="your_key_here"
./test-all-apis.sh
```

---

## Next Steps After Testing

Once APIs are tested and working:

### Phase 1: Create Data Fetch Functions
Create `/app/lib/services/resova-api-service.ts`:

```typescript
// Example service functions
export class ResovaApiService {
  static async getItems() {
    const response = await fetch('/api/resova/items', {
      headers: { 'x-api-key': process.env.NEXT_PUBLIC_RESOVA_API_KEY! }
    });
    return response.json();
  }

  static async getAvailability(itemId: string, startDate: string, endDate: string) {
    const response = await fetch(
      `/api/resova/availability/daily?item_id=${itemId}&start_date=${startDate}&end_date=${endDate}`,
      { headers: { 'x-api-key': process.env.NEXT_PUBLIC_RESOVA_API_KEY! } }
    );
    return response.json();
  }

  // ... more functions
}
```

### Phase 2: Update AI Assistant Integration
Modify `/app/lib/services/analytics-service.ts` or create new service to:
- Fetch data from new endpoints
- Format data for AI consumption
- Include in AI context

### Phase 3: Enhance AI Prompts
Update system prompts to include:
- Available services/items
- Pricing information
- Availability data
- Customer context

### Phase 4: UI Integration
Connect components to use new data:
- Display available services
- Show pricing
- Populate availability calendars
- Show customer reviews

---

## Success Criteria

APIs are ready when:
- ✅ All endpoints return 200 status codes
- ✅ Response data is well-formed JSON
- ✅ Data matches expected structure
- ✅ No authentication errors
- ✅ Error handling works correctly

AI Integration is complete when:
- ✅ Assistant can answer availability questions
- ✅ Assistant can provide pricing information
- ✅ Assistant can describe available services
- ✅ Assistant can check gift voucher status
- ✅ Response times are acceptable (< 3s)

---

## Troubleshooting

### Issue: "API key is required"
- Check `.env.local` has `NEXT_PUBLIC_RESOVA_API_KEY`
- Verify header name is `x-api-key` (lowercase)
- Restart dev server after adding env vars

### Issue: "Failed to fetch"
- Check Resova API URL is correct (.io, .us, or .eu)
- Verify server IP is whitelisted in Resova
- Check network connectivity

### Issue: Empty responses
- Verify you have data in your Resova account
- Check date ranges are valid
- Ensure item/customer/voucher IDs exist

### Issue: 500 errors
- Check server console for detailed errors
- Verify Resova API is accessible
- Check request body format matches API spec

---

*Last Updated: 2025-11-15*
*Version: V3*
*18 API endpoints integrated and ready for testing*
