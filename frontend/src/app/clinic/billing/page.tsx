/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/clinic/billing/page.tsx
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
 - card
 - empty-state
 - stat-card
 - react
 - invoice-card
 - button
 - input
 *
 * Dependencies:
 - tabs
 - card
 - empty-state
 - stat-card
 - react
 - invoice-card
 - button
 - input
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
import {
  FileText,
  Plus,
  IndianRupee,
  Trash2,
  Receipt,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle, } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { InvoiceCard } from '@/components/clinic/invoice-card';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { StatCard } from '@/components/ui/stat-card';
import type { BillingInvoice, InvoiceStatus } from '@/types';

const MOCK_INVOICES: BillingInvoice[] = [
  {
    id: 'inv-1', clinicId: 'clinic-1', patientUserId: 'p1', invoiceNumber: 'INV-2026-001',
    status: 'PAID', subtotal: 1200, taxAmount: 120, discountAmount: 0, totalAmount: 1320,
    paidAmount: 1320, dueAmount: 0, items: [
      { id: 'li-1', invoiceId: 'inv-1', description: 'General Consultation', category: 'CONSULTATION', quantity: 1, unitPrice: 800, totalPrice: 800, taxPercent: 10, taxAmount: 80, netPrice: 880 },
      { id: 'li-2', invoiceId: 'inv-1', description: 'Blood Test - CBC', category: 'LAB_TEST', quantity: 1, unitPrice: 400, totalPrice: 400, taxPercent: 10, taxAmount: 40, netPrice: 440 },
    ], issuedAt: '2026-06-04T10:00:00Z',
  },
  {
    id: 'inv-2', clinicId: 'clinic-1', patientUserId: 'p2', invoiceNumber: 'INV-2026-002',
    status: 'PENDING', subtotal: 2500, taxAmount: 250, discountAmount: 0, totalAmount: 2750,
    paidAmount: 0, dueAmount: 2750, items: [
      { id: 'li-3', invoiceId: 'inv-2', description: 'Specialist Consultation', category: 'CONSULTATION', quantity: 1, unitPrice: 1500, totalPrice: 1500, taxPercent: 10, taxAmount: 150, netPrice: 1650 },
      { id: 'li-4', invoiceId: 'inv-2', description: 'X-Ray Chest', category: 'LAB_TEST', quantity: 1, unitPrice: 1000, totalPrice: 1000, taxPercent: 10, taxAmount: 100, netPrice: 1100 },
    ], issuedAt: '2026-06-04T11:00:00Z',
  },
  {
    id: 'inv-3', clinicId: 'clinic-1', patientUserId: 'p3', invoiceNumber: 'INV-2026-003',
    status: 'REFUNDED', subtotal: 800, taxAmount: 80, discountAmount: 0, totalAmount: 880,
    paidAmount: 880, dueAmount: 0, items: [
      { id: 'li-5', invoiceId: 'inv-3', description: 'Follow-up Consultation', category: 'CONSULTATION', quantity: 1, unitPrice: 800, totalPrice: 800, taxPercent: 10, taxAmount: 80, netPrice: 880 },
    ], issuedAt: '2026-06-03T09:00:00Z',
  },
  {
    id: 'inv-4', clinicId: 'clinic-1', patientUserId: 'p4', invoiceNumber: 'INV-2026-004',
    status: 'PENDING', subtotal: 3200, taxAmount: 320, discountAmount: 200, totalAmount: 3320,
    paidAmount: 0, dueAmount: 3320, items: [
      { id: 'li-6', invoiceId: 'inv-4', description: 'ECG', category: 'LAB_TEST', quantity: 1, unitPrice: 600, totalPrice: 600, taxPercent: 10, taxAmount: 60, netPrice: 660 },
      { id: 'li-7', invoiceId: 'inv-4', description: 'Stress Test', category: 'PROCEDURE', quantity: 1, unitPrice: 2000, totalPrice: 2000, taxPercent: 10, taxAmount: 200, netPrice: 2200 },
      { id: 'li-8', invoiceId: 'inv-4', description: 'Consultation', category: 'CONSULTATION', quantity: 1, unitPrice: 600, totalPrice: 600, taxPercent: 10, taxAmount: 60, netPrice: 660 },
    ], issuedAt: '2026-06-02T14:00:00Z',
  },
];

