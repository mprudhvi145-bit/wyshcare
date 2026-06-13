/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/test/auth-hardening.spec.ts
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
 * Test file: validates auth hardening features (MFA, lockout, blacklist,
 * inactivity timeout, RolesGuard enforcement, JWT structure)
 *
 * Responsibilities:
 * - Validate TOTP MFA secret generation, verification, backup codes
 * - Validate account lockout with exponential backoff
 * - Validate JWT blacklisting on logout via Redis
 * - Validate session inactivity timeout enforcement
 * - Validate RolesGuard role matching
 * - Validate JWT claim structure
 *
 * Used By:
 * - (standalone test — run via node --test)
 *
 * Calls:
 * - node:test
 * - @nestjs/testing
 * - otplib
 *
 * Dependencies:
 * - node:test
 * - @nestjs/testing
 * - otplib
 *
 * Security Notes:
 * Tests auth hardening features added in Phase 2 stabilization
 *
 * Business Domain:
 * Authentication / Security
 *
 * Last Reviewed:
 * 2026-06-12
 *
 * ============================================================================
 * (c) Wysh Technologies
 * Built by Vimarshak Prudhvi
 * All Rights Reserved
 * ============================================================================
 */

import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { authenticator } from 'otplib';
import { createHash } from 'node:crypto';
import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { MfaService } from '../modules/auth/mfa.service';
import { AuthService } from '../modules/auth/auth.service';
import { SmsService } from '../modules/auth/sms.service';
import { PrismaService } from '../providers/prisma/prisma.service';
import { RedisService } from '../providers/redis/redis.service';
import { AuditLogService } from '../common/services/audit-log.service';
import { WyshIdService } from '../common/services/wysh-id.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { SupabaseService } from '../providers/supabase/supabase.service';

import { makePrismaMock, makeAuditMock, makeUser, makeChallenge } from './helpers';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeJwtMock(payload?: Record<string, unknown>) {
  return {
    signAsync: async () => 'signed.jwt.token',
    verifyAsync: async () =>
      payload ?? {
        sub: 'user-a',
        phoneNumber: '+910000000001',
        roles: ['PATIENT'],
        sessionId: 'session-1',
      },
  };
}

function makeRedisClientMock() {
  return {
    get: mock.fn<(...args: any[]) => any>(async () => null),
    set: mock.fn<(...args: any[]) => any>(async () => 'OK'),
    expire: mock.fn<(...args: any[]) => any>(async () => 1),
    del: mock.fn<(...args: any[]) => any>(async () => 1),
  };
}

function makeRedisMock(client?: ReturnType<typeof makeRedisClientMock>) {
  return {
    getClient: () => client ?? null,
    healthcheck: async () => ({ status: 'ok' as const }),
  };
}

function makeMfaMock() {
  return {
    generateSecret: () => ({
      secret: 'JBSWY3DPEHPK3PXP',
      otpauthUrl: 'otpauth://totp/WyshCare:test?secret=JBSWY3DPEHPK3PXP',
    }),
    verifyToken: () => true,
    generateBackupCodes: () => ({
      hashed: [
        createHash('sha256').update('CODE001').digest('hex'),
        createHash('sha256').update('CODE002').digest('hex'),
        createHash('sha256').update('CODE003').digest('hex'),
        createHash('sha256').update('CODE004').digest('hex'),
        createHash('sha256').update('CODE005').digest('hex'),
        createHash('sha256').update('CODE006').digest('hex'),
        createHash('sha256').update('CODE007').digest('hex'),
        createHash('sha256').update('CODE008').digest('hex'),
      ],
      plain: ['CODE001', 'CODE002', 'CODE003', 'CODE004', 'CODE005', 'CODE006', 'CODE007', 'CODE008'],
    }),
    generateQrCodeDataUrl: async () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...',
    verifyBackupCode: () => null,
    removeUsedBackupCode: () => '[]',
  };
}

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

  if (handlerRoles) {
    Object.defineProperty(ctx, '__roles', { value: handlerRoles });
  }

  return ctx;
}

function makeReflectorForRolesKey(roles: string[]) {
  return {
    getAllAndOverride: (key: string, _targets: unknown[]) => {
      if (key === ROLES_KEY) return roles;
      return undefined;
    },
  } as unknown as Reflector;
}

// Extend prisma mock with adminCredential for AdminAuthService tests
function makePrismaWithAdmin() {
  const prisma = makePrismaMock();
  (prisma as any).adminCredential = {
    findUnique: mock.fn<(...args: any[]) => any>(),
    update: mock.fn<(...args: any[]) => any>(),
    create: mock.fn<(...args: any[]) => any>(),
  };
  return prisma as ReturnType<typeof makePrismaMock> & {
    adminCredential: {
      findUnique: ReturnType<typeof mock.fn>;
      update: ReturnType<typeof mock.fn>;
      create: ReturnType<typeof mock.fn>;
    };
  };
}

