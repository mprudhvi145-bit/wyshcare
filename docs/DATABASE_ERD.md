# Database ERD — Text-Based Entity Relationship Diagram

> Core entity relationships grouped by domain. Generated from Prisma schema.

---

## Domain: Auth & Identity

```
┌───────────────────────────────────────────────────────────────────┐
│                                                                   │
│                         ┌──────────────┐                          │
│                         │    User      │                          │
│                         │──────────────│                          │
│                         │ id (PK)      │──┐                       │
│                         │ wyshId       │  │                       │
│                         │ phoneNumber  │  ├──┐                    │
│                         │ email        │  │  │                    │
│                         │ fullName     │  │  │                    │
│                         │ tenantId     │◄─┘  │                    │
│                         │ roles[]      │     │                    │
│                         └──────┬───────┘     │                    │
│                                │              │                    │
│         ┌──────────────────────┼──────────────┼─────┐             │
│         │                      │              │     │             │
│         ▼                      ▼              ▼     ▼             │
│  ┌────────────┐    ┌─────────────┐    ┌───────────┐  ┌─────────┐ │
│  │ UserRole   │    │DeviceSession│    │RefreshToken│  │OtpChal- │ │
│  │─────────── │    │─────────────│    │───────────│  │lenge   │ │
│  │ userId (FK)│    │ userId (FK)  │    │ userId (FK)│  │─────────│ │
│  │ role       │    │ deviceFP     │    │ tokenHash  │  │userId(FK)│ │
│  └────────────┘    └─────────────┘    └───────────┘  │ phone     │ │
│                                                       └─────────┘ │
│  ┌──────────────┐  ┌─────────────┐  ┌───────────────┐             │
│  │AdminCredential│  │DoctorProfile│  │ProviderProfile│             │
│  │──────────────│  │─────────────│  │───────────────│             │
│  │ userId (FK)   │  │ userId (FK)  │  │ userId (FK)    │             │
│  │ passwordHash  │  │ specializat.│  │ regNumber      │             │
│  └──────────────┘  │ tenantId     │  │ kycMetadata    │             │
│                     └─────────────┘  └───────────────┘             │
│                                                                   │
│  ┌──────────────────┐                                             │
│  │ FamilyRelation   │                                             │
│  │──────────────────│                                             │
│  │ actorUserId (FK)─┼── User  (actor)                             │
│  │ subjectUserId(FK)┼── User  (subject)                           │
│  │ relationship     │                                             │
│  └──────────────────┘                                             │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Domain: Organizations

```
┌─────────────┐       ┌─────────────────┐       ┌──────────────────┐
│   Clinic    │       │  DoctorClinic   │       │  StaffAssignment │
│─────────────│       │─────────────────│       │──────────────────│
│ id (PK)     │◄──────│ clinicId (FK)   │       │ clinicId (FK)   │
│ name        │       │ doctorId (FK)   │       │ userId (FK)     │
│ slug        │       │ consultationFee │       │ role             │
│ phoneNumber │       │ slots[]         │       └──────────────────┘
│ city        │       └────────┬────────┘              ▲
│ pincode     │                │                       │
│ tenantId    │                │                       │
└─────────────┘                ▼                       │
                        ┌─────────────┐                │
                        │DoctorProfile│                │
                        │─────────────│────────────────┘
                        │ userId (FK) │
                        └─────────────┘
