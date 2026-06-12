/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/specialties/dental/soap-panel.tsx
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
 * React component: soap-panel
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
 - dental-workspace-store
 - lucide-react
 - react
 *
 * Dependencies:
 - utils
 - dental-workspace-store
 - lucide-react
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

import { useState } from 'react';
import { FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDentalWorkspaceStore } from '@/stores/dental-workspace-store';

const accentColor = '#FFD84D';
const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';
const glassInput = 'w-full rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-3 py-2 text-xs text-white placeholder:text-white/30 font-ui focus:outline-none focus:border-[#FFD84D]/30 transition-all';
const glassTextarea = 'w-full rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] p-3 text-xs text-white placeholder:text-white/30 font-ui focus:outline-none focus:border-[#FFD84D]/30 transition-all resize-none';

export function SoapPanel() {
  const { encounterData, setEncounterData, soapNote, soapGenerated, setSoapNote, setSoapGenerated, patient } = useDentalWorkspaceStore();
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    // Simulate AI generation
    await new Promise((r) => setTimeout(r, 1500));

    const hasCaries = encounterData.chiefComplaint.toLowerCase().includes('pain') ||
      encounterData.chiefComplaint.toLowerCase().includes('cavity');
    const cariesTooth = patient?.condition.match(/#(\d+)/)?.[1] ?? '26';

    setSoapNote({
      subjective: `Patient reports "${encounterData.chiefComplaint}". Duration: ${encounterData.duration || '~2 weeks'}. Pain level: ${encounterData.painLevel || 6}/10. Triggers: ${encounterData.triggers || 'cold beverages, chewing'}. ${hasCaries ? 'Wakes at night occasionally.' : 'No significant complaints otherwise.'}`,
      objective: `Conscious, alert, cooperative. ${hasCaries ? `Tooth #${cariesTooth}: deep distal caries detected.` : 'Oral mucosa: within normal limits.'} Periodontal probing depths: within normal limits. BOP: 15%. Oral hygiene: fair. Occlusion: stable.`,
      assessment: encounterData.diagnosis || `${patient?.condition || 'Dental caries requiring restoration'}. ${hasCaries ? 'Restorable with composite restoration.' : 'Monitoring recommended.'}`,
      plan: `1. ${hasCaries ? `Restore #${cariesTooth} with composite restoration (D2330).` : 'Continue routine monitoring.'} 2. ${patient?.condition.includes('Impacted') ? 'Evaluate #18 for extraction (D7140).' : 'Schedule prophylaxis (D1110).'} 3. Prescribe Chlorhexidine 0.12% mouthwash BID x 14d. 4. Follow-up in 2 weeks. 5. Recall interval: 6 months with bitewings.`,
    });
    setSoapGenerated(true);
    setGenerating(false);
  };

  return (
    <div className="space-y-4">
      <div className={cn(glassCard, 'p-5')}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" style={{ color: accentColor }} />
            <h3 className="text-base font-semibold text-white font-display">Clinical Data</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="space-y-1.5">
            <label className="text-[10px] text-white/40 font-ui">Chief Complaint</label>
            <textarea
              value={encounterData.chiefComplaint}
              onChange={(e) => setEncounterData({ chiefComplaint: e.target.value })}
              placeholder="Pain in lower right quadrant..."
              rows={2}
              className={glassTextarea}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-white/40 font-ui">Diagnosis</label>
            <textarea
              value={encounterData.diagnosis}
              onChange={(e) => setEncounterData({ diagnosis: e.target.value })}
              placeholder="Dental caries #26..."
              rows={2}
              className={glassTextarea}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="space-y-1.5">
            <label className="text-[10px] text-white/40 font-ui">Duration</label>
            <input
              value={encounterData.duration}
              onChange={(e) => setEncounterData({ duration: e.target.value })}
              placeholder="~2 weeks"
              className={glassInput}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-white/40 font-ui">Pain Level (1-10)</label>
            <input
              type="number"
              min={0}
              max={10}
              value={encounterData.painLevel || ''}
              onChange={(e) => setEncounterData({ painLevel: parseInt(e.target.value) || 0 })}
              placeholder="6"
              className={glassInput}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-white/40 font-ui">Triggers</label>
            <input
              value={encounterData.triggers}
              onChange={(e) => setEncounterData({ triggers: e.target.value })}
              placeholder="Cold, chewing"
              className={glassInput}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-white/40 font-ui">Additional Notes</label>
          <textarea
            value={encounterData.notes}
            onChange={(e) => setEncounterData({ notes: e.target.value })}
            placeholder="Periodontal status, occlusion, oral hygiene..."
            rows={2}
            className={glassTextarea}
          />
        </div>
      </div>

      <div className={cn(glassCard, 'p-5')}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#5856D6]" />
            <h3 className="text-base font-semibold text-white font-display">AI-Generated SOAP</h3>
          </div>
          {!soapGenerated && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-1.5 rounded-[10px] bg-gradient-to-r from-[#5856D6] to-[#8FD3D1] px-3 py-1.5 text-[10px] font-bold text-white font-ui hover:opacity-90 disabled:opacity-50 transition-all"
            >
              <Sparkles className="h-3 w-3" />
              {generating ? 'Generating...' : 'Generate SOAP'}
            </button>
          )}
          {soapGenerated && (
            <button
              onClick={() => { setSoapNote(null); setSoapGenerated(false); }}
              className="text-[10px] text-white/40 font-ui hover:text-white/60"
            >
              Regenerate
            </button>
          )}
        </div>

        {!soapGenerated && !generating && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <FileText className="h-8 w-8 text-white/10 mb-2" />
            <p className="text-xs text-white/30 font-ui">Enter clinical data above, then generate a SOAP note</p>
          </div>
        )}

        {generating && (
          <div className="flex items-center justify-center py-6">
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1">
                {[0, 0.15, 0.3, 0.45].map((d, i) => (
                  <div key={i} className="h-2 w-2 rounded-full bg-[#5856D6] animate-bounce" style={{ animationDelay: `${d}s` }} />
                ))}
              </div>
              <p className="text-xs text-white/40 font-ui">AI is analyzing clinical data...</p>
            </div>
          </div>
        )}

        {soapGenerated && soapNote && (
          <div className="space-y-3">
            <div className="rounded-[12px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#8FD3D1]/20 text-[8px] font-bold text-[#8FD3D1]">S</span>
                <span className="text-[10px] font-semibold text-white/60 font-ui">Subjective</span>
              </div>
              <p className="text-[11px] text-white/70 font-ui leading-relaxed">{soapNote.subjective}</p>
            </div>
            <div className="rounded-[12px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2EE59D]/20 text-[8px] font-bold text-[#2EE59D]">O</span>
                <span className="text-[10px] font-semibold text-white/60 font-ui">Objective</span>
              </div>
              <p className="text-[11px] text-white/70 font-ui leading-relaxed">{soapNote.objective}</p>
            </div>
            <div className="rounded-[12px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FFD84D]/20 text-[8px] font-bold text-[#FFD84D]">A</span>
                <span className="text-[10px] font-semibold text-white/60 font-ui">Assessment</span>
              </div>
              <p className="text-[11px] text-white/70 font-ui leading-relaxed">{soapNote.assessment}</p>
            </div>
            <div className="rounded-[12px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#5856D6]/20 text-[8px] font-bold text-[#5856D6]">P</span>
                <span className="text-[10px] font-semibold text-white/60 font-ui">Plan</span>
              </div>
              <p className="text-[11px] text-white/70 font-ui leading-relaxed">{soapNote.plan}</p>
            </div>
            <div className="flex items-center gap-2 rounded-[10px] bg-[#2EE59D]/8 border border-[#2EE59D]/15 px-3 py-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#2EE59D]" />
              <span className="text-[10px] text-[#2EE59D] font-ui">AI-generated SOAP note ready for review</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
