'use client';

import { useEffect } from 'react';
import { useApp, useAnalytics } from '../context/AppContext';
import DarkAiAssistant from './DarkAiAssistant';
import LoadingScreen from './LoadingScreen';
import { Settings, LogOut, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const { logout, analyticsService } = useApp();
  const {
    analyticsData,
    analyticsLoading,
    analyticsError,
    fetchAnalytics,
    refreshAnalytics
  } = useAnalytics();

  // Fetch analytics on mount (only if service is initialized)
  useEffect(() => {
    if (analyticsService && !analyticsData && !analyticsLoading) {
      fetchAnalytics();
    }
  }, [analyticsService, analyticsData, analyticsLoading, fetchAnalytics]);

  // Handle refresh
  const handleRefresh = async () => {
    await refreshAnalytics();
  };

  // Handle logout
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  // Handle settings navigation
  const handleSettings = () => {
    router.push('/settings');
  };

  // Loading state
  if (analyticsLoading && !analyticsData) {
    return <LoadingScreen message="Loading analytics..." />;
  }

  // Error state
  if (analyticsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-slate-800 border border-red-500/30 rounded-lg p-6 max-w-md">
            <p className="text-red-400 mb-4">{analyticsError}</p>
            <button
              onClick={() => fetchAnalytics()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">No analytics data available</p>
          <button
            onClick={() => fetchAnalytics()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Load Data
          </button>
        </div>
      </div>
    );
  }

  // Main render - Single screen with AI Assistant
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Simple Header - Fixed at top */}
      <header className="fixed top-0 left-0 right-0 bg-slate-800/95 backdrop-blur-md border-b border-slate-700 z-50">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img
                src="/logo.png"
                alt="Resova Intelligence"
                className="h-8"
              />
              <span className="text-white font-semibold text-lg">
                Intelligence
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={analyticsLoading}
                className="p-2 text-slate-300 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-all disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw
                  className={`w-5 h-5 ${analyticsLoading ? 'animate-spin' : ''}`}
                />
              </button>

              {/* Settings Button */}
              <button
                onClick={handleSettings}
                className="p-2 text-slate-300 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-all"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - AI Assistant */}
      <div className="pt-16">
        <DarkAiAssistant />
      </div>
    </div>
  );
}
