# WYSHCARE — SYSTEM MAP (SOURCE OF TRUTH)

This document defines the **final architecture map** of WyshCare EHR/EMR.
All development must align with this map.

--------------------------------------------------
IDENTITY MODEL (LOCKED)
--------------------------------------------------

Person (Real Human)
 ├─ Patient (patientWyshId)
 └─ Staff (staffWyshId)
      ├─ Doctor
      ├─ Nurse
      ├─ Lab
      ├─ Pharmacy
      ├─ Insurer
      └─ Admin

❗ Patient and Staff identities are NEVER mixed.

--------------------------------------------------
BACKEND STRUCTURE
--------------------------------------------------

backend/
├── app.js                         # Express bootstrap (routes only)
├── db.js                          # Prisma client
├── prisma/
│   └── schema.prisma              # LOCKED DATA MODEL
│
├── middleware/
│   ├── auth.middleware.js         # Identity-safe auth
│   └── rateLimit.middleware.js
│
├── services/
│   ├── encounter.service.js
│   ├── clinical-note.service.js
│   ├── clinical-order.service.js
│   ├── prescription.service.js
│   ├── medication-reconciliation.service.js
│   ├── allergy.service.js
│   ├── immunization.service.js
│   ├── problem.service.js
│   ├── discharge.service.js
│   ├── lab.service.js
│   ├── audit.service.js
│   ├── ai.service.js
│   └── ai-logger.service.js
│
├── routes/
│   ├── user.routes.js
│   ├── patient.routes.js
│   ├── encounter.routes.js
│   ├── clinical-note.routes.js
│   ├── clinical-order.routes.js
│   ├── prescription.routes.js
│   ├── medication-reconciliation.routes.js
│   ├── allergy.routes.js
│   ├── immunization.routes.js
│   ├── problem.routes.js
│   ├── discharge.routes.js
│   ├── lab.routes.js
│   ├── audit.routes.js
│   └── timeline.routes.js
│
├── utils/
│   ├── wyshid.util.js
│   ├── crypto.util.js
│   └── fhir.mapper.js
│
└── sql/
    └── rls/                       # Supabase RLS (optional / later)

--------------------------------------------------
PHASE A — CLINICAL SAFETY & WORKFLOW (DONE)
--------------------------------------------------

✔ Encounters
✔ Vitals
✔ Clinical Notes (SOAP / Progress / Discharge)
✔ Orders (Lab / Radiology / Procedure)
✔ Prescriptions (Doctor-only)
✔ Medication Reconciliation
✔ Allergies
✔ Immunizations
✔ Problem List (Longitudinal)
✔ Discharge Summary
✔ Lab Results
✔ Audit Logging (Read / Write / AI)

--------------------------------------------------
PHASE B — PATIENT & INTEROPERABILITY (PLANNED)
--------------------------------------------------

◻ Patient Portal APIs
◻ Appointment Scheduling
◻ FHIR R4 Mapping
◻ HL7 / DICOM connectors
◻ External provider data ingestion

--------------------------------------------------
PHASE C — OPERATIONS & ANALYTICS (PLANNED)
--------------------------------------------------

◻ Billing Engine
◻ Insurance Claims (ERA)
◻ Dashboards
◻ Quality Metrics
◻ Predictive Safety Alerts

--------------------------------------------------
PHASE D — ECOSYSTEM (PLANNED)
--------------------------------------------------

◻ Telehealth
◻ Remote Monitoring
◻ Mobile App
◻ Third-party Marketplace

--------------------------------------------------
ENGINEERING RULES (NON-NEGOTIABLE)
--------------------------------------------------

1. schema.prisma is LOCKED
2. No identity mixing (patient ≠ staff)
3. All writes go through services
4. Routes = validation + orchestration only
5. Audit everything meaningful
6. Additive changes only

--------------------------------------------------
END OF MAP
--------------------------------------------------