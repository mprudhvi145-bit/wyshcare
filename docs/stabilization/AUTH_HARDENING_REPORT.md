# Auth Hardening Report — WyshCare

**Generated:** 2026-06-12
**Scope:** Auth module (auth.service.ts, admin-auth.service.ts, guards, DTOs, Prisma auth models)
**Method:** Code audit + gap analysis

---

## Current Auth Architecture

```
Phone → OTP Request → SMS (mock in dev) → OTP Verify → JWT Issued → Cookie + Response
                                    ↓
                            Refresh Token Rotation
                            Device Session Tracking
                            Audit Logging
```

**Authentication flows:**
- Phone OTP (primary) via `POST /api/v1/auth/otp/request` + `POST /api/v1/auth/otp/verify`
- Admin email+password via `AdminAuthService.login()` using argon2
- JWT access tokens (15m TTL) + refresh tokens (30d TTL, rotated on use)
- Session management via `DeviceSession` model
- No social login, no OAuth, no MFA

---

## Current State Assessment

| Control | Status | Implementation |
|---------|--------|---------------|
| Phone OTP auth | ✅ **Implemented** | Real OTP hashing, Prisma persistence, SMS routing |
| OTP rate limiting | ✅ **Implemented** | Max 5 active challenges per phone number |
| OTP attempt limiting | ✅ **Implemented** | Max 5 attempts per challenge |
| JWT signing | ✅ **Implemented** | Real `@nestjs/jwt` with RS256/JWT |
| Refresh token rotation | ✅ **Implemented** | Token rotated on use; old token revoked (reuse detection) |
| Session tracking | ✅ **Implemented** | `DeviceSession` model with fingerprint, IP, user agent |
| Session revocation | ✅ **Implemented** | Per-session and per-user revocation |
| Audit logging | ✅ **Implemented** | Captures OTP_REQUESTED, OTP_VERIFIED, SESSION_REFRESHED, SESSION_REVOKED, SESSION_LOGGED_OUT |
| Cookie security | ✅ **Implemented** | httpOnly, secure in prod, sameSite=lax |
| RolesGuard | ✅ **Implemented** | `RolesGuard` + `@Roles()` decorator exist |
| Global throttler | ⚠️ **Configured** | `ThrottlerModule.forRoot([{ttl:60000, limit:120}])` but **no `ThrottlerGuard` applied to any controller** |
| JWT blacklist | ❌ **Missing** | Tokens stay valid until expiry; no blacklist on logout |
| Login throttling (IP) | ❌ **Missing** | No IP-based rate limiting on auth endpoints |
| Account lockout | ❌ **Missing** | No lockout after repeated failed OTP attempts |
| MFA (TOTP) | ❌ **Missing** | Admin MFA stubs exist; no user MFA |
| Password reset | ❌ **Missing** | Admin has no password reset flow |
| Social login / OAuth | ❌ **Missing** | Not implemented anywhere |
| Session timeout enforcement | ❌ **Missing** | No idle session timeout |
| MFA enforcement policy | ❌ **Missing** | No way to require MFA for specific roles |
| `.env.example` missing entries | ❌ **Missing** | `COOKIE_SECRET`, `MASTER_ENCRYPTION_KEY` missing |

---

## Auth Sub-Module Gaps

### MFA (AdminAuthService) — Stubs

```typescript
// admin-auth.service.ts:143
setupMfa() → "MFA setup is not yet implemented"
verifyMfa() → "MFA verification is not yet implemented"
disableMfa() → "MFA disable stub — no action taken as MFA is not yet implemented"
```

The `AdminCredential` model already has `mfaSecret` and `mfaEnabled` fields — ready for TOTP.

### DeviceSession — Missing Fields

| Missing | Impact |
|---------|--------|
| No `mfaVerified` timestamp | Cannot tell if session was MFA-authenticated |
| No `failedAt` / `failedCount` | Cannot implement account lockout |
| No `lastIpAddress` tracking | Cannot detect IP changes |
| No `isTrusted` flag | Cannot skip MFA on trusted devices |

---

## Auth Hardening Plan — P0 Items

### 1. TOTP MFA

**Add package:** `otplib` (TOTP) + `qrcode` (QR code generation)

**Changes:**
- New `MfaService` with `generateSecret()`, `verifyToken()`, `generateBackupCodes()`
- Implement `AdminAuthService.setupMfa()` → generates TOTP secret, returns QR code URI
- Implement `AdminAuthService.verifyMfa()` → validates TOTP code
- Implement `AdminAuthService.disableMfa()` → removes secret
- Add `POST /auth/mfa/setup`, `POST /auth/mfa/verify`, `POST /auth/mfa/disable` endpoints
- New Prisma model `UserMfa` or use existing `AdminCredential.mfaSecret`

### 2. Login Throttling & Account Lockout

**Add model:** `LoginAttempt` with userId, ip, timestamp, success/failure

**Logic:**
- Track failed attempts per user: lockout after 10 failures within 15min
- Track failed attempts per IP: lockout after 20 failures within 15min
- Lockout duration: 30 minutes (doubles on repeat lockouts)
- Return generic "Invalid credentials" regardless of specific failure reason
- Alert admin on 5+ consecutive lockouts for same account

**Changes:**
- New `"AUTH_LOCKOUT_TRIGGERED"` audit event
- New `lockedUntil` field on `User` model
- Middleware/guard on auth endpoints

### 3. JWT Blacklist

**Using Redis:**
- On logout: add access token JTI to Redis blacklist with TTL = remaining token expiry
- On every authenticated request: check JWT against Redis blacklist
- On refresh token rotation: also blacklist old access token

**Changes:**
- Extract JTI from JWT payload
- `RedisService.blacklistToken(jti, ttl)` method
- `JwtAuthGuard` checks blacklist before validating

### 4. ThrottlerGuard on Auth Controllers

**Changes:**
- `@UseGuards(ThrottlerGuard)` on auth controller
- Tighter limits for auth routes: 5 OTP requests per minute, 10 verify attempts per minute

### 5. .env.example Updates

**Add missing vars:**
- `COOKIE_SECRET=generate-random-string`
- `MASTER_ENCRYPTION_KEY=generate-32-byte-hex`
- `OTEL_ENABLED=false`
- `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318`
- `OPENAI_API_KEY=`
- `OPENROUTER_API_KEY=`
- `NVIDIA_API_KEY=`
- `RABBITMQ_ENABLED=false`
- `RABBITMQ_URL=`

---

## Scoring

### Before Hardening

| Area | Score |
|------|-------|
| MFA | 0/100 |
| Login throttling | 40/100 |
| Session management | 70/100 |
| JWT security | 60/100 |
| Auth configuration | 30/100 |
| **Overall** | **40/100** |

### Target After Hardening

| Area | Score |
|------|-------|
| MFA | 90/100 |
| Login throttling | 90/100 |
| Session management | 85/100 |
| JWT security | 85/100 |
| Auth configuration | 80/100 |
| **Overall** | **86/100** |
