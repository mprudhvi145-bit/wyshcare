/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/os/insurance/page.tsx
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
import {
  Shield,
  FileSearch,
  ClipboardCheck,
  Search,
  CheckCircle,
  XCircle,
  Activity,
} from 'lucide-react';

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

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

// ── Mock Data ──────────────────────────────────────────
const MOCK_CLAIMS = [
  { id: 'CLM-001', patient: 'Ananya Sharma', provider: 'Star Health', amount: 45000, status: 'APPROVED', date: '2026-05-20' },
  { id: 'CLM-002', patient: 'Ravi Patel', provider: 'ICICI Lombard', amount: 22000, status: 'PENDING', date: '2026-05-25' },
  { id: 'CLM-003', patient: 'Meera Nair', provider: 'Star Health', amount: 78000, status: 'REJECTED', date: '2026-05-18' },
  { id: 'CLM-004', patient: 'Arjun Singh', provider: 'HDFC Ergo', amount: 12500, status: 'SUBMITTED', date: '2026-06-01' },
  { id: 'CLM-005', patient: 'Priya Kapoor', provider: 'ICICI Lombard', amount: 34000, status: 'PENDING', date: '2026-06-02' },
];

const MOCK_PREAUTH = [
  { id: 'PA-001', patient: 'Vikram Deshmukh', procedure: 'Knee Replacement', amount: 150000, status: 'PENDING', date: '2026-06-03' },
  { id: 'PA-002', patient: 'Sita Reddy', procedure: 'Cataract Surgery', amount: 45000, status: 'APPROVED', date: '2026-06-01' },
  { id: 'PA-003', patient: 'Rohit Verma', procedure: 'MRI Brain', amount: 12000, status: 'REJECTED', date: '2026-05-30' },
];

const MOCK_COVERAGE_RULES = [
  { id: 1, category: 'Inpatient', rule: 'Maximum 30 days per year', status: 'ACTIVE' },
  { id: 2, category: 'Outpatient', rule: 'OPD cover up to ₹5,000 per visit', status: 'ACTIVE' },
  { id: 3, category: 'Maternity', rule: 'Coverage up to ₹50,000 after 9-month waiting', status: 'ACTIVE' },
  { id: 4, category: 'Dental', rule: 'Not covered under basic plan', status: 'INACTIVE' },
  { id: 5, category: 'Vision', rule: 'Eye exam covered once per year', status: 'ACTIVE' },
  { id: 6, category: 'Emergency', rule: '100% coverage for emergency room', status: 'ACTIVE' },
];

