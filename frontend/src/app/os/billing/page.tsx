/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/os/billing/page.tsx
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
 - card
 - react
 - badge
 - button
 - input
 - framer-motion
 - page-header
 *
 * Dependencies:
 - status-badge
 - card
 - react
 - badge
 - button
 - input
 - framer-motion
 - page-header
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

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  FileText,
  Search,
  Printer,
  Filter,
  Clock,
  Download,
  CheckCircle,
} from 'lucide-react';

import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

// ── Mock Data ──────────────────────────────────────────
const MOCK_INVOICES = [
  { id: 'INV-001', patient: 'Ananya Sharma', amount: 12500, status: 'PAID', date: '2026-06-01' },
  { id: 'INV-002', patient: 'Ravi Patel', amount: 8400, status: 'PENDING', date: '2026-06-02' },
  { id: 'INV-003', patient: 'Meera Nair', amount: 22000, status: 'OVERDUE', date: '2026-05-28' },
  { id: 'INV-004', patient: 'Arjun Singh', amount: 5600, status: 'PAID', date: '2026-06-03' },
  { id: 'INV-005', patient: 'Priya Kapoor', amount: 18000, status: 'PENDING', date: '2026-06-04' },
  { id: 'INV-006', patient: 'Vikram Deshmukh', amount: 9400, status: 'CANCELLED', date: '2026-05-30' },
];

const MOCK_PAYMENTS = [
  { id: 'PAY-001', invoice: 'INV-001', amount: 12500, mode: 'CARD', notes: 'Credit card swiped at counter', date: '2026-06-01' },
  { id: 'PAY-002', invoice: 'INV-004', amount: 5600, mode: 'UPI', notes: 'GPay transaction', date: '2026-06-03' },
  { id: 'PAY-003', invoice: 'INV-003', amount: 5000, mode: 'CASH', notes: 'Partial payment', date: '2026-06-04' },
];

const MOCK_PENDING = [
  { id: 'INV-002', patient: 'Ravi Patel', amount: 8400, dueDate: '2026-06-12', daysOverdue: 0 },
  { id: 'INV-005', patient: 'Priya Kapoor', amount: 18000, dueDate: '2026-06-14', daysOverdue: 0 },
  { id: 'INV-003', patient: 'Meera Nair', amount: 17000, dueDate: '2026-05-28', daysOverdue: 8, partialPaid: 5000 },
];

const MOCK_SETTLEMENTS = [
  { id: 'STL-001', invoice: 'INV-001', patient: 'Ananya Sharma', amount: 12500, settledDate: '2026-06-01', mode: 'CARD' },
  { id: 'STL-002', invoice: 'INV-004', patient: 'Arjun Singh', amount: 5600, settledDate: '2026-06-03', mode: 'UPI' },
];

