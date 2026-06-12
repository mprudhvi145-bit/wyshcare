/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/os/doctor/page.tsx
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
 - frontend/src/hooks/use-emergency.ts
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 *
 * Calls:
 - react-query
 - react
 - utils
 - session-store
 - api-client
 *
 * Dependencies:
 - react-query
 - react
 - utils
 - session-store
 - api-client
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

'use client'

import { useState, useMemo } from 'react'
import {
  Activity, AlertTriangle, Apple, ArrowRight, Award, BadgeCheck, Brain,
  Calendar, ChevronDown, ChevronRight, ClipboardList, Clock, Droplets,
  FileText, Fingerprint, FlaskConical, HeartPulse, Lightbulb, Microscope,
  Moon, Pill, Plus, RefreshCw, Save, Scale, Search, Shield, Sparkles,
  Stethoscope, Syringe, Target, Thermometer, TrendingUp, TriangleAlert,
  Trophy, User, Users, Video, X, Zap, Eye, Download, Printer, Share2,
  Dna, BookOpen, CheckCircle2, AlertOctagon, BarChart3,
} from 'lucide-react'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useSessionStore } from '@/stores/session-store'
import { cn } from '@/lib/utils'
import type { PatientChartResponse, SoapNote, DifferentialDiagnosis, Guideline } from '@/types'

const easing = [0.16, 1, 0.3, 1] as const
const theme = {
  bg: { primary: '#0B0D10', secondary: '#15181D', tertiary: '#1C2025' },
  accent: { primary: '#8FD3D1', success: '#2EE59D', warning: '#FFD84D', danger: '#FF5A5A' },
  radius: { card: 24, input: 16, button: 14 },
  border: 'rgba(255,255,255,0.08)',
} as const

const emptyChart: PatientChartResponse = {
  patient: { id: '', fullName: 'Unknown Patient', age: 0, gender: '—', bloodGroup: '—' },
  conditions: [], allergies: [], medications: [], encounters: [], vitals: [],
}

const priorityColors: Record<string, string> = {
  HIGH: 'text-[#FF5A5A] bg-[#FF5A5A]/10 border-[#FF5A5A]/20',
  MEDIUM: 'text-[#FFD84D] bg-[#FFD84D]/10 border-[#FFD84D]/20',
  LOW: 'text-[#8FD3D1] bg-[#8FD3D1]/10 border-[#8FD3D1]/20',
}

const severityMap = (s?: string): 'HIGH' | 'MEDIUM' | 'LOW' => {
  if (!s) return 'LOW'
  const up = s.toUpperCase()
  if (['HIGH', 'CRITICAL', 'SEVERE'].includes(up)) return 'HIGH'
  if (['MEDIUM', 'MODERATE'].includes(up)) return 'MEDIUM'
  return 'LOW'
}

const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl'
const glassInput = 'w-full rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/30 font-ui focus:outline-none focus:border-[#8FD3D1]/30 focus:bg-white/[0.05] transition-all'
const glassTextarea = 'w-full rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] p-3 text-sm text-white placeholder:text-white/30 font-ui focus:outline-none focus:border-[#8FD3D1]/30 focus:bg-white/[0.05] transition-all resize-none'

function InitialsCircle({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-[#8FD3D1] to-[#2EE59D] text-[#0B0D10] font-bold font-display shadow-lg shadow-[#8FD3D1]/20"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, unit, color = '#8FD3D1', trend }: {
  icon: any; label: string; value: string | number; unit?: string; color?: string; trend?: { dir: 'up' | 'down'; val: string }
}) {
  return (
    <div className="rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02] p-3.5 transition-all duration-200 hover:bg-white/[0.04]">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-[10px]" style={{ backgroundColor: `${color}15` }}>
          <Icon className="h-3.5 w-3.5" style={{ color }} />
        </div>
        <span className="text-[11px] font-medium text-white/50 font-ui tracking-wide">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-white font-display tracking-tight">{value}</span>
        {unit && <span className="text-[11px] text-white/40 font-ui">{unit}</span>}
      </div>
      {trend && (
        <div className={cn('flex items-center gap-1 mt-1 text-[10px] font-medium font-ui', trend.dir === 'up' ? 'text-[#2EE59D]' : 'text-[#FF5A5A]')}>
          <TrendingUp className={cn('h-3 w-3', trend.dir === 'down' && 'rotate-180')} />
          {trend.val}
        </div>
      )}
    </div>
  )
}

function TabButton({ active, label, icon: Icon, onClick, badge }: {
  active: boolean; label: string; icon: any; onClick: () => void; badge?: string | number
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-2 px-4 py-2.5 rounded-[14px] text-sm font-medium font-ui transition-all whitespace-nowrap',
        active
          ? 'bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20'
          : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03] border border-transparent'
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
      {badge !== undefined && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FF5A5A]/15 text-[10px] font-bold text-[#FF5A5A] px-1.5">{badge}</span>
      )}
    </button>
  )
}

