# ADR-005: EHR/EMR Data Architecture

**Status:** Accepted  
**Date:** 2026-06-12  
**Deciders:** Vimarshak Prudhvi  
**Tags:** emr, ehr, clinical, fhir, prisma

---

## Context

WyshCare must store and process comprehensive electronic health record (EHR) data including:
- Patient demographics, conditions, allergies, medications, immunizations
- Clinical encounters, notes, orders, procedures, diagnoses
- Lab results, diagnostic reports, imaging data
- Care plans, health goals, adherence tracking
- Digital twin health scoring and risk prediction
- ABDM (Ayushman Bharat Digital Mission) compliance for India
- Insurance claims and billing data tied to clinical encounters

## Decision Drivers

- **ABDM compliance:** Must support FHIR R4 resource formats for PHR (Personal Health Record) interoperability
- **Legacy migration:** Supporting existing Prisma models already in production
- **Digital Twin:** Health graph v2, clinical twin, and prediction engines need normalized, queryable data
- **Existing investment:** 120+ Prisma models, 47 enums, established NestJS services
- **Flexibility:** Must support both structured clinical data and free-text notes/documents

## Considered Options

| Option | Pros | Cons |
|--------|------|------|
| **Current Prisma-native (custom)** | Full control; already implemented; optimized for query patterns | Not FHIR-native; requires mapping layer for ABDM |
| **FHIR-native (e.g., HAPI FHIR)** | Standards-compliant; ABDM-ready; interoperable | Inflexible schema; steep learning curve; poor fit for WyshCare's digital twin / health graph models |
| **openEHR** | Strong clinical modeling; vendor-independent | Heavyweight; small community; over-engineered for this use case |
| **Hybrid: Prisma core + FHIR mapping layer** | Best of both worlds: flexible models + standard compliance | Mapping layer is additional code; dual schema maintenance |

## Decision

**Use the existing Prisma-native schema** as the primary data store, with a FHIR mapping layer for ABDM exchange and external interoperability.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Application Layer                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ Clinical Services│  │ Digital Twin  │  │ ABDM/FHIR Mapping Layer│  │
│  │ - Encounters     │  │ Engines:      │  │ (Prisma → FHIR R4)    │  │
│  │ - Orders          │  │ - HealthScore│  ├────────────────────────┤  │
│  │ - Notes           │  │ - RiskPredict│  │ FHIR resources:       │  │
│  │ - Medications     │  │ - CareGap    │  │ Patient, Condition,   │  │
│  │ - Immunizations   │  │ - Adherence  │  │ Observation,          │  │
│  │ - Allergies       │  │ - Readiness  │  │ MedicationRequest,    │  │
│  │ - Procedures      │  │ - Lifestyle  │  │ DiagnosticReport,     │  │
│  └─────────────────┘  └──────────────┘  │ Encounter, etc.        │  │
│                                           └────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Prisma Schema (PostgreSQL)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────┐  ┌────────────────┐  ┌──────────────────┐ │
│  │ Clinical Core         │  │ Health Graph v2 │  │ Digital Twin      │ │
│  │ Encounter             │  │ LifestyleProfile │  │ DigitalTwin       │ │
│  │ Condition (ICD-10)    │  │ SymptomEvent    │  │ CareGap           │ │
│  │ Allergy               │  │ WearableMetric  │  │ RiskPrediction    │ │
│  │ Medication            │  │ FamilyHistory   │  │ TwinScoreHistory  │ │
│  │ Immunization          │  │ PreventiveRec   │  │ TwinMetricHistory │ │
│  │ ProcedureRecord       │  │ HealthGoal      │  │ HealthScore       │ │
│  │ ClinicalNote          │  │                │  │ HealthAnalytics   │ │
│  │ ClinicalOrder         │  │                │  │ HealthGraphNode   │ │
│  │ ClinicalDocument      │  │                │  │ HealthGraphEdge   │ │
│  │ CDSAlert              │  │                │  │ AIRecommendation  │ │
│  └──────────────────────┘  └────────────────┘  └──────────────────┘ │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Core Clinical Models

**Encounter** is the central clinical workflow unit:
- Links to `Condition` (diagnoses) via `EncounterDiagnosis`
- Links to `ClinicalNote` via `EncounterNote`
- Links to `ClinicalOrder` via `EncounterOrder`
- Links to `ProcedureRecord` via `EncounterProcedure`
- Classified by `EncounterClass`: OUTPATIENT, INPATIENT, EMERGENCY, TELEMEDICINE, HOME_CARE
- Supports encounter-period tracking (`periodStart`, `periodEnd`)

