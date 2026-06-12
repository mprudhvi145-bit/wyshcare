/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/test/e2e/prescription.e2e-spec.ts
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
 * prescription.e2e-spec — Prescription module
 *
 * Responsibilities:
 * - Support prescription functionality
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
Prescription
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

describe('Prescription E2E', () => {
  let patient: Awaited<ReturnType<typeof createTestUser>>;
  let doctor: Awaited<ReturnType<typeof createTestUser>>;
  let drugIds: string[] = [];

  before(async () => { await bootstrapE2e(); });
  after(async () => { await teardownE2e(); });
  beforeEach(async () => {
    await cleanDatabase();
    patient = await createTestUser({ role: 'PATIENT', phoneNumber: '+919999990001' });
    doctor = await createTestUser({ role: 'DOCTOR', phoneNumber: '+919999990002' });

    const prisma = getPrisma();
    const drugs = await Promise.all([
      prisma.drug.create({
        data: {
          genericName: 'Paracetamol',
          strength: '650mg',
          dosageForm: 'Tablet',
          isPrescriptionRequired: false,
          drugClass: 'ANALGESICS',
        },
      }),
      prisma.drug.create({
        data: {
          genericName: 'Metformin',
          strength: '500mg',
          dosageForm: 'Tablet',
          isPrescriptionRequired: true,
          drugClass: 'BIGUANIDES',
          therapeuticClass: 'Antidiabetic',
        },
      }),
      prisma.drug.create({
        data: {
          genericName: 'Amlodipine',
          strength: '5mg',
          dosageForm: 'Tablet',
          isPrescriptionRequired: true,
          drugClass: 'CALCIUM_CHANNEL_BLOCKERS',
          therapeuticClass: 'Antihypertensive',
        },
      }),
      prisma.drug.create({
        data: {
          genericName: 'Warfarin',
          strength: '5mg',
          dosageForm: 'Tablet',
          isPrescriptionRequired: true,
          drugClass: 'ANTICOAGULANTS',
          therapeuticClass: 'Anticoagulant',
        },
      }),
    ]);
    drugIds = drugs.map((d) => d.id);

    const paracetamolId = drugIds[0]!;
    const warfarinId = drugIds[3]!;
    await prisma.drugInteraction.create({
      data: {
        subjectDrugId: paracetamolId,
        objectDrugId: warfarinId,
        severity: 'MODERATE',
        description: 'Paracetamol may enhance the anticoagulant effect of warfarin.',
        recommendation: 'Monitor INR more frequently when starting paracetamol.',
      },
    });
  });

  it('GET /prescriptions/drugs — search drugs', async () => {
    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/prescriptions/drugs`)
      .set(authHeader(patient.user.id, ['PATIENT']))
      .query({ q: 'Paracetamol' })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 1);
    assert.equal(data[0].genericName, 'Paracetamol');
  });

  it('GET /prescriptions/drugs — returns empty for short query', async () => {
    const req = getRequest();
    const res = await req.get(`${API_PREFIX}/prescriptions/drugs`)
      .set(authHeader(patient.user.id, ['PATIENT']))
      .query({ q: 'a' })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.deepEqual(data, []);
  });

  it('POST /prescriptions — create draft prescription', async () => {
    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/prescriptions`)
      .set(authHeader(doctor.user.id, ['DOCTOR']))
      .send({
        patientUserId: patient.user.id,
        diagnosis: [{ code: 'E11.9', name: 'Type 2 diabetes without complications', type: 'primary' }],
        diagnosisSummary: 'Type 2 Diabetes',
        instructions: 'Take with food',
        items: [
          {
            drugId: drugIds[1]!,
            drugName: 'Metformin',
            dosage: '500mg',
            frequency: 'BID',
            durationDays: 30,
            quantity: 60,
            refills: 2,
            instructions: 'Take after breakfast and dinner',
          },
        ],
      })
      .expect(201);

    const data = res.body.data ?? res.body;
    const rx = data.prescription ?? data;
    assert.ok(rx.id);
    assert.equal(rx.status, 'DRAFT');
    assert.equal(rx.patientUserId, patient.user.id);
    assert.ok(rx.items?.length >= 1);
    assert.equal(rx.items[0].drugName, 'Metformin');
    assert.ok(data.warnings !== undefined);
  });

  it('POST /prescriptions — create with multiple items', async () => {
    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/prescriptions`)
      .set(authHeader(doctor.user.id, ['DOCTOR']))
      .send({
        patientUserId: patient.user.id,
        diagnosis: [{ code: 'I10', name: 'Essential hypertension', type: 'primary' }],
        diagnosisSummary: 'Hypertension with diabetes',
        items: [
          {
            drugId: drugIds[1]!,
            drugName: 'Metformin',
            dosage: '500mg',
            frequency: 'BID',
            durationDays: 90,
            quantity: 180,
            refills: 3,
          },
          {
            drugId: drugIds[2]!,
            drugName: 'Amlodipine',
            dosage: '5mg',
            frequency: 'OD',
            durationDays: 90,
            quantity: 90,
            refills: 3,
          },
        ],
      })
      .expect(201);

    const data = res.body.data ?? res.body;
    const rx = data.prescription ?? data;
    assert.equal(rx.items.length, 2);
    assert.equal(rx.items[0].drugName, 'Metformin');
    assert.equal(rx.items[1].drugName, 'Amlodipine');
  });

  it('POST /prescriptions — doctor without profile gets 400', async () => {
    const noProfileUser = await createTestUser({ role: 'DOCTOR', doctorProfile: false, phoneNumber: '+919999990003' });
    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/prescriptions`)
      .set(authHeader(noProfileUser.user.id, ['DOCTOR']))
      .send({
        patientUserId: patient.user.id,
        items: [{ drugName: 'Test', dosage: '10mg', frequency: 'OD', durationDays: 7, quantity: 7 }],
      })
      .expect(400);

    const data = res.body;
    assert.ok(data.success === false);
    assert.ok(data.error?.message?.includes('Doctor profile'));
  });

  it('PATCH /prescriptions/:id — update draft prescription', async () => {
    const prisma = getPrisma();
    const req = getRequest();

    const rx = await prisma.prescription.create({
      data: {
        patientUserId: patient.user.id,
        doctorProfileId: doctor.doctorProfileId,
        status: 'DRAFT',
        diagnosisSummary: 'Initial diagnosis',
        PrescriptionItem: {
          create: [{
            drugId: drugIds[1]!,
            drugName: 'Metformin',
            dosage: '500mg',
            frequency: 'BID',
            durationDays: 30,
            quantity: 60,
          }],
        },
      },
    });

    const res = await req.patch(`${API_PREFIX}/prescriptions/${rx.id}`)
      .set(authHeader(doctor.user.id, ['DOCTOR']))
      .send({
        diagnosisSummary: 'Updated: Type 2 Diabetes',
        instructions: 'Take with meals',
        items: [
          {
            drugId: drugIds[1]!,
            drugName: 'Metformin',
            dosage: '1000mg',
            frequency: 'BID',
            durationDays: 90,
            quantity: 180,
            refills: 3,
          },
        ],
      })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.equal(data.items[0].dosage, '1000mg');
    assert.equal(data.items[0].durationDays, 90);
  });

  it('PATCH /prescriptions/:id/issue — issue draft prescription', async () => {
    const prisma = getPrisma();
    const req = getRequest();

    const rx = await prisma.prescription.create({
      data: {
        patientUserId: patient.user.id,
        doctorProfileId: doctor.doctorProfileId,
        status: 'DRAFT',
        diagnosisSummary: 'Type 2 Diabetes',
        PrescriptionItem: {
          create: [{
            drugId: drugIds[1]!,
            drugName: 'Metformin',
            dosage: '500mg',
            frequency: 'BID',
            durationDays: 30,
            quantity: 60,
          }],
        },
      },
    });

    const res = await req.patch(`${API_PREFIX}/prescriptions/${rx.id}/issue`)
      .set(authHeader(doctor.user.id, ['DOCTOR']))
      .send({})
      .expect(200);

    const data = res.body.data ?? res.body;
    const issued = data.prescription ?? data;
    assert.equal(issued.status, 'ACTIVE');
    assert.ok(data.verification);
    assert.ok(data.verification.qrHash);
    assert.ok(data.verification.verificationUrl);
  });

  it('PATCH /prescriptions/:id/cancel — cancel prescription', async () => {
    const prisma = getPrisma();
    const req = getRequest();

    const rx = await prisma.prescription.create({
      data: {
        patientUserId: patient.user.id,
        doctorProfileId: doctor.doctorProfileId,
        status: 'ACTIVE',
        diagnosisSummary: 'Test',
        PrescriptionItem: {
          create: [{
            drugName: 'Metformin',
            dosage: '500mg',
            frequency: 'BID',
            durationDays: 30,
            quantity: 60,
          }],
        },
      },
    });

    const res = await req.patch(`${API_PREFIX}/prescriptions/${rx.id}/cancel`)
      .set(authHeader(doctor.user.id, ['DOCTOR']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.equal(data.status, 'CANCELLED');
  });

  it('GET /prescriptions/:id — get prescription details', async () => {
    const prisma = getPrisma();
    const req = getRequest();

    const rx = await prisma.prescription.create({
      data: {
        patientUserId: patient.user.id,
        doctorProfileId: doctor.doctorProfileId,
        status: 'ACTIVE',
        diagnosis: [{ code: 'E11.9', name: 'Type 2 Diabetes', type: 'primary' }],
        diagnosisSummary: 'Type 2 Diabetes',
        instructions: 'Take with food',
        issuedAt: new Date(),
        PrescriptionItem: {
          create: [{
            drugId: drugIds[1]!,
            drugName: 'Metformin',
            dosage: '500mg',
            frequency: 'BID',
            durationDays: 30,
            quantity: 60,
          }],
        },
      },
    });

    const res = await req.get(`${API_PREFIX}/prescriptions/${rx.id}`)
      .set(authHeader(doctor.user.id, ['DOCTOR']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.equal(data.id, rx.id);
    assert.equal(data.patientUserId, patient.user.id);
    assert.equal(data.items.length, 1);
    assert.equal(data.items[0].drugName, 'Metformin');
  });

  it('GET /prescriptions?patientUserId= — list patient prescriptions', async () => {
    const prisma = getPrisma();
    const req = getRequest();

    await prisma.prescription.create({
      data: {
        patientUserId: patient.user.id,
        doctorProfileId: doctor.doctorProfileId,
        status: 'ACTIVE',
        diagnosisSummary: 'Test',
        PrescriptionItem: { create: [{ drugName: 'Metformin', dosage: '500mg', frequency: 'BID', durationDays: 30, quantity: 60 }] },
      },
    });

    const res = await req.get(`${API_PREFIX}/prescriptions`)
      .set(authHeader(doctor.user.id, ['DOCTOR']))
      .query({ patientUserId: patient.user.id })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 1);
  });

  it('POST /prescriptions/check-interactions — detect drug interaction', async () => {
    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/prescriptions/check-interactions`)
      .set(authHeader(doctor.user.id, ['DOCTOR']))
      .send({ drugIds: [drugIds[0]!, drugIds[3]!] })
      .expect(201);

    const data = res.body.data ?? res.body;
    assert.ok(data.interactions !== undefined);
    assert.ok(data.interactions.length >= 1);
    assert.equal(data.interactions[0].severity, 'MODERATE');
  });

  it('POST /prescriptions/check-interactions — with patient context', async () => {
    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/prescriptions/check-interactions`)
      .set(authHeader(doctor.user.id, ['DOCTOR']))
      .send({
        drugIds: [drugIds[0]!],
        patientUserId: patient.user.id,
      })
      .expect(201);

    const data = res.body.data ?? res.body;
    assert.ok(data.interactions !== undefined);
    assert.ok(data.activeDrugs !== undefined);
  });

  it('POST /prescriptions/check-duplicate-therapy — detect duplicates', async () => {
    const prisma = getPrisma();
    const req = getRequest();

    const drugA = await prisma.drug.create({
      data: { genericName: 'Enalapril', strength: '5mg', dosageForm: 'Tablet', drugClass: 'ACE_INHIBITORS', therapeuticClass: 'ACE Inhibitor' },
    });
    const drugB = await prisma.drug.create({
      data: { genericName: 'Ramipril', strength: '5mg', dosageForm: 'Tablet', drugClass: 'ACE_INHIBITORS', therapeuticClass: 'ACE Inhibitor' },
    });

    const res = await req.post(`${API_PREFIX}/prescriptions/check-duplicate-therapy`)
      .set(authHeader(doctor.user.id, ['DOCTOR']))
      .send({ drugIds: [drugA.id, drugB.id] })
      .expect(201);

    const data = res.body.data ?? res.body;
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 1);
    assert.match(data[0].drugClass, /ACE/i);
  });

  it('GET /prescriptions/:id/pdf — generate PDF', async () => {
    const prisma = getPrisma();
    const req = getRequest();

    const rx = await prisma.prescription.create({
      data: {
        patientUserId: patient.user.id,
        doctorProfileId: doctor.doctorProfileId,
        status: 'ACTIVE',
        diagnosisSummary: 'Type 2 Diabetes',
        issuedAt: new Date(),
        PrescriptionItem: { create: [{ drugName: 'Metformin', dosage: '500mg', frequency: 'BID', durationDays: 30, quantity: 60 }] },
      },
    });

    const res = await req.get(`${API_PREFIX}/prescriptions/${rx.id}/pdf`)
      .set(authHeader(doctor.user.id, ['DOCTOR']))
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(data.html);
    assert.ok(data.html.includes('WYSHCARE'));
    assert.ok(data.html.includes('Metformin'));
    assert.ok(data.html.includes('500mg'));
  });

  it('GET /prescriptions/verify/qr/:qrHash — QR verification', async () => {
    const prisma = getPrisma();
    const req = getRequest();

    const rx = await prisma.prescription.create({
      data: {
        patientUserId: patient.user.id,
        doctorProfileId: doctor.doctorProfileId,
        status: 'DRAFT',
        diagnosisSummary: 'Test',
        PrescriptionItem: { create: [{ drugName: 'Metformin', dosage: '500mg', frequency: 'BID', durationDays: 30, quantity: 60 }] },
      },
    });

    // Issue to generate QR
    const issueRes = await req.patch(`${API_PREFIX}/prescriptions/${rx.id}/issue`)
      .set(authHeader(doctor.user.id, ['DOCTOR']))
      .send({})
      .expect(200);

    const issueData = issueRes.body.data ?? issueRes.body;
    const qrHash = issueData.verification?.qrHash;
    assert.ok(qrHash);

    const verifyRes = await req.get(`${API_PREFIX}/prescriptions/verify/qr/${qrHash}`)
      .set(authHeader(patient.user.id, ['PATIENT']))
      .expect(200);

    const verifyData = verifyRes.body.data ?? verifyRes.body;
    assert.ok(verifyData.valid);
    assert.equal(verifyData.prescriptionId, rx.id);
    assert.equal(verifyData.tampered, false);
  });

  it('POST /prescriptions/:id/send-to-pharmacy/:pharmacyPartnerId — send to pharmacy', async () => {
    const prisma = getPrisma();
    const req = getRequest();

    const partner = await prisma.pharmacyPartner.create({
      data: {
        name: 'Test Pharmacy',
        phoneNumber: '+919999990099',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        verificationStatus: 'VERIFIED',
        isActive: true,
      },
    });

    const rx = await prisma.prescription.create({
      data: {
        patientUserId: patient.user.id,
        doctorProfileId: doctor.doctorProfileId,
        status: 'ACTIVE',
        diagnosisSummary: 'Test',
        issuedAt: new Date(),
        PrescriptionItem: { create: [{ drugName: 'Metformin', dosage: '500mg', frequency: 'BID', durationDays: 30, quantity: 60 }] },
      },
    });

    const res = await req.post(`${API_PREFIX}/prescriptions/${rx.id}/send-to-pharmacy/${partner.id}`)
      .set(authHeader(doctor.user.id, ['DOCTOR']))
      .expect(201);

    const data = res.body.data ?? res.body;
    assert.ok(data.id);
    assert.equal(data.prescriptionId, rx.id);
    assert.equal(data.partnerId, partner.id);
    assert.equal(data.status, 'PENDING_VERIFICATION');
  });

  it('POST /prescriptions/:id/schedules — create medication schedules', async () => {
    const prisma = getPrisma();
    const req = getRequest();

    const rx = await prisma.prescription.create({
      data: {
        patientUserId: patient.user.id,
        doctorProfileId: doctor.doctorProfileId,
        status: 'ACTIVE',
        diagnosisSummary: 'Test',
        issuedAt: new Date(),
        PrescriptionItem: {
          create: [
            { drugId: drugIds[1]!, drugName: 'Metformin', dosage: '500mg', frequency: 'BID', durationDays: 30, quantity: 60 },
          ],
        },
      },
    });

    const res = await req.post(`${API_PREFIX}/prescriptions/${rx.id}/schedules`)
      .set(authHeader(doctor.user.id, ['DOCTOR']))
      .expect(201);

    const data = res.body.data ?? res.body;
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 1);
    assert.ok(data[0].times);
  });

  it('GET /prescriptions/adherence/report/:patientUserId — adherence report', async () => {
    const prisma = getPrisma();
    const req = getRequest();

    const rx = await prisma.prescription.create({
      data: {
        patientUserId: patient.user.id,
        doctorProfileId: doctor.doctorProfileId!,
        status: 'ACTIVE',
        diagnosisSummary: 'Test',
        issuedAt: new Date(),
      },
    });

    const item = await prisma.prescriptionItem.create({
      data: {
        prescriptionId: rx.id,
        drugId: drugIds[1]!,
        drugName: 'Metformin',
        dosage: '500mg',
        frequency: 'BID',
        durationDays: 30,
        quantity: 60,
      },
    });

    const schedule = await prisma.medicationSchedule.create({
      data: {
        userId: patient.user.id,
        prescriptionItemId: item.id,
        drugId: drugIds[1]!,
        times: ['08:00', '20:00'],
        daysOfWeek: [],
        startDate: new Date(Date.now() - 7 * 86400000),
      },
    });

    await prisma.adherenceLog.create({
      data: {
        scheduleId: schedule.id,
        userId: patient.user.id,
        status: 'TAKEN',
        scheduledAt: new Date(Date.now() - 86400000),
        takenAt: new Date(Date.now() - 86400000),
      },
    });

    await prisma.adherenceLog.create({
      data: {
        scheduleId: schedule.id,
        userId: patient.user.id,
        status: 'MISSED',
        scheduledAt: new Date(Date.now() - 2 * 86400000),
      },
    });

    const res = await req.get(`${API_PREFIX}/prescriptions/adherence/report/${patient.user.id}`)
      .set(authHeader(patient.user.id, ['PATIENT']))
      .query({ days: '30' })
      .expect(200);

    const data = res.body.data ?? res.body;
    assert.ok(data.overallAdherence >= 0);
    assert.ok(data.schedules.length >= 1);
    assert.equal(data.schedules[0].totalDoses, 2);
  });

  it('POST /health-graph/sync/prescription/:id — sync to health graph', async () => {
    const prisma = getPrisma();
    const req = getRequest();

    const rx = await prisma.prescription.create({
      data: {
        patientUserId: patient.user.id,
        doctorProfileId: doctor.doctorProfileId,
        status: 'ACTIVE',
        diagnosisSummary: 'Type 2 Diabetes',
        issuedAt: new Date(),
        PrescriptionItem: {
          create: [{
            drugId: drugIds[1]!,
            drugName: 'Metformin',
            dosage: '500mg',
            frequency: 'BID',
            durationDays: 30,
            quantity: 60,
          }],
        },
      },
    });

    const res = await req.post(`${API_PREFIX}/health-graph/sync/prescription/${rx.id}`)
      .set(authHeader(patient.user.id, ['PATIENT']))
      .expect(201);

    const data = res.body.data ?? res.body;
    assert.ok(data !== undefined);
  });

  it('POST /prescriptions/drugs — create drug (admin)', async () => {
    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/prescriptions/drugs`)
      .set(authHeader(doctor.user.id, ['ADMIN']))
      .send({
        genericName: 'Atorvastatin',
        strength: '10mg',
        dosageForm: 'Tablet',
        drugClass: 'STATINS',
        therapeuticClass: 'Statin',
        isPrescriptionRequired: true,
      })
      .expect(201);

    const data = res.body.data ?? res.body;
    assert.ok(data.id);
    assert.equal(data.genericName, 'Atorvastatin');
  });

  it('POST /prescriptions/drugs/bulk — bulk import drugs', async () => {
    const req = getRequest();
    const res = await req.post(`${API_PREFIX}/prescriptions/drugs/bulk`)
      .set(authHeader(doctor.user.id, ['ADMIN']))
      .send({
        drugs: [
          { genericName: 'Omeprazole', strength: '20mg', dosageForm: 'Capsule', drugClass: 'PROTON_PUMP_INHIBITORS' },
          { genericName: 'Pantoprazole', strength: '40mg', dosageForm: 'Tablet', drugClass: 'PROTON_PUMP_INHIBITORS' },
        ],
      })
      .expect(201);

    const data = res.body.data ?? res.body;
    assert.equal(data.imported, 2);
  });
});
