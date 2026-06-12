--
-- ============================================================================
-- WYSHCARE PLATFORM
-- ============================================================================
--
-- File: archive/schema-history/20260609000001_initial_schema.sql
--
-- Product:
-- WyshCare Healthcare Operating System
--
-- Brand:
-- WYSH
--
-- Founder:
-- Vimarshak Prudhvi
--
-- Purpose:
-- SQL migration or query: 20260609000001_initial_schema
--
-- Responsibilities:
--  * - Manage database schema and data migrations
--
-- Database:
--  - EXTENSION
 - TYPE
--
-- Last Reviewed:
-- 2026-06-12
--
-- ============================================================================
-- (c) Wysh Technologies
-- Built by Vimarshak Prudhvi
-- All Rights Reserved
-- ============================================================================
--

-- Supabase Schema Migration for WyshCare
-- Based on SUPABASE_SCHEMA.md which describes 84 tables, 47 enums
-- Generated from Prisma schema and application analysis

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Standard columns for all business tables
-- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
-- created_at TIMESTAMPTZ DEFAULT now()
-- updated_at TIMESTAMPTZ DEFAULT now()
-- deleted_at TIMESTAMPTZ NULL

-- ==================== ENUMS (47 total) ====================

-- Auth & Users
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT', 'PHARMACIST', 'LAB_TECH', 'INSURER_AGENT');
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE "ConsentStatus" AS ENUM ('PENDING', 'ACTIVE', 'REVOKED', 'EXPIRED');
CREATE TYPE "AccessLevel" AS ENUM ('FULL', 'LIMITED', 'EMERGENCY');
CREATE TYPE "AccessMethod" AS ENUM ('QR_CODE', 'OTP', 'BIOMETRIC');
CREATE TYPE "TimelineEventType" AS ENUM (
  'APPOINTMENT', 'CONSULTATION', 'PRESCRIPTION', 'REPORT', 'UPLOAD', 
  'REFILL', 'LAB_BOOKING', 'PAYMENT', 'VITALS_UPDATE', 'MEDICATION_TAKEN',
  'ALLERGY_ADDED', 'CONDITION_DIAGNOSED', 'PROCEDURE_PERFORMED', 'IMMUNIZATION_GIVEN',
  'CARE_PLAN_STARTED', 'CARE_PLAN_UPDATED', 'APPOINTMENT_BOOKED', 'APPOINTMENT_COMPLETED'
);

