# Mock Inventory — Phase 1 Stabilization Audit

**Generated:** 2026-06-12
**Method:** Static analysis — grep for `Task.sleep`, `setTimeout`, mock data constants, stub implementations, placeholder credentials

---

## Integration Mock Score

| Layer | Production Ready | Mocked | Dead/Stub |
|-------|-----------------|--------|-----------|
| AI Providers (Gemini) | 100% | 0% | 0% |
| AI Providers (Ollama) | 100% | 0% | 0% |
| AI Providers (OpenAI) | 0% | 0% | **100%** (missing dep + stub embed) |
| AI Providers (OpenRouter) | 0% | 0% | **100%** (missing dep + stub embed) |
| AI Providers (NVIDIA NIM) | 0% | 0% | **100%** (missing dep + stub embed) |
| Razorpay (Payments) | 100% | 0% | 0% |
| AWS S3 (Storage) | 100% | 0% | 0% |
| Redis (Caching) | 100% | 0% | 0% |
| LiveKit (Telemedicine) | 80% | 0% | 20% (token gen only, no room creation) |
| Twilio (SMS) | 70% | 30% | 0% (real HTTP, no SDK) |
| RabbitMQ (Events) | 60% | 0% | 40% (feature-flagged, missing .env.example) |
| OpenTelemetry (Tracing) | 0% | 0% | **100%** (missing deps) |
| Sentry (Error Tracking) | 0% | 0% | **100%** (installed but not initialized) |
| SendGrid/Email | 0% | **100%** | 0% |
| ABDM (Health Stack) | 0% | **100%** | 0% |
| NHCX (Claims) | 0% | **100%** | 0% |
| Google OAuth | 0% | 0% | **100%** (not implemented) |
| **Notifications** | 0% | **100%** | 0% |
| **iOS ViewModels** | 0% | **100%** | 0% |
| **Frontend Pages** | 0% | **100%** | 0% |
| **AI Copilot** | 0% | **100%** (rule-based) | 0% |
| **Insurance Pages** | 0% | **100%** | 0% |
| **Admin Pages** | 0% | **100%** | 0% |

---

## Section 1: Critical Mocks (Production Impact)

### 1.1 iOS Authentication — All Calls Are `Task.sleep` Simulations

| File | Line | Severity |
|------|------|----------|
| `ios/Wysh/Features/Authentication/ViewModels/AuthViewModel.swift` | 61-66 | **Critical** |

```swift
func loginWithGoogle() {
    authState = .loading
    Task {
        do {
            try await Task.sleep(nanoseconds: 1_500_000_000)
            authState = .authenticated
        } catch {
            authState = .error(error.localizedDescription)
        }
    }
}
```

**Also mocked in same file:**
- `resendOTP()` (line 89) — `Task.sleep`
- `sendOTP(phone:)` (line 138) — `Task.sleep`
- `sendOTP(email:)` (line 142) — `Task.sleep`
- `verifyCode(_:)` (line 146) — returns hardcoded `AuthUser(id: "1", name: "John Doe", ...)`
- `registerAuthUser(name:phone:email:)` (line 155) — `Task.sleep`
- `sendResetLink(contact:)` (line 159) — `Task.sleep`

**Production impact:** Users cannot register, log in, verify OTP, or reset passwords on iOS.

---

### 1.2 Notifications — All 5 Channels Are Mocked

| File | Line | Channel | Severity |
|------|------|---------|----------|
| `backend/src/modules/notifications/notifications.service.ts` | 696-705 | SMS | **Critical** |
| same file | 727-736 | Email | **Critical** |
| same file | 759-768 | Push | **Critical** |
| same file | 789-798 | WhatsApp | **Critical** |
| same file | 819-828 | Voice | **Critical** |

