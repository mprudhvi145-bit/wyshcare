/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/insurance/layout.tsx
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
 - frontend/src/app/clinic/layout.tsx
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
  LayoutDashboard, Building2, FileText, Shield, ScrollText,
  CheckCircle, ClipboardList, FileCheck, DollarSign, Bot,
} from 'lucide-react';

import { RoleShell } from '@/components/app/role-shell';

const nav = [
  { href: '/insurance', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/insurance/providers', label: 'Providers', icon: Building2 },
  { href: '/insurance/plans', label: 'Plans', icon: FileText },
  { href: '/insurance/coverage-rules', label: 'Coverage Rules', icon: ScrollText },
  { href: '/insurance/eligibility', label: 'Eligibility', icon: CheckCircle },
  { href: '/insurance/pre-auth', label: 'Pre-Auth', icon: ClipboardList },
  { href: '/insurance/claims', label: 'Claims', icon: FileCheck },
  { href: '/insurance/settlements', label: 'Settlements', icon: DollarSign },
  { href: '/insurance/copilot', label: 'AI Copilot', icon: Bot },
];

export default function InsuranceLayout({ children }: { children: ReactNode }) {
  return (
    <RoleShell nav={nav} title="WyshCare Insurance" role="Insurance">
      {children}
    </RoleShell>
  );
}
