/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/health-graph/health-graph.service.ts
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
 * Business logic service for health-graph
 *
 * Responsibilities:
 * - Execute business logic for health graph operations
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
 - backend/src/modules/search/search.controller.ts
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
Health Graph
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
import type { Prisma } from '@prisma/client';

import { AI_PROVIDER_TOKEN } from '../../providers/ai/ai-provider.module';
import type { AIProvider } from '../../providers/ai/ai.types';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { AiGraphService } from '../ai/services/ai-graph.service';
import { DomainEventsService } from '../../providers/events/events.service';
import {
  GraphRelation,
  CLINICAL_RULES,
  NODE_TYPE_TO_PATIENT_RELATION,
} from './health-graph.constants';

export interface GraphNodeResult {
  id: string;
  nodeType: string;
  title: string;
  summary: string;
  confidenceScore: number;
  createdAt: Date;
  metadata: Prisma.JsonValue | null;
}

export interface GraphEdgeResult {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  relation: string;
  strength: number;
  fromNode?: GraphNodeResult;
  toNode?: GraphNodeResult;
}

export interface PatientGraphData {
  nodes: GraphNodeResult[];
  edges: GraphEdgeResult[];
}

export interface RiskAssessment {
  risks: Array<{
    name: string;
    risk: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    triggeredBy: string[];
  }>;
  score: number;
  level: 'low' | 'moderate' | 'elevated' | 'high' | 'critical';
}

export interface GraphQueryResult {
  answer: string;
  evidence: Array<{
    nodeType: string;
    title: string;
    relation: string;
  }>;
  path?: Array<{ from: string; relation: string; to: string }>;
}

