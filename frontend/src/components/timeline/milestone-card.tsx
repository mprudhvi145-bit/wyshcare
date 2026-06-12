/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/timeline/milestone-card.tsx
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
 * React component: milestone-card
 *
 * Responsibilities:
 * - Render UI components for Frontend
 * - Handle user interactions and state management
 *
 * Used By:
 - frontend/src/app/(platform)/app/wallet/page.tsx
 - frontend/src/app/(platform)/app/consent/page.tsx
 - frontend/src/app/admin/page.tsx
 - frontend/src/components/app/notification-bell.tsx
 - frontend/src/app/admin/users/page.tsx
 - frontend/src/app/os/billing/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/os/layout.tsx
 *
 * Calls:
 - framer-motion
 - lucide-react
 - date-fns
 *
 * Dependencies:
 - framer-motion
 - lucide-react
 - date-fns
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
import { Trophy, CheckCircle, Star, Heart, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { HealthMilestone } from './types';

const easing = [0.16, 1, 0.3, 1] as const;

const MILESTONE_ICONS: Record<string, typeof Trophy> = {
  trophy: Trophy, check: CheckCircle, star: Star, heart: Heart, shield: Shield,
};

const MILESTONE_COLORS: Record<string, string> = {
  adherence: '#2EE59D',
  weight: '#007AFF',
  condition: '#8FD3D1',
  safety: '#FFD60A',
  fitness: '#BF5AF2',
};

interface MilestoneCardProps {
  milestone: HealthMilestone;
}

export function MilestoneCard({ milestone }: MilestoneCardProps) {
  const Icon = MILESTONE_ICONS[milestone.icon] ?? Trophy;
  const color = MILESTONE_COLORS[milestone.category] ?? '#8FD3D1';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: easing }}
    >
      <div
        className="rounded-2xl p-5 border relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${color}08, transparent)`,
          borderColor: `${color}20`,
        }}
      >
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10"
          style={{ background: color }}
        />
        <div className="flex items-start gap-3 relative z-10">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: `${color}15` }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-on-dark font-display">{milestone.title}</p>
            <p className="text-[11px] text-text-on-dark-secondary mt-0.5 font-ui">{milestone.description}</p>
            <p className="text-[9px] text-text-on-dark-tertiary mt-1.5 font-ui">
              Achieved {format(new Date(milestone.achievedAt), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
