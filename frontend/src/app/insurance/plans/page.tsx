/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/insurance/plans/page.tsx
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
 - search-input
 - skeleton
 *
 * Dependencies:
 - status-badge
 - data-table
 - dialog
 - select
 - react
 - badge
 - search-input
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
import type { ColumnDef } from '@tanstack/react-table';
import type { InsurancePlan } from '@/types';

const MOCK_PLANS: InsurancePlan[] = [
  { id: 'pl1', providerId: '1', name: 'Health Shield Plus', code: 'HSP-001', type: 'INDIVIDUAL', maxSumInsured: 500000, isActive: true, provider: { id: '1', name: 'ICICI Lombard', code: 'ICICI', type: 'PRIVATE', isActive: true, createdAt: '' } },
  { id: 'pl2', providerId: '1', name: 'Family Floater Gold', code: 'FFG-001', type: 'FAMILY', maxSumInsured: 1000000, isActive: true, provider: { id: '1', name: 'ICICI Lombard', code: 'ICICI', type: 'PRIVATE', isActive: true, createdAt: '' } },
  { id: 'pl3', providerId: '2', name: 'Star Comprehensive', code: 'SC-200', type: 'INDIVIDUAL', maxSumInsured: 750000, isActive: true, provider: { id: '2', name: 'Star Health Insurance', code: 'STAR', type: 'PRIVATE', isActive: true, createdAt: '' } },
  { id: 'pl4', providerId: '2', name: 'Star Family Shield', code: 'SFS-100', type: 'FAMILY', maxSumInsured: 1500000, isActive: true, provider: { id: '2', name: 'Star Health Insurance', code: 'STAR', type: 'PRIVATE', isActive: true, createdAt: '' } },
  { id: 'pl5', providerId: '3', name: 'Ayushman Bharat', code: 'AB-PMJAY', type: 'GOVT', maxSumInsured: 500000, isActive: true, provider: { id: '3', name: 'Government Health Scheme', code: 'GHS', type: 'GOVT', isActive: true, createdAt: '' } },
  { id: 'pl6', providerId: '4', name: 'MediAssist Corporate', code: 'MAC-001', type: 'CORPORATE', maxSumInsured: 2000000, isActive: true, provider: { id: '4', name: 'MediAssist TPA', code: 'MEDI', type: 'TPA', isActive: true, createdAt: '' } },
  { id: 'pl7', providerId: '8', name: 'HDFC ERGO Optima', code: 'HEO-500', type: 'INDIVIDUAL', maxSumInsured: 1000000, isActive: true, provider: { id: '8', name: 'HDFC ERGO', code: 'HDFC', type: 'PRIVATE', isActive: true, createdAt: '' } },
  { id: 'pl8', providerId: '6', name: 'ESIC Medical', code: 'ESIC-MED', type: 'GOVT', maxSumInsured: 300000, isActive: false, provider: { id: '6', name: 'ESIC', code: 'ESIC', type: 'GOVT', isActive: true, createdAt: '' } },
];

const MOCK_PROVIDERS = [
  { id: '1', name: 'ICICI Lombard' },
  { id: '2', name: 'Star Health Insurance' },
  { id: '3', name: 'Government Health Scheme' },
  { id: '4', name: 'MediAssist TPA' },
  { id: '6', name: 'ESIC' },
  { id: '8', name: 'HDFC ERGO' },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function PlansPage() {
  const [loading, setLoading] = useState(true);
  const [plans] = useState(MOCK_PLANS);
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [form, setForm] = useState({ providerId: '', name: '', code: '', type: 'INDIVIDUAL', maxSumInsured: '' });

  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  const filtered = plans.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
    const matchesProvider = providerFilter === 'all' || p.providerId === providerFilter;
    return matchesSearch && matchesProvider;
  });

  const columns: ColumnDef<InsurancePlan>[] = [
    { accessorKey: 'provider.name', header: 'Provider', cell: ({ row }) => <span className="text-white/90">{row.original.provider?.name ?? '—'}</span> },
    { accessorKey: 'name', header: 'Plan Name', cell: ({ row }) => <span className="text-white/70">{row.original.name}</span> },
    { accessorKey: 'code', header: 'Code', cell: ({ row }) => <Badge variant="outline" size="sm">{row.original.code}</Badge> },
    { accessorKey: 'type', header: 'Type', cell: ({ row }) => <Badge variant="secondary" size="sm">{row.original.type}</Badge> },
    { accessorKey: 'maxSumInsured', header: 'Max Sum Insured', cell: ({ row }) => <span className="font-medium">₹{row.original.maxSumInsured.toLocaleString('en-IN')}</span> },
    { accessorKey: 'isActive', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'ACTIVE' : 'INACTIVE'} size="sm" /> },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="bg-white/5 h-9 w-72" />
        <div className="flex gap-3"><Skeleton className="bg-white/5 h-11 w-48" /><Skeleton className="bg-white/5 h-11 w-40" /></div>
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="bg-white/5 h-14 w-full" />)}
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
      <motion.div variants={item}>
        <PageHeader title="Insurance Plans" description="Manage health insurance plans across providers">
          <Button onClick={() => setShowAddDialog(true)}><Plus className="h-4 w-4" />Add Plan</Button>
        </PageHeader>
      </motion.div>

      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search plans..." className="sm:max-w-xs" />
        <Select value={providerFilter} onValueChange={setProviderFilter}>
          <SelectTrigger className="sm:w-48"><SelectValue placeholder="All Providers" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            {MOCK_PROVIDERS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div variants={item}>
        <DataTable columns={columns} data={filtered} emptyTitle="No plans found" emptyDescription="Try adjusting your search or filter" />
      </motion.div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <DialogHeader>
            <DialogTitle className="text-white/90">Add Insurance Plan</DialogTitle>
            <DialogDescription className="text-white/50">Create a new plan under a provider</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-white/50 mb-1 block">Provider</label>
              <Select value={form.providerId} onValueChange={(v) => setForm({ ...form, providerId: v })}>
                <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                <SelectContent>
                  {MOCK_PROVIDERS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-white/50 mb-1 block">Plan Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Health Shield Plus" />
              </div>
              <div>
                <label className="text-xs font-medium text-white/50 mb-1 block">Code</label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. HSP-001" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-white/50 mb-1 block">Type</label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                    <SelectItem value="FAMILY">Family</SelectItem>
                    <SelectItem value="CORPORATE">Corporate</SelectItem>
                    <SelectItem value="GOVT">Government</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-white/50 mb-1 block">Max Sum Insured (₹)</label>
                <Input type="number" value={form.maxSumInsured} onChange={(e) => setForm({ ...form, maxSumInsured: e.target.value })} placeholder="e.g. 500000" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowAddDialog(false); setForm({ providerId: '', name: '', code: '', type: 'INDIVIDUAL', maxSumInsured: '' }); }}>Save Plan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
