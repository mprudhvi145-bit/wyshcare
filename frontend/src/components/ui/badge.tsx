/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/ui/badge.tsx
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
 * React component: badge
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

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = {
  default: 'border-[var(--color-brand-primary)]/20 bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]',
  secondary: 'border-[var(--color-border-subtle)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
  success: 'border-[var(--color-brand-success)]/20 bg-[var(--color-brand-success)]/10 text-[var(--color-brand-success)]',
  warning: 'border-[var(--color-brand-warning)]/20 bg-[var(--color-brand-warning)]/10 text-[var(--color-brand-warning)]',
  danger: 'border-[var(--color-brand-danger)]/20 bg-[var(--color-brand-danger)]/10 text-[var(--color-brand-danger)]',
  outline: 'border-[var(--color-border-default)] bg-transparent text-[var(--color-text-secondary)]',
} as const;

const badgeSizes = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-xs',
} as const;

export type BadgeVariant = keyof typeof badgeVariants;
export type BadgeSize = keyof typeof badgeSizes;

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  children?: ReactNode;
}

export function Badge({
  variant = 'default',
  size = 'md',
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-semibold uppercase tracking-[0.18em]',
        badgeVariants[variant],
        badgeSizes[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
