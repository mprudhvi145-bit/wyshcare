/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/admin/risk-analytics/page.tsx
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
import { BarChart3, AlertTriangle, Shield, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api-client';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const LEVEL_COLORS: Record<string, string> = { CRITICAL: '#ef4444', HIGH: '#f97316', MODERATE: '#eab308', LOW: '#22c55e' };

export default function RiskAnalyticsPage() {
  const { data: riskStats, isLoading: riskLoading } = useQuery({ queryKey: ['riskStats'], queryFn: () => api.getRiskStats() });
  const { data: preventionStats, isLoading: prevLoading } = useQuery({ queryKey: ['prevStats'], queryFn: () => api.getPreventionStats() });

  if (riskLoading || prevLoading) {
    return (
      <div className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
        <PageHeader title="Risk Analytics" description="Overview of risk assessments and prevention metrics" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl bg-white/5" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80 rounded-xl bg-white/5" /><Skeleton className="h-80 rounded-xl bg-white/5" />
        </div>
      </div>
    );
  }

  const riskLevelData = riskStats?.byRiskLevel
    ? Object.entries(riskStats.byRiskLevel).map(([level, count]) => ({ name: level, count, fill: LEVEL_COLORS[level] ?? '#6366f1' })) : [];

  const preventionCategoryData = preventionStats?.byCategory
    ? Object.entries(preventionStats.byCategory).map(([category, count]) => ({ name: category, count })) : [];

  const byRisk = (riskStats?.byRiskLevel as Record<string, number>) || {};
  const totalPredictions = (riskStats?.totalPredictions as number) ?? 0;

  return (
    <motion.div className="bg-[#0B0D10] min-h-screen p-6 space-y-6" variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <PageHeader title="Risk Analytics" description="Overview of risk assessments and prevention metrics" />
      </motion.div>

      <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<BarChart3 className="h-5 w-5" />} label="Total Predictions" value={totalPredictions.toLocaleString()} />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Critical" value={byRisk.CRITICAL ?? 0} />
        <StatCard icon={<Shield className="h-5 w-5" />} label="High" value={byRisk.HIGH ?? 0} />
        <StatCard icon={<Activity className="h-5 w-5" />} label="Moderate / Low" value={(byRisk.MODERATE ?? 0) + (byRisk.LOW ?? 0)} />
      </motion.div>

      <motion.div variants={item} className="grid gap-6 md:grid-cols-2">
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader><CardTitle className="flex items-center gap-2 text-white/90"><BarChart3 className="h-5 w-5" />Risk Level Distribution</CardTitle></CardHeader>
          <CardContent>
            {riskLevelData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-sm text-white/40">No risk data</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={riskLevelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#15181D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: 'rgba(255,255,255,0.9)' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {riskLevelData.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader><CardTitle className="flex items-center gap-2 text-white/90"><Activity className="h-5 w-5" />Prevention by Category</CardTitle></CardHeader>
          <CardContent>
            {preventionCategoryData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-sm text-white/40">No prevention data</div>
            ) : (
              <div className="space-y-3">
                {preventionCategoryData.map((c: any) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <span className="text-sm text-white/60">{c.name}</span>
                    <Badge variant="default" size="sm">{c.count}</Badge>
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
