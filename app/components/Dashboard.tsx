'use client';

import { useEffect, useState, useRef } from 'react';
import { useApp, useAnalytics, useChat } from '../context/AppContext';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const { logout } = useApp();
  const {
    analyticsData,
    analyticsLoading,
    analyticsError,
    fetchAnalytics,
  } = useAnalytics();
  const { conversationHistory, chatLoading, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const chatChartsRef = useRef<Map<string, any>>(new Map());

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
        // Fallback to daily summary if revenueTrends is not available
        const dailySummary = analyticsData.dailySummary || [];
        if (dailySummary.length > 0) {
          labels = dailySummary.slice(-7).map((item: any) => {
            const date = new Date(item.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          });
          data = dailySummary.slice(-7).map((item: any) => item.gross || 0);
        } else {
          // Default sample data
          labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Today'];
          data = [2800, 3200, 2900, 4100, 3800];
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

  // Helper function to get chart data from dataSource
  const getChartDataFromSource = (dataSource: string) => {
    if (!analyticsData) {
      return { labels: ['No Data'], data: [0] };
    }

    console.log('📊 Chart data request:', { dataSource, availableData: Object.keys(analyticsData) });

    switch (dataSource) {
      case 'revenue_trend': {
        const revenueTrend = analyticsData.revenueTrends || analyticsData.dailySummary || [];
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
        const dailySummary = analyticsData.dailySummary || [];
        if (dailySummary.length === 0) return { labels: ['No Data'], data: [0] };

        // Group by day of week
        const dayMap: { [key: string]: number } = {};
        dailySummary.forEach((item: any) => {
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
        const dailySummary = analyticsData.dailySummary || [];
        if (dailySummary.length === 0) return { labels: ['No Data'], data: [0] };

        const labels = dailySummary.map((item: any) => {
          const date = new Date(item.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        const data = dailySummary.map((item: any) => item.guests || 0);
        return { labels, data };
      }

      case 'sales_metrics':
      case 'guest_metrics': {
        const dailySummary = analyticsData.dailySummary || [];
        if (dailySummary.length === 0) {
          console.warn('⚠️ No daily summary data available');
          return { labels: ['No Data'], data: [0] };
        }

        const labels = dailySummary.slice(-7).map((item: any) => {
          const date = new Date(item.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        const data = dailySummary.slice(-7).map((item: any) => {
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
        console.warn(`⚠️ Unknown data source: ${dataSource}, using fallback data`);
        return { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Today'], data: [2800, 3200, 2900, 4100, 3800] };
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
  const businessName = 'Business'; // TODO: Get from config storage
  const todayRevenue = analyticsData.periodSummary?.gross || 0;
  const revenueChange = analyticsData.periodSummary?.grossChange || 0;
  const upcomingBookings = analyticsData.todaysAgenda?.bookings || 0;
  const capacityPercent = analyticsData.businessInsights?.capacityUtilization?.overallUtilization || 0;

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto bg-[#121212] text-white">
      {/* Header */}
      <header className="bg-transparent pt-4 px-4 sm:px-6 md:px-8 pb-2 flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm bg-black/30">
        <div className="flex items-center space-x-3">
          <img alt="Logo" className="h-8 md:h-9" src="/logo.png" />
        </div>
        <div className="flex items-center space-x-2">
          <button className="text-[#A0A0A0] hover:text-white p-2 relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#3D8DDA] border-2 border-black/30"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-[#3D8DDA] flex items-center justify-center text-sm font-semibold">
            {businessName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-6 md:p-8 space-y-8 pb-28">
        {/* Greeting */}
        <div className="bg-gradient-to-r from-[#1D212B] to-[#1A1E28] border border-[#383838] rounded-2xl p-5 sm:p-6 text-center shadow-lg">
          <h2 className="text-lg text-white md:text-xl font-semibold mb-2 tracking-tight">Welcome back, {businessName}</h2>
          <p className="text-sm text-[#B0B0B0] md:text-base max-w-xl mx-auto">
            Your business intelligence dashboard is ready
          </p>
        </div>

        <div className="space-y-8">
          {/* Attention Required */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg md:text-xl px-1">Attention Required</h3>
            <div className="space-y-4">
              {analyticsData.businessInsights?.capacityUtilization &&
               analyticsData.businessInsights.capacityUtilization.overallUtilization > 90 && (
                <div className="w-full bg-[#1D212B] border border-[#383838] rounded-xl p-4 flex items-start space-x-4 cursor-pointer hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined text-yellow-400 mt-1">priority_high</span>
                  <div>
                    <p className="font-medium text-white text-base">High Capacity Alert</p>
                    <p className="text-sm text-[#A0A0A0]">
                      Capacity is at {capacityPercent.toFixed(0)}%. Consider adding new slots.
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[#6B6B6B] ml-auto text-lg self-center">chevron_right</span>
                </div>
              )}
              {revenueChange < 0 && (
                <div className="w-full bg-[#1D212B] border border-[#383838] rounded-xl p-4 flex items-start space-x-4 cursor-pointer hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined text-red-400 mt-1">trending_down</span>
                  <div>
                    <p className="font-medium text-white text-base">Revenue Decline</p>
                    <p className="text-sm text-[#A0A0A0]">
                      Revenue is down {Math.abs(revenueChange).toFixed(1)}% compared to previous period.
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[#6B6B6B] ml-auto text-lg self-center">chevron_right</span>
                </div>
              )}
            </div>
          </div>

          {/* Owner's Box */}
          <div className="bg-[#1D212B] border border-[#383838] rounded-2xl p-4 sm:p-5">
            <div className="flex items-center mb-4">
              <span className="material-symbols-outlined text-[#3D8DDA] mr-2.5">business_center</span>
              <h3 className="font-semibold text-lg md:text-xl text-white">Owner's Box</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
                <div>
                  <p className="text-xs text-[#A0A0A0]">Period Revenue</p>
                  <p className="text-lg font-semibold text-white">${todayRevenue.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#A0A0A0]">vs. Previous</p>
                  <p className={`text-lg font-semibold flex items-center justify-end ${revenueChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <span className="material-symbols-outlined text-base mr-1">
                      {revenueChange >= 0 ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                    {Math.abs(revenueChange).toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
                <div>
                  <p className="text-xs text-[#A0A0A0]">Today's Bookings</p>
                  <p className="text-lg font-semibold text-white">{upcomingBookings}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#A0A0A0]">Capacity</p>
                  <p className="text-lg font-semibold text-[#3D8DDA]">{capacityPercent.toFixed(0)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Insights */}
          <div className="space-y-5">
            <h3 className="font-semibold text-lg md:text-xl px-1 tracking-tight">Quick Insights</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSend("Show me my revenue trends")}
                disabled={chatLoading}
                className="group flex flex-col items-center justify-center space-y-3 p-4 bg-gradient-to-br from-[#1D212B] to-[#1A1E28] border border-[#383838] rounded-2xl hover:border-[#3D8DDA] hover:shadow-lg hover:shadow-[#3D8DDA]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-3 bg-[#3D8DDA]/10 rounded-xl group-hover:bg-[#3D8DDA]/20 transition-colors">
                  <span className="material-symbols-outlined text-[#3D8DDA] text-2xl">monitoring</span>
                </div>
                <span className="text-xs font-semibold text-white tracking-tight">Revenue</span>
              </button>
              <button
                onClick={() => handleSend("Tell me about my operations performance")}
                disabled={chatLoading}
                className="group flex flex-col items-center justify-center space-y-3 p-4 bg-gradient-to-br from-[#1D212B] to-[#1A1E28] border border-[#383838] rounded-2xl hover:border-[#3D8DDA] hover:shadow-lg hover:shadow-[#3D8DDA]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-3 bg-[#3D8DDA]/10 rounded-xl group-hover:bg-[#3D8DDA]/20 transition-colors">
                  <span className="material-symbols-outlined text-[#3D8DDA] text-2xl">construction</span>
                </div>
                <span className="text-xs font-semibold text-white tracking-tight">Operations</span>
              </button>
              <button
                onClick={() => handleSend("Give me insights about my guests")}
                disabled={chatLoading}
                className="group flex flex-col items-center justify-center space-y-3 p-4 bg-gradient-to-br from-[#1D212B] to-[#1A1E28] border border-[#383838] rounded-2xl hover:border-[#3D8DDA] hover:shadow-lg hover:shadow-[#3D8DDA]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-3 bg-[#3D8DDA]/10 rounded-xl group-hover:bg-[#3D8DDA]/20 transition-colors">
                  <span className="material-symbols-outlined text-[#3D8DDA] text-2xl">sentiment_satisfied</span>
                </div>
                <span className="text-xs font-semibold text-white tracking-tight">Guests</span>
              </button>
            </div>
          </div>

          {/* AI Chat */}
          <div className="space-y-8">
            {conversationHistory.map((msg: any, idx: number) => (
              <div key={idx}>
                {msg.role === 'user' && (
                  <div className="flex justify-end pt-4">
                    <div className="bg-[#3D8DDA] text-white rounded-t-2xl rounded-bl-2xl px-4 py-3 max-w-[85%] md:max-w-[70%]">
                      <p>{msg.content}</p>
                    </div>
                  </div>
                )}

                {msg.role === 'assistant' && (
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="bg-[#3D8DDA] rounded-full p-2 mt-1 flex-shrink-0">
                      <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>auto_awesome</span>
                    </div>
                    <div className="w-full space-y-6">
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
                                  return <h3 key={lineIdx} className="text-base md:text-lg font-semibold text-white mt-6 mb-3 tracking-tight">{line.replace('### ', '')}</h3>;
                                }
                                if (line.startsWith('## ')) {
                                  return <h2 key={lineIdx} className="text-lg md:text-xl font-semibold text-white mt-7 mb-4 tracking-tight">{line.replace('## ', '')}</h2>;
                                }
                                if (line.startsWith('# ')) {
                                  return <h1 key={lineIdx} className="text-xl md:text-2xl font-bold text-white mt-8 mb-5 tracking-tight">{line.replace('# ', '')}</h1>;
                                }
                                if (line.trim().startsWith('- ')) {
                                  const content = line.replace(/^-\s*/, '');
                                  return (
                                    <li key={lineIdx} className="text-[#E0E0E0] ml-4 mb-2 leading-relaxed" dangerouslySetInnerHTML={{
                                      __html: content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
                                    }} />
                                  );
                                }
                                if (line.match(/^\d+\.\s/)) {
                                  const content = line.replace(/^\d+\.\s/, '');
                                  return (
                                    <li key={lineIdx} className="text-[#E0E0E0] ml-4 mb-2 leading-relaxed" dangerouslySetInnerHTML={{
                                      __html: content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
                                    }} />
                                  );
                                }
                                // Parse bold text in paragraphs
                                const parsedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
                                return <p key={lineIdx} className="text-[#E0E0E0] leading-relaxed mb-3 text-sm md:text-base" dangerouslySetInnerHTML={{ __html: parsedLine }} />;
                              })}
                            </div>

                            {/* Key Insights and Recommended Actions in styled cards */}
                            {(hasInsights || hasActions) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                                {hasInsights && (
                                  <div className="bg-gradient-to-br from-[#1D212B] to-[#181C25] p-5 md:p-6 rounded-xl border border-[#383838] shadow-lg">
                                    <div className="flex items-center mb-4">
                                      <div className="p-2 bg-[#3D8DDA]/10 rounded-lg mr-3">
                                        <span className="material-symbols-outlined text-[#3D8DDA] text-xl">lightbulb</span>
                                      </div>
                                      <h3 className="font-semibold text-white text-base tracking-tight">Key Insights</h3>
                                    </div>
                                    <ul className="space-y-3 text-sm list-none">
                                      {sections.insights.map((line: string, i: number) => {
                                        if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                                          const content = line.replace(/^[-*]\s*/, '');
                                          return (
                                            <li key={i} className="flex items-start group">
                                              <span className="material-symbols-outlined text-[#3D8DDA] text-base mr-3 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform">trending_up</span>
                                              <span className="text-[#E0E0E0] leading-relaxed text-sm" dangerouslySetInnerHTML={{
                                                __html: content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
                                              }} />
                                            </li>
                                          );
                                        }
                                        return null;
                                      })}
                                    </ul>
                                  </div>
                                )}

                                {hasActions && (
                                  <div className="bg-gradient-to-br from-[#1D212B] to-[#181C25] p-5 md:p-6 rounded-xl border border-[#383838] shadow-lg">
                                    <div className="flex items-center mb-4">
                                      <div className="p-2 bg-green-500/10 rounded-lg mr-3">
                                        <span className="material-symbols-outlined text-green-400 text-xl">task_alt</span>
                                      </div>
                                      <h3 className="font-semibold text-white text-base tracking-tight">Recommended Actions</h3>
                                    </div>
                                    <div className="space-y-3">
                                      {sections.actions.map((line: string, i: number) => {
                                        const trimmedLine = line.trim();

                                        // Try different patterns for actions
                                        // Pattern 1: **Title**: Description
                                        let match = trimmedLine.match(/\*\*(.*?)\*\*:\s*(.*)/);
                                        if (match) {
                                          return (
                                            <div key={i} className="bg-black/20 p-4 rounded-lg border border-transparent hover:border-[#3D8DDA] hover:bg-black/30 transition-all cursor-pointer group">
                                              <div className="flex items-start space-x-3">
                                                <span className="material-symbols-outlined text-[#3D8DDA] mt-0.5 text-lg flex-shrink-0 group-hover:scale-110 transition-transform">campaign</span>
                                                <div className="flex-1">
                                                  <h4 className="font-semibold text-white text-sm mb-1.5 tracking-tight">{match[1]}</h4>
                                                  <p className="text-xs text-[#B0B0B0] leading-relaxed">{match[2]}</p>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        }

                                        // Pattern 2: 1. **Title**: Description or - **Title**: Description
                                        match = trimmedLine.match(/^[-\d]+[\.\)]\s*\*\*(.*?)\*\*:\s*(.*)/);
                                        if (match) {
                                          return (
                                            <div key={i} className="bg-black/20 p-4 rounded-lg border border-transparent hover:border-[#3D8DDA] hover:bg-black/30 transition-all cursor-pointer group">
                                              <div className="flex items-start space-x-3">
                                                <span className="material-symbols-outlined text-[#3D8DDA] mt-0.5 text-lg flex-shrink-0 group-hover:scale-110 transition-transform">campaign</span>
                                                <div className="flex-1">
                                                  <h4 className="font-semibold text-white text-sm mb-1.5 tracking-tight">{match[1]}</h4>
                                                  <p className="text-xs text-[#B0B0B0] leading-relaxed">{match[2]}</p>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        }

                                        // Pattern 3: Plain bullet or numbered item
                                        if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*') || trimmedLine.match(/^\d+\./)) {
                                          const content = trimmedLine.replace(/^[-*\d]+[\.\)]\s*/, '');
                                          if (content) {
                                            return (
                                              <div key={i} className="bg-black/20 p-3 rounded-lg border border-transparent hover:border-[#3D8DDA] hover:bg-black/30 transition-all group">
                                                <div className="flex items-start space-x-3">
                                                  <span className="material-symbols-outlined text-[#3D8DDA] mt-0.5 text-base flex-shrink-0">arrow_forward</span>
                                                  <p className="text-sm text-[#E0E0E0] leading-relaxed" dangerouslySetInnerHTML={{
                                                    __html: content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
                                                  }} />
                                                </div>
                                              </div>
                                            );
                                          }
                                        }

                                        return null;
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        );
                      })()}

                      {/* Charts from AI response */}
                      {msg.charts && msg.charts.length > 0 && (
                        <div className="space-y-6">
                          {msg.charts.map((chart: any, chartIdx: number) => (
                            <div key={chartIdx} className="bg-[#1D212B] border border-[#383838] rounded-xl p-4 md:p-5">
                              <div className="flex items-center mb-4">
                                <span className="material-symbols-outlined text-[#3D8DDA] mr-2">insights</span>
                                <h3 className="font-semibold text-white">{chart.title || 'Chart'}</h3>
                              </div>
                              <div className="relative h-56 sm:h-64 md:h-72 w-full">
                                <canvas id={`chart-${idx}-${chartIdx}`} className="w-full h-full"></canvas>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tables from AI response */}
                      {msg.tables && msg.tables.length > 0 && (
                        <div className="space-y-6">
                          {msg.tables.map((table: any, tableIdx: number) => (
                            <div key={tableIdx} className="bg-[#1D212B] border border-[#383838] rounded-xl p-4 md:p-5 overflow-x-auto">
                              <div className="flex items-center mb-4">
                                <span className="material-symbols-outlined text-[#3D8DDA] mr-2">table_chart</span>
                                <h3 className="font-semibold text-white">{table.title || 'Table'}</h3>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-[#383838]">
                                      {table.headers?.map((header: string, hIdx: number) => (
                                        <th key={hIdx} className="text-left py-3 px-4 font-semibold text-white">
                                          {header}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {table.rows?.map((row: any[], rIdx: number) => (
                                      <tr key={rIdx} className="border-b border-[#383838]/50 hover:bg-white/5 transition-colors">
                                        {row.map((cell: any, cIdx: number) => (
                                          <td key={cIdx} className="py-3 px-4 text-[#E0E0E0]">
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

                      {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                        <div className="pt-2">
                          <p className="text-sm text-[#A0A0A0] mb-3">Suggested next steps:</p>
                          <div className="flex flex-wrap gap-2">
                            {msg.suggestedQuestions.map((question: string, qIdx: number) => (
                              <button
                                key={qIdx}
                                onClick={() => handleSend(question)}
                                className="text-xs text-white bg-white/10 px-3 py-1.5 rounded-full border border-transparent hover:border-[#3D8DDA] transition-colors"
                              >
                                "{question}"
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
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
                    <span className="text-sm text-[#A0A0A0]">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="relative !mt-8">
            <div className="relative">
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
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#3D8DDA] text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-[#2c79c1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
