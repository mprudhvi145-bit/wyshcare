/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/insurance/claims/page.tsx
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
 - frontend/src/app/doctor/emr/dermatology/page.tsx
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 - frontend/src/components/ui/progress.tsx
 - frontend/src/components/marketing/health-twin-demo.tsx
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
import { Plus, IndianRupee, Upload, FileText,
  Printer, CheckCircle, XCircle, AlertCircle, Eye, } from 'lucide-react';
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
import type { Claim } from '@/types';

const MOCK_CLAIMS: Claim[] = [
  { id: 'cl1', policyId: 'p1', clinicId: 'c1', patientUserId: 'u1', claimNumber: 'CLM-2026-0184', totalAmount: 45000, claimedAmount: 45000, approvedAmount: 40500, status: 'APPROVED', submissionDate: new Date(Date.now() - 86400000).toISOString(), adjudicationDate: new Date().toISOString(), createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), items: [{ id: 'li1', claimId: 'cl1', description: 'Cardiology Consultation', category: 'CONSULTATION', claimedAmount: 2000, approvedAmount: 1800 }, { id: 'li2', claimId: 'cl1', description: 'ECG Test', category: 'LAB_TEST', claimedAmount: 1500, approvedAmount: 1500 }, { id: 'li3', claimId: 'cl1', description: 'Medication - Cardiac', category: 'MEDICATION', claimedAmount: 5000, approvedAmount: 4000 }], documents: [{ id: 'doc1', claimId: 'cl1', documentType: 'PRESCRIPTION', fileName: 'prescription.pdf', storageKey: 'key1', uploadedAt: new Date().toISOString() }] },
  { id: 'cl2', policyId: 'p1', clinicId: 'c1', patientUserId: 'u2', claimNumber: 'CLM-2026-0183', totalAmount: 22000, claimedAmount: 22000, status: 'SUBMITTED', submissionDate: new Date(Date.now() - 2 * 86400000).toISOString(), createdAt: new Date(Date.now() - 6 * 86400000).toISOString(), items: [{ id: 'li4', claimId: 'cl2', description: 'Dermatology Consultation', category: 'CONSULTATION', claimedAmount: 1500 }, { id: 'li5', claimId: 'cl2', description: 'Skin Biopsy', category: 'PROCEDURE', claimedAmount: 5000 }] },
  { id: 'cl3', policyId: 'p2', clinicId: 'c2', patientUserId: 'u3', claimNumber: 'CLM-2026-0182', totalAmount: 78000, claimedAmount: 78000, approvedAmount: 62400, status: 'APPROVED', submissionDate: new Date(Date.now() - 3 * 86400000).toISOString(), adjudicationDate: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 8 * 86400000).toISOString() },
  { id: 'cl4', policyId: 'p2', clinicId: 'c1', patientUserId: 'u4', claimNumber: 'CLM-2026-0181', totalAmount: 12500, claimedAmount: 12500, status: 'DRAFT', createdAt: new Date(Date.now() - 4 * 86400000).toISOString(), items: [{ id: 'li6', claimId: 'cl4', description: 'Blood Test', category: 'LAB_TEST', claimedAmount: 2500 }] },
  { id: 'cl5', policyId: 'p3', clinicId: 'c3', patientUserId: 'u5', claimNumber: 'CLM-2026-0180', totalAmount: 95000, claimedAmount: 95000, status: 'REJECTED', submissionDate: new Date(Date.now() - 5 * 86400000).toISOString(), adjudicationDate: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), notes: 'Procedure not covered under existing policy terms' },
  { id: 'cl6', policyId: 'p1', clinicId: 'c2', patientUserId: 'u1', claimNumber: 'CLM-2026-0179', totalAmount: 32000, claimedAmount: 32000, status: 'SUBMITTED', submissionDate: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

function getTimelineForStatus(status: string, submissionDate?: string, adjudicationDate?: string): ClaimStage[] {
  const stages: ClaimStage[] = [
    { label: 'Draft Created', status: status === 'DRAFT' ? 'current' : 'completed' },
    { label: 'Submitted', date: submissionDate, status: ['DRAFT'].includes(status) ? 'pending' : 'completed' },
  ];
  if (['APPROVED', 'REJECTED', 'PARTIALLY_APPROVED'].includes(status)) {
    stages.push({ label: 'Adjudicated', date: adjudicationDate, status: 'completed' });
  } else if (status === 'SUBMITTED' || status === 'UNDER_REVIEW') {
    stages.push({ label: 'Adjudication', status: 'current' });
  } else if (status === 'DRAFT') {
    stages.push({ label: 'Adjudication', status: 'pending' });
  }
  return stages;
}

export default function ClaimsPage() {
  const [loading, setLoading] = useState(true);
  const [claims] = useState(MOCK_CLAIMS);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState<Claim | null>(null);
  const [showAdjudicateDialog, setShowAdjudicateDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [adjApproved, setAdjApproved] = useState(true);
  const [adjAmount, setAdjAmount] = useState('');
  const [adjNotes, setAdjNotes] = useState('');

  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  const filtered = statusFilter === 'ALL' ? claims : claims.filter((c) => c.status === statusFilter);

  const columns: ColumnDef<Claim>[] = [
    { accessorKey: 'claimNumber', header: 'Claim #', cell: ({ row }) => <span className="font-medium text-white/90">{row.original.claimNumber}</span> },
    { accessorKey: 'patientUserId', header: 'Patient', cell: ({ row }) => <span className="text-white/60">#{row.original.patientUserId.slice(0, 5)}</span> },
    { accessorKey: 'policyId', header: 'Policy', cell: ({ row }) => <Badge variant="outline" size="sm">#{row.original.policyId.slice(0, 5)}</Badge> },
    { accessorKey: 'claimedAmount', header: 'Amount', cell: ({ row }) => <span className="font-medium">₹{row.original.claimedAmount.toLocaleString('en-IN')}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" /> },
    { accessorKey: 'submissionDate', header: 'Date', cell: ({ row }) => <span className="text-xs text-white/50">{row.original.submissionDate ? new Date(row.original.submissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : new Date(row.original.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span> },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-72 bg-white/5" />
        <Skeleton className="h-11 w-96 bg-white/5" />
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full bg-white/5" />)}
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
      <motion.div variants={item}>
        <PageHeader title="Claims Management" description="Manage insurance claims from submission to settlement">
          <Button><Plus className="h-4 w-4" />File New Claim</Button>
        </PageHeader>
      </motion.div>

      <motion.div variants={item}>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="ALL">All ({claims.length})</TabsTrigger>
            <TabsTrigger value="DRAFT">Draft ({claims.filter(c => c.status === 'DRAFT').length})</TabsTrigger>
            <TabsTrigger value="SUBMITTED">Submitted ({claims.filter(c => c.status === 'SUBMITTED').length})</TabsTrigger>
            <TabsTrigger value="APPROVED">Approved ({claims.filter(c => c.status === 'APPROVED').length})</TabsTrigger>
            <TabsTrigger value="REJECTED">Rejected ({claims.filter(c => c.status === 'REJECTED').length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      <motion.div variants={item}>
        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={(claim) => setSelected(claim)}
          emptyTitle="No claims found"
          emptyDescription={statusFilter !== 'ALL' ? `No ${statusFilter.toLowerCase()} claims` : undefined}
        />
      </motion.div>

      <Dialog open={!!selected && !showAdjudicateDialog && !showUploadDialog} onOpenChange={(o) => { if (!o) { setSelected(null); setShowAdjudicateDialog(false); setShowUploadDialog(false); } }}>
        <DialogContent className="bg-[#15181D] border border-[rgba(255,255,255,0.06)] max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white/90">Claim Detail — {selected?.claimNumber}</DialogTitle>
            <DialogDescription className="text-white/50">Review claim information and take action</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1"><p className="text-[10px] uppercase tracking-wider text-white/50">Claimed</p><p className="font-semibold text-white/90">₹{selected.claimedAmount.toLocaleString('en-IN')}</p></div>
                <div className="space-y-1"><p className="text-[10px] uppercase tracking-wider text-white/50">Approved</p><p className="font-semibold text-emerald-400">{selected.approvedAmount != null ? `₹${selected.approvedAmount.toLocaleString('en-IN')}` : '—'}</p></div>
                <div className="space-y-1"><p className="text-[10px] uppercase tracking-wider text-white/50">Status</p><StatusBadge status={selected.status} /></div>
                <div className="space-y-1"><p className="text-[10px] uppercase tracking-wider text-white/50">Policy</p><p className="font-medium text-white/90 text-sm">#{selected.policyId.slice(0, 6)}</p></div>
              </div>

              {selected.items && selected.items.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Claim Items</p>
                  <div className="rounded-xl border border-white/5 divide-y divide-white/5">
                    {selected.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-white/90">{item.description}</p>
                          <Badge variant="outline" size="sm">{item.category}</Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white/90">₹{item.claimedAmount.toLocaleString('en-IN')}</p>
                          {item.approvedAmount != null && <p className="text-xs text-emerald-400">Approved: ₹{item.approvedAmount.toLocaleString('en-IN')}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.documents && selected.documents.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Documents</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm">
                        <FileText className="h-4 w-4 text-white/40" />
                        <span className="text-white/70">{doc.fileName}</span>
                        <Badge variant="outline" size="sm">{doc.documentType}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.settlement && (
                <div>
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Settlement Info</p>
                  <div className="rounded-xl bg-emerald-500/10 p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-white/50">Amount</span><p className="font-semibold text-white/90">₹{selected.settlement.amount.toLocaleString('en-IN')}</p></div>
                      <div><span className="text-white/50">Method</span><p className="font-medium text-white/90">{selected.settlement.method}</p></div>
                      <div><span className="text-white/50">Reference</span><p className="font-medium text-white/90">{selected.settlement.reference ?? '—'}</p></div>
                      <div><span className="text-white/50">Status</span><StatusBadge status={selected.settlement.status} size="sm" /></div>
                    </div>
                  </div>
                </div>
              )}

              {selected.notes && (
                <div className="rounded-xl bg-amber-500/10 p-4">
                  <p className="text-xs font-medium text-amber-300 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />Notes</p>
                  <p className="text-sm text-amber-200 mt-1">{selected.notes}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Timeline</p>
                <ClaimTimeline stages={getTimelineForStatus(selected.status, selected.submissionDate, selected.adjudicationDate)} />
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-white/5">
                {selected.status === 'DRAFT' && (
                  <Button><CheckCircle className="h-4 w-4" />Submit Claim</Button>
                )}
                {selected.status === 'SUBMITTED' && (
                  <Button onClick={() => setShowAdjudicateDialog(true)}><Eye className="h-4 w-4" />Adjudicate</Button>
                )}
                {selected.status === 'APPROVED' && (
                  <Button><IndianRupee className="h-4 w-4" />Create Settlement</Button>
                )}
                <Button variant="outline" onClick={() => setShowUploadDialog(true)}><Upload className="h-4 w-4" />Upload Document</Button>
                <Button variant="outline" size="sm"><Printer className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAdjudicateDialog} onOpenChange={setShowAdjudicateDialog}>
        <DialogContent className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <DialogHeader>
            <DialogTitle className="text-white/90">Adjudicate Claim</DialogTitle>
            <DialogDescription className="text-white/50">{selected?.claimNumber}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Button variant={adjApproved ? 'default' : 'outline'} onClick={() => setAdjApproved(true)} className="flex-1"><CheckCircle className="h-4 w-4" />Approve</Button>
              <Button variant={!adjApproved ? 'danger' : 'outline'} onClick={() => setAdjApproved(false)} className="flex-1"><XCircle className="h-4 w-4" />Reject</Button>
            </div>
            {adjApproved && (
              <div>
                <label className="text-xs font-medium text-white/50 mb-1 block">Approved Amount (₹)</label>
                <Input type="number" value={adjAmount} onChange={(e) => setAdjAmount(e.target.value)} placeholder={String(selected?.claimedAmount ?? 0)} />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-white/50 mb-1 block">Adjudication Notes</label>
              <textarea value={adjNotes} onChange={(e) => setAdjNotes(e.target.value)} placeholder="Enter notes..." className="h-24 w-full rounded-xl border border-white/10 bg-[#1C2025] p-4 text-sm text-white/90 outline-none transition placeholder:text-slate-400 focus:border-[#8FD3D1] focus:ring-2 focus:ring-[#8FD3D1]/20" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAdjudicateDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowAdjudicateDialog(false); setAdjAmount(''); setAdjNotes(''); }}>Confirm</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <DialogHeader>
            <DialogTitle className="text-white/90">Upload Document</DialogTitle>
            <DialogDescription className="text-white/50">Attach a document to {selected?.claimNumber}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-white/50 mb-1 block">Document Type</label>
              <select className="h-12 w-full rounded-xl border border-white/10 bg-[#1C2025] px-4 text-sm text-white/90 outline-none focus:border-[#8FD3D1] focus:ring-2 focus:ring-[#8FD3D1]/20">
                <option>PRESCRIPTION</option>
                <option>DISCHARGE_SUMMARY</option>
                <option>INVOICE</option>
                <option>INVESTIGATION_REPORT</option>
                <option>ID_PROOF</option>
              </select>
            </div>
            <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-white/10 p-8">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-white/40" />
                <p className="mt-2 text-sm text-white/50">Drop files here or click to browse</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>Cancel</Button>
              <Button onClick={() => setShowUploadDialog(false)}><Upload className="h-4 w-4" />Upload</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
