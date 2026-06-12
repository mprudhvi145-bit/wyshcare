/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/providers/events/consumers/events-consumer.module.ts
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
 * NestJS module: wires providers, controllers, and imports for consumers
 *
 * Responsibilities:
 * - Configure dependency injection for consumers
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

import { DomainEventConsumer } from './domain-event.consumer';
import { EventsModule } from '../events.module';
import { NotificationsModule } from '../../../modules/notifications/notifications.module';
import { AnalyticsModule } from '../../../modules/analytics/analytics.module';
import { HealthScoreModule } from '../../../modules/health-score/health-score.module';

import { NotificationEventHandler } from './notification-event.handler';
import { AnalyticsEventHandler } from './analytics-event.handler';
import { HealthScoreEventHandler } from './healthscore-event.handler';

@Module({
  imports: [
    EventsModule,
    NotificationsModule,
    AnalyticsModule,
    HealthScoreModule,
  ],
  providers: [
    DomainEventConsumer,
    NotificationEventHandler,
    AnalyticsEventHandler,
    HealthScoreEventHandler,
  ],
  exports: [DomainEventConsumer],
})
export class EventsConsumerModule {}
