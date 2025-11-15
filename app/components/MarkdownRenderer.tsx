'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

/**
 * Renders markdown text with proper styling for the AI Assistant
 */
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // First pass: identify if we have both insights and actions sections
  const hasInsights = content.toLowerCase().includes('### key insights') || content.toLowerCase().includes('### insights');
  const hasActions = content.toLowerCase().includes('### recommended actions') || content.toLowerCase().includes('### actions');
  const shouldUseTwoColumns = hasInsights && hasActions;

  // Split content into lines and process markdown
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let currentOrderedList: string[] = [];
  let listKey = 0;
  let currentSection: 'insights' | 'actions' | 'normal' = 'normal';

  // For two-column layout, collect sections separately
  let insightsElements: React.ReactNode[] = [];
  let actionsElements: React.ReactNode[] = [];
  let isCollectingInsights = false;
  let isCollectingActions = false;

  const flushList = (targetArray?: React.ReactNode[]) => {
    const targetElements = targetArray || elements;

    if (currentList.length > 0) {
      // Different styling based on section
      if (currentSection === 'insights') {
        // Key Insights: Each item as a card with icon
        targetElements.push(
          <ul key={`list-${listKey++}`} className="space-y-1.5 text-sm list-none pl-1 mt-1.5">
            {currentList.map((item, idx) => {
              // V3 icon colors rotation
              const iconColors = ['text-[var(--info)]', 'text-[var(--accent-purple)]', 'text-[var(--danger)]', 'text-[var(--success)]', 'text-[var(--warning)]'];
              const icons = ['pie_chart', 'repeat', 'trending_down', 'trending_up', 'analytics'];
              const iconColor = iconColors[idx % iconColors.length];
              const icon = icons[idx % icons.length];

              return (
                <li key={idx} className="flex items-start">
                  <span className={`material-symbols-outlined ${iconColor} text-sm mr-2 mt-0.5`}>{icon}</span>
                  <span className="text-[var(--text-secondary)] leading-relaxed text-sm">{processInlineMarkdown(item)}</span>
                </li>
              );
            })}
          </ul>
        );
      } else {
        // Normal list
        targetElements.push(
          <ul key={`list-${listKey++}`} className="space-y-2 my-3 ml-1">
            {currentList.map((item, idx) => (
              <li key={idx} className="text-sm text-[var(--text-primary)] leading-relaxed flex items-start">
                <span className="text-[var(--brand-primary)] mr-2.5 mt-0.5 flex-shrink-0">•</span>
                <span className="flex-1">{processInlineMarkdown(item)}</span>
              </li>
            ))}
          </ul>
        );
      }
      currentList = [];
    }
  };

  const flushOrderedList = (targetArray?: React.ReactNode[]) => {
    const targetElements = targetArray || elements;

    if (currentOrderedList.length > 0) {
      // Different styling based on section
      if (currentSection === 'actions') {
        // Recommended Actions: Each item as a card
        targetElements.push(
          <ol key={`ordered-list-${listKey++}`} className="space-y-1.5 text-sm list-none mt-1.5">
            {currentOrderedList.map((item, idx) => {
              // Split into title and description if there's a colon or period
              const parts = item.split(/[:.]/);
              const title = parts[0]?.trim();
              const description = parts.slice(1).join(':').trim();

              return (
                <li key={idx} className="bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg p-2">
                  {title && <p className="font-medium text-white mb-0.5 text-sm">{title}.</p>}
                  {description && <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{description}</p>}
                </li>
              );
            })}
          </ol>
        );
      } else {
        // Normal numbered list
        targetElements.push(
          <ol key={`ordered-list-${listKey++}`} className="space-y-2 my-3 ml-1 list-none">
            {currentOrderedList.map((item, idx) => (
              <li key={idx} className="text-sm text-[var(--text-primary)] leading-relaxed flex items-start">
                <span className="text-[var(--brand-primary)] font-semibold mr-2.5 mt-0.5 flex-shrink-0">{idx + 1}.</span>
                <span className="flex-1">{processInlineMarkdown(item)}</span>
              </li>
            ))}
          </ol>
        );
      }
      currentOrderedList = [];
    }
  };

  const processInlineMarkdown = (text: string): React.ReactNode => {
    // Process both bold (**text**) and italic (*text* or _text_)
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-medium text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
        return (
          <em key={idx} className="italic text-[var(--text-primary)]">
            {part.slice(1, -1)}
          </em>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      if (isCollectingInsights) {
        flushList(insightsElements);
        flushOrderedList(insightsElements);
      } else if (isCollectingActions) {
        flushList(actionsElements);
        flushOrderedList(actionsElements);
      } else {
        flushList();
        flushOrderedList();
      }
      return;
    }

    // Determine target array
    const targetElements = isCollectingInsights ? insightsElements : isCollectingActions ? actionsElements : elements;

    // H2 headers (##)
    if (trimmed.startsWith('## ')) {
      if (isCollectingInsights) {
        flushList(insightsElements);
        flushOrderedList(insightsElements);
      } else if (isCollectingActions) {
        flushList(actionsElements);
        flushOrderedList(actionsElements);
      } else {
        flushList();
        flushOrderedList();
      }

      // End collection mode when we hit a new H2
      isCollectingInsights = false;
      isCollectingActions = false;
      currentSection = 'normal';

      elements.push(
        <h2 key={lineIdx} className="text-base font-bold text-[var(--text-primary)] mt-4 mb-2 first:mt-0 tracking-tight">
          {trimmed.slice(3)}
        </h2>
      );
      return;
    }

    // H3 headers (###)
    if (trimmed.startsWith('### ')) {
      if (isCollectingInsights) {
        flushList(insightsElements);
        flushOrderedList(insightsElements);
      } else if (isCollectingActions) {
        flushList(actionsElements);
        flushOrderedList(actionsElements);
      } else {
        flushList();
        flushOrderedList();
      }

      const headerText = trimmed.slice(4);

      // Special styling for Key Insights section
      if (headerText.toLowerCase().includes('key insights') || headerText.toLowerCase().includes('insights')) {
        currentSection = 'insights';
        isCollectingInsights = shouldUseTwoColumns;
        isCollectingActions = false;

        const headerElement = (
          <div key={lineIdx} className="flex items-center mb-2">
            <span className="material-symbols-outlined text-[var(--warning)] mr-2" style={{ fontSize: '16px' }}>
              lightbulb
            </span>
            <h3 className="text-sm font-semibold text-white">
              {headerText}
            </h3>
          </div>
        );

        if (shouldUseTwoColumns) {
          insightsElements.push(headerElement);
        } else {
          elements.push(
            <div key={lineIdx} className="bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl p-2 md:p-3 mt-2">
              {headerElement}
            </div>
          );
        }
      }
      // Special styling for Recommended Actions section
      else if (headerText.toLowerCase().includes('recommended actions') || headerText.toLowerCase().includes('actions')) {
        currentSection = 'actions';
        isCollectingActions = shouldUseTwoColumns;
        isCollectingInsights = false;

        const headerElement = (
          <div key={lineIdx} className="flex items-center mb-2">
            <span className="material-symbols-outlined text-[var(--warning)] mr-2" style={{ fontSize: '16px' }}>
              task_alt
            </span>
            <h3 className="text-sm font-semibold text-white">
              {headerText}
            </h3>
          </div>
        );

        if (shouldUseTwoColumns) {
          actionsElements.push(headerElement);
        } else {
          elements.push(
            <div key={lineIdx} className="bg-transparent border-2 border-dashed border-[var(--brand-primary)]/40 rounded-xl p-2 md:p-3 mt-2">
              {headerElement}
            </div>
          );
        }
      }
      // Special styling for Follow-up Questions section
      else if (headerText.toLowerCase().includes('follow-up')) {
        currentSection = 'normal';
        isCollectingInsights = false;
        isCollectingActions = false;

        elements.push(
          <div key={lineIdx} className="mt-6 pt-5 border-t border-[var(--border-primary)]">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
              <span className="text-[var(--brand-primary)] mr-2">💡</span>
              {headerText}
            </h3>
          </div>
        );
      } else {
        currentSection = 'normal';
        isCollectingInsights = false;
        isCollectingActions = false;

        elements.push(
          <h3 key={lineIdx} className="text-sm font-semibold text-[var(--text-primary)] mt-3 mb-2 tracking-tight">
            {headerText}
          </h3>
        );
      }
      return;
    }

    // Numbered lists (1. 2. etc.)
    const numberedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (numberedMatch) {
      if (isCollectingInsights) {
        flushList(insightsElements);
      } else if (isCollectingActions) {
        flushList(actionsElements);
      } else {
        flushList();
      }
      currentOrderedList.push(numberedMatch[1]);
      return;
    }

    // Bullet points (-) or (•)
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      if (isCollectingInsights) {
        flushOrderedList(insightsElements);
      } else if (isCollectingActions) {
        flushOrderedList(actionsElements);
      } else {
        flushOrderedList();
      }
      currentList.push(trimmed.slice(2));
      return;
    }

    // Regular paragraphs
    if (isCollectingInsights) {
      flushList(insightsElements);
      flushOrderedList(insightsElements);
    } else if (isCollectingActions) {
      flushList(actionsElements);
      flushOrderedList(actionsElements);
    } else {
      flushList();
      flushOrderedList();
    }

    targetElements.push(
      <p key={lineIdx} className="text-sm text-[var(--text-primary)] leading-relaxed my-2">
        {processInlineMarkdown(trimmed)}
      </p>
    );
  });

  // Flush any remaining list items
  if (isCollectingInsights) {
    flushList(insightsElements);
    flushOrderedList(insightsElements);
  } else if (isCollectingActions) {
    flushList(actionsElements);
    flushOrderedList(actionsElements);
  } else {
    flushList();
    flushOrderedList();
  }

  // If we collected both sections, insert them as a two-column grid
  if (shouldUseTwoColumns && (insightsElements.length > 0 || actionsElements.length > 0)) {
    // Find where to insert the two-column layout (after any initial content)
    const twoColumnLayout = (
      <div key="two-column-insights-actions" className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 my-3">
        {/* Key Insights Column */}
        {insightsElements.length > 0 && (
          <div className="bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl p-2 md:p-3">
            {insightsElements}
          </div>
        )}

        {/* Recommended Actions Column */}
        {actionsElements.length > 0 && (
          <div className="bg-transparent border-2 border-dashed border-[var(--brand-primary)]/40 rounded-xl p-2 md:p-3">
            {actionsElements}
          </div>
        )}
      </div>
    );

    elements.push(twoColumnLayout);
  }

  return <div className="markdown-content">{elements}</div>;
}
