'use client';

import { AppProvider } from './context/AppContext';
import AuthGate from './components/AuthGate';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AuthGate>
        {children}
      </AuthGate>
    </AppProvider>
  );
}
