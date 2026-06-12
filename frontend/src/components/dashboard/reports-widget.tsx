/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/dashboard/reports-widget.tsx
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
 * React component: reports-widget
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

import { FileText, Download, Eye } from 'lucide-react';

import { StatusBadge } from '@/components/ui/status-badge';
import { DashboardWidget } from '@/components/dashboard/dashboard-widget';

interface ReportItem {
  id: string;
  type: string;
  date: string;
  status: 'COMPLETED' | 'PENDING' | 'DRAFT';
}

interface ReportsWidgetProps {
  reports: ReportItem[];
  loading?: boolean;
  onViewAll?: () => void;
  onViewReport?: (report: ReportItem) => void;
  onDownloadReport?: (report: ReportItem) => void;
}

function ReportsWidget({
  reports,
  loading,
  onViewAll,
  onViewReport,
  onDownloadReport,
}: ReportsWidgetProps) {
  const recent = reports.slice(0, 4);

  return (
    <DashboardWidget
      title="Recent Reports"
      action={onViewAll ? { label: 'View All', onClick: onViewAll } : undefined}
      loading={loading}
    >
      <div className="space-y-2.5">
        {recent.length === 0 && !loading && (
          <p className="py-4 text-center text-sm text-slate-400">
            No reports available
          </p>
        )}
        {recent.map((report) => (
          <div
            key={report.id}
            className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-600">
              <FileText className="h-4 w-4" />
            </div>
            <div className="flex flex-1 flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-900">{report.type}</p>
                <StatusBadge status={report.status} size="sm" />
              </div>
              <p className="text-xs text-slate-400">
                {new Date(report.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="flex gap-1">
              {onViewReport && (
                <button
                  type="button"
                  onClick={() => onViewReport(report)}
                  className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
              )}
              {onDownloadReport && (
                <button
                  type="button"
                  onClick={() => onDownloadReport(report)}
                  className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </DashboardWidget>
  );
}

export { ReportsWidget, type ReportItem };