-- Organizations
CREATE TYPE "OrganizationType" AS ENUM ('HOSPITAL', 'CLINIC', 'LAB', 'PHARMACY', 'INSURER');
CREATE TYPE "StaffRole" AS ENUM ('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'MANAGER');

-- Health Records
CREATE TYPE "RecordType" AS ENUM ('PRESCRIPTION', 'REPORT', 'CONSULTATION_NOTE', 'DISCHARGE_SUMMARY', 'LAB_RESULT', 'IMAGING', 'VITALS', 'ALLERGY', 'CONDITION', 'IMMUNIZATION');
CREATE TYPE "AppointmentStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE "ConsultationMode" AS ENUM ('VIDEO', 'AUDIO', 'IN_CLINIC', 'HOME_VISIT');
CREATE TYPE "PaymentStatus" AS ENUM ('CREATED', 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED');

-- Pharmacy
CREATE TYPE "PartnerType" AS ENUM ('PHARMACY', 'DIAGNOSTICS');
CREATE TYPE "PrescriptionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'STOPPED');
CREATE TYPE "AdherenceStatus" AS ENUM ('TAKEN', 'MISSED', 'LATE');

-- Diagnostics
CREATE TYPE "SampleStatus" AS ENUM ('COLLECTED', 'IN_TRANSIT', 'PROCESSING', 'COMPLETED');
CREATE TYPE "DispenseStatus" AS ENUM ('PENDING', 'PREPARING', 'READY', 'DISPENSED');

-- Insurance
CREATE TYPE "InsuranceProviderType" AS ENUM ('PRIVATE', 'GOVERNMENT', 'EMPLOYER');
CREATE TYPE "PolicyStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'TERMINATED');
CREATE TYPE "ClaimStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID');
CREATE TYPE "PreAuthStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "SettlementStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED');
CREATE TYPE "CoverageType" AS ENUM ('INPATIENT', 'OUTPATIENT', 'PHARMACY', 'DIAGNOSTICS', 'WELLNESS');
CREATE TYPE "ClaimDocumentType" AS ENUM ('PRESCRIPTION', 'REPORT', 'INVOICE', 'ID_PROOF');

-- Health Graph & AI
CREATE TYPE "AIJobType" AS ENUM ('SYMPTOM_ANALYSIS', 'RISK_PREDICTION', 'CARE_PLAN_OPTIMIZATION', 'MEDICATION_INTERACTION');
CREATE TYPE "AIJobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');
CREATE TYPE "AbdmConsentStatus" AS ENUM ('REQUESTED', 'GRANTED', 'REJECTED', 'EXPIRED', 'REVOKED');
CREATE TYPE "HiType" AS ENUM ('PHARMACY', 'LAB', 'CLINICAL', 'IP', 'OP');

-- Care Plans & Workspaces
CREATE TYPE "CarePlanType" AS ENUM ('CHRONIC_DISEASE', 'POST_SURGICAL', 'WELLNESS', 'PREVENTIVE', 'REHABILITATION');
CREATE TYPE "CarePlanStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'PAUSED');
CREATE TYPE "CarePlanAdherence" AS ENUM ('NOT_STARTED', 'PARTIAL', 'FULL');
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "MedAdminStatus" AS ENUM ('PENDING', 'ADMINISTERED', 'SKIPPED');

-- Digital Twin
CREATE TYPE "TwinRiskLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');
CREATE TYPE "PredictionType" AS ENUM ('DISEASE_ONSET', 'READMISSION', 'COMPLICATION');
CREATE TYPE "CareGapCategory" AS ENUM ('SCREENING', 'VACCINATION', 'FOLLOW_UP', 'MEDICATION_REVIEW');
CREATE TYPE "RecommendationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "TwinMetricType" AS ENUM ('WEIGHT', 'BLOOD_PRESSURE', 'GLUCOSE', 'HEART_RATE', 'OXYGEN_SAT');

-- Core Clinical
CREATE TYPE "EncounterClass" AS ENUM ('IMPATIENT', 'OUTPATIENT', 'EMERGENCY');
CREATE TYPE "EncounterStatus" AS ENUM ('OPEN', 'CLOSED', 'CANCELLED');
CREATE TYPE "EncounterDiagnosisRole" AS ENUM ('PRIMARY', 'SECONDARY');
CREATE TYPE "ClinicalOrderType" AS ENUM ('LAB', 'RADIOLOGY', 'PROCEDURE', 'MEDICATION');
CREATE TYPE "ClinicalOrderStatus" AS ENUM ('ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "ClinicalOrderPriority" AS ENUM ('ROUTINE', 'URGENT', 'STAT', 'ASAP');
CREATE TYPE "ClinicalNoteType" AS ENUM ('SOAP', 'PROGRESS', 'DISCHARGE', 'TRANSFER');
CREATE TYPE "CDSAlertType" AS ENUM ('DRUG_INTERACTION', 'ALLERGY_ALERT', 'DOSAGE_WARNING', 'MISSING_LAB');
CREATE TYPE "ProviderNodeType" AS ENUM ('INDIVIDUAL_PROVIDER', 'ORGANIZATION', 'SPECIALTY_GROUP');
CREATE TYPE "ProviderEdgeType" AS ENUM ('REFERS_TO', 'COLLABORATES_WITH', 'SUPERVISES');

-- ==================== CORE TABLES ====================

-- Auth & Users
CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "wysh_id" VARCHAR UNIQUE,
  "phone_number" VARCHAR UNIQUE,
  "email" VARCHAR UNIQUE,
  "full_name" VARCHAR NOT NULL,
  "preferred_language" VARCHAR DEFAULT 'en',
  "avatar_url" VARCHAR,
  "date_of_birth" TIMESTAMPTZ,
  "gender" VARCHAR,
  "blood_group" VARCHAR,
  "aadhaar_last4" VARCHAR,
  "abha_address" VARCHAR UNIQUE,
  "abha_number_masked" VARCHAR,
  "emergency_profile" JSONB,
  "chronic_conditions" TEXT[] DEFAULT '{}',
  "allergies_summary" TEXT[] DEFAULT '{}',
  "is_phone_verified" BOOLEAN DEFAULT false,
  "status" "VerificationStatus" DEFAULT 'PENDING',
  "deleted_at" TIMESTAMPTZ NULL,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now(),
  "tenant_id" VARCHAR
);

-- Indexes for users
CREATE INDEX "idx_users_phone_number" ON "users"("phone_number");
CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_wysh_id" ON "users"("wysh_id");
CREATE INDEX "idx_users_status" ON "users"("status");
CREATE INDEX "idx_users_full_name" ON "users"("full_name");
CREATE INDEX "idx_users_created_at" ON "users"("created_at");

-- User Roles
CREATE TABLE "user_roles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "role" "Role" NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  UNIQUE("user_id", "role")
);

CREATE INDEX "idx_user_roles_user_id" ON "user_roles"("user_id");
CREATE INDEX "idx_user_roles_role" ON "user_roles"("role");

-- Device Sessions
CREATE TABLE "device_sessions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "refresh_token_id" UUID REFERENCES "refresh_tokens"("id") ON DELETE SET NULL,
  "device_name" VARCHAR,
  "device_fingerprint" VARCHAR UNIQUE,
  "ip_address" VARCHAR,
  "user_agent" VARCHAR,
  "last_seen_at" TIMESTAMPTZ DEFAULT now(),
  "expires_at" TIMESTAMPTZ NOT NULL,
  "revoked_at" TIMESTAMPTZ NULL,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_device_sessions_user_id" ON "device_sessions"("user_id");
CREATE INDEX "idx_device_sessions_revoked_at" ON "device_sessions"("revoked_at");
CREATE INDEX "idx_device_sessions_fingerprint" ON "device_sessions"("device_fingerprint");

-- Refresh Tokens
CREATE TABLE "refresh_tokens" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token_hash" VARCHAR UNIQUE NOT NULL,
  "device_id" UUID,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "revoked_at" TIMESTAMPTZ NULL,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_refresh_tokens_user_id" ON "refresh_tokens"("user_id");
CREATE INDEX "idx_refresh_tokens_expires_at" ON "refresh_tokens"("expires_at");

-- Otp Challenges
CREATE TABLE "otp_challenges" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "phone_number" VARCHAR NOT NULL,
  "otp_hash" VARCHAR NOT NOT NULL,
  "purpose" VARCHAR NOT NULL,
  "channel" "NotificationChannel" NOT NULL,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "verified_at" TIMESTAMPTZ NULL,
  "attempt_count" INTEGER DEFAULT 0,
  "metadata" JSONB DEFAULT '{}',
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_otp_challenges_phone_number" ON "otp_challenges"("phone_number");
CREATE INDEX "idx_otp_challenges_expires_at" ON "otp_challenges"("expires_at");
CREATE INDEX "idx_otp_challenges_purpose" ON "otp_challenges"("purpose");

-- ==================== ORGANIZATIONS ====================

-- Clinics
CREATE TABLE "clinics" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR NOT NULL,
  "slug" VARCHAR UNIQUE NOT NULL,
  "description" TEXT,
  "phone_number" VARCHAR NOT NULL,
  "address_line_1" VARCHAR NOT NULL,
  "address_line_2" VARCHAR,
  "city" VARCHAR NOT NULL,
  "state" VARCHAR NOT NULL,
  "pincode" VARCHAR NOT NULL,
  "latitude" DECIMAL(9, 6),
  "longitude" DECIMAL(9, 6),
  "languages" TEXT[] DEFAULT '{}',
  "verification_status" "VerificationStatus" DEFAULT 'PENDING',
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now(),
  "tenant_id" VARCHAR,
  "email" VARCHAR,
  "facilities" TEXT[] DEFAULT '{}',
  "logo_url" VARCHAR,
  "operating_hours" JSONB,
  "services" TEXT[] DEFAULT '{}',
  "timezone" VARCHAR DEFAULT 'Asia/Kolkata',
  "website" VARCHAR
);

