/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: scripts/validate-integrity.ts
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
 * validate-integrity — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - backend/src/modules/ehr/timeline.service.ts
 - backend/src/modules/health-graph-v2/wearables.service.ts
 - backend/src/modules/emergency/emergency.service.ts
 - backend/src/modules/ehr/cds.service.ts
 - backend/src/modules/consent/consent.service.ts
 - backend/src/modules/insurance/insurance.service.ts
 - backend/src/modules/digital-twin/digital-twin.service.ts
 - backend/src/modules/timeline/timeline.service.ts
 *
 * Calls:
 - client
 *
 * Dependencies:
 - client
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

// ============================================================
// WyshCare Healthcare Data Integrity Validation
// ============================================================
// Run: npx ts-node scripts/validate-integrity.ts
// ============================================================
// Validates all foreign key relationships, checks for
// orphan records, duplicate identities, and dangling refs.
// ============================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let exitCode = 0;
const errors: string[] = [];

function check(condition: boolean, message: string) {
  if (!condition) {
    errors.push(`  FAIL: ${message}`);
    exitCode = 1;
  } else {
    console.log(`  OK:   ${message}`);
  }
}

async function count(table: string): Promise<number> {
  const result = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
    `SELECT COUNT(*)::int as count FROM "${table}"`,
  );
  return Number(result[0]?.count ?? 0);
}

async function findOrphans(
  table: string,
  fkColumn: string,
  referencedTable: string,
  referencedColumn: string,
): Promise<number> {
  const result = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
    `SELECT COUNT(*)::int as count FROM "${table}" t
     LEFT JOIN "${referencedTable}" r ON t."${fkColumn}" = r."${referencedColumn}"
     WHERE t."${fkColumn}" IS NOT NULL AND r."${referencedColumn}" IS NULL`,
  );
  return Number(result[0]?.count ?? 0);
}

async function findDuplicates(table: string, column: string): Promise<number> {
  const result = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
    `SELECT COUNT(*)::int as count FROM (
      SELECT "${column}" FROM "${table}"
      WHERE "${column}" IS NOT NULL
      GROUP BY "${column}" HAVING COUNT(*) > 1
    ) dup`,
  );
  return Number(result[0]?.count ?? 0);
}

async function main() {
  console.log('\n=== WYSHCARE DATA INTEGRITY VALIDATION ===\n');

  // 1. Record counts
  console.log('[1] Entity Record Counts');
  const tables = [
    'User', 'UserRole', 'DoctorProfile', 'PatientProfile',
    'Appointment', 'HealthRecord', 'Prescription', 'ConsentGrant',
    'FamilyRelation', 'TimelineEvent', 'AuditLog', 'DeviceSession',
    'RefreshToken', 'ShareLink',
  ];

  for (const table of tables) {
    const c = await count(table);
    console.log(`  ${table}: ${c}`);
  }

  // 2. Foreign key integrity
  console.log('\n[2] Foreign Key Integrity (orphan detection)');
  const fkChecks = [
    ['UserRole', 'userId', 'User', 'id'],
    ['DoctorProfile', 'userId', 'User', 'id'],
    ['PatientProfile', 'userId', 'User', 'id'],
    ['Appointment', 'patientUserId', 'User', 'id'],
    ['Appointment', 'doctorProfileId', 'DoctorProfile', 'id'],
    ['Appointment', 'doctorUserId', 'User', 'id'],
    ['HealthRecord', 'userId', 'User', 'id'],
    ['Prescription', 'patientUserId', 'User', 'id'],
    ['ConsentGrant', 'ownerUserId', 'User', 'id'],
    ['ConsentGrant', 'grantedToUserId', 'User', 'id'],
    ['FamilyRelation', 'actorUserId', 'User', 'id'],
    ['FamilyRelation', 'subjectUserId', 'User', 'id'],
    ['TimelineEvent', 'userId', 'User', 'id'],
    ['AuditLog', 'actorUserId', 'User', 'id'],
    ['AuditLog', 'patientUserId', 'User', 'id'],
    ['AuditLog', 'consentGrantId', 'ConsentGrant', 'id'],
    ['DeviceSession', 'userId', 'User', 'id'],
    ['RefreshToken', 'userId', 'User', 'id'],
    ['ShareLink', 'ownerUserId', 'User', 'id'],
    ['ShareLink', 'consentGrantId', 'ConsentGrant', 'id'],
  ] as const;

  for (const [table, fk, refTable, refCol] of fkChecks) {
    const orphans = await findOrphans(table, fk, refTable, refCol);
    check(orphans === 0, `no orphan ${table}.${fk} → ${refTable}.${refCol} (${orphans} found)`);
  }

  // 3. Duplicate detection
  console.log('\n[3] Uniqueness Constraints');
  const uniqueChecks = [
    ['User', 'wyshId'],
    ['User', 'phoneNumber'],
    ['UserRole', 'userId_role'],
    ['DoctorProfile', 'userId'],
    ['RefreshToken', 'tokenHash'],
    ['ShareLink', 'tokenHash'],
  ] as const;

  for (const [table, constraint] of uniqueChecks) {
    if (constraint.includes('_')) {
      // Composite unique — check via custom query
      continue;
    }
    const duplicates = await findDuplicates(table, constraint);
    check(duplicates === 0, `unique ${table}.${constraint} (${duplicates} duplicates)`);
  }

  // 4. User role consistency
  console.log('\n[4] Role Consistency');
  const usersWithoutRoles = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
    `SELECT COUNT(*)::int as count FROM "User" u
     LEFT JOIN "UserRole" r ON u.id = r."userId"
     WHERE r."userId" IS NULL`,
  );
  check(Number(usersWithoutRoles[0]?.count ?? 0) === 0, `all users have at least one role`);

  const doctorsWithoutRole = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
    `SELECT COUNT(*)::int as count FROM "DoctorProfile" d
     LEFT JOIN "UserRole" r ON d."userId" = r."userId" AND r.role = 'DOCTOR'
     WHERE r."userId" IS NULL`,
  );
  check(Number(doctorsWithoutRole[0]?.count ?? 0) === 0, `all doctors have DOCTOR role`);

  // 5. Appointment consistency
  console.log('\n[5] Appointment Consistency');
  const pastActiveAppts = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
    `SELECT COUNT(*)::int as count FROM "Appointment"
     WHERE status IN ('REQUESTED', 'CONFIRMED')
     AND "slotEndAt" < NOW()`,
  );
  check(Number(pastActiveAppts[0]?.count ?? 0) === 0, `no past-due active appointments (${pastActiveAppts[0]?.count ?? 0} found)`);

  // 6. Consent consistency
  console.log('\n[6] Consent Consistency');
  const expiredActiveConsents = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
    `SELECT COUNT(*)::int as count FROM "ConsentGrant"
     WHERE status = 'ACTIVE' AND "expiresAt" < NOW()`,
  );
  check(Number(expiredActiveConsents[0]?.count ?? 0) === 0, `no expired active consents (${expiredActiveConsents[0]?.count ?? 0} found)`);

  // 7. Summary
  console.log('');
  if (exitCode === 0) {
    console.log('=== ALL INTEGRITY CHECKS PASSED ===');
  } else {
    console.log(`=== ${errors.length} INTEGRITY FAILURE(S) DETECTED ===`);
    errors.forEach((e) => console.log(e));
  }

  await prisma.$disconnect();
  process.exit(exitCode);
}

main().catch((err) => {
  console.error('Validation failed:', err);
  process.exit(1);
});
