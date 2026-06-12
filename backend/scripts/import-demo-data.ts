/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/scripts/import-demo-data.ts
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
 * import-demo-data — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - backend/src/modules/ehr/timeline.service.ts
 - backend/src/modules/health-graph-v2/wearables.service.ts
 - backend/src/modules/emergency/emergency.service.ts
 - backend/src/modules/ehr/cds.service.ts
 - backend/src/modules/consent/consent.service.ts
 - backend/src/modules/insurance/insurance.service.ts
 - scripts/validate-integrity.ts
 - backend/src/modules/digital-twin/digital-twin.service.ts
 *
 * Calls:
 - client
 - dotenv
 *
 * Dependencies:
 - client
 - dotenv
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

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const MOCK_PATIENTS_DATA = [
  {
    id: 'pat-001',
    fullName: 'Rahul Verma',
    age: 45,
    gender: 'Male',
    bloodGroup: 'B+',
    mrn: 'WYSH-001',
    specialty: 'dental',
    condition: 'Dental Caries #26, Gingivitis, Impacted #18',
    risk: 'low',
    vitals: { bp: '128/82', hr: 72, temp: 98.6, spo2: 98 },
    allergies: ['Penicillin'],
    medications: ['Amoxicillin', 'Ibuprofen'],
  },
  {
    id: 'pat-002',
    fullName: 'Ananya Sharma',
    age: 32,
    gender: 'Female',
    bloodGroup: 'A+',
    mrn: 'WYSH-002',
    specialty: 'general-medicine',
    condition: 'Hypertension Stage 1, Migraine, Vit D Deficiency',
    risk: 'medium',
    vitals: { bp: '142/88', hr: 78, temp: 98.4, spo2: 97 },
    allergies: ['Sulfa'],
    medications: ['Losartan', 'Sumatriptan'],
  },
  {
    id: 'pat-003',
    fullName: 'Dr. Suresh Mehta',
    age: 68,
    gender: 'Male',
    bloodGroup: 'O+',
    mrn: 'WYSH-003',
    specialty: 'ophthalmology',
    condition: 'Cataract OD Grade 2, Glaucoma Suspect, Myopia',
    risk: 'medium',
    vitals: { bp: '134/78', hr: 70, temp: 98.2, spo2: 99 },
    allergies: [],
    medications: ['Latanoprost', 'Timolol'],
  },
  {
    id: 'pat-004',
    fullName: 'Priya Patel',
    age: 29,
    gender: 'Female',
    bloodGroup: 'AB+',
    mrn: 'WYSH-004',
    specialty: 'dermatology',
    condition: 'Acne Vulgaris, Androgenetic Alopecia Ludwig I, Melasma',
    risk: 'low',
    vitals: { bp: '118/76', hr: 68, temp: 98.4, spo2: 99 },
    allergies: ['Doxycycline'],
    medications: ['Clindamycin gel', 'Minoxidil'],
  },
  {
    id: 'pat-005',
    fullName: 'Vikram Singh',
    age: 52,
    gender: 'Male',
    bloodGroup: 'B-',
    mrn: 'WYSH-005',
    specialty: 'ent',
    condition: 'Chronic Sinusitis, SNHL Left, Allergic Rhinitis',
    risk: 'medium',
    vitals: { bp: '126/80', hr: 74, temp: 98.8, spo2: 96 },
    allergies: ['Aspirin'],
    medications: ['Fluticasone', 'Montelukast'],
  },
  {
    id: 'pat-006',
    fullName: 'Kavita Reddy',
    age: 7,
    gender: 'Female',
    bloodGroup: 'A+',
    mrn: 'WYSH-006',
    specialty: 'pediatrics',
    condition: 'Growth Monitoring, MMR 2nd Dose Due',
    risk: 'low',
    vitals: { bp: '100/62', hr: 85, temp: 98.6, spo2: 99 },
    allergies: [],
    medications: [],
  },
  {
    id: 'pat-007',
    fullName: 'Rajesh Kumar',
    age: 55,
    gender: 'Male',
    bloodGroup: 'A+',
    mrn: 'WYSH-007',
    specialty: 'cardiology',
    condition: 'Chest Pain Evaluation, Hypertension',
    risk: 'high',
    vitals: { bp: '156/94', hr: 88, temp: 98.3, spo2: 96 },
    allergies: [],
    medications: ['Metoprolol', 'Atorvastatin'],
  },
  {
    id: 'pat-008',
    fullName: 'Sunita Gupta',
    age: 62,
    gender: 'Female',
    bloodGroup: 'O-',
    mrn: 'WYSH-008',
    specialty: 'orthopedics',
    condition: 'Knee OA Grade 3, Osteoporosis',
    risk: 'medium',
    vitals: { bp: '130/82', hr: 76, temp: 98.5, spo2: 98 },
    allergies: ['NSAIDs'],
    medications: ['Calcium', 'Vit D', 'Alendronate'],
  },
  {
    id: 'pat-009',
    fullName: 'Aakanksha Rao',
    age: 28,
    gender: 'Female',
    bloodGroup: 'O+',
    mrn: 'WYSH-009',
    specialty: 'gynecology',
    condition: 'Prenatal Checkup, G1P0 14 Weeks, Mild Dysmenorrhea',
    risk: 'low',
    vitals: { bp: '116/70', hr: 74, temp: 98.2, spo2: 99 },
    allergies: [],
    medications: ['Prenatal Vitamins', 'Folic Acid'],
  },
  {
    id: 'pat-010',
    fullName: 'Devendra Joshi',
    age: 58,
    gender: 'Male',
    bloodGroup: 'AB-',
    mrn: 'WYSH-010',
    specialty: 'neurology',
    condition: 'Parkinsonian Tremors, Mild Cognitive Impairment',
    risk: 'medium',
    vitals: { bp: '132/84', hr: 68, temp: 98.4, spo2: 97 },
    allergies: ['Levodopa (mild nausea)'],
    medications: ['Carbidopa-Levodopa', 'Donepezil'],
  },
  {
    id: 'pat-011',
    fullName: 'Shreya Iyer',
    age: 24,
    gender: 'Female',
    bloodGroup: 'B+',
    mrn: 'WYSH-011',
    specialty: 'psychiatry',
    condition: 'Major Depressive Disorder (Moderate), GAD',
    risk: 'medium',
    vitals: { bp: '112/72', hr: 82, temp: 98.6, spo2: 99 },
    allergies: [],
    medications: ['Sertraline', 'Clonazepam'],
  },
  {
    id: 'pat-012',
    fullName: 'Harish Chandra',
    age: 65,
    gender: 'Male',
    bloodGroup: 'A-',
    mrn: 'WYSH-012',
    specialty: 'pulmonology',
    condition: 'COPD GOLD Stage II, Chronic Productive Cough',
    risk: 'high',
    vitals: { bp: '138/88', hr: 86, temp: 99.0, spo2: 93 },
    allergies: ['Penicillin'],
    medications: ['Tiotropium', 'Fluticasone/Salmeterol'],
  },
  {
    id: 'pat-013',
    fullName: 'Amit Trivedi',
    age: 41,
    gender: 'Male',
    bloodGroup: 'O+',
    mrn: 'WYSH-013',
    specialty: 'gastroenterology',
    condition: 'Gastroesophageal Reflux Disease (GERD), IBS-D',
    risk: 'low',
    vitals: { bp: '124/80', hr: 76, temp: 98.4, spo2: 98 },
    allergies: [],
    medications: ['Omeprazole', 'Dicyclomine'],
  },
  {
    id: 'pat-014',
    fullName: 'Narendra Patil',
    age: 67,
    gender: 'Male',
    bloodGroup: 'B+',
    mrn: 'WYSH-014',
    specialty: 'urology',
    condition: 'Benign Prostatic Hyperplasia (BPH), Nocturia',
    risk: 'medium',
    vitals: { bp: '140/86', hr: 72, temp: 98.1, spo2: 98 },
    allergies: ['Sulfa'],
    medications: ['Tamsulosin', 'Finasteride'],
  },
  {
    id: 'pat-015',
    fullName: 'Dr. Veena Nair',
    age: 53,
    gender: 'Female',
    bloodGroup: 'A+',
    mrn: 'WYSH-015',
    specialty: 'endocrinology',
    condition: 'Type 2 Diabetes Mellitus (Uncontrolled), Hypothyroidism',
    risk: 'medium',
    vitals: { bp: '130/82', hr: 74, temp: 98.5, spo2: 98 },
    allergies: [],
    medications: ['Metformin', 'Empagliflozin', 'Levothyroxine'],
  },
];

