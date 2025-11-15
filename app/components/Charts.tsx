'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Color palette
const COLORS = {
  primary: '#4361EE',
  secondary: '#3A0CA3',
  success: '#06D6A0',
  warning: '#FFD60A',
  danger: '#EF476F',
  info: '#118AB2',
  purple: '#7209B7',
  orange: '#F77F00',
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.info,
  COLORS.purple,
  COLORS.orange,
];

interface ChartData {
  name: string;
  value?: number;
  [key: string]: string | number | undefined;
}

interface BaseChartProps {
  data: ChartData[];
  height?: number;
}

/**
 * Custom Tooltip Component for professional styling
 */
const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1E1E1E] px-4 py-3 rounded-lg shadow-lg border border-[#383838]">
        <p className="text-xs font-semibold text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-[#A0A0A0]">{entry.name}</span>
            </div>
            <span className="text-xs font-semibold text-white">
              {formatter ? formatter(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Revenue Trend Line Chart
 */
export function RevenueTrendChart({ data, height = 300 }: BaseChartProps) {
  return (
    <div style={{ width: '100%', height: `${height}px`, backgroundColor: '#1E1E1E' }}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#383838" />
          <XAxis
            dataKey="name"
            stroke="#A0A0A0"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#A0A0A0"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip
            content={<CustomTooltip formatter={(value: number) => `$${value.toLocaleString()}`} />}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={COLORS.primary}
            strokeWidth={3}
            dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            name="Revenue"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Bookings by Service Bar Chart
 */
export function BookingsByServiceChart({ data, height = 300 }: BaseChartProps) {
  return (
    <div style={{ width: '100%', height: `${height}px`, backgroundColor: '#1E1E1E' }}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#383838" />
          <XAxis
            dataKey="name"
            stroke="#A0A0A0"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#A0A0A0"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            content={<CustomTooltip formatter={(value: number) => value.toLocaleString()} />}
          />
          <Legend />
          <Bar
            dataKey="value"
            fill={COLORS.primary}
            radius={[8, 8, 0, 0]}
            name="Bookings"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Revenue by Service Pie Chart
 */
export function RevenueByServiceChart({ data, height = 300 }: BaseChartProps) {
  return (
    <div style={{ width: '100%', height: `${height}px`, backgroundColor: '#1E1E1E' }}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart margin={{ top: 10, right: 10, bottom: 30, left: 10 }}>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            labelLine={false}
            label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius="65%"
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            content={<CustomTooltip formatter={(value: number) => `$${value.toLocaleString()}`} />}
          />
          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Payment Status Pie Chart
 */
export function PaymentStatusChart({ data, height = 300 }: BaseChartProps) {
  const paymentColors = [COLORS.success, COLORS.danger];

  return (
    <div style={{ width: '100%', height: `${height}px`, backgroundColor: '#1E1E1E' }}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart margin={{ top: 10, right: 10, bottom: 30, left: 10 }}>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            labelLine={false}
            label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(1)}%`}
            outerRadius="65%"
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={paymentColors[index % paymentColors.length]} />
            ))}
          </Pie>
          <Tooltip
            content={<CustomTooltip formatter={(value: number) => `$${value.toLocaleString()}`} />}
          />
          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Bookings by Day of Week Bar Chart
 */
export function BookingsByDayChart({ data, height = 300 }: BaseChartProps) {
  return (
    <div style={{ width: '100%', height: `${height}px`, backgroundColor: '#1E1E1E' }}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#383838" />
          <XAxis
            dataKey="name"
            stroke="#A0A0A0"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#A0A0A0"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            content={<CustomTooltip />}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Bar
            dataKey="bookings"
            fill={COLORS.primary}
            radius={[8, 8, 0, 0]}
            name="Bookings"
          />
          <Bar
            dataKey="revenue"
            fill={COLORS.success}
            radius={[8, 8, 0, 0]}
            name="Revenue ($)"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Guest Count Trend Line Chart
 */
export function GuestTrendChart({ data, height = 300 }: BaseChartProps) {
  return (
    <div style={{ width: '100%', height: `${height}px`, backgroundColor: '#1E1E1E' }}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#383838" />
          <XAxis
            dataKey="name"
            stroke="#A0A0A0"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#A0A0A0"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            content={<CustomTooltip formatter={(value: number) => value.toLocaleString()} />}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={COLORS.info}
            strokeWidth={3}
            dot={{ fill: COLORS.info, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            name="Total Guests"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
