/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/test/authorization.spec.ts
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
 * Test file: validates authorization
 *
 * Responsibilities:
 * - Validate business logic through automated tests
 *
 * Used By:
 - backend/src/modules/prescription/prescription.service.ts
 - backend/src/providers/storage/storage.module.ts
 - backend/tests/rbac.access-matrix.test.mjs
 - backend/src/modules/abdm/abdm.module.ts
 - backend/src/modules/prescription/interaction-engine.service.ts
 - backend/src/modules/interoperability/interoperability.module.ts
 - backend/src/modules/digital-twin/digital-twin.service.ts
 - backend/src/main.ts
 *
 * Calls:
 - core
 - testing
 - node:test
 - strict
 - jwt
 - common
 *
 * Dependencies:
 - core
 - testing
 - node:test
 - strict
 - jwt
 - common
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Testing
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

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { VaultService } from '../modules/vault/vault.service';
import { PrismaService } from '../providers/prisma/prisma.service';
import { RedisService } from '../providers/redis/redis.service';
import { StorageService } from '../providers/storage/storage.service';
import { makePrismaMock, makeRecord, makeAuditMock } from './helpers';
import { AuditLogService } from '../common/services/audit-log.service';
import { EncryptionService } from '../common/encryption/encryption.service';

function makeEncryptionMock() {
  return {
    encryptBuffer: () => ({ iv: Buffer.from('iv'), authTag: Buffer.from('tag'), ciphertext: Buffer.from('ciphertext') }),
    encrypt: () => 'encrypted',
    decrypt: () => 'decrypted',
    decryptBuffer: () => Buffer.from('decrypted-buffer'),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeContext(user: unknown, handlerRoles?: string[]): ExecutionContext {
  const reflector = new Reflector();
  const ctx = {
    getType: () => 'http',
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user, headers: {}, cookies: {} }),
    }),
  } as unknown as ExecutionContext;

  // Stub reflector to return roles for this context
  if (handlerRoles) {
    Object.defineProperty(ctx, '__roles', { value: handlerRoles });
  }

  return ctx;
}

function makeReflectorWithRoles(roles: string[]) {
  return {
    getAllAndOverride: (_key: string, _targets: unknown[]) => roles,
  } as unknown as Reflector;
}

// ---------------------------------------------------------------------------
// RolesGuard
// ---------------------------------------------------------------------------
describe('RolesGuard', () => {
  it('allows request when no roles required', async () => {
    const module = await Test.createTestingModule({
      providers: [RolesGuard, { provide: Reflector, useValue: makeReflectorWithRoles([]) }],
    }).compile();

    const guard = module.get(RolesGuard);
    const ctx = makeContext({ userId: 'user-a', roles: ['PATIENT'] });
    assert.equal(guard.canActivate(ctx), true);
  });

  it('allows PATIENT to access PATIENT-only route', async () => {
    const module = await Test.createTestingModule({
      providers: [RolesGuard, { provide: Reflector, useValue: makeReflectorWithRoles(['PATIENT']) }],
    }).compile();

    const guard = module.get(RolesGuard);
    const ctx = makeContext({ userId: 'user-a', roles: ['PATIENT'] });
    assert.equal(guard.canActivate(ctx), true);
  });

  it('blocks PATIENT from ADMIN-only route', async () => {
    const module = await Test.createTestingModule({
      providers: [RolesGuard, { provide: Reflector, useValue: makeReflectorWithRoles(['ADMIN']) }],
    }).compile();

    const guard = module.get(RolesGuard);
    const ctx = makeContext({ userId: 'user-a', roles: ['PATIENT'] });
    assert.equal(guard.canActivate(ctx), false);
  });

  it('allows ADMIN to access ADMIN-only route', async () => {
    const module = await Test.createTestingModule({
      providers: [RolesGuard, { provide: Reflector, useValue: makeReflectorWithRoles(['ADMIN']) }],
    }).compile();

    const guard = module.get(RolesGuard);
    const ctx = makeContext({ userId: 'admin-1', roles: ['ADMIN'] });
    assert.equal(guard.canActivate(ctx), true);
  });

  it('blocks unauthenticated request (no user on request)', async () => {
    const module = await Test.createTestingModule({
      providers: [RolesGuard, { provide: Reflector, useValue: makeReflectorWithRoles(['PATIENT']) }],
    }).compile();

    const guard = module.get(RolesGuard);
    const ctx = makeContext(undefined); // no user
    assert.equal(guard.canActivate(ctx), false);
  });
});

