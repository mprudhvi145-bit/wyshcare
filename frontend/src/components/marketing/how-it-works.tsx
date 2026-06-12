/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/marketing/how-it-works.tsx
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
 * React component: how-it-works
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

const STEPS = [
  {
    number: '01',
    title: 'Connect',
    description: 'Link every piece of your health data into one unified place.',
    items: ['ABHA', 'Reports', 'Hospitals', 'Devices', 'Doctors'],
  },
  {
    number: '02',
    title: 'Understand',
    description: 'AI analyzes your complete health picture in real time.',
    items: ['Records', 'Labs', 'Medications', 'Risks', 'Lifestyle'],
  },
  {
    number: '03',
    title: 'Act',
    description: 'Take informed action to improve your health outcomes.',
    items: ['Book care', 'Prevent disease', 'Share records', 'Track family', 'Improve outcomes'],
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

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
          Your Health, Unified in Three Steps
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-16 text-base md:text-lg max-w-xl mx-auto text-white/60"
        >
          From scattered data to actionable insights — here&apos;s how WyshID works.
        </motion.p>
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-6 md:gap-8"
        >
          {STEPS.map((step) => (
            <motion.div
              key={step.number}
              variants={cardVariants}
              className="relative rounded-2xl border p-8 md:p-10 overflow-hidden"
              style={{
                background: '#15181D',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <div
                className="absolute -top-3 -right-3 md:-top-4 md:-right-4 text-[120px] md:text-[160px] font-bold leading-none pointer-events-none select-none"
                style={{ color: 'rgba(255,255,255,0.04)' }}
              >
                {step.number}
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3 relative z-10">
                {step.title}
              </h3>
              <p className="text-sm md:text-base relative z-10 mb-6 text-white/60">
                {step.description}
              </p>
              <ul className="space-y-3 relative z-10">
                {step.items.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -16 }}
                    animate={
                      isInView
                        ? { opacity: 1, x: 0 }
                        : { opacity: 0, x: -16 }
                    }
                    transition={{
                      delay: 0.4 + i * 0.05,
                      duration: 0.4,
                      ease: 'easeOut',
                    }}
                    className="flex items-center gap-3 text-sm md:text-base"
                    style={{ color: 'rgba(255,255,255,0.75)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#8FD3D1]" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
