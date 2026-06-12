/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/dashboard/insurance-status-widget.tsx
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
 * React component: insurance-status-widget
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
 - frontend/src/components/marketing/health-twin-demo.tsx
 *
 * Calls:
 - status-badge
 - dashboard-widget
 - button
 - lucide-react
 - progress
 *
 * Dependencies:
 - status-badge
 - dashboard-widget
 - button
 - lucide-react
 - progress
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

import { ShieldCheck, FileText, HelpCircle } from 'lucide-react';

import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { DashboardWidget } from '@/components/dashboard/dashboard-widget';
import { Progress } from '@/components/ui/progress';
import type { InsurancePolicy } from '@/types';

interface InsuranceStatusWidgetProps {
  policy?: InsurancePolicy;
  loading?: boolean;
  onFileClaim?: () => void;
  onCheckEligibility?: () => void;
}

function InsuranceStatusWidget({
  policy,
  loading,
  onFileClaim,
  onCheckEligibility,
}: InsuranceStatusWidgetProps) {
  return (
    <DashboardWidget title="Insurance Status" loading={loading}>
      {!policy ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <ShieldCheck className="h-10 w-10 text-slate-300" />
          <p className="text-sm text-slate-400">No active policy</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">
                {policy.provider?.name ?? 'Insurance Provider'}
              </p>
              <p className="text-xs text-slate-500">Policy: {policy.policyNumber}</p>
            </div>
            <StatusBadge status={policy.status} />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Sum Insured</span>
              <span className="font-medium text-slate-900">
                ₹{policy.sumInsured.toLocaleString('en-IN')}
              </span>
            </div>
            <Progress value={85} />
            <p className="text-right text-[10px] text-slate-400">
              ₹{((policy.sumInsured * 85) / 100).toLocaleString('en-IN')} remaining
            </p>
          </div>
          <div className="flex gap-2">
            {onFileClaim && (
              <Button variant="default" size="sm" onClick={onFileClaim}>
                <FileText className="mr-1 h-3.5 w-3.5" />
                File Claim
              </Button>
            )}
            {onCheckEligibility && (
              <Button variant="outline" size="sm" onClick={onCheckEligibility}>
                <HelpCircle className="mr-1 h-3.5 w-3.5" />
                Check Eligibility
              </Button>
            )}
          </div>
        </div>
      )}
    </DashboardWidget>
  );
}

export { InsuranceStatusWidget };
