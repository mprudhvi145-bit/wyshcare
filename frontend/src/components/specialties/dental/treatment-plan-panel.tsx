/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/specialties/dental/treatment-plan-panel.tsx
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
 * React component: treatment-plan-panel
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
import { Scissors, X, Sparkles, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDentalWorkspaceStore } from '@/stores/dental-workspace-store';

const accentColor = '#FFD84D';
const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';

const CDT_CODES = [
  { code: 'D0120', name: 'Periodic oral evaluation', category: 'exam', cost: 50 },
  { code: 'D0150', name: 'Comprehensive oral evaluation', category: 'exam', cost: 85 },
  { code: 'D0210', name: 'Intraoral - complete series', category: 'imaging', cost: 120 },
  { code: 'D0220', name: 'Intraoral - periapical first', category: 'imaging', cost: 35 },
  { code: 'D0274', name: 'Bitewings - four films', category: 'imaging', cost: 60 },
  { code: 'D1110', name: 'Prophylaxis - adult', category: 'preventive', cost: 90 },
  { code: 'D1206', name: 'Fluoride varnish', category: 'preventive', cost: 35 },
  { code: 'D1351', name: 'Sealant - per tooth', category: 'preventive', cost: 45 },
  { code: 'D2140', name: 'Amalgam - one surface', category: 'restorative', cost: 150 },
  { code: 'D2330', name: 'Resin - one surface', category: 'restorative', cost: 175 },
  { code: 'D2740', name: 'Crown - porcelain', category: 'prosthodontics', cost: 1200 },
  { code: 'D3310', name: 'Root canal - anterior', category: 'endodontics', cost: 800 },
  { code: 'D6010', name: 'Implant', category: 'implant', cost: 2500 },
  { code: 'D7140', name: 'Extraction', category: 'oral_surgery', cost: 200 },
  { code: 'D7210', name: 'Extraction - surgical', category: 'oral_surgery', cost: 350 },
  { code: 'D4341', name: 'Scaling and root planing', category: 'periodontics', cost: 250 },
];

const UPPER_R = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_L = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_R = [48, 47, 46, 45, 44, 43, 42, 41];
const LOWER_L = [31, 32, 33, 34, 35, 36, 37, 38];
const ALL_TEETH = [...UPPER_R, ...UPPER_L, ...LOWER_R, ...LOWER_L];

