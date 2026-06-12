/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/clinic/admin/page.tsx
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
 - data-table
 - card
 - stat-card
 - react
 - badge
 *
 * Dependencies:
 - tabs
 - status-badge
 - avatar
 - data-table
 - card
 - stat-card
 - react
 - badge
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
  Plus,
  Users,
  UserCheck,
  UserX,
  Settings,
  Building2,
  Edit,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { ColumnDef } from '@tanstack/react-table';

import { Card, CardContent, CardHeader, CardTitle, } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { StatCard } from '@/components/ui/stat-card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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

interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  joinedAt: string;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  patientsToday: number;
}

const MOCK_STAFF: StaffMember[] = [
  { id: 's1', name: 'Dr. Mehta', role: 'Physician', email: 'mehta@wyshcare.com', phone: '+91-9876543001', status: 'ACTIVE', joinedAt: '2025-01-15' },
  { id: 's2', name: 'Dr. Sharma', role: 'Cardiologist', email: 'sharma@wyshcare.com', phone: '+91-9876543002', status: 'ACTIVE', joinedAt: '2025-03-01' },
  { id: 's3', name: 'Nurse Priya', role: 'Nurse', email: 'priya@wyshcare.com', phone: '+91-9876543003', status: 'ACTIVE', joinedAt: '2025-02-10' },
  { id: 's4', name: 'Receptionist Raj', role: 'Receptionist', email: 'raj@wyshcare.com', phone: '+91-9876543004', status: 'ACTIVE', joinedAt: '2025-01-20' },
  { id: 's5', name: 'John Doe', role: 'Lab Technician', email: 'john@wyshcare.com', phone: '+91-9876543005', status: 'INACTIVE', joinedAt: '2025-04-01' },
];

const MOCK_BRANCHES: Branch[] = [
  { id: 'b1', name: 'WyshCare Main - Connaught Place', address: 'CP, New Delhi', phone: '+91-11-23456789', patientsToday: 24 },
  { id: 'b2', name: 'WyshCare South - Saket', address: 'Saket, New Delhi', phone: '+91-11-23456788', patientsToday: 18 },
  { id: 'b3', name: 'WyshCare East - Laxmi Nagar', address: 'Laxmi Nagar, New Delhi', phone: '+91-11-23456787', patientsToday: 12 },
];

const staffColumns: ColumnDef<StaffMember>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{getInitials(row.original.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-white">{row.original.name}</p>
            <p className="text-xs text-white/50">{row.original.email}</p>
          </div>
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => (
      <Badge variant="outline" size="sm">{row.original.role}</Badge>
    ),
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => <span className="text-sm text-white/60">{row.original.phone}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" />,
  },
  {
    id: 'actions',
    header: '',
    cell: () => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    ),
  },
];

export default function AdminPage() {
  const [staff] = useState(MOCK_STAFF);
  const [branches] = useState(MOCK_BRANCHES);
  const [addStaffOpen, setAddStaffOpen] = useState(false);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Admin OS" description="Staff management, clinic settings, and analytics">
        <Dialog open={addStaffOpen} onOpenChange={setAddStaffOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm">
              <Plus className="h-4 w-4" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
              <DialogDescription>Add a new staff member to your clinic</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-medium text-white/70">Full Name</label>
                <Input placeholder="Staff name" />
              </div>
              <div>
                <label className="text-xs font-medium text-white/70">Email</label>
                <Input type="email" placeholder="Email address" />
              </div>
              <div>
                <label className="text-xs font-medium text-white/70">Phone</label>
                <Input placeholder="Phone number" />
              </div>
              <div>
                <label className="text-xs font-medium text-white/70">Role</label>
                <Select defaultValue="PHYSICIAN">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PHYSICIAN">Physician</SelectItem>
                    <SelectItem value="NURSE">Nurse</SelectItem>
                    <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                    <SelectItem value="LAB_TECHNICIAN">Lab Technician</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button>Add Staff</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Tabs defaultValue="staff">
        <TabsList>
          <TabsTrigger value="staff">Staff Management</TabsTrigger>
          <TabsTrigger value="settings">Clinic Settings</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="staff">
          <DataTable
            columns={staffColumns}
            data={staff}
            emptyTitle="No staff members"
            emptyDescription="Add your first staff member"
          />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Settings className="h-4 w-4 text-[#8FD3D1]" />
                Clinic Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">Clinic Name</label>
                  <Input defaultValue="WyshCare Clinic - Connaught Place" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">Phone</label>
                  <Input defaultValue="+91-11-23456789" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-medium text-white/70">Address</label>
                  <Input defaultValue="Connaught Place, New Delhi - 110001" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">Email</label>
                  <Input type="email" defaultValue="clinic@wyshcare.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">Operating Hours</label>
                  <Input defaultValue="Mon-Sat: 9:00 AM - 6:00 PM" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="default" size="sm">Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branches">
          <div className="space-y-4">
            {branches.map((branch) => (
              <Card key={branch.id}>
                <CardContent className="flex items-center justify-between pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#8FD3D1]/10 text-[#8FD3D1]">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{branch.name}</p>
                      <p className="text-xs text-white/50">{branch.address}</p>
                      <p className="text-xs text-white/40 mt-1">{branch.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{branch.patientsToday}</p>
                    <p className="text-xs text-white/50">Patients today</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              icon={<UserCheck className="h-5 w-5" />}
              label="Consulted"
              value="42"
              trend={{ direction: 'up', value: '88% of total' }}
            />
            <StatCard
              icon={<UserX className="h-5 w-5" />}
              label="No-show"
              value="6"
              trend={{ direction: 'down', value: '12% of total' }}
            />
            <StatCard
              icon={<Users className="h-5 w-5" />}
              label="Walk-in Rate"
              value="34%"
              trend={{ direction: 'up', value: '16 walk-ins today' }}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Appointments Funnel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-white/50">Scheduled</span>
                    <span className="font-medium text-white">48</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/[0.06]">
                    <div className="h-full w-full rounded-full bg-[#8FD3D1]" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-white/50">Checked In</span>
                    <span className="font-medium text-white">44</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/[0.06]">
                    <div className="h-full w-[91.7%] rounded-full bg-[#8FD3D1]" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-white/50">Consulted</span>
                    <span className="font-medium text-white">42</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/[0.06]">
                    <div className="h-full w-[87.5%] rounded-full bg-[#2EE59D]" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-white/50">No-show</span>
                    <span className="font-medium text-white">6</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/[0.06]">
                    <div className="h-full w-[12.5%] rounded-full bg-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Operational Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50">Average Wait Time</span>
                  <span className="text-lg font-bold text-white">12 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50">Average Consultation Time</span>
                  <span className="text-lg font-bold text-white">15 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50">Patient Satisfaction</span>
                  <span className="text-lg font-bold text-[#2EE59D]">4.8/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50">Bed Occupancy</span>
                  <span className="text-lg font-bold text-white">65%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
