# Optional Data Handling Pattern

**Last Updated:** 2025-11-15
**Version:** 3.0.0

---

## Philosophy

**Not all operators will have all data.** Some may not use reviews, promotions, booking questions, extras, or certain features. Our architecture must gracefully handle missing data without breaking the analytics or AI experience.

---

## ✅ The Pattern (Already Implemented)

### 1. Service Layer - Graceful Fetch

```typescript
async getOptionalData(id: string): Promise<DataType[]> {
  try {
    const response = await this.fetchWithTimeout(url, options);

    // Handle different response formats
    if (Array.isArray(response)) {
      return response;
    }
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }

    logger.warn(`Unexpected response format for ${id}`);
    return [];

  } catch (error) {
    // 404 = Data doesn't exist (NOT an error for optional data)
    if (error instanceof ApiError && (error.statusCode === 404 || error.statusCode === 400)) {
      logger.info(`No data found for ${id} - this is OK`);
      return []; // Empty array, not an error
    }

    // Network errors - also graceful
    if (error instanceof NetworkError) {
      logger.warn(`Network error fetching ${id}:`, error.message);
      return [];
    }

    // Real errors - log but don't break
    logger.error(`Failed to fetch ${id}`, error);
    return [];
  }
}
```

**Key Points:**
- ✅ Returns empty array on 404 (data doesn't exist)
- ✅ Returns empty array on 400 (bad request)
- ✅ Returns empty array on network errors
- ✅ Logs **info** (not error) for missing data
- ✅ Never throws - analytics continues normally

---

### 2. Context Builder - Conditional Rendering

```typescript
// Only add section to context if data exists
if (analyticsData.rawData?.reviews && analyticsData.rawData.reviews.length > 0) {
  const reviews = analyticsData.rawData.reviews;

  context += `
## GUEST REVIEWS & SENTIMENT

REVIEW SUMMARY:
- Total Reviews: ${reviews.length}
...
  `;
}

// If reviews.length === 0, section is never added
// Claude won't see review data in context
```

**Key Points:**
- ✅ Check for existence AND length > 0
- ✅ Only add section if data available
- ✅ Context stays clean when data missing

---

### 3. AI Response - Honest About Limitations

**Operator WITH reviews:**
```
User: "What are guests saying?"
Claude: "Based on 35 recent reviews, guests are praising..."
```

**Operator WITHOUT reviews:**
```
User: "What are guests saying?"
Claude: "I don't have access to guest review data for your venue.

What I CAN tell you is your 38% repeat customer rate indicates strong satisfaction.
Behavioral signals suggest guests are happy with their experience."
```

**Key Points:**
- ✅ Never invents data
- ✅ Offers behavioral proxies when available
- ✅ Maintains professional, helpful tone

---

## 📋 Optional Data Types (Current & Future)

### Currently Implemented with Graceful Handling

| Data Type | API Endpoint | Status | Handled Gracefully |
|-----------|-------------|--------|-------------------|
| **Reviews** | `GET /v1/items/{item_id}/reviews` | ✅ Integrated | ✅ Yes - returns [] on 404 |
| **Customers** | `GET /v1/customers` | ✅ Integrated | ✅ Yes - paginated, returns [] if none |
| **Gift Vouchers** | `GET /v1/vouchers` | ✅ Integrated | ✅ Yes - paginated, returns [] if none |
| **Abandoned Carts** | `GET /v1/baskets?status=abandoned` | ✅ Integrated | ✅ Yes - returns [] if none |

### Future Optional APIs (Should Use Same Pattern)

| Data Type | API Endpoint | When to Add | Notes |
|-----------|-------------|------------|-------|
| **Promotions** | `GET /v1/transactions/{id}/promotions` | Future | Not all operators use promo codes |
| **Booking Questions** | `GET /v1/items/{item_id}/booking_questions` | Future | Custom questions are optional |
| **Extras/Add-ons** | `POST /v1/reporting/inventory/extras` | Soon | Some venues don't sell extras |
| **Guest Details** | `POST /v1/reporting/guests` | Soon | Detailed guest info (optional) |

---

## 🎯 Implementation Checklist

When adding a new optional data source:

### Service Layer
- [ ] Create method in ResovaService
- [ ] Handle 404 as "no data" (return empty array)
- [ ] Handle 400 as "no data" (return empty array)
- [ ] Handle network errors gracefully
- [ ] Log **info** for missing data (not error)
- [ ] Return empty array instead of throwing

### Data Integration
- [ ] Fetch in parallel with other optional data
- [ ] Add to rawData only if data exists
- [ ] Don't break analytics if fetch fails

### Context Builder
- [ ] Check for existence AND length > 0
- [ ] Only add section if data available
- [ ] Keep section out of context if no data

### Documentation
- [ ] Update DATA_COVERAGE_MATRIX.md
- [ ] Add to "What We CAN Answer" (if applicable)
- [ ] Update system prompt (if needed)
- [ ] Add example questions

### Testing
- [ ] Test with operator who HAS the data
- [ ] Test with operator who DOES NOT have the data
- [ ] Verify analytics doesn't break either way
- [ ] Verify AI responds appropriately in both cases

---

## 📖 Real-World Examples

### Example 1: Reviews (Already Implemented)

**Operator A (Has Reviews):**
```
Logger: "Fetched 50 customers, 20 vouchers, 10 carts, 35 reviews"
Context: Includes review section with samples
Claude: Can answer sentiment questions with quotes
```

**Operator B (No Reviews):**
```
Logger: "Fetched 50 customers, 20 vouchers, 10 carts, 0 reviews"
Logger: "No reviews found for item 123 - this is OK" (x10 items)
Context: NO review section
Claude: "I don't have review data yet, but 40% repeat rate suggests satisfaction"
```

### Example 2: Abandoned Carts (Already Implemented)

**Operator A (Has Abandoned Carts):**
```
Logger: "Fetched 15 abandoned carts"
Context: Includes cart abandonment section
Claude: "You have 15 recoverable carts worth $2,400..."
```

**Operator B (No Abandoned Carts):**
```
Logger: "Fetched 0 abandoned carts"
Context: NO cart abandonment section
Claude: "Great news - you have no abandoned carts! 100% conversion rate."
```

### Example 3: Promotions (Future)

**Operator A (Uses Promo Codes):**
```
Logger: "Fetched 25 promotions across 150 transactions"
Context: Includes promotions section
Claude: "Your 'SUMMER20' promo drove 45 bookings worth $3,200..."
```

**Operator B (No Promo Codes):**
```
Logger: "Fetched 0 promotions"
Logger: "No promotions found - this is OK"
Context: NO promotions section
Claude: "I don't see any active promotions in your data."
```

---

## 🔍 Logging Strategy

### Good Logging (Helpful for Debugging)

```typescript
// When data doesn't exist (expected for optional data)
logger.info(`No reviews found for item ${itemId} - this is OK`);
logger.info(`Operator has 0 abandoned carts`);
logger.info(`No custom booking questions configured`);

// When data fetch succeeds
logger.info(`Fetched ${reviews.length} reviews across ${items.length} items`);

// Summary log
logger.info(`Fetched ${customers.length} customers, ${vouchers.length} vouchers, ${carts.length} carts, ${reviews.length} reviews`);
```

### Bad Logging (Creates Noise)

```typescript
// DON'T treat missing optional data as errors
logger.error(`Failed to fetch reviews for item ${itemId}`); // ❌ Wrong - this is expected

// DON'T log every single 404 as a warning
logger.warn(`Item ${itemId} has no reviews`); // ❌ Too verbose

// DON'T throw errors for optional data
throw new Error(`Reviews not found`); // ❌ Breaks analytics
```

---

## ✅ Benefits of This Pattern

1. **Resilient Analytics** - Missing data never breaks the dashboard
2. **Clear Logs** - Easy to distinguish real errors from missing optional data
3. **Honest AI** - Claude never invents data, always truthful
4. **Graceful Degradation** - Operators get value even without all features
5. **Easy Testing** - Works for operators at all stages of Resova adoption
6. **Future-Proof** - Easy to add new optional data sources

---

## 🚀 Next Optional APIs to Add

Using this pattern, we should add:

### Priority 1: Extras/Add-ons (High Value)
- **API:** `POST /v1/reporting/inventory/extras`
- **Why:** Many operators sell add-ons (photos, merchandise, insurance)
- **Impact:** Can analyze upsell opportunities
- **Pattern:** Same as reviews - graceful 404 handling

### Priority 2: Custom Booking Questions (Medium Value)
- **API:** `GET /v1/items/{item_id}/booking_questions`
- **Why:** Some operators collect custom info (dietary restrictions, skill level)
- **Impact:** Can analyze booking quality and guest preferences
- **Pattern:** Same as reviews - graceful 404 handling

### Priority 3: Promotions (Medium Value)
- **API:** `GET /v1/transactions/{transaction_id}/promotions`
- **Why:** Some operators use promo codes heavily
- **Impact:** Can track discount effectiveness
- **Pattern:** Same as reviews - graceful 404 handling

---

## 📝 Template for New Optional API

```typescript
/**
 * Get optional data for an item
 * Returns empty array if operator doesn't use this feature
 */
async getOptionalFeature(itemId: string): Promise<FeatureType[]> {
  try {
    logger.info(`Fetching optional feature for item ${itemId}`);

    const url = `${this.baseUrl}/items/${itemId}/feature`;
    const response = await this.fetchWithTimeout(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    // Handle response formats
    if (Array.isArray(response)) {
      return response as FeatureType[];
    }
    if (response.data && Array.isArray(response.data)) {
      return response.data as FeatureType[];
    }

    logger.warn(`Unexpected response format for item ${itemId} feature:`, response);
    return [];

  } catch (error) {
    // Graceful handling - missing data is OK for optional features
    if (error instanceof ApiError && (error.statusCode === 404 || error.statusCode === 400)) {
      logger.info(`No feature data found for item ${itemId} - this is OK`);
      return [];
    }

    if (error instanceof NetworkError) {
      logger.warn(`Network error fetching feature for item ${itemId}:`, error.message);
      return [];
    }

    logger.error(`Failed to fetch feature for item ${itemId}`, error);
    return [];
  }
}

/**
 * Get all optional features for all items (batch)
 */
async getAllOptionalFeatures(itemIds: string[]): Promise<FeatureType[]> {
  try {
    logger.info(`Fetching optional features for ${itemIds.length} items`);

    const BATCH_SIZE = 10;
    let allFeatures: FeatureType[] = [];

    for (let i = 0; i < itemIds.length; i += BATCH_SIZE) {
      const batch = itemIds.slice(i, i + BATCH_SIZE);
      const batchFeatures = await Promise.all(
        batch.map(itemId => this.getOptionalFeature(itemId))
      );

      allFeatures = [...allFeatures, ...batchFeatures.flat()];
    }

    logger.info(`Fetched total of ${allFeatures.length} features across ${itemIds.length} items`);
    return allFeatures;

  } catch (error) {
    logger.error('Failed to fetch all optional features', error);
    return []; // Graceful - don't break analytics
  }
}
```

---

## 🎯 Summary

**Golden Rule:** Optional data should **enhance** the experience when present, but **never break** the experience when absent.

Our current implementation with reviews, vouchers, and abandoned carts already follows this pattern perfectly. Future optional APIs should use the same approach.

**Remember:** An operator without reviews can still get tremendous value from revenue analytics, customer intelligence, and capacity insights.
