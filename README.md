# WyshCare

> Healthcare Operating System — Patient App, Doctor EMR, Hospital Platform, AI Copilot

**Founder:** Vimarshak Prudhvi
**Brand:** WYSH

---

## Overview

WyshCare is a comprehensive healthcare operating system connecting patients, doctors, hospitals, pharmacies, labs, and insurers on a single platform. It combines a full-featured EHR/EMR, telemedicine, AI-powered clinical decision support, digital twin modeling, and India's ABDM compliance — all built on a modern cloud-native architecture.

## Modules

| Module | Stack | Status |
|--------|-------|--------|
| **Patient App** | Next.js + Flutter | Active |
| **Doctor EMR** | Next.js | Active |
| **Doctor Mobile** | Flutter | In Development |
| **Hospital Platform** | NestJS + Next.js | Active |
| **Pharmacy** | NestJS | Active |
| **Labs/Diagnostics** | NestJS | Active |
| **Insurance/Billing** | NestJS (Razorpay) | Active |
| **AI Copilot** | NestJS + Multi-LLM | Active |
| **WyshID** | NestJS | Active |
| **Digital Twin** | NestJS (7 engines) | Active |
| **ABDM Integration** | NestJS | Active |
| **Analytics** | NestJS | Active |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                     │
│   Patient Portal  ·  Doctor EMR  ·  Admin Panel          │
├─────────────────────────────────────────────────────────┤
│                    Mobile (Flutter)                       │
│   Patient App  ·  Doctor App (in dev)                    │
├─────────────────────────────────────────────────────────┤
│              API Layer (NestJS + GraphQL)                 │
│   60+ Modules  ·  65+ Controllers  ·  Prisma ORM         │
├─────────────────────────────────────────────────────────┤
│                  AI Architecture                          │
│   AiOrchestrator  ·  Gemini  ·  OpenAI  ·  OpenRouter    │
│   NVIDIA NIM  ·  Ollama  ·  ProviderFactory              │
│   Digital Twin (7 engines)  ·  Risk/Lifestyle/Preventive │
├─────────────────────────────────────────────────────────┤
│              Data Layer (Supabase/PostgreSQL)             │
│   122+ Models  ·  Row Level Security  ·  Storage         │
├─────────────────────────────────────────────────────────┤
│           Infrastructure (Docker + Supabase)              │
│   Redis  ·  RabbitMQ  ·  LiveKit  ·  Razorpay            │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

- **Backend:** NestJS, TypeScript, Prisma, GraphQL (Apollo), REST
- **Frontend:** Next.js, TypeScript, React, TailwindCSS
- **Mobile:** Flutter, Dart
- **Database:** PostgreSQL (via Supabase), Redis
- **AI:** Gemini, OpenAI, OpenRouter, NVIDIA NIM, Ollama
- **Infrastructure:** Docker, Supabase, RabbitMQ, LiveKit
- **Payments:** Razorpay
- **Video:** LiveKit

## Setup

### Prerequisites

- Node.js 20+
- pnpm
- Docker
- Supabase account
- Flutter SDK (for mobile apps)

### Backend

```bash
cd backend
pnpm install
cp .env.example .env
# Edit .env with your Supabase credentials
pnpm run prisma:generate
pnpm run start:dev
```

### Frontend

```bash
cd frontend
pnpm install
cp .env.example .env
# Edit .env with API URL
pnpm run dev
```

### Mobile (Patient)

```bash
cd apps/patient-mobile
flutter pub get
flutter run
```

### Mobile (Doctor)

```bash
cd apps/doctor-mobile
flutter pub get
flutter run
```

## Development

```bash
# Backend
pnpm run start:dev          # Watch mode
pnpm run build              # Production build
pnpm run lint               # ESLint
pnpm run test               # Unit tests

# Frontend
pnpm run dev                # Development server
pnpm run build              # Production build
pnpm run lint               # ESLint

# Prisma
pnpm run prisma:generate    # Generate client
pnpm run prisma:migrate     # Run migrations
pnpm run prisma:studio      # DB GUI

# Docker
docker compose up -d        # Start all services
```

## Deployment

The platform is containerized via Docker. Production deployment targets Supabase for the database layer with NestJS running as a containerized service.

```bash
docker build -t wyshcare-backend -f Dockerfile .
docker compose -f docker-compose.yml up -d
```

## Security

- Row Level Security (RLS) on all Supabase tables
- JWT-based authentication with refresh token rotation
- Role-Based Access Control (RBAC)
- Swagger docs disabled in production
- Helmet security headers
- Input validation (class-validator)
- Rate limiting (nest-throttler)
- Audit logging across all modules
- PHI/PII data classification documented

## Compliance

- **HIPAA** — Technical safeguards, access controls, audit controls
- **ABDM** — India's Ayushman Bharat Digital Mission integration
- **FHIR R4** — Partial alignment with 18+ resource types
- **SOC2** — Security, availability, and confidentiality controls

## Documentation

Full documentation is available in the `docs/` directory:

| Document | Description |
|----------|-------------|
| `ARCHITECTURE.md` | System architecture overview |
| `ENTERPRISE_ARCHITECTURE.md` | Enterprise-scale architecture |
| `SUPABASE_SCHEMA.md` | Supabase schema documentation |
| `WYSHCARE_COMPLETE_AUDIT_REPORT.md` | Full codebase audit |
| `docs/HIPAA_GAP_ANALYSIS.md` | HIPAA compliance analysis |
| `docs/ABDM_GAP_ANALYSIS.md` | ABDM compliance analysis |
| `docs/FHIR_GAP_ANALYSIS.md` | FHIR alignment analysis |
| `docs/SOC2_GAP_ANALYSIS.md` | SOC2 readiness analysis |
| `docs/adr/` | Architecture Decision Records |
| `docs/DATA_CLASSIFICATION.md` | PHI/PII classification |
| `docs/SECURITY_AUDIT.md` | Security audit findings |
| `docs/DEPENDENCY_RISK_REPORT.md` | Dependency vulnerabilities |

## Project Structure

```
├── backend/                  # NestJS API (60+ modules)
│   ├── prisma/               # Database schema & migrations
│   ├── src/
│   │   ├── modules/          # Domain modules
│   │   ├── providers/        # Shared providers
│   │   ├── common/           # Shared utilities
│   │   └── main.ts          # Entry point
│   └── scripts/              # Utility scripts
├── frontend/                 # Next.js web app
│   └── src/
│       ├── app/              # Next.js app router
│       ├── features/         # Feature modules
│       ├── components/       # Shared components
│       ├── stores/           # State management
│       └── lib/              # Utilities
├── apps/
│   ├── patient-mobile/       # Flutter patient app
│   └── doctor-mobile/        # Flutter doctor app (in dev)
├── shared/                   # Shared TypeScript library
├── docs/                     # Documentation
│   └── adr/                  # Architecture Decision Records
├── scripts/                  # Build/CI scripts
└── infra/                    # Infrastructure configs
    ├── k8s/                  # Kubernetes manifests
    ├── terraform/            # Terraform modules
    └── monitoring/           # Monitoring configs
```

## Version

Current: **v1.0.0-alpha**

## Maintainers

**Wysh Technologies**
Founded by **Vimarshak Prudhvi**

---

*Built with care for healthcare.*
