/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/clinical-twin/clinical-twin.controller.ts
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
 * HTTP controller: exposes REST endpoints for clinical-twin
 *
 * Responsibilities:
 * - Handle HTTP requests for clinical operations
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
Clinical
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

import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ClinicalTwinService } from './clinical-twin.service';

@ApiTags('Clinic OS - Clinical Twin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clinic/twin')
export class ClinicalTwinController {
  constructor(private readonly twin: ClinicalTwinService) {}

  @Get(':clinicId')
  @Roles('ADMIN', 'CLINIC_MANAGER', 'DOCTOR')
  @ApiOperation({ summary: 'Get AI-powered clinic twin snapshot' })
  getClinicTwin(@Param('clinicId') clinicId: string) {
    return this.twin.getClinicTwin(clinicId);
  }

  @Get(':clinicId/funnel')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @ApiOperation({ summary: 'Get patient funnel conversion data' })
  getFunnel(@Param('clinicId') clinicId: string, @Query('days') days?: string) {
    return this.twin.getPatientFunnel(clinicId, days ? parseInt(days) : 30);
  }

  @Get(':clinicId/disease-trends')
  @Roles('ADMIN', 'CLINIC_MANAGER', 'DOCTOR')
  @ApiOperation({ summary: 'Get disease prevalence trends' })
  getDiseaseTrends(@Param('clinicId') clinicId: string, @Query('days') days?: string) {
    return this.twin.getDiseaseTrends(clinicId, days ? parseInt(days) : 90);
  }
}
