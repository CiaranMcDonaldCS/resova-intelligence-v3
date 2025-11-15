'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { AnalyticsData } from '@/app/types/analytics';

interface OwnersBoxProps {
  analyticsData?: AnalyticsData;
}

/**
 * Owner's Box - Premium Executive Summary
 * Inspired by Linear's clean design and Superhuman's focus on what matters
 */
export default function OwnersBox({ analyticsData }: OwnersBoxProps) {
  if (!analyticsData) return null;

  const { periodSummary, todaysAgenda, capacityAnalysis } = analyticsData;

  // Calculate key metrics
  const revenue = periodSummary.gross || 0;
  const revenueChange = periodSummary.grossChange || 0;
  const bookings = todaysAgenda.bookings || 0;
  const guests = todaysAgenda.guests || 0;
  const capacityPercent = capacityAnalysis?.overall?.utilizationPercent || 0;

  // Determine trend direction and color
  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-slate-400';
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="w-4 h-4" />;
    if (value < 0) return <ArrowDownRight className="w-4 h-4" />;
    return null;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const abs = Math.abs(value);
    const sign = value > 0 ? '+' : '';
    return `${sign}${abs.toFixed(1)}%`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            Owner's Box
          </h2>
        </div>
        <div className="text-xs text-slate-400">
          Last 30 days
        </div>
      </div>

      {/* Primary Metric - Revenue */}
      <div className="bg-gradient-to-br from-blue-500/10 via-slate-800 to-slate-800 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">
                Total Revenue
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-1 ${getTrendColor(revenueChange)}`}>
            {getTrendIcon(revenueChange)}
            <span className="text-sm font-semibold">
              {formatPercent(revenueChange)}
            </span>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-4xl font-bold text-white tracking-tight">
            {formatCurrency(revenue)}
          </h3>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {revenueChange > 0 ? 'Strong growth' : revenueChange < 0 ? 'Needs attention' : 'Stable'} compared to previous period
        </p>
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bookings */}
        <MetricCard
          icon={<Calendar className="w-4 h-4" />}
          label="Today's Bookings"
          value={bookings.toString()}
          trend={null}
          iconColor="text-blue-400"
          bgColor="bg-blue-500/10"
        />

        {/* Guests */}
        <MetricCard
          icon={<Users className="w-4 h-4" />}
          label="Expected Guests"
          value={guests.toString()}
          trend={null}
          iconColor="text-purple-400"
          bgColor="bg-purple-500/10"
        />

        {/* Capacity */}
        <MetricCard
          icon={<Activity className="w-4 h-4" />}
          label="Capacity"
          value={capacityPercent > 0 ? `${capacityPercent.toFixed(0)}%` : 'N/A'}
          trend={null}
          iconColor="text-green-400"
          bgColor="bg-green-500/10"
        />
      </div>

      {/* Quick Insights */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          Quick Insights
        </h3>
        <div className="space-y-2">
          <InsightItem
            text={`Revenue ${revenueChange > 0 ? 'up' : 'down'} ${formatPercent(revenueChange)} vs last period`}
            positive={revenueChange > 0}
          />
          <InsightItem
            text={`${bookings} bookings scheduled for today`}
            positive={bookings > 0}
          />
          {capacityPercent > 0 && (
            <InsightItem
              text={`Capacity at ${capacityPercent.toFixed(0)}%`}
              positive={capacityPercent > 50}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Metric Card Component
 */
interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: number | null;
  iconColor: string;
  bgColor: string;
}

function MetricCard({ icon, label, value, trend, iconColor, bgColor }: MetricCardProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-blue-500/30 transition-all duration-200">
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-lg ${bgColor}`}>
          <div className={iconColor}>{icon}</div>
        </div>
        <p className="text-xs text-slate-400 font-medium">
          {label}
        </p>
      </div>
      <div className="flex items-baseline gap-2">
        <h4 className="text-2xl font-bold text-white">
          {value}
        </h4>
        {trend !== null && (
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Insight Item Component
 */
interface InsightItemProps {
  text: string;
  positive: boolean;
}

function InsightItem({ text, positive }: InsightItemProps) {
  return (
    <div className="flex items-start gap-2">
      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${positive ? 'bg-green-500' : 'bg-yellow-500'}`} />
      <p className="text-sm text-slate-200 leading-relaxed">
        {text}
      </p>
    </div>
  );
}
