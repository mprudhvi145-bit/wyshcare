/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/workspace/dto/workspace.dto.ts
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
 * Data Transfer Object: defines request/response shape for WyshID
 *
 * Responsibilities:
 * - Define request validation schema
 * - Document API contract for WyshID
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

export class RecordVitalsDto {
  patientId!: string;
  bpSystolic?: number;
  bpDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  spo2?: number;
  respiratoryRate?: number;
  weight?: number;
  height?: number;
  painScore?: number;
  notes?: string;
}

export class CreateMedicationAdministrationDto {
  patientId!: string;
  medicationName!: string;
  dose!: string;
  route?: string;
  scheduledTime!: string;
  medicationOrderId?: string;
}

export class AdministerMedicationDto {
  administeredTime?: string;
  status?: string;
  notes?: string;
  skippedReason?: string;
}

export class CreateCareTaskDto {
  patientId!: string;
  assignedToId!: string;
  taskType!: string;
  description!: string;
  priority?: string;
  dueAt?: string;
}

export class UpdateCareTaskDto {
  status?: string;
  completedAt?: string;
  notes?: string;
}

export class CreateShiftHandoverDto {
  fromUserId!: string;
  toUserId!: string;
  ward?: string;
  patientCount?: number;
  notes!: string;
  criticalAlerts?: string;
}

export class CreateLabSampleDto {
  diagnosticOrderId!: string;
  sampleType!: string;
  collectedById?: string;
  collectionDate?: string;
}

export class UpdateLabSampleDto {
  status?: string;
  receivedDate?: string;
  rejectionReason?: string;
  notes?: string;
}

export class CreateLabResultDto {
  diagnosticOrderId!: string;
  testName!: string;
  result!: string;
  unit?: string;
  referenceRange?: string;
  isAbnormal?: boolean;
  notes?: string;
}

export class ApproveLabResultDto {
  approvedById!: string;
}

export class CreateDispensingRecordDto {
  prescriptionId?: string;
  patientId!: string;
  medicationName!: string;
  quantityDispensed!: number;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}

export class CreateProcurementOrderDto {
  pharmacyId!: string;
  supplier!: string;
  items!: Record<string, unknown>;
  totalCost?: number;
  notes?: string;
}

export class RoleInfoDto {
  userId!: string;
}
