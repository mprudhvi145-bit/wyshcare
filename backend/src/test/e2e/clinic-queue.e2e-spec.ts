/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/test/e2e/clinic-queue.e2e-spec.ts
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
 * clinic-queue.e2e-spec — WyshID module
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

describe('Clinic OS — Queue E2E', () => {
  let clinicId: string;
  let patient: Awaited<ReturnType<typeof createTestUser>>;
  let doctor: Awaited<ReturnType<typeof createTestUser>>;
  let doctor2: Awaited<ReturnType<typeof createTestUser>>;
  let admin: Awaited<ReturnType<typeof createTestUser>>;
  let appointmentId: string;

  before(async () => { await bootstrapE2e(); });
  after(async () => { await teardownE2e(); });
  beforeEach(async () => {
    await cleanDatabase();
    const prisma = getPrisma();
    patient = await createTestUser({ role: 'PATIENT', phoneNumber: '+919999990001' });
    doctor = await createTestUser({ role: 'DOCTOR', phoneNumber: '+919999990002' });
    doctor2 = await createTestUser({ role: 'DOCTOR', phoneNumber: '+919999990003' });
    admin = await createTestUser({ role: 'ADMIN', phoneNumber: '+919999990004' });

    const clinic = await prisma.clinic.create({
      data: {
        name: 'Test Clinic',
        slug: `test-clinic-${Date.now()}`,
        phoneNumber: '+919999990099',
        addressLine1: '123 Test St',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        timezone: 'Asia/Kolkata',
        services: ['General Medicine'],
        facilities: ['Pharmacy'],
      },
    });
    clinicId = clinic.id;

    for (const dpId of [doctor.doctorProfileId!, doctor2.doctorProfileId!]) {
      await prisma.doctorClinic.create({
        data: { doctorId: dpId, clinicId, consultationFee: 500 },
      });
    }

    const appt = await prisma.appointment.create({
      data: {
        patientUserId: patient.user.id,
        doctorProfileId: doctor.doctorProfileId!,
        doctorUserId: doctor.user.id,
        clinicId,
        status: 'CONFIRMED',
        consultationMode: 'VIDEO',
        reason: 'Routine checkup',
        slotStartAt: new Date(Date.now() + 3600000),
        slotEndAt: new Date(Date.now() + 3900000),
      },
    });
    appointmentId = appt.id;
  });

  it('GET /clinic/reception/schedule/:clinicId — get today schedule', async () => {
    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/clinic/reception/schedule/${clinicId}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.equal(data.summary.totalAppointments, 1);
    assert.equal(data.summary.checkedIn, 0);
    assert.equal(data.summary.confirmed, 1);
    assert.equal(data.appointments.length, 1);
    assert.equal(data.appointments[0].doctorName.includes(doctor.user.fullName), true);
  });

  it('POST /clinic/reception/check-in/:appointmentId — check in patient', async () => {
    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/clinic/reception/check-in/${appointmentId}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.equal(data.status, 'CHECKED_IN');

    const prisma = getPrisma();
    const qEntry = await prisma.queueEntry.findFirst({ where: { appointmentId } });
    assert.ok(qEntry);
    assert.equal(qEntry!.status, 'WAITING');
    assert.equal(qEntry!.source, 'APPOINTMENT');
  });

  it('POST /clinic/reception/walk-in/:clinicId — register walk-in', async () => {
    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/clinic/reception/walk-in/${clinicId}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .send({ patientUserId: patient.user.id, doctorProfileId: doctor.doctorProfileId })
      .expect(201);

    const data = res.body.data ?? res.body;
    assert.ok(data.id);
    assert.equal(data.source, 'WALK_IN');
    assert.equal(data.status, 'WAITING');
    assert.equal(data.patient.fullName, patient.user.fullName);
  });

  it('GET /clinic/reception/queue/:clinicId — get live queue', async () => {
    const prisma = getPrisma();
    await prisma.queueEntry.create({
      data: { clinicId, patientUserId: patient.user.id, doctorProfileId: doctor.doctorProfileId, source: 'APPOINTMENT', status: 'WAITING', checkedInAt: new Date() },
    });

    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/clinic/reception/queue/${clinicId}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(Array.isArray(data));
    assert.equal(data.length, 1);
    assert.equal(data[0].status, 'WAITING');
  });

  it('GET /clinic/reception/queue/:clinicId?doctorProfileId= — filter by doctor', async () => {
    const prisma = getPrisma();
    await prisma.queueEntry.create({
      data: { clinicId, patientUserId: patient.user.id, doctorProfileId: doctor.doctorProfileId, source: 'APPOINTMENT', status: 'WAITING', checkedInAt: new Date() },
    });

    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/clinic/reception/queue/${clinicId}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .query({ doctorProfileId: doctor.doctorProfileId })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.equal(data.length, 1);
  });

  it('POST /clinic/reception/queue/prioritize/:clinicId — AI prioritization', async () => {
    const prisma = getPrisma();
    await prisma.queueEntry.create({
      data: { clinicId, patientUserId: patient.user.id, doctorProfileId: doctor.doctorProfileId, source: 'APPOINTMENT', status: 'WAITING', checkedInAt: new Date(), severityScore: 6 },
    });

    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/clinic/reception/queue/prioritize/${clinicId}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 1);
    assert.ok(data[0].priority > 0);
  });

  it('PATCH /clinic/reception/queue/call/:queueEntryId — call patient', async () => {
    const prisma = getPrisma();
    const entry = await prisma.queueEntry.create({
      data: { clinicId, patientUserId: patient.user.id, doctorProfileId: doctor.doctorProfileId, source: 'APPOINTMENT', status: 'WAITING', checkedInAt: new Date() },
    });

    const req = getRequest();
    const res = await req.patch(`${API_PREFIX}/clinic/reception/queue/call/${entry.id}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.equal(data.status, 'IN_PROGRESS');
    assert.ok(data.assignedAt);
  });

  it('PATCH /clinic/reception/queue/complete/:queueEntryId — complete visit', async () => {
    const prisma = getPrisma();
    const entry = await prisma.queueEntry.create({
      data: { clinicId, patientUserId: patient.user.id, doctorProfileId: doctor.doctorProfileId, source: 'APPOINTMENT', status: 'IN_PROGRESS', checkedInAt: new Date(), assignedAt: new Date() },
    });

    const req = getRequest();
    const res = await req.patch(`${API_PREFIX}/clinic/reception/queue/complete/${entry.id}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.equal(data.status, 'COMPLETED');
    assert.ok(data.completedAt);
  });
});
