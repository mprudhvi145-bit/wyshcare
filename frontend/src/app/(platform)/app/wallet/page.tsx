/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(platform)/app/wallet/page.tsx
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
 - react
 - framer-motion
 - date-fns
 *
 * Dependencies:
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
import {
  Plus, ArrowUpRight, ArrowDownLeft, CreditCard, Award, TrendingUp, Gift, Shield, Star,
} from 'lucide-react';
import { format } from 'date-fns';

const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';
const glassCardCompact = 'rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02]';

const transactions = [
  { id: 't1', date: new Date(Date.now() - 86400000).toISOString(), description: 'Teleconsult - Dr. Kavya Nair', amount: 850, type: 'debit', category: 'Consultation' },
  { id: 't2', date: new Date(Date.now() - 172800000).toISOString(), description: 'Insurance credit - ICICI Lombard', amount: 5000, type: 'credit', category: 'Insurance' },
  { id: 't3', date: new Date(Date.now() - 259200000).toISOString(), description: 'Pharmacy order - Netmeds', amount: 567, type: 'debit', category: 'Pharmacy' },
  { id: 't4', date: new Date(Date.now() - 604800000).toISOString(), description: 'Lab test - Lipid Profile', amount: 600, type: 'debit', category: 'Diagnostics' },
  { id: 't5', date: new Date(Date.now() - 1209600000).toISOString(), description: 'Cashback - Wellness reward', amount: 200, type: 'credit', category: 'Rewards' },
  { id: 't6', date: new Date(Date.now() - 1814400000).toISOString(), description: 'Subscription - Premium Plan', amount: 999, type: 'debit', category: 'Subscription' },
];

const rewards = [
  { id: 'r1', title: 'Wellness Check-in', points: 100, status: 'completed', date: new Date(Date.now() - 604800000).toISOString() },
  { id: 'r2', title: 'Steps Goal (10k/day)', points: 50, status: 'completed', date: new Date(Date.now() - 1209600000).toISOString() },
  { id: 'r3', title: 'Health Record Upload', points: 75, status: 'pending', date: null },
];

function TabButton({ active, label, onClick, icon: Icon }: { active: boolean; label: string; onClick: () => void; icon: any }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-medium font-ui rounded-[10px] transition-all whitespace-nowrap ${
        active ? 'bg-[#8FD3D1]/10 text-[#8FD3D1]' : 'text-white/40 hover:text-white/60'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

export default function WalletPage() {
  const balance = 12450;
  const insuranceCredits = 5000;
  const totalPoints = rewards.filter((r) => r.status === 'completed').reduce((s, r) => s + r.points, 0);
  const [activeTab, setActiveTab] = useState('transactions');

  const statCards = [
    { icon: Shield, color: '#2EE59D', label: 'Insurance Credits', value: `₹${insuranceCredits.toLocaleString()}` },
    { icon: Award, color: '#FFD84D', label: 'Reward Points', value: `${totalPoints}` },
    { icon: Star, color: '#8FD3D1', label: 'Subscription', value: 'Premium' },
    { icon: TrendingUp, color: '#5856D6', label: 'Cashback Earned', value: '₹850' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0D10' }}>
      <div className="mx-auto" style={{ maxWidth: 1600 }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,0.06)]">
          <div>
            <h1 className="text-xl font-bold text-white font-display">Health Wallet</h1>
            <p className="text-sm text-white/40 font-ui mt-0.5">Manage your health finances and rewards</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[24px] bg-gradient-to-br from-[#1a3a3a] to-[#0B1B1B] border border-[#8FD3D1]/20 p-6"
            >
              <p className="text-sm font-medium text-white/60 font-ui">Available Balance</p>
              <p className="mt-2 text-4xl font-bold text-white font-display">₹{balance.toLocaleString()}</p>
              <div className="mt-6 flex gap-2">
                <button className="flex items-center gap-1.5 rounded-[12px] bg-white/10 text-white px-4 py-2 text-xs font-medium font-ui hover:bg-white/15 transition-all">
                  <Plus className="h-3.5 w-3.5" />
                  Add Money
                </button>
                <button className="flex items-center gap-1.5 rounded-[12px] bg-white/10 text-white px-4 py-2 text-xs font-medium font-ui hover:bg-white/15 transition-all">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Send
                </button>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              {statCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={glassCardCompact + ' flex flex-col items-center justify-center text-center p-4'}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${card.color}15` }}>
                    <card.icon className="h-5 w-5" style={{ color: card.color }} />
                  </div>
                  <p className="mt-2 text-[11px] font-medium text-white/40 font-ui">{card.label}</p>
                  <p className="text-xl font-bold text-white font-display">{card.value}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className={glassCard}>
            <div className="p-5 border-b border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <TabButton active={activeTab === 'transactions'} label="Transactions" icon={CreditCard} onClick={() => setActiveTab('transactions')} />
                <TabButton active={activeTab === 'rewards'} label="Rewards" icon={Gift} onClick={() => setActiveTab('rewards')} />
                <TabButton active={activeTab === 'insurance'} label="Insurance Credits" icon={Shield} onClick={() => setActiveTab('insurance')} />
              </div>
            </div>

            <div className="p-5">
              {activeTab === 'transactions' && (
                <div className="space-y-1">
                  {transactions.map((tx, i) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.04)] last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${
                          tx.type === 'credit' ? 'bg-[#2EE59D]/10' : 'bg-[#FF5A5A]/10'
                        }`}>
                          {tx.type === 'credit'
                            ? <ArrowDownLeft className="h-4 w-4 text-[#2EE59D]" />
                            : <ArrowUpRight className="h-4 w-4 text-[#FF5A5A]" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white font-ui">{tx.description}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-white/40 font-ui">{format(new Date(tx.date), 'MMM d, h:mm a')}</span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full font-ui text-white/30 bg-white/[0.04]">{tx.category}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-sm font-semibold font-ui ${
                        tx.type === 'credit' ? 'text-[#2EE59D]' : 'text-[#FF5A5A]'
                      }`}>
                        {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === 'rewards' && (
                <div className="space-y-2">
                  {rewards.map((reward, i) => (
                    <motion.div
                      key={reward.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={glassCardCompact + ' p-4 flex items-center justify-between'}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${
                          reward.status === 'completed' ? 'bg-[#2EE59D]/10' : 'bg-white/[0.03]'
                        }`}>
                          <Award className={`h-4 w-4 ${reward.status === 'completed' ? 'text-[#2EE59D]' : 'text-white/30'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white font-ui">{reward.title}</p>
                          {reward.date && (
                            <p className="text-[11px] text-white/40 font-ui">{format(new Date(reward.date), 'MMM d, yyyy')}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#FFD84D]">{reward.points} pts</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full font-ui ${
                          reward.status === 'completed'
                            ? 'text-[#2EE59D] bg-[#2EE59D]/10 border border-[#2EE59D]/20'
                            : 'text-white/40 bg-white/[0.04] border border-white/[0.06]'
                        }`}>{reward.status}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === 'insurance' && (
                <div className={glassCardCompact + ' p-5'}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-white font-ui">ICICI Lombard Health Shield</p>
                      <p className="text-xs text-white/40 font-ui">Available credit for claims and consultations</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white font-display">₹{insuranceCredits.toLocaleString()}</p>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full font-ui text-[#2EE59D] bg-[#2EE59D]/10 border border-[#2EE59D]/20">Active</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-[#8FD3D1]" style={{ width: '65%' }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-white/30 font-ui mt-1.5">
                    <span>Used: ₹3,500</span>
                    <span>Total: ₹8,500</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