```typescript
// Mock implementation - in production, use Twilio
console.log(`[SMS MOCK] To: ${user.phoneNumber}, Body: ${body}, Priority: ${priority}`);
if (Math.random() < 0.1) { throw new Error('SMS delivery failed: Network error'); }
return `sm_${Math.random().toString(36).substr(2, 9)}`;
```

**Production impact:** No real SMS, email, push, WhatsApp, or voice notifications. Appointments, OTPs, reminders, alerts silently fail.

---

### 1.3 Backend Email Service — Stub with TODO

| File | Line | Severity |
|------|------|----------|
| `backend/src/modules/auth/email.service.ts` | 62-68 | **High** |

```typescript
async sendOtp(email: string, otp: string): Promise<void> {
    this.logger.warn(`[Email OTP] OTP for ${email}: ${otp}`);
    if (process.env.NODE_ENV === 'production') {
        // TODO: Integrate with SMTP / SendGrid / AWS SES for production email delivery
        this.logger.warn(`Email provider not configured — OTP for ${email} would be sent via email`);
    }
}
```

**Production impact:** Email OTP delivery silent-fails in production.

---

### 1.4 ABDM Gateway — All External Calls Are Fake

| File | Line | Severity |
|------|------|----------|
| `backend/src/modules/abdm/gateway.service.ts` | 72-78 | **Critical** |

```typescript
async abhaCreate(phone: string): Promise<{ abhaNumber: string; txnId: string }> {
    this.logger.log(`Creating ABHA for phone: ${phone}`);
    return {
        abhaNumber: `91-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        txnId: `txn_${Date.now()}`,
    };
}
```

**Also mocked in same file:**
- `abhaVerifyOtp()` (line 80) — accepts only hardcoded `'123456'`
- `consentRequest()` (line 86) — returns fake consent IDs
- `hipPush()` (line 105) — returns mock transfers
- `hprSearch()` (line 120) — returns fake doctor results

**Production impact:** ABDM integration is non-functional. Cannot create ABHA numbers, verify OTPs, or manage consents.

---

### 1.5 ABDM HFR & HPR Sync — Hardcoded Mock Data

| File | Line | Severity |
|------|------|----------|
| `backend/src/modules/abdm/hfr.service.ts` | 93-112 | **High** |
| `backend/src/modules/abdm/hpr.service.ts` | 93-112 | **High** |

```typescript
async syncAll() {
    this.logger.log('Starting HFR sync from ABDM gateway');
    const mockFacilities: HfrRecord[] = [
        { hfrId: 'hfr_001', name: 'AIIMS Delhi', ... },
        { hfrId: 'hfr_002', name: 'Apollo Hospitals Chennai', ... },
        // ... 3 more hardcoded facilities
    ];
    this.cache = mockFacilities;
    return { synced: mockFacilities.length, timestamp: this.lastSyncAt.toISOString() };
}
```

**Production impact:** Facility and provider registries show fake data.

---

### 1.6 NHCX Claim Submission — Simulated API Calls

| File | Line | Severity |
|------|------|----------|
| `backend/src/modules/nhcx/nhcx.service.ts` | 335-357 | **High** |

```typescript
// Simulated NHCX Gateway Calls
private async submitToNHCX(claimData: any): Promise<{ submissionRef: string; responsePayload: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { submissionRef: `NHCX_SIM_${Date.now()}`, responsePayload: 'Simulated response' };
}

