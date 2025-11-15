# Data Coverage Matrix
**What We CAN and CANNOT Answer Based on Available Resova API Data**

Version: 3.0.0
Last Updated: 2025-11-15

---

## Mission Alignment
Our three pillars:
1. **Drive Revenue** - Financial performance, demand, revenue drivers
2. **Operational Efficiency** - Run smoother operations, reduce manual work
3. **Guest Experience** - Understand guest satisfaction, feedback, and sentiment

---

## ✅ PILLAR 1: DRIVE REVENUE

### What We CAN Answer (100% Data-Backed)

#### Revenue Performance
- ✅ "Compare this month's revenue to last year" - **FULL DATA**
  - Sources: Transactions API (12 months historical)
  - Metrics: Gross revenue, net revenue, period-over-period growth %
  - Confidence: HIGH

- ✅ "What products are generating the most revenue this month?" - **FULL DATA**
  - Sources: All Bookings API, Inventory Items API
  - Metrics: Revenue by activity, revenue per booking, contribution %
  - Confidence: HIGH

- ✅ "How is this weekend's revenue trending compared to last weekend?" - **FULL DATA**
  - Sources: All Bookings API (current + previous periods)
  - Metrics: Weekend revenue comparison, day-by-day breakdown
  - Confidence: HIGH

#### Bookings & Demand
- ✅ "How are bookings tracking this weekend compared to last?" - **FULL DATA**
  - Sources: All Bookings API
  - Metrics: Booking count, booking value, channel mix (online vs operator)
  - Confidence: HIGH

- ✅ "Which time slots have the highest demand?" - **FULL DATA**
  - Sources: All Bookings API, Availability Calendar API
  - Metrics: Bookings by hour, capacity utilization by time slot
  - Confidence: HIGH

#### Forecasting & Predictions
- ✅ "What's the revenue forecast for next 30/90 days?" - **STATISTICAL MODEL**
  - Sources: Transactions API, All Bookings API (12 months + 90 days forward)
  - Metrics: Revenue forecast with confidence intervals, booking velocity
  - Confidence: MEDIUM (statistical projection based on trends)

- ✅ "Which activities should I expand capacity for?" - **DATA + ANALYSIS**
  - Sources: Availability Calendar API, All Bookings API
  - Metrics: Capacity utilization %, sell-out patterns, revenue potential
  - Confidence: HIGH

### What We CANNOT Answer (Data Limitations)

- ❌ "What's the ROI of my marketing campaigns?" - **NO MARKETING DATA**
  - Missing: Campaign tracking, attribution data, marketing spend
  - Workaround: Can track online vs operator bookings as proxy
  - Future: Requires marketing platform integration

- ❌ "Which social media posts drove the most bookings?" - **NO ATTRIBUTION DATA**
  - Missing: UTM tracking, referral sources, campaign IDs
  - Workaround: None available
  - Future: Requires UTM parameter tracking in booking flow

- ❌ "What's my customer acquisition cost (CAC)?" - **NO MARKETING SPEND DATA**
  - Missing: Marketing expenses, ad spend, cost per channel
  - Workaround: Can calculate customer lifetime value (CLV)
  - Future: Requires expense tracking integration

---

## ✅ PILLAR 2: OPERATIONAL EFFICIENCY

### What We CAN Answer (100% Data-Backed)

#### Operational Insights
- ✅ "What are the biggest operational changes week-over-week?" - **FULL DATA**
  - Sources: All Bookings API, Transactions API, All Payments API
  - Metrics: Booking volume changes, revenue changes, payment timing shifts
  - Confidence: HIGH

- ✅ "Which activities had the highest utilization this weekend?" - **FULL DATA**
  - Sources: Availability Calendar API, All Bookings API
  - Metrics: Capacity utilization %, bookings per slot, peak times
  - Confidence: HIGH

- ✅ "What's my no-show rate and how can I reduce it?" - **FULL DATA**
  - Sources: All Bookings API
  - Metrics: No-show count, no-show %, patterns by channel/activity
  - Confidence: HIGH

#### Efficiency Metrics
- ✅ "How long does it take customers to complete waivers?" - **PARTIAL DATA**
  - Sources: All Bookings API (waiver_required, waiver_complete flags)
  - Metrics: Waiver completion rate
  - Confidence: MEDIUM (have completion rate, not timing)
  - Limitation: No timestamp data for actual completion time

- ✅ "Which time slots should I consolidate or remove?" - **FULL DATA**
  - Sources: Availability Calendar API, All Bookings API
  - Metrics: Utilization by time slot, low-demand periods
  - Confidence: HIGH

- ✅ "What's my staff-to-guest ratio during peak hours?" - **PARTIAL DATA**
  - Sources: All Bookings API (guest counts)
  - Metrics: Guests per time slot, peak demand hours
  - Confidence: MEDIUM
  - Limitation: No staff scheduling data - must be tracked separately

### What We CANNOT Answer (Data Limitations)

