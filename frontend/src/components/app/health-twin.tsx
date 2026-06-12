/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/app/health-twin.tsx
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
 * React component: health-twin
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

import { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface HealthTwinProps {
  score?: number;
  size?: number;
  active?: boolean;
  className?: string;
}

export function HealthTwin({ score = 75, size = 80, active = true, className = '' }: HealthTwinProps) {
  const controls = useAnimation();
  const hue = score >= 80 ? 140 : score >= 60 ? 210 : score >= 40 ? 35 : 0;

  useEffect(() => {
    if (active) {
      controls.start({
        scale: [1, 1.03, 0.97, 1],
        transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
      });
    }
  }, [active, controls]);

  return (
    <motion.div
      layoutId="health-twin"
      animate={controls}
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full opacity-30 blur-2xl"
        style={{
          background: `radial-gradient(circle, hsla(${hue}, 80%, 60%, 0.4) 0%, transparent 70%)`,
        }}
      />
      {/* Fluid blob shape */}
      <svg viewBox="0 0 100 100" className="w-full h-full" style={{ filter: `drop-shadow(0 0 20px hsla(${hue}, 80%, 60%, 0.3))` }}>
        <defs>
          <linearGradient id={`twin-grad-${hue}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={`hsla(${hue}, 80%, 65%, 0.9)`} />
            <stop offset="100%" stopColor={`hsla(${hue + 30}, 70%, 55%, 0.7)`} />
          </linearGradient>
        </defs>
        <motion.path
          d="M50 5C65 5 78 15 85 28C92 41 90 58 82 70C74 82 60 95 45 93C30 91 18 80 12 66C6 52 8 35 18 23C28 11 35 5 50 5Z"
          fill={`url(#twin-grad-${hue})`}
          animate={{
            d: [
              'M50 5C65 5 78 15 85 28C92 41 90 58 82 70C74 82 60 95 45 93C30 91 18 80 12 66C6 52 8 35 18 23C28 11 35 5 50 5Z',
              'M48 8C63 6 75 18 82 32C89 46 86 62 78 74C70 86 56 96 42 92C28 88 16 78 11 64C6 50 8 32 19 20C30 8 33 10 48 8Z',
              'M52 3C67 7 80 16 86 30C92 44 88 60 79 72C70 84 58 93 44 91C30 89 17 78 10 64C3 50 6 33 17 22C28 11 37 -1 52 3Z',
              'M50 5C65 5 78 15 85 28C92 41 90 58 82 70C74 82 60 95 45 93C30 91 18 80 12 66C6 52 8 35 18 23C28 11 35 5 50 5Z',
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Inner core */}
        <motion.circle
          cx="48" cy="48" r="12"
          fill="white"
          opacity={0.25}
          animate={{ scale: [1, 1.1, 0.95, 1], opacity: [0.25, 0.35, 0.2, 0.25] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
      {/* Energy rings */}
      <motion.div
        className="absolute inset-0 rounded-full border"
        style={{ borderColor: `hsla(${hue}, 80%, 60%, 0.15)` }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border"
        style={{ borderColor: `hsla(${hue}, 80%, 60%, 0.1)` }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
    </motion.div>
  );
}
