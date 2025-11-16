/**
 * Resova Core API Types
 * Types for Customers, Gift Vouchers, and Baskets APIs
 */

// ===== CUSTOMER TYPES =====

export interface ResovaCustomer {
  id: string;
  reference: string;
  first_name: string;
  last_name: string;
  name: string;                  // Full name (first + last)
  email: string;
  mobile: string;
  telephone: string;
  address: string;
  address2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
  ip_address?: string;
  profile_image?: string;
  sales_total: number;      // Total sales amount for this customer
  paid_total: number;        // Total paid amount
  due_total: number;         // Total outstanding amount
  credit_total?: number;     // Total credit amount
  waiver_signature?: string;
  waiver?: any;
  custom_fields?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CustomerListResponse {
  data: ResovaCustomer[];
  meta: {
    total: number;
    count: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
}

// ===== GIFT VOUCHER TYPES =====

export interface ResovaGiftVoucher {
  id: string;
  name: string;
  amount: number | string;   // Purchase price (can be number or string)
  voucher_type: 'value' | 'spaces';
  discount: number;         // Redeemable amount
  description: string;
  status: 'active' | 'inactive';
  redeemed_at: string | null; // Date when voucher was redeemed (null if not redeemed)
  expires_at: string;        // Expiration date
  created_at: string;
  updated_at: string;
}

export interface GiftVoucherListResponse {
  data: ResovaGiftVoucher[];
  meta: {
    total: number;
    count: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
}

// From transactions, we can extract voucher sales and redemptions
export interface VoucherTransaction {
  id: string;
  voucher_id: string;
  customer_id: string;
  transaction_type: 'sale' | 'redemption';
  amount: number;
  redeemed_amount?: number;
  balance_remaining?: number;
  created_at: string;
}

// ===== REVIEW TYPES =====

export interface ResovaItemReview {
  id: string;
  item_id: string;
  item_name?: string;
  customer_id?: string;
  customer_name?: string;
  rating: number;           // 1-5 stars
  review_text?: string;     // Review comment/feedback
  review_title?: string;    // Review title/headline
  created_at: string;
  updated_at?: string;
  status?: 'approved' | 'pending' | 'rejected';
  helpful_count?: number;
}

export interface ItemReviewsResponse {
  data: ResovaItemReview[];
  meta?: {
    total: number;
    count: number;
    per_page?: number;
    current_page?: number;
    total_pages?: number;
  };
}

// ===== BASKET TYPES =====

export interface ResovaBasketItem {
  id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface ResovaBasket {
  id: string;
  reference: string;
  customer_id?: string;
  customer_email?: string;
  items: ResovaBasketItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: 'active' | 'abandoned' | 'converted' | 'expired';
  created_at: string;
  updated_at: string;
  expires_at?: string;
  converted_at?: string;
}

export interface BasketListResponse {
  data: ResovaBasket[];
  meta: {
    total: number;
    count: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
}

// ===== ANALYTICS TYPES =====

export interface CustomerSegment {
  segment_name: string;
  customer_count: number;
  total_revenue: number;
  avg_revenue_per_customer: number;
  avg_booking_frequency: number;
  percentage_of_total: number;
}

export interface CustomerLifetimeValue {
  customer_id: string;
  customer_name: string;
  email: string;
  total_spent: number;
  total_bookings: number;
  avg_order_value: number;
  first_booking_date: string;
  last_booking_date: string;
  days_since_last_booking: number;
  churn_risk: 'low' | 'medium' | 'high';
}

export interface VoucherAnalytics {
  total_sold: number;
  total_sold_value: number;
  total_redeemed: number;
  total_redeemed_value: number;
  outstanding_balance: number;
  redemption_rate: number;      // Percentage
  breakage_rate: number;         // Percentage of unredeemed (pure profit)
  avg_days_to_redemption: number;
}

export interface CartAbandonmentAnalytics {
  total_carts: number;
  abandoned_carts: number;
  abandoned_value: number;
  conversion_rate: number;       // Percentage
  avg_cart_value: number;
  top_abandoned_items: Array<{
    item_name: string;
    abandonment_count: number;
    lost_revenue: number;
  }>;
}

// ===== CUSTOMER INTELLIGENCE =====

export interface CustomerIntelligence {
  // Segmentation
  segments: CustomerSegment[];

  // Top customers by CLV
  top_customers: CustomerLifetimeValue[];

  // Retention metrics
  retention: {
    repeat_customer_rate: number;
    avg_customer_lifetime_days: number;
    churn_rate: number;
    at_risk_customers: number;
  };

  // Acquisition metrics
  acquisition: {
    new_customers_this_period: number;
    new_customer_revenue: number;
    avg_first_order_value: number;
  };
}

// ===== VOUCHER INTELLIGENCE =====

export interface VoucherIntelligence {
  overview: VoucherAnalytics;

  // Voucher performance by type
  by_type: Array<{
    voucher_type: string;
    sold: number;
    redeemed: number;
    redemption_rate: number;
    revenue: number;
  }>;

  // Monthly trends
  monthly_trends: Array<{
    month: string;
    sold: number;
    redeemed: number;
    outstanding_balance: number;
  }>;
}

// ===== CONVERSION INTELLIGENCE =====

export interface ConversionIntelligence {
  cart_abandonment: CartAbandonmentAnalytics;

  // Recovery opportunity
  recovery_opportunity: {
    recoverable_carts: number;
    potential_revenue: number;
    estimated_recovery_rate: number;
    projected_recovered_revenue: number;
  };

  // Drop-off points
  drop_off_analysis: Array<{
    stage: string;
    drop_off_rate: number;
    lost_revenue: number;
  }>;
}