export function TreatmentPlanPanel() {
  const { treatmentPlan, addTreatmentRow, updateTreatmentRow, removeTreatmentRow } = useDentalWorkspaceStore();
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);

  const totalCost = treatmentPlan.reduce((sum, row) => {
    const cost = parseFloat(row.cost.replace(/[^0-9.]/g, ''));
    return sum + (isNaN(cost) ? 0 : cost);
  }, 0);

  const handleProcedureSelect = (index: number, code: string) => {
    const proc = CDT_CODES.find((p) => p.code === code);
    if (proc) {
      updateTreatmentRow(index, 'procedure', proc.code);
      updateTreatmentRow(index, 'procedureName', proc.name);
      updateTreatmentRow(index, 'cost', `$${proc.cost}`);
      updateTreatmentRow(index, 'category', proc.category);
    }
  };

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Scissors className="h-4 w-4" style={{ color: accentColor }} />
          <h3 className="text-base font-semibold text-white font-display">Treatment Plan</h3>
          {treatmentPlan.length > 0 && (
            <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[9px] text-white/50 font-ui">{treatmentPlan.length} items</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAiSuggestions(!showAiSuggestions)}
            className="flex items-center gap-1.5 rounded-[10px] bg-[#5856D6]/15 border border-[#5856D6]/25 px-3 py-1.5 text-[10px] font-medium text-[#5856D6] font-ui hover:bg-[#5856D6]/25 transition-all"
          >
            <Sparkles className="h-3 w-3" />
            AI Suggest
          </button>
          <button
            onClick={() => addTreatmentRow()}
            className="rounded-[10px] bg-white/[0.05] px-3 py-1.5 text-[10px] font-medium text-white/60 font-ui hover:bg-white/[0.08] transition-all"
          >
            + Add Procedure
          </button>
        </div>
      </div>

      {showAiSuggestions && (
        <div className="mb-4 rounded-[14px] bg-[#5856D6]/8 border border-[#5856D6]/15 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="h-3 w-3 text-[#5856D6]" />
            <span className="text-[10px] font-semibold text-[#5856D6] font-ui">AI Recommended Procedures</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { tooth: '26', procedure: 'D2330', name: 'Resin composite filling', confidence: '95%' },
              { tooth: '18', procedure: 'D7140', name: 'Extraction', confidence: '88%' },
              { tooth: '26', procedure: 'D2740', name: 'Porcelain crown', confidence: '72%' },
            ].map((rec, i) => (
              <button
                key={i}
                onClick={() => addTreatmentRow({ tooth: rec.tooth, procedure: rec.procedure, procedureName: rec.name, cost: CDT_CODES.find(c => c.code === rec.procedure) ? `$${CDT_CODES.find(c => c.code === rec.procedure)!.cost}` : '', priority: 'elective', status: 'pending', category: CDT_CODES.find(c => c.code === rec.procedure)?.category ?? '' })}
                className="flex items-center justify-between rounded-[10px] bg-white/[0.03] px-2.5 py-2 text-left hover:bg-white/[0.06] transition-all"
              >
                <div>
                  <span className="text-[11px] text-white/80 font-ui">#{rec.tooth} — {rec.name}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] text-[#5856D6] font-ui font-medium">{rec.procedure}</span>
                    <span className="text-[8px] text-white/30 font-ui">{rec.confidence} confidence</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="grid grid-cols-[70px_1fr_80px_70px_90px_28px] gap-1.5 px-1">
          {['Tooth', 'Procedure', 'Cost', 'Priority', 'Status', ''].map((h) => (
            <span key={h} className="text-[9px] font-semibold text-white/25 font-ui tracking-wider uppercase">{h}</span>
          ))}
        </div>

        {treatmentPlan.length === 0 ? (
          <p className="text-xs text-white/20 font-ui text-center py-6">No procedures planned. Click &quot;Add Procedure&quot; or use AI Suggest.</p>
        ) : (
          treatmentPlan.map((row, i) => (
            <div key={i} className="grid grid-cols-[70px_1fr_80px_70px_90px_28px] gap-1.5 items-center">
              <select
                value={row.tooth}
                onChange={(e) => updateTreatmentRow(i, 'tooth', e.target.value)}
                className="rounded-[8px] border border-[rgba(255,255,255,0.06)] bg-[#1C2025] px-2 py-1.5 text-[11px] text-white font-ui"
              >
                <option value="">Select</option>
                {ALL_TEETH.map((n) => (
                  <option key={n} value={String(n)}>#{n}</option>
                ))}
              </select>

              <select
                value={row.procedure}
                onChange={(e) => handleProcedureSelect(i, e.target.value)}
                className="rounded-[8px] border border-[rgba(255,255,255,0.06)] bg-[#1C2025] px-2 py-1.5 text-[11px] text-white font-ui truncate"
              >
                <option value="">Select</option>
                {CDT_CODES.map((p) => (
                  <option key={p.code} value={p.code}>{p.code} — {p.name}</option>
                ))}
              </select>

              <input
                value={row.cost}
                onChange={(e) => updateTreatmentRow(i, 'cost', e.target.value)}
                placeholder="$0"
                className="rounded-[8px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02] px-2 py-1.5 text-[11px] text-white font-ui"
              />

              <select
                value={row.priority}
                onChange={(e) => updateTreatmentRow(i, 'priority', e.target.value)}
                className="rounded-[8px] border border-[rgba(255,255,255,0.06)] bg-[#1C2025] px-2 py-1.5 text-[11px] text-white font-ui"
              >
                <option value="urgent">Urgent</option>
                <option value="elective">Elective</option>
                <option value="cosmetic">Cosmetic</option>
              </select>

              <div className="flex items-center gap-1.5">
                <div className={cn(
                  'h-1.5 w-1.5 rounded-full shrink-0',
                  row.status === 'pending' ? 'bg-[#FFD84D]' :
                  row.status === 'approved' ? 'bg-[#8FD3D1]' :
                  row.status === 'completed' ? 'bg-[#2EE59D]' : 'bg-white/20',
                )} />
                <select
                  value={row.status}
                  onChange={(e) => updateTreatmentRow(i, 'status', e.target.value)}
                  className="rounded-[8px] border border-[rgba(255,255,255,0.06)] bg-[#1C2025] px-2 py-1.5 text-[11px] text-white font-ui flex-1"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <button onClick={() => removeTreatmentRow(i)} className="p-1.5 text-white/20 hover:text-[#FF5A5A] transition-all">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))
        )}
      </div>

      {treatmentPlan.length > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-[14px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] px-4 py-3">
          <span className="text-xs text-white/50 font-ui">Estimated Total</span>
          <span className="text-lg font-bold text-white font-display">${totalCost.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
