/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai/ai.module.ts
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
 * NestJS module: wires providers, controllers, and imports for ai
 *
 * Responsibilities:
 * - Configure dependency injection for ai
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

import { AiController } from './ai.controller';
import { AiResolver } from './ai.resolver';
import { AiService } from './ai.service';
import { AiGraphService } from './services/ai-graph.service';
import { AiCopilotService } from './services/ai-copilot.service';
import { AiIntelligenceService } from './services/ai-intelligence.service';

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    AiResolver,
    AiGraphService,
    AiCopilotService,
    AiIntelligenceService,
  ],
  exports: [
    AiService,
    AiGraphService,
    AiCopilotService,
    AiIntelligenceService,
  ],
})
export class AiModule {}
