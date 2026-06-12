/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/doctor/schedule/page.tsx
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
 - frontend/src/components/ui/glass-card.tsx
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 *
 * Calls:
 - tabs
 - status-badge
 - avatar
 - card
 - react
 - badge
 - utils
 - button
 *
 * Dependencies:
 - tabs
 - status-badge
 - avatar
 - card
 - react
 - badge
 - utils
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
import {
  ChevronLeft, ChevronRight, Video, Activity as ActivityIcon,
  Stethoscope, Clock, MapPin,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';
const glassCardCompact = 'rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02]';

interface ScheduleAppointment {
  id: string; patientName: string; reason: string; time: string; endTime: string;
  mode: 'VIDEO' | 'AUDIO' | 'CHAT' | 'IN_PERSON'; status: string; notes?: string;
}

const HOURS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];

const MOCK_APPOINTMENTS: Record<string, ScheduleAppointment[]> = {
  '0': [
    { id: '1', patientName: 'Ananya Sharma', reason: 'Follow-up consultation', time: '9:30 AM', endTime: '10:00 AM', mode: 'VIDEO', status: 'CONFIRMED' },
    { id: '2', patientName: 'Rahul Verma', reason: 'Prescription refill', time: '10:00 AM', endTime: '10:30 AM', mode: 'IN_PERSON', status: 'CHECKED_IN' },
    { id: '3', patientName: 'Priya Patel', reason: 'Lab report review', time: '11:15 AM', endTime: '11:45 AM', mode: 'VIDEO', status: 'SCHEDULED' },
    { id: '4', patientName: 'Amit Kumar', reason: 'General checkup', time: '2:00 PM', endTime: '2:30 PM', mode: 'IN_PERSON', status: 'SCHEDULED' },
    { id: '5', patientName: 'Sneha Reddy', reason: 'Telemedicine follow-up', time: '3:30 PM', endTime: '4:00 PM', mode: 'AUDIO', status: 'SCHEDULED' },
  ],
};

function getModeIcon(mode: string) {
  switch (mode) {
    case 'VIDEO': return <Video className="h-3.5 w-3.5" />;
    case 'AUDIO': return <ActivityIcon className="h-3.5 w-3.5" />;
    case 'IN_PERSON': return <MapPin className="h-3.5 w-3.5" />;
    default: return <Stethoscope className="h-3.5 w-3.5" />;
  }
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekDates(base: Date) {
  const start = new Date(base);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function SchedulePage() {
  const [view, setView] = useState<'day' | 'week'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<ScheduleAppointment | null>(null);

  const weekDates = getWeekDates(selectedDate);
  const currentDayKey = String(selectedDate.getDay());
  const dayAppointments = MOCK_APPOINTMENTS[currentDayKey] ?? MOCK_APPOINTMENTS['0'] ?? [];

  function navigate(direction: 'prev' | 'next') {
    const multiplier = view === 'day' ? 1 : 7;
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + (direction === 'prev' ? -multiplier : multiplier));
    setSelectedDate(d);
  }

  function getAppointmentForHour(hourLabel: string) {
    return dayAppointments.find((a) => a.time.startsWith(hourLabel.split(':')[0] ?? ''));
  }

  if (selectedAppointment) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
        <button onClick={() => setSelectedAppointment(null)} className="text-sm text-[#8FD3D1] hover:text-[#8FD3D1]/80 transition-colors font-ui">
          &larr; Back to Schedule
        </button>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">{selectedAppointment.patientName}</CardTitle>
              <StatusBadge status={selectedAppointment.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-white/50 font-ui">Reason</p><p className="text-sm font-medium text-white font-ui">{selectedAppointment.reason}</p></div>
              <div><p className="text-xs text-white/50 font-ui">Mode</p><p className="text-sm font-medium text-white font-ui">{selectedAppointment.mode.replace('_', ' ')}</p></div>
              <div><p className="text-xs text-white/50 font-ui">Time</p><p className="text-sm font-medium text-white font-ui">{selectedAppointment.time} - {selectedAppointment.endTime}</p></div>
              <div><p className="text-xs text-white/50 font-ui">Status</p><StatusBadge status={selectedAppointment.status} size="sm" /></div>
            </div>
            {selectedAppointment.notes && (
              <div>
                <p className="text-xs text-white/50 font-ui">Notes</p>
                <p className="text-sm text-white/70 font-ui">{selectedAppointment.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Schedule" description="Manage your appointments and time slots">
        <Tabs value={view} onValueChange={(v) => setView(v as 'day' | 'week')}>
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
          </TabsList>
        </Tabs>
      </PageHeader>

      <Card>
        <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('prev')}><ChevronLeft className="h-4 w-4" /></Button>
          <div className="text-center">
            {view === 'day' ? (
              <p className="text-sm font-semibold text-white font-display">{formatDate(selectedDate)}</p>
            ) : (
              <p className="text-sm font-semibold text-white font-display">{formatDate(weekDates[0]!)} - {formatDate(weekDates[6]!)}</p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('next')}><ChevronRight className="h-4 w-4" /></Button>
        </div>

        {view === 'week' && (
          <div className="grid grid-cols-7 gap-px border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)]">
            {weekDates.map((date, i) => {
              const isToday = isSameDay(date, new Date());
              const isSelected = isSameDay(date, selectedDate);
              return (
                <button
                  key={i}
                  onClick={() => { setSelectedDate(date); setView('day'); }}
                  className={cn(
                    'flex flex-col items-center gap-1 py-3 transition-colors',
                    isSelected && 'bg-[#8FD3D1]/10',
                    !isSelected && 'bg-transparent hover:bg-white/[0.03]',
                  )}
                >
                  <span className="text-[11px] font-medium text-white/30 font-ui">{DAYS[i]}</span>
                  <span className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                    isToday && 'bg-[#8FD3D1] text-black',
                    !isToday && isSelected && 'bg-[#8FD3D1]/20 text-[#8FD3D1]',
                    !isToday && !isSelected && 'text-white/70',
                  )}>
                    {date.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="divide-y divide-[rgba(255,255,255,0.06)]">
          {HOURS.map((hour) => {
            const apt = getAppointmentForHour(hour);
            return (
              <div key={hour} className={cn(
                'flex min-h-[60px] items-stretch transition-colors',
                apt && 'bg-[#8FD3D1]/3',
              )}>
                <div className="flex w-24 shrink-0 items-start gap-2 border-r border-[rgba(255,255,255,0.06)] px-4 py-3">
                  <Clock className="mt-0.5 h-3.5 w-3.5 text-white/30" />
                  <span className="text-xs font-medium text-white/40 font-ui">{hour}</span>
                </div>
                <div className="flex-1 px-4 py-2">
                  {apt && (
                    <button
                      onClick={() => setSelectedAppointment(apt)}
                      className="group flex w-full items-center gap-3 rounded-[16px] bg-white/[0.03] p-3 border border-[rgba(255,255,255,0.06)] transition-all hover:bg-white/[0.06] hover:border-[#8FD3D1]/30"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-white">{getInitials(apt.patientName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium text-white font-ui truncate">{apt.patientName}</p>
                        <p className="text-xs text-white/40 font-ui truncate">{apt.reason}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" size="sm" className="gap-1">
                          {getModeIcon(apt.mode)}
                          {apt.mode.replace('_', ' ')}
                        </Badge>
                        <StatusBadge status={apt.status} size="sm" />
                      </div>
                      <span className="text-xs text-white/30 font-ui">{apt.time}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}
