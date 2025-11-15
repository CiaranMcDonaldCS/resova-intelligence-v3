'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthStorage } from '@/app/lib/storage/auth-storage';
import { ConfigStorage } from '@/app/lib/storage/config-storage';

interface AuthGateProps {
  children: React.ReactNode;
}

/**
 * Authentication Gate
 *
 * Handles routing logic based on authentication status:
 * - If not authenticated → redirect to /onboarding
 * - If authenticated but not onboarded → redirect to /onboarding
 * - If authenticated and onboarded → allow access
 *
 * Special routes that bypass auth:
 * - /onboarding (public, for setup)
 */
export default function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Public routes that don't require auth
    const publicRoutes = ['/onboarding'];

    if (publicRoutes.includes(pathname)) {
      setIsChecking(false);
      return;
    }

    // Check authentication status
    const checkAuth = () => {
      const isAuthenticated = AuthStorage.isAuthenticated();
      const isOnboarded = ConfigStorage.isOnboardingComplete();

      if (!isAuthenticated || !isOnboarded) {
        // Not authenticated or not onboarded → go to onboarding
        setIsChecking(false);
        router.push('/onboarding');
      } else {
        // Authenticated and onboarded → allow access
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Show loading state while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
