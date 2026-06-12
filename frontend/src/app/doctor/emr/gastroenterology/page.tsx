/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/doctor/emr/gastroenterology/page.tsx
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
import { ScanLine, Save, Activity, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpecialtyFormRenderer } from '@/features/specialties/components/specialty-form-renderer';
import type { SpecialtyTemplate } from '@/types/specialties';
import { usePatientStore } from '@/stores/patient-store';
import { specialtyApi } from '@/lib/specialty-api';

const accentColor = '#F39C12';
const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';

type QuadrantKey = 'ruq' | 'luq' | 'rlq' | 'llq';

const QUADRANTS: { id: QuadrantKey; label: string; desc: string }[] = [
  { id: 'ruq', label: 'Right Upper Quadrant (RUQ)', desc: 'Liver, Gallbladder' },
  { id: 'luq', label: 'Left Upper Quadrant (LUQ)', desc: 'Stomach, Spleen' },
  { id: 'rlq', label: 'Right Lower Quadrant (RLQ)', desc: 'Appendix, Cecum' },
  { id: 'llq', label: 'Left Lower Quadrant (LLQ)', desc: 'Sigmoid Colon' }
];

const FINDING_LEVELS = [
  { value: 'normal', label: 'Soft, Non-tender', color: 'rgba(255,255,255,0.1)' },
  { value: 'tenderness', label: 'Tender', color: '#FFD84D' },
  { value: 'guarding', label: 'Guarding', color: '#FF9F0A' },
  { value: 'rebound', label: 'Rebound Pain', color: '#FF5A5A' }
];

