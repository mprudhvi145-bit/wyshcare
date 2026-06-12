/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/health-graph-v2/health-graph-v2.module.ts
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
 * NestJS module: wires providers, controllers, and imports for health-graph-v2
 *
 * Responsibilities:
 * - Configure dependency injection for health-graph-v2
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
Health Graph
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
import { HealthGraphV2Controller } from './health-graph-v2.controller';
import { LifestyleService } from './lifestyle.service';
import { SymptomService } from './symptom.service';
import { FamilyHistoryService } from './family-history.service';
import { WearablesService } from './wearables.service';
import { RiskService } from './risk.service';
import { PreventionService } from './prevention.service';

@Module({
  controllers: [HealthGraphV2Controller],
  providers: [LifestyleService, SymptomService, FamilyHistoryService, WearablesService, RiskService, PreventionService],
  exports: [RiskService, PreventionService],
})
export class HealthGraphV2Module {}
