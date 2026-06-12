# WyshCare — ABDM Integration Architecture

> Generated: June 4, 2026
> Design principle: ABDM as a layer ON TOP of WyshCare. No existing consumer flows modified.

---

## 1. Architecture Principles

1. **No redesign of WyshCare** — Existing patient flows (OTP auth, dashboard, records, discovery, appointments, telemedicine, payments, family, consent) continue working identically.
2. **ABDM as adapter layer** — All ABDM logic is isolated in a new `abdm/` module with adapters, services, and gateway clients.
3. **Backward compatibility** — WyshCare APIs remain unchanged. ABDM integration adds new endpoints and extends existing ones behind feature flags.
4. **Incremental adoption** — Deploy ABHA integration first, then consent gateway, then data exchange, then UHI/NHCX.
5. **FHIR at the boundary** — Health data is stored in WyshCare's native schema. FHIR R4 conversion happens only at the ABDM gateway boundary.

---

## 2. Architecture Diagram (Conceptual)

```
┌─────────────────────────────────────────────────────────────────┐
│                    WYSHCARE CONSUMER APPS                      │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────────────┐  │
│  │ Patient │  │ Doctor   │  │ Family  │  │ Admin            │  │
│  │ (Web)   │  │ (Web)    │  │ (Web)   │  │ (Web)            │  │
│  └────┬────┘  └────┬─────┘  └────┬────┘  └────────┬─────────┘  │
└───────┼────────────┼─────────────┼──────────────────┼───────────┘
        │            │             │                  │
┌───────┼────────────┼─────────────┼──────────────────┼───────────┐
│       ▼            ▼             ▼                  ▼           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              WYSHCARE API GATEWAY (unchanged)            │   │
│  │  /api/v1/*   NestJS + JwtAuthGuard + RolesGuard          │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐   │
│  │              EXISTING WYSHCARE MODULES                    │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │   │
│  │  │Auth  │ │Ident │ │Vault │ │Consnt│ │AI    │ │Tlmed │  │   │
│  │  ├──────┤ ├──────┤ ├──────┤ ├──────┤ ├──────┤ ├──────┤  │   │
│  │  │DrDisc│ │Pharm │ │Diag  │ │Fam   │ │Pay   │ │Admin │  │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘  │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐   │
│  │              ABDM ADAPTER LAYER (NEW)                     │   │
│  │                                                           │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │          ABDM Gateway Client                     │    │   │
│  │  │  - OAuth2 token exchange (Keycloak)              │    │   │
│  │  │  - Request signing + headers (REQUEST-ID, etc.)  │    │   │
│  │  │  - Retry + circuit breaker                       │    │   │
│  │  └──────────────────┬───────────────────────────────┘    │   │
│  │                     │                                     │   │
│  │  ┌──────────────────▼───────────────────────────────┐    │   │
│  │  │          ABDM Service Modules                    │    │   │
│  │  │  ┌─────────┐ ┌──────────┐ ┌───────────┐         │    │   │
│  │  │  │ ABHA    │ │ Consent  │ │ Data      │         │    │   │
│  │  │  │ Service │ │ Gateway  │ │ Exchange  │         │    │   │
│  │  │  ├─────────┤ ├──────────┤ ├───────────┤         │    │   │
│  │  │  │ FHIR    │ │ HPR/HFR  │ │ Scan &    │         │    │   │
│  │  │  │ Mapper  │ │ Client   │ │ Share     │         │    │   │
│  │  │  └─────────┘ └──────────┘ └───────────┘         │    │   │
│  │  └──────────────────┬───────────────────────────────┘    │   │
│  │                     │                                     │   │
│  │  ┌──────────────────▼───────────────────────────────┐    │   │
│  │  │          ABDM Callback Controllers                │    │   │
│  │  │  - Patient discovery callback                    │    │   │
│  │  │  - Care context link callback                    │    │   │
│  │  │  - Consent notify callback                       │    │   │
│  │  │  - Health information request callback            │    │   │
│  │  │  - Scan & share callbacks                        │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐   │
│  │              SHARED ENCRYPTION LAYER                      │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐   │   │
│  │  │ RSA/OAEP    │  │ ECDH         │  │ AES-256-GCM   │   │   │
│  │  │ Encrypt     │  │ Curve25519   │  │ Encrypt       │   │   │
│  │  └─────────────┘  └──────────────┘  └───────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   ABDM GATEWAY  │
                    │  (HIE-CM)       │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
         ┌─────────┐   ┌─────────┐   ┌─────────┐
         │  HPR    │   │  HFR    │   │  Other  │
         │  Server │   │  Server │   │  ABDM   │
         └─────────┘   └─────────┘   │  Nodes  │
                                     └─────────┘
```

