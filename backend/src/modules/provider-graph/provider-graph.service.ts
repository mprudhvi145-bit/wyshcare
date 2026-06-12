/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/provider-graph/provider-graph.service.ts
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

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ProviderNodeType, ProviderEdgeType } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../providers/prisma/prisma.service';
import type { CreateNodeDto, CreateEdgeDto, GraphQueryDto, TraverseDto } from './dto/graph.dto';

@Injectable()
export class ProviderGraphService {
  constructor(private readonly prisma: PrismaService) {}

  private mapNode(node: any) {
    if (!node) return null;
    return {
      ...node,
      scores: node.ProviderScore ? [node.ProviderScore] : [],
      networkMemberships: node.ProviderNetwork || [],
      edgesFrom: (node.ProviderGraphEdge_ProviderGraphEdge_fromNodeIdToProviderGraphNode || []).map((e: any) => ({
        ...e,
        toNode: e.ProviderGraphNode_ProviderGraphEdge_toNodeIdToProviderGraphNode,
      })),
      edgesTo: (node.ProviderGraphEdge_ProviderGraphEdge_toNodeIdToProviderGraphNode || []).map((e: any) => ({
        ...e,
        fromNode: e.ProviderGraphNode_ProviderGraphEdge_fromNodeIdToProviderGraphNode,
      })),
      referralsSent: node.Referral_Referral_fromProviderIdToProviderGraphNode || [],
      referralsReceived: node.Referral_Referral_toProviderIdToProviderGraphNode || [],
    };
  }

  async createNode(dto: CreateNodeDto) {
    return this.prisma.providerGraphNode.create({
      data: {
        id: randomUUID(),
        nodeType: dto.nodeType as ProviderNodeType,
        externalId: dto.externalId,
        name: dto.name,
        slug: dto.slug,
        speciality: dto.speciality,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
        latitude: dto.latitude,
        longitude: dto.longitude,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
        updatedAt: new Date(),
      },
    });
  }

  async createEdge(dto: CreateEdgeDto) {
    const [from, to] = await Promise.all([
      this.prisma.providerGraphNode.findUnique({ where: { id: dto.fromNodeId } }),
      this.prisma.providerGraphNode.findUnique({ where: { id: dto.toNodeId } }),
    ]);
    if (!from) throw new NotFoundException(`From-node ${dto.fromNodeId} not found`);
    if (!to) throw new NotFoundException(`To-node ${dto.toNodeId} not found`);

    try {
      return await this.prisma.providerGraphEdge.create({
        data: {
          id: randomUUID(),
          fromNodeId: dto.fromNodeId,
          toNodeId: dto.toNodeId,
          edgeType: dto.edgeType as ProviderEdgeType,
          weight: dto.weight ?? 1.0,
          metadata: dto.metadata as Prisma.InputJsonValue | undefined,
        },
      });
    } catch (err: unknown) {
      if ((err as Record<string, unknown>).code === 'P2002') throw new ConflictException('Edge already exists');
      throw err;
    }
  }

  async search(dto: GraphQueryDto) {
    const where: Prisma.ProviderGraphNodeWhereInput = { isActive: true };
    if (dto.nodeType) where.nodeType = dto.nodeType as ProviderNodeType;
    if (dto.speciality) where.speciality = { contains: dto.speciality, mode: 'insensitive' };
    if (dto.city) where.city = { contains: dto.city, mode: 'insensitive' };
    if (dto.query) {
      where.OR = [
        { name: { contains: dto.query, mode: 'insensitive' } },
        { speciality: { contains: dto.query, mode: 'insensitive' } },
        { city: { contains: dto.query, mode: 'insensitive' } },
      ];
    }

    const nodes = await this.prisma.providerGraphNode.findMany({
      where,
      include: {
        ProviderScore: true,
        ProviderNetwork: { where: { isActive: true } },
      },
      take: dto.limit ?? 50,
      orderBy: { name: 'asc' },
    });

    const mapped = nodes.map(n => this.mapNode(n));

    if (dto.latitude != null && dto.longitude != null && dto.maxDistance != null) {
      return this.filterByDistance(mapped as any, dto.latitude, dto.longitude, dto.maxDistance);
    }

    return mapped;
  }

  private filterByDistance(nodes: Array<{ latitude: number | null; longitude: number | null }>, lat: number, lng: number, maxKm: number) {
    return nodes.filter((n) => {
      if (n.latitude == null || n.longitude == null) return false;
      return this.haversineKm(lat, lng, n.latitude, n.longitude) <= maxKm;
    });
  }

