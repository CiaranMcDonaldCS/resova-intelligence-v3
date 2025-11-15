'use client';

import React from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  Package,
  FileText,
  TrendingDown,
  XCircle,
  ChevronRight,
} from 'lucide-react';
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
}

/**
 * Attention Required - Critical Alerts & Action Items
 * Displays items that need immediate attention from the business owner
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
    });
  }

  // Check for low stock items
  const lowStockCount = 2; // This would come from actual data
  if (lowStockCount > 0) {
    attentionItems.push({
      id: 'low-stock',
      type: 'warning',
      category: 'inventory',
      title: `${lowStockCount} extras running low on stock`,
      description: 'Items need restocking to avoid shortages',
      action: 'Review inventory',
      priority: 'medium',
    });
  }

  // Check for at-risk customers (haven't visited in 90+ days)
  const atRiskCustomers = 12; // This would come from actual data
  if (atRiskCustomers > 0) {
    attentionItems.push({
      id: 'at-risk-customers',
      type: 'info',
      category: 'customer',
      title: `${atRiskCustomers} customers at risk of churn`,
      description: "Haven't visited in the last 90 days",
      metric: `$${(atRiskCustomers * 150).toLocaleString()} potential revenue`,
      action: 'Send re-engagement campaign',
      priority: 'medium',
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
    });
  }

  // Sort by priority
  const sortedItems = attentionItems.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // If no items, don't render
  if (sortedItems.length === 0) return null;

  const getIcon = (category: string) => {
    switch (category) {
      case 'voucher':
        return <Clock className="w-5 h-5" />;
      case 'inventory':
        return <Package className="w-5 h-5" />;
      case 'customer':
        return <TrendingDown className="w-5 h-5" />;
      case 'waiver':
        return <FileText className="w-5 h-5" />;
      case 'financial':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: 'critical' | 'warning' | 'info') => {
    switch (type) {
      case 'critical':
        return {
          border: 'border-[#EF4444]',
          icon: 'text-[#EF4444]',
        };
      case 'warning':
        return {
          border: 'border-[#F59E0B]',
          icon: 'text-[#F59E0B]',
        };
      case 'info':
        return {
          border: 'border-[#3D8DDA]',
          icon: 'text-[#3D8DDA]',
        };
    }
  };

  return (
    <div className="bg-[#1D212B] border border-[#383838] rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#F59E0B] text-xl">
            warning
          </span>
          <h2 className="text-base font-semibold text-white">
            Attention Required
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#A0A0A0]">
            {sortedItems.length} {sortedItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {/* Attention Items */}
      <div className="space-y-2">
        {sortedItems.map((item) => {
          const colors = getTypeColor(item.type);
          return (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className={`w-full text-left bg-[#121212] border ${colors.border} rounded-lg p-3 hover:border-[#3D8DDA] transition-all duration-200 group`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`flex-shrink-0 ${colors.icon}`}>
                  {getIcon(item.category)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-medium text-white">
                      {item.title}
                    </h3>
                    {item.priority === 'high' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#EF4444] text-white flex-shrink-0">
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#A0A0A0] mb-2">
                    {item.description}
                  </p>

                  {/* Metric & Action */}
                  <div className="flex items-center justify-between">
                    {item.metric && (
                      <span className="text-xs font-medium text-white">
                        {item.metric}
                      </span>
                    )}
                    {item.action && (
                      <div className="flex items-center gap-1 text-xs text-[#3D8DDA] group-hover:text-[#2c79c1]">
                        <span>{item.action}</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* View All Link */}
      <button className="w-full mt-3 text-xs text-[#A0A0A0] hover:text-white transition-colors text-center">
        View all alerts →
      </button>
    </div>
  );
}
