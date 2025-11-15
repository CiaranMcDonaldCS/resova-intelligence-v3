# API Documentation

## Overview

Resova Intelligence integrates with two main API categories:

1. **Resova Reporting APIs** - Transaction, revenue, booking, and payment data
2. **Resova Core APIs** - Items, customers, gift vouchers, and availability data

All APIs use `X-API-KEY` header authentication.

## Base URLs

- **US Region**: `https://api.resova.us/v1`
- **EU Region**: `https://api.resova.eu/v1`
- **IO Region**: `https://api.resova.io/v1` (default)

## Authentication

### Headers

All requests must include:

```http
X-API-KEY: your-resova-api-key
Accept: application/json
Content-Type: application/json
```

### Example Request

```typescript
const response = await fetch('https://api.resova.io/v1/reporting/transactions', {
  method: 'GET',
  headers: {
    'X-API-KEY': 'your-api-key-here',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});
```

---

## Reporting APIs

### 1. Transactions API

**Endpoint**: `GET /v1/reporting/transactions`

**Description**: Retrieve transaction history with bookings, customers, and payments

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number for pagination |
| `limit` | number | No | Items per page (max 100) |
| `skip` | number | No | Number of items to skip |
| `created_before` | number | No | UNIX timestamp filter |
| `created_after` | number | No | UNIX timestamp filter |
| `booking_before` | number | No | UNIX timestamp filter |
| `booking_after` | number | No | UNIX timestamp filter |
| `range` | string | No | Date range preset (see Date Ranges) |
| `start_date` | string | No | Start date (Y-m-d format) |
| `end_date` | string | No | End date (Y-m-d format) |
| `date_field` | string | No | `created_at` or `updated_at` |
| `date_precise` | number | No | `0` or `1` |

**Response**:

```typescript
{
  data: ResovaTransaction[],
  overall_total: number,
  total: number,
  current_page: number,
  last_page: number
}
```

**Transaction Object**:

```typescript
{
  id: number,
  reference: string,
  price: string,
  discount: string,
  fee: string,
  tax: string,
  gross_total: string,
  total: string,
  gift_paid: string,
  paid: string,
  refunded: string,
  due: string,
  overpaid: string,
  tip: string,
  inital_payment_type: string,
  status: boolean,
  payment_completed_at: string,
  created_dt: string,
  updated_dt: string,
  bookings: ResovaBooking[],
  customer: ResovaCustomer,
  payments: ResovaPayment[],
  extras: any[],
  purchases: any[],
  promotions: any[]
}
```

### 2. Itemized Revenue API

**Endpoint**: `POST /v1/reporting/transactions/sales/itemizedRevenues`

**Description**: Get detailed revenue breakdown by item

**Request Body**:

```json
{
  "date_range": {
    "range": "30"
  }
}
```

**Response**:

```typescript
ResovaItemizedRevenue[]
```

**Itemized Revenue Object**:

```typescript
{
  transaction_id: number,
  transaction_status: string,
  transaction_due: string,
  transaction_due_value: string,
  customer_first_name: string,
  customer_last_name: string,
  customer_email: string,
  id: number,
  status: string,
  inventory_type: string,
  item_name: string,
  date_short: string,
  time: string,
  total_quantity: number,
  price: string,
  discount_codes_value: string,
  gift_codes_value: string,
  total_net: string,
  gratuity: string,
  total_taxes: string,
  total_custom_fees: string,
  booking_total: string,
  source: string
}
```

### 3. All Bookings API

**Endpoint**: `POST /v1/reporting/transactions/bookings/allBookings`

**Description**: Retrieve comprehensive booking data

**Request Body**:

```json
{
  "type": "all",
  "date_range": {
    "range": "30"
  }
}
```

**Type Options**:
- `all` - All bookings
- `dates` - Group by dates
- `days_of_week` - Group by day of week
- `discounts` - Include discount data
- `discount_groups` - Group by discount

**Response**:

```typescript
ResovaAllBooking[]
```

**All Booking Object**:

