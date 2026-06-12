/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/telemedicine/telemedicine.module.ts
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
 * NestJS module: wires providers, controllers, and imports for telemedicine
 *
 * Responsibilities:
 * - Configure dependency injection for telemedicine
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
Telemedicine
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

import { AuditLogService } from '../../common/services/audit-log.service';
import { ConsultationService } from './consultation.service';
import { TelemedicineController } from './telemedicine.controller';
import { TelemedicineService } from './telemedicine.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { TimelineModule } from '../timeline/timeline.module';
import { HealthTwinModule } from '../health-twin/health-twin.module';
import { AiModule } from '../ai/ai.module';
import { PreConsultContextService } from './pre-consult-context.service';

@Module({
  imports: [
    NotificationsModule,
    TimelineModule,
    HealthTwinModule,
    AiModule,
  ],
  controllers: [TelemedicineController],
  providers: [
    TelemedicineService,
    AuditLogService,
    ConsultationService,
    PreConsultContextService,
  ],
  exports: [
    TelemedicineService,
    ConsultationService,
    PreConsultContextService,
  ],
})
export class TelemedicineModule {}
