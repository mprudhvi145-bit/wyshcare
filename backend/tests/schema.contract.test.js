/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/tests/schema.contract.test.js
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
 * Test file: validates schema/contract
 *
 * Responsibilities:
 * - Support testing functionality
 *
 * Used By:
 - backend/tests/testInsert.js
 - backend/tests/patients.columns.test.js
 - backend/tests/db.smoke.test.js
 - backend/tests/testEncounter.js
 - backend/tests/ai.smoke.test.js
 - backend/tests/testVitals.js
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
  console.log('🔎 Schema contract test starting...');

  // persons table (no wysh_id assumption)
  const person = await prisma.persons.findFirst({
    select: { id: true }
  });

  console.log('persons table reachable');

  // patients table
  const patient = await prisma.patients.findFirst({
    select: { patient_wysh_id: true }
  });

  console.log('patients table reachable');

  // encounters table
  const encounter = await prisma.encounters.findFirst({
    select: { id: true }
  });

  console.log('encounters table reachable');

  console.log('✅ Schema contract test PASSED');
}

run()
  .catch(e => {
    console.error('❌ Schema contract test FAILED:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());