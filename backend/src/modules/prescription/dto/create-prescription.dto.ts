/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/prescription/dto/create-prescription.dto.ts
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
 * Data Transfer Object: defines request/response shape for Prescription
 *
 * Responsibilities:
 * - Define request validation schema
 * - Document API contract for Prescription
 *
 * Used By:
 - backend/src/modules/auth/dto/admin-auth.dto.ts
 - backend/src/modules/prescription/dto/interaction-query.dto.ts
 - backend/src/modules/telemedicine/dto/create-appointment.dto.ts
 - backend/src/modules/notifications/dto/create-template.dto.ts
 - backend/src/modules/emergency/dto/update-profile.dto.ts
 - backend/src/modules/ai-risk/dto/assess-risk.dto.ts
 - backend/src/modules/emergency/dto/create-emergency-contact.dto.ts
 - backend/src/modules/specialties/shared/dto/specialty.dto.ts
 *
 * Calls:
 - class-validator
 - class-transformer
 *
 * Dependencies:
 - class-validator
 - class-transformer
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Prescription
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

import { IsArray, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePrescriptionItemDto {
  @IsOptional()
  @IsString()
  drugId?: string;

  @IsString()
  drugName!: string;

  @IsString()
  dosage!: string;

  @IsString()
  frequency!: string;

  @IsOptional()
  @IsString()
  route?: string;

  @Min(1)
  durationDays!: number;

  @IsOptional()
  @IsString()
  instructions?: string;

  @Min(1)
  quantity!: number;

  @IsOptional()
  refills?: number;

  @IsOptional()
  substitutionAllowed?: boolean;
}

export class DiagnosisDto {
  @IsString()
  code!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  type?: 'primary' | 'comorbidity' | 'rule_out';
}

export class CreatePrescriptionDto {
  @IsString()
  patientUserId!: string;

  @IsOptional()
  @IsString()
  doctorProfileId?: string;

  @IsOptional()
  @IsString()
  consultationId?: string;

  @IsOptional()
  @IsString()
  appointmentId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiagnosisDto)
  diagnosis?: DiagnosisDto[];

  @IsOptional()
  @IsString()
  diagnosisSummary?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePrescriptionItemDto)
  items!: CreatePrescriptionItemDto[];
}

export class IssuePrescriptionDto {
  @IsOptional()
  @IsString()
  pharmacyPartnerId?: string;

  @IsOptional()
  sendToPharmacy?: boolean;
}
