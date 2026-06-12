/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/insurance/coverage-summary.tsx
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
 * React component: coverage-summary
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
 - frontend/src/app/(platform)/health-twin/risk-predictions/page.tsx
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 *
 * Calls:
 - utils
 - card
 *
 * Dependencies:
 - utils
 - card
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

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface CoverageItem {
  category: string;
  coveragePercent: number;
  maxAmount?: number;
}

interface CoverageSummaryProps {
  items: CoverageItem[];
  className?: string;
}

function CoverageSummary({ items, className }: CoverageSummaryProps) {
  return (
    <Card className={cn('p-0', className)}>
      <div className="p-5 pb-0">
        <h4 className="text-sm font-semibold text-slate-900">Coverage Summary</h4>
      </div>
      <div className="h-72 p-5">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={items} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="category"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: 'white',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              }}
              formatter={(value) => [`${Number(value)}%`, 'Coverage']}
            />
            <Bar
              dataKey="coveragePercent"
              fill="#06b6d4"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export { CoverageSummary, type CoverageItem };
