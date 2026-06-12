/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/doctor/emr/ophthalmology/page.tsx
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
import { Eye, Save, EyeOff, ScanLine, ChartNoAxesCombined } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpecialtyFormRenderer } from '@/features/specialties/components/specialty-form-renderer';
import type { SpecialtyTemplate } from '@/types/specialties';
import { usePatientStore } from '@/stores/patient-store';
import { specialtyApi } from '@/lib/specialty-api';

const accentColor = '#5856D6';
const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';

const EYE_STRUCTURES = [
  { id: 'cornea', label: 'Cornea', x: 30, y: 50 },
  { id: 'lens', label: 'Lens', x: 45, y: 50 },
  { id: 'retina', label: 'Retina', x: 72, y: 50 },
  { id: 'optic-nerve', label: 'Optic Nerve', x: 80, y: 50 },
  { id: 'macula', label: 'Macula', x: 68, y: 48 },
];

function EyeCrossSection({ activeStructure, setActiveStructure }: {
  activeStructure: string | null; setActiveStructure: (s: string | null) => void;
}) {
  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center gap-2 mb-4">
        <Eye className="h-4 w-4" style={{ color: accentColor }} />
        <h3 className="text-sm font-semibold text-white font-display">Eye Anatomy</h3>
        <span className="text-[9px] text-white/30 font-ui ml-auto">Click structure to examine</span>
      </div>
      <div className="grid grid-cols-[1fr_180px] gap-4">
        <svg viewBox="0 0 180 100" className="w-full">
          {/* Eye shape */}
          <ellipse cx="90" cy="50" rx="80" ry="35" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />

          {/* Cornea */}
          <path d="M15,50 Q15,35 25,40 Q30,42 30,50 Q30,58 25,60 Q15,65 15,50 Z"
            fill={activeStructure === 'cornea' ? `${accentColor}30` : 'rgba(255,255,255,0.04)'}
            stroke={activeStructure === 'cornea' ? accentColor : 'rgba(255,255,255,0.15)'}
            strokeWidth={activeStructure === 'cornea' ? 1.2 : 0.5}
            onClick={() => setActiveStructure('cornea')} className="cursor-pointer" />

          {/* Anterior chamber */}
          <path d="M30,35 Q35,30 40,32 L45,35 Q48,40 48,45 L48,55 Q48,60 45,65 L40,68 Q35,70 30,65 Z"
            fill="rgba(88,86,214,0.05)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />

          {/* Lens */}
          <ellipse cx="55" cy="50" rx="8" ry="14"
            fill={activeStructure === 'lens' ? `${accentColor}30` : 'rgba(255,255,255,0.06)'}
            stroke={activeStructure === 'lens' ? accentColor : 'rgba(255,255,255,0.15)'}
            strokeWidth={activeStructure === 'lens' ? 1.2 : 0.5}
            onClick={() => setActiveStructure('lens')} className="cursor-pointer" />

          {/* Retina area */}
          <path d="M63,25 Q90,18 120,25 Q135,30 145,40 Q155,48 155,50 Q155,52 145,60 Q135,70 120,75 Q90,82 63,75 Z"
            fill={activeStructure === 'retina' ? `${accentColor}20` : 'rgba(255,255,255,0.03)'}
            stroke={activeStructure === 'retina' ? accentColor : 'rgba(255,255,255,0.1)'}
            strokeWidth={activeStructure === 'retina' ? 1.2 : 0.5}
            onClick={() => setActiveStructure('retina')} className="cursor-pointer" />

          {/* Optic Nerve */}
          <path d="M150,45 Q160,40 162,38 L162,62 Q160,60 150,55 Z"
            fill={activeStructure === 'optic-nerve' ? `${accentColor}30` : 'rgba(255,255,255,0.04)'}
            stroke={activeStructure === 'optic-nerve' ? accentColor : 'rgba(255,255,255,0.15)'}
            strokeWidth={activeStructure === 'optic-nerve' ? 1.2 : 0.5}
            onClick={() => setActiveStructure('optic-nerve')} className="cursor-pointer" />

          {/* Macula */}
          <circle cx="125" cy="48" r="5"
            fill={activeStructure === 'macula' ? `${accentColor}30` : 'rgba(255,255,255,0.04)'}
            stroke={activeStructure === 'macula' ? accentColor : 'rgba(255,255,255,0.15)'}
            strokeWidth={activeStructure === 'macula' ? 1.2 : 0.5}
            onClick={() => setActiveStructure('macula')} className="cursor-pointer" />

          {/* Labels */}
          {EYE_STRUCTURES.map(s => {
            const isActive = activeStructure === s.id;
            return (
              <text key={s.id} x={s.x + 5} y={s.y - (s.id === 'macula' ? 8 : 0)}
                textAnchor="start" fontSize={isActive ? 5 : 4.5}
                fill={isActive ? accentColor : 'rgba(255,255,255,0.3)'}
                className="font-ui cursor-pointer"
                onClick={() => setActiveStructure(isActive ? null : s.id)}>
                {s.label}
              </text>
            );
          })}
        </svg>

        <div className="space-y-1">
          {EYE_STRUCTURES.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveStructure(activeStructure === s.id ? null : s.id)}
              className={cn(
                'w-full text-left rounded-[8px] px-2.5 py-1.5 text-[10px] font-medium font-ui transition-all',
                activeStructure === s.id ? 'bg-[#5856D6]/10 text-[#5856D6]' : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03]',
              )}
            >
              {activeStructure === s.id ? '◉' : '○'} {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function RefractionPanel() {
  const [eye, setEye] = useState<'od' | 'os'>('od');
  const [refraction, setRefraction] = useState({
    od: { sphere: '-2.50', cylinder: '-0.75', axis: '180', add: '+2.00', va: '6/9' },
    os: { sphere: '-1.75', cylinder: '-0.50', axis: '175', add: '+1.75', va: '6/6' },
  });

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <EyeOff className="h-4 w-4" style={{ color: accentColor }} />
          <h3 className="text-sm font-semibold text-white font-display">Refraction</h3>
        </div>
        <div className="flex items-center gap-1 bg-white/[0.02] rounded-[10px] p-0.5">
          <button onClick={() => setEye('od')} className={cn('rounded-[8px] px-3 py-1.5 text-[10px] font-medium font-ui transition-all', eye === 'od' ? 'bg-[#5856D6]/10 text-[#5856D6]' : 'text-white/40')}>
            OD (Right)
          </button>
          <button onClick={() => setEye('os')} className={cn('rounded-[8px] px-3 py-1.5 text-[10px] font-medium font-ui transition-all', eye === 'os' ? 'bg-[#5856D6]/10 text-[#5856D6]' : 'text-white/40')}>
            OS (Left)
          </button>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {[{ key: 'sphere', label: 'Sphere' }, { key: 'cylinder', label: 'Cylinder' }, { key: 'axis', label: 'Axis' }, { key: 'add', label: 'Add' }, { key: 'va', label: 'VA' }].map(field => (
          <div key={field.key}>
            <label className="text-[8px] text-white/30 font-ui mb-1 block uppercase tracking-wider">{field.label}</label>
            <input
              value={refraction[eye][field.key as keyof typeof refraction['od']]}
              onChange={e => setRefraction(prev => ({ ...prev, [eye]: { ...prev[eye], [field.key]: e.target.value } }))}
              className="w-full rounded-[8px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02] px-2 py-1.5 text-[11px] text-white font-mono font-ui text-center"
            />
          </div>
        ))}
      </div>
      <div className="mt-2 text-[9px] text-white/20 font-ui text-center">
        {eye === 'od' ? 'Right Eye' : 'Left Eye'} — click values to edit
      </div>
    </div>
  );
}

