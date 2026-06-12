# WyshCare — Current Platform Capabilities

> Generated: June 4, 2026
> Source code audit of `backend/`, `frontend/`, `shared/`, and `prisma/`

---

## 1. Platform Overview

| Attribute | Value |
|---|---|
| **Architecture** | NestJS modular monolith (REST + GraphQL + WebSocket) |
| **Frontend** | Next.js 15 App Router, React 19, Tailwind CSS v4 |
| **Database** | PostgreSQL via Prisma ORM (25+ models) |
| **Cache** | Redis (ioredis) |
| **API Prefix** | `/api/v1` |
| **Auth** | Phone-OTP, JWT (access 1h + refresh 30d), httpOnly cookies, CSRF |
| **GraphQL** | Apollo Driver (playground off in production) |
| **Real-time** | Socket.IO (notifications namespace) |
| **Payments** | Razorpay |
| **Video** | LiveKit |
| **AI** | Google Gemini |
| **Storage** | Local filesystem or AWS S3 |
| **Ports** | Backend:3001, Frontend:3000 |

---

## 2. Backend Architecture

### 2.1 Module Map (18 modules)

| Module | Routes | Guard | Purpose |
|---|---|---|---|
| **Auth** | `/auth/*` (11 routes) | Public + JwtAuthGuard | OTP auth, JWT session, device mgmt |
| **Identity** | `/identity/*` (3 routes) | JwtAuthGuard | Profile, dashboard, QR generation |
| **Consent** | `/consents/*` (3 routes) | JwtAuthGuard | Data sharing consent (ABDM-style) |
| **Vault** | `/vault/*` (6 routes) | JwtAuthGuard | PHR storage, uploads, prescriptions |
| **AI** | `/ai/*` (2 routes) + GraphQL | JwtAuthGuard | Symptom triage, report summarization |
| **Doctors** | `/doctors/*` (2 routes) | Public + JwtAuthGuard | Doctor profiles, onboarding |
| **Discovery** | `/discovery` + GraphQL | Public | Search doctors by query/specialty |
| **Telemedicine** | `/telemedicine/*` (3 routes) | JwtAuthGuard | Appointments, LiveKit sessions |
| **Payments** | `/payments/*` (4 routes) | JwtAuthGuard + Public | Razorpay orders, webhooks, refunds |
| **Pharmacy** | `/pharmacy/*` (3 routes) | Public + JwtAuthGuard | Partners, orders |
| **Diagnostics** | `/diagnostics/*` (5 routes) | Public + JwtAuthGuard | Lab partners, orders, reports |
| **Admin** | `/admin/*` (1 route) | JwtAuthGuard + RolesGuard(ADMIN) | Platform overview |
| **Notifications** | Gateway: `/notifications` | WebSocket | In-app push via Socket.IO |
| **Timeline** | `/timeline` (1 route) | JwtAuthGuard | Longitudinal health timeline |
| **Interoperability** | `/abdm/*` (1 route) | JwtAuthGuard | ABHA address linkage (ABDM) |
| **Family** | `/family/*` (2 routes) | JwtAuthGuard | Family member management |
| **Search** | _(empty — scaffolded)_ | — | Not yet implemented |
| **Health** | _(empty — scaffolded)_ | — | Not yet implemented |

### 2.2 REST API Endpoints (full list)

