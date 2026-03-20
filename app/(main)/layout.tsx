'use client';

import { SidebarProvider, useSidebar } from '@/components/contexts/SidebarContext';
import { Sidebar } from '@/components/sidebar';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';

function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar();

  const desktopMargin = collapsed ? 'lg:ml-[68px]' : 'lg:ml-[150px]';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar />

      {/* Mobile / Tablet App Bar */}
      <header className="app-bar fixed top-0 left-0 right-0 h-14 flex items-center gap-3 px-4 z-30 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 -ml-1 rounded-lg text-white hover:bg-white/10 active:bg-white/20 transition-colors"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
        {/* <span className="text-white font-semibold text-lg tracking-wide select-none">
          Vanshavali
        </span> */}
      </header>

      {/* Page content */}
      <main className={cn('flex-1 transition-[margin] duration-300 pt-14 lg:pt-0', desktopMargin)}>
        {children}
      </main>

      {/* Footer */}
      {/* <footer
        className={cn(
          'text-right text-sm text-white px-4 py-2 transition-[margin] duration-300',
          desktopMargin
        )}
        style={{ backgroundColor: '#CBA135' }}
      >
        2026 @ Vanshavali
      </footer> */}
    </div>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading, isExpired, logout } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (isExpired) {
      return;
    }

    setReady(true);
  }, [loading, user, isExpired, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-yellow-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border border-red-100 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Expired</h2>
          <p className="text-gray-600 mb-2">
            Your access has expired on{' '}
            <span className="font-semibold text-red-600">
              {new Date(user?.expiryDate || '').toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Please contact the administrator to renew your access.
          </p>
          <button
            onClick={async () => {
              await logout();
              router.replace('/login');
            }}
            className="w-full rounded-lg px-4 py-3 font-semibold text-white transition-all hover:shadow-lg"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <MainContent>{children}</MainContent>
    </SidebarProvider>
  );
}
