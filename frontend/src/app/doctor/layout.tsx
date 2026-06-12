/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/doctor/layout.tsx
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
 - doctor-workspace-layout
 *
 * Dependencies:
 - doctor-workspace-layout
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
import { DoctorWorkspaceLayout } from '@/components/app/doctor-workspace-layout';

export default function DoctorLayout({ children }: { children: ReactNode }) {
  return <DoctorWorkspaceLayout>{children}</DoctorWorkspaceLayout>;
}
