/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/providers/ai/ai-orchestrator.service.ts
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
 - config
 - common
 *
 * Dependencies:
 - config
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

import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RedisService } from '../redis/redis.service';
import { DomainEventsService } from '../events/events.service';
import { DomainEventType } from '../events/events.types';
import { AIProvider, AIProviderType, ChatOptions, VisionInput } from './ai.types';
import { createAIProvider } from './ai-provider.factory';
import { AI_PROVIDER_TOKEN } from './ai-provider.module';

export interface PromptTemplate {
  name: string;
  systemPrompt: string;
  userPromptTemplate: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface AiCallResult {
  content: string;
  provider: AIProviderType;
  model: string;
  durationMs: number;
  promptTokens: number;
  completionTokens: number;
  cached: boolean;
  fallbackUsed: boolean;
}

const FALLBACK_ORDER: AIProviderType[] = ['gemini', 'openrouter', 'nvidia-nim', 'ollama'];

const TOKEN_ESTIMATE_RATIO = 4;

@Injectable()
export class AiOrchestratorService {
  private readonly logger = new Logger(AiOrchestratorService.name);
  private readonly primaryProvider: AIProviderType;
  private readonly fallbackProviders: AIProviderType[];
  private readonly cacheTtlMs: number;
  private readonly cacheEnabled: boolean;

  private promptTemplates = new Map<string, PromptTemplate>();

  constructor(
    @Inject(AI_PROVIDER_TOKEN) private readonly defaultProvider: AIProvider,
    private readonly redis: RedisService,
    private readonly events: DomainEventsService,
    config: ConfigService,
  ) {
    this.primaryProvider = (config.get<string>('AI_PROVIDER') ?? 'gemini') as AIProviderType;
    const fallbackRaw = config.get<string>('AI_FALLBACK_ORDER');
    this.fallbackProviders = fallbackRaw
      ? (fallbackRaw.split(',').map((s) => s.trim()) as AIProviderType[])
      : FALLBACK_ORDER.filter((p) => p !== this.primaryProvider);
    this.cacheTtlMs = config.get<number>('AI_CACHE_TTL_MS') ?? 300_000;
    this.cacheEnabled = config.get<boolean>('AI_CACHE_ENABLED') ?? true;
  }

  registerTemplate(template: PromptTemplate): this {
    this.promptTemplates.set(template.name, template);
    return this;
  }

  getTemplate(name: string): PromptTemplate | undefined {
    return this.promptTemplates.get(name);
  }

  buildPrompt(templateName: string, variables: Record<string, string>): { userPrompt: string; systemPrompt?: string } | null {
    const template = this.promptTemplates.get(templateName);
    if (!template) return null;

    let userPrompt = template.userPromptTemplate;
    for (const [key, value] of Object.entries(variables)) {
      userPrompt = userPrompt.replaceAll(`{{${key}}}`, value);
    }

    return {
      userPrompt,
      systemPrompt: template.systemPrompt,
    };
  }

  async chat(
    prompt: string,
    options?: ChatOptions & { templateName?: string; variables?: Record<string, string>; skipCache?: boolean; userId?: string; patientUserId?: string },
  ): Promise<AiCallResult> {
    let finalPrompt = prompt;
    let systemPrompt = options?.systemPrompt;

    if (options?.templateName) {
      const built = this.buildPrompt(options.templateName, options.variables ?? {});
      if (built) {
        finalPrompt = built.userPrompt;
        systemPrompt = built.systemPrompt;
      }
    }

    const cacheKey = this.cacheEnabled && !options?.skipCache
      ? `ai:${this.primaryProvider}:${await this.hashPrompt(finalPrompt, systemPrompt)}`
      : null;

    if (cacheKey) {
      const cached = await this.redis.getClient()?.get(cacheKey);
      if (cached) {
        return JSON.parse(cached) as AiCallResult;
      }
    }

    const providers = [this.primaryProvider, ...this.fallbackProviders];
    let lastError: Error | null = null;

    for (let i = 0; i < providers.length; i++) {
      const providerType = providers[i];
      if (!providerType) continue;
      try {
        const provider = i === 0 ? this.defaultProvider : createAIProvider(providerType);
        if (!provider.isAvailable()) {
          this.logger.warn(`Provider ${providerType} unavailable, skipping`);
          continue;
        }

        const start = Date.now();
        const content = await provider.chat(finalPrompt, { ...options, systemPrompt });
        const durationMs = Date.now() - start;
        const result: AiCallResult = {
          content,
          provider: providerType,
          model: options?.model ?? provider.getProviderType(),
          durationMs,
          promptTokens: Math.ceil((finalPrompt.length + (systemPrompt?.length ?? 0)) / TOKEN_ESTIMATE_RATIO),
          completionTokens: Math.ceil(content.length / TOKEN_ESTIMATE_RATIO),
          cached: false,
          fallbackUsed: i > 0,
        };

        if (cacheKey) {
          await this.redis.getClient()?.set(cacheKey, JSON.stringify(result), 'PX', this.cacheTtlMs).catch(() => {});
        }

        await this.trackUsage(result, options?.userId, options?.patientUserId);

        return result;
      } catch (err) {
        lastError = err as Error;
        this.logger.warn(`Provider ${providerType} failed: ${lastError.message}, trying next`);
      }
    }

    throw lastError ?? new Error('All AI providers failed');
  }

