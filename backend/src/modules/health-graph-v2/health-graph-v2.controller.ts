/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/health-graph-v2/health-graph-v2.controller.ts
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
 * HTTP controller: exposes REST endpoints for health-graph-v2
 *
 * Responsibilities:
 * - Handle HTTP requests for health graph operations
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
Health Graph
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
import { LifestyleService } from './lifestyle.service';
import { SymptomService } from './symptom.service';
import { FamilyHistoryService } from './family-history.service';
import { WearablesService } from './wearables.service';
import { RiskService } from './risk.service';
import { PreventionService } from './prevention.service';
import type { UpdateLifestyleDto, RecordSymptomDto, SyncWearableDto, AddFamilyHistoryDto } from './dto/health-graph.dto';

@ApiTags('Health Graph V2')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('health-graph-v2')
export class HealthGraphV2Controller {
  constructor(
    private readonly lifestyle: LifestyleService,
    private readonly symptom: SymptomService,
    private readonly familyHistory: FamilyHistoryService,
    private readonly wearables: WearablesService,
    private readonly risk: RiskService,
    private readonly prevention: PreventionService,
  ) {}

  // ── Lifestyle ──

  @Get('lifestyle/:userId')
  @Roles('ADMIN', 'PATIENT', 'DOCTOR')
  @ApiOperation({ summary: 'Get lifestyle profile' })
  async getLifestyle(@Param('userId') userId: string) {
    return this.lifestyle.getProfile(userId);
  }

  @Patch('lifestyle/:userId')
  @Roles('ADMIN', 'PATIENT')
  @ApiOperation({ summary: 'Update lifestyle profile' })
  async updateLifestyle(@Param('userId') userId: string, @Body() dto: UpdateLifestyleDto) {
    return this.lifestyle.updateProfile(userId, dto);
  }

  @Get('lifestyle/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Lifestyle population stats' })
  async lifestyleStats() {
    return this.lifestyle.getStats();
  }

  // ── Symptoms ──

  @Post('symptoms')
  @Roles('ADMIN', 'PATIENT')
  @ApiOperation({ summary: 'Record a symptom event' })
  async recordSymptom(@Body() body: { userId: string } & RecordSymptomDto) {
    return this.symptom.record(body.userId, body);
  }

  @Get('symptoms/:userId')
  @Roles('ADMIN', 'PATIENT', 'DOCTOR')
  @ApiOperation({ summary: 'List symptom events' })
  async listSymptoms(@Param('userId') userId: string, @Query('days') days?: string) {
    return this.symptom.list(userId, days ? parseInt(days, 10) : undefined);
  }

  @Post('symptoms/:id/resolve')
  @Roles('ADMIN', 'PATIENT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve a symptom event' })
  async resolveSymptom(@Param('id') id: string) {
    return this.symptom.resolve(id);
  }

  @Get('symptoms/:userId/frequent')
  @Roles('ADMIN', 'PATIENT', 'DOCTOR')
  @ApiOperation({ summary: 'Get frequent symptoms' })
  async frequentSymptoms(@Param('userId') userId: string) {
    return this.symptom.getFrequent(userId);
  }

  @Get('symptoms/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Symptom population stats' })
  async symptomStats() {
    return this.symptom.getStats();
  }

  // ── Family History ──

  @Get('family-history/:userId')
  @Roles('ADMIN', 'PATIENT', 'DOCTOR')
  @ApiOperation({ summary: 'List family history entries' })
  async listFamilyHistory(@Param('userId') userId: string) {
    return this.familyHistory.list(userId);
  }

  @Post('family-history')
  @Roles('ADMIN', 'PATIENT')
  @ApiOperation({ summary: 'Add family history entry' })
  async addFamilyHistory(@Body() body: { userId: string } & AddFamilyHistoryDto) {
    return this.familyHistory.add(body.userId, body);
  }

  @Delete('family-history/:id')
  @Roles('ADMIN', 'PATIENT')
  @ApiOperation({ summary: 'Remove family history entry' })
  async removeFamilyHistory(@Param('id') id: string) {
    return this.familyHistory.remove(id);
  }

  @Get('family-history/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Family history population stats' })
  async familyHistoryStats() {
    return this.familyHistory.getStats();
  }

  // ── Wearables ──

  @Post('wearables/sync/:userId')
  @Roles('ADMIN', 'PATIENT')
  @ApiOperation({ summary: 'Sync wearable metrics' })
  async syncWearables(@Param('userId') userId: string, @Body() dto: SyncWearableDto) {
    return this.wearables.sync(userId, dto);
  }

  @Get('wearables/:userId/:metricType')
  @Roles('ADMIN', 'PATIENT', 'DOCTOR')
  @ApiOperation({ summary: 'Get wearable metrics by type' })
  async getWearableMetrics(@Param('userId') userId: string, @Param('metricType') metricType: string, @Query('days') days?: string) {
    return this.wearables.getMetrics(userId, metricType, days ? parseInt(days, 10) : undefined);
  }

  @Get('wearables/:userId/latest')
  @Roles('ADMIN', 'PATIENT', 'DOCTOR')
  @ApiOperation({ summary: 'Get latest wearable metrics' })
  async getLatestWearable(@Param('userId') userId: string) {
    return this.wearables.getLatestMetrics(userId);
  }

  @Get('wearables/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Wearable population stats' })
  async wearablesStats() {
    return this.wearables.getStats();
  }

  // ── Risk Engine ──

  @Post('risk/assess/:userId')
  @Roles('ADMIN', 'PATIENT')
  @ApiOperation({ summary: 'Full risk assessment for patient' })
  async assessRisk(@Param('userId') userId: string) {
    const results = await this.risk.assess(userId);
    for (const [type, result] of Object.entries(results)) {
      await this.risk.savePrediction(userId, type, result);
    }
    return results;
  }

  @Get('risk/history/:userId')
  @Roles('ADMIN', 'PATIENT', 'DOCTOR')
  @ApiOperation({ summary: 'Risk prediction history' })
  async riskHistory(@Param('userId') userId: string) {
    return this.risk.getHistory(userId);
  }

  @Get('risk/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Risk population statistics' })
  async riskStats() {
    return this.risk.getStats();
  }

  // ── Prevention ──

  @Post('prevention/generate/:userId')
  @Roles('ADMIN', 'SYSTEM')
  @ApiOperation({ summary: 'Generate preventive recommendations' })
  async generatePrevention(@Param('userId') userId: string) {
    return this.prevention.generate(userId);
  }

  @Get('prevention/:userId')
  @Roles('ADMIN', 'PATIENT', 'DOCTOR')
  @ApiOperation({ summary: 'List preventive recommendations' })
  async listPrevention(@Param('userId') userId: string, @Query('status') status?: string) {
    return this.prevention.list(userId, status);
  }

  @Post('prevention/:id/complete')
  @Roles('ADMIN', 'PATIENT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark recommendation as completed' })
  async completePrevention(@Param('id') id: string) {
    return this.prevention.complete(id);
  }

  @Post('prevention/:id/dismiss')
  @Roles('ADMIN', 'PATIENT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dismiss a recommendation' })
  async dismissPrevention(@Param('id') id: string) {
    return this.prevention.dismiss(id);
  }

  @Get('prevention/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Prevention population stats' })
  async preventionStats() {
    return this.prevention.getStats();
  }
}
