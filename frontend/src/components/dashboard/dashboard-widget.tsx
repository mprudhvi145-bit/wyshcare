/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/dashboard/dashboard-widget.tsx
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
 * React component: dashboard-widget
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
 - skeleton
 *
 * Dependencies:
 - utils
 - lucide-react
 - skeleton
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

import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardWidgetProps {
  title: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children: ReactNode;
  loading?: boolean;
  className?: string;
}

function DashboardWidget({
  title,
  action,
  children,
  loading,
  className,
}: DashboardWidgetProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm',
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center gap-0.5 text-xs font-medium text-cyan-500 transition-colors hover:text-cyan-600"
          >
            {action.label}
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-3/4" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export { DashboardWidget };
