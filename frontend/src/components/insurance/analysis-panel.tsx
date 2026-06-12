/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/insurance/analysis-panel.tsx
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
 * React component: analysis-panel
 *
 * Responsibilities:
 * - Render UI components for Frontend
 * - Handle user interactions and state management
 *
 * Used By:
 - frontend/src/app/doctor/emr/dermatology/page.tsx
 - frontend/src/components/ui/glass-card.tsx
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 - frontend/src/components/ui/progress.tsx
 *
 * Calls:
 - utils
 - card
 - lucide-react
 - progress
 *
 * Dependencies:
 - utils
 - card
 - lucide-react
 - progress
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

import { AlertTriangle, AlertCircle, Lightbulb, Gauge } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { ClaimAnalysis } from '@/types';

interface AnalysisPanelProps {
  analysis: ClaimAnalysis;
  className?: string;
}

const riskColors: Record<string, string> = {
  HIGH: 'text-red-500',
  MEDIUM: 'text-amber-500',
  LOW: 'text-emerald-500',
};

const riskBg: Record<string, string> = {
  HIGH: 'bg-red-50 border-red-200',
  MEDIUM: 'bg-amber-50 border-amber-200',
  LOW: 'bg-emerald-50 border-emerald-200',
};

function AnalysisPanel({ analysis, className }: AnalysisPanelProps) {
  return (
    <Card className={cn('space-y-5', className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900">Claim Analysis</h4>
        <div
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
            riskBg[analysis.risk],
            riskColors[analysis.risk],
          )}
        >
          <Gauge className="h-3.5 w-3.5" />
          {analysis.risk} Risk
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Completeness</span>
          <span className="font-medium text-slate-900">{analysis.completeness}%</span>
        </div>
        <Progress value={analysis.completeness} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {analysis.issues.length > 0 && (
          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              Issues
            </p>
            <ul className="space-y-1">
              {analysis.issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                  <span className="mt-0.5 block h-1 w-1 shrink-0 rounded-full bg-red-400" />
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.warnings.length > 0 && (
          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
              <AlertTriangle className="h-3.5 w-3.5" />
              Warnings
            </p>
            <ul className="space-y-1">
              {analysis.warnings.map((warning, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                  <span className="mt-0.5 block h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {analysis.recommendations.length > 0 && (
        <div className="space-y-1.5 rounded-xl bg-cyan-50 p-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-cyan-700">
            <Lightbulb className="h-3.5 w-3.5" />
            Recommendations
          </p>
          <ul className="space-y-1">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                <span className="mt-0.5 block h-1 w-1 shrink-0 rounded-full bg-cyan-400" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

export { AnalysisPanel };
