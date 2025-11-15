'use client';

import React, { useState } from 'react';
import { ParsedChart } from '@/app/lib/utils/chart-parser';
import {
  RevenueTrendChart,
  BookingsByServiceChart,
  RevenueByServiceChart,
  PaymentStatusChart,
  BookingsByDayChart,
  GuestTrendChart,
} from './Charts';
import { Download, Copy, Check } from 'lucide-react';

interface DynamicChartProps {
  chart: ParsedChart;
  height?: number;
}

/**
 * Dynamically renders the appropriate chart based on parsed specifications
 */
export function DynamicChart({ chart, height = 280 }: DynamicChartProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyData = () => {
    if (!chart.data || chart.data.length === 0) return;

    const csvData = chart.data.map(row => Object.values(row).join(',')).join('\n');
    const headers = Object.keys(chart.data[0] || {}).join(',');
    const fullCsv = `${headers}\n${csvData}`;

    navigator.clipboard.writeText(fullCsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCSV = () => {
    if (!chart.data || chart.data.length === 0) return;

    const csvData = chart.data.map(row => Object.values(row).join(',')).join('\n');
    const headers = Object.keys(chart.data[0] || {}).join(',');
    const fullCsv = `${headers}\n${csvData}`;

    const blob = new Blob([fullCsv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chart.title.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const renderChart = () => {
    // Safety check for empty data
    if (!chart.data || chart.data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full min-h-[200px] text-[#A0A0A0] text-sm bg-[#1E1E1E]">
          No data available
        </div>
      );
    }

    switch (chart.type) {
      case 'line':
        // Check if it's guest data or revenue data
        if (chart.title.toLowerCase().includes('guest')) {
          return <GuestTrendChart data={chart.data} height={height} />;
        }
        return <RevenueTrendChart data={chart.data} height={height} />;

      case 'bar':
        // Check if it's multi-value data (bookings by day)
        if (chart.data[0]?.bookings !== undefined) {
          return <BookingsByDayChart data={chart.data} height={height} />;
        }
        return <BookingsByServiceChart data={chart.data} height={height} />;

      case 'pie':
        // Check if it's payment status or revenue by service
        if (
          chart.title.toLowerCase().includes('payment') ||
          chart.title.toLowerCase().includes('paid')
        ) {
          return <PaymentStatusChart data={chart.data} height={height} />;
        }
        return <RevenueByServiceChart data={chart.data} height={height} />;

      case 'funnel':
        // Render as horizontal bar chart for funnel visualization
        return <BookingsByServiceChart data={chart.data} height={height} />;

      case 'area':
        // Use line chart with area fill
        return <RevenueTrendChart data={chart.data} height={height} />;

      case 'stacked-bar':
        // Use multi-value bar chart
        return <BookingsByDayChart data={chart.data} height={height} />;

      default:
        return <RevenueTrendChart data={chart.data} height={height} />;
    }
  };

  // Simple mode for sidebar rendering (no wrapper, just chart)
  const simpleMode = height === 280 || height === 350;

  if (simpleMode) {
    return <div style={{ width: '100%', height: `${height}px`, minHeight: `${height}px`, backgroundColor: '#1E1E1E' }}>{renderChart()}</div>;
  }

  return (
    <div className="my-4 bg-[#1E1E1E] rounded-xl border border-[#383838] shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-[#2E2E2E] to-[#1E1E1E] border-b border-[#383838]">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white tracking-tight">{chart.title}</h4>
            <p className="text-xs text-[#A0A0A0] mt-1 leading-relaxed">{chart.description}</p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={handleCopyData}
              className="p-1.5 rounded-lg hover:bg-[#2E2E2E] transition-colors"
              title="Copy data to clipboard"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-[#A0A0A0]" />
              )}
            </button>
            <button
              onClick={handleDownloadCSV}
              className="p-1.5 rounded-lg hover:bg-[#2E2E2E] transition-colors"
              title="Download as CSV"
            >
              <Download className="w-4 h-4 text-[#A0A0A0]" />
            </button>
          </div>
        </div>
      </div>
      <div className="p-6 w-full overflow-hidden bg-[#1E1E1E]">
        <div className="w-full">
          {renderChart()}
        </div>
      </div>
    </div>
  );
}

interface ChartGridProps {
  charts: ParsedChart[];
}

/**
 * Renders a grid of charts from parsed specifications
 */
export function ChartGrid({ charts }: ChartGridProps) {
  // Don't render anything if there are no charts
  if (!charts || charts.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-4">
      {/* Stack charts vertically in single column */}
      {charts.map((chart, index) => (
        <div
          key={index}
          className="bg-[#1E1E1E] border border-[#383838] rounded-xl p-4 md:p-5"
        >
          {chart.title && (
            <div className="flex items-center mb-4">
              <span className="material-symbols-outlined text-green-400 mr-2" style={{ fontSize: '20px' }}>
                insights
              </span>
              <h3 className="font-semibold text-white">{chart.title}</h3>
            </div>
          )}
          <DynamicChart chart={chart} height={240} />
        </div>
      ))}
    </div>
  );
}
