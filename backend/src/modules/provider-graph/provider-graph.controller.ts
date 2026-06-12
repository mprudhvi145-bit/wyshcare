/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/provider-graph/provider-graph.controller.ts
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
 * HTTP controller: exposes REST endpoints for provider-graph
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

import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProviderGraphService } from './provider-graph.service';
import { ReferralService } from './referral.service';
import { ReputationService } from './reputation.service';
import type { CreateNodeDto, CreateEdgeDto, GraphQueryDto, TraverseDto } from './dto/graph.dto';
import type { CreateReferralDto, RespondReferralDto } from './dto/referral.dto';

@ApiTags('Provider Graph')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('provider-graph')
export class ProviderGraphController {
  constructor(
    private readonly graph: ProviderGraphService,
    private readonly referral: ReferralService,
    private readonly reputation: ReputationService,
  ) {}

  // ── Nodes ──

  @Post('nodes')
  @Roles('ADMIN', 'SYSTEM')
  @ApiOperation({ summary: 'Create a provider graph node' })
  async createNode(@Body() dto: CreateNodeDto) {
    return this.graph.createNode(dto);
  }

  @Get('nodes/:id')
  @Roles('ADMIN', 'DOCTOR', 'CLINIC_MANAGER')
  @ApiOperation({ summary: 'Get node with edges and scores' })
  async getNode(@Param('id') id: string) {
    return this.graph.findById(id);
  }

  @Get('search')
  @Roles('ADMIN', 'DOCTOR', 'CLINIC_MANAGER', 'PATIENT')
  @ApiOperation({ summary: 'Search provider graph nodes' })
  async search(@Query() query: GraphQueryDto) {
    return this.graph.search(query);
  }

  @Post('traverse')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'BFS traverse the graph from a node' })
  async traverse(@Body() dto: TraverseDto) {
    return this.graph.traverse(dto);
  }

  @Get('stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Provider graph statistics' })
  async getStats() {
    return this.graph.getStats();
  }

  @Post('best-match')
  @Roles('ADMIN', 'PATIENT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find best provider match' })
  async bestMatch(@Body() dto: { patientCondition?: string; needType?: string; city?: string; insuranceId?: string }) {
    return this.graph.findBestMatch(dto);
  }

  // ── Edges ──

  @Post('edges')
  @Roles('ADMIN', 'SYSTEM')
  @ApiOperation({ summary: 'Create an edge between nodes' })
  async createEdge(@Body() dto: CreateEdgeDto) {
    return this.graph.createEdge(dto);
  }

  // ── Referrals ──

  @Post('referrals')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Create a referral' })
  async createReferral(@Body() dto: CreateReferralDto) {
    return this.referral.create(dto);
  }

  @Patch('referrals/:id/respond')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Accept or decline a referral' })
  async respondReferral(@Param('id') id: string, @Body() dto: RespondReferralDto) {
    return this.referral.respond(id, dto);
  }

  @Post('referrals/:id/complete')
  @Roles('ADMIN', 'DOCTOR')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark referral as completed' })
  async completeReferral(@Param('id') id: string) {
    return this.referral.complete(id);
  }

  @Get('referrals')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'List referrals' })
  async listReferrals(
    @Query('status') status?: string,
    @Query('fromProviderId') fromProviderId?: string,
    @Query('toProviderId') toProviderId?: string,
    @Query('patientUserId') patientUserId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.referral.list({ status, fromProviderId, toProviderId, patientUserId, limit: limit ? parseInt(limit, 10) : undefined });
  }

  @Get('referrals/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Referral statistics' })
  async referralStats() {
    return this.referral.getStats();
  }

  // ── Reputation ──

  @Post('reputation/recalculate')
  @Roles('ADMIN', 'SYSTEM')
  @ApiOperation({ summary: 'Recalculate all provider scores' })
  async recalculateScores() {
    return this.reputation.recalculateAll();
  }

  @Post('reputation/recalculate/:nodeId')
  @Roles('ADMIN', 'SYSTEM')
  @ApiOperation({ summary: 'Recalculate score for a single provider' })
  async recalculateNodeScore(@Param('nodeId') nodeId: string) {
    return this.reputation.calculateScore(nodeId);
  }

  @Get('reputation/top')
  @Roles('ADMIN', 'PATIENT')
  @ApiOperation({ summary: 'Get top-ranked providers' })
  async topProviders(
    @Query('nodeType') nodeType?: string,
    @Query('city') city?: string,
    @Query('speciality') speciality?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.reputation.getTopProviders({ nodeType, city, speciality, limit: limit ? parseInt(limit, 10) : undefined, sortBy });
  }
}
