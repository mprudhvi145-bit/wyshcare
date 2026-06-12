/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/provider-graph/reputation.service.ts
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
 - client
 - common
 - crypto
 *
 * Dependencies:
 - client
 - common
 - crypto
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

import { Injectable, Logger } from '@nestjs/common';
import { ProviderNodeType } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../providers/prisma/prisma.service';

@Injectable()
export class ReputationService {
  private readonly logger = new Logger(ReputationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async recalculateAll() {
    this.logger.log('Recalculating scores for all provider nodes');
    const nodes = await this.prisma.providerGraphNode.findMany({
      select: { id: true },
    });

    let updated = 0;
    for (const node of nodes) {
      await this.calculateScore(node.id);
      updated++;
    }

    return { recalculated: updated, timestamp: new Date().toISOString() };
  }

  async calculateScore(nodeId: string) {
    const node = await this.prisma.providerGraphNode.findUnique({
      where: { id: nodeId },
      include: {
        ProviderGraphEdge_ProviderGraphEdge_fromNodeIdToProviderGraphNode: true,
        ProviderGraphEdge_ProviderGraphEdge_toNodeIdToProviderGraphNode: true,
        Referral_Referral_fromProviderIdToProviderGraphNode: true,
        Referral_Referral_toProviderIdToProviderGraphNode: true,
      },
    });
    if (!node) throw new Error(`Node ${nodeId} not found`);

    const edgesFrom = node.ProviderGraphEdge_ProviderGraphEdge_fromNodeIdToProviderGraphNode || [];
    const edgesTo = node.ProviderGraphEdge_ProviderGraphEdge_toNodeIdToProviderGraphNode || [];
    const referralsReceived = node.Referral_Referral_toProviderIdToProviderGraphNode || [];

    const totalConnectedNodes = edgesFrom.length + edgesTo.length;
    const referralCount = referralsReceived.length;
    const acceptedReferrals = referralsReceived.filter((r) => r.status === 'ACCEPTED' || r.status === 'COMPLETED').length;
    const completedReferrals = referralsReceived.filter((r) => r.status === 'COMPLETED').length;

    const referralScore = Math.min(10, (referralCount > 0 ? (acceptedReferrals / referralCount) * 10 : 0) + Math.min(3, referralCount * 0.3));
    const clinicalScore = 7.5;
    const satisfactionScore = Math.min(10, completedReferrals * 1.5 + 5);
    const availabilityScore = Math.min(10, totalConnectedNodes * 0.5 + 5);
    const networkScore = Math.min(10, totalConnectedNodes * 0.3 + 4);
    const overallScore = +(referralScore * 0.25 + clinicalScore * 0.25 + satisfactionScore * 0.2 + availabilityScore * 0.15 + networkScore * 0.15).toFixed(2);

    const scoreFactors = {
      totalConnections: totalConnectedNodes,
      referralCount,
      acceptedReferrals,
      completedReferrals,
      networkDensity: totalConnectedNodes > 0 ? +(totalConnectedNodes / 50).toFixed(2) : 0,
    };

    return this.prisma.providerScore.upsert({
      where: { nodeId },
      create: {
        id: randomUUID(),
        nodeId,
        referralScore,
        clinicalScore,
        satisfactionScore,
        availabilityScore,
        networkScore,
        overallScore,
        scoreFactors: scoreFactors as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
      update: {
        referralScore,
        clinicalScore,
        satisfactionScore,
        availabilityScore,
        networkScore,
        overallScore,
        scoreFactors: scoreFactors as Prisma.InputJsonValue,
        calculatedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async getTopProviders(params: { nodeType?: string; city?: string; speciality?: string; limit?: number; sortBy?: string }) {
    const where: Prisma.ProviderGraphNodeWhereInput = {
      ProviderScore: { isNot: null }
    };
    if (params.nodeType) where.nodeType = params.nodeType as ProviderNodeType;
    if (params.city) where.city = { contains: params.city, mode: 'insensitive' };
    if (params.speciality) where.speciality = { contains: params.speciality, mode: 'insensitive' };

    const nodes = await this.prisma.providerGraphNode.findMany({
      where,
      include: { ProviderScore: true },
      take: params.limit ?? 20,
    });

    return nodes
      .map((n) => ({
        id: n.id,
        name: n.name,
        nodeType: n.nodeType,
        speciality: n.speciality,
        city: n.city,
        score: n.ProviderScore,
      }))
      .sort((a, b) => (b.score?.overallScore ?? 0) - (a.score?.overallScore ?? 0));
  }
}
