/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/tests/ai.smoke.test.js
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
 * Test file: validates ai/smoke
 *
 * Responsibilities:
 * - Support testing functionality
 *
 * Used By:
 - backend/tests/testInsert.js
 - backend/tests/patients.columns.test.js
 - backend/tests/db.smoke.test.js
 - backend/tests/testEncounter.js
 - backend/tests/testVitals.js
 - backend/tests/schema.contract.test.js
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
Testing
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

import { prisma } from '../db.js';

async function run() {
  console.log('🔎 Wysh AI smoke test starting');

  // 1) Fetch one patient + encounter (safe read)
  const patient = await prisma.patients.findFirst({
    select: { patientWyshId: true }
  });
  if (!patient) throw new Error('No patients found');

  const encounter = await prisma.encounters.findFirst({
    where: { patientId: patient.patient_wysh_id },
    select: { id: true }
  });
  if (!encounter) throw new Error('No encounters found');

  // 2) Fetch an active model
  const model = await prisma.ai_model_registry.findFirst({
    where: { active: true },
    select: { id: true, modelName: true, modelVersion: true }
  });
  if (!model) throw new Error('No active AI model');

  // 3) Create inference request
  const req = await prisma.ai_inference_request.create({
    data: {
      modelId: model.id,
      patientId: patient.patientWyshId,
      encounterId: encounter.id,
      inputPayload: {
        vitals: { hr: 92, spo2: 96 },
        notes: 'mild fever'
      }
    }
  });

  // 4) Write inference result (simulating model output)
  await prisma.ai_inference_result.create({
    data: {
      requestId: req.id,
      outputPayload: {
        risk: 'LOW',
        recommendation: 'Observe and hydrate'
      },
      confidenceScore: 0.87,
      riskLevel: 'LOW'
    }
  });

  console.log('✅ Wysh AI smoke test passed');
}

run()
  .catch(e => {
    console.error('❌ Wysh AI smoke test failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());