/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(platform)/app/diagnostics/page.tsx
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
import { Microscope, Plus, Search, Calendar, Upload, FileText, Home, Beaker, CheckCircle2, Clock, XCircle } from 'lucide-react';

import { api } from '@/lib/api';

const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';
const glassCardCompact = 'rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02]';
const inputStyle = 'rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 font-ui outline-none focus:border-[#8FD3D1]/40 focus:bg-white/[0.05] transition-all';
const selectStyle = 'rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-4 py-3 text-sm text-white font-ui outline-none focus:border-[#8FD3D1]/40 transition-all';
const btnPrimary = 'rounded-[16px] bg-[#8FD3D1] text-black font-semibold text-sm font-ui hover:bg-[#8FD3D1]/90 transition-all';
const btnOutline = 'rounded-[16px] border border-[rgba(255,255,255,0.12)] text-white/70 font-ui text-sm hover:bg-white/[0.05] hover:text-white transition-all';

const statusConfig: Record<string, { color: string; label: string }> = {
  PENDING: { color: '#FFD84D', label: 'Pending' },
  CONFIRMED: { color: '#8FD3D1', label: 'Confirmed' },
  COLLECTED: { color: '#8FD3D1', label: 'Collected' },
  PROCESSING: { color: '#FFD84D', label: 'Processing' },
  COMPLETED: { color: '#2EE59D', label: 'Completed' },
  CANCELLED: { color: '#FF5A5A', label: 'Cancelled' },
};

