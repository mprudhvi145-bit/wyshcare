# WyshCare — National Platform Readiness Report

> Generated: June 4, 2026
> Assessment based on codebase audit + ABDM requirements analysis

---

## 1. Executive Summary

| Readiness Dimension | Score | Status |
|---|---|---|
| ABDM-compliant HIP | **28%** | 🟡 Early stage |
| ABDM-compliant HIU | **22%** | 🔴 Early stage |
| ABDM-compliant PHR | **35%** | 🟡 Moderate |
| UHI Participant | **15%** | 🔴 Early stage |
| NHCX Participant | **5%** | 🔴 Not started |
| **Overall National Platform Readiness** | **21%** | 🔴 Foundational |

---

## 2. HIP (Health Information Provider) Readiness — 28%

### 2.1 Score Breakdown

| Requirement | Weight | Score | Evidence |
|---|---|---|---|
| Patient identity management | 15% | 70% | WyshCare has `User` with wyshId, phone verification, roles — needs ABHA adoption |
| Health record storage | 15% | 80% | `HealthRecord` model with file upload, storage, versioning — solid foundation |
| Appointment management | 10% | 90% | `Appointment` with slot management, status tracking — near complete |
| Clinical documentation | 10% | 20% | Consultation notes not built, no structured clinical data entry |
| Prescription management | 10% | 40% | `Prescription` + `Medication` models exist but no doctor-facing creation UI |
| Lab/DIagnostics management | 10% | 60% | `DiagnosticReport`, `DiagnosticOrder` exist but reporting flow incomplete |
| FHIR R4 data export | 15% | 0% | **Complete gap** — no FHIR serialization anywhere |
| ABDM gateway integration | 10% | 0% | No gateway registration, no bridge URL, no OAuth2 token exchange |
| Care context management | 5% | 0% | No `CareContext` model, no linking flow |
| ECDH encryption for health data | 10% | 0% | No ECDH implementation |

### 2.2 HIP Strengths (What Exists)
- `User` model with comprehensive patient profile (wyshId, phone, ABHA address placeholder)
- `HealthRecord` with file upload, storage driver, MIME validation, virus scanning
- `Appointment` with full lifecycle (CONFIRMED, CHECKED_IN, IN_PROGRESS, COMPLETED, CANCELLED)
- `DoctorProfile` with specializations, qualifications, languages, fee
- `Clinic` with address, geolocation
- `Prescription` and `Medication` models
- `DiagnosticReport` and `DiagnosticOrder`
- `TimelineEvent` for longitudinal health data
- `AuditLog` for all operations
- `StorageService` (local + S3) with signed download URLs
- `RazorpayService` for payment processing

### 2.3 HIP Gaps (What's Missing)
- FHIR R4 serialization for all 8 HI types (0% complete)
- ABDM gateway bridge registration
- HFR facility registration
- Care context creation and linking
- ECDH key management for health data encryption
- Health data push to gateway (`POST /v3/health-information/notify`)
- Clinical notes entry (doctor-side)
- ICD-11 / custom diagnosis coding

---

## 3. HIU (Health Information User) Readiness — 22%

### 3.1 Score Breakdown

| Requirement | Weight | Score | Evidence |
|---|---|---|---|
| Consent-based data access | 20% | 50% | Custom `ConsentGrant` model exists — compatible architecture |
| Consent artefact management | 15% | 10% | No ABDM consent artefact integration |
| Health data request/transfer | 15% | 0% | No data request flow to gateway |
| FHIR R4 data consumption | 15% | 0% | No FHIR parsing capability |
| ECDH decryption | 10% | 0% | No ECDH decryption |
| Patient discovery | 10% | 20% | Basic patient search but no ABHA-based discovery |
| Subscription management | 10% | 0% | No subscription flow |
| Audit trail for data access | 5% | 80% | `AuditLogService` captures all data access events |

### 3.2 HIU Strengths
- `ConsentGrant` with access levels, methods, purposes, expiry
- `AuditLogService` with comprehensive logging (actor, patient, action, resource)
- `ShareLink` for delegated access
- `EmergencyAccess` for break-glass scenarios
- Patient identity API (`/identity/me`, `/identity/dashboard`)
- Timeline and record listing APIs

