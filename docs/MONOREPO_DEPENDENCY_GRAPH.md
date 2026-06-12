# Monorepo Dependency Graph

## Repository Layout

```
wyshcare/
├── backend/          # NestJS backend (REST + GraphQL)
├── frontend/         # Next.js web app
├── shared/           # @wyshcare/shared package
├── apps/
│   ├── doctor-mobile/   # Flutter doctor mobile app
│   └── patient-mobile/  # Flutter patient mobile app
├── supabase_migrations/  # Supabase/PostgreSQL migrations
├── infra/            # Infrastructure (Docker, K8s)
└── scripts/          # Utility scripts
```

## Package Dependencies

### `shared/` (@wyshcare/shared)

| Dependency | Type | Source |
|---|---|---|
| zod | runtime | npm |

**Depended upon by:** `frontend/`

### `backend/`

| Dependency | Type | Source |
|---|---|---|
| @nestjs/common, core, etc. | runtime | npm |
| @prisma/client, prisma | runtime | npm |
| @nestjs/graphql, @nestjs/apollo | runtime | npm |
| @aws-sdk/client-s3 | runtime | npm |
| ioredis | runtime | npm |
| @google/generative-ai | runtime | npm |
| livekit-server-sdk | runtime | npm |
| razorpay | runtime | npm |
| @golevelup/nestjs-rabbitmq | runtime | npm |
| @sentry/node | runtime | npm |
| helmet, cors | runtime | npm |
| argon2, bcryptjs | runtime | npm |
| ... | | |

**Inter-package dependency:** None (backend does NOT depend on shared or frontend)

**Depended upon by:** Nothing (backend is standalone)

### `frontend/` (Next.js)

| Dependency | Type | Source |
|---|---|---|
| next | runtime | npm |
| react, react-dom | runtime | npm |
| @tanstack/react-query | runtime | npm |
| @radix-ui/react-* | runtime | npm |
| framer-motion | runtime | npm |
| zustand | runtime | npm |
| tailwindcss | dev | npm |
| **@wyshcare/shared** | **runtime** | **../shared** (file reference) |

**Inter-package dependency:** ✅ Depends on `shared/` (`@wyshcare/shared: file:../shared`)

**Depended upon by:** Nothing

### `apps/doctor-mobile/` (Flutter)

| Dependency | Type | Source |
|---|---|---|
| flutter | runtime | Flutter SDK |
| Various pub packages | runtime | pub.dev |

**Inter-package dependency:** None (no direct dependency on `shared/` or `backend/`)

**Depended upon by:** Nothing

### `apps/patient-mobile/` (Flutter)

| Dependency | Type | Source |
|---|---|---|
| flutter | runtime | Flutter SDK |
| Various pub packages | runtime | pub.dev |

**Inter-package dependency:** None

**Depended upon by:** Nothing

## Dependency Graph (Visual)

```
┌──────────┐
│  shared  │ ◄──────┐
└──────────┘        │
                    │
┌──────────┐       │
│ backend  │       │  (file:../shared)
└──────────┘       │
                    │
┌──────────┐       │
│ frontend │ ──────┘
└──────────┘

┌────────────────┐
│ doctor-mobile  │  (isolated)
└────────────────┘

┌─────────────────┐
│ patient-mobile  │  (isolated)
└─────────────────┘
```

## Circular Dependencies

**None found.** The dependency graph is a simple DAG:
- `shared/` has zero internal dependencies
- `frontend/` depends on `shared/`
- `backend/`, `doctor-mobile/`, `patient-mobile/` are standalone

## Dead / Orphan Modules

All modules listed in `backend/src/app.module.ts` are actively imported. No orphan modules were found. All registered modules:

