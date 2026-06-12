/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-lifestyle/ai-lifestyle.module.ts
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
 * NestJS module: wires providers, controllers, and imports for ai-lifestyle
 *
 * Responsibilities:
 * - Configure dependency injection for ai-lifestyle
 * - Register controllers, services, and providers
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

import { Module } from '@nestjs/common';
import { AiLifestyleController } from './ai-lifestyle.controller';
import { AiLifestyleService } from './ai-lifestyle.service';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { GeminiService } from '../../providers/gemini/gemini.service';
import { ActivityAssessor } from './assessors/activity-assessor';
import { NutritionAssessor } from './assessors/nutrition-assessor';
import { SleepAssessor } from './assessors/sleep-assessor';
import { StressAssessor } from './assessors/stress-assessor';
import { SubstanceUseAssessor } from './assessors/substance-use-assessor';

@Module({
  controllers: [AiLifestyleController],
  providers: [
    AiLifestyleService,
    PrismaService,
    GeminiService,
    ActivityAssessor,
    NutritionAssessor,
    SleepAssessor,
    StressAssessor,
    SubstanceUseAssessor,
  ],
})
export class AiLifestyleModule {}