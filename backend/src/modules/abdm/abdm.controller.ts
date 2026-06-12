/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/abdm/abdm.controller.ts
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
 * HTTP controller: exposes REST endpoints for abdm
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

import { Controller, Get, Post, Param, Body, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AbhaService } from './abha.service';
import { ConsentService } from './consent.service';
import { HipService } from './hip.service';
import { HiuService } from './hiu.service';
import { GatewayService } from './gateway.service';
import { HprService } from './hpr.service';
import { HfrService } from './hfr.service';
import type { HprRecord } from './hpr.service';
import type { HfrRecord } from './hfr.service';
import type { CreateAbhaDto, LinkAbhaDto, ResolveAbhaDto } from './dto/abha.dto';
import type { RequestConsentDto } from './dto/consent.dto';
import type { RequestHealthInfoDto, PushHealthDataDto, CareContextDto } from './dto/hie.dto';

@ApiTags('ABDM')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('abdm')
export class AbdmController {
  constructor(
    private readonly abha: AbhaService,
    private readonly consent: ConsentService,
    private readonly hip: HipService,
    private readonly hiu: HiuService,
    private readonly gateway: GatewayService,
    private readonly hpr: HprService,
    private readonly hfr: HfrService,
  ) {}

  // ── ABHA ──

  @Post('abha/create')
  @Roles('ADMIN', 'PATIENT')
  @ApiOperation({ summary: 'Create new ABHA profile' })
  async createAbha(@Body() dto: CreateAbhaDto) {
    return this.abha.create(dto);
  }

  @Post('abha/link')
  @Roles('ADMIN', 'PATIENT')
  @ApiOperation({ summary: 'Link existing ABHA to user' })
  async linkAbha(@Body() dto: LinkAbhaDto) {
    return this.abha.link(dto);
  }

  @Post('abha/resolve')
  @Roles('ADMIN', 'DOCTOR', 'CLINIC_MANAGER')
  @ApiOperation({ summary: 'Resolve ABHA address to profile' })
  async resolveAbha(@Body() dto: ResolveAbhaDto) {
    return this.abha.resolve(dto);
  }

  @Get('abha/profile/:userId')
  @Roles('ADMIN', 'PATIENT', 'DOCTOR')
  @ApiOperation({ summary: 'Get ABHA profile for user' })
  async getAbhaProfile(@Param('userId') userId: string) {
    return this.abha.getProfile(userId);
  }

