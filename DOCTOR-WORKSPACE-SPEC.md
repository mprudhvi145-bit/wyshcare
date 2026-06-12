# WyshCare Doctor Platform — Multi-Specialty Clinical OS

> Master specification for the most advanced multi-specialty clinical operating system.

---

## Design Principles

1. **Zero orphan screens** — every UI component maps to a DB table, API route, and workflow
2. **No mock data in production widgets** — every card pulls from a real endpoint
3. **Context never lost** — patient context bar persists across all screens
4. **Every click triggers a workflow** — not a navigation event

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      SHARED SHELL                                │
│  ┌─────────────┐  ┌──────────────────────────────────────────┐  │
│  │  Sidebar    │  │  Patient Context Bar                      │  │
│  │  ─────────  │  │  [Photo] [Name] [Age] [Risk] [Allergies] │  │
│  │  Dashboard  │  │  [Conditions] [Insurance] [Timeline ▸]   │  │
│  │  Patients   │  ├──────────────────────────────────────────┤  │
│  │  Appts      │  │                                          │  │
│  │  Consults   │  │         SPECIALTY WORKSPACE              │  │
│  │  Telemed    │  │         ┌──────────────────────────┐     │  │
│  │  Messages   │  │         │ Interactive Tooth Chart  │     │  │
│  │  Labs       │  │         │ Treatment Plan           │     │  │
│  │  Imaging    │  │         │ Radiographs              │     │  │
│  │  Referrals  │  │         │ SOAP Notes               │     │  │
│  │  Revenue    │  │         │ AI Copilot               │     │  │
│  │  Settings   │  │         └──────────────────────────┘     │  │
│  │  AI Copilot │  │                                          │  │
│  └─────────────┘  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Layer Contract

Every UI widget must declare:

| Property | Description |
|----------|-------------|
| **Table** | Primary DB model (e.g., `SpecialtyFinding`) |
| **Query** | API call to fetch (e.g., `GET /specialties/dental/findings/:patientId?category=tooth_condition`) |
| **Mutation** | API call to save (e.g., `POST /specialties/dental/encounters`) |
| **Index** | Required DB index (e.g., `@@index([patientId, specialtyCode, createdAt])`) |
| **Cache** | Client cache strategy (e.g., `stale-while-revalidate 30s`) |
| **Offline** | Offline fallback (e.g., `localStorage + sync queue`) |
| **Realtime** | Subscription (e.g., `ws://findings/updated`) |
| **FHIR** | Corresponding FHIR resource (e.g., `Observation`, `Condition`) |
| **Audit** | Audit log event (e.g., `FINDING_CREATED`, `TREATMENT_APPROVED`) |
| **Billing** | Billing trigger (e.g., `InvoiceItem.created`) |

---

## Shared Shell Components

### Patient Context Bar

| Element | Source | API |
|---------|--------|-----|
| Photo | `User.avatarUrl` | `GET /patients/:id/profile` |
| Name | `User.fullName` | Same |
| Age | Computed from `User.dob` | Same |
| Risk Score | `DigitalTwin.riskScore` | `GET /patients/:id/digital-twin` |
| Allergies | `Allergy[]` | `GET /patients/:id/allergies` |
| Conditions | `Condition[]` | `GET /patients/:id/conditions` |
| Insurance | `Coverage[]` | `GET /patients/:id/coverage` |
| Emergency Contacts | `EmergencyContact[]` | `GET /patients/:id/emergency-contacts` |
| Timeline Shortcut | N/A | `router.push('/patients/:id/timeline')` |

### AI Copilot Sidebar

| Feature | Source | Trigger |
|---------|--------|---------|
| SOAP Generation | `POST /ai/soap/generate` | On encounter save |
| Differential Dx | `POST /ai/differential` | On diagnosis input |
| Clinical Coding | `POST /ai/coding/suggest` | On procedure selection |
| Risk Alerts | `GET /ai/risk/alerts/:patientId` | On patient select |
| Treatment Recommender | `POST /ai/treatment/recommend` | On condition entry |

