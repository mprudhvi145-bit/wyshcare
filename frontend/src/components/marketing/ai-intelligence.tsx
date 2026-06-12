/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/marketing/ai-intelligence.tsx
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
 * React component: ai-intelligence
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
  Activity,
  Bot,
  BrainCircuit,
  FileText,
  Sparkles,
  Stethoscope,
  TestTube,
} from 'lucide-react';

const FEATURES = [
  {
    icon: FileText,
    label: 'Health Summaries',
    description: 'One-paragraph AI summary of your complete health history — ready for any doctor visit.',
    accent: '#A8E6CF',
  },
  {
    icon: Activity,
    label: 'Risk Prediction',
    description: 'ML models analyze your timeline to predict diabetes, cardiovascular, and metabolic risks.',
    accent: '#FFB4A2',
  },
  {
    icon: TestTube,
    label: 'Lab Interpretation',
    description: 'Upload any lab report — AI explains results, flags anomalies, and suggests follow-up questions.',
    accent: '#B4A0FF',
  },
  {
    icon: Stethoscope,
    label: 'Symptom Triage',
    description: 'Describe your symptoms to get AI-driven triage guidance and recommended care pathways.',
    accent: '#F0E68C',
  },
  {
    icon: BrainCircuit,
    label: 'Medication Analysis',
    description: 'AI checks interactions, side effects, and adherence patterns across all your medications.',
    accent: '#8FD3D1',
  },
  {
    icon: Bot,
    label: '24/7 Health Agent',
    description: 'Your personal AI health agent — always on, always learning, always advocating for you.',
    accent: '#FFD93D',
  },
];

const FEED = [
  { label: 'Processing lab report — Lipid Panel, complete', time: '2m ago' },
  { label: 'Risk update: Cardiovascular risk decreased 12%', time: '15m ago' },
  { label: 'New record linked — Apollo Hospitals, Chennai', time: '1h ago' },
  { label: 'Medication reminder: Take Lisinopril 10mg', time: '3h ago' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' as const },
  },
};

export function AiIntelligence() {
  const feedRef = useRef(null);
  const feedInView = useInView(feedRef, { once: true, margin: '-60px' });
  const cardsRef = useRef(null);
  const cardsInView = useInView(cardsRef, { once: true, margin: '-80px' });

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
          Intelligence That Understands You
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-center mb-16 text-base md:text-lg max-w-2xl mx-auto text-white/60"
        >
          Not just AI — contextual intelligence that knows your health history, your risks, and what matters to you.
        </motion.p>

        <div
          ref={cardsRef}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-12 md:mb-16"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={cardsInView ? 'visible' : 'hidden'}
            className="contents"
          >
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.label}
                  variants={cardVariants}
                  className="rounded-2xl border p-6 md:p-8"
                  style={{
                    background: '#15181D',
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-lg mb-4"
                    style={{
                      background: `${feature.accent}15`,
                      border: `1px solid ${feature.accent}20`,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: feature.accent }} />
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
          </motion.div>
        </div>

        <motion.div
          ref={feedRef}
          initial={{ opacity: 0, y: 30 }}
          animate={feedInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          className="rounded-2xl border p-8 md:p-10"
          style={{
            background: '#15181D',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-lg"
              style={{
                background: '#8FD3D115',
                border: '1px solid #8FD3D120',
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: '#8FD3D1' }} />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Live Intelligence Feed</p>
              <p className="text-xs text-white/40">Your WyshID is continuously processing</p>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <div className="space-y-2">
              {[...FEED, ...FEED].map((item, i) => (
                <motion.div
                  key={`${item.label}-${i}`}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg"
                  style={{
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        background: i % 3 === 0 ? '#8FD3D1' : i % 3 === 1 ? '#A8E6CF' : '#B4A0FF',
                      }}
                    />
                    <span className="text-sm text-white/60 truncate max-w-[300px] md:max-w-md">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-xs shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {item.time}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
