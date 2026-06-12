/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/tests/testInsert.js
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
 * testInsert — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - backend/tests/patients.columns.test.js
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

async function testAuditInsert() {
  try {
    console.log('🔍 Testing Prisma auditLog insert...');

    const record = await prisma.auditLog.create({
      data: {
        action: 'AI_CALL',
        entity: '/ai/health-analysis',
        entityId: 'gemini-1.5-pro',
        metadata: {
          promptLength: 120,
          responseLength: 450,
          userRole: 'public',
          testRun: true,
        },
      },
    });

    console.log('✅ Insert successful');
    console.log(record);
  } catch (err) {
    console.error('❌ Insert failed');
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

testAuditInsert();