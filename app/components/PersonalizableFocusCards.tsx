'use client';

import React, { useState, useEffect } from 'react';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import { Settings, Eye, EyeOff, Plus, GripVertical } from 'lucide-react';

interface FocusArea {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  label: string;
  questions: string[];
  visible: boolean;
  order: number;
}

interface PersonalizableFocusCardsProps {
  onCardClick: (question: string) => void;
}

const DEFAULT_FOCUS_AREAS: FocusArea[] = [
  {
    id: 'overview',
    icon: TrendingUpIcon,
    iconColor: 'text-green-400',
    label: 'General Overview',
    questions: [
      'Show me my performance overview',
      'What are the most important trends?',
      'Provide a concise business summary',
    ],
    visible: true,
    order: 0,
  },
  {
    id: 'financial',
    icon: AttachMoneyIcon,
    iconColor: 'text-yellow-400',
    label: 'Financial Performance',
    questions: [
      'How much revenue did we generate?',
      'What\'s our net margin after expenses?',
      'Show me revenue breakdown by service',
    ],
    visible: true,
    order: 1,
  },
  {
    id: 'customers',
    icon: PeopleIcon,
    iconColor: 'text-blue-400',
    label: 'Customers & Growth',
    questions: [
      'Who are my top customers?',
      'Show me customer retention trends',
      'Which customers are at risk of churning?',
    ],
    visible: true,
    order: 2,
  },
  {
    id: 'guests',
    icon: PersonAddIcon,
    iconColor: 'text-pink-400',
    label: 'Guests & CRM',
    questions: [
      'Show me all guests from last 30 days',
      'Who are our top spending guests?',
      'Which guests haven\'t visited in 90 days?',
    ],
    visible: true,
    order: 3,
  },
  {
    id: 'inventory',
    icon: ShoppingBagIcon,
    iconColor: 'text-orange-400',
    label: 'Inventory & Extras',
    questions: [
      'What extras generate the most revenue?',
      'Show me stock levels for all extras',
      'Which extras need restocking?',
    ],
    visible: true,
    order: 4,
  },
  {
    id: 'giftvouchers',
    icon: CardGiftcardIcon,
    iconColor: 'text-teal-400',
    label: 'Gift Vouchers',
    questions: [
      'Show me active gift vouchers',
      'What\'s the total unredeemed value?',
      'Which vouchers are about to expire?',
    ],
    visible: true,
    order: 5,
  },
  {
    id: 'operations',
    icon: BarChartIcon,
    iconColor: 'text-gray-400',
    label: 'Operations & Capacity',
    questions: [
      'How well are we utilizing capacity?',
      'What are our peak booking times?',
      'Show me today\'s bookings',
    ],
    visible: true,
    order: 6,
  },
  {
    id: 'forecasting',
    icon: CalendarMonthIcon,
    iconColor: 'text-purple-400',
    label: 'Future & Planning',
    questions: [
      'How many bookings do we have next week?',
      'What\'s our projected revenue?',
      'Which activities need more staff?',
    ],
    visible: true,
    order: 7,
  },
];

