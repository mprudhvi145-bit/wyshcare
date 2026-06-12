/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/types/index.ts
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
 * Barrel export file for types
 *
 * Responsibilities:
 * - Support wyshid functionality
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

// Auth
export interface User {
  id: string; wyshId: string; fullName: string; phoneNumber?: string;
  email?: string; bloodGroup?: string; preferredLanguage?: string;
  chronicConditions?: string[]; allergiesSummary?: string[]; roles: string[];
}

export interface AuthResponse {
  accessToken: string; refreshToken: string; expiresIn: number; user: User;
}

// Insurance
export type InsuranceProviderType = 'GOVT' | 'PRIVATE' | 'TPA';
export type PolicyStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
export type ClaimStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'ADJUDICATED' | 'APPROVED' | 'PARTIALLY_APPROVED' | 'REJECTED' | 'CANCELLED' | 'APPEALED';
export type PreAuthStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'PARTIALLY_APPROVED' | 'REJECTED' | 'EXPIRED';
export type SettlementStatus = 'PENDING' | 'PROCESSED' | 'FAILED' | 'COMPLETED';
export type CoverageType = 'ROOM' | 'CONSULTATION' | 'MEDICATION' | 'LAB_TEST' | 'PROCEDURE' | 'VACCINATION' | 'DENTAL' | 'VISION' | 'MATERNITY' | 'AMBULANCE' | 'PRE_EXISTING' | 'OTHER';
export type ClaimDocumentType = 'PRESCRIPTION' | 'DISCHARGE_SUMMARY' | 'INVESTIGATION_REPORT' | 'INVOICE' | 'PAYMENT_RECEIPT' | 'ID_PROOF' | 'POLICY_DOCUMENT' | 'CONSENT_FORM' | 'OTHER';

export interface InsuranceProvider {
  id: string; name: string; code: string; type: InsuranceProviderType;
  logoUrl?: string; phone?: string; email?: string; website?: string; isActive: boolean;
  createdAt: string; plans?: InsurancePlan[];
}

export interface InsurancePlan {
  id: string; providerId: string; name: string; code: string;
  type: string; description?: string; maxSumInsured: number;
  isActive: boolean; provider?: InsuranceProvider;
}

export interface InsurancePolicy {
  id: string; patientUserId: string; planId: string; policyNumber: string;
  memberId: string; sumInsured: number; copayPercent: number;
  deductible: number; coveragePercent: number; startDate: string;
  endDate: string; status: PolicyStatus; metadata?: any;
  createdAt: string; plan?: InsurancePlan; provider?: InsuranceProvider;
}

export interface CoverageRule {
  id: string; planId: string; category: CoverageType;
  coveragePercent: number; maxAmount?: number; requiresPreAuth: boolean;
  waitingPeriod?: number; isActive: boolean; plan?: InsurancePlan;
}

export interface EligibilityCheck {
  id: string; policyId: string; patientUserId: string; category: CoverageType;
  isEligible: boolean; coveragePercent: number; copayAmount: number;
  deductibleRemaining: number; maxCoverage: number; checkedAt: string;
  policy?: InsurancePolicy;
}

export interface PreAuthorization {
  id: string; policyId: string; clinicId: string; patientUserId: string;
  doctorId?: string; procedureCode?: string; diagnosisCode?: string;
  requestedAmount: number; approvedAmount?: number; status: PreAuthStatus;
  reviewerNotes?: string; respondedAt?: string; expiresAt: string;
  createdAt: string; policy?: InsurancePolicy;
}

export interface ClaimLineItem {
  id: string; claimId: string; description: string; category: CoverageType;
  claimedAmount: number; approvedAmount?: number; notes?: string;
}

export interface ClaimDocument {
  id: string; claimId: string; documentType: ClaimDocumentType;
  fileName: string; storageKey: string; fileSize?: number; uploadedAt: string;
}

export interface Claim {
  id: string; policyId: string; clinicId: string; patientUserId: string;
  invoiceId?: string; preAuthorizationId?: string; claimNumber: string;
  totalAmount: number; claimedAmount: number; approvedAmount?: number;
  status: ClaimStatus; submissionDate?: string; adjudicationDate?: string;
  notes?: string; createdAt: string; policy?: InsurancePolicy;
  items?: ClaimLineItem[]; documents?: ClaimDocument[]; settlement?: Settlement;
}

export interface Settlement {
  id: string; claimId: string; amount: number; date: string;
  method: string; reference?: string; status: SettlementStatus;
  notes?: string; processedAt?: string;
}

export interface ClaimAnalysis {
  completeness: number; risk: 'HIGH' | 'MEDIUM' | 'LOW';
  issues: string[]; warnings: string[]; recommendations: string[];
}

export interface DenialRisk {
  denialRisk: 'HIGH' | 'MEDIUM' | 'LOW'; riskScore: number;
  factors: { factor: string; score: number }[]; recommendation: string;
}