---

## 3. Module Structure

### 3.1 New Files — No Existing Files Modified

```
backend/src/
└── modules/
    └── abdm/
        ├── abdm.module.ts              # Root module
        ├── abdm.controller.ts           # REST API endpoints
        ├── abdm.service.ts             # Orchestration service
        │
        ├── gateway/
        │   ├── gateway-client.service.ts    # HTTP client to ABDM HIE-CM
        │   ├── gateway-auth.service.ts      # OAuth2 Keycloak token mgmt
        │   └── gateway-callback.controller.ts  # Callback endpoints for ABDM
        │
        ├── abha/
        │   ├── abha.service.ts          # ABHA creation/verification
        │   ├── abha-auth.service.ts     # ABHA login methods
        │   └── abha-profile.service.ts  # ABHA profile management
        │
        ├── consent/
        │   ├── consent-gateway.service.ts  # ABDM consent gateway integration
        │   ├── consent-mapper.service.ts   # Map WyshCare ←→ ABDM consent models
        │   └── subscription.service.ts     # Subscription management
        │
        ├── data-exchange/
        │   ├── data-request.service.ts     # Health data request/transfer
        │   └── data-encryption.service.ts  # ECDH + AES-256-GCM encryption
        │
        ├── fhir/
        │   ├── fhir-mapper.service.ts      # WyshCare models → FHIR R4
        │   ├── fhir-prescription.mapper.ts
        │   ├── fhir-diagnostic.mapper.ts
        │   ├── fhir-consultation.mapper.ts
        │   └── fhir-document.mapper.ts
        │
        ├── phr/
        │   ├── phr-auth.service.ts         # PHR app auth integration
        │   └── phr-profile.service.ts      # PHR profile sync
        │
        ├── registries/
        │   ├── hpr-client.service.ts       # Healthcare Professional Registry
        │   ├── hfr-client.service.ts       # Health Facility Registry
        │   └── registry-mapper.service.ts  # WyshCare ←→ ABDM registry
        │
        ├── scan-share/
        │   ├── scan-share.service.ts       # Scan & Share flow
        │   ├── scan-pay.service.ts         # Scan & Pay flow
        │   └── running-token.service.ts    # Token status queries
        │
        ├── uhi/
        │   ├── uhi-gateway.service.ts      # UHI Beckn protocol gateway
        │   ├── uhi-signing.service.ts      # Ed25519 signing
        │   └── uhi-message.service.ts      # Beckn message builder
        │
        ├── encryption/
        │   ├── rsa-encryption.service.ts   # RSA/OAEP for Aadhaar
        │   ├── ecdh-encryption.service.ts  # ECDH Curve25519
        │   └── aes-encryption.service.ts   # AES-256-GCM
        │
        ├── dto/
        │   ├── abha-creation.dto.ts
        │   ├── consent-request.dto.ts
        │   ├── link-care-context.dto.ts
        │   ├── health-data-request.dto.ts
        │   └── scan-share.dto.ts
        │
        └── interfaces/
            ├── abdm-config.interface.ts
            ├── abha.interface.ts
            ├── consent-artefact.interface.ts
            ├── care-context.interface.ts
            ├── fhir-bundle.interface.ts
            └── hi-type.enum.ts
```

