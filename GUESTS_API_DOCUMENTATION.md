# Guests Reporting API - Documentation & Testing Guide

## Overview
The Guests Reporting API provides access to guest data from Resova, including booking history, transaction totals, contact information, and waiver details.

## API Endpoint

### POST `/api/reporting/guests`

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
    "type": "by_date_attended",  // or "by_date_purchased"
    "items": "all"  // or comma-separated item IDs: "123,456,789"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "store": "Resova Demo",
      "id": 119,
      "created_d_short": "11/10/2025",
      "created_t_short": "2:36pm",
      "first_name": "David",
      "last_name": "Onestinghel",
      "full_address": "7587 E. Moonridge lane, Anaheim",
      "county": "CA",
      "postcode": "92808",
      "country": null,
      "email": "donestinghel@clubspeed.com",
      "dob": "05/29/1970",
      "telephone_sms": null,
      "mobile_sms": "+17142690380",
      "mailchimp_subscribed": true,
      "mailchimp_added": true,
      "transactions_total": 2,
      "bookings_total": 2,
      "bookings_value": "380.54",
      "extras_total": 3,
      "extras_value": "58.00",
      "gift_vouchers_total": 0,
      "gift_vouchers_value": "0.00",
      "additional_total": 0,
      "additional_value": "0.00",
      "total_sales": "380.54",
      "payments_total": 2,
      "paid_total": "0.00",
      "due_total": "380.54",
      "overpaid_total": "0.00",
      "credits_total": "0.00",
      "credits_remaining_total": "0.00",
      "waiver_signed": "Signed",
      "signee_first_name": "David",
      "signee_last_name": "Onestinghel",
      "signee_address": "",
      "signee_county": "",
      "signee_postcode": "",
      "signee_country": null,
      "signee_email": "donestinghel@clubspeed.com",
      "signee_telephone": "",
      "signee_mobile": "",
      "last_attended": "11/10/2025",
      "last_item_booked": "Paintball Adventure",
      "custom_fields": {
        "2": "",
        "3": ""
      },
      "signee_fields": {
        "1": "",
        "2": "Online Ad",
        "3": ""
      }
    }
  ],
  "count": 1
}
```

## Manual Testing Examples

### 1. Test with cURL

#### Get all guests who attended in last 30 days:
```bash
curl -X POST http://localhost:3000/api/reporting/guests \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "your-api-key",
      "storeUrl": "https://your-store.resova.com"
    },
    "payload": {
      "date_range": { "range": "30" },
      "type": "by_date_attended",
      "items": "all"
    }
  }'
```

#### Get guests by purchase date:
```bash
curl -X POST http://localhost:3000/api/reporting/guests \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "your-api-key",
      "storeUrl": "https://your-store.resova.com"
    },
    "payload": {
      "date_range": { "range": "30" },
      "type": "by_date_purchased",
      "items": "all"
    }
  }'
```

#### Get guests for specific items:
```bash
curl -X POST http://localhost:3000/api/reporting/guests \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "your-api-key",
      "storeUrl": "https://your-store.resova.com"
    },
    "payload": {
      "date_range": { "range": "7" },
      "type": "by_date_attended",
      "items": "123,456,789"
    }
  }'
```

#### Get guests with custom date range:
```bash
curl -X POST http://localhost:3000/api/reporting/guests \
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
      "type": "by_date_attended",
      "items": "all"
    }
  }'
```

#### Health check:
```bash
curl http://localhost:3000/api/reporting/guests
```

Expected response:
```json
{
  "success": true,
  "message": "Guests Reporting API is running",
  "version": "1.0.0",
  "endpoint": "/api/reporting/guests"
}
```

### 2. Test with Postman

1. **Import Collection**: Create a new POST request
2. **URL**: `http://localhost:3000/api/reporting/guests`
3. **Headers**:
   - `Content-Type`: `application/json`
4. **Body** (raw JSON):
```json
{
  "credentials": {
    "apiKey": "{{RESOVA_API_KEY}}",
    "storeUrl": "{{RESOVA_STORE_URL}}"
  },
  "payload": {
    "date_range": { "range": "30" },
    "type": "by_date_attended",
    "items": "all"
  }
}
```

### 3. Test with JavaScript/Fetch

```javascript
async function getGuestsData() {
  try {
    const response = await fetch('http://localhost:3000/api/reporting/guests', {
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
          type: 'by_date_attended',
          items: 'all'
        }
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log(`Found ${data.count} guests`);
      console.log(data.data);
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

getGuestsData();
```

## AI Assistant Questions

Add these questions to test the Guests API integration with the AI assistant:

