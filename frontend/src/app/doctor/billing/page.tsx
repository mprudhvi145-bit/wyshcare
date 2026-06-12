/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/doctor/billing/page.tsx
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
 - utils
 - lucide-react
 - react
 *
 * Dependencies:
 - utils
 - lucide-react
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

import { useState, useMemo } from 'react';
import { DollarSign, FileText, CheckCircle2, AlertCircle, Search, Filter, ArrowUpRight, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const accentColor = '#AF52DE';
const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D]/80 backdrop-blur-xl';

interface Invoice {
  id: string;
  patient: string;
  specialty: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'denied' | 'draft';
  insuranceProvider?: string;
  denialReason?: string;
}

const INITIAL_INVOICES: Invoice[] = [
  { id: 'INV-2026-001', patient: 'Rahul Verma', specialty: 'Dental', date: '2026-06-10', amount: 350.00, status: 'paid', insuranceProvider: 'Star Health' },
  { id: 'INV-2026-002', patient: 'Sneha Rao', specialty: 'Endocrinology', date: '2026-06-09', amount: 120.00, status: 'pending', insuranceProvider: 'HDFC Ergo' },
  { id: 'INV-2026-003', patient: 'Amit Sharma', specialty: 'Cardiology', date: '2026-06-08', amount: 1500.00, status: 'denied', insuranceProvider: 'ICICI Lombard', denialReason: 'Missing Modifier 25 on physical assessment link.' },
  { id: 'INV-2026-004', patient: 'Lata Mangeshkar', specialty: 'General Medicine', date: '2026-06-07', amount: 80.00, status: 'paid', insuranceProvider: 'Self Pay' },
  { id: 'INV-2026-005', patient: 'Rajesh Malhotra', specialty: 'Orthopedics', date: '2026-06-06', amount: 850.00, status: 'pending', insuranceProvider: 'Star Health' },
  { id: 'INV-2026-006', patient: 'Vikram Seth', specialty: 'Neurology', date: '2026-06-05', amount: 620.00, status: 'denied', insuranceProvider: 'Care Health', denialReason: 'Incorrect diagnostic code linked to MRI.' }
];

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'denied'>('all');
  const [denialFixIndex, setDenialFixIndex] = useState<number | null>(null);

  const stats = useMemo(() => {
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
    const pendingClaims = invoices.filter(i => i.status === 'pending').length;
    const outstandingAmount = invoices.filter(i => i.status === 'pending' || i.status === 'denied').reduce((acc, curr) => acc + curr.amount, 0);
    const cleanRate = 96.2; // mock static percentage

    return { totalRevenue, pendingClaims, outstandingAmount, cleanRate };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(i => {
      const matchSearch = i.patient.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' ? true : i.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  const handleFixDenial = (id: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        return { ...inv, status: 'pending', denialReason: undefined };
      }
      return inv;
    }));
    setDenialFixIndex(null);
  };

  const deniedInvoices = useMemo(() => invoices.filter(i => i.status === 'denied'), [invoices]);

  return (
    <div className="min-h-full space-y-4 p-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-white font-display">Financial & Claims Control</h1>
          <p className="text-[10px] text-white/50 font-ui">Invoicing · Insurance Claims · Revenue Cycle Assistant</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-[12px] px-3.5 py-2 text-[11px] font-semibold font-ui bg-[#AF52DE] text-[#0B0D10] transition-all hover:scale-105 active:scale-95">
          <FileText className="h-3 w-3" />
          Generate Financial Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Total revenue */}
        <div className={cn(glassCard, 'p-4 flex flex-col justify-between relative overflow-hidden')}>
          <div className="flex items-center justify-between text-white/45">
            <span className="text-[9px] font-semibold uppercase font-ui">Monthly Revenue</span>
            <DollarSign className="h-4 w-4" style={{ color: accentColor }} />
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-bold font-display">${stats.totalRevenue.toLocaleString()}</h3>
            <span className="text-[8px] text-[#2EE59D] font-semibold flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight className="h-2.5 w-2.5" /> +14.2% vs last month
            </span>
          </div>
        </div>

        {/* Pending Claims */}
        <div className={cn(glassCard, 'p-4 flex flex-col justify-between relative')}>
          <div className="flex items-center justify-between text-white/45">
            <span className="text-[9px] font-semibold uppercase font-ui">Pending Claims</span>
            <RefreshCw className="h-4 w-4 text-[#FFD84D]" />
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-bold font-display">{stats.pendingClaims}</h3>
            <span className="text-[8px] text-white/40 font-ui">Avg. 4.2 days processing</span>
          </div>
        </div>

        {/* Outstanding Invoices */}
        <div className={cn(glassCard, 'p-4 flex flex-col justify-between relative')}>
          <div className="flex items-center justify-between text-white/45">
            <span className="text-[9px] font-semibold uppercase font-ui">Outstanding Balance</span>
            <AlertCircle className="h-4 w-4 text-[#FF5A5A]" />
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-bold font-display">${stats.outstandingAmount.toLocaleString()}</h3>
            <span className="text-[8px] text-white/40 font-ui">Includes rejections & self-pay</span>
          </div>
        </div>

        {/* Clean claim rate */}
        <div className={cn(glassCard, 'p-4 flex flex-col justify-between relative')}>
          <div className="flex items-center justify-between text-white/45">
            <span className="text-[9px] font-semibold uppercase font-ui">Clean Claim Rate</span>
            <CheckCircle2 className="h-4 w-4 text-[#2EE59D]" />
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-bold font-display">{stats.cleanRate}%</h3>
            <span className="text-[8px] text-[#2EE59D] font-semibold mt-0.5">Top 5% of network providers</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Table & Claims Assistant */}
      <div className="grid grid-cols-[1.5fr_1fr] gap-4">
        {/* Invoices List */}
        <div className={cn(glassCard, 'p-5 flex flex-col min-w-0')}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold font-display">Recent Invoices</h3>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-white/30" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-[8px] border border-white/[0.06] bg-[#0B0D10]/50 p-1.5 pl-8 text-[10px] text-white focus:outline-none w-36 placeholder:text-white/20"
                />
              </div>

              {/* Status Filter */}
              <div className="flex gap-0.5 bg-white/[0.02] rounded-[8px] p-0.5 border border-white/[0.04]">
                {['all', 'paid', 'pending', 'denied'].map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s as any)}
                    className={cn(
                      'rounded-[6px] px-2 py-1 text-[8px] font-semibold font-ui uppercase transition-all',
                      statusFilter === s ? 'bg-white/[0.08] text-white' : 'text-white/40 hover:text-white/60'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[10px] font-ui">
              <thead>
                <tr className="border-b border-white/[0.06] text-white/40 font-semibold">
                  <th className="pb-2">Invoice ID</th>
                  <th className="pb-2">Patient</th>
                  <th className="pb-2">Specialty</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Provider</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-white/[0.01] transition-all">
                    <td className="py-2.5 font-mono text-white/80">{inv.id}</td>
                    <td className="py-2.5 font-bold">{inv.patient}</td>
                    <td className="py-2.5 text-white/60">{inv.specialty}</td>
                    <td className="py-2.5 text-white/40 font-mono">{inv.date}</td>
                    <td className="py-2.5 font-bold">${inv.amount.toFixed(2)}</td>
                    <td className="py-2.5 text-white/50">{inv.insuranceProvider ?? 'N/A'}</td>
                    <td className="py-2.5 text-right">
                      <span className={cn(
                        'text-[8px] font-semibold px-2 py-0.5 rounded-full uppercase',
                        inv.status === 'paid' && 'bg-[#2EE59D]/10 text-[#2EE59D]',
                        inv.status === 'pending' && 'bg-[#FFD84D]/10 text-[#FFD84D]',
                        inv.status === 'denied' && 'bg-[#FF5A5A]/10 text-[#FF5A5A]',
                        inv.status === 'draft' && 'bg-white/10 text-white/50'
                      )}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Claim Denial resolver */}
        <div className="flex flex-col gap-4">
          {/* Claim Assistant */}
          <div className={cn(glassCard, 'p-5 flex-1')}>
            <div className="flex items-center gap-1.5 mb-4 text-[#FFD84D]">
              <Sparkles className="h-4 w-4" />
              <h3 className="text-xs font-bold font-display uppercase tracking-wider">AI Claims Resolver</h3>
            </div>

            {deniedInvoices.length > 0 ? (
              <div className="space-y-4">
                <p className="text-[10px] text-white/60 leading-relaxed font-ui">
                  We detected <span className="font-bold text-[#FF5A5A]">{deniedInvoices.length} rejected claims</span>. Use our auto-resolver to inspect and repair errors.
                </p>

                <div className="space-y-3">
                  {deniedInvoices.map((inv, idx) => (
                    <div key={inv.id} className="rounded-[16px] border border-[#FF5A5A]/20 bg-[#FF5A5A]/5 p-3.5 space-y-2.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[8px] font-mono text-[#FF5A5A] font-bold uppercase block">Claim Rejection</span>
                          <span className="text-xs font-bold text-white block mt-0.5">{inv.patient} · {inv.id}</span>
                          <span className="text-[9px] text-white/40 block mt-0.5">Carrier: {inv.insuranceProvider}</span>
                        </div>
                        <span className="text-[10px] font-bold text-white font-mono">${inv.amount}</span>
                      </div>

                      <div className="text-[10px] text-white/80 bg-[#0B0D10]/50 border border-white/[0.04] p-2 rounded-[8px] font-ui">
                        <span className="text-[8px] uppercase text-white/30 block font-semibold mb-0.5">Denial Reason</span>
                        {inv.denialReason}
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button className="text-[9px] font-semibold text-white/60 hover:text-white transition-all bg-white/[0.02] border border-white/[0.06] rounded-[8px] px-2 py-1">
                          Manual Review
                        </button>
                        <button
                          onClick={() => handleFixDenial(inv.id)}
                          className="text-[9px] font-semibold text-[#0B0D10] bg-[#2EE59D] transition-all hover:scale-105 rounded-[8px] px-3 py-1 flex items-center gap-1"
                        >
                          Auto-Fix & Resubmit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-8 text-white/30 gap-2 font-ui">
                <CheckCircle2 className="h-8 w-8 text-[#2EE59D] opacity-60" />
                <p className="text-xs">No active claim rejections found. Outstanding clean rate maintained!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
