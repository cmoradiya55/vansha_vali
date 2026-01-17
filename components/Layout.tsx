'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

// Simple SVG Icon Components for website
const MenuIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const LogOutIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
  </svg>
);

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout, user, loading } = useAuth();

  const isHayati = pathname.includes('/hayati');
  const isMaran = pathname.includes('/maran');
  
  // Redirect to login if not authenticated (except on login page)
  useEffect(() => {
    if (!loading && !isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthenticated, loading, pathname, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-yellow-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-yellow-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-yellow-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-[70px] bg-yellow-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-3 sm:p-4 lg:hidden">
            <h2 className="text-lg sm:text-xl font-bold">Menu</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:text-yellow-200 p-1"
              aria-label="Close menu"
            >
              <MenuIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-2">
            <div className="flex flex-col gap-2 h-[50px]"> </div>
            <button
              onClick={() => {
                router.push('/hayati');
                setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-2 sm:gap-3 px-2 py-2 text-left transition-all relative ${
                isHayati
                  ? 'bg-yellow-100 text-yellow-800 shadow-lg border-l-4 border-l-yellow-500'
                  : 'text-yellow-100 hover:bg-yellow-800 hover:text-white border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex-1 min-w-0">
                <span className={`block text-sm sm:text-base font-semibold`}>હયાતી</span>
              </div>
            </button>
            <button
              onClick={() => {
                router.push('/maran');
                setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-2 sm:gap-3 px-2 py-2 text-left transition-all relative ${
                isMaran
                  ? 'bg-yellow-100 text-yellow-800 shadow-lg border-l-4 border-l-yellow-500'
                  : 'text-yellow-100 hover:bg-yellow-800 hover:text-white border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex-1 min-w-0">
                <span className={`block text-sm sm:text-base font-semibold`}>મરણ</span>
              </div>
            </button>
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-yellow-900 text-white shadow-md">
          <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
                aria-label="Open menu"
              >
                <MenuIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <h1 className="text-base sm:text-xl font-semibold truncate">Kim Kathodara</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {user && (
                <div className="hidden sm:block text-xs sm:text-sm">
                  <span className="text-yellow-200 truncate max-w-[120px] sm:max-w-none inline-block">{user.email}</span>
                </div>
              )}
              <button
                onClick={() => router.push('/settings')}
                className="flex items-center gap-1 sm:gap-2 hover:text-yellow-200 transition-colors p-1"
                title="Settings"
                aria-label="Settings"
              >
                <SettingsIcon className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer hover:text-yellow-200" />
                <span className="hidden sm:inline">Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 hover:text-yellow-200 transition-colors p-1"
                aria-label="Logout"
              >
                <LogOutIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline text-sm sm:text-base">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-white p-2 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
      
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

