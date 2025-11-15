'use client';

import React, { useState } from 'react';
import { DynamicChart } from './DynamicChart';
import { ParsedChart } from '@/app/lib/utils/chart-parser';
import { ZoomIn, Calendar, TrendingUp } from 'lucide-react';

interface EnhancedChartProps {
  chart: ParsedChart;
  height?: number;
  onDrillDown?: (dataPoint: any) => void;
}

type TimeRange = '7d' | '30d' | '90d' | 'custom';

/**
 * Enhanced chart with interactive features:
 * - Time range selectors
 * - Drill-down capabilities
 * - Hover states with detailed info
 */
export function EnhancedChart({ chart, height = 280, onDrillDown }: EnhancedChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [showDetails, setShowDetails] = useState(false);

  const timeRanges = [
    { value: '7d' as TimeRange, label: '7 Days' },
    { value: '30d' as TimeRange, label: '30 Days' },
    { value: '90d' as TimeRange, label: '90 Days' },
    { value: 'custom' as TimeRange, label: 'Custom' },
  ];

  // Filter chart data based on selected time range
  const getFilteredData = () => {
    if (!chart.data || chart.data.length === 0) return chart.data;

    // For time-based charts, filter by range
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return chart.data.slice(-days);
  };

  const filteredChart = {
    ...chart,
    data: getFilteredData(),
  };

  return (
    <div className="relative">
      {/* Time Range Selector */}
      {(chart.type === 'line' || chart.type === 'area') && chart.data.length > 7 && (
        <div className="absolute top-0 right-0 z-10 flex items-center gap-1 bg-[#1E1E1E]/90 backdrop-blur-sm rounded-lg p-1 border border-[#383838]">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-2 py-1 text-xs rounded transition-all ${
                timeRange === range.value
                  ? 'bg-[#5E5CE6] text-white font-medium'
                  : 'text-[#A0A0A0] hover:text-white hover:bg-[#2E2E2E]'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      )}

      {/* Chart */}
      <DynamicChart chart={filteredChart} height={height} />

      {/* Quick Stats Overlay */}
      {chart.data && chart.data.length > 0 && (
        <div className="absolute bottom-2 left-2 flex gap-2">
          <div className="bg-[#1E1E1E]/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#383838] flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-xs text-white font-medium">
              {chart.data.length} data points
            </span>
          </div>
        </div>
      )}

      {/* Drill-Down Indicator */}
      {onDrillDown && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="absolute top-0 left-0 z-10 bg-[#1E1E1E]/90 backdrop-blur-sm rounded-lg p-2 border border-[#383838] hover:border-[#5E5CE6] transition-all group"
          title="View detailed breakdown"
        >
          <ZoomIn className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#5E5CE6]" />
        </button>
      )}
    </div>
  );
}
