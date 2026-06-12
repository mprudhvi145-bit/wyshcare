/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/os/dashboard/page.tsx
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
 * React component: page
 *
 * Responsibilities:
 * - Render UI components for Frontend
 * - Handle user interactions and state management
 *
 * Used By:
 - frontend/src/app/insurance/claims/page.tsx
 - frontend/src/app/(platform)/health-twin/risk-predictions/page.tsx
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 - frontend/src/components/marketing/health-twin-demo.tsx
 - frontend/src/app/os/layout.tsx
 *
 * Calls:
 - button
 - session-store
 - framer-motion
 *
 * Dependencies:
 - button
 - session-store
 - framer-motion
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

import { motion } from 'framer-motion';
import {
  HeartPulse,
  FlaskConical,
  Pill,
  Stethoscope,
  UserPlus,
  DollarSign,
  Shield,
  Settings,
  ArrowRight,
} from 'lucide-react';

import { useSessionStore } from '@/stores/session-store';
import { Button } from '@/components/ui/button';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const hour = new Date().getHours();
const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

const WORKSPACES = [
  {
    name: 'Nurse Station',
    description: 'Manage ward tasks, medications, vitals, and shift handovers',
    href: '/os/nurse',
    icon: HeartPulse,
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/20 hover:border-cyan-500/40',
    badge: 'bg-cyan-500',
    active: true,
  },
  {
    name: 'Lab',
    description: 'Sample collection, test results, and report management',
    href: '/os/lab',
    icon: FlaskConical,
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20 hover:border-emerald-500/40',
    badge: 'bg-emerald-500',
    active: true,
  },
  {
    name: 'Pharmacy',
    description: 'Dispensing queue, inventory, stock alerts, and procurement',
    href: '/os/pharmacy',
    icon: Pill,
    color: 'bg-violet-500/20 text-violet-300 border-violet-500/20 hover:border-violet-500/40',
    badge: 'bg-violet-500',
    active: true,
  },
  {
    name: 'Doctor',
    description: 'Patient queue, EMR, SOAP notes, prescriptions, and referrals',
    href: '/os/doctor',
    icon: Stethoscope,
    color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/20 hover:border-indigo-500/40',
    badge: 'bg-indigo-500',
    active: true,
  },
  {
    name: 'Reception',
    description: 'Patient registration, check-in, appointments, and queue management',
    href: '/os/reception',
    icon: UserPlus,
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/20 hover:border-amber-500/40',
    badge: 'bg-amber-500',
    active: true,
  },
  {
    name: 'Billing',
    description: 'Invoices, payments, pending dues, and settlement tracking',
    href: '/os/billing',
    icon: DollarSign,
    color: 'bg-rose-500/20 text-rose-300 border-rose-500/20 hover:border-rose-500/40',
    badge: 'bg-rose-500',
    active: true,
  },
  {
    name: 'Insurance',
    description: 'Claims processing, eligibility checks, and pre-authorization',
    href: '/os/insurance',
    icon: Shield,
    color: 'bg-sky-500/20 text-sky-300 border-sky-500/20 hover:border-sky-500/40',
    badge: 'bg-sky-500',
    active: true,
  },
  {
    name: 'Admin',
    description: 'System overview, workspace status, and operational analytics',
    href: '/os/admin',
    icon: Settings,
    color: 'bg-slate-500/20 text-slate-300 border-slate-500/20 hover:border-slate-500/40',
    badge: 'bg-slate-500',
    active: true,
  },
];

export default function OSDashboardPage() {
  const user = useSessionStore((s) => s.user);
  const userName = user?.fullName ?? 'User';

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 p-4 md:p-8 bg-[#0B0D10] min-h-screen">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-white/90">
          {greeting}, {userName}
        </h1>
        <p className="text-sm text-white/50">Select a workspace to get started</p>
      </motion.div>

      <motion.div
        variants={item}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {WORKSPACES.map((ws) => {
          const Icon = ws.icon;
          return (
            <a
              key={ws.name}
              href={ws.href}
              className={`group flex min-w-[280px] flex-col rounded-2xl border-2 bg-[#15181D] p-6 shadow-sm transition-all ${ws.color}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${ws.color}`}>
                  <Icon className="h-7 w-7" />
                </div>
                {ws.active && (
                  <span className={`flex h-2.5 w-2.5 rounded-full ${ws.badge}`} title="Active" />
                )}
              </div>

              <h2 className="mb-1 text-xl font-semibold text-white/90">{ws.name}</h2>
              <p className="mb-6 flex-1 text-sm text-white/50">{ws.description}</p>

              <Button
                variant="outline"
                className="w-full justify-between border-white/10 text-white/70 transition-all group-hover:border-white/20 group-hover:bg-white/[0.04]"
              >
                <span>Go to Workspace</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </a>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
