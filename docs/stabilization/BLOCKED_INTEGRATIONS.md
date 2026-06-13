# Blocked Integrations Status

Last Updated: 2026-06-12

## Overview
This document tracks integrations that require external credentials, accounts, or packages
not available in the current development environment. These are documented with specific
steps needed to complete each integration.

## 1. ABDM (Ayushman Bharat Digital Mission) Integration

### Status: BLOCKED — Requires government sandbox credentials

### Files Affected
- `backend/src/modules/abdm/abdm.service.ts` — Uses `generateFakeABHA()` for demo data
- `backend/src/modules/abdm/abha.service.ts` — Mock ABHA creation
- `backend/src/modules/abdm/consent.service.ts` — Mock consent management
- `backend/src/modules/interoperability/interoperability.controller.ts` — ABDM linking endpoints

### What's Mocked
| Function | Mock Behavior |
|---|---|
| `generateABHA()` | Returns `Math.random().toString().slice(2, 14)` |
| `verifyABHA()` | Returns `{ verified: true, name: 'Demo User' }` |
| `createConsentArtefact()` | Creates local DB record only |
| `fetchHealthRecords()` | Returns empty array |
| `linkABHAAddress()` | Saves ABHA address to user profile |

### Steps to Complete
1. Register at https://sandbox.abdm.gov.in/ for sandbox access
2. Obtain ABHA connector API credentials (clientId, clientSecret)
3. Set env vars:
   - `ABDM_BASE_URL=https://healthidsbx.abdm.gov.in/api/`
   - `ABDM_CLIENT_ID=<from sandbox registration>`
   - `ABDM_CLIENT_SECRET=<from sandbox registration>`
   - `ABDM_GATEWAY_URL=https://gw1.abdm.gov.in/api/v1/`
4. Replace `generateFakeABHA()` in `abha.service.ts` with `POST /v1/registration/aadhaar/generateOtp`
5. Implement ABHA number generation flow (Aadhaar → OTP → Verify → ABHA)
6. Replace mock consent management with real ABDM consent APIs
7. Update `.env.example` with new variables
8. End-to-end test with sandbox credentials

### Estimated Effort: 5-7 days

---

## 2. NHCX (National Health Claims Exchange) Integration

### Status: BLOCKED — Requires NHCX sandbox credentials

### Files Affected
- `backend/src/modules/nhcx/nhcx.service.ts` — Claim submission simulation
- `backend/src/modules/nhcx/nhcx.controller.ts` — NHCX API endpoints

### What's Mocked
| Function | Mock Behavior |
|---|---|
| `submitClaim()` | Returns `{ claimId: 'CLM-xxx', status: 'SUBMITTED' }` after 2s timeout |
| `checkClaimStatus()` | Returns `{ status: 'PROCESSING', lastUpdated: now }` |
| `getClaimHistory()` | Returns empty array |

### Steps to Complete
1. Register for NHCX sandbox access through IRDAI
2. Obtain API credentials
3. Set env vars:
   - `NHCX_BASE_URL=https://sandbox.nhcx.gov.in/api/`
   - `NHCX_API_KEY=<from registration>`
4. Replace `setTimeout` simulation with actual HTTP calls
5. Implement claim submission workflow (draft → submit → track → settle)
6. Add webhook handler for claim status callbacks
7. Update `.env.example`

### Estimated Effort: 6-8 days

---

## 3. Mobile SDK Packages

### Status: BLOCKED — Packages not present in repository

### Affected Files (Patient Mobile)
- `apps/patient-mobile/lib/core/network/sdk_provider.dart` — Imports `wyshcare_patient_sdk`
- `apps/patient-mobile/lib/core/authentication/auth_notifier.dart` — Uses `WyshCarePatientSDK`
- `apps/patient-mobile/lib/core/authentication/supabase_auth_bridge.dart` — Uses `TokenStorage`
- `apps/patient-mobile/pubspec.yaml` — Path dependency on `wyshcare_patient_sdk`

### Affected Files (Doctor Mobile)
- `apps/doctor-mobile/lib/features/ai_copilot/ai_scribe_panel.dart` — Imports `wyshcare_doctor_sdk`
- `apps/doctor-mobile/lib/features/telemedicine/telemedicine_screen.dart` — Uses `Appointment` model
- `apps/doctor-mobile/pubspec.yaml` — Path dependency on `wyshcare_doctor_sdk`

### What's Missing
| SDK | Expected Location | Purpose |
|---|---|---|
| `wyshcare_patient_sdk` | `packages/wyshcare_patient_sdk/` | Shared patient types, API client, token storage |
| `wyshcare_doctor_sdk` | `packages/wyshcare_doctor_sdk/` | Shared doctor types, API client, telemedicine types |

### Steps to Complete
1. Determine if SDK packages should be:
   - **Option A**: Created as local Dart packages in the monorepo under `packages/`
   - **Option B**: Published to pub.dev and referenced by version
   - **Option C**: Removed in favor of direct API calls (simplest)
2. Create shared types:
   - `UserProfile`, `AuthSession`, `Appointment`, `TokenStorage`, `WyshCarePatientSDK`, `WyshCareConfig`
3. Update pubspec.yaml references in both mobile apps
4. Run `dart pub get` in both mobile projects
5. Verify imports resolve

### Estimated Effort: 2-4 days (Option C: 1 day)

---

## 4. Push Notifications (FCM)

### Status: PARTIAL — Service stub created, needs firebase-admin SDK + credentials

### Files
- `backend/src/modules/notifications/providers/fcm.service.ts` — Stub created
- Falls back to log-only when `FCM_SERVER_KEY` not set

### Steps to Complete
1. Create Firebase project at https://console.firebase.google.com/
2. Enable Cloud Messaging API
3. Generate server key or service account JSON
4. Set env var: `FCM_SERVER_KEY=<from Firebase>`
5. Install firebase-admin: `pnpm add firebase-admin --filter backend`
6. Initialize Firebase app in FcmService constructor
7. Implement actual token-based push via `admin.messaging().sendEachForMulticast()`

### Estimated Effort: 1-2 days

---

## 5. WhatsApp & Voice Notifications

### Status: BLOCKED — Requires Twilio WhatsApp/Voice API access

### Steps to Complete
1. Enable WhatsApp Business API on Twilio account
2. Submit WhatsApp template messages for approval
3. Set env vars:
   - `TWILIO_WHATSAPP_FROM=whatsapp:+14155238886`
4. Install Twilio SDK if not already: `pnpm add twilio --filter backend`
5. Replace `console.log` in `notifications.service.ts` `sendWhatsApp()` with `client.messages.create()`
6. Same pattern for Voice/SMS using Twilio's Voice API

### Estimated Effort: 2-3 days

---

## Summary Table

| Integration | Status | Prerequisite | Effort | Priority |
|---|---|---|---|---|
| ABDM | Blocked | Govt sandbox credentials | 5-7 days | P0 |
| NHCX | Blocked | IRDAI sandbox credentials | 6-8 days | P0 |
| Mobile SDKs | Blocked | SDK package creation | 2-4 days | P1 |
| Push (FCM) | Partial stub | Firebase project + admin SDK | 1-2 days | P1 |
| WhatsApp/Voice | Blocked | Twilio API access | 2-3 days | P2 |
