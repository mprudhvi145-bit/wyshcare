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

  // ─────────────────────────────────────────────────────────────────────────
  // SEED: Additional DOCTORS — one per specialty (7 new)
  // ─────────────────────────────────────────────────────────────────────────

  const DOCTORS = [
    {
      phone: '+919812340001', wyshId: 'WYSH-DOCTOR-02', name: 'Dr. Dinesh Sharma',
      specialization: 'Dental', sub: ['Restorative Dentistry'],
      qualifications: ['BDS', 'MDS Prosthodontics'], exp: 8, reg: 'DSMC-349021',
      fee: 600, lang: ['English', 'Hindi'],
    },
    {
      phone: '+919812340002', wyshId: 'WYSH-DOCTOR-03', name: 'Dr. Meera Patel',
      specialization: 'Dermatology', sub: ['Cosmetic Dermatology'],
      qualifications: ['MBBS', 'MD Dermatology'], exp: 10, reg: 'TSMC-349022',
      fee: 900, lang: ['English', 'Hindi', 'Gujarati'],
    },
    {
      phone: '+919812340003', wyshId: 'WYSH-DOCTOR-04', name: 'Dr. Arun Kapoor',
      specialization: 'ENT', sub: ['Otology'],
      qualifications: ['MBBS', 'MS ENT'], exp: 14, reg: 'TSMC-349023',
      fee: 750, lang: ['English', 'Hindi', 'Telugu'],
    },
    {
      phone: '+919812340004', wyshId: 'WYSH-DOCTOR-05', name: 'Dr. Priya Sharma',
      specialization: 'Ophthalmology', sub: ['Cataract Surgery'],
      qualifications: ['MBBS', 'MS Ophthalmology', 'FRCS'], exp: 11, reg: 'TSMC-349024',
      fee: 850, lang: ['English', 'Hindi'],
    },
    {
      phone: '+919812340005', wyshId: 'WYSH-DOCTOR-06', name: 'Dr. Rajesh Kumar',
      specialization: 'General Medicine', sub: ['Preventive Medicine'],
      qualifications: ['MBBS', 'MD General Medicine'], exp: 15, reg: 'TSMC-349025',
      fee: 700, lang: ['English', 'Hindi', 'Telugu'],
    },
    {
      phone: '+919812340006', wyshId: 'WYSH-DOCTOR-07', name: 'Dr. Ananya Singh',
      specialization: 'Pediatrics', sub: ['Neonatology'],
      qualifications: ['MBBS', 'MD Pediatrics', 'DNB'], exp: 9, reg: 'TSMC-349026',
      fee: 650, lang: ['English', 'Hindi'],
    },
    {
      phone: '+919812340007', wyshId: 'WYSH-DOCTOR-08', name: 'Dr. Vikram Joshi',
      specialization: 'Orthopedics', sub: ['Joint Replacement'],
      qualifications: ['MBBS', 'MS Orthopedics', 'Fellowship Knee Surgery'], exp: 13, reg: 'TSMC-349027',
      fee: 1000, lang: ['English', 'Hindi', 'Marathi'],
    },
  ];

  for (const d of DOCTORS) {
    const user = await prisma.user.upsert({
      where: { phoneNumber: d.phone },
      update: {},
      create: {
        wyshId: d.wyshId,
        phoneNumber: d.phone,
        fullName: d.name,
        preferredLanguage: 'English',
        isPhoneVerified: true,
        chronicConditions: [],
        allergiesSummary: [],
        roles: { create: [{ role: 'DOCTOR' }] },
      },
    });

    await prisma.doctorProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        specialization: d.specialization,
        subSpecializations: d.sub,
        qualifications: d.qualifications,
        yearsOfExperience: d.exp,
        registrationNumber: d.reg,
        languages: d.lang,
        consultationFee: d.fee,
        approvalStatus: 'VERIFIED',
        clinicMappings: {
          create: {
            clinicId: clinic.id,
            isPrimary: true,
            consultationFee: d.fee,
          },
        },
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SEED: Additional PATIENT — Rahul Verma (for Dental OS)
  // ─────────────────────────────────────────────────────────────────────────

  await prisma.user.upsert({
    where: { phoneNumber: '+919812340020' },
    update: {},
    create: {
      wyshId: 'WYSH-PATIENT-02',
      phoneNumber: '+919812340020',
      fullName: 'Rahul Verma',
      preferredLanguage: 'English',
      bloodGroup: 'B+',
      isPhoneVerified: true,
      chronicConditions: ['Dental Caries'],
      allergiesSummary: ['Penicillin'],
      roles: { create: [{ role: 'PATIENT' }] },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SEED: STAFF users — Nurse, Lab, Pharmacy, Admin
  // ─────────────────────────────────────────────────────────────────────────

  const STAFF = [
    {
      phone: '+919812340010', wyshId: 'WYSH-NURSE-01', name: 'Sister Lakshmi Devi',
      role: 'NURSE', staffRole: 'NURSE',
    },
    {
      phone: '+919812340011', wyshId: 'WYSH-LAB-01', name: 'Mr. Sanjay Verma',
      role: 'LAB_PARTNER', staffRole: 'DIAGNOSTICS',
    },
    {
      phone: '+919812340012', wyshId: 'WYSH-PHARMACY-01', name: 'Mr. Rohan Mehta',
      role: 'PHARMACY_PARTNER', staffRole: 'PHARMACY',
    },
    {
      phone: '+919812340013', wyshId: 'WYSH-ADMIN-01', name: 'Ms. Anita Desai',
      role: 'ADMIN', staffRole: 'ADMIN',
    },
  ];

  for (const s of STAFF) {
    const user = await prisma.user.upsert({
      where: { phoneNumber: s.phone },
      update: {},
      create: {
        wyshId: s.wyshId,
        phoneNumber: s.phone,
        fullName: s.name,
        preferredLanguage: 'English',
        isPhoneVerified: true,
        chronicConditions: [],
        allergiesSummary: [],
        roles: { create: [{ role: s.role }] },
      },
    });

    await prisma.staffAssignment.upsert({
      where: {
        userId_clinicId_role: {
          userId: user.id,
          clinicId: clinic.id,
          role: s.staffRole,
        },
      },
      update: {},
      create: {
        id: `seed-staff-${s.staffRole.toLowerCase()}`,
        userId: user.id,
        clinicId: clinic.id,
        role: s.staffRole,
        isActive: true,
      },
    });
  }

  console.log({
    patientId: patient.id,
    doctorId: doctor.id,
    doctorsCreated: 1 + DOCTORS.length,
    staffCreated: STAFF.length,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