// ── Tab 1: Claims ──────────────────────────────────────
function Claims() {
  const [search, setSearch] = useState('');

  const filtered = MOCK_CLAIMS.filter(
    (c) =>
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.patient.toLowerCase().includes(search.toLowerCase()) ||
      c.provider.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Search claims by ID, patient, or provider..."
            className="h-12 pl-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-left text-xs font-medium text-white/50">
                    <th className="px-4 py-3">Claim ID</th>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((clm) => (
                    <tr key={clm.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-medium text-white/90">{clm.id}</td>
                      <td className="px-4 py-3 text-white/70">{clm.patient}</td>
                      <td className="px-4 py-3 text-white/70">{clm.provider}</td>
                      <td className="px-4 py-3 font-medium text-white/90">₹{clm.amount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={clm.status} />
                      </td>
                      <td className="px-4 py-3 text-white/50">{clm.date}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <FileSearch className="mr-1 h-3 w-3" />
                            View
                          </Button>
                          {clm.status === 'PENDING' && (
                            <Button size="sm" variant="default">
                              <ClipboardCheck className="mr-1 h-3 w-3" />
                              Process
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ── Tab 2: Eligibility ─────────────────────────────────
function Eligibility() {
  const [patientId, setPatientId] = useState('');
  const [policyId, setPolicyId] = useState('');
  const [checked, setChecked] = useState(false);

  const handleCheck = () => {
    setChecked(true);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="text-white/90">Check Eligibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Patient ID</label>
                <Input
                  placeholder="WYS-12345"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Policy ID</label>
                <Input
                  placeholder="POL-2026-XXXX"
                  value={policyId}
                  onChange={(e) => setPolicyId(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
            <div className="mt-4">
              <Button size="lg" onClick={handleCheck} disabled={!patientId && !policyId}>
                <Shield className="mr-2 h-5 w-5" />
                Check Eligibility
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {checked && (
        <motion.div variants={item}>
          <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)] border-l-4 border-l-emerald-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="h-5 w-5" />
                Coverage Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-white/50">Plan Type</p>
                  <p className="font-semibold text-white/90">Family Floater - Gold</p>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-white/50">Sum Insured</p>
                  <p className="font-semibold text-white/90">₹5,00,000</p>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-white/50">Coverage Start</p>
                  <p className="font-semibold text-white/90">01 Jan 2026</p>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-white/50">Coverage End</p>
                  <p className="font-semibold text-white/90">31 Dec 2026</p>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-white/50">Status</p>
                  <StatusBadge status="ACTIVE" />
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-white/50">Pending Deductible</p>
                  <p className="font-semibold text-white/90">₹2,500</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Tab 3: Pre-Authorization ───────────────────────────
function PreAuthorization() {
  const [requests, setRequests] = useState(MOCK_PREAUTH);

  const handleApprove = (id: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'APPROVED' } : r)));
  };

  const handleReject = (id: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED' } : r)));
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-left text-xs font-medium text-white/50">
                    <th className="px-4 py-3">Request ID</th>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Procedure</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {requests.map((pa) => (
                    <tr key={pa.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-medium text-white/90">{pa.id}</td>
                      <td className="px-4 py-3 text-white/70">{pa.patient}</td>
                      <td className="px-4 py-3 text-white/70">{pa.procedure}</td>
                      <td className="px-4 py-3 font-medium text-white/90">₹{pa.amount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={pa.status} />
                      </td>
                      <td className="px-4 py-3 text-white/50">{pa.date}</td>
                      <td className="px-4 py-3">
                        {pa.status === 'PENDING' ? (
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="default" onClick={() => handleApprove(pa.id)}>
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleReject(pa.id)}>
                              <XCircle className="mr-1 h-3 w-3" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-white/40">Closed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ── Tab 4: Coverage Rules ──────────────────────────────
function CoverageRules() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-left text-xs font-medium text-white/50">
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Rule</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_COVERAGE_RULES.map((rule) => (
                    <tr key={rule.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-medium text-white/90">{rule.category}</td>
                      <td className="px-4 py-3 text-white/70">{rule.rule}</td>
                      <td className="px-4 py-3">
                        {rule.status === 'ACTIVE' ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ── Page ────────────────────────────────────────────────
export default function InsuranceWorkspacePage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
      <PageHeader title="Insurance Workspace" description="Claims, eligibility, and pre-authorization" />

      <Tabs defaultValue="claims">
        <TabsList className="w-full overflow-x-auto">
          <TabsTrigger value="claims" className="gap-2">
            <FileSearch className="h-4 w-4" />
            Claims
          </TabsTrigger>
          <TabsTrigger value="eligibility" className="gap-2">
            <Shield className="h-4 w-4" />
            Eligibility
          </TabsTrigger>
          <TabsTrigger value="preauth" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Pre-Authorization
          </TabsTrigger>
          <TabsTrigger value="coverage" className="gap-2">
            <Activity className="h-4 w-4" />
            Coverage Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="claims">
          <Claims />
        </TabsContent>
        <TabsContent value="eligibility">
          <Eligibility />
        </TabsContent>
        <TabsContent value="preauth">
          <PreAuthorization />
        </TabsContent>
        <TabsContent value="coverage">
          <CoverageRules />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