function OCTViewer() {
  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center gap-2 mb-3">
        <ScanLine className="h-4 w-4" style={{ color: accentColor }} />
        <h3 className="text-sm font-semibold text-white font-display">OCT - Macular Thickness</h3>
      </div>
      <svg viewBox="0 0 300 100" className="w-full">
        <defs>
          <linearGradient id="octGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5856D6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#5856D6" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {/* OCT cross-section */}
        <path d="M30,60 Q60,40 90,42 Q120,44 150,35 Q180,26 210,38 Q240,50 270,45"
          fill="none" stroke={accentColor} strokeWidth="1.5" />
        <path d="M30,60 Q60,80 90,78 Q120,76 150,85 Q180,94 210,82 Q240,70 270,75"
          fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <path d="M30,60 Q60,40 90,42 Q120,44 150,35 Q180,26 210,38 Q240,50 270,45 L270,75 Q240,70 210,82 Q180,94 150,85 Q120,76 90,78 Q60,80 30,60 Z"
          fill="url(#octGrad)" />
        {/* Measurement lines */}
        {[
          { x: 80, label: '284μm', color: '#2EE59D' },
          { x: 130, label: '320μm', color: '#FFD84D' },
          { x: 175, label: '298μm', color: '#8FD3D1' },
          { x: 220, label: '265μm', color: '#2EE59D' },
        ].map((m, i) => (
          <g key={i}>
            <line x1={m.x} y1="25" x2={m.x} y2="75" stroke={m.color} strokeWidth="0.5" strokeDasharray="2,2" opacity="0.5" />
            <text x={m.x} y="20" textAnchor="middle" fontSize="6" fill={m.color} className="font-ui">{m.label}</text>
          </g>
        ))}
        {/* Foveal pit */}
        <text x="150" y="15" textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.3)" className="font-ui">Fovea</text>
      </svg>
      <div className="flex items-center gap-3 mt-2 text-[9px] text-white/30 font-ui">
        <span className="flex items-center gap-1"><span className="text-[#2EE59D]">●</span> Normal</span>
        <span className="flex items-center gap-1"><span className="text-[#FFD84D]">●</span> Borderline</span>
        <span>Central: 298μm</span>
      </div>
    </div>
  );
}

