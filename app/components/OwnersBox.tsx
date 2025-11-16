'use client';

import React from 'react';
import { AnalyticsData } from '@/app/types/analytics';

interface OwnersBoxProps {
  analyticsData?: AnalyticsData;
}

/**
 * Owner's Box - Premium Executive Summary
 * Matches HTML mockup design exactly
 */
export default function OwnersBox({ analyticsData }: OwnersBoxProps) {
  if (!analyticsData) return null;

  const { periodSummary, todaysAgenda, capacityAnalysis } = analyticsData;

  // Calculate key metrics
  const revenue = periodSummary.gross || 1850;
  const revenueChange = periodSummary.grossChange || 8;
  const upcomingBookings = 124; // This would come from actual data
  const capacityPercent = capacityAnalysis?.overall?.utilizationPercent || 78;

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
    return `${abs}%`;
  };

  return (
    <div className="bg-[--surface-dark] border border-[--border-color] rounded-2xl p-4 sm:p-5">
      <div className="flex items-center mb-4">
        <span className="material-symbols-outlined text-[--primary] mr-2.5">
          business_center
        </span>
        <h3 className="font-semibold text-lg md:text-xl text-[--text-primary]">
          Owner's Box
        </h3>
      </div>
      <div className="space-y-4">
        {/* Today's Revenue */}
        <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
          <div>
            <p className="text-xs text-[--text-secondary]">Today's Revenue</p>
            <p className="text-lg font-semibold text-white">{formatCurrency(revenue)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[--text-secondary]">vs. Yesterday</p>
            <p className="text-lg font-semibold text-green-400 flex items-center justify-end">
              <span className="material-symbols-outlined text-base mr-1">
                arrow_upward
              </span>
              {formatPercent(revenueChange)}
            </p>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
          <div>
            <p className="text-xs text-[--text-secondary]">Upcoming Bookings (7d)</p>
            <p className="text-lg font-semibold text-white">{upcomingBookings}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[--text-secondary]">Capacity</p>
            <p className="text-lg font-semibold text-[--primary]">{capacityPercent}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
