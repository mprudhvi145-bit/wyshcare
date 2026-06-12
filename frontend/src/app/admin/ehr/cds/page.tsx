/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/admin/ehr/cds/page.tsx
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

interface AlertStats {
  total: number;
  active: number;
  resolved: number;
  severityDistribution: Record<string, number>;
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Search, } from 'lucide-react';

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

const severityColors: Record<string, string> = {
  CONTRAINDICATED: 'bg-red-500/20 text-red-300', HIGH: 'bg-orange-500/20 text-orange-300',
  MODERATE: 'bg-amber-500/20 text-amber-300', MINOR: 'bg-blue-500/20 text-blue-300',
  NONE: 'bg-gray-500/20 text-gray-300',
};

const alertTypes: Record<string, string> = {
  DRUG_INTERACTION: 'Drug Interaction', DUPLICATE_THERAPY: 'Duplicate Therapy',
  ALLERGY: 'Allergy', CONTRAINDICATION: 'Contraindication',
  COVERAGE: 'Coverage', PREVENTIVE_CARE: 'Preventive Care',
};

export default function CdsPage() {
  const [patientId, setPatientId] = useState('');
  const [searchId, setSearchId] = useState('');
  const [alertType, setAlertType] = useState('');

  const { data: stats } = useQuery({ queryKey: ['ehr-cds-stats'], queryFn: () => api.getAlertStats() as unknown as Promise<AlertStats> });
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['ehr-alerts', searchId, alertType],
    queryFn: () => api.listAlerts(searchId, alertType || undefined),
    enabled: !!searchId,
  });

  const handleSearch = () => { if (patientId.trim()) setSearchId(patientId.trim()); };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 bg-[#0B0D10] min-h-screen p-6">
      <PageHeader title="Clinical Decision Support" description="Drug interaction, duplicate therapy, allergy, contraindication, coverage, and preventive care alerts">
        <div className="flex gap-2">
          <Input placeholder="Patient ID..." value={patientId} onChange={(e) => setPatientId(e.target.value)} className="w-48" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          <Button onClick={handleSearch}><Search className="h-4 w-4 mr-1" />Search</Button>
        </div>
      </PageHeader>

      <motion.div variants={item} className="grid gap-4 md:grid-cols-4">
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]"><CardHeader className="pb-2"><CardTitle className="text-xs text-white/50">Total Alerts</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{stats?.total ?? 0}</p></CardContent></Card>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]"><CardHeader className="pb-2"><CardTitle className="text-xs text-white/50">Active</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-500">{stats?.active ?? 0}</p></CardContent></Card>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]"><CardHeader className="pb-2"><CardTitle className="text-xs text-white/50">Resolved</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-500">{stats?.resolved ?? 0}</p></CardContent></Card>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]"><CardHeader className="pb-2"><CardTitle className="text-xs text-white/50">By Severity</CardTitle></CardHeader><CardContent><div className="space-y-1">{stats?.severityDistribution && Object.entries(stats.severityDistribution).map(([k, v]) => <div key={k} className="flex justify-between text-xs"><span>{k}</span><span>{v as number}</span></div>)}</div></CardContent></Card>
      </motion.div>

      {searchId && (
        <motion.div variants={item}>
          <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-white/90">Active Alerts for {searchId} ({alerts?.length ?? 0})</CardTitle>
              <Select value={alertType} onValueChange={setAlertType}>
                <SelectTrigger className="w-40"><SelectValue placeholder="All alert types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">All types</SelectItem>
                  {Object.entries(alertTypes).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-40 bg-white/5" /> : !alerts?.length ? <p className="text-sm text-white/50">No active alerts</p> : (
                <div className="space-y-2">
                  {alerts.map((a: any) => (
                    <div key={a.id} className="flex items-start justify-between rounded border border-white/5 p-3">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`mt-0.5 h-4 w-4 ${a.severity === 'CONTRAINDICATED' ? 'text-red-500' : a.severity === 'HIGH' ? 'text-orange-500' : 'text-amber-500'}`} />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white/90">{a.title}</span>
                            <Badge className={severityColors[a.severity] ?? ''}>{a.severity}</Badge>
                            <Badge variant="outline">{alertTypes[a.alertType] ?? a.alertType}</Badge>
                          </div>
                          <p className="text-xs text-white/60">{a.description}</p>
                          <p className="text-xs text-white/60">Created: {new Date(a.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
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