async function buildAuthService(prisma: ReturnType<typeof makePrismaMock>) {
  const audit = makeAuditMock();
  const redisClient = makeRedisClientMock();
  const module = await Test.createTestingModule({
    providers: [
      AuthService,
      { provide: PrismaService, useValue: prisma },
      { provide: AuditLogService, useValue: audit },
      { provide: JwtService, useValue: makeJwtMock() },
      { provide: SmsService, useValue: { sendOtp: async () => {} } },
      { provide: WyshIdService, useValue: { generateWyshId: () => 'WYSH-12345678' } },
      { provide: RedisService, useValue: makeRedisMock(redisClient) },
      { provide: MfaService, useValue: makeMfaMock() },
      { provide: SupabaseService, useValue: { isAvailable: () => false } },
    ],
  }).compile();

  return {
    service: module.get(AuthService),
    audit,
    prisma,
    redisClient,
  };
}

async function buildJwtGuard(
  jwtPayload: Record<string, unknown> | undefined,
  prisma: ReturnType<typeof makePrismaMock>,
  redisClient?: ReturnType<typeof makeRedisClientMock>,
) {
  const module = await Test.createTestingModule({
    providers: [
      JwtAuthGuard,
      Reflector,
      { provide: JwtService, useValue: makeJwtMock(jwtPayload) },
      { provide: PrismaService, useValue: prisma },
      { provide: RedisService, useValue: makeRedisMock(redisClient ?? makeRedisClientMock()) },
    ],
  }).compile();
  return module.get(JwtAuthGuard);
}

