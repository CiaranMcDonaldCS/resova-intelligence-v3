# V3 Refactoring & Implementation Plan

## Overview

This plan combines **technical debt cleanup** with **new feature implementation** (authentication, activity-based prompts, API integration) to deliver a production-grade AI business partner.

---

## Critical Technical Debt Identified

### P0 - Critical Issues
1. ✅ **3 duplicate AI assistant components** (~900 lines duplication)
2. ✅ **API keys stored in client state** (security risk)
3. ✅ **27+ `any` types** (type safety issues)
4. ✅ **Multi-tab UI** (conflicts with single-screen vision)
5. ✅ **New APIs not integrated** (18 proxy-only endpoints)

### P1 - High Priority
6. ✅ **Dashboard.tsx is 1,300+ lines** (needs splitting)
7. ✅ **Unused components** (AiAssistant.tsx, AssistantPage.tsx, Landing.tsx)
8. ✅ **Hard-coded values** (266 color codes, repeated strings)
9. ✅ **Missing error handling** (no try/catch in components)

---

## Integrated Implementation Plan

### Phase 1: Foundation & Cleanup (Week 1)

#### Day 1-2: Storage & Authentication System
**Goal**: Implement persistent login with localStorage

**Tasks**:
1. Create storage layer (`/app/lib/storage/`)
   - `auth-storage.ts` - API keys, credentials
   - `config-storage.ts` - Activity types, business settings
   - `types.ts` - AuthData, ConfigData interfaces

2. Remove credentials from AppContext state
   - Move API keys to localStorage
   - Keep only session state in Context
   - Security: Keys never touch React state

3. Create Account Setup flow
   - New component: `AccountSetup.tsx`
   - Step 1: API credentials
   - Step 2: Activity selection
   - Validation before saving

**Files**:
- **New**: `/app/lib/storage/auth-storage.ts`
- **New**: `/app/lib/storage/config-storage.ts`
- **New**: `/app/lib/storage/types.ts`
- **New**: `/app/components/AccountSetup.tsx`
- **Modify**: `/app/context/AppContext.tsx`

**Outcome**: Secure persistent authentication ✅

---

#### Day 3: Activity-Based AI Prompts
**Goal**: Tailor AI responses to activity type

**Tasks**:
1. Create activity configuration
   - Define 7 predefined activity types (escape rooms, tours, etc.)
   - Each has custom seed prompt
   - Support for custom activities

2. Activity selection UI
   - Multi-select checkboxes
   - Custom activity input
   - Preview of what AI will know

3. Update ClaudeService
   - Pass config to constructor
   - Build activity context in system prompt
   - Prepend to analytics context

**Files**:
- **New**: `/app/lib/config/activity-types.ts`
- **New**: `/app/components/ActivitySelection.tsx`
- **Modify**: `/app/lib/services/claude-service.ts` (buildSystemPrompt)
- **Modify**: `/app/types/analytics.ts` (add ConfigData)

**Outcome**: AI provides activity-specific advice ✅

---

#### Day 4-5: Delete Duplicate Components
**Goal**: Remove 900 lines of duplication

**Tasks**:
1. **Delete files**:
   - ❌ `/app/components/AiAssistant.tsx` (372 lines)
   - ❌ `/app/components/AssistantPage.tsx` (114 lines)
   - ❌ `/app/components/Landing.tsx` (unused)
   - ❌ `/app/components/RevenueChart.tsx` (superseded by DynamicChart)

2. **Keep**:
   - ✅ `DarkAiAssistant.tsx` (canonical AI interface)
   - ✅ `DynamicChart.tsx` (handles all chart types)

3. Update imports
   - Remove all references to deleted components
   - Ensure build passes

**Outcome**: 600+ lines deleted, single source of truth ✅

---

### Phase 2: API Integration (Week 2)

#### Day 6-7: Integrate New APIs
**Goal**: Connect 18 new endpoints to AI

**Tasks**:
1. Extend ResovaService
   ```typescript
   // Add methods in resova-service.ts
   async getItems() { /* ... */ }
   async getAvailability(itemId, dates) { /* ... */ }
   async getGiftVouchers() { /* ... */ }
   async getCustomer(customerId) { /* ... */ }
   ```

