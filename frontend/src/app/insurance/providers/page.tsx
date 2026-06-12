/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/insurance/providers/page.tsx
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
 - avatar
 - card
 - dialog
 - empty-state
 - select
 - react
 - badge
 *
 * Dependencies:
 - status-badge
 - avatar
 - card
 - dialog
 - empty-state
 - select
 - react
 - badge
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
import { Building2, Plus, Phone, Mail, } from 'lucide-react';
import { motion } from 'framer-motion';

import { Card, } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { SearchInput } from '@/components/ui/search-input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { InsuranceProvider, InsuranceProviderType } from '@/types';

const MOCK_PROVIDERS: InsuranceProvider[] = [
  { id: '1', name: 'ICICI Lombard', code: 'ICICI', type: 'PRIVATE', logoUrl: '', phone: '1800-123-4567', email: 'support@icicilombard.com', website: 'www.icicilombard.com', isActive: true, createdAt: new Date().toISOString(), plans: [] },
  { id: '2', name: 'Star Health Insurance', code: 'STAR', type: 'PRIVATE', logoUrl: '', phone: '1800-234-5678', email: 'help@starhealth.in', website: 'www.starhealth.in', isActive: true, createdAt: new Date().toISOString(), plans: [] },
  { id: '3', name: 'Government Health Scheme', code: 'GHS', type: 'GOVT', logoUrl: '', phone: '1800-345-6789', email: 'info@ghs.gov.in', website: 'www.ghs.gov.in', isActive: true, createdAt: new Date().toISOString(), plans: [] },
  { id: '4', name: 'MediAssist TPA', code: 'MEDI', type: 'TPA', logoUrl: '', phone: '1800-456-7890', email: 'care@mediassist.in', website: 'www.mediassist.in', isActive: true, createdAt: new Date().toISOString(), plans: [] },
  { id: '5', name: 'Bajaj Allianz', code: 'BAJAJ', type: 'PRIVATE', logoUrl: '', phone: '1800-567-8901', email: 'service@bajajallianz.in', website: 'www.bajajallianz.in', isActive: false, createdAt: new Date().toISOString(), plans: [] },
  { id: '6', name: 'ESIC', code: 'ESIC', type: 'GOVT', logoUrl: '', phone: '1800-678-9012', email: 'support@esic.nic.in', website: 'www.esic.nic.in', isActive: true, createdAt: new Date().toISOString(), plans: [] },
  { id: '7', name: 'Raksha TPA', code: 'RAKSHA', type: 'TPA', logoUrl: '', phone: '1800-789-0123', email: 'info@rakshatpa.com', website: 'www.rakshatpa.com', isActive: true, createdAt: new Date().toISOString(), plans: [] },
  { id: '8', name: 'HDFC ERGO', code: 'HDFC', type: 'PRIVATE', logoUrl: '', phone: '1800-890-1234', email: 'care@hdfcergo.com', website: 'www.hdfcergo.com', isActive: true, createdAt: new Date().toISOString(), plans: [] },
];

const typeColors: Record<InsuranceProviderType, string> = {
  GOVT: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20',
  PRIVATE: 'bg-blue-500/20 text-blue-300 border-blue-500/20',
  TPA: 'bg-purple-500/20 text-purple-300 border-purple-500/20',
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function ProvidersPage() {
  const [loading, setLoading] = useState(true);
  const [providers] = useState(MOCK_PROVIDERS);
  const [search, setSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<InsuranceProvider | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', type: 'PRIVATE' as InsuranceProviderType, phone: '', email: '' });

  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  const filtered = providers.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="bg-white/5 h-9 w-72" />
        <Skeleton className="bg-white/5 h-12 w-full" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="bg-white/5 h-44 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
      <motion.div variants={item}>
        <PageHeader title="Provider Management" description="Manage insurance providers, TPAs, and government schemes">
          <Button onClick={() => setShowAddDialog(true)}><Plus className="h-4 w-4" />Add Provider</Button>
        </PageHeader>
      </motion.div>

      <motion.div variants={item}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search providers by name or code..." />
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div variants={item}>
          <EmptyState icon={<Building2 className="h-6 w-6" />} title="No providers found" description={search ? 'Try a different search term' : 'Add your first provider to get started'} action={!search ? { label: 'Add Provider', onClick: () => setShowAddDialog(true) } : undefined} />
        </motion.div>
      ) : (
        <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((provider) => (
            <Card key={provider.id} onClick={() => setSelectedProvider(provider)} className="cursor-pointer transition-all bg-[#15181D] border border-[rgba(255,255,255,0.06)] hover:shadow-[0_0_20px_rgba(143,211,209,0.1)] hover:border-[rgba(143,211,209,0.2)]">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Avatar className="h-12 w-12 rounded-xl">
                    <AvatarFallback className="rounded-xl bg-cyan-500/10 text-cyan-300 text-base">{provider.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <StatusBadge status={provider.isActive ? 'ACTIVE' : 'INACTIVE'} size="sm" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/90">{provider.name}</p>
                  <p className="text-xs text-white/50">Code: {provider.code}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" size="sm" className={typeColors[provider.type]}>{provider.type}</Badge>
                  <Badge variant="secondary" size="sm">{provider.plans?.length ?? 0} Plans</Badge>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
      )}

      <Dialog open={!!selectedProvider} onOpenChange={(o) => { if (!o) setSelectedProvider(null); }}>
        <DialogContent className="max-w-md bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <DialogHeader>
            <DialogTitle className="text-white/90">{selectedProvider?.name}</DialogTitle>
            <DialogDescription className="text-white/50">Provider details and associated plans</DialogDescription>
          </DialogHeader>
          {selectedProvider && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-white/50">Code</span><p className="font-medium text-white/90">{selectedProvider.code}</p></div>
                <div><span className="text-white/50">Type</span><p><Badge variant="outline" size="sm" className={typeColors[selectedProvider.type]}>{selectedProvider.type}</Badge></p></div>
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-white/40" /><span className="text-white/60">{selectedProvider.phone ?? '—'}</span></div>
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-white/40" /><span className="text-white/60">{selectedProvider.email ?? '—'}</span></div>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-xs font-medium text-white/50 mb-2">Plans ({selectedProvider.plans?.length ?? 0})</p>
                {(!selectedProvider.plans || selectedProvider.plans.length === 0) ? (
                  <p className="text-xs text-white/40">No plans associated yet</p>
                ) : selectedProvider.plans.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between py-1.5 text-sm">
                    <span className="text-white/70">{plan.name}</span>
                    <span className="text-white/50 text-xs">₹{plan.maxSumInsured.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <DialogHeader>
            <DialogTitle className="text-white/90">Add Insurance Provider</DialogTitle>
            <DialogDescription className="text-white/50">Enter the details of the new provider</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-white/50 mb-1 block">Provider Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. New India Assurance" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-white/50 mb-1 block">Code</label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. NIA" />
              </div>
              <div>
                <label className="text-xs font-medium text-white/50 mb-1 block">Type</label>
                <Select value={form.type} onValueChange={(v: InsuranceProviderType) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GOVT">Government</SelectItem>
                    <SelectItem value="PRIVATE">Private</SelectItem>
                    <SelectItem value="TPA">TPA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-white/50 mb-1 block">Phone</label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Contact number" />
              </div>
              <div>
                <label className="text-xs font-medium text-white/50 mb-1 block">Email</label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowAddDialog(false); setForm({ name: '', code: '', type: 'PRIVATE', phone: '', email: '' }); }}>Save Provider</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
