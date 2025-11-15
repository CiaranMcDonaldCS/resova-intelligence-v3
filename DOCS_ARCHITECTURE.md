# Architecture Documentation

## System Overview

Resova Intelligence is a Next.js 16 application that provides analytics and AI-powered insights for Resova booking platforms. The architecture follows a layered approach with clear separation of concerns.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Landing    │  │    Login     │  │  Dashboard   │      │
│  │    Page      │  │    Screen    │  │  (2 tabs)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                  ┌─────────▼─────────┐                      │
│                  │    AppContext     │                      │
│                  │  (Global State)   │                      │
│                  └─────────┬─────────┘                      │
└────────────────────────────┼──────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────┐
│                  Services Layer                            │
│                             │                              │
│    ┌────────────────────────┼────────────────────────┐    │
│    │    AnalyticsService (Factory)                   │    │
│    │  ┌─────────────┐     ┌─────────────┐           │    │
│    │  │ DemoService │     │ResovaService│           │    │
│    │  └─────────────┘     └──────┬──────┘           │    │
│    └───────────────────────────────┼──────────────────┘    │
│                                    │                       │
│    ┌───────────────────────────────▼───────────────┐      │
│    │      ResovaReportingService                   │      │
│    │  • Transactions API                           │      │
│    │  • Itemized Revenue API                       │      │
│    │  • All Bookings API                           │      │
│    │  • All Payments API                           │      │
│    │  • Items API                                  │      │
│    │  • Gift Vouchers API                          │      │
│    │  • Customers API (by ID)                      │      │
│    │  • Availability API                           │      │
│    └───────────────┬───────────────────────────────┘      │
│                    │                                       │
│    ┌───────────────▼───────────────┐                      │
│    │  ResovaDataTransformer        │                      │
│    │  • transform()                │                      │
│    │  • transformBusinessInsights()│                      │
│    └───────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────┐
│                    External APIs                           │
│                             │                              │
│    ┌────────────────────────┼────────────────┐            │
│    │                        │                │            │
│    ▼                        ▼                ▼            │
│ ┌────────┐         ┌────────────┐    ┌─────────────┐    │
│ │ Resova │         │  Claude AI │    │  Next.js    │    │
│ │  APIs  │         │    API     │    │  API Routes │    │
│ └────────┘         └────────────┘    └─────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Layers

### 1. Frontend Layer

#### Components

**Landing Page** (`app/components/Landing.tsx`)
- Marketing page with hero, features, testimonials
- CTAs for demo mode and login
- No authentication required

**Login Screen** (`app/components/LoginScreen.tsx`)
- Region selection (US/EU/IO)
- API key input (Resova + Claude)
- Demo mode button
- Credential validation before access
- Error handling and loading states

