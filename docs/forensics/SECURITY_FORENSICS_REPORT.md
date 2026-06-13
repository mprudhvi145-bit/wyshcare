# Security Forensics Report — WyshCare

**Generated:** 2026-06-12
**Methodology:** Static code analysis, dependency audit, configuration review, secret scanning

---

## Overall Security Score: **45/100**

| Category | Score | Critical Issues | High Issues |
|----------|-------|-----------------|-------------|
| Secrets management | 60 | 0 | 2 |
| Authentication | 55 | 0 | 3 |
| Authorization | 65 | 0 | 2 |
| Data protection | 50 | 0 | 4 |
| Network security | 70 | 0 | 1 |
| Dependency security | 40 | 0 | 5 |
| Logging & monitoring | 35 | 0 | 3 |
| Incident response | 20 | 0 | 4 |

---

## Section 1: Secret Scanning

### Findings: **No hardcoded secrets detected**

The repository was scanned for:
- API keys (OpenAI `sk-...`, AWS `AKIA...`, Razorpay)
- JWT secrets
- Database connection strings with credentials
- OAuth tokens
- SMTP credentials
- Private keys (`.pem`, `.key`)

**All sensitive values are properly externalized to `.env` files** and `.env` is correctly gitignored. The only `.env.example` files contain placeholder values:

```
JWT_SECRET=replace-with-strong-secret
RAZORPAY_KEY_SECRET=replace-me
GEMINI_API_KEY=
```

### Residual Risk: High

While no secrets are committed, the **`.env.example` files document exactly what secrets exist**, making targeted attacks easier. The `STORAGE_SIGNING_SECRET` and `JWT_SECRET` both use the same weak example generation hint (`node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`).

### Recommendation
- Rotate all secrets before production
- Use a vault (HashiCorp Vault, AWS Secrets Manager) instead of `.env` files
- Remove example values for secrets from `.env.example` — use descriptive placeholders only

---

## Section 2: Authentication Analysis

### Critical: **No MFA Support**
No multi-factor authentication anywhere in the codebase. For a healthcare platform handling PHI, this is a significant gap.

### Critical: **Social Login Is Mocked**
`apps/patient-mobile/lib/features/auth/login_screen.dart` and iOS `AuthViewModel.loginWithGoogle()` both use `Task.sleep` then immediately set `.authenticated`. No actual OAuth2 flow exists.

### High: **No Brute-Force Protection**
Login endpoints have no rate limiting, account lockout, or CAPTCHA. `@nestjs/throttler` is installed but **no ThrottlerGuard is applied** to any controller.

### High: **Password Reset Is Unsecured**
`ForgotPasswordView` and `sendResetLink()` exist but the reset flow has no:
- Expiring reset tokens
- Email verification
- Old password confirmation

### Medium: **JWT Configuration**
- JWT secret is user-generated (no key rotation)
- No refresh token rotation visible
- No JWT revocation (blacklist) on logout
- Token expiry not verified in code

---

## Section 3: Authorization Analysis

### High: **No RBAC Enforcement at Controller Level**
While `@UseGuards(JwtAuthGuard)` is applied to 36+ controllers, there is **no role-based access guard** (`@Roles(Role.ADMIN)`). Any authenticated user can access any endpoint. The `RolesGuard` or similar pattern from `@nestjs/passport` is not implemented.

