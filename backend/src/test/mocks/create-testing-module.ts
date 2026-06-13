import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ThrottlerStorage } from '@nestjs/throttler';

import { PrismaService } from '../../providers/prisma/prisma.service';
import { RedisService } from '../../providers/redis/redis.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import { StorageService } from '../../providers/storage/storage.service';
import { EncryptionService } from '../../common/encryption/encryption.service';
import { SmsService } from '../../modules/auth/sms.service';
import { MfaService } from '../../modules/auth/mfa.service';
import { WyshIdService } from '../../common/services/wysh-id.service';
import { DomainEventsService } from '../../providers/events/events.service';
import { FcmService } from '../../modules/notifications/providers/fcm.service';
import { DeviceTokensService } from '../../modules/device-tokens/device-tokens.service';
import { GeminiService } from '../../providers/gemini/gemini.service';
import { LivekitService } from '../../providers/livekit/livekit.service';
import { RazorpayService } from '../../providers/razorpay/razorpay.service';
import { SupabaseService } from '../../providers/supabase/supabase.service';
import { NotificationsGateway } from '../../modules/notifications/notifications.gateway';

import {
  makePrismaMock,
  makeRedisMock,
  makeAuditMock,
  makeJwtMock,
  makeSmsMock,
  makeFcmMock,
  makeEventsMock,
  makeGatewayMock,
  makeStorageMock,
  makeEncryptionMock,
  makeWyshIdMock,
  makeMfaMock,
  makeSupabaseMock,
  makeDeviceTokensMock,
  makeConfigMock,
  makeThrottlerMock,
  makeLivekitMock,
  makeRazorpayMock,
} from './index';

export interface MockProviders {
  prisma?: ReturnType<typeof makePrismaMock>;
  redis?: ReturnType<typeof makeRedisMock>;
  audit?: ReturnType<typeof makeAuditMock>;
  jwt?: ReturnType<typeof makeJwtMock>;
  sms?: ReturnType<typeof makeSmsMock>;
  fcm?: ReturnType<typeof makeFcmMock>;
  events?: ReturnType<typeof makeEventsMock>;
  gateway?: ReturnType<typeof makeGatewayMock>;
  storage?: ReturnType<typeof makeStorageMock>;
  encryption?: ReturnType<typeof makeEncryptionMock>;
  wyshId?: ReturnType<typeof makeWyshIdMock>;
  mfa?: ReturnType<typeof makeMfaMock>;
  supabase?: ReturnType<typeof makeSupabaseMock>;
  deviceTokens?: ReturnType<typeof makeDeviceTokensMock>;
  config?: ReturnType<typeof makeConfigMock>;
  throttler?: ReturnType<typeof makeThrottlerMock>;
  livekit?: ReturnType<typeof makeLivekitMock>;
  razorpay?: ReturnType<typeof makeRazorpayMock>;
  [key: string]: any;
}

const defaultProviders = [
  { provide: Reflector, useValue: { getAllAndOverride: () => undefined } },
  { provide: ConfigService, useValue: makeConfigMock() },
  { provide: PrismaService, useValue: makePrismaMock() },
  { provide: RedisService, useValue: makeRedisMock() },
  { provide: AuditLogService, useValue: makeAuditMock() },
  { provide: JwtService, useValue: makeJwtMock() },
  { provide: SmsService, useValue: makeSmsMock() },
  { provide: MfaService, useValue: makeMfaMock() },
  { provide: WyshIdService, useValue: makeWyshIdMock() },
  { provide: DomainEventsService, useValue: makeEventsMock() },
  { provide: FcmService, useValue: makeFcmMock() },
  { provide: DeviceTokensService, useValue: makeDeviceTokensMock() },
  { provide: StorageService, useValue: makeStorageMock() },
  { provide: EncryptionService, useValue: makeEncryptionMock() },
  { provide: SupabaseService, useValue: makeSupabaseMock() },
  { provide: NotificationsGateway, useValue: makeGatewayMock() },
  { provide: GeminiService, useValue: makeAiMock() as any },
  { provide: LivekitService, useValue: makeLivekitMock() },
  { provide: RazorpayService, useValue: makeRazorpayMock() },
  { provide: ThrottlerStorage, useValue: makeThrottlerMock() },
];

export function makeAiMock() {
  return {
    summarizeHealthcareText: async () => JSON.stringify({
      subjective: 'Mock subjective',
      objective: 'Mock objective',
      assessment: 'Mock assessment',
      plan: 'Mock plan',
    }),
    chat: async () => 'Mock AI response',
    generateContent: async () => 'Mock content',
  };
}

export function createTestingModule(metadata: {
  imports?: any[];
  controllers?: any[];
  providers?: any[];
  exports?: any[];
}): TestingModuleBuilder {
  const builder = Test.createTestingModule({
    imports: metadata.imports ?? [],
    controllers: metadata.controllers ?? [],
    providers: [
      ...defaultProviders,
      ...(metadata.providers ?? []),
    ],
    exports: metadata.exports ?? [],
  });

  return builder;
}

export function getMockOverrides(mocks: MockProviders) {
  const overrides: { provide: any; useValue: any }[] = [];

  if (mocks.prisma) overrides.push({ provide: PrismaService, useValue: mocks.prisma });
  if (mocks.redis) overrides.push({ provide: RedisService, useValue: mocks.redis });
  if (mocks.audit) overrides.push({ provide: AuditLogService, useValue: mocks.audit });
  if (mocks.jwt) overrides.push({ provide: JwtService, useValue: mocks.jwt });
  if (mocks.sms) overrides.push({ provide: SmsService, useValue: mocks.sms });
  if (mocks.fcm) overrides.push({ provide: FcmService, useValue: mocks.fcm });
  if (mocks.events) overrides.push({ provide: DomainEventsService, useValue: mocks.events });
  if (mocks.gateway) overrides.push({ provide: NotificationsGateway, useValue: mocks.gateway });
  if (mocks.storage) overrides.push({ provide: StorageService, useValue: mocks.storage });
  if (mocks.encryption) overrides.push({ provide: EncryptionService, useValue: mocks.encryption });
  if (mocks.wyshId) overrides.push({ provide: WyshIdService, useValue: mocks.wyshId });
  if (mocks.mfa) overrides.push({ provide: MfaService, useValue: mocks.mfa });
  if (mocks.supabase) overrides.push({ provide: SupabaseService, useValue: mocks.supabase });
  if (mocks.deviceTokens) overrides.push({ provide: DeviceTokensService, useValue: mocks.deviceTokens });
  if (mocks.config) overrides.push({ provide: ConfigService, useValue: mocks.config });
  if (mocks.throttler) overrides.push({ provide: ThrottlerStorage, useValue: mocks.throttler });
  if (mocks.livekit) overrides.push({ provide: LivekitService, useValue: mocks.livekit });
  if (mocks.razorpay) overrides.push({ provide: RazorpayService, useValue: mocks.razorpay });

  for (const [key, value] of Object.entries(mocks)) {
    if (!['prisma', 'redis', 'audit', 'jwt', 'sms', 'fcm', 'events', 'gateway',
          'storage', 'encryption', 'wyshId', 'mfa', 'supabase', 'deviceTokens',
          'config', 'throttler', 'livekit', 'razorpay'].includes(key)) {
      overrides.push({ provide: key, useValue: value });
    }
  }

  return overrides;
}
