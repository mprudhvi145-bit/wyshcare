/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/doctor/emr/pediatrics/page.tsx
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
import { Baby, Save, TrendingUp, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpecialtyFormRenderer } from '@/features/specialties/components/specialty-form-renderer';
import type { SpecialtyTemplate } from '@/types/specialties';
import { usePatientStore } from '@/stores/patient-store';
import { specialtyApi } from '@/lib/specialty-api';

const accentColor = '#34C759';
const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';

// WHO growth percentile curves (simplified data points for visualization)
const PERCENTILE_CURVES = {
  p3:  [49.0, 52.1, 55.0, 57.6, 59.9, 61.9, 63.6, 65.1, 66.5, 67.7, 68.9, 70.0, 71.0],
  p50: [50.5, 54.7, 58.4, 61.4, 63.9, 65.9, 67.6, 69.2, 70.6, 72.0, 73.3, 74.5, 75.7],
  p97: [52.0, 57.3, 61.8, 65.2, 67.9, 69.9, 71.6, 73.3, 74.7, 76.3, 77.7, 79.0, 80.4],
};

function GrowthChart({ ageMonths, height, weight }: { ageMonths: number; height: number; weight: number }) {
  const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const chartW = 340, chartH = 160, padL = 30, padB = 20, padR = 10, padT = 10;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;
  const minH = 45, maxH = 85;

  const toX = (m: number) => padL + (m / 12) * innerW;
  const toY = (h: number) => chartH - padB - ((h - minH) / (maxH - minH)) * innerH;

  const curvePoints = (data: number[]) =>
    data.map((h, i) => `${toX(months[i]!)},${toY(h)}`).join(' ');

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4" style={{ color: accentColor }} />
        <h3 className="text-sm font-semibold text-white font-display">WHO Growth Chart — Length/Height for Age</h3>
      </div>
      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full">
        {/* Grid */}
        {[50, 55, 60, 65, 70, 75, 80].map(h => (
          <g key={h}>
            <line x1={padL} y1={toY(h)} x2={chartW - padR} y2={toY(h)} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
            <text x={padL - 3} y={toY(h) + 3} textAnchor="end" fontSize="5" fill="rgba(255,255,255,0.25)" className="font-ui">{h}</text>
          </g>
        ))}
        {months.map(m => (
          <g key={m}>
            <line x1={toX(m)} y1={padT} x2={toX(m)} y2={chartH - padB} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
            <text x={toX(m)} y={chartH - padB + 8} textAnchor="middle" fontSize="5" fill="rgba(255,255,255,0.25)" className="font-ui">{m}m</text>
          </g>
        ))}
        {/* Percentile curves */}
        <polyline points={curvePoints(PERCENTILE_CURVES.p97)} fill="none" stroke="rgba(52,199,89,0.2)" strokeWidth="1" strokeDasharray="3,2" />
        <polyline points={curvePoints(PERCENTILE_CURVES.p50)} fill="none" stroke="rgba(52,199,89,0.5)" strokeWidth="1.5" />
        <polyline points={curvePoints(PERCENTILE_CURVES.p3)} fill="none" stroke="rgba(52,199,89,0.2)" strokeWidth="1" strokeDasharray="3,2" />
        {/* Labels */}
        <text x={chartW - padR - 5} y={toY(PERCENTILE_CURVES.p97[12]!) - 3} textAnchor="end" fontSize="5" fill="rgba(52,199,89,0.5)" className="font-ui">97th</text>
        <text x={chartW - padR - 5} y={toY(PERCENTILE_CURVES.p50[12]!) - 3} textAnchor="end" fontSize="5" fill="rgba(52,199,89,0.8)" className="font-ui">50th</text>
        <text x={chartW - padR - 5} y={toY(PERCENTILE_CURVES.p3[12]!) - 3} textAnchor="end" fontSize="5" fill="rgba(52,199,89,0.5)" className="font-ui">3rd</text>
        {/* Patient dot */}
        {ageMonths <= 12 && height > 0 && (
          <circle cx={toX(ageMonths)} cy={toY(height)} r="4" fill={accentColor} stroke="#0B0D10" strokeWidth="1.5" />
        )}
      </svg>
      <div className="grid grid-cols-3 gap-2 mt-3">
        {[
          { label: 'Age', value: `${ageMonths}m`, unit: '' },
          { label: 'Height', value: `${height}`, unit: 'cm' },
          { label: 'Weight', value: `${weight}`, unit: 'kg' },
        ].map(m => (
          <div key={m.label} className="rounded-[12px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-2 text-center">
            <p className="text-[8px] text-white/30 font-ui">{m.label}</p>
            <p className="text-sm font-bold text-white font-display">{m.value}<span className="text-[9px] text-white/30 ml-0.5">{m.unit}</span></p>
          </div>
        ))}
      </div>
    </div>
  );
}

