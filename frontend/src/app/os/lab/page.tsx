/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/os/lab/page.tsx
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
 - button
 - input
 - framer-motion
 - page-header
 *
 * Dependencies:
 - status-badge
 - card
 - react
 - badge
 - button
 - input
 - framer-motion
 - page-header
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
import { Box,
  ClipboardList,
  FlaskConical,
  FileCheck, } from 'lucide-react';

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
const QUEUE_COLLECTED = [
  { id: 'BIO-1024', patient: 'Ananya Sharma', test: 'CBC', time: '08:15 AM' },
  { id: 'BIO-1025', patient: 'Ravi Patel', test: 'HbA1c', time: '08:42 AM' },
  { id: 'BIO-1026', patient: 'Meera Nair', test: 'Lipid Profile', time: '09:05 AM' },
];

const QUEUE_IN_PROGRESS = [
  { id: 'BIO-1022', patient: 'Vikram Deshmukh', test: 'LFT', time: '07:30 AM' },
  { id: 'BIO-1023', patient: 'Priya Kapoor', test: 'KFT', time: '07:45 AM' },
];

const QUEUE_COMPLETED = [
  { id: 'BIO-1020', patient: 'Arjun Singh', test: 'CBC', time: '06:50 AM' },
  { id: 'BIO-1021', patient: 'Sita Reddy', test: 'HbA1c', time: '07:00 AM' },
];

const TEST_PARAMS: Record<string, { label: string; unit: string; range: string }[]> = {
  CBC: [
    { label: 'Hb', unit: 'g/dL', range: '13.5–17.5' },
    { label: 'WBC', unit: 'x10³/µL', range: '4.5–11.0' },
    { label: 'RBC', unit: 'x10⁶/µL', range: '4.7–6.1' },
    { label: 'Platelets', unit: 'x10³/µL', range: '150–450' },
  ],
  HbA1c: [
    { label: 'Value', unit: '%', range: '<5.7' },
    { label: 'eAG', unit: 'mg/dL', range: '<117' },
  ],
  Lipid: [
    { label: 'Total Cholesterol', unit: 'mg/dL', range: '<200' },
    { label: 'LDL', unit: 'mg/dL', range: '<100' },
    { label: 'HDL', unit: 'mg/dL', range: '>40' },
    { label: 'Triglycerides', unit: 'mg/dL', range: '<150' },
  ],
  LFT: [
    { label: 'ALT', unit: 'U/L', range: '10–40' },
    { label: 'AST', unit: 'U/L', range: '10–40' },
    { label: 'ALP', unit: 'U/L', range: '44–147' },
    { label: 'Bilirubin', unit: 'mg/dL', range: '0.1–1.2' },
    { label: 'Albumin', unit: 'g/dL', range: '3.4–5.4' },
  ],
  KFT: [
    { label: 'Creatinine', unit: 'mg/dL', range: '0.6–1.2' },
    { label: 'BUN', unit: 'mg/dL', range: '7–20' },
    { label: 'eGFR', unit: 'mL/min/1.73m²', range: '>60' },
    { label: 'Sodium', unit: 'mEq/L', range: '136–145' },
    { label: 'Potassium', unit: 'mEq/L', range: '3.5–5.1' },
  ],
};

const MOCK_AWAITING = [
  { id: 'RPT-101', patient: 'Ananya Sharma', test: 'CBC', status: 'PENDING' },
  { id: 'RPT-102', patient: 'Ravi Patel', test: 'HbA1c', status: 'PENDING' },
  { id: 'RPT-103', patient: 'Meera Nair', test: 'Lipid Profile', status: 'PENDING' },
];

const MOCK_READY = [
  { id: 'RPT-098', patient: 'Vikram Deshmukh', test: 'LFT', status: 'SUBMITTED' },
  { id: 'RPT-099', patient: 'Priya Kapoor', test: 'KFT', status: 'SUBMITTED' },
];

const MOCK_RELEASED = [
  { id: 'RPT-095', patient: 'Arjun Singh', test: 'CBC', status: 'COMPLETED' },
  { id: 'RPT-096', patient: 'Sita Reddy', test: 'HbA1c', status: 'COMPLETED' },
  { id: 'RPT-097', patient: 'Rohit Verma', test: 'Lipid Profile', status: 'COMPLETED' },
];