// Clinic
export type InvoiceStatus = 'DRAFT' | 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'REFUNDED' | 'CANCELLED';
export type BillingCategory = 'CONSULTATION' | 'MEDICATION' | 'LAB_TEST' | 'PROCEDURE' | 'VACCINATION' | 'OTHER';
export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type QueueStatus = 'WAITING' | 'WITH_DOCTOR' | 'COMPLETED' | 'SKIPPED';

export interface BillingInvoice {
  id: string; clinicId: string; patientUserId: string; appointmentId?: string;
  invoiceNumber: string; status: InvoiceStatus; subtotal: number;
  taxAmount: number; discountAmount: number; totalAmount: number;
  paidAmount: number; dueAmount: number; notes?: string;
  issuedAt?: string; paidAt?: string; items: BillingItem[];
}

export interface BillingItem {
  id: string; invoiceId: string; description: string; category: BillingCategory;
  quantity: number; unitPrice: number; totalPrice: number;
  taxPercent: number; taxAmount: number; netPrice: number;
  referenceId?: string; referenceType?: string;
}

export interface QueueEntry {
  id: string; clinicId: string; patientUserId: string; appointmentId?: string;
  status: QueueStatus; priority: number; severity?: string;
  checkedInAt: string; calledAt?: string; completedAt?: string;
}

export interface Appointment {
  id: string; patientUserId: string; doctorId: string; clinicId?: string;
  consultationMode: string; reason: string; slotStartAt: string;
  slotEndAt?: string; status: AppointmentStatus;
  doctorProfile?: { id: string; specialization: string; user: { fullName: string } };
}

// Common
export interface PaginatedResponse<T> {
  data: T[]; total: number; page: number; limit: number;
}

export interface DashboardData {
  upcomingAppointments: Appointment[]; activePrescriptions: number;
  insuranceStatus: string; recentReports: number; healthScore: number;
}

export interface WyshTask {
  id: string;
  type: 'medication' | 'appointment' | 'report' | 'pre_auth' | 'claim';
  title: string;
  description: string;
  actionUrl?: string;
  urgent: boolean;
}

export interface WyshAppointment {
  id: string; doctorName: string; clinicName?: string;
  startAt: string; status: string; consultationMode: string; reason: string;
}

export interface WyshMedication {
  id: string; name: string; dosage: string | null; frequency: string | null;
}

export interface WyshInsurance {
  provider: string; plan: string; planType: string; policyNumber: string;
  sumInsured: number; endDate: string; status: string;
}

export interface WyshClaim {
  id: string; claimNumber: string; totalAmount: number; claimedAmount: number;
  approvedAmount: number | null; status: string; createdAt: string;
}

export interface WyshPreAuth {
  id: string; procedureCode: string | null; diagnosisCode: string | null;
  requestedAmount: number; status: string; submittedAt: string; expiresAt?: string;
}

export interface WyshFamilyAlert {
  id: string; memberName: string; title: string; severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface WyshDashboardData {
  greeting: string;
  user: { name: string; wyshId: string; gender: string | null; bloodGroup: string | null; conditions: string[]; allergies: string[] };
  healthScore: { score: number; label: string; color: string };
  todayTasks: WyshTask[];
  upcomingAppointments: WyshAppointment[];
  activeMedications: WyshMedication[];
  insurance: WyshInsurance | null;
  pendingClaims: WyshClaim[];
  pendingPreAuths: WyshPreAuth[];
  familyAlerts: WyshFamilyAlert[];
  recentReports: Array<{ id: string; title: string; type: string; date: string }>;
  aiInsight: { message: string; type: string };
}

export interface NHCXMetrics {
  totalClaimsSent: number;
  claimsThisMonth: number;
  successRate: number;
  failureRate: number;
  byStatus: Record<string, number>;
}

export interface NHCXSubmission {
  id: string;
  submissionRef: string | null;
  status: string;
  submittedAt: string;
  acknowledgedAt: string | null;
  syncedAt: string | null;
  errorMessage: string | null;
  claim: { claimNumber: string; claimedAmount: number; status: string };
  logs: Array<{ id: string; event: string; level: string; message: string; createdAt: string }>;
}

export interface NHCXConfiguration {
  id: string;
  providerId: string;
  insurerId: string;
  apiEndpoint: string;
  clientId: string;
  isActive: boolean;
}

// Health Score
export interface HealthScoreFactor {
  name: string;
  impact: number;
  category: string;
}

export interface HealthScoreResponse {
  score: number;
  label: string;
  trend: 'up' | 'down' | 'stable';
  factors: HealthScoreFactor[];
}

export interface HealthScoreHistoryResponse {
  history: Array<{ date: string; score: number }>;
}

export interface HealthScoreFactorsResponse {
  factors: HealthScoreFactor[];
}

// Timeline
export interface TimelineParams {
  limit?: number;
  offset?: number;
  type?: string;
  from?: string;
  to?: string;
}

export interface TimelineResponse {
  events: TimelineEvent[];
  total: number;
}

export interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  summary: string;
  occurredAt: string;
  metadata?: Record<string, unknown>;
}

// Telemedicine
export interface AppointmentParams {
  status?: string;
  from?: string;
  to?: string;
}

export interface AppointmentResponse {
  appointments: Appointment[];
  total: number;
}