@Injectable()
export class HealthGraphService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly graph: AiGraphService,
    @Inject(AI_PROVIDER_TOKEN) private readonly ai: AIProvider,
    private readonly events: DomainEventsService,
  ) {}

  async getPatientGraph(userId: string): Promise<PatientGraphData> {
    return this.graph.getPatientGraph(userId);
  }

  async addNode(
    userId: string,
    nodeType: string,
    title: string,
    summary?: string,
    confidenceScore = 0.9,
    metadata?: Record<string, unknown>,
  ): Promise<GraphNodeResult> {
    const patientNode = await this.graph.getOrCreatePatientNode(userId);
    const node = await this.graph.ensureNode(
      userId,
      nodeType,
      title,
      summary,
      confidenceScore,
      metadata as Prisma.JsonObject,
    );

    const patientRelation = NODE_TYPE_TO_PATIENT_RELATION[nodeType];
    if (patientRelation && patientNode.id !== node.id) {
      await this.graph.ensureEdge(patientNode.id, node.id, patientRelation, 0.9);
    }

    return node;
  }

  async addEdge(
    fromNodeId: string,
    toNodeId: string,
    relation: string,
    strength = 0.8,
    metadata?: Record<string, unknown>,
  ): Promise<GraphEdgeResult> {
    return this.graph.ensureEdge(fromNodeId, toNodeId, relation, strength, metadata as Prisma.JsonObject);
  }

  async findNodes(
    userId: string,
    nodeType?: string,
    search?: string,
  ): Promise<GraphNodeResult[]> {
    const where: Prisma.AIMemoryNodeWhereInput = { userId };
    if (nodeType) where.nodeType = nodeType;
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    return this.prisma.aIMemoryNode.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findNodeConnections(nodeId: string, _depth = 1): Promise<{
    node: GraphNodeResult | null;
    connections: Array<{ edge: GraphEdgeResult; connectedNode: GraphNodeResult }>;
  }> {
    const node = await this.prisma.aIMemoryNode.findUnique({ where: { id: nodeId } });
    if (!node) return { node: null, connections: [] };

    const edges = await this.prisma.aIMemoryEdge.findMany({
      where: {
        OR: [{ fromNodeId: nodeId }, { toNodeId: nodeId }],
      },
      include: { fromNode: true, toNode: true },
    });

    const connections = edges.map((e) => ({
      edge: e,
      connectedNode: (e.fromNodeId === nodeId ? e.toNode : e.fromNode) as GraphNodeResult,
    }));

    return { node, connections };
  }

  async findPaths(
    userId: string,
    fromType?: string,
    fromTitle?: string,
    toType?: string,
    toTitle?: string,
    maxDepth = 4,
  ): Promise<Array<{ path: Array<{ node: string; type: string; relation: string }> }>> {
    const nodes = await this.prisma.aIMemoryNode.findMany({
      where: { userId },
    });

    const fromNode = fromTitle
      ? nodes.find((n) => (fromType ? n.nodeType === fromType : true) && n.title.toLowerCase().includes(fromTitle.toLowerCase()))
      : fromType ? nodes.find((n) => n.nodeType === fromType) : nodes[0];

    const toNode = toTitle
      ? nodes.find((n) => (toType ? n.nodeType === toType : true) && n.title.toLowerCase().includes(toTitle.toLowerCase()))
      : toType ? nodes.find((n) => n.nodeType === toType) : undefined;

    if (!fromNode || !toNode || fromNode.id === toNode.id) {
      return [];
    }

    const allEdges = await this.prisma.aIMemoryEdge.findMany({
      where: {
        OR: [
          { fromNode: { userId } },
          { toNode: { userId } },
        ],
      },
    });

    const adjacency = new Map<string, Array<{ targetId: string; relation: string }>>();
    for (const edge of allEdges) {
      const existing = adjacency.get(edge.fromNodeId) ?? [];
      existing.push({ targetId: edge.toNodeId, relation: edge.relation });
      adjacency.set(edge.fromNodeId, existing);
    }

    const paths = this.bfsFindAllPaths(
      fromNode.id,
      toNode.id,
      adjacency,
      maxDepth,
    );

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    return paths.map((pathIds) => ({
      path: pathIds.map((p, i) => {
        const edgeInfo = i > 0
          ? adjacency.get(pathIds[i - 1]!)?.find((e) => e.targetId === p)
          : null;
        const node = nodeMap.get(p);
        return {
          node: node?.title ?? 'unknown',
          type: node?.nodeType ?? 'unknown',
          relation: edgeInfo?.relation ?? 'start',
        };
      }),
    }));
  }

  async assessRisks(userId: string): Promise<RiskAssessment> {
    const graphData = await this.graph.getPatientGraph(userId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { dateOfBirth: true, chronicConditions: true },
    });

    const age = user?.dateOfBirth ? this.calcAge(user.dateOfBirth) : null;

    const adherenceLogs = await this.prisma.medicationAdherenceLog.findMany({
      where: { userId, loggedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60_000) } },
    });
    const adherenceRate = adherenceLogs.length > 0
      ? Math.round((adherenceLogs.filter((l) => l.status === 'TAKEN').length / adherenceLogs.length) * 100)
      : 100;

    const triggeredRisks: RiskAssessment['risks'] = [];

    for (const rule of CLINICAL_RULES) {
      const matchResults: string[] = [];
      const conditionCounts = new Map<string, number>();

      for (const cond of rule.conditions) {
        const matchingNodes = graphData.nodes.filter((n) => {
          if (n.nodeType !== cond.nodeType) return false;
          if (cond.titlePattern && !cond.titlePattern.test(n.title)) return false;
          return true;
        });
        conditionCounts.set(cond.nodeType, matchingNodes.length);
        const minRequired = cond.minCount ?? 1;
        if (matchingNodes.length >= minRequired) {
          matchResults.push(...matchingNodes.map((n) => `${n.nodeType}:${n.title}`));
        }
      }

      const allConditionsMet = rule.conditions.every((cond) => {
        const count = conditionCounts.get(cond.nodeType) ?? 0;
        return count >= (cond.minCount ?? 1);
      });

      if (!allConditionsMet) continue;

      if (rule.context) {
        if (rule.context.minAge !== undefined && (age === null || age < rule.context.minAge)) continue;
        if (rule.context.adherenceBelow !== undefined && adherenceRate >= rule.context.adherenceBelow) continue;
      }

      triggeredRisks.push({
        name: rule.name,
        risk: rule.risk,
        severity: rule.severity,
        triggeredBy: matchResults,
      });
    }

    const score = this.calculateRiskScore(triggeredRisks);
    const level = this.riskLevel(score);

    return { risks: triggeredRisks, score, level };
  }

  async queryGraph(userId: string, question: string): Promise<GraphQueryResult> {
    const graphData = await this.graph.getPatientGraph(userId);
    const matchingPattern = this.findMatchingPattern(question);

    const relevantNodes = matchingPattern
      ? this.filterRelevantNodes(graphData.nodes, matchingPattern)
      : graphData.nodes;

    const nodeIds = new Set(relevantNodes.map((n) => n.id));
    const relevantEdges = graphData.edges.filter(
      (e) => nodeIds.has(e.fromNodeId) || nodeIds.has(e.toNodeId),
    );

    const evidence = relevantNodes.slice(0, 10).map((n) => {
      const edge = relevantEdges.find(
        (e) => e.fromNodeId === n.id || e.toNodeId === n.id,
      );
      return {
        nodeType: n.nodeType,
        title: n.title,
        relation: edge?.relation ?? 'self',
      };
    });

    const path = relevantEdges.slice(0, 15).map((e) => ({
      from: e.fromNode?.title ?? '?',
      relation: e.relation,
      to: e.toNode?.title ?? '?',
    }));

    const prompt = [
      'You are a clinical graph analyst. Answer the question based ONLY on the patient health graph data provided.',
      'Use the node connections to explain your reasoning. Be concise and clinical.',
      '',
      `Question: ${question}`,
      '',
      'Patient graph nodes:',
      ...relevantNodes.slice(0, 20).map((n) => `  - ${n.nodeType}: ${n.title} (confidence: ${n.confidenceScore})`),
      '',
      'Graph connections:',
      ...relevantEdges.slice(0, 20).map((e) => `  ${e.fromNode?.title ?? '?'} --[${e.relation}]--> ${e.toNode?.title ?? '?'}`),
      '',
      'Answer the question using only the graph data above. If insufficient data, say so.',
    ].join('\n');

    const answer = await this.ai.chat(prompt, { temperature: 0.3 });

    return { answer, evidence, path };
  }

  async syncFromConsultation(consultationId: string): Promise<void> {
    const session = await this.prisma.consultationSession.findUnique({
      where: { id: consultationId },
      include: {
        patientUser: { select: { id: true } },
        doctorProfile: { include: { user: { select: { id: true } } } },
        ConsultationSOAP: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    if (!session) return;

    const patientNode = await this.graph.getOrCreatePatientNode(session.patientUserId);

    const consultationNode = await this.graph.ensureNode(
      session.patientUserId,
      'CONSULTATION',
      `Consultation ${session.id.slice(0, 8)}`,
      `Consultation at ${session.createdAt.toISOString().slice(0, 10)}`,
      0.9,
      { consultationId: session.id, mode: session.mode },
    );

    await this.graph.ensureEdge(patientNode.id, consultationNode.id, GraphRelation.CONSULTED_FOR, 1.0);

    const doctorNode = await this.graph.ensureNode(
      session.doctorProfile.userId,
      'DOCTOR',
      `Doctor ${session.doctorProfileId.slice(0, 8)}`,
      `Doctor profile for consultation`,
      0.9,
      { doctorProfileId: session.doctorProfileId },
    );

    if (patientNode.id !== doctorNode.id) {
      await this.graph.ensureEdge(patientNode.id, doctorNode.id, GraphRelation.VISITED_DOCTOR, 1.0);
    }
    if (doctorNode.id !== consultationNode.id) {
      await this.graph.ensureEdge(doctorNode.id, consultationNode.id, 'CONDUCTED', 0.9);
    }

    const soap = session.ConsultationSOAP[0];
    if (soap?.assessment) {
      const conditions = this.extractConditions(soap.assessment);
      for (const condition of conditions) {
        const condNode = await this.graph.ensureNode(
          session.patientUserId,
          'CONDITION',
          condition,
          `Assessed during consultation ${session.id.slice(0, 8)}`,
          0.85,
        );
        if (patientNode.id !== condNode.id) {
          await this.graph.ensureEdge(patientNode.id, condNode.id, GraphRelation.HAS_CONDITION, 0.85);
        }
        if (condNode.id !== consultationNode.id) {
          await this.graph.ensureEdge(condNode.id, consultationNode.id, 'DIAGNOSED_IN', 0.8);
        }
      }
    }

    if (soap?.plan) {
      const medications = this.extractMedications(soap.plan);
      for (const med of medications) {
        const medNode = await this.graph.ensureNode(
          session.patientUserId,
          'MEDICATION',
          med,
          `Prescribed during consultation ${session.id.slice(0, 8)}`,
          0.85,
        );
        if (patientNode.id !== medNode.id) {
          await this.graph.ensureEdge(patientNode.id, medNode.id, GraphRelation.TAKES_MEDICATION, 0.85);
        }
        if (medNode.id !== consultationNode.id) {
          await this.graph.ensureEdge(consultationNode.id, medNode.id, GraphRelation.PRESCRIBED, 0.9);
        }
      }
    }
  }

  async syncFromLabReport(reportId: string): Promise<void> {
    const report = await this.prisma.diagnosticReport.findUnique({
      where: { id: reportId },
      include: { patientUser: { select: { id: true } } },
    });
    if (!report) return;

    const patientNode = await this.graph.getOrCreatePatientNode(report.patientUserId);

    const labNode = await this.graph.ensureNode(
      report.patientUserId,
      'LAB_RESULT',
      `${report.reportType} (${report.createdAt.toISOString().slice(0, 10)})`,
      report.summary?.slice(0, 200) ?? `${report.reportType} report`,
      0.85,
      { reportId: report.id, reportType: report.reportType, date: report.createdAt.toISOString() },
    );

    if (patientNode.id !== labNode.id) {
      await this.graph.ensureEdge(patientNode.id, labNode.id, GraphRelation.UNDERWENT_TEST, 0.9);
    }

    const testNodeType = report.reportType.includes('Blood') || report.reportType.includes('Hb') || report.reportType.includes('Lipid')
      ? 'LAB_TEST'
      : 'LAB_RESULT';

    const testNode = await this.graph.ensureNode(
      report.patientUserId,
      testNodeType,
      report.reportType,
      `Test performed on ${report.createdAt.toISOString().slice(0, 10)}`,
      0.85,
    );

    if (testNode.id !== labNode.id) {
      await this.graph.ensureEdge(testNode.id, labNode.id, GraphRelation.HAS_RESULT, 0.9);
    }
  }

  async syncFromAppointment(appointmentId: string): Promise<void> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patientUser: { select: { id: true } },
        doctorProfile: { include: { user: { select: { id: true, fullName: true } } } },
      },
    });
    if (!appointment) return;

    const patientNode = await this.graph.getOrCreatePatientNode(appointment.patientUserId);

    const doctorNode = await this.graph.ensureNode(
      appointment.doctorUserId!,
      'DOCTOR',
      `Dr. ${appointment.doctorProfile.user.fullName ?? appointment.doctorProfileId}`,
      appointment.doctorProfile.specialization ?? 'Doctor',
      0.9,
      { doctorProfileId: appointment.doctorProfileId },
    );

    if (patientNode.id !== doctorNode.id) {
      await this.graph.ensureEdge(patientNode.id, doctorNode.id, GraphRelation.VISITED_DOCTOR, 0.9);
    }
  }

  async syncFromPrescription(prescriptionId: string): Promise<void> {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        patientUser: { select: { id: true } },
        doctorProfile: { include: { user: { select: { id: true } } } },
        PrescriptionItem: true,
      },
    });
    if (!prescription) return;

    const patientNode = await this.graph.getOrCreatePatientNode(prescription.patientUserId);

    const prescNode = await this.graph.ensureNode(
      prescription.patientUserId,
      'PRESCRIPTION',
      `Prescription ${prescription.id.slice(0, 8)}`,
      `Issued: ${(prescription.issuedAt ?? prescription.createdAt).toISOString().slice(0, 10)}`,
      0.95,
      { prescriptionId: prescription.id, status: prescription.status, itemCount: prescription.PrescriptionItem.length },
    );

    await this.graph.ensureEdge(patientNode.id, prescNode.id, GraphRelation.PRESCRIBED, 1.0);

    for (const item of prescription.PrescriptionItem) {
      const medNode = await this.graph.ensureNode(
        prescription.patientUserId,
        'MEDICATION',
        item.drugName,
        `${item.dosage} ${item.frequency} for ${item.durationDays} days`,
        0.9,
        { prescriptionItemId: item.id, dosage: item.dosage, frequency: item.frequency },
      );
      await this.graph.ensureEdge(patientNode.id, medNode.id, GraphRelation.TAKES_MEDICATION, 0.9);
      await this.graph.ensureEdge(prescNode.id, medNode.id, GraphRelation.PRESCRIBED, 0.95);
      await this.graph.ensureEdge(medNode.id, prescNode.id, GraphRelation.PRESCRIBED_BY, 0.95);
    }

    const doctorNode = await this.graph.ensureNode(
      prescription.doctorProfile?.user?.id ?? prescription.doctorProfileId ?? '',
      'DOCTOR',
      `Doctor ${prescription.doctorProfileId?.slice(0, 8) ?? 'Unknown'}`,
      'Prescribing doctor',
      0.9,
      { doctorProfileId: prescription.doctorProfileId },
    );

    if (doctorNode.id !== patientNode.id) {
      await this.graph.ensureEdge(patientNode.id, doctorNode.id, GraphRelation.VISITED_DOCTOR, 0.9);
    }
  }

  async getPatientSummary(userId: string) {
    const graphData = await this.graph.getPatientGraph(userId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, gender: true, dateOfBirth: true, bloodGroup: true },
    });
    const riskAssessment = await this.assessRisks(userId);

    const conditions = graphData.nodes.filter((n) => n.nodeType === 'CONDITION').map((n) => n.title);
    const medications = graphData.nodes.filter((n) => n.nodeType === 'MEDICATION').map((n) => n.title);
    const allergies = graphData.nodes.filter((n) => n.nodeType === 'ALLERGY').map((n) => n.title);
    const consultations = graphData.nodes.filter((n) => n.nodeType === 'CONSULTATION').length;
    const labResults = graphData.nodes.filter((n) => n.nodeType === 'LAB_RESULT' || n.nodeType === 'LAB_TEST').length;

    const nodeTypeCounts: Record<string, number> = {};
    for (const n of graphData.nodes) {
      nodeTypeCounts[n.nodeType] = (nodeTypeCounts[n.nodeType] ?? 0) + 1;
    }

    return {
      profile: {
        name: user?.fullName,
        age: user?.dateOfBirth ? this.calcAge(user.dateOfBirth) : null,
        gender: user?.gender,
        bloodGroup: user?.bloodGroup,
      },
      graphStats: {
        totalNodes: graphData.nodes.length,
        totalEdges: graphData.edges.length,
        byType: nodeTypeCounts,
      },
      clinicalSummary: {
        conditions,
        medications,
        allergies,
        consultationCount: consultations,
        labResultCount: labResults,
      },
      risks: riskAssessment,
    };
  }

  private filterRelevantNodes(nodes: GraphNodeResult[], pattern: typeof CLINICAL_RULES[0]): GraphNodeResult[] {
    const relevantTypes = new Set(pattern.conditions.map((c) => c.nodeType));
    return nodes.filter((n) => relevantTypes.has(n.nodeType));
  }

  private findMatchingPattern(question: string): (typeof CLINICAL_RULES)[0] | undefined {
    const lower = question.toLowerCase();
    return CLINICAL_RULES.find((rule) => {
      const keywords = rule.name.toLowerCase().split(/[\s/]+/);
      return keywords.some((kw) => kw.length > 3 && lower.includes(kw));
    });
  }

  private calculateRiskScore(risks: RiskAssessment['risks']): number {
    const severityWeights = { critical: 25, high: 15, medium: 8, low: 3 };
    let score = 0;
    for (const r of risks) {
      score += severityWeights[r.severity];
    }
    return Math.min(100, score);
  }

  private riskLevel(score: number): RiskAssessment['level'] {
    if (score >= 60) return 'critical';
    if (score >= 35) return 'high';
    if (score >= 20) return 'elevated';
    if (score >= 10) return 'moderate';
    return 'low';
  }

  private bfsFindAllPaths(
    fromId: string,
    toId: string,
    adjacency: Map<string, Array<{ targetId: string; relation: string }>>,
    maxDepth: number,
  ): string[][] {
    const results: string[][] = [];
    const queue: Array<{ nodeId: string; path: string[] }> = [{ nodeId: fromId, path: [fromId] }];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.path.length > maxDepth) continue;

      if (current.nodeId === toId && current.path.length > 1) {
        results.push(current.path);
        continue;
      }

      const neighbors = adjacency.get(current.nodeId) ?? [];
      for (const neighbor of neighbors) {
        if (current.path.includes(neighbor.targetId)) continue;
        queue.push({
          nodeId: neighbor.targetId,
          path: [...current.path, neighbor.targetId],
        });
      }
    }

    return results.slice(0, 5);
  }

  private extractConditions(text: string): string[] {
    const knownConditions = [
      'hypertension', 'diabetes', 'asthma', 'copd', 'ckd', 'hypothyroidism',
      'hyperthyroidism', 'anemia', 'arthritis', 'osteoporosis', 'depression',
      'anxiety', 'hyperlipidemia', 'obesity', 'gerd', 'ibs', 'cardiac',
      'heart failure', 'cad', 'chd', 'stroke', 'tia', 'dementia',
      'parkinson', 'epilepsy', 'migraine', 'pneumonia', 'tuberculosis',
      'hepatitis', 'hiv', 'cancer', 'melanoma', 'leukemia',
    ];
    const lower = text.toLowerCase();
    return knownConditions.filter((c) => lower.includes(c));
  }

  private extractMedications(text: string): string[] {
    const commonMeds = [
      'amlodipine', 'metformin', 'atorvastatin', 'lisinopril', 'losartan',
      'omeprazole', 'pantoprazole', 'aspirin', 'clopidogrel', 'furosemide',
      'metoprolol', 'carvedilol', 'insulin', 'glimepiride', 'sitagliptin',
      'levothyroxine', 'albuterol', 'prednisone', 'amoxicillin', 'azithromycin',
      'ciprofloxacin', 'doxycycline', 'fluoxetine', 'sertraline', 'tramadol',
      'paracetamol', 'ibuprofen', 'diclofenac', 'pregabalin', 'gabapentin',
    ];
    const lower = text.toLowerCase();
    return commonMeds.filter((m) => lower.includes(m));
  }

  private calcAge(dob: Date): number {
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    return age;
  }
}
