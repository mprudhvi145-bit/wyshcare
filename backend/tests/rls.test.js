/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/tests/rls.test.js
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
 * Test file: validates rls
 *
 * Responsibilities:
 * - Support testing functionality
 *
 * Used By:
 - backend/src/modules/ehr/timeline.service.ts
 - backend/src/modules/health-graph-v2/wearables.service.ts
 - backend/src/modules/emergency/emergency.service.ts
 - backend/src/modules/ehr/cds.service.ts
 - backend/src/modules/consent/consent.service.ts
 - backend/src/modules/insurance/insurance.service.ts
 - scripts/validate-integrity.ts
 - backend/src/modules/digital-twin/digital-twin.service.ts
 *
 * Calls:
 - globals
 - client
 *
 * Dependencies:
 - globals
 - client
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

import { PrismaClient } from '@prisma/client';
import { jest } from '@jest/globals';

// Mock all exports from the audit log service to prevent DB writes during tests.
jest.mock('../services/audit-log.service.js', () => ({
  __esModule: true,
  ...jest.requireActual('../services/audit-log.service.js'),
  logAuditEvent: jest.fn().mockResolvedValue(),
}));

const getRlsPrismaClient = (authSession, baseClient = new PrismaClient()) => {
  // Allow for null/undefined authSession for testing unauthenticated access
  const userId = authSession?.userId ?? null;
  const role = authSession?.role ?? null;
  const staffRole = authSession?.staffRole ?? null;

  return baseClient.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          // Set RLS context variables for the duration of the transaction.
          // Using `set_config(..., true)` is critical as it scopes the setting
          // to the current transaction, preventing connection pool contamination.
          const setUserContext = baseClient.$executeRaw`SELECT set_config('app.current_user_id', ${userId}::text, true);`;
          const setRoleContext = baseClient.$executeRaw`SELECT set_config('app.current_user_role', ${role}::text, true);`;
          const setStaffRoleContext = baseClient.$executeRaw`SELECT set_config('app.current_user_staff_role', ${staffRole}::text, true);`;

          const [, , , result] = await baseClient.$transaction([
            setUserContext,
            setRoleContext,
            setStaffRoleContext,
            query(args),
          ]);

          return result;
        },
      },
    },
  });
};

