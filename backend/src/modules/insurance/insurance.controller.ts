/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/insurance/insurance.controller.ts
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
 * HTTP controller: exposes REST endpoints for insurance
 *
 * Responsibilities:
 * - Handle HTTP requests for insurance operations
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
Insurance
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
import type { Prisma, PolicyStatus, ClaimStatus, ClaimDocumentType } from '@prisma/client';
import { InsuranceService } from './insurance.service';

@ApiTags('Insurance + Claims OS')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('insurance')
export class InsuranceController {
  constructor(private readonly insurance: InsuranceService) {}

  // ─── Providers ───

  @Get('providers')
  @ApiOperation({ summary: 'List insurance providers' })
  listProviders(@Query('all') all?: string) {
    return this.insurance.listProviders(all !== 'true');
  }

  @Get('providers/:id')
  @ApiOperation({ summary: 'Get insurance provider details' })
  getProvider(@Param('id') id: string) {
    return this.insurance.getProvider(id);
  }

  @Post('providers')
  @Roles('ADMIN', 'SYSTEM')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create insurance provider (admin)' })
  createProvider(@Body() data: { name: string; code: string; type?: string; phone?: string; email?: string; website?: string }) {
    return this.insurance.createProvider(data);
  }

  @Get('providers/:id/plans')
  @ApiOperation({ summary: 'List plans for a provider' })
  listPlans(@Param('id') id: string) {
    return this.insurance.listProviderPlans(id);
  }

  // ─── Plans ───

  @Post('plans')
  @Roles('ADMIN', 'SYSTEM')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create insurance plan (admin)' })
  createPlan(@Body() data: {
    providerId: string; name: string; code: string; type?: string; description?: string;
    maxSumInsured?: number; maxCoveragePercent?: number; waitingPeriodDays?: number; preExistingWaiting?: number;
  }) {
    return this.insurance.createPlan(data);
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Get insurance plan details' })
  getPlan(@Param('id') id: string) {
    return this.insurance.getPlan(id);
  }

  // ─── Policies ───

  @Post('policies')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Link insurance policy to patient' })
  linkPolicy(@Body() data: {
    userId: string; planId: string; policyNumber: string; memberId: string;
    startDate: string; endDate: string; sumInsured?: number; copayPercent?: number; deductible?: number; coveragePercent?: number;
  }) {
    return this.insurance.linkPolicy(data);
  }

  @Get('policies')
  @ApiOperation({ summary: 'List insurance policies' })
  listPolicies(@Query('userId') userId?: string, @Query('status') status?: string) {
    return this.insurance.listPolicies(userId, status);
  }

  @Get('policies/:id')
  @ApiOperation({ summary: 'Get insurance policy details' })
  getPolicy(@Param('id') id: string) {
    return this.insurance.getPolicy(id);
  }

  @Patch('policies/:id')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @ApiOperation({ summary: 'Update insurance policy' })
  updatePolicy(@Param('id') id: string, @Body() data: { status?: string; copayPercent?: number; deductible?: number; coveragePercent?: number }) {
    return this.insurance.updatePolicy(id, { ...data, status: data.status as PolicyStatus | undefined });
  }

  // ─── Coverage Rules ───

  @Post('coverage-rules')
  @Roles('ADMIN', 'SYSTEM')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add coverage rule to plan (admin)' })
  addCoverageRule(@Body() data: {
    planId: string; category: string; coveragePercent?: number; maxAmount?: number;
    requiresPreAuth?: boolean; waitingPeriod?: number;
  }) {
    return this.insurance.addCoverageRule(data);
  }

  @Get('coverage-rules/:planId')
  @ApiOperation({ summary: 'List coverage rules for a plan' })
  listCoverageRules(@Param('planId') planId: string) {
    return this.insurance.listCoverageRules(planId);
  }

  // ─── Eligibility ───

  @Post('eligibility/check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check patient insurance eligibility' })
  checkEligibility(@Body() data: {
    policyId: string; patientUserId: string; appointmentId?: string;
    category?: string; amount?: number;
  }) {
    return this.insurance.checkEligibility(data);
  }

  @Get('eligibility/history/:patientUserId')
  @ApiOperation({ summary: 'Get eligibility check history' })
  eligibilityHistory(@Param('patientUserId') patientUserId: string) {
    return this.insurance.getEligibilityHistory(patientUserId);
  }

