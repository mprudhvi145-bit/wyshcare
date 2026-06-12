/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/app/platform-shell.tsx
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
 * React component: platform-shell
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
 - react
 - api
 - utils
 - navigation
 - session-store
 - link
 - framer-motion
 *
 * Dependencies:
 - react
 - api
 - utils
 - navigation
 - session-store
 - link
 - framer-motion
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
import {
  Activity, Brain, FlaskConical, Heart, HeartPulse, Menu, Pill, Shield,
  Stethoscope, User, Video, X,
} from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useSessionStore } from '@/stores/session-store';

const nav = [
  { href: '/app', label: 'WyshID', icon: HeartPulse },
  { href: '/app/timeline', label: 'Timeline', icon: Activity },
  { href: '/app/ai-insights', label: 'AI Insights', icon: Brain },
  { href: '/app/telemedicine', label: 'Telemedicine', icon: Video },
  { href: '/app/emergency', label: 'Emergency', icon: Shield },
  { href: '/app/records', label: 'Records', icon: FlaskConical },
  { href: '/app/pharmacy', label: 'Pharmacy', icon: Pill },
  { href: '/app/family', label: 'Family', icon: Heart },
  { href: '/app/wallet', label: 'Wallet', icon: Stethoscope },
];

const accentMap: Record<string, string> = {
  '/app': 'bg-[#FF2D55]',
  '/app/timeline': 'bg-[#34C759]',
  '/app/ai-insights': 'bg-[#5856D6]',
  '/app/telemedicine': 'bg-[#007AFF]',
  '/app/emergency': 'bg-[#FF9500]',
  '/app/records': 'bg-[#AF52DE]',
  '/app/pharmacy': 'bg-[#34C759]',
  '/app/family': 'bg-[#FF2D55]',
  '/app/wallet': 'bg-[#007AFF]',
};

const glowMap: Record<string, string> = {
  '/app': 'shadow-[#FF2D55]/20',
  '/app/timeline': 'shadow-[#34C759]/20',
  '/app/ai-insights': 'shadow-[#5856D6]/20',
  '/app/telemedicine': 'shadow-[#007AFF]/20',
  '/app/emergency': 'shadow-[#FF9500]/20',
  '/app/records': 'shadow-[#AF52DE]/20',
  '/app/pharmacy': 'shadow-[#34C759]/20',
  '/app/family': 'shadow-[#FF2D55]/20',
  '/app/wallet': 'shadow-[#007AFF]/20',
};

const labelMap: Record<string, string> = {
  '/app': 'WyshID',
  '/app/timeline': 'Health Timeline',
  '/app/ai-insights': 'AI Insights',
  '/app/telemedicine': 'Telemedicine',
  '/app/emergency': 'Emergency Profile',
  '/app/records': 'Health Records',
  '/app/pharmacy': 'Pharmacy',
  '/app/family': 'Family',
  '/app/wallet': 'Health Wallet',
};

export function PlatformShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hydrated = useSessionStore((state) => state.hydrated);
  const user = useSessionStore((state) => state.user);
  const clearSession = useSessionStore((state) => state.clearSession);

  useEffect(() => {
    if (hydrated && !user) {
      router.replace('/login');
    }
  }, [hydrated, router, user]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  async function handleLogout() {
    try {
      await api.logout();
    } finally {
      clearSession();
      router.replace('/login');
    }
  }

  const currentNav = nav.find((n) => pathname.startsWith(n.href));
  const activeAccent = currentNav ? accentMap[currentNav.href] : 'bg-[#007AFF]';
  const activeGlow = currentNav ? glowMap[currentNav.href] : 'shadow-[#007AFF]/20';
  const activeLabel = currentNav ? labelMap[currentNav.href] : '';

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
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-[var(--color-bg-card)] transition-transform duration-300 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-[var(--color-border-subtle)] px-6">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg', activeAccent, activeGlow)}>
            <HeartPulse className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--color-text-primary)] tracking-tight">WyshCare</p>
            <p className="text-[10px] text-[var(--color-text-tertiary)] tracking-wide">Intelligence That Saves Lives</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-lg p-1.5 text-[var(--color-text-tertiary)] hover:bg-white/10 hover:text-[var(--color-text-primary)] lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">Navigation</p>
          <div className="space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href));
              const itemAccent = accentMap[item.href] || 'bg-[#007AFF]';

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)]',
                  )}
                  style={isActive ? { backgroundColor: `${itemAccent.replace('bg-', '')}15` } : undefined}
                >
                  <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', isActive ? itemAccent : 'bg-white/5')}>
                    <Icon className={cn('h-3.5 w-3.5', isActive ? 'text-white' : 'text-[var(--color-text-secondary)]')} />
                  </div>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-[var(--color-border-subtle)] p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6]">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">{user?.fullName || 'User'}</p>
              <p className="truncate text-[11px] text-[var(--color-text-tertiary)]">{user?.wyshId || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-[var(--color-text-tertiary)] transition-colors hover:bg-red-500/10 hover:text-[#FF2D55]"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center gap-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]/80 px-6 backdrop-blur-2xl">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl shadow-sm', activeAccent, activeGlow)}>
              <HeartPulse className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-[var(--color-text-primary)] tracking-tight">
                {activeLabel || 'WyshCare'}
              </h1>
              <p className="text-[11px] text-[var(--color-text-secondary)]">Healthcare OS</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-[var(--color-brand-primary)]/10 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--color-brand-primary)]" />
              <span className="text-[11px] font-medium text-[var(--color-brand-primary)]">AI Active</span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6]">
              <User className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 xl:p-10">
          <LayoutGroup>
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </LayoutGroup>
        </main>
      </div>
    </div>
  );
}
