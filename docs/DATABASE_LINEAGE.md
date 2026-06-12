# Database Lineage

> Table relationships, foreign keys, and ownership derived from the Prisma schema.

## Legend

- **Parent Table(s):** Tables referenced by this table (FK targets)
- **Child Table(s):** Tables that reference this table
- **FK Fields:** Foreign key columns in this table
- **Key Associations:** Description of the relationship

---

## Domain: Auth & Identity

| Table | Parent Table(s) | Child Table(s) | FK Fields | Key Associations |
|-------|----------------|----------------|-----------|------------------|
| **User** | — | UserRole, DeviceSession, RefreshToken, AdminCredential, OtpChallenge, HealthRecord, Prescription, Appointment, ConsultationSession, ConsultationSummary, PaymentOrder, FamilyRelation (actor+subject), Notification, AuditLog (actor+patient), AIMemoryNode, AIJob, ABDMLinkage, AbdmAuditLog, AbdmConsent, AbhaProfile, AdherenceLog, Allergy (patient+verifiedBy), BillingInvoice, CDSAlert (patient+dismissedBy), CareContext, CarePlan, Condition (patient+verifiedBy), ClinicalDocument (patient+uploadedBy), ClinicalNote (authored+patient+signedBy), ClinicalOrder (patient+orderedBy+completedBy), ConsentGrant (owner+grantedTo), ShareLink, EmergencyAccess (patient+accessor), DiagnosticOrder, DiagnosticReport, DispensingRecord (patient+pharmacist), EligibilityCheck, Encounter (patient+provider), FamilyHistory, HealthInformationRequest (patient+requester), Immunization (patient+administeredBy), InsurancePolicy, LabResult, LabSample, LifestyleProfile, MedicationAdherenceLog, MedicationAdministration (patient+administeredBy), MedicationReminder, MedicationSchedule, PharmacyCartItem, PharmacyOrder, PreAuthorization, ProcedureRecord (patient+performer), QueueEntry, Referral, RiskPrediction, ShiftHandover (from+to), StaffAssignment, SymptomEvent, VitalsRecord (patient+recordedBy), WearableMetric, HealthGoal, HealthScore, HealthGraphNode, EmergencyProfile, AIRecommendation, HealthAnalytics, SpecialtyEncounterData (patient+provider), SpecialtyFinding (patient+provider) | — | Central entity. Linked to most tables via userId or patientUserId. |
| **UserRole** | User | — | userId → User.id | Maps User to Role. Unique constraint on (userId, role). |
| **DeviceSession** | User | — | userId → User.id | Tracks login devices. Indexed on (userId, revokedAt). |
| **RefreshToken** | User | — | userId → User.id | Hashed refresh tokens with rotation. Indexed on (userId, expiresAt). |
| **AdminCredential** | User | — | userId → User.id (1:1) | Admin password hash + MFA secret. |
| **OtpChallenge** | User | — | userId → User.id (optional) | OTP verification. PhoneNumber indexed for lookup. |
| **FamilyRelation** | User (actor), User (subject) | — | actorUserId → User.id, subjectUserId → User.id | Links two Users as family. Unique constraint on (actor, subject, relationship). |
| **ProviderProfile** | User | — | userId → User.id (1:1) | Provider verification and KYC. |
| **DoctorProfile** | User | Appointment, ConsultationSession, DoctorClinic, Prescription, QueueEntry, PreAuthorization | userId → User.id (1:1) | Doctor specialization and availability. |

## Domain: Organizations

| Table | Parent Table(s) | Child Table(s) | FK Fields | Key Associations |
|-------|----------------|----------------|-----------|------------------|
| **Clinic** | — | Appointment, BillingInvoice, Claim, DoctorClinic, PreAuthorization, QueueEntry, StaffAssignment, ClinicBranding, ClinicTemplate | — | Clinic master record. Indexed on (city, pincode). |
| **DoctorClinic** | DoctorProfile, Clinic | — | doctorId → DoctorProfile.id, clinicId → Clinic.id | Maps doctors to clinics. Unique constraint on (doctorId, clinicId). |
| **StaffAssignment** | Clinic, User | — | clinicId → Clinic.id, userId → User.id | Maps staff to clinics. Unique constraint on (userId, clinicId, role). |

