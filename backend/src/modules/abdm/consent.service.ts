/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/abdm/consent.service.ts
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
 * Business logic service for abdm
 *
 * Responsibilities:
 * - Execute business logic for consent operations
 * - Coordinate data access and external API calls
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
 - common
 - crypto
 *
 * Dependencies:
 - common
 - crypto
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Consent
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

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import type { HiType, Prisma } from '@prisma/client';
import type { RequestConsentDto } from './dto/consent.dto';

@Injectable()
export class ConsentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async request(dto: RequestConsentDto) {
    const patient = await this.prisma.user.findUnique({ where: { id: dto.patientUserId } });
    if (!patient) throw new NotFoundException('Patient not found');

    const consent = await this.prisma.abdmConsent.create({
      data: {
        id: randomUUID(),
        patientUserId: dto.patientUserId,
        consentId: `abdm_consent_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        consentManagerId: 'abdm-sandbox',
        hiuId: dto.hiuId,
        purpose: dto.purpose,
        hiTypes: dto.hiTypes as HiType[],
        permissionDateFrom: dto.dateFrom ? new Date(dto.dateFrom) : new Date(),
        permissionDateTo: dto.dateTo ? new Date(dto.dateTo) : undefined,
        permissionFrequency: dto.frequency,
        status: 'REQUESTED',
        expiresAt: new Date(Date.now() + (dto.expiryDays ?? 30) * 86400000),
        updatedAt: new Date(),
      },
    });

    await this.auditLog.capture({
      action: 'abdm.consent.requested',
      resourceType: 'abdm_consent',
      resourceId: consent.id,
      patientUserId: dto.patientUserId,
      metadata: { purpose: dto.purpose, hiTypes: dto.hiTypes, hiuId: dto.hiuId },
    });

    return consent;
  }

  async grant(consentId: string) {
    const consent = await this.prisma.abdmConsent.findUnique({ where: { id: consentId } });
    if (!consent) throw new NotFoundException('Consent not found');
    if (consent.status !== 'REQUESTED') throw new ConflictException('Consent is not in REQUESTED state');

    const updated = await this.prisma.abdmConsent.update({
      where: { id: consentId },
      data: { status: 'GRANTED', grantedAt: new Date() },
    });

    await this.auditLog.capture({
      action: 'abdm.consent.granted',
      resourceType: 'abdm_consent',
      resourceId: consentId,
      patientUserId: consent.patientUserId,
    });

    return updated;
  }

  async revoke(consentId: string, reason?: string) {
    const consent = await this.prisma.abdmConsent.findUnique({ where: { id: consentId } });
    if (!consent) throw new NotFoundException('Consent not found');
    if (consent.status === 'REVOKED') throw new ConflictException('Consent already revoked');

    const updated = await this.prisma.abdmConsent.update({
      where: { id: consentId },
      data: { status: 'REVOKED', revokedAt: new Date(), metadata: { ...(consent.metadata as Record<string, unknown> | undefined), revokeReason: reason } },
    });

    await this.auditLog.capture({
      action: 'abdm.consent.revoked',
      resourceType: 'abdm_consent',
      resourceId: consentId,
      patientUserId: consent.patientUserId,
      metadata: { reason },
    });

    return updated;
  }

  async findByPatient(patientUserId: string) {
    return this.prisma.abdmConsent.findMany({
      where: { patientUserId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const consent = await this.prisma.abdmConsent.findUnique({
      where: { id },
      include: { HealthInformationRequest: true },
    });
    if (!consent) throw new NotFoundException('Consent not found');
    return consent;
  }

  async findByConsentId(consentId: string) {
    const consent = await this.prisma.abdmConsent.findUnique({
      where: { consentId },
      include: { HealthInformationRequest: true },
    });
    if (!consent) throw new NotFoundException('Consent not found');
    return consent;
  }

  async list(status?: string) {
    const where: Prisma.AbdmConsentWhereInput = {};
    if (status) where.status = status as Prisma.AbdmConsentWhereInput['status'];
    return this.prisma.abdmConsent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async stats() {
    const [sent, approved, rejected, pending] = await Promise.all([
      this.prisma.abdmConsent.count(),
      this.prisma.abdmConsent.count({ where: { status: 'GRANTED' } }),
      this.prisma.abdmConsent.count({ where: { status: 'DENIED' } }),
      this.prisma.abdmConsent.count({ where: { status: 'REQUESTED' } }),
    ]);
    return { sent, approved, rejected, pending };
  }
}
