/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/providers/gemini/gemini.service.ts
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
 * Business logic service for gemini
 *
 * Responsibilities:
 * - Execute business logic for wyshid operations
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

import { Injectable } from '@nestjs/common';
import { AiOrchestratorService } from '../ai/ai-orchestrator.service';

@Injectable()
export class GeminiService {
  constructor(
    private readonly aiOrchestrator: AiOrchestratorService,
  ) {}

  async summarizeHealthcareText(prompt: string): Promise<string> {
    const result = await this.aiOrchestrator.chat(prompt);
    return result.content;
  }

  async checkMedicationInteractions(meds: any[]): Promise<string> {
    const prompt = `Review the following medications for any potential drug-drug interactions, contraindications, or warnings. Explain clearly in patient-safe language:\n${JSON.stringify(meds, null, 2)}`;
    return this.summarizeHealthcareText(prompt);
  }

  async explainLabResults(results: any[]): Promise<string> {
    const prompt = `Explain the following laboratory test results in clear, patient-safe language. Highlight any out-of-range markers and provide general, safe guidance:\n${JSON.stringify(results, null, 2)}`;
    return this.summarizeHealthcareText(prompt);
  }

  async generateHealthMemorySummaryFromGraph(graphContextLines: string[]): Promise<string> {
    const prompt = `Based on the following longitudinal health memory graph data, generate a comprehensive, structured clinical summary of the patient's health status:\n${graphContextLines.join('\n')}`;
    return this.summarizeHealthcareText(prompt);
  }

  async generateHealthMemorySummary(history: any[]): Promise<string> {
    const prompt = `Based on the following timeline of healthcare events, generate a comprehensive, structured clinical summary of the patient's health status:\n${JSON.stringify(history, null, 2)}`;
    return this.summarizeHealthcareText(prompt);
  }

  async extractPrescription(file: { buffer: Buffer; mimeType: string }): Promise<any> {
    try {
      const result = await this.aiOrchestrator.vision(
        {
          buffer: file.buffer,
          mimeType: file.mimeType,
        },
        'Extract prescription details from this image/pdf. Return JSON with format: { doctorName?: string, date?: string, medications: Array<{ name: string, dosage?: string, frequency?: string, duration?: string }>, diagnosis?: string, tests?: string[], followUp?: string }'
      );
      const text = result.content;
      const match = text.match(/\{[\s\S]*\}/);
      return match ? JSON.parse(match[0]) : { medications: [] };
    } catch {
      return { medications: [] };
    }
  }

  async extractLabReport(file: { buffer: Buffer; mimeType: string }): Promise<any> {
    try {
      const result = await this.aiOrchestrator.vision(
        {
          buffer: file.buffer,
          mimeType: file.mimeType,
        },
        'Extract laboratory test results. Return JSON format: { labName?: string, summary?: string, results: Array<{ test: string, value: string, flag?: string, unit?: string }> }'
      );
      const text = result.content;
      const match = text.match(/\{[\s\S]*\}/);
      return match ? JSON.parse(match[0]) : { results: [] };
    } catch {
      return { results: [] };
    }
  }
}
