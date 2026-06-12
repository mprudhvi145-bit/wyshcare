/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/lib/api-client.ts
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
 * api-client — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - frontend/src/lib/specialty-api.ts
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

import { request, api as baseApi } from './api';
import type {
  InsuranceProvider,
  InsurancePlan,
  InsurancePolicy,
  CoverageRule,
  EligibilityCheck,
  PreAuthorization,
  Claim,
  ClaimDocument,
  ClaimAnalysis,
  DenialRisk,
  Settlement,
  CoverageType,
  BillingInvoice,
  QueueEntry,
  Appointment,
  AppointmentResponse,
  AppointmentParams,
  CreateAppointmentDto,
  RescheduleDto,
  DoctorSearchParams,
  DoctorResponse,
  DashboardData,
  HealthScoreResponse,
  HealthScoreHistoryResponse,
  HealthScoreFactorsResponse,
  TimelineParams,
  TimelineResponse,
  TimelineEvent,
  EmergencyProfileResponse,
  EmergencyQRResponse,
  GrantEmergencyAccessDto,
  EmergencyContact,
  CreateEmergencyContactDto,
  RiskPredictionResponse,
  PreventiveRecommendation,
  LifestyleResponse,
  WearableResponse,
  AiRecommendation,
  TwinScoreResponse,
  InteractionResult,
  AllergyCheckResult,
  DifferentialDiagnosis,
  Guideline,
  FamilyMember,
  InviteFamilyDto,
  Consent,
  CreateConsentDto,
  Notification,
  UserProfile,
  WyshDashboardData,
  NHCXMetrics,
  NHCXSubmission,
  NHCXConfiguration,
  Goal,
  CreateGoalDto,
  UpdateGoalProgressDto,
  Milestone,
  CreateMilestoneDto,
  SaveSoapDto,
  PatientChartResponse,
  SoapNote
} from '@/types';

