# Code Quality Report — WyshCare

**Generated:** 2026-06-12
**Methodology:** Static analysis of 893 source files

---

## Overall Code Quality Grade: **C+ (67/100)**

| Dimension | Grade | Score | Key Findings |
|-----------|-------|-------|-------------|
| Readability | B- | 70 | Clear naming, but massive repetitive boilerplate headers |
| Maintainability | C | 60 | 15+ files with duplicated CSS constants, 42x randomUUID import |
| Testability | D | 35 | 25 tests for 893 source files (2.8% coverage) |
| Complexity | C+ | 65 | Some 700+ line services, but generally simple CRUD |
| Technical Debt | C | 55 | Dead code, backup files, duplicate components |
| Consistency | C+ | 65 | Uniform naming but inconsistent patterns across modules |
| Performance | B- | 72 | Prisma indexes good, but no query profiling |
| Documentation | C | 60 | Massive headers but no method-level docs |

---

## Section 1: Complexity Analysis

### High-Complexity Files

| File | Lines | Risk | Why |
|------|-------|------|-----|
| `frontend/src/lib/api-client.ts` | 956 | High | Single monolithic object with ~100 methods |
| `frontend/src/app/design/page.tsx` | 1256 | High | Massive design system page — should be split |
| `frontend/src/app/os/doctor/page.tsx` | 977 | High | Single page with everything |
| `frontend/src/components/app/ai-copilot-sidebar.tsx` | 773 | High | 4 identical Record<string,...> mapping blocks, 15 case statements |
| `backend/src/modules/health-graph/health-graph.service.ts` | 712 | Medium | BFS + AI + risk assessment in one service |
| `backend/src/modules/insurance/insurance.service.ts` | 700 | Medium | All insurance logic in one file |

### Cyclomatic Complexity
- **Low** (< 10 per function): ~80% of functions
- **Medium** (10-20): ~15% of functions
- **High** (> 20): ~5% (AI copilot sidebar case statements, API client method count)

---

## Section 2: Duplicate Code Analysis

### CSS/Tailwind Constant Duplication
The string `'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl'` appears verbatim in **15+ files**:

| File | Line |
|------|------|
| `frontend/src/app/doctor/emr/page.tsx` | 89 |
| `frontend/src/app/doctor/emr/dermatology/page.tsx` | 77 |
| `frontend/src/app/doctor/emr/psychiatry/page.tsx` | 77 |
| `frontend/src/app/doctor/billing/page.tsx` | 67 |
| `frontend/src/app/doctor/messages/page.tsx` | 67 |
| `frontend/src/app/(platform)/app/prescriptions/page.tsx` | 70 |
| `frontend/src/app/(platform)/app/insurance/page.tsx` | 76 |
| `frontend/src/app/(platform)/app/wallet/page.tsx` | 69 |
| `frontend/src/app/(platform)/app/diagnostics/page.tsx` | 73 |
| `frontend/src/app/clinic/branding/page.tsx` | 66 |
| `frontend/src/app/os/doctor/page.tsx` | 110 |
| `frontend/src/features/specialties/components/specialty-form-renderer.tsx` | 65 |

### Duplicate Components
| Component | First Copy | Second Copy |
|-----------|------------|-------------|
| Button | `components/ui/button.tsx` | `components/button.tsx` |
| Card | `components/ui/card.tsx` | `components/card.tsx` |
| Skeleton | `components/ui/skeleton.tsx` | `components/skeleton.tsx` |

### Backup File Pollution
7 backup/backup files for `prescription.service.ts`:
```
prescription.service.ts.backup2
prescription.service.ts.backup3
prescription.service.ts.backup4
prescription.service.ts.backup_before_fix
prescription.service.ts.bak2
prescription.service.ts.current_backup
prescription.service.ts.pre_remaining_fix
```

---

## Section 3: Technical Debt

