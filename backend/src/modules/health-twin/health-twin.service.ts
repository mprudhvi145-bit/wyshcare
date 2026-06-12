/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/health-twin/health-twin.service.ts
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
 * Business logic service for health-twin
 *
 * Responsibilities:
 * - Execute business logic for health operations
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
Health
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

import { Injectable, Inject } from '@nestjs/common';

import { AI_PROVIDER_TOKEN } from '../../providers/ai/ai-provider.module';
import type { AIProvider } from '../../providers/ai/ai.types';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { AiGraphService } from '../ai/services/ai-graph.service';
import { HealthGraphService } from '../health-graph/health-graph.service';
import { DomainEventsService } from '../../providers/events/events.service';

export interface HealthTwinData {
  profile: {
    name: string | null;
    age: number | null;
    gender: string | null;
    bloodGroup: string | null;
    conditions: string[];
    allergies: string[];
    abhaAddress: string | null;
  };
  graph: {
    nodes: number;
    edges: number;
    conditions: string[];
    medications: string[];
    procedures: string[];
  };
  riskFactors: string[];
  currentCarePlans: {
    type: string;
    title: string;
    status: string;
    adherence: number | null;
    goals: string[];
  }[];
  medicationAdherence: {
    total: number;
    taken: number;
    missed: number;
    skipped: number;
    rate: number;
  };
  upcomingAppointments: {
    id: string;
    date: string;
    doctor: string;
    status: string;
    reason: string | null;
  }[];
  recentAppointments: {
    date: string;
    doctor: string;
    status: string;
    reason: string | null;
  }[];
  activeMedications: {
    name: string;
    dosage: string | null;
    frequency: string | null;
  }[];
  recentLabs: {
    type: string;
    summary: string | null;
    date: string;
  }[];
  familyContext: {
    relation: string;
    name: string;
  }[];
  abdmStatus: {
    linked: boolean;
    abhaAddress: string | null;
  };
}

