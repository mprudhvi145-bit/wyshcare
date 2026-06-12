/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/admin/population-health/page.tsx
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
 - lucide-react
 - stat-card
 *
 * Dependencies:
 - react-query
 - card
 - recharts
 - badge
 - skeleton
 - api-client
 - lucide-react
 - stat-card
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
import { Users, Activity, Ban, Brain, Heart } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api-client';

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#f97316'];
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

function PieChartCard({ title, data }: { title: string; data: { name: string; value: number }[] }) {
  return (
    <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
      <CardHeader><CardTitle className="text-sm text-white/90">{title}</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={(e: any) => `${e.name}: ${e.value}`} fill="#e2e8f0">
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1C2025', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff' }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default function PopulationHealthPage() {
  const { data: ls, isLoading: loading } = useQuery({ queryKey: ['lifestyle-stats'], queryFn: () => api.getLifestyleStats() });
  const { data: ss } = useQuery({ queryKey: ['symptom-stats'], queryFn: () => api.getSymptomStats() });
  const { data: ws } = useQuery({ queryKey: ['wearable-stats'], queryFn: () => api.getWearableStats() });

  const activityData = ls?.activityDistribution ? Object.entries(ls.activityDistribution).map(([k, v]) => ({ name: k, value: v as number })) : [];
  const smokingData = ls?.smokingDistribution ? Object.entries(ls.smokingDistribution).map(([k, v]) => ({ name: k, value: v as number })) : [];
  const stressData = ls?.stressDistribution ? Object.entries(ls.stressDistribution).map(([k, v]) => ({ name: k, value: v as number })) : [];

  if (loading) {
    return (
      <div className="space-y-6 bg-[#0B0D10] min-h-screen p-6">
        <PageHeader title="Population Health" description="Aggregated health insights" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl bg-white/5" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-3"><Skeleton className="h-64 rounded-xl bg-white/5" /><Skeleton className="h-64 rounded-xl bg-white/5" /><Skeleton className="h-64 rounded-xl bg-white/5" /></div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
      <motion.div variants={item}>
        <PageHeader title="Population Health" description="Aggregated health insights across all users" />
      </motion.div>

      <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Users" value={((ls?.totalProfiles as number) ?? 0)} />
        <StatCard icon={<Activity className="h-5 w-5" />} label="Avg Activity" value={((ls?.avgActivityLevel as string) ?? '—')} />
        <StatCard icon={<Ban className="h-5 w-5" />} label="Smoking Rate" value={ls?.smokingRate != null ? `${((ls.smokingRate as number) * 100).toFixed(1)}%` : '—'} />
        <StatCard icon={<Brain className="h-5 w-5" />} label="Avg Stress" value={((ls?.avgStressLevel as string) ?? '—')} />
      </motion.div>

      <motion.div variants={item} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activityData.length > 0 && <PieChartCard title="Activity Distribution" data={activityData} />}
        {smokingData.length > 0 && <PieChartCard title="Smoking Distribution" data={smokingData} />}
        {stressData.length > 0 && <PieChartCard title="Stress Distribution" data={stressData} />}
      </motion.div>

      {(ss?.topSymptoms as any[])?.length > 0 ? (
        <motion.div variants={item}>
          <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base text-white/90"><Heart className="h-4 w-4 text-[#8FD3D1]" />Top Symptoms</CardTitle></CardHeader>
            <CardContent>
              <div className="divide-y divide-white/5">
                {(ss?.topSymptoms as any[])?.map((s: any) => (
                  <div key={s.symptom} className="flex items-center justify-between py-2">
                    <span className="text-sm text-white/90">{s.symptom}</span>
                    <Badge variant="secondary" size="sm">{s.count} reports</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : null}

      {(ws?.bySource as any[])?.length > 0 ? (
        <motion.div variants={item}>
          <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base text-white/90"><Activity className="h-4 w-4 text-[#8FD3D1]" />Wearable Sources</CardTitle></CardHeader>
            <CardContent>
              <div className="divide-y divide-white/5">
                {(ws?.bySource as any[])?.map((s: any) => (
                  <div key={s.source} className="flex items-center justify-between py-2">
                    <span className="text-sm text-white/90">{s.source.replace(/_/g, ' ')}</span>
                    <Badge variant="outline" size="sm">{s.count} metrics</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
