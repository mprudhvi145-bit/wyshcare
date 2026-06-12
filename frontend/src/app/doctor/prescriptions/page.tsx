/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/doctor/prescriptions/page.tsx
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
 - status-badge
 - card
 - empty-state
 - react
 - skeleton
 - button
 - input
 - framer-motion
 *
 * Dependencies:
 - status-badge
 - card
 - empty-state
 - react
 - skeleton
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

import { useState, useEffect } from 'react';
import {
  Plus, Pill, Printer, Download, Trash2, Calendar,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { Card, CardContent, } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogClose,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const glassCardCompact = 'rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02]';

interface MedicationField {
  id: string; name: string; dosage: string; frequency: string; duration: string; instructions: string;
}

interface Prescription {
  id: string; patientName: string; date: string; medications: MedicationField[];
  diagnosis: string; status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx-1', patientName: 'Ananya Sharma', date: '2026-06-01',
    medications: [
      { id: 'm1', name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take after breakfast' },
      { id: 'm2', name: 'Telmisartan', dosage: '40mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take at bedtime' },
    ],
    diagnosis: 'Essential hypertension', status: 'ACTIVE',
  },
  {
    id: 'rx-2', patientName: 'Rahul Verma', date: '2026-05-28',
    medications: [
      { id: 'm3', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '60 days', instructions: 'Take with meals' },
    ],
    diagnosis: 'Type 2 diabetes mellitus', status: 'ACTIVE',
  },
  {
    id: 'rx-3', patientName: 'Priya Patel', date: '2026-05-15',
    medications: [
      { id: 'm4', name: 'Thyroxine', dosage: '75mcg', frequency: 'Once daily', duration: '90 days', instructions: 'Take on empty stomach' },
    ],
    diagnosis: 'Hypothyroidism', status: 'COMPLETED',
  },
  {
    id: 'rx-4', patientName: 'Sneha Reddy', date: '2026-05-10',
    medications: [
      { id: 'm5', name: 'Sumatriptan', dosage: '50mg', frequency: 'As needed', duration: '10 days', instructions: 'Take at onset of migraine' },
    ],
    diagnosis: 'Migraine without aura', status: 'COMPLETED',
  },
];

const MOCK_PATIENTS = ['Ananya Sharma', 'Rahul Verma', 'Priya Patel', 'Amit Kumar', 'Sneha Reddy'];

function generateId() {
  return `rx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function PrescriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(MOCK_PRESCRIPTIONS);
  const [showForm, setShowForm] = useState(false);
  const [formPatient, setFormPatient] = useState('');
  const [formDiagnosis, setFormDiagnosis] = useState('');
  const [formMeds, setFormMeds] = useState<MedicationField[]>([
    { id: 'new-1', name: '', dosage: '', frequency: '', duration: '', instructions: '' },
  ]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  function addMedication() {
    setFormMeds((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, name: '', dosage: '', frequency: '', duration: '', instructions: '' },
    ]);
  }

  function removeMedication(id: string) {
    setFormMeds((prev) => prev.filter((m) => m.id !== id));
  }

  function updateMed(id: string, field: keyof MedicationField, value: string) {
    setFormMeds((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  }

  function handleCreatePrescription() {
    if (!formPatient || !formDiagnosis || formMeds.some((m) => !m.name)) return;
    const newRx: Prescription = {
      id: generateId(), patientName: formPatient, date: new Date().toISOString().slice(0, 10),
      medications: formMeds, diagnosis: formDiagnosis, status: 'ACTIVE',
    };
    setPrescriptions((prev) => [newRx, ...prev]);
    setShowForm(false);
    setFormPatient('');
    setFormDiagnosis('');
    setFormMeds([{ id: 'new-1', name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Prescriptions" description={`${prescriptions.length} total prescriptions`}>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm">
              <Plus className="h-4 w-4" />
              New Prescription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Prescription</DialogTitle>
              <DialogDescription>Write a new prescription for a patient</DialogDescription>
            </DialogHeader>
            <div className="space-y-5 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70 font-ui">Patient</label>
                <Select value={formPatient} onValueChange={setFormPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_PATIENTS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70 font-ui">Diagnosis</label>
                <Input value={formDiagnosis} onChange={(e) => setFormDiagnosis(e.target.value)} placeholder="Enter diagnosis" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-white/70 font-ui">Medications</label>
                  <Button variant="ghost" size="sm" onClick={addMedication}>
                    <Plus className="h-3.5 w-3.5" />
                    Add Medication
                  </Button>
                </div>
                {formMeds.map((med) => (
                  <div key={med.id} className={glassCardCompact + ' p-4 space-y-3'}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-white/40 font-ui">Medication</span>
                      {formMeds.length > 1 && (
                        <button onClick={() => removeMedication(med.id)} className="text-[#FF5A5A] hover:text-[#FF5A5A]/80">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="Medication name" value={med.name} onChange={(e) => updateMed(med.id, 'name', e.target.value)} />
                      <Input placeholder="Dosage (e.g. 5mg)" value={med.dosage} onChange={(e) => updateMed(med.id, 'dosage', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="Frequency" value={med.frequency} onChange={(e) => updateMed(med.id, 'frequency', e.target.value)} />
                      <Input placeholder="Duration" value={med.duration} onChange={(e) => updateMed(med.id, 'duration', e.target.value)} />
                    </div>
                    <Input placeholder="Instructions (optional)" value={med.instructions} onChange={(e) => updateMed(med.id, 'instructions', e.target.value)} />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreatePrescription} disabled={!formPatient || !formDiagnosis || formMeds.some((m) => !m.name)}>
                  Create Prescription
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-[24px]" />
          ))}
        </div>
      ) : prescriptions.length === 0 ? (
        <EmptyState
          icon={<Pill className="h-6 w-6" />}
          title="No prescriptions yet"
          description="Create your first prescription"
          action={{ label: 'New Prescription', onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <motion.div key={rx.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="transition-all hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#8FD3D1]/10">
                        <Pill className="h-5 w-5 text-[#8FD3D1]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white font-ui">{rx.patientName}</p>
                          <StatusBadge status={rx.status} size="sm" />
                        </div>
                        <p className="mt-0.5 text-xs text-white/50 font-ui">{rx.diagnosis}</p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-white/30 font-ui">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(rx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span>{rx.medications.length} medication{rx.medications.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm"><Printer className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {rx.medications.map((med) => (
                      <div key={med.id} className={glassCardCompact + ' p-3'}>
                        <p className="text-sm font-medium text-white font-ui">{med.name} - {med.dosage}</p>
                        <p className="text-xs text-white/40 font-ui">{med.frequency} &middot; {med.duration}</p>
                        {med.instructions && (
                          <p className="mt-1 text-xs text-white/30 italic font-ui">{med.instructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