```typescript
{
  transaction_id: number,
  transaction_status: string,
  transaction_due: string,
  customer_first_name: string,
  customer_last_name: string,
  customer_email: string,
  id: number,
  status: string,
  item_name: string,
  date_short: string,
  time: string,
  total_quantity: number,
  price: string,
  booking_total: string,
  waiver_signed: string,
  source: string
}
```

### 4. All Payments API

**Endpoint**: `POST /v1/reporting/transactions/payments/allPayments`

**Description**: Get payment processing details

**Request Body**:

```json
{
  "type": "all",
  "date_range": {
    "range": "30"
  }
}
```

**Type Options**:
- `all` - All payments
- `activity` - Payment activity data
- `revenue` - Revenue-focused data

**Response**:

```typescript
ResovaAllPayment[]
```

**All Payment Object**:

```typescript
{
  transaction_id: number,
  transaction_status: string,
  transaction_payment_status: string,
  transaction_total: string,
  transaction_paid: string,
  transaction_due: string,
  cardholder: string,
  customer_email: string,
  created_d_short: string,
  created_t_short: string,
  payment_type: string,
  label: string,
  amount: string,
  refunded: string,
  remaining: string,
  gateway_transaction_id: string
}
```

---

## Core APIs

### 5. Items API

**Endpoint**: `GET /v1/items`

**Description**: Retrieve all services/products offered

**Parameters**: None

**Response**:

```typescript
{
  data: ResovaItem[]
}
```

**Item Object**:

```typescript
{
  id: number,
  name: string,
  slug: string,
  description: string,
  short_description: string,
  duration: number,
  max_capacity: number,
  min_capacity: number,
  pricing_type: string,
  featured_image: string,
  gallery: string[],
  status: string,
  categories: Array<{
    id: number,
    name: string
  }>,
  pricing_categories: Array<{
    id: number,
    name: string,
    price: string,
    min_quantity: number,
    max_quantity: number
  }>
}
```

**Get Single Item**:

**Endpoint**: `GET /v1/items/{id}`

Returns single `ResovaItem` object.

### 6. Gift Vouchers API

**Endpoint**: `GET /v1/gift-vouchers`

**Description**: Retrieve all gift vouchers (active and redeemed)

**Parameters**: None

**Response**:

```typescript
{
  data: ResovaGiftVoucher[]
}
```

**Gift Voucher Object**:

```typescript
{
  id: number,
  code: string,
  amount: string,
  balance: string,
  status: string,
  expires_at: string,
  recipient_name: string,
  recipient_email: string,
  purchaser_name: string,
  purchaser_email: string,
  created_at: string,
  redeemed_at: string | null
}
```

**Get Single Voucher**:

**Endpoint**: `GET /v1/gift-vouchers/{id}`

Returns single `ResovaGiftVoucher` object.

### 7. Customers API

**Endpoint**: `GET /v1/customers/{id}`

**Description**: Retrieve customer details and history

**Parameters**:
- `id` (required) - Customer ID

**Response**:

```typescript
{
  id: number,
  reference: string,
  first_name: string,
  last_name: string,
  name: string,
  email: string,
  mobile: string,
  telephone: string,
  address: string,
  city: string,
  postcode: string,
  country: string,
  created_at: string,
  updated_at: string,
  total_bookings: number,
  total_spent: string,
  last_booking_date: string,
  tags: string[]
}
```

### 8. Availability API

**Endpoint**: `GET /v1/availability/daily`

**Description**: Get daily availability for an item

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `item_id` | number | Yes | Item/service ID |
| `date` | string | Yes | Date (Y-m-d format) |

**Response**:

```typescript
{
  date: string,
  available: boolean,
  capacity: number,
  booked: number,
  remaining: number,
  instances: Array<{
    id: number,
    start_time: string,
    end_time: string,
    available: boolean,
    capacity: number,
    booked: number
  }>
}
```

---

## Date Ranges

All Reporting APIs support date range filters:

### Range Presets

