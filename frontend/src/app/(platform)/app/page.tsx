/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(platform)/app/page.tsx
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
 - frontend/src/hooks/use-emergency.ts
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 *
 * Calls:
 - use-health-data
 - react-query
 - use-emergency
 - react
 - session-store
 - skeleton
 - api-client
 - framer-motion
 *
 * Dependencies:
 - use-health-data
 - react-query
 - use-emergency
 - react
 - session-store
 - skeleton
 - api-client
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
  Activity, Apple, Brain, Calendar, ChevronRight, Dumbbell, FileText,
  FlaskConical, Heart, HeartPulse, Pill, Shield, Sparkles, Video,
  Droplets, Clock, TrendingUp, ArrowUp, ArrowDown, Moon, Zap,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useHealthScore, useLifestyleMetrics } from '@/hooks/use-health-data';
import { useEmergencyProfile } from '@/hooks/use-emergency';
import { api } from '@/lib/api-client';
import { useSessionStore } from '@/stores/session-store';
import { Skeleton } from '@/components/ui/skeleton';

const easing = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easing } },
};

const vitalIcons: Record<string, { icon: any; color: string; label: string }> = {
  heart_rate: { icon: Heart, color: 'bg-[#FF2D55]/10 text-[#FF2D55]', label: 'Heart Rate' },
  blood_pressure: { icon: Activity, color: 'bg-[#007AFF]/10 text-[#007AFF]', label: 'Blood Pressure' },
  blood_glucose: { icon: FlaskConical, color: 'bg-[#FF9500]/10 text-[#FF9500]', label: 'Blood Glucose' },
  steps: { icon: Dumbbell, color: 'bg-[#34C759]/10 text-[#34C759]', label: 'Activity Level' },
  activity_level: { icon: Dumbbell, color: 'bg-[#34C759]/10 text-[#34C759]', label: 'Activity Level' },
};

