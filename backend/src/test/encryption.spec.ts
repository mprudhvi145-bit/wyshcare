import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { EncryptionService } from '../common/encryption/encryption.service';
import { FieldEncryptionService } from '../common/encryption/field-encryption.service';
import { ConfigService } from '@nestjs/config';

function makeConfig(overrides: Record<string, any> = {}) {
  const store: Record<string, any> = {
    MASTER_ENCRYPTION_KEY: 'adbe6a2dc943ecc3c9acd80655276507984379c05c18643f9bc9fde2164403e2',
    ENCRYPTION_KEY_ROTATION_DAYS: 90,
    ...overrides,
  };
  return {
    getOrThrow: (key: string) => {
      if (!(key in store)) throw new Error(`Missing config: ${key}`);
      return store[key];
    },
    get: (key: string, fallback?: any) => store[key] ?? fallback,
  };
}

describe('EncryptionService', () => {
  describe('encrypt / decrypt round-trip', () => {
    it('encrypts and decrypts a simple string', () => {
      const config = makeConfig() as any;
      const svc = new EncryptionService(config);
      const plaintext = 'Hello WyshCare';
      const encrypted = svc.encrypt(plaintext);
      assert.notEqual(encrypted, plaintext);
      const decrypted = svc.decrypt(encrypted);
      assert.equal(decrypted, plaintext);
    });

    it('encrypts and decrypts with context derivation', () => {
      const config = makeConfig() as any;
      const svc = new EncryptionService(config);
      const plaintext = 'sensitive-health-data';
      const ctx = 'User:fullName';
      const encrypted = svc.encrypt(plaintext, ctx);
      const decrypted = svc.decrypt(encrypted, ctx);
      assert.equal(decrypted, plaintext);
    });

    it('produces different ciphertexts for same plaintext (random IV)', () => {
      const config = makeConfig() as any;
      const svc = new EncryptionService(config);
      const plaintext = 'repeated-value';
      const e1 = svc.encrypt(plaintext);
      const e2 = svc.encrypt(plaintext);
      assert.notEqual(e1, e2);
    });

    it('decrypt with wrong context throws', () => {
      const config = makeConfig() as any;
      const svc = new EncryptionService(config);
      const encrypted = svc.encrypt('secret', 'correct-context');
      assert.throws(() => svc.decrypt(encrypted, 'wrong-context'));
    });

    it('decrypt with tampered payload throws', () => {
      const config = makeConfig() as any;
      const svc = new EncryptionService(config);
      const encrypted = svc.encrypt('secret');
      const tampered = encrypted.replace(/^.{4}/, 'AAAA');
      assert.throws(() => svc.decrypt(tampered));
    });

    it('handles empty string', () => {
      const config = makeConfig() as any;
      const svc = new EncryptionService(config);
      const encrypted = svc.encrypt('');
      const decrypted = svc.decrypt(encrypted);
      assert.equal(decrypted, '');
    });

    it('handles Unicode characters', () => {
      const config = makeConfig() as any;
      const svc = new EncryptionService(config);
      const plaintext = 'हिन्दी 中文 español français';
      const encrypted = svc.encrypt(plaintext);
      const decrypted = svc.decrypt(encrypted);
      assert.equal(decrypted, plaintext);
    });
  });

  describe('encryptBuffer / decryptBuffer round-trip', () => {
    it('encrypts and decrypts a buffer', () => {
      const config = makeConfig() as any;
      const svc = new EncryptionService(config);
      const buf = Buffer.from('binary-content');
      const encrypted = svc.encryptBuffer(buf);
      const decrypted = svc.decryptBuffer(encrypted);
      assert.ok(decrypted.equals(buf));
    });

    it('encryptBuffer produces different IV each call', () => {
      const config = makeConfig() as any;
      const svc = new EncryptionService(config);
      const buf = Buffer.from('test');
      const e1 = svc.encryptBuffer(buf);
      const e2 = svc.encryptBuffer(buf);
      assert.notDeepEqual(e1.iv, e2.iv);
    });

    it('decryptBuffer with wrong authTag throws', () => {
      const config = makeConfig() as any;
      const svc = new EncryptionService(config);
      const buf = Buffer.from('test');
      const encrypted = svc.encryptBuffer(buf);
      encrypted.authTag = Buffer.from('0000000000000000');
      assert.throws(() => svc.decryptBuffer(encrypted));
    });
  });

  describe('constructor validation', () => {
    it('throws when MASTER_ENCRYPTION_KEY is not 64 hex chars', () => {
      const bad = makeConfig({ MASTER_ENCRYPTION_KEY: 'tooshort' }) as any;
      assert.throws(() => new EncryptionService(bad), /must be 64 hex/);
    });

    it('throws when MASTER_ENCRYPTION_KEY is missing', () => {
      const missing = {
        getOrThrow: () => { throw new Error('Missing config: MASTER_ENCRYPTION_KEY'); },
        get: () => undefined,
      } as any;
      assert.throws(() => new EncryptionService(missing));
    });
  });

  describe('context derivation', () => {
    it('different contexts produce different ciphertexts for same plaintext', () => {
      const config = makeConfig() as any;
      const svc = new EncryptionService(config);
      const pt = 'same-value';
      const e1 = svc.encrypt(pt, 'ctx-a');
      const e2 = svc.encrypt(pt, 'ctx-b');
      // same plaintext + different context => diff encrypted because PBKDF2 key differs
      assert.notEqual(e1, e2);
    });
  });
});

describe('FieldEncryptionService', () => {
  function makeFieldEncSvc() {
    const config = makeConfig() as any;
    const encSvc = new EncryptionService(config);
    return new FieldEncryptionService(encSvc, config as unknown as ConfigService) as any;
  }

  it('phiFields contains known PHI fields', () => {
    const svc = makeFieldEncSvc();
    assert.ok(svc.phiFields['fullName']);
    assert.ok(svc.phiFields['phoneNumber']);
    assert.ok(svc.phiFields['email']);
    assert.ok(svc.phiFields['aadhaarLast4']);
    assert.ok(svc.phiFields['dateOfBirth']);
    assert.ok(svc.phiFields['registrationNumber']);
    assert.ok(svc.phiFields['storageUrl']);
    assert.ok(svc.phiFields['abhaNumber']);
  });

  it('phiFields does not contain non-PHI fields', () => {
    const svc = makeFieldEncSvc();
    assert.ok(!svc.phiFields['id']);
    assert.ok(!svc.phiFields['createdAt']);
    assert.ok(!svc.phiFields['status']);
  });

  it('phiFields map returns true for PHI fields and false otherwise', () => {
    const svc = makeFieldEncSvc();
    assert.equal(svc.phiFields['fullName'], true);
    assert.equal(svc.phiFields['aadhaarLast4'], true);
    assert.equal(svc.phiFields['id'], undefined);
    assert.equal(svc.phiFields['createdAt'], undefined);
    assert.equal(svc.phiFields['unknownField'], undefined);
  });
});