| Method | Path | Module | Auth |
|---|---|---|---|
| GET | `/health` | Health | Public |
| GET | `/metrics` | Metrics | Public |
| GET | `/auth/csrf` | Auth | Public |
| POST | `/auth/login` | Auth | Public |
| POST | `/auth/register` | Auth | Public |
| POST | `/auth/otp/request` | Auth | Public |
| POST | `/auth/otp/verify` | Auth | Public |
| POST | `/auth/refresh` | Auth | Public |
| GET | `/auth/me` | Auth | JWT |
| POST | `/auth/logout` | Auth | JWT |
| GET | `/auth/sessions` | Auth | JWT |
| PATCH | `/auth/sessions/:id/revoke` | Auth | JWT |
| GET | `/identity/me` | Identity | JWT |
| GET | `/identity/dashboard` | Identity | JWT |
| GET | `/identity/qr` | Identity | JWT |
| GET | `/consents` | Consent | JWT |
| POST | `/consents` | Consent | JWT |
| PATCH | `/consents/:id/revoke` | Consent | JWT |
| GET | `/vault/records` | Vault | JWT |
| POST | `/vault/records` | Vault | JWT |
| POST | `/vault/records/upload` | Vault | JWT |
| GET | `/vault/records/:id/download-url` | Vault | JWT |
| GET | `/vault/records/:id/download` | Vault | Public (signed) |
| GET | `/vault/prescriptions` | Vault | JWT |
| POST | `/ai/symptom-analysis` | AI | JWT |
| POST | `/ai/report-summary` | AI | JWT |
| GET | `/doctors` | Doctors | Public |
| POST | `/doctors/onboarding` | Doctors | JWT |
| GET | `/discovery` | Discovery | Public |
| GET | `/telemedicine/appointments` | Telemedicine | JWT |
| POST | `/telemedicine/appointments` | Telemedicine | JWT |
| POST | `/telemedicine/appointments/:id/session` | Telemedicine | JWT |
| POST | `/payments/consultations` | Payments | JWT |
| POST | `/payments/pharmacy/:orderId` | Payments | JWT |
| POST | `/payments/webhooks/razorpay` | Payments | Public |
| POST | `/payments/:orderId/refund` | Payments | JWT |
| GET | `/pharmacy/partners` | Pharmacy | Public |
| GET | `/pharmacy/orders` | Pharmacy | JWT |
| POST | `/pharmacy/orders` | Pharmacy | JWT |
| GET | `/diagnostics/partners` | Diagnostics | Public |
| GET | `/diagnostics/orders` | Diagnostics | JWT |
| POST | `/diagnostics/orders` | Diagnostics | JWT |
| GET | `/diagnostics/reports` | Diagnostics | JWT |
| POST | `/diagnostics/reports/upload` | Diagnostics | JWT |
| GET | `/timeline` | Timeline | JWT |
| POST | `/abdm/link` | Interoperability | JWT |
| GET | `/family` | Family | JWT |
| POST | `/family` | Family | JWT |
| GET | `/admin/overview` | Admin | JWT + ADMIN |

### 2.3 GraphQL Resolvers

| Query | Module | Return Type |
|---|---|---|
| `symptomTriage(text, languageCode?)` | AI | `SymptomAnalysis` |
| `searchProviders(query?)` | Discovery | `[DiscoveryResult]` |

### 2.4 WebSocket Gateways

| Namespace | Events | Purpose |
|---|---|---|
| `/notifications` | `user:{userId}` | Real-time in-app notifications |

---

## 3. Database Schema (25+ models)

### 3.1 Core Identity
| Model | Key Fields | Purpose |
|---|---|---|
| **User** | `id, wyshId, phoneNumber, fullName, preferredLanguage, bloodGroup, chronicConditions[], allergiesSummary[], abhaAddress?, faceAuthEnabled?` | Patient/doctor identity |
| **UserRole** | `userId, role (enum)` | Role assignment |
| **DeviceSession** | `id, userId, deviceName, deviceFingerprint, ipAddress, userAgent, lastSeenAt, expiresAt, revokedAt` | Login sessions |
| **RefreshToken** | `id, userId, deviceId, tokenHash, expiresAt, revokedAt` | Refresh token store |

### 3.2 Auth
| Model | Key Fields | Purpose |
|---|---|---|
| **OtpChallenge** | `id, phoneNumber, otpHash, purpose, channel, attemptCount, expiresAt, verifiedAt` | OTP verification |
| **ProviderProfile** | `id, userId, kycStatus, verificationStatus, verifiedByIdNumber` | Provider KYC |

### 3.3 Healthcare Providers
| Model | Key Fields | Purpose |
|---|---|---|
| **DoctorProfile** | `id, userId, specializations[], qualifications[], languages[], yearsOfExperience, consultationFee, registrationNumber, medicalCouncil` | Doctor details |
| **Clinic** | `id, name, slug, phoneNumber, addressLine1, city, state, pincode, lat, lng, languages[]` | Clinic locations |
| **DoctorClinic** | `doctorId, clinicId, slotTemplate (JSON)` | Doctor-clinic mappings |

### 3.4 Consent & Privacy
| Model | Key Fields | Purpose |
|---|---|---|
| **ConsentGrant** | `id, patientUserId, grantedToUserId, accessLevel (enum), accessMethod (enum), purpose, scope (JSON), status, expiresAt` | Data sharing consent |
| **ShareLink** | `id, consentGrantId, token, active` | Shareable consent links |
| **EmergencyAccess** | `id, patientUserId, accessedByUserId, reason, accessAt, geoCoordinates` | Emergency data access |

### 3.5 Health Records (PHR)
| Model | Key Fields | Purpose |
|---|---|---|
| **HealthRecord** | `id, userId, recordType (enum), title, description, storageKey, mimeType, fileSize, hash, recordedAt, source, version` | Personal health records |
| **Prescription** | `id, healthRecordId, doctorProfileId, appointmentId, diagnosisSummary, instructions, refillDueAt` | Digital prescriptions |
| **Medication** | `id, prescriptionId, name, dosage, frequency, duration, instructions` | Medication entries |
| **DiagnosticReport** | `id, healthRecordId, reportType, summary, abnormalMarkers[], trends[]` | Lab report data |