@Injectable()
export class HealthTwinService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly graph: AiGraphService,
    private readonly healthGraph: HealthGraphService,
    @Inject(AI_PROVIDER_TOKEN) private readonly ai: AIProvider,
    private readonly events: DomainEventsService,
  ) {}

  async getTwin(userId: string): Promise<HealthTwinData> {
    const graphData = await this.graph.getPatientGraph(userId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        wyshId: true,
        phoneNumber: true,
        email: true,
        fullName: true,
        gender: true,
        dateOfBirth: true,
        bloodGroup: true,
        chronicConditions: true,
        allergiesSummary: true,
        abhaAddress: true,
      },
    });

    const appointments = await this.prisma.appointment.findMany({
      where: { patientUserId: userId },
      orderBy: { slotStartAt: 'desc' },
      take: 10,
      include: { doctorProfile: { include: { user: { select: { fullName: true } } } } },
    });

    const medications = await this.prisma.medication.findMany({
      where: { healthRecord: { userId } },
      distinct: ['name'],
      select: { name: true, dosage: true, frequency: true },
      take: 20,
    });

    const labs = await this.prisma.diagnosticReport.findMany({
      where: { patientUserId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { reportType: true, summary: true, createdAt: true },
    });

    const carePlans = await this.prisma.carePlan.findMany({
      where: { userId, status: 'ACTIVE' },
      select: { type: true, title: true, status: true, adherenceScore: true, goals: true },
    });

    const adherenceLogs = await this.prisma.medicationAdherenceLog.findMany({
      where: { userId, loggedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60_000) } },
      select: { status: true },
    });

    const adherence = {
      total: adherenceLogs.length,
      taken: adherenceLogs.filter((l) => l.status === 'TAKEN').length,
      missed: adherenceLogs.filter((l) => l.status === 'MISSED').length,
      skipped: adherenceLogs.filter((l) => l.status === 'SKIPPED').length,
      rate: adherenceLogs.length > 0
        ? Math.round((adherenceLogs.filter((l) => l.status === 'TAKEN').length / adherenceLogs.length) * 100)
        : 0,
    };

    const now = new Date();
    const upcomingAppointments = await this.prisma.appointment.findMany({
      where: {
        patientUserId: userId,
        slotStartAt: { gte: now },
        status: { in: ['REQUESTED', 'CONFIRMED', 'IN_PROGRESS'] },
      },
      orderBy: { slotStartAt: 'asc' },
      take: 5,
      include: { doctorProfile: { include: { user: { select: { fullName: true } } } } },
    });

    const familyMembers = await this.prisma.familyRelation.findMany({
      where: { actorUserId: userId },
      include: { subject: { select: { fullName: true } } },
    });

    const abdmLinkage = await this.prisma.aBDMLinkage.findUnique({
      where: { userId },
      select: { abhaAddress: true },
    });

    const graphConditions = graphData.nodes.filter((n) => n.nodeType === 'CONDITION').map((n) => n.title);
    let riskFactors: string[];

    try {
      const graphRisk = await this.healthGraph.assessRisks(userId);
      riskFactors = graphRisk.risks.map((r) => r.risk);
    } catch {
      const V2Risks = this.assessRiskFactors(
        user?.chronicConditions ?? [],
        graphConditions,
        user?.dateOfBirth ? this.calcAge(user.dateOfBirth) : null,
        user?.bloodGroup ?? null,
        adherence.rate,
      );
      riskFactors = V2Risks;
    }

    return {
      profile: {
        name: user?.fullName ?? null,
        age: user?.dateOfBirth ? this.calcAge(user.dateOfBirth) : null,
        gender: user?.gender ?? null,
        bloodGroup: user?.bloodGroup ?? null,
        conditions: user?.chronicConditions ?? [],
        allergies: user?.allergiesSummary ?? [],
        abhaAddress: user?.abhaAddress ?? null,
      },
      graph: {
        nodes: graphData.nodes.length,
        edges: graphData.edges.length,
        conditions: graphConditions,
        medications: graphData.nodes.filter((n) => n.nodeType === 'MEDICATION').map((n) => n.title),
        procedures: graphData.nodes.filter((n) => n.nodeType === 'PROCEDURE').map((n) => n.title),
      },
      riskFactors,
      currentCarePlans: carePlans.map((p) => ({
        type: p.type,
        title: p.title,
        status: p.status,
        adherence: p.adherenceScore,
        goals: p.goals,
      })),
      medicationAdherence: adherence,
      upcomingAppointments: upcomingAppointments.map((a) => ({
        id: a.id,
        date: a.slotStartAt.toISOString(),
        doctor: a.doctorProfile.user.fullName,
        status: a.status,
        reason: a.reason,
      })),
      recentAppointments: appointments.slice(0, 5).map((a) => ({
        date: a.slotStartAt.toISOString().slice(0, 10),
        doctor: a.doctorProfile.user.fullName,
        status: a.status,
        reason: a.reason,
      })),
      activeMedications: medications,
      recentLabs: labs.map((l) => ({
        type: l.reportType,
        summary: l.summary?.slice(0, 100) ?? null,
        date: l.createdAt.toISOString().slice(0, 10),
      })),
      familyContext: familyMembers.map((f) => ({
        relation: f.relationship,
        name: f.subject.fullName,
      })),
      abdmStatus: {
        linked: !!abdmLinkage,
        abhaAddress: abdmLinkage?.abhaAddress ?? user?.abhaAddress ?? null,
      },
    };
  }

  async askQuestion(userId: string, question: string) {
    const twin = await this.getTwin(userId);

    const prompt = `You are a medical AI health twin assistant. Answer the patient's question based ONLY on their health data provided below. If the answer is not in the data, say "I don't have enough information to answer that question."

PATIENT HEALTH TWIN DATA:
${JSON.stringify(twin, null, 2)}

PATIENT QUESTION: ${question}

Provide a concise, helpful response in plain text. Do NOT make up information. If recommending a doctor visit, say so clearly.`;

    const result = await this.ai.chat(prompt, { temperature: 0.3 });

    return {
      question,
      answer: result,
      dataFreshness: new Date().toISOString(),
    };
  }

  private assessRiskFactors(
    chronicConditions: string[],
    graphConditions: string[],
    age: number | null,
    bloodGroup: string | null,
    adherenceRate: number,
  ): string[] {
    const risks: string[] = [];
    const allConditions = [...new Set([...chronicConditions, ...graphConditions])];

    if (allConditions.some((c) => /diabetes/i.test(c))) risks.push('Diabetes management required');
    if (allConditions.some((c) => /hypertension|bp|blood pressure/i.test(c))) risks.push('Blood pressure monitoring recommended');
    if (allConditions.some((c) => /heart|cardiac|chd|cad/i.test(c))) risks.push('Cardiovascular risk — regular cardiac evaluation advised');
    if (age && age > 60) risks.push('Age-related risk — geriatric screening recommended');
    if (age && age > 45 && allConditions.length === 0) risks.push('Age-appropriate preventive screening recommended');
    if (adherenceRate < 70) risks.push('Low medication adherence — intervention recommended');
    if (bloodGroup && ['A+', 'A-', 'B+', 'B-'].includes(bloodGroup) && allConditions.some((c) => /diabetes/i.test(c))) {
      risks.push('Higher cardiovascular risk with this blood group and diabetes');
    }

    return risks;
  }

  private calcAge(dob: Date): number {
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    return age;
  }
}
