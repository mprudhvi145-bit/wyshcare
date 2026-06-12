/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/insurance/claim-card.tsx
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
 * React component: claim-card
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
 - card
 - lucide-react
 - status-badge
 *
 * Dependencies:
 - utils
 - card
 - lucide-react
 - status-badge
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

import { FileText, CalendarDays, Building2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import type { Claim } from '@/types';

interface ClaimCardProps {
  claim: Claim;
  onClick?: () => void;
  className?: string;
}

function formatCurrency(amount?: number): string {
  if (amount == null) return '—';
  return `₹${amount.toLocaleString('en-IN')}`;
}

function ClaimCard({ claim, onClick, className }: ClaimCardProps) {
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
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {claim.claimNumber}
            </p>
            <p className="text-xs text-slate-500">
              {claim.policy?.provider?.name ?? 'Insurance'}
            </p>
          </div>
        </div>
        <StatusBadge status={claim.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Claimed</p>
          <p className="text-sm font-semibold text-slate-900">
            {formatCurrency(claim.claimedAmount)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            {claim.status === 'APPROVED' || claim.status === 'PARTIALLY_APPROVED' ? 'Approved' : 'Total'}
          </p>
          <p className="text-sm font-semibold text-slate-900">
            {formatCurrency(claim.approvedAmount ?? claim.totalAmount)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
        {claim.submissionDate && (
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {new Date(claim.submissionDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        )}
        {claim.items && (
          <span className="inline-flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {claim.items.length} item{claim.items.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </Card>
  );
}

export { ClaimCard };