private async syncWithNHCX(submissionRef: string): Promise<string> {
    const hoursSinceSubmission = 30; // Simulated
    if (hoursSinceSubmission > 24) return 'ACCEPTED';
    return 'PENDING';
}
```

**Production impact:** Insurance claims cannot be actually submitted to NHCX.

---

### 1.7 Admin MFA — Stub Implementation

| File | Line | Severity |
|------|------|----------|
| `backend/src/modules/auth/admin-auth.service.ts` | 155-165 | **High** |

```typescript
async disableMfa(userId: string, _password: string) {
    this.logger.log(`MFA disable requested for admin ${userId}`);
    return {
        disabled: true,
        message: 'MFA disable stub — no action taken as MFA is not yet implemented.',
    };
}
```

(And line 155: `message: 'MFA verification is not yet implemented.'`)

**Production impact:** MFA cannot be enabled or enforced for any account.

---

### 1.8 Missing `openai` Package — 3 AI Providers Will Crash

| Provider | File | Missing Dep | Severity |
|----------|------|-------------|----------|
| OpenAI | `backend/src/providers/ai/providers/openai.provider.ts` | `openai` | **Critical** |
| OpenRouter | `backend/src/providers/ai/providers/openrouter.provider.ts` | `openai` | **Critical** |
| NVIDIA NIM | `backend/src/providers/ai/providers/nvidia-nim.provider.ts` | `openai` | **Critical** |

```typescript
// openai.provider.ts:57
import OpenAI from 'openai';
// This import will fail at runtime — 'openai' is not in package.json
```

**Production impact:** 3 of 5 AI providers throw at import. Fallback chain silently breaks.

---

### 1.9 Sentry Not Initialized

| File | Line | Severity |
|------|------|----------|
| `backend/package.json` | 46 | **High** |

`@sentry/node@^10.49.0` is installed but `Sentry.init()` is never called anywhere. No error tracking is active.

---

### 1.10 OpenTelemetry Missing Dependencies

| File | Missing Packages | Severity |
|------|-----------------|----------|
| `backend/src/common/telemetry/tracing.ts` | `@opentelemetry/sdk-node`, `@opentelemetry/auto-instrumentations-node`, `@opentelemetry/exporter-trace-otlp-http`, `@opentelemetry/resources`, `@opentelemetry/semantic-conventions` | **High** |

All imported in `tracing.ts` but not declared in `package.json`. Will crash at runtime if `OTEL_ENABLED=true`.

---

## Section 2: High-Impact Mocks

### 2.1 AI `embed()` Returns Empty Array — 4 Providers

| Provider | File | Line |
|----------|------|------|
| OpenAI | `backend/src/providers/ai/providers/openai.provider.ts` | 122-124 |
| Ollama | `backend/src/providers/ai/providers/ollama.provider.ts` | 131-133 |
| NVIDIA NIM | `backend/src/providers/ai/providers/nvidia-nim.provider.ts` | 126 |
| OpenRouter | `backend/src/providers/ai/providers/openrouter.provider.ts` | 125-127 |

```typescript
async embed(_text: string): Promise<number[]> {
    return [];  // Stub — embeddings not implemented
}
```

**Gemini** is the only provider with actual embedding support.

---

### 2.2 Ollama `vision()` Returns Empty String

| File | Line |
|------|------|
| `backend/src/providers/ai/providers/ollama.provider.ts` | 127-128 |

```typescript
async vision(_input: VisionInput, _prompt: string, _options?: ChatOptions): Promise<string> {
    return '';  // Stub — vision not implemented for Ollama
}
```

---

### 2.3 Frontend Mock Data Files

| File | Lines | Contents |
|------|-------|----------|
| `frontend/src/data/mock-patients.ts` | 322 | 30+ mock patient records with PII |
| `frontend/src/components/app/ai-copilot-sidebar.tsx` | 420-511 | 15 specialty mock transcripts |
| `frontend/src/app/(platform)/app/ai-navigator/page.tsx` | 94-109 | Rule-based response generator |

**Mock patient data includes simulated Aadhaar numbers, phone numbers, addresses, and medical history.**

---

### 2.4 Insurance Pages — All Use Mock Data

| File | Mock Constant |
|------|---------------|
| `frontend/src/app/insurance/page.tsx` | `MOCK_METRICS`, `MOCK_TREND`, `MOCK_RECENT_CLAIMS`, `MOCK_PENDING_PRE_AUTHS` |
| `frontend/src/app/insurance/claims/page.tsx` | `MOCK_CLAIMS` |
| `frontend/src/app/insurance/coverage-rules/page.tsx` | `MOCK_PLANS`, `MOCK_RULES` |
| `frontend/src/app/insurance/eligibility/page.tsx` | `MOCK_POLICIES`, `MOCK_HISTORY` |
| `frontend/src/app/insurance/providers/page.tsx` | `MOCK_PROVIDERS` |
| `frontend/src/app/insurance/settlements/page.tsx` | `MOCK_APPROVED_CLAIMS`, `MOCK_SETTLEMENTS` |
| `frontend/src/app/insurance/plans/page.tsx` | `MOCK_PLANS`, `MOCK_PROVIDERS` |
| `frontend/src/app/insurance/copilot/page.tsx` | `MOCK_ANALYSIS`, `MOCK_DENIAL_RISK`, `MOCK_HISTORY` |
| `frontend/src/app/insurance/eligibility/page.tsx` | `MOCK_POLICIES` + inline mock check logic |
| `frontend/src/app/insurance/copilot/page.tsx` | `MOCK_ANALYSIS` + `MOCK_DENIAL_RISK` |

**Production impact:** All insurance pages show fake data. Eligibility checks return hardcoded results.

---

### 2.5 Admin Pages — All Use Mock Data

| File | Mock Constant |
|------|---------------|
| `frontend/src/app/admin/page.tsx` | `MOCK_METRICS`, `MOCK_REVENUE`, `MOCK_GROWTH`, `MOCK_REGISTRATIONS` |
| `frontend/src/app/admin/analytics/page.tsx` | `MOCK_REVENUE_DAILY`, `MOCK_REVENUE_MONTHLY`, `MOCK_APPOINTMENTS`, `MOCK_DISEASES`, `MOCK_CLAIMS_TREND`, `MOCK_UTILIZATION`, `MOCK_PATIENT_GROWTH` |
| `frontend/src/app/admin/subscriptions/page.tsx` | `MOCK_METRICS`, `MOCK_PLANS`, `MOCK_CHANGES` |
| `frontend/src/app/admin/abdm/page.tsx` | `MOCK_HIE_VOLUME`, `MOCK_DAILY_STATS` |

---

### 2.6 Doctor Pages — Mock Data

| File | Mock Constant |
|------|---------------|
| `frontend/src/app/doctor/prescriptions/page.tsx` | `MOCK_PRESCRIPTIONS`, `MOCK_PATIENTS` |
| `frontend/src/app/doctor/telemedicine/page.tsx` | `MOCK_UPCOMING`, `MOCK_PAST`, `MOCK_WAITING` |

---

### 2.7 Dental Radiology — Mock Studies

| File | Line |
|------|------|
| `frontend/src/components/specialties/dental/radiography-panel.tsx` | 77 |

```typescript
const MOCK_STUDIES: Radiograph[] = [ /* hardcoded radiograph data */ ];
```

---

## Section 3: `setTimeout` Fake Async Pattern (~49 Occurrences)

Every insurance, admin, clinic, and EMR page uses the same pattern to fake loading:

```typescript
useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
}, []);
```

### Pages affected:

**Insurance (9 pages):**
- `frontend/src/app/insurance/page.tsx:136`
- `frontend/src/app/insurance/claims/page.tsx:128`
- `frontend/src/app/insurance/coverage-rules/page.tsx:133`
- `frontend/src/app/insurance/eligibility/page.tsx:125`
- `frontend/src/app/insurance/pre-auth/page.tsx:112`
- `frontend/src/app/insurance/providers/page.tsx:118`
- `frontend/src/app/insurance/settlements/page.tsx:128`
- `frontend/src/app/insurance/plans/page.tsx:121`
- `frontend/src/app/insurance/copilot/page.tsx:134`

**Admin (4 pages):**
- `frontend/src/app/admin/analytics/page.tsx:137`
- `frontend/src/app/admin/page.tsx:145`
- `frontend/src/app/admin/users/page.tsx:135`
- `frontend/src/app/admin/subscriptions/page.tsx:132`

**Clinic (3 pages):**
- `frontend/src/app/clinic/page.tsx:127`
- `frontend/src/app/clinic/clinical-twin/page.tsx:188`
- `frontend/src/app/clinic/branding/page.tsx:103` (save simulation)

**Doctor (3 pages):**
- `frontend/src/app/doctor/telemedicine/page.tsx:116`
- `frontend/src/app/doctor/patients/page.tsx:256`
- `frontend/src/app/doctor/prescriptions/page.tsx:153`

**EMR (15 pages) — all use `setTimeout` to simulate save:**
- `frontend/src/app/doctor/emr/cardiology/page.tsx:290`
- `frontend/src/app/doctor/emr/dermatology/page.tsx:383`
- `frontend/src/app/doctor/emr/neurology/page.tsx:285`
- (and 12 more specialty pages)

**AI Navigator:**
- `frontend/src/app/(platform)/app/ai-navigator/page.tsx:130-135` — `setTimeout` simulates AI thinking

---

## Section 4: iOS ViewModels — All Use `Task.sleep` (~18 Occurrences)

| File | Line | Purpose |
|------|------|---------|
| `ios/Wysh/Features/Auth/ViewModels/AuthViewModel.swift` | 61 | Login |
| same | 89 | Resend OTP |
| same | 138 | Send OTP (phone) |
| same | 142 | Send OTP (email) |
| same | 146 | Verify OTP |
| same | 155 | Register user |
| same | 159 | Send reset link |
| `DashboardViewModel.swift` | 102 | Dashboard load |
| `CareNavigatorViewModel.swift` | 54 | Care navigator |
| `TimelineViewModel.swift` | 59 | Timeline load |
| `HealthTimelineView.swift` | 151 | Timeline view |
| `DiagnosticsViewModel.swift` | 57 | Diagnostics load |
| `PharmacyViewModel.swift` | 33 | Pharmacy load |
| `PrescriptionsViewModel.swift` | 23 | Prescriptions load |
| `AppointmentsViewModel.swift` | 23 | Appointments load |
| `HealthRecordsViewModel.swift` | 35 | Records load |
| `CareHubViewModel.swift` | 75 | Care hub load |

**Production impact:** Every iOS view displays fake data. No real network calls.

---

## Section 5: Placeholder Credentials & Missing ENV

| Variable | Location | Issue |
|----------|----------|-------|
| `JWT_SECRET=replace-with-strong-secret` | `backend/.env.example:9` | Placeholder |
| `RAZORPAY_KEY_SECRET=replace-me` | `backend/.env.example:12` | Placeholder |
| `STORAGE_SIGNING_SECRET=replace-with-storage-signing-secret` | `backend/.env.example:28` | Placeholder |
| `GEMINI_API_KEY=` | `backend/.env.example:14` | Empty |
| `LIVEKIT_API_KEY=` | `backend/.env.example:17` | Empty |
| `LIVEKIT_API_SECRET=` | `backend/.env.example:18` | Empty |
| `LIVEKIT_HOST=` | `backend/.env.example:19` | Empty |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=` | `frontend/.env.example:2` | Empty |
| `OPENAI_API_KEY` | Missing from `.env.example` | Not documented |
| `OPENROUTER_API_KEY` | Missing from `.env.example` | Not documented |
| `NVIDIA_API_KEY` | Missing from `.env.example` | Not documented |
| `OLLAMA_BASE_URL` | Missing from `.env.example` | Not documented |
| `SENTRY_DSN` | Missing from `.env.example` | Not documented |
| `RABBITMQ_URL` | Missing from `.env.example` | Not documented |