CREATE INDEX "idx_clinics_city_pincode" ON "clinics"("city", "pincode");
CREATE INDEX "idx_clinics_verification_status" ON "clinics"("verification_status");
CREATE INDEX "idx_clinics_slug" ON "clinics"("slug");

-- Doctor-Clinic mappings
CREATE TABLE "doctor_clinics" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "doctor_id" UUID NOT NULL REFERENCES "doctor_profiles"("id") ON DELETE CASCADE,
  "clinic_id" UUID NOT NULL REFERENCES "clinics"("id") ON DELETE CASCADE,
  "is_primary" BOOLEAN DEFAULT false,
  "consultation_fee" INTEGER,
  "monday_slots" JSONB,
  "tuesday_slots" JSONB,
  "wednesday_slots" JSONB,
  "thursday_slots" JSONB,
  "friday_slots" JSONB,
  "saturday_slots" JSONB,
  "sunday_slots" JSONB,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  UNIQUE("doctor_id", "clinic_id")
);

CREATE INDEX "idx_doctor_clinics_doctor_id" ON "doctor_clinics"("doctor_id");
CREATE INDEX "idx_doctor_clinics_clinic_id" ON "doctor_clinics"("clinic_id");
CREATE INDEX "idx_doctor_clinics_is_primary" ON "doctor_clinics"("is_primary");

-- Staff Assignments
CREATE TABLE "staff_assignments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "clinic_id" UUID NOT NULL REFERENCES "clinics"("id") ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "role" "StaffRole" NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_staff_assignments_clinic_id" ON "staff_assignments"("clinic_id");
CREATE INDEX "idx_staff_assignments_user_id" ON "staff_assignments"("user_id");
CREATE INDEX "idx_staff_assignments_role" ON "staff_assignments"("role");

-- ==================== HEALTH RECORDS ====================

-- Health Records
CREATE TABLE "health_records" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "record_type" "RecordType" NOT NULL,
  "title" VARCHAR NOT NULL,
  "description" TEXT,
  "source" VARCHAR NOT NULL,
  "source_reference_id" VARCHAR,
  "storage_key" VARCHAR,
  "mime_type" VARCHAR,
  "file_size" INTEGER,
  "extracted_text" TEXT,
  "structured_payload" JSONB,
  "encrypted_dek" VARCHAR,
  "hash" VARCHAR,
  "file_iv" VARCHAR,
  "file_auth_tag" VARCHAR,
  "version" INTEGER DEFAULT 1,
  "recorded_at" TIMESTAMPTZ NOT NULL,
  "deleted_at" TIMESTAMPTZ NULL,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_health_records_user_id" ON "health_records"("user_id");
CREATE INDEX "idx_health_records_record_type" ON "health_records"("record_type");
CREATE INDEX "idx_health_records_recorded_at" ON "health_records"("recorded_at");
CREATE INDEX "idx_health_records_source" ON "health_records"("source");

