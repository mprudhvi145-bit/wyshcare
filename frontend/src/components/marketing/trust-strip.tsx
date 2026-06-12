/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/marketing/trust-strip.tsx
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
 * React component: trust-strip
 *
 * Responsibilities:
 * - Render UI components for Frontend
 * - Handle user interactions and state management
 *
 * Used By:
 - frontend/src/app/doctor/emr/dermatology/page.tsx
 - frontend/src/app/(platform)/health-twin/risk-predictions/page.tsx
 - frontend/src/components/dashboard/family-alerts-widget.tsx
 - frontend/src/features/general-medicine/components/clinical-snapshot.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 - frontend/src/components/marketing/health-twin-demo.tsx
 *
 * Calls:
 - lucide-react
 *
 * Dependencies:
 - lucide-react
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

import { CheckCircle, Shield, Lock, Cpu, Building, Activity } from 'lucide-react';

const badges = [
  { label: 'ABHA Compatible', icon: Activity },
  { label: 'HIPAA Ready', icon: Shield },
  { label: 'FHIR Native', icon: Cpu },
  { label: 'End-to-End Encrypted', icon: Lock },
  { label: 'AI Assisted', icon: CheckCircle },
  { label: 'Government Compatible', icon: Building },
];

export function TrustStrip() {
  return (
    <section className="relative w-full overflow-hidden border-t border-[rgba(255,255,255,0.08)] border-b border-[rgba(255,255,255,0.08)] bg-[#0B0D10]">
      <style>{`
        .trust-track {
          display: flex;
          align-items: center;
        }
        @media (min-width: 768px) {
          .trust-track {
            gap: 2.5rem;
            animation: trust-marquee 35s linear infinite;
            width: max-content;
            padding-left: 1.5rem;
          }
          .trust-track:hover {
            animation-play-state: paused;
          }
        }
        @media (max-width: 767px) {
          .trust-track {
            gap: 0.75rem 1.5rem;
            flex-wrap: wrap;
            justify-content: center;
            padding: 0 1.5rem;
          }
          .trust-track > :nth-child(n+7) {
            display: none;
          }
        }
        @keyframes trust-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div className="trust-track py-5">
        {[...badges, ...badges].map((badge, i) => (
          <div
            key={`${badge.label}-${i}`}
            className="flex shrink-0 items-center gap-2 text-sm text-white/40"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-[#8FD3D1]/40" />
            {badge.label}
          </div>
        ))}
      </div>
    </section>
  );
}
