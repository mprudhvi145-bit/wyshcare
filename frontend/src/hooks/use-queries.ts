/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/hooks/use-queries.ts
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
 * use-queries — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
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
WyshID
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
  InsuranceProvider,
  InsurancePlan,
  InsurancePolicy,
  Claim,
  PreAuthorization,
  CoverageRule,
  EligibilityCheck,
  ClaimAnalysis,
  DenialRisk,
  BillingInvoice,
  QueueEntry,
  DashboardData,
  CoverageType,
} from '@/types';

// ── Query Hooks ──────────────────────────────────────────────────────

export function useProviders() {
  return useQuery<InsuranceProvider[]>({
    queryKey: ['providers'],
    queryFn: () => api.getInsuranceProviders(),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlans(providerId?: string) {
  return useQuery<InsurancePlan[]>({
    queryKey: ['plans', providerId],
    queryFn: () => api.getInsurancePlans(providerId),
    staleTime: 5 * 60 * 1000,
    enabled: providerId !== undefined,
  });
}

export function usePolicies(params?: { patientUserId?: string; status?: string }) {
  return useQuery<InsurancePolicy[]>({
    queryKey: ['policies', params],
    queryFn: () => api.getPolicies(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function usePolicy(id: string) {
  return useQuery<InsurancePolicy>({
    queryKey: ['policy', id],
    queryFn: () => api.getPolicy(id),
    staleTime: 2 * 60 * 1000,
    enabled: !!id,
  });
}

export function useClaims(params?: { policyId?: string; patientUserId?: string; clinicId?: string; status?: string }) {
  return useQuery<Claim[]>({
    queryKey: ['claims', params],
    queryFn: () => api.getClaims(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useClaim(id: string) {
  return useQuery<Claim>({
    queryKey: ['claim', id],
    queryFn: () => api.getClaim(id),
    staleTime: 2 * 60 * 1000,
    enabled: !!id,
  });
}

export function usePreAuths(params?: { policyId?: string; patientUserId?: string; status?: string }) {
  return useQuery<PreAuthorization[]>({
    queryKey: ['preAuths', params],
    queryFn: () => api.getPreAuths(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function usePreAuth(id: string) {
  return useQuery<PreAuthorization>({
    queryKey: ['preAuth', id],
    queryFn: () => api.getPreAuth(id),
    staleTime: 2 * 60 * 1000,
    enabled: !!id,
  });
}

export function useCoverageRules(planId: string) {
  return useQuery<CoverageRule[]>({
    queryKey: ['coverageRules', planId],
    queryFn: () => api.getCoverageRules(planId),
    staleTime: 5 * 60 * 1000,
    enabled: !!planId,
  });
}

export function useEligibilityHistory(patientUserId: string) {
  return useQuery<EligibilityCheck[]>({
    queryKey: ['eligibilityHistory', patientUserId],
    queryFn: () => api.getEligibilityHistory(patientUserId),
    staleTime: 2 * 60 * 1000,
    enabled: !!patientUserId,
  });
}

export function useClaimAnalysis(id: string) {
  return useQuery<ClaimAnalysis>({
    queryKey: ['claimAnalysis', id],
    queryFn: () => api.analyzeClaim(id),
    staleTime: 30 * 1000,
    enabled: !!id,
  });
}

export function useDenialRisk(id: string) {
  return useQuery<DenialRisk>({
    queryKey: ['denialRisk', id],
    queryFn: () => api.predictDenialRisk(id),
    staleTime: 30 * 1000,
    enabled: !!id,
  });
}

export function useInvoices(params?: { clinicId?: string; patientUserId?: string; status?: string }) {
  return useQuery<BillingInvoice[]>({
    queryKey: ['invoices', params],
    queryFn: () => api.getInvoices(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useInvoice(id: string) {
  return useQuery<BillingInvoice>({
    queryKey: ['invoice', id],
    queryFn: () => api.getInvoice(id),
    staleTime: 2 * 60 * 1000,
    enabled: !!id,
  });
}

export function useQueue(clinicId: string, params?: { doctorId?: string; status?: string }) {
  return useQuery<QueueEntry[]>({
    queryKey: ['queue', clinicId, params],
    queryFn: () => api.getQueue(clinicId, params),
    refetchInterval: 30 * 1000,
    enabled: !!clinicId,
  });
}

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => api.getPatientDashboard(),
    staleTime: 60 * 1000,
  });
}

export function useHealthGraph() {
  return useQuery<any>({
    queryKey: ['healthGraph'],
    queryFn: () => api.getHealthGraph(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useHealthTimeline() {
  return useQuery<any[]>({
    queryKey: ['healthTimeline'],
    queryFn: () => api.getHealthTimeline(),
    staleTime: 5 * 60 * 1000,
  });
}

// ── Mutation Hooks ───────────────────────────────────────────────────

export function useCreateProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<InsuranceProvider>) => api.createInsuranceProvider(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['providers'] }); },
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<InsurancePlan>) => api.createInsurancePlan(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['plans'] }); },
  });
}

export function useCreatePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.createPolicy(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['policies'] }); },
  });
}

export function useUpdatePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updatePolicy(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['policies'] }); },
  });
}

export function useCreateCoverageRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.createCoverageRule(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coverageRules'] }); },
  });
}

export function useCheckEligibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { policyId: string; category: CoverageType; amount: number }) => api.checkEligibility(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['eligibilityHistory'] }); },
  });
}

export function useCreatePreAuth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.createPreAuth(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['preAuths'] }); },
  });
}

export function useRespondToPreAuth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; approvedAmount?: number; reviewerNotes?: string } }) =>
      api.respondToPreAuth(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['preAuths'] }); },
  });
}

export function useCreateClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.createClaim(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['claims'] }); },
  });
}

export function useSubmitClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.submitClaim(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['claims'] }); },
  });
}

export function useAdjudicateClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; approvedAmount?: number; notes?: string } }) =>
      api.adjudicateClaim(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['claims'] }); },
  });
}

export function useAttachClaimDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { documentType: string; fileName: string; storageKey: string; fileSize?: number } }) =>
      api.attachClaimDocument(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['claim'] }); },
  });
}

export function useCreateSettlement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ claimId, data }: { claimId: string; data: { amount: number; method: string; reference?: string; notes?: string } }) =>
      api.createSettlement(claimId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['claims'] }); },
  });
}

export function useAnalyzeClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.analyzeClaim(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['claimAnalysis'] }); },
  });
}

export function usePredictDenialRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.predictDenialRisk(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['denialRisk'] }); },
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.createInvoice(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); },
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: { amount: number; method: string; reference?: string } }) =>
      api.recordPayment(invoiceId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); },
  });
}

export function useApplyAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: { amount: number; reason?: string } }) =>
      api.applyAdjustment(invoiceId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); },
  });
}

export function useIssueRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: { amount: number; reason?: string } }) =>
      api.issueRefund(invoiceId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); },
  });
}

export function useMarkInvoiceSettled() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId: string) => api.markInvoiceSettled(invoiceId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); },
  });
}

export function useCheckInPatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.checkInPatient(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['queue'] }); },
  });
}

export function useCallPatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.callPatient(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['queue'] }); },
  });
}

export function useCompletePatientVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.completePatientVisit(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['queue'] }); },
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.createAppointment(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['appointments'] }); },
  });
}
