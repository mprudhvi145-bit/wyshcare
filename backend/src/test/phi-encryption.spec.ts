import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert/strict';
import {
  PHI_MODELS,
  PHI_FIELD_MAP,
  createEncryptionExtension,
} from '../providers/prisma/prisma-encryption.middleware';

describe('PHI_MODELS', () => {
  it('contains all expected PHI-protected models', () => {
    const expected = [
      'User', 'DoctorProfile', 'HealthRecord', 'Prescription', 'ClinicalNote',
      'ConsultationRecording', 'ConsultationSOAP', 'ConsultationTranscript',
      'HealthInformationTransfer', 'AbhaProfile', 'Allergy', 'Condition',
      'Immunization', 'ProcedureRecord', 'FamilyHistory', 'VitalsRecord',
      'LabResult', 'EmergencyProfile', 'EmergencyContact', 'LifestyleProfile',
      'SymptomEvent', 'Medication', 'PrescriptionItem', 'DiagnosticReport', 'CarePlan',
    ];
    for (const m of expected) {
      assert.ok(PHI_MODELS.has(m), `Missing PHI model: ${m}`);
    }
    assert.equal(PHI_MODELS.size, expected.length);
  });
});

describe('PHI_FIELD_MAP', () => {
  it('User model has PHI-sensitive fields', () => {
    const fields = PHI_FIELD_MAP.User!;
    assert.ok(fields.includes('fullName'));
    assert.ok(fields.includes('phoneNumber'));
    assert.ok(fields.includes('email'));
    assert.ok(fields.includes('dateOfBirth'));
    assert.ok(fields.includes('aadhaarLast4'));
  });

  it('DoctorProfile has registrationNumber', () => {
    const fields = PHI_FIELD_MAP.DoctorProfile!;
    assert.ok(fields.includes('registrationNumber'));
    assert.ok(fields.includes('primaryPhysician'));
    assert.ok(fields.includes('physicianPhone'));
  });

  it('AbhaProfile has ABHA-specific fields', () => {
    const fields = PHI_FIELD_MAP.AbhaProfile!;
    assert.ok(fields.includes('abhaNumber'));
    assert.ok(fields.includes('abhaAddress'));
    assert.ok(fields.includes('healthIdNumber'));
  });

  it('EmergencyProfile has emergency contact fields', () => {
    const fields = PHI_FIELD_MAP.EmergencyProfile!;
    assert.ok(fields.includes('emergencyNotes'));
    assert.ok(fields.includes('emergencyContactName'));
    assert.ok(fields.includes('emergencyContactPhone'));
  });

  it('every model in PHI_MODELS has an entry in PHI_FIELD_MAP', () => {
    for (const model of PHI_MODELS) {
      assert.ok(
        (PHI_FIELD_MAP[model]?.length ?? 0) > 0,
        `Model ${model} has no PHI fields mapped`,
      );
    }
  });

  it('PHI_FIELD_MAP has no extra entries beyond PHI_MODELS', () => {
    const mapModels = Object.keys(PHI_FIELD_MAP);
    for (const m of mapModels) {
      assert.ok(PHI_MODELS.has(m), `Extra model in PHI_FIELD_MAP: ${m}`);
    }
  });
});

