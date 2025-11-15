'use client';

import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import AiAssistant from './AiAssistant';
import { LogOut } from 'lucide-react';

export default function AssistantPage() {
  const { credentials, logout, analyticsData, setAnalyticsData } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    if (!credentials) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentials }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load analytics');
      }

      setAnalyticsData(data.data);
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="Resova"
                className="h-8 mr-3"
              />
              <h1 className="text-xl font-semibold text-gray-900">
                AI Assistant
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/test-apis"
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Test APIs
              </a>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your analytics data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-red-800 font-semibold mb-2">
              Failed to Load Analytics
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadAnalyticsData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <AiAssistant
              credentials={credentials!}
              analyticsData={analyticsData}
            />
          </div>
        )}
      </div>
    </div>
  );
}
