/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/admin/nhcx/page.tsx
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
 - frontend/src/hooks/use-emergency.ts
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 - frontend/src/components/marketing/health-twin-demo.tsx
 *
 * Calls:
 - data-table
 - react-query
 - card
 - empty-state
 - recharts
 - badge
 - api-client
 - button
 *
 * Dependencies:
 - data-table
 - react-query
 - card
 - empty-state
 - recharts
 - badge
 - api-client
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

import { FileCheck, XCircle, Activity, CheckCircle, Database, ArrowUpDown, Send,
  RefreshCw, } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';

import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import type { ColumnDef } from '@tanstack/react-table';
import type { NHCXSubmission } from '@/types';

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const txColumns: ColumnDef<NHCXSubmission>[] = [
  { accessorKey: 'claim.claimNumber', header: 'Claim #', cell: ({ row }) => <span className="font-medium text-white/90">{row.original.claim.claimNumber}</span> },
  { accessorKey: 'submissionRef', header: 'NHCX Ref', cell: ({ row }) => <span className="text-xs text-white/40 font-mono">{row.original.submissionRef ?? '—'}</span> },
  { accessorKey: 'claim.claimedAmount', header: 'Amount', cell: ({ row }) => <span className="font-medium text-white/90">₹{(row.original.claim.claimedAmount / 100).toLocaleString('en-IN')}</span> },
  {
    accessorKey: 'status', header: 'Status', cell: ({ row }) => {
      const s = row.original.status;
      return s === 'ACCEPTED' ? <Badge variant="success" size="sm">Accepted</Badge> :
             s === 'REJECTED' ? <Badge variant="danger" size="sm">Rejected</Badge> :
             s === 'PENDING' ? <Badge variant="warning" size="sm">Pending</Badge> :
             s === 'PROCESSING' ? <Badge variant="default" size="sm">Processing</Badge> :
             <Badge variant="outline" size="sm">{s}</Badge>;
    },
  },
  {
    accessorKey: 'submittedAt', header: 'Submitted', cell: ({ row }) => (
      <span className="text-xs text-white/50">{new Date(row.original.submittedAt).toLocaleString('en-IN')}</span>
    ),
  },
];

export default function NHCXPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['nhcx-stats'],
    queryFn: () => api.getNHCXStats(),
    refetchInterval: 30_000,
  });

  const { data: submissions } = useQuery({
    queryKey: ['nhcx-submissions'],
    queryFn: () => api.getNHCXSubmissions({ limit: 10 }),
    refetchInterval: 30_000,
  });

  const monthlyData = [
    { month: 'Jan', sent: 320, success: 280, failed: 12 },
    { month: 'Feb', sent: 380, success: 330, failed: 15 },
    { month: 'Mar', sent: 410, success: 360, failed: 18 },
    { month: 'Apr', sent: 390, success: 345, failed: 10 },
    { month: 'May', sent: 450, success: 400, failed: 14 },
    { month: 'Jun', sent: 420, success: 370, failed: 16 },
  ];

  const statusData = stats?.byStatus
    ? Object.entries(stats.byStatus).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
      <motion.div variants={item}>
        <PageHeader
          title="NHCX Metrics"
          description="National Health Claims Exchange — claim submission & tracking"
        >
          <Button variant="outline" size="sm" onClick={() => { window.location.reload(); }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </PageHeader>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Send className="h-5 w-5" />}
          label="Total Claims Sent via NHCX"
          value={isLoading ? '...' : (stats?.totalClaimsSent ?? 0).toLocaleString('en-IN')}
          trend={{ direction: 'up', value: 'Lifetime total' }}
        />
        <StatCard
          icon={<FileCheck className="h-5 w-5" />}
          label="This Month"
          value={isLoading ? '...' : (stats?.claimsThisMonth ?? 0).toLocaleString('en-IN')}
          trend={{ direction: 'up', value: 'Current month' }}
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="Success Rate"
          value={isLoading ? '...' : `${stats?.successRate ?? 0}%`}
          trend={stats?.successRate ?? 0 > 80 ? { direction: 'up', value: 'Healthy' } : { direction: 'down', value: 'Needs attention' }}
        />
        <StatCard
          icon={<XCircle className="h-5 w-5" />}
          label="Failure Rate"
          value={isLoading ? '...' : `${stats?.failureRate ?? 0}%`}
          trend={stats?.failureRate ?? 0 < 10 ? { direction: 'down', value: 'Within limits' } : { direction: 'up', value: 'Above threshold' }}
        />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-white/90"><Activity className="h-4 w-4 text-[#8FD3D1]" />Monthly NHCX Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                  <defs><linearGradient id="nhcxGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} /><stop offset="95%" stopColor="#06b6d4" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1C2025', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff' }} />
                  <Area type="monotone" dataKey="sent" stroke="#06b6d4" fill="url(#nhcxGrad)" strokeWidth={2} name="Sent" />
                  <Area type="monotone" dataKey="success" stroke="#10b981" fill="none" strokeWidth={2} name="Success" />
                  <Area type="monotone" dataKey="failed" stroke="#ef4444" fill="none" strokeWidth={2} name="Failed" strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-white/90"><Database className="h-4 w-4 text-[#8FD3D1]" />Submission Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-sm text-white/40">No submission data yet</div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={{ fill: '#e2e8f0', fontSize: 12 }} labelLine={false}>
                      {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-white/90"><ArrowUpDown className="h-4 w-4 text-[#8FD3D1]" />NHCX Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {!submissions || submissions.length === 0 ? (
              <EmptyState icon={<Send className="h-8 w-8" />} title="No NHCX submissions" description="Claims submitted via NHCX will appear here" />
            ) : (
              <DataTable columns={txColumns} data={submissions} pageSize={10} />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
