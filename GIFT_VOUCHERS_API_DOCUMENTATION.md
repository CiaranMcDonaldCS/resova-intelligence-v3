# Gift Vouchers Reporting API - Documentation & Testing Guide

## Overview
The Gift Vouchers Reporting API provides access to gift voucher data from Resova, including redemption values, usage tracking, purchaser information, and voucher status.

## API Endpoint

### POST `/api/reporting/gift-vouchers`

**Request Body:**
```json
{
  "credentials": {
    "apiKey": "your-api-key",
    "storeUrl": "https://your-store.resova.com"
  },
  "payload": {
    "date_range": {
      "range": "30"  // or "7", "current_month", or custom dates
    },
    "type": "all_gifts",  // or "by_activity"
    "transaction_status": "active",  // or "all", "cancelled"
    "gift_status": "active_codes"  // or "all", "inactive_codes"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "store": null,
      "code": "DAVID1",
      "category_name": "Gift Voucher for $50 (Demo)",
      "voucher_type": "Manually Created",
      "created_by": "David Medina",
      "total_amount": "50.00",
      "total_redemption": "50.00",
      "total_redeemed": "25.92",
      "total_remaining": "24.08",
      "booking_end_date": "N/A",
      "last_used_d_short": "N/A",
      "gift_email": "",
      "gift_message": "",
      "purchase_transaction_id": "0",
      "purchase_customer_id": "0",
      "purchase_customer_first_name": "N/A",
      "purchase_customer_last_name": "N/A",
      "purchase_customer_email": "N/A",
      "updated_d_short": "11/11/2025",
      "updated_by": "N/A",
      "created_d_short": "11/11/2025",
      "status": "Active"
    }
  ],
  "count": 1
}
```

## Manual Testing Examples

### 1. Test with cURL

#### Get all active gift vouchers for last 30 days:
```bash
curl -X POST http://localhost:3000/api/reporting/gift-vouchers \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "your-api-key",
      "storeUrl": "https://your-store.resova.com"
    },
    "payload": {
      "date_range": { "range": "30" },
      "type": "all_gifts",
      "transaction_status": "active",
      "gift_status": "active_codes"
    }
  }'
```

#### Get all gift vouchers including inactive:
```bash
curl -X POST http://localhost:3000/api/reporting/gift-vouchers \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "your-api-key",
      "storeUrl": "https://your-store.resova.com"
    },
    "payload": {
      "date_range": { "range": "30" },
      "type": "all_gifts",
      "transaction_status": "all",
      "gift_status": "all"
    }
  }'
```

#### Get activity-specific gift vouchers:
```bash
curl -X POST http://localhost:3000/api/reporting/gift-vouchers \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "your-api-key",
      "storeUrl": "https://your-store.resova.com"
    },
    "payload": {
      "date_range": { "range": "7" },
      "type": "by_activity",
      "transaction_status": "active",
      "gift_status": "active_codes"
    }
  }'
```

#### Get gift vouchers with custom date range:
```bash
curl -X POST http://localhost:3000/api/reporting/gift-vouchers \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "your-api-key",
      "storeUrl": "https://your-store.resova.com"
    },
    "payload": {
      "date_range": {
        "start_date": "2024-10-01",
        "end_date": "2024-11-13"
      },
      "type": "all_gifts",
      "transaction_status": "active",
      "gift_status": "active_codes"
    }
  }'
```

#### Health check:
```bash
curl http://localhost:3000/api/reporting/gift-vouchers
```

Expected response:
```json
{
  "success": true,
  "message": "Gift Vouchers Reporting API is running",
  "version": "1.0.0",
  "endpoint": "/api/reporting/gift-vouchers"
}
```

### 2. Test with JavaScript/Fetch

```javascript
async function getGiftVouchersData() {
  try {
    const response = await fetch('http://localhost:3000/api/reporting/gift-vouchers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        credentials: {
          apiKey: process.env.RESOVA_API_KEY,
          storeUrl: process.env.RESOVA_STORE_URL
        },
        payload: {
          date_range: { range: '30' },
          type: 'all_gifts',
          transaction_status: 'active',
          gift_status: 'active_codes'
        }
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log(`Found ${data.count} gift vouchers`);
      console.log(data.data);
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

getGiftVouchersData();
```

## AI Assistant Questions

### Basic Gift Voucher Questions
```javascript
const GIFT_VOUCHER_QUESTIONS = [
  // Voucher Overview
  "Show me all active gift vouchers",
  "List all gift vouchers from the last 30 days",
  "How many gift vouchers have been created?",
  "What's the total value of unredeemed vouchers?",

  // Financial Analysis
  "What's the total redemption value across all vouchers?",
  "Show me gift vouchers with remaining balance",
  "Which vouchers have been fully redeemed?",
  "What's the total amount of gift vouchers sold?",
  "Calculate outstanding voucher liability",

  // Usage & Redemption
  "Which gift vouchers have been used recently?",
  "Show me unused gift vouchers",
  "List vouchers that are about to expire",
  "What's the average redemption rate?",
  "Which vouchers have never been used?",

  // Customer Insights
  "Who purchased the most gift vouchers?",
  "Show me gift vouchers purchased as gifts",
  "List manually created vouchers",
  "Which customers received gift vouchers?",

  // Status & Management
  "Show me inactive gift voucher codes",
  "List cancelled gift voucher transactions",
  "Which vouchers need attention?",
  "Show me vouchers by creation date"
];
```

