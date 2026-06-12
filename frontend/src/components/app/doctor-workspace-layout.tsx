/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/app/doctor-workspace-layout.tsx
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
 * React component: doctor-workspace-layout
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
 - patient-queue
 - react
 - api
 - utils
 - navigation
 - session-store
 *
 * Dependencies:
 - notification-bell
 - avatar
 - patient-queue
 - react
 - api
 - utils
 - navigation
 - session-store
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

import { type ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Calendar, Users, MessageSquare, Video, Receipt,
  LogOut, HeartPulse, Search, Menu, X, Bot,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage, getInitials } from '@/components/ui/avatar';
import { NotificationBell } from '@/components/app/notification-bell';
import { PatientQueue } from '@/components/app/patient-queue';
import { PatientHeader } from '@/components/app/patient-header';
import { AICopilotSidebar } from '@/components/app/ai-copilot-sidebar';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useSessionStore } from '@/stores/session-store';
import { usePatientStore } from '@/stores/patient-store';
import { MOCK_PATIENTS } from '@/data/mock-patients';

const nav = [
  { href: '/doctor', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/doctor/schedule', label: 'Schedule', icon: Calendar },
  { href: '/doctor/patients', label: 'Patients', icon: Users },
  { href: '/doctor/messages', label: 'Messages', icon: MessageSquare },
  { href: '/doctor/telemedicine', label: 'Telemedicine', icon: Video },
  { href: '/doctor/billing', label: 'Billing', icon: Receipt },
];

export function DoctorWorkspaceLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);
  const clearSession = useSessionStore((s) => s.clearSession);
  const { activePatient, queueFilter, setQueue } = usePatientStore();

  useEffect(() => {
    if (hydrated && !user) router.replace('/login');
  }, [hydrated, router, user]);

  useEffect(() => {
    setQueue(MOCK_PATIENTS);
  }, [setQueue]);

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>('input[placeholder="Search patients..."]');
        input?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setCopilotOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
    }
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#0B0D10]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#007AFF] to-[#5856D6]">
            <HeartPulse className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm text-white/50 font-ui">Restoring secure session...</p>
        </div>
      </div>
    );
  }

  async function handleLogout() {
    try { await api.logout(); } finally { clearSession(); router.replace('/login'); }
  }

  return (
    <div className="flex min-h-screen bg-[#0B0D10]">
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col bg-[#15181D] border-r border-[rgba(255,255,255,0.06)] transition-transform duration-200 lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        <div className="flex h-14 items-center gap-3 border-b border-[rgba(255,255,255,0.06)] px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#8FD3D1] to-[#5856D6]">
            <HeartPulse className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-white font-display tracking-tight">WyshCare</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto rounded-lg p-1.5 text-white/30 hover:bg-white/10 lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <PatientQueue />
        </div>

        <nav className="border-t border-[rgba(255,255,255,0.06)] px-2 py-3">
          {nav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium font-ui transition-all',
                  isActive
                    ? 'bg-[#8FD3D1]/10 text-[#8FD3D1]'
                    : 'text-white/50 hover:bg-white/5 hover:text-white/80',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[rgba(255,255,255,0.06)] p-3">
          <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] p-2.5">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src="" alt={user?.fullName} />
              <AvatarFallback className="text-[10px]">{user ? getInitials(user.fullName) : '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-medium text-white">{user?.fullName}</p>
              <p className="truncate text-[10px] text-white/40 font-ui">Doctor</p>
            </div>
            <button onClick={handleLogout} className="shrink-0 rounded-lg p-1.5 text-white/30 hover:text-[#FF5A5A] hover:bg-[#FF5A5A]/10 transition-all">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[rgba(255,255,255,0.06)] bg-[#15181D]/80 backdrop-blur-xl px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-white/50 hover:bg-white/5 lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
            <input
              placeholder="Search patients..."
              className="w-full rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/30 font-ui focus:outline-none focus:border-[#8FD3D1]/30 transition-all"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setCopilotOpen(!copilotOpen)}
              className="xl:hidden rounded-lg p-2 text-white/50 hover:bg-white/5 transition-all"
              title="Toggle AI Copilot"
            >
              <Bot className="h-4 w-4" />
            </button>
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 flex flex-col overflow-auto">
          {activePatient && <PatientHeader />}
          <div className={cn('flex-1', activePatient ? 'p-4' : 'p-0')}>
            {children}
          </div>
        </main>
      </div>

      <aside className={cn(
        'hidden xl:flex w-[340px] flex-col border-l border-[rgba(255,255,255,0.06)] bg-[#15181D] shrink-0',
      )}>
        <AICopilotSidebar />
      </aside>

      {/* Mobile Copilot overlay */}
      <aside className={cn(
        'fixed inset-y-0 right-0 z-40 flex w-[340px] flex-col bg-[#15181D] border-l border-[rgba(255,255,255,0.06)] transition-transform duration-200 xl:hidden',
        copilotOpen ? 'translate-x-0' : 'translate-x-full',
      )}>
        <div className="flex items-center justify-end p-2">
          <button onClick={() => setCopilotOpen(false)} className="rounded-lg p-1.5 text-white/30 hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        <AICopilotSidebar />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {copilotOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 xl:hidden" onClick={() => setCopilotOpen(false)} />
      )}
    </div>
  );
}

