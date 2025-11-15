/**
 * Resova Service
 * Handles all communication with the Resova API using Reporting APIs
 */

import { config } from '../../config/environment';
import { AnalyticsData, ApiError, NetworkError, ServiceOptions } from '@/app/types/analytics';
import { logger } from '../utils/logger';
import { ResovaReportingService } from './resova-reporting-service';
import { ResovaDataTransformer } from '../transformers/resova-data-transformer';
import { ResovaCoreService } from './resova-core-service';
import { CustomerIntelligenceTransformer } from '../transformers/customer-intelligence-transformer';

export interface ResovaServiceOptions extends ServiceOptions {
  apiKey: string;
  baseUrl?: string;
}

export class ResovaService {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;
  private reportingService: ResovaReportingService;
  private coreService: ResovaCoreService;

  constructor(options: ResovaServiceOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || config.api.resova.baseUrl;
    this.timeout = options.timeout || config.api.resova.timeout;

    // Initialize Resova Reporting Service
    this.reportingService = new ResovaReportingService({
      apiKey: this.apiKey,
      baseUrl: this.baseUrl,
      timeout: this.timeout
    });

    // Initialize Resova Core Service (for Customers, Vouchers, Baskets)
    this.coreService = new ResovaCoreService({
      apiKey: this.apiKey,
      baseUrl: this.baseUrl,
      timeout: this.timeout
    });
  }

  /**
   * Fetch analytics data from Resova Reporting APIs
   */
  async getAnalytics(dateRange?: string, includeBusinessInsights: boolean = true): Promise<AnalyticsData> {
    try {
      logger.info(`Fetching analytics from Resova Reporting APIs (${dateRange || 'Last 30 days'})`);

      // Parse date range for API calls
      const resovaDateRange = ResovaReportingService.parseDateRange(dateRange);

      // Calculate previous period for comparison
      const previousPeriodRange = ResovaReportingService.calculatePreviousPeriod(resovaDateRange);
      logger.info(`Previous period range calculated: ${JSON.stringify(previousPeriodRange)}`);

      // Calculate explicit start/end dates for availability calendar
      let availabilityStartDate: string;
      let availabilityEndDate: string;

      // Get today's date for Today's Agenda and future bookings (use local date, not UTC)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;
      const todayDateRange = { start_date: today, end_date: today };

      // Get future date range (today + 90 days) for upcoming bookings
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 90);
      const futureYear = futureDate.getFullYear();
      const futureMonth = String(futureDate.getMonth() + 1).padStart(2, '0');
      const futureDay = String(futureDate.getDate()).padStart(2, '0');
      const future90Days = `${futureYear}-${futureMonth}-${futureDay}`;
      const futureBookingsRange = { start_date: today, end_date: future90Days };

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

      // Fetch data from all Reporting APIs in parallel (current + previous period)
      const [
        transactionsResponse,
        itemizedRevenue,
        allBookings,
        allPayments,
        todaysBookingsRaw,
        futureBookingsRaw,
        inventoryItems,
        availabilityInstances,
        // Previous period data for accurate comparisons
        previousTransactionsResponse,
        previousAllBookings,
        previousAllPayments
      ] = await Promise.all([
        // CURRENT PERIOD DATA
        this.reportingService.getTransactions({
          limit: 100,
          date_field: 'created_at',
          range: resovaDateRange.range,
          start_date: resovaDateRange.start_date,
          end_date: resovaDateRange.end_date
        }),
        this.reportingService.getItemizedRevenue({
          date_range: resovaDateRange
        }),
        // Get bookings for the selected date range
        // Note: This returns bookings where the booking date (date_short) falls within the range
        this.reportingService.getAllBookings({
          type: 'all',
          date_range: resovaDateRange
        }),
        this.reportingService.getAllPayments({
          type: 'all',
          date_range: resovaDateRange
        }),
        // Separate call for today's bookings to ensure Today's Agenda always has data
        this.reportingService.getAllBookings({
          type: 'all',
          date_range: todayDateRange
        }),
        // Get future bookings (today + 90 days) for AI Assistant forward-looking analysis
        this.reportingService.getAllBookings({
          type: 'all',
          date_range: futureBookingsRange
        }),
        // Get inventory items with sales data for profitability analysis
        this.reportingService.getInventoryItems({
          date_range: resovaDateRange,
          type: 'all_bookings',
          period: 'event_date',
          booking_status: 'completed'
        }),
        // Get availability calendar instances for capacity utilization analysis
        this.reportingService.getAvailabilityCalendar({
          start_date: availabilityStartDate,
          end_date: availabilityEndDate
        }),
        // PREVIOUS PERIOD DATA (for accurate trend comparisons)
        this.reportingService.getTransactions({
          limit: 100,
          date_field: 'created_at',
          range: previousPeriodRange.range,
          start_date: previousPeriodRange.start_date,
          end_date: previousPeriodRange.end_date
        }),
        this.reportingService.getAllBookings({
          type: 'all',
          date_range: previousPeriodRange
        }),
        this.reportingService.getAllPayments({
          type: 'all',
          date_range: previousPeriodRange
        })
      ]);

      const todaysBookings = todaysBookingsRaw;
      const futureBookings = futureBookingsRaw;

      logger.info(`Fetched CURRENT PERIOD: ${transactionsResponse.data.length} transactions, ${itemizedRevenue.length} revenue items, ${allBookings.length} bookings, ${todaysBookings.length} today's bookings, ${futureBookings.length} future bookings, ${allPayments.length} payments, ${inventoryItems.length} inventory items, ${availabilityInstances.length} availability instances`);
      logger.info(`Fetched PREVIOUS PERIOD: ${previousTransactionsResponse.data.length} transactions, ${previousAllBookings.length} bookings, ${previousAllPayments.length} payments`);

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
        previousAllPayments
      );

