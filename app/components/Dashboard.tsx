'use client';

import { useEffect, useState, useRef } from 'react';
import { useApp, useAnalytics, useChat } from '../context/AppContext';
import CustomerIntelligence from './CustomerIntelligence';
import ActivityProfitability from './ActivityProfitability';
import DarkAiAssistant from './DarkAiAssistant';
import {
  BarChart3,
  Settings,
  LogOut,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Bell,
  Receipt,
  Activity,
  User,
  ChevronDown,
  ExternalLink,
  Filter,
  Award
} from 'lucide-react';
import { ChartGrid, DynamicChart } from './DynamicChart';
import { MarkdownRenderer } from './MarkdownRenderer';
import { mapChartSpecsToData } from '../lib/utils/chart-data-mapper';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  // Get what you need from context - no more props!
  const { logout, analyticsService } = useApp();
  const {
    analyticsData,
    analyticsLoading,
    analyticsError,
    fetchAnalytics,
    refreshAnalytics
  } = useAnalytics();

  // Local UI state
  const [activeTab, setActiveTab] = useState<'operations' | 'venue' | 'assistant'>('assistant');
  const [dateRange, setDateRange] = useState('Last 7 days');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // Fetch analytics on mount (only if service is initialized)
  useEffect(() => {
    if (analyticsService) {
      fetchAnalytics(dateRange);
    }
  }, [analyticsService, fetchAnalytics, dateRange]);

  // Handle refresh
  const handleRefresh = async () => {
    await refreshAnalytics();
  };

  // Loading state
  if (analyticsLoading && !analyticsData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (analyticsError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-800 mb-4">{analyticsError}</p>
            <button
              onClick={() => fetchAnalytics()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No analytics data available</p>
          <button
            onClick={() => fetchAnalytics()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Load Data
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className={`min-h-screen ${activeTab === 'assistant' ? 'bg-[#121212]' : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40'}`}>
      {/* Header - Hidden when assistant is active */}
      {activeTab !== 'assistant' && (
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <img
                src="/logo.png"
                alt="Resova"
                className="h-10"
              />
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{currentDateTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
                <span className="text-gray-400">•</span>
                <Clock className="w-4 h-4" />
                <span>{currentDateTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short'
                })}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={analyticsLoading}
                className="p-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
                title="Refresh data"
              >
                <RefreshCw
                  className={`w-5 h-5 ${analyticsLoading ? 'animate-spin' : ''}`}
                />
              </button>

              {/* Settings Button */}
              <button className="p-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all hover:scale-105 active:scale-95">
                <Settings className="w-5 h-5" />
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-105 active:scale-95"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      )}

      <div className={activeTab === 'assistant' ? '' : 'px-6 py-6'}>
        {/* Tabs - Hidden, default to AI Assistant */}

        {/* Operations Tab */}
        {activeTab === 'operations' && (
          <div className="space-y-6">

            {/* Today's Agenda */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/80 p-8 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-8">Today's Agenda</h3>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Metrics */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100/50 hover:shadow-md transition-all">
                    <p className="text-sm font-medium text-blue-700 mb-2">Bookings</p>
                    <p className="text-4xl font-bold text-blue-900">{analyticsData.todaysAgenda.bookings}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100/50 hover:shadow-md transition-all">
                    <p className="text-sm font-medium text-green-700 mb-2">Guests</p>
                    <p className="text-4xl font-bold text-green-900">{analyticsData.todaysAgenda.guests}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-100/50 hover:shadow-md transition-all">
                    <p className="text-sm font-medium text-purple-700 mb-2">First Booking</p>
                    <p className="text-4xl font-bold text-purple-900">{analyticsData.todaysAgenda.firstBooking}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-100/50 hover:shadow-md transition-all">
                    <p className="text-sm font-medium text-orange-700 mb-2">Waivers Required</p>
                    <p className="text-4xl font-bold text-orange-900">{analyticsData.todaysAgenda.waiversRequired}</p>
                  </div>
                </div>

                {/* Chart */}
                <div className="lg:col-span-3">
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={analyticsData.agendaChart}>
                      <defs>
                        <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2685CF" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#2685CF" stopOpacity={0.05}/>
                        </linearGradient>
                        <linearGradient id="colorGuests" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                        </linearGradient>
                        <linearGradient id="colorItems" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="bookings" stroke="#2685CF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBookings)" name="Bookings" />
                      <Area type="monotone" dataKey="guests" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGuests)" name="Guests" />
                      <Area type="monotone" dataKey="itemsBooked" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorItems)" name="Items Booked" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/80 p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-900">Today's Bookings</h3>
                <p className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                  {analyticsData.upcomingBookings.length} bookings
                </p>
              </div>

              <div className="overflow-x-auto -mx-2">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-4 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Time</th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Booking Name</th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Item</th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Guests</th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Waiver Status</th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Notes</th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Staff</th>
                      <th className="py-4 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.upcomingBookings.map((booking, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-indigo-50/50 transition-colors">
                        <td className="py-4 px-4 text-sm font-semibold text-gray-900">{booking.time}</td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">{booking.name}</td>
                        <td className="py-4 px-4 text-sm text-gray-700">{booking.item}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{booking.guests}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.waiver.includes('0/') ? 'bg-red-100 text-red-800 border border-red-200' :
                            booking.waiver.split('/')[0] === booking.waiver.split('/')[1].split(' ')[0] ? 'bg-green-100 text-green-800 border border-green-200' :
                            'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}>
                            {booking.waiver}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">{booking.notes}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{booking.staff}</td>
                        <td className="py-4 px-4">
                          <button className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Three Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Latest Notifications */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/80 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Latest Notifications</h3>
                  <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {analyticsData.notifications.map((notif, index) => (
                    <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                      <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Bell className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latest Transactions */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/80 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Latest Transactions</h3>
                  <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {analyticsData.transactions.map((trans, index) => (
                    <div key={index} className="pb-4 border-b border-gray-100 last:border-0">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Receipt className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{trans.customer}</p>
                          <p className="text-xs text-gray-500">{trans.date}</p>
                          <p className="text-xs text-gray-500">{trans.ref}</p>
                          <div className="flex items-center space-x-2 mt-1 text-xs">
                            <span className="text-gray-900">Total: <span className="font-medium">{trans.total}</span></span>
                            <span className="text-green-600">Paid: {trans.paid}</span>
                            <span className="text-red-600">Due: {trans.due}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latest Booking Notes */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/80 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Latest Booking Notes</h3>
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {analyticsData.bookingNotes.map((note, index) => (
                    <div key={index} className="pb-4 border-b border-gray-100 last:border-0">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{note.name}</p>
                          <p className="text-xs text-gray-500 mb-1">{note.date}</p>
                          <p className="text-sm text-gray-700">{note.note}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Two Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Latest Activity */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/80 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Latest Activity</h3>
                  <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {analyticsData.activity.map((act, index) => (
                    <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{act.user}</span> {act.action}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{act.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Users */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/80 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Users</h3>
                  <button className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all">
                    <Users className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {analyticsData.users.map((user, index) => (
                    <div key={index} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-green-600">{user.status}</p>
                          <p className="text-xs text-gray-500">Last login at: {user.lastLogin}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Venue Performance Tab */}
        {activeTab === 'venue' && (
          <VenuePerformance data={analyticsData} />
        )}

        {/* Activities Tab */}
        {/* AI Assistant Tab */}
        {activeTab === 'assistant' && (
          <DarkAiAssistant />
        )}
      </div>

    </div>
  );
}

// Venue Performance Component
function VenuePerformance({ data }: any) {
  const { periodSummary, performance, revenueTrends, topPurchased, guestSummary, paymentCollection, salesMetrics } = data;

  return (
    <div className="space-y-8">

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Period Summary */}
        <div className="xl:col-span-1 flex flex-col">
          <div className="bg-white p-6 rounded-lg shadow h-full">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Period Summary</h3>

            <div className="space-y-6">
              {/* Revenue Overview */}
              <div>
                <h4 className="text-base font-bold text-gray-700 tracking-wider mb-3">Revenue Overview</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    <div className="flex flex-col space-y-1 pb-3 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Gross</span>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-gray-900">${periodSummary.gross.toLocaleString()}</span>
                        <span className="text-xs font-medium text-green-600">↑{periodSummary.grossChange}%</span>
                      </div>
                    </div>
                    <div className="pt-3 grid grid-cols-2 gap-x-0">
                      <div className="col-span-1 pr-4">
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm font-medium text-gray-600">Net</span>
                          <div className="flex items-baseline space-x-2">
                            <span className="text-xl font-semibold text-gray-900">${periodSummary.net.toLocaleString()}</span>
                            <span className="text-xs font-medium text-green-600">↑{periodSummary.netChange}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-1 pl-4 border-l border-gray-200">
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm font-medium text-gray-600">Total Sales</span>
                          <div className="flex items-baseline space-x-2">
                            <span className="text-xl font-semibold text-gray-900">{periodSummary.totalSales}</span>
                            <span className="text-xs font-medium text-green-600">↑{periodSummary.totalSalesChange}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Adjustments */}
              <div>
                <h4 className="text-base font-bold text-gray-700 tracking-wider mb-3">Adjustments</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-x-0">
                    <div className="col-span-1 pr-4">
                      <div className="flex flex-col space-y-1 pb-3 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Discounts</span>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-xl font-semibold text-red-500">-${periodSummary.discounts.toLocaleString()}</span>
                          <span className="text-xs font-medium text-red-500">↑{Math.abs(periodSummary.discountsChange)}%</span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1 pt-3">
                        <span className="text-sm font-medium text-gray-600">Taxes</span>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-xl font-semibold text-gray-900">${periodSummary.taxes.toLocaleString()}</span>
                          <span className="text-xs font-medium text-green-600">↑{periodSummary.taxesChange}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-1 pl-4 border-l border-gray-200">
                      <div className="flex flex-col space-y-1 pb-3 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Refunded</span>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-xl font-semibold text-red-500">-${periodSummary.refunded.toLocaleString()}</span>
                          <span className="text-xs font-medium text-green-600">↓{Math.abs(periodSummary.refundedChange)}%</span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1 pt-3">
                        <span className="text-sm font-medium text-gray-600">Fees</span>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-xl font-semibold text-gray-900">${periodSummary.fees.toLocaleString()}</span>
                          <span className="text-xs font-medium text-gray-500">↑{periodSummary.feesChange}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Collection */}
              <div>
                <h4 className="text-base font-bold text-gray-700 tracking-wider mb-3">Payment Collection</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    <div className="flex flex-col space-y-1 pb-3 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Total Payments</span>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-bold text-gray-900">${paymentCollection.totalPayments.toLocaleString()}</span>
                        <span className="text-xs font-medium text-green-600">↑{paymentCollection.totalChange}%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-0 pt-3">
                      <div className="col-span-1 pr-4">
                        <div className="flex flex-col space-y-2">
                          <span className="text-sm font-medium text-gray-600">Paid vs Unpaid</span>
                          <div className="w-full bg-red-500/20 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${paymentCollection.paidPercent}%` }}></div>
                          </div>
                          <div className="flex justify-between text-xs font-medium text-gray-600">
                            <span className="font-semibold text-gray-800">${(paymentCollection.paidAmount / 1000).toFixed(1)}k</span>
                            <span className="font-semibold text-red-500">${(paymentCollection.unpaidAmount / 1000).toFixed(1)}k</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-1 pl-4 border-l border-gray-200">
                        <div className="flex flex-col space-y-2">
                          <span className="text-sm font-medium text-gray-600">Card vs Cash</span>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-[#3698E4] h-2 rounded-full" style={{ width: `${paymentCollection.cardPercent}%` }}></div>
                          </div>
                          <div className="flex justify-between text-xs font-medium text-gray-600">
                            <span>Card: {paymentCollection.cardPercent.toFixed(0)}%</span>
                            <span>Cash: {paymentCollection.cashPercent.toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns - Charts and AI Assistant */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          {/* Revenue Trends Chart */}
          <div className="bg-white p-6 rounded-lg shadow flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-900">Revenue Trends</h3>
                <p className="text-sm text-gray-600">Daily data for the last 7 days</p>
              </div>
              <div className="hidden md:flex items-center space-x-4 mt-3 sm:mt-0">
                <span className="flex items-center text-sm text-gray-600">
                  <span className="h-2 w-2 rounded-full bg-[#2685CF] mr-2"></span>This Period
                </span>
                <span className="flex items-center text-sm text-gray-500">
                  <span className="h-2 w-2 rounded-full bg-gray-300 mr-2 border border-dashed border-gray-400"></span>Previous Period
                </span>
              </div>
            </div>
            <div className="h-80 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="thisGross" stroke="#2685CF" strokeWidth={2} name="This Period" />
                  <Line type="monotone" dataKey="prevGross" stroke="#D1D5DB" strokeWidth={2} strokeDasharray="5 5" name="Previous Period" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <button className="text-sm font-medium px-3 py-1 rounded-full bg-[#2685CF]/10 text-[#2685CF]">Gross Revenue</button>
              <button className="text-sm font-medium px-3 py-1 rounded-full bg-gray-200 text-gray-600">Net Revenue</button>
              <button className="text-sm font-medium px-3 py-1 rounded-full bg-gray-200 text-gray-600">Total Sales</button>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Best Day Card */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Best Day</p>
                  <p className="text-lg font-bold text-gray-900">{performance.bestDay}</p>
                </div>
                <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="flex items-end justify-between pt-2 border-t border-gray-100">
                <p className="text-2xl font-bold text-gray-900">${performance.bestDayRevenue.toLocaleString()}</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">
                  ↑ {performance.bestDayChange}%
                </span>
              </div>
            </div>

            {/* Top Item Card */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Top Item</p>
                  <p className="text-lg font-bold text-gray-900 line-clamp-2">{performance.topItem}</p>
                </div>
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center ml-2">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="flex items-end justify-between pt-2 border-t border-gray-100">
                <p className="text-2xl font-bold text-gray-900">{performance.topItemBookings}</p>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-0.5">Bookings</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">
                    ↑ {performance.topItemChange}%
                  </span>
                </div>
              </div>
            </div>

            {/* Peak Time Card */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Peak Time</p>
                  <p className="text-lg font-bold text-gray-900">{performance.peakTime}</p>
                </div>
                <div className="flex-shrink-0 w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <div className="flex items-end justify-between pt-2 border-t border-gray-100">
                <p className="text-2xl font-bold text-gray-900">{performance.peakTimeBookings}</p>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-0.5">Bookings</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                    performance.peakTimeChange >= 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {performance.peakTimeChange >= 0 ? '↑' : '↓'} {Math.abs(performance.peakTimeChange)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Sales Metrics Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <h3 className="text-xl font-bold text-gray-900">Sales Metrics</h3>
          <a className="text-sm font-medium text-[#2685CF] hover:text-[#2685CF]/80 flex items-center gap-1 mt-2 sm:mt-0" href="#">
            View All Sales Data
            <span className="material-symbols-outlined text-base">→</span>
          </a>
        </div>
        <p className="text-xs text-gray-500 mb-6">Includes: Bookings • Add-ons • Gift Cards • Items • Walk-ins</p>

        {/* Sales Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-600">Bookings</span>
              <span className="text-sm font-medium text-green-600">↑{periodSummary.totalSalesChange}%</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 mt-auto pt-2">{periodSummary.totalSales}</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-600">Avg Rev / Booking</span>
              <span className="text-sm font-medium text-gray-500">↑0%</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 mt-auto pt-2">${(periodSummary.gross / periodSummary.totalSales).toFixed(2)}</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-600">Online Bookings</span>
              <span className="text-sm font-medium text-green-600">↑2%</span>
            </div>
            <div className="mt-auto pt-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-900">79%</span>
                <span className="text-sm text-gray-600">Online</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div className="bg-[#2685CF] h-1.5 rounded-full" style={{ width: '79%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Purchased Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Top 3 Items Purchased</h4>
            <ul className="space-y-2 text-sm">
              {topPurchased.items.slice(0, 3).map((item: any, idx: number) => (
                <li key={idx} className="flex justify-between items-center">
                  <span className="text-gray-800">{item.name}</span>
                  <span className="font-medium text-gray-500">${item.amount.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Top 3 Extras Purchased</h4>
            <ul className="space-y-2 text-sm">
              {topPurchased.extras.slice(0, 3).map((extra: any, idx: number) => (
                <li key={idx} className="flex justify-between items-center">
                  <span className="text-gray-800">{extra.name}</span>
                  <span className="font-medium text-gray-500">${extra.amount.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Top 3 Gift Vouchers</h4>
            <ul className="space-y-2 text-sm">
              {topPurchased.vouchers.map((voucher: any, idx: number) => (
                <li key={idx} className="flex justify-between items-center">
                  <span className="text-gray-800">{voucher.name}</span>
                  <span className="font-medium text-gray-500">${voucher.amount.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Guest Metrics Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Guest Metrics</h3>
          <a className="text-sm font-medium text-[#2685CF] hover:text-[#2685CF]/80 flex items-center gap-1 mt-2 sm:mt-0" href="#">
            View Guest Report
            <span className="material-symbols-outlined text-base">→</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-600">Total Guests</span>
              <span className="text-sm font-medium text-green-600">↑{guestSummary.totalChange}%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-auto pt-2">{guestSummary.totalGuests}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-600">Avg Revenue / Guest</span>
              <span className="text-sm font-medium text-gray-500">↑{guestSummary.avgRevChange}%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-auto pt-2">${guestSummary.avgRevenuePerGuest.toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-600">Avg Group Size</span>
              <span className="text-sm font-medium text-green-600">↑{guestSummary.groupChange}%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-auto pt-2">{guestSummary.avgGroupSize.toFixed(1)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-600">Repeat Customers %</span>
              <span className="text-sm font-medium text-green-600">↑{guestSummary.repeatChange}%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-auto pt-2">{guestSummary.repeatCustomers.toFixed(1)}%</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-600">No-Shows</span>
              <span className="text-sm font-medium text-green-600">↓{Math.abs(guestSummary.noShowChange)}%</span>
            </div>
            <p className="text-2xl font-bold text-red-500 mt-auto pt-2">{guestSummary.noShows}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// AI Assistant Card Component - 2-column layout with charts on right
function AIAssistantCard() {
  const { analyticsData } = useAnalytics();
  const { conversationHistory, chatLoading, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const [selectedFocus, setSelectedFocus] = useState<string | null>(null);
  const [activeCharts, setActiveCharts] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [conversationHistory]);

  // Update active charts when conversation updates
  useEffect(() => {
    // Get charts from the most recent assistant message
    const lastAssistantMessage = [...conversationHistory]
      .reverse()
      .find((msg: any) => msg.role === 'assistant' && msg.charts && msg.charts.length > 0);

    if (lastAssistantMessage && lastAssistantMessage.charts && analyticsData) {
      const mappedCharts = mapChartSpecsToData(lastAssistantMessage.charts, analyticsData);
      setActiveCharts(mappedCharts);
    } else {
      setActiveCharts([]);
    }
  }, [conversationHistory, analyticsData]);

  // Focus areas with relevant questions
  const FOCUS_AREAS = {
    overview: {
      icon: '📊',
      label: 'General Overview',
      description: 'Business summary and key metrics',
      questions: [
        "Show me my performance overview",
        "What are the most important trends?",
        "Provide a concise business summary",
      ]
    },
    financial: {
      icon: '💰',
      label: 'Financial Performance',
      description: 'Revenue, profitability, margins',
      questions: [
        "Show me revenue breakdown by source",
        "What's our net margin after expenses?",
        "Compare this month's revenue to last month",
      ]
    },
    customers: {
      icon: '👥',
      label: 'Customers & Growth',
      description: 'Guests, loyalty, retention',
      questions: [
        "Who are my top 10 highest value customers?",
        "What's our customer retention rate?",
        "Show me repeat customer trends",
      ]
    },
    guests: {
      icon: '🌸',
      label: 'Guests & CRM',
      description: 'Guest management and tracking',
      questions: [
        "Show me all guests from the last 30 days",
        "Who are our top spending guests?",
        "Which guests haven't visited in 90 days?",
      ]
    },
    inventory: {
      icon: '🛍️',
      label: 'Inventory & Extras',
      description: 'Add-ons, stock levels, upsells',
      questions: [
        "Which extras generate the most revenue?",
        "Show me current stock levels",
        "What extras are running low?",
      ]
    },
    giftvouchers: {
      icon: '🎁',
      label: 'Gift Vouchers',
      description: 'Voucher tracking and redemption',
      questions: [
        "Show me all active gift vouchers",
        "What's the total unredeemed value?",
        "Which vouchers expire soon?",
      ]
    },
    operations: {
      icon: '⚙️',
      label: 'Operations & Capacity',
      description: 'Bookings, capacity, efficiency',
      questions: [
        "How well are we utilizing capacity?",
        "What are our peak booking times?",
        "Show me today's bookings",
      ]
    },
    forecasting: {
      icon: '📈',
      label: 'Future & Planning',
      description: 'Upcoming bookings, demand',
      questions: [
        "How many bookings do we have next week?",
        "What's our projected revenue?",
        "Which activities need more staff?",
      ]
    }
  };

  // Auto-generate basic insights when AI Assistant tab is first opened
  // DISABLED: Causes duplicate messages and errors with invalid API keys
  // const [hasGeneratedInsights, setHasGeneratedInsights] = useState(false);

  // useEffect(() => {
  //   // Only generate insights once when component mounts and data is available
  //   // (This component only renders when the assistant tab is active)
  //   if (analyticsData && conversationHistory.length === 0 && !hasGeneratedInsights && !chatLoading) {
  //     setHasGeneratedInsights(true);

  //     // Generate basic insights automatically
  //     const insightsPrompt = "Provide a concise business overview with 3-4 key insights about my venue's current performance. Focus on the most important financial, operational, and growth metrics.";
  //     sendMessage(insightsPrompt);
  //   }
  // }, [analyticsData, conversationHistory.length, hasGeneratedInsights, chatLoading, sendMessage]);

  const handleFocusAreaClick = (focusKey: string) => {
    setSelectedFocus(focusKey);
  };

  const handleSend = async (messageText?: string) => {
    const userMessage = messageText || input.trim();
    if (!userMessage || chatLoading) return;

    setInput('');
    await sendMessage(userMessage);
  };

  return (
    <div className="overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2685CF] to-blue-600 text-white px-6 py-5 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Resova AI Assistant</h2>
            <p className="text-sm text-blue-100 mt-0.5">
              Powered by your venue's real-time analytics data
            </p>
          </div>
        </div>
      </div>

      {/* Chat Container - 2 Column Layout */}
      <div className="flex flex-col lg:flex-row" style={{ minHeight: 'calc(100vh - 250px)' }}>
        {/* Left Column - Conversation (60% width) */}
        <div className="flex-1 lg:w-3/5 flex flex-col bg-gray-50 border-r border-gray-200">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(100vh - 400px)' }}>
            {conversationHistory.length === 0 && !chatLoading && (
              <div className="max-w-5xl mx-auto">
                {/* Welcome Header */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl border-2 border-[#2685CF]/20 shadow-sm mb-6">
                  <div className="text-center max-w-2xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                      What would you like to know about your business?
                    </h1>
                    <p className="text-base text-gray-700 leading-relaxed">
                      Ask me questions about your revenue, bookings, customers, inventory, gift vouchers, or operations. I'll provide insights based on your real-time data.
                    </p>
                  </div>
                </div>

                {/* Focus Area Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(FOCUS_AREAS).map(([key, area]) => (
                    <button
                      key={key}
                      onClick={() => handleFocusAreaClick(key)}
                      className="bg-white border-2 border-gray-200 hover:border-[#2685CF] rounded-xl p-5 text-left transition-all hover:shadow-lg group"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{area.icon}</div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-[#2685CF] transition-colors">
                            {area.label}
                          </h4>
                          <p className="text-xs text-gray-600 mb-3">
                            {area.description}
                          </p>
                          <div className="space-y-1.5">
                            {area.questions.slice(0, 2).map((question, idx) => (
                              <div key={idx} className="text-xs text-gray-500 flex items-start space-x-1.5">
                                <span className="text-[#2685CF] mt-0.5">•</span>
                                <span className="line-clamp-1">{question}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Expanded Questions for Selected Focus Area */}
                {selectedFocus && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-2xl">{FOCUS_AREAS[selectedFocus as keyof typeof FOCUS_AREAS].icon}</span>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {FOCUS_AREAS[selectedFocus as keyof typeof FOCUS_AREAS].label}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-4">Click a question to get started:</p>
                    <div className="space-y-2">
                      {FOCUS_AREAS[selectedFocus as keyof typeof FOCUS_AREAS].questions.map((question, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(question)}
                          className="w-full text-left text-sm bg-white hover:bg-[#2685CF] hover:text-white text-gray-700 px-4 py-3 rounded-lg transition-all border border-blue-200 hover:border-[#2685CF] hover:shadow-md"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setSelectedFocus(null)}
                      className="mt-4 text-xs text-gray-600 hover:text-gray-900 underline"
                    >
                      Back to all focus areas
                    </button>
                  </div>
                )}
              </div>
            )}

            {conversationHistory.map((msg: any, idx: number) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                <div className={`max-w-full w-full ${msg.role === 'user' ? 'ml-auto max-w-2xl' : 'mr-auto'}`}>
                  <div className={`rounded-2xl transition-all duration-200 overflow-hidden ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-[#2685CF] to-blue-600 text-white shadow-md px-5 py-3.5 border border-[#1E6FB0]/20'
                      : 'bg-white text-gray-900 border border-gray-200 shadow-lg'
                  }`}>
                    {msg.role === 'assistant' && (
                      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 py-3.5 flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2685CF] to-blue-600 flex items-center justify-center shadow-md">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-bold text-white tracking-wide">Resova AI Assistant</span>
                        </div>
                        <div className="flex items-center space-x-1.5 bg-green-500/20 px-2.5 py-1 rounded-full border border-green-400/30">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs font-semibold text-green-300">Live</span>
                        </div>
                      </div>
                    )}

                    <div className={msg.role === 'assistant' ? 'px-5 py-5 bg-gradient-to-br from-white to-gray-50' : ''}>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm prose-slate max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:text-base prose-p:leading-relaxed prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:text-gray-700 prose-li:text-base">
                          <MarkdownRenderer content={msg.content} />
                        </div>
                      ) : (
                        <p className="text-base leading-relaxed font-medium">{msg.content}</p>
                      )}
                    </div>

                    {msg.role === 'assistant' && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                      <div className="px-5 pb-5 bg-gradient-to-br from-white to-gray-50">
                        <div className="pt-5 border-t border-gray-200">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-4 h-4 rounded bg-gradient-to-br from-[#2685CF] to-blue-600 flex items-center justify-center">
                              <Sparkles className="w-2.5 h-2.5 text-white" />
                            </div>
                            <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">Suggested Follow-ups</p>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {msg.suggestedQuestions.map((question: string, qIdx: number) => (
                              <button
                                key={qIdx}
                                onClick={() => handleSend(question)}
                                className="w-full text-left text-sm bg-white hover:bg-gradient-to-r hover:from-[#2685CF] hover:to-blue-600 hover:text-white text-gray-800 px-4 py-3 rounded-xl transition-all border border-gray-200 hover:border-[#2685CF] hover:shadow-md group"
                              >
                                <span className="flex items-start space-x-2">
                                  <span className="text-[#2685CF] group-hover:text-white mt-0.5 flex-shrink-0">→</span>
                                  <span className="flex-1">{question}</span>
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex justify-start">
                <div className="max-w-3xl bg-white border border-gray-200 px-5 py-4 rounded-xl shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-[#2685CF] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#2685CF] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-[#2685CF] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Navigation - Always visible when there's conversation history */}
          {conversationHistory.length > 0 && (
            <div className="border-t border-gray-200 bg-white p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Quick Navigation</p>
                <p className="text-xs text-gray-500">Jump to a different area</p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {Object.entries(FOCUS_AREAS).map(([key, area]) => (
                  <button
                    key={key}
                    onClick={() => handleFocusAreaClick(key)}
                    className="flex-shrink-0 flex items-center space-x-2 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-[#2685CF]/10 hover:to-blue-100 border border-gray-200 hover:border-[#2685CF] rounded-lg px-3 py-2 transition-all hover:shadow-sm group"
                  >
                    <span className="text-lg">{area.icon}</span>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-gray-900 group-hover:text-[#2685CF] transition-colors whitespace-nowrap">
                        {area.label}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Expanded Questions for Selected Focus Area in Quick Nav */}
              {selectedFocus && (
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{FOCUS_AREAS[selectedFocus as keyof typeof FOCUS_AREAS].icon}</span>
                      <h4 className="text-xs font-semibold text-gray-900">
                        {FOCUS_AREAS[selectedFocus as keyof typeof FOCUS_AREAS].label}
                      </h4>
                    </div>
                    <button
                      onClick={() => setSelectedFocus(null)}
                      className="text-xs text-gray-600 hover:text-gray-900"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {FOCUS_AREAS[selectedFocus as keyof typeof FOCUS_AREAS].questions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleSend(question);
                          setSelectedFocus(null);
                        }}
                        className="w-full text-left text-xs bg-white hover:bg-[#2685CF] hover:text-white text-gray-700 px-3 py-2 rounded-md transition-all border border-blue-200 hover:border-[#2685CF]"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input Area */}
          <div className="border-t-2 border-[#2685CF]/20 bg-gradient-to-br from-blue-50/50 to-white p-5">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Try: 'What was my revenue last week?' or 'Show me top customers this month'"
                  className="w-full px-4 py-3 text-base text-gray-900 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2685CF] focus:border-[#2685CF] resize-none placeholder:text-gray-500 shadow-sm"
                  rows={2}
                  disabled={chatLoading}
                />
              </div>
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || chatLoading}
                className="px-5 py-3 bg-gradient-to-r from-[#2685CF] to-blue-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all h-[56px] flex items-center justify-center font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 ml-1">Press Enter to send • Shift+Enter for new line</p>
          </div>
        </div>

        {/* Right Column - Charts & Visualizations (40% width) */}
        <div className="lg:w-2/5 bg-white flex flex-col" style={{ minHeight: 'calc(100vh - 250px)' }}>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-[#2685CF]" />
              Visualizations
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Charts appear here when generated by the AI
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeCharts.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <BarChart3 className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No charts yet</p>
                  <p className="text-xs mt-1">Ask the AI to visualize your data</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {activeCharts.map((chart, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm flex flex-col"
                    style={{ minHeight: '400px' }}
                  >
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">{chart.title}</h4>
                      {chart.description && (
                        <p className="text-xs text-gray-600">{chart.description}</p>
                      )}
                    </div>
                    <div className="flex-1" style={{ minHeight: '350px' }}>
                      <DynamicChart chart={chart} height={350} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}