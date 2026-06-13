# WyshCare Compliance Roadmap

**Date:** 2026-06-12 | **Version:** 1.0
**Current Compliance Score:** 28/100
**Target:** HIPAA Safe Harbor + ABDM compliance (80/100+)
**Owner:** Security Engineering

---

## Section 1: Gap Analysis Summary

| Regulation | Current Score | Target | Priority | Key Gaps |
|---|---|---|---|---|
| HIPAA | 30% | 80% | P0 | Encryption, Access audit, MFA, BAA |
| ABDM | 25% | 80% | P0 | Live API integration, consent framework |
| FHIR R4 | 35% | 70% | P1 | FHIR endpoints, serialization layer |
| SOC2 | 20% | 60% | P1 | Controls monitoring, audit evidence |
| ISO 27001 | 15% | 50% | P2 | ISMS, risk framework |
| HL7 v2 | 10% | 40% | P2 | HL7 parser for legacy systems |

---

## Section 2: Phase-based Implementation Plan

### Phase 0 (Done or In Progress) — Weeks 1-2

- [x] TOTP MFA for admin + phone users (implemented)
- [x] Account lockout with exponential backoff (implemented)
- [x] JWT blacklisting via Redis (implemented)
- [x] Sentry error tracking initialization (implemented)
- [x] WebSocket CORS fix (implemented)
- [x] AuditLog immutable hash (implemented)
- [x] Session inactivity timeout (implemented)
- [x] RBAC on 20+ controllers (implemented)
- [x] PHI encryption Prisma middleware (implemented)
- [x] SMS + Email integration (implemented)

### Phase 1 (Weeks 3-4) — HIPAA Quick Wins — Score target: 55/100

1. **Create Business Associate Agreements (BAAs)** with all vendors handling PHI: AWS (hosting), Twilio (SMS), SendGrid/SMTP (email), Supabase (database), LiveKit (telemedicine). Use HHS model BAA template as base. Legal review required. **Assignee:** Legal/Compliance

2. **Document security policies** — create a HIPAA Privacy & Security Policies document covering: Security Officer designation, workforce training policy, sanctions policy, facility access policy, device/media controls. **Assignee:** Security Engineer

3. **Enable TLS enforcement** in the application layer — redirect HTTP to HTTPS in `main.ts` using NestJS `helmet` with `forceSecure: true`. Add HSTS header (`max-age=31536000; includeSubDomains`). **Assignee:** Backend Engineer

4. **Add security headers via Helmet** — configure HSTS, CSP (`default-src 'self'`), X-Frame-Options (`DENY`), X-Content-Type-Options (`nosniff`), Referrer-Policy (`strict-origin-when-cross-origin`). Update `main.ts` helmet config. **Assignee:** Backend Engineer

5. **Configure retention policies for ALL PHI models** — add entries to `DataRetentionService` for: HealthRecord (7yr), Prescription (3yr), ClinicalNote (7yr), ConsultationRecording (3yr), DiagnosticReport (7yr), HealthInformationTransfer (5yr), AbhaProfile (lifetime of relationship). Validate against HIPAA minimum-necessary standard. **Assignee:** Backend Engineer

6. **Add break-glass access procedure documentation** — create `docs/operations/BREAK_GLASS_PROCEDURE.md` covering: emergency PHI access approval chain, post-access review within 24h, logging requirements, and notification to Privacy Officer. **Assignee:** Security Engineer

### Phase 2 (Weeks 5-6) — ABDM Integration — Score target: 70/100

1. **Register for ABDM sandbox access** at https://sandbox.abdm.gov.in/. Obtain sandbox credentials (client ID, client secret, facility ID) and HIP/HIU registration. **Assignee:** Backend Engineer + Product Manager

2. **Get ABHA connector credentials** from ABDM HealthID service at https://healthidsbx.abdm.gov.in/. Store in `.env` as `ABDM_CLIENT_ID`, `ABDM_CLIENT_SECRET`, `ABDM_FACILITY_ID`. **Assignee:** Backend Engineer