function IOPGauge() {
  const [iop, setIop] = useState({ od: '18', os: '16' });

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center gap-2 mb-3">
        <ChartNoAxesCombined className="h-4 w-4" style={{ color: accentColor }} />
        <h3 className="text-sm font-semibold text-white font-display">IOP</h3>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1 text-center">
          <label className="text-[10px] text-white/40 font-ui mb-1 block">OD (Right)</label>
          <input
            value={iop.od}
            onChange={e => setIop(prev => ({ ...prev, od: e.target.value }))}
            className="w-20 mx-auto rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02] px-3 py-2 text-sm text-white font-mono font-ui text-center"
          />
          <span className="text-[10px] text-white/30 font-ui ml-1">mmHg</span>
        </div>
        <div className="text-white/20 font-ui text-lg">VS</div>
        <div className="flex-1 text-center">
          <label className="text-[10px] text-white/40 font-ui mb-1 block">OS (Left)</label>
          <input
            value={iop.os}
            onChange={e => setIop(prev => ({ ...prev, os: e.target.value }))}
            className="w-20 mx-auto rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02] px-3 py-2 text-sm text-white font-mono font-ui text-center"
          />
          <span className="text-[10px] text-white/30 font-ui ml-1">mmHg</span>
        </div>
      </div>
      <div className="mt-2 flex justify-center gap-3 text-[9px] text-white/30 font-ui">
        <span>C/D Ratio: 0.4</span>
        <span>Normal Range: 10-21</span>
      </div>
    </div>
  );
}