-- Prescriptions
CREATE TABLE "prescriptions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "health_record_id" UUID REFERENCES "health_records"("id") ON DELETE SET NULL,
  "patient_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "doctor_profile_id" UUID REFERENCES "doctor_profiles"("id") ON DELETE SET NULL,
  "appointment_id" UUID REFERENCES "appointments"("id") ON DELETE SET NULL,
  "diagnosis_summary" TEXT,
  "instructions" TEXT,
  "refill_due_at" TIMESTAMPTZ NULL,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "consultation_id" UUID REFERENCES "consultation_sessions"("id") ON DELETE SET NULL,
  "diagnosis" JSONB,
  "issued_at" TIMESTAMPTZ NULL,
  "notes" TEXT,
  "status" "PrescriptionStatus" DEFAULT 'DRAFT',
  "tenant_id" VARCHAR,
  "updated_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_prescriptions_patient_user_id" ON "prescriptions"("patient_user_id");
CREATE INDEX "idx_prescriptions_status" ON "prescriptions"("status");
CREATE INDEX "idx_prescriptions_created_at" ON "prescriptions"("created_at");
CREATE INDEX "idx_prescriptions_doctor_profile_id" ON "prescriptions"("doctor_profile_id");
CREATE INDEX "idx_prescriptions_tenant_id" ON "prescriptions"("tenant_id");

-- Medications
CREATE TABLE "medications" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "prescription_id" UUID REFERENCES "prescriptions"("id") ON DELETE SET NULL,
  "health_record_id" UUID REFERENCES "health_records"("id") ON DELETE SET NULL,
  "name" VARCHAR NOT NULL,
  "dosage" VARCHAR,
  "frequency" VARCHAR,
  "duration_days" INTEGER,
  "route" VARCHAR,
  "generic_name" VARCHAR,
  "interaction_warnings" TEXT[] DEFAULT '{}',
  "adherence_status" VARCHAR,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_medications_name" ON "medications"("name");
CREATE INDEX "idx_medications_prescription_id" ON "medications"("prescription_id");
CREATE INDEX "idx_medications_health_record_id" ON "medications"("health_record_id");

-- Diagnostic Reports
CREATE TABLE "diagnostic_reports" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "health_record_id" UUID NOT NULL REFERENCES "health_records"("id") ON DELETE CASCADE,
  "patient_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "lab_partner_id" UUID REFERENCES "diagnostics_partners"("id") ON DELETE SET NULL,
  "report_type" VARCHAR NOT NULL,
  "summary" TEXT,
  "abnormal_markers" JSONB,
  "trend_snapshot" JSONB,
  "recorded_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_diagnostic_reports_patient_user_id" ON "diagnostic_reports"("patient_user_id");
CREATE INDEX "idx_diagnostic_reports_report_type" ON "diagnostic_reports"("report_type");
CREATE INDEX "idx_diagnostic_reports_recorded_at" ON "diagnostic_reports"("recorded_at");
CREATE INDEX "idx_diagnostic_reports_lab_partner_id" ON "diagnostic_reports"("lab_partner_id");

-- Timeline Events
CREATE TABLE "timeline_events" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "health_record_id" UUID REFERENCES "health_records("id") ON DELETE SET NULL,
  "type" "TimelineEventType" NOT NULL,
  "title" VARCHAR NOT NULL,
  "summary" TEXT NOT NULL,
  "metadata" JSONB DEFAULT '{}',
  "occurred_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_timeline_events_user_id" ON "timeline_events"("user_id");
CREATE INDEX "idx_timeline_events_occurred_at" ON "timeline_events"("occurred_at");
CREATE INDEX "idx_timeline_events_type" ON "timeline_events"("type");
CREATE INDEX "idx_timeline_events_user_id_type" ON "timeline_events"("user_id", "type");
CREATE INDEX "idx_timeline_events_type_occurred_at" ON "timeline_events"("type", "occurred_at");

-- ==================== APPOINTMENTS & TELEMEDICINE ====================

-- Appointments
CREATE TABLE "appointments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "patient_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "doctor_profile_id" UUID NOT NULL REFERENCES "doctor_profiles"("id") ON DELETE CASCADE,
  "doctor_user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "clinic_id" UUID REFERENCES "clinics"("id") ON DELETE SET NULL,
  "status" "AppointmentStatus" DEFAULT 'REQUESTED',
  "consultation_mode" "ConsultationMode" DEFAULT 'VIDEO',
  "reason" TEXT NOT NULL,
  "slot_start_at" TIMESTAMPTZ NOT NOT NULL,
  "slot_end_at" TIMESTAMPTZ NOT NULL,
  "booked_at" TIMESTAMPTZ DEFAULT now(),
  "payment_order_id" UUID REFERENCES "payment_orders"("id") ON DELETE SET NULL,
  "consultation_room_id" UUID,
  "tenant_id" VARCHAR,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_appointments_patient_user_id" ON "appointments"("patient_user_id");
CREATE INDEX "idx_appointments_doctor_profile_id" ON "appointments"("doctor_profile_id");
CREATE INDEX "idx_appointments_doctor_user_id" ON "appointments"("doctor_user_id");
CREATE INDEX "idx_appointments_clinic_id" ON "appointments"("clinic_id");
CREATE INDEX "idx_appointments_status" ON "appointments"("status");
CREATE INDEX "idx_appointments_slot_start_at" ON "appointments"("slot_start_at");
CREATE INDEX "idx_appointments_consultation_mode" ON "appointments"("consultation_mode");
CREATE INDEX "idx_appointments_tenant_id" ON "appointments"("tenant_id");
CREATE INDEX "idx_appointments_booked_at" ON "appointments"("booked_at");