### Advanced Analysis Questions
```javascript
const ADVANCED_GIFT_VOUCHER_QUESTIONS = [
  "Calculate gift voucher breakage rate",
  "Analyze seasonal gift voucher purchasing trends",
  "Forecast outstanding voucher liability",
  "Compare manual vs. purchased voucher redemption",
  "Identify high-value unredeemed vouchers at risk",
  "Calculate time to redemption for gift vouchers",
  "Analyze gift voucher marketing effectiveness",
  "Track voucher expiration patterns"
];
```

## Data Fields Reference

### Voucher Identification
- `code`: Unique gift voucher code
- `category_name`: Gift voucher category/product name
- `voucher_type`: Type (e.g., "Manually Created", "Purchased")
- `status`: Current status ("Active", "Inactive")

### Financial Data
- `total_amount`: Original purchase amount
- `total_redemption`: Total redemption value available
- `total_redeemed`: Amount already redeemed
- `total_remaining`: Remaining redemption value

### Creation & Purchase Info
- `created_by`: Person who created the voucher
- `created_d_short`: Creation date
- `purchase_transaction_id`: Associated transaction ID
- `purchase_customer_id`: Purchasing customer ID
- `purchase_customer_first_name`: Purchaser first name
- `purchase_customer_last_name`: Purchaser last name
- `purchase_customer_email`: Purchaser email

### Usage & Expiry
- `booking_end_date`: Expiration/end date
- `last_used_d_short`: Last usage date
- `updated_d_short`: Last update date
- `updated_by`: Last person to update

### Gift Information
- `gift_email`: Recipient email (if forwarded)
- `gift_message`: Personal message with gift

### Store Context
- `store`: Store identifier (if applicable)

## Filter Options

### Date Range
- Preset: `"7"`, `"30"`, `"current_month"`
- Custom: `{ "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD" }`

### Type
- `"all_gifts"`: All gift voucher types
- `"by_activity"`: Activity-specific vouchers

### Transaction Status
- `"all"`: All transaction statuses
- `"active"`: Active transactions only
- `"cancelled"`: Cancelled transactions

### Gift Status
- `"all"`: All voucher codes
- `"active_codes"`: Active voucher codes only
- `"inactive_codes"`: Inactive voucher codes only

## Test Checklist

### Functional Tests
- [ ] GET endpoint returns health check
- [ ] POST with valid credentials returns data
- [ ] POST without credentials returns 400
- [ ] POST without payload returns 400
- [ ] Filters by date range correctly
- [ ] Filters by type correctly
- [ ] Filters by transaction_status correctly
- [ ] Filters by gift_status correctly
- [ ] Returns correct data structure
- [ ] Handles API errors gracefully

### Integration Tests
- [ ] Service method calls Resova API
- [ ] Authentication headers are sent
- [ ] Request body is formatted correctly
- [ ] Response is parsed correctly
- [ ] All voucher fields are present
- [ ] Financial calculations are accurate

### QA Validation
- [ ] Response matches Resova Gift Vouchers export
- [ ] All fields present in response
- [ ] Data types match specification
- [ ] Financial totals are correct
- [ ] Status values are accurate

## Common Issues & Troubleshooting

### Issue: 401 Unauthorized
**Solution**: Check that your API key has reporting permissions enabled in Resova.

### Issue: Empty data array
**Solution**: Verify filters. Try `"type": "all_gifts"`, `"transaction_status": "all"`, and `"gift_status": "all"`.

### Issue: Missing redemption values
**Solution**: Check that vouchers have been used. Unused vouchers will show `total_redeemed: "0.00"`.

### Issue: "N/A" values in customer fields
**Solution**: This is normal for manually created vouchers that weren't purchased through a transaction.

## Use Cases

### 1. Financial Reporting
Track outstanding gift voucher liability for accounting purposes:
```javascript
// Calculate total unredeemed value
const totalLiability = giftVouchers.reduce((sum, v) =>
  sum + parseFloat(v.total_remaining), 0
);
```

### 2. Expiry Management
Identify vouchers approaching expiration:
```javascript
// Filter vouchers expiring soon
const expiringSoon = giftVouchers.filter(v => {
  const expiryDate = new Date(v.booking_end_date);
  const daysUntilExpiry = (expiryDate - new Date()) / (1000 * 60 * 60 * 24);
  return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
});
```

### 3. Marketing Analysis
Analyze gift voucher purchase patterns:
```javascript
// Group by voucher type
const byType = giftVouchers.reduce((acc, v) => {
  acc[v.voucher_type] = (acc[v.voucher_type] || 0) + 1;
  return acc;
}, {});
```

### 4. Breakage Analysis
Calculate voucher breakage (unredeemed revenue):
```javascript
// Calculate breakage percentage
const totalPurchased = giftVouchers.reduce((sum, v) =>
  sum + parseFloat(v.total_redemption), 0
);
const totalRedeemed = giftVouchers.reduce((sum, v) =>
  sum + parseFloat(v.total_redeemed), 0
);
const breakageRate = ((totalPurchased - totalRedeemed) / totalPurchased) * 100;
```

## Performance Considerations

- Default timeout: 30 seconds
- Large datasets: Consider date range filtering
- Cache strategy: Cache results for 5-15 minutes
- Rate limiting: Follow Resova API rate limits

## Security & Compliance Notes

- API keys should never be committed to version control
- Gift voucher codes are sensitive - handle with care
- Comply with accounting standards for liability reporting
- Log all access for audit trails
- Consider data encryption for financial data
- Track voucher access for fraud prevention

## Next Steps

1. Run manual tests with cURL
2. Validate response format matches Resova export
3. Add automated tests to CI/CD pipeline
4. Implement financial reporting dashboards
5. Set up expiry notifications
6. Add voucher usage analytics
7. Implement breakage rate tracking
