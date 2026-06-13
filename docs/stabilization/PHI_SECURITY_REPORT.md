# Phase 4: PHI Security Report

**Date:** 2026-06-12
**Current Score:** 35/100
**Target Score:** 80/100

---

## 1. Encryption at Rest

### 1.1 Current State
| Component | Status | Detail |
|-----------|--------|--------|
| AES-256-GCM encryption service | ✅ | `encryption.service.ts` — proper AEAD with per-op random IV |
| PBKDF2 key derivation | ✅ | 100k iterations, SHA-512, per-field context binding |
| File-level DEK encryption | ✅ | Per-file random DEK, encrypted by master key |
| Field-level encryption service | ⚠️ | Exists but must be manually invoked per write; no decorator-driven encryption |
| PHI in DB as plaintext | 🔴 | All 30+ PHI models store sensitive fields as plain `String`/`Json` |
| `@Encrypted()` decorator | 🔴 | Does not exist |
| Key rotation | 🔴 | Config var read but no rotation/re-key logic implemented |
| HSM/KMS integration | 🔴 | Master key in .env only — no AWS KMS, Vault, or HSM |

### 1.2 PHI Models in Plaintext (30+ models)

All health data stored as plaintext in PostgreSQL. `FieldEncryptionService.encryptRecord()` must be called explicitly on every write — it is NOT applied automatically via middleware, decorator, or Prisma hook.

**Highest-risk models:** HealthRecord (extractedText, structuredPayload), Prescription (diagnosisSummary), ClinicalNote (content JSON), ConsultationRecording (storageUrl), HealthInformationTransfer (dataPayload), AbhaProfile (full identity), all 28+ others.

---

## 2. Encryption in Transit

| Component | Status | Detail |
|-----------|--------|--------|
| HTTPS enforcement | 🔴 | No TLS in app layer — delegated to infrastructure |
| Helmet.js | ⚠️ | Installed, only `crossOriginResourcePolicy` configured — no HSTS, CSP, X-Frame-Options |
| CORS (HTTP) | ✅ | Configurable via `CORS_ORIGIN` env var |
| WebSocket CORS | 🔴 | `cors: { origin: '*' }` in notifications gateway |
| External API calls | ✅ | SMS, AI providers use HTTPS |

---

## 3. Audit Trail

| Component | Status | Detail |
|-----------|--------|--------|
| AuditLogService | ✅ | 80+ event types logged across all modules |
| AuditLog DB model | ✅ | Fields: actorUserId, patientUserId, action, resourceType, resourceId, metadata, immutableHash, ipAddress, userAgent |
| RLS append-only enforcement | ✅ | AuditLog INSERT only — SELECT/UPDATE/DELETE denied |
| `immutableHash` population | 🔴 | Field exists in schema but is NEVER populated — no integrity verification |
| `@AuditLog()` decorator | 🔴 | Does not exist — logging is manual per-service |
| EncryptionAuditService | 🔴 | In-memory only — lost on restart, not called from production flows |
| PII redaction in audit | 🔴 | Metadata can contain PHI with no sanitization |

### 3.1 Gap: PHI Reads Not Audited
The following operations access PHI silently (no audit event):
- Health record queries/searches
- Patient profile views
- Report generation/downloads
- Admin impersonation views
- Bulk analytics exports (contain PHI context)
- Family member data access

---

## 4. Data Classification

| Component | Status | Detail |
|-----------|--------|--------|
| PII Classification Middleware | ⚠️ | Detects via regex (Aadhaar, PAN, phone, email, ABHA) — adds masked fields alongside plaintext, does NOT strip originals |
| PII Classifier | ⚠️ | Regex-based, names not detected |
| Data classification tags | 🔴 | No `@Sensitive`, `@Confidential`, `@PHI` annotations |
| FieldEncryptionService.phiFields | ✅ | 22 PHI fields defined (phoneNumber, email, fullName, DOB, bloodGroup, etc.) |

---

## 5. Data Retention

| Component | Status | Detail |
|-----------|--------|--------|
| DataRetentionService | ⚠️ | Defined policies for auditLog (5yr), otpChallenge (7d), refreshToken (90d), deviceSession (365d), notification (365d), aiJob (90d) |
| PHI retention policies | 🔴 | No retention on HealthRecord, Prescription, ClinicalNote, or any PHI model — retained forever |
| Anonymization | 🔴 | Only `delete` action implemented — no `anonymize`/`de-identify` |
| Jobs service cleanup | ⚠️ | Runs every 5min, but uses hardcoded 90d audit log retention (inconsistent with DataRetentionService 5yr) |

---

## 6. Key Management

| Component | Status | Detail |
|-----------|--------|--------|
| Master key source | ✅ | `MASTER_ENCRYPTION_KEY` env var, 32-byte hex, validated at startup |
| Startup secrets check | ✅ | `assertSecrets()` exits process on missing/insecure keys |
| Key rotation | 🔴 | No rotation mechanism |
| HSM/external KMS | 🔴 | None |

---

## 7. PII Masking in Logs

| Component | Status | Detail |
|-----------|--------|--------|
| FieldEncryptionService.maskPII() | ✅ | Masks name, phone, email |
| PII Classifier masks | ✅ | Aadhaar, PAN, phone, email, ABHA |
| maskPHIInMetadata() | 🔴 | Referenced in validate-security.mjs but doesn't exist |
| Log sanitization middleware | 🔴 | No automated PII redaction in logging pipeline |

---

## 8. Fix Plan

### Priority 1 (Critical — Easy Fix)
| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 1a | Fix WebSocket CORS (`notifications.gateway.ts`) — replace `origin: '*'` with `CORS_ORIGIN` env var | 1 line | 🔴 High |
| 1b | Populate `AuditLog.immutableHash` with SHA-256 of event payload | 5 lines | 🔴 High |
| 1c | Create `maskPHIInMetadata()` in encryption-audit.service.ts | 20 lines | 🟡 Med |
| 1d | Add session inactivity timeout (check `lastSeenAt` > 24h) | 10 lines | 🟡 Med |

### Priority 2 (Critical — Significant Effort)
| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 2a | Add `FieldEncryptionService.encryptRecord()` calls to all PHI write paths (~30 service methods) | 2-3 days | 🔴 Critical |
| 2b | Add PHI data retention policies to DataRetentionService | 30 min | 🟡 Med |
| 2c | Add read audit events to health record queries | 1 day | 🟡 Med |

### Priority 3 (Architectural)
| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 3a | Create `@Encrypted()` decorator for declarative field encryption | 1 day | 🟡 Med |
| 3b | Integrate HSM/KMS for master key | 2-3 days | 🟢 Low (for MVP) |
| 3c | Fix JobsService hardcoded 90d audit retention to use config | 15 min | 🟡 Med |

---

## Scoring

| Dimension | Current | Max |
|-----------|---------|-----|
| Encryption at Rest (field-level) | 10 | 25 |
| Encryption in Transit | 10 | 15 |
| Audit Trail | 20 | 25 |
| Data Classification | 5 | 10 |
| Data Retention | 5 | 10 |
| Key Management | 10 | 10 |
| PII Masking | 5 | 5 |
| **Total** | **65** | **100** |

*Post-fix target.* Current pre-fix score: ~35/100