  @Post('abha/request-otp')
  @Roles('ADMIN', 'PATIENT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request OTP for ABHA verification' })
  async requestAbhaOtp(@Body() body: { abhaAddress: string }) {
    return this.abha.requestOtp(body.abhaAddress);
  }

  @Post('abha/verify-otp')
  @Roles('ADMIN', 'PATIENT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP for ABHA' })
  async verifyAbhaOtp(@Body() body: { txnId: string; otp: string }) {
    return this.abha.verifyOtp(body.txnId, body.otp);
  }

  @Get('abha/search')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Search ABHA profiles' })
  async searchAbha(@Query('q') q: string, @Query('limit') limit?: string) {
    return this.abha.search(q, limit ? parseInt(limit, 10) : undefined);
  }

  @Get('abha/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'ABHA dashboard statistics' })
  async abhaStats() {
    return this.abha.stats();
  }

  // ── Consent Manager ──

  @Post('consent/request')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Request consent from patient' })
  async requestConsent(@Body() dto: RequestConsentDto) {
    return this.consent.request(dto);
  }

  @Post('consent/:id/grant')
  @Roles('ADMIN', 'PATIENT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Grant consent' })
  async grantConsent(@Param('id') id: string) {
    return this.consent.grant(id);
  }

  @Post('consent/:id/revoke')
  @Roles('ADMIN', 'PATIENT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke consent' })
  async revokeConsent(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.consent.revoke(id, body.reason);
  }

  @Get('consent/:id')
  @Roles('ADMIN', 'PATIENT', 'DOCTOR')
  @ApiOperation({ summary: 'Get consent by internal ID' })
  async getConsent(@Param('id') id: string) {
    return this.consent.findById(id);
  }

  @Get('consent/by-abdm/:consentId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get consent by ABDM consent ID' })
  async getConsentByAbdmId(@Param('consentId') consentId: string) {
    return this.consent.findByConsentId(consentId);
  }

  @Get('consent/patient/:patientUserId')
  @Roles('ADMIN', 'PATIENT', 'DOCTOR')
  @ApiOperation({ summary: 'List consents for a patient' })
  async patientConsents(@Param('patientUserId') patientUserId: string) {
    return this.consent.findByPatient(patientUserId);
  }

  @Get('consent')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List all consents' })
  async listConsents(@Query('status') status?: string) {
    return this.consent.list(status);
  }

  @Get('consent/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Consent dashboard statistics' })
  async consentStats() {
    return this.consent.stats();
  }

  // ── HIP (Health Information Provider) ──

  @Post('hip/care-context')
  @Roles('ADMIN', 'DOCTOR', 'CLINIC_MANAGER')
  @ApiOperation({ summary: 'Create a care context for a patient' })
  async createCareContext(@Body() dto: CareContextDto) {
    return this.hip.createCareContext(dto);
  }

  @Get('hip/care-contexts/:patientUserId')
  @Roles('ADMIN', 'DOCTOR', 'CLINIC_MANAGER')
  @ApiOperation({ summary: 'Get care contexts for a patient' })
  async getCareContexts(@Param('patientUserId') patientUserId: string) {
    return this.hip.getCareContexts(patientUserId);
  }

  @Post('hip/push')
  @Roles('ADMIN', 'SYSTEM')
  @ApiOperation({ summary: 'Push health data from HIP' })
  async pushHealthData(@Body() dto: PushHealthDataDto) {
    return this.hip.pushHealthData(dto);
  }

  @Get('hip/pending-requests/:hipId')
  @Roles('ADMIN', 'SYSTEM')
  @ApiOperation({ summary: 'List pending HIE requests for HIP' })
  async pendingHipRequests(@Param('hipId') hipId: string) {
    return this.hip.listPendingRequests(hipId);
  }

  // ── HIU (Health Information User) ──

  @Post('hiu/request')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Request health information as HIU' })
  async requestHealthInfo(@Body() dto: RequestHealthInfoDto) {
    return this.hiu.requestHealthInfo(dto);
  }

  @Get('hiu/transfers/:requestId')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Get transfers for a request' })
  async getTransfers(@Param('requestId') requestId: string) {
    return this.hiu.getTransfers(requestId);
  }

  @Get('hiu/requests/:requesterUserId')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'List requests by requester' })
  async requesterRequests(@Param('requesterUserId') requesterUserId: string) {
    return this.hiu.listRequestsByRequester(requesterUserId);
  }

  @Get('hiu/patient-requests/:patientUserId')
  @Roles('ADMIN', 'PATIENT')
  @ApiOperation({ summary: 'List requests for a patient' })
  async patientRequests(@Param('patientUserId') patientUserId: string) {
    return this.hiu.listRequestsByPatient(patientUserId);
  }

  @Post('hiu/decrypt/:transferId')
  @Roles('ADMIN', 'DOCTOR')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark transfer as decrypted' })
  async decryptTransfer(@Param('transferId') transferId: string) {
    return this.hiu.decryptData(transferId);
  }

  // ── Gateway ──

  @Get('gateway/health')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'ABDM gateway health check' })
  async gatewayHealth() {
    return this.gateway.healthCheck();
  }

  @Post('gateway/link-care-context')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Link care context via ABDM gateway' })
  async linkCareContext(@Body() body: { abhaAddress: string; careContextReference: string; displayName: string }) {
    return this.gateway.linkCareContext(body.abhaAddress, body.careContextReference, body.displayName);
  }

  // ── HPR (Healthcare Professionals Registry) ──

  @Post('hpr/sync')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Sync HPR from ABDM gateway' })
  async syncHpr() {
    return this.hpr.syncAll();
  }

  @Get('hpr/search')
  @Roles('ADMIN', 'DOCTOR', 'CLINIC_MANAGER')
  @ApiOperation({ summary: 'Search HPR providers' })
  async searchHpr(@Query('q') q: string): Promise<HprRecord[]> {
    return this.hpr.search(q);
  }

  @Get('hpr/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'HPR statistics' })
  async hprStats() {
    return this.hpr.getStats();
  }

  @Get('hpr/:hprId')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Get HPR provider details' })
  async getHprProvider(@Param('hprId') hprId: string): Promise<HprRecord | null> {
    return this.hpr.getProvider(hprId);
  }

  // ── HFR (Healthcare Facilities Registry) ──

  @Post('hfr/sync')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Sync HFR from ABDM gateway' })
  async syncHfr() {
    return this.hfr.syncAll();
  }

  @Get('hfr/search')
  @Roles('ADMIN', 'DOCTOR', 'CLINIC_MANAGER')
  @ApiOperation({ summary: 'Search HFR facilities' })
  async searchHfr(@Query('q') q: string): Promise<HfrRecord[]> {
    return this.hfr.search(q);
  }

  @Get('hfr/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'HFR statistics' })
  async hfrStats() {
    return this.hfr.getStats();
  }

  @Get('hfr/:hfrId')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Get HFR facility details' })
  async getHfrFacility(@Param('hfrId') hfrId: string): Promise<HfrRecord | null> {
    return this.hfr.getFacility(hfrId);
  }
}
