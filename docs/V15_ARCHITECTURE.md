# WyshCare V1.5 — System Architecture Document

> **Version:** 1.5  
> **Status:** Draft  
> **Last Updated:** June 2026  
> **Owner:** Architecture Team  

---

## Table of Contents

1. [Revised System Architecture](#1-revised-system-architecture)
2. [Domain-Driven Design Structure](#2-domain-driven-design-structure)
3. [Database Schema Redesign](#3-database-schema-redesign)
4. [API Specifications](#4-api-specifications)
5. [Security Architecture](#5-security-architecture)
6. [Consent Engine Architecture](#6-consent-engine-architecture)
7. [Health Graph Architecture](#7-health-graph-architecture)
8. [AI Health Memory Architecture](#8-ai-health-memory-architecture)
9. [MinIO Migration Plan](#9-minio-migration-plan)
10. [Testing Strategy](#10-testing-strategy)
11. [90-Day Execution Roadmap](#11-90-day-execution-roadmap)
12. [Implementation Sequence](#12-implementation-sequence)

---

## 1. Revised System Architecture

### 1.1 High-Level Architecture

WyshCare V1.5 maintains a **modular monolith** architecture using NestJS with domain-driven modules. The architecture is designed to remain monolithic until the platform exceeds 100,000 registered users or 10,000 daily active users, at which point bounded contexts can be extracted into independent microservices.

```
+--------------------------------------------------------------------------------------------------------------------+
|                                                  CLIENT LAYER                                                      |
|   +-----------+  +-----------+  +-----------+  +-----------------+                                                |
|   | Web App   |  | Mobile    |  | Third-    |  | ABDM Gateway    |                                                |
|   | (NextJS)  |  | (React    |  | Party     |  | (Sandbox/Prod)  |                                                |
|   |           |  |  Native)  |  | Integra-  |  |                 |                                                |
|   |           |  |           |  | tions     |  |                 |                                                |
|   +-----+-----+  +-----+-----+  +-----+-----+  +--------+--------+                                                |
|         |              |              |                   |                                                         |
|         +--------------+--------------+-------------------+                                                         |
|                            | HTTPS/TLS                                                                             |
+----------------------------+----------------------------------------------------------------------------------------+
                             |
+----------------------------+----------------------------------------------------------------------------------------+
|                     API GATEWAY LAYER                                                                               |
|  +---------------------------------------------------------------------------------------------------------------+ |
|  |  Nginx / Traefik                                                                                               | |
|  |  - Rate Limiting (per-endpoint, per-user)                                                                      | |
|  |  - TLS Termination                                                                                             | |
|  |  - Request Validation                                                                                          | |
|  |  - WAF (SQLi, XSS, CSRF prevention)                                                                            | |
|  |  - Geo-IP blocking                                                                                             | |
|  +-----------------------------------+---------------------------------------------------------------------------+ |
+--------------------------------------+----------------------------------------------------------------------------+
                                       |
+--------------------------------------+----------------------------------------------------------------------------+
|                              APPLICATION LAYER (NestJS)                                                           |
|                                                                                                                   |
|  +--------------------------------------------------------------------------------------------------------------+ |
|  |                                         MIDDLEWARE PIPELINE                                                   | |
|  |  +---------+ +---------+ +--------+ +--------+ +--------+                                                    | |
|  |  |Auth     | |Security | |Audit   | |Logging | |Rate    |                                                    | |
|  |  |Guard    | |Guard    | |Logger  | |        | |Limiter |                                                    | |
|  |  +---------+ +---------+ +--------+ +--------+ +--------+                                                    | |
|  +--------------------------------------------------------------------------------------------------------------+ |
|                                                                                                                   |
|  +--------------------------------------------------------------------------------------------------------------+ |
|  |                                            MODULE LAYER                                                       | |
|  |  +----------+ +----------+ +----------+ +----------------+                                                    | |
|  |  |Identity  | |Auth      | |Profile   | |Vault           |                                                    | |
|  |  |Module    | |Module    | |Module    | |Module          |                                                    | |
|  |  +----------+ +----------+ +----------+ +----------------+                                                    | |
|  |  +----------+ +----------+ +----------+ +----------------+                                                    | |
|  |  |Consent   | |Care      | |Timeline  | |Discovery       |                                                    | |
|  |  |Module    | |Context   | |Module    | |Module          |                                                    | |
|  |  +----------+ +----------+ +----------+ +----------------+                                                    | |
|  |  +----------+ +----------+ +----------+ +----------------+                                                    | |
|  |  |Telemed.  | |Prescrip. | |Pharmacy  | |Diagnostics     |                                                    | |
|  |  |Module    | |Module    | |Module    | |Module          |                                                    | |
|  |  +----------+ +----------+ +----------+ +----------------+                                                    | |
|  |  +----------+ +----------+ +----------+ +----------------+                                                    | |
|  |  |Payments  | |Family    | |Insurance | |Notifications   |                                                    | |
|  |  |Module    | |Module    | |Module    | |Module          |                                                    | |
|  |  +----------+ +----------+ +----------+ +----------------+                                                    | |
|  |  +----------+ +----------+ +----------+ +----------------+                                                    | |
|  |  |Admin     | |AI        | |Interop.  | |Search          |                                                    | |
|  |  |Module    | |Module    | |Module    | |Module          |                                                    | |
|  |  +----------+ +----------+ +----------+ +----------------+                                                    | |
|  +--------------------------------------------------------------------------------------------------------------+ |
|                                                                                                                   |
|  +--------------------------------------------------------------------------------------------------------------+ |
|  |                                            COMMON LAYER                                                       | |
|  |  +----------+ +----------+ +----------+ +----------------+                                                    | |
|  |  |Encryption| |Security  | |Audit     | |ABDM Adapters   |                                                    | |
|  |  |Module    | |Module    | |Module    | |(Interfaces)    |                                                    | |
|  |  +----------+ +----------+ +----------+ +----------------+                                                    | |
|  +--------------------------------------------------------------------------------------------------------------+ |
|                                                                                                                   |
|  +--------------------------------------------------------------------------------------------------------------+ |
|  |                                           PROVIDER LAYER                                                      | |
|  |  +----------+ +----------+ +----------+ +----------------+                                                    | |
|  |  |Storage   | |Cache     | |Messaging | |Observability   |                                                    | |
|  |  |(MinIO/   | |(Redis)   | |(Event    | |(OpenTelemetry) |                                                    | |
|  |  | S3)      | |          | | Bus)     | |                |                                                    | |
|  |  +----------+ +----------+ +----------+ +----------------+                                                    | |
|  +--------------------------------------------------------------------------------------------------------------+ |
+--------------------------------------+----------------------------------------------------------------------------+
                                       |
+--------------------------------------+----------------------------------------------------------------------------+
|                                        DATA LAYER                                                                 |
|  +----------+  +----------+  +----------+  +------------------+                                                   |
|  |PostgreSQL|  |  Redis   |  |MinIO/S3  |  |  OpenTelemetry   |                                                   |
|  |(Primary) |  |(Cache,   |  |(Document |  |  Collector        |                                                   |
|  |          |  | Session, |  |  Store)  |  |  +------------+  |                                                   |
|  |          |  | Pub/Sub) |  |          |  |  |Prometheus  |  |                                                   |
|  |          |  |          |  |          |  |  +------------+  |                                                   |
|  |          |  |          |  |          |  |  +------------+  |                                                   |
|  |          |  |          |  |          |  |  |  Grafana   |  |                                                   |
|  |          |  |          |  |          |  |  +------------+  |                                                   |
|  +----------+  +----------+  +----------+  +------------------+                                                   |
+--------------------------------------------------------------------------------------------------------------------+
```

### 1.2 Technology Stack

| Layer          | Technology                  | Version | Purpose                          |
|----------------|-----------------------------|---------|----------------------------------|
| Frontend       | NextJS                      | 14+     | SSR web application              |
| API Gateway    | Nginx / Traefik             | Latest  | Reverse proxy, rate limiting, TLS|
| Backend        | NestJS                      | 10+     | Application framework            |
| ORM            | Prisma                      | 5+      | Database access                  |
| Primary DB     | PostgreSQL                  | 16+     | Relational data store            |
| Cache          | Redis                       | 7+      | Session, cache, pub/sub          |
| Object Storage | MinIO (dev) / S3 (prod)     | Latest  | Document storage                 |
| Monitoring     | OpenTelemetry + Prometheus + Grafana | Latest | Observability          |
| Message Queue  | Bull (Redis-backed)         | Latest  | Async job processing             |
| Container      | Docker + Docker Compose     | Latest  | Development environment          |

### 1.3 ABDM Compatibility Layer

The ABDM (Ayushman Bharat Digital Mission) compatibility layer is implemented through adapter interfaces in `src/common/abdm/`. These adapters provide a clean abstraction boundary between WyshCare's internal domain models and ABDM's external data formats.

```
+------------------------------------------------------+
|                  WYSHCARE DOMAIN                      |
| +-------------+ +-------------+ +------------------+ |
| | Consent     | | Identity    | | Care Context     | |
| | Engine      | | Module      | | Module           | |
| +------+------+ +------+------+ +--------+---------+ |
+--------+--------------+-------------------+-----------+
         |              |                   |
+--------+--------------+-------------------+-----------+
|        v              v                   v           |
| +--------------------------------------------------+ |
| |                ADAPTER INTERFACES                 | |
| | +--------------+ +--------------+ +-------------+ | |
| | |AbhaAdapter   | |ConsentManager| |CareContext  | | |
| | |              | |Adapter       | |Adapter      | | |
| | +--------------+ +--------------+ +-------------+ | |
| | +------------------------+ +-------------------+ | |
| | |HealthInfoExchange      | |PatientDiscovery   | | |
| | |Adapter                 | |Adapter            | | |
| | +------------------------+ +-------------------+ | |
| +--------------------------------------------------+ |
|                                                      |
| +--------------------------------------------------+ |
| |               IMPLEMENTATIONS                    | |
| | +----------------------+ +---------------------+ | |
| | | Mock Implementation  | | Production          | | |
| | | (Sandbox)            | | (ABDM Gateway API)  | | |
| | +----------------------+ +---------------------+ | |
| +--------------------------------------------------+ |
+------------------------------------------------------+
```

### 1.4 Scaling Thresholds

| Metric             | Threshold     | Action                                              |
|--------------------|---------------|-----------------------------------------------------|
| Registered Users   | < 100,000     | Maintain modular monolith                           |
| Registered Users   | >= 100,000    | Extract high-volume domains into services           |
| DAU                | < 10,000      | Maintain modular monolith                           |
| DAU                | >= 10,000     | Split into bounded-context microservices            |
| API Throughput     | < 5,000 req/s | Horizontal scaling of monolith                      |
| API Throughput     | >= 5,000 req/s| Add read replicas + CDN for static content          |
| Document Storage   | < 10 TB       | MinIO single-node                                   |
| Document Storage   | >= 10 TB      | MinIO distributed mode or S3                        |

---

## 2. Domain-Driven Design Structure

### 2.1 Module Layout

```
backend/src/
+-- modules/
|   +-- identity/              # WyshID core - creation, verification, graph
|   |   +-- controllers/
|   |   +-- services/
|   |   +-- guards/
|   |   +-- decorators/
|   |   +-- dto/
|   |   +-- interfaces/
|   |   +-- mappers/
|   |   +-- strategies/         # ID generation, verification strategies
|   |   +-- identity.module.ts
|   |
|   +-- auth/                   # OTP, session, multi-factor
|   |   +-- controllers/
|   |   +-- services/
|   |   +-- strategies/         # OTP, TOTP, biometric
|   |   +-- guards/
|   |   +-- dto/
|   |   +-- interfaces/
|   |   +-- auth.module.ts
|   |
|   +-- profile/                # Patient/doctor/provider profiles
|   |   +-- controllers/
|   |   +-- services/
|   |   +-- dto/
|   |   +-- interfaces/
|   |   +-- profile.module.ts
|   |
|   +-- vault/                  # Encrypted health record storage
|   |   +-- controllers/
|   |   +-- services/
|   |   +-- strategies/         # Encryption at rest, key management
|   |   +-- dto/
|   |   +-- interfaces/
|   |   +-- vault.module.ts
|   |
|   +-- consent/                # Consent engine (ABDM-compatible)
|   |   +-- controllers/
|   |   +-- services/
|   |   +-- strategies/         # Consent validation, expiry
|   |   +-- dto/
|   |   +-- interfaces/
|   |   +-- adapters/           # ABDM consent adapters
|   |   +-- consent.module.ts
|   |
|   +-- care-context/           # Health data organization
|   |   +-- controllers/
|   |   +-- services/
|   |   +-- dto/
|   |   +-- interfaces/
|   |   +-- care-context.module.ts
|   |
|   +-- timeline/               # Health timeline engine
|   |   +-- controllers/
|   |   +-- services/
|   |   +-- aggregators/        # Timeline aggregation queries
|   |   +-- dto/
|   |   +-- interfaces/
|   |   +-- timeline.module.ts
|   |
|   +-- discovery/              # Doctor/provider search
|   |   +-- controllers/
|   |   +-- services/
|   |   +-- strategies/         # Ranking, relevance
|   |   +-- dto/
|   |   +-- interfaces/
|   |   +-- discovery.module.ts
|   |
|   +-- telemedicine/           # Appointments + video
|   |   +-- controllers/
|   |   +-- services/
|   |   +-- gateways/           # WebRTC signaling
|   |   +-- dto/
|   |   +-- interfaces/
|   |   +-- telemedicine.module.ts
|   |
|   +-- prescriptions/          # Digital prescriptions
|   |   +-- controllers/
|   |   +-- services/
|   |   +-- dto/
|   |   +-- interfaces/
|   |   +-- prescriptions.module.ts
|   |
|   +-- pharmacy/               # Pharmacy ordering
|   |   +-- controllers/
|   |   +-- services/
|   |   +-- dto/
|   |   +-- interfaces/
|   |   +-- pharmacy.module.ts
|   |
|   +-- diagnostics/            # Lab test booking + reports
|   |   +-- controllers/
|   |   +-- services/
|   |   +-- dto/
|   |   +-- interfaces/
|   |   +-- diagnostics.module.ts
|   |
|   +-- payments/               # Payment processing
|   |   +-- controllers/
|   |   +-- services/
|   |   +-- strategies/         # Gateway-specific implementations
|   |   +-- dto/
|   |   +-- interfaces/
|   |   +-- payments.module.ts
|   |
|   +-- family/                 # Family health graph
|   |   +-- controllers/
|   |   +-- services/
|   |   +-- dto/
|   |   +-- interfaces/
|   |   +-- family.module.ts
|   |
|   +-- insurance/              # Insurance policies + claims
|   |   +-- controllers/
|   |   +-- services/
|   |   +-- dto/
|   |   +-- interfaces/
|   |   +-- insurance.module.ts
|   |
|   +-- notifications/          # Multi-channel notifications
|   |   +-- controllers/
|   |   +-- services/
|   |   +-- channels/           # Email, SMS, push, in-app
|   |   +-- dto/
|   |   +-- interfaces/
|   |   +-- notifications.module.ts
|   |
|   +-- admin/                  # Platform administration
|   |   +-- controllers/
|   |   +-- services/
|   |   +-- guards/
|   |   +-- dto/
|   |   +-- interfaces/
|   |   +-- admin.module.ts
|   |
|   +-- ai/                     # AI health memory + analysis
|   |   +-- controllers/
|   |   +-- services/
|   |   +-- strategies/         # LLM providers, analysis types
|   |   +-- dto/
|   |   +-- interfaces/
|   |   +-- ai.module.ts
|   |
|   +-- interoperability/       # ABDM adapter implementations
|   |   +-- controllers/
|   |   +-- services/
|   |   +-- adapters/           # Real ABDM API implementations
|   |   +-- dto/
|   |   +-- interfaces/
|   |   +-- interoperability.module.ts
|   |
|   +-- search/                 # Full-text search
|   |   +-- controllers/
|   |   +-- services/
|   |   +-- indices/            # Search index definitions
|   |   +-- dto/
|   |   +-- interfaces/
|   |   +-- search.module.ts
|   |
|   +-- health/                 # Health check + monitoring
|       +-- controllers/
|       +-- services/
|       +-- health.module.ts
|
+-- common/
|   +-- encryption/
|   |   +-- encryption.service.ts          # Core encryption service
|   |   +-- encryption.module.ts
|   |   +-- key-management.service.ts      # Key hierarchy management
|   |   +-- field-encryption.decorator.ts  # @Encrypted() decorator
|   |   +-- key-rotation.service.ts        # Scheduled key rotation
|   |   +-- interfaces/
|   |       +-- encryption.interface.ts
|   |       +-- key-store.interface.ts
|   |
|   +-- security/
|   |   +-- guards/
|   |   |   +-- rbac.guard.ts
|   |   |   +-- geo-anomaly.guard.ts
|   |   |   +-- device-fingerprint.guard.ts
|   |   |   +-- rate-limit.guard.ts
|   |   +-- services/
|   |   |   +-- session.service.ts
|   |   |   +-- geo-anomaly.service.ts
|   |   |   +-- pii-masking.service.ts
|   |   +-- security.module.ts
|   |
|   +-- audit/
|   |   +-- services/
|   |   |   +-- audit.service.ts          # Immutable audit logging
|   |   +-- decorators/
|   |   |   +-- audit-log.decorator.ts    # @AuditLog() decorator
|   |   +-- filters/
|   |   |   +-- audit.filter.ts
|   |   +-- audit.module.ts
|   |
|   +-- abdm/
|       +-- adapters/
|       |   +-- abha.adapter.ts             # ABHA creation, login, profile
|       |   +-- consent-manager.adapter.ts  # Consent request, fetch, revoke
|       |   +-- care-context.adapter.ts     # Care context management
|       |   +-- hie.adapter.ts              # Health information exchange
|       |   +-- patient-discovery.adapter.ts# Patient search by ABHA
|       +-- interfaces/
|       |   +-- abha-adapter.interface.ts
|       |   +-- consent-manager-adapter.interface.ts
|       |   +-- care-context-adapter.interface.ts
|       |   +-- hie-adapter.interface.ts
|       |   +-- patient-discovery-adapter.interface.ts
|       +-- mock/
|       |   +-- mock-abha.adapter.ts
|       |   +-- mock-consent-manager.adapter.ts
|       |   +-- mock-care-context.adapter.ts
|       |   +-- mock-hie.adapter.ts
|       |   +-- mock-patient-discovery.adapter.ts
|       +-- abdm.module.ts
|
+-- providers/
    +-- storage/
    |   +-- storage.service.ts             # MinIO/S3 provider
    |   +-- storage.module.ts
    |   +-- interfaces/
    |       +-- storage.interface.ts
    |
    +-- cache/
    |   +-- cache.service.ts               # Redis provider
    |   +-- cache.module.ts
    |   +-- interfaces/
    |       +-- cache.interface.ts
    |
    +-- messaging/
    |   +-- event-bus.service.ts            # Event bus (Redis pub/sub + Bull)
    |   +-- messaging.module.ts
    |   +-- interfaces/
    |       +-- messaging.interface.ts
    |
    +-- observability/
        +-- observability.service.ts       # OpenTelemetry export
        +-- observability.module.ts
        +-- tracing/
        |   +-- tracing.interceptor.ts
        +-- metrics/
        |   +-- metrics.interceptor.ts
        +-- logging/
            +-- structured-logger.service.ts
```

### 2.2 Module Dependency Rules

Modules follow strict dependency rules to maintain architectural integrity:

```
Identity       -> common (encryption, security, audit, abdm)
Auth           -> Identity, common (security, audit)
Profile        -> Identity, common (encryption, audit)
Vault          -> Identity, common (encryption, audit), providers (storage)
Consent        -> Identity, Profile, common (abdm, audit)
Care-Context   -> Identity, Consent, common (audit)
Timeline       -> Identity, Consent, Care-Context, Vault, common (audit)
Discovery      -> Profile, common (audit)
Telemedicine   -> Identity, Profile, common (security, audit)
Prescriptions  -> Identity, Profile, Care-Context, common (audit)
Pharmacy       -> Identity, Profile, Prescriptions, Payments
Diagnostics    -> Identity, Profile, Care-Context, common (audit)
Payments       -> Identity, common (audit), providers (messaging)
Family         -> Identity, Profile, common (audit)
Insurance      -> Identity, Profile, Payments, common (audit)
Notifications  -> Identity, common (audit), providers (messaging)
Admin          -> (all modules - guarded by RBAC)
AI             -> Timeline, Vault, common (encryption, audit)
Interoperability -> common (abdm), Consent, Care-Context, Vault
Search         -> Vault, Timeline, common (encryption, audit)
Health         -> (no module dependencies - standalone)
```

**Rule enforcement:**
- Modules import services from `common/` through NestJS modules
- Cross-module communication uses the Event Bus (Command/Event pattern)
- Direct service-to-service imports between peer modules are forbidden
- Module boundaries are enforced with ESLint `import/no-restricted-paths`

### 2.3 Event Bus Integration

The event bus decouples modules and enables asynchronous workflows:

| Event                       | Publisher        | Subscribers                     | Purpose                        |
|-----------------------------|------------------|---------------------------------|--------------------------------|
| `wysh.id.created`           | Identity         | Auth, Profile, Notifications    | User registered                |
| `wysh.profile.updated`      | Profile          | Timeline, AI, Search            | Profile change propagated      |
| `wysh.document.uploaded`    | Vault            | AI, Search, Timeline            | New document processed         |
| `wysh.consent.granted`      | Consent          | Timeline, Interoperability      | Consent propagated             |
| `wysh.consent.revoked`      | Consent          | Vault, Interoperability         | Access revoked                 |
| `wysh.appointment.created`  | Telemedicine     | Timeline, Notifications         | Appointment scheduled          |
| `wysh.prescription.created` | Prescriptions    | Timeline, Pharmacy, AI          | Prescription processed         |
| `wysh.payment.completed`    | Payments         | Insurance, Notifications        | Payment confirmed              |
| `wysh.abdm.data.pushed`     | Interop          | Vault, Timeline                 | ABDM data received             |
| `wysh.ai.analysis.ready`    | AI               | Notifications                   | Analysis complete              |

---

## 3. Database Schema Redesign

### 3.1 Prisma Schema Models

#### 3.1.1 WyshIdentity (Core Identity)

```prisma
model WyshIdentity {
  id        String   @id @default(cuid())
  wyshId    String   @unique @default("") // WYSH-XXXXXXXX format
  publicKey String?  // Public key for encryption
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User?
  patient   PatientNode?
  provider  ProviderNode?

  @@map("wysh_identities")
}

model User {
  id            String   @id @default(cuid())
  wyshId        String   @unique
  phone         String?  @unique
  email         String?  @unique
  displayName   String?
  avatarUrl     String?
  dateOfBirth   DateTime?
  gender        String?
  address       Json?    // JSONB: structured address
  isPhoneVerified Boolean @default(false)
  isEmailVerified Boolean @default(false)
  lastLoginAt   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  identity      WyshIdentity @relation(fields: [wyshId], references: [wyshId])
  consentGrants ConsentGrant[]
  consentArtifacts ConsentArtifact[]

  @@map("users")
}

model IdentityAudit {
  id          String   @id @default(cuid())
  wyshId      String
  action      String   // CREATED, UPDATED, VERIFIED, LINKED
  fieldName   String?
  oldValue    String?
  newValue    String?
  ipAddress   String?
  userAgent   String?
  performedBy String?
  timestamp   DateTime @default(now())

  @@index([wyshId])
  @@index([timestamp])
  @@map("identity_audits")
}
```

#### 3.1.2 Health Graph Models

```prisma
model PatientNode {
  id            String   @id @default(cuid())
  wyshId        String   @unique
  bloodGroup    String?
  allergies     Json?    // JSONB array of allergy records
  chronicConditions Json? // JSONB array of conditions
  emergencyContact Json?  // JSONB
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  identity      WyshIdentity @relation(fields: [wyshId], references: [wyshId])
  familyEdgesAsMember FamilyEdge[] @relation("FamilyMember")
  familyEdgesAsGroup  FamilyEdge[] @relation("FamilyGroup")
  clinicalEdges      ClinicalEdge[] @relation("PatientClinical")
  careEvents         CareEvent[] @relation("PatientCareEvent")
  timelineEntries    HealthTimelineEntry[]

  @@map("patient_nodes")
}

model FamilyEdge {
  id          String   @id @default(cuid())
  familyGroupId String
  patientId   String   // wyshId of family member
  relationship String   // SELF, SPOUSE, CHILD, PARENT, SIBLING, GUARDIAN
  isPrimary   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  patient   PatientNode @relation("FamilyMember", fields: [patientId], references: [wyshId])
  group     PatientNode @relation("FamilyGroup", fields: [familyGroupId], references: [wyshId])

  @@unique([familyGroupId, patientId])
  @@index([patientId])
  @@map("family_edges")
}

model ProviderNode {
  id              String   @id @default(cuid())
  wyshId          String   @unique
  providerType    String   // DOCTOR, CLINIC, HOSPITAL, LAB, PHARMACY
  name            String
  speciality      String?
  qualifications  Json?    // JSONB
  registrationNo  String?
  address         Json?    // JSONB
  contactInfo     Json?    // JSONB
  isVerified      Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  identity      WyshIdentity @relation(fields: [wyshId], references: [wyshId])
  clinicalEdges ClinicalEdge[] @relation("ProviderClinical")

  @@map("provider_nodes")
}

model CareEvent {
  id          String   @id @default(cuid())
  eventType   String   // CONSULTATION, PRESCRIPTION, DIAGNOSTIC, etc.
  patientId   String   // wyshId
  providerId  String?
  facilityId  String?
  title       String
  description String?
  eventDate   DateTime
  status      String   // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
  metadata    Json?    // JSONB
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  patient       PatientNode @relation("PatientCareEvent", fields: [patientId], references: [wyshId])
  clinicalEdges ClinicalEdge[]

  @@index([patientId])
  @@index([eventDate])
  @@map("care_events")
}

model ClinicalEdge {
  id           String   @id @default(cuid())
  edgeType     String   // HAS_CONDITION, HAS_ALLERGY, UNDERGOES, etc.
  patientId    String?  // wyshId
  providerId   String?  // wyshId
  careEventId  String?  // care event reference
  targetType   String   // CONDITION, ALLERGY, MEDICATION, PROCEDURE, etc.
  targetId     String   // Generic reference ID
  properties   Json?    // JSONB: edge-specific properties
  sourceId     String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  patient  PatientNode? @relation("PatientClinical", fields: [patientId], references: [wyshId])
  provider ProviderNode? @relation("ProviderClinical", fields: [providerId], references: [wyshId])
  careEvent CareEvent? @relation(fields: [careEventId], references: [id])

  @@index([patientId])
  @@index([providerId])
  @@index([edgeType])
  @@index([targetType, targetId])
  @@map("clinical_edges")
}
```

#### 3.1.3 Consent Engine Models

```prisma
model ConsentPurpose {
  id          String   @id @default(cuid())
  code        String   @unique  // PATRQT, CAREMGT, BTG, etc.
  name        String
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  artifacts ConsentArtifact[]

  @@map("consent_purposes")
}

model ConsentArtifact {
  id            String   @id @default(cuid())
  consentId     String   @unique  // ABDM consent ID
  patientId     String   // wyshId
  providerId    String   // wyshId of data consumer
  purposeId     String
  hiTypes       Json     // JSONB array
  accessMode    String   // VIEW | STORE | QUERY | STREAM
  dateFrom      DateTime
  dateTo        DateTime
  signature     String?  // JWS signature
  status        String   // REQUESTED | GRANTED | REVOKED | EXPIRED | DENIED
  consentData   Json?    // Full ABDM consent artifact JSON
  validFrom     DateTime
  validTo       DateTime
  revokedAt     DateTime?
  expiryNotified Boolean @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  patient   User @relation(fields: [patientId], references: [wyshId])
  purpose   ConsentPurpose @relation(fields: [purposeId], references: [id])
  grants    ConsentGrant[]
  audits    ConsentAudit[]

  @@index([patientId])
  @@index([providerId])
  @@index([status])
  @@index([validFrom, validTo])
  @@map("consent_artifacts")
}

model ConsentGrant {
  id          String   @id @default(cuid())
  artifactId  String
  granteeId   String   // wyshId of entity granted access
  accessMode  String   // VIEW | STORE | QUERY | STREAM
  status      String   // ACTIVE | REVOKED | EXPIRED
  grantedAt   DateTime @default(now())
  revokedAt   DateTime?
  expiresAt   DateTime

  artifact ConsentArtifact @relation(fields: [artifactId], references: [id])

  @@index([granteeId])
  @@index([artifactId])
  @@map("consent_grants")
}

model ConsentAudit {
  id          String   @id @default(cuid())
  artifactId  String
  action      String   // CREATED, GRANTED, REVOKED, EXPIRED, ACCESSED, EMERGENCY_ACCESS
  performedBy String   // wyshId
  ipAddress   String?
  details     Json?    // JSONB
  timestamp   DateTime @default(now())

  artifact ConsentArtifact @relation(fields: [artifactId], references: [id])

  @@index([artifactId])
  @@index([timestamp])
  @@index([performedBy])
  @@map("consent_audits")
}
```

#### 3.1.4 Encrypted Vault Models

```prisma
model DocumentCategory {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  parentId    String?
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  children DocumentCategory[] @relation("CategoryHierarchy")
  parent   DocumentCategory?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  documents HealthDocument[]

  @@map("document_categories")
}

model HealthDocument {
  id             String   @id @default(cuid())
  patientId      String   // wyshId
  categoryId     String?
  title          String
  description    String?
  fileName       String
  fileType       String   // MIME type
  fileSize       Int
  storagePath    String   // MinIO/S3 path
  encryptedDek   String   // Encrypted Data Encryption Key
  dekVersion     Int      // Key version used for DEK encryption
  checksum       String   // SHA-256 of original file
  isEncrypted    Boolean  @default(true)
  status         String   // ACTIVE, ARCHIVED, DELETED
  tags           Json?    // JSONB array
  metadata       Json?    // JSONB
  uploadedAt     DateTime @default(now())
  updatedAt      DateTime @updatedAt
  deletedAt      DateTime?

  category  DocumentCategory? @relation(fields: [categoryId], references: [id])
  versions  DocumentVersion[]
  shares    DocumentShare[]

  @@index([patientId])
  @@index([status])
  @@index([patientId, categoryId])
  @@map("health_documents")
}

model DocumentVersion {
  id             String   @id @default(cuid())
  documentId     String
  versionNumber  Int
  fileName       String
  fileSize       Int
  storagePath    String
  encryptedDek   String
  checksum       String
  changeNote     String?
  uploadedBy     String   // wyshId
  createdAt      DateTime @default(now())

  document HealthDocument @relation(fields: [documentId], references: [id])

  @@unique([documentId, versionNumber])
  @@index([documentId])
  @@map("document_versions")
}

model DocumentShare {
  id          String   @id @default(cuid())
  documentId  String
  sharedWith  String   // wyshId
  accessLevel String   // VIEW | DOWNLOAD
  signedUrl   String?
  urlExpiry   DateTime?
  isRevoked   Boolean  @default(false)
  sharedBy    String   // wyshId
  createdAt   DateTime @default(now())
  expiresAt   DateTime

  document HealthDocument @relation(fields: [documentId], references: [id])

  @@index([documentId])
  @@index([sharedWith])
  @@index([expiresAt])
  @@map("document_shares")
}
```

#### 3.1.5 Timeline Engine Models

```prisma
model HealthTimelineEntry {
  id            String   @id @default(cuid())
  patientId     String   // wyshId
  entryType     String   // CONSULTATION | PRESCRIPTION | DIAGNOSTIC | HOSPITALIZATION | VACCINATION | ALLERGY | CONDITION | PROCEDURE | MEDICATION | NOTE
  sourceId      String?
  sourceType    String?
  title         String
  summary       String?
  occurredAt    DateTime
  recordedAt    DateTime @default(now())
  structuredData Json?   // JSONB: type-specific structured data
  metadata      Json?    // JSONB
  isVerified    Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  patient PatientNode @relation(fields: [patientId], references: [wyshId])

  @@index([patientId, occurredAt])
  @@index([patientId, entryType])
  @@index([patientId, entryType, occurredAt])
  @@index([sourceId])
  @@map("health_timeline_entries")
}

model TimelineAggregate {
  id          String   @id @default(cuid())
  patientId   String   // wyshId
  aggregateType String // MEDICATION_TIMELINE | CONDITION_TIMELINE | DOCTOR_TIMELINE | FAMILY_HISTORY
  data        Json     // JSONB: computed aggregation data
  lastComputed DateTime @default(now())
  createdAt   DateTime @default(now())

  @@unique([patientId, aggregateType])
  @@index([patientId])
  @@map("timeline_aggregates")
}
```

### 3.2 Entity Relationship Diagram (Textual)

```
+----------------+       +------------------+       +------------------+
|  WyshIdentity  |       |      User        |       |   PatientNode    |
+----------------+       +------------------+       +------------------+
|  id (PK)       |       |  id (PK)         |       |  id (PK)         |
|  wyshId (UQ)   |--1:1--|  wyshId (UQ,FK)  |--1:1--|  wyshId (UQ,FK)  |
|  publicKey     |       |  phone (UQ)      |       |  bloodGroup      |
|  createdAt     |       |  email (UQ)      |       |  allergies (JB)  |
+----------------+       |  displayName     |       |  chronicCond(JB) |
        |                |  ...             |       |  emergencyCont   |
        |                +------------------+       +--------+---------+
        |                                                     |
        |                +------------------+                 |
        |                |  ProviderNode    |                 |
        |                +------------------+                 |
        +---1:1----------|  wyshId (UQ,FK)  |                 |
                         |  providerType    |                 |
                         |  name            |                 |
                         |  speciality      |                 |
                         |  ...             |                 |
                         +------------------+                 |
                                                               |
+------------------+       +------------------+               |
|  FamilyEdge      |       |  ClinicalEdge    |               |
+------------------+       +------------------+               |
|  familyGroupId   |--M:1--|  patientId (FK)  |<--------------+
|  patientId (FK)  |--M:1--|  providerId (FK) |<--+
|  relationship    |       |  careEventId(FK) |   |
|  isPrimary       |       |  edgeType        |   |
|  ...             |       |  targetType      |   |
+------------------+       |  targetId        |   |
                           |  properties(JB)  |   |
                    +------|  ...             |   |
                    |      +------------------+   |
                    |                             |
+-------------------+      +------------------+   |
|                          |   CareEvent      |   |
|                  +-------|------------------+   |
|                  |       |  id (PK)         |---+
|                  |     +-|  patientId (FK)  |
|                  |     | |  providerId(FK)  |
|                  |     | |  eventType       |
|                  |     | |  eventDate       |
|                  |     | |  title           |
|                  |     | |  status          |
|                  |     | |  metadata (JB)   |
|                  |     | +------------------+
|                  |     |
|                  v     v
|  +-------------------------------------------+
|  |     ConsentArtifact                       |
|  +-------------------------------------------+
|  |  consentId (UQ)                           |
|  |  patientId (FK)  -----+--- User.wyshId   |
|  |  providerId          +--- Provider/User   |
|  |  purposeId (FK)     --- ConsentPurpose   |
|  |  hiTypes (JB)                             |
|  |  accessMode                               |
|  |  dateFrom / dateTo                       |
|  |  signature (JWS)                          |
|  |  status                                   |
|  |  validFrom / validTo                     |
|  +------------------+------------------------+
|                     |
|                     v
|  +------------------+       +------------------+
|  |  ConsentGrant    |       |  ConsentAudit    |
|  +------------------+       +------------------+
|  |  artifactId (FK) |       |  artifactId (FK) |
|  |  granteeId       |       |  action          |
|  |  accessMode      |       |  performedBy     |
|  |  status          |       |  ipAddress       |
|  |  grantedAt       |       |  details (JB)    |
|  |  expiresAt       |       |  timestamp       |
|  +------------------+       +------------------+

|  +------------------+       +------------------+
|  |  HealthDocument  |       |  DocumentVersion |
|  +------------------+       +------------------+
|  |  patientId (FK)  |--1:M--|  documentId (FK) |
|  |  categoryId (FK) |       |  versionNumber   |
|  |  title           |       |  storagePath     |
|  |  fileName        |       |  encryptedDek    |
|  |  storagePath     |       |  checksum        |
|  |  encryptedDek    |       |  ...             |
|  |  dekVersion      |       +------------------+
|  |  checksum        |
|  |  isEncrypted     |       +------------------+
|  |  status          |--1:M--|  DocumentShare   |
|  |  tags (JB)       |       +------------------+
|  |  metadata (JB)   |       |  sharedWith      |
|  +------------------+       |  signedUrl       |
|                             |  urlExpiry       |
|  +------------------+       |  accessLevel     |
|  | DocumentCategory |       |  ...             |
|  +------------------+       +------------------+
|  |  name (UQ)       |
|  |  parentId (FK)   |--self-referencing hierarchy
|  |  sortOrder       |
|  +------------------+

|  +----------------------------+
|  |  HealthTimelineEntry       |
|  +----------------------------+
|  |  patientId (FK) ------------+ PatientNode.wyshId
|  |  entryType                 |
|  |  sourceId / sourceType     |
|  |  title / summary           |
|  |  occurredAt / recordedAt   |
|  |  structuredData (JB)       |
|  |  isVerified                |
|  +----------------------------+

|  +----------------------------+
|  |  TimelineAggregate         |
|  +----------------------------+
|  |  patientId                 |
|  |  aggregateType (UQ)        |
|  |  data (JB)                 |
|  |  lastComputed              |
|  +----------------------------+
```

### 3.3 Migration Strategy

```sql
-- Phase 1: New tables (no existing data impact)
CREATE TABLE wysh_identities (...);
CREATE TABLE consent_purposes (...);
CREATE TABLE consent_artifacts (...);
CREATE TABLE consent_grants (...);
CREATE TABLE consent_audits (...);
CREATE TABLE document_categories (...);
CREATE TABLE health_documents (...);
CREATE TABLE document_versions (...);
CREATE TABLE document_shares (...);
CREATE TABLE patient_nodes (...);
CREATE TABLE provider_nodes (...);
CREATE TABLE family_edges (...);
CREATE TABLE care_events (...);
CREATE TABLE clinical_edges (...);
CREATE TABLE health_timeline_entries (...);
CREATE TABLE timeline_aggregates (...);
CREATE TABLE identity_audits (...);

-- Phase 2: Data migration from existing User model
-- Insert into wysh_identities for all existing users
-- Insert into patient_nodes for all patients
-- Move PHI fields to encrypted columns

-- Phase 3: Deprecate old tables
-- Old consent tables replaced by new consent_artifacts
-- Old document tables replaced by health_documents
-- Timeline derived from existing consultation/prescription data
```

### 3.4 Index Strategy

| Table                     | Index                                      | Type              | Purpose                        |
|---------------------------|--------------------------------------------|-------------------|--------------------------------|
| `wysh_identities`         | `wyshId`                                   | UNIQUE B-tree     | Primary lookup                 |
| `users`                   | `phone`                                    | UNIQUE B-tree     | Login by phone                 |
| `users`                   | `email`                                    | UNIQUE B-tree     | Login by email                 |
| `consent_artifacts`       | `(patientId, status)`                      | Composite B-tree  | Patient consent list           |
| `consent_artifacts`       | `(validFrom, validTo)`                     | Composite B-tree  | Expiry checks                  |
| `clinical_edges`          | `(patientId, edgeType)`                    | Composite B-tree  | Patient graph queries          |
| `clinical_edges`          | `(targetType, targetId)`                   | Composite B-tree  | Reverse lookups                |
| `health_documents`        | `(patientId, categoryId)`                  | Composite B-tree  | Document listing               |
| `health_timeline_entries` | `(patientId, occurredAt)`                  | Composite DESC    | Timeline ordering              |
| `health_timeline_entries` | `(patientId, entryType, occurredAt)`       | Composite B-tree  | Filtered timelines             |
| `identity_audits`         | `(wyshId, timestamp)`                      | Composite B-tree  | Audit trail                    |
| `consent_audits`          | `(artifactId, timestamp)`                  | Composite B-tree  | Consent audit trail            |

---

## 4. API Specifications

### 4.1 Identity APIs

#### POST /api/v1/identity/create

Create a new WyshIdentity. This is the primary entry point for all new users. A WyshID is generated in the format `WYSH-XXXXXXXX` and serves as the immutable identifier for the user throughout the platform.

**Request:**
```json
{
  "phone": "+919876543210",
  "email": "user@example.com",
  "displayName": "John Doe",
  "dateOfBirth": "1990-01-15",
  "gender": "MALE"
}
```

**Response (201):**
```json
{
  "wyshId": "WYSH-A3B8C9D2",
  "publicKey": "-----BEGIN PUBLIC KEY-----\n...",
  "createdAt": "2026-06-04T10:30:00Z",
  "profile": {
    "phone": "+919876543210",
    "email": "user@example.com",
    "displayName": "John Doe"
  }
}
```

**Security:**
- Rate limited: 5 requests per IP per minute
- Phone verification required before WyshID activation
- Public/private key pair generated server-side, private key encrypted with user password and returned only once

---

#### GET /api/v1/identity/me

Get the current user's identity graph including profile data and linked entities.

**Response (200):**
```json
{
  "wyshId": "WYSH-A3B8C9D2",
  "publicKey": "-----BEGIN PUBLIC KEY-----\n...",
  "createdAt": "2026-06-04T10:30:00Z",
  "profile": {
    "phone": "+919876543210",
    "email": "user@example.com",
    "displayName": "John Doe",
    "avatarUrl": "https://cdn.wyshcare.in/avatars/a3b8c9d2.jpg",
    "dateOfBirth": "1990-01-15",
    "gender": "MALE",
    "isPhoneVerified": true,
    "isEmailVerified": true
  }
}
```

#### PUT /api/v1/identity/profile

Update profile fields. The WyshID itself is immutable.

**Response (200):**
```json
{
  "wyshId": "WYSH-A3B8C9D2",
  "updatedFields": ["displayName", "avatarUrl", "address"],
  "updatedAt": "2026-06-04T11:00:00Z"
}
```

#### GET /api/v1/identity/graph

Return the full health graph for the authenticated user.

**Response (200):**
```json
{
  "patient": {
    "wyshId": "WYSH-A3B8C9D2",
    "bloodGroup": "O+",
    "allergies": ["Penicillin", "Peanuts"],
    "chronicConditions": ["Asthma"]
  },
  "family": [
    {
      "wyshId": "WYSH-B4C9D0E3",
      "relationship": "SPOUSE",
      "displayName": "Jane Doe",
      "bloodGroup": "A+"
    }
  ],
  "providers": [
    {
      "wyshId": "WYSH-C5D0E1F4",
      "name": "Dr. Sharma",
      "speciality": "Cardiology",
      "relationship": "PRIMARY_CARE"
    }
  ],
  "conditions": [
    {
      "id": "COND-001",
      "name": "Asthma",
      "diagnosedAt": "2020-03-15",
      "status": "MANAGED",
      "severity": "MODERATE"
    }
  ],
  "medications": [
    {
      "id": "MED-001",
      "name": "Salbutamol",
      "dosage": "100mcg",
      "frequency": "AS_NEEDED",
      "prescribedBy": "WYSH-C5D0E1F4",
      "startDate": "2020-03-15",
      "endDate": null
    }
  ]
}
```

### 4.2 Vault APIs

#### POST /api/v1/vault/documents

Upload an encrypted health document.

**Request:** `multipart/form-data`
```
file: <binary file>
title: "Blood Test Report - June 2026"
categoryId: "cat-lab-reports"
description: "Complete blood count and lipid profile"
tags: ["blood-test", "lipids", "cbc"]
```

**Response (201):**
```json
{
  "id": "DOC-001",
  "title": "Blood Test Report - June 2026",
  "fileName": "blood-test-jun2026.pdf",
  "fileType": "application/pdf",
  "fileSize": 245760,
  "checksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "isEncrypted": true,
  "status": "ACTIVE",
  "uploadedAt": "2026-06-04T12:00:00Z"
}
```

**Process:**
1. File received by API Gateway (max 50MB)
2. SHA-256 checksum computed
3. DEK (Data Encryption Key) generated: 256-bit random
4. File encrypted with AES-256-GCM using DEK
5. DEK encrypted with KEK (Key Encryption Key) using AES-256-GCM
6. Encrypted file uploaded to MinIO/S3
7. Metadata stored in PostgreSQL (encrypted DEK, checksum, path)
8. Original request body discarded from memory

---

#### GET /api/v1/vault/documents

List documents for the authenticated user with pagination and filtering.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `categoryId` (optional filter)
- `status` (optional: ACTIVE, ARCHIVED, DELETED)
- `search` (optional full-text search on title/description)
- `sortBy` (optional: uploadedAt, title, fileSize)
- `sortOrder` (optional: asc, desc)

---

#### GET /api/v1/vault/documents/:id

Get document metadata (not the file content).

**Response (200):**
```json
{
  "id": "DOC-001",
  "patientId": "WYSH-A3B8C9D2",
  "category": { "id": "cat-lab-reports", "name": "Lab Reports" },
  "title": "Blood Test Report - June 2026",
  "description": "Complete blood count and lipid profile",
  "fileName": "blood-test-jun2026.pdf",
  "fileType": "application/pdf",
  "fileSize": 245760,
  "checksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "isEncrypted": true,
  "status": "ACTIVE",
  "tags": ["blood-test", "lipids", "cbc"],
  "metadata": { "extractedText": true, "pages": 3, "ocrProcessed": false },
  "uploadedAt": "2026-06-04T12:00:00Z",
  "updatedAt": "2026-06-04T12:00:00Z",
  "versionCount": 1,
  "latestVersion": 1
}
```

---

#### GET /api/v1/vault/documents/:id/download

Get a pre-signed URL for document download.

**Query Parameters:**
- `version` (optional, defaults to latest)
- `expiry` (optional, minutes until URL expires, default: 15, max: 60)

**Response (200):**
```json
{
  "signedUrl": "https://minio.wyshcare.in/health-documents/enc-ab3d...?X-Amz-Algorithm=...",
  "expiresAt": "2026-06-04T12:15:00Z",
  "fileName": "blood-test-jun2026.pdf",
  "fileType": "application/pdf",
  "fileSize": 245760
}
```

**Security:**
- Signed URL is time-limited (default 15 minutes)
- URL is tied to the requesting user's IP
- Download is logged in audit trail
- Document is decrypted on-the-fly during download

---

#### DELETE /api/v1/vault/documents/:id

Soft-delete a document. The document is marked as `DELETED` in the database but the encrypted blob remains in storage for 30 days (configurable retention period).

**Response (200):**
```json
{
  "id": "DOC-001",
  "status": "DELETED",
  "deletedAt": "2026-06-04T13:00:00Z",
  "permanentDeletionAt": "2026-07-04T13:00:00Z"
}
```

---

#### GET /api/v1/vault/documents/:id/versions

Get version history for a document.

**Response (200):**
```json
{
  "documentId": "DOC-001",
  "versions": [
    {
      "versionNumber": 2,
      "fileName": "blood-test-jun2026-v2.pdf",
      "fileSize": 250000,
      "changeNote": "Updated with additional lipid panel results",
      "uploadedBy": "WYSH-A3B8C9D2",
      "createdAt": "2026-06-04T14:00:00Z"
    },
    {
      "versionNumber": 1,
      "fileName": "blood-test-jun2026.pdf",
      "fileSize": 245760,
      "changeNote": null,
      "uploadedBy": "WYSH-A3B8C9D2",
      "createdAt": "2026-06-04T12:00:00Z"
    }
  ]
}
```

---

### 4.3 Consent APIs

#### POST /api/v1/consent/grants

Create a new consent grant.

**Request:**
```json
{
  "providerId": "WYSH-C5D0E1F4",
  "purpose": "CAREMGT",
  "hiTypes": ["Prescription", "DiagnosticReport", "Immunization"],
  "accessMode": "VIEW",
  "dateRange": { "from": "2025-01-01T00:00:00Z", "to": "2026-12-31T23:59:59Z" },
  "validity": { "from": "2026-06-04T00:00:00Z", "to": "2027-06-04T23:59:59Z" }
}
```

**Response (201):**
```json
{
  "consentId": "CNT-A3B8C9D2E1F4",
  "status": "REQUESTED",
  "patientId": "WYSH-A3B8C9D2",
  "providerId": "WYSH-C5D0E1F4",
  "purpose": { "code": "CAREMGT", "name": "Care Management" },
  "hiTypes": ["Prescription", "DiagnosticReport", "Immunization"],
  "accessMode": "VIEW",
  "validFrom": "2026-06-04T00:00:00Z",
  "validTo": "2027-06-04T23:59:59Z",
  "signature": "eyJhbGciOiJIUzI1NiIs...",
  "createdAt": "2026-06-04T15:00:00Z"
}
```

**Process:**
1. Consent request created with status `REQUESTED`
2. Patient receives notification to review and approve/deny
3. If approved: status -> `GRANTED`, JWS signature generated
4. If denied: status -> `DENIED`
5. If not acted upon within validity period: status -> `EXPIRED`

---

#### GET /api/v1/consent/grants

List consent grants for the authenticated user.

**Query Parameters:**
- `page`, `limit`
- `status` (optional: REQUESTED, GRANTED, REVOKED, EXPIRED, DENIED)
- `direction` (optional: GIVEN, RECEIVED)
- `purpose` (optional filter by purpose code)

---

#### PATCH /api/v1/consent/grants/:id/revoke

Revoke a previously granted consent.

**Response (200):**
```json
{
  "consentId": "CNT-A3B8C9D2E1F4",
  "status": "REVOKED",
  "revokedAt": "2026-06-04T16:00:00Z",
  "previousStatus": "GRANTED"
}
```

**Process:**
1. Consent status changed to `REVOKED`
2. Event `wysh.consent.revoked` published
3. Vault module notified to revoke access
4. If ABDM-linked, revocation propagated via ConsentManagerAdapter

---

#### GET /api/v1/consent/artifacts/:id

Get full consent artifact including ABDM-compatible format.

---

#### POST /api/v1/consent/emergency

Emergency access - allows a healthcare provider to access patient data without prior consent during a medical emergency.

**Request:**
```json
{
  "providerId": "WYSH-D6E1F2G5",
  "reason": "Patient unconscious, requires immediate access to allergy records",
  "emergencyType": "LIFE_THREATENING",
  "estimatedDuration": 4
}
```

**Response (200):**
```json
{
  "accessId": "EMG-001",
  "status": "ACTIVE",
  "grantedAt": "2026-06-04T17:00:00Z",
  "expiresAt": "2026-06-04T21:00:00Z",
  "consentArtifact": {
    "consentId": "EMG-CNT-001",
    "status": "GRANTED",
    "accessMode": "VIEW",
    "validTo": "2026-06-04T21:00:00Z"
  }
}
```

**Security:**
- Emergency access is time-limited (max 4 hours)
- Provider must justify the emergency
- Patient is notified immediately
- All emergency access is flagged for mandatory review within 24 hours
- Repeated emergency access from the same provider triggers fraud alert

---

### 4.4 Timeline APIs

#### GET /api/v1/timeline

Get the patient's health timeline, sorted chronologically.

**Query Parameters:**
- `page`, `limit`
- `entryTypes` (comma-separated filter)
- `from`, `to` (ISO date range)
- `search` (full-text search in title/summary)

---

#### GET /api/v1/timeline/medications

Get a structured medication timeline showing all medications with start/end dates.

---

#### GET /api/v1/timeline/conditions

Get a structured condition timeline.

---

#### GET /api/v1/timeline/doctors

Get a timeline of provider interactions.

### 4.5 ABDM APIs

#### POST /api/v1/abdm/link

Link an ABHA address to the user's WyshID.

**Response (200):**
```json
{
  "wyshId": "WYSH-A3B8C9D2",
  "abhaAddress": "john.doe@abdm",
  "abhaNumber": "91-2345-6789-1011",
  "linkedAt": "2026-06-04T18:00:00Z",
  "status": "ACTIVE"
}
```

---

#### GET /api/v1/abdm/status

Get ABDM integration status.

**Response (200):**
```json
{
  "wyshId": "WYSH-A3B8C9D2",
  "abhaLinked": true,
  "abhaAddress": "john.doe@abdm",
  "consentsSynced": 3,
  "careContexts": { "total": 5, "synced": 3, "pending": 2 },
  "lastSyncAt": "2026-06-04T17:30:00Z",
  "sandboxMode": true
}
```

---

### 4.6 Search APIs

#### GET /api/v1/search/records

Full-text search across health documents.

**Query Parameters:**
- `q` (search query)
- `page`, `limit`
- `categories` (comma-separated)
- `dateFrom`, `dateTo`
- `fileTypes` (comma-separated MIME types)

---

#### GET /api/v1/search/timeline

Search across the health timeline.

### 4.7 Rate Limiting Specifications

| Endpoint Group                       | Rate Limit   | Burst | Scope |
|--------------------------------------|-------------|-------|-------|
| `/api/v1/identity/create`           | 5 req/min   | 10    | IP    |
| `/api/v1/identity/*`                | 60 req/min  | 100   | User  |
| `/api/v1/vault/documents` POST      | 10 req/min  | 20    | User  |
| `/api/v1/vault/documents` GET       | 120 req/min | 200   | User  |
| `/api/v1/vault/documents/:id/download`| 30 req/min | 50    | User  |
| `/api/v1/consent/*`                 | 30 req/min  | 50    | User  |
| `/api/v1/consent/emergency`         | 3 req/hour  | 5     | User  |
| `/api/v1/timeline/*`                | 120 req/min | 200   | User  |
| `/api/v1/search/*`                  | 60 req/min  | 100   | User  |
| `/api/v1/abdm/*`                    | 30 req/min  | 50    | User  |

---

## 5. Security Architecture

### 5.1 Encryption Architecture

#### 5.1.1 Key Hierarchy

```
+----------------------------------------------------------+
|                     MASTER KEY (MK)                       |
|  - Stored in HSM / cloud KMS (AWS KMS / Azure Key Vault) |
|  - Never exposed to application memory                    |
|  - Wrapped KEK retrieved at application startup           |
|  - Rotated annually (or on compromise)                    |
+---------------------------+------------------------------+
                            | Encrypts/Decrypts
                            v
+----------------------------------------------------------+
|                KEY ENCRYPTION KEY (KEK)                   |
|  - Stored in application config (encrypted by MK)         |
|  - Loaded into memory at application startup              |
|  - Used to encrypt/decrypt DEKs                           |
|  - Rotated quarterly                                      |
+---------------------------+------------------------------+
                            | Encrypts/Decrypts
                            v
+----------------------------------------------------------+
|              DATA ENCRYPTION KEYS (DEKs)                  |
|  - One DEK per document or per field                      |
|  - Generated as cryptographically random 256-bit values   |
|  - Stored encrypted-by-KEK in database alongside data     |
|  - Never stored in plaintext                              |
|  - Key version tracked for rotation                       |
+---------------------------+------------------------------+
                            | Encrypts/Decrypts
                            v
+----------------------------------------------------------+
|                    ENCRYPTED DATA                          |
|  - AES-256-GCM encryption                                 |
|  - Each operation uses unique 96-bit IV/nonce             |
|  - GCM authentication tag (128-bit) appended to ciphertext|
|  - Additional Authenticated Data (AAD) includes context   |
+----------------------------------------------------------+
```

#### 5.1.2 Field-Level Encryption

PHI fields are encrypted at the database level using a custom `@Encrypted()` decorator.

**Encrypted fields:**

| Entity          | Field               | Encryption Context (AAD)          |
|-----------------|---------------------|-----------------------------------|
| `User`          | `phone`             | `user:phone:{wyshId}`             |
| `User`          | `email`             | `user:email:{wyshId}`             |
| `PatientNode`   | `bloodGroup`        | `patient:bloodGroup:{wyshId}`     |
| `PatientNode`   | `allergies`         | `patient:allergies:{wyshId}`      |
| `PatientNode`   | `chronicConditions` | `patient:chronicConditions:{wyshId}`|
| `PatientNode`   | `emergencyContact`  | `patient:emergencyContact:{wyshId}`|
| `HealthDocument`| `fileName`          | `document:fileName:{docId}`       |
| `HealthDocument`| `title`             | `document:title:{docId}`          |

The decorator intercepts Prisma create/update operations to transparently encrypt fields before writing to the database, and decrypt them on read.

#### 5.1.3 Key Rotation

```
interface KeyRotationPolicy {
  masterKey: { rotationPeriod: 'ANNUALLY' };
  kek:       { rotationPeriod: 'QUARTERLY' };
  dek:       { rotationPeriod: 'PER_DOCUMENT' }; // New DEK per document
}

// KEK rotation process:
// 1. Generate new KEK (KEK_v2)
// 2. Re-encrypt all DEKs with KEK_v2
// 3. Update dekVersion in database
// 4. Mark KEK_v1 as decommissioned
// 5. Old DEKs remain decryptable if KEK_v1 retained for grace period
```

### 5.2 Access Control (RBAC)

#### 5.2.1 Permission Matrix

| Permission                   | Patient | Doctor | Lab Tech | Pharm. | Support | Admin |
|------------------------------|---------|--------|----------|--------|---------|-------|
| `identity:read:own`          | Y       | Y      | Y        | Y      | Y       | Y     |
| `identity:read:any`          | N       | N      | N        | N      | N       | Y     |
| `identity:update:own`        | Y       | Y      | Y        | Y      | N       | Y     |
| `profile:read:own`           | Y       | Y      | Y        | Y      | Y       | Y     |
| `profile:read:patient` (c)   | N       | Y      | Y        | Y      | N       | N     |
| `vault:read:own`             | Y       | N      | N        | N      | N       | N     |
| `vault:read:consented`       | N       | Y      | Y        | Y      | N       | N     |
| `vault:write:own`            | Y       | N      | N        | N      | N       | N     |
| `vault:write:consented`      | N       | Y      | Y        | Y      | N       | N     |
| `vault:delete:own`           | Y       | N      | N        | N      | N       | N     |
| `consent:create`             | Y       | N      | N        | N      | N       | N     |
| `consent:read:own`           | Y       | Y      | Y        | Y      | N       | Y     |
| `consent:revoke:own`         | Y       | N      | N        | N      | N       | N     |
| `consent:emergency`          | N       | Y      | Y        | N      | N       | Y     |
| `timeline:read:own`          | Y       | N      | N        | N      | N       | N     |
| `timeline:read:consented`    | N       | Y      | Y        | Y      | N       | N     |
| `admin:users`                | N       | N      | N        | N      | N       | Y     |
| `admin:audit`                | N       | N      | N        | N      | Y       | Y     |
| `admin:system`               | N       | N      | N        | N      | N       | Y     |

### 5.3 Session Security

#### 5.3.1 Session Validation Pipeline

```
Request -> Session Token Extraction
         |
    Token Validation (JWT or opaque token)
         |
    Device Fingerprint Match?
    +-- Yes -> Continue
    +-- No  -> Flag anomaly, require re-auth
         |
    Geo-Location Check
    +-- Normal location -> Continue
    +-- New location (known device) -> Notify user, continue
    +-- New location (unknown device) -> Block, require OTP verification
         |
    Session Expiry Check
    +-- Valid -> Continue
    +-- Expired -> Return 401
         |
    Permission Check (RBAC)
    +-- Authorized -> Process request
    +-- Unauthorized -> Return 403
```

### 5.4 Geo-Anomaly Detection

```
interface GeoAnomalyConfig {
  checkEnabled: boolean;
  maxDistanceKm: number;         // 500km default
  timeWindowMinutes: number;     // 60 minutes default
  actionOnAnomaly: 'BLOCK' | 'NOTIFY' | 'REQUIRE_MFA' | 'LOG_ONLY';
  whitelistCountries: string[];
}

// Detection algorithm:
// 1. Compare request geo with last known location
// 2. Calculate distance between locations
// 3. Calculate time since last activity
// 4. If distance/time > speed threshold -> anomaly detected
```

### 5.5 Device Fingerprinting

Device fingerprints are bound to sessions. A mismatch triggers security verification. Components include screen resolution, platform, language, timezone, canvas hash, WebGL hash, audio hash, and user agent.

### 5.6 PII Masking

```
const PII_MASKS = {
  phone:    (v) => v.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2'),
  email:    (v) => v.replace(/(.{2}).+(@)/, '$1***$2'),
  aadhaar:  (v) => v.replace(/\d{4}(\d{4})\d{4}/, 'XXXX$1XXXX'),
  abhaNumber: (v) => v.replace(/(\d{2})-(\d{4})/, '$1-XXXX'),
  name:     (v) => v.length > 2 ? v[0] + '***' : v,
};
```

### 5.7 Audit Logging

Audit records stored in a separate `audit_logs` table (append-only). Table triggers prevent UPDATE/DELETE operations. Retention: 7 years (regulatory requirement). Database-level audit via PostgreSQL `pgaudit` extension for DDL/DML.

### 5.8 API Security Controls

| Control              | Implementation                       | Enforced At       |
|----------------------|--------------------------------------|-------------------|
| TLS 1.3              | API Gateway termination              | Gateway           |
| Rate Limiting        | Token bucket per endpoint            | Gateway + NestJS  |
| CORS                 | Whitelist origins                    | Gateway           |
| CSRF                 | Double-submit cookie pattern         | Gateway           |
| SQL Injection        | ORM (Prisma) parameterized queries   | Application       |
| XSS                  | Input sanitization + CSP headers     | Gateway + App     |
| Request Size Limit   | 50MB for uploads, 1MB for API        | Gateway           |
| Auth Token           | JWT (RS256) or opaque session        | Application       |
| HSTS                 | Strict-Transport-Security header     | Gateway           |

---

## 6. Consent Engine Architecture

### 6.1 ABDM-Compatible Consent Model

The consent engine implements the ABDM consent management framework. It is designed to be fully compatible with the ABDM consent artifact specification while also supporting WyshCare-native consent workflows.

```
+----------------------------------------------------------+
|                   CONSENT LIFECYCLE                      |
|                                                          |
|  +----------+   +----------+   +----------+   +--------+ |
|  |REQUESTED |-->| GRANTED  |-->| ACTIVE   |-->|EXPIRED | |
|  |          |   |          |   |          |   |REVOKED | |
|  +----------+   +----------+   +----------+   +--------+ |
|       |              |              |                     |
|       v              v              v                     |
|  +----------+   +----------+   +----------+               |
|  | DENIED   |   | EXPIRED  |   |SUSPENDED |               |
|  +----------+   +----------+   | (emerg.) |               |
|                                +----------+               |
+----------------------------------------------------------+
```

### 6.2 Consent Purpose Vocabulary

| Code       | Name                    | Description                          | Default Validity |
|------------|-------------------------|--------------------------------------|-----------------|
| `PATRQT`   | Patient Requested       | Access requested by patient for self | 30 days         |
| `CAREMGT`  | Care Management         | Treatment and care coordination      | 1 year          |
| `BTG`      | Break The Glass         | Emergency access                     | 4 hours         |
| `CLINICAL` | Clinical Trial          | Clinical research participation      | Per protocol    |
| `DSRCH`    | Disease Surveillance    | Public health monitoring             | 1 year          |
| `HPAY`     | Health Insurance Payment| Claims processing                    | 90 days         |
| `PUBHLTH`  | Public Health           | Government health programs           | 1 year          |
| `OPTOUT`   | Opt Out                 | Patient opts out of data sharing     | Indefinite      |

### 6.3 Consent Validation Algorithm

```
function validateConsent(artifact, request) -> ValidationResult:
  1. Status check: must be GRANTED
  2. Temporal validity: not before validFrom, not after validTo
  3. Date range check: dataDate within consented range
  4. HiType coverage: requested HiType in artifact.hiTypes
  5. Access mode: requested <= granted (hierarchy: VIEW < STORE < QUERY < STREAM)
  6. Provider match: requested providerId == artifact.providerId
  7. Signature verification: JWS signature validated
  Return valid=true if all pass, else valid=false with reason
```

### 6.4 ABDM Adapter Interfaces

```
interface AbhaAdapter {
  createAbha(params): Promise<AbhaProfile>;
  loginWithAbha(abhaAddress, otp): Promise<AuthToken>;
  getAbhaProfile(token): Promise<AbhaProfile>;
  linkAbhaToWyshId(wyshId, abhaAddress): Promise<LinkResult>;
  verifyAbhaOtp(sessionId, otp): Promise<VerifyResult>;
}

interface ConsentManagerAdapter {
  createConsentRequest(params): Promise<ConsentRequest>;
  fetchConsentArtifact(consentId): Promise<ConsentArtifact>;
  revokeConsent(consentId): Promise<RevokeResult>;
  notifyConsentStatus(consentId, status): Promise<void>;
  getConsentManagerStatus(): Promise<CMStatus>;
}

interface CareContextAdapter {
  createCareContext(params): Promise<CareContext>;
  discoverCareContexts(abhaAddress): Promise<CareContext[]>;
  linkCareContext(params): Promise<LinkResult>;
}

interface HealthInformationExchangeAdapter {
  pushData(params): Promise<PushResult>;
  pullData(consentId, hiTypes): Promise<PullResult>;
  getDataStatus(requestId): Promise<DataStatus>;
}

interface PatientDiscoveryAdapter {
  searchByAbha(abhaAddress): Promise<PatientMatch[]>;
  searchByDemographics(params): Promise<PatientMatch[]>;
}
```

### 6.5 Mock ABDM Implementations

Mock implementations provide in-memory ABHA profile storage, simulated OTP ("000000" accepted in dev), auto-approved consent requests, and sample care contexts.

```
// Environment-based adapter switching
// Mock:
{ provide: 'AbhaAdapter', useClass: MockAbhaAdapter }

// Production:
{ provide: 'AbhaAdapter', useClass: ProductionAbhaAdapter }

// Switch via env var: ABDM_ADAPTER=mock|production
```

---

## 7. Health Graph Architecture

### 7.1 Property Graph Model

The health graph uses a property graph model implemented as an adjacency list in PostgreSQL. Each node and edge has properties stored as JSONB.

```
Node Types: PATIENT, PROVIDER, FACILITY, CARE_EVENT, CONDITION, ALLERGY, MEDICATION, PROCEDURE, IMMUNIZATION, FAMILY_GROUP

Edge Types:
  PatientNode -[:HAS_CONDITION]-> CONDITION
  PatientNode -[:HAS_ALLERGY]-> ALLERGY
  PatientNode -[:UNDERGOES]-> PROCEDURE
  PatientNode -[:RECEIVED]-> IMMUNIZATION
  PatientNode -[:HAS_APPOINTMENT]-> CareEvent
  CareEvent -[:PRODUCED]-> Prescription
  Prescription -[:PRESCRIBED_BY]-> ProviderNode
  Prescription -[:INCLUDES_MEDICATION]-> MEDICATION
  PatientNode -[:MEMBER_OF]-> FamilyGroup
  FamilyGroup -[:HAS_MEMBER]-> PatientNode
  ProviderNode -[:REFERRED_TO]-> ProviderNode
  PatientNode -[:COVERED_BY]-> INSURANCE
  INSURANCE -[:FILED_CLAIM]-> CLAIM
```

### 7.2 Graph Query Patterns

```
-- Get all conditions for a patient
SELECT ce.target_id, ce.properties->>'name', ce.properties->>'icdCode',
       ce.properties->>'diagnosedAt', ce.properties->>'status'
FROM clinical_edges ce
WHERE ce.patient_id = 'WYSH-A3B8C9D2'
  AND ce.edge_type = 'HAS_CONDITION'
  AND ce.target_type = 'CONDITION'
ORDER BY ce.properties->>'diagnosedAt' DESC;

-- Get provider network
SELECT DISTINCT pn.wysh_id, pn.name, pn.speciality,
       COUNT(ce.id) AS visit_count, MAX(ce.created_at) AS last_visit
FROM clinical_edges ce
JOIN provider_nodes pn ON ce.provider_id = pn.wysh_id
WHERE ce.patient_id = 'WYSH-A3B8C9D2'
  AND ce.edge_type IN ('HAS_APPOINTMENT', 'PRESCRIBED_BY')
GROUP BY pn.wysh_id, pn.name, pn.speciality
ORDER BY last_visit DESC;
```

### 7.3 Graph Traversal Service

```
interface GraphTraversalService {
  getPatientGraph(patientId): Promise<PatientGraph>;
  getConditions(patientId): Promise<Condition[]>;
  getMedications(patientId): Promise<Medication[]>;
  getProviderHistory(patientId): Promise<ProviderHistory[]>;
  getFamilyHistory(patientId): Promise<FamilyHistory[]>;
  findPath(fromId, toId, maxDepth): Promise<GraphPath>;
  getGraphStats(patientId): Promise<GraphStatistics>;
}
```

### 7.4 Future Graph DB Migration

Assessment trigger: Graph queries exceeding 500ms P99 latency. Migration target: Apache Age (PostgreSQL extension) or ArangoDB. Strategy: Dual-write during transition period.

---

## 8. AI Health Memory Architecture

### 8.1 Timeline Engine

The timeline engine provides a unified, chronological view of all health events for a patient. It aggregates data from multiple modules into a single timeline that powers the AI health memory.

```
Entry Types: CONSULTATION, PRESCRIPTION, DIAGNOSTIC, HOSPITALIZATION,
  VACCINATION, ALLERGY, CONDITION, PROCEDURE, MEDICATION, NOTE,
  VITAL, SYMPTOM, GOAL, MEASUREMENT
```

### 8.2 Timeline Aggregation Queries

```
// Medication Timeline: Aggregates all medication events across prescriptions
// Returns structured view of each medication with history

// Condition Timeline: Tracks each condition's lifecycle
// diagnosis -> management -> resolution

// Doctor Interaction Timeline: Shows all provider interactions
// with frequency analysis

// Family History Timeline: Analyzes family graph for inherited conditions
```

### 8.3 AI Analysis Pipeline

```
1. Entry Classification
   - Auto-classify unstructured entries
   - Extract structured data from free text

2. Pattern Detection
   - Identify medication adherence patterns
   - Detect condition flare triggers
   - Recognize visit frequency anomalies

3. Risk Assessment
   - Compute condition progression risk
   - Identify drug interactions
   - Flag missing preventive care

4. Insight Generation
   - Summarize health trends
   - Generate adherence recommendations
   - Suggest provider follow-up timing

5. Timeline Enrichment
   - Link related entries
   - Fill knowledge gaps
   - Add AI-generated summaries
```

### 8.4 Timeline Cache Strategy

```
interface TimelineCache {
  recentEntries: Cache (last 30 days, TTL: 5 min)
  medicationTimeline: Cache (TTL: 15 min)
  conditionTimeline: Cache (TTL: 15 min)
  doctorTimeline: Cache (TTL: 15 min)
  timelinePages: Cache (TTL: 2 min)
}

Cache invalidation on: create, update, delete, manual refresh
```

---

## 9. MinIO Migration Plan

### 9.1 Current State

- Local filesystem uploads stored in `./uploads/` directory
- No encryption at rest, no versioning, no lifecycle policies
- Single point of failure

### 9.2 Target State

- All uploads stored in MinIO (dev) / S3 (prod)
- Server-side encryption (SSE-S3)
- Versioning enabled on all buckets
- Lifecycle policies for archival and deletion
- Pre-signed URLs for secure downloads

### 9.3 Docker Compose Configuration

```yaml
services:
  minio:
    image: minio/minio:latest
    container_name: wyshcare-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:-admin}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-minioadmin123}
      MINIO_DOMAIN: minio.wyshcare.local
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio-data:/data
    networks:
      - wyshcare-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

volumes:
  minio-data:
    driver: local
```

### 9.4 Bucket Structure

| Bucket Name          | Access       | Encryption | Versioning | Lifecycle                    |
|----------------------|--------------|------------|------------|------------------------------|
| `health-documents`   | Private      | SSE-S3     | Enabled    | 30-day retention after delete|
| `public-assets`      | Public-read  | None       | Disabled   | None                         |
| `temp-uploads`       | Private      | SSE-S3     | Disabled   | 24-hour auto-delete          |
| `backups`            | Private      | SSE-KMS    | Enabled    | 90-day retention             |
| `audit-logs`         | Private      | SSE-S3     | Enabled    | 7-year retention             |

### 9.5 StorageService Interface

```
interface IStorageService {
  uploadDocument(bucket, key, data, options?): Promise<UploadResult>;
  downloadDocument(bucket, key): Promise<DownloadResult>;
  getSignedUrl(bucket, key, expirySeconds): Promise<string>;
  deleteDocument(bucket, key): Promise<void>;
  copyDocument(sourceBucket, sourceKey, targetBucket, targetKey): Promise<CopyResult>;
  getDocumentVersions(bucket, key): Promise<DocumentVersion[]>;
  listDocuments(bucket, prefix): Promise<DocumentListItem[]>;
}
```

### 9.6 Rollback Plan

1. Keep local filesystem uploads active during migration (dual-write mode)
2. Migration script can be re-run (idempotent via `isMigrated` flag)
3. If MinIO fails, fallback to local storage via configuration switch
4. MinIO health check pings every 30 seconds

---

## 10. Testing Strategy

### 10.1 Coverage Targets

| Layer              | Target   | Critical Paths                              |
|--------------------|----------|---------------------------------------------|
| Unit (services)    | 90%+     | Encryption, consent validation, graph       |
| Unit (guards)      | 95%+     | RBAC, geo-anomaly, rate limiting            |
| Integration        | 85%+     | All controller endpoints                    |
| E2E                | 80%+     | Full user journeys                          |
| Security           | 100%     | Auth bypass, injection, CSRF, rate limiting |
| Load               | P99<500ms| Critical API paths                          |

### 10.2 Test Structure

```
backend/
+-- tests/
    +-- unit/modules/   (identity, consent, vault, timeline, ...)
    |   +-- unit/common/ (encryption, security, audit)
    |   +-- unit/providers/ (storage)
    +-- integration/controllers/ (identity, consent, vault, ...)
    +-- integration/services/
    +-- e2e/ (auth-flow, consent-flow, document-upload-flow, ...)
    +-- security/ (auth-bypass, injection, rate-limit, pii-exposure)
    +-- load/k6/ (identity-api, consent-api, timeline-api, document-api)
    +-- fixtures/ (samples: consent-artifact, health-document, timeline-entries)
    +-- fixtures/mocks/ (abdm-responses, minio-responses)
```

---

## 11. 90-Day Execution Roadmap

### Sprint 1-2 (Days 1-14): Foundation

| Task                          | Deliverables                                        |
|-------------------------------|-----------------------------------------------------|
| WyshID generation service     | ID generation, format validation, uniqueness checks |
| User model redesign           | Updated Prisma schema, migrations                   |
| Encryption service            | AES-256-GCM, key hierarchy, field-level encryption  |
| MinIO setup                   | Docker Compose, bucket creation, IAM policies       |
| StorageService redesign       | MinIO SDK integration, interface abstraction        |
| Audit logging enhancement     | Immutable audit trail, decorator, append-only table |
| Environment config            | V1.5 env vars, validation                           |

### Sprint 3-4 (Days 15-28): Core Services

| Task                          | Deliverables                                        |
|-------------------------------|-----------------------------------------------------|
| Consent engine                | Consent model, lifecycle, validation, JWS signing   |
| Health graph models           | PatientNode, ProviderNode, FamilyEdge, ClinicalEdge |
| Timeline engine               | HealthTimelineEntry, aggregation queries, caching   |
| Vault encryption              | Document encryption/decryption, DEK management      |
| Consent API implementation    | Grant, revoke, list, emergency access endpoints     |
| Family graph implementation   | Family management, edge operations                  |

### Sprint 5-6 (Days 29-42): API Layer

| Task                          | Deliverables                                        |
|-------------------------------|-----------------------------------------------------|
| All new REST APIs             | Complete API implementation per Section 4           |
| ABDM adapter interfaces       | 5 adapter interfaces with mock implementations      |
| Interoperability module       | ABDM linking, status, data sync                     |
| Search infrastructure         | Full-text search, indexing, relevance ranking       |
| API documentation             | OpenAPI/Swagger specs                               |
| Rate limiting implementation  | Per-endpoint rate limit guards                      |

### Sprint 7-8 (Days 43-56): Integration

| Task                          | Deliverables                                        |
|-------------------------------|-----------------------------------------------------|
| Frontend updates              | New UI for V1.5 features (consent, vault, timeline) |
| E2E flow testing              | Full user journey tests                             |
| Security review               | Penetration testing, vulnerability assessment       |
| Performance optimization      | Query optimization, caching, N+1 fixes              |
| Error handling & validation   | Comprehensive error responses, input validation     |

### Sprint 9-10 (Days 57-70): Hardening

| Task                          | Deliverables                                        |
|-------------------------------|-----------------------------------------------------|
| Load testing                  | k6 scripts, performance baselines, tuning           |
| Documentation                 | Architecture docs, deployment guide, runbooks       |
| Deployment pipeline           | CI/CD updates, blue-green deployment                |
| Monitoring setup              | OpenTelemetry, Prometheus, Grafana dashboards       |
| Backup & disaster recovery    | Backup strategy, recovery testing                   |

### Sprint 11-12 (Days 71-84): Launch

| Task                          | Deliverables                                        |
|-------------------------------|-----------------------------------------------------|
| Production deployment         | Canary release, rollback plan                       |
| ABDM sandbox testing          | End-to-end ABDM integration tests                   |
| Go-live                       | Production release, monitoring, incident response   |
| Post-launch stabilization     | Bug fixes, performance tuning, monitoring review    |

---

## 12. Implementation Sequence

### Step 1: Schema Changes (`prisma/schema.prisma`)

Add all new models: WyshIdentity, IdentityAudit, PatientNode, ProviderNode, FamilyEdge, CareEvent, ClinicalEdge, ConsentPurpose, ConsentArtifact, ConsentGrant, ConsentAudit, DocumentCategory, HealthDocument, DocumentVersion, DocumentShare, HealthTimelineEntry, TimelineAggregate.

Run `npx prisma migrate dev --name v15_architecture`.

### Step 2: Environment Configuration (`src/config/env.ts`)

| Variable                          | Description                       | Default                         |
|-----------------------------------|-----------------------------------|---------------------------------|
| `ENCRYPTION_MASTER_KEY`          | Master key ID/path                | (required)                      |
| `ENCRYPTION_KEK`                 | Key encryption key                | (generated on first run)        |
| `MINIO_ENDPOINT`                 | MinIO server endpoint             | `localhost`                     |
| `MINIO_PORT`                     | MinIO API port                    | `9000`                          |
| `MINIO_ACCESS_KEY`               | MinIO access key                  | `admin`                         |
| `MINIO_SECRET_KEY`               | MinIO secret key                  | `minioadmin123`                 |
| `MINIO_USE_SSL`                  | Use SSL for MinIO                 | `false`                         |
| `ABDM_ADAPTER`                   | ABDM adapter type                 | `mock`                          |
| `ABDM_SANDBOX_URL`              | ABDM sandbox base URL             | `https://sandbox.abdm.gov.in`  |
| `CONSENT_EXPIRY_CHECK_CRON`     | Cron for consent expiry checks    | `0 */6 * * *`                  |
| `KEY_ROTATION_CRON`             | Cron for KEK rotation             | `0 0 1 */3 *`                 |
| `AUDIT_RETENTION_DAYS`          | Audit log retention               | `2555` (7 years)                |

### Step 3: Encryption Module (`src/common/encryption/`)

Create:
- `encryption.service.ts` - Core encryption/decryption operations
- `field-encryption.decorator.ts` - `@Encrypted()` decorator for Prisma fields
- `key-management.service.ts` - Key hierarchy and rotation
- `key-rotation.service.ts` - Scheduled rotation via cron

### Step 4: MinIO Storage (`src/providers/storage/`)

Create:
- `storage.service.ts` - MinIO SDK wrapper implementing `IStorageService`
- `storage.module.ts` - Module registration
- `interfaces/storage.interface.ts` - Interface definition

### Step 5: Identity Module Rewrite (`src/modules/identity/`)

Rewrite identity service with WyshID generation, verification, and the new endpoints.

### Step 6: Consent Engine (`src/modules/consent/`)

Create consent service with full lifecycle, validation algorithm, emergency access protocol, and ABDM adapters.

### Step 7: Timeline Engine (`src/modules/timeline/`)

Create timeline service with CRUD operations and aggregation queries for medications, conditions, doctors, and family history.

### Step 8: Encrypted Vault (`src/modules/vault/`)

Create vault service with document upload/download, envelope encryption, versioning, and sharing.

### Step 9: ABDM Adapters (`src/common/abdm/`)

Create all 5 adapter interfaces with mock implementations and production stubs.

### Step 10: Interoperability Module (`src/modules/interoperability/`)

Create ABDM workflows, link/status endpoints, and production adapter wrappers.

### Step 11: Docker Compose Update

Add MinIO service to docker-compose.yml.

### Step 12: Environment Updates

Add V1.5 environment variables to `backend/.env` and `.env.example`.

---

## Appendix A: Architecture Decision Records

### ADR-001: Modular Monolith over Microservices

**Context:** The platform needs to support rapid feature development while maintaining architectural integrity.

**Decision:** Use a modular monolith with strict module boundaries and dependency rules. Extract to microservices only when user base exceeds 100,000 or DAU exceeds 10,000.

**Consequences:**
- Faster development velocity initially
- Lower operational complexity
- Event bus enables future service extraction
- Module boundaries must be strictly enforced

### ADR-002: Adjacency List over Graph DB

**Context:** Health graph needs to represent complex healthcare relationships.

**Decision:** Use adjacency list pattern in PostgreSQL with JSONB properties instead of a dedicated graph database.

**Consequences:**
- No additional infrastructure
- Familiar PostgreSQL tooling
- Potential performance issues at scale (mitigated by future migration plan)
- Graph queries less performant than native graph DB

### ADR-003: Envelope Encryption for Documents

**Context:** Health documents need strong encryption with key rotation capability.

**Decision:** Use envelope encryption with per-document DEKs wrapped by a KEK.

**Consequences:**
- Each document has unique encryption key
- KEK rotation does not require document re-encryption
- Slightly higher overhead per upload/download
- Key versioning enables secure rotation

### ADR-004: ABDM Adapter Pattern

**Context:** ABDM integration requires flexible switching between sandbox and production.

**Decision:** Use adapter interfaces with dependency injection for mock/production switching.

**Consequences:**
- Clean separation of concerns
- Easy testing with mock implementations
- No production code changes when ABDM APIs become available
- Additional abstraction layer

---

*End of Document*
