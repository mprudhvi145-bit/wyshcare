/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/marketing/doctor-experience.tsx
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
 * React component: doctor-experience
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
import {
  Calendar,
  ClipboardList,
  MessageSquare,
  Search,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';

const DOCTOR_FEATURES = [
  {
    icon: Stethoscope,
    label: 'Smart SOAP Notes',
    description: 'AI-generated clinical notes from conversation — saving 3+ minutes per patient.',
  },
  {
    icon: Calendar,
    label: 'Intelligent Scheduling',
    description: 'Auto-fill cancellations, smart reminders, and waitlist management that works.',
  },
  {
    icon: ClipboardList,
    label: 'Patient Timeline',
    description: 'Every consult, lab, prescription, and diagnosis in one scrollable timeline.',
  },
  {
    icon: Search,
    label: 'Unified Search',
    description: 'Search across all your patients, notes, and records in milliseconds.',
  },
  {
    icon: MessageSquare,
    label: 'Patient Portal',
    description: 'Secure messaging, digital consent forms, and follow-up automation.',
  },
  {
    icon: ShieldCheck,
    label: 'ABHA Integration',
    description: 'Native ABHA ID support — pull and push records with patient consent.',
  },
];

export function DoctorExperience() {
  const ref = useRef(null);
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
          Built for Doctors
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-center mb-16 text-base md:text-lg max-w-xl mx-auto text-white/60"
        >
          Tools that respect your time. An experience designed for the rhythm of Indian clinical practice.
        </motion.p>

        <div
          ref={ref}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
        >
          {DOCTOR_FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 + i * 0.08 }}
                className="rounded-2xl border p-6 md:p-8"
                style={{
                  background: '#15181D',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg mb-4"
                  style={{
                    background: '#A8E6CF15',
                    border: '1px solid #A8E6CF20',
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: '#A8E6CF' }} />
                </div>
                <h3 className="text-base md:text-lg font-bold text-white mb-2">
                  {feature.label}
                </h3>
                <p className="text-sm leading-relaxed text-white/60">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
