/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/admin/provider-graph/page.tsx
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
 - react-query
 - card
 - recharts
 - api-client
 - button
 - stat-card
 - framer-motion
 - page-header
 *
 * Dependencies:
 - react-query
 - card
 - recharts
 - api-client
 - button
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
import { useQuery } from '@tanstack/react-query';
import { Share2, GitBranch, Activity, Award,
  RefreshCw, Star, } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#f97316'];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function ProviderGraphPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['pg-stats'],
    queryFn: () => api.getProviderGraphStats(),
    refetchInterval: 30_000,
  });

  const { data: referralStats } = useQuery({
    queryKey: ['pg-referral-stats'],
    queryFn: () => api.getReferralStats(),
    refetchInterval: 30_000,
  });

  const { data: topProviders } = useQuery({
    queryKey: ['pg-top'],
    queryFn: () => api.getTopProviders({ limit: '10' }),
    refetchInterval: 60_000,
  });

  const typeData = (stats?.byType as any[])?.map((t: any) => ({ name: t.type, value: t.count })) ?? [];

  const referralData = referralStats
    ? [
        { name: 'Pending', value: (referralStats as any).pending },
        { name: 'Accepted', value: (referralStats as any).accepted },
        { name: 'Completed', value: (referralStats as any).completed },
      ]
    : [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
      <motion.div variants={item}>
        <PageHeader title="Provider Graph" description="Healthcare provider network intelligence & referral graph">
          <Button variant="outline" size="sm" onClick={() => { window.location.reload(); }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </PageHeader>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<GitBranch className="h-5 w-5" />} label="Total Nodes" value={isLoading ? '...' : ((stats?.totalNodes as number) ?? 0).toLocaleString('en-IN')} trend={{ direction: 'up', value: 'Provider graph vertices' }} />
        <StatCard icon={<Share2 className="h-5 w-5" />} label="Total Edges" value={isLoading ? '...' : ((stats?.totalEdges as number) ?? 0).toLocaleString('en-IN')} trend={{ direction: 'up', value: 'Provider connections' }} />
        <StatCard icon={<Activity className="h-5 w-5" />} label="Referrals Total" value={(referralStats?.total as number) ?? 0} trend={{ direction: 'up', value: `${(referralStats?.pending as number) ?? 0} pending` }} />
        <StatCard icon={<Award className="h-5 w-5" />} label="Top Providers" value={topProviders?.length ?? 0} trend={{ direction: 'up', value: 'Ranked by overall score' }} />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base text-white/90"><GitBranch className="h-4 w-4 text-[#8FD3D1]" />Nodes by Type</CardTitle></CardHeader>
          <CardContent>
            {typeData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-sm text-white/40">No nodes yet</div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} width={90} />
                    <Tooltip contentStyle={{ backgroundColor: '#1C2025', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff' }} />
                    <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} maxBarSize={20} name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base text-white/90"><Activity className="h-4 w-4 text-[#8FD3D1]" />Referral Status</CardTitle></CardHeader>
          <CardContent>
            {referralData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-sm text-white/40">No referral data</div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={referralData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#e2e8f0" label={(e: any) => `${e.name}: ${e.value}`}>
                      {referralData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1C2025', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base text-white/90"><Star className="h-4 w-4 text-[#8FD3D1]" />Top Ranked Providers</CardTitle></CardHeader>
          <CardContent>
            {!topProviders || topProviders.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-sm text-white/40">No scores calculated yet. Run "Recalculate Scores" to rank providers.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {topProviders.map((p: any, i: number) => (
                  <div key={p.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/50">#{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-white/90">{p.name}</p>
                        <p className="text-[10px] text-white/40">{p.nodeType}{p.speciality ? ` · ${p.speciality}` : ''}{p.city ? ` · ${p.city}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-emerald-400 font-medium">{p.score?.overallScore?.toFixed(1)}</span>
                      <div className="hidden sm:flex items-center gap-2 text-white/40">
                        <span title="Referral">R:{p.score?.referralScore?.toFixed(1)}</span>
                        <span title="Clinical">C:{p.score?.clinicalScore?.toFixed(1)}</span>
                        <span title="Satisfaction">S:{p.score?.satisfactionScore?.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
