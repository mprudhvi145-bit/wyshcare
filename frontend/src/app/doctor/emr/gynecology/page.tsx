/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/doctor/emr/gynecology/page.tsx
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
import { Venus, Save, Calendar, Activity, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpecialtyFormRenderer } from '@/features/specialties/components/specialty-form-renderer';
import type { SpecialtyTemplate } from '@/types/specialties';
import { usePatientStore } from '@/stores/patient-store';
import { specialtyApi } from '@/lib/specialty-api';

const accentColor = '#FF6482';
const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';

function MenstrualCycleTracker({ day, onChangeDay }: { day: number; onChangeDay: (d: number) => void }) {
  const getPhase = (d: number) => {
    if (d >= 1 && d <= 5) return { label: 'Menstrual Phase', color: '#FF6482', desc: 'Low estrogen/progesterone. Uterine lining sheds.' };
    if (d >= 6 && d <= 13) return { label: 'Follicular Phase', color: '#5856D6', desc: 'FSH rises, follicles develop, estrogen builds lining.' };
    if (d === 14) return { label: 'Ovulation', color: '#34C759', desc: 'LH surge triggers egg release. High fertility.' };
    return { label: 'Luteal Phase', color: '#FF9F0A', desc: 'Progesterone high. Uterine lining prepared for implantation.' };
  };

  const phase = getPhase(day);

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4" style={{ color: accentColor }} />
        <h3 className="text-sm font-semibold text-white font-display">Interactive Cycle Tracker</h3>
        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full ml-auto" style={{ backgroundColor: `${phase.color}20`, color: phase.color }}>
          {phase.label}
        </span>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {/* Background track */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
            
            {/* Menstrual Phase (Days 1-5) */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="#FF6482" strokeWidth="6"
              strokeDasharray={`${(5 / 28) * 251.2} 251.2`} strokeDashoffset="0" opacity="0.6" />
              
            {/* Follicular Phase (Days 6-13) */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="#5856D6" strokeWidth="6"
              strokeDasharray={`${(8 / 28) * 251.2} 251.2`} strokeDashoffset={`-${(5 / 28) * 251.2}`} opacity="0.6" />
              
            {/* Ovulation (Day 14) */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="#34C759" strokeWidth="6"
              strokeDasharray={`${(1 / 28) * 251.2} 251.2`} strokeDashoffset={`-${(13 / 28) * 251.2}`} opacity="0.8" />
              
            {/* Luteal Phase (Days 15-28) */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="#FF9F0A" strokeWidth="6"
              strokeDasharray={`${(14 / 28) * 251.2} 251.2`} strokeDashoffset={`-${(14 / 28) * 251.2}`} opacity="0.6" />

            {/* Current day indicator */}
            <circle cx={50 + 40 * Math.cos((day / 28) * 2 * Math.PI)} cy={50 + 40 * Math.sin((day / 28) * 2 * Math.PI)} r="4" fill="#fff" stroke={phase.color} strokeWidth="2" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-white/30 font-ui uppercase">Cycle Day</span>
            <span className="text-3xl font-bold text-white font-display">{day}</span>
            <span className="text-[9px] text-white/40 font-ui">of 28 days</span>
          </div>
        </div>

        <input type="range" min="1" max="28" value={day} onChange={(e) => onChangeDay(parseInt(e.target.value))}
          className="w-full mt-4 accent-[#FF6482]" />
        
        <p className="text-[10px] text-white/60 text-center font-ui mt-3 leading-relaxed">
          {phase.desc}
        </p>
      </div>
    </div>
  );
}

function OBGestationalWheel({ lmpDate, onChangeLmpDate }: { lmpDate: string; onChangeLmpDate: (d: string) => void }) {
  const calculateWeeks = () => {
    const lmp = new Date(lmpDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lmp.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    
    // EDD is LMP + 280 days
    const edd = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
    return { weeks, days, edd: edd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) };
  };

  const info = calculateWeeks();

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-4 w-4" style={{ color: accentColor }} />
        <h3 className="text-sm font-semibold text-white font-display">OB Gestational Calculator</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-[10px] text-white/40 font-ui uppercase block mb-1">Last Menstrual Period (LMP)</label>
          <input type="date" value={lmpDate} onChange={(e) => onChangeLmpDate(e.target.value)}
            className="w-full rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-white/[0.02] p-2 text-xs text-white focus:outline-none focus:border-[#FF6482]/20" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-[12px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3 text-center">
            <span className="text-[8px] text-white/30 font-ui block">Gestational Age</span>
            <span className="text-lg font-bold text-white font-display">{info.weeks}w {info.days}d</span>
          </div>
          <div className="rounded-[12px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3 text-center">
            <span className="text-[8px] text-white/30 font-ui block">Estimated Delivery (EDD)</span>
            <span className="text-sm font-semibold text-white font-display block mt-1">{info.edd}</span>
          </div>
        </div>

        <div className="rounded-[12px] border border-[#FF6482]/20 bg-[#FF6482]/5 p-2.5 text-center">
          <div className="flex items-center gap-1.5 justify-center text-[10px] text-[#FF6482] font-semibold">
            <Sparkles className="h-3 w-3" />
            <span>Trimester: {info.weeks < 13 ? 'First Trimester' : info.weeks < 27 ? 'Second Trimester' : 'Third Trimester'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const gyneTemplate: SpecialtyTemplate = {
  id: 'gynecology-comprehensive',
  name: 'Obstetrics & Gynecology Evaluation',
  description: 'OB/GYN physical evaluation, history, and pregnancy assessment',
  sections: [
    { id: 'chief-complaint', title: 'Chief Complaint', type: 'form', fields: [
      { id: 'presenting', label: 'Presenting Symptoms', type: 'textarea', required: true, placeholder: 'Pelvic pain, abnormal bleeding, discharge, pregnancy check...' },
      { id: 'gpal', label: 'GPAL (Gravida, Para, Abortus, Living)', type: 'text', placeholder: 'e.g., G2 P1 A0 L1' },
      { id: 'lmp', label: 'Last Menstrual Period Date', type: 'text', placeholder: 'YYYY-MM-DD' },
      { id: 'menstrualHistory', label: 'Menstrual History notes', type: 'textarea', placeholder: 'Regularity, flow severity, dysmenorrhea...' }
    ]},
    { id: 'exam', title: 'Physical & Pelvic Exam', type: 'form', fields: [
      { id: 'abdominal', label: 'Abdominal Examination', type: 'textarea', placeholder: 'Fundal height, tenderness, masses...' },
      { id: 'speculum', label: 'Speculum Exam', type: 'textarea', placeholder: 'Cervix appearance, vaginal discharge...' },
      { id: 'bimanual', label: 'Bimanual Exam', type: 'textarea', placeholder: 'Uterine size, adnexal tenderness/masses...' }
    ]},
    { id: 'diagnostic', title: 'Diagnostic Tests & Screening', type: 'form', fields: [
      { id: 'papSmear', label: 'Pap Smear Status', type: 'select', options: [
        { label: 'Not due', value: 'not_due' }, { label: 'Performed today', value: 'performed_today' },
        { label: 'Abnormal - historical', value: 'abnormal' }, { label: 'Due/Refused', value: 'due' }
      ]},
      { id: 'usgFindings', label: 'Ultrasound (USG) Findings', type: 'textarea', placeholder: 'Gestational sac, CRL, fibroids, ovaries...' },
      { id: 'pregnancyTest', label: 'Urine Pregnancy Test (UPT)', type: 'select', options: [
        { label: 'Not indicated', value: 'na' }, { label: 'Positive', value: 'positive' }, { label: 'Negative', value: 'negative' }
      ]}
    ]},
    { id: 'diagnosis-plan', title: 'Diagnosis & Management', type: 'form', fields: [
      { id: 'diagnosis', label: 'Diagnosis', type: 'textarea', required: true },
      { id: 'management', label: 'Management Plan', type: 'textarea', placeholder: 'Meds, prenatal vitamins, surgical option...' },
      { id: 'contraception', label: 'Contraceptive Counseling', type: 'textarea' },
      { id: 'followUp', label: 'Follow-up Timeframe', type: 'text' }
    ]}
  ]
};

export default function GynecologyWorkspace() {
  const { activePatient } = usePatientStore();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [day, setDay] = useState(14);
  const [lmpDate, setLmpDate] = useState('2026-01-01');
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(async () => {
    setSaved(true);
    try {
      await specialtyApi.saveEncounter('gynecology', {
        encounterId: `enc-${Date.now()}`,
        patientId: activePatient?.id ?? '',
        providerId: 'provider-1',
        data: { ...formData, menstrualCycleDay: day, lmpDate },
      });
    } catch { setSaved(false); }
    setTimeout(() => setSaved(false), 2000);
  }, [activePatient, formData, day, lmpDate]);

  return (
    <div className="min-h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${accentColor}15` }}>
            <Venus className="h-4 w-4" style={{ color: accentColor }} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white font-display">Gynecology OS</h1>
            <p className="text-[10px] text-white/50 font-ui">Cycle Tracker · OB Calculator · Prenatal & GYN EMR</p>
          </div>
        </div>
        <button onClick={handleSave} className="flex items-center gap-1.5 rounded-[12px] px-3.5 py-2 text-[11px] font-semibold font-ui transition-all" style={{ backgroundColor: accentColor, color: '#0B0D10' }}>
          <Save className="h-3 w-3" />
          {saved ? 'Saved!' : 'Save Encounter'}
        </button>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-4">
        <MenstrualCycleTracker day={day} onChangeDay={setDay} />
        <OBGestationalWheel lmpDate={lmpDate} onChangeLmpDate={setLmpDate} />
      </div>

      <SpecialtyFormRenderer template={gyneTemplate} formData={formData} onChange={setFormData} accentColor={accentColor} />
    </div>
  );
}