### 3.2 Existing Files That Need Extension (No Core Logic Changed)

| File | Change Required |
|---|---|
| `backend/src/app.module.ts` | Import `AbdmModule` |
| `backend/src/config/env.ts` | Add ABDM env vars (GATEWAY_URL, CLIENT_ID, CLIENT_SECRET, etc.) |
| `backend/src/modules/interoperability/interoperability.service.ts` | Extend to use real ABDM gateway instead of stub |
| `backend/src/modules/consent/consent.service.ts` | Add optional ABDM gateway sync |
| `backend/src/modules/vault/vault.service.ts` | Add FHIR export hook |
| `backend/prisma/schema.prisma` | Add ABDM-specific fields to existing models |

### 3.3 Database Schema Additions

```prisma
// New models to add to schema.prisma

model ABHAAccount {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  abhaNumber      String   @unique   // 14-digit ABHA
  abhaAddress     String   @unique   // username@sbx / username@abdm
  healthId        String?            // Internal ABHA health ID
  mobileVerified  Boolean  @default(false)
  emailVerified   Boolean  @default(false)
  faceAuthEnabled Boolean  @default(false)
  passwordSet     Boolean  @default(false)
  status          String   @default("ACTIVE")  // ACTIVE | DEACTIVATED | DELETED
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  linkage         ABDMLinkage?  // Link to existing ABDMLinkage model
}

model CareContext {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  referenceNumber String
  displayName     String
  hiType          String   // Prescription | DiagnosticReport | etc.
  linkedAt        DateTime?
  linkedTo        String?  // ABHA address this is linked to
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model ConsentArtefact {
  id                  String   @id @default(cuid())
  consentGrantId      String   @unique
  consentGrant        ConsentGrant @relation(fields: [consentGrantId], references: [id])
  artefactId          String   @unique  // ABDM gateway artefact ID
  artefactJson        Json              // Full consent artefact from gateway
  status              String   // GRANTED | REVOKED | EXPIRED
  artefactSignature   String?  // JWS signature
  receivedAt          DateTime @default(now())
  expiresAt           DateTime
}

model FHIRResource {
  id              String   @id @default(cuid())
  healthRecordId  String?
  healthRecord    HealthRecord? @relation(fields: [healthRecordId], references: [id])
  hiType          String
  fhirJson        Json     // The FHIR R4 resource
  fhirVersion     String   @default("4.0")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model ECDHKeyMaterial {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  publicKey       String   // Base64 encoded Curve25519 public key
  keyExpiresAt    DateTime
  keyPairId       String?  // ABDM key pair ID
  createdAt       DateTime @default(now())
}

model UHIParticipant {
  id               String   @id @default(cuid())
  participantId    String   @unique  // UHI participant ID
  participantType  String   // EUA | HSPA
  publicKey        String   // Ed25519 public key
  status           String   @default("ACTIVE")
  registeredAt     DateTime @default(now())
}
```

---

## 4. ABDM Adapter Layers

### 4.1 Gateway Client Layer
**Purpose**: Single HTTP client for all ABDM gateway communication.

```
GatewayClientService
├── getAuthToken()           → OAuth2 Client Credentials → Keycloak
├── refreshToken()           → Handle token expiry
├── request(config)          → Generic request with REQUEST-ID, TIMESTAMP, X-CM-ID
├── get(abdmPath, headers)   → GET with retry
├── post(abdmPath, body)     → POST with retry + callback
└── handleCallback()         → Validate callback authenticity
```

**Attach to**: `backend/src/modules/abdm/gateway/gateway-client.service.ts`

### 4.2 ABHA Service Layer
**Purpose**: All ABHA creation, verification, and profile management.

