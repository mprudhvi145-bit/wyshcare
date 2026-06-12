/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/clinic-reception/reception.controller.ts
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
 * HTTP controller: exposes REST endpoints for clinic-reception
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

import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { ReceptionService } from './reception.service';

@ApiTags('Clinic OS - Reception')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clinic/reception')
export class ReceptionController {
  constructor(private readonly reception: ReceptionService) {}

  @Get('schedule/:clinicId')
  @Roles('ADMIN', 'DOCTOR', 'CLINIC_MANAGER')
  @ApiOperation({ summary: 'Get today\'s schedule for a clinic' })
  getSchedule(@Param('clinicId') clinicId: string) {
    return this.reception.getTodaySchedule(clinicId);
  }

  @Post('check-in/:appointmentId')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check in a patient for their appointment' })
  checkIn(@Param('appointmentId') appointmentId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.reception.checkInAppointment(appointmentId, user.userId);
  }

  @Post('walk-in/:clinicId')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a walk-in patient' })
  registerWalkIn(
    @Param('clinicId') clinicId: string,
    @Body() data: { patientUserId: string; doctorProfileId?: string; notes?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reception.registerWalkIn(clinicId, data, user.userId);
  }

  @Get('queue/:clinicId')
  @Roles('ADMIN', 'DOCTOR', 'CLINIC_MANAGER')
  @ApiOperation({ summary: 'Get current queue for a clinic' })
  getQueue(@Param('clinicId') clinicId: string, @Query('doctorProfileId') doctorProfileId?: string) {
    return this.reception.getQueue(clinicId, doctorProfileId);
  }

  @Post('queue/prioritize/:clinicId')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'AI-prioritize the queue' })
  prioritizeQueue(@Param('clinicId') clinicId: string) {
    return this.reception.prioritizeQueue(clinicId);
  }

  @Patch('queue/call/:queueEntryId')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @ApiOperation({ summary: 'Call next patient from queue' })
  callPatient(@Param('queueEntryId') queueEntryId: string) {
    return this.reception.callPatient(queueEntryId);
  }

  @Patch('queue/complete/:queueEntryId')
  @Roles('ADMIN', 'DOCTOR', 'CLINIC_MANAGER')
  @ApiOperation({ summary: 'Complete a patient visit' })
  completeVisit(@Param('queueEntryId') queueEntryId: string) {
    return this.reception.completeVisit(queueEntryId);
  }
}
