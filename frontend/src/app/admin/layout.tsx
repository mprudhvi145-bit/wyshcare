/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/admin/layout.tsx
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
 - frontend/src/app/clinic/layout.tsx
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
  LayoutDashboard, Users, BarChart3, CreditCard, Fingerprint, Building2, Stethoscope,
} from 'lucide-react';

import { RoleShell } from '@/components/app/role-shell';

const nav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/admin/abdm', label: 'ABDM', icon: Fingerprint },
  { href: '/admin/nhcx', label: 'NHCX', icon: Building2 },
  { href: '/admin/ehr', label: 'EHR', icon: Stethoscope },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleShell nav={nav} title="WyshCare Admin" role="Admin">
      {children}
    </RoleShell>
  );
}
