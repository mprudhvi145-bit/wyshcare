# ABDM Knowledge Base — Complete Resource Analysis

> Generated: June 4, 2026
> Source: `/Users/vimarshakprudhvi/Downloads/ABDM_Resource` (17 resources, ~653 MB)

---

## Table of Contents

1. [Resource Inventory](#1-resource-inventory)
2. [ABDM Conceptual Architecture](#2-abdm-conceptual-architecture)
3. [Milestone 1 — ABHA Creation & Verification](#3-milestone-1--abha-creation--verification)
4. [Milestone 2 — Linking & Data Flow](#4-milestone-2--linking--data-flow)
5. [Milestone 3 — Consent & Subscription](#5-milestone-3--consent--subscription)
6. [PHR App Integration](#6-phr-app-integration)
7. [Face Auth ABHA Creation](#7-face-auth-abha-creation)
8. [Find ABHA & Face Auth Login](#8-find-abha--face-auth-login)
9. [Scan & Share](#9-scan--share)
10. [Scan & Pay](#10-scan--pay)
11. [Running Token Status](#11-running-token-status)
12. [NHPR — Health Professional Registry](#12-nhpr--health-professional-registry)
13. [HFR — Health Facility Registry](#13-hfr--health-facility-registry)
14. [UHI — Universal Health Interface](#14-uhi--universal-health-interface)
15. [NHCX — National Health Claims Exchange](#15-nhcx--national-health-claims-exchange)
16. [DHP — Decentralized Health Protocol](#16-dhp--decentralized-health-protocol)
17. [ABDM Wrapper (Spring Boot)](#17-abdm-wrapper-spring-boot)
18. [ABHA App (Flutter)](#18-abha-app-flutter)
19. [Common Patterns & Requirements](#19-common-patterns--requirements)

---

## 1. Resource Inventory

| # | Resource | Type | Size | Focus |
|---|---|---|---|---|
| 1 | `INTEGRATION.pdf` | PDF | 4.2 MB | Integrator FAQ — all milestones |
| 2 | `M1.pdf` | PDF | 3.1 MB | ABHA creation & verification APIs |
| 3 | `M2.docx` | DOCX | 3.3 MB | Linking, data flow, scan & share |
| 4 | `M3.docx` | DOCX | 1.8 MB | Consent management, subscriptions |
| 5 | `ABHA_PHR_V3_Documents` | DOCX | 4.6 MB | PHR app APIs (mobile/web) |
| 6 | `M1_Test_Cases.xlsx` | XLSX | 138 KB | M1 certification test matrix |
| 7 | `Face_Auth_ABHA_Creation` | PDF | 231 KB | Face auth ABHA creation flow |
| 8 | `Updated_Find_ABHA` | PDF | 1.4 MB | Find ABHA + face auth QR login |
| 9 | `Updated_scan_and_pay` | PDF | 1.2 MB | QR-based payment in PHR app |
| 10 | `Scan_and_share_Documents` | PDF | 1.2 MB | QR profile & record sharing |
| 11 | `Running_Token_Status` | PDF | 139 KB | Token/counter status at facilities |
| 12 | `NHPR_SBX_Doc` (ZIP) | ZIP | 4.8 MB | HPR + HFR APIs |
| 13 | `ABDM-ABHA-APP-main.zip` | ZIP | 11 MB | Flutter ABHA app source |
| 14 | `ABDM-wrapper-master.zip` | ZIP | 4.6 MB | Spring Boot M2/M3 wrapper |
| 15 | `DHP-Specs-main.zip` | ZIP | 824 KB | Decentralized Health Protocol |
| 16 | `nhcx-main.zip` | ZIP | 5.9 MB | National Health Claims Exchange |
| 17 | `UHI-main.zip` | ZIP | 605 MB | Universal Health Interface (full) |

---

## 2. ABDM Conceptual Architecture

### 2.1 Core Actors

| Actor | Full Name | Description |
|---|---|---|
| **ABHA** | Ayushman Bharat Health Account | 14-digit health ID + `username@sbx` / `username@abdm` address |
| **HIE-CM** | Health Information Exchange & Consent Manager | Central gateway routing all health data transactions |
| **HIP** | Health Information Provider | Hospitals, clinics, labs — data originators |
| **HIU** | Health Information User | PHR apps, insurers, researchers — data consumers |
| **HRP** | Health Repository Provider | Stores/manages health records long-term |
| **PHR App** | Personal Health Record App | Patient-facing mobile/web application |
| **HPR** | Healthcare Professional Registry | Registry of all healthcare professionals |
| **HFR** | Health Facility Registry | Registry of all health facilities |
| **NHPR** | National Health Professional Registry | Umbrella for HPR + HFR |
| **UHI** | Universal Health Interface | Open protocol for health service discovery/booking |
| **NHCX** | National Health Claims Exchange | Standardized health insurance claims exchange |

### 2.2 Milestone Framework

| Milestone | Scope | Status for Integrator |
|---|---|---|
| **M1** | ABHA creation, verification, profile management | Must complete first |
| **M2** | HIP/HIU linking, data upload, scan & share | Required for data exchange |
| **M3** | Consent management, subscriptions, data request | Required for full integration |

### 2.3 Health Information (HI) Types (8 mandatory)

| HI Type | Description |
|---|---|
| **Prescription** | e-Prescriptions |
| **DiagnosticReport** | Lab reports, radiology reports |
| **OPConsultation** | OPD consultation notes |
| **DischargeSummary** | Hospital discharge summaries |
| **ImmunizationRecord** | Vaccination records |
| **HealthDocumentRecord** | General health documents |
| **WellnessRecord** | Wellness & lifestyle data |
| **Invoice** | Billing/invoice records |

### 2.4 Environments

| Environment | Base URL | Purpose |
|---|---|---|
| **SBX** | `https://abhasbx.abdm.gov.in` | Sandbox testing |
| **PROD** | `https://apis.abdm.gov.in` | Production |

### 2.5 Common Header Requirements

| Header | Value | Required |
|---|---|---|
| `REQUEST-ID` | UUID v4 | Always |
| `TIMESTAMP` | ISO 8601 format | Always |
| `X-CM-ID` | `sbx` or `abdm` | Gateway calls |
| `Authorization` | Bearer token | Authenticated endpoints |
| `Content-Type` | `application/json` | POST/PUT |

---

## 3. Milestone 1 — ABHA Creation & Verification

### 3.1 ABHA Creation Methods (5 methods)

#### Method 1: Aadhaar OTP
1. `POST /v3/enrollment/enrol/auth/init` — Generate Aadhaar OTP (scope: `abha-enrol`, `aadhaar-otp`)
2. `POST /v3/enrollment/enrol/auth/verify` — Verify Aadhaar OTP → returns `txnId`
3. `POST /v3/enrollment/enrol/aadhaar/encrypt` — Encrypt Aadhaar number with RSA public key
4. `POST /v3/enrollment/enrol/byAadhaar` — Enroll ABHA with encrypted Aadhaar + txnId → returns `healthId` + `healthIdNumber`
5. `POST /v3/enrollment/enrol/mobile/verify` — Verify mobile number via OTP
6. `POST /v3/enrollment/enrol/email/verify` — Verify email (optional)
7. `POST /v3/enrollment/enrol/suggested-usernames` — Get suggested ABHA addresses
8. `POST /v3/enrollment/enrol/create-account-without-password` — Create ABHA address without password
9. `POST /v3/enrollment/enrol/create-account-with-password` — Create ABHA address with password

#### Method 2: Aadhaar Biometric (Fingerprint / Iris / Face)
1. `POST /v3/enrollment/enrol/auth/init` — scope: `abha-enrol`, `biometric-auth`
2. `POST /v3/enrollment/enrol/capturePID` — Capture biometric (poll until COMPLETE)
3. `POST /v3/enrollment/enrol/auth/verify` — Verify biometric → txnId
4. Follow steps 3-9 from Aadhaar OTP method

#### Method 3: Driving License
1. `POST /v3/enrollment/enrol/auth/init` — scope: `abha-enrol`, `dl-otp`
2. `POST /v3/enrollment/enrol/auth/verify` — Verify DL OTP
3. `POST /v3/enrollment/enrol/byDrivingLicense` — Enroll via DL
4. Follow mobile verification + ABHA address creation

#### Method 4: Demo Auth (Offline — government entities only)
1. Collect demographic data + photo
2. `POST /v3/enrollment/enrol/createHealthIdByAdhaarDemo` — Enroll via demo auth

#### Method 5: Face Auth via QR
1. `POST /v3/enrollment/enrol/auth/init` — scope: `abha-enrol`, `face-auth`
2. Generate QR URL: `https://phrsbx.abdm.gov.in/face-auth?txnId=<txnId>`
3. ABHA App scans QR, captures face
4. Poll `POST /v3/enrollment/enrol/capturePID` until VERIFIED
5. `POST /v3/enrollment/enrol/byAadhaar` — Enroll

### 3.2 ABHA Verification Methods (8+ methods)

| Method | API | Description |
|---|---|---|
| Aadhaar OTP | `POST /v3/profile/login/verify/aadhaarOtp` | OTP to Aadhaar-linked mobile |
| Aadhaar Number | `POST /v3/profile/login/verify/aadhaar` | Direct Aadhaar verification |
| ABHA OTP | `POST /v3/profile/login/verify/healthId` | OTP to ABHA-linked mobile |
| Mobile OTP | `POST /v3/profile/login/verify/phone` | OTP to registered mobile |
| ABHA Password | `POST /v3/profile/login/verify/password` | Password-based login |
| Face Auth | `POST /v3/profile/login/verify/faceAuth` | QR-based face authentication |
| Fingerprint | `POST /v3/profile/login/verify/biometric` | Biometric fingerprint |
| Iris | `POST /v3/profile/login/verify/biometric` | Biometric iris |

### 3.3 Find ABHA

| Method | API |
|---|---|
| By Mobile Number | `POST /v3/profile/account/abha/search` (encrypted mobile) |
| By Aadhaar Number | `POST /v3/profile/account/abha/searchByAadhaar` (encrypted Aadhaar) |
| By Biometrics | Face auth QR flow |

### 3.4 ABHA Profile Management

| Operation | API |
|---|---|
| Get Profile | `GET /v3/profile/account` |
| Update Profile | `PUT /v3/profile/account` |
| Update Mobile | `POST /v3/profile/account/mobile/update` |
| Update Email | `POST /v3/profile/account/email/update` |
| Change Password | `POST /v3/profile/account/password/change` |
| Get QR Code | `GET /v3/profile/account/qrCode` |
| Get ABHA Card | `GET /v3/profile/account/abhaCard` |
| Deactivate ABHA | `POST /v3/profile/account/deactivate` |
| Delete ABHA | `POST /v3/profile/account/delete` |
| Re-activate ABHA | `POST /v3/profile/account/reactivate` |
| Re-KYC | `POST /v3/profile/account/rekyc` |
| Get Public Certificate | `GET /v3/profile/public/certificate` (RSA public key) |

### 3.5 Encryption
- **Algorithm**: `RSA/ECB/OAEPWithSHA-1AndMGF1Padding`
- **Key source**: `GET /v3/profile/public/certificate`
- **Encoding**: Base64 encoded encrypted data

### 3.6 Sandbox Limitations
- Max **100 ABHA creations** per client ID in sandbox (error code: `ABDM-1227`)
- Up to **6 ABHA addresses** per ABHA number
- Up to **6 ABHA numbers** per mobile number

---

## 4. Milestone 2 — Linking & Data Flow

### 4.1 Gateway APIs

| API | Method | Path |
|---|---|---|
| Auth Token | POST | `/auth/realms/abdm/protocol/openid-connect/token` |
| OpenID Config | GET | `/auth/realms/abdm/.well-known/openid-configuration` |
| Keycloak Certs | GET | `/auth/realms/abdm/protocol/openid-connect/certs` |
| Update Bridge URL | POST | `/v3/bridge/update` |
| Register Facility | POST | `/v3/facility/register` |
| Software Linkage | POST | `/v3/facility/software-linkage` |
| Find Bridge by Service ID | GET | `/v3/bridge/findByServiceId` |
| Find Services by Bridge ID | GET | `/v3/bridge/findServicesByBridgeId` |

### 4.2 HIP-Initiated Linking Flow

1. **Link Token Generation** — `POST /v3/token/generate-token` (HIP provides patient mobile)
   - Gateway generates OTP + sends SMS to patient
   - Returns `linkRefNumber` (valid 5 min)

2. **Link Callback** — Gateway calls `POST {callback}/v3/link/carecontext` (HIP receives `patientReference`, `patientDisplay`, `careContexts[]`)

3. **Link Care Context** — `POST /v3/link/carecontext` (HIP sends care contexts for discovered patient)
   - `careContexts[]`: `{referenceNumber, displayName}`

4. **Notify Care Context Update** — `POST /v3/link/context/notify` (HIP notifies PHR of new care contexts)

5. **SMS Notification** — `POST /v3/link/patient/links/sms/notify2` (Gateway sends SMS to patient)

### 4.3 User-Initiated Linking Flow

1. **Patient Discovery** — `POST /v3/patient/care-context/discover` (HIU/HIP searches by ABHA address)
   - Request: `{patient: {id: "abha@sbx"}}`
   - Gateway calls HIP callback: `POST {callback}/v3/patient/care-context/discover`

2. **Link Init** — `POST /v3/link/care-context/init` (Patient selects care contexts to link)

3. **Link Confirm** — `POST /v3/link/care-context/confirm` (Patient confirms linking)

### 4.4 Data Flow (HIP → HIU via Gateway)

1. **Consent Notify** — Gateway calls `POST {callback}/v3/consent/request/hip/notify`
2. **Health Information Request** — `POST /v3/health-information/request` (HIU requests data against consent artefact)
3. **HIP Callback** — Gateway calls `POST {callback}/v3/health-information/hip/request` (HIP receives request)
4. **HIP Pushes Data** — `POST /v3/health-information/notify` (HIP sends encrypted FHIR bundle)
   - **Encryption**: ECDH with Curve25519
   - **Format**: FHIR R4 Bundle
5. **HIU Receives** — `POST /v3/health-information/transfer` (HIU receives decrypted data)

### 4.5 Care Context Data Model

```json
{
  "careContexts": [
    {
      "referenceNumber": "unique-ref",
      "displayName": "OP Consultation - 01/06/2026"
    }
  ]
}
```

### 4.6 Encryption for Health Data
- **Algorithm**: ECDH (Elliptic Curve Diffie-Hellman) with Curve25519
- **Key Exchange**: Both parties generate key pairs, exchange public keys
- **Symmetric Key**: Derived from ECDH shared secret using HKDF
- **Data Encryption**: AES-256-GCM with the derived symmetric key

---

## 5. Milestone 3 — Consent & Subscription

### 5.1 Consent Flow

1. **Consent Request Init** — `POST /v3/consent/request/init` (HIU initiates)
   - Request body:
     ```json
     {
       "purpose": { "code": "PATRQT", "text": "Patient requested" },
       "patient": { "id": "abha@sbx" },
       "hiu": { "id": "hiu-id" },
       "requester": { "name": "Dr. Name", "identifier": "hprid" },
       "hiTypes": ["Prescription", "DiagnosticReport"],
       "permission": {
         "accessMode": "VIEW",
         "dateRange": {"from": "2025-01-01", "to": "2026-12-31"},
         "dataEraseAt": "2027-06-01"
       }
     }
     ```

2. **Notify HIP** — Gateway calls `POST {hip-callback}/v3/consent/request/hip/notify`

3. **Notify Patient** — Gateway sends notification to patient's PHR app

4. **Patient Grants/Denies** — Via PHR app

5. **Consent Artefact Created** — `POST /v3/consent/v3/fetch` — HIU fetches the artefact

6. **Consent Status** — `POST /v3/consent/request/status` — Check consent request status

### 5.2 Consent Purpose Codes

| Code | Description |
|---|---|
| `PATRQT` | Patient requested |
| `CAREMGT` | Care management |
| `BTG` | Break the glass (emergency) |
| `PUBHLTH` | Public health |
| `HPAYMT` | Health insurance payment |
| `DSRCH` | Disease research |
| `CLINCODEQ` | Clinical code equal |
| `WELLNESS` | Wellness purpose |

### 5.3 Access Modes

| Mode | Description |
|---|---|
| `VIEW` | View only access |
| `STORE` | Store/export access |
| `QUERY` | Query/search access |
| `STREAM` | Stream data access |

### 5.4 Consent Artefact Model

```json
{
  "consentArtefact": {
    "id": "artefact-uuid",
    "status": "GRANTED",
    "purpose": { "code": "PATRQT" },
    "patient": { "id": "abha@sbx" },
    "hiu": { "id": "hiu-uuid", "name": "HIU Name" },
    "consentManager": { "id": "cm-1" },
    "hipIds": ["hip-uuid"],
    "hiTypes": ["Prescription", "DiagnosticReport"],
    "permission": {
      "accessMode": "VIEW",
      "dateRange": { "from": "2025-01-01", "to": "2026-12-31" },
      "dataEraseAt": "2027-06-01",
      "frequency": { "unit": "MONTH", "repeats": 0 }
    },
    "signature": "jws-signature"
  }
}
```

### 5.5 Subscription Flow

Subscription is a **restricted feature** (health locker / PHR only).

#### Categories
| Category | Description |
|---|---|
| **LINK** | Notify when new care contexts are linked |
| **DATA** | Notify when new health data is available |

#### APIs
| Operation | API |
|---|---|
| Init Subscription Request | `POST /v3/subscription-requests/v3/init` |
| Approve Subscription | `POST /v3/subscription-requests/v3/approve` |
| Deny Subscription | `POST /v3/subscription-requests/v3/deny` |
| Edit Subscription | `POST /v3/subscription-requests/v3/edit` |

### 5.6 Data Request with Consent Artefact

1. `POST /v3/health-information/hip/request` — Gateway calls HIP with consent artefact ID
2. HIP validates consent, fetches data, encrypts with ECDH
3. `POST /v3/health-information/notify` — HIP pushes encrypted data
4. `POST /v3/health-information/transfer` — HIU receives and decrypts

---

## 6. PHR App Integration

### 6.1 PHR App Base URLs
- **Sandbox**: `https://abhasbx.abdm.gov.in/abha/api/v3/phr/app/`
- **Production**: `https://apis.abdm.gov.in/phr/api/phr/app/v3/`

### 6.2 Registration Methods
1. **Via Mobile Number**:
   - `POST /registration/request/otp` → Verify OTP
   - `POST /registration/verify/otp` → Create PHR account
2. **Via ABHA Number**:
   - Aadhaar OTP flow or Mobile OTP flow → Link ABHA

### 6.3 Login Methods (10+)

| Method | API |
|---|---|
| Mobile OTP | `POST /auth/phone/login/request/otp` |
| Email OTP | `POST /auth/email/login/request/otp` |
| ABHA Number + Aadhaar OTP | `POST /auth/abha/login/request/otp` |
| ABHA Number + Mobile OTP | `POST /auth/abha/login/request/aadhaarOtp` |
| ABHA Address + Password | `POST /auth/abha-address/login` |
| ABHA Address + Mobile OTP | `POST /auth/abha-address/login/request/otp` |
| ABHA Address + Email OTP | `POST /auth/abha-address/login/request/emailOtp` |
| Aadhaar Number + OTP | `POST /auth/aadhaar/login/request/otp` |
| Face Auth | `POST /auth/face/login/request` |
| Refresh Token | `POST /auth/refresh/token` |

### 6.4 PHR Account Management

| Operation | API |
|---|---|
| Get Profile | `GET /profile/account` |
| Edit Profile | `PUT /profile/account` |
| Update Mobile | `POST /profile/account/mobile/update` |
| Update Email | `POST /profile/account/email/update` |
| Change Password | `POST /profile/account/password/change` |
| Get QR Code | `GET /profile/account/qrCode` |
| Get PHR Card | `GET /profile/account/phrCard` |
| Refresh Token | `POST /auth/refresh/token` |
| Logout | `POST /auth/logout` |
| Link ABHA Address | `POST /profile/account/link/abhaAddress` |
| Switch Profile | `POST /profile/account/switch/profile` |
| Get PHR Certificate | `GET /profile/account/phrCertificate` |

---

## 7. Face Auth ABHA Creation

### 7.1 Workflow

1. **Init Transaction**: `POST /v3/enrollment/enrol/auth/init`
   - Scope: `["abha-enrol", "face-auth"]`
   - Returns `txnId`

2. **QR Code Generation**: Construct URL `https://phrsbx.abdm.gov.in/face-auth?txnId=<txnId>`
   - Two sharing modes:
     - **Web**: QR code image
     - **Mobile**: Intent-based deep link to ABHA app

3. **Poll Capture PID**: `POST /v3/enrollment/enrol/capturePID` (every 5-10 seconds)
   - Status transitions: `PENDING → VERIFIED → FAILED → COMPLETE`
   - On COMPLETE, returns PID (Person Identification Data) with face photo

4. **Enroll via Aadhaar**: `POST /v3/enrollment/enrol/byAadhaar`
   - Encrypt Aadhaar with RSA public key
   - Send encrypted Aadhaar + txnId + mobile + email

---

## 8. Find ABHA & Face Auth Login

### 8.1 Find ABHA by Mobile

1. `POST /v3/profile/account/abha/search` — Encrypted mobile in request
2. Returns list of matching ABHA numbers/addresses

### 8.2 Face Auth Login

1. **Init**: `POST /v3/profile/login/init/faceAuth` → Returns `txnId` (valid 10 min)
2. **QR Code**: Generate QR with `txnId`
3. **Scan**: ABHA app scans QR, captures face
4. **Poll**: `POST /v3/profile/login/capturePID` — Poll until status VERIFIED
5. **Verify**: `POST /v3/profile/login/verify/faceAuth` → Returns auth token

---

## 9. Scan & Share

### 9.1 Purpose
Patient shares KYC profile and health records with a facility by scanning a QR code.

### 9.2 QR Content
The QR code encodes a URL containing:
- `hipId` — Facility identifier
- `counterId` — Registration counter identifier

### 9.3 Scan & Profile Share Flow

1. **Profile Share**: `POST /v3/share` (PHR app → HIE-CM)
   - `{patient: {id: "abha@sbx"}, hip: {id: "hip-id"}, purpose: "KYC"}`
2. **Callback**: HIE-CM → HIP: `POST {callback}/v3/on-share`
   - Delivers patient KYC profile to facility
3. **ACK**: HIP → HIE-CM: `POST /v3/on-share`

### 9.4 Scan & Record Share Flow

1. **Record Share**: `POST /v3/share` (PHR selects records to share)
2. **Callback**: HIE-CM → HIP: `POST {callback}/v3/on-share` with record references
3. **Data Pull**: HIP fetches records via HIE-CM gateway
4. **ACK**: HIP → HIE-CM: `POST /v3/on-share`

### 9.5 Error Codes
53 error codes covering invalid QR, expired session, patient mismatch, etc.

---

## 10. Scan & Pay

### 10.1 Purpose
Patient pays facility bill by scanning QR code in PHR app, using the facility's own payment gateway.

### 10.2 Actors
- PHR App (patient)
- HIE-CM Gateway
- HIP/HMIS (facility)

### 10.3 Flow

1. **Scan QR** → PHR app extracts `hipId` + `counterId`
2. **Open Order**: `POST /v3/patient/share/open-order` (PHR → HIE-CM)
3. **Callback**: HIE-CM → HIP: `POST {callback}/v3/patient/share/open-order`
4. **Response**: HIP → HIE-CM: `POST /v3/patient/on-share/open-order` (includes outstanding amount + bill items)
5. **Patient Selection**: Patient selects services to pay for
6. **Patient Share Notify**: HIP notified of selection
7. **Payment**: Patient pays via HMIS payment gateway
8. **Status Check**: `POST /v3/patient/share/order-status`

### 10.4 APIs

| API | Method | From → To |
|---|---|---|
| Share Open Order | `POST /v3/patient/share/open-order` | PHR → HIE-CM |
| On Share Open Order Callback | `POST {callback}/v3/patient/share/open-order` | HIE-CM → HIP |
| On Share Open Order | `POST /v3/patient/on-share/open-order` | HIP → HIE-CM |
| Patient Selection | (internal HMIS UI) | Patient selects services |
| Patient Share Notify | `POST /v3/patient/share/notify` | PHR → HIE-CM → HIP |
| Get All Details | `GET /v3/patient/share/details` | PHR → HIE-CM |
| Update Scan & Pay Version | `PUT /v3/patient/share/version` | HIP → HIE-CM |
| Get All Provider Details | `GET /v3/patient/share/provider-details` | PHR → HIE-CM |
| Patient Share Order Status | `POST /v3/patient/share/order-status` | PHR → HIE-CM |

---

## 11. Running Token Status

### 11.1 Purpose
Patient checks current queue/token status at a facility via PHR app, avoiding physical presence.

### 11.2 Flow

1. **Request Token Status**: `POST /v3/running-token/status` (PHR → HIE-CM)
   - `{hipId, counterId, patientId}`
2. **Callback**: HIE-CM → HIP: `POST {callback}/v3/hip/patient/running-token/status`
3. **Response**: HIP → HIE-CM: `POST /v3/running-token/on-status`
   - Returns: `{tokenNumber, estimatedWaitTime, averageServiceTime}`

---

## 12. NHPR — Health Professional Registry

### 12.1 HPR (Healthcare Professional Registry) APIs

#### Registration
| Step | API |
|---|---|
| Init Aadhaar OTP | `POST /hpr/v3/aadhaar/otp/generate` |
| Verify Aadhaar OTP | `POST /hpr/v3/aadhaar/otp/verify` |
| Verify Mobile | `POST /hpr/v3/mobile/verify` |
| Get Suggested Username | `POST /hpr/v3/username/suggest` |
| Create HPRID | `POST /hpr/v3/hprid/create` |
| Search Facility | `POST /hpr/v3/facility/search` |
| Register Professional | `POST /hpr/v3/professional/register` |
| Upload Documents | `POST /hpr/v3/document/upload` |

#### Profile Management
| Operation | API |
|---|---|
| Fetch Professional Details | `GET /hpr/v3/professional/details` |
| Update Professional | `PUT /hpr/v3/professional/update` |
| Update Documents | `PUT /hpr/v3/document/update` |
| Generate Email Link | `POST /hpr/v3/email/link/generate` |
| Verify Mobile OTP | `POST /hpr/v3/mobile/otp/verify` |

#### Authentication
| Operation | API |
|---|---|
| Login | `POST /hpr/v3/auth/login` |
| Logout | `POST /hpr/v3/auth/logout` |
| Get ID Card | `GET /hpr/v3/id-card` |
| Change Password | `POST /hpr/v3/auth/password/change` |
| Forgot HPRID | `POST /hpr/v3/auth/forgot/hprid` |
| Search HPRID | `POST /hpr/v3/auth/search/hprid` |

### 12.2 Master Data APIs
| Resource | API |
|---|---|
| System of Medicine | `GET /master/systemOfMedicine` |
| Medical Councils | `GET /master/medicalCouncils` |
| Languages | `GET /master/languages` |
| Universities | `GET /master/universities` |
| Courses | `GET /master/courses` |
| Colleges | `GET /master/colleges` |
| Countries | `GET /master/countries` |
| States/Districts | `GET /master/states`, `GET /master/districts` |
| HPRID Categories | `GET /master/hpridCategories` |

---

## 13. HFR — Health Facility Registry

### 13.1 HFR APIs

| Operation | API |
|---|---|
| Search Facility | `POST /hfr/v4/facility/search` |
| Create Facility | `POST /hfr/v4/facility/create` |
| Get Facility Details | `GET /hfr/v4/facility/{id}` |
| Register Facility | `POST /hfr/v4/facility/register` |
| Software Linkage | `POST /hfr/v4/facility/software-linkage` |
| Search Ownership Codes | `GET /hfr/v4/master/ownership-codes` |
| Get States | `GET /hfr/v4/master/states` |
| Get Districts | `GET /hfr/v4/master/districts/{stateId}` |

### 13.2 Swagger
`https://apihspsbx.abdm.gov.in/v4/int/swagger-ui/index.html`

---

## 14. UHI — Universal Health Interface

### 14.1 Architecture
UHI is an open protocol based on the **Beckn protocol** framework for digital health service discovery and booking.

### 14.2 Actors

| Actor | Description |
|---|---|
| **EUA** | End User Application (patient-facing app) |
| **HSPA** | Health Service Provider Application (provider-facing app) |
| **Gateway** | Routes requests between EUA and HSPA |
| **Network Registry** | Onboarding & participant registry |

### 14.3 Protocol Flow (Beckn-based)

1. **Search** → `POST /search` (EUA → Gateway)
2. **On Search** → `POST /on_search` (HSPA → Gateway → EUA)
3. **Select** → `POST /select` (EUA selects provider/service)
4. **On Select** → `POST /on_select` (Provider confirms availability)
5. **Init** → `POST /init` (EUA initiates booking)
6. **On Init** → `POST /on_init` (Provider returns quote)
7. **Confirm** → `POST /confirm` (EUA confirms booking)
8. **On Confirm** → `POST /on_confirm` (Provider confirms)
9. **Status** → `POST /status` (EUA checks status)
10. **Cancel** → `POST /cancel` (EUA cancels)

### 14.4 Security
- **Key Algorithm**: Ed25519 (signing)
- **Hash Algorithm**: BLAKE2B-512
- **Headers**: Signed headers for all protocol messages

### 14.5 Components (from source code)
| Component | Technology | Purpose |
|---|---|---|
| `src/gateway/` | Spring Cloud Gateway + WebFlux | Central routing + discovery |
| `src/network_registry/` | Spring Boot | Participant registry |
| `src/apps/client/` | Flutter | EUA (patient) + HSPA (provider) |

### 14.6 Schema Messages
Ack, Address, Agent, Billing, Catalog, Catalog, Context, Fulfillment, Intent, Item, Order, Payment, Person, Provider, Rating, Review, Schedule, Settlement, etc.

---

## 15. NHCX — National Health Claims Exchange

### 15.1 Purpose
Standardizes health insurance claim exchanges digitally between providers, insurers, and TPAs.

### 15.2 Key Components

| Component | Description |
|---|---|
| **Onboarding APIs** | Register participants (providers, insurers, TPAs) |
| **Participant APIs** | Submit claims, check status, query benefits |
| **AWS Sandbox** | Postman collections for testing |

### 15.3 Claims Flow
1. Provider submits claim via NHCX
2. NHCX routes to appropriate insurer/TPA
3. Insurer processes and responds
4. NHCX relays response to provider

---

## 16. DHP — Decentralized Health Protocol

### 16.1 Purpose
Precursor protocol to UHI. Forked from iSPIRT's Beckn protocol framework.

### 16.2 Key Proposals
- **DHP-001**: Network Reference Architecture
- **DHP-002**: Digital OPD Flow (discovery → booking → consultation)

### 16.3 Status
Historical/archived — superseded by UHI.

### 16.4 Technology
- **Beckn version**: 0.9.3
- **Protocol version**: 0.7.1

---

## 17. ABDM Wrapper (Spring Boot)

### 17.1 Purpose
Spring Boot wrapper that abstracts M2 & M3 gateway complexity behind clean REST interfaces.

### 17.2 Architecture

| Component | Purpose |
|---|---|
| **fhir-mapper** | FHIR R4 resource generation using HAPI FHIR |
| **mock-gateway** | Lightweight ABDM gateway mock for local testing |
| **sample-hiu** | Sample HIU client with auto-generated OpenAPI client |

### 17.3 Wrapper APIs

| API | Method | Purpose |
|---|---|---|
| `/v1/consent-init` | POST | Initiate consent request |
| `/v1/consent-status/{requestId}` | GET | Check consent request status |
| `/v1/health-information/fetch-records` | POST | Request health records |
| `/v1/health-information/status/{requestId}` | GET | Check data transfer status |

### 17.4 HI Types (Enum)
`OPConsultation`, `Prescription`, `DischargeSummary`, `DiagnosticReport`, `ImmunizationRecord`, `HealthDocumentRecord`, `WellnessRecord`

---

## 18. ABHA App (Flutter)

### 18.1 Components

| Component | Technology | Purpose |
|---|---|---|
| `aadhaar_rd_services/` | Flutter plugin | Aadhaar face auth RD service integration |
| `qrcode_flutter-master/` | Flutter plugin | QR code scanning (Android/iOS/Web) |
| App shell | Flutter | Basic ABHA app UI structure |

---

## 19. Common Patterns & Requirements

### 19.1 Mandatory Headers for All API Calls

| Header | Format | Example |
|---|---|---|
| `REQUEST-ID` | UUID v4 | `550e8400-e29b-41d4-a716-446655440000` |
| `TIMESTAMP` | ISO 8601 | `2026-06-04T10:30:00+05:30` |
| `X-CM-ID` | string | `sbx` or `abdm` |

### 19.2 Authentication Patterns
1. **Gateway Token**: OAuth2 Client Credentials → JWT from Keycloak
2. **ABHA Token**: JWT issued after login/verify
3. **PHR Token**: JWT issued by PHR auth server

### 19.3 Encryption Requirements

| Use Case | Algorithm | Details |
|---|---|---|
| Aadhaar/Aadhaar encryption | `RSA/ECB/OAEPWithSHA-1AndMGF1Padding` | 2048-bit RSA key |
| Health data encryption | **ECDH** with Curve25519 | Key exchange + AES-256-GCM |
| HMAC signatures | HMAC-SHA256 | Webhook/signature verification |

### 19.4 Certification Requirements

| Milestone | AND Certification |
|---|---|
| M1 | Required for ABHA integration |
| M2 | Required for HIP/HIU operations |
| M3 | Required for consent management |
| ALL | Mandatory for production deployment |

### 19.5 Rate Limits & Constraints
| Constraint | Limit |
|---|---|
| ABHA creations per client (sandbox) | 100 |
| ABHA addresses per ABHA number | 6 |
| ABHA numbers per mobile | 6 |
| Link token validity | 5 minutes |
| Face auth txnId validity | 10 minutes |

### 19.6 HI Types Required by Participant Category

| Participant | Required HI Types |
|---|---|
| HMIS | All 8 |
| LMIS | As applicable |
| Pharmacy | All 8 |
| PHR App | All 8 |
| Insurance | As applicable |

### 19.7 Error Response Format
```json
{
  "code": "ABDM-1227",
  "message": "Maximum limit reached for ABHA creation",
  "details": {}
}
```

### 19.8 Key ABDM URLs

| Resource | URL |
|---|---|
| ABHA Sandbox | `https://abhasbx.abdm.gov.in` |
| ABHA Production | `https://apis.abdm.gov.in` |
| HFR Swagger | `https://apihspsbx.abdm.gov.in/v4/int/swagger-ui/index.html` |
| PHR Sandbox | `https://abhasbx.abdm.gov.in/abha/api/v3/phr/app/` |
| PHR Production | `https://apis.abdm.gov.in/phr/api/phr/app/v3/` |
| Face Auth Portal | `https://phrsbx.abdm.gov.in/face-auth` |
| Keycloak Realm | `/auth/realms/abdm` |

### 19.9 Integration Checklist

- [ ] Bridge registration with ABDM gateway
- [ ] Facility registration in HFR
- [ ] Software linkage with ABDM
- [ ] AND certification (M1, M2, M3)
- [ ] RSA key pair generation for Aadhaar encryption
- [ ] ECDH key pair generation for health data
- [ ] FHIR R4 mapping for all 8 HI types
- [ ] Consent management flow (M3)
- [ ] Care context linking (M2)
- [ ] Scan & share / scan & pay (M2)
- [ ] Webhook callback endpoints registered with gateway
- [ ] SMS notification integration
