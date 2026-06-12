/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/os/admin/page.tsx
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
 - frontend/src/app/(auth)/login/page.tsx
 *
 * Calls:
 - card
 - badge
 - stat-card
 - framer-motion
 - page-header
 *
 * Dependencies:
 - card
 - badge
 - stat-card
 - framer-motion
 - page-header
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
import { Users,
  Building2,
  Activity,
  Calendar,
  AlertTriangle,
  DollarSign,
  HeartPulse,
  FlaskConical,
  Pill,
  Stethoscope,
  UserPlus,
  FileText,
  Clock,
  Shield,
  Settings, } from 'lucide-react';

import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

import { StatCard } from '@/components/ui/stat-card';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

// ── Mock Data ──────────────────────────────────────────
const MOCK_ACTIVITY = [
  { action: 'New patient registered', user: 'Reception', time: '2 min ago', type: 'registration' },
  { action: 'Lab report released', user: 'Lab', time: '8 min ago', type: 'lab' },
  { action: 'Prescription dispensed', user: 'Pharmacy', time: '15 min ago', type: 'pharmacy' },
  { action: 'Invoice paid', user: 'Billing', time: '22 min ago', type: 'billing' },
  { action: 'Insurance claim processed', user: 'Insurance', time: '35 min ago', type: 'insurance' },
  { action: 'Appointment checked in', user: 'Reception', time: '42 min ago', type: 'appointment' },
  { action: 'Discharge summary signed', user: 'Doctor', time: '1 hr ago', type: 'discharge' },
  { action: 'Medication administered', user: 'Nurse', time: '1 hr ago', type: 'medication' },
];

const WORKSPACE_STATUS: Record<string, { status: 'green' | 'amber' | 'red'; label: string }> = {
  'Nurse Station': { status: 'green', label: 'Operational' },
  'Lab': { status: 'green', label: 'Operational' },
  'Pharmacy': { status: 'amber', label: 'Low stock alert' },
  'Doctor': { status: 'green', label: 'Operational' },
  'Reception': { status: 'green', label: 'Operational' },
  'Billing': { status: 'amber', label: 'Payment gateway slow' },
  'Insurance': { status: 'green', label: 'Operational' },
  'Admin': { status: 'red', label: 'SSL cert expiring' },
};

const QUICK_LINKS = [
  { name: 'Nurse Station', href: '/os/nurse', icon: HeartPulse, color: 'text-cyan-300 bg-cyan-500/20' },
  { name: 'Lab', href: '/os/lab', icon: FlaskConical, color: 'text-emerald-300 bg-emerald-500/20' },
  { name: 'Pharmacy', href: '/os/pharmacy', icon: Pill, color: 'text-violet-300 bg-violet-500/20' },
  { name: 'Doctor', href: '/os/doctor', icon: Stethoscope, color: 'text-indigo-300 bg-indigo-500/20' },
  { name: 'Reception', href: '/os/reception', icon: UserPlus, color: 'text-amber-300 bg-amber-500/20' },
  { name: 'Billing', href: '/os/billing', icon: DollarSign, color: 'text-rose-300 bg-rose-500/20' },
  { name: 'Insurance', href: '/os/insurance', icon: Shield, color: 'text-sky-300 bg-sky-500/20' },
  { name: 'OS Admin', href: '/os/admin', icon: Settings, color: 'text-slate-300 bg-slate-500/20' },
];

const statusDot: Record<string, string> = {
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
};

const typeIcons: Record<string, typeof Activity> = {
  registration: UserPlus,
  lab: FlaskConical,
  pharmacy: Pill,
  billing: DollarSign,
  insurance: Shield,
  appointment: Calendar,
  discharge: FileText,
  medication: HeartPulse,
};

// ── Page ────────────────────────────────────────────────
export default function AdminDashboardPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
      <PageHeader title="OS Admin Dashboard" description="System-wide overview and workspace status" />

      {/* Top Row: Stat Cards */}
      <motion.div variants={item} className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          icon={<Users className="h-6 w-6" />}
          label="Total Users"
          value="1,284"
          trend={{ direction: 'up', value: '+12%' }}
        />
        <StatCard
          icon={<Building2 className="h-6 w-6" />}
          label="Active Staff"
          value="48"
          trend={{ direction: 'up', value: '+3 today' }}
        />
        <StatCard
          icon={<Calendar className="h-6 w-6" />}
          label="Today's Appointments"
          value="64"
          trend={{ direction: 'up', value: '+8%' }}
        />
        <StatCard
          icon={<DollarSign className="h-6 w-6" />}
          label="Revenue Today"
          value="₹1,84,200"
          trend={{ direction: 'up', value: '+15%' }}
        />
        <StatCard
          icon={<Activity className="h-6 w-6" />}
          label="Active Workspaces"
          value="8/8"
        />
      </motion.div>

      {/* Middle: Two Columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Recent Activity */}
        <motion.div variants={item}>
          <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white/90">
                <Activity className="h-5 w-5 text-[#8FD3D1]" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_ACTIVITY.map((entry, i) => {
                  const Icon = typeIcons[entry.type] ?? Activity;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1C2025] shadow-sm">
                        <Icon className="h-4 w-4 text-white/60" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white/90">{entry.action}</p>
                        <p className="text-xs text-white/50">
                          {entry.user} &middot; {entry.time}
                        </p>
                      </div>
                      <Clock className="h-3.5 w-3.5 text-white/40" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right: Workspace Status */}
        <motion.div variants={item}>
          <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white/90">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                Workspace Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(WORKSPACE_STATUS).map(([name, info]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2.5 w-2.5 rounded-full ${statusDot[info.status]}`} />
                      <span className="font-medium text-white/90">{name}</span>
                    </div>
                    <Badge
                      variant={
                        info.status === 'green' ? 'success' : info.status === 'amber' ? 'warning' : 'danger'
                      }
                      size="sm"
                    >
                      {info.label}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom: Quick Links to Workspaces */}
      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white/90">
              <Settings className="h-5 w-5 text-white/60" />
              Quick Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {QUICK_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-white/10 hover:shadow-[0_0_15px_rgba(143,211,209,0.08)]"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${link.color}`}>
                    <link.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-white/90">{link.name}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