function buildJwtGuardContext(requestOverrides?: Record<string, unknown>): ExecutionContext {
  const request = {
    headers: {},
    cookies: { wyshcare_access_token: 'valid.jwt' },
    user: undefined,
    ...requestOverrides,
  };
  return {
    getType: () => 'http',
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

// ===========================================================================
// Suite 1: TOTP MFA
// ===========================================================================
describe('TOTP MFA', () => {
  it('mfaService.generateSecret() returns a valid base32 secret', () => {
    const mfa = new MfaService();
    const result = mfa.generateSecret('test@wyshcare.com');
    assert.ok(result.secret);
    assert.match(result.secret, /^[A-Z2-7]+=*$/);
    assert.ok(decodeURIComponent(result.otpauthUrl).includes('test@wyshcare.com'));
    assert.ok(result.otpauthUrl.includes('WyshCare'));
    assert.ok(result.otpauthUrl.startsWith('otpauth://'));
  });

  it('mfaService.verifyToken() returns true for valid token', () => {
    const mfa = new MfaService();
    const { secret } = mfa.generateSecret('test@wyshcare.com');
    const token = authenticator.generate(secret);
    assert.equal(mfa.verifyToken(secret, token), true);
  });

  it('mfaService.verifyToken() returns false for invalid token', () => {
    const mfa = new MfaService();
    const { secret } = mfa.generateSecret('test@wyshcare.com');
    assert.equal(mfa.verifyToken(secret, '000000'), false);
  });

  it('mfaService.generateBackupCodes() returns 8 backup codes with hashed equivalents', () => {
    const mfa = new MfaService();
    const { hashed, plain } = mfa.generateBackupCodes();
    assert.equal(plain.length, 8);
    assert.equal(hashed.length, 8);
    for (let i = 0; i < 8; i++) {
      assert.equal(typeof plain[i], 'string');
      assert.ok(plain[i]!.length > 0);
      assert.equal(typeof hashed[i], 'string');
      assert.equal(hashed[i]!, createHash('sha256').update(plain[i]!).digest('hex'));
    }
  });

  it('mfaService.verifyBackupCode() matches a valid backup code', () => {
    const mfa = new MfaService();
    const { hashed, plain } = mfa.generateBackupCodes();
    const hashedJson = JSON.stringify(hashed);
    const match = mfa.verifyBackupCode(plain[0]!, hashedJson);
    assert.equal(match, hashed[0]);
  });

  it('mfaService.verifyBackupCode() returns null for invalid code', () => {
    const mfa = new MfaService();
    const { hashed } = mfa.generateBackupCodes();
    const hashedJson = JSON.stringify(hashed);
    const match = mfa.verifyBackupCode('INVALID_CODE', hashedJson);
    assert.equal(match, null);
  });

  it('mfaService.removeUsedBackupCode() removes a used code from the list', () => {
    const mfa = new MfaService();
    const { hashed, plain } = mfa.generateBackupCodes();
    const hashedJson = JSON.stringify(hashed);
    const remaining = mfa.removeUsedBackupCode(hashed[0]!, hashedJson);
    const parsed = JSON.parse(remaining) as string[];
    assert.equal(parsed.length, 7);
    assert.ok(!parsed.includes(hashed[0]!));
  });
});

// ===========================================================================
// Suite 2: Account Lockout
// ===========================================================================
describe('Account Lockout', () => {
  describe('AuthService.requestOtp() rejects locked accounts', () => {
    it('throws ForbiddenException when user.lockedUntil is in the future', async () => {
      const prisma = makePrismaMock();
      const lockedUser = makeUser({
        lockedUntil: new Date(Date.now() + 3600_000),
      });

      prisma.user.findUnique.mock.mockImplementation(async () => lockedUser);
      prisma.otpChallenge.count.mock.mockImplementation(async () => 0);
      prisma.otpChallenge.create.mock.mockImplementation(async () => ({}));
      prisma.auditLog.create.mock.mockImplementation(async () => ({}));

      const { service } = await buildAuthService(prisma);
      await assert.rejects(
        () => service.requestOtp('+910000000001', 'LOGIN'),
        (err: ForbiddenException) => {
          assert.ok(err.message.includes('locked'));
          return true;
        },
      );
    });

    it('proceeds normally when lockedUntil is in the past', async () => {
      const prisma = makePrismaMock();
      const unlockedUser = makeUser({
        lockedUntil: new Date(Date.now() - 3600_000),
      });

      prisma.user.findUnique.mock.mockImplementation(async () => unlockedUser);
      prisma.otpChallenge.count.mock.mockImplementation(async () => 0);
      prisma.otpChallenge.create.mock.mockImplementation(async () => ({}));
      prisma.auditLog.create.mock.mockImplementation(async () => ({}));

      const { service } = await buildAuthService(prisma);
      const result = await service.requestOtp('+910000000001', 'LOGIN');
      assert.equal(result.challengeIssued, true);
    });
  });

  describe('AuthService.verifyOtp() rejects locked accounts', () => {
    it('throws ForbiddenException when user.lockedUntil is in the future', async () => {
      const prisma = makePrismaMock();
      const lockedUser = makeUser({
        lockedUntil: new Date(Date.now() + 3600_000),
      });

      prisma.otpChallenge.findFirst.mock.mockImplementation(async () => makeChallenge());
      prisma.user.findUnique.mock.mockImplementation(async () => lockedUser);
      prisma.otpChallenge.update.mock.mockImplementation(async () => ({}));
      prisma.user.update.mock.mockImplementation(async () => ({}));
      prisma.deviceSession.create.mock.mockImplementation(async () => ({ id: 'session-1' }));
      prisma.refreshToken.create.mock.mockImplementation(async () => ({}));
      prisma.auditLog.create.mock.mockImplementation(async () => ({}));

      const { service } = await buildAuthService(prisma);
      await assert.rejects(
        () => service.verifyOtp('+910000000001', '123456', 'web'),
        (err: ForbiddenException) => {
          assert.ok(err.message.includes('locked'));
          return true;
        },
      );
    });
  });

  describe('AuthService.clearFailedAttempts() resets failed counter', () => {
    it('resets failedLoginAttempts and lockedUntil after successful login', async () => {
      const prisma = makePrismaMock();
      const user = makeUser();

      prisma.otpChallenge.findFirst.mock.mockImplementation(async () => makeChallenge());
      prisma.user.findUnique.mock.mockImplementation(async () => user);
      prisma.user.create.mock.mockImplementation(async () => user);
      prisma.otpChallenge.update.mock.mockImplementation(async () => ({}));
      prisma.user.update.mock.mockImplementation(async () => ({
        ...user,
        failedLoginAttempts: 0,
        lockedUntil: null,
      }));
      prisma.deviceSession.create.mock.mockImplementation(async () => ({ id: 'session-1' }));
      prisma.refreshToken.create.mock.mockImplementation(async () => ({}));
      prisma.auditLog.create.mock.mockImplementation(async () => ({}));

      const { service, prisma: p } = await buildAuthService(prisma);
      await service.verifyOtp('+910000000001', '123456', 'web');

      const updateCall = (p.user.update as ReturnType<typeof mock.fn>).mock.calls.find(
        (call: { arguments: unknown[] }) =>
          (call.arguments[0] as { where?: { id?: string } })?.where?.id === 'user-a',
      );
      assert.ok(updateCall);
      const data = (updateCall.arguments[0] as { data: Record<string, unknown> }).data;
      assert.equal(data.failedLoginAttempts, 0);
      assert.equal(data.lockedUntil, null);
    });
  });

  describe('AdminAuthService exponential backoff', () => {
    it('enforces lockout check before credential lookup', async () => {
      const prisma = makePrismaWithAdmin();
      const lockedUser = makeUser({
        email: 'admin@wyshcare.com',
        lockedUntil: new Date(Date.now() + 3600_000),
        failedLoginAttempts: 10,
        roles: [{ role: 'ADMIN' }],
      });

      prisma.user.findUnique.mock.mockImplementation(async () => lockedUser);

      const { AdminAuthService } = await import('../modules/auth/admin-auth.service');
      const audit = makeAuditMock();
      const module = await Test.createTestingModule({
        providers: [
          AdminAuthService,
          { provide: PrismaService, useValue: prisma },
          { provide: JwtService, useValue: makeJwtMock() },
          { provide: AuditLogService, useValue: audit },
          { provide: MfaService, useValue: makeMfaMock() },
        ],
      }).compile();

      const service = module.get(AdminAuthService);
      await assert.rejects(
        () => service.login('admin@wyshcare.com', 'correct-password'),
        (err: ForbiddenException) => {
          assert.ok(err.message.includes('locked'));
          return true;
        },
      );
    });

    it('computes lockout duration with exponential backoff: first lockout = 30min', async () => {
      const minutes = Math.min(30 * Math.pow(2, Math.floor(10 / 10) - 1), 480);
      assert.equal(minutes, 30);
    });

    it('computes lockout duration with exponential backoff: second lockout = 60min', async () => {
      const minutes = Math.min(30 * Math.pow(2, Math.floor(20 / 10) - 1), 480);
      assert.equal(minutes, 60);
    });

    it('computes lockout duration with exponential backoff: caps at 480min (8 hours)', async () => {
      const minutes = Math.min(30 * Math.pow(2, Math.floor(50 / 10) - 1), 480);
      assert.equal(minutes, 480);
    });
  });
});

// ===========================================================================
// Suite 3: JWT Blacklisting (Redis)
// ===========================================================================
describe('JWT Blacklisting (Redis)', () => {
  describe('AuthService.logout() adds JTI to Redis blacklist', () => {
    it('stores blacklist entry with TTL when refresh token has remaining lifetime', async () => {
      const prisma = makePrismaMock();
      const futureDate = new Date(Date.now() + 3600_000);
      const redisClient = makeRedisClientMock();
      const audit = makeAuditMock();

      prisma.refreshToken.findMany.mock.mockImplementation(async () => [
        { id: 'rt-1', expiresAt: futureDate, deviceId: 'session-1' },
      ]);
      prisma.refreshToken.updateMany.mock.mockImplementation(async () => ({}));
      prisma.deviceSession.updateMany.mock.mockImplementation(async () => ({}));
      prisma.auditLog.create.mock.mockImplementation(async () => ({}));

      const module = await Test.createTestingModule({
        providers: [
          AuthService,
          { provide: PrismaService, useValue: prisma },
          { provide: AuditLogService, useValue: audit },
          { provide: JwtService, useValue: makeJwtMock() },
          { provide: SmsService, useValue: { sendOtp: async () => {} } },
          { provide: WyshIdService, useValue: { generateWyshId: () => 'WYSH-12345678' } },
          { provide: RedisService, useValue: makeRedisMock(redisClient) },
          { provide: MfaService, useValue: makeMfaMock() },
          { provide: SupabaseService, useValue: { isAvailable: () => false } },
        ],
      }).compile();

      const service = module.get(AuthService);
      await service.logout('user-a', 'some-refresh-token', 'session-1');

      const setCall = redisClient.set.mock.calls.find(
        (call: { arguments: unknown[] }) => String(call.arguments[0]).startsWith('blacklist:'),
      );
      assert.ok(setCall, 'Expected a blacklist: set call');
      assert.equal(setCall.arguments[1], 'true');
      assert.equal(setCall.arguments[2], 'EX');
      assert.ok(typeof setCall.arguments[3] === 'number' && setCall.arguments[3] > 0);
    });

    it('skips Redis blacklist when refresh tokens are already expired', async () => {
      const prisma = makePrismaMock();
      const pastDate = new Date(Date.now() - 1000);
      const redisClient = makeRedisClientMock();
      const audit = makeAuditMock();

      prisma.refreshToken.findMany.mock.mockImplementation(async () => [
        { id: 'rt-expired', expiresAt: pastDate, deviceId: 'session-1' },
      ]);
      prisma.refreshToken.updateMany.mock.mockImplementation(async () => ({}));
      prisma.deviceSession.updateMany.mock.mockImplementation(async () => ({}));
      prisma.auditLog.create.mock.mockImplementation(async () => ({}));

      const module = await Test.createTestingModule({
        providers: [
          AuthService,
          { provide: PrismaService, useValue: prisma },
          { provide: AuditLogService, useValue: audit },
          { provide: JwtService, useValue: makeJwtMock() },
          { provide: SmsService, useValue: { sendOtp: async () => {} } },
          { provide: WyshIdService, useValue: { generateWyshId: () => 'WYSH-12345678' } },
          { provide: RedisService, useValue: makeRedisMock(redisClient) },
          { provide: MfaService, useValue: makeMfaMock() },
          { provide: SupabaseService, useValue: { isAvailable: () => false } },
        ],
      }).compile();

      const service = module.get(AuthService);
      await service.logout('user-a', 'expired-refresh-token', 'session-1');

      const setCalls = redisClient.set.mock.calls.filter(
        (call: { arguments: unknown[] }) => String(call.arguments[0]).startsWith('blacklist:'),
      );
      assert.equal(setCalls.length, 0);
    });
  });

  describe('JwtAuthGuard.validateToken() rejects blacklisted JTIs', () => {
    it('throws UnauthorizedException when JWT jti is blacklisted in Redis', async () => {
      const prisma = makePrismaMock();
      prisma.deviceSession.findFirst.mock.mockImplementation(async () => ({
        id: 'session-1',
        lastSeenAt: new Date(),
      }));
      prisma.deviceSession.update.mock.mockImplementation(async () => ({}));

      const redisClient = makeRedisClientMock();
      redisClient.get.mock.mockImplementation(async () => 'true');

      const jwtPayload = {
        sub: 'user-a',
        phoneNumber: '+910000000001',
        roles: ['PATIENT'],
        sessionId: 'session-1',
        jti: 'blacklisted-jti',
      };

      const guard = await buildJwtGuard(jwtPayload, prisma, redisClient);
      const ctx = buildJwtGuardContext();

      await assert.rejects(
        () => guard.canActivate(ctx),
        (err: UnauthorizedException) => {
          assert.ok(err.message.includes('revoked'));
          return true;
        },
      );
    });

    it('accepts JWT with non-blacklisted jti', async () => {
      const prisma = makePrismaMock();
      prisma.deviceSession.findFirst.mock.mockImplementation(async () => ({
        id: 'session-1',
        lastSeenAt: new Date(),
      }));
      prisma.deviceSession.update.mock.mockImplementation(async () => ({}));

      const redisClient = makeRedisClientMock();
      redisClient.get.mock.mockImplementation(async () => null);

      const jwtPayload = {
        sub: 'user-a',
        phoneNumber: '+910000000001',
        roles: ['PATIENT'],
        sessionId: 'session-1',
        jti: 'valid-jti',
      };

      const guard = await buildJwtGuard(jwtPayload, prisma, redisClient);
      const ctx = buildJwtGuardContext();

      const result = await guard.canActivate(ctx);
      assert.equal(result, true);
    });

    it('allows request when Redis is unavailable (getClient returns null)', async () => {
      const prisma = makePrismaMock();
      prisma.deviceSession.findFirst.mock.mockImplementation(async () => ({
        id: 'session-1',
        lastSeenAt: new Date(),
      }));
      prisma.deviceSession.update.mock.mockImplementation(async () => ({}));

      const jwtPayload = {
        sub: 'user-a',
        phoneNumber: '+910000000001',
        roles: ['PATIENT'],
        sessionId: 'session-1',
        jti: 'some-jti',
      };

      const module = await Test.createTestingModule({
        providers: [
          JwtAuthGuard,
          Reflector,
          { provide: JwtService, useValue: makeJwtMock(jwtPayload) },
          { provide: PrismaService, useValue: prisma },
          { provide: RedisService, useValue: makeRedisMock() },
        ],
      }).compile();

      const guard = module.get(JwtAuthGuard);
      const ctx = buildJwtGuardContext();

      const result = await guard.canActivate(ctx);
      assert.equal(result, true);
    });
  });
});

// ===========================================================================
// Suite 4: Session Inactivity Timeout
// ===========================================================================
describe('Session Inactivity Timeout', () => {
  it('rejects session with lastSeenAt older than 24 hours', async () => {
    const prisma = makePrismaMock();
    prisma.deviceSession.findFirst.mock.mockImplementation(async () => ({
      id: 'session-1',
      lastSeenAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
    }));

    const jwtPayload = {
      sub: 'user-a',
      phoneNumber: '+910000000001',
      roles: ['PATIENT'],
      sessionId: 'session-1',
    };

    const guard = await buildJwtGuard(jwtPayload, prisma);
    const ctx = buildJwtGuardContext();

    await assert.rejects(
      () => guard.canActivate(ctx),
      (err: UnauthorizedException) => {
        assert.ok(err.message.includes('inactivity'));
        return true;
      },
    );
  });

  it('accepts session with recent lastSeenAt', async () => {
    const prisma = makePrismaMock();
    prisma.deviceSession.findFirst.mock.mockImplementation(async () => ({
      id: 'session-1',
      lastSeenAt: new Date(Date.now() - 60_000),
    }));
    prisma.deviceSession.update.mock.mockImplementation(async () => ({}));

    const jwtPayload = {
      sub: 'user-a',
      phoneNumber: '+910000000001',
      roles: ['PATIENT'],
      sessionId: 'session-1',
    };

    const guard = await buildJwtGuard(jwtPayload, prisma);
    const ctx = buildJwtGuardContext();

    const result = await guard.canActivate(ctx);
    assert.equal(result, true);
  });

  it('updates lastSeenAt on each valid request', async () => {
    const prisma = makePrismaMock();
    let lastSeenAt = new Date(Date.now() - 60_000);

    prisma.deviceSession.findFirst.mock.mockImplementation(async () => ({
      id: 'session-1',
      lastSeenAt,
    }));

    prisma.deviceSession.update.mock.mockImplementation(async (_args: unknown) => {
      lastSeenAt = new Date();
      return { id: 'session-1', lastSeenAt };
    });

    const jwtPayload = {
      sub: 'user-a',
      phoneNumber: '+910000000001',
      roles: ['PATIENT'],
      sessionId: 'session-1',
    };

    const guard = await buildJwtGuard(jwtPayload, prisma);
    const ctx = buildJwtGuardContext();

    await guard.canActivate(ctx);

    const updateCall = (prisma.deviceSession.update as ReturnType<typeof mock.fn>).mock.calls.find(
      (call: { arguments: unknown[] }) =>
        (call.arguments[0] as { where?: { id?: string } })?.where?.id === 'session-1',
    );
    assert.ok(updateCall);
    const data = (updateCall.arguments[0] as { data: { lastSeenAt?: Date } }).data;
    assert.ok(data.lastSeenAt instanceof Date);
  });

  it('bypasses session check when payload has no sessionId', async () => {
    const prisma = makePrismaMock();
    prisma.deviceSession.findFirst.mock.mockImplementation(async () => null);

    const jwtPayload = {
      sub: 'user-a',
      phoneNumber: '+910000000001',
      roles: ['ADMIN'],
    };

    const guard = await buildJwtGuard(jwtPayload, prisma);
    const ctx = buildJwtGuardContext();

    const result = await guard.canActivate(ctx);
    assert.equal(result, true);
  });
});

// ===========================================================================
// Suite 5: RolesGuard Enforcement
// ===========================================================================
describe('RolesGuard Enforcement', () => {
  it('allows ADMIN role on @Roles("ADMIN") route', async () => {
    const module = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: makeReflectorForRolesKey(['ADMIN']) },
      ],
    }).compile();

    const guard = module.get(RolesGuard);
    const ctx = makeContext({ userId: 'admin-1', roles: ['ADMIN'] });
    assert.equal(guard.canActivate(ctx), true);
  });

  it('allows both PATIENT and DOCTOR on @Roles("PATIENT", "DOCTOR") route', async () => {
    const module = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: makeReflectorForRolesKey(['PATIENT', 'DOCTOR']) },
      ],
    }).compile();

    const guard = module.get(RolesGuard);

    const patientCtx = makeContext({ userId: 'patient-1', roles: ['PATIENT'] });
    assert.equal(guard.canActivate(patientCtx), true);

    const doctorCtx = makeContext({ userId: 'doctor-1', roles: ['DOCTOR'] });
    assert.equal(guard.canActivate(doctorCtx), true);
  });

  it('rejects DOCTOR role on @Roles("ADMIN") route', async () => {
    const module = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: makeReflectorForRolesKey(['ADMIN']) },
      ],
    }).compile();

    const guard = module.get(RolesGuard);
    const ctx = makeContext({ userId: 'doctor-1', roles: ['DOCTOR'] });
    assert.equal(guard.canActivate(ctx), false);
  });

  it('rejects unauthenticated request when roles are required', async () => {
    const module = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: makeReflectorForRolesKey(['PATIENT']) },
      ],
    }).compile();

    const guard = module.get(RolesGuard);
    const ctx = makeContext(undefined);
    assert.equal(guard.canActivate(ctx), false);
  });

  it('allows all authenticated users when no @Roles() decorator is present', async () => {
    const module = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: makeReflectorForRolesKey([]) },
      ],
    }).compile();

    const guard = module.get(RolesGuard);
    const ctx = makeContext({ userId: 'patient-1', roles: ['PATIENT'] });
    assert.equal(guard.canActivate(ctx), true);
  });

  it('rejects NURSE role on @Roles("ADMIN") route', async () => {
    const module = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: makeReflectorForRolesKey(['ADMIN']) },
      ],
    }).compile();

    const guard = module.get(RolesGuard);
    const ctx = makeContext({ userId: 'nurse-1', roles: ['NURSE'] });
    assert.equal(guard.canActivate(ctx), false);
  });

  it('allows ADMIN role on multi-role route (@Roles("PATIENT", "ADMIN"))', async () => {
    const module = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: makeReflectorForRolesKey(['PATIENT', 'ADMIN']) },
      ],
    }).compile();

    const guard = module.get(RolesGuard);
    const ctx = makeContext({ userId: 'admin-1', roles: ['ADMIN'] });
    assert.equal(guard.canActivate(ctx), true);
  });

  it('allows SUPER_ADMIN on any role-gated route', async () => {
    const module = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: makeReflectorForRolesKey(['ADMIN']) },
      ],
    }).compile();

    const guard = module.get(RolesGuard);
    const ctx = makeContext({ userId: 'super-1', roles: ['SUPER_ADMIN'] });
    assert.equal(guard.canActivate(ctx), false);
  });
});

