/**
 * Activity Type Configurations
 *
 * Comprehensive activity types matching Resova's supported activities.
 * Each activity type has tailored AI seed prompts based on industry best practices.
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

  /** Icon name (from lucide-react) */
  icon: string;

  /** Category for grouping in UI */
  category: string;

  /** AI seed prompt providing business context */
  seedPrompt: string;
}

/**
 * Predefined activity type configurations
 * Organized by category
 */
export const ACTIVITY_TYPES: ActivityConfig[] = [
  // ===== CORE RACING & COMPETITION =====
  {
    type: 'karting-adult',
    label: 'Karting (Adult)',
    description: 'Indoor/outdoor kart racing for adults',
    icon: 'Car',
    category: 'Racing & Competition',
    seedPrompt: `
This venue operates **adult karting** - competitive go-kart racing.

## Key Business Characteristics:
- **High throughput**: 10-15 minute races, quick turnover
- **Repeat customer focused**: Leagues and memberships drive 40-60% of revenue
- **Equipment intensive**: Fleet maintenance is significant operational cost
- **Skill-based**: Appeals to competitive customers, not casual one-time visitors
- **Weather dependent** (outdoor tracks): Indoor tracks have advantage

## Revenue Optimization:
- **Leagues and memberships**: Highest margin, recurring revenue
- **Corporate events**: Premium pricing for team building
- **Racing packages**: Multi-race discounts encourage repeat visits
- **Lap time tracking**: Gamification drives return visits

## Peak Patterns:
- Weekday evenings for leagues
- Weekend afternoons for casual racers
- Corporate bookings during business hours

Focus on league development, membership retention, and fleet utilization optimization.`
  },
  {
    type: 'karting-junior',
    label: 'Karting (Junior)',
    description: 'Youth kart racing programs',
    icon: 'Baby',
    category: 'Racing & Competition',
    seedPrompt: `
This venue operates **junior karting** - youth racing programs.

## Key Business Characteristics:
- **Birthday party focused**: Major revenue driver for junior programs
- **Parent-child dynamic**: Parents book, kids enjoy
- **Safety critical**: Stricter supervision and equipment requirements
- **Skill development**: Progression programs create long-term customers
- **Lower throughput**: More supervision time per session

## Revenue Optimization:
- **Birthday packages**: Premium pricing with food, decorations, dedicated party host
- **Junior racing leagues**: Build community and recurring revenue
- **Parent-child races**: Family packages increase booking value
- **Summer camps**: Fill weekday daytime capacity

## Peak Patterns:
- Weekend afternoons for parties
- After-school hours for leagues
- School break periods for camps

Focus on birthday party optimization, league development, and converting one-time birthday guests into league members.`
  },
  {
    type: 'paintball',
    label: 'Paintball',
    description: 'Outdoor/indoor tactical paintball',
    icon: 'Target',
    category: 'Racing & Competition',
    seedPrompt: `
This venue operates **paintball** - tactical team competition.

## Key Business Characteristics:
- **Group-focused**: Minimum 6-8 players, ideal 12-20
- **Equipment rental critical**: Marker rentals, protective gear, paintball sales
- **Weather dependent** (outdoor): Rain/extreme heat impacts bookings
- **High consumable costs**: Paintballs are significant variable expense
- **Corporate market**: Team building is high-value segment

## Revenue Optimization:
- **Package tiers**: Bronze/Silver/Gold based on paintball quantity
- **Private field rentals**: Premium pricing for exclusive use
- **Scenario games**: Special events with themes drive attendance
- **Equipment upgrades**: Upsell premium markers and gear

## Peak Patterns:
- Weekend mornings and afternoons
- Corporate bookings on weekdays
- Bachelor/birthday parties

Focus on group package optimization, corporate sales, and weather-contingency planning.`
  },
  {
    type: 'laser-tag',
    label: 'Laser Tag',
    description: 'Indoor arena-based laser combat',
    icon: 'Zap',
    category: 'Racing & Competition',
    seedPrompt: `
This venue operates **laser tag** - electronic team combat sport.

## Key Business Characteristics:
- **Weather independent**: Indoor advantage over paintball
- **Lower operating costs**: No consumables like paintball
- **Birthday party magnet**: Extremely popular for kids 8-14
- **Quick sessions**: 15-20 minute games allow high throughput
- **Scoring systems**: Technology creates competitive engagement

## Revenue Optimization:
- **Multi-game packages**: Encourage longer stays
- **Birthday party packages**: Premium pricing with reserved tables, food
- **Team leagues**: Recurring revenue, builds community
- **Combo packages**: Bundle with arcade, food for higher ticket value

## Peak Patterns:
- Weekend afternoons (birthdays)
- Friday/Saturday evenings (teens and young adults)
- School break periods

Focus on birthday party optimization, combo package development, and league formation for recurring revenue.`
  },
  {
    type: 'axe-throwing',
    label: 'Axe Throwing',
    description: 'Competitive axe throwing lanes',
    icon: 'Axe',
    category: 'Racing & Competition',
    seedPrompt: `
This venue operates **axe throwing** - skill-based competitive throwing.

## Key Business Characteristics:
- **Novelty factor**: Still relatively new, strong initial interest
- **Adult-focused**: Typically 18+ age restriction
- **Group activity**: Best with 4-8 people per lane
- **Safety intensive**: Requires dedicated staff supervision
- **Lane-based capacity**: Fixed number of lanes limits capacity

## Revenue Optimization:
- **Corporate events**: Team building at premium rates
- **Leagues**: Competitive leagues drive repeat business
- **Food & beverage**: High margin add-on (if licensed)
- **Private events**: Birthday parties, bachelor/bachelorette parties

## Peak Patterns:
- Weekend evenings (social groups)
- Thursday-Friday corporate events
- Saturday afternoon parties

Focus on corporate sales, league development, and F&B attachment to increase per-customer value.`
  },

  // ===== IMMERSIVE EXPERIENCES =====
  {
    type: 'escape-room',
    label: 'Escape Rooms',
    description: 'Immersive puzzle and adventure experiences',
    icon: 'Key',
    category: 'Immersive Experiences',
    seedPrompt: `
This venue operates **escape rooms** - immersive puzzle experiences.

## Key Business Characteristics:
- **Fixed time slots**: Experiences are typically 60-90 minutes
- **Room capacity**: Usually 4-8 people per team
- **Turnover-based**: Revenue depends on how many games per day
- **Escape rate matters**: 60-70% is typical, affects difficulty balance
- **One-time experiences**: Repeat customers are less common (need multiple rooms)
- **Review-driven**: Customer experience heavily impacts booking decisions

## Revenue Optimization:
- **Multiple rooms**: Portfolio of 3-5 rooms drives repeat visits
- **Corporate team building**: High-value market segment
- **Dynamic pricing**: Premium rates for Friday/Saturday evenings
- **Hint systems**: Maintain flow without reducing challenge
- **Photo packages**: Upsell team photos at completion

## Peak Patterns:
- Evenings and weekends are prime time
- Corporate bookings prefer weekday afternoons
- Holidays and special occasions drive demand

Focus on room portfolio development, corporate market penetration, and turnover optimization between sessions.`
  },
  {
    type: 'vr-room',
    label: 'VR Rooms',
    description: 'Virtual reality gaming experiences',
    icon: 'Glasses',
    category: 'Immersive Experiences',
    seedPrompt: `
This venue operates **VR rooms** - virtual reality experiences.

## Key Business Characteristics:
- **Technology dependent**: Equipment requires regular updates/maintenance
- **Session-based**: 30-60 minute experiences
- **Novelty appeal**: Attracts tech-curious customers
- **Content variety**: Multiple game options within single room
- **Space efficient**: Smaller footprint than traditional activities

## Revenue Optimization:
- **Experience tiers**: Basic vs premium VR experiences
- **Multiplayer sessions**: Higher revenue per time slot
- **Combo packages**: Bundle with other activities
- **Birthday parties**: Popular for tech-savvy youth

## Peak Patterns:
- Weekend afternoons
- After-school hours for youth
- Adult evenings for gaming groups

Focus on content refresh cycles, multi-player experiences, and equipment ROI optimization.`
  },
  {
    type: 'break-room',
    label: 'Break/Wreck Rooms',
    description: 'Stress relief destruction experiences',
    icon: 'Hammer',
    category: 'Immersive Experiences',
    seedPrompt: `
This venue operates **break rooms** - controlled destruction experiences.

## Key Business Characteristics:
- **Consumable inventory**: Requires constant supply of breakable items
- **Safety equipment**: Protective gear is mandatory
- **Session length**: Typically 30-45 minutes
- **Cleanup intensive**: Time between sessions for room reset
- **Novelty attraction**: Strong initial interest, needs marketing refresh

## Revenue Optimization:
- **Tiered packages**: Bronze/Silver/Gold based on item quantity/type
- **Group packages**: Team building and parties
- **Add-on items**: Upsell premium breakables (TVs, electronics)
- **Corporate stress relief**: Market to businesses for team events

## Peak Patterns:
- Weekend afternoons
- Corporate bookings on weekdays
- Post-exam periods for students

Focus on inventory sourcing optimization, package pricing strategy, and corporate market development.`
  },

  // ===== ACTIVE & ADVENTURE =====
  {
    type: 'rope-course',
    label: 'Rope Courses',
    description: 'High ropes challenge courses',
    icon: 'Mountain',
    category: 'Active & Adventure',
    seedPrompt: `
This venue operates **rope courses** - elevated obstacle challenges.

## Key Business Characteristics:
- **Safety intensive**: Requires trained staff supervision
- **Age/height restrictions**: Limits market to capable participants
- **Weather dependent** (outdoor courses): Indoor courses have advantage
- **Time intensive**: 1-2 hour experiences per customer
- **Physical challenge**: Not suitable for all fitness levels

## Revenue Optimization:
- **Multi-level courses**: Beginner/intermediate/advanced pricing tiers
- **Group packages**: Team building and youth groups
- **Combo tickets**: Zip line + rope course bundles
- **Season passes**: For adventure enthusiasts

## Peak Patterns:
- Weekend mornings and afternoons
- Summer camp groups on weekdays
- Corporate team building

Focus on safety training efficiency, group sales, and weather contingency planning for outdoor courses.`
  },
  {
    type: 'obstacle-course',
    label: 'Obstacle Courses',
    description: 'Ninja warrior style obstacle challenges',
    icon: 'Footprints',
    category: 'Active & Adventure',
    seedPrompt: `
This venue operates **obstacle courses** - fitness-based challenges.

## Key Business Characteristics:
- **Fitness-focused demographic**: Appeals to active, health-conscious customers
- **Competitive element**: Timed runs create return visits to beat records
- **Age range**: Typically 8+ for junior courses, teens/adults for advanced
- **Social media appeal**: Instagram-worthy challenges drive marketing
- **Membership potential**: Fitness enthusiasts return regularly

## Revenue Optimization:
- **Memberships**: Unlimited access passes for regular users
- **Competition events**: Timed challenges with prizes
- **Training programs**: Skill progression classes
- **Birthday parties**: Increasingly popular for active kids

## Peak Patterns:
- After-work hours for fitness enthusiasts
- Weekend afternoons for families
- School break periods

Focus on membership program development, competition event marketing, and social media engagement.`
  },
  {
    type: 'zip-line',
    label: 'Zip Lines',
    description: 'Aerial zip line experiences',
    icon: 'Wind',
    category: 'Active & Adventure',
    seedPrompt: `
This venue operates **zip lines** - aerial cable experiences.

## Key Business Characteristics:
- **Thrill-seeker appeal**: Attracts adventure-minded customers
- **Weight/age restrictions**: Safety limits impact market size
- **Throughput dependent**: Number of lines and guide efficiency critical
- **Weather sensitive**: Wind, rain, lightning force closures
- **Location dependent**: Scenic views enhance experience value

## Revenue Optimization:
- **Multi-line packages**: Encourage full course completion
- **Photo/video packages**: Capture experience for customers
- **Private group bookings**: Corporate or family events
- **Combo with other activities**: Rope course, climbing wall bundles

## Peak Patterns:
- Weekend afternoons
- Summer vacation peaks
- Good weather windows

Focus on throughput optimization, photo/video upsells, and weather-backup activities.`
  },
  {
    type: 'climbing-wall',
    label: 'Climbing Walls',
    description: 'Indoor/outdoor rock climbing',
    icon: 'TrendingUp',
    category: 'Active & Adventure',
    seedPrompt: `
This venue operates **climbing walls** - vertical challenge experiences.

## Key Business Characteristics:
- **Skill-based**: Progression from beginner to advanced routes
- **Equipment rental**: Shoes, harnesses, belay devices
- **Supervision required**: Staff or certified belayers needed
- **Membership potential**: Regular climbers drive recurring revenue
- **Fitness appeal**: Attracts health-conscious demographics

## Revenue Optimization:
- **Memberships**: Unlimited climbing passes
- **Classes**: Beginner, technique, advanced certification
- **Auto-belay walls**: Reduce staffing requirements, increase throughput
- **Competitions**: Community events build loyalty

## Peak Patterns:
- After-work evenings for members
- Weekend afternoons for casual climbers
- School programs during school hours

Focus on membership conversion, class program development, and auto-belay investment for scalability.`
  },
  {
    type: 'trampoline-park',
    label: 'Trampoline Parks',
    description: 'Indoor trampoline entertainment',
    icon: 'CircleDot',
    category: 'Active & Adventure',
    seedPrompt: `
This venue operates **trampoline parks** - bouncing entertainment zones.

## Key Business Characteristics:
- **High insurance costs**: Safety liability is significant expense
- **Age-based pricing**: Toddler, youth, adult zones
- **Birthday party focused**: Major revenue driver
- **High energy turnover**: 60-90 minute jump sessions typical
- **Waiver required**: Legal protection for injury risk

## Revenue Optimization:
- **Birthday packages**: Premium pricing with party rooms, food, host
- **Jump socks**: Small markup, required safety item
- **Memberships**: Unlimited jump passes for regulars
- **Toddler time**: Off-peak hours for youngest jumpers
- **Dodgeball leagues**: Competitive play drives return visits

## Peak Patterns:
- Weekend afternoons (birthday parties)
- After-school hours for youth
- School break periods

Focus on birthday party optimization, membership programs, and injury prevention to control insurance costs.`
  },

  // ===== INDOOR PLAY & FAMILY =====
  {
    type: 'indoor-play',
    label: 'Indoor Play',
    description: 'Kids play structures and play areas',
    icon: 'Baby',
    category: 'Indoor Play & Family',
    seedPrompt: `
This venue operates **indoor play** - children's play structures and zones.

## Key Business Characteristics:
- **Parent-child model**: Parents pay, kids play
- **Age restricted**: Typically 0-12 years old
- **Dwell time**: Parents stay 1-3 hours
- **Repeat customer base**: Weekly visits common for local families
- **Food & beverage critical**: Cafe revenue supplements admission

## Revenue Optimization:
- **Memberships**: Monthly unlimited play passes
- **Birthday parties**: Highest margin activity
- **Cafe sales**: Coffee, snacks for parents while kids play
- **Special events**: Character visits, themed days
- **Off-peak pricing**: Weekday morning discounts to smooth demand

## Peak Patterns:
- Weekend mornings and afternoons
- Rainy days spike attendance
- School break periods

Focus on membership conversion, birthday party packages, and cafe optimization for parent revenue.`
  },
  {
    type: 'arcade',
    label: 'Arcades',
    description: 'Video game and redemption arcades',
    icon: 'Gamepad2',
    category: 'Indoor Play & Family',
    seedPrompt: `
This venue operates **arcades** - video game entertainment.

## Key Business Characteristics:
- **Pay-per-play or card-based**: Cashless systems increase spending
- **Redemption games**: Ticket games drive repeat play
- **Prize costs**: Redemption prize inventory is variable expense
- **Equipment maintenance**: Games require regular service
- **Impulse spending**: Visual stimulation drives unplanned purchases

## Revenue Optimization:
- **Cashless cards**: Load bonuses encourage higher initial spend ($20 gets $25 play)
- **Prize tier management**: Balance prize cost with perceived value
- **New game rotation**: Refresh selection to maintain interest
- **Combo packages**: Arcade + activity bundles
- **Birthday packages**: Reserved space + game cards

## Peak Patterns:
- Weekend afternoons and evenings
- After-school hours
- Rainy days for family entertainment

Focus on card load bonus optimization, prize cost management, and new game ROI analysis.`
  },
  {
    type: 'bowling',
    label: 'Bowling Alleys',
    description: 'Traditional bowling entertainment',
    icon: 'Circle',
    category: 'Indoor Play & Family',
    seedPrompt: `
This venue operates **bowling** - classic lane-based entertainment.

## Key Business Characteristics:
- **Lane-based capacity**: Fixed number of lanes limits throughput
- **Hourly pricing or per-game**: Pricing model impacts revenue
- **Food & beverage**: Major profit center, often 30-40% of revenue
- **League bowling**: Weekday evening leagues provide steady base revenue
- **Shoe rental**: Additional revenue stream

## Revenue Optimization:
- **Cosmic bowling**: Premium pricing for themed evenings
- **League development**: Guaranteed recurring revenue
- **Party packages**: Birthday and corporate packages with lanes, food, drinks
- **Dynamic pricing**: Peak hour premiums
- **Food & alcohol**: High margin, increases dwell time and spending

## Peak Patterns:
- Weekend afternoons and evenings for families
- Weekday evenings for leagues
- Friday/Saturday nights for cosmic bowling

Focus on league retention, party package optimization, and F&B attachment rates.`
  },
  {
    type: 'mini-golf',
    label: 'Mini Golf',
    description: 'Miniature golf courses',
    icon: 'Flag',
    category: 'Indoor Play & Family',
    seedPrompt: `
This venue operates **mini golf** - family putting entertainment.

## Key Business Characteristics:
- **Low skill barrier**: Appeals to all ages and abilities
- **Weather dependent** (outdoor): Indoor courses have year-round advantage
- **Family-focused**: Typical group size 3-4 people
- **Repeat play potential**: Scorecard competition encourages return visits
- **Low operational cost**: Minimal staffing requirements once open

## Revenue Optimization:
- **Multi-round discounts**: Encourage extended play
- **Combo packages**: With ice cream, arcade, other attractions
- **Birthday parties**: Reserved tee times, party area
- **Season passes**: For local families
- **Glow golf**: Premium pricing for black-light evening sessions

## Peak Patterns:
- Summer evenings (outdoor courses)
- Weekend afternoons
- School break periods

Focus on combo package development, season pass marketing to locals, and glow golf premium pricing.`
  },
  {
    type: 'golf-simulator',
    label: 'Golf Simulators',
    description: 'Virtual golf simulation bays',
    icon: 'MonitorPlay',
    category: 'Indoor Play & Family',
    seedPrompt: `
This venue operates **golf simulators** - virtual golf experiences.

## Key Business Characteristics:
- **Bay-based capacity**: Limited by number of simulator bays
- **Weather independent**: Indoor advantage
- **Adult-focused**: Appeals primarily to golfers
- **Time-based pricing**: Hourly bay rentals
- **Food & beverage opportunity**: Lounge atmosphere encourages spending

## Revenue Optimization:
- **League play**: Recurring revenue from competitive leagues
- **Corporate events**: Team building, client entertainment
- **Memberships**: Unlimited play passes
- **Food & alcohol**: High margin add-on (if licensed)
- **Off-peak pricing**: Weekday daytime discounts

## Peak Patterns:
- Winter months (when outdoor golf unavailable)
- Evening and weekend hours
- Corporate events during business hours

Focus on league development, corporate sales, and F&B optimization to maximize bay revenue.`
  },
  {
    type: 'batting-cage',
    label: 'Batting Cages',
    description: 'Baseball/softball batting practice',
    icon: 'Medal',
    category: 'Indoor Play & Family',
    seedPrompt: `
This venue operates **batting cages** - baseball/softball practice.

## Key Business Characteristics:
- **Seasonal demand**: Peak during baseball season
- **Skill development**: Appeals to players wanting practice
- **Token/card based**: Pay-per-use or time-based
- **Low supervision**: Automated pitch machines
- **Age range**: Youth players through adult athletes

## Revenue Optimization:
- **Team packages**: Baseball/softball team practice sessions
- **Memberships**: Unlimited batting passes for serious players
- **Instruction programs**: Coaching adds premium service
- **Combo packages**: With other activities
- **Off-season programs**: Indoor cages during winter

## Peak Patterns:
- Spring/summer (baseball season)
- After-school hours for youth
- Weekend afternoons

Focus on team sales, instruction program development, and winter season marketing for indoor facilities.`
  },
  {
    type: 'battle-cage',
    label: 'Battle Cages',
    description: 'Competitive batting competitions',
    icon: 'Swords',
    category: 'Indoor Play & Family',
    seedPrompt: `
This venue operates **battle cages** - competitive hitting games.

## Key Business Characteristics:
- **Competitive element**: Head-to-head batting competitions
- **Gamification**: Scoring systems create engagement
- **Social activity**: Best with groups
- **Quick sessions**: 15-20 minute games allow high throughput
- **Novelty appeal**: Modern take on traditional batting cages

## Revenue Optimization:
- **Tournament events**: Competitive leagues and brackets
- **Group packages**: Party and corporate event pricing
- **Leaderboards**: Encourage repeat visits to beat scores
- **Combo packages**: With other activities

## Peak Patterns:
- Weekend afternoons and evenings
- Corporate team building events
- Birthday parties

Focus on tournament organization, group sales, and social media marketing of leaderboards.`
  },

  // ===== SKATING & ICE =====
  {
    type: 'ice-skating',
    label: 'Ice Skating Rinks',
    description: 'Ice skating entertainment and sports',
    icon: 'Snowflake',
    category: 'Skating & Ice',
    seedPrompt: `
This venue operates **ice skating** - recreational and competitive ice skating.

## Key Business Characteristics:
- **High operational costs**: Ice maintenance, HVAC expenses
- **Session-based**: 2-3 hour public skate sessions
- **Skate rental revenue**: Required for many customers
- **League and lesson opportunities**: Hockey, figure skating programs
- **Seasonal appeal**: Higher demand in winter months

## Revenue Optimization:
- **Public skate sessions**: General admission with skate rentals
- **Learn-to-skate programs**: Recurring class revenue
- **Hockey leagues**: High-value recurring bookings
- **Birthday parties**: Reserved space on ice, party room
- **Private ice rental**: Premium pricing for exclusive use

## Peak Patterns:
- Winter months peak demand
- Weekend public sessions
- Weekday evenings for leagues and lessons

Focus on program development (lessons, leagues), private rentals, and off-ice revenue (food, pro shop).`
  },
  {
    type: 'roller-skating',
    label: 'Roller Skating Rinks',
    description: 'Roller skating entertainment',
    icon: 'Disc',
    category: 'Skating & Ice',
    seedPrompt: `
This venue operates **roller skating** - recreational roller skating.

## Key Business Characteristics:
- **Session-based**: 2-3 hour skate sessions
- **Skate rental revenue**: Required for most customers
- **Music and atmosphere**: DJ and lighting create experience
- **Birthday party focused**: Major revenue driver
- **Food & beverage**: Snack bar important profit center

## Revenue Optimization:
- **Theme nights**: Adult skate nights, glow skate, decades themes
- **Birthday packages**: Reserved tables, skate rentals, food
- **Memberships**: Unlimited skate passes
- **Skate lessons**: Beginner programs
- **Private events**: Exclusive rink rental

## Peak Patterns:
- Weekend afternoons for families and birthday parties
- Friday/Saturday evenings for teen and adult sessions
- School break periods

Focus on theme night development, birthday party optimization, and private event marketing.`
  },

  // ===== LARGE ATTRACTIONS =====
  {
    type: 'water-park',
    label: 'Water Parks',
    description: 'Water slide and aquatic attractions',
    icon: 'Waves',
    category: 'Large Attractions',
    seedPrompt: `
This venue operates a **water park** - aquatic entertainment destination.

## Key Business Characteristics:
- **Seasonal outdoor**: Summer peak season (indoor parks year-round)
- **Capacity management critical**: Overcrowding degrades experience
- **High operational costs**: Lifeguards, water treatment, energy
- **Family-focused**: Multi-generational appeal
- **Length of stay**: Typical visits are 3-6 hours

## Revenue Optimization:
- **Season passes**: Drive recurring visits and guaranteed revenue
- **Cabana rentals**: Premium pricing for private space
- **Food & beverage**: High margins, captive audience
- **Parking fees**: Additional revenue stream
- **Photo packages**: On-ride photos and experience captures

## Peak Patterns:
- Summer months (outdoor)
- Weekend and holiday peaks
- Weather-dependent spikes

Focus on season pass programs, cabana rental optimization, and F&B attachment rates.`
  },
  {
    type: 'amusement-park',
    label: 'Amusement Parks',
    description: 'Rides and attractions park',
    icon: 'Ferris-Wheel',
    category: 'Large Attractions',
    seedPrompt: `
This venue operates an **amusement park** - rides and attractions destination.

## Key Business Characteristics:
- **Capacity management**: Queue times impact satisfaction
- **Ride maintenance**: Downtime affects capacity and experience
- **Seasonal outdoor** (most): Summer peak season
- **High operational costs**: Ride operators, maintenance, energy
- **Multi-generational appeal**: Rides for different ages

## Revenue Optimization:
- **Season passes**: Recurring revenue and loyalty
- **Fast pass systems**: Premium pricing for line skipping
- **Food & beverage**: Major profit center
- **Games and arcades**: Additional revenue streams
- **Special events**: Halloween, holiday themes

## Peak Patterns:
- Summer vacation months
- Weekends during operating season
- Holiday periods

Focus on season pass marketing, fast pass pricing optimization, and special event programming.`
  },
  {
    type: 'zoo-aquarium',
    label: 'Zoos & Aquariums',
    description: 'Wildlife and marine life exhibits',
    icon: 'Fish',
    category: 'Large Attractions',
    seedPrompt: `
This venue operates a **zoo or aquarium** - animal exhibit destination.

## Key Business Characteristics:
- **Educational mission**: Conservation and education alongside entertainment
- **Year-round operation**: Weather-independent for indoor exhibits
- **Membership-focused**: Annual passes drive loyalty and recurring revenue
- **Operating costs**: Animal care is significant fixed expense
- **School groups**: Educational programs provide weekday revenue

## Revenue Optimization:
- **Membership programs**: Family, individual, donor tiers
- **Special exhibits**: Traveling exhibits command premium pricing
- **Animal encounters**: Behind-the-scenes experiences at premium rates
- **School programs**: Field trip packages
- **Gift shop and food**: Merchandise and dining revenue

## Peak Patterns:
- Summer vacation months
- School field trip seasons (spring/fall)
- Weekend family visits

Focus on membership conversion, special exhibit programming, and education program development.`
  },
  {
    type: 'museum',
    label: 'Museums',
    description: 'Educational exhibits and collections',
    icon: 'Building2',
    category: 'Large Attractions',
    seedPrompt: `
This venue operates a **museum** - educational exhibit destination.

## Key Business Characteristics:
- **Educational focus**: Learning-oriented experience
- **Timed entry**: Capacity management for popular exhibits
- **Membership programs**: Support recurring visits
- **Donor support**: Fundraising supplements ticket revenue
- **School groups**: Educational field trips provide weekday traffic

## Revenue Optimization:
- **Membership tiers**: Individual, family, patron levels
- **Special exhibits**: Traveling exhibits at premium pricing
- **Guided tours**: Premium experiences with expert guides
- **Event rentals**: Private events during closed hours
- **Gift shop**: Museum store as profit center

## Peak Patterns:
- Weekends for general public
- Weekdays for school groups
- Special exhibit openings

Focus on membership growth, special exhibit programming, and school partnership development.`
  },

  // ===== TOURS & EDUCATIONAL =====
  {
    type: 'guided-tour',
    label: 'Guided Tours',
    description: 'Led tours with expert guides',
    icon: 'MapPin',
    category: 'Tours & Educational',
    seedPrompt: `
This venue operates **guided tours** - expert-led experiences.

## Key Business Characteristics:
- **Guide-dependent**: Capacity limited by guide availability
- **Knowledge-based value**: Guide expertise justifies pricing
- **Group sizes**: Optimal 10-20 people per guide
- **Duration**: Typically 1-3 hours
- **Seasonal demand**: Varies by location and tour type

## Revenue Optimization:
- **Private tours**: Premium pricing for exclusive groups
- **Multi-language options**: Expand addressable market
- **Special interest tours**: Photography, food, history themes at premium
- **Combo packages**: Multiple tours or tour + activity
- **Tipping encouraged**: Additional guide compensation

## Peak Patterns:
- Tourist season peaks
- Weekend and holiday demand
- Weather-dependent for outdoor tours

Focus on guide training and retention, private tour marketing, and special interest tour development.`
  },
  {
    type: 'unguided-tour',
    label: 'Self-Guided Tours',
    description: 'Self-paced exploration with audio/materials',
    icon: 'Map',
    category: 'Tours & Educational',
    seedPrompt: `
This venue operates **self-guided tours** - autonomous exploration experiences.

## Key Business Characteristics:
- **Scalable**: Not limited by guide availability
- **Technology-enabled**: Audio guides, apps, or printed materials
- **Flexible timing**: Visitors set their own pace
- **Lower price point**: Less expensive than guided tours
- **Minimal staffing**: Lower operational costs

## Revenue Optimization:
- **Audio guide rentals**: Additional revenue stream
- **Mobile app premium**: Enhanced content via paid app
- **Multi-language options**: Expand market reach
- **Combo tickets**: Pair with other attractions or services

## Peak Patterns:
- Similar to general admission patterns
- Less sensitive to guide availability

Focus on technology investment (apps, audio), content quality, and combo ticket development.`
  },
  {
    type: 'attraction-tour',
    label: 'Attraction Tours',
    description: 'Tours of unique destinations or facilities',
    icon: 'Landmark',
    category: 'Tours & Educational',
    seedPrompt: `
This venue operates **attraction tours** - destination-based experiences.

## Key Business Characteristics:
- **Unique destination**: Tour showcases special location or facility
- **Timed entry**: Capacity limits maintain experience quality
- **Educational component**: Historical, cultural, or technical learning
- **Photo opportunities**: Instagram-worthy moments drive bookings
- **Souvenir sales**: Gift shop complements experience

## Revenue Optimization:
- **VIP access**: Behind-the-scenes or exclusive areas at premium
- **Photo packages**: Professional photos of visitors
- **Combo tickets**: Multiple attractions or areas
- **Special events**: Evening tours, seasonal themes

## Peak Patterns:
- Tourist season highs
- Weekend peaks
- Holiday and special event spikes

Focus on VIP experience development, photo package optimization, and special event programming.`
  },

  // ===== GENERAL ADMISSION =====
  {
    type: 'fec-general-admission',
    label: 'FEC General Admission',
    description: 'Family entertainment center all-access',
    icon: 'Ticket',
    category: 'General Admission',
    seedPrompt: `
This venue operates **FEC general admission** - all-access family entertainment.

## Key Business Characteristics:
- **Multi-activity venue**: Combines various attractions under one roof
- **All-you-can-play model**: Fixed admission, unlimited activities
- **Birthday party destination**: Major revenue driver
- **Dwell time**: Typical visits are 2-4 hours
- **Food & beverage**: Important profit center

## Revenue Optimization:
- **Tiered passes**: Bronze/Silver/Gold based on included activities
- **Birthday packages**: Premium pricing with party room, host, food
- **Memberships**: Unlimited admission passes
- **Add-ons**: Premium activities not included in base admission
- **Food & beverage**: Cafe or snack bar revenue

## Peak Patterns:
- Weekend afternoons (birthday parties)
- School break periods
- Rainy days for indoor FECs

Focus on birthday party optimization, membership conversion, and F&B attachment rates.`
  },
  {
    type: 'time-play',
    label: 'Time Play',
    description: 'Pay-by-time entertainment access',
    icon: 'Clock',
    category: 'General Admission',
    seedPrompt: `
This venue operates **time play** - hourly entertainment access.

## Key Business Characteristics:
- **Time-based pricing**: Pay per hour or time block
- **Flexible model**: Customers choose their duration
- **Activity variety**: Multiple options within venue
- **Lower barrier**: Entry price point lower than all-day admission
- **Turnover focused**: Shorter visits allow more customers per day

## Revenue Optimization:
- **Time tiers**: 1-hour, 2-hour, 3-hour pricing
- **Add-on time**: Upsell additional 30-minute blocks
- **Premium activities**: Extra charges for certain attractions
- **Food & beverage**: Extend dwell time and revenue
- **Memberships**: Unlimited time passes for regulars

## Peak Patterns:
- Weekend afternoons
- After-school hours
- School break periods

Focus on time tier pricing optimization, add-on activity development, and membership programs.`
  },
];