export default function PersonalizableFocusCards({ onCardClick }: PersonalizableFocusCardsProps) {
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>(DEFAULT_FOCUS_AREAS);
  const [editMode, setEditMode] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Load saved preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('focusCardPreferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge saved preferences with default areas to restore icon references
        const merged = DEFAULT_FOCUS_AREAS.map(defaultArea => {
          const savedArea = parsed.find((a: any) => a.id === defaultArea.id);
          return savedArea ? {
            ...defaultArea,
            visible: savedArea.visible,
            order: savedArea.order
          } : defaultArea;
        });
        setFocusAreas(merged);
      } catch (error) {
        console.error('Failed to load focus card preferences', error);
      }
    }
  }, []);

  // Save preferences to localStorage (only save metadata, not icon references)
  const savePreferences = (areas: FocusArea[]) => {
    const toSave = areas.map(({ id, visible, order }) => ({ id, visible, order }));
    localStorage.setItem('focusCardPreferences', JSON.stringify(toSave));
    setFocusAreas(areas);
  };

  const toggleVisibility = (id: string) => {
    const updated = focusAreas.map(area =>
      area.id === id ? { ...area, visible: !area.visible } : area
    );
    savePreferences(updated);
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === id) return;

    const draggedIndex = focusAreas.findIndex(a => a.id === draggedItem);
    const targetIndex = focusAreas.findIndex(a => a.id === id);

    const reordered = [...focusAreas];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    // Update order values
    const updated = reordered.map((area, index) => ({ ...area, order: index }));
    setFocusAreas(updated);
  };

  const handleDragEnd = () => {
    if (draggedItem) {
      savePreferences(focusAreas);
    }
    setDraggedItem(null);
  };

  const resetToDefault = () => {
    savePreferences(DEFAULT_FOCUS_AREAS);
  };

  // V3 Design System - Updated color palette
  const colorMap: Record<string, string> = {
    'text-green-400': '#10B981',  // --success
    'text-yellow-400': '#F59E0B',  // --warning
    'text-gray-400': '#9CA3AF',   // --text-secondary
    'text-blue-400': '#3B82F6',   // --brand-primary
    'text-purple-400': '#A855F7',  // --accent-purple
    'text-orange-400': '#F97316',  // --accent-orange
    'text-pink-400': '#EC4899',   // pink accent
    'text-teal-400': '#06B6D4',   // --info
  };

  const visibleAreas = focusAreas
    .filter(area => area.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-3">
      {/* Edit Mode Toggle */}
      <div className="flex items-center justify-end gap-2">
        {editMode && (
          <button
            onClick={resetToDefault}
            className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            Reset to Default
          </button>
        )}
        <button
          onClick={() => setEditMode(!editMode)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] transition-colors text-xs text-white"
        >
          <Settings className="w-3.5 h-3.5" />
          {editMode ? 'Done' : 'Customize'}
        </button>
      </div>

      {/* Focus Area Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
        {(editMode ? focusAreas : visibleAreas).map((area) => {
          const Icon = area.icon;
          const iconColor = colorMap[area.iconColor] || '#9ca3af';

          return (
            <div
              key={area.id}
              draggable={editMode}
              onDragStart={() => handleDragStart(area.id)}
              onDragOver={(e) => handleDragOver(e, area.id)}
              onDragEnd={handleDragEnd}
              className={`relative group ${
                editMode ? 'cursor-move' : 'cursor-pointer'
              } ${!area.visible && editMode ? 'opacity-50' : ''}`}
            >
              {/* Drag Handle (Edit Mode) */}
              {editMode && (
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 z-10">
                  <GripVertical className="w-4 h-4 text-[var(--text-secondary)]" />
                </div>
              )}

              {/* Card */}
              <div
                onClick={() => {
                  if (editMode) {
                    toggleVisibility(area.id);
                  } else {
                    onCardClick(area.questions[0]);
                  }
                }}
                className={`relative overflow-hidden rounded-xl p-4 transition-all duration-200 ${
                  editMode
                    ? 'bg-[var(--background-primary)] border-2 border-dashed border-[var(--border-primary)] hover:border-[var(--brand-primary)]'
                    : 'bg-gradient-to-br from-[var(--brand-primary)]/10 via-[var(--background-primary)] to-[var(--background-primary)] border border-[var(--border-primary)] hover:border-[var(--brand-primary)] hover:shadow-lg hover:shadow-[var(--brand-primary)]/10'
                }`}
              >
                {/* Visibility Toggle (Edit Mode) */}
                {editMode && (
                  <div className="absolute top-2 right-2 z-10">
                    {area.visible ? (
                      <Eye className="w-4 h-4 text-[var(--success)]" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-[var(--text-secondary)]" />
                    )}
                  </div>
                )}

                <div className="flex flex-col items-center text-center space-y-2">
                  <div
                    className="p-2.5 rounded-lg"
                    style={{ backgroundColor: `${iconColor}15` }}
                  >
                    <Icon sx={{ fontSize: 24, color: iconColor }} />
                  </div>
                  <span className="text-xs font-medium text-white leading-tight">
                    {area.label}
                  </span>
                </div>

                {/* Hover Effect Gradient */}
                {!editMode && (
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at center, ${iconColor}10, transparent)`,
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Add Custom Card (Edit Mode) */}
        {editMode && (
          <button
            className="rounded-xl p-4 border-2 border-dashed border-[var(--border-primary)] hover:border-[var(--brand-primary)] transition-all flex flex-col items-center justify-center text-center space-y-2 group"
            title="Add custom focus area (coming soon)"
          >
            <div className="p-2.5 rounded-lg bg-[var(--brand-primary)]/10 group-hover:bg-[var(--brand-primary)]/20 transition-colors">
              <Plus className="w-6 h-6 text-[var(--brand-primary)]" />
            </div>
            <span className="text-xs font-medium text-[var(--text-secondary)] group-hover:text-white transition-colors">
              Add Custom
            </span>
          </button>
        )}
      </div>

      {/* Edit Mode Instructions */}
      {editMode && (
        <div className="text-xs text-[var(--text-secondary)] bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg p-3">
          <p className="font-medium text-white mb-1">Customize your quick actions:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Drag cards to reorder them</li>
            <li>Click a card to show/hide it</li>
            <li>Your preferences are saved automatically</li>
          </ul>
        </div>
      )}
    </div>
  );
}
