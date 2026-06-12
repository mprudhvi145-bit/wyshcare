/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/auth/admin-auth.controller.ts
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

import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { AdminAuthService } from './admin-auth.service';
import {
  AdminCreateCredentialDto,
  AdminLoginDto,
  AdminMfaDisableDto,
  AdminMfaSetupDto,
  AdminMfaVerifyDto,
} from './dto/admin-auth.dto';

@ApiTags('auth')
@Controller('auth/admin')
export class AdminAuthController {
  constructor(private readonly adminAuth: AdminAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() input: AdminLoginDto) {
    return this.adminAuth.login(input.email, input.password);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post('mfa/setup')
  @HttpCode(HttpStatus.OK)
  setupMfa(@CurrentUser() user: AuthenticatedUser, @Body() input: AdminMfaSetupDto) {
    return this.adminAuth.setupMfa(user.userId, input.password);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  verifyMfa(@CurrentUser() user: AuthenticatedUser, @Body() input: AdminMfaVerifyDto) {
    return this.adminAuth.verifyMfa(user.userId, input.totpCode);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post('mfa/disable')
  @HttpCode(HttpStatus.OK)
  disableMfa(@CurrentUser() user: AuthenticatedUser, @Body() input: AdminMfaDisableDto) {
    return this.adminAuth.disableMfa(user.userId, input.password);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Post('credentials')
  @HttpCode(HttpStatus.CREATED)
  createCredential(@Body() input: AdminCreateCredentialDto) {
    return this.adminAuth.createCredential(input.email, input.password, input.userId);
  }
}
