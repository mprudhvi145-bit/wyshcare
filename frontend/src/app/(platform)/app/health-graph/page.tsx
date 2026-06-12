/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(platform)/app/health-graph/page.tsx
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
 *
 * Dependencies:
 - react
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

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, Pill, AlertTriangle, TrendingUp, Brain, Lightbulb, ChevronRight,
  Sparkles, Calendar, Activity, Droplets, Eye, ArrowRight,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';
const glassCardCompact = 'rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02]';

const bpData = [
  { month: 'Jan', systolic: 138, diastolic: 88 },
  { month: 'Feb', systolic: 135, diastolic: 85 },
  { month: 'Mar', systolic: 132, diastolic: 84 },
  { month: 'Apr', systolic: 128, diastolic: 82 },
  { month: 'May', systolic: 130, diastolic: 84 },
  { month: 'Jun', systolic: 126, diastolic: 80 },
];

const cholesterolData = [
  { month: 'Jan', ldl: 145, hdl: 42 },
  { month: 'Feb', ldl: 140, hdl: 43 },
  { month: 'Mar', ldl: 138, hdl: 44 },
  { month: 'Apr', ldl: 135, hdl: 45 },
  { month: 'May', ldl: 132, hdl: 46 },
  { month: 'Jun', ldl: 130, hdl: 45 },
];

const conditions = [
  { name: 'Hypertension', status: 'Managed', risk: 'Low', trend: 'Improving' },
  { name: 'High Cholesterol', status: 'Monitoring', risk: 'Moderate', trend: 'Improving' },
];

const medications = [
  { name: 'Telmisartan 40mg', adherence: 85, purpose: 'BP control' },
  { name: 'Aspirin 75mg', adherence: 90, purpose: 'Preventive' },
];

const risks = [
  { factor: 'Cardiovascular (10yr)', percentage: 8, level: 'Low' },
  { factor: 'Diabetes (5yr)', percentage: 12, level: 'Moderate' },
];

const allergies = [
  { name: 'Penicillin', severity: 'Severe', reaction: 'Rash, difficulty breathing' },
  { name: 'Pollen', severity: 'Mild', reaction: 'Sneezing, watery eyes' },
];

const insights = [
  { icon: Lightbulb, text: 'Your BP has improved 8% over the last 6 months. Continue current medication.', color: '#2EE59D' },
  { icon: AlertTriangle, text: 'LDL cholesterol remains borderline high (130 mg/dL). Consider dietary changes.', color: '#FFD84D' },
  { icon: Sparkles, text: 'Based on your profile, a cardiac stress test is recommended this quarter.', color: '#8FD3D1' },
];

const preventiveCare = [
  { name: 'Annual Physical', due: 'Jul 2026', status: 'Scheduled' },
  { name: 'Lipid Profile', due: 'Aug 2026', status: 'Pending' },
  { name: 'ECG', due: 'Sep 2026', status: 'Overdue' },
  { name: 'Eye Exam', due: 'Oct 2026', status: 'Pending' },
];

const statusColors: Record<string, string> = {
  Scheduled: '#2EE59D', Pending: '#FFD84D', Overdue: '#FF5A5A',
};

type ChartView = 'bp' | 'cholesterol';

function TabButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-[11px] font-medium font-ui rounded-[10px] transition-all ${
        active ? 'bg-[#8FD3D1]/10 text-[#8FD3D1]' : 'text-white/40 hover:text-white/60'
      }`}
    >
      {label}
    </button>
  );
}

export default function HealthGraphPage() {
  const [chartView, setChartView] = useState<ChartView>('bp');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0D10' }}>
      <div className="mx-auto" style={{ maxWidth: 1600 }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,0.06)]">
          <div>
            <h1 className="text-xl font-bold text-white font-display">Health Graph</h1>
            <p className="text-sm text-white/40 font-ui mt-0.5">Your personal health twin — powered by AI</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={glassCard + ' lg:col-span-2'}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white font-display">Health Trends</h3>
                  <div className="flex items-center rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-white/[0.02] p-0.5">
                    <TabButton active={chartView === 'bp'} label="Blood Pressure" onClick={() => setChartView('bp')} />
                    <TabButton active={chartView === 'cholesterol'} label="Cholesterol" onClick={() => setChartView('cholesterol')} />
                  </div>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartView === 'bp' ? (
                      <LineChart data={bpData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} domain={[60, 160]} />
                        <Tooltip contentStyle={{ backgroundColor: '#1C2025', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, color: '#fff' }} />
                        <Line type="monotone" dataKey="systolic" stroke="#8FD3D1" strokeWidth={2} dot={{ fill: '#8FD3D1' }} name="Systolic" />
                        <Line type="monotone" dataKey="diastolic" stroke="#2EE59D" strokeWidth={2} dot={{ fill: '#2EE59D' }} name="Diastolic" />
                      </LineChart>
                    ) : (
                      <AreaChart data={cholesterolData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#1C2025', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, color: '#fff' }} />
                        <Area type="monotone" dataKey="ldl" stroke="#FF5A5A" fill="#FF5A5A" fillOpacity={0.1} name="LDL" />
                        <Area type="monotone" dataKey="hdl" stroke="#2EE59D" fill="#2EE59D" fillOpacity={0.1} name="HDL" />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className={glassCard}
              >
                <div className="p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-display mb-3">
                    <Brain className="h-4 w-4 text-[#8FD3D1]" />
                    AI Insights
                  </h3>
                  <div className="space-y-3">
                    {insights.map((insight, i) => (
                      <div key={i} className="rounded-[14px] p-3" style={{ backgroundColor: `${insight.color}10`, border: `1px solid ${insight.color}20` }}>
                        <div className="flex gap-2">
                          <insight.icon className="h-4 w-4 mt-0.5 shrink-0" style={{ color: insight.color }} />
                          <p className="text-xs text-white/60 font-ui">{insight.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={glassCard}
              >
                <div className="p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-display mb-3">
                    <TrendingUp className="h-4 w-4 text-[#8FD3D1]" />
                    Risk Assessment
                  </h3>
                  <div className="space-y-3">
                    {risks.map((risk, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-white/60 font-ui">{risk.factor}</span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full font-ui ${
                            risk.level === 'Low' ? 'text-[#2EE59D] bg-[#2EE59D]/10 border border-[#2EE59D]/20' : 'text-[#FFD84D] bg-[#FFD84D]/10 border border-[#FFD84D]/20'
                          }`}>{risk.level}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full bg-[#8FD3D1] transition-all" style={{ width: `${risk.percentage}%` }} />
                        </div>
                        <p className="text-[10px] text-white/30 font-ui mt-0.5">{risk.percentage}% risk score</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Heart, color: '#FF5A5A', title: 'Conditions', items: conditions, render: (c: any) => (
                <div key={c.name} className={glassCardCompact + ' p-3'}>
                  <p className="text-sm font-medium text-white font-ui">{c.name}</p>
                  <div className="flex gap-1.5 mt-1.5">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full font-ui ${
                      c.risk === 'Low' ? 'text-[#2EE59D] bg-[#2EE59D]/10 border border-[#2EE59D]/20' : 'text-[#FFD84D] bg-[#FFD84D]/10 border border-[#FFD84D]/20'
                    }`}>{c.risk} Risk</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full font-ui text-white/40 bg-white/[0.04] border border-white/[0.06]">{c.status}</span>
                  </div>
                </div>
              )},
              { icon: Pill, color: '#2EE59D', title: 'Medications', items: medications, render: (m: any) => (
                <div key={m.name} className={glassCardCompact + ' p-3'}>
                  <p className="text-sm font-medium text-white font-ui">{m.name}</p>
                  <p className="text-[11px] text-white/40 font-ui">{m.purpose}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full bg-[#2EE59D]" style={{ width: `${m.adherence}%` }} />
                    </div>
                    <span className="text-[10px] text-white/40 font-ui">{m.adherence}%</span>
                  </div>
                </div>
              )},
              { icon: AlertTriangle, color: '#FFD84D', title: 'Allergies', items: allergies, render: (a: any) => (
                <div key={a.name} className={glassCardCompact + ' p-3'}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-white font-ui">{a.name}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full font-ui ${
                      a.severity === 'Severe' ? 'text-[#FF5A5A] bg-[#FF5A5A]/10 border border-[#FF5A5A]/20' : 'text-[#FFD84D] bg-[#FFD84D]/10 border border-[#FFD84D]/20'
                    }`}>{a.severity}</span>
                  </div>
                  <p className="text-[11px] text-white/40 font-ui">{a.reaction}</p>
                </div>
              )},
              { icon: Calendar, color: '#8FD3D1', title: 'Preventive Care', items: preventiveCare, render: (item: any) => (
                <div key={item.name} className={glassCardCompact + ' p-3 flex items-center justify-between'}>
                  <div>
                    <p className="text-xs font-medium text-white font-ui">{item.name}</p>
                    <p className="text-[10px] text-white/30 font-ui">Due: {item.due}</p>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full font-ui"
                    style={{ color: statusColors[item.status] || '#fff', backgroundColor: `${statusColors[item.status] || 'rgba(255,255,255,0.04)'}15`, border: `1px solid ${statusColors[item.status] || 'rgba(255,255,255,0.06)'}25` }}
                  >{item.status}</span>
                </div>
              )},
            ].map((section, si) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: si * 0.05 }}
                className={glassCard}
              >
                <div className="p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-display mb-3">
                    <section.icon className="h-4 w-4" style={{ color: section.color }} />
                    {section.title}
                  </h3>
                  <div className="space-y-2">
                    {section.items.map((item: any) => section.render(item))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={glassCard + ' border-[#8FD3D1]/15'}
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#8FD3D1]/10">
                    <Sparkles className="h-5 w-5 text-[#8FD3D1]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white font-display">AI Care Navigator</p>
                    <p className="text-xs text-white/40 font-ui mt-1">Get personalized health recommendations and ask questions about your health data.</p>
                  </div>
                </div>
                <button
                  className="flex items-center gap-1.5 rounded-[12px] bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20 px-4 py-2 text-xs font-medium font-ui hover:bg-[#8FD3D1]/20 transition-all shrink-0"
                  onClick={() => window.location.href = '/app/ai-navigator'}
                >
                  Open Navigator
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
