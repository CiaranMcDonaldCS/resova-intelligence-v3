# Resova Intelligence V3 - World-Class Design Specification
## Make It The Best AI Assistant Interface in the World

---

## 🎨 DESIGN PHILOSOPHY

**Principle:** "Insights at a glance, actions in one tap, delight in every interaction"

**World-Class Standards We're Matching:**
- Linear (best task management UI)
- Superhuman (email interface perfection)
- Vercel Analytics (data visualization excellence)
- ChatGPT (conversational AI gold standard)
- Apple iOS (interaction design mastery)

---

## 🎯 VISUAL DESIGN SYSTEM

### Color Palette (Refined)

```css
/* Primary Colors */
--background-primary: #0A0E1A;        /* Deeper, richer dark */
--background-secondary: #141824;      /* Card backgrounds */
--background-tertiary: #1C212E;       /* Hover states */
--background-elevated: #242938;       /* Modal/elevated surfaces */

/* Brand Colors */
--brand-primary: #3B82F6;             /* Resova blue (links, CTAs) */
--brand-primary-hover: #2563EB;       /* Hover state */
--brand-primary-light: rgba(59, 130, 246, 0.1);  /* Subtle backgrounds */
--brand-gradient: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);

/* Semantic Colors */
--success: #10B981;                   /* Positive metrics, growth */
--success-light: rgba(16, 185, 129, 0.1);
--warning: #F59E0B;                   /* Attention, opportunities */
--warning-light: rgba(245, 158, 11, 0.1);
--danger: #EF4444;                    /* Urgent, problems */
--danger-light: rgba(239, 68, 68, 0.1);
--info: #3B82F6;                      /* Neutral info */
--info-light: rgba(59, 130, 246, 0.1);

/* Text Colors */
--text-primary: #F9FAFB;              /* Main text */
--text-secondary: #9CA3AF;            /* Secondary text */
--text-tertiary: #6B7280;             /* Disabled, subtle */
--text-inverse: #0A0E1A;              /* Text on light backgrounds */

/* Special Effects */
--glow-success: 0 0 20px rgba(16, 185, 129, 0.3);
--glow-warning: 0 0 20px rgba(245, 158, 11, 0.3);
--glow-danger: 0 0 20px rgba(239, 68, 68, 0.3);
--glow-brand: 0 0 30px rgba(59, 130, 246, 0.4);

/* Borders & Dividers */
--border-primary: rgba(255, 255, 255, 0.08);
--border-secondary: rgba(255, 255, 255, 0.04);
--border-hover: rgba(255, 255, 255, 0.12);
```

---

### Typography System

```css
/* Font Stack */
--font-primary: -apple-system, BlinkMacSystemFont, "Segoe UI",
                "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
--font-mono: "SF Mono", "Consolas", "Monaco", "Courier New", monospace;

/* Type Scale (1.250 - Major Third) */
--text-xs: 0.75rem;      /* 12px - Captions, labels */
--text-sm: 0.875rem;     /* 14px - Body small, secondary */
--text-base: 1rem;       /* 16px - Body text */
--text-lg: 1.125rem;     /* 18px - Emphasis */
--text-xl: 1.25rem;      /* 20px - Small headings */
--text-2xl: 1.5rem;      /* 24px - Section headings */
--text-3xl: 1.875rem;    /* 30px - Page headings */
--text-4xl: 2.25rem;     /* 36px - Hero text */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;

/* Letter Spacing */
--tracking-tight: -0.02em;
--tracking-normal: 0;
--tracking-wide: 0.02em;
```

---

### Spacing System (8px Grid)

```css
--space-1: 0.25rem;   /* 4px - Micro spacing */
--space-2: 0.5rem;    /* 8px - Tight spacing */
--space-3: 0.75rem;   /* 12px - Small spacing */
--space-4: 1rem;      /* 16px - Base spacing */
--space-5: 1.25rem;   /* 20px - Medium spacing */
--space-6: 1.5rem;    /* 24px - Large spacing */
--space-8: 2rem;      /* 32px - Section spacing */
--space-10: 2.5rem;   /* 40px - Major sections */
--space-12: 3rem;     /* 48px - Page sections */
--space-16: 4rem;     /* 64px - Hero spacing */

/* Consistent Padding/Margin Usage */
Card padding: var(--space-4) var(--space-5);     /* 16px 20px */
Section gap: var(--space-6);                      /* 24px */
Component margin: var(--space-4);                 /* 16px */
List item gap: var(--space-3);                    /* 12px */
```

---

### Shadows & Depth

```css
/* Elevation System */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4),
             0 2px 4px -1px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5),
             0 4px 6px -2px rgba(0, 0, 0, 0.4);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.6),
             0 10px 10px -5px rgba(0, 0, 0, 0.5);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.7);

/* Glow Effects (for emphasis) */
--glow-subtle: 0 0 15px rgba(59, 130, 246, 0.2);
--glow-medium: 0 0 25px rgba(59, 130, 246, 0.3);
--glow-strong: 0 0 40px rgba(59, 130, 246, 0.4);
```

---

### Border Radius System

```css
--radius-sm: 0.375rem;   /* 6px - Small elements */
--radius-md: 0.5rem;     /* 8px - Buttons, inputs */
--radius-lg: 0.75rem;    /* 12px - Cards */
--radius-xl: 1rem;       /* 16px - Large cards */
--radius-2xl: 1.5rem;    /* 24px - Modals */
--radius-full: 9999px;   /* Pills, avatars */
```

---

## 🎨 COMPONENT SPECIFICATIONS

