/**
 * Resova Service
 * Handles all communication with the Resova API using Reporting APIs
 */

import { config } from '../../config/environment';
import { AnalyticsData, ApiError, NetworkError, ServiceOptions } from '@/app/types/analytics';
import { logger } from '../utils/logger';
import { ResovaDataTransformer } from '../transformers/resova-data-transformer';
import { CustomerIntelligenceTransformer } from '../transformers/customer-intelligence-transformer';
import {
  ResovaCustomer,
  CustomerListResponse,
  ResovaGiftVoucher,
  GiftVoucherListResponse,
  ResovaBasket,
  BasketListResponse,
  ResovaItemReview,
  ItemReviewsResponse
} from '@/app/types/resova-core';

export interface ResovaServiceOptions extends ServiceOptions {
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

export interface ResovaGiftVoucherReporting {
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

export class ResovaService {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(options: ResovaServiceOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || config.api.resova.baseUrl;
    this.timeout = options.timeout || config.api.resova.timeout;

    // Log configuration for debugging
    logger.info('🔧 ResovaService Configuration:');
    logger.info(`   Base URL: ${this.baseUrl}`);
    logger.info(`   API Key: ${this.apiKey.substring(0, 8)}...${this.apiKey.substring(this.apiKey.length - 4)}`);
    logger.info(`   Timeout: ${this.timeout}ms`);
  }

  // ==================== RESOVA REPORTING API METHODS ====================

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

  /**
   * Fetch itemized revenue data
   * GET /v1/reporting/transactions/sales/itemizedRevenues
   */
  async getItemizedRevenue(payload: ItemizedRevenuePayload): Promise<ResovaItemizedRevenue[]> {
    try {
      // Build request body per Resova API documentation
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

      const url = `${this.baseUrl}/reporting/transactions/sales/itemizedRevenues`;

      logger.info(`Fetching itemized revenue from: ${url}`);

      return await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      });
    } catch (error) {
      this.handleError(error, 'getItemizedRevenue');
      throw error;
    }
  }