function AbdominalMap({ activeRegion, findings, onSelect, onUpdateFinding }: {
  activeRegion: QuadrantKey | null;
  findings: Record<QuadrantKey, string>;
  onSelect: (q: QuadrantKey) => void;
  onUpdateFinding: (q: QuadrantKey, level: string) => void;
}) {
  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" style={{ color: accentColor }} />
          <h3 className="text-sm font-semibold text-white font-display">Abdominal Palpation Map</h3>
        </div>
        <span className="text-[9px] text-white/30 font-ui">Click quadrant to record finding</span>
      </div>

      <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
        {/* Abdomen Grid representing 4 quadrants */}
        <div className="grid grid-cols-2 grid-rows-2 w-28 h-28 border border-white/10 rounded-[12px] overflow-hidden shrink-0 bg-[#0B0D10] relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-px bg-white/10" />
            <div className="h-full w-px bg-white/10 absolute left-1/2" />
          </div>
          {QUADRANTS.map(q => {
            const f = findings[q.id] ?? 'normal';
            const fMeta = FINDING_LEVELS.find(lvl => lvl.value === f);
            const isActive = activeRegion === q.id;
            return (
              <button key={q.id} onClick={() => onSelect(q.id)}
                className={cn('flex flex-col items-center justify-center p-1 relative text-[8px] font-bold transition-all',
                  isActive ? 'ring-2 ring-inset ring-[#F39C12]' : '')}
                style={{ backgroundColor: `${fMeta?.color}15` }}>
                <span style={{ color: fMeta?.color ?? '#fff' }}>{q.id.toUpperCase()}</span>
                {f !== 'normal' && <span className="text-[7px] opacity-60 mt-0.5" style={{ color: fMeta?.color }}>{fMeta?.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Selected quadrant findings editor */}
        <div className="space-y-2">
          {activeRegion ? (
            <div>
              <p className="text-[10px] font-semibold text-white font-ui">{QUADRANTS.find(q => q.id === activeRegion)?.label}</p>
              <p className="text-[8px] text-white/40 font-ui mb-2">{QUADRANTS.find(q => q.id === activeRegion)?.desc}</p>
              <div className="flex flex-col gap-1">
                {FINDING_LEVELS.map(lvl => (
                  <button key={lvl.value} onClick={() => onUpdateFinding(activeRegion, lvl.value)}
                    className={cn('text-[9px] px-2 py-1 rounded-[8px] font-ui transition-all border text-left flex items-center gap-1.5',
                      findings[activeRegion] === lvl.value
                        ? 'bg-white/[0.08] text-white font-medium'
                        : 'bg-transparent border-transparent text-white/40 hover:text-white/60')}
                    style={findings[activeRegion] === lvl.value ? { borderColor: lvl.color } : {}}>
                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: lvl.color }} />
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-white/30 font-ui text-center">Click a quadrant on the left to set active findings</p>
          )}
        </div>
      </div>
    </div>
  );
}

function BristolStoolChart({
  selected,
  onChangeSelected
}: {
  selected: number | null;
  onChangeSelected: (v: number) => void;
}) {
  const types = [
    { type: 1, desc: 'Separate hard lumps (severe constipation)' },
    { type: 2, desc: 'Lumpy and sausage-like (mild constipation)' },
    { type: 3, desc: 'Like a sausage with cracks on surface (normal)' },
    { type: 4, desc: 'Like a sausage or snake, smooth/soft (ideal)' },
    { type: 5, desc: 'Soft blobs with clear-cut edges (lacking fiber)' },
    { type: 6, desc: 'Mushy consistency, ragged edges (mild diarrhea)' },
    { type: 7, desc: 'Watery, no solid pieces (severe diarrhea)' }
  ];

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4" style={{ color: accentColor }} />
          <h3 className="text-sm font-semibold text-white font-display">Bristol Stool Chart Selection</h3>
        </div>
        {selected !== null && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={selected === 3 || selected === 4 ? { backgroundColor: '#2EE59D20', color: '#2EE59D' } : { backgroundColor: '#FFD84D20', color: '#FFD84D' }}>
            Type {selected} {selected === 4 || selected === 3 ? 'Ideal' : 'Abnormal'}
          </span>
        )}
      </div>

      <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
        {types.map(t => (
          <button key={t.type} onClick={() => onChangeSelected(t.type)}
            className={cn('w-full flex items-center justify-between rounded-[10px] px-2.5 py-1.5 text-[10px] font-medium font-ui border transition-all text-left',
              selected === t.type
                ? 'bg-white/[0.06] border-white/20 text-white font-semibold shadow-inner'
                : 'bg-white/[0.01] border-transparent text-white/40 hover:text-white/60')}
          >
            <span>Type {t.type}</span>
            <span className="text-[8px] opacity-75 font-normal truncate max-w-[170px]">{t.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const gastroTemplate: SpecialtyTemplate = {
  id: 'gastroenterology-comprehensive',
  name: 'Gastrointestinal Evaluation',
  description: 'Abdominal palpation, bowel habits, endoscopy/colonoscopy review',
  sections: [
    { id: 'chief-complaint', title: 'Chief Complaint', type: 'form', fields: [
      { id: 'presenting', label: 'Presenting GI Symptoms', type: 'textarea', required: true, placeholder: 'Abdominal pain, dyspepsia, heartburn, nausea, vomiting, bowel change, bleeding...' },
      { id: 'bowelHabits', label: 'Bowel Habit Frequency', type: 'select', options: [
        { label: 'Normal (1-3x/day or every other day)', value: 'normal' },
        { label: 'Constipation (less than 3x/week)', value: 'constipation' },
        { label: 'Diarrhea / Loose stools', value: 'diarrhea' }
      ]},
      { id: 'alarmingSymptoms', label: 'Alarm Symptoms Checked', type: 'multiselect', options: [
        { label: 'None', value: 'none' }, { label: 'Unintentional Weight Loss', value: 'weight_loss' },
        { label: 'Dysphagia', value: 'dysphagia' }, { label: 'Hematemesis', value: 'hematemesis' },
        { label: 'Melena / Rectal Bleeding', value: 'bleeding' }
      ]}
    ]},
    { id: 'exam', title: 'Physical Examination', type: 'form', fields: [
      { id: 'inspection', label: 'Abdominal Inspection', type: 'select', options: [
        { label: 'Flat, symmetrical', value: 'flat' }, { label: 'Distended (generalized)', value: 'distended' },
        { label: 'Surgical scars present', value: 'scars' }
      ]},
      { id: 'bowelSounds', label: 'Bowel Sounds', type: 'select', options: [
        { label: 'Normal active', value: 'normal' }, { label: 'Hyperactive (borborygmi)', value: 'hyperactive' },
        { label: 'Hypoactive', value: 'hypoactive' }, { label: 'Absent', value: 'absent' }
      ]},
      { id: 'palpationNotes', label: 'Palpation Notes (organomegaly, masses...)', type: 'textarea' }
    ]},
    { id: 'investigations', title: 'Investigations & Scopes', type: 'form', fields: [
      { id: 'egdFindings', label: 'Upper Endoscopy (EGD) Findings (if done)', type: 'textarea', placeholder: 'Esophagitis, gastroduodenal ulcers, H. pylori status...' },
      { id: 'colonoscopyFindings', label: 'Colonoscopy Findings (if done)', type: 'textarea', placeholder: 'Polyps, diverticulosis, colitis status...' },
      { id: 'stoolTests', label: 'Stool Analysis (FOBT, Calprotectin...)', type: 'text' }
    ]},
    { id: 'diagnosis-plan', title: 'Diagnosis & Plan', type: 'form', fields: [
      { id: 'diagnosis', label: 'GI Diagnosis', type: 'textarea', required: true, placeholder: 'e.g., GERD, IBS-D, Peptic Ulcer Disease, Ulcerative Colitis...' },
      { id: 'management', label: 'Management Plan (Meds & Diet)', type: 'textarea', placeholder: 'PPI dosing, low FODMAP diet counseling, follow-up scopes...' },
      { id: 'followUp', label: 'Follow-up', type: 'text' }
    ]}
  ]
};

export default function GastroenterologyWorkspace() {
  const { activePatient } = usePatientStore();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [activeRegion, setActiveRegion] = useState<QuadrantKey | null>(null);
  const [findings, setFindings] = useState<Record<QuadrantKey, string>>({
    ruq: 'normal', luq: 'normal', rlq: 'normal', llq: 'normal'
  });
  const [stoolType, setStoolType] = useState<number | null>(4);
  const [saved, setSaved] = useState(false);

  const handleUpdateFinding = (quadrant: QuadrantKey, value: string) => {
    setFindings(prev => ({ ...prev, [quadrant]: value }));
  };

  const handleSave = useCallback(async () => {
    setSaved(true);
    try {
      await specialtyApi.saveEncounter('gastroenterology', {
        encounterId: `enc-${Date.now()}`,
        patientId: activePatient?.id ?? '',
        providerId: 'provider-1',
        data: {
          ...formData,
          abdominalFindings: findings,
          bristolStoolType: stoolType
        }
      });
    } catch { setSaved(false); }
    setTimeout(() => setSaved(false), 2000);
  }, [activePatient, formData, findings, stoolType]);

  return (
    <div className="min-h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${accentColor}15` }}>
            <ScanLine className="h-4 w-4" style={{ color: accentColor }} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white font-display">Gastroenterology OS</h1>
            <p className="text-[10px] text-white/50 font-ui">Palpation Map · Bristol Stool Chart · Endoscopy Review</p>
          </div>
        </div>
        <button onClick={handleSave} className="flex items-center gap-1.5 rounded-[12px] px-3.5 py-2 text-[11px] font-semibold font-ui transition-all" style={{ backgroundColor: accentColor, color: '#0B0D10' }}>
          <Save className="h-3 w-3" />
          {saved ? 'Saved!' : 'Save Encounter'}
        </button>
      </div>

      <div className="grid grid-cols-[1.2fr_1fr] gap-4">
        <AbdominalMap activeRegion={activeRegion} findings={findings} onSelect={setActiveRegion} onUpdateFinding={handleUpdateFinding} />
        <BristolStoolChart selected={stoolType} onChangeSelected={setStoolType} />
      </div>

      <SpecialtyFormRenderer template={gastroTemplate} formData={formData} onChange={setFormData} accentColor={accentColor} />
    </div>
  );
}
