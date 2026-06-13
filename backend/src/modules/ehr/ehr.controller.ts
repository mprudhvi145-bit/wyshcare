/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ehr/ehr.controller.ts
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
 * HTTP controller: exposes REST endpoints for ehr
 *
 * Responsibilities:
 * - Handle HTTP requests for ehr operations
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
EHR
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

import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';
import { PatientChartService } from './patient-chart.service';
import { EncounterService } from './encounter.service';
import { OrdersService } from './orders.service';
import { ClinicalNotesService } from './clinical-notes.service';
import { CDSService } from './cds.service';
import { EhrTimelineService } from './timeline.service';
import type {
  CreateAllergyDto, UpdateAllergyDto,
  CreateConditionDto, UpdateConditionDto,
  CreateProcedureDto,
  CreateImmunizationDto,
  CreateClinicalDocumentDto,
  CreateEncounterDto, UpdateEncounterDto, CreateEncounterDiagnosisDto,
  CreateClinicalOrderDto, UpdateClinicalOrderDto,
  CreateClinicalNoteDto, UpdateClinicalNoteDto,
  CreateCDSAlertDto, DismissCDSAlertDto,
  TimelineQueryDto,
} from './dto/ehr.dto';

@ApiTags('Enterprise EHR')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@UseGuards(ThrottlerGuard)
@Controller('ehr')
export class EhrController {
  constructor(
    private readonly chart: PatientChartService,
    private readonly encounter: EncounterService,
    private readonly orders: OrdersService,
    private readonly notes: ClinicalNotesService,
    private readonly cds: CDSService,
    private readonly timeline: EhrTimelineService,
  ) {}

  // ── Patient Chart: Allergies ──

  @Get('allergies/:patientId')
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  @ApiOperation({ summary: 'List allergies for patient' })
  async listAllergies(@Param('patientId') patientId: string) {
    return this.chart.listAllergies(patientId);
  }

  @Get('allergies/detail/:id')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Get allergy detail' })
  async getAllergy(@Param('id') id: string) {
    return this.chart.getAllergy(id);
  }

  @Post('allergies')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Create allergy record' })
  async createAllergy(@Body() dto: CreateAllergyDto, @Body('_actorId') _actorId?: string) {
    return this.chart.createAllergy(dto, _actorId ?? 'system');
  }

  @Patch('allergies/:id')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Update allergy record' })
  async updateAllergy(@Param('id') id: string, @Body() dto: UpdateAllergyDto, @Body('_actorId') _actorId?: string) {
    return this.chart.updateAllergy(id, dto, _actorId ?? 'system');
  }

