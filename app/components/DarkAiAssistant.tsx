'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat, useAnalytics } from '../context/AppContext';
import { MarkdownRenderer } from './MarkdownRenderer';
import { DynamicChart } from './DynamicChart';
import { mapChartSpecsToData } from '@/app/lib/utils/chart-data-mapper';

export default function DarkAiAssistant() {
  const { analyticsData } = useAnalytics();
  const { conversationHistory, chatLoading, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [conversationHistory]);

  const handleSend = async (messageText?: string) => {
    const userMessage = messageText || input.trim();
    if (!userMessage || chatLoading) return;

    setInput('');
    await sendMessage(userMessage);
  };

  return (
    <div className="space-y-8">
      {/* Conversation Area */}
      <div className="space-y-8">
        {conversationHistory.map((msg: any, idx: number) => (
          <div key={idx}>
            {msg.role === 'user' && (
              <div className="flex justify-end pt-4">
                <div className="bg-[--primary] text-white rounded-t-2xl rounded-bl-2xl px-4 py-3 max-w-[85%] md:max-w-[70%]">
                  <p>{msg.content}</p>
                </div>
              </div>
            )}

            {msg.role === 'assistant' && (
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="bg-[--primary] rounded-full p-2 mt-1 flex-shrink-0">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>
                    auto_awesome
                  </span>
                </div>
                <div className="w-full space-y-6">
                  <div className="font-medium md:text-base prose prose-sm max-w-none text-[--text-primary]">
                    <MarkdownRenderer content={msg.content} />
                  </div>

                  {/* Render charts if they exist */}
                  {msg.charts && msg.charts.length > 0 && analyticsData && (
                    <div className="space-y-6">
                      {mapChartSpecsToData(msg.charts, analyticsData).map((chart: any, chartIdx: number) => (
                        <div key={chartIdx} className="bg-[--surface-dark] border border-[--border-color] rounded-xl p-4 md:p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                            <div className="flex items-center">
                              <span className="material-symbols-outlined text-[--primary] mr-2">insights</span>
                              <h3 className="font-semibold text-[--text-primary]">{chart.title}</h3>
                            </div>
                          </div>
                          <div className="relative h-56 sm:h-64 md:h-72 w-full">
                            <DynamicChart chart={chart} height={288} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggested Questions */}
                  {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="pt-2">
                      <p className="text-sm text-[--text-secondary] mb-3">Suggested next steps:</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.suggestedQuestions.map((question: string, qIdx: number) => (
                          <button
                            key={qIdx}
                            onClick={() => handleSend(question)}
                            className="text-xs text-[--text-primary] bg-white/10 px-3 py-1.5 rounded-full border border-transparent hover:border-[--primary] transition-colors"
                          >
                            {question}
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
            <div className="bg-[--primary] rounded-full p-2 mt-1 flex-shrink-0">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>
                auto_awesome
              </span>
            </div>
            <div className="w-full">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[--primary] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[--primary] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-[--primary] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-sm text-[--text-secondary]">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="relative !mt-8">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[--text-muted]">
          search
        </span>
        <input
          className="w-full bg-[--surface-dark] text-[--text-primary] border-2 border-[--border-color] rounded-full pl-12 pr-14 py-4 text-base focus:ring-[--primary] focus:border-[--primary] placeholder:text-[--text-muted]"
          placeholder="Ask anything..."
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
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-[--primary] text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-[--primary-accent] transition-colors disabled:opacity-50"
          onClick={() => handleSend()}
          disabled={!input.trim() || chatLoading}
        >
          <span className="material-symbols-outlined">arrow_upward</span>
        </button>
      </div>
    </div>
  );
}
