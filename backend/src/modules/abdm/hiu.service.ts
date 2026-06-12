/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/abdm/hiu.service.ts
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
 - crypto
 - client
 - common
 *
 * Dependencies:
 - crypto
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

import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import type { RequestHealthInfoDto } from './dto/hie.dto';

@Injectable()
export class HiuService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async requestHealthInfo(dto: RequestHealthInfoDto) {
    const consent = await this.prisma.abdmConsent.findUnique({ where: { id: dto.consentId } });
    if (!consent) throw new NotFoundException('Consent not found');
    if (consent.status !== 'GRANTED') throw new NotFoundException('Consent not in GRANTED state');

    const request = await this.prisma.healthInformationRequest.create({
      data: {
        id: randomUUID(),
        consentId: dto.consentId,
        requesterUserId: dto.requesterUserId,
        patientUserId: dto.patientUserId,
        purpose: dto.purpose,
        hiTypes: dto.hiTypes as Prisma.HealthInformationRequestCreateInput['hiTypes'],
        dateFrom: dto.dateFrom ? new Date(dto.dateFrom) : undefined,
        dateTo: dto.dateTo ? new Date(dto.dateTo) : undefined,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 86400000),
        updatedAt: new Date(),
      },
    });

    await this.auditLog.capture({
      action: 'abdm.hie.requested',
      resourceType: 'health_information_request',
      resourceId: request.id,
      patientUserId: dto.patientUserId,
      metadata: { consentId: dto.consentId, purpose: dto.purpose },
    });

    return request;
  }

  async getTransfers(requestId: string) {
    const request = await this.prisma.healthInformationRequest.findUnique({
      where: { id: requestId },
      include: { HealthInformationTransfer: true },
    });
    if (!request) throw new NotFoundException('Health information request not found');
    return request.HealthInformationTransfer;
  }

  async listRequestsByRequester(requesterUserId: string) {
    return this.prisma.healthInformationRequest.findMany({
      where: { requesterUserId },
      include: { HealthInformationTransfer: true, User_HealthInformationRequest_patientUserIdToUser: { select: { id: true, fullName: true, abhaAddress: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listRequestsByPatient(patientUserId: string) {
    return this.prisma.healthInformationRequest.findMany({
      where: { patientUserId },
      include: { HealthInformationTransfer: true, User_HealthInformationRequest_requesterUserIdToUser: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async decryptData(transferId: string) {
    const transfer = await this.prisma.healthInformationTransfer.findUnique({
      where: { id: transferId },
    });
    if (!transfer) throw new NotFoundException('Transfer not found');

    const decrypted = await this.prisma.healthInformationTransfer.update({
      where: { id: transferId },
      data: { status: 'DECRYPTED' },
    });

    return decrypted;
  }
}