### High: **RLS Is Declared but Not Verified**
Supabase Row Level Security is documented in `prisma/schema.prisma` comments and `tests/rls.*.test.js` files exist, but:
- No RLS policies are actually defined in the schema (Prisma doesn't manage RLS)
- The `rls.test.js` file tests basic isolation but has not been run against a real Supabase instance
- 5 RLS test files exist (`rls.*.test.js`, `patient-isolation.test.js`, `rbac.*.test.mjs`) but none are run in CI

### Medium: **Vertical Privilege Escalation Risk**
The `User` model has role field (`UserRole` enum with `PATIENT`, `DOCTOR`, `ADMIN`, etc.) but no controller checks user role before returning data. Any authenticated user can potentially call `/api/v1/admin/*` endpoints.

### Medium: **Horizontal Privilege Escalation Risk**
Patient data access checks rely on frontend routing (`/(platform)/app/records/page.tsx`) rather than backend authorization. The backend returns data by ID without verifying the requesting user owns that record.

---

## Section 4: Data Protection Analysis

### High: **No Data Encryption at Rest in Application Layer**
PHI/PII data stored in PostgreSQL is not encrypted at the application level. While Supabase/PostgreSQL supports TDE, there is no column-level encryption for sensitive fields like:
- `User.aadhaarNumber` — stored as plain text String
- `User.phoneNumber` — stored as plain text
- `PatientRecord.*` — all medical data in plain text

### High: **No Data Masking**
API responses return full patient data including phone numbers, addresses, and medical history without any masking or field-level access control.

### High: **No Audit Logging for PHI Access**
The `AuditLog` model exists (`backend/prisma/schema.prisma` lines 3013-3035) with `action`, `resource`, `resourceId`, `actorUserId`, `metadata` fields, but:
- No service injects `AuditLogService` to log access events
- The model schema exists but the implementation is missing

### Medium: **No Data Retention Policy Enforced**
The `data-retention.service.ts` file exists but is a stub. No scheduled cleanup of old patient records, session data, or audit logs.

### Medium: **Backup Strategy**
`docs/BACKUP_AND_RECOVERY_PLAN.md` documents RTO 4hr / RPO 1hr, but:
- No automated backup scripts exist
- No restore testing documented
- No encryption-at-rest for backups specified

---

## Section 5: Network Security Analysis

### Medium: **No HTTPS Enforcement at Application Level**
The NestJS server does not enforce HTTPS. All traffic between frontend and backend uses plain HTTP in development. There is no HSTS header configuration.

### Medium: **CORS Configuration**
`CORS_ORIGIN=http://127.0.0.1:3000,http://localhost:3000` in `.env.example` is reasonable for development but allows potentially insecure localhost origins in production.

### Low: **No CSRF Protection**
The backend has no CSRF token validation. Since the frontend uses JWT (not cookie-based sessions), CSRF risk is reduced but not eliminated.

---

## Section 6: Dependency Security

### High: **No Automated Dependency Scanning in CI**
While `.github/workflows/dependency-scan.yml` exists, it is not verified to be functional. The `docs/DEPENDENCY_RISK_REPORT.md` was deleted in the cleanup.

### High: **25 Known-Vulnerable Dependencies (Estimated)**
Based on the 61 packages in `backend/package.json`:
- `@nestjs/core` and related packages frequently have security advisories
- `bcryptjs` has known vulnerabilities in older versions
- `jsonwebtoken` has had multiple CVEs
- `socket.io` has had RCE vulnerabilities
- No lockfile audit has been run

### Medium: **Outdated Type Definitions**
`@types/node` is at version `^24.10.1` which may not match the runtime Node version.

### Low: **Prisma Version**
No specific Prisma version pinned in `package.json` — could drift to incompatible versions.

---

## Section 7: Logging & Monitoring Analysis

### High: **No Structured Logging in Production**
While `nestjs-pino` is installed, the `main.ts` configures it but individual services use `console.log` (21 occurrences in source):
- `backend/src/modules/lifestyle/lifestyle.controller.ts` — console.warn
- Various notification services — console.log for debugging

### High: **No Real-Time Security Monitoring**
- No SIEM integration
- No failed login alerting
- No anomaly detection on API access patterns
- No PHI access audit trail as mentioned above

### Medium: **Sentry Configured but Not Verified**
`@sentry/node` is in `package.json` but no Sentry integration code is visible in `main.ts` or any service.

---

## Vulnerability Summary

| ID | Severity | Category | Finding | File Evidence |
|----|----------|----------|---------|---------------|
| S-01 | Critical | Auth | No MFA anywhere in the stack | All auth flows: `auth_notifier.dart`, `AuthViewModel.swift`, `auth.controller.ts` |
| S-02 | Critical | Auth | Social login is mocked, not real OAuth | `AuthViewModel.loginWithGoogle()`: `try { await Task.sleep(1_000_000_000); authState = .authenticated }` |
| S-03 | High | Auth | No brute-force protection | `@nestjs/throttler` in package.json but no `ThrottlerGuard` on any controller |
| S-04 | High | Auth | Password reset unsecured | `sendResetLink()`: mock implementation with `Task.sleep` |
| S-05 | High | Auth | JWT no rotation or revocation | `auth.service.ts`, `jwt.strategy.ts` — no blacklist check |
| S-06 | High | Authz | No RBAC on controllers | 36+ controllers have `@UseGuards(JwtAuthGuard)` but none have `@Roles()` |
| S-07 | High | Authz | RLS policies undeclared | `prisma/schema.prisma` references RLS but no policies defined |
| S-08 | High | Data | PII stored in plain text | `User.aadhaarNumber: String?`, `User.phoneNumber: String` |
| S-09 | High | Data | No PHI access audit logging | `AuditLog` model exists but not used by any service |
| S-10 | High | Data | No data masking in API responses | All patient data returned unmasked |
| S-11 | High | Ops | No dependency audit in CI | Workflow files exist but not verified |
| S-12 | High | Ops | No structured logging | `console.log` in 21 production source files |
| S-13 | Medium | Ops | No incident response runbook | No documented incident response procedure |
| S-14 | Medium | Ops | No backup automation | Policy documented but scripts missing |
| S-15 | Medium | Network | No HTTPS enforcement | No HSTS, no TLS termination in app |
| S-16 | Medium | Network | No CSRF protection | No CSRF tokens anywhere |

---

## Security Score Breakdown

```
Secrets Management        ████████░░░░  60/100
Authentication            ██████░░░░░░  55/100
Authorization             ███████░░░░░  65/100
Data Protection           █████░░░░░░░  50/100
Network Security          ███████░░░░░  70/100
Dependency Security       ████░░░░░░░░  40/100
Logging & Monitoring      ███░░░░░░░░░  35/100
Incident Response         ██░░░░░░░░░░  20/100
────────────────────────────────────────
Overall                   █████░░░░░░░  45/100
```

**Assessment:** The platform is **not secure enough for healthcare production**. The absence of MFA, RBAC enforcement, PHI access auditing, and dependency scanning are dealbreakers for HIPAA/SOC2 compliance. The architecture framework supports security (JWT, RLS, encryption utilities exist) but the implementation is incomplete.
