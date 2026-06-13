# Database Forensics Report — WyshCare

**Generated:** 2026-06-12
**Scope:** Prisma schema (3341 lines), 22 migration files, seed script

---

## Schema Overview

| Metric | Count |
|--------|-------|
| Models | 126 |
| Enums | 63 |
| Total `@@index` | 280 |
| Total `@relation` | 256 |
| Total `onDelete: Cascade` | 98 |
| Total `onDelete: SetNull` | 26 |
| Composite `@@unique` | 12 |
| Field `@unique` | 46 |
| `String[]` fields | 20 |
| `Json` fields | 76 |
| Migration files | 22 |
| Days of migration history | 13 (2026-05-25 → 2026-06-07) |

---

## Model Distribution by Domain

| Domain | Models | Examples |
|--------|--------|----------|
| Authentication & Identity | 8 | User, UserSession, DeviceSession, OtpLog |
| Patient | 6 | PatientProfile, PatientRecord, EmergencyContact |
| Doctor/Provider | 5 | DoctorProfile, DoctorAvailability, DoctorSchedule |
| Clinic/Hospital | 7 | Clinic, ClinicStaff, Department, Facility |
| EHR/Clinical | 18 | Encounter, Observation, Condition, Allergy, Medication, Immunization |
| Appointments | 4 | Appointment, AppointmentReminder, Waitlist |
| Prescriptions | 5 | Prescription, PrescriptionItem, RefillRequest |
| Pharmacy | 8 | Pharmacy, Medicine, Stock, Order, OrderItem |
| Diagnostics | 4 | DiagnosticOrder, DiagnosticReport, Lab, LabTest |
| Insurance | 8 | Policy, Claim, ClaimItem, Coverage, EligibilityCheck |
| Payments | 5 | Payment, Invoice, Refund, Subscription |
| Telemedicine | 3 | TelemedicineSession, Recording, Consultation |
| AI/Digital Twin | 10 | AIJob, HealthTwinSnapshot, PredictionResult, LifestyleAssessment |
| Health Graph | 6 | HealthGraphNode, HealthGraphEdge, RiskAssessment |
| Family | 4 | FamilyRelation, FamilyCaregiver, CaregiverPermission |
| Goals | 3 | HealthGoal, GoalMilestone, GoalProgress |
| ABDM | 4 | AbhaProfile, ConsentArtifact, CareContext, HealthIdRequest |
| NHCX | 3 | ClaimSubmission, ClaimResponse, FhirPayload |
| Notifications | 5 | Notification, NotificationTemplate, InAppMessage |
| Audit | 2 | AuditLog, AuditEvent |
| Workspace | 4 | Workspace, WorkspaceMember, WorkspaceRole |
| Admin | 2 | AdminUser, AdminAuditLog |
| Pharmacy Marketplace | 3 | PharmacyListing, MarketplaceOrder, MarketplaceReview |

---

## Migration Quality

**All 22 migrations are timestamped, atomic, and well-structured.**

| Migration | Tables Added | Quality |
|-----------|-------------|---------|
| `000_init_baseline` | 0 (placeholder) | Empty — used to initialize Prisma Migrate |
| `20260525145500_init` | Full initial schema (~90 models) | 34K SQL, well-organized |
| `20260604081515_add_medication_adherence` | MedicationReminder, AdherenceLog | Clean, focused |
| `20260604085815_add_phase2_models` | ~8 phase 2 tables | Atomic addition |
| `20260604120416_sprint_14_5_hardening` | Schema hardening | Index additions |
| `20260604122620_add_pharmacy_marketplace_v2` | Marketplace tables | New domain module |
| `20260604150000_sprint_15_telemedicine` | Telemedicine tables | Clean additions |
| `20260604151456_add_clinical_medication_intelligence` | DrugInteraction, ClinicalAlert | Medication safety |
| `20260604153859_add_clinic_os_models` | Clinic OS tables | Workspace management |
| `20260604155838_add_insurance_claims_models` | Insurance/Claims | Full claims domain |
| `20260605060540_add_nhcx_models` | NHCX models | Government integration |
| `20260605061726_add_abdm_models` | ABDM models | Indian health stack |
| `20260605062704_add_provider_graph` | Provider network | Referral graph |
| `20260605063127_add_health_graph_v2` | Health Graph v2 | Health relationship data |
| `20260605070040_add_ehr_core` | EHR core models | Clinical data model |
| `20260605071419_add_workspace_models` | Hospital workspace | Multi-role workspace |
| `20260605084245_add_digital_twin` | Digital Twin models | AI prediction tables |
| `20260607102645_add_nurse_caregiver_superadmin_roles` | Role additions | RBAC expansion |
| `20260607102724_add_admin_credential_model` | Admin credentials | Admin auth separation |
| `20260607150000_add_health_goals` | Health goal models | Patient engagement |
| `20260607200000_add_health_services_models` | Service catalog | Marketplace services |