## Domain: Consent & Sharing

| Table | Parent Table(s) | Child Table(s) | FK Fields | Key Associations |
|-------|----------------|----------------|-----------|------------------|
| **ConsentGrant** | User (owner), User (grantedTo) | AuditLog, ShareLink | ownerUserId → User.id, grantedToUserId → User.id (optional) | Health data consent. Supports external grantees via granteeExternalRef. |
| **ShareLink** | User, ConsentGrant | — | ownerUserId → User.id, consentGrantId → ConsentGrant.id (optional) | Token-based sharing links. |
| **EmergencyAccess** | User (patient), User (accessor) | — | patientUserId → User.id, accessorUserId → User.id (optional) | Emergency health data access. |
| **HealthInformationRequest** | AbdmConsent, User (patient), User (requester) | HealthInformationTransfer | consentId → AbdmConsent.id, patientUserId → User.id, requesterUserId → User.id | ABDM health information requests. |
| **HealthInformationTransfer** | HealthInformationRequest | — | requestId → HealthInformationRequest.id | Transferred health data records. |

## Domain: Clinical

| Table | Parent Table(s) | Child Table(s) | FK Fields | Key Associations |
|-------|----------------|----------------|-----------|------------------|
| **HealthRecord** | User | DiagnosticReport, Medication, Prescription, TimelineEvent | userId → User.id | Core medical document store. Polymorphic via recordType. |
| **Prescription** | User (patient), DoctorProfile, HealthRecord | Medication, DispensingRecord, PrescriptionItem, PrescriptionVerification | patientUserId → User.id, doctorProfileId → DoctorProfile.id (optional), healthRecordId → HealthRecord.id (optional) | Medical prescription. Links patient → doctor → medications. |
| **PrescriptionItem** | Prescription, Drug, Medication | MedicationSchedule | prescriptionId → Prescription.id, drugId → Drug.id (optional), medicationId → Medication.id (optional) | Individual medication line on a prescription. |
| **PrescriptionVerification** | Prescription | — | prescriptionId → Prescription.id (1:1) | QR-code based prescription verification. |
| **Medication** | Prescription, HealthRecord | MedicationAdherenceLog, MedicationReminder, PrescriptionItem | prescriptionId → Prescription.id (optional), healthRecordId → HealthRecord.id (optional) | Medication record. Linked to prescription or health record. |
| **DiagnosticReport** | HealthRecord, User | — | healthRecordId → HealthRecord.id, patientUserId → User.id | Diagnostic results. Indexed on (patient, reportType). |
| **TimelineEvent** | User, HealthRecord | — | userId → User.id, healthRecordId → HealthRecord.id (optional) | Clinical timeline. Indexed on (userId, occurredAt). |
| **Appointment** | User (patient), DoctorProfile, Clinic, User (doctor) | BillingInvoice, ConsultationSession, QueueEntry | patientUserId → User.id, doctorProfileId → DoctorProfile.id, clinicId → Clinic.id (optional), doctorUserId → User.id (optional) | Appointment booking. Central hub linking patient, doctor, and clinic. |
| **ConsultationSession** | Appointment, DoctorProfile, User | ConsultationRecording, ConsultationSOAP, ConsultationTranscript | appointmentId → Appointment.id (1:1), doctorProfileId → DoctorProfile.id, patientUserId → User.id | Telemedicine/in-person consultation. |
| **ConsultationSummary** | User | — | userId → User.id | AI-generated or manual consultation summary. |
| **ConsultationRecording** | ConsultationSession | — | consultationId → ConsultationSession.id | Recording storage reference. |
| **ConsultationSOAP** | ConsultationSession | — | consultationId → ConsultationSession.id | Structured SOAP note. |
| **ConsultationTranscript** | ConsultationSession | — | consultationId → ConsultationSession.id | Chat/audio transcript. |
| **Encounter** | User (patient), User (provider) | ClinicalDocument, EncounterDiagnosis, EncounterNote, EncounterOrder, EncounterProcedure, SpecialtyEncounterData, SpecialtyFinding | patientId → User.id, providerId → User.id (optional) | Clinical encounter. Core clinical workflow unit. |
| **EncounterDiagnosis** | Encounter, Condition | — | encounterId → Encounter.id, conditionId → Condition.id | Links encounter to diagnosis. |
| **EncounterNote** | Encounter, ClinicalNote | — | encounterId → Encounter.id, clinicalNoteId → ClinicalNote.id | Links encounter to clinical note. |
| **EncounterOrder** | Encounter, ClinicalOrder | — | encounterId → Encounter.id, orderId → ClinicalOrder.id | Links encounter to clinical order. |
| **EncounterProcedure** | Encounter, ProcedureRecord | — | encounterId → Encounter.id, procedureId → ProcedureRecord.id | Links encounter to procedure. |
| **Condition** | User (patient), User (verifiedBy) | EncounterDiagnosis | patientId → User.id, verifiedById → User.id (optional) | Medical condition with ICD-10 coding. |
| **Allergy** | User (patient), User (verifiedBy) | — | patientId → User.id, verifiedById → User.id (optional) | Allergy record. |
| **ClinicalDocument** | User (patient), User (uploadedBy), Encounter | — | patientId → User.id, uploadedById → User.id, encounterId → Encounter.id (optional) | Uploaded clinical files. |
| **ClinicalNote** | User (authoredBy), User (patient), User (signedBy), ClinicalNote (parent) | EncounterNote, ClinicalNote (child) | authoredById → User.id, patientId → User.id, signedById → User.id (optional), parentNoteId → ClinicalNote.id (optional) | Clinical notes (SOAP, H&P, discharge). Self-referencing for note threading. |
| **ClinicalOrder** | User (patient), User (orderedBy), User (completedBy) | EncounterOrder | patientId → User.id, orderedById → User.id, completedById → User.id (optional) | Clinical orders (lab, imaging, etc.). |
| **ProcedureRecord** | User (patient), User (performer) | EncounterProcedure | patientId → User.id, performerId → User.id (optional) | Medical procedure record (SNOMED). |
| **Immunization** | User (patient), User (administeredBy) | — | patientId → User.id, administeredById → User.id (optional) | Vaccination record. |
| **CDSAlert** | User (patient), User (dismissedBy) | — | patientId → User.id, dismissedById → User.id (optional) | Clinical decision support. |
| **CareContext** | User | — | patientUserId → User.id | ABDM care context reference. |
| **CarePlan** | User | CarePlanLog, CarePlanMilestone | userId → User.id | Care plan with goals. |
| **CarePlanLog** | CarePlan | — | carePlanId → CarePlan.id | Daily care log. |
| **CarePlanMilestone** | CarePlan | — | carePlanId → CarePlan.id | Milestone tracking. |
| **CareTask** | User (patient), User (assignedTo), User (completedBy) | — | patientId → User.id, assignedToId → User.id, completedById → User.id (optional) | Clinical task assignment. |
| **FamilyHistory** | User | — | userId → User.id | Family medical history. |
| **SymptomEvent** | User | — | userId → User.id | Patient-reported symptom. |
| **VitalsRecord** | User (patient), User (recordedBy) | — | patientId → User.id, recordedById → User.id | Vital signs measurement. |
| **WearableMetric** | User | — | userId → User.id | Wearable device data. |
| **MedicationSchedule** | User, Drug, PrescriptionItem | AdherenceLog | userId → User.id, drugId → Drug.id (optional), prescriptionItemId → PrescriptionItem.id (optional) | Medication schedule/dosing. |
| **AdherenceLog** | MedicationSchedule, User | — | scheduleId → MedicationSchedule.id, userId → User.id | Adherence check-in. |
| **MedicationAdministration** | User (patient), User (administeredBy) | — | patientId → User.id, administeredById → User.id (optional) | MAR (Medication Administration Record). |
| **MedicationAdherenceLog** | Medication, User | — | medicationId → Medication.id, userId → User.id | Per-medication adherence. |
| **MedicationReminder** | Medication, User | — | medicationId → Medication.id, userId → User.id | Reminder configuration. |
| **SpecialtyEncounterData** | Encounter, User (patient), User (provider) | — | encounterId → Encounter.id, patientId → User.id, providerId → User.id | Specialty-specific encounter data. |
| **SpecialtyFinding** | Encounter, User (patient), User (provider) | — | encounterId → Encounter.id, patientId → User.id, providerId → User.id | Specialty-specific clinical findings. |
| **Referral** | ProviderGraphNode (from), ProviderGraphNode (to), User | — | fromProviderId → ProviderGraphNode.id, toProviderId → ProviderGraphNode.id, patientUserId → User.id (optional) | Provider-to-provider referral. |
| **QueueEntry** | Clinic, DoctorProfile, Appointment, User | — | clinicId → Clinic.id, doctorProfileId → DoctorProfile.id (optional), appointmentId → Appointment.id (1:1), patientUserId → User.id | Clinic queue management. |
| **ShiftHandover** | User (from), User (to) | — | fromUserId → User.id, toUserId → User.id | Clinical shift handover. |

