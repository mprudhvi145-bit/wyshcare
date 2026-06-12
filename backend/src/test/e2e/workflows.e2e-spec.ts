/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/test/e2e/workflows.e2e-spec.ts
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
 * workflows.e2e-spec — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - backend/src/modules/prescription/prescription.service.ts
 - backend/src/providers/storage/storage.module.ts
 - backend/tests/rbac.access-matrix.test.mjs
 - backend/src/modules/abdm/abdm.module.ts
 - backend/src/modules/digital-twin/digital-twin.service.ts
 - backend/src/modules/prescription/interaction-engine.service.ts
 - backend/src/modules/interoperability/interoperability.module.ts
 - backend/src/main.ts
 *
 * Calls:
 - supertest
 - jwt
 - client
 - core
 - testing
 - node:test
 - strict
 - node:crypto
 *
 * Dependencies:
 - supertest
 - jwt
 - client
 - core
 - testing
 - node:test
 - strict
 - node:crypto
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

import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Test } from '@nestjs/testing';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Module } from '@nestjs/common';
import supertest from 'supertest';
import { Role } from '@prisma/client';

import { PrismaModule } from '../../providers/prisma/prisma.module';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { EventsModule } from '../../providers/events/events.module';
import { RedisService } from '../../providers/redis/redis.service';
import { AI_PROVIDER_TOKEN } from '../../providers/ai/ai-provider.module';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuditLogService } from '../../common/services/audit-log.service';
import { ApiEnvelopeInterceptor } from '../../common/interceptors/api-envelope.interceptor';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';
import { requestIdMiddleware } from '../../common/middleware/request-id.middleware';

import { HealthScoreController } from '../../modules/health-score/health-score.controller';
import { HealthScoreService } from '../../modules/health-score/health-score.service';
import { EmergencyController } from '../../modules/emergency/emergency.controller';
import { EmergencyService } from '../../modules/emergency/emergency.service';
import { AnalyticsController } from '../../modules/analytics/analytics.controller';
import { AnalyticsService } from '../../modules/analytics/analytics.service';
import { DomainEventsService } from '../../providers/events/events.service';

let sharedApp: INestApplication;

const mockJwtGuard = {
  canActivate: async (ctx: any) => {
    const req = ctx.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    if (!token) return false;
    try {
      const jwtService = sharedApp.get(JwtService);
      const payload = await jwtService.verifyAsync(token);
      req.user = { userId: payload.sub, phoneNumber: payload.phoneNumber, roles: payload.roles };
      return true;
    } catch { return false; }
  },
};

const mockRolesGuard = {
  canActivate: (ctx: any) => {
    const req = ctx.switchToHttp().getRequest();
    const requiredRoles: string[] | undefined = Reflect.getMetadata('roles', ctx.getClass());
    if (!requiredRoles?.length) return true;
    return requiredRoles.some((role: string) => req.user?.roles?.includes(role));
  },
};

const mockReflector = {
  get: (key: string, target: any) => Reflect.getMetadata(key, target),
  getAllAndOverride: (key: string | symbol, targets: any[]) => {
    for (const target of targets) {
      const result = Reflect.getMetadata(key, target);
      if (result !== undefined) return result;
    }
    return undefined;
  },
};

// tsx (esbuild) doesn't emit design:paramtypes metadata needed by NestJS DI.
// Manually define it so controllers, services, and guards can resolve dependencies.
Reflect.defineMetadata('design:paramtypes', [HealthScoreService], HealthScoreController);
Reflect.defineMetadata('design:paramtypes', [EmergencyService], EmergencyController);
Reflect.defineMetadata('design:paramtypes', [AnalyticsService], AnalyticsController);
Reflect.defineMetadata('design:paramtypes', [PrismaService, AuditLogService, DomainEventsService], HealthScoreService);
Reflect.defineMetadata('design:paramtypes', [PrismaService, AuditLogService, DomainEventsService], EmergencyService);
Reflect.defineMetadata('design:paramtypes', [PrismaService, AuditLogService, DomainEventsService], AnalyticsService);
Reflect.defineMetadata('design:paramtypes', [Reflector, JwtService, PrismaService], JwtAuthGuard);
Reflect.defineMetadata('design:paramtypes', [Reflector], RolesGuard);
Reflect.defineMetadata('design:paramtypes', [PrismaService], AuditLogService);

@Module({
  imports: [PrismaModule, EventsModule, JwtModule.register({ secret: 'test-secret', signOptions: { expiresIn: '1h' } })],
  controllers: [HealthScoreController],
  providers: [
    HealthScoreService,
    AuditLogService,
    JwtAuthGuard,
    RolesGuard,
    { provide: Reflector, useValue: mockReflector },
  ],
})
class HealthScoreTestModule {}

