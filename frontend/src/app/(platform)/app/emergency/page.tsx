/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(platform)/app/emergency/page.tsx
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
 - use-health-data
 - use-emergency
 - react
 - session-store
 - skeleton
 - framer-motion
 *
 * Dependencies:
 - use-health-data
 - use-emergency
 - react
 - session-store
 - skeleton
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

import { useState, useMemo } from 'react';
import {
  Activity, AlertTriangle, Ambulance, BadgeAlert, Brain, ChevronRight,
  Clock, Contact, Droplet, FileText, HeartPulse, Hospital, Lock,
  MapPin, Phone, Pill, QrCode, Scan, Shield, ShieldAlert, ShieldCheck,
  Siren, Stethoscope, Unlock, User, Users, Eye, EyeOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmergencyProfile, useEmergencyContacts, useEmergencyQR, useGrantEmergencyAccess, useRevokeEmergencyAccess, useAddEmergencyContact, useDeleteEmergencyContact } from '@/hooks/use-emergency';
import { useHealthScore, useLifestyleMetrics } from '@/hooks/use-health-data';
import { useSessionStore } from '@/stores/session-store';
import { Skeleton } from '@/components/ui/skeleton';
import type { EmergencyContact as EmergencyContactType } from '@/types';

const easing = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easing } },
};

type Tab = 'contacts' | 'medical' | 'access';

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    Severe: 'bg-[#FF2D55]/15 text-[#FF2D55] border-[#FF2D55]/20',
    Moderate: 'bg-[#FF9500]/15 text-[#FF9500] border-[#FF9500]/20',
    Mild: 'bg-[#007AFF]/15 text-[#007AFF] border-[#007AFF]/20',
  };
  return (
    <span className={`rounded-md px-2 py-0.5 font-manrope text-[11px] font-bold uppercase tracking-wider border ${styles[severity] || 'bg-white/10 text-text-tertiary border-white/10'}`}>
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Managed: 'text-[#34C759] bg-[#34C759]/10 border-[#34C759]/20',
    Controlled: 'text-[#007AFF] bg-[#007AFF]/10 border-[#007AFF]/20',
    Mild: 'text-[#FF9500] bg-[#FF9500]/10 border-[#FF9500]/20',
  };
  return (
    <span className={`rounded-md px-2 py-0.5 font-manrope text-[11px] font-bold uppercase tracking-wider border ${styles[status] || 'bg-white/10 text-text-tertiary border-white/10'}`}>
      {status}
    </span>
  );
}

function QrCodePlaceholder({ size = 140 }: { size?: number }) {
  const cellCount = 11;
  const cells = useMemo(() => {
    return Array.from({ length: cellCount * cellCount }).map((_, i) => {
      const row = Math.floor(i / cellCount);
      const col = i % cellCount;
      const isEdge = row === 0 || row === cellCount - 1 || col === 0 || col === cellCount - 1;
      const inTopLeftFinder = row < 3 && col < 3;
      const inTopRightFinder = row < 3 && col > cellCount - 4;
      const inBottomLeftFinder = row > cellCount - 4 && col < 3;
      const isFinder = inTopLeftFinder || inTopRightFinder || inBottomLeftFinder;
      const isAlignment = row >= cellCount - 4 && row < cellCount - 1 && col >= cellCount - 4 && col < cellCount - 1 && !isFinder && !isEdge;
      const isTiming = (row === 6 && col >= 3 && col <= 7) || (col === 6 && row >= 3 && row <= 7);
      const active = isEdge || isFinder || isAlignment || isTiming || (row > 1 && row < 9 && col > 1 && col < 9 && Math.random() > 0.55);
      return active;
    });
  }, []);

  return (
    <div className="grid grid-cols-11 grid-rows-11 gap-[2px]" style={{ width: size, height: size }}>
      {cells.map((active, i) => (
        <div
          key={i}
          className={`rounded-sm ${active ? 'bg-white' : 'bg-transparent'}`}
          style={{ opacity: active ? 0.95 : 0 }}
        />
      ))}
    </div>
  );
}

