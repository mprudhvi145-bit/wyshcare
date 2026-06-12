/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/provider-graph/referral.service.ts
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
 * Business logic service for provider-graph
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
import { ProviderEdgeType } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import type { CreateReferralDto, RespondReferralDto } from './dto/referral.dto';

@Injectable()
export class ReferralService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  private mapReferral(referral: any) {
    if (!referral) return null;
    return {
      ...referral,
      fromProvider: referral.ProviderGraphNode_Referral_fromProviderIdToProviderGraphNode,
      toProvider: referral.ProviderGraphNode_Referral_toProviderIdToProviderGraphNode,
      patient: referral.User,
    };
  }

  async create(dto: CreateReferralDto) {
    const [from, to] = await Promise.all([
      this.prisma.providerGraphNode.findUnique({ where: { id: dto.fromProviderId } }),
      this.prisma.providerGraphNode.findUnique({ where: { id: dto.toProviderId } }),
    ]);
    if (!from) throw new NotFoundException('Referring provider not found');
    if (!to) throw new NotFoundException('Referred provider not found');

    const referral = await this.prisma.referral.create({
      data: {
        id: randomUUID(),
        fromProviderId: dto.fromProviderId,
        toProviderId: dto.toProviderId,
        patientUserId: dto.patientUserId,
        appointmentId: dto.appointmentId,
        reason: dto.reason,
        notes: dto.notes,
        updatedAt: new Date(),
      },
      include: {
        ProviderGraphNode_Referral_fromProviderIdToProviderGraphNode: { select: { id: true, name: true, nodeType: true } },
        ProviderGraphNode_Referral_toProviderIdToProviderGraphNode: { select: { id: true, name: true, nodeType: true } },
        User: { select: { id: true, fullName: true } },
      },
    });

    await this.ensureEdgeExists(dto.fromProviderId, dto.toProviderId, 'REFERRED_TO');
    await this.ensureEdgeExists(dto.toProviderId, dto.fromProviderId, 'REFERRED_BY');

    await this.auditLog.capture({
      action: 'provider.referral.created',
      resourceType: 'referral',
      resourceId: referral.id,
      metadata: { fromProviderId: dto.fromProviderId, toProviderId: dto.toProviderId },
    });

    return this.mapReferral(referral);
  }

  private async ensureEdgeExists(fromId: string, toId: string, edgeType: string) {
    const existing = await this.prisma.providerGraphEdge.findUnique({
      where: { fromNodeId_toNodeId_edgeType: { fromNodeId: fromId, toNodeId: toId, edgeType: edgeType as ProviderEdgeType } },
    });
    if (existing) {
      await this.prisma.providerGraphEdge.update({
        where: { id: existing.id },
        data: { weight: { increment: 0.1 } },
      });
    } else {
      await this.prisma.providerGraphEdge.create({
        data: {
          id: randomUUID(),
          fromNodeId: fromId,
          toNodeId: toId,
          edgeType: edgeType as ProviderEdgeType,
          weight: 1.0
        },
      });
    }
  }

  async respond(id: string, dto: RespondReferralDto) {
    const referral = await this.prisma.referral.findUnique({ where: { id } });
    if (!referral) throw new NotFoundException('Referral not found');

    const updated = await this.prisma.referral.update({
      where: { id },
      data: {
        status: dto.status,
        respondedAt: new Date(),
        notes: dto.notes ? `${referral.notes ?? ''}\nResponse: ${dto.notes}` : referral.notes,
        updatedAt: new Date(),
      },
      include: {
        ProviderGraphNode_Referral_fromProviderIdToProviderGraphNode: { select: { id: true, name: true, nodeType: true } },
        ProviderGraphNode_Referral_toProviderIdToProviderGraphNode: { select: { id: true, name: true, nodeType: true } },
      },
    });
    return this.mapReferral(updated);
  }

  async complete(id: string) {
    const referral = await this.prisma.referral.findUnique({ where: { id } });
    if (!referral) throw new NotFoundException('Referral not found');

    const updated = await this.prisma.referral.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return updated;
  }

  async list(params: { status?: string; fromProviderId?: string; toProviderId?: string; patientUserId?: string; limit?: number }) {
    const where: Prisma.ReferralWhereInput = {};
    if (params.status) where.status = params.status;
    if (params.fromProviderId) where.fromProviderId = params.fromProviderId;
    if (params.toProviderId) where.toProviderId = params.toProviderId;
    if (params.patientUserId) where.patientUserId = params.patientUserId;

    const referrals = await this.prisma.referral.findMany({
      where,
      include: {
        ProviderGraphNode_Referral_fromProviderIdToProviderGraphNode: { select: { id: true, name: true, nodeType: true } },
        ProviderGraphNode_Referral_toProviderIdToProviderGraphNode: { select: { id: true, name: true, nodeType: true } },
        User: { select: { id: true, fullName: true } },
      },
      take: params.limit ?? 50,
      orderBy: { createdAt: 'desc' },
    });
    return referrals.map(r => this.mapReferral(r));
  }

  async getStats() {
    const [total, pending, accepted, completed] = await Promise.all([
      this.prisma.referral.count(),
      this.prisma.referral.count({ where: { status: 'PENDING' } }),
      this.prisma.referral.count({ where: { status: 'ACCEPTED' } }),
      this.prisma.referral.count({ where: { status: 'COMPLETED' } }),
    ]);
    return { total, pending, accepted, completed };
  }
}
