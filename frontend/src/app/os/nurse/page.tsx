/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/os/nurse/page.tsx
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
 - react
 - badge
 - session-store
 - button
 - input
 - framer-motion
 *
 * Dependencies:
 - status-badge
 - card
 - react
 - badge
 - session-store
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
import { motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  HeartPulse,
  Pill,
  Plus,
  Syringe,
  Users,
} from 'lucide-react';

import { useSessionStore } from '@/stores/session-store';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

// ── Mock Data ──────────────────────────────────────────
const MOCK_TASKS = [
  { id: '1', patient: 'Ananya Sharma', title: 'Assist with ambulation', priority: 'HIGH' },
  { id: '2', patient: 'Ravi Patel', title: 'Wound dressing change', priority: 'MEDIUM' },
  { id: '3', patient: 'Meera Nair', title: 'Catheter care', priority: 'LOW' },
  { id: '4', patient: 'Arjun Singh', title: 'Fall risk assessment', priority: 'HIGH' },
  { id: '5', patient: 'Priya Kapoor', title: 'Dietary consultation follow-up', priority: 'MEDIUM' },
  { id: '6', patient: 'Vikram Deshmukh', title: 'IV line monitoring', priority: 'HIGH' },
  { id: '7', patient: 'Sita Reddy', title: 'Prepare for discharge', priority: 'LOW' },
];

const MOCK_MEDICATIONS = [
  { id: '1', name: 'Amoxicillin', dosage: '500mg', time: '08:00', status: 'COMPLETED' },
  { id: '2', name: 'Metformin', dosage: '1000mg', time: '12:00', status: 'PENDING' },
  { id: '3', name: 'Lisinopril', dosage: '10mg', time: '14:00', status: 'PENDING' },
  { id: '4', name: 'Atorvastatin', dosage: '20mg', time: '18:00', status: 'PENDING' },
  { id: '5', name: 'Omeprazole', dosage: '40mg', time: '20:00', status: 'MISSED' },
  { id: '6', name: 'Cetirizine', dosage: '10mg', time: '22:00', status: 'SCHEDULED' },
];

const MOCK_HANDOVERS = [
  { id: '1', patient: 'Ananya Sharma', condition: 'Post-op recovery', priority: 'HIGH', notes: 'Monitor vitals every 2 hours', acknowledged: false },
  { id: '2', patient: 'Ravi Patel', condition: 'Stable', priority: 'LOW', notes: 'Discharge paperwork ready', acknowledged: true },
  { id: '3', patient: 'Meera Nair', condition: 'Under observation', priority: 'MEDIUM', notes: 'Potential allergic reaction to penicillin', acknowledged: false },
];

const MOCK_PATIENT_TASKS = [
  { id: '1', title: 'Collect lab samples', description: 'Blood and urine samples for Room 204', priority: 'HIGH', dueDate: '2026-06-05', status: 'PENDING' },
  { id: '2', title: 'Update care plan', description: 'Review and update care plan for ICU patients', priority: 'MEDIUM', dueDate: '2026-06-06', status: 'IN_PROGRESS' },
  { id: '3', title: 'Equipment check', description: 'Verify defibrillator and crash cart inventory', priority: 'LOW', dueDate: '2026-06-07', status: 'COMPLETED' },
];

const priorityVariant = { HIGH: 'danger', MEDIUM: 'warning', LOW: 'secondary' } as const;

// ── Components ─────────────────────────────────────────
function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <motion.div variants={item}>
      <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)] p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300">
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold text-white/90">{value}</p>
            <p className="text-sm text-white/50">{label}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ── Tab 1: Ward Overview ───────────────────────────────
