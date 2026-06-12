/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/features/auth/login-form.tsx
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
 * React component: login-form
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
 - card
 - react
 - api
 - navigation
 - session-store
 - button
 - input
 *
 * Dependencies:
 - card
 - react
 - api
 - navigation
 - session-store
 - button
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

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useSessionStore } from '@/stores/session-store';

export function LoginForm() {
  const router = useRouter();
  const setSession = useSessionStore((state) => state.setSession);
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpPreview, setOtpPreview] = useState<string>();
  const [error, setError] = useState<string>();

  async function handleRequestOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequesting(true);
    setError(undefined);

    try {
      const response = await api.requestOtp(phoneNumber);
      setOtpRequested(true);
      setOtpPreview(response.otpPreview);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to request OTP');
    } finally {
      setRequesting(false);
    }
  }

  async function handleVerifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setVerifying(true);
    setError(undefined);

    try {
      const response = await api.verifyOtp({
        phoneNumber,
        otpCode,
        deviceName: typeof navigator === 'undefined' ? 'web' : navigator.userAgent.slice(0, 80),
        fullName: fullName || undefined,
      });

      setSession({ user: response.user });
      router.push('/app');
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : 'Unable to verify OTP');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div>
      <Card className="max-w-md">
        <div className="mb-6 space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-800">Secure Access</p>
          <h1 className="text-3xl font-semibold text-slate-950">Sign in with OTP</h1>
          <p className="text-sm text-slate-600">Patient identity, consent, and records remain privacy-gated.</p>
        </div>
        <form
          className="space-y-4"
          onSubmit={otpRequested ? handleVerifyOtp : handleRequestOtp}
        >
          <Input
            name="phoneNumber"
            onChange={(event) => setPhoneNumber(event.target.value)}
            placeholder="+91 98765 43210"
            value={phoneNumber}
          />
          <Input
            name="fullName"
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Full name for first-time onboarding"
            value={fullName}
          />
          {otpRequested ? (
            <Input
              name="otpCode"
              onChange={(event) => setOtpCode(event.target.value)}
              placeholder="Enter 6-digit OTP"
              value={otpCode}
            />
          ) : null}
          {otpPreview ? <p className="text-sm text-cyan-800">Dev OTP: {otpPreview}</p> : null}
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          <Button className="w-full" type="submit">
            {otpRequested ? (verifying ? 'Verifying…' : 'Verify OTP') : requesting ? 'Requesting…' : 'Request OTP'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
