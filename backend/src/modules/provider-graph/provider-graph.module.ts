/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/provider-graph/provider-graph.module.ts
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
 * NestJS module: wires providers, controllers, and imports for provider-graph
 *
 * Responsibilities:
 * - Configure dependency injection for provider-graph
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
WyshID
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
import { ProviderGraphController } from './provider-graph.controller';
import { ProviderGraphService } from './provider-graph.service';
import { ReferralService } from './referral.service';
import { ReputationService } from './reputation.service';
import { AuditLogService } from '../../common/services/audit-log.service';

@Module({
  controllers: [ProviderGraphController],
  providers: [ProviderGraphService, ReferralService, ReputationService, AuditLogService],
  exports: [ProviderGraphService, ReferralService, ReputationService],
})
export class ProviderGraphModule {}
