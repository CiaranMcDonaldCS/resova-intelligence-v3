# Intelligence Framework for Resova Intelligence V3

## Overview
Transform raw venue data into actionable intelligence through a 5-layer framework that provides raw facts, derived metrics, connected correlations, predictive forecasts, and prescriptive recommendations.

## Principles
1. **100% Factual** - Every insight must be backed by actual data
2. **Transparent** - Show the data sources and calculations
3. **Actionable** - Insights must drive specific decisions
4. **Connected** - Reveal relationships between metrics
5. **Forward-Looking** - Include predictive elements where statistically valid

---

## Intelligence Layers

### Layer 1: Raw Insights (Facts)
Direct observations from the data with zero interpretation.

**Revenue Insights:**
- Total gross revenue: $X
- Total net revenue: $X
- Total transactions: X
- Average transaction value: $X
- Total refunds: $X
- Total discounts applied: $X

**Booking Insights:**
- Total bookings: X
- Bookings by channel (online vs operator)
- Bookings by time of day
- Bookings by day of week
- Cancelled bookings: X
- No-shows: X

**Guest Insights:**
- Total guests served: X
- Average group size: X
- Adult vs child ratio
- Waivers completed: X / X required

**Activity Insights:**
- Number of active activities: X
- Bookings per activity
- Revenue per activity
- Capacity per activity

**Customer Insights:**
- Total unique customers: X
- New customers: X
- Returning customers: X
- Customer booking frequency distribution

**Voucher Insights:**
- Active vouchers: X valued at $X
- Redeemed vouchers: X valued at $X
- Expired vouchers: X valued at $X

**Capacity Insights:**
- Total capacity offered: X slots
- Total slots booked: X
- Total slots available: X

---

### Layer 2: Derived Insights (Calculations)
Metrics calculated from raw data that reveal performance patterns.

**Efficiency Metrics:**
- Capacity utilization rate: X% (booked / total capacity)
- Revenue per available slot: $X
- Revenue per booking: $X
- Revenue per guest: $X
- Cost of discounts: X% of gross revenue
- Refund rate: X% of gross revenue

**Growth Metrics:**
- Period-over-period revenue growth: +/-X%
- Booking growth rate: +/-X%
- Guest growth rate: +/-X%
- New customer acquisition rate: +/-X%
- Customer retention rate: X%

**Customer Metrics:**
- Customer Lifetime Value (CLV): $X average
- Repeat customer rate: X%
- Average time between bookings: X days
- Customer churn risk: X% haven't booked in 90+ days

**Activity Performance:**
- Revenue per booking by activity
- Profit margin by activity (after discounts/refunds)
- Booking frequency by activity
- Capacity utilization by activity
- Growth rate by activity

**Time-Based Patterns:**
- Peak hours: List with utilization %
- Low-demand hours: List with utilization %
- Best performing days: List with revenue
- Worst performing days: List with revenue
- Seasonal trends: Month-over-month patterns

**Voucher Performance:**
- Redemption rate: X% (redeemed / total issued)
- Average days to redemption: X days
- Voucher breakage rate: X% (unredeemed expired)
- Voucher revenue vs direct bookings

---

### Layer 3: Connected Insights (Correlations)
Relationships between different metrics that reveal cause-and-effect.

**Revenue Drivers:**
- Top revenue-driving activity: X (Y% of total revenue)
- Revenue impact of online vs operator bookings
- Revenue correlation with group size
- Discount impact on booking volume
- Price sensitivity by activity type

**Customer Behavior Correlations:**
- Activities that drive repeat bookings
- Cross-sell patterns (activities booked together)
- Customer segment preferences (VIP vs new customers)
- Booking lead time correlation with revenue
- Cancellation patterns by booking channel

**Capacity Optimization:**
- High-demand + low-capacity activities (expansion opportunities)
- Low-demand + high-capacity activities (pricing/marketing opportunities)
- Time slot optimization opportunities
- Activity bundle opportunities based on co-booking patterns

**Operational Efficiency:**
- Staff allocation vs peak times correlation
- Waiver completion rate impact on check-in time
- No-show correlation with booking channel
- Payment timing correlation with customer segment

**Marketing Effectiveness:**
- Voucher redemption correlation with activity type
- New customer acquisition channels performance
- Returning customer booking patterns
- Seasonal campaign impact on bookings

---

### Layer 4: Predictive Insights (Forecasts)
Statistical forecasts based on historical patterns (only when statistically valid).

