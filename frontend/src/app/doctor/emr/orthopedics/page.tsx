/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/doctor/emr/orthopedics/page.tsx
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
import { Bone, Save, RotateCcw, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpecialtyFormRenderer } from '@/features/specialties/components/specialty-form-renderer';
import type { SpecialtyTemplate } from '@/types/specialties';
import { usePatientStore } from '@/stores/patient-store';
import { specialtyApi } from '@/lib/specialty-api';

const accentColor = '#AF52DE';
const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';

type JointKey = 'shoulder-r' | 'shoulder-l' | 'elbow-r' | 'elbow-l' | 'wrist-r' | 'wrist-l' | 'hip-r' | 'hip-l' | 'knee-r' | 'knee-l' | 'ankle-r' | 'ankle-l' | 'spine-c' | 'spine-l';

const JOINTS: { id: JointKey; label: string; x: number; y: number }[] = [
  { id: 'spine-c', label: 'C-Spine', x: 50, y: 12 },
  { id: 'shoulder-r', label: 'R Shoulder', x: 30, y: 18 },
  { id: 'shoulder-l', label: 'L Shoulder', x: 70, y: 18 },
  { id: 'elbow-r', label: 'R Elbow', x: 22, y: 32 },
  { id: 'elbow-l', label: 'L Elbow', x: 78, y: 32 },
  { id: 'spine-l', label: 'L-Spine', x: 50, y: 36 },
  { id: 'wrist-r', label: 'R Wrist', x: 16, y: 46 },
  { id: 'wrist-l', label: 'L Wrist', x: 84, y: 46 },
  { id: 'hip-r', label: 'R Hip', x: 36, y: 52 },
  { id: 'hip-l', label: 'L Hip', x: 64, y: 52 },
  { id: 'knee-r', label: 'R Knee', x: 34, y: 68 },
  { id: 'knee-l', label: 'L Knee', x: 66, y: 68 },
  { id: 'ankle-r', label: 'R Ankle', x: 34, y: 84 },
  { id: 'ankle-l', label: 'L Ankle', x: 66, y: 84 },
];

const JOINT_CONDITIONS = [
  { value: 'normal', label: 'Normal', color: 'rgba(255,255,255,0.1)' },
  { value: 'tenderness', label: 'Tender', color: '#FFD84D' },
  { value: 'swelling', label: 'Swollen', color: '#FF5A5A' },
  { value: 'restricted', label: 'Restricted ROM', color: '#AF52DE' },
  { value: 'crepitus', label: 'Crepitus', color: '#FF8C00' },
  { value: 'instability', label: 'Unstable', color: '#FF2D55' },
];

