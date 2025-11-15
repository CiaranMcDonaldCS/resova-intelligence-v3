'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat, useAnalytics } from '../context/AppContext';
import { MessageSquare, TrendingUp, BarChart3, DollarSign, Users, Sparkles, Send, Copy } from 'lucide-react';
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
  ResponsiveContainer
} from 'recharts';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ChartGrid } from './DynamicChart';
import { parseChartsFromResponse } from '@/app/lib/utils/chart-parser';
import { parseFollowUpQuestions, removeFollowUpQuestions } from '@/app/lib/utils/parse-follow-up-questions';

const SUGGESTED_QUESTIONS = [
  "What's my best performing day this week?",
  "Which service should I promote more?",
  "How can I reduce no-shows?",
  "What's my average group size?",
];

interface AiAssistantProps {
  onClose: () => void;
}

const COLORS = ['#2685CF', '#3A0CA3', '#7209B7', '#F72585', '#4CC9F0'];

export function AiAssistant({ onClose }: AiAssistantProps) {
  const { analyticsData } = useAnalytics();
  const {
    conversationHistory,
    chatLoading,
    sendMessage
  } = useChat();

  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'insights'>('chat');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === 'chat') {
      inputRef.current?.focus();
    }
  }, [activeTab]);

  const handleSuggestedQuestion = (question: string) => {
    handleSend(question);
  };

  const handleSend = async (messageText?: string) => {
    const userMessage = messageText || input.trim();
    if (!userMessage || chatLoading) return;

    setInput('');
    await sendMessage(userMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[700px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2685CF] to-blue-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Resova Intelligence</h3>
              <p className="text-xs text-blue-100">Intelligent Analytics Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white px-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'chat'
                  ? 'border-[#2685CF] text-[#2685CF]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'insights'
                  ? 'border-[#2685CF] text-[#2685CF]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Performance Insights
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' ? (
            <ChatTab
              conversationHistory={conversationHistory}
              chatLoading={chatLoading}
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              handleKeyDown={handleKeyDown}
              handleSuggestedQuestion={handleSuggestedQuestion}
              inputRef={inputRef}
              analyticsData={analyticsData}
            />
          ) : (
            <InsightsTab analyticsData={analyticsData} />
          )}
        </div>
      </div>
    </div>
  );
}

