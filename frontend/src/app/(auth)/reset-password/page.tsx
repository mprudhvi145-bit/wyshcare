/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(auth)/reset-password/page.tsx
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
 - frontend/src/components/ui/progress.tsx
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

import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, RotateCcw, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:30013';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') ?? '';

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [step, setStep] = useState<'otp' | 'password'>('otp');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleOtpChange = useCallback(
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

  const handleOtpKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp],
  );

  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
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

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otp.join('').length !== OTP_LENGTH) return;
    setVerifying(true);
    setError(null);
    try {
      await api.verifyOtp({
        phoneNumber: phone,
        otpCode: otp.join(''),
        deviceName: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 80) : 'web',
      });
      setStep('password');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError(null);
    try {
      await api.requestOtp(phone);
      setCooldown(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to resend code');
    } finally {
      setResending(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) return;
    if (newPassword !== confirmPassword) return;
    setResetting(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phoneNumber: phone, otpCode: otp.join(''), newPassword }),
      });
      if (!response.ok) {
        const raw = await response.json().catch(() => null);
        throw new Error((raw as { message?: string })?.message ?? 'Failed to reset password');
      }
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setResetting(false);
    }
  }

  const otpComplete = otp.join('').length === OTP_LENGTH;
  const passwordsMatch = newPassword === confirmPassword;
  const passwordError =
    confirmPassword.length > 0 && !passwordsMatch
      ? 'Passwords do not match'
      : newPassword.length > 0 && newPassword.length < 8
        ? 'Password must be at least 8 characters'
        : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      <div className="space-y-1.5 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#8FD3D1]/10">
          <Lock className="h-6 w-6 text-[#8FD3D1]" />
        </div>
        <h1 className="text-2xl font-semibold text-white">
          {step === 'otp' ? 'Reset code' : 'New password'}
        </h1>
        <p className="text-sm text-white/50">
          {step === 'otp'
            ? `Enter the 6-digit code sent to ${phone}`
            : 'Choose a strong password for your account'}
        </p>
      </div>

      {step === 'otp' ? (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
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
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                onPaste={i === 0 ? handleOtpPaste : undefined}
                className={cn(
                  'h-12 w-11 rounded-xl border text-center text-lg font-semibold text-white outline-none transition',
                  'focus:border-[#8FD3D1] focus:ring-2 focus:ring-[#8FD3D1]/20',
                  error && step === 'otp' ? 'border-red-400' : 'border-white/[0.08]',
                )}
              />
            ))}
          </div>

          {error && step === 'otp' && (
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
            disabled={verifying || !otpComplete}
          >
            {verifying ? <>Verifying…</> : <>Verify Code</>}
          </Button>

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
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">New Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={cn(passwordError && 'border-red-400')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">Confirm Password</label>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={cn(passwordError && 'border-red-400')}
            />
            {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
          </div>

          {error && step === 'password' && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={resetting}
            disabled={resetting || !passwordsMatch || newPassword.length < 8}
          >
            {resetting ? <>Resetting…</> : <>Reset Password</>}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-white/50">
        <Link href="/login" className="font-medium text-[#8FD3D1] hover:text-[#8FD3D1]/80">
          Back to sign in
        </Link>
      </p>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#8FD3D1]" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
