/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(platform)/app/insurance/page.tsx
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
 - frontend/src/hooks/use-emergency.ts
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 *
 * Calls:
 - react-query
 - react
 - date-fns
 - api-client
 - framer-motion
 *
 * Dependencies:
 - react-query
 - react
 - date-fns
 - api-client
 - framer-motion
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
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Shield, FileText, Plus, CheckCircle, Clock, Download, Lightbulb, Activity, UserCheck, Search,
} from 'lucide-react';
import { format } from 'date-fns';

import { api } from '@/lib/api-client';

const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';
const glassCardCompact = 'rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02]';

const mockPolicy = {
  provider: 'ICICI Lombard', plan: 'Health Shield Plus', policyNumber: 'POL-ICICI-2026-0042',
  memberId: 'MEM-8821', sumInsured: 500000, copayPercent: 10, coveragePercent: 90,
  startDate: new Date(Date.now() - 90 * 86400000).toISOString(),
  endDate: new Date(Date.now() + 275 * 86400000).toISOString(), status: 'ACTIVE',
};

const mockClaims = [
  { id: 'cl1', claimNumber: 'CLM-2026-0042', totalAmount: 1500, claimedAmount: 1500, approvedAmount: 1350, status: 'APPROVED', createdAt: new Date(Date.now() - 15 * 86400000).toISOString(), notes: 'Cardiology consultation' },
  { id: 'cl2', claimNumber: 'CLM-2026-0041', totalAmount: 850, claimedAmount: 850, status: 'UNDER_REVIEW', createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), notes: 'Dermatology consultation' },
  { id: 'cl3', claimNumber: 'CLM-2026-0038', totalAmount: 600, claimedAmount: 600, approvedAmount: 540, status: 'PAID', createdAt: new Date(Date.now() - 45 * 86400000).toISOString(), notes: 'Lipid profile - Lab test' },
];

const preAuths = [
  { id: 'pa1', procedureCode: 'CAR-101', diagnosisCode: 'I10', requestedAmount: 25000, approvedAmount: 22500, status: 'APPROVED', expiresAt: new Date(Date.now() + 60 * 86400000).toISOString() },
  { id: 'pa2', procedureCode: 'DERM-205', diagnosisCode: 'L23', requestedAmount: 8000, status: 'PENDING', expiresAt: new Date(Date.now() + 30 * 86400000).toISOString() },
];

const coverageSummary = [
  { category: 'Room Charges', coverage: 100, maxAmount: 15000 },
  { category: 'Consultation', coverage: 90, maxAmount: 2000 },
  { category: 'Medication', coverage: 80, maxAmount: 5000 },
  { category: 'Lab Tests', coverage: 100, maxAmount: 10000 },
  { category: 'Procedure', coverage: 75, maxAmount: 100000 },
];

const statusConfig: Record<string, { color: string; label: string }> = {
  ACTIVE: { color: '#2EE59D', label: 'Active' },
  APPROVED: { color: '#2EE59D', label: 'Approved' },
  PAID: { color: '#2EE59D', label: 'Paid' },
  UNDER_REVIEW: { color: '#FFD84D', label: 'Under Review' },
  PENDING: { color: '#FFD84D', label: 'Pending' },
  REJECTED: { color: '#FF5A5A', label: 'Rejected' },
  EXPIRED: { color: '#FF5A5A', label: 'Expired' },
};

