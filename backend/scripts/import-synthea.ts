/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/scripts/import-synthea.ts
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
 * import-synthea — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - frontend/fix-unused-imports.mjs
 - backend/src/modules/ehr/timeline.service.ts
 - backend/scripts/scan-route-service-mismatches.mjs
 - backend/src/modules/health-graph-v2/wearables.service.ts
 - backend/src/modules/emergency/emergency.service.ts
 - backend/src/modules/ehr/cds.service.ts
 - backend/src/modules/consent/consent.service.ts
 - backend/src/modules/insurance/insurance.service.ts
 *
 * Calls:
 - fs
 - path
 - client
 - dotenv
 *
 * Dependencies:
 - fs
 - path
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
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Demo data if no directory of CSVs is specified
const DEMO_SYNTHEA_PATIENTS = `Id,BIRTHDATE,DEATHDATE,FIRST,LAST,GENDER,ADDRESS,CITY,STATE,ZIP
patient-synth-001,1980-05-15,,John,Doe,M,123 Main St,Boston,MA,02115`;

const DEMO_SYNTHEA_ENCOUNTERS = `Id,START,STOP,PATIENT,ENCOUNTERCLASS,CODE,DESCRIPTION,REASONCODE,REASONDESCRIPTION
encounter-synth-001,2026-06-01T09:00:00Z,2026-06-01T09:30:00Z,patient-synth-001,outpatient,185345009,Office Visit,J01.90,Acute sinusitis`;

const DEMO_SYNTHEA_CONDITIONS = `START,STOP,PATIENT,ENCOUNTER,CODE,DESCRIPTION
2026-06-01,2026-06-08,patient-synth-001,encounter-synth-001,J01.90,Acute sinusitis`;

const DEMO_SYNTHEA_OBSERVATIONS = `DATE,PATIENT,ENCOUNTER,CODE,DESCRIPTION,VALUE,UNITS
2026-06-01T09:15:00Z,patient-synth-001,encounter-synth-001,85354-9,Blood Pressure,130/85,mmHg
2026-06-01T09:15:00Z,patient-synth-001,encounter-synth-001,8867-4,Heart Rate,82,bpm
2026-06-01T09:15:00Z,patient-synth-001,encounter-synth-001,8310-5,Body Temperature,98.6,F
2026-06-01T09:15:00Z,patient-synth-001,encounter-synth-001,2708-6,Oxygen Saturation,97,%`;

const DEMO_SYNTHEA_MEDICATIONS = `START,STOP,PATIENT,ENCOUNTER,CODE,DESCRIPTION,DISPENSES
2026-06-01,2026-06-11,patient-synth-001,encounter-synth-001,313782,Amoxicillin 875 MG Oral Tablet,1`;

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(content: string) {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]!);
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, index) => {
      obj[h] = values[index] ?? '';
    });
    return obj;
  });
}

