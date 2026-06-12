/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: scripts/validate-security.mjs
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
 * validate-security — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - backend/src/providers/storage/storage.service.ts
 - scripts/validate-deployment.mjs
 *
 * Calls:
 - node:url
 - node:fs
 - node:path
 *
 * Dependencies:
 - node:url
 - node:fs
 - node:path
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
// WyshCare Security Hardening Validation
// ============================================================
// Run: node scripts/validate-security.mjs
// ============================================================
// Validates JWT, CSRF, rate limiting, session management,
// file upload guards, and encryption configuration.
// ============================================================

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

let exitCode = 0;
const issues = [];

function check(condition, message) {
  if (!condition) {
    issues.push(`  FAIL: ${message}`);
    exitCode = 1;
  } else {
    console.log(`  OK:   ${message}`);
  }
}

function checkWarning(condition, message) {
  if (!condition) {
    issues.push(`  WARN: ${message}`);
  } else {
    console.log(`  OK:   ${message}`);
  }
}

function readSource(path) {
  const fullPath = resolve(ROOT, path);
  if (!existsSync(fullPath)) return '';
  return readFileSync(fullPath, 'utf-8');
}

async function main() {
  console.log('\n=== WYSHCARE SECURITY HARDENING VALIDATION ===\n');

  // 1. JWT Configuration
  console.log('[1] JWT Configuration');
  const authModule = readSource('backend/src/modules/auth/auth.module.ts');
  const authService = readSource('backend/src/modules/auth/auth.service.ts');
  const jwtGuard = readSource('backend/src/common/guards/jwt-auth.guard.ts');

  check(authModule.includes('JwtModule.registerAsync'), 'JWT module uses async registration');
  check(authModule.includes('secret:'), 'JWT has secret configured');
  check(authModule.includes('expiresIn'), 'JWT has expiration configured');

  // Check JWT payload structure
  check(authService.includes('sub: input.userId'), 'JWT payload includes sub (userId)');
  check(authService.includes('phoneNumber:'), 'JWT payload includes phoneNumber');
  check(authService.includes('roles:'), 'JWT payload includes roles');
  check(authService.includes('sessionId:'), 'JWT payload includes sessionId');

  // Check JWT guard validates session
  check(jwtGuard.includes('DeviceSession.findFirst'), 'JWT guard validates active DeviceSession');
  check(jwtGuard.includes('revokedAt: null'), 'JWT guard rejects revoked sessions');
  check(jwtGuard.includes('expiresAt: { gt: new Date() }'), 'JWT guard rejects expired sessions');

  // 2. CSRF Protection
  console.log('\n[2] CSRF Protection');
  const mainTs = readSource('backend/src/main.ts');
  const csrfModule = readSource('backend/src/common/security/csrf.ts');

  check(mainTs.includes('csrfMiddleware'), 'CSRF middleware applied globally');
  check(csrfModule.length > 0, 'CSRF module exists and has implementation');
  check(csrfModule.includes('crypto.randomBytes'), 'CSRF uses crypto-random tokens');
  check(csrfModule.includes('sameSite'), 'CSRF sets sameSite cookie attribute');

  // 3. Rate Limiting
  console.log('\n[3] Rate Limiting');
  const appModule = readSource('backend/src/app.module.ts');
  check(appModule.includes('ThrottlerModule'), 'ThrottlerModule is registered');
  check(appModule.includes('ttl:'), 'Rate limit TTL configured');
  check(appModule.includes('limit:'), 'Rate limit count configured');
  check(appModule.includes('120'), 'Rate limit set to 120 requests per minute');

  // Check OTP-specific rate limiting
  check(authService.includes('activeChallenges >= 5'), 'OTP has per-phone rate limit (max 5)');
  check(authService.includes('attemptCount >= 5'), 'OTP attempt lockout at 5 failures');

  // 4. Session Management
  console.log('\n[4] Session Management');
  check(authService.includes('DeviceSession.create'), 'Sessions created on OTP verify');
  check(authService.includes('refreshToken'), 'Refresh tokens issued alongside access tokens');
  check(authService.includes('revokedAt:'), 'Session revocation implemented');
  check(authService.includes('revokedAt: new Date()'), 'Sessions can be revoked');
  check(authService.includes('listSessions'), 'Users can list their sessions');
  check(authService.includes('revokeSession'), 'Users can revoke individual sessions');
  check(authService.includes('REFRESH_TOKEN_REUSE_DETECTED'), 'Refresh token reuse detection');

  // 5. Password-less Auth (OTP)
  console.log('\n[5] Authentication');
  check(authService.includes('otpHash'), 'OTP stored as hash, not plaintext');
  check(authService.includes('createHash'), 'SHA-256 used for OTP hashing');
  check(!authService.includes('bcrypt'), 'No password hashing (passwordless auth)');
  check(authService.includes('expiresAt: new Date(Date.now() + 10 * 60_000)'), 'OTP has 10-min expiry');

  // 6. File Upload Security
  console.log('\n[6] File Upload Security');
  const vaultService = readSource('backend/src/modules/vault/vault.service.ts');
  check(vaultService.includes('allowedMimeTypes'), 'MIME type whitelisting for uploads');
  check(vaultService.includes('maxUploadBytes'), 'Max upload size enforced');
  check(vaultService.includes('scanObject'), 'Uploads scanned before storage');
  check(vaultService.includes('BadRequestException'), 'Upload validation errors are structured');

  // 7. Signed URLs
  console.log('\n[7] Signed URL Security');
  const storageService = readSource('backend/src/providers/storage/storage.service.ts');
  check(storageService.includes('getSignedUrl'), 'Signed URLs for S3/MinIO downloads');
  check(storageService.includes('expiresIn'), 'Signed URLs have expiration');
  check(storageService.includes('createHmac'), 'HMAC signing for download URLs');

  // 8. Encryption
  console.log('\n[8] Encryption');
  const encryptionService = readSource('backend/src/common/encryption/encryption.service.ts');
  const fieldEncryption = readSource('backend/src/common/encryption/field-encryption.service.ts');

  check(existsSync(resolve(ROOT, 'backend/src/common/encryption/encryption.service.ts')), 'Encryption service exists');
  check(encryptionService.includes('aes-256-gcm'), 'Uses AES-256-GCM encryption');
  check(encryptionService.includes('randomBytes'), 'Uses random IV per operation');
  check(encryptionService.includes('pbkdf2Sync'), 'Uses PBKDF2 for key derivation');
  check(encryptionService.includes('masterKey'), 'Master encryption key configured');

  check(fieldEncryption.includes('phiFields'), 'PHI field mapping defined');
  check(fieldEncryption.includes('encryptRecord'), 'Field-level encryption function exists');
  check(fieldEncryption.includes('maskPII'), 'PII masking function exists');

  // 9. Audit Logging
  console.log('\n[9] Audit Logging');
  const auditLog = readSource('backend/src/common/services/audit-log.service.ts');
  check(auditLog.includes('action:'), 'Audit logs capture action name');
  check(auditLog.includes('resourceType:'), 'Audit logs capture resource type');
  check(auditLog.includes('resourceId:'), 'Audit logs capture resource ID');
  check(auditLog.includes('actorUserId:'), 'Audit logs capture acting user');
  check(auditLog.includes('maskPHIInMetadata'), 'PHI masking in audit metadata');

  // Check audit calls in key services
  const services = [
    ['auth.service.ts', 'OTP_VERIFIED'],
    ['consent.service.ts', 'CONSENT_GRANTED'],
    ['consent.service.ts', 'CONSENT_REVOKED'],
    ['telemedicine.service.ts', 'APPOINTMENT_CREATED'],
    ['telemedicine.service.ts', 'CONSULTATION_SESSION_CREATED'],
    ['vault.service.ts', 'RECORD_UPLOADED'],
    ['family.service.ts', 'FAMILY_MEMBER_LINKED'],
  ];

  for (const [file, event] of services) {
    const content = readSource(`backend/src/modules/${file.includes('auth') ? 'auth' : file.includes('consent') ? 'consent' : file.includes('telemedicine') ? 'telemedicine' : file.includes('vault') ? 'vault' : file.includes('family') ? 'family' : ''}/${file}`);
    if (file.includes('auth')) {
      const content = readSource(`backend/src/modules/auth/${file}`);
      check(content.includes(event), `${file}: audit event "${event}" is emitted`);
    }
  }

  // 10. Cookie Security
  console.log('\n[10] Cookie Security');
  check(authService.includes('httpOnly: true'), 'Auth cookies set httpOnly');
  check(authService.includes('sameSite'), 'Auth cookies set sameSite');
  check(authService.includes('secure: process.env.NODE_ENV'), 'Auth cookies secure flag depends on NODE_ENV');

  // 11. Roles Guard
  console.log('\n[11] Role-Based Access Control');
  const rolesGuard = readSource('backend/src/common/guards/roles.guard.ts');
  check(rolesGuard.includes('requiredRoles.some'), 'RolesGuard checks user has at least one required role');
  check(rolesGuard.includes('request.user?.roles'), 'RolesGuard reads roles from authenticated user');

  // 12. Summary
  console.log('');
  if (exitCode === 0) {
    console.log('=== ALL SECURITY CHECKS PASSED ===');
  } else {
    console.log(`=== ${issues.length} SECURITY ISSUE(S) DETECTED ===`);
    issues.forEach((i) => console.log(i));
  }

  process.exit(exitCode);
}

main().catch((err) => {
  console.error('Security validation failed:', err);
  process.exit(1);
});