2. Update getAnalytics() aggregation
   ```typescript
   const analytics = {
     ...existingData,
     catalog: await this.getItems(),
     vouchers: await this.getGiftVouchers(),
   };
   ```

3. Enhance AI context
   ```typescript
   ## AVAILABLE SERVICES
   ${formatCatalog(analyticsData.catalog)}

   ## GIFT VOUCHERS
   ${formatVouchers(analyticsData.vouchers)}
   ```

**Files**:
- **Modify**: `/app/lib/services/resova-service.ts`
- **Modify**: `/app/lib/services/claude-service.ts`
- **Modify**: `/app/types/analytics.ts`

**Outcome**: AI can answer "What services do we offer?" ✅

---

#### Day 8: Remove Tabs, Single-Screen UI
**Goal**: Align with "AI business partner" vision

**Tasks**:
1. **Delete from Dashboard.tsx**:
   - ❌ Tab buttons (Lines 180-202)
   - ❌ Operations tab content (Lines 204-400)
   - ❌ Venue Performance tab content (Lines 472-851)

2. **Simplify Dashboard**:
   ```typescript
   export default function Dashboard() {
     return (
       <div className="h-screen">
         <DarkAiAssistant />
       </div>
     );
   }
   ```

3. **Enhance DarkAiAssistant**:
   - Add proactive greeting on mount
   - Surface key metrics in welcome message
   - Remove focus area cards (keep suggested questions)

**Files**:
- **Modify**: `/app/components/Dashboard.tsx` (reduce from 1,300 to ~100 lines)
- **Modify**: `/app/components/DarkAiAssistant.tsx`

**Outcome**: Clean single-screen AI interface ✅

---

#### Day 9-10: Type Safety Cleanup
**Goal**: Fix `any` types, add proper interfaces

**Tasks**:
1. Define proper interfaces
   ```typescript
   // types/components.ts
   interface ChartProps {
     data: ChartDataPoint[];
     type: ChartType;
     config?: ChartConfig;
   }

   interface TooltipProps {
     active: boolean;
     payload?: TooltipPayload[];
     label?: string;
   }
   ```

2. Replace `any` in components
   - Dashboard.tsx: `VenuePerformance({ data }: any)` → proper interface
   - Charts.tsx: Tooltip props
   - All catch blocks: `catch (error: any)` → `catch (error: Error)`

3. Remove `any` defaults
   - `/app/types/analytics.ts` Line 344: `ApiResponse<T = any>` → `ApiResponse<T>`

**Files**:
- **New**: `/app/types/components.ts`
- **Modify**: 12 files with `any` types

**Outcome**: Full TypeScript type safety ✅

---

### Phase 3: Production Polish (Week 3)

#### Day 11: Settings Page
**Goal**: Allow users to edit credentials and config

**Tasks**:
1. Create Settings component
   - View/edit API keys (masked display)
   - Change activity types
   - Update business name
   - Logout button

2. Add settings route
   - `/app/settings/page.tsx`
   - Protected route (requires authentication)

3. Add settings icon to Dashboard header
   - Top-right gear icon
   - Opens settings page

**Files**:
- **New**: `/app/settings/page.tsx`
- **New**: `/app/components/Settings.tsx`
- **Modify**: `/app/components/DarkAiAssistant.tsx` (add settings button)

**Outcome**: Users can manage their account ✅

---

#### Day 12-13: Error Handling & Loading States
**Goal**: Production-grade UX

**Tasks**:
1. Create ErrorBoundary component
   ```typescript
   class ErrorBoundary extends React.Component {
     componentDidCatch(error, errorInfo) {
       // Log to monitoring service
       // Show user-friendly error UI
     }
   }
   ```

2. Add loading states everywhere
   - Analytics loading: Skeleton cards
   - Chat loading: Typing indicator
   - API calls: Spinners

3. Add error UI
   - Network errors: "Check connection" with retry
   - Auth errors: "Invalid credentials" with re-login
   - AI errors: "Try rephrasing" with suggestions

4. Toast notifications
   - Success: "Settings saved!"
   - Error: "Failed to update"
   - Info: "Refreshing data..."

**Files**:
- **New**: `/app/components/ErrorBoundary.tsx`
- **New**: `/app/components/LoadingState.tsx`
- **New**: `/app/components/Toast.tsx`
- **Modify**: All components with async operations

