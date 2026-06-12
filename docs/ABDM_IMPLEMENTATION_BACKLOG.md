# ABDM Implementation Backlog

> Generated: June 4, 2026
> Prioritized implementation tasks for WyshCare ABDM integration

---

## Priority Legend

| Priority | Label | Meaning | Target |
|---|---|---|---|
| **P0** | Mandatory for ABDM certification | Blocking AND certification | Sprint 1-2 |
| **P1** | Mandatory for production launch | Required before go-live | Sprint 3-4 |
| **P2** | National scale enhancements | Phase 2 post-launch | Sprint 5-8 |
| **P3** | Future ecosystem features | Long-term roadmap | Sprint 9+ |

---

## P0 — Mandatory for ABDM Certification

### P0.1 FHIR R4 Mapper Service
**Why needed**: All ABDM health data exchange requires FHIR R4 format. Without this, no HIP/HIU data flow is possible.
**Affected modules**: `abdm/fhir/` (new), `vault`, `telemedicine`, `pharmacy`, `diagnostics`
**Affected DB tables**: `FHIRResource` (new)
**New APIs**: Internal service — no new external endpoints
**Risk level**: High — FHIR schema is complex (8 HI types × multiple resources each)
**Estimated effort**: 3-4 weeks

**Tasks**:
- [ ] Implement `FhirMapperService` base with HAPI FHIR-like interface
- [ ] FHIR `Patient` resource mapper (from `User` model)
- [ ] FHIR `Practitioner` resource mapper (from `DoctorProfile`)
- [ ] FHIR `Organization` resource mapper (from `Clinic`)
- [ ] FHIR `Encounter` resource mapper (from `Appointment`)
- [ ] FHIR `MedicationRequest` resource mapper (from `Prescription` + `Medication`)
- [ ] FHIR `DiagnosticReport` resource mapper (from `DiagnosticReport`)
- [ ] FHIR `DocumentReference` resource mapper (from `HealthRecord`)
- [ ] FHIR `Observation` resource mapper (from vitals, lab results)
- [ ] FHIR `Condition` resource mapper (from diagnosis)
- [ ] FHIR `Bundle` builder for data transfer
- [ ] `fhir-validator` service — validate against ABDM FHIR profiles
- [ ] `FHIRResource` DB model for caching FHIR representations
- [ ] Unit tests for each mapper

---

### P0.2 ABDM Gateway Client
**Why needed**: All M2/M3 communication routes through ABDM HIE-CM gateway. Without this, no linking, consent, or data flow.
**Affected modules**: `abdm/gateway/` (new), `config/env.ts`
**Affected DB tables**: None
**New APIs**: Internal service — no new external endpoints
**Risk level**: High — gateway compliance requirements strict
**Estimated effort**: 2 weeks

**Tasks**:
- [ ] `GatewayAuthService` — OAuth2 client credentials flow with Keycloak
- [ ] `GatewayClientService` — HTTP client with REQUEST-ID, TIMESTAMP, X-CM-ID headers
- [ ] Token refresh + retry logic with circuit breaker
- [ ] Bridge URL registration (`POST /v3/bridge/update`)
- [ ] Facility registration (`POST /v3/facility/register`)
- [ ] Software linkage (`POST /v3/facility/software-linkage`)
- [ ] Find bridge/services by ID
- [ ] Environment configuration (SBX vs PROD)
- [ ] Mock gateway for local development (port ABDM-wrapper concepts)
- [ ] E2E test against ABDM sandbox

---

### P0.3 RSA Encryption Service
**Why needed**: Required for encrypting Aadhaar number before transmission to ABDM during ABHA creation.
**Affected modules**: `abdm/encryption/` (new)
**Affected DB tables**: None
**New APIs**: Internal service
**Risk level**: Medium — well-documented algorithm
**Estimated effort**: 1 week

**Tasks**:
- [ ] `RsaEncryptionService.generateKeyPair()` — 2048-bit RSA key pair
- [ ] `RsaEncryptionService.encrypt(plaintext, publicKeyPem)` — RSA/ECB/OAEPWithSHA-1AndMGF1Padding
- [ ] `RsaEncryptionService.getPublicCertificate()` — fetch ABDM public cert
- [ ] Key storage (env/file/HSM for production)
- [ ] Unit tests with known test vectors

---

