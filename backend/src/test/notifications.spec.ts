import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { Test } from '@nestjs/testing';
import { NotificationChannel, NotificationPriority, NotificationStatus } from '@prisma/client';
import { NotificationsService } from '../modules/notifications/notifications.service';
import { PrismaService } from '../providers/prisma/prisma.service';
import { AuditLogService } from '../common/services/audit-log.service';
import { DomainEventsService } from '../providers/events/events.service';
import { NotificationsGateway } from '../modules/notifications/notifications.gateway';
import { SmsService } from '../modules/auth/sms.service';
import { FcmService } from '../modules/notifications/providers/fcm.service';
import { DeviceTokensService } from '../modules/device-tokens/device-tokens.service';

function mockFn() {
  return mock.fn<(...args: any[]) => any>();
}

function makePrismaMock() {
  const model = () => ({
    findUnique: mockFn(),
    findFirst: mockFn(),
    findMany: mockFn(),
    create: mockFn(),
    update: mockFn(),
    updateMany: mockFn(),
    delete: mockFn(),
    count: mockFn(),
    upsert: mockFn(),
  });
  return {
    notification: model(),
    notificationTemplate: model(),
    notificationDelivery: model(),
    notificationPreference: model(),
    user: model(),
  };
}

function makeAuditMock() {
  return { capture: mockFn() };
}

function makeEventsMock() {
  return { publish: mockFn() };
}

function makeGatewayMock() {
  return { emitUserNotification: mockFn() };
}

function makeSmsMock() {
  return { sendOtp: mockFn() };
}

function makeFcmMock() {
  return { sendPush: mockFn() };
}

function makeDeviceTokensMock() {
  return {
    registerToken: mockFn(),
    unregisterToken: mockFn(),
    getTokensForUser: mockFn(),
    getUserIdsForToken: mockFn(),
  };
}

describe('NotificationsService — renderTemplate', () => {
  it('renders template with all variables', () => {
    const prisma = makePrismaMock() as any;
    const audit = makeAuditMock();
    const events = makeEventsMock();
    const gateway = makeGatewayMock();
    const sms = makeSmsMock();
    const fcm = makeFcmMock();
    const svc = new NotificationsService(
      prisma as unknown as PrismaService,
      audit as unknown as AuditLogService,
      events as unknown as DomainEventsService,
      gateway as unknown as NotificationsGateway,
      sms as unknown as SmsService,
      fcm as unknown as FcmService,
      makeDeviceTokensMock() as unknown as DeviceTokensService,
    );
    const rendered = (svc as any).renderTemplate(
      'Hello {{patientName}}, your {{testName}} result is {{result}}.',
      { patientName: 'Alice', testName: 'Hemoglobin', result: '14.5' },
    );
    assert.equal(rendered, 'Hello Alice, your Hemoglobin result is 14.5.');
  });

  it('leaves unknown variables unresolved', () => {
    const prisma = makePrismaMock() as any;
    const audit = makeAuditMock();
    const events = makeEventsMock();
    const gateway = makeGatewayMock();
    const sms = makeSmsMock();
    const fcm = makeFcmMock();
    const svc = new NotificationsService(
      prisma as unknown as PrismaService,
      audit as unknown as AuditLogService,
      events as unknown as DomainEventsService,
      gateway as unknown as NotificationsGateway,
      sms as unknown as SmsService,
      fcm as unknown as FcmService,
      makeDeviceTokensMock() as unknown as DeviceTokensService,
    );
    const rendered = (svc as any).renderTemplate(
      'Hello {{unknownVar}}',
      {},
    );
    assert.equal(rendered, 'Hello {{unknownVar}}');
  });

  it('returns empty string for empty template', () => {
    const prisma = makePrismaMock() as any;
    const audit = makeAuditMock();
    const events = makeEventsMock();
    const gateway = makeGatewayMock();
    const sms = makeSmsMock();
    const fcm = makeFcmMock();
    const svc = new NotificationsService(
      prisma as unknown as PrismaService,
      audit as unknown as AuditLogService,
      events as unknown as DomainEventsService,
      gateway as unknown as NotificationsGateway,
      sms as unknown as SmsService,
      fcm as unknown as FcmService,
      makeDeviceTokensMock() as unknown as DeviceTokensService,
    );
    assert.equal((svc as any).renderTemplate('', {}), '');
  });

  it('replaces multiple occurrences of same variable', () => {
    const prisma = makePrismaMock() as any;
    const audit = makeAuditMock();
    const events = makeEventsMock();
    const gateway = makeGatewayMock();
    const sms = makeSmsMock();
    const fcm = makeFcmMock();
    const svc = new NotificationsService(
      prisma as unknown as PrismaService,
      audit as unknown as AuditLogService,
      events as unknown as DomainEventsService,
      gateway as unknown as NotificationsGateway,
      sms as unknown as SmsService,
      fcm as unknown as FcmService,
      makeDeviceTokensMock() as unknown as DeviceTokensService,
    );
    const rendered = (svc as any).renderTemplate(
      '{{name}}, your code is {{code}}. Confirm {{name}}?',
      { name: 'Bob', code: '1234' },
    );
    assert.equal(rendered, 'Bob, your code is 1234. Confirm Bob?');
  });
});