/**
 * Get activity configuration by type
 */
export function getActivityConfig(type: ActivityType): ActivityConfig | undefined {
  return ACTIVITY_TYPES.find((a) => a.type === type);
}

/**
 * Get all activity type options grouped by category for selection UI
 */
export function getActivityOptionsByCategory() {
  const categories = new Map<string, ActivityConfig[]>();

  ACTIVITY_TYPES.forEach((activity) => {
    const existing = categories.get(activity.category) || [];
    categories.set(activity.category, [...existing, activity]);
  });

  return Array.from(categories.entries()).map(([category, activities]) => ({
    category,
    activities: activities.map((a) => ({
      value: a.type,
      label: a.label,
      description: a.description,
      icon: a.icon,
    })),
  }));
}

/**
 * Get all activity type options as flat list for selection UI
 */
export function getActivityOptions() {
  return ACTIVITY_TYPES.map((activity) => ({
    value: activity.type,
    label: activity.label,
    description: activity.description,
    icon: activity.icon,
    category: activity.category,
  }));
}

/**
 * Build combined seed prompt from multiple activity types
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

**Important**: Use this context to provide highly relevant, activity-specific advice. Your recommendations should reflect the unique characteristics, peak patterns, revenue drivers, and operational challenges of these specific activity types. Focus on actionable insights that apply to their business model.
`;
}
