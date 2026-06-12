/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/insurance/pre-auth-card.tsx
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
 * React component: pre-auth-card
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
 - status-badge
 - card
 - utils
 - lucide-react
 - separator
 *
 * Dependencies:
 - status-badge
 - card
 - utils
 - lucide-react
 - separator
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

import { ClipboardCheck, CalendarDays } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Separator } from '@/components/ui/separator';
import type { PreAuthorization } from '@/types';

interface PreAuthCardProps {
  preAuth: PreAuthorization;
  onClick?: () => void;
  className?: string;
}

function PreAuthCard({ preAuth, onClick, className }: PreAuthCardProps) {
  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Pre-Authorization</p>
            <p className="text-xs text-slate-500">
              {preAuth.procedureCode ?? 'Procedure'} &middot; {preAuth.diagnosisCode ?? 'Diagnosis'}
            </p>
          </div>
        </div>
        <StatusBadge status={preAuth.status} />
      </div>

      <Separator className="my-4" />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Requested</p>
          <p className="text-sm font-semibold text-slate-900">
            ₹{preAuth.requestedAmount.toLocaleString('en-IN')}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Approved</p>
          <p className="text-sm font-semibold text-slate-900">
            {preAuth.approvedAmount != null
              ? `₹${preAuth.approvedAmount.toLocaleString('en-IN')}`
              : '—'}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3 w-3" />
          Expires {new Date(preAuth.expiresAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </div>
    </Card>
  );
}

export { PreAuthCard };
