'use client';

import { useEffect, useState, useRef } from 'react';
import { useApp, useAnalytics, useChat } from '../context/AppContext';
import { useRouter } from 'next/navigation';
import { ConfigStorage } from '@/app/lib/storage/config-storage';

export default function Dashboard() {
  const router = useRouter();
  const { logout, isAuthenticated } = useApp();
  const {
    analyticsData,
    analyticsLoading,
    analyticsError,
    fetchAnalytics,
  } = useAnalytics();
  const { conversationHistory, chatLoading, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const chatChartsRef = useRef<Map<string, any>>(new Map());

  // Track if component has mounted
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Redirect to onboarding if not authenticated (but only after mount to avoid race conditions)
  useEffect(() => {
    if (hasMounted && !isAuthenticated) {
      router.push('/onboarding');
    }
  }, [isAuthenticated, router, hasMounted]);

  // Handle logout with redirect
  const handleLogout = () => {
    logout();
    router.push('/onboarding');
  };

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [conversationHistory]);

  // Initialize Chart.js
  useEffect(() => {
    if (!analyticsData) return;

    // Wait for Chart.js to load from CDN
    const initChart = () => {
      const canvas = document.getElementById('revenueChart') as HTMLCanvasElement;
      if (!canvas || !(window as any).Chart) return;

      // Destroy existing chart if it exists
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Extract revenue trend data from analyticsData
      const revenueTrend = analyticsData.revenueTrends || [];

      let labels: string[] = [];
      let data: number[] = [];

      if (revenueTrend.length > 0) {
        labels = revenueTrend.map((item: any) => {
          const date = new Date(item.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        data = revenueTrend.map((item: any) => item.revenue || 0);
      } else {
        // Fallback to daily breakdown if revenueTrends is not available
        const dailyBreakdown = analyticsData.dailyBreakdown || [];
        if (dailyBreakdown.length > 0) {
          labels = dailyBreakdown.slice(-7).map((item: any) => {
            const date = new Date(item.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          });
          data = dailyBreakdown.slice(-7).map((item: any) => item.revenue || 0);
        } else {
          // No data available
          labels = ['No Data'];
          data = [0];
        }
      }

      // Create chart
      const Chart = (window as any).Chart;
      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Revenue',
            data: data,
            backgroundColor: 'rgba(61, 141, 218, 0.1)',
            borderColor: '#3D8DDA',
            borderWidth: 2,
            pointBackgroundColor: '#FFFFFF',
            pointBorderColor: '#3D8DDA',
            pointHoverBackgroundColor: '#3D8DDA',
            pointHoverBorderColor: '#FFFFFF',
            pointRadius: 4,
            pointHoverRadius: 7,
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          layout: {
            padding: {
              top: 10,
              right: 10,
              bottom: 5,
              left: 5
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: true,
              backgroundColor: '#1D212B',
              titleColor: '#FFFFFF',
              bodyColor: '#A0A0A0',
              borderColor: '#383838',
              borderWidth: 1,
              padding: 10,
              displayColors: false,
              callbacks: {
                label: function(context: any) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0
                    }).format(context.parsed.y);
                  }
                  return label;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(56, 56, 56, 0.7)',
                borderDash: [2, 4]
              },
              ticks: {
                color: '#A0A0A0',
                callback: function(value: any) {
                  return '$' + (value / 1000) + 'k';
                }
              },
              border: {
                display: false
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#A0A0A0'
              },
              border: {
                display: false
              }
            }
          }
        }
      });
    };

    // Check if Chart.js is loaded, otherwise wait for it
    if ((window as any).Chart) {
      initChart();
    } else {
      const checkChart = setInterval(() => {
        if ((window as any).Chart) {
          clearInterval(checkChart);
          initChart();
        }
      }, 100);

      // Cleanup interval after 5 seconds
      setTimeout(() => clearInterval(checkChart), 5000);
    }

    // Cleanup on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [analyticsData]);

  // Helper function to convert cents to dollars
  const convertCentsToDollars = (value: number): number => {
    // If value is suspiciously large (> 1000), it's probably in cents
    return value > 1000 ? value / 100 : value;
  };

  // Copy message content to clipboard (including the original question)
  const handleCopyMessage = async (content: string, messageIndex: number) => {
    try {
      // Find the corresponding user message (assistant messages come after user messages)
      let userQuestion = '';

      // Look backwards to find the most recent user message before this assistant message
      for (let i = messageIndex - 1; i >= 0; i--) {
        if (conversationHistory[i].role === 'user') {
          userQuestion = conversationHistory[i].content;
          break;
        }
      }

      // Format the text with both question and answer
      const formattedText = userQuestion
        ? `Question: ${userQuestion}\n\nAnswer:\n${content}`
        : content;

      await navigator.clipboard.writeText(formattedText);
      setCopiedMessageIndex(messageIndex);
      setTimeout(() => setCopiedMessageIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Helper function to get chart data from dataSource
  const getChartDataFromSource = (dataSource: string) => {
    if (!analyticsData) {
      return { labels: ['No Data'], data: [0] };
    }

    console.log('📊 Chart data request:', { dataSource, availableData: Object.keys(analyticsData) });

    switch (dataSource) {
      case 'revenue_trend': {
        const revenueTrend = analyticsData.revenueTrends || analyticsData.dailyBreakdown || [];
        if (revenueTrend.length === 0) {
          console.warn('⚠️ No revenue trend data available');
          return { labels: ['No Data'], data: [0] };
        }

        const labels = revenueTrend.map((item: any) => {
          const date = new Date(item.date || item.date_short);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        // Revenue is stored in cents, convert to dollars
        const data = revenueTrend.map((item: any) => {
          const rawValue = item.revenue || item.gross || 0;
          return convertCentsToDollars(rawValue);
        });

        console.log('📊 Revenue trend data:', {
          source: dataSource,
          dataPoints: data.length,
          rawSample: revenueTrend[0],
          convertedSample: data[0],
          total: data.reduce((sum: number, val: number) => sum + val, 0)
        });

        return { labels, data };
      }

      case 'bookings_by_day': {
        const dailyBreakdown = analyticsData.dailyBreakdown || [];
        if (dailyBreakdown.length === 0) return { labels: ['No Data'], data: [0] };

        // Group by day of week
        const dayMap: { [key: string]: number } = {};
        dailyBreakdown.forEach((item: any) => {
          const date = new Date(item.date);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          dayMap[dayName] = (dayMap[dayName] || 0) + (item.bookings || 0);
        });

        const daysOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const labels = daysOrder.filter(day => dayMap[day] !== undefined);
        const data = labels.map(day => dayMap[day]);

        return { labels, data };
      }

      case 'bookings_by_service':
      case 'revenue_by_service': {
        const profitability = analyticsData.businessInsights?.activityProfitability || [];
        if (profitability.length === 0) {
          console.warn('⚠️ No activity profitability data available');
          return { labels: ['No Data'], data: [0] };
        }

        const top5 = profitability.slice(0, 5);
        const labels = top5.map((item: any) => item.name);
        const data = top5.map((item: any) => {
          if (dataSource === 'bookings_by_service') {
            return item.totalBookings;
          }
          // Revenue conversion from cents to dollars
          const rawValue = item.totalSales || 0;
          return convertCentsToDollars(rawValue);
        });

        console.log('📊 Service data:', {
          source: dataSource,
          dataPoints: data.length,
          sampleLabel: labels[0],
          sampleValue: data[0]
        });

        return { labels, data };
      }

      case 'payment_status': {
        const paymentCollection = analyticsData.paymentCollection;
        if (!paymentCollection) return { labels: ['No Data'], data: [0] };

        return {
          labels: ['Paid', 'Unpaid'],
          data: [paymentCollection.paidPercent, paymentCollection.unpaidPercent]
        };
      }

      case 'guest_trend': {
        const dailyBreakdown = analyticsData.dailyBreakdown || [];
        if (dailyBreakdown.length === 0) return { labels: ['No Data'], data: [0] };

        const labels = dailyBreakdown.map((item: any) => {
          const date = new Date(item.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        const data = dailyBreakdown.map((item: any) => item.guests || 0);
        return { labels, data };
      }

      case 'sales_metrics':
      case 'guest_metrics': {
        const dailyBreakdown = analyticsData.dailyBreakdown || [];
        if (dailyBreakdown.length === 0) {
          console.warn('⚠️ No daily summary data available');
          return { labels: ['No Data'], data: [0] };
        }

        const labels = dailyBreakdown.slice(-7).map((item: any) => {
          const date = new Date(item.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        const data = dailyBreakdown.slice(-7).map((item: any) => {
          if (dataSource === 'sales_metrics') {
            const rawValue = item.gross || 0;
            return convertCentsToDollars(rawValue);
          }
          return item.guests || 0;
        });

        console.log('📊 Metrics data:', {
          source: dataSource,
          dataPoints: data.length,
          sampleData: data.slice(0, 3)
        });

        return { labels, data };
      }

      default:
        console.warn(`⚠️ Unknown data source: ${dataSource}, no data available`);
        return { labels: ['No Data'], data: [0] };
    }
  };

  // Initialize charts in chat messages
  useEffect(() => {
    if (!conversationHistory || conversationHistory.length === 0) return;
    if (!(window as any).Chart) return;

    // Destroy all existing charts first
    chatChartsRef.current.forEach((chart) => {
      chart.destroy();
    });
    chatChartsRef.current.clear();

    conversationHistory.forEach((msg: any, idx: number) => {
      if (msg.role === 'assistant' && msg.charts && msg.charts.length > 0) {
        msg.charts.forEach((chartSpec: any, chartIdx: number) => {
          const chartId = `chart-${idx}-${chartIdx}`;
          const canvas = document.getElementById(chartId) as HTMLCanvasElement;

          if (!canvas) {
            console.warn(`Canvas not found for chart: ${chartId}`);
            return;
          }

          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Get actual data based on dataSource
          console.log('🎨 Creating chart:', { chartId, dataSource: chartSpec.dataSource, type: chartSpec.type });
          const chartData = getChartDataFromSource(chartSpec.dataSource);
          const chartType = chartSpec.type || 'line';

          // Different colors for different chart types
          const colors = [
            '#3D8DDA', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
          ];

          const Chart = (window as any).Chart;

          // Build dataset configuration based on chart type
          let datasetConfig: any = {
            label: chartSpec.title || 'Data',
            data: chartData.data,
          };

          if (chartType === 'pie' || chartType === 'doughnut') {
            // Pie/Doughnut charts: multiple colors for each segment
            datasetConfig.backgroundColor = chartData.labels.map((_: any, i: number) => colors[i % colors.length]);
            datasetConfig.borderColor = '#1D212B';
            datasetConfig.borderWidth = 2;
          } else if (chartType === 'bar') {
            // Bar charts: single color with slight transparency
            datasetConfig.backgroundColor = 'rgba(61, 141, 218, 0.8)';
            datasetConfig.borderColor = '#3D8DDA';
            datasetConfig.borderWidth = 1;
          } else {
            // Line charts: original styling
            datasetConfig.backgroundColor = 'rgba(61, 141, 218, 0.1)';
            datasetConfig.borderColor = '#3D8DDA';
            datasetConfig.borderWidth = 2;
            datasetConfig.pointBackgroundColor = '#FFFFFF';
            datasetConfig.pointBorderColor = '#3D8DDA';
            datasetConfig.pointHoverBackgroundColor = '#3D8DDA';
            datasetConfig.pointHoverBorderColor = '#FFFFFF';
            datasetConfig.pointRadius = 4;
            datasetConfig.pointHoverRadius = 7;
            datasetConfig.tension = 0.4;
            datasetConfig.fill = true;
          }

          const newChart = new Chart(ctx, {
            type: chartType,
            data: {
              labels: chartData.labels,
              datasets: [datasetConfig]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                mode: 'index',
                intersect: false
              },
              layout: {
                padding: {
                  top: 10,
                  right: 10,
                  bottom: 5,
                  left: 5
                }
              },
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  enabled: true,
                  backgroundColor: '#1D212B',
                  titleColor: '#FFFFFF',
                  bodyColor: '#A0A0A0',
                  borderColor: '#383838',
                  borderWidth: 1,
                  padding: 10,
                  displayColors: false,
                  callbacks: {
                    label: function(context: any) {
                      let label = context.dataset.label || '';
                      if (label) {
                        label += ': ';
                      }
                      if (context.parsed.y !== null) {
                        label += new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0
                        }).format(context.parsed.y);
                      }
                      return label;
                    }
                  }
                }
              },
              // Hide scales for pie/doughnut charts
              ...(chartType === 'pie' || chartType === 'doughnut' ? {} : {
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(56, 56, 56, 0.7)',
                      borderDash: [2, 4]
                    },
                    ticks: {
                      color: '#A0A0A0',
                      callback: function(value: any) {
                        // Format based on data source
                        if (chartSpec.dataSource?.includes('revenue') || chartSpec.dataSource?.includes('payment')) {
                          return '$' + (value / 1000) + 'k';
                        }
                        return value;
                      }
                    },
                    border: {
                      display: false
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      color: '#A0A0A0'
                    },
                    border: {
                      display: false
                    }
                  }
                }
              })
            }
          });

          chatChartsRef.current.set(chartId, newChart);
        });
      }
    });

    // Cleanup on unmount
    return () => {
      chatChartsRef.current.forEach((chart) => {
        chart.destroy();
      });
      chatChartsRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationHistory.length, analyticsData]);

  const handleSend = async (messageText?: string) => {
    const userMessage = messageText || input.trim();
    if (!userMessage || chatLoading) return;
    setInput('');
    await sendMessage(userMessage);
  };

  // Loading state
  if (analyticsLoading && !analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-[#A0A0A0]">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (analyticsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="bg-[#1D212B] border border-[#383838] rounded-lg p-6 max-w-md">
          <p className="text-red-400 mb-4">{analyticsError}</p>
          <button
            onClick={() => fetchAnalytics()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="bg-[#1D212B] border border-[#383838] rounded-lg p-8 max-w-md">
          <h2 className="text-white text-2xl font-bold mb-4">Ready to Load Analytics</h2>
          <p className="text-[#A0A0A0] mb-6">Click below to fetch your analytics data.</p>
          <button
            onClick={() => fetchAnalytics()}
            className="px-6 py-3 bg-[#3D8DDA] text-white rounded-lg hover:bg-[#2c79c1] transition-colors font-semibold"
          >
            Load Analytics Data
          </button>
        </div>
      </div>
    );
  }

  // Extract real data
  const config = ConfigStorage.load();
  const userName = config?.name || 'there';
  const firstName = userName.split(' ')[0]; // Get first name only
  const todayRevenue = analyticsData.periodSummary?.gross || 0;
  const revenueChange = analyticsData.periodSummary?.grossChange || 0;
  const upcomingBookings = analyticsData.todaysAgenda?.bookings || 0;
  const capacityPercent = analyticsData.businessInsights?.capacityUtilization?.overallUtilization || 0;

  // Additional metrics for Owner's Box - Three Pillars
  const avgRevenuePerBooking = analyticsData.salesSummary?.avgRevPerBooking || 0;
  const repeatCustomerRate = 0; // TODO: Fix after determining correct property
  const totalGuests = analyticsData.guestSummary?.totalGuests || 0;

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto bg-[#121212] text-white">
      {/* Header */}
      <header className="bg-transparent pt-4 px-4 sm:px-6 md:px-8 pb-2 flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm bg-black/30">
        <div className="flex items-center space-x-3">
          <img alt="Logo" className="h-11 md:h-14" src="/logo.png" />
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-[#3D8DDA] hover:bg-[#2c79c1] text-white rounded-lg transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-6 md:p-8 space-y-10 pb-28">
        {/* Greeting */}
        <div className="bg-gradient-to-r from-[#1D212B] to-[#1A1E28] border border-[#383838] rounded-2xl p-6 sm:p-7 text-center shadow-xl">
          <h2 className="text-xl text-white md:text-2xl font-bold mb-2 tracking-tight">Welcome, {firstName}</h2>
          <p className="text-sm text-[#B0B0B0] md:text-base max-w-2xl mx-auto">
            Your business intelligence dashboard is ready
          </p>
        </div>

        <div className="space-y-10">
          {/* Owner's Box - Unified Command Center */}
          <div className="bg-gradient-to-br from-[#1D212B] to-[#1A1E28] border border-[#383838] rounded-2xl p-5 sm:p-6 shadow-xl">
            <div className="flex items-center mb-6">
              <span className="material-symbols-outlined text-[#3D8DDA] mr-3 text-2xl">business_center</span>
              <h3 className="font-bold text-xl md:text-2xl text-white tracking-tight">Owner's Box</h3>
            </div>

            {/* Attention Required */}
            {((analyticsData.businessInsights?.capacityUtilization &&
               analyticsData.businessInsights.capacityUtilization.overallUtilization > 90) ||
              revenueChange < 0) && (
              <div className="space-y-3 mb-6">
                {analyticsData.businessInsights?.capacityUtilization &&
                 analyticsData.businessInsights.capacityUtilization.overallUtilization > 90 && (
                  <div className="w-full bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start space-x-4">
                    <span className="material-symbols-outlined text-yellow-400 mt-0.5 text-xl">priority_high</span>
                    <div className="flex-1">
                      <p className="font-semibold text-white text-sm mb-1">High Capacity Alert</p>
                      <p className="text-xs text-[#E0E0E0]">
                        Capacity is at {capacityPercent.toFixed(0)}%. Consider adding new slots.
                      </p>
                    </div>
                  </div>
                )}
                {revenueChange < 0 && (
                  <div className="w-full bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start space-x-4">
                    <span className="material-symbols-outlined text-red-400 mt-0.5 text-xl">trending_down</span>
                    <div className="flex-1">
                      <p className="font-semibold text-white text-sm mb-1">Revenue Decline</p>
                      <p className="text-xs text-[#E0E0E0]">
                        Revenue is down {Math.abs(revenueChange).toFixed(1)}% compared to previous period.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Three Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              {/* Drive Revenue Pillar */}
              <div className="bg-gradient-to-br from-[#3D8DDA]/10 to-transparent border border-[#3D8DDA]/30 rounded-xl p-5 shadow-lg hover:shadow-xl hover:border-[#3D8DDA]/50 transition-all">
                <div className="flex items-center mb-4">
                  <span className="material-symbols-outlined text-[#3D8DDA] text-xl mr-2">trending_up</span>
                  <h4 className="text-sm font-bold text-[#3D8DDA] uppercase tracking-wide">Drive Revenue</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-[#A0A0A0] mb-1">Period Revenue</p>
                    <p className="text-2xl font-bold text-white">${todayRevenue.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#3D8DDA]/20">
                    <p className="text-xs text-[#A0A0A0]">vs. Previous</p>
                    <p className={`text-sm font-semibold flex items-center ${revenueChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <span className="material-symbols-outlined text-xs mr-0.5">
                        {revenueChange >= 0 ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                      {Math.abs(revenueChange).toFixed(1)}%
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-[#A0A0A0]">Avg/Booking</p>
                    <p className="text-sm font-semibold text-white">${avgRevenuePerBooking.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Operational Efficiency Pillar */}
              <div className="bg-gradient-to-br from-[#10B981]/10 to-transparent border border-[#10B981]/30 rounded-xl p-5 shadow-lg hover:shadow-xl hover:border-[#10B981]/50 transition-all">
                <div className="flex items-center mb-4">
                  <span className="material-symbols-outlined text-[#10B981] text-xl mr-2">settings_suggest</span>
                  <h4 className="text-sm font-bold text-[#10B981] uppercase tracking-wide">Operational Efficiency</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-[#A0A0A0] mb-1">Capacity Usage</p>
                    <p className="text-2xl font-bold text-white">{capacityPercent.toFixed(0)}%</p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#10B981]/20">
                    <p className="text-xs text-[#A0A0A0]">Today's Bookings</p>
                    <p className="text-sm font-semibold text-white">{upcomingBookings}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-[#A0A0A0]">Status</p>
                    <p className={`text-sm font-semibold ${capacityPercent >= 80 ? 'text-green-400' : capacityPercent >= 50 ? 'text-yellow-400' : 'text-orange-400'}`}>
                      {capacityPercent >= 80 ? 'Optimized' : capacityPercent >= 50 ? 'Moderate' : 'Low'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Guest Experience Pillar */}
              <div className="bg-gradient-to-br from-[#F59E0B]/10 to-transparent border border-[#F59E0B]/30 rounded-xl p-5 shadow-lg hover:shadow-xl hover:border-[#F59E0B]/50 transition-all">
                <div className="flex items-center mb-4">
                  <span className="material-symbols-outlined text-[#F59E0B] text-xl mr-2">groups</span>
                  <h4 className="text-sm font-bold text-[#F59E0B] uppercase tracking-wide">Guest Experience</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-[#A0A0A0] mb-1">Total Guests</p>
                    <p className="text-2xl font-bold text-white">{totalGuests.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#F59E0B]/20">
                    <p className="text-xs text-[#A0A0A0]">Repeat Rate</p>
                    <p className="text-sm font-semibold text-white">{repeatCustomerRate.toFixed(0)}%</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-[#A0A0A0]">Loyalty</p>
                    <p className={`text-sm font-semibold ${repeatCustomerRate >= 30 ? 'text-green-400' : repeatCustomerRate >= 15 ? 'text-yellow-400' : 'text-orange-400'}`}>
                      {repeatCustomerRate >= 30 ? 'Strong' : repeatCustomerRate >= 15 ? 'Moderate' : 'Growing'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Explore Buttons Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => setExpandedPillar(expandedPillar === 'revenue' ? null : 'revenue')}
                disabled={chatLoading}
                className="flex items-center justify-between p-4 bg-gradient-to-br from-[#3D8DDA]/10 to-transparent border border-[#3D8DDA]/30 rounded-xl hover:border-[#3D8DDA]/50 hover:bg-[#3D8DDA]/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-3">
                  <span className="material-symbols-outlined text-[#3D8DDA] text-lg">trending_up</span>
                  <span className="text-sm font-semibold text-white">Explore Revenue</span>
                </div>
                <span className={`material-symbols-outlined text-[#3D8DDA] text-base transition-transform ${expandedPillar === 'revenue' ? 'rotate-180' : ''}`}>expand_more</span>
              </button>

              <button
                onClick={() => setExpandedPillar(expandedPillar === 'operations' ? null : 'operations')}
                disabled={chatLoading}
                className="flex items-center justify-between p-4 bg-gradient-to-br from-[#10B981]/10 to-transparent border border-[#10B981]/30 rounded-xl hover:border-[#10B981]/50 hover:bg-[#10B981]/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-3">
                  <span className="material-symbols-outlined text-[#10B981] text-lg">settings_suggest</span>
                  <span className="text-sm font-semibold text-white">Explore Operations</span>
                </div>
                <span className={`material-symbols-outlined text-[#10B981] text-base transition-transform ${expandedPillar === 'operations' ? 'rotate-180' : ''}`}>expand_more</span>
              </button>

              <button
                onClick={() => setExpandedPillar(expandedPillar === 'guests' ? null : 'guests')}
                disabled={chatLoading}
                className="flex items-center justify-between p-4 bg-gradient-to-br from-[#F59E0B]/10 to-transparent border border-[#F59E0B]/30 rounded-xl hover:border-[#F59E0B]/50 hover:bg-[#F59E0B]/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-3">
                  <span className="material-symbols-outlined text-[#F59E0B] text-lg">groups</span>
                  <span className="text-sm font-semibold text-white">Explore Guests</span>
                </div>
                <span className={`material-symbols-outlined text-[#F59E0B] text-base transition-transform ${expandedPillar === 'guests' ? 'rotate-180' : ''}`}>expand_more</span>
              </button>
            </div>

            {/* Expandable Question Menus */}
            {expandedPillar === 'revenue' && (
              <div className="border border-[#3D8DDA]/30 rounded-xl p-4 space-y-2 bg-gradient-to-br from-[#3D8DDA]/5 to-transparent mt-3">
                <button
                  onClick={() => { handleSend("What products are performing best this month?"); setExpandedPillar(null); }}
                  disabled={chatLoading}
                  className="w-full text-left px-4 py-3 text-sm text-[#E0E0E0] hover:bg-white/5 rounded-lg transition-colors flex items-center space-x-3"
                >
                  <span className="material-symbols-outlined text-[#3D8DDA] text-base">trending_up</span>
                  <span>What products are performing best this month?</span>
                </button>
                <button
                  onClick={() => { handleSend("How is this weekend's revenue trending against last weekend?"); setExpandedPillar(null); }}
                  disabled={chatLoading}
                  className="w-full text-left px-4 py-3 text-sm text-[#E0E0E0] hover:bg-white/5 rounded-lg transition-colors flex items-center space-x-3"
                >
                  <span className="material-symbols-outlined text-[#3D8DDA] text-base">weekend</span>
                  <span>How is this weekend's revenue trending against last weekend?</span>
                </button>
                <button
                  onClick={() => { handleSend("How are bookings tracking this weekend compared to last?"); setExpandedPillar(null); }}
                  disabled={chatLoading}
                  className="w-full text-left px-4 py-3 text-sm text-[#E0E0E0] hover:bg-white/5 rounded-lg transition-colors flex items-center space-x-3"
                >
                  <span className="material-symbols-outlined text-[#3D8DDA] text-base">calendar_today</span>
                  <span>How are bookings tracking this weekend compared to last?</span>
                </button>
                <button
                  onClick={() => { handleSend("Provide a comprehensive analysis of all Drive Revenue insights including: revenue trends and patterns, product/activity performance, upsell opportunities from extras and add-ons, promotion and discount effectiveness, pricing optimization recommendations, and revenue forecasting."); setExpandedPillar(null); }}
                  disabled={chatLoading}
                  className="w-full text-left px-4 py-3 text-sm text-white font-semibold bg-[#3D8DDA]/10 hover:bg-[#3D8DDA]/20 rounded-lg transition-colors flex items-center space-x-3 mt-3"
                >
                  <span className="material-symbols-outlined text-[#3D8DDA] text-base">list</span>
                  <span>Full Revenue Analysis</span>
                </button>
              </div>
            )}

            {expandedPillar === 'operations' && (
              <div className="border border-[#10B981]/30 rounded-xl p-4 space-y-2 bg-gradient-to-br from-[#10B981]/5 to-transparent mt-3">
                <button
                  onClick={() => { handleSend("What activities had the highest utilization this weekend?"); setExpandedPillar(null); }}
                  disabled={chatLoading}
                  className="w-full text-left px-4 py-3 text-sm text-[#E0E0E0] hover:bg-white/5 rounded-lg transition-colors flex items-center space-x-3"
                >
                  <span className="material-symbols-outlined text-[#10B981] text-base">event_available</span>
                  <span>What activities had the highest utilization this weekend?</span>
                </button>
                <button
                  onClick={() => { handleSend("How did activity performance change compared to last week?"); setExpandedPillar(null); }}
                  disabled={chatLoading}
                  className="w-full text-left px-4 py-3 text-sm text-[#E0E0E0] hover:bg-white/5 rounded-lg transition-colors flex items-center space-x-3"
                >
                  <span className="material-symbols-outlined text-[#10B981] text-base">compare_arrows</span>
                  <span>How did activity performance change compared to last week?</span>
                </button>
                <button
                  onClick={() => { handleSend("Show me operational tools that can help me save time."); setExpandedPillar(null); }}
                  disabled={chatLoading}
                  className="w-full text-left px-4 py-3 text-sm text-[#E0E0E0] hover:bg-white/5 rounded-lg transition-colors flex items-center space-x-3"
                >
                  <span className="material-symbols-outlined text-[#10B981] text-base">handyman</span>
                  <span>Show me operational tools that can help me save time.</span>
                </button>
                <button
                  onClick={() => { handleSend("Provide a comprehensive analysis of all Operational Efficiency insights including: capacity utilization and optimization, booking source performance, channel effectiveness, time slot utilization, resource allocation, staff scheduling opportunities, and operational bottlenecks."); setExpandedPillar(null); }}
                  disabled={chatLoading}
                  className="w-full text-left px-4 py-3 text-sm text-white font-semibold bg-[#10B981]/10 hover:bg-[#10B981]/20 rounded-lg transition-colors flex items-center space-x-3 mt-3"
                >
                  <span className="material-symbols-outlined text-[#10B981] text-base">list</span>
                  <span>Full Operations Analysis</span>
                </button>
              </div>
            )}

            {expandedPillar === 'guests' && (
              <div className="border border-[#F59E0B]/30 rounded-xl p-4 space-y-2 bg-gradient-to-br from-[#F59E0B]/5 to-transparent mt-3">
                <button
                  onClick={() => { handleSend("Show me guest booking patterns for the past month."); setExpandedPillar(null); }}
                  disabled={chatLoading}
                  className="w-full text-left px-4 py-3 text-sm text-[#E0E0E0] hover:bg-white/5 rounded-lg transition-colors flex items-center space-x-3"
                >
                  <span className="material-symbols-outlined text-[#F59E0B] text-base">calendar_month</span>
                  <span>Show me guest booking patterns for the past month.</span>
                </button>
                <button
                  onClick={() => { handleSend("What are my busiest days and times?"); setExpandedPillar(null); }}
                  disabled={chatLoading}
                  className="w-full text-left px-4 py-3 text-sm text-[#E0E0E0] hover:bg-white/5 rounded-lg transition-colors flex items-center space-x-3"
                >
                  <span className="material-symbols-outlined text-[#F59E0B] text-base">schedule</span>
                  <span>What are my busiest days and times?</span>
                </button>
                <button
                  onClick={() => { handleSend("How many repeat customers do I have?"); setExpandedPillar(null); }}
                  disabled={chatLoading}
                  className="w-full text-left px-4 py-3 text-sm text-[#E0E0E0] hover:bg-white/5 rounded-lg transition-colors flex items-center space-x-3"
                >
                  <span className="material-symbols-outlined text-[#F59E0B] text-base">repeat</span>
                  <span>How many repeat customers do I have?</span>
                </button>
                <button
                  onClick={() => { handleSend("Provide a comprehensive analysis of all Guest Experience insights including: customer satisfaction metrics, repeat customer analysis, guest feedback themes, no-show patterns, group size trends, average revenue per guest, customer lifetime value, and guest retention strategies."); setExpandedPillar(null); }}
                  disabled={chatLoading}
                  className="w-full text-left px-4 py-3 text-sm text-white font-semibold bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 rounded-lg transition-colors flex items-center space-x-3 mt-3"
                >
                  <span className="material-symbols-outlined text-[#F59E0B] text-base">list</span>
                  <span>Full Guest Analysis</span>
                </button>
              </div>
            )}
          </div>

          {/* AI Chat */}
          <div className="space-y-10">
            {conversationHistory.map((msg: any, idx: number) => (
              <div key={idx}>
                {msg.role === 'user' && (
                  <div className="flex justify-end pt-6 items-start space-x-2">
                    <div className="bg-gradient-to-br from-[#3D8DDA] to-[#2c79c1] text-white rounded-t-2xl rounded-bl-2xl px-6 py-4 max-w-[85%] md:max-w-[70%] shadow-xl shadow-[#3D8DDA]/30">
                      <p className="text-sm md:text-base leading-relaxed font-medium">{msg.content}</p>
                    </div>
                  </div>
                )}

                {msg.role === 'assistant' && (
                  <div className="flex items-start space-x-4 md:space-x-5 mb-8 group/message">
                    <div className="bg-gradient-to-br from-[#3D8DDA] to-[#2c79c1] rounded-full p-2.5 md:p-3 mt-1 flex-shrink-0 shadow-xl shadow-[#3D8DDA]/40">
                      <img src="/logo.png" alt="Resova" className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="w-full flex-1 min-w-0 relative">
                      <div className="w-full space-y-6 bg-gradient-to-br from-[#1D212B]/40 to-transparent border border-[#383838]/40 rounded-2xl p-5 md:p-7 shadow-lg selectable-text" style={{ userSelect: 'text', WebkitUserSelect: 'text', MozUserSelect: 'text', msUserSelect: 'text' } as React.CSSProperties}>
                      {(() => {
                        // Parse the content to extract Key Insights and Recommended Actions
                        const lines = msg.content.split('\n');
                        const sections: { [key: string]: string[] } = { main: [], insights: [], actions: [] };
                        let currentSection = 'main';

                        lines.forEach((line: string) => {
                          // Check for section headers (strip markdown symbols and numbers)
                          const cleanLine = line.replace(/^#+\s*/, '').replace(/^\d+\.\s*/, '');

                          if (cleanLine.match(/key\s*insights/i)) {
                            currentSection = 'insights';
                            console.log('✅ Found Key Insights header:', line);
                            return;
                          }
                          if (cleanLine.match(/recommended\s*actions/i)) {
                            currentSection = 'actions';
                            console.log('✅ Found Recommended Actions header:', line);
                            return;
                          }

                          if (line.trim()) {
                            sections[currentSection].push(line);
                          }
                        });

                        const hasInsights = sections.insights.length > 0;
                        const hasActions = sections.actions.length > 0;

                        // Debug logging
                        console.log('🔍 Section parsing results:', {
                          hasInsights,
                          hasActions,
                          insightsCount: sections.insights.length,
                          actionsCount: sections.actions.length,
                          insightsSample: sections.insights.slice(0, 3),
                          actionsSample: sections.actions.slice(0, 3)
                        });

                        return (
                          <>
                            {/* Main content */}
                            <div className="prose prose-invert prose-sm md:prose-base max-w-none">
                              {sections.main.map((line: string, lineIdx: number) => {
                                if (line.startsWith('### ')) {
                                  const cleanedText = line.replace('### ', '').replace(/\*\*/g, '');
                                  return <h3 key={lineIdx} className="text-base md:text-lg font-bold text-white mt-8 mb-4 tracking-tight border-b border-[#383838]/50 pb-2">{cleanedText}</h3>;
                                }
                                if (line.startsWith('## ')) {
                                  const cleanedText = line.replace('## ', '').replace(/\*\*/g, '');
                                  return <h2 key={lineIdx} className="text-lg md:text-xl font-bold text-white mt-10 mb-5 tracking-tight border-b border-[#383838] pb-3">{cleanedText}</h2>;
                                }
                                if (line.startsWith('# ')) {
                                  const cleanedText = line.replace('# ', '').replace(/\*\*/g, '');
                                  return <h1 key={lineIdx} className="text-xl md:text-2xl font-bold text-white mt-12 mb-6 tracking-tight border-b-2 border-[#3D8DDA] pb-3">{cleanedText}</h1>;
                                }
                                if (line.trim().startsWith('- ')) {
                                  const content = line.replace(/^-\s*/, '');
                                  return (
                                    <li key={lineIdx} className="text-[#E8E8E8] ml-5 mb-3 leading-relaxed text-sm md:text-base pl-1" dangerouslySetInnerHTML={{
                                      __html: content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
                                    }} />
                                  );
                                }
                                if (line.match(/^\d+\.\s/)) {
                                  const content = line.replace(/^\d+\.\s/, '');
                                  return (
                                    <li key={lineIdx} className="text-[#E8E8E8] ml-5 mb-3 leading-relaxed text-sm md:text-base pl-1" dangerouslySetInnerHTML={{
                                      __html: content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
                                    }} />
                                  );
                                }
                                // Parse bold text in paragraphs
                                const parsedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
                                return <p key={lineIdx} className="text-[#E8E8E8] leading-[1.7] mb-4 text-sm md:text-base" dangerouslySetInnerHTML={{ __html: parsedLine }} />;
                              })}
                            </div>

                            {/* Key Insights and Recommended Actions in styled cards */}
                            {(hasInsights || hasActions) && (
                              <div className={`grid grid-cols-1 gap-5 mt-8 ${hasInsights && hasActions ? 'md:grid-cols-2' : ''}`}>
                                {hasInsights && (
                                  <div className="bg-gradient-to-br from-[#1D212B] via-[#1A1E28] to-[#181C25] p-6 md:p-7 rounded-2xl border border-[#383838] shadow-2xl shadow-[#3D8DDA]/10 hover:border-[#3D8DDA]/50 transition-all duration-300">
                                    <div className="flex items-center mb-5">
                                      <div className="p-2.5 bg-gradient-to-br from-[#3D8DDA]/20 to-[#3D8DDA]/5 rounded-xl mr-3 shadow-lg shadow-[#3D8DDA]/20">
                                        <span className="material-symbols-outlined text-[#3D8DDA] text-xl">lightbulb</span>
                                      </div>
                                      <h3 className="font-bold text-white text-base md:text-lg tracking-tight">Key Insights</h3>
                                    </div>
                                    <ul className="space-y-4 list-none">
                                      {sections.insights.map((line: string, i: number) => {
                                        const trimmedLine = line.trim();

                                        // Skip empty lines
                                        if (!trimmedLine) return null;

                                        // Check for nested bullets (lines starting with spaces/indentation)
                                        const isNested = line.match(/^\s{2,}/);

                                        // Match bullet or numbered items and strip the marker
                                        if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*') || trimmedLine.match(/^\d+\./)) {
                                          // Remove bullet markers: -, *, or numbers followed by . or )
                                          let content = trimmedLine.replace(/^[-*]\s*/, '').replace(/^\d+[\.\)]\s*/, '');
                                          if (content) {
                                            return (
                                              <li key={i} className={`flex items-start group hover:bg-white/5 p-2.5 rounded-lg transition-all duration-200 ${isNested ? 'ml-6 -ml-0.5' : '-ml-2.5'}`}>
                                                <span className={`material-symbols-outlined text-[#3D8DDA] mr-3 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200 ${isNested ? 'text-sm' : 'text-base'}`}>
                                                  {isNested ? 'subdirectory_arrow_right' : 'trending_up'}
                                                </span>
                                                <span className="text-[#E0E0E0] leading-relaxed text-sm md:text-base" dangerouslySetInnerHTML={{
                                                  __html: content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
                                                }} />
                                              </li>
                                            );
                                          }
                                        }

                                        // If it's not a bullet point, don't render it in the insights card
                                        // This prevents random text from appearing
                                        return null;
                                      })}
                                    </ul>
                                  </div>
                                )}

                                {hasActions && (
                                  <div className="bg-gradient-to-br from-[#1D212B] via-[#1A1E28] to-[#181C25] p-6 md:p-7 rounded-2xl border border-[#383838] shadow-2xl shadow-green-500/10 hover:border-green-500/50 transition-all duration-300">
                                    <div className="flex items-center mb-5">
                                      <div className="p-2.5 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-xl mr-3 shadow-lg shadow-green-500/20">
                                        <span className="material-symbols-outlined text-green-400 text-xl">task_alt</span>
                                      </div>
                                      <h3 className="font-bold text-white text-base md:text-lg tracking-tight">Recommended Actions</h3>
                                    </div>
                                    <ul className="space-y-4 list-none">
                                      {sections.actions.map((line: string, i: number) => {
                                        const trimmedLine = line.trim();

                                        // Skip empty lines
                                        if (!trimmedLine) return null;

                                        // Check for nested bullets (lines starting with spaces/indentation)
                                        const isNested = line.match(/^\s{2,}/);

                                        // Pattern 1: **Title**: Description (with or without leading bullet/number)
                                        let match = trimmedLine.match(/^[-*\d]*[\.\)]?\s*\*\*(.*?)\*\*:\s*(.*)/);
                                        if (match) {
                                          return (
                                            <li key={i} className={`flex items-start group hover:bg-white/5 p-2.5 rounded-lg transition-all duration-200 ${isNested ? 'ml-6 -ml-0.5' : '-ml-2.5'}`}>
                                              <span className={`material-symbols-outlined text-green-400 mr-3 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200 ${isNested ? 'text-sm' : 'text-base'}`}>
                                                {isNested ? 'subdirectory_arrow_right' : 'check_circle'}
                                              </span>
                                              <div className="flex-1">
                                                <div className="text-[#E0E0E0] leading-relaxed text-sm md:text-base">
                                                  <strong className="font-semibold text-white">{match[1]}</strong>
                                                  <span className="text-[#E0E0E0]">: {match[2]}</span>
                                                </div>
                                              </div>
                                            </li>
                                          );
                                        }

                                        // Pattern 2: Plain bullet or numbered item
                                        if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*') || trimmedLine.match(/^\d+\./)) {
                                          // Remove bullet markers: -, *, or numbers followed by . or )
                                          let content = trimmedLine.replace(/^[-*]\s*/, '').replace(/^\d+[\.\)]\s*/, '');
                                          if (content) {
                                            return (
                                              <li key={i} className={`flex items-start group hover:bg-white/5 p-2.5 rounded-lg transition-all duration-200 ${isNested ? 'ml-6 -ml-0.5' : '-ml-2.5'}`}>
                                                <span className={`material-symbols-outlined text-green-400 mr-3 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200 ${isNested ? 'text-sm' : 'text-base'}`}>
                                                  {isNested ? 'subdirectory_arrow_right' : 'check_circle'}
                                                </span>
                                                <span className="text-[#E0E0E0] leading-relaxed text-sm md:text-base" dangerouslySetInnerHTML={{
                                                  __html: content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
                                                }} />
                                              </li>
                                            );
                                          }
                                        }

                                        // If it's not a bullet point, don't render it in the actions card
                                        // This prevents random text from appearing
                                        return null;
                                      })}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        );
                      })()}

                      {/* Charts from AI response */}
                      {msg.charts && msg.charts.length > 0 && (
                        <div className="space-y-6 mt-6">
                          {msg.charts.map((chart: any, chartIdx: number) => (
                            <div key={chartIdx} className="bg-gradient-to-br from-[#1D212B] to-[#181C25] border border-[#383838] rounded-2xl p-5 md:p-6 shadow-2xl shadow-black/20 hover:border-[#3D8DDA]/30 transition-all duration-300">
                              <div className="flex items-center mb-5">
                                <div className="p-2 bg-[#3D8DDA]/10 rounded-lg mr-3">
                                  <span className="material-symbols-outlined text-[#3D8DDA] text-xl">insights</span>
                                </div>
                                <h3 className="font-bold text-white text-base md:text-lg">{chart.title || 'Chart'}</h3>
                              </div>
                              <div className="relative h-56 sm:h-64 md:h-72 w-full bg-black/20 rounded-xl p-4">
                                <canvas id={`chart-${idx}-${chartIdx}`} className="w-full h-full"></canvas>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tables from AI response */}
                      {msg.tables && msg.tables.length > 0 && (
                        <div className="space-y-6 mt-6">
                          {msg.tables.map((table: any, tableIdx: number) => (
                            <div key={tableIdx} className="bg-gradient-to-br from-[#1D212B] to-[#181C25] border border-[#383838] rounded-2xl p-5 md:p-6 shadow-2xl shadow-black/20 hover:border-[#3D8DDA]/30 transition-all duration-300">
                              <div className="flex items-center mb-5">
                                <div className="p-2 bg-[#3D8DDA]/10 rounded-lg mr-3">
                                  <span className="material-symbols-outlined text-[#3D8DDA] text-xl">table_chart</span>
                                </div>
                                <h3 className="font-bold text-white text-base md:text-lg">{table.title || 'Table'}</h3>
                              </div>
                              <div className="overflow-x-auto -mx-2 px-2">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b-2 border-[#3D8DDA]/30">
                                      {table.headers?.map((header: string, hIdx: number) => (
                                        <th key={hIdx} className="text-left py-3.5 px-4 font-bold text-white text-xs md:text-sm uppercase tracking-wider">
                                          {header}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {table.rows?.map((row: any[], rIdx: number) => (
                                      <tr key={rIdx} className="border-b border-[#383838]/30 hover:bg-white/5 transition-all duration-150">
                                        {row.map((cell: any, cIdx: number) => (
                                          <td key={cIdx} className="py-3.5 px-4 text-[#E0E0E0] text-sm md:text-base">
                                            {typeof cell === 'number' && cell > 1000 ? cell.toLocaleString() : cell}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Copy Button - appears at bottom before suggested questions */}
                      <div className="pt-4 mt-6 border-t border-[#383838]/30 flex justify-end">
                        <button
                          onClick={() => handleCopyMessage(msg.content, idx)}
                          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 hover:border-[#3D8DDA]/50 text-sm group"
                          title="Copy question & answer"
                        >
                          {copiedMessageIndex === idx ? (
                            <>
                              <span className="material-symbols-outlined text-[#10B981] text-sm">check</span>
                              <span className="text-[#10B981]">Copied!</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[#A0A0A0] group-hover:text-white text-sm">content_copy</span>
                              <span className="text-[#A0A0A0] group-hover:text-white">Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                        <div className="pt-4 mt-2">
                          <p className="text-sm text-[#A0A0A0] mb-4 flex items-center">
                            <span className="material-symbols-outlined text-base mr-2">tips_and_updates</span>
                            Suggested next steps:
                          </p>
                          <div className="flex flex-wrap gap-2.5">
                            {msg.suggestedQuestions.map((question: string, qIdx: number) => (
                              <button
                                key={qIdx}
                                onClick={() => handleSend(question)}
                                className="text-xs md:text-sm text-white bg-gradient-to-br from-white/10 to-white/5 px-4 py-2 rounded-full border border-[#383838] hover:border-[#3D8DDA] hover:shadow-lg hover:shadow-[#3D8DDA]/20 transition-all duration-200 hover:scale-105"
                              >
                                "{question}"
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {chatLoading && (
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="bg-[#3D8DDA] rounded-full p-2 mt-1 flex-shrink-0">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>auto_awesome</span>
                </div>
                <div className="w-full">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-[#3D8DDA] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#3D8DDA] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-[#3D8DDA] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="text-sm text-[#A0A0A0]">Analyzing your data...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="relative !mt-8">
            <div className="relative flex items-center">
              <input
                className="w-full bg-[#1D212B] text-white border border-[#383838] rounded-2xl pl-5 pr-14 py-4 text-base focus:outline-none focus:border-[#3D8DDA] focus:ring-1 focus:ring-[#3D8DDA] placeholder:text-[#6B6B6B] transition-all"
                placeholder="Ask about your business performance..."
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={chatLoading}
              />
              <button
                className="absolute right-2 bg-[#3D8DDA] text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-[#2c79c1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleSend()}
                disabled={!input.trim() || chatLoading}
              >
                <span className="material-symbols-outlined text-xl">send</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
    
  );
}
