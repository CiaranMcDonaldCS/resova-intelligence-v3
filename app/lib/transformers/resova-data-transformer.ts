/**
 * Resova Data Transformer
 * Transforms Resova Reporting API responses into our internal analytics data format
 */

import {
  AnalyticsData,
  TodaysAgenda,
  AgendaChartItem,
  Booking,
  Notification,
  Transaction,
  BookingNote,
  ActivityItem,
  UserItem,
  PeriodSummary,
  RevenueTrend,
  Performance,
  PaymentCollection,
  SalesMetric,
  SalesSummary,
  TopPurchased,
  PurchasedItem,
  GuestMetric,
  GuestSummary,
  BusinessInsights,
  ItemDetails,
  CustomerInsight,
  VoucherInsight,
  AvailabilityInsight,
  ActivityProfitability,
  CapacityUtilization,
  CustomerIntelligence,
  CustomerProfile,
  CustomerSegment,
  DailyBreakdown,
  DayOfWeekSummary
} from '@/app/types/analytics';

import {
  ResovaTransaction,
  ResovaItemizedRevenue,
  ResovaAllBooking,
  ResovaAllPayment,
  ResovaItem,
  ResovaInventoryItem,
  ResovaAvailabilityInstance
} from '../services/resova-service';
import { ResovaGiftVoucher } from '@/app/types/resova-core';
import { logger } from '../utils/logger';

export class ResovaDataTransformer {
  /**
   * Transform all Resova API responses into AnalyticsData
   */
  static transform(
    transactions: ResovaTransaction[],
    itemizedRevenue: ResovaItemizedRevenue[],
    allBookings: ResovaAllBooking[],
    allPayments: ResovaAllPayment[],
    todaysBookings?: ResovaAllBooking[],
    // Previous period data for accurate comparisons
    previousTransactions?: ResovaTransaction[],
    previousAllBookings?: ResovaAllBooking[],
    previousAllPayments?: ResovaAllPayment[]
  ): AnalyticsData {
    logger.info('Transforming Resova data to analytics format');
    logger.info(`Input data counts: ${transactions.length} transactions, ${itemizedRevenue.length} revenue items, ${allBookings.length} bookings, ${allPayments.length} payments, ${todaysBookings?.length || 0} today's bookings`);
    logger.info(`Previous period data: ${previousTransactions?.length || 0} transactions, ${previousAllBookings?.length || 0} bookings, ${previousAllPayments?.length || 0} payments`);

    const revenueTrends = this.transformRevenueTrends(allBookings, previousAllBookings);
    logger.info(`Transformed revenue trends: ${revenueTrends.length} data points`);

    return {
      todaysAgenda: this.transformTodaysAgenda(transactions, todaysBookings || allBookings),
      agendaChart: this.transformAgendaChart(todaysBookings || allBookings),
      upcomingBookings: this.transformUpcomingBookings(todaysBookings || allBookings, transactions),
      notifications: this.transformNotifications(transactions),
      transactions: this.transformTransactions(transactions),
      bookingNotes: this.transformBookingNotes(transactions),
      activity: this.transformActivity(transactions),
      users: this.transformUsers(transactions),
      periodSummary: this.transformPeriodSummary(transactions, allPayments, allBookings, previousTransactions, previousAllBookings, previousAllPayments),
      revenueTrends,
      performance: this.transformPerformance(allBookings, previousAllBookings),
      paymentCollection: this.transformPaymentCollection(transactions, allPayments),
      salesMetrics: this.transformSalesMetrics(allBookings),
      salesSummary: this.transformSalesSummary(transactions, allBookings, itemizedRevenue),
      topPurchased: this.transformTopPurchased(allBookings),
      guestMetrics: this.transformGuestMetrics(allBookings),
      guestSummary: this.transformGuestSummary(allBookings, allPayments, transactions, previousAllBookings, previousAllPayments, previousTransactions),
      dailyBreakdown: this.transformDailyBreakdown(allBookings),
      dayOfWeekSummary: this.transformDayOfWeekSummary(allBookings)
    };
  }

  /**
   * Transform today's agenda data
   * Note: Expects allBookings to be pre-filtered to today's bookings (booking_date = today)
   */
  private static transformTodaysAgenda(
    transactions: ResovaTransaction[],
    todaysBookings: ResovaAllBooking[]
  ): TodaysAgenda {
    logger.info(`Transforming Today's Agenda with ${todaysBookings.length} bookings`);

    // Calculate total guests from today's bookings
    const totalGuests = todaysBookings.reduce((sum, b) => sum + b.total_quantity, 0);

    // Get first booking time
    const bookingTimes = todaysBookings
      .map(b => b.time)
      .sort();
    const firstBooking = bookingTimes[0] || 'No bookings';

    // Debug waiver values
    const waiverDebug = todaysBookings.map(b => ({
      item: b.item_name,
      guests: b.total_quantity,
      waiver_signed: b.waiver_signed
    }));
    logger.info(`Waiver status for today's bookings:`, waiverDebug);
    console.log('=== WAIVER DEBUG ===');
    console.log('Today\'s bookings waiver status:', waiverDebug);

    // Calculate waivers required based on guest count for bookings with unsigned waivers
    // waiver_signed could be 'Signed', 'Unsigned', or other values
    const waiversRequired = todaysBookings
      .filter(b => b.waiver_signed !== 'Signed')
      .reduce((sum, b) => sum + b.total_quantity, 0);

    return {
      bookings: todaysBookings.length,
      guests: totalGuests,
      firstBooking,
      waiversRequired
    };
  }

  /**
   * Transform agenda chart data (bookings by hour)
   * Note: Expects todaysBookings to be pre-filtered to today's bookings (booking_date = today)
   */
  private static transformAgendaChart(todaysBookings: ResovaAllBooking[]): AgendaChartItem[] {
    logger.info(`Transforming Agenda Chart with ${todaysBookings.length} bookings`);

    // Group by hour
    const hourlyData: Record<string, {
      bookings: number;
      guests: number;
      items: number;
    }> = {};

    todaysBookings.forEach(booking => {
      const hour = booking.time.split(':')[0] + ':00';

      if (!hourlyData[hour]) {
        hourlyData[hour] = { bookings: 0, guests: 0, items: 0 };
      }

      hourlyData[hour].bookings++;
      hourlyData[hour].guests += booking.total_quantity;
      hourlyData[hour].items++;
    });

    return Object.entries(hourlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([time, data]) => ({
        time,
        bookings: data.bookings,
        guests: data.guests,
        itemsBooked: data.items
      }));
  }

  /**
   * Transform upcoming bookings with enhanced transaction details
   * Note: Shows bookings scheduled for today and future dates
   */
  private static transformUpcomingBookings(allBookings: ResovaAllBooking[], transactions: ResovaTransaction[]): Booking[] {
    logger.info(`Transforming Upcoming Bookings from ${allBookings.length} total bookings`);

    // Create a map of transaction IDs to transaction data for quick lookup
    const transactionMap = new Map(transactions.map(t => [t.id, t]));

    // Note: allBookings is already pre-filtered by the API to include only future bookings (today + 90 days)
    // Sort and take top 10
    const upcomingBookings = allBookings
      .sort((a, b) => {
        // Sort by date first, then by time
        const dateCompare = a.date_short.localeCompare(b.date_short);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      })
      .slice(0, 10);

    logger.info(`Found ${upcomingBookings.length} upcoming bookings`);

    return upcomingBookings.map(b => {
        const transaction = transactionMap.get(b.transaction_id);

        // Get customer name from transaction data (which has the full customer object)
        let customerName = 'Guest';
        if (transaction?.customer) {
          const firstName = transaction.customer.first_name || '';
          const lastName = transaction.customer.last_name || '';
          customerName = firstName && lastName ? `${firstName} ${lastName}` :
                        firstName || lastName || 'Guest';
        }

        // Parse participant breakdown from booking data
        // For now, we'll use a placeholder - the actual breakdown would come from transaction.bookings array
        const adults = Math.floor(b.total_quantity * 0.6) || (b.total_quantity > 0 ? 1 : 0);
        const children = b.total_quantity - adults;

        return {
          time: b.time,
          name: customerName,
          item: b.item_name,
          guests: b.total_quantity,
          waiver: b.waiver_signed === 'Signed' ? `${b.total_quantity}/${b.total_quantity} signed` : `0/${b.total_quantity} signed`,
          notes: '-',
          staff: 'Staff Not Assigned',
          // Enhanced fields
          bookingDate: `${b.date_short} - ${b.time}`,
          purchasedDate: transaction?.created_dt || b.date_short,
          transactionNumber: b.transaction_id.toString(),
          adults,
          children,
          transactionTotal: b.booking_total || '0.00',
          paid: transaction?.paid || '0.00',
          due: b.transaction_due || '0.00',
          status: b.status
        };
      });
  }

