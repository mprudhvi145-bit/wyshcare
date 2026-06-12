/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/doctor/emr/psychiatry/page.tsx
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
import { HeartPulse, Save, Smile, AlertTriangle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpecialtyFormRenderer } from '@/features/specialties/components/specialty-form-renderer';
import type { SpecialtyTemplate } from '@/types/specialties';
import { usePatientStore } from '@/stores/patient-store';
import { specialtyApi } from '@/lib/specialty-api';

const accentColor = '#E67E22';
const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';

const PHQ9_ITEMS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself or that you are a failure',
  'Trouble concentrating on things',
  'Moving or speaking slowly, or being fidgety/restless',
  'Thoughts of being better off dead, or hurting yourself'
];

function Phq9Gad7Panel({
  phqScores,
  onChangePhq,
  gadScore,
  onChangeGad
}: {
  phqScores: number[];
  onChangePhq: (idx: number, val: number) => void;
  gadScore: number;
  onChangeGad: (val: number) => void;
}) {
  const phqTotal = phqScores.reduce((a, b) => a + b, 0);

  const getPhqSeverity = (score: number) => {
    if (score <= 4) return { label: 'Minimal Depression', color: '#2EE59D' };
    if (score <= 9) return { label: 'Mild Depression', color: '#8FD3D1' };
    if (score <= 14) return { label: 'Moderate Depression', color: '#FFD84D' };
    if (score <= 19) return { label: 'Moderately Severe', color: '#FF8C00' };
    return { label: 'Severe Depression', color: '#FF5A5A' };
  };

  const getGadSeverity = (score: number) => {
    if (score <= 4) return { label: 'Minimal Anxiety', color: '#2EE59D' };
    if (score <= 9) return { label: 'Mild Anxiety', color: '#8FD3D1' };
    if (score <= 14) return { label: 'Moderate Anxiety', color: '#FFD84D' };
    return { label: 'Severe Anxiety', color: '#FF5A5A' };
  };

  const phqSeverity = getPhqSeverity(phqTotal);
  const gadSeverity = getGadSeverity(gadScore);

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center gap-2 mb-4">
        <HeartPulse className="h-4 w-4" style={{ color: accentColor }} />
        <h3 className="text-sm font-semibold text-white font-display">PHQ-9 Depression Screener</h3>
        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full ml-auto" style={{ backgroundColor: `${phqSeverity.color}20`, color: phqSeverity.color }}>
          {phqSeverity.label} ({phqTotal})
        </span>
      </div>

      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
        {PHQ9_ITEMS.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-1 rounded-[10px] bg-white/[0.01] border border-white/[0.04] p-2">
            <span className="text-[10px] text-white/70 font-ui leading-tight">{idx + 1}. {item}</span>
            <div className="flex gap-1 mt-1 justify-between">
              {['Not at all', 'Several days', 'More than half', 'Nearly every day'].map((lbl, scoreVal) => (
                <button key={scoreVal} onClick={() => onChangePhq(idx, scoreVal)}
                  className={cn('text-[8px] rounded-[6px] px-2 py-1 transition-all font-ui text-left border flex-1 text-center', 
                    phqScores[idx] === scoreVal 
                      ? 'bg-[#E67E22]15 border-[#E67E22]30 text-[#E67E22] font-semibold' 
                      : 'bg-white/[0.02] border-transparent text-white/40 hover:text-white/60')}
                >
                  {scoreVal}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
        <div>
          <h4 className="text-[11px] font-semibold text-white font-display">GAD-7 Anxiety Score</h4>
          <span className="text-[9px] text-white/40 font-ui">{gadSeverity.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <input type="range" min="0" max="21" value={gadScore} onChange={(e) => onChangeGad(parseInt(e.target.value))}
            className="w-24 accent-[#E67E22]" />
          <span className="text-sm font-bold text-white font-mono">{gadScore} <span className="text-[9px] text-white/30">/21</span></span>
        </div>
      </div>
    </div>
  );
}

function MseDashboard({
  selected,
  onChangeMse
}: {
  selected: Record<string, string>;
  onChangeMse: (cat: string, val: string) => void;
}) {
  const categories = [
    { label: 'Appearance', options: ['Neat', 'Unkempt', 'Disheveled', 'Appropriate'] },
    { label: 'Behavior', options: ['Cooperative', 'Agitated', 'Restless', 'Guarded', 'Hostile'] },
    { label: 'Speech', options: ['Normal rate/tone', 'Pressured', 'Slowed', 'Monotone', 'Mutistic'] },
    { label: 'Affect', options: ['Congruent', 'Flat', 'Blunted', 'Labile', 'Constricted'] },
    { label: 'Thought Form', options: ['Linear/Logical', 'Flight of ideas', 'Tangential', 'Loose associations'] }
  ];

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center gap-2 mb-4">
        <Smile className="h-4 w-4" style={{ color: accentColor }} />
        <h3 className="text-sm font-semibold text-white font-display">Mental Status Exam (MSE) Helper</h3>
      </div>

      <div className="space-y-3">
        {categories.map(cat => (
          <div key={cat.label} className="grid grid-cols-[100px_1fr] gap-2 items-center">
            <span className="text-[10px] text-white/50 font-ui font-semibold">{cat.label}</span>
            <div className="flex flex-wrap gap-1">
              {cat.options.map(opt => (
                <button key={opt} onClick={() => onChangeMse(cat.label, opt)}
                  className={cn('text-[9px] rounded-[8px] px-2 py-0.5 border transition-all font-ui', 
                    selected[cat.label] === opt 
                      ? 'bg-white/[0.08] border-white/30 text-white font-medium' 
                      : 'bg-white/[0.01] border-transparent text-white/40 hover:text-white/60')}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const psychTemplate: SpecialtyTemplate = {
  id: 'psychiatry-comprehensive',
  name: 'Psychiatric Evaluation',
  description: 'Mental status examination, risk assessment, and therapeutic charting',
  sections: [
    { id: 'history', title: 'History of Present Illness', type: 'form', fields: [
      { id: 'presenting', label: 'Presenting Psychiatric Symptoms', type: 'textarea', required: true, placeholder: 'Mood changes, anxiety, hallucinations, sleep disturbance, trauma...' },
      { id: 'stressors', label: 'Psychosocial Stressors', type: 'textarea', placeholder: 'Family, work, financial, bereavement...' },
      { id: 'pastPsychHistory', label: 'Past Psychiatric History', type: 'textarea', placeholder: 'Prior diagnoses, hospitalizations, treatments...' }
    ]},
    { id: 'risk-assessment', title: 'Risk Assessment', type: 'form', fields: [
      { id: 'suicidal', label: 'Suicidal Ideation', type: 'select', options: [
        { label: 'Denied / Absent', value: 'denied' }, { label: 'Passive Ideation (no plan)', value: 'passive' },
        { label: 'Active Ideation (has intent/plan)', value: 'active' }
      ]},
      { id: 'homicidal', label: 'Homicidal Ideation', type: 'select', options: [
        { label: 'Denied / Absent', value: 'denied' }, { label: 'Active Ideation / Threatening', value: 'active' }
      ]},
      { id: 'selfHarm', label: 'Self-Harm Behavior', type: 'select', options: [
        { label: 'No history', value: 'none' }, { label: 'Active/Recent self-injury', value: 'active' },
        { label: 'Past history only', value: 'past' }
      ]}
    ]},
    { id: 'mse', title: 'Mental State Examination (Detailed)', type: 'form', fields: [
      { id: 'thoughtContent', label: 'Thought Content', type: 'textarea', placeholder: 'Delusions, obsessions, phobias, suicidal thoughts...' },
      { id: 'perception', label: 'Perceptions', type: 'textarea', placeholder: 'Auditory/visual hallucinations, illusions, depersonalization...' },
      { id: 'insightJudgment', label: 'Insight & Judgment', type: 'select', options: [
        { label: 'Good/Intact', value: 'good' }, { label: 'Fair/Partial', value: 'fair' }, { label: 'Poor/Impaired', value: 'poor' }
      ]}
    ]},
    { id: 'diagnosis-plan', title: 'Diagnosis & Plan', type: 'form', fields: [
      { id: 'diagnosis', label: 'DSM-5 / ICD-10 Diagnoses', type: 'textarea', required: true, placeholder: 'e.g., Major Depressive Disorder (F32.9), GAD (F41.1)...' },
      { id: 'treatment', label: 'Pharmacotherapy & Management', type: 'textarea', placeholder: 'Medications, dosages, therapy type, side effects discussed...' },
      { id: 'safetyPlan', label: 'Safety Plan Details', type: 'textarea', placeholder: 'Emergency contacts, crisis resources shared...' }
    ]}
  ]
};

export default function PsychiatryWorkspace() {
  const { activePatient } = usePatientStore();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [phqScores, setPhqScores] = useState<number[]>(new Array(9).fill(0));
  const [gadScore, setGadScore] = useState(4);
  const [mseSelected, setMseSelected] = useState<Record<string, string>>({
    Appearance: 'Neat', Behavior: 'Cooperative', Speech: 'Normal rate/tone', Affect: 'Congruent', 'Thought Form': 'Linear/Logical'
  });
  const [saved, setSaved] = useState(false);

  const handlePhqChange = useCallback((index: number, val: number) => {
    setPhqScores(prev => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  }, []);

  const handleMseChange = useCallback((cat: string, val: string) => {
    setMseSelected(prev => ({ ...prev, [cat]: val }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaved(true);
    try {
      await specialtyApi.saveEncounter('psychiatry', {
        encounterId: `enc-${Date.now()}`,
        patientId: activePatient?.id ?? '',
        providerId: 'provider-1',
        data: {
          ...formData,
          phq9Scores: phqScores,
          phq9Total: phqScores.reduce((a, b) => a + b, 0),
          gad7Score: gadScore,
          mseSelections: mseSelected
        }
      });
    } catch { setSaved(false); }
    setTimeout(() => setSaved(false), 2000);
  }, [activePatient, formData, phqScores, gadScore, mseSelected]);

  return (
    <div className="min-h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${accentColor}15` }}>
            <HeartPulse className="h-4 w-4" style={{ color: accentColor }} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white font-display">Psychiatry OS</h1>
            <p className="text-[10px] text-white/50 font-ui">PHQ-9 screener · Mental Status Exam · Safety & Therapy Notes</p>
          </div>
        </div>
        <button onClick={handleSave} className="flex items-center gap-1.5 rounded-[12px] px-3.5 py-2 text-[11px] font-semibold font-ui transition-all" style={{ backgroundColor: accentColor, color: '#0B0D10' }}>
          <Save className="h-3 w-3" />
          {saved ? 'Saved!' : 'Save Encounter'}
        </button>
      </div>

      <div className="grid grid-cols-[1.3fr_1fr] gap-4">
        <Phq9Gad7Panel
          phqScores={phqScores}
          onChangePhq={handlePhqChange}
          gadScore={gadScore}
          onChangeGad={setGadScore}
        />
        <MseDashboard
          selected={mseSelected}
          onChangeMse={handleMseChange}
        />
      </div>

      <SpecialtyFormRenderer template={psychTemplate} formData={formData} onChange={setFormData} accentColor={accentColor} />
    </div>
  );
}
