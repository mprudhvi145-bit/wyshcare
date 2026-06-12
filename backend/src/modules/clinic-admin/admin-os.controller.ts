/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/clinic-admin/admin-os.controller.ts
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
 * HTTP controller: exposes REST endpoints for clinic-admin
 *
 * Responsibilities:
 * - Handle HTTP requests for admin operations
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
Admin
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

import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminOsService } from './admin-os.service';

@ApiTags('Clinic OS - Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clinic/admin')
export class AdminOsController {
  constructor(private readonly admin: AdminOsService) {}

  @Get('dashboard/:clinicId')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @ApiOperation({ summary: 'Get clinic dashboard' })
  getDashboard(@Param('clinicId') clinicId: string) {
    return this.admin.getClinicDashboard(clinicId);
  }

  @Get('branches')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List all clinic branches' })
  listBranches(@Query('tenantId') tenantId?: string) {
    return this.admin.listBranches(tenantId);
  }

  @Get('analytics/:clinicId')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @ApiOperation({ summary: 'Get operational analytics for a branch' })
  getAnalytics(@Param('clinicId') clinicId: string, @Query('days') days?: string) {
    return this.admin.getBranchAnalytics(clinicId, days ? parseInt(days) : 30);
  }

  @Get('staff/:clinicId')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @ApiOperation({ summary: 'Get staff list for a clinic' })
  getStaff(@Param('clinicId') clinicId: string) {
    return this.admin.manageStaff(clinicId);
  }

  @Patch('update/:clinicId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update clinic settings' })
  updateClinic(@Param('clinicId') clinicId: string, @Body() data: Record<string, unknown>) {
    return this.admin.updateClinic(clinicId, data);
  }
}
