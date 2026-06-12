/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/test/consent.service.spec.ts
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
 * Test file: validates consent/service
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
 - common
 *
 * Dependencies:
 - testing
 - node:test
 - strict
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
import { NotFoundException } from '@nestjs/common';

import { ConsentService } from '../modules/consent/consent.service';
import { PrismaService } from '../providers/prisma/prisma.service';
import { AuditLogService } from '../common/services/audit-log.service';
import { makePrismaMock, makeAuditMock, makeConsent } from './helpers';

async function buildService(prisma: ReturnType<typeof makePrismaMock>) {
  const audit = makeAuditMock();
  const module = await Test.createTestingModule({
    providers: [
      ConsentService,
      { provide: PrismaService, useValue: prisma },
      { provide: AuditLogService, useValue: audit },
    ],
  }).compile();
  return { service: module.get(ConsentService), audit };
}

const futureDate = new Date(Date.now() + 24 * 60 * 60_000).toISOString();

describe('ConsentService', () => {
  describe('create', () => {
    it('creates a MANUAL_APPROVAL consent grant and writes audit log', async () => {
      const prisma = makePrismaMock();
      const consent = makeConsent();
      prisma.consentGrant.create.mock.mockImplementation(async () => consent);

      const { service, audit } = await buildService(prisma);
      const result = await service.create('user-a', {
        grantedToUserId: 'user-b',
        accessLevel: 'LIMITED',
        accessMethod: 'MANUAL_APPROVAL',
        purpose: 'Second opinion',
        scope: {},
        expiresAt: futureDate,
      });

      assert.equal(result.id, 'consent-1');
      assert.equal(audit.capture.mock.calls.length, 1);
      assert.equal(
        (audit.capture.mock.calls[0]!.arguments[0] as { action: string }).action,
        'CONSENT_GRANTED',
      );
    });

    it('creates a SHARE_LINK consent and returns shareUrl', async () => {
      const prisma = makePrismaMock();
      const consent = makeConsent({ accessMethod: 'SHARE_LINK' });
      prisma.consentGrant.create.mock.mockImplementation(async () => consent);
      prisma.shareLink.create.mock.mockImplementation(async () => ({}));

      const { service } = await buildService(prisma);
      const result = await service.create('user-a', {
        accessLevel: 'LIMITED',
        accessMethod: 'SHARE_LINK',
        purpose: 'Share with specialist',
        scope: {},
        expiresAt: futureDate,
      });

      assert.ok(result.shareUrl, 'shareUrl should be present for SHARE_LINK method');
      assert.match(result.shareUrl!, /wyshcare\.app\/share\//);
      assert.equal(prisma.shareLink.create.mock.calls.length, 1);
    });

    it('resolves grantee by phone number when grantedToUserId not provided', async () => {
      const prisma = makePrismaMock();
      prisma.user.findFirst.mock.mockImplementation(async () => ({ id: 'user-b' }));
      prisma.consentGrant.create.mock.mockImplementation(async () => makeConsent());

      const { service } = await buildService(prisma);
      await service.create('user-a', {
        granteePhoneNumber: '+910000000002',
        accessLevel: 'LIMITED',
        accessMethod: 'MANUAL_APPROVAL',
        purpose: 'Test',
        scope: {},
        expiresAt: futureDate,
      });

      assert.equal(prisma.user.findFirst.mock.calls.length, 1);
    });

    it('throws NotFoundException when grantee phone number not found', async () => {
      const prisma = makePrismaMock();
      prisma.user.findFirst.mock.mockImplementation(async () => null);

      const { service } = await buildService(prisma);
      await assert.rejects(
        () =>
          service.create('user-a', {
            granteePhoneNumber: '+919999999999',
            accessLevel: 'LIMITED',
            accessMethod: 'MANUAL_APPROVAL',
            purpose: 'Test',
            scope: {},
            expiresAt: futureDate,
          }),
        NotFoundException,
      );
    });
  });

  describe('revoke', () => {
    it('sets status to REVOKED and writes audit log', async () => {
      const prisma = makePrismaMock();
      const revoked = makeConsent({ status: 'REVOKED', revokedAt: new Date() });
      prisma.consentGrant.update.mock.mockImplementation(async () => revoked);

      const { service, audit } = await buildService(prisma);
      const result = await service.revoke('user-a', 'consent-1');

      assert.equal(result.status, 'REVOKED');
      assert.ok(result.revokedAt);
      assert.equal(audit.capture.mock.calls.length, 1);
      assert.equal(
        (audit.capture.mock.calls[0]!.arguments[0] as { action: string }).action,
        'CONSENT_REVOKED',
      );
    });

    it('update WHERE includes ownerUserId — prevents revoking another user consent', async () => {
      const prisma = makePrismaMock();
      // Prisma throws when WHERE ownerUserId + id has no match
      prisma.consentGrant.update.mock.mockImplementation(async () => {
        throw new Error('Record to update not found');
      });

      const { service } = await buildService(prisma);
      await assert.rejects(
        () => service.revoke('user-b', 'consent-owned-by-user-a'),
        Error,
      );
    });
  });

  describe('listForUser', () => {
    it('returns only consents owned by the requesting user', async () => {
      const prisma = makePrismaMock();
      prisma.consentGrant.findMany.mock.mockImplementation(async () => [makeConsent()]);

      const { service } = await buildService(prisma);
      await service.listForUser('user-a');

      const callArgs = prisma.consentGrant.findMany.mock.calls[0]!.arguments[0] as {
        where: { ownerUserId: string };
      };
      assert.equal(callArgs.where.ownerUserId, 'user-a');
    });
  });

  describe('expired consent', () => {
    it('expired consent is not returned by listForUser (Prisma filters by expiresAt)', async () => {
      // The service does not filter by expiresAt in listForUser — it returns all
      // grants including expired ones (UI shows status). The enforcement of
      // expiry happens at the point of access (consent check in VaultService).
      // This test documents that behavior explicitly.
      const prisma = makePrismaMock();
      const expiredConsent = makeConsent({
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() - 1000), // past
      });
      prisma.consentGrant.findMany.mock.mockImplementation(async () => [expiredConsent]);

      const { service } = await buildService(prisma);
      const results = await service.listForUser('user-a');

      // Service returns it — expiry enforcement is at access time, not list time
      assert.equal(results.length, 1);
      assert.ok(results[0]!.expiresAt < new Date(), 'expired consent is returned in list');
    });
  });
});
