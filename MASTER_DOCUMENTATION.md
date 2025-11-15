# Resova Intelligence V3 - Master Documentation

**Last Updated**: 2025-11-15
**Version**: 3.0.0
**Status**: Production Ready

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [API Integration](#api-integration)
5. [Features](#features)
6. [Development Workflow](#development-workflow)
7. [Deployment](#deployment)
8. [Testing](#testing)
9. [Documentation Index](#documentation-index)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

### What is Resova Intelligence?

Resova Intelligence is an enterprise-grade analytics and AI platform for activity operators, tour providers, and entertainment venues using Resova. It provides:

- **AI Business Advisor** powered by Claude Sonnet 4
- **Real-time Analytics** from Resova Reporting APIs
- **Interactive Visualizations** for business insights
- **Secure, Local-First** credential storage
- **Production-Ready** infrastructure

### Technology Stack

- **Framework**: Next.js 16.0.1 (App Router)
- **Language**: TypeScript 5.0+
- **AI**: Anthropic Claude Sonnet 4
- **UI**: React 19, Tailwind CSS, Lucide Icons
- **Charts**: Recharts
- **Storage**: localStorage (client-side)
- **APIs**: Resova Reporting + Core APIs

### Key Metrics

- **Lines of Code**: ~15,000 (after refactoring)
- **API Endpoints**: 18+ integrated
- **Components**: 20+ React components
- **Documentation Files**: 28+
- **Test Coverage**: API integration tests available

---

## Quick Start

### Prerequisites

```bash
Node.js: 18.x or later
npm or yarn
Resova API Key (from your Resova account)
Claude API Key (from console.anthropic.com)
```

### Installation

```bash
# Clone the repository
git clone https://github.com/CiaranMcDonaldCS/resova-intelligence-v3.git
cd resova-intelligence-v3

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Configuration

Create `.env.local` with:

```bash
# Resova API Configuration
# Choose one based on your environment:
# Production US: https://api.resova.us/v1
# Production EU: https://api.resova.eu/v1
# Production IO: https://api.resova.io/v1
# Staging: https://api.staging1.resova.io/v1
NEXT_PUBLIC_RESOVA_API_URL=https://api.resova.us/v1

# Claude AI Configuration
NEXT_PUBLIC_CLAUDE_MODEL=claude-sonnet-4-20250514

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_DEMO=false
```

### Run Development Server

```bash
# Start dev server
npm run dev

# Or on custom port
PORT=3001 npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### First-Time Setup

1. Navigate to `/onboarding`
2. Enter your API credentials:
   - Resova API Key
   - Select your datacenter (US/EU/IO/Staging)
   - Claude API Key
3. Select your activity types (30+ options)
4. Configure business details (optional)
5. Complete setup → Dashboard

---

## Architecture

### Application Structure

```
resova-intelligence-v3/
├── app/
│   ├── api/                    # API routes (18+ endpoints)
│   │   ├── chat/              # AI conversation endpoint
│   │   ├── reporting/         # Resova reporting APIs (7)
│   │   └── resova/            # Resova core APIs (11+)
│   ├── components/            # React components
│   │   ├── AccountSetup.tsx   # 3-step onboarding
│   │   ├── AuthGate.tsx       # Route protection
│   │   ├── Dashboard.tsx      # Main dashboard (simplified)
│   │   ├── DarkAiAssistant.tsx # AI chat interface
│   │   ├── ErrorBoundary.tsx  # Error handling
│   │   ├── LoadingScreen.tsx  # Loading states
│   │   └── Settings.tsx       # Settings management
│   ├── context/
│   │   └── AppContext.tsx     # Global state management
│   ├── lib/
│   │   ├── config/            # Configuration files
│   │   │   └── activity-types.ts # 30+ activity definitions
│   │   ├── services/          # Business logic
│   │   │   ├── analytics-service.ts
│   │   │   ├── claude-service.ts
│   │   │   ├── resova-reporting-service.ts
│   │   │   └── resova-core-service.ts
│   │   ├── storage/           # Storage layer
│   │   │   ├── auth-storage.ts
│   │   │   ├── config-storage.ts
│   │   │   └── types.ts
│   │   └── utils/             # Utility functions
│   ├── types/                 # TypeScript definitions
│   ├── onboarding/            # Onboarding flow
│   ├── settings/              # Settings page
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   └── providers.tsx          # Provider wrapper
├── public/                    # Static assets
├── docs/                      # Additional documentation
└── [28 documentation files]   # See Documentation Index
```

### Component Hierarchy

```
ErrorBoundary
  └─ AppProvider (Context)
      └─ AuthGate (Route Protection)
          └─ Layout
              └─ Page Components
                  ├─ Dashboard (/)
                  ├─ AccountSetup (/onboarding)
                  └─ Settings (/settings)
```

### Data Flow

```
User Input
  ↓
Dashboard → AppContext → AnalyticsService
  ↓                         ↓
DarkAiAssistant         ResovaService → Resova APIs
  ↓                         ↓
ClaudeService          API Routes (/api/*)
  ↓                         ↓
Claude API            Response Data
  ↓                         ↓
AI Response ← Transform ← Process
  ↓
Display to User
```

---

## API Integration

### Resova API Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| **Production US** | `https://api.resova.us/v1` | US customers |
| **Production EU** | `https://api.resova.eu/v1` | EU customers |
| **Production IO** | `https://api.resova.io/v1` | International |
| **Staging** | `https://api.staging1.resova.io/v1` | Testing & development |

### Integrated APIs (18+)

#### Reporting APIs (7)
1. **Transactions** - `/api/reporting/transactions`
2. **Itemized Revenue** - `/api/reporting/itemized-revenue`
3. **Bookings** - `/api/reporting/bookings`
4. **Payments** - `/api/reporting/payments`
5. **Extras** - `/api/reporting/extras`
6. **Guests** - `/api/reporting/guests`
7. **Gift Vouchers** - `/api/reporting/gift-vouchers`

#### Core APIs (11+)
1. **Items** - `/api/resova/items`
2. **Item Details** - `/api/resova/items/[id]`
3. **Booking Questions** - `/api/resova/items/[id]/booking-questions`
4. **Reviews** - `/api/resova/items/[id]/reviews`
5. **Extras** - `/api/resova/items/[id]/extras`
6. **Customers** - `/api/resova/customers/[id]`
7. **Gift Vouchers List** - `/api/resova/gift-vouchers`
8. **Gift Voucher Details** - `/api/resova/gift-vouchers/[id]`
9. **Daily Availability** - `/api/resova/availability/daily`
10. **Instance Availability** - `/api/resova/availability/instance/[id]`
11. **Instance Pricing** - `/api/resova/availability/instance/[id]/pricing`

#### Application APIs
- **Chat** - `/api/chat` (AI conversation)
- **Health** - `/api/health` (System health check)

### API Service Classes

```typescript
// ResovaReportingService - 14 methods
getTransactions()
getItemizedRevenue()
getAllBookings()
getAllPayments()
getInventoryItems()
getExtras()
getGuests()
getGiftVouchers()
getItems()
getItem(id)
getCustomer(id)
getAvailabilityCalendar()
getDailyAvailability()
// ... more

// ClaudeService
chat(messages, context)
buildSystemPrompt()
buildActivityPrompts()
// ... more

// AnalyticsService
getAnalytics()
chat(message)
// ... more
```

---

## Features

### 1. AI Business Advisor

**File**: `app/components/DarkAiAssistant.tsx`

- Natural language queries
- Context-aware responses using business data
- Activity-specific insights (30+ activity types)
- Markdown rendering with code syntax highlighting
- Conversation history
- Real-time streaming responses

**Supported Activity Types**:
- Adventure Sports (11 types)
- Water Activities (6 types)
- Air & Sky (3 types)
- Cultural & Educational (4 types)
- Entertainment (3 types)
- Wellness & Fitness (4 types)
- Seasonal & Special Events (3 types)

### 2. Authentication & Onboarding

**Files**:
- `app/components/AuthGate.tsx` - Route protection
- `app/components/AccountSetup.tsx` - 3-step onboarding
- `app/settings/page.tsx` - Settings management

**Flow**:
1. User visits app → AuthGate checks authentication
2. Not authenticated → Redirect to `/onboarding`
3. Complete 3-step setup:
   - **Step 1**: API Credentials (Resova + Claude)
   - **Step 2**: Activity Selection (30+ types)
   - **Step 3**: Business Details (optional)
4. Save to localStorage → Redirect to Dashboard
5. Persistent login across sessions

**Storage**:
- `AuthStorage` - Credentials + login timestamp
- `ConfigStorage` - Activities, business details, onboarding status

### 3. Dashboard

**File**: `app/components/Dashboard.tsx` (154 lines)

**Simplified Design**:
- Single-screen AI Assistant interface
- Fixed header with:
  - Logo + branding
  - Refresh button (reload analytics)
  - Settings button → `/settings`
  - Logout button (with confirmation)
- Full-screen chat experience
- Loading states (via LoadingScreen component)
- Error states with recovery options

**Before Refactoring**: 1,327 lines (multi-tab interface)
**After Refactoring**: 154 lines (88% reduction)

### 4. Settings Page

**File**: `app/settings/page.tsx` (521 lines)

**Features**:
- Tabbed interface (Credentials / Activities / Business)
- Edit API keys and datacenter
- Manage activity types
- Update business information
- Individual save buttons per section
- Logout with confirmation
- "Back to Dashboard" navigation

### 5. Error Handling

**Files**:
- `app/components/ErrorBoundary.tsx` - React error boundary
- `app/components/LoadingScreen.tsx` - Loading states

**Error Boundary**:
- Catches JavaScript errors anywhere in app
- Displays user-friendly fallback UI
- Recovery actions (Try Again, Reload, Go Home)
- Shows error details in development mode
- Prevents app crashes

**Loading States**:
- Full-screen loading with animations
- Inline spinner component (sm/md/lg)
- Bouncing dots animation
- Customizable messages

---

## Development Workflow

### PR-Based Workflow (for 20 engineers)

**Branch Strategy**:
```bash
main (protected)
  ├── feature/your-feature
  ├── fix/bug-fix
  ├── docs/documentation
  └── refactor/code-cleanup
```

**Creating a PR**:

```bash
# 1. Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# 2. Make changes and commit
git add .
git commit -m "feat: Add your feature description"

# 3. Push to remote
git push -u origin feature/your-feature-name

# 4. Create PR on GitHub
gh pr create --title "feat: Your feature" --body "Description"
```

**Commit Message Format** (Conventional Commits):
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Code formatting
refactor: Code refactoring
test: Add tests
chore: Maintenance
```

**PR Requirements**:
- ✅ TypeScript compiles without errors
- ✅ No console errors or warnings
- ✅ Code follows project style
- ✅ Self-reviewed
- ✅ At least 1 approval required

**See**: [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines

### Recent Refactoring (6 PRs)

| PR | Title | Impact |
|----|-------|--------|
| #1 | AccountSetup component | +519 lines |
| #2 | AppContext storage + AuthGate | +146, -34 |
| #3 | Settings page | +521 lines |
| #4 | Remove duplicates | +1, -1507 |
| #5 | Simplify Dashboard | +46, -1207 |
| #6 | Error boundaries + loading | +276, -13 |

**Total**: ~2,680 lines removed, ~990 lines added
**Net**: ~1,690 lines reduction (cleaner codebase)

---

## Deployment

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start

# Or use PM2 for process management
pm2 start npm --name "resova-intelligence" -- start
```

### Environment Variables (Production)

```bash
# Required
NEXT_PUBLIC_RESOVA_API_URL=https://api.resova.us/v1
NEXT_PUBLIC_CLAUDE_MODEL=claude-sonnet-4-20250514

# Optional
NEXT_PUBLIC_ENABLE_DEMO=false
NODE_ENV=production
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-15T07:00:00.000Z",
  "version": "3.0.0"
}
```

### Deployment Platforms

**Recommended**:
- **Vercel** (easiest, optimized for Next.js)
- **Netlify**
- **AWS Amplify**
- **Self-hosted** (Docker, VPS, etc.)

**See**: [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions

---

## Testing

### API Testing

```bash
# Test all reporting APIs
./REPORTING_API_TEST.sh

# Test specific endpoint
curl http://localhost:3000/api/reporting/transactions \
  -H "x-api-key: your-resova-api-key"
```

### Manual Testing Checklist

**Authentication Flow**:
- [ ] Visit `/` without auth → redirects to `/onboarding`
- [ ] Complete onboarding → redirects to Dashboard
- [ ] Refresh page → stays on Dashboard (persistent login)
- [ ] Logout → redirects to `/onboarding`

**Settings Page**:
- [ ] Navigate to `/settings`
- [ ] Edit credentials → save → verify saved
- [ ] Edit activities → save → verify saved
- [ ] Edit business details → save → verify saved
- [ ] Logout → confirm → verify redirect

**Dashboard**:
- [ ] AI Assistant loads correctly
- [ ] Send message → receive response
- [ ] Refresh button → reloads analytics
- [ ] Settings button → navigates to `/settings`
- [ ] Logout button → shows confirmation

**Error Handling**:
- [ ] Error boundary catches errors
- [ ] Loading screen displays during fetch
- [ ] Error states show recovery options

**See**: [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) for comprehensive testing

---

## Documentation Index

### Setup & Getting Started
1. **README.md** - Main project documentation
2. **MASTER_DOCUMENTATION.md** - This file (comprehensive overview)

### Development
3. **CONTRIBUTING.md** - PR workflow and standards
4. **BRANCH_PROTECTION.md** - GitHub branch protection setup
5. **REFACTORING_PLAN.md** - V3 refactoring strategy

### Architecture & Design
6. **DOCS_ARCHITECTURE.md** - System architecture
7. **AUTHENTICATION_DESIGN.md** - Auth flow and security
8. **PHASE_1_COMPLETION.md** - Phase 1 implementation details

### API Integration
9. **INTEGRATION_STATUS.md** - API integration status (18+ endpoints)
10. **DOCS_API.md** - General API documentation
11. **API_TESTING_GUIDE.md** - API testing procedures
12. **API_TESTING.md** - Additional API testing docs

### API-Specific Documentation
13. **EXTRAS_API_DOCUMENTATION.md** - Extras API details
14. **GIFT_VOUCHERS_API_DOCUMENTATION.md** - Gift vouchers API
15. **GUESTS_API_DOCUMENTATION.md** - Guests API

### Features
16. **DOCS_AI_ASSISTANT.md** - AI assistant functionality
17. **DOCS_CAPACITY_UTILIZATION.md** - Capacity tracking

### Deployment & Operations
18. **DEPLOYMENT.md** - Deployment instructions
19. **CHANGELOG.md** - Version history

### Business
20. **COMPETITIVE_STRATEGY.md** - Market positioning
21. **FOCUS_AREAS_REFERENCE.md** - Product focus areas

### Additional Documentation (7+ more files)
- Testing guides
- Component documentation
- Service layer docs
- Type definitions

---

## Troubleshooting

### Common Issues

#### 1. "Invalid API Key" Error

**Symptom**: 401 error when fetching analytics

**Solution**:
```bash
# Check your API key in Settings
# Verify datacenter selection (US/EU/IO/Staging)
# Ensure API key has correct permissions
```

#### 2. "No Analytics Data"

**Symptom**: Dashboard shows "No analytics data available"

**Solution**:
```bash
# Check Resova API key is valid
# Verify you have transactions in selected date range
# Try refreshing with the refresh button
# Check browser console for errors
```

#### 3. Build Errors

**Symptom**: `npm run build` fails

**Solution**:
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build

# Check TypeScript errors
npm run build:check
```

#### 4. localStorage Issues (Safari Private Mode)

**Symptom**: Settings not persisting

**Solution**:
- Safari Private Mode blocks localStorage
- Use regular browsing mode
- Or use different browser (Chrome, Firefox)

#### 5. CORS Errors

**Symptom**: CORS errors in console

**Solution**:
- Use API routes (already configured)
- Don't call Resova/Claude APIs directly from client
- All API calls go through `/api/*` routes

### Getting Help

1. **Check Documentation** - See index above
2. **GitHub Issues** - Report bugs and feature requests
3. **Team Lead** - Contact for urgent issues
4. **Logs** - Check browser console and server logs

---

## Version History

### v3.0.0 (2025-11-15) - Production Ready
- ✅ Complete refactoring (6 PRs merged)
- ✅ Simplified Dashboard (88% smaller)
- ✅ Storage-based authentication
- ✅ Settings page
- ✅ Error boundaries
- ✅ 18+ API endpoints integrated
- ✅ Comprehensive documentation
- ✅ PR-based workflow
- ✅ Team-ready (20 engineers)

### v2.0.0 (Previous)
- Multi-tab Dashboard
- State-based authentication
- Basic API integration

### v1.0.0 (Initial)
- MVP release
- Basic features

---

## Contributing

We welcome contributions from all 20 engineers! Please follow our PR-based workflow:

1. Read [CONTRIBUTING.md](CONTRIBUTING.md)
2. Set up [branch protection](BRANCH_PROTECTION.md)
3. Create feature branch
4. Make changes with tests
5. Submit PR with description
6. Get review and approval
7. Merge to main

---

## License

Proprietary - Resova Intelligence V3
© 2025 All rights reserved

---

## Contact & Support

- **GitHub**: [resova-intelligence-v3](https://github.com/CiaranMcDonaldCS/resova-intelligence-v3)
- **Documentation**: See index above
- **Issues**: Use GitHub Issues

---

**Ready to build amazing analytics experiences! 🚀**
