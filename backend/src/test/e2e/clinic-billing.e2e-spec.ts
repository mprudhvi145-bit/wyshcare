/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/test/e2e/clinic-billing.e2e-spec.ts
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
 * clinic-billing.e2e-spec — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
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

import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { bootstrapE2e, teardownE2e, cleanDatabase, createTestUser, authHeader, getRequest, getPrisma, API_PREFIX } from './setup';

describe('Clinic OS — Billing E2E', () => {
  let clinicId: string;
  let patient: Awaited<ReturnType<typeof createTestUser>>;
  let admin: Awaited<ReturnType<typeof createTestUser>>;
  let invoiceId: string;

  before(async () => { await bootstrapE2e(); });
  after(async () => { await teardownE2e(); });
  beforeEach(async () => {
    await cleanDatabase();
    const prisma = getPrisma();
    patient = await createTestUser({ role: 'PATIENT', phoneNumber: '+919999990001' });
    await createTestUser({ role: 'DOCTOR', phoneNumber: '+919999990002' });
    admin = await createTestUser({ role: 'ADMIN', phoneNumber: '+919999990003' });

    const clinic = await prisma.clinic.create({
      data: {
        name: 'Billing Clinic',
        slug: `billing-clinic-${Date.now()}`,
        phoneNumber: '+919999990099',
        addressLine1: '123 Billing St',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        timezone: 'Asia/Kolkata',
      },
    });
    clinicId = clinic.id;

    const created = await prisma.billingInvoice.create({
      data: {
        clinicId,
        patientUserId: patient.user.id,
        invoiceNumber: `INV-TEST-${Date.now()}`,
        status: 'DRAFT',
        subtotal: 1000,
        taxAmount: 180,
        totalAmount: 1180,
        dueAmount: 1180,
        BillingItem: {
          create: [
            { description: 'Consultation Fee', category: 'CONSULTATION', quantity: 1, unitPrice: 1000, totalPrice: 1000, taxPercent: 18, taxAmount: 180, netPrice: 1180 },
          ],
        },
      },
    });
    invoiceId = created.id;
  });

  it('POST /clinic/billing/invoices/:clinicId — create invoice', async () => {
    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/clinic/billing/invoices/${clinicId}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .send({
        patientUserId: patient.user.id,
        items: [
          { description: 'Consultation Fee', unitPrice: 1000 },
          { description: 'Blood Test', category: 'LAB_TEST', quantity: 1, unitPrice: 500 },
        ],
      })
      .expect(201);

    const data = res.body.data ?? res.body;
    assert.ok(data.id);
    assert.equal(data.status, 'DRAFT');
    assert.equal(data.items.length, 2);
    assert.equal(data.subtotal, 1500);
    assert.equal(data.taxAmount, 270);
    assert.equal(data.totalAmount, 1770);
  });

  it('PATCH /clinic/billing/invoices/:id/issue — issue invoice', async () => {
    const req = getRequest();
    const res = await req.patch(`${API_PREFIX}/clinic/billing/invoices/${invoiceId}/issue`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.equal(data.status, 'PENDING');
    assert.ok(data.issuedAt);
  });

  it('POST /clinic/billing/invoices/:id/payment — record full payment', async () => {
    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/clinic/billing/invoices/${invoiceId}/payment`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .send({ amount: 1180, method: 'UPI', reference: 'upi-ref-123' })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.equal(data.status, 'PAID');
    assert.equal(data.paidAmount, 1180);
    assert.equal(data.dueAmount, 0);
  });

  it('POST /clinic/billing/invoices/:id/payment — record partial payment', async () => {
    const prisma = getPrisma();
    const inv = await prisma.billingInvoice.create({
      data: {
        clinicId, patientUserId: patient.user.id,
        invoiceNumber: `INV-TEST-${Date.now()}`,
        status: 'PENDING', issuedAt: new Date(),
        subtotal: 1000, taxAmount: 180, totalAmount: 1180, dueAmount: 1180,
        BillingItem: { create: [{ description: 'Consultation', category: 'CONSULTATION', quantity: 1, unitPrice: 1000, totalPrice: 1000, taxPercent: 18, taxAmount: 180, netPrice: 1180 }] },
      },
    });

    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/clinic/billing/invoices/${inv.id}/payment`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .send({ amount: 500, method: 'CASH' })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.equal(data.status, 'PARTIALLY_PAID');
    assert.equal(data.paidAmount, 500);
    assert.equal(data.dueAmount, 680);
  });

  it('PATCH /clinic/billing/invoices/:id/cancel — cancel invoice', async () => {
    const req = getRequest();
    const res = await req.patch(`${API_PREFIX}/clinic/billing/invoices/${invoiceId}/cancel`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .send({ reason: 'Patient cancelled visit' })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.equal(data.status, 'CANCELLED');
    assert.ok(data.cancelledAt);
    assert.equal(data.cancellationReason, 'Patient cancelled visit');
  });

  it('GET /clinic/billing/invoices/:id — get invoice details', async () => {
    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/clinic/billing/invoices/${invoiceId}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.equal(data.id, invoiceId);
    assert.equal(data.items.length, 1);
    assert.equal(data.totalAmount, 1180);
  });

  it('GET /clinic/billing/invoices?clinicId= — list invoices by clinic', async () => {
    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/clinic/billing/invoices`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .query({ clinicId })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 1);
  });

  it('GET /clinic/billing/invoices — filter by status and patient', async () => {
    const prisma = getPrisma();
    await prisma.billingInvoice.create({
      data: {
        clinicId, patientUserId: patient.user.id,
        invoiceNumber: `INV-TEST-${Date.now()}`,
        status: 'PAID', issuedAt: new Date(), paidAt: new Date(),
        subtotal: 500, taxAmount: 90, totalAmount: 590, paidAmount: 590, dueAmount: 0,
        BillingItem: { create: [{ description: 'Test', category: 'OTHER', quantity: 1, unitPrice: 500, totalPrice: 500, taxPercent: 18, taxAmount: 90, netPrice: 590 }] },
      },
    });

    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/clinic/billing/invoices`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .query({ clinicId, status: 'PAID', patientUserId: patient.user.id })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 1);
    assert.equal(data[0].status, 'PAID');
  });

  it('GET /clinic/billing/revenue/:clinicId — revenue report', async () => {
    const prisma = getPrisma();
    await prisma.billingInvoice.create({
      data: {
        clinicId, patientUserId: patient.user.id,
        invoiceNumber: `INV-REV-${Date.now()}`,
        status: 'PAID', issuedAt: new Date(), paidAt: new Date(),
        subtotal: 2000, taxAmount: 360, totalAmount: 2360, paidAmount: 2360, dueAmount: 0,
        BillingItem: { create: [{ description: 'Consultation', category: 'CONSULTATION', quantity: 1, unitPrice: 2000, totalPrice: 2000, taxPercent: 18, taxAmount: 360, netPrice: 2360 }] },
      },
    });

    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/clinic/billing/revenue/${clinicId}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .query({ days: '30' })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(data.summary);
    assert.ok(data.summary.totalBilled > 0);
    assert.ok(data.summary.totalCollected > 0);
    assert.ok(data.summary.collectionRate >= 0);
    assert.ok(data.dailyRevenue.length >= 1);
  });

  it('GET /clinic/billing/revenue/:clinicId/by-doctor — doctor revenue split', async () => {
    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/clinic/billing/revenue/${clinicId}/by-doctor`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .query({ days: '30' })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(Array.isArray(data));
  });
});
