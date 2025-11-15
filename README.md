# Resova Intelligence

Enterprise-grade analytics and AI insights for activity operators, tour providers, and entertainment venues using Resova.

![Production Ready](https://img.shields.io/badge/status-production%20ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-Proprietary-blue)

## Overview

Connect to Resova provides comprehensive business analytics by integrating with Resova's Reporting and Core APIs. The platform offers real-time insights, AI-powered analysis, and interactive visualizations to help venue operators make data-driven decisions.

### Key Features

- **AI Business Advisor** - Ask questions in plain English and get instant insights powered by Claude Sonnet 4
- **Revenue Intelligence** - Identify booking patterns, optimize pricing strategies, and forecast demand
- **Operational Analytics** - Track capacity utilization, staff efficiency, and resource allocation
- **Customer Intelligence** - Understand customer behavior and identify your best customers
- **Activity Profitability** - Analyze revenue, costs, and margins by activity
- **Beautiful Dashboard** - Modern, responsive UI with real-time charts and visualizations
- **Production Ready** - Optimized builds, health checks, and comprehensive error handling
- **Secure** - Local credential storage, encrypted API communication, no data leaves your control

## Quick Start

### Prerequisites

- **Node.js** 18.x or later
- **npm** or **yarn**
- **Resova API Key** - Get from your Resova account settings
- **Claude API Key** - Get from [Anthropic Console](https://console.anthropic.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/resova-app/resova-ai-analytics.git

# Navigate into the project
cd resova-ai-analytics

# Install dependencies
npm install
```

### Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Resova API Configuration
NEXT_PUBLIC_RESOVA_API_URL=https://api.resova.us/v1

# Claude AI Configuration
NEXT_PUBLIC_CLAUDE_MODEL=claude-sonnet-4-20250514

# Feature Flags
NEXT_PUBLIC_ENABLE_DEMO=true
```

**Note:** The Resova API URL depends on your region:
- US: `https://api.resova.us/v1`
- EU: `https://api.resova.eu/v1`
- IO: `https://api.resova.io/v1`

### Run Development Server

```bash
# Start the development server
npm run dev

# Or run on a specific port
PORT=3001 npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or your custom port) in your browser.

### First Run

1. Click "Start Free Trial" on the landing page
2. Select your Resova region (US/EU/IO)
3. Enter your Resova API Key
4. Enter your Claude API Key
5. Click "Connect to Resova"

## Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

The production build:
- ✅ Optimizes all assets
- ✅ Generates static pages where possible
- ✅ Minifies JavaScript and CSS
- ✅ Creates standalone deployment package

## Project Structure

```
resova-intelligence-v3/
├── app/
│   ├── api/
│   │   ├── analytics/route.ts       # Analytics data endpoint
│   │   ├── chat/route.ts            # AI chat endpoint
│   │   └── reporting/               # Individual reporting endpoints
│   │       ├── extras/route.ts
│   │       ├── gift-vouchers/route.ts
│   │       └── guests/route.ts
│   ├── components/
│   │   ├── Dashboard.tsx            # Main dashboard with tabs
│   │   ├── LoginScreen.tsx          # Authentication UI
│   │   └── Landing.tsx              # Marketing landing page
│   ├── config/
│   │   └── environment.ts           # Environment configuration
│   ├── context/
│   │   └── AppContext.tsx           # Global state management
│   ├── lib/
│   │   ├── services/
│   │   │   ├── resova-service.ts            # Unified Resova API client (ALL APIs)
│   │   │   ├── claude-service.ts            # Claude AI integration
│   │   │   └── analytics-service.ts         # Service orchestration
│   │   ├── transformers/
│   │   │   ├── resova-data-transformer.ts   # Data transformation
│   │   │   └── customer-intelligence-transformer.ts
│   │   ├── storage/
│   │   │   └── config-storage.ts            # Local storage management
│   │   └── utils/
│   │       ├── logger.ts                    # Logging utility
│   │       └── retry.ts                     # Retry logic
│   ├── types/
│   │   ├── analytics.ts             # Analytics type definitions
│   │   └── resova-core.ts           # Resova Core API types
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── public/
├── .env.local.example
├── package.json
├── tsconfig.json
└── README.md
```

## Architecture

### Data Flow

```
1. User Authentication
   └─> AppContext.login() validates credentials
       └─> Creates AnalyticsService (Production)

2. Data Fetching
   └─> AnalyticsService.getAnalytics()
       └─> ResovaService fetches from ALL APIs in parallel
           ├─> Transactions API (current + previous period)
           ├─> Itemized Revenue API
           ├─> All Bookings API (current + previous + today + future)
           ├─> All Payments API (current + previous period)
           ├─> Inventory Items API
           ├─> Availability Calendar API
           ├─> Customers API (Core - paginated)
           ├─> Gift Vouchers API (Core - paginated)
           └─> Abandoned Carts API (Core - paginated)
       └─> ResovaDataTransformer.transform()
           └─> Returns AnalyticsData with businessInsights

3. AI Chat
   └─> User sends message
       └─> sendMessage() in AppContext
           └─> POST /api/chat with full analytics context
               └─> Claude API generates contextual response
```

### Key Components

#### Services Layer

- **ResovaService**: Unified HTTP client for ALL Resova APIs (19+ methods)
  - Reporting APIs: Transactions, Revenue, Bookings, Payments, Items, Extras, Guests, Gift Vouchers, Availability
  - Core APIs: Items, Customers, Gift Vouchers (single + paginated), Baskets, Abandoned Carts
- **ClaudeService**: AI chat integration with conversation history
- **AnalyticsService**: Service orchestration and credential management
- **ResovaDataTransformer**: Transforms API responses to analytics format
- **CustomerIntelligenceTransformer**: Generates customer insights and predictions

#### Context Layer

- **AppContext**: Global state management (auth, analytics data, chat)
- Provides hooks: `useApp()`, `useAnalytics()`, `useChat()`

#### UI Components

- **Dashboard**: Two-tab interface (Operations / Venue Performance)
- **AIAssistantCard**: Full-width AI chat interface
- **LoginScreen**: Authentication with region selection

## API Integration

### Resova APIs Used

All APIs are consolidated in the `ResovaService` class for unified access.

#### Reporting APIs (19 Total Methods)

1. **Transactions API**
   - Endpoint: `GET /v1/reporting/transactions`
   - Method: `getTransactions(params?)`
   - Returns: Transaction history with bookings, customers, payments

2. **Itemized Revenue API**
   - Endpoint: `GET /v1/reporting/transactions/sales/itemizedRevenues`
   - Method: `getItemizedRevenue(payload)`
   - Returns: Detailed revenue breakdown by item

3. **All Bookings API**
   - Endpoint: `GET /v1/reporting/transactions/bookings/allBookings`
   - Method: `getAllBookings(payload)`
   - Returns: Comprehensive booking data

4. **All Payments API**
   - Endpoint: `GET /v1/reporting/transactions/payments/allPayments`
   - Method: `getAllPayments(payload)`
   - Returns: Payment processing details

5. **Inventory Items API**
   - Endpoint: `POST /v1/reporting/inventory/items`
   - Method: `getInventoryItems(payload)`
   - Returns: Items with sales/booking data

6. **Extras API**
   - Endpoint: `POST /v1/reporting/inventory/extras`
   - Method: `getExtras(payload)`
   - Returns: Add-ons/extras with sales data

7. **Guests API**
   - Endpoint: `POST /v1/reporting/guests`
   - Method: `getGuests(payload)`
   - Returns: Guest details with booking/transaction data

8. **Gift Vouchers API (Reporting)**
   - Endpoint: `POST /v1/reporting/inventory/giftVouchers`
   - Method: `getReportingGiftVouchers(payload)`
   - Returns: Gift vouchers with redemption/usage data

9. **Availability Calendar API**
   - Endpoint: `GET /v1/availability/calendar`
   - Method: `getAvailabilityCalendar(params)`
   - Returns: Calendar availability instances

10. **Daily Availability API**
    - Endpoint: `GET /v1/availability/daily`
    - Method: `getDailyAvailability(itemId, date)`
    - Returns: Daily availability for specific item

#### Core APIs (Single Records)

11. **Item Details API**
    - Endpoint: `GET /v1/items/{id}`
    - Method: `getItem(id)`
    - Returns: Detailed item information

12. **Customer Details API**
    - Endpoint: `GET /v1/customers/{id}`
    - Method: `getCustomer(id)`
    - Returns: Customer details with booking history

13. **Gift Voucher Details API**
    - Endpoint: `GET /v1/vouchers/{id}`
    - Method: `getGiftVoucher(id)`
    - Returns: Single gift voucher details

#### Core APIs (Paginated)

14. **Customers API**
    - Endpoint: `GET /v1/customers`
    - Methods: `getCustomers(page, perPage)`, `getAllCustomers(maxPages)`
    - Returns: Customer list with pagination

15. **Gift Vouchers API**
    - Endpoint: `GET /v1/vouchers`
    - Methods: `getGiftVouchers(page, perPage)`, `getAllGiftVouchers(maxPages)`
    - Returns: Gift voucher list with pagination

16. **Baskets API**
    - Endpoint: `GET /v1/baskets`
    - Methods: `getBaskets(page, perPage, status?)`, `getAbandonedCarts(maxPages)`
    - Returns: Shopping baskets including abandoned carts

#### Main Orchestration

17. **Analytics API (Main Method)**
    - Method: `getAnalytics(dateRange?, includeBusinessInsights?)`
    - Fetches: 11+ parallel API calls for complete analytics
    - Returns: Comprehensive AnalyticsData with business insights

### Authentication

All API requests use `X-API-KEY` header authentication:

```typescript
headers: {
  'X-API-KEY': 'your-resova-api-key',
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}
```

### Date Range Support

Supported ranges: `today`, `yesterday`, `7`, `30`, `90`, `current_week`, `previous_week`, `current_month`, `previous_month`, `current_quarter`, `previous_quarter`

## Configuration

### Environment Variables

Create `.env.local` file (see `.env.example` for full reference):

```bash
# Required API Configuration
NEXT_PUBLIC_RESOVA_API_URL=https://api.resova.io/v1
NEXT_PUBLIC_RESOVA_API_TIMEOUT=30000
NEXT_PUBLIC_CLAUDE_API_URL=https://api.anthropic.com/v1/messages
NEXT_PUBLIC_CLAUDE_MODEL=claude-sonnet-4-20250514
NEXT_PUBLIC_CLAUDE_MAX_TOKENS=4096

# Optional - Application Settings
NEXT_PUBLIC_APP_NAME=Connect to Resova
NEXT_PUBLIC_APP_VERSION=1.0.1
NEXT_PUBLIC_DEBUG=false

# Optional - Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CHAT=true

# Optional - Rate Limiting
NEXT_PUBLIC_RATE_LIMIT_MAX=100
NEXT_PUBLIC_RATE_LIMIT_WINDOW=60000

# Optional - Performance
NEXT_PUBLIC_MAX_CONVERSATION_HISTORY=10
NEXT_PUBLIC_MAX_CHART_DATA_POINTS=100

# Optional - Monitoring (for production)
# NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn-here
```

**Note**: All environment variables are optional with sensible defaults. The `.env.example` file contains comprehensive documentation for all available options.

### API Configuration

Edit `app/config/environment.ts`:

```typescript
export const config = {
  api: {
    resova: {
      baseUrl: process.env.NEXT_PUBLIC_RESOVA_API_BASE_URL || 'https://api.resova.io/v1',
      timeout: parseInt(process.env.NEXT_PUBLIC_RESOVA_API_TIMEOUT || '30000', 10)
    },
    claude: {
      url: process.env.NEXT_PUBLIC_CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages',
      model: process.env.NEXT_PUBLIC_CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
      maxTokens: 1024
    }
  }
};
```

## Features Documentation

### Dashboard - Operations Tab

Daily operational insights:

- **Today's Agenda**: Bookings count, guests, first booking time, waivers required
- **Agenda Chart**: Hourly breakdown of bookings and guests
- **Upcoming Bookings**: Next bookings with waiver status and notes
- **Notifications**: System alerts and staff updates
- **Transactions**: Recent payments and outstanding amounts
- **Booking Notes**: Special requests and instructions
- **Activity Feed**: Staff actions and system events
- **Users**: Staff status and last login times

### Dashboard - Venue Performance Tab

Strategic business analytics:

- **Period Summary**: Gross/net revenue, sales, discounts, refunds, taxes, fees
- **Revenue Trends**: 7-day comparison with previous period
- **Performance Cards**: Best day, top item, peak time
- **Payment Collection**: Paid/unpaid ratio, card vs. cash breakdown
- **Sales Metrics**: Bookings, average revenue, online booking percentage
- **Top Purchased**: Items, extras, and gift vouchers by revenue
- **Guest Metrics**: Total guests, average revenue per guest, group size, repeat rate, no-shows

### Business Insights (New)

Comprehensive business data powered by Core APIs:

- **Items/Services**: All offerings with durations, capacities, pricing, categories
- **Customer Analytics**: Total customers, new customers, repeat rate, top customers by spend
- **Gift Voucher Metrics**: Active vouchers, redemption rate, expiring vouchers
- **Availability Insights**: Utilization rate, peak days, low booking days, capacity metrics

### AI Assistant

Context-aware AI powered by Claude:

- **Operations Context**: Daily operations, bookings, waivers, revenue
- **Venue Performance Context**: Trends, performance, recommendations
- **Full Business Knowledge**: Can answer questions about services, customers, vouchers, availability
- **Suggested Questions**: Context-specific prompts for quick insights
- **Conversation History**: Maintains context across messages

## Development

### Adding New Features

1. **New API Endpoint**:
   - Add method to `ResovaService` class
   - Add TypeScript interface for request/response
   - Add transformation in `ResovaDataTransformer` if needed
   - Update `getAnalytics()` to include new API call

2. **New Analytics Metric**:
   - Add type to `app/types/analytics.ts`
   - Add transformation logic in `ResovaDataTransformer`
   - Add UI component in Dashboard
   - Update AI context in `app/api/chat/route.ts`

3. **New AI Capability**:
   - Update system prompt in `app/api/chat/route.ts`
   - Add suggested questions in Dashboard
   - Ensure analytics context includes necessary data

### Code Style

- TypeScript strict mode enabled
- Functional components with hooks
- Tailwind CSS for styling
- Comprehensive error handling
- Logging with context

### Testing

```bash
# Run type checking
npm run type-check

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

### Production Build

```bash
# Create production build
npm run build

# Test production build locally
npm start
```

### Health Check

The application includes a health check endpoint for monitoring:

```bash
# Check application health
curl http://localhost:3000/api/health
```

Response includes:
- Application status (healthy/unhealthy)
- Version and environment
- Service configuration (Resova, Claude)
- Feature flags

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Environment Variables on Vercel**:

Add in Vercel Dashboard > Settings > Environment Variables:
- `NEXT_PUBLIC_RESOVA_API_URL` (optional - defaults to resova.io)
- `NEXT_PUBLIC_CLAUDE_MODEL` (optional - defaults to claude-sonnet-4)
- `NEXT_PUBLIC_SENTRY_DSN` (optional - for error monitoring)

See `.env.example` for all available options.

### Docker (Optional)

The build is configured with `output: 'standalone'` for containerization:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### Other Platforms

The production build creates a standalone application:

```bash
npm run build
# Deploy .next/standalone folder to your hosting provider
```

## Security

### API Key Storage

- Resova API Key: Stored in `localStorage` (client-side only)
- Claude API Key: Stored in `localStorage` (client-side only)
- Keys are NEVER sent to our servers
- Keys are only sent directly to Resova and Anthropic APIs

### Authentication Flow

1. User enters credentials
2. Test API call validates Resova API key
3. If valid, keys stored locally
4. If invalid, error shown, no access granted

### Security Headers

Production builds include comprehensive security headers:

- **Strict-Transport-Security** - HSTS with preload
- **X-Frame-Options** - Clickjacking protection
- **X-Content-Type-Options** - MIME sniffing prevention
- **X-XSS-Protection** - XSS attack mitigation
- **Referrer-Policy** - Referrer information control
- **Permissions-Policy** - Feature access restrictions
- **Cache-Control** - API response caching control

### Best Practices

- Never commit API keys to git
- Use environment variables for configuration
- Validate all API responses
- Monitor rate limits (default: 100 req/min)
- Use HTTPS in production
- Enable Sentry for error monitoring (optional)
- Review security headers in `next.config.ts`

## Troubleshooting

### Common Issues

**Issue**: "Invalid API credentials" error
- **Solution**: Verify Resova API key is correct
- Check correct region selected (US/EU/IO)
- Ensure API key has necessary permissions

**Issue**: AI assistant not responding
- **Solution**: Check Claude API key is valid
- Verify API quota not exceeded
- Check browser console for errors

**Issue**: Data not loading
- **Solution**: Check network tab for failed requests
- Verify Resova API is accessible
- Try Demo Mode to test UI separately

**Issue**: Build errors
- **Solution**: Delete `.next` folder and `node_modules`
- Run `npm install` again
- Run `npm run build`

### Debugging

Enable detailed logging:

```typescript
// In app/lib/utils/logger.ts
export const DEBUG = true; // Set to true for verbose logs
```

Check logs in browser console for API calls, transformations, and errors.

## Contributing

### Development Workflow

1. Create feature branch
2. Make changes
3. Test locally with `npm run dev`
4. Build with `npm run build`
5. Submit pull request

### Code Review Checklist

- [ ] TypeScript types defined
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Mobile responsive
- [ ] Browser console clean
- [ ] No API keys committed

## Version History

### v3.0.0 (Current - Unified Architecture)
- **Consolidated Service Architecture**: Single `ResovaService` with all 19+ API methods
  - Eliminated nested service layers (ResovaReportingService, ResovaCoreService)
  - Simplified maintenance and debugging
  - All APIs in one place for unified access
- **Complete API Coverage**: All Resova Reporting and Core APIs integrated
  - 7 Reporting APIs (Transactions, Revenue, Bookings, Payments, Items, Extras, Guests, Gift Vouchers)
  - 10 Core/Availability APIs (Items, Customers, Vouchers, Baskets, Calendar, Daily)
  - Paginated endpoints for large datasets
- **Enhanced Data Analysis**: 12-month historical + 90-day forward booking analysis
- **Customer Intelligence**: Advanced customer insights and predictions
- **Production Optimizations**: Security headers, standalone builds, health checks
- **Type Safety**: Comprehensive TypeScript interfaces for all APIs

### v2.0.0
- Resova Reporting APIs integration (Transactions, Revenue, Bookings, Payments)
- Resova Core APIs integration (Items, Gift Vouchers)
- Dual-tab dashboard (Operations + Venue Performance)
- AI assistant with full business context
- Comprehensive business insights
- Secure credential validation

### v1.0.0
- Initial release with basic analytics
- Demo mode support
- Landing page and authentication

## Roadmap

### Short-term (Next 2 weeks)
- [ ] Export to PDF/CSV
- [ ] Email report scheduling
- [ ] Custom date range picker
- [ ] Additional chart types
- [ ] Mobile app optimization

### Medium-term (1-3 months)
- [ ] Multi-user support
- [ ] Role-based access control
- [ ] Custom dashboards
- [ ] Forecasting and predictions
- [ ] Integrations with other platforms

### Long-term (3-6 months)
- [ ] Mobile native apps
- [ ] Advanced ML models
- [ ] A/B testing insights
- [ ] Team collaboration features
- [ ] White-label solution

## Support

For questions, issues, or feature requests:

- Email: [support email]
- Documentation: This README + inline code comments
- Issues: GitHub Issues

## License

[Your License Here]

## Acknowledgments

- Built with Next.js 16 and React 19
- AI powered by Anthropic Claude
- Charts by Recharts
- Icons by Lucide React
- Integrates with Resova APIs

---

**Connect to Resova** - Making venue management smarter with AI 🚀
