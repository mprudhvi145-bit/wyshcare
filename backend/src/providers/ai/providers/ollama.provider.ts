/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/providers/ai/providers/ollama.provider.ts
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
 * AI model provider: implements AIProvider interface for ollama
 *
 * Responsibilities:
 * - Implement AIProvider interface for ollama
 * - Provide chat and vision completion methods
 *
 * Used By:
 - backend/src/providers/ai/providers/openai.provider.ts
 - backend/src/providers/ai/providers/openrouter.provider.ts
 - backend/src/providers/ai/providers/nvidia-nim.provider.ts
 - backend/src/providers/ai/providers/gemini.provider.ts
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

import { AIProvider, AIProviderType, ChatOptions, VisionInput } from '../ai.types';

interface OllamaResponse {
  response: string;
}

interface OllamaStreamChunk {
  response: string;
  done: boolean;
}

export class OllamaProvider implements AIProvider {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434';
  }

  private get defaultModel() {
    return process.env.OLLAMA_MODEL ?? 'llama3.2';
  }

  getProviderType(): AIProviderType {
    return 'ollama';
  }

  isAvailable(): boolean {
    return true;
  }

  async chat(prompt: string, options?: ChatOptions): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options?.model ?? this.defaultModel,
        prompt: options?.systemPrompt ? `${options.systemPrompt}\n\n${prompt}` : prompt,
        stream: false,
      }),
    });
    if (!response.ok) return '';
    const data = (await response.json()) as OllamaResponse;
    return data.response;
  }

  async *chatStream(prompt: string, options?: ChatOptions): AsyncIterable<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options?.model ?? this.defaultModel,
        prompt: options?.systemPrompt ? `${options.systemPrompt}\n\n${prompt}` : prompt,
        stream: true,
      }),
    });
    if (!response.ok || !response.body) return;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const chunk = JSON.parse(line) as OllamaStreamChunk;
          yield chunk.response;
        } catch { /* skip malformed lines */ }
      }
    }
  }

  async vision(_input: VisionInput, _prompt: string, _options?: ChatOptions): Promise<string> {
    return '';
  }

  async embed(_text: string): Promise<number[]> {
    return [];
  }
}