// ── Components ─────────────────────────────────────────
function KanbanColumn({ title, samples, count }: { title: string; samples: typeof QUEUE_COLLECTED; count: number }) {
  return (
    <motion.div variants={item} className="flex flex-col gap-3">
      <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white/90">{title}</CardTitle>
            <Badge size="sm">{count}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {samples.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/40">No samples</p>
          ) : (
            <div className="space-y-3">
              {samples.map((sample) => (
                <div
                  key={sample.id}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]"
                >
                  <p className="font-medium text-white/90">{sample.id}</p>
                  <p className="text-sm text-white/60">{sample.patient}</p>
                  <p className="text-xs text-white/50">{sample.test}</p>
                  <p className="mt-1 text-[11px] text-white/40">{sample.time}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Tab 1: Sample Queue ────────────────────────────────
function SampleQueue() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <KanbanColumn title="Collected" samples={QUEUE_COLLECTED} count={QUEUE_COLLECTED.length} />
      <KanbanColumn title="In Progress" samples={QUEUE_IN_PROGRESS} count={QUEUE_IN_PROGRESS.length} />
      <KanbanColumn title="Completed" samples={QUEUE_COMPLETED} count={QUEUE_COMPLETED.length} />
    </motion.div>
  );
}

// ── Tab 2: Sample Collection Form ──────────────────────
function SampleCollectionForm() {
  const [patient, setPatient] = useState('');
  const [test, setTest] = useState('');
  const [barcode, setBarcode] = useState('');
  const [collectionTime, setCollectionTime] = useState('');
  const [collector, setCollector] = useState('');

  const handleRecord = () => {
    // mock
    setPatient('');
    setTest('');
    setBarcode('');
    setCollectionTime('');
    setCollector('');
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="text-white/90">New Sample Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Patient</label>
                <Input
                  placeholder="Patient name"
                  value={patient}
                  onChange={(e) => setPatient(e.target.value)}
                  className="h-14 text-lg"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Test</label>
                <Input
                  placeholder="e.g. CBC, LFT"
                  value={test}
                  onChange={(e) => setTest(e.target.value)}
                  className="h-14 text-lg"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Barcode</label>
                <Input
                  placeholder="Scan or enter barcode"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="h-14 text-lg"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Collection Time</label>
                <Input
                  type="datetime-local"
                  value={collectionTime}
                  onChange={(e) => setCollectionTime(e.target.value)}
                  className="h-14 text-lg"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Collector Name</label>
                <Input
                  placeholder="Collector name"
                  value={collector}
                  onChange={(e) => setCollector(e.target.value)}
                  className="h-14 text-lg"
                />
              </div>
            </div>
            <div className="mt-6">
              <Button size="lg" className="w-full" onClick={handleRecord}>
                <FlaskConical className="mr-2 h-5 w-5" />
                Record Collection
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ── Tab 3: Result Entry ────────────────────────────────
function ResultEntry() {
  const [testType, setTestType] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});

  const handleTestChange = (val: string) => {
    setTestType(val);
    const params = TEST_PARAMS[val];
    if (params) {
      const initial: Record<string, string> = {};
      params.forEach((p) => { initial[p.label] = ''; });
      setValues(initial);
    } else {
      setValues({});
    }
  };

  const updateValue = (field: string, val: string) => {
    setValues((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = () => {
    // mock
  };

  const handleApprove = () => {
    // mock
  };

  const params = (testType ? TEST_PARAMS[testType] : []) ?? [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="text-white/90">Result Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/70">Test Type</label>
              <Select value={testType} onValueChange={handleTestChange}>
                <SelectTrigger className="h-14 text-lg">
                  <SelectValue placeholder="Select test" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CBC">CBC</SelectItem>
                  <SelectItem value="HbA1c">HbA1c</SelectItem>
                  <SelectItem value="Lipid">Lipid Profile</SelectItem>
                  <SelectItem value="LFT">LFT</SelectItem>
                  <SelectItem value="KFT">KFT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {testType && (
              <div className="mt-6 space-y-4">
                {params.map((param) => (
                  <div key={param.label} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-white/70">
                        {param.label}
                        <span className="ml-1 text-xs text-white/40">({param.unit})</span>
                      </label>
                      <span className="text-xs text-white/40">Ref: {param.range}</span>
                    </div>
                    <Input
                      placeholder={param.unit}
                      value={values[param.label] ?? ''}
                      onChange={(e) => updateValue(param.label, e.target.value)}
                      className="h-14 text-lg"
                      type="number"
                      step="0.01"
                    />
                  </div>
                ))}
              </div>
            )}

            {testType && (
              <div className="mt-6 flex gap-3">
                <Button size="lg" className="flex-1" variant="outline" onClick={handleSave}>
                  <FileCheck className="mr-2 h-5 w-5" />
                  Save Results
                </Button>
                <Button size="lg" className="flex-1" onClick={handleApprove}>
                  <FileCheck className="mr-2 h-5 w-5" />
                  Approve &amp; Release
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ── Tab 4: Pending Reports ─────────────────────────────
function PendingReports() {
  const [subTab, setSubTab] = useState('awaiting');

  const handleVerify = (_id: string) => {
    // mock
  };

  const handleRelease = (_id: string) => {
    // mock
  };

  const handleView = (_id: string) => {
    // mock
  };

  const currentList = subTab === 'awaiting' ? MOCK_AWAITING : subTab === 'ready' ? MOCK_READY : MOCK_RELEASED;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <Tabs value={subTab} onValueChange={setSubTab}>
          <TabsList className="w-full overflow-x-auto">
            <TabsTrigger value="awaiting" className="gap-2">
              Awaiting Verification
            </TabsTrigger>
            <TabsTrigger value="ready" className="gap-2">
              Ready to Release
            </TabsTrigger>
            <TabsTrigger value="released" className="gap-2">
              Released
            </TabsTrigger>
          </TabsList>

          {['awaiting', 'ready', 'released'].map((tab) => (
            <TabsContent key={tab} value={tab}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="text-white/90">
              {tab === 'awaiting'
                ? 'Awaiting Verification'
                : tab === 'ready'
                  ? 'Ready to Release'
                  : 'Released Reports'}
            </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentList.length === 0 ? (
                    <p className="py-6 text-center text-sm text-white/40">No reports</p>
                  ) : (
                    <div className="space-y-3">
                      {currentList.map((rpt) => (
                        <div
                          key={rpt.id}
                          className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4"
                        >
                          <div className="flex flex-col gap-1">
                            <p className="font-medium text-white/90">{rpt.id}</p>
                            <p className="text-sm text-white/50">
                              {rpt.patient} &middot; {rpt.test}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusBadge status={rpt.status} />
                            {tab === 'awaiting' && (
                              <Button size="sm" variant="default" onClick={() => handleVerify(rpt.id)}>
                                Verify
                              </Button>
                            )}
                            {tab === 'ready' && (
                              <Button size="sm" variant="default" onClick={() => handleRelease(rpt.id)}>
                                Release
                              </Button>
                            )}
                            {tab === 'released' && (
                              <Button size="sm" variant="outline" onClick={() => handleView(rpt.id)}>
                                View
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </motion.div>
  );
}

// ── Page ────────────────────────────────────────────────
export default function LabWorkspacePage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
      <PageHeader title="Lab Workspace" description="Operational workstation for lab technicians" />

      <Tabs defaultValue="queue">
        <TabsList className="w-full overflow-x-auto">
          <TabsTrigger value="queue" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Sample Queue
          </TabsTrigger>
          <TabsTrigger value="collection" className="gap-2">
            <FlaskConical className="h-4 w-4" />
            Sample Collection
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-2">
            <FileCheck className="h-4 w-4" />
            Result Entry
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <Box className="h-4 w-4" />
            Pending Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          <SampleQueue />
        </TabsContent>
        <TabsContent value="collection">
          <SampleCollectionForm />
        </TabsContent>
        <TabsContent value="results">
          <ResultEntry />
        </TabsContent>
        <TabsContent value="reports">
          <PendingReports />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
