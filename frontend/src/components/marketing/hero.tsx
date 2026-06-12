/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/marketing/hero.tsx
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
 * React component: hero
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
 - badge
 - button
 - lucide-react
 - link
 - framer-motion
 *
 * Dependencies:
 - badge
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
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#0B0D10]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8FD3D1] opacity-[0.06] blur-[120px]" />
        <div className="absolute right-0 top-0 h-[400px] w-[400px] translate-x-1/3 -translate-y-1/3 rounded-full bg-[#8FD3D1] opacity-[0.03] blur-[100px]" />
      </div>

      <div className="relative mx-auto flex h-screen max-w-7xl flex-col items-center gap-16 px-6 lg:flex-row lg:px-8">
        <motion.div
          className="flex flex-1 flex-col justify-center pt-28 lg:pt-0"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp}>
            <Badge
              variant="secondary"
              className="border-[#8FD3D1]/20 bg-[#8FD3D1]/10 text-[#8FD3D1]"
            >
              India Consumer Healthcare Stack
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-8 text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Your Health.
            <br />
            <span className="text-[#8FD3D1]">Understood.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg"
          >
            One identity. One timeline. One AI. One place for everything that
            matters. From emergency care to preventive intelligence, WyshCare
            transforms fragmented healthcare into a living health system.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
            <Link href="/signup">
              <Button
                variant="primary"
                size="lg"
                className="bg-[#8FD3D1] text-[#0B0D10] hover:bg-[#7BC0BE]"
              >
                Get Your WyshID
              </Button>
            </Link>
            <Link href="/demo">
              <Button
                variant="ghost"
                size="lg"
                className="border border-white/10 text-white hover:bg-white/5"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex flex-1 items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
        >
          <HealthTwinGraphic />
        </motion.div>
      </div>
    </section>
  );
}

const NODES = [
  { label: 'Health Score', x: 200, y: 75 },
  { label: 'Risk Trends', x: 315, y: 145 },
  { label: 'Timeline Events', x: 275, y: 295 },
  { label: 'Family Connections', x: 125, y: 295 },
  { label: 'AI Recommendations', x: 85, y: 145 },
];

const CX = 200;
const CY = 200;

function HealthTwinGraphic() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="h-full max-h-[480px] w-full"
      fill="none"
    >
      <defs>
        <radialGradient id="centerPulse" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8FD3D1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#8FD3D1" stopOpacity="0" />
        </radialGradient>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="nodeGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx={CX} cy={CY} r="110" fill="url(#centerPulse)">
        <animate attributeName="r" values="100;120;100" dur="4s" repeatCount="indefinite" />
      </circle>

      <circle cx={CX} cy={CY} r="133" stroke="#8FD3D1" strokeWidth="0.5" strokeOpacity="0.06" fill="none" />

      {NODES.map((n, i) => (
        <line
          key={`radial-${i}`}
          x1={CX}
          y1={CY}
          x2={n.x}
          y2={n.y}
          stroke="#8FD3D1"
          strokeWidth="1"
          strokeDasharray="4 6"
          strokeOpacity="0.2"
        >
          <animate
            attributeName="strokeDashoffset"
            values="0;-20"
            dur={`${2.5 + i * 0.3}s`}
            repeatCount="indefinite"
          />
        </line>
      ))}

      {NODES.map((n, i) => {
        const next = NODES[(i + 1) % NODES.length]!;
        return (
          <line
            key={`pentagon-${i}`}
            x1={n.x}
            y1={n.y}
            x2={next.x}
            y2={next.y}
            stroke="#8FD3D1"
            strokeWidth="0.5"
            strokeOpacity="0.08"
          />
        );
      })}

      <g filter="url(#softGlow)">
        <circle cx={CX} cy={CY} r="26" fill="#15181D" stroke="#8FD3D1" strokeWidth="1.5" strokeOpacity="0.35" />
        <circle cx={CX} cy={CY} r="14" fill="#8FD3D1" opacity="0.9" />
        <rect x="196" y="190" width="8" height="20" rx="1.5" fill="#0B0D10" />
        <rect x="190" y="196" width="20" height="8" rx="1.5" fill="#0B0D10" />
      </g>

      <circle cx={CX} cy={CY} r="34" stroke="#8FD3D1" strokeWidth="1" strokeOpacity="0.2" fill="none">
        <animate attributeName="r" values="30;42;30" dur="3s" repeatCount="indefinite" />
        <animate attributeName="strokeOpacity" values="0.2;0;0.2" dur="3s" repeatCount="indefinite" />
      </circle>

      {NODES.map((n, i) => (
        <g key={n.label} filter="url(#nodeGlow)">
          <circle
            cx={n.x}
            cy={n.y}
            r="22"
            fill="#15181D"
            stroke="#8FD3D1"
            strokeWidth="1"
            strokeOpacity="0.25"
          >
            <animate
              attributeName="r"
              values="22;25;22"
              dur={`${3 + i * 0.5}s`}
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx={n.x}
            cy={n.y}
            r="6"
            fill="#8FD3D1"
            opacity="0.7"
          >
            <animate
              attributeName="opacity"
              values="0.5;1;0.5"
              dur={`${2 + i * 0.3}s`}
              repeatCount="indefinite"
            />
          </circle>
          <text
            x={n.x}
            y={n.y + 38}
            textAnchor="middle"
            fill="white"
            fillOpacity="0.5"
            fontSize="10"
            fontFamily="system-ui, sans-serif"
            letterSpacing="0.05em"
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
