# Extras Reporting API - Documentation & Testing Guide

## Overview
The Extras Reporting API provides access to add-on/extras sales data from Resova, including stock levels, booking counts, and revenue information.

## API Endpoint

### POST `/api/reporting/extras`

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
    "extras": "all",  // or comma-separated IDs: "123,456,789"
    "transaction_status": "active"  // or "all", "cancelled"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "name": "Extra Item Name",
      "description": "Description of the extra",
      "stock": 100,
      "used_stock": 25,
      "min_quantity": 1,
      "max_quantity": 10,
      "default_quantity": 1,
      "single_price": "15.00",
      "total_bookings": 50,
      "total_sales": "750.00",
      "status_label": "Active",
      "created_d_short": "2024-01-15",
      "created_t_short": "10:30",
      "created_by": "Admin User",
      "updated_d_short": "2024-11-13",
      "store": {...}
    }
  ],
  "count": 1
}
```

## Manual Testing Examples

### 1. Test with cURL

#### Get all active extras for last 30 days:
```bash
curl -X POST http://localhost:3002/api/reporting/extras \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "your-api-key",
      "storeUrl": "https://your-store.resova.com"
    },
    "payload": {
      "date_range": { "range": "30" },
      "extras": "all",
      "transaction_status": "active"
    }
  }'
```

#### Get specific extras by ID:
```bash
curl -X POST http://localhost:3002/api/reporting/extras \
  -H "Content-Type": application/json" \
  -d '{
    "credentials": {
      "apiKey": "your-api-key",
      "storeUrl": "https://your-store.resova.com"
    },
    "payload": {
      "date_range": { "range": "7" },
      "extras": "123,456,789"
    }
  }'
```

#### Get all extras with custom date range:
```bash
curl -X POST http://localhost:3002/api/reporting/extras \
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
      "extras": "all",
      "transaction_status": "all"
    }
  }'
