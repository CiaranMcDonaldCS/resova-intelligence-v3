'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearPage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.clear();
    setTimeout(() => {
      router.push('/signin');
    }, 1000);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p className="text-white text-xl mb-2">Clearing storage...</p>
        <p className="text-slate-400">Redirecting to sign in...</p>
      </div>
    </div>
  );
}