**Revenue Predictions:**
- Next 30-day revenue forecast: $X (+/- $Y confidence interval)
- Based on: Historical trend + seasonal patterns + current bookings
- Confidence level: X% (based on data consistency)

**Booking Predictions:**
- Expected bookings next 7/30/90 days
- Capacity fill forecast by activity
- Peak demand days forecast

**Customer Predictions:**
- At-risk customers (90+ days since last booking): X customers worth $Y in potential CLV
- Likely to return customers: X customers, expected revenue $Y
- Customer segments growth trajectory

**Capacity Predictions:**
- Predicted sell-out dates for each activity
- Forecasted low-demand periods
- Recommended capacity adjustments

**Voucher Predictions:**
- Expected redemptions next 30 days: X vouchers worth $Y
- Breakage forecast: X vouchers worth $Y unlikely to redeem
- Voucher liability: $X expected to be redeemed

---

### Layer 5: Prescriptive Insights (Recommendations)
Specific, actionable recommendations based on all previous layers.

**Revenue Optimization:**
- "Increase capacity for [Activity X] during [Time Y] - it sells out Z days in advance"
- "Reduce discount for [Activity X] - booking volume unchanged at full price"
- "Bundle [Activity A] with [Activity B] - 40% of customers book both"

**Customer Retention:**
- "Re-engage 47 VIP customers who haven't booked in 90+ days - potential $12,450 revenue"
- "Target new customer segment: Families book [Activity X] - expand capacity on weekends"
- "Send reminder to 23 customers with expiring vouchers (expire in 30 days) - $4,500 value"

**Operational Efficiency:**
- "Staff additional person during peak hours (2pm-5pm Saturdays) - 95%+ capacity utilization"
- "Consolidate [Activity X] bookings to reduce time slots - currently only 30% utilized"
- "Automate waiver collection - 40% of check-in time spent on waivers"

**Pricing Strategy:**
- "Raise price for [Activity X] by 10% - demand is inelastic (no booking drop at current price)"
- "Offer early-bird discount for [Activity Y] - bookings happen day-of, hurting capacity planning"
- "Create dynamic pricing for peak vs off-peak hours - 40% utilization gap"

**Marketing Focus:**
- "Promote [Activity X] to past customers of [Activity Y] - 60% cross-booking rate"
- "Run weekend promotion for [Activity Z] - consistently 50% capacity on Sundays"
- "Create loyalty program for customers with 3+ bookings - they represent 40% of revenue"

**Capacity Planning:**
- "Add capacity for [Activity X] on Saturdays - selling out 14 days in advance"
- "Remove time slot [Time Y] for [Activity Z] - 0 bookings in last 60 days"
- "Shift capacity from [Activity A] to [Activity B] - better revenue per slot"

---

## Implementation Strategy

### Data Requirements
All insights require access to:
- Transactions (current + 12 months historical)
- Bookings (current + 12 months historical + 90 days forward)
- Payments (current + 12 months historical)
- Inventory Items
- Customers (all records)
- Vouchers (all records)
- Availability (90 days forward)

### Statistical Validity
Predictive insights require:
- Minimum 90 days of historical data
- Consistent data patterns (no major business changes)
- Sufficient sample size (30+ data points)
- Clearly stated confidence intervals

### Presentation
- Show data sources for every insight
- Include confidence levels for predictions
- Provide historical context for recommendations
- Link recommendations to expected outcomes
- Allow drill-down into underlying data

### AI Integration
The AI assistant should:
- Explain insights in plain language
- Answer "why" questions by showing data connections
- Suggest follow-up questions to explore insights
- Never invent data - only use what exists
- Clearly mark predictions vs facts

---

## Intelligence Metrics Structure

```typescript
interface AdvancedIntelligence {
  raw: RawInsights;           // Layer 1: Facts
  derived: DerivedInsights;   // Layer 2: Calculations
  connected: ConnectedInsights; // Layer 3: Correlations
  predictive: PredictiveInsights; // Layer 4: Forecasts
  prescriptive: PrescriptiveInsights; // Layer 5: Recommendations
}
```

Each insight includes:
- **value**: The metric value
- **source**: Which API(s) provided the data
- **calculation**: How it was computed (for derived insights)
- **confidence**: Statistical confidence (for predictions)
- **impact**: Expected business impact (for recommendations)
- **historical**: Trend over time
