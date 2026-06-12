/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/clinic/revenue-chart.tsx
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
 * React component: revenue-chart
 *
 * Responsibilities:
 * - Render UI components for Frontend
 * - Handle user interactions and state management
 *
 * Used By:
 - frontend/src/app/insurance/claims/page.tsx
 - frontend/src/app/doctor/emr/dermatology/page.tsx
 - frontend/src/components/ui/glass-card.tsx
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 *
 * Calls:
 - utils
 - card
 - react
 *
 * Dependencies:
 - utils
 - card
 - react
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

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

type Period = 'daily' | 'weekly' | 'monthly';

interface RevenueDataPoint {
  label: string;
  revenue: number;
  consultations: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  className?: string;
}

const periods: Period[] = ['daily', 'weekly', 'monthly'];

function RevenueChart({ data, className }: RevenueChartProps) {
  const [period, setPeriod] = useState<Period>('weekly');

  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalConsultations = data.reduce((sum, d) => sum + d.consultations, 0);

  return (
    <Card className={cn('p-0', className)}>
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Revenue Overview</h4>
          <p className="text-xs text-slate-400">
            ₹{totalRevenue.toLocaleString('en-IN')} &middot; {totalConsultations} consultations
          </p>
        </div>
        <div className="flex gap-1 rounded-xl bg-slate-100 p-0.5">
          {periods.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                period === p
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="h-72 p-5">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: 'white',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              }}
              formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export { RevenueChart, type RevenueDataPoint };
