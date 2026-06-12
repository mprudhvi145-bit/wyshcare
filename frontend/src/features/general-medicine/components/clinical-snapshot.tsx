/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/features/general-medicine/components/clinical-snapshot.tsx
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
 * React component: clinical-snapshot
 *
 * Responsibilities:
 * - Render UI components for Frontend
 * - Handle user interactions and state management
 *
 * Used By:
 - frontend/src/app/(platform)/app/wallet/page.tsx
 - frontend/src/app/(platform)/app/consent/page.tsx
 - frontend/src/app/admin/page.tsx
 - frontend/src/components/app/notification-bell.tsx
 - frontend/src/app/admin/users/page.tsx
 - frontend/src/app/os/billing/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/os/layout.tsx
 *
 * Calls:
 - react
 - utils
 - lucide-react
 *
 * Dependencies:
 - react
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

import { useState } from 'react';
import { HeartPulse, Activity, Thermometer, Droplets, Scale, BarChart3, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glassCard } from '../types';
import type { PatientChartResponse } from '@/types';

function MetricCard({ icon: Icon, label, value, unit, color = '#8FD3D1', trend }: {
  icon: any; label: string; value: string | number; unit?: string; color?: string; trend?: { dir: 'up' | 'down'; val: string }
}) {
  return (
    <div className="rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02] p-3.5 transition-all duration-200 hover:bg-white/[0.04]">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-[10px]" style={{ backgroundColor: `${color}15` }}>
          <Icon className="h-3.5 w-3.5" style={{ color }} />
        </div>
        <span className="text-[11px] font-medium text-white/50 font-ui tracking-wide">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-white font-display tracking-tight">{value}</span>
        {unit && <span className="text-[11px] text-white/40 font-ui">{unit}</span>}
      </div>
      {trend && (
        <div className={cn('flex items-center gap-1 mt-1 text-[10px] font-medium font-ui', trend.dir === 'up' ? 'text-[#2EE59D]' : 'text-[#FF5A5A]')}>
          <TrendingUp className={cn('h-3 w-3', trend.dir === 'down' && 'rotate-180')} />
          {trend.val}
        </div>
      )}
    </div>
  );
}

export function ClinicalSnapshot({ chart }: { chart: PatientChartResponse }) {
  const [snapshotTab, setSnapshotTab] = useState<'vitals' | 'labs' | 'care-team'>('vitals');
  const conditions = (chart.conditions ?? []) as Array<{ name?: string; status?: string; diagnosisDate?: string; severity?: string }>;
  const medications = (chart.medications ?? []) as Array<{ name?: string; dose?: string; frequency?: string; startDate?: string }>;
  const vitals = (chart.vitals ?? []) as Array<{ type?: string; value?: string | number; unit?: string; recordedAt?: string }>;

  const latestVitals: Record<string, { value: string | number; unit?: string }> = {};
  for (const v of vitals) {
    if (v.type && !latestVitals[v.type]) {
      latestVitals[v.type] = { value: v.value ?? '—', unit: v.unit };
    }
  }

  return (
    <div className={cn(glassCard, 'p-5')}>
      <h3 className="text-base font-semibold text-white font-display mb-4">Clinical Snapshot</h3>
      <div className="grid grid-cols-[1fr_1fr] gap-4">
        <div className="space-y-3">
          <h4 className="text-[11px] font-semibold text-white/40 font-ui tracking-wider uppercase">Active Problems</h4>
          {conditions.length === 0 ? (
            <p className="text-xs text-white/30 font-ui">No active conditions recorded</p>
          ) : (
            conditions.map((c, i) => (
              <div key={i} className="rounded-[16px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white font-ui">{c.name || 'Unnamed'}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-white/40 font-ui">
                  <span>{c.status || 'Active'}</span>
                  {c.diagnosisDate && <><span className="w-1 h-1 rounded-full bg-white/20" />{c.diagnosisDate}</>}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="space-y-3">
          <h4 className="text-[11px] font-semibold text-white/40 font-ui tracking-wider uppercase">Current Medications</h4>
          {medications.length === 0 ? (
            <p className="text-xs text-white/30 font-ui">No medications prescribed</p>
          ) : (
            medications.map((m, i) => (
              <div key={i} className="rounded-[16px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3">
                <p className="text-sm font-medium text-white font-ui">{m.name || 'Unnamed'}</p>
                <div className="flex items-center gap-2 text-[11px] text-white/40 font-ui mt-0.5">
                  <span>{m.dose || '—'}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span>{m.frequency || '—'}</span>
                  {m.startDate && <><span className="w-1 h-1 rounded-full bg-white/20" />Since {m.startDate}</>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center gap-1.5 mb-3">
          {(['vitals', 'labs', 'care-team'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSnapshotTab(tab)}
              className={cn(
                'rounded-[10px] px-3 py-1.5 text-[11px] font-medium font-ui transition-all',
                snapshotTab === tab
                  ? 'bg-[#8FD3D1]/10 text-[#8FD3D1]'
                  : 'text-white/40 hover:text-white/70 bg-white/[0.02]'
              )}
            >
              {tab === 'vitals' ? 'Recent Vitals' : tab === 'labs' ? 'Lab Results' : 'Care Team'}
            </button>
          ))}
        </div>

        {snapshotTab === 'vitals' && (
          <div className="grid grid-cols-6 gap-2.5">
            <MetricCard icon={HeartPulse} label="Blood Pressure" value={latestVitals['blood_pressure']?.value || '—'} unit={latestVitals['blood_pressure']?.unit as string} color="#FF5A5A" />
            <MetricCard icon={Activity} label="Heart Rate" value={latestVitals['heart_rate']?.value || '—'} unit="bpm" color="#8FD3D1" />
            <MetricCard icon={Thermometer} label="Temperature" value={latestVitals['temperature']?.value || '—'} unit="°F" color="#FFD84D" />
            <MetricCard icon={Droplets} label="SpO2" value={latestVitals['spo2']?.value || '—'} unit="%" color="#2EE59D" />
            <MetricCard icon={Scale} label="Weight" value={latestVitals['weight']?.value || '—'} unit="kg" color="#8FD3D1" />
            <MetricCard icon={BarChart3} label="BMI" value={latestVitals['bmi']?.value || '—'} color="#8FD3D1" />
          </div>
        )}

        {snapshotTab === 'labs' && (
          <div className="space-y-2">
            {['HbA1c', 'Glucose', 'LDL', 'HDL', 'CBC'].map(lab => (
              <div key={lab} className="flex items-center justify-between rounded-[14px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] px-4 py-2.5">
                <span className="text-sm text-white/80 font-ui">{lab}</span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-white/[0.05] text-white/40 border border-white/[0.06]">No Data</span>
              </div>
            ))}
          </div>
        )}

        {snapshotTab === 'care-team' && (
          <div className="text-xs text-white/40 font-ui text-center py-4">Care team information will load from patient records.</div>
        )}
      </div>
    </div>
  );
}
