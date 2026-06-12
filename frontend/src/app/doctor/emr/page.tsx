/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/doctor/emr/page.tsx
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
 - frontend/src/app/doctor/emr/dermatology/page.tsx
 - frontend/src/components/dashboard/family-alerts-widget.tsx
 - frontend/src/features/general-medicine/components/clinical-snapshot.tsx
 - frontend/src/components/ui/glass-card.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 - frontend/src/components/ui/progress.tsx
 *
 * Calls:
 - utils
 - link
 - session-store
 *
 * Dependencies:
 - utils
 - link
 - session-store
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

import Link from 'next/link';
import {
  Stethoscope, Ear, ScanFace, Eye, Heart, Baby, Bone,
  Venus, Brain, HeartPulse, Activity, CircleDot, ScanSearch, ScanLine, Scan,
  ArrowRight,
} from 'lucide-react';
import { useSessionStore } from '@/stores/session-store';
import { cn } from '@/lib/utils';

const SPECIALTIES = [
  { code: 'general-medicine', name: 'General Medicine', icon: Stethoscope, color: '#8FD3D1', desc: 'SOAP notes, checkups, preventive care' },
  { code: 'ent', name: 'ENT', icon: Ear, color: '#2EE59D', desc: 'Ear, Nose, Throat examination' },
  { code: 'dental', name: 'Dental', icon: Bone, color: '#FFD84D', desc: 'Tooth charting, procedures' },
  { code: 'dermatology', name: 'Skin & Hair', icon: ScanFace, color: '#FF5A5A', desc: 'Body mapping, hair analysis' },
  { code: 'ophthalmology', name: 'Ophthalmology', icon: Eye, color: '#5856D6', desc: 'Vision, retina, cataract' },
  { code: 'cardiology', name: 'Cardiology', icon: Heart, color: '#FF2D55', desc: 'ECG, cardiac assessment' },
  { code: 'pediatrics', name: 'Pediatrics', icon: Baby, color: '#34C759', desc: 'Growth, immunization' },
  { code: 'orthopedics', name: 'Orthopedics', icon: Bone, color: '#AF52DE', desc: 'Fracture, joint exam' },
  { code: 'gynecology', name: 'Gynecology', icon: Venus, color: '#FF6482', desc: 'OB/GYN, prenatal care' },
  { code: 'neurology', name: 'Neurology', icon: Brain, color: '#9B59B6', desc: 'Neurological exam' },
  { code: 'psychiatry', name: 'Psychiatry', icon: HeartPulse, color: '#E67E22', desc: 'Mental health assessment' },
  { code: 'pulmonology', name: 'Pulmonology', icon: ScanSearch, color: '#3498DB', desc: 'PFT, respiratory' },
  { code: 'gastroenterology', name: 'Gastroenterology', icon: ScanLine, color: '#F39C12', desc: 'Endoscopy, GI' },
  { code: 'urology', name: 'Urology', icon: Scan, color: '#1ABC9C', desc: 'Urological exam' },
  { code: 'endocrinology', name: 'Endocrinology', icon: Activity, color: '#E74C3C', desc: 'Hormone, diabetes' },
];

const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';

export default function EmrHomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0D10' }}>
      <div className="mx-auto" style={{ maxWidth: 1400 }}>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white font-display">Multi-Specialty Clinical Workspace</h1>
            <p className="text-sm text-white/50 font-ui mt-1">Select a specialty to begin documentation</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {SPECIALTIES.map(spec => {
              const Icon = spec.icon;
              return (
                <Link key={spec.code} href={`/doctor/emr/${spec.code}`}>
                  <div className={cn(glassCard, 'p-5 group cursor-pointer transition-all duration-200 hover:bg-white/[0.04] hover:border-[rgba(255,255,255,0.15)]')}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[14px]" style={{ backgroundColor: `${spec.color}15` }}>
                        <Icon className="h-5 w-5" style={{ color: spec.color }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white font-display">{spec.name}</h3>
                        <p className="text-[10px] text-white/40 font-ui mt-0.5">{spec.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-medium" style={{ color: spec.color }}>
                      <span>Open Workspace</span>
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
