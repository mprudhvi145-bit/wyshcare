/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(auth)/signup/page.tsx
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

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Stethoscope, User, Syringe, Microscope, Pill, Shield } from 'lucide-react';
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
  { id: 'general-medicine', label: 'General Medicine', icon: '🩺', color: '#8FD3D1' },
  { id: 'dental', label: 'Dental', icon: '🦷', color: '#FFD84D' },
  { id: 'dermatology', label: 'Dermatology', icon: '🧴', color: '#FF5A5A' },
  { id: 'ent', label: 'ENT', icon: '👂', color: '#2EE59D' },
  { id: 'ophthalmology', label: 'Ophthalmology', icon: '👁️', color: '#5856D6' },
  { id: 'cardiology', label: 'Cardiology', icon: '❤️', color: '#FF2D55' },
  { id: 'pediatrics', label: 'Pediatrics', icon: '👶', color: '#FF9F0A' },
  { id: 'orthopedics', label: 'Orthopedics', icon: '🦴', color: '#64D2FF' },
];

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState('PATIENT');
  const [specialty, setSpecialty] = useState('general-medicine');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [email, setEmail] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    try {
      await api.requestOtp(phoneNumber, 'REGISTER');
      const params = new URLSearchParams({ phone: phoneNumber, name: fullName, purpose: 'REGISTER', role });
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

  const canSubmit = fullName.trim().length > 0 && phoneNumber.length > 3 && acceptedTerms;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold text-white">Create your account</h1>
        <p className="text-sm text-white/50">Choose your role and join WyshCare.</p>
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
          <div className="grid grid-cols-2 gap-1.5">
            {SPECIALTIES.map((s) => {
              const selected = specialty === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSpecialty(s.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all',
                    selected
                      ? 'border-[rgba(255,255,255,0.15)] bg-white/[0.06]'
                      : 'border-[rgba(255,255,255,0.06)] bg-white/[0.02] hover:bg-white/[0.04]',
                  )}
                >
                  <span className="text-base">{s.icon}</span>
                  <span className="text-[12px] font-medium text-white/70 font-ui truncate">{s.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">Full Name</label>
          <Input
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">Phone Number</label>
          <Input
            placeholder="+91 98765 43210"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className={cn(error && 'border-red-400')}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">
            Email <span className="text-white/40">(optional)</span>
          </label>
          <Input
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <label className="flex items-start gap-3 pt-1">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-white/30 text-[#8FD3D1] focus:ring-[#8FD3D1]/20"
          />
          <span className="text-sm text-white/50 leading-relaxed">
            I agree to the{' '}
            <Link href="/terms" className="font-medium text-[#8FD3D1] hover:text-[#8FD3D1]/80">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="font-medium text-[#8FD3D1] hover:text-[#8FD3D1]/80">
              Privacy Policy
            </Link>
          </span>
        </label>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={isPending}
          disabled={isPending || !canSubmit}
        >
          {isPending ? (
            <>Creating account…</>
          ) : (
            <>
              Create Account <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-white/50">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-[#8FD3D1] hover:text-[#8FD3D1]/80">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
