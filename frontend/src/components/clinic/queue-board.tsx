/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/clinic/queue-board.tsx
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
 * React component: queue-board
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
 - avatar
 - card
 - badge
 - utils
 - lucide-react
 *
 * Dependencies:
 - status-badge
 - avatar
 - card
 - badge
 - utils
 - lucide-react
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

import { Clock, User, ArrowUpRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback, getInitials } from '@/components/ui/avatar';

interface QueuePatient {
  id: string;
  patientName: string;
  status: string;
  priority: number;
  waitTime: number;
  severity?: string;
  checkedInAt: string;
}

interface QueueBoardProps {
  patients: QueuePatient[];
  className?: string;
}

function severityColor(severity?: string): string {
  switch (severity) {
    case 'CRITICAL': return 'border-l-red-500';
    case 'HIGH': return 'border-l-orange-400';
    case 'MEDIUM': return 'border-l-amber-400';
    case 'LOW': return 'border-l-blue-400';
    default: return 'border-l-slate-200';
  }
}

function QueueBoard({ patients, className }: QueueBoardProps) {
  const sorted = [...patients].sort((a, b) => a.priority - b.priority);

  return (
    <Card className={cn('p-0', className)}>
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h4 className="text-sm font-semibold text-slate-900">
          Queue Board
          <span className="ml-2 text-xs font-normal text-slate-400">
            {patients.length} patient{patients.length !== 1 ? 's' : ''}
          </span>
        </h4>
      </div>
      <div className="divide-y divide-slate-100">
        {sorted.map((patient) => (
          <div
            key={patient.id}
            className={cn(
              'flex items-center gap-4 border-l-4 px-5 py-3.5 transition-colors hover:bg-slate-50',
              severityColor(patient.severity),
            )}
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback>{getInitials(patient.patientName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-900">
                  {patient.patientName}
                </p>
                <StatusBadge status={patient.status} size="sm" />
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {patient.waitTime} min wait
                </span>
                {patient.severity && (
                  <Badge variant="outline" size="sm">
                    {patient.severity}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              #{patient.priority}
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </div>
        ))}
        {patients.length === 0 && (
          <div className="flex flex-col items-center py-10 text-center">
            <User className="mb-2 h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-400">Queue is empty</p>
          </div>
        )}
      </div>
    </Card>
  );
}

export { QueueBoard, type QueuePatient };
