/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/test/e2e/appointment.e2e-spec.ts
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
 * appointment.e2e-spec — Appointment module
 *
 * Responsibilities:
 * - Support appointment functionality
 *
 * Used By:
 - backend/src/test/e2e/health-graph.e2e-spec.ts
 - backend/src/test/consent.service.spec.ts
 - backend/src/test/e2e/pharmacy.e2e-spec.ts
 - backend/tests/rbac.access-matrix.test.mjs
 - backend/src/test/authorization.spec.ts
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
Appointment
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

import { bootstrapE2e, teardownE2e, cleanDatabase, createTestUser, createTestAppointment, authHeader, API_PREFIX, getRequest } from './setup';

describe('Appointments E2E', () => {
  before(async () => { await bootstrapE2e(); });
  after(async () => { await teardownE2e(); });
  beforeEach(async () => { await cleanDatabase(); });

  it('GET /discovery — returns available doctors', async () => {
    const req = getRequest();
    await createTestUser({ role: 'DOCTOR', doctorProfile: true });

    const res = await req.get(`${API_PREFIX}/discovery`)
      .query({ specialization: 'General Medicine' })
      .expect(200);

    assert.ok(res.body.data ?? Array.isArray(res.body));
  });

  it('creates appointment via doctor consultation flow', async () => {
    const patient = await createTestUser({ role: 'PATIENT' });
    const doctor = await createTestUser({ role: 'DOCTOR', doctorProfile: true });

    const appointment = await createTestAppointment(patient.user.id, doctor.doctorProfileId!);
    assert.ok(appointment.id);
    assert.equal(appointment.status, 'CONFIRMED');
  });

  it('POST /telemedicine/session/create — creates consultation session', async () => {
    const req = getRequest();
    const patient = await createTestUser({ phoneNumber: '+919999990011', role: 'PATIENT' });
    const doctor = await createTestUser({ phoneNumber: '+919999990012', role: 'DOCTOR', doctorProfile: true });

    const appointment = await createTestAppointment(patient.user.id, doctor.doctorProfileId!, doctor.user.id);

    const res = await req.post(`${API_PREFIX}/telemedicine/session/create`)
      .set(authHeader(doctor.user.id, ['DOCTOR']))
      .send({ appointmentId: appointment.id })
      .expect(201);

    assert.ok(res.body.data ?? res.body.session);
  });

  it('POST /telemedicine/session/create — rejects unauthorized user', async () => {
    const req = getRequest();
    const patient = await createTestUser({ phoneNumber: '+919999990013', role: 'PATIENT' });
    const doctor = await createTestUser({ phoneNumber: '+919999990014', role: 'DOCTOR', doctorProfile: true });
    const other = await createTestUser({ phoneNumber: '+919999990015', role: 'PATIENT' });

    const appointment = await createTestAppointment(patient.user.id, doctor.doctorProfileId!, doctor.user.id);

    await req.post(`${API_PREFIX}/telemedicine/session/create`)
      .set(authHeader(other.user.id, ['PATIENT']))
      .send({ appointmentId: appointment.id })
      .expect(403);
  });

  it('POST /telemedicine/session/join — joins existing session', async () => {
    const req = getRequest();
    const patient = await createTestUser({ phoneNumber: '+919999990016', role: 'PATIENT' });
    const doctor = await createTestUser({ phoneNumber: '+919999990017', role: 'DOCTOR', doctorProfile: true });

    const appointment = await createTestAppointment(patient.user.id, doctor.doctorProfileId!, doctor.user.id);

    const createRes = await req.post(`${API_PREFIX}/telemedicine/session/create`)
      .set(authHeader(patient.user.id, ['PATIENT']))
      .send({ appointmentId: appointment.id })
      .expect(201);

    const sessionId = createRes.body.data?.session?.id ?? createRes.body.session?.id;
    assert.ok(sessionId);

    await req.post(`${API_PREFIX}/telemedicine/session/join`)
      .set(authHeader(patient.user.id, ['PATIENT']))
      .send({ sessionId })
      .expect(201);
  });

  it('POST /telemedicine/session/end — ends consultation', async () => {
    const req = getRequest();
    const patient = await createTestUser({ phoneNumber: '+919999990018', role: 'PATIENT' });
    const doctor = await createTestUser({ phoneNumber: '+919999990019', role: 'DOCTOR', doctorProfile: true });

    const appointment = await createTestAppointment(patient.user.id, doctor.doctorProfileId!, doctor.user.id);

    const createRes = await req.post(`${API_PREFIX}/telemedicine/session/create`)
      .set(authHeader(patient.user.id, ['PATIENT']))
      .send({ appointmentId: appointment.id })
      .expect(201);

    const sessionId = createRes.body.data?.session?.id ?? createRes.body.session?.id;

    await req.post(`${API_PREFIX}/telemedicine/session/join`)
      .set(authHeader(patient.user.id, ['PATIENT']))
      .send({ sessionId })
      .expect(201);

    const endRes = await req.post(`${API_PREFIX}/telemedicine/session/end`)
      .set(authHeader(doctor.user.id, ['DOCTOR']))
      .send({ sessionId, notes: 'Test consultation completed' })
      .expect(201);

    assert.ok(endRes.body.data ?? endRes.body.endedAt);
  });

  it('POST /telemedicine/:id/generate-soap — generates SOAP notes', async () => {
    const req = getRequest();
    const patient = await createTestUser({ phoneNumber: '+919999990020', role: 'PATIENT' });
    const doctor = await createTestUser({ phoneNumber: '+919999990021', role: 'DOCTOR', doctorProfile: true });

    const appointment = await createTestAppointment(patient.user.id, doctor.doctorProfileId!, doctor.user.id);

    const createRes = await req.post(`${API_PREFIX}/telemedicine/session/create`)
      .set(authHeader(patient.user.id, ['PATIENT']))
      .send({ appointmentId: appointment.id })
      .expect(201);

    const sessionId = createRes.body.data?.session?.id ?? createRes.body.session?.id;

    await req.post(`${API_PREFIX}/telemedicine/${sessionId}/generate-soap`)
      .set(authHeader(doctor.user.id, ['DOCTOR']))
      .send({ consultationNotes: 'Patient has fever and cough for 3 days', approve: true })
      .expect(201);
  });

  it('GET /telemedicine/dashboard/patient — returns patient dashboard', async () => {
    const req = getRequest();
    const patient = await createTestUser({ phoneNumber: '+919999990022', role: 'PATIENT' });

    const res = await req.get(`${API_PREFIX}/telemedicine/dashboard/patient`)
      .set(authHeader(patient.user.id, ['PATIENT']))
      .expect(200);

    assert.ok(res.body.data ?? (res.body.upcoming || res.body.past));
  });

  it('GET /telemedicine/dashboard/doctor — returns doctor dashboard', async () => {
    const req = getRequest();
    const doctor = await createTestUser({ phoneNumber: '+919999990023', role: 'DOCTOR', doctorProfile: true });

    const res = await req.get(`${API_PREFIX}/telemedicine/dashboard/doctor`)
      .set(authHeader(doctor.user.id, ['DOCTOR']))
      .expect(200);

    assert.ok(res.body.data ?? res.body.todayQueue !== undefined);
  });
});
