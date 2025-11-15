'use client';

import { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import Landing from './components/Landing';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';

export default function Home() {
  const [view, setView] = useState<'landing' | 'login' | 'dashboard'>('landing');
  const { login, logout, isAuthenticated, credentials } = useApp();

  // Navigate to landing when user logs out
  useEffect(() => {
    if (!isAuthenticated && view === 'dashboard') {
      setView('landing');
    }
  }, [isAuthenticated, view]);

  const handleLogin = async (creds: {
    resovaApiKey: string;
    resovaApiUrl: string;
    claudeApiKey: string;
  }) => {
    try {
      await login(creds);
      setView('dashboard');
    } catch (error: any) {
      // Error will be handled by LoginScreen component
      throw error;
    }
  };

  const handleLogout = () => {
    logout();
    setView('landing');
  };

  return (
    <div>
      {view === 'landing' && (
        <Landing
          onGetStarted={() => setView('login')}
        />
      )}

      {view === 'login' && (
        <LoginScreen
          onLogin={handleLogin}
          onBack={() => setView('landing')}
        />
      )}

      {view === 'dashboard' && credentials && (
        <Dashboard />
      )}
    </div>
  );
}