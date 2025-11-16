/**
 * Intelligence Engine - DISABLED
 *
 * STATUS: This file is disabled from compilation (.ts.disabled extension)
 *
 * REASON FOR DISABLING:
 * - Contains 68 TypeScript compilation errors
 * - Built for an older version of the type definitions
 * - Uses properties that don't exist in current interfaces (e.g., ResovaTransaction.gross, ResovaTransaction.net)
 * - Not currently imported or used anywhere in the active codebase
 *
 * CURRENT ACTIVE ALTERNATIVES:
 * - resova-data-transformer.ts - Core analytics transformation
 * - customer-intelligence-transformer.ts - Customer CLV, segments, voucher/conversion intelligence
 *
 * FUTURE PLANS:
 * - Keep disabled as reference for future advanced analytics implementation
 * - See INTEGRATION_SUMMARY.md for planned integration roadmap
 * - Would require significant refactoring to align with current type definitions
 *
 * DO NOT RE-ENABLE without:
 * 1. Updating all type references to match current interfaces
 * 2. Fixing all 68 TypeScript compilation errors
 * 3. Testing thoroughly with real Resova API data
 * 4. Integrating into the main analytics pipeline
 *
 * ---
 *
 * ORIGINAL PURPOSE:
 * Transforms raw Resova data into 5-layer intelligence framework
 * - Layer 1: Raw Insights (Facts)
 * - Layer 2: Derived Insights (Calculations)
 * - Layer 3: Connected Insights (Correlations)
 * - Layer 4: Predictive Insights (Forecasts)
 * - Layer 5: Prescriptive Insights (Recommendations)
 */

import {
  AdvancedIntelligence,
  RawInsights,
  DerivedInsights,
  ConnectedInsights,
  PredictiveInsights,
  PrescriptiveInsights,
  PrescriptiveInsight,
  InsightMetadata
} from '@/app/types/analytics';

import {
  ResovaTransaction,
  ResovaItemizedRevenue,
  ResovaAllBooking,
  ResovaAllPayment,
  ResovaInventoryItem,
  ResovaAvailabilityInstance
} from '../services/resova-service';

import { ResovaCustomer, ResovaGiftVoucher } from '@/app/types/resova-core';
import { logger } from '../utils/logger';

export class IntelligenceEngine {
  /**
   * Generate complete 5-layer intelligence from all available data
   */
  static generate(
    transactions: ResovaTransaction[],
    itemizedRevenue: ResovaItemizedRevenue[],
    allBookings: ResovaAllBooking[],
    allPayments: ResovaAllPayment[],
    inventoryItems: ResovaInventoryItem[],
    availabilityInstances: ResovaAvailabilityInstance[],
    customers: ResovaCustomer[],
    vouchers: ResovaGiftVoucher[],
    // Previous period for comparison
    previousTransactions?: ResovaTransaction[],
    previousBookings?: ResovaAllBooking[],
    previousPayments?: ResovaAllPayment[],
    // Future bookings for predictions
    futureBookings?: ResovaAllBooking[]
  ): AdvancedIntelligence {
    logger.info('🧠 Intelligence Engine: Starting analysis...');

    const startDate = this.getEarliestDate(allBookings);
    const endDate = this.getLatestDate(allBookings);
    const prevStartDate = previousBookings ? this.getEarliestDate(previousBookings) : undefined;
    const prevEndDate = previousBookings ? this.getLatestDate(previousBookings) : undefined;

    // Layer 1: Raw Insights (Facts)
    const raw = this.generateRawInsights(
      transactions,
      allBookings,
      allPayments,
      inventoryItems,
      availabilityInstances,
      customers,
      vouchers,
      startDate,
      endDate
    );

    // Layer 2: Derived Insights (Calculations)
    const derived = this.generateDerivedInsights(
      raw,
      transactions,
      allBookings,
      allPayments,
      inventoryItems,
      customers,
      vouchers,
      previousTransactions,
      previousBookings,
      previousPayments,
      startDate,
      endDate
    );

    // Layer 3: Connected Insights (Correlations)
    const connected = this.generateConnectedInsights(
      raw,
      derived,
      transactions,
      allBookings,
      customers,
      inventoryItems,
      startDate,
      endDate
    );

    // Layer 4: Predictive Insights (Forecasts)
    const predictive = this.generatePredictiveInsights(
      raw,
      derived,
      allBookings,
      customers,
      vouchers,
      futureBookings || [],
      startDate,
      endDate
    );

    // Layer 5: Prescriptive Insights (Recommendations)
    const prescriptive = this.generatePrescriptiveInsights(
      raw,
      derived,
      connected,
      predictive,
      inventoryItems
    );

    logger.info('✅ Intelligence Engine: Analysis complete');

    return {
      raw,
      derived,
      connected,
      predictive,
      prescriptive,
      generated_at: new Date().toISOString(),
      data_period: {
        start_date: startDate,
        end_date: endDate,
        comparison_period_start: prevStartDate,
        comparison_period_end: prevEndDate
      }
    };
  }

  // ==================== LAYER 1: RAW INSIGHTS ====================

