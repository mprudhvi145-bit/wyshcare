/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/test/e2e/health-graph.e2e-spec.ts
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
 * health-graph.e2e-spec — Health Graph module
 *
 * Responsibilities:
 * - Support health graph functionality
 *
 * Used By:
 - backend/src/test/consent.service.spec.ts
 - backend/src/test/e2e/pharmacy.e2e-spec.ts
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
Health Graph
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

import type { AppointmentStatus, ConsultationMode } from '@prisma/client';
import { bootstrapE2e, teardownE2e, cleanDatabase, createTestUser, authHeader, getRequest, getPrisma, API_PREFIX } from './setup';

describe('Health Graph E2E', () => {
  before(async () => { await bootstrapE2e(); });
  after(async () => { await teardownE2e(); });
  beforeEach(async () => { await cleanDatabase(); });

  it('GET /health-graph — returns empty graph for new user', async () => {
    const req = getRequest();
    const user = await createTestUser();

    const res = await req.get(`${API_PREFIX}/health-graph`)
      .set(authHeader(user.user.id, ['PATIENT']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(data.nodes !== undefined);
    assert.ok(data.edges !== undefined);
  });

  it('GET /health-graph/summary — returns patient summary', async () => {
    const req = getRequest();
    const user = await createTestUser();

    const res = await req.get(`${API_PREFIX}/health-graph/summary`)
      .set(authHeader(user.user.id, ['PATIENT']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(data.profile !== undefined || data.graphStats !== undefined);
  });

  it('GET /health-graph/risks — returns risk assessment', async () => {
    const req = getRequest();
    const user = await createTestUser();

    const res = await req.get(`${API_PREFIX}/health-graph/risks`)
      .set(authHeader(user.user.id, ['PATIENT']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(data.risks !== undefined);
    assert.ok(typeof data.score === 'number');
    assert.ok(data.level !== undefined);
  });

  it('GET /health-graph/nodes — lists graph nodes', async () => {
    const req = getRequest();
    const user = await createTestUser();

    const res = await req.get(`${API_PREFIX}/health-graph/nodes`)
      .set(authHeader(user.user.id, ['PATIENT']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(Array.isArray(data));
  });

  it('GET /health-graph/nodes — filters by type', async () => {
    const req = getRequest();
    const prisma = getPrisma();
    const user = await createTestUser();

    await prisma.aIMemoryNode.create({
      data: {
        userId: user.user.id,
        nodeType: 'CONDITION',
        title: 'Hypertension',
        summary: 'High blood pressure',
        confidenceScore: 0.9,
      },
    });

    const res = await req.get(`${API_PREFIX}/health-graph/nodes`)
      .set(authHeader(user.user.id, ['PATIENT']))
      .query({ type: 'CONDITION' })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(data.length >= 1);
    assert.equal(data[0]?.nodeType, 'CONDITION');
  });

  it('POST /health-graph/query — answers graph query', async () => {
    const req = getRequest();
    const prisma = getPrisma();
    const user = await createTestUser();

    const patientNode = await prisma.aIMemoryNode.create({
      data: {
        userId: user.user.id,
        nodeType: 'PATIENT',
        title: 'Self',
        summary: 'Patient root',
        confidenceScore: 1.0,
      },
    });

    const condNode = await prisma.aIMemoryNode.create({
      data: {
        userId: user.user.id,
        nodeType: 'CONDITION',
        title: 'Hypertension',
        summary: 'High blood pressure',
        confidenceScore: 0.9,
      },
    });

    await prisma.aIMemoryEdge.create({
      data: {
        fromNodeId: patientNode.id,
        toNodeId: condNode.id,
        relation: 'HAS_CONDITION',
        strength: 0.9,
      },
    });

    const res = await req.post(`${API_PREFIX}/health-graph/query`)
      .set(authHeader(user.user.id, ['PATIENT']))
      .send({ question: 'What conditions do I have?' })
      .expect(201);

    const data = res.body.data ?? res.body;
    assert.ok(data.answer !== undefined);
    assert.ok(data.evidence !== undefined);
  });

  it('POST /health-graph/sync/consultation — syncs consultation to graph', async () => {
    const req = getRequest();
    const prisma = getPrisma();
    const patient = await createTestUser({ phoneNumber: '+919999990030', role: 'PATIENT' });
    const doctor = await createTestUser({ phoneNumber: '+919999990031', role: 'DOCTOR', doctorProfile: true });

    const appointment = await prisma.appointment.create({
      data: {
        patientUserId: patient.user.id,
        doctorProfileId: doctor.doctorProfileId!,
        doctorUserId: doctor.user.id,
        status: 'COMPLETED' as AppointmentStatus,
        consultationMode: 'VIDEO' as ConsultationMode,
        reason: 'Test',
        slotStartAt: new Date(),
        slotEndAt: new Date(Date.now() + 1800_000),
      },
    });

    const session = await prisma.consultationSession.create({
      data: {
        appointmentId: appointment.id,
        doctorProfileId: doctor.doctorProfileId!,
        patientUserId: patient.user.id,
        mode: 'VIDEO' as ConsultationMode,
      },
    });

    await prisma.consultationSOAP.create({
      data: {
        consultationId: session.id,
        subjective: 'Patient reports headache',
        objective: 'BP 140/90',
        assessment: 'Hypertension, Diabetes',
        plan: 'Prescribed Amlodipine 5mg, Metformin 500mg',
        generatedByAI: true,
        approvedByDoctor: true,
        approvedAt: new Date(),
      },
    });

    await req.post(`${API_PREFIX}/health-graph/sync/consultation/${session.id}`)
      .set(authHeader(doctor.user.id, ['DOCTOR']))
      .expect(201);

    const nodesAfter = await prisma.aIMemoryNode.findMany({ where: { userId: patient.user.id } });
    assert.ok(nodesAfter.length > 0);
    const types = nodesAfter.map((n) => n.nodeType);
    assert.ok(types.includes('CONDITION'));
    assert.ok(types.includes('MEDICATION'));
    assert.ok(types.includes('CONSULTATION'));
  });

  it('POST /health-graph/sync/appointment — syncs appointment to graph', async () => {
    const req = getRequest();
    const prisma = getPrisma();
    const patient = await createTestUser({ phoneNumber: '+919999990032', role: 'PATIENT' });
    const doctor = await createTestUser({ phoneNumber: '+919999990033', role: 'DOCTOR', doctorProfile: true });

    const appointment = await prisma.appointment.create({
      data: {
        patientUserId: patient.user.id,
        doctorProfileId: doctor.doctorProfileId!,
        doctorUserId: doctor.user.id,
        status: 'CONFIRMED' as AppointmentStatus,
        consultationMode: 'VIDEO' as ConsultationMode,
        reason: 'Follow-up',
        slotStartAt: new Date(),
        slotEndAt: new Date(Date.now() + 1800_000),
      },
    });

    await req.post(`${API_PREFIX}/health-graph/sync/appointment/${appointment.id}`)
      .set(authHeader(doctor.user.id, ['DOCTOR']))
      .expect(201);
  });
});

describe('Health Twin E2E', () => {
  before(async () => { await bootstrapE2e(); });
  after(async () => { await teardownE2e(); });
  beforeEach(async () => { await cleanDatabase(); });

  it('GET /health-twin — returns patient health twin', async () => {
    const req = getRequest();
    const user = await createTestUser();

    const res = await req.get(`${API_PREFIX}/health-twin`)
      .set(authHeader(user.user.id, ['PATIENT']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(data.profile !== undefined);
    assert.ok(data.graph !== undefined);
    assert.ok(data.riskFactors !== undefined);
  });

  it('GET /health-twin — rejects unauthenticated request', async () => {
    const req = getRequest();
    await req.get(`${API_PREFIX}/health-twin`).expect(401);
  });

  it('POST /health-twin/ask — asks AI question about health data', async () => {
    const req = getRequest();
    const user = await createTestUser();

    const res = await req.post(`${API_PREFIX}/health-twin/ask`)
      .set(authHeader(user.user.id, ['PATIENT']))
      .send({ question: 'What medications am I taking?' })
      .expect(201);

    const data = res.body.data ?? res.body;
    assert.ok(data.answer !== undefined || data.question !== undefined);
  });
});
