/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/os/page.tsx
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
 * React component: page
 *
 * Responsibilities:
 * - Render UI components for Frontend
 * - Handle user interactions and state management
 *
 * Used By:
 - frontend/src/app/insurance/claims/page.tsx
 - frontend/src/app/doctor/emr/dermatology/page.tsx
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 - frontend/src/components/ui/progress.tsx
 *
 * Calls:
 - react
 - api
 - navigation
 - session-store
 - lucide-react
 *
 * Dependencies:
 - react
 - api
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

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartPulse, Loader2 } from 'lucide-react';

import { useSessionStore } from '@/stores/session-store';
import { api } from '@/lib/api';

const roleRoutes: Record<string, string> = {
  DOCTOR: '/os/doctor',
  NURSE: '/os/nurse',
  LAB_PARTNER: '/os/lab',
  PHARMACY_PARTNER: '/os/pharmacy',
  RECEPTION: '/os/reception',
  BILLING: '/os/billing',
  INSURANCE: '/os/insurance',
  ADMIN: '/os/admin',
};

export default function OSPage() {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const [status, setStatus] = useState('detecting');

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    const uid = user.id;
    const userRoles = user.roles;

    async function route() {
      try {
        const { role } = await api.detectRole(uid);
        const target = roleRoutes[role] ?? '/os/dashboard';
        router.replace(target);
      } catch {
        const firstRole = userRoles?.[0];
        const fallback = roleRoutes[firstRole ?? ''] ?? '/os/dashboard';
        router.replace(fallback);
      }
    }
    setStatus('redirecting');
    route();
  }, [user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0D10]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/20">
          <HeartPulse className="h-7 w-7 text-white" />
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
        <p className="text-sm text-white/50">
          {status === 'detecting' ? 'Detecting your workspace...' : 'Taking you to your workspace...'}
        </p>
      </div>
    </div>
  );
}
