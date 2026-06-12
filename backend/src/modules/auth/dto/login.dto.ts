/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/auth/dto/login.dto.ts
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
 * Data Transfer Object: defines request/response shape for Authentication
 *
 * Responsibilities:
 * - Define request validation schema
 * - Document API contract for Authentication
 *
 * Used By:
 - backend/src/modules/provider-graph/provider-graph.controller.ts
 - backend/src/modules/abdm/abdm.controller.ts
 - backend/src/modules/specialties/specialties.controller.ts
 - backend/src/modules/interoperability/interoperability.controller.ts
 - backend/src/modules/specialties/ophthalmology/ophthalmology.controller.ts
 - backend/src/modules/consent/consent.controller.ts
 - backend/src/modules/emergency/dto/update-profile.dto.ts
 - backend/src/modules/specialties/dental/dental.controller.ts
 *
 * Calls:
 - class-validator
 - swagger
 *
 * Dependencies:
 - class-validator
 - swagger
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Authentication
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

import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export class RequestOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString()
  phoneNumber!: string;

  @ApiProperty({ example: 'LOGIN', enum: ['LOGIN', 'REGISTER', 'ACCESS_SHARE'] })
  @IsIn(['LOGIN', 'REGISTER', 'ACCESS_SHARE'])
  purpose!: 'LOGIN' | 'REGISTER' | 'ACCESS_SHARE';
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString()
  phoneNumber!: string;

  @ApiProperty({ example: '482193' })
  @IsString()
  @Length(6, 6)
  otpCode!: string;

  @ApiProperty({ example: 'iPhone 16 Pro' })
  @IsString()
  deviceName!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fullName?: string;
}

export class RefreshSessionDto {
  @ApiProperty({ example: 'refresh_token_value' })
  @IsString()
  refreshToken!: string;

  @ApiProperty({ example: 'iPhone 16 Pro', required: false })
  @IsOptional()
  @IsString()
  deviceName?: string;
}
