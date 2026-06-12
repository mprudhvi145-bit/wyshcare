/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/app/patient-queue.tsx
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
 * React component: patient-queue
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
 - navigation
 - lucide-react
 - mock-patients
 - patient-store
 *
 * Dependencies:
 - react
 - utils
 - navigation
 - lucide-react
 - mock-patients
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

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, Clock, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePatientStore } from '@/stores/patient-store';
import { MOCK_PATIENTS } from '@/data/mock-patients';
import type { MockPatient } from '@/data/mock-patients';

const riskColors: Record<string, string> = {
  low: 'text-[#2EE59D] bg-[#2EE59D]/10 border-[#2EE59D]/20',
  medium: 'text-[#FFD84D] bg-[#FFD84D]/10 border-[#FFD84D]/20',
  high: 'text-[#FF5A5A] bg-[#FF5A5A]/10 border-[#FF5A5A]/20',
};

const statusIcons: Record<string, string> = {
  scheduled: 'text-white/30',
  checked_in: 'text-[#8FD3D1]',
  waiting: 'text-[#FFD84D]',
  with_doctor: 'text-[#2EE59D]',
  completed: 'text-white/20',
};

export function PatientQueue() {
  const router = useRouter();
  const { activePatient, queueFilter, setActivePatient, setQueueFilter } = usePatientStore();
  const [search, setSearch] = useState('');

  const handleSelectPatient = (patient: MockPatient) => {
    setActivePatient(patient);
    if (patient.specialty === 'general-medicine') {
      router.push('/doctor');
    } else {
      router.push(`/doctor/emr/${patient.specialty}`);
    }
  };

  const todayPatients = useMemo(
    () => MOCK_PATIENTS.filter(p => p.status !== 'completed'),
    [],
  );

  const recentPatients = useMemo(
    () => MOCK_PATIENTS.filter(p => p.status === 'completed'),
    [],
  );

  const filtered = useMemo(() => {
    const source = queueFilter === 'today' ? todayPatients : recentPatients;
    if (!search.trim()) return source;
    const q = search.toLowerCase();
    return source.filter(
      p => p.fullName.toLowerCase().includes(q) || p.condition.toLowerCase().includes(q) || p.specialty.toLowerCase().includes(q),
    );
  }, [queueFilter, todayPatients, recentPatients, search]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-3 pt-3 pb-2 space-y-2">
        <div className="flex items-center gap-1 bg-white/[0.02] rounded-[10px] p-0.5">
          <button
            onClick={() => setQueueFilter('today')}
            className={cn(
              'flex-1 rounded-[8px] px-2.5 py-1.5 text-[11px] font-medium font-ui transition-all text-center',
              queueFilter === 'today' ? 'bg-[#8FD3D1]/10 text-[#8FD3D1]' : 'text-white/40 hover:text-white/60',
            )}
          >
            <Calendar className="h-3 w-3 inline mr-1 -mt-0.5" />
            Today
          </button>
          <button
            onClick={() => setQueueFilter('recent')}
            className={cn(
              'flex-1 rounded-[8px] px-2.5 py-1.5 text-[11px] font-medium font-ui transition-all text-center',
              queueFilter === 'recent' ? 'bg-[#8FD3D1]/10 text-[#8FD3D1]' : 'text-white/40 hover:text-white/60',
            )}
          >
            <Clock className="h-3 w-3 inline mr-1 -mt-0.5" />
            Recent
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patients..."
            className="w-full rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02] pl-8 pr-2.5 py-1.5 text-[11px] text-white/80 placeholder:text-white/25 font-ui focus:outline-none focus:border-[#8FD3D1]/20 transition-all"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-white/30 font-ui tracking-wider uppercase">
            {queueFilter === 'today' ? 'Today — Jun 11' : 'Last 7 Days'}
          </span>
          <span className="text-[10px] text-white/25 font-ui">{filtered.length} patients</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-1.5">
        {filtered.map((patient) => (
          <button
            key={patient.id}
            onClick={() => handleSelectPatient(patient)}
            className={cn(
              'w-full text-left rounded-[14px] p-3 transition-all border',
              activePatient?.id === patient.id
                ? 'bg-[#8FD3D1]/8 border-[#8FD3D1]/20'
                : 'bg-white/[0.02] border-transparent hover:bg-white/[0.04]',
            )}
          >
            <div className="flex items-start gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white/10 to-white/5 text-[11px] font-bold text-white/80 font-display">
                {patient.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-white font-display truncate">{patient.fullName}</span>
                  <Circle className={cn('h-2 w-2 fill-current shrink-0', statusIcons[patient.status] ?? 'text-white/20')} />
                </div>
                <p className="text-[11px] text-white/40 font-ui mt-0.5 line-clamp-1">{patient.condition}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-white/30 font-ui">{patient.age}{patient.gender === 'Male' ? 'M' : 'F'}</span>
                  <span className="text-[10px] text-white/30 font-ui">{patient.appointmentTime}</span>
                  <span className={cn(
                    'ml-auto rounded-[6px] px-1.5 py-0.5 text-[9px] font-medium font-ui border',
                    riskColors[patient.risk],
                  )}>
                    {patient.risk}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