// ── Tab 1: Invoices ────────────────────────────────────
function Invoices() {
  const [search, setSearch] = useState('');

  const filtered = MOCK_INVOICES.filter(
    (inv) =>
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.patient.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Search invoices by ID or patient..."
            className="h-12 pl-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-left text-xs font-medium text-white/50">
                    <th className="px-4 py-3">Invoice ID</th>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => (
                    <tr key={inv.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-medium text-white/90">{inv.id}</td>
                      <td className="px-4 py-3 text-white/70">{inv.patient}</td>
                      <td className="px-4 py-3 font-medium text-white/90">₹{inv.amount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-4 py-3 text-white/50">{inv.date}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <FileText className="mr-1 h-3 w-3" />
                            View
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Printer className="mr-1 h-3 w-3" />
                            Print
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ── Tab 2: Payments ────────────────────────────────────
function Payments() {
  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('');
  const [notes, setNotes] = useState('');
  const [payments, setPayments] = useState(MOCK_PAYMENTS);

  const handleRecord = () => {
    if (!invoiceId || !amount || !mode) return;
    const newPayment = {
      id: `PAY-${String(payments.length + 1).padStart(3, '0')}`,
      invoice: invoiceId,
      amount: Number(amount),
      mode,
      notes,
      date: new Date().toISOString().split('T')[0] ?? '',
    };
    setPayments((prev) => [newPayment, ...prev]);
    setInvoiceId('');
    setAmount('');
    setMode('');
    setNotes('');
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="text-white/90">Record Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Invoice ID</label>
                <Input
                  placeholder="e.g. INV-001"
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Amount (₹)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Mode</label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="INSURANCE">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Notes</label>
                <Input
                  placeholder="Optional notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
            <div className="mt-4">
              <Button size="lg" onClick={handleRecord} disabled={!invoiceId || !amount || !mode}>
                <DollarSign className="mr-2 h-5 w-5" />
                Record Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="text-white/90">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.map((pay) => (
                <div
                  key={pay.id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4"
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-white/90">{pay.id}</p>
                    <p className="text-sm text-white/50">
                      {pay.invoice} &middot; ₹{pay.amount.toLocaleString()} &middot; {pay.mode}
                    </p>
                    {pay.notes && <p className="text-xs text-white/40">{pay.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/40">{pay.date}</span>
                    <StatusBadge status="COMPLETED" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ── Tab 3: Pending ─────────────────────────────────────
function Pending() {
  const [filter, setFilter] = useState('all');
  const [pending, _setPending] = useState(MOCK_PENDING);

  const filtered = filter === 'all' ? pending : pending.filter((p) => p.daysOverdue > 0);

  const handleReminder = (_id: string) => {
    // mock
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Filter className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="h-12 pl-11">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pending</SelectItem>
                <SelectItem value="overdue">Overdue Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-left text-xs font-medium text-white/50">
                    <th className="px-4 py-3">Invoice ID</th>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => (
                    <tr key={inv.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-medium text-white/90">{inv.id}</td>
                      <td className="px-4 py-3 text-white/70">{inv.patient}</td>
                      <td className="px-4 py-3 font-medium text-white/90">₹{inv.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-white/50">{inv.dueDate}</td>
                      <td className="px-4 py-3">
                        {inv.daysOverdue > 0 ? (
                          <Badge variant="danger">{inv.daysOverdue} days overdue</Badge>
                        ) : (
                          <Badge variant="warning">Due soon</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="default" onClick={() => handleReminder(inv.id)}>
                          <Clock className="mr-1 h-3 w-3" />
                          Send Reminder
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ── Tab 4: Settlements ─────────────────────────────────
function Settlements() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-left text-xs font-medium text-white/50">
                    <th className="px-4 py-3">Settlement ID</th>
                    <th className="px-4 py-3">Invoice</th>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Mode</th>
                    <th className="px-4 py-3">Settled Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {MOCK_SETTLEMENTS.map((stl) => (
                    <tr key={stl.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-medium text-white/90">{stl.id}</td>
                      <td className="px-4 py-3 text-white/70">{stl.invoice}</td>
                      <td className="px-4 py-3 text-white/70">{stl.patient}</td>
                      <td className="px-4 py-3 font-medium text-white/90">₹{stl.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-white/50">{stl.mode}</td>
                      <td className="px-4 py-3 text-white/50">{stl.settledDate}</td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="outline">
                          <Download className="mr-1 h-3 w-3" />
                          Receipt
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ── Page ────────────────────────────────────────────────
export default function BillingWorkspacePage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
      <PageHeader title="Billing Workspace" description="Invoices, payments, and settlements" />

      <Tabs defaultValue="invoices">
        <TabsList className="w-full overflow-x-auto">
          <TabsTrigger value="invoices" className="gap-2">
            <FileText className="h-4 w-4" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending
          </TabsTrigger>
          <TabsTrigger value="settlements" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Settlements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Invoices />
        </TabsContent>
        <TabsContent value="payments">
          <Payments />
        </TabsContent>
        <TabsContent value="pending">
          <Pending />
        </TabsContent>
        <TabsContent value="settlements">
          <Settlements />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
