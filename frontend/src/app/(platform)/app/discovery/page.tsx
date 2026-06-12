/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(platform)/app/discovery/page.tsx
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
import { Search, Stethoscope, Video, Star, MapPin, ChevronRight, UserPlus, Sparkles, Calendar, Clock } from 'lucide-react';

import { api } from '@/lib/api';

const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';
const glassCardCompact = 'rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02]';
const inputStyle = 'rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 font-ui outline-none focus:border-[#8FD3D1]/40 focus:bg-white/[0.05] transition-all';
const btnPrimary = 'rounded-[16px] bg-[#8FD3D1] text-black font-semibold text-sm font-ui hover:bg-[#8FD3D1]/90 transition-all';
const btnOutline = 'rounded-[16px] border border-[rgba(255,255,255,0.12)] text-white/70 font-ui text-sm hover:bg-white/[0.05] hover:text-white transition-all';

export default function DiscoveryPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [lastAppointmentId, setLastAppointmentId] = useState<string>();

  const doctorsQuery = useQuery({
    queryKey: ['discovery', query, specialty],
    queryFn: () => api.searchDoctors(query || undefined, specialty || undefined),
  });

  const bookMutation = useMutation({
    mutationFn: (doctorProfileId: string) =>
      api.createAppointment({
        doctorProfileId,
        consultationMode: 'VIDEO',
        reason: 'Follow-up consultation requested from discovery',
        slotStartAt: new Date(Date.now() + 24 * 60 * 60_000).toISOString(),
      }) as Promise<{ id: string }>,
    onSuccess: async (appointment: { id: string }) => {
      setLastAppointmentId(appointment.id);
      await queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const sessionMutation = useMutation({
    mutationFn: (appointmentId: string) => api.createTelemedicineSession(appointmentId),
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0D10' }}>
      <div className="mx-auto" style={{ maxWidth: 1600 }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,0.06)]">
          <div>
            <h1 className="text-xl font-bold text-white font-display">Discovery</h1>
            <p className="text-sm text-white/40 font-ui mt-0.5">Find specialists and book telemedicine consultations</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Search Section */}
          <div className={glassCard}>
            <div className="p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/40 font-ui tracking-wider uppercase">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <input
                      className={inputStyle + ' w-full pl-10'}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search symptoms or doctor..."
                      value={query}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/40 font-ui tracking-wider uppercase">Specialty</label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <input
                      className={inputStyle + ' w-full pl-10'}
                      onChange={(e) => setSpecialty(e.target.value)}
                      placeholder="e.g. Cardiology, Dermatology..."
                      value={specialty}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Doctors List */}
          {doctorsQuery.isLoading ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-44 rounded-[24px] bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : doctorsQuery.data?.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {doctorsQuery.data.map((doctor: any, i: number) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={glassCard}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#8FD3D1]/10">
                          <Stethoscope className="h-6 w-6 text-[#8FD3D1]" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-white font-display">{doctor.name}</h3>
                          <p className="text-sm text-white/50 font-ui">{doctor.specialization}</p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1.5 rounded-[10px] bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20 px-2.5 py-1 text-[10px] font-medium font-ui">
                        <Video className="h-3 w-3" />
                        {doctor.telemedicineAvailable ? 'Video' : 'Clinic'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/40 font-ui mb-4">
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-[#FFD84D]" />
                        {doctor.rating.toFixed(1)}
                      </span>
                      <span>₹{doctor.consultationFee} consultation</span>
                    </div>
                    <button
                      className={btnPrimary + ' w-full py-2.5'}
                      onClick={() => bookMutation.mutate(doctor.id)}
                      type="button"
                      disabled={bookMutation.isPending && bookMutation.variables === doctor.id}
                    >
                      {bookMutation.isPending && bookMutation.variables === doctor.id ? 'Booking...' : 'Book Video Consult'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className={glassCard}>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-white/[0.04] mb-4">
                  <Search className="h-8 w-8 text-white/20" />
                </div>
                <h3 className="text-base font-semibold text-white/60 font-display mb-1">Search for doctors</h3>
                <p className="text-sm text-white/30 font-ui max-w-sm">Enter a specialty or symptom to find available specialists.</p>
              </div>
            </div>
          )}

          {/* Appointment Confirmation */}
          {lastAppointmentId && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={glassCard + ' border-[#8FD3D1]/20'}
            >
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#2EE59D]/10">
                    <Calendar className="h-5 w-5 text-[#2EE59D]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white font-display">Appointment Booked</h3>
                    <p className="text-xs text-white/40 font-ui mt-1">ID: {lastAppointmentId}</p>
                    {!sessionMutation.data && (
                      <button
                        className="mt-3 rounded-[12px] bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20 px-4 py-2 text-xs font-medium font-ui hover:bg-[#8FD3D1]/20 transition-all"
                        onClick={() => sessionMutation.mutate(lastAppointmentId)}
                        type="button"
                        disabled={sessionMutation.isPending}
                      >
                        {sessionMutation.isPending ? 'Creating room...' : 'Start Telemedicine Session'}
                      </button>
                    )}
                    {sessionMutation.data && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-xs text-[#2EE59D] font-ui">
                        Secure room created: {sessionMutation.data.session.livekitRoomName}
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