  // ─── Pre-Authorization ───

  @Post('pre-auth')
  @Roles('ADMIN', 'DOCTOR', 'CLINIC_MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create pre-authorization request' })
  createPreAuth(@Body() data: {
    policyId: string; clinicId?: string; patientUserId: string;
    doctorProfileId?: string; appointmentId?: string;
    procedureCode?: string; diagnosisCode?: string; requestedAmount: number; notes?: string;
  }, @CurrentUser() user: AuthenticatedUser) {
    return this.insurance.createPreAuth({ ...data, patientUserId: data.patientUserId ?? user.userId });
  }

  @Get('pre-auth')
  @ApiOperation({ summary: 'List pre-authorization requests' })
  listPreAuths(
    @Query('policyId') policyId?: string,
    @Query('patientUserId') patientUserId?: string,
    @Query('status') status?: string,
  ) {
    return this.insurance.listPreAuths(policyId, patientUserId, status);
  }

  @Get('pre-auth/:id')
  @ApiOperation({ summary: 'Get pre-authorization details' })
  getPreAuth(@Param('id') id: string) {
    return this.insurance.getPreAuth(id);
  }

  @Patch('pre-auth/:id/respond')
  @Roles('ADMIN', 'SYSTEM')
  @ApiOperation({ summary: 'Respond to pre-authorization request (admin)' })
  respondPreAuth(@Param('id') id: string, @Body() data: { status: string; approvedAmount?: number; reviewerNotes?: string }) {
    return this.insurance.respondToPreAuth(id, data);
  }

  // ─── Claims ───

  @Post('claims')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a claim draft' })
  createClaim(@Body() data: {
    policyId: string; clinicId: string; patientUserId: string;
    invoiceId?: string; preAuthorizationId?: string;
    items: Array<{ description: string; category?: string; claimedAmount: number }>;
  }, @CurrentUser() _user: AuthenticatedUser) {
    return this.insurance.createClaim(data);
  }

  @Get('claims')
  @ApiOperation({ summary: 'List insurance claims' })
  listClaims(
    @Query('policyId') policyId?: string,
    @Query('patientUserId') patientUserId?: string,
    @Query('clinicId') clinicId?: string,
    @Query('status') status?: string,
  ) {
    return this.insurance.listClaims(policyId, patientUserId, clinicId, status);
  }

  @Get('claims/:id')
  @ApiOperation({ summary: 'Get claim details' })
  getClaim(@Param('id') id: string) {
    return this.insurance.getClaim(id);
  }

  @Post('claims/:id/submit')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit claim for adjudication' })
  submitClaim(@Param('id') id: string) {
    return this.insurance.submitClaim(id);
  }

  @Post('claims/:id/adjudicate')
  @Roles('ADMIN', 'SYSTEM')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Adjudicate claim (admin)' })
  adjudicateClaim(@Param('id') id: string, @Body() data: { status: string; approvedAmount?: number; notes?: string }) {
    return this.insurance.adjudicateClaim(id, { ...data, status: data.status as ClaimStatus });
  }

  @Post('claims/:id/documents')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add document to claim' })
  addDocument(@Param('id') id: string, @Body() data: { documentType: string; fileName: string; storageKey: string; fileSize?: number }) {
    return this.insurance.addClaimDocument(id, { ...data, documentType: data.documentType as ClaimDocumentType });
  }

  // ─── Settlement ───

  @Post('claims/:id/settlement')
  @Roles('ADMIN', 'SYSTEM')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record claim settlement' })
  recordSettlement(@Param('id') id: string, @Body() data: { amount: number; method?: string; reference?: string; notes?: string }) {
    return this.insurance.recordSettlement(id, data);
  }

  // ─── AI Copilot ───

  @Post('copilot/analyze-claim/:id')
  @Roles('ADMIN', 'DOCTOR', 'CLINIC_MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'AI analyze claim for issues' })
  analyzeClaim(@Param('id') id: string) {
    return this.insurance.analyzeClaim(id);
  }

  @Post('copilot/denial-risk/:id')
  @Roles('ADMIN', 'DOCTOR', 'CLINIC_MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'AI predict claim denial risk' })
  denialRisk(@Param('id') id: string) {
    return this.insurance.predictDenialRisk(id);
  }
}
