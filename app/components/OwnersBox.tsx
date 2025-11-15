'use client';

import React from 'react';
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
    if (value > 0) return <span className="material-symbols-outlined text-base">trending_up</span>;
    if (value < 0) return <span className="material-symbols-outlined text-base">trending_down</span>;
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
    <div className="bg-[#1D212B] border border-[#383838] rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#FFD700] text-xl">
            stars
          </span>
          <h2 className="text-base font-semibold text-white">
            Owner's Box
          </h2>
        </div>
        <div className="text-xs text-[#A0A0A0]">
          Last 30 days
        </div>
      </div>

      {/* Primary Metric - Revenue */}
      <div className="bg-[#121212] border border-[#383838] rounded-lg p-4 mb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#3D8DDA] text-2xl">
              payments
            </span>
            <div>
              <p className="text-xs text-[#A0A0A0] font-medium">
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
          <h3 className="text-3xl font-bold text-white">
            {formatCurrency(revenue)}
          </h3>
        </div>
        <p className="text-xs text-[#A0A0A0] mt-2">
          {revenueChange > 0 ? 'Strong growth' : revenueChange < 0 ? 'Needs attention' : 'Stable'} compared to previous period
        </p>
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Bookings */}
        <div className="bg-[#121212] border border-[#383838] rounded-lg p-3 text-center">
          <span className="material-symbols-outlined text-[#3D8DDA] text-2xl block mb-1">
            event
          </span>
          <p className="text-lg font-bold text-white mb-0.5">
            {bookings}
          </p>
          <p className="text-xs text-[#A0A0A0]">
            Bookings
          </p>
        </div>

        {/* Guests */}
        <div className="bg-[#121212] border border-[#383838] rounded-lg p-3 text-center">
          <span className="material-symbols-outlined text-[#3D8DDA] text-2xl block mb-1">
            group
          </span>
          <p className="text-lg font-bold text-white mb-0.5">
            {guests}
          </p>
          <p className="text-xs text-[#A0A0A0]">
            Guests
          </p>
        </div>

        {/* Capacity */}
        <div className="bg-[#121212] border border-[#383838] rounded-lg p-3 text-center">
          <span className="material-symbols-outlined text-[#3D8DDA] text-2xl block mb-1">
            speed
          </span>
          <p className="text-lg font-bold text-white mb-0.5">
            {capacityPercent > 0 ? `${capacityPercent.toFixed(0)}%` : 'N/A'}
          </p>
          <p className="text-xs text-[#A0A0A0]">
            Capacity
          </p>
        </div>
      </div>
    </div>
  );
}