```

---

## Domain: Clinical

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                              ┌────────────┐                             │
│                              │  Encounter │                             │
│                              │────────────│                             │
│                              │ id (PK)    │                             │
│                    ┌─────────│ patientId(FK)─ User                       │
│                    │         │ providerId(FK)─ User                      │
│                    │         │ encounterClass                            │
│                    │         │ periodStart/End                           │
│                    │         └────┬───────┬───────┬───────┬──────┐      │
│                    │              │       │       │       │      │      │
│                    ▼              ▼       ▼       ▼       ▼      ▼      │
│  ┌─────────────────┐  ┌────────────┐ ┌─────────┐ ┌────────┐ ┌──────┐  │
│  │ EncounterDiag.  │  │EncounterNote│ │Encounter│ │Encntr  │ │Clinic│  │
│  │─────────────────│  │────────────│ │Order   │ │Proc.   │ │Doc   │  │
│  │ encounterId(FK) │  │encounterId │ │────────│ │────────│ │      │  │
│  │ conditionId(FK) │  │noteId(FK)  │ │orderId │ │procId  │ │      │  │
│  └────────┬────────┘  └─────┬──────┘ └───┬────┘ └───┬────┘ └──────┘  │
│           │                 │            │          │                  │
│           ▼                 ▼            ▼          ▼                  │
│  ┌────────────┐    ┌──────────────┐ ┌───────────┐ ┌────────────────┐  │
│  │ Condition  │    │ ClinicalNote │ │ClinicalOrd│ │ProcedureRecord │  │
│  │────────────│    │──────────────│ │───────────│ │────────────────│  │
│  │ patientId  │    │ patientId    │ │ patientId │ │ patientId      │  │
│  │ icdCode    │    │ content (JSON)│ │ orderType │ │ code (SNOMED) │  │
│  │ displayName │    │ authoredById│ │ status    │ │ performerId    │  │
│  └────────────┘    └──────────────┘ └───────────┘ └────────────────┘  │
│                                                                         │
│  ════════════════════════════════════════════════════════════════════  │
│                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────────┐            │
│  │ Appointment  │───▶│ConsltSession │───▶│ConsltSOAP     │            │
│  │──────────────│    │──────────────│    │───────────────│            │
│  │ patientId(FK)│    │ appointId(FK)│    │ subjective    │            │
│  │ doctorId(FK) │    │ doctorId(FK) │    │ objective     │            │
│  │ clinicId(FK) │    │ patientId(FK)│    │ assessment    │            │
│  │ status       │    │ aiSummary    │    │ plan          │            │
│  │ slotStart/End│    └──┬───────────┘    └───────────────┘            │
│  └──────────────┘       │                                              │
│                         ├────────────────────┬──────────┐             │
│                         ▼                    ▼          ▼             │
│                  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│                  │ConsltRecording│ │ConsltTranscri│  │ConsltSummary│ │
│                  │──────────────│  │──────────────│  │─────────────│ │
│                  │ storageUrl   │  │ transcript   │  │ title       │ │
│                  │ durationSec  │  │ speakerSeg.  │  │ summary     │ │
│                  └──────────────┘  └──────────────┘  └─────────────┘ │
│                                                                         │
│  ════════════════════════════════════════════════════════════════════  │
│                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────────┐            │
│  │ HealthRecord │───▶│ Prescription │───▶│ PrescriptItem │            │
│  │──────────────│    │──────────────│    │───────────────│            │
│  │ userId (FK)  │    │ patientId(FK)│    │ drugId (FK)   │            │
│  │ recordType   │    │ doctorId(FK) │    │ dosage         │            │
│  │ storageKey   │    │ diagnosis    │    │ frequency      │            │
│  │ structured   │    └──┬───────────┘    │ duration       │            │
│  │   Payload    │       │                └───────┬───────┘            │
│  └──────┬───────┘       │                        │                    │
│         │               ├──────────┐             │                    │
│         ▼               ▼          ▼             ▼                    │
│  ┌──────────────┐  ┌─────────┐ ┌────────────┐  ┌──────────────┐      │
│  │DiagnosticRpt │  │Medicatn │ │Dispensing  │  │MedSchedule   │      │
│  │──────────────│  │─────────│ │Record      │  │──────────────│      │
│  │ patientId(FK)│  │ drugName│ │────────────│  │ userId (FK)  │      │
│  │ summary      │  │ dosage  │ │patientId   │  │ times        │      │
│  └──────────────┘  └─────────┘ │pharmacistId│  └──────┬───────┘      │
│                                 └────────────┘         │              │
│                                                        ▼              │
│                                                  ┌──────────────┐    │
│                                                  │ AdherenceLog │    │
│                                                  │──────────────│    │
│                                                  │ userId (FK)  │    │
│                                                  │ status       │    │
│                                                  └──────────────┘    │
│                                                                         │
│  ════════════════════════════════════════════════════════════════════  │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐               │
│  │   Allergy    │  │ Immunization │  │ CDSAlert      │               │
│  │──────────────│  │──────────────│  │───────────────│               │
│  │ patientId(FK)│  │ patientId(FK)│  │ patientId(FK) │               │
│  │ allergen     │  │ vaccineName  │  │ alertType     │               │
│  │ severity     │  │ administered │  │ severity      │               │
│  └──────────────┘  │       Date   │  │ description   │               │
│                     └──────────────┘  └───────────────┘               │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐               │
│  │ ClinicalDoc  │  │ CarePlan     │──│ CarePlanLog   │               │
│  │──────────────│  │──────────────│  │───────────────│               │
│  │ patientId(FK)│  │ userId (FK)  │  │ carePlanId(FK)│               │
│  │ storageKey   │  │ type         │  │ status        │               │
│  │ mimeType     │  │ status       │  └───────────────┘               │
│  └──────────────┘  └──────┬───────┘                                  │
│                           │                                           │
│                           ▼                                           │
│                    ┌──────────────┐                                   │
│                    │ CarePlanMil. │                                   │
│                    │──────────────│                                   │
│                    │ carePlanId   │                                   │
│                    │ dueDate      │                                   │
│                    └──────────────┘                                   │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐               │
│  │  VitalsRec   │  │ SymptomEvent │  │ WearableMet   │               │
│  │──────────────│  │──────────────│  │───────────────│               │
│  │ patientId(FK)│  │ userId (FK)  │  │ userId (FK)   │               │
│  │ bpSystolic   │  │ symptom      │  │ metricType    │               │
│  │ heartRate    │  │ severity     │  │ value         │               │
│  └──────────────┘  └──────────────┘  └───────────────┘               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Domain: Pharmacy

```
┌────────────────┐     ┌───────────────────┐     ┌──────────────────┐
│ PharmacyPartner│     │ PharmacyInventory │     │ PharmacyCartItem │
│────────────────│     │───────────────────│     │──────────────────│
│ id (PK)        │◄────│ partnerId (FK)    │     │ userId (FK)      │
│ name           │     │ name              │     │ partnerId (FK)   │
│ city           │     │ genericName       │     │ inventoryId (FK) │
│ pincode        │     │ unitPrice         │     └──────────────────┘
│ isActive       │     │ stock             │
└───────┬────────┘     └───────────────────┘
        │
        ├──────────────────────┐
        ▼                      ▼
