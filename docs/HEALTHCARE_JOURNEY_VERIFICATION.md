# WyshCare — Healthcare Journey Verification

This document covers every step in the end-to-end healthcare journey.  
Each step documents the API, database tables, audit events, failure modes, and whether any P0 fix is in place or still needed.

---

## Step 1: Patient Login (REGISTER)

### API
`POST /api/v1/auth/register` → `POST /api/v1/auth/otp/verify`

### HTTP Methods
- `POST /auth/register` — request OTP with `purpose=REGISTER`
- `POST /auth/otp/verify` — verify OTP, create user + session

### Request Shapes

**POST /auth/register** (auth.controller.ts:36-39)
```json
{ "phoneNumber": "+919876543210" }
```
Optional: `{ "purpose": "REGISTER" }`

**POST /auth/otp/verify** (auth.controller.ts:46-63, login.dto.ts:15-33)
```json
{
  "phoneNumber": "+919876543210",
  "otpCode": "482193",
  "deviceName": "iPhone 16 Pro",
  "fullName": "Jane Doe"
}
```

### Response Shapes

**POST /auth/register** (auth.service.ts:82-85)
```json
{
  "challengeIssued": true,
  "otpPreview": "123456"
}
```
(`otpPreview` only in non-production)

**POST /auth/otp/verify**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "abc123...",
  "expiresIn": 3600,
  "user": {
    "id": "clx...",
    "wyshId": "WYSH-48219365",
    "fullName": "Jane Doe",
    "roles": ["PATIENT"]
  }
}
```

### Tables Touched
- `OtpChallenge` (create on request, read/write on verify)
- `User` (create on REGISTER verify)
- `UserRole` (create `PATIENT` role)
- `DeviceSession` (create)
- `RefreshToken` (create)
- `AuditLog` (create)

### Audit Events
- `OTP_REQUESTED` — when SMS is dispatched (auth.service.ts:74-79)
- `OTP_VERIFIED` — when OTP is validated and session issued (auth.service.ts:183-190)

### Failure Modes
| Condition | Error | Status |
|-----------|-------|--------|
| >5 active OTP challenges | `Too many OTP requests. Try again in a few minutes.` | 429 |
| Invalid OTP | `Invalid or expired OTP` | 401 |
| OTP locked (5+ failed attempts) | `OTP challenge has been locked` | 429 |
| REGISTER with existing phone | `An account already exists with this phone number. Please login instead.` | 409 |
| wyshId collision (P2002) | Retries 3 times then throws | 500 |

### Status
**FIXED** (P0-1: Phantom User Bug — auth.service.ts:128-148)  
Purpose-based guard prevents creating a `User` row when `REGISTER` collides with an existing phone, and prevents login when no user exists.

---

## Step 2: Patient Profile

### API
`GET /api/v1/identity/me`

### HTTP Method
`GET /identity/me` (JWT required)

### Request Shape
No body — user identity extracted from JWT via `@CurrentUser` decorator.

### Response Shape
(identity.service.ts:77-95)
```json
{
  "id": "clx...",
  "wyshId": "WYSH-48219365",
  "phoneNumber": "+919876543210",
  "fullName": "Jane Doe",
  "preferredLanguage": "en",
  "roles": ["PATIENT"],
  "wyshIdentity": { ... },
  "relatedTo": [],
  "providerProfile": null,
  "doctorProfile": null
}
```

### Tables Touched
- `User` (read by id)
- `UserRole` (read via include)
- `WyshIdentity` (read via include)
- `FamilyRelation` (read via `relatedTo`)
- `DoctorProfile` (read via include)
- `ProviderProfile` (read via include)

### Audit Events
None — read-only operation.

### Failure Modes
| Condition | Error | Status |
|-----------|-------|--------|
| Missing/invalid JWT | `Unauthorized` | 401 |
| User not found | Returns `null` (service) | 200 |

### Status
Already implemented. No P0 issues identified.

---

## Step 3: Doctor Discovery

### API
`GET /api/v1/discovery`

### HTTP Method
`GET /discovery?query=&specialty=` (public, no auth required)

### Request Shape
Query parameters:
- `query` (optional) — search by name or specialization
- `specialty` (optional) — filter by specialization

### Response Shape
(discovery.service.ts:25-33)
```json
[
  {
    "id": "doc_clx...",
    "name": "Dr. Smith",
    "specialization": "Cardiologist",
    "rating": 4.5,
    "consultationFee": 500,
    "telemedicineAvailable": true
  }
]
```

### Tables Touched
- `DoctorProfile` (read, filtered by `approvalStatus=VERIFIED`)
- `User` (read via include for `fullName`)

### Audit Events
None — public read-only endpoint.

### Failure Modes
| Condition | Error | Status |
|-----------|-------|--------|
| N/A | Returns empty array if no matches | 200 |

### Status
Already implemented. No P0 issues identified.

---

## Step 4: Appointment Booking

### API
`POST /api/v1/telemedicine/appointments`

### HTTP Method
`POST /telemedicine/appointments` (JWT required)

### Request Shape
(create-appointment.dto.ts:1-24)
```json
{
  "doctorProfileId": "doc_clx...",
  "consultationMode": "VIDEO",
  "reason": "Chest pain and shortness of breath",
  "slotStartAt": "2026-06-10T10:00:00.000Z",
  "slotEndAt": "2026-06-10T10:30:00.000Z",
  "clinicId": "clx..." (optional)
}
```

### Response Shape
(telemedicine.service.ts:126-143)
```json
{
  "id": "apt_clx...",
  "patientUserId": "clx...",
  "doctorProfileId": "doc_clx...",
  "doctorUserId": "usr_clx...",
  "clinicId": null,
  "consultationMode": "VIDEO",
  "status": "REQUESTED",
  "reason": "Chest pain and shortness of breath",
  "slotStartAt": "2026-06-10T10:00:00.000Z",
  "slotEndAt": "2026-06-10T10:30:00.000Z",
  "patientUser": { ... },
  "doctorProfile": { ... },
  "clinic": null
}
```

### Tables Touched
- `User` (read — validate patient exists)
- `DoctorProfile` (read — validate doctor exists and is `VERIFIED`)
- `DoctorClinic` (read via include — validate clinic mapping)
- `Appointment` (create)
- `AuditLog` (create)

### Audit Events
- `APPOINTMENT_CREATED` (telemedicine.service.ts:145-156)

### Failure Modes
| Condition | Error | Status |
|-----------|-------|--------|
| Patient not found | `Patient account not found` | 404 |
| Doctor profile not found | `Doctor profile not found` | 404 |
| Doctor not VERIFIED | `Doctor is not available for appointments` | 403 |
| Clinic not associated | `Doctor is not associated with the specified clinic` | 400 |
| Invalid slot start time | `Invalid slot start time` | 400 |
| End time ≤ start time | `Slot end time must be after start time` | 400 |
| Past booking | `Cannot book appointments in the past` | 400 |
| Time slot overlaps | `This time slot is already booked` | 409 |

### Status
**FIXED** (P0-3: Doctor Appointment Visibility — telemedicine.service.ts:19-49, 54-159)  
`listAppointments` now returns appointments for both patients and doctors. Full slot-overlap validation is in place.

---

## Step 5: Consultation (Session Creation)

### API
`POST /api/v1/telemedicine/appointments/{appointmentId}/session`

### HTTP Method
`POST /telemedicine/appointments/:appointmentId/session` (JWT required)

### Request Shape
No body — `appointmentId` from path param.

### Response Shape
(telemedicine.service.ts:188-193)
```json
{
  "session": {
    "id": "sess_clx...",
    "appointmentId": "apt_clx...",
    "doctorProfileId": "doc_clx...",
    "patientUserId": "clx...",
    "mode": "VIDEO",
    "livekitRoomName": "consult-apt_clx...",
    "waitingRoomOpenAt": "2026-06-10T09:55:00.000Z",
    "startedAt": null,
    "endedAt": null,
    "chatTranscript": null,
    "notes": null,
    "aiSummary": null,
    "createdAt": "..."
  },
  "patientToken": "livekit_patient_token...",
  "doctorToken": "livekit_doctor_token..."
}
```

### Tables Touched
- `Appointment` (read — fetch appointment record)
- `ConsultationSession` (upsert — create or update)
- `AuditLog` (create) — **MISSING, see status below**

### Audit Events
None — `createSession` does **not** call `auditLogService.capture()`.  
This is a compliance gap for telemedicine.

### Failure Modes
| Condition | Error | Status |
|-----------|-------|--------|
| Appointment not found | `Appointment not found` | 404 |
| User is not patient or doctor | `You do not have access to this appointment session` | 403 |

### Status
**NEEDS IMPLEMENTATION** — missing audit event for session creation (`telemedicine.service.ts:161-193`).  
A `CONSULTATION_SESSION_CREATED` event should be captured after the upsert.

---

## Step 6: Vault Upload

### API
`POST /api/v1/vault/records/upload`

### HTTP Method
`POST /vault/records/upload` (JWT required, multipart/form-data)

### Request Shape
Multipart form with a `file` field, plus query params:
- `recordType` (default `OTHER`)
- `title` (optional)
- `description` (optional)

Allowed MIME types (vault.service.ts:10-15):
- `application/pdf`, `image/png`, `image/jpeg`, `image/webp`, `text/plain`

### Response Shape
(vault.service.ts:89-103)
```json
{
  "id": "rec_clx...",
  "userId": "clx...",
  "title": "Blood Report June 2026",
  "recordType": "DIAGNOSTIC_REPORT",
  "description": "Complete blood count",
  "source": "FILE_UPLOAD",
  "storageKey": "users/clx.../Blood_Report_June_2026.pdf",
  "mimeType": "application/pdf",
  "fileSize": 245760,
  "hash": "sha256...",
  "recordedAt": "2026-06-04T..."
}
```

### Tables Touched
- `HealthRecord` (create)
- `TimelineEvent` (create — auto-mirror at vault.service.ts:105-118)
- `AuditLog` (create) — **MISSING, see status below**

### Audit Events
None — `uploadRecord` does **not** call `auditLogService.capture()`.  
This is a compliance gap for health record uploads.

### Failure Modes
| Condition | Error | Status |
|-----------|-------|--------|
| Empty file buffer | `No upload file provided` | 400 |
| Unsupported MIME type | `Unsupported upload type: ...` | 400 |
| File exceeds max size | `Upload exceeds max size of N bytes` | 400 |
| Storage write fails | (rollback — deletes orphaned blob) | 500 |

### Status
**NEEDS IMPLEMENTATION** — missing audit event (`vault.service.ts:60-125`).  
A `VAULT_RECORD_UPLOADED` event should be captured after `healthRecord.create`.

---

## Step 7: Timeline Update

### API
`GET /api/v1/timeline`

### HTTP Method
`GET /timeline` (JWT required)

### Request Shape
Query parameters (optional):
- `entryType` — filter by `CONSULTATION | PRESCRIPTION | DIAGNOSTIC | ...`
- `from` / `to` — date range
- `limit` (default 30) / `offset` (default 0)

### Response Shape
(timeline.service.ts:47-57)
```json
{
  "events": [
    {
      "id": "evt_clx...",
      "userId": "clx...",
      "healthRecordId": "rec_clx...",
      "type": "UPLOAD",
      "title": "Blood Report June 2026",
      "summary": "Uploaded diagnostic report",
      "metadata": { ... },
      "occurredAt": "2026-06-04T..."
    }
  ],
  "total": 1,
  "limit": 30,
  "offset": 0
}
```

### Tables Touched
- `TimelineEvent` (read, optionally filtered)

### Audit Events
None — read-only operation. Timeline events are **written** by other steps (vault upload, consultation, etc.) as side effects.

### Failure Modes
| Condition | Error | Status |
|-----------|-------|--------|
| N/A | Returns empty array if no events | 200 |

### Status
Already implemented. Timeline events are auto-created by vault upload (vault.service.ts:105-118). No P0 issues.

---

## Step 8: Consent Grant

### API
`POST /api/v1/consents`

### HTTP Method
`POST /consents` (JWT required)

### Request Shape
(create-consent.dto.ts:1-31)
```json
{
  "grantedToUserId": "clx...",
  "accessLevel": "LIMITED",
  "accessMethod": "MANUAL_APPROVAL",
  "purpose": "CAREMGT",
  "scope": { "records": ["DIAGNOSTIC_REPORT"] },
  "expiresAt": "2026-07-04T00:00:00.000Z"
}
```
Alternatively, grant by `granteePhoneNumber` or `granteeWyshId` instead of `grantedToUserId`.

### Response Shape
(consent.service.ts:117-122)
```json
{
  "id": "cns_clx...",
  "ownerUserId": "clx...",
  "grantedToUserId": "clx...",
  "accessLevel": "LIMITED",
  "accessMethod": "MANUAL_APPROVAL",
  "status": "ACTIVE",
  "purpose": "CAREMGT",
  "scope": { ... },
  "grantedAt": "...",
  "expiresAt": "...",
  "grantedToName": "Dr. Smith",
  "shareUrl": null
}
```

### Tables Touched
- `User` (read — resolve grantee)
- `ConsentGrant` (create)
- `ShareLink` (create — only if `accessMethod === 'SHARE_LINK'`)
- `AuditLog` (create)

### Audit Events
- `CONSENT_GRANTED` (consent.service.ts:107-115)

### Failure Modes
| Condition | Error | Status |
|-----------|-------|--------|
| Grantee not found (by phone/WyshId) | `Grantee user not found` | 404 |
| Missing JWT | `Unauthorized` | 401 |

### Status
Already implemented. Consent grant with ABDM-compatible purpose codes, share links, and audit capture is in place.

---

## Step 9: Family Sharing

### API
`POST /api/v1/family`

### HTTP Method
`POST /family` (JWT required)

### Request Shape
(family.service.ts:18-27 — inferred from service parameters)
```json
{
  "phoneNumber": "+919876543211",
  "fullName": "John Doe Sr.",
  "relationship": "PARENT",
  "canViewTimeline": true,
  "canBookAppointments": true,
  "canOrderMedicines": false,
  "canUseEmergency": true
}
```

### Response Shape
(family.service.ts:44-68)
```json
{
  "id": "fam_clx...",
  "actorUserId": "clx...",
  "subjectUserId": "clx...",
  "relationship": "PARENT",
  "canViewTimeline": true,
  "canBookAppointments": true,
  "canOrderMedicines": false,
  "canUseEmergency": true,
  "subject": { ... }
}
```

### Tables Touched
- `User` (read/create — find-or-create the subject)
- `UserRole` (create — only if subject user is newly created)
- `FamilyRelation` (upsert)

### Audit Events
None — `FamilyService.create` does **not** call `auditLogService.capture()`.  
This is a compliance gap for family relationship management.

### Failure Modes
| Condition | Error | Status |
|-----------|-------|--------|
| N/A | Upsert handles duplicates gracefully | 200 |

### Status
**NEEDS IMPLEMENTATION** — missing audit event (`family.service.ts:17-69`).  
A `FAMILY_RELATION_CREATED` or `FAMILY_RELATION_UPDATED` event should be captured.

---

## Step 10: Audit Log (View Trail)

### API
No dedicated endpoint exists.

### Current State
Audit events are **written** as side effects across the system (auth, appointments, consent) via `AuditLogService.capture()` (`common/services/audit-log.service.ts:18-49`), but there is **no read endpoint** for patients, doctors, or support staff to query their audit trail.

- `AuditLogService.findByUser()` exists (line 71-79) but is not exposed via any controller.
- `AuditLogService.findByAction()` exists (line 81-87) but is not exposed via any controller.

### Tables Touched
- `AuditLog` (read — no endpoint currently)

### Failure Modes
N/A — endpoint not built.

### Status
**NEEDS IMPLEMENTATION** — an audit trail endpoint (e.g. `GET /audit-log`) should be created that surfaces the audit log for the authenticated user, with filters by action type, date range, and pagination.

---

## Step 11: Doctor Login

### API
`POST /api/v1/auth/login` → `POST /api/v1/auth/otp/verify`

### HTTP Method
- `POST /auth/login` — request OTP with `purpose=LOGIN`
- `POST /auth/otp/verify` — verify OTP, require existing user

### Request Shape

**POST /auth/login** (auth.controller.ts:31-34)
```json
{ "phoneNumber": "+919876543210" }
```

**POST /auth/otp/verify** — same as Step 1.

### Response Shape
Same as Step 1.

### Tables Touched
- `OtpChallenge` (create on request, read/write on verify)
- `User` (read — must exist for LOGIN)
- `DeviceSession` (create)
- `RefreshToken` (create)
- `AuditLog` (create)

### Audit Events
- `OTP_REQUESTED`
- `OTP_VERIFIED`

### Failure Modes
| Condition | Error | Status |
|-----------|-------|--------|
| >5 active OTP challenges | `Too many OTP requests. Try again in a few minutes.` | 429 |
| Invalid OTP | `Invalid or expired OTP` | 401 |
| OTP locked (5+ failed attempts) | `OTP challenge has been locked` | 429 |
| LOGIN with no existing user | `No account found with this phone number. Please register first.` | 404 |

### Status
**FIXED** (P0-1: Phantom User Bug — auth.service.ts:128-148)  
The `purpose === 'LOGIN'` guard at auth.service.ts:134-139 ensures that a doctor cannot accidentally create a phantom user.

---

## Step 12: Doctor Dashboard

### API
`GET /api/v1/identity/dashboard`

### HTTP Method
`GET /identity/dashboard` (JWT required)

### Request Shape
No body — user identity from JWT.

### Response Shape
(identity.service.ts:177-249)
```json
{
  "profile": {
    "id": "clx...",
    "wyshId": "WYSH-...",
    "fullName": "Dr. Smith",
    "roles": ["DOCTOR"],
    "doctorProfile": {
      "specialization": "Cardiologist",
      "approvalStatus": "VERIFIED"
    },
    ...
  },
  "timeline": [...],
  "activeConsents": [
    {
      "grantedToName": "Shared access",
      "status": "ACTIVE",
      ...
    }
  ],
  "careTeam": [...],
  "alerts": [...]
}
```

### Tables Touched
- `User` (read with roles, doctorProfile, wyshIdentity)
- `TimelineEvent` (read — last 8 events)
- `ConsentGrant` (read — active consents for user)
- `DoctorProfile` (read — VERIFIED profiles for care team)

### Audit Events
None — read-only operation.

### Failure Modes
| Condition | Error | Status |
|-----------|-------|--------|
| Missing/invalid JWT | `Unauthorized` | 401 |

### Status
Already implemented. Combines profile, timeline, consents, and care team into a single dashboard response.

---

## Step 13: Consent Revoke

### API
`PATCH /api/v1/consents/{consentId}/revoke`

### HTTP Method
`PATCH /consents/:id/revoke` (JWT required)

### Request Shape
No body — `consentId` from path param.

### Response Shape
(consent.service.ts:133-147)
```json
{
  "id": "cns_clx...",
  "ownerUserId": "clx...",
  "status": "REVOKED",
  "revokedAt": "2026-06-04T12:00:00.000Z",
  ...
}
```

### Tables Touched
- `ConsentGrant` (read — verify ownership, then update status)
- `AuditLog` (create)

### Audit Events
- `CONSENT_REVOKED` (consent.service.ts:138-145)

### Failure Modes
| Condition | Error | Status |
|-----------|-------|--------|
| Consent not found or not owned by caller | `Consent not found or not owned by you` | 404 |
| Missing/invalid JWT | `Unauthorized` | 401 |

### Status
Already implemented. Ownership check prevents revoking another user's consent. Audit event is captured.

---

## Summary of Gaps

| # | Step | Issue | Priority |
|---|------|-------|----------|
| 5 | Consultation Session | Missing `CONSULTATION_SESSION_CREATED` audit event | Medium |
| 6 | Vault Upload | Missing `VAULT_RECORD_UPLOADED` audit event | Medium |
| 9 | Family Sharing | Missing `FAMILY_RELATION_CREATED` / `UPDATED` audit event | Medium |
| 10 | Audit Log View | No read endpoint to query audit trail | Medium |