```
AbhaService
├── createViaAadhaarOtp()     → Full Aadhaar OTP flow
├── createViaFaceAuth()       → Face auth QR flow
├── createViaBiometric()      → Fingerprint/iris flow
├── loginViaAadhaarOtp()      → Multiple login methods
├── loginViaFaceAuth()
├── loginViaPassword()
├── findAbhaByMobile()
├── getProfile()
├── updateProfile()
├── getQrCode()
├── getAbhaCard()
└── deactivateAbha()
```

**Reuses WyshCare**: `SmsService` for OTP delivery, existing phone verification flow.

### 4.3 Consent Gateway Layer
**Purpose**: Bridge between WyshCare's existing consent model and ABDM M3 gateway.

```
ConsentGatewayService
├── mapToAbdmPurpose(wyshcarePurpose)    → Purpose code mapping
├── mapToAbdmHiTypes(scope)              → HI type mapping
├── initiateConsentRequest(consentId)    → POST to ABDM gateway
├── checkConsentStatus(requestId)
├── fetchConsentArtefact(artefactId)
├── handleConsentNotify(payload)         → Callback from gateway
└── revokeConsent(artefactId)
```

**Attach to**: `backend/src/modules/abdm/consent/consent-gateway.service.ts`
**Integration point**: Extend `ConsentService.create()` to optionally call `ConsentGatewayService.initiateConsentRequest()` when ABDM-linked users are involved.

### 4.4 FHIR Mapper Layer
**Purpose**: Convert WyshCare native health data to FHIR R4 resources.

```
FhirMapperService
├── mapPrescription(prescription)    → FHIR MedicationRequest
├── mapDiagnosticReport(report)      → FHIR DiagnosticReport
├── mapConsultation(appointment)     → FHIR Encounter
├── mapHealthRecord(record)          → FHIR DocumentReference
├── mapPatient(user)                 → FHIR Patient
├── mapPractitioner(doctor)          → FHIR Practitioner
├── mapOrganization(clinic)          → FHIR Organization
├── buildBundle(resources)           → FHIR Bundle
└── serializeFhir(fhirObject)        → JSON string
```

**Attach to**: `backend/src/modules/abdm/fhir/`
**No existing code modified** — pure conversion layer at the boundary.

### 4.5 Registry Layer
**Purpose**: HPR and HFR integration.

```
HprClientService
├── registerProfessional(doctorId)  → Create HPRID for doctor
├── syncProfessional(doctorId)      → Update HPR record
├── searchProfessional(query)       → Search HPR
└── getProfessionalDetails(hprId)
```

```
HfrClientService
├── registerFacility(clinicId)      → Register clinic in HFR
├── searchFacility(query)
├── getFacilityDetails(hfrId)
└── syncFacility(clinicId)
```

**Attach to**: `backend/src/modules/abdm/registries/`
**Integration points**: `DoctorsService.onboard()` to optionally register in HPR; `Clinic` model to link HFR ID.

### 4.6 Scan & Share Layer
**Purpose**: QR-based profile and record sharing.

```
ScanShareService
├── generateShareQr(hipId)          → Generate QR for facility
├── shareProfile(abhaAddress, hipId) → Share KYC profile
├── shareRecords(recordIds, hipId)  → Share selected records
├── handleOnShareCallback(payload)  → Gateway callback
└── initiateScanPay(hipId)          → Scan & Pay flow
```

**Attach to**: `backend/src/modules/abdm/scan-share/`
**Reuses WyshCare**: `identity/qr` endpoint pattern, existing QR generation library.

### 4.7 UHI Layer
**Purpose**: Universal Health Interface protocol.

```
UhiGatewayService
├── registerParticipant(participantType, publicKey)
├── handleSearch(query)             → Map to WyshCare discovery
├── handleOnSearch(results)         → Return Beckn catalog
├── handleSelect(providerId)
├── handleConfirm(bookingId)
├── handleCancel(bookingId)
├── buildContext(action, bapId)     → Build Beckn context
├── signMessage(payload)            → Ed25519 signing
└── verifySignature(payload, signature)
```

