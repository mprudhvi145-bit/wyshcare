/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(platform)/wysh/page.tsx
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
 - frontend/src/app/(platform)/health-twin/risk-predictions/page.tsx
 - frontend/src/components/dashboard/family-alerts-widget.tsx
 - frontend/src/hooks/use-emergency.ts
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 *
 * Calls:
 - status-badge
 - react-query
 - card
 - dashboard-widget
 - health-score-card
 - date-fns
 - badge
 - skeleton
 *
 * Dependencies:
 - status-badge
 - react-query
 - card
 - dashboard-widget
 - health-score-card
 - date-fns
 - badge
 - skeleton
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

import { useQuery } from '@tanstack/react-query';
import {
  Calendar, Pill, Shield, FileText,
  Clock, Stethoscope, Sparkles,
  Microscope, Users,
  Brain, Dumbbell,
} from 'lucide-react';
import { format } from 'date-fns';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { HealthScoreCard } from '@/components/dashboard/health-score-card';
import { DashboardWidget } from '@/components/dashboard/dashboard-widget';
import { StatusBadge } from '@/components/ui/status-badge';
import { useSessionStore } from '@/stores/session-store';
import { api } from '@/lib/api-client';
import type { WyshTask, WyshFamilyAlert } from '@/types';

function getTypeIcon(type: WyshTask['type']) {
  switch (type) {
    case 'medication': return Pill;
    case 'appointment': return Calendar;
    case 'claim': return Shield;
    case 'pre_auth': return FileText;
    case 'report': return Microscope;
  }
}

function getTypeColor(type: WyshTask['type']) {
  switch (type) {
    case 'medication': return 'bg-emerald-500/10 text-emerald-600';
    case 'appointment': return 'bg-blue-500/10 text-blue-600';
    case 'claim': return 'bg-purple-500/10 text-purple-600';
    case 'pre_auth': return 'bg-amber-500/10 text-amber-600';
    case 'report': return 'bg-rose-500/10 text-rose-600';
  }
}

function WyshTaskRow({ task }: { task: WyshTask }) {
  const Icon = getTypeIcon(task.type);
  const color = getTypeColor(task.type);
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3 transition-all hover:border-slate-200 hover:shadow-sm">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900">{task.title}</p>
        <p className="text-xs text-slate-500 truncate">{task.description}</p>
      </div>
      {task.urgent && <Badge variant="warning" size="sm" className="shrink-0">Today</Badge>}
    </div>
  );
}

function AiInsightCard({ message, type }: { message: string; type: string }) {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    appointment: Calendar, medication: Pill, preventive: Dumbbell, insurance: Shield, family: Users,
  };
  const Icon = iconMap[type] ?? Brain;
  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 p-5 sm:p-6">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
      <div className="relative flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">AI Insight</p>
          <p className="mt-1 text-sm font-medium leading-relaxed text-white sm:text-base">{message}</p>
        </div>
        <Sparkles className="absolute right-0 top-0 h-4 w-4 text-white/40" />
      </div>
    </Card>
  );
}

function FamilyAlertRow({ alert }: { alert: WyshFamilyAlert }) {
  const severityColor = alert.severity === 'HIGH' ? 'border-red-400 bg-red-50' : alert.severity === 'MEDIUM' ? 'border-amber-400 bg-amber-50' : 'border-blue-400 bg-blue-50';
  const dotColor = alert.severity === 'HIGH' ? 'bg-red-500' : alert.severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500';
  return (
    <div className={`flex items-start gap-3 rounded-xl border-l-4 p-3 ${severityColor}`}>
      <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
      <div>
        <p className="text-sm font-medium text-slate-900">{alert.title}</p>
        <p className="text-xs text-slate-500">{alert.memberName}</p>
      </div>
    </div>
  );
}

