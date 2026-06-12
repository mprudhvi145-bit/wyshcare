/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai/services/ai-graph.service.ts
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
 * Business logic service for services
 *
 * Responsibilities:
 * - Execute business logic for ai operations
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
 *
 * Dependencies:
 - client
 - common
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
AI
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

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../providers/prisma/prisma.service';
import { GraphRelationType, GraphRelation } from '../constants/graph.constants';

export interface GraphNode {
  id: string;
  userId: string;
  nodeType: string;
  title: string;
  summary: string;
  confidenceScore: number;
  metadata: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GraphEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  relation: string;
  strength: number;
  metadata: Prisma.JsonValue | null;
  fromNode?: GraphNode;
  toNode?: GraphNode;
}

export interface PatientGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

@Injectable()
export class AiGraphService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureNode(
    userId: string,
    nodeType: string,
    title: string,
    summary?: string,
    confidenceScore = 0.9,
    metadata?: Prisma.JsonObject,
  ): Promise<GraphNode> {
    const normalized = this.normalizeTitle(title);
    const existing = await this.prisma.aIMemoryNode.findFirst({
      where: {
        userId,
        nodeType,
        title: { equals: normalized, mode: 'insensitive' },
      },
    });

    if (existing) {
      return this.prisma.aIMemoryNode.update({
        where: { id: existing.id },
        data: {
          summary: summary ?? existing.summary,
          confidenceScore: Math.max(existing.confidenceScore, confidenceScore),
          metadata: (metadata ?? existing.metadata) as Prisma.InputJsonValue,
          updatedAt: new Date(),
        },
      });
    }

    return this.prisma.aIMemoryNode.create({
      data: {
        userId,
        nodeType,
        title: normalized,
        summary: summary ?? normalized,
        confidenceScore,
        metadata,
      },
    });
  }

  async ensureEdge(
    fromNodeId: string,
    toNodeId: string,
    relation: string,
    strength = 0.8,
    metadata?: Prisma.JsonObject,
  ): Promise<GraphEdge> {
    return this.prisma.aIMemoryEdge.upsert({
      where: {
        fromNodeId_toNodeId_relation: { fromNodeId, toNodeId, relation },
      },
      update: {
        strength: Math.min(1, strength),
        metadata: metadata as Prisma.InputJsonValue ?? undefined,
      },
      create: {
        fromNodeId,
        toNodeId,
        relation,
        strength,
        metadata,
      },
    });
  }

  async getPatientGraph(userId: string): Promise<PatientGraph> {
    const nodes = await this.prisma.aIMemoryNode.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    const nodeIds = nodes.map((n) => n.id);
    const edges = await this.prisma.aIMemoryEdge.findMany({
      where: {
        OR: [{ fromNodeId: { in: nodeIds } }, { toNodeId: { in: nodeIds } }],
      },
      include: {
        fromNode: true,
        toNode: true,
      },
    });

    return { nodes, edges };
  }

  async createNodeWithEdges(
    userId: string,
    patientNodeId: string,
    nodeType: string,
    title: string,
    summary: string,
    relations: { relation: GraphRelationType; targetNodeId?: string; strength?: number }[],
    confidenceScore = 0.9,
  ): Promise<{ node: GraphNode; edges: GraphEdge[] }> {
    const node = await this.ensureNode(userId, nodeType, title, summary, confidenceScore);

    const edges: GraphEdge[] = [];
    for (const rel of relations) {
      if (rel.targetNodeId) {
        const edge = await this.ensureEdge(rel.targetNodeId, node.id, rel.relation, rel.strength ?? 0.8);
        edges.push(edge);
      }
    }

    const patientEdge = await this.ensureEdge(patientNodeId, node.id, nodeTypeToPatientRelation(nodeType));
    edges.push(patientEdge);

    return { node, edges };
  }

  async mergeDuplicateNodes(userId: string, nodeType: string): Promise<number> {
    const nodes = await this.prisma.aIMemoryNode.findMany({
      where: { userId, nodeType },
      orderBy: { updatedAt: 'desc' },
    });

    const groups = new Map<string, typeof nodes>();
    for (const node of nodes) {
      const key = this.normalizeTitle(node.title);
      const existing = groups.get(key) ?? [];
      existing.push(node);
      groups.set(key, existing);
    }

    let mergedCount = 0;
    for (const [, group] of groups) {
      if (group.length <= 1) continue;

      const keep = group[0];
      if (!keep) continue;
      for (const dupe of group.slice(1)) {
        await this.mergeNodeInto(dupe.id, keep.id);
        mergedCount++;
      }
    }

    return mergedCount;
  }

  async findNode(userId: string, nodeType: string, title: string): Promise<GraphNode | null> {
    const normalized = this.normalizeTitle(title);
    return this.prisma.aIMemoryNode.findFirst({
      where: {
        userId,
        nodeType,
        title: { equals: normalized, mode: 'insensitive' },
      },
    });
  }

  async getOrCreatePatientNode(userId: string): Promise<GraphNode> {
    return this.ensureNode(userId, 'PATIENT', 'Self', 'Patient health graph root node', 1.0);
  }

  normalizeTitle(title: string): string {
    return title
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\s*(\d+mg|\d+mcg|\d+g)\s*/gi, ' $1 ')
      .trim();
  }

  private async mergeNodeInto(fromId: string, intoId: string): Promise<void> {
    const edgesFrom = await this.prisma.aIMemoryEdge.findMany({
      where: { OR: [{ fromNodeId: fromId }, { toNodeId: fromId }] },
    });

    for (const edge of edgesFrom) {
      const newFromId = edge.fromNodeId === fromId ? intoId : edge.fromNodeId;
      const newToId = edge.toNodeId === fromId ? intoId : edge.toNodeId;

      if (newFromId === newToId) continue;

      try {
        await this.prisma.aIMemoryEdge.upsert({
          where: {
            fromNodeId_toNodeId_relation: {
              fromNodeId: newFromId,
              toNodeId: newToId,
              relation: edge.relation,
            },
          },
          update: {
            strength: Math.min(1, (edge.strength + 0.5)),
          },
          create: {
            fromNodeId: newFromId,
            toNodeId: newToId,
            relation: edge.relation,
            strength: edge.strength,
          },
        });
      } catch {
        // duplicate, skip
      }
    }

    await this.prisma.aIMemoryEdge.deleteMany({
      where: { OR: [{ fromNodeId: fromId }, { toNodeId: fromId }] },
    });

    await this.prisma.aIMemoryNode.delete({ where: { id: fromId } });
  }
}

function nodeTypeToPatientRelation(nodeType: string): string {
  const map: Record<string, string> = {
    CONDITION: GraphRelation.HAS_CONDITION,
    MEDICATION: GraphRelation.TAKES_MEDICATION,
    DOCTOR: GraphRelation.VISITED_DOCTOR,
    TEST: GraphRelation.ORDERED_TEST,
    REPORT: GraphRelation.HAS_REPORT,
    LAB_RESULT: GraphRelation.HAS_REPORT,
    FAMILY: GraphRelation.FAMILY_MEMBER,
  };
  return map[nodeType] ?? 'HAS_REPORT';
}