┌────────────────┐     ┌──────────────────┐
│ PharmacyOrder  │     │ ProcurementOrder │
│────────────────│     │──────────────────│
│ userId (FK)    │     │ pharmacyId (FK)  │
│ partnerId (FK) │     │ supplier         │
│ deliveryAddress │     │ items (JSON)    │
│ medicinePayload│     └──────────────────┘
└────────────────┘

┌──────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Drug   │◄────│  DrugInteraction │     │  DispensingRec   │
│──────────│     │──────────────────│     │──────────────────│
│ id (PK)  │     │ subjectDrugId(FK)│     │ patientId (FK)   │
│ genericNm│     │ objectDrugId(FK) │     │ pharmacistId (FK)│
│ rxNormCd │     │ severity         │     │ prescriptionId   │
│ atcCode  │     └──────────────────┘     └──────────────────┘
└────┬─────┘
     │
     ├────────────────────────────────┐
     ▼                                ▼
┌──────────────────┐          ┌──────────────────┐
│ PrescriptionItem │          │ MedicationSchedule│
│──────────────────│          │──────────────────│
│ drugId (FK)      │          │ drugId (FK)      │
│ dosage           │          │ userId (FK)      │
│ frequency        │          └──────────────────┘
└──────────────────┘
```

---

## Domain: Diagnostics

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ DiagnosticsPartner│     │ DiagnosticOrder  │     │   LabResult      │
│──────────────────│     │──────────────────│     │──────────────────│
│ id (PK)          │◄────│ partnerId (FK)   │     │ diagnosticOrderId│
│ name             │     │ userId (FK)      │     │ testName         │
│ city             │     │ testCodes[]      │     │ result           │
│ homeCollection   │     │ status           │     │ referenceRange   │
└──────────────────┘     └────────┬─────────┘     │ isAbnormal       │
                                  │               └──────────────────┘
                                  │
                                  ▼
                          ┌──────────────────┐
                          │   LabSample      │
                          │──────────────────│
                          │ diagnosticOrderId│
                          │ sampleType       │
                          │ status           │
                          └──────────────────┘
```

---

## Domain: Billing & Insurance

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ InsuranceProvider│     │  InsurancePlan   │     │  CoverageRule    │
│──────────────────│     │──────────────────│     │──────────────────│
│ id (PK)          │◄────│ providerId (FK)  │     │ planId (FK)      │
│ name             │     │ name             │     │ category         │
│ code             │     │ maxSumInsured    │     │ coveragePercent  │
│ type             │     └────────┬─────────┘     └──────────────────┘
└──────────────────┘              │
                                  │
                                  ▼
                          ┌──────────────────┐     ┌──────────────────┐
                          │ InsurancePolicy  │     │ PreAuthorization │
                          │──────────────────│     │──────────────────│
                          │ userId (FK)      │     │ patientUserId(FK)│
                          │ planId (FK)      │     │ policyId (FK)    │
                          │ policyNumber     │     │ clinicId (FK)    │
                          └────────┬─────────┘     │ procedureCode    │
                                   │               └──────────────────┘
                                   │
                                   ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ EligibilityCheck │     │      Claim       │◄────│ PreAuthorization │
