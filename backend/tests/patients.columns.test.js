/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/tests/patients.columns.test.js
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
 * Test file: validates patients/columns
 *
 * Responsibilities:
 * - Support testing functionality
 *
 * Used By:
 - backend/tests/testInsert.js
 - backend/tests/db.smoke.test.js
 - backend/tests/testEncounter.js
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
  console.log('🔍 Inspecting patients table columns (raw)...');

  const columns = await prisma.$queryRaw`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
    ORDER BY ordinal_position;
  `;

  console.table(columns);

  console.log('✅ Column inspection completed');
}

run()
  .catch(e => {
    console.error('❌ Column inspection FAILED:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());