const extendedApi = {
  // ── Dashboard ───────────────────────────────────────────────────────

  getHealthScore() {
    return request<HealthScoreResponse>('/health-score');
  },

  getHealthScoreHistory() {
    return request<HealthScoreHistoryResponse>('/health-score/history');
  },

  getHealthScoreFactors() {
    return request<HealthScoreFactorsResponse>('/health-score/factors');
  },

  /** @deprecated Use api.getPatientDashboard() instead */
  getDashboard() {
    return request<DashboardData>('/dashboard/patient');
  },

  // ── Timeline ────────────────────────────────────────────────────────

  getTimeline(params?: TimelineParams) {
    const qs = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return request<TimelineResponse>(`/timeline${qs}`);
  },

  getTimelineEvent(id: string) {
    return request<TimelineEvent>(`/timeline/${id}`);
  },

  // ── Telemedicine ────────────────────────────────────────────────────

  getAppointments(params?: AppointmentParams) {
    const qs = params?.status ? `?status=${encodeURIComponent(params.status)}` : '';
    return request<AppointmentResponse>(`/telemedicine/appointments${qs}`);
  },

  getAppointment(id: string) {
    return request<Appointment>(`/telemedicine/appointments/${id}`);
  },

  createAppointment(data: CreateAppointmentDto) {
    return request<Appointment>('/telemedicine/appointments', { method: 'POST', body: data });
  },

  cancelAppointment(id: string) {
    return request<void>(`/telemedicine/appointments/${id}/cancel`, { method: 'POST' });
  },

  rescheduleAppointment(id: string, data: RescheduleDto) {
    return request<Appointment>(`/telemedicine/appointments/${id}/reschedule`, { method: 'PATCH', body: data });
  },

  getConsultationToken(id: string) {
    return request<{ token: string }>(`/telemedicine/consultations/${id}/token`);
  },

  getDoctors(params?: DoctorSearchParams) {
    const qs = new URLSearchParams();
    if (params?.query) qs.set('query', params.query);
    if (params?.specialty) qs.set('specialty', params.specialty);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const qstr = qs.toString();
    return request<DoctorResponse>(`/doctors${qstr ? `?${qstr}` : ''}`);
  },

  // ── Emergency ───────────────────────────────────────────────────────

  getEmergencyProfile() {
    return request<EmergencyProfileResponse>('/identity/emergency');
  },

  getEmergencyQR() {
    return request<EmergencyQRResponse>('/identity/emergency/qr');
  },

  grantEmergencyAccess(data: GrantEmergencyAccessDto) {
    return request<void>('/identity/emergency/access', { method: 'POST', body: data });
  },

  revokeEmergencyAccess(id: string) {
    return request<void>(`/identity/emergency/access/${id}`, { method: 'DELETE' });
  },

  getEmergencyContacts() {
    return request<EmergencyContact[]>('/identity/emergency/contacts');
  },

  addEmergencyContact(data: CreateEmergencyContactDto) {
    return request<EmergencyContact>('/identity/emergency/contacts', { method: 'POST', body: data });
  },

  deleteEmergencyContact(id: string) {
    return request<void>(`/identity/emergency/contacts/${id}`, { method: 'DELETE' });
  },

  // ── AI Health Insights ──────────────────────────────────────────────

  getRiskPredictions() {
    return request<RiskPredictionResponse>('/health-graph-v2/risks');
  },

  getPreventiveRecommendations() {
    return request<PreventiveRecommendation[]>('/health-graph-v2/prevention');
  },

  getLifestyleMetrics() {
    return request<LifestyleResponse>('/health-graph-v2/lifestyle');
  },

  getWearableData() {
    return request<WearableResponse>('/health-graph-v2/wearables');
  },

  getAiRecommendations() {
    return request<AiRecommendation[]>('/ai/recommendations');
  },

  getTwinScore() {
    return request<TwinScoreResponse>('/digital-twin/score');
  },

  // ── Goals ───────────────────────────────────────────────────────────

  getGoals(status?: string) {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    return request<Goal[]>(`/goals${qs}`);
  },

  createGoal(data: CreateGoalDto) {
    return request<Goal>('/goals', { method: 'POST', body: data });
  },

  updateGoalProgress(id: string, data: UpdateGoalProgressDto) {
    return request<Goal>(`/goals/${id}/progress`, { method: 'PATCH', body: data });
  },

  deleteGoal(id: string) {
    return request<void>(`/goals/${id}`, { method: 'DELETE' });
  },

  getGoalMilestones(id: string) {
    return request<Milestone[]>(`/goals/${id}/milestones`);
  },

  createMilestone(id: string, data: CreateMilestoneDto) {
    return request<Milestone>(`/goals/${id}/milestones`, { method: 'POST', body: data });
  },

  // ── EMR / Doctor ────────────────────────────────────────────────────

  getPatientChart(patientId: string) {
    return request<PatientChartResponse>(`/ehr/patients/${patientId}`);
  },

  getSoapNotes(patientId: string) {
    return request<SoapNote[]>(`/ehr/patients/${patientId}/soap`);
  },

  saveSoapNote(patientId: string, data: SaveSoapDto) {
    return request<SoapNote>(`/ehr/patients/${patientId}/soap`, { method: 'POST', body: data });
  },

  getDrugInteractions(medications: string[]) {
    return request<InteractionResult[]>('/prescription/interactions', { method: 'POST', body: { medications } });
  },

  checkAllergies(medicationId: string, patientId: string) {
    return request<AllergyCheckResult>('/prescription/allergy-check', { method: 'POST', body: { medicationId, patientId } });
  },

  getDifferentialDiagnosis(symptoms: string[]) {
    return request<DifferentialDiagnosis[]>('/ai/symptom-analysis', { method: 'POST', body: { symptoms } });
  },

  getClinicalGuidelines(query: string) {
    return request<Guideline[]>(`/ehr/guidelines?q=${encodeURIComponent(query)}`);
  },

  // ── Family ──────────────────────────────────────────────────────────

  getFamilyMembers() {
    return request<FamilyMember[]>('/family/members');
  },

  inviteFamilyMember(data: InviteFamilyDto) {
    return request<FamilyMember>('/family/invite', { method: 'POST', body: data });
  },

  removeFamilyMember(id: string) {
    return request<void>(`/family/members/${id}`, { method: 'DELETE' });
  },

  // ── Consent ─────────────────────────────────────────────────────────

  getConsents() {
    return request<Consent[]>('/consent');
  },

  createConsent(data: CreateConsentDto) {
    return request<Consent>('/consent', { method: 'POST', body: data });
  },

  revokeConsent(id: string) {
    return request<void>(`/consent/${id}/revoke`, { method: 'POST' });
  },

  // ── Notifications ───────────────────────────────────────────────────

  getNotifications() {
    return request<Notification[]>('/notifications');
  },

  markNotificationRead(id: string) {
    return request<void>(`/notifications/${id}/read`, { method: 'POST' });
  },

  // ── Identity ────────────────────────────────────────────────────────

  getProfile() {
    return request<UserProfile>('/identity/profile');
  },

  updateProfile(data: Partial<UserProfile>) {
    return request<UserProfile>('/identity/profile', { method: 'PATCH', body: data });
  },

  // ── Insurance ───────────────────────────────────────────────────────

  getInsuranceProviders(params?: { type?: string; isActive?: boolean }) {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    if (params?.isActive !== undefined) query.set('isActive', String(params.isActive));
    const qs = query.toString();
    return request<InsuranceProvider[]>(`/insurance/providers${qs ? `?${qs}` : ''}`);
  },

  createInsuranceProvider(data: Partial<InsuranceProvider>) {
    return request<InsuranceProvider>('/insurance/providers', { method: 'POST', body: data });
  },

  getInsurancePlans(providerId?: string) {
    const qs = providerId ? `?providerId=${encodeURIComponent(providerId)}` : '';
    return request<InsurancePlan[]>(`/insurance/plans${qs}`);
  },

  createInsurancePlan(data: Partial<InsurancePlan>) {
    return request<InsurancePlan>('/insurance/plans', { method: 'POST', body: data });
  },

  getPolicies(params?: { patientUserId?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.patientUserId) query.set('patientUserId', params.patientUserId);
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return request<InsurancePolicy[]>(`/insurance/policies${qs ? `?${qs}` : ''}`);
  },

  getPolicy(id: string) {
    return request<InsurancePolicy>(`/insurance/policies/${id}`);
  },

  createPolicy(data: Partial<InsurancePolicy>) {
    return request<InsurancePolicy>('/insurance/policies', { method: 'POST', body: data });
  },

  updatePolicy(id: string, data: Partial<InsurancePolicy>) {
    return request<InsurancePolicy>(`/insurance/policies/${id}`, { method: 'PATCH', body: data });
  },

  getCoverageRules(planId: string) {
    return request<CoverageRule[]>(`/insurance/plans/${planId}/coverage-rules`);
  },

  createCoverageRule(data: Partial<CoverageRule>) {
    return request<CoverageRule>('/insurance/coverage-rules', { method: 'POST', body: data });
  },

  checkEligibility(data: { policyId: string; category: CoverageType; amount: number }) {
    return request<EligibilityCheck>('/insurance/eligibility/check', { method: 'POST', body: data });
  },

  getEligibilityHistory(patientUserId: string) {
    return request<EligibilityCheck[]>(`/insurance/eligibility/history/${patientUserId}`);
  },

  getPreAuths(params?: { policyId?: string; patientUserId?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.policyId) query.set('policyId', params.policyId);
    if (params?.patientUserId) query.set('patientUserId', params.patientUserId);
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return request<PreAuthorization[]>(`/insurance/pre-auths${qs ? `?${qs}` : ''}`);
  },

  getPreAuth(id: string) {
    return request<PreAuthorization>(`/insurance/pre-auths/${id}`);
  },

  createPreAuth(data: Partial<PreAuthorization>) {
    return request<PreAuthorization>('/insurance/pre-auths', { method: 'POST', body: data });
  },

  respondToPreAuth(id: string, data: { status: string; approvedAmount?: number; reviewerNotes?: string }) {
    return request<PreAuthorization>(`/insurance/pre-auths/${id}/respond`, { method: 'PATCH', body: data });
  },

  getClaims(params?: { policyId?: string; patientUserId?: string; clinicId?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.policyId) query.set('policyId', params.policyId);
    if (params?.patientUserId) query.set('patientUserId', params.patientUserId);
    if (params?.clinicId) query.set('clinicId', params.clinicId);
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return request<Claim[]>(`/insurance/claims${qs ? `?${qs}` : ''}`);
  },

  getClaim(id: string) {
    return request<Claim>(`/insurance/claims/${id}`);
  },

  createClaim(data: Partial<Claim>) {
    return request<Claim>('/insurance/claims', { method: 'POST', body: data });
  },

  submitClaim(id: string) {
    return request<Claim>(`/insurance/claims/${id}/submit`, { method: 'POST' });
  },

  adjudicateClaim(id: string, data: { status: string; approvedAmount?: number; notes?: string }) {
    return request<Claim>(`/insurance/claims/${id}/adjudicate`, { method: 'PATCH', body: data });
  },

  attachClaimDocument(id: string, data: { documentType: string; fileName: string; storageKey: string; fileSize?: number }) {
    return request<ClaimDocument>(`/insurance/claims/${id}/documents`, { method: 'POST', body: data });
  },

  createSettlement(claimId: string, data: { amount: number; method: string; reference?: string; notes?: string }) {
    return request<Settlement>(`/insurance/claims/${claimId}/settlements`, { method: 'POST', body: data });
  },

  analyzeClaim(id: string) {
    return request<ClaimAnalysis>(`/insurance/claims/${id}/analysis`);
  },

  predictDenialRisk(id: string) {
    return request<DenialRisk>(`/insurance/claims/${id}/denial-risk`);
  },

  // ── Clinic Billing ──────────────────────────────────────────────────

  getInvoices(params?: { clinicId?: string; patientUserId?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.clinicId) query.set('clinicId', params.clinicId);
    if (params?.patientUserId) query.set('patientUserId', params.patientUserId);
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return request<BillingInvoice[]>(`/clinic/invoices${qs ? `?${qs}` : ''}`);
  },

  getInvoice(id: string) {
    return request<BillingInvoice>(`/clinic/invoices/${id}`);
  },

  createInvoice(data: Partial<BillingInvoice>) {
    return request<BillingInvoice>('/clinic/invoices', { method: 'POST', body: data });
  },

  recordPayment(invoiceId: string, data: { amount: number; method: string; reference?: string }) {
    return request<Record<string, unknown>>(`/clinic/invoices/${invoiceId}/payments`, { method: 'POST', body: data });
  },

  applyAdjustment(invoiceId: string, data: { amount: number; reason?: string }) {
    return request<BillingInvoice>(`/clinic/invoices/${invoiceId}/adjustments`, { method: 'POST', body: data });
  },

  issueRefund(invoiceId: string, data: { amount: number; reason?: string }) {
    return request<Record<string, unknown>>(`/clinic/invoices/${invoiceId}/refunds`, { method: 'POST', body: data });
  },

  markInvoiceSettled(invoiceId: string) {
    return request<BillingInvoice>(`/clinic/invoices/${invoiceId}/settle`, { method: 'PATCH' });
  },

  // ── Clinic Queue ────────────────────────────────────────────────────

  getQueue(clinicId: string, params?: { doctorId?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.doctorId) query.set('doctorId', params.doctorId);
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return request<QueueEntry[]>(`/clinic/queue/${clinicId}${qs ? `?${qs}` : ''}`);
  },

  checkInPatient(data: Partial<QueueEntry>) {
    return request<QueueEntry>('/clinic/queue/check-in', { method: 'POST', body: data });
  },

  callPatient(id: string) {
    return request<QueueEntry>(`/clinic/queue/${id}/call`, { method: 'PATCH' });
  },

  completePatientVisit(id: string) {
    return request<QueueEntry>(`/clinic/queue/${id}/complete`, { method: 'PATCH' });
  },

  // ── Wysh Super App ──────────────────────────────────────────────────

  getWyshDashboard() {
    return request<WyshDashboardData>('/wysh/dashboard');
  },

  // ── Health Graph / Dashboard ────────────────────────────────────────

  getPatientDashboard() {
    return request<DashboardData>('/identity/dashboard');
  },

  getHealthGraph() {
    return request<Record<string, unknown>>('/health/graph');
  },

  getHealthTimeline() {
    return request<Record<string, unknown>[]>('/health/timeline');
  },

  // ── NHCX Gateway ─────────────────────────────────────────────────────

  configureNHCX(providerId: string, data: { insurerId: string; apiEndpoint: string; clientId: string; clientSecret: string; webhookSecret?: string }) {
    return request<NHCXConfiguration>(`/nhcx/providers/${providerId}/configure`, { method: 'POST', body: data });
  },

  getNHCXConfiguration(providerId: string) {
    return request<NHCXConfiguration>(`/nhcx/providers/${providerId}/configuration`);
  },

  submitClaimViaNHCX(claimId: string) {
    return request<{ submissionId: string; submissionRef: string; status: string }>(`/nhcx/claims/${claimId}/submit`, { method: 'POST' });
  },

  acknowledgeNHCXSubmission(submissionId: string, data: { outcome: string; notes?: string }) {
    return request<Record<string, unknown>>(`/nhcx/submissions/${submissionId}/acknowledge`, { method: 'POST', body: data });
  },

  syncNHCXStatus(submissionId: string) {
    return request<Record<string, unknown>>(`/nhcx/submissions/${submissionId}/sync`, { method: 'POST' });
  },

  getNHCXStats() {
    return request<NHCXMetrics>('/nhcx/stats');
  },

  getNHCXSubmissions(params?: { status?: string; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return request<NHCXSubmission[]>(`/nhcx/submissions${qs ? `?${qs}` : ''}`);
  },

  // ── ABDM Gateway ────────────────────────────────────────────────────

  createAbha(data: Record<string, unknown>) {
    return request<Record<string, unknown>>('/abdm/abha/create', { method: 'POST', body: data });
  },

  linkAbha(data: Record<string, unknown>) {
    return request<Record<string, unknown>>('/abdm/abha/link', { method: 'POST', body: data });
  },

  resolveAbha(abhaAddress: string) {
    return request<Record<string, unknown>>('/abdm/abha/resolve', { method: 'POST', body: { abhaAddress } });
  },

  getAbhaProfile(userId: string) {
    return request<Record<string, unknown>>(`/abdm/abha/profile/${userId}`);
  },

  requestAbhaOtp(abhaAddress: string) {
    return request<Record<string, unknown>>('/abdm/abha/request-otp', { method: 'POST', body: { abhaAddress } });
  },

  verifyAbhaOtp(txnId: string, otp: string) {
    return request<Record<string, unknown>>('/abdm/abha/verify-otp', { method: 'POST', body: { txnId, otp } });
  },

  searchAbha(q: string) {
    return request<Record<string, unknown>[]>(`/abdm/abha/search?q=${encodeURIComponent(q)}`);
  },

getAbhaStats() {
    return request<{ 
        total: number; 
        active: number; 
        verified: number; 
        pending: number; 
        rejected: number; 
        growthRate: number;
        thisMonth: number;
        today: number;
    }>('/abdm/abha/stats');
},

  requestConsent(data: Record<string, unknown>) {
    return request<Record<string, unknown>>('/abdm/consent/request', { method: 'POST', body: data });
  },

  grantConsent(id: string) {
    return request<Record<string, unknown>>(`/abdm/consent/${id}/grant`, { method: 'POST' });
  },

  abdmRevokeConsent(id: string, reason?: string) {
    return request<Record<string, unknown>>(`/abdm/consent/${id}/revoke`, { method: 'POST', body: { reason } });
  },

  getConsent(id: string) {
    return request<Record<string, unknown>>(`/abdm/consent/${id}`);
  },

  getPatientConsents(patientUserId: string) {
    return request<Record<string, unknown>[]>(`/abdm/consent/patient/${patientUserId}`);
  },

  listConsents(status?: string) {
    const qs = status ? `?status=${status}` : '';
    return request<Record<string, unknown>[]>(`/abdm/consent${qs}`);
  },

getConsentStats() {
    return request<{ approved: number; sent: number; pending: number; rejected: number }>('/abdm/consent/stats');
},

  createCareContext(data: Record<string, unknown>) {
    return request<Record<string, unknown>>('/abdm/hip/care-context', { method: 'POST', body: data });
  },

  getCareContexts(patientUserId: string) {
    return request<Record<string, unknown>[]>(`/abdm/hip/care-contexts/${patientUserId}`);
  },

  pushHealthData(data: Record<string, unknown>) {
    return request<Record<string, unknown>>('/abdm/hip/push', { method: 'POST', body: data });
  },

  requestHealthInfo(data: Record<string, unknown>) {
    return request<Record<string, unknown>>('/abdm/hiu/request', { method: 'POST', body: data });
  },

  getTransfers(requestId: string) {
    return request<Record<string, unknown>[]>(`/abdm/hiu/transfers/${requestId}`);
  },

getGatewayHealth() {
    return request<{ 
        status: 'OPERATIONAL' | 'DEGRADED' | 'DOWN'; 
        lastSync: string | null; 
        version: string; 
        uptime: string; 
    }>('/abdm/gateway/health');
},

  syncHpr() {
    return request<Record<string, unknown>>('/abdm/hpr/sync', { method: 'POST' });
  },

  searchHpr(q: string) {
    return request<Record<string, unknown>[]>(`/abdm/hpr/search?q=${encodeURIComponent(q)}`);
  },

getHprStats() {
    return request<{ 
        total: number; 
        active: number; 
        lastSyncAt: string | null; 
        growthRate: number; 
    }>('/abdm/hpr/stats');
},

  syncHfr() {
    return request<Record<string, unknown>>('/abdm/hfr/sync', { method: 'POST' });
  },

  searchHfr(q: string) {
    return request<Record<string, unknown>[]>(`/abdm/hfr/search?q=${encodeURIComponent(q)}`);
  },

getHfrStats() {
    return request<{ 
        total: number; 
        active: number; 
        lastSyncAt: string | null; 
        growthRate: number; 
    }>('/abdm/hfr/stats');
},

  // ── Provider Graph ──────────────────────────────────────────────────

  createProviderNode(data: Record<string, unknown>) {
    return request<Record<string, unknown>>('/provider-graph/nodes', { method: 'POST', body: data });
  },

  getProviderNode(id: string) {
    return request<Record<string, unknown>>(`/provider-graph/nodes/${id}`);
  },

  searchProviderGraph(params: Record<string, string | number | undefined>) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== null && v !== undefined) qs.set(k, String(v));
    }
    return request<Record<string, unknown>[]>(`/provider-graph/search?${qs.toString()}`);
  },

  traverseProviderGraph(data: { startNodeId: string; edgeTypes?: string[]; maxDepth?: number; nodeTypes?: string[] }) {
    return request<Record<string, unknown>[]>('/provider-graph/traverse', { method: 'POST', body: data });
  },

  getProviderGraphStats() {
    return request<Record<string, unknown>>('/provider-graph/stats');
  },

  bestProviderMatch(data: { patientCondition?: string; needType?: string; city?: string; insuranceId?: string }) {
    return request<Record<string, unknown>[]>('/provider-graph/best-match', { method: 'POST', body: data });
  },

  createProviderEdge(data: Record<string, unknown>) {
    return request<Record<string, unknown>>('/provider-graph/edges', { method: 'POST', body: data });
  },

  createReferral(data: Record<string, unknown>) {
    return request<Record<string, unknown>>('/provider-graph/referrals', { method: 'POST', body: data });
  },

  respondReferral(id: string, data: { status: string; notes?: string }) {
    return request<Record<string, unknown>>(`/provider-graph/referrals/${id}/respond`, { method: 'PATCH', body: data });
  },

  completeReferral(id: string) {
    return request<Record<string, unknown>>(`/provider-graph/referrals/${id}/complete`, { method: 'POST' });
  },

  listReferrals(params?: Record<string, string | undefined>) {
    const qs = new URLSearchParams();
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v) qs.set(k, v);
      }
    }
    return request<Record<string, unknown>[]>(`/provider-graph/referrals?${qs.toString()}`);
  },

  getReferralStats() {
    return request<Record<string, unknown>>('/provider-graph/referrals/stats');
  },

  recalculateScores() {
    return request<Record<string, unknown>>('/provider-graph/reputation/recalculate', { method: 'POST' });
  },

  getTopProviders(params?: Record<string, string | undefined>) {
    const qs = new URLSearchParams();
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v) qs.set(k, v);
      }
    }
    return request<Record<string, unknown>[]>(`/provider-graph/reputation/top?${qs.toString()}`);
  },

  // ── Health Graph V2 ─────────────────────────────────────────────────

  getLifestyle(userId: string) {
    return request<Record<string, unknown>>(`/health-graph-v2/lifestyle/${userId}`);
  },

  updateLifestyle(userId: string, data: Record<string, unknown>) {
    return request<Record<string, unknown>>(`/health-graph-v2/lifestyle/${userId}`, { method: 'PATCH', body: data });
  },

  getLifestyleStats() {
    return request<Record<string, unknown>>('/health-graph-v2/lifestyle/stats');
  },

  recordSymptom(userId: string, data: Record<string, unknown>) {
    return request<Record<string, unknown>>('/health-graph-v2/symptoms', { method: 'POST', body: { userId, ...data } });
  },

  listSymptoms(userId: string, days?: number) {
    const qs = days ? `?days=${days}` : '';
    return request<Record<string, unknown>[]>(`/health-graph-v2/symptoms/${userId}${qs}`);
  },

  resolveSymptom(id: string) {
    return request<Record<string, unknown>>(`/health-graph-v2/symptoms/${id}/resolve`, { method: 'POST' });
  },

  getFrequentSymptoms(userId: string) {
    return request<Record<string, unknown>[]>(`/health-graph-v2/symptoms/${userId}/frequent`);
  },

  getSymptomStats() {
    return request<Record<string, unknown>>('/health-graph-v2/symptoms/stats');
  },

  listFamilyHistory(userId: string) {
    return request<Record<string, unknown>[]>(`/health-graph-v2/family-history/${userId}`);
  },

  addFamilyHistory(userId: string, data: Record<string, unknown>) {
    return request<Record<string, unknown>>('/health-graph-v2/family-history', { method: 'POST', body: { userId, ...data } });
  },

  removeFamilyHistory(id: string) {
    return request<Record<string, unknown>>(`/health-graph-v2/family-history/${id}`, { method: 'DELETE' });
  },

  getFamilyHistoryStats() {
    return request<Record<string, unknown>>('/health-graph-v2/family-history/stats');
  },

  syncWearables(userId: string, data: { source: string; metrics: Array<Record<string, unknown>> }) {
    return request<Record<string, unknown>>(`/health-graph-v2/wearables/sync/${userId}`, { method: 'POST', body: data });
  },

  getWearableMetrics(userId: string, metricType: string, days?: number) {
    const qs = days ? `?days=${days}` : '';
    return request<Record<string, unknown>[]>(`/health-graph-v2/wearables/${userId}/${metricType}${qs}`);
  },

  getLatestWearables(userId: string) {
    return request<Record<string, unknown>>(`/health-graph-v2/wearables/${userId}/latest`);
  },

  getWearableStats() {
    return request<Record<string, unknown>>('/health-graph-v2/wearables/stats');
  },

  assessRisk(userId: string) {
    return request<Record<string, unknown>>(`/health-graph-v2/risk/assess/${userId}`, { method: 'POST' });
  },

  getRiskHistory(userId: string) {
    return request<Record<string, unknown>[]>(`/health-graph-v2/risk/history/${userId}`);
  },

  getRiskStats() {
    return request<Record<string, unknown>>('/health-graph-v2/risk/stats');
  },

  generatePreventions(userId: string) {
    return request<Record<string, unknown>>(`/health-graph-v2/prevention/generate/${userId}`, { method: 'POST' });
  },

  listPreventions(userId: string, status?: string) {
    const qs = status ? `?status=${status}` : '';
    return request<Record<string, unknown>[]>(`/health-graph-v2/prevention/${userId}${qs}`);
  },

  completePrevention(id: string) {
    return request<Record<string, unknown>>(`/health-graph-v2/prevention/${id}/complete`, { method: 'POST' });
  },

  dismissPrevention(id: string) {
    return request<Record<string, unknown>>(`/health-graph-v2/prevention/${id}/dismiss`, { method: 'POST' });
  },

  getPreventionStats() {
    return request<Record<string, unknown>>('/health-graph-v2/prevention/stats');
  },

  // ── Enterprise EHR ─────────────────────────────────────────────────

  listAllergies(patientId: string) { return request<Record<string, unknown>[]>(`/ehr/allergies/${patientId}`); },
  createAllergy(data: Record<string, unknown>) { return request<Record<string, unknown>>('/ehr/allergies', { method: 'POST', body: data }); },
  updateAllergy(id: string, data: Record<string, unknown>) { return request<Record<string, unknown>>(`/ehr/allergies/${id}`, { method: 'PATCH', body: data }); },
  deleteAllergy(id: string) { return request<void>(`/ehr/allergies/${id}`, { method: 'DELETE' }); },
  getAllergyStats() { return request<Record<string, unknown>>('/ehr/allergies/stats'); },

  listConditions(patientId: string) { return request<Record<string, unknown>[]>(`/ehr/conditions/${patientId}`); },
  createCondition(data: Record<string, unknown>) { return request<Record<string, unknown>>('/ehr/conditions', { method: 'POST', body: data }); },
  updateCondition(id: string, data: Record<string, unknown>) { return request<Record<string, unknown>>(`/ehr/conditions/${id}`, { method: 'PATCH', body: data }); },
  deleteCondition(id: string) { return request<void>(`/ehr/conditions/${id}`, { method: 'DELETE' }); },
  getConditionStats() { return request<Record<string, unknown>>('/ehr/conditions/stats'); },

  listProcedures(patientId: string) { return request<Record<string, unknown>[]>(`/ehr/procedures/${patientId}`); },
  createProcedure(data: Record<string, unknown>) { return request<Record<string, unknown>>('/ehr/procedures', { method: 'POST', body: data }); },
  getProcedureStats() { return request<Record<string, unknown>>('/ehr/procedures/stats'); },

  listImmunizations(patientId: string) { return request<Record<string, unknown>[]>(`/ehr/immunizations/${patientId}`); },
  createImmunization(data: Record<string, unknown>) { return request<Record<string, unknown>>('/ehr/immunizations', { method: 'POST', body: data }); },
  getImmunizationStats() { return request<Record<string, unknown>>('/ehr/immunizations/stats'); },

  listDocuments(patientId: string, documentType?: string) {
    const qs = documentType ? `?documentType=${documentType}` : '';
    return request<Record<string, unknown>[]>(`/ehr/documents/${patientId}${qs}`);
  },
  createDocument(data: Record<string, unknown>) { return request<Record<string, unknown>>('/ehr/documents', { method: 'POST', body: data }); },
  deleteDocument(id: string) { return request<void>(`/ehr/documents/${id}`, { method: 'DELETE' }); },
  getDocumentStats() { return request<Record<string, unknown>>('/ehr/documents/stats'); },

  listEncounters(patientId: string) { return request<Record<string, unknown>[]>(`/ehr/encounters/${patientId}`); },
  getEncounter(id: string) { return request<Record<string, unknown>>(`/ehr/encounters/detail/${id}`); },
  createEncounter(data: Record<string, unknown>) { return request<Record<string, unknown>>('/ehr/encounters', { method: 'POST', body: data }); },
  closeEncounter(id: string) { return request<Record<string, unknown>>(`/ehr/encounters/${id}/close`, { method: 'POST' }); },
  cancelEncounter(id: string) { return request<Record<string, unknown>>(`/ehr/encounters/${id}/cancel`, { method: 'POST' }); },
  getEncounterStats() { return request<Record<string, unknown>>('/ehr/encounters/stats'); },

  listOrders(patientId: string, orderType?: string) {
    const qs = orderType ? `?orderType=${orderType}` : '';
    return request<Record<string, unknown>[]>(`/ehr/orders/${patientId}${qs}`);
  },
  getOrder(id: string) { return request<Record<string, unknown>>(`/ehr/orders/detail/${id}`); },
  createOrder(data: Record<string, unknown>) { return request<Record<string, unknown>>('/ehr/orders', { method: 'POST', body: data }); },
  updateOrder(id: string, data: Record<string, unknown>) { return request<Record<string, unknown>>(`/ehr/orders/${id}`, { method: 'PATCH', body: data }); },
  getOrderStats() { return request<Record<string, unknown>>('/ehr/orders/stats'); },

  listNotes(patientId: string, noteType?: string) {
    const qs = noteType ? `?noteType=${noteType}` : '';
    return request<Record<string, unknown>[]>(`/ehr/notes/${patientId}${qs}`);
  },
  getNote(id: string) { return request<Record<string, unknown>>(`/ehr/notes/detail/${id}`); },
  createNote(data: Record<string, unknown>) { return request<Record<string, unknown>>('/ehr/notes', { method: 'POST', body: data }); },
  signNote(id: string) { return request<Record<string, unknown>>(`/ehr/notes/${id}/sign`, { method: 'POST' }); },
  getNoteStats() { return request<Record<string, unknown>>('/ehr/notes/stats'); },

  listAlerts(patientId: string, alertType?: string) {
    const qs = alertType ? `?alertType=${alertType}` : '';
    return request<Record<string, unknown>[]>(`/ehr/cds/${patientId}${qs}`);
  },
  createAlert(data: Record<string, unknown>) { return request<Record<string, unknown>>('/ehr/cds', { method: 'POST', body: data }); },
  dismissAlert(id: string, data: Record<string, unknown>) { return request<Record<string, unknown>>(`/ehr/cds/${id}/dismiss`, { method: 'POST', body: data }); },
  getAlertStats() { return request<Record<string, unknown>>('/ehr/cds/stats'); },

  getPatientTimeline(patientId: string) {
    return request<Record<string, unknown>[]>(`/ehr/timeline/${patientId}`);
  },
};

export const api = { ...baseApi, ...extendedApi };
export { request } from './api';