### 1. Header Bar (Top Navigation)

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 Resova AI            🔔 (2)     👤 Alex                 │
└─────────────────────────────────────────────────────────────┘
```

**Specifications:**
```css
.header {
  height: 64px;
  padding: 0 var(--space-6);
  background: rgba(10, 14, 26, 0.8);  /* Frosted glass */
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-primary);
  position: sticky;
  top: 0;
  z-index: 100;

  /* Subtle shadow when scrolled */
  box-shadow: 0 1px 0 0 rgba(255, 255, 255, 0.05);
}

.logo {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-tight);
  background: var(--brand-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.notification-badge {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--background-tertiary);
  position: relative;
  transition: all 0.2s ease;
}

.notification-badge:hover {
  background: var(--background-elevated);
  transform: scale(1.05);
}

.notification-badge::after {
  content: "2";
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  background: var(--danger);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--glow-danger);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

---

### 2. "Attention Required" Section (Your Best Feature!)

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ Attention Required                          [Dismiss All]│
├─────────────────────────────────────────────────────────────┤
│  🔴 Low Capacity Alert                                    ⟩ │
│     Saturday is 85% booked. Consider adding new slots.      │
│     Expected impact: +$600/day                              │
│     [Add Slots]  [Create Promo]                            │
│                                                             │
│  🟡 Weekday booking slump                                 ⟩ │
│     Bookings are down 40% on Tuesdays.                     │
│     Expected recovery: +12 bookings                         │
│     [Launch Promo]  [View Details]                         │
└─────────────────────────────────────────────────────────────┘
```

**Specifications:**
```css
.attention-section {
  background: var(--background-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  margin-bottom: var(--space-6);
  box-shadow: var(--shadow-md);
}

.attention-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.attention-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.alert-card {
  background: var(--background-tertiary);
  border-left: 3px solid var(--danger);  /* Color based on priority */
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-3);
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.alert-card:hover {
  background: var(--background-elevated);
  transform: translateX(4px);
  box-shadow: var(--shadow-lg);
}

.alert-card.urgent {
  border-left-color: var(--danger);
  background: rgba(239, 68, 68, 0.05);
}

.alert-card.warning {
  border-left-color: var(--warning);
  background: rgba(245, 158, 11, 0.05);
}

.alert-card.opportunity {
  border-left-color: var(--success);
  background: rgba(16, 185, 129, 0.05);
}

.alert-icon {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-lg);
}

.alert-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.alert-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-3);
}

.alert-impact {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--success-light);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--success);
  margin-bottom: var(--space-3);
}

.alert-actions {
  display: flex;
  gap: var(--space-2);
}

.alert-action-btn {
  padding: var(--space-2) var(--space-4);
  background: var(--brand-primary);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.alert-action-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.alert-action-btn:hover::before {
  width: 300px;
  height: 300px;
}

.alert-action-btn:hover {
  background: var(--brand-primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--glow-medium);
}

.alert-action-btn.secondary {
  background: transparent;
  border: 1px solid var(--border-hover);
  color: var(--text-secondary);
}

.alert-action-btn.secondary:hover {
  background: var(--background-elevated);
  border-color: var(--brand-primary);
  color: var(--text-primary);
  box-shadow: none;
}
```

---

### 3. "Owner's Box" Dashboard (Enhanced)

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Owner's Box                              [Last 7 Days ▾]│
├─────────────────────────────────────────────────────────────┤
│  Today's Revenue          ┃  Upcoming Bookings (7d)         │
│  $1,850                   ┃  124                            │
│  ↑ 8% vs Yesterday        ┃  ↑ 15 vs Last Week              │
│  [mini sparkline chart]   ┃  [mini bar chart]               │
├─────────────────────────────────────────────────────────────┤
│  Capacity                 ┃  Top Product                    │
│  78%                      ┃  VR Escape Room                 │
│  [circular progress]      ┃  $890 today                     │
├─────────────────────────────────────────────────────────────┤
│  Avg Booking Value        ┃  Conversion Rate                │
│  $23.50                   ┃  73%                            │
│  [trend indicator]        ┃  [trend indicator]              │
└─────────────────────────────────────────────────────────────┘
```

**Specifications:**
```css
.owners-box {
  background: linear-gradient(135deg,
    rgba(59, 130, 246, 0.1) 0%,
    rgba(139, 92, 246, 0.1) 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  margin-bottom: var(--space-6);
  position: relative;
  overflow: hidden;
}

.owners-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--brand-gradient);
  box-shadow: var(--glow-brand);
}

.owners-box-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-5);
}

.owners-box-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.time-selector {
  padding: var(--space-2) var(--space-4);
  background: var(--background-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.time-selector:hover {
  background: var(--background-elevated);
  border-color: var(--brand-primary);
  color: var(--text-primary);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

.metric-card {
  background: var(--background-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  transition: all 0.2s ease;
  cursor: pointer;
}

.metric-card:hover {
  background: var(--background-tertiary);
  border-color: var(--brand-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.metric-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.metric-value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-2);
}

.metric-change {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
}

.metric-change.positive {
  background: var(--success-light);
  color: var(--success);
}

.metric-change.negative {
  background: var(--danger-light);
  color: var(--danger);
}

.metric-change.neutral {
  background: var(--info-light);
  color: var(--info);
}

.sparkline {
  width: 100%;
  height: 40px;
  margin-top: var(--space-3);
}

.circular-progress {
  width: 60px;
  height: 60px;
  margin-top: var(--space-3);
  position: relative;
}

.circular-progress svg {
  transform: rotate(-90deg);
}

.circular-progress-bg {
  fill: none;
  stroke: var(--background-elevated);
  stroke-width: 8;
}

.circular-progress-fill {
  fill: none;
  stroke: var(--success);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s ease;
  filter: drop-shadow(0 0 4px var(--success));
}

.circular-progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}
```

---

(Continued in next section due to length...)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
