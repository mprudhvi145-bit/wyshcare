# SOC 2 Type II Gap Analysis — WyshCare Platform

> **Date:** June 12, 2026  
> **Scope:** All backend modules, infrastructure config (`infra/`), Prisma schema  
> **Trust Service Criteria:** Security, Availability, Processing Integrity, Confidentiality, Privacy  
> **Rating Scale:** ✅ Compliant | ⚠️ Partial | ❌ Gap

---

## 1. Security

### 1.1 Access Control (CC6)

| Requirement | Status | Evidence / Gap |
|---|---|---|
| Logical access controls | ✅ Compliant | JWT-based auth (`JwtAuthGuard`), RBAC via `RolesGuard` with 11 roles (PATIENT, DOCTOR, ADMIN, SUPER_ADMIN, etc.). |
| Authentication mechanisms | ✅ Compliant | OTP-based phone verification, secure token rotation, session management with `DeviceSession` and `RefreshToken`. |
| Authorization matrix | ⚠️ Partial | Role-based access exists but is per-controller via `@Roles()` decorator. No centralized authorization matrix document. No attribute-based (ABAC) controls for granular PHI scoping. |
| Separation of duties | ⚠️ Partial | Roles provide separation (e.g., PATIENT cannot access ADMIN endpoints). However, `ConsentGrant` allows patients to grant FULL access to other users, potentially bypassing separation. |
| Least privilege principle | ⚠️ Partial | `RolesGuard` ensures route-level least privilege. However, `vault.controller.ts` `getDownloadLink` and `download` endpoints have `@Public()` on the download route (line 119) — an unauthenticated download path. |

**Risk:** `vault.controller.ts` `download()` is `@Public()` (line 119), allowing unauthenticated file downloads if the signed URL parameters are known.

### 1.2 Monitoring & Detection (CC7)

| Requirement | Status | Evidence / Gap |
|---|---|---|
| Audit logging | ⚠️ Partial | `AuditLog` model captures action, resourceType, resourceId, actorUserId, ipAddress, userAgent, immutableHash. Logged for auth, consent, and vault operations. Missing: read access events on clinical data, system-level events (restarts, config changes). |
| Anomaly detection | ❌ Gap | No SIEM integration, no automated anomaly detection. Infrastructure (`infra/prometheus/`, `infra/grafana/`) provides metrics but not security analytics. |
| Alerting on security events | ❌ Gap | No alerting rules for security events (failed auth, consent grant spikes, bulk data exports). `infra/alertmanager/` exists but no security-specific alert rules found. |
| Log retention & protection | ⚠️ Partial | `AuditLog` is stored in the operational database. No separate immutable log store, no retention policy configuration in code. `immutableHash` field provides tamper evidence at the row level. |

**Rating: ⚠️ Partial** — Audit logs exist but lack SIEM integration, anomaly detection, and dedicated log storage.

### 1.3 Incident Response (CC7.4)

| Requirement | Status | Evidence / Gap |
|---|---|---|
| Incident response plan | ❌ Gap | No incident response SOP documented in the repository. |
| Incident detection & reporting | ❌ Gap | No incident reporting workflow. |
| Forensic readiness | ❌ Gap | `AuditLog` provides basic forensic data but no snapshot or rollback capability. |
| Post-incident review | ❌ Gap | No post-mortem workflow. |

**Rating: ❌ Gap** — No incident response infrastructure.

### 1.4 Change Management (CC8)

| Requirement | Status | Evidence / Gap |
|---|---|---|
| Change control policy | ⚠️ Partial | GitHub-based PR workflow. Infrastructure as code via Terraform (`infra/terraform/`). Kubernetes manifests version-controlled. |
| Change authorization | ❌ Gap | No change advisory board (CAB) workflow or approvals documented. |
| Emergency changes | ❌ Gap | No emergency change bypass procedure documented. |

**Rating: ⚠️ Partial** — Version control exists; formal change management process is undocumented.

---

## 2. Availability (A1)

