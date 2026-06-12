/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(platform)/app/timeline/page.tsx
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
 - use-health-data
 - event-card
 - react-query
 - insights-panel
 - react
 - left-rail
 - utils
 - ai-insight-card
 *
 * Dependencies:
 - use-health-data
 - event-card
 - react-query
 - insights-panel
 - react
 - left-rail
 - utils
 - ai-insight-card
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

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useHealthScore, useRiskPredictions } from '@/hooks/use-health-data';
import { AlertTriangle, Calendar, RefreshCw, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

import { LeftRail } from '@/components/timeline/left-rail';
import { HeroSection } from '@/components/timeline/hero-section';
import { EventCard } from '@/components/timeline/event-card';
import { AiInsightCard } from '@/components/timeline/ai-insight-card';
import { MilestoneCard } from '@/components/timeline/milestone-card';
import { InsightsPanel } from '@/components/timeline/insights-panel';
import { SearchBar } from '@/components/timeline/search-bar';
import type {
  EnrichedEvent, TimelineEventType, HealthMilestone,
  TrendDataPoint, RiskCategory, ScoreHistoryPoint,
} from '@/components/timeline/types';
import type { TimelineEvent } from '@/types';

const easing = [0.16, 1, 0.3, 1] as const;

function enrichEvent(event: TimelineEvent): EnrichedEvent {
  const e = { ...event, metadata: event.metadata ?? {} } as EnrichedEvent;
  const m = event.metadata ?? {};
  switch (event.type) {
    case 'CONSULTATION': {
      const r = m as Record<string, unknown>;
      e.consultation = {
        doctor: String(r.doctor ?? ''), specialty: String(r.specialty ?? ''),
        reason: String(r.reason ?? ''), outcome: String(r.outcome ?? ''),
        recommendation: String(r.recommendation ?? ''),
      };
      break;
    }
    case 'LAB': {
      const r = m as Record<string, unknown>;
      e.lab = {
        test: String(r.test ?? ''), value: String(r.value ?? ''), unit: String(r.unit ?? ''),
        status: (r.status as any) ?? 'normal', previousValue: String(r.previousValue ?? ''),
        trend: (r.trend as any) ?? 'stable', referenceRange: String(r.referenceRange ?? ''),
        isAbnormal: r.status !== 'normal',
      };
      break;
    }
    case 'PRESCRIPTION': {
      const r = m as Record<string, unknown>;
      e.prescription = {
        drug: String(r.drug ?? ''), dosage: String(r.dosage ?? ''),
        adherence: Number(r.adherence ?? 0), daysRemaining: Number(r.daysRemaining ?? 0),
        totalDays: Number(r.totalDays ?? 0), duration: String(r.duration ?? ''),
      };
      break;
    }
    case 'IMAGING': {
      const r = m as Record<string, unknown>;
      e.imaging = {
        study: String(r.study ?? ''), finding: String(r.finding ?? 'Normal'),
        bodyPart: String(r.bodyPart ?? ''), result: String(r.result ?? ''),
        radiologistNotes: String(r.radiologistNotes ?? ''),
      };
      break;
    }
    case 'SURGERY': {
      const r = m as Record<string, unknown>;
      e.surgery = {
        procedure: String(r.procedure ?? ''), hospital: String(r.hospital ?? ''),
        outcome: String(r.outcome ?? ''), recovery: String(r.recovery ?? ''),
        date: String(r.date ?? event.occurredAt),
      };
      break;
    }
    case 'EMERGENCY': {
      const r = m as Record<string, unknown>;
      e.emergency = {
        reason: String(r.reason ?? ''), severity: (r.severity as any) ?? 'moderate',
        resolution: String(r.resolution ?? ''),
      };
      break;
    }
    case 'VACCINATION': {
      const r = m as Record<string, unknown>;
      e.vaccination = {
        vaccine: String(r.vaccine ?? ''), dose: Number(r.dose ?? 1),
        batch: String(r.batch ?? ''), administeredAt: String(r.administeredAt ?? event.occurredAt),
        nextDue: String(r.nextDue ?? ''),
      };
      break;
    }
  }
  return e;
}

const quickFilters: { key: 'all' | TimelineEventType; label: string }[] = [
  { key: 'all', label: 'All Events' },
  { key: 'CONSULTATION', label: 'Consultations' },
  { key: 'LAB', label: 'Labs' },
  { key: 'PRESCRIPTION', label: 'Prescriptions' },
  { key: 'IMAGING', label: 'Imaging' },
  { key: 'EMERGENCY', label: 'Emergencies' },
];

// ── Mock enrichments for development (API may not return full metadata) ──
function getMockEnrichment(event: TimelineEvent): Record<string, unknown> {
  const idx = event.id.charCodeAt(event.id.length - 1) || 1;
  const types: TimelineEventType[] = ['CONSULTATION', 'LAB', 'PRESCRIPTION', 'IMAGING', 'SURGERY', 'EMERGENCY', 'VACCINATION'];
  const type = types[idx % types.length]!;
  const monthsAgo = (idx % 24) + 1;
  const baseDate = new Date();
  baseDate.setMonth(baseDate.getMonth() - monthsAgo);

  const mocks: Record<string, Record<string, unknown>> = {
    CONSULTATION: {
      doctor: ['Dr. Rajesh Kumar', 'Dr. Sneha Patel', 'Dr. Ananya Verma', 'Dr. Vikram Singh'][idx % 4],
      specialty: ['General Physician', 'Cardiology', 'Dermatology', 'Orthopedics'][idx % 4],
      reason: ['Annual checkup', 'Chest pain follow-up', 'Skin rash consultation', 'Joint pain'][idx % 4],
      outcome: ['Prescribed medication', 'Referred to specialist', 'Condition resolved', 'Monitoring recommended'][idx % 4],
      recommendation: 'Follow up in 3 months. Maintain current medication schedule.',
    },
    LAB: {
      test: ['Complete Blood Count', 'Lipid Profile', 'Vitamin D', 'HbA1c', 'Thyroid Panel'][idx % 5],
      value: ['142', '210', '28', '5.7', '3.2'][idx % 5],
      unit: ['g/L', 'mg/dL', 'ng/mL', '%', 'mIU/L'][idx % 5],
      status: (['normal', 'high', 'low', 'normal', 'normal'] as const)[idx % 5],
      previousValue: ['138', '195', '32', '5.9', '3.0'][idx % 5],
      trend: (['up', 'up', 'down', 'down', 'stable'] as const)[idx % 5],
      referenceRange: '135–175 g/L',
    },
    PRESCRIPTION: {
      drug: ['Vitamin D3', 'Metformin', 'Amlodipine', 'Atorvastatin', 'Thyroxine'][idx % 5],
      dosage: ['60K IU weekly', '500 mg twice daily', '5 mg daily', '10 mg daily', '50 mcg daily'][idx % 5],
      adherence: [90, 85, 78, 95, 88][idx % 5],
      daysRemaining: [45, 0, 15, 30, 60][idx % 5],
      totalDays: [90, 30, 90, 90, 180][idx % 5],
      duration: '12 weeks',
    },
    IMAGING: {
      study: ['Chest X-Ray', 'MRI Knee', 'CT Abdomen', 'Ultrasound', 'Mammogram'][idx % 5],
      finding: (['Normal', 'Abnormal', 'Normal', 'Normal', 'Abnormal'] as const)[idx % 5],
      bodyPart: ['Chest', 'Right Knee', 'Abdomen', 'Upper Abdomen', 'Left Breast'][idx % 5],
      result: 'No significant abnormalities detected.',
      radiologistNotes: 'Comparison with prior study shows stable findings.',
    },
    SURGERY: {
      procedure: ['Laparoscopic Appendectomy', 'Cataract Surgery', 'Knee Replacement', 'Hernia Repair'][idx % 4],
      hospital: ['Apollo Hospitals', 'Fortis Healthcare', 'Max Hospital', 'Medanta'][idx % 4],
      outcome: ['Successful', 'Successful', 'Recovering', 'Successful'][idx % 4],
      recovery: '6 weeks',
      date: baseDate.toISOString(),
    },
    EMERGENCY: {
      reason: ['Chest pain', 'High fever', 'Allergic reaction', 'Injury from fall'][idx % 4],
      severity: (['moderate', 'high', 'low', 'critical'] as const)[idx % 4],
      resolution: 'Stabilized and discharged after observation.',
    },
    VACCINATION: {
      vaccine: ['Influenza', 'COVID-19 Booster', 'Hepatitis B', 'Tetanus'][idx % 4],
      dose: [1, 3, 2, 1][idx % 4],
      batch: ['FL-2025-01', 'COV-2025-B3', 'HEP-2024-02', 'TET-2025-01'][idx % 4],
      administeredAt: baseDate.toISOString(),
      nextDue: new Date(baseDate.getTime() + 365 * 86400000).toISOString(),
    },
  };
  return mocks[type] ?? {};
}

// ── AI Insights to inject chronologically ──
const AI_INSIGHTS: { title: string; details: string }[] = [
  { title: 'Blood Pressure Improvement', details: 'Average systolic pressure reduced by 12% over 8 months.' },
  { title: 'Vitamin D Normalized', details: 'Levels returned to optimal range after 12-week supplementation.' },
  { title: 'Cholesterol Trend Identified', details: 'LDL showing consistent reduction with current statin therapy.' },
  { title: 'Sleep Quality Improved', details: 'Restful sleep increased by 22% since lifestyle changes.' },
];

// ── Milestones ──
const MILESTONES: HealthMilestone[] = [
  { id: 'ms-1', title: '100 Days Medication Adherence', description: 'Perfect adherence to prescribed medications', achievedAt: new Date(Date.now() - 45 * 86400000).toISOString(), icon: 'check', category: 'adherence' },
  { id: 'ms-2', title: 'Weight Goal Achieved', description: 'Reached target weight of 65 kg', achievedAt: new Date(Date.now() - 90 * 86400000).toISOString(), icon: 'star', category: 'weight' },
  { id: 'ms-3', title: 'Hypertension Under Control', description: 'BP consistently below 130/80 for 3 months', achievedAt: new Date(Date.now() - 30 * 86400000).toISOString(), icon: 'heart', category: 'condition' },
  { id: 'ms-4', title: '1 Year Without Emergency Visits', description: 'No emergency room visits in the past year', achievedAt: new Date(Date.now() - 365 * 86400000).toISOString(), icon: 'shield', category: 'safety' },
];

export default function TimelinePage() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'life'>('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | TimelineEventType>('all');

  const { data: timelineData, isLoading, isError, refetch } = useQuery({
    queryKey: ['timeline'],
    queryFn: () => api.getTimeline(),
    refetchInterval: 60000,
  });

  const { data: healthScore } = useHealthScore();
  const { data: riskPredictions } = useRiskPredictions();

  // Enrich events
  const enrichedEvents = useMemo(() => {
    const raw = timelineData?.events ?? [];
    return raw.map((event) => {
      if (!event.metadata || Object.keys(event.metadata).length === 0) {
        event.metadata = getMockEnrichment(event);
      }
      return enrichEvent(event);
    });
  }, [timelineData]);

  // Filter
  const filteredEvents = useMemo(() => {
    let events = enrichedEvents;
    if (activeFilter !== 'all') events = events.filter((e) => e.type === activeFilter);
    if (selectedYear) events = events.filter((e) => new Date(e.occurredAt).getFullYear() === selectedYear);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      events = events.filter((e) => {
        const s = [e.title, e.summary];
        if (e.consultation) s.push(e.consultation.doctor, e.consultation.reason);
        if (e.lab) s.push(e.lab.test);
        if (e.prescription) s.push(e.prescription.drug);
        if (e.imaging) s.push(e.imaging.study, e.imaging.result);
        if (e.surgery) s.push(e.surgery.procedure, e.surgery.hospital);
        if (e.emergency) s.push(e.emergency.reason);
        if (e.vaccination) s.push(e.vaccination.vaccine);
        return s.some((v) => v.toLowerCase().includes(q));
      });
    }
    return events.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  }, [enrichedEvents, activeFilter, selectedYear, searchQuery]);

  // Build the merged timeline stream (events + AI insights + milestones)
  const timelineStream = useMemo(() => {
    const sorted = [...enrichedEvents].sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
    const stream: ({ type: 'event'; data: EnrichedEvent } | { type: 'insight'; data: { title: string; details: string } } | { type: 'milestone'; data: HealthMilestone })[] = [];

    // Interleave AI insights and milestones between events
    let insightIdx = 0;
    let milestoneIdx = 0;
    const sortedMilestones = [...MILESTONES].sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime());
    const sortedInsights = [...AI_INSIGHTS];

    for (let i = 0; i < sorted.length; i++) {
      stream.push({ type: 'event', data: sorted[i]! });

      // Insert insight after certain events
      if (i > 0 && i % 3 === 0 && insightIdx < sortedInsights.length) {
        stream.push({ type: 'insight', data: sortedInsights[insightIdx++]! });
      }

      // Insert milestone after certain events
      if (i > 0 && i % 5 === 0 && milestoneIdx < sortedMilestones.length) {
        stream.push({ type: 'milestone', data: sortedMilestones[milestoneIdx++]! });
      }
    }

    // Quick filter applies only to events in stream
    if (activeFilter !== 'all') {
      return stream.filter((item) => item.type !== 'event' || item.data.type === activeFilter);
    }
    if (searchQuery.trim()) return stream;
    return stream;
  }, [enrichedEvents, activeFilter, searchQuery]);

  // Available years for left rail
  const availableYears = useMemo(() => {
    const years = new Set(enrichedEvents.map((e) => new Date(e.occurredAt).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [enrichedEvents]);

  // Compute hero data
  const scoreValue = healthScore?.score ?? 78;
  const scoreChange = (healthScore as any)?.change ?? 12;
  const ringScores = [
    { label: 'Lifestyle', value: 82, color: '#2EE59D' },
    { label: 'Cardio', value: 76, color: '#FFD60A' },
    { label: 'Metabolic', value: 71, color: '#FF9F0A' },
    { label: 'Mental', value: 85, color: '#8FD3D1' },
  ];

  const summaryParts = useMemo(() => {
    const sorted = [...enrichedEvents].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
    const parts: string[] = [];
    const consult = sorted.find(e => e.type === 'CONSULTATION' && e.consultation?.reason);
    const abnormalLab = sorted.find(e => e.lab?.isAbnormal);
    const rx = sorted.find(e => e.type === 'PRESCRIPTION' && e.prescription);
    if (consult?.consultation) parts.push(`Cardiovascular health stable. ${consult.consultation.reason} consultation completed.`);
    if (abnormalLab?.lab) parts.push(`${abnormalLab.lab.test} ${abnormalLab.lab.status === 'high' ? 'elevated' : 'low'} at ${abnormalLab.lab.value} ${abnormalLab.lab.unit}.`);
    if (rx?.prescription) parts.push(`${rx.prescription.drug} treatment ongoing with ${rx.prescription.adherence}% adherence.`);
    if (parts.length === 0) parts.push('No critical concerns identified.');
    return parts;
  }, [enrichedEvents]);

  // Trends data for right panel
  const trends: TrendDataPoint[] = [
    { label: 'Blood Pressure', value: 118, unit: 'mmHg', data: [125, 122, 120, 119, 118, 117, 118], trend: 'down' },
    { label: 'Weight', value: 65, unit: 'kg', data: [68, 67.2, 66.5, 65.8, 65.3, 65, 64.8], trend: 'down' },
    { label: 'Heart Rate', value: 72, unit: 'bpm', data: [76, 75, 74, 73, 72, 71, 72], trend: 'stable' },
    { label: 'Glucose', value: 98, unit: 'mg/dL', data: [105, 102, 100, 99, 98, 97, 98], trend: 'down' },
  ];

  const risks: RiskCategory[] = [
    { name: 'Cardiovascular', level: 'low', color: '#2EE59D' },
    { name: 'Diabetes', level: 'low', color: '#2EE59D' },
    { name: 'Respiratory', level: 'moderate', color: '#FF9F0A' },
  ];

  const scoreHistory: ScoreHistoryPoint[] = [
    { year: 2022, score: 62 },
    { year: 2023, score: 68 },
    { year: 2024, score: 72 },
    { year: 2025, score: 78 },
  ];

  const recommendations = [
    'Increase daily walking to 30 minutes',
    'Continue Vitamin D maintenance',
    'Schedule annual checkup',
  ];

  return (
    <div className="min-h-screen" style={{ background: '#0B0D10' }}>
      <div className="flex mx-auto" style={{ maxWidth: 1280 }}>
        {/* Left Rail */}
        <LeftRail
          selectedYear={selectedYear}
          onYearSelect={setSelectedYear}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          availableYears={availableYears}
        />

        {/* Center: Timeline Column */}
        <div className="flex-1 min-w-0 px-6 pt-6 pb-16">
          {/* Hero Section */}
          <HeroSection
            score={scoreValue}
            scoreChange={scoreChange}
            ringScores={ringScores}
            summary={summaryParts.join(' ')}
            riskLevel="low"
            summaryParts={summaryParts}
          />

          {/* Search + Filters */}
          <div className="flex items-center gap-3 mb-6">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <div className="flex gap-1.5 overflow-x-auto">
              {quickFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={cn(
                    'shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium font-ui transition-all border',
                    activeFilter === f.key
                      ? 'border-[#8FD3D1]/30 text-[#8FD3D1]'
                      : 'border-transparent text-text-on-dark-tertiary hover:text-text-on-dark-secondary',
                  )}
                  style={{
                    background: activeFilter === f.key ? 'rgba(143,211,209,0.1)' : 'rgba(255,255,255,0.04)',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline Stream */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-2xl shrink-0" style={{ background: '#1A1D21' }} />
                  <div className="flex-1 space-y-3 p-4 rounded-2xl" style={{ background: '#1A1D21' }}>
                    <Skeleton className="h-4 w-3/4" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <Skeleton className="h-3 w-1/3" style={{ background: 'rgba(255,255,255,0.04)' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl mb-4" style={{ background: 'rgba(255,69,58,0.1)' }}>
                <AlertTriangle className="h-6 w-6 text-[#FF453A]" />
              </div>
              <p className="text-sm font-medium text-text-on-dark">Failed to load timeline</p>
              <p className="text-xs mt-1 font-ui" style={{ color: '#7E8591' }}>Something went wrong loading your health story.</p>
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 px-4 py-2 mt-4 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'rgba(143,211,209,0.1)', color: '#8FD3D1' }}
              >
                <RefreshCw className="h-4 w-4" /> Retry
              </button>
            </div>
          ) : timelineStream.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl mb-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <Sparkles className="h-6 w-6" style={{ color: '#8FD3D1' }} />
              </div>
              <p className="text-base font-semibold text-text-on-dark font-display">Start building your health story.</p>
              <p className="text-xs mt-1 font-ui" style={{ color: '#7E8591' }}>
                {searchQuery || activeFilter !== 'all' ? 'Try adjusting your search or filter' : 'Connect your health records to get started'}
              </p>
              {!searchQuery && activeFilter === 'all' && (
                <div className="flex gap-3 mt-6">
                  <button className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all" style={{ background: '#2EE59D', color: '#0B0D10' }}>
                    Connect ABHA
                  </button>
                  <button className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all border" style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#B7BDC6' }}>
                    Upload Records
                  </button>
                  <button className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all border" style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#B7BDC6' }}>
                    Book Health Checkup
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 pb-8">
              {timelineStream.map((item, idx) => {
                if (item.type === 'insight') {
                  return <AiInsightCard key={`insight-${idx}`} title={item.data.title} details={item.data.details} />;
                }
                if (item.type === 'milestone') {
                  return <MilestoneCard key={item.data.id} milestone={item.data} />;
                }
                return (
                  <EventCard
                    key={item.data.id}
                    event={item.data}
                    isActive={selectedEventId === item.data.id}
                    onSelect={setSelectedEventId}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Insights Panel */}
        <div className="pt-6 pr-6 pb-16">
          <div className="sticky top-24">
            <InsightsPanel
              trends={trends}
              risks={risks}
              scoreHistory={scoreHistory}
              recommendations={recommendations}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
