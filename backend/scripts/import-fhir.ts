/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/scripts/import-fhir.ts
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
 * import-fhir — WyshID module
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

// Sample FHIR R4 Patient Bundle for fallback / verification testing
const SAMPLE_FHIR_BUNDLE = {
  resourceType: "Bundle",
  type: "transaction",
  entry: [
    {
      fullUrl: "urn:uuid:patient-fhir-001",
      resource: {
        resourceType: "Patient",
        id: "patient-fhir-001",
        name: [
          {
            use: "official",
            family: "Miller",
            given: ["Jane", "A."]
          }
        ],
        gender: "female",
        birthDate: "1988-04-12",
        telecom: [
          {
            system: "phone",
            value: "+91-9988776655",
            use: "mobile"
          }
        ]
      }
    },
    {
      fullUrl: "urn:uuid:encounter-fhir-001",
      resource: {
        resourceType: "Encounter",
        id: "encounter-fhir-001",
        status: "finished",
        class: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          code: "AMB",
          display: "ambulatory"
        },
        subject: {
          reference: "Patient/patient-fhir-001"
        },
        period: {
          start: "2026-05-10T10:00:00Z",
          end: "2026-05-10T10:45:00Z"
        },
        reasonCode: [
          {
            coding: [
              {
                system: "http://hl7.org/fhir/sid/icd-10",
                code: "J06.9",
                display: "Acute upper respiratory infection, unspecified"
              }
            ]
          }
        ]
      }
    },
    {
      fullUrl: "urn:uuid:condition-fhir-001",
      resource: {
        resourceType: "Condition",
        id: "condition-fhir-001",
        clinicalStatus: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
              code: "active"
            }
          ]
        },
        code: {
          coding: [
            {
              system: "http://hl7.org/fhir/sid/icd-10",
              code: "J06.9",
              display: "Acute upper respiratory infection"
            }
          ],
          text: "Acute upper respiratory infection"
        },
        subject: {
          reference: "Patient/patient-fhir-001"
        },
        onsetDateTime: "2026-05-09"
      }
    },
    {
      fullUrl: "urn:uuid:allergy-fhir-001",
      resource: {
        resourceType: "AllergyIntolerance",
        id: "allergy-fhir-001",
        clinicalStatus: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
              code: "active"
            }
          ]
        },
        criticality: "high",
        code: {
          coding: [
            {
              system: "http://snomed.info/sct",
              code: "387406002",
              display: "Sulfonamide"
            }
          ],
          text: "Sulfonamide"
        },
        patient: {
          reference: "Patient/patient-fhir-001"
        }
      }
    },
    {
      fullUrl: "urn:uuid:observation-fhir-001",
      resource: {
        resourceType: "Observation",
        id: "observation-fhir-001",
        status: "final",
        category: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "vital-signs",
                display: "Vital Signs"
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "85354-9",
              display: "Blood pressure panel with all children optional"
            }
          ]
        },
        subject: {
          reference: "Patient/patient-fhir-001"
        },
        effectiveDateTime: "2026-05-10T10:15:00Z",
        component: [
          {
            code: {
              coding: [
                {
                  system: "http://loinc.org",
                  code: "8480-6",
                  display: "Systolic blood pressure"
                }
              ]
            },
            valueQuantity: {
              value: 120,
              unit: "mmHg"
            }
          },
          {
            code: {
              coding: [
                {
                  system: "http://loinc.org",
                  code: "8462-4",
                  display: "Diastolic blood pressure"
                }
              ]
            },
            valueQuantity: {
              value: 80,
              unit: "mmHg"
            }
          }
        ]
      }
    },
    {
      fullUrl: "urn:uuid:observation-fhir-002",
      resource: {
        resourceType: "Observation",
        id: "observation-fhir-002",
        status: "final",
        category: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "vital-signs"
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "8867-4",
              display: "Heart rate"
            }
          ]
        },
        subject: {
          reference: "Patient/patient-fhir-001"
        },
        effectiveDateTime: "2026-05-10T10:15:00Z",
        valueQuantity: {
          value: 74,
          unit: "bpm"
        }
      }
    },
    {
      fullUrl: "urn:uuid:med-req-fhir-001",
      resource: {
        resourceType: "MedicationRequest",
        id: "med-req-fhir-001",
        status: "active",
        intent: "order",
        medicationCodeableConcept: {
          coding: [
            {
              system: "http://www.nlm.nih.gov/research/umls/rxnorm",
              code: "24181",
              display: "Amoxicillin 500 MG Oral Capsule"
            }
          ],
          text: "Amoxicillin 500mg capsules"
        },
        subject: {
          reference: "Patient/patient-fhir-001"
        },
        dosageInstruction: [
          {
            text: "Take 1 capsule three times daily for 7 days"
          }
        ]
      }
    }
  ]
};