- ❌ "What's my labor cost per booking?" - **NO LABOR DATA**
  - Missing: Staff schedules, hourly rates, labor hours
  - Workaround: Can provide guests per time slot for staffing decisions
  - Future: Requires HR/payroll system integration

- ❌ "How long does check-in take on average?" - **NO TIMING DATA**
  - Missing: Check-in timestamps, queue time, process duration
  - Workaround: Can show waiver completion rate as proxy
  - Future: Requires on-site tracking system

- ❌ "Which equipment needs maintenance most frequently?" - **NO MAINTENANCE DATA**
  - Missing: Equipment logs, maintenance records, usage tracking
  - Workaround: None available
  - Future: Requires maintenance management system

---

## ✅ PILLAR 3: GUEST EXPERIENCE

### What We CAN Answer (FULL REVIEW DATA NOW AVAILABLE!)

#### Guest Sentiment & Review Analysis
- ✅ "What are guests saying about their experience?" - **FULL REVIEW TEXT**
  - Sources: Items Reviews API (individual review records with text, ratings, dates, customer names)
  - Metrics: Review text analysis, sentiment themes, common praise/complaints, rating distribution
  - Confidence: HIGH
  - **NOW AVAILABLE: We have both RATINGS and REVIEW TEXT for complete sentiment analysis**

- ✅ "Summarize guest feedback from the last 30 days" - **FULL DATA**
  - Sources: Items Reviews API
  - Metrics: Review themes, sentiment trends, positive/negative patterns, specific customer quotes
  - Confidence: HIGH

- ✅ "What's our average review rating?" - **FULL DATA**
  - Sources: Inventory Items API (avg_review, total_reviews per activity) + Items Reviews API (individual reviews)
  - Metrics: Average rating (1-5), total review count, rating distribution, recent trend
  - Confidence: HIGH

- ✅ "Which activities have the best reviews?" - **FULL DATA WITH CONTEXT**
  - Sources: Inventory Items API + Items Reviews API
  - Metrics: Activities ranked by avg_review score WITH review text explaining WHY
  - Confidence: HIGH
  - **NOW AVAILABLE: Can show which are highest rated AND explain the reasons from guest feedback**

- ✅ "What are the top issues guests are reporting?" - **REVIEW TEXT ANALYSIS**
  - Sources: Items Reviews API (review text mining)
  - Metrics: Common complaint themes, frequency of issues mentioned, specific pain points
  - Confidence: MEDIUM (based on text analysis, not structured issue tracking)
  - **NOW AVAILABLE: Can identify patterns from review text, but no formal support ticket system**

#### Behavioral Proxies for Satisfaction
- ✅ "Are customers rebooking?" - **BEHAVIORAL DATA**
  - Sources: Transactions API, Customers API
  - Metrics: Repeat customer rate, booking frequency, customer retention
  - Confidence: HIGH
  - **Proxy for satisfaction: Repeat behavior indicates satisfaction**

- ✅ "What's our customer churn rate?" - **FULL DATA**
  - Sources: Transactions API (current + previous periods)
  - Metrics: Customers who haven't returned in 90+ days, churn %
  - Confidence: HIGH

- ✅ "Which activities drive the most repeat bookings?" - **FULL DATA**
  - Sources: All Bookings API
  - Metrics: Repeat rate by activity, customer loyalty patterns
  - Confidence: HIGH
  - **Proxy for satisfaction: Repeat activity bookings**

### What We CANNOT Answer (Data Limitations)

- ❌ "Is guest satisfaction trending up or down over time?" - **NO TIME-SERIES SENTIMENT TRACKING**
  - Have: Review text and ratings (current snapshot), repeat booking trends over time
  - Missing: Sentiment score tracking week-over-week, historical NPS data
  - Workaround: Use repeat customer rate trend as proxy, can analyze recent reviews vs older ones
  - Future: Requires ongoing satisfaction survey integration with historical tracking

- ❌ "What's our Net Promoter Score (NPS)?" - **NO SURVEY DATA**
  - Have: Repeat booking behavior (proxy for loyalty), review sentiment (proxy for satisfaction)
  - Missing: "Would you recommend us?" survey responses (0-10 scale)
  - Workaround: High repeat rate + positive review sentiment suggests promoters
  - Future: Requires NPS survey tool integration

- ❌ "What's our customer effort score (CES)?" - **NO EFFORT TRACKING**
  - Have: Waiver completion rates, review text mentioning "easy" or "difficult"
  - Missing: Structured post-interaction effort surveys
  - Workaround: Can analyze review text for mentions of ease/difficulty
  - Future: Requires CES survey integration

- ❌ "How do our reviews compare to competitors?" - **NO COMPETITIVE DATA**
  - Have: Our own review scores and text
  - Missing: Competitor review data, industry benchmarks
  - Workaround: None available
  - Future: Requires competitive intelligence platform integration

---

## 📊 Data Sources Summary