| Requirement | Status | Evidence / Gap |
|---|---|---|
| System redundancy | ⚠️ Partial | Kubernetes deployment (`infra/k8s/`) implies multi-pod redundancy. No explicit multi-AZ or cross-region configuration found. |
| Disaster recovery | ❌ Gap | No DR plan documented. No RTO/RPO targets defined. |
| Backup & restore | ❌ Gap | No backup scheduling, retention policy, or restore testing documented. Supabase migrations (`supabase_migrations/`) exist but no backup automation. |
| Monitoring & alerting | ⚠️ Partial | `infra/prometheus/`, `infra/grafana/`, `infra/alertmanager/` configured. Uptime monitoring is infrastructure-level, not application-level. |
| Capacity planning | ❌ Gap | `k6/` load test scripts exist but no capacity planning thresholds documented. |
| Incident SLA | ❌ Gap | No availability SLAs or incident response SLAs documented. |

**Rating: ⚠️ Partial** — Kubernetes provides inherent resilience. DR, backup, and capacity planning are gaps.

---

## 3. Processing Integrity (PI1)

| Requirement | Status | Evidence / Gap |
|---|---|---|
| Complete & accurate processing | ⚠️ Partial | `HealthRecord.hash` (SHA-256) validates upload integrity. `PrescriptionVerification.tamperHash` validates prescription integrity. Service-level validation in NestJS DTOs. |
| Input validation | ⚠️ Partial | DTO validation exists (class-validator presumably). `vault.service.ts` validates mime types, file sizes. No systematic schema validation on all create/update endpoints. |
| Error handling | ⚠️ Partial | Structured exception handling in services (NotFoundException, ConflictException). No global error tracking correlation IDs. |
| Data reconciliation | ❌ Gap | No reconciliation controls between systems (e.g., payments vs. orders, prescriptions vs. dispensations). |
| Processing monitoring | ❌ Gap | No processing SLAs or job monitoring for async processes (`AIJob` model exists but no SLAs). |

**Rating: ⚠️ Partial** — Integrity checks exist on file uploads and prescriptions, but systematic reconciliation is missing.

---

## 4. Confidentiality (C1)

| Requirement | Status | Evidence / Gap |
|---|---|---|
| Encryption at rest | ⚠️ Partial | `EncryptionService` (AES-256-GCM) encrypts file uploads in `vault.service.ts`. `FieldEncryptionService` selectively encrypts PHI fields. However, the majority of PHI in the database is in plaintext (fullName, phoneNumber, chronicConditions, etc.). |
| Encryption in transit | ⚠️ Partial | HTTPS enforced in production (cookie `secure: true`). No TLS configuration or certificate management visible in the repo. |
| Data classification | ⚠️ Partial | `FieldEncryptionService.phiFields` provides a classification map. No formal data classification policy document. |
| Data masking | ✅ Compliant | `FieldEncryptionService.maskPII()` masks fullName, phoneNumber, email. |
| Secure disposal | ❌ Gap | No data disposal/sanitization procedures. `deletedAt` fields exist for soft-delete but no secure deletion mechanism. |
| Data leakage prevention | ❌ Gap | No DLP controls. The `@Public()` download endpoint in `vault.controller.ts` is a confidentiality risk. |

**Rating: ⚠️ Partial** — Strong encryption primitives exist but are not universally applied to all PHI data. Data masking is implemented.

---

## 5. Privacy (P1-P6)

| Requirement | Status | Evidence / Gap |
|---|---|---|
| Privacy notice | ❌ Gap | No privacy notice or policy documented in the repo. |
| Consent management | ✅ Compliant | Comprehensive consent system (`ConsentGrant` with accessLevel, accessMethod, scope, expiry, revoke). ABDM consent system (`AbdmConsent`) for regulatory compliance. |
| Data subject rights | ⚠️ Partial | Access rights exist (vault download, consent listing). Amendment and deletion workflows are missing. |
| Data minimization | ❌ Gap | No data minimization controls. The schema collects extensive PHI without documented justification for each field. |
| Privacy training | ❌ Gap | No privacy training materials or attestation workflows. |
| Third-party privacy | ⚠️ Partial | `ConsentGrant` supports external grantees (`granteeExternalRef`). No third-party privacy assessment workflow. |

