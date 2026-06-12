/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/doctor/emr/pulmonology/page.tsx
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
import { ScanSearch, Save, Activity, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpecialtyFormRenderer } from '@/features/specialties/components/specialty-form-renderer';
import type { SpecialtyTemplate } from '@/types/specialties';
import { usePatientStore } from '@/stores/patient-store';
import { specialtyApi } from '@/lib/specialty-api';

const accentColor = '#3498DB';
const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';

function PftVisualizer({
  fev1,
  fvc,
  onChangeFev1,
  onChangeFvc
}: {
  fev1: number;
  fvc: number;
  onChangeFev1: (v: number) => void;
  onChangeFvc: (v: number) => void;
}) {
  // predicted values
  const predFev1 = 4.0;
  const predFvc = 5.0;

  const fev1Pct = Math.round((fev1 / predFev1) * 100);
  const fvcPct = Math.round((fvc / predFvc) * 100);
  const ratio = Math.round((fev1 / fvc) * 100);

  const getPftDiagnosis = (ratioPct: number, fevPct: number) => {
    if (ratioPct < 70) {
      if (fevPct >= 80) return { label: 'Mild Obstruction (COPD/Asthma)', color: '#FFD84D' };
      if (fevPct >= 50) return { label: 'Moderate Obstruction', color: '#FF9F0A' };
      return { label: 'Severe Obstruction', color: '#FF5A5A' };
    }
    if (fvcPct < 80) return { label: 'Possible Restriction', color: '#AF52DE' };
    return { label: 'Normal Spirometry', color: '#2EE59D' };
  };

  const status = getPftDiagnosis(ratio, fev1Pct);

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4" style={{ color: accentColor }} />
          <h3 className="text-sm font-semibold text-white font-display">Pulmonary Function Tests (PFT)</h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${status.color}20`, color: status.color }}>
          {status.label}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-[11px] font-ui mb-1">
            <span className="text-white/60">FEV1 (Forced Expiratory Vol in 1s)</span>
            <span className="text-white font-semibold">{fev1} L ({fev1Pct}% pred)</span>
          </div>
          <input type="range" min="1.0" max="5.0" step="0.1" value={fev1} onChange={(e) => onChangeFev1(parseFloat(e.target.value))}
            className="w-full accent-[#3498DB]" />
        </div>

        <div>
          <div className="flex justify-between text-[11px] font-ui mb-1">
            <span className="text-white/60">FVC (Forced Vital Capacity)</span>
            <span className="text-white font-semibold">{fvc} L ({fvcPct}% pred)</span>
          </div>
          <input type="range" min="1.5" max="6.0" step="0.1" value={fvc} onChange={(e) => onChangeFvc(parseFloat(e.target.value))}
            className="w-full accent-[#3498DB]" />
        </div>

        <div className="rounded-[12px] bg-white/[0.02] border border-white/[0.06] p-3 flex justify-between items-center text-center">
          <div className="flex-1">
            <span className="text-[9px] text-white/30 font-ui uppercase">FEV1/FVC Ratio</span>
            <p className="text-xl font-bold text-white font-display">{ratio}%</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex-1">
            <span className="text-[9px] text-white/30 font-ui uppercase">Obstruction Cutoff</span>
            <p className="text-sm font-bold text-white/40 font-display">{"< 70%"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpO2TrendTracker() {
  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4" style={{ color: accentColor }} />
        <h3 className="text-sm font-semibold text-white font-display">SpO₂ & Breath Waveform</h3>
      </div>

      <div className="space-y-4">
        <div className="rounded-[16px] bg-[#0B0D10] border border-white/[0.06] p-3 text-center">
          <p className="text-[10px] text-white/40 font-ui mb-1.5 text-left">Simulated Capnography / Plethysmogram</p>
          <svg viewBox="0 0 100 20" className="w-full h-10">
            {/* Waveform line */}
            <path d="M0,15 Q5,2 10,15 T20,15 T30,15 T40,15 T50,15 T60,15 T70,15 T80,15 T90,15 T100,15"
              fill="none" stroke={accentColor} strokeWidth="1" strokeDasharray="3,1" className="opacity-40" />
            <path d="M0,15 Q5,2 10,15 Q15,18 20,15 T30,15 Q35,5 40,15 Q45,18 50,15 T60,15 Q65,5 70,15 Q75,18 80,15 T90,15 T100,15"
              fill="none" stroke={accentColor} strokeWidth="1" />
          </svg>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-[12px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-2.5 text-center">
            <p className="text-[8px] text-white/30 font-ui uppercase">Oxygen Saturation</p>
            <p className="text-lg font-bold text-[#3498DB] font-display">96% <span className="text-[9px] text-white/30 font-ui">SpO₂</span></p>
          </div>
          <div className="rounded-[12px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-2.5 text-center">
            <p className="text-[8px] text-white/30 font-ui uppercase">Respiratory Rate</p>
            <p className="text-lg font-bold text-white font-display">16 <span className="text-[9px] text-white/30 font-ui">bpm</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

const pulmTemplate: SpecialtyTemplate = {
  id: 'pulmonology-comprehensive',
  name: 'Respiratory & Pulmonology Evaluation',
  description: 'Spirometry, lung sounds, dyspnea grading, and inhaler check',
  sections: [
    { id: 'chief-complaint', title: 'Chief Complaint', type: 'form', fields: [
      { id: 'presenting', label: 'Presenting Complaints', type: 'textarea', required: true, placeholder: 'Cough, dyspnea, wheezing, chest tightness, hemoptysis...' },
      { id: 'mrcGrade', label: 'mMRC Dyspnea Grade', type: 'select', options: [
        { label: 'Grade 0: Dyspnea with strenuous exercise', value: '0' },
        { label: 'Grade 1: Hurrying on level/walking up hill', value: '1' },
        { label: 'Grade 2: Walks slower than peers due to breathlessness', value: '2' },
        { label: 'Grade 3: Stops for breath after 100m or few mins', value: '3' },
        { label: 'Grade 4: Too breathless to leave house / dress', value: '4' }
      ]},
      { id: 'smokingHistory', label: 'Smoking History (Pack-Years)', type: 'text', placeholder: 'e.g., 20 pack-years (ex-smoker)' }
    ]},
    { id: 'exam', title: 'Chest & Respiratory Exam', type: 'form', fields: [
      { id: 'chestInspection', label: 'Inspection / Chest Wall Shape', type: 'select', options: [
        { label: 'Normal', value: 'normal' }, { label: 'Barrel chest', value: 'barrel' },
        { label: 'Pectus excavatum', value: 'excavatum' }
      ]},
      { id: 'breathSounds', label: 'Breath Sounds', type: 'select', options: [
        { label: 'Vesicular (Normal)', value: 'vesicular' }, { label: 'Decreased bilaterally', value: 'decreased' },
        { label: 'Bronchial breath sounds', value: 'bronchial' }
      ]},
      { id: 'adventitious', label: 'Adventitious Sounds', type: 'multiselect', options: [
        { label: 'None', value: 'none' }, { label: 'Wheezing (diffuse)', value: 'wheeze_diffuse' },
        { label: 'Crepitations / Crackles (Fine)', value: 'crackles_fine' }, { label: 'Crepitations / Crackles (Coarse)', value: 'crackles_coarse' }
      ]}
    ]},
    { id: 'diagnostics', title: 'PFT & Imaging Reviews', type: 'form', fields: [
      { id: 'spirometrySummary', label: 'Spirometry Summary findings', type: 'textarea', placeholder: 'FEV1, FVC, ratio after bronchodilator...' },
      { id: 'cxrFindings', label: 'Chest X-Ray / CT Thorax', type: 'textarea', placeholder: 'Hyperinflation, consolidation, pleural effusion, fibrotic changes...' }
    ]},
    { id: 'diagnosis-plan', title: 'Diagnosis & Plan', type: 'form', fields: [
      { id: 'diagnosis', label: 'Pulmonary Diagnosis', type: 'textarea', required: true, placeholder: 'e.g., COPD GOLD Grade B, Mild Intermittent Asthma...' },
      { id: 'medications', label: 'Inhaler / Nebulizer Management', type: 'textarea', placeholder: 'e.g., Budesonide + Formoterol 200/6 DPI twice daily...' },
      { id: 'oxygenTherapy', label: 'Home Oxygen Therapy Details', type: 'text', placeholder: 'e.g., Not indicated / 2 L/min via nasal cannula...' },
      { id: 'followUp', label: 'Follow-up', type: 'text' }
    ]}
  ]
};

export default function PulmonologyWorkspace() {
  const { activePatient } = usePatientStore();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [fev1, setFev1] = useState(3.2);
  const [fvc, setFvc] = useState(4.1);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(async () => {
    setSaved(true);
    try {
      await specialtyApi.saveEncounter('pulmonology', {
        encounterId: `enc-${Date.now()}`,
        patientId: activePatient?.id ?? '',
        providerId: 'provider-1',
        data: {
          ...formData,
          pftFev1: fev1,
          pftFvc: fvc,
          pftRatio: Math.round((fev1 / fvc) * 100)
        }
      });
    } catch { setSaved(false); }
    setTimeout(() => setSaved(false), 2000);
  }, [activePatient, formData, fev1, fvc]);

  return (
    <div className="min-h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${accentColor}15` }}>
            <ScanSearch className="h-4 w-4" style={{ color: accentColor }} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white font-display">Pulmonology OS</h1>
            <p className="text-[10px] text-white/50 font-ui">PFT / Spirometry Visualizer · SpO₂ Trend · Respiratory EMR</p>
          </div>
        </div>
        <button onClick={handleSave} className="flex items-center gap-1.5 rounded-[12px] px-3.5 py-2 text-[11px] font-semibold font-ui transition-all" style={{ backgroundColor: accentColor, color: '#0B0D10' }}>
          <Save className="h-3 w-3" />
          {saved ? 'Saved!' : 'Save Encounter'}
        </button>
      </div>

      <div className="grid grid-cols-[1.2fr_1fr] gap-4">
        <PftVisualizer
          fev1={fev1}
          fvc={fvc}
          onChangeFev1={setFev1}
          onChangeFvc={setFvc}
        />
        <SpO2TrendTracker />
      </div>

      <SpecialtyFormRenderer template={pulmTemplate} formData={formData} onChange={setFormData} accentColor={accentColor} />
    </div>
  );
}
