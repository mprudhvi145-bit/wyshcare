/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/doctor/emr/dermatology/page.tsx
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
 - frontend/src/components/ui/glass-card.tsx
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 - frontend/src/components/ui/progress.tsx
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
import { ScanFace, Save, MapPin, Images, Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpecialtyFormRenderer } from '@/features/specialties/components/specialty-form-renderer';
import type { SpecialtyTemplate } from '@/types/specialties';
import { usePatientStore } from '@/stores/patient-store';
import { specialtyApi } from '@/lib/specialty-api';

const accentColor = '#FF5A5A';
const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';

const BODY_REGIONS = {
  head: { label: 'Head', x: 50, y: 5 },
  face: { label: 'Face', x: 50, y: 10 },
  neck: { label: 'Neck', x: 50, y: 18 },
  chest: { label: 'Chest', x: 50, y: 28 },
  abdomen: { label: 'Abdomen', x: 50, y: 38 },
  'upper-back': { label: 'Upper Back', x: 50, y: 28 },
  'lower-back': { label: 'Lower Back', x: 50, y: 38 },
  'l-arm': { label: 'L Arm', x: 18, y: 30 },
  'r-arm': { label: 'R Arm', x: 82, y: 30 },
  'l-forearm': { label: 'L Forearm', x: 18, y: 44 },
  'r-forearm': { label: 'R Forearm', x: 82, y: 44 },
  'l-hand': { label: 'L Hand', x: 18, y: 54 },
  'r-hand': { label: 'R Hand', x: 82, y: 54 },
  'l-thigh': { label: 'L Thigh', x: 30, y: 60 },
  'r-thigh': { label: 'R Thigh', x: 70, y: 60 },
  'l-leg': { label: 'L Leg', x: 30, y: 72 },
  'r-leg': { label: 'R Leg', x: 70, y: 72 },
  'l-foot': { label: 'L Foot', x: 30, y: 84 },
  'r-foot': { label: 'R Foot', x: 70, y: 84 },
  scalp: { label: 'Scalp', x: 50, y: 3 },
};

type Lesion = {
  id: string;
  region: string;
  label: string;
  size: number;
  border: string;
  asymmetry: string;
  color: string;
  diagnosis: string;
  notes: string;
};

const dermTemplate: SpecialtyTemplate = {
  id: 'dermatology-comprehensive',
  name: 'Comprehensive Skin & Hair Exam',
  description: 'Full dermatological evaluation with body mapping',
  sections: [
    { id: 'chief-complaint', title: 'Chief Complaint', type: 'form', fields: [
      { id: 'primaryComplaint', label: 'Primary Complaint', type: 'textarea', required: true },
      { id: 'duration', label: 'Duration', type: 'text' },
      { id: 'itching', label: 'Itching', type: 'select', options: [
        { label: 'None', value: 'none' }, { label: 'Mild', value: 'mild' }, { label: 'Moderate', value: 'moderate' }, { label: 'Severe', value: 'severe' },
      ]},
      { id: 'triggers', label: 'Triggers', type: 'text' },
    ]},
    { id: 'lesion-assessment', title: 'Lesion Assessment', type: 'form', fields: [
      { id: 'lesionType', label: 'Primary Lesion Type', type: 'select', options: [
        { label: 'Macule', value: 'macule' }, { label: 'Papule', value: 'papule' },
        { label: 'Plaque', value: 'plaque' }, { label: 'Nodule', value: 'nodule' },
        { label: 'Vesicle', value: 'vesicle' }, { label: 'Pustule', value: 'pustule' },
        { label: 'Wheal', value: 'wheal' }, { label: 'Scale', value: 'scale' },
        { label: 'Ulcer', value: 'ulcer' },
      ]},
      { id: 'distribution', label: 'Distribution', type: 'select', options: [
        { label: 'Localized', value: 'localized' }, { label: 'Generalized', value: 'generalized' },
        { label: 'Bilateral', value: 'bilateral' }, { label: 'Symmetrical', value: 'symmetrical' },
      ]},
      { id: 'morphology', label: 'Morphology Notes', type: 'textarea' },
    ]},
    { id: 'hair', title: 'Hair & Scalp', type: 'form', fields: [
      { id: 'hairComplaint', label: 'Hair Complaint', type: 'textarea' },
      { id: 'hairLossPattern', label: 'Hair Loss Pattern', type: 'select', options: [
        { label: 'No loss', value: 'none' }, { label: 'Male Pattern (Norwood)', value: 'norwood' },
        { label: 'Female Pattern (Ludwig)', value: 'ludwig' }, { label: 'Diffuse', value: 'diffuse' },
        { label: 'Alopecia Areata', value: 'areata' },
      ]},
      { id: 'scalpCondition', label: 'Scalp Condition', type: 'textarea' },
      { id: 'pullTest', label: 'Pull Test', type: 'select', options: [
        { label: 'Negative (<3 hairs)', value: 'negative' }, { label: 'Positive (>3 hairs)', value: 'positive' },
      ]},
    ]},
    { id: 'procedures', title: 'Procedures', type: 'form', fields: [
      { id: 'prp', label: 'PRP', type: 'select', options: [
        { label: 'Not indicated', value: 'none' }, { label: 'Completed', value: 'completed' },
        { label: 'Planned', value: 'planned' }, { label: 'In Progress', value: 'in_progress' },
      ]},
      { id: 'gfc', label: 'GFC', type: 'select', options: [
        { label: 'Not indicated', value: 'none' }, { label: 'Completed', value: 'completed' },
        { label: 'Planned', value: 'planned' }, { label: 'In Progress', value: 'in_progress' },
      ]},
      { id: 'microneedling', label: 'Microneedling', type: 'select', options: [
        { label: 'Not indicated', value: 'none' }, { label: 'Completed', value: 'completed' },
        { label: 'Planned', value: 'planned' },
      ]},
    ]},
    { id: 'diagnosis-plan', title: 'Diagnosis & Plan', type: 'form', fields: [
      { id: 'diagnosis', label: 'Diagnosis', type: 'textarea', required: true },
      { id: 'treatment', label: 'Treatment Plan', type: 'textarea' },
      { id: 'topical', label: 'Topical Medications', type: 'textarea' },
      { id: 'systemic', label: 'Systemic Medications', type: 'textarea' },
      { id: 'followUp', label: 'Follow-up', type: 'text' },
    ]},
  ],
};

