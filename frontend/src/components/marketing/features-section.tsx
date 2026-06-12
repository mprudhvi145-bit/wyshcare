/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/marketing/features-section.tsx
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
 * React component: features-section
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

import { Brain, ShieldCheck, HeartPulse, Stethoscope, Pill, Microscope, Fingerprint, BarChart3, Users } from 'lucide-react';

const features = [
  {
    icon: Fingerprint,
    title: 'WyshID',
    description: 'Universal healthcare identity with emergency QR, blood group, and consent-gated profile sharing across the care network.',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Brain,
    title: 'Health Twin',
    description: 'AI-powered prevention insights, risk predictions, lifestyle tracking, and family health history aggregated into a living health model.',
    gradient: 'from-indigo-500 to-purple-600',
  },
  {
    icon: ShieldCheck,
    title: 'Consent Vault',
    description: 'Zero-trust records with manual approval, OTP access, revokable share links, immutable audit logs, and emergency break-glass.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Stethoscope,
    title: 'Telemedicine',
    description: 'Video, audio, and chat consultations with AI-assisted triage, automated SOAP notes, and follow-up scheduling.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Pill,
    title: 'Pharmacy OS',
    description: 'End-to-end e-prescription fulfilment, inventory matching, delivery coordination, and refill reminders.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: Microscope,
    title: 'Diagnostics Hub',
    description: 'Lab test booking, home collection, report uploads, AI-powered report summaries, and trend tracking.',
    gradient: 'from-rose-500 to-pink-600',
  },
  {
    icon: BarChart3,
    title: 'Insurance Core',
    description: 'Eligibility checks, pre-auth workflows, claims settlement, AI copilot, and provider-network management.',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: HeartPulse,
    title: 'ABHA/ABDM',
    description: 'India stack interoperability — ABHA linking, HPR/HFR registration, and consent-managed data flow with NHCX.',
    gradient: 'from-cyan-600 to-teal-600',
  },
  {
    icon: Users,
    title: 'Multi-Role OS',
    description: 'Unified workspace for doctors, nurses, labs, pharmacies, reception, billing, and administrators with role-based views.',
    gradient: 'from-slate-600 to-slate-800',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-[#8FD3D1] font-semibold">The Moat</p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Everything healthcare, unified
          </h2>
          <p className="mt-4 text-lg text-white/60">
            WyshCare is not a clinic dashboard. It is a trust-first healthcare identity,
            memory, and commerce operating system built for the connected care era.
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#15181D] p-6 transition-all hover:shadow-[0_0_30px_rgba(143,211,209,0.06)] hover:border-[rgba(255,255,255,0.12)]"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity group-hover:opacity-[0.04]`} />
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-md`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white/90">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
