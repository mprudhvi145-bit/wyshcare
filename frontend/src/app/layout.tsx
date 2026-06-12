/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/layout.tsx
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
 * React component: layout
 *
 * Responsibilities:
 * - Render UI components for Frontend
 * - Handle user interactions and state management
 *
 * Used By:
 - Standalone (not imported by other source files)
 *
 * Calls:
 - app-provider
 *
 * Dependencies:
 - app-provider
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

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { AppProvider } from '@/providers/app-provider';

export const metadata: Metadata = {
  title: 'WyshCare — Your Health, Intelligent',
  description: 'AI-native healthcare operating system. Intelligent, calm, human.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('wyshcare-theme') || 'auto';
                if (theme === 'auto') {
                  theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />
      </head>
      <body className="bg-bg-primary text-text-primary antialiased">
        <div className="min-h-screen"><AppProvider>{children}</AppProvider></div>
      </body>
    </html>
  );
}