function SkeletalDiagram({ selected, conditions, onSelect, onUpdateFinding }: {
  selected: JointKey | null;
  conditions: Record<string, string>;
  onSelect: (j: JointKey) => void;
  onUpdateFinding: (j: JointKey, val: string) => void;
}) {
  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center gap-2 mb-4">
        <Bone className="h-4 w-4" style={{ color: accentColor }} />
        <h3 className="text-sm font-semibold text-white font-display">Skeletal Map</h3>
        <span className="text-[9px] text-white/30 font-ui ml-auto">Click joint to assess</span>
      </div>
      <div className="grid grid-cols-[1fr_1fr] gap-4">
        <svg viewBox="0 0 100 95" className="w-full max-w-[220px] mx-auto">
          {/* Body skeleton outline */}
          <ellipse cx="50" cy="8" rx="10" ry="8" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
          <line x1="50" y1="16" x2="50" y2="46" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1="32" y1="18" x2="22" y2="48" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1="22" y1="48" x2="16" y2="62" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1="68" y1="18" x2="78" y2="48" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1="78" y1="48" x2="84" y2="62" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1="40" y1="46" x2="36" y2="72" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" />
          <line x1="60" y1="46" x2="64" y2="72" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" />
          <line x1="36" y1="72" x2="34" y2="90" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" />
          <line x1="64" y1="72" x2="66" y2="90" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" />

          {JOINTS.map(j => {
            const cond = conditions[j.id] ?? 'normal';
            const condMeta = JOINT_CONDITIONS.find(c => c.value === cond);
            const isSelected = selected === j.id;
            return (
              <g key={j.id} onClick={() => onSelect(j.id)} className="cursor-pointer">
                {isSelected && <circle cx={j.x} cy={j.y} r="8" fill={`${accentColor}20`} />}
                <circle cx={j.x} cy={j.y} r={isSelected ? 5 : 4} fill={condMeta?.color ?? 'rgba(255,255,255,0.1)'} stroke={isSelected ? accentColor : 'rgba(255,255,255,0.2)'} strokeWidth={isSelected ? 1.2 : 0.5} />
                <text x={j.x} y={j.y + 8} textAnchor="middle" fontSize="4" fill="rgba(255,255,255,0.3)" className="font-ui">{j.label}</text>
              </g>
            );
          })}
        </svg>

        <div className="space-y-2">
          <h4 className="text-[10px] font-semibold text-white/30 font-ui tracking-wider uppercase">Condition Legend</h4>
          {JOINT_CONDITIONS.map(c => (
            <div key={c.value} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
              <span className="text-[10px] text-white/50 font-ui">{c.label}</span>
            </div>
          ))}
          {selected && (
            <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[10px] text-white/50 font-ui mb-2">Mark {JOINTS.find(j => j.id === selected)?.label}:</p>
              <div className="flex flex-wrap gap-1">
                {JOINT_CONDITIONS.map(c => (
                  <button key={c.value} onClick={() => onUpdateFinding(selected, c.value)}
                    className="text-[9px] px-2 py-1 rounded-[8px] font-ui transition-all"
                    style={{ backgroundColor: `${c.color}20`, color: c.color, border: `1px solid ${c.color}40` }}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ROMChart() {
  const joints = [
    { label: 'Cervical Flex/Ext', normal: '80/70', measured: '65/60' },
    { label: 'Shoulder Abd/Add', normal: '180/50', measured: '120/50' },
    { label: 'Elbow Flex/Ext', normal: '150/0', measured: '130/0' },
    { label: 'Hip Flex/Ext', normal: '120/30', measured: '85/20' },
    { label: 'Knee Flex/Ext', normal: '150/0', measured: '90/5' },
    { label: 'Ankle DF/PF', normal: '20/50', measured: '15/45' },
  ];

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center gap-2 mb-4">
        <RotateCcw className="h-4 w-4" style={{ color: accentColor }} />
        <h3 className="text-sm font-semibold text-white font-display">Range of Motion</h3>
        <span className="text-[9px] text-white/40 font-ui ml-auto">Normal vs Measured (degrees)</span>
      </div>
      <div className="space-y-2.5">
        {joints.map(j => {
          const [measFlex] = j.measured.split('/').map(Number);
          const [normFlex] = j.normal.split('/').map(Number);
          const pct = Math.min(100, ((measFlex ?? 0) / (normFlex ?? 1)) * 100);
          const color = pct > 80 ? '#2EE59D' : pct > 60 ? '#FFD84D' : '#FF5A5A';
          return (
            <div key={j.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-white/60 font-ui">{j.label}</span>
                <div className="flex items-center gap-2 text-[9px] font-ui">
                  <span className="text-white/30">Norm: {j.normal}°</span>
                  <span style={{ color }}>Got: {j.measured}°</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const orthoTemplate: SpecialtyTemplate = {
  id: 'orthopedics-comprehensive',
  name: 'Orthopedic Assessment',
  description: 'Musculoskeletal evaluation, joint exam, imaging review',
  sections: [
    { id: 'chief-complaint', title: 'Chief Complaint', type: 'form', fields: [
      { id: 'presenting', label: 'Presenting Complaint', type: 'textarea', required: true, placeholder: 'Pain, deformity, swelling, stiffness, instability...' },
      { id: 'location', label: 'Primary Location', type: 'select', options: [
        { label: 'Cervical Spine', value: 'cervical' }, { label: 'Lumbar Spine', value: 'lumbar' },
        { label: 'Shoulder', value: 'shoulder' }, { label: 'Elbow', value: 'elbow' },
        { label: 'Wrist/Hand', value: 'wrist' }, { label: 'Hip', value: 'hip' },
        { label: 'Knee', value: 'knee' }, { label: 'Ankle/Foot', value: 'ankle' },
      ]},
      { id: 'onsetMechanism', label: 'Mechanism of Injury', type: 'select', options: [
        { label: 'Trauma', value: 'trauma' }, { label: 'Overuse/Repetitive', value: 'overuse' },
        { label: 'Degenerative', value: 'degenerative' }, { label: 'Spontaneous', value: 'spontaneous' },
      ]},
      { id: 'vasScore', label: 'VAS Pain Score (0-10)', type: 'number' },
    ]},
    { id: 'joint-exam', title: 'Joint Examination', type: 'assessment', fields: [
      { id: 'inspection', label: 'Inspection', type: 'textarea', placeholder: 'Deformity, swelling, erythema, muscle wasting...' },
      { id: 'palpation', label: 'Palpation', type: 'textarea', placeholder: 'Point tenderness, crepitus, warmth...' },
      { id: 'specialTests', label: 'Special Tests', type: 'textarea', placeholder: 'McMurray, Lachman, Spurling, SLAP, Neer... Results:' },
      { id: 'neurovascular', label: 'Neurovascular Status', type: 'textarea', placeholder: 'Sensation, motor power, pulses...' },
    ]},
    { id: 'imaging', title: 'Imaging Review', type: 'imaging', fields: [
      { id: 'xray', label: 'X-Ray Findings', type: 'textarea', placeholder: 'AP/Lateral views: fracture, OA grade, alignment...' },
      { id: 'mri', label: 'MRI Findings', type: 'textarea', placeholder: 'Soft tissue, disc, ligament, cartilage...' },
      { id: 'ct', label: 'CT Findings', type: 'textarea' },
      { id: 'kelgrenScore', label: 'Kellgren-Lawrence Grade (OA)', type: 'select', options: [
        { label: 'Grade 0 - Normal', value: '0' }, { label: 'Grade 1 - Doubtful', value: '1' },
        { label: 'Grade 2 - Minimal', value: '2' }, { label: 'Grade 3 - Moderate', value: '3' },
        { label: 'Grade 4 - Severe', value: '4' },
      ]},
    ]},
    { id: 'diagnosis-plan', title: 'Diagnosis & Plan', type: 'form', fields: [
      { id: 'diagnosis', label: 'Diagnosis', type: 'textarea', required: true },
      { id: 'management', label: 'Management', type: 'select', options: [
        { label: 'Conservative - RICE + NSAID', value: 'conservative' },
        { label: 'Physiotherapy', value: 'physio' },
        { label: 'Intra-articular Injection', value: 'injection' },
        { label: 'Splinting/Casting', value: 'splint' },
        { label: 'Surgical Intervention', value: 'surgery' },
      ]},
      { id: 'surgicalPlan', label: 'Surgical Plan (if applicable)', type: 'textarea' },
      { id: 'rehabilitation', label: 'Rehabilitation Protocol', type: 'textarea' },
      { id: 'followUp', label: 'Follow-up', type: 'text' },
    ]},
  ],
};

export default function OrthopedicsWorkspace() {
  const { activePatient } = usePatientStore();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [selectedJoint, setSelectedJoint] = useState<JointKey | null>(null);
  const [jointConditions, setJointConditions] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const handleUpdateFinding = (joint: JointKey, value: string) => {
    setJointConditions(prev => ({ ...prev, [joint]: value }));
  };

  const handleSave = useCallback(async () => {
    setSaved(true);
    try {
      await specialtyApi.saveEncounter('orthopedics', {
        encounterId: `enc-${Date.now()}`,
        patientId: activePatient?.id ?? '',
        providerId: 'provider-1',
        data: { ...formData, jointConditions },
        findings: Object.entries(jointConditions).filter(([, v]) => v !== 'normal').map(([k, v]) => ({
          category: 'joint_finding', findingKey: k,
          findingValue: { joint: k, condition: v },
          severity: v === 'instability' || v === 'swelling' ? 'severe' : 'moderate',
          status: 'active',
        })),
      });
    } catch { setSaved(false); }
    setTimeout(() => setSaved(false), 2000);
  }, [activePatient, formData, jointConditions]);

  return (
    <div className="min-h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${accentColor}15` }}>
            <Activity className="h-4 w-4" style={{ color: accentColor }} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white font-display">Orthopedics OS</h1>
            <p className="text-[10px] text-white/50 font-ui">Skeletal Map · ROM · Joint Exam · Imaging</p>
          </div>
        </div>
        <button onClick={handleSave} className="flex items-center gap-1.5 rounded-[12px] px-3.5 py-2 text-[11px] font-semibold font-ui transition-all" style={{ backgroundColor: accentColor, color: '#0B0D10' }}>
          <Save className="h-3 w-3" />
          {saved ? 'Saved!' : 'Save Encounter'}
        </button>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-4">
        <SkeletalDiagram selected={selectedJoint} conditions={jointConditions} onSelect={setSelectedJoint} onUpdateFinding={handleUpdateFinding} />
        <ROMChart />
      </div>

      <SpecialtyFormRenderer template={orthoTemplate} formData={formData} onChange={setFormData} accentColor={accentColor} />
    </div>
  );
}
