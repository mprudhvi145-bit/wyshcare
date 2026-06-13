/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/identity/identity.controller.ts
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
 * HTTP controller: exposes REST endpoints for identity
 *
 * Responsibilities:
 * - Handle HTTP requests for identity operations
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
Identity
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

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { IdentityService } from './identity.service';

@ApiTags('identity')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('identity')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Roles('PATIENT', 'DOCTOR')
  @Get('me')
  profile(@CurrentUser() user: AuthenticatedUser) {
    return this.identityService.getProfile(user.userId);
  }

  @Roles('PATIENT', 'DOCTOR')
  @Get('dashboard')
  dashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.identityService.getDashboard(user.userId);
  }

  @Roles('PATIENT', 'DOCTOR')
  @Get('qr')
  qr(@CurrentUser() user: AuthenticatedUser, @Query('emergency') emergency?: string) {
    return this.identityService.generateQr(user.userId, emergency === 'true');
  }
}
