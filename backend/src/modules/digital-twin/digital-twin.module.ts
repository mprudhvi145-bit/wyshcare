/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/digital-twin/digital-twin.module.ts
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
 * NestJS module: wires providers, controllers, and imports for digital-twin
 *
 * Responsibilities:
 * - Configure dependency injection for digital-twin
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
Digital Twin
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
import { DigitalTwinController } from './digital-twin.controller';
import { DigitalTwinService } from './digital-twin.service';
import { RiskEngineV4Service } from './engines/risk-engine-v4.service';
import { PredictionEngineService } from './engines/prediction-engine.service';
import { CareGapEngineService } from './engines/care-gap-engine.service';
import { AdherenceEngineService } from './engines/adherence-engine.service';
import { PreventiveCareEngineService } from './engines/preventive-care-engine.service';
import { FamilyRiskEngineService } from './engines/family-risk-engine.service';
import { TwinContextEngineService } from './engines/twin-context-engine.service';

@Module({
  controllers: [DigitalTwinController],
  providers: [
    DigitalTwinService,
    RiskEngineV4Service,
    PredictionEngineService,
    CareGapEngineService,
    AdherenceEngineService,
    PreventiveCareEngineService,
    FamilyRiskEngineService,
    TwinContextEngineService,
  ],
  exports: [DigitalTwinService],
})
export class DigitalTwinModule {}
