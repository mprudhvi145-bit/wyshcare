/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(auth)/otp/page.tsx
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
 - session-store
 - button
 - lucide-react
 - link
 *
 * Dependencies:
 - react
 - api
 - utils
 - navigation
 - session-store
 - button
 - lucide-react
 - link
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

import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useSessionStore } from '@/stores/session-store';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useSessionStore((state) => state.setSession);

  const phone = searchParams.get('phone') ?? '';
  const name = searchParams.get('name') ?? '';
  const role = searchParams.get('role') ?? 'PATIENT';
  const specialty = searchParams.get('specialty') ?? '';
  const purpose = (searchParams.get('purpose') ?? 'LOGIN') as 'LOGIN' | 'REGISTER';

  const ROLE_ROUTES: Record<string, string> = {
    PATIENT: '/wysh',
    DOCTOR: specialty ? `/doctor/emr/${specialty}` : '/os/doctor',
    NURSE: '/os/nurse',
    LAB: '/os/lab',
    PHARMACY: '/os/pharmacy',
    ADMIN: '/os/admin',
  };

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [cooldown, setCooldown] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleVerify() {
    setVerifying(true);
    setError(null);
    try {
      const data = await api.verifyOtp({
        phoneNumber: phone,
        otpCode: otp.join(''),
        deviceName: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 80) : 'web',
        fullName: name || undefined,
      });
      setSession({ user: data.user });
      router.push(ROLE_ROUTES[role] ?? '/wysh');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code. Please try again.');
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError(null);
    try {
      await api.requestOtp(phone, purpose === 'REGISTER' ? 'REGISTER' : 'LOGIN');
      setCooldown(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to resend code.');
    } finally {
      setResending(false);
    }
  }

  const handleChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;
      const digit = value.slice(-1);
      const next = [...otp];
      next[index] = digit;
      setOtp(next);

      if (digit && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp],
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setOtp(next);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (otp.join('').length !== OTP_LENGTH) return;
    handleVerify();
  }

  const isComplete = otp.join('').length === OTP_LENGTH;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      <div className="space-y-1.5 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#8FD3D1]/10">
          <ShieldCheck className="h-6 w-6 text-[#8FD3D1]" />
        </div>
        <h1 className="text-2xl font-semibold text-white">Verify your code</h1>
        <p className="text-sm text-white/50">
          Enter the 6-digit code sent to{' '}
          <span className="font-medium text-white/70">{phone}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              className={cn(
                'h-12 w-11 rounded-xl border text-center text-lg font-semibold text-white outline-none transition',
                'focus:border-[#8FD3D1] focus:ring-2 focus:ring-[#8FD3D1]/20',
                error ? 'border-red-400' : 'border-white/[0.08]',
              )}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center justify-center gap-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={verifying}
          disabled={verifying || !isComplete}
        >
          {verifying ? (
            <>Verifying…</>
          ) : (
            <>Verify &amp; Continue</>
          )}
        </Button>
      </form>

      <div className="text-center">
        {cooldown > 0 ? (
          <p className="text-sm text-white/40">
            Resend code in <span className="font-medium text-white/60">{cooldown}s</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#8FD3D1] hover:text-[#8FD3D1]/80 disabled:opacity-50"
          >
            {resending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            Resend code
          </button>
        )}
      </div>

      <p className="text-center text-sm text-white/50">
        {purpose === 'REGISTER' ? (
          <Link href="/signup" className="font-medium text-[#8FD3D1] hover:text-[#8FD3D1]/80">
            Back to registration
          </Link>
        ) : (
          <Link href="/login" className="font-medium text-[#8FD3D1] hover:text-[#8FD3D1]/80">
            Change phone number
          </Link>
        )}
      </p>
    </motion.div>
  );
}

export default function OtpPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    }>
      <OtpForm />
    </Suspense>
  );
}
