# WyshCare Supabase Database Schema

## Overview
Complete Supabase/PostgreSQL schema derived from Prisma schema (2935 lines), 15 migration files, RLS policies, and shared TypeScript types.

## Entities (84 tables)

### Auth & Users
- User, UserRole, DeviceSession, RefreshToken, OtpChallenge, ProviderProfile, DoctorProfile

### Organizations
- Clinic, DoctorClinic, StaffAssignment

### Consent & Sharing
- ConsentGrant, ShareLink, EmergencyAccess, FamilyRelation

### Health Records
- HealthRecord, Prescription, Medication, DiagnosticReport, TimelineEvent

### Appointments & Telemedicine
- Appointment, ConsultationSession, ConsultationRecording, ConsultationTranscript, ConsultationSOAP, ConsultationSummary

### Payments & Billing
- PaymentOrder, BillingInvoice, BillingItem

### Pharmacy
- PharmacyPartner, PharmacyOrder, PharmacyInventory, PharmacyCartItem, DispensingRecord, ProcurementOrder, Drug, DrugInteraction, PrescriptionItem, PrescriptionVerification, MedicationSchedule, AdherenceLog, MedicationAdherenceLog, MedicationReminder

### Diagnostics
- DiagnosticsPartner, DiagnosticOrder, LabSample, LabResult

### Insurance
- InsuranceProvider, InsurancePlan, InsurancePolicy, CoverageRule, EligibilityCheck, PreAuthorization, Claim, ClaimLineItem, ClaimDocument, Settlement, NHCXConfiguration, NHCXClaimSubmission, NHCXLog

### ABDM
- ABDMLinkage, AbhaProfile, AbdmConsent, CareContext, HealthInformationRequest, HealthInformationTransfer, AbdmAuditLog

### Provider Graph
- ProviderGraphNode, ProviderGraphEdge, Referral, ProviderNetwork, ProviderScore

### Health Graph v2
- LifestyleProfile, SymptomEvent, WearableMetric, FamilyHistory, PreventiveRecommendation, RiskPrediction

### EHR Core
- Allergy, Condition, ProcedureRecord, Immunization, ClinicalDocument, Encounter, EncounterDiagnosis, EncounterProcedure, EncounterOrder, EncounterNote, ClinicalOrder, ClinicalNote, CDSAlert

### Workspaces
- VitalsRecord, MedicationAdministration, CareTask, ShiftHandover

### Digital Twin
- DigitalTwin, CareGap, TwinScoreHistory, TwinMetricHistory

### Notifications & Audit
- Notification, NotificationTemplate, NotificationPreference, AuditLog

### AI
- AIMemoryNode, AIMemoryEdge, AIJob

### Care Plans
- CarePlan, CarePlanMilestone, CarePlanLog

## Enums (47)
Role, VerificationStatus, ConsentStatus, AccessMethod, AccessLevel, TimelineEventType (75 values), RecordType, AppointmentStatus, ConsultationMode, PaymentStatus, OrderStatus, PartnerType, NotificationChannel, NotificationStatus, CarePlanType, CarePlanStatus, CarePlanAdherence, AIJobType, AIJobStatus, RelationshipType, EmergencyAccessReason, StaffRole, QueueStatus, InvoiceStatus, BillingCategory, InsuranceProviderType, PolicyStatus, ClaimStatus, PreAuthStatus, SettlementStatus, CoverageType, ClaimDocumentType, AdherenceStatus, PrescriptionStatus, InteractionSeverity, EncounterClass, EncounterStatus, EncounterDiagnosisRole, ClinicalOrderType, ClinicalOrderStatus, ClinicalOrderPriority, ClinicalNoteType, CDSAlertType, ProviderNodeType, ProviderEdgeType, AbdmConsentStatus, HiType, HirStatus, TaskPriority, TaskStatus, MedAdminStatus, SampleStatus, DispenseStatus, TwinRiskLevel, PredictionType, CareGapCategory, RecommendationPriority, RecommendationCategory, TwinMetricType

## Standard Columns (All Business Tables)
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
created_at timestamptz DEFAULT now()
updated_at timestamptz DEFAULT now()
deleted_at timestamptz NULL  -- soft delete
```

## Storage Buckets Required
- `health-records` - PDFs, images, documents
- `prescriptions` - Prescription PDFs, QR codes
- `consultation-recordings` - Video/audio recordings
- `clinical-documents` - Clinical notes, discharge summaries
- `lab-reports` - Diagnostic reports
- `insurance-documents` - Claims, policies, invoices
- `profile-images` - User avatars
- `provider-documents` - Licenses, certifications