-- Consultation Sessions
CREATE TABLE "consultation_sessions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "appointment_id" UUID UNIQUE NOT NULL REFERENCES "appointments"("id") ON DELETE CASCADE,
  "doctor_profile_id" UUID NOT NULL REFERENCES "doctor_profiles"("id") ON DELETE CASCADE,
  "patient_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "mode" "ConsultationMode" NOT NULL,
  "livekit_room_name" VARCHAR,
  "waiting_room_open_at" TIMESTAMPTZ NULL,
  "started_at" TIMESTAMPTZ NULL,
  "ended_at" TIMESTAMPTZ NULL,
  "recording_reference" VARCHAR,
  "chat_transcript" JSONB,
  "notes" TEXT,
  "ai_summary" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "tenant_id" VARCHAR
);

CREATE INDEX "idx_consultation_sessions_appointment_id" ON "consultation_sessions"("appointment_id");
CREATE INDEX "idx_consultation_sessions_doctor_profile_id" ON "consultation_sessions"("doctor_profile_id");
CREATE INDEX "idx_consultation_sessions_patient_user_id" ON "consultation_sessions"("patient_user_id");
CREATE INDEX "idx_consultation_sessions_mode" ON "consultation_sessions"("mode");
CREATE INDEX "idx_consultation_sessions_created_at" ON "consultation_sessions"("created_at");
CREATE INDEX "idx_consultation_sessions_tenant_id" ON "consultation_sessions"("tenant_id");

-- Consultation Recordings
CREATE TABLE "consultation_recordings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "consultation_session_id" UUID NOT NULL REFERENCES "consultation_sessions"("id") ON DELETE CASCADE,
  "recording_url" VARCHAR NOT NULL,
  "duration_seconds" INTEGER,
  "file_size" INTEGER,
  "mime_type" VARCHAR,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_consultation_recordings_session_id" ON "consultation_recordings"("consultation_session_id");

-- Consultation SOAP Notes
CREATE TABLE "consultation_soap" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "consultation_session_id" UUID NOT NULL REFERENCES "consultation_sessions"("id") ON DELETE CASCADE,
  "subjective" TEXT,
  "objective" TEXT,
  "assessment" TEXT,
  "plan" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_consultation_soap_session_id" ON "consultation_soap"("consultation_session_id");

-- Consultation Transcripts
CREATE TABLE "consultation_transcripts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "consultation_session_id" UUID NOT NULL REFERENCES "consultation_sessions"("id") ON DELETE CASCADE,
  "transcript" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_consultation_transcripts_session_id" ON "consultation_transcripts"("consultation_session_id");

-- Consultation Summaries
CREATE TABLE "consultation_summaries" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" VARCHAR NOT NULL,
  "summary" TEXT NOT NULL,
  "follow_up_actions" TEXT[] DEFAULT '{}',
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_consultation_summaries_user_id" ON "consultation_summaries"("user_id");
CREATE INDEX "idx_consultation_summaries_created_at" ON "consultation_summaries"("created_at");

-- ==================== PAYMENTS & BILLING ====================

-- Payment Orders
CREATE TABLE "payment_orders" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "provider_reference" VARCHAR UNIQUE,
  "order_type" VARCHAR NOT NULL,
  "status" "PaymentStatus" DEFAULT 'CREATED',
  "currency" VARCHAR DEFAULT 'INR',
  "amount" INTEGER NOT NULL,
  "tax_amount" INTEGER DEFAULT 0,
  "platform_fee_amount" INTEGER DEFAULT 0,
  "provider_share_amount" INTEGER DEFAULT 0,
  "refund_amount" INTEGER DEFAULT 0,
  "metadata" JSONB DEFAULT '{}',
  "captured_at" TIMESTAMPTZ NULL,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_payment_orders_user_id" ON "payment_orders"("user_id");
CREATE INDEX "idx_payment_orders_status" ON "payment_orders"("status");
CREATE INDEX "idx_payment_orders_created_at" ON "payment_orders"("created_at");
CREATE INDEX "idx_payment_orders_provider_reference" ON "payment_orders"("provider_reference");

-- Billing Invoices
CREATE TABLE "billing_invoices" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "clinic_id" UUID NOT NULL REFERENCES "clinics"("id") ON DELETE CASCADE,
  "patient_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "appointment_id" UUID REFERENCES "appointments"("id") ON DELETE SET NULL,
  "invoice_number" VARCHAR UNIQUE NOT NULL,
  "status" "InvoiceStatus" DEFAULT 'DRAFT',
  "subtotal" INTEGER DEFAULT 0,
  "tax_amount" INTEGER DEFAULT 0,
  "discount_amount" INTEGER DEFAULT 0,
  "total_amount" INTEGER DEFAULT 0,
  "paid_amount" INTEGER DEFAULT 0,
  "due_amount" INTEGER DEFAULT 0,
  "payment_method" VARCHAR,
  "payment_reference" VARCHAR,
  "payment_details" JSONB DEFAULT '{}',
  "due_date" TIMESTAMPTZ NULL,
  "issued_at" TIMESTAMPTZ NULL,
  "paid_at" TIMESTAMPTZ NULL,
  "cancelled_at" TIMESTAMPTZ NULL,
  "cancellation_reason" TEXT,
  "notes" TEXT,
  "metadata" JSONB DEFAULT '{}',
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_billing_invoices_clinic_id" ON "billing_invoices"("clinic_id");
CREATE INDEX "idx_billing_invoices_status" ON "billing_invoices"("status");
CREATE INDEX "idx_billing_invoices_created_at" ON "billing_invoices"("created_at");
CREATE INDEX "idx_billing_invoices_invoice_number" ON "billing_invoices"("invoice_number");
CREATE INDEX "idx_billing_invoices_patient_user_id" ON "billing_invoices"("patient_user_id");