export default function DiagnosticsPage() {
  const queryClient = useQueryClient();
  const [showBook, setShowBook] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [partnerId, setPartnerId] = useState('');
  const [testCodes, setTestCodes] = useState('CBC,LIPID_PROFILE');
  const [homeCollection, setHomeCollection] = useState(true);
  const [reportType, setReportType] = useState('Lipid Profile');
  const [summary, setSummary] = useState('');
  const [reportFile, setReportFile] = useState<File | null>(null);

  const partnersQuery = useQuery({ queryKey: ['diagnostics', 'partners'], queryFn: api.getDiagnosticsPartners });
  const ordersQuery = useQuery({ queryKey: ['diagnostics', 'orders'], queryFn: api.getDiagnosticsOrders });
  const reportsQuery = useQuery({ queryKey: ['diagnostics', 'reports'], queryFn: api.getDiagnosticReports });

  const bookingMutation = useMutation({
    mutationFn: () =>
      api.createDiagnosticsOrder({
        partnerId: partnerId || undefined,
        testCodes: testCodes.split(',').map((value) => value.trim()).filter(Boolean),
        homeCollection,
        slotStartAt: new Date(Date.now() + 48 * 60 * 60_000).toISOString(),
        slotEndAt: new Date(Date.now() + 49 * 60 * 60_000).toISOString(),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['diagnostics', 'orders'] });
      setShowBook(false);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!reportFile) throw new Error('Choose a report file first');
      return api.uploadDiagnosticReport(reportFile, {
        reportType,
        partnerId: partnerId || undefined,
        title: `${reportType} report`,
        summary,
      });
    },
    onSuccess: async () => {
      setReportFile(null);
      setSummary('');
      setShowUpload(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['diagnostics', 'reports'] }),
        queryClient.invalidateQueries({ queryKey: ['records'] }),
      ]);
    },
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0D10' }}>
      <div className="mx-auto" style={{ maxWidth: 1600 }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,0.06)]">
          <div>
            <h1 className="text-xl font-bold text-white font-display">Diagnostics</h1>
            <p className="text-sm text-white/40 font-ui mt-0.5">Book tests, track orders, and upload reports</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-1.5 rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/70 font-ui hover:bg-white/[0.06] hover:text-white transition-all"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload
            </button>
            <button
              onClick={() => setShowBook(true)}
              className="flex items-center gap-1.5 rounded-[14px] bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20 px-3.5 py-2 text-xs font-medium font-ui hover:bg-[#8FD3D1]/20 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Book Tests
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Book Tests Modal */}
          <AnimatePresence>
            {showBook && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <div className={glassCard}>
                  <div className="p-5 border-b border-[rgba(255,255,255,0.06)]">
                    <div className="flex items-center gap-2">
                      <Beaker className="h-5 w-5 text-[#8FD3D1]" />
                      <h2 className="text-base font-semibold text-white font-display">Book Diagnostic Tests</h2>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-white/40 font-ui tracking-wider uppercase">Lab Partner</label>
                        <select className={selectStyle + ' w-full'} onChange={(e) => setPartnerId(e.target.value)} value={partnerId}>
                          <option value="" className="bg-[#15181D]">Assign later</option>
                          {partnersQuery.data?.map((partner) => (
                            <option key={partner.id} value={partner.id} className="bg-[#15181D]">{partner.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-white/40 font-ui tracking-wider uppercase">Test Codes</label>
                        <div className="relative">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                          <input
                            className={inputStyle + ' w-full pl-10'}
                            onChange={(e) => setTestCodes(e.target.value)}
                            placeholder="e.g. CBC,LIPID_PROFILE"
                            value={testCodes}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-white/40 font-ui tracking-wider uppercase">Collection</label>
                        <label className={selectStyle + ' flex items-center gap-3 px-4 py-3 cursor-pointer'}>
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            homeCollection ? 'border-[#8FD3D1] bg-[#8FD3D1]' : 'border-white/20'
                          }`}>
                            {homeCollection && <Home className="h-3 w-3 text-black" />}
                          </div>
                          <span className="text-sm text-white/70 font-ui"
                            onClick={() => setHomeCollection(!homeCollection)}
                          >Home Collection</span>
                          <input
                            checked={homeCollection}
                            onChange={(e) => setHomeCollection(e.target.checked)}
                            type="checkbox"
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        className={btnPrimary + ' px-6 py-3'}
                        onClick={() => bookingMutation.mutate()}
                        type="button"
                        disabled={bookingMutation.isPending}
                      >
                        {bookingMutation.isPending ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Booking...
                          </span>
                        ) : 'Book Diagnostics'}
                      </button>
                      <button className={btnOutline + ' px-6 py-3'} onClick={() => setShowBook(false)} type="button">Cancel</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload Report Modal */}
          <AnimatePresence>
            {showUpload && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <div className={glassCard}>
                  <div className="p-5 border-b border-[rgba(255,255,255,0.06)]">
                    <div className="flex items-center gap-2">
                      <Upload className="h-5 w-5 text-[#8FD3D1]" />
                      <h2 className="text-base font-semibold text-white font-display">Upload Report</h2>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-white/40 font-ui tracking-wider uppercase">Report Type</label>
                        <input className={inputStyle + ' w-full'} onChange={(e) => setReportType(e.target.value)} placeholder="Report type" value={reportType} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-white/40 font-ui tracking-wider uppercase">Summary</label>
                        <input className={inputStyle + ' w-full'} onChange={(e) => setSummary(e.target.value)} placeholder="Brief summary" value={summary} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-white/40 font-ui tracking-wider uppercase">File</label>
                        <label className={selectStyle + ' flex items-center gap-2 cursor-pointer'}>
                          <Upload className="h-4 w-4 text-white/40" />
                          <span className="text-sm text-white/50 font-ui">{reportFile ? reportFile.name : 'Choose file'}</span>
                          <input className="hidden" onChange={(e) => setReportFile(e.target.files?.[0] ?? null)} type="file" />
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        className={btnPrimary + ' px-6 py-3'}
                        onClick={() => uploadMutation.mutate()}
                        type="button"
                        disabled={uploadMutation.isPending || !reportFile}
                      >
                        {uploadMutation.isPending ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Uploading...
                          </span>
                        ) : 'Upload Report'}
                      </button>
                      <button className={btnOutline + ' px-6 py-3'} onClick={() => setShowUpload(false)} type="button">Cancel</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Orders & Reports Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className={glassCard}>
              <div className="p-5 border-b border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#8FD3D1]" />
                  <h2 className="text-base font-semibold text-white font-display">Orders</h2>
                </div>
              </div>
              <div className="p-5">
                {ordersQuery.isLoading ? (
                  <div className="space-y-3">{[1, 2].map((i) => (
                    <div key={i} className="h-20 rounded-[16px] bg-white/[0.03] animate-pulse" />
                  ))}</div>
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
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${status.color}15` }}>
                              {status.label === 'Completed' ? <CheckCircle2 className="h-5 w-5" style={{ color: status.color }} />
                                : status.label === 'Cancelled' ? <XCircle className="h-5 w-5" style={{ color: status.color }} />
                                : <Clock className="h-5 w-5" style={{ color: status.color }} />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-white font-ui">{order.partner?.name ?? 'Partner pending'}</span>
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full font-ui"
                                  style={{ color: status.color, backgroundColor: `${status.color}15`, border: `1px solid ${status.color}25` }}
                                >{status.label}</span>
                              </div>
                              <p className="text-xs text-white/40 font-ui mt-1">{order.testCodes?.join(', ')}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Beaker className="h-8 w-8 text-white/20 mb-3" />
                    <h4 className="text-sm font-medium text-white/60 font-ui">No orders yet</h4>
                    <p className="text-xs text-white/30 font-ui mt-1">Book your first diagnostic test.</p>
                    <button onClick={() => setShowBook(true)}
                      className="mt-3 rounded-[12px] bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20 px-4 py-2 text-xs font-medium font-ui hover:bg-[#8FD3D1]/20 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5 inline mr-1" />Book Tests
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={glassCard}>
              <div className="p-5 border-b border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#8FD3D1]" />
                  <h2 className="text-base font-semibold text-white font-display">Reports</h2>
                </div>
              </div>
              <div className="p-5">
                {reportsQuery.isLoading ? (
                  <div className="space-y-3">{[1, 2].map((i) => (
                    <div key={i} className="h-20 rounded-[16px] bg-white/[0.03] animate-pulse" />
                  ))}</div>
                ) : reportsQuery.data?.length ? (
                  <div className="space-y-3">
                    {reportsQuery.data.map((report: any, i: number) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={glassCardCompact + ' p-4'}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#8FD3D1]/10">
                              <FileText className="h-5 w-5 text-[#8FD3D1]" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white font-ui">{report.healthRecord?.title || report.reportType}</p>
                              <p className="text-xs text-white/40 font-ui mt-0.5">{report.summary ?? report.reportType}</p>
                            </div>
                          </div>
                          <button
                            className="rounded-[10px] border border-[rgba(255,255,255,0.08)] px-3 py-1.5 text-[10px] font-medium text-[#8FD3D1] font-ui hover:bg-white/[0.05] transition-all"
                            onClick={async () => {
                              const download = await api.getRecordDownloadUrl(report.healthRecord.id);
                              window.open(download.url, '_blank', 'noopener,noreferrer');
                            }}
                          >
                            View
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Upload className="h-8 w-8 text-white/20 mb-3" />
                    <h4 className="text-sm font-medium text-white/60 font-ui">No reports yet</h4>
                    <p className="text-xs text-white/30 font-ui mt-1">Upload diagnostic reports here.</p>
                    <button onClick={() => setShowUpload(true)}
                      className="mt-3 rounded-[12px] bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20 px-4 py-2 text-xs font-medium font-ui hover:bg-[#8FD3D1]/20 transition-all"
                    >
                      <Upload className="h-3.5 w-3.5 inline mr-1" />Upload Report
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
