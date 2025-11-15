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
    logger.info('Initializing authentication from storage...');

    try {
      // Check if user is authenticated via storage
      if (!AuthStorage.isAuthenticated()) {
        logger.info('No stored credentials found');
        setState(prev => ({ ...prev, isAuthenticated: false }));
        return false;
      }

      // Load credentials from storage
      const authData = AuthStorage.load();
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
      const analyticsService = createAnalyticsService(credentials);

      logger.info('Authentication initialized successfully');

      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        analyticsService,
      }));

      return true;
    } catch (error: any) {
      logger.error('Failed to initialize auth', error);
      setState(prev => ({ ...prev, isAuthenticated: false }));
      return false;
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Logout and clear storage
  const logout = useCallback(() => {
    logger.info('User logging out');

    // Clear storage
    AuthStorage.clear();
    ConfigStorage.clear();

    // Clear state
    setState({
      isAuthenticated: false,
      analyticsData: null,
      analyticsLoading: false,
      analyticsError: null,
      conversationHistory: [],
      chatLoading: false,
      chatError: null,
      analyticsService: null,
    });
  }, []);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async (dateRange?: string) => {
    setState(prev => {
      if (!prev.analyticsService) {
        logger.error('Analytics service not initialized');
        return prev;
      }

      return {
        ...prev,
        analyticsLoading: true,
        analyticsError: null,
      };
    });

    // Get current service from state
    let currentService: AnalyticsService | null = null;
    setState(prev => {
      currentService = prev.analyticsService;
      return prev;
    });

    if (!currentService) {
      return;
    }

    try {
      const data = await currentService.getAnalytics(dateRange);
      logger.service('analytics', 'Data fetched successfully');

      setState(prev => ({
        ...prev,
        analyticsData: data,
        analyticsLoading: false,
      }));
    } catch (error: any) {
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
