/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/doctor/emr/cardiology/page.tsx
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
import { Heart, Save, Activity, Zap, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpecialtyFormRenderer } from '@/features/specialties/components/specialty-form-renderer';
import type { SpecialtyTemplate } from '@/types/specialties';
import { usePatientStore } from '@/stores/patient-store';
import { specialtyApi } from '@/lib/specialty-api';

const accentColor = '#FF2D55';
const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';

function ECGStrip({ rhythm, onChangeRhythm }: {
  rhythm: 'nsr' | 'afib' | 'svt' | 'vt';
  onChangeRhythm: (r: 'nsr' | 'afib' | 'svt' | 'vt') => void;
}) {
  const rhythms = {
    nsr: { label: 'Normal Sinus', color: '#2EE59D', path: 'M0,50 L20,50 L22,50 L24,30 L26,10 L28,60 L30,50 L38,50 L40,50 L42,50 L44,30 L46,10 L48,60 L50,50 L58,50 L60,50 L62,50 L64,30 L66,10 L68,60 L70,50 L78,50 L80,50 L82,50 L84,30 L86,10 L88,60 L90,50 L100,50' },
    afib: { label: 'Atrial Fibrillation', color: '#FFD84D', path: 'M0,50 L5,48 L7,52 L9,47 L12,53 L15,50 L17,47 L19,30 L21,10 L23,60 L25,50 L27,48 L30,52 L32,49 L35,51 L37,47 L39,30 L41,10 L43,60 L45,50 L47,48 L50,52 L52,49 L55,51 L57,47 L59,30 L61,10 L63,60 L65,50 L67,48 L70,52 L72,49 L75,51 L78,47 L80,30 L82,10 L84,60 L86,50 L90,50 L100,50' },
    svt: { label: 'SVT', color: '#FF5A5A', path: 'M0,50 L5,50 L7,30 L9,10 L11,60 L13,50 L18,50 L20,30 L22,10 L24,60 L26,50 L31,50 L33,30 L35,10 L37,60 L39,50 L44,50 L46,30 L48,10 L50,60 L52,50 L57,50 L59,30 L61,10 L63,60 L65,50 L70,50 L72,30 L74,10 L76,60 L78,50 L83,50 L85,30 L87,10 L89,60 L91,50 L100,50' },
    vt: { label: 'V-Tach', color: '#FF2D55', path: 'M0,50 L8,50 L10,20 L14,80 L18,20 L22,50 L30,50 L32,20 L36,80 L40,20 L44,50 L52,50 L54,20 L58,80 L62,20 L66,50 L74,50 L76,20 L80,80 L84,20 L88,50 L100,50' },
  };

  const selected = rhythms[rhythm];

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4" style={{ color: accentColor }} />
          <h3 className="text-sm font-semibold text-white font-display">ECG Strip</h3>
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${selected.color}20`, color: selected.color }}>{selected.label}</span>
        </div>
        <div className="flex items-center gap-1 bg-white/[0.02] rounded-[10px] p-0.5">
          {(Object.keys(rhythms) as Array<keyof typeof rhythms>).map(r => (
            <button key={r} onClick={() => onChangeRhythm(r)} className={cn('rounded-[8px] px-2.5 py-1.5 text-[10px] font-medium font-ui transition-all', rhythm === r ? 'text-white' : 'text-white/40 hover:text-white/60')} style={rhythm === r ? { backgroundColor: `${rhythms[r].color}20`, color: rhythms[r].color } : {}}>
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-[16px] bg-[#0B0D10] border border-[rgba(255,255,255,0.06)] p-3 overflow-x-auto">
        <svg viewBox="0 0 100 70" className="w-full min-w-[480px]" style={{ maxWidth: 700 }}>
          {/* Grid lines */}
          {[0,1,2,3,4,5,6].map(i => (
            <line key={`h${i}`} x1="0" y1={10 * i + 5} x2="100" y2={10 * i + 5} stroke="rgba(255,45,85,0.08)" strokeWidth="0.3" />
          ))}
          {[0,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100].map(i => (
            <line key={`v${i}`} x1={i} y1="0" x2={i} y2="70" stroke="rgba(255,45,85,0.08)" strokeWidth="0.3" />
          ))}
          {/* ECG waveform */}
          <polyline points={selected.path.replace(/M|L/g, '').split(' ').map(p => { const [x, y] = p.split(','); if (x === undefined || y === undefined) return ''; return `${parseFloat(x)},${parseFloat(y) * 0.7 + 2}`; }).filter(Boolean).join(' ')} fill="none" stroke={selected.color} strokeWidth="0.8" />
        </svg>
      </div>
      <div className="flex items-center gap-4 mt-3 text-[9px] text-white/30 font-ui">
        <span>25mm/s · 10mm/mV</span>
        <span>HR: {rhythm === 'nsr' ? '72' : rhythm === 'afib' ? '88–120' : rhythm === 'svt' ? '180' : '160'} bpm</span>
        <span>QRS: {rhythm === 'vt' ? 'Wide (>120ms)' : 'Normal (80ms)'}</span>
        <span>PR: {rhythm === 'afib' ? 'Absent' : '160ms'}</span>
      </div>
    </div>
  );
}

function CardiacRiskPanel() {
  const { activePatient } = usePatientStore();
  const [scores] = useState({ framingham: 14, timi: 3, grace: 112 });

  const riskLevel = (score: number, max: number) => {
    const pct = score / max;
    return pct < 0.33 ? { label: 'Low', color: '#2EE59D' } : pct < 0.66 ? { label: 'Moderate', color: '#FFD84D' } : { label: 'High', color: '#FF5A5A' };
  };

  const metrics = [
    { label: 'Framingham Risk', score: scores.framingham, max: 40, suffix: '%/10yr' },
    { label: 'TIMI Score', score: scores.timi, max: 7, suffix: '/7' },
    { label: 'GRACE Score', score: scores.grace, max: 263, suffix: '' },
  ];

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4" style={{ color: accentColor }} />
        <h3 className="text-sm font-semibold text-white font-display">Cardiac Risk Scoring</h3>
      </div>
      <div className="space-y-3">
        {metrics.map(m => {
          const risk = riskLevel(m.score, m.max);
          const pct = (m.score / m.max) * 100;
          return (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-white/60 font-ui">{m.label}</span>
                <span className="text-[11px] font-bold font-ui" style={{ color: risk.color }}>{m.score}{m.suffix} · {risk.label}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: risk.color }} />
              </div>
            </div>
          );
        })}
      </div>
      {activePatient && (
        <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)]">
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'BP', value: activePatient.vitals.bp, unit: 'mmHg' },
              { label: 'HR', value: String(activePatient.vitals.hr), unit: 'bpm' },
              { label: 'SpO₂', value: String(activePatient.vitals.spo2), unit: '%' },
              { label: 'Temp', value: String(activePatient.vitals.temp), unit: '°F' },
            ].map(v => (
              <div key={v.label} className="rounded-[12px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-2 text-center">
                <p className="text-[8px] text-white/30 font-ui mb-0.5">{v.label}</p>
                <p className="text-sm font-bold text-white font-display">{v.value}</p>
                <p className="text-[8px] text-white/30 font-ui">{v.unit}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const cardioTemplate: SpecialtyTemplate = {
  id: 'cardiology-comprehensive',
  name: 'Cardiovascular Assessment',
  description: 'Complete cardiac evaluation',
  sections: [
    { id: 'chief-complaint', title: 'Chief Complaint', type: 'form', fields: [
      { id: 'primaryComplaint', label: 'Primary Complaint', type: 'textarea', required: true, placeholder: 'Chest pain, palpitations, dyspnea, syncope...' },
      { id: 'chestPainCharacter', label: 'Chest Pain Character', type: 'select', options: [
        { label: 'None', value: 'none' }, { label: 'Typical Angina', value: 'typical' },
        { label: 'Atypical Angina', value: 'atypical' }, { label: 'Non-cardiac', value: 'non_cardiac' },
        { label: 'Crushing/Pressure', value: 'crushing' }, { label: 'Sharp/Pleuritic', value: 'sharp' },
      ]},
      { id: 'radiation', label: 'Radiation', type: 'multiselect', options: [
        { label: 'Left arm', value: 'left_arm' }, { label: 'Jaw', value: 'jaw' },
        { label: 'Back', value: 'back' }, { label: 'Shoulder', value: 'shoulder' },
      ]},
      { id: 'dyspnea', label: 'Dyspnea (NYHA Class)', type: 'select', options: [
        { label: 'Class I - No limitation', value: 'I' }, { label: 'Class II - Slight limitation', value: 'II' },
        { label: 'Class III - Marked limitation', value: 'III' }, { label: 'Class IV - Symptoms at rest', value: 'IV' },
      ]},
    ]},
    { id: 'cardiac-exam', title: 'Cardiovascular Exam', type: 'form', fields: [
      { id: 'heartSounds', label: 'Heart Sounds', type: 'select', options: [
        { label: 'S1S2 Normal', value: 'normal' }, { label: 'S3 Gallop', value: 's3' },
        { label: 'S4 Gallop', value: 's4' }, { label: 'Muffled', value: 'muffled' },
      ]},
      { id: 'murmur', label: 'Murmur', type: 'select', options: [
        { label: 'None', value: 'none' }, { label: 'Systolic I/VI', value: 'sys1' },
        { label: 'Systolic II/VI', value: 'sys2' }, { label: 'Systolic III/VI', value: 'sys3' },
        { label: 'Diastolic', value: 'diastolic' }, { label: 'Continuous', value: 'continuous' },
      ]},
      { id: 'jvp', label: 'JVP', type: 'select', options: [
        { label: 'Normal (<3cm)', value: 'normal' }, { label: 'Elevated 4-6cm', value: 'elevated' },
        { label: 'Markedly elevated >6cm', value: 'markedly_elevated' },
      ]},
      { id: 'peripheralEdema', label: 'Peripheral Edema', type: 'select', options: [
        { label: 'None', value: 'none' }, { label: '+1 Pitting', value: 'plus1' },
        { label: '+2 Pitting', value: 'plus2' }, { label: '+3 Pitting', value: 'plus3' },
      ]},
    ]},
    { id: 'ecg-findings', title: 'ECG Findings', type: 'assessment', fields: [
      { id: 'rhythm', label: 'Rhythm', type: 'select', options: [
        { label: 'Normal Sinus', value: 'nsr' }, { label: 'Atrial Fibrillation', value: 'afib' },
        { label: 'Atrial Flutter', value: 'aflutter' }, { label: 'SVT', value: 'svt' },
        { label: 'V-Tach', value: 'vt' }, { label: 'V-Fib', value: 'vfib' },
        { label: 'Pacemaker', value: 'pacemaker' },
      ]},
      { id: 'stChanges', label: 'ST Changes', type: 'select', options: [
        { label: 'Normal', value: 'normal' }, { label: 'ST Elevation', value: 'elevation' },
        { label: 'ST Depression', value: 'depression' }, { label: 'T-wave inversion', value: 't_inv' },
      ]},
      { id: 'axis', label: 'QRS Axis', type: 'select', options: [
        { label: 'Normal', value: 'normal' }, { label: 'Left Axis Deviation', value: 'lad' },
        { label: 'Right Axis Deviation', value: 'rad' },
      ]},
      { id: 'ecgNotes', label: 'ECG Notes', type: 'textarea', placeholder: 'Additional ECG observations...' },
    ]},
    { id: 'investigations', title: 'Investigations', type: 'form', fields: [
      { id: 'troponin', label: 'Troponin I (ng/mL)', type: 'text', placeholder: 'e.g., 0.02' },
      { id: 'bnp', label: 'BNP/NT-proBNP (pg/mL)', type: 'text', placeholder: 'e.g., 120' },
      { id: 'echoEF', label: 'Echo LVEF (%)', type: 'number', placeholder: 'e.g., 55' },
      { id: 'cholesterol', label: 'Total Cholesterol (mg/dL)', type: 'number' },
      { id: 'ldl', label: 'LDL (mg/dL)', type: 'number' },
    ]},
    { id: 'diagnosis-plan', title: 'Diagnosis & Plan', type: 'form', fields: [
      { id: 'diagnosis', label: 'Diagnosis', type: 'textarea', required: true },
      { id: 'riskStratification', label: 'Risk Stratification', type: 'select', options: [
        { label: 'Low Risk', value: 'low' }, { label: 'Intermediate Risk', value: 'intermediate' },
        { label: 'High Risk', value: 'high' }, { label: 'Very High Risk', value: 'very_high' },
      ]},
      { id: 'management', label: 'Management Plan', type: 'textarea' },
      { id: 'medications', label: 'Cardiac Medications', type: 'textarea' },
      { id: 'procedure', label: 'Procedure Planned', type: 'select', options: [
        { label: 'None', value: 'none' }, { label: 'Stress Test', value: 'stress' },
        { label: 'Coronary Angiography', value: 'angio' }, { label: 'PCI', value: 'pci' },
        { label: 'CABG', value: 'cabg' }, { label: 'Pacemaker Implant', value: 'pacemaker' },
        { label: 'Cardioversion', value: 'cardioversion' },
      ]},
      { id: 'followUp', label: 'Follow-up', type: 'text', placeholder: 'e.g., 4 weeks' },
    ]},
  ],
};

export default function CardiologyWorkspace() {
  const { activePatient } = usePatientStore();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [rhythm, setRhythm] = useState<'nsr' | 'afib' | 'svt' | 'vt'>('nsr');
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(async () => {
    setSaved(true);
    try {
      await specialtyApi.saveEncounter('cardiology', {
        encounterId: `enc-${Date.now()}`,
        patientId: activePatient?.id ?? '',
        providerId: 'provider-1',
        data: { ...formData, rhythm },
      });
    } catch { setSaved(false); }
    setTimeout(() => setSaved(false), 2000);
  }, [activePatient, formData, rhythm]);

  return (
    <div className="min-h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${accentColor}15` }}>
            <Heart className="h-4 w-4" style={{ color: accentColor }} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white font-display">Cardiology OS</h1>
            <p className="text-[10px] text-white/50 font-ui">ECG · Risk Scoring · Cardiac Exam · Management</p>
          </div>
        </div>
        <button onClick={handleSave} className="flex items-center gap-1.5 rounded-[12px] px-3.5 py-2 text-[11px] font-semibold font-ui transition-all" style={{ backgroundColor: accentColor, color: '#0B0D10' }}>
          <Save className="h-3 w-3" />
          {saved ? 'Saved!' : 'Save Encounter'}
        </button>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-4">
        <ECGStrip rhythm={rhythm} onChangeRhythm={setRhythm} />
        <CardiacRiskPanel />
      </div>

      <div className={cn(glassCard, 'p-5')}>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4" style={{ color: accentColor }} />
          <h3 className="text-sm font-semibold text-white font-display">12-Lead ECG Leads</h3>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'].map(lead => (
            <div key={lead} className="rounded-[12px] bg-[#0B0D10] border border-[rgba(255,255,255,0.06)] p-2">
              <p className="text-[8px] text-white/30 font-ui mb-1">{lead}</p>
              <svg viewBox="0 0 60 30" className="w-full">
                <polyline points="0,15 8,15 10,15 11,8 12,3 13,22 14,15 22,15 24,15 25,8 26,3 27,22 28,15 36,15 38,15 39,8 40,3 41,22 42,15 50,15 52,15 53,8 54,3 55,22 56,15 60,15" fill="none" stroke={accentColor} strokeWidth="0.8" opacity="0.6" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      <SpecialtyFormRenderer template={cardioTemplate} formData={formData} onChange={setFormData} accentColor={accentColor} />
    </div>
  );
}
