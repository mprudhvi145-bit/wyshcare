/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/telemedicine/pre-consult-context.service.ts
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
 * Business logic service for telemedicine
 *
 * Responsibilities:
 * - Execute business logic for telemedicine operations
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
Telemedicine
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
import { PrismaService } from '../../providers/prisma/prisma.service';
import { HealthTwinService } from '../health-twin/health-twin.service';
import { AiGraphService } from '../ai/services/ai-graph.service';

export interface PreConsultContext {
  patientSummary: {
    name: string | null;
    age: number | null;
    gender: string | null;
    bloodGroup: string | null;
  };
  activeConditions: string[];
  medications: Array<{ name: string; dosage: string | null; frequency: string | null }>;
  risks: string[];
  recentLabs: Array<{ type: string; summary: string | null; date: string }>;
  carePlans: Array<{ title: string; type: string; status: string; adherence: number | null }>;
  previousConsultations: Array<{ date: string; doctor: string; summary: string | null }>;
  abdmStatus: { linked: boolean; abhaAddress: string | null };
  graphSummary: { nodes: number; edges: number; conditions: string[]; medications: string[] };
}

@Injectable()
export class PreConsultContextService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly twin: HealthTwinService,
    private readonly graph: AiGraphService,
  ) {}

  async assemble(patientUserId: string): Promise<PreConsultContext> {
    const twin = await this.twin.getTwin(patientUserId);
    const graphData = await this.graph.getPatientGraph(patientUserId);

    const previousSessions = await this.prisma.consultationSession.findMany({
      where: { patientUserId, endedAt: { not: null } },
      include: {
        doctorProfile: { include: { user: { select: { fullName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      patientSummary: {
        name: twin.profile.name,
        age: twin.profile.age,
        gender: twin.profile.gender,
        bloodGroup: twin.profile.bloodGroup,
      },
      activeConditions: twin.graph.conditions,
      medications: twin.activeMedications,
      risks: twin.riskFactors,
      recentLabs: twin.recentLabs,
      carePlans: twin.currentCarePlans.map((p) => ({
        title: p.title,
        type: p.type,
        status: p.status,
        adherence: p.adherence,
      })),
      previousConsultations: previousSessions.map((s) => ({
        date: s.createdAt.toISOString().slice(0, 10),
        doctor: s.doctorProfile.user.fullName,
        summary: s.aiSummary,
      })),
      abdmStatus: twin.abdmStatus,
      graphSummary: {
        nodes: graphData.nodes.length,
        edges: graphData.edges.length,
        conditions: graphData.nodes.filter((n) => n.nodeType === 'CONDITION').map((n) => n.title),
        medications: graphData.nodes.filter((n) => n.nodeType === 'MEDICATION').map((n) => n.title),
      },
    };
  }
}
