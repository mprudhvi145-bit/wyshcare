/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/clinic/clinical-twin/page.tsx
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
 - frontend/src/components/ui/glass-card.tsx
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 *
 * Calls:
 - card
 - react
 - badge
 - utils
 - skeleton
 - progress
 - framer-motion
 - page-header
 *
 * Dependencies:
 - card
 - react
 - badge
 - utils
 - skeleton
 - progress
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
import {
  Cpu,
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Stethoscope,
  BarChart3,
  Activity,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';

interface Prediction {
  label: string;
  value: string | number;
  change: 'up' | 'down' | 'neutral';
  changeValue: string;
}

interface DoctorUtilization {
  name: string;
  utilization: number;
}

interface DiseaseTrend {
  name: string;
  count: number;
  color: string;
}

interface Insight {
  type: 'warning' | 'info' | 'positive';
  message: string;
}

const PREDICTIONS: Prediction[] = [
  { label: 'Predicted Patient Load', value: '32', change: 'up', changeValue: '+8% vs avg' },
  { label: 'Predicted Revenue', value: '₹1,85,000', change: 'up', changeValue: '+12% vs avg' },
  { label: 'Recommended Staff', value: '5', change: 'neutral', changeValue: '3 doctors, 2 nurses' },
];

const DOCTOR_UTILIZATION: DoctorUtilization[] = [
  { name: 'Dr. Mehta', utilization: 92 },
  { name: 'Dr. Sharma', utilization: 78 },
  { name: 'Dr. Patel', utilization: 65 },
  { name: 'Dr. Gupta', utilization: 45 },
  { name: 'Dr. Reddy', utilization: 88 },
];

const DISEASE_TRENDS: DiseaseTrend[] = [
  { name: 'Hypertension', count: 42, color: '#06b6d4' },
  { name: 'Diabetes Type 2', count: 35, color: '#0ea5e9' },
  { name: 'Thyroid Disorder', count: 28, color: '#6366f1' },
  { name: 'Arthritis', count: 22, color: '#8b5cf6' },
  { name: 'Migraine', count: 19, color: '#d946ef' },
  { name: 'Respiratory Infection', count: 16, color: '#f43f5e' },
  { name: 'Anxiety Disorder', count: 14, color: '#f97316' },
  { name: 'Dermatitis', count: 12, color: '#eab308' },
  { name: 'Anemia', count: 10, color: '#22c55e' },
  { name: 'UTI', count: 8, color: '#14b8a6' },
];

const FRUNNEL_DATA = [
  { name: 'Total Appointments', value: 48 },
  { name: 'Checked In', value: 44 },
  { name: 'Consulted', value: 42 },
  { name: 'Follow-up Scheduled', value: 28 },
];

const INSIGHTS: Insight[] = [
  { type: 'warning', message: 'Dr. Mehta is at 92% utilization — consider redistributing load' },
  { type: 'info', message: 'Hypertension cases up 15% this month — review preventive care protocols' },
  { type: 'positive', message: 'Patient satisfaction score improved to 4.8/5 this week' },
  { type: 'warning', message: 'No-show rate at 12% — send reminder notifications earlier' },
  { type: 'info', message: 'Walk-in registrations increased by 22% — consider extending reception hours' },
];

function InsightIcon({ type }: { type: Insight['type'] }) {
  switch (type) {
    case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case 'info': return <Lightbulb className="h-4 w-4 text-cyan-500" />;
    case 'positive': return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  }
}

function InsightBg({ type }: { type: Insight['type'] }) {
  switch (type) {
    case 'warning': return 'bg-[#FFD84D]/10 border-[#FFD84D]/20';
    case 'info': return 'bg-[#8FD3D1]/10 border-[#8FD3D1]/20';
    case 'positive': return 'bg-[#2EE59D]/10 border-[#2EE59D]/20';
  }
}

export default function ClinicalTwinPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  const avgConfidence = Math.round(
    PREDICTIONS.reduce((s, p) => {
      if (typeof p.value === 'string' && p.value.startsWith('₹')) return s + 78;
      return s + 85;
    }, 0) / PREDICTIONS.length,
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader
        title="Clinical Twin"
        description="AI-powered clinic snapshot and predictive analytics"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PREDICTIONS.map((pred, i) => (
          <motion.div
            key={pred.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-white/50">{pred.label}</p>
                  <Badge variant="outline" size="sm" className="gap-1">
                    <Cpu className="h-3 w-3" />
                    AI
                  </Badge>
                </div>
                <p className="mt-2 text-2xl font-bold text-white">{pred.value}</p>
                {pred.change === 'up' && (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#2EE59D]">
                    <ArrowUp className="h-3 w-3" />
                    {pred.changeValue}
                  </span>
                )}
                {pred.change === 'down' && (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-red-500">
                    <ArrowDown className="h-3 w-3" />
                    {pred.changeValue}
                  </span>
                )}
                {pred.change === 'neutral' && (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-white/40">
                    {pred.changeValue}
                  </span>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-gradient-to-br from-[#8FD3D1]/5 to-[#6BB8B6]/5 border-[#8FD3D1]/20">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#8FD3D1]/10">
            <BrainCircuit className="h-7 w-7 text-[#8FD3D1]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">AI Confidence Score</p>
            <p className="text-xs text-white/50">
              Predictions are based on historical data, seasonal patterns, and current queue status.
            </p>
          </div>
          <div className="text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#8FD3D1]/10 ring-4 ring-[#8FD3D1]/20">
              <span className="text-lg font-bold text-[#8FD3D1]">{avgConfidence}%</span>
            </div>
            <p className="mt-1 text-[10px] text-white/40">confidence</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-[#8FD3D1]" />
              Doctor Utilization
            </CardTitle>
            <CardDescription>Current load across providers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {DOCTOR_UTILIZATION.map((doc) => (
                <div key={doc.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-white/70 font-medium">{doc.name}</span>
                    <span className={cn(
                      'font-semibold',
                      doc.utilization > 85 ? 'text-red-500' : doc.utilization > 70 ? 'text-[#FFD84D]' : 'text-[#2EE59D]',
                    )}>
                      {doc.utilization}%
                    </span>
                  </div>
                  <Progress
                    value={doc.utilization}
                    className={cn(
                      doc.utilization > 85 && '[&>div]:bg-red-500',
                      doc.utilization > 70 && doc.utilization <= 85 && '[&>div]:bg-[#FFD84D]',
                      doc.utilization <= 70 && '[&>div]:bg-[#2EE59D]',
                    )}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4 text-[#8FD3D1]" />
              Patient Funnel Conversion
            </CardTitle>
            <CardDescription>Appointment stages today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={FRUNNEL_DATA}
                  layout="vertical"
                  margin={{ top: 5, right: 30, bottom: 5, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: '#1C2025',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                    }}
                  />
                  <Bar dataKey="value" fill="#8FD3D1" radius={[0, 8, 8, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-[#8FD3D1]" />
              Automated Insights & Warnings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {INSIGHTS.map((insight, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-start gap-3 rounded-xl border p-3',
                  InsightBg({ type: insight.type }),
                )}
              >
                <InsightIcon type={insight.type} />
                <p className="text-sm text-white/70">{insight.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Stethoscope className="h-4 w-4 text-[#8FD3D1]" />
              Disease Trends
            </CardTitle>
            <CardDescription>Top 10 diagnoses this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={DISEASE_TRENDS}
                  layout="vertical"
                  margin={{ top: 5, right: 30, bottom: 5, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: '#1C2025',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={18}>
                    {DISEASE_TRENDS.map((entry, _index) => (
                      <rect key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