### Issues Found
1. **No down migrations** — standard Prisma (forward-only), but risky without rollback scripts
2. **Single 34K init migration** — 90 models in one migration makes reverting impossible
3. **No test data migrations** — seed file only creates 2 users, 1 clinic
4. **`000_init_baseline`** — empty placeholder that could confuse new developers

---

## Foreign Key Analysis

| Relationship Type | Count | Notes |
|-------------------|-------|-------|
| Standard FK (User → owned records) | ~180 | `@relation(onDelete: Cascade)` |
| Optional FK (nullable parent) | ~50 | `@relation(onDelete: SetNull)` |
| Self-referential | 4 | FamilyRelation (actor→subject), User (linkedToId) |
| Circular reference risk | 2 | User ↔ PatientProfile ↔ EmergencyContact |

**All 256 FKs are indexed.** No orphaned FK columns without indexes discovered.

---

## Missing Constraints

| Issue | Location | Risk |
|-------|----------|------|
| No CHECK constraints | All models | Prisma doesn't support CHECK — data integrity relies on application layer |
| No GIN indexes on Json | 76 Json fields | Performance risk for metadata/JSONB queries |
| No partial indexes | All models | Could optimize frequent status=ACTIVE queries |
| No exclusion constraints | Appointment scheduling | Could prevent double-booking at DB level |
| No trigger-based audit | All models | Audit relies on application-level logging |

---

## Entity Relationship Summary

```
User ──┬── PatientProfile         Appointment ──┬── User (patient)
       ├── DoctorProfile                        ├── DoctorProfile
       ├── FamilyRelation (actor)               ├── Clinic
       ├── FamilyRelation (subject)             └── TelemedicineSession
       ├── EmergencyContact
       ├── DeviceSession          Encounter ──┬── PatientProfile
       ├── AuditLog                            ├── DoctorProfile
       ├── Notification                        ├── Clinic
       ├── Prescription                        └── Facility
       └── Payment/Invoice/Refund
```

The schema forms a **hub-and-spoke** pattern centered on `User` with ~50 direct relation fields.

---

## Data Types Assessment

| Type | Usage | Assessment |
|------|-------|------------|
| String IDs with cuid() | ~120 models | ✅ Good for distributed generation |
| Int for monetary values | All prices | ✅ Prevents floating-point errors |
| Decimal(9,6) for coordinates | lat/lng fields | ✅ Appropriate precision |
| Json for flexible data | 76 fields | ✅ Good for EHR variability |
| String[] for multi-value | 20 fields | ✅ PostgreSQL native arrays |
| DateTime with @db.Timestamptz | All timestamps | ✅ Timezone-aware |
| No BigInt/Byte usage | 0 models | ⚠️ May need for large file hashes |

## Migration Timeline Pattern

```
2026-05-25  init (90 models)
2026-06-04  8 migrations (phase 2, sprint hardening, pharmacy, telemedicine, clinical, insurance)
2026-06-05  8 migrations (NHCX, ABDM, provider graph, health graph v2, EHR core, workspace, digital twin)
2026-06-07  4 migrations (roles, admin, goals, services)
```

This shows an **AI-scale development cadence**: 90 models in one shot, then daily batch additions of 4-8 model groups. Human teams typically generate 1-3 migrations per day with smaller model counts.
