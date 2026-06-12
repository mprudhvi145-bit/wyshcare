/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/admin/page.tsx
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
 - frontend/src/app/doctor/emr/dermatology/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 - frontend/src/components/ui/progress.tsx
 - frontend/src/components/marketing/health-twin-demo.tsx
 *
 * Calls:
 - status-badge
 - data-table
 - avatar
 - card
 - recharts
 - react
 - badge
 - skeleton
 *
 * Dependencies:
 - status-badge
 - data-table
 - avatar
 - card
 - recharts
 - react
 - badge
 - skeleton
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

import { useState, useEffect } from 'react';
import {
  Users, Stethoscope, Building2, FlaskConical, Pill, ShieldCheck,
  TrendingUp, UserPlus, Activity, AlertCircle, CheckCircle, IndianRupee,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable } from '@/components/ui/data-table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { ColumnDef } from '@tanstack/react-table';

const MOCK_METRICS = {
  totalUsers: 28450,
  activeDoctors: 1248,
  clinics: 892,
  labs: 456,
  pharmacies: 623,
  insurers: 48,
};

const MOCK_REVENUE = Array.from({ length: 12 }, (_, i) => ({
  month: new Date(2025, i, 1).toLocaleDateString('en-IN', { month: 'short' }),
  revenue: Math.floor(Math.random() * 800000) + 200000,
  expenses: Math.floor(Math.random() * 400000) + 100000,
}));

const MOCK_GROWTH = Array.from({ length: 12 }, (_, i) => ({
  month: new Date(2025, i, 1).toLocaleDateString('en-IN', { month: 'short' }),
  users: Math.floor(Math.random() * 2000) + 500,
  doctors: Math.floor(Math.random() * 100) + 20,
}));

const MOCK_REGISTRATIONS = [
  { id: 'u1', name: 'Dr. Ananya Sharma', email: 'ananya@clinic.com', role: 'Doctor', status: 'ACTIVE', date: new Date(Date.now() - 86400000).toISOString() },
  { id: 'u2', name: 'City Medical Centre', email: 'admin@citymed.com', role: 'Clinic', status: 'ACTIVE', date: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'u3', name: 'Dr. Rahul Verma', email: 'rahul@hospital.com', role: 'Doctor', status: 'ACTIVE', date: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'u4', name: 'Metro Labs', email: 'info@metrolabs.in', role: 'Lab', status: 'INACTIVE', date: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: 'u5', name: 'MedPlus Pharmacy', email: 'orders@medplus.in', role: 'Pharmacy', status: 'ACTIVE', date: new Date(Date.now() - 5 * 86400000).toISOString() },
];

const SYSTEM_HEALTH = [
  { service: 'API Gateway', status: 'Operational', uptime: '99.9%', icon: CheckCircle, color: 'text-[#2EE59D]' },
  { service: 'Database Cluster', status: 'Operational', uptime: '99.95%', icon: CheckCircle, color: 'text-[#2EE59D]' },
  { service: 'AI Services', status: 'Degraded', uptime: '98.2%', icon: AlertCircle, color: 'text-[#FFD84D]' },
  { service: 'Payment Gateway', status: 'Operational', uptime: '99.8%', icon: CheckCircle, color: 'text-[#2EE59D]' },
  { service: 'ABDM Integration', status: 'Operational', uptime: '99.5%', icon: CheckCircle, color: 'text-[#2EE59D]' },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const regColumns: ColumnDef<typeof MOCK_REGISTRATIONS[0]>[] = [
  { accessorKey: 'name', header: 'Name', cell: ({ row }) => (
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{row.original.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
      <div><p className="text-sm font-medium text-white">{row.original.name}</p><p className="text-xs text-white/40">{row.original.email}</p></div>
    </div>
  )},
  { accessorKey: 'role', header: 'Role', cell: ({ row }) => <Badge variant="outline" size="sm">{row.original.role}</Badge> },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" /> },
  { accessorKey: 'date', header: 'Date', cell: ({ row }) => <span className="text-xs text-white/50">{new Date(row.original.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span> },
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-72" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><Skeleton className="h-80" /><Skeleton className="h-80" /></div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <PageHeader title="Admin Dashboard" description="Platform-wide metrics and system health" />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Users" value={MOCK_METRICS.totalUsers.toLocaleString('en-IN')} trend={{ direction: 'up', value: '8.2% this month' }} />
        <StatCard icon={<Stethoscope className="h-5 w-5" />} label="Active Doctors" value={MOCK_METRICS.activeDoctors.toLocaleString('en-IN')} trend={{ direction: 'up', value: '3.1% increase' }} />
        <StatCard icon={<Building2 className="h-5 w-5" />} label="Clinics" value={MOCK_METRICS.clinics.toLocaleString('en-IN')} trend={{ direction: 'up', value: '2 new this week' }} />
        <StatCard icon={<FlaskConical className="h-5 w-5" />} label="Labs" value={MOCK_METRICS.labs.toLocaleString('en-IN')} trend={{ direction: 'neutral', value: '1.2% change' }} />
        <StatCard icon={<Pill className="h-5 w-5" />} label="Pharmacies" value={MOCK_METRICS.pharmacies.toLocaleString('en-IN')} trend={{ direction: 'up', value: '5 new this month' }} />
        <StatCard icon={<ShieldCheck className="h-5 w-5" />} label="Insurers" value={MOCK_METRICS.insurers} trend={{ direction: 'up', value: '1 new TPA added' }} />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><IndianRupee className="h-4 w-4 text-[#8FD3D1]" />Revenue Overview (2025)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_REVENUE} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: '#1C2025', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }} />
                  <Bar dataKey="revenue" fill="#8FD3D1" radius={[4, 4, 0, 0]} maxBarSize={32} name="Revenue" />
                  <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={32} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4 text-[#8FD3D1]" />User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_GROWTH} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                  <defs>
                    <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8FD3D1" stopOpacity={0.2} /><stop offset="95%" stopColor="#8FD3D1" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: '#1C2025', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }} />
                  <Area type="monotone" dataKey="users" stroke="#8FD3D1" fill="url(#usersGrad)" strokeWidth={2} name="Users" />
                  <Area type="monotone" dataKey="doctors" stroke="#2EE59D" fill="none" strokeWidth={2} name="Doctors" strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><UserPlus className="h-4 w-4 text-[#8FD3D1]" />Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={regColumns} data={MOCK_REGISTRATIONS} pageSize={5} emptyTitle="No recent registrations" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4 text-[#8FD3D1]" />System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {SYSTEM_HEALTH.map((s) => (
                <div key={s.service} className="flex items-center justify-between rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                    <div>
                      <p className="text-sm font-medium text-white">{s.service}</p>
                      <p className="text-xs text-white/40">{s.status}</p>
                    </div>
                  </div>
                  <Badge variant="outline" size="sm">{s.uptime}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
