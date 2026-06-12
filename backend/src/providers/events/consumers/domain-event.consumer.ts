/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/providers/events/consumers/domain-event.consumer.ts
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
 * domain-event.consumer — AI module
 *
 * Responsibilities:
 * - Support ai functionality
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
 - operators
 - common
 *
 * Dependencies:
 - operators
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

import { Injectable, OnModuleInit } from '@nestjs/common';
import { filter } from 'rxjs/operators';

import { DomainEventsService, DomainEvent } from '../events.service';
import { DomainEventType } from '../events.types';

@Injectable()
export class DomainEventConsumer implements OnModuleInit {
  private readonly handlerMap: Map<string, (event: DomainEvent) => Promise<void>> = new Map();

  constructor(
    private readonly events: DomainEventsService,
  ) {}

  onModuleInit() {
    this.events.stream$.subscribe({
      next: (event) => this.route(event),
      error: (err) => console.error('[DomainEventConsumer] Stream error:', err),
    });
  }

  registerHandler(eventType: string, handler: (event: DomainEvent) => Promise<void>) {
    this.handlerMap.set(eventType, handler);
  }

  private async route(event: DomainEvent) {
    const handler = this.handlerMap.get(event.type);
    if (handler) {
      try {
        await handler(event);
      } catch (err) {
        console.error(`[DomainEventConsumer] Handler failed for ${event.type}:`, err);
      }
    }
  }
}