describe('NotificationsService — sendNotification', () => {
  it('throws when template not found', async () => {
    const prisma = makePrismaMock() as any;
    prisma.notificationTemplate.findUnique.mock.mockImplementation(() => null);
    const audit = makeAuditMock();
    const events = makeEventsMock();
    const gateway = makeGatewayMock();
    const sms = makeSmsMock();
    const fcm = makeFcmMock();
    const svc = new NotificationsService(
      prisma as unknown as PrismaService,
      audit as unknown as AuditLogService,
      events as unknown as DomainEventsService,
      gateway as unknown as NotificationsGateway,
      sms as unknown as SmsService,
      fcm as unknown as FcmService,
      makeDeviceTokensMock() as unknown as DeviceTokensService,
    );
    await assert.rejects(
      () => svc.sendNotification({
        userId: 'user-1',
        templateKey: 'nonexistent',
        channels: [NotificationChannel.IN_APP],
      }),
      /Template not found/,
    );
  });

  it('throws when channel not supported by template', async () => {
    const prisma = makePrismaMock() as any;
    prisma.notificationTemplate.findUnique.mock.mockImplementation(() => ({
      key: 'test_template',
      channels: [NotificationChannel.EMAIL],
      subject: 'Test',
      body: 'Body {{x}}',
      variables: ['x'],
    }));
    const audit = makeAuditMock();
    const events = makeEventsMock();
    const gateway = makeGatewayMock();
    const sms = makeSmsMock();
    const fcm = makeFcmMock();
    const svc = new NotificationsService(
      prisma as unknown as PrismaService,
      audit as unknown as AuditLogService,
      events as unknown as DomainEventsService,
      gateway as unknown as NotificationsGateway,
      sms as unknown as SmsService,
      fcm as unknown as FcmService,
      makeDeviceTokensMock() as unknown as DeviceTokensService,
    );
    await assert.rejects(
      () => svc.sendNotification({
        userId: 'user-1',
        templateKey: 'test_template',
        channels: [NotificationChannel.SMS],
      }),
      /Template does not support channels/,
    );
  });

  it('sends notification and creates delivery records', async () => {
    const prisma = makePrismaMock() as any;
    prisma.notificationTemplate.findUnique.mock.mockImplementation(() => ({
      key: 'test_template',
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      subject: 'Hello {{name}}',
      body: 'Hi {{name}}',
      variables: ['name'],
    }));
    prisma.notification.create.mock.mockImplementation(async () => ({
      id: 'notif-1',
      userId: 'user-1',
      createdAt: new Date(),
    }));
    prisma.notificationDelivery.create.mock.mockImplementation(async () => ({
      id: 'delivery-1',
    }));
    prisma.notificationDelivery.update.mock.mockImplementation(async () => ({}));
    prisma.user.findUnique.mock.mockImplementation(async () => ({
      id: 'user-1',
      email: 'test@example.com',
    }));

    const audit = makeAuditMock();
    const events = makeEventsMock();
    const gateway = makeGatewayMock();
    const sms = makeSmsMock();
    const fcm = makeFcmMock();
    const svc = new NotificationsService(
      prisma as unknown as PrismaService,
      audit as unknown as AuditLogService,
      events as unknown as DomainEventsService,
      gateway as unknown as NotificationsGateway,
      sms as unknown as SmsService,
      fcm as unknown as FcmService,
      makeDeviceTokensMock() as unknown as DeviceTokensService,
    );
    const deliveries = await svc.sendNotification({
      userId: 'user-1',
      templateKey: 'test_template',
      channels: [NotificationChannel.IN_APP],
      payload: { name: 'Alice' },
    });
    assert.ok(deliveries.length >= 1);
    assert.equal(events.publish.mock.calls.length, 2);
    assert.equal(audit.capture.mock.calls.length, 2);
  });
});

