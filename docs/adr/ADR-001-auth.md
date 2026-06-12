# ADR-001: Authentication & Authorization with Supabase Auth

**Status:** Accepted  
**Date:** 2026-06-12  
**Deciders:** Vimarshak Prudhvi  
**Tags:** auth, security, supabase, jwt

---

## Context

WyshCare requires a robust authentication system handling:
- Patient, doctor, clinic staff, pharmacy, lab, and admin user personas
- Phone-OTP-based primary auth (India market, ABDM compliance)
- JWT-based session management with refresh token rotation
- Role-based access control (RBAC) with 11 distinct roles
- Device session management and auditability
- Emergency access and consent-based delegation

## Decision Drivers

- **India-market fit:** Phone-first auth, ABDM ABHA address integration, Aadhaar compatibility
- **Compliance:** HIPAA, DPDP Act 2023, ABDM guidelines — need audit trails and granular access control
- **Multi-tenancy:** Organization-based isolation via tenantId fields and RLS
- **Platform consistency:** Already using Supabase for PostgreSQL, storage, and realtime

## Considered Options

| Option | Pros | Cons |
|--------|------|------|
| **Supabase Auth** | Built on PostgreSQL; native RLS integration; GoTrue; shared session with storage/realtime; lowest operational overhead | Limited built-in MFA customization; no native SSO without extra config |
| **Auth0** | Enterprise-grade; extensive SSO/social; rich MFA | Cost scales with MAU; external identity store adds sync complexity; no RLS integration |
| **AWS Cognito** | Tight AWS integration; scalable | Complex configuration; no native RLS; poor developer experience for phone-OTP flows |
| **Firebase Auth** | Quick to integrate; good phone auth | Google-cloud locked; no Postgres-level security integration; MFA limited |

## Decision

**Use Supabase Auth** with a complementary custom auth layer in the NestJS backend.

### Key Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client                            │
│  (Next.js / iOS / Flutter)                           │
└────────────┬───────────────────────────┬─────────────┘
             │ Phone/OTP                 │ JWT (access + refresh)
             ▼                           ▼
┌──────────────────────┐   ┌───────────────────────────┐
│  Supabase Auth        │   │  NestJS Auth Module        │
│  (GoTrue)             │──▶│  - Token validation         │
│  - Phone OTP          │   │  - Role extraction (JWT)    │
│  - Password (admin)   │   │  - Refresh rotation         │
│  - JWT issuance       │   │  - Device session mgmt      │
└──────────────────────┘   └──────────┬──────────────────┘
                                       │
                                       ▼
                              ┌────────────────────┐
                              │  RLS Policies       │
                              │  (Postgres level)    │
                              └────────────────────┘
```

### JWT Strategy

1. **Access Token:** Short-lived (15 min), contains `userId`, `role`, `tenantId` in custom claims (`app_metadata` and `user_metadata`)
2. **Refresh Token:** Long-lived (7 days), stored hashed as `RefreshToken` model, rotation on each use (old token revoked on refresh)
3. **Device Session:** Tracked via `DeviceSession` model — device fingerprint, IP, user agent, last-seen timestamp
4. **Token Validation:** Backend validates JWT signature with Supabase JWKS endpoint; custom middleware extracts `role` and `tenantId` from claims

### RBAC Model

Roles defined in `Role` enum:
```
PATIENT, DOCTOR, NURSE, CAREGIVER, CLINIC_MANAGER,
PHARMACY_PARTNER, LAB_PARTNER, ADMIN, SUPER_ADMIN, SUPPORT, SYSTEM
```

- `UserRole` model maps users to roles with unique constraint per `(userId, role)`
- Guards (`@Roles(Role.DOCTOR)`) enforce access at controller level
- RLS policies enforce row-level security using `auth.uid()` and `current_setting('app.tenant_id')`

### Supabase Integration

- `supabase_migrations/` directory contains all migration SQL
- Auth schema (`auth.users`) linked to application `User` model via `userId` foreign key
- Backend uses Supabase JS client for admin operations (user creation, phone verification)
- RLS policies applied on all tables for tenant isolation and patient data access

### Refresh Token Rotation

- Each refresh token usage generates a new token and revokes the old one (rotation)
- `RefreshToken.deviceId` links to `DeviceSession` for device-level management
- Revoked tokens are detected via `tokenHash` lookup; replay triggers revocation of all tokens for that user

## Consequences

**Positive:**
- Single identity provider reduces operational complexity
- RLS integration means security is enforced at database level, not just application layer
- Phone-OTP flow aligns with Indian healthcare market expectations
- Open-source GoTrue allows customization if needed

**Negative:**
- Supabase Auth is less feature-rich than Auth0 for enterprise SSO
- Custom refresh token rotation adds implementation complexity
- MFA requires building on top of existing Supabase MFA primitives

**Mitigations:**
- Custom auth module handles all advanced token management
- Admin credential model supports password + MFA for admin users
- Emergency access bypass flows handled via separate `EmergencyAccess` model with audit trail
