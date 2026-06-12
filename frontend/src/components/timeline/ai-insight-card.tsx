/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/timeline/ai-insight-card.tsx
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
 * React component: ai-insight-card
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
 - lucide-react
 - framer-motion
 *
 * Dependencies:
 - lucide-react
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

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const easing = [0.16, 1, 0.3, 1] as const;

interface AiInsightCardProps {
  title: string;
  details: string;
  icon?: string;
}

export function AiInsightCard({ title, details }: AiInsightCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easing }}
      className="mx-[-8px]"
    >
      <div
        className="rounded-2xl p-4 border"
        style={{
          background: 'rgba(143,211,209,0.06)',
          borderColor: 'rgba(143,211,209,0.15)',
        }}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(143,211,209,0.12)' }}>
            <Sparkles className="h-4 w-4" style={{ color: '#8FD3D1' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-semibold font-ui tracking-wider uppercase" style={{ color: '#8FD3D1' }}>AI Insight</span>
            </div>
            <p className="text-[13px] font-medium text-text-on-dark font-display leading-snug mb-0.5">{title}</p>
            <p className="text-[11px] text-text-on-dark-secondary leading-relaxed font-ui">{details}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
