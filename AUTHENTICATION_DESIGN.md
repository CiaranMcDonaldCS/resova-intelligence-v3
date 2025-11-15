# Authentication & Configuration System Design

## Overview

Implement a complete authentication and configuration system with:
1. **Persistent Login** - Save credentials securely, no refresh logout
2. **Account Setup** - One-time configuration with API keys
3. **Activity Selection** - Choose activity types for tailored AI prompts
4. **Activity-Specific AI** - Custom system prompts based on business type

---

## User Flow

### First-Time User
```
1. Landing Page → "Get Started"
2. Account Setup Form:
   - Resova API Key
   - Resova API URL (dropdown: US/EU/IO)
   - Claude API Key
   - Business Name (optional)
3. Activity Selection:
   - "What type of activities do you offer?"
   - Checkboxes: Escape Rooms, Tours, Classes, Events, etc.
   - Custom activity type (text input)
4. Save → Generate activity-specific AI prompt
5. Redirect to Dashboard (AI Assistant)
```

### Returning User
```
1. Landing Page (detects saved credentials)
2. Auto-login → Dashboard
   OR
   "Welcome back, [Business Name]! Continue"
```

### Settings Access
```
Dashboard → Settings Icon (top right)
- View/Edit API Keys
- Change Activity Types
- Update Business Info
- Logout
```

---

## Data Storage Architecture

### Storage Method: `localStorage`

**Why localStorage?**
- ✅ Persists across browser sessions
- ✅ No server/database required
- ✅ Simple implementation
- ✅ Instant read/write
- ⚠️ User must re-authenticate on different devices (acceptable for MVP)

**Security Considerations**:
- Store API keys in localStorage (client-side only)
- Keys never sent to our backend (only to Resova/Claude APIs)
- Clear on logout
- No server storage means no breach risk

### Storage Schema

```typescript
// localStorage keys
const STORAGE_KEYS = {
  AUTH: 'resova_intelligence_auth',
  CONFIG: 'resova_intelligence_config',
  ONBOARDING: 'resova_intelligence_onboarding_complete',
};

// Auth data structure
interface AuthData {
  resovaApiKey: string;
  resovaApiUrl: string;  // 'https://api.resova.us/v1'
  claudeApiKey: string;
  lastLogin: string;     // ISO timestamp
  version: string;       // Schema version for migrations
}

// Config data structure
interface ConfigData {
  businessName?: string;
  activityTypes: ActivityType[];
  customActivities?: string[];
  timezone?: string;
  currency?: string;
  createdAt: string;
  updatedAt: string;
}

// Activity types
type ActivityType =
  | 'escape-room'
  | 'tour'
  | 'class'
  | 'event'
  | 'rental'
  | 'workshop'
  | 'attraction'
  | 'custom';

interface ActivityConfig {
  type: ActivityType;
  label: string;
  description: string;
  seedPrompt: string;  // AI prompt enhancement
}
```

---

## Activity Type Configurations

### Predefined Activity Types

```typescript
const ACTIVITY_TYPES: ActivityConfig[] = [
  {
    type: 'escape-room',
    label: 'Escape Rooms',
    description: 'Immersive puzzle and adventure experiences',
    seedPrompt: `
This venue operates escape rooms. Key considerations:
- Room capacity and turnover rates are critical
- Escape rates and difficulty balance affect reviews
- Group size optimization (teams of 4-8 typically)
- Time slots are fixed (60-90 min experiences)
- Pre-booking is essential, walk-ins rare
- Customer experience heavily reviewed
- Repeat customers less common (one-time experiences)
- Peak times: evenings and weekends
- Corporate team building is a key market segment
`
  },
  {
    type: 'tour',
    label: 'Tours & Experiences',
    description: 'Guided tours, city tours, food tours, etc.',
    seedPrompt: `
This venue operates tours and guided experiences. Key considerations:
- Weather dependency may affect bookings
- Group sizes vary (small private to large bus tours)
- Guide availability is a constraint
- Duration varies widely (2 hours to full day)
- Seasonality has major impact
- Online reviews drive bookings heavily
- Repeat customers common (different tours)
- Language options may be offered
- Transportation and logistics are factors
- Cancellation policies are flexible due to weather
`
  },
  {
    type: 'class',
    label: 'Classes & Workshops',
    description: 'Cooking classes, art workshops, fitness classes',
    seedPrompt: `
