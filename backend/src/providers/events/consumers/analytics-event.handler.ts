/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/providers/events/consumers/analytics-event.handler.ts
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
 * analytics-event.handler — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
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

import { Injectable, OnModuleInit } from '@nestjs/common';

import { DomainEventConsumer } from './domain-event.consumer';
import { DomainEventType } from '../events.types';
import { AnalyticsService } from '../../../modules/analytics/analytics.service';

@Injectable()
export class AnalyticsEventHandler implements OnModuleInit {
  constructor(
    private readonly consumer: DomainEventConsumer,
    private readonly analytics: AnalyticsService,
  ) {}

  onModuleInit() {
    this.consumer.registerHandler(
      DomainEventType.APPOINTMENT_BOOKED,
      async (event) => this.analytics.trackEvent('appointment_booked', event.payload),
    );
    this.consumer.registerHandler(
      DomainEventType.APPOINTMENT_COMPLETED,
      async (event) => this.analytics.trackEvent('appointment_completed', event.payload),
    );
    this.consumer.registerHandler(
      DomainEventType.APPOINTMENT_CANCELLED,
      async (event) => this.analytics.trackEvent('appointment_cancelled', event.payload),
    );
    this.consumer.registerHandler(
      DomainEventType.HEALTH_SCORE_CHANGED,
      async (event) => this.analytics.trackEvent('health_score_changed', event.payload),
    );
    this.consumer.registerHandler(
      DomainEventType.PRESCRIPTION_CREATED,
      async (event) => this.analytics.trackEvent('prescription_created', event.payload),
    );
    this.consumer.registerHandler(
      DomainEventType.LAB_REPORT_UPLOADED,
      async (event) => this.analytics.trackEvent('lab_report_uploaded', event.payload),
    );
    this.consumer.registerHandler(
      DomainEventType.CONSULTATION_ENDED,
      async (event) => this.analytics.trackEvent('consultation_ended', event.payload),
    );
    this.consumer.registerHandler(
      DomainEventType.PATIENT_REGISTERED,
      async (event) => this.analytics.trackEvent('patient_registered', event.payload),
    );
  }
}
