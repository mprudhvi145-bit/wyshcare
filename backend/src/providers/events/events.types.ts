/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/providers/events/events.types.ts
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
 * events.types — WyshID module
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

export const DomainEventType = {
  APPOINTMENT_BOOKED: 'appointment.booked',
  APPOINTMENT_COMPLETED: 'appointment.completed',
  APPOINTMENT_CANCELLED: 'appointment.cancelled',
  CONSULTATION_ENDED: 'consultation.ended',
  PRESCRIPTION_CREATED: 'prescription.created',
  MEDICATION_ORDERED: 'medication.ordered',
  LAB_REPORT_UPLOADED: 'lab.report.uploaded',
  LAB_ORDERED: 'lab.ordered',
  CARE_PLAN_CREATED: 'careplan.created',
  CARE_PLAN_COMPLETED: 'careplan.completed',
  HEALTH_TWIN_UPDATED: 'healthtwin.updated',
  HEALTH_SCORE_CHANGED: 'healthscore.changed',
  NOTIFICATION_SENT: 'notification.sent',
  ANALYTICS_EVENT: 'analytics.event',
  ABDM_SYNC_REQUESTED: 'abdm.sync.requested',
  ABDM_SYNC_COMPLETED: 'abdm.sync.completed',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_REFUNDED: 'payment.refunded',
  SUBSCRIPTION_CHANGED: 'subscription.changed',
  CLAIM_SUBMITTED: 'claim.submitted',
  PATIENT_REGISTERED: 'patient.registered',
  AUDIT_EVENT: 'audit.event',
  SEARCH_INDEX: 'search.index',
} as const;

export type DomainEventTypeEnum = (typeof DomainEventType)[keyof typeof DomainEventType];

export interface DomainEventPayload<T = Record<string, unknown>> {
  type: DomainEventTypeEnum;
  timestamp: string;
  correlationId: string;
  actorUserId?: string;
  patientUserId?: string;
  tenantId?: string;
  payload: T;
}

export interface AppointmentBookedPayload {
  appointmentId: string;
  patientUserId: string;
  doctorProfileId: string;
  clinicId?: string;
  slotStartAt: string;
  consultationMode: string;
  reason: string;
}

export interface ConsultationEndedPayload {
  sessionId: string;
  appointmentId: string;
  patientUserId: string;
  doctorUserId: string;
  durationMs: number;
  recordingUrl?: string;
}

export interface PrescriptionCreatedPayload {
  prescriptionId: string;
  patientUserId: string;
  doctorUserId: string;
  medicationNames: string[];
  diagnosis?: string;
}

export interface LabReportUploadedPayload {
  reportId: string;
  patientUserId: string;
  reportType: string;
  testName: string;
  isAbnormal: boolean;
}

export interface CarePlanCreatedPayload {
  carePlanId: string;
  userId: string;
  type: string;
  title: string;
}

export interface PaymentCompletedPayload {
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  purpose: string;
}

export type DomainEventPayloadMap = {
  [DomainEventType.APPOINTMENT_BOOKED]: AppointmentBookedPayload;
  [DomainEventType.APPOINTMENT_COMPLETED]: AppointmentBookedPayload;
  [DomainEventType.APPOINTMENT_CANCELLED]: AppointmentBookedPayload;
  [DomainEventType.CONSULTATION_ENDED]: ConsultationEndedPayload;
  [DomainEventType.PRESCRIPTION_CREATED]: PrescriptionCreatedPayload;
  [DomainEventType.MEDICATION_ORDERED]: Record<string, unknown>;
  [DomainEventType.LAB_REPORT_UPLOADED]: LabReportUploadedPayload;
  [DomainEventType.LAB_ORDERED]: Record<string, unknown>;
  [DomainEventType.CARE_PLAN_CREATED]: CarePlanCreatedPayload;
  [DomainEventType.CARE_PLAN_COMPLETED]: CarePlanCreatedPayload;
  [DomainEventType.HEALTH_TWIN_UPDATED]: { userId: string };
  [DomainEventType.HEALTH_SCORE_CHANGED]: { userId: string; score: number };
  [DomainEventType.NOTIFICATION_SENT]: { notificationId: string; userId: string; channel: string };
  [DomainEventType.ANALYTICS_EVENT]: Record<string, unknown>;
  [DomainEventType.ABDM_SYNC_REQUESTED]: { userId: string; action: string };
  [DomainEventType.ABDM_SYNC_COMPLETED]: { userId: string; status: string };
  [DomainEventType.PAYMENT_COMPLETED]: PaymentCompletedPayload;
  [DomainEventType.PAYMENT_REFUNDED]: PaymentCompletedPayload;
  [DomainEventType.SUBSCRIPTION_CHANGED]: { userId: string; plan: string };
  [DomainEventType.CLAIM_SUBMITTED]: { claimId: string; userId: string };
  [DomainEventType.PATIENT_REGISTERED]: { userId: string; phoneNumber: string };
  [DomainEventType.AUDIT_EVENT]: Record<string, unknown>;
  [DomainEventType.SEARCH_INDEX]: { entityType: string; entityId: string };
};
