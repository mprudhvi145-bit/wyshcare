/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/marketing/footer.tsx
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
 * React component: footer
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
 - link
 *
 * Dependencies:
 - lucide-react
 - link
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

import Link from 'next/link';
import { Heart } from 'lucide-react';

const FOOTER_LINKS: { label: string; items: { label: string; href: string }[] }[] = [
  {
    label: 'Products',
    items: [
      { label: 'WyshID', href: '/wysh' },
      { label: 'WyshCare App', href: '/app' },
      { label: 'WyshCare OS', href: '/os' },
      { label: 'WyshCare Clinic', href: '/clinic' },
      { label: 'WyshCare Insurance', href: '/insurance' },
    ],
  },
  {
    label: 'Resources',
    items: [
      { label: 'Documentation', href: '/docs' },
      { label: 'API Reference', href: '/api' },
      { label: 'Blog', href: '/blog' },
      { label: 'Status', href: '/status' },
    ],
  },
  {
    label: 'Company',
    items: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { label: 'ABHA', href: '/abha' },
      { label: 'HIPAA', href: '/hipaa' },
      { label: 'FHIR', href: '/fhir' },
      { label: 'GDPR', href: '/gdpr' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="py-16 md:py-20 overflow-hidden" style={{ background: '#0B0D10' }}>
      <div className="max-w-7xl mx-auto lg:px-8 px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5" style={{ color: '#8FD3D1' }} />
              <span className="text-lg font-bold text-white">WyshCare</span>
            </Link>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              India Consumer Healthcare Stack. One identity for everything that matters.
            </p>
          </div>

          {FOOTER_LINKS.map((group) => (
            <div key={group.label}>
              <h4
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                {group.label}
              </h4>
              <ul className="space-y-3">
                {group.items?.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm transition-colors duration-200 hover:text-white/80"
                      style={{ color: 'rgba(255,255,255,0.45)' }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-12 md:mt-16 pt-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
            &copy; {new Date().getFullYear()} WyshCare. India Consumer Healthcare Stack. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
