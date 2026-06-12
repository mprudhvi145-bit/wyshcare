/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/doctor/emr/dental/page.tsx
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
 - soap-panel
 - tooth-chart-panel
 - billing-panel
 - react
 - utils
 - dental-workspace-store
 - treatment-plan-panel
 - lucide-react
 *
 * Dependencies:
 - soap-panel
 - tooth-chart-panel
 - billing-panel
 - react
 - utils
 - dental-workspace-store
 - treatment-plan-panel
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

import { useEffect, useCallback, useState } from 'react';
import { Bone, Save, Sparkles, Brain, X, Bot, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePatientStore } from '@/stores/patient-store';
import { useDentalWorkspaceStore, type DentalTab } from '@/stores/dental-workspace-store';
import { specialtyApi } from '@/lib/specialty-api';
import { ToothChartPanel } from '@/components/specialties/dental/tooth-chart-panel';
import { TreatmentPlanPanel } from '@/components/specialties/dental/treatment-plan-panel';
import { RadiographyPanel } from '@/components/specialties/dental/radiography-panel';
import { SoapPanel } from '@/components/specialties/dental/soap-panel';
import { BillingPanel } from '@/components/specialties/dental/billing-panel';

const accentColor = '#FFD84D';
const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';

const TABS: { id: DentalTab; label: string }[] = [
  { id: 'chart', label: 'Tooth Chart' },
  { id: 'radiography', label: 'Radiographs' },
  { id: 'treatment', label: 'Treatment Plan' },
  { id: 'soap', label: 'SOAP' },
  { id: 'billing', label: 'Billing' },
];

