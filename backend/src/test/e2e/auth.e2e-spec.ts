/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/test/e2e/auth.e2e-spec.ts
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
 * auth.e2e-spec — Authentication module
 *
 * Responsibilities:
 * - Support authentication functionality
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
Authentication
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

import { bootstrapE2e, teardownE2e, cleanDatabase, createTestUser, getRequest, API_PREFIX } from './setup';

describe('Auth E2E', () => {
  let req: ReturnType<typeof getRequest>;

  before(async () => { await bootstrapE2e(); req = getRequest(); });
  after(async () => { await teardownE2e(); });
  beforeEach(async () => { await cleanDatabase(); });

  it('POST /auth/login — returns challengeIssued', async () => {
    const user = await createTestUser();

    const res = await req.post(`${API_PREFIX}/auth/login`)
      .send({ phoneNumber: user.user.phoneNumber })
      .expect(201);

    assert.ok(res.body.data?.challengeIssued === true);
  });

  it('POST /auth/register — returns challengeIssued', async () => {
    const res = await req.post(`${API_PREFIX}/auth/register`)
      .send({ phoneNumber: '+919999990099' })
      .expect(201);

    assert.ok(res.body.data?.challengeIssued === true);
  });

  it('POST /auth/otp/verify — returns access token with dev OTP', async () => {
    const user = await createTestUser();

    await req.post(`${API_PREFIX}/auth/login`)
      .send({ phoneNumber: user.user.phoneNumber })
      .expect(201);

    const res = await req.post(`${API_PREFIX}/auth/otp/verify`)
      .send({ phoneNumber: user.user.phoneNumber, otpCode: '123456', deviceName: 'E2E Test' })
      .expect(201);

    assert.ok(res.body.data?.accessToken);
    assert.ok(res.body.data?.user);
  });

  it('POST /auth/otp/verify — rejects wrong OTP', async () => {
    const user = await createTestUser();

    await req.post(`${API_PREFIX}/auth/login`)
      .send({ phoneNumber: user.user.phoneNumber })
      .expect(201);

    await req.post(`${API_PREFIX}/auth/otp/verify`)
      .send({ phoneNumber: user.user.phoneNumber, otpCode: '000000', deviceName: 'E2E Test' })
      .expect(401);
  });

  it('GET /auth/me — returns current user profile', async () => {
    const user = await createTestUser();

    await req.post(`${API_PREFIX}/auth/login`)
      .send({ phoneNumber: user.user.phoneNumber })
      .expect(201);

    const verifyRes = await req.post(`${API_PREFIX}/auth/otp/verify`)
      .send({ phoneNumber: user.user.phoneNumber, otpCode: '123456', deviceName: 'E2E Test' })
      .expect(201);

    const token = verifyRes.body.data?.accessToken;
    assert.ok(token);

    const res = await req.get(`${API_PREFIX}/auth/me`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    assert.ok(res.body.data?.id || res.body.data?.userId);
  });

  it('POST /auth/refresh — returns new tokens when valid refresh token exists', async () => {
    const user = await createTestUser();

    await req.post(`${API_PREFIX}/auth/login`)
      .send({ phoneNumber: user.user.phoneNumber })
      .expect(201);

    const verifyRes = await req.post(`${API_PREFIX}/auth/otp/verify`)
      .send({ phoneNumber: user.user.phoneNumber, otpCode: '123456', deviceName: 'E2E Test' })
      .expect(201);

    const refreshToken = verifyRes.body.data?.refreshToken;
    assert.ok(refreshToken);

    const res = await req.post(`${API_PREFIX}/auth/refresh`)
      .send({ refreshToken })
      .expect(201);

    assert.ok(res.body.data?.accessToken);
  });

  it('session lifecycle — login, verify, access me, logout', async () => {
    const user = await createTestUser();

    await req.post(`${API_PREFIX}/auth/login`)
      .send({ phoneNumber: user.user.phoneNumber })
      .expect(201);

    const verifyRes = await req.post(`${API_PREFIX}/auth/otp/verify`)
      .send({ phoneNumber: user.user.phoneNumber, otpCode: '123456', deviceName: 'E2E Test' })
      .expect(201);

    const token = verifyRes.body.data?.accessToken;
    assert.ok(token);

    const meRes = await req.get(`${API_PREFIX}/auth/me`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    assert.ok(meRes.body.data);

    await req.post(`${API_PREFIX}/auth/logout`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
  });

  it('rejects unauthenticated requests to protected endpoints', async () => {
    await req.get(`${API_PREFIX}/auth/me`).expect(401);
    await req.get(`${API_PREFIX}/health-graph`).expect(401);
    await req.get(`${API_PREFIX}/health-twin`).expect(401);
  });
});
