/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(platform)/app/family/page.tsx
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
import { Users, UserPlus, Phone, Link2, Heart, Shield, ChevronRight } from 'lucide-react';

import { api } from '@/lib/api';

const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';
const glassCardCompact = 'rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02]';
const inputStyle = 'rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 font-ui outline-none focus:border-[#8FD3D1]/40 focus:bg-white/[0.05] transition-all';
const selectStyle = 'rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-4 py-3 text-sm text-white font-ui outline-none focus:border-[#8FD3D1]/40 transition-all';
const btnPrimary = 'rounded-[16px] bg-[#8FD3D1] text-black font-semibold text-sm font-ui hover:bg-[#8FD3D1]/90 transition-all';

const relationConfig: Record<string, { icon: any; color: string }> = {
  PARENT: { icon: Heart, color: '#8FD3D1' },
  CHILD: { icon: Heart, color: '#2EE59D' },
  SPOUSE: { icon: Heart, color: '#FFD84D' },
  CAREGIVER: { icon: Shield, color: '#5856D6' },
  GUARDIAN: { icon: Shield, color: '#FF9F0A' },
};

export default function FamilyPage() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [relationship, setRelationship] = useState('PARENT');

  const familyQuery = useQuery({ queryKey: ['family'], queryFn: api.getFamily });

  const createMutation = useMutation({
    mutationFn: () => api.createFamilyLink({ fullName, phoneNumber, relationship: relationship as never }),
    onSuccess: async () => {
      setFullName('');
      setPhoneNumber('+91');
      setShowAdd(false);
      await queryClient.invalidateQueries({ queryKey: ['family'] });
    },
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0D10' }}>
      <div className="mx-auto" style={{ maxWidth: 1600 }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,0.06)]">
          <div>
            <h1 className="text-xl font-bold text-white font-display">Family Care</h1>
            <p className="text-sm text-white/40 font-ui mt-0.5">Link dependents and caregivers</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 rounded-[14px] bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20 px-3.5 py-2 text-xs font-medium font-ui hover:bg-[#8FD3D1]/20 transition-all"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add Member
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add Member Form */}
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={glassCard}
            >
              <div className="p-5 border-b border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-[#8FD3D1]" />
                  <h2 className="text-base font-semibold text-white font-display">Add Family Member</h2>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-white/40 font-ui tracking-wider uppercase">Full Name</label>
                    <input className={inputStyle + ' w-full'} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" value={fullName} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-white/40 font-ui tracking-wider uppercase">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                      <input className={inputStyle + ' w-full pl-10'} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+91 90000 00000" value={phoneNumber} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-white/40 font-ui tracking-wider uppercase">Relationship</label>
                    <select className={selectStyle + ' w-full'} onChange={(e) => setRelationship(e.target.value)} value={relationship}>
                      <option value="PARENT" className="bg-[#15181D]">Parent</option>
                      <option value="CHILD" className="bg-[#15181D]">Child</option>
                      <option value="SPOUSE" className="bg-[#15181D]">Spouse</option>
                      <option value="CAREGIVER" className="bg-[#15181D]">Caregiver</option>
                      <option value="GUARDIAN" className="bg-[#15181D]">Guardian</option>
                    </select>
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
                        Linking...
                      </span>
                    ) : 'Link Family Profile'}
                  </button>
                  <button className="rounded-[16px] border border-[rgba(255,255,255,0.12)] text-white/70 font-ui text-sm px-6 py-3 hover:bg-white/[0.05] hover:text-white transition-all" onClick={() => setShowAdd(false)} type="button">Cancel</button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Family Members List */}
          {familyQuery.isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-[24px] bg-white/[0.03] animate-pulse" />
            ))}</div>
          ) : familyQuery.data?.length ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {familyQuery.data.map((member: any, i: number) => {
                const config = relationConfig[member.relationship] || { icon: Users, color: '#8FD3D1' };
                const Icon = config.icon;
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={glassCard}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[14px]" style={{ backgroundColor: `${config.color}15` }}>
                          <Icon className="h-6 w-6" style={{ color: config.color }} />
                        </div>
                        <span className="text-[10px] font-medium px-2.5 py-1 rounded-full font-ui" style={{ color: config.color, backgroundColor: `${config.color}15`, border: `1px solid ${config.color}25` }}>
                          {member.relationship}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-white font-display">{member.subject.fullName}</h3>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-white/40 font-ui">{member.subject.phoneNumber}</p>
                        {member.subject.wyshId && (
                          <p className="text-[10px] text-white/30 font-mono">{member.subject.wyshId}</p>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                        <button className="flex items-center gap-1 text-[11px] font-medium text-[#8FD3D1] font-ui hover:underline">
                          View Profile <ChevronRight className="h-3 w-3" />
                        </button>
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
                  <Users className="h-8 w-8 text-white/20" />
                </div>
                <h3 className="text-base font-semibold text-white/60 font-display mb-1">No family members linked</h3>
                <p className="text-sm text-white/30 font-ui max-w-sm">Add family members for shared records, bookings, and emergency access.</p>
                <button onClick={() => setShowAdd(true)}
                  className="mt-5 rounded-[14px] bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20 px-5 py-2.5 text-sm font-medium font-ui hover:bg-[#8FD3D1]/20 transition-all"
                >
                  <UserPlus className="h-4 w-4 inline mr-1.5" />Add Your First Member
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
