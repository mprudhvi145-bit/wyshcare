/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/tests/db.smoke.test.js
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
 * Test file: validates db/smoke
 *
 * Responsibilities:
 * - Support testing functionality
 *
 * Used By:
 - backend/tests/testInsert.js
 - backend/tests/patients.columns.test.js
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

(async () => {
  console.log('🔎 DB smoke test starting');

  const res = await prisma.$queryRaw`SELECT 1 as ok`;
  if (!res || res.length === 0) throw new Error('DB query failed');

  console.log('✅ DB reachable via Prisma');
  await prisma.$disconnect();
})();