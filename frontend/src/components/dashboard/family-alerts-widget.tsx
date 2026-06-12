/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/dashboard/family-alerts-widget.tsx
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
 * React component: family-alerts-widget
 *
 * Responsibilities:
 * - Render UI components for Frontend
 * - Handle user interactions and state management
 *
 * Used By:
 - frontend/src/app/doctor/emr/dermatology/page.tsx
 - frontend/src/components/ui/glass-card.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 - frontend/src/components/ui/progress.tsx
 - frontend/src/components/marketing/health-twin-demo.tsx
 *
 * Calls:
 - utils
 - lucide-react
 - dashboard-widget
 *
 * Dependencies:
 - utils
 - lucide-react
 - dashboard-widget
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

import { AlertTriangle, User, HeartPulse, Calendar } from 'lucide-react';

import { cn } from '@/lib/utils';
import { DashboardWidget } from '@/components/dashboard/dashboard-widget';

interface FamilyAlert {
  id: string;
  memberName: string;
  alertType: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  date: string;
}

interface FamilyAlertsWidgetProps {
  alerts: FamilyAlert[];
  loading?: boolean;
  onViewAll?: () => void;
}

const severityStyles: Record<string, string> = {
  HIGH: 'border-l-red-400 bg-red-50/50',
  MEDIUM: 'border-l-amber-400 bg-amber-50/50',
  LOW: 'border-l-blue-400 bg-blue-50/50',
};

const alertIcons: Record<string, typeof AlertTriangle> = {
  APPOINTMENT: Calendar,
  HEALTH: HeartPulse,
  MEDICATION: AlertTriangle,
};

function FamilyAlertsWidget({
  alerts,
  loading,
  onViewAll,
}: FamilyAlertsWidgetProps) {
  return (
    <DashboardWidget
      title="Family Alerts"
      action={onViewAll ? { label: 'View All', onClick: onViewAll } : undefined}
      loading={loading}
    >
      <div className="space-y-2.5">
        {alerts.length === 0 && !loading && (
          <p className="py-4 text-center text-sm text-slate-400">
            No alerts for family members
          </p>
        )}
        {alerts.map((alert) => {
          const Icon = alertIcons[alert.alertType] ?? AlertTriangle;
          return (
            <div
              key={alert.id}
              className={cn(
                'flex items-start gap-3 rounded-xl border border-slate-100 border-l-4 p-3',
                severityStyles[alert.severity],
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                <Icon className="h-4 w-4 text-slate-600" />
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <p className="text-sm font-medium text-slate-900">
                    {alert.memberName}
                  </p>
                </div>
                <p className="text-xs text-slate-500">{alert.description}</p>
                <p className="text-[10px] text-slate-400">
                  {new Date(alert.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardWidget>
  );
}

export { FamilyAlertsWidget, type FamilyAlert };