const ophthTemplate: SpecialtyTemplate = {
  id: 'ophthalmology-comprehensive',
  name: 'Comprehensive Eye Exam',
  description: 'Complete ophthalmological evaluation',
  sections: [
    { id: 'chief-complaint', title: 'Chief Complaint', type: 'form', fields: [
      { id: 'primaryComplaint', label: 'Primary Complaint', type: 'textarea', required: true },
      { id: 'onset', label: 'Onset', type: 'select', options: [
        { label: 'Sudden', value: 'sudden' }, { label: 'Gradual', value: 'gradual' },
      ]},
      { id: 'eyeAffected', label: 'Eye Affected', type: 'select', options: [
        { label: 'Right (OD)', value: 'od' }, { label: 'Left (OS)', value: 'os' },
        { label: 'Both (OU)', value: 'ou' },
      ]},
      { id: 'symptoms', label: 'Symptoms', type: 'multiselect', options: [
        { label: 'Blurred Vision', value: 'blurred' }, { label: 'Double Vision', value: 'diplopia' },
        { label: 'Pain', value: 'pain' }, { label: 'Redness', value: 'redness' },
        { label: 'Floaters', value: 'floaters' }, { label: 'Flashing Lights', value: 'flashes' },
        { label: 'Dryness', value: 'dryness' },
      ]},
    ]},
    { id: 'anterior-segment', title: 'Anterior Segment', type: 'form', fields: [
      { id: 'lids', label: 'Lids & Lashes', type: 'select', options: [
        { label: 'Normal', value: 'normal' }, { label: 'Blepharitis', value: 'blepharitis' },
        { label: 'Hordeolum', value: 'hordeolum' }, { label: 'Chalazion', value: 'chalazion' },
      ]},
      { id: 'conjunctiva', label: 'Conjunctiva', type: 'select', options: [
        { label: 'Normal', value: 'normal' }, { label: 'Conjunctivitis', value: 'conjunctivitis' },
        { label: 'Pterygium', value: 'pterygium' },
      ]},
      { id: 'cornea', label: 'Cornea', type: 'select', options: [
        { label: 'Clear', value: 'clear' }, { label: 'Edema', value: 'edema' },
        { label: 'Opacity', value: 'opacity' }, { label: 'Keratoconus', value: 'keratoconus' },
      ]},
      { id: 'lens', label: 'Lens', type: 'select', options: [
        { label: 'Clear', value: 'clear' }, { label: 'NS Cataract', value: 'ns_cataract' },
        { label: 'Cortical Cataract', value: 'cortical' }, { label: 'PSC', value: 'psc' },
        { label: 'Pseudophakia', value: 'pseudophakia' },
      ]},
    ]},
    { id: 'posterior-segment', title: 'Posterior Segment', type: 'form', fields: [
      { id: 'vitreous', label: 'Vitreous', type: 'select', options: [
        { label: 'Clear', value: 'clear' }, { label: 'Hemorrhage', value: 'hemorrhage' },
        { label: 'PVD', value: 'pvd' }, { label: 'Vitritis', value: 'vitritis' },
      ]},
      { id: 'macula', label: 'Macula', type: 'select', options: [
        { label: 'Normal', value: 'normal' }, { label: 'AMD Dry', value: 'amd_dry' },
        { label: 'AMD Wet', value: 'amd_wet' }, { label: 'Macular Edema', value: 'edema' },
        { label: 'Macular Hole', value: 'hole' }, { label: 'ERM', value: 'erm' },
      ]},
      { id: 'retina', label: 'Retina', type: 'select', options: [
        { label: 'Normal', value: 'normal' }, { label: 'DR', value: 'dr' },
        { label: 'HR', value: 'hr' }, { label: 'RD', value: 'rd' }, { label: 'RVO', value: 'rvo' },
      ]},
    ]},
    { id: 'glaucoma', title: 'Glaucoma', type: 'assessment', fields: [
      { id: 'cdRatio', label: 'C/D Ratio', type: 'text' },
      { id: 'gonioscopy', label: 'Gonioscopy', type: 'select', options: [
        { label: 'Open Angle', value: 'open' }, { label: 'Narrow', value: 'narrow' },
        { label: 'Closed', value: 'closed' },
      ]},
      { id: 'visualField', label: 'Visual Field', type: 'select', options: [
        { label: 'Normal', value: 'normal' }, { label: 'Defects', value: 'defects' },
      ]},
    ]},
    { id: 'diagnosis-plan', title: 'Diagnosis & Plan', type: 'form', fields: [
      { id: 'diagnosis', label: 'Diagnosis', type: 'textarea', required: true },
      { id: 'treatment', label: 'Treatment Plan', type: 'textarea' },
      { id: 'medications', label: 'Eye Medications', type: 'textarea' },
      { id: 'surgery', label: 'Surgery', type: 'select', options: [
        { label: 'No', value: 'no' }, { label: 'Cataract', value: 'cataract' },
        { label: 'Glaucoma', value: 'glaucoma' }, { label: 'Vitrectomy', value: 'vitrectomy' },
      ]},
      { id: 'followUp', label: 'Follow-up', type: 'text' },
    ]},
  ],
};

export default function OphthalmologyWorkspace() {
  const { activePatient } = usePatientStore();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [activeStructure, setActiveStructure] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(async () => {
    setSaved(true);
    try {
      await specialtyApi.saveEncounter('ophthalmology', {
        encounterId: `enc-${Date.now()}`,
        patientId: activePatient?.id ?? '',
        providerId: 'provider-1',
        data: { ...formData, activeStructure },
      });
    } catch {
      setSaved(false);
    }
    setTimeout(() => setSaved(false), 2000);
  }, [activePatient, formData, activeStructure]);

  return (
    <div className="min-h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${accentColor}15` }}>
            <Eye className="h-4 w-4" style={{ color: accentColor }} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white font-display">Ophthalmology Workspace</h1>
            <p className="text-[10px] text-white/50 font-ui">Comprehensive eye examination</p>
          </div>
        </div>
        <button onClick={handleSave} className="flex items-center gap-1.5 rounded-[12px] px-3.5 py-2 text-[11px] font-semibold font-ui transition-all" style={{ backgroundColor: accentColor, color: '#0B0D10' }}>
          <Save className="h-3 w-3" />
          {saved ? 'Saved!' : 'Save Encounter'}
        </button>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-4">
        <EyeCrossSection activeStructure={activeStructure} setActiveStructure={setActiveStructure} />
        <RefractionPanel />
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-4">
        <OCTViewer />
        <IOPGauge />
      </div>

      <SpecialtyFormRenderer template={ophthTemplate} formData={formData} onChange={setFormData} accentColor={accentColor} />
    </div>
  );
}
