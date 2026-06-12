/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/tests/auth.contract.test.mjs
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
 * Test file: validates auth/contract
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
 - backend/src/test/authorization.spec.ts
 - backend/src/test/e2e/health-graph.e2e-spec.ts
 - backend/src/test/e2e/pharmacy.e2e-spec.ts
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
import {
  issueAuthToken,
  refreshAuthSession,
  revokeRefreshToken,
} from '../middleware/auth.middleware.js';

process.env.SUPABASE_JWT_SECRET ||= 'test-secret';
process.env.JWT_ISSUER ||= 'wyshcare-test';
process.env.JWT_AUDIENCE ||= 'wyshcare-test-clients';

const issued = issueAuthToken({
  userId: 'doctor-1',
  role: 'DOCTOR',
  staffRole: 'DOCTOR',
});

assert.equal(issued.userId, 'doctor-1');
assert.equal(issued.role, 'STAFF');
assert.equal(issued.staffRole, 'DOCTOR');
assert.ok(issued.accessToken);
assert.ok(issued.refreshToken);
assert.ok(issued.expiresAt > Date.now());

const rotated = refreshAuthSession(issued.refreshToken);
assert.notEqual(rotated.refreshToken, issued.refreshToken);
assert.equal(rotated.role, 'STAFF');
assert.equal(rotated.staffRole, 'DOCTOR');

let rotatedAgain = false;
try {
  refreshAuthSession(issued.refreshToken);
  rotatedAgain = true;
} catch {
  rotatedAgain = false;
}
assert.equal(rotatedAgain, false);

revokeRefreshToken(rotated.refreshToken);

let reusedRevoked = false;
try {
  refreshAuthSession(rotated.refreshToken);
  reusedRevoked = true;
} catch {
  reusedRevoked = false;
}
assert.equal(reusedRevoked, false);

console.log('auth.contract.test: ok');
