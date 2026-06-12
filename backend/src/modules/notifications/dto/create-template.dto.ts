/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/notifications/dto/create-template.dto.ts
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
 * Data Transfer Object: defines request/response shape for Notification
 *
 * Responsibilities:
 * - Define request validation schema
 * - Document API contract for Notification
 *
 * Used By:
 - backend/src/modules/prescription/dto/interaction-query.dto.ts
 - backend/src/modules/ehr/timeline.service.ts
 - backend/src/modules/health-graph-v2/wearables.service.ts
 - backend/src/modules/emergency/emergency.service.ts
 - backend/src/modules/ehr/cds.service.ts
 - backend/src/modules/consent/consent.service.ts
 - backend/src/modules/insurance/insurance.service.ts
 - scripts/validate-integrity.ts
 *
 * Calls:
 - client
 - class-validator
 *
 * Dependencies:
 - client
 - class-validator
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Notification
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

import { IsString, IsArray, IsOptional, IsEnum } from 'class-validator';
import { NotificationChannel } from '@prisma/client';

export class CreateTemplateDto {
  @IsString()
  key: string;

  @IsString()
  name: string;

  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels: NotificationChannel[];

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  body: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  variables?: string[];
}