function VaccinationTracker({ checked, onChange }: { checked: Set<string>; onChange: (c: Set<string>) => void }) {
  const vaccines = [
    { id: 'BCG', name: 'BCG', due: 'Birth' },
    { id: 'OPV0', name: 'OPV 0', due: 'Birth' },
    { id: 'HepB0', name: 'HepB 0', due: 'Birth' },
    { id: 'OPV1', name: 'OPV 1', due: '6 wk' },
    { id: 'DPT1', name: 'DPT 1', due: '6 wk' },
    { id: 'Hib1', name: 'Hib 1', due: '6 wk' },
    { id: 'HepB1', name: 'HepB 1', due: '6 wk' },
    { id: 'IPV1', name: 'IPV 1', due: '6 wk' },
    { id: 'OPV2', name: 'OPV 2', due: '10 wk' },
    { id: 'DPT2', name: 'DPT 2', due: '10 wk' },
    { id: 'Hib2', name: 'Hib 2', due: '10 wk' },
    { id: 'OPV3', name: 'OPV 3', due: '14 wk' },
    { id: 'DPT3', name: 'DPT 3', due: '14 wk' },
    { id: 'Hib3', name: 'Hib 3', due: '14 wk' },
    { id: 'IPV2', name: 'IPV 2', due: '14 wk' },
    { id: 'MMR1', name: 'MMR 1', due: '9 mo' },
    { id: 'JE1', name: 'JE 1', due: '9 mo' },
    { id: 'MMR2', name: 'MMR 2', due: '15 mo' },
    { id: 'DPT-B1', name: 'DPT-B1', due: '16-24 mo' },
    { id: 'OPV-B1', name: 'OPV-B1', due: '16-24 mo' },
  ];

  const toggle = (id: string) => {
    const n = new Set(checked);
    if (n.has(id)) {
      n.delete(id);
    } else {
      n.add(id);
    }
    onChange(n);
  };

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" style={{ color: accentColor }} />
          <h3 className="text-sm font-semibold text-white font-display">Vaccination Tracker (UIP)</h3>
        </div>
        <span className="text-[10px] text-white/40 font-ui">{checked.size}/{vaccines.length} done</span>
      </div>
      <div className="flex flex-wrap gap-1.5 max-h-[200px] overflow-y-auto">
        {vaccines.map(v => {
          const done = checked.has(v.id);
          return (
            <button key={v.id} onClick={() => toggle(v.id)}
              className={cn('rounded-[10px] px-2.5 py-1.5 text-[10px] font-medium font-ui transition-all border text-left')}
              style={done ? { backgroundColor: `${accentColor}15`, borderColor: `${accentColor}30`, color: accentColor } : { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
              <span className="text-[9px] mr-0.5">{done ? '✓' : '○'}</span>
              {v.name}
              <span className="text-[8px] opacity-50 ml-1">{v.due}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const pediatricsTemplate: SpecialtyTemplate = {
  id: 'pediatrics-comprehensive',
  name: 'Pediatric Evaluation',
  description: 'Growth monitoring, developmental assessment, and immunization review',
  sections: [
    { id: 'chief-complaint', title: 'Chief Complaint', type: 'form', fields: [
      { id: 'presenting', label: 'Presenting Complaint', type: 'textarea', required: true },
      { id: 'duration', label: 'Duration', type: 'text' },
      { id: 'onsetType', label: 'Onset', type: 'select', options: [
        { label: 'Acute', value: 'acute' }, { label: 'Subacute', value: 'subacute' }, { label: 'Chronic', value: 'chronic' },
      ]},
      { id: 'birthHistory', label: 'Birth History', type: 'textarea', placeholder: 'Gestational age, delivery mode, APGAR...' },
    ]},
    { id: 'anthropometry', title: 'Anthropometry & Vitals', type: 'measurement', fields: [
      { id: 'weightKg', label: 'Weight (kg)', type: 'number' },
      { id: 'heightCm', label: 'Height/Length (cm)', type: 'number' },
      { id: 'headCircumference', label: 'Head Circumference (cm)', type: 'number' },
      { id: 'bmi', label: 'BMI (if >2yr)', type: 'number' },
      { id: 'weightPercentile', label: 'Weight Percentile', type: 'select', options: [
        { label: '<3rd', value: '<3' }, { label: '3rd–15th', value: '3-15' }, { label: '15th–50th', value: '15-50' },
        { label: '50th–85th', value: '50-85' }, { label: '85th–97th', value: '85-97' }, { label: '>97th', value: '>97' },
      ]},
      { id: 'nutritionStatus', label: 'Nutritional Status', type: 'select', options: [
        { label: 'Well-nourished', value: 'well' }, { label: 'Mild undernutrition', value: 'mild' },
        { label: 'Moderate undernutrition', value: 'moderate' }, { label: 'Severe undernutrition', value: 'severe' },
        { label: 'Overweight', value: 'overweight' }, { label: 'Obese', value: 'obese' },
      ]},
    ]},
    { id: 'developmental', title: 'Developmental Assessment', type: 'assessment', fields: [
      { id: 'grossMotor', label: 'Gross Motor', type: 'select', options: [
        { label: 'Age-appropriate', value: 'appropriate' }, { label: 'Delayed', value: 'delayed' }, { label: 'Advanced', value: 'advanced' },
      ]},
      { id: 'fineMotor', label: 'Fine Motor', type: 'select', options: [
        { label: 'Age-appropriate', value: 'appropriate' }, { label: 'Delayed', value: 'delayed' },
      ]},
      { id: 'language', label: 'Language/Communication', type: 'select', options: [
        { label: 'Age-appropriate', value: 'appropriate' }, { label: 'Delayed', value: 'delayed' },
      ]},
      { id: 'social', label: 'Social/Emotional', type: 'select', options: [
        { label: 'Age-appropriate', value: 'appropriate' }, { label: 'Delayed', value: 'delayed' },
      ]},
      { id: 'milestoneNotes', label: 'Milestone Notes', type: 'textarea' },
    ]},
    { id: 'physical-exam', title: 'Physical Examination', type: 'form', fields: [
      { id: 'generalAppearance', label: 'General Appearance', type: 'select', options: [
        { label: 'Well', value: 'well' }, { label: 'Ill-looking', value: 'ill' },
        { label: 'Toxic', value: 'toxic' }, { label: 'Lethargic', value: 'lethargic' },
      ]},
      { id: 'hydrationStatus', label: 'Hydration', type: 'select', options: [
        { label: 'Well hydrated', value: 'well' }, { label: 'Mild dehydration (3-5%)', value: 'mild' },
        { label: 'Moderate dehydration (6-9%)', value: 'moderate' }, { label: 'Severe dehydration (>10%)', value: 'severe' },
      ]},
      { id: 'systemicFindings', label: 'Systemic Findings', type: 'textarea', placeholder: 'CVS, RS, GI, CNS...' },
      { id: 'lymphNodes', label: 'Lymph Nodes', type: 'select', options: [
        { label: 'Not palpable', value: 'none' }, { label: 'Cervical', value: 'cervical' },
        { label: 'Axillary', value: 'axillary' }, { label: 'Generalized', value: 'generalized' },
      ]},
    ]},
    { id: 'diagnosis-plan', title: 'Diagnosis & Plan', type: 'form', fields: [
      { id: 'diagnosis', label: 'Diagnosis', type: 'textarea', required: true },
      { id: 'management', label: 'Management', type: 'textarea' },
      { id: 'doseCalculation', label: 'Drug Dose (weight-based)', type: 'textarea', placeholder: 'Drug: x mg/kg/day...' },
      { id: 'parentCounseling', label: 'Parent Counseling', type: 'textarea' },
      { id: 'followUp', label: 'Follow-up', type: 'text', placeholder: 'e.g., 2 weeks / next milestone review' },
    ]},
  ],
};

export default function PediatricsWorkspace() {
  const { activePatient } = usePatientStore();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [checkedVaccines, setCheckedVaccines] = useState<Set<string>>(new Set(['BCG', 'OPV0', 'HepB0', 'OPV1', 'DPT1', 'Hib1', 'HepB1', 'IPV1']));
  const [saved, setSaved] = useState(false);
  const ageMonths = activePatient ? Math.floor(activePatient.age * 12) % 13 : 7;

  const handleSave = useCallback(async () => {
    setSaved(true);
    try {
      await specialtyApi.saveEncounter('pediatrics', {
        encounterId: `enc-${Date.now()}`,
        patientId: activePatient?.id ?? '',
        providerId: 'provider-1',
        data: { ...formData, checkedVaccines: Array.from(checkedVaccines) },
      });
    } catch { setSaved(false); }
    setTimeout(() => setSaved(false), 2000);
  }, [activePatient, formData, checkedVaccines]);

  return (
    <div className="min-h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${accentColor}15` }}>
            <Baby className="h-4 w-4" style={{ color: accentColor }} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white font-display">Pediatrics OS</h1>
            <p className="text-[10px] text-white/50 font-ui">Growth · Vaccination · Developmental Assessment</p>
          </div>
        </div>
        <button onClick={handleSave} className="flex items-center gap-1.5 rounded-[12px] px-3.5 py-2 text-[11px] font-semibold font-ui transition-all" style={{ backgroundColor: accentColor, color: '#0B0D10' }}>
          <Save className="h-3 w-3" />
          {saved ? 'Saved!' : 'Save Encounter'}
        </button>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-4">
        <GrowthChart ageMonths={ageMonths} height={activePatient?.age ? Math.min(activePatient.age * 6 + 50, 80) : 67} weight={activePatient?.age ? Math.min(activePatient.age * 2 + 3, 10) : 7} />
        <VaccinationTracker checked={checkedVaccines} onChange={setCheckedVaccines} />
      </div>

      <SpecialtyFormRenderer template={pediatricsTemplate} formData={formData} onChange={setFormData} accentColor={accentColor} />
    </div>
  );
}
