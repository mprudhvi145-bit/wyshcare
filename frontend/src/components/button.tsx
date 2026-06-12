/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/button.tsx
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

import { forwardRef } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'default' | 'large' | 'small';
  className?: string;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { 
      variant = 'primary', 
      size = 'default', 
      className = '', 
      children,
      ...props
    },
    ref
  ) => {
    // Base classes
    const baseClasses = `
      touch-target-preferred
      flex items-center justify-center
      gap-2
      font-medium
      transition-all
      duration-200
      focus-visible:outline-none
      focus-visible:ring-2
      focus-visible:ring-offset-2
      disabled:opacity-50
      disabled:pointer-events-none
    `;
    
    // Variant classes
    const variantClasses = {
      primary: `
        bg-success
        text-background-primary
        hover:bg-success/80
        focus-visible:ring-success
        focus-visible:ring-offset-background-primary
      `,
      secondary: `
        bg-accent-primary/10
        text-accent-primary
        hover:bg-accent-primary/20
        focus-visible:ring-accent-primary
        focus-visible:ring-offset-background-primary
      `,
      outline: `
        border
        border-accent-primary
        text-accent-primary
        hover:bg-accent-primary/10
        focus-visible:ring-accent-primary
        focus-visible:ring-offset-background-primary
      `
    }[variant];
    
    // Size classes
    const sizeClasses = {
      default: `
        h-12
        px-4
        text-sm
        rounded-button
      `,
      large: `
        h-14
        px-6
        text-base
        rounded-button
      `,
      small: `
        h-10
        px-3
        text-xs
        rounded-button
      `
    }[size];
    
    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';