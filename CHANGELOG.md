# Changelog

All notable changes to Resova Intelligence will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2025-01-15

### Added - AI Enhancement Release
- **Table Support in AI Responses**: Claude can now generate structured data tables alongside charts
  - JSON-based table specifications parsed from AI responses
  - Responsive table UI with hover effects and proper formatting
  - Automatic number formatting (commas for values > 1000)
  - Ideal for revenue breakdowns, activity comparisons, and detailed analytics
- **Revenue Data Visualization**: Enhanced table documentation in AI system prompt
  - Tables highlighted as primary tool for revenue analysis
  - Guidance to use both charts and tables for comprehensive insights
  - Revenue questions benefit from trend charts + precise value tables
- **Resova Knowledge Center Integration**: AI can now reference platform features and documentation
  - Comprehensive platform feature documentation in system prompt
  - 8+ feature categories: Settings, Inventory, Marketing, Payments, Integrations, Reporting, Customer Management
  - Direct article linking capability with format examples
  - Common topic references for Marketing, Email, Discounts, Customers, Reports, Payments, Inventory
- **Intelligent Recommendations**: AI provides actionable advice with Knowledge Center links
  - Feature-specific guidance with step-by-step article references
  - Template text for including helpful documentation links
  - Enhanced example recommendations showing Resova feature integration

### Changed
- **Chart Data Improvements**: Added `convertCentsToDollars()` helper function
  - Automatic detection of cent-based values (> 1000) and conversion to dollars
  - Comprehensive logging for chart data source mapping
  - Fixed revenue display issues in charts
- **AI System Prompt**: Significantly enhanced with structured guidance
  - Table vs chart decision guidance with clear use cases
  - Multi-metric comparison instructions
  - Side-by-side comparison best practices
  - Knowledge Center article linking format and examples

### Technical Details
- Modified [claude-service.ts](app/lib/services/claude-service.ts):
  - Lines 752-784: Table documentation with revenue-specific guidance
  - Lines 831-886: Resova Platform Knowledge section with article links
  - Lines 912-914: Updated example recommendations
- Modified [Dashboard.tsx](app/components/Dashboard.tsx):
  - Lines 196-200: `convertCentsToDollars()` helper function
  - Lines 203-302: `getChartDataFromSource()` with comprehensive logging
  - Lines 820-856: Table rendering UI with responsive design
- Enhanced [layout.tsx](app/layout.tsx): Updated dependencies for Chart.js support
- Updated [globals.css](app/globals.css): Enhanced styling for tables and charts

### Commits
- `7962505`: Table support, chart improvements, revenue conversion fixes
- `eb0121c`: Resova Knowledge Center integration
- `a116225`: Knowledge Center article link guidance

## [1.0.2] - 2025-01-06

### Added - Production Ready Release
- **Environment Configuration**: Comprehensive `.env.example` with 25+ configuration options
  - API configuration (Resova, Claude)
  - Feature flags for analytics and chat
  - Rate limiting configuration
  - Performance tuning options
  - Monitoring setup (Sentry DSN)
  - Security options (CORS)
- **Health Check Endpoint**: `/api/health` for monitoring and status checks
  - Returns application status, version, environment
  - Validates configuration on startup
  - Shows service status (Resova, Claude configured)
- **Security Headers**: Production-grade security in `next.config.ts`
  - Strict-Transport-Security (HSTS)
  - X-Frame-Options (clickjacking protection)
  - X-Content-Type-Options (MIME sniffing prevention)
  - X-XSS-Protection
  - Referrer-Policy
  - Permissions-Policy (camera, microphone, geolocation disabled)
  - Cache-Control for API routes
- **Build Optimizations**:
  - Standalone output for containerization
  - Console removal in production (keeps errors/warnings)
  - Image optimization with remote patterns
  - Compression enabled
  - ETags generated
  - X-Powered-By header removed
- **Configuration Validation**: Environment validation with helpful error messages

### Removed
- **Demo Mode**: Removed all demo mode functionality for production
  - Removed demo mode button from login screen
  - Removed demo-service.ts and demo-data references
  - Removed demo mode logic from AppContext
  - Removed demo mode from AnalyticsService
  - Removed demo mode feature flag
  - All authentication now requires valid API keys

