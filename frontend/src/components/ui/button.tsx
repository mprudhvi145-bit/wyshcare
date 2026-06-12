/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/ui/button.tsx
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
 * React component: button
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

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  className, variant = 'primary', size = 'md', loading, disabled, icon, fullWidth, children, ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const base = 'inline-flex items-center justify-center font-semibold transition-all outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)] disabled:pointer-events-none select-none';

  const variants: Record<string, string> = {
    default: 'bg-[var(--color-brand-primary)] text-white hover:opacity-90 active:scale-[0.98] disabled:opacity-40',
    primary: 'bg-[var(--color-brand-primary)] text-white hover:opacity-90 active:scale-[0.98] disabled:opacity-40',
    secondary: 'bg-[var(--color-bg-glass)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] hover:bg-white/10 active:scale-[0.98] disabled:opacity-40',
    ghost: 'bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5 disabled:opacity-40',
    danger: 'bg-[var(--color-brand-danger)] text-white hover:opacity-90 active:scale-[0.98] disabled:opacity-40',
    outline: 'border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5 disabled:opacity-40',
  };

  const sizes = {
    sm: 'h-9 px-4 text-[var(--font-size-caption)] gap-1.5 rounded-[var(--radius-md)]',
    md: 'h-12 px-6 text-[var(--font-size-body)] gap-2 rounded-[var(--radius-md)]',
    lg: 'h-14 px-8 text-[var(--font-size-body)] gap-2 rounded-[var(--radius-md)]',
    icon: 'h-10 w-10 p-0 rounded-[var(--radius-md)]',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
        </svg>
      ) : icon ? (
        <span className="h-5 w-5">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
