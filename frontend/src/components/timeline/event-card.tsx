/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/timeline/event-card.tsx
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
 * React component: event-card
 *
 * Responsibilities:
 * - Render UI components for Frontend
 * - Handle user interactions and state management
 *
 * Used By:
 - frontend/src/app/(platform)/app/wallet/page.tsx
 - frontend/src/app/(platform)/app/consent/page.tsx
 - frontend/src/app/admin/page.tsx
 - frontend/src/components/app/notification-bell.tsx
 - frontend/src/app/admin/users/page.tsx
 - frontend/src/app/os/billing/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/os/layout.tsx
 *
 * Calls:
 - framer-motion
 - utils
 - date-fns
 - react
 *
 * Dependencies:
 - framer-motion
 - utils
 - date-fns
 - react
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
  Stethoscope, FlaskConical, Pill, Radar, HeartPulse, AlertTriangle, Syringe,
  Calendar, Clock, ChevronDown, ChevronUp, ArrowUp, ArrowDown, Shield, FileCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { EnrichedEvent, EVENT_CONFIG } from './types';

const ICON_MAP: Record<string, typeof Stethoscope> = {
  Stethoscope, FlaskConical, Pill, Radar, HeartPulse, AlertTriangle, Syringe,
};

const easing = [0.16, 1, 0.3, 1] as const;

function TrendIndicator({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <ArrowUp className="h-3 w-3 text-[#FF453A]" />;
  if (trend === 'down') return <ArrowDown className="h-3 w-3 text-[#2EE59D]" />;
  return <div className="h-3 w-3 text-text-on-dark-tertiary">—</div>;
}

function LabStatusBadge({ status }: { status: 'normal' | 'high' | 'low' }) {
  const config = {
    normal: { label: 'Normal', classes: 'bg-[#2EE59D]/10 text-[#2EE59D] border-[#2EE59D]/20' },
    high: { label: 'High', classes: 'bg-[#FF453A]/10 text-[#FF453A] border-[#FF453A]/20' },
    low: { label: 'Low', classes: 'bg-[#FF9F0A]/10 text-[#FF9F0A] border-[#FF9F0A]/20' },
  };
  const c = config[status];
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold border', c.classes)}>
      {c.label}
    </span>
  );
}

function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    ABHA: 'bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/20',
    Apollo: 'bg-[#FF9F0A]/10 text-[#FF9F0A] border-[#FF9F0A]/20',
    Fortis: 'bg-[#BF5AF2]/10 text-[#BF5AF2] border-[#BF5AF2]/20',
    'WyshCare AI': 'bg-[#8FD3D1]/10 text-[#8FD3D1] border-[#8FD3D1]/20',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-semibold border', colors[source] ?? 'bg-white/[0.06] text-text-on-dark-secondary border-white/[0.1]')}>
      <Shield className="h-2.5 w-2.5" />
      {source}
    </span>
  );
}

interface EventCardProps {
  event: EnrichedEvent;
  isActive: boolean;
  onSelect: (id: string | null) => void;
}

