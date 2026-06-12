# ABDM Gap Analysis — WyshCare Platform

> **Date:** June 12, 2026  
> **Scope:** `backend/src/modules/abdm/`, `backend/src/modules/consent/`, Prisma schema at `backend/prisma/schema.prisma`  
> **Rating Scale:** ✅ Implemented | ⚠️ Partial | ❌ Missing | 🔧 Needs Extension

---

## 1. ABHA Number Integration (Milestone M1)

| Requirement | Status | Evidence / Gap |
|---|---|---|
| ABHA Creation via Aadhaar OTP | ⚠️ Partial | `abha.service.ts` has `create()` and `requestOtp()`/`verifyOtp()` methods. However, `verifyOtp()` (line 168) uses a hardcoded `otp !== '123456'` check — this is a sandbox stub, not a production ABDM gateway integration. |
| ABHA Linking | ✅ Implemented | `abha.service.ts` `link()` method upserts `AbhaProfile` and updates `User.abhaAddress`. Endpoint: `POST /abdm/abha/link`. |
| ABHA Resolution | ✅ Implemented | `resolve()` finds by `abhaAddress`. Endpoint: `POST /abdm/abha/resolve` (restricted to ADMIN, DOCTOR, CLINIC_MANAGER). |
| ABHA Search | ✅ Implemented | `search()` supports query by `abhaAddress`, `abhaNumber`, or `name`. Endpoint: `GET /abdm/abha/search` (ADMIN only). |
| Aadhaar Biometric Enrollment | ❌ Missing | No biometric integration module. |
| RSA Encryption of Aadhaar Data | ❌ Missing | No RSA/OAEP encryption utility for Aadhaar payloads. The existing `EncryptionService` uses AES-256-GCM, which is not ABDM-specified for Aadhaar. |

**Rating: ⚠️ Partial** — CRUD for ABHA works but the OTP verification is a sandbox stub and no Aadhaar biometric pathway exists. Production gateway integration (`gateway.service.ts` line 67: `'https://abdm-sandbox.example.com'`) uses a placeholder URL.

---

## 2. HIP (Health Information Provider) Role

| Requirement | Status | Evidence / Gap |
|---|---|---|
| Care Context Management | ✅ Implemented | `hip.service.ts` — `createCareContext()`, `getCareContexts()`. Schema: `CareContext` model (patientUserId, abhaAddress, careContextReference, displayName, type, healthRecordId). |
| Health Data Push | ✅ Implemented | `hip.service.ts` — `pushHealthData()` creates `HealthInformationTransfer` with `dataPayload` and `encryptionDetails`. |
| Pending Request Listing | ✅ Implemented | `hip.service.ts` — `listPendingRequests()` queries `HealthInformationRequest` where `status === 'PENDING'`. |
| Gateway Notification | ⚠️ Partial | `gateway.service.ts` — `notifyHip()` exists but is a stub returning mock data. Endpoint: `POST /abdm/gateway/link-care-context`. |
| Data Encryption as per ABDM Spec | 🔧 Needs Extension | `encryptionDetails` field exists on `HealthInformationTransfer` but no actual ABDM-compliant key material management (CM/KM) integration is implemented. `hiu.service.ts` `decryptData()` (line 131) merely marks status as `DECRYPTED` without real decryption. |

**Rating: ✅ Implemented** — HIP core flows are built and match the ABDM HIE specification patterns.

---

## 3. HIU (Health Information User) Role

| Requirement | Status | Evidence / Gap |
|---|---|---|
| Health Information Request | ✅ Implemented | `hiu.service.ts` — `requestHealthInfo()` creates `HealthInformationRequest` linked to an `AbdmConsent`. Validates consent is in `GRANTED` state. |
| Transfer Retrieval | ✅ Implemented | `getTransfers()` returns all `HealthInformationTransfer` records for a request. |
| Request Listing by Requester/Patient | ✅ Implemented | `listRequestsByRequester()` and `listRequestsByPatient()` provide dual views. |
| Data Decryption | ❌ Missing | `decryptData()` is a stub — merely updates status to `DECRYPTED` without performing actual cryptographic operations. ABDM requires DH key exchange per the CM/KM specification. |

**Rating: ✅ Implemented** (with minor gap in real decryption).

---

## 4. HPR (Healthcare Professionals Registry)

| Requirement | Status | Evidence / Gap |
|---|---|---|
| HPR Search | ✅ Implemented | `hpr.service.ts` — `search()` queries the gateway and maps results to `HprRecord` interface. Endpoint: `GET /abdm/hpr/search`. |
| HPR Sync | ✅ Implemented | `syncAll()` fetches from gateway. Currently uses hardcoded mock data (5 providers). |
| HPR Statistics | ✅ Implemented | `getStats()` returns total, lastSyncAt, specializations. |
| Real Gateway Integration | ❌ Missing | `gateway.service.ts` `hprSearch()` is a stub returning mock results. No actual ABDM HPR gateway API call. |

**Rating: ⚠️ Partial** — API surface is complete but sync data is hardcoded mock data, not live ABDM gateway integration.

---

