# Resova API Integration Status

Complete reference of all Resova API endpoints and their integration status in Resova Intelligence V3.

## Quick Stats

- **Total API Endpoints**: 65
- **Integrated**: 15 (23.1%)
- **Not Integrated**: 50 (76.9%)
- **Integration Focus**: Analytics, Reporting & Read-Only Context APIs

---

## Reporting APIs (7 endpoints)

These APIs provide read-only access to analytics and reporting data for business intelligence.

| Source | Endpoint | Method | Purpose | Details | Integrated |
|--------|----------|--------|---------|---------|------------|
| Reporting API | `/reporting/transactions` | GET | Transaction reporting | Detailed transaction info including summary, bookings, customers, payments. Supports 12 query params (page, limit, skip, date ranges, etc.) | ✅ Yes |
| Reporting API | `/reporting/transactions/sales/itemizedRevenues` | POST | Itemized revenue | Revenue breakdown by product/service with pricing details (base price, discounts, taxes, net revenue) | ✅ Yes |
| Reporting API | `/reporting/bookings` | POST | All bookings | Comprehensive booking data with customer details, service info, participant metadata | ✅ Yes |
| Reporting API | `/reporting/payments` | POST | All payments | Payment details (amount, status, type, method), transaction processing, refunds/adjustments | ✅ Yes |
| Reporting API | `/reporting/guests` | POST | Guest analytics | Guest information and participation data for bookings | ✅ Yes |
| Reporting API | `/reporting/gift-vouchers` | POST | Gift voucher reporting | Gift voucher sales, redemptions, and status tracking | ✅ Yes |
| Reporting API | `/reporting/extras` | POST | Extras/add-ons reporting | Sales and inventory data for extras/add-on products | ✅ Yes |

**Integration Location**: `/app/api/reporting/`

---

## Availability APIs (3 endpoints)

Check availability and pricing for bookable items and instances.

| Source | Endpoint | Method | Purpose | Details | Integrated |
|--------|----------|--------|---------|---------|------------|
| Main API | `/availability/daily` | GET | Daily availability calendar | Returns available dates and instances for items. Use to populate calendar views. | ❌ No |
| Main API | `/availability/instance/{instance_id}` | GET | Specific instance details | Get details for a specific time slot including capacity, availability, time. Required before booking. | ❌ No |
| Main API | `/availability/instance/{instance_id}/pricing` | POST | Calculate pricing | Calculate pricing for an instance based on quantities. Returns price breakdown before checkout. | ❌ No |

**Use Case**: Display availability calendars, check capacity, calculate prices before booking.

---

## Basket APIs (19 endpoints)

Manage shopping baskets (carts) for building transactions before checkout.

| Source | Endpoint | Method | Purpose | Details | Integrated |
|--------|----------|--------|---------|---------|------------|
| Main API | `/baskets` | POST | Create basket | Create new shopping basket. First step in booking flow. Returns basket ID. | ❌ No |
| Main API | `/baskets/{basket_id}` | GET | Get basket details | Retrieve complete basket with all items, totals, customer info. | ❌ No |
| Main API | `/baskets/{basket_id}` | PUT | Update basket | Update basket details (customer info, notes, etc.). | ❌ No |
| Main API | `/baskets/{basket_id}` | DELETE | Delete basket | Delete/abandon a basket. Use when canceling checkout. | ❌ No |
| Main API | `/baskets/{basket_id}/bookings` | POST | Add booking to basket | Add time-based booking to basket. Requires instance_id, quantities, customer details. | ❌ No |
| Main API | `/baskets/{basket_id}/bookings` | GET | List basket bookings | Get all bookings in basket. | ❌ No |
| Main API | `/baskets/{basket_id}/bookings/{booking_id}` | GET | Get basket booking | Get specific booking details from basket. | ❌ No |
| Main API | `/baskets/{basket_id}/bookings/{booking_id}` | PUT | Update basket booking | Update booking in basket (change quantity, participants, etc.). | ❌ No |
| Main API | `/baskets/{basket_id}/bookings/{booking_id}` | DELETE | Remove basket booking | Remove booking from basket. | ❌ No |
| Main API | `/baskets/{basket_id}/purchases` | POST | Add purchase to basket | Add product purchase (non-time-based) to basket. | ❌ No |
| Main API | `/baskets/{basket_id}/purchases` | GET | List basket purchases | Get all purchases in basket. | ❌ No |
| Main API | `/baskets/{basket_id}/purchases/{purchase_id}` | GET | Get basket purchase | Get specific purchase details from basket. | ❌ No |
| Main API | `/baskets/{basket_id}/purchases/{purchase_id}` | PUT | Update basket purchase | Update purchase in basket. | ❌ No |
| Main API | `/baskets/{basket_id}/purchases/{purchase_id}` | DELETE | Remove basket purchase | Remove purchase from basket. | ❌ No |
| Main API | `/baskets/{basket_id}/promotions` | POST | Apply promotion code | Apply discount/promotion code to basket. Returns discount details. | ❌ No |
| Main API | `/baskets/{basket_id}/promotions` | GET | List basket promotions | Get all promotions applied to basket. | ❌ No |
| Main API | `/baskets/{basket_id}/promotions/{promotion_id}` | GET | Get basket promotion | Get specific promotion details. | ❌ No |
| Main API | `/baskets/{basket_id}/promotions/{promotion_id}` | DELETE | Remove basket promotion | Remove promotion from basket. | ❌ No |

