'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SimpleAuth } from '@/app/lib/simple-auth';
import { AuthStorage } from '@/app/lib/storage/auth-storage';
import { ConfigStorage } from '@/app/lib/storage/config-storage';

interface AuthGateProps {
  children: React.ReactNode;
}

/**
 * Authentication Gate
 *
 * Handles routing logic based on authentication status:
 * - If not signed in → redirect to /signin
 * - If signed in but not onboarded → redirect to /onboarding
 * - If signed in and onboarded → allow access
 *
 * Public routes that bypass auth:
 * - /signin, /signup, /onboarding
 */
export default function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Public routes that don't require auth
    const publicRoutes = ['/', '/signin', '/signup', '/onboarding'];

    if (publicRoutes.includes(pathname)) {
      setIsChecking(false);
      return;
    }

    // Check authentication - run once, prevent loops
    const isSignedIn = SimpleAuth.isSignedIn();
    const hasResovaKeys = AuthStorage.isAuthenticated();
    const isOnboarded = ConfigStorage.isOnboardingComplete();

    if (!isSignedIn) {
      // No user account → go to signin
      router.push('/signin');
    } else if (!hasResovaKeys || !isOnboarded) {
      // Signed in but missing API keys → go to onboarding
      router.push('/onboarding');
    }

    // Set checking to false regardless - prevent infinite loops
    setIsChecking(false);
  }, []); // Empty deps - only run once on mount

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