export interface CreateAppointmentDto {
  doctorProfileId: string;
  consultationMode: 'VIDEO' | 'AUDIO' | 'CHAT' | 'IN_PERSON';
  reason: string;
  slotStartAt: string;
  slotEndAt?: string;
}

export interface RescheduleDto {
  slotStartAt: string;
  slotEndAt?: string;
  reason?: string;
}

export interface DoctorSearchParams {
  query?: string;
  specialty?: string;
  page?: number;
  limit?: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  consultationFee: number;
  telemedicineAvailable: boolean;
  experience?: number;
  hospital?: string;
  city?: string;
  availableSlots?: string[];
}

export interface DoctorResponse {
  doctors: Doctor[];
  total: number;
}

// Emergency
export interface EmergencyProfileResponse {
  id: string;
  fullName: string;
  bloodGroup?: string;
  chronicConditions: string[];
  allergies: string[];
  emergencyContacts: EmergencyContact[];
  medications: string[];
}

export interface EmergencyQRResponse {
  payload: Record<string, unknown>;
  qrDataUrl: string;
}

export interface GrantEmergencyAccessDto {
  granteePhoneNumber: string;
  granteeFullName: string;
  accessDurationHours: number;
  scope?: string[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  relationship: string;
  isNotified: boolean;
}

export interface CreateEmergencyContactDto {
  name: string;
  phoneNumber: string;
  relationship: string;
}

// AI Health Insights
export interface RiskPrediction {
  condition: string;
  probability: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  trend: 'increasing' | 'stable' | 'decreasing';
  factors: string[];
}

export interface RiskPredictionResponse {
  risks: RiskPrediction[];
  overallRisk: string;
}

export interface PreventiveRecommendation {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'DISMISSED';
  category: string;
}

export interface LifestyleMetric {
  category: string;
  value: number;
  target: number;
  unit: string;
  status: 'good' | 'average' | 'poor';
}

export interface LifestyleResponse {
  metrics: LifestyleMetric[];
  score: number;
}

export interface WearableMetric {
  type: string;
  value: number;
  unit: string;
  recordedAt: string;
  source: string;
}

export interface WearableResponse {
  sources: string[];
  metrics: WearableMetric[];
}

export interface AiRecommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

export interface TwinScoreResponse {
  score: number;
  components: Array<{ name: string; score: number; maxScore: number }>;
  lastUpdated: string;
}

// Goals
export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  progress: number;
  category: string;
  milestones: Milestone[];
  createdAt: string;
}

export interface CreateGoalDto {
  title: string;
  description?: string;
  targetDate?: string;
  category: string;
}

export interface UpdateGoalProgressDto {
  progress: number;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface CreateMilestoneDto {
  title: string;
}

// EMR
export interface PatientChartResponse {
  patient: { id: string; fullName: string; age: number; gender: string; bloodGroup?: string };
  conditions: unknown[];
  allergies: unknown[];
  medications: unknown[];
  encounters: unknown[];
  vitals: unknown[];
}

export interface SoapNote {
  id: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  createdAt: string;
  provider: { fullName: string };
}

export interface SaveSoapDto {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  encounterId?: string;
}

export interface InteractionResult {
  severity: 'NONE' | 'MILD' | 'MODERATE' | 'SEVERE';
  description: string;
  medications: string[];
}

export interface AllergyCheckResult {
  hasAllergy: boolean;
  severity?: string;
  reactions: string[];
  recommendation: string;
}

export interface DifferentialDiagnosis {
  condition: string;
  probability: number;
  supportingEvidence: string[];
  differential: string[];
}

export interface Guideline {
  id: string;
  title: string;
  summary: string;
  specialty: string;
  source: string;
}

// Family
export interface FamilyMember {
  id: string;
  relationship: string;
  fullName: string;
  phoneNumber: string;
  wyshId: string;
}

export interface InviteFamilyDto {
  phoneNumber: string;
  fullName: string;
  relationship: 'PARENT' | 'CHILD' | 'SPOUSE' | 'CAREGIVER' | 'SIBLING' | 'GUARDIAN';
}

// Consent
export interface Consent {
  id: string;
  accessLevel: string;
  accessMethod: string;
  purpose: string;
  status: string;
  expiresAt: string;
  grantedToUser?: { fullName?: string | null } | null;
  shareUrl?: string;
  createdAt: string;
}

export interface CreateConsentDto {
  granteeWyshId?: string;
  granteePhoneNumber?: string;
  accessLevel: 'FULL' | 'LIMITED' | 'EMERGENCY';
  accessMethod: 'MANUAL_APPROVAL' | 'OTP_APPROVAL' | 'SHARE_LINK';
  purpose: string;
  scope: Record<string, unknown>;
  expiresAt: string;
}

// Notifications
export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

// Identity
export interface UserProfile {
  id: string;
  wyshId: string;
  phoneNumber: string;
  fullName: string;
  preferredLanguage: string;
  bloodGroup?: string | null;
  chronicConditions: string[];
  allergiesSummary: string[];
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  avatarUrl?: string;
}

// Auth
export interface LoginDto {
  phoneNumber: string;
  password?: string;
}