async function seedSpecialtyData(patientId: string, specialtyCode: string, encounterId: string, providerId: string) {
  let dataPayload: any = {};
  let findingsList: any[] = [];

  switch (specialtyCode) {
    case 'dental':
      dataPayload = {
        toothConditions: { '18': 'impacted', '26': 'caries' },
        procedures: [{ type: 'filling', tooth: '26', cost: 1500 }]
      };
      findingsList = [
        { category: 'tooth_condition', findingKey: '18', findingValue: { condition: 'impacted', notes: 'Pericoronitis risk' }, severity: 'moderate' },
        { category: 'tooth_condition', findingKey: '26', findingValue: { condition: 'caries', notes: 'Deep distal cavity' }, severity: 'severe' }
      ];
      break;

    case 'ent':
      dataPayload = {
        earExam: { left: 'retracted with fluid', right: 'normal' },
        audiometry: {
          left: [{ f: 250, t: 30 }, { f: 500, t: 40 }, { f: 1000, t: 45 }],
          right: [{ f: 250, t: 15 }, { f: 500, t: 15 }, { f: 1000, t: 20 }]
        }
      };
      findingsList = [
        { category: 'audiometry_left', findingKey: '500Hz', findingValue: { threshold: 40, unit: 'dB' }, severity: 'moderate' },
        { category: 'tympanic_membrane_left', findingKey: 'TM', findingValue: { status: 'retracted', effusion: true }, severity: 'moderate' }
      ];
      break;

    case 'dermatology':
      dataPayload = {
        lesions: [
          { id: 'l1', region: 'face-malar', size: '5mm', type: 'melasma', border: 'regular' },
          { id: 'l2', region: 'scalp-vertex', size: 'diffuse', type: 'thinning', density: 'reduced' }
        ],
        norwoodScale: 3
      };
      findingsList = [
        { category: 'lesion_profile', findingKey: 'l1', findingValue: { size: '5mm', type: 'melasma' }, severity: 'mild' },
        { category: 'alopecia_grade', findingKey: 'norwood', findingValue: { score: 3 }, severity: 'moderate' }
      ];
      break;

    case 'ophthalmology':
      dataPayload = {
        refraction: {
          od: { sphere: '-2.25', cylinder: '-0.50', axis: 90, va: '20/40' },
          os: { sphere: '-2.00', cylinder: '0.00', axis: 0, va: '20/25' }
        },
        iop: { od: 22, os: 18 },
        cataractGrade: { od: 'Grade 2 Nuclear Sclerotic', os: 'Clear' }
      };
      findingsList = [
        { category: 'refraction_error_od', findingKey: 'sph', findingValue: { power: -2.25 }, severity: 'mild' },
        { category: 'cataract_severity_od', findingKey: 'lens', findingValue: { grade: 2 }, severity: 'moderate' },
        { category: 'intraocular_pressure_od', findingKey: 'iop', findingValue: { pressure: 22, unit: 'mmHg' }, severity: 'moderate' }
      ];
      break;

    case 'cardiology':
      dataPayload = {
        ecgRhythm: 'nsr',
        scores: { framingham: 14, timi: 3, grace: 112 },
        leadsData: { I: 'normal', II: 'normal', V1: 'normal' }
      };
      findingsList = [
        { category: 'cardiac_risk_framingham', findingKey: 'risk', findingValue: { percent: 14 }, severity: 'moderate' },
        { category: 'ecg_rhythm_profile', findingKey: 'rhythm', findingValue: { type: 'nsr', hr: 72 }, severity: 'mild' }
      ];
      break;

    case 'pediatrics':
      dataPayload = {
        growth: { ageMonths: 84, heightCm: 122, weightKg: 24 },
        percentiles: { height: '50th', weight: '45th' },
        vaccinesDone: ['BCG', 'OPV1', 'DPT1', 'HepB0', 'MMR1']
      };
      findingsList = [
        { category: 'growth_percentile', findingKey: 'height', findingValue: { value: '50th' }, severity: 'mild' },
        { category: 'immunization_status', findingKey: 'gap', findingValue: { mmr_due: true }, severity: 'moderate' }
      ];
      break;

    case 'orthopedics':
      dataPayload = {
        jointsAssessed: { 'knee-r': 'tenderness', 'knee-l': 'normal' },
        romMeasured: { 'Knee Flexion OD': 90, 'Knee Flexion OS': 140 },
        kellgrenGrade: 3
      };
      findingsList = [
        { category: 'joint_pathology_r', findingKey: 'knee-r', findingValue: { status: 'tenderness', crepitus: true }, severity: 'moderate' },
        { category: 'rom_impairment_r', findingKey: 'knee-flexion', findingValue: { got: 90, expected: 150 }, severity: 'moderate' }
      ];
      break;

    case 'gynecology':
      dataPayload = {
        cycleTracker: { currentDay: 14, phase: 'ovulation', length: 28 },
        pregnancyCalculator: { lmp: '2026-03-01', gestWeeks: 14, gestDays: 3, edd: '2026-12-06' }
      };
      findingsList = [
        { category: 'gestational_status', findingKey: 'edd', findingValue: { weeks: 14, edd: '2026-12-06' }, severity: 'mild' },
        { category: 'menstrual_cycle', findingKey: 'ovulation', findingValue: { day: 14, fertile: true }, severity: 'mild' }
      ];
      break;

    case 'neurology':
      dataPayload = {
        gcsScale: { eye: 4, verbal: 5, motor: 6, total: 15 },
        cranialDeficits: ['VII-facial-symmetry-mild'],
        motorStrength: { rue: '5/5', lue: '5/5', rle: '4/5', lle: '5/5' }
      };
      findingsList = [
        { category: 'gcs_coma_scale', findingKey: 'total', findingValue: { score: 15 }, severity: 'mild' },
        { category: 'cranial_nerve_deficit', findingKey: 'CN-VII', findingValue: { deficit: 'mild asymmetry' }, severity: 'moderate' }
      ];
      break;

    case 'psychiatry':
      dataPayload = {
        phq9Depression: { scores: [1, 2, 2, 2, 1, 2, 2, 1, 1], total: 14, rating: 'Moderate' },
        gad7Anxiety: { total: 12, rating: 'Moderate' },
        mseObservations: { appearance: 'Neat', behavior: 'Cooperative', affect: 'Restricted' }
      };
      findingsList = [
        { category: 'depression_rating_scale', findingKey: 'phq9', findingValue: { score: 14, rating: 'Moderate' }, severity: 'moderate' },
        { category: 'anxiety_rating_scale', findingKey: 'gad7', findingValue: { score: 12, rating: 'Moderate' }, severity: 'moderate' }
      ];
      break;

    case 'pulmonology':
      dataPayload = {
        pftSpirometry: { fev1: 3.2, fvc: 4.1, ratio: 78 },
        spo2Trend: { current: 96, history: [98, 97, 96, 96, 97] },
        mmrcDyspnea: 2
      };
      findingsList = [
        { category: 'spirometry_pft_panel', findingKey: 'ratio', findingValue: { pct: 78 }, severity: 'mild' },
        { category: 'oxygenation_status', findingKey: 'spo2', findingValue: { val: 96 }, severity: 'moderate' }
      ];
      break;

    case 'gastroenterology':
      dataPayload = {
        abdominalQuadrant: { ruq: 'normal', luq: 'tenderness', rlq: 'normal', llq: 'normal' },
        bristolStoolType: 4
      };
      findingsList = [
        { category: 'abdominal_tenderness', findingKey: 'luq', findingValue: { tenderness: 'moderate' }, severity: 'moderate' },
        { category: 'bowel_pattern', findingKey: 'bristol', findingValue: { type: 4 }, severity: 'mild' }
      ];
      break;

    case 'urology':
      dataPayload = {
        ipssProstateScore: { voidingSymptoms: 11, storageSymptoms: 5, total: 16 },
        bladderScanner: { preVoidVolumeMl: 350, postVoidVolumeMl: 65, retentionRisk: 'low' }
      };
      findingsList = [
        { category: 'prostate_symptom_scale', findingKey: 'ipss', findingValue: { score: 16 }, severity: 'moderate' },
        { category: 'post_void_residual_scan', findingKey: 'pvr', findingValue: { volume: 65 }, severity: 'mild' }
      ];
      break;

    case 'endocrinology':
      dataPayload = {
        cgmGlucose: { pattern: 'optimal', timeInRange: 82, equivalentHba1c: 6.2 },
        thyroidPanel: { tsh: 3.4, ft4: 1.2 }
      };
      findingsList = [
        { category: 'glycemic_time_in_range', findingKey: 'tir', findingValue: { percentage: 82 }, severity: 'mild' },
        { category: 'thyroid_hormone_status', findingKey: 'tsh', findingValue: { value: 3.4 }, severity: 'mild' }
      ];
      break;

    default:
      dataPayload = { generalNotes: 'Routine assessment completed.' };
      findingsList = [];
  }

  await prisma.specialtyEncounterData.create({
    data: {
      specialtyCode,
      encounterId,
      patientId,
      providerId,
      templateId: `${specialtyCode}-default`,
      data: dataPayload
    }
  });

  for (const f of findingsList) {
    await prisma.specialtyFinding.create({
      data: {
        specialtyCode,
        encounterId,
        patientId,
        providerId,
        category: f.category,
        findingKey: f.findingKey,
        findingValue: f.findingValue,
        severity: f.severity,
        status: 'ACTIVE'
      }
    });
  }
}

