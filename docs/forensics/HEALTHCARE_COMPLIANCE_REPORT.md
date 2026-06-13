# Healthcare Compliance Report — WyshCare

**Generated:** 2026-06-12
**Methodology:** Static code analysis against regulatory requirements

---

## Overall Compliance Readiness: **28/100**

| Framework | Readiness | Critical Gaps |
|-----------|-----------|---------------|
| HIPAA | 30% | No BAAs, no access audit, no encryption at rest |
| ABDM | 25% | Module exists but API calls are mocked |
| FHIR R4 | 35% | Partial schema alignment, no FHIR API endpoints |
| SOC2 | 20% | No controls monitoring, no audit evidence |
| ISO 27001 | 15% | No ISMS, no risk management framework |
| HL7 v2 | 10% | No HL7 parser, no message routing |

---

## HIPAA Readiness: **30/100**

### Administrative Safeguards — 20/100
- **No Security Officer assigned** — no designated role in code or config
- **No Risk Analysis** — no documented risk assessment
- **No Workforce Training** — no training materials
- **No Contingency Plan** — backup plan documented but not automated
- **No BA Agreements** — no BAA templates or vendor PHI agreements

### Technical Safeguards — 35/100
| Requirement | Status | Evidence |
|-------------|--------|----------|
| Access Control (unique user IDs) | ✅ Partial | JWT auth exists, but no emergency access procedure |
| Access Control (automatic logoff) | ❌ Missing | No session timeout enforcement |
| Encryption at Rest | ❌ Missing | PHI stored as plain text (`User.aadhaarNumber`, `User.phoneNumber`) |
| Encryption in Transit | ❌ Missing | No HTTPS enforcement in application |
| Audit Controls | ❌ Missing | `AuditLog` model exists but not implemented |
| Integrity Controls | ❌ Missing | No ePHI integrity verification |
| Person/Auth Verification | ❌ Missing | No MFA |
| Facility Access Controls | ❌ Missing | No facility-level controls |

### Required Documentation — 25/100
- No BAA templates
- No contingency plan (beyond brief backup doc)
- No security awareness materials
- No maintenance records
- No incident response procedures

### HIPAA Gap Analysis Evidence
| File | Issue |
|------|-------|
| `prisma/schema.prisma` `model User` | `aadhaarNumber` and `phoneNumber` stored as plain text strings |
| `AuditLog` model exists but 0 services use it | `AuditLog` model at line 3013, unused |
| `test/e2e/auth.e2e-spec.ts` | Tests exist but don't cover HIPAA-specific controls |
| No `audit` module in backend/src/modules/ | Module for audit logging doesn't exist |

---

## ABDM Readiness: **25/100**

### Implemented
- ✅ `abdm` module exists in `backend/src/modules/abdm/`
- ✅ ABDM-specific Prisma models (consent, health ID, care context)
- ✅ ABDM views in iOS (`ABDMView.swift`, `ABHAProfileView.swift`)
- ✅ ABDM API placeholders in `api-client.ts`

### Missing
- ❌ No actual ABDM sandbox API integration (`nhcx.service.ts` and `abdm.service.ts` use mock implementations)
- ❌ No ABHA number generation
- ❌ No consent manager flow
- ❌ No HIP (Health Information Provider) registration
- ❌ No HIU (Health Information User) registration
- ❌ No care context linking
- ❌ No ABDM-compliant FHIR bundles

### Evidence
```
backend/src/modules/abdm/abdm.service.ts — mock implementations of createHealthId(), getHealthId()
backend/src/modules/nhcx/nhcx.service.ts — mock claim submission
```

---

## FHIR R4 Readiness: **35/100**

### Aligned Resource Types
The Prisma schema has models that map to ~18 FHIR R4 resource types:
| Prisma Model | FHIR Resource |
|-------------|---------------|
| Patient | Patient |
| DoctorProfile | Practitioner |
| Appointment | Appointment |
| Prescription | MedicationRequest |
| DiagnosticOrder | ServiceRequest |
| DiagnosticReport | DiagnosticReport |
| Condition/Diagnosis | Condition |
| Observation | Observation |
| Organization (via Clinic) | Organization |
| Coverage (via Policy) | Coverage |
| Claim | Claim |
| Encounter | Encounter |

