/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/tests/rbac.access-matrix.test.mjs
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
 * Test file: validates rbac/access-matrix
 *
 * Responsibilities:
 * - Support testing functionality
 *
 * Used By:
 - backend/src/test/e2e/workflows.e2e-spec.ts
 - backend/src/test/auth.service.spec.ts
 - backend/src/test/e2e/clinic-admin.e2e-spec.ts
 - backend/src/test/e2e/clinic-queue.e2e-spec.ts
 - backend/src/test/e2e/prescription.e2e-spec.ts
 - backend/tests/auth.contract.test.mjs
 - backend/src/test/authorization.spec.ts
 - backend/src/test/e2e/health-graph.e2e-spec.ts
 *
 * Calls:
 - strict
 *
 * Dependencies:
 - strict
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

import assert from 'node:assert/strict';
import { canAccessPath } from '../../shared/auth-contract.js';
import {
  requireAdmin,
  requirePatient,
  requireRole,
  requireStaff,
} from '../middleware/rbac.middleware.js';

function runMiddleware(middleware, req) {
  let statusCode = 200;
  let payload = null;
  let nextCalled = false;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      payload = body;
      return body;
    },
  };

  middleware(req, res, () => {
    nextCalled = true;
  });

  return { statusCode, payload, nextCalled };
}

assert.equal(
  canAccessPath({ role: 'PATIENT' }, '/patient/dashboard'),
  true
);
assert.equal(
  canAccessPath({ role: 'PATIENT' }, '/doctor/dashboard'),
  false
);
assert.equal(
  canAccessPath({ role: 'STAFF', staffRole: 'DOCTOR' }, '/doctor/dashboard'),
  true
);
assert.equal(
  canAccessPath({ role: 'STAFF', staffRole: 'DOCTOR' }, '/nurse/dashboard'),
  false
);
assert.equal(
  canAccessPath({ role: 'ADMIN' }, '/admin/dashboard'),
  true
);
assert.equal(
  canAccessPath({ role: 'ADMIN' }, '/icu/dashboard'),
  true
);

assert.equal(
  runMiddleware(requirePatient, {
    authSession: { role: 'PATIENT', patientWyshId: 'p-1' },
  }).nextCalled,
  true
);

assert.equal(
  runMiddleware(requireStaff, {
    authSession: { role: 'STAFF', staffRole: 'DOCTOR' },
  }).nextCalled,
  true
);

assert.equal(
  runMiddleware(requireAdmin, {
    authSession: { role: 'ADMIN' },
  }).nextCalled,
  true
);

assert.equal(
  runMiddleware(requireRole('DOCTOR'), {
    authSession: { role: 'STAFF', staffRole: 'DOCTOR' },
  }).nextCalled,
  true
);

const denied = runMiddleware(requireRole('NURSE'), {
  authSession: { role: 'STAFF', staffRole: 'DOCTOR' },
});

assert.equal(denied.nextCalled, false);
assert.equal(denied.statusCode, 403);
assert.deepEqual(denied.payload, {
  error: 'Access denied for role: DOCTOR',
});

console.log('rbac.access-matrix.test: ok');
