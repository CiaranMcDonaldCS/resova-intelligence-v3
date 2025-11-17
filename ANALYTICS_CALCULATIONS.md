# Resova Intelligence V3 - Analytics Calculations Documentation

## Overview

This document provides comprehensive documentation of all analytics calculations used in the Resova Intelligence V3 application. All calculations are performed by transforming data from the Resova API into analytics metrics displayed in the UI.

---

## Critical Data Model Understanding

### Bookings vs Sales vs Revenue

**BOOKINGS** (Activity Reservations):
- Any reservation for an activity (kayaking, surfing, etc.)
- Always creates a booking record in the system
- `booking_total` includes the activity price + any extras attached to that specific booking
- Examples: Customer books kayaking tour, customer books kayaking + adds drinks to that booking

**STANDALONE SALES** (Non-Booking Purchases):
- Items purchased WITHOUT booking an activity
- Does NOT create a booking record
- Creates a transaction but no booking
- Examples: Customer buys just a voucher, customer buys just a drink at the bar

**Key Metrics Defined**:
1. **Total Bookings** (`count of booking records`) = Number of activity reservations only
2. **Booking Value** (`sum of booking_total`) = Value from activity bookings (including attached extras)
3. **Total Sales** (`sum of transaction.total`) = Booking Value + Standalone Purchases
4. **Gross Revenue** (`sum of transaction.paid`) = Actual money received from ALL sources

**Critical Relationships**:
```
Total Sales ≥ Booking Value
(Total Sales includes standalone purchases that don't create bookings)

Gross Revenue ≤ Total Sales
(Gross Revenue only counts what was actually paid, not unpaid amounts)

Total Bookings ≠ Total Sales
(Bookings count activity reservations; Sales includes items sold without bookings)
```

**Real-World Example**:
```
Saturday Operations:
- 10 kayaking bookings @ $50 each = $500 booking value, 10 bookings
- 3 of those bookings had $10 drinks attached = $530 booking value total, still 10 bookings
- 5 customers bought vouchers at the bar (no activity booking) @ $25 each = $125 standalone sales, 0 bookings
- 2 bookings unpaid ($100 booking value, $0 paid)

Results:
Total Bookings: 10 (activity reservations only)
Booking Value: $530 (kayaking + attached drinks)
Total Sales: $655 ($530 bookings + $125 standalone vouchers)
Gross Revenue: $555 ($530 + $125 - $100 unpaid)
```

---

## Data Flow Architecture

```
Resova API Endpoints → Resova Service → Data Transformers → Analytics Data → UI Components
```

### Primary Services:
- **resova-service.ts**: Main orchestrator for API calls
- **resova-reporting-service.ts**: Handles Resova Reporting API communication
- **resova-data-transformer.ts**: Transforms API data into analytics metrics
- **customer-intelligence-transformer.ts**: Transforms customer/voucher/cart data

---

## Owner's Box Metrics

### 1. Total Revenue (periodSummary.gross)

**Data Source**:
- `/v1/reporting/transactions` (Transactions Reporting API)

**Calculation Formula**:
```javascript
gross = SUM(transactions[i].paid)
```

**Variables**:
- `transactions`: Array of ResovaTransaction objects from Transactions API
- `transactions[i].paid`: String representing amount actually paid/received for transaction i

**Time Period**: Based on selected date range (default: Last 30 days)

**Data Transformations**:
1. Fetch transactions using `getTransactions()` with date range filter
2. Filter by `date_field: 'created_at'`
3. Parse each `paid` field from string to float
4. Sum all paid amounts

**Example Calculation**:
```javascript
// Sample transactions
transactions = [
  { id: 1, paid: "150.00", total: "150.00", ... },
  { id: 2, paid: "200.50", total: "200.50", ... },
  { id: 3, paid: "75.25", total: "100.00", ... } // Partial payment
]

// Calculation
gross = parseFloat("150.00") + parseFloat("200.50") + parseFloat("75.25")
gross = 150.00 + 200.50 + 75.25
gross = 425.75
```

**File Location**: `app/lib/transformers/resova-data-transformer.ts` (lines 321-328)

---

### 2. Revenue Change % (periodSummary.grossChange)

**Data Source**:
- Calculated field (comparison metric)

**Calculation Formula**:
```javascript
grossChange = ((current - previous) / previous) * 100
```

**Variables**:
- `current`: Current period gross revenue
- `previous`: Previous period gross revenue (simulated as `current * 0.9`)