| Module | Registered | Has Controller |
|---|---|---|
| PrismaModule | ✅ | N/A (provider) |
| EncryptionModule | ✅ | N/A |
| RedisModule | ✅ | N/A |
| StorageModule | ✅ | N/A |
| EventsModule | ✅ | N/A |
| EventsConsumerModule | ✅ | N/A |
| RabbitMQModule | ✅ | N/A |
| ObservabilityModule | ✅ | N/A |
| LivekitModule | ✅ | N/A |
| RazorpayModule | ✅ | N/A |
| GeminiModule | ✅ | N/A |
| AiProviderModule | ✅ | N/A |
| AiOrchestratorModule | ✅ | N/A |
| JobsModule | ✅ | N/A |
| AuthModule | ✅ | ✅ (3 controllers) |
| IdentityModule | ✅ | ✅ |
| ConsentModule | ✅ | ✅ |
| VaultModule | ✅ | ✅ |
| AiModule | ✅ | ✅ |
| DoctorsModule | ✅ | ✅ |
| DiscoveryModule | ✅ | ✅ |
| TelemedicineModule | ✅ | ✅ |
| PaymentsModule | ✅ | ✅ |
| PharmacyModule | ✅ | ✅ |
| DiagnosticsModule | ✅ | ✅ |
| AdminModule | ✅ | ✅ |
| NotificationsModule | ✅ | ✅ |
| TimelineModule | ✅ | ✅ |
| InteroperabilityModule | ✅ | ✅ |
| FamilyModule | ✅ | ✅ |
| DashboardModule | ✅ | ✅ |
| EhrModule | ✅ | ✅ |
| HealthGraphV2Module | ✅ | ✅ |
| DigitalTwinModule | ✅ | ✅ |
| PrescriptionModule | ✅ | ✅ |
| HealthTwinModule | ✅ | ✅ |
| WyshModule | ✅ | ✅ |
| InsuranceModule | ✅ | ✅ |
| CarePlansModule | ✅ | ✅ |
| AbdmModule | ✅ | ✅ |
| NHCXModule | ✅ | ✅ |
| ProviderGraphModule | ✅ | ✅ |
| SearchModule | ✅ | ✅ |
| StaffModule | ✅ | ✅ |
| WorkspaceModule | ✅ | ✅ |
| ClinicAdminModule | ✅ | ✅ |
| ClinicBillingModule | ✅ | ✅ |
| ClinicReceptionModule | ✅ | ✅ |
| ClinicalTwinModule | ✅ | ✅ |
| HealthGraphModule | ✅ | ✅ |
| QueueMonitorModule | ✅ | ✅ |
| GoalsModule | ✅ | ✅ |
| HealthScoreModule | ✅ | ✅ |
| EmergencyModule | ✅ | ✅ |
| AIRiskModule | ✅ | ✅ |
| AiLifestyleModule | ✅ | ✅ |
| AiPreventiveModule | ✅ | ✅ |
| AnalyticsModule | ✅ | ✅ |
| SpecialtiesModule | ✅ | ✅ (includes sub-modules) |
| ClinicBrandingModule | ✅ | ✅ |

### Modules with Controllers but No Direct REST (providers only — OK)

| Module | Purpose |
|---|---|
| PrismaModule | Database ORM |
| RedisModule | Caching |
| StorageModule | S3 file storage |
| EventsModule / EventsConsumerModule | Event bus |
| RabbitMQModule | Message queue |
| GeminiModule | AI provider |
| AiProviderModule | AI abstraction |
| AiOrchestratorModule | AI routing |
| JobsModule | Background jobs |
| ObservabilityModule | OpenTelemetry/Sentry |
| LivekitModule | Video/audio calls |
| RazorpayModule | Payment gateway |

## Recommendations

### Issues Found

1. **No TypeScript path aliases** between packages — `frontend` uses `file:../shared` in package.json but the monorepo has no `tsconfig.json` paths configured at root level.
2. **Mobile apps are fully isolated** — doctor-mobile and patient-mobile duplicate API client code. Consider a `shared/api-client` or shared Flutter package.
3. **Backend does not use `shared/`** — Types like `Role` are imported directly from `@prisma/client` in backend but from `@wyshcare/shared` in frontend. This creates type drift risk.
4. **No root workspace config** — No `package.json` workspace configuration; each package is managed independently.

### Action Items

1. ✅ Create root-level workspace config (npm workspaces or pnpm)
2. 🔄 Move shared TypeScript types (Role, enums, DTO interfaces) from backend to `shared/`
3. 🔄 Create a shared Flutter package for API client code consumed by both mobile apps
4. 🔄 Add `tsconfig.paths` at root to enable cross-package imports in development
5. ✅ Audit complete — no orphan modules found
