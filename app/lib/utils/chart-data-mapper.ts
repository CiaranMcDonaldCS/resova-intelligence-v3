/**
 * Chart Data Mapper
 * Maps ChartSpec to actual chart data from AnalyticsData
 */

import { AnalyticsData, ChartSpec, ChartDataSource, ChartType } from '@/app/types/analytics';

export interface MappedChart {
  type: ChartType;
  title: string;
  description: string;
  data: any[];
  dataKey?: string;
}

/**
 * Map a ChartSpec to actual chart data from AnalyticsData
 */
export function mapChartSpecToData(
  spec: ChartSpec,
  analyticsData: AnalyticsData
): MappedChart {
  const data = getDataForSource(spec.dataSource, analyticsData);

  return {
    type: spec.type,
    title: spec.title,
    description: spec.description,
    data,
  };
}

/**
 * Map multiple ChartSpecs to chart data
 */
export function mapChartSpecsToData(
  specs: ChartSpec[],
  analyticsData: AnalyticsData
): MappedChart[] {
  return specs.map(spec => mapChartSpecToData(spec, analyticsData));
}

/**
 * Get chart data for a specific data source
 */
function getDataForSource(
  source: ChartDataSource,
  analyticsData: AnalyticsData
): any[] {
  switch (source) {
    case 'revenue_trend':
      return analyticsData.revenueTrends.map(item => ({
        name: item.day,
        value: item.thisGross,
        previous: item.prevGross,
      }));

    case 'payment_status':
      return [
        {
          name: 'Paid',
          value: analyticsData.paymentCollection.paidAmount,
          percent: analyticsData.paymentCollection.paidPercent,
        },
        {
          name: 'Unpaid',
          value: analyticsData.paymentCollection.unpaidAmount,
          percent: analyticsData.paymentCollection.unpaidPercent,
        },
      ];

    case 'bookings_by_day':
      return analyticsData.salesMetrics.map(item => ({
        name: item.day,
        value: item.bookings,
        avgRevenue: item.avgRev,
      }));

    case 'bookings_by_service':
      // Get top purchased items
      return analyticsData.topPurchased.items.slice(0, 5).map(item => ({
        name: item.name,
        value: item.amount,
      }));

    case 'revenue_by_service':
      // Get revenue by item from top purchased
      return analyticsData.topPurchased.items.slice(0, 5).map(item => ({
        name: item.name,
        value: item.amount,
      }));

    case 'guest_trend':
      return analyticsData.guestMetrics.map(item => ({
        name: item.day,
        value: item.totalGuests,
        avgRevenue: item.avgRevPerGuest,
      }));

    case 'sales_metrics':
      return analyticsData.salesMetrics.map(item => ({
        name: item.day,
        bookings: item.bookings,
        avgRevenue: item.avgRev,
      }));

    case 'guest_metrics':
      return analyticsData.guestMetrics.map(item => ({
        name: item.day,
        guests: item.totalGuests,
        avgRevenue: item.avgRevPerGuest,
      }));

    default:
      // Fallback to revenue trend
      return analyticsData.revenueTrends.map(item => ({
        name: item.day,
        value: item.thisGross,
      }));
  }
}
