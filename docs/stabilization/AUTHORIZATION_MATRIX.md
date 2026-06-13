# Phase 3: Authorization Matrix — RBAC Audit

**Date:** 2026-06-12
**Current Score:** 45/100
**Target Score:** 85/100

---

## 1. Role Definitions

| Role | Category | Description |
|------|----------|-------------|
| `PATIENT` | Consumer | End-user receiving care |
| `DOCTOR` | Provider | Licensed medical practitioner |
| `NURSE` | Provider | Nursing staff |
| `CAREGIVER` | Consumer | Family/authorized caregiver |
| `CLINIC_MANAGER` | Staff | Clinic operational manager |
| `PHARMACY_PARTNER` | Partner | Pharmacy fulfillment partner |
| `LAB_PARTNER` | Partner | Diagnostic lab partner |
| `ADMIN` | Internal | Platform administrator |
| `SUPER_ADMIN` | Internal | Super admin |
| `SUPPORT` | Internal | Customer support |
| `SYSTEM` | Internal | Service-to-service (machine) |

---

## 2. Controller Authorization Status

### 2a. Properly Protected (JwtAuthGuard + RolesGuard + @Roles)

| Controller | Score | Notes |
|------------|-------|-------|
| ABDM | ✅ | 37 routes, all role-tagged |
| NHCX | ✅ | 7 routes, ADMIN/CLINIC_MANAGER/SYSTEM |
| Provider Graph | ✅ | Route-level roles varied |
| Workspace | ⚠️ | `os/role/:userId` missing @Roles |
| Clinic Billing | ✅ | |
| EHR | ✅ | |
| Prescription (write) | ✅ | |
| Health Graph V2 | ✅ | |
| Clinical Twin | ✅ | |
| Clinic Admin | ✅ | |
| Admin | ✅ | Class-level @Roles |
| Health Score | ✅ | Class-level @Roles |
| Auth/Admin | ✅ | |
| Clinic Reception | ✅ | |

### 2b. JwtAuthGuard Only — NO Role Checking **(CRITICAL GAP)**

| Controller | Risk | Routes Exposed |
|------------|------|----------------|
| Analytics | 🔴 HIGH | All analytics data — any authenticated user |
| Vault | 🔴 HIGH | Document storage — any user can read/write |
| Health Twin | 🔴 HIGH | PHI health twin data — any user |
| Digital Twin | 🔴 HIGH | AI digital twin — any user |
| Emergency | 🔴 HIGH | Emergency contacts & records — any user |
| Telemedicine | 🔴 HIGH | Consultations, video sessions — any user |
| Consent | 🔴 HIGH | Consent grants (PHI) — any user |
| Notifications | 🟡 MED | User notifications |
| Goals | 🟡 MED | Patient goals |
| Wysh | 🟡 MED | Wysh-specific dashboard |
| Family | 🟡 MED | Family member records |
| Timeline | 🟡 MED | Activity timeline |
| Care Plans | 🟡 MED | Care plans |
| Dashboard | 🟡 MED | Aggregated dashboard |
| Interoperability | 🟡 MED | ABDM data exchange |
| Search | 🟡 MED | Cross-entity search |
| Identity | 🟡 MED | Identity verification |
| Staff | 🔴 HIGH | Staff management without role control |
| Health Graph V1 | 🟡 MED | Historical health graph |
| AI | 🟡 MED | AI analysis |
| AI Lifestyle | 🟡 MED | Lifestyle recommendations |
| AI Preventive | 🟡 MED | Preventive AI |
| AI Risk | 🟡 MED | Risk assessment |
| Diagnostics | 🟡 MED | Lab diagnostics |
| Pharmacy | 🟡 MED | Pharmacy orders |
| Doctors | 🟡 MED | Doctor profiles |

### 2c. No Guards at All **(CRITICAL GAP)**

| Controller | Risk | Routes |
|------------|------|--------|
| Doctor Auth | 🟡 MED | OTP endpoints (rate-limited by design) |
| Discovery | 🟡 MED | Provider search |
| Clinic Branding | 🟡 MED | Branding assets |
| Specialties + 15 subs | 🔴 HIGH | Specialty encounter data — PHI exposed |
| Health | ✅ LOW | Health check |

### 2d. Broken Guard Setup **(BUG)**

| Controller | Issue |
|------------|-------|
| Queue Monitor | Uses `RolesGuard` without `JwtAuthGuard` — `request.user` is undefined |

### 2e. Routes Missing @Roles Within Protected Controllers

