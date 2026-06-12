/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/doctor/emr/urology/page.tsx
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
 - specialty-form-renderer
 - react
 - utils
 - lucide-react
 - specialty-api
 - patient-store
 *
 * Dependencies:
 - specialty-form-renderer
 - react
 - utils
 - lucide-react
 - specialty-api
 - patient-store
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

import { useState, useCallback } from 'react';
import { Scan, Save, Activity, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpecialtyFormRenderer } from '@/features/specialties/components/specialty-form-renderer';
import type { SpecialtyTemplate } from '@/types/specialties';
import { usePatientStore } from '@/stores/patient-store';
import { specialtyApi } from '@/lib/specialty-api';

const accentColor = '#1ABC9C';
const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';

function IpssCalculator({
  scores,
  onChangeScore
}: {
  scores: Record<string, number>;
  onChangeScore: (key: string, val: number) => void;
}) {
  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  const getSeverity = (score: number) => {
    if (score <= 7) return { label: 'Mild Symptoms', color: '#2EE59D' };
    if (score <= 19) return { label: 'Moderate Symptoms', color: '#FFD84D' };
    return { label: 'Severe Symptoms', color: '#FF5A5A' };
  };

  const severity = getSeverity(total);

  const questions: { id: string; label: string }[] = [
    { id: 'emptying', label: 'Incomplete Emptying' },
    { id: 'frequency', label: 'Frequency (within 2 hours)' },
    { id: 'intermittency', label: 'Intermittency (stop & start)' },
    { id: 'urgency', label: 'Urgency (difficult to postpone)' },
    { id: 'weakStream', label: 'Weak Stream' },
    { id: 'hesitancy', label: 'Hesitancy (difficulty to start)' },
    { id: 'nocturia', label: 'Nocturia (times waking to void)' }
  ];

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4" style={{ color: accentColor }} />
          <h3 className="text-sm font-semibold text-white font-display">IPSS Voiding Symptom Score</h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${severity.color}20`, color: severity.color }}>
          {severity.label}
        </span>
      </div>

      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
        {questions.map(q => (
          <div key={q.id} className="flex justify-between items-center gap-2 rounded-[10px] bg-white/[0.01] border border-white/[0.04] p-2">
            <span className="text-[10px] text-white/70 font-ui leading-tight">{q.label}</span>
            <div className="flex gap-0.5">
              {[0, 1, 2, 3, 4, 5].map(val => (
                <button key={val} onClick={() => onChangeScore(q.id, val)}
                  className={cn('text-[8px] h-5 w-5 rounded-[6px] transition-all font-ui text-center border flex items-center justify-center',
                    scores[q.id] === val
                      ? 'bg-[#1ABC9C]15 border-[#1ABC9C]30 text-[#1ABC9C] font-semibold'
                      : 'bg-white/[0.02] border-transparent text-white/40 hover:text-white/60')}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)] text-center">
        <div className="text-lg font-bold text-white font-display">IPSS Score: {total} <span className="text-[11px] font-medium text-white/40">/ 35</span></div>
      </div>
    </div>
  );
}

function BladderScanner({
  pvr,
  onChangePvr
}: {
  pvr: number;
  onChangePvr: (v: number) => void;
}) {
  const getRetentionRisk = (val: number) => {
    if (val < 50) return { label: 'Normal Emptying', color: '#2EE59D' };
    if (val < 150) return { label: 'Borderline PVR', color: '#FFD84D' };
    return { label: 'Urinary Retention Risk', color: '#FF5A5A' };
  };

  const risk = getRetentionRisk(pvr);

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Scan className="h-4 w-4" style={{ color: accentColor }} />
          <h3 className="text-sm font-semibold text-white font-display">PVR Bladder Ultrasound</h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${risk.color}20`, color: risk.color }}>
          {risk.label}
        </span>
      </div>

      <div className="space-y-4">
        <div className="relative w-full h-24 bg-[#0B0D10] border border-white/[0.06] rounded-[16px] overflow-hidden flex items-center justify-center">
          {/* Ultrasound canvas simulator */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-white stroke-[0.5] fill-none">
              <ellipse cx="50" cy="50" rx="30" ry="30" />
              <ellipse cx="50" cy="50" rx="45" ry="45" strokeDasharray="2,2" />
            </svg>
          </div>
          {/* Simulated bladder outline based on PVR */}
          <div className="rounded-full blur-sm bg-gradient-to-tr from-[#1ABC9C]/20 to-[#1ABC9C]/10 transition-all duration-300 border border-[#1ABC9C]/30"
            style={{ width: `${Math.min(70, 20 + pvr / 6)}px`, height: `${Math.min(70, 20 + pvr / 6)}px` }} />
          <div className="absolute bottom-2 right-2 text-[8px] text-white/30 font-mono">PVR SCAN VER 1.0</div>
        </div>

        <div>
          <div className="flex justify-between text-[11px] font-ui mb-1">
            <span className="text-white/60">Post-Void Residual Volume</span>
            <span className="text-white font-semibold">{pvr} ml</span>
          </div>
          <input type="range" min="10" max="400" step="5" value={pvr} onChange={(e) => onChangePvr(parseInt(e.target.value))}
            className="w-full accent-[#1ABC9C]" />
        </div>
      </div>
    </div>
  );
}

