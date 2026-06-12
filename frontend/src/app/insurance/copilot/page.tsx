/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/insurance/copilot/page.tsx
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
 * React component: page
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
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 - frontend/src/components/ui/progress.tsx
 *
 * Calls:
 - tabs
 - analysis-panel
 - card
 - empty-state
 - react
 - badge
 - utils
 - skeleton
 *
 * Dependencies:
 - tabs
 - analysis-panel
 - card
 - empty-state
 - react
 - badge
 - utils
 - skeleton
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

import { useState, useEffect } from 'react';
import {
  Bot, Search, Gauge, AlertTriangle, Lightbulb,
  FileText, Activity, Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/ui/empty-state';
import { AnalysisPanel } from '@/components/insurance/analysis-panel';
import type { ClaimAnalysis, DenialRisk } from '@/types';

const MOCK_ANALYSIS: ClaimAnalysis = {
  completeness: 85,
  risk: 'MEDIUM',
  issues: ['Missing discharge summary', 'Procedure code does not match diagnosis'],
  warnings: ['Policy has a 30-day waiting period for this procedure', 'Claim amount is near the sub-limit'],
  recommendations: ['Upload the discharge summary to improve completeness', 'Verify procedure code matches the diagnosis', 'Consider reducing claim amount to stay within sub-limits'],
};

const MOCK_DENIAL_RISK: DenialRisk = {
  denialRisk: 'MEDIUM',
  riskScore: 62,
  factors: [
    { factor: 'Documentation completeness', score: 75 },
    { factor: 'Policy coverage match', score: 55 },
    { factor: 'Pre-auth requirement', score: 80 },
    { factor: 'Claim amount reasonableness', score: 45 },
    { factor: 'Historical claim pattern', score: 60 },
  ],
  recommendation: 'The claim has a moderate denial risk. Improve documentation and verify that the procedure is covered under the policy terms. Consider reviewing the pre-authorization requirements before proceeding.',
};

const MOCK_HISTORY = [
  { id: '1', claimNumber: 'CLM-2026-0184', analyzedAt: new Date(Date.now() - 3600000).toISOString(), risk: 'LOW' as const },
  { id: '2', claimNumber: 'CLM-2026-0182', analyzedAt: new Date(Date.now() - 7200000).toISOString(), risk: 'HIGH' as const },
  { id: '3', claimNumber: 'CLM-2026-0179', analyzedAt: new Date(Date.now() - 86400000).toISOString(), risk: 'MEDIUM' as const },
];

const riskColors: Record<string, string> = { HIGH: 'text-red-500', MEDIUM: 'text-amber-500', LOW: 'text-emerald-500' };
const riskBg: Record<string, string> = { HIGH: 'bg-red-500/10 border-red-500/30', MEDIUM: 'bg-amber-500/10 border-amber-500/30', LOW: 'bg-emerald-500/10 border-emerald-500/30' };

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function CopilotPage() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ClaimAnalysis | null>(null);
  const [denialRisk, setDenialRisk] = useState<DenialRisk | null>(null);
  const [activeTab, setActiveTab] = useState('analysis');
  const [history] = useState(MOCK_HISTORY);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  const runAnalysis = () => {
    if (!searchQuery.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalysis(MOCK_ANALYSIS);
      setDenialRisk(MOCK_DENIAL_RISK);
      setAnalyzing(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="bg-white/5 h-9 w-72" />
        <Skeleton className="bg-white/5 h-12 w-full" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="bg-white/5 h-96" />
          <Skeleton className="bg-white/5 h-96" />
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
      <motion.div variants={item}>
        <PageHeader title="AI Claims Copilot" description="Analyze claims, predict denial risks, and get recommendations">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1"><Activity className="h-3 w-3" />AI Powered</Badge>
          </div>
        </PageHeader>
      </motion.div>

      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter claim number or ID to analyze..."
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#1C2025] pl-11 pr-4 text-sm text-white/90 outline-none transition placeholder:text-white/40 focus:border-[#8FD3D1] focus:ring-2 focus:ring-[#8FD3D1]/20"
                  onKeyDown={(e) => e.key === 'Enter' && runAnalysis()}
                />
              </div>
              <Button onClick={runAnalysis} loading={analyzing} className="shrink-0">
                <Bot className="h-4 w-4" />Run Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {(analysis || denialRisk) && (
        <motion.div variants={item}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="analysis" className="gap-2"><FileText className="h-4 w-4" />Claim Analysis</TabsTrigger>
              <TabsTrigger value="denial" className="gap-2"><AlertTriangle className="h-4 w-4" />Denial Risk</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="mt-4">
              {analysis && <AnalysisPanel analysis={analysis} />}
            </TabsContent>

            <TabsContent value="denial" className="mt-4">
              {denialRisk && (
                <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
                  <CardContent className="space-y-6 pt-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white/90">Denial Risk Assessment</h4>
                      <div className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium', riskBg[denialRisk.denialRisk], riskColors[denialRisk.denialRisk])}>
                        <Gauge className="h-3.5 w-3.5" />
                        {denialRisk.denialRisk} Risk
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Risk Score</span>
                        <span className="font-bold text-white/90 text-lg">{denialRisk.riskScore}/100</span>
                      </div>
                      <Progress value={denialRisk.riskScore} className={cn('h-3', denialRisk.riskScore > 70 ? '[&>div]:bg-red-500' : denialRisk.riskScore > 40 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500')} />
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-medium text-white/50 uppercase tracking-wider">Factor Breakdown</p>
                      {denialRisk.factors.map((factor) => (
                        <div key={factor.factor}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-white/60">{factor.factor}</span>
                            <span className={cn('font-medium', factor.score > 70 ? 'text-emerald-400' : factor.score > 40 ? 'text-amber-400' : 'text-red-400')}>{factor.score}%</span>
                          </div>
                          <Progress value={factor.score} className={cn('h-2', factor.score > 70 ? '[&>div]:bg-emerald-500' : factor.score > 40 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500')} />
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl bg-[#8FD3D1]/10 p-4">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-[#8FD3D1] mb-1">
                        <Lightbulb className="h-3.5 w-3.5" />Recommendation
                      </p>
                      <p className="text-sm text-white/70">{denialRisk.recommendation}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      )}

      {!analysis && !denialRisk && (
        <motion.div variants={item}>
          <EmptyState
            icon={<Bot className="h-8 w-8" />}
            title="Enter a claim number to analyze"
            description="The AI copilot will analyze the claim for completeness, issues, and denial risk"
          />
        </motion.div>
      )}

      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-white/90"><Clock className="h-4 w-4 text-[#8FD3D1]" />Recent Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <EmptyState title="No analyses yet" description="Your claim analysis history will appear here" />
            ) : (
              <div className="divide-y divide-white/5">
                {history.map((h) => (
                  <div key={h.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/10 text-[#8FD3D1]">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/90">{h.claimNumber}</p>
                        <p className="text-xs text-white/40">{new Date(h.analyzedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <Badge variant="outline" size="sm" className={cn(riskBg[h.risk], riskColors[h.risk])}>{h.risk} Risk</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