-- Billing Items
CREATE TABLE "billing_items" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "invoice_id" UUID NOT NULL REFERENCES "billing_invoices"("id") ON DELETE CASCADE,
  "description" VARCHAR NOT NULL,
  "category" "BillingCategory" DEFAULT 'OTHER',
  "quantity" INTEGER DEFAULT 1,
  "unit_price" INTEGER DEFAULT 0,
  "total_price" INTEGER DEFAULT 0,
  "tax_percent" INTEGER DEFAULT 0,
  "tax_amount" INTEGER DEFAULT 0,
  "discount_percent" INTEGER DEFAULT 0,
  "discount_amount" INTEGER DEFAULT 0,
  "net_price" INTEGER DEFAULT 0,
  "reference_id" VARCHAR,
  "reference_type" VARCHAR,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_billing_items_invoice_id" ON "billing_items"("invoice_id");

-- ==================== PHARMACY ====================

-- Pharmacy Partners
CREATE TABLE "pharmacy_partners" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR NOT NULL,
  "phone_number" VARCHAR NOT NULL,
  "city" VARCHAR NOT NULL,
  "state" VARCHAR NOT NULL,
  "pincode" VARCHAR NOT NULL,
  "latitude" DECIMAL(9, 6),
  "longitude" DECIMAL(9, 6),
  "verification_status" "VerificationStatus" DEFAULT 'PENDING',
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "supports_delivery" BOOLEAN DEFAULT true,
  "address" VARCHAR,
  "delivery_radius_km" INTEGER DEFAULT 10,
  "is_active" BOOLEAN DEFAULT true,
  "logo_url" VARCHAR,
  "tenant_id" VARCHAR,
  "updated_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_pharmacy_partners_city_pincode" ON "pharmacy_partners"("city", "pincode");
CREATE INDEX "idx_pharmacy_partners_is_active" ON "pharmacy_partners"("is_active");
CREATE INDEX "idx_pharmacy_partners_verification_status" ON "pharmacy_partners"("verification_status");
CREATE INDEX "idx_pharmacy_partners_tenant_id" ON "pharmacy_partners"("tenant_id");

-- Pharmacy Orders
CREATE TABLE "pharmacy_orders" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "partner_id" UUID REFERENCES "pharmacy_partners"("id") ON DELETE SET NULL,
  "prescription_id" UUID REFERENCES "prescriptions"("id") ON DELETE SET NULL,
  "status" "OrderStatus" DEFAULT 'DRAFT',
  "quoted_total" INTEGER NULL,
  "delivery_address" JSONB,
  "medicine_payload" JSONB,
  "fulfillment_notes" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now(),
  "cancel_reason" VARCHAR NULL,
  "cancelled_at" TIMESTAMPTZ NULL,
  "consultation_id" UUID REFERENCES "consultation_sessions"("id") ON DELETE SET NULL,
  "delivered_at" TIMESTAMPTZ NULL,
  "delivery_partner" VARCHAR,
  "estimated_delivery" TIMESTAMPTZ NULL,
  "payment_order_id" UUID REFERENCES "payment_orders("id") ON DELETE SET NULL,
  "tenant_id" VARCHAR,
  "tracking_url" VARCHAR
);

CREATE INDEX "idx_pharmacy_orders_user_id" ON "pharmacy_orders"("user_id");
CREATE INDEX "idx_pharmacy_orders_status" ON "pharmacy_orders"("status");
CREATE INDEX "idx_pharmacy_orders_partner_id" ON "pharmacy_orders"("partner_id");
CREATE INDEX "idx_pharmacy_orders_prescription_id" ON "pharmacy_orders"("prescription_id");
CREATE INDEX "idx_pharmacy_orders_created_at" ON "pharmacy_orders"("created_at");
CREATE INDEX "idx_pharmacy_orders_tenant_id" ON "pharmacy_orders"("tenant_id");

-- Pharmacy Inventory
CREATE TABLE "pharmacy_inventory" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "partner_id" UUID NOT NULL REFERENCES "pharmacy_partners"("id") ON DELETE CASCADE,
  "drug_id" UUID NOT NULL REFERENCES "drugs"("id") ON DELETE CASCADE,
  "stock_quantity" INTEGER NOT NULL DEFAULT 0,
  "reserved_quantity" INTEGER DEFAULT 0,
  "minimum_stock_level" INTEGER DEFAULT 5,
  "maximum_stock_level" INTEGER DEFAULT 1000,
  "batch_number" VARCHAR,
  "expiry_date" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_pharmacy_inventory_partner_id" ON "pharmacy_inventory"("partner_id");
