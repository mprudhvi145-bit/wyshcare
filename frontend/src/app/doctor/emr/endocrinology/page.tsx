/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/doctor/emr/endocrinology/page.tsx
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
import { Activity, Save, TrendingUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpecialtyFormRenderer } from '@/features/specialties/components/specialty-form-renderer';
import type { SpecialtyTemplate } from '@/types/specialties';
import { usePatientStore } from '@/stores/patient-store';
import { specialtyApi } from '@/lib/specialty-api';

const accentColor = '#E74C3C';
const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';

const CGM_PATTERNS = {
  optimal: {
    label: 'Optimal Control',
    color: '#2EE59D',
    tir: 82,
    hba1c: '6.2%',
    points: [110, 130, 145, 95, 80, 115, 140, 160, 125, 110, 95, 105]
  },
  hyper: {
    label: 'Hyperglycemic Trend',
    color: '#E74C3C',
    tir: 38,
    hba1c: '8.4%',
    points: [180, 210, 245, 195, 170, 215, 230, 260, 225, 200, 185, 190]
  },
  labile: {
    label: 'Labile/Brittle (Hypo Risks)',
    color: '#FFD84D',
    tir: 52,
    hba1c: '7.5%',
    points: [150, 60, 195, 225, 50, 165, 210, 130, 65, 180, 145, 115]
  }
};