This venue operates classes and workshops. Key considerations:
- Instructor availability limits capacity
- Skill levels (beginner/intermediate/advanced) segment offerings
- Materials and supplies are per-participant costs
- Class size affects quality (often capped at 10-15)
- Repeat customers are highly valuable (series/memberships)
- Skill progression encourages return visits
- Seasonal offerings (holiday-themed classes)
- Private group bookings (parties, corporate)
- Upsell opportunities (supplies, take-home kits)
`
  },
  {
    type: 'event',
    label: 'Events & Venues',
    description: 'Event spaces, party venues, conference rooms',
    seedPrompt: `
This venue operates event and venue rental services. Key considerations:
- Full-day or half-day blocks (not hourly)
- High-value transactions, lower volume
- Lead times are longer (weeks/months in advance)
- Customization and add-ons drive revenue
- Capacity is fixed by space constraints
- Setup/breakdown time affects availability
- Catering and A/V are common upsells
- Corporate vs. private events have different needs
- Seasonality (wedding season, holiday parties)
- Deposits and payment terms are complex
`
  },
  {
    type: 'rental',
    label: 'Equipment Rentals',
    description: 'Kayaks, bikes, gear, equipment rentals',
    seedPrompt: `
This venue operates equipment rental services. Key considerations:
- Inventory management is critical
- Equipment maintenance affects availability
- Hourly vs. daily vs. multi-day rates
- Weather heavily impacts demand
- Peak seasons drive majority of revenue
- Walk-ins are common, advance booking less so
- Damage waivers and deposits are standard
- Age/skill requirements for safety
- Group discounts are effective
- Repeat customers (locals vs. tourists)
`
  },
  {
    type: 'attraction',
    label: 'Attractions & Museums',
    description: 'Museums, amusement parks, zoos, aquariums',
    seedPrompt: `
This venue operates an attraction or museum. Key considerations:
- Capacity management prevents overcrowding
- Timed entry tickets control flow
- Season passes drive recurring revenue
- School groups and educational programs
- Operating hours affect staffing costs
- Special exhibits create demand spikes
- Family packages are important
- Gift shop and concessions upsell
- Weather may affect outdoor components
- Accessibility accommodations required
`
  },
  {
    type: 'workshop',
    label: 'Workshops & Training',
    description: 'Professional training, certification courses',
    seedPrompt: `
This venue operates professional workshops and training. Key considerations:
- Certification requirements may apply
- Multi-day or multi-week programs
- Pre-requisites and skill validation
- Higher price points (professional development)
- Corporate training contracts (B2B)
- Materials and certification costs
- Instructor credentials are key to value
- Continuing education credits may be offered
- Completion rates and outcomes matter
- Repeat business for recertification
`
  },
];
```

### Custom Activity Support

Users can add custom activity types with free-text descriptions:
```typescript
{
  type: 'custom',
  label: 'Axe Throwing',
  description: 'Indoor axe throwing lanes and competitions',
  seedPrompt: `
This venue operates custom activities: Axe Throwing.
User description: Indoor axe throwing lanes and competitions.

Tailor advice to this unique activity type based on the description.
`
}
```

---

## AI Prompt Enhancement

### System Prompt Structure

```typescript
function buildSystemPrompt(config: ConfigData): string {
  const basePrompt = `
You are a senior business advisor for Resova Intelligence, an AI-powered analytics platform for activity-based businesses.

Your role is to help venue operators maximize revenue, optimize operations, and improve guest experiences through data-driven insights.
`;

  const activityContext = config.activityTypes.length > 0
    ? `
## BUSINESS CONTEXT

This venue operates the following activity types:
${config.activityTypes.map(type => {
  const activityConfig = ACTIVITY_TYPES.find(a => a.type === type);
  return `
### ${activityConfig?.label}
${activityConfig?.seedPrompt}
`;
}).join('\n')}

Use this context to tailor your advice and insights to their specific business model.
`
    : '';

  const businessInfo = config.businessName
    ? `\n## VENUE NAME\n${config.businessName}\n`
    : '';

  return basePrompt + businessInfo + activityContext + STANDARD_PROMPT_CONTINUATION;
}
```

### Impact on AI Responses

**Without Activity Context**:
```
User: "How can I improve my revenue?"
AI: "Here are general strategies:
1. Increase pricing
2. Offer promotions
3. Upsell add-ons
..."
```

**With Escape Room Context**:
```
User: "How can I improve my revenue?"
AI: "Based on your escape room operations, here are targeted strategies:

1. **Optimize Time Slots**: Your data shows 68% escape rate. Faster teams mean you can add more slots. Consider:
   - Hint system to keep teams moving
   - 75-minute slots instead of 90-minute

