/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai/services/ai-intelligence.service.ts
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
 - backend/src/modules/prescription/interaction-engine.service.ts
 - backend/src/modules/interoperability/interoperability.module.ts
 - backend/src/modules/digital-twin/digital-twin.service.ts
 - backend/src/main.ts
 - backend/src/modules/health-graph/health-graph.service.ts
 *
 * Calls:
 - common
 *
 * Dependencies:
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

import { Injectable, NotFoundException } from '@nestjs/common';

import { AiOrchestratorService } from '../../../providers/ai/ai-orchestrator.service';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { AiGraphService } from './ai-graph.service';

@Injectable()
export class AiIntelligenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiOrchestrator: AiOrchestratorService,
    private readonly graph: AiGraphService,
  ) {}

  async explainRecord(userId: string, recordId: string) {
    const record = await this.prisma.healthRecord.findFirst({
      where: { id: recordId, userId, deletedAt: null },
      include: { diagnostics: true, medications: true },
    });

    if (!record) throw new NotFoundException('Record not found');

    const hasStructured = record.structuredPayload as Record<string, unknown> | null;

    if (record.recordType === 'PRESCRIPTION' && hasStructured) {
      const meds = (hasStructured.medications as Array<{ name: string; dosage?: string; frequency?: string }>) ?? [];
      const explanation = (await this.aiOrchestrator.chat(`Review the following medications for any potential drug-drug interactions, contraindications, or warnings. Explain clearly in patient-safe language:\n${JSON.stringify(meds, null, 2)}`)).content;
      return { recordId, recordType: record.recordType, explanation, source: 'ai' };
    }

    if (record.recordType === 'DIAGNOSTIC_REPORT' && hasStructured) {
      const results = (hasStructured as { results?: Array<{ test: string; value: string; unit?: string; referenceRange?: string; flag?: string }> }).results ?? [];
      const explanation = (await this.aiOrchestrator.chat(`Explain the following laboratory test results in clear, patient-safe language. Highlight any out-of-range markers and provide general, safe guidance:\n${JSON.stringify(results, null, 2)}`)).content;
      return { recordId, recordType: record.recordType, explanation, source: 'ai' };
    }

    if (record.extractedText) {
      const explanation = record.recordType === 'PRESCRIPTION'
        ? (await this.aiOrchestrator.chat(`Review the following medications for any potential drug-drug interactions, contraindications, or warnings. Explain clearly in patient-safe language:\n${JSON.stringify([{ name: record.title }], null, 2)}`)).content
        : (await this.aiOrchestrator.chat(`Explain this healthcare record in patient-safe language:\n${record.extractedText}`)).content;
      return { recordId, recordType: record.recordType, explanation, source: 'raw_text' };
    }

    return { recordId, recordType: record.recordType, explanation: 'No content available for analysis.', source: 'empty' };
  }

  async getHealthMemory(userId: string) {
    const graphData = await this.graph.getPatientGraph(userId);
    const graphContextLines: string[] = [];

    const nodeMap = new Map(graphData.nodes.map((n) => [n.id, n]));
    for (const edge of graphData.edges) {
      const from = nodeMap.get(edge.fromNodeId);
      const to = nodeMap.get(edge.toNodeId);
      if (from && to) {
        graphContextLines.push(`${from.title} --[${edge.relation}]--> ${to.title}`);
      }
    }

    const timeline = await this.prisma.timelineEvent.findMany({
      where: { userId },
      orderBy: { occurredAt: 'desc' },
      take: 50,
      select: { type: true, title: true, summary: true, occurredAt: true },
    });

    const history = timeline.map((e) => ({
      type: e.type,
      title: e.title,
      summary: e.summary,
      date: e.occurredAt.toISOString().slice(0, 10),
    }));

    const aiSummary = graphContextLines.length > 0
      ? await this.gemini.generateHealthMemorySummaryFromGraph(graphContextLines)
      : history.length > 0
        ? await this.gemini.generateHealthMemorySummary(history)
        : 'No health history available yet.';

    return {
      summary: aiSummary,
      graph: {
        nodes: graphData.nodes,
        edges: graphData.edges,
      },
      conditions: graphData.nodes.filter((n) => n.nodeType === 'CONDITION'),
      medications: graphData.nodes.filter((n) => n.nodeType === 'MEDICATION'),
      doctors: graphData.nodes.filter((n) => n.nodeType === 'DOCTOR'),
      labResults: graphData.nodes.filter((n) => n.nodeType === 'LAB_RESULT'),
      recentEvents: history.slice(0, 10),
    };
  }
}
