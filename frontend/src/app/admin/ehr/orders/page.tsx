/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/admin/ehr/orders/page.tsx
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
 - frontend/src/hooks/use-emergency.ts
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 *
 * Calls:
 - react-query
 - card
 - select
 - react
 - badge
 - skeleton
 - api-client
 - button
 *
 * Dependencies:
 - react-query
 - card
 - select
 - react
 - badge
 - skeleton
 - api-client
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

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';

import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api-client';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const typeColors: Record<string, string> = {
  LAB: 'bg-blue-500/20 text-blue-300', IMAGING: 'bg-purple-500/20 text-purple-300',
  MEDICATION: 'bg-green-500/20 text-green-300', PROCEDURE: 'bg-amber-500/20 text-amber-300',
  REFERRAL: 'bg-rose-500/20 text-rose-300',
};

export default function OrdersPage() {
  const [patientId, setPatientId] = useState('');
  const [searchId, setSearchId] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data: stats } = useQuery({ queryKey: ['ehr-ord-stats'], queryFn: () => api.getOrderStats() });
  const { data: orders, isLoading } = useQuery({
    queryKey: ['ehr-orders', searchId, typeFilter],
    queryFn: () => api.listOrders(searchId, typeFilter || undefined),
    enabled: !!searchId,
  });

  const handleSearch = () => { if (patientId.trim()) setSearchId(patientId.trim()); };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
      <PageHeader title="Clinical Orders" description="Lab, imaging, medication, procedure, and referral orders">
        <div className="flex gap-2">
          <Input placeholder="Patient ID..." value={patientId} onChange={(e) => setPatientId(e.target.value)} className="w-48" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          <Button onClick={handleSearch}><Search className="h-4 w-4 mr-1" />Search</Button>
        </div>
      </PageHeader>

      <motion.div variants={item} className="grid gap-4 md:grid-cols-4">
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]"><CardHeader className="pb-2"><CardTitle className="text-xs text-white/50">Total Orders</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-white/90">{(stats?.total as number) ?? 0}</p></CardContent></Card>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]"><CardHeader className="pb-2"><CardTitle className="text-xs text-white/50">By Type</CardTitle></CardHeader><CardContent><div className="space-y-1 text-white/60">{stats?.typeDistribution ? Object.entries(stats.typeDistribution as Record<string, number>).map(([k, v]) => <div key={k} className="flex justify-between text-xs"><span>{k}</span><span>{v}</span></div>) : null}</div></CardContent></Card>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]"><CardHeader className="pb-2"><CardTitle className="text-xs text-white/50">By Status</CardTitle></CardHeader><CardContent><div className="space-y-1 text-white/60">{stats?.statusDistribution ? Object.entries(stats.statusDistribution as Record<string, number>).map(([k, v]) => <div key={k} className="flex justify-between text-xs"><span>{k}</span><span>{v}</span></div>) : null}</div></CardContent></Card>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]"><CardHeader className="pb-2"><CardTitle className="text-xs text-white/50">By Priority</CardTitle></CardHeader><CardContent><div className="space-y-1 text-white/60">{stats?.priorityDistribution ? Object.entries(stats.priorityDistribution as Record<string, number>).map(([k, v]) => <div key={k} className="flex justify-between text-xs"><span>{k}</span><span>{v}</span></div>) : null}</div></CardContent></Card>
      </motion.div>

      {searchId && (
        <motion.div variants={item}>
          <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-white/90">Orders for {searchId} ({orders?.length ?? 0})</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32"><SelectValue placeholder="All types" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">All types</SelectItem>
                    <SelectItem value="LAB">Lab</SelectItem>
                    <SelectItem value="IMAGING">Imaging</SelectItem>
                    <SelectItem value="MEDICATION">Medication</SelectItem>
                    <SelectItem value="PROCEDURE">Procedure</SelectItem>
                    <SelectItem value="REFERRAL">Referral</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" />New Order</Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-40 bg-white/5" /> : !orders?.length ? <p className="text-sm text-white/50">No orders found</p> : (
                <div className="space-y-2">
                  {orders.map((o: any) => (
                    <div key={o.id} className="flex items-center justify-between rounded border border-white/5 p-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={typeColors[o.orderType] ?? ''}>{o.orderType}</Badge>
                          <Badge variant="outline">{o.status}</Badge>
                          <span className="text-sm font-medium text-white/70">{o.title}</span>
                          <Badge variant="secondary" className="text-[10px] text-white/60">{o.priority}</Badge>
                        </div>
                        {o.description && <p className="text-xs text-white/50">{o.description}</p>}
                        <div className="flex gap-3 text-xs text-white/50">
                          <span>Ordered by: {o.orderedById?.slice(0, 8)}...</span>
                          {o.completedAt && <span>Completed: {new Date(o.completedAt).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      {o.resultSummary && <p className="max-w-[200px] truncate text-xs text-white/50">{o.resultSummary}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