The backend `main.ts:88-93` validates against insecure defaults:
```typescript
const insecureDefaults = [
    'replace-with-strong-secret',
    'replace-with-storage-signing-secret',
    'replace-me',
    'DEV_SECRET_CHANGE_IN_PROD'
];
```

---

## Section 6: Dead Dependencies & Stubs

| Dependency | Package.json | Actually Used? |
|------------|-------------|----------------|
| `@sentry/node` | ✅ Installed | ❌ **Not initialized** |
| `@nestjs/graphql` + `@nestjs/apollo` | ✅ Installed | ❌ **No frontend GraphQL queries** |
| `@nestjs/websockets` + `socket.io` | ✅ Installed | ❌ **No client connects** |
| `@aws-sdk/client-s3` | ✅ Installed | ✅ **Real — but fallback to local** |
| `livekit-server-sdk` | ✅ Installed | ✅ **Token generation only** |
| `@opentelemetry/api` | ✅ Installed | ⚠️ **Missing deps** |
| `openai` | ❌ **Missing** | ✅ **Code uses it** (will crash) |
| `bcryptjs` | ✅ Installed | ⚠️ **Both bcryptjs AND argon2 exist** |
| `argon2` | ✅ Installed | ⚠️ **Only one needed** |

---

## Section 7: Mock-to-Real Conversion Priority