## Domain: Pharmacy

| Table | Parent Table(s) | Child Table(s) | FK Fields | Key Associations |
|-------|----------------|----------------|-----------|------------------|
| **PharmacyPartner** | — | PharmacyCartItem, PharmacyInventory, PharmacyOrder, ProcurementOrder | — | Pharmacy business entity. |
| **PharmacyInventory** | PharmacyPartner | PharmacyCartItem | partnerId → PharmacyPartner.id | Pharmacy stock items. |
| **PharmacyCartItem** | User, PharmacyPartner, PharmacyInventory | — | userId → User.id, partnerId → PharmacyPartner.id, inventoryId → PharmacyInventory.id | Shopping cart. Unique on (userId, inventoryId). |
| **PharmacyOrder** | User, PharmacyPartner | — | userId → User.id, partnerId → PharmacyPartner.id (optional) | Medicine delivery order. |
| **DispensingRecord** | User (patient), User (pharmacist), Prescription | — | patientId → User.id, pharmacistId → User.id, prescriptionId → Prescription.id (optional) | In-store dispensing. |
| **Drug** | — | DrugInteraction (subject+object), MedicationSchedule, PrescriptionItem | — | Drug master data with RxNorm/ATC codes. |
| **DrugInteraction** | Drug (subject), Drug (object) | — | subjectDrugId → Drug.id, objectDrugId → Drug.id | Drug-drug interaction. Unique on (subject, object). |
| **ProcurementOrder** | PharmacyPartner | — | pharmacyId → PharmacyPartner.id | Pharmacy procurement from suppliers. |