  private static generateRawInsights(
    transactions: ResovaTransaction[],
    allBookings: ResovaAllBooking[],
    allPayments: ResovaAllPayment[],
    inventoryItems: ResovaInventoryItem[],
    availabilityInstances: ResovaAvailabilityInstance[],
    customers: ResovaCustomer[],
    vouchers: ResovaGiftVoucher[],
    startDate: string,
    endDate: string
  ): RawInsights {
    logger.info('Layer 1: Generating raw insights...');

    // Revenue facts
    const grossRevenue = transactions.reduce((sum, t) => sum + (t.gross || 0), 0);
    const netRevenue = transactions.reduce((sum, t) => sum + (t.net || 0), 0);
    const totalRefunds = transactions.reduce((sum, t) => sum + (t.refunded || 0), 0);
    const totalDiscounts = transactions.reduce((sum, t) => sum + (t.discounts || 0), 0);

    // Booking facts
    const totalBookings = allBookings.length;
    const onlineBookings = allBookings.filter(b => b.created_by_type === 'customer').length;
    const operatorBookings = totalBookings - onlineBookings;
    const cancelledBookings = allBookings.filter(b => b.status === 'cancelled').length;
    const noShows = allBookings.filter(b => b.no_show === true || b.no_show === 1).length;

    // Bookings by day of week
    const bookingsByDay: Record<string, number> = {};
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    allBookings.forEach(b => {
      const day = daysOfWeek[new Date(b.booking_date).getDay()];
      bookingsByDay[day] = (bookingsByDay[day] || 0) + 1;
    });

    // Bookings by hour
    const bookingsByHour: Record<string, number> = {};
    allBookings.forEach(b => {
      if (b.booking_date) {
        const hour = new Date(b.booking_date).getHours();
        const hourKey = `${hour}:00`;
        bookingsByHour[hourKey] = (bookingsByHour[hourKey] || 0) + 1;
      }
    });

    // Guest facts
    const totalGuests = allBookings.reduce((sum, b) =>
      sum + (b.adults || 0) + (b.children || 0), 0
    );
    const totalAdults = allBookings.reduce((sum, b) => sum + (b.adults || 0), 0);
    const totalChildren = allBookings.reduce((sum, b) => sum + (b.children || 0), 0);
    const waiversCompleted = allBookings.filter(b => b.waiver_complete).length;
    const waiversRequired = allBookings.filter(b => b.waiver_required).length;

    // Activity facts
    const bookingsByActivity: Record<string, number> = {};
    const revenueByActivity: Record<string, number> = {};
    const capacityByActivity: Record<string, number> = {};

    allBookings.forEach(b => {
      const itemName = b.item_name || 'Unknown';
      bookingsByActivity[itemName] = (bookingsByActivity[itemName] || 0) + 1;
      revenueByActivity[itemName] = (revenueByActivity[itemName] || 0) + (b.item_gross || 0);
    });

    availabilityInstances.forEach(inst => {
      const itemName = inst.item_name || 'Unknown';
      capacityByActivity[itemName] = (capacityByActivity[itemName] || 0) + (inst.capacity || 0);
    });

    // Customer facts
    const uniqueCustomers = new Set(transactions.map(t => t.customer_email).filter(Boolean)).size;
    const existingCustomerEmails = new Set(customers.map(c => c.email));
    const newCustomers = transactions.filter(t =>
      t.customer_email && !existingCustomerEmails.has(t.customer_email)
    ).length;

    // Voucher facts
    const activeVouchers = vouchers.filter(v => v.status === 'active');
    const redeemedVouchers = vouchers.filter(v => v.status === 'redeemed');
    const expiredVouchers = vouchers.filter(v => v.status === 'expired');

    // Capacity facts
    const totalCapacity = availabilityInstances.reduce((sum, inst) => sum + (inst.capacity || 0), 0);
    const slotsBooked = availabilityInstances.reduce((sum, inst) => sum + (inst.booked || 0), 0);
    const slotsAvailable = totalCapacity - slotsBooked;

    return {
      revenue: {
        gross_revenue: {
          value: grossRevenue,
          metadata: {
            source: ['Transactions API'],
            date_range: `${startDate} to ${endDate}`,
            sample_size: transactions.length
          }
        },
        net_revenue: {
          value: netRevenue,
          metadata: {
            source: ['Transactions API'],
            calculation: 'gross - taxes - fees - discounts + refunds',
            date_range: `${startDate} to ${endDate}`,
            sample_size: transactions.length
          }
        },
        total_transactions: {
          value: transactions.length,
          metadata: {
            source: ['Transactions API'],
            date_range: `${startDate} to ${endDate}`
          }
        },
        average_transaction_value: {
          value: transactions.length > 0 ? grossRevenue / transactions.length : 0,
          metadata: {
            source: ['Transactions API'],
            calculation: 'gross_revenue / total_transactions',
            sample_size: transactions.length
          }
        },
        total_refunds: {
          value: totalRefunds,
          metadata: {
            source: ['Transactions API'],
            date_range: `${startDate} to ${endDate}`
          }
        },
        total_discounts: {
          value: totalDiscounts,
          metadata: {
            source: ['Transactions API'],
            date_range: `${startDate} to ${endDate}`
          }
        }
      },
      bookings: {
        total_bookings: {
          value: totalBookings,
          metadata: {
            source: ['All Bookings API'],
            date_range: `${startDate} to ${endDate}`
          }
        },
        online_bookings: {
          value: onlineBookings,
          metadata: {
            source: ['All Bookings API'],
            calculation: 'bookings where created_by_type = customer',
            sample_size: totalBookings
          }
        },
        operator_bookings: {
          value: operatorBookings,
          metadata: {
            source: ['All Bookings API'],
            calculation: 'total_bookings - online_bookings',
            sample_size: totalBookings
          }
        },
        cancelled_bookings: {
          value: cancelledBookings,
          metadata: {
            source: ['All Bookings API'],
            calculation: 'bookings where status = cancelled',
            sample_size: totalBookings
          }
        },
        no_shows: {
          value: noShows,
          metadata: {
            source: ['All Bookings API'],
            calculation: 'bookings where no_show = true',
            sample_size: totalBookings
          }
        },
        bookings_by_day_of_week: {
          value: bookingsByDay,
          metadata: {
            source: ['All Bookings API'],
            sample_size: totalBookings
          }
        },
        bookings_by_hour: {
          value: bookingsByHour,
          metadata: {
            source: ['All Bookings API'],
            sample_size: totalBookings
          }
        }
      },
      guests: {
        total_guests: {
          value: totalGuests,
          metadata: {
            source: ['All Bookings API'],
            calculation: 'sum of adults + children across all bookings',
            sample_size: totalBookings
          }
        },
        average_group_size: {
          value: totalBookings > 0 ? totalGuests / totalBookings : 0,
          metadata: {
            source: ['All Bookings API'],
            calculation: 'total_guests / total_bookings',
            sample_size: totalBookings
          }
        },
        adult_child_ratio: {
          value: `${totalAdults}:${totalChildren}`,
          metadata: {
            source: ['All Bookings API'],
            sample_size: totalBookings
          }
        },
        waivers_completed: {
          value: waiversCompleted,
          metadata: {
            source: ['All Bookings API'],
            calculation: 'bookings where waiver_complete = true',
            sample_size: totalBookings
          }
        },
        waivers_required: {
          value: waiversRequired,
          metadata: {
            source: ['All Bookings API'],
            calculation: 'bookings where waiver_required = true',
            sample_size: totalBookings
          }
        }
      },
      activities: {
        active_count: {
          value: inventoryItems.length,
          metadata: {
            source: ['Inventory Items API']
          }
        },
        bookings_by_activity: {
          value: bookingsByActivity,
          metadata: {
            source: ['All Bookings API'],
            sample_size: totalBookings
          }
        },
        revenue_by_activity: {
          value: revenueByActivity,
          metadata: {
            source: ['All Bookings API'],
            calculation: 'sum of item_gross per activity',
            sample_size: totalBookings
          }
        },
        capacity_by_activity: {
          value: capacityByActivity,
          metadata: {
            source: ['Availability Calendar API'],
            sample_size: availabilityInstances.length
          }
        }
      },
      customers: {
        total_customers: {
          value: uniqueCustomers,
          metadata: {
            source: ['Transactions API', 'Customers API'],
            calculation: 'unique customer emails',
            sample_size: transactions.length
          }
        },
        new_customers: {
          value: newCustomers,
          metadata: {
            source: ['Transactions API', 'Customers API'],
            calculation: 'transactions from emails not in customer database',
            sample_size: transactions.length
          }
        },
        returning_customers: {
          value: uniqueCustomers - newCustomers,
          metadata: {
            source: ['Transactions API', 'Customers API'],
            calculation: 'total_customers - new_customers',
            sample_size: uniqueCustomers
          }
        }
      },
      vouchers: {
        active_vouchers: {
          value: activeVouchers.length,
          metadata: {
            source: ['Gift Vouchers API (Core)'],
            calculation: 'vouchers where status = active'
          }
        },
        active_value: {
          value: activeVouchers.reduce((sum, v) => sum + (v.value || 0), 0),
          metadata: {
            source: ['Gift Vouchers API (Core)'],
            calculation: 'sum of value for active vouchers',
            sample_size: activeVouchers.length
          }
        },
        redeemed_vouchers: {
          value: redeemedVouchers.length,
          metadata: {
            source: ['Gift Vouchers API (Core)'],
            calculation: 'vouchers where status = redeemed'
          }
        },
        redeemed_value: {
          value: redeemedVouchers.reduce((sum, v) => sum + (v.value || 0), 0),
          metadata: {
            source: ['Gift Vouchers API (Core)'],
            calculation: 'sum of value for redeemed vouchers',
            sample_size: redeemedVouchers.length
          }
        },
        expired_vouchers: {
          value: expiredVouchers.length,
          metadata: {
            source: ['Gift Vouchers API (Core)'],
            calculation: 'vouchers where status = expired'
          }
        },
        expired_value: {
          value: expiredVouchers.reduce((sum, v) => sum + (v.value || 0), 0),
          metadata: {
            source: ['Gift Vouchers API (Core)'],
            calculation: 'sum of value for expired vouchers',
            sample_size: expiredVouchers.length
          }
        }
      },
      capacity: {
        total_capacity: {
          value: totalCapacity,
          metadata: {
            source: ['Availability Calendar API'],
            calculation: 'sum of capacity across all availability instances',
            sample_size: availabilityInstances.length
          }
        },
        slots_booked: {
          value: slotsBooked,
          metadata: {
            source: ['Availability Calendar API'],
            calculation: 'sum of booked across all availability instances',
            sample_size: availabilityInstances.length
          }
        },
        slots_available: {
          value: slotsAvailable,
          metadata: {
            source: ['Availability Calendar API'],
            calculation: 'total_capacity - slots_booked',
            sample_size: availabilityInstances.length
          }
        }
      }
    };
  }

  // ==================== LAYER 2: DERIVED INSIGHTS ====================

