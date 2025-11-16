/**
 * Type Definitions
 * All TypeScript interfaces and types for the application
 */

// ==================== CREDENTIALS ====================
export interface Credentials {
  resovaApiKey: string;
  resovaApiUrl: string;
  claudeApiKey: string;
}

// ==================== ANALYTICS DATA ====================
export interface TodaysAgenda {
  bookings: number;
  guests: number;
  firstBooking: string;
  waiversRequired: number;
}

export interface AgendaChartItem {
  time: string;
  bookings: number;
  guests: number;
  itemsBooked: number;
}

export interface Booking {
  time: string;
  name: string;
  item: string;
  guests: number;
  waiver: string;
  notes: string;
  staff: string;
  // Enhanced fields for detailed booking view
  bookingDate: string;
  purchasedDate: string;
  transactionNumber: string;
  adults: number;
  children: number;
  transactionTotal: string;
  paid: string;
  due: string;
  status: string;
}

export interface Notification {
  user: string;
  message: string;
  time: string;
}

export interface Transaction {
  customer: string;
  date: string;
  ref: string;
  total: string;
  paid: string;
  due: string;
}

export interface BookingNote {
  name: string;
  date: string;
  note: string;
}

export interface ActivityItem {
  user: string;
  action: string;
  time: string;
}

export interface UserItem {
  name: string;
  status: string;
  lastLogin: string;
}

export interface PeriodSummary {
  gross: number;
  grossChange: number;
  net: number;
  netChange: number;
  totalSales: number;
  totalSalesChange: number;
  discounts: number;
  discountsChange: number;
  refunded: number;
  refundedChange: number;
  taxes: number;
  taxesChange: number;
  fees: number;
  feesChange: number;
}

export interface RevenueTrend {
  day: string;
  thisGross: number;
  thisNet: number;
  thisSales: number;
  prevGross: number;
  prevNet: number;
  prevSales: number;
}

export interface Performance {
  bestDay: string;
  bestDayRevenue: number;
  bestDayChange: number;
  topItem: string;
  topItemBookings: number;
  topItemChange: number;
  peakTime: string;
  peakTimeBookings: number;
  peakTimeChange: number;
  // Booking status breakdown (Phase 1 - Critical)
  bookingCompleted: number;
  bookingUpcoming: number;
  bookingNoShow: number;
  bookingCancelled: number;
}

export interface PaymentCollection {
  totalPayments: number;
  totalChange: number;
  paidAmount: number;
  paidPercent: number;
  unpaidAmount: number;
  unpaidPercent: number;
  cardAmount: number;
  cardPercent: number;
  cashAmount: number;
  cashPercent: number;
  // Payment status breakdown (Phase 1 - Critical)
  paidTransactions: number;
  partiallyPaidTransactions: number;
  unpaidTransactions: number;
}

export interface SalesMetric {
  day: string;
  bookings: number;
  avgRev: number;
}

export interface SalesSummary {
  bookings: number;
  bookingsChange: number;
  avgRevPerBooking: number;
  avgRevChange: number;
  onlineVsOperator: number;
  onlineChange: number;
  itemSales: number;
  itemSalesChange: number;
  extraSales: number;
  extraSalesChange: number;
  giftVoucherSales: number;
  giftVoucherChange: number;
  // Phase 2 - Drive Revenue: Transaction Channel Breakdown
  onlineBookings: number;
  manualBookings: number;
  adminBookings: number;
  facebookBookings: number;
  onlineRevenue: number;
  manualRevenue: number;
}

export interface PurchasedItem {
  name: string;
  amount: number;
}

export interface TopPurchased {
  items: PurchasedItem[];
  extras: PurchasedItem[];
  vouchers: PurchasedItem[];
}

export interface GuestMetric {
  day: string;
  totalGuests: number;
  avgRevPerGuest: number;
}

export interface GuestSummary {
  totalGuests: number;
  totalChange: number;
  avgRevenuePerGuest: number;
  avgRevChange: number;
  avgGroupSize: number;
  groupChange: number;
  repeatCustomers: number;
  repeatChange: number;
  noShows: number;
  noShowChange: number;
  // Average guests per booking (Phase 1 - Critical)
  avgGuestsPerBooking: number;
  avgGuestsPerBookingChange: number;
}

export interface ItemDetails {
  id: number;
  name: string;
  description: string;
  duration: number;
  capacity: number;
  pricingType: string;
  status: string;
  categories: string[];
}

