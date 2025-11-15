'use client';

import React from 'react';

/**
 * Quick Insights Component
 * Clean 3-button grid matching reference design
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
    <div className="grid grid-cols-3 gap-3">
      {insights.map((insight) => (
        <button
          key={insight.id}
          onClick={() => handleInsightClick(insight.id)}
          className="bg-[#1D212B] border border-[#383838] rounded-lg p-4 transition-all hover:border-[#3D8DDA] hover:bg-[#252A35]"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-[#3D8DDA] text-3xl">
              {insight.icon}
            </span>
            <span className="text-white text-sm font-medium">
              {insight.label}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