### Missing FHIR Implementation
- ❌ No FHIR API endpoints (`[base]/Patient`, `[base]/Observation`, etc.)
- ❌ No FHIR JSON serialization/deserialization
- ❌ No `$everything` operation
- ❌ No capability statement
- ❌ No FHIR search parameters
- ❌ No FHIR validation
- ❌ No FHIR terminology server integration

### Evidence
`backend/src/modules/nhcx/fhir-mapper.ts` exists and maps some data but is not exposed via API.

---

## SOC2 Readiness: **20/100**

### Security Category — 25/100
| Control | Status |
|---------|--------|
| Access control | Partial (JWT auth, no RBAC) |
| Two-factor authentication | Missing |
| Encryption | Missing at rest |
| Network firewalls | Not implemented in app |
| Intrusion detection | Missing |
| Anti-malware | Missing |
| Security training | Missing |
| Vendor management | Missing |

### Availability Category — 15/100
| Control | Status |
|---------|--------|
| Capacity planning | Missing |
| Disaster recovery | Policy only, no automation |
| Redundancy | No multi-region |
| Monitoring | Sentry + Grafana but not production-wired |

### Processing Integrity — 20/100
| Control | Status |
|---------|--------|
| Data validation | Partial (class-validator on DTOs) |
| Error handling | Inconsistent (try/catch + console.log) |
| Audit trail | Model exists, not implemented |

### Confidentiality — 25/100
| Control | Status |
|---------|--------|
| Access controls | Partial |
| Encryption | Missing at rest |
| Data masking | Missing |
| Retention policies | Stub only |

### Privacy — 15/100
| Control | Status |
|---------|--------|
| Notice/Consent | Not implemented |
| Access rights | Not implemented |
| Correction rights | Not implemented |
| Data portability | Not implemented |
| Breach notification | Not implemented |

---

## ISO 27001 Readiness: **15/100**

No evidence of:
- ISMS policy
- Risk assessment methodology
- Statement of Applicability
- Asset inventory
- Supplier security
- Incident management process
- Business continuity plan (policy doc exists but no automation)

---

## Summary of Healthcare Compliance Gaps

| Priority | Gap | Framework | Impact |
|----------|-----|-----------|--------|
| P0 | No MFA | HIPAA, SOC2 | Account takeover risk on all user accounts |
| P0 | No PHI access audit | HIPAA, SOC2 | Cannot detect unauthorized PHI access |
| P0 | No encryption at rest | HIPAA, SOC2 | PHI/PII data in plain text in database |
| P1 | No RBAC enforcement | HIPAA, SOC2 | Any user can access any endpoint |
| P1 | ABDM services are mocked | ABDM | Cannot integrate with Indian health stack |
| P1 | No FHIR API endpoints | FHIR R4 | No interoperability with other EHRs |
| P1 | No BAAs or vendor risk | HIPAA, SOC2 | All cloud vendors (Supabase, LiveKit) are unassessed |
| P2 | No incident response | HIPAA, SOC2, ISO | No documented breach response procedure |
| P2 | No data retention enforcement | HIPAA, GDPR | PHI retained indefinitely |
| P2 | No backup automation | HIPAA, SOC2 | Recovery plan exists but no scripts |
| P2 | No security awareness training | HIPAA, ISO | No evidence of workforce training |
| P3 | No CAPTCHA or rate limiting | HIPAA | Brute force attacks on login possible |
| P3 | No session timeout | HIPAA | Sessions never expire automatically |
| P3 | No data masking | HIPAA, SOC2 | Full PHI exposed in API responses |
| P3 | No vulnerability scanning | SOC2, ISO | No automated security scanning |

---

**Overall Assessment:** The platform has the architectural **framework** for compliance (models, schemas, module structure) but lacks the **implementation** of security and compliance controls. Estimated effort: **6-9 months** for HIPAA readiness, **12+ months** for comprehensive SOC2 + ISO 27001 certification.