function CopilotOverlay({ onClose }: { onClose: () => void }) {
  const { patient, toothStatuses, treatmentPlan, encounterData } = useDentalWorkspaceStore();
  const conditions = Object.entries(toothStatuses).filter(([, s]) => s.condition && s.condition !== 'healthy');
  const totalCost = treatmentPlan.reduce((sum, r) => sum + (parseFloat(r.cost.replace(/[^0-9.]/g, '')) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="w-[380px] bg-[#15181D] border-l border-[rgba(255,255,255,0.06)] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-[#8FD3D1]" />
            <span className="text-sm font-semibold text-white font-display">AI Clinical Assistant</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/30 hover:text-white/60">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {patient && (
            <div className="rounded-[14px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3">
              <h4 className="text-[11px] font-semibold text-white/50 font-ui mb-2">Patient Summary</h4>
              <p className="text-[10px] text-white/60 font-ui leading-relaxed">
                {patient.fullName}, {patient.age}y, {patient.gender}. {patient.condition}.
              </p>
              {patient.allergies.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {patient.allergies.map((a) => (
                    <span key={a} className="rounded-full bg-[#FF5A5A]/10 px-2 py-0.5 text-[8px] text-[#FF5A5A] font-ui">{a}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {conditions.length > 0 && (
            <div className="rounded-[14px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3">
              <h4 className="text-[11px] font-semibold text-white/50 font-ui mb-2">Findings ({conditions.length})</h4>
              <div className="space-y-1.5">
                {conditions.slice(0, 5).map(([tooth, status]) => (
                  <div key={tooth} className="flex items-center justify-between text-[10px]">
                    <span className="text-white/60 font-ui">Tooth #{tooth}</span>
                    <span className="capitalize text-white/80 font-ui">{status.condition}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-[14px] bg-[#5856D6]/8 border border-[#5856D6]/15 p-3">
            <h4 className="text-[11px] font-semibold text-[#5856D6] font-ui mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> AI Recommendations
            </h4>
            <div className="space-y-2">
              {conditions.length > 0 && (
                <p className="text-[10px] text-white/70 font-ui leading-relaxed">
                  Based on tooth findings, consider {treatmentPlan.length > 0 ? 'finalizing the treatment plan' : 'adding procedures for affected teeth'}. Recall interval: 6 months.
                </p>
              )}
              {totalCost > 0 && (
                <p className="text-[10px] text-white/70 font-ui leading-relaxed">
                  Estimated treatment cost: ${totalCost.toLocaleString()}. Insurance coverage may apply.
                </p>
              )}
              {encounterData.chiefComplaint && (
                <p className="text-[10px] text-white/70 font-ui leading-relaxed">
                  Chief complaint: "{encounterData.chiefComplaint}" — ensure diagnosis aligns with findings.
                </p>
              )}
            </div>
          </div>

          {patient?.medications && patient.medications.length > 0 && (
            <div className="rounded-[14px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3">
              <h4 className="text-[11px] font-semibold text-white/50 font-ui mb-2">Active Medications</h4>
              <div className="space-y-1">
                {patient.medications.map((m) => (
                  <div key={m} className="text-[10px] text-white/60 font-ui">{m}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DentalWorkspace() {
  const { activePatient } = usePatientStore();
  const {
    activeTab, setActiveTab, isSaving, saved, setSaved,
    setIsSaving, setError, setPatient, copilotOpen, setCopilotOpen,
    toothStatuses, treatmentPlan, encounterData, reset,
  } = useDentalWorkspaceStore();

  const [encounterId] = useState(`enc-${Date.now()}`);

  useEffect(() => {
    if (activePatient) {
      setPatient(activePatient);
    }
    return () => { reset(); };
  }, [activePatient?.id]);

  const handleSave = useCallback(async () => {
    if (!activePatient) return;
    setIsSaving(true);
    setError(null);

    try {
      await specialtyApi.saveEncounter('dental', {
        encounterId,
        patientId: activePatient.id,
        providerId: 'provider-1',
        data: {
          chiefComplaint: encounterData.chiefComplaint,
          diagnosis: encounterData.diagnosis,
          notes: encounterData.notes,
          toothStatuses,
          treatmentPlan,
        },
        findings: [
          ...Object.entries(toothStatuses)
            .filter(([, s]) => s.condition && s.condition !== 'healthy')
            .map(([toothNum, status]) => ({
              category: 'tooth_condition' as const,
              findingKey: toothNum,
              findingValue: { toothNumber: Number(toothNum), condition: status.condition, notes: status.notes },
              severity: status.condition === 'caries' ? 'moderate' as const : status.condition === 'impacted' ? 'moderate' as const : 'mild' as const,
              status: 'active' as const,
            })),
          ...treatmentPlan.map((row, i) => ({
            category: 'treatment_plan' as const,
            findingKey: `${row.tooth}-${row.procedure}-${i}`,
            findingValue: { tooth: Number(row.tooth), procedure: row.procedure, procedureName: row.procedureName, cost: row.cost, priority: row.priority },
            severity: row.priority === 'urgent' ? 'moderate' as const : 'mild' as const,
            status: row.status as 'active' | 'pending_review' | 'resolved',
          })),
        ],
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save encounter');
      setSaved(false);
    } finally {
      setIsSaving(false);
    }
  }, [activePatient, encounterId, encounterData, toothStatuses, treatmentPlan]);

  return (
    <div className="min-h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${accentColor}15` }}>
            <Bone className="h-4 w-4" style={{ color: accentColor }} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white font-display">Dental Operating System</h1>
            <p className="text-[10px] text-white/50 font-ui">Interactive tooth chart · Treatment planning · AI-assisted SOAP · Billing</p>
          </div>
          {activePatient && (
            <span className="ml-2 rounded-full bg-white/[0.04] px-2.5 py-1 text-[9px] text-white/40 font-ui">
              Encounter: {encounterId.slice(-8)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCopilotOpen(true)}
            className="hidden lg:flex items-center gap-1.5 rounded-[10px] bg-[#5856D6]/15 border border-[#5856D6]/25 px-3 py-1.5 text-[10px] font-medium text-[#5856D6] font-ui hover:bg-[#5856D6]/25 transition-all"
          >
            <Bot className="h-3 w-3" />
            AI Assistant
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !activePatient}
            className="flex items-center gap-1.5 rounded-[10px] px-3.5 py-2 text-[11px] font-semibold font-ui transition-all disabled:opacity-40"
            style={{ backgroundColor: accentColor, color: '#0B0D10' }}
          >
            {isSaving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Save className="h-3 w-3" />
            )}
            {saved ? 'Saved!' : 'Save Encounter'}
          </button>
        </div>
      </div>

      {!activePatient && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Bone className="h-12 w-12 text-white/10 mb-3" />
          <p className="text-sm text-white/30 font-ui">Select a patient from the queue to begin</p>
        </div>
      )}

      {activePatient && (
        <div className="space-y-4">
          <div className="flex items-center gap-1 rounded-[14px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'rounded-[10px] px-3.5 py-2 text-[11px] font-medium font-ui whitespace-nowrap transition-all',
                  activeTab === tab.id
                    ? 'bg-[#FFD84D]/10 text-[#FFD84D]'
                    : 'text-white/40 hover:text-white/60',
                )}
              >
                {tab.label}
              </button>
            ))}
            <button
              onClick={() => setCopilotOpen(true)}
              className="lg:hidden rounded-[10px] px-3.5 py-2 text-[11px] font-medium font-ui text-[#5856D6] hover:bg-[#5856D6]/10 transition-all whitespace-nowrap ml-auto"
            >
              <Bot className="h-3 w-3 inline mr-1" />
              AI
            </button>
          </div>

          {activeTab === 'chart' && <ToothChartPanel />}
          {activeTab === 'radiography' && <RadiographyPanel />}
          {activeTab === 'treatment' && <TreatmentPlanPanel />}
          {activeTab === 'soap' && <SoapPanel />}
          {activeTab === 'billing' && <BillingPanel />}
        </div>
      )}

      {copilotOpen && <CopilotOverlay onClose={() => setCopilotOpen(false)} />}
    </div>
  );
}
