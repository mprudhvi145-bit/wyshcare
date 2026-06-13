import { Controller, Get, Post, Param, Body, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { NHCXService } from './nhcx.service';

@ApiTags('NHCX')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('nhcx')
export class NHCXController {
  constructor(private readonly nhcx: NHCXService) {}

  @Post('providers/:providerId/configure')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Configure NHCX for an insurance provider' })
  async configure(
    @Param('providerId') providerId: string,
    @Body() body: { insurerId: string; apiEndpoint: string; clientId: string; clientSecret: string; webhookSecret?: string },
  ) {
    return this.nhcx.configure({ providerId, ...body });
  }

  @Get('providers/:providerId/configuration')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get NHCX configuration for a provider' })
  getConfiguration(@Param('providerId') providerId: string) {
    return this.nhcx.getConfiguration(providerId);
  }

  @Post('claims/:claimId/submit')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @ApiOperation({ summary: 'Submit claim via NHCX gateway (DB-backed)' })
  async submitClaim(@Param('claimId') claimId: string) {
    return this.nhcx.submitClaimDb(claimId);
  }

  @Post('submissions/:submissionId/acknowledge')
  @Roles('ADMIN', 'SYSTEM')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Acknowledge NHCX submission outcome' })
  async acknowledge(
    @Param('submissionId') submissionId: string,
    @Body() body: { outcome: string; notes?: string },
  ) {
    return this.nhcx.acknowledgeSubmission(submissionId, body.outcome, body.notes);
  }

  @Post('submissions/:submissionId/sync')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync NHCX submission status' })
  async syncStatus(@Param('submissionId') submissionId: string) {
    return this.nhcx.syncStatus(submissionId);
  }

  @Get('stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'NHCX dashboard statistics' })
  async getStats() {
    return this.nhcx.getStats();
  }

  @Get('submissions')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List NHCX submissions' })
  async getSubmissions(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
  ) {
    return this.nhcx.getSubmissions({ status, limit: limit ? parseInt(limit, 10) : undefined });
  }

  // ─── FHIR-Compliant Endpoints ───

  @Post('eligibility')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check coverage eligibility via NHCX (FHIR CoverageEligibilityResponseBundle)' })
  async checkEligibility(
    @Body() body: {
      patientId: string;
      patientName?: string;
      insuranceProvider: string;
      insuranceId: string;
      policyNumber?: string;
      purpose?: 'validation' | 'discovery' | 'auth-requirement' | 'benefits';
    },
  ) {
    return this.nhcx.checkEligibility({
      patientId: body.patientId,
      patientName: body.patientName,
      insuranceProvider: body.insuranceProvider,
      insuranceId: body.insuranceId,
      policyNumber: body.policyNumber,
      purpose: body.purpose ?? 'benefits',
    });
  }

  @Post('claims')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit claim via NHCX (FHIR ClaimResponseBundle)' })
  async submitClaimFhir(
    @Body() body: {
      use: 'preauthorization' | 'predetermination' | 'claim';
      patientId: string;
      patientName?: string;
      providerId: string;
      providerName?: string;
      insurerName?: string;
      items: Array<{ productOrService: string; unitPrice: number; quantity: number }>;
    },
  ) {
    return this.nhcx.submitClaim(body);
  }

  @Get('claims/:id/status')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @ApiOperation({ summary: 'Check claim status via NHCX (FHIR TaskBundle)' })
  async checkClaimStatus(
    @Param('id') id: string,
    @Query('submissionRef') submissionRef?: string,
  ) {
    return this.nhcx.checkClaimStatus(id, submissionRef);
  }

  @Get('providers')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @ApiOperation({ summary: 'Get provider/payor details (FHIR InsurancePlanBundle)' })
  async getProviders(@Query('providerId') providerId?: string) {
    return this.nhcx.getProviderDetails(providerId);
  }

  @Post('claims/:id/reprocess')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reprocess a claim via NHCX (FHIR TaskBundle)' })
  async reprocessClaim(
    @Param('id') id: string,
    @Body() body?: { reason?: string },
  ) {
    return this.nhcx.reprocessClaim(id, body?.reason);
  }
}
