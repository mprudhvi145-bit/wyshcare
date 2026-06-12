/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/card.tsx
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
 - frontend/src/app/insurance/claims/page.tsx
 - frontend/src/app/doctor/emr/dermatology/page.tsx
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 - frontend/src/components/ui/progress.tsx
 *
 * Calls:
 - react
 *
 * Dependencies:
 - react
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

import { PropsWithChildren } from 'react';

type CardProps = PropsWithChildren<{
  className?: string;
  glass?: boolean;
  hoverable?: boolean;
}>;

export const Card = ({
  children,
  className = '',
  glass = false,
  hoverable = false,
}: CardProps) => {
  const baseClasses = `
    bg-surface-card
    border-border-card
    rounded-card
    p-6
    transition-all
    duration-200
  `;
  
  const glassClasses = glass ? 'glass' : '';
  
  const hoverClasses = hoverable 
    ? 'hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200'
    : '';
  
  return (
    <div
      className={`${baseClasses} ${glassClasses} ${hoverClasses} ${className}`}
    >
      {children}
    </div>
  );
};

Card.displayName = 'Card';