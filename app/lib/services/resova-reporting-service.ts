/**
 * Resova Reporting API Service
 * Handles all communication with the Resova Reporting APIs (September 2025 Release)
 * Documentation: https://developers.resova.com/
 */

import { config } from '../../config/environment';
import { ApiError, NetworkError, ServiceOptions } from '@/app/types/analytics';
import { logger } from '../utils/logger';

export interface ResovaReportingServiceOptions extends ServiceOptions {
  apiKey: string;
  baseUrl?: string;
}

// ==================== RESOVA API TYPES ====================

export interface ResovaDateRange {
  range?: '1' | 'yesterday' | 'today' | 'current_week' | 'previous_week' | '7' |
         'current_month' | 'previous_month' | '30' | 'current_quarter' |
         'previous_quarter' | '90' | '365';
  start_date?: string; // Y-m-d format
  end_date?: string;   // Y-m-d format
}

export interface TransactionsParams {
  page?: number;
  limit?: number;
  skip?: number;
  created_before?: number; // UNIX timestamp
  created_after?: number;  // UNIX timestamp
  booking_before?: number; // UNIX timestamp
  booking_after?: number;  // UNIX timestamp
  range?: string;
  start_date?: string;
  end_date?: string;
  date_field?: 'created_at' | 'updated_at';
  date_precise?: 0 | 1;
}

export interface ItemizedRevenuePayload {
  date_range: ResovaDateRange;
}

export interface AllBookingsPayload {
  type?: 'all' | 'dates' | 'days_of_week' | 'discounts' | 'discount_groups';
  date_range: ResovaDateRange;
}

export interface AllPaymentsPayload {
  type?: 'all' | 'activity' | 'revenue';
  date_range: ResovaDateRange;
}

export interface ItemsPayload {
  date_range: ResovaDateRange;
  type?: 'all_bookings' | 'by_dates' | 'by_days_of_week' | 'by_discount_codes' | 'by_discount_groups';
  period?: 'date_purchased' | 'event_date';
  booking_status?: 'all' | 'completed' | 'upcoming_pending' | 'no_show' | 'cancelled';
}

export interface ExtrasPayload {
  date_range: ResovaDateRange;
  extras?: 'all' | string; // 'all' or specific extras IDs (comma-separated)
  transaction_status?: 'all' | 'active' | 'cancelled';
}

export interface GuestsPayload {
  date_range: ResovaDateRange;
  type?: 'by_date_attended' | 'by_date_purchased'; // Filter by attended or purchased date
  items?: 'all' | string; // 'all' or specific item IDs (comma-separated)
}

export interface GiftVouchersPayload {
  date_range: ResovaDateRange;
  type?: 'all_gifts' | 'by_activity'; // Gift voucher type filter
  transaction_status?: 'all' | 'active' | 'cancelled'; // Transaction status filter
  gift_status?: 'all' | 'active_codes' | 'inactive_codes'; // Gift voucher status filter
}

// ==================== RESOVA RESPONSE TYPES ====================

export interface ResovaTransaction {
  id: number;
  reference: string;
  price: string;
  discount: string;
  fee: string;
  tax: string;
  gross_total: string;
  total: string;
  gift_paid: string;
  paid: string;
  refunded: string;
  due: string;
  overpaid: string;
  tip: string;
  inital_payment_type: string;
  status: boolean;
  payment_completed_at: string;
  created_dt: string;
  updated_dt: string;
  bookings: ResovaBooking[];
  customer: ResovaCustomer;
  payments: ResovaPayment[];
  extras: any[];
  purchases: any[];
  promotions: any[];
}

