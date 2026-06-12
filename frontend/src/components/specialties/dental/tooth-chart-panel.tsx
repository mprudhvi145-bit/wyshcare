/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/specialties/dental/tooth-chart-panel.tsx
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
 * React component: tooth-chart-panel
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
 - dental-workspace-store
 - lucide-react
 - react
 *
 * Dependencies:
 - utils
 - dental-workspace-store
 - lucide-react
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

import { useCallback } from 'react';
import { Bone, X, Microscope, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDentalWorkspaceStore } from '@/stores/dental-workspace-store';

const accentColor = '#FFD84D';
const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';

const CONDITION_COLORS: Record<string, string> = {
  healthy: '#2EE59D', caries: '#FF5A5A', filling: '#8FD3D1',
  crown: '#FFD84D', missing: '#555', root_canal: '#5856D6',
  implant: '#3498DB', impacted: '#E67E22', watch: '#FFD84D',
};

const CONDITIONS = [
  { value: 'healthy', label: 'Healthy' }, { value: 'caries', label: 'Caries' },
  { value: 'filling', label: 'Filling' }, { value: 'crown', label: 'Crown' },
  { value: 'missing', label: 'Missing' }, { value: 'root_canal', label: 'Root Canal' },
  { value: 'implant', label: 'Implant' }, { value: 'impacted', label: 'Impacted' },
  { value: 'watch', label: 'Watch' },
];

const PROCEDURES = ['Filling', 'Crown', 'Root Canal', 'Extraction', 'Implant', 'Scaling'];

const UPPER_R = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_L = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_R = [48, 47, 46, 45, 44, 43, 42, 41];
const LOWER_L = [31, 32, 33, 34, 35, 36, 37, 38];

function ToothShape({ num, color, selected, isLower, onClick }: {
  num: number; color: string; selected: boolean; isLower?: boolean; onClick: () => void;
}) {
  const path = isLower
    ? 'M6,0 L10,0 L10,6 Q10,12 8,12 L8,18 Q8,24 6,24 L4,24 Q2,24 2,18 L2,12 Q0,12 0,6 L0,0 Z'
    : 'M4,0 L6,0 Q8,0 8,6 L8,12 Q10,12 10,18 L10,24 L6,24 L6,18 Q6,12 5,12 L5,12 Q4,12 4,18 L4,24 L0,24 L0,18 Q0,12 2,12 L2,6 Q2,0 4,0 Z';

  return (
    <button onClick={onClick} className="relative group cursor-pointer">
      <svg width="14" height="28" viewBox="0 0 12 26" className={cn('transition-all', selected && 'drop-shadow-[0_0_6px_rgba(255,216,77,0.6)]')}>
        <path d={path} fill={color} stroke={selected ? accentColor : 'rgba(255,255,255,0.15)'} strokeWidth="0.8" className="transition-all" />
      </svg>
      <span className={cn(
        'absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[7px] font-bold font-ui transition-all',
        selected ? 'text-[#FFD84D]' : 'text-white/25 group-hover:text-white/50',
      )}>
        {num}
      </span>
    </button>
  );
}

function ArchRow({ teeth, isLower }: { teeth: number[]; isLower: boolean }) {
  const { toothStatuses, selectedTooth, setSelectedTooth } = useDentalWorkspaceStore();

  return (
    <div className="flex justify-center items-end gap-px">
      {teeth.map((n, i) => (
        <div key={n} className={i === 4 ? 'mr-2' : ''}>
          <ToothShape
            num={n}
            color={CONDITION_COLORS[toothStatuses[n]?.condition ?? 'healthy'] ?? 'rgba(255,255,255,0.08)'}
            selected={selectedTooth === n}
            isLower={isLower}
            onClick={() => setSelectedTooth(n === selectedTooth ? null : n)}
          />
        </div>
      ))}
    </div>
  );
}

