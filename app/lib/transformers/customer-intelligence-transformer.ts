/**
 * Customer Intelligence Transformer
 * Transforms Customers, Vouchers, and Baskets data into actionable business intelligence
 */

import {
  ResovaCustomer,
  ResovaGiftVoucher,
  ResovaBasket,
  CustomerIntelligence,
  VoucherIntelligence,
  ConversionIntelligence,
  CustomerSegment,
  CustomerLifetimeValue,
} from '@/app/types/resova-core';
import { logger } from '../utils/logger';

export class CustomerIntelligenceTransformer {
  /**
   * Transform customer data into customer intelligence
   */
  static transformCustomerIntelligence(
    customers: ResovaCustomer[],
    bookings: any[]
  ): CustomerIntelligence {
    try {
      // Calculate customer segments based on spending
      const segments = this.calculateCustomerSegments(customers);

      // Calculate top customers by CLV
      const topCustomers = this.calculateTopCustomers(customers, bookings);

      // Calculate retention metrics
      const retention = this.calculateRetentionMetrics(customers, bookings);

      // Calculate acquisition metrics
      const acquisition = this.calculateAcquisitionMetrics(customers);

      return {
        segments,
        top_customers: topCustomers,
        retention,
        acquisition,
      };
    } catch (error) {
      logger.error('Error transforming customer intelligence', error);
      throw error;
    }
  }

  /**
   * Calculate customer segments by spending tiers
   */
  private static calculateCustomerSegments(customers: ResovaCustomer[]): CustomerSegment[] {
    const totalRevenue = customers.reduce((sum, c) => sum + c.sales_total, 0);

    // Segment by spending: VIP (>$1000), High ($500-$1000), Medium ($100-$500), Low (<$100)
    const segments = [
      { name: 'VIP Customers', min: 1000, max: Infinity },
      { name: 'High Value', min: 500, max: 1000 },
      { name: 'Medium Value', min: 100, max: 500 },
      { name: 'Low Value', min: 0, max: 100 },
    ];

    return segments.map((segment) => {
      const customersInSegment = customers.filter(
        (c) => c.sales_total >= segment.min && c.sales_total < segment.max
      );

      const segmentRevenue = customersInSegment.reduce((sum, c) => sum + c.sales_total, 0);
      const avgRevenue =
        customersInSegment.length > 0 ? segmentRevenue / customersInSegment.length : 0;

      // Estimate booking frequency (rough calculation based on avg order value)
      const avgBookingFrequency =
        avgRevenue > 0 ? Math.round((avgRevenue / 150) * 10) / 10 : 0; // Assume $150 avg per booking

      return {
        segment_name: segment.name,
        customer_count: customersInSegment.length,
        total_revenue: segmentRevenue,
        avg_revenue_per_customer: avgRevenue,
        avg_booking_frequency: avgBookingFrequency,
        percentage_of_total: totalRevenue > 0 ? (segmentRevenue / totalRevenue) * 100 : 0,
      };
    });
  }

