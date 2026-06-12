# Data Classification Matrix

> Classification of every Prisma model by data sensitivity: PHI, PII, Clinical, Billing, or AI Data.

**Legend:**
- **PHI** — Protected Health Information (HIPAA-defined, directly linked to patient identity + health)
- **PII** — Personally Identifiable Information (name, phone, email, address)
- **Clinical** — De-identified or operational clinical data that is not individually identifying
- **Billing** — Financial transactions, insurance claims, invoices
- **AI Data** — AI-generated content, embeddings, model outputs, or inference artifacts
- **Auth** — Authentication/authorization records
- **Operational** — System operations, audit logs, utility tables

| # | Model | Classification | PHI Fields | PII Fields | Notes |
|---|-------|---------------|------------|------------|-------|
| 1 | User | **PHI / PII** | chronicConditions, allergiesSummary, emergencyProfile, bloodGroup, abhaAddress, abhaNumberMasked, aadhaarLast4 | email, phoneNumber, fullName, dateOfBirth, gender, avatarUrl | Central identity model. Contains both PII and PHI. `abhaAddress` links to ABDM health records. |
| 2 | UserRole | Auth | — | — | Maps userId to Role. No PHI/PII. |
| 3 | DeviceSession | Auth | — | deviceFingerprint, ipAddress | Security data only. |
| 4 | RefreshToken | Auth | — | — | Contains hashed tokens. No raw PII. |
| 5 | AdminCredential | Auth | — | — | passwordHash only. |
| 6 | OtpChallenge | PII | — | phoneNumber | Contains phone number and OTP hash. |
| 7 | FamilyRelation | PII | — | actorUserId, subjectUserId | Links users as family. Relationship type only, no raw PII values. |
| 8 | ProviderProfile | PII | — | registrationNumber, licenseDocumentUrl, kycMetadata, payoutAccountReference | Professional credentials + KYC data. |
| 9 | DoctorProfile | PII | — | registrationNumber, languages, gender, bio | Professional profile, specialization. |
| 10 | Clinic | PII | — | name, phoneNumber, addressLine1, addressLine2, city, state, pincode, email | Full address and contact info. |
| 11 | DoctorClinic | Operational | — | — | Junction table. Operational mapping. |
| 12 | ConsentGrant | Clinical | scope (JSON — health data access scope) | ownerUserId, grantedToUserId | Consent model for health data sharing. Access levels defined in enum. |
| 13 | ShareLink | Clinical | — | — | Token-based sharing. Access level only. |
| 14 | EmergencyAccess | Clinical | notes (may contain clinical context) | — | Emergency override for health data access. |
| 15 | HealthRecord | **PHI** | extractedText, structuredPayload, hash, fileIv, fileAuthTag, encryptedDek | — | Core clinical document store. Contains medical data with encryption metadata. |
| 16 | Prescription | **PHI** | diagnosisSummary, diagnosis (JSON), instructions | — | Contains diagnosis and medication instructions. |
| 17 | Medication | Clinical | — | — | Drug name, dosage, frequency. No patient-identifying fields. |
| 18 | DiagnosticReport | **PHI** | summary, abnormalMarkers, trendSnapshot | — | Contains lab results and clinical interpretations. |
| 19 | TimelineEvent | Clinical | summary, metadata | — | Clinical timeline with event summaries. |
| 20 | Appointment | PII / Clinical | reason | — | Booking reason may contain health context. Links patient to doctor. |
| 21 | ConsultationSession | **PHI** | chatTranscript, aiSummary, notes | — | Full consultation transcript and AI summary. |
| 22 | ConsultationSummary | Clinical | — | — | Summary of consultation. Less detailed than session. |
| 23 | PaymentOrder | Billing | — | — | Financial transaction record. Amount, status, provider reference. |
| 24 | PharmacyPartner | Operational | — | name, phoneNumber, city, state, pincode, address | Business entity data. |
| 25 | PharmacyOrder | PII / Billing | — | deliveryAddress (JSON — contains name, address) | Order data with delivery info and pricing. |
| 26 | DiagnosticsPartner | Operational | — | name, city, pincode | Business entity. |
| 27 | DiagnosticOrder | Clinical | — | — | Test codes and scheduling. |
| 28 | Notification | Operational | — | — | Message delivery tracking. |
| 29 | AuditLog | Operational | — | ipAddress | Immutable audit trail. |
| 30 | AIMemoryNode | AI Data | — | — | AI knowledge graph nodes with embeddings. |
| 31 | AIMemoryEdge | AI Data | — | — | AI knowledge graph edges. |
| 32 | AIJob | AI Data | inputPayload, outputPayload | — | AI task queue. Payloads may contain clinical text. |
| 33 | ABDMLinkage | **PHI** | abhaAddress, abhaNumberMasked, linkageReference, metadata | — | Direct ABDM linkage. Full health ID linkage. |
| 34 | AbdmAuditLog | Clinical | — | — | ABDM transaction audit. |
| 35 | AbdmConsent | Clinical | — | — | ABDM consent records. No raw medical data. |
| 36 | AbhaProfile | **PHI** | abhaNumber, abhaAddress, healthIdNumber, name, gender, dateOfBirth, photo | name, gender, dateOfBirth, photo | Full ABHA identity profile. Both PHI and PII. |
| 37 | AdherenceLog | Clinical | — | — | Medication adherence tracking. Scheduled/taken status. |
| 38 | Allergy | **PHI** | allergen, reaction, severity | — | Clinical allergy record. Direct health info. |
| 39 | BillingInvoice | Billing | — | — | Invoice details. Amounts, payment method. |
| 40 | BillingItem | Billing | — | — | Line items per invoice. Category and price. |
| 41 | CDSAlert | **PHI** | description, title | — | Clinical decision support alerts. Contains clinical reasoning. |
| 42 | CareContext | Clinical | — | abhaAddress | ABDM care context. Links to external health records. |
| 43 | CareGap | Clinical | — | — | Care gap analysis. Clinical quality metrics. |
| 44 | CarePlan | Clinical | — | — | Care plan with goals and interventions. |
| 45 | CarePlanLog | Clinical | — | — | Daily care plan adherence log. |
| 46 | CarePlanMilestone | Clinical | — | — | Milestone tracking per care plan. |
| 47 | CareTask | Operational | — | — | Task assignment and completion. |
| 48 | Claim | Billing | — | — | Insurance claim. Amounts, status, adjudication. |
| 49 | ClaimDocument | Billing | — | — | Document references for claims. |
| 50 | ClaimLineItem | Billing | — | — | Per-item claim breakdown. |
| 51 | ClinicalDocument | **PHI** | storageKey, description, tags | — | Stored clinical files (PDFs, images). Contains full medical records. |
| 52 | ClinicalNote | **PHI** | content (JSON — full clinical note text) | — | SOAP notes, H&P, discharge summaries. |
| 53 | ClinicalOrder | Clinical | — | — | Lab/imaging/medication orders. |
| 54 | Condition | **PHI** | icdCode, displayName, bodySite, severity, notes | — | Medical diagnoses with ICD-10 coding. |
| 55 | ConsultationRecording | **PHI** | storageUrl | — | Video/audio recordings of consultations. |
| 56 | ConsultationSOAP | **PHI** | subjective, objective, assessment, plan | — | Structured clinical note from consultations. |
| 57 | ConsultationTranscript | **PHI** | transcriptText, speakerSegments, aiSummary | — | Full text transcript of consultations. |
| 58 | CoverageRule | Billing | — | — | Insurance coverage rules. |
| 59 | DigitalTwin | AI Data / Clinical | contextSnapshot | — | Aggregated health scores and risk metrics. |
| 60 | DispensingRecord | Clinical | — | — | Pharmacy dispensing log. Drug and quantity. |
| 61 | Drug | Clinical | — | — | Drug master data. Pharmacology, interactions. |
| 62 | DrugInteraction | Clinical | — | — | Drug-drug interaction records. |
| 63 | EligibilityCheck | Billing | — | — | Insurance eligibility checks. |
| 64 | Encounter | **PHI** | reason, reasonCode | — | Clinical encounter. Links to all clinical data for a visit. |
| 65 | EncounterDiagnosis | Clinical | — | — | Links Encounter to Condition. |
| 66 | EncounterNote | Clinical | — | — | Links Encounter to ClinicalNote. |
| 67 | EncounterOrder | Clinical | — | — | Links Encounter to ClinicalOrder. |
| 68 | EncounterProcedure | Clinical | — | — | Links Encounter to ProcedureRecord. |
| 69 | FamilyHistory | **PHI** | condition, relation, diagnosisAge | — | Family medical history. Genetically relevant PHI. |
| 70 | HealthInformationRequest | **PHI** | — | — | ABDM health data request. Links to consent. |
| 71 | HealthInformationTransfer | **PHI** | dataPayload (JSON — actual transferred health data) | — | Transferred health data payload. |
| 72 | Immunization | **PHI** | vaccineName, manufacturer, lotNumber, administrationSite | — | Vaccination records. |
| 73 | InsurancePlan | Billing | — | — | Insurance plan master data. |
| 74 | InsurancePolicy | Billing / PII | — | policyNumber, memberId | Insurance policy with member ID. |
| 75 | InsuranceProvider | Billing | — | — | Insurance company master data. |
| 76 | LabResult | **PHI** | result, referenceRange, isAbnormal | — | Lab test results. Direct clinical data. |
| 77 | LabSample | Clinical | — | — | Sample collection and processing. |
| 78 | LifestyleProfile | PII / Clinical | — | — | Sleep, diet, exercise, smoking, alcohol — health risk factors. |
| 79 | MedicationAdherenceLog | Clinical | — | — | Per-medication adherence tracking. |
| 80 | MedicationAdministration | Clinical | — | — | Medication administration record. |
| 81 | MedicationReminder | Clinical | — | — | Reminder schedules. Not clinical data by itself. |
| 82 | MedicationSchedule | Clinical | — | — | Scheduled medication regimen. |
| 83 | NHCXClaimSubmission | Billing | — | — | NHCX claim submission payload. |
| 84 | NHCXConfiguration | Billing | — | — | API credentials for NHCX. Contains secrets. |
| 85 | NHCXLog | Billing | — | — | NHCX transaction logs. |
| 86 | NotificationPreference | Operational | — | — | User notification channel preferences. |
| 87 | NotificationTemplate | Operational | — | — | Template content for notifications. |
| 88 | NotificationDelivery | Operational | — | — | Delivery tracking. |
| 89 | PharmacyCartItem | Operational | — | — | Shopping cart items. |
| 90 | PharmacyInventory | Operational | — | — | Pharmacy stock/inventory. |
| 91 | PreAuthorization | Billing | — | — | Pre-authorization for procedures. |
| 92 | PrescriptionItem | Clinical | — | — | Individual medication items on a prescription. |
| 93 | PrescriptionVerification | Clinical | — | — | QR code based prescription verification. |
| 94 | PreventiveRecommendation | Clinical | — | — | Preventive care recommendations. |
| 95 | ProcedureRecord | **PHI** | code, displayName, bodySite, outcome, complications, notes | — | Medical procedures. Coded in SNOMED CT. |
| 96 | ProcurementOrder | Operational | — | — | Pharmacy procurement from suppliers. |
| 97 | ProviderGraphEdge | Operational | — | — | Provider network graph edges. |
| 98 | ProviderGraphNode | Operational | — | name, city, state, pincode | Provider directory nodes. |
| 99 | ProviderNetwork | Operational | — | — | Provider network membership. |
| 100 | ProviderScore | Operational | — | — | Provider quality scores. |
| 101 | QueueEntry | Operational | — | — | Clinic queue management. |
| 102 | Referral | Clinical | reason, notes | — | Provider-to-provider referrals. |
| 103 | RiskPrediction | AI Data / Clinical | — | — | AI risk scores and drivers. |
| 104 | Settlement | Billing | — | — | Claim settlement records. |
| 105 | ShiftHandover | Clinical | notes, criticalAlerts | — | Clinical shift handover notes. |
| 106 | StaffAssignment | Operational | — | — | Staff-to-clinic mapping. |
| 107 | SymptomEvent | **PHI** | symptom, severity, duration, bodyPart, triggers, notes | — | Patient-reported symptoms. Direct clinical observation. |
| 108 | TwinMetricHistory | AI Data | — | — | Digital twin metric time series. |
| 109 | TwinScoreHistory | AI Data | — | — | Digital twin score history. |
| 110 | VitalsRecord | **PHI** | bpSystolic, bpDiastolic, heartRate, temperature, spo2, respiratoryRate, weight, height, bmi, painScore | — | Clinical vital signs. |
| 111 | WearableMetric | Clinical | — | — | Wearable device data (steps, heart rate, sleep). |
| 112 | HealthGoal | Clinical | — | — | Patient health goals. |
| 113 | GoalMilestone | Clinical | — | — | Goal milestones. |
| 114 | GoalProgress | Clinical | — | — | Goal progress tracking. |
| 115 | HealthScore | AI Data | — | — | Composite health scores. |
| 116 | HealthGraphNode | AI Data | — | — | Health knowledge graph nodes. |
| 117 | HealthGraphEdge | AI Data | — | — | Health knowledge graph edges. |
| 118 | EmergencyProfile | **PHI** | bloodGroup, advanceDirectives, primaryPhysician, physicianPhone, insuranceProvider, insurancePolicy, emergencyNotes | — | Emergency medical profile. Critical health info for emergencies. |
| 119 | EmergencyContact | PII | — | name, phone, email, relationship | Emergency contact information. |
| 120 | EmergencyLocation | PII | — | latitude, longitude, accuracy | Location data during emergencies. |
| 121 | AIRecommendation | AI Data | — | — | AI-generated clinical recommendations. |
| 122 | HealthAnalytics | AI Data | — | — | Aggregated health analytics. |
| 123 | ClinicBranding | Operational | — | — | Clinic visual identity. |
| 124 | ClinicTemplate | Operational | — | — | Clinical documentation templates. |
| 125 | SpecialtyEncounterData | **PHI** | data (JSON — specialty-specific clinical data) | — | Structured specialty encounter data. |
| 126 | SpecialtyFinding | **PHI** | findingValue (JSON), category, severity, findingKey | — | Specialty-specific clinical findings. |

