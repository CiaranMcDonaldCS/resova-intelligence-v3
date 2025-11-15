# AI Assistant Documentation

## Overview

The AI Assistant is a senior business advisor powered by Claude (Anthropic's AI) with 15+ years of simulated experience helping tour and activity operators grow their businesses. It provides data-driven insights, ROI-ranked recommendations, and actionable strategies based on your Resova analytics data.

## Key Capabilities

### **1. Revenue & Operations Analysis**
The AI has deep access to your operational metrics:

- **Activity Profitability**: Revenue per booking, total sales, and booking counts by activity
- **Capacity Utilization**: Overall utilization rates, peak times (>80%), and low-demand slots (<50%)
- **Time Slot Intelligence**: Identifies which sessions to expand, consolidate, or eliminate
- **Payment Collection**: Tracks card vs cash payments, paid vs unpaid amounts

**Example Questions:**
- "Which activities are most profitable?"
- "Where are my biggest profit leaks?"
- "Which time slots should I expand?"
- "What's my capacity utilization by activity?"

### **2. Customer Intelligence** (NEW)
Comprehensive customer lifetime value and segmentation:

- **Customer Segmentation**: VIP (>$1000), High Value ($500-$1000), Medium ($100-$500), Low (<$100)
- **Top Customers**: Ranked by total spend with churn risk analysis (low/medium/high)
- **Retention Metrics**: Repeat customer rate, average customer lifetime, churn rate
- **At-Risk Identification**: Customers inactive for 60-90 days
- **Acquisition Tracking**: New customers this period with revenue contribution

**Example Questions:**
- "Who are my most valuable customers?"
- "Which customer segments should I target?"
- "How many customers are at risk of churning?"
- "What's my repeat customer rate?"
- "Who are my VIP customers?"

### **3. Gift Voucher Analytics** (NEW)
Track voucher sales and redemption for profit optimization:

- **Sales Tracking**: Total vouchers sold with dollar amounts
- **Redemption Rates**: Percentage redeemed vs outstanding
- **Breakage Analysis**: Unredeemed vouchers (pure profit opportunity)
- **Performance by Type**: Value vouchers vs space vouchers vs gift cards
- **Cash Flow**: Outstanding balance and average days to redemption

**Example Questions:**
- "What's my voucher breakage rate?"
- "How much revenue is in unredeemed vouchers?"
- "Which voucher types perform best?"
- "What's my average voucher redemption time?"

### **4. Conversion Intelligence** (NEW)
Cart abandonment and recovery opportunities:

- **Abandonment Tracking**: Total abandoned carts with lost revenue
- **Recovery Opportunity**: Carts with email addresses (recoverable)
- **Projected Recovery**: Estimated revenue with 15% industry-standard recovery rate
- **Top Abandoned Items**: Which products cause the most drop-offs
- **Conversion Funnel**: Drop-off analysis by stage (cart → checkout → payment)

**Example Questions:**
- "What's my cart abandonment costing me?"
- "How much revenue can I recover from abandoned carts?"
- "Which items cause the most abandonments?"
- "What's my conversion rate?"

## Response Format

Every AI response follows a consistent, profit-first structure:

### **1. Direct Answer (1-3 sentences)**
Immediately answers your specific question with concrete data, numbers, and rankings.

### **2. Key Insights (3-5 bullet points)**
Presents discoveries that drive business decisions:
- **Finding:** Business implication and recommended action
- Focuses on profitability, efficiency, and growth opportunities
- Compares to industry benchmarks when relevant

### **3. Recommended Actions (2-3 maximum, prioritized by ROI)**
Specific, implementable strategies with:
- **Action description**: What to do
- **Expected impact**: Dollar amounts per week/month
- **Implementation difficulty**: Easy/Medium/Hard
- **Timeframe**: How long to see results

### **4. Visual Charts (Auto-Generated)**
Charts are automatically embedded based on your question:
- Capacity by activity (bar chart)
- Utilization by time (line chart)
- Activity profitability (bar chart)
- Revenue trends (line chart)
- Customer segments (pie chart)
- Cart abandonment (funnel chart)

Charts include:
- **Export**: Download as CSV
- **Copy**: Copy data to clipboard
- **Interactive**: Hover for details

### **5. Follow-Up Questions (3-4 contextual)**
Clickable buttons with related questions to dig deeper:
- Natural conversation flow
- Specific to your response
- Helps explore related opportunities

## Data Sources

### **Currently Integrated:**

**Resova Reporting APIs:**
- Transactions (last 100)
- Itemized Revenue
- All Bookings (filtered by date range)
- All Payments (payment status and methods)
- Inventory Items (sales data for profitability)
- Availability Calendar (capacity utilization)

**Resova Core APIs:**
- Customers (up to 300 customers, 3 pages)
- Gift Vouchers (up to 200 vouchers, 2 pages)
- Baskets/Carts (up to 200 abandoned carts, 2 pages)

**Items Core API:**
- Activity catalog with descriptions and pricing

### **Data Limitations:**
- Historical data: **6 months maximum**
- No year-over-year comparisons (avoid "last year" references)
- Real-time data refreshed on dashboard load

## Competitive Advantages vs ROLLER iQ

### **What ROLLER iQ Offers:**
- Industry-specific AI (not generic ChatGPT)
- Real-time data grounded in venue figures
- Natural language Q&A
- Mobile + desktop access

### **Where Resova AI Beats Them:**

#### **1. Deeper Intelligence**
- **ROLLER**: "Zip Line revenue is up 15%"
- **RESOVA**: "Zip Line shows 89% capacity utilization AND highest revenue per booking ($87.50). Add a 2pm session to capture $280/week in lost revenue."

#### **2. ROI-Ranked Recommendations**
Every suggestion includes:
- Expected revenue impact (dollars per week/month)
- Implementation difficulty (Easy/Medium/Hard)
- Payback period or break-even point

#### **3. Customer Intelligence**
- Customer Lifetime Value (CLV) segmentation
- Top customers by spend with churn risk
- At-risk customer identification
- Repeat customer rate vs industry benchmarks

#### **4. Voucher Breakage Tracking**
- Unredeemed voucher balance (pure profit)
- Redemption rates by voucher type
- Breakage rate calculation

#### **5. Cart Recovery Analysis**
- Abandoned cart revenue quantification
- Recovery opportunity with email capture
- Top abandoned items identification

#### **6. Dual Intelligence Engine**
First platform to combine:
- **Capacity utilization** (operational efficiency)
- **Activity profitability** (revenue optimization)
- **Customer lifetime value** (retention focus)

## Example Conversations

### **Example 1: Capacity Optimization**

**User:** "Which time slots should I expand?"

**AI Response:**
Your **2pm Zip Line Adventure** shows 89.2% capacity utilization with $87.50 revenue per booking - your highest-performing activity. You're leaving **$280/week** on the table by not adding sessions during peak demand.

**Key Insights:**
- **Peak Demand Unmet**: 2pm slot hits 89% utilization (industry: 75-85% optimal before expansion)
- **High Revenue Density**: $87.50 per booking vs $52 average - prioritize high-value activities
- **Staff Availability**: 4-5pm slots at 45% utilization suggest staff reallocation opportunity

**Recommended Actions:**

**1. Add 2pm Zip Line Session (Easy, High ROI):** Schedule additional session Tuesday-Saturday. Expected **+$280/week** ($14,560 annually). Break-even at 8 bookings per week.

**2. Consolidate Low Performers (Medium, Immediate Impact):** Combine 8am and 5pm Kayak Tours (43% utilization). Save **$450/week** in staffing costs.

**[Chart: Capacity by Activity]**
**[Chart: Utilization by Time]**

**Follow-Up Questions:**
- Which specific Kayak Tour time slots should I eliminate?
- What's the revenue impact of adding that 2pm Zip Line session?
- How does my utilization compare to last month?
- Which activities have the best profit margin per booked spot?

---

### **Example 2: Customer Intelligence**

**User:** "Who are my most valuable customers?"

**AI Response:**
Your top 5 customers represent **$18,450 in lifetime value** (12% of total revenue). Sarah Johnson leads at $4,280 across 14 bookings, but she's at **medium churn risk** (87 days since last booking).

**Key Insights:**
- **VIP Concentration**: Top 5% of customers generate 27% of revenue - protect these relationships
- **Churn Risk Alerts**: 3 of your top 10 customers haven't booked in 60+ days
- **Segment Performance**: VIP customers (>$1000 spend) have 89% repeat rate vs 23% overall

**Recommended Actions:**

**1. VIP Re-engagement Campaign (Easy, High ROI):** Email top 10 at-risk customers with exclusive 20% discount. Expected recovery: **3 customers = $1,280 revenue**. Cost: $0.

**2. Tiered Loyalty Program (Medium, Sustainable):** Bronze (2 visits) → Silver (5 visits) → Gold (10 visits) with escalating perks. Based on your data, break-even at 22 Silver members, **6-month payback**.

**[Chart: Customer Segments]**
**[Chart: Top Customers by CLV]**

**Follow-Up Questions:**
- What's my customer retention rate?
- How many customers are at high churn risk?
- Which customer segments have the highest profit margins?
- What's the average lifetime value of my customers?

---

### **Example 3: Cart Abandonment**

**User:** "What's my cart abandonment costing me?"

**AI Response:**
You have **147 abandoned carts** worth **$18,600** in the last 30 days. 83 carts have email addresses - a recovery campaign with 15% industry-standard conversion could recover **$2,790/month**.

**Key Insights:**
- **High Abandonment**: 38% cart abandonment rate vs 25-30% industry average
- **Recoverable Revenue**: $10,540 in abandoned carts with email capture
- **Top Abandoned Item**: "Sunset Kayak Tour" appears in 42 abandoned carts ($4,680 lost)

**Recommended Actions:**

**1. Email Recovery Sequence (Easy, Quick Win):** 1-hour abandoned cart email → 24-hour follow-up with 10% discount. Expected **+$2,790/month** (15% recovery rate). Setup time: 2 hours.

**2. Checkout Simplification (Medium, Lasting Impact):** Your 38% abandonment suggests friction at checkout. Reduce form fields by 40%, add guest checkout. Expected **+$3,720/month** (reduce abandonment to 30%).

**[Chart: Cart Abandonment by Item]**
**[Chart: Conversion Funnel Drop-off]**

**Follow-Up Questions:**
- Which items cause the most cart abandonment?
- What's causing customers to abandon at checkout?
- How does my conversion rate compare to industry standards?
- What's the best discount to offer for cart recovery?

## Usage Tips

### **Ask Specific Questions**
- ✅ "Which activities should I expand vs phase out?"
- ✅ "Who are my top 10 customers by lifetime value?"
- ❌ "Tell me about my business" (too broad)

### **Request Dollar Amounts**
- ✅ "How much revenue am I losing to cart abandonment?"
- ✅ "What's the ROI on adding a 2pm Zip Line session?"
- ❌ "Is cart abandonment bad?" (not specific enough)

### **Use Follow-Up Questions**
Click the suggested follow-up buttons to naturally explore deeper insights without retyping questions.

### **Reference Specific Metrics**
- ✅ "What's my capacity utilization for Kayak Tours?"
- ✅ "Which customer segment has the best repeat rate?"
- ✅ "What's my voucher breakage rate?"

## Technical Architecture

### **Frontend:**
- **Component**: `AiAssistant.tsx`
- **Chart Parsing**: `chart-parser.ts` (supports `<CHARTS>` JSON format)
- **Markdown Rendering**: `MarkdownRenderer.tsx` (custom styled output)
- **Dynamic Charts**: `DynamicChart.tsx` (Recharts library)

### **Backend:**
- **AI Service**: `claude-service.ts` (Anthropic Claude API integration)
- **Resova Integration**: `resova-service.ts` (orchestrates all API calls)
- **Core API Service**: `resova-core-service.ts` (Customers, Vouchers, Baskets)
- **Reporting Service**: `resova-reporting-service.ts` (Transactions, Bookings, etc.)
- **Intelligence Transformers**: `customer-intelligence-transformer.ts`

### **AI Context Building:**
The AI receives comprehensive context including:
- Today's operations (bookings, guests, waivers)
- Period summary (revenue, bookings, payments)
- Activity profitability (ranked by total sales)
- Capacity utilization (overall, by activity, by time)
- Customer intelligence (segments, top customers, retention)
- Voucher analytics (sales, redemption, breakage)
- Conversion data (abandonment, recovery opportunity)

### **System Prompt:**
Positions AI as a 15-year veteran business advisor focused on:
- Revenue growth and operational efficiency
- Customer retention and profitability
- Profit-first mindset with ROI calculations
- Industry benchmarks and best practices

## Future Enhancements

### **Planned Features:**

**Q1 2026:**
- Historical trend analysis (capacity over time)
- Demand forecasting (predict busy periods)
- Automated scheduling suggestions
- Progressive Web App (mobile optimization)

**Q2 2026:**
- Dynamic pricing recommendations
- Staff optimization based on capacity
- Marketing campaign targeting for low-utilization slots
- Seasonal capacity planning

**Q3 2026:**
- Channel integration (OTA marketplaces)
- Competitive benchmarking (anonymous aggregates)
- Custom KPI dashboards
- API for third-party integrations

## Support & Feedback

For questions, feature requests, or bug reports:
- GitHub Issues: [resova-ai-analytics/issues](https://github.com/CiaranMcDonaldCS/resova-ai-analytics/issues)
- Documentation: This file and related DOCS_*.md files

---

**Last Updated**: November 2025
**Version**: 1.0
**AI Model**: Claude Sonnet 4.5 (Anthropic)
