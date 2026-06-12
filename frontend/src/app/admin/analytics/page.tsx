/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/admin/analytics/page.tsx
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
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 - frontend/src/components/ui/progress.tsx
 *
 * Calls:
 - card
 - react
 - skeleton
 - lucide-react
 - framer-motion
 - page-header
 *
 * Dependencies:
 - card
 - react
 - skeleton
 - lucide-react
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

import { useState, useEffect } from 'react';
import { IndianRupee, Users, Activity, Heart, FileText, } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend, } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';

const COLORS = ['#8FD3D1', '#2EE59D', '#FFD84D', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const MOCK_REVENUE_DAILY = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
  revenue: Math.floor(Math.random() * 150000) + 50000,
}));

const MOCK_REVENUE_MONTHLY = Array.from({ length: 12 }, (_, i) => ({
  month: new Date(2025, i, 1).toLocaleDateString('en-IN', { month: 'short' }),
  revenue: Math.floor(Math.random() * 3000000) + 500000,
  subscriptions: Math.floor(Math.random() * 1500000) + 300000,
  consultations: Math.floor(Math.random() * 1000000) + 200000,
}));

const MOCK_APPOINTMENTS = Array.from({ length: 12 }, (_, i) => ({
  month: new Date(2025, i, 1).toLocaleDateString('en-IN', { month: 'short' }),
  total: Math.floor(Math.random() * 5000) + 1000,
  completed: Math.floor(Math.random() * 4000) + 800,
  cancelled: Math.floor(Math.random() * 500) + 50,
}));

const MOCK_DISEASES = [
  { name: 'Hypertension', value: 2840 },
  { name: 'Diabetes Type 2', value: 2350 },
  { name: 'Respiratory Infections', value: 1890 },
  { name: 'Thyroid Disorders', value: 1240 },
  { name: 'Cardiac Conditions', value: 980 },
  { name: 'Musculoskeletal', value: 740 },
];

const MOCK_CLAIMS_TREND = Array.from({ length: 6 }, (_, i) => ({
  month: new Date(2025, i, 1).toLocaleDateString('en-IN', { month: 'short' }),
  submitted: Math.floor(Math.random() * 200) + 100,
  approved: Math.floor(Math.random() * 150) + 50,
  rejected: Math.floor(Math.random() * 30) + 5,
}));

const MOCK_UTILIZATION = [
  { name: 'Consultation', value: 35 },
  { name: 'Medication', value: 25 },
  { name: 'Lab Tests', value: 18 },
  { name: 'Procedures', value: 12 },
  { name: 'Others', value: 10 },
];

const MOCK_PATIENT_GROWTH = Array.from({ length: 12 }, (_, i) => ({
  month: new Date(2025, i, 1).toLocaleDateString('en-IN', { month: 'short' }),
  newPatients: Math.floor(Math.random() * 3000) + 500,
  returning: Math.floor(Math.random() * 2000) + 300,
}));

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [revenuePeriod, setRevenuePeriod] = useState('monthly');

  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-72" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-80" /><Skeleton className="h-80" />
          <Skeleton className="h-80" /><Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <PageHeader title="Analytics" description="Platform-wide analytics and insights">
          <div className="flex gap-1 rounded-[14px] bg-white/[0.06] border border-white/[0.08] p-1">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
              <button key={p} onClick={() => setRevenuePeriod(p)} className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${revenuePeriod === p ? 'bg-[#8FD3D1]/10 text-[#8FD3D1] shadow-none' : 'text-white/50 hover:text-white/70'}`}>{p.charAt(0).toUpperCase() + p.slice(1)}</button>
            ))}
          </div>
        </PageHeader>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><IndianRupee className="h-4 w-4 text-[#8FD3D1]" />Revenue {revenuePeriod === 'daily' ? '(Last 30 Days)' : '(2025)'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                {revenuePeriod === 'daily' ? (
                  <AreaChart data={MOCK_REVENUE_DAILY} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                    <defs><linearGradient id="revGradD" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8FD3D1" stopOpacity={0.2} /><stop offset="95%" stopColor="#8FD3D1" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: '#1C2025' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#8FD3D1" fill="url(#revGradD)" strokeWidth={2} />
                  </AreaChart>
                ) : (
                  <BarChart data={MOCK_REVENUE_MONTHLY} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: '#1C2025' }} />
                    <Bar dataKey="revenue" fill="#8FD3D1" radius={[4, 4, 0, 0]} maxBarSize={20} name="Total Revenue" />
                    <Bar dataKey="subscriptions" fill="#2EE59D" radius={[4, 4, 0, 0]} maxBarSize={20} name="Subscriptions" />
                    <Bar dataKey="consultations" fill="#FFD84D" radius={[4, 4, 0, 0]} maxBarSize={20} name="Consultations" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4 text-[#8FD3D1]" />Appointment Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_APPOINTMENTS} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                  <defs><linearGradient id="apptGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8FD3D1" stopOpacity={0.2} /><stop offset="95%" stopColor="#8FD3D1" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: '#1C2025' }} />
                  <Area type="monotone" dataKey="total" stroke="#8FD3D1" fill="url(#apptGrad)" strokeWidth={2} name="Total" />
                  <Area type="monotone" dataKey="completed" stroke="#2EE59D" fill="none" strokeWidth={2} name="Completed" />
                  <Area type="monotone" dataKey="cancelled" stroke="#ef4444" fill="none" strokeWidth={2} name="Cancelled" strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Heart className="h-4 w-4 text-[#FF5A5A]" />Top Disease Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={MOCK_DISEASES} cx="50%" cy="45%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name" paddingAngle={2}>
                    {MOCK_DISEASES.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: '#1C2025' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {MOCK_DISEASES.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-white/60">{d.name}</span>
                  <span className="ml-auto font-medium text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4 text-[#8FD3D1]" />Claims Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_CLAIMS_TREND} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: '#1C2025' }} />
                  <Bar dataKey="submitted" fill="#8FD3D1" radius={[4, 4, 0, 0]} maxBarSize={16} name="Submitted" />
                  <Bar dataKey="approved" fill="#2EE59D" radius={[4, 4, 0, 0]} maxBarSize={16} name="Approved" />
                  <Bar dataKey="rejected" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={16} name="Rejected" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4 text-[#8FD3D1]" />Utilization by Service Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={MOCK_UTILIZATION} cx="50%" cy="45%" outerRadius={100} dataKey="value" nameKey="name" label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {MOCK_UTILIZATION.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: '#1C2025' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4 text-[#8FD3D1]" />Patient Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_PATIENT_GROWTH} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                  <defs><linearGradient id="newGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8FD3D1" stopOpacity={0.2} /><stop offset="95%" stopColor="#8FD3D1" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: '#1C2025' }} />
                  <Area type="monotone" dataKey="newPatients" stroke="#8FD3D1" fill="url(#newGrad)" strokeWidth={2} name="New Patients" />
                  <Area type="monotone" dataKey="returning" stroke="#2EE59D" fill="none" strokeWidth={2} name="Returning" strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
