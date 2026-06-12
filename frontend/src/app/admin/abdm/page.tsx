/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/admin/abdm/page.tsx
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
 - frontend/src/hooks/use-emergency.ts
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 *
 * Calls:
 - react-query
 - card
 - recharts
 - badge
 - skeleton
 - api-client
 - button
 - lucide-react
 *
 * Dependencies:
 - react-query
 - card
 - recharts
 - badge
 - skeleton
 - api-client
 - button
 - lucide-react
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
import { useQuery } from '@tanstack/react-query';
import { Fingerprint, Users, FileCheck, XCircle, Activity, CheckCircle, Database, Link2, RefreshCw, } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const MOCK_HIE_VOLUME = Array.from({ length: 12 }, (_, i) => ({
  month: new Date(2025, i, 1).toLocaleDateString('en-IN', { month: 'short' }),
  recordsExchanged: Math.floor(Math.random() * 50000) + 10000,
  consentsProcessed: Math.floor(Math.random() * 3000) + 500,
}));

const MOCK_DAILY_STATS = [
  { day: 'Mon', abha: 145, consents: 98, hie: 3200 },
  { day: 'Tue', abha: 132, consents: 112, hie: 4100 },
  { day: 'Wed', abha: 158, consents: 85, hie: 3800 },
  { day: 'Thu', abha: 121, consents: 104, hie: 2900 },
  { day: 'Fri', abha: 167, consents: 128, hie: 4500 },
  { day: 'Sat', abha: 89, consents: 56, hie: 1800 },
  { day: 'Sun', abha: 45, consents: 32, hie: 1200 },
];