function ToothInspector() {
  const { selectedTooth, toothStatuses, setToothStatus, setSelectedTooth } = useDentalWorkspaceStore();

  if (!selectedTooth) return null;

  const quadrant = UPPER_R.includes(selectedTooth) ? 'Upper Right'
    : UPPER_L.includes(selectedTooth) ? 'Upper Left'
    : LOWER_R.includes(selectedTooth) ? 'Lower Right' : 'Lower Left';

  return (
    <div className="mt-4 rounded-[16px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-white font-display">
          Tooth #{selectedTooth}
          <span className="text-[10px] text-white/30 font-ui font-normal ml-2">({quadrant})</span>
        </h4>
        <button onClick={() => setSelectedTooth(null)} className="p-1 rounded-lg text-white/30 hover:text-white/60">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-white/40 font-ui mb-1 block">Condition</label>
          <select
            value={toothStatuses[selectedTooth]?.condition ?? ''}
            onChange={(e) => setToothStatus(selectedTooth, { condition: e.target.value })}
            className="w-full rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#1C2025] px-3 py-2 text-xs text-white font-ui"
          >
            <option value="">Select...</option>
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-white/40 font-ui mb-1 block">Procedure</label>
          <select
            value={toothStatuses[selectedTooth]?.procedure ?? ''}
            onChange={(e) => setToothStatus(selectedTooth, { procedure: e.target.value })}
            className="w-full rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#1C2025] px-3 py-2 text-xs text-white font-ui"
          >
            <option value="">None</option>
            {PROCEDURES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-2">
        <label className="text-[10px] text-white/40 font-ui mb-1 block">Notes</label>
        <input
          value={toothStatuses[selectedTooth]?.notes ?? ''}
          onChange={(e) => setToothStatus(selectedTooth, { notes: e.target.value })}
          placeholder="Clinical findings..."
          className="w-full rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-3 py-2 text-xs text-white font-ui"
        />
      </div>

      <div className="mt-3 flex gap-2">
        <button className="flex items-center gap-1.5 rounded-[10px] bg-white/[0.04] px-2.5 py-1.5 hover:bg-white/[0.06] transition-all">
          <Microscope className="h-3 w-3 text-white/30" />
          <span className="text-[9px] text-white/30 font-ui">X-Ray</span>
        </button>
        <button className="flex items-center gap-1.5 rounded-[10px] bg-white/[0.04] px-2.5 py-1.5 hover:bg-white/[0.06] transition-all">
          <Clock className="h-3 w-3 text-white/30" />
          <span className="text-[9px] text-white/30 font-ui">History</span>
        </button>
      </div>
    </div>
  );
}

export function ToothChartPanel() {
  const errors = useDentalWorkspaceStore((s) => s.error);

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bone className="h-5 w-5" style={{ color: accentColor }} />
          <h3 className="text-base font-semibold text-white font-display">Tooth Chart (FDI)</h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {CONDITIONS.map((c) => (
            <div key={c.value} className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: CONDITION_COLORS[c.value] }} />
              <span className="text-[9px] text-white/40 font-ui">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {errors && (
        <div className="mb-3 rounded-[10px] bg-[#FF5A5A]/10 border border-[#FF5A5A]/20 px-3 py-2 text-[11px] text-[#FF5A5A] font-ui">
          {errors}
        </div>
      )}

      <div className="space-y-0">
        <div className="flex justify-center gap-1 mb-1">
          <div className="flex flex-col items-center">
            <span className="text-[8px] text-white/20 font-ui mb-1">Right</span>
            <ArchRow teeth={UPPER_R} isLower={false} />
          </div>
          <div className="w-6" />
          <div className="flex flex-col items-center">
            <ArchRow teeth={UPPER_L} isLower={false} />
            <span className="text-[8px] text-white/20 font-ui mt-1">Left</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 my-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.1)] to-transparent" />
          <span className="text-[8px] text-white/20 font-ui tracking-widest">UPPER ARCH</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.1)] to-transparent" />
        </div>
        <div className="flex items-center justify-center gap-2 my-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.1)] to-transparent" />
          <span className="text-[8px] text-white/20 font-ui tracking-widest">LOWER ARCH</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.1)] to-transparent" />
        </div>

        <div className="flex justify-center gap-1 mt-1">
          <div className="flex flex-col items-center">
            <span className="text-[8px] text-white/20 font-ui mb-1">Right</span>
            <ArchRow teeth={LOWER_R} isLower={true} />
          </div>
          <div className="w-6" />
          <div className="flex flex-col items-center">
            <ArchRow teeth={LOWER_L} isLower={true} />
            <span className="text-[8px] text-white/20 font-ui mt-1">Left</span>
          </div>
        </div>
      </div>

      <ToothInspector />
    </div>
  );
}
