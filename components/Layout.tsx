'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import SettingsIcon from '@/public/custom-icon/all-icons/SettingsIcon';
import LogOutIcon from '@/public/custom-icon/all-icons/LogoutIcon';

interface LayoutProps {
  children: React.ReactNode;
}

// Simple SVG Icon Components for website

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout, user, loading } = useAuth();

  const isHayati = pathname.includes('/hayati') && !pathname.includes('/hayati-template');
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
              {/* <MenuIcon className="h-5 w-5 sm:h-6 sm:w-6" /> */}
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
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 sm:h-6 sm:w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
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
                <SettingsIcon height="20" width="20" color="white" />

                
                {/* <span className="hidden sm:inline">Settings</span> */}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 hover:text-yellow-200 transition-colors p-1"
                aria-label="Logout"
              >
                <LogOutIcon height="20" width="20" color="white" />
                {/* <span className="hidden sm:inline text-sm sm:text-base">Logout</span> */}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-white p-2 sm:p-4 ">
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