export interface CustomerInsight {
  totalCustomers: number;
  newCustomers: number;
  repeatRate: number;
  topCustomers: Array<{
    name: string;
    email: string;
    totalBookings: number;
    totalSpent: number;
  }>;
  // Phase 2 - Drive Revenue: Top customers expanded with rankings
  topCustomersByRevenue: Array<{
    rank: number;
    name: string;
    email: string;
    totalBookings: number;
    totalSpent: number;
    avgBookingValue: number;
  }>;
}

// Enhanced Customer Intelligence with CLV and Segmentation
export interface CustomerIntelligence {
  totalCustomers: number;
  newCustomers: number;
  repeatRate: number;
  avgCustomerLifetimeValue: number;
  segments: {
    vip: CustomerSegment;
    regular: CustomerSegment;
    atRisk: CustomerSegment;
    new: CustomerSegment;
  };
  topCustomersByClv: CustomerProfile[];
  churnRiskCustomers: CustomerProfile[];
}

export interface CustomerSegment {
  count: number;
  percentage: number;
  avgClv: number;
  avgBookings: number;
  totalRevenue: number;
}

export interface CustomerProfile {
  name: string;
  email: string;
  totalBookings: number;
  totalSpent: number;
  clv: number;
  segment: 'vip' | 'regular' | 'at-risk' | 'new';
  lastBookingDate: string;
  daysSinceLastBooking: number;
  firstBookingDate: string;
  avgBookingValue: number;
}

export interface VoucherInsight {
  totalActive: number;
  totalRedeemed: number;
  totalValue: number;
  redemptionRate: number;
  expiringWithin30Days: number;
  // Phase 3 - Drive Revenue: Gift Voucher Detailed Tracking
  // Matches PHP metrics: gift_sales, redeemed_total, redeemed_value, redemptions_total, redemptions_value
  giftSales: number;              // Total gift voucher sales revenue (PHP: gift_sales)
  redeemedCount: number;          // Count of fully redeemed vouchers (PHP: redeemed_total)
  redeemedValue: number;          // Total value of redeemed vouchers (PHP: redeemed_value)
  availableCount: number;         // Count of vouchers with remaining value (PHP: redemptions_total)
  availableValue: number;         // Total value still available to redeem (PHP: redemptions_value)
  breakageRate: number;           // Percentage of vouchers never redeemed (expired unredeemed)
  averageVoucherValue: number;    // Average initial voucher purchase value
  averageRedemptionValue: number; // Average amount redeemed per voucher
}

// ==================== DAILY ANALYTICS ====================
// Strategic Pillar: Drive Revenue 💰 + Operational Efficiency ⚙️
// Purpose: Enable day-by-day trend analysis, bar charts, and weekend comparisons

export interface DailyBreakdown {
  date: string;                   // YYYY-MM-DD format
  dayOfWeek: number;              // 0-6 (Sunday = 0)
  dayName: string;                // 'Sunday', 'Monday', etc.
  bookings: number;               // Total bookings on this day
  revenue: number;                // Total revenue on this day
  guests: number;                 // Total guests on this day
  topItem: string;                // Best selling item on this day
  topItemBookings: number;        // Number of bookings for top item
  topItemRevenue: number;         // Revenue from top item
}

export interface DayOfWeekSummary {
  dayOfWeek: number;              // 0-6 (Sunday = 0)
  dayName: string;                // 'Sunday', 'Monday', etc.
  totalBookings: number;          // Total bookings for this day of week
  totalRevenue: number;           // Total revenue for this day of week
  totalGuests: number;            // Total guests for this day of week
  avgBookingsPerOccurrence: number; // Average bookings per occurrence of this day
  avgRevenuePerOccurrence: number;  // Average revenue per occurrence of this day
  occurrences: number;            // How many times this day occurred in the period
}

export interface AvailabilityInsight {
  utilizationRate: number;
  peakDays: string[];
  lowBookingDays: string[];
  averageCapacity: number;
  averageBooked: number;
}

export interface ActivityProfitability {
  id: number;
  name: string;
  totalSales: number;
  totalBookings: number;
  revenuePerBooking: number;
  avgReview: number;
  totalReviews: number;
}

export interface CapacityUtilization {
  overallUtilization: number;
  totalCapacity: number;
  totalBooked: number;
  totalAvailable: number;
  byActivity: Array<{
    id: number;
    name: string;
    utilization: number;
    capacity: number;
    booked: number;
    available: number;
    instanceCount: number;
  }>;
  byTimeSlot: Array<{
    time: string;
    utilization: number;
    capacity: number;
    booked: number;
  }>;
  peakTimes: string[];
  lowUtilizationTimes: string[];
}

