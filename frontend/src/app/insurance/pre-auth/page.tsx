/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/insurance/pre-auth/page.tsx
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
 - claim-timeline
 - react
 - badge
 - skeleton
 *
 * Dependencies:
 - tabs
 - status-badge
 - data-table
 - dialog
 - claim-timeline
 - react
 - badge
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
import { Plus, MessageSquare, } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ClaimTimeline, type ClaimStage } from '@/components/insurance/claim-timeline';
import type { ColumnDef } from '@tanstack/react-table';
import type { PreAuthorization } from '@/types';

const MOCK_PRE_AUTHS: PreAuthorization[] = [
  { id: 'pa1', policyId: 'p1', clinicId: 'c1', patientUserId: 'u1', procedureCode: 'ANGIO-101', diagnosisCode: 'I25.1', requestedAmount: 85000, approvedAmount: 76500, status: 'APPROVED', reviewerNotes: 'Approved as per standard cardiac coverage', respondedAt: new Date(Date.now() - 86400000).toISOString(), expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(), createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: 'pa2', policyId: 'p2', clinicId: 'c2', patientUserId: 'u2', procedureCode: 'MRI-205', diagnosisCode: 'M51.1', requestedAmount: 32000, status: 'PENDING', expiresAt: new Date(Date.now() + 20 * 86400000).toISOString(), createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'pa3', policyId: 'p1', clinicId: 'c3', patientUserId: 'u3', procedureCode: 'SURG-401', diagnosisCode: 'K40.9', requestedAmount: 120000, status: 'PENDING', expiresAt: new Date(Date.now() + 25 * 86400000).toISOString(), createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'pa4', policyId: 'p3', clinicId: 'c1', patientUserId: 'u4', procedureCode: 'CT-101', diagnosisCode: 'R10.4', requestedAmount: 18000, status: 'REJECTED', reviewerNotes: 'CT scan not covered under this policy for this diagnosis', respondedAt: new Date(Date.now() - 2 * 86400000).toISOString(), expiresAt: new Date(Date.now() + 45 * 86400000).toISOString(), createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 'pa5', policyId: 'p2', clinicId: 'c2', patientUserId: 'u5', procedureCode: 'DENT-301', diagnosisCode: 'K02.9', requestedAmount: 15000, approvedAmount: 10500, status: 'APPROVED', reviewerNotes: 'Partial approval - basic dental covered', respondedAt: new Date(Date.now() - 4 * 86400000).toISOString(), expiresAt: new Date(Date.now() + 60 * 86400000).toISOString(), createdAt: new Date(Date.now() - 12 * 86400000).toISOString() },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function PreAuthPage() {
  const [loading, setLoading] = useState(true);
  const [preAuths] = useState(MOCK_PRE_AUTHS);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState<PreAuthorization | null>(null);
  const [showRespondDialog, setShowRespondDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [respondAction, setRespondAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [respondAmount, setRespondAmount] = useState('');
  const [respondNotes, setRespondNotes] = useState('');

  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  const filtered = statusFilter === 'ALL' ? preAuths : preAuths.filter((p) => p.status === statusFilter);

  const columns: ColumnDef<PreAuthorization>[] = [
    { accessorKey: 'procedureCode', header: 'Procedure', cell: ({ row }) => <span className="font-medium text-white/90">{row.original.procedureCode ?? '—'}</span> },
    { accessorKey: 'diagnosisCode', header: 'Diagnosis', cell: ({ row }) => <Badge variant="outline" size="sm">{row.original.diagnosisCode ?? '—'}</Badge> },
    { accessorKey: 'requestedAmount', header: 'Requested', cell: ({ row }) => <span>₹{row.original.requestedAmount.toLocaleString('en-IN')}</span> },
    { accessorKey: 'approvedAmount', header: 'Approved', cell: ({ row }) => <span className="font-medium text-emerald-400">{row.original.approvedAmount != null ? `₹${row.original.approvedAmount.toLocaleString('en-IN')}` : '—'}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" /> },
    { accessorKey: 'createdAt', header: 'Date', cell: ({ row }) => <span className="text-xs text-white/50">{new Date(row.original.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span> },
  ];

  const getTimeline = (pa: PreAuthorization): ClaimStage[] => {
    const stages: ClaimStage[] = [
      { label: 'Request Created', date: pa.createdAt, status: 'completed' },
    ];
    if (pa.status !== 'PENDING') {
      stages.push({ label: 'Under Review', status: 'completed' });
      stages.push({ label: pa.status, date: pa.respondedAt, status: pa.status === 'APPROVED' ? 'completed' : 'completed' });
    } else {
      stages.push({ label: 'Pending Review', status: 'current' });
      stages.push({ label: 'Decision', status: 'pending' });
    }
    return stages;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-72 bg-white/5" />
        <Skeleton className="h-11 w-96 bg-white/5" />
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full bg-white/5" />)}
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
      <motion.div variants={item}>
        <PageHeader title="Pre-Authorization Management" description="Review and respond to pre-authorization requests">
          <Button onClick={() => setShowCreateDialog(true)}><Plus className="h-4 w-4" />Create Pre-Auth</Button>
        </PageHeader>
      </motion.div>

      <motion.div variants={item}>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="PENDING">Pending</TabsTrigger>
            <TabsTrigger value="APPROVED">Approved</TabsTrigger>
            <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      <motion.div variants={item}>
        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={setSelected}
          emptyTitle="No pre-authorizations found"
          emptyDescription={statusFilter !== 'ALL' ? `No ${statusFilter.toLowerCase()} pre-auth requests` : undefined}
        />
      </motion.div>

      <Dialog open={!!selected && !showRespondDialog} onOpenChange={(o) => { if (!o) { setSelected(null); setShowRespondDialog(false); } }}>
        <DialogContent className="max-w-2xl bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <DialogHeader>
            <DialogTitle className="text-white/90">Pre-Authorization Detail</DialogTitle>
            <DialogDescription className="text-white/50">Procedure: {selected?.procedureCode}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-[10px] uppercase tracking-wider text-white/50">Procedure Code</p><p className="font-medium text-white/90">{selected.procedureCode ?? '—'}</p></div>
                <div className="space-y-1"><p className="text-[10px] uppercase tracking-wider text-white/50">Diagnosis Code</p><p className="font-medium text-white/90">{selected.diagnosisCode ?? '—'}</p></div>
                <div className="space-y-1"><p className="text-[10px] uppercase tracking-wider text-white/50">Requested Amount</p><p className="font-medium text-white/90">₹{selected.requestedAmount.toLocaleString('en-IN')}</p></div>
                <div className="space-y-1"><p className="text-[10px] uppercase tracking-wider text-white/50">Approved Amount</p><p className="font-medium text-emerald-400">{selected.approvedAmount != null ? `₹${selected.approvedAmount.toLocaleString('en-IN')}` : '—'}</p></div>
                <div className="space-y-1"><p className="text-[10px] uppercase tracking-wider text-white/50">Status</p><StatusBadge status={selected.status} /></div>
                <div className="space-y-1"><p className="text-[10px] uppercase tracking-wider text-white/50">Expires</p><p className="font-medium text-white/90">{new Date(selected.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
              </div>
              {selected.reviewerNotes && (
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs font-medium text-white/50 mb-1 flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />Reviewer Notes</p>
                  <p className="text-sm text-white/70">{selected.reviewerNotes}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-white/50 mb-2">Status Timeline</p>
                <ClaimTimeline stages={getTimeline(selected)} />
              </div>
              {selected.status === 'PENDING' && (
                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                  <Button variant="outline" onClick={() => { setSelected(null); }}>Cancel</Button>
                  <Button variant="danger" onClick={() => { setRespondAction('REJECTED'); setShowRespondDialog(true); }}>Reject</Button>
                  <Button onClick={() => { setRespondAction('APPROVED'); setShowRespondDialog(true); }}>Approve</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRespondDialog} onOpenChange={setShowRespondDialog}>
        <DialogContent className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <DialogHeader>
            <DialogTitle className="text-white/90">{respondAction === 'APPROVED' ? 'Approve' : 'Reject'} Pre-Authorization</DialogTitle>
            <DialogDescription className="text-white/50">Procedure: {selected?.procedureCode}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {respondAction === 'APPROVED' && (
              <div>
                <label className="text-xs font-medium text-white/50 mb-1 block">Approved Amount (₹)</label>
                <Input type="number" value={respondAmount} onChange={(e) => setRespondAmount(e.target.value)} placeholder={String(selected?.requestedAmount ?? 0)} />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-white/50 mb-1 block">Notes</label>
              <textarea
                value={respondNotes}
                onChange={(e) => setRespondNotes(e.target.value)}
                placeholder={respondAction === 'APPROVED' ? 'Approval notes...' : 'Reason for rejection...'}
                className="h-24 w-full rounded-xl border border-white/10 bg-[#1C2025] p-4 text-sm text-white/90 outline-none transition placeholder:text-slate-400 focus:border-[#8FD3D1] focus:ring-2 focus:ring-[#8FD3D1]/20"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowRespondDialog(false); setRespondAmount(''); setRespondNotes(''); }}>Cancel</Button>
              <Button variant={respondAction === 'APPROVED' ? 'default' : 'danger'} onClick={() => { setShowRespondDialog(false); setRespondAmount(''); setRespondNotes(''); setSelected(null); }}>
                {respondAction === 'APPROVED' ? 'Approve & Confirm' : 'Reject'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <DialogHeader>
            <DialogTitle className="text-white/90">Create Pre-Authorization</DialogTitle>
            <DialogDescription className="text-white/50">Submit a new pre-authorization request</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-white/50 mb-1 block">Procedure Code</label>
                <Input placeholder="e.g. ANGIO-101" />
              </div>
              <div>
                <label className="text-xs font-medium text-white/50 mb-1 block">Diagnosis Code</label>
                <Input placeholder="e.g. I25.1" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-white/50 mb-1 block">Requested Amount (₹)</label>
              <Input type="number" placeholder="e.g. 50000" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={() => setShowCreateDialog(false)}>Create Pre-Auth</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