CREATE INDEX "idx_pharmacy_inventory_drug_id" ON "pharmacy_inventory"("drug_id");
CREATE INDEX "idx_pharmacy_inventory_expiry_date" ON "pharmacy_inventory"("expiry_date");
CREATE INDEX "idx_pharmacy_inventory_stock_quantity" ON "pharmacy_inventory"("stock_quantity");

-- Drugs
CREATE TABLE "drugs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR NOT NULL,
  "generic_name" VARCHAR NOT NULL,
  "brand_name" VARCHAR,
  "manufacturer" VARCHAR,
  "dosage_form" VARCHAR,
  "strength" VARCHAR,
  "unit" VARCHAR,
  "therapeutic_class" VARCHAR,
  "pharmacological_class" VARCHAR,
  "prescription_required" BOOLEAN DEFAULT true,
  "schedule" VARCHAR,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_drugs_name" ON "drugs"("name");
CREATE INDEX "idx_drugs_generic_name" ON "drugs"("generic_name");
CREATE INDEX "idx_drugs_manufacturer" ON "drugs"("manufacturer");
CREATE INDEX "idx_drugs_therapeutic_class" ON "drugs"("therapeutic_class");

-- Pharmacy Cart Items
CREATE TABLE "pharmacy_cart_items" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "partner_id" UUID REFERENCES "pharmacy_partners"("id") ON DELETE SET NULL,
  "drug_id" UUID REFERENCES "drugs"("id") ON DELETE SET NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "added_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_pharmacy_cart_items_user_id" ON "pharmacy_cart_items"("user_id");
CREATE INDEX "idx_pharmacy_cart_items_partner_id" ON "pharmacy_cart_items"("partner_id");
CREATE INDEX "idx_pharmacy_cart_items_drug_id" ON "pharmacy_cart_items"("drug_id");

-- Prescription Items (line items in prescriptions)
CREATE TABLE "prescription_items" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "prescription_id" UUID NOT NULL REFERENCES "prescriptions"("id") ON DELETE CASCADE,
  "medication_id" UUID NOT NULL REFERENCES "medications"("id") ON DELETE CASCADE,
  "dosage" VARCHAR,
  "frequency" VARCHAR,
  "duration" VARCHAR,
  "quantity" INTEGER,
  "instructions" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_prescription_items_prescription_id" ON "prescription_items"("prescription_id");
CREATE INDEX "idx_prescription_items_medication_id" ON "prescription_items"("medication_id");

-- Prescription Verification
CREATE TABLE "prescription_verifications" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "prescription_id" UUID NOT NULL REFERENCES "prescriptions"("id") ON DELETE CASCADE,
  "verified_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "verification_status" VARCHAR,
  "verification_notes" TEXT,
  "verified_at" TIMESTAMPTZ NULL,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_prescription_verifications_prescription_id" ON "prescription_verifications"("prescription_id");

-- Dispensing Records
CREATE TABLE "dispensing_records" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "prescription_id" UUID REFERENCES "prescriptions"("id") ON DELETE SET NULL,
  "pharmacy_partner_id" UUID REFERENCES "pharmacy_partners"("id") ON DELETE SET NULL,
  "pharmacist_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "patient_user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "dispensed_at" TIMESTAMPTZ NULL,
  "quantity_dispensed" INTEGER,
  "batch_number" VARCHAR,
  "expiry_date" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_dispensing_records_prescription_id" ON "dispensing_records"("prescription_id");
CREATE INDEX "idx_dispensing_records_pharmacy_partner_id" ON "dispensing_records"("pharmacy_partner_id");
CREATE INDEX "idx_dispensing_records_pharmacist_id" ON "dispensing_records"("pharmacist_id");
CREATE INDEX "idx_dispensing_records_patient_user_id" ON "dispensing_records"("patient_user_id");

-- Medication Adherence Logs
CREATE TABLE "medication_adherence_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "medication_id" UUID NOT NULL REFERENCES "medications"("id") ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status" "AdherenceStatus" NOT NULL,
  "scheduled_at" TIMESTAMPTZ NOT NULL,
  "taken_at" TIMESTAMPTZ NULL,
  "delayed_by" INTEGER NULL,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_medication_adherence_logs_medication_id" ON "medication_adherence_logs"("medication_id");
CREATE INDEX "idx_medication_adherence_logs_user_id" ON "medication_adherence_logs"("user_id");
CREATE INDEX "idx_medication_adherence_logs_scheduled_at" ON "medication_adherence_logs"("scheduled_at");
CREATE INDEX "idx_medication_adherence_logs_status" ON "medication_adherence_logs"("status");

-- Medication Reminders
CREATE TABLE "medication_reminders" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "medication_id" UUID NOT NULL REFERENCES "medications"("id") ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "reminder_time" TIMESTAMPTZ NOT NULL,
  "is_sent" BOOLEAN DEFAULT false,
  "sent_at" TIMESTAMPTZ NULL,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_medication_reminders_medication_id" ON "medication_reminders"("medication_id");
CREATE INDEX "idx_medication_reminders_user_id" ON "medication_reminders"("user_id");
CREATE INDEX "idx_medication_reminders_reminder_time" ON "medication_reminders"("reminder_time");
CREATE INDEX "idx_medication_reminders_is_sent" ON "medication_reminders"("is_sent");

