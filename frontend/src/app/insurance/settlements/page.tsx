/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/insurance/settlements/page.tsx
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
 - tabs
 - status-badge
 - data-table
 - dialog
 - select
 - react
 - badge
 - search-input
 *
 * Dependencies:
 - tabs
 - status-badge
 - data-table
 - dialog
 - select
 - react
 - badge
 - search-input
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
import { Plus, } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';

import { SearchInput } from '@/components/ui/search-input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ColumnDef } from '@tanstack/react-table';
import type { Settlement } from '@/types';

interface SettlementWithClaim extends Settlement {
  claimNumber?: string;
}

const MOCK_APPROVED_CLAIMS = [
  { id: 'cl1', claimNumber: 'CLM-2026-0184', amount: 40500 },
  { id: 'cl3', claimNumber: 'CLM-2026-0182', amount: 62400 },
  { id: 'cl7', claimNumber: 'CLM-2026-0178', amount: 12000 },
  { id: 'cl8', claimNumber: 'CLM-2026-0174', amount: 89000 },
];

const MOCK_SETTLEMENTS: SettlementWithClaim[] = [
  { id: 's1', claimId: 'cl1', claimNumber: 'CLM-2026-0184', amount: 40500, date: new Date(Date.now() - 86400000).toISOString(), method: 'BANK_TRANSFER', reference: 'NEFT-2026-00421', status: 'COMPLETED', processedAt: new Date().toISOString() },
  { id: 's2', claimId: 'cl3', claimNumber: 'CLM-2026-0182', amount: 62400, date: new Date(Date.now() - 3 * 86400000).toISOString(), method: 'CHEQUE', reference: 'CHQ-00452', status: 'PROCESSED', processedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 's3', claimId: 'cl5', claimNumber: 'CLM-2026-0178', amount: 12000, date: new Date(Date.now() - 7 * 86400000).toISOString(), method: 'BANK_TRANSFER', reference: 'NEFT-2026-00398', status: 'COMPLETED', processedAt: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: 's4', claimId: 'cl7', claimNumber: 'CLM-2026-0174', amount: 89000, date: new Date(Date.now() - 86400000).toISOString(), method: 'BANK_TRANSFER', status: 'PENDING', notes: 'Awaiting bank confirmation' },
  { id: 's5', claimId: 'cl9', claimNumber: 'CLM-2026-0170', amount: 15000, date: new Date(Date.now() - 10 * 86400000).toISOString(), method: 'CHEQUE', reference: 'CHQ-00448', status: 'FAILED', notes: 'Insufficient funds' },
];

const METHODS = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function SettlementsPage() {
  const [loading, setLoading] = useState(true);
  const [settlements] = useState(MOCK_SETTLEMENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [form, setForm] = useState({ claimId: '', amount: '', method: 'BANK_TRANSFER', reference: '', notes: '' });

  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  const filtered = settlements.filter((s) => {
    const matchesSearch = (s.claimNumber ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: ColumnDef<SettlementWithClaim>[] = [
    { accessorKey: 'claimNumber', header: 'Claim #', cell: ({ row }) => <span className="text-white/90">{row.original.claimNumber ?? '—'}</span> },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => <span className="font-semibold">₹{row.original.amount.toLocaleString('en-IN')}</span> },
    { accessorKey: 'method', header: 'Method', cell: ({ row }) => <Badge variant="outline" size="sm">{METHODS.find(m => m.value === row.original.method)?.label ?? row.original.method}</Badge> },
    { accessorKey: 'reference', header: 'Reference', cell: ({ row }) => <span className="text-xs text-white/50">{row.original.reference ?? '—'}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" /> },
    { accessorKey: 'date', header: 'Date', cell: ({ row }) => <span className="text-xs text-white/50">{new Date(row.original.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span> },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="bg-white/5 h-9 w-72" />
        <Skeleton className="bg-white/5 h-11 w-96" />
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="bg-white/5 h-14 w-full" />)}
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
      <motion.div variants={item}>
        <PageHeader title="Settlement Management" description="Process and track claim settlements">
          <Button onClick={() => setShowCreateDialog(true)}><Plus className="h-4 w-4" />Create Settlement</Button>
        </PageHeader>
      </motion.div>

      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by claim number..." className="sm:max-w-xs" />
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="PENDING">Pending</TabsTrigger>
            <TabsTrigger value="PROCESSED">Processed</TabsTrigger>
            <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
            <TabsTrigger value="FAILED">Failed</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      <motion.div variants={item}>
        <DataTable columns={columns} data={filtered} emptyTitle="No settlements found" emptyDescription="Create a settlement for an approved claim" />
      </motion.div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <DialogHeader>
            <DialogTitle className="text-white/90">Create Settlement</DialogTitle>
            <DialogDescription className="text-white/50">Settle an approved claim</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-white/50 mb-1 block">Claim (Approved Only)</label>
              <Select value={form.claimId} onValueChange={(v) => {
                const claim = MOCK_APPROVED_CLAIMS.find(c => c.id === v);
                setForm({ ...form, claimId: v, amount: claim ? String(claim.amount) : '' });
              }}>
                <SelectTrigger><SelectValue placeholder="Select approved claim" /></SelectTrigger>
                <SelectContent>
                  {MOCK_APPROVED_CLAIMS.map((c) => <SelectItem key={c.id} value={c.id}>{c.claimNumber} — ₹{c.amount.toLocaleString('en-IN')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-white/50 mb-1 block">Amount (₹)</label>
                <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Settlement amount" />
              </div>
              <div>
                <label className="text-xs font-medium text-white/50 mb-1 block">Method</label>
                <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-white/50 mb-1 block">Reference No.</label>
                <Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="e.g. NEFT-2026-XXXX" />
              </div>
              <div>
                <label className="text-xs font-medium text-white/50 mb-1 block">Notes</label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowCreateDialog(false); setForm({ claimId: '', amount: '', method: 'BANK_TRANSFER', reference: '', notes: '' }); }}>Process Settlement</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
