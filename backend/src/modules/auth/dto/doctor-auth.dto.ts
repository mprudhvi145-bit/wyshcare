/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/auth/dto/doctor-auth.dto.ts
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
import { IsEmail, IsIn, IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator';

export class DoctorOtpRequestDto {
  @ApiProperty({ example: '+919876543210', required: false })
  @IsOptional()
  @IsPhoneNumber('IN')
  phoneNumber?: string;

  @ApiProperty({ example: 'doctor@wyshcare.app', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'SMS', enum: ['SMS', 'EMAIL'] })
  @IsIn(['SMS', 'EMAIL'])
  channel!: 'SMS' | 'EMAIL';
}

export class DoctorOtpVerifyDto {
  @ApiProperty({ example: '+919876543210', required: false })
  @IsOptional()
  @IsPhoneNumber('IN')
  phoneNumber?: string;

  @ApiProperty({ example: 'doctor@wyshcare.app', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '482193' })
  @IsString()
  @Length(6, 6)
  otpCode!: string;

  @ApiProperty({ example: 'iPhone 16 Pro' })
  @IsString()
  deviceName!: string;
}