@Module({
  imports: [PrismaModule, EventsModule, JwtModule.register({ secret: 'test-secret', signOptions: { expiresIn: '1h' } })],
  controllers: [EmergencyController],
  providers: [
    EmergencyService,
    AuditLogService,
    JwtAuthGuard,
    RolesGuard,
    { provide: Reflector, useValue: mockReflector },
  ],
})
class EmergencyTestModule {}

@Module({
  imports: [PrismaModule, EventsModule, JwtModule.register({ secret: 'test-secret', signOptions: { expiresIn: '1h' } })],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    AuditLogService,
    JwtAuthGuard,
    RolesGuard,
    { provide: Reflector, useValue: mockReflector },
  ],
})
class AnalyticsTestModule {}

async function buildMinimalApp(testModule: any, _extraOverrides: any = {}) {
  const builder = Test.createTestingModule({
    imports: [
      PrismaModule,
      EventsModule,
      JwtModule.register({ secret: 'test-secret', signOptions: { expiresIn: '1h' } }),
      testModule,
    ],
  })
    .overrideProvider(RedisService)
    .useValue({
      get: async () => null, set: async () => 'OK', del: async () => 1,
      ping: async () => 'PONG', on: () => {}, quit: async () => {},
    })
    .overrideProvider(AI_PROVIDER_TOKEN)
    .useValue({
      chat: async () => 'Mock AI response',
      generateContent: async () => 'Mock content',
      analyze: async () => ({ risk: 'low', score: 0.1 }),
    })

  const testingModule = await builder.compile();

  const nestApp = testingModule.createNestApplication();
  nestApp.use(requestIdMiddleware);
  nestApp.setGlobalPrefix('api/v1');
  nestApp.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidUnknownValues: true }));
  nestApp.useGlobalInterceptors(new ApiEnvelopeInterceptor());
  nestApp.useGlobalFilters(new HttpExceptionFilter());
  await nestApp.init();

  sharedApp = nestApp;
  return {
    app: nestApp,
    request: supertest.agent(nestApp.getHttpServer()),
    prisma: nestApp.get(PrismaService),
    jwt: nestApp.get(JwtService),
  };
}

const tables = [
  'EmergencyLocation', 'EmergencyContact', 'EmergencyProfile',
  'EmergencyAccess', 'HealthAnalytics', 'HealthScore',
  'HealthGraphEdge', 'HealthGraphNode',
  'AIRecommendation', 'NotificationDelivery', 'PreventiveRecommendation',
  'TimelineEvent', 'AuditLog', 'UserRole', 'User',
];

