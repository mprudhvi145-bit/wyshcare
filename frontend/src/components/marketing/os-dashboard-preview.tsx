/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/marketing/os-dashboard-preview.tsx
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
 * React component: os-dashboard-preview
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
 - navigation
 - framer-motion
 *
 * Dependencies:
 - navigation
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
import { useRouter } from 'next/navigation';
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

const WORKSPACES = [
  { name: 'Nurse Station', icon: HeartPulse, color: '#22D3EE', desc: 'Manage ward tasks, medications, vitals, and shift handovers' },
  { name: 'Lab', icon: FlaskConical, color: '#10B981', desc: 'Sample collection, test results, and report management' },
  { name: 'Pharmacy', icon: Pill, color: '#8B5CF6', desc: 'Dispensing queue, inventory, stock alerts, and procurement' },
  { name: 'Doctor', icon: Stethoscope, color: '#6366F1', desc: 'Patient queue, EMR, SOAP notes, prescriptions, and referrals' },
  { name: 'Reception', icon: UserPlus, color: '#F59E0B', desc: 'Patient registration, check-in, appointments, and queue management' },
  { name: 'Billing', icon: DollarSign, color: '#F43F5E', desc: 'Invoices, payments, pending dues, and settlement tracking' },
  { name: 'Insurance', icon: Shield, color: '#0EA5E9', desc: 'Claims processing, eligibility checks, and pre-authorization' },
  { name: 'Admin', icon: Settings, color: '#94A3B8', desc: 'System overview, workspace status, and operational analytics' },
];

export function OsDashboardPreview() {
  const router = useRouter();

  return (
    <section className="py-24 md:py-32 overflow-hidden bg-[#0B0D10]">
      <div className="max-w-7xl mx-auto lg:px-8 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-white/50 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-[#8FD3D1]" />
            WyshCare OS
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            One OS for Your Entire Clinic
          </h2>
          <p className="text-base md:text-lg max-w-xl mx-auto text-white/60">
            Eight integrated workspaces. One unified experience. Your clinic, intelligently connected.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mt-12"
        >
          {WORKSPACES.map((ws, i) => {
            const Icon = ws.icon;
            return (
              <motion.button
                key={ws.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.08 * i }}
                onClick={() => router.push('/login')}
                className="group flex flex-col rounded-2xl border border-white/[0.08] bg-[#15181D] p-5 text-left transition-all hover:border-white/[0.15] hover:bg-white/[0.03]"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl mb-4"
                  style={{ backgroundColor: `${ws.color}20` }}
                >
                  <Icon className="h-6 w-6" style={{ color: ws.color }} />
                </div>
                <h3 className="text-base font-semibold text-white/90 mb-1">{ws.name}</h3>
                <p className="text-sm text-white/50 flex-1">{ws.desc}</p>
                <div className="flex items-center gap-1 mt-4 text-xs font-medium text-white/40 group-hover:text-[#8FD3D1] transition-colors">
                  Open Workspace <ArrowRight className="h-3 w-3" />
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center gap-2 rounded-xl bg-white/[0.06] border border-white/[0.1] px-8 py-3.5 text-sm font-semibold text-white/80 transition-all hover:bg-white/[0.1] hover:border-white/[0.15]"
          >
            Sign in to access your workspace <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