-- Medication Schedules
CREATE TABLE "medication_schedules" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "start_date" TIMESTAMPTZ NOT NULL,
  "end_date" TIMESTAMPTZ NULL,
  "frequency" VARCHAR NOT NULL,
  "dosage" VARCHAR NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_medication_schedules_user_id" ON "medication_schedules"("user_id");
CREATE INDEX "idx_medication_schedules_start_date" ON "medication_schedules"("start_date");
CREATE INDEX "idx_medication_schedules_end_date" ON "medication_schedules"("end_date");

-- Procurement Orders
CREATE TABLE "procurement_orders" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "partner_id" UUID NOT NULL REFERENCES "pharmacy_partners"("id") ON DELETE CASCADE,
  "drug_id" UUID NOT NULL REFERENCES "drugs"("id") ON DELETE CASCADE,
  "quantity" INTEGER NOT NULL,
  "unit_cost" INTEGER NOT NULL,
  "total_cost" INTEGER NOT NULL,
  "status" VARCHAR DEFAULT 'PENDING',
  "ordered_at" TIMESTAMPTZ DEFAULT now(),
  "expected_delivery" TIMESTAMPTZ NULL,
  "delivered_at" TIMESTAMPTZ NULL,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_procurement_orders_partner_id" ON "procurement_orders"("partner_id");
CREATE INDEX "idx_procurement_orders_drug_id" ON "procurement_orders"("drug_id");
CREATE INDEX "idx_procurement_orders_status" ON "procurement_orders"("status");
CREATE INDEX "idx_procurement_orders_ordered_at" ON "procurement_orders"("ordered_at");

-- ==================== DIAGNOSTICS ====================

-- Diagnostics Partners
CREATE TABLE "diagnostics_partners" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR NOT NULL,
  "city" VARCHAR NOT NULL,
  "pincode" VARCHAR NOT NULL,
  "home_collection" BOOLEAN DEFAULT false,
  "accreditation" VARCHAR,
  "verification_status" "VerificationStatus" DEFAULT 'PENDING',
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_diagnostics_partners_city_pincode" ON "diagnostics_partners"("city", "pincode");
CREATE INDEX "idx_diagnostics_partners_home_collection" ON "diagnostics_partners"("home_collection");
CREATE INDEX "idx_diagnostics_partners_verification_status" ON "diagnostics_partners"("verification_status");

-- Diagnostic Orders
CREATE TABLE "diagnostic_orders" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "partner_id" UUID REFERENCES "diagnostics_partners"("id") ON DELETE SET NULL,
  "test_codes" TEXT[] NOT NULL,
  "status" "OrderStatus" DEFAULT 'DRAFT',
  "home_collection" BOOLEAN DEFAULT false,
  "slot_start_at" TIMESTAMPTZ NULL,
  "slot_end_at" TIMESTAMPTZ NULL,
  "price_quoted" INTEGER NULL,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_diagnostic_orders_user_id" ON "diagnostic_orders"("user_id");
CREATE INDEX "idx_diagnostic_orders_status" ON "diagnostic_orders"("status");
CREATE INDEX "idx_diagnostic_orders_partner_id" ON "diagnostic_orders"("partner_id");
CREATE INDEX "idx_diagnostic_orders_created_at" ON "diagnostic_orders"("created_at");

-- Lab Samples
CREATE TABLE "lab_samples" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "diagnostic_order_id" UUID NOT NULL REFERENCES "diagnostic_orders"("id") ON DELETE CASCADE,
  "sample_id" VARCHAR UNIQUE NOT NULL,
  "sample_type" VARCHAR NOT NULL,
  "collection_at" TIMESTAMPTZ NOT NULL,
  "collected_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "received_at" TIMESTAMPTZ NULL,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_lab_samples_diagnostic_order_id" ON "lab_samples"("diagnostic_order_id");
CREATE INDEX "idx_lab_samples_sample_id" ON "lab_samples"("sample_id");
CREATE INDEX "idx_lab_samples_sample_type" ON "lab_samples"("sample_type");
CREATE INDEX "idx_lab_samples_collected_at" ON "lab_samples"("collected_at");

-- Lab Results
CREATE TABLE "lab_results" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "lab_sample_id" UUID NOT NULL REFERENCES "lab_samples"("id") ON DELETE CASCADE,
  "test_name" VARCHAR NOT NULL,
  "test_code" VARCHAR NOT NULL,
  "result_value" VARCHAR,
  "unit" VARCHAR,
  "reference_range" VARCHAR,
  "is_abnormal" BOOLEAN,
  "flags" TEXT[] DEFAULT '{}',
  "method" VARCHAR,
  "instrument" VARCHAR,
  "technician" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "verified_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "tested_at" TIMESTAMPTZ NOT NULL,
  "verified_at" TIMESTAMPTZ NULL,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX "idx_lab_results_lab_sample_id" ON "lab_results"("lab_sample_id");
CREATE INDEX "idx_lab_results_test_name" ON "lab_results"("test_name");
CREATE INDEX "idx_lab_results_test_code" ON "lab_results"("test_code");
CREATE INDEX "idx_lab_results_is_abnormal" ON "lab_results"("is_abnormal");
CREATE INDEX "idx_lab_results_tested_at" ON "lab_results"("tested_at");