**Time Period**: Compares current period to previous equivalent period

**Data Transformations**:
1. Calculate current period gross revenue
2. Simulate previous period as 90% of current (placeholder)
3. Calculate percentage change using `calculatePercentChange()` helper

**Example Calculation**:
```javascript
// Sample data
current = 425.75
previous = 425.75 * 0.9 = 383.175

// Calculation
grossChange = ((425.75 - 383.175) / 383.175) * 100
grossChange = (42.575 / 383.175) * 100
grossChange = 11.1%
```

**Note**: Currently uses simulated previous period data. Production implementation should fetch actual previous period data from API.

**File Location**: `app/lib/transformers/resova-data-transformer.ts` (lines 357, 725-728)

---

### 3. Today's Bookings (todaysAgenda.bookings)

**Data Source**:
- `/v1/reporting/transactions/bookings/allBookings` (All Bookings Reporting API)

**Calculation Formula**:
```javascript
bookings = COUNT(todaysBookings)
```

**Variables**:
- `todaysBookings`: Array of bookings where `date_short` equals today's date

**Time Period**: Today only (local date, not UTC)

**Data Transformations**:
1. Calculate today's date in `YYYY-MM-DD` format
2. Fetch bookings using `getAllBookings()` with `date_range: { start_date: today, end_date: today }`
3. Count total bookings returned

**Example Calculation**:
```javascript
// Today's date
const today = "2025-11-15"

// API call
todaysBookings = getAllBookings({
  type: 'all',
  date_range: { start_date: "2025-11-15", end_date: "2025-11-15" }
})

// Result
todaysBookings = [
  { id: 101, date_short: "2025-11-15", item_name: "Kayaking", ... },
  { id: 102, date_short: "2025-11-15", item_name: "Surfing", ... },
  { id: 103, date_short: "2025-11-15", item_name: "Kayaking", ... }
]

// Calculation
bookings = todaysBookings.length
bookings = 3
```

**File Location**:
- API Call: `app/lib/services/resova-service.ts` (lines 126-129)
- Transform: `app/lib/transformers/resova-data-transformer.ts` (lines 92-124)

---

### 4. Expected Guests (todaysAgenda.guests)

**Data Source**:
- `/v1/reporting/transactions/bookings/allBookings` (All Bookings Reporting API)

**Calculation Formula**:
```javascript
guests = SUM(todaysBookings[i].total_quantity)
```

**Variables**:
- `todaysBookings`: Array of today's bookings
- `total_quantity`: Number of participants/guests for booking i

**Time Period**: Today only

**Data Transformations**:
1. Filter bookings for today's date
2. Sum `total_quantity` field across all today's bookings

**Example Calculation**:
```javascript
// Sample today's bookings
todaysBookings = [
  { id: 101, total_quantity: 4, item_name: "Kayaking", ... },
  { id: 102, total_quantity: 2, item_name: "Surfing", ... },
  { id: 103, total_quantity: 6, item_name: "Kayaking", ... }
]

// Calculation
guests = 4 + 2 + 6
guests = 12
```

**File Location**: `app/lib/transformers/resova-data-transformer.ts` (lines 98-99)

---

### 5. Capacity % (capacityAnalysis.overall.utilizationPercent)

**Data Source**:
- `/v1/availability/calendar` (Availability Calendar API)

**Calculation Formula**:
```javascript
utilizationPercent = (totalBooked / totalCapacity) * 100
```

**Variables**:
- `totalBooked`: Sum of all booked spots across availability instances
- `totalCapacity`: Sum of all capacity across availability instances

**Time Period**: Based on selected date range (start_date to end_date)

**Data Transformations**:
1. Fetch availability instances using `getAvailabilityCalendar()`
2. Sum `booked` field across all instances → `totalBooked`
3. Sum `capacity` field across all instances → `totalCapacity`
4. Calculate percentage with one decimal place precision

**Example Calculation**:
```javascript
// Sample availability instances
availabilityInstances = [
  { id: 1, item_name: "Kayaking 10AM", capacity: 10, booked: 8, available: 2 },
  { id: 2, item_name: "Kayaking 2PM", capacity: 10, booked: 6, available: 4 },
  { id: 3, item_name: "Surfing 11AM", capacity: 8, booked: 8, available: 0 },
  { id: 4, item_name: "Surfing 3PM", capacity: 8, booked: 4, available: 4 }
]

// Calculation
totalCapacity = 10 + 10 + 8 + 8 = 36
totalBooked = 8 + 6 + 8 + 4 = 26

utilizationPercent = (26 / 36) * 100
utilizationPercent = 72.2%
```