export interface BusinessInsights {
  items: ItemDetails[];
  customers: CustomerInsight;
  vouchers: VoucherInsight;
  availability: AvailabilityInsight;
  activityProfitability?: ActivityProfitability[];
  capacityUtilization?: CapacityUtilization;
  // Enhanced intelligence sections
  customerIntelligence?: CustomerIntelligence;
  voucherIntelligence?: any; // VoucherIntelligence from resova-core types
  conversionIntelligence?: any; // ConversionIntelligence from resova-core types
  // Advanced 5-layer intelligence framework
  advancedIntelligence?: AdvancedIntelligence;
}

// ==================== ADVANCED INTELLIGENCE (5-LAYER FRAMEWORK) ====================

export interface InsightMetadata {
  source: string[];           // Which API(s) provided the data
  calculation?: string;        // How it was computed (for derived insights)
  confidence?: number;         // Statistical confidence 0-1 (for predictions)
  sample_size?: number;        // Number of data points used
  date_range?: string;        // Time period analyzed
}

// Layer 1: Raw Insights (Facts)
export interface RawInsights {
  revenue: {
    gross_revenue: { value: number; metadata: InsightMetadata };
    net_revenue: { value: number; metadata: InsightMetadata };
    total_transactions: { value: number; metadata: InsightMetadata };
    average_transaction_value: { value: number; metadata: InsightMetadata };
    total_refunds: { value: number; metadata: InsightMetadata };
    total_discounts: { value: number; metadata: InsightMetadata };
  };
  bookings: {
    total_bookings: { value: number; metadata: InsightMetadata };
    online_bookings: { value: number; metadata: InsightMetadata };
    operator_bookings: { value: number; metadata: InsightMetadata };
    cancelled_bookings: { value: number; metadata: InsightMetadata };
    no_shows: { value: number; metadata: InsightMetadata };
    bookings_by_day_of_week: { value: Record<string, number>; metadata: InsightMetadata };
    bookings_by_hour: { value: Record<string, number>; metadata: InsightMetadata };
  };
  guests: {
    total_guests: { value: number; metadata: InsightMetadata };
    average_group_size: { value: number; metadata: InsightMetadata };
    adult_child_ratio: { value: string; metadata: InsightMetadata };
    waivers_completed: { value: number; metadata: InsightMetadata };
    waivers_required: { value: number; metadata: InsightMetadata };
  };
  activities: {
    active_count: { value: number; metadata: InsightMetadata };
    bookings_by_activity: { value: Record<string, number>; metadata: InsightMetadata };
    revenue_by_activity: { value: Record<string, number>; metadata: InsightMetadata };
    capacity_by_activity: { value: Record<string, number>; metadata: InsightMetadata };
  };
  customers: {
    total_customers: { value: number; metadata: InsightMetadata };
    new_customers: { value: number; metadata: InsightMetadata };
    returning_customers: { value: number; metadata: InsightMetadata };
  };
  vouchers: {
    active_vouchers: { value: number; metadata: InsightMetadata };
    active_value: { value: number; metadata: InsightMetadata };
    redeemed_vouchers: { value: number; metadata: InsightMetadata };
    redeemed_value: { value: number; metadata: InsightMetadata };
    expired_vouchers: { value: number; metadata: InsightMetadata };
    expired_value: { value: number; metadata: InsightMetadata };
  };
  capacity: {
    total_capacity: { value: number; metadata: InsightMetadata };
    slots_booked: { value: number; metadata: InsightMetadata };
    slots_available: { value: number; metadata: InsightMetadata };
  };
}