function TabButton({ active, label, onClick, icon: Icon }: { active: boolean; label: string; onClick: () => void; icon: any }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-medium font-ui rounded-[10px] transition-all whitespace-nowrap ${
        active ? 'bg-[#8FD3D1]/10 text-[#8FD3D1]' : 'text-white/40 hover:text-white/60'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function QuickActionCard({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <button className="flex flex-col items-center justify-center gap-2 rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04]">
      <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: `${color}15` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <span className="text-xs font-medium text-white/60 font-ui">{label}</span>
    </button>
  );
}

export default function InsurancePage() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: policies } = useQuery({
    queryKey: ['policies'], queryFn: () => api.getPolicies(),
  });

  const firstPolicy = policies?.[0];
  const policy = firstPolicy ? {
    provider: firstPolicy.provider?.name ?? 'Provider',
    plan: firstPolicy.plan?.name ?? 'Plan',
    policyNumber: firstPolicy.policyNumber,
    memberId: firstPolicy.memberId,
    sumInsured: firstPolicy.sumInsured,
    copayPercent: firstPolicy.copayPercent,
    coveragePercent: firstPolicy.coveragePercent,
    startDate: firstPolicy.startDate,
    endDate: firstPolicy.endDate,
    status: firstPolicy.status,
  } : mockPolicy;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0D10' }}>
      <div className="mx-auto" style={{ maxWidth: 1600 }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,0.06)]">
          <div>
            <h1 className="text-xl font-bold text-white font-display">Insurance Dashboard</h1>
            <p className="text-sm text-white/40 font-ui mt-0.5">Manage your health insurance, claims & pre-authorizations</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-[14px] bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20 px-3.5 py-2 text-xs font-medium font-ui hover:bg-[#8FD3D1]/20 transition-all">
            <Plus className="h-3.5 w-3.5" />
            File Claim
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[24px] bg-gradient-to-br from-[#1a3a3a] to-[#0B1B1B] border border-[#8FD3D1]/20 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full font-ui text-[#2EE59D] bg-[#2EE59D]/10 border border-[#2EE59D]/20 mb-3">
                    Policy Active
                  </span>
                  <p className="text-lg font-semibold text-white font-display">{policy.provider}</p>
                  <p className="text-sm text-white/60 font-ui">{policy.plan}</p>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/40 font-ui">Sum Insured</p>
                      <p className="text-2xl font-bold text-white font-display">₹{policy.sumInsured.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/40 font-ui">Coverage</p>
                      <p className="text-2xl font-bold text-white font-display">{policy.coveragePercent}%</p>
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full font-ui ${
                  policy.status === 'ACTIVE'
                    ? 'text-[#2EE59D] bg-[#2EE59D]/10 border border-[#2EE59D]/20'
                    : 'text-white/40 bg-white/[0.04] border border-white/[0.06]'
                }`}>{policy.status}</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/40 font-ui">
                <span>Policy: {policy.policyNumber}</span>
                <span>Member: {policy.memberId}</span>
                <span>Valid till: {format(new Date(policy.endDate), 'MMM d, yyyy')}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="grid grid-cols-2 gap-4"
            >
              <QuickActionCard icon={FileText} label="File Claim" color="#8FD3D1" />
              <QuickActionCard icon={UserCheck} label="Check Eligibility" color="#2EE59D" />
              <QuickActionCard icon={Search} label="View Pre-Auths" color="#5856D6" />
              <QuickActionCard icon={Download} label="Download Card" color="#FFD84D" />
            </motion.div>
          </div>

          <div className={glassCard}>
            <div className="p-5 border-b border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <TabButton active={activeTab === 'overview'} label="Overview" icon={Shield} onClick={() => setActiveTab('overview')} />
                <TabButton active={activeTab === 'claims'} label={`Claims (${mockClaims.length})`} icon={FileText} onClick={() => setActiveTab('claims')} />
                <TabButton active={activeTab === 'preauth'} label="Pre-Authorizations" icon={CheckCircle} onClick={() => setActiveTab('preauth')} />
                <TabButton active={activeTab === 'coverage'} label="Coverage" icon={Activity} onClick={() => setActiveTab('coverage')} />
              </div>
            </div>

            <div className="p-5">
              {activeTab === 'overview' && (
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white font-display mb-4">Coverage Summary</h3>
                    <div className="space-y-3">
                      {coverageSummary.map((item) => (
                        <div key={item.category}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-white/60 font-ui">{item.category}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">{item.coverage}%</span>
                              <span className="text-xs text-white/30 font-ui">up to ₹{item.maxAmount.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <div className="h-full rounded-full bg-[#8FD3D1] transition-all" style={{ width: `${item.coverage}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-display mb-4">
                      <Lightbulb className="h-4 w-4 text-[#FFD84D]" />
                      AI Copilot Analysis
                    </h3>
                    <div className="space-y-3">
                      <div className="rounded-[16px] bg-[#2EE59D]/5 border border-[#2EE59D]/10 p-3">
                        <p className="text-sm font-medium text-[#2EE59D] font-ui">Claims Success Rate: 95%</p>
                        <p className="text-xs text-white/50 font-ui mt-1">Your claims have a high approval rate. Continue maintaining proper documentation.</p>
                      </div>
                      <div className="rounded-[16px] bg-[#8FD3D1]/5 border border-[#8FD3D1]/10 p-3">
                        <p className="text-sm font-medium text-[#8FD3D1] font-ui">Remaining Coverage: ₹3,85,000</p>
                        <p className="text-xs text-white/50 font-ui mt-1">You have utilized 23% of your annual sum insured.</p>
                      </div>
                      <div className="rounded-[16px] bg-[#FFD84D]/5 border border-[#FFD84D]/10 p-3">
                        <p className="text-sm font-medium text-[#FFD84D] font-ui">Pre-auth Required for Procedures</p>
                        <p className="text-xs text-white/50 font-ui mt-1">Any planned hospitalization requires pre-authorization for full coverage.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'claims' && (
                <div className="space-y-3">
                  {mockClaims.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileText className="h-8 w-8 text-white/20 mb-3" />
                      <h4 className="text-sm font-medium text-white/60 font-ui">No claims yet</h4>
                    </div>
                  ) : (
                    mockClaims.map((claim, i) => {
                      const status = statusConfig[claim.status] || { color: '#8FD3D1', label: claim.status };
                      return (
                        <motion.div
                          key={claim.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={glassCardCompact + ' p-4 transition-all'}
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${status.color}15` }}>
                                {claim.status === 'PAID' ? <CheckCircle className="h-5 w-5" style={{ color: status.color }} /> :
                                 claim.status === 'UNDER_REVIEW' ? <Clock className="h-5 w-5" style={{ color: status.color }} /> :
                                 <FileText className="h-5 w-5" style={{ color: status.color }} />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-white font-ui">{claim.claimNumber}</p>
                                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full font-ui" style={{ color: status.color, backgroundColor: `${status.color}15`, border: `1px solid ${status.color}25` }}>{status.label}</span>
                                </div>
                                <p className="text-xs text-white/40 font-ui mt-0.5">{claim.notes}</p>
                                <div className="flex items-center gap-3 mt-1 text-[11px] text-white/30 font-ui">
                                  <span>{format(new Date(claim.createdAt), 'MMM d, yyyy')}</span>
                                  <span>Claimed: ₹{claim.claimedAmount}</span>
                                  {claim.approvedAmount && <span>Approved: ₹{claim.approvedAmount}</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === 'preauth' && (
                <div className="space-y-3">
                  {preAuths.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <CheckCircle className="h-8 w-8 text-white/20 mb-3" />
                      <h4 className="text-sm font-medium text-white/60 font-ui">No pre-authorizations</h4>
                    </div>
                  ) : (
                    preAuths.map((pa, i) => {
                      const status = statusConfig[pa.status] || { color: '#8FD3D1', label: pa.status };
                      return (
                        <motion.div
                          key={pa.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={glassCardCompact + ' p-4'}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-white font-ui">Procedure: {pa.procedureCode}</p>
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full font-ui" style={{ color: status.color, backgroundColor: `${status.color}15`, border: `1px solid ${status.color}25` }}>{status.label}</span>
                              </div>
                              <p className="text-xs text-white/40 font-ui mt-1">Diagnosis: {pa.diagnosisCode}</p>
                              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-white/30 font-ui">
                                <span>Requested: ₹{pa.requestedAmount.toLocaleString()}</span>
                                {pa.approvedAmount && <span>Approved: ₹{pa.approvedAmount.toLocaleString()}</span>}
                                <span>Expires: {format(new Date(pa.expiresAt), 'MMM d, yyyy')}</span>
                              </div>
                            </div>
                            <button className="rounded-[10px] border border-[rgba(255,255,255,0.12)] text-white/70 font-ui px-3 py-1.5 text-[11px] font-medium hover:bg-white/[0.05] hover:text-white transition-all">
                              View Details
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === 'coverage' && (
                <div className={glassCardCompact + ' p-5'}>
                  <h3 className="text-sm font-semibold text-white font-display mb-4">Coverage Details by Category</h3>
                  <div className="space-y-3">
                    {coverageSummary.map((item) => (
                      <div key={item.category} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                        <div>
                          <p className="text-sm font-medium text-white font-ui">{item.category}</p>
                          <p className="text-xs text-white/30 font-ui">Max: ₹{item.maxAmount.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-24 rounded-full bg-white/[0.06] overflow-hidden">
                            <div className="h-full rounded-full bg-[#8FD3D1]" style={{ width: `${item.coverage}%` }} />
                          </div>
                          <span className="text-sm font-semibold text-white w-12 text-right">{item.coverage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
