/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/tests/testVitals.js
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
 * testVitals — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - backend/tests/testInsert.js
 - backend/tests/patients.columns.test.js
 - backend/tests/db.smoke.test.js
 - backend/tests/testEncounter.js
 - backend/tests/ai.smoke.test.js
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

async function run() {
  try {
    // 1️⃣ Fetch latest encounter
    const encounter = await prisma.encounter.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { id: true }
    });

    if (!encounter) {
      console.error('❌ No encounter found. Create one first.');
      return;
    }

    // 2️⃣ Insert vitals (ENCOUNTER-SCOPED)
    const vitals = await prisma.vital.create({
      data: {
        encounterId: encounter.id,
        systolicBP: 120,
        diastolicBP: 80,
        pulse: 78,
        spo2: 98,
        temperature: 36.8
      }
    });

    console.log('✅ VITALS INSERTED:', vitals);
  } catch (err) {
    console.error('❌ ERROR:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();