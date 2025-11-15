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
  rawData?: RawApiData; // Raw API responses for AI Assistant
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