/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/doctor/emr/[specialty]/page.tsx
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
 - utils
 - patient-store
 - navigation
 - react
 *
 * Dependencies:
 - utils
 - patient-store
 - navigation
 - react
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

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  Stethoscope, Ear, ScanFace, Eye, Heart, Baby, Bone,
  Venus, Brain, HeartPulse, Activity, CircleDot, ScanSearch, ScanLine, Scan,
  Construction,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePatientStore } from '@/stores/patient-store';

const SPECIALTY_META: Record<string, { name: string; icon: any; color: string; desc: string }> = {
  'general-medicine': { name: 'General Medicine', icon: Stethoscope, color: '#8FD3D1', desc: 'SOAP notes, checkups, preventive care' },
  ent: { name: 'ENT', icon: Ear, color: '#2EE59D', desc: 'Ear, Nose, Throat examination' },
  dental: { name: 'Dental', icon: Bone, color: '#FFD84D', desc: 'Tooth charting, procedures' },
  dermatology: { name: 'Skin & Hair', icon: ScanFace, color: '#FF5A5A', desc: 'Body mapping, hair analysis' },
  ophthalmology: { name: 'Ophthalmology', icon: Eye, color: '#5856D6', desc: 'Vision, retina, cataract' },
  cardiology: { name: 'Cardiology', icon: Heart, color: '#FF2D55', desc: 'ECG, echocardiography, cardiac assessment' },
  pediatrics: { name: 'Pediatrics', icon: Baby, color: '#34C759', desc: 'Growth charts, immunization, pediatric SOAP' },
  orthopedics: { name: 'Orthopedics', icon: Bone, color: '#AF52DE', desc: 'Fracture assessment, joint exam, X-ray review' },
  gynecology: { name: 'Gynecology', icon: Venus, color: '#FF6482', desc: 'OB/GYN exams, prenatal care, pap smear' },
  neurology: { name: 'Neurology', icon: Brain, color: '#9B59B6', desc: 'Neurological exam, reflex assessment, imaging' },
  psychiatry: { name: 'Psychiatry', icon: HeartPulse, color: '#E67E22', desc: 'Mental health assessment, therapy notes, scales' },
  pulmonology: { name: 'Pulmonology', icon: ScanSearch, color: '#3498DB', desc: 'PFT, spirometry, respiratory assessment' },
  gastroenterology: { name: 'Gastroenterology', icon: ScanLine, color: '#F39C12', desc: 'Endoscopy, GI assessment, liver evaluation' },
  urology: { name: 'Urology', icon: Scan, color: '#1ABC9C', desc: 'Urological exam, diagnostics, procedures' },
  endocrinology: { name: 'Endocrinology', icon: Activity, color: '#E74C3C', desc: 'Hormone assessment, diabetes management, thyroid' },
};

const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';

export default function SpecialtyFallbackPage() {
  const params = useParams<{ specialty: string }>();
  const { activePatient } = usePatientStore();

  const meta = SPECIALTY_META[params.specialty];
  const Icon = meta?.icon ?? Construction;

  const builtSpecialties = [
    'general-medicine', 'dental', 'ent', 'dermatology', 'ophthalmology',
    'cardiology', 'pediatrics', 'orthopedics', 'gynecology', 'neurology',
    'psychiatry', 'pulmonology', 'gastroenterology', 'urology', 'endocrinology'
  ];
  const isBuilt = builtSpecialties.includes(params.specialty);

  return (
    <div className="min-h-full flex items-center justify-center p-8" style={{ backgroundColor: '#0B0D10' }}>
      <div className={cn(glassCard, 'p-8 max-w-lg w-full text-center')}>
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[20px]"
            style={{ backgroundColor: meta ? `${meta.color}15` : 'rgba(255,255,255,0.06)' }}>
            <Icon className="h-8 w-8" style={{ color: meta?.color ?? '#fff' }} />
          </div>
        </div>
        <h1 className="text-xl font-bold text-white font-display mb-2">{meta?.name ?? 'Unknown Specialty'}</h1>
        <p className="text-sm text-white/50 font-ui mb-4">{meta?.desc ?? 'Specialty workspace not found'}</p>

        {isBuilt ? (
          <p className="text-xs text-[#FF5A5A] font-ui mb-4">
            This specialty has a dedicated workspace but the route may not be resolving correctly. Try navigating from the dashboard.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="rounded-[14px] bg-[#FFD84D]/8 border border-[#FFD84D]/15 p-4">
              <Construction className="h-5 w-5 text-[#FFD84D] mx-auto mb-2" />
              <p className="text-sm font-semibold text-white font-display">Coming Soon</p>
              <p className="text-xs text-white/50 font-ui mt-1">
                The {meta?.name ?? params.specialty} workspace is under development.
              </p>
            </div>

            {activePatient && (
              <div className="rounded-[14px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-4 text-left">
                <p className="text-[11px] font-semibold text-white/50 font-ui mb-2">Active Patient</p>
                <p className="text-sm font-semibold text-white font-display">{activePatient.fullName}</p>
                <p className="text-xs text-white/50 font-ui">{activePatient.condition}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-white/40 font-ui">
                  <span>{activePatient.age}y / {activePatient.gender}</span>
                  <span>{activePatient.vitals.bp}</span>
                  <span>HR {activePatient.vitals.hr}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold text-white/50 font-ui">While you wait, you can:</h3>
              <div className="grid grid-cols-2 gap-2">
                <button className="rounded-[12px] bg-white/[0.03] border border-[rgba(255,255,255,0.06)] p-3 text-[10px] text-white/50 font-ui hover:bg-white/[0.05] transition-all text-left">
                  Review patient history
                </button>
                <button className="rounded-[12px] bg-white/[0.03] border border-[rgba(255,255,255,0.06)] p-3 text-[10px] text-white/50 font-ui hover:bg-white/[0.05] transition-all text-left">
                  Check AI Copilot insights
                </button>
                <button className="rounded-[12px] bg-white/[0.03] border border-[rgba(255,255,255,0.06)] p-3 text-[10px] text-white/50 font-ui hover:bg-white/[0.05] transition-all text-left">
                  View previous encounters
                </button>
                <button className="rounded-[12px] bg-white/[0.03] border border-[rgba(255,255,255,0.06)] p-3 text-[10px] text-white/50 font-ui hover:bg-white/[0.05] transition-all text-left">
                  Review lab results
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
