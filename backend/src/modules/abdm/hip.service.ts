/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/abdm/hip.service.ts
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
import type { PushHealthDataDto, CareContextDto } from './dto/hie.dto';

@Injectable()
export class HipService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async createCareContext(dto: CareContextDto) {
    const patient = await this.prisma.user.findUnique({ where: { id: dto.patientUserId } });
    if (!patient) throw new NotFoundException('Patient not found');

    const careContext = await this.prisma.careContext.create({
      data: {
        id: randomUUID(),
        patientUserId: dto.patientUserId,
        abhaAddress: dto.abhaAddress,
        careContextReference: `cc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        displayName: dto.displayName,
        type: dto.type,
        healthRecordId: dto.healthRecordId,
        updatedAt: new Date(),
      },
    });

    await this.auditLog.capture({
      action: 'abdm.care_context.created',
      resourceType: 'care_context',
      resourceId: careContext.id,
      patientUserId: dto.patientUserId,
      metadata: { abhaAddress: dto.abhaAddress, type: dto.type },
    });

    return careContext;
  }

  async getCareContexts(patientUserId: string) {
    return this.prisma.careContext.findMany({
      where: { patientUserId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async pushHealthData(dto: PushHealthDataDto) {
    const request = await this.prisma.healthInformationRequest.findUnique({
      where: { id: dto.requestId },
    });
    if (!request) throw new NotFoundException('Health information request not found');

    const transfer = await this.prisma.healthInformationTransfer.create({
      data: {
        id: randomUUID(),
        requestId: dto.requestId,
        hipId: dto.hipId,
        hipName: dto.hipName,
        careContextReference: dto.careContextReference,
        dataPayload: dto.dataPayload as Prisma.InputJsonValue,
        encryptionDetails: dto.encryptionDetails as Prisma.InputJsonValue,
        sizeBytes: JSON.stringify(dto.dataPayload).length,
        checksum: `sha256_${Date.now()}`,
        status: 'TRANSFERRED',
        updatedAt: new Date(),
      },
    });

    await this.prisma.healthInformationRequest.update({
      where: { id: dto.requestId },
      data: { status: 'FULFILLED', fulfilledAt: new Date() },
    });

    await this.auditLog.capture({
      action: 'abdm.health_data.pushed',
      resourceType: 'health_information_transfer',
      resourceId: transfer.id,
      patientUserId: request.patientUserId,
      metadata: { hipId: dto.hipId, careContextReference: dto.careContextReference },
    });

    return transfer;
  }

  async listPendingRequests(_hipId: string) {
    return this.prisma.healthInformationRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        AbdmConsent: true,
        User_HealthInformationRequest_patientUserIdToUser: { select: { id: true, fullName: true, abhaAddress: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
