/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/prescription/dto/update-prescription.dto.ts
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
 - backend/src/modules/notifications/dto/create-template.dto.ts
 - backend/src/modules/ai-preventive/dto/generate-preventive-recommendations.dto.ts
 - backend/src/modules/notifications/dto/send-notification.dto.ts
 - backend/src/modules/prescription/dto/create-prescription.dto.ts
 - backend/src/modules/emergency/dto/create-emergency-contact.dto.ts
 - backend/src/modules/ai-risk/dto/assess-risk.dto.ts
 - backend/src/modules/emergency/dto/update-emergency-contact.dto.ts
 - backend/src/modules/emergency/dto/grant-access.dto.ts
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

import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePrescriptionItemDto } from './create-prescription.dto';

export class UpdatePrescriptionDto {
  @IsOptional()
  @IsString()
  diagnosisSummary?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePrescriptionItemDto)
  items?: CreatePrescriptionItemDto[];
}

export class UpdatePrescriptionStatusDto {
  @IsString()
  status!: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
}
