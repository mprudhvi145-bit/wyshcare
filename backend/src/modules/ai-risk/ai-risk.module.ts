/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-risk/ai-risk.module.ts
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
 * NestJS module: wires providers, controllers, and imports for ai-risk
 *
 * Responsibilities:
 * - Configure dependency injection for ai-risk
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
import { AIRiskPredictionService } from './services/ai-risk-prediction.service';
import { AIRiskController } from './controllers/ai-risk.controller';
import { 
  CardiovascularRiskAssessor,
  DiabetesRiskAssessor,
  HypertensionRiskAssessor,
  KidneyDiseaseRiskAssessor,
  MentalHealthRiskAssessor,
  ReadmissionRiskAssessor,
  MedicationAdherenceRiskAssessor,
  FrailtyRiskAssessor,
  MortalityRiskAssessor
} from './services/assessors';
import { PrismaModule } from '../../providers/prisma/prisma.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { FamilyRiskEngineService } from '../digital-twin/engines/family-risk-engine.service';

@Module({
  imports: [PrismaModule, EventEmitterModule.forRoot()],
  controllers: [AIRiskController],
  providers: [
    AIRiskPredictionService,
    CardiovascularRiskAssessor,
    DiabetesRiskAssessor,
    HypertensionRiskAssessor,
    KidneyDiseaseRiskAssessor,
    MentalHealthRiskAssessor,
    ReadmissionRiskAssessor,
    MedicationAdherenceRiskAssessor,
    FrailtyRiskAssessor,
    MortalityRiskAssessor,
    FamilyRiskEngineService
  ],
  exports: [AIRiskPredictionService]
})
export class AIRiskModule {}