function BodyMap({ lesions, activeRegion, setActiveRegion, addLesion, removeLesion }: {
  lesions: Lesion[];
  activeRegion: string | null;
  setActiveRegion: (r: string | null) => void;
  addLesion: (region: string, label: string) => void;
  removeLesion: (id: string) => void;
}) {
  const [side, setSide] = useState<'front' | 'back'>('front');

  const bodyPath = side === 'front'
    ? 'M50 0 L50 2 M35 2 L65 2 L65 8 L55 8 L55 14 L58 18 L50 22 L42 18 L45 14 L35 8 L35 2 Z'
    : '';

  const regionLesions = lesions.filter(l => l.region === activeRegion);

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ScanFace className="h-4 w-4" style={{ color: accentColor }} />
          <h3 className="text-sm font-semibold text-white font-display">Body Mapping</h3>
        </div>
        <div className="flex items-center gap-1 bg-white/[0.02] rounded-[10px] p-0.5">
          <button onClick={() => setSide('front')} className={cn('rounded-[8px] px-3 py-1.5 text-[10px] font-medium font-ui transition-all', side === 'front' ? 'bg-[#FF5A5A]/10 text-[#FF5A5A]' : 'text-white/40 hover:text-white/60')}>Front</button>
          <button onClick={() => setSide('back')} className={cn('rounded-[8px] px-3 py-1.5 text-[10px] font-medium font-ui transition-all', side === 'back' ? 'bg-[#FF5A5A]/10 text-[#FF5A5A]' : 'text-white/40 hover:text-white/60')}>Back</button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_220px] gap-4">
        <div className="relative">
          <svg viewBox="0 0 100 95" className="w-full max-w-[280px] mx-auto">
            {/* Body silhouette - front */}
            <ellipse cx="50" cy="7" rx="15" ry="7" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
            <path d="M38 12 Q38 14 35 18 L35 28 Q35 30 38 30 L38 45 Q35 50 28 55 L28 58 Q28 60 30 60 L32 60 Q32 55 38 52 L38 65 Q35 70 30 75 L30 78 Q30 80 32 80 L35 80 Q38 75 40 70 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
            <path d="M62 12 Q62 14 65 18 L65 28 Q65 30 62 30 L62 45 Q65 50 72 55 L72 58 Q72 60 70 60 L68 60 Q68 55 62 52 L62 65 Q65 70 70 75 L70 78 Q70 80 68 80 L65 80 Q62 75 60 70 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
            <ellipse cx="50" cy="34" rx="14" ry="20" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
            {side === 'front' && (
              <path d="M40 22 L60 22 L60 44 L40 44 Z" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />
            )}
            <rect x="42" y="50" width="16" height="20" rx="3" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
            <path d="M38 70 Q50 85 62 70" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
            <line x1="50" y1="55" x2="50" y2="76" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />

            {/* Region click areas */}
            {Object.entries(BODY_REGIONS).map(([id, region], i) => {
              const isActive = activeRegion === id;
              const hasLesion = lesions.some(l => l.region === id);
              const display = side === 'front' ? id !== 'upper-back' && id !== 'lower-back' : id === 'upper-back' || id === 'lower-back' || id === 'scalp' || id === 'neck';
              if (!display) return null;
              return (
                <g key={id} onClick={() => setActiveRegion(isActive ? null : id)} className="cursor-pointer">
                  <circle cx={region.x} cy={region.y} r={isActive ? 5 : 3.5} fill={isActive ? `${accentColor}25` : 'rgba(255,255,255,0.04)'} stroke={isActive ? accentColor : 'rgba(255,255,255,0.12)'} strokeWidth={isActive ? 1.2 : 0.5} />
                  {hasLesion && <circle cx={region.x} cy={region.y - 6} r="2" fill={accentColor} />}
                  <text x={region.x} y={region.y + 9} textAnchor="middle" fontSize="4.5" fill={isActive ? accentColor : 'rgba(255,255,255,0.35)'} className="font-ui">{region.label}</text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="space-y-2">
          <h4 className="text-[10px] font-semibold text-white/30 font-ui tracking-wider uppercase">Regions</h4>
          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {Object.entries(BODY_REGIONS).map(([id, region]) => {
              const count = lesions.filter(l => l.region === id).length;
              return (
                <button
                  key={id}
                  onClick={() => setActiveRegion(activeRegion === id ? null : id)}
                  className={cn(
                    'w-full text-left rounded-[8px] px-2.5 py-1.5 text-[10px] font-medium font-ui transition-all flex items-center justify-between',
                    activeRegion === id ? 'bg-[#FF5A5A]/10 text-[#FF5A5A]' : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03]',
                  )}
                >
                  <span>{region.label}</span>
                  {count > 0 && <span className="rounded-full bg-[#FF5A5A]/15 text-[#FF5A5A] px-1.5 text-[8px]">{count}</span>}
                </button>
              );
            })}
          </div>

          {activeRegion && (
            <button
              onClick={() => addLesion(activeRegion, (BODY_REGIONS as Record<string, { label: string; x: number; y: number }>)[activeRegion]?.label ?? activeRegion)}
              className="w-full rounded-[10px] bg-[#FF5A5A]/10 text-[#FF5A5A] border border-[#FF5A5A]/20 py-2 text-[10px] font-medium font-ui hover:bg-[#FF5A5A]/20 transition-all"
            >
              + Add Lesion
            </button>
          )}

          {regionLesions.length > 0 && (
            <div className="mt-2 space-y-1.5">
              <h4 className="text-[10px] font-semibold text-white/30 font-ui tracking-wider uppercase">Lesions</h4>
              {regionLesions.map(lesion => (
                <div key={lesion.id} className="rounded-[10px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/60 font-ui">{lesion.label} · {lesion.size}mm</span>
                    <button onClick={() => removeLesion(lesion.id)} className="text-white/20 hover:text-[#FF5A5A] text-[8px]">✕</button>
                  </div>
                  <p className="text-[9px] text-white/30 font-ui mt-0.5">{lesion.diagnosis || 'No diagnosis'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HairAnalysis() {
  const [norwood, setNorwood] = useState(3);
  const [ludwig, setLudwig] = useState(1);
  const [density, setDensity] = useState(50);

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center gap-2 mb-3">
        <Ruler className="h-4 w-4" style={{ color: accentColor }} />
        <h3 className="text-sm font-semibold text-white font-display">Hair Analysis</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] text-white/40 font-ui mb-1.5 block">Norwood Scale (Male)</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map(n => (
              <button
                key={n}
                onClick={() => setNorwood(n)}
                className={cn(
                  'flex-1 rounded-[8px] py-2 text-[10px] font-medium font-ui transition-all border',
                  norwood === n
                    ? 'bg-[#FF5A5A]/10 text-[#FF5A5A] border-[#FF5A5A]/20'
                    : 'bg-white/[0.02] text-white/30 border-transparent hover:bg-white/[0.04]',
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] text-white/40 font-ui mb-1.5 block">Ludwig Scale (Female)</label>
          <div className="flex gap-1">
            {[1, 2, 3].map(n => (
              <button
                key={n}
                onClick={() => setLudwig(n)}
                className={cn(
                  'flex-1 rounded-[8px] py-2 text-[10px] font-medium font-ui transition-all border',
                  ludwig === n
                    ? 'bg-[#FF5A5A]/10 text-[#FF5A5A] border-[#FF5A5A]/20'
                    : 'bg-white/[0.02] text-white/30 border-transparent hover:bg-white/[0.04]',
                )}
              >
                {['I', 'II', 'III'][n - 1]}
              </button>
            ))}
          </div>
        </div>
        <div className="col-span-2">
          <label className="text-[10px] text-white/40 font-ui mb-1.5 block">Hair Density: {density}%</label>
          <input type="range" min="0" max="100" value={density} onChange={e => setDensity(+e.target.value)} className="w-full accent-[#FF5A5A]" />
          <div className="flex justify-between text-[8px] text-white/20 font-ui mt-0.5">
            <span>Thin</span>
            <span>Normal</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DermatologyWorkspace() {
  const { activePatient } = usePatientStore();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [lesions, setLesions] = useState<Lesion[]>([
    { id: 'l1', region: 'face', label: 'Face', size: 4, border: 'regular', asymmetry: 'symmetric', color: 'brown', diagnosis: 'Melasma', notes: '' },
    { id: 'l2', region: 'face', label: 'Face', size: 2, border: 'irregular', asymmetry: 'asymmetric', color: 'red', diagnosis: 'Acne', notes: 'Inflammatory' },
  ]);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(async () => {
    setSaved(true);
    try {
      await specialtyApi.saveEncounter('dermatology', {
        encounterId: `enc-${Date.now()}`,
        patientId: activePatient?.id ?? '',
        providerId: 'provider-1',
        data: { ...formData, lesions, activeRegion },
        findings: lesions.map(l => ({
          category: 'lesion',
          findingKey: l.id,
          findingValue: {
            region: l.region, label: l.label, size: l.size,
            border: l.border, asymmetry: l.asymmetry, color: l.color,
            diagnosis: l.diagnosis, notes: l.notes,
          },
          severity: l.asymmetry === 'asymmetric' || l.border === 'irregular' ? 'moderate' : 'mild',
          status: 'active',
        })),
      });
    } catch {
      setSaved(false);
    }
    setTimeout(() => setSaved(false), 2000);
  }, [activePatient, formData, lesions, activeRegion]);

  const addLesion = (region: string, label: string) => {
    setLesions(prev => [...prev, { id: `l${Date.now()}`, region, label, size: 5, border: 'regular', asymmetry: 'symmetric', color: 'brown', diagnosis: '', notes: '' }]);
  };

  const removeLesion = (id: string) => setLesions(prev => prev.filter(l => l.id !== id));

  return (
    <div className="min-h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${accentColor}15` }}>
            <ScanFace className="h-4 w-4" style={{ color: accentColor }} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white font-display">Dermatology Workspace</h1>
            <p className="text-[10px] text-white/50 font-ui">Skin & hair clinical workspace</p>
          </div>
        </div>
        <button onClick={handleSave} className="flex items-center gap-1.5 rounded-[12px] px-3.5 py-2 text-[11px] font-semibold font-ui transition-all" style={{ backgroundColor: accentColor, color: '#0B0D10' }}>
          <Save className="h-3 w-3" />
          {saved ? 'Saved!' : 'Save Encounter'}
        </button>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-4">
        <BodyMap lesions={lesions} activeRegion={activeRegion} setActiveRegion={setActiveRegion} addLesion={addLesion} removeLesion={removeLesion} />

        <div className="space-y-4">
          <HairAnalysis />

          <div className={cn(glassCard, 'p-5')}>
            <div className="flex items-center gap-2 mb-3">
              <Images className="h-4 w-4" style={{ color: accentColor }} />
              <h3 className="text-sm font-semibold text-white font-display">Dermoscopy</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['Lesion 1', 'Lesion 2', 'Scalp', 'Full Face'].map((img, i) => (
                <div key={img} className="aspect-square rounded-[14px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] flex flex-col items-center justify-center hover:bg-white/[0.04] cursor-pointer transition-all">
                  <Images className="h-5 w-5 text-white/20 mb-1" />
                  <span className="text-[8px] text-white/30 font-ui">{img}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SpecialtyFormRenderer template={dermTemplate} formData={formData} onChange={setFormData} accentColor={accentColor} />
    </div>
  );
}
