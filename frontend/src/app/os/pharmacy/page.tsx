/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/os/pharmacy/page.tsx
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
 - card
 - react
 - badge
 - button
 - input
 - framer-motion
 *
 * Dependencies:
 - tabs
 - status-badge
 - card
 - react
 - badge
 - button
 - input
 - framer-motion
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
  Pill,
  Package,
  AlertTriangle,
  ClipboardList,
  ShoppingCart,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

import { PageHeader } from '@/components/ui/page-header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

interface QueueItem {
  id: string;
  patient: string;
  medication: string;
  time: string;
}

const QUEUE_NEW: QueueItem[] = [
  { id: 'Rx-001', patient: 'Priya Sharma', medication: 'Paracetamol 500mg', time: '08:15 AM' },
  { id: 'Rx-002', patient: 'Rahul Verma', medication: 'Amoxicillin', time: '08:42 AM' },
];

const QUEUE_PROCESSING: QueueItem[] = [
  { id: 'Rx-003', patient: 'Anita Desai', medication: 'Metformin', time: '07:30 AM' },
];

const QUEUE_READY: QueueItem[] = [
  { id: 'Rx-004', patient: 'Vikram Singh', medication: 'Omeprazole', time: '07:00 AM' },
];

const QUEUE_COMPLETED: QueueItem[] = [
  { id: 'Rx-005', patient: 'Meera Joshi', medication: 'Atorvastatin', time: '06:45 AM' },
];

interface InventoryItem {
  name: string;
  stock: number;
  batch: string;
  expiry: string;
  vendor: string;
}

const INVENTORY_ITEMS: InventoryItem[] = [
  { name: 'Amoxicillin', stock: 3, batch: 'BX-001', expiry: '12/2026', vendor: 'MediCorp' },
  { name: 'Paracetamol', stock: 45, batch: 'BX-002', expiry: '08/2027', vendor: 'PharmaPlus' },
  { name: 'Metformin', stock: 12, batch: 'BX-003', expiry: '03/2027', vendor: 'HealthRx' },
  { name: 'Insulin Glargine', stock: 2, batch: 'BX-004', expiry: '09/2026', vendor: 'BioGen' },
  { name: 'Atorvastatin', stock: 28, batch: 'BX-005', expiry: '11/2026', vendor: 'MediCorp' },
];

const PO_RECORDS = [
  { id: 'PO-001', supplier: 'MediCorp', items: 'Amoxicillin, Paracetamol', total: 12500, status: 'ORDERED' },
  { id: 'PO-002', supplier: 'PharmaPlus', items: 'Metformin', total: 8400, status: 'RECEIVED' },
  { id: 'PO-003', supplier: 'BioGen', items: 'Insulin Glargine', total: 22000, status: 'CANCELLED' },
];

