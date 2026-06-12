# HIPAA Gap Analysis — WyshCare Platform

> **Date:** June 12, 2026  
> **Scope:** Backend services (`backend/src/modules/auth/`, `backend/src/modules/consent/`, `backend/src/modules/vault/`), Prisma schema at `backend/prisma/schema.prisma`  
> **Rating Scale:** ✅ Compliant | ⚠️ Partial | ❌ Gap

---

## 1. PHI Identification

The Prisma schema contains extensive PHI fields across the `User` model and related clinical models:

| Model | PHI Fields | Risk |
|---|---|---|
| `User` | fullName, phoneNumber, email, dateOfBirth, gender, bloodGroup, aadhaarLast4, abhaAddress, abhaNumberMasked, chronicConditions, allergiesSummary | HIGH |
| `HealthRecord` | extractedText, structuredPayload, encryptedDek, hash | HIGH |
| `Prescription` | diagnosisSummary, diagnosis, notes, instructions | HIGH |
| `Condition` | icdCode, displayName, bodySite, onsetDate | HIGH |
| `VitalsRecord` | bpSystolic, bpDiastolic, heartRate, temperature, spo2, weight, height | HIGH |
| `EmergencyProfile` | bloodGroup, emergencyNotes, physicianPhone | HIGH |
| `DoctorProfile` | registrationNumber, qualifications, bio | MODERATE |

**Rating: ⚠️ Partial** — PHI is identified and `FieldEncryptionService` (at `backend/src/common/encryption/field-encryption.service.ts`) defines a `phiFields` map, but the schema stores many PHI fields in plaintext at the database level (e.g., `fullName`, `phoneNumber`, `chronicConditions`, `allergiesSummary` are not encrypted at rest).

---

## 2. Administrative Safeguards (§164.308)

| Requirement | Status | Evidence / Gap |
|---|---|---|
| Risk Analysis | ⚠️ Partial | `encryption.service.ts` uses `MASTER_ENCRYPTION_KEY` with AES-256-GCM and PBKDF2 key derivation, but no formal risk analysis document or automated risk assessment module was found in the backend source. |
| Risk Management | ⚠️ Partial | `vault.service.ts` applies encryption to uploaded files (DEK + AES-256-GCM). However, no comprehensive risk management policy file was located. |
| Sanction Policy | ❌ Gap | No sanction policy enforcement or logging of policy violations found. |
| Information System Activity Review | ⚠️ Partial | `AuditLogService` (referenced in `auth.service.ts`, `consent/service.ts`, `vault.service.ts`) captures actions (OTP_REQUESTED, CONSENT_GRANTED, RECORD_UPLOADED) but lacks systematic review scheduling. |
| Workforce Security | ⚠️ Partial | `RolesGuard` enforces RBAC with roles (PATIENT, DOCTOR, ADMIN, etc.), but there is no termination/offboarding workflow. |
| Security Awareness & Training | ❌ Gap | No evidence of training material or attestation workflows. |

---

## 3. Physical Safeguards (§164.310)

| Requirement | Status | Evidence / Gap |
|---|---|---|
| Facility Access Controls | ⚠️ Partial | Infrastructure (`infra/`) uses Kubernetes/Docker, implying cloud deployment. No on-premise facility controls documented. |
| Workstation Security | ❌ Gap | No workstation use policies or device encryption requirements documented in the repo. |
| Device & Media Controls | ❌ Gap | No media disposal, re-use, or accountability procedures found. |

**Rating: ❌ Gap** — The repo does not contain any physical safeguard documentation or controls. These are typically covered at the infrastructure/operations level.

---

## 4. Technical Safeguards (§164.312)

### 4.1 Access Control (§164.312(a)(1))

| Requirement | Status | Evidence / Gap |
|---|---|---|
| Unique User Identification | ✅ Compliant | JWT-based auth with `userId` (UUID/CUID). `auth.service.ts` issues per-session tokens with `sessionId`. |
| Emergency Access Procedure | ⚠️ Partial | `EmergencyAccess` model exists with `EmergencyAccessReason` enum (`UNRESPONSIVE_PATIENT`, `ROAD_ACCIDENT`, etc.). `EmergencyProfile` model supports emergency mode. However, no time-limited break-glass procedure is automated. |
| Automatic Logoff | ❌ Gap | `DeviceSession` has `expiresAt` (30d default), and `RefreshToken` expires at 30d. No shorter inactivity timeout enforced. |
| Encryption & Decryption | ⚠️ Partial | See §164.312(a)(2)(iv) below. |

### 4.2 Audit Controls (§164.312(b))

| Requirement | Status | Evidence / Gap |
|---|---|---|
| Audit Logs | ⚠️ Partial | `AuditLog` model captures actorUserId, patientUserId, action, resourceType, resourceId, ipAddress, userAgent, metadata, immutableHash. Logged for auth, consent, and vault operations. However, not all modules log access (e.g., `Condition`, `VitalsRecord` reads are not audited). |

