/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/os/reception/page.tsx
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
 - card
 - react
 - badge
 - button
 - input
 - framer-motion
 *
 * Dependencies:
 - tabs
 - status-badge
 - card
 - react
 - badge
 - button
 - input
 - framer-motion
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
  UserPlus, ClipboardList, Calendar, Search, ArrowRight, LogIn, Users, ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/ui/page-header';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
};

const statCards = [
  { label: 'New Registrations', value: '8', color: 'text-blue-300' },
  { label: 'Check-ins Today', value: '24', color: 'text-emerald-300' },
  { label: 'Walk-ins', value: '6', color: 'text-amber-300' },
  { label: 'Scheduled', value: '18', color: 'text-violet-300' },
];

const todayAppointments = [
  { time: '09:00', patient: 'Ananya Sharma', doctor: 'Dr. Mehta', mode: 'In-Person', status: 'CHECKED_IN' },
  { time: '09:30', patient: 'Rahul Verma', doctor: 'Dr. Singh', mode: 'Video', status: 'WAITING' },
  { time: '10:00', patient: 'Priya Patel', doctor: 'Dr. Mehta', mode: 'In-Person', status: 'SCHEDULED' },
  { time: '10:30', patient: 'Amit Kumar', doctor: 'Dr. Kapoor', mode: 'In-Person', status: 'SCHEDULED' },
  { time: '11:00', patient: 'Sneha Reddy', doctor: 'Dr. Singh', mode: 'Video', status: 'SCHEDULED' },
  { time: '02:00', patient: 'Vikram Singh', doctor: 'Dr. Mehta', mode: 'In-Person', status: 'SCHEDULED' },
];

const queueData = [
  { position: 1, patient: 'Rahul Verma', token: 'A-001', doctor: 'Dr. Mehta', status: 'In Progress' },
  { position: 2, patient: 'Lakshmi Nair', token: 'A-002', doctor: 'Dr. Singh', status: 'Waiting' },
  { position: 3, patient: 'Vikram Singh', token: 'A-003', doctor: 'Dr. Kapoor', status: 'Called' },
  { position: 4, patient: 'Meera Joshi', token: 'A-004', doctor: 'Dr. Mehta', status: 'Waiting' },
  { position: 5, patient: 'Arun Kumar', token: 'A-005', doctor: 'Dr. Singh', status: 'Waiting' },
  { position: 6, patient: 'Pooja Desai', token: 'A-006', doctor: 'Dr. Kapoor', status: 'Waiting' },
];

const walkInPatients = [
  { name: 'Rajesh Kumar', phone: '9876543210', lastVisit: '2 weeks ago' },
  { name: 'Sunita Sharma', phone: '8765432109', lastVisit: 'New patient' },
  { name: 'Deepak Verma', phone: '7654321098', lastVisit: '1 month ago' },
];

