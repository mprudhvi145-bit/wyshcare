# Architecture Audit — WyshCare

**Generated:** 2026-06-12
**Scope:** Full-stack forensic architecture review

---

## Architecture Maturity Score: **62/100**

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Separation of concerns | 75 | Clear module boundaries in backend; mixed in frontend |
| Layering | 70 | API → Service → Repository pattern holds, but no formal interface layer |
| Dependency management | 55 | Cyclic import risks; no enforced boundaries between modules |
| Scalability | 60 | Stateless services, but no horizontal scaling primitives implemented |
| Resilience | 40 | No circuit breakers, retry policies, or bulkheads outside RabbitMQ |
| Observability | 45 | Sentry + Pino configured but no structured logging in most services |
| Security architecture | 65 | JWT guards on controllers, RLS in schema, but inconsistent enforcement |
| Testability | 35 | 25 tests for 893 source files (2.8% coverage) |
| Extensibility | 70 | Specialty plugin system, AI provider factory, modular NestJS |
| Documentation completeness | 60 | ADRs exist, but implementation doesn't always match documented decisions |

---

## Frontend Architecture

**Stack:** Next.js 14 (App Router) + React + TypeScript + TailwindCSS + Zustand + TanStack Query

**Strengths:**
- App Router with route groups (`(auth)`, `(platform)`, `doctor/`, `clinic/`, `os/`, `admin/`, `insurance/`)
- Modular store pattern (Zustand) with persist middleware for session
- TanStack Query hooks layer abstracts API calls cleanly
- 23 reusable UI components in `components/ui/`
- Middleware (`middleware.ts`) handles auth redirects at edge

**Weaknesses:**
- **No component library standardization**: `Button`, `Card`, `Skeleton` duplicated across `components/` and `components/ui/`
- **CSS constant duplication**: `glassCard` string redefined in 15+ files verbatim (`frontend/src/app/doctor/emr/page.tsx:89`, `frontend/src/app/os/doctor/page.tsx:110`)
- **956-line API client** (`lib/api-client.ts`) with ~100 methods in a single object — should be split by domain
- **Massive page files**: `app/design/page.tsx` (1256 lines), `app/os/doctor/page.tsx` (977 lines)
- **No unit tests**: 0 test files in frontend/
- **No Storybook or component documentation**
- **Hardcoded mock data** in production source files (`mock-patients.ts`, inline mock arrays in pages)

---

## Backend Architecture

**Stack:** NestJS + TypeScript + Prisma + GraphQL (Apollo) + REST + RabbitMQ + Redis + JWT

**Strengths:**
- 46 domain modules with clean NestJS module structure
- Provider layer for cross-cutting concerns (AI, Events, Jobs, Storage, etc.)
- Multi-provider AI orchestration (Gemini, OpenAI, OpenRouter, NVIDIA NIM, Ollama)
- Comprehensive Prisma schema (126 models, 63 enums)
- Proper dependency injection via NestJS DI
- Event-driven architecture via `@nestjs/event-emitter` + RabbitMQ

**Weaknesses:**
- **No swagger/OpenAPI documentation generated** despite `@nestjs/swagger` being installed
- **63+ controllers all follow identical CRUD pattern** — suggests generation, not intentional design
- **`crypto.randomUUID` imported in 42 files** — should be a shared utility
- **No rate limiting actually implemented** despite `@nestjs/throttler` dependency (no ThrottlerGuard on any controller)
- **No API versioning strategy visible** — all routes under bare `/api/v1` with no version negotiation
- **HealthGraph service (712 lines) is over-engineered** — BFS graph traversal, AI query, risk assessment all in one service
- **No database migration tests or validation**
- **No feature flags** — all code paths are always active

---

## Authentication Architecture

**Flow:** Supabase Auth → JWT → Passport JWT Strategy → NestJS Guards → RLS

**Strengths:**
- JWT-based with Passport strategy
- Bearer token on all protected routes
- Supabase RLS for database-level auth
- Auth middleware on frontend routes

**Weaknesses:**
- No refresh token rotation visible
- No MFA support
- No session management dashboard
- No brute-force protection on login endpoints
- No OAuth2/Social login actually wired (Google login in iOS is `Task.sleep` mock)
- Auth service test (`auth.service.spec.ts`) exists but is one of only 4 unit tests

---

## AI Architecture

**Strengths:**
- Clean `AiOrchestratorService` with provider abstraction
- 4 working AI providers (Gemini, OpenAI, OpenRouter, NVIDIA NIM, Ollama)
- Provider factory pattern allows runtime switching
- Fallback chain: Gemini → OpenRouter → NVIDIA NIM → Ollama
- Prompt templating system via config
- Response caching via Redis

**Weaknesses:**
- All AI tests are smoke tests only (`ai.smoke.test.js`)
- No prompt versioning
- No AI response validation/schema enforcement
- No cost tracking per provider
- No latency monitoring per provider
- No A/B testing framework for AI models

---

## Integration Architecture

| Integration | Status | Assessment |
|-------------|--------|------------|
| Supabase Auth | Configured | Functional but no MFA |
| Razorpay | SDK installed | No checkout flow complete |
| LiveKit | SDK installed | Telemedicine rooms not wired |
| RabbitMQ | Module exists | Only event publishing, no consumer resilience |
| Redis | Configured | Session cache + rate limiting, no cluster mode |
| AWS S3 | SDK installed | Storage provider exists, no production bucket |
| Sentry | SDK installed | Error tracking configured |
| OpenTelemetry | SDK installed | Collector configured, no spans in services |
| Twilio/SMS | .env.example only | Mocked — no actual SMS delivery |
| ABDM | Module exists | API calls mocked, no live sandbox integration |

---

## Key Architectural Risks

1. **No API versioning strategy** — breaking changes will break all clients
2. **No service mesh or API gateway** — all services talk directly
3. **96.7% of backend files lack tests** — regression risk is extreme
4. **All SMS/email notifications are mocked** — no actual delivery in production
5. **Telemedicine video is not wired** — LiveKit SDK installed but no room creation
6. **Payment flows are incomplete** — Razorpay SDK installed but no order/checkout integration
7. **No data retention or archival strategy** — PHI accumulates indefinitely
8. **No circuit breakers** — any downstream failure cascades
9. **No feature flags** — can't do gradual rollouts
10. **AI costs are untracked** — no budget controls per provider