### 3.6 Timeline
| Model | Key Fields | Purpose |
|---|---|---|
| **TimelineEvent** | `id, userId, eventType (enum), title, summary, occurredAt, metadata (JSON)` | Life-log of health events |

### 3.7 Telemedicine
| Model | Key Fields | Purpose |
|---|---|---|
| **Appointment** | `id, patientUserId, doctorUserId, doctorProfileId, clinicId, consultationMode (enum), status (enum), reason, slotStartAt, slotEndAt` | Consultation bookings |
| **ConsultationSession** | `id, appointmentId, doctorProfileId, patientUserId, livekitRoomName, startedAt, endedAt, transcriptUrl, aiSummaryId` | Video sessions |
| **ConsultationSummary** | `id, sessionId, summary, followUpTasks[], medicationsPrescribed[]` | Post-consultation summaries |

### 3.8 Payments
| Model | Key Fields | Purpose |
|---|---|---|
| **PaymentOrder** | `id, userId, orderType (enum), amount, providerShareAmount, platformFeeAmount, status (enum), providerReference, capturedAt, refundAmount` | Payment processing |

### 3.9 Commerce
| Model | Key Fields | Purpose |
|---|---|---|
| **PharmacyPartner** | `id, name, city, address, supportsDelivery, deliveryRadius` | Pharmacy directory |
| **PharmacyOrder** | `id, userId, partnerId, prescriptionId, status (enum), quotedTotal, deliveryAddress (JSON), medicinePayload (JSON)` | Medicine orders |
| **DiagnosticsPartner** | `id, name, city, address, homeCollection, accreditation` | Lab directory |
| **DiagnosticOrder** | `id, userId, partnerId, status (enum), testCodes[], homeCollection, slotStartAt, slotEndAt, notes` | Lab test orders |

### 3.10 Family & Social
| Model | Key Fields | Purpose |
|---|---|---|
| **FamilyRelation** | `id, userId, relatedUserId, relationship (enum), permissions (JSON)` | Family links |

### 3.11 Notifications
| Model | Key Fields | Purpose |
|---|---|---|
| **Notification** | `id, userId, templateKey, payload (JSON), channel (enum), status (enum), readAt` | In-app notifications |

### 3.12 AI & Memory
| Model | Key Fields | Purpose |
|---|---|---|
| **AIMemoryNode** | `id, userId, nodeType, content, embedding, createdAt` | AI context memory |
| **AIMemoryEdge** | `sourceId, targetId, relationship` | Memory graph edges |
| **AIJob** | `id, userId, jobType (enum), status (enum), input, output, error` | Async AI processing |

### 3.13 Auditing
| Model | Key Fields | Purpose |
|---|---|---|
| **AuditLog** | `id, actorUserId, patientUserId, consentGrantId, resourceType, resourceId, action, metadata (JSON), createdAt` | Immutable audit trail |

### 3.14 ABDM Integration
| Model | Key Fields | Purpose |
|---|---|---|
| **ABDMLinkage** | `id, userId, abhaAddress, abhaNumberMasked?, linkedAt` | ABHA address linkage |

---

## 4. Security Architecture

| Layer | Implementation |
|---|---|
| **AuthN** | Phone OTP → JWT (access + refresh) → httpOnly cookies |
| **AuthZ** | JwtAuthGuard (signed JWT + session validation) + RolesGuard (role-based) |
| **CSRF** | HMAC-sha256 double-submit cookie pattern |
| **Rate Limiting** | 120 req/60s global + 5 OTP challenge limit |
| **File Upload** | MIME whitelist (PDF/PNG/JPEG/WEBP/TXT), 10MB max, virus scan hook |
| **Download** | HMAC-signed expiring URLs |
| **Payment Webhooks** | HMAC-sha256 signature verification |
| **Headers** | Helmet (CSP, XSS, etc.) |
| **Audit** | Comprehensive AuditLog for auth/consent/session operations |

---

## 5. Frontend Routes & Features

| Route | Page | Feature | API Calls Used |
|---|---|---|---|
| `/` | Landing | Marketing hero | None |
| `/login` | OTP Login | Auth | `requestOtp`, `verifyOtp` |
| `/app` | Dashboard | Patient home | `getDashboard`, `getEmergencyQr` |
| `/app/records` | WyshVault | Records & prescriptions | `getRecords`, `uploadRecord`, `getPrescriptions`, `getRecordDownloadUrl` |
| `/app/discovery` | Doctor Search | Discovery & booking | `searchDoctors`, `createAppointment`, `createTelemedicineSession` |
| `/app/diagnostics` | Lab Tests | Diagnostics | `getDiagnosticsPartners`, `createDiagnosticsOrder`, `uploadDiagnosticReport` |
| `/app/pharmacy` | WyshPharma | Pharmacy | `getPharmacyPartners`, `createPharmacyOrder` |
| `/app/consent` | Consent | Data sharing | `getConsents`, `createConsent`, `revokeConsent` |
| `/app/family` | Family | Care team | `getFamily`, `createFamilyLink` |
| `/doctor` | Doctor Workspace | Placeholder | None |
| `/admin` | Admin Dashboard | Placeholder | None |

