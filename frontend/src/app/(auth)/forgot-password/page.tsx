/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(auth)/forgot-password/page.tsx
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
import { KeyRound, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    try {
      await api.requestOtp(phoneNumber);
      router.push(`/reset-password?phone=${encodeURIComponent(phoneNumber)}`);
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
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#8FD3D1]/10">
          <KeyRound className="h-6 w-6 text-[#8FD3D1]" />
        </div>
        <h1 className="text-2xl font-semibold text-white">Forgot password?</h1>
        <p className="text-sm text-white/50">
          Enter your phone number and we&apos;ll send you a reset code.
        </p>
      </div>

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

        <Button type="submit" className="w-full" size="lg" loading={isPending} disabled={isPending}>
          {isPending ? (
            <>Sending code…</>
          ) : (
            <>
              Send Reset Code <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-white/50">
        Remember your password?{' '}
        <Link href="/login" className="font-medium text-[#8FD3D1] hover:text-[#8FD3D1]/80">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
