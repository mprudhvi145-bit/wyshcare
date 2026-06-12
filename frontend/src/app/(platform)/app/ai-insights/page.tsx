/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(platform)/app/ai-insights/page.tsx
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
 - utils
 - skeleton
 - react
 *
 * Dependencies:
 - utils
 - skeleton
 - react
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

import { useState, useMemo } from 'react';
import {
  Activity, Apple, ArrowRight, Brain, Calendar, ChevronRight, Clock,
  Droplets, Eye, FileText, Fingerprint, Flame, Footprints, HeartPulse,
  Lightbulb, Moon, Plus, Shield, Sparkles, Target, Thermometer,
  TrendingUp, TriangleAlert, Trophy, Users, Zap, Download,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useHealthScore, useHealthScoreHistory, useRiskPredictions,
  usePreventiveRecommendations, useLifestyleMetrics, useAiRecommendations,
  useGoals,
} from '@/hooks/use-health-data';
import type { Goal, RiskPrediction } from '@/types';
import { cn } from '@/lib/utils';

const theme = {
  bg: { primary: '#0B0D10', secondary: '#15181D', tertiary: '#1C2025' },
  accent: { primary: '#8FD3D1', success: '#2EE59D', warning: '#FFD84D', danger: '#FF5A5A' },
} as const;

const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';
const glassCardCompact = 'rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02]';

const priorityColors: Record<string, string> = {
  HIGH: 'text-[#FF5A5A] bg-[#FF5A5A]/10 border-[#FF5A5A]/20',
  MEDIUM: 'text-[#FFD84D] bg-[#FFD84D]/10 border-[#FFD84D]/20',
  LOW: 'text-[#8FD3D1] bg-[#8FD3D1]/10 border-[#8FD3D1]/20',
};

const severityMap = (s?: string): 'HIGH' | 'MEDIUM' | 'LOW' => {
  if (!s) return 'LOW';
  const up = s.toUpperCase();
  if (['HIGH', 'CRITICAL', 'SEVERE'].includes(up)) return 'HIGH';
  if (['MEDIUM', 'MODERATE'].includes(up)) return 'MEDIUM';
  return 'LOW';
};

const factorIcons: Record<string, any> = {
  physical: HeartPulse, sleep: Moon, activity: Footprints,
  nutrition: Apple, mental: Brain, preventive: Shield,
  fitness: Flame, steps: Footprints, water: Droplets, exercise: Flame,
  general: Activity,
};

const factorColors: Record<string, string> = {
  physical: '#34C759', sleep: '#5856D6', activity: '#007AFF',
  nutrition: '#FF9500', mental: '#AF52DE', preventive: '#FF2D55',
  fitness: '#FF9500', steps: '#34C759', water: '#007AFF', exercise: '#FF9500',
  general: '#5856D6',
};

function getFactorIcon(cat: string) { return factorIcons[cat.toLowerCase()] || Activity; }
function getFactorColor(cat: string) { return factorColors[cat.toLowerCase()] || '#5856D6'; }

function ProgressBar({ value, max = 100, color = '#8FD3D1', label, size = 'sm' }: {
  value: number; max?: number; color?: string; label?: string; size?: 'sm' | 'lg'
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/50 font-ui">{label}</span>
          <span className="text-xs font-medium text-white/70 font-ui">{value}{max > 1 ? `/${max}` : ''}</span>
        </div>
      )}
      <div className={`${size === 'lg' ? 'h-2.5' : 'h-1.5'} rounded-full bg-white/[0.06] overflow-hidden`}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function CircularScore({ score, size = 120, strokeWidth = 10 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;
  const color = score >= 80 ? '#2EE59D' : score >= 60 ? '#8FD3D1' : score >= 40 ? '#FFD84D' : '#FF5A5A';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle cx={center} cy={center} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ filter: `drop-shadow(0 0 8px ${color}44)`, transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold tracking-tight text-white font-display">{score}</span>
        <span className="text-[10px] font-medium tracking-wider text-white/40 font-ui uppercase">Score</span>
      </div>
    </div>
  );
}