**Use Case**: Build complete booking flow with shopping cart functionality, support for multiple items, promotions, and checkout process.

---

## Transaction APIs (18 endpoints)

Manage completed transactions (finalized bookings and purchases).

| Source | Endpoint | Method | Purpose | Details | Integrated |
|--------|----------|--------|---------|---------|------------|
| Main API | `/transactions` | POST | Create transaction | Convert basket to transaction (finalize booking). Returns confirmation. Critical for completing bookings. | ❌ No |
| Main API | `/transactions/{transaction_id}` | GET | Get transaction | Retrieve complete transaction with all bookings, purchases, payments. | ❌ No |
| Main API | `/transactions/{transaction_id}` | PUT | Update transaction | Update transaction information (notes, status, etc.). | ❌ No |
| Main API | `/transactions/{transaction_id}/bookings` | GET | List transaction bookings | Get all confirmed bookings in transaction. | ❌ No |
| Main API | `/transactions/{transaction_id}/bookings/{booking_id}` | GET | Get transaction booking | Get specific confirmed booking details. | ❌ No |
| Main API | `/transactions/{transaction_id}/bookings/{booking_id}` | PUT | Update transaction booking | Update confirmed booking (change attendance status, update customer details). | ❌ No |
| Main API | `/transactions/{transaction_id}/purchases` | GET | List transaction purchases | Get all purchases in transaction. | ❌ No |
| Main API | `/transactions/{transaction_id}/purchases/{purchase_id}` | GET | Get transaction purchase | Get specific purchase details. | ❌ No |
| Main API | `/transactions/{transaction_id}/purchases/{purchase_id}` | PUT | Update transaction purchase | Update purchase details. | ❌ No |
| Main API | `/transactions/{transaction_id}/promotions` | GET | List transaction promotions | View all promotions/discounts applied to transaction. | ❌ No |
| Main API | `/transactions/{transaction_id}/payments` | POST | Create payment | Record payment for transaction. Use for charging credit cards, recording cash payments. | ❌ No |
| Main API | `/transactions/{transaction_id}/payments` | GET | List transaction payments | Get all payments for transaction. | ❌ No |
| Main API | `/transactions/{transaction_id}/payments/{payment_id}` | GET | Get transaction payment | Get specific payment details (amount, method, status). | ❌ No |
| Main API | `/transactions/{transaction_id}/payments/{payment_id}/refund` | PUT | Refund payment | Process refund for a payment. Returns updated payment with refund details. | ❌ No |

**Use Case**: Finalize bookings, manage confirmed reservations, process payments, handle refunds, update attendance.

---

## Customer APIs (3 endpoints)

Manage customer accounts and profiles.

| Source | Endpoint | Method | Purpose | Details | Integrated |
|--------|----------|--------|---------|---------|------------|
| Main API | `/customers` | POST | Create customer | Create new customer account with name, email, phone, address, etc. | ❌ No |
| Main API | `/customers/{customer_id}` | GET | Get customer | Retrieve complete customer profile and account details. | ✅ Yes (Read-Only) |
| Main API | `/customers/{customer_id}` | PUT | Update customer | Update customer information (contact details, preferences, etc.). | ❌ No |

