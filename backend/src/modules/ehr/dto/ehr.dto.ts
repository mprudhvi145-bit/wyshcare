/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ehr/dto/ehr.dto.ts
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
 * Data Transfer Object: defines request/response shape for EHR
 *
 * Responsibilities:
 * - Define request validation schema
 * - Document API contract for EHR
 *
 * Used By:
 - backend/src/modules/ehr/timeline.service.ts
 - backend/src/modules/health-graph-v2/wearables.service.ts
 - backend/src/modules/emergency/emergency.service.ts
 - backend/src/modules/ehr/cds.service.ts
 - backend/src/modules/consent/consent.service.ts
 - backend/src/modules/insurance/insurance.service.ts
 - scripts/validate-integrity.ts
 - backend/src/modules/digital-twin/digital-twin.service.ts
 *
 * Calls:
 - client
 *
 * Dependencies:
 - client
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
EHR
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

import { EncounterClass, EncounterStatus, EncounterDiagnosisRole, ClinicalOrderType, ClinicalOrderStatus, ClinicalOrderPriority, ClinicalNoteType, CDSAlertType } from '@prisma/client';

export class CreateAllergyDto {
  patientId!: string;
  allergen!: string;
  reaction?: string;
  severity?: string;
  onsetDate?: string;
  notes?: string;
}

export class UpdateAllergyDto {
  allergen?: string;
  reaction?: string;
  severity?: string;
  onsetDate?: string;
  status?: string;
  notes?: string;
}

export class CreateConditionDto {
  patientId!: string;
  icdCode?: string;
  codeSystem?: string;
  displayName!: string;
  bodySite?: string;
  onsetDate?: string;
  resolutionDate?: string;
  status?: string;
  clinicalStatus?: string;
  severity?: string;
  notes?: string;
}

export class UpdateConditionDto {
  icdCode?: string;
  codeSystem?: string;
  displayName?: string;
  bodySite?: string;
  onsetDate?: string;
  resolutionDate?: string;
  status?: string;
  clinicalStatus?: string;
  severity?: string;
  notes?: string;
}

export class CreateProcedureDto {
  patientId!: string;
  code?: string;
  codeSystem?: string;
  displayName!: string;
  bodySite?: string;
  performedDate?: string;
  performerId?: string;
  outcome?: string;
  complications?: string;
  notes?: string;
}

export class CreateImmunizationDto {
  patientId!: string;
  vaccineName!: string;
  cvxCode?: string;
  manufacturer?: string;
  lotNumber?: string;
  doseNumber?: number;
  doseSeries?: string;
  administrationSite?: string;
  route?: string;
  administeredDate!: string;
  notes?: string;
}

export class CreateClinicalDocumentDto {
  patientId!: string;
  documentType!: string;
  title!: string;
  storageKey!: string;
  mimeType!: string;
  fileSize!: number;
  description?: string;
  tags?: string[];
  encounterId?: string;
}

export class CreateEncounterDto {
  patientId!: string;
  encounterClass!: EncounterClass;
  periodStart!: string;
  periodEnd?: string;
  reason?: string;
  reasonCode?: string;
  location?: string;
  providerId?: string;
  consultationSessionId?: string;
}

export class UpdateEncounterDto {
  encounterClass?: EncounterClass;
  status?: EncounterStatus;
  periodStart?: string;
  periodEnd?: string;
  reason?: string;
  reasonCode?: string;
  location?: string;
  providerId?: string;
}

export class CreateEncounterDiagnosisDto {
  encounterId!: string;
  conditionId!: string;
  role?: EncounterDiagnosisRole;
  rank?: number;
  notes?: string;
}

export class CreateClinicalOrderDto {
  patientId!: string;
  orderType!: ClinicalOrderType;
  priority?: ClinicalOrderPriority;
  title!: string;
  description?: string;
  orderedById!: string;
  orderDetails?: Record<string, unknown>;
  notes?: string;
}

export class UpdateClinicalOrderDto {
  status?: ClinicalOrderStatus;
  priority?: ClinicalOrderPriority;
  title?: string;
  description?: string;
  completedById?: string;
  completedAt?: string;
  resultSummary?: string;
  orderDetails?: Record<string, unknown>;
  notes?: string;
}

export class CreateClinicalNoteDto {
  patientId!: string;
  noteType!: ClinicalNoteType;
  title?: string;
  content!: Record<string, unknown>;
  authoredById!: string;
  encounterId?: string;
  parentNoteId?: string;
}

export class UpdateClinicalNoteDto {
  title?: string;
  content?: Record<string, unknown>;
  isSigned?: boolean;
  signedAt?: string;
  signedById?: string;
}

export class CreateCDSAlertDto {
  patientId!: string;
  alertType!: CDSAlertType;
  severity?: string;
  title!: string;
  description!: string;
  triggeredById?: string;
  triggeredByType?: string;
  orderId?: string;
}

export class DismissCDSAlertDto {
  dismissedById!: string;
  reason?: string;
}

export class TimelineQueryDto {
  patientId?: string;
  types?: string;
  limit?: string;
  offset?: string;
  startDate?: string;
  endDate?: string;
}