### P0.4 ABHA Creation Flow — Aadhaar OTP
**Why needed**: Primary method for ABHA creation. Required for M1 certification.
**Affected modules**: `abdm/abha/` (new), `auth` (extend)
**Affected DB tables**: `ABHAAccount` (new)
**New APIs**:
- `POST /api/v1/abdm/abha/create/aadhaar-otp/init` — Init Aadhaar OTP
- `POST /api/v1/abdm/abha/create/aadhaar-otp/verify` — Verify OTP + create ABHA
- `POST /api/v1/abdm/abha/create/mobile-verify` — Verify mobile
- `POST /api/v1/abdm/abha/create/address` — Create ABHA address
**Risk level**: High — Aadhaar data handling compliance
**Estimated effort**: 3-4 weeks

**Tasks**:
- [ ] `AbhaService.createViaAadhaarOtp()` — full flow orchestration
- [ ] Integrate with ABDM enrollment API endpoints (1.1-1.15 from API catalog)
- [ ] RSA encrypt Aadhaar number before sending
- [ ] Mobile OTP verification integration
- [ ] Suggested username flow
- [ ] ABHA address creation (with/without password)
- [ ] `ABHAAccount` model to store ABHA linkage
- [ ] Rate limit awareness (max 100 ABHA creations per sandbox client)
- [ ] Error handling for ABDM error codes (ABDM-1227, etc.)
- [ ] Audit logging for all ABHA creation steps

---

### P0.5 HFR Facility Registration
**Why needed**: Required for HIP certification. WyshCare clinics must be registered in HFR.
**Affected modules**: `abdm/registries/hfr-client.service.ts` (new), `doctors`, `admin`
**Affected DB tables**: `Clinic` (extend with `hfrId` field)
**New APIs**: Internal sync service
**Risk level**: Medium
**Estimated effort**: 2 weeks

**Tasks**:
- [ ] `HfrClientService.searchFacility()` — HFR search
- [ ] `HfrClientService.registerFacility()` — Create HFR facility
- [ ] `HfrClientService.getFacilityDetails()` — Fetch HFR data
- [ ] Sync existing WyshCare clinics to HFR
- [ ] `Clinic.hfrId` field addition
- [ ] Admin UI for facility registration status
- [ ] Automated sync on clinic creation/edit

---

## P1 — Mandatory for Production Launch

### P1.1 Consent Gateway Integration
**Why needed**: Link WyshCare consent model to ABDM M3 consent manager. Enables HIP/HIU consent-based data flow.
**Affected modules**: `abdm/consent/` (new), `consent` (extend), `interoperability` (extend)
**Affected DB tables**: `ConsentArtefact` (new), `ConsentGrant` (extend with `abdmArtefactId`)
**New APIs**:
- `POST /api/v1/abdm/consent/init` — Initiate ABDM consent request
- `POST /api/v1/abdm/consent/status` — Check consent status
- `POST /abdm/callbacks/v3/consent-requests/hip/notify` — Gateway callback
**Risk level**: High — consent compliance is critical
**Estimated effort**: 3 weeks

**Tasks**:
- [ ] `ConsentMapperService` — map WyshCare consent fields to ABDM purpose/HI types/access modes
- [ ] `ConsentGatewayService.initiateConsentRequest()` — POST to gateway
- [ ] `ConsentGatewayService.checkConsentStatus()` — Poll gateway
- [ ] `ConsentGatewayService.fetchConsentArtefact()` — Retrieve + store artefact
- [ ] `ConsentGatewayService.handleConsentNotify()` — Callback handler
- [ ] `ConsentArtefact` model for artefact storage + JWS signature
- [ ] Extend `ConsentService.create()` — optional gateway sync
- [ ] Extend `ConsentService.revoke()` — optional gateway revoke
- [ ] Extend frontend consent UI — show ABDM artefact status
- [ ] Audit logging for all consent gateway operations

---

### P1.2 ECDH Encryption Service
**Why needed**: Required for encrypting health data during M2/M3 data exchange.
**Affected modules**: `abdm/encryption/` (new)
**Affected DB tables**: `ECDHKeyMaterial` (new)
**New APIs**: Internal service
**Risk level**: Medium — encryption compliance
**Estimated effort**: 2 weeks

**Tasks**:
- [ ] `EcdhEncryptionService.generateKeyPair()` — Curve25519 key pair
- [ ] `EcdhEncryptionService.computeSharedSecret(privateKey, publicKey)` — ECDH
- [ ] `EcdhEncryptionService.deriveKey(sharedSecret)` — HKDF expansion
- [ ] `AesEncryptionService.encrypt(plaintext, key)` — AES-256-GCM
- [ ] `AesEncryptionService.decrypt(ciphertext, key, iv)` — AES-256-GCM
- [ ] Key material storage in `ECDHKeyMaterial` table
- [ ] Key expiry and rotation logic
- [ ] Unit tests with ABDM test vectors