**Use Case**: Customer relationship management, maintain customer profiles, track customer history.

**Integration Location**: `/app/api/resova/customers/[customer_id]/`

---

## Item APIs (5 endpoints)

Retrieve information about bookable items/services (read-only).

| Source | Endpoint | Method | Purpose | Details | Integrated |
|--------|----------|--------|---------|---------|------------|
| Main API | `/items` | GET | List all items | Get all available bookable items/services. Sorted by creation date, newest first. | ✅ Yes |
| Main API | `/items/{item_id}` | GET | Get item details | Detailed information about specific item including pricing, description, settings. | ✅ Yes |
| Main API | `/items/{item_id}/booking-questions` | GET | Get booking questions | Get custom questions for item. Display these during booking flow for customer input. | ✅ Yes |
| Main API | `/items/{item_id}/reviews` | GET | Get item reviews | Customer reviews with ratings and comments for item. | ✅ Yes |
| Main API | `/items/{item_id}/extras` | GET | Get item extras | Available add-ons/extras for item with pricing. | ✅ Yes |

**Use Case**: Display services/products, show pricing, collect custom booking information, display reviews, offer add-ons.

**Integration Location**: `/app/api/resova/items/`

---

## Gift Voucher APIs (2 endpoints)

Manage gift vouchers (read-only via API).

| Source | Endpoint | Method | Purpose | Details | Integrated |
|--------|----------|--------|---------|---------|------------|
| Main API | `/gift-vouchers` | GET | List gift vouchers | Get all gift vouchers. Sorted by creation date, newest first. | ✅ Yes |
| Main API | `/gift-vouchers/{voucher_id}` | GET | Get gift voucher | Retrieve gift voucher details including code, value, status, expiration. | ✅ Yes |

**Use Case**: Display gift vouchers, check balances, validate voucher codes.

**Integration Location**: `/app/api/resova/gift-vouchers/`

**Note**: Gift voucher creation is done through the Resova dashboard, not API.

---

## Block APIs (4 endpoints)

Create and manage blocks that prevent bookings during specific times.

| Source | Endpoint | Method | Purpose | Details | Integrated |
|--------|----------|--------|---------|---------|------------|
| Main API | `/blocks` | POST | Create block | Create block to prevent bookings during specific times/dates. | ❌ No |
| Main API | `/blocks/{block_id}` | GET | Get block | Retrieve details of specific block. | ❌ No |
| Main API | `/blocks/{block_id}` | PUT | Update block | Update existing block (change dates, times, reason). | ❌ No |
| Main API | `/blocks/{block_id}` | DELETE | Delete block | Permanently delete block. This action cannot be undone. | ❌ No |

**Use Case**: Block off unavailable times (maintenance, holidays, private events), manage capacity, prevent overbooking.

---

## Webhook APIs (4 endpoints)

Configure webhooks for real-time event notifications.

| Source | Endpoint | Method | Purpose | Details | Integrated |
|--------|----------|--------|---------|---------|------------|
| Main API | `/webhooks` | GET | List webhooks | Get all configured webhooks. Sorted by creation date, newest first. | ❌ No |
| Main API | `/webhooks` | POST | Create webhook | Configure new webhook for event notifications. Common events: transaction.created, booking.created, booking.updated, payment.created. | ❌ No |
| Main API | `/webhooks/{webhook_id}` | PUT | Update webhook | Update webhook configuration (URL, events to monitor). | ❌ No |
| Main API | `/webhooks/{webhook_id}` | DELETE | Delete webhook | Delete webhook configuration. | ❌ No |

**Use Case**: Real-time notifications for bookings, payments, cancellations. Use instead of polling for updates.

---

## Integration Recommendations

### For AI Assistant Enhancement

Based on the goal of enhancing the AI assistant, here are recommended integrations:

#### High Priority (Analytics Enhancement)
✅ **Already Complete** - All 7 Reporting APIs integrated
- Provides comprehensive analytics data for AI insights
- Enables revenue analysis, booking trends, customer behavior

#### Medium Priority (Read-Only Context)
These enhance the AI's knowledge without transactional risk:

