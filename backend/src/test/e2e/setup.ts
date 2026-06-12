/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/test/e2e/setup.ts
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
 * setup — WyshID module
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
 - supertest
 - testing
 - node:crypto
 - jwt
 - common
 - throttler
 *
 * Dependencies:
 - supertest
 - testing
 - node:crypto
 - jwt
 - common
 - throttler
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

import { ThrottlerStorage } from '@nestjs/throttler';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import supertest from 'supertest';
import type { Role } from '@prisma/client';
import { randomUUID } from 'node:crypto';

import { AppModule } from '../../app.module';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { RedisService } from '../../providers/redis/redis.service';
import { StorageService } from '../../providers/storage/storage.service';
import { GeminiService } from '../../providers/gemini/gemini.service';
import { LivekitService } from '../../providers/livekit/livekit.service';
import { RazorpayService } from '../../providers/razorpay/razorpay.service';
import { AI_PROVIDER_TOKEN } from '../../providers/ai/ai-provider.module';
import { JwtService } from '@nestjs/jwt';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';
import { ApiEnvelopeInterceptor } from '../../common/interceptors/api-envelope.interceptor';
import { requestIdMiddleware } from '../../common/middleware/request-id.middleware';

let app: INestApplication;
let prisma: PrismaService;
let jwt: JwtService;
let request: supertest.Agent;

export async function bootstrapE2e() {
  process.env.NODE_ENV = 'test';

  const module = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(AI_PROVIDER_TOKEN)
    .useValue({
      chat: async () => 'Mock AI response',
      generateContent: async () => 'Mock content',
      streamChat: async () => (async function*() {})(),
      analyze: async () => ({ risk: 'low', score: 0.1 }),
      summarizeHealthcareText: async () => JSON.stringify({ subjective: 'Mock', objective: 'Mock', assessment: 'Mock', plan: 'Mock' }),
    })
    .overrideProvider(ThrottlerStorage)
    .useValue({
      increment: async () => ({ totalHits: 0, timeToExpire: 60000, isBlocked: false, timeToBlockExpire: 0 }),
    })
    .overrideProvider(RedisService)
    .useValue({
      getClient: () => ({
        duplicate: () => ({
          connect: async () => {},
          quit: async () => {},
          ping: async () => 'PONG',
          publish: async () => 1,
          subscribe: async () => {},
          on: () => {},
          off: () => {},
        }),
        connect: async () => {},
        quit: async () => {},
        ping: async () => 'PONG',
        publish: async () => 1,
        subscribe: async () => {},
        on: () => {},
        off: () => {},
      }),
      get: async () => null,
      set: async () => 'OK',
      del: async () => 1,
      keys: async () => [],
      mget: async () => [],
      ping: async () => 'PONG',
      on: () => {},
      quit: async () => {},
    })
    .overrideProvider(GeminiService)
    .useValue({
      summarizeHealthcareText: async () => JSON.stringify({
        subjective: 'Mock subjective',
        objective: 'Mock objective',
        assessment: 'Mock assessment',
        plan: 'Mock plan',
      }),
      chat: async () => 'Mock AI response',
      generateContent: async () => 'Mock content',
    })
    .overrideProvider(LivekitService)
    .useValue({
      createParticipantToken: () => 'mock-livekit-token',
      createRoom: async () => ({ name: 'mock-room' }),
      deleteRoom: async () => {},
    })
    .overrideProvider(StorageService)
    .useValue({
      buildObjectKey: () => 'mock-key',
      saveObject: async () => {},
      loadObject: async () => Buffer.from('mock'),
      deleteObject: async () => {},
      getDownloadUrl: async () => 'https://mock-storage.example.com/file',
      assertValidDownload: () => {},
      scanObject: async () => {},
    })
    .overrideProvider(RazorpayService)
    .useValue({
      createPaymentOrder: async () => ({ id: 'order_mock', amount: 100, currency: 'INR' }),
      verifyPayment: async () => true,
      refundPayment: async () => ({ id: 'rfnd_mock' }),
    })
    .compile();

  app = module.createNestApplication();
  app.use(requestIdMiddleware);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidUnknownValues: true }));
  app.useGlobalInterceptors(new ApiEnvelopeInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.init();

  const server = app.getHttpServer();
  request = supertest.agent(server);
  prisma = app.get(PrismaService);
  jwt = app.get(JwtService);

  return { app, request, prisma, jwt };
}

export function getApp() { return app; }
export function getPrisma() { return prisma; }
export function getJwt() { return jwt; }
export function getRequest() { return request; }

export async function teardownE2e() {
  if (app) await app.close();
}

