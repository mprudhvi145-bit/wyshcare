/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/features/general-medicine/components/ai-clinical-assistant.tsx
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
 * React component: ai-clinical-assistant
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
import { Brain, CheckCircle2, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glassCard } from '../types';

export function AIClinicalAssistant() {
  const [aiTab, setAiTab] = useState<'alerts' | 'suggestions' | 'predictive'>('alerts');

  const predictions = [
    { label: 'Hospital Readmission', value: '35%', timeframe: 'within 30 days', color: '#FF5A5A', factors: ['Age > 65', 'Prior admission', 'HbA1c > 8'] },
    { label: 'Treatment Success', value: '82%', timeframe: 'within 3 months', color: '#2EE59D', factors: ['Med adherence', 'Early intervention'] },
    { label: 'Disease Progression', value: '28%', timeframe: 'within 6 months', color: '#FFD84D', factors: ['HbA1c trend', 'BP variability'] },
  ];

  return (
    <div className={cn(glassCard, 'p-4')}>
      <div className="flex items-center gap-2 mb-3">
        <Brain className="h-4 w-4 text-[#8FD3D1]" />
        <h3 className="text-sm font-semibold text-white font-display">AI Clinical Assistant</h3>
      </div>

      <div className="flex items-center gap-1 mb-3 bg-white/[0.02] rounded-[12px] p-0.5">
        {(['alerts', 'suggestions', 'predictive'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setAiTab(tab)}
            className={cn(
              'flex-1 rounded-[10px] px-2.5 py-1.5 text-[10px] font-medium font-ui transition-all text-center',
              aiTab === tab ? 'bg-[#8FD3D1]/10 text-[#8FD3D1]' : 'text-white/40 hover:text-white/60'
            )}
          >
            {tab === 'alerts' ? 'Alerts' : tab === 'suggestions' ? 'Suggestions' : 'Predictive'}
          </button>
        ))}
      </div>

      {aiTab === 'alerts' && (
        <div className="space-y-2">
          <div className="rounded-[16px] bg-[#2EE59D]/8 border border-[#2EE59D]/12 p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#2EE59D]" />
              <span className="text-[11px] font-semibold text-[#2EE59D] font-ui">All Clear</span>
            </div>
            <p className="text-[10px] text-white/50 font-ui">No critical alerts at this time.</p>
          </div>
          <p className="text-[10px] text-white/30 font-ui text-center pt-1">Alerts will appear based on real-time patient data analysis.</p>
        </div>
      )}

      {aiTab === 'suggestions' && (
        <div className="space-y-2">
          {['Consider CBC and thyroid panel based on fatigue symptoms',
            'Lifestyle modification: increase physical activity to 30min/day',
            'Schedule diabetes screening: HbA1c due within 30 days',
            'Cardiology referral recommended for BP management',
          ].map((s, i) => (
            <div key={i} className="rounded-[14px] bg-[#8FD3D1]/5 border border-[#8FD3D1]/10 p-3">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-3.5 w-3.5 text-[#FFD84D] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-white/80 font-ui leading-relaxed">{s}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-[#8FD3D1] font-medium font-ui cursor-pointer hover:underline">Apply</span>
                    <span className="text-[10px] text-white/30 font-ui">·</span>
                    <span className="text-[10px] text-white/30 font-ui cursor-pointer hover:text-white/50">Learn More</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {aiTab === 'predictive' && (
        <div className="space-y-3">
          {predictions.map((p, i) => (
            <div key={i} className="rounded-[16px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-white/60 font-ui">{p.label}</span>
                <span className="text-xs font-semibold font-display" style={{ color: p.color }}>{p.value}</span>
              </div>
              <div className="relative h-1.5 rounded-full bg-white/[0.06] mb-2">
                <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: p.value, backgroundColor: p.color }} />
              </div>
              <p className="text-[10px] text-white/40 font-ui mb-1">{p.timeframe}</p>
              <div className="flex flex-wrap gap-1">
                {p.factors.map((f, j) => (
                  <span key={j} className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[9px] text-white/40 font-ui">{f}</span>
                ))}
              </div>
            </div>
          ))}
          <p className="text-[10px] text-white/30 font-ui text-center pt-1">AI-powered predictive analysis. Clinical judgment required.</p>
        </div>
      )}
    </div>
  );
}
