/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/prescription/prescription.controller.ts
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
 * HTTP controller: exposes REST endpoints for prescription
 *
 * Responsibilities:
 * - Handle HTTP requests for prescription operations
 * - Validate and transform request/response payloads
 * - Delegate business logic to service layer
 *
 * Used By:
 - backend/src/modules/prescription/prescription.service.ts
 - backend/src/modules/timeline/timeline.controller.ts
 - backend/src/modules/prescription/interaction-engine.service.ts
 - backend/src/modules/digital-twin/digital-twin.service.ts
 - backend/src/main.ts
 - backend/src/modules/health-graph/health-graph.service.ts
 - backend/src/modules/search/search.controller.ts
 - backend/src/modules/consent/consent.controller.ts
 *
 * Calls:
 - swagger
 *
 * Dependencies:
 - swagger
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Prescription
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

import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards, HttpStatus, HttpCode,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { PrescriptionService } from './prescription.service';
import { InteractionEngineService } from './interaction-engine.service';
import {
  CreatePrescriptionDto,
  IssuePrescriptionDto,
  UpdatePrescriptionDto,
  CheckInteractionsDto,
  CheckDuplicateTherapyDto,
} from './dto';

@ApiTags('Prescription')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('prescriptions')
export class PrescriptionController {
  constructor(
    private readonly prescriptionService: PrescriptionService,
    private readonly interactionEngine: InteractionEngineService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Roles('DOCTOR', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new prescription (draft)' })
  async create(@Body() dto: CreatePrescriptionDto, @CurrentUser() user: { userId: string; tenantId?: string }) {
    return this.prescriptionService.create(dto, user.userId, user.tenantId);
  }

  @Patch(':id/issue')
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Issue a draft prescription (sign + activate)' })
  async issue(
    @Param('id') id: string,
    @Body() dto: IssuePrescriptionDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.prescriptionService.issue(id, dto, user.userId);
  }

  @Patch(':id')
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Update a draft prescription' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePrescriptionDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.prescriptionService.update(id, dto, user.userId);
  }

  @Patch(':id/cancel')
  @Roles('DOCTOR', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a prescription' })
  async cancel(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.prescriptionService.cancel(id, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'List prescriptions (by patient or doctor)' })
  async list(
    @Query('patientUserId') patientUserId?: string,
    @Query('doctorProfileId') doctorProfileId?: string,
    @Query('status') status?: string,
  ) {
    if (patientUserId) return this.prescriptionService.getByPatient(patientUserId, status);
    if (doctorProfileId) return this.prescriptionService.getByDoctor(doctorProfileId, status);
    return [];
  }

  @Get('drugs')
  @ApiOperation({ summary: 'Search medication database' })
  async searchDrugs(@Query('q') q: string) {
    if (!q || q.length < 2) return [];
    return this.prisma.drug.findMany({
      where: {
        OR: [
          { genericName: { contains: q, mode: 'insensitive' } },
          { brandNames: { has: q } },
          { atcCode: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { genericName: 'asc' },
    });
  }

  @Post('drugs')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Add drug to medication database' })
  async addDrug(@Body() dto: Record<string, unknown>) {
    return this.prisma.drug.create({ data: dto as any });
  }

  @Post('drugs/bulk')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Bulk import drugs' })
  async bulkImportDrugs(@Body() dto: { drugs: Record<string, unknown>[] }) {
    let imported = 0;
    let skipped = 0;
    for (const drug of dto.drugs) {
      try {
        await this.prisma.drug.create({ data: drug as any });
        imported++;
      } catch {
        skipped++;
      }
    }
    return { imported, skipped };
  }

  @Get('adherence/report/:patientUserId')
  @ApiOperation({ summary: 'Get adherence report for a patient' })
  async adherenceReport(
    @Param('patientUserId') patientUserId: string,
    @Query('days') days?: string,
  ) {
    return this.prescriptionService.getAdherenceReport(patientUserId, days ? parseInt(days) : 30);
  }

  @Get('consultation/:consultationId')
  @ApiOperation({ summary: 'Get prescriptions for a consultation' })
  async getByConsultation(@Param('consultationId') consultationId: string) {
    return this.prescriptionService.getByConsultation(consultationId);
  }

  @Get('verify/qr/:qrHash')
  @ApiOperation({ summary: 'Verify a prescription by QR hash' })
  async verifyQr(@Param('qrHash') qrHash: string) {
    return this.prescriptionService.verifyQr(qrHash);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Generate prescription PDF (returns HTML)' })
  async generatePdf(@Param('id') id: string) {
    const html = await this.prescriptionService.generatePdf(id);
    return { html, prescriptionId: id };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get prescription by ID' })
  async getById(@Param('id') id: string) {
    return this.prescriptionService.getById(id);
  }

  @Post('check-interactions')
  @Roles('DOCTOR', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Check drug-drug interactions' })
  async checkInteractions(@Body() dto: CheckInteractionsDto) {
    if (dto.patientUserId) {
      return this.interactionEngine.checkPatientDrugs(dto.patientUserId, dto.drugIds);
    }
    return { interactions: await this.interactionEngine.checkInteractions(dto.drugIds) };
  }

  @Post('check-duplicate-therapy')
  @Roles('DOCTOR', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Check for duplicate therapy' })
  async checkDuplicateTherapy(@Body() dto: CheckDuplicateTherapyDto) {
    return this.interactionEngine.checkDuplicateTherapy(dto.drugIds);
  }

  @Post(':id/send-to-pharmacy/:pharmacyPartnerId')
  @Roles('DOCTOR', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send an issued prescription to a pharmacy partner' })
  async sendToPharmacy(
    @Param('id') id: string,
    @Param('pharmacyPartnerId') pharmacyPartnerId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.prescriptionService.sendToPharmacy(id, pharmacyPartnerId, user.userId);
  }

  @Post(':id/issue-and-send')
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Issue prescription and send to pharmacy' })
  async issueAndSend(
    @Param('id') id: string,
    @Body() dto: IssuePrescriptionDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.prescriptionService.issue(id, { ...dto, sendToPharmacy: true }, user.userId);
  }

  @Post(':id/schedules')
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Create medication schedules from prescription' })
  async createSchedules(@Param('id') id: string) {
    return this.prescriptionService.createSchedule(id);
  }

  @Post(':id/schedules/:scheduleId/log')
  @Roles('PATIENT', 'DOCTOR')
  @ApiOperation({ summary: 'Log medication adherence' })
  async logAdherence(
    @Param('scheduleId') scheduleId: string,
    @Body() dto: { status: 'TAKEN' | 'MISSED' | 'SKIPPED' },
    @CurrentUser() user: { userId: string },
  ) {
    return this.prescriptionService.logAdherence(scheduleId, user.userId, dto.status);
  }
}