### Basic Guest Questions
```javascript
const GUEST_QUESTIONS = [
  // Guest Lists & Segmentation
  "Show me all our guests from the last 30 days",
  "Who are our top 10 highest spending customers?",
  "List all guests who attended this month",
  "Show me guests who made purchases recently",
  "Which guests have never returned?",

  // Financial Analysis
  "What's the total lifetime value of all guests?",
  "Show me guests with outstanding balances",
  "Which guests have spent over $500?",
  "List guests with credits remaining",
  "Who are our VIP customers by revenue?",

  // Booking Behavior
  "Which guests have the most bookings?",
  "Show me guests who purchased extras",
  "List guests who only booked once",
  "Which guests attended specific activities?",
  "Who booked but never showed up?",

  // Contact & Communication
  "Show me all guests subscribed to marketing",
  "List guests by location/state",
  "Which guests haven't been contacted recently?",
  "Show me guests who signed waivers",
  "List guests with missing contact information",

  // Customer Retention
  "Which customers haven't visited in 90 days?",
  "Show me repeat customers from this year",
  "List first-time guests this month",
  "Who are our most loyal customers?",
  "Identify customers at risk of churning"
];
```

### Advanced Analysis Questions
```javascript
const ADVANCED_GUEST_QUESTIONS = [
  "Calculate customer lifetime value by segment",
  "Analyze guest retention rates over time",
  "What's the average spend per guest visit?",
  "Identify patterns in high-value customer behavior",
  "Compare new vs. returning customer metrics",
  "Forecast customer churn risk",
  "Segment customers by booking frequency",
  "Analyze geographic distribution of guests",
  "Calculate net promoter score trends",
  "Identify cross-sell opportunities by guest profile"
];
```

## Data Fields Reference

### Personal Information
- `id`: Unique guest identifier
- `first_name`, `last_name`: Guest name
- `full_address`, `county`, `postcode`, `country`: Contact address
- `email`: Email address
- `telephone_sms`, `mobile_sms`: Phone numbers
- `dob`: Date of birth

### Booking & Transaction Summary
- `transactions_total`: Total number of transactions
- `bookings_total`: Total number of bookings
- `bookings_value`: Total value of all bookings
- `extras_total`: Number of extras purchased
- `extras_value`: Total value of extras
- `gift_vouchers_total`: Number of gift vouchers
- `gift_vouchers_value`: Total gift voucher value
- `total_sales`: Combined total sales

### Financial Status
- `payments_total`: Total number of payments
- `paid_total`: Total amount paid
- `due_total`: Total amount due/unpaid
- `overpaid_total`: Total amount overpaid
- `credits_total`: Total credits issued
- `credits_remaining_total`: Remaining credit balance

### Activity & Engagement
- `last_attended`: Date of last attendance
- `last_item_booked`: Name of last item/activity booked
- `mailchimp_subscribed`: Marketing subscription status
- `mailchimp_added`: Added to mailing list

### Waiver Information
- `waiver_signed`: Waiver signature status
- `signee_first_name`, `signee_last_name`: Waiver signee name
- `signee_address`, `signee_county`, `signee_postcode`, `signee_country`: Signee address
- `signee_email`, `signee_telephone`, `signee_mobile`: Signee contact

### Custom Data
- `custom_fields`: Object containing custom field values
- `signee_fields`: Object containing waiver custom fields

## Automated Test Suite

### Jest/Vitest Test Example

Create `__tests__/api/reporting/guests.test.ts`:

