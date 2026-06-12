/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai/ai.service.ts
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
 * Business logic service for ai
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
 - event-emitter
 - common
 *
 * Dependencies:
 - event-emitter
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
import { EventEmitter2 } from '@nestjs/event-emitter';

import { AiOrchestratorService } from '../../providers/ai/ai-orchestrator.service';
import { PrismaService } from '../../providers/prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiOrchestrator: AiOrchestratorService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async analyzeSymptoms(userId: string | undefined, text: string, languageCode: string) {
    const memory = userId
      ? await this.prisma.aIMemoryNode.findMany({
          where: { userId },
          take: 5,
          orderBy: { updatedAt: 'desc' },
        })
      : [];

    const prompt = [
      'You are a healthcare safety assistant for Indian consumers.',
      'Never diagnose. Never prescribe restricted medication.',
      `Language: ${languageCode}`,
      `Patient context: ${memory.map((item: { summary: string }) => item.summary).join('; ') || 'No prior history provided.'}`,
      `Symptoms: ${text}`,
      'Return a short safe summary, urgency band, next steps, specialties, and emergency escalation signal.',
    ].join('\n');

    const result = await this.aiOrchestrator.chat(prompt);
    const summary = result.content;

    return {
      summary,
      urgency: /chest pain|breathless|stroke|seizure/i.test(text) ? 'EMERGENCY' : 'MODERATE',
      nextSteps: [
        'Monitor symptoms and recent vitals if available.',
        'Book a clinician review for persistent or worsening symptoms.',
        'Seek emergency care immediately for red-flag symptoms.',
      ],
      recommendedSpecialties: /child|fever/i.test(text) ? ['Pediatrics'] : ['General Medicine'],
      safetyNotes: [
        'This is not a diagnosis.',
        'Do not delay emergency care for severe pain, breathing trouble, or collapse.',
      ],
      emergencyEscalation: /chest pain|breathless|collapse|stroke/i.test(text),
    };
  }

  async summarizeReport(text: string) {
    const result = await this.aiOrchestrator.chat(
      `Explain this healthcare report in patient-safe language with uncertainty and red flags:\n${text}`,
    );
    return result.content;
  }

  emitEvent(eventName: string, data: any) {
    this.eventEmitter.emit(eventName, data);
  }
}