| Priority | Integration | Current State | Target State | Effort |
|----------|-------------|---------------|--------------|--------|
| **P0** | iOS Auth (all flows) | `Task.sleep` mock | Real API calls via backend | 2-3 weeks |
| **P0** | Notifications (SMS, Email, Push, WhatsApp, Voice) | `console.log` mock | Twilio/SendGrid/Firebase | 2-4 weeks |
| **P0** | ABDM Gateway (ABHA create, OTP, consent) | Fake data responses | Real ABDM sandbox API | 4-6 weeks |
| **P0** | NHCX Claim Submission | Simulated calls | Real NHCX gateway | 3-4 weeks |
| **P0** | MFA Implementation | Stub | TOTP/SMS MFA | 2-3 weeks |
| **P0** | Email service | TODO stub | SendGrid/SMTP | 1 week |
| **P1** | Missing `openai` package | Missing dep | Add to package.json | 1 hour |
| **P1** | Sentry initialization | Dead dependency | Init in main.ts | 2 days |
| **P1** | OpenTelemetry deps | Missing packages | Add to package.json | 2 days |
| **P1** | Frontend mock data (insurance, admin, EMR) | Hardcoded MOCK_* | Real API integration | 4-6 weeks |
| **P1** | AI `embed()` stubs (4 providers) | Return `[]` | Real embeddings | 1-2 weeks |
| **P2** | `setTimeout` fake loading (49 pages) | Timer | Real loading from API | 4-6 weeks |
| **P2** | iOS ViewModels (10 files) | `Task.sleep` | Real API calls | 2-3 weeks |
| **P2** | .env.example missing entries | Missing vars | Document all env vars | 1 day |
| **P3** | Ollama vision stub | Empty string | Real vision | 1 week |
| **P3** | Dead deps cleanup (graphql, websockets, bcryptjs/argon2) | Unused | Remove or implement | 2 days |

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| `Task.sleep` mocks (iOS) | 18 |
| `setTimeout` fake async (Frontend) | ~49 |
| Integration mocks (Notifications, ABDM, NHCX, Email) | 4 critical |
| Frontend files with MOCK_* data constants | 17 |
| AI provider stubs (`embed` returns `[]`) | 4 |
| AI provider crashes (`openai` missing dep) | 3 |
| Dead dependencies (installed, unused) | 3 |
| Placeholder/insecure credentials | 7 |
| Missing .env.example entries | 8 |
| `console.log` in production source | 10+ |

**Overall Mock Score:**
- Production Ready: **35%**
- Mocked/Stubbed: **55%**
- Dead/Broken: **10%**
