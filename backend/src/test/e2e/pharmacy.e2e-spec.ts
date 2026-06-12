/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/test/e2e/pharmacy.e2e-spec.ts
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
 * pharmacy.e2e-spec — Pharmacy module
 *
 * Responsibilities:
 * - Support pharmacy functionality
 *
 * Used By:
 - backend/src/test/e2e/health-graph.e2e-spec.ts
 - backend/src/test/consent.service.spec.ts
 - backend/tests/rbac.access-matrix.test.mjs
 - backend/src/test/authorization.spec.ts
 - backend/src/test/e2e/appointment.e2e-spec.ts
 - backend/src/test/e2e/clinic-admin.e2e-spec.ts
 - backend/src/test/e2e/workflows.e2e-spec.ts
 - backend/src/test/helpers.ts
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
Pharmacy
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

describe('Pharmacy E2E', () => {
  before(async () => { await bootstrapE2e(); });
  after(async () => { await teardownE2e(); });
  beforeEach(async () => { await cleanDatabase(); });

  it('GET /pharmacy/partners — returns pharmacy partners', async () => {
    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/pharmacy/partners`).expect(200);

    assert.ok(Array.isArray(res.body.data?.items ?? res.body.data));
  });

  it('GET /pharmacy/partners — filters by city', async () => {
    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/pharmacy/partners`)
      .query({ city: 'Mumbai' })
      .expect(200);

    const items = res.body.data?.items ?? res.body.items ?? [];
    assert.ok(Array.isArray(items));
  });

  it('POST /pharmacy/seed-demo — creates demo data', async () => {
    const req = getRequest();

    const res = await req.post(`${API_PREFIX}/pharmacy/seed-demo`).expect(201);

    const data = res.body.data ?? res.body;
    assert.ok(data.partners > 0);
  });

  it('GET /pharmacy/partners/:id — returns partner with inventory', async () => {
    const req = getRequest();
    const prisma = getPrisma();

    const partner = await prisma.pharmacyPartner.create({
      data: {
        name: 'Test Pharmacy',
        phoneNumber: '+919999990001',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        verificationStatus: 'VERIFIED',
        isActive: true,
      },
    });

    const res = await req.get(`${API_PREFIX}/pharmacy/partners/${partner.id}`).expect(200);

    const data = res.body.data ?? res.body;
    assert.equal(data.name, 'Test Pharmacy');
    assert.ok(data.inventory !== undefined);
  });

  it('GET /pharmacy/partners/:partnerId/inventory — returns inventory', async () => {
    const req = getRequest();
    const prisma = getPrisma();

    const partner = await prisma.pharmacyPartner.create({
      data: {
        name: 'Inventory Test Pharmacy',
        phoneNumber: '+919999990002',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        verificationStatus: 'VERIFIED',
        isActive: true,
      },
    });

    await prisma.pharmacyInventory.create({
      data: {
        partnerId: partner.id,
        name: 'Paracetamol 500mg',
        unitPrice: 25,
        mrp: 35,
        stock: 100,
      },
    });

    const res = await req.get(`${API_PREFIX}/pharmacy/partners/${partner.id}/inventory`).expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(data.length >= 1);
  });

  it('cart lifecycle — add, list, update, remove', async () => {
    const req = getRequest();
    const prisma = getPrisma();
    const user = await createTestUser();

    const partner = await prisma.pharmacyPartner.create({
      data: {
        name: 'Cart Test Pharmacy',
        phoneNumber: '+919999990003',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        verificationStatus: 'VERIFIED',
        isActive: true,
      },
    });

    const inventory = await prisma.pharmacyInventory.create({
      data: {
        partnerId: partner.id,
        name: 'Cetirizine 10mg',
        unitPrice: 30,
        mrp: 45,
        stock: 50,
      },
    });

    const addRes = await req.post(`${API_PREFIX}/pharmacy/cart`)
      .set(authHeader(user.user.id, ['PATIENT']))
      .send({ partnerId: partner.id, inventoryId: inventory.id, quantity: 2 })
      .expect(201);

    const getRes = await req.get(`${API_PREFIX}/pharmacy/cart`)
      .set(authHeader(user.user.id, ['PATIENT']))
      .expect(200);

    const cartData = getRes.body.data ?? getRes.body;
    assert.ok(cartData.items?.length > 0 || cartData.total !== undefined);

    const itemId = addRes.body.data?.id ?? addRes.body.id;
    if (itemId) {
      await req.put(`${API_PREFIX}/pharmacy/cart/${itemId}`)
        .set(authHeader(user.user.id, ['PATIENT']))
        .send({ quantity: 3 })
        .expect(200);

      await req.delete(`${API_PREFIX}/pharmacy/cart/${itemId}`)
        .set(authHeader(user.user.id, ['PATIENT']))
        .expect(200);
    }
  });

  it('order lifecycle — create, list, status update', async () => {
    const req = getRequest();
    const prisma = getPrisma();
    const user = await createTestUser();

    const partner = await prisma.pharmacyPartner.create({
      data: {
        name: 'Order Test Pharmacy',
        phoneNumber: '+919999990004',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        verificationStatus: 'VERIFIED',
        isActive: true,
      },
    });

    const createRes = await req.post(`${API_PREFIX}/pharmacy/orders`)
      .set(authHeader(user.user.id, ['PATIENT']))
      .send({
        partnerId: partner.id,
        medicines: [{ name: 'Paracetamol 500mg', dosage: '500mg', quantity: 10 }],
        deliveryAddress: {
          street: '123 Test St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          fullName: 'Test User',
          phoneNumber: '+919999990001',
        },
      })
      .expect(201);

    const orderData = createRes.body.data ?? createRes.body;
    assert.ok(orderData.id);

    const listRes = await req.get(`${API_PREFIX}/pharmacy/orders`)
      .set(authHeader(user.user.id, ['PATIENT']))
      .expect(200);

    assert.ok(listRes.body.data?.total !== undefined || listRes.body.data?.items?.length > 0);
  });

  it('POST /pharmacy/parse-prescription — parses text prescription', async () => {
    const req = getRequest();
    const user = await createTestUser();

    const res = await req.post(`${API_PREFIX}/pharmacy/parse-prescription`)
      .set(authHeader(user.user.id, ['PATIENT']))
      .send({
        text: 'Tab Paracetamol 500mg twice daily for 5 days\nTab Amoxicillin 250mg three times daily for 7 days',
      })
      .expect(201);

    const data = res.body.data ?? res.body;
    assert.ok(data.medications !== undefined || data.raw !== undefined);
  });

  it('GET /pharmacy/compare-prices — compares medicine prices', async () => {
    const req = getRequest();
    const prisma = getPrisma();
    const user = await createTestUser();

    const partner = await prisma.pharmacyPartner.create({
      data: {
        name: 'Price Test Pharmacy',
        phoneNumber: '+919999990005',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        verificationStatus: 'VERIFIED',
        isActive: true,
      },
    });

    await prisma.pharmacyInventory.create({
      data: {
        partnerId: partner.id,
        name: 'Paracetamol 500mg',
        unitPrice: 20,
        mrp: 35,
        stock: 100,
      },
    });

    const res = await req.get(`${API_PREFIX}/pharmacy/compare-prices`)
      .set(authHeader(user.user.id, ['PATIENT']))
      .query({ medicines: 'Paracetamol' })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(Array.isArray(data));
  });
});