**Dashboard** (`app/components/Dashboard.tsx`)
- Three-tab interface (simplified for operator efficiency):
  - **Operations**: Daily operational insights (Today's Agenda, upcoming bookings)
  - **Venue Performance**: Strategic analytics (revenue, sales, guests)
  - **AI Assistant**: Full-width conversational interface with guided onboarding
- Date range selector (for Venue Performance tab)
- Refresh controls
- Logout functionality

**AI Assistant Card** (within Dashboard)
- Guided onboarding experience with four focus areas:
  - 💰 **Financial Performance**: Revenue, profitability, margins
  - ⚙️ **Operations & Capacity**: Bookings, capacity, efficiency
  - 👥 **Customers & Growth**: Guests, loyalty, retention
  - 📈 **Future & Planning**: Upcoming bookings, demand forecasting
- Auto-generated business insights on first load
- Expandable question prompts for each focus area
- Full conversational interface with markdown rendering
- Dynamic chart generation based on AI responses
- Access to comprehensive data union:
  - **Historical data (6 months)**: All dashboard metrics + raw API responses
  - **Forward-looking data (90 days)**: Future bookings, demand forecasts, capacity planning
  - **Hidden data**: Vouchers, abandoned carts, customer intelligence (not shown in UI tabs)
- Conversation history with follow-up question suggestions
- Real-time Claude API integration with context-aware prompts

#### State Management

**AppContext** (`app/context/AppContext.tsx`)
- Global state provider using React Context API
- Manages:
  - Authentication state
  - Analytics data
  - Chat conversation history
  - Loading/error states
- Provides hooks:
  - `useApp()` - Auth and general state
  - `useAnalytics()` - Analytics data and fetching
  - `useChat()` - Chat functionality

```typescript
interface AppState {
  // Auth
  credentials: Credentials | null;
  isAuthenticated: boolean;
  demoMode: boolean;

  // Analytics
  analyticsData: AnalyticsData | null;
  analyticsLoading: boolean;
  analyticsError: string | null;

  // Chat
  conversationHistory: Message[];
  chatLoading: boolean;
  chatError: string | null;

  // Service
  analyticsService: AnalyticsService | null;
}
```

### 2. Services Layer

#### Analytics Service Factory

**AnalyticsService** (`app/lib/services/analytics-service.ts`)
- Factory pattern for creating appropriate service
- Returns `DemoService` or `ResovaService` based on mode
- Interface:
  ```typescript
  interface AnalyticsService {
    getAnalytics(dateRange?: string): Promise<AnalyticsData>;
    isDemoMode(): boolean;
  }
  ```

#### Demo Service

**DemoService** (`app/lib/services/demo-service.ts`)
- Returns comprehensive mock data
- No external API calls
- Used for testing and demos
- Data includes all dashboard sections + business insights

#### Resova Service

**ResovaService** (`app/lib/services/resova-service.ts`)
- Orchestrates data fetching from multiple APIs
- Calls `ResovaReportingService` for all endpoints
- Parallel fetching with `Promise.all`
- Transforms data using `ResovaDataTransformer`
- Optionally fetches business insights from Core APIs
- Graceful fallback if Core APIs fail

```typescript
async getAnalytics(dateRange?: string, includeBusinessInsights: boolean = true): Promise<AnalyticsData> {
  // 1. Fetch Reporting APIs (parallel)
  const [transactions, revenue, bookings, payments] = await Promise.all([...]);

  // 2. Transform to analytics format
  const analyticsData = ResovaDataTransformer.transform(...);

  // 3. Optionally fetch and add business insights
  if (includeBusinessInsights) {
    const [items, vouchers] = await Promise.all([...]);
    analyticsData.businessInsights = ResovaDataTransformer.transformBusinessInsights(...);
  }

  return analyticsData;
}
```

#### Resova Reporting Service

**ResovaReportingService** (`app/lib/services/resova-reporting-service.ts`)
- Low-level HTTP client for all Resova APIs
- Handles authentication (X-API-KEY header)
- Request timeout management
- Error handling with custom error types
- Methods:
  - `getTransactions(params)` - GET /v1/reporting/transactions
  - `getItemizedRevenue(payload)` - POST /v1/reporting/transactions/sales/itemizedRevenues
  - `getAllBookings(payload)` - POST /v1/reporting/transactions/bookings/allBookings
  - `getAllPayments(payload)` - POST /v1/reporting/transactions/payments/allPayments
  - `getItems()` - GET /v1/items
  - `getItem(id)` - GET /v1/items/{id}
  - `getGiftVouchers()` - GET /v1/gift-vouchers
  - `getGiftVoucher(id)` - GET /v1/gift-vouchers/{id}
  - `getCustomer(id)` - GET /v1/customers/{id}
  - `getDailyAvailability(itemId, date)` - GET /v1/availability/daily

### 3. Transformation Layer

#### Resova Data Transformer

**ResovaDataTransformer** (`app/lib/transformers/resova-data-transformer.ts`)
- Transforms Resova API responses to internal format
- Two main methods:
  1. `transform()` - Transforms Reporting API data
  2. `transformBusinessInsights()` - Transforms Core API data

**Transformation Functions**:

```typescript
// Main transform
static transform(
  transactions: ResovaTransaction[],
  itemizedRevenue: ResovaItemizedRevenue[],
  allBookings: ResovaAllBooking[],
  allPayments: ResovaAllPayment[]
): AnalyticsData

// Business insights
static transformBusinessInsights(
  items: ResovaItem[],
  transactions: ResovaTransaction[],
  allBookings: ResovaAllBooking[],
  vouchers: ResovaGiftVoucher[]
): BusinessInsights
```

**Transformations**:
- Today's Agenda (from bookings)
- Agenda Chart (hourly breakdown)
- Upcoming Bookings (sorted by time)
- Notifications (from transactions)
- Transactions (formatted for display)
- Booking Notes (customer notes)
- Activity Feed (transaction events)
- Period Summary (revenue calculations)
- Revenue Trends (7-day comparison)
- Performance Metrics (best day, top item, peak time)
- Payment Collection (paid/unpaid, card/cash)
- Sales Metrics (bookings by day)
- Sales Summary (aggregations)
- Top Purchased (items, extras, vouchers)
- Guest Metrics (daily guest counts)
- Guest Summary (averages and rates)
- Business Insights:
  - Item Details (services offered)
  - Customer Insights (total, new, repeat, top customers)
  - Voucher Insights (active, redeemed, expiring)
  - Availability Insights (utilization, peak days)

### 4. API Layer

#### Analytics API Route

**`/api/analytics`** (`app/api/analytics/route.ts`)
- GET endpoint for fetching analytics data
- Accepts query params: `apiKey`, `baseUrl`, `dateRange`, `demoMode`
- Returns `AnalyticsApiResponse`
- Server-side service instantiation
- Error handling with appropriate HTTP status codes

#### Chat API Route

**`/api/chat`** (`app/api/chat/route.ts`)
- POST endpoint for AI chat
- Accepts: `message`, `analyticsData`, `conversationHistory`, `claudeApiKey`
- Calls Claude API with system prompt and context
- Returns `ChatResponse` with message and optional suggested questions
- Includes comprehensive system prompt with:
  - Analytics data context
  - Business insights context
  - Formatting instructions
  - Example questions

### 5. Configuration Layer

**Environment Config** (`app/config/environment.ts`)
- Centralized configuration
- Environment variable handling
- Defaults provided
- API URLs and timeouts
- Claude model configuration

**Demo Data** (`app/config/demo-data.ts`)
- Comprehensive mock data
- Matches production data structure
- Includes all dashboard sections
- Business insights included
- Used by `DemoService`

### 6. Types Layer

**Analytics Types** (`app/types/analytics.ts`)
- Complete TypeScript definitions
- Interfaces for:
  - Credentials
  - All analytics data structures
  - API responses
  - Chat messages
  - Service options
  - Error classes
- Ensures type safety across application

## Data Flow

### Authentication Flow

```
1. User submits credentials
   ↓
2. LoginScreen.handleSubmit()
   ↓
3. AppContext.login(credentials)
   ↓
4. Create test AnalyticsService
   ↓
5. Call getAnalytics() to validate
   ↓
6. If valid:
   - Store credentials in state
   - Create production AnalyticsService
   - Mark as authenticated
   If invalid:
   - Throw error
   - Display error message
```

### Analytics Fetching Flow

```
1. User navigates to dashboard or changes date range
   ↓
2. Dashboard calls fetchAnalytics()
   ↓
3. AppContext.fetchAnalytics(dateRange)
   ↓
4. analyticsService.getAnalytics(dateRange)
   ↓
5a. Demo Mode:
    - Return DEMO_ANALYTICS_DATA
   ↓
5b. Production Mode:
    - ResovaReportingService.getTransactions()
    - ResovaReportingService.getItemizedRevenue()
    - ResovaReportingService.getAllBookings()
    - ResovaReportingService.getAllPayments()
    - ResovaReportingService.getItems()
    - ResovaReportingService.getGiftVouchers()
    (All in parallel)
   ↓
6. ResovaDataTransformer.transform()
   ↓
7. ResovaDataTransformer.transformBusinessInsights()
   ↓
8. Return AnalyticsData
   ↓
9. Update AppContext state
   ↓
10. Dashboard re-renders with new data
```

### AI Chat Flow

```
1. User sends message
   ↓
2. AIAssistantCard.handleSend()
   ↓
3. AppContext.sendMessage(message)
   ↓
4. POST /api/chat
   - Body: { message, analyticsData, conversationHistory, claudeApiKey }
   ↓
5. Server-side Claude API call
   - System prompt with analytics context
   - User message
   - Conversation history
   ↓
6. Claude generates response
   ↓
7. Return { message, suggestedQuestions }
   ↓
8. Update conversationHistory in AppContext
   ↓
9. AIAssistantCard re-renders with new message
```

## Security Architecture

### Authentication

- No server-side session management
- API keys stored in `localStorage` (client-side)
- Keys never sent to Resova Intelligence servers
- Keys sent directly to:
  - Resova APIs (for data)
  - Claude API (for AI)

### Validation

- Credential validation via test API call
- Invalid keys rejected before access granted
- Demo mode bypasses validation

### API Key Storage

```typescript
// Stored in localStorage
localStorage.setItem('resova_credentials', JSON.stringify({
  resovaApiKey: 'key',
  resovaApiUrl: 'url',
  claudeApiKey: 'key'
}));
```

### Data Privacy

- No analytics data stored on servers
- All processing happens:
  - Client-side (transformations)
  - Via direct API calls (Resova, Claude)
- No telemetry or tracking beyond standard Next.js logs

## Performance Optimization

### Parallel API Calls

```typescript
// Fetch all APIs in parallel
const [transactions, revenue, bookings, payments] = await Promise.all([
  service.getTransactions(...),
  service.getItemizedRevenue(...),
  service.getAllBookings(...),
  service.getAllPayments(...)
]);
```

### Request Timeout

- Default: 30 seconds per request
- Configurable via environment variables
- AbortController for clean cancellation

### Caching Strategy

- Analytics data cached in AppContext state
- Refresh requires explicit user action
- No automatic polling (to avoid rate limits)

### Loading States

- Global loading indicator during fetch
- Per-component loading states
- Skeleton loaders for better UX

## Error Handling

### Error Types

```typescript
class ApiError extends Error {
  statusCode?: number;
  originalError?: any;
}

class NetworkError extends Error {
  originalError?: any;
}

class ValidationError extends Error {
  fields?: Record<string, string>;
}
```

### Error Propagation

```
ResovaReportingService throws ApiError/NetworkError
  ↓
ResovaService catches and re-throws
  ↓
AppContext catches and sets analyticsError
  ↓
Dashboard displays error message
```

### User-Facing Errors

- Friendly error messages
- Actionable suggestions
- "Try Demo Mode" fallback
- Network error detection

## Scalability Considerations

### Current Limitations

- Single-user (no multi-tenancy)
- No server-side caching
- No database
- Rate limited by Resova APIs

### Future Scaling Options

1. **Add Backend**:
   - Cache API responses
   - Implement rate limiting
   - Store user preferences

2. **Database Layer**:
   - Historical data storage
   - Custom date range queries
   - Faster dashboard loads

3. **Multi-User Support**:
   - User accounts
   - Role-based access
   - Team collaboration

4. **Edge Caching**:
   - CDN for static assets
   - Edge functions for API routes
   - Reduced latency

## Testing Strategy

### Unit Tests (Recommended)

```typescript
// services/resova-service.test.ts
describe('ResovaService', () => {
  it('should fetch and transform data', async () => {
    // Test implementation
  });
});
```

### Integration Tests

- Test full data flow
- Mock external APIs
- Verify transformations
- Check error handling

### E2E Tests

- Playwright or Cypress
- Test user journeys
- Demo mode vs. production mode
- Chat interactions

## Deployment Architecture

### Development

```
npm run dev
  ↓
Next.js Dev Server (localhost:3000)
  ↓
Hot Module Replacement
  ↓
Fast Refresh for React components
```

### Production (Vercel)

```
git push
  ↓
Vercel detects change
  ↓
npm run build
  ↓
Static optimization
  ↓
Edge Network deployment
  ↓
Global CDN distribution
```

### Environment Variables

- `NEXT_PUBLIC_*` variables available client-side
- Non-prefixed variables server-side only
- Configure in Vercel dashboard

## Monitoring & Debugging

### Client-Side Logging

```typescript
// app/lib/utils/logger.ts
export const logger = {
  info: (message: string, data?: any) => console.log(`[INFO] ${message}`, data),
  warn: (message: string, data?: any) => console.warn(`[WARN] ${message}`, data),
  error: (message: string, error?: any) => console.error(`[ERROR] ${message}`, error)
};
```

### Browser DevTools

- Network tab: Monitor API calls
- Console: Check logs and errors
- React DevTools: Inspect component state
- Application tab: Check localStorage

### Production Monitoring

- Vercel Analytics (optional)
- Error tracking (Sentry recommended)
- Performance monitoring
- API usage tracking

## Future Architecture Enhancements

### Short-Term

1. **Add Redis Cache**: Cache API responses for faster loads
2. **WebSocket Support**: Real-time updates
3. **Service Worker**: Offline mode
4. **PWA Features**: Install as app

### Long-Term

1. **Microservices**: Separate data, auth, AI services
2. **GraphQL**: Unified API layer
3. **Real-time Sync**: Multi-device support
4. **ML Pipeline**: Custom predictions
5. **Plugin System**: Extensible architecture

---

## Additional Resources

- [README.md](./README.md) - Setup and usage
- [DOCS_API.md](./DOCS_API.md) - API documentation
- [Resova Developer Docs](https://developers.resova.com/) - Official API docs
- [Next.js Documentation](https://nextjs.org/docs) - Framework docs
- [Claude API Documentation](https://docs.anthropic.com/) - AI API docs