### Available APIs (Actively Used)
1. ✅ **Transactions API** - 12 months historical revenue data
2. ✅ **Itemized Revenue API** - Detailed revenue breakdown
3. ✅ **All Bookings API** - Current + previous + 90 days future bookings
4. ✅ **All Payments API** - Payment collection and timing
5. ✅ **Inventory Items API** - Activities with avg_review + total_reviews
6. ✅ **Availability Calendar API** - Capacity and utilization data
7. ✅ **Customers API** - Customer records and email addresses
8. ✅ **Gift Vouchers API** - Voucher status and redemption
9. ✅ **Abandoned Carts API** - Incomplete booking attempts
10. ✅ **Items Reviews API** - Individual review records with text, ratings, dates, and customer info (NOW INTEGRATED)

### Available APIs (Not Yet Used)
11. ⚠️ **Extras API** - Add-on sales data
12. ⚠️ **Guests API** - Detailed guest information

### Missing Data (Not in Resova)
- ❌ Marketing campaign data (spend, attribution, UTMs)
- ❌ Staff/labor data (schedules, hours, costs)
- ❌ Equipment/maintenance logs
- ❌ Guest survey responses (NPS, CSAT, CES formal surveys)
- ❌ Support tickets or structured issue tracking
- ❌ Check-in timing or queue data
- ❌ Expense tracking (COGS, operating costs)
- ❌ Competitive benchmarking data

---

## 🎯 Intelligence Confidence Levels

### HIGH Confidence (90%+)
These insights are directly calculated from complete API data:
- Revenue metrics (gross, net, growth %)
- Booking metrics (volume, channel, timing)
- Capacity utilization (slots, bookings, availability)
- Customer metrics (new, repeat, churn)
- Activity performance (revenue, bookings, utilization)

### MEDIUM Confidence (60-90%)
These insights use statistical models or partial data:
- Revenue forecasts (trend-based predictions)
- Customer predictions (at-risk, likely to return)
- Time patterns (peak hours derived from bookings)
- Cross-sell patterns (activity combinations)

### LOW Confidence (<60%)
These insights use proxies or limited data:
- Guest satisfaction (inferred from repeat behavior)
- Operational timing (waiver completion rate, not duration)
- Staff efficiency (guest counts, but no labor data)

### NO CONFIDENCE (Cannot Answer)
Missing required data sources - must be honest:
- Marketing ROI
- Labor costs
- Guest sentiment/feedback themes
- NPS scores
- Support issues

---

## 💬 Response Templates for Missing Data

When asked about data we don't have, use these templates:

### Template 1: Data Coming Soon
```
I don't have access to [specific data type] at this time, but I'm continuously evolving to bring you richer insights.

What I CAN tell you right now is [related metric using available data].

For [specific question], you'll need [external tool/manual tracking] until we integrate [data source].
```

### Template 2: Proxy Available
```
I don't have direct [specific data] yet, but I can provide a related insight:

[Proxy metric] suggests [finding]. While this isn't the same as [specific data], it's a strong indicator because [reasoning].

I'm working on adding [data source] to give you the complete picture.
```

### Template 3: Behavioral Proxy
```
I don't have guest survey data yet, but behavioral signals tell a story:

- Repeat customer rate: [X]% (indicates satisfaction)
- Cancellation rate: [X]% (indicates dissatisfaction)
- Average review score: [X]/5 stars

These metrics suggest [conclusion]. For deeper feedback, consider implementing post-visit surveys.
```

---

## 🔄 Roadmap: Closing Data Gaps

### Phase 1: Current (v3.0.0)
- ✅ All Resova Reporting APIs integrated
- ✅ 12 months historical + 90 days forward data
- ✅ 5-layer intelligence framework (Raw → Prescriptive)
- ✅ 100% factual, data-backed insights

### Phase 2: Near-Term (Next 30 days)
- 🔄 Integrate Items Reviews API (review details, not just scores)
- 🔄 Add Extras API data (add-on sales intelligence)
- 🔄 Add Guests API data (detailed guest profiles)
- 🔄 Enhance predictions with seasonal patterns

### Phase 3: Future Integrations
- 📋 Marketing platform integration (UTM tracking, attribution)
- 📋 Survey tool integration (NPS, CSAT, feedback)
- 📋 Support ticket integration (issue tracking)
- 📋 Expense tracking integration (COGS, labor costs)
- 📋 On-site systems (check-in timing, queue management)

---

## ✅ Best Practices for Honest Responses

1. **Never Invent Data** - If we don't have it, say so
2. **Offer Proxies** - Suggest related metrics when available
3. **Show Confidence** - Label predictions with statistical confidence
4. **Explain Sources** - Always cite which APIs provided the data
5. **Suggest Workarounds** - Recommend tools/processes to fill gaps
6. **Set Expectations** - Be clear about roadmap for missing data

---

**Remember:** Trust is built through honesty. It's better to say "I don't have that data yet" than to guess or invent insights.
