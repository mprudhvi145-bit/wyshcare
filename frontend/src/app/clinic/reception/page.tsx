/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/clinic/reception/page.tsx
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
 - avatar
 - card
 - react
 - utils
 - queue-board
 - button
 - input
 *
 * Dependencies:
 - tabs
 - avatar
 - card
 - react
 - utils
 - queue-board
 - button
 - input
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
  Search,
  UserPlus,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, getInitials } from '@/components/ui/avatar';

import { PageHeader } from '@/components/ui/page-header';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, } from '@/components/ui/tabs';
import { QueueBoard, type QueuePatient } from '@/components/clinic/queue-board';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WalkInRegistration {
  name: string;
  phone: string;
  age: string;
  complaint: string;
}

const MOCK_QUEUE_WAITING: QueuePatient[] = [
  { id: 'q1', patientName: 'Rahul Verma', status: 'WAITING', priority: 1, waitTime: 5, severity: 'MEDIUM', checkedInAt: '09:30 AM' },
  { id: 'q2', patientName: 'Lakshmi Nair', status: 'WAITING', priority: 2, waitTime: 12, severity: 'LOW', checkedInAt: '09:25 AM' },
  { id: 'q3', patientName: 'Vikram Singh', status: 'WAITING', priority: 3, waitTime: 18, severity: 'HIGH', checkedInAt: '09:15 AM' },
  { id: 'q4', patientName: 'Meera Joshi', status: 'WAITING', priority: 4, waitTime: 22, checkedInAt: '09:10 AM' },
  { id: 'q5', patientName: 'Deepak Choudhary', status: 'WAITING', priority: 5, waitTime: 28, severity: 'LOW', checkedInAt: '09:00 AM' },
];

const MOCK_QUEUE_WITH_DOCTOR: QueuePatient[] = [
  { id: 'q6', patientName: 'Ananya Sharma', status: 'WITH_DOCTOR', priority: 1, waitTime: 0, checkedInAt: '10:00 AM' },
  { id: 'q7', patientName: 'Priya Patel', status: 'WITH_DOCTOR', priority: 2, waitTime: 0, checkedInAt: '10:05 AM' },
];

const MOCK_QUEUE_COMPLETED: QueuePatient[] = [
  { id: 'q8', patientName: 'Sneha Reddy', status: 'COMPLETED', priority: 1, waitTime: 0, checkedInAt: '09:00 AM' },
  { id: 'q9', patientName: 'Amit Kumar', status: 'COMPLETED', priority: 2, waitTime: 0, checkedInAt: '09:30 AM' },
];

export default function ReceptionPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [queueTab, setQueueTab] = useState('waiting');

  const [walkIn, setWalkIn] = useState<WalkInRegistration>({
    name: '', phone: '', age: '', complaint: '',
  });

  const [queueWaiting, setQueueWaiting] = useState(MOCK_QUEUE_WAITING);
  const [queueWithDoctor] = useState(MOCK_QUEUE_WITH_DOCTOR);
  const [queueCompleted] = useState(MOCK_QUEUE_COMPLETED);

  function callNext() {
    if (queueWaiting.length === 0) return;
    const [_next, ...rest] = queueWaiting;
    setQueueWaiting(rest);
  }

  function handleWalkInSubmit() {
    if (!walkIn.name || !walkIn.phone) return;
    setWalkInOpen(false);
    setWalkIn({ name: '', phone: '', age: '', complaint: '' });
  }

  const currentQueue = queueTab === 'waiting' ? queueWaiting : queueTab === 'withDoctor' ? queueWithDoctor : queueCompleted;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Reception OS" description="Manage patient queue and check-ins">
        <div className="flex gap-2">
          <Dialog open={checkInOpen} onOpenChange={setCheckInOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <Search className="h-4 w-4" />
                Check-in Patient
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Check-in Patient</DialogTitle>
                <DialogDescription>Search for an existing patient or register a walk-in</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-xs font-medium text-white/70">Search by name or phone</label>
                  <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {['Ananya Sharma', 'Rahul Verma', 'Priya Patel', 'Amit Kumar', 'Sneha Reddy']
                    .filter((n) => n.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((name) => (
                      <button
                        key={name}
                        className="flex w-full items-center gap-3 rounded-xl border border-white/[0.08] p-3 text-left transition-colors hover:bg-white/[0.06]"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{getInitials(name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-white">{name}</span>
                        <ArrowRight className="ml-auto h-4 w-4 text-white/30" />
                      </button>
                    ))}
                </div>
                <div className="border-t border-white/[0.08] pt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => { setCheckInOpen(false); setWalkInOpen(true); }}
                  >
                    <UserPlus className="h-4 w-4" />
                    Walk-in Registration
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="px-5 pt-5">
              <Tabs value={queueTab} onValueChange={setQueueTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="waiting" className="flex-1">Waiting ({queueWaiting.length})</TabsTrigger>
                  <TabsTrigger value="withDoctor" className="flex-1">With Doctor ({queueWithDoctor.length})</TabsTrigger>
                  <TabsTrigger value="completed" className="flex-1">Completed ({queueCompleted.length})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="p-5">
              <QueueBoard patients={currentQueue} />
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Real-time Queue Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                {queueWaiting.slice(0, 8).map((p, i) => (
                  <div key={p.id} className="flex flex-1 flex-col items-center gap-1">
                    <Avatar className={cn('h-8 w-8', i === 0 && 'ring-2 ring-cyan-500 ring-offset-2')}>
                      <AvatarFallback className="text-[10px]">{getInitials(p.patientName)}</AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        'h-16 w-full rounded-lg',
                        i === 0 ? 'bg-cyan-500' : 'bg-cyan-200',
                      )}
                      style={{ height: `${24 + (8 - i) * 4}px` }}
                    />
                    <span className="text-[10px] text-slate-400">#{p.priority}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Queue Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="default"
                className="w-full justify-start"
                onClick={callNext}
                disabled={queueWaiting.length === 0}
              >
                <Phone className="h-4 w-4" />
                Call Next Patient
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => { setCheckInOpen(true); }}
              >
                <UserPlus className="h-4 w-4" />
                Check-in Patient
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Queue Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Total waiting</span>
                <span className="text-sm font-semibold text-white">{queueWaiting.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Avg wait time</span>
                <span className="text-sm font-semibold text-[#FFD84D]">17 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Longest wait</span>
                <span className="text-sm font-semibold text-red-500">28 min</span>
              </div>
            </CardContent>
          </Card>

          <Dialog open={walkInOpen} onOpenChange={setWalkInOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Walk-in Registration</DialogTitle>
                <DialogDescription>Register a new patient walk-in</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-xs font-medium text-white/70">Full Name</label>
                  <Input value={walkIn.name} onChange={(e) => setWalkIn({ ...walkIn, name: e.target.value })} placeholder="Patient name" />
                </div>
                <div>
                  <label className="text-xs font-medium text-white/70">Phone</label>
                  <Input value={walkIn.phone} onChange={(e) => setWalkIn({ ...walkIn, phone: e.target.value })} placeholder="Phone number" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-white/70">Age</label>
                    <Input value={walkIn.age} onChange={(e) => setWalkIn({ ...walkIn, age: e.target.value })} placeholder="Age" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Severity</label>
                    <Select defaultValue="LOW">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">Chief Complaint</label>
                  <Input value={walkIn.complaint} onChange={(e) => setWalkIn({ ...walkIn, complaint: e.target.value })} placeholder="Reason for visit" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleWalkInSubmit} disabled={!walkIn.name || !walkIn.phone}>
                    Register & Check-in
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </motion.div>
  );
}