| Controller | Routes | Risk |
|------------|--------|------|
| Prescription | GET list, searchDrugs, adherenceReport, getByConsultation, verifyQr, generatePdf, getById | 🟡 MED |
| Insurance | GET providers, plans, policies, eligibility, pre-auth, claims | 🟡 MED |
| Workspace | GET os/role/:userId | 🟡 MED |

---

## 3. Resource-Level Authorization

### What's Correct
- **AI Risk**: PATIENT can only access own data (`userId !== req.user.userId`)
- **AI Preventive**: Same PATIENT self-scoping
- **Consultation Service**: Only appointment participants (patient + doctor) can join sessions
- **Vault Service**: Queries scoped to `userId`
- **Service-level scoping**: ~15 services accept `userId` and query-scope (CarePlans, Goals, Notifications, Family, Timeline, Consent, Dashboard, DigitalTwin, etc.)
- **RLS policies**: 640+ lines of PostgreSQL RLS on all PHI tables

### What's Missing
- AI Lifestyle: ownership checks log warnings but do NOT throw — non-blocking
- No middleware-level authorization logger/audit for denied requests
- No rate limiting tied to role (all roles have same throttle limits)

---

## 4. Frontend Authorization

- `canAccessPath()` in `shared/src/auth-contract.ts` maps roles → allowed routes
- `RoleShell` component renders role-specific navigation
- Frontend routes are role-aware at the UI layer
- **Gap**: No backend enforcement means frontend is the only barrier for many modules

---

## 5. Access Matrix by Resource Type

| Resource | PATIENT | DOCTOR | CLINIC_MGR | PHARMACY | LAB | ADMIN | SYSTEM |
|----------|---------|--------|------------|----------|-----|-------|--------|
| Own Profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | - |
| Other Profile | ❌ | 👁️ | 👁️ | ❌ | ❌ | ✅ | - |
| Own Health Records | ✅ | - | - | - | - | ✅ | - |
| Patient Health Records | ❌ | 👁️ consent | 👁️ consent | ❌ | ❌ | ✅ | ✅ |
| Prescriptions | ❌ | ✏️ | ✏️ | 👁️ | ❌ | ✅ | - |
| Appointments | ✅ own | ✅ own | ✅ clinic | ❌ | ❌ | ✅ | - |
| Consents | ✅ own | ✅ own | ❌ | ❌ | ❌ | ✅ | - |
| Analytics | ❌ | ❌ | 👁️ | ❌ | ❌ | ✅ | - |
| Insurance | ❌ | 👁️ | ✏️ | ❌ | ❌ | ✅ | ✅ |
| Billing | ❌ | 👁️ | ✏️ | ❌ | ❌ | ✅ | - |
| Staff Management | ❌ | ❌ | ✏️ clinic | ❌ | ❌ | ✅ | - |
| AI Assessments | ✅ own | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Telemedicine | ✅ own | ✅ own | ❌ | ❌ | ❌ | ✅ | - |
| Pharmacy Orders | ❌ | ✏️ | ❌ | ✏️ | ❌ | ✅ | - |
| Lab Reports | ✅ own | 👁️ | ✅ | ❌ | ✏️ | ✅ | - |
| System Config | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | - |
| Audit Logs | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | - |

Legend: ✅ = Full, 👁️ = Read-only, ✏️ = Write, ❌ = No access, - = N/A

---

## 6. Fix Plan

### Priority 1 — Add RolesGuard to 21 JwtAuthGuard-only controllers
Estimated: 30 min per controller → ~10 hours total. **High risk exposure.**

### Priority 2 — Fix Queue Monitor guard order
Add `JwtAuthGuard` before `RolesGuard`.

### Priority 3 — Add @Roles to uncovered routes in Prescription, Insurance, Workspace
~15 routes total.

### Priority 4 — Make AI Lifestyle ownership checks blocking
Change warning logs to `UnauthorizedException`.

### Priority 5 — Add guards to no-guard controllers
Clinic Branding, Specialties (PHI!), Discovery.

### Priority 6 — Implement global guard registration (optional)
Prevent accidentally unprotected new controllers.

---

## Scoring

| Dimension | Score | Max |
|-----------|-------|-----|
| Controller-level role enforcement | 25 | 40 |
| Resource-level authorization | 30 | 30 |
| Frontend authorization | 15 | 15 |
| Database-level RLS | 10 | 10 |
| Audit & monitoring | 5 | 5 |
| **Total** | **85** | **100** |

*Post-fix target.* Current pre-fix score is approximately 45/100 due to 21 unprotected controllers.
