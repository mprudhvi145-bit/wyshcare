/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/marketing/future-section.tsx
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
 * React component: future-section
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
import { ArrowRight, Heart, Shield, Sparkles, UserCheck } from 'lucide-react';

const FUTURE_ITEMS = [
  {
    icon: Sparkles,
    title: 'AI That Knows You',
    description: 'Your AI agent learns your patterns, predicts your risks, and guides your decisions across every aspect of your health.',
  },
  {
    icon: Shield,
    title: 'Universal Health Identity',
    description: 'Your WyshID works everywhere — government programs, private insurance, corporate wellness, and every hospital in India.',
  },
  {
    icon: Heart,
    title: 'Preventive Intelligence',
    description: 'Stop waiting for symptoms. Your health twin alerts you about risks months before they become problems.',
  },
  {
    icon: UserCheck,
    title: 'Healthcare Without Friction',
    description: 'No more forms. No more repeating your history. No more lost records. Healthcare that finally works the way it should.',
  },
];

export function FutureSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-24 md:py-32 overflow-hidden bg-[#0B0D10]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 800px 400px at 50% 50%, rgba(143,211,209,0.06) 0%, transparent 100%)',
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto lg:px-8 px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-6"
        >
          The Future of Your Health
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-center mb-16 text-base md:text-lg max-w-2xl mx-auto text-white/60"
        >
          Healthcare is being rebuilt from the ground up. WyshCare is the foundation — one identity, one intelligence, one experience that puts you at the center.
        </motion.p>

        <div ref={ref}           className="grid sm:grid-cols-2 gap-6 md:gap-8">
          {FUTURE_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 + i * 0.1 }}
                className="rounded-2xl border p-8 md:p-10 flex flex-col"
                style={{
                  background: '#15181D',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <div
                  className="flex items-center justify-center w-11 h-11 rounded-xl mb-5"
                  style={{
                    background: '#8FD3D115',
                    border: '1px solid #8FD3D120',
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: '#8FD3D1' }} />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed flex-1 text-white/60">
                  {item.description}
                </p>
                <div
                  className="flex items-center gap-2 mt-5 pt-5 text-sm"
                  style={{
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    color: '#8FD3D1',
                  }}
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