async function createLongitudinalTimeline(patientId: string) {
  const years = [2022, 2023, 2024, 2025, 2026];
  const eventTypes: any[] = ['ADMISSION', 'ENCOUNTER', 'CLINICAL_NOTE', 'REPORT', 'PROCEDURE'];

  for (const year of years) {
    const date = new Date(`${year}-06-11T10:00:00Z`);

    await prisma.timelineEvent.create({
      data: {
        userId: patientId,
        type: 'ENCOUNTER',
        title: `Annual Clinical Wellness Review (${year})`,
        summary: `Routine physical, vitals screening, and therapeutic compliance evaluation conducted for ${year}.`,
        occurredAt: date
      }
    });

    await prisma.timelineEvent.create({
      data: {
        userId: patientId,
        type: 'REPORT',
        title: `Diagnostic Panels Report - Q2 ${year}`,
        summary: `Standard metabolic chemistry and lipid profiles compiled. All values verified.`,
        occurredAt: new Date(date.getTime() + 2 * 24 * 60 * 60 * 1000)
      }
    });
  }
}

async function main() {
  console.log(`\n====================================================`);
  console.log(`[DEMO SEED] Starting Specialty & Digital Twin Seeding...`);
  console.log(`====================================================`);

  // Ensure default doctor
  let provider = await prisma.user.findFirst({
    where: { roles: { some: { role: "DOCTOR" } } }
  });

  if (!provider) {
    provider = await prisma.user.create({
      data: {
        id: "default-doc-id",
        wyshId: "WYSH-DOC-SEED",
        fullName: "Dr. Clinical Director",
        phoneNumber: "+91-9000000777",
        gender: "Male",
        status: "VERIFIED"
      }
    });
    await prisma.userRole.create({
      data: {
        userId: provider.id,
        role: "DOCTOR"
      }
    });
    await prisma.doctorProfile.create({
      data: {
        userId: provider.id,
        specialization: "General Medicine",
        yearsOfExperience: 15,
        registrationNumber: "DIR-REG-001",
        consultationFee: 800
      }
    });
    console.log(`Created default Doctor profile: Dr. Clinical Director`);
  }

  // Iterate and create patient files
  for (const p of MOCK_PATIENTS_DATA) {
    console.log(`\nProcessing specialty patient: ${p.fullName} (${p.specialty})...`);

    // 1. Create Patient User
    const dateOfBirth = new Date();
    dateOfBirth.setFullYear(dateOfBirth.getFullYear() - p.age);

    const user = await prisma.user.upsert({
      where: { id: p.id },
      update: {
        fullName: p.fullName,
        gender: p.gender,
        dateOfBirth
      },
      create: {
        id: p.id,
        wyshId: p.mrn,
        fullName: p.fullName,
        phoneNumber: `+91-88${Math.floor(10000000 + Math.random() * 90000000)}`,
        gender: p.gender,
        dateOfBirth,
        status: 'VERIFIED',
        bloodGroup: p.bloodGroup,
        chronicConditions: [p.condition],
        allergiesSummary: p.allergies
      }
    });

    await prisma.userRole.upsert({
      where: { userId_role: { userId: user.id, role: 'PATIENT' } },
      update: {},
      create: {
        userId: user.id,
        role: 'PATIENT'
      }
    });

    // 2. Create Encounter
    const encId = `enc-${p.specialty}-${user.id}`;
    const encounter = await prisma.encounter.upsert({
      where: { id: encId },
      update: {
        status: 'FINISHED'
      },
      create: {
        id: encId,
        patientId: user.id,
        encounterClass: 'OUTPATIENT',
        status: 'FINISHED',
        periodStart: new Date(),
        periodEnd: new Date(),
        reason: p.condition,
        providerId: provider.id,
        updatedAt: new Date()
      }
    });

    // 3. Create VitalsRecord
    const [sys, dia] = p.vitals.bp.split('/');
    await prisma.vitalsRecord.upsert({
      where: { id: `vital-${user.id}` },
      update: {
        bpSystolic: sys ? parseInt(sys) : 120,
        bpDiastolic: dia ? parseInt(dia) : 80,
        heartRate: p.vitals.hr,
        temperature: p.vitals.temp,
        spo2: p.vitals.spo2
      },
      create: {
        id: `vital-${user.id}`,
        patientId: user.id,
        recordedById: provider.id,
        bpSystolic: sys ? parseInt(sys) : 120,
        bpDiastolic: dia ? parseInt(dia) : 80,
        heartRate: p.vitals.hr,
        temperature: p.vitals.temp,
        spo2: p.vitals.spo2,
        recordedAt: new Date(),
        updatedAt: new Date()
      }
    });

    // 4. Create Conditions & Allergies
    await prisma.condition.upsert({
      where: { id: `cond-${p.specialty}-${user.id}` },
      update: {
        displayName: p.condition
      },
      create: {
        id: `cond-${p.specialty}-${user.id}`,
        patientId: user.id,
        displayName: p.condition,
        icdCode: 'ICD-XX',
        onsetDate: new Date(),
        status: 'ACTIVE',
        clinicalStatus: 'ACTIVE',
        updatedAt: new Date()
      }
    });

    for (const allergy of p.allergies) {
      await prisma.allergy.upsert({
        where: { id: `allergy-${allergy}-${user.id}` },
        update: {},
        create: {
          id: `allergy-${allergy}-${user.id}`,
          patientId: user.id,
          allergen: allergy,
          severity: 'MILD',
          status: 'ACTIVE',
          updatedAt: new Date()
        }
      });
    }

    // 5. Create Medications & Prescriptions
    if (p.medications.length > 0) {
      const rx = await prisma.prescription.create({
        data: {
          patientUserId: user.id,
          doctorProfileId: null,
          diagnosisSummary: p.condition,
          instructions: "Follow daily clinical instructions.",
          status: "ACTIVE",
          updatedAt: new Date()
        }
      });

      for (const med of p.medications) {
        await prisma.medication.create({
          data: {
            prescriptionId: rx.id,
            name: med,
            dosage: "1 Tab daily"
          }
        });
      }
    }

    // 6. Seed Specialty Encounter Data and findings
    // Clear old ones first to allow clean idempotency
    await prisma.specialtyFinding.deleteMany({ where: { patientId: user.id } });
    await prisma.specialtyEncounterData.deleteMany({ where: { patientId: user.id } });

    await seedSpecialtyData(user.id, p.specialty, encounter.id, provider.id);

    // 7. Seed Digital Twin Score Profile
    const dt = await prisma.digitalTwin.upsert({
      where: { userId: user.id },
      update: {
        healthScore: p.risk === 'low' ? 88 : p.risk === 'medium' ? 74 : 52,
        riskScore: p.risk === 'low' ? 15 : p.risk === 'medium' ? 40 : 80,
        adherenceScore: p.risk === 'low' ? 95 : p.risk === 'medium' ? 80 : 60,
        readinessScore: 85,
        lastComputedAt: new Date()
      },
      create: {
        id: `dt-${user.id}`,
        userId: user.id,
        healthScore: p.risk === 'low' ? 88 : p.risk === 'medium' ? 74 : 52,
        riskScore: p.risk === 'low' ? 15 : p.risk === 'medium' ? 40 : 80,
        adherenceScore: p.risk === 'low' ? 95 : p.risk === 'medium' ? 80 : 60,
        readinessScore: 85,
        lastComputedAt: new Date(),
        updatedAt: new Date()
      }
    });

    // 8. Seed Longitudinal Timeline events
    await prisma.timelineEvent.deleteMany({ where: { userId: user.id } });
    await createLongitudinalTimeline(user.id);

    // 9. Seed Health Graph structures
    const nodes = await prisma.healthGraphNode.findMany({ where: { userId: user.id } });
    const nodeIds = nodes.map(n => n.id);
    await prisma.healthGraphEdge.deleteMany({
      where: { OR: [{ sourceNodeId: { in: nodeIds } }, { targetNodeId: { in: nodeIds } }] }
    });
    await prisma.healthGraphNode.deleteMany({ where: { userId: user.id } });

    const condNode = await prisma.healthGraphNode.create({
      data: {
        userId: user.id,
        nodeType: 'CONDITION',
        label: p.condition,
        description: 'Primary clinical indicator',
        occurredAt: new Date()
      }
    });

    if (p.medications.length > 0) {
      const medNode = await prisma.healthGraphNode.create({
        data: {
          userId: user.id,
          nodeType: 'MEDICATION',
          label: p.medications[0]!,
          description: 'Prescribed daily therapy',
          occurredAt: new Date()
        }
      });

      await prisma.healthGraphEdge.create({
        data: {
          sourceNodeId: condNode.id,
          targetNodeId: medNode.id,
          relationship: 'TREATED_BY'
        }
      });
    }
  }

  console.log(`\n====================================================`);
  console.log(`[DEMO SEED] Completed successfully.`);
  console.log(`====================================================`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