### Changed
- **Authentication**: Simplified login flow - production credentials only
- **Claude API Key**: Now required (was optional in demo mode)
- **LoginScreen**: Cleaner UI without demo mode distractions
- **Environment Config**: Enhanced with parsing helpers and validation
- **API Routes**: Removed demo mode fallback logic

### Technical Details
- Modified `analytics-service.ts` to production-only service
- Updated `AppContext.tsx` to remove demo mode state
- Enhanced `environment.ts` with validation and type-safe parsing
- Added `validateConfig()` function for startup checks
- Created `/api/health/route.ts` for monitoring
- Updated `next.config.ts` with security headers and optimizations

## [1.0.1] - 2025-01-06

### Fixed
- **Period Summary Calculations**: Fixed gross revenue calculation to use `SUM(transactions.paid)` for actual payments received, and total sales to show `SUM(transactions.total)` for the full transaction value
- **Net Revenue Formula**: Corrected net revenue calculation to `Gross - Refunds` (previously incorrectly calculated from base prices)
- **Average Revenue per Booking**: Fixed calculation to use transaction-filtered data instead of all bookings, resolving incorrect $0.24 display (now correctly shows ~$155.61 for $311.22 / 2 bookings)
- **Sales Summary Metrics**: Updated to use transaction data (filtered by date range) instead of all bookings for accurate period-specific calculations

### Changed
- **Chat Input Field**: Enhanced text input visibility by adding `text-gray-900` class for dark text color and `placeholder:text-gray-400` for placeholder contrast
- **Suggested Questions UI**: Added clickable pill-style suggested questions above the chat input field for better discoverability
- **Data Source Alignment**: Ensured all Period Summary metrics (gross, net, taxes, fees) use the same data source (transactions API) for consistency

