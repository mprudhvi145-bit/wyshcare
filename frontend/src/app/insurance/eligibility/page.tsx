/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/insurance/eligibility/page.tsx
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
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 *
 * Calls:
 - status-badge
 - data-table
 - card
 - select
 - react
 - badge
 - utils
 - skeleton
 *
 * Dependencies:
 - status-badge
 - data-table
 - card
 - select
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
  CheckCircle, XCircle, IndianRupee, Search, Shield, CreditCard,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';

import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ColumnDef } from '@tanstack/react-table';
import type { EligibilityCheck, CoverageType } from '@/types';

const MOCK_POLICIES = [
  { id: 'pol1', policyNumber: 'POL-ICICI-2026-0042', provider: 'ICICI Lombard' },
  { id: 'pol2', policyNumber: 'POL-STAR-2026-0018', provider: 'Star Health' },
  { id: 'pol3', policyNumber: 'POL-GHS-2026-0005', provider: 'Govt Health Scheme' },
];

const CATEGORIES = [
  { value: 'ROOM' as CoverageType, label: 'Room Charges' },
  { value: 'CONSULTATION' as CoverageType, label: 'Consultation' },
  { value: 'MEDICATION' as CoverageType, label: 'Medication' },
  { value: 'LAB_TEST' as CoverageType, label: 'Lab Test' },
  { value: 'PROCEDURE' as CoverageType, label: 'Procedure' },
];

const MOCK_HISTORY: EligibilityCheck[] = [
  { id: 'e1', policyId: 'pol1', patientUserId: 'u1', category: 'CONSULTATION', isEligible: true, coveragePercent: 90, copayAmount: 500, deductibleRemaining: 2000, maxCoverage: 4500, checkedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'e2', policyId: 'pol1', patientUserId: 'u2', category: 'PROCEDURE', isEligible: true, coveragePercent: 75, copayAmount: 12500, deductibleRemaining: 5000, maxCoverage: 37500, checkedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'e3', policyId: 'pol2', patientUserId: 'u3', category: 'MEDICATION', isEligible: false, coveragePercent: 0, copayAmount: 0, deductibleRemaining: 5000, maxCoverage: 0, checkedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function EligibilityPage() {
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState('pol1');
  const [category, setCategory] = useState<CoverageType>('CONSULTATION');
  const [amount, setAmount] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<EligibilityCheck | null>(null);
  const [history] = useState(MOCK_HISTORY);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  const runCheck = () => {
    setChecking(true);
    setTimeout(() => {
      const amt = Number(amount) || 10000;
      const covPct = category === 'PROCEDURE' ? 75 : category === 'MEDICATION' ? 80 : 90;
      const eligible = amt <= 100000;
      setResult({
        id: 'new',
        policyId: selectedPolicy,
        patientUserId: 'u1',
        category,
        isEligible: eligible,
        coveragePercent: eligible ? covPct : 0,
        copayAmount: eligible ? Math.round(amt * (1 - covPct / 100)) : 0,
        deductibleRemaining: 2000,
        maxCoverage: eligible ? Math.round(amt * (covPct / 100)) : 0,
        checkedAt: new Date().toISOString(),
      });
      setChecking(false);
    }, 1200);
  };

  const columns: ColumnDef<EligibilityCheck>[] = [
    { accessorKey: 'policyId', header: 'Policy', cell: ({ row }) => <span className="font-medium text-white/90">#{(row.original.policyId).slice(0, 6)}</span> },
    { accessorKey: 'category', header: 'Category', cell: ({ row }) => <Badge variant="outline" size="sm">{row.original.category}</Badge> },
    { accessorKey: 'isEligible', header: 'Result', cell: ({ row }) => row.original.isEligible ? <StatusBadge status="APPROVED" size="sm" /> : <StatusBadge status="REJECTED" size="sm" /> },
    { accessorKey: 'coveragePercent', header: 'Coverage', cell: ({ row }) => <span>{row.original.coveragePercent}%</span> },
    { accessorKey: 'checkedAt', header: 'Checked At', cell: ({ row }) => <span className="text-xs text-white/50">{new Date(row.original.checkedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span> },
  ];

  if (loading) {
    return (
      <div className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
        <Skeleton className="h-9 w-72 bg-white/5" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 bg-white/5" />
          <Skeleton className="h-72 bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
      <motion.div variants={item}>
        <PageHeader title="Eligibility Engine" description="Check insurance coverage eligibility for medical services" />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-white/90"><Search className="h-4 w-4 text-[#8FD3D1]" />Check Eligibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-white/50 mb-1 block">Policy</label>
              <Select value={selectedPolicy} onValueChange={setSelectedPolicy}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MOCK_POLICIES.map((p) => <SelectItem key={p.id} value={p.id}>{p.policyNumber} - {p.provider}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-white/50 mb-1 block">Category</label>
                <Select value={category} onValueChange={(v: CoverageType) => setCategory(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-white/50 mb-1 block">Amount (₹)</label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 10000" />
              </div>
            </div>
            <Button onClick={runCheck} loading={checking} className="w-full">
              <Search className="h-4 w-4" />Run Check
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
            <CardHeader>
              <CardTitle className={cn('flex items-center gap-2 text-base text-white/90', result.isEligible ? 'text-emerald-400' : 'text-red-400')}>
                {result.isEligible ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                {result.isEligible ? 'Eligible' : 'Not Eligible'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-white/50">Coverage %</p>
                  <p className="text-xl font-bold text-white/90">{result.coveragePercent}%</p>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-white/50">Max Coverage</p>
                  <p className="text-xl font-bold text-white/90">₹{result.maxCoverage.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-amber-500/10 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-amber-400 flex items-center gap-1"><IndianRupee className="h-3 w-3" />Copay</p>
                  <p className="text-lg font-bold text-amber-300">₹{result.copayAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className="rounded-xl bg-red-500/10 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-red-400 flex items-center gap-1"><CreditCard className="h-3 w-3" />Deductible Remaining</p>
                  <p className="text-lg font-bold text-red-400">₹{result.deductibleRemaining.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <Progress value={result.coveragePercent} className="h-2" />
            </CardContent>
          </Card>
        )}
      </motion.div>

      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-white/90"><Shield className="h-4 w-4 text-[#8FD3D1]" />Recent Eligibility Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={history} emptyTitle="No checks performed yet" emptyDescription="Run an eligibility check to see results here" />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
