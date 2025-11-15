# Capacity Utilization Intelligence - Integration Documentation

## Overview

The Resova AI Analytics platform now features **advanced capacity utilization analysis** that transforms raw scheduling data into actionable business intelligence. Unlike generic AI assistants, this system is grounded in real-time operational data from the Resova API, providing venue-specific insights that drive profitability.

## What Makes This Different

### Industry-Specific Intelligence
- **Grounded in Real Data**: Analyzes actual availability calendar instances, not hypothetical scenarios
- **Venue-Specific Insights**: Understands your specific activities, time slots, and booking patterns
- **Actionable Recommendations**: Provides concrete steps to optimize scheduling and maximize revenue

### Real-Time Analysis
- Fetches live availability data from Resova's Availability Calendar API
- Processes capacity, bookings, and availability across all activities
- Identifies peak times and underutilized slots automatically

## Technical Implementation

### Data Flow

```
Resova Availability Calendar API
         ↓
ResovaAvailabilityInstance (Type-safe interface)
         ↓
transformCapacityUtilization() (Data transformer)
         ↓
CapacityUtilization Analytics (Structured metrics)
         ↓
Claude AI Context (Business insights)
         ↓
Natural Language Responses + Charts
```

### Key Components

#### 1. API Integration
**File**: `app/lib/services/resova-reporting-service.ts`

```typescript
async getAvailabilityCalendar(params: {
  start_date: string;
  end_date: string;
  item_id?: number;
  item_ids?: number[];
}): Promise<ResovaAvailabilityInstance[]>
```

Fetches scheduled sessions/timeslots with:
- Total capacity per instance
- Current bookings
- Available spots
- Activity details
- Time information

#### 2. Data Transformation
**File**: `app/lib/transformers/resova-data-transformer.ts`

The `transformCapacityUtilization()` method processes raw availability data into:

**Overall Metrics**
- Overall utilization percentage across all activities
- Total capacity (spots available)
- Total booked (confirmed bookings)
- Total available (remaining capacity)

**Per-Activity Analysis**
- Utilization rate by activity
- Capacity vs. booked breakdown
- Session count
- Ranked by utilization efficiency

**Time Slot Intelligence**
- Utilization by time slot
- Peak times identification (>80% utilization)
- Low utilization times (<50% utilization)
- Opportunity analysis for scheduling optimization

#### 3. AI Context Integration
**File**: `app/lib/services/claude-service.ts`

Capacity data is embedded in the AI's analytical context:

```
CAPACITY UTILIZATION:
- Overall Utilization: 67.3%
- Total Capacity: 2,450 spots
- Total Booked: 1,649 spots
- Available Spots: 801

BY ACTIVITY (Top 5 by Utilization):
1. Zip Line Adventure
   - Utilization: 89.2%
   - Capacity: 480 (428 booked, 52 available)
   - Sessions: 24

PEAK TIMES (>80% utilization): 10:00, 11:00, 14:00
LOW UTILIZATION TIMES (<50% utilization): 08:00, 16:00, 17:00
```

## Business Questions the AI Can Answer

### Capacity Optimization
- "What's our overall capacity utilization rate?"
- "Which activities are underutilized?"
- "Which time slots have the most available capacity?"
- "Should I add more sessions for any activities?"

### Revenue Opportunities
- "Where are we leaving money on the table with empty spots?"
- "Which activities should I scale up or down?"
- "When should I run promotional pricing to fill low-demand slots?"

### Operational Efficiency
- "Are we efficiently utilizing our scheduled sessions?"
- "Which activities have the best capacity-to-booking ratio?"
- "What's our peak booking time across all activities?"

### Strategic Planning
- "Should I adjust my capacity during slow periods?"
- "Which new time slots should I add based on demand?"
- "How can I better balance staff allocation across time slots?"

## AI Response Format

The AI provides structured, actionable responses:

### 1. Direct Answer
Immediate response to the specific question with concrete numbers.

**Example**: "Your overall capacity utilization is **67.3%**, with **801 available spots** remaining across all activities this period. Zip Line Adventure leads at **89.2%** utilization, while Kayak Tours sits at only **43.1%**."

