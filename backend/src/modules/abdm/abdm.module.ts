/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/abdm/abdm.module.ts
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
 * NestJS module: wires providers, controllers, and imports for abdm
 *
 * Responsibilities:
 * - Configure dependency injection for abdm
 * - Register controllers, services, and providers
 *
 * Used By:
 - backend/src/modules/prescription/prescription.service.ts
 - backend/src/providers/storage/storage.module.ts
 - backend/src/modules/prescription/interaction-engine.service.ts
 - backend/src/modules/interoperability/interoperability.module.ts
 - backend/src/modules/digital-twin/digital-twin.service.ts
 - backend/src/main.ts
 - backend/src/modules/health-graph/health-graph.service.ts
 - backend/src/modules/search/search.controller.ts
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
import { AbdmController } from './abdm.controller';
import { AbhaService } from './abha.service';
import { ConsentService } from './consent.service';
import { HipService } from './hip.service';
import { HiuService } from './hiu.service';
import { GatewayService } from './gateway.service';
import { HprService } from './hpr.service';
import { HfrService } from './hfr.service';
import { AuditLogService } from '../../common/services/audit-log.service';

@Module({
  controllers: [AbdmController],
  providers: [
    AbhaService,
    ConsentService,
    HipService,
    HiuService,
    GatewayService,
    HprService,
    HfrService,
    AuditLogService,
  ],
  exports: [AbhaService, ConsentService, GatewayService],
})
export class AbdmModule {}
