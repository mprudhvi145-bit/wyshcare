/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/specialties/dental/billing-panel.tsx
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
 * React component: billing-panel
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
import { DollarSign, FileText, Shield, CheckCircle2, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDentalWorkspaceStore } from '@/stores/dental-workspace-store';

const accentColor = '#FFD84D';
const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';

const INSURANCE_PLANS = [
  { id: 'none', name: 'Self-Pay' },
  { id: 'delta-dental', name: 'Delta Dental PPO' },
  { id: 'cigna', name: 'Cigna Dental' },
  { id: 'metlife', name: 'MetLife' },
  { id: 'aetna', name: 'Aetna Dental' },
];

export function BillingPanel() {
  const { treatmentPlan } = useDentalWorkspaceStore();
  const [insurancePlan, setInsurancePlan] = useState('delta-dental');
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const totalCost = treatmentPlan.reduce((sum, row) => {
    const cost = parseFloat(row.cost.replace(/[^0-9.]/g, ''));
    return sum + (isNaN(cost) ? 0 : cost);
  }, 0);

  const coverageRate = insurancePlan === 'none' ? 0 : insurancePlan === 'delta-dental' ? 0.8 : 0.65;
  const insuranceCoverage = totalCost * coverageRate;
  const patientShare = totalCost - insuranceCoverage;

  const handleGenerateInvoice = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setInvoiceGenerated(true);
    setSubmitting(false);
  };

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" style={{ color: accentColor }} />
          <h3 className="text-base font-semibold text-white font-display">Billing & Insurance</h3>
        </div>
        {invoiceGenerated && (
          <div className="flex items-center gap-1 text-[10px] text-[#2EE59D] font-ui">
            <CheckCircle2 className="h-3 w-3" />
            Invoice Generated
          </div>
        )}
      </div>

      {treatmentPlan.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <FileText className="h-8 w-8 text-white/10 mb-2" />
          <p className="text-xs text-white/30 font-ui">Add procedures to the treatment plan to generate billing</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-white/40 font-ui mb-1.5 block">Insurance Plan</label>
            <div className="grid grid-cols-3 gap-2">
              {INSURANCE_PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => { setInvoiceGenerated(false); setInsurancePlan(plan.id); }}
                  className={cn(
                    'flex items-center gap-1.5 rounded-[10px] border px-2.5 py-2 text-[11px] font-medium font-ui transition-all',
                    insurancePlan === plan.id
                      ? 'border-[#FFD84D]/30 bg-[#FFD84D]/10 text-[#FFD84D]'
                      : 'border-[rgba(255,255,255,0.06)] bg-white/[0.02] text-white/50 hover:bg-white/[0.04]',
                  )}
                >
                  <Shield className="h-3 w-3" />
                  {plan.name}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[14px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white/50 font-ui">Treatment Cost</span>
              <span className="text-sm font-semibold text-white font-display">${totalCost.toLocaleString()}</span>
            </div>

            {insurancePlan !== 'none' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/50 font-ui">Insurance Coverage ({(coverageRate * 100).toFixed(0)}%)</span>
                  <span className="text-sm font-semibold text-[#8FD3D1] font-display">${insuranceCoverage.toLocaleString()}</span>
                </div>
                <div className="h-px bg-[rgba(255,255,255,0.06)]" />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/50 font-ui">Patient Share</span>
                  <span className="text-lg font-bold text-white font-display">${patientShare.toLocaleString()}</span>
                </div>
              </>
            )}

            {insurancePlan === 'none' && (
              <>
                <div className="h-px bg-[rgba(255,255,255,0.06)]" />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/50 font-ui">Total Due</span>
                  <span className="text-lg font-bold text-white font-display">${totalCost.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>

          <div className="rounded-[14px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3">
            <h4 className="text-[10px] font-semibold text-white/30 font-ui tracking-wider uppercase mb-2">Invoice Items</h4>
            <div className="space-y-1.5">
              {treatmentPlan.map((row, i) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-white/30 font-mono">{row.procedure || '—'}</span>
                    <span className="text-white/50 font-ui truncate">#{row.tooth}</span>
                  </div>
                  <span className="text-white/70 font-ui">{row.cost}</span>
                </div>
              ))}
            </div>
          </div>

          {!invoiceGenerated ? (
            <button
              onClick={handleGenerateInvoice}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#FFD84D] to-[#F59E0B] text-[#0B0D10] py-3 text-xs font-bold font-ui hover:opacity-90 disabled:opacity-50 transition-all"
            >
              <FileText className="h-4 w-4" />
              {submitting ? 'Generating...' : 'Generate Invoice'}
            </button>
          ) : (
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#FFD84D] to-[#F59E0B] text-[#0B0D10] py-3 text-xs font-bold font-ui hover:opacity-90 transition-all">
                <Printer className="h-4 w-4" />
                Print Invoice
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 rounded-[14px] bg-[#8FD3D1]/15 border border-[#8FD3D1]/25 text-[#8FD3D1] py-3 text-xs font-bold font-ui hover:bg-[#8FD3D1]/25 transition-all">
                Submit Claim
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