### 2. Key Insights
Business implications with recommended actions:
- **Underutilized Inventory**: Identifies activities below 50% utilization with revenue impact
- **Peak Demand Patterns**: Highlights when to add capacity
- **Efficiency Gaps**: Shows where scheduling adjustments could boost bookings

### 3. Recommended Actions
Prioritized by ROI and implementation difficulty:
- Add sessions during peak times
- Consolidate or remove low-performing time slots
- Implement dynamic pricing for off-peak hours
- Cross-promote underutilized activities

### 4. Automatic Visualizations
Charts are generated in `<CHARTS>` JSON format:

```json
[
  {
    "type": "bar",
    "dataSource": "capacity_by_activity",
    "title": "Capacity Utilization by Activity",
    "description": "Shows which activities are over/under-utilized"
  },
  {
    "type": "line",
    "dataSource": "utilization_by_time",
    "title": "Utilization Throughout the Day",
    "description": "Identifies peak and low-demand time slots"
  }
]
```

### 5. Follow-up Questions
Context-aware suggestions to dig deeper:
- "Which specific time slots should I eliminate for Kayak Tours?"
- "What's the revenue impact of adding one more Zip Line session at 2pm?"
- "How does my utilization compare to last month?"

## Competitive Advantages

### vs. ROLLER iQ

| Feature | Resova AI Analytics | ROLLER iQ |
|---------|---------------------|-----------|
| **Real-time Data** | ✅ Live Resova API integration | ✅ Live ROLLER data |
| **Capacity Analysis** | ✅ Detailed utilization metrics | ⚠️ Not explicitly mentioned |
| **Activity Profitability** | ✅ Revenue + Utilization combined | ⚠️ Unknown |
| **Time Slot Intelligence** | ✅ Peak/low utilization by hour | ⚠️ Unknown |
| **Natural Language** | ✅ Conversational Claude AI | ✅ AI Assistant |
| **Auto Visualizations** | ✅ Dynamic chart generation | ⚠️ Unknown |
| **Mobile Access** | ⚠️ Web-based (responsive) | ✅ Desktop + Mobile app |
| **Channel Integration** | ❌ Not yet | ✅ Google, Viator, etc. |
| **Price Automation** | ❌ Not yet | ✅ Dynamic pricing rules |

### Unique Differentiators

**1. Dual Intelligence**: Combines capacity utilization with activity profitability
- See which activities are both profitable AND efficiently using capacity
- Identify high-revenue activities that need more sessions
- Find low-performing activities consuming valuable scheduling bandwidth

**2. Granular Time Intelligence**
- Hourly breakdown of utilization rates
- Automatic peak/low time identification
- Scheduling optimization recommendations

**3. Conversational Analysis**
- Ask follow-up questions naturally
- Dig deeper into specific metrics
- Get explanations tailored to your business context

**4. Visual Insights**
- Automatic chart generation based on questions
- Multiple visualization types (bar, line, pie, funnel)
- Exportable data for presentations

## Initial Chat Experience

When users first open the AI Assistant, they see:

### Welcome Message
```
Hi! I'm your AI business advisor, here to help you maximize revenue
and efficiency for your tour and activity business.

I have access to your analytics data including revenue, bookings,
capacity utilization, and activity profitability. Ask me anything
about your business performance!
```

### Suggested Questions (Randomized)
The AI suggests 4 business-focused questions:
- "Where are my biggest profit leaks and how do I fix them?"
- "Which services should I expand vs phase out?"
- "How can I increase revenue without adding capacity?"
- "When are my most profitable time slots?"
- "Should I adjust my capacity during slow periods?"
- "Which pricing changes would maximize profit?"

### After Each Response
The AI provides 3-4 contextual follow-up questions specific to what was just discussed, helping operators dig deeper into insights.

## Example Conversation

**User**: "What's my capacity utilization looking like?"

**AI**:
Your overall capacity utilization is **67.3%** across all activities, with **1,649 spots booked** out of **2,450 total capacity**. You have **801 available spots** that could generate additional revenue.

### Key Insights