## Domain: Diagnostics

| Table | Parent Table(s) | Child Table(s) | FK Fields | Key Associations |
|-------|----------------|----------------|-----------|------------------|
| **DiagnosticsPartner** | — | DiagnosticOrder | — | Lab business entity. |
| **DiagnosticOrder** | User, DiagnosticsPartner | LabResult, LabSample | userId → User.id, partnerId → DiagnosticsPartner.id (optional) | Lab test order. |
| **LabResult** | DiagnosticOrder, User | — | diagnosticOrderId → DiagnosticOrder.id, approvedById → User.id (optional) | Test result. |
| **LabSample** | DiagnosticOrder, User | — | diagnosticOrderId → DiagnosticOrder.id, collectedById → User.id (optional) | Sample tracking. |

## Domain: Insurance & Billing

| Table | Parent Table(s) | Child Table(s) | FK Fields | Key Associations |
|-------|----------------|----------------|-----------|------------------|
| **InsuranceProvider** | — | InsurancePlan, NHCXConfiguration | — | Insurance company master. |
| **InsurancePlan** | InsuranceProvider | CoverageRule, InsurancePolicy | providerId → InsuranceProvider.id | Insurance product/plan. |
| **InsurancePolicy** | User, InsurancePlan | Claim, EligibilityCheck, PreAuthorization | userId → User.id, planId → InsurancePlan.id | User's insurance policy. |
| **CoverageRule** | InsurancePlan | — | planId → InsurancePlan.id | Coverage rules per plan. |
| **EligibilityCheck** | User, InsurancePolicy | — | patientUserId → User.id, policyId → InsurancePolicy.id | Eligibility verification. |
| **PreAuthorization** | User, Clinic, InsurancePolicy | Claim | patientUserId → User.id, clinicId → Clinic.id (optional), policyId → InsurancePolicy.id | Pre-authorization for procedures. |
| **Claim** | InsurancePolicy, Clinic, User, PreAuthorization | ClaimDocument, ClaimLineItem, NHCXClaimSubmission, Settlement | policyId → InsurancePolicy.id, clinicId → Clinic.id, patientUserId → User.id, preAuthorizationId → PreAuthorization.id (optional) | Insurance claim. |
| **ClaimDocument** | Claim | — | claimId → Claim.id | Supporting documents for claim. |
| **ClaimLineItem** | Claim | — | claimId → Claim.id | Per-item claim breakdown. |
| **Settlement** | Claim | — | claimId → Claim.id (1:1) | Claim settlement. |
| **NHCXClaimSubmission** | Claim | NHCXLog | claimId → Claim.id | NHCX API submission. |
| **NHCXConfiguration** | InsuranceProvider | — | providerId → InsuranceProvider.id (1:1) | NHCX API credentials per provider. |
| **NHCXLog** | NHCXClaimSubmission | — | submissionId → NHCXClaimSubmission.id | Submission event log. |
| **BillingInvoice** | Clinic, User, Appointment | BillingItem | clinicId → Clinic.id, patientUserId → User.id, appointmentId → Appointment.id (optional) | Clinic invoice. |
| **BillingItem** | BillingInvoice | — | invoiceId → BillingInvoice.id | Invoice line items. |
| **PaymentOrder** | User | — | userId → User.id | Payment transaction. |

