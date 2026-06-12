/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/insurance/claim-timeline.tsx
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
 * React component: claim-timeline
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
 *
 * Dependencies:
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

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ClaimStage {
  label: string;
  date?: string;
  status: 'completed' | 'current' | 'pending';
}

interface ClaimTimelineProps {
  stages: ClaimStage[];
  className?: string;
}

function ClaimTimeline({ stages, className }: ClaimTimelineProps) {
  return (
    <div className={cn('space-y-0', className)}>
      {stages.map((stage, i) => {
        const isCompleted = stage.status === 'completed';
        const isCurrent = stage.status === 'current';
        const isLast = i === stages.length - 1;

        return (
          <div key={stage.label} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <div
                className={cn(
                  'absolute left-[15px] top-8 w-px',
                  isCompleted ? 'bg-cyan-500' : 'bg-slate-200',
                )}
                style={{ height: 'calc(100% - 16px)' }}
              />
            )}
            <div className="flex shrink-0 flex-col items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors',
                  isCompleted &&
                    'border-cyan-500 bg-cyan-500 text-white',
                  isCurrent &&
                    'border-cyan-500 bg-white text-cyan-600',
                  !isCompleted &&
                    !isCurrent &&
                    'border-slate-200 bg-white text-slate-400',
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
            </div>
            <div className="flex flex-col gap-0.5 pt-1.5">
              <p
                className={cn(
                  'text-sm font-medium',
                  isCompleted && 'text-slate-900',
                  isCurrent && 'text-cyan-600',
                  !isCompleted && !isCurrent && 'text-slate-400',
                )}
              >
                {stage.label}
              </p>
              {stage.date && (
                <p className="text-xs text-slate-400">
                  {new Date(stage.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { ClaimTimeline, type ClaimStage };