export async function cleanDatabase() {
  const tables = [
    'PharmacyCartItem', 'PharmacyInventory', 'PharmacyOrder', 'PharmacyPartner',
    'ConsultationSOAP', 'ConsultationTranscript', 'ConsultationRecording',
    'ConsultationSession', 'Appointment', 'Notification', 'NotificationPreference',
    'NotificationTemplate', 'TimelineEvent', 'HealthRecord', 'Prescription',
    'Medication', 'CarePlan', 'CarePlanLog', 'CarePlanMilestone',
    'DiagnosticReport', 'DiagnosticOrder', 'DiagnosticsPartner',
    'PaymentOrder', 'ShareLink', 'EmergencyAccess', 'ConsentGrant',
    'UserRole', 'StaffAssignment', 'AIMemoryEdge', 'AIMemoryNode',
    'DeviceSession', 'RefreshToken', 'OtpChallenge',
    'FamilyRelation', 'ABDMLinkage', 'MedicationAdherenceLog', 'MedicationReminder',
    'AdherenceLog', 'MedicationSchedule', 'PrescriptionItem', 'PrescriptionVerification',
    'DrugInteraction', 'Drug',
    'BillingItem', 'BillingInvoice', 'QueueEntry',
    'Settlement', 'ClaimDocument', 'ClaimLineItem', 'Claim',
    'PreAuthorization', 'EligibilityCheck', 'CoverageRule',
    'InsurancePolicy', 'InsurancePlan', 'InsuranceProvider',
    'EmergencyLocation', 'EmergencyContact', 'EmergencyProfile',
    'EmergencyAccess', 'HealthAnalytics', 'HealthScore',
    'HealthGraphEdge', 'HealthGraphNode',
    'AIRecommendation', 'NotificationDelivery', 'PreventiveRecommendation',
    'AuditLog', 'DoctorProfile', 'DoctorClinic', 'Clinic', 'ProviderProfile',
    'ConsultationSummary', 'AIJob', 'User',
  ];
  for (const table of tables) {
    try { await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`); } catch { /* may not exist */ }
  }
}

export async function createTestUser(overrides: {
  id?: string;
  phoneNumber?: string;
  fullName?: string;
  role?: string;
  doctorProfile?: boolean;
} = {}) {
  const id = overrides.id ?? `user-${randomUUID().slice(0, 8)}`;
  const basePhone = overrides.phoneNumber ?? `+919999990${String(Math.floor(Math.random() * 900) + 100)}`;

  const user = await prisma.user.create({
    data: {
      id,
      wyshId: `WYSH-TEST-${id.slice(0, 8)}`,
      phoneNumber: basePhone,
      fullName: overrides.fullName ?? 'Test User',
      isPhoneVerified: true,
      status: 'VERIFIED',
      chronicConditions: [],
      allergiesSummary: [],
    },
  });

  const role = overrides.role ?? 'PATIENT';
  await prisma.userRole.create({
    data: { userId: user.id, role: role as Role },
  });

  let doctorProfileId: string | undefined;
  if (overrides.doctorProfile === true || (overrides.doctorProfile !== false && overrides.role === 'DOCTOR')) {
    const dp = await prisma.doctorProfile.create({
      data: {
        userId: user.id,
        specialization: 'General Medicine',
        qualifications: ['MBBS'],
        yearsOfExperience: 5,
        registrationNumber: `REG-TEST-${randomUUID().slice(0, 8)}`,
        consultationFee: 500,
        approvalStatus: 'VERIFIED',
      },
    });
    doctorProfileId = dp.id;
  }

  return { user, doctorProfileId };
}

export async function createTestAppointment(patientUserId: string, doctorProfileId: string, doctorUserId?: string, overrides: Record<string, unknown> = {}) {
  return prisma.appointment.create({
    data: {
      patientUserId,
      doctorProfileId,
      doctorUserId: doctorUserId ?? patientUserId,
      status: 'CONFIRMED',
      consultationMode: 'VIDEO',
      reason: 'Test consultation',
      slotStartAt: new Date(Date.now() + 3600_000),
      slotEndAt: new Date(Date.now() + 3900_000),
      ...overrides,
    },
  });
}

export function makeAuthToken(userId: string, roles: string[] = ['PATIENT'], phoneNumber = '+919999990001') {
  return jwt.sign({
    sub: userId,
    phoneNumber,
    roles,
  });
}

export function authHeader(userId: string, roles: string[] = ['PATIENT']) {
  return { Authorization: `Bearer ${makeAuthToken(userId, roles)}` };
}

export const API_PREFIX = '/api/v1';