| Value | Description |
|-------|-------------|
| `today` | Today only |
| `yesterday` | Yesterday only |
| `1` | Last 1 day |
| `7` | Last 7 days |
| `30` | Last 30 days |
| `90` | Last 90 days |
| `current_week` | Current week (Mon-Sun) |
| `previous_week` | Previous week |
| `current_month` | Current month |
| `previous_month` | Previous month |
| `current_quarter` | Current quarter |
| `previous_quarter` | Previous quarter |

### Date Range Object

```typescript
{
  range?: '1' | 'yesterday' | 'today' | 'current_week' | 'previous_week' | '7' |
         'current_month' | 'previous_month' | '30' | 'current_quarter' |
         'previous_quarter' | '90',
  start_date?: string,  // Y-m-d format
  end_date?: string     // Y-m-d format
}
```

**Example**:

```json
{
  "date_range": {
    "range": "30"
  }
}
```

**Or custom range**:

```json
{
  "date_range": {
    "start_date": "2025-01-01",
    "end_date": "2025-01-31"
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `400` | Bad Request - Invalid parameters |
| `401` | Unauthorized - Invalid API key |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `429` | Too Many Requests - Rate limited |
| `500` | Internal Server Error |
| `503` | Service Unavailable |

### Error Response Format

```json
{
  "error": "Error message",
  "status": 400,
  "details": "Additional error details"
}
```

### Handling Errors

```typescript
try {
  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  return await response.json();
} catch (error) {
  console.error('API request failed:', error);
  throw error;
}
```

---

## Rate Limiting

- Default: 100 requests per minute per API key
- Headers included in response:
  - `X-RateLimit-Limit` - Total requests allowed
  - `X-RateLimit-Remaining` - Requests remaining
  - `X-RateLimit-Reset` - Unix timestamp when limit resets

### Best Practices

1. **Cache responses** when appropriate
2. **Batch requests** using parallel fetching (Promise.all)
3. **Implement exponential backoff** for retries
4. **Monitor rate limit headers**
5. **Use pagination** for large datasets

---

## Code Examples

### Fetching Transactions

```typescript
import { ResovaReportingService } from './services/resova-reporting-service';

const service = new ResovaReportingService({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.resova.io/v1',
  timeout: 30000
});

// Get last 100 transactions
const transactions = await service.getTransactions({
  limit: 100,
  date_field: 'created_at'
});

console.log(`Fetched ${transactions.data.length} transactions`);
```

### Fetching with Date Range

```typescript
const itemizedRevenue = await service.getItemizedRevenue({
  date_range: {
    range: '30'  // Last 30 days
  }
});

console.log(`Revenue data for ${itemizedRevenue.length} items`);
```

### Parallel API Calls

```typescript
const [
  transactions,
  revenue,
  bookings,
  payments
] = await Promise.all([
  service.getTransactions({ limit: 100 }),
  service.getItemizedRevenue({ date_range: { range: '30' } }),
  service.getAllBookings({ type: 'all', date_range: { range: '30' } }),
  service.getAllPayments({ type: 'all', date_range: { range: '30' } })
]);

console.log('All data fetched in parallel');
```

### With Error Handling

```typescript
try {
  const items = await service.getItems();
  console.log(`${items.length} items available`);
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error ${error.statusCode}: ${error.message}`);
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

## TypeScript Types

All TypeScript type definitions are available in `app/lib/services/resova-reporting-service.ts`:

- `ResovaTransaction`
- `ResovaBooking`
- `ResovaCustomer`
- `ResovaPayment`
- `ResovaItemizedRevenue`
- `ResovaAllBooking`
- `ResovaAllPayment`
- `ResovaItem`
- `ResovaGiftVoucher`
- `ResovaCustomerDetail`
- `ResovaAvailability`

Import them as needed:

```typescript
import type {
  ResovaTransaction,
  ResovaItem,
  ResovaGiftVoucher
} from './services/resova-reporting-service';
```

---

## Support

For API issues:

1. Check [Resova Developer Documentation](https://developers.resova.com/)
2. Verify API key has necessary permissions
3. Check API status page
4. Contact Resova support for API-specific issues

For integration issues:

1. Check this documentation
2. Review code examples
3. Check browser console for errors
4. Review network tab in DevTools