---

## 6. External Integrations

| Integration | Provider | Purpose | Module |
|---|---|---|---|
| **SMS** | Twilio / MSG91 | OTP delivery | Auth |
| **Payments** | Razorpay | Payment processing | Payments |
| **Video** | LiveKit | Telemedicine sessions | Telemedicine |
| **AI** | Google Gemini | Symptom triage, report summaries | AI |
| **Storage** | Local FS / AWS S3 | Health record file storage | Storage |
| **Cache** | Redis | Health checks, future caching | Redis |
| **Database** | PostgreSQL | Primary data store | Prisma |

---

## 7. Current Consumer Workflows

### 7.1 Patient Onboarding
1. Visit `/login`
2. Enter phone number → Request OTP
3. Enter full name + 6-digit OTP → Verify
4. Auto-create User + DeviceSession + JWT
5. Redirect to `/app` dashboard

### 7.2 Doctor Discovery & Booking
1. Visit `/app/discovery`
2. Search by name/specialty → `GET /discovery`
3. Select doctor → `POST /telemedicine/appointments`
4. Payment → `POST /payments/consultations`
5. Join video → `POST /telemedicine/appointments/:id/session`

### 7.3 Health Record Management
1. Visit `/app/records`
2. Upload document → `POST /vault/records/upload`
3. View prescriptions → `GET /vault/prescriptions`
4. Download record → `GET /vault/records/:id/download-url`

### 7.4 Consent-Based Sharing
1. Visit `/app/consent`
2. Create consent → `POST /consents` (specify grantee, level, purpose, expiry)
3. Revoke consent → `PATCH /consents/:id/revoke`

### 7.5 Family Health Management
1. Visit `/app/family`
2. Add family member → `POST /family` (phone number, relationship, permissions)

### 7.6 Pharmacy Ordering
1. Visit `/app/pharmacy`
2. Browse partners → `GET /pharmacy/partners`
3. Place order → `POST /pharmacy/orders`

### 7.7 Diagnostic Booking
1. Visit `/app/diagnostics`
2. Browse labs → `GET /diagnostics/partners`
3. Book test → `POST /diagnostics/orders`
4. Upload report → `POST /diagnostics/reports/upload`

---

## 8. Shared Package (`@wyshcare/shared`)

### Contracts & Types
| Export | Purpose |
|---|---|
| `AuthSession` | Session type with userId, role, tokens |
| `LoginRequest` / `VerifyOtpRequest` | Auth request schemas |
| `DashboardResponse` | Aggregated dashboard data |
| `UserProfile` | Patient profile type |
| `ConsentGrant` | Consent data type |
| `HealthTimelineEvent` | Timeline event type |
| `DoctorProfile` | Doctor profile type |
| `DiscoverySearch` | Search query type |
| `AiSymptomRequest` / `AiSymptomResponse` | AI interaction types |
| `canAccessPath()` | RBAC route guard |

### Roles
`PATIENT`, `DOCTOR`, `CLINIC_MANAGER`, `PHARMACY_PARTNER`, `LAB_PARTNER`, `ADMIN`, `SUPPORT`, `SYSTEM`

---

## 9. Key Observations & Gaps

| Area | Status |
|---|---|
| ABHA Integration | Stub only — `POST /abdm/link` stores ABHA address, no actual ABDM gateway calls |
| FHIR Support | None — all data in custom Prisma models, no FHIR R4 serialization |
| Facility Registry | No integration with ABDM HFR |
| Professional Registry | No integration with ABDM HPR (HPRID) |
| Consent Gateway | Custom consent model — not connected to ABDM HIE-CM consent manager |
| Data Subscription | Not implemented |
| Scan & Share | Not implemented — QR only for emergency profile |
| NHCX Claims | Not implemented |
| UHI Protocol | Not implemented |
| ABHA Creation | Not implemented — no face auth / Aadhaar OTP flow |
| ABHA Login | Not implemented |
| PHR Linking | Not implemented — no care context linking |
| Health Data Interchange | No FHIR export for ABDM HI types |
| ECDH Encryption | Not implemented |
| Search Module | Empty |
| Health Module | Empty |
| Frontend mock data | Present but unused |
