'use client';

import { useRouter } from 'next/navigation';
import Landing from './components/Landing';

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/signup');
  };

  // Always show landing page - let user click buttons to navigate
  return <Landing onGetStarted={handleGetStarted} />;
}
