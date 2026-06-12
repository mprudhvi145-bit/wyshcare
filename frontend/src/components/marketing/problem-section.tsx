/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/marketing/problem-section.tsx
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
 * React component: problem-section
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
 *
 * Dependencies:
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

const ITEMS = [
  { label: 'Different Hospitals' },
  { label: 'Different Records' },
  { label: 'Different Apps' },
  { label: 'Different Doctors' },
  { label: 'Disconnected Information' },
];

const SCATTERED = [
  { x: -520, y: -230, rotate: -12 },
  { x: 530, y: -190, rotate: 9 },
  { x: -460, y: 250, rotate: -7 },
  { x: 520, y: 230, rotate: 14 },
  { x: 30, y: -330, rotate: -5 },
];

const CONVERGED = [
  { x: 0, y: -180 },
  { x: 165, y: -55 },
  { x: 105, y: 140 },
  { x: -105, y: 140 },
  { x: -165, y: -55 },
];

export function ProblemSection() {
  const triggerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(triggerRef, { once: true, margin: '-100px' });

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-[#0B0D10]">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_40%,rgba(143,211,209,0.06),transparent_60%)]" />
      <div className="relative z-10 max-w-7xl mx-auto lg:px-8 px-6">
        <div ref={triggerRef}>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-20 tracking-tight"
          >
            Healthcare Is Broken.
          </motion.h2>
          <div className="relative h-[380px] md:h-[480px]">
            <div className="absolute inset-0 flex items-center justify-center">
              {ITEMS.map((item, i) => (
                <div
                  key={item.label}
                  className="absolute"
                  style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                >
                  <motion.div
                    initial={{
                      x: SCATTERED[i]!.x,
                      y: SCATTERED[i]!.y,
                      opacity: 0.7,
                      rotate: SCATTERED[i]!.rotate,
                    }}
                    animate={
                      isInView
                        ? {
                            x: CONVERGED[i]!.x,
                            y: CONVERGED[i]!.y,
                            opacity: 1,
                            rotate: 0,
                            transition: {
                              type: 'spring' as const,
                              stiffness: 70,
                              damping: 14,
                              delay: 0.4 + i * 0.1,
                              mass: 0.8,
                            },
                          }
                        : {
                            x: SCATTERED[i]!.x,
                            y: SCATTERED[i]!.y,
                            opacity: 0.7,
                            rotate: SCATTERED[i]!.rotate,
                          }
                    }
                  >
                    <div
                      className="whitespace-nowrap px-4 py-2.5 md:px-5 md:py-3 rounded-xl border text-sm md:text-base font-medium"
                      style={{
                        background: '#15181D',
                        borderColor: 'rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.85)',
                      }}
                    >
                      {item.label}
                    </div>
                  </motion.div>
                </div>
              ))}
              <div
                className="absolute"
                style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={
                    isInView
                      ? {
                          scale: 1,
                          opacity: 1,
                          transition: {
                            delay: 1.1,
                            duration: 0.5,
                            ease: 'easeOut',
                            type: 'spring',
                            stiffness: 200,
                            damping: 16,
                          },
                        }
                      : { scale: 0, opacity: 0 }
                  }
                >
                  <div
                    className="px-6 py-3 md:px-8 md:py-3.5 rounded-full font-bold text-base md:text-lg tracking-wide"
                    style={{
                      background: '#8FD3D1',
                      color: '#0B0D10',
                      boxShadow: '0 0 40px rgba(143, 211, 209, 0.3)',
                    }}
                  >
                    WyshID
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center mt-32 md:mt-44 max-w-5xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            One Health Identity.
            <br />
            <span className="text-[#8FD3D1]">Everywhere.</span>
          </h2>
          <p className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto text-white/60">
            WyshID is your unified health identity — one secure profile that connects
            every fragment of your healthcare journey. No more repeating yourself across
            providers. No more lost records between systems. Just one identity that works
            everywhere you do.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
