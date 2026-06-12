/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/auth/doctor-auth.controller.ts
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
 * HTTP controller: exposes REST endpoints for auth
 *
 * Responsibilities:
 * - Handle HTTP requests for authentication operations
 * - Validate and transform request/response payloads
 * - Delegate business logic to service layer
 *
 * Used By:
 - backend/src/modules/prescription/prescription.service.ts
 - backend/src/providers/storage/storage.module.ts
 - backend/src/modules/abdm/abdm.module.ts
 - backend/src/modules/prescription/interaction-engine.service.ts
 - backend/src/modules/interoperability/interoperability.module.ts
 - backend/src/modules/digital-twin/digital-twin.service.ts
 - backend/src/main.ts
 - backend/src/modules/health-graph/health-graph.service.ts
 *
 * Calls:
 - swagger
 - common
 *
 * Dependencies:
 - swagger
 - common
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

import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { DoctorAuthService } from './doctor-auth.service';
import { DoctorOtpRequestDto, DoctorOtpVerifyDto } from './dto/doctor-auth.dto';

@ApiTags('auth')
@Controller('auth/doctor')
export class DoctorAuthController {
  constructor(private readonly doctorAuth: DoctorAuthService) {}

  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  requestOtp(@Body() input: DoctorOtpRequestDto) {
    return this.doctorAuth.requestOtp({
      phoneNumber: input.phoneNumber,
      email: input.email,
      channel: input.channel,
    });
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() input: DoctorOtpVerifyDto) {
    return this.doctorAuth.verifyOtp({
      phoneNumber: input.phoneNumber,
      email: input.email,
      otpCode: input.otpCode,
      deviceName: input.deviceName,
    });
  }
}
