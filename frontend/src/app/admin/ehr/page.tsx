/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/admin/ehr/page.tsx
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
 - badge
 - skeleton
 - api-client
 - lucide-react
 - link
 - stat-card
 *
 * Dependencies:
 - react-query
 - card
 - badge
 - skeleton
 - api-client
 - lucide-react
 - link
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

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Activity, AlertTriangle, FileText, FlaskConical, Pill, Stethoscope, Syringe, UserRound } from 'lucide-react';
import Link from 'next/link';

import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api-client';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function EhrDashboardPage() {
  const { data: encStats, isLoading: loadingEnc } = useQuery({ queryKey: ['ehr-enc-stats'], queryFn: () => api.getEncounterStats() });
  const { data: ordStats, isLoading: loadingOrd } = useQuery({ queryKey: ['ehr-ord-stats'], queryFn: () => api.getOrderStats() });
  const { data: noteStats, isLoading: loadingNote } = useQuery({ queryKey: ['ehr-note-stats'], queryFn: () => api.getNoteStats() });
  const { data: alertStats, isLoading: loadingAlert } = useQuery({ queryKey: ['ehr-alert-stats'], queryFn: () => api.getAlertStats() });

  const sections = [
    { href: '/admin/ehr/patients', label: 'Patient Chart', desc: 'Allergies, conditions, procedures, immunizations, documents', icon: UserRound, color: 'text-[#8FD3D1]' },
    { href: '/admin/ehr/encounters', label: 'Encounters', desc: 'Outpatient, inpatient, emergency, telemedicine, home care', icon: Stethoscope, color: 'text-[#8FD3D1]' },
    { href: '/admin/ehr/orders', label: 'Orders', desc: 'Lab, imaging, medication, procedure, referral orders', icon: Pill, color: 'text-[#8FD3D1]' },
    { href: '/admin/ehr/notes', label: 'Clinical Notes', desc: 'H&P, progress, discharge, operative, procedure, referral notes', icon: FileText, color: 'text-[#8FD3D1]' },
    { href: '/admin/ehr/cds', label: 'CDS Alerts', desc: 'Drug interaction, allergy, contraindication, coverage alerts', icon: AlertTriangle, color: 'text-[#8FD3D1]' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 bg-[#0B0D10] min-h-screen p-6">
      <PageHeader title="Enterprise EHR" description="Clinical backbone — patient chart, encounters, orders, documentation, and clinical decision support">
        <Badge variant="outline" className="text-xs">Sprint 29A</Badge>
      </PageHeader>

      <motion.div variants={item} className="grid gap-4 md:grid-cols-5">
        <StatCard icon={<Activity />} label="Encounters" value={encStats?.total as number ?? 0} />
        <StatCard icon={<FlaskConical />} label="Orders" value={ordStats?.total as number ?? 0} />
        <StatCard icon={<FileText />} label="Notes" value={noteStats?.total as number ?? 0} />
        <StatCard icon={<AlertTriangle />} label="Active Alerts" value={alertStats?.active as number ?? 0} />
        <StatCard icon={<Syringe />} label="Immunizations" value={0} />
      </motion.div>

      <motion.div variants={item} className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="cursor-pointer transition-shadow hover:shadow-[0_0_20px_rgba(143,211,209,0.1)] hover:border-[rgba(143,211,209,0.2)] bg-[#15181D] border border-[rgba(255,255,255,0.06)] h-full">
              <CardHeader className="pb-2">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <CardTitle className="text-sm text-white/90">{s.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-white/50">{s.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={item}>
          <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
            <CardHeader><CardTitle className="text-sm text-white/90">Encounter Distribution</CardTitle></CardHeader>
            <CardContent>
              {loadingEnc ? <Skeleton className="h-20 bg-white/5" /> : (
                <div className="space-y-1">
                  {encStats?.classDistribution ? Object.entries(encStats.classDistribution as Record<string, number>).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-white/60">{k}</span>
                      <span className="font-medium text-white/90">{v}</span>
                    </div>
                  )) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
            <CardHeader><CardTitle className="text-sm text-white/90">Order Types</CardTitle></CardHeader>
            <CardContent>
              {loadingOrd ? <Skeleton className="h-20 bg-white/5" /> : (
                <div className="space-y-1">
                  {ordStats?.typeDistribution ? Object.entries(ordStats.typeDistribution as Record<string, number>).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-white/60">{k}</span>
                      <span className="font-medium text-white/90">{v}</span>
                    </div>
                  )) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
            <CardHeader><CardTitle className="text-sm text-white/90">Notes Signed</CardTitle></CardHeader>
            <CardContent>
              {loadingNote ? <Skeleton className="h-20 bg-white/5" /> : (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs"><span className="text-white/60">Signed</span><span className="font-medium text-green-500">{(noteStats?.signed as number) ?? 0}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-white/60">Unsigned</span><span className="font-medium text-amber-500">{(noteStats?.unsigned as number) ?? 0}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-white/60">Total</span><span className="font-medium text-white/90">{(noteStats?.total as number) ?? 0}</span></div>
                  {noteStats?.typeDistribution ? Object.entries(noteStats.typeDistribution as Record<string, number>).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs"><span className="text-white/60">{k}</span><span className="text-white/90">{v}</span></div>
                  )) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
            <CardHeader><CardTitle className="text-sm text-white/90">CDS Alerts</CardTitle></CardHeader>
            <CardContent>
              {loadingAlert ? <Skeleton className="h-20 bg-white/5" /> : (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs"><span className="text-white/60">Active</span><span className="font-medium text-red-500">{(alertStats?.active as number) ?? 0}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-white/60">Total</span><span className="font-medium text-white/90">{(alertStats?.total as number) ?? 0}</span></div>
                  {alertStats?.typeDistribution ? Object.entries(alertStats.typeDistribution as Record<string, number>).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs"><span className="text-white/60">{k}</span><span className="text-white/90">{v}</span></div>
                  )) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