3. **Replace mock ABHA generation with real ABDM API calls:**

   - `abdm.service.ts`: Replace `abha.generateFakeABHA()` with `POST https://healthidsbx.abdm.gov.in/api/v1/account/create` using Axios. Implement proper error handling, retry with exponential backoff (3 attempts), and response validation. Wire to real `AbhaProfile` model writes.
   - `nhcx.service.ts`: Replace `setTimeout` simulation with actual NHCX claim submission via `POST https://healthidsbx.abdm.gov.in/api/v2/claims/submit`. Implement claim status polling and webhook callback handling.
   - Add rate limiting (ABDM enforces 10 req/s per IP) and token caching for ABDM access tokens (expire 55min, rotate before expiry). **Assignee:** Backend Engineer

4. **Implement ABDM consent flow** (HIPAA-compatible):
   - Create consent request endpoint `POST /api/v1/abdm/consent/request`
   - Implement consent artifact receipt handler (webhook from ABDM gateway)
   - Store consent artifacts in existing `ConsentArtifact` Prisma model
   - Link consent to FHIR `Consent` resource for interoperability
   - Add consent expiry enforcement — reject PHI access when consent is expired or revoked. **Assignee:** Backend Engineer

5. **Update FHIR resource mapping** to match ABDM specifications:
   - Audit current `fhir-mapper.ts` against ABDM FHIR implementation guide
   - Add ABDM-specific extensions (e.g., `abdm-health-id`, `abdm-consent-artifact`)
   - Ensure resource bundles conform to ABDM's `HIP` and `HIU` profiles
   - Validate bundles against ABDM schema before submission. **Assignee:** Backend Engineer

### Phase 3 (Weeks 7-8) — Audit & Monitoring — Score target: 80/100

1. **Add read audit events to all PHI query paths:**
   - Health record searches (`HealthRecordService.findAll`, `findById`)
   - Patient profile views (`PatientController.getProfile`, `PatientController.getPatient`)
   - Report generation/downloads (`ReportService.generate`, `ReportService.download`)
   - Admin impersonation views (admin patient lookup endpoints)
   - Family member data access (family linkage endpoints)
   - Each audit event should log: `actorUserId`, `patientUserId`, `action` (`PHI_READ`), `resourceType`, `resourceId`, `ipAddress`, `userAgent`. **Assignee:** Backend Engineer

2. **Configure Prometheus metrics endpoint** — add `GET /api/v1/metrics` using `@willsoto/nestjs-prometheus` with metrics for:
   - `phi_encryption_operations_total` (counter by operation type: encrypt/decrypt)
   - `http_request_duration_seconds` (histogram by method, path, status)
   - `auth_login_attempts_total` (counter by outcome: success/failure)
   - `audit_log_writes_total` (counter by resource type)
   - Expose endpoint with authentication (metrics should not be public). **Assignee:** DevOps Engineer

3. **Set up Sentry performance monitoring** — enable `tracesSampleRate: 0.1` in Sentry init. Add custom spans for:
   - PHI encryption/decryption operations
   - FHIR serialization/deserialization
   - External API calls (ABDM, NHCX, Twilio)
   - Database queries on PHI models. **Assignee:** DevOps Engineer

4. **Add alert rules** — configure in Grafana or PagerDuty for:
   - Failed login rate > 10/minute (brute force indicator)
   - Audit log write failures (compliance gap)
   - PHI access from unusual IPs (geo-IP mismatch or first-time IP for user)
   - Backup job failures (data loss risk)
   - Encryption service errors (PHI exposure risk). **Assignee:** DevOps Engineer

5. **Set up Grafana dashboards:**
   - Auth metrics (login rate by outcome, MFA usage %, lockout events/hour, token refresh rate)
   - PHI access patterns (reads/day by resource type, unique patients accessed, peak PHI access hours)
   - API error rates by endpoint (5xx rate, 4xx rate, latency p50/p95/p99)
   - Database health (connection pool utilization, query latency by model, replication lag)
   - Export all dashboards as JSON and commit to `ops/grafana/dashboards/`. **Assignee:** DevOps Engineer