// Layer 2: Derived Insights (Calculations)
export interface DerivedInsights {
  efficiency: {
    capacity_utilization_rate: { value: number; metadata: InsightMetadata };
    revenue_per_available_slot: { value: number; metadata: InsightMetadata };
    revenue_per_booking: { value: number; metadata: InsightMetadata };
    revenue_per_guest: { value: number; metadata: InsightMetadata };
    discount_cost_percentage: { value: number; metadata: InsightMetadata };
    refund_rate: { value: number; metadata: InsightMetadata };
    no_show_rate: { value: number; metadata: InsightMetadata };
  };
  growth: {
    revenue_growth: { value: number; metadata: InsightMetadata };
    booking_growth: { value: number; metadata: InsightMetadata };
    guest_growth: { value: number; metadata: InsightMetadata };
    new_customer_acquisition_rate: { value: number; metadata: InsightMetadata };
    customer_retention_rate: { value: number; metadata: InsightMetadata };
  };
  customer_metrics: {
    average_customer_lifetime_value: { value: number; metadata: InsightMetadata };
    repeat_customer_rate: { value: number; metadata: InsightMetadata };
    average_days_between_bookings: { value: number; metadata: InsightMetadata };
    churn_risk_percentage: { value: number; metadata: InsightMetadata };
  };
  activity_performance: {
    revenue_per_booking_by_activity: { value: Record<string, number>; metadata: InsightMetadata };
    profit_margin_by_activity: { value: Record<string, number>; metadata: InsightMetadata };
    booking_frequency_by_activity: { value: Record<string, number>; metadata: InsightMetadata };
    utilization_by_activity: { value: Record<string, number>; metadata: InsightMetadata };
    growth_rate_by_activity: { value: Record<string, number>; metadata: InsightMetadata };
  };
  time_patterns: {
    peak_hours: { value: Array<{ hour: string; utilization: number }>; metadata: InsightMetadata };
    low_demand_hours: { value: Array<{ hour: string; utilization: number }>; metadata: InsightMetadata };
    best_performing_days: { value: Array<{ day: string; revenue: number }>; metadata: InsightMetadata };
    worst_performing_days: { value: Array<{ day: string; revenue: number }>; metadata: InsightMetadata };
  };
  voucher_performance: {
    redemption_rate: { value: number; metadata: InsightMetadata };
    average_days_to_redemption: { value: number; metadata: InsightMetadata };
    breakage_rate: { value: number; metadata: InsightMetadata };
  };
}

// Layer 3: Connected Insights (Correlations)
export interface ConnectedInsights {
  revenue_drivers: {
    top_revenue_activity: { value: { name: string; percentage: number; revenue: number }; metadata: InsightMetadata };
    online_vs_operator_impact: { value: { online_avg: number; operator_avg: number; difference: number }; metadata: InsightMetadata };
    group_size_revenue_correlation: { value: string; metadata: InsightMetadata };
    discount_volume_impact: { value: string; metadata: InsightMetadata };
  };
  customer_behavior: {
    repeat_booking_drivers: { value: Array<{ activity: string; repeat_rate: number }>; metadata: InsightMetadata };
    cross_sell_patterns: { value: Array<{ activities: string[]; frequency: number }>; metadata: InsightMetadata };
    segment_preferences: { value: Record<string, string[]>; metadata: InsightMetadata };
    booking_lead_time_correlation: { value: string; metadata: InsightMetadata };
    cancellation_patterns: { value: Record<string, number>; metadata: InsightMetadata };
  };
  capacity_optimization: {
    expansion_opportunities: { value: Array<{ activity: string; reason: string; potential_revenue: number }>; metadata: InsightMetadata };
    pricing_opportunities: { value: Array<{ activity: string; reason: string; current_utilization: number }>; metadata: InsightMetadata };
    time_slot_optimization: { value: Array<{ time: string; action: string; impact: string }>; metadata: InsightMetadata };
    bundle_opportunities: { value: Array<{ activities: string[]; co_booking_rate: number }>; metadata: InsightMetadata };
  };
  operational_efficiency: {
    waiver_completion_impact: { value: string; metadata: InsightMetadata };
    no_show_by_channel: { value: Record<string, number>; metadata: InsightMetadata };
    payment_timing_patterns: { value: Record<string, string>; metadata: InsightMetadata };
  };
}

// Layer 4: Predictive Insights (Forecasts)
export interface PredictiveInsights {
  revenue_forecast: {
    next_30_days: { value: number; confidence_interval: { lower: number; upper: number }; metadata: InsightMetadata };
    next_90_days: { value: number; confidence_interval: { lower: number; upper: number }; metadata: InsightMetadata };
    basis: { value: string; metadata: InsightMetadata };
  };
  booking_forecast: {
    next_7_days: { value: number; metadata: InsightMetadata };
    next_30_days: { value: number; metadata: InsightMetadata };
    next_90_days: { value: number; metadata: InsightMetadata };
    capacity_fill_forecast: { value: Record<string, number>; metadata: InsightMetadata };
  };
  customer_predictions: {
    at_risk_customers: { value: Array<{ name: string; email: string; clv: number; days_since_booking: number }>; metadata: InsightMetadata };
    likely_to_return: { value: Array<{ name: string; email: string; probability: number; expected_revenue: number }>; metadata: InsightMetadata };
  };
  capacity_predictions: {
    predicted_sellout_dates: { value: Record<string, string[]>; metadata: InsightMetadata };
    forecasted_low_demand: { value: Array<{ date: string; activities: string[] }>; metadata: InsightMetadata };
  };
  voucher_predictions: {
    expected_redemptions_30_days: { value: { count: number; value: number }; metadata: InsightMetadata };
    breakage_forecast: { value: { count: number; value: number }; metadata: InsightMetadata };
    voucher_liability: { value: number; metadata: InsightMetadata };
  };
}

