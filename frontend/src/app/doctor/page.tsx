/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/doctor/page.tsx
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
 - react
 - utils
 - lucide-react
 - mock-patients
 - patient-store
 - link
 *
 * Dependencies:
 - react
 - utils
 - lucide-react
 - mock-patients
 - patient-store
 - link
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
import { Calendar, Users, Clock, Activity, ArrowRight, Stethoscope } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePatientStore } from '@/stores/patient-store';
import { MOCK_PATIENTS } from '@/data/mock-patients';

const theme = {
  bg: { primary: '#0B0D10', secondary: '#15181D' },
  accent: { primary: '#8FD3D1', success: '#2EE59D', warning: '#FFD84D', danger: '#FF5A5A' },
} as const;

const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className={cn(glassCard, 'p-4')}>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-[12px] shrink-0" style={{ backgroundColor: `${color}15` }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <div>
          <p className="text-[11px] text-white/50 font-ui">{label}</p>
          <p className="text-lg font-bold text-white font-display">{value}</p>
        </div>
      </div>
    </div>
  );
}

const specialtyIcons: Record<string, string> = {
  'general-medicine': '🩺',
  dental: '🦷',
  ent: '👂',
  dermatology: '🧴',
  ophthalmology: '👁️',
  cardiology: '❤️',
  pediatrics: '👶',
  orthopedics: '🦴',
  gynecology: '🤰',
  neurology: '🧠',
  psychiatry: '🧘',
  pulmonology: '🫁',
  gastroenterology: '🫃',
  urology: '🚽',
  endocrinology: '⚡',
};

export default function DoctorPage() {
  const { activePatient, setActivePatient } = usePatientStore();

  const todayAppointments = useMemo(() => MOCK_PATIENTS.filter(p => p.status !== 'completed'), []);
  const totalToday = todayAppointments.length;
  const checkedIn = todayAppointments.filter(p => p.status === 'checked_in' || p.status === 'waiting').length;
  const withDoctor = todayAppointments.filter(p => p.status === 'with_doctor').length;
  const scheduled = todayAppointments.filter(p => p.status === 'scheduled').length;

  const upcomingPatients = useMemo(
    () => [...todayAppointments].sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime)),
    [todayAppointments],
  );

  if (activePatient?.specialty === 'general-medicine') {
    return null;
  }

  return (
    <div className="min-h-full" style={{ backgroundColor: theme.bg.primary }}>
      <div className="mx-auto" style={{ maxWidth: 1400 }}>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white font-display">Welcome back, Doctor</h1>
              <p className="text-xs text-white/50 font-ui mt-0.5">Today is Thursday, June 11, 2026</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/40 font-ui">
              <Clock className="h-3.5 w-3.5" />
              <span>{totalToday} appointments today</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Total Today" value={totalToday} icon={Calendar} color={theme.accent.primary} />
            <StatCard label="Checked In / Waiting" value={checkedIn} icon={Users} color={theme.accent.warning} />
            <StatCard label="With Doctor" value={withDoctor} icon={Activity} color={theme.accent.success} />
            <StatCard label="Scheduled" value={scheduled} icon={Clock} color={theme.accent.danger} />
          </div>

          <div className="grid grid-cols-[1fr_1fr] gap-5">
            <div className={cn(glassCard, 'p-5')}>
              <h3 className="text-sm font-semibold text-white font-display mb-3">Upcoming Appointments</h3>
              <div className="space-y-2">
                {upcomingPatients.length === 0 ? (
                  <p className="text-xs text-white/30 font-ui text-center py-6">No appointments scheduled today</p>
                ) : (
                  upcomingPatients.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 rounded-[14px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3 cursor-pointer hover:bg-white/[0.04] transition-all"
                      onClick={() => {
                        setActivePatient(p);
                      }}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white/10 to-white/5 text-xs font-bold text-white/80 font-display">
                        {p.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white font-display truncate">{p.fullName}</p>
                        <p className="text-[11px] text-white/40 font-ui truncate">{p.condition}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-white/60 font-ui">{p.appointmentTime}</p>
                        <p className="text-[10px] text-white/30 font-ui">{specialtyIcons[p.specialty] ?? '📋'} {p.specialty}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className={cn(glassCard, 'p-5')}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white font-display">Specialty Workspaces</h3>
                <Link href="/doctor/emr" className="flex items-center gap-1 text-[11px] text-[#8FD3D1] font-ui hover:underline">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                {[
                  { code: 'general-medicine', name: 'General Medicine', icon: '🩺', color: '#8FD3D1' },
                  { code: 'dental', name: 'Dental', icon: '🦷', color: '#FFD84D' },
                  { code: 'ent', name: 'ENT', icon: '👂', color: '#2EE59D' },
                  { code: 'dermatology', name: 'Dermatology', icon: '🧴', color: '#FF5A5A' },
                  { code: 'ophthalmology', name: 'Ophthalmology', icon: '👁️', color: '#5856D6' },
                  { code: 'cardiology', name: 'Cardiology', icon: '❤️', color: '#FF2D55' },
                  { code: 'pediatrics', name: 'Pediatrics', icon: '👶', color: '#34C759' },
                  { code: 'orthopedics', name: 'Orthopedics', icon: '🦴', color: '#AF52DE' },
                  { code: 'gynecology', name: 'Gynecology', icon: '🤰', color: '#FF6482' },
                  { code: 'neurology', name: 'Neurology', icon: '🧠', color: '#9B59B6' },
                  { code: 'psychiatry', name: 'Psychiatry', icon: '🧘', color: '#E67E22' },
                  { code: 'pulmonology', name: 'Pulmonology', icon: '🫁', color: '#3498DB' },
                  { code: 'gastroenterology', name: 'Gastroenterology', icon: '🫃', color: '#F39C12' },
                  { code: 'urology', name: 'Urology', icon: '🚽', color: '#1ABC9C' },
                  { code: 'endocrinology', name: 'Endocrinology', icon: '⚡', color: '#E74C3C' },
                ].map(spec => (
                  <Link
                    key={spec.code}
                    href={`/doctor/emr/${spec.code}`}
                    className={cn(
                      'rounded-[14px] p-3 transition-all border bg-white/[0.02] border-[rgba(255,255,255,0.06)] hover:bg-white/[0.04] cursor-pointer',
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{spec.icon}</span>
                      <div>
                        <p className="text-xs font-medium text-white font-ui">{spec.name}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
