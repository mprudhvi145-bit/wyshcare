/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/workspace/workspace.controller.ts
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
 * HTTP controller: exposes REST endpoints for workspace
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

import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { NurseService } from './nurse.service';
import { LabService } from './lab.service';
import { PharmacyWorkspaceService } from './pharmacy.service';
import { PrismaService } from '../../providers/prisma/prisma.service';
import type {
  RecordVitalsDto, CreateMedicationAdministrationDto, AdministerMedicationDto,
  CreateCareTaskDto, UpdateCareTaskDto, CreateShiftHandoverDto,
  CreateLabSampleDto, UpdateLabSampleDto, CreateLabResultDto, ApproveLabResultDto,
  CreateDispensingRecordDto, CreateProcurementOrderDto,
} from './dto/workspace.dto';

@ApiTags('Workspaces')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('os')
export class WorkspaceController {
  constructor(
    private readonly nurse: NurseService,
    private readonly lab: LabService,
    private readonly pharmacy: PharmacyWorkspaceService,
    private readonly prisma: PrismaService,
  ) {}

  // ── Role Router ──

  @Get('role/:userId')
  @ApiOperation({ summary: 'Detect user role and return workspace route' })
  async detectRole(@Param('userId') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        roles: { select: { role: true } },
        StaffAssignment: { select: { role: true } },
        doctorProfile: { select: { id: true } },
        providerProfile: { select: { id: true } },
      },
    });
    if (!user) return { role: 'UNKNOWN', workspace: '/login' };

    const allRoles = [
      ...user.roles.map(r => r.role),
      ...user.StaffAssignment.map(s => s.role),
    ];

    if (allRoles.includes('ADMIN')) return { role: 'ADMIN', workspace: '/os/admin' };
    if (allRoles.includes('DOCTOR') || user.doctorProfile) return { role: 'DOCTOR', workspace: '/os/doctor' };
    if (allRoles.includes('NURSE')) return { role: 'NURSE', workspace: '/os/nurse' };
    if (allRoles.includes('LAB_PARTNER')) return { role: 'LAB', workspace: '/os/lab' };
    if (allRoles.includes('PHARMACY_PARTNER') || allRoles.includes('PHARMACY')) return { role: 'PHARMACY', workspace: '/os/pharmacy' };
    if (allRoles.includes('RECEPTION') || allRoles.includes('COORDINATOR')) return { role: 'RECEPTION', workspace: '/os/reception' };
    if (allRoles.includes('BILLING')) return { role: 'BILLING', workspace: '/os/billing' };
    if (allRoles.includes('PATIENT')) return { role: 'PATIENT', workspace: '/app' };

    return { role: allRoles[0] ?? 'UNKNOWN', workspace: '/login' };
  }

  // ── Nurse: Vitals ──

  @Post('nurse/vitals')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Record patient vitals' })
  async recordVitals(@Body() dto: RecordVitalsDto, @Body('_actorId') _actorId?: string) {
    return this.nurse.recordVitals(dto, _actorId ?? 'system');
  }

  @Get('nurse/vitals/:patientId')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Get vitals history' })
  async getVitals(@Param('patientId') patientId: string, @Query('days') days?: string) {
    return this.nurse.getVitals(patientId, days ? parseInt(days, 10) : undefined);
  }

  @Get('nurse/vitals/:patientId/latest')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Get latest vitals' })
  async getLatestVitals(@Param('patientId') patientId: string) {
    return this.nurse.getLatestVitals(patientId);
  }

  // ── Nurse: Medications ──

  @Post('nurse/medications/schedule')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Schedule medication administration' })
  async scheduleMedication(@Body() dto: CreateMedicationAdministrationDto, @Body('_actorId') _actorId?: string) {
    return this.nurse.scheduleMedication(dto, _actorId ?? 'system');
  }

  @Get('nurse/medications/scheduled/:patientId')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Get scheduled medications' })
  async getScheduledMeds(@Param('patientId') patientId: string) {
    return this.nurse.getScheduledMeds(patientId);
  }

  @Post('nurse/medications/:id/administer')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Administer medication' })
  async administerMedication(@Param('id') id: string, @Body() dto: AdministerMedicationDto, @Body('_actorId') _actorId?: string) {
    return this.nurse.administerMedication(id, dto, _actorId ?? 'system');
  }

  @Get('nurse/medications/history/:patientId')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Medication administration history' })
  async getMedicationHistory(@Param('patientId') patientId: string) {
    return this.nurse.getMedicationHistory(patientId);
  }

  // ── Nurse: Care Tasks ──

  @Post('nurse/tasks')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create care task' })
  async createTask(@Body() dto: CreateCareTaskDto) {
    return this.nurse.createTask(dto);
  }

  @Get('nurse/tasks/:nurseId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List tasks for nurse' })
  async listTasks(@Param('nurseId') nurseId: string, @Query('status') status?: string) {
    return this.nurse.listTasks(nurseId, status);
  }

  @Patch('nurse/tasks/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update care task' })
  async updateTask(@Param('id') id: string, @Body() dto: UpdateCareTaskDto, @Body('_actorId') _actorId?: string) {
    return this.nurse.updateTask(id, dto, _actorId ?? 'system');
  }

  @Get('nurse/patient-tasks/:patientId')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Get active tasks for patient' })
  async getPatientTasks(@Param('patientId') patientId: string) {
    return this.nurse.getPatientTasks(patientId);
  }

  // ── Nurse: Shift Handover ──

  @Post('nurse/handover')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create shift handover' })
  async createHandover(@Body() dto: CreateShiftHandoverDto) {
    return this.nurse.createHandover(dto);
  }

  @Get('nurse/handover/:userId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get handovers for user' })
  async getHandovers(@Param('userId') userId: string) {
    return this.nurse.getHandovers(userId);
  }

  @Post('nurse/handover/:id/acknowledge')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Acknowledge shift handover' })
  async acknowledgeHandover(@Param('id') id: string) {
    return this.nurse.acknowledgeHandover(id);
  }

  // ── Lab: Samples ──

  @Post('lab/samples')
  @Roles('ADMIN', 'LAB_PARTNER', 'DOCTOR')
  @ApiOperation({ summary: 'Create lab sample' })
  async createSample(@Body() dto: CreateLabSampleDto, @Body('_actorId') _actorId?: string) {
    return this.lab.createSample(dto, _actorId ?? 'system');
  }

  @Get('lab/samples/pending')
  @Roles('ADMIN', 'LAB_PARTNER')
  @ApiOperation({ summary: 'List pending collections' })
  async listPendingCollections() {
    return this.lab.listPendingCollections();
  }

  @Patch('lab/samples/:id')
  @Roles('ADMIN', 'LAB_PARTNER')
  @ApiOperation({ summary: 'Update lab sample' })
  async updateSample(@Param('id') id: string, @Body() dto: UpdateLabSampleDto) {
    return this.lab.updateSample(id, dto);
  }

  @Get('lab/samples/order/:diagnosticOrderId')
  @Roles('ADMIN', 'LAB_PARTNER', 'DOCTOR')
  @ApiOperation({ summary: 'List samples by order' })
  async listSamplesByOrder(@Param('diagnosticOrderId') diagnosticOrderId: string) {
    return this.lab.listSamplesByOrder(diagnosticOrderId);
  }

  @Get('lab/samples/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Sample statistics' })
  async getSampleStats() {
    return this.lab.getSampleStats();
  }

  // ── Lab: Results ──

  @Post('lab/results')
  @Roles('ADMIN', 'LAB_PARTNER')
  @ApiOperation({ summary: 'Create lab result' })
  async createResult(@Body() dto: CreateLabResultDto, @Body('_actorId') _actorId?: string) {
    return this.lab.createResult(dto, _actorId ?? 'system');
  }

  @Post('lab/results/:id/approve')
  @Roles('ADMIN', 'LAB_PARTNER')
  @ApiOperation({ summary: 'Approve lab result' })
  async approveResult(@Param('id') id: string, @Body() dto: ApproveLabResultDto) {
    return this.lab.approveResult(id, dto);
  }

  @Get('lab/results/order/:diagnosticOrderId')
  @Roles('ADMIN', 'LAB_PARTNER', 'DOCTOR')
  @ApiOperation({ summary: 'List results by order' })
  async listResultsByOrder(@Param('diagnosticOrderId') diagnosticOrderId: string) {
    return this.lab.listResultsByOrder(diagnosticOrderId);
  }

  @Get('lab/results/pending')
  @Roles('ADMIN', 'LAB_PARTNER')
  @ApiOperation({ summary: 'List pending results' })
  async getPendingResults() {
    return this.lab.getPendingResults();
  }

  @Get('lab/results/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Result statistics' })
  async getResultStats() {
    return this.lab.getResultStats();
  }

  // ── Pharmacy: Dispensing ──

  @Post('pharmacy/dispense')
  @Roles('ADMIN', 'PHARMACY_PARTNER')
  @ApiOperation({ summary: 'Create dispensing record' })
  async createDispensing(@Body() dto: CreateDispensingRecordDto, @Body('_actorId') _actorId?: string) {
    return this.pharmacy.createDispensing(dto, _actorId ?? 'system');
  }

  @Get('pharmacy/dispense/queue')
  @Roles('ADMIN', 'PHARMACY_PARTNER')
  @ApiOperation({ summary: 'List dispensing queue' })
  async listDispensingQueue() {
    return this.pharmacy.listDispensingQueue();
  }

  @Get('pharmacy/dispense/history/:pharmacistId')
  @Roles('ADMIN', 'PHARMACY_PARTNER')
  @ApiOperation({ summary: 'Dispensing history' })
  async listDispensingHistory(@Param('pharmacistId') pharmacistId: string) {
    return this.pharmacy.listDispensingHistory(pharmacistId);
  }

  @Get('pharmacy/dispense/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Dispensing statistics' })
  async getDispensingStats() {
    return this.pharmacy.getDispensingStats();
  }

  // ── Pharmacy: Procurement ──

  @Post('pharmacy/procurement')
  @Roles('ADMIN', 'PHARMACY_PARTNER')
  @ApiOperation({ summary: 'Create procurement order' })
  async createProcurementOrder(@Body() dto: CreateProcurementOrderDto) {
    return this.pharmacy.createProcurementOrder(dto);
  }

  @Get('pharmacy/procurement/:pharmacyId')
  @Roles('ADMIN', 'PHARMACY_PARTNER')
  @ApiOperation({ summary: 'List procurement orders' })
  async listProcurementOrders(@Param('pharmacyId') pharmacyId: string) {
    return this.pharmacy.listProcurementOrders(pharmacyId);
  }

  @Post('pharmacy/procurement/:id/receive')
  @Roles('ADMIN', 'PHARMACY_PARTNER')
  @ApiOperation({ summary: 'Mark procurement as received' })
  async receiveProcurementOrder(@Param('id') id: string) {
    return this.pharmacy.receiveProcurementOrder(id);
  }

  @Get('pharmacy/procurement/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Procurement statistics' })
  async getProcurementStats() {
    return this.pharmacy.getProcurementStats();
  }

  // ── Pharmacy: Inventory ──

  @Get('pharmacy/inventory/low-stock/:pharmacyId')
  @Roles('ADMIN', 'PHARMACY_PARTNER')
  @ApiOperation({ summary: 'Get low stock items' })
  async getLowStockItems(@Param('pharmacyId') pharmacyId: string, @Query('threshold') threshold?: string) {
    return this.pharmacy.getLowStockItems(pharmacyId, threshold ? parseInt(threshold, 10) : 10);
  }

  @Post('pharmacy/inventory/:id/stock')
  @Roles('ADMIN', 'PHARMACY_PARTNER')
  @ApiOperation({ summary: 'Update inventory stock' })
  async updateStock(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.pharmacy.updateStock(id, quantity);
  }
}
