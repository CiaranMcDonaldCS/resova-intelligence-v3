/**
 * Activity Type Configurations
 *
 * Defines predefined activity types with tailored AI seed prompts.
 * Each activity type has unique business characteristics that influence
 * how the AI provides advice and insights.
 */

import { ActivityType } from '../storage/types';

/**
 * Activity configuration including display info and AI context
 */
export interface ActivityConfig {
  /** Unique identifier matching ActivityType */
  type: ActivityType;

  /** Display label for UI */
  label: string;

  /** Description of activity type */
  description: string;

  /** Icon name (from lucide-react or material icons) */
  icon: string;

  /** AI seed prompt providing business context */
  seedPrompt: string;

  /** Example businesses of this type */
  examples: string[];
}

/**
 * Predefined activity type configurations
 */
export const ACTIVITY_TYPES: ActivityConfig[] = [
  {
    type: 'escape-room',
    label: 'Escape Rooms',
    description: 'Immersive puzzle and adventure experiences',
    icon: 'Key',
    examples: ['Puzzle rooms', 'Adventure escapes', 'Mystery challenges'],
    seedPrompt: `
This venue operates **escape rooms** - immersive puzzle experiences.

## Key Business Characteristics:
- **Fixed time slots**: Experiences are typically 60-90 minutes
- **Room capacity**: Usually 4-8 people per team
- **Turnover-based**: Revenue depends on how many games per day
- **Escape rate matters**: 60-70% is typical, affects difficulty balance
- **One-time experiences**: Repeat customers are less common
- **Review-driven**: Customer experience heavily impacts booking decisions
- **Group bookings**: Teams book together, rarely individuals

## Revenue Optimization:
- Faster escape times = more daily slots available
- Corporate team building is high-value market segment
- Dynamic pricing for peak times (Friday/Saturday evenings)
- Hint systems can improve flow without reducing challenge

## Peak Patterns:
- Evenings and weekends are prime time
- Corporate bookings prefer weekday mornings/afternoons
- Holidays and special occasions drive demand
- Weather-independent (indoor advantage)

## Common Challenges:
- Balancing difficulty (too hard → frustration, too easy → boring)
- Maximizing room utilization between sessions
- Managing group dynamics and late arrivals
- Maintaining puzzle integrity and preventing spoilers

When providing advice, focus on turnover optimization, pricing strategies for peak times, and corporate market development.`,
  },
  {
    type: 'tour',
    label: 'Tours & Experiences',
    description: 'Guided tours, city tours, food tours, adventures',
    icon: 'MapPin',
    examples: ['City tours', 'Food tours', 'Wine tastings', 'Adventure tours'],
    seedPrompt: `
This venue operates **tours and guided experiences**.

## Key Business Characteristics:
- **Weather dependent**: Outdoor tours affected by conditions
- **Guide availability**: Number of guides limits capacity
- **Variable duration**: Tours range from 2 hours to full day
- **Strong seasonality**: Demand varies dramatically by season
- **Review-driven**: Online ratings critical for bookings
- **Language options**: May offer multiple languages
- **Group sizes vary**: Private (2-6) to large groups (20-50+)

## Revenue Optimization:
- Premium pricing for private tours
- Shoulder season promotions to maintain flow
- Multi-tour packages encourage repeat business
- Corporate and group discounts for volume
- Seasonal tour variations (holiday themes)

## Peak Patterns:
- Summer peak for most destinations
- Weekends busier than weekdays
- Holiday periods see spikes
- Weather windows in spring/fall
- Shoulder seasons need marketing push

## Common Challenges:
- Weather cancellations and rescheduling
- Managing no-shows and late arrivals
- Transportation logistics and timing
- Language barriers with international guests
- Maintaining quality across different guides

## Operational Considerations:
- Flexible cancellation policies due to weather
- Guide scheduling and rotation
- Route optimization and timing
- Equipment and materials for guests
- Insurance and safety protocols

When providing advice, consider seasonality, weather impact, guide utilization, and strategies for smoothing demand across seasons.`,
  },
  {
    type: 'class',
    label: 'Classes & Workshops',
    description: 'Cooking classes, art workshops, fitness classes',
    icon: 'GraduationCap',
    examples: ['Cooking classes', 'Art workshops', 'Fitness classes', 'Craft workshops'],
    seedPrompt: `
This venue operates **classes and workshops** - skill-building experiences.

## Key Business Characteristics:
- **Instructor-limited**: Capacity constrained by teacher availability
- **Skill levels**: Offerings segmented (beginner/intermediate/advanced)
- **Materials cost**: Per-participant supplies are variable expenses
- **Optimal class size**: 8-15 students for quality instruction
- **High repeat potential**: Students return for progression
- **Series and memberships**: Recurring revenue opportunities
- **Seasonal themes**: Holiday and occasion-based classes

## Revenue Optimization:
- Class series packages (4-8 weeks) for committed revenue
- Private group bookings for parties and corporate events
- Upsell materials and take-home kits
- Advanced classes for alumni create progression path
- Membership models for regular students

## Peak Patterns:
- Evenings and weekends for hobbyists
- Daytime for retirees and stay-at-home parents
- Seasonal spikes (holiday baking, summer camps)
- Back-to-school period for new activities
- New Year resolutions drive January bookings

## Common Challenges:
- Balancing beginner vs. advanced offerings
- Materials inventory management
- Skill progression and curriculum development
- Instructor scheduling and backup coverage
- Minimum class size for profitability

## Operational Considerations:
- Materials must be ordered ahead based on bookings
- Space setup and cleanup between classes
- Skill assessment for appropriate placement
- Progress tracking for regular students
- Community building among students

When providing advice, focus on retention strategies, series packages, skill progression paths, and community building for long-term revenue.`,
  },
  {
    type: 'event',
    label: 'Events & Venues',
    description: 'Event spaces, party venues, conference rooms',
    icon: 'Calendar',
    examples: ['Wedding venues', 'Conference spaces', 'Party venues', 'Meeting rooms'],
    seedPrompt: `
This venue operates **event and venue rental** services.

## Key Business Characteristics:
- **Long booking windows**: Reserved weeks/months in advance
- **Full-day/half-day blocks**: Not hourly rentals
- **High-value transactions**: Lower volume, higher revenue per booking
- **Customization-heavy**: Each event has unique requirements
- **Fixed capacity**: Space constraints are absolute
- **Setup/breakdown time**: Affects daily capacity
- **Add-on revenue**: Catering, A/V, decor, staffing

## Revenue Optimization:
- Tiered pricing (premium dates vs. off-peak)
- Package deals (venue + catering + services)
- Minimum spend requirements
- Overtime fees for extended events
- Premium for exclusive use
- Corporate contracts for recurring bookings

## Peak Patterns:
- Wedding season (May-October in most regions)
- Holiday parties (November-December)
- Corporate events (Q1 for retreats, Q4 for parties)
- Weekend premium for social events
- Weekday corporate bookings

## Common Challenges:
- Lead time management (long sales cycles)
- Deposit and payment schedules
- Cancellation policies and lost revenue
- Space optimization for different event types
- Managing client expectations and customization requests

## Operational Considerations:
- Detailed contracts required for each booking
- Coordination with vendors (caterers, AV, decorators)
- Insurance and liability management
- Staff scheduling for events
- Inventory management (tables, chairs, equipment)

When providing advice, focus on pricing strategies for peak dates, package optimization, and strategies to fill mid-week and off-season slots.`,
  },
  {
    type: 'rental',
    label: 'Equipment Rentals',
    description: 'Kayaks, bikes, gear, equipment rentals',
    icon: 'Bike',
    examples: ['Kayak rentals', 'Bike rentals', 'Ski/snowboard', 'Camping gear'],
    seedPrompt: `
This venue operates **equipment rental** services.

## Key Business Characteristics:
- **Inventory-constrained**: Available units are hard limit
- **Maintenance-intensive**: Equipment requires regular upkeep
- **Hourly/daily/multi-day rates**: Flexible rental periods
- **Weather-dependent**: Conditions drive demand
- **Peak season concentration**: 70-90% of revenue in season
- **Walk-ins common**: Less advance booking than other activities
- **Age/skill restrictions**: Safety requirements limit market
- **Damage waivers standard**: Risk management critical

## Revenue Optimization:
- Multi-day discounts encourage longer rentals
- Season passes for locals
- Early bird/advance booking incentives
- Group discounts for tours and schools
- Upsell accessories and add-ons
- Delivery and pickup fees for premium service

## Peak Patterns:
- Summer for water sports and bikes
- Winter for snow sports
- Weekends significantly busier
- Weather windows drive spikes
- Holiday periods see peaks
- School vacation periods

## Common Challenges:
- Equipment damage and maintenance downtime
- Inventory optimization (right mix of sizes/types)
- Weather risk and revenue volatility
- Late returns and availability management
- Theft and loss prevention

## Operational Considerations:
- Maintenance schedules between uses
- Size availability (kids, adults, various sizes)
- Safety briefings and skill assessments
- Damage deposits and inspection processes
- Seasonal storage and off-season maintenance

When providing advice, focus on inventory utilization, weather risk mitigation, seasonal pricing strategies, and ways to capture local market with passes/memberships.`,
  },
  {
    type: 'attraction',
    label: 'Attractions & Museums',
    description: 'Museums, amusement parks, zoos, aquariums',
    icon: 'Building',
    examples: ['Museums', 'Zoos', 'Aquariums', 'Theme parks', 'Botanical gardens'],
    seedPrompt: `
This venue operates an **attraction or museum**.

## Key Business Characteristics:
- **Capacity management critical**: Overcrowding degrades experience
- **Timed entry systems**: Control visitor flow
- **Season passes**: Drive recurring revenue and loyalty
- **School groups important**: Educational market segment
- **Operating hours fixed**: Staff costs tied to hours, not visitors
- **Special exhibits**: Create demand spikes and news
- **Family packages critical**: Pricing for groups of 4-6
- **Gift shop/concessions**: Significant ancillary revenue

## Revenue Optimization:
- Dynamic pricing for peak dates (holidays, summer)
- Annual passes with monthly payment options
- Corporate memberships for employee benefits
- Event rentals during closed hours
- Special exhibit premiums
- Behind-the-scenes tours and experiences
- Donor/supporter programs

## Peak Patterns:
- Summer vacation peak
- School field trip season (spring/fall)
- Holidays and long weekends
- Rainy days (for indoor attractions)
- Special exhibit openings
- Free admission days drive volume

## Common Challenges:
- Balancing capacity and experience quality
- Managing peak demand without overcrowding
- Year-round operations vs. seasonal appeal
- Educational mission vs. commercial viability
- Membership cannibalization of single-visit revenue

## Operational Considerations:
- Timed ticket systems for popular exhibits
- Accessibility accommodations required
- Security and safety at scale
- Queue management and wait time messaging
- Educational programming and docent scheduling

When providing advice, focus on capacity optimization, membership growth strategies, special event programming, and balancing visitor experience with revenue goals.`,
  },
  {
    type: 'workshop',
    label: 'Professional Workshops',
    description: 'Professional training, certification courses, skills development',
    icon: 'Briefcase',
    examples: ['Professional training', 'Certification courses', 'Continuing education'],
    seedPrompt: `
This venue operates **professional workshops and training** programs.

## Key Business Characteristics:
- **High price points**: Professional development commands premium
- **B2B focus**: Corporate training contracts are key
- **Multi-day programs**: Often 2-5 day intensive courses
- **Prerequisites required**: Skill validation before enrollment
- **Certification value**: Official credentials drive enrollment
- **Instructor credentials critical**: Expertise is the product
- **Continuing education credits**: Required for many professions
- **Low repeat on same course**: But alumni take advanced courses

## Revenue Optimization:
- Corporate contracts for team training
- Certification bundles (initial + renewal)
- Advanced tracks for progression
- Private/customized corporate programs
- Early bird and group discounts
- Membership for ongoing professional development
- Licensing models for materials

## Peak Patterns:
- Q1 (training budget refresh, New Year goals)
- September (back-to-work mentality)
- Quarterly for recertification cycles
- Mid-week preferred (avoid weekend personal time)
- Avoid year-end holidays and summer vacations

## Common Challenges:
- Instructor availability and quality
- Accreditation and certification maintenance
- Material development and updates
- Minimum class size for profitability (often 8-12)
- Competition from online/self-paced options
- Technology requirements (equipment, software)

## Operational Considerations:
- Detailed curriculum and learning objectives
- Pre-course assessments and materials
- Completion tracking and certification issuance
- Ongoing education for instructors
- Equipment and software licensing
- Corporate invoicing and payment terms

When providing advice, focus on corporate sales strategies, certification program development, instructor quality, and positioning against online alternatives through hands-on value.`,
  },
];