**Key Clinical Relationships:**
```
Encounter
  ├── EncounterDiagnosis → Condition (ICD-10 coded)
  ├── EncounterNote → ClinicalNote (SOAP, H&P, progress, discharge)
  ├── EncounterOrder → ClinicalOrder (lab, imaging, medication, procedure, referral)
  ├── EncounterProcedure → ProcedureRecord (SNOMED coded)
  ├── ClinicalDocument (uploaded reports, scans)
  ├── SpecialtyEncounterData (specialty-specific structured data)
  └── SpecialtyFinding (specialty-specific clinical findings)
```

### Digital Twin Architecture

The Digital Twin comprises 7 engines operating over the clinical core:

| Engine | Input Sources | Output |
|--------|--------------|--------|
| **HealthScore Engine** | Vitals, Lifestyle, Lab Results, Adherence | `HealthScore` (overall + 7 sub-scores) |
| **RiskPrediction Engine** | Conditions, Labs, Demographics, Family History | `RiskPrediction` (12 risk types) |
| **CareGap Engine** | Guidelines, Conditions, Last Screening Dates | `CareGap` (8 gap categories) |
| **Adherence Engine** | MedicationSchedule, AdherenceLog | Adherence score, interventions |
| **Readiness Engine** | EmergencyProfile, Lifestyle, Recent Activity | Readiness score |
| **Lifestyle Engine** | LifestyleProfile, WearableMetric, SymptomEvent | Lifestyle insights |
| **Health Graph v2 Engine** | All of the above → Knowledge graph | `HealthGraphNode`, `HealthGraphEdge`, `AIRecommendation` |

### Prisma Coding Systems

- Conditions coded in `ICD-10-EN` (extensible to ICD-10-IND for India)
- Procedures coded in `SNOMED CT` via `codeSystem` field
- Medications coded via `rxNormCode` and `atcCode` on `Drug` model
- Immunizations coded via `cvxCode` on `Immunization` model
- Lab tests identified via `testName` on `LabResult` with mapping to LOINC (future)

### ABDM Compliance

- `ABDMLinkage`, `AbhaProfile`, `AbdmConsent`, `CareContext` models handle ABDM-specific data
- `HealthInformationRequest`/`HealthInformationTransfer` manage PHR data flow
- FHIR mapping layer converts Prisma models to FHIR R4 resources for ABDM gateway communication
- `AbdmAuditLog` tracks all ABDM API interactions

### FHIR Mapping Strategy

Not built as a full FHIR server. Instead, a focused mapper translates:
- `User` + `AbhaProfile` → `FHIR Patient`
- `Condition` → `FHIR Condition`
- `Medication` + `Prescription` → `FHIR MedicationRequest`
- `DiagnosticReport` + `LabResult` → `FHIR DiagnosticReport` + `FHIR Observation`
- `Encounter` → `FHIR Encounter`
- `Immunization` → `FHIR Immunization`
- `Allergy` → `FHIR AllergyIntolerance`
- `ProcedureRecord` → `FHIR Procedure`

Mapping is used only at ABDM sync boundaries, not for read/write paths.

## Consequences

**Positive:**
- Prisma-native schema provides full query flexibility for Digital Twin engines
- FHIR mapping layer enables ABDM compliance without sacrificing model ergonomics
- Health Graph v2 enables graph-based clinical reasoning and recommendation
- 7 Digital Twin engines can be developed and deployed independently
- ICD-10 + SNOMED coding enables clinical interoperability

**Negative:**
- FHIR mapping is one-directional (Prisma → FHIR); reverse sync requires additional work
- Clinical data is spread across 30+ models — complex queries need deep schema knowledge
- No native FHIR subscription/notification mechanism (must be built)
- Coding system validation (ICD-10, SNOMED, LOINC) is manual — no built-in terminology server

**Mitigations:**
- FHIR reverse mapping (ABDM → Prisma) handled via `AbhaProfile` and `CareContext` sync processes
- Complex clinical views aggregated via Materialized Views (future)
- `ClinicalTwinService` and `HealthGraphService` provide high-level APIs that abstract schema complexity
- Terminology service (future) will validate codes against ICD-10-IND and SNOMED-CT India