// ---------------------------------------------------------------------------
// JwtAuthGuard — cookie and bearer token paths
// ---------------------------------------------------------------------------
describe('JwtAuthGuard', () => {
  function makeJwtMock(payload: unknown) {
    return { verifyAsync: async () => payload };
  }

  function makePrismaWithSession(exists: boolean) {
    const prisma = makePrismaMock();
    prisma.deviceSession.findFirst.mock.mockImplementation(async () =>
      exists ? { id: 'session-1', lastSeenAt: new Date() } : null,
    );
    prisma.deviceSession.update.mock.mockImplementation(async () => ({}));
    return prisma;
  }

  async function buildGuard(jwtMock: unknown, prisma: ReturnType<typeof makePrismaMock>) {
    const module = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        Reflector,
        { provide: JwtService, useValue: jwtMock },
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: { getClient: () => null, healthcheck: async () => ({ status: 'ok' as const }) } },
      ],
    }).compile();
    return module.get(JwtAuthGuard);
  }

  it('authenticates via cookie token', async () => {
    const payload = { sub: 'user-a', phoneNumber: '+910000000001', roles: ['PATIENT'], sessionId: 'session-1' };
    const prisma = makePrismaWithSession(true);
    const guard = await buildGuard(makeJwtMock(payload), prisma);

    const request: Record<string, unknown> = { headers: {}, cookies: { wyshcare_access_token: 'valid.jwt' } };
    const ctx = {
      getType: () => 'http',
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(ctx);
    assert.equal(result, true);
    assert.equal((request.user as { userId: string }).userId, 'user-a');
  });

  it('rejects request with no token', async () => {
    const prisma = makePrismaMock();
    const guard = await buildGuard(makeJwtMock({}), prisma);

    const ctx = {
      getType: () => 'http',
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({ headers: {}, cookies: {} }) }),
    } as unknown as ExecutionContext;

    await assert.rejects(() => guard.canActivate(ctx), UnauthorizedException);
  });

  it('rejects when session is revoked or expired', async () => {
    const payload = { sub: 'user-a', phoneNumber: '+910000000001', roles: ['PATIENT'], sessionId: 'session-1' };
    const prisma = makePrismaWithSession(false); // session not found
    const guard = await buildGuard(makeJwtMock(payload), prisma);

    const ctx = {
      getType: () => 'http',
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ headers: {}, cookies: { wyshcare_access_token: 'valid.jwt' } }),
      }),
    } as unknown as ExecutionContext;

    await assert.rejects(() => guard.canActivate(ctx), UnauthorizedException);
  });
});

// ---------------------------------------------------------------------------
// Cross-user record access — VaultService enforces userId ownership
// ---------------------------------------------------------------------------
describe('VaultService — cross-user access prevention', () => {
  async function buildVault(prisma: ReturnType<typeof makePrismaMock>) {
    const module = await Test.createTestingModule({
      providers: [
        VaultService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: { buildObjectKey: () => 'key', getDownloadUrl: async () => 'url' } },
        { provide: AuditLogService, useValue: makeAuditMock() },
        { provide: EncryptionService, useValue: makeEncryptionMock() },
      ],
    }).compile();
    return module.get(VaultService);
  }

  it('list() only returns records for the requesting user', async () => {
    const prisma = makePrismaMock();
    const userARecord = makeRecord({ userId: 'user-a' });
    prisma.healthRecord.findMany.mock.mockImplementation(async () => [userARecord]);

    const vault = await buildVault(prisma);
    const results = await vault.list('user-a');

    // Verify the WHERE clause passed to Prisma includes userId
    const callArgs = prisma.healthRecord.findMany.mock.calls[0]!.arguments[0] as {
      where: { userId: string };
    };
    assert.equal(callArgs.where.userId, 'user-a');
    assert.equal(results.length, 1);
  });

  it('getDownloadLink() throws when record belongs to different user', async () => {
    const prisma = makePrismaMock();
    // findFirstOrThrow throws when WHERE userId + id has no match
    prisma.healthRecord.findFirstOrThrow.mock.mockImplementation(async () => {
      throw new Error('Record not found');
    });

    const vault = await buildVault(prisma);
    await assert.rejects(
      () => vault.getDownloadLink('user-b', 'record-owned-by-user-a'),
      Error,
    );
  });

  it('getDownloadLink() succeeds for record owner', async () => {
    const prisma = makePrismaMock();
    prisma.healthRecord.findFirstOrThrow.mock.mockImplementation(async () =>
      makeRecord({ storageKey: 'user-a/blood-test.json' }),
    );

    const vault = await buildVault(prisma);
    const result = await vault.getDownloadLink('user-a', 'record-1');
    assert.equal(result.url, 'url');
  });
});