export interface ResovaBooking {
  id: number;
  transaction_id: number;
  booking_date: string;
  booking_time: string;
  booking_end: string;
  timezone: string;
  duration: number;
  is_private: number;
  total_quantity: number;
  per_person: string;
  price: string;
  discount: string;
  fee: string;
  tax: string;
  tip: string;
  total: string;
  status: string;
  quantities: Array<{
    per_person: string;
    pp_overwrite: string;
    total: string;
    quantity: number;
    pricing_category: {
      id: number;
      name: string;
    };
  }>;
  item: {
    id: number;
    name: string;
    featured_image: string;
  };
  extras: any[];
  participants: any[];
}

export interface ResovaCustomer {
  id: number;
  reference: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  mobile: string;
  telephone: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
}

export interface ResovaPayment {
  type: string;
  card_type: string;
  cardholder: string;
  last_four: string;
  amount: string;
  refunded: string;
  refunded_credit: string;
  total: string;
  tipped_amount: string;
  gateway_transaction_id: string;
  status: boolean;
  remaining: string;
}

export interface ResovaItemizedRevenue {
  transaction_id: number;
  transaction_status: string;
  transaction_due: string;
  transaction_due_value: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  id: number;
  status: string;
  inventory_type: string;
  item_name: string;
  date_short: string;
  time: string;
  total_quantity: number;
  price: string;
  discount_codes_value: string;
  gift_codes_value: string;
  total_net: string;
  gratuity: string;
  total_taxes: string;
  total_custom_fees: string;
  booking_total: string;
  source: string;
}

export interface ResovaAllBooking {
  transaction_id: number;
  transaction_status: string;
  transaction_due: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  id: number;
  status: string;
  item_name: string;
  date_short: string;
  time: string;
  total_quantity: number;
  price: string;
  booking_total: string;
  waiver_signed: string;
  source: string;
}

export interface ResovaAllPayment {
  transaction_id: number;
  transaction_status: string;
  transaction_payment_status: string;
  transaction_total: string;
  transaction_paid: string;
  transaction_due: string;
  cardholder: string;
  customer_email: string;
  created_d_short: string;
  created_t_short: string;
  payment_type: string;
  label: string;
  amount: string;
  refunded: string;
  remaining: string;
  gateway_transaction_id: string;
}

export interface ResovaInventoryItem {
  id: number;
  created_d_short: string;
  created_t_short: string;
  created_by: string;
  name: string;
  short_description: string;
  long_description: string;
  full_address: string;
  booking_questions: string;
  duration: number;
  start_date: string;
  end_date: string;
  total_schedules: number;
  total_closed_periods: number;
  capacity: string;
  privacy_type: string;
  total_resources: number;
  total_categories: number;
  total_extras: number;
  total_payment_types: number;
  total_bookings: number;
  total_sales: string;
  total_reviews: number;
  avg_review: string;
  updated_d_short: string;
  status_label: string;
  store: any;
}

export interface ResovaExtra {
  id: number;
  created_d_short: string;
  created_t_short: string;
  created_by: string;
  name: string;
  description: string;
  stock: number;
  used_stock: number;
  min_quantity: number;
  max_quantity: number;
  default_quantity: number;
  single_price: string;
  total_bookings: number;
  total_sales: string;
  updated_d_short: string;
  status_label: string;
  store: any;
}

export interface ResovaGuest {
  store: string;
  id: number;
  created_d_short: string;
  created_t_short: string;
  first_name: string;
  last_name: string;
  full_address: string;
  county: string;
  postcode: string;
  country: string | null;
  email: string;
  dob: string;
  telephone_sms: string | null;
  mobile_sms: string | null;
  mailchimp_subscribed: boolean;
  mailchimp_added: boolean;
  transactions_total: number;
  bookings_total: number;
  bookings_value: string;
  extras_total: number;
  extras_value: string;
  gift_vouchers_total: number;
  gift_vouchers_value: string;
  additional_total: number;
  additional_value: string;
  total_sales: string;
  payments_total: number;
  paid_total: string;
  due_total: string;
  overpaid_total: string;
  credits_total: string;
  credits_remaining_total: string;
  waiver_signed: string;
  signee_first_name: string;
  signee_last_name: string;
  signee_address: string;
  signee_county: string;
  signee_postcode: string;
  signee_country: string | null;
  signee_email: string;
  signee_telephone: string;
  signee_mobile: string;
  last_attended: string;
  last_item_booked: string;
  custom_fields: Record<string, string>;
  signee_fields: Record<string, string>;
}

