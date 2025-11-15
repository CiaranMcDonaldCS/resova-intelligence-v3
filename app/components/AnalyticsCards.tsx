'use client';

import { useState } from 'react';
import { 
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Bell,
  Receipt,
  MessageSquare,
  Activity,
  User,
  ChevronDown,
  ExternalLink,
  Filter,
  Download,
  Settings,
  BarChart3,
  Sparkles
} from 'lucide-react';
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

// Demo data matching Resova's structure
const DEMO_DATA = {
  todaysAgenda: {
    bookings: 12,
    guests: 48,
    firstBooking: '10:00 AM',
    waiversRequired: 32
  },
  agendaChart: [
    { time: '9am', bookings: 2, guests: 4, itemsBooked: 3 },
    { time: '10am', bookings: 3, guests: 8, itemsBooked: 5 },
    { time: '11am', bookings: 4, guests: 10, itemsBooked: 7 },
    { time: '12pm', bookings: 6, guests: 15, itemsBooked: 9 },
    { time: '1pm', bookings: 8, guests: 18, itemsBooked: 12 },
    { time: '2pm', bookings: 10, guests: 22, itemsBooked: 15 },
    { time: '3pm', bookings: 12, guests: 28, itemsBooked: 18 },
    { time: '4pm', bookings: 11, guests: 24, itemsBooked: 16 },
    { time: '5pm', bookings: 8, guests: 18, itemsBooked: 12 },
    { time: '6pm', bookings: 4, guests: 10, itemsBooked: 6 }
  ],
  upcomingBookings: [
    { time: '10:00 AM', name: 'Jane Doe', item: 'The Alchemist', guests: 4, waiver: '4/4 Signed', notes: '-', staff: 'Alex' },
    { time: '11:30 AM', name: 'John Smith', item: 'Prison Break', guests: 6, waiver: '5/6 Signed', notes: 'Birthday party', staff: 'Maria' },
    { time: '1:00 PM', name: 'The Williams Family', item: 'The Lost Tomb', guests: 5, waiver: '5/5 Signed', notes: '-', staff: 'Alex' },
    { time: '2:30 PM', name: 'Corporate Event', item: 'The Alchemist', guests: 8, waiver: '0/8 Signed', notes: 'Request for team photo', staff: 'John' },
    { time: '4:00 PM', name: 'Team Building', item: 'Prison Break x2', guests: 12, waiver: '2/12 Signed', notes: 'Split into 2 groups', staff: 'Maria, John' }
  ],
  notifications: [
    { user: 'Enterprise User', message: 'You have a new booking, purchased by Enterprise User for a total amount of $6.24', time: '08/10/2025 - 1:04pm' },
    { user: 'Enterprise User', message: 'You have a new booking, purchased by Enterprise User for a total amount of $6.24', time: '08/10/2025 - 1:00pm' },
    { user: 'Enterprise User', message: 'You have a new booking, purchased by Enterprise User for a total amount of $120.00', time: '06/10/2025 - 9:02pm' }
  ],
  transactions: [
    { customer: 'No Customer', date: '08/07/2025 - 1:04pm', ref: 'Purchase: Booking ref#', total: '$6.24', paid: '$6.24', due: '$0.00' },
    { customer: 'No Customer', date: '08/07/2025 - 1:02pm', ref: 'Purchase: Booking ref#', total: '$6.24', paid: '$6.24', due: '$0.00' }
  ],
  bookingNotes: [
    { name: 'Jane Doe', date: '14/08/2025 - 3:45pm', note: 'Customer reported that the lock on the final chest was stuck. Maintenance has been notified.' },
    { name: 'John Smith', date: '14/08/2025 - 11:20am', note: 'A family of four mentioned they would have loved a photo opportunity at the end of the game.' },
    { name: 'Admin', date: '13/08/2025 - 5:00pm', note: 'Remember to reset the Ancient Scroll puzzle after the 6 PM booking. It was missed yesterday.' }
  ],
  activity: [
    { user: 'Enterprise User', action: 'has updated time slot settings for Escape from Demons on 08/13/2025 at 8:00pm', time: '08/13/2025 - 4:11pm' },
    { user: 'Enterprise User', action: 'has updated time slot settings for Escape from Demons on 08/13/2025 at 8:00pm', time: '08/13/2025 - 4:10pm' },
    { user: 'Enterprise User', action: 'created a transaction for a total amount of $15.40', time: '08/13/2025 - 11:1am' }
  ],
  users: [
    { name: 'Ciaran McDonald', status: 'Online', lastLogin: '07/08/2025, 4:09pm' },
    { name: 'Enterprise User', status: 'Online', lastLogin: '-' },
    { name: 'Enterprise User', status: 'Online', lastLogin: '-' }
  ],
  // Venue Performance Data
  periodSummary: {
    gross: 12450,
    grossChange: 13.2,
    net: 10891,
    netChange: 4.8,
    totalSales: 12330,
    totalSalesChange: 1.5,
    discounts: -250,
    discountsChange: -3.9,
    refunded: -120,
    refundedChange: -4.6,
    taxes: 1101,
    taxesChange: 4.9,
    fees: 209,
    feesChange: 10
  },
  revenueTrends: [
    { day: 'Mon', thisGross: 1200, thisNet: 1100, thisSales: 1250, prevGross: 1100, prevNet: 1000, prevSales: 1150 },
    { day: 'Tue', thisGross: 1400, thisNet: 1250, thisSales: 1450, prevGross: 1250, prevNet: 1150, prevSales: 1300 },
    { day: 'Wed', thisGross: 1800, thisNet: 1600, thisSales: 1850, prevGross: 1500, prevNet: 1350, prevSales: 1550 },
    { day: 'Thu', thisGross: 2200, thisNet: 2000, thisSales: 2250, prevGross: 1900, prevNet: 1750, prevSales: 1950 },
    { day: 'Fri', thisGross: 2800, thisNet: 2500, thisSales: 2850, prevGross: 2400, prevNet: 2200, prevSales: 2450 },
    { day: 'Sat', thisGross: 2600, thisNet: 2350, thisSales: 2650, prevGross: 2300, prevNet: 2100, prevSales: 2350 },
    { day: 'Sun', thisGross: 3100, thisNet: 2800, thisSales: 3150, prevGross: 2700, prevNet: 2450, prevSales: 2750 }
  ],
  performance: {
    bestDay: 'Sunday',
    bestDayRevenue: 2810,
    bestDayChange: 15.2,
    topItem: 'The Pharaohs Tomb',
    topItemBookings: 35,
    topItemChange: 8,
    peakTime: '7:00 PM',
    peakTimeBookings: 18,
    peakTimeChange: -3
  },
  paymentCollection: {
    totalPayments: 11362,
    totalChange: 5.1,
    paidAmount: 11400,
    paidPercent: 85,
    unpaidAmount: 1600,
    unpaidPercent: 15,
    cardAmount: 11400,
    cardPercent: 85,
    cashAmount: 1600,
    cashPercent: 15
  },
  salesMetrics: [
    { day: 'Sun', bookings: 8, avgRev: 75 },
    { day: 'Mon', bookings: 6, avgRev: 65 },
    { day: 'Tue', bookings: 7, avgRev: 70 },
    { day: 'Wed', bookings: 9, avgRev: 80 },
    { day: 'Thu', bookings: 10, avgRev: 85 },
    { day: 'Fri', bookings: 11, avgRev: 90 },
    { day: 'Sat', bookings: 12, avgRev: 95 }
  ],
  salesSummary: {
    bookings: 152,
    bookingsChange: 12,
    avgRevPerBooking: 81.91,
    avgRevChange: -3,
    onlineVsOperator: 79,
    onlineChange: 12,
    itemSales: 1200,
    itemSalesChange: 8,
    extraSales: 550,
    extraSalesChange: 10,
    giftVoucherSales: 850,
    giftVoucherChange: 20
  },
  topPurchased: {
    items: [
      { name: 'The Pharaohs Tomb', amount: 850 },
      { name: 'Zombie Apocalypse', amount: 620 },
      { name: 'Prison Break', amount: 450 }
    ],
    extras: [
      { name: 'T-Shirt', amount: 250 },
      { name: 'Extra Hint', amount: 150 },
      { name: 'Souvenir Photo', amount: 100 }
    ],
    vouchers: [
      { name: '$100 Gift Voucher', amount: 400 },
      { name: '$50 Gift Voucher', amount: 250 },
      { name: 'Single Person Pass', amount: 150 }
    ]
  },
  guestMetrics: [
    { day: 'Sun', totalGuests: 25, avgRevPerGuest: 18 },
    { day: 'Mon', totalGuests: 20, avgRevPerGuest: 16 },
    { day: 'Tue', totalGuests: 22, avgRevPerGuest: 17 },
    { day: 'Wed', totalGuests: 28, avgRevPerGuest: 19 },
    { day: 'Thu', totalGuests: 32, avgRevPerGuest: 20 },
    { day: 'Fri', totalGuests: 35, avgRevPerGuest: 21 },
    { day: 'Sat', totalGuests: 38, avgRevPerGuest: 22 }
  ],
  guestSummary: {
    totalGuests: 506,
    totalChange: 5,
    avgRevenuePerGuest: 21.50,
    avgRevChange: 10,
    avgGroupSize: 3.3,
    groupChange: -1,
    repeatCustomers: 25,
    repeatChange: 2,
    noShows: 12,
    noShowChange: -10
  }
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'operations' | 'venue'>('operations');
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [showChat, setShowChat] = useState(false);
  const [demoMode] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Resova AI Analytics</h1>
                <p className="text-sm text-gray-600">Powered by Claude AI</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {demoMode && (
                <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-900">Demo Mode</span>
                </div>
              )}
              <button
                onClick={() => setShowChat(!showChat)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <MessageSquare className="w-4 h-4" />
                <span>AI Assistant</span>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-6">
        {/* Dashboard Title & Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
            <div className="flex items-center space-x-6 mt-4">
              <button
                onClick={() => setActiveTab('operations')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'operations'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Operations
              </button>
              <button
                onClick={() => setActiveTab('venue')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'venue'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Venue Performance
              </button>
            </div>
          </div>
          {activeTab === 'venue' && (
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          )}
        </div>

        {/* Operations Tab */}
        {activeTab === 'operations' && (
          <div className="space-y-6">
            {/* Today's Agenda */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Today's Agenda</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Metrics */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Bookings</p>
                    <p className="text-3xl font-bold text-gray-900">{DEMO_DATA.todaysAgenda.bookings}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Guests</p>
                    <p className="text-3xl font-bold text-gray-900">{DEMO_DATA.todaysAgenda.guests}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">First Booking</p>
                    <p className="text-3xl font-bold text-gray-900">{DEMO_DATA.todaysAgenda.firstBooking}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Waivers Required</p>
                    <p className="text-3xl font-bold text-gray-900">{DEMO_DATA.todaysAgenda.waiversRequired}</p>
                  </div>
                </div>

                {/* Chart */}
                <div className="lg:col-span-3">
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={DEMO_DATA.agendaChart}>
                      <defs>
                        <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorGuests" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorItems" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="bookings" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBookings)" name="Bookings" />
                      <Area type="monotone" dataKey="guests" stroke="#10b981" fillOpacity={1} fill="url(#colorGuests)" name="Guests" />
                      <Area type="monotone" dataKey="itemsBooked" stroke="#f59e0b" fillOpacity={1} fill="url(#colorItems)" name="Items Booked" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Bookings</h3>
                <p className="text-sm text-gray-600">Showing 5 of 15 upcoming bookings</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Time</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Booking Name</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Item</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Guests</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Waiver Status</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Notes</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Staff</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_DATA.upcomingBookings.map((booking, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{booking.time}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{booking.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{booking.item}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{booking.guests}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            booking.waiver.includes('0/') ? 'bg-red-100 text-red-800' :
                            booking.waiver.split('/')[0] === booking.waiver.split('/')[1].split(' ')[0] ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.waiver}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{booking.notes}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{booking.staff}</td>
                        <td className="py-3 px-4">
                          <button className="text-indigo-600 hover:text-indigo-700">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-center mt-4">
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Three Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Latest Notifications */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Latest Notifications</h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {DEMO_DATA.notifications.map((notif, index) => (
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Latest Transactions</h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {DEMO_DATA.transactions.map((trans, index) => (
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Latest Booking Notes</h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {DEMO_DATA.bookingNotes.map((note, index) => (
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Latest Activity</h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {DEMO_DATA.activity.map((act, index) => (
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Users</h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Users className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {DEMO_DATA.users.map((user, index) => (
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

        {/* Venue Performance Tab - NEXT MESSAGE */}
        {activeTab === 'venue' && (
          <VenuePerformance data={DEMO_DATA} />
        )}
      </div>

      {/* AI Chat Sidebar */}
      {showChat && (
        <AIChatSidebar onClose={() => setShowChat(false)} />
      )}
    </div>
  );
}

// Venue Performance Component (separate for organization)
function VenuePerformance({ data }: any) {
  return (
    <div className="space-y-6">
      {/* Period Summary & Revenue Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Period Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Period Summary</h3>
          
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3">Revenue Overview</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Gross</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold text-gray-900">${data.periodSummary.gross.toLocaleString()}</p>
                    <span className="text-sm text-green-600">+{data.periodSummary.grossChange}%</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Net</p>
                    <div className="flex items-baseline space-x-1">
                      <p className="text-lg font-bold text-gray-900">${data.periodSummary.net.toLocaleString()}</p>
                      <span className="text-xs text-green-600">+{data.periodSummary.netChange}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Sales</p>
                    <div className="flex items-baseline space-x-1">
                      <p className="text-lg font-bold text-gray-900">${data.periodSummary.totalSales.toLocaleString()}</p>
                      <span className="text-xs text-green-600">+{data.periodSummary.totalSalesChange}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3">Adjustments</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Discounts</p>
                  <div className="flex items-baseline space-x-1">
                    <p className="text-lg font-bold text-red-600">${Math.abs(data.periodSummary.discounts)}</p>
                    <span className="text-xs text-red-600">{data.periodSummary.discountsChange}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Refunded</p>
                  <div className="flex items-baseline space-x-1">
                    <p className="text-lg font-bold text-red-600">${Math.abs(data.periodSummary.refunded)}</p>
                    <span className="text-xs text-red-600">{data.periodSummary.refundedChange}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Taxes</p>
                  <div className="flex items-baseline space-x-1">
                    <p className="text-lg font-bold text-gray-900">${data.periodSummary.taxes.toLocaleString()}</p>
                    <span className="text-xs text-green-600">+{data.periodSummary.taxesChange}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Fees</p>
                  <div className="flex items-baseline space-x-1">
                    <p className="text-lg font-bold text-gray-900">${data.periodSummary.fees}</p>
                    <span className="text-xs text-green-600">+{data.periodSummary.feesChange}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3">Payment Collection</p>
              <div className="mb-2">
                <p className="text-xs text-gray-600 mb-1">Total Payments</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-2xl font-bold text-gray-900">${data.paymentCollection.totalPayments.toLocaleString()}</p>
                  <span className="text-sm text-green-600">+{data.paymentCollection.totalChange}%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Paid vs Unpaid</span>
                    <span className="text-gray-900">${data.paymentCollection.paidAmount.toLocaleString()} / ${data.paymentCollection.unpaidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-green-500" style={{ width: `${data.paymentCollection.paidPercent}%` }}></div>
                    <div className="bg-red-500" style={{ width: `${data.paymentCollection.unpaidPercent}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Card vs Cash</span>
                    <span className="text-gray-900">Card: {data.paymentCollection.cardPercent}% / Cash: {data.paymentCollection.cashPercent}%</span>
                  </div>
                  <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-indigo-500" style={{ width: `${data.paymentCollection.cardPercent}%` }}></div>
                    <div className="bg-gray-400" style={{ width: `${data.paymentCollection.cashPercent}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Trends Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Revenue Trends</h3>
              <p className="text-sm text-gray-600">Daily data for the last 30 days</p>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span className="text-gray-900">This Period</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 border-2 border-indigo-300 rounded-full"></div>
                <span className="text-gray-600">Previous Period</span>
              </div>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.revenueTrends}>
              <defs>
                <linearGradient id="colorThisGross" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="thisGross" 
                stroke="#6366f1" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorThisGross)" 
                name="Gross Revenue"
              />
              <Line 
                type="monotone" 
                dataKey="prevGross" 
                stroke="#c7d2fe" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Previous Period"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <button className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">
              Gross Revenue
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100">
              Net Revenue
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100">
              Total Sales
            </button>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Performance Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Best Day</p>
            <p className="text-xl font-bold text-gray-900 mb-1">{data.performance.bestDay}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold text-gray-900">${data.performance.bestDayRevenue.toLocaleString()}</p>
              <span className="text-sm text-green-600">+{data.performance.bestDayChange}%</span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Top Item</p>
            <p className="text-xl font-bold text-gray-900 mb-1">{data.performance.topItem}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold text-gray-900">{data.performance.topItemBookings} Bookings</p>
              <span className="text-sm text-green-600">+{data.performance.topItemChange}%</span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Peak Time</p>
            <p className="text-xl font-bold text-gray-900 mb-1">{data.performance.peakTime}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold text-gray-900">{data.performance.peakTimeBookings} Bookings</p>
              <span className="text-sm text-red-600">{data.performance.peakTimeChange}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Continue in next message with Sales Metrics, Guest Metrics, etc. */}
      <SalesMetrics data={data} />
      <GuestMetrics data={data} />
    </div>
  );
}

// Sales Metrics Component
function SalesMetrics({ data }: any) {
  return (
    <div className="space-y-6">
      {/* Sales Metrics Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Sales Metrics</h3>
            <p className="text-sm text-gray-600">Includes: Bookings • Add-ons • Gift Cards • Items • Walk-ins</p>
          </div>
          <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            View All Sales Data →
          </a>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.salesMetrics}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '12px' }} label={{ value: 'Day of Week', position: 'insideBottom', offset: -5, style: { fontSize: '12px', fill: '#6b7280' } }} />
            <YAxis yAxisId="left" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis yAxisId="right" orientation="right" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#6366f1" strokeWidth={2} name="Bookings" dot={{ fill: '#6366f1' }} />
            <Line yAxisId="right" type="monotone" dataKey="avgRev" stroke="#a78bfa" strokeWidth={2} strokeDasharray="5 5" name="Avg Rev / Booking" dot={{ fill: '#a78bfa' }} />
          </LineChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-6">
          <div>
            <p className="text-xs text-gray-600 mb-1">Bookings</p>
            <div className="flex items-baseline space-x-1">
              <p className="text-xl font-bold text-gray-900">{data.salesSummary.bookings.toLocaleString()}</p>
              <span className={`text-xs ${data.salesSummary.bookingsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.salesSummary.bookingsChange >= 0 ? '+' : ''}{data.salesSummary.bookingsChange}%
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-600 mb-1">Avg Rev / Booking</p>
            <div className="flex items-baseline space-x-1">
              <p className="text-xl font-bold text-gray-900">${data.salesSummary.avgRevPerBooking.toFixed(2)}</p>
              <span className={`text-xs ${data.salesSummary.avgRevChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.salesSummary.avgRevChange >= 0 ? '+' : ''}{data.salesSummary.avgRevChange}%
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-600 mb-1">Online Vs Operator</p>
            <div className="flex items-baseline space-x-1">
              <p className="text-xl font-bold text-gray-900">{data.salesSummary.onlineVsOperator}%</p>
              <span className="text-sm text-gray-600">Online</span>
            </div>
            <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600" style={{ width: `${data.salesSummary.onlineVsOperator}%` }}></div>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-600 mb-1">Item Sales</p>
            <div className="flex items-baseline space-x-1">
              <p className="text-xl font-bold text-gray-900">${data.salesSummary.itemSales.toLocaleString()}</p>
              <span className="text-xs text-green-600">+{data.salesSummary.itemSalesChange}%</span>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-600 mb-1">Extra Sales</p>
            <div className="flex items-baseline space-x-1">
              <p className="text-xl font-bold text-gray-900">${data.salesSummary.extraSales.toLocaleString()}</p>
              <span className="text-xs text-green-600">+{data.salesSummary.extraSalesChange}%</span>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-600 mb-1">Gift Voucher Sales</p>
            <div className="flex items-baseline space-x-1">
              <p className="text-xl font-bold text-gray-900">${data.salesSummary.giftVoucherSales.toLocaleString()}</p>
              <span className="text-xs text-green-600">+{data.salesSummary.giftVoucherChange}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Purchased */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Top 3 Items Purchased</h3>
          <div className="space-y-3">
            {data.topPurchased.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-900">{item.name}</span>
                <span className="text-sm font-medium text-gray-900">${item.amount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Top 3 Extras Purchased</h3>
          <div className="space-y-3">
            {data.topPurchased.extras.map((extra: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-900">{extra.name}</span>
                <span className="text-sm font-medium text-gray-900">${extra.amount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Top 3 Gift Vouchers Purchased</h3>
          <div className="space-y-3">
            {data.topPurchased.vouchers.map((voucher: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-900">{voucher.name}</span>
                <span className="text-sm font-medium text-gray-900">${voucher.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Guest Metrics Component
function GuestMetrics({ data }: any) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Guest Metrics</h3>
        <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          View Guest Report →
        </a>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data.guestMetrics}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '12px' }} label={{ value: 'Day of Week', position: 'insideBottom', offset: -5, style: { fontSize: '12px', fill: '#6b7280' } }} />
          <YAxis yAxisId="left" stroke="#6b7280" style={{ fontSize: '12px' }} />
          <YAxis yAxisId="right" orientation="right" stroke="#6b7280" style={{ fontSize: '12px' }} />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="totalGuests" stroke="#6366f1" strokeWidth={2} name="Total Guests" dot={{ fill: '#6366f1' }} />
          <Line yAxisId="right" type="monotone" dataKey="avgRevPerGuest" stroke="#a78bfa" strokeWidth={2} strokeDasharray="5 5" name="Avg Rev / Guest" dot={{ fill: '#a78bfa' }} />
        </LineChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
        <div>
          <p className="text-xs text-gray-600 mb-1">Total Guests</p>
          <div className="flex items-baseline space-x-1">
            <p className="text-xl font-bold text-gray-900">{data.guestSummary.totalGuests}</p>
            <span className="text-xs text-green-600">+{data.guestSummary.totalChange}%</span>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-1">Avg. Revenue / Guest</p>
          <div className="flex items-baseline space-x-1">
            <p className="text-xl font-bold text-gray-900">${data.guestSummary.avgRevenuePerGuest.toFixed(2)}</p>
            <span className={`text-xs ${data.guestSummary.avgRevChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.guestSummary.avgRevChange >= 0 ? '+' : ''}{data.guestSummary.avgRevChange}%
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-1">Avg Group Size</p>
          <div className="flex items-baseline space-x-1">
            <p className="text-xl font-bold text-gray-900">{data.guestSummary.avgGroupSize.toFixed(1)}</p>
            <span className={`text-xs ${data.guestSummary.groupChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.guestSummary.groupChange >= 0 ? '+' : ''}{data.guestSummary.groupChange}%
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-1">Repeat Customers %</p>
          <div className="flex items-baseline space-x-1">
            <p className="text-xl font-bold text-gray-900">{data.guestSummary.repeatCustomers}%</p>
            <span className="text-xs text-green-600">+{data.guestSummary.repeatChange}%</span>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-1">No-Shows</p>
          <div className="flex items-baseline space-x-1">
            <p className="text-xl font-bold text-red-600">{data.guestSummary.noShows}</p>
            <span className="text-xs text-green-600">{data.guestSummary.noShowChange}%</span>
          </div>
        </div>

        <div></div>
      </div>
    </div>
  );
}

// AI Chat Sidebar Component
function AIChatSidebar({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">AI Assistant</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-lg p-3">
            <p className="text-sm text-gray-900">
              Hi! I'm your AI analytics assistant. Ask me anything about your Resova data and I'll help you understand trends and make better decisions.
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-600 uppercase">Suggested Questions:</p>
            <button className="w-full text-left p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
              <p className="text-sm text-indigo-900 font-medium">What's my best performing day this week?</p>
            </button>
            <button className="w-full text-left p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
              <p className="text-sm text-indigo-900 font-medium">Which service should I promote more?</p>
            </button>
            <button className="w-full text-left p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
              <p className="text-sm text-indigo-900 font-medium">How can I reduce no-shows?</p>
            </button>
            <button className="w-full text-left p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
              <p className="text-sm text-indigo-900 font-medium">What time slots need more marketing?</p>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
          />
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}