### 4.3 Integrity Controls (§164.312(c)(1))

| Requirement | Status | Evidence / Gap |
|---|---|---|
| Integrity Controls | ⚠️ Partial | `AuditLog.immutableHash` provides tamper evidence. `HealthRecord.hash` stores SHA-256 of uploaded files. `PrescriptionVerification.tamperHash` exists. However, database-level integrity (e.g., column-level checksums) is not implemented for all PHI columns. |

### 4.4 Person or Entity Authentication (§164.312(d))

| Requirement | Status | Evidence / Gap |
|---|---|---|
| Authentication | ✅ Compliant | OTP-based phone verification (`auth.service.ts`), JWT bearer tokens, refresh token rotation with reuse detection. |

### 4.5 Transmission Security (§164.312(e)(1))

| Requirement | Status | Evidence / Gap |
|---|---|---|
| Integrity Controls | ⚠️ Partial | HTTPS is implied by cookie `secure: true` when `NODE_ENV === 'production'`. No explicit TLS configuration verification in the repo code. |
| Encryption | ⚠️ Partial | `encryption.service.ts` uses AES-256-GCM. File uploads in `vault.service.ts` are encrypted at rest. In-transit encryption relies on the hosting infrastructure. |

**Rating: ⚠️ Partial** — Strong foundations (AES-256-GCM, JWT, audit logs, RBAC) but gaps in comprehensive access logging, auto-logoff, and formalized integrity controls.

---

## 5. Breach Notification (§164.400-414)

| Requirement | Status | Evidence / Gap |
|---|---|---|
| Breach Detection | ❌ Gap | No breach detection module found. `AuditLog` exists but no automated anomaly detection. |
| Notification Procedures | ❌ Gap | No notification workflow for affected individuals, HHS, or media. |
| Risk Assessment | ❌ Gap | No breach risk assessment workflow. |

**Rating: ❌ Gap** — No breach notification infrastructure exists in the codebase.

---

## 6. Patient Rights (§164.520-528)

| Requirement | Status | Evidence / Gap |
|---|---|---|
| Notice of Privacy Practices | ❌ Gap | No NPP document or acknowledgment workflow. |
| Access to PHI | ✅ Compliant | `vault.controller.ts` provides `GET /vault/records` and download endpoints. `consent.controller.ts` manages data sharing via `ConsentGrant`. |
| Amendment of PHI | ❌ Gap | No dedicated amendment workflow. PHI can be updated directly via Prisma but no formal request/review pipeline exists. |
| Accounting of Disclosures | ⚠️ Partial | `AuditLog` captures disclosures via consent grants and data sharing. No patient-facing disclosure report endpoint. |
| Restriction Requests | ⚠️ Partial | `ConsentGrant` supports `accessLevel` (FULL, LIMITED, EMERGENCY) and `scope` but no granular field-level restriction mechanism. |

**Rating: ⚠️ Partial** — Access and consent are well-covered. Amendment workflows and formal disclosure accounting are missing.

---

## 7. Summary & Remediation Roadmap

| Area | Rating | Priority | Key Remediation |
|---|---|---|---|
| PHI Identification | ⚠️ Partial | HIGH | Extend `FieldEncryptionService.phiFields` to cover all clinical models; implement DB-level encryption-at-rest for all PHI columns. |
| Administrative Safeguards | ⚠️ Partial | HIGH | Formalize risk analysis document; implement sanction policy enforcement; add termination workflows. |
| Physical Safeguards | ❌ Gap | MEDIUM | Document infrastructure security; implement device/media controls. |
| Access Control | ⚠️ Partial | HIGH | Implement auto-logoff (< 15 min inactivity); formalize emergency break-glass procedure. |
| Audit Controls | ⚠️ Partial | HIGH | Add read-access audit hooks to all clinical data endpoints. |
| Breach Notification | ❌ Gap | CRITICAL | Build breach detection, risk assessment, and notification pipeline. |
| Patient Rights | ⚠️ Partial | MEDIUM | Build amendment workflow and disclosure accounting report endpoint. |

### Immediate Actions (0–30 days)
1. Enable field-level encryption for all PHI columns in the Prisma schema using the existing `FieldEncryptionService`.
2. Add audit logging middleware/interceptor to capture read access on all clinical data endpoints.
3. Implement session inactivity timeout enforcement (15 min).

### Short-Term (30–90 days)
4. Build patient amendment request workflow.
5. Build accounting of disclosures API.
6. Formalize security awareness training documentation.

### Long-Term (90–180 days)
7. Implement automated breach detection with alerting.
8. Achieve full HIPAA compliance certification.