export interface ResovaGiftVoucher {
  store: string | null;
  code: string;
  category_name: string;
  voucher_type: string;
  created_by: string;
  total_amount: string;
  total_redemption: string;
  total_redeemed: string;
  total_remaining: string;
  booking_end_date: string;
  last_used_d_short: string;
  gift_email: string;
  gift_message: string;
  purchase_transaction_id: string;
  purchase_customer_id: string;
  purchase_customer_first_name: string;
  purchase_customer_last_name: string;
  purchase_customer_email: string;
  updated_d_short: string;
  updated_by: string;
  created_d_short: string;
  status: string;
}

export interface ResovaAvailabilityInstance {
  id: number;
  item_id: number;
  item_name: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  capacity: number;
  booked: number;
  available: number;
  status: string;
  price: string;
}

// ==================== CORE API TYPES ====================

export interface ResovaItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  duration: number;
  max_capacity: number;
  min_capacity: number;
  pricing_type: string;
  featured_image: string;
  gallery: string[];
  status: string;
  categories: Array<{
    id: number;
    name: string;
  }>;
  pricing_categories: Array<{
    id: number;
    name: string;
    price: string;
    min_quantity: number;
    max_quantity: number;
  }>;
}

export interface ResovaCustomerDetail extends ResovaCustomer {
  created_at: string;
  updated_at: string;
  total_bookings: number;
  total_spent: string;
  last_booking_date: string;
  tags: string[];
}

export interface ResovaGiftVoucher {
  id: number;
  code: string;
  amount: string;
  balance: string;
  status: string;
  expires_at: string;
  recipient_name: string;
  recipient_email: string;
  purchaser_name: string;
  purchaser_email: string;
  created_at: string;
  redeemed_at: string | null;
}

export interface ResovaAvailability {
  date: string;
  available: boolean;
  capacity: number;
  booked: number;
  remaining: number;
  instances: Array<{
    id: number;
    start_time: string;
    end_time: string;
    available: boolean;
    capacity: number;
    booked: number;
  }>;
}

/**
 * Resova Reporting API Service Class
 */
export class ResovaReportingService {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(options: ResovaReportingServiceOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || config.api.resova.baseUrl;
    this.timeout = options.timeout || config.api.resova.timeout;

    logger.info('📡 ResovaReportingService initialized:');
    logger.info(`   Base URL: ${this.baseUrl}`);
    logger.info(`   Timeout: ${this.timeout}ms`);
  }

  // ==================== TRANSACTIONS REPORTING API ====================

