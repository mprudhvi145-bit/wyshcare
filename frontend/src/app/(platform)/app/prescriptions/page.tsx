/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(platform)/app/prescriptions/page.tsx
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
 - framer-motion
 - date-fns
 *
 * Dependencies:
 - react
 - framer-motion
 - date-fns
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
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pill, Download, AlertTriangle, QrCode, ChevronDown, ChevronUp,
  Calendar, CheckCircle2, Clock, FileText,
} from 'lucide-react';
import { format } from 'date-fns';

const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';
const glassCardCompact = 'rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02]';

const mockPrescriptions = [
  {
    id: 'p1',
    diagnosisSummary: 'Essential Hypertension - Stage 1',
    instructions: 'Take once daily with food. Monitor BP weekly. Avoid high sodium foods.',
    refillDueAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    issuedAt: new Date(Date.now() - 259200000).toISOString(),
    doctorProfile: { user: { fullName: 'Dr. Kavya Nair' } },
    medications: [
      { id: 'm1', name: 'Telmisartan', dosage: '40mg', frequency: 'Once daily', duration: '30 days', adherence: 85 },
      { id: 'm2', name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', duration: '30 days', adherence: 90 },
    ],
    drugInteractions: ['No known interactions detected'],
  },
  {
    id: 'p2', diagnosisSummary: 'Vitamin D Deficiency',
    instructions: 'Take one capsule weekly after a meal. Sun exposure recommended.',
    refillDueAt: new Date(Date.now() + 15 * 86400000).toISOString(),
    issuedAt: new Date(Date.now() - 1209600000).toISOString(),
    doctorProfile: { user: { fullName: 'Dr. Ananya Gupta' } },
    medications: [
      { id: 'm3', name: 'Vitamin D3', dosage: '60K IU', frequency: 'Once weekly', duration: '8 weeks', adherence: 70 },
    ],
    drugInteractions: ['No known interactions detected'],
  },
  {
    id: 'p3', diagnosisSummary: 'Type 2 Diabetes Mellitus',
    instructions: 'Take with meals. Monitor blood glucose levels regularly.',
    refillDueAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    issuedAt: new Date(Date.now() - 2592000000).toISOString(),
    doctorProfile: { user: { fullName: 'Dr. Sai Venkatesh' } },
    medications: [
      { id: 'm4', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals', duration: '90 days', adherence: 80 },
    ],
    drugInteractions: [
      'Caution: Metformin + NSAIDs may increase risk of lactic acidosis',
      'Monitor renal function regularly',
    ],
  },
];

export default function PrescriptionsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0D10' }}>
      <div className="mx-auto" style={{ maxWidth: 1600 }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,0.06)]">
          <div>
            <h1 className="text-xl font-bold text-white font-display">Digital Prescriptions</h1>
            <p className="text-sm text-white/40 font-ui mt-0.5">Your complete medication plan with adherence tracking</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/70 font-ui hover:bg-white/[0.06] hover:text-white transition-all">
            <Download className="h-3.5 w-3.5" />
            Export All
          </button>
        </div>

        <div className="p-6 space-y-4">
          {mockPrescriptions.map((rx, i) => {
            const isExpanded = expanded === rx.id;
            const overallAdherence = Math.round(
              rx.medications.reduce((sum, m) => sum + m.adherence, 0) / rx.medications.length,
            );
            const isRefillDue = rx.refillDueAt && new Date(rx.refillDueAt) < new Date();

            return (
              <motion.div
                key={rx.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={glassCard + ' transition-all'}
              >
                <div className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#8FD3D1]/10">
                        <Pill className="h-6 w-6 text-[#8FD3D1]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-semibold text-white font-display">{rx.doctorProfile?.user?.fullName ?? 'Doctor'}</span>
                          <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full font-ui text-[#2EE59D] bg-[#2EE59D]/10 border border-[#2EE59D]/20">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </span>
                          {isRefillDue && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full font-ui text-[#FF5A5A] bg-[#FF5A5A]/10 border border-[#FF5A5A]/20">
                              Refill Overdue
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-white/60 font-ui">{rx.diagnosisSummary}</p>
                        <div className="mt-2 flex items-center gap-3 text-[11px] text-white/40 font-ui flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(rx.issuedAt), 'MMM d, yyyy')}
                          </span>
                          {rx.refillDueAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Refill: {format(new Date(rx.refillDueAt), 'MMM d')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-white/50 font-ui">
                          <span>Adherence</span>
                          <span className="font-semibold text-white">{overallAdherence}%</span>
                        </div>
                        <div className="mt-1 h-1.5 w-24 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${overallAdherence}%`, backgroundColor: overallAdherence >= 80 ? '#2EE59D' : overallAdherence >= 60 ? '#FFD84D' : '#FF5A5A' }}
                          />
                        </div>
                      </div>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-[10px] hover:bg-white/[0.05] transition-all"
                        onClick={() => setExpanded(isExpanded ? null : rx.id)}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-white/50" /> : <ChevronDown className="h-4 w-4 text-white/50" />}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 space-y-4 border-t border-[rgba(255,255,255,0.06)] pt-4 overflow-hidden"
                      >
                        <div>
                          <p className="text-[10px] font-semibold text-white/30 font-ui tracking-wider uppercase mb-2">Medications</p>
                          <div className="space-y-2">
                            {rx.medications.map((med) => (
                              <div key={med.id} className="flex items-center justify-between rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02] p-3">
                                <div>
                                  <p className="text-sm font-medium text-white font-ui">{med.name} {med.dosage}</p>
                                  <p className="text-[11px] text-white/40 font-ui">{med.frequency} · {med.duration}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <span className="text-xs text-white/50 font-ui">{med.adherence}%</span>
                                    <div className="mt-1 h-1 w-16 rounded-full bg-white/[0.06] overflow-hidden">
                                      <div className="h-full rounded-full bg-[#8FD3D1] transition-all" style={{ width: `${med.adherence}%` }} />
                                    </div>
                                  </div>
                                  <button className="flex h-7 w-7 items-center justify-center rounded-[8px] hover:bg-white/[0.05] transition-all">
                                    <Download className="h-3.5 w-3.5 text-white/40" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold text-white/30 font-ui tracking-wider uppercase mb-2">Instructions</p>
                          <div className="rounded-[14px] bg-[#8FD3D1]/5 border border-[#8FD3D1]/10 px-3 py-2">
                            <p className="text-sm text-white/60 font-ui">{rx.instructions}</p>
                          </div>
                        </div>

                        {rx.drugInteractions.length > 0 && (
                          <div>
                            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-white/30 font-ui tracking-wider uppercase mb-2">
                              <AlertTriangle className="h-3 w-3 text-[#FFD84D]" />
                              Drug Interaction Alerts
                            </p>
                            {rx.drugInteractions.map((di, i) => (
                              <div
                                key={i}
                                className={`rounded-[12px] px-3 py-2 text-sm mb-1 font-ui ${
                                  di.includes('No known') ? 'bg-[#2EE59D]/10 text-[#2EE59D] border border-[#2EE59D]/20' : 'bg-[#FFD84D]/10 text-[#FFD84D] border border-[#FFD84D]/20'
                                }`}
                              >
                                {di}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] pt-4">
                          <div className="flex items-center gap-2">
                            <QrCode className="h-5 w-5 text-white/30" />
                            <span className="text-[11px] text-white/30 font-ui">Verified by WyshCare</span>
                          </div>
                          <div className="flex gap-2">
                            <button className="flex items-center gap-1 rounded-[10px] border border-[rgba(255,255,255,0.12)] text-white/70 font-ui px-3 py-1.5 text-[11px] font-medium hover:bg-white/[0.05] hover:text-white transition-all">
                              <Download className="h-3.5 w-3.5" />
                              PDF
                            </button>
                            <button className="rounded-[10px] bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20 px-3 py-1.5 text-[11px] font-medium font-ui hover:bg-[#8FD3D1]/20 transition-all">
                              Order Refill
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
