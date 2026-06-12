/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/ui/stat-card.tsx
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
 * React component: stat-card
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

import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

type TrendDirection = 'up' | 'down' | 'neutral';

interface StatCardProps {
  icon?: ReactNode;
  label: string;
  value: string | number;
  trend?: { direction: TrendDirection; value: string };
  onClick?: () => void;
  className?: string;
}

const trendIcons: Record<TrendDirection, ReactNode> = {
  up: <TrendingUp className="h-3.5 w-3.5" />,
  down: <TrendingDown className="h-3.5 w-3.5" />,
  neutral: <Minus className="h-3.5 w-3.5" />,
};

const trendColors: Record<TrendDirection, string> = {
  up: 'text-[var(--color-brand-success)]',
  down: 'text-[var(--color-brand-danger)]',
  neutral: 'text-[var(--color-text-tertiary)]',
};

function StatCard({ icon, label, value, trend, onClick, className }: StatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-5 text-left shadow-[var(--shadow-card)] transition-all hover:bg-white/5',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {icon && (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
          {icon}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">{label}</span>
        <span className="text-2xl font-bold text-[var(--color-text-primary)]">{value}</span>
        {trend && (
          <span className={cn('mt-1 inline-flex items-center gap-1 text-xs font-medium', trendColors[trend.direction])}>
            {trendIcons[trend.direction]}
            {trend.value}
          </span>
        )}
      </div>
    </button>
  );
}

export { StatCard, type TrendDirection, type StatCardProps };
