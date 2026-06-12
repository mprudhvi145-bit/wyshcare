/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/app/mobile-nav.tsx
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
 * React component: mobile-nav
 *
 * Responsibilities:
 * - Render UI components for Frontend
 * - Handle user interactions and state management
 *
 * Used By:
 - frontend/src/app/doctor/emr/dermatology/page.tsx
 - frontend/src/components/ui/glass-card.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 - frontend/src/components/ui/progress.tsx
 - frontend/src/components/marketing/health-twin-demo.tsx
 *
 * Calls:
 - utils
 - navigation
 - lucide-react
 - link
 *
 * Dependencies:
 - utils
 - navigation
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

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Calendar, User, Grid3X3 } from 'lucide-react';

import { cn } from '@/lib/utils';

const tabs = [
  { href: '/wysh', label: 'Home', icon: Home },
  { href: '/app/discovery', label: 'Search', icon: Search },
  { href: '/app/telemedicine', label: 'Appointments', icon: Calendar },
  { href: '/app/profile', label: 'Profile', icon: User },
  { href: '/app/more', label: 'More', icon: Grid3X3 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/80 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors',
                isActive ? 'text-cyan-600' : 'text-slate-400 hover:text-slate-600',
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'text-cyan-500')} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
