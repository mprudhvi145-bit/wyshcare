/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/providers/ai/providers/gemini.provider.ts
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
 * AI model provider: implements AIProvider interface for gemini
 *
 * Responsibilities:
 * - Implement AIProvider interface for gemini
 * - Provide chat and vision completion methods
 *
 * Used By:
 - backend/src/providers/ai/providers/openrouter.provider.ts
 - backend/src/providers/ai/providers/nvidia-nim.provider.ts
 - backend/src/providers/ai/providers/ollama.provider.ts
 - backend/src/providers/ai/providers/openai.provider.ts
 *
 * Calls:
 - generative-ai
 *
 * Dependencies:
 - generative-ai
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

import { GoogleGenerativeAI } from '@google/generative-ai';

import { AIProvider, AIProviderType, ChatOptions, VisionInput } from '../ai.types';

export class GeminiProvider implements AIProvider {
  private readonly client: GoogleGenerativeAI | null = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

  private get defaultModel() {
    return process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
  }

  getProviderType(): AIProviderType {
    return 'gemini';
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async chat(prompt: string, options?: ChatOptions): Promise<string> {
    if (!this.client) return '';
    const model = this.client.getGenerativeModel({
      model: options?.model ?? this.defaultModel,
    });
    const contents = options?.systemPrompt
      ? [{ role: 'user' as const, parts: [{ text: `${options.systemPrompt}\n\n${prompt}` }] }]
      : [{ role: 'user' as const, parts: [{ text: prompt }] }];
    const response = await model.generateContent({ contents });
    return response.response.text();
  }

  async *chatStream(prompt: string, options?: ChatOptions): AsyncIterable<string> {
    if (!this.client) return;
    const model = this.client.getGenerativeModel({
      model: options?.model ?? this.defaultModel,
    });
    const result = await model.generateContentStream(prompt);
    for await (const chunk of result.stream) {
      yield chunk.text();
    }
  }

  async vision(input: VisionInput, prompt: string, options?: ChatOptions): Promise<string> {
    if (!this.client) return '';
    const model = this.client.getGenerativeModel({
      model: options?.model ?? this.defaultModel,
    });
    const base64Data = input.buffer.toString('base64');
    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType: input.mimeType, data: base64Data } },
    ]);
    return result.response.text();
  }

  async embed(text: string): Promise<number[]> {
    if (!this.client) return [];
    const model = this.client.getGenerativeModel({
      model: process.env.GEMINI_EMBEDDING_MODEL ?? 'text-embedding-004',
    });
    const result = await model.embedContent(text);
    return result.embedding.values;
  }
}
