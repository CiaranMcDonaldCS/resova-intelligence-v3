'use client';

import { AppProvider } from './context/AppContext';
import AuthGate from './components/AuthGate';
import ErrorBoundary from './components/ErrorBoundary';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AuthGate>
          {children}
        </AuthGate>
      </AppProvider>
    </ErrorBoundary>
  );
}