2. **Dynamic Pricing**: Saturdays sell out 3 weeks early. Implement surge pricing:
   - Prime time (Fri-Sat evenings): +20%
   - Off-peak (Tue-Thu mornings): -15%

3. **Corporate Packages**: Only 12% of bookings are corporate. This is low. Escape rooms excel at team building:
   - Create dedicated corporate packages
   - Weekday morning availability
   - Include debrief session

Your revenue could increase $2,500/month with these changes.
"
```

---

## Implementation Plan

### Phase 1: Storage Layer (2-4 hours)

**File**: `/app/lib/storage/auth-storage.ts`

```typescript
export class AuthStorage {
  static save(auth: AuthData): void {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(auth));
  }

  static load(): AuthData | null {
    const data = localStorage.getItem(STORAGE_KEYS.AUTH);
    return data ? JSON.parse(data) : null;
  }

  static clear(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }

  static isAuthenticated(): boolean {
    return this.load() !== null;
  }
}
```

**File**: `/app/lib/storage/config-storage.ts`

```typescript
export class ConfigStorage {
  static save(config: ConfigData): void {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }

  static load(): ConfigData | null {
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return data ? JSON.parse(data) : null;
  }

  static update(updates: Partial<ConfigData>): void {
    const current = this.load() || this.getDefaults();
    this.save({ ...current, ...updates, updatedAt: new Date().toISOString() });
  }

