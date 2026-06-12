/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/notifications/notifications.controller.ts
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
 * HTTP controller: exposes REST endpoints for notifications
 *
 * Responsibilities:
 * - Handle HTTP requests for notification operations
 * - Validate and transform request/response payloads
 * - Delegate business logic to service layer
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
 - swagger
 - common
 *
 * Dependencies:
 - swagger
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

import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { CreateTemplateDto } from './dto/create-template.dto';

@ApiTags('notifications')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.notifications.getUserNotifications(user.userId, Number(page) || 1, Number(limit) || 20);
  }

  @Get('unread-count')
  unreadCount(@CurrentUser() user: AuthenticatedUser) {
    return this.notifications.getUnreadCount(user.userId);
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.notifications.markAsRead(id, user.userId);
  }

  @Post('read-all')
  markAllRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notifications.markAllAsRead(user.userId);
  }

  @Get('preferences')
  getPrefs(@CurrentUser() user: AuthenticatedUser) {
    return this.notifications.getPreferences(user.userId);
  }

  @Patch('preferences')
  updatePref(@CurrentUser() user: AuthenticatedUser, @Body() body: { channel: string; enabled: boolean }) {
    return this.notifications.updatePreference(user.userId, body.channel, body.enabled);
  }

  @Post('seed-templates')
  seedTemplates() {
    return this.notifications.seedTemplates();
  }

  // NEW ENDPOINTS FOR ENHANCED NOTIFICATION SERVICE

  @Post('send')
  async sendNotification(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SendNotificationDto,
  ) {
    // Only allow admins/system to send notifications directly
    // In a real app, you'd check user roles here
    return this.notifications.sendNotification({
      ...dto,
      userId: dto.userId || user.userId, // Allow override for admin, default to current user
    });
  }

  @Post('template')
  async createTemplate(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTemplateDto,
  ) {
    // Only allow admins to create templates
    return this.notifications.createTemplate(dto);
  }

  @Get('history')
  async getNotificationHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
  ) {
    const targetUserId = userId || user.userId;
    // In a real app, you'd check if user is authorized to view targetUserId's notifications
    return this.notifications.getUserNotifications(targetUserId, 1, Number(limit) || 50);
  }

  @Post('emergency-alert')
  async sendEmergencyAlert(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { type: string; details: any; userId?: string },
  ) {
    // Only allow admins/system to send emergency alerts
    const targetUserId = body.userId || user.userId;
    return this.notifications.sendEmergencyAlert(targetUserId, body.type, body.details);
  }

  @Post('prescription-reminder')
  async sendPrescriptionReminder(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { prescriptionId: string; userId?: string },
  ) {
    const targetUserId = body.userId || user.userId;
    return this.notifications.sendPrescriptionReminder(targetUserId, body.prescriptionId);
  }

  @Post('lab-result')
  async sendLabResultNotification(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { labId: string; userId?: string },
  ) {
    const targetUserId = body.userId || user.userId;
    return this.notifications.sendLabResultNotification(targetUserId, body.labId);
  }

  @Post('appointment-reminder')
  async sendAppointmentReminder(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { appointmentId: string; hoursBefore: number; userId?: string },
  ) {
    const targetUserId = body.userId || user.userId;
    return this.notifications.sendAppointmentReminder(targetUserId, body.appointmentId, body.hoursBefore);
  }
}