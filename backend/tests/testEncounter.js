/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/tests/testEncounter.js
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
 * testEncounter — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - backend/tests/testInsert.js
 - backend/tests/patients.columns.test.js
 - backend/tests/db.smoke.test.js
 - backend/tests/ai.smoke.test.js
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

import 'dotenv/config';
import prisma from '../db.js';

/**
 * Manual test script
 * Purpose:
 * - Create a new Encounter
 * - Validate patient linkage
 * - Ensure visitNumber auto-generation works
 */

async function run() {
  try {
    // 1️⃣ Fetch any existing patient
    const patient = await prisma.patient.findFirst({
      select: { id: true }
    });

    if (!patient) {
      console.error('❌ No patient found. Create a patient first.');
      return;
    }

    // 2️⃣ Create encounter
    const encounter = await prisma.encounter.create({
      data: {
        patientId: patient.id,
        type: 'OPD', // OPD | IPD | EMERGENCY etc
        status: 'ACTIVE'
      }
    });

    console.log('✅ ENCOUNTER CREATED');
    console.log({
      id: encounter.id,
      visitNumber: encounter.visitNumber,
      patientId: encounter.patientId,
      type: encounter.type,
      status: encounter.status,
      startedAt: encounter.startedAt
    });

  } catch (err) {
    console.error('❌ ERROR:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();