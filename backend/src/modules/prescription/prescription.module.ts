/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/prescription/prescription.module.ts
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
 * NestJS module: wires providers, controllers, and imports for prescription
 *
 * Responsibilities:
 * - Configure dependency injection for prescription
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
Prescription
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
import { PrismaModule } from '../../providers/prisma/prisma.module';
import { EventsModule } from '../../providers/events/events.module';
import { AiModule } from '../ai/ai.module';
import { PrescriptionController } from './prescription.controller';
import { PrescriptionService } from './prescription.service';
import { InteractionEngineService } from './interaction-engine.service';
import { PrescriptionPDFService } from './prescription-pdf.service';
import { PrescriptionQRService } from './prescription-qr.service';
import { AuditLogService } from '../../common/services/audit-log.service';

@Module({
  imports: [PrismaModule, EventsModule, AiModule],
  controllers: [PrescriptionController],
  providers: [
    PrescriptionService,
    InteractionEngineService,
    PrescriptionPDFService,
    PrescriptionQRService,
    AuditLogService,
  ],
  exports: [PrescriptionService, InteractionEngineService],
})
export class PrescriptionModule {}
