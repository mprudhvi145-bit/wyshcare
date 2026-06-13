import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { NHCXService } from '../modules/nhcx/nhcx.service';
import { PrismaService } from '../providers/prisma/prisma.service';
import { AuditLogService } from '../common/services/audit-log.service';

function mockFn() {
  return mock.fn<(...args: any[]) => any>();
}

function makePrismaMock() {
  return {
    insuranceProvider: { findUnique: mockFn() },
    nHCXConfiguration: {
      findUnique: mockFn(),
      upsert: mockFn(),
      findFirst: mockFn(),
    },
    claim: {
      findUnique: mockFn(),
      update: mockFn(),
    },
    nHCXClaimSubmission: {
      findUnique: mockFn(),
      findMany: mockFn(),
      create: mockFn(),
      update: mockFn(),
      count: mockFn(),
    },
    nHCXLog: { create: mockFn() },
  };
}

function makeAuditMock() {
  return { capture: mockFn() };
}

describe('NHCXService — FHIR Stubs', () => {
  describe('checkEligibility', () => {
    it('returns a valid CoverageEligibilityResponse Bundle', async () => {
      const prisma = makePrismaMock() as any;
      const audit = makeAuditMock();
      const svc = new NHCXService(prisma as unknown as PrismaService, audit as unknown as AuditLogService);
      const result = await svc.checkEligibility({
        patientId: 'pat-1',
        patientName: 'Alice',
        insuranceProvider: 'Star Health',
        insuranceId: 'SH-12345',
        purpose: 'validation',
      }) as any;
      assert.equal(result.resourceType, 'Bundle');
      assert.equal(result.type, 'collection');
      assert.ok(result.meta.profile[0].includes('CoverageEligibilityResponseBundle'));
      assert.ok(Array.isArray(result.entry));
      assert.ok(result.entry.length >= 6);
      const responseEntry = result.entry.find((e: any) => e.resource.resourceType === 'CoverageEligibilityResponse');
      assert.ok(responseEntry);
      assert.equal(responseEntry.resource.outcome, 'complete');
      assert.equal(responseEntry.resource.purpose[0], 'validation');
    });

    it('includes CoverageEligibilityRequest, Patient, Organization, Coverage entries', async () => {
      const prisma = makePrismaMock() as any;
      const audit = makeAuditMock();
      const svc = new NHCXService(prisma as unknown as PrismaService, audit as unknown as AuditLogService);
      const result = await svc.checkEligibility({
        patientId: 'pat-1',
        insuranceProvider: 'LIC',
        insuranceId: 'LIC-001',
        purpose: 'benefits',
      }) as any;
      const resourceTypes = result.entry.map((e: any) => e.resource.resourceType);
      assert.ok(resourceTypes.includes('CoverageEligibilityResponse'));
      assert.ok(resourceTypes.includes('CoverageEligibilityRequest'));
      assert.ok(resourceTypes.includes('Patient'));
      assert.ok(resourceTypes.includes('Organization'));
      assert.ok(resourceTypes.includes('Coverage'));
    });
  });

  describe('submitClaim', () => {
    it('returns a valid ClaimResponse Bundle', async () => {
      const prisma = makePrismaMock() as any;
      const audit = makeAuditMock();
      const svc = new NHCXService(prisma as unknown as PrismaService, audit as unknown as AuditLogService);
      const result = await svc.submitClaim({
        use: 'claim',
        patientId: 'pat-1',
        patientName: 'Bob',
        providerId: 'prov-1',
        insurerName: 'ICICI Lombard',
        items: [
          { productOrService: 'consultation', unitPrice: 500, quantity: 1 },
          { productOrService: 'xray', unitPrice: 1500, quantity: 2 },
        ],
      }) as any;
      assert.equal(result.resourceType, 'Bundle');
      assert.equal(result.type, 'collection');
      assert.ok(result.meta.profile[0].includes('ClaimResponseBundle'));
      const claimResponse = result.entry.find((e: any) => e.resource.resourceType === 'ClaimResponse');
      assert.ok(claimResponse);
      assert.equal(claimResponse.resource.outcome, 'queued');
      assert.equal(claimResponse.resource.use, 'claim');
      assert.equal(claimResponse.resource.item.length, 2);
      assert.ok(claimResponse.resource.total[0].amount.value > 0);
    });

    it('includes Claim, Patient, Organization entries', async () => {
      const prisma = makePrismaMock() as any;
      const audit = makeAuditMock();
      const svc = new NHCXService(prisma as unknown as PrismaService, audit as unknown as AuditLogService);
      const result = await svc.submitClaim({
        use: 'preauthorization',
        patientId: 'pat-1',
        providerId: 'prov-1',
        items: [{ productOrService: 'surgery', unitPrice: 50000, quantity: 1 }],
      }) as any;
      const resourceTypes = result.entry.map((e: any) => e.resource.resourceType);
      assert.ok(resourceTypes.includes('ClaimResponse'));
      assert.ok(resourceTypes.includes('Claim'));
      assert.ok(resourceTypes.includes('Patient'));
      assert.ok(resourceTypes.includes('Organization'));
    });
  });

  describe('checkClaimStatus', () => {
    it('returns a Task Bundle with in-progress status', async () => {
      const prisma = makePrismaMock() as any;
      const audit = makeAuditMock();
      const svc = new NHCXService(prisma as unknown as PrismaService, audit as unknown as AuditLogService);
      const result = await svc.checkClaimStatus('CLM-001') as any;
      assert.equal(result.resourceType, 'Bundle');
      assert.ok(result.meta.profile[0].includes('TaskBundle'));
      const task = result.entry.find((e: any) => e.resource.resourceType === 'Task');
      assert.ok(task);
      assert.equal(task.resource.status, 'in-progress');
      assert.ok(task.resource.input.some((i: any) => i.type.coding[0].code === 'ClaimNumber'));
    });
  });

  describe('getProviderDetails', () => {
    it('returns an InsurancePlan Bundle', async () => {
      const prisma = makePrismaMock() as any;
      const audit = makeAuditMock();
      const svc = new NHCXService(prisma as unknown as PrismaService, audit as unknown as AuditLogService);
      const result = await svc.getProviderDetails('WYSH-001') as any;
      assert.equal(result.resourceType, 'Bundle');
      assert.ok(result.meta.profile[0].includes('InsurancePlanBundle'));
      const plan = result.entry.find((e: any) => e.resource.resourceType === 'InsurancePlan');
      assert.ok(plan);
      assert.equal(plan.resource.status, 'active');
      assert.ok(plan.resource.coverage.length >= 2);
    });
  });

  describe('reprocessClaim', () => {
    it('returns a Task Bundle with requested status', async () => {
      const prisma = makePrismaMock() as any;
      const audit = makeAuditMock();
      const svc = new NHCXService(prisma as unknown as PrismaService, audit as unknown as AuditLogService);
      const result = await svc.reprocessClaim('CLM-001', 'Duplicate entry') as any;
      assert.equal(result.resourceType, 'Bundle');
      assert.ok(result.meta.profile[0].includes('TaskBundle'));
      const task = result.entry.find((e: any) => e.resource.resourceType === 'Task');
      assert.ok(task);
      assert.equal(task.resource.status, 'requested');
      assert.ok(task.resource.input.some((i: any) => i.type.coding[0].code === 'Reason'));
    });
  });
});