  /**
   * Fetch all bookings data
   * GET /v1/reporting/transactions/bookings/allBookings
   */
  async getAllBookings(payload: AllBookingsPayload): Promise<ResovaAllBooking[]> {
    try {
      // Build request body per Resova API documentation
      const body: any = {
        date_range: {}
      };

      // Add type
      if (payload.type) {
        body.type = payload.type;
      }

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

      const url = `${this.baseUrl}/reporting/transactions/bookings/allBookings`;

      logger.info(`Fetching all bookings (type: ${payload.type || 'all'}) from: ${url}`);

      return await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      });
    } catch (error) {
      this.handleError(error, 'getAllBookings');
      throw error;
    }
  }

  /**
   * Fetch all payments data
   * POST /v1/reporting/transactions/payments/allPayments
   */
  async getAllPayments(payload: AllPaymentsPayload): Promise<ResovaAllPayment[]> {
    try {
      // Build request body per Resova API documentation
      const body: any = {
        date_range: {}
      };

      // Add type
      if (payload.type) {
        body.type = payload.type;
      }

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

      const url = `${this.baseUrl}/reporting/transactions/payments/allPayments`;

      logger.info(`Fetching all payments (type: ${payload.type || 'all'}) from: ${url}`);

      return await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
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
  async getReportingGiftVouchers(payload: GiftVouchersPayload): Promise<ResovaGiftVoucherReporting[]> {
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
      this.handleError(error, 'getReportingGiftVouchers');
      throw error;
    }
  }

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

  // ==================== CORE API - ITEMS ====================

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
   * Fetch a specific gift voucher by ID
   * GET /v1/vouchers/{id}
   */
  async getGiftVoucher(id: number): Promise<ResovaGiftVoucher> {
    try {
      const url = `${this.baseUrl}/vouchers/${id}`;

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

  // ==================== RESOVA CORE API METHODS (PAGINATED) ====================

  /**
   * Get customers (single page)
   * GET /v1/customers
   */
  async getCustomers(page: number = 1, perPage: number = 100): Promise<ResovaCustomer[]> {
    try {
      logger.info(`Fetching customers (page ${page}, ${perPage} per page)`);

      const url = `${this.baseUrl}/customers?page=${page}&per_page=${perPage}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          `Resova API error: ${errorData.message || response.statusText}`,
          response.status,
          errorData
        );
      }

      const data: CustomerListResponse = await response.json();
      logger.info(`Fetched ${data.data.length} customers`);

      return data.data;
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }

      logger.error('Failed to fetch customers', error);
      throw new NetworkError('Failed to fetch customers from Resova API', error);
    }
  }

  /**
   * Get all customers (fetches all pages if needed)
   */
  async getAllCustomers(maxPages: number = 5): Promise<ResovaCustomer[]> {
    let allCustomers: ResovaCustomer[] = [];
    let currentPage = 1;

    try {
      while (currentPage <= maxPages) {
        const customers = await this.getCustomers(currentPage, 100);

        if (customers.length === 0) {
          break; // No more customers
        }

        allCustomers = [...allCustomers, ...customers];

        // If we got less than 100, we've reached the end
        if (customers.length < 100) {
          break;
        }

        currentPage++;
      }

      logger.info(`Fetched total of ${allCustomers.length} customers across ${currentPage} pages`);
      return allCustomers;
    } catch (error) {
      logger.error('Failed to fetch all customers', error);
      throw error;
    }
  }

  /**
   * Get gift vouchers (single page)
   * GET /v1/vouchers
   */
  async getGiftVouchers(page: number = 1, perPage: number = 100): Promise<ResovaGiftVoucher[]> {
    try {
      logger.info(`Fetching gift vouchers (page ${page}, ${perPage} per page)`);

      const url = `${this.baseUrl}/gift-vouchers?page=${page}&per_page=${perPage}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          `Resova API error: ${errorData.message || response.statusText}`,
          response.status,
          errorData
        );
      }

      const data: GiftVoucherListResponse = await response.json();
      logger.info(`Fetched ${data.data.length} gift vouchers`);

      return data.data;
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }

      logger.error('Failed to fetch gift vouchers', error);
      throw new NetworkError('Failed to fetch gift vouchers from Resova API', error);
    }
  }

  /**
   * Get all gift vouchers (fetches all pages if needed)
   */
  async getAllGiftVouchers(maxPages: number = 5): Promise<ResovaGiftVoucher[]> {
    let allVouchers: ResovaGiftVoucher[] = [];
    let currentPage = 1;

    try {
      while (currentPage <= maxPages) {
        const vouchers = await this.getGiftVouchers(currentPage, 100);

        if (vouchers.length === 0) {
          break;
        }

        allVouchers = [...allVouchers, ...vouchers];

        if (vouchers.length < 100) {
          break;
        }

        currentPage++;
      }

      logger.info(`Fetched total of ${allVouchers.length} gift vouchers across ${currentPage} pages`);
      return allVouchers;
    } catch (error) {
      logger.error('Failed to fetch all gift vouchers', error);
      throw error;
    }
  }

  /**
   * Get item reviews for a specific item
   * GET /v1/items/{item_id}/reviews
   */
  async getItemReviews(itemId: string): Promise<ResovaItemReview[]> {
    try {
      logger.info(`Fetching reviews for item ${itemId}`);

      const url = `${this.baseUrl}/items/${itemId}/reviews`;

      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      // Response can be array or object with data property
      if (Array.isArray(response)) {
        return response as ResovaItemReview[];
      }

      if (response.data && Array.isArray(response.data)) {
        return response.data as ResovaItemReview[];
      }

      logger.warn(`Unexpected response format for item ${itemId} reviews:`, response);
      return [];
    } catch (error) {
      // If item has no reviews or endpoint fails, return empty array instead of throwing
      if (error instanceof ApiError && (error.statusCode === 404 || error.statusCode === 400)) {
        logger.info(`No reviews found for item ${itemId}`);
        return [];
      }

      if (error instanceof NetworkError) {
        logger.warn(`Network error fetching reviews for item ${itemId}:`, error.message);
        return [];
      }

      logger.error(`Failed to fetch reviews for item ${itemId}`, error);
      return [];
    }
  }

  /**
   * Get all reviews for all items (batch fetch)
   */
  async getAllItemReviews(itemIds: string[]): Promise<ResovaItemReview[]> {
    try {
      logger.info(`Fetching reviews for ${itemIds.length} items`);

      // Fetch reviews for all items in parallel (limit concurrency to 10 at a time)
      const BATCH_SIZE = 10;
      let allReviews: ResovaItemReview[] = [];

      for (let i = 0; i < itemIds.length; i += BATCH_SIZE) {
        const batch = itemIds.slice(i, i + BATCH_SIZE);
        const batchReviews = await Promise.all(
          batch.map(itemId => this.getItemReviews(itemId))
        );

        // Flatten array of arrays
        allReviews = [...allReviews, ...batchReviews.flat()];
      }

      logger.info(`Fetched total of ${allReviews.length} reviews across ${itemIds.length} items`);
      return allReviews;
    } catch (error) {
      logger.error('Failed to fetch all item reviews', error);
      return []; // Return empty array instead of throwing to not break analytics
    }
  }

  /**
   * Get baskets (single page)
   * GET /v1/baskets
   */
  async getBaskets(page: number = 1, perPage: number = 100, status?: string): Promise<ResovaBasket[]> {
    try {
      logger.info(`Fetching baskets (page ${page}, ${perPage} per page, status: ${status || 'all'})`);

      let url = `${this.baseUrl}/baskets?page=${page}&per_page=${perPage}`;
      if (status) {
        url += `&status=${status}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          `Resova API error: ${errorData.message || response.statusText}`,
          response.status,
          errorData
        );
      }

      const data: BasketListResponse = await response.json();
      logger.info(`Fetched ${data.data.length} baskets`);

      return data.data;
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }

      logger.debug('Failed to fetch baskets', error);
      throw new NetworkError('Failed to fetch baskets from Resova API', error);
    }
  }

  /**
   * Get abandoned carts specifically
   */
  async getAbandonedCarts(maxPages: number = 3): Promise<ResovaBasket[]> {
    let allCarts: ResovaBasket[] = [];
    let currentPage = 1;

    try {
      while (currentPage <= maxPages) {
        const carts = await this.getBaskets(currentPage, 100, 'abandoned');

        if (carts.length === 0) {
          break;
        }

        allCarts = [...allCarts, ...carts];

        if (carts.length < 100) {
          break;
        }

        currentPage++;
      }

      logger.info(`Fetched total of ${allCarts.length} abandoned carts across ${currentPage} pages`);
      return allCarts;
    } catch (error) {
      logger.debug('Failed to fetch abandoned carts', error);
      throw error;
    }
  }

  // ==================== MAIN ANALYTICS METHOD ====================

  /**
   * Fetch analytics data from Resova Reporting APIs
   * Default: 12 months historical + 90 days forward for comprehensive analysis
   */
  async getAnalytics(dateRange?: string, includeBusinessInsights: boolean = true): Promise<AnalyticsData> {
    try {
      logger.info(`Fetching analytics from Resova Reporting APIs (${dateRange || 'Last 30 days + 90 days forward'})`);

      // Parse date range for API calls
      // Default to 30 days for dashboard overview
      const resovaDateRange = dateRange ?
        ResovaService.parseDateRange(dateRange) :
        { range: '30' as const };

      // Calculate previous period for comparison
      const previousPeriodRange = ResovaService.calculatePreviousPeriod(resovaDateRange);
      logger.info(`Date ranges - Current: ${JSON.stringify(resovaDateRange)}, Previous: ${JSON.stringify(previousPeriodRange)}`);

      // Calculate explicit start/end dates for availability calendar
      let availabilityStartDate: string;
      let availabilityEndDate: string;

      // Get today's date for Today's Agenda and future bookings (use local date, not UTC)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`; // YYYY-MM-DD format for API calls
      const todayShort = `${month}/${day}/${year}`; // MM/DD/YYYY format for filtering date_short field

      // Calculate 90 days in the PAST - for fetching bookings purchased in advance
      const past90Date = new Date();
      past90Date.setDate(past90Date.getDate() - 90);
      const pastYear = past90Date.getFullYear();
      const pastMonth = String(past90Date.getMonth() + 1).padStart(2, '0');
      const pastDay = String(past90Date.getDate()).padStart(2, '0');
      const past90Days = `${pastYear}-${pastMonth}-${pastDay}`;

      // Calculate 90 days in the FUTURE for forward-looking analysis
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 90);
      const futureYear = futureDate.getFullYear();
      const futureMonth = String(futureDate.getMonth() + 1).padStart(2, '0');
      const futureDay = String(futureDate.getDate()).padStart(2, '0');
      const future90Days = `${futureYear}-${futureMonth}-${futureDay}`;

      // For future bookings: fetch from 90 days ago to 90 days forward (by purchase date)
      // Then filter client-side by event date for today's bookings
      const futureBookingsRange = { start_date: past90Days, end_date: future90Days };

      logger.info(`Historical period: 12 months back | Forward-looking period: ${past90Days} to ${future90Days} (captures advance bookings)`);

      // Calculate explicit dates for availability calendar
      if (resovaDateRange.start_date && resovaDateRange.end_date) {
        // If explicit dates provided, use them
        availabilityStartDate = resovaDateRange.start_date;
        availabilityEndDate = resovaDateRange.end_date;
      } else {
        // Calculate dates based on range
        const daysBack = parseInt(resovaDateRange.range || '30', 10) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);
        const startYear = startDate.getFullYear();
        const startMonth = String(startDate.getMonth() + 1).padStart(2, '0');
        const startDay = String(startDate.getDate()).padStart(2, '0');
        availabilityStartDate = `${startYear}-${startMonth}-${startDay}`;
        availabilityEndDate = today;
      }

      // Fetch data in small sequential batches (max 2 concurrent) with delays to avoid overwhelming Resova's database
      logger.info('📦 Fetching data slowly in small batches to protect Resova API (this will take ~10-15 seconds)...');

      // Helper to delay between batches (1.5 seconds gives database plenty of time to recover)
      const delayBetweenBatches = () => new Promise(resolve => setTimeout(resolve, 1500));

      // Batch 1/8: Transactions + itemized revenue
      logger.info('📦 Batch 1/8: Transactions + itemized revenue');
      const [transactionsResponse, itemizedRevenue] = await Promise.all([
        this.getTransactions({
          limit: 300, // Reduced from 500 to lower memory/CPU usage
          date_field: 'created_at',
          range: resovaDateRange.range,
          start_date: resovaDateRange.start_date,
          end_date: resovaDateRange.end_date
        }),
        this.getItemizedRevenue({ date_range: resovaDateRange })
      ]);
      await delayBetweenBatches();

      // Batch 2/8: Current period bookings + payments
      logger.info('📦 Batch 2/8: Current period bookings + payments');
      const [allBookings, allPayments] = await Promise.all([
        this.getAllBookings({ type: 'all', date_range: resovaDateRange }),
        this.getAllPayments({ type: 'all', date_range: resovaDateRange })
      ]);
      await delayBetweenBatches();

      // Batch 3/8: Future bookings + inventory
      logger.info('📦 Batch 3/8: Future bookings + inventory');

      // Future bookings (optional - may not be available for all accounts)
      let futureBookingsRaw: any[] = [];
      try {
        futureBookingsRaw = await this.getAllBookings({ type: 'all', date_range: futureBookingsRange });
        logger.info(`✅ Fetched ${futureBookingsRaw.length} future bookings`);
      } catch (error) {
        logger.warn('⚠️ Future bookings endpoint not available - continuing without future bookings data', error);
      }

      // Inventory items (required for core analytics)
      const inventoryItems = await this.getInventoryItems({
        date_range: resovaDateRange,
        type: 'all_bookings',
        period: 'event_date',
        booking_status: 'completed'
      });

      await delayBetweenBatches();

      // Batch 4/8: Availability + extras
      logger.info('📦 Batch 4/8: Availability + extras');

      // Availability calendar (optional - capacity data)
      let availabilityInstances: any[] = [];
      try {
        availabilityInstances = await this.getAvailabilityCalendar({
          start_date: availabilityStartDate,
          end_date: availabilityEndDate
        });
        logger.info(`✅ Fetched ${availabilityInstances.length} availability instances`);
      } catch (error) {
        logger.warn('⚠️ Availability calendar endpoint not available - continuing without capacity data', error);
      }

      // Extras (optional)
      let extras: any[] = [];
      try {
        extras = await this.getExtras({
          date_range: resovaDateRange,
          extras: 'all',
          transaction_status: 'active'
        });
        logger.info(`✅ Fetched ${extras.length} extras`);
      } catch (error) {
        logger.warn('⚠️ Extras endpoint not available - continuing without extras data', error);
      }

      await delayBetweenBatches();

      // Batch 5/8: Gift vouchers + abandoned carts
      logger.info('📦 Batch 5/8: Gift vouchers + abandoned carts');

      // Fetch vouchers (optional)
      let reportingVouchers: any[] = [];
      try {
        reportingVouchers = await this.getReportingGiftVouchers({
          date_range: resovaDateRange,
          type: 'all_gifts',
          transaction_status: 'active',
          gift_status: 'all'
        });
        logger.info(`✅ Fetched ${reportingVouchers.length} gift vouchers`);
      } catch (error) {
        logger.warn('⚠️ Gift vouchers endpoint not available - continuing without gift voucher data', error);
      }

      // Fetch abandoned carts (optional - may not be available for all accounts)
      let abandonedCarts: ResovaBasket[] = [];
      try {
        abandonedCarts = await this.getAbandonedCarts(1); // Max 100 carts
        logger.info(`✅ Fetched ${abandonedCarts.length} abandoned carts`);
      } catch (error) {
        logger.warn('⚠️ Abandoned carts endpoint not available - continuing without abandoned cart data', error);
      }

      await delayBetweenBatches();

      // Batch 6/8: Previous period transactions + bookings
      logger.info('📦 Batch 6/8: Previous period transactions + bookings');
      const [previousTransactionsResponse, previousAllBookings] = await Promise.all([
        this.getTransactions({
          limit: 300, // Reduced from 500
          date_field: 'created_at',
          range: previousPeriodRange.range,
          start_date: previousPeriodRange.start_date,
          end_date: previousPeriodRange.end_date
        }),
        this.getAllBookings({ type: 'all', date_range: previousPeriodRange })
      ]);
      await delayBetweenBatches();

      // Batch 7/8: Previous period payments + extras
      logger.info('📦 Batch 7/8: Previous period payments + extras');

      // Previous payments (required)
      const previousAllPayments = await this.getAllPayments({ type: 'all', date_range: previousPeriodRange });

      // Previous extras (optional)
      let previousExtras: any[] = [];
      try {
        previousExtras = await this.getExtras({
          date_range: previousPeriodRange,
          extras: 'all',
          transaction_status: 'active'
        });
        logger.info(`✅ Fetched ${previousExtras.length} previous period extras`);
      } catch (error) {
        logger.warn('⚠️ Previous period extras endpoint not available - continuing without previous extras data', error);
      }

      await delayBetweenBatches();

      // Batch 8/8: Previous period gift vouchers (final batch)
      logger.info('📦 Batch 8/8: Previous period gift vouchers');

      // Previous vouchers (optional)
      let previousReportingVouchers: any[] = [];
      try {
        previousReportingVouchers = await this.getReportingGiftVouchers({
          date_range: previousPeriodRange,
          type: 'all_gifts',
          transaction_status: 'active',
          gift_status: 'all'
        });
        logger.info(`✅ Fetched ${previousReportingVouchers.length} previous period gift vouchers`);
      } catch (error) {
        logger.warn('⚠️ Previous period gift vouchers endpoint not available - continuing without previous voucher data', error);
      }

      logger.info('✅ All data fetched successfully in 8 sequential batches with delays');

      // Unwrap futureBookingsRaw for forward-looking analysis
      const futureBookingsArray = Array.isArray(futureBookingsRaw) ? futureBookingsRaw : ((futureBookingsRaw as any).data || []);
      const futureBookings = futureBookingsArray;

      // Filter today's bookings by date_short field (event date)
      // This captures advance bookings (purchased weeks/months ago but events today)
      // Note: date_short is in MM/DD/YYYY format (e.g., "11/17/2025")
      const todaysBookings = futureBookingsArray.filter((booking: any) => {
        return booking.date_short === todayShort;
      });

      logger.info(`\n========== TODAY'S BOOKINGS DEBUG ==========`);
      logger.info(`📅 Today's date: ${today} (${todayShort})`);
      logger.info(`📦 Future bookings fetched (${past90Days} to ${future90Days}): ${futureBookingsArray.length}`);

      // Debug: Show ALL date_short values to understand what's in the response
      if (futureBookingsArray.length > 0) {
        const allDates = futureBookingsArray.map((b: any) => b.date_short).sort();
        logger.info(`📅 All event dates in response: ${JSON.stringify(allDates.slice(0, 20))}${allDates.length > 20 ? ` ... and ${allDates.length - 20} more` : ''}`);

        // Check if today's date exists in any format
        const matchingDates = futureBookingsArray.filter((b: any) => b.date_short && b.date_short.includes('11/17'));
        logger.info(`🔍 Bookings containing "11/17": ${matchingDates.length}`);
        if (matchingDates.length > 0) {
          matchingDates.forEach((b: any) => {
            logger.info(`  - date_short="${b.date_short}", booking_time="${b.booking_time}", item="${b.item?.name}", tx_id=${b.transaction_id}`);
          });
        }
      }

      logger.info(`📦 Today's bookings filtered by date_short: ${todaysBookings.length}`);
      if (todaysBookings.length > 0) {
        logger.info(`\n📋 Sample today's bookings (first 3):`);
        todaysBookings.slice(0, 3).forEach((booking: any, index: number) => {
          logger.info(`  Booking ${index + 1}: ${booking.item?.name || 'N/A'} at ${booking.booking_time} (Date: ${booking.date_short}, Status: ${booking.status})`);
        });
      }
      logger.info(`========================================\n`);

      logger.info(`✅ CURRENT PERIOD (12 months): ${transactionsResponse.data.length} transactions, ${allBookings.length} bookings, ${allPayments.length} payments`);
      logger.info(`✅ PREVIOUS PERIOD (year-over-year): ${previousTransactionsResponse.data.length} transactions, ${previousAllBookings.length} bookings, ${previousAllPayments.length} payments`);
      logger.info(`✅ FORWARD-LOOKING (90 days): ${futureBookings.length} future bookings`);
      logger.info(`✅ TODAY'S AGENDA: ${todaysBookings.length} bookings today (filtered by date_short from ${futureBookingsArray.length} future bookings)`);
      logger.info(`📊 Additional data: ${itemizedRevenue.length} revenue items, ${inventoryItems.length} inventory items, ${availabilityInstances.length} availability instances`);
      logger.info(`📊 Report data: ${extras.length} extras, ${reportingVouchers.length} vouchers, ${abandonedCarts.length} abandoned carts | Previous: ${previousExtras.length} extras, ${previousReportingVouchers.length} vouchers`);

      // Transform Resova data to our analytics format (with previous period for accurate comparisons)
      const analyticsData = ResovaDataTransformer.transform(
        transactionsResponse.data,
        itemizedRevenue,
        allBookings,
        allPayments,
        todaysBookings,
        // Previous period data for accurate trend calculations
        previousTransactionsResponse.data,
        previousAllBookings,
        previousAllPayments,
        // Additional data for report summaries
        extras,
        reportingVouchers,
        availabilityInstances,
        abandonedCarts,
        // Previous period report data for trend calculations
        previousExtras,
        previousReportingVouchers
      );

      // Optionally fetch business insights from Core APIs
      if (includeBusinessInsights) {
        try {
          logger.info('Fetching business insights from Core APIs');

          // Note: We already have inventory items from /reporting/inventory/items (line 157-161)
          // No need to call /items endpoint which requires additional permissions
          // Transform business insights using the inventory items we already fetched
          analyticsData.businessInsights = ResovaDataTransformer.transformBusinessInsights(
            inventoryItems, // Use inventory items already fetched from /reporting/inventory/items
            transactionsResponse.data,
            allBookings,
            [], // Empty vouchers array - will be calculated from transaction data instead
            inventoryItems, // Pass inventory items for activity profitability
            availabilityInstances || [] // availabilityInstances is already an array
          );

          logger.info('Successfully added business insights');

          // Fetch customer, voucher, and basket intelligence
          try {
            logger.info('Fetching customer intelligence from Core APIs');

            // Fetch customers, vouchers, abandoned carts, and reviews in parallel
            const itemIds = inventoryItems.map(item => item.id.toString());

            const [customers, vouchers, abandonedCarts, allReviews] = await Promise.all([
              this.getAllCustomers(3), // Fetch up to 3 pages (300 customers)
              this.getAllGiftVouchers(2), // Fetch up to 2 pages (200 vouchers)
              this.getAbandonedCarts(2), // Fetch up to 2 pages (200 carts)
              this.getAllItemReviews(itemIds) // Fetch reviews for all items
            ]);

            logger.info(`Fetched ${customers.length} customers, ${vouchers.length} vouchers, ${abandonedCarts.length} abandoned carts, ${allReviews.length} reviews`);

            // Transform into intelligence
            if (!analyticsData.businessInsights) {
              analyticsData.businessInsights = {
                items: [],
                customers: {
                  totalCustomers: 0,
                  newCustomers: 0,
                  repeatRate: 0,
                  topCustomers: [],
                  topCustomersByRevenue: []
                },
                vouchers: {
                  totalActive: 0,
                  totalRedeemed: 0,
                  totalValue: 0,
                  redemptionRate: 0,
                  expiringWithin30Days: 0,
                  giftSales: 0,
                  redeemedCount: 0,
                  redeemedValue: 0,
                  availableCount: 0,
                  availableValue: 0,
                  breakageRate: 0,
                  averageVoucherValue: 0,
                  averageRedemptionValue: 0
                },
                availability: { utilizationRate: 0, peakDays: [], lowBookingDays: [], averageCapacity: 0, averageBooked: 0 }
              };
            }

            // Note: customerIntelligence is already set by ResovaDataTransformer.transformBusinessInsights
            // We only add the voucher and conversion intelligence here from Core APIs

            analyticsData.businessInsights!.voucherIntelligence =
              CustomerIntelligenceTransformer.transformVoucherIntelligence(vouchers, transactionsResponse.data);

            analyticsData.businessInsights!.conversionIntelligence =
              CustomerIntelligenceTransformer.transformConversionIntelligence(abandonedCarts);

            logger.info('Successfully added customer, voucher, and conversion intelligence');

            // Attach raw API data for AI Assistant to analyze
            analyticsData.rawData = {
              transactions: transactionsResponse.data,
              itemizedRevenue,
              allBookings,
              allPayments,
              inventoryItems,
              availabilityInstances,
              extras, // Add-ons/extras data for upsell analysis
              reportingVouchers, // Gift vouchers from Reporting API with redemption tracking
              customers,
              vouchers,
              abandonedCarts,
              reviews: allReviews, // Include all item reviews for guest sentiment analysis
              items: inventoryItems, // Use inventoryItems as items for backward compatibility
              futureBookings // Include future bookings for forward-looking analysis
            };
          } catch (intelligenceError) {
            logger.warn('Failed to fetch customer intelligence, continuing without it', intelligenceError);
            // Attach partial raw data even if intelligence fetch fails
            analyticsData.rawData = {
              transactions: transactionsResponse.data,
              itemizedRevenue,
              allBookings,
              allPayments,
              inventoryItems,
              availabilityInstances,
              extras, // Add-ons/extras data for upsell analysis
              reportingVouchers, // Gift vouchers from Reporting API with redemption tracking
              items: inventoryItems, // Use inventoryItems as items for backward compatibility
              futureBookings
            };
          }
        } catch (insightsError) {
          logger.warn('Failed to fetch business insights, continuing without them', insightsError);
          // Attach minimal raw data even if business insights fail
          analyticsData.rawData = {
            transactions: transactionsResponse.data,
            itemizedRevenue,
            allBookings,
            allPayments,
            extras, // Add-ons/extras data for upsell analysis
            reportingVouchers, // Gift vouchers from Reporting API with redemption tracking
            futureBookings
          };
        }
      } else {
        // If business insights not requested, still attach basic raw data
        analyticsData.rawData = {
          transactions: transactionsResponse.data,
          itemizedRevenue,
          allBookings,
          allPayments,
          extras, // Add-ons/extras data for upsell analysis
          reportingVouchers, // Gift vouchers from Reporting API with redemption tracking
          futureBookings
        };
      }

      // Generate date range label based on REQUESTED range (not actual data)
      // This ensures AI understands what period was requested, even if data is sparse
      let dateRangeLabel = 'Last 30 days'; // Default for 30 days

      // Map based on requested range
      if (resovaDateRange.range) {
        const rangeLabelMap: Record<string, string> = {
          'today': 'Today',
          'yesterday': 'Yesterday',
          '7': 'Last 7 days',
          '14': 'Last 14 days',
          '30': 'Last 30 days',
          '60': 'Last 2 months',
          '90': 'Last 3 months',
          '180': 'Last 6 months',
          '270': 'Last 9 months',
          '365': 'Last 12 months',
          'current_week': 'This week',
          'previous_week': 'Last week',
          'current_month': 'This month',
          'previous_month': 'Last month',
          'current_quarter': 'This quarter',
          'previous_quarter': 'Last quarter',
        };

        dateRangeLabel = rangeLabelMap[resovaDateRange.range] || 'Last 30 days';
      } else if (resovaDateRange.start_date && resovaDateRange.end_date) {
        // For explicit date ranges, show the actual dates
        dateRangeLabel = `${resovaDateRange.start_date} to ${resovaDateRange.end_date}`;
      }

      logger.info(`Date range label: "${dateRangeLabel}" (requested range: ${JSON.stringify(resovaDateRange)})`);

      analyticsData.dateRangeLabel = dateRangeLabel;

      logger.info('Successfully transformed Resova data to analytics format');

      return analyticsData;
    } catch (error) {
      this.handleError(error);
      throw error; // TypeScript needs this
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
  private handleError(error: any, context?: string): never {
    const errorContext = context ? `Resova Service Error (${context})` : 'Resova Service Error';
    logger.error(errorContext, error);

    if (error instanceof ApiError || error instanceof NetworkError) {
      throw error;
    }

    throw new ApiError(
      error.message || 'An unexpected error occurred',
      500,
      error
    );
  }

  // ==================== STATIC HELPER METHODS ====================

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
   * For 12-month periods (365 days), splits into first 6 months vs last 6 months
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

    // For explicit date ranges, calculate previous period as first half vs second half
    if (currentRange.start_date && currentRange.end_date) {
      const startDate = new Date(currentRange.start_date);
      const endDate = new Date(currentRange.end_date);
      const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      // Split period in half for comparison
      const halfDuration = Math.floor(durationDays / 2);

      // Previous period = first half of the total period
      const prevStartDate = new Date(startDate);
      const prevEndDate = new Date(startDate);
      prevEndDate.setDate(prevEndDate.getDate() + halfDuration - 1);

      return {
        start_date: this.formatDate(prevStartDate),
        end_date: this.formatDate(prevEndDate)
      };
    }

    // For numeric ranges (365 days = 12 months), split into 6-month periods
    // Previous period = first 6 months, Current period = last 6 months
    if (currentRange.range) {
      const days = parseInt(currentRange.range, 10);
      if (!isNaN(days)) {
        const today = new Date();

        // Calculate the start of the full period (e.g., 365 days ago)
        const periodStart = new Date(today);
        periodStart.setDate(periodStart.getDate() - days);

        // Split into two equal halves
        const halfDays = Math.floor(days / 2);

        // Previous period = first half (e.g., Nov 17, 2024 - May 16, 2025)
        const prevStartDate = new Date(periodStart);
        const prevEndDate = new Date(periodStart);
        prevEndDate.setDate(prevEndDate.getDate() + halfDays - 1);

        return {
          start_date: this.formatDate(prevStartDate),
          end_date: this.formatDate(prevEndDate)
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