**Attach to**: `backend/src/modules/abdm/uhi/`
**Reuses WyshCare**: `DiscoveryService`, `TelemedicineService`, `DoctorsService`.

### 4.8 Encryption Layer
**Purpose**: All cryptographic operations for ABDM.

```
RsaEncryptionService
├── encrypt(data, publicKeyPem)     → RSA/ECB/OAEPWithSHA-1AndMGF1Padding
├── decrypt(encryptedData, privateKeyPem)
└── generateKeyPair()
```

```
EcdhEncryptionService
├── generateKeyPair()               → Curve25519
├── computeSharedSecret(theirPub, myPriv) → ECDH
├── deriveKey(sharedSecret)         → HKDF → AES-256 key
├── encryptHealthData(plaintext, key) → AES-256-GCM
└── decryptHealthData(ciphertext, key, iv)
```

---

## 5. Integration Points with Existing WyshCare Modules

### 5.1 Auth Module → ABDM
| Existing | ABDM Integration | Pattern |
|---|---|---|
| `POST /auth/otp/request` | Reuse OTP infrastructure for ABHA mobile verification | Service extension |
| `POST /auth/otp/verify` | After verification, optionally create ABHA | Hook |
| `POST /auth/login` | Add ABHA login methods as additional auth options | New route |
| `GET /auth/me` | Include ABHA info in user profile | Extended response |

### 5.2 Consent Module → ABDM
| Existing | ABDM Integration | Pattern |
|---|---|---|
| `POST /consents` | Optionally sync to ABDM consent gateway | Service hook |
| `PATCH /consents/:id/revoke` | Optionally revoke ABDM consent artefact | Service hook |
| `GET /consents` | Include consent artefact data | Extended response |

### 5.3 Vault Module → ABDM
| Existing | ABDM Integration | Pattern |
|---|---|---|
| `POST /vault/records` | Generate FHIR resource + care context | Service hook |
| `GET /vault/records` | Optionally serve from ABDM-linked data | Extended query |
| `POST /vault/records/upload` | FHIR DocumentReference creation | Service hook |

### 5.4 Identity Module → ABDM
| Existing | ABDM Integration | Pattern |
|---|---|---|
| `GET /identity/me` | Include ABHA profile in response | Extended response |
| `GET /identity/qr` | Add ABDM QR code option | Extended endpoint |
| `GET /identity/dashboard` | Include care contexts | Extended response |

### 5.5 Doctors Module → HPR
| Existing | ABDM Integration | Pattern |
|---|---|---|
| `POST /doctors/onboarding` | Optionally register doctor in HPR | Service hook |
| `GET /doctors` | Include HPRID in response | Extended response |

---

## 6. Feature Flags & Configuration

```env
# ABDM Integration Flags
ABDM_ENABLED=false                          # Master switch
ABDM_GATEWAY_URL=https://abhasbx.abdm.gov.in
ABDM_CLIENT_ID=wyshcare-sbx-001
ABDM_CLIENT_SECRET=***
ABDM_GATEWAY_TOKEN_URL=https://abhasbx.abdm.gov.in/auth/realms/abdm/protocol/openid-connect/token
ABDM_X_CM_ID=sbx                           # sbx | abdm

# M1 — ABHA
ABDM_ABHA_ENABLED=false
ABDM_MAX_ABHA_CREATIONS=100

# M2 — Linking & Data
ABDM_LINKING_ENABLED=false
ABDM_BRIDGE_URL=https://bridge.wyshcare.app/abdm/callbacks

# M3 — Consent
ABDM_CONSENT_GATEWAY_ENABLED=false

# Registries
ABDM_HPR_ENABLED=false
ABDM_HFR_ENABLED=false
ABDM_HPR_BASE_URL=https://hprsbx.abdm.gov.in
ABDM_HFR_BASE_URL=https://hfrlsbx.abdm.gov.in

# UHI
ABDM_UHI_ENABLED=false
ABDM_UHI_GATEWAY_URL=https://uhi-gateway.abdm.gov.in
ABDM_UHI_PARTICIPANT_ID=wyshcare-hspa-001
ABDM_UHI_PRIVATE_KEY_PATH=/etc/wyshcare/ed25519-private.pem

# Encryption
ABDM_RSA_PRIVATE_KEY_PATH=/etc/wyshcare/rsa-private.pem
ABDM_ECDH_PRIVATE_KEY_PATH=/etc/wyshcare/ecdh-private.pem

# Sync
ABDM_AUTO_SYNC=false                       # Auto-sync new records to ABDM
```

