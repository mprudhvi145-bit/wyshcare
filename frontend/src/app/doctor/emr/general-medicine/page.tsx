/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/doctor/emr/general-medicine/page.tsx
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
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 - frontend/src/components/ui/progress.tsx
 *
 * Calls:
 - react
 - toast
 - mock-patients
 - lucide-react
 - specialty-api
 - patient-store
 *
 * Dependencies:
 - react
 - toast
 - mock-patients
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

import { useMemo, useState, useCallback, useEffect } from 'react';
import { Stethoscope, Save } from 'lucide-react';
import { usePatientStore } from '@/stores/patient-store';
import { MOCK_PATIENTS } from '@/data/mock-patients';
import { specialtyApi } from '@/lib/specialty-api';
import {
  PatientContextHeader,
  ClinicalSnapshot,
  SOAPWorkspace,
  AIClinicalAssistant,
  DiagnosisTools,
  RxPrescription,
  ReportGenerator,
} from '@/features/general-medicine';

import { useToast } from '@/components/ui/toast';

const accentColor = '#8FD3D1';

const emptyChart = {
  patient: { id: '', fullName: 'Unknown Patient', age: 0, gender: '—', bloodGroup: '—' },
  conditions: [], allergies: [], medications: [], encounters: [], vitals: [],
};

function buildChartFromPatient(patient: typeof MOCK_PATIENTS[number]) {
  return {
    patient: {
      id: patient.id,
      fullName: patient.fullName,
      age: patient.age,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
    },
    conditions: [{ name: patient.condition, status: 'Active', diagnosisDate: '', severity: 'MODERATE' }],
    allergies: patient.allergies.map(a => ({ allergen: a, severity: 'MODERATE' })),
    medications: patient.medications.map(m => ({ name: m, dose: 'As directed', frequency: 'As prescribed', startDate: '' })),
    encounters: [],
    vitals: [
      { type: 'blood_pressure', value: patient.vitals.bp, unit: 'mmHg' },
      { type: 'heart_rate', value: patient.vitals.hr, unit: 'bpm' },
      { type: 'temperature', value: patient.vitals.temp, unit: '°F' },
      { type: 'spo2', value: patient.vitals.spo2, unit: '%' },
    ],
  };
}

export default function GeneralMedicineWorkspace() {
  const { activePatient } = usePatientStore();
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);

  // Lifted states
  const [soapNotes, setSoapNotes] = useState({ subjective: '', objective: '', assessment: '', plan: '' });
  const [prescription, setPrescription] = useState({
    medications: [{ name: '', dose: '', frequency: '', duration: '', instructions: '' }],
    diagnosis: '',
    instructions: '',
  });
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'Patient Summary', 'SOAP Notes', 'Diagnosis', 'Lab Results', 'Medications', 'AI Recommendations', 'Treatment Plan', 'Follow-Up Instructions'
  ]);

  // Reset when activePatient changes
  useEffect(() => {
    if (activePatient) {
      setSoapNotes({ subjective: '', objective: '', assessment: '', plan: '' });
      setPrescription({
        medications: [{ name: '', dose: '', frequency: '', duration: '', instructions: '' }],
        diagnosis: '',
        instructions: '',
      });
      setSelectedSections([
        'Patient Summary', 'SOAP Notes', 'Diagnosis', 'Lab Results', 'Medications', 'AI Recommendations', 'Treatment Plan', 'Follow-Up Instructions'
      ]);
    }
  }, [activePatient?.id]);

  const chartData = useMemo(() => {
    if (!activePatient) return emptyChart;
    return buildChartFromPatient(activePatient);
  }, [activePatient]);

  const handleSave = useCallback(async () => {
    if (!activePatient) return;
    setSaved(true);
    try {
      await specialtyApi.saveEncounter('general-medicine', {
        encounterId: `enc-${Date.now()}`,
        patientId: activePatient.id,
        providerId: 'provider-1',
        data: {
          chartData,
          soapNotes,
          prescription,
          selectedSections,
        },
      });
      toast({
        title: 'Encounter Saved',
        description: 'General Medicine clinical note and prescription recorded successfully.',
        variant: 'success',
      });
    } catch {
      setSaved(false);
      toast({
        title: 'Error Saving Encounter',
        description: 'Failed to record General Medicine clinical note.',
        variant: 'error',
      });
    }
    setTimeout(() => setSaved(false), 2000);
  }, [activePatient, chartData, soapNotes, prescription, selectedSections, toast]);

  const patientName = chartData.patient.fullName;

  const aiSuggestions = useMemo(() => {
    const suggestions: string[] = [];
    const conditions = (chartData.conditions ?? []) as Array<{ name?: string }>;
    const meds = (chartData.medications ?? []) as Array<{ name?: string }>;

    if (conditions.some(c => c.name?.toLowerCase().includes('diabetes'))) {
      suggestions.push('Based on diabetes history, consider HbA1c and fasting glucose monitoring.');
    }
    if (conditions.some(c => c.name?.toLowerCase().includes('hypertension'))) {
      suggestions.push('Monitor BP regularly. Consider ACE inhibitors or ARBs for hypertension management.');
    }
    if (meds.length > 2) {
      suggestions.push('Multiple medications detected. Review for potential drug interactions.');
    }
    if (!suggestions.length) {
      suggestions.push('Based on symptoms, consider CBC and thyroid panel to rule out underlying conditions.');
    }
    return suggestions;
  }, [chartData]);

  if (!activePatient) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0B0D10' }}>
        <div className="text-center">
          <Stethoscope className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-lg text-white/30 font-ui">Select a patient from the queue to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0D10' }}>
      <div className="mx-auto" style={{ maxWidth: 1600 }}>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <PatientContextHeader chart={chartData} />
            <button onClick={handleSave} className="flex items-center gap-1.5 rounded-[12px] px-3.5 py-2 text-[11px] font-semibold font-ui transition-all" style={{ backgroundColor: accentColor, color: '#0B0D10' }}>
              <Save className="h-3 w-3" />
              {saved ? 'Saved!' : 'Save Encounter'}
            </button>
          </div>

          <div className="grid grid-cols-[1fr_320px] gap-4 items-start">
            <ClinicalSnapshot chart={chartData} />
            <div className="sticky top-4">
              <AIClinicalAssistant />
            </div>
          </div>

          <SOAPWorkspace
            existingNotes={[]}
            aiSuggestions={aiSuggestions}
            value={soapNotes}
            onChange={setSoapNotes}
            onSave={handleSave}
          />

          <div className="grid grid-cols-[1fr_1fr] gap-4">
            <RxPrescription
              patientName={patientName}
              value={prescription}
              onChange={setPrescription}
              onSave={handleSave}
            />
            <DiagnosisTools />
          </div>

          <ReportGenerator
            value={selectedSections}
            onChange={setSelectedSections}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
}
