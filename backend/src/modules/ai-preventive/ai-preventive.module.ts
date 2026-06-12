/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-preventive/ai-preventive.module.ts
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
 * NestJS module: wires providers, controllers, and imports for ai-preventive
 *
 * Responsibilities:
 * - Configure dependency injection for ai-preventive
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
 - event-emitter
 - common
 *
 * Dependencies:
 - event-emitter
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
import { AiPreventiveService } from './ai-preventive.service';
import { AiPreventiveController } from './ai-preventive.controller';
import { PrismaModule } from '../../providers/prisma/prisma.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, EventEmitterModule.forRoot(), AiModule],
  controllers: [AiPreventiveController],
  providers: [AiPreventiveService],
  exports: [AiPreventiveService],
})
export class AiPreventiveModule {}