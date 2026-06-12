/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/features/general-medicine/components/patient-context-header.tsx
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
 * React component: patient-context-header
 *
 * Responsibilities:
 * - Render UI components for Frontend
 * - Handle user interactions and state management
 *
 * Used By:
 - frontend/src/app/(platform)/app/consent/page.tsx
 - frontend/src/components/app/notification-bell.tsx
 - frontend/src/app/admin/users/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/os/layout.tsx
 - frontend/src/components/ui/stat-card.tsx
 - frontend/src/app/insurance/settlements/page.tsx
 - frontend/src/components/ui/avatar.tsx
 *
 * Calls:
 - utils
 - lucide-react
 *
 * Dependencies:
 - utils
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

import { Eye, Share2, AlertTriangle, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glassCard } from '../types';
import type { PatientChartResponse } from '@/types';

function InitialsCircle({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-[#8FD3D1] to-[#2EE59D] text-[#0B0D10] font-bold font-display shadow-lg shadow-[#8FD3D1]/20"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

export function PatientContextHeader({ chart }: { chart: PatientChartResponse }) {
  const p = chart.patient;
  const allergies = (chart.allergies ?? []) as Array<{ allergen?: string; severity?: string }>;

  return (
    <div className="space-y-3">
      <div className={cn(glassCard, 'p-5')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <InitialsCircle name={p.fullName} size={52} />
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-white font-display">{p.fullName || 'Unknown Patient'}</h2>
                <span className="flex items-center gap-1 rounded-full bg-[#2EE59D]/10 border border-[#2EE59D]/20 px-2.5 py-0.5 text-[10px] font-medium text-[#2EE59D] font-ui">
                  <BadgeCheck className="h-3 w-3" />
                  Verified Patient
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-white/50 font-ui">
                <span>{p.age} years</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>{p.gender}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="font-mono text-white/40">MRN-{p.id?.slice(0, 6).toUpperCase() || '—'}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-[#8FD3D1] font-medium">{p.bloodGroup || '—'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/70 font-ui hover:bg-white/[0.06] hover:text-white transition-all">
              <Eye className="h-3.5 w-3.5" />
              View Full Record
            </button>
            <button className="flex items-center gap-1.5 rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/70 font-ui hover:bg-white/[0.06] hover:text-white transition-all">
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
          </div>
        </div>
      </div>

      {allergies.length > 0 && (
        <div className="rounded-[16px] bg-[#FF5A5A]/8 border border-[#FF5A5A]/15 p-3.5 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#FF5A5A]/15 shrink-0">
            <AlertTriangle className="h-4 w-4 text-[#FF5A5A]" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-[#FF5A5A] font-ui">Active Allergies</p>
            <p className="text-xs text-white/60 font-ui mt-0.5">
              {allergies.map(a => a.allergen).filter(Boolean).join(', ')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