export default function WyshSuperAppPage() {
  const user = useSessionStore((s) => s.user);
  const { data, isLoading } = useQuery({
    queryKey: ['wysh-dashboard'],
    queryFn: () => api.getWyshDashboard(),
    refetchInterval: 30_000,
  });

  const name = user?.fullName ?? 'Guest';
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-48" />
        <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
          <Skeleton className="h-56 w-56 rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const healthScore = data?.healthScore ?? { score: 0, label: '--', color: '#94a3b8' };
  const tasks = data?.todayTasks ?? [];
  const appointments = data?.upcomingAppointments ?? [];
  const insurance = data?.insurance;
  const claims = data?.pendingClaims ?? [];
  const familyAlerts = data?.familyAlerts ?? [];
  const aiInsight = data?.aiInsight ?? { message: 'Loading your personalized insights...', type: 'preventive' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {data?.greeting ?? 'Welcome'}, {name.split(' ')[0]}
        </h1>
        <p className="text-sm text-slate-500">{today}</p>
      </div>

      <AiInsightCard message={aiInsight.message} type={aiInsight.type} />

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <HealthScoreCard score={healthScore.score} className="w-full sm:w-56" />
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-700">Today&apos;s Tasks</h2>
            <span className="text-xs text-slate-400">({tasks.length})</span>
          </div>
          {tasks.length === 0 ? (
            <p className="text-sm text-slate-400">No tasks for today. Enjoy your day!</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {tasks.map((task) => (
                <WyshTaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <DashboardWidget
          title="Upcoming Appointments"
          action={{ label: 'View all', onClick: () => window.location.href = '/app/telemedicine' }}
          loading={isLoading}
        >
          {appointments.length === 0 ? (
            <p className="text-sm text-slate-500">No upcoming appointments</p>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 2).map((apt) => (
                <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3" key={apt.id}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{apt.reason}</p>
                    <p className="text-xs text-slate-500">{apt.doctorName}</p>
                    <p className="text-xs text-slate-400">
                      {format(new Date(apt.startAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <StatusBadge status={apt.status} className="shrink-0" />
                </div>
              ))}
            </div>
          )}
        </DashboardWidget>

        <DashboardWidget
          title="Insurance"
          action={insurance ? { label: 'View details', onClick: () => window.location.href = '/app/insurance' } : undefined}
        >
          {insurance ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/10 text-purple-600">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{insurance.provider}</p>
                  <p className="text-xs text-slate-500">{insurance.plan}</p>
                  <p className="text-xs text-slate-400">
                    Sum insured: ₹{(insurance.sumInsured / 100).toLocaleString()}
                  </p>
                </div>
                <StatusBadge status={insurance.status} />
              </div>
              {claims.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Shield className="h-3 w-3" />
                  <span>{claims.length} active claim{claims.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <Shield className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">No active policy</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => window.location.href = '/app/insurance'}>
                Explore plans
              </Button>
            </div>
          )}
        </DashboardWidget>

        <DashboardWidget title="Family">
          {familyAlerts.length === 0 ? (
            <div className="text-center py-4">
              <Users className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">All clear</p>
            </div>
          ) : (
            <div className="space-y-2">
              {familyAlerts.slice(0, 3).map((alert) => (
                <FamilyAlertRow key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </DashboardWidget>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Button
          variant="outline"
          className="flex h-auto flex-col items-center gap-2 p-4"
          onClick={() => window.location.href = '/app/discovery'}
        >
          <Stethoscope className="h-6 w-6 text-blue-500" />
          <span className="text-xs font-medium text-slate-700">Find a Doctor</span>
        </Button>
        <Button
          variant="outline"
          className="flex h-auto flex-col items-center gap-2 p-4"
          onClick={() => window.location.href = '/app/pharmacy'}
        >
          <Pill className="h-6 w-6 text-emerald-500" />
          <span className="text-xs font-medium text-slate-700">Order Medicines</span>
        </Button>
        <Button
          variant="outline"
          className="flex h-auto flex-col items-center gap-2 p-4"
          onClick={() => window.location.href = '/app/diagnostics'}
        >
          <Microscope className="h-6 w-6 text-rose-500" />
          <span className="text-xs font-medium text-slate-700">Book Lab Test</span>
        </Button>
        <Button
          variant="outline"
          className="flex h-auto flex-col items-center gap-2 p-4"
          onClick={() => window.location.href = '/app/ai-navigator'}
        >
          <Brain className="h-6 w-6 text-indigo-500" />
          <span className="text-xs font-medium text-slate-700">AI Navigator</span>
        </Button>
      </div>
    </div>
  );
}