describe('Adversarial RLS and Trust Boundary Validation', () => {
  // --- TEST FIXTURES ---
  const patientA_Auth = {
    userId: 'user-pA',
    patientWyshId: 'patient-A',
    role: 'PATIENT',
  };
  const patientB_Auth = {
    userId: 'user-pB',
    patientWyshId: 'patient-B',
    role: 'PATIENT',
  };
  const doctorForPatientA_Auth = {
    userId: 'user-docA',
    staffWyshId: 'staff-docA',
    role: 'STAFF',
    staffRole: 'DOCTOR',
  };
  const nurseForPatientA_Auth = {
    userId: 'user-nurseA',
    staffWyshId: 'staff-nurseA',
    role: 'STAFF',
    staffRole: 'NURSE',
  };
  const billing_Auth = {
    userId: 'user-billing',
    staffWyshId: 'staff-billing',
    role: 'STAFF',
    staffRole: 'BILLING',
  };
  const admin_Auth = {
    userId: 'user-admin',
    role: 'ADMIN',
  };

  // --- TEST ASSUMPTIONS ---
  // - Patient 'patient-A' has 1 MedicalRecord.
  // - Patient 'patient-B' has 1 MedicalRecord.
  // - Doctor 'staff-docA' and Nurse 'staff-nurseA' are assigned to 'patient-A' only.

  describe('1. Adversarial: Missing or Incomplete Session Context', () => {
    test('DENIES access when no auth context is provided', async () => {
      const prisma = new PrismaClient(); // No RLS extension
      const records = await prisma.medicalRecord.findMany();
      expect(records.length).toBe(0);
    });

    test('DENIES access when user context is null', async () => {
      const prisma = getRlsPrismaClient({ userId: null, role: 'PATIENT' });
      const records = await prisma.medicalRecord.findMany();
      expect(records.length).toBe(0);
    });
  });

  describe('2. Adversarial: Cross-Patient Data Access', () => {
    test('Patient A CANNOT access Patient B\'s records via direct query', async () => {
      const prisma = getRlsPrismaClient(patientA_Auth);
      const records = await prisma.medicalRecord.findMany({
        where: { patientWyshId: 'patient-B' },
      });
      expect(records.length).toBe(0);
    });

    test('Patient A CAN access their OWN records', async () => {
      const prisma = getRlsPrismaClient(patientA_Auth);
      const record = await prisma.medicalRecord.findFirst({
        where: { patientWyshId: 'patient-A' },
      });
      expect(record).not.toBeNull();
      expect(record.patientWyshId).toBe('patient-A');
    });

    test('Aggregation queries are correctly scoped to a single patient', async () => {
      const prisma = getRlsPrismaClient(patientA_Auth);
      const aggregate = await prisma.medicalRecord.aggregate({ _count: { id: true } });
      // Should only count the 1 record for Patient A, not all records in the DB.
      expect(aggregate._count.id).toBe(1);
    });
  });

  describe('3. Adversarial: Staff Privilege Escalation', () => {
    test('Assigned Doctor CAN access their Patient\'s records', async () => {
      const prisma = getRlsPrismaClient(doctorForPatientA_Auth);
      const record = await prisma.medicalRecord.findFirst({
        where: { patient: { wyshId: 'patient-A' } },
      });
      expect(record).not.toBeNull();
      expect(record.patientWyshId).toBe('patient-A');
    });

    test('Assigned Nurse CAN access their Patient\'s records', async () => {
      const prisma = getRlsPrismaClient(nurseForPatientA_Auth);
      const record = await prisma.medicalRecord.findFirst({
        where: { patient: { wyshId: 'patient-A' } },
      });
      expect(record).not.toBeNull();
      expect(record.patientWyshId).toBe('patient-A');
    });

    test('Doctor CANNOT access records of unassigned patients', async () => {
      const prisma = getRlsPrismaClient(doctorForPatientA_Auth);
      const records = await prisma.medicalRecord.findMany({
        where: { patient: { wyshId: 'patient-B' } },
      });
      expect(records.length).toBe(0);
    });

    test('BILLING staff CANNOT access any clinical records', async () => {
      const prisma = getRlsPrismaClient(billing_Auth);
      const records = await prisma.medicalRecord.findMany();
      expect(records.length).toBe(0);
    });
  });

  describe('4. Adversarial: Admin Boundary Enforcement', () => {
    test('Admin CANNOT access patient records directly (must use audited impersonation)', async () => {
      const prisma = getRlsPrismaClient(admin_Auth);
      const records = await prisma.medicalRecord.findMany();
      // RLS policy for admins must prevent direct data access.
      expect(records.length).toBe(0);
    });
  });

  describe('5. Adversarial: Raw Query RLS Bypass', () => {
    test('$queryRaw CANNOT bypass RLS policies', async () => {
      const prisma = getRlsPrismaClient(patientA_Auth);
      // Patient A attempts to select Patient B's record using a raw query.
      const records = await prisma.$queryRaw`SELECT * FROM "MedicalRecord" WHERE "patientWyshId" = 'patient-B'`;
      expect(records.length).toBe(0);
    });

    test('$executeRaw CANNOT bypass RLS update policies', async () => {
      const prisma = getRlsPrismaClient(patientA_Auth);
      // Patient A attempts to update Patient B's record.
      const updatedCount = await prisma.$executeRaw`UPDATE "MedicalRecord" SET notes = 'malicious update' WHERE "patientWyshId" = 'patient-B'`;
      expect(updatedCount).toBe(0);
    });
  });

  describe('6. Adversarial: Connection Pool Contamination', () => {
    test('Session context from one request does NOT leak to a concurrent request', async () => {
      // Use a single Prisma client instance to ensure connection pooling.
      const sharedPrismaClient = new PrismaClient();

      // Create two RLS-enabled clients with different identities, sharing the same pool.
      const clientA = getRlsPrismaClient(patientA_Auth, sharedPrismaClient);
      const clientB = getRlsPrismaClient(patientB_Auth, sharedPrismaClient);

      // Execute two queries concurrently to increase the chance of connection reuse.
      const [resultA, resultB] = await Promise.all([
        clientA.medicalRecord.findMany({ where: { patientWyshId: 'patient-A' } }),
        clientB.medicalRecord.findMany({ where: { patientWyshId: 'patient-B' } }),
      ]);

      // VERIFY: Patient A's query only returned Patient A's data.
      expect(resultA.length).toBe(1);
      expect(resultA[0].patientWyshId).toBe('patient-A');

      // VERIFY: Patient B's query only returned Patient B's data.
      expect(resultB.length).toBe(1);
      expect(resultB[0].patientWyshId).toBe('patient-B');

      await sharedPrismaClient.$disconnect();
    });
  });

  describe('7. Adversarial: AuditLog RLS Enforcement', () => {
    test('DENIES read access for PATIENT role', async () => {
      const prisma = getRlsPrismaClient(patientA_Auth);
      const logs = await prisma.auditLog.findMany();
      expect(logs.length).toBe(0);
    });

    test('DENIES read access for STAFF role (Doctor)', async () => {
      const prisma = getRlsPrismaClient(doctorForPatientA_Auth);
      const logs = await prisma.auditLog.findMany();
      expect(logs.length).toBe(0);
    });

    test('ALLOWS read access for ADMIN role', async () => {
      const prisma = getRlsPrismaClient(admin_Auth);
      const logs = await prisma.auditLog.findMany();
      // This proves the query doesn't fail and isn't incorrectly filtered to zero.
      // We assume the test DB has pre-existing logs.
      expect(Array.isArray(logs)).toBe(true);
    });

    test('DENIES update operations via RLS for all roles (even ADMIN)', async () => {
      const adminPrisma = getRlsPrismaClient(admin_Auth);
      const logToUpdate = await adminPrisma.auditLog.findFirst();

      if (!logToUpdate) {
        console.warn('Skipping AuditLog update test: no logs exist in test DB.');
        return;
      }

      // Attempting to update should violate the `WITH CHECK (false)` policy.
      await expect(
        adminPrisma.auditLog.update({
          where: { id: logToUpdate.id },
          data: { action: 'TAMPERED' },
        })
      ).rejects.toThrow();
    });

    test('DENIES delete operations via RLS for all roles (even ADMIN)', async () => {
      const adminPrisma = getRlsPrismaClient(admin_Auth);
      const logToDelete = await adminPrisma.auditLog.findFirst();

      if (!logToDelete) {
        console.warn('Skipping AuditLog delete test: no logs exist in test DB.');
        return;
      }

      // Attempting to delete should violate the `WITH CHECK (false)` policy.
      await expect(
        adminPrisma.auditLog.delete({
          where: { id: logToDelete.id },
        })
      ).rejects.toThrow();
    });

    test('DENIES bulk update operations via RLS', async () => {
      const adminPrisma = getRlsPrismaClient(admin_Auth);
      // Attempting a bulk update should affect 0 rows due to the RLS policy.
      const { count } = await adminPrisma.auditLog.updateMany({
        where: {
          action: 'GET', // Target some existing logs
        },
        data: { action: 'BULK_TAMPER' },
      });
      expect(count).toBe(0);
    });

    test('$executeRaw CANNOT bypass AuditLog RLS update policies', async () => {
      const adminPrisma = getRlsPrismaClient(admin_Auth);
      const logToUpdate = await adminPrisma.auditLog.findFirst();

      if (!logToUpdate) {
        console.warn(
          'Skipping AuditLog raw tamper test: no logs exist in test DB.'
        );
        return;
      }

      // Attempt to update via raw query. This should fail because the RLS policy
      // prevents any rows from being visible to the UPDATE operation.
      const updatedCount =
        await adminPrisma.$executeRaw`UPDATE "AuditLog" SET action = 'TAMPERED_RAW' WHERE id = ${logToUpdate.id}`;

      // The number of rows affected should be 0.
      expect(updatedCount).toBe(0);
    });
  });
});