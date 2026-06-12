/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/test/e2e/clinical-twin.e2e-spec.ts
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
 * clinical-twin.e2e-spec — Clinical module
 *
 * Responsibilities:
 * - Support clinical functionality
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
Clinical
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

describe('Clinic OS — Clinical Twin E2E', () => {
  let clinicId: string;
  let patient: Awaited<ReturnType<typeof createTestUser>>;
  let patient2: Awaited<ReturnType<typeof createTestUser>>;
  let doctor: Awaited<ReturnType<typeof createTestUser>>;
  let admin: Awaited<ReturnType<typeof createTestUser>>;

  before(async () => { await bootstrapE2e(); });
  after(async () => { await teardownE2e(); });
  beforeEach(async () => {
    await cleanDatabase();
    const prisma = getPrisma();
    patient = await createTestUser({ role: 'PATIENT', phoneNumber: '+919999990001' });
    patient2 = await createTestUser({ role: 'PATIENT', phoneNumber: '+919999990002' });
    doctor = await createTestUser({ role: 'DOCTOR', phoneNumber: '+919999990003' });
    admin = await createTestUser({ role: 'ADMIN', phoneNumber: '+919999990004' });

    const clinic = await prisma.clinic.create({
      data: {
        name: 'Twin Clinic',
        slug: `twin-clinic-${Date.now()}`,
        phoneNumber: '+919999990099',
        addressLine1: '123 Twin Ave',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        timezone: 'Asia/Kolkata',
      },
    });
    clinicId = clinic.id;

    await prisma.doctorClinic.create({
      data: { doctorId: doctor.doctorProfileId!, clinicId, consultationFee: 500 },
    });

    // Create appointments
    await Promise.all([
      prisma.appointment.create({
        data: {
          patientUserId: patient.user.id, doctorProfileId: doctor.doctorProfileId!, doctorUserId: doctor.user.id,
          clinicId, status: 'COMPLETED', consultationMode: 'VIDEO', reason: 'Routine checkup',
          slotStartAt: new Date(Date.now() - 86400000), slotEndAt: new Date(Date.now() - 82800000),
        },
      }),
      prisma.appointment.create({
        data: {
          patientUserId: patient2.user.id, doctorProfileId: doctor.doctorProfileId!, doctorUserId: doctor.user.id,
          clinicId, status: 'CONFIRMED', consultationMode: 'VIDEO', reason: 'Follow-up',
          slotStartAt: new Date(Date.now() + 3600000), slotEndAt: new Date(Date.now() + 3900000),
        },
      }),
    ]);

    // Create some billing data
    await prisma.billingInvoice.create({
      data: {
        clinicId, patientUserId: patient.user.id,
        invoiceNumber: `INV-TWIN-${Date.now()}`,
        status: 'PAID', issuedAt: new Date(), paidAt: new Date(),
        subtotal: 1000, taxAmount: 180, totalAmount: 1180, paidAmount: 1180, dueAmount: 0,
        BillingItem: { create: [{ description: 'Consultation', category: 'CONSULTATION', quantity: 1, unitPrice: 1000, totalPrice: 1000, taxPercent: 18, taxAmount: 180, netPrice: 1180 }] },
      },
    });

    // Create queue entries
    await prisma.queueEntry.create({
      data: { clinicId, patientUserId: patient.user.id, doctorProfileId: doctor.doctorProfileId!, source: 'APPOINTMENT', status: 'COMPLETED', checkedInAt: new Date(Date.now() - 86400000), assignedAt: new Date(Date.now() - 86400000 + 600000), completedAt: new Date(Date.now() - 86400000 + 1800000) },
    });

    await prisma.queueEntry.create({
      data: { clinicId, patientUserId: patient2.user.id, doctorProfileId: doctor.doctorProfileId!, source: 'APPOINTMENT', status: 'WAITING', checkedInAt: new Date(), severityScore: 5 },
    });

    // Create a prescription with diagnosis for disease trends
    await prisma.prescription.create({
      data: {
        patientUserId: patient.user.id, doctorProfileId: doctor.doctorProfileId!,
        status: 'ACTIVE', diagnosis: [{ code: 'J45.0', name: 'Asthma', type: 'primary' }],
        diagnosisSummary: 'Bronchial Asthma',
        issuedAt: new Date(Date.now() - 86400000),
        PrescriptionItem: { create: [{ drugName: 'Salbutamol', dosage: '100mcg', frequency: 'PRN', durationDays: 30, quantity: 1 }] },
      },
    });

    await prisma.prescription.create({
      data: {
        patientUserId: patient2.user.id, doctorProfileId: doctor.doctorProfileId!,
        status: 'ACTIVE', diagnosis: [{ code: 'I10', name: 'Hypertension', type: 'primary' }],
        diagnosisSummary: 'Essential Hypertension',
        issuedAt: new Date(),
        PrescriptionItem: { create: [{ drugName: 'Amlodipine', dosage: '5mg', frequency: 'OD', durationDays: 90, quantity: 90 }] },
      },
    });
  });

  it('GET /clinic/twin/:clinicId — get AI-powered clinic snapshot', async () => {
    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/clinic/twin/${clinicId}`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(data.twinId);
    assert.equal(data.twinId, `clinic-${clinicId}`);
    assert.ok(data.clinic);
    assert.ok(data.snapshot);
    assert.ok(data.revenue);
    assert.ok(data.doctorUtilization);
    assert.ok(Array.isArray(data.doctorUtilization));

    // Snapshot should reflect today's activity
    assert.ok(data.snapshot.patientsToday >= 1);
    assert.ok(data.snapshot.inQueue >= 1);

    // Revenue should include billing data
    assert.ok(data.revenue.monthBilled > 0);
    assert.ok(data.revenue.monthCollected > 0);
    assert.ok(data.revenue.collectionRate > 0);

    // Predictions should exist
    assert.ok(data.predictions);
    assert.ok(data.predictions.predictedPatients >= 1);
    assert.ok(data.predictions.confidence >= 0);

    // Insights should exist
    assert.ok(Array.isArray(data.insights));
  });

  it('GET /clinic/twin/:clinicId/funnel — patient funnel conversion', async () => {
    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/clinic/twin/${clinicId}/funnel`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .query({ days: '30' })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(data.period);
    assert.ok(data.funnel);
    assert.ok(data.funnel.completed >= 1);
    assert.ok(data.funnel.confirmed >= 1);
    assert.ok(data.conversionRate >= 0);
  });

  it('GET /clinic/twin/:clinicId/disease-trends — disease prevalence trends', async () => {
    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/clinic/twin/${clinicId}/disease-trends`)
      .set(authHeader(admin.user.id, ['ADMIN']))
      .query({ days: '90' })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(data.days);
    assert.ok(data.totalConsultations >= 2);
    assert.ok(Array.isArray(data.topConditions));
    assert.ok(data.topConditions.length >= 1);
    const conditionNames = data.topConditions.map((c: { condition: string }) => c.condition);
    assert.ok(conditionNames.includes('Asthma') || conditionNames.includes('Hypertension'));
  });
});