describe('NHCXService — configure / getConfiguration', () => {
  it('configure upserts NHCX configuration', async () => {
    const prisma = makePrismaMock() as any;
    prisma.insuranceProvider.findUnique.mock.mockImplementation(async () => ({ id: 'prov-1', name: 'Star Health' }));
    prisma.nHCXConfiguration.upsert.mock.mockImplementation(async (args: any) => ({
      id: 'config-1',
      ...args.create,
      clientSecret: '[REDACTED]',
    }));
    const audit = makeAuditMock();
    const svc = new NHCXService(prisma as unknown as PrismaService, audit as unknown as AuditLogService);
    const result = await svc.configure({
      providerId: 'prov-1',
      insurerId: 'INS-001',
      apiEndpoint: 'https://nhcx.example.com/api',
      clientId: 'client-1',
      clientSecret: 'secret-1',
    });
    assert.equal(result.providerId, 'prov-1');
    assert.equal(audit.capture.mock.calls.length, 1);
  });

  it('configure throws when provider not found', async () => {
    const prisma = makePrismaMock() as any;
    prisma.insuranceProvider.findUnique.mock.mockImplementation(async () => null);
    const audit = makeAuditMock();
    const svc = new NHCXService(prisma as unknown as PrismaService, audit as unknown as AuditLogService);
    await assert.rejects(
      () => svc.configure({ providerId: 'nonexistent', insurerId: '', apiEndpoint: '', clientId: '', clientSecret: '' }),
      NotFoundException,
    );
  });

  it('getConfiguration returns config with redacted secret', async () => {
    const prisma = makePrismaMock() as any;
    prisma.nHCXConfiguration.findUnique.mock.mockImplementation(async () => ({
      id: 'config-1',
      providerId: 'prov-1',
      clientSecret: 'super-secret',
    }));
    const audit = makeAuditMock();
    const svc = new NHCXService(prisma as unknown as PrismaService, audit as unknown as AuditLogService);
    const result = await svc.getConfiguration('prov-1') as any;
    assert.equal(result.clientSecret, '[REDACTED]');
  });

  it('getConfiguration throws when not configured', async () => {
    const prisma = makePrismaMock() as any;
    prisma.nHCXConfiguration.findUnique.mock.mockImplementation(async () => null);
    const audit = makeAuditMock();
    const svc = new NHCXService(prisma as unknown as PrismaService, audit as unknown as AuditLogService);
    await assert.rejects(
      () => svc.getConfiguration('nonexistent'),
      NotFoundException,
    );
  });
});