// Chat Tab Component
function ChatTab({
  conversationHistory,
  chatLoading,
  input,
  setInput,
  handleSend,
  handleKeyDown,
  handleSuggestedQuestion,
  inputRef,
  analyticsData
}: any) {
  // Get follow-up questions from the last assistant message
  const lastAssistantMessage = conversationHistory.length > 0
    ? conversationHistory[conversationHistory.length - 1]
    : null;

  const followUpQuestions = lastAssistantMessage?.role === 'assistant'
    ? parseFollowUpQuestions(lastAssistantMessage.content)
    : [];

  // Ref to track scroll position and prevent auto-scroll
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);

  // Prevent automatic scrolling when new messages are added
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Lock scroll position when content changes
    const currentScrollHeight = container.scrollHeight;
    const previousScrollHeight = prevScrollHeightRef.current;

    if (previousScrollHeight > 0 && currentScrollHeight > previousScrollHeight) {
      // Content was added, maintain the scroll position
      const scrollDiff = currentScrollHeight - previousScrollHeight;
      container.scrollTop = container.scrollTop + scrollDiff - scrollDiff;
    }

    prevScrollHeightRef.current = currentScrollHeight;
  }, [conversationHistory, chatLoading]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-5 bg-gradient-to-b from-gray-50 to-white"
        style={{ overflowAnchor: 'none' }}
      >
        {conversationHistory.length === 0 && (
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#2685CF] to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 bg-white px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
                  <div className="text-sm leading-relaxed text-gray-800 space-y-3">
                    <p className="font-semibold text-gray-900">Hi! I'm your AI business advisor with 15+ years of experience helping tour and activity operators grow their businesses.</p>

                    <p>I've analyzed your data and I'm ready to help you:</p>

                    <ul className="space-y-1.5 ml-1">
                      <li className="flex items-start">
                        <span className="text-[#2685CF] mr-2 mt-0.5">•</span>
                        <span><strong>Maximize revenue:</strong> Identify high-performing activities and optimal pricing</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#2685CF] mr-2 mt-0.5">•</span>
                        <span><strong>Optimize capacity:</strong> Find underutilized time slots and expansion opportunities</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#2685CF] mr-2 mt-0.5">•</span>
                        <span><strong>Boost profitability:</strong> Get ROI-ranked recommendations with dollar amounts</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#2685CF] mr-2 mt-0.5">•</span>
                        <span><strong>Make data-driven decisions:</strong> Visual charts and actionable insights</span>
                      </li>
                    </ul>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mt-3">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Quick Insight:</p>
                      <p className="text-xs text-gray-600">
                        I can see your revenue data, capacity utilization, and activity profitability. Ask me anything from "Where are my biggest profit leaks?" to "Which time slots should I expand?"
                      </p>
                    </div>

                    <p className="text-gray-600 text-xs pt-1">Choose a suggested question below or ask me anything about your business!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {conversationHistory.map((msg: any, idx: number) => {
          const charts = msg.role !== 'user' ? parseChartsFromResponse(msg.content, analyticsData) : [];
          const contentWithoutFollowUp = msg.role !== 'user' ? removeFollowUpQuestions(msg.content) : msg.content;

          return (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'user' ? (
                <div className="max-w-[85%]">
                  <div className="bg-gradient-to-br from-[#2685CF] to-blue-600 px-5 py-4 rounded-2xl rounded-br-sm shadow-md">
                    <div className="text-sm leading-relaxed text-white whitespace-pre-line">{msg.content}</div>
                  </div>
                </div>
              ) : (
                <div className="max-w-[85%]">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#2685CF] to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 relative group">
                        {/* Copy button for response */}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content);
                          }}
                          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                          title="Copy response"
                        >
                          <Copy className="w-4 h-4 text-gray-600" />
                        </button>
                        <MarkdownRenderer content={contentWithoutFollowUp} />
                        {/* Render charts if present */}
                        <ChartGrid charts={charts} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {chatLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#2685CF] to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-100 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#2685CF] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#2685CF] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-2 h-2 bg-[#2685CF] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    <span className="text-xs text-gray-500 ml-2 font-medium">Analyzing...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Follow-up Questions - Fixed position above input */}
      {!chatLoading && (conversationHistory.length === 0 || followUpQuestions.length > 0) && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#2685CF]" />
            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
              {conversationHistory.length === 0 ? 'Suggested Questions' : 'Follow-up Questions'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(conversationHistory.length === 0 ? SUGGESTED_QUESTIONS : followUpQuestions).map((question: string, idx: number) => (
              <button
                key={idx}
                onClick={() => handleSuggestedQuestion(question)}
                className="group text-left text-xs bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 text-gray-700 px-3 py-2 rounded-lg transition-all duration-200 border border-gray-200 hover:border-[#2685CF] hover:shadow-sm flex items-center gap-1.5"
              >
                <span className="group-hover:text-[#2685CF] font-medium transition-colors">{question}</span>
                <Send className="w-3 h-3 text-gray-400 group-hover:text-[#2685CF] opacity-0 group-hover:opacity-100 transition-all" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-6 border-t border-gray-200 bg-white shadow-lg">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your data..."
              className="w-full px-5 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2685CF] focus:border-[#2685CF] bg-white transition-all shadow-sm"
              disabled={chatLoading}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || chatLoading}
            className="px-5 py-3.5 bg-gradient-to-r from-[#2685CF] to-blue-600 text-white rounded-xl hover:from-[#1E6FB0] hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center min-w-[60px]"
          >
            {chatLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2.5 flex items-center">
          <kbd className="px-2 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">Enter</kbd>
          <span className="ml-1.5">to send</span>
        </p>
      </div>
    </div>
  );
}

// Insights Tab Component
function InsightsTab({ analyticsData }: any) {
  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  const { periodSummary, performance, revenueTrends, topPurchased, guestSummary, paymentCollection } = analyticsData;

  // Prepare data for pie chart
  const revenueBreakdown = [
    { name: 'Items', value: periodSummary.totalSales },
    { name: 'Taxes', value: periodSummary.taxes },
    { name: 'Fees', value: periodSummary.fees },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-gray-50">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          icon={<DollarSign className="w-5 h-5" />}
          title="Total Revenue"
          value={`$${periodSummary.gross.toLocaleString()}`}
          change={periodSummary.grossChange}
          color="blue"
        />
        <MetricCard
          icon={<BarChart3 className="w-5 h-5" />}
          title="Total Bookings"
          value={periodSummary.totalSales}
          change={periodSummary.totalSalesChange}
          color="indigo"
        />
        <MetricCard
          icon={<Users className="w-5 h-5" />}
          title="Total Guests"
          value={guestSummary.totalGuests}
          change={guestSummary.totalChange}
          color="purple"
        />
      </div>

      {/* Performance Highlights */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-[#2685CF]" />
          Performance Highlights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HighlightCard
            label="Best Day"
            value={performance.bestDay}
            subValue={`$${performance.bestDayRevenue.toLocaleString()}`}
            change={performance.bestDayChange}
          />
          <HighlightCard
            label="Top Service"
            value={performance.topItem}
            subValue={`${performance.topItemBookings} bookings`}
            change={performance.topItemChange}
          />
          <HighlightCard
            label="Peak Time"
            value={performance.peakTime}
            subValue={`${performance.peakTimeBookings} bookings`}
            change={performance.peakTimeChange}
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Trends Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Revenue Trends (7 Days)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="thisGross" stroke="#2685CF" strokeWidth={2} name="Gross Revenue" />
              <Line type="monotone" dataKey="thisNet" stroke="#7209B7" strokeWidth={2} name="Net Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Services Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Top Services by Revenue</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topPurchased.items}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '11px' }} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip />
              <Bar dataKey="amount" fill="#2685CF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Collection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Payment Collection Overview</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-3">
              <PaymentStat
                label="Total Collected"
                value={`$${paymentCollection.paidAmount.toLocaleString()}`}
                percentage={paymentCollection.paidPercent}
                color="green"
              />
              <PaymentStat
                label="Outstanding"
                value={`$${paymentCollection.unpaidAmount.toLocaleString()}`}
                percentage={paymentCollection.unpaidPercent}
                color="red"
              />
              <PaymentStat
                label="Card Payments"
                value={`$${paymentCollection.cardAmount.toLocaleString()}`}
                percentage={paymentCollection.cardPercent}
                color="blue"
              />
              <PaymentStat
                label="Cash Payments"
                value={`$${paymentCollection.cashAmount.toLocaleString()}`}
                percentage={paymentCollection.cashPercent}
                color="gray"
              />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={revenueBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueBreakdown.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Guest Analytics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Guest Analytics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GuestMetric
            label="Avg Group Size"
            value={guestSummary.avgGroupSize.toFixed(1)}
            change={guestSummary.groupChange}
          />
          <GuestMetric
            label="Avg Revenue/Guest"
            value={`$${guestSummary.avgRevenuePerGuest.toFixed(2)}`}
            change={guestSummary.avgRevChange}
          />
          <GuestMetric
            label="Repeat Customers"
            value={`${guestSummary.repeatCustomers.toFixed(1)}%`}
            change={guestSummary.repeatChange}
          />
          <GuestMetric
            label="No-Shows"
            value={guestSummary.noShows}
            change={guestSummary.noShowChange}
          />
        </div>
      </div>
    </div>
  );
}

// Helper Components
function MetricCard({ icon, title, value, change, color }: any) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className={`text-xs font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
        </div>
      </div>
      <div className="mt-3">
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
}

function HighlightCard({ label, value, subValue, change }: any) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-sm text-gray-600">{subValue}</p>
        <p className={`text-xs font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
        </p>
      </div>
    </div>
  );
}

function PaymentStat({ label, value, percentage, color }: any) {
  const colorClasses: Record<string, string> = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    gray: 'bg-gray-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}%</p>
    </div>
  );
}

function GuestMetric({ label, value, change }: any) {
  return (
    <div className="text-center">
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className={`text-xs font-medium mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
      </p>
    </div>
  );
}
