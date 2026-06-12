/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/marketing/health-twin-demo.tsx
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
 * React component: health-twin-demo
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
import { useRef, useState } from 'react';
import { ArrowRight, Heart, Shield, TrendingDown, TrendingUp } from 'lucide-react';

const METRICS = [
  {
    label: 'Health Score',
    value: 82,
    icon: Heart,
    unit: '',
    change: '+6',
    positive: true,
  },
  {
    label: 'Diabetes Risk',
    value: 14,
    icon: TrendingDown,
    unit: '%',
    change: '-8%',
    positive: true,
  },
  {
    label: 'Cardio Risk',
    value: 22,
    icon: Shield,
    unit: '%',
    change: '-12%',
    positive: true,
  },
  {
    label: 'Coverage Gap',
    value: 3,
    icon: Shield,
    unit: '',
    change: '-5',
    positive: true,
  },
];

const WHATIFS = [
  'What if I start walking 15 minutes daily?',
  'What if I get a lipid profile next month?',
  'What if I switch to a plant-based diet?',
];

export function HealthTwinDemo() {
  const [activeWhatIf, setActiveWhatIf] = useState<number | null>(null);
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
          Your Living Health Twin
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-center mb-16 text-base md:text-lg max-w-2xl mx-auto text-white/60"
        >
          A dynamic simulation of your health that evolves with every new data point and predicts what&apos;s next.
        </motion.p>

        <div
          ref={ref}
          className="relative rounded-2xl border p-8 md:p-12"
          style={{
            background: '#15181D',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <div
            className="absolute -top-px left-1/3 right-1/3 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, #8FD3D1, transparent)',
              opacity: 0.3,
            }}
          />

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-lg"
                  style={{
                    background: '#8FD3D115',
                    border: '1px solid #8FD3D120',
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: '#8FD3D1',
                      boxShadow: '0 0 12px rgba(143,211,209,0.4)',
                    }}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Your WyshID Health Score</p>
                  <p className="text-xs text-white/40">Updated 2m ago</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {METRICS.map((metric, i) => {
                  const Icon = metric.icon;
                  return (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.5 + i * 0.12, duration: 0.5, ease: 'easeOut' }}
                      className="rounded-xl border p-4"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderColor: 'rgba(255,255,255,0.06)',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-3.5 h-3.5" style={{ color: '#8FD3D1' }} />
                        <span className="text-xs text-white/50">{metric.label}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">
                          {metric.value}{metric.unit}
                        </span>
                        <span
                          className="text-xs font-medium flex items-center gap-0.5"
                          style={{ color: '#8FD3D1' }}
                        >
                          <TrendingUp className="w-3 h-3" />
                          {metric.change}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-lg"
                  style={{
                    background: '#8FD3D115',
                    border: '1px solid #8FD3D120',
                  }}
                >
                  <ArrowRight
                    className="w-4 h-4"
                    style={{ color: '#8FD3D1' }}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">What If Simulations</p>
                  <p className="text-xs text-white/40">Explore health scenarios</p>
                </div>
              </div>

              <div className="space-y-3">
                {WHATIFS.map((q, i) => (
                  <motion.button
                    key={q}
                    initial={{ opacity: 0, x: -16 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.8 + i * 0.1, duration: 0.4, ease: 'easeOut' }}
                    onClick={() => setActiveWhatIf(activeWhatIf === i ? null : i)}
                    className="w-full text-left rounded-xl border p-4 transition-all duration-300"
                    style={{
                      background: activeWhatIf === i ? '#8FD3D108' : 'rgba(255,255,255,0.02)',
                      borderColor:
                        activeWhatIf === i
                          ? 'rgba(143,211,209,0.3)'
                          : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <span className="text-sm" style={{ color: activeWhatIf === i ? '#8FD3D1' : 'rgba(255,255,255,0.7)' }}>
                      {q}
                    </span>
                    {activeWhatIf === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="mt-3 pt-3"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <div className="flex items-center gap-4">
                          <span
                            className="text-xl font-bold"
                            style={{ color: '#8FD3D1' }}
                          >
                            +12%
                          </span>
                          <span className="text-xs text-white/50">
                            estimated health score improvement
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
