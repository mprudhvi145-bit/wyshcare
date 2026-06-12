/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/workspace/workspace.module.ts
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
 * NestJS module: wires providers, controllers, and imports for workspace
 *
 * Responsibilities:
 * - Configure dependency injection for workspace
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
import { WorkspaceController } from './workspace.controller';
import { NurseService } from './nurse.service';
import { LabService } from './lab.service';
import { PharmacyWorkspaceService } from './pharmacy.service';
import { AuditLogService } from '../../common/services/audit-log.service';

@Module({
  controllers: [WorkspaceController],
  providers: [NurseService, LabService, PharmacyWorkspaceService, AuditLogService],
  exports: [NurseService, LabService, PharmacyWorkspaceService],
})
export class WorkspaceModule {}
