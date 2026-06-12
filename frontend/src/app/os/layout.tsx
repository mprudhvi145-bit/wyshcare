/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/os/layout.tsx
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
 * React component: layout
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
 - lucide-react
 *
 * Dependencies:
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

import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, HeartPulse, Menu, X, Brain, Stethoscope, User } from 'lucide-react';
import { useState, useEffect } from 'react';

import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useSessionStore } from '@/stores/session-store';

const workspaceNav: Record<string, { label: string; color: string; icon: string }> = {
  nurse: { label: 'Nurse Station', color: '#34C759', icon: 'N' },
  lab: { label: 'Lab Workspace', color: '#007AFF', icon: 'L' },
  pharmacy: { label: 'Pharmacy', color: '#AF52DE', icon: 'P' },
  doctor: { label: 'Doctor Workspace', color: '#5856D6', icon: 'D' },
  reception: { label: 'Reception', color: '#FF9500', icon: 'R' },
  billing: { label: 'Billing', color: '#FF2D55', icon: 'B' },
  insurance: { label: 'Insurance', color: '#007AFF', icon: 'I' },
  admin: { label: 'OS Admin', color: '#FF9500', icon: 'A' },
  dashboard: { label: 'OS Dashboard', color: '#34C759', icon: 'O' },
};

export default function OSLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);
  const clearSession = useSessionStore((s) => s.clearSession);

  const segment = pathname.split('/')[2] ?? '';
  const workspace = workspaceNav[segment] ?? { label: 'Wysh OS', color: '#5856D6', icon: 'W' };

  useEffect(() => {
    if (hydrated && !user) {
      router.replace('/login');
    }
  }, [hydrated, router, user]);

  async function handleLogout() {
    try { await api.logout(); } finally { clearSession(); router.replace('/login'); }
  }

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#080A0D]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5856D6] to-[#007AFF] shadow-lg">
            <HeartPulse className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm text-white/50 font-ui">Restoring secure session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#080A0D]">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Dark Glass Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col glass-shell border-r border-white/[0.06] transition-transform duration-300 lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        {/* Logo */}
        <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-white/[0.06] px-5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl shadow-lg"
            style={{ background: `linear-gradient(135deg, ${workspace.color}, ${workspace.color}88)` }}
          >
            <HeartPulse className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white font-display tracking-tight">{workspace.label}</p>
            <p className="text-[10px] text-white/40 font-ui tracking-wide">WyshCare OS</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto rounded-lg p-1.5 text-white/30 hover:bg-white/10 hover:text-white lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 font-ui">Workspaces</p>
          <div className="space-y-1">
            {Object.entries(workspaceNav).map(([key, w]) => {
              const isActive = pathname.startsWith(`/os/${key}`);
              return (
                <button
                  key={key}
                  onClick={() => router.push(`/os/${key}`)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium font-ui transition-all duration-200',
                    isActive
                      ? 'text-white'
                      : 'text-white/40 hover:bg-white/5 hover:text-white/80',
                  )}
                  style={isActive ? { backgroundColor: `${w.color}15` } : undefined}
                >
                  <div
                    className={cn('flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold', isActive ? 'text-white' : 'text-white/40')}
                    style={isActive ? { background: w.color } : { background: 'rgba(255,255,255,0.05)' }}
                  >
                    {w.icon}
                  </div>
                  {w.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Footer */}
        <div className="border-t border-white/[0.06] p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#5856D6] to-[#007AFF]">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-white font-ui">{user?.fullName || 'User'}</p>
              <p className="truncate text-[11px] text-white/40 font-ui">{workspace.label}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="mt-2 flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-white/40 font-ui transition-colors hover:bg-[#FF2D55]/10 hover:text-[#FF2D55]">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-[64px] shrink-0 items-center gap-4 border-b border-white/[0.06] bg-[#080A0D]/80 px-6 backdrop-blur-2xl">
          <button onClick={() => setSidebarOpen(true)} className="rounded-xl p-2 text-white/40 hover:bg-white/5 hover:text-white lg:hidden">
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl shadow-sm"
              style={{ background: workspace.color }}
            >
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white font-display tracking-tight">{workspace.label}</h1>
              <p className="text-[11px] text-white/40 font-ui">Clinical Command Center</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-[#34C759]/10 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[#34C759] animate-pulse-soft" />
              <span className="text-[11px] font-medium text-[#34C759] font-ui">AI Active</span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#5856D6] to-[#007AFF]">
              <Stethoscope className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
