/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/doctor/telemedicine/page.tsx
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
 - avatar
 - card
 - empty-state
 - react
 - badge
 - skeleton
 *
 * Dependencies:
 - tabs
 - status-badge
 - avatar
 - card
 - empty-state
 - react
 - badge
 - skeleton
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
import {
  Video, Phone, Calendar, Users, Monitor, FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';

const glassCardCompact = 'rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02]';

interface Consultation {
  id: string; patientName: string; reason: string; scheduledAt: string;
  mode: 'VIDEO' | 'AUDIO'; status: string; notes?: string;
}

const MOCK_UPCOMING: Consultation[] = [
  { id: 'c1', patientName: 'Ananya Sharma', reason: 'Follow-up consultation', scheduledAt: '2026-06-04T09:30:00', mode: 'VIDEO', status: 'CONFIRMED' },
  { id: 'c2', patientName: 'Priya Patel', reason: 'Lab report review', scheduledAt: '2026-06-04T11:15:00', mode: 'VIDEO', status: 'SCHEDULED' },
  { id: 'c3', patientName: 'Sneha Reddy', reason: 'Telemedicine follow-up', scheduledAt: '2026-06-04T15:30:00', mode: 'AUDIO', status: 'SCHEDULED' },
];

const MOCK_PAST: Consultation[] = [
  { id: 'c4', patientName: 'Rahul Verma', reason: 'Prescription refill', scheduledAt: '2026-06-02T10:00:00', mode: 'VIDEO', status: 'COMPLETED', notes: 'Patient reported improvement. Refilled metformin for 60 days.' },
  { id: 'c5', patientName: 'Amit Kumar', reason: 'Joint pain consultation', scheduledAt: '2026-06-01T14:00:00', mode: 'AUDIO', status: 'COMPLETED', notes: 'Advised physiotherapy. Prescribed NSAIDs for 7 days.' },
];

const MOCK_WAITING: Consultation[] = [
  { id: 'c6', patientName: 'Vikram Singh', reason: 'Urgent consultation', scheduledAt: '2026-06-04T16:00:00', mode: 'VIDEO', status: 'WAITING' },
];

export default function TelemedicinePage() {
  const [loading, setLoading] = useState(true);
  const [inCall, setInCall] = useState(false);
  const [activeCall, setActiveCall] = useState<Consultation | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  function joinCall(consultation: Consultation) {
    setActiveCall(consultation);
    setInCall(true);
  }

  function endCall() {
    setInCall(false);
    setActiveCall(null);
  }

  if (inCall && activeCall) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-6 py-12">
        <div className="flex h-48 w-48 items-center justify-center rounded-full bg-gradient-to-br from-[#8FD3D1]/20 to-[#2EE59D]/20 ring-4 ring-[#8FD3D1]/30">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="text-3xl text-white">{getInitials(activeCall.patientName)}</AvatarFallback>
          </Avatar>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white font-display">{activeCall.patientName}</h2>
          <p className="text-sm text-white/50 font-ui">{activeCall.reason}</p>
          <Badge variant="outline" className="mt-2 gap-1">
            {activeCall.mode === 'VIDEO' ? <Video className="h-3 w-3" /> : <Phone className="h-3 w-3" />}
            {activeCall.mode === 'VIDEO' ? 'Video Call' : 'Audio Call'}
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="lg" onClick={endCall}>End Call</Button>
          <Button variant="default" size="lg">
            {activeCall.mode === 'VIDEO' ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
            {activeCall.mode === 'VIDEO' ? 'Start Video' : 'Start Audio'}
          </Button>
        </div>
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-sm text-white">Consultation Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="h-32 w-full resize-none rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] p-3 text-sm text-white placeholder-white/30 font-ui outline-none focus:border-[#8FD3D1]/40 focus:ring-2 focus:ring-[#8FD3D1]/20"
              placeholder="Type your notes here..."
            />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Telemedicine" description="Manage your virtual consultations" />

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="waiting">Waiting</TabsTrigger>
          <TabsTrigger value="past">Past Consultations</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-[20px]" />
              ))}
            </div>
          ) : MOCK_UPCOMING.length === 0 ? (
            <EmptyState icon={<Video className="h-6 w-6" />} title="No upcoming consultations" description="All caught up!" />
          ) : (
            <div className="space-y-4">
              {MOCK_UPCOMING.map((c) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="transition-all hover:shadow-md">
                    <CardContent className="flex items-center gap-4 pt-6">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="text-white">{getInitials(c.patientName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white font-ui">{c.patientName}</p>
                          <StatusBadge status={c.status} size="sm" />
                          <Badge variant="outline" size="sm" className="gap-1">
                            {c.mode === 'VIDEO' ? <Video className="h-3 w-3" /> : <Phone className="h-3 w-3" />}
                            {c.mode}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-white/50 font-ui">{c.reason}</p>
                        <div className="mt-1 flex items-center gap-1 text-xs text-white/30 font-ui">
                          <Calendar className="h-3 w-3" />
                          {new Date(c.scheduledAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <Button variant="default" size="sm" onClick={() => joinCall(c)}>
                        <Monitor className="h-4 w-4" />
                        Join Room
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="waiting">
          {MOCK_WAITING.length === 0 ? (
            <EmptyState icon={<Users className="h-6 w-6" />} title="No patients waiting" description="Queue is empty" />
          ) : (
            <div className="space-y-4">
              {MOCK_WAITING.map((c) => (
                <Card key={c.id}>
                  <CardContent className="flex items-center gap-4 pt-6">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-white">{getInitials(c.patientName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white font-ui">{c.patientName}</p>
                      <p className="text-xs text-white/50 font-ui">{c.reason}</p>
                    </div>
                    <Button variant="default" size="sm" onClick={() => joinCall(c)}>Start Now</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {MOCK_PAST.length === 0 ? (
            <EmptyState icon={<FileText className="h-6 w-6" />} title="No past consultations" />
          ) : (
            <div className="space-y-4">
              {MOCK_PAST.map((c) => (
                <Card key={c.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-white">{getInitials(c.patientName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white font-ui">{c.patientName}</p>
                          <StatusBadge status={c.status} size="sm" />
                          <Badge variant="outline" size="sm" className="gap-1">
                            {c.mode === 'VIDEO' ? <Video className="h-3 w-3" /> : <Phone className="h-3 w-3" />}
                            {c.mode}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-white/50 font-ui">{c.reason}</p>
                        <p className="mt-2 text-xs text-white/30 font-ui">
                          {new Date(c.scheduledAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                        {c.notes && (
                          <div className="mt-3 rounded-[14px] bg-white/[0.03] border border-[rgba(255,255,255,0.06)] p-3">
                            <p className="text-xs text-white/60 font-ui">{c.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
