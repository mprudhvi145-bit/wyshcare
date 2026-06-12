/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/doctor/emr/neurology/page.tsx
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
import { Brain, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpecialtyFormRenderer } from '@/features/specialties/components/specialty-form-renderer';
import type { SpecialtyTemplate } from '@/types/specialties';
import { usePatientStore } from '@/stores/patient-store';
import { specialtyApi } from '@/lib/specialty-api';

const accentColor = '#9B59B6';
const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';

function GcsCalculator({
  eye,
  verbal,
  motor,
  onChangeEye,
  onChangeVerbal,
  onChangeMotor
}: {
  eye: number;
  verbal: number;
  motor: number;
  onChangeEye: (v: number) => void;
  onChangeVerbal: (v: number) => void;
  onChangeMotor: (v: number) => void;
}) {
  const total = eye + verbal + motor;

  const getSeverity = (score: number) => {
    if (score >= 13) return { label: 'Mild / Normal', color: '#2EE59D' };
    if (score >= 9) return { label: 'Moderate', color: '#FFD84D' };
    return { label: 'Severe Brain Injury', color: '#FF5A5A' };
  };

  const severity = getSeverity(total);

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4" style={{ color: accentColor }} />
          <h3 className="text-sm font-semibold text-white font-display">Glasgow Coma Scale (GCS)</h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${severity.color}20`, color: severity.color }}>
          {severity.label}
        </span>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
          <span className="text-[11px] text-white/50 font-ui">Eye (1-4)</span>
          <select value={eye} onChange={(e) => onChangeEye(parseInt(e.target.value))}
            className="rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-white/[0.02] p-1.5 text-[11px] text-white focus:outline-none">
            <option value="4" className="bg-[#15181D]">4 - Spontaneous</option>
            <option value="3" className="bg-[#15181D]">3 - To Sound</option>
            <option value="2" className="bg-[#15181D]">2 - To Pressure</option>
            <option value="1" className="bg-[#15181D]">1 - None</option>
          </select>
        </div>

        <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
          <span className="text-[11px] text-white/50 font-ui">Verbal (1-5)</span>
          <select value={verbal} onChange={(e) => onChangeVerbal(parseInt(e.target.value))}
            className="rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-white/[0.02] p-1.5 text-[11px] text-white focus:outline-none">
            <option value="5" className="bg-[#15181D]">5 - Oriented</option>
            <option value="4" className="bg-[#15181D]">4 - Confused</option>
            <option value="3" className="bg-[#15181D]">3 - Inappropriate Words</option>
            <option value="2" className="bg-[#15181D]">2 - Incomprehensible Sounds</option>
            <option value="1" className="bg-[#15181D]">1 - None</option>
          </select>
        </div>

        <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
          <span className="text-[11px] text-white/50 font-ui">Motor (1-6)</span>
          <select value={motor} onChange={(e) => onChangeMotor(parseInt(e.target.value))}
            className="rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-white/[0.02] p-1.5 text-[11px] text-white focus:outline-none">
            <option value="6" className="bg-[#15181D]">6 - Obeys Commands</option>
            <option value="5" className="bg-[#15181D]">5 - Localizes Pain</option>
            <option value="4" className="bg-[#15181D]">4 - Normal Flexion (Withdrawal)</option>
            <option value="3" className="bg-[#15181D]">3 - Abnormal Flexion (Decorticate)</option>
            <option value="2" className="bg-[#15181D]">2 - Extension (Decerebrate)</option>
            <option value="1" className="bg-[#15181D]">1 - None</option>
          </select>
        </div>

        <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)] text-center">
          <div className="text-2xl font-bold text-white font-display">GCS Score: {total} <span className="text-sm font-medium text-white/40">/ 15</span></div>
        </div>
      </div>
    </div>
  );
}

function CranialNervesCheck({
  deficits,
  onToggleDeficit
}: {
  deficits: number[];
  onToggleDeficit: (num: number) => void;
}) {
  const nerves = [
    { num: 1, name: 'I (Olfactory)', test: 'Smell' },
    { num: 2, name: 'II (Optic)', test: 'VA/Fields' },
    { num: 3, name: 'III (Oculomotor)', test: 'Pupils/EOM' },
    { num: 4, name: 'IV (Trochlear)', test: 'EOM (Superior Oblique)' },
    { num: 5, name: 'V (Trigeminal)', test: 'Face Sensation/Jaw' },
    { num: 6, name: 'VI (Abducens)', test: 'EOM (Lateral Rectus)' },
    { num: 7, name: 'VII (Facial)', test: 'Face Symmetry/Smile' },
    { num: 8, name: 'VIII (Vestibulocochlear)', test: 'Hearing/Balance' },
    { num: 9, name: 'IX (Glossopharyngeal)', test: 'Gag/Swallow' },
    { num: 10, name: 'X (Vagus)', test: 'Palate/Voice' },
    { num: 11, name: 'XI (Accessory)', test: 'Shoulder Shrug' },
    { num: 12, name: 'XII (Hypoglossal)', test: 'Tongue Protrusion' }
  ];

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white font-display">Cranial Nerves (I–XII)</h3>
        <span className="text-[9px] text-white/30 font-ui">Toggles deficit status</span>
      </div>

      <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto">
        {nerves.map(n => {
          const hasDeficit = deficits.includes(n.num);
          return (
            <button key={n.num} onClick={() => onToggleDeficit(n.num)}
              className="flex items-center justify-between rounded-[10px] px-2.5 py-1.5 text-[10px] font-medium font-ui border transition-all text-left"
              style={hasDeficit ? { backgroundColor: '#FF5A5A15', borderColor: '#FF5A5A30', color: '#FF5A5A' } : { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
              <div className="truncate pr-1">
                <p className="font-semibold text-white/95">{n.name}</p>
                <p className="text-[8px] opacity-40">{n.test}</p>
              </div>
              {hasDeficit ? <AlertCircle className="h-3 w-3 shrink-0 text-[#FF5A5A]" /> : <CheckCircle className="h-3 w-3 shrink-0 text-[#2EE59D] opacity-40" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const neuroTemplate: SpecialtyTemplate = {
  id: 'neurology-comprehensive',
  name: 'Neurological Evaluation',
  description: 'GCS assessment, cranial nerves check, motor/sensory/reflex exams',
  sections: [
    { id: 'chief-complaint', title: 'Chief Complaint', type: 'form', fields: [
      { id: 'presenting', label: 'Presenting Complaints', type: 'textarea', required: true, placeholder: 'Weakness, numbness, seizure, headache, tremor, cognitive decline...' },
      { id: 'onset', label: 'Onset Profile', type: 'select', options: [
        { label: 'Sudden (Strokelike)', value: 'sudden' }, { label: 'Subacute/Paroxysmal', value: 'subacute' },
        { label: 'Gradual Progression', value: 'gradual' }
      ]}
    ]},
    { id: 'mental-status', title: 'Mental Status', type: 'form', fields: [
      { id: 'orientation', label: 'Orientation (Time, Place, Person)', type: 'select', options: [
        { label: 'Fully Oriented (3/3)', value: 'oriented' }, { label: 'Disoriented to Time', value: 'disoriented_time' },
        { label: 'Disoriented to Place', value: 'disoriented_place' }, { label: 'Completely Disoriented', value: 'disoriented_all' }
      ]},
      { id: 'speech', label: 'Speech & Language', type: 'select', options: [
        { label: 'Normal', value: 'normal' }, { label: 'Aphasia (Expressive)', value: 'aphasia_expressive' },
        { label: 'Aphasia (Receptive)', value: 'aphasia_receptive' }, { label: 'Dysarthria', value: 'dysarthria' }
      ]},
      { id: 'cognitiveNotes', label: 'Cognitive exam comments', type: 'textarea' }
    ]},
    { id: 'motor-sensory', title: 'Motor, Sensory & Reflex Exam', type: 'form', fields: [
      { id: 'motorStrength', label: 'Motor Strength (0-5 scale)', type: 'textarea', placeholder: 'RUE, LUE, RLE, LLE muscle groups...' },
      { id: 'sensoryExam', label: 'Sensory Modalities', type: 'textarea', placeholder: 'Pinprick, light touch, vibration, proprioception...' },
      { id: 'reflexes', label: 'Deep Tendon Reflexes (DTR)', type: 'textarea', placeholder: 'Biceps, Brachioradialis, Triceps, Patellar, Achilles (0-4+)...' },
      { id: 'babinski', label: 'Babinski Sign', type: 'select', options: [
        { label: 'Flexor (Normal/Negative)', value: 'negative' }, { label: 'Extensor (Positive/Abnormal) - Left', value: 'positive_left' },
        { label: 'Extensor (Positive/Abnormal) - Right', value: 'positive_right' }, { label: 'Bilateral Extensor', value: 'positive_bilateral' }
      ]}
    ]},
    { id: 'diagnosis-plan', title: 'Diagnosis & Plan', type: 'form', fields: [
      { id: 'diagnosis', label: 'Diagnosis / Localization', type: 'textarea', required: true, placeholder: 'e.g., Left MCA Infarct, Parkinson\'s disease, Migraine...' },
      { id: 'imaging', label: 'Imaging Required', type: 'select', options: [
        { label: 'None', value: 'none' }, { label: 'Brain MRI (without contrast)', value: 'mri_no_con' },
        { label: 'Brain MRI (with/without)', value: 'mri_con' }, { label: 'Brain CT (non-contrast)', value: 'ct_no_con' },
        { label: 'EEG', value: 'eeg' }
      ]},
      { id: 'management', label: 'Management Details', type: 'textarea' },
      { id: 'followUp', label: 'Follow-up', type: 'text' }
    ]}
  ]
};

export default function NeurologyWorkspace() {
  const { activePatient } = usePatientStore();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [eye, setEye] = useState(4);
  const [verbal, setVerbal] = useState(5);
  const [motor, setMotor] = useState(6);
  const [deficits, setDeficits] = useState<number[]>([]);
  const [saved, setSaved] = useState(false);

  const toggleDeficit = useCallback((num: number) => {
    setDeficits(prev => prev.includes(num) ? prev.filter(x => x !== num) : [...prev, num]);
  }, []);

  const handleSave = useCallback(async () => {
    setSaved(true);
    try {
      await specialtyApi.saveEncounter('neurology', {
        encounterId: `enc-${Date.now()}`,
        patientId: activePatient?.id ?? '',
        providerId: 'provider-1',
        data: {
          ...formData,
          gcsEye: eye,
          gcsVerbal: verbal,
          gcsMotor: motor,
          gcsTotal: eye + verbal + motor,
          cranialNerveDeficits: deficits
        }
      });
    } catch { setSaved(false); }
    setTimeout(() => setSaved(false), 2000);
  }, [activePatient, formData, eye, verbal, motor, deficits]);

  return (
    <div className="min-h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${accentColor}15` }}>
            <Brain className="h-4 w-4" style={{ color: accentColor }} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white font-display">Neurology OS</h1>
            <p className="text-[10px] text-white/50 font-ui">GCS Calculator · Cranial Nerves · Reflexes & Motor EMR</p>
          </div>
        </div>
        <button onClick={handleSave} className="flex items-center gap-1.5 rounded-[12px] px-3.5 py-2 text-[11px] font-semibold font-ui transition-all" style={{ backgroundColor: accentColor, color: '#0B0D10' }}>
          <Save className="h-3 w-3" />
          {saved ? 'Saved!' : 'Save Encounter'}
        </button>
      </div>

      <div className="grid grid-cols-[1fr_1.2fr] gap-4">
        <GcsCalculator
          eye={eye}
          verbal={verbal}
          motor={motor}
          onChangeEye={setEye}
          onChangeVerbal={setVerbal}
          onChangeMotor={setMotor}
        />
        <CranialNervesCheck
          deficits={deficits}
          onToggleDeficit={toggleDeficit}
        />
      </div>

      <SpecialtyFormRenderer template={neuroTemplate} formData={formData} onChange={setFormData} accentColor={accentColor} />
    </div>
  );
}