/**
 * Get activity configuration by type
 * @param type Activity type
 * @returns Activity config or undefined
 */
export function getActivityConfig(type: ActivityType): ActivityConfig | undefined {
  return ACTIVITY_TYPES.find((a) => a.type === type);
}

/**
 * Get all activity type options for selection UI
 * @returns Array of selectable options
 */
export function getActivityOptions() {
  return ACTIVITY_TYPES.map((activity) => ({
    value: activity.type,
    label: activity.label,
    description: activity.description,
    icon: activity.icon,
  }));
}

/**
 * Build combined seed prompt from multiple activity types
 * @param activityTypes Selected activity types
 * @returns Combined seed prompt
 */
export function buildActivitySeedPrompt(activityTypes: ActivityType[]): string {
  if (activityTypes.length === 0) {
    return '';
  }

  const prompts = activityTypes
    .map((type) => {
      const config = getActivityConfig(type);
      if (!config) return '';

      return `### ${config.label}\n${config.seedPrompt}`;
    })
    .filter(Boolean);

  return `
## BUSINESS CONTEXT

This venue operates the following types of activities:

${prompts.join('\n\n')}

**Important**: Use this context to provide highly relevant, activity-specific advice. Your recommendations should reflect the unique characteristics, peak patterns, revenue drivers, and operational challenges of these specific activity types. Generic advice is less valuable than tailored insights that show you understand their business model.
`;
}
