/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/insurance/policy-card.tsx
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
 * React component: policy-card
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

import { ShieldCheck, CalendarDays, IndianRupee } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Separator } from '@/components/ui/separator';
import type { InsurancePolicy } from '@/types';

interface PolicyCardProps {
  policy: InsurancePolicy;
  onClick?: () => void;
  className?: string;
}

function PolicyCard({ policy, onClick, className }: PolicyCardProps) {
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
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {policy.provider?.name ?? 'Insurance Provider'}
            </p>
            <p className="text-xs text-slate-500">
              {policy.plan?.name ?? 'Plan'} &middot; {policy.policyNumber}
            </p>
          </div>
        </div>
        <StatusBadge status={policy.status} />
      </div>

      <Separator className="my-4" />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <IndianRupee className="h-4 w-4 text-slate-400" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Sum Insured</p>
            <p className="text-sm font-medium text-slate-900">
              ₹{policy.sumInsured.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-slate-400" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Valid Till</p>
            <p className="text-sm font-medium text-slate-900">
              {new Date(policy.endDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
        <span>Copay: {policy.copayPercent}%</span>
        <span>Deductible: ₹{policy.deductible.toLocaleString('en-IN')}</span>
        <span>Coverage: {policy.coveragePercent}%</span>
      </div>
    </Card>
  );
}

export { PolicyCard };
