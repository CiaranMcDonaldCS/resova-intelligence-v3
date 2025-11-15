'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useChat, useAnalytics, useApp } from '../context/AppContext';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ChartGrid } from './DynamicChart';
import { mapChartSpecToData } from '@/app/lib/utils/chart-data-mapper';
import PersonalizableFocusCards from './PersonalizableFocusCards';
import ProactiveInsights from './ProactiveInsights';
import WhatIfScenario from './WhatIfScenario';
import DeepDiveModal from './DeepDiveModal';
import OwnersBox from './OwnersBox';
import { Calculator, Lightbulb, Zap, ChevronRight } from 'lucide-react';

// Focus areas matching the design
const FOCUS_AREAS = [
  {
    id: 'overview',
    icon: TrendingUpIcon,
    iconColor: 'text-green-400',
    label: 'General Overview',
    questions: [
      "Show me my performance overview",
      "What are the most important trends?",
      "Provide a concise business summary"
    ]
  },
  {
    id: 'financial',
    icon: AttachMoneyIcon,
    iconColor: 'text-yellow-400',
    label: 'Financial Performance',
    questions: [
      "Show me revenue breakdown by source",
      "What's our net margin after expenses?",
      "Compare this month's revenue to last month"
    ]
  },
  {
    id: 'customers',
    icon: PeopleIcon,
    iconColor: 'text-blue-400',
    label: 'Customers & Growth',
    questions: [
      "Who are my top 10 highest value customers?",
      "What's our customer retention rate?",
      "Show me repeat customer trends"
    ]
  },
  {
    id: 'guests',
    icon: PersonAddIcon,
    iconColor: 'text-pink-400',
    label: 'Guests & CRM',
    questions: [
      "Show me all guests from the last 30 days",
      "Who are our top spending guests?",
      "Which guests haven't visited in 90 days?"
    ]
  },
  {
    id: 'inventory',
    icon: ShoppingBagIcon,
    iconColor: 'text-orange-400',
    label: 'Inventory & Extras',
    questions: [
      "Which extras generate the most revenue?",
      "Show me current stock levels",
      "What extras are running low?"
    ]
  },
  {
    id: 'giftvouchers',
    icon: CardGiftcardIcon,
    iconColor: 'text-teal-400',
    label: 'Gift Vouchers',
    questions: [
      "Show me all active gift vouchers",
      "What's the total unredeemed value?",
      "Which vouchers expire soon?"
    ]
  },
  {
    id: 'operations',
    icon: BarChartIcon,
    iconColor: 'text-gray-400',
    label: 'Operations & Capacity',
    questions: [
      "How well are we utilizing capacity?",
      "What are our peak booking times?",
      "Show me today's bookings"
    ]
  },
  {
    id: 'forecasting',
    icon: CalendarMonthIcon,
    iconColor: 'text-purple-400',
    label: 'Future & Planning',
    questions: [
      "How many bookings do we have next week?",
      "What's our projected revenue?",
      "Which activities need more staff?"
    ]
  }
];

const SUGGESTED_QUESTIONS = [
  "Show me my performance overview",
  "What are my top recommended actions?",
  "Compare this week to last week"
];