```

#### Health check:
```bash
curl http://localhost:3002/api/reporting/extras
```

Expected response:
```json
{
  "success": true,
  "message": "Extras Reporting API is running",
  "version": "1.0.0",
  "endpoint": "/api/reporting/extras"
}
```

### 2. Test with Postman

1. **Import Collection**: Create a new POST request
2. **URL**: `http://localhost:3002/api/reporting/extras`
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
    "extras": "all",
    "transaction_status": "active"
  }
}
```

### 3. Test with JavaScript/Fetch

```javascript
async function getExtrasData() {
  try {
    const response = await fetch('http://localhost:3002/api/reporting/extras', {
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
          extras: 'all',
          transaction_status: 'active'
        }
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log(`Found ${data.count} extras`);
      console.log(data.data);
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

getExtrasData();
```

## AI Assistant Questions

Add these questions to test the Extras API integration with the AI assistant:

### Basic Extras Questions
```javascript
const EXTRAS_QUESTIONS = [
  // Inventory & Stock
  "What extras do we offer?",
  "Show me all our add-ons and extras",
  "Which extras are running low on stock?",
  "What's the current stock level for each extra?",
  "List extras with less than 10 items in stock",

  // Sales Performance
  "Which extras generate the most revenue?",
  "What are our top 5 best-selling extras?",
  "Show me extras sales for the last 30 days",
  "Compare extras revenue this month vs last month",
  "Which extras have the highest profit margin?",

  // Booking Insights
  "How many times was each extra booked?",
  "What's the average order quantity for extras?",
  "Which extras are never purchased?",
  "Show me extras with the most bookings",

  // Pricing & Strategy
  "What's the price range for our extras?",
  "Which extras should we promote more?",
  "Identify underperforming extras",
  "What extras pair well together?",

  // Operational
  "Do we need to restock any extras?",
  "Which extras have stock alerts?",
  "Show me inactive or cancelled extras",
  "What extras were created this month?"
];
```

### Advanced Analysis Questions
```javascript
const ADVANCED_EXTRAS_QUESTIONS = [
  "Calculate the attachment rate for extras on bookings",
  "What's the average revenue per extra sold?",
  "Forecast stock depletion for top 3 extras",
  "Identify seasonal trends in extras purchases",
  "Which extras have the best conversion rate?",
  "Analyze extras bundling opportunities",
  "Compare extras performance by customer segment"
];
```

## Focus Area Card for UI

Add this to the `FOCUS_AREAS` array in [DarkAiAssistant.tsx](app/components/DarkAiAssistant.tsx#L19-L75):

```javascript
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

// Add to FOCUS_AREAS array:
{
  id: 'inventory',
  icon: ShoppingBagIcon,
  iconColor: 'text-orange-400',
  label: 'Inventory & Extras',
  questions: [
    "What extras are we currently offering?",
    "Which extras generate the most revenue?",
    "Show me stock levels for all extras"
  ]
}
```

### Updated Color Map
Add orange color to the colorMap in DarkAiAssistant.tsx:

```javascript
const colorMap: Record<string, string> = {
  'text-green-400': '#4ade80',
  'text-yellow-400': '#facc15',
  'text-gray-400': '#9ca3af',
  'text-blue-400': '#60a5fa',
  'text-purple-400': '#c084fc',
  'text-orange-400': '#fb923c'  // Add this line
};
```

## Automated Test Suite

### Jest/Vitest Test Example

Create `__tests__/api/reporting/extras.test.ts`:

```typescript
import { POST, GET } from '@/app/api/reporting/extras/route';
import { ResovaReportingService } from '@/app/lib/services/resova-reporting-service';

// Mock the service
jest.mock('@/app/lib/services/resova-reporting-service');

describe('/api/reporting/extras', () => {
  const mockCredentials = {
    apiKey: 'test-api-key',
    storeUrl: 'https://test.resova.com'
  };

  const mockExtrasData = [
    {
      id: 1,
      name: 'Photography Package',
      description: 'Professional photo package',
      stock: 100,
      used_stock: 25,
      min_quantity: 1,
      max_quantity: 5,
      default_quantity: 1,
      single_price: '50.00',
      total_bookings: 30,
      total_sales: '1500.00',
      status_label: 'Active',
      created_d_short: '2024-01-15',
      created_t_short: '10:30',
      created_by: 'Admin',
      updated_d_short: '2024-11-13',
      store: {}
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/reporting/extras', () => {
    it('should return health check response', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.message).toBe('Extras Reporting API is running');
      expect(data.version).toBe('1.0.0');
    });
  });

  describe('POST /api/reporting/extras', () => {
    it('should return extras data successfully', async () => {
      const mockGetExtras = jest.fn().mockResolvedValue(mockExtrasData);
      (ResovaReportingService as jest.Mock).mockImplementation(() => ({
        getExtras: mockGetExtras
      }));

      const request = new Request('http://localhost:3002/api/reporting/extras', {
        method: 'POST',
        body: JSON.stringify({
          credentials: mockCredentials,
          payload: {
            date_range: { range: '30' },
            extras: 'all',
            transaction_status: 'active'
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.count).toBe(1);
      expect(data.data).toEqual(mockExtrasData);
      expect(mockGetExtras).toHaveBeenCalledWith({
        date_range: { range: '30' },
        extras: 'all',
        transaction_status: 'active'
      });
    });

    it('should return 400 if credentials are missing', async () => {
      const request = new Request('http://localhost:3002/api/reporting/extras', {
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

    it('should return 400 if payload is missing', async () => {
      const request = new Request('http://localhost:3002/api/reporting/extras', {
        method: 'POST',
        body: JSON.stringify({
          credentials: mockCredentials
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Payload with date_range is required');
    });

    it('should handle API errors gracefully', async () => {
      const mockGetExtras = jest.fn().mockRejectedValue(
        new Error('API Error: Invalid API key')
      );
      (ResovaReportingService as jest.Mock).mockImplementation(() => ({
        getExtras: mockGetExtras
      }));

      const request = new Request('http://localhost:3002/api/reporting/extras', {
        method: 'POST',
        body: JSON.stringify({
          credentials: mockCredentials,
          payload: {
            date_range: { range: '30' }
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
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
- [ ] Filters by extras IDs correctly
- [ ] Filters by transaction status correctly
- [ ] Handles API errors gracefully
- [ ] Handles network errors gracefully
- [ ] Returns correct data structure

### Integration Tests
- [ ] Service method calls Resova API
- [ ] Authentication headers are sent
- [ ] Request body is formatted correctly
- [ ] Response is parsed correctly
- [ ] Timeout handling works
- [ ] Error handling works

### QA Validation
- [ ] Response matches Resova Extras export format
- [ ] All fields are present in response
- [ ] Data types match specification
- [ ] Stock calculations are accurate
- [ ] Sales totals are correct

## Common Issues & Troubleshooting

### Issue: 401 Unauthorized
**Solution**: Check that your API key has reporting permissions enabled in Resova.

### Issue: Empty data array
**Solution**: Verify the date range and filters. Try `"extras": "all"` and `"transaction_status": "all"`.

### Issue: Timeout errors
**Solution**: Check network connection. The default timeout is 30 seconds.

### Issue: Wrong stock levels
**Solution**: Ensure you're using the correct `transaction_status` filter. Use "all" to see complete picture.

## Performance Considerations

- Default timeout: 30 seconds
- Recommended page size: No pagination currently (returns all matching extras)
- Cache strategy: Consider caching results for 5-15 minutes
- Rate limiting: Follow Resova API rate limits

## Security Notes

- API keys should never be committed to version control
- Use environment variables for credentials
- Implement request validation
- Consider IP whitelisting for production
- Log all API access for audit trails

## Next Steps

1. Run manual tests with cURL
2. Validate response format matches Resova export
3. Add automated tests to CI/CD pipeline
4. Implement caching layer
5. Add monitoring and alerting
6. Document any custom fields or transformations
