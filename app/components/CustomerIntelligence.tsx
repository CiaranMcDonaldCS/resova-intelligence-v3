/**
 * Customer Intelligence Component
 * Displays customer segments, CLV analysis, and churn risk insights
 */

'use client';

import React from 'react';
import { CustomerIntelligence as CustomerIntelligenceType } from '@/app/types/analytics';
import { Users, TrendingUp, AlertTriangle, Award } from 'lucide-react';

interface CustomerIntelligenceProps {
  data: CustomerIntelligenceType;
}

export default function CustomerIntelligence({ data }: CustomerIntelligenceProps) {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  // Segment colors
  const segmentColors = {
    vip: 'bg-purple-100 text-purple-800 border-purple-200',
    regular: 'bg-blue-100 text-blue-800 border-blue-200',
    atRisk: 'bg-orange-100 text-orange-800 border-orange-200',
    new: 'bg-green-100 text-green-800 border-green-200'
  };

  const segmentIcons = {
    vip: Award,
    regular: Users,
    atRisk: AlertTriangle,
    new: TrendingUp
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.totalCustomers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New Customers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.newCustomers}</p>
              <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg CLV</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(data.avgCustomerLifetimeValue)}</p>
              <p className="text-xs text-gray-500 mt-1">Per customer</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Repeat Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatPercent(data.repeatRate)}</p>
              <p className="text-xs text-gray-500 mt-1">2+ bookings</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { key: 'vip', label: 'VIP Guests', data: data.segments.vip, description: 'CLV $500+' },
            { key: 'regular', label: 'Regular Guests', data: data.segments.regular, description: '2+ visits, CLV $150+' },
            { key: 'atRisk', label: 'At-Risk Guests', data: data.segments.atRisk, description: '90+ days inactive' },
            { key: 'new', label: 'New Guests', data: data.segments.new, description: 'First-time visitors' }
          ].map(({ key, label, data: segmentData, description }) => {
            const Icon = segmentIcons[key as keyof typeof segmentIcons];
            return (
              <div
                key={key}
                className={`rounded-lg border-2 p-4 ${segmentColors[key as keyof typeof segmentColors]}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-5 h-5" />
                  <span className="text-lg font-bold">{segmentData.count}</span>
                </div>
                <h4 className="font-semibold text-sm mb-1">{label}</h4>
                <p className="text-xs opacity-75 mb-2">{description}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="opacity-75">Percentage:</span>
                    <span className="font-semibold">{formatPercent(segmentData.percentage)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-75">Avg CLV:</span>
                    <span className="font-semibold">{formatCurrency(segmentData.avgClv)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-75">Total Revenue:</span>
                    <span className="font-semibold">{formatCurrency(segmentData.totalRevenue)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout for Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers by CLV */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers by CLV</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-600 pb-2">Customer</th>
                  <th className="text-right text-xs font-semibold text-gray-600 pb-2">CLV</th>
                  <th className="text-right text-xs font-semibold text-gray-600 pb-2">Bookings</th>
                  <th className="text-center text-xs font-semibold text-gray-600 pb-2">Segment</th>
                </tr>
              </thead>
              <tbody>
                {data.topCustomersByClv.map((customer, idx) => (
                  <tr key={idx} className="border-b border-gray-100 last:border-0">
                    <td className="py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.email}</p>
                      </div>
                    </td>
                    <td className="text-right py-3">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(customer.clv)}</p>
                    </td>
                    <td className="text-right py-3">
                      <p className="text-sm text-gray-700">{customer.totalBookings}</p>
                    </td>
                    <td className="text-center py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        customer.segment === 'vip' ? 'bg-purple-100 text-purple-800' :
                        customer.segment === 'regular' ? 'bg-blue-100 text-blue-800' :
                        customer.segment === 'at-risk' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {customer.segment.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Churn Risk Customers */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
            Churn Risk Customers
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-600 pb-2">Customer</th>
                  <th className="text-right text-xs font-semibold text-gray-600 pb-2">Last Booking</th>
                  <th className="text-right text-xs font-semibold text-gray-600 pb-2">CLV</th>
                </tr>
              </thead>
              <tbody>
                {data.churnRiskCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-500 text-sm">
                      No at-risk customers identified
                    </td>
                  </tr>
                ) : (
                  data.churnRiskCustomers.map((customer, idx) => (
                    <tr key={idx} className="border-b border-gray-100 last:border-0">
                      <td className="py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                          <p className="text-xs text-gray-500">{customer.email}</p>
                        </div>
                      </td>
                      <td className="text-right py-3">
                        <p className="text-sm text-orange-600 font-medium">{customer.daysSinceLastBooking} days ago</p>
                      </td>
                      <td className="text-right py-3">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(customer.clv)}</p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
