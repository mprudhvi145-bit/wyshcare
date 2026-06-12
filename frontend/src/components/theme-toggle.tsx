/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/theme-toggle.tsx
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
 * React component: theme-toggle
 *
 * Responsibilities:
 * - Render UI components for Frontend
 * - Handle user interactions and state management
 *
 * Used By:
 - frontend/src/app/doctor/emr/dermatology/page.tsx
 - frontend/src/app/(platform)/health-twin/risk-predictions/page.tsx
 - frontend/src/components/dashboard/family-alerts-widget.tsx
 - frontend/src/features/general-medicine/components/clinical-snapshot.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 - frontend/src/components/marketing/health-twin-demo.tsx
 *
 * Calls:
 - lucide-react
 - theme
 *
 * Dependencies:
 - lucide-react
 - theme
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

import { useTheme, type Theme } from '@/lib/theme';
import { Moon, Sun, Repeat } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  // Get current color scheme for icon display
  const isDark = 
    theme === 'dark' || 
    (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Get theme label
  const themeLabels: Record<Theme, string> = {
    auto: 'Auto',
    light: 'Light',
    dark: 'Dark'
  };
  
  // Get theme icon
  const themeIcons: Record<Theme, React.ComponentType<{ size?: number; className?: string }>> = {
    auto: Repeat,
    light: Sun,
    dark: Moon
  };
  
  const Icon = themeIcons[theme];
  
  return (
    <button
      onClick={toggleTheme}
      className="
        touch-target-preferred
        flex items-center gap-2
        px-4 py-2
        bg-surface-card/50
        backdrop-blur-sm
        border border-border-card
        rounded-card
        text-text-secondary
        hover:text-text-primary
        hover:bg-surface-card
        transition-all
        duration-200
      "
      aria-label={`Switch to ${themeLabels[theme]} mode`}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm">{themeLabels[theme]}</span>
    </button>
  );
}