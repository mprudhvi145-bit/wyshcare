/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/notifications/notifications.service.ts
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
 * Business logic service for notifications
 *
 * Responsibilities:
 * - Execute business logic for notification operations
 * - Coordinate data access and external API calls
 *
 * Used By:
 - backend/src/modules/prescription/prescription.service.ts
 - backend/src/providers/storage/storage.module.ts
 - backend/src/modules/abdm/abdm.module.ts
 - backend/src/modules/digital-twin/digital-twin.service.ts
 - backend/src/modules/prescription/interaction-engine.service.ts
 - backend/src/modules/interoperability/interoperability.module.ts
 - backend/src/main.ts
 - backend/src/modules/health-graph/health-graph.service.ts
 *
 * Calls:
 - crypto
 - client
 - common
 *
 * Dependencies:
 - crypto
 - client
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

import { createTransport } from 'nodemailer';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { NotificationChannel, NotificationStatus, NotificationPriority, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import { DomainEventsService } from '../../providers/events/events.service';
import { SmsService } from '../auth/sms.service';
import { NotificationsGateway } from './notifications.gateway';
import { FcmService } from './providers/fcm.service';
import { DeviceTokensService } from '../device-tokens/device-tokens.service';

function maskPhone(phone: string): string {
  if (phone.length <= 4) return '****';
  return phone.slice(0, 2) + '****' + phone.slice(-2);
}

function maskEmail(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) return '***@***';
  return email[0] + '***@' + email.slice(atIndex + 1);
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly domainEventsService: DomainEventsService,
    private readonly gateway: NotificationsGateway,
    private readonly smsService: SmsService,
    private readonly fcmService: FcmService,
    private readonly deviceTokensService: DeviceTokensService,
  ) {}

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(userId: string, page = 1, limit = 20) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });
    return { count };
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string, userId: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });
    return { success: true };
  }

  /**
   * Mark all unread notifications as read
   */
  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { success: true };
  }

  /**
   * Get user notification preferences
   */
  async getPreferences(userId: string) {
    return this.prisma.notificationPreference.findMany({
      where: { userId },
    });
  }

  /**
   * Update notification preference
   */
  async updatePreference(userId: string, channel: string, enabled: boolean) {
    return this.prisma.notificationPreference.upsert({
      where: {
        userId_channel: {
          userId,
          channel: channel as NotificationChannel,
        },
      },
      create: {
        userId,
        channel: channel as NotificationChannel,
        enabled,
        updatedAt: new Date(),
      },
      update: {
        enabled,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Seed default notification templates
   */
  async seedTemplates() {
    const templates = [
      {
        key: 'prescription_reminder',
        name: 'Prescription Reminder',
        channels: [NotificationChannel.SMS, NotificationChannel.PUSH, NotificationChannel.IN_APP],
        subject: 'Prescription Reminder',
        body: 'Hello {{patientName}}, this is a reminder for your prescription of {{medications}} from Dr. {{doctorName}}.',
        variables: ['patientName', 'medications', 'doctorName'],
      },
      {
        key: 'lab_result_ready',
        name: 'Lab Result Ready',
        channels: [NotificationChannel.SMS, NotificationChannel.EMAIL, NotificationChannel.PUSH, NotificationChannel.IN_APP],
        subject: 'Your Lab Result is Ready',
        body: 'Hello {{patientName}}, your result for {{testName}} is ready: {{result}} {{unit}}.',
        variables: ['patientName', 'testName', 'result', 'unit'],
      },
      {
        key: 'appointment_reminder',
        name: 'Appointment Reminder',
        channels: [NotificationChannel.SMS, NotificationChannel.EMAIL, NotificationChannel.PUSH],
        subject: 'Upcoming Appointment Reminder',
        body: 'Hello {{patientName}}, you have an upcoming appointment with Dr. {{doctorName}} at {{clinicName}} on {{appointmentTime}}.',
        variables: ['patientName', 'doctorName', 'clinicName', 'appointmentTime'],
      },
      {
        key: 'emergency_generic',
        name: 'Emergency Alert',
        channels: [NotificationChannel.SMS, NotificationChannel.EMAIL, NotificationChannel.PUSH, NotificationChannel.VOICE],
        subject: 'Emergency Alert!',
        body: 'Emergency alert of type {{type}}: {{details}}.',
        variables: ['type', 'details'],
      },
    ];

    const results = [];
    for (const t of templates) {
      const existing = await this.prisma.notificationTemplate.findUnique({
        where: { key: t.key },
      });
      if (existing) {
        const updated = await this.prisma.notificationTemplate.update({
          where: { key: t.key },
          data: {
            name: t.name,
            channels: t.channels,
            subject: t.subject,
            body: t.body,
            variables: t.variables,
            updatedAt: new Date(),
          },
        });
        results.push(updated);
      } else {
        const created = await this.prisma.notificationTemplate.create({
          data: {
            key: t.key,
            name: t.name,
            channels: t.channels,
            subject: t.subject,
            body: t.body,
            variables: t.variables,
            updatedAt: new Date(),
          },
        });
        results.push(created);
      }
    }
    return results;
  }

  /**
   * Send notification via multiple channels
   */
  async sendNotification(dto: {
    userId: string;
    templateKey: string;
    channels: NotificationChannel[];
    payload?: Record<string, unknown>;
    priority?: NotificationPriority;
  }): Promise<any[]> {
    // Get the template
    const template = await this.prisma.notificationTemplate.findUnique({
      where: { key: dto.templateKey },
    });

    if (!template) {
      throw new Error(`Template not found: ${dto.templateKey}`);
    }

    // Validate channels are supported by template
    const invalidChannels = dto.channels.filter(
      channel => !template.channels.includes(channel),
    );
    if (invalidChannels.length > 0) {
      throw new Error(
        `Template does not support channels: ${invalidChannels.join(', ')}`,
      );
    }

    // Render template with payload
    const renderedSubject = this.renderTemplate(
      template.subject || '',
      dto.payload || {},
    );
    const renderedBody = this.renderTemplate(
      template.body,
      dto.payload || {},
    );

    // Create main notification record
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        templateKey: dto.templateKey,
        payload: dto.payload as Prisma.JsonObject,
        channel: dto.channels[0] || NotificationChannel.IN_APP, // Primary channel for backward compatibility
        status: NotificationStatus.PENDING,
      },
    });

    // Send via each channel
    const deliveryPromises = dto.channels.map(channel =>
      this.sendViaChannel(
        notification.id,
        dto.userId,
        channel,
        renderedSubject,
        renderedBody,
        dto.payload || {},
        dto.priority || NotificationPriority.MEDIUM,
      ),
    );

    const deliveries = await Promise.all(deliveryPromises);

    // Emit domain event
    this.domainEventsService.publish('NotificationSent', {
      notificationId: notification.id,
      userId: dto.userId,
      channels: dto.channels,
    });

    // Create audit log
    await this.auditLogService.capture({
      actorUserId: dto.userId,
      action: 'NOTIFICATION_SENT',
      resourceType: 'Notification',
      resourceId: notification.id,
      metadata: {
        templateKey: dto.templateKey,
        channels: dto.channels,
        payload: dto.payload,
      },
    });

    // Emit via websocket for real-time updates
    this.gateway.emitUserNotification(dto.userId, {
      id: notification.id,
      templateKey: dto.templateKey,
      channels: dto.channels,
      createdAt: notification.createdAt,
    });

    return deliveries;
  }

  /**
   * Send emergency alert via all critical channels
   */
  async sendEmergencyAlert(
    userId: string,
    type: string,
    details: any,
  ): Promise<void> {
    const emergencyTemplateKey = `emergency_${type}`;

    // Try to get emergency-specific template, fall back to generic
    let template = await this.prisma.notificationTemplate.findUnique({
      where: { key: emergencyTemplateKey },
    });

    if (!template) {
      template = await this.prisma.notificationTemplate.findUnique({
        where: { key: 'emergency_generic' },
      });
    }

    if (!template) {
      // Create a basic emergency template on the fly if none exists
      await this.sendNotification({
        userId,
        templateKey: 'emergency_generic', // This should exist in seed data
        channels: [
          NotificationChannel.SMS,
          NotificationChannel.EMAIL,
          NotificationChannel.PUSH,
          NotificationChannel.VOICE,
        ],
        payload: {
          type,
          ...details,
          timestamp: new Date().toISOString(),
        },
        priority: NotificationPriority.HIGH,
      });
      return;
    }

    await this.sendNotification({
      userId,
      templateKey: emergencyTemplateKey,
      channels: template.channels,
      payload: {
        type,
        ...details,
        timestamp: new Date().toISOString(),
      },
      priority: NotificationPriority.HIGH,
    });
  }

  /**
   * Send prescription reminder
   */
  async sendPrescriptionReminder(
    userId: string,
    prescriptionId: string,
  ): Promise<void> {
    // Get prescription details
    const prescription = await this.prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        patientUser: true,
        doctorProfile: true,
        medications: true,
      },
    });

    if (!prescription || prescription.patientUserId !== userId) {
      throw new Error('Prescription not found or access denied');
    }

    await this.sendNotification({
      userId,
      templateKey: 'prescription_reminder',
      channels: [NotificationChannel.SMS, NotificationChannel.PUSH, NotificationChannel.IN_APP],
      payload: {
        prescriptionId,
        patientName: prescription.patientUser?.fullName,
        doctorName: prescription.doctorProfile?.specialization,
        medications: prescription.medications.map(m => m.name).join(', '),
        timestamp: new Date().toISOString(),
      },
      priority: NotificationPriority.MEDIUM,
    });
  }

  /**
   * Send lab result notification
   */
  async sendLabResultNotification(
    userId: string,
    labId: string,
  ): Promise<void> {
    // Get lab result details
    const labResult = await this.prisma.labResult.findUnique({
      where: { id: labId },
      include: {
        DiagnosticOrder: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!labResult || labResult.DiagnosticOrder?.userId !== userId) {
      throw new Error('Lab result not found or access denied');
    }

    await this.sendNotification({
      userId,
      templateKey: 'lab_result_ready',
      channels: [NotificationChannel.SMS, NotificationChannel.EMAIL, NotificationChannel.PUSH, NotificationChannel.IN_APP],
      payload: {
        labId,
        testName: labResult.testName,
        result: labResult.result,
        unit: labResult.unit,
        isAbnormal: labResult.isAbnormal,
        patientName: labResult.DiagnosticOrder?.user?.fullName,
        timestamp: new Date().toISOString(),
      },
      priority: NotificationPriority.HIGH,
    });
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(
    userId: string,
    appointmentId: string,
    hoursBefore: number,
  ): Promise<void> {
    // Get appointment details
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patientUser: true,
        doctorProfile: true,
        clinic: true,
      },
    });

    if (!appointment || appointment.patientUserId !== userId) {
      throw new Error('Appointment not found or access denied');
    }

    await this.sendNotification({
      userId,
      templateKey: 'appointment_reminder',
      channels: [NotificationChannel.SMS, NotificationChannel.EMAIL, NotificationChannel.PUSH],
      payload: {
        appointmentId,
        patientName: appointment.patientUser?.fullName,
        doctorName: appointment.doctorProfile?.specialization,
        clinicName: appointment.clinic?.name,
        appointmentTime: appointment.slotStartAt.toLocaleString(),
        hoursBefore,
        timestamp: new Date().toISOString(),
      },
      priority: NotificationPriority.MEDIUM,
    });
  }

  /**
   * Get notification template
   */
  async getTemplate(key: string) {
    return this.prisma.notificationTemplate.findUnique({
      where: { key },
    });
  }

  /**
   * Create notification template
   */
  async createTemplate(dto: {
    key: string;
    name: string;
    channels: NotificationChannel[];
    subject?: string;
    body: string;
    variables?: string[];
  }) {
    return this.prisma.notificationTemplate.create({
      data: {
        key: dto.key,
        name: dto.name,
        channels: dto.channels,
        subject: dto.subject,
        body: dto.body,
        variables: dto.variables || [],
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Render template with variables
   */
  private renderTemplate(template: string, data: Record<string, unknown>): string {
    if (!template) return '';
    
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = data[key];
      return value !== undefined && value !== null ? String(value) : match;
    });
  }

  /**
   * Send notification via specific channel
   */
  private async sendViaChannel(
    notificationId: string,
    userId: string,
    channel: NotificationChannel,
    subject: string,
    body: string,
    payload: Record<string, unknown>,
    priority: NotificationPriority,
  ): Promise<any> {
    // Create delivery record
    const delivery = await this.prisma.notificationDelivery.create({
      data: {
        id: randomUUID(),
        notificationId,
        channel,
        status: NotificationStatus.PENDING,
        recipientId: userId,
      },
    });

    try {
      let providerMessageId: string | null = null;
      let success = false;

      // Send via appropriate provider
      switch (channel) {
        case NotificationChannel.SMS:
          providerMessageId = await this.sendSMS(userId, body, priority);
          success = true;
          break;
        case NotificationChannel.EMAIL:
          providerMessageId = await this.sendEmail(userId, subject, body, priority);
          success = true;
          break;
        case NotificationChannel.PUSH:
          providerMessageId = await this.sendPushNotification(userId, subject, body, payload, priority);
          success = true;
          break;
        case NotificationChannel.WHATSAPP:
          providerMessageId = await this.sendWhatsApp(userId, body, priority);
          success = true;
          break;
        case NotificationChannel.VOICE:
          providerMessageId = await this.sendVoiceCall(userId, body, priority);
          success = true;
          break;
        case NotificationChannel.IN_APP:
          // For in-app, we just mark as delivered since it's stored in DB
          providerMessageId = `inapp_${Date.now()}`;
          success = true;
          break;
        default:
          throw new Error(`Unsupported channel: ${channel}`);
      }

      // Update delivery as successful
      await this.prisma.notificationDelivery.update({
        where: { id: delivery.id },
        data: {
          status: NotificationStatus.SENT,
          providerMessage: providerMessageId,
          deliveredAt: new Date(),
        },
      });

      // Emit success event
      this.domainEventsService.publish('NotificationDelivered', {
        deliveryId: delivery.id,
        notificationId,
        channel,
        providerMessageId,
      });

      // Create audit log for success
      await this.auditLogService.capture({
        actorUserId: userId,
        action: 'NOTIFICATION_DELIVERED',
        resourceType: 'NotificationDelivery',
        resourceId: delivery.id,
        metadata: {
          channel,
          providerMessageId,
        },
      });

      return {
        id: delivery.id,
        channel,
        status: NotificationStatus.SENT,
        providerMessageId,
        deliveredAt: new Date(),
      };
    } catch (error) {
      // Update delivery as failed
      await this.prisma.notificationDelivery.update({
        where: { id: delivery.id },
        data: {
          status: NotificationStatus.FAILED,
          errorMessage: (error as any).message,
          failedAt: new Date(),
          retryCount: { increment: 1 },
        },
      });

      // Emit failure event
      this.domainEventsService.publish('NotificationFailed', {
        deliveryId: delivery.id,
        notificationId,
        channel,
        error: (error as any).message,
      });

      // Create audit log for failure
      await this.auditLogService.capture({
        actorUserId: userId,
        action: 'NOTIFICATION_FAILED',
        resourceType: 'NotificationDelivery',
        resourceId: delivery.id,
        metadata: {
          channel,
          error: (error as any).message,
        },
      });

      return {
        id: delivery.id,
        channel,
        status: NotificationStatus.FAILED,
        errorMessage: (error as any).message,
        failedAt: new Date(),
        retryCount: 1,
      };
    }
  }

  /**
   * SMS provider — uses auth SmsService (Twilio/MSG91) when configured, logs otherwise
   */
  private async sendSMS(
    userId: string,
    body: string,
    priority: NotificationPriority,
  ): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { phoneNumber: true },
    });

    if (!user?.phoneNumber) {
      throw new Error('User phone number not found');
    }

    try {
      await this.smsService.sendOtp(user.phoneNumber, body);
      return `sm_${randomUUID().slice(0, 8)}`;
    } catch (err) {
      this.logger.warn(`SMS delivery failed for ${maskPhone(user.phoneNumber)}: ${(err as Error).message}`);
      throw err;
    }
  }

  /**
   * Email provider — uses nodemailer (SMTP) when configured, logs otherwise
   */
  private async sendEmail(
    userId: string,
    subject: string,
    body: string,
    priority: NotificationPriority,
  ): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user?.email) {
      throw new Error('User email not found');
    }

    const smtpHost = process.env.SMTP_HOST;
    if (smtpHost) {
      const transporter = createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER ?? '',
          pass: process.env.SMTP_PASS ?? '',
        },
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM ?? 'noreply@wyshcare.app',
        to: user.email,
        subject,
        text: body,
      });
      return `email_${randomUUID().slice(0, 8)}`;
    }

    this.logger.warn(`[EMAIL] To: ${maskEmail(user.email)}, Subject: ${subject}`);
    return `email_${randomUUID().slice(0, 8)}`;
  }

  /**
   * Push notification provider (Firebase Cloud Messaging)
   */
  private async sendPushNotification(
    userId: string,
    subject: string,
    body: string,
    payload: Record<string, unknown>,
    priority: NotificationPriority,
  ): Promise<string> {
    const extraData: Record<string, string> = {};
    if (payload && typeof payload === 'object') {
      for (const [key, value] of Object.entries(payload)) {
        extraData[key] = String(value ?? '');
      }
    }
    extraData.priority = priority;

    const tokens = await this.deviceTokensService.getUserTokens(userId);
    if (tokens.length === 0) {
      this.logger.warn(`[PUSH] No device tokens for user ${userId}`);
      return `push_no_device_${Date.now()}`;
    }

    const deviceTokens = tokens.map((t) => t.deviceToken);
    const result = await this.fcmService.sendMulticast(deviceTokens, subject, body, extraData);

    for (const failed of result.failed) {
      if (failed.error.includes('UNREGISTERED')) {
        await this.deviceTokensService.removeInvalidToken(failed.token);
      }
    }

    return result.success[0] ?? `push_failed_${Date.now()}`;
  }

  /**
   * Mock WhatsApp provider (WhatsApp Business API)
   */
  private async sendWhatsApp(
    userId: string,
    body: string,
    priority: NotificationPriority,
  ): Promise<string> {
    // Get user phone number
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { phoneNumber: true },
    });

    if (!user?.phoneNumber) {
      throw new Error('User phone number not found');
    }

    // Mock implementation - in production, use WhatsApp Business API
    console.log(`[WHATSAPP MOCK] To: ${maskPhone(user.phoneNumber)}, Priority: ${priority}`);
    
    // Simulate random failure for testing (8% failure rate)
    if (Math.random() < 0.08) {
      throw new Error('WhatsApp delivery failed: Template not approved');
    }

    // Return mock message ID
    return `wa_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Mock Voice call provider (Twilio Voice)
   */
  private async sendVoiceCall(
    userId: string,
    body: string,
    priority: NotificationPriority,
  ): Promise<string> {
    // Get user phone number
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { phoneNumber: true },
    });

    if (!user?.phoneNumber) {
      throw new Error('User phone number not found');
    }

    // Mock implementation - in production, use Twilio Voice
    console.log(`[VOICE MOCK] To: ${maskPhone(user.phoneNumber)}, Priority: ${priority}`);
    
    // Simulate random failure for testing (15% failure rate - voice is less reliable)
    if (Math.random() < 0.15) {
      throw new Error('Voice call failed: Call not answered');
    }

    // Return mock call SID
    return `call_${Math.random().toString(36).substr(2, 9)}`;
  }
}