### Technical Details
- Modified `transformPeriodSummary()` in [resova-data-transformer.ts](app/lib/transformers/resova-data-transformer.ts#L286-L334):
  - Gross: `SUM(transactions.paid)` - Actual revenue received
  - Total Sales: `SUM(transactions.total)` - Full transaction values
  - Net: `gross - refunded`
  - Taxes/Fees: Remain informational aggregates
- Modified `transformSalesSummary()` to accept transactions parameter and calculate averages from period-filtered data
- Updated Dashboard chat interface with improved UX for suggested questions

## [1.0.0] - 2025-01-05

### Added
- **Resova Reporting APIs Integration**
  - Transactions API for transaction history
  - Itemized Revenue API for detailed revenue breakdown
  - All Bookings API for comprehensive booking data
  - All Payments API for payment processing details
- **Resova Core APIs Integration**
  - Items/Services API for product offerings
  - Gift Vouchers API for voucher tracking
- **Dual-Tab Dashboard**
  - Operations tab for daily operational insights
  - Venue Performance tab for strategic analytics
- **AI Assistant**
  - Full-width chat interface in Venue Performance tab
  - Context-aware responses powered by Claude AI
  - Suggested questions based on current tab
  - Conversation history management
  - Business insights integration
- **Comprehensive Business Insights**
  - Items/Services details (durations, capacities, pricing)
  - Customer analytics (total, new, repeat rate, top customers)
  - Gift voucher metrics (active, redeemed, expiring)
  - Availability insights (utilization, peak days)
- **Authentication & Security**
  - Secure credential validation
  - Multi-region support (US/EU/IO)
  - Client-side only API key storage
  - Demo mode with realistic sample data
- **Period Summary Analytics**
  - Gross/Net revenue tracking
  - Sales metrics and trends
  - Discounts, taxes, fees breakdown
  - Refund tracking
- **Revenue Analytics**
  - 7-day revenue trends with period comparison
  - Best day, top item, peak time identification
  - Revenue per booking calculations
- **Payment Analytics**
  - Paid vs unpaid breakdown
  - Card vs cash payment analysis
  - Payment collection rates
- **Guest Analytics**
  - Total guests and group size tracking
  - Average revenue per guest (ARPG)
  - No-show tracking
  - Repeat customer identification
- **Today's Operations**
  - Today's agenda with bookings count
  - Hourly breakdown chart
  - Upcoming bookings list
  - Waiver status tracking
- **UI/UX Features**
  - Responsive design for all screen sizes
  - Loading states and error handling
  - Date range selector
  - Refresh controls
  - Clean, modern interface with Resova branding

### Technical Implementation
- **Architecture**
  - Next.js 16 with React 19
  - TypeScript strict mode
  - Tailwind CSS for styling
  - Context API for state management
- **Services Layer**
  - Factory pattern for Demo/Production services
  - `ResovaReportingService` for all API calls
  - `ResovaDataTransformer` for data normalization
  - Parallel API fetching with `Promise.all`
- **Error Handling**
  - Custom error classes (`ApiError`, `NetworkError`)
  - Graceful fallbacks
  - User-friendly error messages
- **Performance**
  - Parallel API requests
  - Request timeout handling
  - Efficient data transformations

### Documentation
- Comprehensive README.md with setup instructions
- API documentation (DOCS_API.md)
- Architecture documentation (DOCS_ARCHITECTURE.md)
- Inline code comments
- TypeScript type definitions

### Known Limitations
- Single-user only (no multi-tenancy)
- No server-side caching
- No historical data persistence
- Rate limited by Resova APIs (100 req/min)
- Demo mode uses canned AI responses (unless Claude API key provided)

## [Unreleased]

### Planned Features
- Custom date range picker
- Export to PDF/CSV
- Email report scheduling
- Additional chart types (line, pie, area)
- Mobile app optimization
- Multi-user support with roles
- Historical data storage
- Forecasting and predictions
- Advanced ML insights

---

## Version History Summary

- **v1.0.3** (2025-01-15): AI enhancements with table support and Resova Knowledge Center integration
- **v1.0.2** (2025-01-06): Production-ready release with security, monitoring, and optimizations
- **v1.0.1** (2025-01-06): Bug fixes for calculations and UX improvements
- **v1.0.0** (2025-01-05): Initial release with full feature set

---

## Migration Guide

### From v1.0.2 to v1.0.3

**No Migration Required**: This is an enhancement release. All changes are backward compatible and automatically available to users.

**New Features Available**:
- AI can now generate data tables alongside charts for more detailed analysis
- Claude references Resova Knowledge Center articles in recommendations
- Improved revenue visualization with automatic cent-to-dollar conversion
- Enhanced AI responses with platform-specific guidance

**Action Recommended**:
1. Try asking revenue-related questions to see new table formatting
2. Ask for recommendations to see Knowledge Center article links
3. Review improved chart data accuracy for revenue metrics

**Benefits**:
- More comprehensive analytics with table + chart combinations
- Actionable recommendations with direct links to Resova documentation
- Better data visualization with correct currency formatting
- Enhanced AI guidance for using Resova platform features

### From v1.0.1 to v1.0.2

**Breaking Change**: Demo mode has been removed. Users must now provide valid API credentials:
- Resova API Key (required)
- Claude API Key (required - was optional in v1.0.1)

**Action Required**:
1. Copy `.env.example` to `.env.local` and review configuration options
2. Ensure users have valid API keys before logging in
3. Update deployment environment variables if using Vercel/Docker
4. Test health check endpoint: `GET /api/health`

**Benefits**:
- Enhanced security posture
- Production-ready monitoring
- Optimized builds (smaller, faster)
- Better configuration management

### From v1.0.0 to v1.0.1

No migration required - this is a bug fix release. All changes are backward compatible. Users will automatically see:
- Corrected Period Summary numbers
- Improved chat input visibility
- Better suggested questions UI

### Data Impact

**v1.0.2 Changes**:
- Demo mode removed - all users must authenticate with valid credentials
- Health check endpoint added at `/api/health`
- Security headers automatically applied to all responses
- Environment variables can be customized via `.env.local`

**v1.0.1 Changes**:
- **Gross** now correctly shows actual payments received (not transaction totals)
- **Total Sales** now shows the sum of transaction values (not booking count)
- **Average Rev/Booking** now calculates correctly from period-filtered data

These changes provide more accurate financial reporting aligned with Resova's reporting standards.

---

## Contributing

See [README.md](README.md#contributing) for development workflow and contribution guidelines.

## Support

For questions or issues:
- Check documentation: README.md, DOCS_API.md, DOCS_ARCHITECTURE.md
- Review this CHANGELOG for recent changes
- Contact support for assistance

## License

[Your License Here]