export default function EmergencyPage() {
  const user = useSessionStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<Tab>('contacts');
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [showFullQr, setShowFullQr] = useState(false);

  const { data: profile, isLoading: profileLoading } = useEmergencyProfile();
  const { data: contacts, isLoading: contactsLoading } = useEmergencyContacts();
  const { data: qrData, isLoading: qrLoading } = useEmergencyQR();
  const { data: healthScore } = useHealthScore();

  const displayName = user?.fullName || profile?.fullName || 'Vimarshak Prudhvi';
  const initials = getInitials(displayName);
  const bloodGroup = profile?.bloodGroup || 'O+';
  const chronicConditions = profile?.chronicConditions ?? [];
  const allergies = profile?.allergies ?? [];
  const emergencyContacts = contacts ?? [];
  const score = healthScore?.score ?? 85;

  const hasSevereAllergy = allergies.some((a) => a.toLowerCase().includes('penicillin') || a.toLowerCase().includes('severe'));

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* ── Header ── */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${emergencyMode ? 'bg-[#FF2D55]/20' : 'bg-[#FF9500]/10'}`}>
            <Siren className={`h-5 w-5 ${emergencyMode ? 'text-[#FF2D55]' : 'text-[#FF9500]'}`} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary font-display tracking-tight">Emergency Profile</h1>
            <p className="text-sm text-text-secondary font-ui">Instant access for first responders</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl glass-card px-4 py-2">
            <Activity className="h-4 w-4 text-[#34C759]" />
            <span className="font-manrope text-sm font-semibold text-[#34C759]">{score}% Ready</span>
          </div>
          <button
            onClick={() => setEmergencyMode(!emergencyMode)}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold font-ui transition-all duration-300 ${
              emergencyMode
                ? 'bg-[#FF2D55] text-white shadow-lg shadow-[#FF2D55]/30 glow-emergency'
                : 'glass-card text-text-secondary hover:text-[#FF2D55] hover:border-[#FF2D55]/30'
            }`}
          >
            {emergencyMode ? (
              <><Unlock className="h-4 w-4" /> Exit Emergency Mode</>
            ) : (
              <><ShieldAlert className="h-4 w-4" /> Emergency Mode</>
            )}
          </button>
        </div>
      </motion.div>

      {/* ── Apple Wallet Pass-style Emergency Card ── */}
      <motion.div variants={item}>
        <motion.div
          className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0B0D10] via-[#1A1D21] to-[#121417] border border-white/[0.08] shadow-2xl shadow-black/30"
          animate={emergencyMode ? { scale: [1, 1.01, 1], borderColor: 'rgba(255,45,85,0.4)' } : {}}
          transition={{ duration: 1.5, repeat: emergencyMode ? Infinity : 0, ease: easing }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF2D55]/5 via-transparent to-[#FF9500]/5 pointer-events-none" />
          <div className="relative z-10 p-6 md:p-8">
            {/* Top Row: Avatar + Name + QR */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#FF2D55] to-[#FF9500] shadow-lg shadow-[#FF2D55]/30">
                  <span className="text-lg font-bold text-white font-display">{initials}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-display tracking-tight">{displayName}</h2>
                  <p className="text-sm text-white/50 font-ui">{user?.wyshId || profile?.id || 'WYSH-001'}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFullQr(!showFullQr)}
                className="flex flex-col items-center gap-1 rounded-2xl bg-white/5 px-4 py-3 border border-white/[0.06] hover:bg-white/10 transition-all"
              >
                {qrLoading ? (
                  <Skeleton className="h-12 w-12 rounded-lg" />
                ) : (
                  <QrCodePlaceholder size={48} />
                )}
                <span className="text-[9px] text-white/40 font-ui font-medium tracking-wider">SCAN ME</span>
              </motion.button>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-white/10 via-white/20 to-transparent mb-6" />

            {/* Medical Summary Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Droplet className="h-3.5 w-3.5 text-[#FF2D55]" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-white/40 font-ui">Blood Group</span>
                </div>
                <p className="text-2xl font-bold text-white font-display">{bloodGroup}</p>
              </div>

              <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-[#FF9500]" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-white/40 font-ui">Allergies</span>
                </div>
                {allergies.length > 0 ? (
                  <>
                    <p className="text-base font-bold text-[#FF9500] font-display">{allergies[0]}</p>
                    {allergies.length > 1 && (
                      <p className="text-[11px] text-white/40 font-ui">+{allergies.length - 1} more</p>
                    )}
                  </>
                ) : (
                  <p className="text-base font-medium text-white/40 font-ui">None</p>
                )}
              </div>

              <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope className="h-3.5 w-3.5 text-[#007AFF]" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-white/40 font-ui">Conditions</span>
                </div>
                {chronicConditions.length > 0 ? (
                  <>
                    <p className="text-base font-bold text-white font-display">{chronicConditions[0]}</p>
                    {chronicConditions.length > 1 && (
                      <p className="text-[11px] text-white/40 font-ui">+{chronicConditions.length - 1} more</p>
                    )}
                  </>
                ) : (
                  <p className="text-base font-medium text-white/40 font-ui">None</p>
                )}
              </div>

              <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-3.5 w-3.5 text-[#34C759]" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-white/40 font-ui">Emergency</span>
                </div>
                {emergencyContacts.length > 0 ? (
                  <>
                    <p className="text-base font-bold text-white font-display">{emergencyContacts[0]!.name}</p>
                    <p className="text-[11px] text-[#34C759] font-ui">{emergencyContacts[0]!.phoneNumber}</p>
                  </>
                ) : (
                  <p className="text-base font-medium text-white/40 font-ui">No contacts</p>
                )}
              </div>
            </div>

            {/* Expanded QR */}
            <AnimatePresence>
              {showFullQr && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: easing }}
                  className="overflow-hidden"
                >
                  <div className="mt-6 pt-6 border-t border-white/[0.06]">
                    <div className="flex items-center justify-center">
                      <div className="rounded-2xl bg-white p-6 shadow-xl">
                        <QrCodePlaceholder size={180} />
                      </div>
                    </div>
                    <p className="text-center text-xs text-white/30 font-ui mt-3">
                      First responders can scan to access your full medical profile
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Emergency Alert Banner ── */}
      {hasSevereAllergy && (
        <motion.div variants={item} className="overflow-hidden rounded-2xl border border-[#FF2D55]/30 bg-gradient-to-r from-[#FF2D55]/10 via-[#FF2D55]/5 to-transparent">
          <div className="flex items-start gap-4 p-4">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF2D55]/20">
              <AlertTriangle className="h-4 w-4 text-[#FF2D55]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold uppercase tracking-wider text-[#FF2D55] font-display">Critical Alert</span>
                <span className="rounded-md bg-[#FF2D55]/15 px-2 py-0.5 text-xs font-bold text-[#FF2D55] font-ui">SEVERE ALLERGY</span>
              </div>
              <p className="mt-1 text-sm text-[#FF2D55]/80 font-ui">
                <span className="font-bold">{allergies[0]}</span> — Risk of severe reaction. Do not administer. Alternative must be verified before use.
              </p>
            </div>
            <BadgeAlert className="h-5 w-5 shrink-0 text-[#FF2D55]/40" />
          </div>
        </motion.div>
      )}

      {/* ── Emergency Actions ── */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="glass-card p-5 text-left hover:bg-white/80 transition-all hover:shadow-lg"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF9500]/10">
              <User className="h-5 w-5 text-[#FF9500]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary font-display">Patient Info</h3>
              <p className="text-xs text-text-tertiary font-ui">Primary profile</p>
            </div>
          </div>
          <p className="text-base font-medium text-text-primary font-display">{displayName}</p>
          <p className="text-sm text-text-tertiary font-ui">32 yrs | Male</p>
          <p className="text-xs text-[#FF2D55] font-medium font-ui mt-1">{bloodGroup} Blood Donor</p>
        </motion.button>

        <motion.a
          href="tel:108"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="glass-card p-5 block hover:border-[#FF2D55]/30 hover:bg-[#FF2D55]/5 transition-all"
          style={{ borderColor: 'rgba(255,45,85,0.15)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF2D55]/15">
              <Phone className="h-5 w-5 text-[#FF2D55]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#FF2D55] font-display">Call Emergency</h3>
              <p className="text-xs text-[#FF2D55]/60 font-ui">24/7 immediate help</p>
            </div>
          </div>
          <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF2D55] px-4 py-3 text-sm font-bold text-white font-ui shadow-lg shadow-[#FF2D55]/20">
            <Phone className="h-4 w-4" />
            Dial 108 — Ambulance
          </div>
          <p className="mt-2 text-center text-xs text-text-tertiary font-ui">Also: 112 (International)</p>
        </motion.a>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="glass-card p-5 text-left hover:bg-white/80 transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#007AFF]/10">
              <MapPin className="h-5 w-5 text-[#007AFF]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary font-display">Share Location</h3>
              <p className="text-xs text-text-tertiary font-ui">Send to responders</p>
            </div>
          </div>
          <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#007AFF]/20 bg-[#007AFF]/5 px-4 py-3 text-sm font-semibold text-[#007AFF] font-ui hover:bg-[#007AFF]/10 transition-all">
            <MapPin className="h-4 w-4" />
            Share Live Location
          </div>
          <p className="mt-2 text-center text-xs text-text-tertiary font-ui">Bengaluru, Karnataka, India</p>
        </motion.button>
      </motion.div>

      {/* ── Emergency Readiness ── */}
      <motion.div variants={item} whileHover={{ scale: 1.01 }} className="glass-card p-5 transition-shadow duration-300 hover:shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#34C759]" />
            <h2 className="text-base font-semibold text-text-primary font-display">Emergency Readiness</h2>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold text-[#34C759] font-display">{score}</span>
            <span className="text-xs text-text-tertiary font-ui">/100</span>
          </div>
        </div>
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-content-secondary">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#FF9500] via-[#34C759] to-[#34C759]"
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.5, ease: easing }}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Profile Complete', value: 100, color: '#34C759' },
            { label: 'Contacts Verified', value: emergencyContacts.length > 0 ? 80 : 20, color: '#FF9500' },
            { label: 'Medical Info', value: bloodGroup ? 90 : 30, color: '#007AFF' },
          ].map((factor) => (
            <div key={factor.label} className="rounded-xl bg-content-secondary p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-text-tertiary font-ui">{factor.label}</span>
                <span className="text-sm font-semibold text-text-primary font-display">{factor.value}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${factor.value}%` }}
                  transition={{ duration: 1.2, delay: 0.3, ease: easing }}
                  style={{ backgroundColor: factor.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Tabs ── */}
      <motion.div variants={item}>
        <div className="flex gap-1 rounded-2xl glass-card p-1">
          {([
            { key: 'contacts' as Tab, label: 'Emergency Contacts', icon: Users, count: emergencyContacts.length },
            { key: 'medical' as Tab, label: 'Medical Info', icon: FileText },
            { key: 'access' as Tab, label: 'Access Control', icon: Lock, count: 4 },
          ]).map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold font-ui transition-all ${
                activeTab === key
                  ? 'bg-[#FF9500]/10 text-[#FF9500] shadow-sm'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
              {count !== undefined && (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${activeTab === key ? 'bg-[#FF9500]/15 text-[#FF9500]' : 'bg-content-secondary text-text-tertiary'}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Tab Content ── */}
      <motion.div variants={item} className="glass-card p-6 transition-shadow duration-300 hover:shadow-lg">
        {/* Emergency Contacts */}
        {activeTab === 'contacts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-text-primary font-display">Emergency Contacts</h3>
              {contactsLoading && <Skeleton className="h-5 w-20 rounded-md" />}
              {!contactsLoading && (
                <span className="text-xs text-text-tertiary font-ui">{emergencyContacts.length} contact{emergencyContacts.length !== 1 ? 's' : ''}</span>
              )}
            </div>
            {contactsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : emergencyContacts.length > 0 ? (
              <div className="space-y-3">
                {emergencyContacts.map((contact, idx) => (
                  <motion.div
                    key={contact.id || idx}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, ease: easing }}
                    className="flex items-center justify-between rounded-xl bg-content-secondary p-4 transition-all hover:bg-content-tertiary group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF9500]/20 to-[#FF2D55]/10">
                        <User className="h-5 w-5 text-[#FF9500]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary font-display">{contact.name}</p>
                        <p className="text-xs text-text-tertiary font-ui capitalize">{contact.relationship?.replace(/_/g, ' ') || 'Contact'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`hidden sm:inline rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider font-ui ${
                        contact.isNotified ? 'bg-[#34C759]/10 text-[#34C759]' : 'bg-[#FF9500]/10 text-[#FF9500]'
                      }`}>
                        {contact.isNotified ? 'Notified' : 'Pending'}
                      </span>
                      <a
                        href={`tel:${contact.phoneNumber.replace(/\s/g, '')}`}
                        className="flex items-center gap-1.5 rounded-xl bg-[#FF2D55]/10 px-3 py-2 text-sm font-semibold text-[#FF2D55] font-ui hover:bg-[#FF2D55]/20 transition-all"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {contact.phoneNumber}
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Users className="h-10 w-10 mx-auto mb-3 text-text-tertiary/40" />
                <p className="text-sm text-text-tertiary font-ui">No emergency contacts added yet</p>
                <p className="text-xs text-text-tertiary/60 font-ui mt-1">Add contacts so first responders can reach your loved ones</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Medical Info */}
        {activeTab === 'medical' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <h3 className="text-base font-semibold text-text-primary font-display mb-5">Medical Information</h3>

            {profileLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
              </div>
            ) : (
              <>
                {/* Blood Group */}
                <div className="rounded-xl bg-content-secondary p-4 mb-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Droplet className="h-4 w-4 text-[#FF2D55]" />
                    <span className="text-xs font-medium uppercase tracking-wider text-text-tertiary font-ui">Blood Group</span>
                  </div>
                  <p className="text-lg font-bold text-text-primary font-display">{bloodGroup}</p>
                </div>

                {/* Allergies */}
                <div className="mb-4">
                  <h4 className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-tertiary font-ui mb-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-[#FF9500]" />
                    Allergies & Intolerances
                  </h4>
                  {allergies.length > 0 ? (
                    <div className="space-y-2">
                      {allergies.map((allergy, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-xl bg-content-secondary px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-text-primary font-display">{allergy}</p>
                          </div>
                          <SeverityBadge severity={idx === 0 ? 'Severe' : idx === 1 ? 'Moderate' : 'Mild'} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-content-secondary p-4 text-center">
                      <p className="text-sm text-text-tertiary font-ui">No allergies recorded</p>
                    </div>
                  )}
                </div>

                {/* Conditions */}
                <div className="mb-4">
                  <h4 className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-tertiary font-ui mb-2">
                    <Stethoscope className="h-3.5 w-3.5 text-[#007AFF]" />
                    Medical Conditions
                  </h4>
                  {chronicConditions.length > 0 ? (
                    <div className="space-y-2">
                      {chronicConditions.map((condition, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-xl bg-content-secondary px-4 py-3">
                          <p className="text-sm font-semibold text-text-primary font-display">{condition}</p>
                          <StatusBadge status={idx === 0 ? 'Managed' : 'Controlled'} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-content-secondary p-4 text-center">
                      <p className="text-sm text-text-tertiary font-ui">No chronic conditions recorded</p>
                    </div>
                  )}
                </div>

                {/* Medications */}
                <div>
                  <h4 className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-tertiary font-ui mb-2">
                    <Pill className="h-3.5 w-3.5 text-[#5856D6]" />
                    Current Medications
                  </h4>
                  <div className="rounded-xl bg-content-secondary p-4 text-center">
                    <p className="text-sm text-text-tertiary font-ui">
                      {(profile?.medications?.length ?? 0) > 0
                        ? `${profile!.medications!.length} medication${profile!.medications!.length > 1 ? 's' : ''} active`
                        : 'Medication data available via health timeline'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Access Control */}
        {activeTab === 'access' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-text-primary font-display">Data Access Grants</h3>
              <span className="flex items-center gap-1 rounded-md bg-[#34C759]/10 px-2.5 py-1 text-xs font-semibold text-[#34C759] font-ui">
                <ShieldCheck className="h-3.5 w-3.5" />
                {emergencyContacts.length} Active
              </span>
            </div>

            {emergencyContacts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-content-secondary">
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary font-ui">Contact</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary font-ui">Relationship</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary font-ui">Phone</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary font-ui">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-content-secondary">
                    {emergencyContacts.map((contact, idx) => (
                      <tr key={contact.id || idx} className="transition-all hover:bg-content-secondary/50">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-[#FF9500]" />
                            <span className="text-sm font-medium text-text-primary font-display">{contact.name}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="rounded-md bg-content-secondary px-2 py-0.5 text-xs text-text-tertiary font-ui capitalize">
                            {contact.relationship?.replace(/_/g, ' ') || 'Contact'}
                          </span>
                        </td>
                        <td className="py-3 text-sm text-text-secondary font-ui">{contact.phoneNumber}</td>
                        <td className="py-3">
                          <span className={`text-xs font-medium font-ui ${contact.isNotified ? 'text-[#34C759]' : 'text-[#FF9500]'}`}>
                            {contact.isNotified ? 'Notified' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10">
                <Lock className="h-10 w-10 mx-auto mb-3 text-text-tertiary/40" />
                <p className="text-sm text-text-tertiary font-ui">No access grants active</p>
                <p className="text-xs text-text-tertiary/60 font-ui mt-1">Emergency contacts will appear here once added</p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* ── Footer Note ── */}
      <motion.div variants={item} className="text-center">
        <p className="text-xs text-text-tertiary font-ui">
          This profile is intended for emergency medical use only.
          <br />
          Data is encrypted and shared only with authorized medical personnel.
        </p>
      </motion.div>
    </motion.div>
  );
}