  /**
   * Transform notifications
   */
  private static transformNotifications(transactions: ResovaTransaction[]): Notification[] {
    return transactions
      .filter(t => t.customer && (!t.status || parseFloat(t.due) > 0))
      .slice(0, 5)
      .map(t => ({
        user: t.customer?.name || 'Guest',
        message: parseFloat(t.due) > 0 ? `Payment due: $${t.due}` : `New booking for ${t.bookings[0]?.item.name || 'service'}`,
        time: new Date(t.created_dt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      }));
  }

  /**
   * Transform transactions
   */
  private static transformTransactions(transactions: ResovaTransaction[]): Transaction[] {
    return transactions
      .filter(t => t.customer)
      .slice(0, 10)
      .map(t => ({
        customer: t.customer?.name || 'Guest',
        date: new Date(t.created_dt).toLocaleDateString('en-US'),
        ref: t.reference,
        total: `$${parseFloat(t.total).toFixed(2)}`,
        paid: `$${parseFloat(t.paid).toFixed(2)}`,
        due: `$${parseFloat(t.due).toFixed(2)}`
      }));
  }

  /**
   * Transform booking notes
   */
  private static transformBookingNotes(transactions: ResovaTransaction[]): BookingNote[] {
    return transactions
      .filter(t => t.customer && t.bookings.length > 0)
      .slice(0, 5)
      .map(t => ({
        name: t.customer?.name || 'Guest',
        date: new Date(t.bookings[0].booking_date).toLocaleDateString('en-US'),
        note: `Booking for ${t.bookings[0].item.name}`
      }));
  }

  /**
   * Transform activity
   */
  private static transformActivity(transactions: ResovaTransaction[]): ActivityItem[] {
    return transactions
      .filter(t => t.customer)
      .slice(0, 10)
      .map(t => ({
        user: 'System',
        action: `created booking for ${t.customer?.name || 'Guest'}`,
        time: new Date(t.created_dt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      }));
  }

  /**
   * Transform users
   */
  private static transformUsers(transactions: ResovaTransaction[]): UserItem[] {
    const users = new Set<string>();

    transactions.forEach(t => {
      if (t.customer?.name) {
        users.add(t.customer.name);
      }
    });

    return Array.from(users).slice(0, 5).map(name => ({
      name,
      status: 'Active',
      lastLogin: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }));
  }

  /**
   * Transform period summary - Financial Health Metrics
   *
   * Per spec:
   * - Gross Revenue = Sum of all captured payment amounts (allPayments.amount)
   * - Total Sales = Sum of transaction totals (transactions.total)
   * - Net Revenue = Gross Revenue - Total Refunded
   * - Discounts, Taxes, Fees, Refunds from Transactions API
   *
   * Data Sources:
   * - Gross Revenue: All Payments API (amount field)
   * - Total Sales: Transactions API (total field)
   * - Discounts/Taxes/Fees/Refunds: Transactions API
   */
  private static transformPeriodSummary(
    transactions: ResovaTransaction[],
    allPayments: ResovaAllPayment[],
    allBookings: ResovaAllBooking[],
    previousTransactions?: ResovaTransaction[],
    previousAllBookings?: ResovaAllBooking[],
    previousAllPayments?: ResovaAllPayment[]
  ): PeriodSummary {
    // CURRENT PERIOD - Gross Revenue = Total amount PAID (actual revenue received)
    // From Transactions API: SUM(transactions.paid)
    const gross = transactions.reduce((sum, t) => sum + parseFloat(t.paid || '0'), 0);

    // CURRENT PERIOD - Total Sales = Sum of all transaction totals (booked amount, not count)
    // From Transactions API: SUM(transactions.total)
    // This is Resova's "sales (total)" = $311.22
    const totalSales = transactions.reduce((sum, t) => sum + parseFloat(t.total || '0'), 0);

    // CURRENT PERIOD - Discounts = Sum of monetary value of all applied discounts
    // From Transactions API: SUM(transactions.discount)
    const discounts = transactions.reduce((sum, t) => sum + parseFloat(t.discount || '0'), 0);

    // CURRENT PERIOD - Refunded = Sum of refunds issued (completed refunds only)
    // From Transactions API: SUM(transactions.refunded)
    const refunded = transactions.reduce((sum, t) => sum + parseFloat(t.refunded || '0'), 0);

    // CURRENT PERIOD - Taxes = Sum of all taxes
    // From Transactions API: SUM(transactions.tax)
    const taxes = transactions.reduce((sum, t) => sum + parseFloat(t.tax || '0'), 0);

    // CURRENT PERIOD - Fees = Sum of all service/processing fees
    // From Transactions API: SUM(transactions.fee)
    const fees = transactions.reduce((sum, t) => sum + parseFloat(t.fee || '0'), 0);

    // CURRENT PERIOD - Net Revenue = Gross - Refunds
    // Net = Total sales minus any refunds
    const net = gross - refunded;

    // PREVIOUS PERIOD - Calculate same metrics for comparison
    let previousGross = 0;
    let previousNet = 0;
    let previousTotalSales = 0;
    let previousDiscounts = 0;
    let previousRefunded = 0;
    let previousTaxes = 0;
    let previousFees = 0;

    if (previousTransactions && previousTransactions.length > 0) {
      previousGross = previousTransactions.reduce((sum, t) => sum + parseFloat(t.paid || '0'), 0);
      previousTotalSales = previousTransactions.reduce((sum, t) => sum + parseFloat(t.total || '0'), 0);
      previousDiscounts = previousTransactions.reduce((sum, t) => sum + parseFloat(t.discount || '0'), 0);
      previousRefunded = previousTransactions.reduce((sum, t) => sum + parseFloat(t.refunded || '0'), 0);
      previousTaxes = previousTransactions.reduce((sum, t) => sum + parseFloat(t.tax || '0'), 0);
      previousFees = previousTransactions.reduce((sum, t) => sum + parseFloat(t.fee || '0'), 0);
      previousNet = previousGross - previousRefunded;

      logger.info(`REAL COMPARISON - Current gross: $${gross.toFixed(2)}, Previous gross: $${previousGross.toFixed(2)}`);
    } else {
      // No fallback - show zero when no previous period data exists
      previousGross = 0;
      previousNet = 0;
      previousTotalSales = 0;
      previousDiscounts = 0;
      previousRefunded = 0;
      previousTaxes = 0;
      previousFees = 0;

      logger.warn('No previous period data available - showing zero for comparison');
    }

    return {
      gross,
      grossChange: this.calculatePercentChange(gross, previousGross),
      net,
      netChange: this.calculatePercentChange(net, previousNet),
      totalSales,
      totalSalesChange: this.calculatePercentChange(totalSales, previousTotalSales),
      discounts,
      discountsChange: this.calculatePercentChange(discounts, previousDiscounts),
      refunded,
      refundedChange: this.calculatePercentChange(refunded, previousRefunded),
      taxes,
      taxesChange: this.calculatePercentChange(taxes, previousTaxes),
      fees,
      feesChange: this.calculatePercentChange(fees, previousFees)
    };
  }

  /**
   * Transform revenue trends from bookings data
   */
  private static transformRevenueTrends(allBookings: ResovaAllBooking[], previousAllBookings?: ResovaAllBooking[]): RevenueTrend[] {
    // If no data at all, return empty array
    if (!allBookings || allBookings.length === 0) {
      logger.warn('No bookings data available for revenue trends');
      return [];
    }

    // Get unique dates from actual data and sort them
    const uniqueDates = [...new Set(allBookings.map(b => b.date_short))]
      .filter(date => date && !isNaN(new Date(date).getTime())) // Filter out invalid dates
      .sort()
      .slice(-7); // Get last 7 days of actual data

    // If we have no valid dates, return empty array
    if (uniqueDates.length === 0) {
      logger.warn('No valid dates found in bookings data');
      return [];
    }

    logger.info(`Transforming revenue trends for ${uniqueDates.length} days:`, uniqueDates);

    // Build previous period map for comparison
    const previousDayMap = new Map<number, { gross: number; net: number; sales: number }>();
    if (previousAllBookings && previousAllBookings.length > 0) {
      // Group previous bookings by day of week (0-6)
      previousAllBookings.forEach(b => {
        const date = new Date(b.date_short);
        if (!isNaN(date.getTime())) {
          const dayOfWeek = date.getDay();
          const existing = previousDayMap.get(dayOfWeek) || { gross: 0, net: 0, sales: 0 };
          existing.gross += parseFloat(b.booking_total || '0');
          existing.net += parseFloat(b.price || '0');
          existing.sales += 1;
          previousDayMap.set(dayOfWeek, existing);
        }
      });
      logger.info(`Previous period trends available for ${previousDayMap.size} days of week`);
    }

    return uniqueDates.map(day => {
      const dayBookings = allBookings.filter(b => b.date_short === day);
      const grossRevenue = dayBookings.reduce((sum, b) => sum + parseFloat(b.booking_total || '0'), 0);
      // Net revenue = base price (without fees/taxes). Use 'price' field for net
      const netRevenue = dayBookings.reduce((sum, b) => sum + parseFloat(b.price || '0'), 0);
      const sales = dayBookings.length;

      // Get previous period data for same day of week
      const date = new Date(day);
      const dayOfWeek = date.getDay();
      const previousData = previousDayMap.get(dayOfWeek);

      let prevGross: number;
      let prevNet: number;
      let prevSales: number;

      if (previousData) {
        // Use real previous period data
        prevGross = Math.round(previousData.gross * 100) / 100;
        prevNet = Math.round(previousData.net * 100) / 100;
        prevSales = previousData.sales;
      } else {
        // No fallback - show zero when no previous period data exists
        prevGross = 0;
        prevNet = 0;
        prevSales = 0;
      }

      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        thisGross: Math.round(grossRevenue * 100) / 100,
        thisNet: Math.round(netRevenue * 100) / 100,
        thisSales: sales,
        prevGross,
        prevNet,
        prevSales
      };
    });
  }

  /**
   * Transform performance metrics from bookings data
   */
  private static transformPerformance(
    allBookings: ResovaAllBooking[],
    previousAllBookings?: ResovaAllBooking[]
  ): Performance {
    // Calculate best day from bookings
    const dayRevenue: Record<string, number> = {};

    logger.info(`Processing ${allBookings.length} bookings for performance metrics`);

    allBookings.forEach((b, index) => {
      logger.info(`Booking ${index + 1}: date_short="${b.date_short}", booking_total="${b.booking_total}", item_name="${b.item_name}"`);

      const date = new Date(b.date_short);
      // Skip invalid dates
      if (isNaN(date.getTime())) {
        logger.warn(`Invalid date for booking ${index + 1}: ${b.date_short}`);
        return;
      }
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const revenue = parseFloat(b.booking_total || '0');

      logger.info(`  -> Day: ${dayName}, Revenue: $${revenue}`);

      dayRevenue[dayName] = (dayRevenue[dayName] || 0) + revenue;
    });

    logger.info('Day revenue breakdown:', dayRevenue);

    const sortedDays = Object.entries(dayRevenue).sort(([, a], [, b]) => b - a);
    logger.info('Sorted days:', sortedDays);

    const [bestDay, bestDayRevenue] = sortedDays[0] || ['Monday', 0];

    logger.info(`Best day calculated: ${bestDay} with $${bestDayRevenue}`);

    // Calculate top item
    const itemCounts: Record<string, number> = {};
    allBookings.forEach(b => {
      itemCounts[b.item_name] = (itemCounts[b.item_name] || 0) + 1;
    });
    const [topItem, topItemBookings] = Object.entries(itemCounts)
      .sort(([, a], [, b]) => b - a)[0] || ['General', 0];

    // Calculate peak time
    const hourCounts: Record<string, number> = {};
    allBookings.forEach(b => {
      const hour = b.time.split(':')[0] + ':00';
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const [peakTime, peakTimeBookings] = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)[0] || ['10:00', 0];

    // PHASE 1 CRITICAL METRIC: Booking Status Breakdown
    // Matches PHP: count(CASE WHEN status = 'completed' THEN 1 ELSE NULL END)
    const bookingCompleted = allBookings.filter(b =>
      b.status.toLowerCase() === 'completed'
    ).length;

    const bookingUpcoming = allBookings.filter(b =>
      b.status.toLowerCase() === 'upcoming' || b.status.toLowerCase() === 'pending'
    ).length;

    const bookingNoShow = allBookings.filter(b =>
      b.status.toLowerCase() === 'noshow' || b.status.toLowerCase() === 'no-show' || b.status.toLowerCase() === 'no show'
    ).length;

    const bookingCancelled = allBookings.filter(b =>
      b.status.toLowerCase() === 'cancelled' || b.status.toLowerCase() === 'canceled'
    ).length;

    logger.info(`Booking Status Breakdown - Completed: ${bookingCompleted}, Upcoming: ${bookingUpcoming}, No-Show: ${bookingNoShow}, Cancelled: ${bookingCancelled}`);

    // Calculate previous period data if available
    let previousBestDayRevenue = 0;
    let previousTopItemBookings = 0;
    let previousPeakTimeBookings = 0;

    if (previousAllBookings && previousAllBookings.length > 0) {
      // Calculate previous best day revenue
      const previousDayRevenue: Record<string, number> = {};
      previousAllBookings.forEach(b => {
        const date = new Date(b.date_short);
        if (!isNaN(date.getTime())) {
          const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
          const revenue = parseFloat(b.booking_total || '0');
          previousDayRevenue[dayName] = (previousDayRevenue[dayName] || 0) + revenue;
        }
      });
      const [, prevBestDayRev] = Object.entries(previousDayRevenue).sort(([, a], [, b]) => b - a)[0] || ['', 0];
      previousBestDayRevenue = prevBestDayRev;

      // Calculate previous top item bookings
      const previousItemCounts: Record<string, number> = {};
      previousAllBookings.forEach(b => {
        previousItemCounts[b.item_name] = (previousItemCounts[b.item_name] || 0) + 1;
      });
      const [, prevTopItemCount] = Object.entries(previousItemCounts).sort(([, a], [, b]) => b - a)[0] || ['', 0];
      previousTopItemBookings = prevTopItemCount;

      // Calculate previous peak time bookings
      const previousHourCounts: Record<string, number> = {};
      previousAllBookings.forEach(b => {
        const hour = b.time.split(':')[0] + ':00';
        previousHourCounts[hour] = (previousHourCounts[hour] || 0) + 1;
      });
      const [, prevPeakTimeCount] = Object.entries(previousHourCounts).sort(([, a], [, b]) => b - a)[0] || ['', 0];
      previousPeakTimeBookings = prevPeakTimeCount;
    }

    return {
      bestDay,
      bestDayRevenue,
      bestDayChange: this.calculatePercentChange(bestDayRevenue, previousBestDayRevenue),
      topItem,
      topItemBookings,
      topItemChange: this.calculatePercentChange(topItemBookings, previousTopItemBookings),
      peakTime,
      peakTimeBookings,
      peakTimeChange: this.calculatePercentChange(peakTimeBookings, previousPeakTimeBookings),
      bookingCompleted,
      bookingUpcoming,
      bookingNoShow,
      bookingCancelled
    };
  }

  /**
   * Transform payment collection
   */
  private static transformPaymentCollection(
    transactions: ResovaTransaction[],
    allPayments: ResovaAllPayment[]
  ): PaymentCollection {
    // Get unique transactions to calculate total amount (to avoid double counting when multiple payments on same transaction)
    const uniqueTransactions = new Map<number, number>();
    allPayments.forEach(p => {
      const txId = p.transaction_id;
      const txTotal = parseFloat(p.transaction_total || '0');
      if (!uniqueTransactions.has(txId) || uniqueTransactions.get(txId)! < txTotal) {
        uniqueTransactions.set(txId, txTotal);
      }
    });

    const totalTransactionAmount = Array.from(uniqueTransactions.values()).reduce((sum, val) => sum + val, 0);

    // Paid amount = sum of all payment amounts
    const paidAmount = parseFloat(allPayments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0).toFixed(2));

    // Unpaid amount = total due from unique transactions
    const unpaidTransactionsMap = new Map<number, number>();
    allPayments.forEach(p => {
      const txId = p.transaction_id;
      const txDue = parseFloat(p.transaction_due || '0');
      if (!unpaidTransactionsMap.has(txId) || unpaidTransactionsMap.get(txId)! < txDue) {
        unpaidTransactionsMap.set(txId, txDue);
      }
    });
    const unpaidAmount = parseFloat(Array.from(unpaidTransactionsMap.values()).reduce((sum, val) => sum + val, 0).toFixed(2));

    // Calculate card vs cash from payment labels
    const cardPayments = allPayments.filter(p => p.label.toLowerCase().includes('card'));
    const cashPayments = allPayments.filter(p => p.label.toLowerCase().includes('cash') || p.label.toLowerCase().includes('manual'));

    const cardAmount = cardPayments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
    const cashAmount = cashPayments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

    // PHASE 1 CRITICAL METRIC: Payment Status Breakdown
    // Matches PHP: count(due = 0) AS paid_transactions
    // Build unique transaction map with payment status
    const transactionStatusMap = new Map<number, { paid: number; due: number }>();
    allPayments.forEach(p => {
      const txId = p.transaction_id;
      const txPaid = parseFloat(p.transaction_paid || '0');
      const txDue = parseFloat(p.transaction_due || '0');

      if (!transactionStatusMap.has(txId)) {
        transactionStatusMap.set(txId, { paid: txPaid, due: txDue });
      }
    });

    let paidTransactionsCount = 0;
    let partiallyPaidTransactionsCount = 0;
    let unpaidTransactionsCount = 0;

    transactionStatusMap.forEach(({ paid, due }) => {
      if (due === 0) {
        // Fully paid: due = 0
        paidTransactionsCount++;
      } else if (paid > 0 && due > 0) {
        // Partially paid: due > 0 AND paid > 0
        partiallyPaidTransactionsCount++;
      } else if (paid === 0 && due > 0) {
        // Unpaid: due > 0 AND paid = 0
        unpaidTransactionsCount++;
      }
    });

    logger.info(`Payment Status Breakdown - Paid: ${paidTransactionsCount}, Partial: ${partiallyPaidTransactionsCount}, Unpaid: ${unpaidTransactionsCount}`);

    return {
      totalPayments: paidAmount,
      totalChange: 0, // No previous period data available
      paidAmount,
      paidPercent: totalTransactionAmount > 0 ? (paidAmount / totalTransactionAmount) * 100 : 100,
      unpaidAmount,
      unpaidPercent: totalTransactionAmount > 0 ? (unpaidAmount / totalTransactionAmount) * 100 : 0,
      cardAmount,
      cardPercent: paidAmount > 0 ? (cardAmount / paidAmount) * 100 : 0,
      cashAmount,
      cashPercent: paidAmount > 0 ? (cashAmount / paidAmount) * 100 : 0,
      paidTransactions: paidTransactionsCount,
      partiallyPaidTransactions: partiallyPaidTransactionsCount,
      unpaidTransactions: unpaidTransactionsCount
    };
  }

  /**
   * Transform sales metrics
   */
  private static transformSalesMetrics(allBookings: ResovaAllBooking[]): SalesMetric[] {
    // Get unique dates from actual data and sort them
    const uniqueDates = [...new Set(allBookings.map(b => b.date_short))]
      .filter(date => date && !isNaN(new Date(date).getTime())) // Filter out invalid dates
      .sort()
      .slice(-7); // Get last 7 days of actual data

    // If we have no valid data, return empty array
    if (uniqueDates.length === 0) {
      logger.warn('No valid dates found in allBookings data for sales metrics');
      return [];
    }

    return uniqueDates.map(day => {
      const dayBookings = allBookings.filter(b => b.date_short === day);
      const revenue = dayBookings.reduce((sum, b) => sum + parseFloat(b.booking_total), 0);

      return {
        day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
        bookings: dayBookings.length,
        avgRev: dayBookings.length > 0 ? revenue / dayBookings.length : 0
      };
    });
  }

  /**
   * Transform sales summary
   */
  private static transformSalesSummary(
    transactions: ResovaTransaction[],
    allBookings: ResovaAllBooking[],
    itemizedRevenue: ResovaItemizedRevenue[]
  ): SalesSummary {
    // Use transactions for bookings CREATED/MADE during the period
    // Transactions are filtered by created_at date, so this counts bookings purchased in the period
    const totalBookings = transactions.reduce((sum, t) => sum + t.bookings.length, 0);
    const totalRevenue = transactions.reduce((sum, t) => sum + parseFloat(t.total || '0'), 0);

    // For guests count, we need to sum up participants from transaction bookings
    const totalGuests = transactions.reduce((sum, t) => {
      return sum + t.bookings.reduce((bookingSum, b) => bookingSum + b.participants.length, 0);
    }, 0);

    // Debug logging
    console.log('=== SALES SUMMARY DEBUG ===');
    console.log(`Total transactions: ${transactions.length}`);
    console.log(`Total bookings CREATED in period: ${totalBookings}`);
    console.log(`Total revenue: $${totalRevenue.toFixed(2)}`);
    console.log(`Total guests: ${totalGuests}`);
    console.log(`Avg Rev Per Booking: $${totalBookings > 0 ? (totalRevenue / totalBookings).toFixed(2) : 0}`);
    console.log(`Avg Rev Per Guest: $${totalGuests > 0 ? (totalRevenue / totalGuests).toFixed(2) : 0}`);
    console.log('Sample transaction:', transactions[0]);

    // PHASE 2 METRIC - Drive Revenue: Transaction Channel Breakdown
    // Matches PHP: total_visit_site, total_visit_manual, channel_facebook, channel_admin
    const onlineBookings = allBookings.filter(b =>
      b.source.toLowerCase().includes('online') ||
      b.source.toLowerCase().includes('site') ||
      b.source.toLowerCase().includes('web')
    ).length;

    const manualBookings = allBookings.filter(b =>
      b.source.toLowerCase().includes('manual') ||
      b.source.toLowerCase().includes('operator') ||
      b.source.toLowerCase().includes('staff')
    ).length;

    const adminBookings = allBookings.filter(b =>
      b.source.toLowerCase().includes('admin')
    ).length;

    const facebookBookings = allBookings.filter(b =>
      b.source.toLowerCase().includes('facebook') ||
      b.source.toLowerCase().includes('fb')
    ).length;

    // Calculate revenue by channel
    const onlineRevenue = allBookings
      .filter(b => b.source.toLowerCase().includes('online') || b.source.toLowerCase().includes('site') || b.source.toLowerCase().includes('web'))
      .reduce((sum, b) => sum + parseFloat(b.booking_total || '0'), 0);

    const manualRevenue = allBookings
      .filter(b => b.source.toLowerCase().includes('manual') || b.source.toLowerCase().includes('operator') || b.source.toLowerCase().includes('staff'))
      .reduce((sum, b) => sum + parseFloat(b.booking_total || '0'), 0);

    logger.info(`Channel Breakdown - Online: ${onlineBookings} ($${onlineRevenue.toFixed(2)}), Manual: ${manualBookings} ($${manualRevenue.toFixed(2)}), Admin: ${adminBookings}, Facebook: ${facebookBookings}`);

    // Item sales = base price from transactions (without extras/fees/taxes)
    const itemSales = transactions.reduce((sum, t) => sum + parseFloat(t.price || '0'), 0);

    return {
      bookings: totalBookings,
      bookingsChange: 0, // No previous period data available
      avgRevPerBooking: totalBookings > 0 ? totalRevenue / totalBookings : 0,
      avgRevChange: 0,
      onlineVsOperator: totalBookings > 0 ? (onlineBookings / totalBookings) * 100 : 0,
      onlineChange: 0, // No previous period data available
      itemSales: itemSales,
      itemSalesChange: 0, // No previous period data available
      extraSales: 0, // Would come from a separate Extras API
      extraSalesChange: 0,
      giftVoucherSales: 0, // Would come from Gift Vouchers API
      giftVoucherChange: 0,
      onlineBookings,
      manualBookings,
      adminBookings,
      facebookBookings,
      onlineRevenue,
      manualRevenue
    };
  }

  /**
   * Transform top purchased items from bookings
   */
  private static transformTopPurchased(allBookings: ResovaAllBooking[]): TopPurchased {
    const items: Record<string, number> = {};

    allBookings.forEach(b => {
      items[b.item_name] = (items[b.item_name] || 0) + parseFloat(b.booking_total || '0');
    });

    const topItems = Object.entries(items)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));