describe('NHCXService — submitClaimDb', () => {
  it('submits a claim via NHCX gateway', async () => {
    const prisma = makePrismaMock() as any;
    prisma.claim.findUnique.mock.mockImplementation(async () => ({
      id: 'claim-1',
      claimNumber: 'CLM-001',
      status: 'SUBMITTED',
      claimedAmount: 15000,
      clinicId: 'clinic-1',
      createdAt: new Date(),
      ClaimLineItem: [{ description: 'Consultation', claimedAmount: 500, category: 'consultation' }],
      InsurancePolicy: {
        User: { wyshId: 'WYSH-0001' },
        InsurancePlan: {
          InsuranceProvider: {
            NHCXConfiguration: {
              isActive: true,
              insurerId: 'INS-001',
              apiEndpoint: 'https://nhcx.example.com',
              clientId: 'c',
              clientSecret: 's',
            },
          },
        },
      },
    }));
    prisma.nHCXClaimSubmission.create.mock.mockImplementation(async () => ({
      id: 'sub-1',
      submissionRef: 'NHCX-REF-001',
    }));
    prisma.claim.update.mock.mockImplementation(async () => ({}));
    prisma.nHCXLog.create.mock.mockImplementation(async () => ({}));

    const audit = makeAuditMock();
    const svc = new NHCXService(prisma as unknown as PrismaService, audit as unknown as AuditLogService);
    const result = await svc.submitClaimDb('claim-1');
    assert.ok(result.submissionRef);
    assert.equal(result.status, 'SUBMITTED');
  });

  it('throws when claim not found', async () => {
    const prisma = makePrismaMock() as any;
    prisma.claim.findUnique.mock.mockImplementation(async () => null);
    const audit = makeAuditMock();
    const svc = new NHCXService(prisma as unknown as PrismaService, audit as unknown as AuditLogService);
    await assert.rejects(() => svc.submitClaimDb('nonexistent'), NotFoundException);
  });

  it('throws when claim not in SUBMITTED status', async () => {
    const prisma = makePrismaMock() as any;
    prisma.claim.findUnique.mock.mockImplementation(async () => ({
      id: 'claim-1',
      status: 'DRAFT',
      InsurancePolicy: { User: {}, InsurancePlan: { InsuranceProvider: {} } },
    }));
    const audit = makeAuditMock();
    const svc = new NHCXService(prisma as unknown as PrismaService, audit as unknown as AuditLogService);
    await assert.rejects(() => svc.submitClaimDb('claim-1'), BadRequestException);
  });
});

