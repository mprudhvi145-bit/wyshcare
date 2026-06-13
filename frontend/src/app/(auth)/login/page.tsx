/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(auth)/login/page.tsx
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
 - frontend/src/components/ui/glass-card.tsx
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 *
 * Calls:
 - react
 - api
 - utils
 - navigation
 - button
 - lucide-react
 - link
 - input
 *
 * Dependencies:
 - react
 - api
 - utils
 - navigation
 - button
 - lucide-react
 - link
 - input
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

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Stethoscope, User, Microscope, Pill, Syringe, Building2, Shield, ChevronDown, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

const ROLES = [
  { id: 'PATIENT', label: 'Patient', icon: User, color: '#8FD3D1' },
  { id: 'DOCTOR', label: 'Doctor', icon: Stethoscope, color: '#5856D6' },
  { id: 'NURSE', label: 'Nurse', icon: Syringe, color: '#34C759' },
  { id: 'LAB', label: 'Lab', icon: Microscope, color: '#007AFF' },
  { id: 'PHARMACY', label: 'Pharmacy', icon: Pill, color: '#AF52DE' },
  { id: 'ADMIN', label: 'Admin', icon: Shield, color: '#FF9500' },
];

const SPECIALTIES = [
  { id: 'general-medicine', label: 'General Medicine', icon: '🩺' },
  { id: 'dental', label: 'Dental', icon: '🦷' },
  { id: 'cardiology', label: 'Cardiology', icon: '❤️' },
  { id: 'dermatology', label: 'Dermatology', icon: '🧴' },
  { id: 'ent', label: 'ENT', icon: '👂' },
  { id: 'ophthalmology', label: 'Ophthalmology', icon: '👁️' },
  { id: 'pediatrics', label: 'Pediatrics', icon: '👶' },
  { id: 'orthopedics', label: 'Orthopedics', icon: '🦴' },
  { id: 'gynecology', label: 'Gynecology', icon: '🫃' },
  { id: 'neurology', label: 'Neurology', icon: '🧠' },
  { id: 'psychiatry', label: 'Psychiatry', icon: '💭' },
  { id: 'pulmonology', label: 'Pulmonology', icon: '🫁' },
  { id: 'gastroenterology', label: 'Gastroenterology', icon: '🔬' },
  { id: 'urology', label: 'Urology', icon: '🫘' },
  { id: 'endocrinology', label: 'Endocrinology', icon: '⚖️' },
  { id: 'general-surgery', label: 'General Surgery', icon: '🏥' },
  { id: 'radiology', label: 'Radiology', icon: '📡' },
  { id: 'anesthesiology', label: 'Anesthesiology', icon: '💉' },
];

function SpecialtyPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = SPECIALTIES.filter(
    (s) =>
      s.label.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()),
  );

  const selected = SPECIALTIES.find((s) => s.id === value);

  return (
    <div ref={ref} className="relative">
      <div
        role="combobox"
        aria-expanded={open}
        tabIndex={0}
        onClick={() => { setOpen(!open); setSearch(''); }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setHighlightIdx(0); }
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open); setSearch(''); }
        }}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-xl border px-3 text-sm transition-all cursor-pointer',
          open
            ? 'border-[rgba(255,255,255,0.15)] bg-white/[0.06]'
            : 'border-[rgba(255,255,255,0.06)] bg-white/[0.02] hover:bg-white/[0.04]',
        )}
      >
        <span className="flex items-center gap-2">
          {selected ? (
            <>
              <span className="text-base">{selected.icon}</span>
              <span className="text-white/70">{selected.label}</span>
            </>
          ) : (
            <span className="text-white/40">Select specialty...</span>
          )}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-white/40 transition-transform', open && 'rotate-180')} />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-white/10 bg-[#1a1a2e] py-1 shadow-2xl max-h-56 overflow-y-auto">
          <div className="sticky top-0 border-b border-white/5 bg-[#1a1a2e] px-2 pb-1 pt-1">
            <input
              autoFocus
              placeholder="Type to filter..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setHighlightIdx(0); }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIdx(0); }
                if (e.key === 'ArrowUp' && highlightIdx <= 0) { e.preventDefault(); setHighlightIdx(filtered.length - 1); }
                if (e.key === 'Enter' && highlightIdx >= 0 && filtered[highlightIdx]) {
                  onChange(filtered[highlightIdx].id); setOpen(false); setSearch('');
                }
                if (e.key === 'Escape') { setOpen(false); setSearch(''); }
              }}
              className="w-full rounded-lg border border-white/5 bg-white/[0.04] px-3 py-1.5 text-sm text-white/80 placeholder:text-white/30 outline-none"
            />
          </div>
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-white/30">No matching specialties</p>
          ) : (
            filtered.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onMouseEnter={() => setHighlightIdx(i)}
                onClick={() => { onChange(s.id); setOpen(false); setSearch(''); }}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                  i === highlightIdx ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]',
                )}
              >
                <span className="text-base">{s.icon}</span>
                <span className="flex-1 text-white/70">{s.label}</span>
                {s.id === value && <Check className="h-3.5 w-3.5 text-[#8FD3D1]" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState('PATIENT');
  const [specialty, setSpecialty] = useState('general-medicine');
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      await api.requestOtp(phoneNumber);
      const params = new URLSearchParams({ phone: phoneNumber, role });
      if (role === 'DOCTOR') {
        params.set('specialty', specialty);
      }
      router.push(`/otp?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold text-white">Welcome to WyshCare</h1>
        <p className="text-sm text-white/50">Choose your role to get started.</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {ROLES.map((r) => {
          const Icon = r.icon;
          const selected = role === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition-all',
                selected
                  ? 'border-[rgba(255,255,255,0.15)] bg-white/[0.06]'
                  : 'border-[rgba(255,255,255,0.06)] bg-white/[0.02] hover:bg-white/[0.04]',
              )}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: `${r.color}20` }}
              >
                <Icon className="h-4 w-4" style={{ color: r.color }} />
              </div>
              <span className="text-[11px] font-medium text-white/70 font-ui">{r.label}</span>
            </button>
          );
        })}
      </div>

      {role === 'DOCTOR' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2"
        >
          <label className="text-xs font-medium text-white/60">Specialty</label>
          <SpecialtyPicker value={specialty} onChange={setSpecialty} />
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">Phone Number</label>
          <Input
            placeholder="+91 98765 43210"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className={cn(error && 'border-red-400')}
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={isPending}>
          {isPending ? (
            <>Sending code…</>
          ) : (
            <>
              Send OTP <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-white/50">
        New to WyshCare?{' '}
        <Link href="/signup" className="font-medium text-[#8FD3D1] hover:text-[#8FD3D1]/80">
          Create an account
        </Link>
      </p>
    </motion.div>
  );
}
