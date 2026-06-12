/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(platform)/app/subscriptions/page.tsx
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
 - lucide-react
 - react
 - framer-motion
 - date-fns
 *
 * Dependencies:
 - lucide-react
 - react
 - framer-motion
 - date-fns
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
import { motion } from 'framer-motion';
import { Crown, Check, Sparkles, Users, Heart, Clock } from 'lucide-react';
import { format } from 'date-fns';

const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';

const plans = [
  {
    id: 'free', name: 'Free', price: 0, period: 'month',
    description: 'Essential health management', popular: false, current: true,
    features: ['Health records vault (up to 10)', 'Basic health timeline', 'Doctor discovery', 'Emergency QR identity', 'Email support'],
    color: '#15181D', icon: Heart,
  },
  {
    id: 'premium', name: 'Premium', price: 499, period: 'month',
    description: 'Complete health companion', popular: true, current: false,
    features: ['Unlimited health records', 'AI health insights & recommendations', 'Family health management (up to 4)', 'Priority telemedicine booking', 'Pharmacy discount (up to 15%)', 'Insurance claim assistance', '24/7 priority support'],
    color: '#1a3a3a', icon: Crown,
  },
  {
    id: 'family', name: 'Family', price: 999, period: 'month',
    description: 'For the whole family', popular: false, current: false,
    features: ['Everything in Premium', 'Up to 6 family members', 'Shared family vault', 'Family telemedicine plan', 'Caregiver coordination tools', 'Annual health check-up reminder', 'Dedicated care manager'],
    color: '#1a1a2e', icon: Users,
  },
];

const billingHistory = [
  { id: 'b1', date: new Date(Date.now() - 86400000).toISOString(), plan: 'Free', amount: 0, status: 'ACTIVE', method: '—' },
  { id: 'b2', date: new Date(Date.now() - 2592000000).toISOString(), plan: 'Free Trial', amount: 0, status: 'EXPIRED', method: '—' },
];

export default function SubscriptionsPage() {
  const [selectedPlan] = useState('free');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0D10' }}>
      <div className="mx-auto" style={{ maxWidth: 1600 }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,0.06)]">
          <div>
            <h1 className="text-xl font-bold text-white font-display">Subscription Plans</h1>
            <p className="text-sm text-white/40 font-ui mt-0.5">Choose the plan that fits your health needs</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan, i) => {
              const isCurrent = plan.current;
              const Icon = plan.icon;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`${glassCard} relative flex flex-col p-6 ${
                    plan.popular ? 'ring-1 ring-[#8FD3D1]/40' : ''
                  } ${isCurrent ? 'ring-1 ring-[#2EE59D]/40' : ''}`}
                >
                  {(plan.popular || isCurrent) && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-[10px] font-medium font-ui rounded-full shadow-lg ${
                        isCurrent
                          ? 'bg-[#2EE59D]/10 text-[#2EE59D] border border-[#2EE59D]/20'
                          : 'bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20'
                      }`}>
                        {isCurrent ? (
                          <><Check className="h-3 w-3" /> Current Plan</>
                        ) : (
                          <><Sparkles className="h-3 w-3" /> Most Popular</>
                        )}
                      </span>
                    </div>
                  )}

                  <div className="text-center pb-4 border-b border-[rgba(255,255,255,0.06)]">
                    <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] ${
                      plan.id === 'free' ? 'bg-white/[0.04] text-white/50' :
                      plan.id === 'premium' ? 'bg-[#8FD3D1]/10 text-[#8FD3D1]' :
                      'bg-[#5856D6]/10 text-[#5856D6]'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="mt-3 text-lg font-bold text-white font-display">{plan.name}</p>
                    <p className="mt-1 text-sm text-white/50 font-ui">{plan.description}</p>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-white font-display">
                        {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                      </span>
                      {plan.price > 0 && <span className="text-sm text-white/40 font-ui">/{plan.period}</span>}
                    </div>
                  </div>

                  <div className="flex-1 py-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, fi) => (
                        <li key={fi} className="flex items-start gap-2 text-sm text-white/60 font-ui">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2EE59D]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    className={`w-full rounded-[14px] py-2.5 text-sm font-medium font-ui transition-all mt-auto ${
                      isCurrent
                        ? 'bg-white/[0.05] text-white/40 border border-[rgba(255,255,255,0.08)] cursor-not-allowed'
                        : plan.popular
                          ? 'bg-[#8FD3D1] text-black font-semibold hover:bg-[#8FD3D1]/90'
                          : 'border border-[rgba(255,255,255,0.12)] text-white/70 hover:bg-white/[0.05] hover:text-white'
                    }`}
                    disabled={isCurrent}
                  >
                    {isCurrent ? 'Current Plan' : plan.price === 0 ? 'Get Started' : `Upgrade to ${plan.name}`}
                  </button>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={glassCard}
          >
            <div className="p-5">
              <h3 className="text-sm font-semibold text-white font-display flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-white/40" />
                Billing History
              </h3>
              <div className="space-y-1">
                {billingHistory.length === 0 ? (
                  <p className="text-sm text-white/40 font-ui py-4">No billing history</p>
                ) : (
                  billingHistory.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                      <div>
                        <p className="text-sm font-medium text-white font-ui">{bill.plan} Plan</p>
                        <p className="text-xs text-white/40 font-ui">{format(new Date(bill.date), 'MMMM d, yyyy')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-white">{bill.amount === 0 ? 'Free' : `₹${bill.amount}`}</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full font-ui ${
                          bill.status === 'ACTIVE'
                            ? 'text-[#2EE59D] bg-[#2EE59D]/10 border border-[#2EE59D]/20'
                            : 'text-white/40 bg-white/[0.04] border border-white/[0.06]'
                        }`}>{bill.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