function MetricRing({ label, value, max, color = '#8FD3D1', unit }: {
  label: string; value: number; max: number; color?: string; unit?: string
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex items-center justify-center" style={{ width: 56, height: 56 }}>
        <svg width={56} height={56} className="-rotate-90 absolute">
          <circle cx={28} cy={28} r={22} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
          <circle cx={28} cy={28} r={22} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeDasharray={138.23} strokeDashoffset={138.23 - (pct / 100) * 138.23} style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <span className="text-sm font-bold text-white font-display">{value}</span>
      </div>
      <span className="text-[10px] text-white/40 font-ui text-center">{label}{unit ? ` ${unit}` : ''}</span>
    </div>
  );
}

function TabButton({ active, label, icon: Icon, onClick }: {
  active: boolean; label: string; icon: any; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 rounded-[14px] text-sm font-medium font-ui transition-all whitespace-nowrap',
        active
          ? 'bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20'
          : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03] border border-transparent'
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] mb-4">
        <Icon className="h-6 w-6 text-white/30" />
      </div>
      <h4 className="text-sm font-medium text-white/60 font-ui mb-1">{title}</h4>
      <p className="text-xs text-white/30 max-w-sm font-ui">{description}</p>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────

function OverviewTab({ timeRange }: { timeRange: string }) {
  const { data: scoreData, isLoading: scoreLoading } = useHealthScore();
  const { data: historyData } = useHealthScoreHistory();
  const { data: risks } = useRiskPredictions();
  const { data: preventives } = usePreventiveRecommendations();

  const factors = useMemo(() => {
    const raw = scoreData?.factors;
    return Array.isArray(raw) ? raw : [];
  }, [scoreData]);

  const rawHistory = useMemo(() =>
    (historyData?.history ?? []).slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [historyData]
  );

  const trendChange = rawHistory.length >= 2
    ? (rawHistory.at(-1)!.score - rawHistory.at(-2)!.score) : null;

  const topRisks = (risks?.risks ?? []).slice(0, 2);
  const pendingPreventives = (preventives ?? []).filter(p => p.status === 'PENDING').slice(0, 3);

  if (scoreLoading) {
    return (
      <div className="space-y-6">
        <div className={cn(glassCard, 'p-6')}>
          <Skeleton className="h-6 w-48 mb-6 bg-white/[0.04]" />
          <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr] items-center">
            <div className="flex justify-center"><Skeleton className="rounded-full w-32 h-32 bg-white/[0.04]" /></div>
            <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-4 w-full bg-white/[0.04]" />)}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={cn(glassCard, 'p-6')}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white font-display">Wysh Health Score</h3>
            <p className="text-sm text-white/50 font-ui">{scoreData?.label || 'Composite wellness indicator'}</p>
          </div>
          {trendChange !== null && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${trendChange >= 0 ? 'bg-[#2EE59D]/10 border-[#2EE59D]/20' : 'bg-[#FF5A5A]/10 border-[#FF5A5A]/20'}`}>
              <TrendingUp className={`h-3.5 w-3.5 ${trendChange >= 0 ? 'text-[#2EE59D]' : 'text-[#FF5A5A]'}`} style={{ transform: trendChange < 0 ? 'rotate(180deg)' : undefined }} />
              <span className={`text-xs font-medium ${trendChange >= 0 ? 'text-[#2EE59D]' : 'text-[#FF5A5A]'}`}>{trendChange >= 0 ? '+' : ''}{trendChange} pts this {timeRange.toLowerCase()}</span>
            </div>
          )}
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr] items-center">
          <div className="flex justify-center"><CircularScore score={scoreData?.score ?? 0} size={140} strokeWidth={12} /></div>
          <div className="space-y-3">
            {factors.length > 0 ? factors.map((item) => (
              <ProgressBar key={item.name} label={item.name} value={item.impact} max={100} color={getFactorColor(item.category)} />
            )) : (
              <p className="text-xs text-white/30 font-ui">Factors will appear once sufficient health data is available.</p>
            )}
          </div>
        </div>
      </div>

      {topRisks.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-white/70 font-display mb-3">Top Health Priorities</h4>
          <div className="grid grid-cols-2 gap-4">
            {topRisks.map((risk, i) => (
              <div key={i} className={cn(glassCardCompact, 'p-5')}>
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-semibold text-white font-display">{risk.condition}</h5>
                  <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', priorityColors[severityMap(risk.severity)])}>{risk.severity}</span>
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-2xl font-bold text-white font-display">{Math.round(risk.probability * 100)}%</span>
                  <span className="text-[11px] text-white/40 font-ui">risk score</span>
                </div>
                <div className="relative h-2 rounded-full bg-white/[0.06] mb-3">
                  <div className="h-2 rounded-full" style={{ width: `${Math.round(risk.probability * 100)}%`, backgroundColor: risk.severity === 'HIGH' ? '#FF5A5A' : risk.severity === 'MEDIUM' ? '#FFD84D' : '#2EE59D' }} />
                </div>
                <div className="space-y-1">
                  {risk.factors.slice(0, 3).map((f, j) => (
                    <div key={j} className="flex items-center gap-2 text-[11px] text-white/50 font-ui">
                      <div className="h-1 w-1 rounded-full bg-white/20" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingPreventives.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-white/70 font-display mb-3">Upcoming Preventive Care</h4>
          <div className="grid grid-cols-3 gap-4">
            {pendingPreventives.map((item, i) => (
              <div key={item.id || i} className={cn(glassCardCompact, 'p-4')}>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-[#8FD3D1]" />
                  <span className="text-sm font-medium text-white font-ui">{item.title}</span>
                </div>
                {item.dueDate && (
                  <div className="flex items-center gap-1.5 text-[11px] text-white/40 font-ui mb-3">
                    <Clock className="h-3 w-3" />
                    Due {new Date(item.dueDate).toLocaleDateString()}
                  </div>
                )}
                <button className="flex items-center gap-1 text-[11px] font-medium text-[#8FD3D1] font-ui hover:underline">
                  Schedule Now
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!topRisks.length && !pendingPreventives.length && (
        <EmptyState icon={Sparkles} title="Your health overview" description="Health scores, risk assessments, and preventive care recommendations will appear here as data becomes available." />
      )}
    </div>
  );
}

// ── Risk Assessment Tab ───────────────────────────────────────────────

function RiskAssessmentTab() {
  const { data, isLoading } = useRiskPredictions();

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-[24px] bg-white/[0.04]" />)}</div>;
  }

  const risks = data?.risks ?? [];

  if (!risks.length) {
    return <EmptyState icon={TriangleAlert} title="No risk predictions" description="Risk assessments will appear once enough health data is available." />;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        {risks.map((risk, i) => (
          <div key={i} className={cn(glassCardCompact, 'p-5')}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white font-display">{risk.condition}</h4>
              <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', priorityColors[severityMap(risk.severity)])}>
                {risk.severity}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-3xl font-bold text-white font-display">{Math.round(risk.probability * 100)}%</span>
              <span className="text-[11px] text-white/40 font-ui">probability</span>
            </div>
            <div className="relative h-2.5 rounded-full bg-white/[0.06] mb-3">
              <div className="h-2.5 rounded-full transition-all duration-500" style={{
                width: `${Math.round(risk.probability * 100)}%`,
                backgroundColor: risk.severity === 'HIGH' ? '#FF5A5A' : risk.severity === 'MEDIUM' ? '#FFD84D' : '#2EE59D',
              }} />
            </div>
            <div className="flex items-center gap-2 mb-3 text-[11px] text-white/50 font-ui">
              <TrendingUp className={cn('h-3.5 w-3.5', risk.trend === 'decreasing' && 'rotate-180')} />
              <span>Trend: {risk.trend}</span>
            </div>
            {risk.factors.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-white/30 font-ui tracking-wider uppercase mb-1.5">Contributors</p>
                <div className="flex flex-wrap gap-1">
                  {risk.factors.map((f, j) => (
                    <span key={j} className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[10px] text-white/50 font-ui">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={cn(glassCardCompact, 'p-5')}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-white font-display">Risk Trend</h4>
          <span className="text-[11px] text-white/30 font-ui">Last 12 Months</span>
        </div>
        <div className="flex items-center gap-6">
          {['stable', 'increasing', 'decreasing'].map(trend => {
            const count = risks.filter(r => r.trend === trend).length;
            return (
              <div key={trend} className="flex items-center gap-2">
                <div className={cn('h-2.5 w-2.5 rounded-full', trend === 'increasing' ? 'bg-[#FF5A5A]' : trend === 'decreasing' ? 'bg-[#2EE59D]' : 'bg-[#FFD84D]')} />
                <span className="text-xs text-white/50 font-ui capitalize">{trend} ({count})</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Preventive Care Tab ───────────────────────────────────────────────

function PreventiveCareTab() {
  const { data, isLoading } = usePreventiveRecommendations();

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-[24px] bg-white/[0.04]" />)}</div>;
  }

  const items = data ?? [];

  if (!items.length) {
    return <EmptyState icon={Shield} title="No preventive care recommendations" description="Preventive care schedule will appear based on your health profile and guidelines." />;
  }

  const statusColors: Record<string, string> = {
    PENDING: 'text-[#FFD84D] bg-[#FFD84D]/10 border-[#FFD84D]/20',
    COMPLETED: 'text-[#2EE59D] bg-[#2EE59D]/10 border-[#2EE59D]/20',
    OVERDUE: 'text-[#FF5A5A] bg-[#FF5A5A]/10 border-[#FF5A5A]/20',
    DISMISSED: 'text-white/30 bg-white/[0.04] border-white/[0.06]',
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {items.map((item, i) => (
        <div key={item.id || i} className={cn(glassCardCompact, 'p-5')}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold text-white font-display">{item.title}</h4>
              <span className="text-[11px] text-white/40 font-ui">{item.category}</span>
            </div>
            <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', statusColors[item.status] || statusColors.PENDING)}>
              {item.status}
            </span>
          </div>
          <p className="text-xs text-white/50 font-ui mb-3 leading-relaxed">{item.description}</p>
          {item.dueDate && (
            <div className="flex items-center gap-1.5 text-[11px] text-white/40 font-ui mb-3">
              <Clock className="h-3 w-3" />
              Due {new Date(item.dueDate).toLocaleDateString()}
            </div>
          )}
          {item.status === 'COMPLETED' ? (
            <div className="flex items-center gap-1.5 text-[11px] text-[#2EE59D] font-ui">
              <span>✓ Completed</span>
            </div>
          ) : (
            <button className="flex items-center gap-1.5 rounded-[12px] bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20 px-3 py-1.5 text-[11px] font-medium font-ui hover:bg-[#8FD3D1]/20 transition-all">
              <Calendar className="h-3 w-3" />
              Schedule Appointment
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Lifestyle Factors Tab ─────────────────────────────────────────────

function LifestyleFactorsTab() {
  const { data, isLoading } = useLifestyleMetrics();

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-[24px] bg-white/[0.04]" />)}</div>;
  }

  const metrics = data?.metrics ?? [];

  if (!metrics.length) {
    return <EmptyState icon={Zap} title="No lifestyle data" description="Connect a wearable device or log activities to see lifestyle metrics." />;
  }

  const metricConfig: Record<string, { icon: any; color: string; label: string; unit: string }> = {
    steps: { icon: Footprints, color: '#2EE59D', label: 'Daily Steps', unit: 'steps' },
    sleep: { icon: Moon, color: '#5856D6', label: 'Sleep', unit: 'hours' },
    water: { icon: Droplets, color: '#007AFF', label: 'Water Intake', unit: 'ml' },
    exercise: { icon: Flame, color: '#FF9500', label: 'Exercise', unit: 'min/week' },
  };

  const score = data?.score ?? 0;

  return (
    <div className="space-y-5">
      <div className={cn(glassCardCompact, 'p-5')}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-white font-display">Daily Metrics</h4>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/40 font-ui">Lifestyle Score</span>
            <span className="text-sm font-bold text-white font-display">{Math.round(score)}%</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {metrics.map((m, i) => {
            const cfg = metricConfig[m.category] || { icon: Activity, color: '#8FD3D1', label: m.category, unit: m.unit };
            const Icon = cfg.icon;
            const pct = m.target > 0 ? Math.min((m.value / m.target) * 100, 100) : 0;
            return (
              <div key={i} className={cn(glassCardCompact, 'p-4 flex flex-col items-center')}>
                <MetricRing label={cfg.label} value={Math.round(m.value)} max={m.target} color={pct >= 80 ? '#2EE59D' : pct >= 50 ? '#FFD84D' : '#FF5A5A'} unit={cfg.unit} />
                <div className="w-full mt-2">
                  <div className="h-1 rounded-full bg-white/[0.06]">
                    <div className="h-1 rounded-full" style={{ width: `${pct}%`, backgroundColor: pct >= 80 ? '#2EE59D' : pct >= 50 ? '#FFD84D' : '#FF5A5A' }} />
                  </div>
                </div>
                <span className="text-[9px] text-white/30 font-ui mt-1">{Math.round(m.value)}/{Math.round(m.target)} {cfg.unit}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className={cn(glassCardCompact, 'p-5')}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-white font-display">Connected Devices</h4>
          <span className="text-[11px] text-white/30 font-ui">Apple Health</span>
        </div>
        <div className="flex items-center gap-3 rounded-[16px] bg-[#2EE59D]/8 border border-[#2EE59D]/12 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05]">
            <Activity className="h-5 w-5 text-[#2EE59D]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white font-ui">Apple Watch</span>
              <span className="text-[10px] font-medium text-[#2EE59D] font-ui">Connected</span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-[10px] text-white/40 font-ui">
              <span>Steps: {metrics.find(m => m.category === 'steps')?.value || '—'}</span>
              <span>HR: 72</span>
              <span>Sleep: {metrics.find(m => m.category === 'sleep')?.value || '—'}h</span>
            </div>
          </div>
        </div>
      </div>

      <div className={cn(glassCardCompact, 'p-5')}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-white font-display">Lifestyle Impact Simulation</h4>
          <Sparkles className="h-4 w-4 text-[#8FD3D1]" />
        </div>
        <div className="rounded-[16px] bg-gradient-to-br from-[#8FD3D1]/5 to-transparent border border-[#8FD3D1]/10 p-4">
          <p className="text-xs text-white/60 font-ui mb-2">If Daily Steps Increase: <span className="text-white font-medium">6,500 → 9,000</span></p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between text-[11px] text-white/50 font-ui mb-1">
                <span>Predicted Health Score</span>
                <span className="text-[#2EE59D] font-semibold">78 → 84</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06]">
                <div className="h-2 rounded-full bg-[#2EE59D]" style={{ width: '84%' }} />
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-[#2EE59D]" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Health Goals Tab ──────────────────────────────────────────────────

function HealthGoalsTab() {
  const { data: goals, isLoading } = useGoals();

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-[24px] bg-white/[0.04]" />)}</div>;
  }

  const items = goals ?? [];

  if (!items.length) {
    return <EmptyState icon={Trophy} title="No health goals" description="Set health goals to track progress and receive AI-powered coaching." />;
  }

  const activeGoals = items.filter(g => g.status === 'ACTIVE');
  const goalColors: Record<string, string> = {
    fitness: '#2EE59D', nutrition: '#FF9500', mental: '#5856D6',
    sleep: '#007AFF', general: '#8FD3D1',
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        {activeGoals.slice(0, 4).map((goal, i) => {
          const color = goalColors[goal.category] || '#8FD3D1';
          return (
            <div key={goal.id || i} className={cn(glassCardCompact, 'p-5')}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[10px]" style={{ backgroundColor: `${color}15` }}>
                    <Target className="h-4 w-4" style={{ color }} />
                  </div>
                  <h4 className="text-sm font-semibold text-white font-display">{goal.title}</h4>
                </div>
              </div>
              {goal.description && <p className="text-xs text-white/50 font-ui mb-3">{goal.description}</p>}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-white/50 font-ui">Progress</span>
                  <span className="text-white font-medium">{Math.round(goal.progress)}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06]">
                  <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(goal.progress, 100)}%`, backgroundColor: color }} />
                </div>
              </div>
              {goal.milestones && goal.milestones.length > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  {goal.milestones.filter(m => m.completed).length > 0 && (
                    <span className="text-[10px] text-[#2EE59D] font-ui">{goal.milestones.filter(m => m.completed).length} achievements</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activeGoals.length > 0 && (
        <div className={cn(glassCardCompact, 'p-5 bg-gradient-to-br from-[#8FD3D1]/5 to-transparent border-[#8FD3D1]/10')}>
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-[#8FD3D1]" />
            <h4 className="text-sm font-semibold text-white font-display">AI Goal Coach</h4>
          </div>
          <p className="text-sm text-white/60 font-ui leading-relaxed">
            Based on your current progress, you are on track to reach your targets{' '}
            <span className="text-[#2EE59D] font-semibold">17 days early</span>.
            Consistent progress on <span className="text-white/80">{activeGoals[0]?.title || 'your goals'}</span> is driving the most improvement.
          </p>
        </div>
      )}
    </div>
  );
}

// ── AI Recommendations Tab ────────────────────────────────────────────

function AIRecommendationsTab() {
  const { data: aiRecs, isLoading } = useAiRecommendations();

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-[24px] bg-white/[0.04]" />)}</div>;
  }

  const recs = aiRecs ?? [];

  if (!recs.length) {
    return <EmptyState icon={Brain} title="No AI recommendations" description="AI-powered health recommendations will appear as your health data grows." />;
  }

  const priorityColorsMap: Record<string, string> = {
    high: '#FF5A5A',
    medium: '#FFD84D',
    low: '#8FD3D1',
  };

  const mockActions: Record<string, string[]> = {
    sleep: ['Sleep by 10:30 PM', 'Avoid screens 1 hour before bed', 'Magnesium supplement'],
    nutrition: ['20-30g protein at breakfast', 'Include protein in each meal', 'Choose plant protein sources'],
    fitness: ['150 mins moderate exercise/week', 'Strength training 2x/week', 'Daily 30-min walk'],
    stress: ['Meditation 10 min/day', 'Regular exercise', 'Professional counseling if needed'],
    general: ['Track daily progress', 'Set weekly targets', 'Review monthly with your doctor'],
  };

  return (
    <div className="space-y-4">
      {recs.map((rec, i) => {
        const color = priorityColorsMap[rec.priority] || '#8FD3D1';
        const actions = mockActions[rec.type] ?? mockActions.general ?? [];
        return (
          <div key={rec.id || i} className={cn(glassCardCompact, 'p-5 border-l-4')} style={{ borderLeftColor: color }}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="h-4 w-4" style={{ color }} />
                  <h4 className="text-sm font-semibold text-white font-display">{rec.title}</h4>
                </div>
                <p className="text-xs text-white/50 font-ui">{rec.description}</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 py-1">
                <Brain className="h-3 w-3 text-[#8FD3D1]" />
                <span className="text-[10px] font-medium text-[#8FD3D1] font-ui">AI</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-3 mb-3">
              <span className="text-[10px] font-semibold text-white/40 font-ui uppercase">AI Confidence</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/[0.06]" style={{ maxWidth: 120 }}>
                <div className="h-1.5 rounded-full" style={{ width: `${85 - i * 5}%`, backgroundColor: color }} />
              </div>
              <span className="text-[11px] font-medium text-white/70 font-ui">{85 - i * 5}%</span>
            </div>

            <div className="rounded-[14px] bg-white/[0.03] border border-[rgba(255,255,255,0.06)] p-3 mb-3">
              <p className="text-[10px] font-semibold text-white/30 font-ui tracking-wider uppercase mb-1.5">Actions</p>
              <div className="grid grid-cols-2 gap-1.5">
                {actions.slice(0, 3).map((a, j) => (
                  <div key={j} className="flex items-center gap-1.5 text-[11px] text-white/60 font-ui">
                    <div className="h-1 w-1 rounded-full bg-white/20 shrink-0" />
                    {a}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 rounded-[10px] bg-[#8FD3D1]/10 text-[#8FD3D1] px-3 py-1.5 text-[10px] font-medium font-ui hover:bg-[#8FD3D1]/20 transition-all">
                <Plus className="h-3 w-3" />
                Add to Goals
              </button>
              <button className="text-[10px] text-white/30 font-ui hover:text-white/50 transition-all">
                Dismiss
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── AI Health Twin ────────────────────────────────────────────────────

function AIHealthTwin() {
  return (
    <div className={cn(glassCard, 'p-6')}>
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-[#8FD3D1]" />
        <h3 className="text-base font-semibold text-white font-display">Your Digital Health Twin</h3>
      </div>
      <div className="grid grid-cols-[1fr_1fr] gap-4">
        <div className="rounded-[20px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-4">
          <h4 className="text-[11px] font-semibold text-white/40 font-ui tracking-wider uppercase mb-3">Current Path</h4>
          <div className="space-y-3">
            {[
              { label: 'Health Score', current: 78, predicted: '74 in 6mo' },
              { label: 'Cardiovascular Risk', current: 'Moderate', predicted: 'Increasing' },
              { label: 'Life Expectancy', current: '—', predicted: 'Baseline' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-white/50 font-ui">{item.label}</span>
                <span className="text-white/70 font-ui">{item.current} <span className="text-white/30">→ {item.predicted}</span></span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[20px] bg-[#2EE59D]/5 border border-[#2EE59D]/10 p-4">
          <h4 className="text-[11px] font-semibold text-[#2EE59D] font-ui tracking-wider uppercase mb-3">Optimized Path</h4>
          <div className="space-y-3">
            {[
              { label: 'Health Score', current: 78, predicted: '86 in 6mo', impact: '+12' },
              { label: 'Cardiovascular Risk', current: 'Moderate', predicted: 'Low', impact: 'Reduced' },
              { label: 'Life Expectancy', current: '—', predicted: '+3.2 years', impact: '+3.2yr' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-white/50 font-ui">{item.label}</span>
                <span className="text-white/70 font-ui">{item.current} <span className="text-[#2EE59D]">→ {item.predicted}</span></span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#2EE59D]/10">
            {['Lose 5kg', 'Increase sleep', 'Reduce stress'].map((action, i) => (
              <span key={i} className="rounded-full bg-[#2EE59D]/10 text-[#2EE59D] px-2.5 py-1 text-[10px] font-medium font-ui">{action}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────

export default function AIHealthInsightsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState<'Week' | 'Month' | 'Year'>('Month');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'risk', label: 'Risk Assessment', icon: TriangleAlert },
    { id: 'preventive', label: 'Preventive Care', icon: Shield },
    { id: 'lifestyle', label: 'Lifestyle Factors', icon: Zap },
    { id: 'goals', label: 'Health Goals', icon: Trophy },
    { id: 'insights', label: 'AI Recommendations', icon: Brain },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0D10' }}>
      <div className="mx-auto" style={{ maxWidth: 1600 }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,0.06)]">
          <div>
            <h1 className="text-xl font-bold text-white font-display">AI Health Insights</h1>
            <p className="text-sm text-white/40 font-ui mt-0.5">Personalized health intelligence powered by AI</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-white/[0.02] p-0.5">
              {(['Week', 'Month', 'Year'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={cn(
                    'px-3 py-1.5 text-[11px] font-medium font-ui rounded-[10px] transition-all',
                    timeRange === r ? 'bg-[#8FD3D1]/10 text-[#8FD3D1]' : 'text-white/40 hover:text-white/60'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/70 font-ui hover:bg-white/[0.06] hover:text-white transition-all">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button className="flex items-center gap-1.5 rounded-[14px] bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20 px-3.5 py-2 text-xs font-medium font-ui hover:bg-[#8FD3D1]/20 transition-all">
              <Eye className="h-3.5 w-3.5" />
              Share
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-6 py-4 overflow-x-auto border-b border-[rgba(255,255,255,0.06)]">
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              label={tab.label}
              icon={tab.icon}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6">
          {activeTab === 'overview' && <OverviewTab timeRange={timeRange} />}
          {activeTab === 'risk' && <RiskAssessmentTab />}
          {activeTab === 'preventive' && <PreventiveCareTab />}
          {activeTab === 'lifestyle' && <LifestyleFactorsTab />}
          {activeTab === 'goals' && <HealthGoalsTab />}
          {activeTab === 'insights' && <AIRecommendationsTab />}

          {/* AI Health Twin (shown at bottom of every tab) */}
          <AIHealthTwin />
        </div>
      </div>
    </div>
  );
}
