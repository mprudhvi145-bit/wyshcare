/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/auth/auth.module.ts
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
 * NestJS module: wires providers, controllers, and imports for auth
 *
 * Responsibilities:
 * - Configure dependency injection for auth
 * - Register controllers, services, and providers
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
 - jwt
 - common
 *
 * Dependencies:
 - jwt
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

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuditLogService } from '../../common/services/audit-log.service';
import { PrismaModule } from '../../providers/prisma/prisma.module';
import { RedisService } from '../../providers/redis/redis.service';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DoctorAuthController } from './doctor-auth.controller';
import { DoctorAuthService } from './doctor-auth.service';
import { EmailService } from './email.service';
import { MfaService } from './mfa.service';
import { SmsService } from './sms.service';
import { WyshIdService } from '../../common/services/wysh-id.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    PrismaModule,
  ],
  controllers: [AuthController, AdminAuthController, DoctorAuthController],
  providers: [
    AuthService, AdminAuthService, DoctorAuthService,
    AuditLogService, EmailService, SmsService, WyshIdService,
    MfaService, RedisService,
  ],
  exports: [AuthService, MfaService, SmsService],
})
export class AuthModule {}
