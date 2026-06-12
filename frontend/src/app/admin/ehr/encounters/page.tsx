/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/admin/ehr/encounters/page.tsx
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
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 - frontend/src/components/ui/progress.tsx
 *
 * Calls:
 - react-query
 - card
 - react
 - badge
 - skeleton
 - api-client
 - button
 - lucide-react
 *
 * Dependencies:
 - react-query
 - card
 - react
 - badge
 - skeleton
 - api-client
 - button
 - lucide-react
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
import { Calendar, Clock, Plus, Search, } from 'lucide-react';

import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { api } from '@/lib/api-client';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const classColors: Record<string, string> = {
  OUTPATIENT: 'bg-blue-500/20 text-blue-300', INPATIENT: 'bg-purple-500/20 text-purple-300',
  EMERGENCY: 'bg-red-500/20 text-red-300', TELEMEDICINE: 'bg-green-500/20 text-green-300',
  HOME_CARE: 'bg-amber-500/20 text-amber-300',
};

export default function EncountersPage() {
  const [patientId, setPatientId] = useState('');
  const [searchId, setSearchId] = useState('');

  const { data: stats } = useQuery({ queryKey: ['ehr-enc-stats'], queryFn: () => api.getEncounterStats() });
  const { data: encounters, isLoading } = useQuery({
    queryKey: ['ehr-encounters', searchId], queryFn: () => api.listEncounters(searchId), enabled: !!searchId,
  });

  const handleSearch = () => { if (patientId.trim()) setSearchId(patientId.trim()); };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
      <PageHeader title="Encounters" description="Patient encounter management across all care settings">
        <div className="flex gap-2">
          <Input placeholder="Patient ID..." value={patientId} onChange={(e) => setPatientId(e.target.value)} className="w-48" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          <Button onClick={handleSearch}><Search className="h-4 w-4 mr-1" />Search</Button>
        </div>
      </PageHeader>

      <motion.div variants={item} className="grid gap-4 md:grid-cols-3">
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]"><CardHeader className="pb-2"><CardTitle className="text-xs text-white/50">Total Encounters</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-white/90">{(stats?.total as number) ?? 0}</p></CardContent></Card>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]"><CardHeader className="pb-2"><CardTitle className="text-xs text-white/50">By Class</CardTitle></CardHeader><CardContent><div className="space-y-1 text-white/60">{stats?.classDistribution ? Object.entries(stats.classDistribution as Record<string, number>).map(([k, v]) => <div key={k} className="flex justify-between text-xs"><span>{k}</span><span>{v}</span></div>) : null}</div></CardContent></Card>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]"><CardHeader className="pb-2"><CardTitle className="text-xs text-white/50">By Status</CardTitle></CardHeader><CardContent><div className="space-y-1 text-white/60">{stats?.statusDistribution ? Object.entries(stats.statusDistribution as Record<string, number>).map(([k, v]) => <div key={k} className="flex justify-between text-xs"><span>{k}</span><span>{v}</span></div>) : null}</div></CardContent></Card>
      </motion.div>

      {searchId && (
        <motion.div variants={item}>
          <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-white/90">Encounters for {searchId} ({encounters?.length ?? 0})</CardTitle>
              <Button size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" />New Encounter</Button>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="bg-white/5 h-40" /> : !encounters?.length ? <p className="text-sm text-white/50">No encounters found</p> : (
                <div className="space-y-2">
                  {encounters.map((e: any) => (
                    <div key={e.id} className="flex items-center justify-between rounded border border-white/5 p-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={classColors[e.encounterClass] ?? ''}>{e.encounterClass}</Badge>
                          <Badge variant="outline">{e.status}</Badge>
                          {e.reason && <span className="text-sm text-white/70">{e.reason}</span>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/50">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(e.periodStart).toLocaleDateString()}</span>
                          {e.location && <span>📍 {e.location}</span>}
                          <span>Diagnoses: {e._count?.diagnoses ?? e.diagnoses?.length ?? 0}</span>
                          <span>Orders: {e._count?.encountersOrders ?? e._count?.orders ?? 0}</span>
                          <span>Notes: {e._count?.notes ?? 0}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost"><Clock className="h-3 w-3" /></Button>
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
