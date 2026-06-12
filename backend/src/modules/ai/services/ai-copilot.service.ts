/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai/services/ai-copilot.service.ts
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
export class AiCopilotService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiOrchestrator: AiOrchestratorService,
    private readonly graph: AiGraphService,
  ) {}

  async patientSummary(patientId: string) {
    const patient = await this.prisma.user.findUnique({
      where: { id: patientId },
      select: { id: true, fullName: true, gender: true, dateOfBirth: true, bloodGroup: true, chronicConditions: true, allergiesSummary: true },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const graphData = await this.graph.getPatientGraph(patientId);
    const nodeMap = new Map(graphData.nodes.map((n) => [n.id, n]));
    const graphLines = graphData.edges.map((e) => {
      const fn = nodeMap.get(e.fromNodeId);
      const tn = nodeMap.get(e.toNodeId);
      return `${fn?.title ?? '?'} --[${e.relation}]--> ${tn?.title ?? '?'}`;
    });

    const timeline = await this.prisma.timelineEvent.findMany({
      where: { userId: patientId },
      orderBy: { occurredAt: 'desc' },
      take: 20,
    });

    const prompt = [
      'You are a medical summarization assistant for doctors in India.',
      'Based on the patient profile and health graph below, generate a concise clinical summary.',
      'Include:',
      '- Patient demographics (age, gender, blood group)',
      '- Active conditions',
      '- Current medications',
      '- Allergies',
      '- Recent encounters (last 20 events)',
      '- Key care gaps or recommendations',
      '',
      'Format as plain text sections (no markdown). Be specific and clinical.',
      '',
      `Patient: ${patient.fullName ?? 'Unknown'}`,
      `Gender: ${patient.gender ?? 'Not specified'}`,
      `DOB: ${patient.dateOfBirth?.toISOString().slice(0, 10) ?? 'Not specified'}`,
      `Blood Group: ${patient.bloodGroup ?? 'Not specified'}`,
      `Chronic Conditions: ${(patient.chronicConditions ?? []).join(', ') || 'None recorded'}`,
      `Allergies: ${(patient.allergiesSummary ?? []).join(', ') || 'None recorded'}`,
      '',
      graphLines.length > 0 ? `Health Graph:\n${graphLines.join('\n')}` : 'No health graph data.',
      '',
      'Recent Timeline Events:',
      ...timeline.map((e) => `[${e.occurredAt.toISOString().slice(0, 10)}] ${e.type}: ${e.title} — ${e.summary ?? ''}`),
      '',
      'Clinical Summary:',
    ].join('\n');

    const summary = (await this.aiOrchestrator.chat(prompt)).content;

    return {
      patientId,
      patientName: patient.fullName,
      summary,
      conditions: graphData.nodes.filter((n) => n.nodeType === 'CONDITION'),
      medications: graphData.nodes.filter((n) => n.nodeType === 'MEDICATION'),
      recentEvents: timeline.slice(0, 10),
    };
  }

  async soapNotes(consultationNotes: string, patientId?: string) {
    let patientContext = '';
    if (patientId) {
      const graphData = await this.graph.getPatientGraph(patientId);
      const nodeMap = new Map(graphData.nodes.map((n) => [n.id, n]));
      const graphLines = graphData.edges.map((e) => {
        const fn = nodeMap.get(e.fromNodeId);
        const tn = nodeMap.get(e.toNodeId);
        return `${fn?.title ?? '?'} --[${e.relation}]--> ${tn?.title ?? '?'}`;
      });
      if (graphLines.length > 0) {
        patientContext = `Patient health context:\n${graphLines.join('\n')}\n\n`;
      }
    }

    const prompt = [
      'You are a clinical documentation assistant for doctors in India.',
      'Convert the following consultation notes into SOAP (Subjective, Objective, Assessment, Plan) format.',
      '',
      patientContext,
      'Raw consultation notes:',
      consultationNotes,
      '',
      'Generate SOAP notes with clear sections. Format as plain text (no markdown).',
      'Include specific details from the notes. Be clinically precise.',
      '',
      'SOAP Notes:',
    ].join('\n');

    const soapText = (await this.aiOrchestrator.chat(prompt)).content;
    const sections = this.parseSections(soapText, ['SUBJECTIVE', 'OBJECTIVE', 'ASSESSMENT', 'PLAN']);

    return {
      subjective: sections.SUBJECTIVE ?? '',
      objective: sections.OBJECTIVE ?? '',
      assessment: sections.ASSESSMENT ?? '',
      plan: sections.PLAN ?? '',
      raw: soapText,
    };
  }

  async draftPrescription(
    diagnosis: string,
    symptoms: string[],
    patientId?: string,
    doctorNotes?: string,
  ) {
    let patientContext = '';
    if (patientId) {
      const graphData = await this.graph.getPatientGraph(patientId);
      const nodeMap = new Map(graphData.nodes.map((n) => [n.id, n]));
      const graphLines = graphData.edges.map((e) => {
        const fn = nodeMap.get(e.fromNodeId);
        const tn = nodeMap.get(e.toNodeId);
        return `${fn?.title ?? '?'} --[${e.relation}]--> ${tn?.title ?? '?'}`;
      });
      if (graphLines.length > 0) {
        patientContext = `Patient history:\n${graphLines.join('\n')}\n\n`;
      }
    }

    const prompt = [
      'You are a prescription drafting assistant for doctors in India.',
      'Generate a prescription draft based on the following information.',
      'Follow standard Indian clinical practice patterns.',
      '',
      patientContext,
      `Diagnosis: ${diagnosis}`,
      `Symptoms: ${symptoms.join(', ')}`,
      doctorNotes ? `Doctor's notes: ${doctorNotes}` : '',
      '',
      'Return a structured response with:',
      'MEDICATIONS: List medications with name, dosage, frequency, duration, and route.',
      'INVESTIGATIONS: Any recommended tests.',
      'ADVICE: Lifestyle and dietary advice for the patient.',
      'FOLLOW-UP: When the patient should return.',
      '',
      'Format as plain text sections (no markdown). Include generic medication names.',
      'Consider common and cost-effective options for the Indian market.',
      '',
      'Prescription Draft:',
    ].filter(Boolean).join('\n');

    const draftText = (await this.aiOrchestrator.chat(prompt)).content;
    const sections = this.parseSections(draftText, ['MEDICATIONS', 'INVESTIGATIONS', 'ADVICE', 'FOLLOW-UP']);

    return {
      medications: sections.MEDICATIONS ?? '',
      investigations: sections.INVESTIGATIONS ?? '',
      advice: sections.ADVICE ?? '',
      followUp: sections['FOLLOW-UP'] ?? '',
      raw: draftText,
    };
  }

  async suggestStructuredRx(
    diagnosis: string,
    symptoms: string[],
    patientId?: string,
    doctorNotes?: string,
  ): Promise<{
    suggestions: Array<{
      drugId?: string;
      drugName: string;
      dosage: string;
      frequency: string;
      durationDays: number;
      route: string;
      instructions?: string;
      isOtc?: boolean;
      confidence: number;
    }>;
    interactions: string[];
    alternatives: string[];
    raw: string;
  }> {
    let patientContext = '';
    let activeDrugs: string[] = [];
    if (patientId) {
      const graphData = await this.graph.getPatientGraph(patientId);
      const nodeMap = new Map(graphData.nodes.map((n) => [n.id, n]));
      const graphLines = graphData.edges.map((e) => {
        const fn = nodeMap.get(e.fromNodeId);
        const tn = nodeMap.get(e.toNodeId);
        return `${fn?.title ?? '?'} --[${e.relation}]--> ${tn?.title ?? '?'}`;
      });
      if (graphLines.length > 0) {
        patientContext = `Patient history:\n${graphLines.join('\n')}\n\n`;
      }
      activeDrugs = graphData.nodes.filter((n) => n.nodeType === 'MEDICATION').map((n) => n.title);
    }

    const drugCatalog = await this.prisma.drug.findMany({
      take: 500,
      orderBy: { genericName: 'asc' },
      select: { genericName: true, strength: true, dosageForm: true, drugClass: true, isPrescriptionRequired: true },
    });
    const catalogContext = drugCatalog.length > 0
      ? `Available drugs catalog (${drugCatalog.length} entries):\n${drugCatalog.slice(0, 100).map((d) => `- ${d.genericName} ${d.strength} (${d.dosageForm})${d.isPrescriptionRequired ? ' [Rx]' : ' [OTC]'}`).join('\n')}\n\n`
      : '';

    const prompt = [
      'You are an AI prescription copilot for doctors in India.',
      'Based on the diagnosis, symptoms, and patient history, suggest medications.',
      'ALWAYS use generic names. Follow clinical practice guidelines.',
      '',
      patientContext,
      catalogContext,
      `Diagnosis: ${diagnosis}`,
      `Symptoms: ${symptoms.join(', ')}`,
      activeDrugs.length > 0 ? `Currently active medications: ${activeDrugs.join(', ')}` : '',
      doctorNotes ? `Doctor notes: ${doctorNotes}` : '',
      '',
      'Respond in this exact JSON format (no markdown, no code fences):',
      '{',
      '  "suggestions": [',
      '    {',
      '      "drugName": "string (generic name)",',
      '      "dosage": "string (e.g., 500mg)",',
      '      "frequency": "string (e.g., BID, OD, TID)",',
      '      "durationDays": number,',
      '      "route": "string (e.g., Oral, Topical, IV)",',
      '      "instructions": "string (optional)",',
      '      "confidence": number (0-1)',
      '    }',
      '  ],',
      '  "interactions": ["array of potential concerns with existing medications"],',
      '  "alternatives": ["alternative treatment options"]',
      '}',
      '',
      'IMPORTANT: Never suggest controlled substances unless clearly indicated.',
      'IMPORTANT: Consider drug allergies, comorbidities, and age-appropriate dosing.',
    ].filter(Boolean).join('\n');

    const draftText = (await this.aiOrchestrator.chat(prompt)).content;

    try {
      const cleaned = draftText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(cleaned);
      const matchedSuggestions = await Promise.all(
        (parsed.suggestions ?? []).map(async (s: { drugName: string; dosage?: string; frequency?: string; durationDays?: number; route?: string; instructions?: string; confidence?: number }) => {
          const match = await this.prisma.drug.findFirst({
            where: { genericName: { contains: s.drugName, mode: 'insensitive' } },
            select: { id: true, isPrescriptionRequired: true },
          });
          return { ...s, drugId: match?.id, isOtc: match ? !match.isPrescriptionRequired : undefined };
        }),
      );
      return {
        suggestions: matchedSuggestions,
        interactions: parsed.interactions ?? [],
        alternatives: parsed.alternatives ?? [],
        raw: draftText,
      };
    } catch {
      return {
        suggestions: [],
        interactions: [],
        alternatives: [],
        raw: draftText,
      };
    }
  }

  async followUpPlan(
    diagnosis: string,
    medications: string[],
    patientId?: string,
    doctorNotes?: string,
  ) {
    let patientContext = '';
    if (patientId) {
      const user = await this.prisma.user.findUnique({
        where: { id: patientId },
        select: { chronicConditions: true, allergiesSummary: true },
      });
      if (user) {
        patientContext = [
          `Chronic conditions: ${(user.chronicConditions ?? []).join(', ') || 'None'}`,
          `Allergies: ${(user.allergiesSummary ?? []).join(', ') || 'None'}`,
        ].join('\n');
      }
    }

    const prompt = [
      'You are a follow-up planning assistant for doctors in India.',
      'Generate a follow-up plan for the patient based on the diagnosis and prescribed medications.',
      '',
      patientContext,
      `Diagnosis: ${diagnosis}`,
      `Medications prescribed: ${medications.join(', ')}`,
      doctorNotes ? `Doctor's notes: ${doctorNotes}` : '',
      '',
      'Return the following sections:',
      'FOLLOW-UP DATE: When should the patient return? Be specific (e.g., "2 weeks").',
      'MONITORING: What parameters should be monitored (blood pressure, sugar, etc.)?',
      'WHEN TO RETURN EARLIER: Specific symptoms that warrant early return.',
      'RED FLAGS: Warning signs requiring immediate medical attention.',
      '',
      'Format as plain text sections (no markdown). Be specific and actionable.',
      '',
      'Follow-up Plan:',
    ].filter(Boolean).join('\n');

    const planText = (await this.aiOrchestrator.chat(prompt)).content;
    const sections = this.parseSections(planText, ['FOLLOW-UP DATE', 'MONITORING', 'WHEN TO RETURN EARLIER', 'RED FLAGS']);

    return {
      followUpDate: sections['FOLLOW-UP DATE'] ?? '',
      monitoring: sections.MONITORING ?? '',
      whenToReturnEarlier: sections['WHEN TO RETURN EARLIER'] ?? '',
      redFlags: sections['RED FLAGS'] ?? '',
      raw: planText,
    };
  }

  async generateSOAP(consultationNotes: string, patientId?: string) {
    let patientContext = '';
    if (patientId) {
      const graphData = await this.graph.getPatientGraph(patientId);
      const nodeMap = new Map(graphData.nodes.map((n) => [n.id, n]));
      const graphLines = graphData.edges.map((e) => {
        const fn = nodeMap.get(e.fromNodeId);
        const tn = nodeMap.get(e.toNodeId);
        return `${fn?.title ?? '?'} --[${e.relation}]--> ${tn?.title ?? '?'}`;
      });
      if (graphLines.length > 0) {
        patientContext = `Patient health context:\n${graphLines.join('\n')}\n\n`;
      }
    }

    const prompt = [
      'You are a clinical documentation assistant for doctors in India.',
      'Convert the following consultation notes into SOAP (Subjective, Objective, Assessment, Plan) format.',
      '',
      patientContext,
      'Raw consultation notes:',
      consultationNotes || 'No notes provided. Generate a basic SOAP structure.',
      '',
      'Return ONLY valid JSON matching this structure (no markdown, no code fences):',
      JSON.stringify({
        subjective: 'string',
        objective: 'string',
        assessment: 'string',
        plan: 'string',
      }),
      '',
      'Be clinically precise. Include specific details from the notes.',
      'For assessment, list the diagnosis and differential diagnoses.',
      'For plan, include treatment, investigations, and follow-up.',
    ].join('\n');

    const raw = (await this.aiOrchestrator.chat(prompt)).content;
    return this.safeParseJson<{ subjective: string; objective: string; assessment: string; plan: string }>(raw, {
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
    });
  }

  async generateConsultSummary(twin: Record<string, unknown>, session: Record<string, unknown>) {
    const prompt = [
      'You are a medical summarization assistant.',
      'Based on the patient health twin data and consultation session, generate a concise visit summary.',
      '',
      'Return ONLY valid JSON (no markdown, no code fences):',
      JSON.stringify({
        visitSummary: 'string — 3-4 sentence summary of the visit',
        diagnosis: 'string — primary diagnosis',
        keyFindings: ['string'],
        recommendations: ['string'],
        followUpDate: 'string — when to return',
        patientInstructions: 'string — what patient should do',
      }),
      '',
      'Patient Health Twin:',
      JSON.stringify(twin, null, 2),
      '',
      'Consultation Session:',
      JSON.stringify(session, null, 2),
    ].join('\n');

    const raw = (await this.aiOrchestrator.chat(prompt)).content;
    return this.safeParseJson<{
      visitSummary: string;
      diagnosis: string;
      keyFindings: string[];
      recommendations: string[];
      followUpDate: string;
      patientInstructions: string;
    }>(raw, {
      visitSummary: '',
      diagnosis: '',
      keyFindings: [],
      recommendations: [],
      followUpDate: '',
      patientInstructions: '',
    });
  }

  async generatePatientInstructions(diagnosis: string, medications: string[]) {
    const prompt = [
      'You are a patient education assistant.',
      'Generate clear, simple instructions for a patient based on their diagnosis and medications.',
      'Use simple language suitable for Indian patients.',
      '',
      `Diagnosis: ${diagnosis}`,
      `Medications: ${medications.join(', ')}`,
      '',
      'Return ONLY valid JSON (no markdown, no code fences):',
      JSON.stringify({
        dietInstructions: 'string',
        activityInstructions: 'string',
        medicationInstructions: 'string',
        warningSignals: ['string'],
        whenToCallDoctor: 'string',
        nextSteps: 'string',
      }),
    ].join('\n');

    const raw = (await this.aiOrchestrator.chat(prompt)).content;
    return this.safeParseJson<{
      dietInstructions: string;
      activityInstructions: string;
      medicationInstructions: string;
      warningSignals: string[];
      whenToCallDoctor: string;
      nextSteps: string;
    }>(raw, {
      dietInstructions: '',
      activityInstructions: '',
      medicationInstructions: '',
      warningSignals: [],
      whenToCallDoctor: '',
      nextSteps: '',
    });
  }

  async parsePrescriptionText(rawText: string): Promise<{
    medications: Array<{
      name: string;
      dosage?: string;
      frequency?: string;
      durationDays?: number;
      route?: string;
      notes?: string;
    }>;
    diagnosis?: string;
    instructions?: string;
    raw: string;
  }> {
    const prompt = [
      'You are a prescription parsing assistant for a pharmacy marketplace.',
      'Parse the following prescription text and extract structured medication information.',
      '',
      'Return ONLY valid JSON (no markdown, no code fences):',
      JSON.stringify({
        medications: [
          { name: 'string', dosage: 'string (optional)', frequency: 'string (optional)', durationDays: 'number (optional)', route: 'string (optional)', notes: 'string (optional)' },
        ],
        diagnosis: 'string (primary diagnosis from prescription, or empty string)',
        instructions: 'string (usage instructions from prescription, or empty string)',
      }),
      '',
      'Extract ALL medications mentioned. Include generic names where possible.',
      'Standardize dosage formats (e.g., "500mg", "1 tablet").',
      'Standardize frequency (e.g., "twice daily", "once a day").',
      'If route is not specified, default to "oral".',
      '',
      'Prescription text:',
      rawText,
    ].join('\n');

    const raw = (await this.aiOrchestrator.chat(prompt)).content;
    const parsed = this.safeParseJson<{
      medications: Array<{
        name: string;
        dosage?: string;
        frequency?: string;
        durationDays?: number;
        route?: string;
        notes?: string;
      }>;
      diagnosis?: string;
      instructions?: string;
    }>(raw, { medications: [], diagnosis: '', instructions: '' });
    return { ...parsed, raw };
  }

  private safeParseJson<T>(raw: string, defaults: Partial<T> = {}): T {
    try {
      const cleaned = raw.replace(/```[a-z]*\n?/gi, '').trim();
      return { ...defaults, ...JSON.parse(cleaned) } as T;
    } catch {
      return defaults as T;
    }
  }

  private parseSections(text: string, headings: string[]): Record<string, string> {
    const result: Record<string, string> = {};
    let currentHeading: string | null = null;
    let currentLines: string[] = [];
    const lines = text.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      for (const h of headings) {
        if (trimmed.toUpperCase().startsWith(h)) {
          if (currentHeading) {
            result[currentHeading] = currentLines.join('\n').trim();
          }
          currentHeading = h;
          currentLines = [];
          const afterHeading = trimmed.slice(h.length).replace(/^[:.\s]+/, '');
          if (afterHeading) currentLines.push(afterHeading);
          break;
        }
      }

      if (currentHeading) {
        const isNextHeading = headings.some((h) => trimmed.toUpperCase().startsWith(h));
        if (!isNextHeading) {
          currentLines.push(trimmed);
        }
      }
    }

    if (currentHeading) {
      result[currentHeading] = currentLines.join('\n').trim();
    }

    return result;
  }
}
