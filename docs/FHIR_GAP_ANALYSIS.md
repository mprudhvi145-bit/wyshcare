# FHIR R4 Gap Analysis — WyshCare Platform

> **Date:** June 12, 2026  
> **Scope:** Prisma schema at `backend/prisma/schema.prisma` mapped against HL7 FHIR R4 resources  
> **Rating Scale:** ✅ Full Coverage | ⚠️ Partial | ❌ Missing | 🔧 Alignment Needed

---

## 1. FHIR R4 Resource Coverage

| FHIR Resource | WyshCare Model | Status | Notes |
|---|---|---|---|
| **Patient** | `User` | ✅ Full | Covers name, birthDate, gender, telecom (phone/email), address (via emergency data), identifier (wyshId, abhaNumber). Missing: managingOrganization, generalPractitioner, communication (language — `preferredLanguage` exists but not FHIR-coded). |
| **Practitioner** | `DoctorProfile`, `ProviderProfile` | ✅ Full | Covers name, qualification, identifier (registrationNumber), specialty. `ProviderGraphNode` extends to all provider types. |
| **Organization** | `Clinic` | ✅ Full | Covers name, address, telecom, identifier. Missing: partOf, endpoint. |
| **Encounter** | `Encounter` | ✅ Full | `encounterClass` (OUTPATIENT, INPATIENT, EMERGENCY, TELEMEDICINE, HOME_CARE), `status` (PLANNED, IN_PROGRESS, FINISHED, CANCELLED, ENTERED_IN_ERROR), periodStart/periodEnd, location, reason, provider. `EncounterDiagnosis` link table exists. |
| **Condition** | `Condition` | ✅ Full | `icdCode` (with `codeSystem: "ICD-10-EN"`), `displayName`, `bodySite`, `onsetDate`, `resolutionDate`, `clinicalStatus`, `severity`. `EncounterDiagnosis` links to encounters. |
| **Observation** | `VitalsRecord`, `LabResult` | ⚠️ Partial | `VitalsRecord` stores bpSystolic, bpDiastolic, heartRate, temperature, spo2, respiratoryRate, weight, height, bmi, painScore. `LabResult` stores testName, result, unit, referenceRange. Missing: FHIR `code` (LOINC coding), `category`, `interpretation`, `referenceRange` as structured array. Results are flat strings, not coded observations. |
| **MedicationRequest** | `Prescription`, `PrescriptionItem` | ⚠️ Partial | `Prescription` covers status (DRAFT, ACTIVE, DISPENSED, etc.), authoredOn, requester (doctorProfileId). `PrescriptionItem` covers drugName, dosage, frequency, durationDays, route, quantity, refills. Missing: `MedicationRequest.intent`, `dosageInstruction` as structured FHIR type, `substitution`. |
| **Medication** | `Drug`, `Medication` | ✅ Full | `Drug` has genericName, brandNames, strength, dosageForm, manufacturer, atcCode, rxNormCode, drugClass, interactions. |
| **MedicationAdministration** | `MedicationAdministration` | ✅ Full | Covers medicationName, dose, route, scheduledTime, administeredTime, status (SCHEDULED, ADMINISTERED, SKIPPED, REFUSED, HELD). |
| **DiagnosticReport** | `DiagnosticReport`, `DiagnosticOrder` | ⚠️ Partial | `DiagnosticReport` has reportType, summary, abnormalMarkers, trendSnapshot. Missing: `basedOn`, `conclusionCode`, `presentedForm`, `result` as array of Observation references. |
| **Immunization** | `Immunization` | ✅ Full | Covers vaccineName, cvxCode, manufacturer, lotNumber, doseNumber, administrationSite, route, administeredDate. |
| **AllergyIntolerance** | `Allergy` | ✅ Full | Covers allergen, reaction, severity, onsetDate, status (ACTIVE), notes. |
| **Procedure** | `ProcedureRecord` | ✅ Full | Covers code, codeSystem (SNOMED), displayName, bodySite, performedDate, outcome, complications. `EncounterProcedure` links to encounters. |
| **CarePlan** | `CarePlan` | ✅ Full | Covers status, intent (implied by type), category, title, description, goals, period. `CarePlanLog`, `CarePlanMilestone` for tracking. |
| **CareTeam** | `CareTask`, `StaffAssignment` | ❌ Missing | No dedicated `CareTeam` model. `CareTask` assigns tasks to individuals. `StaffAssignment` maps roles to clinics. |
| **DocumentReference** | `ClinicalDocument`, `HealthRecord` | ✅ Full | `ClinicalDocument` covers patientId, documentType, title, storageKey, mimeType, fileSize, status. `HealthRecord` adds encryption metadata (encryptedDek, fileIv, fileAuthTag). |
| **Consent** | `ConsentGrant`, `AbdmConsent` | ✅ Full | Dual consent models: `ConsentGrant` (internal, with accessLevel, accessMethod, scope, expiry) and `AbdmConsent` (ABDM-specific with hiTypes, permission period, signature). |
| **Coverage** | `InsurancePolicy`, `InsurancePlan` | ✅ Full | Covers policyNumber, memberId, period, status, coveragePercent, sumInsured, copay. `CoverageRule` maps benefits. |
| **Claim** | `Claim`, `ClaimLineItem` | ✅ Full | Covers claimNumber, status, totalAmount, claimedAmount, approvedAmount, line items with category, adjudication. `NHCXClaimSubmission` for electronic submission. |
| **FamilyMemberHistory** | `FamilyHistory` | ✅ Full | Covers relation, condition, diagnosisAge, isDeceased, notes. |
| **RiskAssessment** | `RiskPrediction` | ✅ Full | Covers riskType, riskScore, riskLevel, drivers, recommendedActions, predictionType. |
| **Goal** | `HealthGoal` | ✅ Full | Covers title, description, category, targetValue, currentValue, startDate, targetDate, status. |
| **BodyStructure** | ❌ Missing | ❌ Missing | No dedicated body structure model. Body sites are stored as strings in `Condition.bodySite` and `ProcedureRecord.bodySite`. |
| **Schedule / Slot** | `DoctorClinic` (slots as JSON) | ❌ Missing | Slots are stored as weekly JSON blobs (mondaySlots, etc.), not as a normalized FHIR `Slot` resource. |
| **Endpoint** | ❌ Missing | ❌ Missing | No endpoint registry for provider connections. |

