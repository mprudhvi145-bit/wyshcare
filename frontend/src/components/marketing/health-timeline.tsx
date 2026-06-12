/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/marketing/health-timeline.tsx
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
 * React component: health-timeline
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
import { Activity, Baby, Heart, Stethoscope, Syringe, TestTube } from 'lucide-react';

const EVENTS = [
  {
    year: '1998',
    title: 'Birth & Immunization Record',
    description: 'Birth record, childhood vaccination schedule, and growth milestones tracked.',
    icon: Baby,
    info: 'Birth Weight: 3.2kg | All immunizations up to date',
  },
  {
    year: '2016',
    title: 'First Major Admission',
    description: 'Emergency appendectomy at Apollo Hospitals, Chennai. Full surgical history linked.',
    icon: Stethoscope,
    info: 'Procedure: Laparoscopic Appendectomy | Length of stay: 3 days',
  },
  {
    year: '2019',
    title: 'Chronic Condition Diagnosis',
    description: 'Type 2 Diabetes diagnosed during annual health check. Management plan created.',
    icon: Activity,
    info: 'HbA1c at diagnosis: 7.8% | Current: 6.2% (controlled)',
  },
  {
    year: '2021',
    title: 'COVID-19 Record',
    description: 'Complete illness timeline, test records, and post-COVID recovery monitoring.',
    icon: TestTube,
    info: '2 vaccine doses (Covishield) | Mild symptoms | Full recovery in 14 days',
  },
  {
    year: '2023',
    title: 'Family Health Link',
    description: 'Connected family health records — now tracking hereditary risk patterns.',
    icon: Heart,
    info: 'Linked: 4 family members | Hereditary risk: Cardiovascular, Diabetes',
  },
  {
    year: '2025',
    title: 'Health Score 82',
    description: 'Comprehensive health assessment with AI-driven recommendations for improvement.',
    icon: Syringe,
    info: 'Health Score: 82/100 | Top recommendation: Increase daily step count to 8000',
  },
];

export function HealthTimeline() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-24 md:py-32 overflow-hidden bg-[#0B0D10]">
      <div className="max-w-6xl mx-auto lg:px-8 px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-4"
        >
          Your Complete Health Timeline
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-center mb-16 text-base md:text-lg max-w-xl mx-auto text-white/60"
        >
          Every event that shaped your health — from birth to today — in one living timeline.
        </motion.p>

        <div ref={ref} className="relative">
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#8FD3D1]/40 via-[#8FD3D1]/20 to-transparent" />

          <div className="space-y-12 md:space-y-16">
            {EVENTS.map((event, i) => {
              const Icon = event.icon;
              const isLeft = i % 2 === 0;

              return (
                <motion.div
                  key={event.year}
                  className={`relative flex flex-col md:flex-row items-start gap-6 ${
                    isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 + i * 0.12 }}
                >
                  <div
                    className={`flex-1 ${isLeft ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}
                  >
                    <div
                      className={`inline-block ${
                        isLeft ? 'md:text-right' : 'md:text-left'
                      }`}
                    >
                      <span className="text-xs font-mono text-[#8FD3D1]">
                        {event.year}
                      </span>
                      <h3 className="text-lg md:text-xl font-bold text-white mt-1 mb-2">
                        {event.title}
                      </h3>
                      <p className="text-sm leading-relaxed mb-3 text-white/60">
                        {event.description}
                      </p>
                      <div
                        className="px-3 py-2 rounded-lg text-xs inline-block"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          color: 'rgba(255,255,255,0.5)',
                        }}
                      >
                        {event.info}
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 flex-shrink-0 hidden md:flex items-center justify-center">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center border"
                      style={{
                        background: '#15181D',
                        borderColor: 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: '#8FD3D1' }} />
                    </div>
                  </div>

                  <div className="flex-1 hidden md:block" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
