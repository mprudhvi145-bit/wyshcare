/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/providers/ai/ai.types.ts
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
 * ai.types — AI module
 *
 * Responsibilities:
 * - Support ai functionality
 *
 * Used By:
 - Standalone (not imported by other source files)
 *
 * Calls:
 - None identified
 *
 * Dependencies:
 - None identified
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

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface VisionInput {
  buffer: Buffer;
  mimeType: string;
}

export type AIProviderType = 'gemini' | 'openai' | 'openrouter' | 'nvidia-nim' | 'ollama';

export interface AIProvider {
  chat(prompt: string, options?: ChatOptions): Promise<string>;
  chatStream(prompt: string, options?: ChatOptions): AsyncIterable<string>;
  vision(input: VisionInput, prompt: string, options?: ChatOptions): Promise<string>;
  embed(text: string): Promise<number[]>;
  isAvailable(): boolean;
  getProviderType(): AIProviderType;
}