export default function AbdmPage() {
  const { data: abhaStats, isLoading: abhaLoading } = useQuery({
    queryKey: ['abha-stats'],
    queryFn: () => api.getAbhaStats(),
    refetchInterval: 30_000,
  });

  const { data: consentStats, isLoading: consentLoading } = useQuery({
    queryKey: ['consent-stats'],
    queryFn: () => api.getConsentStats(),
    refetchInterval: 30_000,
  });

  const { data: gwHealth } = useQuery({
    queryKey: ['gateway-health'],
    queryFn: () => api.getGatewayHealth(),
    refetchInterval: 15_000,
  });

  const { data: hprStats } = useQuery({
    queryKey: ['hpr-stats'],
    queryFn: () => api.getHprStats(),
    refetchInterval: 60_000,
  });

  const { data: hfrStats } = useQuery({
    queryKey: ['hfr-stats'],
    queryFn: () => api.getHfrStats(),
    refetchInterval: 60_000,
  });

  const consentApprovalRate = consentStats && consentStats.approved !== null && consentStats.sent !== null
    ? Math.round((consentStats.approved / Math.max(consentStats.sent, 1)) * 100)
    : 0;

  const integrationSystems: Array<{ system: string; status: 'OPERATIONAL' | 'DEGRADED'; uptime: string; lastSync: string }> = [
    { system: 'ABHA Number', status: 'OPERATIONAL', uptime: '99.8%', lastSync: abhaStats ? 'Live' : '—' },
    { system: 'Consent Manager', status: 'OPERATIONAL', uptime: '99.5%', lastSync: consentStats ? 'Live' : '—' },
    { system: 'ABDM Gateway', status: gwHealth?.status === 'OPERATIONAL' ? 'OPERATIONAL' : 'DEGRADED', uptime: '—', lastSync: gwHealth?.lastSync ?? '—' },
    { system: 'HPR Registry', status: hprStats?.lastSyncAt ? 'OPERATIONAL' : 'DEGRADED', uptime: '—', lastSync: hprStats?.lastSyncAt ? `${Math.round((Date.now() - new Date(hprStats.lastSyncAt).getTime()) / 60000)} min ago` : 'Not synced' },
    { system: 'HFR Registry', status: hfrStats?.lastSyncAt ? 'OPERATIONAL' : 'DEGRADED', uptime: '—', lastSync: hfrStats?.lastSyncAt ? `${Math.round((Date.now() - new Date(hfrStats.lastSyncAt).getTime()) / 60000)} min ago` : 'Not synced' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <PageHeader title="ABDM Metrics" description="Ayushman Bharat Digital Mission — Integration Overview">
          <Button variant="outline" size="sm" onClick={() => { window.location.reload(); }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </PageHeader>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Fingerprint className="h-5 w-5" />}
          label="Total ABHA Created"
          value={abhaLoading ? '...' : 'See details'}
          trend={{ direction: 'up' as const, value: `${abhaStats?.growthRate ?? 0}%` }}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Today's ABHA"
          value={abhaLoading ? '...' : 'See details'}
          trend={{ direction: 'up' as const, value: '24hr count' }}
        />
        <StatCard
          icon={<FileCheck className="h-5 w-5" />}
          label="Consents Approved"
          value={consentLoading ? '...' : ((consentStats?.approved ?? 0) as number).toLocaleString('en-IN')}
          trend={{ direction: consentApprovalRate > 70 ? 'up' : 'down' as const, value: `${consentApprovalRate}% approval rate` }}
        />
        <StatCard
          icon={<Database className="h-5 w-5" />}
          label="HFR Facilities"
          value={(hfrStats?.total ?? 0) as number}
          trend={{ direction: 'up' as const, value: ((hprStats?.active ?? 0) as number) + ' HPR providers' }}
        />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4 text-[#8FD3D1]" />Daily Activity (This Week)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_DAILY_STATS} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: '#1C2025' }} />
                  <Bar dataKey="abha" fill="#8FD3D1" radius={[4, 4, 0, 0]} maxBarSize={24} name="ABHA Created" />
                  <Bar dataKey="consents" fill="#2EE59D" radius={[4, 4, 0, 0]} maxBarSize={24} name="Consents" />
                  <Bar dataKey="hie" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={24} name="HIE Records" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><FileCheck className="h-4 w-4 text-[#8FD3D1]" />Consent Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {consentLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : (
              <>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-white/60">Approved</span>
                      <span className="font-medium text-[#2EE59D]">{((consentStats?.approved ?? 0) as number).toLocaleString('en-IN')}</span>
                    </div>
                    <Progress value={(consentStats?.approved ?? 0) / Math.max(consentStats?.sent ?? 1, 1) * 100} className="h-2 [&>div]:bg-[#2EE59D]" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-white/60">Pending</span>
                      <span className="font-medium text-[#FFD84D]">{((consentStats?.pending ?? 0) as number).toLocaleString('en-IN')}</span>
                    </div>
                    <Progress value={(consentStats?.pending ?? 0) / Math.max(consentStats?.sent ?? 1, 1) * 100} className="h-2 [&>div]:bg-[#FFD84D]" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-white/60">Rejected</span>
                      <span className="font-medium text-red-500">{((consentStats?.rejected ?? 0) as number).toLocaleString('en-IN')}</span>
                    </div>
                    <Progress value={(consentStats?.rejected ?? 0) / Math.max(consentStats?.sent ?? 1, 1) * 100} className="h-2 [&>div]:bg-red-500" />
                  </div>
                </div>
                <div className="rounded-xl bg-white/[0.04] border border-[rgba(255,255,255,0.08)] p-4 text-center">
                  <p className="text-2xl font-bold text-white">{((consentStats?.sent ?? 0) as number).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-white/50">Total Consent Requests Sent</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Database className="h-4 w-4 text-[#8FD3D1]" />Health Information Exchange Volume (Monthly)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_HIE_VOLUME} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                  <defs><linearGradient id="hieGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: '#1C2025' }} />
                  <Area type="monotone" dataKey="recordsExchanged" stroke="#8b5cf6" fill="url(#hieGrad)" strokeWidth={2} name="Records Exchanged" />
                  <Area type="monotone" dataKey="consentsProcessed" stroke="#8FD3D1" fill="none" strokeWidth={2} name="Consents Processed" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Link2 className="h-4 w-4 text-[#8FD3D1]" />Integration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {integrationSystems.map((s) => (
                <div key={s.system} className="flex items-center justify-between rounded-xl bg-white/[0.04] border border-[rgba(255,255,255,0.08)] px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    {s.status === 'OPERATIONAL' ? <CheckCircle className="h-3.5 w-3.5 text-[#2EE59D]" /> : <XCircle className="h-3.5 w-3.5 text-[#FFD84D]" />}
                    <span className="text-sm text-white/70">{s.system}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={s.status === 'OPERATIONAL' ? 'success' : 'warning'} size="sm">{s.status}</Badge>
                    <span className="text-[10px] text-white/40">{s.lastSync}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
