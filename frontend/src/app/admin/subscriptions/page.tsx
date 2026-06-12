/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/admin/subscriptions/page.tsx
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
 - card
 - react
 - badge
 - skeleton
 - lucide-react
 - stat-card
 *
 * Dependencies:
 - status-badge
 - data-table
 - card
 - react
 - badge
 - skeleton
 - lucide-react
 - stat-card
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
import { CreditCard, Users, IndianRupee, TrendingDown, Zap, Shield, Star, Activity, } from 'lucide-react';
import { motion } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable } from '@/components/ui/data-table';

import type { ColumnDef } from '@tanstack/react-table';

const MOCK_METRICS = {
  activeSubscribers: 4250,
  mrr: 1825000,
  churnRate: 2.4,
};

interface Plan {
  id: string;
  name: string;
  price: number;
  activeSubscribers: number;
  revenue: number;
  icon: typeof Zap;
  color: string;
}

const MOCK_PLANS: Plan[] = [
  { id: 'p1', name: 'Free', price: 0, activeSubscribers: 1850, revenue: 0, icon: Star, color: 'text-white/50' },
  { id: 'p2', name: 'Basic', price: 299, activeSubscribers: 1200, revenue: 358800, icon: Shield, color: 'text-blue-500' },
  { id: 'p3', name: 'Pro', price: 599, activeSubscribers: 850, revenue: 509150, icon: Zap, color: 'text-amber-500' },
  { id: 'p4', name: 'Enterprise', price: 1499, activeSubscribers: 350, revenue: 524650, icon: Activity, color: 'text-purple-500' },
];

const MOCK_CHANGES = [
  { id: 'c1', user: 'Dr. Ananya Sharma', plan: 'Free → Pro', amount: '+₹599', date: new Date(Date.now() - 86400000).toISOString(), status: 'ACTIVE' },
  { id: 'c2', user: 'City Medical Centre', plan: 'Pro → Enterprise', amount: '+₹900', date: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'ACTIVE' },
  { id: 'c3', user: 'MedPlus Pharmacy', plan: 'Basic → Free', amount: '-₹299', date: new Date(Date.now() - 3 * 86400000).toISOString(), status: 'CANCELLED' },
  { id: 'c4', user: 'Metro Labs', plan: 'Enterprise', amount: '+₹1,499', date: new Date(Date.now() - 5 * 86400000).toISOString(), status: 'ACTIVE' },
  { id: 'c5', user: 'Dr. Rahul Verma', plan: 'Free → Basic', amount: '+₹299', date: new Date(Date.now() - 7 * 86400000).toISOString(), status: 'ACTIVE' },
  { id: 'c6', user: 'HealthNet TPA', plan: 'Pro', amount: '+₹599', date: new Date(Date.now() - 10 * 86400000).toISOString(), status: 'PENDING' },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const changesColumns: ColumnDef<typeof MOCK_CHANGES[0]>[] = [
  { accessorKey: 'user', header: 'User', cell: ({ row }) => <span className="font-medium text-white">{row.original.user}</span> },
  { accessorKey: 'plan', header: 'Plan Change', cell: ({ row }) => <Badge variant="outline">{row.original.plan}</Badge> },
  { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => <span className={row.original.amount.startsWith('+') ? 'text-[#2EE59D] font-medium' : 'text-red-500 font-medium'}>{row.original.amount}</span> },
  { accessorKey: 'date', header: 'Date', cell: ({ row }) => <span className="text-xs text-white/50">{new Date(row.original.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span> },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" /> },
];

export default function SubscriptionsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-72" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <Skeleton className="h-48 w-full" />
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <PageHeader title="Subscription Management" description="Monitor plans, revenue, and subscriber changes" />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={<Users className="h-5 w-5" />} label="Active Subscribers" value={MOCK_METRICS.activeSubscribers.toLocaleString('en-IN')} trend={{ direction: 'up', value: '5.2% this month' }} />
        <StatCard icon={<IndianRupee className="h-5 w-5" />} label="MRR" value={`₹${(MOCK_METRICS.mrr / 100000).toFixed(1)}L`} trend={{ direction: 'up', value: '8.3% growth' }} />
        <StatCard icon={<TrendingDown className="h-5 w-5" />} label="Churn Rate" value={`${MOCK_METRICS.churnRate}%`} trend={{ direction: 'down', value: '0.3% improvement' }} />
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><CreditCard className="h-4 w-4 text-[#8FD3D1]" />Plans Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {MOCK_PLANS.map((plan) => (
                <div key={plan.id} className="rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] p-5 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] ${plan.color}`}>
                      <plan.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{plan.name}</p>
                      <p className="text-xs text-white/40">{plan.activeSubscribers} subscribers</p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">₹{plan.price.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-white/40">/mo</span>
                  </div>
                  <div className="mt-3 text-xs text-white/50">Revenue: ₹{plan.revenue.toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4 text-[#8FD3D1]" />Recent Subscription Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={changesColumns} data={MOCK_CHANGES} emptyTitle="No recent changes" />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
