/**
 * Claude Service
 * Handles all communication with Claude AI API
 */

import { config } from '../../config/environment';
import {
  AnalyticsData,
  ChatResponse,
  Message,
  ApiError,
  NetworkError,
  ServiceOptions,
  ChartSpec
} from '@/app/types/analytics';
import { logger } from '../utils/logger';
import { ConfigData } from '../storage/types';
import { buildActivitySeedPrompt } from '../config/activity-types';

export interface ClaudeServiceOptions extends ServiceOptions {
  apiKey: string;
  config?: ConfigData;
}

export class ClaudeService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private maxTokens: number;
  private timeout: number;
  private activityConfig?: ConfigData;

  constructor(options: ClaudeServiceOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = config.api.claude.baseUrl;
    this.model = config.api.claude.model;
    this.maxTokens = config.api.claude.maxTokens;
    this.timeout = options.timeout || config.api.claude.timeout;
    this.activityConfig = options.config;
  }

  /**
   * Send a chat message and get AI response
   */
  async chat(
    message: string,
    analyticsData?: AnalyticsData,
    conversationHistory: Message[] = []
  ): Promise<ChatResponse> {
    try {
      const context = analyticsData ? this.buildAnalyticsContext(analyticsData) : '';

      // Sanitize all strings to remove problematic Unicode characters
      const sanitizedMessage = this.sanitizeString(message);
      const sanitizedContext = this.sanitizeString(context);
      const sanitizedHistory = conversationHistory.map(msg => ({
        role: msg.role,
        content: this.sanitizeString(msg.content)
      }));

      const messages = [
        ...sanitizedHistory,
        {
          role: 'user' as const,
          content: sanitizedContext ? `${sanitizedContext}\n\nUser Question: ${sanitizedMessage}` : sanitizedMessage
        }
      ];

      // Build the request body
      const requestBody = {
        model: this.model,
        max_tokens: this.maxTokens,
        messages,
        system: this.sanitizeString(this.getSystemPrompt())
      };

      // Stringify and then sanitize the entire JSON string to remove ANY Unicode characters
      // This ensures the request body is pure ASCII for the fetch API
      const sanitizedBody = this.sanitizeString(JSON.stringify(requestBody));

      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/messages`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: sanitizedBody,
        }
      );

      const assistantMessage = response.content[0].text;

      // Parse chart specifications from the response
      const { cleanMessage: messageWithoutCharts, charts } = this.parseChartSpecs(assistantMessage);

      // Parse table specifications from the response
      const { cleanMessage: messageWithoutTables, tables } = this.parseTableSpecs(messageWithoutCharts);

      // Parse follow-up questions from the response
      const { cleanMessage, followupQuestions } = this.parseFollowupQuestions(messageWithoutTables);

      // Sanitize the response from Claude as well (it may include emojis from the prompt)
      const sanitizedResponse = this.sanitizeString(cleanMessage);

      return {
        success: true,
        message: sanitizedResponse,
        suggestedQuestions: followupQuestions.length > 0 ? followupQuestions : this.getRandomSuggestions(4),
        charts: charts,
        tables: tables
      };
    } catch (error) {
      this.handleError(error);
      throw error; // TypeScript needs this
    }
  }

  /**
   * Parse chart specifications from AI response
   */
  private parseChartSpecs(message: string): { cleanMessage: string; charts: ChartSpec[] } {
    // Look for <CHARTS>...</CHARTS> tags
    const chartsRegex = /<CHARTS>([\s\S]*?)<\/CHARTS>/i;
    const match = message.match(chartsRegex);

    if (!match) {
      return { cleanMessage: message, charts: [] };
    }

    try {
      // Extract and parse the JSON
      const chartsJson = match[1].trim();
      const charts = JSON.parse(chartsJson) as ChartSpec[];

      // Remove the charts section from the message
      const cleanMessage = message.replace(chartsRegex, '').trim();

      return { cleanMessage, charts };
    } catch (error) {
      // If parsing fails, return the original message without charts
      logger.warn('Failed to parse chart specifications from AI response', error);
      return { cleanMessage: message, charts: [] };
    }
  }

  /**
   * Parse table specifications from AI response
   */
  private parseTableSpecs(message: string): { cleanMessage: string; tables: any[] } {
    // Look for <TABLES>...</TABLES> tags
    const tablesRegex = /<TABLES>([\s\S]*?)<\/TABLES>/i;
    const match = message.match(tablesRegex);

    if (!match) {
      return { cleanMessage: message, tables: [] };
    }

    try {
      // Extract and parse the JSON
      const tablesJson = match[1].trim();
      const tables = JSON.parse(tablesJson);

      // Remove the tables section from the message
      const cleanMessage = message.replace(tablesRegex, '').trim();

      return { cleanMessage, tables };
    } catch (error) {
      // If parsing fails, return the original message without tables
      logger.warn('Failed to parse table specifications from AI response', error);
      return { cleanMessage: message, tables: [] };
    }
  }

  /**
   * Parse follow-up questions from AI response
   */
  private parseFollowupQuestions(message: string): { cleanMessage: string; followupQuestions: string[] } {
    // Look for <FOLLOWUP>...</FOLLOWUP> tags
    const followupRegex = /<FOLLOWUP>([\s\S]*?)<\/FOLLOWUP>/i;
    const match = message.match(followupRegex);

    if (!match) {
      return { cleanMessage: message, followupQuestions: [] };
    }

    try {
      // Extract and parse the JSON
      const followupJson = match[1].trim();
      const followupQuestions = JSON.parse(followupJson) as string[];

      // Remove the followup section from the message
      const cleanMessage = message.replace(followupRegex, '').trim();

      return { cleanMessage, followupQuestions };
    } catch (error) {
      // If parsing fails, return the original message without questions
      logger.warn('Failed to parse follow-up questions from AI response', error);
      return { cleanMessage: message, followupQuestions: [] };
    }
  }

  /**
   * Sanitize string to remove problematic Unicode characters for HTTP
   */
  private sanitizeString(str: string): string {
    if (!str) return '';

    // Replace ALL non-ASCII characters (anything above 127) with their closest ASCII equivalent or remove them
    let sanitized = str;

    // First, replace common problematic Unicode characters with ASCII equivalents
    sanitized = sanitized
      .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '-')  // Bullet points
      .replace(/[\u2013\u2014\u2015]/g, '-')  // Dashes (en dash, em dash, horizontal bar)
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'")  // Single quotes
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"')  // Double quotes
      .replace(/[\u2026]/g, '...')  // Ellipsis
      .replace(/[\u2192\u2190\u2191\u2193]/g, '->')  // Arrows
      .replace(/[\u2713\u2714]/g, 'v')  // Check marks
      .replace(/[\u2717\u2718]/g, 'x')  // X marks
      .replace(/[\u2605\u2606]/g, '*')  // Stars
      .replace(/[\u00A0]/g, ' ')  // Non-breaking space
      .replace(/[\u00AB\u00BB]/g, '"')  // Guillemets
      .replace(/[\u2039\u203A]/g, "'");  // Single guillemets

    // Remove ALL emojis and other high Unicode characters
    // This covers all Unicode characters from U+2000 onwards (except what we already replaced)
    sanitized = sanitized.replace(/[\u{1F000}-\u{1F9FF}]/gu, '');  // Emojis and symbols
    sanitized = sanitized.replace(/[\u{2600}-\u{26FF}]/gu, '');  // Misc symbols
    sanitized = sanitized.replace(/[\u{2700}-\u{27BF}]/gu, '');  // Dingbats

    // Finally, aggressively remove ANY remaining non-ASCII character (> 127)
    sanitized = sanitized.replace(/[^\x00-\x7F]/g, '');

    return sanitized;
  }

  /**
   * Build context from analytics data for Claude
   */
  private buildAnalyticsContext(analyticsData: AnalyticsData): string {
    const {
      todaysAgenda,
      periodSummary,
      performance,
      salesSummary,
      guestSummary,
      paymentCollection,
      businessInsights
    } = analyticsData;

    let context = `
CURRENT ANALYTICS DATA:

TODAY'S OPERATIONS:
- Bookings Today: ${todaysAgenda.bookings}
- Guests Today: ${todaysAgenda.guests}
- First Booking: ${todaysAgenda.firstBooking}
- Waivers Required: ${todaysAgenda.waiversRequired}

PERIOD PERFORMANCE:
- Gross Revenue: $${periodSummary.gross.toLocaleString()} (${periodSummary.grossChange >= 0 ? '+' : ''}${periodSummary.grossChange}%)
- Net Revenue: $${periodSummary.net.toLocaleString()} (${periodSummary.netChange >= 0 ? '+' : ''}${periodSummary.netChange}%)
- Total Sales: $${periodSummary.totalSales.toLocaleString()}
- Total Payments: $${paymentCollection.totalPayments.toLocaleString()}
- Payment Split: ${paymentCollection.paidPercent}% paid, ${paymentCollection.unpaidPercent}% unpaid

BEST PERFORMERS:
- Best Day: ${performance.bestDay} ($${performance.bestDayRevenue.toLocaleString()}, ${performance.bestDayChange >= 0 ? '+' : ''}${performance.bestDayChange}%)
- Top Item: ${performance.topItem} (${performance.topItemBookings} bookings, ${performance.topItemChange >= 0 ? '+' : ''}${performance.topItemChange}%)
- Peak Time: ${performance.peakTime} (${performance.peakTimeBookings} bookings)

SALES METRICS:
- Total Bookings: ${salesSummary.bookings} (${salesSummary.bookingsChange >= 0 ? '+' : ''}${salesSummary.bookingsChange}%)
- Avg Revenue per Booking: $${salesSummary.avgRevPerBooking} (${salesSummary.avgRevChange >= 0 ? '+' : ''}${salesSummary.avgRevChange}%)
- Online vs Operator: ${salesSummary.onlineVsOperator}% online
- Item Sales: $${salesSummary.itemSales.toLocaleString()}
- Extra Sales: $${salesSummary.extraSales.toLocaleString()}
- Gift Voucher Sales: $${salesSummary.giftVoucherSales.toLocaleString()}

GUEST METRICS:
- Total Guests: ${guestSummary.totalGuests} (${guestSummary.totalChange >= 0 ? '+' : ''}${guestSummary.totalChange}%)
- Avg Revenue per Guest: $${guestSummary.avgRevenuePerGuest}
- Avg Group Size: ${guestSummary.avgGroupSize}
- Repeat Customers: ${guestSummary.repeatCustomers}%
- No-Shows: ${guestSummary.noShows}

PAYMENT COLLECTION:
- Card Payments: ${paymentCollection.cardPercent}%
- Cash Payments: ${paymentCollection.cashPercent}%`;

    // Add activity profitability data if available
    if (businessInsights?.activityProfitability && businessInsights.activityProfitability.length > 0) {
      context += `

ACTIVITY PROFITABILITY (Ranked by Total Sales):`;
      businessInsights.activityProfitability.forEach((activity, index) => {
        context += `
${index + 1}. ${activity.name}
   - Total Revenue: $${activity.totalSales.toLocaleString()}
   - Total Bookings: ${activity.totalBookings}
   - Revenue per Booking: $${activity.revenuePerBooking.toFixed(2)}
   - Avg Review: ${activity.avgReview.toFixed(1)}/5 (${activity.totalReviews} reviews)`;
      });
    }

    // Add capacity utilization data if available
    if (businessInsights?.capacityUtilization) {
      const capacity = businessInsights.capacityUtilization;
      context += `

CAPACITY UTILIZATION:
- Overall Utilization: ${capacity.overallUtilization.toFixed(1)}%
- Total Capacity: ${capacity.totalCapacity.toLocaleString()} spots
- Total Booked: ${capacity.totalBooked.toLocaleString()} spots
- Available Spots: ${capacity.totalAvailable.toLocaleString()}`;

      // Add top 5 activities by utilization
      if (capacity.byActivity.length > 0) {
        context += `

BY ACTIVITY (Top 5 by Utilization):`;
        capacity.byActivity.slice(0, 5).forEach((activity, index) => {
          context += `
${index + 1}. ${activity.name}
   - Utilization: ${activity.utilization.toFixed(1)}%
   - Capacity: ${activity.capacity.toLocaleString()} (${activity.booked.toLocaleString()} booked, ${activity.available.toLocaleString()} available)
   - Sessions: ${activity.instanceCount}`;
        });
      }

      // Add peak times
      if (capacity.peakTimes.length > 0) {
        context += `

PEAK TIMES (>80% utilization): ${capacity.peakTimes.join(', ')}`;
      }

      // Add low utilization times
      if (capacity.lowUtilizationTimes.length > 0) {
        context += `

LOW UTILIZATION TIMES (<50% utilization): ${capacity.lowUtilizationTimes.slice(0, 10).join(', ')}`;
      }
    }

    // Add customer intelligence data if available
    if (businessInsights?.customerIntelligence) {
      const customer = businessInsights.customerIntelligence;
      context += `

CUSTOMER INTELLIGENCE:
- Total Customers: ${customer.totalCustomers}
- New Customers (Last 30 Days): ${customer.newCustomers}
- Repeat Customer Rate: ${customer.repeatRate.toFixed(1)}%
- Average Customer Lifetime Value: $${customer.avgCustomerLifetimeValue.toFixed(2)}

CUSTOMER SEGMENTS:
- VIP Guests (CLV $500+): ${customer.segments.vip.count} customers, $${customer.segments.vip.totalRevenue.toFixed(0)} revenue (${customer.segments.vip.percentage.toFixed(1)}%)
- Regular Guests (2+ visits, CLV $150+): ${customer.segments.regular.count} customers, $${customer.segments.regular.totalRevenue.toFixed(0)} revenue (${customer.segments.regular.percentage.toFixed(1)}%)
- At-Risk Guests (90+ days inactive): ${customer.segments.atRisk.count} customers, $${customer.segments.atRisk.totalRevenue.toFixed(0)} revenue (${customer.segments.atRisk.percentage.toFixed(1)}%)
- New Guests (First-time): ${customer.segments.new.count} customers, $${customer.segments.new.totalRevenue.toFixed(0)} revenue (${customer.segments.new.percentage.toFixed(1)}%)`;

      if (customer.topCustomersByClv.length > 0) {
        context += `

TOP CUSTOMERS (by Lifetime Value):`;
        customer.topCustomersByClv.slice(0, 5).forEach((c, index) => {
          context += `
${index + 1}. ${c.name}: $${c.clv.toFixed(0)} CLV (${c.totalBookings} bookings, ${c.segment} segment, ${c.daysSinceLastBooking} days since last visit)`;
        });
      }

      if (customer.churnRiskCustomers.length > 0) {
        context += `

CHURN RISK CUSTOMERS:`;
        customer.churnRiskCustomers.slice(0, 5).forEach((c, index) => {
          context += `
${index + 1}. ${c.name}: $${c.clv.toFixed(0)} CLV (${c.daysSinceLastBooking} days inactive)`;
        });
      }
    }

    // Add voucher intelligence data if available
    if (businessInsights?.voucherIntelligence) {
      const voucher = businessInsights.voucherIntelligence;
      context += `

GIFT VOUCHER ANALYTICS:
- Total Sold: ${voucher.overview.total_sold} vouchers ($${voucher.overview.total_sold_value.toFixed(0)})
- Total Redeemed: ${voucher.overview.total_redeemed} (${voucher.overview.redemption_rate.toFixed(1)}%)
- Outstanding Balance: $${voucher.overview.outstanding_balance.toFixed(0)}
- Breakage Rate: ${voucher.overview.breakage_rate.toFixed(1)}% (pure profit)
- Avg Days to Redemption: ${voucher.overview.avg_days_to_redemption}`;
    }

    // Add conversion intelligence data if available
    if (businessInsights?.conversionIntelligence) {
      const conversion = businessInsights.conversionIntelligence;
      context += `

CART ABANDONMENT & CONVERSION:
- Total Carts: ${conversion.cart_abandonment.total_carts}
- Abandoned Carts: ${conversion.cart_abandonment.abandoned_carts} ($${conversion.cart_abandonment.abandoned_value.toFixed(0)} lost)
- Conversion Rate: ${conversion.cart_abandonment.conversion_rate.toFixed(1)}%
- Avg Cart Value: $${conversion.cart_abandonment.avg_cart_value.toFixed(0)}

RECOVERY OPPORTUNITY:
- Recoverable Carts (with email): ${conversion.recovery_opportunity.recoverable_carts}
- Potential Revenue: $${conversion.recovery_opportunity.potential_revenue.toFixed(0)}
- Projected Recovery (15% est.): $${conversion.recovery_opportunity.projected_recovered_revenue.toFixed(0)}`;

      if (conversion.cart_abandonment.top_abandoned_items.length > 0) {
        context += `

TOP ABANDONED ITEMS:`;
        conversion.cart_abandonment.top_abandoned_items.slice(0, 3).forEach((item: any, index: number) => {
          context += `
${index + 1}. ${item.item_name}: ${item.abandonment_count} times ($${item.lost_revenue.toFixed(0)} lost)`;
        });
      }
    }

    // Guest Reviews & Sentiment Analysis (Review Text Data)
    if (analyticsData.rawData?.reviews && analyticsData.rawData.reviews.length > 0) {
      const reviews = analyticsData.rawData.reviews;

      // Get recent reviews (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentReviews = reviews.filter((r: any) => {
        const reviewDate = new Date(r.created_at);
        return reviewDate >= thirtyDaysAgo;
      });

      // Calculate average rating
      const avgRating = reviews.length > 0
        ? (reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : 'N/A';

      // Group reviews by rating
      const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews.forEach((r: any) => {
        if (r.rating && r.rating >= 1 && r.rating <= 5) {
          ratingCounts[r.rating]++;
        }
      });

      context += `

## GUEST REVIEWS & SENTIMENT

REVIEW SUMMARY:
- Total Reviews: ${reviews.length}
- Recent Reviews (Last 30 Days): ${recentReviews.length}
- Average Rating: ${avgRating}/5 stars
- Rating Distribution:
  * 5 stars: ${ratingCounts[5]} (${((ratingCounts[5] / reviews.length) * 100).toFixed(0)}%)
  * 4 stars: ${ratingCounts[4]} (${((ratingCounts[4] / reviews.length) * 100).toFixed(0)}%)
  * 3 stars: ${ratingCounts[3]} (${((ratingCounts[3] / reviews.length) * 100).toFixed(0)}%)
  * 2 stars: ${ratingCounts[2]} (${((ratingCounts[2] / reviews.length) * 100).toFixed(0)}%)
  * 1 star: ${ratingCounts[1]} (${((ratingCounts[1] / reviews.length) * 100).toFixed(0)}%)`;

      // Show sample recent reviews (top 5 most recent with text)
      const reviewsWithText = recentReviews
        .filter((r: any) => r.review_text && r.review_text.trim().length > 0)
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      if (reviewsWithText.length > 0) {
        context += `

RECENT REVIEW SAMPLES (Last 30 Days):`;
        reviewsWithText.forEach((r: any, index: number) => {
          const reviewDate = new Date(r.created_at).toLocaleDateString();
          const itemName = r.item_name || 'Unknown Activity';
          const customerName = r.customer_name || 'Anonymous';
          const rating = r.rating || 'N/A';
          const title = r.review_title ? `"${r.review_title}"` : '';
          const text = r.review_text ? r.review_text.substring(0, 200) : '';

          context += `
${index + 1}. ${itemName} - ${rating}/5 stars (${reviewDate})
   Customer: ${customerName}
   ${title}
   "${text}${text.length >= 200 ? '...' : ''}"`;
        });

        context += `

NOTE: Use this review text to answer questions about guest sentiment, feedback themes, praise patterns, and complaint areas. Analyze the text for common themes when asked about "what guests are saying."`;
      }
    }

    // Future Bookings Analysis (Forward-Looking Data)
    if (analyticsData.rawData?.futureBookings && analyticsData.rawData.futureBookings.length > 0) {
      const futureBookings = analyticsData.rawData.futureBookings;
      const today = new Date();
      const next7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      const next7DaysBookings = futureBookings.filter((b: any) => {
        const bookingDate = new Date(b.date_short);
        return bookingDate >= today && bookingDate <= next7Days;
      });

      const next30DaysBookings = futureBookings.filter((b: any) => {
        const bookingDate = new Date(b.date_short);
        return bookingDate >= today && bookingDate <= next30Days;
      });

      const totalFutureGuests = futureBookings.reduce((sum: number, b: any) =>
        sum + (parseInt(b.adults || '0') + parseInt(b.children || '0')), 0
      );

      const totalFutureRevenue = futureBookings.reduce((sum: number, b: any) =>
        sum + parseFloat(b.transaction?.total || '0'), 0
      );

      // Group by activity
      const bookingsByActivity: Record<string, number> = {};
      futureBookings.forEach((b: any) => {
        const activityName = b.item_name || 'Unknown';
        bookingsByActivity[activityName] = (bookingsByActivity[activityName] || 0) + 1;
      });

      const topFutureActivities = Object.entries(bookingsByActivity)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      context += `

## FUTURE BOOKINGS (Forward-Looking Analysis)

UPCOMING DEMAND (Next 90 Days):
- Total Future Bookings: ${futureBookings.length}
- Expected Guests: ${totalFutureGuests}
- Projected Revenue: $${totalFutureRevenue.toFixed(0)}

SHORT-TERM OUTLOOK:
- Next 7 Days: ${next7DaysBookings.length} bookings
- Next 30 Days: ${next30DaysBookings.length} bookings

TOP BOOKED ACTIVITIES (Upcoming):`;

      topFutureActivities.forEach(([activity, count]: [string, any]) => {
        context += `
- ${activity}: ${count} bookings`;
      });

      context += `

NOTE: Use this data to answer questions about upcoming demand, capacity planning, staffing needs, and revenue forecasting.`;
    }

    return context.trim();
  }

  /**
   * Get system prompt for Claude with layered activity-specific context
   * Based on SEED_PROMPT.md v1.0
   */
  private getSystemPrompt(): string {
    // Base system prompt (concise version - full documentation in SEED_PROMPT.md)
    const basePrompt = `You are Resova Intelligence - the AI assistant built into the Resova platform helping activity center operators drive revenue, streamline operations, and enhance guest experiences.

## Mission & Core Pillars:

Your purpose is to enable activity centers to succeed through:

1. **Drive Revenue** - Help operators understand financial performance, demand patterns, and revenue drivers
2. **Operational Efficiency** - Enable smoother operations, reduced manual work, and optimized capacity
3. **Guest Experience** - Provide insights into customer satisfaction and repeat business patterns

## Your Role:

You are a trusted business partner for venue owners and managers. Every conversation is a B2B interaction where operators will make real business decisions based on your responses. You must be:

- **100% Factual** - Never invent data, make assumptions, or guess metrics
- **Friendly & Positive** - Maintain an encouraging, supportive tone while being honest
- **Mission-Aligned** - Always tie insights back to revenue, efficiency, or guest experience
- **Action-Oriented** - Provide specific, implementable recommendations with expected outcomes

Think from a business owner's perspective: "How does this impact my profit, operations, and guest satisfaction?"

## Data Available:
You have access to both historical and forward-looking data:

**Historical Data (12 months):**
- Transactions, bookings, payments, and itemized revenue
- Activity profitability and capacity utilization
- Peak times and low-demand slots
- Customer records and purchase history

**Forward-Looking Data (Next 90 days):**
- Future bookings with dates, activities, and guest counts
- Upcoming revenue projections
- Short-term demand outlook (7-day and 30-day windows)
- Capacity planning and staffing needs forecasting

**Customer Intelligence:**
- Customer Lifetime Value (CLV) tracking and trends
- Customer Segmentation (FEC-optimized thresholds):
  * **VIP Customers**: CLV ≥ $500 (highest value families, priority retention and loyalty programs)
  * **Regular Customers**: CLV $150+ with 2+ visits (repeat families, birthday party opportunities)
  * **At-Risk Customers**: 90+ days inactive with 2+ prior visits (re-engagement campaigns)
  * **New Customers**: First-time visitors or single visit (conversion and retention focus)
- Repeat customer rates and booking frequency (typically lower for FECs except karting venues)
- Top customers ranked by CLV (high-value families for targeted marketing)
- Churn risk analysis (longer cycles than other venues - 90+ days is concerning)
- New customer acquisition (last 30 days)
- Average booking value per customer (typically $50-150 per visit for FECs)

**Gift Voucher Analytics:**
- Voucher sales and redemption rates
- Outstanding balances and breakage rates
- Voucher performance by type

**Conversion & Cart Data:**
- Cart abandonment rates and lost revenue
- Recovery opportunities (carts with email)
- Top abandoned items and drop-off points

Do NOT make year-over-year comparisons or references to "last year" - you only have data going back 12 months maximum.

## DATA COVERAGE & HONEST LIMITATIONS:

**What You CAN Answer (100% Data-Backed):**

DRIVE REVENUE:
- Revenue performance comparisons (this month vs last month, this weekend vs last weekend)
- Product revenue rankings and contribution percentages
- Booking trends and demand patterns by time/day/activity
- Revenue forecasts (next 30/90 days) with confidence intervals
- Capacity expansion opportunities based on utilization data
- Pricing optimization recommendations

OPERATIONAL EFFICIENCY:
- Week-over-week operational changes (bookings, revenue, payments)
- Activity utilization rates and capacity analysis
- No-show rates and patterns by channel/activity
- Time slot performance and consolidation opportunities
- Waiver completion rates (completion %, not timing)

GUEST EXPERIENCE (FULL REVIEW DATA):
- **Review text analysis** - Full review comments, ratings (1-5 stars), review titles, and customer names for complete sentiment analysis
- **Average review scores** - Per-activity ratings with distribution and trends
- **Guest feedback themes** - Common praise themes, complaint patterns, sentiment trends from actual review text
- Repeat booking behavior and customer retention rates (satisfaction proxy)
- Customer churn analysis (behavioral proxy for satisfaction)
- Activities that drive repeat business (loyalty proxy)

**What You CANNOT Answer (Missing Data):**

When asked about these topics, be HONEST and offer alternatives:

GUEST SURVEYS (No Formal Survey Data):
- "What's our Net Promoter Score (NPS)?" → No NPS survey data, but can use repeat rate + review sentiment as proxy
- "Customer Effort Score (CES)?" → No effort surveys, but can analyze review text for ease/difficulty mentions
- "Time-series sentiment tracking?" → Can compare recent vs older reviews, but no formal tracking system

MARKETING ROI (No Attribution Data):
- "Which campaigns drove bookings?" → Can show online vs operator bookings only
- "Social media ROI?" → No UTM tracking available
- "Customer acquisition cost?" → No marketing spend data

LABOR/COSTS (No HR/Expense Data):
- "Labor cost per booking?" → No staff scheduling or payroll data
- "What's my profit margin?" → Have revenue, but not COGS or operating expenses
- "Equipment maintenance costs?" → No maintenance tracking

COMPETITIVE INTELLIGENCE:
- "How do we compare to competitors?" → Have our own data only, no competitor benchmarks

**Response Template for Missing Data:**

"I don't have access to [specific data type] at this time.

What I CAN tell you right now is [related metric using available data]."

Example: "I don't have access to NPS survey data. However, your 35% repeat customer rate and 4.2/5 average review score indicate strong guest satisfaction."

## CRITICAL: Answer the User's Question FIRST
**ALWAYS start by directly answering the specific question the user asked.** If they ask "Which activities are most profitable?" - lead with a ranked breakdown of activities by profitability. If they ask about a specific metric, day, or service - answer that FIRST before providing broader context.

## Response Format Requirements:

**Structure every response as follows:**

### 1. Direct Answer (1-3 sentences)
Answer the user's specific question with concrete data. Use numbers, rankings, or comparisons that directly address what they asked.

### 2. Key Insights (3-5 bullet points maximum)
Present discoveries that drive business decisions:
- **Finding:** Business implication and recommended action
- Focus on profitability, efficiency, and growth opportunities
- Compare to industry benchmarks when relevant (typical venue operators)

### 3. Recommended Actions (2-3 maximum, prioritized by ROI)
Provide specific, implementable strategies:
**[Action]:** What to do, expected impact, and implementation difficulty

## Style Guidelines:

**Concise & Scannable:**
- Short paragraphs (1-2 lines maximum)
- Bullet points over prose
- Bold key numbers and percentages
- Remove filler words and redundancy
- Get to the point immediately

**Formatting:**
- Use headers (###) to break up sections
- Use **bold** for metrics and key terms
- Use bullet points (-) for lists
- NO emojis except in section headers if needed
- NO tables unless absolutely necessary
- NO repetition of dashboard metrics

**Tone:**
- Professional but conversational
- Data-driven and specific
- Action-oriented
- Avoid jargon and buzzwords
- Skip obvious statements

**Avoid:**
- Long paragraphs or dense text blocks
- Repeating information already visible in the dashboard
- Generic advice without specific numbers
- Overly formal or academic language
- Multiple metrics in one bullet point

## Chart Specifications (IMPORTANT - Include When Relevant)

**When to Include Charts:**
Charts are HIGHLY ENCOURAGED for data-driven responses. Include charts whenever analyzing:
- Trends over time (use line charts for revenue, guests, bookings)
- Comparing categories or services (use bar charts)
- Showing proportions or distributions (use pie charts)
- Revenue breakdowns by service or category
- Booking patterns by day of week
- Guest trends and patterns
- Any question involving "show me", "compare", "analyze", or "breakdown"

**When NOT to Include Charts:**
- Simple yes/no questions or single metric queries
- Questions already answered by visible dashboard metrics
- When the user explicitly asks for text-only information
- Repetitive data that doesn't add new insights (avoid showing payment_status multiple times in same conversation)

**Available Data Sources:**
- revenue_trend - Daily revenue over time
- payment_status - Paid vs Unpaid breakdown (use sparingly)
- bookings_by_day - Bookings per day of week
- bookings_by_service - Bookings by activity/service
- revenue_by_service - Revenue distribution by service
- guest_trend - Guest counts over time
- sales_metrics - Booking and revenue metrics per day
- guest_metrics - Guest count and revenue per guest per day

**Available Chart Types:**
- line - Trends over time
- bar - Category comparisons
- pie - Proportion breakdowns
- funnel - Conversion analysis

**Format:** If charts would be helpful, end your response with a JSON block between <CHARTS> tags:

<CHARTS>
[
  {
    "type": "bar",
    "dataSource": "bookings_by_day",
    "title": "Weekly Booking Pattern",
    "description": "Identifies peak booking days"
  }
]
</CHARTS>

If charts aren't needed, simply omit the <CHARTS> tags entirely.

## Data Tables

Use tables when the data is best understood in a structured, comparative format. Tables are ideal for:
- **Revenue breakdowns** by activity, time period, or customer segment
- Detailed comparisons across multiple metrics (e.g., activity performance with bookings, revenue, capacity)
- Rankings with associated data (e.g., top activities by multiple criteria)
- Side-by-side comparisons that require precision
- Financial data that needs exact values (not approximations)
- Data that benefits from sortable columns or scanning rows

**When to use tables vs charts:**
- Use **charts** for trends, patterns, and visual comparisons over time
- Use **tables** for precise values, detailed breakdowns, revenue analysis, and multi-metric comparisons
- Use **both** in the same response when appropriate - for example, a revenue trend chart followed by a table showing the exact breakdown by activity
- Revenue questions often benefit from BOTH: a chart for the trend and a table for precise values

**Format:** If tables would be helpful, end your response with a JSON block between <TABLES> tags:

<TABLES>
[
  {
    "title": "Activity Performance Comparison",
    "headers": ["Activity", "Bookings", "Revenue", "Capacity %", "Trend"],
    "rows": [
      ["USA Ticket", 245, 19600, "87%", "↑ 12%"],
      ["Eiffel Tower", 189, 15120, "72%", "↓ 3%"],
      ["City Tour", 156, 9360, "65%", "→ stable"]
    ]
  }
]
</TABLES>

If tables aren't needed, simply omit the <TABLES> tags entirely.

## Contextual Follow-up Questions:
IMPORTANT: At the end of each response, suggest 3-4 natural follow-up questions that build on what you just discussed. These should help the owner/manager dig deeper into the insights you provided or explore related business opportunities. Make them specific to your response, not generic.

**Format:** End your response with follow-up questions in a JSON block between <FOLLOWUP> tags:

<FOLLOWUP>
[
  "What prevents customers from booking USA Ticket multiple times?",
  "Are there seasonal activities that could complement USA Ticket during slower periods?",
  "What's the average profit margin on USA Ticket after operational costs?"
]
</FOLLOWUP>

## Resova Platform Knowledge:

When providing recommendations, you can reference Resova's built-in features and best practices. The platform includes:

**Settings & Configuration:**
- Account preferences and system-wide customization
- User permissions and role management
- Business hours and operational settings

**Inventory Management:**
- Products, activities, and add-ons configuration
- Resource allocation and capacity management
- Gift voucher programs

**Marketing Tools:**
- Built-in promotional strategies
- Email campaigns and customer engagement
- Discount codes and special offers

**Payment Processing:**
- Multiple payment gateway integrations
- Subscription billing for recurring services
- Invoice and receipt management

**Integrations:**
- Third-party application connections
- API access for custom solutions
- Channel management for distribution

**Reporting & Analytics:**
- Real-time performance dashboards
- Custom report generation
- Data export capabilities

**Customer Management:**
- Customer profiles and interaction history
- Loyalty programs and repeat booking incentives
- Review and feedback collection

**Important:** When recommending actions that involve Resova features (like setting up email campaigns, creating discount codes, or configuring inventory), mention that these can be implemented directly in Resova. For detailed setup instructions, operators can visit the Resova Knowledge Center at https://info.resova.com/resova-knowledge-center.

## Common Questions You'll Be Asked:

Operators will ask questions across three pillars. Here are examples aligned to each:

**PILLAR 1: DRIVE REVENUE**
- "Compare this month's revenue to last year" (you have 12 months data, answer with confidence)
- "What products are generating the most revenue this month?"
- "How is this weekend's revenue trending compared to last weekend?"
- "Which time slots have the highest demand?"
- "What's the revenue forecast for next 30/90 days?" (provide with confidence intervals)
- "Which activities should I expand capacity for?"

**PILLAR 2: OPERATIONAL EFFICIENCY**
- "What are the biggest operational changes week-over-week?"
- "Which activities had the highest utilization this weekend?"
- "What's my no-show rate and how can I reduce it?"
- "Which time slots should I consolidate or remove?"
- "How are bookings tracking this weekend compared to last?"

**PILLAR 3: GUEST EXPERIENCE**
- "What are guests saying about their experience?" (you have FULL review text - analyze themes and sentiment)
- "Summarize guest feedback from the last 30 days" (you have review text - provide sentiment analysis)
- "What's our average review rating?" (you have scores AND text - provide context)
- "Which activities have the best reviews?" (rankings by score WITH reasons from review text)
- "What are the top issues guests are reporting?" (analyze review text for complaint patterns)
- "Are customers rebooking?" (repeat rate is available - strong proxy for satisfaction)
- "What's our customer churn rate?" (you have this - be confident)

## Example Response:

Your **12% retention rate** is costing you **$18,400** in potential annual revenue. Industry standard for tour operators is 35-45%, indicating significant untapped opportunity.

### Key Insights

- **Customer Retention Gap:** At 12% vs 35-45% benchmark, you're losing **$1,533/month** in repeat business
- **Revenue Per Customer:** $462 actual vs $640 potential - **27% profit gap** due to low repeat rates
- **First-Timer Dominance:** 88% first-time customers suggests strong acquisition but weak retention

### Recommended Actions

**1. Email Nurture Sequence (Easy, High ROI):** Set up automated emails in Resova's Marketing Tools: 24hr thank-you → 7-day review request → 30-day return discount code. Expected **+$8,200/month** within 90 days. You can configure email campaigns directly in Resova.

**2. Tiered Loyalty Program (Medium, Sustainable):** Use Resova's Customer Management to create a Bronze (2 visits) → Silver (5 visits) → Gold (10 visits) program with escalating perks. Break-even at 22 Silver members, **6-month payback**. Customer profiles will automatically track visit counts.

<CHARTS>
[
  {
    "type": "funnel",
    "dataSource": "revenue_trend",
    "title": "Customer Retention Drop-off",
    "description": "Shows where customers leave in the journey"
  },
  {
    "type": "line",
    "dataSource": "revenue_trend",
    "title": "Revenue Trend Analysis",
    "description": "Track revenue growth over time"
  }
]
</CHARTS>

<FOLLOWUP>
[
  "What specific actions drive customers from first-time to repeat buyers?",
  "How does our retention compare to similar tour operators in the area?",
  "What's the optimal frequency for re-engagement emails based on our data?",
  "Which customer segment has the highest lifetime value potential?"
]
</FOLLOWUP>`;

    // Layer on activity-specific context if configured
    const activityPrompt = this.activityConfig?.activityTypes && this.activityConfig.activityTypes.length > 0
      ? buildActivitySeedPrompt(this.activityConfig.activityTypes)
      : '';

    // Combine base prompt with activity layer
    return activityPrompt
      ? `${basePrompt}\n\n${activityPrompt}`
      : basePrompt;
  }

  /**
   * Get random suggested questions focused on business growth
   */
  private getRandomSuggestions(count: number): string[] {
    const questions = [
      "Where are my biggest profit leaks and how do I fix them?",
      "Which services should I expand vs phase out?",
      "How can I increase revenue without adding capacity?",
      "What's the ROI on my marketing channels?",
      "Which pricing changes would maximize profit?",
      "How do I reduce my no-show and cancellation losses?",
      "What's my customer acquisition cost vs lifetime value?",
      "When are my most profitable time slots?",
      "Which customer segments have the highest margins?",
      "How can I improve my staff utilization and labor costs?",
      "What cross-sell and upsell opportunities am I missing?",
      "Should I adjust my capacity during slow periods?",
    ];

    return questions.sort(() => 0.5 - Math.random()).slice(0, count);
  }

  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    maxRetries: number = 3
  ): Promise<any> {
    const retryableStatuses = [429, 503, 529]; // Rate limit, unavailable, overloaded

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // If successful, return immediately
        if (response.ok) {
          return await response.json();
        }

        // Get error data
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || 'Claude API request failed';

        // Check if we should retry
        const shouldRetry = retryableStatuses.includes(response.status) && attempt < maxRetries - 1;

        if (shouldRetry) {
          // Calculate delay with exponential backoff and jitter
          const baseDelay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          const jitter = Math.random() * 1000; // 0-1s random jitter
          const delay = baseDelay + jitter;

          logger.warn(`Claude API ${response.status} error, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})`, {
            status: response.status,
            attempt: attempt + 1,
            maxRetries
          });

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // No retry, throw error
        throw new ApiError(errorMessage, response.status);

      } catch (error: any) {
        clearTimeout(timeoutId);

        // Handle timeout
        if (error.name === 'AbortError') {
          throw new NetworkError('Request timeout');
        }

        // If it's an ApiError and we shouldn't retry, rethrow
        if (error instanceof ApiError) {
          throw error;
        }

        // Network error - retry if not last attempt
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
          logger.warn(`Network error, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        throw error;
      }
    }

    // This should never be reached, but TypeScript needs it
    throw new NetworkError('Max retries exceeded');
  }

  /**
   * Get request headers
   */
  private getHeaders(): Record<string, string> {
    return {
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    };
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: any): never {
    logger.error('Claude Service Error', error);

    if (error instanceof ApiError || error instanceof NetworkError) {
      throw error;
    }

    throw new ApiError(
      error.message || 'An unexpected error occurred',
      500,
      error
    );
  }
}