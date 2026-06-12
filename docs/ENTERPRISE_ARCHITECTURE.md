# WYSHCARE OS — Enterprise Architecture

> India's AI-powered healthcare operating system.
> Master Architecture Document — v1.0

---

## Table of Contents

1. [Monorepo Structure](#1-monorepo-structure)
2. [System Architecture](#2-system-architecture)
3. [Database Schema](#3-database-schema)
4. [RBAC Schema](#4-rbac-schema)
5. [API Contracts](#5-api-contracts)
6. [Event Architecture](#6-event-architecture)
7. [Service Architecture](#7-service-architecture)
8. [Route Architecture](#8-route-architecture)
9. [Design System](#9-design-system)
10. [Component Inventory](#10-component-inventory)
11. [User Journeys](#11-user-journeys)
12. [State Management Architecture](#12-state-management-architecture)
13. [AI Architecture](#13-ai-architecture)
14. [Healthcare Graph Architecture](#14-healthcare-graph-architecture)
15. [ABDM Integration Architecture](#15-abdm-integration-architecture)
16. [Infrastructure Architecture](#16-infrastructure-architecture)
17. [CI/CD Architecture](#17-cicd-architecture)
18. [Kubernetes Deployment Architecture](#18-kubernetes-deployment-architecture)
19. [Implementation Plan](#19-implementation-plan)
20. [Production Readiness](#20-production-readiness)

---

## 1. Monorepo Structure

```
wyshcare/
├── apps/
│   ├── patient-app/               # patient.wyshcare.com
│   │   ├── app/                   # Next.js 16 App Router
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── verify/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── home/
│   │   │   │   ├── timeline/
│   │   │   │   ├── records/
│   │   │   │   ├── prescriptions/
│   │   │   │   ├── appointments/
│   │   │   │   ├── diagnostics/
│   │   │   │   ├── pharmacy/
│   │   │   │   ├── insurance/
│   │   │   │   ├── family/
│   │   │   │   ├── ai-twin/
│   │   │   │   └── settings/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── stores/
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   ├── doctor-app/                # doctor.wyshcare.com
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── today-patients/
│   │   │   │   ├── schedule/
│   │   │   │   ├── consultations/
│   │   │   │   │   └── [id]/            # Three-pane consultation workspace
│   │   │   │   │       ├── patient-context/
│   │   │   │   │       ├── notes/
│   │   │   │   │       └── actions/
│   │   │   │   ├── patients/
│   │   │   │   │   └── [id]/
│   │   │   │   ├── prescriptions/
│   │   │   │   ├── ai-copilot/
│   │   │   │   ├── messages/
│   │   │   │   └── analytics/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── stores/
│   │   └── package.json
│   │
│   ├── staff-app/                 # staff.wyshcare.com
│   │   ├── app/
│   │   │   ├── reception/
│   │   │   ├── nurse/
│   │   │   ├── lab/
│   │   │   └── pharmacy/
│   │   └── package.json
│   │
│   ├── admin-app/                 # admin.wyshcare.com
│   │   ├── app/
│   │   │   ├── organizations/
│   │   │   ├── users/
│   │   │   ├── roles/
│   │   │   ├── permissions/
│   │   │   ├── doctors/
│   │   │   ├── patients/
│   │   │   ├── abdm/
│   │   │   ├── integrations/
│   │   │   ├── ai-models/
│   │   │   ├── payments/
│   │   │   ├── audit-logs/
│   │   │   ├── analytics/
│   │   │   └── settings/
│   │   └── package.json
│   │
│   ├── master-dashboard/          # dashboard.wyshcare.com
│   │   ├── app/
│   │   │   ├── workspace-select/
│   │   │   ├── recent-activity/
│   │   │   ├── notifications/
│   │   │   └── profile/
│   │   └── package.json
│   │
│   ├── public-site/               # wyshcare.com
│   │   ├── app/
│   │   │   ├── landing/
│   │   │   ├── pricing/
│   │   │   ├── about/
│   │   │   ├── careers/
│   │   │   └── blog/
│   │   └── package.json
│   │
│   └── api-gateway/               # api-gateway service
│       └── package.json
│
├── packages/
│   ├── design-system/             # Enterprise design system
│   │   ├── src/
│   │   │   ├── tokens/           # Colors, typography, spacing, shadows
│   │   │   ├── primitives/       # Button, Input, Select, Checkbox, Radio
│   │   │   ├── composite/        # Card, Dialog, Sheet, Table, DataGrid
│   │   │   ├── navigation/       # Sidebar, Topbar, Tabs, Breadcrumbs
│   │   │   ├── charts/           # Line, Bar, Area, Pie, Donut
│   │   │   ├── layout/           # Stack, Grid, Container, Section
│   │   │   └── utils/            # cn(), cx(), mergeTailwind()
│   │   ├── tailwind.plugin.ts
│   │   └── package.json
│   │
│   ├── ui/                        # Shared application UI components
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   ├── otp-verify.tsx
│   │   │   └── phone-input.tsx
│   │   ├── healthcare/
│   │   │   ├── patient-card.tsx
│   │   │   ├── prescription-view.tsx
│   │   │   ├── appointment-card.tsx
│   │   │   ├── vital-display.tsx
│   │   │   ├── timeline-entry.tsx
│   │   │   ├── soap-notes.tsx
│   │   │   └── medication-list.tsx
│   │   ├── telemedicine/
│   │   │   ├── video-grid.tsx
│   │   │   ├── chat-panel.tsx
│   │   │   └── screen-share.tsx
│   │   └── common/
│   │       ├── avatar.tsx
│   │       ├── status-badge.tsx
│   │       ├── error-boundary.tsx
│   │       └── loading-skeleton.tsx
│   │
│   ├── auth/                      # Auth logic (shared across apps)
│   │   ├── use-auth.ts
│   │   ├── auth-store.ts
│   │   ├── auth-guard.tsx
│   │   └── role-guard.tsx
│   │
│   ├── permissions/               # RBAC logic
│   │   ├── permission-types.ts
│   │   ├── use-permissions.ts
│   │   └── permission-guard.tsx
│   │
│   ├── abdm/                      # ABDM integration client
│   │   ├── use-abha.ts
│   │   ├── abha-connect.tsx
│   │   └── consent-manager.tsx
│   │
│   ├── notifications/             # Real-time notification client
│   │   ├── notification-store.ts
│   │   ├── notification-bell.tsx
│   │   └── notification-toast.tsx
│   │
│   ├── analytics/                 # Frontend analytics events
│   │   ├── track.ts
│   │   └── analytics-provider.tsx
│   │
│   ├── ai-core/                   # AI client SDK
│   │   ├── use-ai-copilot.ts
│   │   ├── use-health-twin.ts
│   │   └── use-clinical-qa.ts
│   │
│   ├── healthcare-core/           # Healthcare domain primitives
│   │   ├── types/
│   │   │   ├── patient.ts
│   │   │   ├── appointment.ts
│   │   │   ├── prescription.ts
│   │   │   ├── diagnosis.ts
│   │   │   ├── medication.ts
│   │   │   ├── lab-report.ts
│   │   │   ├── vital-signs.ts
│   │   │   ├── insurance.ts
│   │   │   └── billing.ts
│   │   ├── validators/
│   │   │   ├── abha-validator.ts
│   │   │   ├── drug-interaction.ts
│   │   │   └── clinical-codes.ts
│   │   └── constants/
│   │       ├── icd-codes.ts
│   │       ├── loinc-codes.ts
│   │       └── snomed-codes.ts
│   │
│   └── shared-types/             # TypeScript types shared everywhere
│       ├── api.ts
│       ├── user.ts
│       ├── pagination.ts
│       └── audit.ts
│
├── services/                      # Backend microservices
│   ├── identity-service/          # Auth, OTP, sessions, device management
│   ├── patient-service/           # Patient profile, timeline, records
│   ├── doctor-service/            # Doctor profiles, schedules, ratings
│   ├── appointment-service/       # Booking, scheduling, reminders
│   ├── ehr-service/               # Electronic Health Records storage
│   ├── prescription-service/      # Rx creation, validation, history
│   ├── pharmacy-service/          # Pharmacy marketplace, inventory, orders
│   ├── diagnostic-service/        # Lab test catalog, ordering, results
│   ├── billing-service/           # Payments, invoices, insurance claims
│   ├── analytics-service/         # Platform analytics, provider insights
│   ├── notification-service/      # Multi-channel notification orchestration
│   ├── ai-service/                # AI inference, graph ops, twin updates
│   └── audit-service/             # Immutable audit trail
│
├── infrastructure/
│   ├── docker/
│   │   ├── Dockerfile.backend
│   │   └── Dockerfile.frontend
│   ├── kubernetes/
│   │   ├── backend/
│   │   ├── frontend/
│   │   ├── ingress/
│   │   └── monitoring/
│   ├── terraform/
│   │   ├── aws/
│   │   ├── rds/
│   │   ├── redis/
│   │   ├── kafka/
│   │   └── k8s/
│   └── github-actions/
│       ├── ci-backend.yml
│       ├── ci-frontend.yml
│       ├── cd-staging.yml
│       └── cd-production.yml
│
├── docs/
│   └── ENTERPRISE_ARCHITECTURE.md
│
├── package.json                  # Workspace root
├── turbo.json                    # Turborepo config
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .eslintrc.js
├── .prettierrc
└── .github/
    └── CODEOWNERS
```

---

## 2. System Architecture

### High-Level Architecture Diagram (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                   │
│                                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │ Patient  │  │  Doctor  │  │  Staff   │  │  Admin   │  │  Master   │ │
│  │   App    │  │   App    │  │   App    │  │   App    │  │ Dashboard │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬─────┘ │
│       │              │              │              │              │       │
│       └──────────────┴──────────────┴──────────────┴──────────────┘       │
│                                  │                                        │
│                          ┌───────┴────────┐                              │
│                          │   API Gateway   │                              │
│                          │   (Kong/AWS)    │                              │
│                          └───────┬────────┘                              │
├──────────────────────────────────┼────────────────────────────────────────┤
│                     SERVICE LAYER │                                        │
│                                  │                                        │
│  ┌──────────┐  ┌──────────┐  ┌──┴───────┐  ┌──────────┐  ┌───────────┐ │
│  │ Identity │  │ Patient  │  │  Doctor   │  │Appointment│  │   EHR     │ │
│  │ Service  │  │ Service  │  │  Service  │  │  Service  │  │  Service  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬─────┘ │
│       │              │              │              │              │       │
│  ┌────┴─────┐  ┌────┴─────┐  ┌────┴─────┐  ┌────┴─────┐  ┌────┴──────┐│
│  │Prescript.│  │ Pharmacy │  │Diagnostic│  │ Billing  │  │Analytics  ││
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │  │ Service   ││
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬──────┘│
│       │              │              │              │              │       │
│  ┌────┴─────┐  ┌────┴─────┐                                        │     │
│  │   AI     │  │  Audit   │  ┌───────────┐  ┌──────────┐           │     │
│  │ Service  │  │ Service  │  │Notification│  │Healthcare│           │     │
│  └────┬─────┘  └──────────┘  │  Service   │  │   Graph  │           │     │
│       │                      └────────────┘  └──────────┘           │     │
├───────┼──────────────────────────────────────────────────────────────┼─────┤
│       │                      INFRASTRUCTURE LAYER                    │     │
│       │                                                              │     │
│  ┌────┴──────────────────────────────────────────────────────────┐   │     │
│  │                    Event Bus (Kafka)                           │   │     │
│  │  topics: identity.*, patient.*, appointment.*, rx.*,          │   │     │
│  │  pharmacy.*, diagnostic.*, billing.*, notification.*,         │   │     │
│  │  analytics.*, audit.*                                         │   │     │
│  └───────────────────────────────────────────────────────────────┘   │     │
│                                                                       │     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐   │     │
│  │ PostgreSQL │  │   Redis    │  │   Kafka    │  │  S3/MinIO    │   │     │
│  │  (Primary) │  │ (Cache/Q)  │  │  (Events)  │  │ (Storage)    │   │     │
│  └────────────┘  └────────────┘  └────────────┘  └──────────────┘   │     │
│                                                                       │     │
│  ┌──────────────────────────────────────────────────────────────┐   │     │
│  │            Observability Stack (Grafana + Loki + Tempo)       │   │     │
│  └──────────────────────────────────────────────────────────────┘   │     │
└───────────────────────────────────────────────────────────────────────┘─────┘
```

### Request Flow

```
Browser → CDN (CloudFront) → Next.js Server (Edge/Lambda)
  → API Gateway (Kong) → Service (NestJS) → Database

Events:
  Service → Kafka Topic → Consumer → Side Effect
    (notification, audit, analytics, graph update)
```

### Communication Patterns

| Pattern | Protocol | Use Case |
|---------|----------|----------|
| Synchronous | HTTP/REST | CRUD operations, real-time queries |
| Asynchronous | Kafka | Event-driven side effects, cross-service communication |
| Real-time | WebSocket (Socket.IO) | Live notifications, telemedicine chat |
| Streaming | WebRTC (LiveKit) | Video/audio consultations |

---

## 3. Database Schema

The current Prisma schema has **28 enums** and **44+ models**. Below is the complete entity-relationship model organized by domain.

### Domain: Identity & Access

```
User ──1:N──> UserRole ──N:1──> Role (enum)
  │
  ├──1:1──> ProviderProfile (KYC, payouts)
  ├──1:1──> DoctorProfile ──N:M──> Clinic (via DoctorClinic)
  ├──1:N──> DeviceSession
  ├──1:N──> RefreshToken
  ├──1:N──> OtpChallenge
  ├──1:N──> StaffAssignment ──N:1──> Clinic
  └──1:N──> AuditLog
```

### Domain: Healthcare Records

```
HealthRecord ──N:1──> User
  ├──1:N──> Prescription ──1:N──> Medication
  ├──1:N──> DiagnosticReport
  └──1:N──> TimelineEvent

ConsultationSession ──N:1──> Appointment
  ├──1:N──> ConsultationRecording
  ├──1:N──> ConsultationTranscript
  ├──1:N──> ConsultationSOAP
  └──1:N──> ConsultationSummary
```

### Domain: Appointments & Scheduling

```
Appointment ──N:1──> User (patient)
  ├──N:1──> DoctorProfile
  └──1:1──> ConsultationSession

DoctorProfile ──N:M──> Clinic (via DoctorClinic with availability schedules)
```

### Domain: Commerce

```
PharmacyPartner ──1:N──> PharmacyInventory
PharmacyPartner ──1:N──> PharmacyOrder
PharmacyOrder ──N:1──> User
PharmacyCartItem ──N:1──> User
PharmacyCartItem ──N:1──> PharmacyInventory

DiagnosticsPartner ──1:N──> DiagnosticOrder
DiagnosticOrder ──N:1──> User

PaymentOrder (polymorphic via resourceType + resourceId)
```

### Domain: AI & Graph

```
AIMemoryNode (polymorphic: PATIENT, DOCTOR, CONDITION, etc.)
AIMemoryEdge ──N:1──> AIMemoryNode (from)
  └──N:1──> AIMemoryNode (to)

AIJob (queue: OCR, summary, analysis, sync, etc.)
```

### Domain: Notifications & Engagement

```
Notification ──N:1──> User
NotificationPreference ──1:1──> User
NotificationTemplate

CarePlan ──N:1──> User
  ├──1:N──> CarePlanMilestone
  └──1:N──> CarePlanLog

MedicationAdherenceLog ──N:1──> Medication
MedicationReminder ──N:1──> User
```

### Domain: Compliance & Sharing

```
ConsentGrant ──N:1──> User
ShareLink ──N:1──> User
EmergencyAccess ──N:1──> User
ABDMLinkage ──1:1──> User
FamilyRelation (self-referencing User via relatedUserId)
```

### Upcoming Schema Additions (Sprint 17+)

```prisma
model DiagnosticReport {
  id              String   @id @default(cuid())
  orderId         String
  patientUserId   String
  testCode        String   // LOINC
  testName        String
  resultValue     String?
  resultUnit      String?
  referenceRange  String?
  isAbnormal      Boolean  @default(false)
  interpretation  String?  // AI-generated
  pdfUrl          String?
  recordedAt      DateTime @default(now())
  User            User     @relation(fields: [patientUserId], references: [id])
  @@index([patientUserId])
}

model InsurancePlan {
  id              String   @id @default(cuid())
  providerName    String
  planName        String
  planType        String   // INDIVIDUAL, FAMILY, GROUP
  coverageAmount  Decimal
  deductible      Decimal
  copay           Decimal
  networkType     String   // IN_NETWORK, OUT_OF_NETWORK, BOTH
  isActive        Boolean  @default(true)
}

model InsuranceClaim {
  id              String   @id @default(cuid())
  userId          String
  appointmentId   String?
  prescriptionId  String?
  claimNumber     String   @unique
  amount          Decimal
  status          String   // SUBMITTED, PROCESSING, APPROVED, DENIED, PAID
  insurerResponse Json?
  submittedAt     DateTime @default(now())
  resolvedAt      DateTime?
  User            User     @relation(fields: [userId], references: [id])
}
```

---

## 4. RBAC Schema

### Role Hierarchy

```
SYSTEM
  └── SUPER_ADMIN
        └── ADMIN
              ├── CLINIC_MANAGER
              │     ├── DOCTOR
              │     ├── NURSE
              │     ├── RECEPTIONIST
              │     ├── LAB_STAFF
              │     └── PHARMACIST
              └── SUPPORT
```

### Permission Matrix

```
resource:action

patient:
  ├── patient.read        (own-self, doctor-of, family-of, consent-granted)
  ├── patient.write       (own-self, family-manager, emergency-access)
  ├── patient.delete      (admin, super-admin)
  ├── patient.export      (patient-own, doctor-of, admin)
  └── patient.emergency   (emergency-access, doctor-on-duty)

appointment:
  ├── appointment.create     (patient, doctor, receptionist)
  ├── appointment.read       (patient-own, doctor-assigned, clinic-staff)
  ├── appointment.update     (patient-own, doctor-assigned, receptionist)
  ├── appointment.cancel     (patient-own, doctor-assigned, admin)
  └── appointment.confirm    (doctor, receptionist)

prescription:
  ├── prescription.create    (doctor)
  ├── prescription.read      (patient-own, doctor, pharmacist, consent)
  ├── prescription.update    (doctor-own)
  ├── prescription.dispense  (pharmacist)
  └── prescription.delete    (admin, super-admin)

ehr:
  ├── ehr.read               (patient-own, doctor-of, consent)
  ├── ehr.write              (doctor, lab-staff, nurse)
  ├── ehr.export             (patient-own, admin)
  └── ehr.share              (patient)

pharmacy:
  ├── pharmacy.order.create      (patient)
  ├── pharmacy.order.read        (patient-own, pharmacist-assigned)
  ├── pharmacy.order.update      (pharmacist, admin)
  └── pharmacy.inventory.manage  (pharmacist, pharmacy-partner)

diagnostics:
  ├── diagnostics.order.create   (doctor, patient)
  ├── diagnostics.order.read     (patient-own, doctor, lab-staff)
  ├── diagnostics.result.enter   (lab-staff)
  └── diagnostics.result.verify  (lab-manager, doctor)

telemedicine:
  ├── telemedicine.session.create   (doctor, patient)
  ├── telemedicine.session.join     (doctor, patient)
  ├── telemedicine.session.end      (doctor)
  └── telemedicine.recording.manage (doctor, admin)

admin:
  ├── admin.organization.manage  (super-admin)
  ├── admin.users.manage         (admin, super-admin)
  ├── admin.roles.manage         (super-admin)
  ├── admin.audit.read           (admin, super-admin)
  ├── admin.ai.govern            (admin, super-admin)
  └── admin.billing.manage       (admin, super-admin)
```

### Permission Check Flow

```
Request
  → JwtAuthGuard (validates token, attaches user)
    → RolesGuard (checks user has required role)
      → PermissionGuard (checks user has resource.action)
        → AuditLog (logs the access)
          → Handler
```

### Permission Implementation (PostgreSQL)

```sql
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource TEXT NOT NULL,      -- 'patient', 'prescription', etc.
    action TEXT NOT NULL,        -- 'read', 'write', 'delete'
    description TEXT,
    UNIQUE(resource, action)
);

CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id),
    permission_id UUID REFERENCES permissions(id),
    condition TEXT,              -- 'own', 'family', 'doctor-of', etc.
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_permissions (
    user_id UUID REFERENCES users(id),
    permission_id UUID REFERENCES permissions(id),
    resource_id TEXT,            -- specific resource ID or '*'
    granted_by UUID REFERENCES users(id),
    expires_at TIMESTAMPTZ,
    PRIMARY KEY (user_id, permission_id, resource_id)
);

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    outcome TEXT NOT NULL,       -- 'GRANTED', 'DENIED'
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. API Contracts

### API Gateway Convention

```
Base URL: api.wyshcare.com/v1

Headers:
  Authorization: Bearer <jwt>
  X-Request-Id: <uuid>
  X-Csrf-Token: <token>
  Accept-Language: hi|en|mr|ta|te|bn|gu|kn|ml|pa

Response Envelope:
{
  "success": true,
  "data": { ... },
  "pagination": { "page": 1, "limit": 20, "total": 142 },
  "requestId": "uuid"
}

Error Envelope:
{
  "success": false,
  "error": {
    "code": "PATIENT_NOT_FOUND",
    "message": "Patient not found",
    "details": { ... },
    "statusCode": 404
  },
  "requestId": "uuid"
}
```

### Core API Surface

```
Auth Module:
  POST   /auth/csrf                          → { csrfToken }
  POST   /auth/login                          → { challengeIssued }
  POST   /auth/register                       → { challengeIssued }
  POST   /auth/otp/verify                     → { accessToken, refreshToken, user }
  POST   /auth/refresh                        → { accessToken, refreshToken, user }
  POST   /auth/logout                         → { loggedOut }
  GET    /auth/me                             → User
  GET    /auth/sessions                       → DeviceSession[]
  PATCH  /auth/sessions/:id/revoke            → { revoked }

Patient Module:
  GET    /patients/me                         → PatientProfile
  PATCH  /patients/me                         → PatientProfile
  GET    /patients/me/timeline                → TimelineEvent[]
  GET    /patients/me/records                 → HealthRecord[]
  GET    /patients/me/records/:id             → HealthRecord
  POST   /patients/me/records                 → HealthRecord
  DELETE /patients/me/records/:id             → { deleted }

Doctor Module:
  GET    /doctors/profile                     → DoctorProfile
  PATCH  /doctors/profile                     → DoctorProfile
  GET    /doctors/:id/schedule                → AvailabilitySlot[]
  PUT    /doctors/:id/schedule                → AvailabilitySlot[]
  GET    /doctors/:id/patients                → Patient[]

Appointment Module:
  GET    /appointments                        → Appointment[]
  POST   /appointments                        → Appointment
  GET    /appointments/:id                    → Appointment
  PATCH  /appointments/:id                    → Appointment
  POST   /appointments/:id/cancel             → Appointment
  GET    /appointments/slots                  → TimeSlot[]

Telemedicine Module:
  POST   /telemedicine/session/create         → Session
  POST   /telemedicine/session/join           → { token, roomName }
  POST   /telemedicine/session/end            → Session
  POST   /telemedicine/:id/generate-soap      → SOAPNotes
  POST   /telemedicine/:id/generate-summary   → Summary
  GET    /telemedicine/dashboard/patient      → Dashboard
  GET    /telemedicine/dashboard/doctor       → Dashboard

Prescription Module:
  GET    /prescriptions                       → Prescription[]
  POST   /prescriptions                       → Prescription
  GET    /prescriptions/:id                   → Prescription
  PATCH  /prescriptions/:id                   → Prescription
  POST   /prescriptions/:id/dispense          → Prescription
  GET    /prescriptions/templates             → RxTemplate[]

Pharmacy Module:
  GET    /pharmacy/partners                   → PharmacyPartner[]
  GET    /pharmacy/partners/:id               → PharmacyPartner
  GET    /pharmacy/partners/:id/inventory     → InventoryItem[]
  POST   /pharmacy/seed-demo                  → { partners, items }
  GET    /pharmacy/cart                       → Cart
  POST   /pharmacy/cart                       → CartItem
  PUT    /pharmacy/cart/:id                   → CartItem
  DELETE /pharmacy/cart/:id                   → { deleted }
  DELETE /pharmacy/cart                       → { cleared }
  GET    /pharmacy/orders                     → Order[]
  POST   /pharmacy/orders                     → Order
  GET    /pharmacy/orders/:id                 → Order
  PATCH  /pharmacy/orders/:id/status          → Order
  POST   /pharmacy/parse-prescription         → { medications }
  GET    /pharmacy/compare-prices             → PriceComparison[]
  GET    /pharmacy/partner/orders             → Order[]
  GET    /pharmacy/partner/dashboard          → Dashboard

Diagnostics Module:
  GET    /diagnostics/partners                → DiagnosticsPartner[]
  GET    /diagnostics/tests                   → LabTest[]
  POST   /diagnostics/orders                  → DiagnosticOrder
  GET    /diagnostics/orders                  → DiagnosticOrder[]
  GET    /diagnostics/orders/:id              → DiagnosticOrder
  POST   /diagnostics/orders/:id/upload       → DiagnosticReport
  POST   /diagnostics/orders/:id/verify       → DiagnosticReport

Billing Module:
  GET    /billing/invoices                    → Invoice[]
  GET    /billing/invoices/:id                → Invoice
  POST   /billing/payments                    → PaymentOrder
  POST   /billing/payments/:id/verify         → PaymentOrder
  GET    /billing/insurance                   → InsuranceClaim[]
  POST   /billing/insurance                   → InsuranceClaim

Health Graph Module:
  GET    /health-graph                        → Graph
  GET    /health-graph/summary                → Summary
  GET    /health-graph/risks                  → RiskAssessment
  GET    /health-graph/nodes                  → Node[]
  GET    /health-graph/nodes/:id/connections  → Edge[]
  GET    /health-graph/path?from=&to=          → Path
  POST   /health-graph/query                  → { answer, evidence }
  POST   /health-graph/sync/consultation/:id  → { synced }
  POST   /health-graph/sync/lab-report/:id    → { synced }
  POST   /health-graph/sync/appointment/:id   → { synced }

Health Twin Module:
  GET    /health-twin                         → HealthTwin
  POST   /health-twin/ask                     → { answer, evidence }
  GET    /health-twin/trends                  → Trend[]
  GET    /health-twin/scores                  → RiskScore[]

Notification Module:
  GET    /notifications                       → Notification[]
  GET    /notifications/unread-count          → { count }
  PATCH  /notifications/:id/read              → Notification
  PATCH  /notifications/read-all              → { updated }
  GET    /notifications/preferences           → Preferences
  PUT    /notifications/preferences           → Preferences

Admin Module:
  GET    /admin/organizations                 → Organization[]
  POST   /admin/organizations                 → Organization
  GET    /admin/users                         → User[]
  POST   /admin/users                         → User
  GET    /admin/roles                         → Role[]
  POST   /admin/roles                         → Role
  GET    /admin/permissions                   → Permission[]
  POST   /admin/permissions                   → Permission
  GET    /admin/audit-logs                    → AuditLog[]
  GET    /admin/analytics                     → Analytics
  GET    /admin/abdm/monitoring               → ABDMStatus
  POST   /admin/ai-models/deploy              → { deployed }
  GET    /admin/payments                      → Transaction[]
```

---

## 6. Event Architecture

### Event Bus Topology

```
Kafka Cluster: wyshcare-events (3 brokers, replication=3)

Topics:
  identity.user.created        ───> patient-service, notification-service, analytics
  identity.user.updated        ───> patient-service, graph-service
  identity.session.created     ───> audit-service
  identity.session.revoked     ───> audit-service

  appointment.created          ───> notification-service, timeline-service, analytics
  appointment.confirmed        ───> notification-service
  appointment.cancelled        ───> notification-service, timeline-service
  appointment.checked-in       ───> notification-service
  appointment.completed        ───> ehr-service, graph-service, billing-service

  consultation.session.created ───> notification-service, analytics
  consultation.session.joined  ───> audit-service
  consultation.session.ended   ───> ehr-service, graph-service, ai-service (SOAP gen)
  consultation.soap.generated  ───> graph-service, timeline-service, notification-service
  consultation.summary.generated ──> graph-service, timeline-service

  prescription.created         ───> pharmacy-service, timeline-service, graph-service
  prescription.dispensed       ───> patient-service, notification-service

  pharmacy.order.created       ───> notification-service, analytics
  pharmacy.order.status.updated───> notification-service, timeline-service
  pharmacy.inventory.low       ───> notification-service

  diagnostic.order.created     ───> notification-service, lab-service
  diagnostic.result.uploaded   ───> notification-service, graph-service, ai-service
  diagnostic.result.verified   ───> notification-service, timeline-service

  billing.payment.completed    ───> pharmacy-service, appointment-service, analytics
  billing.payment.failed       ───> notification-service
  billing.claim.submitted      ───> analytics

  notification.sent            ───> analytics
  notification.delivered       ───> analytics
  notification.failed          ───> notification-service (retry)

  graph.node.created           ───> ai-service (twin sync)
  graph.edge.created           ───> ai-service (risk update)
  graph.risk.updated           ───> notification-service (alert patient)

  audit.log.created            ───> analytics, compliance-monitor

  ai.job.completed             ───> calling-service (webhook/callback)
  ai.job.failed                ───> calling-service, admin-alert
```

### Event Envelope

```typescript
interface DomainEvent<T = unknown> {
  id: string;                    // UUID v7
  type: string;                  // "appointment.created"
  source: string;                // "appointment-service"
  version: number;               // 1
  timestamp: string;             // ISO 8601
  correlationId: string;         // Trace across services
  actorUserId?: string;
  patientUserId?: string;
  tenantId?: string;
  data: T;
  metadata: {
    requestId: string;
    ipAddress?: string;
    userAgent?: string;
  };
}
```

---

## 7. Service Architecture

### Identity Service

```
Responsibilities:
  - User registration and authentication
  - OTP generation and verification
  - JWT token management
  - Device session tracking
  - Passwordless magic links
  - Social sign-on (Google, Apple)

Dependencies:
  - PostgreSQL (users, sessions, tokens, challenges)
  - Redis (session cache, rate limiting)
  - SMS/Email provider (OTP delivery)

Port: 3001 (uses API Gateway path /identity/*)
```

### Patient Service

```
Responsibilities:
  - Patient profile management
  - Health timeline aggregation
  - Medical records CRUD
  - Family account management
  - Emergency profile

Dependencies:
  - PostgreSQL, S3 (record storage)

Port: 3002
```

### Doctor Service

```
Responsibilities:
  - Doctor profile and KYC
  - Schedule and availability management
  - Rating and reviews
  - Patient list management

Port: 3003
```

### Appointment Service

```
Responsibilities:
  - Slot management
  - Booking and rescheduling
  - Check-in workflow
  - Reminder dispatch (via notification service)
  - Waitlist management

Port: 3004
```

### EHR Service

```
Responsibilities:
  - Health record versioning
  - Record encryption and decryption
  - Consent-based access control
  - FHIR conversion (R4)
  - Record sharing (time-limited links)

Port: 3005
```

### Prescription Service

```
Responsibilities:
  - Rx creation and validation
  - Drug interaction checking
  - Dosage calculation
  - Rx templates
  - Dispensing workflow
  - Refill management

Port: 3006
```

### Pharmacy Service

```
Responsibilities:
  - Partner onboarding
  - Inventory management
  - Cart and ordering
  - Prescription parsing (AI)
  - Price comparison
  - Delivery tracking

Port: 3007
```

### Diagnostic Service

```
Responsibilities:
  - Partner management
  - Test catalog (LOINC)
  - Sample collection workflow
  - Report generation
  - AI-powered result interpretation

Port: 3008
```

### Billing Service

```
Responsibilities:
  - Payment processing (Razorpay)
  - Invoice generation
  - Insurance claims (NHCX)
  - Refund management
  - Subscription billing

Port: 3009
```

### Analytics Service

```
Responsibilities:
  - Platform metrics
  - Provider analytics
  - Population health trends
  - Report generation
  - Export (CSV, PDF)

Port: 3010
```

### Notification Service

```
Responsibilities:
  - Multi-channel dispatch (SMS, Email, Push, In-App, WhatsApp)
  - Template management
  - Delivery tracking
  - Rate limiting per channel
  - Retry logic with exponential backoff

Port: 3011
```

### AI Service

```
Responsibilities:
  - Clinical LLM inference
  - Health graph operations (node/edge CRUD, traversal)
  - Risk engine (graph-based)
  - Health twin assembly
  - Prescription parsing
  - Report summarization
  - Symptom analysis
  - Drug interaction checking

Port: 3012

AI Providers (configurable):
  - Primary: Gemini 2.5 Flash
  - Fallback chain: Gemini → OpenRouter → Anthropic → OpenAI
  - Model selection based on task complexity
```

### Audit Service

```
Responsibilities:
  - Immutable audit log storage
  - Tamper detection
  - Compliance reporting
  - Log retention/purging policies

Port: 3013
```

---

## 8. Route Architecture

### Frontend Route Design

All Next.js apps use the App Router with shared middleware for auth and permissions.

#### Patient App Routes (`patient.wyshcare.com`)

```
/                              → Redirect to /home
/home                          → Health summary, quick actions, upcoming appointments
/timeline                      → Chronological health timeline
/timeline/:id                  → Timeline entry detail
/records                       → Medical records list (filterable by type)
/records/:id                   → Record detail viewer
/prescriptions                 → Prescription list
/prescriptions/:id             → Prescription detail
/appointments                  → Appointment list
/appointments/book             → Booking flow (select doctor → slot → confirm)
/appointments/:id              → Appointment detail
/appointments/:id/join         → Telemedicine room
/diagnostics                   → Lab test catalog & order history
/diagnostics/book              → Book lab test (select → partner → slot)
/diagnostics/orders/:id        → Order detail with report
/pharmacy                      → Pharmacy marketplace
/pharmacy/search               → Search medicines
/pharmacy/orders               → Order history
/pharmacy/orders/:id           → Order tracking
/pharmacy/cart                 → Cart
/insurance                     → Insurance plans & claims
/insurance/claims              → Claim history
/insurance/claims/:id          → Claim detail
/family                        → Family members
/family/:id                    → Family member health (consent-gated)
/ai-twin                       → Health twin dashboard
/ai-twin/risks                 → Risk assessment
/ai-twin/trends                → Health trends
/ai-twin/ask                   → Ask AI about health
/settings                      → Profile, privacy, preferences, linked accounts
/settings/security             → Sessions, devices, 2FA
/settings/notifications        → Notification preferences
/settings/abdm                 → ABHA linkage, consent manager
/settings/emergency            → Emergency profile
```

#### Doctor App Routes (`doctor.wyshcare.com`)

```
/                              → Redirect to /dashboard
/dashboard                    → Today's stats, upcoming, recent activity
/today                         → Today's patient list with status
/schedule                      → Weekly schedule view
/schedule/manage               → Set availability
/consultations                 → Consultation history
/consultations/:id             → Three-pane consultation workspace
/patients                      → Patient registry
/patients/:id                  → Patient history summary
/patients/:id/records          → Patient records (consent-gated)
/prescriptions                 → Rx history
/prescriptions/create          → New prescription
/ai-copilot                    → AI assistance (embedded clinically)
/messages                      → Patient messages
/analytics                     → Personal analytics
/settings                      → Profile, schedule, fees, notifications
```

#### Staff App Routes (`staff.wyshcare.com`)

```
/                              → Role-based redirect
/reception                     → Reception dashboard
/reception/appointments        → Appointment management
/reception/check-in            → Check-in queue
/reception/billing             → Billing queue
/reception/walk-in             → Walk-in registration
/nurse                         → Nurse dashboard
/nurse/vitals                  → Vitals entry
/nurse/tasks                   → Assigned tasks
/lab                           → Lab dashboard
/lab/samples                   → Sample collection queue
/lab/processing                → Processing queue
/lab/reports                   → Report verification
/pharmacy                      → Pharmacy dashboard
/pharmacy/prescriptions        → Rx fulfillment queue
/pharmacy/inventory            → Inventory management
/pharmacy/orders               → Delivery orders
```

#### Admin App Routes (`admin.wyshcare.com`)

```
/organizations                 → Org management
/organizations/:id             → Org detail
/users                         → User management
/users/:id                     → User detail
/roles                         → Role management
/roles/:id                     → Role detail + permissions
/permissions                   → Permission audit
/doctors                       → Doctor directory
/doctors/:id                   → Doctor profile (admin view)
/patients                      → Patient directory
/patients/:id                  → Patient profile (admin view)
/abdm                          → ABDM integration status
/abdm/monitoring               → ABDM health
/integrations                  → Third-party integrations
/ai-models                     → AI model registry & governance
/payments                      → Payment transactions
/payments/refunds              → Refund management
/audit-logs                    → Immutable audit trail
/analytics                     → Platform analytics
/settings                      → Platform settings
```

---

## 9. Design System

### Token System

```typescript
// packages/design-system/src/tokens/colors.ts

export const colors = {
  // Brand
  brand: {
    50: '#f0f7ff',
    100: '#e0effe',
    200: '#b9dffb',
    300: '#7cc5f8',
    400: '#36a9f3',
    500: '#0c8ee7',
    600: '#0070c4',
    700: '#01599f',
    800: '#064b83',
    900: '#0b3f6d',
    950: '#07284a',
  },

  // Neutral (cool gray)
  neutral: {
    50: '#f8f9fa',
    100: '#f1f3f5',
    200: '#e9ecef',
    300: '#dee2e6',
    400: '#ced4da',
    500: '#adb5bd',
    600: '#868e96',
    700: '#495057',
    800: '#343a40',
    900: '#212529',
    950: '#0d1117',
  },

  // Semantic
  success: { 50: '#f0fdf4', 500: '#22c55e', 900: '#14532d' },
  warning: { 50: '#fffbeb', 500: '#f59e0b', 900: '#78350f' },
  error:   { 50: '#fef2f2', 500: '#ef4444', 900: '#7f1d1d' },
  info:    { 50: '#f0f9ff', 500: '#0ea5e9', 900: '#0c4a6e' },

  // Surface (dark mode)
  surface: {
    base:    '#ffffff',
    raised:  '#f8f9fa',
    overlay: '#00000080',
    ...dark: {
      base:    '#0d1117',
      raised:  '#161b22',
      overlay: '#000000cc',
    },
  },
};
```

```typescript
// packages/design-system/src/tokens/typography.ts

export const typography = {
  fontFamily: {
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", "SF Mono", Monaco, monospace',
  },

  fontSize: {
    display: ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: 700 }],
    heading1: ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: 600 }],
    heading2: ['2rem',   { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: 600 }],
    heading3: ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: 600 }],
    title:    ['1.25rem', { lineHeight: '1.4', letterSpacing: '0em', fontWeight: 500 }],
    body:     ['1rem',    { lineHeight: '1.6', letterSpacing: '0em', fontWeight: 400 }],
    bodySmall:['0.875rem', { lineHeight: '1.5', letterSpacing: '0em', fontWeight: 400 }],
    caption:  ['0.75rem',  { lineHeight: '1.4', letterSpacing: '0.02em', fontWeight: 400 }],
    label:    ['0.75rem',  { lineHeight: '1.25', letterSpacing: '0.05em', fontWeight: 500, textTransform: 'uppercase' }],
    code:     ['0.875rem', { lineHeight: '1.5', fontFamily: 'mono' }],
  },
};
```

```typescript
// packages/design-system/src/tokens/spacing.ts

export const spacing = {
  0:  '0px',
  1:  '4px',
  2:  '8px',
  3:  '12px',
  4:  '16px',
  5:  '20px',
  6:  '24px',
  8:  '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
};
```

### Tailwind Plugin

```typescript
// packages/design-system/tailwind.plugin.ts

import plugin from 'tailwindcss/plugin';

export default plugin(({ addBase, addComponents, theme }) => {
  addBase({
    ':root': {
      '--brand-50': '#f0f7ff',
      // ... all tokens as CSS variables
    },
    '*': { boxSizing: 'border-box' },
    body: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '1rem',
      lineHeight: '1.6',
      color: 'var(--neutral-900)',
      backgroundColor: 'var(--surface-base)',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    },
  });
});
```

### Component Design Principles

```
1. Composition over configuration
   - Components are small, focused, composable
   - Compound component pattern (e.g., <Select.Trigger>, <Select.Options>, <Select.Option>)

2. Accessible by default
   - All components meet WCAG 2.1 AA
   - Proper ARIA labels, roles, states
   - Keyboard navigable
   - Screen reader tested

3. Optimistic loading
   - Every action shows immediate feedback
   - Loading states are skeleton-based (not spinners)
   - Error states are contextual

4. Responsive without breakpoints
   - Fluid typography (clamp())
   - Container queries for component-level responsiveness
   - Mobile-first with progressive enhancement

5. Animation principles
   - Duration: 150ms (micro-interactions), 300ms (transitions), 500ms (page transitions)
   - Easing: cubic-bezier(0.16, 1, 0.3, 1) — "emphasized ease-out"
   - No animation for users who prefer reduced motion
```

---

## 10. Component Inventory

### Primitive Components

```
@wyshcare/ui/primitives
├── Button
│   ├── variant: primary | secondary | tertiary | ghost | danger
│   ├── size: sm | md | lg
│   ├── loading: boolean (shows skeleton pulse)
│   └── icon: ReactNode (optional icon slot)
│
├── Input
│   ├── variant: outline | filled | flushed
│   ├── size: sm | md | lg
│   ├── error: string
│   ├── hint: string
│   ├── prefix: ReactNode
│   └── suffix: ReactNode
│
├── Select
│   └── uses Radix UI Select primitive
│
├── Checkbox
│   └── indeterminate: boolean
│
├── Radio
│   └── RadioGroup (compound)
│
├── Switch
│   ├── size: sm | md
│   └── label: string
│
├── Textarea
│   └── autoResize: boolean
│
├── Avatar
│   ├── src: string
│   ├── fallback: string (initials)
│   ├── size: sm | md | lg | xl
│   └── status: online | busy | offline | away
│
├── Badge
│   ├── variant: success | warning | error | info | neutral
│   └── dot: boolean
│
├── Tooltip
│   ├── content: string
│   └── side: top | bottom | left | right
│
├── Popover
│   └── uses Radix UI Popover
│
├── Dialog
│   ├── size: sm | md | lg | fullscreen
│   ├── closeable: boolean
│   └── compound: Dialog.Trigger, Dialog.Content, Dialog.Header, Dialog.Footer
│
├── Sheet (slide-over panel)
│   ├── side: left | right
│   └── size: sm | md | lg
│
├── Command (⌘K palette)
│   ├── groups: CommandGroup[]
│   ├── items: CommandItem[]
│   └── shortcuts: string[]
│
├── Tabs
│   ├── variant: underline | pill | segmented
│   └── compound: Tabs.List, Tabs.Tab, Tabs.Panel
│
├── Accordion
│   └── multiple: boolean
│
├── Skeleton
│   ├── variant: text | circle | rect
│   └── width/height
│
├── Toast
│   ├── variant: success | error | warning | info
│   ├── action: { label, onClick }
│   └── dismissable: boolean
│
└── Progress
    ├── variant: linear | circular
    ├── value: number
    └── indeterminate: boolean
```

### Healthcare-Specific Components

```
@wyshcare/ui/healthcare
├── PatientCard
│   ├── avatar, name, age, gender, ABHA
│   ├── lastVisit: Date
│   ├── riskLevel: low | medium | high
│   └── actions: [message, schedule, records]
│
├── MedicalTimeline
│   ├── events: TimelineEvent[]
│   ├── filterable by type
│   └── zoomable (day/week/month/year)
│
├── PrescriptionView
│   ├── medications: Medication[]
│   ├── dosage instructions
│   ├── doctor signature
│   ├── digital stamp
│   └── print/download/share actions
│
├── SOAPNotes
│   ├── subjective (free text)
│   ├── objective (free text + vitals)
│   ├── assessment (ICD-10 coded)
│   └── plan (structured)
│   ├── AI suggestion button per section
│   └── approval workflow
│
├── VitalDisplay
│   ├── bp: { systolic, diastolic }
│   ├── heartRate: number
│   ├── temperature: number
│   ├── spo2: number
│   ├── respiratoryRate: number
│   ├── glucose: number
│   └── trend sparkline per vital
│
├── MedicationList
│   ├── medications: Medication[]
│   ├── adherence indicators
│   ├── refill status
│   └── drug interaction warnings
│
├── AppointmentCard
│   ├── doctor/patient info
│   ├── date/time
│   ├── mode (video/audio/in-person)
│   ├── status badge
│   └── action buttons
│
├── LabResultCard
│   ├── test name, value, unit, range
│   ├── abnormal flag
│   ├── trend chart
│   └── AI interpretation
│
├── RiskScoreCard
│   ├── condition name
│   ├── score (0-100)
│   ├── level (low/medium/high)
│   ├── contributing factors
│   └── recommendations
│
├── HealthTwinDashboard
│   ├── summary stats
│   ├── risk cards
│   ├── trend charts
│   ├── medication adherence
│   └── AI Q&A input
│
├── ConsultationWorkspace
│   ├── THREE-PANE LAYOUT:
│   │   ├── Left: Patient Context (history, vitals, records)
│   │   ├── Center: Notes (SOAP, free text, AI suggestions)
│   │   └── Right: Clinical Actions (prescribe, order labs, refer)
│   ├── telemedicine video embed
│   └── AI copilot sidebar
│
└── VideoGrid
    ├── participant tiles
    ├── screen share
    ├── chat overlay
    ├── recording indicator
    └── controls (mute, camera, end call)
```

### Layout Components

```
@wyshcare/ui/layout
├── AppShell
│   ├── sidebar (collapsible)
│   ├── topbar (search, notifications, profile)
│   ├── main content area
│   └── mobile bottom nav
│
├── Sidebar
│   ├── navigation items
│   ├── sub-navigation
│   ├── workspace switcher (master dashboard)
│   └── collapse/expand
│
├── Topbar
│   ├── search (⌘K)
│   ├── notification bell
│   ├── organization switcher
│   └── user menu
│
├── PageHeader
│   ├── title
│   ├── description
│   ├── breadcrumbs
│   └── actions (primary CTA, secondary actions)
│
├── DataGrid
│   ├── sortable columns
│   ├── filterable
│   ├── selectable rows
│   ├── pagination
│   ├── inline editing
│   └── export
│
├── StatCard
│   ├── label
│   ├── value
│   ├── trend (+12%)
│   ├── icon
│   └── sparkline
│
└── EmptyState
    ├── icon
    ├── title
    ├── description
    └── action CTA
```

---

## 11. User Journeys

### Patient Journey: First Healthcare Visit

```
1. Discovery
   ──> Lands on wyshcare.com
   ──> Signs up with phone number (+91)
   ──> Verifies OTP
   ──> Creates profile (name, age, gender, blood group)
   ──> Links ABHA (optional)

2. Healthcare Need
   ──> Searches for doctors (specialty, city, rating)
   ──> Views doctor profile (qualifications, fee, next available)
   ──> Selects slot
   ──> Books appointment
   ──> Receives confirmation (in-app + WhatsApp)

3. Consultation
   ──> On appointment day, receives reminder (30 min before)
   ──> Joins video call (one tap)
   ──> Doctor reviews history, conducts consultation
   ──> Doctor writes SOAP notes (AI-assisted)
   ──> Doctor issues e-prescription

4. Post-Consultation
   ──> Receives prescription digitally
   ──> Can order medicines from pharmacy (price comparison)
   ──> Can book lab tests if ordered
   ──> All events added to health timeline
   ──> Health graph updated with new condition + medication nodes

5. Follow-up
   ──> AI twin surfaces medication adherence tracking
   ──> Reminders for next dose
   ──> Automated follow-up scheduling recommendation
   ──> Risk score updated based on new data
```

### Doctor Journey: Daily Practice

```
1. Morning
   ──> Opens doctor.wyshcare.com
   ──> Dashboard shows: 12 appointments today, 3 pending Rx verifications
   ──> Reviews schedule for the day
   ──> AI copilot flags: 2 patients with medication changes since last visit

2. Patient Visit
   ──> Opens consultation workspace
   ──> Left pane: patient history, recent labs, current meds, graph summary
   ──> Records vitals (nurse has already entered)
   ──> Writes SOAP notes with AI assistance
   ──> AI suggests: diagnosis based on symptoms, drug interactions checked
   ──> Prescribes medication (autocomplete, dosage calc, interaction check)
   ──> Orders lab tests (LOINC coded)
   ──> Sets follow-up interval

3. End of Day
   ──> Reviews pending tasks
   ──> Approves lab results requiring verification
   ──> Responds to patient messages
   ──> Analytics shows: 15 consultations, avg 12 min each, 94% satisfaction
```

### Pharmacy Journey: Order Fulfillment

```
1. Order Received
   ──> Pharmacy dashboard shows new order
   ──> Prescription attached (AI-parsed)
   ──> Inventory check: 4 of 5 medicines in stock
   ──> Short medicine ordered from distributor

2. Fulfillment
   ──> Pick list generated
   ──> Items picked and packed
   ──> Order status → FULFILLING
   ──> Delivery partner assigned

3. Delivery
   ──> Customer tracking enabled
   ──> Status updates: Picked Up → In Transit → Out for Delivery → Delivered
   ──> Customer notified at each step

4. Completion
   ──> Order marked COMPLETED
   ──> Inventory decremented
   ──> Customer prompted to rate
   ──> Analytics updated
```

### Staff Journey: Clinic Operations

```
Receptionist:
  1. Patient arrives → checks in via appointment QR
  2. Verifies details, collects copay
  3. Patient moves to queue
  4. Dashboard shows wait times, room availability

Nurse:
  1. Patient called to vitals station
  2. Records: BP, HR, temp, SpO2, weight
  3. Updates allergy list if needed
  4. Patient moved to doctor queue

Lab Staff:
  1. Sample collected → barcode labeled
  2. Processing queue shows priority (STAT vs routine)
  3. Results verified → auto-published to patient timeline
  4. Abnormal flags sent to ordering doctor
```

---

## 12. State Management Architecture

### Pattern: Zustand + TanStack Query

```
TanStack Query (Server State)
  ├── Cached API responses
  ├── Automatic revalidation
  ├── Optimistic updates
  ├── Infinite queries (timeline)
  └── Mutations with rollback

Zustand (Client State)
  ├── Auth state (user, token, roles)
  ├── UI state (sidebar, theme, preferences)
  ├── Form state (consultation notes, Rx builder)
  ├── WebSocket state (notifications, real-time updates)
  └── Draft state (unsubmitted forms)
```

### Store Definitions

```typescript
// packages/auth/auth-store.ts
interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  roles: Role[];
  permissions: string[];
  login: (phoneNumber: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// packages/notifications/notification-store.ts
interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => void;
  subscribe: () => void;  // WebSocket
  unsubscribe: () => void;
}

// apps/patient-app/stores/health-twin.ts
interface HealthTwinStore {
  twin: HealthTwin | null;
  risks: RiskAssessment[];
  trends: TrendData[];
  isLoading: boolean;
  fetchTwin: () => Promise<void>;
  askQuestion: (question: string) => Promise<Answer>;
}
```

### WebSocket Architecture

```
Connection Flow:
  Client connects → Socket.IO handshake with JWT
  Server validates → Joins user-specific room: user:{userId}
  Server joins role-specific room: role:{roleName}
  Client subscribes to event types

Event Flow:
  Backend (Kafka consumer) → WebSocket Gateway → Socket.IO → Client

Reconnection:
  Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
  On reconnect: fetch unread notifications, re-subscribe
```

---

## 13. AI Architecture

### Model Routing

```typescript
interface AIModelRoute {
  task: string;
  primary: string;       // "gemini-2.5-flash"
  fallbacks: string[];   // ["claude-3-haiku", "gpt-4o-mini"]
  minConfidence: number; // 0.8
  maxRetries: number;    // 2
  timeout: number;       // 15000ms
}

const routes: AIModelRoute[] = [
  { task: 'soap-generation',       primary: 'gemini-2.5-flash', fallbacks: ['claude-3-haiku'], minConfidence: 0.9 },
  { task: 'prescription-parsing',  primary: 'gemini-2.5-flash', fallbacks: ['gpt-4o-mini'],    minConfidence: 0.85 },
  { task: 'symptom-analysis',      primary: 'claude-3-haiku',   fallbacks: ['gemini-2.5-flash'], minConfidence: 0.8 },
  { task: 'health-twin-summary',   primary: 'gemini-2.5-flash', fallbacks: ['gpt-4o'],          minConfidence: 0.9 },
  { task: 'graph-query',           primary: 'gemini-2.5-flash', fallbacks: ['claude-3-sonnet'], minConfidence: 0.85 },
  { task: 'drug-interaction',      primary: 'gpt-4o-mini',      fallbacks: ['gemini-2.5-flash'], minConfidence: 0.95 },
  { task: 'report-summarization',  primary: 'claude-3-haiku',   fallbacks: ['gemini-2.5-flash'], minConfidence: 0.85 },
];
```

### AI Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        AI Service                           │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Orchestrator│  │  GraphRAG   │  │   Health Twin        │  │
│  │  Service    │  │  Service    │  │   Engine             │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                    │             │
│  ┌──────┴──────────────────┴──────────────────┴──────────┐ │
│  │                  Model Router                          │ │
│  │  (OpenRouter → Gemini → Anthropic → OpenAI)           │ │
│  └──────────────────────┬────────────────────────────────┘ │
│                         │                                   │
│  ┌──────────────────────┴────────────────────────────────┐ │
│  │              Prompt Templates                          │ │
│  │  [soap, rx-parse, drug-check, summary, qa, risk]      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌──────────────────────┐ ┌──────────────────────────────┐  │
│  │   Clinical Context   │ │   Healthcare Knowledge       │  │
│  │   Assembler          │ │   Graph Query Builder        │  │
│  └──────────────────────┘ └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Prompt Architecture

```
All prompts are stored as templates in PostgreSQL or JSON files.

Template structure:

SOAP_GENERATION:
  system: |
    You are a clinical assistant helping a doctor write SOAP notes.
    Given the consultation notes, generate a structured SOAP note.
    Use ICD-10 codes for assessments.
    Be conservative — do not invent findings.

  user: |
    Consultation Notes: {{notes}}
    Patient History: {{history}}
    Current Medications: {{medications}}
    Vitals: {{vitals}}

PRESCRIPTION_PARSING:
  system: |
    Extract structured medication information from prescription text.
    Return as JSON array with: name, dosage, form, frequency, duration, instructions.

  user: |
    Prescription text: {{text}}

DRUG_INTERACTION:
  system: |
    Check for potential drug-drug interactions in the given medication list.
    Return severity (high/medium/low), description, and recommendation.

  user: |
    Medications: {{medications}}
    Patient Conditions: {{conditions}}
```

### Job Queue

```
Queue: ai-jobs
  ├── Type: OCR (lab report image → text)
  ├── Type: REPORT_SUMMARY (lab report → patient-friendly summary)
  ├── Type: SYMPTOM_ANALYSIS (text → differential diagnosis)
  ├── Type: MEDICATION_REVIEW (med list → interaction check)
  ├── Type: CARE_SUMMARY (period → health summary)
  ├── Type: HEALTH_TWIN (user ID → twin update)
  ├── Type: GRAPH_SYNC (event → graph update)
  └── Type: PHARMACY_RX_PARSE (text/image → medications)

Processing:
  - Each job has maxRetries (3), priority (1-10), timeout (30s-5min)
  - Failed jobs escalate to admin after 3 retries
  - Concurrent processing limited per job type
  - BullMQ with Redis backend
```

---

## 14. Healthcare Graph Architecture

### Graph Model

```
Node Types (17):
  PATIENT, DOCTOR, CONDITION, MEDICATION, ALLERGY,
  LAB_TEST, LAB_RESULT, PRESCRIPTION, PROCEDURE, CONSULTATION,
  CARE_PLAN, FAMILY_MEMBER, HOSPITAL, SYMPTOM, VACCINATION, NOTE,
  RISK_FACTOR

Relationship Types (21):
  HAS_CONDITION, TAKES_MEDICATION, ALLERGIC_TO,
  VISITED_DOCTOR, UNDERWENT_TEST, UNDERWENT_PROCEDURE,
  PRESCRIBED, DISPENSED, FOLLOWS_CARE_PLAN,
  FAMILY_HISTORY_OF, DIAGNOSED_BY, TREATED_BY,
  HAS_SYMPTOM, HAS_RISK_FACTOR, RELATED_TO,
  LED_TO, FOLLOW_UP_FROM, OCCURRED_AT,
  DOCUMENTED_IN, CONTRAINDICATES, INTERACTS_WITH
```

### Storage Implementation

```
Tables (existing):
  AIMemoryNode  ─── userId, nodeType, title, summary, metadata (JSONB), confidenceScore
  AIMemoryEdge  ─── fromNodeId, toNodeId, relation, strength, metadata (JSONB)

Graph Operations (health-graph.service.ts):
  - addNode(userId, type, title, summary, metadata)
  - addEdge(fromNodeId, toNodeId, relation, strength)
  - findNodes(userId, type?, query?)
  - findNodeConnections(nodeId, maxDepth=2)
  - findPaths(fromId, toId, maxDepth=4)    // BFS traversal
  - assessRisks(userId)                      // Graph-based rule engine
  - queryGraph(userId, question)             // GraphRAG
  - syncFromConsultation(consultationId)     // Auto-create CONDITION/MEDICATION/DOCTOR nodes
  - syncFromLabReport(reportId)              // Auto-create LAB_TEST/LAB_RESULT nodes
  - syncFromAppointment(appointmentId)       // Auto-create DOCTOR/CONSULTATION nodes
```

### Risk Engine V3 (Graph-Based)

```
Algorithm:
  1. Start from patient node
  2. Traverse outgoing edges with HAS_CONDITION relation
  3. For each CONDITION node, read metadata (diagnosis date, severity, icdCode)
  4. Apply clinical rules:

     RULES:
     ├── Rule 1: Diabetes + adherence < 70% → HIGH risk (score: 85)
     │     Evidence: ["HbA1c > 7.5", "Missed doses in last 7 days"]
     │     Recommendation: "Review medication adherence. Consider insulin titration."
     │
     ├── Rule 2: Cardiovascular + age >= 60 → HIGH risk (score: 80)
     │     Evidence: ["Age 65", "History of hypertension"]
     │     Recommendation: "Annual cardiac evaluation recommended."
     │
     ├── Rule 3: Multiple comorbidities (>= 3) → MEDIUM risk (score: 55)
     │     Evidence: ["Diabetes", "Hypertension", "Hyperlipidemia"]
     │     Recommendation: "Comprehensive metabolic panel recommended."
     │
     ├── Rule 4: Diabetes + family cardiac history → HIGH risk (score: 75)
     │     Evidence: ["Type 2 diabetes", "Father had MI at 55"]
     │     Recommendation: "Lipid profile and cardiac risk assessment."
     │
     ├── Rule 5: Polypharmacy (>= 5 medications) → MEDIUM risk (score: 50)
     │     Evidence: ["Currently on 7 medications"]
     │     Recommendation: "Medication reconciliation recommended."
     │
     └── Rule 6: New onset symptom (last 30 days) → MONITOR risk (score: 35)
           Evidence: ["Chest pain reported 2 weeks ago"]
           Recommendation: "Clinical correlation advised."

  5. Aggregate: weighted average of individual risk scores
  6. Apply modifiers: age > 60 (+5), BMI > 30 (+5), smoker (+10)
  7. Output: { score, level, risks: [{ condition, score, level, evidence, recommendations }] }

Fallback:
  If graph has insufficient data (< 2 CONDITION nodes):
    → Use V2 rule engine (rule-based on patient profile fields)
```

### GraphRAG Query Flow

```
User Question: "What conditions do I have and what medications am I taking?"

1. LLM parses question → identifies entities and relationships
   { entities: ["conditions", "medications"], target: "patient" }

2. Graph service traverses:
   PATIENT node → [HAS_CONDITION] → CONDITION nodes
   PATIENT node → [TAKES_MEDICATION] → MEDICATION nodes

3. Retrieved subgraph → context passed to LLM with original question

4. LLM generates answer with evidence citations from graph data

5. Response: { answer: string, evidence: GraphEvidence[] }
```

---

## 15. ABDM Integration Architecture

### Module Isolation

```
services/abdm-service/
├── abha/
│   ├── create-abha.ts
│   ├── link-abha.ts
│   ├── verify-abha.ts
│   └── de-link-abha.ts
│
├── hip/                       # Health Information Provider
│   ├── health-information.ts
│   ├── consent.ts
│   ├── data-flow.ts
│   └── notification.ts
│
├── hiu/                       # Health Information User
│   ├── consent-request.ts
│   ├── data-request.ts
│   └── data-receive.ts
│
├── hpr/                       # Health Professional Registry
│   ├── register-doctor.ts
│   ├── verify-doctor.ts
│   └── search-doctor.ts
│
├── hfr/                       # Health Facility Registry
│   ├── register-facility.ts
│   ├── verify-facility.ts
│   └── search-facility.ts
│
├── nhcx/                      # National Health Claims Exchange
│   ├── claim-adapter.ts
│   ├── payer-adapter.ts
│   ├── pre-auth.ts
│   └── policy-adapter.ts
│
├── adapters/
│   ├── abdm-api.adapter.ts    # HTTP client with HMAC signing
│   ├── token-manager.ts       # Session token management
│   └── error-handler.ts       # ABDM-specific error mapping
│
├── validators/
│   ├── abha-validator.ts
│   ├── consent-validator.ts
│   └── purpose-validator.ts
│
├── transformers/
│   ├── fhir-converter.ts      # Internal → FHIR R4
│   ├── snomed-mapper.ts       # ICD/LOINC → SNOMED CT (where needed)
│   └── nhcx-converter.ts      # Internal → NHCX claim format
│
├── events/
│   ├── abha-linked.handler.ts
│   ├── consent-granted.handler.ts
│   └── data-received.handler.ts
│
└── abdm.module.ts
```

### Integration Flow

```
ABHA Creation:
  Patient → Enter Aadhaar/Aadhaar XXXX → ABDM Gateway
    → Verify OTP → Create ABHA → Return ABHA number
    → Store in User.ABDM profile

HIP Flow (Sharing data):
  Patient → Grant consent via ABDM consent manager
    → HIP receives consent notification
    → HIP prepares FHIR bundle
    → HIP encrypts and uploads to ABDM gateway
    → HIU notified of available data

HIU Flow (Accessing data):
  Doctor/Patient → Request consent from patient
    → Patient grants consent (via ABDM app)
    → HIU receives consent grant notification
    → HIU requests data
    → HIP shares data via ABDM gateway
    → HIU receives and decrypts data

NHCX Flow (Insurance claims):
  Clinic → Create claim in NHCX format
    → Submit to payer via gateway
    → Track claim status
    → Receive settlement
```

---

## 16. Infrastructure Architecture

### Docker Compose (Local Development)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: wyshcare
      POSTGRES_USER: wyshcare
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports: ['5432:5432']
    volumes: ['pgdata:/var/lib/postgresql/data']

  redis:
    image: redis:7-alpine
    ports: ['6379:6379']

  kafka:
    image: confluentinc/cp-kafka:latest
    depends_on: [zookeeper]
    ports: ['9092:9092']

  zookeeper:
    image: confluentinc/cp-zookeeper:latest

  minio:
    image: minio/minio
    ports: ['9000:9000', '9001:9001']
    volumes: ['minio:/data']

volumes: { pgdata:, minio: }
```

### AWS Production Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Route 53                              │
├────────────┬───────────────────┬────────────────┬────────────┤
│   *.wyshcare.com   │   api.wyshcare.com   │  admin domain  │
├────────────┴───────────────────┴────────────────┴────────────┤
│                      CloudFront (CDN)                        │
├──────────────────────────────────────────────────────────────┤
│                      Application Load Balancer               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────┐  ┌──────────────────────────────┐   │
│  │  ECS Fargate        │  │  ECS Fargate                 │   │
│  │  Frontend (Next.js) │  │  Backend (NestJS)            │   │
│  │  - Auto-scaling     │  │  - Auto-scaling (CPU>70%)    │   │
│  │  - 2x minimum       │  │  - 3x minimum                │   │
│  └─────────────────────┘  └──────────────────────────────┘   │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ RDS PostgreSQL│  │ ElastiCache  │  │ MSK (Managed Kafka)│  │
│  │ - Multi-AZ    │  │ Redis 7      │  │ - 3 brokers       │  │
│  │ - Read replicas│  │ - Cluster   │  │ - Auto-repair     │  │
│  └──────────────┘  └──────────────┘  └───────────────────┘  │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────────────┐  │
│  │ S3 (Records/Reports) │  │ OpenSearch (Logs)            │  │
│  │ - Server-side enc.   │  │ - Audit logs                 │  │
│  │ - Lifecycle policies │  │ - Application logs           │  │
│  └──────────────────────┘  └──────────────────────────────┘  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ CloudWatch   │  │ Grafana      │  │ AWS WAF           │  │
│  │ - Metrics    │  │ - Dashboards │  │ - Rate limiting   │  │
│  │ - Alarms     │  │ - Alerts     │  │ - DDoS protection │  │
│  │ - Logs       │  │              │  │ - IP filtering    │  │
│  └──────────────┘  └──────────────┘  └───────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Cost Optimization

```
Compute:
  - Spot instances for AI batch jobs (80% savings)
  - Graviton ARM instances for general workloads (20% savings)
  - Right-sizing: monitor CPU/memory utilization weekly

Storage:
  - S3 Intelligent Tiering for medical records
  - Lifecycle: Standard → Glacier after 90 days
  - RDS: Right-size based on connection pool metrics

Data Transfer:
  - CloudFront for static assets
  - Compress API responses (Brotli)
  - Use CDN for medical report PDFs
```

---

## 17. CI/CD Architecture

### GitHub Actions Workflows

```
ci-backend.yml:
  trigger: pull_request (backend/**)
  steps:
    1. Checkout
    2. Setup Node (v22)
    3. Install pnpm dependencies
    4. Lint (ESLint + Prettier)
    5. Type-check (tsc --noEmit)
    6. Build (turbo build)
    7. Unit tests (node --test)
    8. E2E tests (docker compose up -d, node --test --test-concurrency=1)
    9. Prisma validation (npx prisma validate)
    10. Security scan (npm audit, Snyk)

ci-frontend.yml:
  trigger: pull_request (apps/**)
  steps:
    1-5. Same as backend
    6. Build all frontend apps
    7. Lint (next lint)
    8. Type-check
    9. Bundle analyzer

cd-staging.yml:
  trigger: push to main
  steps:
    1-9. All CI steps
    10. Build Docker images
    11. Push to ECR
    12. Deploy to staging ECS
    13. Run smoke tests (curl health endpoints)
    14. Run E2E tests against staging
    15. Notify Slack

cd-production.yml:
  trigger: release created
  steps:
    1. Build & push Docker images
    2. Deploy to production ECS (blue/green)
    3. Run smoke tests
    4. Run health check suite
    5. Notify Slack + PagerDuty
    6. Create Sentry release
```

### Deployment Strategy

```
Environment Strategy:
  - development: local docker compose
  - staging: shared ECS cluster (auto-deploy on main)
  - production: prod ECS cluster (manual approval via GitHub Releases)

Release Cadence:
  - Daily: dependency updates, patches, bug fixes
  - Weekly: feature releases (Monday deploy, Thursday cut)
  - Monthly: major releases (feature flags for gradual rollout)

Rollback:
  - Blue/green deployment (immediate traffic switch on failure)
  - Automated rollback if health checks fail for 30s
  - Database: backward-compatible migrations only
  - Feature flags: kill-switch per feature
```

---

## 18. Kubernetes Deployment Architecture

### Cluster Structure

```yaml
# infrastructure/kubernetes/backend/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wyshcare-backend
  namespace: wyshcare
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
        - name: backend
          image: ${ECR_REPO}/wyshcare-backend:${IMAGE_TAG}
          ports:
            - containerPort: 3001
          env:
            - name: NODE_ENV
              value: production
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef: { name: db-credentials, key: url }
            - name: REDIS_URL
              valueFrom:
                secretKeyRef: { name: redis-credentials, key: url }
            - name: KAFKA_BROKERS
              value: "kafka-cluster:9092"
          resources:
            requests: { cpu: "500m", memory: "512Mi" }
            limits: { cpu: "2000m", memory: "2Gi" }
          livenessProbe:
            httpGet: { path: /health, port: 3001 }
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet: { path: /health/ready, port: 3001 }
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: wyshcare-backend-hpa
spec:
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### Frontend Deployment (Edge)

```yaml
# infrastructure/kubernetes/frontend/deployment.yaml
# Patient app — deployed to Vercel Edge Functions
# Doctor app — deployed to Vercel Edge Functions
# Admin app — standard Next.js SSR on ECS Fargate
```

### Ingress & Service Mesh

```yaml
# infrastructure/kubernetes/ingress/nginx-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: wyshcare-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rate-limit: "120r/m"
    nginx.ingress.kubernetes.io/cors-enabled: "true"
spec:
  tls:
    - hosts: [*.wyshcare.com]
      secretName: wyshcare-tls
  rules:
    - host: api.wyshcare.com
      http:
        paths:
          - path: /v1
            pathType: Prefix
            backend:
              service:
                name: backend-service
                port: 3001
    - host: patient.wyshcare.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: patient-app-service
                port: 3000
```

### Monitoring Stack

```
Grafana + Prometheus:
  - Node metrics (CPU, memory, network, disk)
  - Application metrics (request rate, latency, errors)
  - Business metrics (signups, consultations, orders)
  - Custom dashboards per service

Loki (Log Aggregation):
  - Structured JSON logs from all services
  - Trace correlation via requestId
  - 30-day retention for debugging, 7-year for audit

Tempo (Tracing):
  - OpenTelemetry distributed tracing
  - Trace sampling: 100% for errors, 10% for success
  - Integration with Loki for log-to-trace

Sentry:
  - Error tracking with source maps
  - Performance monitoring (transactions)
  - Release tracking
  - User feedback for crashes
```

---

## 19. Implementation Plan

### Phase 1: Foundation (Sprints 14-16) — COMPLETE

```
✅ Platform hardening (8 items)
✅ Telemedicine Clinical Encounter Engine
✅ Pharmacy Marketplace
✅ Clinical Knowledge Graph + Risk Engine V3
✅ E2E test suite (47 tests, all passing)
```

### Phase 2: Commerce & Provider Network (Sprints 17-19)

```
Sprint 17 — Diagnostics Marketplace (4 weeks)
  - Diagnostics partner onboarding
  - Test catalog (LOINC-coded)
  - Sample collection workflow
  - Report upload and verification
  - AI-powered result interpretation
  - Health graph sync (LAB_TEST + LAB_RESULT nodes)

Sprint 18 — Provider Network (3 weeks)
  - Provider search and discovery
  - Ratings and reviews
  - Insurance acceptance
  - Distance-based filtering
  - Availability calendar

Sprint 19 — Digital Prescription Engine (4 weeks)
  - Rx templates (by specialty)
  - Drug database (dosage, interactions, contraindications)
  - Drug-drug interaction checker (AI-powered)
  - Duplicate therapy alerts
  - Rx analytics
  - Graph sync (PRESCRIPTION + MEDICATION nodes)
```

### Phase 3: Intelligence & Personalization (Sprints 20-22)

```
Sprint 20 — AI Care Navigator (4 weeks)
  - Health Graph-powered care paths
  - Condition-specific care plans
  - Automated follow-up scheduling
  - Preventive health recommendations
  - Risk-based intervention suggestions

Sprint 21 — Health Wallet (3 weeks)
  - Payment orchestration (Razorpay, Stripe)
  - Multi-currency support
  - Insurance subrogation
  - HSA/FSA compatibility
  - Family billing
  - Automated receipts

Sprint 22 — Subscription Platform (4 weeks)
  - Plan tiers: Free, Plus, Family, Clinic, Enterprise
  - Subscription management
  - Usage metering
  - Invoicing and billing
  - Seat management (enterprise)
  - Subscription analytics
```

### Phase 4: Enterprise & National Scale (Sprints 23-25)

```
Sprint 23 — Enterprise Clinic OS (6 weeks)
  - Multi-tenant EMR
  - Clinic billing and settlements
  - Staff management and scheduling
  - Inventory management (clinic-level)
  - Analytics dashboard
  - White-label patient app

Sprint 24 — NHCX Readiness Layer (4 weeks)
  - Claim adapter (FHIR → NHCX format)
  - Payer adapter (multi-payer support)
  - Pre-auth workflow
  - Policy validation
  - Claim tracking dashboard
  - Reimbursement management

Sprint 25 — Healthcare Super App (6 weeks)
  - Population health analytics
  - Predictive health models
  - Risk stratification engine
  - ABDM full integration
  - National provider registry sync
  - Interoperability certification
  - Platform API for third-party developers
```

### Sprint Velocity Assumptions

```
- Team: 6 engineers, 1 QA, 1 PM, 1 designer
- Sprint length: 2 weeks
- Velocity: 30-40 story points/sprint
- Each phase sprint = 1-3 two-week iterations

Risk Mitigation:
  - All new features behind feature flags
  - Weekly production releases
  - Database migrations always backward-compatible
  - Schema changes reviewed by all services
  - Automated rollback in <5 minutes
```

---

## 20. Production Readiness

### Security Checklist

```
□ All API endpoints authenticated (except public routes)
□ Rate limiting on all endpoints (global + per-route)
□ CSRF protection on state-changing requests
□ JWT tokens in httpOnly cookies (not localStorage)
□ Refresh token rotation (old tokens invalidated on use)
□ PII encrypted at rest (AES-256-GCM)
□ Health records encrypted with per-record keys
□ Audit logging for all PHI access
□ GDPR/DPDPA compliance for data export/deletion
□ Emergency access with time-limited, auditable grants
□ ABDM consent-based data sharing
□ Regular penetration testing
□ Dependency vulnerability scanning (weekly)
□ Secrets in AWS Secrets Manager (not env vars)
□ WAF rules for SQL injection, XSS, path traversal
□ Rate limiting per IP and per user
□ Session timeout after inactivity (30 min)
```

### Compliance Matrix

```
Regulation     Status  Notes
──────────────────────────────────────────────────────
DPDPA 2023     ⬜     Needs privacy policy, consent manager, data deletion API
HIPAA-like     🟡     Encryption, audit logs, access controls in place; gap analysis needed
ABDM L1        🟢     ABHA linkage, consent management, HIP readiness
ABDM L2        ⬜     Full HIP/HIU certification (Sprint 25)
NHCX            ⬜     Claim submission (Sprint 24)
ISO 27001       ⬜     Pre-audit gap analysis needed
PCI DSS         ⬜     If storing card data (use Razorpay for now)
```

### SLAs & Reliability

```
API Uptime: 99.95% (monthly)
  - Planned downtime: < 1 hour/month (maintenance window: 2-4 AM IST)
  - Incident response: P0 < 15 min, P1 < 1 hour, P2 < 4 hours

Performance:
  - API response: p50 < 100ms, p95 < 500ms, p99 < 2s
  - Page load: LCP < 2.5s, FID < 100ms, CLS < 0.1
  - Telemedicine: latency < 200ms, jitter < 50ms

Database:
  - PostgreSQL: 99.95% uptime, point-in-time recovery (35-day)
  - Redis: 99.9% uptime, replication factor 2
  - Kafka: 99.95% uptime, min ISR = 2 per partition

Monitoring:
  - Synthetic monitoring from 5 global regions
  - Real user monitoring (RUM) via Sentry
  - Business metrics dashboard (Grafana)
  - On-call rotation with PagerDuty
  - Weekly incident review
```

### Disaster Recovery

```
RTO: 1 hour (Recovery Time Objective)
RPO: 5 minutes (Recovery Point Objective)

Backup Strategy:
  - PostgreSQL: WAL streaming to standby, daily snapshots (35-day retention)
  - Redis: RDB snapshots every 5 minutes to S3
  - S3: Cross-region replication for medical records
  - Kafka: Log retention 7 days, topic backup to S3

Recovery Procedure:
  1. Route53 failover to DR region (us-west-2)
  2. RDS promote read replica
  3. ECS scale up from AMI cache
  4. Redis rebuild from RDB snapshot
  5. Data integrity verification
  6. Traffic switch

DR Testing: Quarterly failover drills
```
