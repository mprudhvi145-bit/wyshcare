/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/notifications/dto/send-notification.dto.ts
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

import { IsString, IsArray, IsOptional, IsIn, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class SendNotificationDto {
  @IsString()
  userId: string;

  @IsString()
  templateKey: string;

  @IsArray()
  @IsIn(['SMS', 'WHATSAPP', 'EMAIL', 'PUSH', 'VOICE', 'IN_APP'], { each: true })
  channels: ('SMS' | 'WHATSAPP' | 'EMAIL' | 'PUSH' | 'VOICE' | 'IN_APP')[];

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;

  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], { each: false })
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}