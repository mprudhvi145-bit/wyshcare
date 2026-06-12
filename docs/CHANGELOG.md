# Changelog

## [1.0.0-alpha] - 2026-06-12

### Added

#### Platform Foundation
- Initial platform baseline with full NestJS backend
- Monorepo structure with backend, frontend, shared, and mobile apps
- Prisma schema with 122+ models covering the entire healthcare domain
- Type-safe database access with Prisma Client
- GraphQL API with Apollo Server (NestJS integration)
- REST API with ~210 endpoints across 60+ modules

#### Authentication & Identity
- OTP-based authentication (phone number + SMS)
- JWT access + refresh token session management
- Doctor-specific authentication flow
- Admin authentication with MFA (TOTP)
- Session management with revocation
- Role-based access control (RBAC) with roles: PATIENT, DOCTOR, ADMIN, etc.

#### Clinical Modules
- Enterprise EHR with patient chart, encounters, orders, clinical notes
- Clinical Decision Support (CDS) engine
- EHR timeline for longitudinal patient data
- 15 specialty-specific modules:
  - General Medicine, ENT, Dental, Dermatology, Ophthalmology
  - Cardiology, Pediatrics, Orthopedics, Gynecology, Neurology
  - Psychiatry, Pulmonology, Gastroenterology, Urology, Endocrinology
- Prescription engine with drug interaction checking
- Medication adherence tracking
- Prescription QR verification
- Drug database with bulk import

#### AI Architecture
- Multi-provider AI architecture supporting:
  - Google Gemini
  - OpenAI
  - OpenRouter
  - NVIDIA NIM
  - Ollama (local)
- AI orchestration layer for provider routing
- AI-powered symptom analysis
- AI report summarization
- AI risk prediction engine
- AI lifestyle assessment and recommendations
- AI preventive care recommendations

#### Digital Twin Engine
- Full digital twin profile with 7 predictive engines
- Health scoring (lifestyle, risk, adherence, readiness)
- Health predictions and risk assessments
- Care gap detection
- Preventive recommendations
- Health twin for patient Q&A

#### Health Graph
- Health Graph v1 (patient data graph with relationship mapping)
- Health Graph v2 (lifestyle, symptoms, family history, wearables, risk, prevention)
- Provider graph with referral management and reputation scoring

#### Billing & Insurance
- Payments module with Razorpay integration
- Clinic billing with invoice management
- Insurance + Claims OS:
  - Provider and plan management
  - Policy linking
  - Coverage rules
  - Eligibility checking
  - Pre-authorization
  - Claims management with adjudication
  - AI copilot for claim analysis and denial risk prediction
  - Insurance NHCX gateway for India compliance

#### Pharmacy
- Pharmacy order management
- Pharmacy workspace (dispensing, procurement, inventory)
- Pharmacy partner integration
- Prescription-to-pharmacy workflow

#### Diagnostics
- Diagnostic partner listings
- Lab order management
- Lab report upload and management
- Lab workspace (samples, results, approvals)

#### Clinic OS
- Clinic admin dashboard
- Clinic branding and templates
- Clinic reception (scheduling, check-in, walk-in, queue management)
- Clinic billing (invoices, payments, revenue reports)
- Clinical twin (AI-powered clinic analytics)
- Staff dashboard
- Nurse workspace (vitals, medications, care tasks, shift handover)
- Role-based workspace routing

#### Telemedicine
- Appointment management
- Telemedicine session creation (LiveKit integration)
- Video/audio call infrastructure

#### ABDM Integration (India Healthcare Compliance)
- ABHA (Ayushman Bharat Health Account) creation and linking
- ABHA OTP verification
- Consent management (request, grant, revoke)
- HIP (Health Information Provider) care contexts
- HIU (Health Information User) health data requests
- HPR (Healthcare Professionals Registry) sync and search
- HFR (Healthcare Facilities Registry) sync and search
- ABDM gateway health checks

#### Data & Storage
- Health locker (vault) with S3-compatible storage
- Record upload with file typing
- Secure download with signed URLs
- Encryption module for sensitive data

#### Infrastructure
- Docker Compose for local development
- Production Dockerfile
- RabbitMQ message queue
- Redis caching
- OpenTelemetry observability
- Sentry error tracking
- Rate limiting (ThrottlerModule)

#### Frontend (Next.js)
- Patient and doctor portals
- Radix UI component library
- Tailwind CSS v4 styling
- tanstack/react-query for data fetching
- Zustand state management
- framer-motion animations

#### Mobile Apps
- Flutter patient mobile app
- Flutter doctor mobile app (in development)

### Security
- Helmet security headers
- CORS configuration
- JWT authentication with guards
- Role-based access control
- Public endpoint decorator for opt-out
- Rate limiting (120 requests/minute)
- Full security audit completed

### Quality
- ESLint configuration with TypeScript
- Prettier formatting
- Prisma schema validation
- Notification template system
- Audit log service

### Changed
- All SDKs removed for consolidation

### Notes
- This is an alpha release. APIs are subject to change.
- Mobile doctor app is in active development and not feature-complete.
- Production secrets management (Doppler/AWS Secrets Manager) not yet configured.
- No API versioning implemented yet; `/v1/` prefix to be added.
- Comprehensive test suite to be built out in beta phase.
