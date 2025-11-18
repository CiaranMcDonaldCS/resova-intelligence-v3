/**
 * Date Range Parser
 * Detects date range intent from user queries and filters daily breakdown data
 */

import { DailyBreakdown } from '@/app/types/analytics';

export interface DateRangeFilter {
  label: string;
  startDate: string;  // MM/DD/YYYY
  endDate: string;    // MM/DD/YYYY
  previousPeriod?: {
    label: string;
    startDate: string;
    endDate: string;
  };
}

/**
 * Parse user query for date range intent
 * Returns filter if date range detected, null otherwise
 */
export function parseDateRangeFromQuery(query: string): DateRangeFilter | null {
  const lowerQuery = query.toLowerCase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Last week (previous Monday-Sunday)
  if (lowerQuery.match(/\b(last week|previous week)\b/)) {
    const currentDayOfWeek = today.getDay();
    const daysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

    // Last Monday (start of this week)
    const thisMonday = new Date(today);
    thisMonday.setDate(thisMonday.getDate() - daysFromMonday);

    // Previous Sunday (end of last week)
    const prevSunday = new Date(thisMonday);
    prevSunday.setDate(prevSunday.getDate() - 1);

    // Previous Monday (start of last week)
    const prevMonday = new Date(prevSunday);
    prevMonday.setDate(prevMonday.getDate() - 6);

    // Week before last week (for comparison)
    const weekBeforeSunday = new Date(prevMonday);
    weekBeforeSunday.setDate(weekBeforeSunday.getDate() - 1);

    const weekBeforeMonday = new Date(weekBeforeSunday);
    weekBeforeMonday.setDate(weekBeforeMonday.getDate() - 6);

    return {
      label: 'Last week',
      startDate: formatDate(prevMonday),
      endDate: formatDate(prevSunday),
      previousPeriod: {
        label: 'Week before',
        startDate: formatDate(weekBeforeMonday),
        endDate: formatDate(weekBeforeSunday)
      }
    };
  }

  // This week (Monday to today)
  if (lowerQuery.match(/\b(this week|current week)\b/)) {
    const startDate = new Date(today);
    const dayOfWeek = startDate.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysFromMonday);

    return {
      label: 'This week',
      startDate: formatDate(startDate),
      endDate: formatDate(today)
    };
  }

  // This weekend / Last weekend (Saturday-Sunday)
  if (lowerQuery.match(/\b(this weekend|last weekend|this past weekend|previous weekend)\b/)) {
    const currentDayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

    // Determine if asking about "this weekend" or "last weekend"
    const isThisWeekend = lowerQuery.match(/\bthis weekend\b/);

    let thisSaturday: Date, thisSunday: Date;

    // Find the most recent completed weekend (last Saturday-Sunday)
    if (currentDayOfWeek === 0) {
      // Today is Sunday - this weekend is yesterday (Saturday) and today
      thisSaturday = new Date(today);
      thisSaturday.setDate(thisSaturday.getDate() - 1);
      thisSunday = new Date(today);
    } else if (currentDayOfWeek === 6) {
      // Today is Saturday - this weekend is today and tomorrow
      thisSaturday = new Date(today);
      thisSunday = new Date(today);
      thisSunday.setDate(thisSunday.getDate() + 1);
    } else {
      // Weekday - most recent weekend was last Saturday-Sunday
      const daysSinceSaturday = (currentDayOfWeek + 1) % 7; // Days since last Saturday
      thisSaturday = new Date(today);
      thisSaturday.setDate(thisSaturday.getDate() - daysSinceSaturday);
      thisSunday = new Date(thisSaturday);
      thisSunday.setDate(thisSunday.getDate() + 1);
    }

    // Previous weekend (7 days earlier)
    const lastSaturday = new Date(thisSaturday);
    lastSaturday.setDate(lastSaturday.getDate() - 7);
    const lastSunday = new Date(thisSunday);
    lastSunday.setDate(lastSunday.getDate() - 7);

    if (isThisWeekend) {
      return {
        label: 'This weekend',
        startDate: formatDate(thisSaturday),
        endDate: formatDate(thisSunday),
        previousPeriod: {
          label: 'Last weekend',
          startDate: formatDate(lastSaturday),
          endDate: formatDate(lastSunday)
        }
      };
    } else {
      // "Last weekend" or "this past weekend"
      return {
        label: 'Last weekend',
        startDate: formatDate(thisSaturday),
        endDate: formatDate(thisSunday),
        previousPeriod: {
          label: 'Weekend before',
          startDate: formatDate(lastSaturday),
          endDate: formatDate(lastSunday)
        }
      };
    }
  }

  // Last month
  if (lowerQuery.match(/\b(last month|previous month)\b/)) {
    const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endDate = new Date(today.getFullYear(), today.getMonth(), 0);

    return {
      label: 'Last month',
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };
  }

  // This month
  if (lowerQuery.match(/\b(this month|current month)\b/)) {
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);

    return {
      label: 'This month',
      startDate: formatDate(startDate),
      endDate: formatDate(today)
    };
  }

  // Last 7 days
  if (lowerQuery.match(/\b(last 7 days|past 7 days)\b/)) {
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 6);

    return {
      label: 'Last 7 days',
      startDate: formatDate(startDate),
      endDate: formatDate(today)
    };
  }

  // Last 30 days
  if (lowerQuery.match(/\b(last 30 days|past 30 days)\b/)) {
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 29);

    return {
      label: 'Last 30 days',
      startDate: formatDate(startDate),
      endDate: formatDate(today)
    };
  }

  // Yesterday
  if (lowerQuery.match(/\byesterday\b/)) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return {
      label: 'Yesterday',
      startDate: formatDate(yesterday),
      endDate: formatDate(yesterday)
    };
  }

  // Today
  if (lowerQuery.match(/\btoday\b/)) {
    return {
      label: 'Today',
      startDate: formatDate(today),
      endDate: formatDate(today)
    };
  }

  return null;
}

/**
 * Filter daily breakdown to specific date range
 */
export function filterDailyBreakdown(
  dailyBreakdown: DailyBreakdown[],
  filter: DateRangeFilter
): DailyBreakdown[] {
  return dailyBreakdown.filter(day => {
    return day.date >= filter.startDate && day.date <= filter.endDate;
  });
}

/**
 * Calculate aggregate metrics from filtered daily breakdown
 */
export function calculateAggregateMetrics(dailyBreakdown: DailyBreakdown[]) {
  if (dailyBreakdown.length === 0) {
    return {
      totalBookings: 0,
      totalRevenue: 0,
      totalGuests: 0,
      avgBookingsPerDay: 0,
      avgRevenuePerDay: 0,
      avgGuestsPerDay: 0
    };
  }

  const totalBookings = dailyBreakdown.reduce((sum, day) => sum + day.bookings, 0);
  const totalRevenue = dailyBreakdown.reduce((sum, day) => sum + day.revenue, 0);
  const totalGuests = dailyBreakdown.reduce((sum, day) => sum + day.guests, 0);
  const days = dailyBreakdown.length;

  return {
    totalBookings,
    totalRevenue,
    totalGuests,
    avgBookingsPerDay: totalBookings / days,
    avgRevenuePerDay: totalRevenue / days,
    avgGuestsPerDay: totalGuests / days
  };
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Format date as MM/DD/YYYY (to match Resova API format)
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}/${year}`;
}
