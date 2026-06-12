/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/app/patient-header.tsx
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
 * React component: patient-header
 *
 * Responsibilities:
 * - Render UI components for Frontend
 * - Handle user interactions and state management
 *
 * Used By:
 - frontend/src/app/doctor/emr/dermatology/page.tsx
 - frontend/src/components/ui/glass-card.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 - frontend/src/components/ui/progress.tsx
 - frontend/src/components/marketing/health-twin-demo.tsx
 *
 * Calls:
 - utils
 - patient-store
 - lucide-react
 *
 * Dependencies:
 - utils
 - patient-store
 - lucide-react
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

import { Edit3, Eye, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePatientStore } from '@/stores/patient-store';

const riskBadge: Record<string, { label: string; className: string }> = {
  low: {
    label: 'Low Risk',
    className: 'text-[#2EE59D] bg-[#2EE59D]/10 border-[#2EE59D]/20',
  },
  medium: {
    label: 'Medium Risk',
    className: 'text-[#FFD84D] bg-[#FFD84D]/10 border-[#FFD84D]/20',
  },
  high: {
    label: 'High Risk',
    className: 'text-[#FF5A5A] bg-[#FF5A5A]/10 border-[#FF5A5A]/20',
  },
};

const specialtyLabel: Record<string, string> = {
  'general-medicine': 'General Medicine',
  dental: 'Dental',
  ent: 'ENT',
  dermatology: 'Dermatology',
  ophthalmology: 'Ophthalmology',
  cardiology: 'Cardiology',
  pediatrics: 'Pediatrics',
  orthopedics: 'Orthopedics',
  gynecology: 'Gynecology',
  neurology: 'Neurology',
  psychiatry: 'Psychiatry',
  pulmonology: 'Pulmonology',
  gastroenterology: 'Gastroenterology',
  urology: 'Urology',
  endocrinology: 'Endocrinology',
};

export function PatientHeader() {
  const { activePatient } = usePatientStore();
  if (!activePatient) return null;

  const p = activePatient;
  const risk = riskBadge[p.risk] ?? { label: p.risk, className: 'text-white/40 bg-white/[0.04] border-white/10' };
  const initials = p.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-[rgba(255,255,255,0.06)] bg-[#15181D]/50 backdrop-blur-sm shrink-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8FD3D1] to-[#2EE59D] text-[#0B0D10] font-bold text-sm font-display shadow-lg shadow-[#8FD3D1]/20">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white font-display truncate">{p.fullName}</h2>
          <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-medium font-ui border', risk.className)}>
            {risk.label}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-white/50 font-ui">{p.age} years · {p.gender}</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span className="text-[11px] text-white/40 font-mono">{p.mrn}</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span className="text-[11px] text-[#8FD3D1] font-medium font-ui">{p.bloodGroup}</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span className="text-[11px] text-white/50 font-ui">{specialtyLabel[p.specialty] ?? p.specialty}</span>
        </div>
      </div>

      {p.allergies.length > 0 && (
        <div className="flex items-center gap-1.5 rounded-[10px] bg-[#FF5A5A]/8 border border-[#FF5A5A]/15 px-2.5 py-1.5">
          <AlertTriangle className="h-3 w-3 text-[#FF5A5A]" />
          <span className="text-[10px] font-medium text-[#FF5A5A] font-ui">{p.allergies.join(', ')}</span>
        </div>
      )}

      <div className="flex items-center gap-1">
        <button className="rounded-[10px] p-2 text-white/40 hover:text-white hover:bg-white/5 transition-all">
          <Edit3 className="h-3.5 w-3.5" />
        </button>
        <button className="rounded-[10px] p-2 text-white/40 hover:text-white hover:bg-white/5 transition-all">
          <Eye className="h-3.5 w-3.5" />
        </button>
        <button className="rounded-[10px] p-2 text-white/40 hover:text-white hover:bg-white/5 transition-all">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
