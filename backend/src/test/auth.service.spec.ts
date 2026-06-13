/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/test/auth.service.spec.ts
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
 * Test file: validates auth/service
 *
 * Responsibilities:
 * - Execute business logic for testing operations
 * - Coordinate data access and external API calls
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
 - testing
 - node:test
 - strict
 - jwt
 - common
 *
 * Dependencies:
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
import { JwtService } from '@nestjs/jwt';
import { HttpException, UnauthorizedException } from '@nestjs/common';

import { AuthService } from '../modules/auth/auth.service';
import { SmsService } from '../modules/auth/sms.service';
import { MfaService } from '../modules/auth/mfa.service';
import { PrismaService } from '../providers/prisma/prisma.service';
import { RedisService } from '../providers/redis/redis.service';
import { AuditLogService } from '../common/services/audit-log.service';
import { makePrismaMock, makeAuditMock, makeUser, makeChallenge } from './helpers';
import { WyshIdService } from '../common/services/wysh-id.service';
import { SupabaseService } from '../providers/supabase/supabase.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeJwtMock() {
  return {
    signAsync: async () => 'signed.jwt.token',
    verifyAsync: async () => ({ sub: 'user-a', phoneNumber: '+910000000001', roles: ['PATIENT'] }),
  };
}

async function buildService(prisma: ReturnType<typeof makePrismaMock>) {
  const audit = makeAuditMock();
  const module = await Test.createTestingModule({
    providers: [
      AuthService,
      { provide: PrismaService, useValue: prisma },
      { provide: AuditLogService, useValue: audit },
      { provide: JwtService, useValue: makeJwtMock() },
      { provide: SmsService, useValue: { sendOtp: async () => {} } },
      { provide: WyshIdService, useValue: { generateWyshId: () => 'WYSH-12345678' } },
      { provide: RedisService, useValue: { getClient: () => null, healthcheck: async () => ({ status: 'ok' as const }) } },
      { provide: MfaService, useValue: { generateSecret: () => ({ secret: '', otpauthUrl: '' }), verifyToken: () => true, generateBackupCodes: () => ({ hashed: [], plain: [] }), verifyBackupCode: () => null, removeUsedBackupCode: () => '[]' } },
      { provide: SupabaseService, useValue: { isAvailable: () => false } },
    ],
  }).compile();

  return {
    service: module.get(AuthService),
    audit,
    prisma,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('AuthService', () => {
  describe('requestOtp', () => {
    it('issues a challenge and returns otpPreview in non-production', async () => {
      const prisma = makePrismaMock();
      prisma.otpChallenge.count.mock.mockImplementation(async () => 0);
      prisma.otpChallenge.create.mock.mockImplementation(async () => ({}));
      prisma.auditLog.create.mock.mockImplementation(async () => ({}));

      const { service } = await buildService(prisma);
      const result = await service.requestOtp('+910000000001', 'LOGIN');

      assert.equal(result.challengeIssued, true);
      assert.match(result.otpPreview!, /^\d{6}$/); // random 6-digit OTP in non-production
      assert.equal(prisma.otpChallenge.create.mock.calls.length, 1);
    });

    it('rejects when 5 active challenges exist', async () => {
      const prisma = makePrismaMock();
      prisma.otpChallenge.count.mock.mockImplementation(async () => 5);

      const { service } = await buildService(prisma);
      await assert.rejects(
        () => service.requestOtp('+910000000001', 'LOGIN'),
        (err: HttpException) => {
          assert.equal(err.getStatus(), 429);
          return true;
        },
      );
    });
  });

  describe('verifyOtp', () => {
    it('creates a new user on first login and returns session', async () => {
      const prisma = makePrismaMock();
      const user = makeUser();

      prisma.otpChallenge.findFirst.mock.mockImplementation(async () => makeChallenge());
      prisma.user.findUnique.mock.mockImplementation(async () => null); // new user
      prisma.user.create.mock.mockImplementation(async () => user);
      prisma.otpChallenge.update.mock.mockImplementation(async () => ({}));
      prisma.deviceSession.create.mock.mockImplementation(async () => ({ id: 'session-1' }));
      prisma.refreshToken.create.mock.mockImplementation(async () => ({}));
      prisma.auditLog.create.mock.mockImplementation(async () => ({}));

      const { service } = await buildService(prisma);
      const result = await service.verifyOtp('+910000000001', '123456', 'web');

      assert.ok(result.accessToken);
      assert.ok(result.refreshToken);
      assert.equal(result.user.id, 'user-a');
      assert.equal(prisma.user.create.mock.calls.length, 1);
    });

    it('returns existing user session on subsequent login', async () => {
      const prisma = makePrismaMock();
      const user = makeUser();

      prisma.otpChallenge.findFirst.mock.mockImplementation(async () => makeChallenge());
      prisma.user.findUnique.mock.mockImplementation(async () => user);
      prisma.otpChallenge.update.mock.mockImplementation(async () => ({}));
      prisma.deviceSession.create.mock.mockImplementation(async () => ({ id: 'session-1' }));
      prisma.refreshToken.create.mock.mockImplementation(async () => ({}));
      prisma.auditLog.create.mock.mockImplementation(async () => ({}));

      const { service } = await buildService(prisma);
      const result = await service.verifyOtp('+910000000001', '123456', 'web');

      assert.equal(result.user.id, 'user-a');
      assert.equal(prisma.user.create.mock.calls.length, 0); // not created
    });

    it('rejects invalid OTP', async () => {
      const prisma = makePrismaMock();
      prisma.otpChallenge.findFirst.mock.mockImplementation(async () => null); // no match

      const { service } = await buildService(prisma);
      await assert.rejects(
        () => service.verifyOtp('+910000000001', '000000', 'web'),
        UnauthorizedException,
      );
    });

    it('rejects expired OTP (findFirst returns null because expiresAt filter excludes it)', async () => {
      const prisma = makePrismaMock();
      // Prisma WHERE expiresAt > now filters it out — service receives null
      prisma.otpChallenge.findFirst.mock.mockImplementation(async () => null);

      const { service } = await buildService(prisma);
      await assert.rejects(
        () => service.verifyOtp('+910000000001', '123456', 'web'),
        UnauthorizedException,
      );
    });

    it('rejects locked challenge (attemptCount >= 5)', async () => {
      const prisma = makePrismaMock();
      prisma.otpChallenge.findFirst.mock.mockImplementation(async () =>
        makeChallenge({ attemptCount: 5 }),
      );

      const { service } = await buildService(prisma);
      await assert.rejects(
        () => service.verifyOtp('+910000000001', '123456', 'web'),
        (err: HttpException) => {
          assert.equal(err.getStatus(), 429);
          return true;
        },
      );
    });
  });

  describe('refreshSession', () => {
    it('rotates refresh token and returns new session', async () => {
      const prisma = makePrismaMock();
      const user = makeUser();
      const storedToken = {
        id: 'rt-1',
        userId: 'user-a',
        deviceId: 'session-1',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
        user: { ...user, roles: [{ role: 'PATIENT' }] },
      };

      prisma.refreshToken.findUnique.mock.mockImplementation(async () => storedToken);
      prisma.deviceSession.update.mock.mockImplementation(async () => ({}));
      prisma.refreshToken.update.mock.mockImplementation(async () => ({}));
      prisma.refreshToken.create.mock.mockImplementation(async () => ({}));
      prisma.auditLog.create.mock.mockImplementation(async () => ({}));

      const { service } = await buildService(prisma);
      const result = await service.refreshSession('valid-refresh-token');

      assert.ok(result.accessToken);
      assert.ok(result.refreshToken);
      // old token was revoked
      assert.equal(prisma.refreshToken.update.mock.calls.length, 1);
    });

    it('rejects unknown refresh token', async () => {
      const prisma = makePrismaMock();
      prisma.refreshToken.findUnique.mock.mockImplementation(async () => null);

      const { service } = await buildService(prisma);
      await assert.rejects(
        () => service.refreshSession('bad-token'),
        UnauthorizedException,
      );
    });

    it('detects refresh token reuse and revokes all sessions', async () => {
      const prisma = makePrismaMock();
      const storedToken = {
        id: 'rt-1',
        userId: 'user-a',
        deviceId: 'session-1',
        revokedAt: new Date(), // already revoked = reuse
        expiresAt: new Date(Date.now() + 60_000),
        user: makeUser(),
      };

      prisma.refreshToken.findUnique.mock.mockImplementation(async () => storedToken);
      prisma.deviceSession.updateMany.mock.mockImplementation(async () => ({}));
      prisma.refreshToken.updateMany.mock.mockImplementation(async () => ({}));
      prisma.auditLog.create.mock.mockImplementation(async () => ({}));

      const { service } = await buildService(prisma);
      await assert.rejects(
        () => service.refreshSession('reused-token'),
        UnauthorizedException,
      );
      // all sessions revoked
      assert.equal(prisma.deviceSession.updateMany.mock.calls.length, 1);
    });

    it('rejects expired refresh token', async () => {
      const prisma = makePrismaMock();
      prisma.refreshToken.findUnique.mock.mockImplementation(async () => ({
        id: 'rt-1',
        userId: 'user-a',
        deviceId: null,
        revokedAt: null,
        expiresAt: new Date(Date.now() - 1000), // expired
        user: makeUser(),
      }));

      const { service } = await buildService(prisma);
      await assert.rejects(
        () => service.refreshSession('expired-token'),
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('revokes refresh token and device session', async () => {
      const prisma = makePrismaMock();
      prisma.refreshToken.findMany.mock.mockImplementation(async () => []);
      prisma.refreshToken.updateMany.mock.mockImplementation(async () => ({}));
      prisma.deviceSession.updateMany.mock.mockImplementation(async () => ({}));
      prisma.auditLog.create.mock.mockImplementation(async () => ({}));

      const { service } = await buildService(prisma);
      const result = await service.logout('user-a', 'some-refresh-token', 'session-1');

      assert.equal(result.loggedOut, true);
      assert.equal(prisma.refreshToken.updateMany.mock.calls.length, 1);
      assert.equal(prisma.deviceSession.updateMany.mock.calls.length, 1);
    });

    it('writes SESSION_LOGGED_OUT audit entry', async () => {
      const prisma = makePrismaMock();
      prisma.refreshToken.findMany.mock.mockImplementation(async () => []);
      prisma.refreshToken.updateMany.mock.mockImplementation(async () => ({}));
      prisma.deviceSession.updateMany.mock.mockImplementation(async () => ({}));
      prisma.auditLog.create.mock.mockImplementation(async () => ({}));

      const { service, audit } = await buildService(prisma);
      await service.logout('user-a', undefined, 'session-1');

      assert.equal(audit.capture.mock.calls.length, 1);
      assert.equal(
        (audit.capture.mock.calls[0]!.arguments[0] as { action: string }).action,
        'SESSION_LOGGED_OUT',
      );
    });
  });
});
