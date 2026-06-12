/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai/ai.resolver.ts
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
 * ai.resolver — AI module
 *
 * Responsibilities:
 * - Support ai functionality
 *
 * Used By:
 - backend/src/app.module.ts
 - backend/src/modules/discovery/discovery.resolver.ts
 - backend/src/modules/ai/ai.module.ts
 - backend/src/modules/ai/ai.controller.ts
 - backend/src/modules/ai/entities/symptom-analysis.entity.ts
 - backend/src/modules/discovery/entities/discovery-result.entity.ts
 *
 * Calls:
 - graphql
 *
 * Dependencies:
 - graphql
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

import { Args, Query, Resolver } from '@nestjs/graphql';

import { SymptomAnalysis } from './entities/symptom-analysis.entity';
import { AiService } from './ai.service';

@Resolver(() => SymptomAnalysis)
export class AiResolver {
  constructor(private readonly aiService: AiService) {}

  @Query(() => SymptomAnalysis)
  symptomTriage(
    @Args('text') text: string,
    @Args('languageCode', { nullable: true }) languageCode?: string,
  ) {
    return this.aiService.analyzeSymptoms(undefined, text, languageCode ?? 'en');
  }
}
