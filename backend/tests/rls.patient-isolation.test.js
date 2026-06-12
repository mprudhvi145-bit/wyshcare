/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/tests/rls.patient-isolation.test.js
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
 * Test file: validates rls/patient-isolation
 *
 * Responsibilities:
 * - Support testing functionality
 *
 * Used By:
 - Standalone (not imported by other source files)
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

import { createPrismaClientForUser } from '../db/prismaFactory.js';

async function run() {
  console.log('🔐 RLS PATIENT ISOLATION TEST');

  const prismaA = createPrismaClientForUser(process.env.JWT_A);
  const prismaB = createPrismaClientForUser(process.env.JWT_B);

  const aPatients = await prismaA.patients.findMany();
  const bPatients = await prismaB.patients.findMany();

  console.log('Patient A sees:', aPatients.map(p => p.patientWyshId));
  console.log('Patient B sees:', bPatients.map(p => p.patientWyshId));

  if (
    aPatients.some(p => bPatients.map(x => x.patientWyshId).includes(p.patientWyshId))
  ) {
    throw new Error('❌ RLS FAILURE: Patient data leaked across users');
  }

  console.log('✅ RLS enforced correctly');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});