**Outcome**: Graceful error handling, no crashes ✅

---

#### Day 14-15: Onboarding & First-Use Experience
**Goal**: Guide new users to success

**Tasks**:
1. Create onboarding flow
   - Welcome screen explaining Resova Intelligence
   - Quick tour: "Ask me anything about your business"
   - Sample questions to try first

2. Detect first-time users
   - Check localStorage for onboarding completion
   - Show welcome modal on first dashboard load

3. Empty state handling
   - No analytics data: "Loading your data..."
   - No chat history: "Hi! I'm your AI business partner. Ask me anything!"

**Files**:
- **New**: `/app/components/Onboarding.tsx`
- **New**: `/app/components/WelcomeModal.tsx`
- **Modify**: `/app/components/DarkAiAssistant.tsx`

**Outcome**: Smooth first-time user experience ✅

---

### Phase 4: Optimization & Testing (Week 4)

#### Day 16-17: Performance Optimization
**Goal**: Fast, responsive app

**Tasks**:
1. Implement caching
   - Cache analytics data (5 min TTL)
   - Cache catalog/items (30 min TTL)
   - Skip refetch if data is fresh

2. Memoization
   - Memoize expensive computations (chart data transforms)
   - Use React.memo for pure components
   - useCallback for event handlers

3. Code splitting
   - Lazy load Settings page
   - Lazy load chart libraries
   - Dynamic imports for heavy components

4. Analytics context caching
   - Cache built context string
   - Invalidate only when data changes
   - Reduces AI request payload size

**Files**:
- **New**: `/app/lib/cache/data-cache.ts`
- **Modify**: All services and components

**Outcome**: <3s load times, <1s interactions ✅

---

#### Day 18-19: Extract Hard-Coded Values
**Goal**: Centralize configuration

**Tasks**:
1. Create theme constants
   ```typescript
   // /app/lib/theme/colors.ts
   export const COLORS = {
     primary: '#3B82F6',
     success: '#10B981',
     // ... all 266 color codes
   };
   ```

2. Extract to CSS variables
   ```css
   :root {
     --color-primary: #3B82F6;
     --color-success: #10B981;
   }
   ```

3. API configuration
   ```typescript
   // /app/lib/config/api.ts
   export const API_CONFIG = {
     resova: {
       urls: {
         us: 'https://api.resova.us/v1',
         eu: 'https://api.resova.eu/v1',
         io: 'https://api.resova.io/v1',
       },
       timeout: 30000,
     },
   };
   ```

4. Extract magic numbers
   ```typescript
   const TIMEOUTS = {
     REFRESH_INTERVAL: 60000,
     RETRY_DELAY: 1000,
     MAX_RETRIES: 3,
   };
   ```

**Files**:
- **New**: `/app/lib/theme/colors.ts`
- **New**: `/app/lib/config/constants.ts`
- **Modify**: `globals.css`
- **Modify**: All components with hard-coded values

**Outcome**: Single source of truth for all config ✅

---

#### Day 20: Testing & Documentation
**Goal**: Ensure quality and maintainability

**Tasks**:
1. Manual testing checklist
   - [ ] Account setup flow (first-time user)
   - [ ] Login persistence (refresh page)
   - [ ] Logout (clears all data)
   - [ ] Settings (edit and save)
   - [ ] Activity selection
   - [ ] AI responses with activity context
   - [ ] All 18 APIs working
   - [ ] Error states
   - [ ] Loading states
   - [ ] Mobile responsive

2. Create API testing script
   - Test all 18 endpoints
   - Verify responses
   - Check error handling

3. Documentation
   - Update README with new features
   - API integration guide
   - Deployment instructions
   - Environment variables

**Files**:
- **New**: `/TESTING_CHECKLIST.md`
- **New**: `/DEPLOYMENT_GUIDE.md`
- **Modify**: `/README.md`

**Outcome**: Production-ready, documented codebase ✅

---

## File Changes Summary

### Files to DELETE (7 files, ~700 lines)
- ❌ `/app/components/AiAssistant.tsx`
- ❌ `/app/components/AssistantPage.tsx`
- ❌ `/app/components/Landing.tsx`
- ❌ `/app/components/RevenueChart.tsx`
- ❌ `/app/components/EnhancedChart.tsx` (if unused)
- ❌ Commented code blocks in Dashboard.tsx (Lines 966-979)

