# ADR-002: Supabase as the Backend Platform

**Status:** Accepted  
**Date:** 2026-06-12  
**Deciders:** Vimarshak Prudhvi  
**Tags:** infrastructure, database, supabase, postgresql

---

## Context

WyshCare needs a backend platform that provides:
- Relational database for 120+ models with complex clinical relationships
- Row-level security for multi-tenant healthcare data isolation
- File storage for medical documents, reports, and images
- Real-time updates for telemedicine, notifications, and clinical workflows
- Serverless compute for webhooks and light processing
- Built-in authentication (covered in ADR-001)

## Decision Drivers

- **Healthcare compliance:** Need audit trails, encryption at rest, access control at database level
- **Schema complexity:** 120+ models, 47 enums, deep relations (polymorphic joins, self-referencing)
- **Multi-tenancy:** Tenant isolation via `tenantId` on key models, enforced by RLS
- **Team size:** Small team — need managed services to reduce operational burden
- **Realtime needs:** Chat, telemedicine status updates, queue management

## Considered Options

| Option | Pros | Cons |
|--------|------|------|
| **Supabase** | PostgreSQL + RLS + Storage + Realtime + Edge Functions; unified SDK; generous free tier | Vendor lock-in on auth; edge functions limited vs full serverless |
| **AWS (RDS + S3 + Cognito + AppSync)** | Full control; broad ecosystem | Operational overhead; complex IAM; expensive for early stage |
| **GCP (Cloud SQL + Firebase)** | Good for analytics; Firebase simple for mobile | Less healthcare-specific tooling; Cloud SQL HA costs |
| **Custom Stack (Node + PostgreSQL + MinIO + Redis)** | Zero vendor lock-in | All infrastructure must be built and maintained; higher DevOps burden |
| **MongoDB Atlas + AWS S3** | Schema flexibility | No RLS; no built-in realtime; document model struggles with clinical relations |

## Decision

**Use Supabase** as the managed backend platform, with the NestJS backend as the application layer.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NestJS Backend                             │
│  (REST + GraphQL, business logic, validation, orchestration) │
└────┬────────┬────────┬──────────┬───────────┬───────────────┘
     │        │        │          │           │
     ▼        ▼        ▼          ▼           ▼
┌─────────┐ ┌────────┐ ┌────────┐ ┌─────────┐ ┌─────────────┐
│PostgreSQL│ │Storage │ │Realtime│ │Edge Fn  │ │ Auth (GoTrue)│
│ (Prisma) │ │(S3 API)│ │(WebSocket)│ │(Deno) │ │             │
└─────────┘ └────────┘ └────────┘ └─────────┘ └─────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  Supabase Platform (Managed PostgreSQL + APIs)               │
└─────────────────────────────────────────────────────────────┘
```

### PostgreSQL & Prisma

- All 120+ models defined in `backend/prisma/schema.prisma`
- Prisma Client as the ORM layer in NestJS
- 47 enums for type safety (roles, statuses, consent states, etc.)
- 15+ Supabase migration files managing schema evolution
- `SUPABASE_SCHEMA.md` documents the full schema mapping

### Row Level Security (RLS)

RLS is the linchpin of data isolation:

```sql
-- Example: Patient data RLS
CREATE POLICY "Patients can view own records"
  ON health_records FOR SELECT
  USING (patient_user_id = auth.uid());

-- Example: Tenant isolation
CREATE POLICY "Tenant data isolation"
  ON appointments FOR ALL
  USING (tenant_id = current_setting('app.tenant_id')::text);
```

- All business tables have RLS policies
- `tenantId` column on multi-tenant models triggers organization-level isolation
- `patientUserId` / `userId` columns enable patient-level access
- Emergency access bypass via `EmergencyAccess` model with audit trail

### Storage

8 storage buckets for different document types:
- `health-records`, `prescriptions`, `consultation-recordings`
- `clinical-documents`, `lab-reports`, `insurance-documents`
- `profile-images`, `provider-documents`

- Backend controls access via signed URLs with expiration
- Row-level security on storage objects mirrors database RLS
- Encrypted at rest (SSE-S3)

### Realtime

- Used for: telemedicine chat, appointment queue updates, notification delivery
- Backend publishes to Realtime channels via Supabase SDK
- Frontend subscribes to channels for live updates
- Powering `ConsultationSession` chat transcripts and `QueueEntry` status

### Edge Functions

- Lightweight Deno-based functions for:
  - Webhook receivers (Razorpay, ABDM, NHCX)
  - Simple data transforms
  - Health check endpoints
- Complex business logic stays in NestJS

## Consequences

**Positive:**
- 80% reduction in infrastructure management vs AWS/GCP
- RLS provides defense-in-depth — even if app layer is compromised, database remains protected
- Realtime built-in removes need for separate WebSocket server (e.g., Socket.io)
- Storage with S3-compatible API avoids vendor lock-in
- Same PostgreSQL ecosystem supports PostGIS (for clinic geolocation) and pgvector (for AI embeddings)
- Cost-effective: free tier handles prototyping; scales to production with minimal migration

**Negative:**
- Edge Functions limited to Deno runtime (no Node.js npm ecosystem)
- Supabase Realtime has message size limits (2KB default, 256KB max)
- Vendor lock-in on Auth (mitigated by custom auth module)
- Supabase managed Postgres has some feature gaps compared to RDS (e.g., limited extensions)
- Cannot easily replicate Supabase-managed infrastructure in air-gapped deployments

**Mitigations:**
- Core data is plain PostgreSQL — can migrate to any Postgres provider
- Prisma ORM abstracts database access — ORM-level switch possible
- Storage uses S3-compatible API — portable to MinIO, AWS S3, or GCS