**Rating: ⚠️ Partial** — Consent management is excellent. Privacy notice, data minimization, and deletion workflows are gaps.

---

## 6. Vendor Management (CC3)

| Requirement | Status | Evidence / Gap |
|---|---|---|
| Vendor risk assessment | ❌ Gap | No vendor risk assessment documentation. External services (Razorpay, LiveKit, Gemini AI, SMS provider) are used without evident vendor assessment records. |
| Vendor monitoring | ❌ Gap | No vendor SLA monitoring or periodic review process. |
| Contractual safeguards | ❌ Gap | No BAAs (Business Associate Agreements) documented for PHI-processing vendors. |
| Vendor termination | ❌ Gap | No vendor offboarding procedures. |

**Rating: ❌ Gap** — No vendor management controls evident.

---

## 7. Data Lifecycle Management

| Stage | Status | Evidence / Gap |
|---|---|---|
| Creation | ⚠️ Partial | Data is created via API with minimal input validation. PHI collection is extensive. |
| Storage | ✅ Compliant | Encrypted at rest for files (`vault.service.ts`). Field-level encryption available. PostgreSQL database. |
| Usage | ⚠️ Partial | Access is controlled via RBAC. No usage logging on read operations. |
| Sharing | ✅ Compliant | `ConsentGrant` provides granular sharing controls. Share links with token hashing. |
| Archival | ❌ Gap | No archival policy implemented. `deletedAt` soft-delete does not archive. |
| Deletion | ❌ Gap | No secure deletion mechanism. Cascade deletes exist in Prisma relations but no hard-delete API or retention enforcement. |

**Rating: ⚠️ Partial** — Storage and sharing are well-controlled. Archival and deletion are unaddressed.

---

## 8. Summary & Remediation Roadmap

| Trust Criterion | Rating | Priority | Key Remediation |
|---|---|---|---|
| Security — Access Control | ⚠️ Partial | HIGH | Remove `@Public()` from vault download; implement ABAC; create authorization matrix document. |
| Security — Monitoring | ⚠️ Partial | HIGH | Integrate SIEM; build audit pipeline for all clinical data reads; implement log retention policy. |
| Security — Incident Response | ❌ Gap | CRITICAL | Document IR plan; build incident reporting API; define severity matrix. |
| Security — Change Management | ⚠️ Partial | MEDIUM | Formalize CAB process; document emergency change procedure. |
| Availability | ⚠️ Partial | MEDIUM | Define DR plan with RTO/RPO; implement backup automation; document capacity thresholds. |
| Processing Integrity | ⚠️ Partial | MEDIUM | Add reconciliation controls for clinical orders; implement job monitoring with SLAs. |
| Confidentiality | ⚠️ Partial | HIGH | Extend field-level encryption to all PHI columns; implement data disposal workflows. |
| Privacy | ⚠️ Partial | HIGH | Publish privacy notice; build data deletion API; implement data minimization review. |
| Vendor Management | ❌ Gap | HIGH | Document vendor risk assessments; collect BAAs from PHI vendors. |
| Data Lifecycle | ⚠️ Partial | MEDIUM | Implement archival policies; add hard-delete with retention enforcement. |

### Immediate Actions (0–30 days)
1. Remove `@Public()` from the vault download endpoint (or restrict with signed-token validation only).
2. Add audit logging middleware/interceptor to capture all read access on clinical data models.
3. Document the incident response plan and data classification policy.

### Short-Term (30–90 days)
4. Implement ABAC for granular PHI access scoping.
5. Integrate SIEM with audit log pipeline.
6. Implement retention-based data archival and secure deletion.

### Long-Term (90–180 days)
7. Conduct formal SOC 2 Type II readiness assessment.
8. Implement continuous compliance monitoring.
9. Achieve SOC 2 Type II certification.