│──────────────────│     │──────────────────│     └──────────────────┘
│ patientUserId(FK)│     │ policyId (FK)    │
│ policyId (FK)    │     │ clinicId (FK)    │────┐
│ isEligible       │     │ patientUserId(FK)│    │
└──────────────────┘     │ claimNumber      │    │
                         └────┬──────┬──────┘    │
                              │      │           │
                              ▼      ▼           ▼
┌──────────────────┐  ┌────────────┐  ┌──────────────────┐
│  ClaimDocument   │  │ClaimLineItm│  │ Settlement       │
│──────────────────│  │────────────│  │──────────────────│
│ claimId (FK)     │  │ claimId(FK)│  │ claimId (FK)     │
│ storageKey       │  │ desc       │  │ amount           │
└──────────────────┘  │ claimedAmt│  │ status           │
                      └────────────┘  └──────────────────┘

┌──────────────────┐     ┌──────────────────┐
│  BillingInvoice  │────▶│  BillingItem     │
│──────────────────│     │──────────────────│
│ clinicId (FK)    │     │ invoiceId (FK)   │
│ patientUserId(FK)│     │ description      │
│ appointmentId(FK)│     │ category         │
│ totalAmount      │     │ netPrice         │
│ status           │     └──────────────────┘
└──────────────────┘

┌──────────────────┐
│  PaymentOrder    │
│──────────────────│
│ userId (FK)      │
│ amount           │
│ status           │
└──────────────────┘
```

---

## Domain: Digital Twin & AI

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   DigitalTwin    │────▶│   CareGap        │     │  RiskPrediction  │
│──────────────────│     │──────────────────│     │──────────────────│
│ userId (FK) 1:1  │     │ twinId (FK)      │     │ userId (FK)      │
│ healthScore      │     │ category         │     │ twinId (FK)      │
│ riskScore        │     │ title            │     │ riskType         │
│ adherenceScore   │     │ priority         │     │ riskScore        │
│ readinessScore   │     │ status           │     │ riskLevel        │
└────────┬─────────┘     └──────────────────┘     └──────────────────┘
         │
         ├──────────────────┐
         ▼                  ▼
┌──────────────────┐  ┌──────────────────┐
│ TwinMetricHistory│  │ TwinScoreHistory │
│──────────────────│  │──────────────────│
│ twinId (FK)      │  │ twinId (FK)      │
│ metric           │  │ healthScore      │
│ value            │  │ riskScore        │
└──────────────────┘  └──────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  HealthScore     │     │ HealthAnalytics  │     │ AIRecommendation  │
│──────────────────│     │──────────────────│     │──────────────────│
│ userId (FK)      │     │ userId (FK)      │     │ userId (FK)      │
│ overallScore     │     │ metric           │     │ category         │
│ physicalScore    │     │ value            │     │ confidence       │
│ mentalScore      │     │ period           │     │ reasoning        │
└──────────────────┘     └──────────────────┘     └──────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ HealthGraphNode  │────▶│ HealthGraphEdge  │     │  AIMemoryNode    │
│──────────────────│     │──────────────────│     │──────────────────│
│ userId (FK)      │     │ sourceNodeId(FK) │     │ userId (FK)      │
│ nodeType         │     │ targetNodeId(FK) │     │ nodeType         │
│ label            │     │ relationship     │     │ embeddingRef     │
│ refType/refId    │     │ weight           │     └────────┬─────────┘
└──────────────────┘     └──────────────────┘              │
                                                            ▼
                                                   ┌──────────────────┐
                                                   │  AIMemoryEdge    │
                                                   │──────────────────│
                                                   │ fromNodeId (FK)  │
                                                   │ toNodeId (FK)    │
                                                   │ relation         │
                                                   │ strength         │
                                                   └──────────────────┘

┌──────────────────┐
│     AIJob        │
│──────────────────│
│ userId (FK)      │
│ jobType          │
│ inputPayload     │
│ outputPayload    │
│ status           │
└──────────────────┘
```

---