const timelineStyleMap: Record<string, { icon: any; color: string; status: string; statusClass: string }> = {
  telemedicine: { icon: Video, color: 'bg-[#007AFF]/10 text-[#007AFF]', status: 'Completed', statusClass: 'text-[#34C759]' },
  lab_result: { icon: FileText, color: 'bg-[#FF9500]/10 text-[#FF9500]', status: 'New', statusClass: 'text-[#007AFF]' },
  medication: { icon: Pill, color: 'bg-[#34C759]/10 text-[#34C759]', status: 'Taken', statusClass: 'text-[#34C759]' },
  appointment: { icon: Calendar, color: 'bg-[#5856D6]/10 text-[#5856D6]', status: 'Upcoming', statusClass: 'text-[#007AFF]' },
};

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60000) return 'Just now';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function CircularProgress({ score, size = 160, strokeWidth = 12 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;
  const color = score >= 80 ? '#34C759' : score >= 60 ? '#007AFF' : score >= 40 ? '#FF9500' : '#FF2D55';

  return (
    <motion.div layoutId="health-score" className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={center} cy={center} r={radius} fill="none" stroke={color}
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: easing }}
          style={{ filter: `drop-shadow(0 0 12px ${color}44)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          className="text-4xl font-bold tracking-tight text-text-primary font-display"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5, ease: easing }}
        >
          {score}
        </motion.span>
        <span className="text-[10px] font-medium tracking-widest text-text-tertiary font-ui uppercase mt-1">Score</span>
      </div>
    </motion.div>
  );
}

export default function WyshIDDashboardPage() {
  const user = useSessionStore((s) => s.user);
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: api.getProfile,
  });
  const { data: healthScore, isLoading: scoreLoading } = useHealthScore();
  const { data: lifestyle, isLoading: lifestyleLoading } = useLifestyleMetrics();
  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ['timeline-recent'],
    queryFn: () => api.getTimeline({ limit: 4 }),
  });
  const { data: emergency, isLoading: emergencyLoading } = useEmergencyProfile();

  const displayName = user?.fullName || profile?.fullName || 'User';
  const displayWyshId = user?.wyshId || profile?.wyshId || '---';
  const initials = getInitials(displayName);
  const firstName = displayName.split(' ')[0] || displayName;
  const timelineEvents = timeline?.events ?? [];
  const vitalMetrics = lifestyle?.metrics ?? [];
  const score = healthScore?.score ?? 0;
  const scoreLabel = healthScore?.label ?? 'Excellent';

  const nextAction = [
    { label: 'Book Checkup', icon: Video, color: 'bg-[#007AFF]', desc: 'Recommended' },
    { label: 'Medication', icon: Pill, color: 'bg-[#34C759]', desc: '2 pending' },
    { label: 'AI Insights', icon: Brain, color: 'bg-[#5856D6]', desc: '3 new' },
    { label: 'Emergency', icon: Shield, color: 'bg-[#FF9500]', desc: 'Profile ready' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* ── Hero Section: Welcome + Health Score ── */}
      <motion.div variants={item} className="flex flex-col gap-8 xl:flex-row xl:items-start">
        {/* Welcome + Identity */}
        <div className="flex-1 space-y-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] shadow-lg shadow-[#007AFF]/20">
                <span className="text-sm font-bold text-white">{initials}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary font-display tracking-tight">
                  Welcome, {firstName}
                </h1>
                <p className="text-sm text-text-secondary font-ui">
                  {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'} — your health is on track
                </p>
              </div>
            </div>
          </div>

          {/* WyshID Card — Apple Wallet Pass Style */}
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="glass-card overflow-hidden p-6 max-w-md transition-shadow duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#007AFF]">
                  <HeartPulse className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold text-text-primary font-display">WyshID</span>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-[#34C759]/10 px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#34C759] animate-pulse-soft" />
                <span className="text-[10px] font-semibold text-[#34C759] font-ui">Verified</span>
              </span>
            </div>
            <div className="flex items-center gap-5">
              <div className="shrink-0 rounded-2xl bg-white p-3 shadow-sm">
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <rect x="6" y="6" width="88" height="88" rx="6" fill="#F2F4F7" />
                  <rect x="12" y="12" width="76" height="76" rx="3" fill="#0B0D10" />
                  <circle cx="50" cy="50" r="24" fill="none" stroke="#007AFF" strokeWidth="2" />
                  <circle cx="50" cy="50" r="10" fill="#007AFF" />
                  <rect x="28" y="28" width="10" height="10" rx="1" fill="#007AFF" />
                  <rect x="62" y="28" width="10" height="10" rx="1" fill="#007AFF" />
                  <rect x="28" y="62" width="10" height="10" rx="1" fill="#007AFF" />
                  <rect x="62" y="62" width="10" height="10" rx="1" fill="#007AFF" />
                  <path d="M40 48 L48 56 L62 42" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-text-primary font-display">{displayName}</p>
                <p className="text-xs text-text-secondary font-mono tracking-wider mt-0.5">{displayWyshId}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[10px] font-medium text-text-tertiary font-ui bg-content-secondary rounded-full px-2.5 py-1">ABHA Linked</span>
                  <span className="text-[10px] font-medium text-text-tertiary font-ui bg-content-secondary rounded-full px-2.5 py-1">QR Ready</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Next Actions */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-tertiary font-ui mb-3">Next Actions</p>
            <div className="flex flex-wrap gap-2">
              {nextAction.map((action) => (
                <motion.button
                  key={action.label}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="group flex items-center gap-2.5 glass-card px-4 py-2.5 text-sm font-medium text-text-primary font-ui hover:bg-white/80 transition-all duration-200"
                >
                  <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${action.color}`}>
                    <action.icon className="h-3 w-3 text-white" />
                  </div>
                  {action.label}
                  <span className="text-[10px] text-text-tertiary font-ui">{action.desc}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-text-tertiary group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              ))}
            </div>
          </div>
        </div>

          {/* Health Score Ring */}
        <div className="shrink-0">
          <motion.div variants={item} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="glass-card p-6 flex flex-col items-center w-[220px] transition-shadow duration-300 hover:shadow-xl">
            <div className="flex items-center gap-2 mb-5">
              <HeartPulse className="h-4 w-4 text-[#FF2D55]" />
              <span className="text-xs font-semibold text-text-primary font-display">Health Score</span>
            </div>
            {scoreLoading ? (
              <Skeleton className="h-40 w-40 rounded-full" />
            ) : (
              <CircularProgress score={score} size={140} strokeWidth={10} />
            )}
            {!scoreLoading && (
              <div className="mt-4 flex items-center gap-1.5 rounded-full bg-[#34C759]/10 px-3 py-1.5">
                <Sparkles className="h-3 w-3 text-[#34C759]" />
                <span className="text-[11px] font-medium text-[#34C759] font-ui">{scoreLabel}</span>
              </div>
            )}
            <div className="mt-4 w-full space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-tertiary font-ui">Trend</span>
                <span className="flex items-center gap-1 text-[#34C759] font-medium font-ui">
                  <TrendingUp className="h-3 w-3" />
                  +2 pts
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-tertiary font-ui">Last</span>
                <span className="text-text-primary font-medium font-ui">Today</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Today's Overview Grid ── */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-3">
        {/* Vitals */}
        <motion.div whileHover={{ scale: 1.01 }} className="glass-card p-5 lg:col-span-2 transition-shadow duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#FF2D55]" />
              <h3 className="text-sm font-semibold text-text-primary font-display">Today's Vitals</h3>
            </div>
            <span className="text-[10px] text-text-tertiary font-ui flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Updated 2m ago
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {lifestyleLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[72px] rounded-2xl" />
              ))
            ) : vitalMetrics.length > 0 ? (
              vitalMetrics.slice(0, 4).map((m) => {
                const mapped = vitalIcons[m.category] || { icon: Activity, color: 'bg-[#007AFF]/10 text-[#007AFF]', label: m.category.replace(/_/g, ' ') };
                const Icon = mapped.icon;
                return (
                  <div key={m.category} className="flex items-center gap-3 rounded-2xl bg-content-secondary p-3.5">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${mapped.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-text-tertiary font-ui">{mapped.label}</p>
                      <p className="text-sm font-semibold text-text-primary font-display">{m.value} {m.unit}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-6 text-sm text-text-tertiary font-ui">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No vitals recorded today
              </div>
            )}
          </div>
        </motion.div>

        {/* Emergency Snapshot — Wallet-style */}
        <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-5 transition-shadow duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#FF9500]" />
              <h3 className="text-sm font-semibold text-text-primary font-display">Emergency</h3>
            </div>
            <span className="text-[10px] flex items-center gap-1 rounded-full bg-[#FF9500]/10 px-2 py-0.5 text-[#FF9500] font-ui font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF9500]" />
              Ready
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-content-secondary p-3">
              <span className="text-xs text-text-tertiary font-ui">Blood Type</span>
              <span className="text-sm font-semibold text-text-primary font-display">O+</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-content-secondary p-3">
              <span className="text-xs text-text-tertiary font-ui">Allergies</span>
              <span className="text-sm font-semibold text-[#FF2D55] font-display">Penicillin</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-content-secondary p-3">
              <span className="text-xs text-text-tertiary font-ui">Contacts</span>
              <span className="text-sm font-semibold text-text-primary font-display">3 on file</span>
            </div>
          </div>
          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF9500] px-4 py-2.5 text-sm font-semibold text-white font-ui hover:bg-[#FF9500]/90 transition-all shadow-lg shadow-[#FF9500]/20">
            <Shield className="h-4 w-4" />
            View Emergency Profile
          </button>
        </motion.div>
      </motion.div>

      {/* ── AI Guidance + Recent Activity ── */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-3">
        {/* AI Guidance */}
        <motion.div whileHover={{ scale: 1.01 }} className="glass-card p-5 lg:col-span-2 transition-shadow duration-300 hover:shadow-lg">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#5856D6]/20 to-[#007AFF]/20">
              <Sparkles className="h-4 w-4 text-[#5856D6]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary font-display">AI Health Brief</h3>
              <p className="text-[10px] text-text-tertiary font-ui">Your daily intelligence</p>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-[#5856D6]/5 to-[#007AFF]/5 border border-[#5856D6]/10 p-4 mb-4">
            <p className="text-sm text-text-primary font-ui leading-relaxed">
              Your health score is <span className="font-semibold text-[#34C759]">{score}/100</span>. 
              {score >= 80 ? ' Excellent range. Maintain your current routine with regular checkups.' :
               score >= 60 ? ' Good range. Focus on sleep and activity for improvement.' :
               ' Room for improvement. Consider a health review.'}
            </p>
          </div>
          <div className="flex gap-2">
            {[
              { label: 'Risk Scan', icon: Brain, color: 'bg-[#5856D6]' },
              { label: 'Preventive', icon: Shield, color: 'bg-[#34C759]' },
              { label: 'Full Report', icon: FileText, color: 'bg-[#007AFF]' },
            ].map((action) => (
              <button
                key={action.label}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-content-secondary py-2.5 text-xs font-medium text-text-secondary font-ui hover:bg-content-tertiary transition-all"
              >
                <div className={`flex h-5 w-5 items-center justify-center rounded-md ${action.color}`}>
                  <action.icon className="h-3 w-3 text-white" />
                </div>
                {action.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-5 transition-shadow duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-text-tertiary" />
              <h3 className="text-sm font-semibold text-text-primary font-display">Recent</h3>
            </div>
            <span className="text-[10px] text-text-tertiary font-ui">Today</span>
          </div>
          <div className="space-y-2">
            {timelineLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-xl" />
              ))
            ) : timelineEvents.length > 0 ? (
              timelineEvents.slice(0, 4).map((event) => {
                const style = timelineStyleMap[event.type] || { icon: Activity, color: 'bg-[#007AFF]/10 text-[#007AFF]', status: 'Event', statusClass: 'text-text-tertiary' };
                const Icon = style.icon;
                return (
                  <div key={event.id} className="flex items-start gap-3 rounded-xl bg-content-secondary p-3 transition-all hover:bg-content-tertiary">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-primary font-ui truncate">{event.title}</p>
                      <p className="text-[10px] text-text-tertiary font-ui">{timeAgo(event.occurredAt)}</p>
                    </div>
                    <span className={`text-[9px] font-medium ${style.statusClass} font-ui`}>{style.status}</span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-xs text-text-tertiary font-ui">
                No recent activity
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