6. **Implement automated weekly backup with encryption verification:**
   - Create `scripts/backup.sh` that runs `pg_dump` with custom format
   - Encrypt backup with GPG (AES-256) using a dedicated backup key
   - Upload encrypted backup to S3 (or equivalent object storage)
   - Verify backup integrity with SHA-256 checksum
   - Schedule via cron (weekly full, daily incremental)
   - Add `BackupJob` audit log event on success/failure. **Assignee:** DevOps Engineer

### Phase 4 (Weeks 9-10) — FHIR & Interoperability — Score target: 90/100

1. **Implement FHIR R4 API endpoints** for core resources:
   - `GET /fhir/Patient/{id}` and `GET /fhir/Patient` (search by name, identifier, birthdate)
   - `GET /fhir/Observation/{id}` and `GET /fhir/Observation` (search by patient, code, date)
   - `GET /fhir/MedicationRequest/{id}` and `GET /fhir/MedicationRequest` (search by patient, status)
   - `GET /fhir/Condition/{id}` and `GET /fhir/Condition` (search by patient, clinical-status)
   - `GET /fhir/Encounter/{id}` and `GET /fhir/Encounter` (search by patient, date, type)
   - `GET /fhir/metadata` (CapabilityStatement). **Assignee:** Backend Engineer

2. **Add FHIR serialization/deserialization layer:**
   - Create `FhirSerializer` that maps internal Prisma models to FHIR R4 JSON resources
   - Create `FhirDeserializer` that maps incoming FHIR resources to internal models
   - Use `fhir/r4` TypeScript types from `@types/fhir` for type safety
   - Handle edge cases: missing optional fields, extensions, nested resources (e.g., `contained`)
   - Validate outgoing/incoming FHIR resources against JSON Schema before processing. **Assignee:** Backend Engineer

3. **Implement `$everything` operation** for patient data export:
   - `GET /fhir/Patient/{id}/$everything` returns all resources linked to a patient
   - Bundle type `collection` or `document` with all resources (Patient, Observation, Condition, MedicationRequest, Encounter, DiagnosticReport)
   - Implement pagination for patients with large clinical histories
   - Add access control — only patient themselves or authorized clinicians can call
   - Audit log every `$everything` export. **Assignee:** Backend Engineer

4. **Add SMART on FHIR authorization:**
   - Implement `GET /.well-known/smart-configuration` endpoint
   - Support `confidential-symmetric` client authentication for EHR integration
   - Implement token exchange endpoint `POST /fhir/token` for SMART app authorization
   - This enables third-party EHR systems to connect to WyshCare. **Assignee:** Backend Engineer

5. **Create FHIR-to-internal model mapping service:**
   - Extract mapping logic from `fhir-mapper.ts` into `FhirMappingService`
   - Add bidirectional mapping for all 5 core resource types
   - Implement mapping validation (required fields check, reference integrity)
   - Add mapping audit events to track FHIR ↔ internal conversions. **Assignee:** Backend Engineer

6. **Implement HL7 v2 parser for legacy system integration:**
   - Add `@hapi/hl7` or similar Node.js HL7 library
   - Parse ADT (Admission, Discharge, Transfer) messages
   - Parse ORM (Order Entry) and ORU (Observation Result) messages
   - Map HL7 segments to FHIR resources for unified data model
   - Expose HL7 endpoint (`/hl7/v2/message`) for legacy EHR push connections. **Assignee:** Backend Engineer

### Phase 5 (Weeks 11-12) — SOC2 Readiness — Score target: 95/100

1. **Implement control monitoring dashboard:**
   - Define SOC2 control catalog (CC1-CC9 common criteria mapped to WyshCare controls)
   - Automate evidence collection for each control (config validation, log aggregation, access review)
   - Create self-service control evidence view in admin dashboard
   - Implement control test automation (scheduled scripts that verify control state). **Assignee:** DevOps Engineer

