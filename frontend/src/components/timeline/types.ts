/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/timeline/types.ts
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
 * types — Timeline module
 *
 * Responsibilities:
 * - Support timeline functionality
 *
 * Used By:
 - Standalone (not imported by other source files)
 *
 * Calls:
 - None identified
 *
 * Dependencies:
 - None identified
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Timeline
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

export type TimelineEventType =
  | 'CONSULTATION' | 'LAB' | 'PRESCRIPTION' | 'IMAGING' | 'SURGERY'
  | 'EMERGENCY' | 'VACCINATION' | 'MILESTONE' | 'AI_INSIGHT';

export interface EnrichedEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  summary: string;
  occurredAt: string;
  metadata?: Record<string, unknown>;
  consultation?: { doctor: string; specialty: string; reason: string; outcome: string; recommendation: string };
  lab?: { test: string; value: string; unit: string; status: 'normal' | 'high' | 'low'; previousValue: string; trend: 'up' | 'down' | 'stable'; referenceRange: string; isAbnormal: boolean };
  prescription?: { drug: string; dosage: string; adherence: number; daysRemaining: number; totalDays: number; duration: string };
  imaging?: { study: string; finding: string; bodyPart: string; result: string; radiologistNotes?: string };
  surgery?: { procedure: string; hospital: string; outcome: string; recovery: string; date: string };
  emergency?: { reason: string; severity: 'low' | 'moderate' | 'high' | 'critical'; resolution: string };
  vaccination?: { vaccine: string; dose: number; batch: string; administeredAt: string; nextDue?: string };
  isAIInsight?: boolean;
  insightTitle?: string;
  insightDetails?: string;
}

export interface HealthMilestone {
  id: string;
  title: string;
  description: string;
  achievedAt: string;
  icon: 'check' | 'star' | 'heart' | 'shield' | 'trophy';
  category: 'adherence' | 'weight' | 'condition' | 'safety' | 'fitness';
}

export interface YearGroup {
  year: number;
  events: EnrichedEvent[];
}

export interface TrendDataPoint {
  label: string;
  value: number;
  unit: string;
  data: number[];
  trend: 'up' | 'down' | 'stable';
}

export interface RiskCategory {
  name: string;
  level: 'low' | 'moderate' | 'high';
  color: string;
}

export interface ScoreHistoryPoint {
  year: number;
  score: number;
}

export const EVENT_CONFIG: Record<TimelineEventType, { icon: string; label: string; color: string }> = {
  CONSULTATION: { icon: 'Stethoscope', label: 'Consultation', color: '#8FD3D1' },
  LAB: { icon: 'FlaskConical', label: 'Lab Result', color: '#64D8FF' },
  PRESCRIPTION: { icon: 'Pill', label: 'Prescription', color: '#2EE59D' },
  IMAGING: { icon: 'Radar', label: 'Imaging', color: '#FFD60A' },
  SURGERY: { icon: 'HeartPulse', label: 'Surgery', color: '#FF9F0A' },
  EMERGENCY: { icon: 'AlertTriangle', label: 'Emergency', color: '#FF453A' },
  VACCINATION: { icon: 'Syringe', label: 'Vaccination', color: '#BF5AF2' },
  MILESTONE: { icon: 'Trophy', label: 'Milestone', color: '#FFD60A' },
  AI_INSIGHT: { icon: 'Sparkles', label: 'AI Insight', color: '#8FD3D1' },
};