- **High Performers**: Zip Line Adventure (89.2% utilization) and Rock Climbing (76.4%) are near capacity
- **Underutilized Assets**: Kayak Tours at 43.1% and Sunset Hike at 38.7% have significant empty inventory
- **Peak Window**: 10am-2pm shows 80%+ utilization, while early morning (8am) and late afternoon (4-5pm) drop below 40%

### Recommended Actions

**1. Add Peak Sessions (Easy, High ROI)**: Schedule one additional Zip Line session at 2pm. At 89.2% utilization, you're turning away revenue. Expected **+$280/week**.

**2. Consolidate Low Performers (Medium, Immediate Impact)**: Combine 8am and 5pm Kayak Tours into single 9am slot. Reduces operational costs while maintaining service. **Save $450/week** in staffing.

**3. Dynamic Pricing for Off-Peak (Easy, Quick Win)**: Offer 15% discount for 4-5pm Sunset Hike bookings. Fill 38.7% utilization gap. Potential **+$320/week** at marginal cost.

<CHARTS>
[
  {
    "type": "bar",
    "dataSource": "capacity_by_activity",
    "title": "Capacity Utilization by Activity",
    "description": "Shows which activities are efficiently using scheduled capacity"
  }
]
</CHARTS>

### Follow-up Questions
- Which specific Kayak Tours time slots should I eliminate?
- What's the revenue impact of adding that 2pm Zip Line session?
- How does my utilization compare to last month?
- Which activities have the best profit margin per booked spot?

---

**User**: "Which specific Kayak Tours time slots should I eliminate?"

**AI**:
Based on your capacity utilization data, you should eliminate these **3 Kayak Tours time slots**:

1. **8:00am** - 22.4% utilization (6 of 8 spots booked on average)
2. **4:00pm** - 31.2% utilization (10 of 12 spots)
3. **5:30pm** - 18.9% utilization (5 of 8 spots)

These three slots average **24.2% utilization** and cost approximately **$340/week** in staff and operational expenses while generating minimal revenue.

### Consolidation Strategy

**Merge morning demand** into 9:00am and 10:30am slots (both at 68% utilization)
**Move afternoon stragglers** to 2:00pm slot (72% utilization)

**Expected outcome**: Reduce Kayak Tours from 8 to 5 daily sessions, maintain 95% of current bookings, **save $450/week**, improve remaining slots to 75%+ utilization.

---

## Data Refresh

- Capacity utilization data updates when the dashboard date range changes
- AI always works with the currently selected time period
- Historical trends available for 6 months of data

## Future Enhancements

### Planned Features
- Historical capacity trends over time
- Demand forecasting based on booking patterns
- Automated scheduling recommendations
- Integration with Resova's scheduling system for one-click adjustments

### Potential Integrations
- Dynamic pricing rules based on utilization
- Staff scheduling optimization
- Marketing campaign targeting for low-utilization slots
- Seasonal capacity planning

## Developer Notes

### Adding New Metrics

To extend capacity analysis:

1. **Update Interface** (`app/types/analytics.ts`)
2. **Enhance Transformer** (`resova-data-transformer.ts`)
3. **Update AI Context** (`claude-service.ts`)
4. **Document in System Prompt** (guide AI on new data)

### Performance Considerations

- Availability API called in parallel with other analytics data
- Data cached at dashboard level
- Transformations optimize using Map/reduce patterns
- No N+1 queries - single batch fetch

---

## Beating ROLLER iQ

### Our Advantages

**Deeper Capacity Intelligence**
- Granular time slot analysis (not just overall metrics)
- Combined profitability + utilization view
- Automatic opportunity identification

**Better AI Integration**
- Conversational follow-up questions
- Context-aware recommendations
- Visual chart generation
- Industry-specific business advisor tone

**Resova-Native**
- Built specifically for Resova customers
- Direct API integration (no middleware)
- Optimized for Resova's data structures

### Areas to Develop

**Mobile Experience**: Build native mobile app or PWA
**Channel Management**: Integrate with OTA platforms
**Dynamic Pricing**: Automated price rules based on utilization
**Predictive Analytics**: ML-based demand forecasting

---

**Generated with Claude Code**
**Last Updated**: November 2025
