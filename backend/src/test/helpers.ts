/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/test/helpers.ts
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
 * helpers — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - backend/src/test/e2e/workflows.e2e-spec.ts
 - backend/src/test/auth.service.spec.ts
 - backend/src/test/e2e/clinic-admin.e2e-spec.ts
 - backend/src/test/e2e/clinic-queue.e2e-spec.ts
 - backend/src/test/e2e/prescription.e2e-spec.ts
 - backend/src/test/authorization.spec.ts
 - backend/src/test/e2e/health-graph.e2e-spec.ts
 - backend/src/test/e2e/pharmacy.e2e-spec.ts
 *
 * Calls:
 - node:test
 *
 * Dependencies:
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

/**
 * Shared test utilities for WyshCare backend unit tests.
 * Uses node:test + @nestjs/testing. No live DB, no external services.
 */
import { mock } from 'node:test';

// ---------------------------------------------------------------------------
// Prisma mock factory
// Returns a deeply-mocked PrismaService where every model method is a no-op
// mock function. Override individual methods per test.
// ---------------------------------------------------------------------------
export function makePrismaMock() {
  const fn = () => mock.fn<(...args: any[]) => any>();

  const model = () => ({
    findUnique: fn(),
    findUniqueOrThrow: fn(),
    findFirst: fn(),
    findFirstOrThrow: fn(),
    findMany: fn(),
    create: fn(),
    update: fn(),
    updateMany: fn(),
    delete: fn(),
    deleteMany: fn(),
    count: fn(),
    upsert: fn(),
  });

  return {
    user: model(),
    otpChallenge: model(),
    deviceSession: model(),
    refreshToken: model(),
    consentGrant: model(),
    shareLink: model(),
    healthRecord: model(),
    timelineEvent: model(),
    auditLog: model(),
    userRole: model(),
    prescription: model(),
  };
}

// ---------------------------------------------------------------------------
// Audit log mock — captures calls for assertion
// ---------------------------------------------------------------------------
export function makeAuditMock() {
  return { capture: mock.fn<(...args: any[]) => any>(async () => {}) };
}

// ---------------------------------------------------------------------------
// Minimal user fixture
// ---------------------------------------------------------------------------
export function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-a',
    wyshId: 'WYSH-00000001',
    phoneNumber: '+910000000001',
    fullName: 'Test User',
    preferredLanguage: 'en',
    isPhoneVerified: true,
    mfaEnabled: false,
    status: 'PENDING',
    chronicConditions: [],
    allergiesSummary: [],
    roles: [{ role: 'PATIENT' }],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Minimal OTP challenge fixture
// ---------------------------------------------------------------------------
export function makeChallenge(overrides: Record<string, unknown> = {}) {
  const { createHash } = require('node:crypto') as typeof import('node:crypto');
  return {
    id: 'challenge-1',
    phoneNumber: '+910000000001',
    otpHash: createHash('sha256').update('123456').digest('hex'),
    purpose: 'LOGIN',
    channel: 'SMS',
    attemptCount: 0,
    verifiedAt: null,
    expiresAt: new Date(Date.now() + 10 * 60_000),
    createdAt: new Date(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Minimal health record fixture
// ---------------------------------------------------------------------------
export function makeRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'record-1',
    userId: 'user-a',
    recordType: 'DIAGNOSTIC_REPORT',
    title: 'Blood Test',
    source: 'MANUAL_UPLOAD',
    storageKey: 'user-a/blood-test.json',
    description: null,
    mimeType: null,
    fileSize: null,
    extractedText: null,
    hash: null,
    version: 1,
    recordedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Minimal consent grant fixture
// ---------------------------------------------------------------------------
export function makeConsent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'consent-1',
    ownerUserId: 'user-a',
    grantedToUserId: 'user-b',
    accessLevel: 'LIMITED',
    accessMethod: 'MANUAL_APPROVAL',
    status: 'ACTIVE',
    purpose: 'Second opinion',
    scope: {},
    expiresAt: new Date(Date.now() + 24 * 60 * 60_000),
    grantedAt: new Date(),
    revokedAt: null,
    createdAt: new Date(),
    grantedToUser: { fullName: 'Doctor B' },
    shareLinks: [],
    ...overrides,
  };
}
