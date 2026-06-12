/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/dashboard/prescriptions-widget.tsx
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
 * React component: prescriptions-widget
 *
 * Responsibilities:
 * - Render UI components for Frontend
 * - Handle user interactions and state management
 *
 * Used By:
 - frontend/src/app/insurance/claims/page.tsx
 - frontend/src/app/doctor/emr/dermatology/page.tsx
 - frontend/src/app/(platform)/health-twin/risk-predictions/page.tsx
 - frontend/src/components/dashboard/family-alerts-widget.tsx
 - frontend/src/features/general-medicine/components/clinical-snapshot.tsx
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 *
 * Calls:
 - dashboard-widget
 - lucide-react
 - status-badge
 *
 * Dependencies:
 - dashboard-widget
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

import { Pill, RefreshCw } from 'lucide-react';

import { StatusBadge } from '@/components/ui/status-badge';
import { DashboardWidget } from '@/components/dashboard/dashboard-widget';

interface PrescriptionItem {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  refillStatus: 'ACTIVE' | 'REFILL_REQUIRED' | 'EXPIRED';
}

interface PrescriptionsWidgetProps {
  prescriptions: PrescriptionItem[];
  loading?: boolean;
  onViewAll?: () => void;
}

function PrescriptionsWidget({
  prescriptions,
  loading,
  onViewAll,
}: PrescriptionsWidgetProps) {
  const active = prescriptions.slice(0, 4);

  return (
    <DashboardWidget
      title="Active Prescriptions"
      action={onViewAll ? { label: 'View All', onClick: onViewAll } : undefined}
      loading={loading}
    >
      <div className="space-y-2.5">
        {active.length === 0 && !loading && (
          <p className="py-4 text-center text-sm text-slate-400">
            No active prescriptions
          </p>
        )}
        {active.map((rx) => (
          <div
            key={rx.id}
            className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <Pill className="h-4 w-4" />
            </div>
            <div className="flex flex-1 flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-900">
                  {rx.medicationName}
                </p>
                <StatusBadge
                  status={rx.refillStatus === 'REFILL_REQUIRED' ? 'PENDING' : rx.refillStatus}
                  size="sm"
                />
              </div>
              <p className="text-xs text-slate-500">
                {rx.dosage} &middot; {rx.frequency}
              </p>
            </div>
            {rx.refillStatus === 'REFILL_REQUIRED' && (
              <RefreshCw className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            )}
          </div>
        ))}
      </div>
    </DashboardWidget>
  );
}

export { PrescriptionsWidget, type PrescriptionItem };