  private haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async traverse(dto: TraverseDto) {
    const visited = new Set<string>();
    const result: unknown[] = [];
    const queue: Array<{ nodeId: string; depth: number }> = [{ nodeId: dto.startNodeId, depth: 0 }];
    visited.add(dto.startNodeId);

    while (queue.length > 0) {
      const { nodeId, depth } = queue.shift()!;
      if (depth > (dto.maxDepth ?? 3)) continue;

      const node = await this.prisma.providerGraphNode.findUnique({
        where: { id: nodeId },
        include: {
          ProviderGraphEdge_ProviderGraphEdge_fromNodeIdToProviderGraphNode: {
            where: dto.edgeTypes?.length ? { edgeType: { in: dto.edgeTypes as ProviderEdgeType[] } } : undefined,
            include: { ProviderGraphNode_ProviderGraphEdge_toNodeIdToProviderGraphNode: true },
          },
          ProviderGraphEdge_ProviderGraphEdge_toNodeIdToProviderGraphNode: {
            where: dto.edgeTypes?.length ? { edgeType: { in: dto.edgeTypes as ProviderEdgeType[] } } : undefined,
            include: { ProviderGraphNode_ProviderGraphEdge_fromNodeIdToProviderGraphNode: true },
          },
        },
      });
      if (!node) continue;

      const mapped = this.mapNode(node);
      result.push(mapped);

      for (const edge of mapped!.edgesFrom) {
        if (!visited.has(edge.toNodeId) && depth + 1 <= (dto.maxDepth ?? 3)) {
          visited.add(edge.toNodeId);
          queue.push({ nodeId: edge.toNodeId, depth: depth + 1 });
        }
      }
      for (const edge of mapped!.edgesTo) {
        if (!visited.has(edge.fromNodeId) && depth + 1 <= (dto.maxDepth ?? 3)) {
          visited.add(edge.fromNodeId);
          queue.push({ nodeId: edge.fromNodeId, depth: depth + 1 });
        }
      }
    }

    return result;
  }

  async findById(id: string) {
    const node = await this.prisma.providerGraphNode.findUnique({
      where: { id },
      include: {
        ProviderGraphEdge_ProviderGraphEdge_fromNodeIdToProviderGraphNode: { include: { ProviderGraphNode_ProviderGraphEdge_toNodeIdToProviderGraphNode: true } },
        ProviderGraphEdge_ProviderGraphEdge_toNodeIdToProviderGraphNode: { include: { ProviderGraphNode_ProviderGraphEdge_fromNodeIdToProviderGraphNode: true } },
        ProviderScore: true,
        ProviderNetwork: { where: { isActive: true } },
        Referral_Referral_fromProviderIdToProviderGraphNode: { take: 10, orderBy: { createdAt: 'desc' } },
        Referral_Referral_toProviderIdToProviderGraphNode: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!node) throw new NotFoundException('Node not found');
    return this.mapNode(node);
  }

  async getStats() {
    const [byType, totalNodes, totalEdges] = await Promise.all([
      this.prisma.providerGraphNode.groupBy({
        by: ['nodeType'],
        _count: true,
      }),
      this.prisma.providerGraphNode.count(),
      this.prisma.providerGraphEdge.count(),
    ]);
    return { totalNodes, totalEdges, byType: byType.map((b) => ({ type: b.nodeType, count: b._count })) };
  }

  async findBestMatch(dto: { patientCondition?: string; needType?: string; city?: string; insuranceId?: string }) {
    const where: Prisma.ProviderGraphNodeWhereInput = { isActive: true };
    if (dto.city) where.city = { contains: dto.city, mode: 'insensitive' };
    if (dto.needType) where.nodeType = dto.needType as ProviderNodeType;

    const nodes = await this.prisma.providerGraphNode.findMany({
      where,
      include: { ProviderScore: true },
      take: 20,
    });

    const mapped = nodes.map(n => this.mapNode(n));

    const scored = mapped.map((n: any) => {
      let score = n.scores?.[0]?.overallScore ?? 5;
      if (dto.insuranceId) {
        score *= 1.2;
      }
      return { ...n, rankScore: score };
    });

    return scored.sort((a, b) => b.rankScore - a.rankScore);
  }
}
