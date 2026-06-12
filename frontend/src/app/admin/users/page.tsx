/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/admin/users/page.tsx
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
 - data-table
 - avatar
 - dialog
 - select
 - react
 - badge
 - search-input
 *
 * Dependencies:
 - status-badge
 - data-table
 - avatar
 - dialog
 - select
 - react
 - badge
 - search-input
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
import { Shield, ShieldOff, Mail, Phone, CalendarDays, Tag, } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';

import { SearchInput } from '@/components/ui/search-input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { ColumnDef } from '@tanstack/react-table';

interface PlatformUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  roles: string[];
  status: string;
  createdAt: string;
}

const MOCK_USERS: PlatformUser[] = [
  { id: 'u1', name: 'Dr. Ananya Sharma', phone: '+91-98765-43210', email: 'ananya.sharma@clinic.com', roles: ['Doctor'], status: 'ACTIVE', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'u2', name: 'Rahul Verma', phone: '+91-98765-43211', email: 'rahul.verma@gmail.com', roles: ['Patient'], status: 'ACTIVE', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'u3', name: 'City Medical Centre', phone: '+91-98765-43212', email: 'admin@citymed.com', roles: ['Clinic', 'Admin'], status: 'ACTIVE', createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'u4', name: 'Metro Labs', phone: '+91-98765-43213', email: 'info@metrolabs.in', roles: ['Lab'], status: 'INACTIVE', createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: 'u5', name: 'MedPlus Pharmacy', phone: '+91-98765-43214', email: 'orders@medplus.in', roles: ['Pharmacy'], status: 'ACTIVE', createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'u6', name: 'Dr. Priya Patel', phone: '+91-98765-43215', email: 'priya.patel@hospital.com', roles: ['Doctor'], status: 'ACTIVE', createdAt: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: 'u7', name: 'ICICI Lombard Admin', phone: '+91-98765-43216', email: 'admin@icicilombard.com', roles: ['Insurance Staff'], status: 'ACTIVE', createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: 'u8', name: 'Sneha Reddy', phone: '+91-98765-43217', email: 'sneha.reddy@yahoo.com', roles: ['Patient'], status: 'ACTIVE', createdAt: new Date(Date.now() - 8 * 86400000).toISOString() },
  { id: 'u9', name: 'Dr. Amit Kumar', phone: '+91-98765-43218', email: 'amit.kumar@clinic.in', roles: ['Doctor'], status: 'DISABLED', createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 'u10', name: 'HealthNet TPA', phone: '+91-98765-43219', email: 'ops@healthnet.in', roles: ['Insurance Staff', 'TPA'], status: 'ACTIVE', createdAt: new Date(Date.now() - 12 * 86400000).toISOString() },
];

const ROLE_COLORS: Record<string, string> = {
  Doctor: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  Patient: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  Clinic: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  Admin: 'bg-red-500/10 text-red-300 border-red-500/20',
  Lab: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  Pharmacy: 'bg-pink-500/10 text-pink-300 border-pink-500/20',
  'Insurance Staff': 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  TPA: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users] = useState(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<PlatformUser | null>(null);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  const filtered = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search);
    const matchesRole = roleFilter === 'all' || u.roles.some(r => r === roleFilter);
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const columns: ColumnDef<PlatformUser>[] = [
    { accessorKey: 'name', header: 'Name', cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9"><AvatarFallback className="text-xs">{row.original.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
        <div><p className="text-sm font-medium text-white">{row.original.name}</p><p className="text-xs text-white/40">{row.original.email}</p></div>
      </div>
    )},
    { accessorKey: 'phone', header: 'Phone', cell: ({ row }) => <span className="text-sm text-white/60">{row.original.phone}</span> },
    { accessorKey: 'roles', header: 'Roles', cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">{row.original.roles.map((r) => <Badge key={r} variant="outline" size="sm" className={ROLE_COLORS[r] ?? ''}>{r}</Badge>)}</div>
    )},
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" /> },
    { accessorKey: 'createdAt', header: 'Created', cell: ({ row }) => <span className="text-xs text-white/50">{new Date(row.original.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</span> },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-72" />
        <div className="flex gap-3"><Skeleton className="h-11 w-60" /><Skeleton className="h-11 w-36" /><Skeleton className="h-11 w-36" /></div>
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <PageHeader title="User Management" description="View and manage all platform users" />
      </motion.div>

      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email, or phone..." className="sm:max-w-xs" />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="sm:w-40"><SelectValue placeholder="All Roles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Doctor">Doctor</SelectItem>
            <SelectItem value="Patient">Patient</SelectItem>
            <SelectItem value="Clinic">Clinic</SelectItem>
            <SelectItem value="Lab">Lab</SelectItem>
            <SelectItem value="Pharmacy">Pharmacy</SelectItem>
            <SelectItem value="Insurance Staff">Insurance</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="DISABLED">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div variants={item}>
        <DataTable columns={columns} data={filtered} onRowClick={setSelected} emptyTitle="No users found" />
      </motion.div>

      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>View and manage user account</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14"><AvatarFallback className="text-base">{selected.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                <div>
                  <p className="text-lg font-semibold text-white">{selected.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selected.roles.map((r) => <Badge key={r} variant="outline" size="sm" className={ROLE_COLORS[r] ?? ''}>{r}</Badge>)}
                  </div>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-white/40" /><span className="text-white/60">{selected.email}</span></div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-white/40" /><span className="text-white/60">{selected.phone}</span></div>
                <div className="flex items-center gap-2"><Tag className="h-4 w-4 text-white/40" /><StatusBadge status={selected.status} size="sm" /></div>
                <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-white/40" /><span className="text-white/60">{new Date(selected.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
              </div>
              <Separator />
              <div className="flex justify-end gap-2">
                {selected.status !== 'DISABLED' ? (
                  <Button variant="danger" size="sm"><ShieldOff className="h-4 w-4" />Disable User</Button>
                ) : (
                  <Button variant="default" size="sm"><Shield className="h-4 w-4" />Enable User</Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