  static getDefaults(): ConfigData {
    return {
      activityTypes: [],
      customActivities: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
```

---

### Phase 2: Account Setup UI (4-6 hours)

**File**: `/app/components/AccountSetup.tsx`

```typescript
export default function AccountSetup() {
  const [step, setStep] = useState<'credentials' | 'activities'>('credentials');
  const [formData, setFormData] = useState({
    resovaApiKey: '',
    resovaApiUrl: 'https://api.resova.io/v1',
    claudeApiKey: '',
    businessName: '',
  });
  const [selectedActivities, setSelectedActivities] = useState<ActivityType[]>([]);

  const handleCredentialSubmit = async () => {
    // Validate API keys by making test calls
    const isValid = await validateCredentials(formData);

    if (isValid) {
      AuthStorage.save({
        ...formData,
        lastLogin: new Date().toISOString(),
        version: '1.0',
      });
      setStep('activities');
    }
  };

  const handleActivitySubmit = () => {
    ConfigStorage.save({
      businessName: formData.businessName,
      activityTypes: selectedActivities,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    localStorage.setItem(STORAGE_KEYS.ONBOARDING, 'true');
    router.push('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto">
      {step === 'credentials' && (
        <CredentialsForm data={formData} onChange={setFormData} onSubmit={handleCredentialSubmit} />
      )}
      {step === 'activities' && (
        <ActivitySelection selected={selectedActivities} onChange={setSelectedActivities} onSubmit={handleActivitySubmit} />
      )}
    </div>
  );
}
```

---

### Phase 3: Update AppContext (2-3 hours)

**File**: `/app/context/AppContext.tsx`

```typescript
export function AppProvider({ children }: { children: React.ReactNode }) {
  // Load from storage on mount
  useEffect(() => {
    const auth = AuthStorage.load();
    const config = ConfigStorage.load();

    if (auth && config) {
      // Auto-login
      setCredentials({
        resovaApiKey: auth.resovaApiKey,
        resovaApiUrl: auth.resovaApiUrl,
        claudeApiKey: auth.claudeApiKey,
      });
      setConfig(config);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (credentials: Credentials) => {
    // Validate credentials
    const isValid = await validateCredentials(credentials);

    if (isValid) {
      AuthStorage.save({
        ...credentials,
        lastLogin: new Date().toISOString(),
        version: '1.0',
      });
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    AuthStorage.clear();
    ConfigStorage.clear();
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING);
    setIsAuthenticated(false);
    router.push('/');
  };

  return (
    <AppContext.Provider value={{ credentials, config, login, logout, ... }}>
      {children}
    </AppContext.Provider>
  );
}
```

---

### Phase 4: Update Claude Service (2-3 hours)

**File**: `/app/lib/services/claude-service.ts`

```typescript
export class ClaudeService {
  constructor(
    private apiKey: string,
    private config: ConfigData  // NEW: Pass config
  ) {}

  async chat(analyticsData: AnalyticsData, messages: Message[]): Promise<ChatResponse> {
    const systemPrompt = this.buildSystemPrompt(analyticsData);
    // ... rest of implementation
  }

  private buildSystemPrompt(analyticsData: AnalyticsData): string {
    // Build activity-specific prompt
    const activityContext = this.buildActivityContext();

    const analyticsContext = this.buildAnalyticsContext(analyticsData);

    return `${BASE_SYSTEM_PROMPT}\n\n${activityContext}\n\n${analyticsContext}`;
  }

  private buildActivityContext(): string {
    if (!this.config.activityTypes || this.config.activityTypes.length === 0) {
      return '';
    }

    return `
## BUSINESS CONTEXT

This venue operates the following activity types:

${this.config.activityTypes.map(type => {
  const activity = ACTIVITY_TYPES.find(a => a.type === type);
  return `### ${activity?.label}\n${activity?.seedPrompt}`;
}).join('\n\n')}

**Important**: Use this context to provide highly relevant, activity-specific advice. Your recommendations should reflect the unique characteristics and best practices of these activity types.
`;
  }
}
```

---

### Phase 5: Settings UI (2-3 hours)

**File**: `/app/components/Settings.tsx`

```typescript
export default function Settings() {
  const { credentials, config, logout } = useApp();
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1>Account Settings</h1>

      <section>
        <h2>API Credentials</h2>
        {editMode ? (
          <CredentialsForm />
        ) : (
          <div>
            <p>Resova API: {credentials.resovaApiUrl}</p>
            <p>API Key: {maskApiKey(credentials.resovaApiKey)}</p>
            <button onClick={() => setEditMode(true)}>Edit</button>
          </div>
        )}
      </section>

      <section>
        <h2>Activity Types</h2>
        <ActivitySelection selected={config.activityTypes} onChange={updateActivities} />
      </section>

      <section>
        <h2>Business Info</h2>
        <input value={config.businessName} onChange={updateBusinessName} />
      </section>

      <button onClick={logout} className="text-red-600">Logout</button>
    </div>
  );
}
```

---

## Security Considerations

### What We Store
- ✅ API keys (client-side only, never sent to our servers)
- ✅ Business configuration
- ✅ Activity preferences

### What We DON'T Store
- ❌ Analytics data (fetched fresh each time)
- ❌ Chat history (ephemeral, not persisted)
- ❌ Customer PII from Resova

### Best Practices
1. **Clear on Logout** - All localStorage cleared
2. **No Server Storage** - Keys stay client-side
3. **HTTPS Only** - Enforce in production
4. **Session Validation** - Re-validate keys periodically
5. **Encryption Option** - Consider encrypting localStorage (future enhancement)

---

## Migration Strategy

### For Existing Users (V2 → V3)
1. Detect if user has old credentials in AppContext state
2. Show migration prompt: "Save your credentials?"
3. Guide through account setup
4. Import existing keys automatically

### Schema Versioning
```typescript
interface AuthData {
  version: string;  // '1.0', '1.1', etc.
  // ... fields
}

function migrate(auth: AuthData): AuthData {
  if (auth.version === '1.0') {
    // Migrate to 1.1
    return { ...auth, version: '1.1', newField: defaultValue };
  }
  return auth;
}
```

---

## Testing Checklist

- [ ] First-time user: Complete account setup flow
- [ ] Returning user: Auto-login on page load
- [ ] Logout: All data cleared, redirects to landing
- [ ] Settings: Edit API keys and save
- [ ] Settings: Change activity types
- [ ] AI Prompts: Verify activity context in responses
- [ ] Refresh: User stays logged in
- [ ] Different browser: User must re-authenticate (expected)
- [ ] Invalid credentials: Proper error handling
- [ ] Network errors: Graceful degradation

---

## Timeline

- **Phase 1**: Storage Layer - 2-4 hours
- **Phase 2**: Account Setup UI - 4-6 hours
- **Phase 3**: AppContext Updates - 2-3 hours
- **Phase 4**: Claude Service Enhancement - 2-3 hours
- **Phase 5**: Settings UI - 2-3 hours

**Total**: 12-19 hours

---

## Future Enhancements

1. **Cloud Sync** - Save config to cloud (optional)
2. **Multi-Venue** - Support multiple locations per account
3. **Team Accounts** - Share configuration across team
4. **Activity Templates** - Pre-built prompts from industry experts
5. **Analytics Preferences** - Customize which metrics to track
6. **Notification Settings** - Configure alert thresholds

---

*Building a production-grade AI business partner.* 🚀