---

### P1.3 Care Context Model + Linking
**Why needed**: Patient health records must be organized into care contexts for ABDM linking.
**Affected modules**: `abdm/data-exchange/` (new), `vault` (extend)
**Affected DB tables**: `CareContext` (new)
**New APIs**:
- `POST /api/v1/abdm/link/carecontext` — Link care context
- `POST /api/v1/abdm/link/init` — User-initiated linking
- `POST /abdm/callbacks/v3/patient/care-context/discover` — Patient discovery callback
**Risk level**: High — core M2 requirement
**Estimated effort**: 2-3 weeks

**Tasks**:
- [ ] `CareContext` model with referenceNumber, displayName, hiType
- [ ] Auto-create care contexts on record upload (Prescription, DiagnosticReport, etc.)
- [ ] `CareContextService.linkCareContexts()` — HIP-initiated linking via token
- [ ] `CareContextService.initPatientDiscovery()` — User-initiated linking
- [ ] Patient discovery callback handler
- [ ] Link confirm callback handler
- [ ] SMS notify on successful linking
- [ ] Frontend UI — show care contexts on profile

---

### P1.4 HPR Professional Registration
**Why needed**: Doctors must have HPRID for ABDM-compliant practice.
**Affected modules**: `abdm/registries/hpr-client.service.ts` (new), `doctors` (extend)
**Affected DB tables**: `DoctorProfile` (extend with `hprId`, `hprStatus`)
**New APIs**: Internal sync service
**Risk level**: Medium
**Estimated effort**: 2 weeks

**Tasks**:
- [ ] `HprClientService.registerProfessional(doctorId)` — Aadhaar OTP → HPRID creation
- [ ] `HprClientService.syncProfessional(doctorId)` — Update HPR details
- [ ] `HprClientService.searchProfessional(query)` — HPR search
- [ ] `HprClientService.getProfessionalDetails(hprId)` — Fetch HPR profile
- [ ] `DoctorProfile.hprId` + `hprStatus` field addition
- [ ] Sync existing doctors to HPR (batch job)
- [ ] Automated sync on doctor onboarding
- [ ] UI — show HPR status on doctor profile

---

### P1.5 ABHA Login Methods
**Why needed**: Patients should log in using ABHA credentials (password, OTP) in addition to phone OTP.
**Affected modules**: `abdm/abha/abha-auth.service.ts` (new), `auth` (extend), `frontend/login-page.tsx`
**Affected DB tables**: None (uses `ABHAAccount`)
**New APIs**:
- `POST /api/v1/abdm/auth/login/abha-password` — Login with ABHA address + password
- `POST /api/v1/abdm/auth/login/abha-otp` — Login with ABHA OTP
- `POST /api/v1/abdm/auth/login/aadhaar-otp` — Login with Aadhaar OTP
**Risk level**: Medium
**Estimated effort**: 2 weeks

**Tasks**:
- [ ] `AbhaAuthService.loginViaAbhaPassword()` — ABHA address + password auth
- [ ] `AbhaAuthService.loginViaAbhaOtp()` — ABHA OTP flow
- [ ] `AbhaAuthService.loginViaAadhaarOtp()` — Aadhaar OTP flow
- [ ] Extend `auth.controller.ts` — add ABHA login routes
- [ ] Extend frontend login form — add "Login with ABHA" option
- [ ] Token exchange — convert ABHA token to WyshCare JWT session
- [ ] Error handling for ABHA account inactive/deleted

---

### P1.6 Scan & Share — Profile Sharing
**Why needed**: Patients share their KYC profile with facilities by scanning QR. M2 requirement.
**Affected modules**: `abdm/scan-share/` (new), `identity` (extend)
**Affected DB tables**: None
**New APIs**:
- `POST /api/v1/abdm/scan-share/profile` — Share profile via QR
- `POST /abdm/callbacks/v3/on-share` — Gateway callback
- `GET /api/v1/abdm/scan-share/qr` — Generate share QR
**Risk level**: Medium
**Estimated effort**: 2 weeks

**Tasks**:
- [ ] `ScanShareService.generateShareQr(hipId)` — QR with hipId + counterId
- [ ] `ScanShareService.shareProfile(abhaAddress, hipId)` — Profile share via gateway
- [ ] `ScanShareService.shareRecords(recordIds, hipId)` — Record share via gateway
- [ ] `ScanShareService.handleOnShareCallback(payload)` — Gateway callback
- [ ] Frontend QR generator / scanner
- [ ] Gateway share/on-share API integration

