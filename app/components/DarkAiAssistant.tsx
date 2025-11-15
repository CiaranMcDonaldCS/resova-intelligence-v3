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
import DeepDiveModal from './DeepDiveModal';
import OwnersBox from './OwnersBox';
import AttentionRequired from './AttentionRequired';
import QuickInsights from './QuickInsights';

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
    <div className="min-h-screen flex flex-col bg-[#121212] text-white pb-24">
      {/* Main Content - Centered Layout */}
      <main className="flex-grow px-4 py-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-4">

        {/* Welcome Message */}
        {conversationHistory.length === 0 && !chatLoading && (
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              A Modernized Resova Dashboard for Instant Clarity
            </h1>
            <p className="text-[#A0A0A0] text-sm">
              Your business insights, powered by AI
            </p>
          </div>
        )}

        {/* Attention Required */}
        <AttentionRequired
          analyticsData={analyticsData}
          onItemClick={(item) => {
            setDeepDiveContent({
              type: 'attention',
              title: item.title,
              description: item.description,
              category: item.category,
              priority: item.priority,
              relatedQuestions: [
                `How can I ${item.action?.toLowerCase()}?`,
                `What caused ${item.title.toLowerCase()}?`,
                `Show me more details about ${item.category}`
              ]
            });
            setShowDeepDive(true);
          }}
        />

        {/* Owner's Box */}
        <OwnersBox analyticsData={analyticsData} />

        {/* Quick Insights - Import the new component */}
        {conversationHistory.length === 0 && !chatLoading && (
          <div>
            <h2 className="text-base font-semibold text-white mb-3">Quick Insights</h2>
            <QuickInsights />
          </div>
        )}

        {/* Conversation Messages */}
        {conversationHistory.length > 0 && (
          <div className="space-y-6">
            {conversationHistory.map((msg: any, idx: number) => (
              <div key={idx}>
                {msg.role === 'user' ? (
                  /* User Message */
                  <div className="flex justify-end">
                    <div className="bg-[#3D8DDA] text-white rounded-lg px-4 py-3 max-w-[85%]">
                      <p>{msg.content}</p>
                    </div>
                  </div>
                ) : (
                  /* AI Assistant Message */
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <span className="material-symbols-outlined text-[#3D8DDA] text-2xl mt-1">
                        smart_toy
                      </span>
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
                                  className="text-xs text-white bg-[#1D212B] border border-[#383838] px-3 py-1.5 rounded-lg hover:border-[#3D8DDA] transition-colors"
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
                <span className="material-symbols-outlined text-[#3D8DDA] text-2xl mt-1">
                  smart_toy
                </span>
                <div className="flex space-x-2 mt-3">
                  <div className="w-2 h-2 bg-[#A0A0A0] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#A0A0A0] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-[#A0A0A0] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
        </div>
      </main>

      {/* Fixed Bottom Input */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-lg border-t border-[#383838] z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="relative">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={chatLoading}
              className="w-full bg-[#1D212B] text-white border border-[#383838] rounded-lg pl-4 pr-12 py-3 text-sm focus:ring-1 focus:ring-[#3D8DDA] focus:border-[#3D8DDA] placeholder:text-[#6B6B6B] outline-none"
              placeholder="Ask a question about your business..."
              type="text"
            />
            <button
              onClick={() => handleSend()}
              disabled={chatLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#3D8DDA] text-white rounded-md p-2 flex items-center justify-center hover:bg-[#2c79c1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-lg">
                send
              </span>
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