### 3.3 HIU Gaps
- No consent artefact fetch from ABDM gateway
- No ABDM-purpose-coded consent requests (PATRQT, CAREMGT, BTG, etc.)
- No HI type selection in consent creation
- No ECDH key exchange for receiving health data
- No FHIR bundle parsing
- No subscription to care context LINK/DATA events
- No patient discovery by ABHA address

---

## 4. PHR (Personal Health Record) Readiness — 35%

### 4.1 Score Breakdown

| Requirement | Weight | Score | Evidence |
|---|---|---|---|
| Patient authentication | 15% | 70% | Phone OTP auth is mature — needs ABHA login methods |
| Patient profile management | 10% | 80% | Profile with roles, preferences, emergency info |
| Health record upload & storage | 15% | 85% | File upload, MIME validation, storage driver — strong |
| Health record viewing & download | 10% | 80% | Download with signed URLs, prescription list |
| QR code generation | 10% | 70% | `identity/qr` exists — needs ABDM QR format |
| ABDM consent management UI | 10% | 40% | Consent list + create + revoke — needs gateway |
| ABHA linkage | 10% | 10% | `POST /abdm/link` stub exists |
| Care context management | 5% | 0% | No care context view |
| Scan & Share | 5% | 0% | Not implemented |
| Multi-language support | 5% | 50% | `preferredLanguage` on User — no actual i18n |
| Face auth / biometric login | 5% | 0% | Not implemented |
| Emergency access | 5% | 60% | `EmergencyAccess` model + `identity/qr?emergency=true` |

### 4.2 PHR Strengths
- Complete mobile-responsive web app (Next.js 15)
- OTP-based login with JWT session management
- Full dashboard with timeline, alerts, care team
- Health record upload + download with signed URLs
- Prescription listing
- Doctor discovery and appointment booking
- Pharmacy order placement
- Diagnostic test booking + report upload
- Consent creation and revocation UI
- Family member management
- QR code generation
- Zustand session store with `sessionStorage`
- CSRF-protected API client with auto-refresh
- Middleware for route protection
- TanStack Query for data fetching

### 4.3 PHR Gaps
- No ABHA number login option on login screen
- No ABHA creation flow
- No face auth login
- No ABDM QR code format
- No Scan & Share QR scanner
- No care context visualization
- No consent artefact viewing
- No multi-language UI (English only)
- No offline support
- No PWA install prompt
- No biometric/FaceID for mobile web

---

## 5. UHI (Universal Health Interface) Readiness — 15%

### 5.1 Score Breakdown

| Requirement | Weight | Score | Evidence |
|---|---|---|---|
| Service discovery | 20% | 60% | `GET /discovery` exists — needs UHI catalog format |
| Appointment booking | 15% | 70% | `POST /telemedicine/appointments` exists |
| Beckn protocol support | 20% | 0% | No Beckn message format, no `POST /search` handler |
| Ed25519 signing | 15% | 0% | No Ed25519 key management |
| BLAKE2B-512 hashing | 10% | 0% | Not available |
| HSPA registration | 10% | 0% | Not registered as HSPA |
| Provider catalog | 10% | 50% | Doctor profiles exist — needs UHI catalog mapping |

### 5.2 UHI Strengths
- Doctor search with query/specialty filtering
- Appointment creation with slot management
- Doctor profile with specialization, rating, fee, telemedicine flag
- Clinic information

### 5.3 UHI Gaps
- No Beckn protocol message support
- No Ed25519 key pair generation
- No BLAKE2B hashing
- No UHI gateway registration
- No HSPA participant onboarding
- No `POST /search` → `POST /on_search` flow
- No `POST /confirm` → `POST /on_confirm` flow

---

## 6. NHCX (National Health Claims Exchange) Readiness — 5%

### 6.1 Score Breakdown

| Requirement | Weight | Score | Evidence |
|---|---|---|---|
| Participant registration | 20% | 0% | Not started |
| Claim submission | 25% | 0% | Not started |
| Benefits query | 15% | 0% | Not started |
| Claim status tracking | 20% | 0% | Not started |
| Document upload for claims | 20% | 25% | File upload infrastructure exists |

### 6.2 NHCX Strengths
- File upload infrastructure (`StorageService`, MIME validation, virus scanning)
- Razorpay payment processing (for premium collection)
- Audit logging infrastructure

