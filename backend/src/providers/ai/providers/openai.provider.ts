/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/providers/ai/providers/openai.provider.ts
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
 * AI model provider: implements AIProvider interface for openai
 *
 * Responsibilities:
 * - Implement AIProvider interface for openai
 * - Provide chat and vision completion methods
 *
 * Used By:
 - backend/src/providers/ai/providers/openrouter.provider.ts
 - backend/src/providers/ai/providers/nvidia-nim.provider.ts
 - backend/src/providers/ai/providers/ollama.provider.ts
 - backend/src/providers/ai/providers/gemini.provider.ts
 *
 * Calls:
 - openai
 *
 * Dependencies:
 - openai
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

import OpenAI from 'openai';

import { AIProvider, AIProviderType, ChatOptions, VisionInput } from '../ai.types';

export class OpenAIProvider implements AIProvider {
  private readonly client: OpenAI | null = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

  private get defaultModel() {
    return process.env.OPENAI_MODEL ?? 'gpt-4o';
  }

  getProviderType(): AIProviderType {
    return 'openai';
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async chat(prompt: string, options?: ChatOptions): Promise<string> {
    if (!this.client) return '';
    const response = await this.client.chat.completions.create({
      model: options?.model ?? this.defaultModel,
      temperature: options?.temperature,
      max_tokens: options?.maxTokens,
      messages: [
        ...(options?.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
        { role: 'user', content: prompt },
      ],
    });
    return response.choices[0]?.message?.content ?? '';
  }

  async *chatStream(prompt: string, options?: ChatOptions): AsyncIterable<string> {
    if (!this.client) return;
    const stream = await this.client.chat.completions.create({
      model: options?.model ?? this.defaultModel,
      temperature: options?.temperature,
      max_tokens: options?.maxTokens,
      messages: [
        ...(options?.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
        { role: 'user', content: prompt },
      ],
      stream: true,
    });
    for await (const chunk of stream) {
      yield chunk.choices[0]?.delta?.content ?? '';
    }
  }

  async vision(input: VisionInput, prompt: string, options?: ChatOptions): Promise<string> {
    if (!this.client) return '';
    const base64Data = input.buffer.toString('base64');
    const response = await this.client.chat.completions.create({
      model: options?.model ?? this.defaultModel,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:${input.mimeType};base64,${base64Data}` } },
          ],
        },
      ],
    });
    return response.choices[0]?.message?.content ?? '';
  }

  async embed(_text: string): Promise<number[]> {
    return [];
  }
}
