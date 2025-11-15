'use client';

import React, { useState, useEffect } from 'react';
import { AnalyticsData } from '@/app/types/analytics';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  X,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';

interface Insight {
  id: string;
  type: 'alert' | 'warning' | 'success' | 'info' | 'opportunity';
  title: string;
  message: string;
  metric?: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
}

interface ProactiveInsightsProps {
  analyticsData?: AnalyticsData;
  onInsightClick?: (insight: Insight) => void;
}

/**
 * Proactive Insights Component
 * Automatically surfaces critical insights, alerts, and opportunities
 * without the user needing to ask
 */
export default function ProactiveInsights({ analyticsData, onInsightClick }: ProactiveInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(true);

  // Generate insights from analytics data
  useEffect(() => {
    if (!analyticsData) return;

    const newInsights: Insight[] = [];
    const now = new Date();

    // Check for significant revenue changes
    if (analyticsData.periodSummary.grossChange < -10) {
      newInsights.push({
        id: 'revenue-decline',
        type: 'alert',
        title: 'Revenue Decline Alert',
        message: `Revenue is down ${Math.abs(analyticsData.periodSummary.grossChange)}% this period. Immediate attention required.`,
        metric: `$${analyticsData.periodSummary.gross.toLocaleString()}`,
        action: 'Analyze revenue trends',
        priority: 'high',
        timestamp: now,
      });
    } else if (analyticsData.periodSummary.grossChange > 20) {
      newInsights.push({
        id: 'revenue-growth',
        type: 'success',
        title: 'Strong Revenue Growth',
        message: `Revenue is up ${analyticsData.periodSummary.grossChange}% this period! Great momentum.`,
        metric: `$${analyticsData.periodSummary.gross.toLocaleString()}`,
        action: 'View breakdown',
        priority: 'medium',
        timestamp: now,
      });
    }

    // Check capacity utilization
    if (analyticsData.capacityAnalysis) {
      const avgUtilization = analyticsData.capacityAnalysis.overall.utilizationPercent;

      if (avgUtilization < 50) {
        newInsights.push({
          id: 'low-capacity',
          type: 'opportunity',
          title: 'Low Capacity Utilization',
          message: `Only ${avgUtilization.toFixed(1)}% capacity utilized. Opportunity to increase bookings.`,
          metric: `${avgUtilization.toFixed(1)}%`,
          action: 'Optimize scheduling',
          priority: 'medium',
          timestamp: now,
        });
      } else if (avgUtilization > 90) {
        newInsights.push({
          id: 'high-capacity',
          type: 'warning',
          title: 'Near Capacity Limit',
          message: `${avgUtilization.toFixed(1)}% capacity utilized. Consider expanding available slots.`,
          metric: `${avgUtilization.toFixed(1)}%`,
          action: 'Review capacity',
          priority: 'high',
          timestamp: now,
        });
      }
    }

    // Check payment collection
    if (analyticsData.paymentCollection.unpaidPercent > 20) {
      newInsights.push({
        id: 'unpaid-payments',
        type: 'warning',
        title: 'High Unpaid Balance',
        message: `${analyticsData.paymentCollection.unpaidPercent}% of payments are unpaid ($${analyticsData.paymentCollection.unpaidAmount.toLocaleString()}).`,
        metric: `${analyticsData.paymentCollection.unpaidPercent}%`,
        action: 'Review payment collection',
        priority: 'high',
        timestamp: now,
      });
    }

    // Check guest trends
    if (analyticsData.guestSummary.totalChange < -15) {
      newInsights.push({
        id: 'guest-decline',
        type: 'alert',
        title: 'Guest Count Declining',
        message: `Guest numbers down ${Math.abs(analyticsData.guestSummary.totalChange)}%. Marketing attention needed.`,
        metric: `${analyticsData.guestSummary.totalGuests} guests`,
        action: 'Analyze guest trends',
        priority: 'high',
        timestamp: now,
      });
    }

    // Check repeat customer rate
    if (analyticsData.guestSummary.repeatCustomers < 30) {
      newInsights.push({
        id: 'low-retention',
        type: 'opportunity',
        title: 'Low Customer Retention',
        message: `Only ${analyticsData.guestSummary.repeatCustomers}% repeat customers. Opportunity to improve loyalty.`,
        metric: `${analyticsData.guestSummary.repeatCustomers}%`,
        action: 'Build loyalty program',
        priority: 'medium',
        timestamp: now,
      });
    }

    // Check for no-shows
    if (analyticsData.guestSummary.noShows > 10) {
      newInsights.push({
        id: 'high-no-shows',
        type: 'warning',
        title: 'High No-Show Rate',
        message: `${analyticsData.guestSummary.noShows} no-shows this period. Consider reminder system.`,
        metric: `${analyticsData.guestSummary.noShows} no-shows`,
        action: 'Reduce no-shows',
        priority: 'medium',
        timestamp: now,
      });
    }

    // Check today's agenda
    if (analyticsData.todaysAgenda.waiversRequired > 0) {
      newInsights.push({
        id: 'waivers-required',
        type: 'info',
        title: 'Waivers Pending',
        message: `${analyticsData.todaysAgenda.waiversRequired} waivers required for today's bookings.`,
        metric: `${analyticsData.todaysAgenda.waiversRequired} waivers`,
        action: 'Review waivers',
        priority: 'low',
        timestamp: now,
      });
    }

    // Customer intelligence insights
    if (analyticsData.businessInsights?.customerIntelligence) {
      const customer = analyticsData.businessInsights.customerIntelligence;

      // At-risk customers
      if (customer.segments.atRisk.count > 0) {
        newInsights.push({
          id: 'at-risk-customers',
          type: 'opportunity',
          title: 'Customers at Risk of Churning',
          message: `${customer.segments.atRisk.count} high-value customers haven't visited in 90+ days. Re-engagement opportunity worth $${customer.segments.atRisk.totalRevenue.toFixed(0)}.`,
          metric: `${customer.segments.atRisk.count} customers`,
          action: 'Launch re-engagement campaign',
          priority: 'high',
          timestamp: now,
        });
      }

      // VIP growth opportunity
      if (customer.segments.regular.count > customer.segments.vip.count * 2) {
        newInsights.push({
          id: 'vip-opportunity',
          title: 'VIP Upgrade Opportunity',
          type: 'opportunity',
          message: `${customer.segments.regular.count} regular customers close to VIP status. Small incentive could convert them.`,
          metric: `${customer.segments.regular.count} regulars`,
          action: 'Create VIP upgrade campaign',
          priority: 'medium',
          timestamp: now,
        });
      }
    }

    // Voucher insights
    if (analyticsData.businessInsights?.voucherIntelligence) {
      const voucher = analyticsData.businessInsights.voucherIntelligence;

      if (voucher.overview.outstanding_balance > 5000) {
        newInsights.push({
          id: 'voucher-liability',
          type: 'info',
          title: 'Outstanding Voucher Liability',
          message: `$${voucher.overview.outstanding_balance.toFixed(0)} in unredeemed vouchers. Monitor for accounting.`,
          metric: `$${voucher.overview.outstanding_balance.toFixed(0)}`,
          action: 'View voucher details',
          priority: 'low',
          timestamp: now,
        });
      }

      if (voucher.overview.redemption_rate < 50) {
        newInsights.push({
          id: 'low-redemption',
          type: 'opportunity',
          title: 'Low Voucher Redemption',
          message: `Only ${voucher.overview.redemption_rate.toFixed(1)}% redemption rate. Encourage voucher usage with reminders.`,
          metric: `${voucher.overview.redemption_rate.toFixed(1)}%`,
          action: 'Send voucher reminders',
          priority: 'low',
          timestamp: now,
        });
      }
    }

    // Cart abandonment
    if (analyticsData.businessInsights?.conversionIntelligence) {
      const conversion = analyticsData.businessInsights.conversionIntelligence;

      if (conversion.cart_abandonment.abandoned_value > 1000) {
        newInsights.push({
          id: 'cart-abandonment',
          type: 'opportunity',
          title: 'Significant Cart Abandonment',
          message: `$${conversion.cart_abandonment.abandoned_value.toFixed(0)} in abandoned carts. Recovery emails could recapture $${conversion.recovery_opportunity.projected_recovered_revenue.toFixed(0)}.`,
          metric: `$${conversion.cart_abandonment.abandoned_value.toFixed(0)}`,
          action: 'Launch cart recovery campaign',
          priority: 'high',
          timestamp: now,
        });
      }
    }

    // Sort by priority and filter dismissed
    const sortedInsights = newInsights
      .filter(insight => !dismissed.has(insight.id))
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 5); // Show top 5 insights

    setInsights(sortedInsights);
  }, [analyticsData, dismissed]);

  const dismissInsight = (id: string) => {
    setDismissed(prev => new Set([...prev, id]));
  };

  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-[var(--danger)]" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-[var(--warning)]" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-[var(--success)]" />;
      case 'opportunity':
        return <Lightbulb className="w-4 h-4 text-[var(--brand-primary)]" />;
      default:
        return <TrendingUp className="w-4 h-4 text-[var(--text-secondary)]" />;
    }
  };

  const getColor = (type: Insight['type']) => {
    switch (type) {
      case 'alert':
        return 'border-[var(--danger)]/30 bg-[var(--danger)]/5';
      case 'warning':
        return 'border-[var(--warning)]/30 bg-[var(--warning)]/5';
      case 'success':
        return 'border-[var(--success)]/30 bg-[var(--success)]/5';
      case 'opportunity':
        return 'border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/5';
      default:
        return 'border-[var(--text-secondary)]/30 bg-[var(--text-secondary)]/5';
    }
  };

  if (insights.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-[var(--warning)]" />
          <h3 className="text-sm font-semibold text-white">
            Proactive Insights
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-[var(--brand-primary)] text-white text-xs font-medium">
            {insights.length}
          </span>
        </div>
        <ChevronRight
          className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${
            expanded ? 'rotate-90' : ''
          }`}
        />
      </button>

      {/* Insights List */}
      {expanded && (
        <div className="space-y-2">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`relative border rounded-lg p-3 transition-all hover:shadow-lg ${getColor(
                insight.type
              )}`}
            >
              {/* Dismiss Button */}
              <button
                onClick={() => dismissInsight(insight.id)}
                className="absolute top-2 right-2 p-1 rounded hover:bg-[var(--background-secondary)] transition-colors"
                title="Dismiss"
              >
                <X className="w-3 h-3 text-[var(--text-secondary)]" />
              </button>

              {/* Content */}
              <div className="pr-6">
                <div className="flex items-start gap-2 mb-1">
                  {getIcon(insight.type)}
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-white">
                      {insight.title}
                    </h4>
                    {insight.metric && (
                      <p className="text-xs font-semibold text-white mt-0.5">
                        {insight.metric}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed ml-6">
                  {insight.message}
                </p>

                {/* Action Button */}
                {insight.action && (
                  <button
                    onClick={() => onInsightClick?.(insight)}
                    className="mt-2 ml-6 text-xs text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] font-medium flex items-center gap-1"
                  >
                    {insight.action}
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