---

## Specialty: Dental OS

### Schema Map

| UI Component | DB Table | API Endpoint | FHIR Resource |
|-------------|----------|-------------|---------------|
| Tooth Chart | `SpecialtyFinding` (category: `tooth_condition`) | `GET /specialties/dental/tooth-chart` | `Observation` (LOINC: 27809-2) |
| Tooth Condition | `SpecialtyFinding` (findingKey = FDI#) | `POST /specialties/dental/encounters` | `Condition` (SNOMED) |
| Treatment Plan | `SpecialtyFinding` (category: `treatment_plan`) | `POST /specialties/dental/encounters` | `CarePlan` |
| Procedure | `InvoiceItem` | `POST /billing/invoice-items` | `Procedure` (CDT) |
| Radiograph | `ImagingStudy` | `GET /imaging/studies/:patientId` | `ImagingStudy` |
| Prescription | `Prescription` | `POST /prescriptions` | `MedicationRequest` |
| SOAP Notes | `Encounter` (via `SpecialtyEncounterData`) | `POST /specialties/dental/encounters` | `DocumentReference` |
| AI Diagnosis | `DigitalTwin.aiSuggestions` | `POST /ai/dental/analyze` | N/A |

### API Contracts (Dental)

#### `GET /specialties/dental/tooth-chart`
Returns 32 FDI teeth with metadata.

```json
{
  "teeth": [
    { "number": 11, "name": "Upper Right Central Incisor", "quadrant": "UR", "type": "incisor" },
    { "number": 18, "name": "Upper Right Third Molar", "quadrant": "UR", "type": "molar" },
    ...
  ]
}
```

#### `GET /specialties/dental/procedures?category=restorative`
Returns CDT codes.

```json
{
  "procedures": [
    { "code": "D2330", "name": "Resin-based composite, one surface", "category": "restorative", "cost": 150 },
    ...
  ]
}
```

#### `POST /specialties/dental/encounters`
Saves tooth findings + treatment plan atomically.

```json
{
  "encounterId": "enc-abc123",
  "patientId": "pat-001",
  "providerId": "prov-001",
  "findings": [
    { "category": "tooth_condition", "findingKey": "26", "findingValue": { "condition": "caries", "notes": "Deep distal caries" }, "severity": "moderate" },
    { "category": "treatment_plan", "findingKey": "26-D2330", "findingValue": { "tooth": 26, "procedure": "D2330", "cost": 150, "priority": "urgent" }, "severity": "moderate" }
  ],
  "data": {
    "chiefComplaint": "Pain in lower right tooth",
    "diagnosis": "Dental caries #26",
    "treatmentPlan": "Resin composite filling #26"
  }
}
```

### FHIR Mappings

| Dental Concept | FHIR Resource | Key Fields |
|---------------|---------------|------------|
| Tooth #26 | `BodySite` | code: `FDI:26`, modifier: `permanent` |
| Caries on #26 | `Condition` | code: SNOMED `80967004`, bodySite: `FDI:26` |
| Resin filling | `Procedure` | code: CDT `D2330`, bodySite: `FDI:26` |
| Bitewing X-ray | `ImagingStudy` | modality: `DX`, bodySite: `FDI:26` |
| Treatment Plan | `CarePlan` | category: `dental`, intent: `plan` |

### Workflow: Complete Dental Visit

```
Patient Search → Select Patient → Start Encounter
                                    │
                                    ├── Tooth Chart (examine each tooth)
                                    │     └── Select tooth → Set condition → Add notes
                                    │
                                    ├── Radiographs (view/upload)
                                    │     └── Attach to encounter
                                    │
                                    ├── Diagnosis (from findings + AI)
                                    │     └── AI suggests differentials + codes
                                    │
                                    ├── Treatment Plan (procedures + costs)
                                    │     ├── AI recommends treatment sequence
                                    │     └── Status: pending → approved → completed
                                    │
                                    ├── Prescription (if needed)
                                    │     └── Antibiotics, analgesics, mouthwash
                                    │
                                    ├── SOAP Notes (AI-generated, editable)
                                    │     └── Auto-populated from chart findings
                                    │
                                    ├── Billing (invoice from treatment plan)
                                    │     └── Insurance claim if applicable
                                    │
                                    └── Follow-up (schedule next visit)
                                          └── AI recommends follow-up interval
```

### Audit Events (Dental)

| Event | Trigger | Payload |
|-------|---------|---------|
| `TOOTH_CONDITION_SET` | Tooth status change | `{ tooth: 26, from: "healthy", to: "caries" }` |
| `TREATMENT_PLANNED` | Procedure added | `{ tooth: 26, procedure: "D2330", cost: 150 }` |
| `TREATMENT_APPROVED` | Plan approved | `{ encounterId, planId }` |
| `TREATMENT_COMPLETED` | Procedure done | `{ encounterId, tooth, procedure }` |
| `RADIOGRAPH_UPLOADED` | X-ray attached | `{ studyId, tooth, view }` |
| `PRESCRIPTION_WRITTEN` | Rx issued | `{ encounterId, medication }` |
| `INVOICE_GENERATED` | Bill created | `{ encounterId, total, items[] }` |
| `ENCOUNTER_CLOSED` | Visit ended | `{ encounterId, duration, diagnosis }` |
| `AI_SUGGESTION_ACCEPTED` | AI output used | `{ suggestionId, type, accepted }` |

### Indexes Required

```sql
-- Dental-specific indexes (already exist in SpecialtyFinding)
CREATE INDEX idx_finding_patient_specialty_date ON "SpecialtyFinding" ("patientId", "specialtyCode", "createdAt" DESC);
CREATE INDEX idx_finding_encounter ON "SpecialtyFinding" ("encounterId");
CREATE INDEX idx_finding_tooth ON "SpecialtyFinding" ("specialtyCode", "category", "findingKey");

-- Additional needed indexes
CREATE INDEX idx_encounter_patient_closed ON "Encounter" ("patientId", "status", "createdAt" DESC);
CREATE INDEX idx_invoice_encounter ON "Invoice" ("encounterId");
CREATE INDEX idx_imaging_patient ON "ImagingStudy" ("patientId", "started" DESC);
```

### State Management (Zustand Stores)

```typescript
interface DentalWorkspaceStore {
  // Entity state
  selectedPatient: Patient | null;
  toothStatuses: Record<number, ToothStatus>;  // key = FDI number
  treatmentPlan: TreatmentRow[];
  radiographs: ImagingStudy[];
  activeEncounter: Encounter | null;

  // UI state
  selectedTooth: number | null;
  activeTab: 'chart' | 'treatment' | 'radiography' | 'soap' | 'billing';
  isSaving: boolean;

  // Actions
  selectPatient: (patient: Patient) => Promise<void>;
  loadToothHistory: (patientId: string) => Promise<void>;
  setToothStatus: (tooth: number, status: ToothStatus) => void;
  addProcedure: (row: TreatmentRow) => void;
  saveEncounter: () => Promise<void>;
  generateSOAP: () => Promise<SoapNote>;
  triggerBilling: () => Promise<Invoice>;
}
```

### AI Integration Points (Dental)

| AI Service | Input | Output | Integration |
|-----------|-------|--------|-------------|
| Caries Detection | Tooth chart + radiograph | `{ tooth: 26, probability: 0.92 }` | Visible on tooth chart |
| Bone Loss Analysis | Panoramic X-ray | `{ region: "mandibular", loss: "moderate" }` | Treatment plan |
| Treatment Recommender | Tooth conditions + history | `[{ procedure: "D2330", confidence: 0.95 }]` | Treatment plan suggestions |
| SOAP Generator | Tooth findings + treatment | `{ subjective, objective, assessment, plan }` | SOAP tab |
| Coding Assistant | Procedures + diagnosis | `[{ code: "D2330", system: "CDT" }]` | Billing codes |
| Follow-up Predictor | Treatment + patient profile | `{ interval: "3 months", reason: "..." }` | Follow-up scheduling |

### Component Tree (Dental OS)

```
DentalWorkspace (page)
├── PatientContextBar (global)
│   ├── PatientAvatar
│   ├── PatientInfo (name, age, gender)
│   ├── RiskBadge
│   ├── AllergyList (compact)
│   ├── ConditionList (compact)
│   ├── InsuranceBadge
│   └── TimelineButton
├── WorkspaceHeader
│   ├── SpecialtyIcon + Title
│   ├── EncounterTimer
│   └── SaveButton
├── TabBar
│   ├── ToothChartTab
│   ├── RadiographyTab
│   ├── TreatmentPlanTab
│   ├── SOAPTab
│   └── BillingTab
├── ToothChartPanel
│   ├── FDIChart (SVG interactive)
│   │   ├── UpperArch
│   │   ├── LowerArch
│   │   └── ToothBlock (×32)
│   ├── ToothInspector (slide-in)
│   │   ├── ConditionSelector
│   │   ├── ProcedureSelector
│   │   ├── NotesInput
│   │   ├── RadiographLink
│   │   └── AIAnalysis
│   └── Legend
├── RadiographyPanel
│   ├── StudyList
│   │   └── RadiographCard (×N)
│   ├── UploadButton
│   └── ViewerModal
├── TreatmentPlanPanel
│   ├── ProcedureTable
│   │   ├── ProcedureRow (×N)
│   │   │   ├── ToothSelect
│   │   │   ├── CDTCodeSelect
│   │   │   ├── CostInput
│   │   │   ├── PrioritySelect
│   │   │   └── StatusBadge
│   │   └── AddProcedureButton
│   ├── TotalCostSummary
│   ├── AISuggestions
│   └── ApprovePlanButton
├── SOAPPanel
│   ├── AIGenerateButton
│   ├── SubjectiveSection
│   ├── ObjectiveSection (auto from chart)
│   ├── AssessmentSection (auto from diagnosis)
│   └── PlanSection (auto from treatment plan)
├── BillingPanel
│   ├── InvoiceItems (from treatment plan)
│   ├── InsuranceCoverage
│   └── GenerateInvoiceButton
└── AICopilotSidebar
    ├── AIAssistantHeader
    ├── SuggestionList
    │   └── SuggestionCard (×N)
    ├── RiskAlerts
    └── QuickActions
```

---

## Breakpoint Strategy

| Breakpoint | Layout | Behavior |
|-----------|--------|----------|
| 320-390 | Single column | Sidebar hidden (burger), tabs collapse |
| 391-768 | Single column | Tab bar visible, panels stack |
| 769-1024 | 2-column | Tooth chart + treatment side by side |
| 1025-1280 | 2-column + sidebar | Copilot visible |
| 1281-1728 | 3-column | Full workspace |
| 1729+ | 3-column + margins | Max-width constrained, centered |

---

## Quality Gates

Every component must pass:

- [ ] **Data bound**: Connects to a real API endpoint
- [ ] **Loading state**: Shows skeleton/spinner
- [ ] **Error state**: Shows error with retry
- [ ] **Empty state**: Shows meaningful empty state
- [ ] **Offline state**: Queues mutations
- [ ] **Audit trail**: Logs all data-changing events
- [ ] **Keyboard nav**: Full keyboard accessibility
- [ ] **Screen reader**: ARIA labels on all interactive elements
- [ ] **Performance**: < 100ms interaction response
- [ ] **Mobile**: No horizontal scroll at any breakpoint
