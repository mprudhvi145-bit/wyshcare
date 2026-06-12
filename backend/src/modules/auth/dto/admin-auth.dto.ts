/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/auth/dto/admin-auth.dto.ts
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
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@wyshcare.app' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsString()
  @Length(8, 128)
  password!: string;
}

export class AdminMfaSetupDto {
  @ApiProperty({ example: 'password' })
  @IsString()
  password!: string;
}

export class AdminMfaVerifyDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  totpCode!: string;
}

export class AdminMfaDisableDto {
  @ApiProperty({ example: 'password' })
  @IsString()
  password!: string;
}

export class AdminCreateCredentialDto {
  @ApiProperty({ example: 'admin@wyshcare.app' })
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @Length(8, 128)
  password!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId?: string;
}
