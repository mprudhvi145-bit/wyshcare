/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/stores/patient-store.ts
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
 * patient-store — Patient module
 *
 * Responsibilities:
 * - Support patient functionality
 *
 * Used By:
 - frontend/src/stores/session-store.ts
 - frontend/src/components/ui/toast.tsx
 - frontend/src/stores/dental-workspace-store.ts
 *
 * Calls:
 - zustand
 *
 * Dependencies:
 - zustand
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Patient
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

import { create } from 'zustand';
import type { MockPatient } from '@/data/mock-patients';

interface PatientState {
  activePatient: MockPatient | null;
  queue: MockPatient[];
  queueFilter: 'today' | 'recent';
  specialtyCode: string | null;

  setActivePatient: (patient: MockPatient | null) => void;
  setQueue: (patients: MockPatient[]) => void;
  setQueueFilter: (filter: 'today' | 'recent') => void;
  clearPatient: () => void;
}

export const usePatientStore = create<PatientState>()((set) => ({
  activePatient: null,
  queue: [],
  queueFilter: 'today',
  specialtyCode: null,

  setActivePatient: (patient) =>
    set({
      activePatient: patient,
      specialtyCode: patient?.specialty ?? null,
    }),

  setQueue: (queue) => set({ queue }),

  setQueueFilter: (queueFilter) => set({ queueFilter }),

  clearPatient: () =>
    set({ activePatient: null, specialtyCode: null }),
}));