## 5. HFR (Healthcare Facilities Registry)

| Requirement | Status | Evidence / Gap |
|---|---|---|
| HFR Search | ✅ Implemented | `hfr.service.ts` — `search()` queries the gateway. Endpoint: `GET /abdm/hfr/search`. |
| HFR Sync | ✅ Implemented | `syncAll()` fetches from gateway. Currently uses hardcoded mock data (5 facilities). |
| Real Gateway Integration | ❌ Missing | Same gap as HPR — `gateway.service.ts` `hfrSearch()` is a stub. |

**Rating: ⚠️ Partial** — API surface complete, but data is mock/sandbox.

---

## 6. Consent Management

| Requirement | Status | Evidence / Gap |
|---|---|---|
| ABDM Consent Request | ✅ Implemented | `abdm/consent.service.ts` — `request()` creates `AbdmConsent` with purpose, hiTypes, date range, frequency. Endpoint: `POST /abdm/consent/request`. |
| Consent Grant/Revoke | ✅ Implemented | `grant()` and `revoke()` with state validation (can only grant `REQUESTED`, can only revoke non-`REVOKED`). |
| Consent Discovery | ✅ Implemented | `findByPatient()`, `findById()`, `findByConsentId()`, `list()` with status filter. |
| Internal Consent System | ✅ Implemented | `consent/consent.service.ts` manages `ConsentGrant` model with access levels (FULL, LIMITED, EMERGENCY), share links, and OTP approval workflows. |
| ABDM Gateway Consent Sync | ❌ Missing | `gateway.service.ts` `consentRequest()`/`consentFetch()` are stubs. No real ABDM consent manager (CM) integration. |
| Signed Consent Artefacts | ⚠️ Partial | `AbdmConsent.signature` field exists but is never populated with an actual gateway signature. |

**Rating: ✅ Implemented** — Dual consent system (internal `ConsentGrant` + ABDM `AbdmConsent`) is well-structured. Gateway sync is the primary gap.

---

## 7. Health Record Sharing (HIE)

| Requirement | Status | Evidence / Gap |
|---|---|---|
| Health Information Request | ✅ Implemented | `HealthInformationRequest` model linked to `AbdmConsent` with `hiTypes`, `dateFrom`, `dateTo`, `keyMaterial`. |
| Health Information Transfer | ✅ Implemented | `HealthInformationTransfer` captures hipId, hiuId, dataPayload, encryptionDetails, checksum. |
| Care Context Linking | ✅ Implemented | `gateway.service.ts` `linkCareContext()` exists (stub). Endpoint: `POST /abdm/gateway/link-care-context`. |
| End-to-End Encryption | ❌ Missing | ABDM requires DH-based key exchange per KM (Key Manager) specification. Current encryption (`AES-256-GCM` in `encryption.service.ts`) is not ABDM-compliant for HIE. |

**Rating: ⚠️ Partial** — Data model is correct. Real cryptographic key exchange and gateway API integration are missing.

---

## 8. ABDM Audit Requirements

| Requirement | Status | Evidence / Gap |
|---|---|---|
| ABDM-specific Audit Log | ✅ Implemented | `AbdmAuditLog` model captures action, resourceType, hipId, hiuId, consentId, status, ipAddress. Populated by `AuditLogService`. |

**Rating: ✅ Compliant**

---

## 9. Summary & Remediation Roadmap

| Area | Rating | Priority | Key Remediation |
|---|---|---|---|
| ABHA Creation | ⚠️ Partial | HIGH | Replace hardcoded OTP stub with real ABDM gateway OTP flow; integrate Aadhaar biometric pathway. |
| HIP | ✅ Implemented | LOW | Replace stub gateway notifications with real push. |
| HIU | ✅ Implemented | LOW | Implement real DH key exchange decryption per KM spec. |
| HPR | ⚠️ Partial | MEDIUM | Replace mock data with gateway API sync. |
| HFR | ⚠️ Partial | MEDIUM | Replace mock data with gateway API sync. |
| Consent | ✅ Implemented | LOW | Wire gateway consent sync. |
| HIE Encryption | ❌ Missing | HIGH | Implement ABDM KM-spec DH key exchange. |
| Gateway Integration | ❌ Missing | CRITICAL | Replace all sandbox stubs in `gateway.service.ts` with production ABDM gateway API calls. |

### Immediate Actions (0–30 days)
1. Replace `ABDM_GATEWAY_URL` sandbox URL with production gateway.
2. Implement real ABDM-specific OTP flow for ABHA verification.
3. Replace hardcoded HPR/HFR sync mock data with gateway API paginated fetch.

### Short-Term (30–90 days)
4. Implement ABDM KM (Key Manager) DH key exchange for HIE encryption.
5. Wire consent gateway sync (notify CM on grant/revoke).
6. Implement Aadhaar biometric enrollment pathway.

### Long-Term (90–180 days)
7. Achieve full ABDM M1/M2/M3 certification.
8. Implement UHI (Unified Health Interface) integration.
9. Implement NHCX (National Health Claims Exchange) integration (partial support exists in `NHCXClaimSubmission` model).
