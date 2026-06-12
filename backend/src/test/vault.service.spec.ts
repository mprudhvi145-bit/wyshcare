/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/test/vault.service.spec.ts
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
 * Test file: validates vault/service
 *
 * Responsibilities:
 * - Execute business logic for testing operations
 * - Coordinate data access and external API calls
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
 - testing
 - node:test
 - strict
 *
 * Dependencies:
 - testing
 - node:test
 - strict
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

import { VaultService } from '../modules/vault/vault.service';
import { PrismaService } from '../providers/prisma/prisma.service';
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

function makeStorageMock() {
  return {
    buildObjectKey: (_userId: string, name: string) => `uploads/${name}`,
    saveObject: async () => {},
    loadObject: async () => Buffer.from('data'),
    deleteObject: async () => {},
    getDownloadUrl: async () => 'https://storage.example.com/signed-url',
    assertValidDownload: () => {},
    scanObject: async () => {},
  };
}

async function buildVault(prisma: ReturnType<typeof makePrismaMock>) {
  const module = await Test.createTestingModule({
    providers: [
      VaultService,
      { provide: PrismaService, useValue: prisma },
      { provide: StorageService, useValue: makeStorageMock() },
      { provide: AuditLogService, useValue: makeAuditMock() },
      { provide: EncryptionService, useValue: makeEncryptionMock() },
    ],
  }).compile();
  return module.get(VaultService);
}

