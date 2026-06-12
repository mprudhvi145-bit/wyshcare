/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/ui/card.tsx
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
 * React component: card
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

import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass';
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({
  className, variant = 'default', padding = 'md', children, ...props
}: CardProps) {
  const variants = {
    default: 'bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-card)]',
    glass: 'bg-[var(--color-bg-glass)] backdrop-blur-[var(--blur-glass)] border border-[var(--color-border-subtle)]',
  };
  const pads = { sm: 'p-4', md: 'p-6', lg: 'p-8' };

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] transition-all duration-[var(--duration-normal)] ease-[var(--ease-default)]',
        variants[variant], pads[padding], className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return <div className={cn('mb-4', className)} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement> & { children?: ReactNode }) {
  return <h3 className={cn('text-[var(--font-size-h3)] font-semibold text-[var(--color-text-primary)]', className)} {...props}>{children}</h3>;
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return <div className={cn(className)} {...props}>{children}</div>;
}

export function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement> & { children?: ReactNode }) {
  return <p className={cn('text-[var(--font-size-caption)] text-[var(--color-text-secondary)]', className)} {...props}>{children}</p>;
}
