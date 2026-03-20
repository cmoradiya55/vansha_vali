'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, loading, isExpired } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user && !isExpired) {
        router.push('/hayati');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, isExpired, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-yellow-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