// ── Section 1: Patient Context Header ─────────────────────────────────

function PatientContextHeader({ chart, onViewFullRecord, onShare }: {
  chart: PatientChartResponse; onViewFullRecord: () => void; onShare: () => void
}) {
  const p = chart.patient
  const allergies = (chart.allergies ?? []) as Array<{ allergen?: string; severity?: string }>

  return (
    <div className="space-y-3">
      <div className={cn(glassCard, 'p-5')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <InitialsCircle name={p.fullName} size={52} />
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-white font-display">{p.fullName || 'Unknown Patient'}</h2>
                <span className="flex items-center gap-1 rounded-full bg-[#2EE59D]/10 border border-[#2EE59D]/20 px-2.5 py-0.5 text-[10px] font-medium text-[#2EE59D] font-ui">
                  <BadgeCheck className="h-3 w-3" />
                  Verified Patient
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-white/50 font-ui">
                <span>{p.age} years</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>{p.gender}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="font-mono text-white/40">MRN-{p.id?.slice(0, 6).toUpperCase() || '—'}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-[#8FD3D1] font-medium">{p.bloodGroup || '—'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onViewFullRecord} className="flex items-center gap-1.5 rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/70 font-ui hover:bg-white/[0.06] hover:text-white transition-all">
              <Eye className="h-3.5 w-3.5" />
              View Full Record
            </button>
            <button onClick={onShare} className="flex items-center gap-1.5 rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/70 font-ui hover:bg-white/[0.06] hover:text-white transition-all">
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
          </div>
        </div>
      </div>

      {allergies.length > 0 && (
        <div className="rounded-[16px] bg-[#FF5A5A]/8 border border-[#FF5A5A]/15 p-3.5 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#FF5A5A]/15 shrink-0">
            <AlertTriangle className="h-4 w-4 text-[#FF5A5A]" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-[#FF5A5A] font-ui">Active Allergies</p>
            <p className="text-xs text-white/60 font-ui mt-0.5">
              {allergies.map(a => a.allergen).filter(Boolean).join(', ')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Section 2: Clinical Snapshot ──────────────────────────────────────

function ClinicalSnapshot({ chart }: { chart: PatientChartResponse }) {
  const [snapshotTab, setSnapshotTab] = useState<'vitals' | 'labs' | 'care-team'>('vitals')
  const conditions = (chart.conditions ?? []) as Array<{ name?: string; status?: string; diagnosisDate?: string; severity?: string }>
  const medications = (chart.medications ?? []) as Array<{ name?: string; dose?: string; frequency?: string; startDate?: string }>
  const vitals = (chart.vitals ?? []) as Array<{ type?: string; value?: string | number; unit?: string; recordedAt?: string }>

  const latestVitals: Record<string, { value: string | number; unit?: string }> = {}
  for (const v of vitals) {
    if (v.type && !latestVitals[v.type]) {
      latestVitals[v.type] = { value: v.value ?? '—', unit: v.unit }
    }
  }

  return (
    <div className={cn(glassCard, 'p-5')}>
      <h3 className="text-base font-semibold text-white font-display mb-4">Clinical Snapshot</h3>
      <div className="grid grid-cols-[1fr_1fr] gap-4">
        <div className="space-y-3">
          <h4 className="text-[11px] font-semibold text-white/40 font-ui tracking-wider uppercase">Active Problems</h4>
          {conditions.length === 0 ? (
            <p className="text-xs text-white/30 font-ui">No active conditions recorded</p>
          ) : (
            conditions.map((c, i) => (
              <div key={i} className="rounded-[16px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white font-ui">{c.name || 'Unnamed'}</span>
                  {c.severity && (
                    <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border font-ui', priorityColors[severityMap(c.severity)])}>
                      {c.severity}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-white/40 font-ui">
                  <span>{c.status || 'Active'}</span>
                  {c.diagnosisDate && <><span className="w-1 h-1 rounded-full bg-white/20" />{c.diagnosisDate}</>}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="space-y-3">
          <h4 className="text-[11px] font-semibold text-white/40 font-ui tracking-wider uppercase">Current Medications</h4>
          {medications.length === 0 ? (
            <p className="text-xs text-white/30 font-ui">No medications prescribed</p>
          ) : (
            medications.map((m, i) => (
              <div key={i} className="rounded-[16px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3">
                <p className="text-sm font-medium text-white font-ui">{m.name || 'Unnamed'}</p>
                <div className="flex items-center gap-2 text-[11px] text-white/40 font-ui mt-0.5">
                  <span>{m.dose || '—'}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span>{m.frequency || '—'}</span>
                  {m.startDate && <><span className="w-1 h-1 rounded-full bg-white/20" />Since {m.startDate}</>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center gap-1.5 mb-3">
          {(['vitals', 'labs', 'care-team'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSnapshotTab(tab)}
              className={cn(
                'rounded-[10px] px-3 py-1.5 text-[11px] font-medium font-ui transition-all',
                snapshotTab === tab
                  ? 'bg-[#8FD3D1]/10 text-[#8FD3D1]'
                  : 'text-white/40 hover:text-white/70 bg-white/[0.02]'
              )}
            >
              {tab === 'vitals' ? 'Recent Vitals' : tab === 'labs' ? 'Lab Results' : 'Care Team'}
            </button>
          ))}
        </div>

          {snapshotTab === 'vitals' && (
            <div className="grid grid-cols-6 gap-2.5">
              <MetricCard icon={HeartPulse} label="Blood Pressure" value={latestVitals['blood_pressure']?.value || '—'} unit={latestVitals['blood_pressure']?.unit as string} color="#FF5A5A" />
              <MetricCard icon={Activity} label="Heart Rate" value={latestVitals['heart_rate']?.value || '—'} unit="bpm" color="#8FD3D1" />
              <MetricCard icon={Thermometer} label="Temperature" value={latestVitals['temperature']?.value || '—'} unit="°F" color="#FFD84D" />
              <MetricCard icon={Droplets} label="SpO2" value={latestVitals['spo2']?.value || '—'} unit="%" color="#2EE59D" />
              <MetricCard icon={Scale} label="Weight" value={latestVitals['weight']?.value || '—'} unit="kg" color="#8FD3D1" />
              <MetricCard icon={BarChart3} label="BMI" value={latestVitals['bmi']?.value || '—'} color="#8FD3D1" />
            </div>
          )}

          {snapshotTab === 'labs' && (
            <div className="space-y-2">
              {['HbA1c', 'Glucose', 'LDL', 'HDL', 'CBC'].map(lab => (
                <div key={lab} className="flex items-center justify-between rounded-[14px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] px-4 py-2.5">
                  <span className="text-sm text-white/80 font-ui">{lab}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white/50 font-ui">—</span>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-white/[0.05] text-white/40 border border-white/[0.06]">No Data</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {snapshotTab === 'care-team' && (
            <div className="space-y-2">
              <div className="text-xs text-white/40 font-ui text-center py-4">Care team information will load from patient records.</div>
            </div>
          )}
      </div>
    </div>
  )
}

// ── Section 3: SOAP Workspace ─────────────────────────────────────────

function SOAPWorkspace({ patientId, existingNotes, aiSuggestions }: {
  patientId: string; existingNotes: SoapNote[]; aiSuggestions: string[]
}) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'subjective' | 'objective' | 'assessment' | 'plan'>('subjective')
  const [form, setForm] = useState({ subjective: '', objective: '', assessment: '', plan: '' })
  const [showAiSuggestions, setShowAiSuggestions] = useState(true)

  const saveMutation = useMutation({
    mutationFn: (data: typeof form) => api.saveSoapNote(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soap-notes', patientId] })
    },
  })

  const insertSuggestion = (suggestion: string) => {
    setForm(prev => ({ ...prev, [activeTab]: prev[activeTab] + (prev[activeTab] ? '\n' : '') + suggestion }))
  }

  const tabs = [
    { id: 'subjective' as const, label: 'Subjective', desc: 'Chief complaint, history, symptoms' },
    { id: 'objective' as const, label: 'Objective', desc: 'Vitals, physical exam, labs' },
    { id: 'assessment' as const, label: 'Assessment', desc: 'Diagnosis, severity, differential' },
    { id: 'plan' as const, label: 'Plan', desc: 'Treatment, tests, referrals, follow-up' },
  ]

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white font-display">SOAP Notes</h3>
          <p className="text-xs text-white/40 font-ui mt-0.5">Structured clinical documentation</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAiSuggestions(v => !v)} className={cn('flex items-center gap-1.5 rounded-[14px] px-3 py-2 text-xs font-medium font-ui transition-all', showAiSuggestions ? 'bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20' : 'text-white/50 border border-[rgba(255,255,255,0.08)] hover:bg-white/[0.03]')}>
            <Brain className="h-3.5 w-3.5" />
            AI Assist
          </button>
          <button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} className="flex items-center gap-1.5 rounded-[14px] bg-[#8FD3D1] text-[#0B0D10] px-3.5 py-2 text-xs font-semibold font-ui hover:bg-[#8FD3D1]/90 transition-all disabled:opacity-50">
            <Save className="h-3.5 w-3.5" />
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-4 border-b border-[rgba(255,255,255,0.06)] pb-0.5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium font-ui transition-all rounded-t-[10px] border-b-2',
              activeTab === tab.id ? 'text-[#8FD3D1] border-[#8FD3D1]' : 'text-white/40 border-transparent hover:text-white/60'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-4">
        <div className="space-y-3">
          {activeTab && (
            <>
              <p className="text-[11px] text-white/30 font-ui">{tabs.find(t => t.id === activeTab)?.desc}</p>
              <textarea
                value={form[activeTab]}
                onChange={e => setForm(prev => ({ ...prev, [activeTab]: e.target.value }))}
                placeholder={`Enter ${activeTab} notes...`}
                className={cn(glassTextarea, 'min-h-[200px]')}
              />
            </>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.06)]">
            <div className="text-[11px] text-white/30 font-ui">
              {existingNotes.length > 0 ? `Last note: ${new Date(existingNotes[0]?.createdAt ?? '').toLocaleDateString()}` : 'No previous notes'}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => saveMutation.mutate(form)} className="flex items-center gap-1.5 rounded-[14px] bg-[#2EE59D]/10 text-[#2EE59D] border border-[#2EE59D]/20 px-3 py-1.5 text-[11px] font-medium font-ui hover:bg-[#2EE59D]/20 transition-all">
                <Save className="h-3 w-3" />
                Save Note
              </button>
              <button className="flex items-center gap-1.5 rounded-[14px] border border-[rgba(255,255,255,0.08)] text-white/50 px-3 py-1.5 text-[11px] font-medium font-ui hover:text-white/80 transition-all">
                <Eye className="h-3 w-3" />
                Preview
              </button>
            </div>
          </div>
        </div>

        {showAiSuggestions && (
            <div className="overflow-hidden" style={{ width: 280 }}>
              <div className="space-y-2">
                <h4 className="text-[11px] font-semibold text-white/40 font-ui tracking-wider uppercase">AI Suggestions</h4>
                {aiSuggestions.length === 0 ? (
                  <p className="text-xs text-white/30 font-ui">Complete patient data to enable AI suggestions.</p>
                ) : (
                  aiSuggestions.slice(0, 4).map((s, i) => (
                    <div key={i} className="rounded-[14px] bg-[#8FD3D1]/5 border border-[#8FD3D1]/10 p-3">
                      <p className="text-xs text-white/80 font-ui leading-relaxed">{s}</p>
                      <button
                        onClick={() => insertSuggestion(s)}
                        className="mt-2 flex items-center gap-1 text-[10px] font-medium text-[#8FD3D1] font-ui hover:text-[#8FD3D1]/80 transition-all"
                      >
                        <Plus className="h-3 w-3" />
                        Insert Into Note
                      </button>
                    </div>
                  ))
                )}

                <div className="mt-4">
                  <h4 className="text-[11px] font-semibold text-white/40 font-ui tracking-wider uppercase mb-2">Drug Interactions</h4>
                  <div className="rounded-[14px] bg-[#FF5A5A]/5 border border-[#FF5A5A]/15 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertOctagon className="h-3 w-3 text-[#FF5A5A]" />
                      <span className="text-[11px] font-semibold text-[#FF5A5A] font-ui">No interactions detected</span>
                    </div>
                    <p className="text-[10px] text-white/40 font-ui">Current medications show no known conflicts.</p>
                    <button className="mt-1.5 text-[10px] text-[#8FD3D1] font-ui hover:underline">View Details</button>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
    </div>
  )
}

// ── Section 4: AI Clinical Assistant (Sticky Right Panel) ─────────────

function AIClinicalAssistant() {
  const [aiTab, setAiTab] = useState<'alerts' | 'suggestions' | 'predictive'>('alerts')

  const predictions = [
    { label: 'Hospital Readmission', value: '35%', timeframe: 'within 30 days', color: '#FF5A5A', factors: ['Age > 65', 'Prior admission', 'HbA1c > 8'] },
    { label: 'Treatment Success', value: '82%', timeframe: 'within 3 months', color: '#2EE59D', factors: ['Med adherence', 'Early intervention'] },
    { label: 'Disease Progression', value: '28%', timeframe: 'within 6 months', color: '#FFD84D', factors: ['HbA1c trend', 'BP variability'] },
  ]

  return (
    <div className={cn(glassCard, 'p-4 sticky top-4')}>
      <div className="flex items-center gap-2 mb-3">
        <Brain className="h-4 w-4 text-[#8FD3D1]" />
        <h3 className="text-sm font-semibold text-white font-display">AI Clinical Assistant</h3>
      </div>

      <div className="flex items-center gap-1 mb-3 bg-white/[0.02] rounded-[12px] p-0.5">
        {(['alerts', 'suggestions', 'predictive'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setAiTab(tab)}
            className={cn(
              'flex-1 rounded-[10px] px-2.5 py-1.5 text-[10px] font-medium font-ui transition-all text-center',
              aiTab === tab ? 'bg-[#8FD3D1]/10 text-[#8FD3D1]' : 'text-white/40 hover:text-white/60'
            )}
          >
            {tab === 'alerts' ? 'Alerts' : tab === 'suggestions' ? 'Suggestions' : 'Predictive'}
          </button>
        ))}
      </div>

        {aiTab === 'alerts' && (
          <div className="space-y-2">
            <div className="rounded-[16px] bg-[#2EE59D]/8 border border-[#2EE59D]/12 p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#2EE59D]" />
                <span className="text-[11px] font-semibold text-[#2EE59D] font-ui">All Clear</span>
              </div>
              <p className="text-[10px] text-white/50 font-ui">No critical alerts at this time.</p>
            </div>
            <p className="text-[10px] text-white/30 font-ui text-center pt-1">Alerts will appear based on real-time patient data analysis.</p>
          </div>
        )}

        {aiTab === 'suggestions' && (
          <div className="space-y-2">
            {['Consider CBC and thyroid panel based on fatigue symptoms',
              'Lifestyle modification: increase physical activity to 30min/day',
              'Schedule diabetes screening: HbA1c due within 30 days',
              'Cardiology referral recommended for BP management',
            ].map((s, i) => (
              <div key={i} className="rounded-[14px] bg-[#8FD3D1]/5 border border-[#8FD3D1]/10 p-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-3.5 w-3.5 text-[#FFD84D] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-white/80 font-ui leading-relaxed">{s}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-[#8FD3D1] font-medium font-ui cursor-pointer hover:underline">Apply</span>
                      <span className="text-[10px] text-white/30 font-ui">·</span>
                      <span className="text-[10px] text-white/30 font-ui cursor-pointer hover:text-white/50">Learn More</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {aiTab === 'predictive' && (
          <div className="space-y-3">
            {predictions.map((p, i) => (
              <div key={i} className="rounded-[16px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-white/60 font-ui">{p.label}</span>
                  <span className="text-xs font-semibold font-display" style={{ color: p.color }}>{p.value}</span>
                </div>
                <div className="relative h-1.5 rounded-full bg-white/[0.06] mb-2">
                  <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: p.value, backgroundColor: p.color }} />
                </div>
                <p className="text-[10px] text-white/40 font-ui mb-1">{p.timeframe}</p>
                <div className="flex flex-wrap gap-1">
                  {p.factors.map((f, j) => (
                    <span key={j} className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[9px] text-white/40 font-ui">{f}</span>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-[10px] text-white/30 font-ui text-center pt-1">AI-powered predictive analysis. Clinical judgment required.</p>
          </div>
        )}
    </div>
  )
}

// ── Section 5: Diagnosis Tools ────────────────────────────────────────

function DiagnosisTools() {
  const [diagTab, setDiagTab] = useState<'checker' | 'differential' | 'guidelines' | 'treatment'>('checker')
  const [symptomSearch, setSymptomSearch] = useState('')
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [guidelineQuery, setGuidelineQuery] = useState('')

  const commonSymptoms = ['Fever', 'Headache', 'Fatigue', 'Chest Pain', 'Cough', 'Dizziness', 'Nausea', 'Shortness of Breath', 'Joint Pain', 'Abdominal Pain']

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white font-display">Diagnosis Tools</h3>
        <button className="flex items-center gap-1.5 rounded-[14px] bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20 px-3.5 py-2 text-xs font-medium font-ui hover:bg-[#8FD3D1]/20 transition-all">
          <FileText className="h-3.5 w-3.5" />
          Generate Report
        </button>
      </div>

      <div className="flex items-center gap-1 mb-4 border-b border-[rgba(255,255,255,0.06)] pb-0.5">
        {(['checker', 'differential', 'guidelines', 'treatment'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setDiagTab(tab)}
            className={cn(
              'px-3.5 py-2.5 text-xs font-medium font-ui transition-all rounded-t-[10px] border-b-2',
              diagTab === tab ? 'text-[#8FD3D1] border-[#8FD3D1]' : 'text-white/40 border-transparent hover:text-white/60'
            )}
          >
            {tab === 'checker' ? 'Symptom Checker' : tab === 'differential' ? 'Differential Dx' : tab === 'guidelines' ? 'Guidelines' : 'Treatment'}
          </button>
        ))}
      </div>

        {diagTab === 'checker' && (
          <div>
            <input
              value={symptomSearch}
              onChange={e => setSymptomSearch(e.target.value)}
              placeholder="Search symptoms..."
              className={cn(glassInput, 'mb-3')}
            />
            <div className="flex flex-wrap gap-1.5">
              {commonSymptoms
                .filter(s => !symptomSearch || s.toLowerCase().includes(symptomSearch.toLowerCase()))
                .map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className={cn(
                      'rounded-[10px] px-3 py-1.5 text-[11px] font-medium font-ui transition-all border',
                      selectedSymptoms.includes(s)
                        ? 'bg-[#8FD3D1]/15 text-[#8FD3D1] border-[#8FD3D1]/25'
                        : 'bg-white/[0.02] text-white/50 border-[rgba(255,255,255,0.06)] hover:bg-white/[0.04] hover:text-white/70'
                    )}
                  >
                    {s}
                  </button>
                ))}
            </div>
            {selectedSymptoms.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-white/50 font-ui">Selected Symptoms ({selectedSymptoms.length})</span>
                  <button onClick={() => setSelectedSymptoms([])} className="text-[10px] text-[#8FD3D1] font-ui hover:underline">Clear all</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSymptoms.map(s => (
                    <span key={s} className="flex items-center gap-1 rounded-[8px] bg-[#8FD3D1]/10 text-[#8FD3D1] px-2 py-1 text-[10px] font-medium font-ui">
                      {s}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => toggleSymptom(s)} />
                    </span>
                  ))}
                </div>
                <button className="mt-3 flex items-center gap-1.5 rounded-[14px] bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20 px-3.5 py-2 text-xs font-medium font-ui hover:bg-[#8FD3D1]/20 transition-all">
                  <Microscope className="h-3.5 w-3.5" />
                  Analyze Symptoms
                </button>
              </div>
            )}
            </div>
        )}

        {diagTab === 'differential' && (
          <div className="space-y-2">
            {selectedSymptoms.length === 0 ? (
              <p className="text-xs text-white/30 font-ui text-center py-6">Select symptoms in the Symptom Checker tab to generate differential diagnoses.</p>
            ) : (
              [
                { condition: 'Hypothyroidism', confidence: 87, evidence: ['Fatigue', 'Weight gain', 'Cold intolerance'] },
                { condition: 'Viral Infection', confidence: 74, evidence: ['Fatigue', 'Mild fever', 'Cough'] },
                { condition: 'Anemia', confidence: 68, evidence: ['Fatigue', 'Pallor', 'Shortness of breath'] },
              ].map((d, i) => (
                <div key={i} className="rounded-[14px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white font-ui">{d.condition}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-xs font-semibold font-display', d.confidence >= 80 ? 'text-[#2EE59D]' : d.confidence >= 60 ? 'text-[#FFD84D]' : 'text-[#FF5A5A]')}>{d.confidence}%</span>
                      <div className="w-16 h-1.5 rounded-full bg-white/[0.06]">
                        <div className={cn('h-1.5 rounded-full', d.confidence >= 80 ? 'bg-[#2EE59D]' : d.confidence >= 60 ? 'bg-[#FFD84D]' : 'bg-[#FF5A5A]')} style={{ width: `${d.confidence}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {d.evidence.map((e, j) => (
                      <span key={j} className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[9px] text-white/40 font-ui">{e}</span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {diagTab === 'guidelines' && (
          <div className="space-y-3">
            <input
              value={guidelineQuery}
              onChange={e => setGuidelineQuery(e.target.value)}
              placeholder="Search guidelines (e.g., diabetes, hypertension)..."
              className={cn(glassInput, 'mb-2')}
            />
            <div className="flex items-center gap-2 text-[10px] text-white/30 font-ui">
              <span>Sources:</span>
              {['WHO', 'NICE', 'CDC', 'ICMR'].map(src => (
                <span key={src} className="rounded-[6px] bg-white/[0.04] px-2 py-0.5 text-white/40 font-ui">{src}</span>
              ))}
            </div>
            <div className="text-xs text-white/30 font-ui text-center py-4">Enter a query to retrieve relevant clinical guidelines.</div>
          </div>
        )}

        {diagTab === 'treatment' && (
          <div className="space-y-3">
            {[
              { type: 'Medication Options', items: ['ACE Inhibitors', 'Beta Blockers', 'Calcium Channel Blockers'] },
              { type: 'Lifestyle Interventions', items: ['Dietary modification', 'Exercise 30 min/day', 'Stress management'] },
              { type: 'Monitoring Plan', items: ['Weekly BP monitoring', 'Monthly HbA1c', 'Quarterly lipid panel'] },
            ].map((section, i) => (
              <div key={i} className="rounded-[14px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3">
                <h5 className="text-xs font-semibold text-white/60 font-ui mb-2">{section.type}</h5>
                <div className="space-y-1.5">
                  {section.items.map((item, j) => (
                    <div key={j} className="flex items-center gap-2 text-[11px] text-white/70 font-ui">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#8FD3D1]/50" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}

// ── Section 6: Rx Prescription Tab ────────────────────────────────────

function RxPrescriptionTab({ patientId, patientName }: { patientId: string; patientName: string }) {
  const [medRows, setMedRows] = useState<Array<{ name: string; dose: string; frequency: string; duration: string; instructions: string }>>([
    { name: '', dose: '', frequency: '', duration: '', instructions: '' },
  ])

  const addRow = () => setMedRows(prev => [...prev, { name: '', dose: '', frequency: '', duration: '', instructions: '' }])
  const removeRow = (idx: number) => setMedRows(prev => prev.filter((_, i) => i !== idx))
  const updateRow = (idx: number, field: string, value: string) => {
    setMedRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))
  }

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white font-display">Rx Prescription</h3>
          <p className="text-xs text-white/40 font-ui mt-0.5">Issue prescription for {patientName}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={addRow} className="flex items-center gap-1.5 rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/70 font-ui hover:bg-white/[0.06] hover:text-white transition-all">
            <Plus className="h-3.5 w-3.5" />
            Add Medication
          </button>
          <button className="flex items-center gap-1.5 rounded-[14px] bg-[#2EE59D] text-[#0B0D10] px-3.5 py-2 text-xs font-semibold font-ui hover:bg-[#2EE59D]/90 transition-all">
            <Save className="h-3.5 w-3.5" />
            Issue Prescription
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr_40px] gap-2 px-1">
          {['Medication', 'Dose', 'Frequency', 'Duration', 'Instructions', ''].map(h => (
            <span key={h} className="text-[10px] font-semibold text-white/30 font-ui tracking-wider uppercase">{h}</span>
          ))}
        </div>
        {medRows.map((row, i) => (
          <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr_40px] gap-2 items-center">
            <input value={row.name} onChange={e => updateRow(i, 'name', e.target.value)} placeholder="Drug name" className={glassInput} />
            <input value={row.dose} onChange={e => updateRow(i, 'dose', e.target.value)} placeholder="e.g., 500mg" className={glassInput} />
            <input value={row.frequency} onChange={e => updateRow(i, 'frequency', e.target.value)} placeholder="e.g., BID" className={glassInput} />
            <input value={row.duration} onChange={e => updateRow(i, 'duration', e.target.value)} placeholder="e.g., 7 days" className={glassInput} />
            <input value={row.instructions} onChange={e => updateRow(i, 'instructions', e.target.value)} placeholder="After meals" className={glassInput} />
            <button onClick={() => removeRow(i)} disabled={medRows.length === 1} className="flex h-9 w-9 items-center justify-center rounded-[10px] text-white/30 hover:text-[#FF5A5A] hover:bg-[#FF5A5A]/10 transition-all disabled:opacity-20">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-medium text-white/40 font-ui mb-1.5 block">Diagnosis</label>
            <input placeholder="Diagnosis summary" className={glassInput} />
          </div>
          <div>
            <label className="text-[11px] font-medium text-white/40 font-ui mb-1.5 block">Additional Instructions</label>
            <input placeholder="e.g., Take with food" className={glassInput} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Section 7: Report Generator ───────────────────────────────────────

function ReportGenerator() {
  const [selectedSections, setSelectedSections] = useState([
    'Patient Summary', 'SOAP Notes', 'Diagnosis', 'Lab Results',
    'Medications', 'AI Recommendations', 'Treatment Plan', 'Follow-Up Instructions',
  ])

  const toggleSection = (s: string) => {
    setSelectedSections(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const exportOptions = [
    { icon: Share2, label: 'Share With Patient', color: '#8FD3D1' },
    { icon: Users, label: 'Share With Staff', color: '#8FD3D1' },
    { icon: Save, label: 'Save To EMR', color: '#2EE59D' },
    { icon: Download, label: 'Export PDF', color: '#2EE59D' },
    { icon: Fingerprint, label: 'Send To WyshID', color: '#8FD3D1' },
    { icon: Activity, label: 'Send To Health Timeline', color: '#8FD3D1' },
  ]

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-white font-display">Clinical Report Generator</h3>
          <p className="text-xs text-white/40 font-ui mt-0.5">Automatically compile and export comprehensive clinical reports</p>
        </div>
        <button className="flex items-center gap-2 rounded-[14px] bg-[#2EE59D] text-[#0B0D10] px-5 py-2.5 text-sm font-semibold font-ui hover:bg-[#2EE59D]/90 transition-all shadow-lg shadow-[#2EE59D]/20">
          <FileText className="h-4 w-4" />
          Generate Clinical Report
        </button>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-5">
        <div>
          <h4 className="text-[11px] font-semibold text-white/40 font-ui tracking-wider uppercase mb-3">Report Contents</h4>
          <div className="flex flex-wrap gap-1.5">
            {['Patient Summary', 'SOAP Notes', 'Diagnosis', 'Lab Results', 'Medications', 'AI Recommendations', 'Treatment Plan', 'Follow-Up Instructions'].map(s => (
              <button
                key={s}
                onClick={() => toggleSection(s)}
                className={cn(
                  'rounded-[10px] px-3 py-1.5 text-[11px] font-medium font-ui transition-all border',
                  selectedSections.includes(s)
                    ? 'bg-[#8FD3D1]/15 text-[#8FD3D1] border-[#8FD3D1]/25'
                    : 'bg-white/[0.02] text-white/40 border-[rgba(255,255,255,0.06)] hover:bg-white/[0.04] hover:text-white/60'
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-white/30 font-ui mt-3">{selectedSections.length} sections selected</p>
        </div>
        <div>
          <h4 className="text-[11px] font-semibold text-white/40 font-ui tracking-wider uppercase mb-3">Export Options</h4>
          <div className="grid grid-cols-2 gap-2">
            {exportOptions.map((opt, i) => (
              <button
                key={i}
                className="flex items-center gap-2 rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02] px-3.5 py-2.5 text-xs text-white/70 font-ui hover:bg-white/[0.04] hover:text-white transition-all"
              >
                <opt.icon className="h-3.5 w-3.5" style={{ color: opt.color }} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────

export default function WyshCareDoctorDashboard() {
  const { user } = useSessionStore()
  const [activeTab, setActiveTab] = useState<'snapshot' | 'soap' | 'diagnosis' | 'rx' | 'reports'>('snapshot')
  const [selectedPatientId] = useState<string | null>(null)

  const patientId = selectedPatientId || 'current'
  const patientName = 'Rajesh Kumar'

  const { data: chart } = useQuery({
    queryKey: ['patient-chart', patientId],
    queryFn: () => api.getPatientChart(patientId),
    enabled: !!patientId,
  })

  const { data: soapNotes } = useQuery({
    queryKey: ['soap-notes', patientId],
    queryFn: () => api.getSoapNotes(patientId),
    enabled: !!patientId,
  })

  const chartData = chart ?? emptyChart

  const aiSuggestions = useMemo(() => {
    if (!chart) return []
    const suggestions: string[] = []
    const conditions = (chart.conditions ?? []) as Array<{ name?: string }>
    const meds = (chart.medications ?? []) as Array<{ name?: string }>

    if (conditions.some(c => c.name?.toLowerCase().includes('diabetes'))) {
      suggestions.push('Based on diabetes history, consider HbA1c and fasting glucose monitoring.')
    }
    if (conditions.some(c => c.name?.toLowerCase().includes('hypertension'))) {
      suggestions.push('Monitor BP regularly. Consider ACE inhibitors or ARBs for hypertension management.')
    }
    if (meds.length > 2) {
      suggestions.push('Multiple medications detected. Review for potential drug interactions.')
    }
    if (!suggestions.length) {
      suggestions.push('Based on symptoms, consider CBC and thyroid panel to rule out underlying conditions.')
    }
    return suggestions
  }, [chart])

  const tabs = [
    { id: 'snapshot' as const, label: 'Clinical Snapshot', icon: HeartPulse },
    { id: 'soap' as const, label: 'SOAP Notes', icon: ClipboardList },
    { id: 'diagnosis' as const, label: 'Diagnosis Tools', icon: Microscope },
    { id: 'rx' as const, label: 'Rx Prescription', icon: Pill },
    { id: 'reports' as const, label: 'Reports', icon: FileText },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0D10' }}>
      <div className="mx-auto" style={{ maxWidth: 1600 }}>
        <div className="grid grid-cols-[1fr_380px] gap-5 p-6" style={{ alignItems: 'start' }}>
          <div className="space-y-5">
            <PatientContextHeader
              chart={chartData}
              onViewFullRecord={() => {}}
              onShare={() => {}}
            />

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {tabs.map(tab => (
                <TabButton
                  key={tab.id}
                  active={activeTab === tab.id}
                  label={tab.label}
                  icon={tab.icon}
                  onClick={() => setActiveTab(tab.id)}
                  badge={tab.id === 'rx' ? 1 : undefined}
                />
              ))}
            </div>

            {activeTab === 'snapshot' && <ClinicalSnapshot chart={chartData} />}
            {activeTab === 'soap' && <SOAPWorkspace patientId={patientId} existingNotes={soapNotes ?? []} aiSuggestions={aiSuggestions} />}
            {activeTab === 'diagnosis' && <DiagnosisTools />}
            {activeTab === 'rx' && <RxPrescriptionTab patientId={patientId} patientName={patientName} />}
            {activeTab === 'reports' && <ReportGenerator />}
          </div>

          <div className="relative">
            <div className="sticky" style={{ top: 16 }}>
              <AIClinicalAssistant />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
