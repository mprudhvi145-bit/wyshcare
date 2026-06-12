/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(platform)/app/records/page.tsx
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
import { motion } from 'framer-motion';
import { FileText, Upload, Pill, Download, Search, FileType, Plus, Eye } from 'lucide-react';

import { api } from '@/lib/api';

const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';
const glassCardCompact = 'rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02]';
const inputStyle = 'rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 font-ui outline-none focus:border-[#8FD3D1]/40 focus:bg-white/[0.05] transition-all';
const selectStyle = 'rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-4 py-3 text-sm text-white font-ui outline-none focus:border-[#8FD3D1]/40 transition-all';
const btnPrimary = 'rounded-[16px] bg-[#8FD3D1] text-black font-semibold text-sm font-ui hover:bg-[#8FD3D1]/90 transition-all';

export default function RecordsPage() {
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [recordType, setRecordType] = useState('OTHER');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const recordsQuery = useQuery({ queryKey: ['records'], queryFn: api.getRecords });
  const prescriptionsQuery = useQuery({ queryKey: ['prescriptions'], queryFn: api.getPrescriptions });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Choose a file first');
      return api.uploadRecord(file, { recordType, title: title || file.name, description });
    },
    onSuccess: async () => {
      setFile(null);
      setTitle('');
      setDescription('');
      setShowUpload(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['records'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
    },
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0D10' }}>
      <div className="mx-auto" style={{ maxWidth: 1600 }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,0.06)]">
          <div>
            <h1 className="text-xl font-bold text-white font-display">WyshVault</h1>
            <p className="text-sm text-white/40 font-ui mt-0.5">Your health records, all in one place</p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 rounded-[14px] bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20 px-3.5 py-2 text-xs font-medium font-ui hover:bg-[#8FD3D1]/20 transition-all"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload Record
          </button>
        </div>

        <div className="p-6 space-y-6">
          {showUpload && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={glassCard}
            >
              <div className="p-5 border-b border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-[#8FD3D1]" />
                  <h2 className="text-base font-semibold text-white font-display">Upload Health Record</h2>
                </div>
              </div>
              <form className="p-5 space-y-4" onSubmit={(e) => { e.preventDefault(); uploadMutation.mutate(); }}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-white/40 font-ui tracking-wider uppercase">Title</label>
                    <input className={inputStyle + ' w-full'} onChange={(e) => setTitle(e.target.value)} placeholder="Record title" value={title} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-white/40 font-ui tracking-wider uppercase">Type</label>
                    <select className={selectStyle + ' w-full'} onChange={(e) => setRecordType(e.target.value)} value={recordType}>
                      <option value="PRESCRIPTION" className="bg-[#15181D]">Prescription</option>
                      <option value="DIAGNOSTIC_REPORT" className="bg-[#15181D]">Diagnostic Report</option>
                      <option value="CONSULTATION_NOTE" className="bg-[#15181D]">Consultation Note</option>
                      <option value="OTHER" className="bg-[#15181D]">Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/40 font-ui tracking-wider uppercase">Description</label>
                  <input className={inputStyle + ' w-full'} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" value={description} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/40 font-ui tracking-wider uppercase">File</label>
                  <label className={selectStyle + ' flex items-center gap-3 cursor-pointer'}>
                    <Upload className="h-4 w-4 text-white/40" />
                    <span className="text-sm text-white/50 font-ui">{file ? file.name : 'Choose file...'}</span>
                    <input className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} type="file" />
                  </label>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button className={btnPrimary + ' px-6 py-3'} type="submit" disabled={uploadMutation.isPending || !file}>
                    {uploadMutation.isPending ? 'Uploading...' : 'Upload to WyshVault'}
                  </button>
                  <button className="rounded-[16px] border border-[rgba(255,255,255,0.12)] text-white/70 font-ui text-sm px-6 py-3 hover:bg-white/[0.05] hover:text-white transition-all"
                    onClick={() => setShowUpload(false)} type="button">Cancel</button>
                </div>
                {uploadMutation.error && (
                  <p className="text-xs text-[#FF5A5A] font-ui mt-2">{uploadMutation.error.message}</p>
                )}
              </form>
            </motion.div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className={glassCard}>
              <div className="p-5 border-b border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#8FD3D1]" />
                  <h2 className="text-base font-semibold text-white font-display">Health Records</h2>
                </div>
              </div>
              <div className="p-5">
                {recordsQuery.isLoading ? (
                  <div className="space-y-3">{[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-[16px] bg-white/[0.03] animate-pulse" />
                  ))}</div>
                ) : recordsQuery.data?.length ? (
                  <div className="space-y-3">
                    {recordsQuery.data.map((record: any, i: number) => (
                      <motion.div
                        key={record.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={glassCardCompact + ' p-4 flex items-start justify-between gap-4'}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#8FD3D1]/10">
                            <FileText className="h-5 w-5 text-[#8FD3D1]" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-white font-ui">{record.title}</span>
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full font-ui text-white/40 bg-white/[0.04] border border-white/[0.06]">
                                {record.recordType}
                              </span>
                            </div>
                            <p className="text-xs text-white/40 font-ui mt-1">{record.description ?? record.recordType}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-8 w-8 text-white/20 mb-3" />
                    <h4 className="text-sm font-medium text-white/60 font-ui">No records yet</h4>
                    <p className="text-xs text-white/30 font-ui mt-1">Upload your first health record.</p>
                    <button onClick={() => setShowUpload(true)}
                      className="mt-3 rounded-[12px] bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20 px-4 py-2 text-xs font-medium font-ui hover:bg-[#8FD3D1]/20 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5 inline mr-1" />Upload
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={glassCard}>
              <div className="p-5 border-b border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-[#8FD3D1]" />
                  <h2 className="text-base font-semibold text-white font-display">Prescriptions</h2>
                </div>
              </div>
              <div className="p-5">
                {prescriptionsQuery.isLoading ? (
                  <div className="space-y-3">{[1, 2].map((i) => (
                    <div key={i} className="h-24 rounded-[16px] bg-white/[0.03] animate-pulse" />
                  ))}</div>
                ) : prescriptionsQuery.data?.length ? (
                  <div className="space-y-3">
                    {prescriptionsQuery.data.map((rx: any, i: number) => (
                      <motion.div
                        key={rx.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={glassCardCompact + ' p-4'}
                      >
                        <p className="text-sm font-medium text-white font-ui">{rx.doctorProfile?.user?.fullName ?? 'Care team'}</p>
                        <p className="text-xs text-white/40 font-ui mt-1">{rx.diagnosisSummary ?? 'Medication plan'}</p>
                        {rx.medications?.length && (
                          <p className="text-[11px] text-white/30 font-ui mt-2">
                            {rx.medications.map((m: any) => `${m.name} ${m.dosage ?? ''}`).join(' • ')}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Pill className="h-8 w-8 text-white/20 mb-3" />
                    <h4 className="text-sm font-medium text-white/60 font-ui">No prescriptions</h4>
                    <p className="text-xs text-white/30 font-ui mt-1">Prescriptions will appear here.</p>
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