## Domain: ABDM

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   ABDMLinkage    │     │   AbhaProfile    │     │   AbdmConsent    │
│──────────────────│     │──────────────────│     │──────────────────│
│ userId (FK) 1:1  │     │ userId (FK) 1:1  │     │ patientUserId(FK)│
│ abhaAddress      │     │ abhaNumber       │     │ consentId        │
│ abhaNumberMasked │     │ abhaAddress      │     │ hipId            │
│ linkageReference │     │ photo            │     │ hiTypes[]        │
└──────────────────┘     └──────────────────┘     └────────┬─────────┘
                                                            │
                                                            ▼
                                                   ┌──────────────────┐
                                                   │HealthInfoRequest │
                                                   │──────────────────│
                                                   │ consentId (FK)   │
                                                   │ requesterUserId  │
                                                   │ patientUserId    │
                                                   │ hiTypes[]        │
                                                   └────────┬─────────┘
                                                            │
                                                            ▼
                                                   ┌──────────────────┐
                                                   │HealthInfoTransfer│
                                                   │──────────────────│
                                                   │ requestId (FK)   │
                                                   │ dataPayload      │
                                                   └──────────────────┘
```

---

## Domain: Provider Graph

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ ProviderGraphNode │────▶│ ProviderGraphEdge │     │  ProviderNetwork │
│──────────────────│     │──────────────────│     │──────────────────│
│ id (PK)          │     │ fromNodeId (FK)  │     │ nodeId (FK)      │
│ nodeType         │     │ toNodeId (FK)    │     │ networkName      │
│ name             │     │ edgeType         │     │ networkType      │
│ city             │     │ weight           │     └──────────────────┘
│ speciality       │     └──────────────────┘
└────────┬─────────┘              ▲
         │                        │
         ├────────────────────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐
│  ProviderScore   │     │    Referral      │
│──────────────────│     │──────────────────│
│ nodeId (FK) 1:1  │     │ fromProvider(FK) │
│ overallScore     │     │ toProvider(FK)   │
└──────────────────┘     │ patientUserId    │
                         └──────────────────┘
```

---

## Domain: Emergency

```
┌──────────────────┐     ┌──────────────────┐
│ EmergencyProfile │────▶│ EmergencyContact │
│──────────────────│     │──────────────────│
│ userId (FK) 1:1  │     │ profileId (FK)   │
│ bloodGroup       │     │ name             │
│ organDonor       │     │ phone            │
│ emergencyMode    │     │ email            │
│ readinessScore   │     └──────────────────┘
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ EmergencyLocation │
│──────────────────│
│ profileId (FK)   │
│ latitude         │
│ longitude        │
└──────────────────┘
```

---

## Cross-Domain Relationships Summary

```
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                                                                         │
 │   ┌──────────┐               ┌────────────┐                            │
 │   │   User   │──────────────▶│ DigitalTwin │──▶ CareGap, RiskPrediction│
 │   │          │──────────────▶│ Encounter   │──▶ Diagnoses, Notes, Orders│
 │   │ (Central │──────────────▶│ HealthRecord│──▶ Prescriptions, Reports │
 │   │  Entity) │──────────────▶│ Appointment │──▶ ConsultationSession    │
 │   │          │──────────────▶│ CarePlan    │──▶ Milestones, Logs       │
 │   │          │──────────────▶│ HealthGoal  │──▶ Milestones, Progress   │
 │   │          │──────────────▶│ HealthGraph │──▶ HealthGraphEdges       │
 │   │          │──────────────▶│ AI Memory   │──▶ AIMemoryEdges          │
 │   └──────────┘               └────────────┘                            │
 │                                                                         │
 │   ┌────────────┐            ┌──────────────┐                           │
 │   │   Clinic    │──────────▶│ Appointment   │──▶ BillingInvoice        │
 │   │            │──────────▶│ BillingInvoice │──▶ BillingItem           │
 │   │            │──────────▶│ StaffAssgnmt   │──▶ User                  │
 │   └────────────┘            └──────────────┘                           │
 │                                                                         │
 │   ┌────────────────┐      ┌──────────────┐                            │
 │   │ InsurancePolicy │─────▶│ Claim         │──▶ Settlement, LineItems │
 │   │                │─────▶│ EligibilityChk│──▶ Response               │
 │   │                │─────▶│ PreAuthorizatn │──▶ Approval               │
 │   └────────────────┘      └──────────────┘                            │
 │                                                                         │
 └─────────────────────────────────────────────────────────────────────────┘
```
