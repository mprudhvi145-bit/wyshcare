/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/timeline/hero-section.tsx
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
 * React component: hero-section
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

import { Brain, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  score: number;
  scoreChange: number;
  ringScores: { label: string; value: number; color: string }[];
  summary: string;
  riskLevel: 'low' | 'moderate' | 'high';
  summaryParts: string[];
}

function RadialRing({ value, color, label, size = 80 }: { value: number; label: string; color: string; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle
          cx={center} cy={center} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-spring"
        />
      </svg>
      <span className="text-[9px] font-medium font-ui text-text-on-dark-secondary">{label}</span>
      <span className="text-[11px] font-bold font-display text-text-on-dark">{value}</span>
    </div>
  );
}

const riskConfig = {
  low: { label: 'Low Risk', classes: 'bg-[#2EE59D]/10 text-[#2EE59D] border-[#2EE59D]/20' },
  moderate: { label: 'Moderate Risk', classes: 'bg-[#FF9F0A]/10 text-[#FF9F0A] border-[#FF9F0A]/20' },
  high: { label: 'High Risk', classes: 'bg-[#FF453A]/10 text-[#FF453A] border-[#FF453A]/20' },
};

export function HeroSection({ score, scoreChange, ringScores, summary, riskLevel, summaryParts }: HeroSectionProps) {
  const risk = riskConfig[riskLevel];
  const borderColor = scoreChange >= 0 ? 'rgba(143,211,209,0.15)' : 'rgba(255,69,58,0.15)';

  return (
    <div className="grid grid-cols-[1fr_1.2fr] gap-4 mb-8">
      {/* Health Journey Score */}
      <div
        className="rounded-[24px] p-6 border"
        style={{ background: '#1A1D21', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-semibold font-ui text-text-on-dark-secondary tracking-wide">Health Journey</p>
            <p className="text-[10px] text-text-on-dark-tertiary mt-0.5">Last 12 Months</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(143,211,209,0.1)' }}>
            <TrendingUp className="h-3 w-3" style={{ color: scoreChange >= 0 ? '#2EE59D' : '#FF453A' }} />
            <span className="text-[11px] font-bold font-ui" style={{ color: scoreChange >= 0 ? '#2EE59D' : '#FF453A' }}>
              {scoreChange >= 0 ? '+' : ''}{scoreChange}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Main score ring */}
          <div className="relative shrink-0">
            <svg width={100} height={100} className="rotate-[-90deg]">
              <circle cx={50} cy={50} r={42} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
              <circle
                cx={50} cy={50} r={42} fill="none" stroke="#8FD3D1" strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={263.89}
                strokeDashoffset={263.89 - (score / 100) * 263.89}
                className="transition-all duration-1000 ease-spring"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-3xl font-bold font-display text-text-on-dark">{score}</span>
              </div>
            </div>
          </div>

          {/* Sub rings */}
          <div className="flex gap-3 flex-1 justify-around">
            {ringScores.map((ring) => (
              <RadialRing key={ring.label} value={ring.value} color={ring.color} label={ring.label} size={70} />
            ))}
          </div>
        </div>
      </div>

      {/* AI Health Summary */}
      <div
        className="rounded-[24px] p-6 border"
        style={{ background: '#1B1F24', borderColor }}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(143,211,209,0.12)' }}>
            <Brain className="h-4 w-4" style={{ color: '#8FD3D1' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-semibold font-ui tracking-wider uppercase" style={{ color: '#8FD3D1' }}>AI Health Summary</span>
              <Sparkles className="h-3 w-3" style={{ color: '#8FD3D1' }} />
              <span className={cn('ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold font-ui border', risk.classes)}>{risk.label}</span>
            </div>
            {summaryParts.map((part, i) => (
              <p key={i} className="text-[13px] text-text-on-dark leading-relaxed font-ui mb-1 last:mb-0">{part}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