    return {
      items: topItems,
      extras: [], // Not available in current API responses
      vouchers: [] // Not available in current API responses
    };
  }

  /**
   * Transform guest metrics
   */
  private static transformGuestMetrics(allBookings: ResovaAllBooking[]): GuestMetric[] {
    // Get unique dates from actual data and sort them
    const uniqueDates = [...new Set(allBookings.map(b => b.date_short))]
      .filter(date => date && !isNaN(new Date(date).getTime())) // Filter out invalid dates
      .sort()
      .slice(-7); // Get last 7 days of actual data

    // If we have no valid data, return empty array
    if (uniqueDates.length === 0) {
      logger.warn('No valid dates found in allBookings data for guest metrics');
      return [];
    }

    return uniqueDates.map(day => {
      const dayBookings = allBookings.filter(b => b.date_short === day);
      const totalGuests = dayBookings.reduce((sum, b) => sum + b.total_quantity, 0);
      const revenue = dayBookings.reduce((sum, b) => sum + parseFloat(b.booking_total), 0);

      return {
        day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
        totalGuests,
        avgRevPerGuest: totalGuests > 0 ? revenue / totalGuests : 0
      };
    });
  }

  /**
   * Transform guest summary - Customers & Demand Metrics
   *
   * Per spec:
   * - Total Guests = COUNT(participants) from bookings (total_quantity)
   * - ARPG (Average Revenue per Guest) = Net Revenue / Total Guests
   * - Average Group Size = Total Guests / Total Bookings
   * - No-Show Count & % = Participants not checked in
   *
   * Data Sources:
   * - Total Guests: All Bookings API (total_quantity field)
   * - Net Revenue: Calculated from All Payments API
   * - No-Shows: All Bookings API (status field)
   */
  private static transformGuestSummary(
    allBookings: ResovaAllBooking[],
    allPayments: ResovaAllPayment[],
    transactions: ResovaTransaction[],
    previousAllBookings?: ResovaAllBooking[],
    previousAllPayments?: ResovaAllPayment[],
    previousTransactions?: ResovaTransaction[]
  ): GuestSummary {
    // Total Guests = Sum of participants across all bookings
    const totalGuests = allBookings.reduce((sum, b) => sum + b.total_quantity, 0);

    // Net Revenue = Gross Revenue - Refunded (per Financial Health spec)
    const grossRevenue = allPayments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
    const refunded = transactions.reduce((sum, t) => sum + parseFloat(t.refunded || '0'), 0);
    const netRevenue = grossRevenue - refunded;

    // Average Revenue per Guest (ARPG) = Net Revenue / Total Guests
    const avgRevenuePerGuest = totalGuests > 0 ? netRevenue / totalGuests : 0;

    // Average Group Size = Total Guests / Total Bookings
    const avgGroupSize = allBookings.length > 0 ? totalGuests / allBookings.length : 0;

    // PHASE 1 CRITICAL METRIC: Average Guests Per Booking
    // Matches PHP: avg_guest_booking = total_guests / booking_all
    const avgGuestsPerBooking = allBookings.length > 0 ? totalGuests / allBookings.length : 0;

    // No-Shows = Bookings with status indicating no-show
    // Note: This counts bookings, not individual participants
    // Ideally would use participants.status='no_show' from a Participants API
    const noShows = allBookings.filter(b =>
      b.status.toLowerCase().includes('no-show') ||
      b.status.toLowerCase().includes('no show')
    ).length;

    // Calculate previous period data if available
    let previousTotalGuests = 0;
    let previousAvgRevenuePerGuest = 0;
    let previousAvgGuestsPerBooking = 0;

    if (previousAllBookings && previousAllBookings.length > 0 && previousAllPayments && previousTransactions) {
      previousTotalGuests = previousAllBookings.reduce((sum, b) => sum + b.total_quantity, 0);
      const previousGrossRevenue = previousAllPayments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
      const previousRefunded = previousTransactions.reduce((sum, t) => sum + parseFloat(t.refunded || '0'), 0);
      const previousNetRevenue = previousGrossRevenue - previousRefunded;
      previousAvgRevenuePerGuest = previousTotalGuests > 0 ? previousNetRevenue / previousTotalGuests : 0;
      previousAvgGuestsPerBooking = previousAllBookings.length > 0 ? previousTotalGuests / previousAllBookings.length : 0;
    }

    logger.info(`Average Guests Per Booking: ${avgGuestsPerBooking.toFixed(2)} (Total Guests: ${totalGuests}, Total Bookings: ${allBookings.length})`);

    return {
      totalGuests,
      totalChange: this.calculatePercentChange(totalGuests, previousTotalGuests),
      avgRevenuePerGuest,
      avgRevChange: this.calculatePercentChange(avgRevenuePerGuest, previousAvgRevenuePerGuest),
      avgGroupSize,
      groupChange: 0, // No previous period data available
      repeatCustomers: 0, // Requires customer history tracking (first_participation_date)
      repeatChange: 0,
      noShows,
      noShowChange: 0, // No previous period data available
      avgGuestsPerBooking,
      avgGuestsPerBookingChange: this.calculatePercentChange(avgGuestsPerBooking, previousAvgGuestsPerBooking)
    };
  }

  /**
   * Calculate percentage change between current and previous values
   */
  private static calculatePercentChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return parseFloat((((current - previous) / previous) * 100).toFixed(1));
  }

  // ==================== BUSINESS INSIGHTS TRANSFORMATION ====================

  /**
   * Transform business insights from Core API data
   */
  static transformBusinessInsights(
    items: ResovaItem[] | ResovaInventoryItem[],
    transactions: ResovaTransaction[],
    allBookings: ResovaAllBooking[],
    vouchers: ResovaGiftVoucher[],
    inventoryItems?: ResovaInventoryItem[],
    availabilityInstances?: ResovaAvailabilityInstance[]
  ): BusinessInsights {
    logger.info('Transforming business insights');

    // If items is ResovaInventoryItem[], convert to ItemDetails without using transformItemDetails
    // Otherwise use transformItemDetails for ResovaItem[]
    const itemDetails = this.isResovaInventoryItemArray(items)
      ? this.transformInventoryItemsToDetails(items)
      : this.transformItemDetails(items);

    return {
      items: itemDetails,
      customers: this.transformCustomerInsights(transactions),
      vouchers: this.transformVoucherInsights(vouchers),
      availability: this.transformAvailabilityInsights(allBookings, inventoryItems || []),
      activityProfitability: inventoryItems ? this.transformActivityProfitability(inventoryItems) : undefined,
      capacityUtilization: availabilityInstances ? this.transformCapacityUtilization(availabilityInstances) : undefined,
      customerIntelligence: this.transformCustomerIntelligence(transactions)
    };
  }

  /**
   * Type guard to check if items is ResovaInventoryItem[]
   */
  private static isResovaInventoryItemArray(items: ResovaItem[] | ResovaInventoryItem[]): items is ResovaInventoryItem[] {
    return items.length > 0 && 'total_bookings' in items[0];
  }

  /**
   * Convert inventory items to item details format
   */
  private static transformInventoryItemsToDetails(items: ResovaInventoryItem[]): ItemDetails[] {
    return items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.short_description || item.long_description || '',
      duration: item.duration,
      capacity: parseInt(item.capacity || '0'),
      pricingType: item.privacy_type || 'standard',
      status: item.status_label || 'active',
      categories: [] // Inventory items don't have categories
    }));
  }

  /**
   * Transform items to simplified details
   */
  private static transformItemDetails(items: ResovaItem[]): ItemDetails[] {
    return items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.short_description || item.description,
      duration: item.duration,
      capacity: item.max_capacity,
      pricingType: item.pricing_type,
      status: item.status,
      categories: (item.categories || []).map(c => c.name)
    }));
  }

  /**
   * Transform customer insights from transaction data
   */
  private static transformCustomerInsights(transactions: ResovaTransaction[]): CustomerInsight {
    // Get unique customers
    const customerMap = new Map<string, {
      email: string;
      name: string;
      bookings: number;
      spent: number;
      firstSeen: Date;
    }>();

    transactions
      .filter(t => t.customer)
      .forEach(t => {
        const email = t.customer.email;
        const existing = customerMap.get(email);
        const spent = parseFloat(t.total);

        if (existing) {
          existing.bookings += t.bookings.length;
          existing.spent += spent;
        } else {
          customerMap.set(email, {
            email,
            name: t.customer?.first_name + ' ' + t.customer?.last_name || 'Guest',
            bookings: t.bookings.length,
            spent,
            firstSeen: new Date(t.created_dt)
          });
        }
      });

    const customers = Array.from(customerMap.values());
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const newCustomers = customers.filter(c => c.firstSeen >= thirtyDaysAgo).length;
    const repeatCustomers = customers.filter(c => c.bookings > 1).length;

    // Get top 5 customers by total spent
    const topCustomers = customers
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5)
      .map(c => ({
        name: c.name,
        email: c.email,
        totalBookings: c.bookings,
        totalSpent: c.spent
      }));

    // PHASE 2 METRIC - Drive Revenue: Top Customers by Revenue with Rankings
    // Matches PHP: top_customers (top 5 by spend) with additional metrics
    const topCustomersByRevenue = customers
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5)
      .map((c, index) => ({
        rank: index + 1,
        name: c.name,
        email: c.email,
        totalBookings: c.bookings,
        totalSpent: c.spent,
        avgBookingValue: c.bookings > 0 ? c.spent / c.bookings : 0
      }));

    logger.info(`Top 5 Customers by Revenue:`);
    topCustomersByRevenue.forEach(c => {
      logger.info(`  ${c.rank}. ${c.name} - $${c.totalSpent.toFixed(2)} (${c.totalBookings} bookings, $${c.avgBookingValue.toFixed(2)} avg)`);
    });

    return {
      totalCustomers: customers.length,
      newCustomers,
      repeatRate: customers.length > 0 ? (repeatCustomers / customers.length) * 100 : 0,
      topCustomers,
      topCustomersByRevenue
    };
  }

  /**
   * Transform customer intelligence with CLV and segmentation
   */
  private static transformCustomerIntelligence(transactions: ResovaTransaction[]): CustomerIntelligence {
    logger.info('Transforming customer intelligence with CLV and segmentation');

    // Build customer profiles from transactions
    const customerMap = new Map<string, CustomerProfile>();
    const now = new Date();

    transactions
      .filter(t => t.customer)
      .forEach(t => {
        const email = t.customer.email;
        const existing = customerMap.get(email);
        const transactionAmount = parseFloat(t.total || '0');
        const transactionDate = new Date(t.created_dt);

        if (existing) {
          // Update existing customer
          existing.totalBookings += t.bookings.length;
          existing.totalSpent += transactionAmount;
          existing.clv = existing.totalSpent; // CLV = lifetime value

          // Update last booking date if more recent
          const existingLastDate = new Date(existing.lastBookingDate);
          if (transactionDate > existingLastDate) {
            existing.lastBookingDate = t.created_dt;
            existing.daysSinceLastBooking = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
          }

          // Update first booking date if earlier
          const existingFirstDate = new Date(existing.firstBookingDate);
          if (transactionDate < existingFirstDate) {
            existing.firstBookingDate = t.created_dt;
          }

          // Recalculate average booking value
          existing.avgBookingValue = existing.totalSpent / existing.totalBookings;
        } else {
          // Create new customer profile
          const daysSinceLastBooking = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));

          customerMap.set(email, {
            name: t.customer?.name || 'Guest',
            email,
            totalBookings: t.bookings.length,
            totalSpent: transactionAmount,
            clv: transactionAmount,
            segment: 'new', // Will be updated below
            lastBookingDate: t.created_dt,
            daysSinceLastBooking,
            firstBookingDate: t.created_dt,
            avgBookingValue: transactionAmount / t.bookings.length
          });
        }
      });

    const allCustomers = Array.from(customerMap.values());
    logger.info(`Total unique customers: ${allCustomers.length}`);

    // Segment customers based on CLV and activity (FEC-appropriate thresholds)
    allCustomers.forEach(customer => {
      if (customer.clv >= 500) {
        customer.segment = 'vip';
      } else if (customer.clv >= 150 && customer.totalBookings >= 2) {
        customer.segment = 'regular';
      } else if (customer.daysSinceLastBooking > 90 && customer.totalBookings >= 2) {
        customer.segment = 'at-risk';
      } else {
        customer.segment = 'new';
      }
    });

    // Calculate segment statistics
    const vipCustomers = allCustomers.filter(c => c.segment === 'vip');
    const regularCustomers = allCustomers.filter(c => c.segment === 'regular');
    const atRiskCustomers = allCustomers.filter(c => c.segment === 'at-risk');
    const newCustomers = allCustomers.filter(c => c.segment === 'new');

    const calculateSegmentStats = (customers: CustomerProfile[]): CustomerSegment => {
      const count = customers.length;
      const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
      const avgClv = count > 0 ? totalRevenue / count : 0;
      const avgBookings = count > 0 ? customers.reduce((sum, c) => sum + c.totalBookings, 0) / count : 0;
      const percentage = allCustomers.length > 0 ? (count / allCustomers.length) * 100 : 0;

      return { count, percentage, avgClv, avgBookings, totalRevenue };
    };

    // Calculate repeat rate (customers with more than 1 booking)
    const repeatCustomers = allCustomers.filter(c => c.totalBookings > 1).length;
    const repeatRate = allCustomers.length > 0 ? (repeatCustomers / allCustomers.length) * 100 : 0;

    // Calculate average CLV across all customers
    const totalClv = allCustomers.reduce((sum, c) => sum + c.clv, 0);
    const avgCustomerLifetimeValue = allCustomers.length > 0 ? totalClv / allCustomers.length : 0;

    // Get top customers by CLV (top 10)
    const topCustomersByClv = [...allCustomers]
      .sort((a, b) => b.clv - a.clv)
      .slice(0, 10);

    // Get churn risk customers (at-risk segment, sorted by days since last booking)
    const churnRiskCustomers = [...atRiskCustomers]
      .sort((a, b) => b.daysSinceLastBooking - a.daysSinceLastBooking)
      .slice(0, 10);

    // Count new customers (first booking within last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const newCustomerCount = allCustomers.filter(c => new Date(c.firstBookingDate) >= thirtyDaysAgo).length;

    return {
      totalCustomers: allCustomers.length,
      newCustomers: newCustomerCount,
      repeatRate,
      avgCustomerLifetimeValue,
      segments: {
        vip: calculateSegmentStats(vipCustomers),
        regular: calculateSegmentStats(regularCustomers),
        atRisk: calculateSegmentStats(atRiskCustomers),
        new: calculateSegmentStats(newCustomers)
      },
      topCustomersByClv,
      churnRiskCustomers
    };
  }

  /**
   * Transform voucher insights
   */
  private static transformVoucherInsights(vouchers: ResovaGiftVoucher[]): VoucherInsight {
    const active = vouchers.filter(v => v.status === 'active');
    const redeemed = vouchers.filter(v => v.redeemed_at !== null);
    const totalValue = vouchers.reduce((sum, v) => sum + parseFloat(String(v.amount || '0')), 0);

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringWithin30Days = active.filter(v => {
      const expiryDate = new Date(v.expires_at);
      return expiryDate <= thirtyDaysFromNow;
    }).length;

    // PHASE 3 METRIC - Drive Revenue: Gift Voucher Detailed Tracking
    // Matches PHP metrics: gift_sales, redeemed_total, redeemed_value, redemptions_total, redemptions_value
    // Note: This uses basic voucher data. For detailed tracking, use reportingVouchers API data in transformVoucherInsightsDetailed()

    // Calculate gift sales revenue (total amount paid for vouchers)
    const giftSales = vouchers.reduce((sum, v) => sum + parseFloat(String(v.amount || '0')), 0);

    // Count fully redeemed vouchers (where redeemed_at is not null)
    const redeemedCount = redeemed.length;

    // Calculate total value of redeemed vouchers
    // Note: This is approximate - for precise tracking, use ResovaGiftVoucherReporting.total_redeemed
    const redeemedValue = redeemed.reduce((sum, v) => sum + parseFloat(String(v.amount || '0')), 0);

    // Count available vouchers (active and not fully redeemed)
    const availableCount = active.length;

    // Calculate total value still available to redeem
    // Note: This is approximate - for precise tracking, use ResovaGiftVoucherReporting.total_remaining
    const availableValue = active.reduce((sum, v) => sum + parseFloat(String(v.amount || '0')), 0);

    // Calculate breakage rate (percentage of vouchers that expired unredeemed)
    const expired = vouchers.filter(v => {
      const expiryDate = new Date(v.expires_at);
      return expiryDate < now && v.redeemed_at === null;
    });
    const breakageRate = vouchers.length > 0 ? (expired.length / vouchers.length) * 100 : 0;

    // Calculate average voucher value
    const averageVoucherValue = vouchers.length > 0 ? giftSales / vouchers.length : 0;

    // Calculate average redemption value
    const averageRedemptionValue = redeemedCount > 0 ? redeemedValue / redeemedCount : 0;

    logger.info(`Gift Voucher Metrics - Sales: ${giftSales.toFixed(2)}, Redeemed: ${redeemedCount} (${redeemedValue.toFixed(2)}), Available: ${availableCount} (${availableValue.toFixed(2)}), Breakage: ${breakageRate.toFixed(1)}%`);

    return {
      totalActive: active.length,
      totalRedeemed: redeemed.length,
      totalValue,
      redemptionRate: vouchers.length > 0 ? (redeemed.length / vouchers.length) * 100 : 0,
      expiringWithin30Days,
      // Phase 3 detailed metrics
      giftSales,
      redeemedCount,
      redeemedValue,
      availableCount,
      availableValue,
      breakageRate,
      averageVoucherValue,
      averageRedemptionValue
    };
  }

  /**
   * Transform availability insights
   */
  private static transformAvailabilityInsights(
    allBookings: ResovaAllBooking[],
    items: (ResovaItem | ResovaInventoryItem)[]
  ): AvailabilityInsight {
    // Calculate overall capacity utilization
    const totalCapacity = items.reduce((sum, item) => {
      // Handle both ResovaItem (has max_capacity) and ResovaInventoryItem (has capacity as string)
      const capacity = 'max_capacity' in item ? item.max_capacity : parseInt(item.capacity || '0');
      return sum + capacity;
    }, 0);
    const totalBooked = allBookings.reduce((sum, b) => sum + b.total_quantity, 0);
    const utilizationRate = totalCapacity > 0 ? (totalBooked / totalCapacity) * 100 : 0;

    // Get bookings by day of week
    const dayBookings = new Map<string, number>();
    allBookings.forEach(b => {
      const date = new Date(b.date_short);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      dayBookings.set(dayName, (dayBookings.get(dayName) || 0) + 1);
    });

    // Sort days by booking count
    const sortedDays = Array.from(dayBookings.entries()).sort((a, b) => b[1] - a[1]);
    const peakDays = sortedDays.slice(0, 2).map(d => d[0]);
    const lowBookingDays = sortedDays.slice(-2).map(d => d[0]);

    return {
      utilizationRate,
      peakDays,
      lowBookingDays,
      averageCapacity: items.length > 0 ? totalCapacity / items.length : 0,
      averageBooked: allBookings.length > 0 ? totalBooked / allBookings.length : 0
    };
  }

  /**
   * Transform inventory items to activity profitability data
   */
  private static transformActivityProfitability(inventoryItems: ResovaInventoryItem[]): ActivityProfitability[] {
    logger.info(`Transforming ${inventoryItems.length} inventory items to activity profitability`);

    return inventoryItems
      .map(item => {
        // Parse total_sales (comes as string like "$1,234.56")
        const totalSales = parseFloat(item.total_sales.replace(/[$,]/g, '')) || 0;
        const totalBookings = item.total_bookings || 0;
        const revenuePerBooking = totalBookings > 0 ? totalSales / totalBookings : 0;
        const avgReview = parseFloat(item.avg_review) || 0;

        return {
          id: item.id,
          name: item.name,
          totalSales,
          totalBookings,
          revenuePerBooking,
          avgReview,
          totalReviews: item.total_reviews
        };
      })
      .sort((a, b) => b.totalSales - a.totalSales); // Sort by total sales descending
  }

  /**
   * Transform availability instances to capacity utilization data
   */
  private static transformCapacityUtilization(instances: ResovaAvailabilityInstance[]): CapacityUtilization {
    logger.info(`Transforming ${instances.length} availability instances to capacity utilization`);

    if (instances.length === 0) {
      return {
        overallUtilization: 0,
        totalCapacity: 0,
        totalBooked: 0,
        totalAvailable: 0,
        byActivity: [],
        byTimeSlot: [],
        peakTimes: [],
        lowUtilizationTimes: []
      };
    }

    // Calculate overall metrics
    const totalCapacity = instances.reduce((sum, inst) => sum + inst.capacity, 0);
    const totalBooked = instances.reduce((sum, inst) => sum + inst.booked, 0);
    const totalAvailable = instances.reduce((sum, inst) => sum + inst.available, 0);
    const overallUtilization = totalCapacity > 0 ? (totalBooked / totalCapacity) * 100 : 0;

    // Group by activity
    const activityMap = new Map<number, {
      id: number;
      name: string;
      capacity: number;
      booked: number;
      available: number;
      instanceCount: number;
    }>();

    instances.forEach(inst => {
      if (!activityMap.has(inst.item_id)) {
        activityMap.set(inst.item_id, {
          id: inst.item_id,
          name: inst.item_name,
          capacity: 0,
          booked: 0,
          available: 0,
          instanceCount: 0
        });
      }
      const activity = activityMap.get(inst.item_id)!;
      activity.capacity += inst.capacity;
      activity.booked += inst.booked;
      activity.available += inst.available;
      activity.instanceCount += 1;
    });

    const byActivity = Array.from(activityMap.values()).map(activity => ({
      ...activity,
      utilization: activity.capacity > 0 ? (activity.booked / activity.capacity) * 100 : 0
    })).sort((a, b) => b.utilization - a.utilization);

    // Group by time slot
    const timeSlotMap = new Map<string, {
      time: string;
      capacity: number;
      booked: number;
    }>();

    instances.forEach(inst => {
      const time = inst.start_time;
      if (!timeSlotMap.has(time)) {
        timeSlotMap.set(time, {
          time,
          capacity: 0,
          booked: 0
        });
      }
      const slot = timeSlotMap.get(time)!;
      slot.capacity += inst.capacity;
      slot.booked += inst.booked;
    });

    const byTimeSlot = Array.from(timeSlotMap.values()).map(slot => ({
      ...slot,
      utilization: slot.capacity > 0 ? (slot.booked / slot.capacity) * 100 : 0
    })).sort((a, b) => b.utilization - a.utilization);

    // Identify peak times (top 20% utilization)
    const utilizationThreshold = 80;
    const peakTimes = byTimeSlot
      .filter(slot => slot.utilization >= utilizationThreshold)
      .map(slot => slot.time);

    // Identify low utilization times (bottom 50% utilization)
    const lowUtilizationThreshold = 50;
    const lowUtilizationTimes = byTimeSlot
      .filter(slot => slot.utilization < lowUtilizationThreshold)
      .map(slot => slot.time);

    return {
      overallUtilization: Math.round(overallUtilization * 10) / 10,
      totalCapacity,
      totalBooked,
      totalAvailable,
      byActivity,
      byTimeSlot,
      peakTimes,
      lowUtilizationTimes
    };
  }

  /**
   * Transform daily breakdown for chart visualization and trend analysis
   * Strategic Pillar: Drive Revenue 💰 + Operational Efficiency ⚙️
   *
   * Enables:
   * - Bar charts showing bookings per day
   * - Top items booked per day
   * - Daily revenue trends
   */
  private static transformDailyBreakdown(allBookings: ResovaAllBooking[]): DailyBreakdown[] {
    // Group bookings by date
    const dailyMap = new Map<string, {
      bookings: ResovaAllBooking[];
      revenue: number;
      guests: number;
    }>();

    allBookings.forEach(b => {
      const date = b.date_short; // Already in YYYY-MM-DD format
      const existing = dailyMap.get(date) || { bookings: [], revenue: 0, guests: 0 };

      existing.bookings.push(b);
      existing.revenue += parseFloat(b.booking_total || '0');
      existing.guests += b.total_quantity;

      dailyMap.set(date, existing);
    });

    // Transform to array with top item per day
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return Array.from(dailyMap.entries())
      .map(([date, data]) => {
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.getDay();

        // Find top item for this day
        const itemMap = new Map<string, { bookings: number; revenue: number }>();
        data.bookings.forEach(b => {
          const existing = itemMap.get(b.item_name) || { bookings: 0, revenue: 0 };
          existing.bookings += 1;
          existing.revenue += parseFloat(b.booking_total || '0');
          itemMap.set(b.item_name, existing);
        });

        // Sort items by bookings to find top
        const sortedItems = Array.from(itemMap.entries())
          .sort((a, b) => b[1].bookings - a[1].bookings);

        const topItem = sortedItems[0];

        return {
          date,
          dayOfWeek,
          dayName: dayNames[dayOfWeek],
          bookings: data.bookings.length,
          revenue: data.revenue,
          guests: data.guests,
          topItem: topItem ? topItem[0] : '',
          topItemBookings: topItem ? topItem[1].bookings : 0,
          topItemRevenue: topItem ? topItem[1].revenue : 0
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date)); // Sort chronologically
  }

  /**
   * Transform day-of-week summary for weekend vs weekday comparisons
   * Strategic Pillar: Drive Revenue 💰 + Operational Efficiency ⚙️
   *
   * Enables:
   * - Weekend vs weekday revenue comparisons
   * - Identify busiest days of the week
   * - Average performance by day of week
   */
  private static transformDayOfWeekSummary(allBookings: ResovaAllBooking[]): DayOfWeekSummary[] {
    // Group bookings by day of week
    const dayOfWeekMap = new Map<number, {
      dates: Set<string>;
      bookings: number;
      revenue: number;
      guests: number;
    }>();

    allBookings.forEach(b => {
      const dateObj = new Date(b.date_short);
      const dayOfWeek = dateObj.getDay();
      const existing = dayOfWeekMap.get(dayOfWeek) || {
        dates: new Set<string>(),
        bookings: 0,
        revenue: 0,
        guests: 0
      };

      existing.dates.add(b.date_short); // Track unique dates for occurrences
      existing.bookings += 1;
      existing.revenue += parseFloat(b.booking_total || '0');
      existing.guests += b.total_quantity;

      dayOfWeekMap.set(dayOfWeek, existing);
    });

    // Transform to array with averages
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const result: DayOfWeekSummary[] = [];
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const data = dayOfWeekMap.get(dayOfWeek) || {
        dates: new Set<string>(),
        bookings: 0,
        revenue: 0,
        guests: 0
      };

      const occurrences = data.dates.size || 1; // Avoid division by zero

      result.push({
        dayOfWeek,
        dayName: dayNames[dayOfWeek],
        totalBookings: data.bookings,
        totalRevenue: data.revenue,
        totalGuests: data.guests,
        avgBookingsPerOccurrence: data.bookings / occurrences,
        avgRevenuePerOccurrence: data.revenue / occurrences,
        occurrences
      });
    }

    logger.info(`Day of Week Summary - Weekend avg: ${result.filter(d => d.dayOfWeek === 0 || d.dayOfWeek === 6).reduce((sum, d) => sum + d.avgRevenuePerOccurrence, 0) / 2}, Weekday avg: ${result.filter(d => d.dayOfWeek > 0 && d.dayOfWeek < 6).reduce((sum, d) => sum + d.avgRevenuePerOccurrence, 0) / 5}`);

    return result;
  }
}
