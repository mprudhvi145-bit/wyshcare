# Architecture

## Product boundary

WyshCare V1 is a consumer healthcare platform, not a hospital ERP. The active domain includes identity, consent, records memory, provider discovery, telemedicine, diagnostics, pharmacy, commerce, multilingual AI, and connected family care.

## Backend

- Modular monolith in NestJS for faster V1 delivery without sacrificing bounded contexts.
- REST for consumer/mobile ergonomics and operational integrations.
- GraphQL for AI-assisted discovery and composable dashboard queries.
- Prisma with PostgreSQL as the source of truth and Redis for ephemeral caching/session helpers.
- WebSocket namespace for notification fanout.

## Security

- OTP-based identity bootstrap with device sessions and refresh tokens.
- Role-aware access control, consent grants, audit logging, and emergency-only scoped access.
- Encryption hooks are modeled at the record layer through `encryptedDek`, content hashes, and object-storage indirection.
- ABDM linkage is isolated in an interoperability module to keep trust boundaries explicit.

## AI

- Safety-first symptom analysis.
- Report summarization and longitudinal memory graph primitives.
- Future OCR pipeline can persist extracted text and structured payloads into `HealthRecord`, `DiagnosticReport`, and `AIMemoryNode`.

## Deployment

- Local: Docker Compose with PostgreSQL and Redis.
- Production: container images, Kubernetes manifests, NGINX reverse proxy, GitHub Actions CI/CD.
