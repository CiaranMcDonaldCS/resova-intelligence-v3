# Focus Area Cards - Quick Reference

The Resova AI Analytics dashboard now includes **7 focus area cards** with pre-configured questions for each domain.

## Focus Area Cards Overview

### 1. 🟢 General Overview
**Icon**: Trending Up
**Color**: Green (#4ade80)
**Sample Questions**:
- "Show me my performance overview"
- "What are my top recommended actions?"
- "Provide a concise business summary"

**Use For**: High-level business insights, performance summaries, quick snapshots

---

### 2. 🟡 Financial Performance
**Icon**: Attach Money
**Color**: Yellow (#facc15)
**Sample Questions**:
- "How much revenue did we generate this month?"
- "What's our net margin after expenses?"
- "Show me revenue breakdown by service"

**Use For**: Revenue analysis, profit margins, financial metrics, payment tracking

---

### 3. ⚪ Operations & Capacity
**Icon**: Bar Chart
**Color**: Gray (#9ca3af)
**Sample Questions**:
- "How well are we utilizing capacity?"
- "What are our peak booking times?"
- "Show me today's bookings"

**Use For**: Capacity planning, operational efficiency, booking patterns, resource allocation

---

### 4. 🔵 Customers & Growth
**Icon**: People
**Color**: Blue (#60a5fa)
**Sample Questions**:
- "Who are my top 10 highest value customers?"
- "Show me all guests from the last 30 days"
- "Which customers haven't visited in 90 days?"

**Use For**: Customer analytics, retention analysis, churn prediction, loyalty programs

---

### 5. 🟣 Future & Planning
**Icon**: Calendar Month
**Color**: Purple (#c084fc)
**Sample Questions**:
- "How many bookings do we have next week?"
- "What's our projected revenue?"
- "Which activities need more staff?"

**Use For**: Forecasting, scheduling, resource planning, future bookings

---

### 6. 🟠 Inventory & Extras
**Icon**: Shopping Bag
**Color**: Orange (#fb923c)
**Sample Questions**:
- "What extras are we currently offering?"
- "Which extras generate the most revenue?"
- "Show me stock levels for all extras"

**Use For**: Add-on sales, inventory management, stock tracking, upsell opportunities

**API**: `/api/reporting/extras`
**Documentation**: [EXTRAS_API_DOCUMENTATION.md](EXTRAS_API_DOCUMENTATION.md)

---

### 7. 🌸 Guests & CRM
**Icon**: Person Add
**Color**: Pink (#f472b6)
**Sample Questions**:
- "Show me all guests from the last 30 days"
- "Who are our top spending guests?"
- "Which guests haven't visited in 90 days?"

**Use For**: Guest management, CRM, customer profiles, contact tracking, waiver management

**API**: `/api/reporting/guests`
**Documentation**: [GUESTS_API_DOCUMENTATION.md](GUESTS_API_DOCUMENTATION.md)

---

## Grid Layout

- **Mobile** (< 640px): 2 columns
- **Tablet** (640px - 1024px): 3 columns
- **Desktop** (> 1024px): 7 columns (one row)

## Adding New Questions

To add more questions to a focus area card, edit [app/components/DarkAiAssistant.tsx](app/components/DarkAiAssistant.tsx):

```typescript
const FOCUS_AREAS = [
  {
    id: 'your-area-id',
    icon: YourIcon,
    iconColor: 'text-color-400',
    label: 'Your Label',
    questions: [
      "Your first question here",
      "Your second question here",
      "Your third question here"
    ]
  }
];
```

## Color Palette

The dashboard uses Tailwind's 400-level colors for consistency:

- 🟢 Green 400: `#4ade80` - Success, growth, positive metrics
- 🟡 Yellow 400: `#facc15` - Money, revenue, financial data
- ⚪ Gray 400: `#9ca3af` - Operations, neutral data
- 🔵 Blue 400: `#60a5fa` - Customers, trust, relationships
- 🟣 Purple 400: `#c084fc` - Future, planning, forecasting
- 🟠 Orange 400: `#fb923c` - Inventory, products, items
- 🌸 Pink 400: `#f472b6` - Guests, people, CRM

## Integration Status

| Focus Area | API Endpoint | Status | Documentation |
|------------|--------------|--------|---------------|
| General Overview | N/A | ✅ Active | Built-in |
| Financial Performance | `/api/analytics` | ✅ Active | Built-in |
| Operations & Capacity | `/api/analytics` | ✅ Active | Built-in |
| Customers & Growth | `/api/analytics` | ✅ Active | Built-in |
| Future & Planning | `/api/analytics` | ✅ Active | Built-in |
| Inventory & Extras | `/api/reporting/extras` | ✅ Active | [EXTRAS_API_DOCUMENTATION.md](EXTRAS_API_DOCUMENTATION.md) |
| Guests & CRM | `/api/reporting/guests` | ✅ Active | [GUESTS_API_DOCUMENTATION.md](GUESTS_API_DOCUMENTATION.md) |

## Usage

When a user clicks on a focus area card, the first question from that card's questions array is automatically sent to the AI assistant. This provides a quick way to get started with domain-specific queries.

Users can also:
- Type custom questions in the input field
- Select from suggested questions below the cards
- Click on different cards to switch focus areas

## Customization

Each card can be customized with:
- Different icons from Material-UI icons
- Custom color schemes (must be added to colorMap)
- Up to 3 pre-configured questions
- Unique ID for tracking and analytics
