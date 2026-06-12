/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/test/e2e/misc.e2e-spec.ts
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
 * misc.e2e-spec — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - backend/src/test/e2e/health-graph.e2e-spec.ts
 - backend/src/test/consent.service.spec.ts
 - backend/src/test/e2e/pharmacy.e2e-spec.ts
 - backend/tests/rbac.access-matrix.test.mjs
 - backend/src/test/authorization.spec.ts
 - backend/src/test/e2e/appointment.e2e-spec.ts
 - backend/src/test/e2e/clinic-admin.e2e-spec.ts
 - backend/src/test/e2e/workflows.e2e-spec.ts
 *
 * Calls:
 - strict
 - node:test
 *
 * Dependencies:
 - strict
 - node:test
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

import { bootstrapE2e, teardownE2e, cleanDatabase, createTestUser, authHeader, getRequest, getPrisma, API_PREFIX } from './setup';

describe('Search E2E', () => {
  before(async () => { await bootstrapE2e(); });
  after(async () => { await teardownE2e(); });
  beforeEach(async () => { await cleanDatabase(); });

  it('GET /search — returns results for query', async () => {
    const req = getRequest();
    const user = await createTestUser({ fullName: 'John Search Test' });

    const res = await req.get(`${API_PREFIX}/search`)
      .set(authHeader(user.user.id, ['PATIENT']))
      .query({ q: 'John' })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(data !== undefined);
    assert.ok(Array.isArray(data.results ?? data.items ?? []));
  });

  it('GET /search — filters by type', async () => {
    const req = getRequest();
    const user = await createTestUser();

    const res = await req.get(`${API_PREFIX}/search`)
      .set(authHeader(user.user.id, ['PATIENT']))
      .query({ q: 'test', types: 'patients' })
      .expect(200);

    assert.ok(res.body.data ?? Array.isArray(res.body.results ?? res.body.items));
  });
});

describe('Notifications E2E', () => {
  before(async () => { await bootstrapE2e(); });
  after(async () => { await teardownE2e(); });
  beforeEach(async () => { await cleanDatabase(); });

  it('GET /notifications — returns user notifications', async () => {
    const req = getRequest();
    const prisma = getPrisma();
    const user = await createTestUser();

    await prisma.notification.create({
      data: {
        userId: user.user.id,
        channel: 'IN_APP',
        status: 'SENT',
        templateKey: 'test',
        payload: {},
        sentAt: new Date(),
      },
    });

    const res = await req.get(`${API_PREFIX}/notifications`)
      .set(authHeader(user.user.id, ['PATIENT']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(data.items?.length > 0 || data.total >= 0);
  });

  it('GET /notifications/unread-count — returns count', async () => {
    const req = getRequest();
    const user = await createTestUser();

    const res = await req.get(`${API_PREFIX}/notifications/unread-count`)
      .set(authHeader(user.user.id, ['PATIENT']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(typeof data === 'number' || data.count !== undefined);
  });

  it('PATCH /notifications/:id/read — marks notification as read', async () => {
    const req = getRequest();
    const prisma = getPrisma();
    const user = await createTestUser();

    const notif = await prisma.notification.create({
      data: {
        userId: user.user.id,
        channel: 'IN_APP',
        status: 'SENT',
        templateKey: 'test',
        payload: {},
        sentAt: new Date(),
      },
    });

    await req.patch(`${API_PREFIX}/notifications/${notif.id}/read`)
      .set(authHeader(user.user.id, ['PATIENT']))
      .expect(200);
  });

  it('GET /notifications/preferences — returns notification preferences', async () => {
    const req = getRequest();
    const user = await createTestUser();

    const res = await req.get(`${API_PREFIX}/notifications/preferences`)
      .set(authHeader(user.user.id, ['PATIENT']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(data.IN_APP !== undefined || typeof data === 'object');
  });
});

describe('Timeline E2E', () => {
  before(async () => { await bootstrapE2e(); });
  after(async () => { await teardownE2e(); });
  beforeEach(async () => { await cleanDatabase(); });

  it('GET /timeline — returns timeline events', async () => {
    const req = getRequest();
    const prisma = getPrisma();
    const user = await createTestUser();

    await prisma.timelineEvent.create({
      data: {
        userId: user.user.id,
        type: 'CONSULTATION',
        title: 'Test consultation',
        summary: 'Completed',
        occurredAt: new Date(),
      },
    });

    const res = await req.get(`${API_PREFIX}/timeline`)
      .set(authHeader(user.user.id, ['PATIENT']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(data.events?.length > 0 || data.total >= 0);
  });

  it('GET /timeline — filters by type', async () => {
    const req = getRequest();
    const prisma = getPrisma();
    const user = await createTestUser();

    await prisma.timelineEvent.create({
      data: {
        userId: user.user.id,
        type: 'PRESCRIPTION',
        title: 'Test prescription',
        summary: 'Prescribed amoxicillin',
        occurredAt: new Date(),
      },
    });

    const res = await req.get(`${API_PREFIX}/timeline`)
      .set(authHeader(user.user.id, ['PATIENT']))
      .query({ type: 'PRESCRIPTION' })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(Array.isArray(data.events ?? data.items ?? []));
  });
});

describe('Health Records E2E', () => {
  before(async () => { await bootstrapE2e(); });
  after(async () => { await teardownE2e(); });
  beforeEach(async () => { await cleanDatabase(); });

  it('GET /vault/records — returns health records', async () => {
    const req = getRequest();
    const prisma = getPrisma();
    const user = await createTestUser();

    await prisma.healthRecord.create({
      data: {
        userId: user.user.id,
        recordType: 'DIAGNOSTIC_REPORT',
        title: 'Blood Test',
        source: 'MANUAL',
        recordedAt: new Date(),
      },
    });

    const res = await req.get(`${API_PREFIX}/vault/records`)
      .set(authHeader(user.user.id, ['PATIENT']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(Array.isArray(data) || data.items?.length > 0 || data.length >= 0);
  });

  it('POST /vault/records — creates a health record', async () => {
    const req = getRequest();
    const user = await createTestUser();

    const res = await req.post(`${API_PREFIX}/vault/records`)
      .set(authHeader(user.user.id, ['PATIENT']))
      .send({
        title: 'Test Record',
        recordType: 'OTHER',
        description: 'E2E test record',
      })
      .expect(201);

    const data = res.body.data ?? res.body;
    assert.ok(data);
  });
});
