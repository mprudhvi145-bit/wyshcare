# Dental OS — Architecture & API Contracts

## Data Model (Prisma)

```prisma
// Already exists:
model SpecialtyEncounterData { ... }  // JSON blob per encounter
model SpecialtyFinding { ... }        // Structured: tooth_condition, treatment_plan
model ImagingStudy { ... }            // Radiographs
model Encounter { ... }               // Visit context
model Invoice { ... }                 // Billing

// Needed additions:
model DentalTreatmentPlan {
  id          String   @id @default(cuid())
  encounterId String
  patientId   String
  status      TreatmentPlanStatus // DRAFT, PENDING_APPROVAL, APPROVED, IN_PROGRESS, COMPLETED, CANCELLED
  totalCost   Decimal
  insuranceCoverage Decimal?
  patientShare      Decimal?
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  approvedAt  DateTime?
  completedAt DateTime?

  Encounter     Encounter @relation(fields: [encounterId], references: [id])
  Patient       User      @relation(fields: [patientId], references: [id])
  Procedures    TreatmentPlanProcedure[]
}

model TreatmentPlanProcedure {
  id             String   @id @default(cuid())
  planId         String
  toothNumber    Int      // FDI
  procedureCode  String   // CDT
  procedureName  String
  category       String
  cost           Decimal
  priority       String   // urgent, elective, cosmetic
  status         String   // planned, approved, in_progress, completed, cancelled
  completedAt    DateTime?
  note           String?

  Plan           DentalTreatmentPlan @relation(fields: [planId], references: [id], onDelete: Cascade)
}
```

## API Contracts

### Tooth Chart
```
GET /specialties/dental/tooth-chart → FDI tooth metadata
```

### Procedures (CDT Codes)
```
GET /specialties/dental/procedures?category=restorative → CDT codes with costs
```

### Encounter Save (with AI)
```
POST /specialties/dental/encounters
Body: {
  encounterId, patientId, providerId,
  findings: ToothCondition[],
  treatmentPlan: TreatmentRow[],
  data: { chiefComplaint, diagnosis, notes }
}
Response: { encounterData, findings, aiSuggestions }
```

### Treatment Plan
```
POST /specialties/dental/treatment-plans
Body: { encounterId, patientId, procedures: [{ toothNumber, procedureCode, cost, priority }] }
Response: { plan, totalCost }

PATCH /specialties/dental/treatment-plans/:id/status
Body: { status: "APPROVED" | "COMPLETED" | "CANCELLED" }
Response: { plan }

GET /specialties/dental/treatment-plans/:patientId
Response: { plans: DentalTreatmentPlan[] }
```

### AI
```
POST /ai/dental/analyze
Body: { patientId, toothStatuses, findings }
Response: {
  cariesDetections: [{ tooth, probability }],
  treatmentSuggestions: [{ procedureCode, confidence }],
  diagnosis: string,
  followUpInterval: string
}

POST /ai/soap/generate
Body: { patientId, encounterId, toothStatuses, treatmentPlan }
Response: { subjective, objective, assessment, plan }
```

### Billing
```
POST /billing/invoice-items
Body: { encounterId, items: [{ procedureCode, toothNumber, cost }] }
Response: { invoice }

GET /billing/invoices/:encounterId
Response: { invoice, items, total, status }
```

### Audit
```
POST /audit/log
Body: { event, entityType, entityId, actorId, payload }
Response: { logged: true }
```

## FHIR Mappings

| Dental Data | FHIR Resource | Mapping |
|-------------|---------------|---------|
| Tooth condition | `Condition` | code=SNOMED, bodySite=FDI tooth |
| Dental procedure | `Procedure` | code=CDT, bodySite=FDI tooth |
| Radiograph | `ImagingStudy` | modality=DX, bodySite=FDI tooth |
| Treatment plan | `CarePlan` | intent=plan, category=dental |
| Prescription | `MedicationRequest` | standard mapping |
| Invoice | `Invoice` | line items = procedures |
| Encounter | `Encounter` | type=dental, reason=diagnosis |

## Workflow: End-to-End Dental Visit

```
1. PATIENT SEARCH → GET /patients?search=name/phone
2. SELECT PATIENT → Patient context bar loads
3. START ENCOUNTER → POST /encounters
4. TOOTH CHARTING → Tooth by tooth: condition + notes
5. RADIOGRAPHS → GET /imaging/studies/:patientId
6. AI ANALYSIS → POST /ai/dental/analyze
7. DIAGNOSIS → Set primary diagnosis
8. TREATMENT PLAN → Add procedures → Approve
9. PRESCRIPTION → POST /prescriptions
10. SOAP GENERATION → POST /ai/soap/generate → Edit → Save
11. BILLING → Generate invoice from treatment plan items
12. FOLLOW-UP → Schedule next visit
13. CLOSE ENCOUNTER → PATCH /encounters/:id (status=completed)
```

## Indexes Required

```sql
CREATE INDEX idx_dental_plan_patient ON "DentalTreatmentPlan" ("patientId", "createdAt" DESC);
CREATE INDEX idx_dental_plan_procedure_tooth ON "TreatmentPlanProcedure" ("toothNumber");
CREATE INDEX idx_specialty_finding_category_key ON "SpecialtyFinding" ("category", "findingKey");
```