---

## 2. FHIR Terminology & Coding

| FHIR Element | WyshCare Status | Gap |
|---|---|---|
| LOINC codes for labs | ❌ Missing | `LabResult.testName` is a free-text string. No LOINC coding. |
| ICD-10 codes | ✅ Partial | `Condition.icdCode` exists, `codeSystem` defaults to `"ICD-10-EN"`. Coverage is partial — not all Conditions may use ICD. |
| SNOMED CT codes | ✅ Partial | `ProcedureRecord.codeSystem` defaults to `"SNOMED"`. `code` field exists. |
| RxNorm / ATC codes | ✅ Partial | `Drug.rxNormCode` and `Drug.atcCode` exist but may not be populated. |
| CVX codes for vaccines | ✅ Partial | `Immunization.cvxCode` field exists. |

**Rating: ⚠️ Partial** — Fields exist for standard coding systems but there is no enforcement or validation requiring coded values.

---

## 3. FHIR REST API Compliance

| FHIR Interaction | WyshCare Status | Gap |
|---|---|---|
| `read` (GET by ID) | ✅ Available | All controllers provide `GET /:id` endpoints. |
| `search` (GET with params) | ✅ Available | Multiple search endpoints exist (by patient, by status, by type). |
| `create` (POST) | ✅ Available | Standard NestJS `@Post()` controllers. |
| `update` (PUT) | ⚠️ Partial | Some controllers use `PATCH` but not all support full PUT semantics. |
| `delete` (DELETE) | ⚠️ Partial | Soft-delete via `deletedAt` on some models. No hard delete endpoints. |
| `patch` (PATCH) | ⚠️ Partial | `consent.controller.ts` uses `PATCH :id/revoke`. Not universally available. |
| FHIR JSON format | ❌ Missing | All endpoints return custom JSON shapes, not FHIR resource JSON. |
| `_id`, `_lastUpdated` search params | ❌ Missing | No FHIR-standard search parameters implemented. |
| `history` interaction | ❌ Missing | No resource version history endpoints. |
| Bundle responses | ❌ Missing | Responses are plain JSON arrays, not FHIR `Bundle` resources. |

**Rating: ⚠️ Partial** — RESTful CRUD exists but API shapes are not FHIR-compliant.

---

## 4. FHIR Model Alignment Scorecard

| Category | Total Resources | Covered | Partial | Missing | Coverage % |
|---|---|---|---|---|---|
| Clinical | 6 | 4 | 2 | 0 | 67% |
| Medications | 3 | 2 | 1 | 0 | 67% |
| Diagnostics | 2 | 0 | 2 | 0 | 0% |
| Workflow | 4 | 3 | 0 | 1 | 75% |
| Financial | 2 | 2 | 0 | 0 | 100% |
| Conformance | 1 | 0 | 0 | 1 | 0% |
| **Total** | **18** | **11** | **5** | **2** | **61%** |

---

## 5. Summary & Remediation Roadmap

| Gap | Priority | Remediation |
|---|---|---|
| Missing `Observation.code` (LOINC) | HIGH | Add `loincCode` field to `LabResult` and `VitalsRecord`; create a LOINC code lookup table or integration. |
| Missing `MedicationRequest.intent` | MEDIUM | Add `intent` field to `Prescription` (order, plan, proposal, etc.). |
| Flat diagnostics model | HIGH | Link `DiagnosticReport.result` as structured array of Observation references. |
| No FHIR REST API | MEDIUM | Create a FHIR facade layer (`backend/src/modules/fhir/`) that translates internal models to FHIR R4 JSON. |
| No Schedule/Slot resource | LOW | Normalize `DoctorClinic` weekly slot JSON into a `Slot` model. |
| No CareTeam resource | LOW | Create `CareTeam` and `CareTeamMember` models. |
| No BodyStructure resource | LOW | Create `BodyStructure` model referencing `Condition.bodySite` and `ProcedureRecord.bodySite`. |
| Code systems not enforced | MEDIUM | Add validation middleware that requires coded values for LOINC, ICD-10, SNOMED where applicable. |
| No `_history` endpoint | LOW | Implement resource history using `AuditLog` snapshot mechanism. |
| No Bundle responses | MEDIUM | Wrap list endpoints in FHIR `Bundle` structure. |

### Recommendation
The Prisma schema shows strong FHIR alignment at the data model level (61% coverage of core resources). The critical gaps are (1) missing LOINC coding for observations, (2) no FHIR JSON serialization layer, and (3) flat diagnostics without structured observation references. Building a `FHIRTranslatorService` that maps internal models to FHIR R4 resources would resolve the most impactful gaps without requiring schema changes.