function getStockLevel(stock: number): { label: string; color: string } {
  if (stock <= 5) return { label: 'Critical', color: 'text-red-300 bg-red-500/20 border-red-500/30' };
  if (stock <= 15) return { label: 'Warning', color: 'text-amber-300 bg-amber-500/20 border-amber-500/30' };
  return { label: 'Healthy', color: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30' };
}

function getStockBarColor(stock: number): string {
  if (stock <= 5) return 'bg-red-500';
  if (stock <= 15) return 'bg-amber-500';
  return 'bg-emerald-500';
}

function DispensingQueue() {
  const [search, setSearch] = useState('');

  const columns = [
    { title: 'New', icon: Clock, data: QUEUE_NEW, color: 'text-blue-300' },
    { title: 'Processing', icon: Pill, data: QUEUE_PROCESSING, color: 'text-amber-300' },
    { title: 'Ready', icon: CheckCircle, data: QUEUE_READY, color: 'text-emerald-300' },
    { title: 'Completed', icon: XCircle, data: QUEUE_COMPLETED, color: 'text-slate-300' },
  ];

  const filterFn = (q: QueueItem) =>
    q.id.toLowerCase().includes(search.toLowerCase()) ||
    q.patient.toLowerCase().includes(search.toLowerCase()) ||
    q.medication.toLowerCase().includes(search.toLowerCase());

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Search prescriptions..."
            className="h-12 pl-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>
      <motion.div variants={item} className="flex gap-4 overflow-x-auto pb-2">
        {columns.map((col) => (
          <div key={col.title} className="min-w-[280px] flex-1">
            <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
              <CardHeader className="border-b border-white/5 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <col.icon className={`h-4 w-4 ${col.color}`} />
                    <CardTitle className="text-sm font-semibold text-white/90">{col.title}</CardTitle>
                  </div>
                  <Badge size="sm">{col.data.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                {col.data.length === 0 ? (
                  <p className="py-6 text-center text-sm text-white/40">No prescriptions</p>
                ) : (
                  <div className="space-y-3">
                    {col.data.filter(filterFn).map((rx) => (
                      <div
                        key={rx.id}
                        className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-white/50">{rx.id}</span>
                          <span className="text-[11px] text-white/40">{rx.time}</span>
                        </div>
                        <p className="font-medium text-white/90">{rx.patient}</p>
                        <p className="text-xs text-white/50">{rx.medication}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {col.title === 'New' && (
                            <Button size="sm" variant="default">
                              <Plus className="h-3 w-3" />
                              Accept
                            </Button>
                          )}
                          {col.title === 'Processing' && (
                            <>
                              <Button size="sm" variant="default">
                                <Pill className="h-3 w-3" />
                                Dispense
                              </Button>
                              <Button size="sm" variant="outline">
                                <CheckCircle className="h-3 w-3" />
                                Mark Ready
                              </Button>
                            </>
                          )}
                          {col.title === 'Ready' && (
                            <Button size="sm" variant="default">
                              <CheckCircle className="h-3 w-3" />
                              Deliver
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

function Inventory() {
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [updateValue, setUpdateValue] = useState('');

  const filtered = INVENTORY_ITEMS.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.batch.toLowerCase().includes(search.toLowerCase()) ||
      i.vendor.toLowerCase().includes(search.toLowerCase()),
  );

  const handleUpdate = (name: string) => {
    setUpdating(name);
    setUpdateValue('');
  };

  const handleSave = () => {
    setUpdating(null);
    setUpdateValue('');
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Search inventory..."
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
                    <th className="px-4 py-3">Item Name</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Batch#</th>
                    <th className="px-4 py-3">Expiry</th>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const level = getStockLevel(item.stock);
                    return (
                      <tr
                        key={item.name}
                        className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-3 font-medium text-white/90">{item.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{item.stock}</span>
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/5">
                              <div
                                className={`h-full rounded-full transition-all ${getStockBarColor(item.stock)}`}
                                style={{ width: `${Math.min((item.stock / 50) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white/60">{item.batch}</td>
                        <td className="px-4 py-3 text-white/60">{item.expiry}</td>
                        <td className="px-4 py-3 text-white/60">{item.vendor}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${level.color}`}
                          >
                            {level.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {updating === item.name ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                className="h-8 w-20"
                                value={updateValue}
                                onChange={(e) => setUpdateValue(e.target.value)}
                                placeholder="Qty"
                              />
                              <Button size="sm" variant="default" onClick={handleSave}>
                                Save
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setUpdating(null)}>
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => handleUpdate(item.name)}>
                              Update Stock
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function LowStockAlerts() {
  const critical = INVENTORY_ITEMS.filter((i) => i.stock <= 5);
  const warning = INVENTORY_ITEMS.filter((i) => i.stock > 5 && i.stock <= 15);
  const healthy = INVENTORY_ITEMS.filter((i) => i.stock > 15);

  const sections = [
    { title: 'Critical', data: critical, border: 'border-red-400 bg-red-500/[0.04]', badge: 'danger', icon: AlertTriangle },
    { title: 'Warning', data: warning, border: 'border-amber-400 bg-amber-500/[0.04]', badge: 'warning', icon: AlertTriangle },
    { title: 'Healthy', data: healthy, border: 'border-emerald-400 bg-emerald-500/[0.04]', badge: 'success', icon: CheckCircle },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {sections.map((sec) => (
        <motion.div key={sec.title} variants={item}>
          <Card className={`border-l-4 ${sec.border}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <sec.icon className="h-4 w-4 text-white/60" />
                  <CardTitle className="text-sm font-semibold text-white/90">{sec.title}</CardTitle>
                </div>
                <Badge variant={sec.badge as 'danger' | 'warning' | 'success'} size="sm">
                  {sec.data.length} items
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {sec.data.length === 0 ? (
                <p className="py-3 text-center text-sm text-white/40">No items</p>
              ) : (
                <div className="space-y-3">
                  {sec.data.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#15181D] p-4"
                    >
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-white/90">{item.name}</p>
                        <p className="text-xs text-white/50">
                          Stock: <span className="font-semibold">{item.stock}</span> &middot; Batch: {item.batch} &middot; Vendor: {item.vendor}
                        </p>
                      </div>
                      {(sec.title === 'Critical' || sec.title === 'Warning') && (
                        <Button size="sm" variant="default">
                          <ShoppingCart className="h-3 w-3" />
                          Place Order
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

function Procurement() {
  const [supplier, setSupplier] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [notes, setNotes] = useState('');

  const handleCreatePO = () => {
    setSupplier('');
    setItemName('');
    setQuantity('');
    setUnitPrice('');
    setNotes('');
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white/90">Create Purchase Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Supplier</label>
                <Input
                  placeholder="Supplier name"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Item Name</label>
                <Input
                  placeholder="e.g. Amoxicillin"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Quantity</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Unit Price</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Notes</label>
                <Input
                  placeholder="Additional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-white/50">
                Total Cost: <span className="font-semibold text-white/90">
                  ₹{(Number(quantity) * Number(unitPrice)).toLocaleString()}
                </span>
              </p>
              <Button onClick={handleCreatePO}>
                <Plus className="h-4 w-4" />
                Create Purchase Order
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white/90">Recent Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {PO_RECORDS.map((po) => (
                <div
                  key={po.id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4"
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-white/90">{po.id}</p>
                    <p className="text-xs text-white/50">
                      {po.supplier} &middot; {po.items} &middot; ₹{po.total.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={po.status} />
                    {po.status === 'ORDERED' && (
                      <Button size="sm" variant="default">
                        <CheckCircle className="h-3 w-3" />
                        Mark Received
                      </Button>
                    )}
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

export default function PharmacyWorkspacePage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="bg-[#0B0D10] min-h-screen space-y-6">
      <PageHeader title="Pharmacy Workspace" description="Dispensing & Inventory Management" />

      <Tabs defaultValue="dispensing">
        <TabsList className="w-full overflow-x-auto">
          <TabsTrigger value="dispensing" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Dispensing Queue
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2">
            <Package className="h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Low Stock Alerts
          </TabsTrigger>
          <TabsTrigger value="procurement" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Procurement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dispensing">
          <DispensingQueue />
        </TabsContent>
        <TabsContent value="inventory">
          <Inventory />
        </TabsContent>
        <TabsContent value="alerts">
          <LowStockAlerts />
        </TabsContent>
        <TabsContent value="procurement">
          <Procurement />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