### 6.3 NHCX Gaps
- No insurance/TTPA participant model
- No claim data model
- No NHCX API integration
- No insurance benefits query
- No claim status tracking
- No EOB (Explanation of Benefits) processing

---

## 7. Readiness by ABDM Module

| Module | Score | Assessment |
|---|---|---|
| ABHA Creation (M1) | 10% | Foundation missing — Aadhaar integration, RSA encryption |
| ABHA Login/Verification (M1) | 15% | Mobile OTP exists — 7+ other methods missing |
| ABHA Profile (M1) | 15% | WyshCare profile exists — ABHA sync missing |
| Gateway Integration (M2) | 5% | No bridge, no facility registration |
| HIP Linking (M2) | 5% | No care context linking |
| HIU Patient Discovery (M2) | 10% | No ABHA-based discovery |
| Data Flow — HIP Push (M2/M3) | 5% | No FHIR, no encryption, no notify |
| Data Flow — HIU Pull (M2/M3) | 5% | No consent artefact, no decrypt |
| Consent Gateway (M3) | 25% | Consent model exists — gateway sync missing |
| Subscription (M3) | 0% | Not started |
| HPR Registration | 20% | Doctor profiles exist — HPRID missing |
| HFR Registration | 20% | Clinic model exists — HFR ID missing |
| Scan & Share | 5% | QR exists — ABDM share flow missing |
| Scan & Pay | 0% | Not started |
| UHI Protocol | 15% | Discovery + booking exist — protocol missing |
| NHCX Claims | 5% | File upload exists — claims missing |

---

## 8. Readiness by WyshCare Module

| WyshCare Module | ABDM Readiness | Gap |
|---|---|---|
| `auth` | 20% | Needs ABHA login methods |
| `identity` | 25% | Needs ABHA profile sync |
| `consent` | 30% | Gateway integration needed |
| `vault` | 20% | FHIR export needed |
| `telemedicine` | 20% | FHIR Encounter mapping |
| `payments` | 10% | NHCX claim support |
| `pharmacy` | 15% | FHIR MedicationDispense |
| `diagnostics` | 15% | FHIR DiagnosticReport |
| `doctors` | 25% | HPRID integration |
| `discovery` | 20% | UHI catalog mapping |
| `family` | 10% | Care context sharing |
| `interoperability` | 5% | Stub only — needs full ABDM |
| `ai` | 0% | No ABDM AI use cases yet |
| `notifications` | 20% | ABDM SMS callbacks |
| `timeline` | 15% | FHIR timeline mapping |
| `admin` | 5% | ABDM compliance dashboard |
| `metrics` | 10% | ABDM audit metrics |

---

## 9. Recommendations by Priority

### P0 — Mandatory for ABDM Certification
1. **FHIR R4 mapper** — Foundation for ALL ABDM data exchange
2. **ABDM gateway client** — OAuth2 + bridge registration
3. **RSA encryption service** — Required for Aadhaar data (M1)
4. **ABHA creation flow** — Aadhaar OTP method (M1 certification)
5. **HFR facility registration** — Required for HIP certification
6. **AND certification testing** — Complete M1, M2, M3 test suites

### P1 — Mandatory for Production Launch
7. **Consent gateway integration** — M3 consent artefact flow
8. **ECDL encryption service** — Curve25519 + AES-256-GCM
9. **Care context model + linking** — M2 patient linking
10. **HPR professional registration** — Doctor HPRID
11. **ABHA login methods** — Multi-factor auth options
12. **Scan & Share** — QR profile sharing

### P2 — National Scale Enhancements
13. **UHI protocol implementation** — Open network participation
14. **Subscription management** — LINK + DATA subscriptions
15. **Scan & Pay** — QR bill payment
16. **Multi-language UI** — Hindi + regional languages
17. **NHCX claim submission** — Insurance claims

### P3 — Future Ecosystem Features
18. **Face auth login** — Biometric ABHA login
19. **ABHA card generation** — Printable ABHA card
20. **NHCX benefits query** — Insurance coverage check
21. **UHI catalog management** — Full provider catalog sync
22. **AI-powered ABDM data analysis** — Population health insights
