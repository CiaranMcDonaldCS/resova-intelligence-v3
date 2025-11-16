'use client';

import React from 'react';
import { AnalyticsData } from '@/app/types/analytics';

interface AttentionRequiredProps {
  analyticsData?: AnalyticsData;
  onItemClick?: (item: AttentionItem) => void;
}

interface AttentionItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'voucher' | 'inventory' | 'customer' | 'waiver' | 'financial';
  title: string;
  description: string;
  metric?: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  iconColor: string;
}

/**
 * Attention Required - Critical Alerts & Action Items
 * Displays items that need immediate attention from the business owner
 * Matches HTML mockup design exactly
 */
export default function AttentionRequired({ analyticsData, onItemClick }: AttentionRequiredProps) {
  if (!analyticsData) return null;

  // Generate attention items from analytics data
  const attentionItems: AttentionItem[] = [];

  // Check for expiring vouchers (within 30 days)
  const expiringVouchersCount = 3; // This would come from actual data
  if (expiringVouchersCount > 0) {
    attentionItems.push({
      id: 'expiring-vouchers',
      type: 'warning',
      category: 'voucher',
      title: `${expiringVouchersCount} gift vouchers expiring soon`,
      description: 'Vouchers will expire within the next 30 days',
      metric: '$2,450',
      action: 'Send reminder emails',
      priority: 'high',
      icon: 'priority_high',
      iconColor: 'text-yellow-400',
    });
  }

  // Check for low stock items
  const lowStockCount = 2; // This would come from actual data
  if (lowStockCount > 0) {
    attentionItems.push({
      id: 'low-stock',
      type: 'warning',
      category: 'inventory',
      title: `Saturday is 95% booked`,
      description: 'Consider adding new slots.',
      action: 'Review inventory',
      priority: 'high',
      icon: 'priority_high',
      iconColor: 'text-yellow-400',
    });
  }

  // Check for at-risk customers (haven't visited in 90+ days)
  const atRiskCustomers = 12; // This would come from actual data
  if (atRiskCustomers > 0) {
    attentionItems.push({
      id: 'at-risk-customers',
      type: 'info',
      category: 'customer',
      title: `Weekday booking slump`,
      description: "Bookings are down 40% on Tuesdays.",
      metric: `$${(atRiskCustomers * 150).toLocaleString()} potential revenue`,
      action: 'Send re-engagement campaign',
      priority: 'medium',
      icon: 'trending_down',
      iconColor: 'text-red-400',
    });
  }

  // Check for pending waivers
  const pendingWaivers = analyticsData.todaysAgenda?.waiversRequired || 0;
  if (pendingWaivers > 0) {
    attentionItems.push({
      id: 'pending-waivers',
      type: 'critical',
      category: 'waiver',
      title: `${pendingWaivers} waivers needed for today`,
      description: 'Bookings require waivers before check-in',
      action: 'Send waiver requests',
      priority: 'high',
      icon: 'assignment',
      iconColor: 'text-orange-400',
    });
  }

  // Check for negative revenue trends
  const revenueChange = analyticsData.periodSummary?.grossChange || 0;
  if (revenueChange < -5) {
    attentionItems.push({
      id: 'revenue-decline',
      type: 'critical',
      category: 'financial',
      title: 'Revenue declining',
      description: `Down ${Math.abs(revenueChange).toFixed(1)}% vs last period`,
      metric: `-$${Math.abs(analyticsData.periodSummary.gross * (revenueChange / 100)).toLocaleString()}`,
      action: 'Review pricing & promotions',
      priority: 'high',
      icon: 'trending_down',
      iconColor: 'text-red-400',
    });
  }

  // Sort by priority
  const sortedItems = attentionItems.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // If no items, don't render
  if (sortedItems.length === 0) return null;

  // Take only first 2 items to match mockup
  const displayItems = sortedItems.slice(0, 2);

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg md:text-xl px-1">Attention Required</h3>
      <div className="space-y-4">
        {displayItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onItemClick?.(item)}
            className="w-full bg-[--surface-dark] border border-[--border-color] rounded-xl p-4 flex items-start space-x-4 cursor-pointer hover:bg-white/5 transition-colors"
          >
            <span className={`material-symbols-outlined ${item.iconColor} mt-1`}>
              {item.icon}
            </span>
            <div>
              <p className="font-medium text-white text-base">{item.title}</p>
              <p className="text-sm text-[--text-secondary]">{item.description}</p>
            </div>
            <span className="material-symbols-outlined text-[--text-muted] ml-auto text-lg self-center">
              chevron_right
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
