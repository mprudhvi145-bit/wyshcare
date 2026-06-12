/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/features/general-medicine/components/diagnosis-tools.tsx
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
 * React component: diagnosis-tools
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
 - frontend/src/app/os/layout.tsx
 - frontend/src/app/(platform)/app/page.tsx
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
import { X, Microscope, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glassCard, glassInput } from '../types';

export function DiagnosisTools() {
  const [diagTab, setDiagTab] = useState<'checker' | 'differential' | 'guidelines' | 'treatment'>('checker');
  const [symptomSearch, setSymptomSearch] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [guidelineQuery, setGuidelineQuery] = useState('');

  const commonSymptoms = ['Fever', 'Headache', 'Fatigue', 'Chest Pain', 'Cough', 'Dizziness', 'Nausea', 'Shortness of Breath', 'Joint Pain', 'Abdominal Pain'];

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white font-display">Diagnosis Tools</h3>
        <button className="flex items-center gap-1.5 rounded-[14px] bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20 px-3.5 py-2 text-xs font-medium font-ui hover:bg-[#8FD3D1]/20 transition-all">
          <FileText className="h-3.5 w-3.5" />
          Generate Report
        </button>
      </div>

      <div className="flex items-center gap-1 mb-4 border-b border-[rgba(255,255,255,0.06)] pb-0.5">
        {(['checker', 'differential', 'guidelines', 'treatment'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setDiagTab(tab)}
            className={cn(
              'px-3.5 py-2.5 text-xs font-medium font-ui transition-all rounded-t-[10px] border-b-2',
              diagTab === tab ? 'text-[#8FD3D1] border-[#8FD3D1]' : 'text-white/40 border-transparent hover:text-white/60'
            )}
          >
            {tab === 'checker' ? 'Symptom Checker' : tab === 'differential' ? 'Differential Dx' : tab === 'guidelines' ? 'Guidelines' : 'Treatment'}
          </button>
        ))}
      </div>

      {diagTab === 'checker' && (
        <div>
          <input
            value={symptomSearch}
            onChange={e => setSymptomSearch(e.target.value)}
            placeholder="Search symptoms..."
            className={cn(glassInput, 'mb-3')}
          />
          <div className="flex flex-wrap gap-1.5">
            {commonSymptoms
              .filter(s => !symptomSearch || s.toLowerCase().includes(symptomSearch.toLowerCase()))
              .map(s => (
                <button
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  className={cn(
                    'rounded-[10px] px-3 py-1.5 text-[11px] font-medium font-ui transition-all border',
                    selectedSymptoms.includes(s)
                      ? 'bg-[#8FD3D1]/15 text-[#8FD3D1] border-[#8FD3D1]/25'
                      : 'bg-white/[0.02] text-white/50 border-[rgba(255,255,255,0.06)] hover:bg-white/[0.04] hover:text-white/70'
                  )}
                >
                  {s}
                </button>
              ))}
          </div>
          {selectedSymptoms.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-white/50 font-ui">Selected Symptoms ({selectedSymptoms.length})</span>
                <button onClick={() => setSelectedSymptoms([])} className="text-[10px] text-[#8FD3D1] font-ui hover:underline">Clear all</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedSymptoms.map(s => (
                  <span key={s} className="flex items-center gap-1 rounded-[8px] bg-[#8FD3D1]/10 text-[#8FD3D1] px-2 py-1 text-[10px] font-medium font-ui">
                    {s}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleSymptom(s)} />
                  </span>
                ))}
              </div>
              <button className="mt-3 flex items-center gap-1.5 rounded-[14px] bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20 px-3.5 py-2 text-xs font-medium font-ui hover:bg-[#8FD3D1]/20 transition-all">
                <Microscope className="h-3.5 w-3.5" />
                Analyze Symptoms
              </button>
            </div>
          )}
        </div>
      )}

      {diagTab === 'differential' && (
        <div className="space-y-2">
          {selectedSymptoms.length === 0 ? (
            <p className="text-xs text-white/30 font-ui text-center py-6">Select symptoms in the Symptom Checker tab to generate differential diagnoses.</p>
          ) : (
            [
              { condition: 'Hypothyroidism', confidence: 87, evidence: ['Fatigue', 'Weight gain', 'Cold intolerance'] },
              { condition: 'Viral Infection', confidence: 74, evidence: ['Fatigue', 'Mild fever', 'Cough'] },
              { condition: 'Anemia', confidence: 68, evidence: ['Fatigue', 'Pallor', 'Shortness of breath'] },
            ].map((d, i) => (
              <div key={i} className="rounded-[14px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white font-ui">{d.condition}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn('text-xs font-semibold font-display', d.confidence >= 80 ? 'text-[#2EE59D]' : d.confidence >= 60 ? 'text-[#FFD84D]' : 'text-[#FF5A5A]')}>{d.confidence}%</span>
                    <div className="w-16 h-1.5 rounded-full bg-white/[0.06]">
                      <div className={cn('h-1.5 rounded-full', d.confidence >= 80 ? 'bg-[#2EE59D]' : d.confidence >= 60 ? 'bg-[#FFD84D]' : 'bg-[#FF5A5A]')} style={{ width: `${d.confidence}%` }} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {d.evidence.map((e, j) => (
                    <span key={j} className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[9px] text-white/40 font-ui">{e}</span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {diagTab === 'guidelines' && (
        <div className="space-y-3">
          <input
            value={guidelineQuery}
            onChange={e => setGuidelineQuery(e.target.value)}
            placeholder="Search guidelines (e.g., diabetes, hypertension)..."
            className={cn(glassInput, 'mb-2')}
          />
          <div className="flex items-center gap-2 text-[10px] text-white/30 font-ui">
            <span>Sources:</span>
            {['WHO', 'NICE', 'CDC', 'ICMR'].map(src => (
              <span key={src} className="rounded-[6px] bg-white/[0.04] px-2 py-0.5 text-white/40 font-ui">{src}</span>
            ))}
          </div>
          <div className="text-xs text-white/30 font-ui text-center py-4">Enter a query to retrieve relevant clinical guidelines.</div>
        </div>
      )}

      {diagTab === 'treatment' && (
        <div className="space-y-3">
          {[
            { type: 'Medication Options', items: ['ACE Inhibitors', 'Beta Blockers', 'Calcium Channel Blockers'] },
            { type: 'Lifestyle Interventions', items: ['Dietary modification', 'Exercise 30 min/day', 'Stress management'] },
            { type: 'Monitoring Plan', items: ['Weekly BP monitoring', 'Monthly HbA1c', 'Quarterly lipid panel'] },
          ].map((section, i) => (
            <div key={i} className="rounded-[14px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3">
              <h5 className="text-xs font-semibold text-white/60 font-ui mb-2">{section.type}</h5>
              <div className="space-y-1.5">
                {section.items.map((item, j) => (
                  <div key={j} className="flex items-center gap-2 text-[11px] text-white/70 font-ui">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#8FD3D1]/50" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