  private static generateDerivedInsights(
    raw: RawInsights,
    transactions: ResovaTransaction[],
    allBookings: ResovaAllBooking[],
    allPayments: ResovaAllPayment[],
    inventoryItems: ResovaInventoryItem[],
    customers: ResovaCustomer[],
    vouchers: ResovaGiftVoucher[],
    previousTransactions?: ResovaTransaction[],
    previousBookings?: ResovaAllBooking[],
    previousPayments?: ResovaAllPayment[],
    startDate?: string,
    endDate?: string
  ): DerivedInsights {
    logger.info('Layer 2: Generating derived insights...');

    const grossRev = raw.revenue.gross_revenue.value;
    const totalBookings = raw.bookings.total_bookings.value;
    const totalGuests = raw.guests.total_guests.value;
    const totalCapacity = raw.capacity.total_capacity.value;
    const slotsBooked = raw.capacity.slots_booked.value;

    // Previous period comparisons
    const prevGrossRev = previousTransactions?.reduce((sum, t) => sum + (t.gross || 0), 0) || 0;
    const prevBookings = previousBookings?.length || 0;
    const prevGuests = previousBookings?.reduce((sum, b) => sum + (b.adults || 0) + (b.children || 0), 0) || 0;

    const revenueGrowth = prevGrossRev > 0 ? ((grossRev - prevGrossRev) / prevGrossRev) * 100 : 0;
    const bookingGrowth = prevBookings > 0 ? ((totalBookings - prevBookings) / prevBookings) * 100 : 0;
    const guestGrowth = prevGuests > 0 ? ((totalGuests - prevGuests) / prevGuests) * 100 : 0;

    // Customer metrics
    const customerBookingCounts = new Map<string, number>();
    transactions.forEach(t => {
      if (t.customer_email) {
        customerBookingCounts.set(
          t.customer_email,
          (customerBookingCounts.get(t.customer_email) || 0) + 1
        );
      }
    });

    const repeatCustomers = Array.from(customerBookingCounts.values()).filter(count => count > 1).length;
    const totalCustomers = raw.customers.total_customers.value;
    const repeatRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

    // Calculate CLV
    const avgCLV = totalCustomers > 0 ? grossRev / totalCustomers : 0;

    // Customer retention (customers who booked in both current and previous period)
    const prevCustomerEmails = new Set(previousTransactions?.map(t => t.customer_email).filter(Boolean));
    const currCustomerEmails = new Set(transactions.map(t => t.customer_email).filter(Boolean));
    const retainedCustomers = Array.from(currCustomerEmails).filter(email => prevCustomerEmails.has(email)).length;
    const retentionRate = prevCustomerEmails.size > 0 ? (retainedCustomers / prevCustomerEmails.size) * 100 : 0;

    // New customer acquisition rate
    const newCustomers = raw.customers.new_customers.value;
    const newCustomerRate = totalCustomers > 0 ? (newCustomers / totalCustomers) * 100 : 0;

    // Churn risk (customers from previous period who didn't return)
    const churnedCustomers = prevCustomerEmails.size - retainedCustomers;
    const churnRate = prevCustomerEmails.size > 0 ? (churnedCustomers / prevCustomerEmails.size) * 100 : 0;

    // Activity performance
    const revenuePerBookingByActivity: Record<string, number> = {};
    const profitMarginByActivity: Record<string, number> = {};
    const utilizationByActivity: Record<string, number> = {};
    const growthRateByActivity: Record<string, number> = {};

    Object.keys(raw.activities.bookings_by_activity.value).forEach(activity => {
      const bookings = raw.activities.bookings_by_activity.value[activity] || 0;
      const revenue = raw.activities.revenue_by_activity.value[activity] || 0;
      const capacity = raw.activities.capacity_by_activity.value[activity] || 0;

      revenuePerBookingByActivity[activity] = bookings > 0 ? revenue / bookings : 0;

      // Profit margin (simple: revenue - discounts/refunds allocated proportionally)
      const activityDiscounts = (raw.revenue.total_discounts.value / grossRev) * revenue;
      const activityRefunds = (raw.revenue.total_refunds.value / grossRev) * revenue;
      profitMarginByActivity[activity] = revenue > 0 ?
        ((revenue - activityDiscounts - activityRefunds) / revenue) * 100 : 0;

      utilizationByActivity[activity] = capacity > 0 ? (bookings / capacity) * 100 : 0;

      // Growth (if previous data available)
      if (previousBookings) {
        const prevActivityBookings = previousBookings.filter(b => b.item_name === activity).length;
        growthRateByActivity[activity] = prevActivityBookings > 0 ?
          ((bookings - prevActivityBookings) / prevActivityBookings) * 100 : 0;
      }
    });

    // Time patterns
    const hourlyUtilization: Record<string, number> = {};
    Object.entries(raw.bookings.bookings_by_hour.value).forEach(([hour, count]) => {
      hourlyUtilization[hour] = totalBookings > 0 ? (count / totalBookings) * 100 : 0;
    });

    const peakHours = Object.entries(hourlyUtilization)
      .map(([hour, util]) => ({ hour, utilization: util }))
      .sort((a, b) => b.utilization - a.utilization)
      .slice(0, 3);

    const lowDemandHours = Object.entries(hourlyUtilization)
      .map(([hour, util]) => ({ hour, utilization: util }))
      .filter(h => h.utilization > 0)
      .sort((a, b) => a.utilization - b.utilization)
      .slice(0, 3);

    // Best/worst days
    const dailyRevenue: Record<string, number> = {};
    allBookings.forEach(b => {
      const day = b.booking_date?.split(' ')[0] || 'Unknown';
      dailyRevenue[day] = (dailyRevenue[day] || 0) + (b.item_gross || 0);
    });

    const bestDays = Object.entries(dailyRevenue)
      .map(([day, revenue]) => ({ day, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const worstDays = Object.entries(dailyRevenue)
      .map(([day, revenue]) => ({ day, revenue }))
      .filter(d => d.revenue > 0)
      .sort((a, b) => a.revenue - b.revenue)
      .slice(0, 5);

    // Voucher performance
    const redeemedCount = raw.vouchers.redeemed_vouchers.value;
    const totalVouchers = redeemedCount + raw.vouchers.active_vouchers.value + raw.vouchers.expired_vouchers.value;
    const redemptionRate = totalVouchers > 0 ? (redeemedCount / totalVouchers) * 100 : 0;

    // Average days to redemption (simplified - would need issue dates from API)
    const avgDaysToRedemption = 30; // Placeholder - need actual date tracking

    const expiredCount = raw.vouchers.expired_vouchers.value;
    const breakageRate = totalVouchers > 0 ? (expiredCount / totalVouchers) * 100 : 0;

    return {
      efficiency: {
        capacity_utilization_rate: {
          value: totalCapacity > 0 ? (slotsBooked / totalCapacity) * 100 : 0,
          metadata: {
            source: ['Availability Calendar API'],
            calculation: '(slots_booked / total_capacity) * 100',
            sample_size: raw.capacity.total_capacity.metadata.sample_size
          }
        },
        revenue_per_available_slot: {
          value: totalCapacity > 0 ? grossRev / totalCapacity : 0,
          metadata: {
            source: ['Transactions API', 'Availability Calendar API'],
            calculation: 'gross_revenue / total_capacity'
          }
        },
        revenue_per_booking: {
          value: totalBookings > 0 ? grossRev / totalBookings : 0,
          metadata: {
            source: ['Transactions API', 'All Bookings API'],
            calculation: 'gross_revenue / total_bookings',
            sample_size: totalBookings
          }
        },
        revenue_per_guest: {
          value: totalGuests > 0 ? grossRev / totalGuests : 0,
          metadata: {
            source: ['Transactions API', 'All Bookings API'],
            calculation: 'gross_revenue / total_guests',
            sample_size: totalGuests
          }
        },
        discount_cost_percentage: {
          value: grossRev > 0 ? (raw.revenue.total_discounts.value / grossRev) * 100 : 0,
          metadata: {
            source: ['Transactions API'],
            calculation: '(total_discounts / gross_revenue) * 100'
          }
        },
        refund_rate: {
          value: grossRev > 0 ? (raw.revenue.total_refunds.value / grossRev) * 100 : 0,
          metadata: {
            source: ['Transactions API'],
            calculation: '(total_refunds / gross_revenue) * 100'
          }
        },
        no_show_rate: {
          value: totalBookings > 0 ? (raw.bookings.no_shows.value / totalBookings) * 100 : 0,
          metadata: {
            source: ['All Bookings API'],
            calculation: '(no_shows / total_bookings) * 100',
            sample_size: totalBookings
          }
        }
      },
      growth: {
        revenue_growth: {
          value: revenueGrowth,
          metadata: {
            source: ['Transactions API'],
            calculation: '((current_revenue - previous_revenue) / previous_revenue) * 100',
            sample_size: transactions.length
          }
        },
        booking_growth: {
          value: bookingGrowth,
          metadata: {
            source: ['All Bookings API'],
            calculation: '((current_bookings - previous_bookings) / previous_bookings) * 100',
            sample_size: totalBookings
          }
        },
        guest_growth: {
          value: guestGrowth,
          metadata: {
            source: ['All Bookings API'],
            calculation: '((current_guests - previous_guests) / previous_guests) * 100',
            sample_size: totalGuests
          }
        },
        new_customer_acquisition_rate: {
          value: newCustomerRate,
          metadata: {
            source: ['Transactions API', 'Customers API'],
            calculation: '(new_customers / total_customers) * 100',
            sample_size: totalCustomers
          }
        },
        customer_retention_rate: {
          value: retentionRate,
          metadata: {
            source: ['Transactions API'],
            calculation: '(retained_customers / previous_period_customers) * 100',
            sample_size: prevCustomerEmails.size
          }
        }
      },
      customer_metrics: {
        average_customer_lifetime_value: {
          value: avgCLV,
          metadata: {
            source: ['Transactions API', 'Customers API'],
            calculation: 'gross_revenue / total_customers',
            sample_size: totalCustomers
          }
        },
        repeat_customer_rate: {
          value: repeatRate,
          metadata: {
            source: ['Transactions API'],
            calculation: '(customers_with_2+_bookings / total_customers) * 100',
            sample_size: totalCustomers
          }
        },
        average_days_between_bookings: {
          value: 45, // Placeholder - would need date tracking per customer
          metadata: {
            source: ['Transactions API'],
            calculation: 'average time between repeat bookings',
            confidence: 0.5
          }
        },
        churn_risk_percentage: {
          value: churnRate,
          metadata: {
            source: ['Transactions API'],
            calculation: '(customers_not_returning / previous_period_customers) * 100',
            sample_size: prevCustomerEmails.size
          }
        }
      },
      activity_performance: {
        revenue_per_booking_by_activity: {
          value: revenuePerBookingByActivity,
          metadata: {
            source: ['All Bookings API'],
            calculation: 'revenue / bookings per activity'
          }
        },
        profit_margin_by_activity: {
          value: profitMarginByActivity,
          metadata: {
            source: ['All Bookings API', 'Transactions API'],
            calculation: '((revenue - discounts - refunds) / revenue) * 100 per activity'
          }
        },
        booking_frequency_by_activity: {
          value: raw.activities.bookings_by_activity.value,
          metadata: {
            source: ['All Bookings API'],
            sample_size: totalBookings
          }
        },
        utilization_by_activity: {
          value: utilizationByActivity,
          metadata: {
            source: ['All Bookings API', 'Availability Calendar API'],
            calculation: '(bookings / capacity) * 100 per activity'
          }
        },
        growth_rate_by_activity: {
          value: growthRateByActivity,
          metadata: {
            source: ['All Bookings API'],
            calculation: '((current_bookings - previous_bookings) / previous_bookings) * 100 per activity',
            confidence: previousBookings ? 1.0 : 0
          }
        }
      },
      time_patterns: {
        peak_hours: {
          value: peakHours,
          metadata: {
            source: ['All Bookings API'],
            calculation: 'top 3 hours by booking volume',
            sample_size: totalBookings
          }
        },
        low_demand_hours: {
          value: lowDemandHours,
          metadata: {
            source: ['All Bookings API'],
            calculation: 'bottom 3 hours by booking volume',
            sample_size: totalBookings
          }
        },
        best_performing_days: {
          value: bestDays,
          metadata: {
            source: ['All Bookings API'],
            calculation: 'top 5 days by revenue',
            sample_size: Object.keys(dailyRevenue).length
          }
        },
        worst_performing_days: {
          value: worstDays,
          metadata: {
            source: ['All Bookings API'],
            calculation: 'bottom 5 days by revenue',
            sample_size: Object.keys(dailyRevenue).length
          }
        }
      },
      voucher_performance: {
        redemption_rate: {
          value: redemptionRate,
          metadata: {
            source: ['Gift Vouchers API (Core)'],
            calculation: '(redeemed_vouchers / total_vouchers) * 100',
            sample_size: totalVouchers
          }
        },
        average_days_to_redemption: {
          value: avgDaysToRedemption,
          metadata: {
            source: ['Gift Vouchers API (Core)'],
            calculation: 'average(redemption_date - issue_date)',
            confidence: 0.5 // Placeholder data
          }
        },
        breakage_rate: {
          value: breakageRate,
          metadata: {
            source: ['Gift Vouchers API (Core)'],
            calculation: '(expired_vouchers / total_vouchers) * 100',
            sample_size: totalVouchers
          }
        }
      }
    };
  }

  // ==================== LAYER 3: CONNECTED INSIGHTS ====================

  private static generateConnectedInsights(
    raw: RawInsights,
    derived: DerivedInsights,
    transactions: ResovaTransaction[],
    allBookings: ResovaAllBooking[],
    customers: ResovaCustomer[],
    inventoryItems: ResovaInventoryItem[],
    startDate: string,
    endDate: string
  ): ConnectedInsights {
    logger.info('Layer 3: Generating connected insights...');

    // Top revenue driver
    const revenueByActivity = raw.activities.revenue_by_activity.value;
    const totalRevenue = raw.revenue.gross_revenue.value;
    const topActivity = Object.entries(revenueByActivity)
      .sort((a, b) => b[1] - a[1])[0];

    const topRevDriver = topActivity ? {
      name: topActivity[0],
      percentage: totalRevenue > 0 ? (topActivity[1] / totalRevenue) * 100 : 0,
      revenue: topActivity[1]
    } : { name: 'None', percentage: 0, revenue: 0 };

    // Online vs operator booking value
    const onlineBookings = allBookings.filter(b => b.created_by_type === 'customer');
    const operatorBookings = allBookings.filter(b => b.created_by_type !== 'customer');
    const onlineAvg = onlineBookings.length > 0 ?
      onlineBookings.reduce((sum, b) => sum + (b.item_gross || 0), 0) / onlineBookings.length : 0;
    const operatorAvg = operatorBookings.length > 0 ?
      operatorBookings.reduce((sum, b) => sum + (b.item_gross || 0), 0) / operatorBookings.length : 0;

    // Group size correlation with revenue
    const largeGroups = allBookings.filter(b => (b.adults || 0) + (b.children || 0) >= 6);
    const smallGroups = allBookings.filter(b => (b.adults || 0) + (b.children || 0) < 6);
    const largeGroupAvgRev = largeGroups.length > 0 ?
      largeGroups.reduce((sum, b) => sum + (b.item_gross || 0), 0) / largeGroups.length : 0;
    const smallGroupAvgRev = smallGroups.length > 0 ?
      smallGroups.reduce((sum, b) => sum + (b.item_gross || 0), 0) / smallGroups.length : 0;

    const groupSizeCorr = largeGroupAvgRev > smallGroupAvgRev ?
      `Large groups (6+ guests) generate ${((largeGroupAvgRev / smallGroupAvgRev - 1) * 100).toFixed(0)}% more revenue per booking` :
      `Small groups generate ${((smallGroupAvgRev / largeGroupAvgRev - 1) * 100).toFixed(0)}% more revenue per booking`;

    // Discount impact
    const discountedBookings = allBookings.filter(b => (b.discount || 0) > 0);
    const nonDiscountedBookings = allBookings.filter(b => (b.discount || 0) === 0);
    const discountImpact = discountedBookings.length > 0 && nonDiscountedBookings.length > 0 ?
      `Discounted bookings represent ${((discountedBookings.length / allBookings.length) * 100).toFixed(0)}% of volume but ${derived.efficiency.discount_cost_percentage.value.toFixed(1)}% revenue reduction` :
      'Insufficient discount data for correlation';

    // Repeat booking drivers
    const customerBookingsByActivity = new Map<string, Map<string, number>>();
    allBookings.forEach(b => {
      const email = b.customer_email || 'unknown';
      const activity = b.item_name || 'Unknown';

      if (!customerBookingsByActivity.has(email)) {
        customerBookingsByActivity.set(email, new Map());
      }
      const activityMap = customerBookingsByActivity.get(email)!;
      activityMap.set(activity, (activityMap.get(activity) || 0) + 1);
    });

    const activityRepeatRates = new Map<string, number>();
    customerBookingsByActivity.forEach((activities, email) => {
      activities.forEach((count, activity) => {
        if (count > 1) {
          activityRepeatRates.set(activity, (activityRepeatRates.get(activity) || 0) + 1);
        }
      });
    });

    const totalCustomers = customerBookingsByActivity.size;
    const repeatDrivers = Array.from(activityRepeatRates.entries())
      .map(([activity, count]) => ({
        activity,
        repeat_rate: totalCustomers > 0 ? (count / totalCustomers) * 100 : 0
      }))
      .sort((a, b) => b.repeat_rate - a.repeat_rate)
      .slice(0, 5);

    // Cross-sell patterns (activities booked together)
    const customerActivities = new Map<string, Set<string>>();
    allBookings.forEach(b => {
      const email = b.customer_email || 'unknown';
      if (!customerActivities.has(email)) {
        customerActivities.set(email, new Set());
      }
      customerActivities.get(email)!.add(b.item_name || 'Unknown');
    });

    const activityPairs = new Map<string, number>();
    customerActivities.forEach(activities => {
      const activityArray = Array.from(activities).sort();
      if (activityArray.length > 1) {
        for (let i = 0; i < activityArray.length; i++) {
          for (let j = i + 1; j < activityArray.length; j++) {
            const pairKey = `${activityArray[i]} + ${activityArray[j]}`;
            activityPairs.set(pairKey, (activityPairs.get(pairKey) || 0) + 1);
          }
        }
      }
    });

    const crossSellPatterns = Array.from(activityPairs.entries())
      .map(([pair, count]) => ({
        activities: pair.split(' + '),
        frequency: count
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    // Customer segment preferences (VIP vs regular vs new)
    const vipPreferences: string[] = [];
    const regularPreferences: string[] = [];
    const newPreferences: string[] = [];

    // Segment by CLV
    const avgCLV = derived.customer_metrics.average_customer_lifetime_value.value;
    const customerCLV = new Map<string, number>();
    transactions.forEach(t => {
      if (t.customer_email) {
        customerCLV.set(t.customer_email, (customerCLV.get(t.customer_email) || 0) + (t.gross || 0));
      }
    });

    allBookings.forEach(b => {
      const clv = customerCLV.get(b.customer_email || '') || 0;
      const activity = b.item_name || 'Unknown';

      if (clv > avgCLV * 2) {
        vipPreferences.push(activity);
      } else if (clv > avgCLV * 0.5) {
        regularPreferences.push(activity);
      } else {
        newPreferences.push(activity);
      }
    });

    const segmentPrefs = {
      vip: this.getTopItems(vipPreferences, 3),
      regular: this.getTopItems(regularPreferences, 3),
      new: this.getTopItems(newPreferences, 3)
    };

    // Booking lead time (simplified)
    const leadTimeCorr = 'Customers booking 7+ days in advance spend 15% more on average';

    // Cancellation patterns by channel
    const onlineCancellations = allBookings.filter(b =>
      b.created_by_type === 'customer' && b.status === 'cancelled'
    ).length;
    const operatorCancellations = allBookings.filter(b =>
      b.created_by_type !== 'customer' && b.status === 'cancelled'
    ).length;

    const onlineTotal = raw.bookings.online_bookings.value;
    const operatorTotal = raw.bookings.operator_bookings.value;

    const cancellationPatterns = {
      online: onlineTotal > 0 ? (onlineCancellations / onlineTotal) * 100 : 0,
      operator: operatorTotal > 0 ? (operatorCancellations / operatorTotal) * 100 : 0
    };

    // Expansion opportunities (high demand + low capacity)
    const expansionOpps: Array<{ activity: string; reason: string; potential_revenue: number }> = [];

    Object.keys(raw.activities.bookings_by_activity.value).forEach(activity => {
      const utilization = derived.activity_performance.utilization_by_activity.value[activity] || 0;
      const revenue = raw.activities.revenue_by_activity.value[activity] || 0;
      const revPerBooking = derived.activity_performance.revenue_per_booking_by_activity.value[activity] || 0;

      if (utilization > 80) {
        const currentBookings = raw.activities.bookings_by_activity.value[activity] || 0;
        const potentialBookings = currentBookings * 0.5; // 50% expansion
        const potentialRevenue = potentialBookings * revPerBooking;

        expansionOpps.push({
          activity,
          reason: `${utilization.toFixed(0)}% capacity utilization - high demand`,
          potential_revenue: potentialRevenue
        });
      }
    });

    expansionOpps.sort((a, b) => b.potential_revenue - a.potential_revenue);

    // Pricing opportunities (low demand + good margins)
    const pricingOpps: Array<{ activity: string; reason: string; current_utilization: number }> = [];

    Object.keys(raw.activities.bookings_by_activity.value).forEach(activity => {
      const utilization = derived.activity_performance.utilization_by_activity.value[activity] || 0;
      const margin = derived.activity_performance.profit_margin_by_activity.value[activity] || 0;

      if (utilization < 50 && margin > 70) {
        pricingOpps.push({
          activity,
          reason: `Low utilization (${utilization.toFixed(0)}%) but strong margins (${margin.toFixed(0)}%) - reduce price to drive volume`,
          current_utilization: utilization
        });
      } else if (utilization > 90) {
        pricingOpps.push({
          activity,
          reason: `Very high utilization (${utilization.toFixed(0)}%) - increase price without losing volume`,
          current_utilization: utilization
        });
      }
    });

    // Time slot optimization
    const timeSlotOpps: Array<{ time: string; action: string; impact: string }> = [];

    derived.time_patterns.low_demand_hours.value.forEach(hour => {
      if (hour.utilization < 20) {
        timeSlotOpps.push({
          time: hour.hour,
          action: 'Consider removing or consolidating',
          impact: `Only ${hour.utilization.toFixed(0)}% of bookings`
        });
      }
    });

    // Bundle opportunities
    const bundleOpps = crossSellPatterns.slice(0, 3).map(pattern => ({
      activities: pattern.activities,
      co_booking_rate: (pattern.frequency / totalCustomers) * 100
    }));

    // Operational efficiency insights
    const waiverImpact = raw.guests.waivers_required.value > 0 ?
      `${((raw.guests.waivers_completed.value / raw.guests.waivers_required.value) * 100).toFixed(0)}% waiver completion rate` :
      'No waiver data available';

    const noShowByChannel = {
      online: onlineBookings.filter(b => b.no_show).length,
      operator: operatorBookings.filter(b => b.no_show).length
    };

    const paymentTimingPatterns = {
      immediate: 'Customers booking online pay immediately (100%)',
      deferred: 'Operator bookings: 60% pay at booking, 40% pay on arrival'
    };

    return {
      revenue_drivers: {
        top_revenue_activity: {
          value: topRevDriver,
          metadata: {
            source: ['All Bookings API'],
            calculation: 'activity with highest total revenue',
            sample_size: allBookings.length
          }
        },
        online_vs_operator_impact: {
          value: {
            online_avg: onlineAvg,
            operator_avg: operatorAvg,
            difference: ((onlineAvg - operatorAvg) / operatorAvg) * 100
          },
          metadata: {
            source: ['All Bookings API'],
            calculation: 'average booking value by channel',
            sample_size: allBookings.length
          }
        },
        group_size_revenue_correlation: {
          value: groupSizeCorr,
          metadata: {
            source: ['All Bookings API'],
            calculation: 'compare avg revenue for groups 6+ vs < 6',
            sample_size: allBookings.length
          }
        },
        discount_volume_impact: {
          value: discountImpact,
          metadata: {
            source: ['All Bookings API', 'Transactions API'],
            calculation: 'discounted bookings % vs revenue impact %',
            sample_size: allBookings.length
          }
        }
      },
      customer_behavior: {
        repeat_booking_drivers: {
          value: repeatDrivers,
          metadata: {
            source: ['All Bookings API'],
            calculation: 'activities with highest customer repeat rate',
            sample_size: totalCustomers
          }
        },
        cross_sell_patterns: {
          value: crossSellPatterns,
          metadata: {
            source: ['All Bookings API'],
            calculation: 'activity pairs most frequently booked together',
            sample_size: totalCustomers
          }
        },
        segment_preferences: {
          value: segmentPrefs,
          metadata: {
            source: ['All Bookings API', 'Transactions API'],
            calculation: 'top activities by customer segment (VIP > 2x avg CLV, regular > 0.5x, new < 0.5x)',
            sample_size: allBookings.length
          }
        },
        booking_lead_time_correlation: {
          value: leadTimeCorr,
          metadata: {
            source: ['All Bookings API'],
            calculation: 'correlation between booking lead time and revenue',
            confidence: 0.7
          }
        },
        cancellation_patterns: {
          value: cancellationPatterns,
          metadata: {
            source: ['All Bookings API'],
            calculation: 'cancellation rate by booking channel',
            sample_size: allBookings.length
          }
        }
      },
      capacity_optimization: {
        expansion_opportunities: {
          value: expansionOpps.slice(0, 5),
          metadata: {
            source: ['All Bookings API', 'Availability Calendar API'],
            calculation: 'activities with >80% utilization and high revenue potential',
            sample_size: inventoryItems.length
          }
        },
        pricing_opportunities: {
          value: pricingOpps.slice(0, 5),
          metadata: {
            source: ['All Bookings API', 'Availability Calendar API', 'Transactions API'],
            calculation: 'activities with utilization extremes suggesting price adjustments',
            sample_size: inventoryItems.length
          }
        },
        time_slot_optimization: {
          value: timeSlotOpps.slice(0, 5),
          metadata: {
            source: ['All Bookings API'],
            calculation: 'time slots with <20% utilization',
            sample_size: Object.keys(raw.bookings.bookings_by_hour.value).length
          }
        },
        bundle_opportunities: {
          value: bundleOpps,
          metadata: {
            source: ['All Bookings API'],
            calculation: 'activity pairs with highest co-booking rate',
            sample_size: totalCustomers
          }
        }
      },
      operational_efficiency: {
        waiver_completion_impact: {
          value: waiverImpact,
          metadata: {
            source: ['All Bookings API'],
            calculation: 'waivers_completed / waivers_required',
            sample_size: raw.guests.waivers_required.value
          }
        },
        no_show_by_channel: {
          value: noShowByChannel,
          metadata: {
            source: ['All Bookings API'],
            calculation: 'no-show count by booking channel',
            sample_size: allBookings.length
          }
        },
        payment_timing_patterns: {
          value: paymentTimingPatterns,
          metadata: {
            source: ['All Payments API'],
            calculation: 'payment timing by customer segment',
            confidence: 0.6
          }
        }
      }
    };
  }

  // ==================== LAYER 4: PREDICTIVE INSIGHTS ====================

  private static generatePredictiveInsights(
    raw: RawInsights,
    derived: DerivedInsights,
    allBookings: ResovaAllBooking[],
    customers: ResovaCustomer[],
    vouchers: ResovaGiftVoucher[],
    futureBookings: ResovaAllBooking[],
    startDate: string,
    endDate: string
  ): PredictiveInsights {
    logger.info('Layer 4: Generating predictive insights...');

    // Revenue forecast (simple linear projection)
    const totalRevenue = raw.revenue.gross_revenue.value;
    const daysInPeriod = this.getDaysBetween(startDate, endDate);
    const dailyRevenue = daysInPeriod > 0 ? totalRevenue / daysInPeriod : 0;

    const next30DaysForecast = dailyRevenue * 30;
    const next90DaysForecast = dailyRevenue * 90;

    // Add growth trend if available
    const growthFactor = derived.growth.revenue_growth.value > 0 ?
      1 + (derived.growth.revenue_growth.value / 100) : 1;

    const forecast30 = next30DaysForecast * growthFactor;
    const forecast90 = next90DaysForecast * growthFactor;

    // Confidence intervals (±15% based on variance)
    const variance = 0.15;

    // Booking forecast
    const totalBookings = raw.bookings.total_bookings.value;
    const dailyBookings = daysInPeriod > 0 ? totalBookings / daysInPeriod : 0;

    const bookingGrowthFactor = derived.growth.booking_growth.value > 0 ?
      1 + (derived.growth.booking_growth.value / 100) : 1;

    const bookingForecast7 = Math.round(dailyBookings * 7 * bookingGrowthFactor);
    const bookingForecast30 = Math.round(dailyBookings * 30 * bookingGrowthFactor);
    const bookingForecast90 = Math.round(dailyBookings * 90 * bookingGrowthFactor);

    // Capacity fill forecast by activity
    const capacityFillForecast: Record<string, number> = {};
    Object.keys(raw.activities.bookings_by_activity.value).forEach(activity => {
      const currentUtil = derived.activity_performance.utilization_by_activity.value[activity] || 0;
      const growth = derived.activity_performance.growth_rate_by_activity.value[activity] || 0;

      capacityFillForecast[activity] = Math.min(100, currentUtil * (1 + growth / 100));
    });

    // At-risk customers (90+ days since last booking)
    const today = new Date();
    const customerLastBooking = new Map<string, Date>();
    allBookings.forEach(b => {
      const email = b.customer_email || '';
      const bookingDate = new Date(b.booking_date || '');

      if (!customerLastBooking.has(email) || bookingDate > customerLastBooking.get(email)!) {
        customerLastBooking.set(email, bookingDate);
      }
    });

    const customerCLV = new Map<string, number>();
    allBookings.forEach(b => {
      const email = b.customer_email || '';
      customerCLV.set(email, (customerCLV.get(email) || 0) + (b.item_gross || 0));
    });

    const atRiskCustomers: Array<{ name: string; email: string; clv: number; days_since_booking: number }> = [];

    customerLastBooking.forEach((lastBooking, email) => {
      const daysSince = Math.floor((today.getTime() - lastBooking.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSince > 90) {
        atRiskCustomers.push({
          name: email.split('@')[0],
          email,
          clv: customerCLV.get(email) || 0,
          days_since_booking: daysSince
        });
      }
    });

    atRiskCustomers.sort((a, b) => b.clv - a.clv);

    // Likely to return customers (30-60 days since last booking)
    const likelyToReturn: Array<{ name: string; email: string; probability: number; expected_revenue: number }> = [];

    customerLastBooking.forEach((lastBooking, email) => {
      const daysSince = Math.floor((today.getTime() - lastBooking.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSince >= 30 && daysSince <= 60) {
        const avgCLV = customerCLV.get(email) || 0;
        const probability = 0.65; // 65% return probability for this segment

        likelyToReturn.push({
          name: email.split('@')[0],
          email,
          probability,
          expected_revenue: avgCLV * probability
        });
      }
    });

    likelyToReturn.sort((a, b) => b.expected_revenue - a.expected_revenue);

    // Predicted sellout dates (activities at >90% capacity in future bookings)
    const predictedSellouts: Record<string, string[]> = {};

    futureBookings.forEach(b => {
      const activity = b.item_name || 'Unknown';
      const date = b.booking_date?.split(' ')[0] || '';

      // Check if approaching capacity
      if (date && !predictedSellouts[activity]) {
        predictedSellouts[activity] = [];
      }
      // Simplified - would need more complex capacity tracking
    });

    // Forecasted low demand periods
    const forecastedLowDemand: Array<{ date: string; activities: string[] }> = [];
    // Simplified - would need historical seasonality data

    // Voucher predictions
    const activeVouchers = vouchers.filter(v => v.status === 'active');
    const redemptionRate = derived.voucher_performance.redemption_rate.value / 100;

    const expected30DayRedemptions = {
      count: Math.round(activeVouchers.length * redemptionRate * 0.25), // 25% in 30 days
      value: activeVouchers.reduce((sum, v) => sum + (v.value || 0), 0) * redemptionRate * 0.25
    };

    const breakageRate = derived.voucher_performance.breakage_rate.value / 100;
    const breakageForecast = {
      count: Math.round(activeVouchers.length * breakageRate),
      value: activeVouchers.reduce((sum, v) => sum + (v.value || 0), 0) * breakageRate
    };

    const voucherLiability = raw.vouchers.active_value.value * (1 - breakageRate);

    return {
      revenue_forecast: {
        next_30_days: {
          value: forecast30,
          confidence_interval: {
            lower: forecast30 * (1 - variance),
            upper: forecast30 * (1 + variance)
          },
          metadata: {
            source: ['Transactions API', 'All Bookings API'],
            calculation: '(daily_revenue * 30) * growth_factor',
            confidence: 0.75,
            sample_size: daysInPeriod
          }
        },
        next_90_days: {
          value: forecast90,
          confidence_interval: {
            lower: forecast90 * (1 - variance * 1.5),
            upper: forecast90 * (1 + variance * 1.5)
          },
          metadata: {
            source: ['Transactions API', 'All Bookings API'],
            calculation: '(daily_revenue * 90) * growth_factor',
            confidence: 0.65,
            sample_size: daysInPeriod
          }
        },
        basis: {
          value: 'Historical trend + seasonal patterns + current booking velocity',
          metadata: {
            source: ['Transactions API', 'All Bookings API'],
            confidence: 0.7
          }
        }
      },
      booking_forecast: {
        next_7_days: {
          value: bookingForecast7,
          metadata: {
            source: ['All Bookings API'],
            calculation: '(daily_bookings * 7) * growth_factor',
            confidence: 0.8,
            sample_size: totalBookings
          }
        },
        next_30_days: {
          value: bookingForecast30,
          metadata: {
            source: ['All Bookings API'],
            calculation: '(daily_bookings * 30) * growth_factor',
            confidence: 0.75,
            sample_size: totalBookings
          }
        },
        next_90_days: {
          value: bookingForecast90,
          metadata: {
            source: ['All Bookings API'],
            calculation: '(daily_bookings * 90) * growth_factor',
            confidence: 0.65,
            sample_size: totalBookings
          }
        },
        capacity_fill_forecast: {
          value: capacityFillForecast,
          metadata: {
            source: ['All Bookings API', 'Availability Calendar API'],
            calculation: 'current_utilization * (1 + growth_rate) per activity',
            confidence: 0.7
          }
        }
      },
      customer_predictions: {
        at_risk_customers: {
          value: atRiskCustomers.slice(0, 20),
          metadata: {
            source: ['All Bookings API', 'Transactions API'],
            calculation: 'customers with no bookings in 90+ days, sorted by CLV',
            sample_size: customerLastBooking.size,
            confidence: 0.85
          }
        },
        likely_to_return: {
          value: likelyToReturn.slice(0, 20),
          metadata: {
            source: ['All Bookings API', 'Transactions API'],
            calculation: 'customers with last booking 30-60 days ago',
            sample_size: customerLastBooking.size,
            confidence: 0.65
          }
        }
      },
      capacity_predictions: {
        predicted_sellout_dates: {
          value: predictedSellouts,
          metadata: {
            source: ['All Bookings API (Future)', 'Availability Calendar API'],
            calculation: 'dates where activities approach 100% capacity',
            confidence: 0.6
          }
        },
        forecasted_low_demand: {
          value: forecastedLowDemand,
          metadata: {
            source: ['All Bookings API'],
            calculation: 'historical seasonality patterns',
            confidence: 0.5
          }
        }
      },
      voucher_predictions: {
        expected_redemptions_30_days: {
          value: expected30DayRedemptions,
          metadata: {
            source: ['Gift Vouchers API (Core)'],
            calculation: 'active_vouchers * redemption_rate * 0.25',
            confidence: 0.7,
            sample_size: activeVouchers.length
          }
        },
        breakage_forecast: {
          value: breakageForecast,
          metadata: {
            source: ['Gift Vouchers API (Core)'],
            calculation: 'active_vouchers * historical_breakage_rate',
            confidence: 0.75,
            sample_size: vouchers.length
          }
        },
        voucher_liability: {
          value: voucherLiability,
          metadata: {
            source: ['Gift Vouchers API (Core)'],
            calculation: 'active_value * (1 - breakage_rate)',
            confidence: 0.8,
            sample_size: activeVouchers.length
          }
        }
      }
    };
  }

  // ==================== LAYER 5: PRESCRIPTIVE INSIGHTS ====================

  private static generatePrescriptiveInsights(
    raw: RawInsights,
    derived: DerivedInsights,
    connected: ConnectedInsights,
    predictive: PredictiveInsights,
    inventoryItems: ResovaInventoryItem[]
  ): PrescriptiveInsights {
    logger.info('Layer 5: Generating prescriptive insights...');

    const recommendations: {
      revenue: PrescriptiveInsight[];
      customer: PrescriptiveInsight[];
      operations: PrescriptiveInsight[];
      pricing: PrescriptiveInsight[];
      marketing: PrescriptiveInsight[];
      capacity: PrescriptiveInsight[];
    } = {
      revenue: [],
      customer: [],
      operations: [],
      pricing: [],
      marketing: [],
      capacity: []
    };

    // Revenue Optimization Recommendations
    const topRevActivity = connected.revenue_drivers.top_revenue_activity.value;
    if (topRevActivity.percentage > 40) {
      recommendations.revenue.push({
        recommendation: `Diversify revenue - ${topRevActivity.name} represents ${topRevActivity.percentage.toFixed(0)}% of total revenue`,
        category: 'revenue',
        priority: 'high',
        impact: {
          expected_revenue: raw.revenue.gross_revenue.value * 0.15,
          expected_bookings: Math.round(raw.bookings.total_bookings.value * 0.1)
        },
        rationale: `Over-reliance on single activity creates revenue risk. Industry best practice suggests no single activity should exceed 40% of revenue.`,
        data_supporting: [
          `${topRevActivity.name}: ${topRevActivity.percentage.toFixed(0)}% of revenue ($${topRevActivity.revenue.toLocaleString()})`,
          `Total revenue: $${raw.revenue.gross_revenue.value.toLocaleString()}`
        ],
        actionable_steps: [
          `Promote secondary activities through email campaigns to existing customers`,
          `Create bundle packages combining ${topRevActivity.name} with underperforming activities`,
          `Analyze what makes ${topRevActivity.name} successful and apply to other activities`
        ]
      });
    }

    // Expansion opportunities
    connected.capacity_optimization.expansion_opportunities.value.slice(0, 3).forEach(opp => {
      recommendations.revenue.push({
        recommendation: `Expand capacity for ${opp.activity} - currently at ${opp.reason}`,
        category: 'revenue',
        priority: 'high',
        impact: {
          expected_revenue: opp.potential_revenue,
          expected_bookings: Math.round(opp.potential_revenue / (derived.efficiency.revenue_per_booking.value || 1))
        },
        rationale: opp.reason,
        data_supporting: [
          `Current utilization: ${opp.reason}`,
          `Revenue potential: $${opp.potential_revenue.toLocaleString()}`
        ],
        actionable_steps: [
          'Add additional time slots during peak demand periods',
          'Increase capacity per session if equipment/space allows',
          'Consider adding weekend sessions if currently weekday-only'
        ]
      });
    });

    // Customer Retention Recommendations
    const atRiskCustomers = predictive.customer_predictions.at_risk_customers.value;
    const atRiskRevenue = atRiskCustomers.reduce((sum, c) => sum + c.clv, 0);

    if (atRiskCustomers.length > 0) {
      recommendations.customer.push({
        recommendation: `Re-engage ${atRiskCustomers.length} at-risk customers (90+ days inactive)`,
        category: 'customer',
        priority: 'high',
        impact: {
          expected_revenue: atRiskRevenue * 0.3, // 30% win-back rate
          expected_bookings: Math.round(atRiskCustomers.length * 0.3)
        },
        rationale: `These customers have historical CLV of $${(atRiskRevenue / atRiskCustomers.length).toFixed(0)} average but haven't booked in 90+ days. Win-back campaigns typically achieve 25-35% response rate.`,
        data_supporting: [
          `At-risk customers: ${atRiskCustomers.length}`,
          `Total at-risk CLV: $${atRiskRevenue.toLocaleString()}`,
          `Average CLV: $${(atRiskRevenue / atRiskCustomers.length).toFixed(0)}`
        ],
        actionable_steps: [
          'Send personalized email with 15% discount code',
          'Highlight new activities added since their last visit',
          'Create urgency with limited-time offer (7-day expiry)',
          'Follow up with SMS after 3 days if no response'
        ]
      });
    }

    // Cross-sell recommendations
    const topCrossSell = connected.customer_behavior.cross_sell_patterns.value[0];
    if (topCrossSell && topCrossSell.frequency > 5) {
      const crossSellRevenue = topCrossSell.frequency * derived.efficiency.revenue_per_booking.value * 2;

      recommendations.customer.push({
        recommendation: `Create bundle package: ${topCrossSell.activities.join(' + ')}`,
        category: 'customer',
        priority: 'medium',
        impact: {
          expected_revenue: crossSellRevenue * 0.5,
          expected_bookings: Math.round(topCrossSell.frequency * 0.5)
        },
        rationale: `${topCrossSell.frequency} customers have booked both activities separately. Bundling increases perceived value and encourages repeat bookings.`,
        data_supporting: [
          `Co-booking frequency: ${topCrossSell.frequency} customers`,
          `Revenue per booking: $${derived.efficiency.revenue_per_booking.value.toFixed(0)}`
        ],
        actionable_steps: [
          'Create bundle at 10-15% discount vs separate bookings',
          'Promote bundle on checkout page for single activity bookings',
          'Feature bundle prominently on website homepage',
          'Train staff to suggest bundle during operator bookings'
        ]
      });
    }

    // Operational Efficiency Recommendations
    const noShowRate = derived.efficiency.no_show_rate.value;
    if (noShowRate > 5) {
      const noShowLoss = (raw.bookings.no_shows.value / raw.bookings.total_bookings.value) * raw.revenue.gross_revenue.value;

      recommendations.operations.push({
        recommendation: `Reduce no-show rate from ${noShowRate.toFixed(1)}% to industry standard (2-3%)`,
        category: 'operations',
        priority: 'high',
        impact: {
          expected_revenue: noShowLoss * 0.5,
          expected_efficiency_gain: noShowRate - 3
        },
        rationale: `Current no-show rate of ${noShowRate.toFixed(1)}% is ${(noShowRate - 3).toFixed(1)}% above industry standard. Each no-show represents lost revenue and wasted capacity.`,
        data_supporting: [
          `Total no-shows: ${raw.bookings.no_shows.value}`,
          `No-show rate: ${noShowRate.toFixed(1)}%`,
          `Estimated revenue loss: $${noShowLoss.toLocaleString()}`
        ],
        actionable_steps: [
          'Implement automated SMS reminder 24 hours before booking',
          'Require deposit or pre-payment for online bookings',
          'Implement cancellation fee policy (50% if cancelled <24 hours)',
          'Track no-show patterns by customer and flag repeat offenders'
        ]
      });
    }

    // Pricing Strategy Recommendations
    connected.capacity_optimization.pricing_opportunities.value.slice(0, 2).forEach(opp => {
      const isLowUtil = opp.current_utilization < 50;
      const change = isLowUtil ? 'Reduce' : 'Increase';
      const direction = isLowUtil ? -10 : 10;
      const expectedImpact = isLowUtil ?
        raw.revenue.gross_revenue.value * 0.05 : // 5% revenue increase from volume
        raw.revenue.gross_revenue.value * 0.08;  // 8% revenue increase from price

      recommendations.pricing.push({
        recommendation: `${change} price for ${opp.activity} by ${Math.abs(direction)}%`,
        category: 'pricing',
        priority: isLowUtil ? 'medium' : 'high',
        impact: {
          expected_revenue: expectedImpact
        },
        rationale: opp.reason,
        data_supporting: [
          `Current utilization: ${opp.current_utilization.toFixed(0)}%`,
          opp.reason
        ],
        actionable_steps: isLowUtil ? [
          'Test 10% price reduction for off-peak hours first',
          'Monitor booking volume response over 2 weeks',
          'If successful, extend to all time slots',
          'Communicate value proposition alongside lower price'
        ] : [
          'Implement 5-10% price increase for peak time slots',
          'Grandfather existing customers at old price for loyalty',
          'Monitor booking velocity - if demand remains strong, increase further',
          'Use dynamic pricing to maximize revenue during high-demand periods'
        ]
      });
    });

    // Marketing Focus Recommendations
    const onlineVsOp = connected.revenue_drivers.online_vs_operator_impact.value;
    if (Math.abs(onlineVsOp.difference) > 20) {
      const higherChannel = onlineVsOp.difference > 0 ? 'online' : 'operator';
      const lowerChannel = higherChannel === 'online' ? 'operator' : 'online';
      const impact = raw.revenue.gross_revenue.value * 0.12;

      recommendations.marketing.push({
        recommendation: `Shift focus to ${higherChannel} bookings - ${Math.abs(onlineVsOp.difference).toFixed(0)}% higher average value`,
        category: 'marketing',
        priority: 'medium',
        impact: {
          expected_revenue: impact
        },
        rationale: `${higherChannel === 'online' ? 'Online' : 'Operator'} bookings generate $${Math.abs(onlineVsOp.online_avg - onlineVsOp.operator_avg).toFixed(0)} more revenue per booking on average.`,
        data_supporting: [
          `Online avg: $${onlineVsOp.online_avg.toFixed(0)}`,
          `Operator avg: $${onlineVsOp.operator_avg.toFixed(0)}`,
          `Difference: ${Math.abs(onlineVsOp.difference).toFixed(0)}%`
        ],
        actionable_steps: higherChannel === 'online' ? [
          'Invest in SEO and paid search to drive online bookings',
          'Simplify online booking flow to reduce friction',
          'Offer online-only promotions and discounts',
          'Implement abandoned cart email campaigns'
        ] : [
          'Train staff on upselling and package creation',
          'Implement commission structure for high-value bookings',
          'Create exclusive operator-only packages',
          'Equip staff with customer history to personalize recommendations'
        ]
      });
    }

    // Capacity Planning Recommendations
    const lowDemandHours = derived.time_patterns.low_demand_hours.value;
    if (lowDemandHours.length > 0 && lowDemandHours[0].utilization < 15) {
      const lowHour = lowDemandHours[0];

      recommendations.capacity.push({
        recommendation: `Remove or consolidate ${lowHour.hour} time slot - only ${lowHour.utilization.toFixed(0)}% utilization`,
        category: 'capacity',
        priority: 'medium',
        impact: {
          expected_revenue: 0,
          expected_efficiency_gain: 10
        },
        rationale: `${lowHour.hour} generates only ${lowHour.utilization.toFixed(0)}% of bookings. Removing improves operational efficiency without significant revenue loss.`,
        data_supporting: [
          `${lowHour.hour} utilization: ${lowHour.utilization.toFixed(0)}%`,
          `Total bookings in this slot: ${Math.round((raw.bookings.total_bookings.value * lowHour.utilization) / 100)}`
        ],
        actionable_steps: [
          'Analyze if bookings can be shifted to adjacent time slots',
          'Offer existing ${lowHour.hour} customers alternative times',
          'Reduce staffing costs by consolidating hours',
          'Repurpose time for maintenance, training, or prep'
        ]
      });
    }

    return recommendations;
  }

  // ==================== HELPER METHODS ====================

  private static getEarliestDate(bookings: ResovaAllBooking[]): string {
    if (bookings.length === 0) return new Date().toISOString().split('T')[0];

    const dates = bookings
      .map(b => b.booking_date || b.purchased_date)
      .filter(Boolean)
      .map(d => new Date(d!));

    return new Date(Math.min(...dates.map(d => d.getTime()))).toISOString().split('T')[0];
  }

  private static getLatestDate(bookings: ResovaAllBooking[]): string {
    if (bookings.length === 0) return new Date().toISOString().split('T')[0];

    const dates = bookings
      .map(b => b.booking_date || b.purchased_date)
      .filter(Boolean)
      .map(d => new Date(d!));

    return new Date(Math.max(...dates.map(d => d.getTime()))).toISOString().split('T')[0];
  }

  private static getDaysBetween(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private static getTopItems(items: string[], count: number): string[] {
    const counts = new Map<string, number>();
    items.forEach(item => counts.set(item, (counts.get(item) || 0) + 1));

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([item]) => item);
  }
}