describe('VaultService', () => {
  describe('createRecord', () => {
    it('creates a health record and a timeline event', async () => {
      const prisma = makePrismaMock();
      const record = makeRecord();
      prisma.healthRecord.create.mock.mockImplementation(async () => record);
      prisma.timelineEvent.create.mock.mockImplementation(async () => ({}));

      const vault = await buildVault(prisma);
      const result = await vault.createRecord('user-a', {
        title: 'Blood Test',
        recordType: 'DIAGNOSTIC_REPORT',
      });

      assert.equal(result.id, 'record-1');
      assert.equal(prisma.healthRecord.create.mock.calls.length, 1);
      assert.equal(prisma.timelineEvent.create.mock.calls.length, 1);
    });

    it('scopes the created record to the requesting user', async () => {
      const prisma = makePrismaMock();
      prisma.healthRecord.create.mock.mockImplementation(async () => makeRecord());
      prisma.timelineEvent.create.mock.mockImplementation(async () => ({}));

      const vault = await buildVault(prisma);
      await vault.createRecord('user-a', { title: 'Test', recordType: 'DIAGNOSTIC_REPORT' });

      const createArgs = prisma.healthRecord.create.mock.calls[0]!.arguments[0] as {
        data: { userId: string };
      };
      assert.equal(createArgs.data.userId, 'user-a');
    });
  });

  describe('list', () => {
    it('returns only non-deleted records for the user', async () => {
      const prisma = makePrismaMock();
      prisma.healthRecord.findMany.mock.mockImplementation(async () => [makeRecord()]);

      const vault = await buildVault(prisma);
      await vault.list('user-a');

      const args = prisma.healthRecord.findMany.mock.calls[0]!.arguments[0] as {
        where: { userId: string; deletedAt: null };
      };
      assert.equal(args.where.userId, 'user-a');
      assert.equal(args.where.deletedAt, null);
    });
  });

  describe('uploadRecord', () => {
    it('rejects unsupported MIME type', async () => {
      const prisma = makePrismaMock();
      const vault = await buildVault(prisma);

      await assert.rejects(
        () =>
          vault.uploadRecord(
            'user-a',
            { originalname: 'test.exe', mimetype: 'application/x-msdownload', size: 100, buffer: Buffer.from('x') },
            { recordType: 'DIAGNOSTIC_REPORT' },
          ),
        (err: Error) => {
          assert.match(err.message, /Unsupported upload type/);
          return true;
        },
      );
    });

    it('rejects file exceeding max size', async () => {
      const oldMax = process.env.MAX_UPLOAD_BYTES;
      process.env.MAX_UPLOAD_BYTES = '10485760'; // Force 10MB limit for test
      try {
        const prisma = makePrismaMock();
        const vault = await buildVault(prisma);
        const bigBuffer = Buffer.alloc(11 * 1024 * 1024); // 11 MB > 10 MB

        await assert.rejects(
          () =>
            vault.uploadRecord(
              'user-a',
              { originalname: 'big.pdf', mimetype: 'application/pdf', size: bigBuffer.length, buffer: bigBuffer },
              { recordType: 'DIAGNOSTIC_REPORT' },
            ),
          (err: Error) => {
            assert.match(err.message, /exceeds max size/);
            return true;
          },
        );
      } finally {
        process.env.MAX_UPLOAD_BYTES = oldMax;
      }
    });

    it('rejects empty buffer', async () => {
      const prisma = makePrismaMock();
      const vault = await buildVault(prisma);

      await assert.rejects(
        () =>
          vault.uploadRecord(
            'user-a',
            { originalname: 'empty.pdf', mimetype: 'application/pdf', size: 0, buffer: Buffer.alloc(0) },
            { recordType: 'DIAGNOSTIC_REPORT' },
          ),
        (err: Error) => {
          assert.match(err.message, /No upload file/);
          return true;
        },
      );
    });

    it('saves file and creates record + timeline event on success', async () => {
      const prisma = makePrismaMock();
      const record = makeRecord({ mimeType: 'application/pdf' });
      prisma.healthRecord.create.mock.mockImplementation(async () => record);
      prisma.timelineEvent.create.mock.mockImplementation(async () => ({}));

      const vault = await buildVault(prisma);
      const result = await vault.uploadRecord(
        'user-a',
        {
          originalname: 'report.pdf',
          mimetype: 'application/pdf',
          size: 1024,
          buffer: Buffer.from('pdf content'),
        },
        { recordType: 'DIAGNOSTIC_REPORT' },
      );

      assert.equal(result.id, 'record-1');
      assert.equal(prisma.healthRecord.create.mock.calls.length, 1);
      assert.equal(prisma.timelineEvent.create.mock.calls.length, 1);
    });

    it('deletes storage object if DB create fails (rollback)', async () => {
      const prisma = makePrismaMock();
      prisma.healthRecord.create.mock.mockImplementation(async () => {
        throw new Error('DB error');
      });

      let deleted = false;
      const storage = {
        ...makeStorageMock(),
        deleteObject: async () => { deleted = true; },
      };

      const module = await Test.createTestingModule({
        providers: [
          VaultService,
          { provide: PrismaService, useValue: prisma },
          { provide: StorageService, useValue: storage },
          { provide: AuditLogService, useValue: makeAuditMock() },
          { provide: EncryptionService, useValue: makeEncryptionMock() },
        ],
      }).compile();
      const vault = module.get(VaultService);

      await assert.rejects(
        () =>
          vault.uploadRecord(
            'user-a',
            { originalname: 'report.pdf', mimetype: 'application/pdf', size: 100, buffer: Buffer.from('x') },
            { recordType: 'DIAGNOSTIC_REPORT' },
          ),
        Error,
      );
      assert.equal(deleted, true, 'storage object should be deleted on DB failure');
    });
  });

  describe('getDownloadLink', () => {
    it('returns signed URL for record owner', async () => {
      const prisma = makePrismaMock();
      prisma.healthRecord.findFirstOrThrow.mock.mockImplementation(async () =>
        makeRecord({ storageKey: 'user-a/blood-test.json' }),
      );

      const vault = await buildVault(prisma);
      const result = await vault.getDownloadLink('user-a', 'record-1');

      assert.ok(result.url);
      assert.equal(result.expiresIn, 300);
    });

    it('throws when record has no storage key', async () => {
      const prisma = makePrismaMock();
      prisma.healthRecord.findFirstOrThrow.mock.mockImplementation(async () =>
        makeRecord({ storageKey: null }),
      );

      const vault = await buildVault(prisma);
      await assert.rejects(
        () => vault.getDownloadLink('user-a', 'record-1'),
        (err: Error) => {
          assert.match(err.message, /no stored file/);
          return true;
        },
      );
    });

    it('WHERE clause binds userId — unauthorized user gets not-found', async () => {
      const prisma = makePrismaMock();
      prisma.healthRecord.findFirstOrThrow.mock.mockImplementation(async () => {
        throw new Error('Not found');
      });

      const vault = await buildVault(prisma);
      await assert.rejects(
        () => vault.getDownloadLink('user-b', 'record-owned-by-user-a'),
        Error,
      );

      const args = prisma.healthRecord.findFirstOrThrow.mock.calls[0]!.arguments[0] as {
        where: { userId: string; id: string };
      };
      assert.equal(args.where.userId, 'user-b');
    });
  });
});
