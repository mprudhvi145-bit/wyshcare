/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/hooks/use-health-data.ts
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
 * use-health-data — Health module
 *
 * Responsibilities:
 * - Support health functionality
 *
 * Used By:
 - frontend/src/app/(platform)/health-twin/risk-predictions/page.tsx
 - frontend/src/hooks/use-emergency.ts
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/(platform)/app/telemedicine/page.tsx
 - frontend/src/app/(platform)/app/pharmacy/page.tsx
 - frontend/src/app/(platform)/app/consent/page.tsx
 - frontend/src/app/admin/population-health/page.tsx
 - frontend/src/app/(platform)/app/diagnostics/page.tsx
 *
 * Calls:
 - api-client
 - react-query
 *
 * Dependencies:
 - api-client
 - react-query
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Health
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

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type {
  HealthScoreResponse,
  HealthScoreHistoryResponse,
  RiskPredictionResponse,
  PreventiveRecommendation,
  LifestyleResponse,
  AiRecommendation,
  Goal,
  CreateGoalDto,
  UpdateGoalProgressDto,
  Milestone,
  CreateMilestoneDto,
} from '@/types';

// ── Health Score ──────────────────────────────────────────────────────

export function useHealthScore() {
  return useQuery<HealthScoreResponse>({
    queryKey: ['healthScore'],
    queryFn: () => api.getHealthScore(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useHealthScoreHistory() {
  return useQuery<HealthScoreHistoryResponse>({
    queryKey: ['healthScoreHistory'],
    queryFn: () => api.getHealthScoreHistory(),
    staleTime: 5 * 60 * 1000,
  });
}

// ── Risk Predictions ─────────────────────────────────────────────────

export function useRiskPredictions() {
  return useQuery<RiskPredictionResponse>({
    queryKey: ['riskPredictions'],
    queryFn: () => api.getRiskPredictions(),
    staleTime: 10 * 60 * 1000,
  });
}

// ── Preventive Recommendations ───────────────────────────────────────

export function usePreventiveRecommendations() {
  return useQuery<PreventiveRecommendation[]>({
    queryKey: ['preventiveRecommendations'],
    queryFn: () => api.getPreventiveRecommendations(),
    staleTime: 10 * 60 * 1000,
  });
}

// ── Lifestyle Metrics ────────────────────────────────────────────────

export function useLifestyleMetrics() {
  return useQuery<LifestyleResponse>({
    queryKey: ['lifestyleMetrics'],
    queryFn: () => api.getLifestyleMetrics(),
    staleTime: 5 * 60 * 1000,
  });
}

// ── AI Recommendations ──────────────────────────────────────────────

export function useAiRecommendations() {
  return useQuery<AiRecommendation[]>({
    queryKey: ['aiRecommendations'],
    queryFn: () => api.getAiRecommendations(),
    staleTime: 15 * 60 * 1000,
  });
}

// ── Goals ────────────────────────────────────────────────────────────

export function useGoals(status?: string) {
  return useQuery<Goal[]>({
    queryKey: ['goals', status],
    queryFn: () => api.getGoals(status),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGoalDto) => api.createGoal(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['goals'] }); },
  });
}

export function useUpdateGoalProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGoalProgressDto }) => api.updateGoalProgress(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['goals'] }); },
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteGoal(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['goals'] }); },
  });
}

export function useGoalMilestones(goalId: string) {
  return useQuery<Milestone[]>({
    queryKey: ['goalMilestones', goalId],
    queryFn: () => api.getGoalMilestones(goalId),
    staleTime: 2 * 60 * 1000,
    enabled: !!goalId,
  });
}

export function useCreateMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, data }: { goalId: string; data: CreateMilestoneDto }) => api.createMilestone(goalId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['goalMilestones'] }); },
  });
}
