/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/lib/theme.ts
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
 * theme — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
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
WyshID
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

import { useEffect, useState } from 'react';

export type Theme = 'auto' | 'light' | 'dark';

const STORAGE_KEY = 'wyshcare-theme';

/**
 * Get the theme from localStorage or system preference
 */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'auto';
  
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'auto') {
    return stored as Theme;
  }
  
  return 'auto';
}

/**
 * Set the theme in localStorage
 */
export function setStoredTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, theme);
}

/**
 * Get the actual color scheme ('light' or 'dark') based on theme setting
 */
export function getColorScheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

/**
 * Apply theme to the document element
 */
export function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  const colorScheme = getColorScheme(theme);
  document.documentElement.setAttribute('data-theme', colorScheme);
  
  // Also update the color-scheme CSS property for proper UA styling
  document.documentElement.style.colorScheme = colorScheme;
}

/**
 * Custom hook for theme management
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);
  
  useEffect(() => {
    // Apply theme on mount and when theme changes
    applyTheme(theme);
    
    // Update stored theme
    setStoredTheme(theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'auto') return 'light';
      if (prev === 'light') return 'dark';
      return 'auto';
    });
  };
  
  const setThemeTo = (newTheme: Theme) => {
    setTheme(newTheme);
  };
  
  return { theme, toggleTheme, setThemeTo };
}