1. **Items APIs** (5 endpoints) - ⚠️ Recommended
   - Show available services/products
   - Display pricing and descriptions
   - Enable AI to answer "what can I book?" questions
   - Read-only, safe to integrate

2. **Customer APIs** (GET only - 1 endpoint) - ⚠️ Recommended
   - Retrieve customer profiles
   - Enable personalized insights
   - READ operation only (skip POST/PUT for now)

3. **Gift Voucher APIs** (2 endpoints) - ⚠️ Recommended
   - Check voucher status and balances
   - Identify expiring vouchers for alerts
   - Read-only operations

#### Low Priority (Transactional - Risky for AI)
⚠️ **Not Recommended for AI Assistant** - These create/modify data:

- **Availability APIs** - Pricing calculations only, no writes
- **Basket APIs** - Creates shopping carts (transactional)
- **Transaction APIs** - Finalizes bookings (critical, high-risk)
- **Payment APIs** - Processes payments (financial, very high-risk)
- **Block APIs** - Modifies availability (operational risk)
- **Webhook APIs** - System configuration (technical risk)

### Recommended Integration Plan

**Phase 1: Read-Only Context APIs** ✅ (Safe for AI)
1. Items APIs (5 endpoints) - Product/service catalog
2. Customer GET (1 endpoint) - Customer lookup only
3. Gift Voucher APIs (2 endpoints) - Voucher status

**Phase 2: Advanced Analytics** (Optional)
1. Availability GET (2 endpoints) - Check availability only
2. Transaction GET (1 endpoint) - Transaction lookup only

**Phase 3: Operational APIs** ⚠️ (Requires careful controls)
- Only integrate if building full booking platform
- Requires extensive validation, testing, permissions
- Not recommended for AI-driven operations

---

## Current Integration Architecture

**File Structure:**
```
app/api/
├── reporting/          (✅ Complete - 7 endpoints)
│   ├── transactions/
│   ├── itemized-revenue/
│   ├── bookings/
│   ├── payments/
│   ├── guests/
│   ├── gift-vouchers/
│   └── extras/
│
├── resova/            (❌ Not yet created)
│   ├── items/         (Recommended)
│   ├── customers/     (Recommended - GET only)
│   ├── gift-vouchers/ (Recommended)
│   ├── availability/  (Optional)
│   └── transactions/  (Optional - GET only)
```

**Authentication:**
- All endpoints use `X-API-KEY` header
- Environment variable: `NEXT_PUBLIC_RESOVA_API_KEY`
- Server IP must be whitelisted in Resova settings
- HTTPS required for all requests

**Error Handling:**
- 200 OK - Success
- 201 Created - Resource created
- 400 Bad Request - Invalid parameters
- 401 Unauthorized - Authentication failed
- 404 Not Found - Resource doesn't exist
- 429 Too Many Requests - Rate limit exceeded
- 500 Internal Server Error - Server error

---

## API Statistics by Category

| Category | Total Endpoints | Integrated | Not Integrated | Integration % |
|----------|----------------|------------|----------------|---------------|
| Reporting APIs | 7 | 7 | 0 | 100% |
| Availability APIs | 3 | 0 | 3 | 0% |
| Basket APIs | 19 | 0 | 19 | 0% |
| Transaction APIs | 18 | 0 | 18 | 0% |
| Customer APIs | 3 | 1 | 2 | 33.3% |
| Item APIs | 5 | 5 | 0 | 100% |
| Gift Voucher APIs | 2 | 2 | 0 | 100% |
| Block APIs | 4 | 0 | 4 | 0% |
| Webhook APIs | 4 | 0 | 4 | 0% |
| **TOTAL** | **65** | **15** | **50** | **23.1%** |

---

## Next Steps

1. ✅ **Implement Read-Only APIs** - Items (5), Customers GET (1), Gift Vouchers (2) - COMPLETE
2. **Test Integration** - Verify API responses and data quality
3. **Update AI Prompts** - Enhance AI assistant with new data sources
4. **Monitor Usage** - Track API calls and rate limits
5. **Consider Additional APIs** - Evaluate if Availability or Transaction GET endpoints would be useful

---

*Last Updated: 2025-11-15*
*Version: V3*
*Status: Phase 1 Complete - Reporting (7/7) + Read-Only Context APIs (8/8) = 15/65 total*