function WardOverview() {
  const { user } = useSessionStore();
  const nurseName = user?.fullName ?? 'Nurse';
  const [tasks, setTasks] = useState(MOCK_TASKS);

  const handleComplete = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h2 className="text-xl font-semibold text-white/90">Good morning, {nurseName} 👋</h2>
        <p className="text-sm text-white/50">Here is your ward summary for today</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<Users className="h-6 w-6" />} label="Patients in Ward" value="12" />
        <StatCard icon={<AlertCircle className="h-6 w-6" />} label="Critical Alerts" value="3" />
        <StatCard icon={<ClipboardList className="h-6 w-6" />} label="Pending Tasks" value="7" />
        <StatCard icon={<Pill className="h-6 w-6" />} label="Medication Due" value="5" />
      </div>

      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="text-white/90">Pending Care Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <p className="py-6 text-center text-sm text-white/40">All tasks completed</p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="font-medium text-white/90">{task.patient}</p>
                      <p className="text-sm text-white/50">{task.title}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={priorityVariant[task.priority as keyof typeof priorityVariant]}>
                        {task.priority}
                      </Badge>
                      <Button size="sm" variant="default" onClick={() => handleComplete(task.id)}>
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                        Complete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ── Tab 2: Medication Administration ────────────────────
function MedicationAdministration() {
  const [meds, setMeds] = useState(MOCK_MEDICATIONS);

  const updateStatus = (id: string, status: string) => {
    setMeds((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="text-white/90">Medications Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {meds.map((med) => (
                <div
                  key={med.id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4"
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-white/90">{med.name}</p>
                    <p className="text-sm text-white/50">
                      {med.dosage} &middot; {med.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={med.status} />
                    {med.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="default" onClick={() => updateStatus(med.id, 'COMPLETED')}>
                          <Syringe className="mr-1 h-4 w-4" />
                          Administer
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(med.id, 'MISSED')}>
                          Missed
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => updateStatus(med.id, 'SKIPPED')}>
                          Skipped
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ── Tab 3: Vitals Entry ────────────────────────────────
function VitalsEntry() {
  const [vitals, setVitals] = useState({
    systolic: '',
    diastolic: '',
    pulse: '',
    temperature: '',
    spo2: '',
    respiratoryRate: '',
    weight: '',
  });

  const updateVital = (field: string, value: string) => {
    setVitals((prev) => ({ ...prev, [field]: value }));
  };

  const handleRecord = () => {
    // mock
    setVitals({ systolic: '', diastolic: '', pulse: '', temperature: '', spo2: '', respiratoryRate: '', weight: '' });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="text-white/90">Record Vital Signs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">BP Systolic</label>
                <Input
                  placeholder="120"
                  value={vitals.systolic}
                  onChange={(e) => updateVital('systolic', e.target.value)}
                  className="h-14 text-lg"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">BP Diastolic</label>
                <Input
                  placeholder="80"
                  value={vitals.diastolic}
                  onChange={(e) => updateVital('diastolic', e.target.value)}
                  className="h-14 text-lg"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Pulse (bpm)</label>
                <Input
                  placeholder="72"
                  value={vitals.pulse}
                  onChange={(e) => updateVital('pulse', e.target.value)}
                  className="h-14 text-lg"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Temperature (&deg;C)</label>
                <Input
                  placeholder="36.6"
                  value={vitals.temperature}
                  onChange={(e) => updateVital('temperature', e.target.value)}
                  className="h-14 text-lg"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">SpO2 (%)</label>
                <Input
                  placeholder="98"
                  value={vitals.spo2}
                  onChange={(e) => updateVital('spo2', e.target.value)}
                  className="h-14 text-lg"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Respiratory Rate</label>
                <Input
                  placeholder="16"
                  value={vitals.respiratoryRate}
                  onChange={(e) => updateVital('respiratoryRate', e.target.value)}
                  className="h-14 text-lg"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Weight (kg)</label>
                <Input
                  placeholder="70"
                  value={vitals.weight}
                  onChange={(e) => updateVital('weight', e.target.value)}
                  className="h-14 text-lg"
                />
              </div>
            </div>
            <div className="mt-6">
              <Button size="lg" className="w-full" onClick={handleRecord}>
                <Activity className="mr-2 h-5 w-5" />
                Record Vitals
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ── Tab 4: Shift Handover ──────────────────────────────
function ShiftHandover() {
  const [patient, setPatient] = useState('');
  const [condition, setCondition] = useState('');
  const [priority, setPriority] = useState('');
  const [notes, setNotes] = useState('');
  const [handovers, setHandovers] = useState(MOCK_HANDOVERS);

  const handleSubmit = () => {
    if (!patient || !condition || !priority) return;
    const newHandover = {
      id: String(Date.now()),
      patient,
      condition,
      priority,
      notes,
      acknowledged: false,
    };
    setHandovers((prev) => [newHandover, ...prev]);
    setPatient('');
    setCondition('');
    setPriority('');
    setNotes('');
  };

  const handleAcknowledge = (id: string) => {
    setHandovers((prev) => prev.map((h) => (h.id === id ? { ...h, acknowledged: true } : h)));
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="text-white/90">Create Handover</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Patient</label>
                <Input
                  placeholder="Enter patient name"
                  value={patient}
                  onChange={(e) => setPatient(e.target.value)}
                  className="h-14 text-lg"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Condition</label>
                <Input
                  placeholder="e.g. Post-op recovery"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="h-14 text-lg"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Priority</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="h-14 text-lg">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">HIGH</SelectItem>
                    <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                    <SelectItem value="LOW">LOW</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Notes</label>
                <div
                  contentEditable
                  role="textbox"
                  aria-multiline="true"
                  onInput={(e) => setNotes((e.target as HTMLDivElement).textContent ?? '')}
                  className="h-28 w-full overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-[#1C2025] p-4 text-sm text-white/90 outline-none transition focus:border-[#8FD3D1] focus:ring-2 focus:ring-[#8FD3D1]/20"
                />
              </div>
              <Button size="lg" onClick={handleSubmit}>Submit Handover</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="text-white/90">Recent Handovers</CardTitle>
          </CardHeader>
          <CardContent>
            {handovers.length === 0 ? (
              <p className="py-6 text-center text-sm text-white/40">No handovers</p>
            ) : (
              <div className="space-y-3">
                {handovers.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white/90">{h.patient}</p>
                        <Badge variant={priorityVariant[h.priority as keyof typeof priorityVariant]}>
                          {h.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-white/50">{h.condition}</p>
                      {h.notes && <p className="text-xs text-white/40">{h.notes}</p>}
                    </div>
                    {!h.acknowledged ? (
                      <Button size="sm" variant="default" onClick={() => handleAcknowledge(h.id)}>
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                        Acknowledge
                      </Button>
                    ) : (
                      <StatusBadge status="COMPLETED" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ── Tab 5: Patient Tasks ────────────────────────────────
function PatientTasks() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tasks, setTasks] = useState(MOCK_PATIENT_TASKS);

  const handleCreate = () => {
    if (!title || !priority || !dueDate) return;
    const newTask = {
      id: String(Date.now()),
      title,
      description,
      priority,
      dueDate,
      status: 'PENDING',
    };
    setTasks((prev) => [newTask, ...prev]);
    setTitle('');
    setDescription('');
    setPriority('');
    setDueDate('');
  };

  const handleComplete = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'COMPLETED' } : t)));
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="text-white/90">Create Task</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Title</label>
                <Input
                  placeholder="Task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-14 text-lg"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Description</label>
                <div
                  contentEditable
                  role="textbox"
                  aria-multiline="true"
                  onInput={(e) => setDescription((e.target as HTMLDivElement).textContent ?? '')}
                  className="h-24 w-full overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-[#1C2025] p-4 text-sm text-white/90 outline-none transition focus:border-[#8FD3D1] focus:ring-2 focus:ring-[#8FD3D1]/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white/70">Priority</label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="h-14 text-lg">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HIGH">HIGH</SelectItem>
                      <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                      <SelectItem value="LOW">LOW</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white/70">Due Date</label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-14 text-lg"
                  />
                </div>
              </div>
              <Button size="lg" onClick={handleCreate}>
                <Plus className="mr-2 h-5 w-5" />
                Create Task
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="text-white/90">All Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <p className="py-6 text-center text-sm text-white/40">No tasks yet</p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white/90">{task.title}</p>
                        <Badge variant={priorityVariant[task.priority as keyof typeof priorityVariant]}>
                          {task.priority}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-sm text-white/50">{task.description}</p>
                      )}
                      <p className="text-xs text-white/40">Due: {task.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={task.status} />
                      {task.status !== 'COMPLETED' && (
                        <Button size="sm" variant="default" onClick={() => handleComplete(task.id)}>
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ── Page ────────────────────────────────────────────────
export default function NurseStationPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="bg-[#0B0D10] min-h-screen space-y-6 p-4 md:p-6 lg:p-8">
      <PageHeader title="Nurse Station" description="Manage your ward tasks and patient care" />

      <Tabs defaultValue="overview">
        <TabsList className="w-full overflow-x-auto">
          <TabsTrigger value="overview" className="gap-2">
            <Users className="h-4 w-4" />
            Ward Overview
          </TabsTrigger>
          <TabsTrigger value="medications" className="gap-2">
            <Pill className="h-4 w-4" />
            Medications
          </TabsTrigger>
          <TabsTrigger value="vitals" className="gap-2">
            <HeartPulse className="h-4 w-4" />
            Vitals Entry
          </TabsTrigger>
          <TabsTrigger value="handover" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Shift Handover
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <Activity className="h-4 w-4" />
            Patient Tasks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <WardOverview />
        </TabsContent>
        <TabsContent value="medications">
          <MedicationAdministration />
        </TabsContent>
        <TabsContent value="vitals">
          <VitalsEntry />
        </TabsContent>
        <TabsContent value="handover">
          <ShiftHandover />
        </TabsContent>
        <TabsContent value="tasks">
          <PatientTasks />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
