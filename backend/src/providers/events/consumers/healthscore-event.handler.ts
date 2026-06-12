/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/providers/events/consumers/healthscore-event.handler.ts
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
 * healthscore-event.handler — Health module
 *
 * Responsibilities:
 * - Support health functionality
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
Health
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

import { Injectable, OnModuleInit } from '@nestjs/common';

import { DomainEventConsumer } from './domain-event.consumer';
import { DomainEventType } from '../events.types';

@Injectable()
export class HealthScoreEventHandler implements OnModuleInit {
  constructor(
    private readonly consumer: DomainEventConsumer,
  ) {}

  onModuleInit() {
    this.consumer.registerHandler(
      DomainEventType.LAB_REPORT_UPLOADED,
      async () => this.handleTriggersHealthScoreChange(),
    );
    this.consumer.registerHandler(
      DomainEventType.APPOINTMENT_COMPLETED,
      async () => this.handleTriggersHealthScoreChange(),
    );
    this.consumer.registerHandler(
      DomainEventType.PRESCRIPTION_CREATED,
      async () => this.handleTriggersHealthScoreChange(),
    );
    this.consumer.registerHandler(
      DomainEventType.CARE_PLAN_COMPLETED,
      async () => this.handleTriggersHealthScoreChange(),
    );
  }

  private async handleTriggersHealthScoreChange() {
    // Health score recalculation is triggered on-demand by the frontend
    // via the health-score REST endpoint. This handler is a placeholder
    // for proactive recalculation if needed in the future.
    //
    // For now, these events are tracked in analytics so we can identify
    // users whose health score may need refreshing on next visit.
  }
}
