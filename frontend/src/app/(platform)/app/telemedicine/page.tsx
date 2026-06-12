/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(platform)/app/telemedicine/page.tsx
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
 - use-health-data
 - react-query
 - card
 - dialog
 - empty-state
 - select
 - react
 *
 * Dependencies:
 - tabs
 - use-health-data
 - react-query
 - card
 - dialog
 - empty-state
 - select
 - react
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
import { useQuery } from '@tanstack/react-query';
import {
  Video, Phone, Calendar, Clock, MapPin, Plus, Video as VideoIcon,
  History, Sparkles, Stethoscope, Shield, HeartPulse, Activity, Star,
  IndianRupee, Building2, CheckCircle2, Circle, ChevronDown, ChevronUp,
  ChevronRight, Users, AlertTriangle, AlertCircle, FileText, Pill,
  Thermometer, UserRound,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api-client';
import { useDoctors, useCreateAppointment, useCancelAppointment, useRescheduleAppointment, useConsultationToken } from '@/hooks/use-telemedicine';
import { useHealthScore } from '@/hooks/use-health-data';
import type { Appointment } from '@/types';

const easing = [0.16, 1, 0.3, 1] as const;

const familyMembers = [
  { id: 'me', label: 'Me', icon: UserRound },
  { id: 'mother', label: 'Mother', icon: Users },
  { id: 'father', label: 'Father', icon: Users },
  { id: 'child', label: 'Child', icon: Users },
];

const aiPrepTips = [
  { icon: FileText, label: 'Latest cholesterol report' },
  { icon: Pill, label: 'Current medications list' },
  { icon: Activity, label: 'Blood pressure readings (last 7 days)' },
  { icon: Thermometer, label: 'Dietary changes log' },
];

const modeColors: Record<string, string> = {
  VIDEO: 'bg-[#007AFF]/10 text-[#007AFF]',
  AUDIO: 'bg-[#34C759]/10 text-[#34C759]',
  IN_PERSON: 'bg-[#AF52DE]/10 text-[#AF52DE]',
};

const statusStyles: Record<string, string> = {
  CONFIRMED: 'bg-[#34C759]/15 text-[#34C759] border-[#34C759]/30',
  SCHEDULED: 'bg-[#007AFF]/15 text-[#007AFF] border-[#007AFF]/30',
  PENDING: 'bg-[#FF9500]/15 text-[#FF9500] border-[#FF9500]/30',
  COMPLETED: 'bg-slate-500/15 text-slate-500 border-slate-500/30',
  CANCELLED: 'bg-[#FF2D55]/15 text-[#FF2D55] border-[#FF2D55]/30',
};

const upcomingStatuses = ['SCHEDULED', 'CONFIRMED', 'PENDING', 'CHECKED_IN', 'IN_PROGRESS'];
const pastStatuses = ['COMPLETED', 'CANCELLED', 'NO_SHOW'];

function getInitials(name: string) { return name.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase(); }

function StatusPill({ status }: { status: string }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[status] || statusStyles.PENDING}`}>{status}</span>;
}

export default function TelemedicinePage() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [form, setForm] = useState({ doctorId: '', mode: 'VIDEO', reason: '', date: '' });
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedFamily, setSelectedFamily] = useState('me');
  const [checklistOpen, setChecklistOpen] = useState(true);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({ camera: true, microphone: true, internet: true, reports: false, prescriptions: false });
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<{ id: string; date: string } | null>(null);
  const [joinCallId, setJoinCallId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const { data: aptData, isLoading: aptLoading, isError: aptError, refetch: aptRefetch } = useQuery({
    queryKey: ['appointments'], queryFn: () => api.getAppointments(), refetchInterval: 30000, staleTime: 60000,
  });
  const { data: docData, isLoading: docLoading } = useDoctors();
  const { data: hsData, isLoading: hsLoading } = useHealthScore();

  const createApt = useCreateAppointment();
  const cancelApt = useCancelAppointment();
  const rescheduleApt = useRescheduleAppointment();
  const { data: consultToken } = useConsultationToken(joinCallId ?? '');

  useEffect(() => {
    if (consultToken?.token && joinCallId) {
      window.open(`/telemedicine/consultation/${joinCallId}?token=${consultToken.token}`, '_blank');
      setJoinCallId(null);
    }
  }, [consultToken, joinCallId]);

  const appointments = aptData?.appointments ?? [];
  const upcomingApts = appointments.filter(a => upcomingStatuses.includes(a.status));
  const pastApts = appointments.filter(a => pastStatuses.includes(a.status));
  const doctors = docData?.doctors ?? [];
  const healthScore = hsData?.score ?? 0;
  const nextApt = upcomingApts[0];

  const toggleChecklist = (id: string) => setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  const checkCount = Object.values(checklist).filter(Boolean).length;
  const totalChecks = Object.keys(checklist).length;

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createApt.mutate(
      { doctorProfileId: form.doctorId, consultationMode: form.mode as 'VIDEO' | 'AUDIO' | 'CHAT' | 'IN_PERSON', reason: form.reason, slotStartAt: form.date || new Date(Date.now() + 86400000).toISOString() },
      { onSuccess: () => { setBookingOpen(false); setForm({ doctorId: '', mode: 'VIDEO', reason: '', date: '' }); } },
    );
  };

  const handleCancel = (id: string) => { setCancellingId(id); cancelApt.mutate(id, { onSettled: () => setCancellingId(null) }); };
  const handleRescheduleOpen = (apt: Appointment) => { setRescheduleTarget({ id: apt.id, date: apt.slotStartAt }); setRescheduleOpen(true); };

  const handleRescheduleSubmit = () => {
    if (!rescheduleTarget) return;
    rescheduleApt.mutate({ id: rescheduleTarget.id, data: { slotStartAt: rescheduleTarget.date } }, { onSuccess: () => { setRescheduleOpen(false); setRescheduleTarget(null); } });
  };

  function renderAppointmentCard(apt: Appointment) {
    const Icon = apt.consultationMode === 'VIDEO' ? Video : apt.consultationMode === 'AUDIO' ? Phone : MapPin;
    const colorClass = modeColors[apt.consultationMode] ?? 'bg-slate-500/10 text-slate-500';
    const docName = apt.doctorProfile?.user?.fullName ?? 'Doctor';
    const specialty = apt.doctorProfile?.specialization;

    return (
      <motion.div key={apt.id} whileHover={{ scale: 1.01 }} className="glass-card border-none transition-all hover:shadow-lg">
        <div className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6]">
                <span className="text-sm font-bold text-white">{getInitials(docName)}</span>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold text-text-primary font-display">{docName}</p>
                  <StatusPill status={apt.status} />
                  <div className={`flex items-center gap-1 rounded-md px-2 py-0.5 ${colorClass}`}>
                    <Icon className="h-3 w-3" />
                    <span className="text-[11px] font-medium">{apt.consultationMode}</span>
                  </div>
                </div>
                {specialty && <p className="mt-0.5 text-sm text-[#007AFF] font-ui">{specialty}</p>}
                <p className="mt-3 text-sm font-medium text-text-primary font-ui">{apt.reason}</p>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-text-tertiary">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-[#007AFF]" />{format(new Date(apt.slotStartAt), 'MMM d, h:mm a')}</span>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 gap-2 lg:flex-col">
              {apt.consultationMode === 'VIDEO' && (
                <Button className="gap-2 bg-[#007AFF] text-white hover:bg-[#007AFF]/90" onClick={() => setJoinCallId(apt.id)} loading={joinCallId === apt.id}>
                  <VideoIcon className="h-4 w-4" /> Join Call
                </Button>
              )}
              <Button variant="outline" size="sm" className="border-[#EBEDF0] text-text-secondary hover:text-text-primary" onClick={() => handleRescheduleOpen(apt)}>Reschedule</Button>
              <Button variant="outline" size="sm" className="border-[#FF2D55]/30 text-[#FF2D55] hover:bg-[#FF2D55]/10" onClick={() => handleCancel(apt.id)} loading={cancellingId === apt.id}>Cancel</Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  function renderDoctorCard(doc: (typeof doctors)[number]) {
    return (
      <motion.div key={doc.id} whileHover={{ scale: 1.01 }} className="glass-card border-none transition-all hover:shadow-lg">
        <div className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#34C759] to-[#007AFF]">
                <span className="text-sm font-bold text-white">{getInitials(doc.name)}</span>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold text-text-primary font-display">{doc.name}</p>
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#FF9500]/10 px-2 py-0.5 text-[11px] font-medium text-[#FF9500]">
                    <Star className="h-3 w-3 fill-[#FF9500]" />{doc.rating}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-[#007AFF] font-ui">{doc.specialization}</p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-text-tertiary">
                  {doc.experience != null && <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-[#007AFF]" />{doc.experience} years</span>}
                  <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3 text-[#34C759]" />₹{doc.consultationFee}</span>
                  {doc.hospital && <span className="flex items-center gap-1"><Building2 className="h-3 w-3 text-[#007AFF]" />{doc.hospital}</span>}
                </div>
                {doc.availableSlots && doc.availableSlots.length > 0 && (
                  <div className="mt-2"><span className="inline-flex items-center gap-1 rounded-md bg-[#34C759]/10 px-2 py-0.5 text-xs font-medium text-[#34C759]"><Clock className="h-3 w-3" />{doc.availableSlots[0]}</span></div>
                )}
              </div>
            </div>
            <div className="flex shrink-0 gap-2 lg:flex-col">
              <Button className="gap-2 bg-[#007AFF] text-white hover:bg-[#007AFF]/90" onClick={() => { setForm((f) => ({ ...f, doctorId: doc.id })); setBookingOpen(true); }}>Book Now</Button>
              <Button variant="outline" size="sm" className="border-[#EBEDF0] text-text-secondary hover:text-text-primary">View Profile</Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-display tracking-tight">Digital Care</h1>
          <p className="mt-1 text-sm text-text-secondary font-ui">Your complete care experience, powered by AI</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-[#007AFF] text-white hover:bg-[#007AFF]/90 shadow-lg shadow-[#007AFF]/20 sm:inline-flex">
                <Plus className="h-4 w-4" /> Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-none">
              <DialogHeader>
                <DialogTitle className="text-text-primary font-display">Book Appointment</DialogTitle>
                <DialogDescription className="text-text-secondary">Schedule a consultation with a specialist</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBookSubmit} className="space-y-4 pt-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary font-ui">Doctor</label>
                  <Select value={form.doctorId} onValueChange={(v) => setForm((f) => ({ ...f, doctorId: v }))}>
                    <SelectTrigger className="border-[#EBEDF0] bg-white text-text-primary">
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#EBEDF0]">
                      {doctors.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} — {d.specialization}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary font-ui">Consultation Mode</label>
                  <Select value={form.mode} onValueChange={(v) => setForm((f) => ({ ...f, mode: v }))}>
                    <SelectTrigger className="border-[#EBEDF0] bg-white text-text-primary"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border-[#EBEDF0]">
                      <SelectItem value="VIDEO">Video Call</SelectItem>
                      <SelectItem value="AUDIO">Audio Call</SelectItem>
                      <SelectItem value="IN_PERSON">In-Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary font-ui">Reason</label>
                  <Input value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Brief reason for visit" className="border-[#EBEDF0] bg-white" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary font-ui">Date & Time</label>
                  <Input type="datetime-local" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="border-[#EBEDF0] bg-white" />
                </div>
                <Button type="submit" loading={createApt.isPending} className="w-full bg-[#007AFF] text-white hover:bg-[#007AFF]/90">Confirm Booking</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent className="glass-card border-none">
          <DialogHeader>
            <DialogTitle className="text-text-primary font-display">Reschedule Appointment</DialogTitle>
            <DialogDescription className="text-text-secondary">Choose a new date and time</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary font-ui">New Date & Time</label>
              <Input type="datetime-local" value={rescheduleTarget?.date ?? ''} onChange={(e) => setRescheduleTarget((prev) => (prev ? { ...prev, date: e.target.value } : null))} className="border-[#EBEDF0] bg-white" />
            </div>
            <Button onClick={handleRescheduleSubmit} loading={rescheduleApt.isPending} className="w-full bg-[#007AFF] text-white hover:bg-[#007AFF]/90">Confirm Reschedule</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
        {/* Main */}
        <div className="space-y-6">
          {/* AI Concierge */}
          <div className="glass-card overflow-hidden bg-gradient-to-br from-[#007AFF]/5 via-transparent to-[#5856D6]/5">
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#007AFF]/20 to-[#5856D6]/20">
                  <Sparkles className="h-6 w-6 text-[#007AFF]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-text-primary font-display">AI Care Assistant</h2>
                    <span className="inline-flex items-center rounded-full bg-[#34C759]/10 px-2 py-0.5 text-[10px] font-medium text-[#34C759] font-ui">Active</span>
                  </div>
                  <p className="mt-1 text-sm text-text-secondary font-ui">
                    You have <span className="font-medium text-text-primary">{upcomingApts.length} upcoming consultation{upcomingApts.length !== 1 ? 's' : ''}</span>.
                  </p>
                  {nextApt && (
                    <p className="mt-3 text-sm font-medium text-[#007AFF] font-ui">
                      {nextApt.doctorProfile?.user?.fullName ?? 'Consultation'}{' '}
                      <span className="text-text-secondary">— {format(new Date(nextApt.slotStartAt), 'MMM d')}</span>
                    </p>
                  )}
                  <p className="mt-3 text-xs font-medium uppercase tracking-wider text-text-tertiary font-ui">Prepare:</p>
                  <div className="mt-2 space-y-1.5">
                    {aiPrepTips.map((tip) => (
                      <div key={tip.label} className="flex items-center gap-2 text-sm text-text-secondary font-ui">
                        <tip.icon className="h-3.5 w-3.5 text-[#007AFF]" />{tip.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Family Selector */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button className="h-14 gap-3 bg-gradient-to-r from-[#007AFF] to-[#5856D6] px-8 text-base font-semibold text-white shadow-lg shadow-[#007AFF]/20 hover:from-[#007AFF]/90 hover:to-[#5856D6]/90">
              <Video className="h-5 w-5" /> Start Instant Consultation
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary font-ui">Book for:</span>
              <div className="flex gap-1">
                {familyMembers.map((member) => {
                  const Icon = member.icon;
                  return (
                    <button key={member.id} onClick={() => setSelectedFamily(member.id)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        selectedFamily === member.id ? 'bg-[#007AFF]/15 text-[#007AFF] ring-1 ring-[#007AFF]/40' : 'text-text-secondary hover:bg-content-secondary hover:text-text-primary'
                      }`}>
                      <Icon className="h-3.5 w-3.5" />{member.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="border-b border-[#EBEDF0] bg-transparent">
              <TabsTrigger value="upcoming" className="gap-2 data-[state=active]:border-[#007AFF] data-[state=active]:text-[#007AFF]">
                <Calendar className="h-4 w-4" /> Upcoming ({upcomingApts.length})
              </TabsTrigger>
              <TabsTrigger value="find" className="gap-2 data-[state=active]:border-[#007AFF] data-[state=active]:text-[#007AFF]">
                <Stethoscope className="h-4 w-4" /> Find Doctors
              </TabsTrigger>
              <TabsTrigger value="past" className="gap-2 data-[state=active]:border-[#007AFF] data-[state=active]:text-[#007AFF]">
                <History className="h-4 w-4" /> History ({pastApts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-6">
              {aptLoading ? (
                <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}</div>
              ) : aptError ? (
                <EmptyState icon={<AlertCircle className="h-6 w-6 text-[#FF2D55]" />} title="Failed to load appointments" description="Something went wrong." action={{ label: 'Retry', onClick: () => aptRefetch() }} />
              ) : upcomingApts.length === 0 ? (
                <EmptyState icon={<Video className="h-6 w-6 text-text-tertiary" />} title="No upcoming appointments" description="Book your first telemedicine consultation" action={{ label: 'Book Now', onClick: () => setBookingOpen(true) }} />
              ) : (
                <div className="space-y-4">{upcomingApts.map(renderAppointmentCard)}</div>
              )}
            </TabsContent>

            <TabsContent value="find" className="mt-6">
              {docLoading ? (
                <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div>
              ) : doctors.length === 0 ? (
                <EmptyState icon={<Stethoscope className="h-6 w-6 text-text-tertiary" />} title="No doctors available" description="Check back later" />
              ) : (
                <div className="space-y-4">{doctors.map(renderDoctorCard)}</div>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-6">
              {aptLoading ? (
                <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
              ) : aptError ? (
                <EmptyState icon={<AlertCircle className="h-6 w-6 text-[#FF2D55]" />} title="Failed to load history" description="Something went wrong." action={{ label: 'Retry', onClick: () => aptRefetch() }} />
              ) : pastApts.length === 0 ? (
                <EmptyState icon={<History className="h-6 w-6 text-text-tertiary" />} title="No past appointments" />
              ) : (
                <div className="space-y-4">
                  {pastApts.map((apt) => {
                    const Icon = apt.consultationMode === 'VIDEO' ? Video : apt.consultationMode === 'AUDIO' ? Phone : MapPin;
                    const colorClass = modeColors[apt.consultationMode] ?? 'bg-slate-500/10 text-slate-500';
                    const docName = apt.doctorProfile?.user?.fullName ?? 'Doctor';
                    return (
                      <motion.div key={apt.id} whileHover={{ scale: 1.01 }} className="glass-card border-none transition-shadow duration-300 hover:shadow-lg">
                        <div className="p-5">
                          <div className="flex items-start gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${colorClass}`}><Icon className="h-4 w-4" /></div>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-text-primary font-display">{docName}</p>
                                {apt.doctorProfile?.specialization && <span className="text-xs text-text-tertiary">{apt.doctorProfile.specialization}</span>}
                                <span className="text-xs text-text-tertiary">·</span>
                                <span className="text-xs text-text-tertiary">{format(new Date(apt.slotStartAt), 'MMM d, yyyy')}</span>
                                <StatusPill status={apt.status} />
                              </div>
                              <p className="mt-1 text-sm text-text-secondary font-ui">{apt.reason}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-5 transition-shadow duration-300 hover:shadow-lg">
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-content-secondary p-3">
                <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-[#007AFF]" /><span className="text-xs text-text-tertiary">Upcoming</span></div>
                <p className="mt-1 text-xl font-bold text-text-primary font-display">{upcomingApts.length}</p>
                <p className="text-[11px] text-text-tertiary font-ui">Consultations</p>
              </div>
              <div className="rounded-xl bg-content-secondary p-3">
                <div className="flex items-center gap-1.5"><History className="h-3.5 w-3.5 text-[#FF9500]" /><span className="text-xs text-text-tertiary">Past</span></div>
                <p className="mt-1 text-xl font-bold text-text-primary font-display">{pastApts.length}</p>
                <p className="text-[11px] text-text-tertiary font-ui">Appointments</p>
              </div>
              <div className="rounded-xl bg-content-secondary p-3">
                <div className="flex items-center gap-1.5"><Pill className="h-3.5 w-3.5 text-[#007AFF]" /><span className="text-xs text-text-tertiary">Active</span></div>
                <p className="mt-1 text-xl font-bold text-text-primary font-display">{doctors.length}</p>
                <p className="text-[11px] text-text-tertiary font-ui">Specialists</p>
              </div>
              <div className="rounded-xl bg-content-secondary p-3">
                <div className="flex items-center gap-1.5"><HeartPulse className="h-3.5 w-3.5 text-[#34C759]" /><span className="text-xs text-text-tertiary">Health</span></div>
                {hsLoading ? <Skeleton className="mt-1 h-7 w-12" /> : <p className="mt-1 text-xl font-bold text-[#34C759] font-display">{healthScore}</p>}
                <p className="text-[11px] text-text-tertiary font-ui">Score</p>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-content-tertiary">
              <div className="h-full rounded-full bg-gradient-to-r from-[#007AFF] to-[#34C759] transition-all" style={{ width: `${healthScore}%` }} />
            </div>
          </motion.div>

          {/* Checklist */}
          <motion.div whileHover={{ scale: 1.01 }} className="glass-card p-5 transition-shadow duration-300 hover:shadow-lg">
            <button onClick={() => setChecklistOpen(!checklistOpen)} className="flex w-full items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-text-tertiary font-ui">Pre-Consultation Checklist</h3>
                <p className="mt-0.5 text-xs text-text-tertiary font-ui">{checkCount}/{totalChecks} complete</p>
              </div>
              {checklistOpen ? <ChevronUp className="h-4 w-4 text-text-tertiary" /> : <ChevronDown className="h-4 w-4 text-text-tertiary" />}
            </button>
            {checklistOpen && (
              <div className="mt-4 space-y-2">
                {Object.entries(checklist).map(([id, checked]) => {
                  const label = id === 'camera' ? 'Camera working' : id === 'microphone' ? 'Microphone working' : id === 'internet' ? 'Internet stable' : id === 'reports' ? 'Reports uploaded' : 'Prescription history available';
                  return (
                    <button key={id} onClick={() => toggleChecklist(id)} className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-all hover:bg-content-secondary">
                      {checked ? <CheckCircle2 className="h-4 w-4 shrink-0 text-[#34C759]" /> : <Circle className="h-4 w-4 shrink-0 text-text-tertiary" />}
                      <span className={`text-sm font-ui ${checked ? 'text-text-tertiary line-through' : 'text-text-secondary'}`}>{label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Emergency */}
          <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-5 relative overflow-hidden transition-shadow duration-300 hover:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF2D55]/5 via-transparent to-[#FF9500]/5 pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-[#FF9500]" /><h3 className="text-sm font-semibold uppercase tracking-wider text-text-tertiary font-ui">Need Care Now?</h3></div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="flex flex-col items-center gap-1.5 rounded-xl bg-content-secondary p-3 text-xs text-text-secondary transition-all hover:bg-[#007AFF]/10 hover:text-[#007AFF]"><Video className="h-5 w-5" />Video Consultation</button>
                <button className="flex flex-col items-center gap-1.5 rounded-xl bg-content-secondary p-3 text-xs text-text-secondary transition-all hover:bg-[#007AFF]/10 hover:text-[#007AFF]"><Phone className="h-5 w-5" />Emergency Contact</button>
                <button className="flex flex-col items-center gap-1.5 rounded-xl bg-content-secondary p-3 text-xs text-text-secondary transition-all hover:bg-[#007AFF]/10 hover:text-[#007AFF]"><Building2 className="h-5 w-5" />Nearest Hospital</button>
                <button className="flex flex-col items-center gap-1.5 rounded-xl bg-content-secondary p-3 text-xs text-text-secondary transition-all hover:bg-[#007AFF]/10 hover:text-[#007AFF]"><HeartPulse className="h-5 w-5" />Ambulance</button>
              </div>
              <p className="mt-3 text-[10px] text-text-tertiary">For emergencies, call 108.</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-5 transition-shadow duration-300 hover:shadow-lg">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-tertiary font-ui">Quick Actions</h3>
            <div className="mt-4 space-y-2">
              {[{ label: 'Upload Reports', icon: FileText }, { label: 'Order Refill', icon: Pill }, { label: 'Schedule Lab', icon: Calendar }].map((action) => (
                <button key={action.label} className="flex w-full items-center justify-between rounded-xl bg-content-secondary p-3 text-left text-sm text-text-secondary transition-all hover:bg-content-tertiary hover:text-text-primary">
                  <span className="flex items-center gap-2"><action.icon className="h-4 w-4 text-[#007AFF]" />{action.label}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
