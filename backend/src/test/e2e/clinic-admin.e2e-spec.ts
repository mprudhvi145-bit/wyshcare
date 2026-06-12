/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/test/e2e/clinic-admin.e2e-spec.ts
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
 * clinic-admin.e2e-spec — Admin module
 *
 * Responsibilities:
 * - Support admin functionality
 *
 * Used By:
 - backend/src/test/e2e/health-graph.e2e-spec.ts
 - backend/src/test/consent.service.spec.ts
 - backend/src/test/e2e/pharmacy.e2e-spec.ts
 - backend/tests/rbac.access-matrix.test.mjs
 - backend/src/test/authorization.spec.ts
 - backend/src/test/e2e/appointment.e2e-spec.ts
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
Admin
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

describe('Clinic OS — Admin E2E', () => {
  let clinicId: string;
  let doctor: Awaited<ReturnType<typeof createTestUser>>;
  let admin: Awaited<ReturnType<typeof createTestUser>>;
  let patient: Awaited<ReturnType<typeof createTestUser>>;

  before(async () => { await bootstrapE2e(); });
  after(async () => { await teardownE2e(); });
  beforeEach(async () => {
    await cleanDatabase();
    const prisma = getPrisma();
    doctor = await createTestUser({ role: 'DOCTOR', phoneNumber: '+919999990001' });
    admin = await createTestUser({ role: 'ADMIN', phoneNumber: '+919999990002' });
    patient = await createTestUser({ role: 'PATIENT', phoneNumber: '+919999990003' });

    const clinic = await prisma.clinic.create({
      data: {
        name: 'Main Branch',
        slug: `admin-main-${Date.now()}`,
        phoneNumber: '+919999990100',
        addressLine1: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        timezone: 'Asia/Kolkata',
      },
    });
    clinicId = clinic.id;

    const clinic2 = await prisma.clinic.create({
      data: {
        name: 'Branch 2',
        slug: `admin-branch2-${Date.now()}`,
        phoneNumber: '+919999990101',
        addressLine1: '456 Branch Rd',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        timezone: 'Asia/Kolkata',
      },
    });
    void clinic2;

    await prisma.doctorClinic.create({
      data: { doctorId: doctor.doctorProfileId!, clinicId, consultationFee: 500 },
    });

    await prisma.queueEntry.create({
      data: { clinicId, patientUserId: patient.user.id, doctorProfileId: doctor.doctorProfileId, source: 'APPOINTMENT', status: 'WAITING', checkedInAt: new Date() },
    });
  });

  it('GET /clinic/admin/dashboard/:clinicId — get clinic dashboard', async () => {
    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/clinic/admin/dashboard/${clinicId}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(data.clinic);
    assert.equal(data.clinic.name, 'Main Branch');
    assert.ok(data.staff);
    assert.ok(data.staff.doctors.length >= 1);
    assert.ok(data.today);
  });

  it('GET /clinic/admin/branches — list all branches', async () => {
    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/clinic/admin/branches`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 2);
    const names = data.map((c: { name: string }) => c.name);
    assert.ok(names.includes('Main Branch'));
    assert.ok(names.includes('Branch 2'));
  });

  it('GET /clinic/admin/analytics/:clinicId — get branch analytics', async () => {
    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/clinic/admin/analytics/${clinicId}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .query({ days: '30' })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(data.period);
    assert.ok(data.operations);
    assert.ok(data.operations.totalVisits >= 1);
    assert.ok(data.operations.walkIns >= 0);
  });

  it('GET /clinic/admin/staff/:clinicId — list staff', async () => {
    const prisma = getPrisma();
    await prisma.staffAssignment.create({
      data: { clinicId, userId: admin.user.id, role: 'ADMIN' },
    });

    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/clinic/admin/staff/${clinicId}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 1);
  });

  it('PATCH /clinic/admin/update/:clinicId — update clinic settings', async () => {
    const req = getRequest();
    const res = await req.patch(`${API_PREFIX}/clinic/admin/update/${clinicId}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .send({ name: 'Main Branch Updated', email: 'clinic@example.com' })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.equal(data.name, 'Main Branch Updated');
    assert.equal(data.email, 'clinic@example.com');
  });

  it('GET /clinic/admin/dashboard/:clinicId — returns 404 for unknown clinic', async () => {
    const req = getRequest();
    await req.get(`${API_PREFIX}/clinic/admin/dashboard/nonexistent-clinic-id`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .expect(404);
  });
});
