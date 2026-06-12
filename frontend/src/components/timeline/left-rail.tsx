/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/timeline/left-rail.tsx
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
 * React component: left-rail
 *
 * Responsibilities:
 * - Render UI components for Frontend
 * - Handle user interactions and state management
 *
 * Used By:
 - frontend/src/app/doctor/emr/dermatology/page.tsx
 - frontend/src/components/dashboard/family-alerts-widget.tsx
 - frontend/src/features/general-medicine/components/clinical-snapshot.tsx
 - frontend/src/components/ui/glass-card.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 - frontend/src/components/ui/progress.tsx
 *
 * Calls:
 - utils
 *
 * Dependencies:
 - utils
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

import { cn } from '@/lib/utils';

interface LeftRailProps {
  selectedYear: number | null;
  onYearSelect: (year: number | null) => void;
  viewMode: 'timeline' | 'life';
  onViewModeChange: (mode: 'timeline' | 'life') => void;
  availableYears: number[];
}

const lifeStages = [
  { key: 'childhood', label: 'Childhood', range: '0–12' },
  { key: 'teen', label: 'Teen', range: '13–19' },
  { key: 'adult', label: 'Adult', range: '20–40' },
  { key: 'present', label: 'Present', range: '40+' },
];

export function LeftRail({
  selectedYear,
  onYearSelect,
  viewMode,
  onViewModeChange,
  availableYears,
}: LeftRailProps) {
  return (
    <div className="w-[120px] shrink-0 flex flex-col items-center pt-6 select-none">
      <div className="flex items-center gap-1 mb-8 p-1 rounded-lg bg-shell-secondary/50">
        <button
          onClick={() => onViewModeChange('timeline')}
          className={cn(
            'px-2.5 py-1.5 rounded-md text-[10px] font-medium font-ui transition-all',
            viewMode === 'timeline'
              ? 'bg-shell-tertiary text-[#8FD3D1] shadow-sm'
              : 'text-text-on-dark-tertiary hover:text-text-on-dark-secondary',
          )}
        >
          Years
        </button>
        <button
          onClick={() => onViewModeChange('life')}
          className={cn(
            'px-2.5 py-1.5 rounded-md text-[10px] font-medium font-ui transition-all',
            viewMode === 'life'
              ? 'bg-shell-tertiary text-[#8FD3D1] shadow-sm'
              : 'text-text-on-dark-tertiary hover:text-text-on-dark-secondary',
          )}
        >
          Life
        </button>
      </div>

      <div className="flex flex-col items-center gap-1 w-full px-2">
        {viewMode === 'timeline'
          ? availableYears.map((year) => (
              <button
                key={year}
                onClick={() => onYearSelect(selectedYear === year ? null : year)}
                className={cn(
                  'w-full py-2 rounded-lg text-xs font-medium font-ui transition-all',
                  selectedYear === year
                    ? 'text-[#8FD3D1] bg-[#8FD3D1]/10 border-l-2 border-[#8FD3D1]'
                    : 'text-text-on-dark-tertiary hover:text-text-on-dark-secondary hover:bg-white/[0.04] border-l-2 border-transparent',
                )}
              >
                {year}
              </button>
            ))
          : lifeStages.map((stage) => (
              <button
                key={stage.key}
                onClick={() => onYearSelect(null)}
                className={cn(
                  'w-full py-2 rounded-lg text-xs font-medium font-ui transition-all text-center',
                  'text-text-on-dark-tertiary hover:text-text-on-dark-secondary hover:bg-white/[0.04] border-l-2 border-transparent',
                )}
              >
                <div className="text-[10px] leading-tight">{stage.label}</div>
                <div className="text-[8px] text-text-on-dark-tertiary/60">{stage.range}</div>
              </button>
            ))}
      </div>
    </div>
  );
}
