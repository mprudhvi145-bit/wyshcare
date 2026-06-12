/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/prisma/seed.js
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
 * seed — Database module
 *
 * Responsibilities:
 * - Support database functionality
 *
 * Used By:
 - Standalone (not imported by other source files)
 *
 * Calls:
 - None identified
 *
 * Dependencies:
 - None identified
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Database
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

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const patient = await prisma.user.upsert({
    where: { phoneNumber: '+919876543210' },
    update: {},
    create: {
      wyshId: 'WYSH-20394820',
      phoneNumber: '+919876543210',
      fullName: 'Aarav Reddy',
      preferredLanguage: 'English',
      bloodGroup: 'B+',
      abhaAddress: 'aarav@abdm',
      chronicConditions: ['Hypertension'],
      allergiesSummary: ['Penicillin'],
      isPhoneVerified: true,
      roles: { create: [{ role: 'PATIENT' }] },
    },
  });

  const doctorUser = await prisma.user.upsert({
    where: { phoneNumber: '+919812340000' },
    update: {},
    create: {
      wyshId: 'WYSH-DOCTOR-01',
      phoneNumber: '+919812340000',
      fullName: 'Dr. Kavya Nair',
      preferredLanguage: 'English',
      isPhoneVerified: true,
      chronicConditions: [],
      allergiesSummary: [],
      roles: { create: [{ role: 'DOCTOR' }] },
    },
  });

  const clinic = await prisma.clinic.upsert({
    where: { slug: 'pulseheart-clinic' },
    update: {},
    create: {
      name: 'PulseHeart Clinic',
      slug: 'pulseheart-clinic',
      phoneNumber: '+914012345678',
      addressLine1: 'Road No. 12',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500034',
      languages: ['English', 'Hindi', 'Telugu'],
    },
  });

  const doctor = await prisma.doctorProfile.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      specialization: 'Cardiology',
      subSpecializations: ['Preventive Cardiology'],
      qualifications: ['MBBS', 'MD', 'DM Cardiology'],
      yearsOfExperience: 12,
      registrationNumber: 'TSMC-203948',
      languages: ['English', 'Hindi', 'Malayalam'],
      consultationFee: 850,
      approvalStatus: 'VERIFIED',
      clinicMappings: {
        create: {
          clinicId: clinic.id,
          isPrimary: true,
          consultationFee: 850,
        },
      },
    },
  });

  const dependent = await prisma.user.upsert({
    where: { phoneNumber: '+919900000001' },
    update: {},
    create: {
      wyshId: 'WYSH-FAMILY-01',
      phoneNumber: '+919900000001',
      fullName: 'Sita Reddy',
      preferredLanguage: 'English',
      chronicConditions: ['Type 2 Diabetes'],
      allergiesSummary: ['Sulfa drugs'],
      isPhoneVerified: true,
      roles: { create: [{ role: 'PATIENT' }] },
    },
  });

  await prisma.familyRelation.upsert({
    where: {
      actorUserId_subjectUserId_relationship: {
        actorUserId: patient.id,
        subjectUserId: dependent.id,
        relationship: 'PARENT',
      },
    },
    update: {
      canViewTimeline: true,
      canBookAppointments: true,
      canOrderMedicines: true,
      canUseEmergency: true,
    },
    create: {
      actorUserId: patient.id,
      subjectUserId: dependent.id,
      relationship: 'PARENT',
      canViewTimeline: true,
      canBookAppointments: true,
      canOrderMedicines: true,
      canUseEmergency: true,
    },
  });

  const reportRecord = await prisma.healthRecord.upsert({
    where: { id: 'seed-report-record' },
    update: {},
    create: {
      id: 'seed-report-record',
      userId: patient.id,
      recordType: 'DIAGNOSTIC_REPORT',
      title: 'Lipid Profile - May 2026',
      description: 'Routine lipid panel from annual preventive screening.',
      source: 'MANUAL_UPLOAD',
      storageKey: 'seed/lipid-profile.pdf',
      mimeType: 'application/pdf',
      fileSize: 184320,
      extractedText: 'Total cholesterol 212 mg/dL, LDL 142 mg/dL, HDL 46 mg/dL, Triglycerides 148 mg/dL',
      recordedAt: new Date('2026-05-20T08:00:00.000Z'),
    },
  });

  const prescriptionRecord = await prisma.healthRecord.upsert({
    where: { id: 'seed-prescription-record' },
    update: {},
    create: {
      id: 'seed-prescription-record',
      userId: patient.id,
      recordType: 'PRESCRIPTION',
      title: 'Blood Pressure Follow-up Prescription',
      description: 'Teleconsult prescription for hypertension follow-up.',
      source: 'TELEMEDICINE',
      storageKey: 'seed/hypertension-followup.pdf',
      mimeType: 'application/pdf',
      fileSize: 98304,
      extractedText: 'Telmisartan 40mg once daily for 30 days',
      recordedAt: new Date('2026-05-18T15:00:00.000Z'),
    },
  });

  const prescription = await prisma.prescription.upsert({
    where: { id: 'seed-prescription-1' },
    update: {},
    create: {
      id: 'seed-prescription-1',
      healthRecordId: prescriptionRecord.id,
      patientUserId: patient.id,
      doctorProfileId: doctor.id,
      diagnosisSummary: 'Stage 1 hypertension with elevated LDL trend.',
      instructions: 'Continue low-salt diet and daily BP monitoring.',
      refillDueAt: new Date('2026-06-17T00:00:00.000Z'),
    },
  });

  await prisma.medication.upsert({
    where: { id: 'seed-medication-1' },
    update: {},
    create: {
      id: 'seed-medication-1',
      prescriptionId: prescription.id,
      healthRecordId: prescriptionRecord.id,
      name: 'Telmisartan',
      genericName: 'Telmisartan',
      dosage: '40 mg',
      frequency: 'Once daily',
      durationDays: 30,
      route: 'Oral',
      interactionWarnings: ['Monitor potassium if combined with supplements'],
      adherenceStatus: 'ON_TRACK',
    },
  });

  await prisma.diagnosticReport.upsert({
    where: { id: 'seed-diagnostic-report-1' },
    update: {},
    create: {
      id: 'seed-diagnostic-report-1',
      healthRecordId: reportRecord.id,
      patientUserId: patient.id,
      reportType: 'Lipid Profile',
      summary: 'LDL remains mildly elevated compared with prior trend.',
      abnormalMarkers: { LDL: '142', totalCholesterol: '212' },
      trendSnapshot: { LDLTrend: 'upward' },
      recordedAt: new Date('2026-05-20T08:00:00.000Z'),
    },
  });

  const appointment = await prisma.appointment.upsert({
    where: { id: 'seed-appointment-1' },
    update: {},
    create: {
      id: 'seed-appointment-1',
      patientUserId: patient.id,
      doctorProfileId: doctor.id,
      doctorUserId: doctorUser.id,
      clinicId: clinic.id,
      status: 'CONFIRMED',
      consultationMode: 'VIDEO',
      reason: 'Review lipid profile and blood pressure readings',
      slotStartAt: new Date('2026-05-28T12:00:00.000Z'),
      slotEndAt: new Date('2026-05-28T12:30:00.000Z'),
    },
  });

  await prisma.consultationSummary.upsert({
    where: { id: 'seed-summary-1' },
    update: {},
    create: {
      id: 'seed-summary-1',
      userId: patient.id,
      title: 'Cardiology follow-up summary',
      summary: 'BP controlled better over the last 2 weeks. Lipid management needs closer follow-up.',
      followUpActions: ['Continue medication', 'Repeat lipid panel in 6 weeks'],
    },
  });

  await prisma.aIMemoryNode.upsert({
    where: { id: 'seed-memory-1' },
    update: {},
    create: {
      id: 'seed-memory-1',
      userId: patient.id,
      nodeType: 'CARE_SUMMARY',
      title: 'Hypertension trend watch',
      summary: 'Patient requires periodic BP and LDL monitoring with refill adherence.',
      sourceRef: prescription.id,
      confidenceScore: 0.86,
    },
  });

  const pharmacyPartner = await prisma.pharmacyPartner.upsert({
    where: { id: 'seed-pharmacy-1' },
    update: {},
    create: {
      id: 'seed-pharmacy-1',
      name: 'MedHub Pharmacy',
      phoneNumber: '+914011112222',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500034',
      verificationStatus: 'VERIFIED',
      supportsDelivery: true,
    },
  });

  await prisma.pharmacyOrder.upsert({
    where: { id: 'seed-pharmacy-order-1' },
    update: {},
    create: {
      id: 'seed-pharmacy-order-1',
      userId: patient.id,
      partnerId: pharmacyPartner.id,
      prescriptionId: prescription.id,
      status: 'QUOTED',
      quotedTotal: 780,
      deliveryAddress: { line1: 'Banjara Hills', city: 'Hyderabad' },
      medicinePayload: [{ name: 'Telmisartan', dosage: '40 mg', qty: 30 }],
    },
  });

  await prisma.diagnosticsPartner.upsert({
    where: { id: 'seed-diagnostics-1' },
    update: {},
    create: {
      id: 'seed-diagnostics-1',
      name: 'HealthAxis Labs',
      city: 'Hyderabad',
      pincode: '500034',
      homeCollection: true,
      accreditation: 'NABL',
      verificationStatus: 'VERIFIED',
    },
  });

  await prisma.timelineEvent.createMany({
    data: [
      {
        userId: patient.id,
        healthRecordId: reportRecord.id,
        type: 'REPORT',
        title: 'Lipid Profile Uploaded',
        summary: 'AI flagged LDL trend increase and suggested a physician review.',
        occurredAt: new Date('2026-05-20T08:15:00.000Z'),
      },
      {
        userId: patient.id,
        healthRecordId: prescriptionRecord.id,
        type: 'CONSULTATION',
        title: 'Teleconsult with Dr. Kavya Nair',
        summary: 'Follow-up for blood pressure management with refill advice.',
        occurredAt: new Date('2026-05-18T15:00:00.000Z'),
      },
      {
        userId: patient.id,
        type: 'APPOINTMENT',
        title: 'Upcoming cardiology consultation',
        summary: 'Video consultation booked for 28 May 2026, 5:30 PM IST.',
        occurredAt: appointment.slotStartAt,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.consentGrant.create({
    data: {
      ownerUserId: patient.id,
      grantedToUserId: doctorUser.id,
      accessLevel: 'LIMITED',
      accessMethod: 'MANUAL_APPROVAL',
      status: 'ACTIVE',
      purpose: 'Cardiology follow-up',
      scope: { reports: true, prescriptions: true },
      grantedAt: new Date(),
      expiresAt: new Date('2026-05-28T12:00:00.000Z'),
    },
  });

  console.log({ patientId: patient.id, doctorId: doctor.id });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