## Domain: Digital Twin & AI

| Table | Parent Table(s) | Child Table(s) | FK Fields | Key Associations |
|-------|----------------|----------------|-----------|------------------|
| **DigitalTwin** | User | CareGap, RiskPrediction, TwinMetricHistory, TwinScoreHistory | userId → User.id (1:1) | Per-user digital twin. |
| **CareGap** | DigitalTwin | — | twinId → DigitalTwin.id | Care gaps identified by twin engine. |
| **RiskPrediction** | User, DigitalTwin | — | userId → User.id, twinId → DigitalTwin.id (optional) | Risk prediction output. |
| **TwinMetricHistory** | DigitalTwin | — | twinId → DigitalTwin.id | Metric time series. |
| **TwinScoreHistory** | DigitalTwin | — | twinId → DigitalTwin.id | Score time series. |
| **HealthScore** | User | — | userId → User.id | Composite health score. |
| **HealthAnalytics** | User | — | userId → User.id | Aggregated analytics. |
| **HealthGraphNode** | User | HealthGraphEdge (source+target) | userId → User.id | Knowledge graph node. |
| **HealthGraphEdge** | HealthGraphNode (source), HealthGraphNode (target) | — | sourceNodeId → HealthGraphNode.id, targetNodeId → HealthGraphNode.id | Knowledge graph edge. |
| **AIMemoryNode** | User | AIMemoryEdge (from+to) | userId → User.id | AI memory/knowledge node. |
| **AIMemoryEdge** | AIMemoryNode (from), AIMemoryNode (to) | — | fromNodeId → AIMemoryNode.id, toNodeId → AIMemoryNode.id | AI memory relationship. |
| **AIJob** | User | — | userId → User.id (optional) | AI task queue. |
| **AIRecommendation** | User | — | userId → User.id | AI-generated recommendation. |
| **LifestyleProfile** | User | — | userId → User.id (1:1) | Lifestyle assessment. |
| **PreventiveRecommendation** | User | — | userId → User.id | Preventive care suggestions. |