function CgmSimulator({
  patternKey,
  onChangePatternKey
}: {
  patternKey: keyof typeof CGM_PATTERNS;
  onChangePatternKey: (k: keyof typeof CGM_PATTERNS) => void;
}) {
  const selectedPattern = CGM_PATTERNS[patternKey];

  const chartW = 340, chartH = 160, padL = 30, padB = 20, padR = 10, padT = 10;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;
  const minG = 40, maxG = 300;

  const toX = (idx: number) => padL + (idx / 11) * innerW;
  const toY = (g: number) => chartH - padB - ((g - minG) / (maxG - minG)) * innerH;

  const pathPoints = selectedPattern.points.map((g, i) => `${toX(i)},${toY(g)}`).join(' ');

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" style={{ color: accentColor }} />
          <h3 className="text-sm font-semibold text-white font-display">Continuous Glucose Monitor (24h)</h3>
        </div>
        <div className="flex gap-1 bg-white/[0.02] rounded-[10px] p-0.5">
          {(Object.keys(CGM_PATTERNS) as Array<keyof typeof CGM_PATTERNS>).map(k => (
            <button key={k} onClick={() => onChangePatternKey(k)}
              className={cn('rounded-[8px] px-2 py-1 text-[9px] font-medium font-ui transition-all',
                patternKey === k ? 'text-white' : 'text-white/40 hover:text-white/60')}
              style={patternKey === k ? { backgroundColor: `${CGM_PATTERNS[k].color}20`, color: CGM_PATTERNS[k].color } : {}}>
              {k.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_120px] gap-4">
        {/* SVG glucose curve */}
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full">
          {/* Target glucose band (70-180 mg/dL) */}
          <rect x={padL} y={toY(180)} width={innerW} height={toY(70) - toY(180)} fill="rgba(46,229,157,0.05)" />
          <line x1={padL} y1={toY(180)} x2={chartW - padR} y2={toY(180)} stroke="rgba(46,229,157,0.2)" strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1={padL} y1={toY(70)} x2={chartW - padR} y2={toY(70)} stroke="rgba(46,229,157,0.2)" strokeWidth="0.5" strokeDasharray="2,2" />

          {/* Grid lines */}
          {[50, 100, 150, 200, 250].map(g => (
            <g key={g}>
              <line x1={padL} y1={toY(g)} x2={chartW - padR} y2={toY(g)} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
              <text x={padL - 3} y={toY(g) + 2} textAnchor="end" fontSize="5" fill="rgba(255,255,255,0.2)" className="font-ui">{g}</text>
            </g>
          ))}

          {/* Curve */}
          <polyline points={pathPoints} fill="none" stroke={selectedPattern.color} strokeWidth="1.5" />

          {/* Curve points */}
          {selectedPattern.points.map((g, i) => (
            <circle key={i} cx={toX(i)} cy={toY(g)} r="2.5" fill={selectedPattern.color} stroke="#0B0D10" strokeWidth="0.5" />
          ))}

          <text x={padL + 5} y={toY(180) - 2} fontSize="4" fill="rgba(46,229,157,0.4)" className="font-ui font-semibold">TARGET RANGE CEILING</text>
        </svg>

        {/* Dynamic statistics */}
        <div className="space-y-2.5">
          <div className="rounded-[12px] bg-white/[0.02] border border-white/[0.06] p-2 text-center">
            <span className="text-[8px] text-white/30 font-ui block uppercase">Time-In-Range</span>
            <span className="text-base font-bold font-display" style={{ color: selectedPattern.color }}>{selectedPattern.tir}%</span>
          </div>

          <div className="rounded-[12px] bg-white/[0.02] border border-white/[0.06] p-2 text-center">
            <span className="text-[8px] text-white/30 font-ui block uppercase">HbA1c Equivalent</span>
            <span className="text-sm font-semibold text-white font-display block mt-0.5">{selectedPattern.hba1c}</span>
          </div>

          <div className="rounded-[12px] bg-[#E74C3C]5 border border-[#E74C3C]10 p-2 text-center">
            <div className="flex items-center gap-1.5 justify-center text-[9px] text-[#E74C3C] font-semibold">
              <Sparkles className="h-2.5 w-2.5 animate-pulse" />
              <span>{selectedPattern.label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HormoneDashboard() {
  const tests = [
    { label: 'HbA1c', value: '7.8%', normal: '< 5.7%', status: 'high' },
    { label: 'Free T4', value: '1.2 ng/dL', normal: '0.8–1.8 ng/dL', status: 'normal' },
    { label: 'TSH', value: '3.4 mIU/L', normal: '0.4–4.0 mIU/L', status: 'normal' },
    { label: 'Cortisol (8AM)', value: '18 mcg/dL', normal: '5–23 mcg/dL', status: 'normal' }
  ];

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4" style={{ color: accentColor }} />
        <h3 className="text-sm font-semibold text-white font-display">Endocrine Labs Overview</h3>
      </div>

      <div className="space-y-2.5">
        {tests.map(t => (
          <div key={t.label} className="flex items-center justify-between rounded-[10px] bg-white/[0.01] border border-white/[0.04] p-2.5">
            <div>
              <p className="text-[10px] font-semibold text-white font-ui">{t.label}</p>
              <p className="text-[8px] text-white/30 font-mono">Norm: {t.normal}</p>
            </div>
            <span className={cn('text-xs font-bold font-mono px-2 py-0.5 rounded-full',
              t.status === 'high' ? 'bg-[#E74C3C]10 text-[#E74C3C]' : 'bg-[#2EE59D]10 text-[#2EE59D]')}>
              {t.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const endoTemplate: SpecialtyTemplate = {
  id: 'endocrinology-comprehensive',
  name: 'Endocrinology & Diabetes Evaluation',
  description: 'Glycemic assessment, hormone profiles, continuous glucose monitoring reviews',
  sections: [
    { id: 'chief-complaint', title: 'Chief Complaint', type: 'form', fields: [
      { id: 'presenting', label: 'Presenting Endocrine Symptoms', type: 'textarea', required: true, placeholder: 'Polyuria, polydipsia, weight fluctuations, fatigue, heat/cold intolerance...' },
      { id: 'diabetesType', label: 'Diabetes Classification', type: 'select', options: [
        { label: 'Not diabetic', value: 'none' }, { label: 'Type 1 Diabetes Mellitus', value: 't1dm' },
        { label: 'Type 2 Diabetes Mellitus', value: 't2dm' }, { label: 'Gestational Diabetes', value: 'gdm' }
      ]}
    ]},
    { id: 'glycemic', title: 'Glycemic & Home Log Assessment', type: 'form', fields: [
      { id: 'hba1cVal', label: 'Most Recent HbA1c (%)', type: 'text', placeholder: 'e.g., 7.4%' },
      { id: 'logAverage', label: 'Home SMBG / Glucose averages (mg/dL)', type: 'text', placeholder: 'e.g., Fasting: 120, Postprandial: 170...' },
      { id: 'hypoEvents', label: 'Hypoglycemic episodes per week', type: 'select', options: [
        { label: 'None', value: '0' }, { label: '1–2 mild events', value: '1-2' },
        { label: 'Frequent or severe events', value: 'severe' }
      ]}
    ]},
    { id: 'exam', title: 'Physical & Foot Examination', type: 'form', fields: [
      { id: 'thyroidExam', label: 'Thyroid Palpation / Goiter', type: 'select', options: [
        { label: 'Normal / Non-palpable', value: 'normal' }, { label: 'Diffusely enlarged (goiter)', value: 'goiter' },
        { label: 'Nodular thyroid', value: 'nodular' }
      ]},
      { id: 'diabeticFoot', label: 'Diabetic Foot Screen (Sensory/Pulses)', type: 'select', options: [
        { label: 'Not indicated / Not performed', value: 'na' },
        { label: 'Normal (sensory intact, pulses +2)', value: 'normal' },
        { label: 'Impaired monofilament sensation', value: 'impaired' },
        { label: 'Active ulcer or neuropathic changes', value: 'ulcer' }
      ]}
    ]},
    { id: 'diagnosis-plan', title: 'Diagnosis & Plan', type: 'form', fields: [
      { id: 'diagnosis', label: 'Endocrine Diagnosis', type: 'textarea', required: true, placeholder: 'e.g., Type 2 Diabetes uncontrolled, Primary Hypothyroidism...' },
      { id: 'insulinRegimen', label: 'Insulin / Oral Medication Plan', type: 'textarea', placeholder: 'Insulin dosing (basal/bolus), Metformin, GLP-1 agonists...' },
      { id: 'cgmReview', label: 'CGM / Log recommendations', type: 'textarea' },
      { id: 'followUp', label: 'Follow-up', type: 'text' }
    ]}
  ]
};

export default function EndocrinologyWorkspace() {
  const { activePatient } = usePatientStore();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [patternKey, setPatternKey] = useState<keyof typeof CGM_PATTERNS>('optimal');
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(async () => {
    setSaved(true);
    try {
      await specialtyApi.saveEncounter('endocrinology', {
        encounterId: `enc-${Date.now()}`,
        patientId: activePatient?.id ?? '',
        providerId: 'provider-1',
        data: {
          ...formData,
          cgmPattern: patternKey
        }
      });
    } catch { setSaved(false); }
    setTimeout(() => setSaved(false), 2000);
  }, [activePatient, formData, patternKey]);

  return (
    <div className="min-h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${accentColor}15` }}>
            <Activity className="h-4 w-4" style={{ color: accentColor }} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white font-display">Endocrinology OS</h1>
            <p className="text-[10px] text-white/50 font-ui">CGM Glucose Simulator · Thyroid/Hormone Labs · Diabetes EMR</p>
          </div>
        </div>
        <button onClick={handleSave} className="flex items-center gap-1.5 rounded-[12px] px-3.5 py-2 text-[11px] font-semibold font-ui transition-all" style={{ backgroundColor: accentColor, color: '#0B0D10' }}>
          <Save className="h-3 w-3" />
          {saved ? 'Saved!' : 'Save Encounter'}
        </button>
      </div>

      <div className="grid grid-cols-[1.3fr_1fr] gap-4">
        <CgmSimulator patternKey={patternKey} onChangePatternKey={setPatternKey} />
        <HormoneDashboard />
      </div>

      <SpecialtyFormRenderer template={endoTemplate} formData={formData} onChange={setFormData} accentColor={accentColor} />
    </div>
  );
}