describe('NHCXService — acknowledgeSubmission', () => {
  it('acknowledges accepted submission and updates claim to APPROVED', async () => {
    const prisma = makePrismaMock() as any;
    prisma.nHCXClaimSubmission.findUnique.mock.mockImplementation(async () => ({
      id: 'sub-1',
      claimId: 'claim-1',
      Claim: { claimedAmount: 15000 },
    }));
    prisma.nHCXClaimSubmission.update.mock.mockImplementation(async () => ({}));
    prisma.nHCXLog.create.mock.mockImplementation(async () => ({}));
    prisma.claim.update.mock.mockImplementation(async () => ({}));

    const audit = makeAuditMock();
    const svc = new NHCXService(prisma as unknown as PrismaService, audit as unknown as AuditLogService);
    const result = await svc.acknowledgeSubmission('sub-1', 'ACCEPTED');
    assert.equal(result.claimStatus, 'APPROVED');
  });

  it('acknowledges rejected submission and updates claim to DENIED', async () => {
    const prisma = makePrismaMock() as any;
    prisma.nHCXClaimSubmission.findUnique.mock.mockImplementation(async () => ({
      id: 'sub-1',
      claimId: 'claim-1',
      Claim: { claimedAmount: 15000 },
    }));
    prisma.nHCXClaimSubmission.update.mock.mockImplementation(async () => ({}));
    prisma.nHCXLog.create.mock.mockImplementation(async () => ({}));
    prisma.claim.update.mock.mockImplementation(async () => ({}));

    const audit = makeAuditMock();
    const svc = new NHCXService(prisma as unknown as PrismaService, audit as unknown as AuditLogService);
    const result = await svc.acknowledgeSubmission('sub-1', 'REJECTED', 'Invalid docs');
    assert.equal(result.claimStatus, 'DENIED');
    assert.equal(result.notes, 'Invalid docs');
  });

  it('throws when submission not found', async () => {
    const prisma = makePrismaMock() as any;
    prisma.nHCXClaimSubmission.findUnique.mock.mockImplementation(async () => null);
    const audit = makeAuditMock();
    const svc = new NHCXService(prisma as unknown as PrismaService, audit as unknown as AuditLogService);
    await assert.rejects(() => svc.acknowledgeSubmission('nonexistent', 'ACCEPTED'), NotFoundException);
  });
});

describe('NHCXService — syncStatus / getStats / getSubmissions', () => {
  it('syncStatus syncs with NHCX and updates submission', async () => {
    const prisma = makePrismaMock() as any;
    prisma.nHCXClaimSubmission.findUnique.mock.mockImplementation(async () => ({
      id: 'sub-1',
      submissionRef: 'NHCX-REF-001',
      submittedAt: new Date(Date.now() - 25 * 3600000),
      Claim: { id: 'claim-1' },
    }));
    prisma.nHCXClaimSubmission.update.mock.mockImplementation(async () => ({}));
    prisma.nHCXLog.create.mock.mockImplementation(async () => ({}));

    const audit = makeAuditMock();
    const svc = new NHCXService(prisma as unknown as PrismaService, audit as unknown as AuditLogService);
    const result = await svc.syncStatus('sub-1');
    assert.ok(result.syncedAt);
    assert.equal(result.submissionId, 'sub-1');
  });

  it('getStats returns aggregated stats', async () => {
    const prisma = makePrismaMock() as any;
    prisma.nHCXClaimSubmission.count.mock.mockImplementation(async () => 10);
    prisma.nHCXClaimSubmission.findMany.mock.mockImplementation(async () => [
      { status: 'ACCEPTED' },
      { status: 'ACCEPTED' },
      { status: 'REJECTED' },
      { status: 'PENDING' },
    ]);
    const audit = makeAuditMock();
    const svc = new NHCXService(prisma as unknown as PrismaService, audit as unknown as AuditLogService);
    const stats = await svc.getStats();
    assert.equal(stats.totalClaimsSent, 10);
    assert.equal(stats.successRate, 20);
    assert.equal(stats.failureRate, 10);
    assert.equal(stats.byStatus.ACCEPTED, 2);
    assert.equal(stats.byStatus.ACCEPTED, 2);
  });

  it('getSubmissions returns submissions with claim and log info', async () => {
    const prisma = makePrismaMock() as any;
    prisma.nHCXClaimSubmission.findMany.mock.mockImplementation(async () => [
      {
        id: 'sub-1',
        submissionRef: 'REF-1',
        status: 'ACCEPTED',
        Claim: { claimNumber: 'CLM-001', claimedAmount: 10000, status: 'APPROVED' },
        NHCXLog: [],
      },
    ]);
    const audit = makeAuditMock();
    const svc = new NHCXService(prisma as unknown as PrismaService, audit as unknown as AuditLogService);
    const subs = await svc.getSubmissions({ status: 'ACCEPTED', limit: 10 });
    assert.equal(subs.length, 1);
    assert.equal(subs[0]!.claim.claimNumber, 'CLM-001');
  });
});