## Domain: Notifications & Audit

| Table | Parent Table(s) | Child Table(s) | FK Fields | Key Associations |
|-------|----------------|----------------|-----------|------------------|
| **Notification** | User | NotificationDelivery | userId → User.id | Notification record. |
| **NotificationDelivery** | Notification | — | notificationId → Notification.id | Per-channel delivery tracking. |
| **NotificationPreference** | User | — | userId → User.id | Channel opt-in/out. |
| **NotificationTemplate** | — | — | — | Template content. No FK dependencies. |
| **AuditLog** | User (actor), User (patient), ConsentGrant | — | actorUserId → User.id (optional), patientUserId → User.id (optional), consentGrantId → ConsentGrant.id (optional) | Immutable audit trail. |
| **AbdmAuditLog** | User | — | userId → User.id (optional) | ABDM-specific audit. |

## Domain: Provider Graph

| Table | Parent Table(s) | Child Table(s) | FK Fields | Key Associations |
|-------|----------------|----------------|-----------|------------------|
| **ProviderGraphNode** | — | ProviderGraphEdge (source+target), ProviderNetwork, ProviderScore, Referral (from+to) | — | Provider directory node (doctor, clinic, hospital, etc.). |
| **ProviderGraphEdge** | ProviderGraphNode (from), ProviderGraphNode (to) | — | fromNodeId → ProviderGraphNode.id, toNodeId → ProviderGraphNode.id | Provider relationship edge. |
| **ProviderNetwork** | ProviderGraphNode | — | nodeId → ProviderGraphNode.id | Network membership. |
| **ProviderScore** | ProviderGraphNode | — | nodeId → ProviderGraphNode.id (1:1) | Provider quality score. |

## Domain: Goals & Health

| Table | Parent Table(s) | Child Table(s) | FK Fields | Key Associations |
|-------|----------------|----------------|-----------|------------------|
| **HealthGoal** | User | GoalMilestone, GoalProgress | userId → User.id | Patient health goal. |
| **GoalMilestone** | HealthGoal | — | goalId → HealthGoal.id | Goal sub-milestone. |
| **GoalProgress** | HealthGoal | — | goalId → HealthGoal.id | Goal progress log. |

## Domain: Emergency

| Table | Parent Table(s) | Child Table(s) | FK Fields | Key Associations |
|-------|----------------|----------------|-----------|------------------|
| **EmergencyProfile** | User | EmergencyContact, EmergencyLocation | userId → User.id (1:1) | Emergency medical summary. |
| **EmergencyContact** | EmergencyProfile | — | profileId → EmergencyProfile.id | Emergency contact details. |
| **EmergencyLocation** | EmergencyProfile | — | profileId → EmergencyProfile.id | Shared emergency location. |

## Domain: ABDM

| Table | Parent Table(s) | Child Table(s) | FK Fields | Key Associations |
|-------|----------------|----------------|-----------|------------------|
| **ABDMLinkage** | User | — | userId → User.id (1:1) | ABHA linkage record. |
| **AbhaProfile** | User | — | userId → User.id (1:1) | ABHA identity profile. |
| **AbdmConsent** | User | HealthInformationRequest | patientUserId → User.id | ABDM consent artifact. |
| **CareContext** | User | — | patientUserId → User.id | ABDM care context reference. |

### Key Observations

- **User** is the most referenced table — child of 68+ FK relationships
- **Encounter** is the clinical workflow hub — 5 junction tables radiate from it
- **Polymorphic patterns:** HealthRecord (recordType), TimelineEvent (type), Notification (channel)
- **Self-referencing:** ClinicalNote (parentNoteId), AIMemoryEdge (from/to), HealthGraphEdge (source/target), ProviderGraphEdge (from/to), DrugInteraction (subject/object)
- **Tenant isolation:** 15+ tables carry `tenantId` for multi-tenant RLS enforcement
- **Soft delete:** User, HealthRecord, HealthGoal use `deletedAt` for soft deletion