  /**
   * Fetch transactions from Resova Transactions Reporting API
   * GET /v1/reporting/transactions
   */
  async getTransactions(params?: TransactionsParams): Promise<{
    data: ResovaTransaction[];
    overall_total: number;
    total: number;
    current_page: number;
    last_page: number;
  }> {
    try {
      const queryString = params ? this.buildQueryString(params) : '';
      const url = `${this.baseUrl}/reporting/transactions${queryString}`;

      logger.info(`Fetching transactions from: ${url}`);

      return await this.fetchWithTimeout(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
    } catch (error) {
      this.handleError(error, 'getTransactions');
      throw error;
    }
  }

  // ==================== ITEMIZED REVENUE API ====================

  /**
   * Fetch itemized revenue data
   * GET /v1/reporting/transactions/sales/itemizedRevenues
   */
  async getItemizedRevenue(payload: ItemizedRevenuePayload): Promise<ResovaItemizedRevenue[]> {
    try {
      // Build query parameters from date_range object
      const params = new URLSearchParams();
      if (payload.date_range.range) {
        params.append('range', payload.date_range.range);
      }
      if (payload.date_range.start_date) {
        params.append('start_date', payload.date_range.start_date);
      }
      if (payload.date_range.end_date) {
        params.append('end_date', payload.date_range.end_date);
      }

      const url = `${this.baseUrl}/reporting/transactions/sales/itemizedRevenues?${params.toString()}`;

      logger.info(`Fetching itemized revenue from: ${url}`);

      return await this.fetchWithTimeout(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
    } catch (error) {
      this.handleError(error, 'getItemizedRevenue');
      throw error;
    }
  }

  // ==================== ALL BOOKINGS REPORTING API ====================

  /**
   * Fetch all bookings data
   * GET /v1/reporting/transactions/bookings/allBookings
   */
  async getAllBookings(payload: AllBookingsPayload): Promise<ResovaAllBooking[]> {
    try {
      // Build query parameters from payload
      const params = new URLSearchParams();
      if (payload.type) params.append('type', payload.type);

      // Add date_range parameters
      if (payload.date_range.range) {
        params.append('range', payload.date_range.range);
      }
      if (payload.date_range.start_date) {
        params.append('start_date', payload.date_range.start_date);
      }
      if (payload.date_range.end_date) {
        params.append('end_date', payload.date_range.end_date);
      }

      const url = `${this.baseUrl}/reporting/transactions/bookings/allBookings?${params.toString()}`;

      logger.info(`Fetching all bookings (type: ${payload.type || 'all'}) from: ${url}`);

      return await this.fetchWithTimeout(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
    } catch (error) {
      this.handleError(error, 'getAllBookings');
      throw error;
    }
  }

  // ==================== ALL PAYMENTS REPORTING API ====================

  /**
   * Fetch all payments data
   * GET /v1/reporting/transactions/payments/allPayments
   */
  async getAllPayments(payload: AllPaymentsPayload): Promise<ResovaAllPayment[]> {
    try {
      // Build query parameters from payload
      const params = new URLSearchParams();
      if (payload.type) params.append('type', payload.type);

      // Add date_range parameters
      if (payload.date_range.range) {
        params.append('range', payload.date_range.range);
      }
      if (payload.date_range.start_date) {
        params.append('start_date', payload.date_range.start_date);
      }
      if (payload.date_range.end_date) {
        params.append('end_date', payload.date_range.end_date);
      }

      const url = `${this.baseUrl}/reporting/transactions/payments/allPayments?${params.toString()}`;

      logger.info(`Fetching all payments (type: ${payload.type || 'all'}) from: ${url}`);

      return await this.fetchWithTimeout(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
    } catch (error) {
      this.handleError(error, 'getAllPayments');
      throw error;
    }
  }

  /**
   * Fetch inventory items with sales/booking data
   * POST /v1/reporting/inventory/items
   */
  async getInventoryItems(payload: ItemsPayload): Promise<ResovaInventoryItem[]> {
    try {
      // Build request body
      const body: any = {
        date_range: {}
      };

      // Add date_range
      if (payload.date_range.range) {
        body.date_range.range = payload.date_range.range;
      }
      if (payload.date_range.start_date) {
        body.date_range.start_date = payload.date_range.start_date;
      }
      if (payload.date_range.end_date) {
        body.date_range.end_date = payload.date_range.end_date;
      }

      // Add optional filters
      if (payload.type) {
        body.type = payload.type;
      }
      if (payload.period) {
        body.period = payload.period;
      }
      if (payload.booking_status) {
        body.booking_status = payload.booking_status;
      }

      const url = `${this.baseUrl}/reporting/inventory/items`;

      logger.info(`Fetching inventory items from: ${url}`);

      return await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      });
    } catch (error) {
      this.handleError(error, 'getInventoryItems');
      throw error;
    }
  }

  /**
   * Fetch extras (add-ons) with sales/booking data
   * POST /v1/reporting/inventory/extras
   */
  async getExtras(payload: ExtrasPayload): Promise<ResovaExtra[]> {
    try {
      // Build request body
      const body: any = {
        date_range: {}
      };

      // Add date_range
      if (payload.date_range.range) {
        body.date_range.range = payload.date_range.range;
      }
      if (payload.date_range.start_date) {
        body.date_range.start_date = payload.date_range.start_date;
      }
      if (payload.date_range.end_date) {
        body.date_range.end_date = payload.date_range.end_date;
      }

      // Add optional filters
      if (payload.extras) {
        body.extras = payload.extras;
      }
      if (payload.transaction_status) {
        body.transaction_status = payload.transaction_status;
      }

      const url = `${this.baseUrl}/reporting/inventory/extras`;

      logger.info(`Fetching extras from: ${url}`);

      return await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      });
    } catch (error) {
      this.handleError(error, 'getExtras');
      throw error;
    }
  }

