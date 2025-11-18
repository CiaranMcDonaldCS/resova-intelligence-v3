/**
 * App Context
 * Global state management using React Context
 *
 * Updated to use storage layer for credentials (Phase 1 integration)
 */

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Credentials, AnalyticsData, Message } from '@/app/types/analytics';
import { createAnalyticsService, AnalyticsService } from '../lib/services/analytics-service';
import { AuthStorage } from '../lib/storage/auth-storage';
import { ConfigStorage } from '../lib/storage/config-storage';
import { logger } from '../lib/utils/logger';

interface AppState {
  // Auth status (credentials now in storage, not state)
  isAuthenticated: boolean;

  // Analytics Data
  analyticsData: AnalyticsData | null;
  analyticsLoading: boolean;
  analyticsError: string | null;

  // Chat
  conversationHistory: Message[];
  chatLoading: boolean;
  chatError: string | null;

  // Service
  analyticsService: AnalyticsService | null;
}

interface AppContextType extends AppState {
  // Auth actions
  initializeAuth: () => Promise<boolean>;
  logout: () => void;

  // Analytics actions
  fetchAnalytics: (dateRange?: string) => Promise<void>;
  refreshAnalytics: () => Promise<void>;

  // Chat actions
  sendMessage: (message: string) => Promise<string | undefined>;
  clearConversation: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    isAuthenticated: false,
    analyticsData: null,
    analyticsLoading: false,
    analyticsError: null,
    conversationHistory: [],
    chatLoading: false,
    chatError: null,
    analyticsService: null,
  });

  // Initialize authentication from storage on mount
  const initializeAuth = useCallback(async (): Promise<boolean> => {
    console.log('🔐 [AppContext] initializeAuth() called');
    logger.info('Initializing authentication from storage...');

    try {
      // Check if user is authenticated via storage
      const isAuth = AuthStorage.isAuthenticated();
      console.log('🔐 [AppContext] AuthStorage.isAuthenticated():', isAuth);

      if (!isAuth) {
        logger.info('No stored credentials found');
        setState(prev => ({ ...prev, isAuthenticated: false }));
        return false;
      }

      // Load credentials from storage
      const authData = AuthStorage.load();
      console.log('🔐 [AppContext] Loaded auth data:', authData ? {
        hasResovaKey: !!authData.resovaApiKey,
        hasClaudeKey: !!authData.claudeApiKey,
        resovaUrl: authData.resovaApiUrl
      } : 'NULL');

      if (!authData) {
        logger.warn('Auth check passed but failed to load credentials');
        setState(prev => ({ ...prev, isAuthenticated: false }));
        return false;
      }

      // Create credentials object for service
      const credentials: Credentials = {
        resovaApiKey: authData.resovaApiKey,
        resovaApiUrl: authData.resovaApiUrl,
        claudeApiKey: authData.claudeApiKey,
      };

      // Initialize analytics service
      console.log('🔐 [AppContext] Creating analytics service...');
      const analyticsService = createAnalyticsService(credentials);
      console.log('🔐 [AppContext] Analytics service created:', !!analyticsService);

      logger.info('Authentication initialized successfully');

      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        analyticsService,
      }));

      console.log('🔐 [AppContext] State updated with service');
      return true;
    } catch (error: any) {
      console.error('🔐 [AppContext] Failed to initialize auth:', error);
      logger.error('Failed to initialize auth', error);
      setState(prev => ({ ...prev, isAuthenticated: false }));
      return false;
    }
  }, []);

  // Initialize on mount - empty deps to run once
  useEffect(() => {
    initializeAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Logout and clear storage
  const logout = useCallback(() => {
    logger.info('User logging out');

    // Clear storage
    AuthStorage.clear();
    ConfigStorage.clear();

    // Clear state
    setState(prev => ({
      ...prev,
      isAuthenticated: false,
      analyticsData: null,
      analyticsLoading: false,
      analyticsError: null,
      conversationHistory: [],
      chatLoading: false,
      chatError: null,
      analyticsService: null,
    }));
  }, []);

  // Fetch analytics data via API route
  const fetchAnalytics = useCallback(async (dateRange?: string) => {
    console.log('📈 [AppContext] fetchAnalytics() called with dateRange:', dateRange);

    // Load credentials from storage
    const authData = AuthStorage.load();
    if (!authData) {
      console.warn('📈 [AppContext] No credentials - skipping fetch');
      logger.warn('Credentials not available - skipping fetch');
      return;
    }

    const credentials: Credentials = {
      resovaApiKey: authData.resovaApiKey,
      resovaApiUrl: authData.resovaApiUrl,
      claudeApiKey: authData.claudeApiKey,
    };

    console.log('📈 [AppContext] Setting loading state...');
    setState(prev => ({
      ...prev,
      analyticsLoading: true,
      analyticsError: null,
    }));

    try {
      console.log('📈 [AppContext] Calling /api/analytics...');
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credentials,
          dateRange,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch analytics');
      }

      const result = await response.json();
      console.log('📈 [AppContext] Data received:', result.data ? 'SUCCESS' : 'NULL');
      logger.service('analytics', 'Data fetched successfully');

      setState(prev => ({
        ...prev,
        analyticsData: result.data,
        analyticsLoading: false,
      }));
      console.log('📈 [AppContext] State updated with analytics data');
    } catch (error: any) {
      console.error('📈 [AppContext] Fetch failed:', error.message);
      logger.error('Failed to fetch analytics', error);

      setState(prev => ({
        ...prev,
        analyticsLoading: false,
        analyticsError: error.message || 'Failed to fetch analytics',
      }));
    }
  }, []);

  // Refresh analytics (refetch current date range)
  const refreshAnalytics = useCallback(async () => {
    return fetchAnalytics();
  }, [fetchAnalytics]);

  // Send chat message via API route
  const sendMessage = useCallback(async (message: string): Promise<string | undefined> => {
    // Load credentials from storage
    const authData = AuthStorage.load();
    if (!authData) {
      logger.error('Credentials not available');
      return;
    }

    const credentials: Credentials = {
      resovaApiKey: authData.resovaApiKey,
      resovaApiUrl: authData.resovaApiUrl,
      claudeApiKey: authData.claudeApiKey,
    };

    setState(prev => ({
      ...prev,
      chatLoading: true,
      chatError: null,
      conversationHistory: [
        ...prev.conversationHistory,
        { role: 'user', content: message }
      ],
    }));

    try {
      // Log the data being sent to Claude for debugging
      console.log('💬 [Chat] Sending to Claude:', {
        message,
        topPurchased: state.analyticsData?.topPurchased,
        periodSummary: state.analyticsData?.periodSummary,
        salesSummary: state.analyticsData?.salesSummary,
        hasRawData: !!state.analyticsData?.rawData,
        rawDataKeys: state.analyticsData?.rawData ? Object.keys(state.analyticsData.rawData) : [],
        sampleBooking: state.analyticsData?.rawData?.allBookings?.[0],
        sampleItemRevenue: state.analyticsData?.rawData?.itemizedRevenue?.[0],
      });

      // Call the API route instead of direct service
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          analyticsData: state.analyticsData,
          conversationHistory: state.conversationHistory,
          credentials
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to get response';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If we can't parse JSON, it's likely an HTML error page
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.success && data.message) {
        logger.service('chat', 'Message sent successfully');
        setState(prev => ({
          ...prev,
          conversationHistory: [
            ...prev.conversationHistory,
            {
              role: 'assistant',
              content: data.message,
              charts: data.charts || [],
              suggestedQuestions: data.suggestedQuestions || []
            }
          ],
          chatLoading: false,
        }));

        return data.message;
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error: any) {
      logger.error('Failed to send message', error);

      setState(prev => ({
        ...prev,
        chatLoading: false,
        chatError: error.message || 'Failed to send message',
      }));

      return undefined;
    }
  }, [state.analyticsData, state.conversationHistory]);

  // Clear conversation history
  const clearConversation = useCallback(() => {
    setState(prev => ({
      ...prev,
      conversationHistory: [],
      chatError: null,
    }));
  }, []);

  // Auto-fetch analytics when authenticated (disabled - let pages fetch explicitly)
  // This prevents automatic fetching on landing page and other public pages
  // Pages that need data should call fetchAnalytics() explicitly
  /*
  useEffect(() => {
    console.log('🔄 [AppContext] Auto-fetch check:', {
      isAuthenticated: state.isAuthenticated,
      hasData: !!state.analyticsData,
      isLoading: state.analyticsLoading,
      willFetch: !!(state.isAuthenticated && !state.analyticsData && !state.analyticsLoading)
    });

    if (state.isAuthenticated && !state.analyticsData && !state.analyticsLoading) {
      console.log('✅ [AppContext] Triggering auto-fetch...');
      fetchAnalytics();
    }
  }, [state.isAuthenticated, state.analyticsData, state.analyticsLoading, fetchAnalytics]);
  */

  const value: AppContextType = {
    ...state,
    initializeAuth,
    logout,
    fetchAnalytics,
    refreshAnalytics,
    sendMessage,
    clearConversation,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook to use the app context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Custom hook for analytics specifically
export function useAnalytics() {
  const { analyticsData, analyticsLoading, analyticsError, fetchAnalytics, refreshAnalytics } = useApp();
  return { analyticsData, analyticsLoading, analyticsError, fetchAnalytics, refreshAnalytics };
}

// Custom hook for chat specifically
export function useChat() {
  const { conversationHistory, chatLoading, chatError, sendMessage, clearConversation } = useApp();
  return { conversationHistory, chatLoading, chatError, sendMessage, clearConversation };
}
