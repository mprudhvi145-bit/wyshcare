/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/clinic/page.tsx
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
 - dashboard-widget
 - react
 - skeleton
 - button
 - revenue-chart
 *
 * Dependencies:
 - status-badge
 - avatar
 - card
 - dashboard-widget
 - react
 - skeleton
 - button
 - revenue-chart
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
import Link from 'next/link';
import {
  Users,
  IndianRupee,
  Calendar,
  Clock,
  LogIn,
  FileText,
  ListOrdered,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { DashboardWidget } from '@/components/dashboard/dashboard-widget';
import { RevenueChart, type RevenueDataPoint } from '@/components/clinic/revenue-chart';

const MOCK_REVENUE_DATA: RevenueDataPoint[] = [
  { label: 'Mon', revenue: 12400, consultations: 8 },
  { label: 'Tue', revenue: 18300, consultations: 12 },
  { label: 'Wed', revenue: 15700, consultations: 10 },
  { label: 'Thu', revenue: 22100, consultations: 15 },
  { label: 'Fri', revenue: 19800, consultations: 13 },
  { label: 'Sat', revenue: 14200, consultations: 9 },
  { label: 'Sun', revenue: 0, consultations: 0 },
];

const MOCK_TODAY_APPOINTMENTS = [
  { id: 'a1', patient: 'Rahul Verma', time: '10:00 AM', doctor: 'Dr. Mehta', status: 'CHECKED_IN' },
  { id: 'a2', patient: 'Priya Patel', time: '11:15 AM', doctor: 'Dr. Mehta', status: 'SCHEDULED' },
  { id: 'a3', patient: 'Amit Kumar', time: '2:00 PM', doctor: 'Dr. Sharma', status: 'SCHEDULED' },
  { id: 'a4', patient: 'Sneha Reddy', time: '3:30 PM', doctor: 'Dr. Mehta', status: 'CONFIRMED' },
  { id: 'a5', patient: 'Vikram Singh', time: '4:00 PM', doctor: 'Dr. Sharma', status: 'SCHEDULED' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const springItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function ClinicDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={springItem}>
        <PageHeader title="Clinic Dashboard" description="Overview of today's operations" />
      </motion.div>

      <motion.div variants={springItem} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Today's Patients"
          value="24"
          trend={{ direction: 'up', value: '18% vs yesterday' }}
        />
        <StatCard
          icon={<IndianRupee className="h-5 w-5" />}
          label="Revenue"
          value="₹1,02,450"
          trend={{ direction: 'up', value: '12% increase' }}
        />
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Appointments"
          value="18"
          trend={{ direction: 'neutral', value: '5 remaining' }}
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Avg Wait Time"
          value="12 min"
          trend={{ direction: 'down', value: '3 min less' }}
        />
      </motion.div>

      <motion.div variants={springItem} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <RevenueChart data={MOCK_REVENUE_DATA} />

          <DashboardWidget title="Today's Appointments" action={{ label: 'View All', onClick: () => {} }}>
            <div className="divide-y divide-white/[0.08]">
              {MOCK_TODAY_APPOINTMENTS.map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 py-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{getInitials(apt.patient)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{apt.patient}</p>
                    <p className="text-xs text-white/50">{apt.doctor}</p>
                  </div>
                  <StatusBadge status={apt.status} size="sm" />
                  <span className="text-xs text-white/40">{apt.time}</span>
                </div>
              ))}
            </div>
          </DashboardWidget>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <div className="space-y-3 px-6 pb-6">
              <Link href="/clinic/reception">
                <Button variant="default" className="w-full justify-start">
                  <LogIn className="h-4 w-4" />
                  Check-in Patient
                </Button>
              </Link>
              <Link href="/clinic/billing">
                <Button variant="secondary" className="w-full justify-start">
                  <FileText className="h-4 w-4" />
                  Create Invoice
                </Button>
              </Link>
              <Link href="/clinic/reception">
                <Button variant="outline" className="w-full justify-start">
                  <ListOrdered className="h-4 w-4" />
                  View Queue
                </Button>
              </Link>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Summary</CardTitle>
            </CardHeader>
            <div className="space-y-3 px-6 pb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Checked-in</span>
                <span className="text-sm font-semibold text-white">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">In consultation</span>
                <span className="text-sm font-semibold text-[#FFD84D]">4</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Completed</span>
                <span className="text-sm font-semibold text-[#2EE59D]">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">No-show</span>
                <span className="text-sm font-semibold text-red-500">1</span>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