export function EventCard({ event, isActive, onSelect }: EventCardProps) {
  const cfg = EVENT_CONFIG[event.type] ?? EVENT_CONFIG.CONSULTATION;
  const Icon = ICON_MAP[cfg.icon] ?? Stethoscope;
  const [expanded, setExpanded] = useState(isActive);

  const handleToggle = () => {
    setExpanded(!expanded);
    onSelect(expanded ? null : event.id);
  };

  const sources = event.metadata?.sources as string[] ?? ['WyshCare AI'];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easing }}
    >
      <div className="flex gap-3">
        {/* Connector + icon */}
        <div className="flex flex-col items-center">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 cursor-pointer"
            style={{
              background: `${cfg.color}12`,
              borderColor: isActive ? `${cfg.color}40` : 'rgba(255,255,255,0.08)',
            }}
            onClick={handleToggle}
          >
            <Icon className="h-4 w-4" style={{ color: cfg.color }} />
          </div>
          <div className="mt-1 h-full w-px" style={{ background: `linear-gradient(to bottom, ${cfg.color}20, transparent)` }} />
        </div>

        {/* Content */}
        <div
          className="flex-1 min-w-0 rounded-2xl border transition-all duration-300 cursor-pointer"
          style={{
            background: isActive ? `${cfg.color}06` : '#1A1D21',
            borderColor: isActive ? `${cfg.color}25` : 'rgba(255,255,255,0.08)',
          }}
          onClick={handleToggle}
        >
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-semibold text-text-on-dark font-display leading-snug">{event.title}</h3>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                  <span className="text-[9px] text-text-on-dark-tertiary">•</span>
                  <span className="flex items-center gap-1 text-[10px] text-text-on-dark-tertiary font-ui">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(event.occurredAt), 'MMM d, yyyy')}
                  </span>
                  <div className="flex items-center gap-1.5 ml-auto">
                    {sources.map((s: string) => <SourceBadge key={s} source={s} />)}
                  </div>
                </div>
              </div>
              <button className="shrink-0 p-1 rounded-md hover:bg-white/[0.06] transition-colors">
                {expanded ? <ChevronUp className="h-4 w-4 text-text-on-dark-tertiary" /> : <ChevronDown className="h-4 w-4 text-text-on-dark-tertiary" />}
              </button>
            </div>

            {/* Summary (always visible) */}
            {event.summary && !expanded && (
              <p className="text-[11px] text-text-on-dark-secondary mt-2 leading-relaxed font-ui">{event.summary}</p>
            )}

            {/* Expanded detail */}
            {expanded && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                {/* Narrative first */}
                {event.summary && (
                  <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <p className="text-[12px] text-text-on-dark leading-relaxed font-ui">{event.summary}</p>
                  </div>
                )}

                {/* Consultation */}
                {event.type === 'CONSULTATION' && event.consultation && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <DetailItem label="Doctor" value={event.consultation.doctor} />
                    <DetailItem label="Specialty" value={event.consultation.specialty} />
                    <DetailItem label="Reason" value={event.consultation.reason} />
                    <DetailItem label="Outcome" value={event.consultation.outcome} />
                    {event.consultation.recommendation && (
                      <div className="col-span-2 mt-1 p-2.5 rounded-lg" style={{ background: 'rgba(143,211,209,0.08)', border: '1px solid rgba(143,211,209,0.15)' }}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <FileCheck className="h-3 w-3" style={{ color: '#8FD3D1' }} />
                          <span className="text-[9px] font-semibold font-ui" style={{ color: '#8FD3D1' }}>Recommendation</span>
                        </div>
                        <p className="text-[11px] text-text-on-dark font-ui">{event.consultation.recommendation}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Lab */}
                {event.type === 'LAB' && event.lab && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-text-on-dark font-ui">{event.lab.test}</span>
                          <LabStatusBadge status={event.lab.status} />
                        </div>
                        <div className="flex items-end gap-2 mt-1">
                          <span className="text-xl font-bold text-text-on-dark font-display">{event.lab.value}</span>
                          <span className="text-[10px] text-text-on-dark-tertiary pb-0.5">{event.lab.unit}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TrendIndicator trend={event.lab.trend} />
                        <span className="text-[10px] text-text-on-dark-tertiary">Prev: {event.lab.previousValue}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-text-on-dark-tertiary px-1">Reference range: {event.lab.referenceRange}</p>
                  </div>
                )}

                {/* Prescription */}
                {event.type === 'PRESCRIPTION' && event.prescription && (
                  <div className="mt-3">
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-text-on-dark font-ui">{event.prescription.drug}</span>
                        <span className="text-[10px] font-medium text-[#2EE59D]">
                          {event.prescription.adherence}% adherence
                        </span>
                      </div>
                      <p className="text-[11px] text-text-on-dark-secondary mb-2 font-ui">{event.prescription.dosage} — {event.prescription.duration}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${(event.prescription.daysRemaining / Math.max(event.prescription.totalDays, 1)) * 100}%`,
                                background: 'linear-gradient(90deg, #2EE59D, #8FD3D1)',
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-[10px] text-text-on-dark-tertiary whitespace-nowrap">
                          {event.prescription.daysRemaining} days left
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Imaging */}
                {event.type === 'IMAGING' && event.imaging && (
                  <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-text-on-dark font-ui">{event.imaging.study}</span>
                      <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', event.imaging.finding === 'Normal'
                        ? 'bg-[#2EE59D]/10 text-[#2EE59D] border-[#2EE59D]/20'
                        : 'bg-[#FF9F0A]/10 text-[#FF9F0A] border-[#FF9F0A]/20')}>
                        {event.imaging.finding}
                      </span>
                    </div>
                    <p className="text-[10px] text-text-on-dark-tertiary font-ui">{event.imaging.bodyPart}</p>
                    <p className="text-[11px] text-text-on-dark mt-2">{event.imaging.result}</p>
                    {event.imaging.radiologistNotes && (
                      <p className="text-[10px] text-text-on-dark-tertiary mt-1 italic">{event.imaging.radiologistNotes}</p>
                    )}
                  </div>
                )}

                {/* Surgery */}
                {event.type === 'SURGERY' && event.surgery && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <DetailItem label="Procedure" value={event.surgery.procedure} />
                    <DetailItem label="Hospital" value={event.surgery.hospital} />
                    <DetailItem label="Outcome" value={event.surgery.outcome} />
                    <DetailItem label="Recovery" value={event.surgery.recovery} />
                  </div>
                )}

                {/* Emergency */}
                {event.type === 'EMERGENCY' && event.emergency && (
                  <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(255,69,58,0.06)', border: '1px solid rgba(255,69,58,0.15)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-[#FF453A]" />
                      <span className="text-[10px] font-semibold text-[#FF453A] font-ui uppercase tracking-wide">Emergency — {event.emergency.severity}</span>
                    </div>
                    <p className="text-[11px] text-text-on-dark mb-1 font-ui">{event.emergency.reason}</p>
                    <p className="text-[10px] text-text-on-dark-secondary">Resolution: {event.emergency.resolution}</p>
                  </div>
                )}

                {/* Vaccination */}
                {event.type === 'VACCINATION' && event.vaccination && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <DetailItem label="Vaccine" value={event.vaccination.vaccine} />
                    <DetailItem label="Dose" value={`Dose ${event.vaccination.dose}`} />
                    <DetailItem label="Batch" value={event.vaccination.batch} />
                    {event.vaccination.nextDue && <DetailItem label="Next Due" value={format(new Date(event.vaccination.nextDue), 'MMM d, yyyy')} />}
                  </div>
                )}

                {/* Timestamp footer */}
                <div className="flex items-center gap-2 mt-3 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <Clock className="h-3 w-3 text-text-on-dark-tertiary" />
                  <span className="text-[9px] text-text-on-dark-tertiary font-ui">
                    Recorded {format(new Date(event.occurredAt), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
      <p className="text-[9px] font-medium text-text-on-dark-tertiary font-ui uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-[11px] font-medium text-text-on-dark font-ui">{value}</p>
    </div>
  );
}
