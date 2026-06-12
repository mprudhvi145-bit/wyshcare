/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ehr/ehr.module.ts
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
 * NestJS module: wires providers, controllers, and imports for ehr
 *
 * Responsibilities:
 * - Configure dependency injection for ehr
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
EHR
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
import { EhrController } from './ehr.controller';
import { PatientChartService } from './patient-chart.service';
import { EncounterService } from './encounter.service';
import { OrdersService } from './orders.service';
import { ClinicalNotesService } from './clinical-notes.service';
import { CDSService } from './cds.service';
import { EhrTimelineService } from './timeline.service';
import { AuditLogService } from '../../common/services/audit-log.service';

@Module({
  controllers: [EhrController],
  providers: [PatientChartService, EncounterService, OrdersService, ClinicalNotesService, CDSService, EhrTimelineService, AuditLogService],
  exports: [PatientChartService, EncounterService, OrdersService, ClinicalNotesService, CDSService],
})
export class EhrModule {}
