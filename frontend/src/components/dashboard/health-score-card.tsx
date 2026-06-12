/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/dashboard/health-score-card.tsx
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
 * React component: health-score-card
 *
 * Responsibilities:
 * - Render UI components for Frontend
 * - Handle user interactions and state management
 *
 * Used By:
 - frontend/src/app/doctor/emr/dermatology/page.tsx
 - frontend/src/components/dashboard/family-alerts-widget.tsx
 - frontend/src/features/general-medicine/components/clinical-snapshot.tsx
 - frontend/src/components/ui/glass-card.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 - frontend/src/components/ui/progress.tsx
 *
 * Calls:
 - utils
 *
 * Dependencies:
 - utils
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

interface HealthScoreCardProps {
  score: number;
  className?: string;
}

function getScoreColor(score: number): string {
  if (score < 40) return '#ef4444';
  if (score < 70) return '#f59e0b';
  return '#10b981';
}

function getScoreLabel(score: number): string {
  if (score < 40) return 'Needs Attention';
  if (score < 70) return 'Fair';
  return 'Good';
}

const CIRCUMFERENCE = 2 * Math.PI * 54;

function HealthScoreCard({ score, className }: HealthScoreCardProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const color = getScoreColor(clampedScore);
  const offset = CIRCUMFERENCE - (clampedScore / 100) * CIRCUMFERENCE;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm',
        className,
      )}
    >
      <div className="relative flex items-center justify-center">
        <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
          <circle
            cx="64"
            cy="64"
            r="54"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="10"
          />
          <circle
            cx="64"
            cy="64"
            r="54"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute text-3xl font-bold text-slate-900">
          {clampedScore}
        </span>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-900">Health Score</p>
        <p className="text-xs text-slate-500" style={{ color }}>{getScoreLabel(clampedScore)}</p>
      </div>
    </div>
  );
}

export { HealthScoreCard };
