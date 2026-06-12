/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/test/e2e/insurance.e2e-spec.ts
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
 * insurance.e2e-spec — Insurance module
 *
 * Responsibilities:
 * - Support insurance functionality
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
Insurance
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

import { bootstrapE2e, teardownE2e, cleanDatabase, createTestUser, authHeader, getRequest, getPrisma, API_PREFIX } from './setup';

describe('Insurance + Claims OS E2E', () => {
  let admin: Awaited<ReturnType<typeof createTestUser>>;
  let patient: Awaited<ReturnType<typeof createTestUser>>;
  let clinicId: string;
  let providerId: string;
  let planId: string;
  let policyId: string;

  before(async () => { await bootstrapE2e(); });
  after(async () => { await teardownE2e(); });
  beforeEach(async () => {
    await cleanDatabase();
    const prisma = getPrisma();
    admin = await createTestUser({ role: 'ADMIN', phoneNumber: '+919999990001' });
    patient = await createTestUser({ role: 'PATIENT', phoneNumber: '+919999990002' });
    await createTestUser({ role: 'DOCTOR', phoneNumber: '+919999990003' });

    const clinic = await prisma.clinic.create({
      data: {
        name: 'Insurance Clinic',
        slug: `insurance-clinic-${Date.now()}`,
        phoneNumber: '+919999990099',
        addressLine1: '123 Insurance St',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        timezone: 'Asia/Kolkata',
      },
    });
    clinicId = clinic.id;

    const provider = await prisma.insuranceProvider.create({
      data: { name: 'Star Health', code: 'STAR', type: 'PRIVATE' },
    });
    providerId = provider.id;

    const plan = await prisma.insurancePlan.create({
      data: {
        providerId: provider.id,
        name: 'Star Comprehensive',
        code: 'STAR-COMP',
        maxSumInsured: 500000,
        maxCoveragePercent: 80,
        waitingPeriodDays: 30,
      },
    });
    planId = plan.id;

    await prisma.coverageRule.create({
      data: { planId: plan.id, category: 'CONSULTATION', coveragePercent: 80, requiresPreAuth: false },
    });

    const policy = await prisma.insurancePolicy.create({
      data: {
        userId: patient.user.id,
        planId: plan.id,
        policyNumber: 'POL-001',
        memberId: 'MEM-001',
        startDate: new Date(Date.now() - 86400000 * 30),
        endDate: new Date(Date.now() + 86400000 * 300),
        sumInsured: 500000,
        copayPercent: 20,
        coveragePercent: 80,
      },
    });
    policyId = policy.id;
  });

  // ─── Insurance Network ───

  it('GET /insurance/providers — list providers', async () => {
    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/insurance/providers`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 1);
    assert.equal(data[0].name, 'Star Health');
  });

  it('GET /insurance/providers/:id — get provider', async () => {
    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/insurance/providers/${providerId}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.equal(data.name, 'Star Health');
    assert.ok(Array.isArray(data.plans));
  });

  it('POST /insurance/providers — create provider (admin)', async () => {
    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/insurance/providers`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .send({ name: 'ICICI Lombard', code: 'ICICI', type: 'PRIVATE', phone: '1800-ICICI' })
      .expect(201);

    const data = res.body.data ?? res.body;
    assert.ok(data.id);
    assert.equal(data.name, 'ICICI Lombard');
    assert.equal(data.code, 'ICICI');
  });

  it('GET /insurance/providers/:id/plans — list provider plans', async () => {
    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/insurance/providers/${providerId}/plans`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 1);
    assert.equal(data[0].name, 'Star Comprehensive');
  });

  it('POST /insurance/plans — create plan (admin)', async () => {
    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/insurance/plans`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .send({
        providerId, name: 'Star Basic', code: 'STAR-BASIC',
        maxSumInsured: 200000, maxCoveragePercent: 70,
      })
      .expect(201);

    const data = res.body.data ?? res.body;
    assert.ok(data.id);
    assert.equal(data.name, 'Star Basic');
    assert.equal(data.maxSumInsured, 200000);
  });

  it('GET /insurance/plans/:id — get plan', async () => {
    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/insurance/plans/${planId}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.equal(data.name, 'Star Comprehensive');
    assert.ok(Array.isArray(data.coverageRules));
  });

  // ─── Policies ───

  it('POST /insurance/policies — link policy to patient', async () => {
    const otherPatient = await createTestUser({ role: 'PATIENT', phoneNumber: '+919999990010' });

    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/insurance/policies`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .send({
        userId: otherPatient.user.id,
        planId,
        policyNumber: 'POL-002',
        memberId: 'MEM-002',
        startDate: new Date(Date.now() - 86400000 * 10).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 355).toISOString(),
        sumInsured: 300000,
        copayPercent: 10,
      })
      .expect(201);

    const data = res.body.data ?? res.body;
    assert.ok(data.id);
    assert.equal(data.policyNumber, 'POL-002');
    assert.equal(data.sumInsured, 300000);
    assert.ok(data.plan);
    assert.equal(data.plan.name, 'Star Comprehensive');
  });

  it('GET /insurance/policies — list policies', async () => {
    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/insurance/policies`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .query({ userId: patient.user.id })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 1);
    assert.equal(data[0].policyNumber, 'POL-001');
  });

  it('GET /insurance/policies/:id — get policy details', async () => {
    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/insurance/policies/${policyId}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.equal(data.policyNumber, 'POL-001');
    assert.ok(data.plan);
    assert.ok(Array.isArray(data.plan.coverageRules));
    assert.ok(data.plan.provider);
  });

  it('PATCH /insurance/policies/:id — update policy', async () => {
    const req = getRequest();
    const res = await req.patch(`${API_PREFIX}/insurance/policies/${policyId}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .send({ copayPercent: 15, coveragePercent: 85 })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.equal(data.copayPercent, 15);
    assert.equal(data.coveragePercent, 85);
  });

  // ─── Coverage Rules ───

  it('POST /insurance/coverage-rules — add coverage rule', async () => {
    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/insurance/coverage-rules`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .send({ planId, category: 'MEDICATION', coveragePercent: 70, requiresPreAuth: false })
      .expect(201);

    const data = res.body.data ?? res.body;
    assert.ok(data.id);
    assert.equal(data.category, 'MEDICATION');
    assert.equal(data.coveragePercent, 70);
  });

  it('GET /insurance/coverage-rules/:planId — list rules', async () => {
    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/insurance/coverage-rules/${planId}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 1);
    assert.equal(data[0].category, 'CONSULTATION');
  });

  // ─── Eligibility Engine ───

  it('POST /insurance/eligibility/check — check eligibility', async () => {
    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/insurance/eligibility/check`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .send({ policyId, patientUserId: patient.user.id, category: 'CONSULTATION', amount: 1000 })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.equal(data.eligible, true);
    assert.equal(data.coveragePercent, 80);
    assert.equal(data.copay, 200);
    assert.ok(data.checkId);
    assert.ok(data.expiresAt);
  });

  it('POST /insurance/eligibility/check — rejects expired policy', async () => {
    const prisma = getPrisma();
    const expiredPolicy = await prisma.insurancePolicy.create({
      data: {
        userId: patient.user.id, planId,
        policyNumber: 'POL-EXP', memberId: 'MEM-EXP',
        startDate: new Date(Date.now() - 86400000 * 400),
        endDate: new Date(Date.now() - 86400000 * 30),
        sumInsured: 100000,
      },
    });

    const req = getRequest();
    await req.post(`${API_PREFIX}/insurance/eligibility/check`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .send({ policyId: expiredPolicy.id, patientUserId: patient.user.id })
      .expect(400);
  });

  it('GET /insurance/eligibility/history/:patientUserId — eligibility history', async () => {
    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/insurance/eligibility/history/${patient.user.id}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(Array.isArray(data));
  });

  // ─── Pre-Authorization ───

  it('POST /insurance/pre-auth — create pre-auth request', async () => {
    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/insurance/pre-auth`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .send({
        policyId, clinicId, patientUserId: patient.user.id,
        procedureCode: 'ANGIO', diagnosisCode: 'I25.1',
        requestedAmount: 50000, notes: 'Angiography required',
      })
      .expect(201);

    const data = res.body.data ?? res.body;
    assert.ok(data.id);
    assert.equal(data.status, 'PENDING');
    assert.equal(data.requestedAmount, 50000);
    assert.equal(data.procedureCode, 'ANGIO');
    assert.ok(data.policy);
  });

  it('GET /insurance/pre-auth — list pre-auth requests', async () => {
    const prisma = getPrisma();
    await prisma.preAuthorization.create({
      data: {
        policyId, patientUserId: patient.user.id, requestedAmount: 25000,
        status: 'PENDING', expiresAt: new Date(Date.now() + 30 * 86400000),
      },
    });

    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/insurance/pre-auth`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .query({ patientUserId: patient.user.id })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 1);
  });

  it('PATCH /insurance/pre-auth/:id/respond — approve pre-auth', async () => {
    const prisma = getPrisma();
    const preAuth = await prisma.preAuthorization.create({
      data: {
        policyId, clinicId, patientUserId: patient.user.id,
        requestedAmount: 50000, status: 'PENDING',
        expiresAt: new Date(Date.now() + 30 * 86400000),
      },
    });

    const req = getRequest();
    const res = await req.patch(`${API_PREFIX}/insurance/pre-auth/${preAuth.id}/respond`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .send({ status: 'APPROVED', approvedAmount: 40000, reviewerNotes: 'Approved as requested' })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.equal(data.status, 'APPROVED');
    assert.equal(data.approvedAmount, 40000);
    assert.ok(data.respondedAt);
  });

  it('GET /insurance/pre-auth/:id — get pre-auth details', async () => {
    const prisma = getPrisma();
    const preAuth = await prisma.preAuthorization.create({
      data: {
        policyId, clinicId, patientUserId: patient.user.id,
        requestedAmount: 30000, status: 'APPROVED', approvedAmount: 25000,
        respondedAt: new Date(), expiresAt: new Date(Date.now() + 30 * 86400000),
      },
    });

    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/insurance/pre-auth/${preAuth.id}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.equal(data.status, 'APPROVED');
    assert.equal(data.approvedAmount, 25000);
    assert.ok(data.policy);
  });

  // ─── Claims Engine ───

  it('POST /insurance/claims — create claim draft', async () => {
    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/insurance/claims`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .send({
        policyId, clinicId, patientUserId: patient.user.id,
        items: [
          { description: 'Consultation Fee', category: 'CONSULTATION', claimedAmount: 1000 },
          { description: 'Blood Test', category: 'LAB_TEST', claimedAmount: 500 },
        ],
      })
      .expect(201);

    const data = res.body.data ?? res.body;
    assert.ok(data.id);
    assert.equal(data.status, 'DRAFT');
    assert.equal(data.items.length, 2);
    assert.equal(data.totalAmount, 1500);
    assert.equal(data.claimedAmount, 1500);
    assert.ok(data.claimNumber);
    assert.ok(data.policy);
  });

  it('POST /insurance/claims/:id/submit — submit claim', async () => {
    const prisma = getPrisma();
    const claim = await prisma.claim.create({
      data: {
        policyId, clinicId, patientUserId: patient.user.id,
        claimNumber: `CLM-TEST-${Date.now()}`, totalAmount: 2000, claimedAmount: 2000,
        status: 'DRAFT',
        ClaimLineItem: { create: [{ description: 'Consultation', category: 'CONSULTATION', claimedAmount: 2000 }] },
      },
    });

    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/insurance/claims/${claim.id}/submit`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.equal(data.status, 'SUBMITTED');
    assert.ok(data.submissionDate);
  });

  it('POST /insurance/claims/:id/adjudicate — adjudicate claim', async () => {
    const prisma = getPrisma();
    const claim = await prisma.claim.create({
      data: {
        policyId, clinicId, patientUserId: patient.user.id,
        claimNumber: `CLM-TEST-${Date.now()}`,
        totalAmount: 3000, claimedAmount: 3000,
        status: 'SUBMITTED', submissionDate: new Date(),
        ClaimLineItem: { create: [{ description: 'Procedure', category: 'PROCEDURE', claimedAmount: 3000 }] },
      },
    });

    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/insurance/claims/${claim.id}/adjudicate`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .send({ status: 'APPROVED', approvedAmount: 2500, notes: 'Approved with adjustment' })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.equal(data.status, 'APPROVED');
    assert.equal(data.approvedAmount, 2500);
    assert.ok(data.adjudicationDate);
  });

  it('POST /insurance/claims/:id/documents — add document', async () => {
    const prisma = getPrisma();
    const claim = await prisma.claim.create({
      data: {
        policyId, clinicId, patientUserId: patient.user.id,
        claimNumber: `CLM-TEST-${Date.now()}`,
        totalAmount: 1000, claimedAmount: 1000, status: 'DRAFT',
        ClaimLineItem: { create: [{ description: 'Consultation', category: 'CONSULTATION', claimedAmount: 1000 }] },
      },
    });

    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/insurance/claims/${claim.id}/documents`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .send({ documentType: 'INVOICE', fileName: 'invoice.pdf', storageKey: 'claims/invoice.pdf', fileSize: 1024 })
      .expect(201);

    const data = res.body.data ?? res.body;
    assert.ok(data.id);
    assert.equal(data.documentType, 'INVOICE');
    assert.equal(data.fileName, 'invoice.pdf');
  });

  it('GET /insurance/claims — list claims', async () => {
    const prisma = getPrisma();
    await prisma.claim.create({
      data: {
        policyId, clinicId, patientUserId: patient.user.id,
        claimNumber: `CLM-LIST-${Date.now()}`,
        totalAmount: 5000, claimedAmount: 5000, status: 'DRAFT',
        ClaimLineItem: { create: [{ description: 'Consultation', category: 'CONSULTATION', claimedAmount: 5000 }] },
      },
    });

    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/insurance/claims`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .query({ policyId, patientUserId: patient.user.id })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 1);
  });

  it('GET /insurance/claims/:id — get claim details', async () => {
    const prisma = getPrisma();
    const claim = await prisma.claim.create({
      data: {
        policyId, clinicId, patientUserId: patient.user.id,
        claimNumber: `CLM-DETAIL-${Date.now()}`,
        totalAmount: 2500, claimedAmount: 2500, status: 'APPROVED', approvedAmount: 2000,
        ClaimLineItem: { create: [{ description: 'Consultation', category: 'CONSULTATION', claimedAmount: 2500, approvedAmount: 2000 }] },
      },
    });

    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/insurance/claims/${claim.id}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.equal(data.claimNumber, claim.claimNumber);
    assert.ok(Array.isArray(data.items));
    assert.ok(data.policy);
  });

  // ─── Settlement ───

  it('POST /insurance/claims/:id/settlement — record settlement', async () => {
    const prisma = getPrisma();
    const claim = await prisma.claim.create({
      data: {
        policyId, clinicId, patientUserId: patient.user.id,
        claimNumber: `CLM-SET-${Date.now()}`,
        totalAmount: 5000, claimedAmount: 5000, approvedAmount: 4000,
        status: 'APPROVED', submissionDate: new Date(), adjudicationDate: new Date(),
        ClaimLineItem: { create: [{ description: 'Consultation', category: 'CONSULTATION', claimedAmount: 5000 }] },
      },
    });

    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/insurance/claims/${claim.id}/settlement`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .send({ amount: 4000, method: 'NEFT', reference: 'NEFT-REF-001', notes: 'Settled in full' })
      .expect(201);

    const data = res.body.data ?? res.body;
    assert.ok(data.id);
    assert.equal(data.amount, 4000);
    assert.equal(data.method, 'NEFT');
    assert.equal(data.status, 'COMPLETED');
  });

  // ─── AI Claims Copilot ───

  it('POST /insurance/copilot/analyze-claim/:id — analyze claim', async () => {
    const prisma = getPrisma();
    const claim = await prisma.claim.create({
      data: {
        policyId, clinicId, patientUserId: patient.user.id,
        claimNumber: `CLM-COP-${Date.now()}`,
        totalAmount: 3000, claimedAmount: 3000, status: 'DRAFT',
        ClaimLineItem: { create: [{ description: 'Test', category: 'OTHER', claimedAmount: 3000 }] },
      },
    });

    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/insurance/copilot/analyze-claim/${claim.id}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(data.risk);
    assert.ok(Array.isArray(data.issues));
    assert.ok(Array.isArray(data.warnings));
    assert.ok(Array.isArray(data.recommendations));
    assert.ok(data.completeness >= 0);
  });

  it('POST /insurance/copilot/denial-risk/:id — predict denial risk', async () => {
    const prisma = getPrisma();
    const claim = await prisma.claim.create({
      data: {
        policyId, clinicId, patientUserId: patient.user.id,
        claimNumber: `CLM-RISK-${Date.now()}`,
        totalAmount: 600000, claimedAmount: 600000, status: 'DRAFT',
        ClaimLineItem: { create: [{ description: 'Expensive procedure', category: 'PROCEDURE', claimedAmount: 600000 }] },
      },
    });

    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/insurance/copilot/denial-risk/${claim.id}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(data.denialRisk);
    assert.ok(data.riskScore >= 0);
    assert.ok(Array.isArray(data.factors));
    assert.ok(data.recommendation);
  });
});