describe('NotificationsService — getPreferences / updatePreference', () => {
  it('getPreferences calls prisma.notificationPreference.findMany with userId', async () => {
    const prisma = makePrismaMock() as any;
    prisma.notificationPreference.findMany.mock.mockImplementation(() => []);
    const audit = makeAuditMock();
    const events = makeEventsMock();
    const gateway = makeGatewayMock();
    const sms = makeSmsMock();
    const fcm = makeFcmMock();
    const svc = new NotificationsService(
      prisma as unknown as PrismaService,
      audit as unknown as AuditLogService,
      events as unknown as DomainEventsService,
      gateway as unknown as NotificationsGateway,
      sms as unknown as SmsService,
      fcm as unknown as FcmService,
      makeDeviceTokensMock() as unknown as DeviceTokensService,
    );
    await svc.getPreferences('user-1');
    const callArgs = prisma.notificationPreference.findMany.mock.calls[0]!.arguments[0] as any;
    assert.equal(callArgs.where.userId, 'user-1');
  });

  it('updatePreference upserts preference record', async () => {
    const prisma = makePrismaMock() as any;
    prisma.notificationPreference.upsert.mock.mockImplementation(async (args: any) => args.create || args.update);
    const audit = makeAuditMock();
    const events = makeEventsMock();
    const gateway = makeGatewayMock();
    const sms = makeSmsMock();
    const fcm = makeFcmMock();
    const svc = new NotificationsService(
      prisma as unknown as PrismaService,
      audit as unknown as AuditLogService,
      events as unknown as DomainEventsService,
      gateway as unknown as NotificationsGateway,
      sms as unknown as SmsService,
      fcm as unknown as FcmService,
      makeDeviceTokensMock() as unknown as DeviceTokensService,
    );
    const result = await svc.updatePreference('user-1', 'SMS', true);
    const callArgs = prisma.notificationPreference.upsert.mock.calls[0]!.arguments[0] as any;
    assert.equal(callArgs.where.userId_channel.userId, 'user-1');
    assert.equal(callArgs.where.userId_channel.channel, 'SMS');
    assert.equal(callArgs.create.enabled, true);
  });
});

