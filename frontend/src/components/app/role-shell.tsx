/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/app/role-shell.tsx
 *
 * Product:
 * WyshCare Healthcare Operating System
 *
 * Brand:
 * WYSH
 *
 * Founder:
 * Vimarshak Prudhvi
 *
 * Purpose:
 * React component: role-shell
 *
 * Responsibilities:
 * - Render UI components for Frontend
 * - Handle user interactions and state management
 *
 * Used By:
 - frontend/src/app/insurance/claims/page.tsx
 - frontend/src/app/doctor/emr/dermatology/page.tsx
 - frontend/src/components/ui/glass-card.tsx
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 *
 * Calls:
 - notification-bell
 - avatar
 - react
 - api
 - utils
 - navigation
 - session-store
 - lucide-react
 *
 * Dependencies:
 - notification-bell
 - avatar
 - react
 - api
 - utils
 - navigation
 - session-store
 - lucide-react
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Frontend
 *
 * Last Reviewed:
2026-06-12
 *
 * ============================================================================
 * (c) Wysh Technologies
 * Built by Vimarshak Prudhvi
 * All Rights Reserved
 * ============================================================================
 */

'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, HeartPulse, Menu, X, type LucideIcon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage, getInitials } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { NotificationBell } from '@/components/app/notification-bell';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useSessionStore } from '@/stores/session-store';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function RoleShell({
  children,
  nav,
  title,
  role,
}: {
  children: ReactNode;
  nav: NavItem[];
  title: string;
  role: string;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);
  const clearSession = useSessionStore((s) => s.clearSession);
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !user) {
      router.replace('/login');
    }
  }, [hydrated, router, user]);

  async function handleLogout() {
    try {
      await api.logout();
    } finally {
      clearSession();
      router.replace('/login');
    }
  }

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--color-bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#007AFF] to-[#5856D6] shadow-lg">
            <HeartPulse className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">Restoring secure session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-primary)]">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[var(--color-bg-card)] text-[var(--color-text-primary)] transition-transform duration-200 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-brand-primary)] to-[#5856D6] shadow-lg shadow-[var(--color-brand-primary)]/20">
            <HeartPulse className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight">{title}</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-lg p-1.5 text-[var(--color-text-tertiary)] hover:bg-white/10 hover:text-[var(--color-text-primary)] lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {nav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]'
                    : 'text-[var(--color-text-tertiary)] hover:bg-white/5 hover:text-[var(--color-text-primary)]',
                )}
              >
                <Icon className={cn('h-4 w-4', isActive && 'text-[var(--color-brand-primary)]')} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src="" alt={user?.fullName} />
              <AvatarFallback>{user ? getInitials(user.fullName) : '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">{user?.fullName}</p>
              <p className="truncate text-[11px] text-[var(--color-text-tertiary)]">{role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--color-text-tertiary)] transition-colors hover:bg-red-500/10 hover:text-[#FF2D55]"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]/80 px-4 backdrop-blur-xl sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <Separator orientation="vertical" className="h-6" />
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src="" alt={user?.fullName} />
              <AvatarFallback className="text-xs">{user ? getInitials(user.fullName) : '?'}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