      // Optionally fetch business insights from Core APIs
      if (includeBusinessInsights) {
        try {
          logger.info('Fetching business insights from Core APIs');

          // Fetch items from Core API
          // Note: Gift vouchers API does not exist, voucher data will be calculated from transaction data
          const items = await this.reportingService.getItems();

          logger.info(`Fetched ${items.length} items`);

          analyticsData.businessInsights = ResovaDataTransformer.transformBusinessInsights(
            items,
            transactionsResponse.data,
            allBookings,
            [], // Empty vouchers array - will be calculated from transaction data instead
            inventoryItems, // Pass inventory items for activity profitability
            availabilityInstances // Pass availability instances for capacity utilization
          );

          logger.info('Successfully added business insights');

          // Fetch customer, voucher, and basket intelligence
          try {
            logger.info('Fetching customer intelligence from Core APIs');

            // Fetch customers, vouchers, and abandoned carts in parallel
            const [customers, vouchers, abandonedCarts] = await Promise.all([
              this.coreService.getAllCustomers(3), // Fetch up to 3 pages (300 customers)
              this.coreService.getAllGiftVouchers(2), // Fetch up to 2 pages (200 vouchers)
              this.coreService.getAbandonedCarts(2) // Fetch up to 2 pages (200 carts)
            ]);

            logger.info(`Fetched ${customers.length} customers, ${vouchers.length} vouchers, ${abandonedCarts.length} abandoned carts`);

            // Transform into intelligence
            if (!analyticsData.businessInsights) {
              analyticsData.businessInsights = {
                items: [],
                customers: { totalCustomers: 0, newCustomers: 0, repeatRate: 0, topCustomers: [] },
                vouchers: { totalActive: 0, totalRedeemed: 0, totalValue: 0, redemptionRate: 0, expiringWithin30Days: 0 },
                availability: { utilizationRate: 0, peakDays: [], lowBookingDays: [], averageCapacity: 0, averageBooked: 0 }
              };
            }

            // Note: customerIntelligence is already set by ResovaDataTransformer.transformBusinessInsights
            // We only add the voucher and conversion intelligence here from Core APIs

            analyticsData.businessInsights.voucherIntelligence =
              CustomerIntelligenceTransformer.transformVoucherIntelligence(vouchers, transactionsResponse.data);

            analyticsData.businessInsights.conversionIntelligence =
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
              customers,
              vouchers,
              abandonedCarts,
              items,
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
              items,
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
          futureBookings
        };
      }

      logger.info('Successfully transformed Resova data to analytics format');

      return analyticsData;
    } catch (error) {
      this.handleError(error);
      throw error; // TypeScript needs this
    }
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: any): never {
    logger.error('Resova Service Error', error);

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