const uroTemplate: SpecialtyTemplate = {
  id: 'urology-comprehensive',
  name: 'Urological Examination',
  description: 'Voiding symptoms, bladder scanner metrics, and prostate evaluation',
  sections: [
    { id: 'chief-complaint', title: 'Chief Complaint', type: 'form', fields: [
      { id: 'presenting', label: 'Presenting Symptoms', type: 'textarea', required: true, placeholder: 'Dysuria, hematuria, frequency, urgency, flank pain, incontinence...' },
      { id: 'duration', label: 'Symptom Duration', type: 'text' }
    ]},
    { id: 'exam', title: 'Physical & Digital Rectal Exam (DRE)', type: 'form', fields: [
      { id: 'flankTenderness', label: 'CVA Flank Tenderness', type: 'select', options: [
        { label: 'None', value: 'none' }, { label: 'Left-sided CVA tenderness', value: 'left' },
        { label: 'Right-sided CVA tenderness', value: 'right' }, { label: 'Bilateral CVA tenderness', value: 'bilateral' }
      ]},
      { id: 'suprapubic', label: 'Suprapubic Palpation', type: 'select', options: [
        { label: 'Nontender, no distension', value: 'normal' }, { label: 'Tender to palpation', value: 'tender' },
        { label: 'Distended (palpable bladder)', value: 'distended' }
      ]},
      { id: 'dreFindings', label: 'DRE Findings (Prostate)', type: 'textarea', placeholder: 'Size (g), symmetry, nodules, consistency, tenderness...' }
    ]},
    { id: 'labs', title: 'Urology Diagnostics & Labs', type: 'form', fields: [
      { id: 'urinalysis', label: 'Urinalysis (Leukocytes, Nitrites, RBCs)', type: 'textarea', placeholder: 'Leukocyte esterase, Nitrite positive/negative, RBCs/HPF...' },
      { id: 'psa', label: 'PSA Level (ng/mL) (if indicated)', type: 'text', placeholder: 'e.g., 1.4 ng/mL' },
      { id: 'pvrUltrasound', label: 'Formal PVR ultrasound summary', type: 'text', placeholder: 'e.g., PVR 60 ml, normal bladder wall thickness' }
    ]},
    { id: 'diagnosis-plan', title: 'Diagnosis & Plan', type: 'form', fields: [
      { id: 'diagnosis', label: 'Urological Diagnosis', type: 'textarea', required: true, placeholder: 'e.g., Benign Prostatic Hyperplasia (BPH) (N40.1), UTI (N39.0)...' },
      { id: 'management', label: 'Treatment & Intervention Plan', type: 'textarea', placeholder: 'Medical management (Alpha blockers, 5-ARIs), antibiotics, scheduling urodynamics...' },
      { id: 'followUp', label: 'Follow-up', type: 'text' }
    ]}
  ]
};

export default function UrologyWorkspace() {
  const { activePatient } = usePatientStore();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [scores, setScores] = useState<Record<string, number>>({
    emptying: 1, frequency: 2, intermittency: 1, urgency: 3, weakStream: 2, hesitancy: 1, nocturia: 2
  });
  const [pvr, setPvr] = useState(65);
  const [saved, setSaved] = useState(false);

  const handleScoreChange = useCallback((key: string, val: number) => {
    setScores(prev => ({ ...prev, [key]: val }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaved(true);
    try {
      await specialtyApi.saveEncounter('urology', {
        encounterId: `enc-${Date.now()}`,
        patientId: activePatient?.id ?? '',
        providerId: 'provider-1',
        data: {
          ...formData,
          ipssScores: scores,
          ipssTotal: Object.values(scores).reduce((a, b) => a + b, 0),
          postVoidResidualMl: pvr
        }
      });
    } catch { setSaved(false); }
    setTimeout(() => setSaved(false), 2000);
  }, [activePatient, formData, scores, pvr]);

  return (
    <div className="min-h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${accentColor}15` }}>
            <Scan className="h-4 w-4" style={{ color: accentColor }} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white font-display">Urology OS</h1>
            <p className="text-[10px] text-white/50 font-ui">IPSS Voiding Score · PVR Bladder Scanner · Urological EMR</p>
          </div>
        </div>
        <button onClick={handleSave} className="flex items-center gap-1.5 rounded-[12px] px-3.5 py-2 text-[11px] font-semibold font-ui transition-all" style={{ backgroundColor: accentColor, color: '#0B0D10' }}>
          <Save className="h-3 w-3" />
          {saved ? 'Saved!' : 'Save Encounter'}
        </button>
      </div>

      <div className="grid grid-cols-[1.2fr_1fr] gap-4">
        <IpssCalculator scores={scores} onChangeScore={handleScoreChange} />
        <BladderScanner pvr={pvr} onChangePvr={setPvr} />
      </div>

      <SpecialtyFormRenderer template={uroTemplate} formData={formData} onChange={setFormData} accentColor={accentColor} />
    </div>
  );
}