const MOCK_PATIENTS = ['Ananya Sharma', 'Rahul Verma', 'Priya Patel', 'Amit Kumar', 'Sneha Reddy'];

interface InvoiceItem {
  id: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
}

interface PaymentDialog {
  open: boolean;
  invoiceId: string;
  amount: number;
  method: string;
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState(MOCK_INVOICES);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<BillingInvoice | null>(null);
  const [payment, setPayment] = useState<PaymentDialog>({ open: false, invoiceId: '', amount: 0, method: 'CASH' });
  const [activeTab, setActiveTab] = useState('all');

  const [formPatient, setFormPatient] = useState('');
  const [formItems, setFormItems] = useState<InvoiceItem[]>([
    { id: 'new-1', description: '', category: 'CONSULTATION', quantity: 1, unitPrice: 0 },
  ]);

  const filteredInvoices = activeTab === 'all' ? invoices : invoices.filter((inv) => {
    if (activeTab === 'pending') return inv.status === 'PENDING';
    if (activeTab === 'paid') return inv.status === 'PAID';
    if (activeTab === 'refunded') return inv.status === 'REFUNDED';
    return true;
  });

  const todayCollections = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.paidAmount, 0);

  function addItem() {
    setFormItems((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, description: '', category: 'CONSULTATION', quantity: 1, unitPrice: 0 },
    ]);
  }

  function removeItem(id: string) {
    setFormItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateItem(id: string, field: keyof InvoiceItem, value: string | number) {
    setFormItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  }

  function handleCreateInvoice() {
    if (!formPatient || formItems.some((i) => !i.description || i.unitPrice <= 0)) return;
    const subtotal = formItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const taxAmount = Math.round(subtotal * 0.1);
    const totalAmount = subtotal + taxAmount;
    const newInv: BillingInvoice = {
      id: `inv-${Date.now()}`,
      clinicId: 'clinic-1',
      patientUserId: 'p-new',
      invoiceNumber: `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`,
      status: 'PENDING',
      subtotal,
      taxAmount,
      discountAmount: 0,
      totalAmount,
      paidAmount: 0,
      dueAmount: totalAmount,
      items: formItems.map((item) => ({
        id: `li-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        invoiceId: '',
        description: item.description,
        category: item.category as any,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
        taxPercent: 10,
        taxAmount: Math.round(item.quantity * item.unitPrice * 0.1),
        netPrice: item.quantity * item.unitPrice + Math.round(item.quantity * item.unitPrice * 0.1),
      })),
      issuedAt: new Date().toISOString(),
    };
    setInvoices((prev) => [newInv, ...prev]);
    setCreateOpen(false);
    setFormPatient('');
    setFormItems([{ id: 'new-1', description: '', category: 'CONSULTATION', quantity: 1, unitPrice: 0 }]);
  }

  function handleRecordPayment() {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === payment.invoiceId
          ? { ...inv, status: 'PAID' as InvoiceStatus, paidAmount: inv.totalAmount, dueAmount: 0, paidAt: new Date().toISOString() }
          : inv,
      ),
    );
    setPayment({ open: false, invoiceId: '', amount: 0, method: 'CASH' });
    setSelectedInvoice(null);
  }

  if (selectedInvoice) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <button onClick={() => setSelectedInvoice(null)} className="text-sm text-[#8FD3D1] hover:text-[#8FD3D1]/80 transition-colors">
          &larr; Back to Invoices
        </button>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <InvoiceCard invoice={selectedInvoice} />
          </div>
          <div className="space-y-4">
            {selectedInvoice.status === 'PENDING' && (
              <Button
                variant="default"
                className="w-full"
                onClick={() => setPayment({ open: true, invoiceId: selectedInvoice.id, amount: selectedInvoice.dueAmount, method: 'CASH' })}
              >
                Record Payment
              </Button>
            )}
            <Button variant="outline" className="w-full">
              <Receipt className="h-4 w-4" />
              Print Invoice
            </Button>
          </div>
        </div>

        <Dialog open={payment.open} onOpenChange={(open) => setPayment({ ...payment, open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>Record payment for invoice {selectedInvoice.invoiceNumber}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-medium text-white/70">Amount</label>
                <Input
                  type="number"
                  value={payment.amount}
                  onChange={(e) => setPayment({ ...payment, amount: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-white/70">Payment Method</label>
                <Select value={payment.method} onValueChange={(v) => setPayment({ ...payment, method: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="INSURANCE">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleRecordPayment}>
                  Confirm Payment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Billing OS" description="Manage invoices and payments">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm">
              <Plus className="h-4 w-4" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Invoice</DialogTitle>
              <DialogDescription>Generate a new invoice for a patient</DialogDescription>
            </DialogHeader>
            <div className="space-y-5 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">Patient</label>
                <Select value={formPatient} onValueChange={setFormPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_PATIENTS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-white/70">Invoice Items</label>
                  <Button variant="ghost" size="sm" onClick={addItem}>
                    <Plus className="h-3.5 w-3.5" />
                    Add Item
                  </Button>
                </div>
                {formItems.map((item) => (
                  <div key={item.id} className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-white/50">Line Item</span>
                      {formItems.length > 1 && (
                        <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <Input
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        />
                      </div>
                      <Select
                        value={item.category}
                        onValueChange={(v) => updateItem(item.id, 'category', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CONSULTATION">Consultation</SelectItem>
                          <SelectItem value="LAB_TEST">Lab Test</SelectItem>
                          <SelectItem value="PROCEDURE">Procedure</SelectItem>
                          <SelectItem value="MEDICATION">Medication</SelectItem>
                          <SelectItem value="VACCINATION">Vaccination</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                      />
                      <Input
                        type="number"
                        placeholder="Unit Price"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-white/[0.04] p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Subtotal</span>
                  <span className="font-medium text-white">₹{formItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Tax (10%)</span>
                  <span className="font-medium text-white">₹{Math.round(formItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0) * 0.1).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-white">₹{Math.round(formItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0) * 1.1).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreateInvoice} disabled={!formPatient || formItems.some((i) => !i.description || i.unitPrice <= 0)}>
                  Create Invoice
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<IndianRupee className="h-5 w-5" />}
          label="Today's Collections"
          value={`₹${todayCollections.toLocaleString('en-IN')}`}
          trend={{ direction: 'up', value: '3 invoices paid' }}
        />
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Pending Invoices"
          value={invoices.filter((i) => i.status === 'PENDING').length}
          trend={{ direction: 'neutral', value: 'Awaiting payment' }}
        />
        <StatCard
          icon={<IndianRupee className="h-5 w-5" />}
          label="Total Outstanding"
          value={`₹${invoices.filter((i) => i.status === 'PENDING').reduce((s, i) => s + i.dueAmount, 0).toLocaleString('en-IN')}`}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({invoices.filter((i) => i.status === 'PENDING').length})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({invoices.filter((i) => i.status === 'PAID').length})</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Report</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Revenue Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50">Total Revenue (All Time)</span>
                  <span className="text-lg font-bold text-white">₹{invoices.reduce((s, i) => s + i.paidAmount, 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50">Outstanding</span>
                  <span className="text-lg font-bold text-red-500">₹{invoices.filter((i) => i.status === 'PENDING').reduce((s, i) => s + i.dueAmount, 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50">Refunded</span>
                  <span className="text-lg font-bold text-white/50">₹{invoices.filter((i) => i.status === 'REFUNDED').reduce((s, i) => s + i.totalAmount, 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="rounded-xl bg-white/[0.04] p-4">
                  <p className="text-xs text-white/50">Collection Rate</p>
                  <div className="mt-2 h-2.5 w-full rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-[#8FD3D1] transition-all"
                      style={{
                        width: `${invoices.length > 0
                          ? Math.round((invoices.filter((i) => i.status === 'PAID').length / invoices.length) * 100)
                          : 0}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-right text-xs text-white/40">
                    {invoices.length > 0
                      ? Math.round((invoices.filter((i) => i.status === 'PAID').length / invoices.length) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value={activeTab}>
          {filteredInvoices.length === 0 ? (
            <EmptyState icon={<FileText className="h-6 w-6" />} title="No invoices found" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredInvoices.map((inv) => (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <InvoiceCard invoice={inv} onClick={() => setSelectedInvoice(inv)} />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
