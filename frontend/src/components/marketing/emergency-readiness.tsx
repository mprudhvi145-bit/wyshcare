/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/marketing/emergency-readiness.tsx
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
 * React component: emergency-readiness
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
 - lucide-react
 - react
 - framer-motion
 *
 * Dependencies:
 - lucide-react
 - react
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

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { AlertTriangle, HeartPulse, QrCode } from 'lucide-react';

const LOADING_BARS = [
  { label: 'Allergies', width: '78%' },
  { label: 'Blood Type', width: '92%' },
  { label: 'Emergency Contact', width: '100%' },
  { label: 'Current Medications', width: '65%' },
  { label: 'Past Surgeries', width: '82%' },
  { label: 'Insurance Details', width: '71%' },
];

const SCENARIOS = [
  { label: 'Fall Detection', active: true },
  { label: 'Cardiac Event', active: false },
  { label: 'Road Accident', active: false },
];

export function EmergencyReadiness() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-24 md:py-32 overflow-hidden bg-[#0B0D10]">
      <div className="max-w-7xl mx-auto lg:px-8 px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-4"
        >
          Emergency Ready. Always.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-center mb-16 text-base md:text-lg max-w-xl mx-auto text-white/60"
        >
          Your complete health profile, available instantly in any emergency. No phone unlock needed.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8" ref={ref}>
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            className="rounded-2xl border p-6 md:p-8"
            style={{
              background: '#15181D',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-lg"
                style={{
                  background: 'rgba(255,180,162,0.15)',
                  border: '1px solid rgba(255,180,162,0.2)',
                }}
              >
                <QrCode className="w-5 h-5" style={{ color: '#FFB4A2' }} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">QR Emergency Profile</p>
                <p className="text-xs text-white/40">Available on Lock Screen</p>
              </div>
            </div>

            <div className="relative mx-auto w-44 h-44 md:w-52 md:h-52">
              <svg viewBox="0 0 208 208" className="w-full h-full">
                <defs>
                  <linearGradient id="qrGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#8FD3D1" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#8FD3D1" stopOpacity="0.15" />
                  </linearGradient>
                </defs>

                <rect x="40" y="40" width="128" height="128" rx="8" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

                <rect x="56" y="56" width="14" height="14" rx="2" fill="#8FD3D1" opacity="0.8" />
                <rect x="80" y="56" width="14" height="14" rx="2" fill="rgba(255,255,255,0.3)" />
                <rect x="104" y="56" width="14" height="14" rx="2" fill="#8FD3D1" opacity="0.9" />
                <rect x="56" y="80" width="14" height="14" rx="2" fill="rgba(255,255,255,0.2)" />
                <rect x="80" y="80" width="14" height="14" rx="2" fill="#8FD3D1" opacity="0.6" />
                <rect x="56" y="104" width="14" height="14" rx="2" fill="rgba(255,255,255,0.3)" />
                <rect x="104" y="104" width="14" height="14" rx="2" fill="rgba(255,255,255,0.25)" />
                <rect x="80" y="128" width="14" height="14" rx="2" fill="#8FD3D1" opacity="0.7" />
                <rect x="128" y="56" width="14" height="14" rx="2" fill="rgba(255,255,255,0.15)" />
                <rect x="128" y="80" width="14" height="14" rx="2" fill="rgba(255,255,255,0.2)" />
                <rect x="128" y="128" width="14" height="14" rx="2" fill="#8FD3D1" opacity="0.5" />
                <rect x="104" y="80" width="14" height="14" rx="2" fill="rgba(255,255,255,0.35)" />
                <rect x="56" y="128" width="14" height="14" rx="2" fill="#8FD3D1" opacity="0.4" />

                <motion.rect
                  x="40" y="40" width="128" height="128" rx="8"
                  fill="none" stroke="#8FD3D1" strokeWidth="1.5" strokeDasharray="4 8"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: -100 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                />

                <motion.g
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.6, duration: 0.5, ease: 'easeOut' }}
                >
                  <circle cx="104" cy="168" r="14" fill="#8FD3D1" opacity="0.12" />
                  <circle cx="104" cy="168" r="6" fill="#8FD3D1" opacity="0.4" />
                  <rect x="101" y="164" width="6" height="8" rx="1" fill="#0B0D10" />
                </motion.g>
              </svg>
            </div>

            <p className="text-sm text-center mt-4 text-white/50">
              Scan to view emergency profile
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
            className="rounded-2xl border p-8 md:p-10"
            style={{
              background: '#15181D',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-lg"
                style={{
                  background: '#FFB4A215',
                  border: '1px solid #FFB4A220',
                }}
              >
                <AlertTriangle className="w-5 h-5" style={{ color: '#FFB4A2' }} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Emergency Timeline</p>
                <p className="text-xs text-white/40">Real-time response readiness</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              {SCENARIOS.map((s) => (
                <button
                  key={s.label}
                  className="px-3 py-1.5 text-xs rounded-full border transition-colors"
                  style={{
                    background: s.active
                      ? 'rgba(255,180,162,0.15)'
                      : 'rgba(255,255,255,0.05)',
                    borderColor: s.active
                      ? 'rgba(255,180,162,0.3)'
                      : 'rgba(255,255,255,0.06)',
                    color: s.active ? '#FFB4A2' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {LOADING_BARS.map((bar, i) => (
                <motion.div
                  key={bar.label}
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.6 + i * 0.08, duration: 0.3 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-xs w-28 shrink-0 text-white/50">{bar.label}</span>
                  <div
                    className="flex-1 h-2 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={isInView ? { width: bar.width } : {}}
                      transition={{
                        delay: 0.8 + i * 0.1,
                        duration: 0.8,
                        ease: 'easeOut',
                      }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, #8FD3D1, ${i < 2 ? '#8FD3D1' : i < 4 ? '#A8E6CF' : '#FFB4A2'})`,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.5, duration: 0.4, ease: 'easeOut' }}
              className="flex items-center gap-2 mt-6 pt-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <HeartPulse className="w-4 h-4" style={{ color: '#FFB4A2' }} />
              <span className="text-xs text-white/40">
                Emergency profile shared with hospital —{' '}
                <span className="text-[#8FD3D1]">estimated arrival ETA: 8 min</span>
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
