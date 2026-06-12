/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(platform)/app/consent/page.tsx
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
 - api
 - lucide-react
 - framer-motion
 *
 * Dependencies:
 - react-query
 - react
 - api
 - lucide-react
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

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Share2, Plus, XCircle, CheckCircle2, Clock, Link2, User, FileWarning } from 'lucide-react';

import { api } from '@/lib/api';

const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';
const glassCardCompact = 'rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02]';
const inputStyle = 'rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 font-ui outline-none focus:border-[#8FD3D1]/40 focus:bg-white/[0.05] transition-all';
const btnPrimary = 'rounded-[16px] bg-[#8FD3D1] text-black font-semibold text-sm font-ui hover:bg-[#8FD3D1]/90 transition-all';
const btnDanger = 'rounded-[16px] border border-[#FF5A5A]/30 text-[#FF5A5A] font-ui text-sm hover:bg-[#FF5A5A]/10 transition-all';

const statusConfig: Record<string, { color: string; label: string }> = {
  ACTIVE: { color: '#2EE59D', label: 'Active' },
  PENDING: { color: '#FFD84D', label: 'Pending' },
  EXPIRED: { color: '#FF5A5A', label: 'Expired' },
  REVOKED: { color: '#FF5A5A', label: 'Revoked' },
};

export default function ConsentPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [purpose, setPurpose] = useState('Specialist consultation');
  const [granteeWyshId, setGranteeWyshId] = useState('');

  const consentsQuery = useQuery({ queryKey: ['consents'], queryFn: api.getConsents });

  const createMutation = useMutation({
    mutationFn: () =>
      api.createConsent({
        granteeWyshId: granteeWyshId || undefined,
        accessLevel: 'LIMITED',
        accessMethod: granteeWyshId ? 'MANUAL_APPROVAL' : 'SHARE_LINK',
        purpose,
        scope: { reports: true, prescriptions: true, timeline: true },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60_000).toISOString(),
      }),
    onSuccess: async () => {
      setGranteeWyshId('');
      setShowCreate(false);
      await queryClient.invalidateQueries({ queryKey: ['consents'] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => api.revokeConsent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['consents'] });
    },
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0D10' }}>
      <div className="mx-auto" style={{ maxWidth: 1600 }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,0.06)]">
          <div>
            <h1 className="text-xl font-bold text-white font-display">Consent & Access Control</h1>
            <p className="text-sm text-white/40 font-ui mt-0.5">Manage who can access your health records</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-[14px] bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20 px-3.5 py-2 text-xs font-medium font-ui hover:bg-[#8FD3D1]/20 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            New Consent
          </button>
        </div>

        <div className="p-6 space-y-6">
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={glassCard}
            >
              <div className="p-5 border-b border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-[#8FD3D1]" />
                  <h2 className="text-base font-semibold text-white font-display">Grant Access</h2>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-white/40 font-ui tracking-wider uppercase">Purpose</label>
                    <input className={inputStyle + ' w-full'} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Specialist consultation" value={purpose} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-white/40 font-ui tracking-wider uppercase">Doctor WyshID (optional)</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                      <input className={inputStyle + ' w-full pl-10'} onChange={(e) => setGranteeWyshId(e.target.value)} placeholder="Leave empty for share link" value={granteeWyshId} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button className={btnPrimary + ' px-6 py-3'} onClick={() => createMutation.mutate()} type="button" disabled={createMutation.isPending}>
                    {createMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating...
                      </span>
                    ) : 'Create Consent'}
                  </button>
                  <button className="rounded-[16px] border border-[rgba(255,255,255,0.12)] text-white/70 font-ui text-sm px-6 py-3 hover:bg-white/[0.05] hover:text-white transition-all"
                    onClick={() => setShowCreate(false)} type="button">Cancel</button>
                </div>
              </div>
            </motion.div>
          )}

          {consentsQuery.isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-[24px] bg-white/[0.03] animate-pulse" />
            ))}</div>
          ) : consentsQuery.data?.length ? (
            <div className="space-y-3">
              {consentsQuery.data.map((consent: any, i: number) => {
                const status = statusConfig[consent.status] || { color: '#8FD3D1', label: consent.status };
                return (
                  <motion.div
                    key={consent.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={glassCard}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${status.color}15` }}>
                            {consent.grantedToUser ? <User className="h-5 w-5" style={{ color: status.color }} /> : <Link2 className="h-5 w-5" style={{ color: status.color }} />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-white font-ui">
                                {consent.grantedToUser?.fullName ?? 'Share Link Access'}
                              </span>
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full font-ui"
                                style={{ color: status.color, backgroundColor: `${status.color}15`, border: `1px solid ${status.color}25` }}
                              >{status.label}</span>
                            </div>
                            <p className="text-xs text-white/40 font-ui mt-1">{consent.accessLevel} access for {consent.purpose}</p>
                            {'shareUrl' in consent && consent.shareUrl ? (
                              <p className="mt-2 text-xs text-[#8FD3D1] font-mono truncate">{consent.shareUrl}</p>
                            ) : null}
                          </div>
                        </div>
                        {consent.status === 'ACTIVE' && (
                          <button
                            className="flex items-center gap-1.5 rounded-[12px] border border-[#FF5A5A]/30 text-[#FF5A5A] px-3.5 py-2 text-[11px] font-medium font-ui hover:bg-[#FF5A5A]/10 transition-all"
                            onClick={() => revokeMutation.mutate(consent.id)}
                            type="button"
                            disabled={revokeMutation.isPending}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className={glassCard}>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-white/[0.04] mb-4">
                  <Shield className="h-8 w-8 text-white/20" />
                </div>
                <h3 className="text-base font-semibold text-white/60 font-display mb-1">No consents created</h3>
                <p className="text-sm text-white/30 font-ui max-w-sm">Grant access to your health records for consultations or share a secure link.</p>
                <button onClick={() => setShowCreate(true)}
                  className="mt-5 rounded-[14px] bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20 px-5 py-2.5 text-sm font-medium font-ui hover:bg-[#8FD3D1]/20 transition-all"
                >
                  <Plus className="h-4 w-4 inline mr-1.5" />Grant Your First Access
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