2. **Create audit evidence collection automation:**
   - Automate collection of: access reviews (user list + last login + role), change management (deploy logs from CI/CD), risk assessments (weekly vulnerability scan output), incident logs (Sentry + audit log aggregation), training records (completion reports from LMS)
   - Store evidence in tamper-evident format (signed hashes, immutable storage). **Assignee:** Security Engineer

3. **Document incident response plan** in `docs/operations/INCIDENT_RESPONSE_PLAN.md`:
   - Define incident severity levels (SEV1-SEV4) with response SLAs
   - Document containment procedures (key rotation, service isolation, user notification)
   - Define breach notification timeline (HIPAA requires 60-day notification)
   - Include incident response team roster with escalation contacts
   - Schedule quarterly tabletop exercises. **Assignee:** Security Engineer

4. **Implement vulnerability management program:**
   - Set up dependency scanning in CI (Snyk or GitHub Dependabot)
   - Schedule weekly SAST scans (Semgrep or SonarQube)
   - Configure container image scanning (Trivy or Docker Scout)
   - Create vulnerability SLA: CRITICAL fix within 48h, HIGH within 7d, MEDIUM within 30d
   - Add security scanning results dashboard. **Assignee:** DevOps Engineer

5. **Schedule external penetration test:**
   - Engage third-party pen test vendor (Cobalt, HackerOne, or local firm)
   - Scope: API endpoints, authentication flows, PHI access paths, FHIR endpoints
   - Remediate findings per SLA (CRITICAL fix: 48h, HIGH: 7d)
   - Re-test after remediation
   - Archive pen test report as audit evidence. **Assignee:** Security Engineer

6. **Create board-level security report template:**
   - Executive summary (overall risk posture, compliance progress, incidents)
   - Key metrics (MFA adoption %, encryption coverage %, audit coverage %, backup success rate)
   - Risk register update (new risks, mitigated risks, open risks)
   - Compliance milestones (% complete by regulation, projected completion dates)
   - Budget and resource tracking (current spend vs planned)
   - Publish quarterly to board and investors. **Assignee:** Security Engineer + Product Manager

---

## Section 3: Required Resources

| Role | Time Required | Phase |
|---|---|---|
| Security Engineer | Full-time | 1-5 |
| DevOps Engineer | 50% | 1, 3, 4 |
| Backend Engineer | 50% | 2, 4 |
| Legal/Compliance | 25% | 1, 5 |
| Product Manager | 10% | 1-5 |

---

## Section 4: Key Metrics (KPIs for Compliance)

Track these weekly:

| Metric | Current | Target | Phase |
|---|---|---|---|
| Encryption at rest coverage | 0% | 100% of PHI models | 0 |
| RBAC coverage | 45% | 100% of controllers | 0 |
| Audit events per day | ~500 | Track and trend | 3 |
| MFA adoption | ~0% | 100% of admin accounts | 0 |
| Test coverage | ~0% | 30%+ | 0 |
| Backup success rate | 0% | 100% | 3 |

---

## Section 5: Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| PHI data breach via unencrypted DB | High | Critical | Phase 0 encryption middleware |
| Unauthorized access via unprotected controllers | High | Critical | Phase 0 RBAC |
| ABDM sandbox credentials delayed | Medium | High | Phase 2 planning |
| Third-party vendor data exposure | Medium | High | Phase 1 BAAs |
| Failed audit due to no evidence collection | High | Medium | Phase 5 |

---

## Appendix: File References

| Document | Path |
|---|---|
| Healthcare Compliance Report | `docs/forensics/HEALTHCARE_COMPLIANCE_REPORT.md` |
| Executive Summary | `docs/forensics/EXECUTIVE_SUMMARY.md` |
| PHI Security Report | `docs/stabilization/PHI_SECURITY_REPORT.md` |
| Authorization Matrix | `docs/stabilization/AUTHORIZATION_MATRIX.md` |
| Mock Inventory | `docs/stabilization/MOCK_INVENTORY.md` |
| Architecture Audit | `docs/stabilization/ARCHITECTURE_AUDIT.md` |
| Security Forensics | `docs/stabilization/SECURITY_FORENSICS_REPORT.md` |