export default function ReceptionWorkspace() {
  const [activeTab, setActiveTab] = useState('register');
  const [formData, setFormData] = useState({ fullName: '', phone: '', age: '', gender: '', address: '' });
  const [patientId, setPatientId] = useState('');
  const [registered, setRegistered] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFormChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleReset = () => { setFormData({ fullName: '', phone: '', age: '', gender: '', address: '' }); setRegistered(false); setPatientId(''); };
  const handleRegister = () => { const id = `PID-${Date.now().toString(36).toUpperCase()}`; setPatientId(id); setRegistered(true); };

  const filteredWalkIns = walkInPatients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.phone.includes(searchQuery)
  );

  return (
    <motion.div {...fadeUp} className="bg-[#0B0D10] min-h-screen space-y-6">
      <PageHeader title="Reception" description="Patient Intake & Queue Management" />

      {/* Quick Actions Hero */}
      <motion.div {...fadeUp}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <Button size="lg" className="h-20 text-lg font-semibold gap-3 bg-blue-600 hover:bg-blue-700 text-white shadow-md col-span-2 sm:col-span-1"
                onClick={() => setActiveTab('register')}>
                <UserPlus className="h-6 w-6" /> Register Patient
              </Button>
              <Button size="lg" variant="secondary" className="h-20 text-lg font-semibold gap-3 col-span-2 sm:col-span-1"
                onClick={() => setActiveTab('checkin')}>
                <LogIn className="h-5 w-5" /> Check-In
              </Button>
              <Button variant="outline" className="justify-start gap-3"
                onClick={() => setActiveTab('checkin')}>
                <ArrowRight className="h-5 w-5" /> Walk-In
              </Button>
              <Button variant="outline" className="justify-start gap-3"
                onClick={() => setActiveTab('appointments')}>
                <Calendar className="h-5 w-5" /> Schedule Appointment
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Overview Bar */}
      <motion.div {...fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(stat => (
          <Card key={stat.label} className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/50">{stat.label}</p>
                <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-white/40" />
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Tabs */}
      <motion.div {...fadeUp}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto gap-0 p-0">
            <TabsTrigger value="register" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#8FD3D1] data-[state=active]:text-[#8FD3D1] data-[state=active]:bg-transparent px-5 py-3">
              <UserPlus className="h-4 w-4 mr-2" /> Register Patient
            </TabsTrigger>
            <TabsTrigger value="checkin" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#8FD3D1] data-[state=active]:text-[#8FD3D1] data-[state=active]:bg-transparent px-5 py-3">
              <LogIn className="h-4 w-4 mr-2" /> Check In / Walk In
            </TabsTrigger>
            <TabsTrigger value="appointments" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#8FD3D1] data-[state=active]:text-[#8FD3D1] data-[state=active]:bg-transparent px-5 py-3">
              <Calendar className="h-4 w-4 mr-2" /> Appointments
            </TabsTrigger>
            <TabsTrigger value="queue" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#8FD3D1] data-[state=active]:text-[#8FD3D1] data-[state=active]:bg-transparent px-5 py-3">
              <Users className="h-4 w-4 mr-2" /> Queue
            </TabsTrigger>
          </TabsList>

          {/* Tab: Register */}
          <TabsContent value="register" className="pt-6">
            {registered ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                  <UserPlus className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white/90">Patient Registered Successfully</h3>
                <p className="mt-2 text-3xl font-bold text-emerald-400 tracking-wider">{patientId}</p>
                <p className="mt-1 text-sm text-white/50">Share this ID with the patient.</p>
                <div className="flex gap-3 justify-center mt-6">
                  <Button variant="outline" onClick={handleReset}>Register Another</Button>
                  <Button onClick={() => setActiveTab('queue')}>View Queue <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
              </motion.div>
            ) : (
              <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
                <CardHeader><CardTitle className="text-white/90">New Patient Registration</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-white/70">Full Name</label>
                      <Input placeholder="Patient's full name" value={formData.fullName} onChange={e => handleFormChange('fullName', e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-white/70">Phone Number</label>
                      <Input placeholder="Phone number" value={formData.phone} onChange={e => handleFormChange('phone', e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-white/70">Age / DOB</label>
                      <Input placeholder="Age or date of birth" value={formData.age} onChange={e => handleFormChange('age', e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-white/70">Gender</label>
                      <Input placeholder="Male / Female / Other" value={formData.gender} onChange={e => handleFormChange('gender', e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-white/70">Address</label>
                      <Input placeholder="Full address" value={formData.address} onChange={e => handleFormChange('address', e.target.value)} />
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button size="lg" className="w-full md:w-auto" onClick={handleRegister}>
                      <UserPlus className="h-4 w-4 mr-2" /> Register & Create Record
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Check In / Walk In */}
          <TabsContent value="checkin" className="pt-6 space-y-6">
            <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
              <CardHeader><CardTitle className="text-white/90">Find Patient</CardTitle></CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input className="pl-10" placeholder="Search by name or phone..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                {searchQuery && (
                  <div className="mt-4 space-y-2">
                    {filteredWalkIns.map(p => (
                      <div key={p.phone} className="flex items-center justify-between p-3 rounded-lg border border-white/5 hover:bg-white/[0.04]">
                        <div>
                          <p className="font-medium text-sm text-white/90">{p.name}</p>
                          <p className="text-xs text-white/50">{p.phone} · {p.lastVisit}</p>
                        </div>
                        <Button size="sm"><LogIn className="h-3 w-3 mr-1" /> Check In</Button>
                      </div>
                    ))}
                    {filteredWalkIns.length === 0 && <p className="text-sm text-white/50 py-4">No patient found. Register a new patient.</p>}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
              <CardHeader><CardTitle className="text-white/90">Quick Walk-In Registration</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input placeholder="Full name" />
                  <Input placeholder="Phone" />
                  <Button><ArrowRight className="h-4 w-4 mr-1" /> Register Walk-In</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Appointments */}
          <TabsContent value="appointments" className="pt-6">
            <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
              <CardHeader><CardTitle className="text-white/90">Today's Appointments</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                  {todayAppointments.map(apt => (
                    <div key={`${apt.time}-${apt.patient}`} className="flex items-center gap-4 p-4 hover:bg-white/[0.04]">
                      <div className="text-sm font-medium text-white/40 min-w-[48px]">{apt.time}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/90">{apt.patient}</p>
                        <p className="text-xs text-white/50">{apt.doctor} · {apt.mode}</p>
                      </div>
                      <StatusBadge status={apt.status} size="sm" />
                      <Button size="sm" variant="ghost" className="shrink-0">
                        <LogIn className="h-4 w-4 mr-1" /> Check In
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Queue */}
          <TabsContent value="queue" className="pt-6">
            <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-white/90"><Users className="h-5 w-5 text-blue-300" /> Current Queue</CardTitle>
                <Button size="sm" className="gap-2"><Users className="h-4 w-4" /> Call Next</Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="text-left p-4 font-medium text-white/50">#</th>
                        <th className="text-left p-4 font-medium text-white/50">Patient</th>
                        <th className="text-left p-4 font-medium text-white/50">Token</th>
                        <th className="text-left p-4 font-medium text-white/50">Doctor</th>
                        <th className="text-left p-4 font-medium text-white/50">Status</th>
                        <th className="text-right p-4 font-medium text-white/50">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {queueData.map(entry => (
                        <tr key={entry.token} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 text-white/50">{entry.position}</td>
                          <td className="p-4 font-medium text-white/90">{entry.patient}</td>
                          <td className="p-4"><Badge variant="outline" className="font-mono text-xs">{entry.token}</Badge></td>
                          <td className="p-4 text-white/50">{entry.doctor}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              entry.status === 'In Progress' ? 'bg-emerald-500/20 text-emerald-300' :
                              entry.status === 'Called' ? 'bg-amber-500/20 text-amber-300' :
                              'bg-blue-500/20 text-blue-300'
                            }`}>{entry.status}</span>
                          </td>
                          <td className="p-4 text-right">
                            <Button size="sm" variant="ghost" className="gap-1"><ChevronRight className="h-4 w-4" /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