### Files to CREATE (20 new files)
1. `/app/lib/storage/auth-storage.ts`
2. `/app/lib/storage/config-storage.ts`
3. `/app/lib/storage/types.ts`
4. `/app/lib/config/activity-types.ts`
5. `/app/lib/config/constants.ts`
6. `/app/lib/config/api.ts`
7. `/app/lib/theme/colors.ts`
8. `/app/lib/cache/data-cache.ts`
9. `/app/types/components.ts`
10. `/app/components/AccountSetup.tsx`
11. `/app/components/ActivitySelection.tsx`
12. `/app/components/Settings.tsx`
13. `/app/components/ErrorBoundary.tsx`
14. `/app/components/LoadingState.tsx`
15. `/app/components/Toast.tsx`
16. `/app/components/Onboarding.tsx`
17. `/app/components/WelcomeModal.tsx`
18. `/app/settings/page.tsx`
19. `/TESTING_CHECKLIST.md`
20. `/DEPLOYMENT_GUIDE.md`

### Files to MODIFY (15 files)
1. `/app/context/AppContext.tsx` - Remove credentials from state
2. `/app/components/Dashboard.tsx` - Remove tabs, simplify to 100 lines
3. `/app/components/DarkAiAssistant.tsx` - Proactive greeting, settings button
4. `/app/lib/services/claude-service.ts` - Activity context, caching
5. `/app/lib/services/resova-service.ts` - Add 8 new methods, caching
6. `/app/types/analytics.ts` - Add ConfigData, remove `any` defaults
7. `/app/components/Charts.tsx` - Extract colors to theme
8. `/app/components/DynamicChart.tsx` - Fix `any` types
9. `/app/api/chat/route.ts` - Enhanced error handling
10. `/app/api/analytics/route.ts` - Enhanced error handling
11. `/globals.css` - Add CSS variables
12. `/README.md` - Update with new features
13. All service files - Fix `any` types
14. All component files - Add proper interfaces
15. `/app/page.tsx` - Update routing logic

---

## Success Metrics

### Code Quality
- ✅ Zero `any` types in public APIs
- ✅ All components have proper TypeScript interfaces
- ✅ No duplicate code (consolidate 900 lines)
- ✅ Single AI assistant implementation
- ✅ <100 lines per component (on average)

### User Experience
- ✅ Login persists across page refreshes
- ✅ Settings page for editing credentials
- ✅ Activity-specific AI responses
- ✅ Single-screen interface (no tabs)
- ✅ Onboarding flow for new users
- ✅ Error handling with recovery options
- ✅ Loading states everywhere

### Technical
- ✅ 18 new APIs integrated and working
- ✅ Analytics data includes catalog, vouchers, availability
- ✅ AI context enhanced with activity types
- ✅ localStorage for persistent state
- ✅ <3s page load time
- ✅ <1s AI response time (excluding Claude API)

### Business
- ✅ Production-ready codebase
- ✅ Secure credential storage
- ✅ Scalable architecture
- ✅ Maintainable (documented, typed)
- ✅ Zero critical technical debt

---

## Timeline

| Week | Focus | Lines Changed | Files Changed |
|------|-------|---------------|---------------|
| Week 1 | Foundation & Cleanup | ~1,200 | 15 |
| Week 2 | API Integration | ~800 | 10 |
| Week 3 | Production Polish | ~600 | 12 |
| Week 4 | Optimization & Testing | ~400 | 8 |
| **Total** | **4 weeks** | **~3,000** | **45** |

---

## Risk Mitigation

### Risk: Breaking existing functionality
**Mitigation**:
- Create feature branch
- Test after each phase
- Keep rollback capability

### Risk: Data migration issues
**Mitigation**:
- Version localStorage schema
- Implement migration functions
- Graceful fallback for missing data

### Risk: Performance degradation
**Mitigation**:
- Profile before/after changes
- Implement caching early
- Monitor bundle size

---

## Ready to Start?

**Recommended approach**: Start with Phase 1, Day 1-2 (Authentication & Storage).

This gives you immediate value:
- ✅ Persistent login (no more logout on refresh)
- ✅ Secure credential storage
- ✅ Foundation for all other features

**Should I begin implementation?**

---

*Let's build a production-grade AI business partner.* 🚀