async function importSyntheaData(data: {
  patients: any[];
  encounters: any[];
  conditions: any[];
  observations: any[];
  medications: any[];
}) {
  console.log(`\n====================================================`);
  console.log(`[SYNTHEA IMPORT] Starting Ingestion...`);
  console.log(`====================================================`);

  // Ensure default doctor
  let provider = await prisma.user.findFirst({
    where: { roles: { some: { role: "DOCTOR" } } }
  });

  if (!provider) {
    const providerId = "default-provider-id";
    provider = await prisma.user.create({
      data: {
        id: providerId,
        wyshId: "WYSH-DOC-SYNTH",
        fullName: "Dr. Synthea System",
        phoneNumber: "+91-9000000888",
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
        yearsOfExperience: 12,
        registrationNumber: "SYNTH-REG-001",
        consultationFee: 600
      }
    });
    console.log(`Created default Doctor profile: Dr. Synthea System`);
  }

  // 1. Import Patients
  console.log(`Processing ${data.patients.length} patients...`);
  const patientIdMap = new Map<string, any>();

  for (const p of data.patients) {
    const dob = p.BIRTHDATE ? new Date(p.BIRTHDATE) : null;
    const phone = `+91-91${Math.floor(100000000 + Math.random() * 900000000)}`;

    const user = await prisma.user.upsert({
      where: { id: p.Id },
      update: {
        fullName: `${p.FIRST} ${p.LAST}`,
        gender: p.GENDER === 'M' ? 'Male' : p.GENDER === 'F' ? 'Female' : 'Other',
        dateOfBirth: dob
      },
      create: {
        id: p.Id,
        wyshId: `WYSH-SYN-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: `${p.FIRST} ${p.LAST}`,
        phoneNumber: phone,
        gender: p.GENDER === 'M' ? 'Male' : p.GENDER === 'F' ? 'Female' : 'Other',
        dateOfBirth: dob,
        status: 'VERIFIED'
      }
    });
    patientIdMap.set(p.Id, user);
    console.log(`Imported Patient: ${user.fullName} (ID: ${user.id})`);
  }

  // 2. Import Encounters
  console.log(`Processing ${data.encounters.length} encounters...`);
  for (const e of data.encounters) {
    const start = e.START ? new Date(e.START) : new Date();
    const end = e.STOP ? new Date(e.STOP) : null;
    const patientUser = patientIdMap.get(e.PATIENT);
    if (!patientUser) continue;

    await prisma.encounter.upsert({
      where: { id: e.Id },
      update: {
        status: 'FINISHED',
        periodStart: start,
        periodEnd: end,
        reason: e.DESCRIPTION,
        reasonCode: e.REASONCODE
      },
      create: {
        id: e.Id,
        patientId: patientUser.id,
        encounterClass: e.ENCOUNTERCLASS.toUpperCase() === 'EMERGENCY' ? 'EMERGENCY' : 'OUTPATIENT',
        status: 'FINISHED',
        periodStart: start,
        periodEnd: end,
        reason: e.DESCRIPTION,
        reasonCode: e.REASONCODE,
        providerId: provider.id,
        updatedAt: new Date()
      }
    });
    console.log(`Imported Encounter: ${e.Id} (${e.DESCRIPTION})`);
  }

  // 3. Import Conditions
  console.log(`Processing ${data.conditions.length} conditions...`);
  for (const c of data.conditions) {
    const patientUser = patientIdMap.get(c.PATIENT);
    if (!patientUser) continue;
    const start = c.START ? new Date(c.START) : null;

    // Use a unique compound id or deterministic hash for Synthea condition rows
    const cId = `cond-synth-${c.PATIENT}-${c.CODE}`;
    await prisma.condition.upsert({
      where: { id: cId },
      update: {
        displayName: c.DESCRIPTION,
        onsetDate: start
      },
      create: {
        id: cId,
        patientId: patientUser.id,
        icdCode: c.CODE,
        displayName: c.DESCRIPTION,
        onsetDate: start,
        status: 'ACTIVE',
        clinicalStatus: 'ACTIVE',
        updatedAt: new Date()
      }
    });
    console.log(`Imported Condition: ${cId} (${c.DESCRIPTION})`);
  }

  // 4. Import Observations (Grouped into VitalsRecords per patient/encounter date)
  console.log(`Processing ${data.observations.length} observations...`);
  const vitalGroups = new Map<string, any>();

  for (const obs of data.observations) {
    const patientUser = patientIdMap.get(obs.PATIENT);
    if (!patientUser) continue;

    const key = `${obs.PATIENT}-${obs.ENCOUNTER}`;
    if (!vitalGroups.has(key)) {
      vitalGroups.set(key, {
        id: `vital-${key}`,
        patientId: patientUser.id,
        encounterId: obs.ENCOUNTER,
        recordedAt: obs.DATE ? new Date(obs.DATE) : new Date(),
        bpSystolic: null,
        bpDiastolic: null,
        heartRate: null,
        temperature: null,
        spo2: null,
        respiratoryRate: null
      });
    }

    const group = vitalGroups.get(key);
    const val = parseFloat(obs.VALUE);

    if (obs.CODE === '85354-9' || obs.DESCRIPTION.toLowerCase().includes('blood pressure')) {
      const [sys, dia] = obs.VALUE.split('/');
      if (sys && dia) {
        group.bpSystolic = parseInt(sys);
        group.bpDiastolic = parseInt(dia);
      }
    } else if (obs.CODE === '8867-4' || obs.DESCRIPTION.toLowerCase().includes('heart rate')) {
      group.heartRate = Math.round(val);
    } else if (obs.CODE === '8310-5' || obs.DESCRIPTION.toLowerCase().includes('temperature')) {
      group.temperature = val;
    } else if (obs.CODE === '2708-6' || obs.DESCRIPTION.toLowerCase().includes('oxygen saturation')) {
      group.spo2 = Math.round(val);
    } else if (obs.CODE === '9279-1' || obs.DESCRIPTION.toLowerCase().includes('respiratory rate')) {
      group.respiratoryRate = Math.round(val);
    }
  }

  for (const group of vitalGroups.values()) {
    await prisma.vitalsRecord.upsert({
      where: { id: group.id },
      update: {
        bpSystolic: group.bpSystolic,
        bpDiastolic: group.bpDiastolic,
        heartRate: group.heartRate,
        temperature: group.temperature,
        spo2: group.spo2,
        respiratoryRate: group.respiratoryRate
      },
      create: {
        id: group.id,
        patientId: group.patientId,
        recordedById: provider.id,
        bpSystolic: group.bpSystolic,
        bpDiastolic: group.bpDiastolic,
        heartRate: group.heartRate,
        temperature: group.temperature,
        spo2: group.spo2,
        respiratoryRate: group.respiratoryRate,
        recordedAt: group.recordedAt,
        updatedAt: new Date()
      }
    });
    console.log(`Imported VitalsRecord group: ${group.id}`);
  }

  // 5. Import Medications
  console.log(`Processing ${data.medications.length} medications...`);
  for (const med of data.medications) {
    const patientUser = patientIdMap.get(med.PATIENT);
    if (!patientUser) continue;

    const prescription = await prisma.prescription.create({
      data: {
        patientUserId: patientUser.id,
        doctorProfileId: null,
        diagnosisSummary: "Synthea Prescribed Medication",
        instructions: "Take as directed",
        status: "ACTIVE",
        updatedAt: new Date()
      }
    });

    await prisma.medication.create({
      data: {
        prescriptionId: prescription.id,
        name: med.DESCRIPTION,
        dosage: "1 Tab",
        frequency: "Once daily"
      }
    });
    console.log(`Imported Prescription for Medication: ${med.DESCRIPTION}`);
  }

  console.log(`\n====================================================`);
  console.log(`[SYNTHEA IMPORT] Completed successfully.`);
  console.log(`====================================================`);
}

async function main() {
  const dirPathArg = process.argv[2];

  if (dirPathArg) {
    const baseDir = path.resolve(dirPathArg);
    console.log(`Scanning directory for Synthea CSVs: ${baseDir}`);

    const readFile = (filename: string) => {
      const fileP = path.join(baseDir, filename);
      if (fs.existsSync(fileP)) {
        return fs.readFileSync(fileP, 'utf8');
      }
      return '';
    };

    const patientsCsv = readFile('patients.csv');
    const encountersCsv = readFile('encounters.csv');
    const conditionsCsv = readFile('conditions.csv');
    const observationsCsv = readFile('observations.csv');
    const medicationsCsv = readFile('medications.csv');

    if (!patientsCsv) {
      console.error("[ERROR] Missing patients.csv in target folder. Aborting.");
      process.exit(1);
    }

    await importSyntheaData({
      patients: parseCSV(patientsCsv),
      encounters: parseCSV(encountersCsv),
      conditions: parseCSV(conditionsCsv),
      observations: parseCSV(observationsCsv),
      medications: parseCSV(medicationsCsv)
    });
  } else {
    console.log("No directory argument provided. Running with built-in demonstration data...");
    await importSyntheaData({
      patients: parseCSV(DEMO_SYNTHEA_PATIENTS),
      encounters: parseCSV(DEMO_SYNTHEA_ENCOUNTERS),
      conditions: parseCSV(DEMO_SYNTHEA_CONDITIONS),
      observations: parseCSV(DEMO_SYNTHEA_OBSERVATIONS),
      medications: parseCSV(DEMO_SYNTHEA_MEDICATIONS)
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
