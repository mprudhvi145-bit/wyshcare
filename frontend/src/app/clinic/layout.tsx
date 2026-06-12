/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/clinic/layout.tsx
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
 - frontend/src/app/admin/layout.tsx
 - frontend/src/app/insurance/layout.tsx
 *
 * Calls:
 - role-shell
 *
 * Dependencies:
 - role-shell
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
import {
  LayoutDashboard, LogIn, CreditCard, Shield, Cpu,
} from 'lucide-react';

import { RoleShell } from '@/components/app/role-shell';

const nav = [
  { href: '/clinic', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clinic/reception', label: 'Reception', icon: LogIn },
  { href: '/clinic/billing', label: 'Billing', icon: CreditCard },
  { href: '/clinic/admin', label: 'Admin', icon: Shield },
  { href: '/clinic/clinical-twin', label: 'Clinical Twin', icon: Cpu },
];

export default function ClinicLayout({ children }: { children: ReactNode }) {
  return (
    <RoleShell nav={nav} title="WyshCare Clinic" role="Clinic">
      {children}
    </RoleShell>
  );
}