**File Location**: `app/lib/transformers/resova-data-transformer.ts` (lines 1047-1067, 1141)

---

## Financial Health Metrics (Period Summary)

### 6. Net Revenue (periodSummary.net)

**Data Source**:
- `/v1/reporting/transactions`

**Calculation Formula**:
```javascript
net = gross - refunded
```

**Variables**:
- `gross`: Total amount paid (from metric #1)
- `refunded`: Sum of all refunds issued

**Calculation Details**:
```javascript
gross = SUM(transactions[i].paid)
refunded = SUM(transactions[i].refunded)
net = gross - refunded
```

**Example Calculation**:
```javascript
transactions = [
  { paid: "150.00", refunded: "0.00" },
  { paid: "200.50", refunded: "50.00" }, // Partial refund
  { paid: "75.25", refunded: "0.00" }
]

gross = 150.00 + 200.50 + 75.25 = 425.75
refunded = 0.00 + 50.00 + 0.00 = 50.00
net = 425.75 - 50.00 = 375.75
```

**File Location**: `app/lib/transformers/resova-data-transformer.ts` (lines 326-353)

---

### 7. Total Sales (periodSummary.totalSales)

**Data Source**:
- `/v1/reporting/transactions`

**Calculation Formula**:
```javascript
totalSales = SUM(transactions[i].total)
```

**Variables**:
- `transactions[i].total`: Total transaction amount (before payments)

**IMPORTANT - Understanding Total Sales**:

Total Sales represents ALL sales transactions, including:
1. **Activity Bookings**: Reservations for activities (kayaking, surfing, etc.) - these create booking records
2. **Extras Attached to Bookings**: Items added to activity bookings (drinks, vouchers, etc. purchased WITH a booking)
3. **Standalone Item Purchases**: Items sold WITHOUT creating an activity booking (e.g., customer buys just a voucher or drink at the bar)

**Key Distinction**:
- `Total Sales` (`sum of transaction.total`) = Bookings + Standalone Purchases
- `Booking Value` (`sum of booking_total`) = Only from activity bookings (including attached extras)
- `Gross Revenue` (`sum of transaction.paid`) = Actual payments received from ALL sources

**Relationship**:
```
Total Sales ≥ Booking Value
(because Total Sales includes standalone purchases that don't create bookings)

Gross Revenue ≤ Total Sales
(because Gross Revenue only counts what was paid, not what's unpaid)
```

**Example Calculation**:
```javascript
// Scenario: Activity booking + standalone purchase
transactions = [
  { total: "150.00", paid: "150.00", has_booking: true },  // Activity booking (fully paid)
  { total: "200.50", paid: "100.00", has_booking: true },  // Activity booking (partially paid)
  { total: "25.00", paid: "25.00", has_booking: false }    // Standalone voucher purchase (no booking created)
]

totalSales = 150.00 + 200.50 + 25.00 = 375.50  // All transactions
bookingValue = 150.00 + 200.50 = 350.50         // Only bookings
grossRevenue = 150.00 + 100.00 + 25.00 = 275.00 // What was actually paid
```

**File Location**: `app/lib/transformers/resova-data-transformer.ts` (lines 330-333)

---

### 8. Discounts (periodSummary.discounts)

**Data Source**:
- `/v1/reporting/transactions`

**Calculation Formula**:
```javascript
discounts = SUM(transactions[i].discount)
```

**Variables**:
- `transactions[i].discount`: Monetary value of discounts applied to transaction i

**Example Calculation**:
```javascript
transactions = [
  { discount: "15.00" }, // 10% discount
  { discount: "0.00" },  // No discount
  { discount: "7.50" }   // Early bird discount
]

discounts = 15.00 + 0.00 + 7.50 = 22.50
```

**File Location**: `app/lib/transformers/resova-data-transformer.ts` (lines 335-337)

---

### 9. Taxes (periodSummary.taxes)

**Data Source**:
- `/v1/reporting/transactions`

**Calculation Formula**:
```javascript
taxes = SUM(transactions[i].tax)
```

**Example Calculation**:
```javascript
transactions = [
  { tax: "12.00" }, // 8% tax
  { tax: "16.00" },
  { tax: "6.00" }
]

taxes = 12.00 + 16.00 + 6.00 = 34.00
```

**File Location**: `app/lib/transformers/resova-data-transformer.ts` (lines 343-345)

---

### 10. Fees (periodSummary.fees)

**Data Source**:
- `/v1/reporting/transactions`

**Calculation Formula**:
```javascript
fees = SUM(transactions[i].fee)
```

**Note**: Represents service fees or processing fees applied to bookings.

**File Location**: `app/lib/transformers/resova-data-transformer.ts` (lines 347-349)

---

## Revenue Trends

### 11. Daily Revenue Trends (revenueTrends)

**Data Source**:
- `/v1/reporting/transactions/bookings/allBookings`

**Calculation Formula** (per day):
```javascript
// For each unique day in date range:
thisGross = SUM(bookings where date_short == day)[i].booking_total
thisNet = SUM(bookings where date_short == day)[i].price
thisSales = COUNT(bookings where date_short == day)
```

**Variables**:
- `booking_total`: Total booking amount including taxes/fees
- `price`: Base price without taxes/fees
- Date range: Last 7 days of actual data

**Data Transformations**:
1. Extract unique dates from bookings data
2. Filter out invalid dates
3. Sort chronologically and take last 7 days
4. Group bookings by date
5. Sum revenue metrics for each day

**Example Calculation**:
```javascript
// Sample bookings
allBookings = [
  { date_short: "2025-11-13", booking_total: "150.00", price: "130.00" },
  { date_short: "2025-11-13", booking_total: "200.00", price: "175.00" },
  { date_short: "2025-11-14", booking_total: "100.00", price: "85.00" }
]

// Day 1: 2025-11-13
dayBookings_13 = [
  { booking_total: "150.00", price: "130.00" },
  { booking_total: "200.00", price: "175.00" }
]
thisGross_13 = 150.00 + 200.00 = 350.00
thisNet_13 = 130.00 + 175.00 = 305.00
thisSales_13 = 2

// Day 2: 2025-11-14
thisGross_14 = 100.00
thisNet_14 = 85.00
thisSales_14 = 1

// Result
revenueTrends = [
  { day: "Wed", thisGross: 350.00, thisNet: 305.00, thisSales: 2, ... },
  { day: "Thu", thisGross: 100.00, thisNet: 85.00, thisSales: 1, ... }
]
```

**File Location**: `app/lib/transformers/resova-data-transformer.ts` (lines 375-414)

---

## Performance Metrics

### 12. Best Day (performance.bestDay)

**Data Source**:
- `/v1/reporting/transactions/bookings/allBookings`

**Calculation Formula**:
```javascript
// Group by day of week
FOR each booking:
  dayName = getDayName(booking.date_short)
  dayRevenue[dayName] += parseFloat(booking.booking_total)

// Find maximum
bestDay = argmax(dayRevenue)
bestDayRevenue = max(dayRevenue)
```

**Example Calculation**:
```javascript
allBookings = [
  { date_short: "2025-11-11", booking_total: "150.00" }, // Monday
  { date_short: "2025-11-12", booking_total: "200.00" }, // Tuesday
  { date_short: "2025-11-13", booking_total: "100.00" }, // Wednesday
  { date_short: "2025-11-12", booking_total: "250.00" }  // Tuesday
]

// Group by day
dayRevenue = {
  "Monday": 150.00,
  "Tuesday": 200.00 + 250.00 = 450.00,
  "Wednesday": 100.00
}

// Result
bestDay = "Tuesday"
bestDayRevenue = 450.00
```

**File Location**: `app/lib/transformers/resova-data-transformer.ts` (lines 422-450)

---

### 13. Top Item (performance.topItem)

**Data Source**:
- `/v1/reporting/transactions/bookings/allBookings`

**Calculation Formula**:
```javascript
// Count bookings per item
FOR each booking:
  itemCounts[booking.item_name]++

// Find maximum
topItem = argmax(itemCounts)
topItemBookings = max(itemCounts)
```

**Example Calculation**:
```javascript
allBookings = [
  { item_name: "Kayaking" },
  { item_name: "Surfing" },
  { item_name: "Kayaking" },
  { item_name: "Kayaking" },
  { item_name: "Surfing" }
]

itemCounts = {
  "Kayaking": 3,
  "Surfing": 2
}

topItem = "Kayaking"
topItemBookings = 3
```

**File Location**: `app/lib/transformers/resova-data-transformer.ts` (lines 453-459)

---

### 14. Peak Time (performance.peakTime)

**Data Source**:
- `/v1/reporting/transactions/bookings/allBookings`

**Calculation Formula**:
```javascript
// Extract hour from time and count
FOR each booking:
  hour = booking.time.split(':')[0] + ':00'
  hourCounts[hour]++

// Find maximum
peakTime = argmax(hourCounts)
peakTimeBookings = max(hourCounts)
```

**Example Calculation**:
```javascript
allBookings = [
  { time: "10:00" },
  { time: "10:30" },
  { time: "14:00" },
  { time: "10:00" },
  { time: "14:30" }
]

// Group by hour
hourCounts = {
  "10:00": 3,  // 10:00 and 10:30 both count as 10:00
  "14:00": 2   // 14:00 and 14:30 both count as 14:00
}

peakTime = "10:00"
peakTimeBookings = 3
```

**File Location**: `app/lib/transformers/resova-data-transformer.ts` (lines 461-468)

---

## Payment Collection Metrics

### 15. Payment Collection Analysis (paymentCollection)

**Data Source**:
- `/v1/reporting/transactions/payments/allPayments`
- `/v1/reporting/transactions`

**Calculation Formulas**:
```javascript
// Paid Amount
paidAmount = SUM(allPayments[i].amount)

// Unpaid Amount (from unique transactions)
unpaidAmount = SUM(unique(allPayments[i].transaction_due))

// Total Transaction Amount (from unique transactions)
totalTransactionAmount = SUM(unique(allPayments[i].transaction_total))

// Percentages
paidPercent = (paidAmount / totalTransactionAmount) * 100
unpaidPercent = (unpaidAmount / totalTransactionAmount) * 100

// Card vs Cash
cardAmount = SUM(allPayments where label contains 'card')[i].amount
cashAmount = SUM(allPayments where label contains 'cash' OR 'manual')[i].amount

cardPercent = (cardAmount / paidAmount) * 100
cashPercent = (cashAmount / paidAmount) * 100
```

**Data Transformations**:
1. Group payments by transaction_id to avoid double counting
2. Calculate unique transaction totals and due amounts
3. Sum payment amounts by payment type (card/cash)

**Example Calculation**:
```javascript
allPayments = [
  { transaction_id: 1, amount: "150.00", transaction_total: "150.00", transaction_due: "0.00", label: "Credit Card" },
  { transaction_id: 2, amount: "100.00", transaction_total: "200.00", transaction_due: "100.00", label: "Credit Card" },
  { transaction_id: 2, amount: "50.00", transaction_total: "200.00", transaction_due: "50.00", label: "Cash" },
  { transaction_id: 3, amount: "75.00", transaction_total: "75.00", transaction_due: "0.00", label: "Manual" }
]

// Unique transactions
uniqueTransactions = {
  1: { total: 150.00, due: 0.00 },
  2: { total: 200.00, due: 100.00 }, // Use max due amount
  3: { total: 75.00, due: 0.00 }
}

totalTransactionAmount = 150.00 + 200.00 + 75.00 = 425.00
paidAmount = 150.00 + 100.00 + 50.00 + 75.00 = 375.00
unpaidAmount = 100.00

paidPercent = (375.00 / 425.00) * 100 = 88.2%
unpaidPercent = (100.00 / 425.00) * 100 = 23.5%

cardAmount = 150.00 + 100.00 = 250.00
cashAmount = 50.00 + 75.00 = 125.00

cardPercent = (250.00 / 375.00) * 100 = 66.7%
cashPercent = (125.00 / 375.00) * 100 = 33.3%
```

**File Location**: `app/lib/transformers/resova-data-transformer.ts` (lines 486-534)

---

## API Endpoints Summary

### Resova Reporting APIs Used:

1. **GET /v1/reporting/transactions**
   - Used for: Revenue, discounts, taxes, fees, refunds, transaction list
   - Date filter: `date_field=created_at`, `range` or `start_date/end_date`

2. **GET /v1/reporting/transactions/sales/itemizedRevenues**
   - Used for: Itemized revenue breakdown
   - Date filter: `range` or `start_date/end_date`

3. **GET /v1/reporting/transactions/bookings/allBookings**
   - Used for: Bookings count, guests, revenue trends, performance metrics
   - Date filter: `range` or `start_date/end_date`
   - Returns bookings where `date_short` falls within range

4. **GET /v1/reporting/transactions/payments/allPayments**
   - Used for: Payment collection analysis, paid/unpaid amounts
   - Date filter: `range` or `start_date/end_date`

5. **POST /v1/reporting/inventory/items**
   - Used for: Activity profitability analysis
   - Filters: `type`, `period`, `booking_status`, `date_range`

6. **GET /v1/availability/calendar**
   - Used for: Capacity utilization metrics
   - Parameters: `start_date`, `end_date`, optional `item_id`

7. **GET /v1/items**
   - Used for: Item details, categories, pricing

---

## Date Range Handling

### Date Range Mapping:
```javascript
'Last 7 days' → range: '7'
'Last 30 days' → range: '30'
'Last 90 days' → range: '90'
'This week' → range: 'current_week'
'Last week' → range: 'previous_week'
'This month' → range: 'current_month'
'Last month' → range: 'previous_month'
'This quarter' → range: 'current_quarter'
'Last quarter' → range: 'previous_quarter'
'today' → range: 'today'
'yesterday' → range: 'yesterday'
```

### Today's Date Calculation:
```javascript
const now = new Date()
const year = now.getFullYear()
const month = String(now.getMonth() + 1).padStart(2, '0')
const day = String(now.getDate()).padStart(2, '0')
const today = `${year}-${month}-${day}` // Format: YYYY-MM-DD
```

**Note**: Uses local timezone, not UTC, for "today" calculations.

---

## Helper Functions

### Percentage Change Calculation

**Formula**:
```javascript
calculatePercentChange(current, previous) {
  if (previous === 0) return 0
  return (((current - previous) / previous) * 100).toFixed(1)
}
```

**Example**:
```javascript
current = 450.00
previous = 400.00

percentChange = ((450.00 - 400.00) / 400.00) * 100
percentChange = (50.00 / 400.00) * 100
percentChange = 12.5%
```

**File Location**: `app/lib/transformers/resova-data-transformer.ts` (lines 725-728)

---

## File Locations Reference

### Core Service Files:
- **Main Service**: `app/lib/services/resova-service.ts`
- **Reporting API Service**: `app/lib/services/resova-reporting-service.ts`

### Transformer Files:
- **Main Transformer**: `app/lib/transformers/resova-data-transformer.ts`
- **Customer Intelligence Transformer**: `app/lib/transformers/customer-intelligence-transformer.ts`

### UI Components:
- **Owner's Box**: `app/components/OwnersBox.tsx`
- **Attention Required**: `app/components/AttentionRequired.tsx`
- **Quick Insights**: `app/components/QuickInsights.tsx`

### Type Definitions:
- **Analytics Types**: `app/types/analytics.ts`

---

## Notes & Considerations

### Current Limitations:

1. **Previous Period Comparison**: Currently simulated (90-95% of current period). Production should fetch actual previous period data.

2. **Guest Count**: Transaction API provides `participants` array, but `total_quantity` from bookings API is more reliable for guest counts.

3. **Extras/Gift Vouchers**: Not fully integrated in sales summary. Requires additional API endpoints.

4. **Repeat Customers**: Limited to customer transaction count within selected period. True repeat rate needs full customer history.

5. **No-Shows**: Based on booking status field. Ideally would use participant-level check-in data.

### Best Practices:

1. All monetary values stored as strings in API responses are parsed to floats before calculations
2. Division operations always check for zero divisor
3. Percentages rounded to 1 decimal place
4. Currency values rounded to 2 decimal places
5. Date comparisons use ISO string format (YYYY-MM-DD)
6. Time slots normalized to hour boundaries (e.g., "10:30" → "10:00")

---

## Quick Reference Table

| Metric | Formula | API Source | Time Period |
|--------|---------|------------|-------------|
| Total Revenue | SUM(transactions.paid) | /v1/reporting/transactions | Last 30 days |
| Revenue Change % | ((current - previous) / previous) × 100 | Calculated | vs Previous period |
| Today's Bookings | COUNT(todaysBookings) | /v1/.../allBookings | Today |
| Expected Guests | SUM(bookings.total_quantity) | /v1/.../allBookings | Today |
| Capacity % | (totalBooked / totalCapacity) × 100 | /v1/availability/calendar | Date range |
| Net Revenue | gross - refunded | /v1/reporting/transactions | Last 30 days |
| Best Day | argmax(dayRevenue) | /v1/.../allBookings | Last 30 days |
| Top Item | argmax(itemCounts) | /v1/.../allBookings | Last 30 days |
| Peak Time | argmax(hourCounts) | /v1/.../allBookings | Last 30 days |

---

**Document Version**: 1.0
**Last Updated**: 2025-11-15
**Application**: Resova Intelligence V3
**API Version**: Resova Reporting APIs v1
