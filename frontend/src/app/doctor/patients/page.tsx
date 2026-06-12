/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/doctor/patients/page.tsx
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
 - avatar
 - card
 - empty-state
 - react
 - badge
 - search-input
 - skeleton
 - button
 *
 * Dependencies:
 - avatar
 - card
 - empty-state
 - react
 - badge
 - search-input
 - skeleton
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

import { useState, useEffect } from 'react';
import { ChevronRight, Pill, Plus, Calendar, FileText, Search } from 'lucide-react';
import { motion, } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, getInitials } from '@/components/ui/avatar';

import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { SearchInput } from '@/components/ui/search-input';
import { EmptyState } from '@/components/ui/empty-state';

const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';
const glassCardCompact = 'rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02]';

interface Medication { id: string; name: string; dosage: string; frequency: string; duration: string; }
interface Visit { id: string; date: string; reason: string; doctor: string; }
interface Patient {
  id: string; name: string; age: number; phone: string; condition: string;
  lastVisit: string; medications: Medication[]; visits: Visit[]; upcomingAppointment?: string;
}

const MOCK_PATIENTS: Patient[] = [
  {
    id: '1', name: 'Ananya Sharma', age: 32, phone: '+91-9876543210',
    condition: 'Hypertension', lastVisit: '2 weeks ago',
    medications: [
      { id: 'm1', name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: '30 days' },
      { id: 'm2', name: 'Telmisartan', dosage: '40mg', frequency: 'Once daily', duration: '30 days' },
    ],
    visits: [
      { id: 'v1', date: '2026-05-20', reason: 'Follow-up BP check', doctor: 'Dr. Mehta' },
      { id: 'v2', date: '2026-04-15', reason: 'Initial consultation', doctor: 'Dr. Mehta' },
    ],
    upcomingAppointment: '2026-06-10',
  },
  {
    id: '2', name: 'Rahul Verma', age: 45, phone: '+91-9876543211',
    condition: 'Diabetes Type 2', lastVisit: '1 week ago',
    medications: [{ id: 'm3', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '60 days' }],
    visits: [{ id: 'v3', date: '2026-05-28', reason: 'Blood sugar review', doctor: 'Dr. Mehta' }],
    upcomingAppointment: '2026-06-15',
  },
  {
    id: '3', name: 'Priya Patel', age: 28, phone: '+91-9876543212',
    condition: 'Thyroid disorder', lastVisit: '3 days ago',
    medications: [{ id: 'm4', name: 'Thyroxine', dosage: '75mcg', frequency: 'Once daily', duration: '90 days' }],
    visits: [{ id: 'v4', date: '2026-06-01', reason: 'Thyroid panel review', doctor: 'Dr. Mehta' }],
  },
  {
    id: '4', name: 'Amit Kumar', age: 55, phone: '+91-9876543213',
    condition: 'Arthritis', lastVisit: '1 month ago', medications: [], visits: [],
  },
  {
    id: '5', name: 'Sneha Reddy', age: 35, phone: '+91-9876543214',
    condition: 'Migraine', lastVisit: '5 days ago',
    medications: [
      { id: 'm5', name: 'Sumatriptan', dosage: '50mg', frequency: 'As needed', duration: '10 days' },
      { id: 'm6', name: 'Propranolol', dosage: '20mg', frequency: 'Twice daily', duration: '30 days' },
    ],
    visits: [{ id: 'v5', date: '2026-05-30', reason: 'Migraine follow-up', doctor: 'Dr. Mehta' }],
  },
];

function PatientDetailView({ patient, onBack }: { patient: Patient; onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <button onClick={onBack} className="text-sm text-[#8FD3D1] hover:text-[#8FD3D1]/80 transition-colors font-ui">
        &larr; Back to Patients
      </button>

      <Card>
        <CardContent className="flex items-start gap-4 pt-6">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg text-white">{getInitials(patient.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white font-display">{patient.name}</h2>
            <div className="mt-1 flex flex-wrap gap-3 text-sm text-white/50 font-ui">
              <span>{patient.age} yrs</span>
              <span>{patient.phone}</span>
              <Badge variant="default" size="sm">{patient.condition}</Badge>
            </div>
            <p className="mt-2 text-xs text-white/30 font-ui">Last visit: {patient.lastVisit}</p>
          </div>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4" />
            Add Notes
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Pill className="h-4 w-4 text-[#8FD3D1]" />
              Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.medications.length === 0 ? (
              <p className="text-sm text-white/40 font-ui">No active medications</p>
            ) : (
              <div className="space-y-3">
                {patient.medications.map((med) => (
                  <div key={med.id} className={glassCardCompact + ' p-3'}>
                    <p className="text-sm font-medium text-white font-ui">{med.name} - {med.dosage}</p>
                    <p className="text-xs text-white/40 font-ui">{med.frequency} &middot; {med.duration}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-[#8FD3D1]" />
              Upcoming Appointment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.upcomingAppointment ? (
              <div className={glassCardCompact + ' p-3'}>
                <p className="text-sm font-medium text-white font-ui">
                  {new Date(patient.upcomingAppointment).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
            ) : (
              <p className="text-sm text-white/40 font-ui">No upcoming appointments</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-[#8FD3D1]" />
            Visit History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patient.visits.length === 0 ? (
            <p className="text-sm text-white/40 font-ui">No visit history</p>
          ) : (
            <div className="divide-y divide-[rgba(255,255,255,0.06)]">
              {patient.visits.map((visit) => (
                <div key={visit.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-white font-ui">{visit.reason}</p>
                    <p className="text-xs text-white/40 font-ui">{visit.doctor}</p>
                  </div>
                  <span className="text-xs text-white/30 font-ui">
                    {new Date(visit.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function PatientsPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients] = useState(MOCK_PATIENTS);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      p.condition.toLowerCase().includes(search.toLowerCase()),
  );

  if (selectedPatient) {
    return <PatientDetailView patient={selectedPatient} onBack={() => setSelectedPatient(null)} />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Patients" description="Search and manage your patients">
        <Button variant="default" size="sm" disabled>
          <Plus className="h-4 w-4" />
          Add Patient
        </Button>
      </PageHeader>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by name, phone, or condition..."
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-[24px]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="No patients found"
          description={search ? 'Try a different search term' : 'No patients assigned yet'}
          action={!search ? { label: 'Add Patient', onClick: () => {} } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((patient) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <button
                onClick={() => setSelectedPatient(patient)}
                className={'w-full text-left ' + glassCard + ' p-5 transition-all hover:border-[#8FD3D1]/30'}
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="text-white">{getInitials(patient.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white font-ui truncate">{patient.name}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span className="text-xs text-white/40 font-ui">{patient.age} yrs</span>
                      <Badge variant="outline" size="sm">{patient.condition}</Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-white/30 font-ui">{patient.phone}</span>
                      <span className="text-[11px] text-white/30 font-ui">{patient.lastVisit}</span>
                    </div>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-white/20" />
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
