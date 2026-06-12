/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/stores/dental-workspace-store.ts
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
 * dental-workspace-store — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - frontend/src/stores/session-store.ts
 - frontend/src/components/ui/toast.tsx
 - frontend/src/stores/patient-store.ts
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
WyshID
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

export interface ToothStatus {
  condition: string;
  notes: string;
  procedure?: string;
}

export interface TreatmentRow {
  tooth: string;
  procedure: string;
  procedureName: string;
  cost: string;
  priority: string;
  status: string;
  category: string;
}

export interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface DentalEncounterData {
  chiefComplaint: string;
  duration: string;
  painLevel: number;
  triggers: string;
  diagnosis: string;
  notes: string;
}

export type DentalTab = 'chart' | 'radiography' | 'treatment' | 'soap' | 'billing';

interface DentalWorkspaceState {
  patient: MockPatient | null;
  toothStatuses: Record<number, ToothStatus>;
  selectedTooth: number | null;
  treatmentPlan: TreatmentRow[];
  radiographs: string[];
  encounterData: DentalEncounterData;
  soapNote: SoapNote | null;
  soapGenerated: boolean;
  activeTab: DentalTab;
  isSaving: boolean;
  saved: boolean;
  copilotOpen: boolean;
  error: string | null;

  setPatient: (patient: MockPatient | null) => void;
  setToothStatus: (tooth: number, status: Partial<ToothStatus>) => void;
  setSelectedTooth: (tooth: number | null) => void;
  setTreatmentPlan: (plan: TreatmentRow[]) => void;
  addTreatmentRow: (row?: TreatmentRow) => void;
  updateTreatmentRow: (index: number, field: keyof TreatmentRow, value: string) => void;
  removeTreatmentRow: (index: number) => void;
  setEncounterData: (data: Partial<DentalEncounterData>) => void;
  setSoapNote: (note: SoapNote | null) => void;
  setSoapGenerated: (v: boolean) => void;
  setActiveTab: (tab: DentalTab) => void;
  setIsSaving: (v: boolean) => void;
  setSaved: (v: boolean) => void;
  setCopilotOpen: (v: boolean) => void;
  setError: (err: string | null) => void;
  reset: () => void;
}

const initialEncounterData: DentalEncounterData = {
  chiefComplaint: '',
  duration: '',
  painLevel: 0,
  triggers: '',
  diagnosis: '',
  notes: '',
};

export const useDentalWorkspaceStore = create<DentalWorkspaceState>()((set) => ({
  patient: null,
  toothStatuses: {},
  selectedTooth: null,
  treatmentPlan: [],
  radiographs: ['PA #26', 'BWX', 'Panoramic', 'PA #18'],
  encounterData: { ...initialEncounterData },
  soapNote: null,
  soapGenerated: false,
  activeTab: 'chart',
  isSaving: false,
  saved: false,
  copilotOpen: false,
  error: null,

  setPatient: (patient) => set((state) => {
    if (patient?.id === state.patient?.id) return {};
    return { patient, toothStatuses: {}, treatmentPlan: [], soapNote: null, soapGenerated: false, encounterData: { ...initialEncounterData }, error: null };
  }),

  setToothStatus: (tooth, status) => set((state) => ({
    toothStatuses: {
      ...state.toothStatuses,
      [tooth]: { ...state.toothStatuses[tooth] ?? { condition: '', notes: '' }, ...status },
    },
  })),

  setSelectedTooth: (selectedTooth) => set({ selectedTooth }),
  setTreatmentPlan: (treatmentPlan) => set({ treatmentPlan }),

  addTreatmentRow: (row) => set((state) => ({
    treatmentPlan: [...state.treatmentPlan, row ?? { tooth: '', procedure: '', procedureName: '', cost: '', priority: 'elective', status: 'pending', category: '' }],
  })),

  updateTreatmentRow: (index, field, value) => set((state) => ({
    treatmentPlan: state.treatmentPlan.map((r, i) => i === index ? { ...r, [field]: value } : r),
  })),

  removeTreatmentRow: (index) => set((state) => ({
    treatmentPlan: state.treatmentPlan.filter((_, i) => i !== index),
  })),

  setEncounterData: (data) => set((state) => ({
    encounterData: { ...state.encounterData, ...data },
  })),

  setSoapNote: (soapNote) => set({ soapNote }),
  setSoapGenerated: (soapGenerated) => set({ soapGenerated }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setIsSaving: (isSaving) => set({ isSaving }),
  setSaved: (saved) => set({ saved }),
  setCopilotOpen: (copilotOpen) => set({ copilotOpen }),
  setError: (error) => set({ error }),

  reset: () => set({
    toothStatuses: {},
    selectedTooth: null,
    treatmentPlan: [],
    encounterData: { ...initialEncounterData },
    soapNote: null,
    soapGenerated: false,
    activeTab: 'chart',
    error: null,
  }),
}));
