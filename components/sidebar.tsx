'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AllIconsComponent from '@/public/custom-icon/AllIconsComponent';
import { useSidebar } from './contexts/SidebarContext';
import { cn } from '@/utils/cn';

const navItems = [
  { href: '/hayati', label: 'હયાતી', icon: 'hayatiIcon' },
  { href: '/maran', label: 'મરણ', icon: 'maranIcon' },
  { href: '/settings', label: 'Settings', icon: 'settingsIcon' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  const displayName =
    auth?.user?.username?.trim() ||
    auth?.user?.email?.trim()?.split('@')[0] ||
    'User';

  const displayInitial = (displayName?.[0] || 'U').toUpperCase();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [setMobileOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    try {
      if (auth?.logout) await auth.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Backdrop overlay — mobile/tablet only */}
      <div
        className={cn(
          'fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300',
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        className={cn(
          'sidebar fixed left-0 top-0 h-screen flex flex-col z-50',
          'transition-all duration-300 ease-in-out',
          // Mobile/tablet width: make room for labels so it doesn't feel cramped
          'w-[150px] -translate-x-full',
          mobileOpen && 'translate-x-0',
          'lg:translate-x-0',
          collapsed ? 'lg:w-[68px]' : 'lg:w-[150px]'
        )}
      >
        {/* Brand area */}
        <div
          className={cn(
            'flex items-center h-14 shrink-0 border-b border-white/10 px-4 gap-3',
            collapsed && 'lg:justify-center lg:px-0'
          )}
        >
          <span
            className={cn(
              'text-white font-semibold text-lg tracking-wide whitespace-nowrap overflow-hidden',
              collapsed && 'lg:text-sm'
            )}
          >
              <span className={collapsed ? 'lg:hidden' : ''}>{displayName}</span>
              <span className={cn('hidden', collapsed && 'lg:inline')}>{displayInitial}</span>
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 min-h-0 overflow-y-auto hide-scrollbar pt-3 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'sidebar-nav-link flex items-center gap-3 py-2.5 px-3 mb-1 w-full',
                  collapsed && 'lg:justify-center lg:px-0',
                  isActive && 'active'
                )}
              >
                <div
                  className={cn(
                    'sidebar-icon-box flex items-center justify-center w-[34px] h-[34px] rounded-lg transition-colors shrink-0',
                    isActive && 'active'
                  )}
                >
                  <AllIconsComponent
                    iconName={item.icon}
                    height="18"
                    width="18"
                    color={isActive ? '#CBA135' : '#FFFFFF'}
                  />
                </div>
                <span
                  className={cn(
                    'whitespace-nowrap overflow-hidden text-[0.95rem]',
                    collapsed && 'lg:hidden'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section: Logout + Desktop collapse toggle */}
        <div className="mt-auto shrink-0 border-t border-white/10 px-2 pb-3 pt-2">
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            className={cn(
              'sidebar-nav-link flex items-center gap-3 py-2.5 px-3 w-full',
              collapsed && 'lg:justify-center lg:px-0'
            )}
          >
            <div className="sidebar-icon-box flex items-center justify-center w-[34px] h-[34px] rounded-lg shrink-0">
              <AllIconsComponent iconName="logoutIcon" height="18" width="18" color="#FFFFFF" />
            </div>
            <span className={cn('whitespace-nowrap overflow-hidden text-[0.95rem]', collapsed && 'lg:hidden')}>
              Logout
            </span>
          </button>

          {/* Desktop-only collapse toggle */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-collapse-btn hidden lg:flex items-center justify-center w-full py-2 mt-1 rounded-lg transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}
