/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/marketing/final-cta.tsx
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
 * React component: final-cta
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
 - frontend/src/components/marketing/health-twin-demo.tsx
 *
 * Calls:
 - button
 - lucide-react
 - link
 - framer-motion
 *
 * Dependencies:
 - button
 - lucide-react
 - link
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

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Heart } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function FinalCTA() {
  return (
    <section
      className="relative min-h-[60vh] flex items-center justify-center overflow-hidden"
      style={{ background: '#0B0D10' }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vh] h-[80vh] rounded-full opacity-[0.04]"
          style={{
            background:
              'radial-gradient(circle, #8FD3D1 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(143,211,209,0.3), transparent)',
          }}
        />
      </div>

      <motion.div
        className="relative z-10 max-w-3xl mx-auto px-6 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.div
          className="flex items-center justify-center mb-8"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 16,
            delay: 0.2,
          }}
        >
          <div
            className="flex items-center justify-center w-16 h-16 rounded-2xl"
            style={{
              background: '#8FD3D115',
              border: '1px solid #8FD3D120',
            }}
          >
            <Heart
              className="w-8 h-8"
              style={{
                color: '#8FD3D1',
                fill: '#8FD3D1',
                opacity: 0.4,
              }}
            />
          </div>
        </motion.div>

        <motion.h2
          className="text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
        >
          Your Health, Reimagined.
          <br />
          <span style={{ color: '#8FD3D1' }}>Start Today.</span>
        </motion.h2>

        <motion.p
          className="text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto"
          style={{ color: 'rgba(255,255,255,0.55)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          Join thousands of Indians who have taken control of their health with WyshID. It takes 2 minutes to claim your identity.
        </motion.p>

        <motion.div
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.55, ease: 'easeOut' }}
        >
          <Link href="/signup">
            <Button
              variant="primary"
              size="lg"
              className="bg-[#8FD3D1] text-[#0B0D10] hover:bg-[#7BC0BE] text-base px-8 py-6"
            >
              Get Your WyshID Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/enterprise">
            <Button
              variant="ghost"
              size="lg"
              className="border border-white/10 text-white hover:bg-white/5 text-base px-8 py-6"
            >
              Enterprise Demo
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
