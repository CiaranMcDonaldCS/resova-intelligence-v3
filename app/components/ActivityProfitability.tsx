/**
 * Activity Profitability Component
 * Displays activity/item performance metrics including revenue, bookings, and profitability
 */

'use client';

import React, { useState } from 'react';
import { ActivityProfitability as ActivityProfitabilityType } from '@/app/types/analytics';
import { TrendingUp, DollarSign, Calendar, Star, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ActivityProfitabilityProps {
  data: ActivityProfitabilityType[];
}

export default function ActivityProfitability({ data }: ActivityProfitabilityProps) {
  const [sortBy, setSortBy] = useState<'revenue' | 'bookings' | 'profitability'>('revenue');

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatNumber = (num: number) => num.toLocaleString('en-US');

  // Sort data based on selected criterion
  const sortedData = [...data].sort((a, b) => {
    switch (sortBy) {
      case 'revenue':
        return b.totalSales - a.totalSales;
      case 'bookings':
        return b.totalBookings - a.totalBookings;
      case 'profitability':
        return b.revenuePerBooking - a.revenuePerBooking;
      default:
        return 0;
    }
  });

  // Calculate totals
  const totalRevenue = data.reduce((sum, item) => sum + item.totalSales, 0);
  const totalBookings = data.reduce((sum, item) => sum + item.totalBookings, 0);
  const avgRevenuePerBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  // Identify top performers
  const topRevenueItem = sortedData[0];
  const topBookingsItem = [...data].sort((a, b) => b.totalBookings - a.totalBookings)[0];
  const topProfitabilityItem = [...data].sort((a, b) => b.revenuePerBooking - a.revenuePerBooking)[0];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-gray-500 mt-1">All activities</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(totalBookings)}</p>
              <p className="text-xs text-gray-500 mt-1">Across {data.length} activities</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Revenue per Booking</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(avgRevenuePerBooking)}</p>
              <p className="text-xs text-gray-500 mt-1">Overall average</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Activities</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.length}</p>
              <p className="text-xs text-gray-500 mt-1">Active items</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200 p-6">
          <div className="flex items-center mb-2">
            <DollarSign className="w-5 h-5 text-green-700 mr-2" />
            <h3 className="text-sm font-semibold text-green-900">Top Revenue Generator</h3>
          </div>
          <p className="text-lg font-bold text-green-900 mb-1">{topRevenueItem?.name}</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(topRevenueItem?.totalSales || 0)}</p>
          <p className="text-xs text-green-700 mt-1">{formatNumber(topRevenueItem?.totalBookings || 0)} bookings</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 p-6">
          <div className="flex items-center mb-2">
            <Calendar className="w-5 h-5 text-blue-700 mr-2" />
            <h3 className="text-sm font-semibold text-blue-900">Most Booked</h3>
          </div>
          <p className="text-lg font-bold text-blue-900 mb-1">{topBookingsItem?.name}</p>
          <p className="text-2xl font-bold text-blue-700">{formatNumber(topBookingsItem?.totalBookings || 0)}</p>
          <p className="text-xs text-blue-700 mt-1">{formatCurrency(topBookingsItem?.totalSales || 0)} revenue</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200 p-6">
          <div className="flex items-center mb-2">
            <TrendingUp className="w-5 h-5 text-purple-700 mr-2" />
            <h3 className="text-sm font-semibold text-purple-900">Highest Per-Booking Value</h3>
          </div>
          <p className="text-lg font-bold text-purple-900 mb-1">{topProfitabilityItem?.name}</p>
          <p className="text-2xl font-bold text-purple-700">{formatCurrency(topProfitabilityItem?.revenuePerBooking || 0)}</p>
          <p className="text-xs text-purple-700 mt-1">per booking</p>
        </div>
      </div>

      {/* Sorting Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Activity Performance</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('revenue')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'revenue'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              By Revenue
            </button>
            <button
              onClick={() => setSortBy('bookings')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'bookings'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              By Bookings
            </button>
            <button
              onClick={() => setSortBy('profitability')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'profitability'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              By Value/Booking
            </button>
          </div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-600 px-6 py-3">Rank</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-6 py-3">Activity</th>
                <th className="text-right text-xs font-semibold text-gray-600 px-6 py-3">Total Revenue</th>
                <th className="text-right text-xs font-semibold text-gray-600 px-6 py-3">Bookings</th>
                <th className="text-right text-xs font-semibold text-gray-600 px-6 py-3">Revenue/Booking</th>
                <th className="text-center text-xs font-semibold text-gray-600 px-6 py-3">Avg Review</th>
                <th className="text-center text-xs font-semibold text-gray-600 px-6 py-3">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedData.map((activity, idx) => {
                const revenueShare = totalRevenue > 0 ? (activity.totalSales / totalRevenue) * 100 : 0;
                const bookingShare = totalBookings > 0 ? (activity.totalBookings / totalBookings) * 100 : 0;
                const profitabilityVsAvg = avgRevenuePerBooking > 0
                  ? ((activity.revenuePerBooking - avgRevenuePerBooking) / avgRevenuePerBooking) * 100
                  : 0;

                return (
                  <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{activity.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {revenueShare.toFixed(1)}% of revenue • {bookingShare.toFixed(1)}% of bookings
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(activity.totalSales)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-medium text-gray-700">{formatNumber(activity.totalBookings)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(activity.revenuePerBooking)}</p>
                      <p className={`text-xs font-medium mt-0.5 ${
                        profitabilityVsAvg > 0 ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {profitabilityVsAvg > 0 ? '+' : ''}{profitabilityVsAvg.toFixed(1)}% vs avg
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        {activity.avgReview > 0 ? (
                          <>
                            <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                            <span className="text-sm font-medium text-gray-900">
                              {activity.avgReview.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">
                              ({activity.totalReviews})
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">No reviews</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        {profitabilityVsAvg > 10 ? (
                          <div className="flex items-center text-green-600">
                            <ArrowUpRight className="w-5 h-5" />
                            <span className="text-xs font-semibold ml-1">Strong</span>
                          </div>
                        ) : profitabilityVsAvg < -10 ? (
                          <div className="flex items-center text-orange-600">
                            <ArrowDownRight className="w-5 h-5" />
                            <span className="text-xs font-semibold ml-1">Below Avg</span>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-gray-600">Average</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">Key Insights</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>
              <strong>{topRevenueItem?.name}</strong> generates the most revenue with {formatCurrency(topRevenueItem?.totalSales || 0)}
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>
              <strong>{topBookingsItem?.name}</strong> is most popular with {formatNumber(topBookingsItem?.totalBookings || 0)} bookings
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>
              <strong>{topProfitabilityItem?.name}</strong> has the highest per-booking value at {formatCurrency(topProfitabilityItem?.revenuePerBooking || 0)}
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>
              Activities performing above average ({formatCurrency(avgRevenuePerBooking)}/booking) are marked as "Strong"
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