---

## P2 — National Scale Enhancements

### P2.1 UHI Protocol Implementation
**Why needed**: Open network participation for doctor discovery and booking.
**Affected modules**: `abdm/uhi/` (new), `discovery` (extend), `telemedicine` (extend)
**Affected DB tables**: `UHIParticipant` (new)
**New APIs**:
- `POST /api/v1/uhi/search` → `POST /on_search` — Beckn search handler
- `POST /api/v1/uhi/confirm` → `POST /on_confirm` — Beckn confirm handler
- `POST /api/v1/uhi/cancel` → `POST /on_cancel` — Beckn cancel handler
**Risk level**: High — new protocol
**Estimated effort**: 4 weeks

**Tasks**:
- [ ] `UhiGatewayService.registerParticipant()` — HSPA registration
- [ ] `UhiMessageService` — Beckn message builder (context, intent, catalog, order)
- [ ] `UhiSigningService` — Ed25519 key generation, signing, verification
- [ ] `POST /search` handler — map to WyshCare `DiscoveryService`
- [ ] `POST /on_search` handler — return Beckn catalog
- [ ] `POST /select` handler — availability check
- [ ] `POST /init` handler — return quote
- [ ] `POST /confirm` handler — map to `TelemedicineService.createAppointment()`
- [ ] `POST /status` handler — appointment status
- [ ] `POST /cancel` handler — appointment cancellation
- [ ] `UHIParticipant` model for key storage
- [ ] E2E test with UHI sandbox gateway

---

### P2.2 Subscription Management
**Why needed**: LINK + DATA subscriptions enable automatic notifications when new data is available.
**Affected modules**: `abdm/consent/subscription.service.ts` (new), `notifications` (extend)
**Affected DB tables**: None (state tracked via gateway)
**New APIs**:
- `POST /api/v1/abdm/subscription/init` — Init subscription
- `POST /api/v1/abdm/subscription/approve` — Approve
- `POST /api/v1/abdm/subscription/deny` — Deny
- `POST /abdm/callbacks/v3/subscription-requests/v3/notify` — Gateway notify
**Risk level**: Medium
**Estimated effort**: 2 weeks

**Tasks**:
- [ ] LINK subscription — notify HIU when patient links new care contexts
- [ ] DATA subscription — notify HIU when new health data is uploaded
- [ ] Subscription lifecycle (init → approve → active)
- [ ] Gateway callback handler for subscription notify
- [ ] Integration with `NotificationService` for push events
- [ ] Frontend subscription management UI

---

### P2.3 Scan & Pay
**Why needed**: Patients pay facility bills via PHR app by scanning QR.
**Affected modules**: `abdm/scan-share/scan-pay.service.ts` (new)
**Affected DB tables**: None
**New APIs**:
- `POST /api/v1/abdm/scan-pay/open-order` — Open bill request
- `POST /api/v1/abdm/scan-pay/order-status` — Check payment status
**Risk level**: Medium
**Estimated effort**: 2 weeks

**Tasks**:
- [ ] `ScanPayService.initiateOpenOrder(hipId)` — Open order via gateway
- [ ] Handle on-share-open-order callback
- [ ] Patient selection UI (which services to pay)
- [ ] Patient share-notify flow
- [ ] Order status polling
- [ ] Integration with WyshCare/Razorpay for payment completion

---

### P2.4 Multi-Language UI
**Why needed**: ABDM requires accessibility in Indian languages.
**Affected modules**: Frontend (all pages)
**Affected DB tables**: None
**New APIs**: None
**Risk level**: Low
**Estimated effort**: 3 weeks