export default function DarkAiAssistant() {
  const { logout } = useApp();
  const { analyticsData } = useAnalytics();
  const { conversationHistory, chatLoading, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [deepDiveContent, setDeepDiveContent] = useState<any>(null);
  const [showDeepDive, setShowDeepDive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
    <div className="min-h-screen flex flex-col bg-[#121212] text-white">
      <div className="max-w-6xl mx-auto w-full">
      {/* Header */}
      <header className="bg-transparent pt-4 px-4 sm:px-6 md:px-8 pb-2 flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm bg-black/30">
        <img
          alt="Resova AI logo"
          className="h-12"
          src="/logo.png"
        />
        <div className="flex items-center space-x-2">
          <button className="text-gray-400 hover:text-white p-2 transition-colors">
            <SettingsIcon sx={{ fontSize: 20 }} />
          </button>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-white p-2 transition-colors"
          >
            <LogoutIcon sx={{ fontSize: 20 }} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-6 md:p-8 space-y-6 pb-28 overflow-y-auto">
        {/* Dashboard Overview Section */}
        <div className="space-y-4">
          {/* Owner's Box - Executive Summary */}
          <OwnersBox analyticsData={analyticsData} />

          {/* Critical Alerts - Only shown when there are high-priority insights */}
          <ProactiveInsights
            analyticsData={analyticsData}
            onInsightClick={(insight) => {
              setDeepDiveContent({
                type: 'insight',
                title: insight.title,
                description: insight.message,
                category: insight.type,
                priority: insight.priority,
                relatedQuestions: [
                  `How can I ${insight.action?.toLowerCase()}?`,
                  `What caused ${insight.title.toLowerCase()}?`,
                  `Show me detailed analysis of ${insight.metric || 'this metric'}`
                ]
              });
              setShowDeepDive(true);
            }}
          />

          {/* Quick Actions Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Quick Actions
              </h2>
            </div>
            <PersonalizableFocusCards onCardClick={handleSend} />
          </div>

          {/* Advanced Tools Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-purple-400" />
                Advanced Tools
              </h2>
            </div>

            {/* What-If Scenario Planning */}
            <div className="bg-[#1E1E1E] border border-[#383838] rounded-xl overflow-hidden">
              <button
                onClick={() => setShowWhatIf(!showWhatIf)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#2E2E2E] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Calculator className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">What-If Scenario Planning</p>
                    <p className="text-xs text-[#A0A0A0]">Model business decisions and forecast outcomes</p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-[#A0A0A0] transition-transform ${showWhatIf ? 'rotate-90' : ''}`} />
              </button>

              {showWhatIf && (
                <div className="border-t border-[#383838]">
                  <WhatIfScenario
                    analyticsData={analyticsData}
                    onRunScenario={(scenario, results) => {
                      handleSend(`I just ran a ${scenario} scenario. ${results.length > 0 ? 'The results show ' + results.map(r => r.metric + ': ' + r.change).join(', ') + '.' : ''} What are the key risks and opportunities I should consider?`);
                      setShowWhatIf(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Welcome Message or Conversation */}
        {conversationHistory.length === 0 && !chatLoading ? (
          <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-br from-[#2E2D72]/10 via-[#5E5CE6]/10 to-[#2E2D72]/10 border border-[#5E5CE6]/20 p-8 rounded-xl shadow-lg">
              <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-white mb-3 tracking-tight">
                  What would you like to know about your business, Alex?
                </h1>
                <p className="text-base text-[#B0B0B0] leading-relaxed">
                  Ask me questions about your revenue, bookings, customers, inventory, gift vouchers, or operations. I'll provide insights based on your real-time data.
                </p>
              </div>
            </div>

            {/* Suggested Questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {SUGGESTED_QUESTIONS.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(question)}
                  className="text-left text-sm bg-[#1E1E1E] p-3 rounded-lg border border-[#383838] hover:bg-white/5 transition-colors"
                >
                  "{question}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Conversation Messages */
          <div className="space-y-6">
            {conversationHistory.map((msg: any, idx: number) => (
              <div key={idx}>
                {msg.role === 'user' ? (
                  /* User Message */
                  <div className="flex justify-end pt-4">
                    <div className="bg-[#5E5CE6] text-white rounded-t-2xl rounded-bl-2xl px-4 py-3 max-w-[85%] md:max-w-[70%]">
                      <p>{msg.content}</p>
                    </div>
                  </div>
                ) : (
                  /* AI Assistant Message */
                  <div className="space-y-6">
                    <div className="flex items-start space-x-3 md:space-x-4">
                      <div className="bg-gradient-to-br from-[#2E2D72] to-[#5E5CE6] rounded-full p-2 mt-1 flex-shrink-0">
                        <AutoAwesomeIcon sx={{ fontSize: 20, color: 'white' }} />
                      </div>
                      <div className="flex-1 w-full space-y-4">
                        {/* Message Content */}
                        <div className="prose prose-invert prose-sm max-w-none">
                          <MarkdownRenderer content={msg.content} />
                        </div>

                        {/* Charts */}
                        {msg.charts && msg.charts.length > 0 && analyticsData && (
                          <div className="w-full">
                            <ChartGrid charts={msg.charts.map(spec => mapChartSpecToData(spec, analyticsData))} />
                          </div>
                        )}

                        {/* Follow-up Questions */}
                        {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                          <div className="pt-2">
                            <p className="text-sm text-[#A0A0A0] mb-2">Suggested follow-ups:</p>
                            <div className="flex flex-wrap gap-2">
                              {msg.suggestedQuestions.map((question: string, qIdx: number) => (
                                <button
                                  key={qIdx}
                                  onClick={() => handleSend(question)}
                                  className="text-xs text-white bg-white/10 px-3 py-1.5 rounded-full border border-transparent hover:bg-white/20 transition-colors"
                                >
                                  {question}
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

            {/* Loading State */}
            {chatLoading && (
              <div className="flex items-start space-x-3">
                <div className="bg-gradient-to-br from-[#2E2D72] to-[#5E5CE6] rounded-full p-2 mt-1 flex-shrink-0">
                  <AutoAwesomeIcon sx={{ fontSize: 20, color: 'white' }} />
                </div>
                <div className="flex space-x-2 mt-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>
      </div>

      {/* Fixed Bottom Input */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-lg border-t border-[#383838]">
        <div className="max-w-6xl mx-auto p-4 sm:px-6 md:px-8">
        <div className="relative">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={chatLoading}
            className="w-full bg-[#1E1E1E] text-white border-2 border-[#383838] rounded-xl pl-5 pr-14 py-4 text-base focus:ring-[#5E5CE6] focus:border-[#5E5CE6] placeholder:text-[#6B6B6B] outline-none"
            placeholder="Ask Resova AI..."
            type="text"
          />
          <button
            onClick={() => handleSend()}
            disabled={chatLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#5E5CE6] text-white rounded-lg w-10 h-10 flex items-center justify-center hover:bg-[#3333A3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>
            </svg>
          </button>
        </div>
        </div>
      </footer>

      {/* Deep Dive Modal */}
      <DeepDiveModal
        isOpen={showDeepDive}
        onClose={() => setShowDeepDive(false)}
        content={deepDiveContent}
        onAskQuestion={(question) => {
          handleSend(question);
          setShowDeepDive(false);
        }}
      />

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Dark theme prose styles - improved accessibility */
        .prose-invert {
          color: #E5E5E5;
          line-height: 1.7;
        }
        .prose-invert h1 {
          color: #E5E5E5;
          font-weight: 700;
          font-size: 2.25em;
          line-height: 1.3;
          margin-top: 0.8em;
          margin-bottom: 0.5em;
        }
        .prose-invert h2 {
          color: #E5E5E5;
          font-weight: 700;
          font-size: 1.875em;
          line-height: 1.35;
          margin-top: 0.8em;
          margin-bottom: 0.5em;
        }
        .prose-invert h3 {
          color: #E5E5E5;
          font-weight: 700;
          font-size: 1.5em;
          line-height: 1.4;
          margin-top: 0.8em;
          margin-bottom: 0.5em;
        }
        .prose-invert h4 {
          color: #E5E5E5;
          font-weight: 600;
          font-size: 1.25em;
          line-height: 1.4;
          margin-top: 0.8em;
          margin-bottom: 0.5em;
        }
        .prose-invert h5 {
          color: #E5E5E5;
          font-weight: 600;
          font-size: 1.125em;
          line-height: 1.5;
          margin-top: 0.8em;
          margin-bottom: 0.5em;
        }
        .prose-invert h6 {
          color: #E5E5E5;
          font-weight: 600;
          font-size: 1em;
          line-height: 1.5;
          margin-top: 0.8em;
          margin-bottom: 0.5em;
        }
        .prose-invert strong {
          color: #E5E5E5;
          font-weight: 700;
        }
        .prose-invert a {
          color: #8B9DFF;
          font-weight: 500;
          text-decoration: underline;
          text-decoration-color: rgba(139, 157, 255, 0.4);
        }
        .prose-invert a:hover {
          color: #A5B4FF;
          text-decoration-color: rgba(165, 180, 255, 0.6);
        }
        .prose-invert p {
          color: #E5E5E5;
          font-weight: 400;
          line-height: 1.7;
          margin-top: 0.75em;
          margin-bottom: 0.75em;
        }
        .prose-invert code {
          color: #F0F0F0;
          background: #2A2A2A;
          padding: 0.2em 0.5em;
          border-radius: 0.25rem;
          font-size: 0.9em;
          border: 1px solid #3A3A3A;
        }
        .prose-invert ul {
          list-style: none;
          padding-left: 1.5em;
          margin-top: 0.75em;
          margin-bottom: 0.75em;
        }
        .prose-invert li {
          padding-left: 0;
          position: relative;
          color: #E5E5E5;
          line-height: 1.7;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .prose-invert li::marker {
          content: none;
        }
        .prose-invert ol {
          padding-left: 1.5em;
          margin-top: 0.75em;
          margin-bottom: 0.75em;
        }
        .prose-invert ol li {
          color: #E5E5E5;
        }
      `}</style>
    </div>
  );
}
