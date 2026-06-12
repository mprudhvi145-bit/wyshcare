/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/insurance/coverage-rules/page.tsx
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
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 - frontend/src/components/ui/progress.tsx
 *
 * Calls:
 - status-badge
 - data-table
 - dialog
 - select
 - react
 - badge
 - skeleton
 - button
 *
 * Dependencies:
 - status-badge
 - data-table
 - dialog
 - select
 - react
 - badge
 - skeleton
 - button
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
import { Plus, AlertTriangle, } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ColumnDef } from '@tanstack/react-table';
import type { CoverageRule, CoverageType } from '@/types';

const MOCK_PLANS = [
  { id: 'pl1', name: 'Health Shield Plus', provider: 'ICICI Lombard' },
  { id: 'pl2', name: 'Family Floater Gold', provider: 'ICICI Lombard' },
  { id: 'pl3', name: 'Star Comprehensive', provider: 'Star Health' },
  { id: 'pl4', name: 'Ayushman Bharat', provider: 'Govt Health Scheme' },
];

const MOCK_RULES: CoverageRule[] = [
  { id: 'r1', planId: 'pl1', category: 'ROOM', coveragePercent: 100, maxAmount: 15000, requiresPreAuth: false, waitingPeriod: 0, isActive: true },
  { id: 'r2', planId: 'pl1', category: 'CONSULTATION', coveragePercent: 90, maxAmount: 2000, requiresPreAuth: false, waitingPeriod: 0, isActive: true },
  { id: 'r3', planId: 'pl1', category: 'MEDICATION', coveragePercent: 80, maxAmount: 5000, requiresPreAuth: false, waitingPeriod: 0, isActive: true },
  { id: 'r4', planId: 'pl1', category: 'LAB_TEST', coveragePercent: 100, maxAmount: 10000, requiresPreAuth: false, waitingPeriod: 0, isActive: true },
  { id: 'r5', planId: 'pl1', category: 'PROCEDURE', coveragePercent: 75, maxAmount: 100000, requiresPreAuth: true, waitingPeriod: 30, isActive: true },
  { id: 'r6', planId: 'pl1', category: 'MATERNITY', coveragePercent: 100, maxAmount: 50000, requiresPreAuth: true, waitingPeriod: 180, isActive: true },
  { id: 'r7', planId: 'pl2', category: 'ROOM', coveragePercent: 100, maxAmount: 25000, requiresPreAuth: false, waitingPeriod: 0, isActive: true },
  { id: 'r8', planId: 'pl2', category: 'CONSULTATION', coveragePercent: 85, maxAmount: 3000, requiresPreAuth: false, waitingPeriod: 0, isActive: true },
  { id: 'r9', planId: 'pl2', category: 'PROCEDURE', coveragePercent: 80, maxAmount: 200000, requiresPreAuth: true, waitingPeriod: 60, isActive: true },
  { id: 'r10', planId: 'pl3', category: 'ROOM', coveragePercent: 90, maxAmount: 20000, requiresPreAuth: false, waitingPeriod: 0, isActive: false },
];

