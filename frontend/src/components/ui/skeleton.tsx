/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/ui/skeleton.tsx
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
 * React component: skeleton
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
 - utils
 - lucide-react
 - react
 *
 * Dependencies:
 - utils
 - lucide-react
 - react
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

import { HeartPulse } from 'lucide-react';
import { cn } from '@/lib/utils';

import { type HTMLAttributes } from 'react';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('animate-pulse rounded-[12px] bg-white/5', className)} {...props} />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-[24px] border border-[rgba(255,255,255,0.06)] bg-[#15181D] p-4 space-y-3 animate-pulse', className)}>
      <div className="h-3 w-1/3 rounded bg-white/5" />
      <div className="h-4 w-2/3 rounded bg-white/5" />
      <div className="h-3 w-1/2 rounded bg-white/5" />
    </div>
  );
}

export function SpecialtySkeleton() {
  return (
    <div className="min-h-full space-y-4 p-4" style={{ backgroundColor: '#0B0D10' }}>
      <div className="flex items-center justify-between animate-pulse">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-[12px] bg-white/5" />
          <div className="space-y-2">
            <div className="h-4 w-40 rounded bg-white/5" />
            <div className="h-3 w-24 rounded bg-white/5" />
          </div>
        </div>
        <div className="h-8 w-28 rounded-[12px] bg-white/5" />
      </div>
      <div className="grid grid-cols-[1fr_1fr] gap-4">
        <SkeletonCard className="h-64" />
        <SkeletonCard className="h-64" />
      </div>
      <SkeletonCard className="h-48" />
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#0B0D10]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#007AFF] to-[#5856D6]">
          <HeartPulse className="h-6 w-6 text-white" />
        </div>
        <div className="h-3 w-32 rounded bg-white/5 animate-pulse" />
      </div>
    </div>
  );
}