async function cleanDatabase(prisma: PrismaService) {
  for (const table of tables) {
    try { await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`); } catch { /* ok */ }
  }
}

async function createTestUser(prisma: PrismaService, role: string = 'PATIENT') {
  const id = `user-${randomUUID().slice(0, 8)}`;
  const user = await prisma.user.create({
    data: {
      id,
      wyshId: `WYSH-TEST-${id.slice(0, 8)}`,
      phoneNumber: `+919999990${String(Math.floor(Math.random() * 900) + 100)}`,
      fullName: 'Test User',
      isPhoneVerified: true,
      status: 'VERIFIED',
      chronicConditions: [],
      allergiesSummary: [],
    },
  });
  await prisma.userRole.create({ data: { userId: user.id, role: role as Role } });
  return user;
}

function authHeader(jwt: JwtService, userId: string, roles: string[] = ['PATIENT']) {
  const token = jwt.sign({ sub: userId, phoneNumber: '+919999990001', roles });
  return { Authorization: `Bearer ${token}` };
}

const API_PREFIX = '/api/v1';

// ── Health Score Workflow ──────────────────────────────────────────
describe('Health Score Workflow', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let request: supertest.Agent;

  before(async () => {
    ({ app, request, prisma, jwt: jwtService } = await buildMinimalApp(HealthScoreTestModule));
  });
  after(async () => { if (app) await app.close(); });
  beforeEach(async () => { await cleanDatabase(prisma); });

  it('POST /health-score/calculate — computes initial score', async () => {
    const user = await createTestUser(prisma);
    const res = await request.post(`${API_PREFIX}/health-score/calculate`)
      .set(authHeader(jwtService, user.id, ['PATIENT']))
      .send({}).expect(201);
    const data = res.body.data ?? res.body;
    assert.ok(data);
    assert.ok(typeof data.overallScore === 'number');
    assert.ok(data.overallScore >= 0 && data.overallScore <= 100);
  });

  it('GET /health-score/current — returns latest score', async () => {
    const user = await createTestUser(prisma);
    await request.post(`${API_PREFIX}/health-score/calculate`)
      .set(authHeader(jwtService, user.id, ['PATIENT'])).send({}).expect(201);
    const res = await request.get(`${API_PREFIX}/health-score/current`)
      .set(authHeader(jwtService, user.id, ['PATIENT'])).expect(200);
    const data = res.body.data ?? res.body;
    assert.ok(data);
    assert.ok(typeof data.overallScore === 'number' || typeof data.score === 'number');
  });

  it('GET /health-score/history — returns score history', async () => {
     const user = await createTestUser(prisma);
     await request.post(`${API_PREFIX}/health-score/calculate`)
       .set(authHeader(jwtService, user.id, ['PATIENT'])).send({}).expect(201);
     const res = await request.get(`${API_PREFIX}/health-score/history`)
       .set(authHeader(jwtService, user.id, ['PATIENT'])).query({ days: '30' }).expect(200);
    const data = res.body.data ?? res.body;
    assert.ok(Array.isArray(data) || Array.isArray(data.history ?? data.scores));
  });

  it('GET /health-score/breakdown — returns score components', async () => {
     const user = await createTestUser(prisma);
     await request.post(`${API_PREFIX}/health-score/calculate`)
       .set(authHeader(jwtService, user.id, ['PATIENT'])).send({}).expect(201);
     const res = await request.get(`${API_PREFIX}/health-score/breakdown`)
       .set(authHeader(jwtService, user.id, ['PATIENT'])).expect(200);
    assert.ok(res.body.data ?? res.body);
  });

  it('POST /health-score/calculate — rejects non-PATIENT role', async () => {
     const user = await createTestUser(prisma, 'DOCTOR');
     await request.post(`${API_PREFIX}/health-score/calculate`)
       .set(authHeader(jwtService, user.id, ['DOCTOR'])).send({}).expect(403);
  });
});

// ── Emergency Workflow ─────────────────────────────────────────────
describe('Emergency Workflow', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let request: supertest.Agent;

  before(async () => {
    ({ app, request, prisma, jwt: jwtService } = await buildMinimalApp(EmergencyTestModule));
  });
  after(async () => { if (app) await app.close(); });
  beforeEach(async () => { await cleanDatabase(prisma); });

   it('GET /emergency/profile — creates profile on first access', async () => {
     const user = await createTestUser(prisma);
     const res = await request.get(`${API_PREFIX}/emergency/profile`)
       .set(authHeader(jwtService, user.id, ['PATIENT'])).expect(200);
     const data = res.body.data ?? res.body;
     assert.ok(data);
     assert.equal(data.userId, user.id);
   });

    it('PUT /emergency/profile — updates emergency profile', async () => {
      const user = await createTestUser(prisma);
      await request.get(`${API_PREFIX}/emergency/profile`)
        .set(authHeader(jwtService, user.id, ['PATIENT']));
      const res = await request.put(`${API_PREFIX}/emergency/profile`)
        .set(authHeader(jwtService, user.id, ['PATIENT']))
        .send({ bloodGroup: 'O+', organDonor: true }).expect(200);
      const data = res.body.data ?? res.body;
      assert.equal(data.bloodGroup, 'O+');
    });

    it('POST /emergency/contacts — adds emergency contact', async () => {
      const user = await createTestUser(prisma);
      await request.get(`${API_PREFIX}/emergency/profile`)
        .set(authHeader(jwtService, user.id, ['PATIENT']));
      const res = await request.post(`${API_PREFIX}/emergency/contacts`)
        .set(authHeader(jwtService, user.id, ['PATIENT']))
        .send({ name: 'Jane Doe', relationship: 'SPOUSE', phone: '+919999990099' })
        .expect(201);
      const data = res.body.data ?? res.body;
      assert.equal(data.name, 'Jane Doe');
    });

    it('POST /emergency/activate — activates emergency mode', async () => {
      const user = await createTestUser(prisma);
      await request.get(`${API_PREFIX}/emergency/profile`)
        .set(authHeader(jwtService, user.id, ['PATIENT']));
      await request.post(`${API_PREFIX}/emergency/activate`)
        .set(authHeader(jwtService, user.id, ['PATIENT'])).expect(200);
      const profile = await prisma.emergencyProfile.findUnique({ where: { userId: user.id } });
      assert.ok(profile);
      assert.equal(profile!.emergencyMode, true);
      assert.ok(profile!.modeExpiresAt);
      assert.ok(new Date(profile!.modeExpiresAt) > new Date());
    });

    it('POST /emergency/location — shares location', async () => {
      const user = await createTestUser(prisma);
      await request.get(`${API_PREFIX}/emergency/profile`)
        .set(authHeader(jwtService, user.id, ['PATIENT']));
      const res = await request.post(`${API_PREFIX}/emergency/location`)
        .set(authHeader(jwtService, user.id, ['PATIENT']))
        .send({ latitude: 12.9716, longitude: 77.5946 }).expect(201);
      const data = res.body.data ?? res.body;
      assert.equal(Number(data.latitude), 12.9716);
      assert.equal(Number(data.longitude), 77.5946);
    });

  it('POST /emergency/deactivate — deactivates emergency mode', async () => {
    const user = await createTestUser(prisma);
    await request.get(`${API_PREFIX}/emergency/profile`)
      .set(authHeader(jwtService, user.id, ['PATIENT']));
    await request.post(`${API_PREFIX}/emergency/activate`)
      .set(authHeader(jwtService, user.id, ['PATIENT'])).expect(200);
    await request.post(`${API_PREFIX}/emergency/deactivate`)
      .set(authHeader(jwtService, user.id, ['PATIENT'])).expect(200);
    const profile = await prisma.emergencyProfile.findUnique({ where: { userId: user.id } });
    assert.equal(profile!.emergencyMode, false);
  });

  it('GET /emergency/qr — returns emergency QR', async () => {
    const user = await createTestUser(prisma);
    await request.get(`${API_PREFIX}/emergency/profile`)
      .set(authHeader(jwtService, user.id, ['PATIENT']));
    const res = await request.get(`${API_PREFIX}/emergency/qr`)
      .set(authHeader(jwtService, user.id, ['PATIENT'])).expect(200);
    const data = res.body.data ?? res.body;
    assert.ok(data.token || data.qrDataUrl);
  });

  it('DELETE /emergency/contacts/:id — removes contact', async () => {
    const user = await createTestUser(prisma);
    await request.get(`${API_PREFIX}/emergency/profile`)
      .set(authHeader(jwtService, user.id, ['PATIENT']));
    const add = await request.post(`${API_PREFIX}/emergency/contacts`)
      .set(authHeader(jwtService, user.id, ['PATIENT']))
      .send({ name: 'John', relationship: 'BROTHER', phone: '+919999990088' })
      .expect(201);
    const contactId = (add.body.data ?? add.body).id;
    await request.delete(`${API_PREFIX}/emergency/contacts/${contactId}`)
      .set(authHeader(jwtService, user.id, ['PATIENT'])).expect(204);
    const contacts = await request.get(`${API_PREFIX}/emergency/contacts`)
      .set(authHeader(jwtService, user.id, ['PATIENT'])).expect(200);
    const data = contacts.body.data ?? contacts.body;
    assert.ok(!data.some((c: any) => c.id === contactId));
  });
});

// ── Analytics Workflow ─────────────────────────────────────────────
describe('Analytics Workflow', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let request: supertest.Agent;

  before(async () => {
    ({ app, request, prisma, jwt: jwtService } = await buildMinimalApp(AnalyticsTestModule));
  });
  after(async () => { if (app) await app.close(); });
  beforeEach(async () => { await cleanDatabase(prisma); });

  it('GET /analytics/:userId/summary — returns dashboard summary', async () => {
    const user = await createTestUser(prisma);
    const res = await request.get(`${API_PREFIX}/analytics/${user.id}/summary`)
      .set(authHeader(jwtService, user.id, ['PATIENT'])).expect(200);
    const data = res.body.data ?? res.body;
    assert.ok('appointments' in data);
    assert.ok('healthScore' in data);
  });

  it('GET /analytics/:userId/appointments — returns appointment metrics', async () => {
    const user = await createTestUser(prisma);
    const res = await request.get(`${API_PREFIX}/analytics/${user.id}/appointments`)
      .set(authHeader(jwtService, user.id, ['PATIENT'])).expect(200);
    const data = res.body.data ?? res.body;
    assert.ok(typeof data.total === 'number');
    assert.ok(typeof data.completionRate === 'number');
  });

  it('GET /analytics/:userId/health-score-trend — returns score trend', async () => {
    const user = await createTestUser(prisma);
    const res = await request.get(`${API_PREFIX}/analytics/${user.id}/health-score-trend`)
      .set(authHeader(jwtService, user.id, ['PATIENT'])).expect(200);
    const data = res.body.data ?? res.body;
    assert.ok(['up', 'down', 'stable'].includes(data.trend));
  });

  it('GET /analytics/:userId/metrics — returns stored metrics', async () => {
    const user = await createTestUser(prisma);
    await prisma.healthAnalytics.create({
      data: {
        userId: user.id, metric: 'appointment_booked_total', value: 5,
        period: 'all_time', periodStart: new Date('2020-01-01'), periodEnd: new Date(),
        dimension: 'OVERALL',
      },
    });
    const res = await request.get(`${API_PREFIX}/analytics/${user.id}/metrics`)
      .set(authHeader(jwtService, user.id, ['PATIENT'])).expect(200);
    const data = res.body.data ?? res.body;
    assert.ok(Array.isArray(data));
    assert.ok(data.some((m: any) => m.metric === 'appointment_booked_total'));
  });
});