const CATEGORIES: { value: CoverageType; label: string }[] = [
  { value: 'ROOM', label: 'Room Charges' },
  { value: 'CONSULTATION', label: 'Consultation' },
  { value: 'MEDICATION', label: 'Medication' },
  { value: 'LAB_TEST', label: 'Lab Test' },
  { value: 'PROCEDURE', label: 'Procedure' },
  { value: 'VACCINATION', label: 'Vaccination' },
  { value: 'DENTAL', label: 'Dental' },
  { value: 'VISION', label: 'Vision' },
  { value: 'MATERNITY', label: 'Maternity' },
  { value: 'AMBULANCE', label: 'Ambulance' },
  { value: 'PRE_EXISTING', label: 'Pre-existing' },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function CoverageRulesPage() {
  const [loading, setLoading] = useState(true);
  const [rules] = useState(MOCK_RULES);
  const [selectedPlanId, setSelectedPlanId] = useState('pl1');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [form, setForm] = useState({ planId: 'pl1', category: 'ROOM' as CoverageType, coveragePercent: '', maxAmount: '', requiresPreAuth: false, waitingPeriod: '' });

  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  const planRules = rules.filter((r) => r.planId === selectedPlanId);

  const columns: ColumnDef<CoverageRule>[] = [
    { accessorKey: 'category', header: 'Category', cell: ({ row }) => <Badge variant="outline">{CATEGORIES.find(c => c.value === row.original.category)?.label ?? row.original.category}</Badge> },
    { accessorKey: 'coveragePercent', header: 'Coverage %', cell: ({ row }) => <span className="font-medium">{row.original.coveragePercent}%</span> },
    { accessorKey: 'maxAmount', header: 'Max Amount', cell: ({ row }) => <span>{row.original.maxAmount ? `₹${row.original.maxAmount.toLocaleString('en-IN')}` : '—'}</span> },
    {
      accessorKey: 'requiresPreAuth',
      header: 'Pre-Auth',
      cell: ({ row }) => row.original.requiresPreAuth
        ? <Badge variant="warning" size="sm" className="gap-1"><AlertTriangle className="h-3 w-3" />Required</Badge>
        : <Badge variant="secondary" size="sm">No</Badge>,
    },
    { accessorKey: 'waitingPeriod', header: 'Waiting Period', cell: ({ row }) => <span className="text-white/60">{row.original.waitingPeriod ? `${row.original.waitingPeriod} days` : 'None'}</span> },
    { accessorKey: 'isActive', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'ACTIVE' : 'INACTIVE'} size="sm" /> },
  ];

  if (loading) {
    return (
      <div className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
        <Skeleton className="bg-white/5 h-9 w-72" />
        <Skeleton className="bg-white/5 h-11 w-48" />
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="bg-white/5 h-14 w-full" />)}
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
      <motion.div variants={item}>
        <PageHeader title="Coverage Rules" description="Define coverage parameters for each insurance plan">
          <Button onClick={() => setShowAddDialog(true)}><Plus className="h-4 w-4" />Add Rule</Button>
        </PageHeader>
      </motion.div>

      <motion.div variants={item} className="flex items-center gap-3">
        <label className="text-sm font-medium text-white/60">Select Plan:</label>
        <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
          <SelectTrigger className="sm:w-72"><SelectValue /></SelectTrigger>
          <SelectContent>
            {MOCK_PLANS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.provider})</SelectItem>)}
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div variants={item}>
        <DataTable
          columns={columns}
          data={planRules}
          emptyTitle="No coverage rules for this plan"
          emptyDescription="Add coverage rules to define what this plan covers"
        />
      </motion.div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <DialogHeader>
            <DialogTitle className="text-white/90">Add Coverage Rule</DialogTitle>
            <DialogDescription className="text-white/50">Define coverage parameters for a plan</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-white/50 mb-1 block">Plan</label>
              <Select value={form.planId} onValueChange={(v) => setForm({ ...form, planId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MOCK_PLANS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-white/50 mb-1 block">Category</label>
                <Select value={form.category} onValueChange={(v: CoverageType) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-white/50 mb-1 block">Coverage %</label>
                <Input type="number" value={form.coveragePercent} onChange={(e) => setForm({ ...form, coveragePercent: e.target.value })} placeholder="e.g. 90" min={0} max={100} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-white/50 mb-1 block">Max Amount (₹)</label>
                <Input type="number" value={form.maxAmount} onChange={(e) => setForm({ ...form, maxAmount: e.target.value })} placeholder="e.g. 15000" />
              </div>
              <div>
                <label className="text-xs font-medium text-white/50 mb-1 block">Waiting Period (days)</label>
                <Input type="number" value={form.waitingPeriod} onChange={(e) => setForm({ ...form, waitingPeriod: e.target.value })} placeholder="e.g. 30" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="reqPreAuth" checked={form.requiresPreAuth} onChange={(e) => setForm({ ...form, requiresPreAuth: e.target.checked })} className="h-4 w-4 rounded border-white/20 text-[#8FD3D1] focus:ring-[#8FD3D1]" />
              <label htmlFor="reqPreAuth" className="text-sm text-white/70">Requires Pre-Authorization</label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={() => setShowAddDialog(false)}>Save Rule</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