### Dead Code
| Item | Location | Impact |
|------|----------|--------|
| 7 backup `.backup`/`.bak` files | `backend/src/modules/prescription/` | Low — clutter |
| Mock data in production source | `frontend/src/data/mock-patients.ts` | Medium — deployable mock risk |
| Duplicate components | `components/` vs `components/ui/` | Low — confusion risk |
| Empty `deinit {}` blocks | 10+ iOS Swift files | Low — harmless |
| Unused SDK reference | `apps/patient-mobile/lib/core/network/sdk_provider.dart` imports `wyshcare_patient_sdk` (deleted) | High — build error |

### Unused Dependencies
| Package | Location | Evidence |
|---------|----------|----------|
| `@nestjs/graphql` + `@nestjs/apollo` | `backend/package.json` | GraphQL resolvers exist (`health-graph.resolver.ts`) but no GraphQL playground or queries in frontend |
| `@nestjs/websockets` + `@nestjs/platform-socket.io` | `backend/package.json` | Gateway exists (`notifications.gateway.ts`) but no client connects |
| `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` | `backend/package.json` | Storage module exists but S3 bucket is not configured |
| `livekit-server-sdk` | `backend/package.json` | LiveKit service exists but no rooms are created |
| `@opentelemetry/api` | `backend/package.json` | Collector configured but no spans in services |

### Missing Error Handling
- `apps/patient-mobile/lib/core/network/sdk_provider.dart` — imports `wyshcare_patient_sdk` which was deleted (build-breaking)
- `frontend/src/middleware.ts` — basic auth check but no error page for auth failures
- Many API calls use `.catch(console.error)` pattern in hooks — swallows errors

---

## Section 4: Test Coverage

| Layer | Test Files | Lines of Code | Coverage (est.) |
|-------|-----------|---------------|-----------------|
| Backend unit tests | 4 | 893 backend source | < 1% |
| Backend e2e tests | 11 | ~5,000 | ~15% of endpoints |
| Backend smoke tests | 9 | ~500 | N/A |
| Frontend tests | 0 | ~7,200 frontend source | 0% |
| iOS tests | 0 | ~5,000 Swift source | 0% |
| Flutter tests | 0 | ~4,000 Dart source | 0% |

### Test Quality Issues
- e2e tests use hardcoded IDs and rely on specific database state
- `prescription.e2e-spec.ts` (727 lines) is the largest test file — tests many edge cases
- No test fixtures or factories — each test creates its own data inline
- No CI test execution verified — workflow files exist but may not pass

---

## Section 5: Dependency Analysis

### Backend (44 prod + 17 dev = 61 total)
- Frameworks: NestJS, Express, Socket.IO, GraphQL
- Database: Prisma, ioredis
- AI: `@google/generative-ai`
- Payments: razorpay
- Video: livekit-server-sdk
- Monitoring: @sentry/node, nestjs-pino, @opentelemetry/api
- Security: helmet, cookie-parser, bcryptjs, argon2, passport, jsonwebtoken
- Validation: class-validator, class-transformer, zod

### Frontend (21 prod + 14 dev = 35 total)
- Framework: Next.js, React, TypeScript
- UI: TailwindCSS, lucide-react, framer-motion
- State: zustand, @tanstack/react-query
- Utilities: clsx, tailwind-merge, date-fns, uuid

### Red Flags
- No TypeScript strict mode in `frontend/tsconfig.json`
- No ESLint plugin for React Hooks
- zod (validation) in shared package but not used by backend DTOs
- Both `bcryptjs` and `argon2` installed — only one needed

---

## Score Summary

```
Readability         ███████░░░  70/100  (B-)
Maintainability     ██████░░░░  60/100  (C)
Testability         ███░░░░░░░  35/100  (D)
Complexity          ██████░░░░  65/100  (C+)
Technical Debt      █████░░░░░  55/100  (C)
Consistency         ██████░░░░  65/100  (C+)
Performance         ███████░░░  72/100  (B-)
Documentation       ██████░░░░  60/100  (C)
────────────────────────────────────────
Overall             ██████░░░░  67/100  (C+)
```
