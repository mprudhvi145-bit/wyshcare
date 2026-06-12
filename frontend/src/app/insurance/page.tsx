/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/insurance/page.tsx
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
 - status-badge
 - data-table
 - card
 - empty-state
 - recharts
 - react
 - skeleton
 - button
 *
 * Dependencies:
 - status-badge
 - data-table
 - card
 - empty-state
 - recharts
 - react
 - skeleton
 - button
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
import Link from 'next/link';
import { ShieldCheck, FileCheck, TrendingUp, IndianRupee,
  Plus, Search, ChevronRight,
  Activity, Clock, } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import type { Claim, PreAuthorization } from '@/types';

const MOCK_METRICS = {
  activePolicies: 1248,
  claimsThisMonth: 342,
  approvalRate: 94.2,
  totalSettled: 58600000,
};

const MOCK_TREND = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
  claims: Math.floor(Math.random() * 20) + 5,
  approved: Math.floor(Math.random() * 16) + 3,
}));

const MOCK_RECENT_CLAIMS: Claim[] = [
  { id: '1', policyId: 'p1', clinicId: 'c1', patientUserId: 'u1', claimNumber: 'CLM-2026-0184', totalAmount: 45000, claimedAmount: 45000, approvedAmount: 40500, status: 'APPROVED', submissionDate: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '2', policyId: 'p1', clinicId: 'c1', patientUserId: 'u2', claimNumber: 'CLM-2026-0183', totalAmount: 22000, claimedAmount: 22000, status: 'SUBMITTED', submissionDate: new Date(Date.now() - 2 * 86400000).toISOString(), createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: '3', policyId: 'p2', clinicId: 'c2', patientUserId: 'u3', claimNumber: 'CLM-2026-0182', totalAmount: 78000, claimedAmount: 78000, approvedAmount: 62400, status: 'APPROVED', submissionDate: new Date(Date.now() - 3 * 86400000).toISOString(), createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: '4', policyId: 'p2', clinicId: 'c1', patientUserId: 'u4', claimNumber: 'CLM-2026-0181', totalAmount: 12500, claimedAmount: 12500, status: 'DRAFT', createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: '5', policyId: 'p3', clinicId: 'c3', patientUserId: 'u5', claimNumber: 'CLM-2026-0180', totalAmount: 95000, claimedAmount: 95000, status: 'REJECTED', submissionDate: new Date(Date.now() - 5 * 86400000).toISOString(), createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
];

const MOCK_PENDING_PRE_AUTHS: PreAuthorization[] = [
  { id: 'pa1', policyId: 'p1', clinicId: 'c1', patientUserId: 'u1', procedureCode: 'ANGIO-101', diagnosisCode: 'I25.1', requestedAmount: 85000, status: 'PENDING', expiresAt: new Date(Date.now() + 15 * 86400000).toISOString(), createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'pa2', policyId: 'p2', clinicId: 'c2', patientUserId: 'u2', procedureCode: 'MRI-205', diagnosisCode: 'M51.1', requestedAmount: 32000, status: 'PENDING', expiresAt: new Date(Date.now() + 20 * 86400000).toISOString(), createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'pa3', policyId: 'p1', clinicId: 'c3', patientUserId: 'u3', procedureCode: 'SURG-401', diagnosisCode: 'K40.9', requestedAmount: 120000, status: 'PENDING', expiresAt: new Date(Date.now() + 25 * 86400000).toISOString(), createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const claimsColumns: ColumnDef<Claim>[] = [
  { accessorKey: 'claimNumber', header: 'Claim #', cell: ({ row }) => <span className="font-medium text-white/90">{row.original.claimNumber}</span> },
  { accessorKey: 'patientUserId', header: 'Patient', cell: ({ row }) => <span className="text-white/60">Patient #{row.original.patientUserId.slice(0, 5)}</span> },
  { accessorKey: 'claimedAmount', header: 'Amount', cell: ({ row }) => <span className="font-medium">₹{row.original.claimedAmount.toLocaleString('en-IN')}</span> },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" /> },
  { accessorKey: 'submissionDate', header: 'Date', cell: ({ row }) => <span className="text-white/50 text-xs">{row.original.submissionDate ? new Date(row.original.submissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</span> },
];

export default function InsuranceDashboard() {
  const [loading, setLoading] = useState(true);
  const [trend] = useState(MOCK_TREND);
  const [recentClaims] = useState(MOCK_RECENT_CLAIMS);
  const [pendingPreAuths] = useState(MOCK_PENDING_PRE_AUTHS);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  if (loading) {
    return (
      <div className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
        <Skeleton className="h-9 w-72 bg-white/5" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full bg-white/5" />)}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 lg:col-span-2 bg-white/5" />
          <Skeleton className="h-80 bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
      <motion.div variants={item}>
        <PageHeader title="Insurance Dashboard" description="Overview of insurance operations and performance">
          <div className="flex gap-2">
            <Link href="/insurance/claims">
              <Button variant="outline" size="sm"><FileCheck className="h-4 w-4" />File Claim</Button>
            </Link>
            <Link href="/insurance/eligibility">
              <Button variant="default" size="sm"><Search className="h-4 w-4" />Check Eligibility</Button>
            </Link>
          </div>
        </PageHeader>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<ShieldCheck className="h-5 w-5" />} label="Active Policies" value={MOCK_METRICS.activePolicies.toLocaleString('en-IN')} trend={{ direction: 'up', value: '4.2% this month' }} />
        <StatCard icon={<FileCheck className="h-5 w-5" />} label="Claims This Month" value={MOCK_METRICS.claimsThisMonth} trend={{ direction: 'up', value: '8.1% from last month' }} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Approval Rate" value={`${MOCK_METRICS.approvalRate}%`} trend={{ direction: 'neutral', value: '0.8% change' }} />
        <StatCard icon={<IndianRupee className="h-5 w-5" />} label="Total Settled" value={`₹${(MOCK_METRICS.totalSettled / 10000000).toFixed(1)}Cr`} trend={{ direction: 'up', value: '12.3% increase' }} />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-white/90"><Activity className="h-4 w-4 text-[#8FD3D1]" />Claims Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                  <defs>
                    <linearGradient id="claimsGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} /><stop offset="95%" stopColor="#06b6d4" stopOpacity={0} /></linearGradient>
                    <linearGradient id="approvedGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: '#1C2025', color: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }} />
                  <Area type="monotone" dataKey="claims" stroke="#06b6d4" fill="url(#claimsGrad)" strokeWidth={2} name="Filed" />
                  <Area type="monotone" dataKey="approved" stroke="#10b981" fill="url(#approvedGrad)" strokeWidth={2} name="Approved" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-white/90"><Clock className="h-4 w-4 text-amber-400" />Pending Pre-Authorizations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingPreAuths.length === 0 ? (
              <EmptyState title="No pending pre-auths" description="All caught up!" />
            ) : (
              pendingPreAuths.map((pa) => (
                <div key={pa.id} className="flex items-start justify-between gap-3 rounded-xl bg-white/5 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white/90">{pa.procedureCode}</p>
                    <p className="text-[10px] text-white/40">{pa.diagnosisCode}</p>
                    <p className="text-xs font-medium text-white/70 mt-1">₹{pa.requestedAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <StatusBadge status={pa.status} size="sm" />
                </div>
              ))
            )}
            <Link href="/insurance/pre-auth">
              <Button variant="ghost" size="sm" className="w-full justify-between text-xs">
                View All <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-white/90"><FileCheck className="h-4 w-4 text-[#8FD3D1]" />Recent Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={claimsColumns} data={recentClaims} pageSize={5} emptyTitle="No claims found" />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="text-white/90">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link href="/insurance/plans">
                <Button variant="outline" className="w-full justify-start"><Plus className="h-4 w-4" />New Policy</Button>
              </Link>
              <Link href="/insurance/claims">
                <Button variant="outline" className="w-full justify-start"><FileCheck className="h-4 w-4" />File Claim</Button>
              </Link>
              <Link href="/insurance/eligibility">
                <Button variant="outline" className="w-full justify-start"><Search className="h-4 w-4" />Check Eligibility</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
