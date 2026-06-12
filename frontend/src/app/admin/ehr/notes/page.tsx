/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/admin/ehr/notes/page.tsx
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
import { FileText, PenLine, Search, Signature } from 'lucide-react';

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

const noteTypes: Record<string, string> = {
  H_AND_P: 'H&P', PROGRESS_NOTE: 'Progress', DISCHARGE_SUMMARY: 'Discharge',
  OPERATIVE_NOTE: 'Operative', PROCEDURE_NOTE: 'Procedure', REFERRAL_NOTE: 'Referral', SOAP: 'SOAP',
};

export default function NotesPage() {
  const [patientId, setPatientId] = useState('');
  const [searchId, setSearchId] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data: stats } = useQuery({ queryKey: ['ehr-note-stats'], queryFn: () => api.getNoteStats() });
  const { data: notes, isLoading } = useQuery({
    queryKey: ['ehr-notes', searchId, typeFilter],
    queryFn: () => api.listNotes(searchId, typeFilter || undefined),
    enabled: !!searchId,
  });

  const handleSearch = () => { if (patientId.trim()) setSearchId(patientId.trim()); };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
      <PageHeader title="Clinical Documentation" description="H&P, Progress Notes, Discharge Summaries, Operative Notes, Procedure Notes, Referral Notes">
        <div className="flex gap-2">
          <Input placeholder="Patient ID..." value={patientId} onChange={(e) => setPatientId(e.target.value)} className="w-48" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          <Button onClick={handleSearch}><Search className="h-4 w-4 mr-1" />Search</Button>
        </div>
      </PageHeader>

      <motion.div variants={item} className="grid gap-4 md:grid-cols-4">
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]"><CardHeader className="pb-2"><CardTitle className="text-xs text-white/50">Total Notes</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-white/90">{(stats?.total as number) ?? 0}</p></CardContent></Card>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]"><CardHeader className="pb-2"><CardTitle className="text-xs text-white/50">Signed</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-emerald-400">{(stats?.signed as number) ?? 0}</p></CardContent></Card>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]"><CardHeader className="pb-2"><CardTitle className="text-xs text-white/50">Unsigned</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-amber-400">{(stats?.unsigned as number) ?? 0}</p></CardContent></Card>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]"><CardHeader className="pb-2"><CardTitle className="text-xs text-white/50">By Type</CardTitle></CardHeader><CardContent><div className="space-y-1">{stats?.typeDistribution ? Object.entries(stats.typeDistribution as Record<string, number>).map(([k, v]) => <div key={k} className="flex justify-between text-xs text-white/60"><span>{noteTypes[k] ?? k}</span><span>{v}</span></div>) : null}</div></CardContent></Card>
      </motion.div>

      {searchId && (
        <motion.div variants={item}>
          <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-white/90">Notes for {searchId} ({notes?.length ?? 0})</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-36"><SelectValue placeholder="All types" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">All types</SelectItem>
                    {Object.entries(noteTypes).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline"><PenLine className="h-3 w-3 mr-1" />New Note</Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-40 bg-white/5" /> : !notes?.length ? <p className="text-sm text-white/50">No notes found</p> : (
                <div className="space-y-2">
                  {notes.map((n: any) => (
                    <div key={n.id} className="flex items-center justify-between rounded border border-white/5 p-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{noteTypes[n.noteType] ?? n.noteType}</Badge>
                          {n.title && <span className="text-sm font-medium text-white/90">{n.title}</span>}
                          {n.isSigned ? <Signature className="h-3 w-3 text-emerald-400" /> : <FileText className="h-3 w-3 text-amber-400" />}
                        </div>
                        <div className="flex gap-3 text-xs text-white/50">
                          <span>Author: {n.authoredById?.slice(0, 8)}...</span>
                          <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                          {n.signedAt && <span>Signed: {new Date(n.signedAt).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      {!n.isSigned && <Button size="sm" variant="ghost"><Signature className="h-3 w-3" /></Button>}
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
