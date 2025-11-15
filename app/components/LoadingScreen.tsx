'use client';

import { Loader2, Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * Loading Screen Component
 *
 * Displays a loading indicator with optional message.
 * Can be used as a full-screen overlay or inline component.
 *
 * Usage:
 * <LoadingScreen message="Loading your data..." />
 * <LoadingScreen message="Processing..." fullScreen={false} />
 */
export default function LoadingScreen({
  message = 'Loading...',
  fullScreen = true,
}: LoadingScreenProps) {
  const containerClass = fullScreen
    ? 'fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center z-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClass}>
      <div className="text-center">
        {/* Animated Logo/Icon */}
        <div className="relative mb-6">
          {/* Outer spinning ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-16 h-16 text-blue-500/30 animate-spin" />
          </div>

          {/* Inner pulsing icon */}
          <div className="relative flex items-center justify-center h-16">
            <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
          </div>
        </div>

        {/* Loading Message */}
        <p className="text-slate-300 font-medium text-lg animate-pulse">
          {message}
        </p>

        {/* Animated dots */}
        <div className="flex justify-center space-x-1 mt-4">
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          ></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline Loading Spinner
 *
 * Smaller loading indicator for inline use (buttons, cards, etc.)
 *
 * Usage:
 * <LoadingSpinner size="sm" />
 * <LoadingSpinner size="lg" className="text-blue-600" />
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2
      className={`${sizeClasses[size]} animate-spin ${className}`}
      aria-label="Loading"
    />
  );
}