function parsePatient(resource: any) {
  const family = resource.name?.[0]?.family ?? "";
  const given = resource.name?.[0]?.given?.join(" ") ?? "";
  const fullName = `${given} ${family}`.trim() || "FHIR Patient";
  const gender = resource.gender ? resource.gender.toUpperCase() : "OTHER";
  const dateOfBirth = resource.birthDate ? new Date(resource.birthDate) : null;
  const phoneNumber = resource.telecom?.find((t: any) => t.system === "phone")?.value ?? `+91-95${Math.floor(100000000 + Math.random() * 900000000)}`;

  return {
    id: resource.id,
    fullName,
    gender,
    dateOfBirth,
    phoneNumber
  };
}

async function importFhirBundle(bundle: any) {
  console.log(`\n====================================================`);
  console.log(`[FHIR IMPORT] Starting Bundle Ingestion...`);
  console.log(`====================================================`);

  const entries = bundle.entry ?? [];
  console.log(`Found ${entries.length} resources in bundle.`);

  // Find Patient first
  const patientEntry = entries.find((e: any) => e.resource?.resourceType === "Patient");
  if (!patientEntry) {
    console.error("[ERROR] No Patient resource found in FHIR bundle. Aborting.");
    return;
  }

  const rawPatient = parsePatient(patientEntry.resource);
  console.log(`Parsed Patient: ${rawPatient.fullName} (${rawPatient.gender}, DOB: ${rawPatient.dateOfBirth?.toISOString().split('T')[0] ?? 'Unknown'})`);

  // Upsert Patient (User)
  const patientId = rawPatient.id;
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ id: patientId }, { phoneNumber: rawPatient.phoneNumber }] }
  });

  let patientUser;
  if (existingUser) {
    patientUser = existingUser;
    console.log(`User already exists: ${patientUser.fullName} (ID: ${patientUser.id})`);
  } else {
    patientUser = await prisma.user.create({
      data: {
        id: patientId,
        wyshId: `WYSH-FHIR-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: rawPatient.fullName,
        phoneNumber: rawPatient.phoneNumber,
        gender: rawPatient.gender === "FEMALE" ? "Female" : rawPatient.gender === "MALE" ? "Male" : "Other",
        dateOfBirth: rawPatient.dateOfBirth,
        status: "VERIFIED"
      }
    });
    console.log(`Created new Patient User: ${patientUser.fullName} (ID: ${patientUser.id})`);
  }

  // Setup default provider
  let provider = await prisma.user.findFirst({
    where: { roles: { some: { role: "DOCTOR" } } }
  });

  if (!provider) {
    const providerId = "default-provider-id";
    provider = await prisma.user.create({
      data: {
        id: providerId,
        wyshId: "WYSH-DOC-FHIR",
        fullName: "Dr. FHIR System",
        phoneNumber: "+91-9000000999",
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
        yearsOfExperience: 10,
        registrationNumber: "FHIR-REG-001",
        consultationFee: 500
      }
    });
    console.log(`Created default Doctor profile: Dr. FHIR System`);
  }

  // Process other resources
  for (const entry of entries) {
    const res = entry.resource;
    if (!res) continue;

    if (res.resourceType === "Encounter") {
      const start = res.period?.start ? new Date(res.period.start) : new Date();
      const end = res.period?.end ? new Date(res.period.end) : null;
      const icdCode = res.reasonCode?.[0]?.coding?.[0]?.code ?? null;
      const icdDesc = res.reasonCode?.[0]?.coding?.[0]?.display ?? null;

      await prisma.encounter.upsert({
        where: { id: res.id },
        update: {
          status: "FINISHED",
          periodStart: start,
          periodEnd: end,
          reason: icdDesc,
          reasonCode: icdCode
        },
        create: {
          id: res.id,
          patientId: patientUser.id,
          encounterClass: "OUTPATIENT",
          status: "FINISHED",
          periodStart: start,
          periodEnd: end,
          reason: icdDesc,
          reasonCode: icdCode,
          providerId: provider.id,
          updatedAt: new Date()
        }
      });
      console.log(`Ingested Encounter: ${res.id} (Reason: ${icdDesc})`);
    }

    else if (res.resourceType === "Condition") {
      const icdCode = res.code?.coding?.[0]?.code ?? "";
      const display = res.code?.coding?.[0]?.display ?? res.code?.text ?? "Unknown Condition";
      const onset = res.onsetDateTime ? new Date(res.onsetDateTime) : null;

      await prisma.condition.upsert({
        where: { id: res.id },
        update: {
          icdCode,
          displayName: display,
          onsetDate: onset
        },
        create: {
          id: res.id,
          patientId: patientUser.id,
          icdCode,
          displayName: display,
          onsetDate: onset,
          status: "ACTIVE",
          clinicalStatus: "ACTIVE",
          updatedAt: new Date()
        }
      });
      console.log(`Ingested Condition: ${res.id} (${display})`);
    }

    else if (res.resourceType === "AllergyIntolerance") {
      const allergen = res.code?.coding?.[0]?.display ?? res.code?.text ?? "Unknown Allergen";
      const severity = res.criticality ? res.criticality.toUpperCase() : "MILD";

      await prisma.allergy.upsert({
        where: { id: res.id },
        update: {
          allergen,
          severity: severity === "HIGH" ? "SEVERE" : severity === "SEVERE" ? "SEVERE" : "MILD"
        },
        create: {
          id: res.id,
          patientId: patientUser.id,
          allergen,
          severity: severity === "HIGH" ? "SEVERE" : severity === "SEVERE" ? "SEVERE" : "MILD",
          status: "ACTIVE",
          updatedAt: new Date()
        }
      });
      console.log(`Ingested AllergyIntolerance: ${res.id} (${allergen})`);
    }

    else if (res.resourceType === "Observation") {
      const isVital = res.category?.some((c: any) =>
        c.coding?.some((cd: any) => cd.code === "vital-signs")
      );

      if (isVital) {
        let bpSystolic: number | null = null;
        let bpDiastolic: number | null = null;
        let heartRate: number | null = null;
        let temperature: number | null = null;
        let spo2: number | null = null;
        let respRate: number | null = null;

        const date = res.effectiveDateTime ? new Date(res.effectiveDateTime) : new Date();

        // BP blood pressure panel
        if (res.component) {
          for (const comp of res.component) {
            const compCode = comp.code?.coding?.[0]?.code;
            const val = comp.valueQuantity?.value;
            if (compCode === "8480-6") bpSystolic = Math.round(val);
            if (compCode === "8462-4") bpDiastolic = Math.round(val);
          }
        } else {
          const mainCode = res.code?.coding?.[0]?.code;
          const val = res.valueQuantity?.value;
          if (mainCode === "8867-4") heartRate = Math.round(val);
          if (mainCode === "2708-6") spo2 = Math.round(val);
          if (mainCode === "8310-5") temperature = val;
          if (mainCode === "9279-1") respRate = Math.round(val);
        }

        await prisma.vitalsRecord.upsert({
          where: { id: res.id },
          update: {
            bpSystolic,
            bpDiastolic,
            heartRate,
            temperature,
            spo2,
            respiratoryRate: respRate,
            recordedAt: date
          },
          create: {
            id: res.id,
            patientId: patientUser.id,
            recordedById: provider.id,
            bpSystolic,
            bpDiastolic,
            heartRate,
            temperature,
            spo2,
            respiratoryRate: respRate,
            recordedAt: date,
            updatedAt: new Date()
          }
        });
        console.log(`Ingested Vital Signs Observation: ${res.id} (HR: ${heartRate}, BP: ${bpSystolic}/${bpDiastolic})`);
      }
    }

    else if (res.resourceType === "MedicationRequest") {
      const medName = res.medicationCodeableConcept?.coding?.[0]?.display ?? res.medicationCodeableConcept?.text ?? "Unknown Medication";
      const instructions = res.dosageInstruction?.[0]?.text ?? "";

      const prescription = await prisma.prescription.create({
        data: {
          patientUserId: patientUser.id,
          doctorProfileId: null, // self-uploaded or external
          diagnosisSummary: "FHIR MedicationRequest Ingestion",
          instructions,
          status: "ACTIVE",
          updatedAt: new Date()
        }
      });

      await prisma.medication.create({
        data: {
          prescriptionId: prescription.id,
          name: medName,
          dosage: instructions,
          frequency: "Per instructions"
        }
      });
      console.log(`Ingested MedicationRequest: ${res.id} (${medName})`);
    }
  }

  console.log(`\n====================================================`);
  console.log(`[FHIR IMPORT] Completed successfully.`);
  console.log(`====================================================`);
}

async function main() {
  const filePathArg = process.argv[2];

  if (filePathArg) {
    const fullPath = path.resolve(filePathArg);
    console.log(`Reading FHIR bundle from: ${fullPath}`);
    if (fs.existsSync(fullPath)) {
      const rawData = fs.readFileSync(fullPath, 'utf8');
      const bundle = JSON.parse(rawData);
      await importFhirBundle(bundle);
    } else {
      console.error(`File does not exist: ${fullPath}`);
      process.exit(1);
    }
  } else {
    console.log("No file argument provided. Running with built-in validation sample bundle...");
    await importFhirBundle(SAMPLE_FHIR_BUNDLE);
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
