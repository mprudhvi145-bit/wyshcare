/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(platform)/app/pharmacy/page.tsx
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
 - react-query
 - react
 - api
 - lucide-react
 - framer-motion
 *
 * Dependencies:
 - react-query
 - react
 - api
 - lucide-react
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

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Package, Plus, MapPin, Search, Clock, CheckCircle2, XCircle } from 'lucide-react';

import { api } from '@/lib/api';

const theme = {
  bg: { primary: '#0B0D10', secondary: '#15181D', tertiary: '#1C2025' },
  accent: { primary: '#8FD3D1', success: '#2EE59D', warning: '#FFD84D', danger: '#FF5A5A' },
} as const;

const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';
const glassCardCompact = 'rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02]';
const inputStyle = 'rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 font-ui outline-none focus:border-[#8FD3D1]/40 focus:bg-white/[0.05] transition-all';
const selectStyle = 'rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-4 py-3 text-sm text-white font-ui outline-none focus:border-[#8FD3D1]/40 transition-all';
const btnPrimary = 'rounded-[16px] bg-[#8FD3D1] text-black font-semibold text-sm font-ui hover:bg-[#8FD3D1]/90 transition-all';
const btnOutline = 'rounded-[16px] border border-[rgba(255,255,255,0.12)] text-white/70 font-ui text-sm hover:bg-white/[0.05] hover:text-white transition-all';

const statusConfig: Record<string, { color: string; label: string }> = {
  PENDING: { color: '#FFD84D', label: 'Pending' },
  CONFIRMED: { color: '#8FD3D1', label: 'Confirmed' },
  PROCESSING: { color: '#8FD3D1', label: 'Processing' },
  DISPATCHED: { color: '#2EE59D', label: 'Dispatched' },
  DELIVERED: { color: '#2EE59D', label: 'Delivered' },
  CANCELLED: { color: '#FF5A5A', label: 'Cancelled' },
};

export default function PharmacyPage() {
  const queryClient = useQueryClient();
  const [partnerId, setPartnerId] = useState('');
  const [address, setAddress] = useState('Banjara Hills, Hyderabad');
  const [medicineName, setMedicineName] = useState('Telmisartan');
  const [showCreate, setShowCreate] = useState(false);

  const partnersQuery = useQuery({ queryKey: ['pharmacy', 'partners'], queryFn: api.getPharmacyPartners });
  const ordersQuery = useQuery({ queryKey: ['pharmacy', 'orders'], queryFn: api.getPharmacyOrders });

  const createMutation = useMutation({
    mutationFn: () =>
      api.createPharmacyOrder({
        partnerId: partnerId || undefined,
        deliveryAddress: { line1: address, city: 'Hyderabad' },
        medicinePayload: [{ name: medicineName, quantity: 30 }],
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['pharmacy', 'orders'] });
      setShowCreate(false);
      setMedicineName('Telmisartan');
    },
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bg.primary }}>
      <div className="mx-auto" style={{ maxWidth: 1600 }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,0.06)]">
          <div>
            <h1 className="text-xl font-bold text-white font-display">WyshPharma</h1>
            <p className="text-sm text-white/40 font-ui mt-0.5">Prescription-driven partner pharmacy orders</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-[14px] bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20 px-3.5 py-2 text-xs font-medium font-ui hover:bg-[#8FD3D1]/20 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            New Order
          </button>
        </div>

        <div className="p-6 space-y-6">
          <AnimatePresence>
            {showCreate && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <div className={glassCard}>
                  <div className="p-5 border-b border-[rgba(255,255,255,0.06)]">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-[#8FD3D1]" />
                      <h2 className="text-base font-semibold text-white font-display">Create Medicine Order</h2>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-white/40 font-ui tracking-wider uppercase">Pharmacy Partner</label>
                        <select
                          className={selectStyle + ' w-full'}
                          onChange={(event) => setPartnerId(event.target.value)}
                          value={partnerId}
                        >
                          <option value="" className="bg-[#15181D]">Auto-assign</option>
                          {partnersQuery.data?.map((partner) => (
                            <option key={partner.id} value={partner.id} className="bg-[#15181D]">
                              {partner.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-white/40 font-ui tracking-wider uppercase">Medicine</label>
                        <div className="relative">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                          <input
                            className={inputStyle + ' w-full pl-10'}
                            onChange={(event) => setMedicineName(event.target.value)}
                            placeholder="Search medicine..."
                            value={medicineName}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-white/40 font-ui tracking-wider uppercase">Delivery Address</label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                          <input
                            className={inputStyle + ' w-full pl-10'}
                            onChange={(event) => setAddress(event.target.value)}
                            placeholder="Delivery address"
                            value={address}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        className={btnPrimary + ' px-6 py-3'}
                        onClick={() => createMutation.mutate()}
                        type="button"
                        disabled={createMutation.isPending}
                      >
                        {createMutation.isPending ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Creating...
                          </span>
                        ) : 'Place Order'}
                      </button>
                      <button
                        className={btnOutline + ' px-6 py-3'}
                        onClick={() => setShowCreate(false)}
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={glassCard}>
            <div className="p-5 border-b border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-[#8FD3D1]" />
                  <h2 className="text-base font-semibold text-white font-display">Orders</h2>
                </div>
                <span className="text-xs text-white/40 font-ui">{ordersQuery.data?.length || 0} orders</span>
              </div>
            </div>
            <div className="p-5">
              {ordersQuery.isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-[16px] bg-white/[0.03] animate-pulse" />
                  ))}
                </div>
              ) : ordersQuery.data?.length ? (
                <div className="space-y-3">
                  {ordersQuery.data.map((order: any, i: number) => {
                    const status = statusConfig[order.status] || { color: '#8FD3D1', label: order.status };
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={glassCardCompact + ' p-4 flex items-start justify-between gap-4'}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]"
                            style={{ backgroundColor: `${status.color}15` }}
                          >
                            {order.status === 'DELIVERED' ? (
                              <CheckCircle2 className="h-5 w-5" style={{ color: status.color }} />
                            ) : order.status === 'CANCELLED' ? (
                              <XCircle className="h-5 w-5" style={{ color: status.color }} />
                            ) : (
                              <Clock className="h-5 w-5" style={{ color: status.color }} />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-white font-ui">
                                {order.partner?.name ?? 'Pending Assignment'}
                              </span>
                              <span
                                className="text-[10px] font-medium px-2 py-0.5 rounded-full font-ui"
                                style={{
                                  color: status.color,
                                  backgroundColor: `${status.color}15`,
                                  border: `1px solid ${status.color}25`,
                                }}
                              >
                                {status.label}
                              </span>
                            </div>
                            <p className="text-xs text-white/40 font-ui mt-1">
                              {order.medicines?.length ? `${order.medicines.length} items` : 'No items'}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-white/30 font-ui">
                              {order.quotedTotal ? (
                                <span>₹{order.quotedTotal}</span>
                              ) : null}
                              {order.createdAt ? (
                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] mb-4">
                    <Pill className="h-6 w-6 text-white/30" />
                  </div>
                  <h4 className="text-sm font-medium text-white/60 font-ui mb-1">No orders yet</h4>
                  <p className="text-xs text-white/30 max-w-sm font-ui">Create a prescription-driven pharmacy order to get started.</p>
                  <button
                    onClick={() => setShowCreate(true)}
                    className="mt-4 rounded-[12px] bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20 px-4 py-2 text-xs font-medium font-ui hover:bg-[#8FD3D1]/20 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5 inline mr-1" />
                    Place Your First Order
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
