/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/providers/ai/ai-provider.factory.ts
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
 * ai-provider.factory — AI module
 *
 * Responsibilities:
 * - Implement AIProvider interface for ai-provider.factory
 * - Provide chat and vision completion methods
 *
 * Used By:
 - backend/src/providers/ai/ai-orchestrator.service.ts
 - backend/src/providers/ai/ai-provider.module.ts
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

import { AIProvider, AIProviderType } from './ai.types';
import { GeminiProvider } from './providers/gemini.provider';
import { OllamaProvider } from './providers/ollama.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { NvidiaNimProvider } from './providers/nvidia-nim.provider';

const PROVIDER_MAP: Record<AIProviderType, new () => AIProvider> = {
  gemini: GeminiProvider,
  openai: OpenAIProvider,
  'openrouter': OpenRouterProvider,
  'nvidia-nim': NvidiaNimProvider,
  ollama: OllamaProvider,
};

export function createAIProvider(type?: AIProviderType): AIProvider {
  const providerType = type ?? (process.env.AI_PROVIDER as AIProviderType) ?? 'gemini';
  const ProviderClass = PROVIDER_MAP[providerType];
  if (!ProviderClass) {
    throw new Error(`Unknown AI provider: ${providerType}. Valid: ${Object.keys(PROVIDER_MAP).join(', ')}`);
  }
  return new ProviderClass();
}
