'use client';

import React from 'react';
import { X, TrendingUp, AlertCircle, Target, Clock, DollarSign, Users } from 'lucide-react';
import { DynamicChart } from './DynamicChart';
import { ParsedChart } from '@/app/lib/utils/chart-parser';

interface DeepDiveContent {
  type: 'insight' | 'action' | 'metric';
  title: string;
  description: string;
  category?: string;
  priority?: 'high' | 'medium' | 'low';

  // Detailed context
  context?: string;
  dataPoints?: DataPoint[];
  relatedMetrics?: RelatedMetric[];

  // For actions
  steps?: ActionStep[];
  estimatedImpact?: string;
  timeline?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  resources?: string[];

  // Charts
  charts?: ParsedChart[];

  // Follow-up
  relatedQuestions?: string[];
}

interface DataPoint {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  changePercent?: number;
}

interface RelatedMetric {
  name: string;
  value: string;
  impact: 'positive' | 'negative' | 'neutral';
}

interface ActionStep {
  title: string;
  description: string;
  completed?: boolean;
}

interface DeepDiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: DeepDiveContent | null;
  onAskQuestion?: (question: string) => void;
}

export default function DeepDiveModal({ isOpen, onClose, content, onAskQuestion }: DeepDiveModalProps) {
  if (!isOpen || !content) return null;

  const getCategoryIcon = () => {
    switch (content.category?.toLowerCase()) {
      case 'revenue':
      case 'financial':
        return <DollarSign className="w-5 h-5" />;
      case 'customers':
      case 'guests':
        return <Users className="w-5 h-5" />;
      case 'operations':
      case 'capacity':
        return <Target className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'low':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'hard':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#1A1A1A] rounded-2xl border border-[#383838] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#383838] bg-gradient-to-br from-[#2E2D72]/10 via-[#5E5CE6]/5 to-transparent">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[#5E5CE6]/10 text-[#5E5CE6]">
                {getCategoryIcon()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{content.title}</h2>
                {content.category && (
                  <p className="text-xs text-[#A0A0A0] mt-0.5">
                    {content.category}
                  </p>
                )}
              </div>
            </div>
            {content.description && (
              <p className="text-sm text-[#A0A0A0] leading-relaxed">
                {content.description}
              </p>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#2E2E2E] transition-colors"
          >
            <X className="w-5 h-5 text-[#A0A0A0]" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Priority Badge */}
          {content.priority && (
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(content.priority)}`}>
                {content.priority.toUpperCase()} PRIORITY
              </span>
            </div>
          )}

          {/* Context */}
          {content.context && (
            <div className="bg-[#1E1E1E] border border-[#383838] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-400" />
                Context
              </h3>
              <p className="text-sm text-[#A0A0A0] leading-relaxed">
                {content.context}
              </p>
            </div>
          )}

          {/* Data Points */}
          {content.dataPoints && content.dataPoints.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Key Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {content.dataPoints.map((point, index) => (
                  <div
                    key={index}
                    className="bg-[#1E1E1E] border border-[#383838] rounded-lg p-3"
                  >
                    <p className="text-xs text-[#A0A0A0] mb-1">{point.label}</p>
                    <p className="text-lg font-bold text-white">{point.value}</p>
                    {point.changePercent !== undefined && (
                      <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${
                        point.trend === 'up' ? 'text-green-400' : point.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {point.trend === 'up' ? '↗' : point.trend === 'down' ? '↘' : '→'}
                        {point.changePercent > 0 && '+'}{point.changePercent.toFixed(1)}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Steps */}
          {content.type === 'action' && content.steps && content.steps.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Implementation Steps</h3>
              <div className="space-y-2">
                {content.steps.map((step, index) => (
                  <div
                    key={index}
                    className="bg-[#1E1E1E] border border-[#383838] rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#5E5CE6]/20 text-[#5E5CE6] flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-white mb-1">
                          {step.title}
                        </h4>
                        <p className="text-xs text-[#A0A0A0] leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Metadata */}
          {content.type === 'action' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {content.estimatedImpact && (
                <div className="bg-[#1E1E1E] border border-[#383838] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <p className="text-xs text-[#A0A0A0]">Estimated Impact</p>
                  </div>
                  <p className="text-sm font-semibold text-white">{content.estimatedImpact}</p>
                </div>
              )}

              {content.timeline && (
                <div className="bg-[#1E1E1E] border border-[#383838] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <p className="text-xs text-[#A0A0A0]">Timeline</p>
                  </div>
                  <p className="text-sm font-semibold text-white">{content.timeline}</p>
                </div>
              )}

              {content.difficulty && (
                <div className="bg-[#1E1E1E] border border-[#383838] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-purple-400" />
                    <p className="text-xs text-[#A0A0A0]">Difficulty</p>
                  </div>
                  <p className={`text-sm font-semibold capitalize ${getDifficultyColor(content.difficulty)}`}>
                    {content.difficulty}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Resources Needed */}
          {content.resources && content.resources.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Resources Needed</h3>
              <div className="bg-[#1E1E1E] border border-[#383838] rounded-lg p-4">
                <ul className="space-y-2">
                  {content.resources.map((resource, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-[#A0A0A0]">
                      <span className="text-[#5E5CE6] mt-0.5">•</span>
                      <span>{resource}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Related Metrics */}
          {content.relatedMetrics && content.relatedMetrics.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Related Metrics</h3>
              <div className="space-y-2">
                {content.relatedMetrics.map((metric, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-[#1E1E1E] border border-[#383838] rounded-lg p-3"
                  >
                    <span className="text-sm text-[#A0A0A0]">{metric.name}</span>
                    <span className={`text-sm font-semibold ${
                      metric.impact === 'positive' ? 'text-green-400' : metric.impact === 'negative' ? 'text-red-400' : 'text-white'
                    }`}>
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts */}
          {content.charts && content.charts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Visual Analysis</h3>
              <div className="space-y-4">
                {content.charts.map((chart, index) => (
                  <div key={index} className="bg-[#1E1E1E] border border-[#383838] rounded-xl p-4">
                    <DynamicChart chart={chart} height={240} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Questions */}
          {content.relatedQuestions && content.relatedQuestions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Explore Further</h3>
              <div className="space-y-2">
                {content.relatedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onAskQuestion?.(question);
                      onClose();
                    }}
                    className="w-full text-left px-4 py-3 bg-[#1E1E1E] border border-[#383838] rounded-lg hover:border-[#5E5CE6] hover:bg-[#2E2D72]/10 transition-all group"
                  >
                    <p className="text-sm text-[#A0A0A0] group-hover:text-white transition-colors">
                      {question}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#383838] p-4 bg-[#1A1A1A]">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#383838] text-sm text-[#A0A0A0] hover:text-white hover:border-[#5E5CE6] transition-colors"
            >
              Close
            </button>
            {onAskQuestion && (
              <button
                onClick={() => {
                  onAskQuestion(`Tell me more about: ${content.title}`);
                  onClose();
                }}
                className="px-4 py-2 rounded-lg bg-[#5E5CE6] hover:bg-[#7E7CFF] text-white text-sm font-medium transition-colors"
              >
                Ask AI for More Details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