  @Delete('allergies/:id')
  @Roles('ADMIN', 'DOCTOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete allergy record' })
  async deleteAllergy(@Param('id') id: string, @Body('_actorId') _actorId?: string) {
    await this.chart.deleteAllergy(id, _actorId ?? 'system');
  }

  @Get('allergies/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Allergy population stats' })
  async allergyStats() {
    return this.chart.getAllergyStats();
  }

  // ── Patient Chart: Conditions ──

  @Get('conditions/:patientId')
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  @ApiOperation({ summary: 'List conditions for patient' })
  async listConditions(@Param('patientId') patientId: string) {
    return this.chart.listConditions(patientId);
  }

  @Get('conditions/detail/:id')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Get condition detail' })
  async getCondition(@Param('id') id: string) {
    return this.chart.getCondition(id);
  }

  @Post('conditions')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Create condition record' })
  async createCondition(@Body() dto: CreateConditionDto, @Body('_actorId') _actorId?: string) {
    return this.chart.createCondition(dto, _actorId ?? 'system');
  }

  @Patch('conditions/:id')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Update condition record' })
  async updateCondition(@Param('id') id: string, @Body() dto: UpdateConditionDto, @Body('_actorId') _actorId?: string) {
    return this.chart.updateCondition(id, dto, _actorId ?? 'system');
  }

  @Delete('conditions/:id')
  @Roles('ADMIN', 'DOCTOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete condition record' })
  async deleteCondition(@Param('id') id: string, @Body('_actorId') _actorId?: string) {
    await this.chart.deleteCondition(id, _actorId ?? 'system');
  }

  @Get('conditions/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Condition population stats' })
  async conditionStats() {
    return this.chart.getConditionStats();
  }

  // ── Patient Chart: Procedures ──

  @Get('procedures/:patientId')
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  @ApiOperation({ summary: 'List procedures for patient' })
  async listProcedures(@Param('patientId') patientId: string) {
    return this.chart.listProcedures(patientId);
  }

  @Get('procedures/detail/:id')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Get procedure detail' })
  async getProcedure(@Param('id') id: string) {
    return this.chart.getProcedure(id);
  }

  @Post('procedures')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Create procedure record' })
  async createProcedure(@Body() dto: CreateProcedureDto, @Body('_actorId') _actorId?: string) {
    return this.chart.createProcedure(dto, _actorId ?? 'system');
  }

  @Get('procedures/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Procedure population stats' })
  async procedureStats() {
    return this.chart.getProcedureStats();
  }

  // ── Patient Chart: Immunizations ──

  @Get('immunizations/:patientId')
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  @ApiOperation({ summary: 'List immunizations for patient' })
  async listImmunizations(@Param('patientId') patientId: string) {
    return this.chart.listImmunizations(patientId);
  }

  @Post('immunizations')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Create immunization record' })
  async createImmunization(@Body() dto: CreateImmunizationDto, @Body('_actorId') _actorId?: string) {
    return this.chart.createImmunization(dto, _actorId ?? 'system');
  }

  @Get('immunizations/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Immunization population stats' })
  async immunizationStats() {
    return this.chart.getImmunizationStats();
  }

  // ── Patient Chart: Clinical Documents ──

  @Get('documents/:patientId')
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  @ApiOperation({ summary: 'List clinical documents' })
  async listDocuments(@Param('patientId') patientId: string, @Query('documentType') documentType?: string) {
    return this.chart.listDocuments(patientId, documentType);
  }

  @Post('documents')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Upload clinical document' })
  async createDocument(@Body() dto: CreateClinicalDocumentDto, @Body('_actorId') _actorId?: string) {
    return this.chart.createDocument(dto, _actorId ?? 'system');
  }

  @Delete('documents/:id')
  @Roles('ADMIN', 'DOCTOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive clinical document' })
  async deleteDocument(@Param('id') id: string, @Body('_actorId') _actorId?: string) {
    await this.chart.deleteDocument(id, _actorId ?? 'system');
  }

  @Get('documents/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Document population stats' })
  async documentStats() {
    return this.chart.getDocumentStats();
  }

  // ── Encounter Engine ──

  @Get('encounters/:patientId')
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  @ApiOperation({ summary: 'List encounters for patient' })
  async listEncounters(@Param('patientId') patientId: string) {
    return this.encounter.listEncounters(patientId);
  }

  @Get('encounters/detail/:id')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Get encounter detail' })
  async getEncounter(@Param('id') id: string) {
    return this.encounter.getEncounter(id);
  }

  @Post('encounters')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Create encounter' })
  async createEncounter(@Body() dto: CreateEncounterDto, @Body('_actorId') _actorId?: string) {
    return this.encounter.createEncounter(dto, _actorId ?? 'system');
  }

  @Patch('encounters/:id')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Update encounter' })
  async updateEncounter(@Param('id') id: string, @Body() dto: UpdateEncounterDto, @Body('_actorId') _actorId?: string) {
    return this.encounter.updateEncounter(id, dto, _actorId ?? 'system');
  }

  @Post('encounters/:id/close')
  @Roles('ADMIN', 'DOCTOR')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Close encounter' })
  async closeEncounter(@Param('id') id: string, @Body('_actorId') _actorId?: string) {
    return this.encounter.closeEncounter(id, _actorId ?? 'system');
  }

  @Post('encounters/:id/cancel')
  @Roles('ADMIN', 'DOCTOR')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel encounter' })
  async cancelEncounter(@Param('id') id: string, @Body('_actorId') _actorId?: string) {
    return this.encounter.cancelEncounter(id, _actorId ?? 'system');
  }

  @Post('encounters/diagnoses')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Add diagnosis to encounter' })
  async addDiagnosis(@Body() dto: CreateEncounterDiagnosisDto, @Body('_actorId') _actorId?: string) {
    return this.encounter.addDiagnosis(dto, _actorId ?? 'system');
  }

  @Delete('encounters/diagnoses/:id')
  @Roles('ADMIN', 'DOCTOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove diagnosis from encounter' })
  async removeDiagnosis(@Param('id') id: string, @Body('_actorId') _actorId?: string) {
    await this.encounter.removeDiagnosis(id, _actorId ?? 'system');
  }

  @Get('encounters/provider/:providerId')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'List encounters by provider' })
  async listEncountersByProvider(@Param('providerId') providerId: string) {
    return this.encounter.listEncountersByProvider(providerId);
  }

  @Get('encounters/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Encounter population stats' })
  async encounterStats() {
    return this.encounter.getEncounterStats();
  }

  // ── Orders Engine ──

  @Get('orders/:patientId')
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  @ApiOperation({ summary: 'List orders for patient' })
  async listOrders(@Param('patientId') patientId: string, @Query('orderType') orderType?: string) {
    return this.orders.listOrders(patientId, orderType);
  }

  @Get('orders/detail/:id')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Get order detail' })
  async getOrder(@Param('id') id: string) {
    return this.orders.getOrder(id);
  }

  @Post('orders')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Create clinical order' })
  async createOrder(@Body() dto: CreateClinicalOrderDto, @Body('_actorId') _actorId?: string) {
    return this.orders.createOrder(dto, _actorId ?? 'system');
  }

  @Patch('orders/:id')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Update clinical order' })
  async updateOrder(@Param('id') id: string, @Body() dto: UpdateClinicalOrderDto, @Body('_actorId') _actorId?: string) {
    return this.orders.updateOrder(id, dto, _actorId ?? 'system');
  }

  @Get('orders/type/:orderType')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List orders by type' })
  async listOrdersByType(@Param('orderType') orderType: string) {
    return this.orders.listOrdersByType(orderType);
  }

  @Get('orders/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Order population stats' })
  async orderStats() {
    return this.orders.getOrderStats();
  }

  // ── Clinical Documentation ──

  @Get('notes/:patientId')
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  @ApiOperation({ summary: 'List clinical notes for patient' })
  async listNotes(@Param('patientId') patientId: string, @Query('noteType') noteType?: string) {
    return this.notes.listNotes(patientId, noteType);
  }

  @Get('notes/detail/:id')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Get clinical note detail' })
  async getNote(@Param('id') id: string) {
    return this.notes.getNote(id);
  }

  @Post('notes')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Create clinical note' })
  async createNote(@Body() dto: CreateClinicalNoteDto, @Body('_actorId') _actorId?: string) {
    return this.notes.createNote(dto, _actorId ?? 'system');
  }

  @Patch('notes/:id')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Update clinical note' })
  async updateNote(@Param('id') id: string, @Body() dto: UpdateClinicalNoteDto, @Body('_actorId') _actorId?: string) {
    return this.notes.updateNote(id, dto, _actorId ?? 'system');
  }

  @Post('notes/:id/sign')
  @Roles('ADMIN', 'DOCTOR')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign clinical note' })
  async signNote(@Param('id') id: string, @Body('_actorId') _actorId?: string) {
    return this.notes.signNote(id, _actorId ?? 'system');
  }

  @Delete('notes/:id')
  @Roles('ADMIN', 'DOCTOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete clinical note' })
  async deleteNote(@Param('id') id: string, @Body('_actorId') _actorId?: string) {
    await this.notes.deleteNote(id, _actorId ?? 'system');
  }

  @Get('notes/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Clinical note population stats' })
  async noteStats() {
    return this.notes.getNoteStats();
  }

  // ── Clinical Decision Support ──

  @Get('cds/:patientId')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'List active CDS alerts for patient' })
  async listAlerts(@Param('patientId') patientId: string, @Query('alertType') alertType?: string) {
    return this.cds.listAlerts(patientId, alertType);
  }

  @Get('cds/detail/:id')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Get CDS alert detail' })
  async getAlert(@Param('id') id: string) {
    return this.cds.getAlert(id);
  }

  @Post('cds')
  @Roles('ADMIN', 'DOCTOR', 'SYSTEM')
  @ApiOperation({ summary: 'Create CDS alert' })
  async createAlert(@Body() dto: CreateCDSAlertDto, @Body('_actorId') _actorId?: string) {
    return this.cds.createAlert(dto, _actorId ?? 'system');
  }

  @Post('cds/:id/dismiss')
  @Roles('ADMIN', 'DOCTOR')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dismiss CDS alert' })
  async dismissAlert(@Param('id') id: string, @Body() dto: DismissCDSAlertDto, @Body('_actorId') _actorId?: string) {
    return this.cds.dismissAlert(id, dto, _actorId ?? 'system');
  }

  @Post('cds/:id/resolve')
  @Roles('ADMIN', 'SYSTEM')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve CDS alert' })
  async resolveAlert(@Param('id') id: string, @Body('_actorId') _actorId?: string) {
    return this.cds.resolveAlert(id, _actorId ?? 'system');
  }

  @Get('cds/type/:alertType')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List alerts by type' })
  async listAlertsByType(@Param('alertType') alertType: string) {
    return this.cds.listAlertsByType(alertType);
  }

  @Get('cds/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'CDS population stats' })
  async alertStats() {
    return this.cds.getAlertStats();
  }

  // ── Timeline ──

  @Get('timeline')
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  @ApiOperation({ summary: 'Query EHR timeline events' })
  async getTimeline(@Query() query: TimelineQueryDto) {
    return this.timeline.getTimeline(query);
  }

  @Get('timeline/:patientId')
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  @ApiOperation({ summary: 'Get patient timeline' })
  async getPatientTimeline(@Param('patientId') patientId: string) {
    return this.timeline.getPatientTimeline(patientId);
  }
}
