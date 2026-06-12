/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/timeline/insights-panel.tsx
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
 * React component: insights-panel
 *
 * Responsibilities:
 * - Render UI components for Frontend
 * - Handle user interactions and state management
 *
 * Used By:
 - frontend/src/app/doctor/emr/dermatology/page.tsx
 - frontend/src/components/ui/glass-card.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 - frontend/src/components/ui/progress.tsx
 - frontend/src/components/marketing/health-twin-demo.tsx
 *
 * Calls:
 - utils
 - lucide-react
 *
 * Dependencies:
 - utils
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

import { TrendingUp, TrendingDown, Activity, Heart, Droplets, Weight, Brain, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TrendDataPoint, RiskCategory, ScoreHistoryPoint } from './types';

interface InsightsPanelProps {
  trends: TrendDataPoint[];
  risks: RiskCategory[];
  scoreHistory: ScoreHistoryPoint[];
  recommendations: string[];
}

function Sparkline({ data, color, trend }: { data: number[]; color: string; trend: 'up' | 'down' | 'stable' }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  const fillPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg width={w} height={h} className="shrink-0">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points={fillPoints} fill={`url(#grad-${color.replace('#', '')})`} />
    </svg>
  );
}

const TREND_ICONS: Record<string, typeof Activity> = {
  blood_pressure: Heart, weight: Weight, heart_rate: Activity, glucose: Droplets,
};

export function InsightsPanel({ trends, risks, scoreHistory, recommendations }: InsightsPanelProps) {
  const latestScore = scoreHistory[scoreHistory.length - 1];
  const earliestScore = scoreHistory[0];
  const scoreChange = latestScore && earliestScore ? latestScore.score - earliestScore.score : 0;

  return (
    <div className="w-[320px] shrink-0 flex flex-col gap-4">
      {/* Health Trends */}
      <div className="rounded-[20px] p-5 border" style={{ background: '#1A1D21', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-text-on-dark-secondary" />
          <span className="text-xs font-semibold text-text-on-dark font-display">Health Trends</span>
        </div>
        <div className="space-y-4">
          {trends.map((t) => {
            const Icon = TREND_ICONS[t.label.toLowerCase().replace(' ', '_')] ?? Activity;
            const trendColor = t.trend === 'up' && ['blood_pressure', 'glucose'].includes(t.label.toLowerCase().replace(' ', '_'))
              ? '#FF453A'
              : t.trend === 'up'
                ? '#2EE59D'
                : t.trend === 'down' && ['blood_pressure', 'glucose'].includes(t.label.toLowerCase().replace(' ', '_'))
                  ? '#2EE59D'
                  : '#FF453A';
            return (
              <div key={t.label} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
                  <Icon className="h-3.5 w-3.5 text-text-on-dark-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-text-on-dark-secondary font-ui">{t.label}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-bold text-text-on-dark font-display">{t.value}</span>
                      <span className="text-[9px] text-text-on-dark-tertiary">{t.unit}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <div className="flex items-center gap-1">
                      {t.trend === 'up' ? <TrendingUp className="h-3 w-3" style={{ color: trendColor }} /> : <TrendingDown className="h-3 w-3" style={{ color: trendColor }} />}
                      <span className="text-[8px] font-medium" style={{ color: trendColor }}>{t.trend === 'up' ? '+2.3%' : '-1.1%'}</span>
                    </div>
                    <Sparkline data={t.data} color="#8FD3D1" trend={t.trend} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Risk Tracker */}
      <div className="rounded-[20px] p-5 border" style={{ background: '#1A1D21', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-4 w-4 text-text-on-dark-secondary" />
          <span className="text-xs font-semibold text-text-on-dark font-display">Risk Tracker</span>
        </div>
        <div className="space-y-3">
          {risks.map((r) => (
            <div key={r.name} className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-text-on-dark font-ui">{r.name}</span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-[9px] font-bold font-ui',
                  r.level === 'low'
                    ? 'bg-[#2EE59D]/10 text-[#2EE59D]'
                    : r.level === 'moderate'
                      ? 'bg-[#FF9F0A]/10 text-[#FF9F0A]'
                      : 'bg-[#FF453A]/10 text-[#FF453A]',
                )}
              >
                {r.level.charAt(0).toUpperCase() + r.level.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Health Score History */}
      <div className="rounded-[20px] p-5 border" style={{ background: '#1A1D21', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-text-on-dark-secondary" />
            <span className="text-xs font-semibold text-text-on-dark font-display">Score History</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-text-on-dark font-display">{latestScore?.score ?? 0}</span>
            {scoreChange !== 0 && (
              <span className={cn('text-[9px] font-medium', scoreChange > 0 ? 'text-[#2EE59D]' : 'text-[#FF453A]')}>
                {scoreChange > 0 ? '+' : ''}{scoreChange}
              </span>
            )}
          </div>
        </div>
        {/* Mini line chart */}
        <div className="relative h-16">
          <svg width="100%" height="100%" viewBox="0 0 260 64" preserveAspectRatio="none">
            <defs>
              <linearGradient id="score-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8FD3D1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#8FD3D1" stopOpacity="0" />
              </linearGradient>
            </defs>
            {scoreHistory.length > 1 && (() => {
              const vals = scoreHistory.map(s => s.score);
              const min = Math.min(...vals) - 5;
              const max = Math.max(...vals) + 5;
              const range = max - min || 1;
              const w = 260;
              const h = 64;
              const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
              const fillPts = `0,${h} ${pts} ${w},${h}`;
              return (
                <>
                  <polygon points={fillPts} fill="url(#score-grad)" />
                  <polyline points={pts} fill="none" stroke="#8FD3D1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  {scoreHistory.map((s, i) => (
                    <circle
                      key={s.year} cx={(i / (scoreHistory.length - 1)) * w} cy={h - ((s.score - min) / range) * h}
                      r="3" fill="#1A1D21" stroke="#8FD3D1" strokeWidth="2"
                    />
                  ))}
                </>
              );
            })()}
          </svg>
          {/* X-axis labels */}
          <div className="flex justify-between mt-1 px-0.5">
            {scoreHistory.map((s) => (
              <span key={s.year} className="text-[8px] text-text-on-dark-tertiary font-ui">{s.year}</span>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="rounded-[20px] p-5 border" style={{ background: '#1A1D21', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-text-on-dark-secondary" />
          <span className="text-xs font-semibold text-text-on-dark font-display">Recommendations</span>
        </div>
        <div className="space-y-2.5">
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: 'rgba(143,211,209,0.1)' }}>
                <span className="text-[8px] font-bold" style={{ color: '#8FD3D1' }}>{i + 1}</span>
              </div>
              <p className="text-[11px] text-text-on-dark leading-relaxed font-ui">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
