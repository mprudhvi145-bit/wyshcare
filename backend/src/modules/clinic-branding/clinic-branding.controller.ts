/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/clinic-branding/clinic-branding.controller.ts
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
 * HTTP controller: exposes REST endpoints for clinic-branding
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

import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ClinicBrandingService } from './clinic-branding.service';

@ApiTags('Clinic Branding')
@ApiBearerAuth()
@Controller('clinic-branding')
export class ClinicBrandingController {
  constructor(private readonly branding: ClinicBrandingService) {}

  @Get(':clinicId')
  @ApiOperation({ summary: 'Get clinic branding and templates' })
  getBranding(@Param('clinicId') clinicId: string) { return this.branding.getBranding(clinicId); }

  @Patch(':clinicId')
  @ApiOperation({ summary: 'Update clinic branding' })
  updateBranding(@Param('clinicId') clinicId: string, @Body() data: { primaryColor?: string; logoUrl?: string; faviconUrl?: string; theme?: Record<string, unknown> }) {
    return this.branding.upsertBranding(clinicId, data);
  }

  @Post(':clinicId/templates')
  @ApiOperation({ summary: 'Create custom clinic template' })
  createTemplate(@Param('clinicId') clinicId: string, @Body() data: { specialtyCode: string; name: string; description?: string; templateData: Record<string, unknown> }) {
    return this.branding.createTemplate(clinicId, data);
  }

  @Get(':clinicId/templates')
  @ApiOperation({ summary: 'Get clinic templates' })
  getTemplates(@Param('clinicId') clinicId: string, @Param('specialty') specialtyCode?: string) {
    return this.branding.getTemplates(clinicId);
  }

  @Patch('templates/:templateId')
  @ApiOperation({ summary: 'Update clinic template' })
  updateTemplate(@Param('templateId') templateId: string, @Body() data: { name?: string; description?: string; templateData?: Record<string, unknown>; isActive?: boolean }) {
    return this.branding.updateTemplate(templateId, data);
  }

  @Delete('templates/:templateId')
  @ApiOperation({ summary: 'Deactivate clinic template' })
  deleteTemplate(@Param('templateId') templateId: string) { return this.branding.deleteTemplate(templateId); }
}