// Layer 5: Prescriptive Insights (Recommendations)
export interface PrescriptiveInsight {
  recommendation: string;
  category: 'revenue' | 'customer' | 'operations' | 'pricing' | 'marketing' | 'capacity';
  priority: 'high' | 'medium' | 'low';
  impact: {
    expected_revenue: number;
    expected_bookings?: number;
    expected_efficiency_gain?: number;
  };
  rationale: string;
  data_supporting: string[];
  actionable_steps: string[];
}

export interface PrescriptiveInsights {
  revenue_optimization: PrescriptiveInsight[];
  customer_retention: PrescriptiveInsight[];
  operational_efficiency: PrescriptiveInsight[];
  pricing_strategy: PrescriptiveInsight[];
  marketing_focus: PrescriptiveInsight[];
  capacity_planning: PrescriptiveInsight[];
}

// Combined Advanced Intelligence
export interface AdvancedIntelligence {
  raw: RawInsights;
  derived: DerivedInsights;
  connected: ConnectedInsights;
  predictive: PredictiveInsights;
  prescriptive: PrescriptiveInsights;
  generated_at: string;
  data_period: {
    start_date: string;
    end_date: string;
    comparison_period_start?: string;
    comparison_period_end?: string;
  };
}

export interface RawApiData {
  transactions?: any[];
  itemizedRevenue?: any[];
  allBookings?: any[];
  allPayments?: any[];
  inventoryItems?: any[];
  availabilityInstances?: any[];
  customers?: any[];
  vouchers?: any[];
  abandonedCarts?: any[];
  items?: any[];
  futureBookings?: any[]; // Next 90 days of bookings for forward-looking analysis
}

export interface AnalyticsData {
  todaysAgenda: TodaysAgenda;
  agendaChart: AgendaChartItem[];
  upcomingBookings: Booking[];
  notifications: Notification[];
  transactions: Transaction[];
  bookingNotes: BookingNote[];
  activity: ActivityItem[];
  users: UserItem[];
  periodSummary: PeriodSummary;
  revenueTrends: RevenueTrend[];
  performance: Performance;
  paymentCollection: PaymentCollection;
  salesMetrics: SalesMetric[];
  salesSummary: SalesSummary;
  topPurchased: TopPurchased;
  guestMetrics: GuestMetric[];
  guestSummary: GuestSummary;
  businessInsights?: BusinessInsights;
  dailyBreakdown: DailyBreakdown[];      // Day-by-day breakdown for charts and trend analysis
  dayOfWeekSummary: DayOfWeekSummary[];  // Aggregated by day of week for weekend comparisons
  rawData?: RawApiData; // Raw API responses for AI Assistant
  dateRangeLabel?: string; // Human-readable description of the date range (e.g., "Last 30 days", "Last 12 months")
}

// ==================== API RESPONSES ====================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AnalyticsApiResponse extends ApiResponse<AnalyticsData> {}

// ==================== CHARTS ====================
export type ChartType = 'line' | 'bar' | 'pie' | 'funnel' | 'area' | 'stacked-bar';

export type ChartDataSource =
  | 'revenue_trend'
  | 'payment_status'
  | 'bookings_by_day'
  | 'bookings_by_service'
  | 'revenue_by_service'
  | 'guest_trend'
  | 'sales_metrics'
  | 'guest_metrics';

export interface ChartSpec {
  type: ChartType;
  dataSource: ChartDataSource;
  title: string;
  description: string;
}

// ==================== CHAT ====================
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  charts?: ChartSpec[];
  suggestedQuestions?: string[];
}

export interface ChatRequest {
  message: string;
  analyticsData?: AnalyticsData;
  conversationHistory?: Message[];
  claudeApiKey: string;
}

export interface ChatResponse extends ApiResponse {
  message?: string;
  suggestedQuestions?: string[];
  charts?: ChartSpec[];
}

// ==================== SERVICE OPTIONS ====================
export interface ServiceOptions {
  timeout?: number;
  retries?: number;
}

// ==================== ERROR TYPES ====================
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message);
    this.name = 'ValidationError';
  }
}