### Classification Summary

| Classification | Count | Description |
|---------------|-------|-------------|
| **PHI** | 31 | Directly identifiable patient health data |
| **PII** | 10 | Personal identification information |
| **Clinical** | 32 | De-identified or operational clinical data |
| **Billing** | 17 | Financial, insurance, and claims data |
| **AI Data** | 10 | AI-generated artifacts and inference data |
| **Auth** | 4 | Authentication and session records |
| **Operational** | 22 | System operations, utility, and junction tables |
| **Total** | 126 | All Prisma models |

### Data Protection Requirements

| Classification | Encryption | Access Control | Retention | Audit |
|---------------|-----------|---------------|-----------|-------|
| **PHI** | Encrypt at rest (AES-256); field-level encryption for sensitive fields | RLS + strict RBAC; consent-based access only | 10 years (India DPDP) | Full audit trail mandatory |
| **PII** | Encrypt at rest | RLS + RBAC | 7 years post-account closure | Audit on access |
| **Clinical** | Encrypt at rest | RLS + RBAC | Per clinical policy | Audit on access |
| **Billing** | Encrypt at rest | RBAC (finance roles) | 8 years (tax/legal) | Audit on modification |
| **AI Data** | Encrypt at rest | RLS + RBAC | 30 days or per user preference | Periodic review |
| **Auth** | Hash passwords; encrypt tokens | System-level only | Session duration + 90 days | Login audit |
| **Operational** | Standard encryption | RBAC | 90 days | System logs |