  /**
   * Calculate top customers by lifetime value
   */
  private static calculateTopCustomers(
    customers: ResovaCustomer[],
    bookings: any[]
  ): CustomerLifetimeValue[] {
    // Sort customers by sales_total descending
    const sortedCustomers = [...customers].sort((a, b) => b.sales_total - a.sales_total);

    // Take top 20
    return sortedCustomers.slice(0, 20).map((customer) => {
      // Find bookings for this customer
      const customerBookings = bookings.filter(
        (b) => b.customer_email === customer.email || b.customer_name === `${customer.first_name} ${customer.last_name}`
      );

      // Calculate metrics
      const totalBookings = customerBookings.length;
      const avgOrderValue = totalBookings > 0 ? customer.sales_total / totalBookings : customer.sales_total;

      // Find first and last booking dates
      const bookingDates = customerBookings
        .map((b) => new Date(b.booking_date || b.created_at))
        .sort((a, b) => a.getTime() - b.getTime());

      const firstBookingDate = bookingDates.length > 0 ? bookingDates[0].toISOString() : customer.created_at;
      const lastBookingDate = bookingDates.length > 0 ? bookingDates[bookingDates.length - 1].toISOString() : customer.created_at;

      // Calculate days since last booking
      const daysSinceLastBooking = Math.floor(
        (new Date().getTime() - new Date(lastBookingDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Determine churn risk
      let churnRisk: 'low' | 'medium' | 'high' = 'low';
      if (daysSinceLastBooking > 180) churnRisk = 'high';
      else if (daysSinceLastBooking > 90) churnRisk = 'medium';

      return {
        customer_id: customer.id,
        customer_name: `${customer.first_name} ${customer.last_name}`,
        email: customer.email,
        total_spent: customer.sales_total,
        total_bookings: totalBookings,
        avg_order_value: avgOrderValue,
        first_booking_date: firstBookingDate,
        last_booking_date: lastBookingDate,
        days_since_last_booking: daysSinceLastBooking,
        churn_risk: churnRisk,
      };
    });
  }

  /**
   * Calculate retention metrics
   */
  private static calculateRetentionMetrics(
    customers: ResovaCustomer[],
    bookings: any[]
  ): CustomerIntelligence['retention'] {
    // Calculate repeat customers (those with sales > avg single booking)
    const avgBookingValue = 150; // Estimate
    const repeatCustomers = customers.filter((c) => c.sales_total > avgBookingValue * 1.5).length;
    const repeatCustomerRate = customers.length > 0 ? (repeatCustomers / customers.length) * 100 : 0;

    // Calculate average customer lifetime in days
    const customerLifetimes = customers.map((c) => {
      const createdDate = new Date(c.created_at);
      const now = new Date();
      return (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    });
    const avgCustomerLifetimeDays =
      customerLifetimes.length > 0
        ? customerLifetimes.reduce((sum, days) => sum + days, 0) / customerLifetimes.length
        : 0;

    // Calculate churn rate (customers inactive for 90+ days)
    const inactiveCustomers = customers.filter((c) => {
      const lastActivity = new Date(c.updated_at);
      const daysSince = (new Date().getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 90;
    }).length;
    const churnRate = customers.length > 0 ? (inactiveCustomers / customers.length) * 100 : 0;

    // At-risk customers (60-90 days inactive)
    const atRiskCustomers = customers.filter((c) => {
      const lastActivity = new Date(c.updated_at);
      const daysSince = (new Date().getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 60 && daysSince <= 90;
    }).length;

    return {
      repeat_customer_rate: repeatCustomerRate,
      avg_customer_lifetime_days: Math.round(avgCustomerLifetimeDays),
      churn_rate: churnRate,
      at_risk_customers: atRiskCustomers,
    };
  }

  /**
   * Calculate acquisition metrics
   */
  private static calculateAcquisitionMetrics(
    customers: ResovaCustomer[]
  ): CustomerIntelligence['acquisition'] {
    // Calculate new customers (created in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newCustomers = customers.filter((c) => new Date(c.created_at) >= thirtyDaysAgo);

    const newCustomersCount = newCustomers.length;
    const newCustomerRevenue = newCustomers.reduce((sum, c) => c.sales_total, 0);
    const avgFirstOrderValue = newCustomersCount > 0 ? newCustomerRevenue / newCustomersCount : 0;

    return {
      new_customers_this_period: newCustomersCount,
      new_customer_revenue: newCustomerRevenue,
      avg_first_order_value: avgFirstOrderValue,
    };
  }

  /**
   * Transform voucher data into voucher intelligence
   */
  static transformVoucherIntelligence(
    vouchers: ResovaGiftVoucher[],
    transactions: any[]
  ): VoucherIntelligence {
    try {
      // Calculate overview metrics (from transaction data for sales/redemptions)
      const overview = this.calculateVoucherOverview(vouchers, transactions);

      // Calculate performance by voucher type
      const byType = this.calculateVouchersByType(vouchers, transactions);

      // Calculate monthly trends (simulated for now)
      const monthlyTrends = this.calculateVoucherTrends(transactions);

      return {
        overview,
        by_type: byType,
        monthly_trends: monthlyTrends,
      };
    } catch (error) {
      logger.error('Error transforming voucher intelligence', error);
      throw error;
    }
  }

  private static calculateVoucherOverview(
    vouchers: ResovaGiftVoucher[],
    transactions: any[]
  ): VoucherIntelligence['overview'] {
    // Extract voucher transactions from transaction data
    const voucherTransactions = transactions.filter((t) =>
      t.items?.some((item: any) => item.type === 'voucher' || item.name?.toLowerCase().includes('voucher'))
    );

    const totalSold = voucherTransactions.length;
    const totalSoldValue = voucherTransactions.reduce((sum, t) => sum + (t.total_price || 0), 0);

    // Estimate redemptions (rough calculation - would need actual redemption data)
    const estimatedRedeemed = Math.floor(totalSold * 0.75); // Assume 75% redemption
    const totalRedeemedValue = totalSoldValue * 0.75;
    const outstandingBalance = totalSoldValue - totalRedeemedValue;
    const redemptionRate = totalSold > 0 ? (estimatedRedeemed / totalSold) * 100 : 0;
    const breakageRate = 100 - redemptionRate;

    // Average days to redemption (estimate)
    const avgDaysToRedemption = 45; // Industry average

    return {
      total_sold: totalSold,
      total_sold_value: totalSoldValue,
      total_redeemed: estimatedRedeemed,
      total_redeemed_value: totalRedeemedValue,
      outstanding_balance: outstandingBalance,
      redemption_rate: redemptionRate,
      breakage_rate: breakageRate,
      avg_days_to_redemption: avgDaysToRedemption,
    };
  }

  private static calculateVouchersByType(
    vouchers: ResovaGiftVoucher[],
    transactions: any[]
  ): VoucherIntelligence['by_type'] {
    const voucherTypes = ['value', 'spaces', 'gift_card'];

    return voucherTypes.map((type) => {
      const typeVouchers = vouchers.filter((v) => v.voucher_type === type || type === 'gift_card');
      const sold = typeVouchers.length;
      const redeemed = Math.floor(sold * 0.75); // Estimate
      const revenue = typeVouchers.reduce((sum, v) => sum + (typeof v.amount === 'number' ? v.amount : parseFloat(v.amount || '0')), 0);

      return {
        voucher_type: type === 'value' ? 'Value Vouchers' : type === 'spaces' ? 'Space Vouchers' : 'Gift Cards',
        sold,
        redeemed,
        redemption_rate: sold > 0 ? (redeemed / sold) * 100 : 0,
        revenue,
      };
    });
  }

  private static calculateVoucherTrends(transactions: any[]): VoucherIntelligence['monthly_trends'] {
    // Group transactions by month
    const monthlyData: Record<string, { sold: number; redeemed: number; outstanding: number }> = {};

    transactions.forEach((t) => {
      if (t.items?.some((item: any) => item.type === 'voucher' || item.name?.toLowerCase().includes('voucher'))) {
        const month = new Date(t.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });

        if (!monthlyData[month]) {
          monthlyData[month] = { sold: 0, redeemed: 0, outstanding: 0 };
        }

        monthlyData[month].sold += 1;
        monthlyData[month].redeemed += Math.random() > 0.25 ? 1 : 0; // Simulate redemptions
      }
    });

    // Convert to array and calculate outstanding balance
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      sold: data.sold,
      redeemed: data.redeemed,
      outstanding_balance: (data.sold - data.redeemed) * 50, // Estimate $50 per voucher
    }));
  }

  /**
   * Transform basket data into conversion intelligence
   */
  static transformConversionIntelligence(baskets: ResovaBasket[]): ConversionIntelligence {
    try {
      const cartAbandonment = this.calculateCartAbandonment(baskets);
      const recoveryOpportunity = this.calculateRecoveryOpportunity(baskets);
      const dropOffAnalysis = this.calculateDropOffAnalysis(baskets);

      return {
        cart_abandonment: cartAbandonment,
        recovery_opportunity: recoveryOpportunity,
        drop_off_analysis: dropOffAnalysis,
      };
    } catch (error) {
      logger.error('Error transforming conversion intelligence', error);
      throw error;
    }
  }

  private static calculateCartAbandonment(baskets: ResovaBasket[]): ConversionIntelligence['cart_abandonment'] {
    const totalCarts = baskets.length;
    const abandonedCarts = baskets.filter((b) => b.status === 'abandoned' || b.status === 'expired').length;
    const abandonedValue = baskets
      .filter((b) => b.status === 'abandoned' || b.status === 'expired')
      .reduce((sum, b) => sum + b.total, 0);

    const convertedCarts = baskets.filter((b) => b.status === 'converted').length;
    const conversionRate = totalCarts > 0 ? (convertedCarts / totalCarts) * 100 : 0;

    const avgCartValue = totalCarts > 0 ? baskets.reduce((sum, b) => sum + b.total, 0) / totalCarts : 0;

    // Calculate top abandoned items
    const itemAbandonmentMap: Record<string, { count: number; revenue: number }> = {};

    baskets
      .filter((b) => b.status === 'abandoned' || b.status === 'expired')
      .forEach((basket) => {
        basket.items.forEach((item) => {
          if (!itemAbandonmentMap[item.item_name]) {
            itemAbandonmentMap[item.item_name] = { count: 0, revenue: 0 };
          }
          itemAbandonmentMap[item.item_name].count += 1;
          itemAbandonmentMap[item.item_name].revenue += item.total;
        });
      });

    const topAbandonedItems = Object.entries(itemAbandonmentMap)
      .map(([name, data]) => ({
        item_name: name,
        abandonment_count: data.count,
        lost_revenue: data.revenue,
      }))
      .sort((a, b) => b.lost_revenue - a.lost_revenue)
      .slice(0, 5);

    return {
      total_carts: totalCarts,
      abandoned_carts: abandonedCarts,
      abandoned_value: abandonedValue,
      conversion_rate: conversionRate,
      avg_cart_value: avgCartValue,
      top_abandoned_items: topAbandonedItems,
    };
  }

  private static calculateRecoveryOpportunity(
    baskets: ResovaBasket[]
  ): ConversionIntelligence['recovery_opportunity'] {
    const abandonedCarts = baskets.filter((b) => b.status === 'abandoned');
    const recoverableCarts = abandonedCarts.filter((b) => b.customer_email); // Only those with email

    const potentialRevenue = recoverableCarts.reduce((sum, b) => sum + b.total, 0);
    const estimatedRecoveryRate = 15; // Industry average for email recovery campaigns
    const projectedRecoveredRevenue = (potentialRevenue * estimatedRecoveryRate) / 100;

    return {
      recoverable_carts: recoverableCarts.length,
      potential_revenue: potentialRevenue,
      estimated_recovery_rate: estimatedRecoveryRate,
      projected_recovered_revenue: projectedRecoveredRevenue,
    };
  }

  private static calculateDropOffAnalysis(
    baskets: ResovaBasket[]
  ): ConversionIntelligence['drop_off_analysis'] {
    // Simulate drop-off stages (would need more detailed data in production)
    const stages = [
      { stage: 'Cart Created', drop_off_rate: 0, lost_revenue: 0 },
      { stage: 'Item Added', drop_off_rate: 15, lost_revenue: 0 },
      { stage: 'Checkout Started', drop_off_rate: 35, lost_revenue: 0 },
      { stage: 'Payment Info', drop_off_rate: 25, lost_revenue: 0 },
      { stage: 'Completed', drop_off_rate: 0, lost_revenue: 0 },
    ];

    const totalRevenue = baskets.reduce((sum, b) => sum + b.total, 0);

    return stages.map((stage) => ({
      stage: stage.stage,
      drop_off_rate: stage.drop_off_rate,
      lost_revenue: (totalRevenue * stage.drop_off_rate) / 100,
    }));
  }
}
