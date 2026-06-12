/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/nhcx/nhcx.service.ts
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
 * Business logic service for nhcx
 *
 * Responsibilities:
 * - Execute business logic for wyshid operations
 * - Coordinate data access and external API calls
 *
 * Used By:
 - backend/src/modules/prescription/prescription.service.ts
 - backend/src/providers/storage/storage.module.ts
 - backend/src/modules/abdm/abdm.module.ts
 - backend/src/modules/digital-twin/digital-twin.service.ts
 - backend/src/modules/prescription/interaction-engine.service.ts
 - backend/src/modules/interoperability/interoperability.module.ts
 - backend/src/main.ts
 - backend/src/modules/health-graph/health-graph.service.ts
 *
 * Calls:
 - node:crypto
 - client
 - common
 *
 * Dependencies:
 - node:crypto
 - client
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

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, ClaimStatus } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import { toFhirClaim } from './fhir-mapper';

@Injectable()
export class NHCXService {
  private readonly logger = new Logger(NHCXService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async configure(params: {
    providerId: string;
    insurerId: string;
    apiEndpoint: string;
    clientId: string;
    clientSecret: string;
    webhookSecret?: string;
  }) {
    const provider = await this.prisma.insuranceProvider.findUnique({ where: { id: params.providerId } });
    if (!provider) throw new NotFoundException('Insurance provider not found');

    const config = await this.prisma.nHCXConfiguration.upsert({
      where: { providerId: params.providerId },
      create: {
        id: randomUUID(),
        providerId: params.providerId,
        insurerId: params.insurerId,
        apiEndpoint: params.apiEndpoint,
        clientId: params.clientId,
        clientSecret: params.clientSecret,
        webhookSecret: params.webhookSecret,
        updatedAt: new Date(),
      },
      update: {
        insurerId: params.insurerId,
        apiEndpoint: params.apiEndpoint,
        clientId: params.clientId,
        clientSecret: params.clientSecret,
        webhookSecret: params.webhookSecret,
        updatedAt: new Date(),
      },
    });

    await this.auditLog.capture({ action: 'nhcx.configured', resourceType: 'nhcx', resourceId: params.providerId, metadata: { providerId: params.providerId } });
    return config;
  }

  async getConfiguration(providerId: string) {
    const config = await this.prisma.nHCXConfiguration.findUnique({ where: { providerId } });
    if (!config) throw new NotFoundException('NHCX not configured for this provider');
    return { ...config, clientSecret: '[REDACTED]' };
  }

  async submitClaim(claimId: string) {
    const claim = await this.prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        ClaimLineItem: true,
        InsurancePolicy: { include: { InsurancePlan: { include: { InsuranceProvider: { include: { NHCXConfiguration: true } } } }, User: true } },
      },
    });
    if (!claim) throw new NotFoundException('Claim not found');
    if (claim.status !== 'SUBMITTED') throw new BadRequestException('Claim must be in SUBMITTED status');

    const nhcxConfig = claim.InsurancePolicy.InsurancePlan.InsuranceProvider.NHCXConfiguration;
    if (!nhcxConfig || !nhcxConfig.isActive) {
      throw new BadRequestException('NHCX not configured for this provider');
    }

    const fhirClaim = toFhirClaim({
      claimNumber: claim.claimNumber,
      patientWyshId: claim.InsurancePolicy.User.wyshId,
      insurerId: nhcxConfig.insurerId,
      clinicId: claim.clinicId,
      diagnosisCode: undefined,
      items: claim.ClaimLineItem.map(i => ({
        description: i.description,
        claimedAmount: i.claimedAmount,
        category: i.category,
      })),
      totalAmount: claim.claimedAmount,
      created: claim.createdAt.toISOString(),
    });

    const { submissionRef, responsePayload } = await this.submitToNHCX(nhcxConfig as unknown as Record<string, unknown>, fhirClaim as unknown as Record<string, unknown>);

    const submission = await this.prisma.nHCXClaimSubmission.create({
      data: {
        id: randomUUID(),
        claimId: claim.id,
        submissionRef,
        status: 'PENDING',
        requestPayload: fhirClaim as unknown as Prisma.InputJsonValue,
        responsePayload: (responsePayload ?? undefined) as Prisma.InputJsonValue | undefined,
        submittedAt: new Date(),
        updatedAt: new Date(),
        NHCXLog: {
          create: {
            id: randomUUID(),
            event: 'SUBMIT',
            level: 'INFO',
            message: `Claim ${claim.claimNumber} submitted via NHCX`,
            metadata: { submissionRef, insurerId: nhcxConfig.insurerId },
          },
        },
      },
    });

    await this.prisma.claim.update({
      where: { id: claimId },
      data: {
        status: 'UNDER_REVIEW',
        updatedAt: new Date(),
      },
    });

    await this.auditLog.capture({ action: 'nhcx.submitted', resourceType: 'claim', resourceId: claimId, metadata: { claimId, submissionRef: submission.submissionRef } });

    return {
      submissionId: submission.id,
      submissionRef,
      status: 'SUBMITTED',
      message: 'Claim submitted to NHCX gateway',
    };
  }

  async acknowledgeSubmission(submissionId: string, outcome: string, notes?: string) {
    const submission = await this.prisma.nHCXClaimSubmission.findUnique({
      where: { id: submissionId },
      include: { Claim: true },
    });
    if (!submission) throw new NotFoundException('NHCX submission not found');

    const statusMap: Record<string, string> = {
      ACKNOWLEDGED: 'SUBMITTED',
      ACCEPTED: 'APPROVED',
      REJECTED: 'DENIED',
    };

    const claimStatus = statusMap[outcome] ?? 'SUBMITTED';
    const approvedAmount = outcome === 'ACCEPTED' ? submission.Claim.claimedAmount : undefined;

    await this.prisma.nHCXClaimSubmission.update({
      where: { id: submissionId },
      data: {
        status: outcome,
        acknowledgedAt: new Date(),
        responsePayload: { outcome, notes } as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
    });

    await this.prisma.nHCXLog.create({
      data: {
        id: randomUUID(),
        submissionId,
        event: 'ACKNOWLEDGE',
        level: outcome === 'REJECTED' ? 'ERROR' : 'INFO',
        message: `NHCX acknowledgement received: ${outcome}`,
        metadata: { outcome, notes },
      },
    });

    if (claimStatus !== 'SUBMITTED') {
      await this.prisma.claim.update({
        where: { id: submission.claimId },
        data: {
          status: claimStatus as ClaimStatus,
          approvedAmount,
          updatedAt: new Date(),
        },
      });
    }

    await this.auditLog.capture({ action: 'nhcx.acknowledged', resourceType: 'nhcx', resourceId: submissionId, metadata: { submissionId, outcome } });

    return {
      submissionId,
      outcome,
      claimStatus,
      notes,
    };
  }

  async syncStatus(submissionId: string) {
    const submission = await this.prisma.nHCXClaimSubmission.findUnique({
      where: { id: submissionId },
      include: { Claim: true },
    });
    if (!submission) throw new NotFoundException('NHCX submission not found');

    const syncResult = await this.syncWithNHCX({ submissionRef: submission.submissionRef!, submittedAt: submission.submittedAt });

    await this.prisma.nHCXClaimSubmission.update({
      where: { id: submissionId },
      data: {
        status: syncResult.status,
        syncedAt: new Date(),
        responsePayload: syncResult.payload as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
    });

    await this.prisma.nHCXLog.create({
      data: {
        id: randomUUID(),
        submissionId,
        event: 'SYNC',
        level: syncResult.status === 'REJECTED' ? 'ERROR' : 'INFO',
        message: `Status synced: ${syncResult.status}`,
        metadata: syncResult.payload as Prisma.InputJsonValue,
      },
    });

    return {
      submissionId,
      status: syncResult.status,
      syncedAt: new Date().toISOString(),
    };
  }

  async getStats() {
    const [totalSent, totalThisMonth] = await Promise.all([
      this.prisma.nHCXClaimSubmission.count(),
      this.prisma.nHCXClaimSubmission.count({
        where: { submittedAt: { gte: new Date(new Date().setDate(1)) } },
      }),
    ]);

    const allSubmissions = await this.prisma.nHCXClaimSubmission.findMany({
      select: { status: true },
    });
    const statusCounts: Record<string, number> = {};
    for (const s of allSubmissions) {
      statusCounts[s.status] = (statusCounts[s.status] ?? 0) + 1;
    }

    return {
      totalClaimsSent: totalSent,
      claimsThisMonth: totalThisMonth,
      successRate: totalSent > 0 ? Math.round(((statusCounts.ACCEPTED ?? 0) / totalSent) * 1000) / 10 : 0,
      failureRate: totalSent > 0 ? Math.round(((statusCounts.REJECTED ?? 0) / totalSent) * 1000) / 10 : 0,
      byStatus: statusCounts,
    };
  }

  async getSubmissions(params?: { status?: string; limit?: number }) {
    const where: Prisma.NHCXClaimSubmissionWhereInput = {};
    if (params?.status) where.status = params.status;

    const submissions = await this.prisma.nHCXClaimSubmission.findMany({
      where,
      include: {
        Claim: { select: { claimNumber: true, claimedAmount: true, status: true } },
        NHCXLog: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
      orderBy: { submittedAt: 'desc' },
      take: params?.limit ?? 50,
    });

    return submissions.map(s => ({
      ...s,
      claim: s.Claim,
      logs: s.NHCXLog,
    }));
  }

  // ─── Simulated NHCX Gateway Calls ───

  private async submitToNHCX(config: Record<string, unknown>, _fhirClaim: Record<string, unknown>): Promise<{ submissionRef: string; responsePayload?: Record<string, unknown> }> {
    this.logger.log(`NHCX submit to ${config.apiEndpoint} for insurer ${config.insurerId}`);

    const submissionRef = `NHCX-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 8).toUpperCase()}`;

    return { submissionRef };
  }

  private async syncWithNHCX(submission: { submissionRef: string; submittedAt: Date }): Promise<{ status: string; payload?: Record<string, unknown> }> {
    this.logger.log(`NHCX sync for submission ${submission.submissionRef}`);

    const elapsed = Date.now() - new Date(submission.submittedAt).getTime();
    const hoursSinceSubmission = elapsed / 3600000;

    let status = 'PENDING';
    if (hoursSinceSubmission > 24) status = 'ACCEPTED';
    else if (hoursSinceSubmission > 12) status = 'PROCESSING';

    return {
      status,
      payload: { syncedAt: new Date().toISOString(), elapsedHours: Math.round(hoursSinceSubmission * 10) / 10 },
    };
  }
}