  async chatStream(
    prompt: string,
    options?: ChatOptions & { templateName?: string; variables?: Record<string, string>; userId?: string },
  ): Promise<AsyncIterable<string>> {
    let finalPrompt = prompt;
    let systemPrompt = options?.systemPrompt;

    if (options?.templateName) {
      const built = this.buildPrompt(options.templateName, options.variables ?? {});
      if (built) {
        finalPrompt = built.userPrompt;
        systemPrompt = built.systemPrompt;
      }
    }

    const providers = [this.primaryProvider, ...this.fallbackProviders];
    let lastError: Error | null = null;

    for (let i = 0; i < providers.length; i++) {
      const providerType = providers[i];
      try {
        const provider = i === 0 ? this.defaultProvider : createAIProvider(providerType);
        if (!provider.isAvailable()) continue;
        return provider.chatStream(finalPrompt, { ...options, systemPrompt });
      } catch (err) {
        lastError = err as Error;
        this.logger.warn(`Provider ${providerType} stream failed: ${lastError.message}`);
      }
    }

    throw lastError ?? new Error('All AI providers failed for streaming');
  }

  async vision(
    input: VisionInput,
    prompt: string,
    options?: ChatOptions & { skipCache?: boolean; userId?: string; patientUserId?: string },
  ): Promise<AiCallResult> {
    const cacheKey = this.cacheEnabled && !options?.skipCache
      ? `ai:vision:${this.primaryProvider}:${await this.hashPrompt(prompt, options?.systemPrompt)}:${input.mimeType}`
      : null;

    if (cacheKey) {
      const cached = await this.redis.getClient()?.get(cacheKey);
      if (cached) {
        return JSON.parse(cached) as AiCallResult;
      }
    }

    const providers = [this.primaryProvider, ...this.fallbackProviders];
    let lastError: Error | null = null;

    for (let i = 0; i < providers.length; i++) {
      const providerType = providers[i];
      if (!providerType) continue;
      try {
        const provider = i === 0 ? this.defaultProvider : createAIProvider(providerType);
        if (!provider.isAvailable()) continue;

        const start = Date.now();
        const content = await provider.vision(input, prompt, options);
        const durationMs = Date.now() - start;

        const result: AiCallResult = {
          content,
          provider: providerType,
          model: options?.model ?? provider.getProviderType(),
          durationMs,
          promptTokens: 0,
          completionTokens: Math.ceil(content.length / TOKEN_ESTIMATE_RATIO),
          cached: false,
          fallbackUsed: i > 0,
        };

        if (cacheKey) {
          await this.redis.getClient()?.set(cacheKey, JSON.stringify(result), 'PX', this.cacheTtlMs).catch(() => {});
        }

        await this.trackUsage(result, options?.userId, options?.patientUserId);

        return result;
      } catch (err) {
        lastError = err as Error;
      }
    }

    throw lastError ?? new Error('All AI providers failed for vision');
  }

  async embed(text: string, _options?: { userId?: string }): Promise<number[]> {
    const providers = [this.primaryProvider, ...this.fallbackProviders];
    let lastError: Error | null = null;

    for (let i = 0; i < providers.length; i++) {
      const providerType = providers[i];
      try {
        const provider = i === 0 ? this.defaultProvider : createAIProvider(providerType);
        if (!provider.isAvailable()) continue;
        return provider.embed(text);
      } catch (err) {
        lastError = err as Error;
      }
    }

    throw lastError ?? new Error('All AI providers failed for embeddings');
  }

  private async trackUsage(result: AiCallResult, userId?: string, patientUserId?: string) {
    this.events.publish(DomainEventType.ANALYTICS_EVENT, {
      event: 'ai_usage',
      provider: result.provider,
      model: result.model,
      durationMs: result.durationMs,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      cached: result.cached,
      fallbackUsed: result.fallbackUsed,
      userId,
      patientUserId,
      timestamp: new Date().toISOString(),
    });
  }

  private async hashPrompt(prompt: string, systemPrompt?: string): Promise<string> {
    const data = `${systemPrompt ?? ''}|${prompt}`;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
  }
}
