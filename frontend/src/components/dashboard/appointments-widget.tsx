/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/dashboard/appointments-widget.tsx
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
 * React component: appointments-widget
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

import { Calendar, Clock, Video, MapPin } from 'lucide-react';

import { StatusBadge } from '@/components/ui/status-badge';
import { DashboardWidget } from '@/components/dashboard/dashboard-widget';
import type { Appointment } from '@/types';

interface AppointmentsWidgetProps {
  appointments: Appointment[];
  loading?: boolean;
  onViewAll?: () => void;
}

const modeIcons: Record<string, typeof Calendar> = {
  VIDEO: Video,
  IN_PERSON: MapPin,
  PHONE: Clock,
};

function AppointmentsWidget({
  appointments,
  loading,
  onViewAll,
}: AppointmentsWidgetProps) {
  const nextThree = appointments.slice(0, 3);

  return (
    <DashboardWidget
      title="Upcoming Appointments"
      action={onViewAll ? { label: 'View All', onClick: onViewAll } : undefined}
      loading={loading}
    >
      <div className="space-y-3">
        {nextThree.length === 0 && !loading && (
          <p className="py-4 text-center text-sm text-slate-400">
            No upcoming appointments
          </p>
        )}
        {nextThree.map((apt) => {
          const Icon = modeIcons[apt.consultationMode] ?? Calendar;
          return (
            <div
              key={apt.id}
              className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-cyan-600 shadow-sm">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-900">
                    {apt.doctorProfile?.user.fullName ?? 'Doctor'}
                  </p>
                  <StatusBadge status={apt.status} size="sm" />
                </div>
                <p className="text-xs text-slate-500">
                  {apt.doctorProfile?.specialization}
                </p>
                <p className="text-xs text-slate-400">
                  <Calendar className="mr-1 inline h-3 w-3" />
                  {new Date(apt.slotStartAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  <Clock className="ml-2 mr-1 inline h-3 w-3" />
                  {new Date(apt.slotStartAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
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

export { AppointmentsWidget };
