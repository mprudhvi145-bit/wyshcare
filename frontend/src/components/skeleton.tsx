/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/skeleton.tsx
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
 * React component: skeleton
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

type SkeletonProps = PropsWithChildren<{
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}>;

export const Skeleton = ({
  children,
  className = '',
  width = '100%',
  height = '1rem',
  rounded = false,
}: SkeletonProps) => {
  const baseClasses = `
    animate-shimmer
    bg-gray-200 dark:bg-gray-600
    rounded-${rounded ? 'lg' : 'none'}
    overflow-hidden
  `;
  
  return (
    <div
      className={`${baseClasses} ${className}`}
      style={{ width: typeof width === 'number' ? `${width}px` : width, height: typeof height === 'number' ? `${height}px` : height }}
    >
      {children}
    </div>
  );
};

Skeleton.displayName = 'Skeleton';