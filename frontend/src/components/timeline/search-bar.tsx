/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/timeline/search-bar.tsx
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
 * React component: search-bar
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

'use client';

import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search conditions, medicines, hospitals, doctors...' }: SearchBarProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#7E8591' }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-10 rounded-xl text-sm outline-none transition-all font-ui"
        style={{
          background: '#1A1D21',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#FFFFFF',
        }}
        onFocus={(e) => e.target.style.borderColor = 'rgba(143,211,209,0.3)'}
        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors" style={{ color: '#7E8591' }}>
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
