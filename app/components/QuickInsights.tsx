'use client';

import React from 'react';

/**
 * Quick Insights Component
 * Matches HTML mockup design exactly - 3-button grid
 */
export default function QuickInsights() {
  const insights = [
    {
      id: 'revenue',
      label: 'Revenue',
      icon: 'monitoring',
    },
    {
      id: 'operations',
      label: 'Operations',
      icon: 'construction',
    },
    {
      id: 'guests',
      label: 'Guests',
      icon: 'sentiment_satisfied',
    },
  ];

  const handleInsightClick = (id: string) => {
    console.log(`Insight clicked: ${id}`);
    // TODO: Implement insight-specific actions
  };

  return (
    <div className="grid grid-cols-3 gap-3 text-center">
      {insights.map((insight) => (
        <button
          key={insight.id}
          onClick={() => handleInsightClick(insight.id)}
          className="flex flex-col-reverse items-center justify-center space-y-2 space-y-reverse p-3 bg-[--surface-dark] border border-[--border-color] rounded-xl hover:border-[--primary] transition-colors"
        >
          <span className="material-symbols-outlined text-[--primary]">
            {insight.icon}
          </span>
          <span className="text-sm font-medium text-[--text-secondary] leading-tight">
            {insight.label}
          </span>
        </button>
      ))}
    </div>
  );
}