describe('createEncryptionExtension', () => {
  before(() => {
    process.env.MASTER_ENCRYPTION_KEY = 'adbe6a2dc943ecc3c9acd80655276507984379c05c18643f9bc9fde2164403e2';
  });

  after(() => {
    delete process.env.MASTER_ENCRYPTION_KEY;
  });

  it('returns a valid Prisma extension object', () => {
    const ext = createEncryptionExtension();
    assert.equal(ext.name, 'phi-encryption');
    assert.ok(ext.query);
    assert.ok(ext.query.$allModels);
    assert.ok(ext.query.$allModels.$allOperations);
  });

  it('extension skips non-PHI models', async () => {
    const ext = createEncryptionExtension();
    const op = ext.query.$allModels.$allOperations;
    const queryFn = mock.fn(async () => ({ id: '1', name: 'test' }));
    const result = await op({
      model: 'NonPHIModel',
      operation: 'create',
      args: { data: { name: 'test' } },
      query: queryFn,
    });
    assert.deepEqual(result, { id: '1', name: 'test' });
    assert.equal(queryFn.mock.calls.length, 1);
  });

  it('extension encrypts fields on create for PHI models', async () => {
    process.env.MASTER_ENCRYPTION_KEY = 'adbe6a2dc943ecc3c9acd80655276507984379c05c18643f9bc9fde2164403e2';
    const ext = createEncryptionExtension();
    const op = ext.query.$allModels.$allOperations;
    const queryFn = mock.fn(async (args: any) => ({ id: '1', fullName: args.data?.fullName }));
    const result = await op({
      model: 'User',
      operation: 'create',
      args: { data: { fullName: 'John Doe', phoneNumber: '+919000000001' } },
      query: queryFn,
    });
    const passedArgs = queryFn.mock.calls[0]!.arguments[0] as any;
    assert.notEqual(passedArgs.data.fullName, 'John Doe');
    assert.notEqual(passedArgs.data.phoneNumber, '+919000000001');
    assert.equal(typeof passedArgs.data.fullName, 'string');
    assert.ok(passedArgs.data.fullName.length > 10);
  });

  it('extension decrypts fields on find for PHI models', async () => {
    process.env.MASTER_ENCRYPTION_KEY = 'adbe6a2dc943ecc3c9acd80655276507984379c05c18643f9bc9fde2164403e2';
    const ext = createEncryptionExtension();
    const op = ext.query.$allModels.$allOperations;

    const encryptSvc = new (require('../common/encryption/encryption.service').EncryptionService)({
      getOrThrow: () => 'adbe6a2dc943ecc3c9acd80655276507984379c05c18643f9bc9fde2164403e2',
      get: () => undefined,
    });
    const encryptedName = encryptSvc.encrypt('Jane Doe', 'User:fullName');
    const encryptedPhone = encryptSvc.encrypt('+919000000002', 'User:phoneNumber');

    const queryFn = mock.fn(async () => ({
      id: '2',
      fullName: encryptedName,
      phoneNumber: encryptedPhone,
    }));
    const result = await op({
      model: 'User',
      operation: 'findUnique',
      args: { where: { id: '2' } },
      query: queryFn,
    }) as any;
    assert.equal(result.fullName, 'Jane Doe');
    assert.equal(result.phoneNumber, '+919000000002');
  });

  it('decrypt silently keeps already-plaintext fields (no throw)', async () => {
    process.env.MASTER_ENCRYPTION_KEY = 'adbe6a2dc943ecc3c9acd80655276507984379c05c18643f9bc9fde2164403e2';
    const ext = createEncryptionExtension();
    const op = ext.query.$allModels.$allOperations;
    const queryFn = mock.fn(async () => ({
      id: '3',
      fullName: 'Already Plain',
      phoneNumber: '+919000000003',
    }));
    const result = await op({
      model: 'User',
      operation: 'findUnique',
      args: { where: { id: '3' } },
      query: queryFn,
    }) as any;
    assert.equal(result.fullName, 'Already Plain');
    assert.equal(result.phoneNumber, '+919000000003');
  });

  it('extension handles update operation', async () => {
    process.env.MASTER_ENCRYPTION_KEY = 'adbe6a2dc943ecc3c9acd80655276507984379c05c18643f9bc9fde2164403e2';
    const ext = createEncryptionExtension();
    const op = ext.query.$allModels.$allOperations;
    const queryFn = mock.fn(async (args: any) => ({ id: '1', ...args.data }));
    const result = await op({
      model: 'User',
      operation: 'update',
      args: { where: { id: '1' }, data: { email: 'test@example.com' } },
      query: queryFn,
    }) as any;
    const passedArgs = queryFn.mock.calls[0]!.arguments[0] as any;
    assert.notEqual(passedArgs.data.email, 'test@example.com');
  });

  it('extension handles upsert — encrypts create and update', async () => {
    process.env.MASTER_ENCRYPTION_KEY = 'adbe6a2dc943ecc3c9acd80655276507984379c05c18643f9bc9fde2164403e2';
    const ext = createEncryptionExtension();
    const op = ext.query.$allModels.$allOperations;
    const queryFn = mock.fn(async () => ({ id: '1' }));
    await op({
      model: 'User',
      operation: 'upsert',
      args: {
        where: { id: '1' },
        create: { fullName: 'New User', phoneNumber: '+919000000001' },
        update: { fullName: 'Updated User' },
      },
      query: queryFn,
    });
    const calls = queryFn.mock.calls as unknown as [{ arguments: [any] }];
    const passedArgs = calls[0]!.arguments[0] as any;
    assert.notEqual(passedArgs.create.fullName, 'New User');
    assert.notEqual(passedArgs.update.fullName, 'Updated User');
  });

  it('extension handles createMany — encrypts each item', async () => {
    process.env.MASTER_ENCRYPTION_KEY = 'adbe6a2dc943ecc3c9acd80655276507984379c05c18643f9bc9fde2164403e2';
    const ext = createEncryptionExtension();
    const op = ext.query.$allModels.$allOperations;
    const queryFn = mock.fn(async () => [{ id: '1' }, { id: '2' }]);
    await op({
      model: 'User',
      operation: 'createMany',
      args: {
        data: [
          { fullName: 'User One', phoneNumber: '+910000000001' },
          { fullName: 'User Two', phoneNumber: '+910000000002' },
        ],
      },
      query: queryFn,
    });
    const calls = queryFn.mock.calls as unknown as [{ arguments: [any] }];
    const passedArgs = calls[0]!.arguments[0] as any;
    assert.notEqual(passedArgs.data[0].fullName, 'User One');
    assert.notEqual(passedArgs.data[1].fullName, 'User Two');
  });
});
