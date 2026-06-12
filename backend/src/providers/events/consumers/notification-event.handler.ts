/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/providers/events/consumers/notification-event.handler.ts
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
 * notification-event.handler — Notification module
 *
 * Responsibilities:
 * - Support notification functionality
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
Notification
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
import { NotificationsService } from '../../../modules/notifications/notifications.service';

@Injectable()
export class NotificationEventHandler implements OnModuleInit {
  constructor(
    private readonly consumer: DomainEventConsumer,
    private readonly notifications: NotificationsService,
  ) {}

  onModuleInit() {
    this.consumer.registerHandler(
      DomainEventType.APPOINTMENT_BOOKED,
      async (event) => this.handleAppointmentBooked(event),
    );
    this.consumer.registerHandler(
      DomainEventType.APPOINTMENT_CANCELLED,
      async (event) => this.handleAppointmentCancelled(event),
    );
    this.consumer.registerHandler(
      DomainEventType.LAB_REPORT_UPLOADED,
      async (event) => this.handleLabReportUploaded(event),
    );
    this.consumer.registerHandler(
      DomainEventType.PRESCRIPTION_CREATED,
      async (event) => this.handlePrescriptionCreated(event),
    );
    this.consumer.registerHandler(
      DomainEventType.CARE_PLAN_CREATED,
      async (event) => this.handleCarePlanCreated(event),
    );
  }

  private async handleAppointmentBooked(event: any) {
    const payload = event.payload;
    await this.notifications.sendNotification({
      userId: payload.patientUserId,
      templateKey: 'appointment_booked',
      channels: ['SMS', 'EMAIL', 'PUSH', 'IN_APP'] as any,
      payload: {
        appointmentId: payload.appointmentId,
        doctorName: payload.doctorProfileId,
        appointmentTime: payload.slotStartAt,
        consultationMode: payload.consultationMode,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private async handleAppointmentCancelled(event: any) {
    const payload = event.payload;
    await this.notifications.sendNotification({
      userId: payload.patientUserId,
      templateKey: 'appointment_cancelled',
      channels: ['SMS', 'EMAIL', 'PUSH'] as any,
      payload: {
        appointmentId: payload.appointmentId,
        reason: payload.reason,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private async handleLabReportUploaded(event: any) {
    const payload = event.payload;
    try {
      await this.notifications.sendLabResultNotification(
        payload.patientUserId,
        payload.reportId,
      );
    } catch {
      await this.notifications.sendNotification({
        userId: payload.patientUserId,
        templateKey: 'lab_result_ready',
        channels: ['SMS', 'PUSH', 'IN_APP'] as any,
        payload: {
          labId: payload.reportId,
          testName: payload.testName,
          isAbnormal: payload.isAbnormal,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  private async handlePrescriptionCreated(event: any) {
    const payload = event.payload;
    await this.notifications.sendNotification({
      userId: payload.patientUserId,
      templateKey: 'prescription_created',
      channels: ['SMS', 'PUSH', 'IN_APP'] as any,
      payload: {
        prescriptionId: payload.prescriptionId,
        medicationNames: payload.medicationNames?.join(', '),
        timestamp: new Date().toISOString(),
      },
    });
  }

  private async handleCarePlanCreated(event: any) {
    const payload = event.payload;
    await this.notifications.sendNotification({
      userId: payload.userId,
      templateKey: 'careplan_created',
      channels: ['EMAIL', 'PUSH', 'IN_APP'] as any,
      payload: {
        carePlanId: payload.carePlanId,
        planType: payload.type,
        planTitle: payload.title,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