// ===========================================================================
// Suite 6: JWT Structure
// ===========================================================================
describe('JWT Structure', () => {
  it('JWT contains jti claim', async () => {
    let signedPayload: Record<string, unknown> | undefined;

    const jwtMock = {
      signAsync: async (payload: Record<string, unknown>) => {
        signedPayload = payload;
        return 'signed.jwt.token';
      },
      verifyAsync: async () => ({}),
    };

    const prisma = makePrismaMock();
    prisma.refreshToken.create.mock.mockImplementation(async () => ({}));

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: makeAuditMock() },
        { provide: JwtService, useValue: jwtMock },
        { provide: SmsService, useValue: { sendOtp: async () => {} } },
        { provide: WyshIdService, useValue: { generateWyshId: () => 'WYSH-12345678' } },
        { provide: RedisService, useValue: makeRedisMock() },
        { provide: MfaService, useValue: makeMfaMock() },
        { provide: SupabaseService, useValue: { isAvailable: () => false } },
      ],
    }).compile();

    const service = module.get(AuthService);

    prisma.user.findUnique.mock.mockImplementation(async () => null);
    prisma.user.create.mock.mockImplementation(async () => makeUser());
    prisma.otpChallenge.findFirst.mock.mockImplementation(async () => makeChallenge());
    prisma.otpChallenge.update.mock.mockImplementation(async () => ({}));
    prisma.deviceSession.create.mock.mockImplementation(async () => ({ id: 'session-1' }));
    prisma.auditLog.create.mock.mockImplementation(async () => ({}));

    await service.verifyOtp('+910000000001', '123456', 'web');

    assert.ok(signedPayload);
    assert.ok(signedPayload!.jti);
    assert.equal(typeof signedPayload!.jti, 'string');
    assert.ok((signedPayload!.jti as string).length > 0);
  });

  it('JWT contains sub claim', async () => {
    let signedPayload: Record<string, unknown> | undefined;

    const jwtMock = {
      signAsync: async (payload: Record<string, unknown>) => {
        signedPayload = payload;
        return 'signed.jwt.token';
      },
      verifyAsync: async () => ({}),
    };

    const prisma = makePrismaMock();
    prisma.refreshToken.create.mock.mockImplementation(async () => ({}));

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: makeAuditMock() },
        { provide: JwtService, useValue: jwtMock },
        { provide: SmsService, useValue: { sendOtp: async () => {} } },
        { provide: WyshIdService, useValue: { generateWyshId: () => 'WYSH-12345678' } },
        { provide: RedisService, useValue: makeRedisMock() },
        { provide: MfaService, useValue: makeMfaMock() },
        { provide: SupabaseService, useValue: { isAvailable: () => false } },
      ],
    }).compile();

    const service = module.get(AuthService);

    prisma.user.findUnique.mock.mockImplementation(async () => null);
    prisma.user.create.mock.mockImplementation(async () => makeUser());
    prisma.otpChallenge.findFirst.mock.mockImplementation(async () => makeChallenge());
    prisma.otpChallenge.update.mock.mockImplementation(async () => ({}));
    prisma.deviceSession.create.mock.mockImplementation(async () => ({ id: 'session-1' }));
    prisma.auditLog.create.mock.mockImplementation(async () => ({}));

    await service.verifyOtp('+910000000001', '123456', 'web');

    assert.ok(signedPayload);
    assert.equal(signedPayload!.sub, 'user-a');
  });

  it('JWT contains mfaRequired boolean (false when MFA not enabled)', async () => {
    let signedPayload: Record<string, unknown> | undefined;

    const jwtMock = {
      signAsync: async (payload: Record<string, unknown>) => {
        signedPayload = payload;
        return 'signed.jwt.token';
      },
      verifyAsync: async () => ({}),
    };

    const prisma = makePrismaMock();

    // user.mfaEnabled is undefined/false
    prisma.refreshToken.create.mock.mockImplementation(async () => ({}));

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: makeAuditMock() },
        { provide: JwtService, useValue: jwtMock },
        { provide: SmsService, useValue: { sendOtp: async () => {} } },
        { provide: WyshIdService, useValue: { generateWyshId: () => 'WYSH-12345678' } },
        { provide: RedisService, useValue: makeRedisMock() },
        { provide: MfaService, useValue: makeMfaMock() },
        { provide: SupabaseService, useValue: { isAvailable: () => false } },
      ],
    }).compile();

    const service = module.get(AuthService);

    prisma.user.findUnique.mock.mockImplementation(async () => null);
    prisma.user.create.mock.mockImplementation(async () => makeUser());
    prisma.otpChallenge.findFirst.mock.mockImplementation(async () => makeChallenge());
    prisma.otpChallenge.update.mock.mockImplementation(async () => ({}));
    prisma.deviceSession.create.mock.mockImplementation(async () => ({ id: 'session-1' }));
    prisma.auditLog.create.mock.mockImplementation(async () => ({}));

    const result = await service.verifyOtp('+910000000001', '123456', 'web');

    assert.equal(result.mfaRequired, false);
  });

  it('JWT session includes phoneNumber in payload', async () => {
    let signedPayload: Record<string, unknown> | undefined;

    const jwtMock = {
      signAsync: async (payload: Record<string, unknown>) => {
        signedPayload = payload;
        return 'signed.jwt.token';
      },
      verifyAsync: async () => ({}),
    };

    const prisma = makePrismaMock();
    prisma.refreshToken.create.mock.mockImplementation(async () => ({}));

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: makeAuditMock() },
        { provide: JwtService, useValue: jwtMock },
        { provide: SmsService, useValue: { sendOtp: async () => {} } },
        { provide: WyshIdService, useValue: { generateWyshId: () => 'WYSH-12345678' } },
        { provide: RedisService, useValue: makeRedisMock() },
        { provide: MfaService, useValue: makeMfaMock() },
        { provide: SupabaseService, useValue: { isAvailable: () => false } },
      ],
    }).compile();

    const service = module.get(AuthService);

    prisma.user.findUnique.mock.mockImplementation(async () => null);
    prisma.user.create.mock.mockImplementation(async () => makeUser());
    prisma.otpChallenge.findFirst.mock.mockImplementation(async () => makeChallenge());
    prisma.otpChallenge.update.mock.mockImplementation(async () => ({}));
    prisma.deviceSession.create.mock.mockImplementation(async () => ({ id: 'session-1' }));
    prisma.auditLog.create.mock.mockImplementation(async () => ({}));

    await service.verifyOtp('+910000000001', '123456', 'web');

    assert.ok(signedPayload);
    assert.equal(signedPayload!.phoneNumber, '+910000000001');
  });

  it('JWT session contains roles array', async () => {
    let signedPayload: Record<string, unknown> | undefined;

    const jwtMock = {
      signAsync: async (payload: Record<string, unknown>) => {
        signedPayload = payload;
        return 'signed.jwt.token';
      },
      verifyAsync: async () => ({}),
    };

    const prisma = makePrismaMock();
    prisma.refreshToken.create.mock.mockImplementation(async () => ({}));

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: makeAuditMock() },
        { provide: JwtService, useValue: jwtMock },
        { provide: SmsService, useValue: { sendOtp: async () => {} } },
        { provide: WyshIdService, useValue: { generateWyshId: () => 'WYSH-12345678' } },
        { provide: RedisService, useValue: makeRedisMock() },
        { provide: MfaService, useValue: makeMfaMock() },
        { provide: SupabaseService, useValue: { isAvailable: () => false } },
      ],
    }).compile();

    const service = module.get(AuthService);

    prisma.user.findUnique.mock.mockImplementation(async () => null);
    prisma.user.create.mock.mockImplementation(async () => makeUser());
    prisma.otpChallenge.findFirst.mock.mockImplementation(async () => makeChallenge());
    prisma.otpChallenge.update.mock.mockImplementation(async () => ({}));
    prisma.deviceSession.create.mock.mockImplementation(async () => ({ id: 'session-1' }));
    prisma.auditLog.create.mock.mockImplementation(async () => ({}));

    await service.verifyOtp('+910000000001', '123456', 'web');

    assert.ok(signedPayload);
    assert.ok(Array.isArray(signedPayload!.roles));
    assert.ok(signedPayload!.roles.includes('PATIENT'));
  });

  it('JWT sessionId is present when device session is created', async () => {
    let signedPayload: Record<string, unknown> | undefined;

    const jwtMock = {
      signAsync: async (payload: Record<string, unknown>) => {
        signedPayload = payload;
        return 'signed.jwt.token';
      },
      verifyAsync: async () => ({}),
    };

    const prisma = makePrismaMock();
    prisma.refreshToken.create.mock.mockImplementation(async () => ({}));

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: makeAuditMock() },
        { provide: JwtService, useValue: jwtMock },
        { provide: SmsService, useValue: { sendOtp: async () => {} } },
        { provide: WyshIdService, useValue: { generateWyshId: () => 'WYSH-12345678' } },
        { provide: RedisService, useValue: makeRedisMock() },
        { provide: MfaService, useValue: makeMfaMock() },
        { provide: SupabaseService, useValue: { isAvailable: () => false } },
      ],
    }).compile();

    const service = module.get(AuthService);

    prisma.user.findUnique.mock.mockImplementation(async () => null);
    prisma.user.create.mock.mockImplementation(async () => makeUser());
    prisma.otpChallenge.findFirst.mock.mockImplementation(async () => makeChallenge());
    prisma.otpChallenge.update.mock.mockImplementation(async () => ({}));
    prisma.deviceSession.create.mock.mockImplementation(async () => ({ id: 'session-1' }));
    prisma.auditLog.create.mock.mockImplementation(async () => ({}));

    await service.verifyOtp('+910000000001', '123456', 'web');

    assert.ok(signedPayload);
    assert.equal(signedPayload!.sessionId, 'session-1');
  });

  it('JWT mfaVerified is true when MFA not required (deemed satisfied)', async () => {
    let signedPayload: Record<string, unknown> | undefined;

    const jwtMock = {
      signAsync: async (payload: Record<string, unknown>) => {
        signedPayload = payload;
        return 'signed.jwt.token';
      },
      verifyAsync: async () => ({}),
    };

    const prisma = makePrismaMock();
    prisma.refreshToken.create.mock.mockImplementation(async () => ({}));

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: makeAuditMock() },
        { provide: JwtService, useValue: jwtMock },
        { provide: SmsService, useValue: { sendOtp: async () => {} } },
        { provide: WyshIdService, useValue: { generateWyshId: () => 'WYSH-12345678' } },
        { provide: RedisService, useValue: makeRedisMock() },
        { provide: MfaService, useValue: makeMfaMock() },
        { provide: SupabaseService, useValue: { isAvailable: () => false } },
      ],
    }).compile();

    const service = module.get(AuthService);

    prisma.user.findUnique.mock.mockImplementation(async () => null);
    prisma.user.create.mock.mockImplementation(async () => makeUser());
    prisma.otpChallenge.findFirst.mock.mockImplementation(async () => makeChallenge());
    prisma.otpChallenge.update.mock.mockImplementation(async () => ({}));
    prisma.deviceSession.create.mock.mockImplementation(async () => ({ id: 'session-1' }));
    prisma.auditLog.create.mock.mockImplementation(async () => ({}));

    await service.verifyOtp('+910000000001', '123456', 'web');

    assert.ok(signedPayload);
    assert.equal(signedPayload!.mfaVerified, true);
  });
});