```typescript
import { POST, GET } from '@/app/api/reporting/guests/route';
import { ResovaReportingService } from '@/app/lib/services/resova-reporting-service';

// Mock the service
jest.mock('@/app/lib/services/resova-reporting-service');

describe('/api/reporting/guests', () => {
  const mockCredentials = {
    apiKey: 'test-api-key',
    storeUrl: 'https://test.resova.com'
  };

  const mockGuestsData = [
    {
      store: 'Test Store',
      id: 119,
      created_d_short: '11/10/2025',
      created_t_short: '2:36pm',
      first_name: 'John',
      last_name: 'Doe',
      full_address: '123 Main St',
      county: 'CA',
      postcode: '12345',
      country: 'USA',
      email: 'john@example.com',
      dob: '01/01/1990',
      telephone_sms: null,
      mobile_sms: '+1234567890',
      mailchimp_subscribed: true,
      mailchimp_added: true,
      transactions_total: 5,
      bookings_total: 5,
      bookings_value: '500.00',
      extras_total: 2,
      extras_value: '50.00',
      gift_vouchers_total: 0,
      gift_vouchers_value: '0.00',
      additional_total: 0,
      additional_value: '0.00',
      total_sales: '550.00',
      payments_total: 5,
      paid_total: '550.00',
      due_total: '0.00',
      overpaid_total: '0.00',
      credits_total: '0.00',
      credits_remaining_total: '0.00',
      waiver_signed: 'Signed',
      signee_first_name: 'John',
      signee_last_name: 'Doe',
      signee_address: '',
      signee_county: '',
      signee_postcode: '',
      signee_country: null,
      signee_email: 'john@example.com',
      signee_telephone: '',
      signee_mobile: '',
      last_attended: '11/10/2025',
      last_item_booked: 'Adventure Activity',
      custom_fields: {},
      signee_fields: {}
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/reporting/guests', () => {
    it('should return health check response', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.message).toBe('Guests Reporting API is running');
      expect(data.version).toBe('1.0.0');
    });
  });

  describe('POST /api/reporting/guests', () => {
    it('should return guests data successfully', async () => {
      const mockGetGuests = jest.fn().mockResolvedValue(mockGuestsData);
      (ResovaReportingService as jest.Mock).mockImplementation(() => ({
        getGuests: mockGetGuests
      }));

      const request = new Request('http://localhost:3000/api/reporting/guests', {
        method: 'POST',
        body: JSON.stringify({
          credentials: mockCredentials,
          payload: {
            date_range: { range: '30' },
            type: 'by_date_attended',
            items: 'all'
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.count).toBe(1);
      expect(data.data).toEqual(mockGuestsData);
      expect(mockGetGuests).toHaveBeenCalledWith({
        date_range: { range: '30' },
        type: 'by_date_attended',
        items: 'all'
      });
    });

    it('should return 400 if credentials are missing', async () => {
      const request = new Request('http://localhost:3000/api/reporting/guests', {
        method: 'POST',
        body: JSON.stringify({
          payload: {
            date_range: { range: '30' }
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Credentials are required');
    });

    it('should filter by type correctly', async () => {
      const mockGetGuests = jest.fn().mockResolvedValue(mockGuestsData);
      (ResovaReportingService as jest.Mock).mockImplementation(() => ({
        getGuests: mockGetGuests
      }));

      const request = new Request('http://localhost:3000/api/reporting/guests', {
        method: 'POST',
        body: JSON.stringify({
          credentials: mockCredentials,
          payload: {
            date_range: { range: '7' },
            type: 'by_date_purchased',
            items: 'all'
          }
        })
      });

      const response = await POST(request);
      await response.json();

      expect(mockGetGuests).toHaveBeenCalledWith({
        date_range: { range: '7' },
        type: 'by_date_purchased',
        items: 'all'
      });
    });
  });
});
```

## Test Checklist

### Functional Tests
- [ ] GET endpoint returns health check
- [ ] POST with valid credentials returns data
- [ ] POST without credentials returns 400
- [ ] POST without payload returns 400
- [ ] Filters by date range correctly
- [ ] Filters by type (attended vs purchased) correctly
- [ ] Filters by specific items correctly
- [ ] Handles API errors gracefully
- [ ] Handles network errors gracefully
- [ ] Returns correct data structure

### Integration Tests
- [ ] Service method calls Resova API
- [ ] Authentication headers are sent
- [ ] Request body is formatted correctly
- [ ] Response is parsed correctly
- [ ] All guest fields are present
- [ ] Custom fields are handled correctly

### QA Validation
- [ ] Response matches Resova Guests export format
- [ ] All fields are present in response
- [ ] Data types match specification
- [ ] Financial totals are accurate
- [ ] Date formats are consistent
- [ ] Custom fields structure is correct

## Common Issues & Troubleshooting

### Issue: 401 Unauthorized
**Solution**: Check that your API key has reporting permissions enabled in Resova.

### Issue: Empty data array
**Solution**: Verify the date range and filters. Try `"type": "by_date_purchased"` and `"items": "all"`.

### Issue: Missing custom fields
**Solution**: Custom fields are dynamic and vary by account. Check your Resova settings for configured fields.

### Issue: Timeout errors
**Solution**: Large guest lists may take longer. Consider narrowing the date range or filtering by specific items.

## Performance Considerations

- Default timeout: 30 seconds
- Large datasets: Consider pagination in future versions
- Cache strategy: Consider caching results for 5-15 minutes
- Rate limiting: Follow Resova API rate limits

## Security & Privacy Notes

- API keys should never be committed to version control
- Guest data contains PII - handle with care
- Comply with GDPR/privacy regulations
- Implement request validation
- Log access for audit trails
- Consider data encryption at rest and in transit

## Next Steps

1. Run manual tests with cURL
2. Validate response format matches Resova export
3. Add automated tests to CI/CD pipeline
4. Implement data caching
5. Add monitoring and alerting
6. Consider implementing pagination for large datasets
7. Add export functionality (CSV, Excel)