---

## 7. Callback URL Registration

WyshCare must expose public callback endpoints and register them with ABDM gateway:

```
POST /abdm/callbacks/v3/patient/care-context/discover
POST /abdm/callbacks/v3/link/carecontext
POST /abdm/callbacks/v3/consent-requests/hip/notify
POST /abdm/callbacks/v3/health-information/hip/request
POST /abdm/callbacks/v3/on-share
POST /abdm/callbacks/v3/patient/share/open-order
POST /abdm/callbacks/v3/hip/patient/running-token/status
POST /abdm/callbacks/v3/subscription-requests/v3/notify
```

All callbacks registered via `POST /v3/bridge/update` with the bridge URL `https://api.wyshcare.app/abdm/callbacks`.

---

## 8. Data Flow: WyshCare Record → ABDM HIE-CM

```
1. Patient uploads record in WyshCare (POST /vault/records)
   ↓
2. WyshCare VaultService creates HealthRecord (unchanged)
   ↓
3. [NEW] If ABDM enabled + patient has ABHA:
   a. FhirMapperService maps HealthRecord to FHIR R4 resource
   b. FHIR resource stored in new FHIRResource table
   c. If care context exists → CareContextService creates/updates
   d. If LINK subscription active → notify via subscription
   e. If DATA subscription active → notify HIU of new data
   ↓
4. HIU requests data via consent artefact
   ↓
5. [NEW] ABDM Gateway callback → ConsentGatewayService validates
   ↓
6. [NEW] EcdhEncryptionService encrypts FHIR bundle
   ↓
7. [NEW] POST /v3/health-information/notify (HIP pushes encrypted data)
```

---

## 9. Phased Rollout Plan

| Phase | Scope | Dependencies | Impact on Existing |
|---|---|---|---|
| **Phase A** | ABDM Gateway client + ABHA creation (M1) | RSA keys, ABDM sandbox access | Zero — new module |
| **Phase B** | ABHA login + profile management | Phase A | New auth methods added |
| **Phase C** | HPR + HFR integration | Phase A | Extends doctor/clinic onboarding |
| **Phase D** | FHIR mapper + care contexts | Phase C | New — no existing changes |
| **Phase E** | Consent gateway (M3) | Phase B + D | Extends consent service (hook) |
| **Phase F** | Health data exchange (M2/M3) | Phase D + E | New — optional push |
| **Phase G** | Scan & Share + Scan & Pay | Phase B | New module |
| **Phase H** | UHI protocol | Phase C | New — optional participation |
| **Phase I** | NHCX claims | Phase C | New module |

---

## 10. Risk Mitigation

| Risk | Mitigation |
|---|---|
| Breaking existing consent flows | All ABDM consent logic is opt-in via feature flag + ABHA linkage check |
| ABDM gateway latency | Async callback pattern — WyshCare never blocks on gateway calls |
| FHIR schema changes | FHIR mapper is isolated — only mapper changes, not core models |
| ABHA creation rate limits (100/sandbox) | Separate sandbox client per environment |
| Key management complexity | Centralized encryption service with HSM-backed key storage |
| Certification delays | Parallel certification track — WyshCare continues shipping non-ABDM features |
