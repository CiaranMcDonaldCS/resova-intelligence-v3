/**
 * App Context
 * Global state management using React Context
 */

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Credentials, AnalyticsData, Message } from '@/app/types/analytics';
import { createAnalyticsService, AnalyticsService } from '../lib/services/analytics-service';
import { logger } from '../lib/utils/logger';

interface AppState {
  // Auth & Credentials
  credentials: Credentials | null;
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
  login: (credentials: Credentials) => Promise<void>;
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
    credentials: null,
    isAuthenticated: false,
    analyticsData: null,
    analyticsLoading: false,
    analyticsError: null,
    conversationHistory: [],
    chatLoading: false,
    chatError: null,
    analyticsService: null,
  });

  // Login and initialize services
  const login = useCallback(async (credentials: Credentials) => {
    logger.info('User logging in (production mode)');

    // Validate credentials by making a test API call
    logger.info('Validating production credentials...');

    try {
      const testService = createAnalyticsService(credentials);
      // Try to fetch analytics to validate credentials
      await testService.getAnalytics();
      logger.info('Credentials validated successfully');
    } catch (error: any) {
      logger.error('Invalid credentials', error);
      throw new Error('Invalid API credentials. Please check your Resova API Key and URL.');
    }

    const analyticsService = createAnalyticsService(credentials);

    setState(prev => ({
      ...prev,
      credentials,
      isAuthenticated: true,
      analyticsService,
    }));
  }, []);

  // Logout and clear state
  const logout = useCallback(() => {
    logger.info('User logging out');

    setState({
      credentials: null,
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
    if (!state.analyticsService) {
      logger.error('Analytics service not initialized');
      return;
    }

    setState(prev => ({
      ...prev,
      analyticsLoading: true,
      analyticsError: null,
    }));

    try {
      const data = await state.analyticsService.getAnalytics(dateRange);
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
  }, [state.analyticsService]);

  // Refresh analytics (refetch current date range)
  const refreshAnalytics = useCallback(async () => {
    return fetchAnalytics();
  }, [fetchAnalytics]);

  // Send chat message via API route
  const sendMessage = useCallback(async (message: string): Promise<string | undefined> => {
    if (!state.credentials) {
      logger.error('Credentials not available');
      return;
    }

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
          credentials: state.credentials
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
  }, [state.credentials, state.analyticsData, state.conversationHistory]);

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
    login,
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