  /**
   * Fetch guests with booking/transaction data
   * POST /v1/reporting/guests
   */
  async getGuests(payload: GuestsPayload): Promise<ResovaGuest[]> {
    try {
      // Build request body
      const body: any = {
        date_range: {}
      };

      // Add date_range
      if (payload.date_range.range) {
        body.date_range.range = payload.date_range.range;
      }
      if (payload.date_range.start_date) {
        body.date_range.start_date = payload.date_range.start_date;
      }
      if (payload.date_range.end_date) {
        body.date_range.end_date = payload.date_range.end_date;
      }

      // Add optional filters
      if (payload.type) {
        body.type = payload.type;
      }
      if (payload.items) {
        body.items = payload.items;
      }

      const url = `${this.baseUrl}/reporting/guests`;

      logger.info(`Fetching guests from: ${url}`);

      return await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      });
    } catch (error) {
      this.handleError(error, 'getGuests');
      throw error;
    }
  }

  /**
   * Fetch gift vouchers with redemption and usage data
   * POST /v1/reporting/inventory/giftVouchers
   */
  async getGiftVouchers(payload: GiftVouchersPayload): Promise<ResovaGiftVoucher[]> {
    try {
      // Build request body
      const body: any = {
        date_range: {}
      };

      // Add date_range
      if (payload.date_range.range) {
        body.date_range.range = payload.date_range.range;
      }
      if (payload.date_range.start_date) {
        body.date_range.start_date = payload.date_range.start_date;
      }
      if (payload.date_range.end_date) {
        body.date_range.end_date = payload.date_range.end_date;
      }

      // Add optional filters
      if (payload.type) {
        body.type = payload.type;
      }
      if (payload.transaction_status) {
        body.transaction_status = payload.transaction_status;
      }
      if (payload.gift_status) {
        body.gift_status = payload.gift_status;
      }

      const url = `${this.baseUrl}/reporting/inventory/giftVouchers`;

      logger.info(`Fetching gift vouchers from: ${url}`);

      return await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      });
    } catch (error) {
      this.handleError(error, 'getGiftVouchers');
      throw error;
    }
  }

  // ==================== CORE API - ITEMS ====================
  // Note: Removed getItems() method - we use /reporting/inventory/items instead
  // which doesn't require additional "inventory view" permissions

  /**
   * Fetch a specific item by ID
   * GET /v1/items/{id}
   */
  async getItem(id: number): Promise<ResovaItem> {
    try {
      const url = `${this.baseUrl}/items/${id}`;

      logger.info(`Fetching item ${id}`);

      return await this.fetchWithTimeout(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
    } catch (error) {
      this.handleError(error, 'getItem');
      throw error;
    }
  }

  // ==================== CORE API - CUSTOMERS ====================

  /**
   * Fetch a specific customer by ID
   * GET /v1/customers/{id}
   */
  async getCustomer(id: number): Promise<ResovaCustomerDetail> {
    try {
      const url = `${this.baseUrl}/customers/${id}`;

      logger.info(`Fetching customer ${id}`);

      return await this.fetchWithTimeout(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
    } catch (error) {
      this.handleError(error, 'getCustomer');
      throw error;
    }
  }

  // ==================== CORE API - GIFT VOUCHERS ====================

  /**
   * Fetch all gift vouchers
   * GET /v1/gift-vouchers
   */
  async getGiftVouchers(): Promise<ResovaGiftVoucher[]> {
    try {
      const url = `${this.baseUrl}/gift-vouchers`;

      logger.info(`Fetching all gift vouchers`);

      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return response.data || response;
    } catch (error) {
      this.handleError(error, 'getGiftVouchers');
      throw error;
    }
  }

  /**
   * Fetch a specific gift voucher by ID
   * GET /v1/gift-vouchers/{id}
   */
  async getGiftVoucher(id: number): Promise<ResovaGiftVoucher> {
    try {
      const url = `${this.baseUrl}/gift-vouchers/${id}`;

      logger.info(`Fetching gift voucher ${id}`);

      return await this.fetchWithTimeout(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
    } catch (error) {
      this.handleError(error, 'getGiftVoucher');
      throw error;
    }
  }

  // ==================== CORE API - AVAILABILITY ====================

  /**
   * Fetch availability calendar for items across a date range
   * GET /v1/availability/calendar
   */
  async getAvailabilityCalendar(params: {
    start_date: string;
    end_date: string;
    item_id?: number;
    item_ids?: number[];
  }): Promise<ResovaAvailabilityInstance[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('start_date', params.start_date);
      queryParams.append('end_date', params.end_date);

      if (params.item_id) {
        queryParams.append('item_id', params.item_id.toString());
      }

      if (params.item_ids && params.item_ids.length > 0) {
        params.item_ids.forEach(id => {
          queryParams.append('item_ids[]', id.toString());
        });
      }

      const url = `${this.baseUrl}/availability/calendar?${queryParams.toString()}`;

      logger.info(`Fetching availability calendar from: ${url}`);

      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return response.data || response;
    } catch (error) {
      this.handleError(error, 'getAvailabilityCalendar');
      throw error;
    }
  }

  // ==================== CORE API - AVAILABILITY ====================

  /**
   * Fetch daily availability for an item
   * GET /v1/availability/daily
   */
  async getDailyAvailability(itemId: number, date: string): Promise<ResovaAvailability> {
    try {
      const queryString = this.buildQueryString({ item_id: itemId, date });
      const url = `${this.baseUrl}/availability/daily${queryString}`;

      logger.info(`Fetching daily availability for item ${itemId} on ${date}`);

      return await this.fetchWithTimeout(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
    } catch (error) {
      this.handleError(error, 'getDailyAvailability');
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Build query string from parameters
   */
  private buildQueryString(params: Record<string, any>): string {
    const filteredParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    return filteredParams ? `?${filteredParams}` : '';
  }

  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit
  ): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    logger.info(`🌐 API Request: ${options.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      logger.info(`✅ API Response: ${response.status} ${response.statusText} from ${url}`);

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`❌ API Error Response (${response.status}): ${errorText}`);
        throw new ApiError(
          `Resova API error: ${response.statusText} - ${errorText}`,
          response.status
        );
      }

      const data = await response.json();
      logger.info(`📦 Response data keys: ${Object.keys(data).join(', ')}`);
      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        logger.error(`⏱️ Request timeout after ${this.timeout}ms: ${url}`);
        throw new NetworkError('Request timeout');
      }

      logger.error(`❌ Fetch error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get request headers with X-API-KEY authentication
   */
  private getHeaders(): Record<string, string> {
    logger.info(`📤 Request Headers - API Key: ${this.apiKey.substring(0, 8)}...${this.apiKey.substring(this.apiKey.length - 4)} (length: ${this.apiKey.length})`);

    // Debug: Check for non-ASCII characters
    const hasNonASCII = /[^\x00-\x7F]/.test(this.apiKey);
    if (hasNonASCII) {
      logger.warn('⚠️ API Key contains non-ASCII characters!');
    }

    // Debug: Show exact bytes at start and end
    logger.info(`   Char codes (first 10): ${Array.from(this.apiKey.substring(0, 10)).map(c => c.charCodeAt(0)).join(',')}`);
    logger.info(`   Char codes (last 4): ${Array.from(this.apiKey.substring(this.apiKey.length - 4)).map(c => c.charCodeAt(0)).join(',')}`);

    return {
      'X-API-KEY': this.apiKey,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: any, context: string): never {
    logger.error(`Resova Reporting Service Error (${context})`, error);

    if (error instanceof ApiError || error instanceof NetworkError) {
      throw error;
    }

    throw new ApiError(
      error.message || 'An unexpected error occurred',
      500,
      error
    );
  }

  /**
   * Convert date range string to Resova date range format
   */
  static parseDateRange(dateRange?: string): ResovaDateRange {
    if (!dateRange) {
      return { range: '365' }; // Default to last 12 months for comprehensive analysis
    }

    // Map common date range strings to Resova format
    const rangeMap: Record<string, ResovaDateRange['range']> = {
      'today': 'today',
      'yesterday': 'yesterday',
      'Last 7 days': '7',
      'Last 30 days': '30',
      'Last 90 days': '90',
      'Last 12 months': '365',
      'This week': 'current_week',
      'Last week': 'previous_week',
      'This month': 'current_month',
      'Last month': 'previous_month',
      'This quarter': 'current_quarter',
      'Last quarter': 'previous_quarter',
    };

    if (rangeMap[dateRange]) {
      return { range: rangeMap[dateRange] };
    }

    // Default to last 12 months
    return { range: '365' };
  }

  /**
   * Calculate previous period date range for comparison
   * Returns the equivalent previous period based on the current range
   */
  static calculatePreviousPeriod(currentRange: ResovaDateRange): ResovaDateRange {
    // If using a named range, map to equivalent previous period
    const previousRangeMap: Record<string, ResovaDateRange['range']> = {
      'today': 'yesterday',
      'yesterday': undefined, // No previous for yesterday
      'current_week': 'previous_week',
      'previous_week': undefined, // Would need custom calculation
      'current_month': 'previous_month',
      'previous_month': undefined, // Would need custom calculation
      'current_quarter': 'previous_quarter',
      'previous_quarter': undefined, // Would need custom calculation
    };

    if (currentRange.range && previousRangeMap[currentRange.range]) {
      return { range: previousRangeMap[currentRange.range] };
    }

    // For explicit date ranges or numeric ranges, calculate previous period
    if (currentRange.start_date && currentRange.end_date) {
      const startDate = new Date(currentRange.start_date);
      const endDate = new Date(currentRange.end_date);
      const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      // Calculate previous period dates
      const prevEndDate = new Date(startDate);
      prevEndDate.setDate(prevEndDate.getDate() - 1);
      const prevStartDate = new Date(prevEndDate);
      prevStartDate.setDate(prevStartDate.getDate() - durationDays + 1);

      return {
        start_date: this.formatDate(prevStartDate),
        end_date: this.formatDate(prevEndDate)
      };
    }

    // For numeric ranges (7, 30, 90), use same range
    // This will get data from the period before the current period
    // e.g., if current is "30" (last 30 days), previous will also be "30" (the 30 days before that)
    if (currentRange.range) {
      const days = parseInt(currentRange.range, 10);
      if (!isNaN(days)) {
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() - days);
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - days);

        return {
          start_date: this.formatDate(startDate),
          end_date: this.formatDate(endDate)
        };
      }
    }

    // Fallback: return same range (will result in 0% change)
    return currentRange;
  }

  /**
   * Format date as YYYY-MM-DD
   */
  private static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
