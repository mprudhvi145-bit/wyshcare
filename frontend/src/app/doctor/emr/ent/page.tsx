/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/doctor/emr/ent/page.tsx
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
import { Ear, Save, Headphones, Mic, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpecialtyFormRenderer } from '@/features/specialties/components/specialty-form-renderer';
import type { SpecialtyTemplate } from '@/types/specialties';
import { usePatientStore } from '@/stores/patient-store';
import { specialtyApi } from '@/lib/specialty-api';

const accentColor = '#2EE59D';
const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';

const ZONES = [
  { id: 'ear-r', label: 'Right Ear', x: 82, y: 35, icon: '👂' },
  { id: 'ear-l', label: 'Left Ear', x: 18, y: 35, icon: '👂' },
  { id: 'nose', label: 'Nose / Sinus', x: 50, y: 40, icon: '👃' },
  { id: 'throat', label: 'Throat', x: 50, y: 62, icon: '🔴' },
  { id: 'larynx', label: 'Larynx', x: 50, y: 72, icon: '🔊' },
];

function ENTheadSVG({ activeZone, setActiveZone }: { activeZone: string | null; setActiveZone: (z: string) => void }) {
  return (
    <div className="relative">
      <svg viewBox="0 0 100 90" className="w-full max-w-[280px] mx-auto">
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Head silhouette */}
        <ellipse cx="50" cy="38" rx="32" ry="36" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
        {/* Neck */}
        <rect x="40" y="68" width="20" height="20" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
        {/* Eyes */}
        <circle cx="44" cy="28" r="2" fill="rgba(255,255,255,0.08)" />
        <circle cx="56" cy="28" r="2" fill="rgba(255,255,255,0.08)" />
        {/* Mouth */}
        <ellipse cx="50" cy="56" rx="4" ry="1.5" fill="rgba(255,255,255,0.06)" />

        {/* Hot zones */}
        {ZONES.map(zone => {
          const isActive = activeZone === zone.id;
          return (
            <g key={zone.id} onClick={() => setActiveZone(zone.id)} className="cursor-pointer">
              {isActive && <circle cx={zone.x} cy={zone.y} r="14" fill="url(#glow)" />}
              <circle
                cx={zone.x}
                cy={zone.y}
                r="8"
                fill={isActive ? `${accentColor}25` : 'rgba(255,255,255,0.04)'}
                stroke={isActive ? accentColor : 'rgba(255,255,255,0.12)'}
                strokeWidth={isActive ? 1.5 : 0.6}
                className="transition-all"
              />
              <text x={zone.x} y={zone.y + 3} textAnchor="middle" fontSize="7" fill={isActive ? accentColor : 'rgba(255,255,255,0.4)'} className="font-ui font-medium">
                {zone.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function AudiogramPlotter() {
  const frequencies = [125, 250, 500, 1000, 2000, 4000, 8000];
  const levels = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
  const [pointsL, setPointsL] = useState<Record<number, number>>({ 500: 25, 1000: 30, 2000: 45, 4000: 60 });
  const [pointsR, setPointsR] = useState<Record<number, number>>({ 500: 15, 1000: 20, 2000: 25, 4000: 30 });
  const [activeEar, setActiveEar] = useState<'left' | 'right'>('right');

  const handleClick = (freq: number, level: number) => {
    if (activeEar === 'left') {
      setPointsL(prev => prev[freq] === level ? prev : { ...prev, [freq]: level });
    } else {
      setPointsR(prev => prev[freq] === level ? prev : { ...prev, [freq]: level });
    }
  };

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Headphones className="h-4 w-4" style={{ color: accentColor }} />
          <h3 className="text-sm font-semibold text-white font-display">Audiogram</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setActiveEar('left')} className={cn('rounded-[8px] px-2.5 py-1 text-[10px] font-medium font-ui transition-all', activeEar === 'left' ? 'bg-[#3498DB]/15 text-[#3498DB]' : 'text-white/40 hover:text-white/60')}>
            Left (X)
          </button>
          <button onClick={() => setActiveEar('right')} className={cn('rounded-[8px] px-2.5 py-1 text-[10px] font-medium font-ui transition-all', activeEar === 'right' ? 'bg-[#FF5A5A]/15 text-[#FF5A5A]' : 'text-white/40 hover:text-white/60')}>
            Right (O)
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 520 280" className="w-full min-w-[400px]" style={{ maxWidth: 520 }}>
          <text x="260" y="20" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)" className="font-ui">Frequency (Hz)</text>
          {frequencies.map((f, i) => (
            <text key={f} x={60 + i * 55} y="258" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.3)" className="font-ui">
              {f >= 1000 ? `${f / 1000}k` : f}
            </text>
          ))}
          <text x="12" y="140" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)" className="font-ui" transform="rotate(-90, 12, 140)">Hearing Level (dB)</text>
          {levels.filter(l => l % 20 === 0).map(level => (
            <g key={level}>
              <text x="38" y={135 - level * 1.05 + 4} textAnchor="end" fontSize="7" fill="rgba(255,255,255,0.2)" className="font-ui">{level}</text>
              <line x1="45" y1={135 - level * 1.05} x2="490" y2={135 - level * 1.05} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              {level === 25 && <text x="492" y={135 - level * 1.05 + 3} fontSize="6" fill="rgba(255,255,255,0.15)" className="font-ui">Normal</text>}
            </g>
          ))}
          <rect x="45" y={135 - 25 * 1.05} width="445" height={25 * 1.05} fill="rgba(46,229,157,0.06)" rx="2" />

          {/* Clickable cells */}
          {frequencies.map((f, fi) => levels.filter(l => l % 10 === 0).map(level => {
            const lx = 60 + fi * 55;
            const ly = 135 - level * 1.05;
            const isL = pointsL[f] === level;
            const isR = pointsR[f] === level;
            return (
              <rect key={`${f}-${level}`}
                x={lx - 4} y={ly - 4} width="8" height="8"
                fill="transparent"
                className="cursor-pointer"
                onClick={() => handleClick(f, level)}
              />
            );
          }))}

          {/* AC Lines */}
          {['left', 'right'].map(ear => {
            const pts = ear === 'left' ? pointsL : pointsR;
            const sorted = Object.entries(pts).sort(([a], [b]) => +a - +b);
            if (sorted.length < 2) return null;
            const pathD = sorted.map(([freq, level], i) => {
              const fi = frequencies.indexOf(+freq);
              const x = 60 + fi * 55;
              const y = 135 - level * 1.05;
              return `${i === 0 ? 'M' : 'L'}${x},${y}`;
            }).join(' ');
            return <path key={ear} d={pathD} fill="none" stroke={ear === 'left' ? '#3498DB' : '#FF5A5A'} strokeWidth="1.5" strokeDasharray={ear === 'left' ? '4,2' : '0'} opacity="0.7" />;
          })}

          {frequencies.map((f, fi) => levels.filter(l => l % 10 === 0).map(level => {
            const lx = 60 + fi * 55;
            const ly = 135 - level * 1.05;
            const isL = pointsL[f] === level;
            const isR = pointsR[f] === level;
            return (
              <g key={`pt-${f}-${level}`}>
                {isL && <text x={lx} y={ly + 3} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#3498DB" className="cursor-pointer select-none" onClick={() => setPointsL(prev => { const n = { ...prev }; delete n[f]; return n; })}>X</text>}
                {isR && <text x={lx} y={ly + 3} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#FF5A5A" className="cursor-pointer select-none" onClick={() => setPointsR(prev => { const n = { ...prev }; delete n[f]; return n; })}>O</text>}
              </g>
            );
          }))}
        </svg>
      </div>
      <div className="flex items-center gap-3 mt-2 text-[9px] text-white/30 font-ui">
        <span className="flex items-center gap-1"><span className="text-[#3498DB] font-bold">X</span> Left (AC)</span>
        <span className="flex items-center gap-1"><span className="text-[#FF5A5A] font-bold">O</span> Right (AC)</span>
        <span className="text-white/20">Click grid to plot points</span>
      </div>
    </div>
  );
}

const entTemplate: SpecialtyTemplate = {
  id: 'ent-comprehensive',
  name: 'Comprehensive ENT Exam',
  description: 'Ear, Nose, and Throat evaluation',
  sections: [
    { id: 'ear', title: 'Ear Examination', type: 'form', fields: [
      { id: 'hearingComplaint', label: 'Hearing Complaint', type: 'textarea' },
      { id: 'otoscopyRight', label: 'Otoscopy - Right', type: 'select', options: [
        { label: 'Normal', value: 'normal' }, { label: 'Bulging', value: 'bulging' },
        { label: 'Retracted', value: 'retracted' }, { label: 'Congested', value: 'congested' },
        { label: 'Fluid Level', value: 'fluid' }, { label: 'Perforation', value: 'perforation' },
      ]},
      { id: 'otoscopyLeft', label: 'Otoscopy - Left', type: 'select', options: [
        { label: 'Normal', value: 'normal' }, { label: 'Bulging', value: 'bulging' },
        { label: 'Retracted', value: 'retracted' }, { label: 'Congested', value: 'congested' },
        { label: 'Fluid Level', value: 'fluid' }, { label: 'Perforation', value: 'perforation' },
      ]},
      { id: 'rinne', label: 'Rinne Test', type: 'select', options: [
        { label: 'Normal (AC > BC)', value: 'normal' }, { label: 'Conductive Loss', value: 'conductive' },
        { label: 'Sensorineural Loss', value: 'sensorineural' },
      ]},
      { id: 'weber', label: 'Weber Test', type: 'select', options: [
        { label: 'Central', value: 'central' }, { label: 'Lateralizes Right', value: 'right' },
        { label: 'Lateralizes Left', value: 'left' },
      ]},
    ]},
    { id: 'nose', title: 'Nose & Sinus', type: 'form', fields: [
      { id: 'nasalComplaint', label: 'Nasal Complaint', type: 'textarea' },
      { id: 'rhinoscopy', label: 'Rhinoscopy', type: 'textarea' },
      { id: 'septum', label: 'Septum', type: 'select', options: [
        { label: 'Straight', value: 'straight' }, { label: 'Deviated Mild', value: 'deviated_mild' },
        { label: 'Deviated Moderate', value: 'deviated_moderate' },
        { label: 'Deviated Severe', value: 'deviated_severe' },
      ]},
      { id: 'turbinates', label: 'Turbinates', type: 'select', options: [
        { label: 'Normal', value: 'normal' }, { label: 'Hypertrophied', value: 'hypertrophied' },
        { label: 'Pale/Allergic', value: 'allergic' },
      ]},
      { id: 'sinusTenderness', label: 'Sinus Tenderness', type: 'multiselect', options: [
        { label: 'Frontal', value: 'frontal' }, { label: 'Maxillary', value: 'maxillary' },
        { label: 'Ethmoid', value: 'ethmoid' },
      ]},
    ]},
    { id: 'throat', title: 'Throat & Larynx', type: 'form', fields: [
      { id: 'throatComplaint', label: 'Throat Complaint', type: 'textarea' },
      { id: 'oropharynx', label: 'Oropharynx', type: 'select', options: [
        { label: 'Normal', value: 'normal' }, { label: 'Erythema', value: 'erythema' },
        { label: 'Exudate', value: 'exudate' }, { label: 'Edema', value: 'edema' },
      ]},
      { id: 'tonsilsRight', label: 'Tonsil - Right', type: 'select', options: [
        { label: '1+', value: '1plus' }, { label: '2+', value: '2plus' },
        { label: '3+', value: '3plus' }, { label: '4+', value: '4plus' },
      ]},
      { id: 'tonsilsLeft', label: 'Tonsil - Left', type: 'select', options: [
        { label: '1+', value: '1plus' }, { label: '2+', value: '2plus' },
        { label: '3+', value: '3plus' }, { label: '4+', value: '4plus' },
      ]},
    ]},
    { id: 'diagnosis-plan', title: 'Diagnosis & Plan', type: 'form', fields: [
      { id: 'diagnosis', label: 'Diagnosis', type: 'textarea', required: true },
      { id: 'treatment', label: 'Treatment Plan', type: 'textarea' },
      { id: 'medications', label: 'Medications', type: 'textarea' },
      { id: 'followUp', label: 'Follow-up', type: 'text' },
    ]},
  ],
};

export default function EntWorkspace() {
  const { activePatient } = usePatientStore();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(async () => {
    setSaved(true);
    try {
      await specialtyApi.saveEncounter('ent', {
        encounterId: `enc-${Date.now()}`,
        patientId: activePatient?.id ?? '',
        providerId: 'provider-1',
        data: { ...formData, activeZone },
      });
    } catch {
      setSaved(false);
    }
    setTimeout(() => setSaved(false), 2000);
  }, [activePatient, formData, activeZone]);

  const zoneSectionMap: Record<string, string> = { 'ear-r': 'ear', 'ear-l': 'ear', nose: 'nose', throat: 'throat', larynx: 'throat' };

  return (
    <div className="min-h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${accentColor}15` }}>
            <Ear className="h-4 w-4" style={{ color: accentColor }} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white font-display">ENT Workspace</h1>
            <p className="text-[10px] text-white/50 font-ui">Head & neck examination</p>
          </div>
        </div>
        <button onClick={handleSave} className="flex items-center gap-1.5 rounded-[12px] px-3.5 py-2 text-[11px] font-semibold font-ui transition-all" style={{ backgroundColor: accentColor, color: '#0B0D10' }}>
          <Save className="h-3 w-3" />
          {saved ? 'Saved!' : 'Save Encounter'}
        </button>
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-4">
        <div className={cn(glassCard, 'p-4 flex flex-col items-center')}>
          <h3 className="text-[11px] font-semibold text-white/50 font-ui mb-3 uppercase tracking-wider">Select Region</h3>
          <ENTheadSVG activeZone={activeZone} setActiveZone={setActiveZone} />
          <div className="mt-3 w-full space-y-1">
            {ZONES.map(zone => (
              <button
                key={zone.id}
                onClick={() => setActiveZone(zone.id)}
                className={cn(
                  'w-full text-left rounded-[10px] px-3 py-2 text-xs font-medium font-ui transition-all',
                  activeZone === zone.id
                    ? 'bg-[#2EE59D]/10 text-[#2EE59D]'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03]',
                )}
              >
                <span className="mr-2">{zone.icon}</span>
                {zone.label}
              </button>
            ))}
          </div>
        </div>

        <AudiogramPlotter />
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-4">
        <div className={cn(glassCard, 'p-5')}>
          <div className="flex items-center gap-2 mb-3">
            <Mic className="h-4 w-4" style={{ color: accentColor }} />
            <h3 className="text-sm font-semibold text-white font-display">Voice Analysis</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-[14px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-4 text-center">
              <Activity className="h-6 w-6 text-white/20 mx-auto mb-2" />
              <p className="text-[10px] text-white/30 font-ui">Record voice sample for acoustic analysis</p>
              <button className="mt-2 rounded-[10px] bg-[#2EE59D]/10 text-[#2EE59D] px-3 py-1.5 text-[9px] font-medium font-ui hover:bg-[#2EE59D]/20 transition-all border border-[#2EE59D]/20">
                Start Recording
              </button>
            </div>
          </div>
        </div>

        <div className={cn(glassCard, 'p-5')}>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4" style={{ color: accentColor }} />
            <h3 className="text-sm font-semibold text-white font-display">Endoscopy</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['Nasal', 'Laryngeal'].map(type => (
              <div key={type} className="aspect-[4/3] rounded-[14px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] flex flex-col items-center justify-center hover:bg-white/[0.04] cursor-pointer">
                <Activity className="h-5 w-5 text-white/20 mb-1" />
                <span className="text-[9px] text-white/30 font-ui">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SpecialtyFormRenderer template={entTemplate} formData={formData} onChange={setFormData} accentColor={accentColor} />
    </div>
  );
}
