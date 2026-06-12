/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/marketing/social-proof.tsx
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
 * React component: social-proof
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
import { Star } from 'lucide-react';

const COUNTERS = [
  { value: 50000, suffix: '+', label: 'Active WyshID Users' },
  { value: 250, suffix: '+', label: 'Connected Hospitals' },
  { value: 120000, suffix: '+', label: 'Health Records Processed' },
  { value: 98, suffix: '%', label: 'User Satisfaction' },
];

const TESTIMONIALS = [
  {
    quote: 'I never knew I had a family history of diabetes until WyshID connected the dots. It caught it early enough for me to make changes.',
    author: 'Priya M.',
    role: 'WyshID User, Bangalore',
  },
  {
    quote: 'The emergency profile saved my father critical time during a cardiac event. The hospital had his full history before we even arrived.',
    author: 'Rahul K.',
    role: 'Family Caregiver, Mumbai',
  },
  {
    quote: 'As a doctor, I can finally see my patients\' complete picture. Not just what they remember to tell me — their real health history.',
    author: 'Dr. Ananya S.',
    role: 'Physician, Chennai',
  },
];

function Counter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          {value.toLocaleString()}
        </motion.span>
        <span style={{ color: '#8FD3D1' }}>{suffix}</span>
      </div>
      <p className="text-sm md:text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {label}
      </p>
    </div>
  );
}

export function SocialProof() {
  const testimonialRef = useRef(null);
  const testimonialsInView = useInView(testimonialRef, { once: true, margin: '-60px' });

  return (
    <section className="py-24 md:py-32 overflow-hidden bg-[#0B0D10]">
      <div className="max-w-7xl mx-auto lg:px-8 px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-24 md:mb-32">
          {COUNTERS.map((c) => (
            <Counter key={c.label} {...c} />
          ))}
        </div>

        <div ref={testimonialRef}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-16"
          >
            Trusted by Patients & Doctors
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 30 }}
                animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 + i * 0.1 }}
                className="rounded-2xl border p-8 md:p-10"
                style={{
                  background: '#15181D',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <Star
                      key={s}
                      className="w-4 h-4"
                      style={{
                        color: '#8FD3D1',
                        fill: '#8FD3D1',
                        opacity: s < 5 ? 1 : 0.3,
                      }}
                    />
                  ))}
                </div>
                <p className="text-sm md:text-base leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-medium text-white">{t.author}</p>
                  <p className="text-xs text-white/40">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
