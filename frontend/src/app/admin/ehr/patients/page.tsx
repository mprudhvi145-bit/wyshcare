/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/admin/ehr/patients/page.tsx
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
 - tabs
 - react-query
 - card
 - react
 - badge
 - skeleton
 - api-client
 - button
 *
 * Dependencies:
 - tabs
 - react-query
 - card
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
import { Activity, Droplets, HeartPulse, Plus, Search, Syringe, } from 'lucide-react';

import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api-client';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function PatientChartPage() {
  const [patientId, setPatientId] = useState('');
  const [searchId, setSearchId] = useState('');

  const { data: allergies, isLoading: loadAll, refetch: _refAll } = useQuery({
    queryKey: ['ehr-allergies', searchId], queryFn: () => api.listAllergies(searchId), enabled: !!searchId,
  });
  const { data: conditions, isLoading: loadCond } = useQuery({
    queryKey: ['ehr-conditions', searchId], queryFn: () => api.listConditions(searchId), enabled: !!searchId,
  });
  const { data: procedures, isLoading: loadProc } = useQuery({
    queryKey: ['ehr-procedures', searchId], queryFn: () => api.listProcedures(searchId), enabled: !!searchId,
  });
  const { data: immunizations, isLoading: loadImm } = useQuery({
    queryKey: ['ehr-immunizations', searchId], queryFn: () => api.listImmunizations(searchId), enabled: !!searchId,
  });

  const handleSearch = () => { if (patientId.trim()) setSearchId(patientId.trim()); };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
      <PageHeader title="Patient Chart" description="Search and view patient clinical data">
        <div className="flex gap-2">
          <Input placeholder="Patient ID..." value={patientId} onChange={(e) => setPatientId(e.target.value)} className="w-48" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          <Button onClick={handleSearch}><Search className="h-4 w-4 mr-1" />Search</Button>
        </div>
      </PageHeader>

      {!searchId && (
        <motion.div variants={item}>
          <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
            <CardContent className="py-12 text-center text-white/50">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>Enter a patient ID above to view their chart</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {searchId && (
        <Tabs defaultValue="allergies">
          <TabsList>
            <TabsTrigger value="allergies"><Activity className="h-4 w-4 mr-1" />Allergies</TabsTrigger>
            <TabsTrigger value="conditions"><HeartPulse className="h-4 w-4 mr-1" />Conditions</TabsTrigger>
            <TabsTrigger value="procedures"><Droplets className="h-4 w-4 mr-1" />Procedures</TabsTrigger>
            <TabsTrigger value="immunizations"><Syringe className="h-4 w-4 mr-1" />Immunizations</TabsTrigger>
          </TabsList>

          <TabsContent value="allergies">
            <motion.div variants={item}>
              <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm text-white/90">Allergies ({allergies?.length ?? 0})</CardTitle>
                  <Button size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" />Add</Button>
                </CardHeader>
                <CardContent>
                  {loadAll ? <Skeleton className="bg-white/5 h-20" /> : !allergies?.length ? <p className="text-sm text-white/50">No allergies recorded</p> : (
                    <div className="space-y-2">
                      {allergies.map((a: any) => (
                        <div key={a.id} className="flex items-center justify-between rounded border border-white/5 p-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white/70">{a.allergen}</span>
                            {a.reaction && <span className="text-white/50">— {a.reaction}</span>}
                            <Badge variant={a.severity === 'SEVERE' ? 'danger' : a.severity === 'MODERATE' ? 'warning' : 'secondary'}>{a.severity}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{a.status}</Badge>
                            {a.onsetDate && <span className="text-xs text-white/50">{new Date(a.onsetDate).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="conditions">
            <motion.div variants={item}>
              <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm text-white/90">Conditions ({conditions?.length ?? 0})</CardTitle>
                  <Button size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" />Add</Button>
                </CardHeader>
                <CardContent>
                  {loadCond ? <Skeleton className="bg-white/5 h-20" /> : !conditions?.length ? <p className="text-sm text-white/50">No conditions recorded</p> : (
                    <div className="space-y-2">
                      {conditions.map((c: any) => (
                        <div key={c.id} className="rounded border border-white/5 p-2 text-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white/70">{c.displayName}</span>
                              {c.icdCode && <Badge variant="outline">{c.icdCode}</Badge>}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={c.status === 'ACTIVE' ? 'success' : 'secondary'}>{c.status}</Badge>
                              {c.severity && <Badge variant="outline">{c.severity}</Badge>}
                            </div>
                          </div>
                          {c.bodySite && <p className="mt-1 text-xs text-white/50">Site: {c.bodySite}</p>}
                          {c.onsetDate && <p className="text-xs text-white/50">Onset: {new Date(c.onsetDate).toLocaleDateString()}{c.resolutionDate ? ` → Resolved: ${new Date(c.resolutionDate).toLocaleDateString()}` : ''}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="procedures">
            <motion.div variants={item}>
              <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm text-white/90">Procedures ({procedures?.length ?? 0})</CardTitle>
                  <Button size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" />Add</Button>
                </CardHeader>
                <CardContent>
                  {loadProc ? <Skeleton className="bg-white/5 h-20" /> : !procedures?.length ? <p className="text-sm text-white/50">No procedures recorded</p> : (
                    <div className="space-y-2">
                      {procedures.map((p: any) => (
                        <div key={p.id} className="rounded border border-white/5 p-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white/70">{p.displayName}</span>
                            {p.outcome && <Badge variant={p.outcome === 'SUCCESSFUL' ? 'success' : 'secondary'}>{p.outcome}</Badge>}
                          </div>
                          <div className="mt-1 flex gap-3 text-xs text-white/50">
                            {p.bodySite && <span>Site: {p.bodySite}</span>}
                            {p.performedDate && <span>Date: {new Date(p.performedDate).toLocaleDateString()}</span>}
                            {p.code && <span>Code: {p.code}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="immunizations">
            <motion.div variants={item}>
              <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm text-white/90">Immunizations ({immunizations?.length ?? 0})</CardTitle>
                  <Button size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" />Add</Button>
                </CardHeader>
                <CardContent>
                  {loadImm ? <Skeleton className="bg-white/5 h-20" /> : !immunizations?.length ? <p className="text-sm text-white/50">No immunizations recorded</p> : (
                    <div className="space-y-2">
                      {immunizations.map((i: any) => (
                        <div key={i.id} className="rounded border border-white/5 p-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white/70">{i.vaccineName}</span>
                            <span className="text-xs text-white/50">{new Date(i.administeredDate).toLocaleDateString()}</span>
                          </div>
                          <div className="mt-1 flex gap-3 text-xs text-white/50">
                            {i.doseNumber && <span>Dose #{i.doseNumber}</span>}
                            {i.manufacturer && <span>{i.manufacturer}</span>}
                            {i.lotNumber && <span>Lot: {i.lotNumber}</span>}
                            {i.administrationSite && <span>{i.administrationSite}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      )}
    </motion.div>
  );
}
