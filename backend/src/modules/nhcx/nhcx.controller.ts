/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/nhcx/nhcx.controller.ts
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
 * HTTP controller: exposes REST endpoints for nhcx
 *
 * Responsibilities:
 * - Handle HTTP requests for wyshid operations
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
WyshID
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

import { Controller, Get, Post, Param, Body, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { NHCXService } from './nhcx.service';

@ApiTags('NHCX')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('nhcx')
export class NHCXController {
  constructor(private readonly nhcx: NHCXService) {}

  @Post('providers/:providerId/configure')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Configure NHCX for an insurance provider' })
  async configure(
    @Param('providerId') providerId: string,
    @Body() body: { insurerId: string; apiEndpoint: string; clientId: string; clientSecret: string; webhookSecret?: string },
  ) {
    return this.nhcx.configure({ providerId, ...body });
  }

  @Get('providers/:providerId/configuration')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get NHCX configuration for a provider' })
  getConfiguration(@Param('providerId') providerId: string) {
    return this.nhcx.getConfiguration(providerId);
  }

  @Post('claims/:claimId/submit')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @ApiOperation({ summary: 'Submit claim via NHCX gateway' })
  async submitClaim(@Param('claimId') claimId: string) {
    return this.nhcx.submitClaim(claimId);
  }

  @Post('submissions/:submissionId/acknowledge')
  @Roles('ADMIN', 'SYSTEM')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Acknowledge NHCX submission outcome' })
  async acknowledge(
    @Param('submissionId') submissionId: string,
    @Body() body: { outcome: string; notes?: string },
  ) {
    return this.nhcx.acknowledgeSubmission(submissionId, body.outcome, body.notes);
  }

  @Post('submissions/:submissionId/sync')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync NHCX submission status' })
  async syncStatus(@Param('submissionId') submissionId: string) {
    return this.nhcx.syncStatus(submissionId);
  }

  @Get('stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'NHCX dashboard statistics' })
  async getStats() {
    return this.nhcx.getStats();
  }

  @Get('submissions')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List NHCX submissions' })
  async getSubmissions(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
  ) {
    return this.nhcx.getSubmissions({ status, limit: limit ? parseInt(limit, 10) : undefined });
  }
}