**Tasks**:
- [ ] i18n framework setup (next-intl or similar)
- [ ] Hindi translation of all UI strings
- [ ] Telugu translation (as per WyshCare's Telangana focus)
- [ ] Language switcher UI
- [ ] RTL support if needed

---

### P2.5 Running Token Status
**Why needed**: Patients check queue status at facilities via PHR app.
**Affected modules**: `abdm/scan-share/running-token.service.ts` (new)
**Affected DB tables**: None
**New APIs**:
- `POST /api/v1/abdm/running-token/status` — Request token status
- `POST /abdm/callbacks/v3/hip/patient/running-token/status` — Gateway callback
**Risk level**: Low
**Estimated effort**: 1 week

**Tasks**:
- [ ] `RunningTokenService.requestStatus(hipId, counterId)` — Gateway request
- [ ] `RunningTokenService.handleOnStatus(payload)` — Response handler
- [ ] Frontend UI — token status display

---

## P3 — Future Ecosystem Features

### P3.1 Face Auth Login
**Why needed**: Biometric login for enhanced UX and accessibility.
**Affected modules**: `abdm/abha/` (extend), frontend auth
**Affected DB tables**: None
**New APIs**:
- `POST /api/v1/abdm/auth/login/face-auth` — Face auth init + verify
**Risk level**: Medium
**Estimated effort**: 2 weeks

**Tasks**:
- [ ] Face auth QR generation (face-auth URL with txnId)
- [ ] Face auth capture PID polling
- [ ] Face auth login verify (manual ABHA app scan)
- [ ] Deep link integration for mobile ABHA app
- [ ] Frontend face auth UI

### P3.2 ABHA Card Generation
**Why needed**: Printable/PDF ABHA card for patients.
**Affected modules**: `abdm/abha/` (extend)
**Affected DB tables**: None
**New APIs**: `GET /api/v1/abdm/abha/card`
**Risk level**: Low
**Estimated effort**: 1 week

**Tasks**:
- [ ] ABHA card template (name, ABHA number, DOB, photo, QR)
- [ ] PDF generation
- [ ] Frontend download/view

### P3.3 NHCX Claims Integration
**Why needed**: Health insurance claim submission via NHCX.
**Affected modules**: `abdm/nhcx/` (new), `payments` (extend)
**Affected DB tables**: `InsuranceClaim`, `ClaimDocument` (new)
**New APIs**: `POST /api/v1/nhcx/claim/submit`, `GET /api/v1/nhcx/claim/:id/status`
**Risk level**: High — new domain
**Estimated effort**: 4-6 weeks

**Tasks**:
- [ ] NHCX participant registration
- [ ] Insurance claim model
- [ ] Claim submission API integration
- [ ] Benefits query API
- [ ] Document upload for claims (reuse Vault storage)
- [ ] Claim status tracking
- [ ] EOB (Explanation of Benefits) processing

### P3.4 UHI Catalog Management
**Why needed**: Full provider catalog sync with UHI network.
**Affected modules**: `abdm/uhi/` (extend), `discovery` (extend)
**Affected DB tables**: None
**New APIs**: `POST /api/v1/uhi/catalog/sync`
**Risk level**: Medium
**Estimated effort**: 2 weeks

**Tasks**:
- [ ] Full catalog sync from WyshCare to UHI network
- [ ] Provider availability update
- [ ] Fee/rating sync
- [ ] Catalog refresh scheduling

### P3.5 AI-Powered ABDM Data Analysis
**Why needed**: Population health insights from ABDM data.
**Affected modules**: `ai` (extend), `abdm/data-exchange` (extend)
**Affected DB tables**: None
**New APIs**: `POST /api/v1/ai/abdm/population-insights`
**Risk level**: Medium
**Estimated effort**: 3 weeks

**Tasks**:
- [ ] Aggregate anonymized ABDM data
- [ ] AI-powered trend analysis (disease prevalence, treatment outcomes)
- [ ] Reporting dashboard
- [ ] Privacy-preserving aggregation

---

## Implementation Summary

| Priority | Count | Total Effort | Sprint Allocation |
|---|---|---|---|
| **P0** | 5 items | 10-13 weeks | Sprint 1-4 |
| **P1** | 6 items | 13-15 weeks | Sprint 3-6 |
| **P2** | 5 items | 12 weeks | Sprint 5-8 |
| **P3** | 5 items | 12-14 weeks | Sprint 9+ |
| **Total** | **21 items** | **47-54 weeks** | **Parallelizable** |

### Parallelization Strategy
- **Track A (Gateway)**: P0.2, P1.1, P2.2 — Gateway + consent
- **Track B (ABHA)**: P0.3, P0.4, P1.5, P3.1, P3.2 — ABHA lifecycle
- **Track C (Data)**: P0.1, P1.2, P1.3, P2.5 — FHIR + encryption + care contexts
- **Track D (Registries)**: P0.5, P1.4 — HPR + HFR
- **Track E (Protocols)**: P2.1, P2.3, P3.4 — UHI + Scan & Pay
- **Track F (NHCX)**: P3.3 — Claims (starts later)

### Optimistic Timeline with 3 Teams
- **Month 1-2**: P0 items (all tracks)
- **Month 2-3**: P1 items (Track A, B, C)
- **Month 3-4**: P1 + P2 items (Track D, E)
- **Month 4-6**: P2 + P3 items
- **Month 6**: ABDM certification ready