describe('NotificationsService — markAsRead / markAllAsRead / getUnreadCount', () => {
  it('markAsRead updates the notification with correct where clause', async () => {
    const prisma = makePrismaMock() as any;
    prisma.notification.updateMany.mock.mockImplementation(async () => ({ count: 1 }));
    const audit = makeAuditMock();
    const events = makeEventsMock();
    const gateway = makeGatewayMock();
    const sms = makeSmsMock();
    const fcm = makeFcmMock();
    const svc = new NotificationsService(
      prisma as unknown as PrismaService,
      audit as unknown as AuditLogService,
      events as unknown as DomainEventsService,
      gateway as unknown as NotificationsGateway,
      sms as unknown as SmsService,
      fcm as unknown as FcmService,
      makeDeviceTokensMock() as unknown as DeviceTokensService,
    );
    const result = await svc.markAsRead('notif-1', 'user-1');
    assert.equal(result.success, true);
    const callArgs = prisma.notification.updateMany.mock.calls[0]!.arguments[0] as any;
    assert.equal(callArgs.where.id, 'notif-1');
    assert.equal(callArgs.where.userId, 'user-1');
  });

  it('markAllAsRead updates all unread for user', async () => {
    const prisma = makePrismaMock() as any;
    prisma.notification.updateMany.mock.mockImplementation(async () => ({ count: 3 }));
    const audit = makeAuditMock();
    const events = makeEventsMock();
    const gateway = makeGatewayMock();
    const sms = makeSmsMock();
    const fcm = makeFcmMock();
    const svc = new NotificationsService(
      prisma as unknown as PrismaService,
      audit as unknown as AuditLogService,
      events as unknown as DomainEventsService,
      gateway as unknown as NotificationsGateway,
      sms as unknown as SmsService,
      fcm as unknown as FcmService,
      makeDeviceTokensMock() as unknown as DeviceTokensService,
    );
    const result = await svc.markAllAsRead('user-1');
    assert.equal(result.success, true);
    const callArgs = prisma.notification.updateMany.mock.calls[0]!.arguments[0] as any;
    assert.equal(callArgs.where.userId, 'user-1');
    assert.equal(callArgs.where.readAt, null);
  });

  it('getUnreadCount returns count of unread notifications', async () => {
    const prisma = makePrismaMock() as any;
    prisma.notification.count.mock.mockImplementation(async () => 5);
    const audit = makeAuditMock();
    const events = makeEventsMock();
    const gateway = makeGatewayMock();
    const sms = makeSmsMock();
    const fcm = makeFcmMock();
    const svc = new NotificationsService(
      prisma as unknown as PrismaService,
      audit as unknown as AuditLogService,
      events as unknown as DomainEventsService,
      gateway as unknown as NotificationsGateway,
      sms as unknown as SmsService,
      fcm as unknown as FcmService,
      makeDeviceTokensMock() as unknown as DeviceTokensService,
    );
    const result = await svc.getUnreadCount('user-1');
    assert.equal(result.count, 5);
  });
});

describe('NotificationsService — createTemplate / getTemplate', () => {
  it('createTemplate creates a new notification template', async () => {
    const prisma = makePrismaMock() as any;
    prisma.notificationTemplate.create.mock.mockImplementation(async (args: any) => ({
      id: 'tmpl-1',
      ...args.data,
    }));
    const audit = makeAuditMock();
    const events = makeEventsMock();
    const gateway = makeGatewayMock();
    const sms = makeSmsMock();
    const fcm = makeFcmMock();
    const svc = new NotificationsService(
      prisma as unknown as PrismaService,
      audit as unknown as AuditLogService,
      events as unknown as DomainEventsService,
      gateway as unknown as NotificationsGateway,
      sms as unknown as SmsService,
      fcm as unknown as FcmService,
      makeDeviceTokensMock() as unknown as DeviceTokensService,
    );
    const result = await svc.createTemplate({
      key: 'custom_alert',
      name: 'Custom Alert',
      channels: [NotificationChannel.SMS],
      body: 'Alert: {{message}}',
      variables: ['message'],
    });
    assert.equal(result.key, 'custom_alert');
  });

  it('getTemplate returns template by key', async () => {
    const prisma = makePrismaMock() as any;
    prisma.notificationTemplate.findUnique.mock.mockImplementation(async () => ({
      key: 'prescription_reminder',
      name: 'Prescription Reminder',
      body: 'Hello {{patientName}}',
    }));
    const audit = makeAuditMock();
    const events = makeEventsMock();
    const gateway = makeGatewayMock();
    const sms = makeSmsMock();
    const fcm = makeFcmMock();
    const svc = new NotificationsService(
      prisma as unknown as PrismaService,
      audit as unknown as AuditLogService,
      events as unknown as DomainEventsService,
      gateway as unknown as NotificationsGateway,
      sms as unknown as SmsService,
      fcm as unknown as FcmService,
      makeDeviceTokensMock() as unknown as DeviceTokensService,
    );
    const result = await svc.getTemplate('prescription_reminder');
    assert.equal(result?.key, 'prescription_reminder');
  });
});
