--
-- ============================================================================
-- WYSHCARE PLATFORM
-- ============================================================================
--
-- File: backend/prisma/migrations/20260525145500_init/migration.sql
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
-- SQL migration or query: migration
--
-- Responsibilities:
--  * - Manage database schema and data migrations
--
-- Database:
--  - SCHEMA
 - TABLE
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

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PATIENT', 'DOCTOR', 'CLINIC_MANAGER', 'PHARMACY_PARTNER', 'LAB_PARTNER', 'ADMIN', 'SUPPORT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('DRAFT', 'PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ConsentStatus" AS ENUM ('PENDING', 'ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AccessMethod" AS ENUM ('MANUAL_APPROVAL', 'OTP_APPROVAL', 'SHARE_LINK', 'EMERGENCY_QR');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('FULL', 'LIMITED', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "TimelineEventType" AS ENUM ('APPOINTMENT', 'CONSULTATION', 'PRESCRIPTION', 'REPORT', 'UPLOAD', 'REFILL', 'LAB_BOOKING', 'PAYMENT', 'CONSENT', 'NOTE');

-- CreateEnum
CREATE TYPE "RecordType" AS ENUM ('PRESCRIPTION', 'DIAGNOSTIC_REPORT', 'DISCHARGE_SUMMARY', 'CONSULTATION_NOTE', 'VACCINATION', 'VITAL', 'BILL', 'OTHER');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ConsultationMode" AS ENUM ('VIDEO', 'AUDIO', 'CHAT', 'IN_PERSON');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'PENDING_VERIFICATION', 'QUOTED', 'ACCEPTED', 'FULFILLING', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('PHARMACY', 'DIAGNOSTICS', 'DELIVERY');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('SMS', 'WHATSAPP', 'EMAIL', 'PUSH', 'VOICE', 'IN_APP');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'READ');

-- CreateEnum
CREATE TYPE "AIJobType" AS ENUM ('OCR', 'REPORT_SUMMARY', 'SYMPTOM_ANALYSIS', 'MEDICATION_REVIEW', 'CARE_SUMMARY');

-- CreateEnum
CREATE TYPE "AIJobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('SELF', 'PARENT', 'CHILD', 'SPOUSE', 'CAREGIVER', 'SIBLING', 'GUARDIAN');

-- CreateEnum
CREATE TYPE "EmergencyAccessReason" AS ENUM ('UNRESPONSIVE_PATIENT', 'ROAD_ACCIDENT', 'CRITICAL_TRIAGE', 'ANAPHYLAXIS', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "wyshId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT,
    "fullName" TEXT NOT NULL,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "avatarUrl" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "bloodGroup" TEXT,
    "aadhaarLast4" TEXT,
    "abhaAddress" TEXT,
    "abhaNumberMasked" TEXT,
    "emergencyProfile" JSONB,
    "chronicConditions" TEXT[],
    "allergiesSummary" TEXT[],
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshTokenId" TEXT,
    "deviceName" TEXT NOT NULL,
    "deviceFingerprint" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "deviceId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyRelation" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "subjectUserId" TEXT NOT NULL,
    "relationship" "RelationshipType" NOT NULL,
    "canViewTimeline" BOOLEAN NOT NULL DEFAULT false,
    "canBookAppointments" BOOLEAN NOT NULL DEFAULT false,
    "canOrderMedicines" BOOLEAN NOT NULL DEFAULT false,
    "canUseEmergency" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FamilyRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "licenseDocumentUrl" TEXT,
    "kycMetadata" JSONB,
    "payoutAccountReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "subSpecializations" TEXT[],
    "qualifications" TEXT[],
    "yearsOfExperience" INTEGER NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "languages" TEXT[],
    "gender" TEXT,
    "bio" TEXT,
    "consultationFee" INTEGER NOT NULL,
    "telemedicineEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inClinicEnabled" BOOLEAN NOT NULL DEFAULT true,
    "approvalStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clinic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "languages" TEXT[],
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorClinic" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "consultationFee" INTEGER NOT NULL,
    "mondaySlots" JSONB,
    "tuesdaySlots" JSONB,
    "wednesdaySlots" JSONB,
    "thursdaySlots" JSONB,
    "fridaySlots" JSONB,
    "saturdaySlots" JSONB,
    "sundaySlots" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoctorClinic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentGrant" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "grantedToUserId" TEXT,
    "granteeExternalRef" TEXT,
    "accessLevel" "AccessLevel" NOT NULL,
    "accessMethod" "AccessMethod" NOT NULL,
    "status" "ConsentStatus" NOT NULL DEFAULT 'PENDING',
    "purpose" TEXT NOT NULL,
    "scope" JSONB NOT NULL,
    "accessReason" TEXT,
    "grantedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareLink" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "consentGrantId" TEXT,
    "tokenHash" TEXT NOT NULL,
    "accessLevel" "AccessLevel" NOT NULL,
    "maxViews" INTEGER NOT NULL DEFAULT 1,
    "currentViews" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyAccess" (
    "id" TEXT NOT NULL,
    "patientUserId" TEXT NOT NULL,
    "accessorUserId" TEXT,
    "reason" "EmergencyAccessReason" NOT NULL,
    "geoLatitude" DECIMAL(9,6),
    "geoLongitude" DECIMAL(9,6),
    "notes" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmergencyAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recordType" "RecordType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "source" TEXT NOT NULL,
    "sourceReferenceId" TEXT,
    "storageKey" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "extractedText" TEXT,
    "structuredPayload" JSONB,
    "encryptedDek" TEXT,
    "hash" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "HealthRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "healthRecordId" TEXT,
    "patientUserId" TEXT NOT NULL,
    "doctorProfileId" TEXT,
    "appointmentId" TEXT,
    "diagnosisSummary" TEXT,
    "instructions" TEXT,
    "refillDueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT,
    "healthRecordId" TEXT,
    "name" TEXT NOT NULL,
    "dosage" TEXT,
    "frequency" TEXT,
    "durationDays" INTEGER,
    "route" TEXT,
    "genericName" TEXT,
    "interactionWarnings" TEXT[],
    "adherenceStatus" TEXT,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosticReport" (
    "id" TEXT NOT NULL,
    "healthRecordId" TEXT NOT NULL,
    "patientUserId" TEXT NOT NULL,
    "labPartnerId" TEXT,
    "reportType" TEXT NOT NULL,
    "summary" TEXT,
    "abnormalMarkers" JSONB,
    "trendSnapshot" JSONB,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiagnosticReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "healthRecordId" TEXT,
    "type" "TimelineEventType" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "patientUserId" TEXT NOT NULL,
    "doctorProfileId" TEXT NOT NULL,
    "doctorUserId" TEXT,
    "clinicId" TEXT,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'REQUESTED',
    "consultationMode" "ConsultationMode" NOT NULL,
    "reason" TEXT NOT NULL,
    "slotStartAt" TIMESTAMP(3) NOT NULL,
    "slotEndAt" TIMESTAMP(3) NOT NULL,
    "bookedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentOrderId" TEXT,
    "consultationRoomId" TEXT,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultationSession" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "doctorProfileId" TEXT NOT NULL,
    "patientUserId" TEXT NOT NULL,
    "mode" "ConsultationMode" NOT NULL,
    "livekitRoomName" TEXT,
    "waitingRoomOpenAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "recordingReference" TEXT,
    "chatTranscript" JSONB,
    "notes" TEXT,
    "aiSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsultationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultationSummary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "followUpActions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsultationSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerReference" TEXT,
    "orderType" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "amount" INTEGER NOT NULL,
    "taxAmount" INTEGER NOT NULL DEFAULT 0,
    "platformFeeAmount" INTEGER NOT NULL DEFAULT 0,
    "providerShareAmount" INTEGER NOT NULL DEFAULT 0,
    "refundAmount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "capturedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PharmacyPartner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "supportsDelivery" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PharmacyPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PharmacyOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "partnerId" TEXT,
    "prescriptionId" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
    "quotedTotal" INTEGER,
    "deliveryAddress" JSONB NOT NULL,
    "medicinePayload" JSONB NOT NULL,
    "fulfillmentNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PharmacyOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosticsPartner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "homeCollection" BOOLEAN NOT NULL DEFAULT false,
    "accreditation" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiagnosticsPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosticOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "partnerId" TEXT,
    "testCodes" TEXT[],
    "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
    "homeCollection" BOOLEAN NOT NULL DEFAULT false,
    "slotStartAt" TIMESTAMP(3),
    "slotEndAt" TIMESTAMP(3),
    "priceQuoted" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiagnosticOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "templateKey" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "sentAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "patientUserId" TEXT,
    "consentGrantId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "reason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "immutableHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIMemoryNode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nodeType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "embeddingRef" TEXT,
    "sourceRef" TEXT,
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0.6,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIMemoryNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIMemoryEdge" (
    "id" TEXT NOT NULL,
    "fromNodeId" TEXT NOT NULL,
    "toNodeId" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "strength" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIMemoryEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "jobType" "AIJobType" NOT NULL,
    "status" "AIJobStatus" NOT NULL DEFAULT 'QUEUED',
    "inputPayload" JSONB NOT NULL,
    "outputPayload" JSONB,
    "model" TEXT,
    "languageCode" TEXT,
    "safetyFlags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AIJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ABDMLinkage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "abhaAddress" TEXT NOT NULL,
    "abhaNumberMasked" TEXT,
    "linkageReference" TEXT,
    "metadata" JSONB,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ABDMLinkage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_wyshId_key" ON "User"("wyshId");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_abhaAddress_key" ON "User"("abhaAddress");

-- CreateIndex
CREATE INDEX "User_fullName_idx" ON "User"("fullName");

-- CreateIndex
CREATE INDEX "User_phoneNumber_status_idx" ON "User"("phoneNumber", "status");

-- CreateIndex
CREATE INDEX "User_abhaAddress_idx" ON "User"("abhaAddress");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "UserRole_role_idx" ON "UserRole"("role");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_role_key" ON "UserRole"("userId", "role");

-- CreateIndex
CREATE INDEX "DeviceSession_userId_revokedAt_idx" ON "DeviceSession"("userId", "revokedAt");

-- CreateIndex
CREATE INDEX "DeviceSession_deviceFingerprint_idx" ON "DeviceSession"("deviceFingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_expiresAt_idx" ON "RefreshToken"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "OtpChallenge_phoneNumber_expiresAt_idx" ON "OtpChallenge"("phoneNumber", "expiresAt");

-- CreateIndex
CREATE INDEX "FamilyRelation_subjectUserId_idx" ON "FamilyRelation"("subjectUserId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyRelation_actorUserId_subjectUserId_relationship_key" ON "FamilyRelation"("actorUserId", "subjectUserId", "relationship");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderProfile_userId_key" ON "ProviderProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_userId_key" ON "DoctorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_registrationNumber_key" ON "DoctorProfile"("registrationNumber");

-- CreateIndex
CREATE INDEX "DoctorProfile_specialization_telemedicineEnabled_idx" ON "DoctorProfile"("specialization", "telemedicineEnabled");

-- CreateIndex
CREATE INDEX "DoctorProfile_approvalStatus_idx" ON "DoctorProfile"("approvalStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_slug_key" ON "Clinic"("slug");

-- CreateIndex
CREATE INDEX "Clinic_city_pincode_idx" ON "Clinic"("city", "pincode");

-- CreateIndex
CREATE INDEX "Clinic_verificationStatus_idx" ON "Clinic"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorClinic_doctorId_clinicId_key" ON "DoctorClinic"("doctorId", "clinicId");

-- CreateIndex
CREATE INDEX "ConsentGrant_ownerUserId_status_idx" ON "ConsentGrant"("ownerUserId", "status");

-- CreateIndex
CREATE INDEX "ConsentGrant_grantedToUserId_status_idx" ON "ConsentGrant"("grantedToUserId", "status");

-- CreateIndex
CREATE INDEX "ConsentGrant_expiresAt_status_idx" ON "ConsentGrant"("expiresAt", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ShareLink_tokenHash_key" ON "ShareLink"("tokenHash");

-- CreateIndex
CREATE INDEX "ShareLink_ownerUserId_expiresAt_idx" ON "ShareLink"("ownerUserId", "expiresAt");

-- CreateIndex
CREATE INDEX "ShareLink_expiresAt_revokedAt_idx" ON "ShareLink"("expiresAt", "revokedAt");

-- CreateIndex
CREATE INDEX "EmergencyAccess_patientUserId_createdAt_idx" ON "EmergencyAccess"("patientUserId", "createdAt");

-- CreateIndex
CREATE INDEX "HealthRecord_userId_recordType_recordedAt_idx" ON "HealthRecord"("userId", "recordType", "recordedAt");

-- CreateIndex
CREATE INDEX "HealthRecord_source_sourceReferenceId_idx" ON "HealthRecord"("source", "sourceReferenceId");

-- CreateIndex
CREATE INDEX "Prescription_patientUserId_createdAt_idx" ON "Prescription"("patientUserId", "createdAt");

-- CreateIndex
CREATE INDEX "Medication_name_idx" ON "Medication"("name");

-- CreateIndex
CREATE INDEX "DiagnosticReport_patientUserId_reportType_recordedAt_idx" ON "DiagnosticReport"("patientUserId", "reportType", "recordedAt");

-- CreateIndex
CREATE INDEX "TimelineEvent_userId_occurredAt_idx" ON "TimelineEvent"("userId", "occurredAt");

-- CreateIndex
CREATE INDEX "TimelineEvent_userId_type_occurredAt_idx" ON "TimelineEvent"("userId", "type", "occurredAt");

-- CreateIndex
CREATE INDEX "TimelineEvent_type_occurredAt_idx" ON "TimelineEvent"("type", "occurredAt");

-- CreateIndex
CREATE INDEX "Appointment_patientUserId_slotStartAt_idx" ON "Appointment"("patientUserId", "slotStartAt");

-- CreateIndex
CREATE INDEX "Appointment_doctorProfileId_slotStartAt_idx" ON "Appointment"("doctorProfileId", "slotStartAt");

-- CreateIndex
CREATE INDEX "Appointment_doctorUserId_slotStartAt_idx" ON "Appointment"("doctorUserId", "slotStartAt");

-- CreateIndex
CREATE INDEX "Appointment_status_slotStartAt_idx" ON "Appointment"("status", "slotStartAt");

-- CreateIndex
CREATE UNIQUE INDEX "ConsultationSession_appointmentId_key" ON "ConsultationSession"("appointmentId");

-- CreateIndex
CREATE INDEX "ConsultationSession_patientUserId_createdAt_idx" ON "ConsultationSession"("patientUserId", "createdAt");

-- CreateIndex
CREATE INDEX "ConsultationSummary_userId_createdAt_idx" ON "ConsultationSummary"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentOrder_providerReference_key" ON "PaymentOrder"("providerReference");

-- CreateIndex
CREATE INDEX "PaymentOrder_userId_status_createdAt_idx" ON "PaymentOrder"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "PharmacyPartner_city_pincode_idx" ON "PharmacyPartner"("city", "pincode");

-- CreateIndex
CREATE INDEX "PharmacyOrder_userId_status_idx" ON "PharmacyOrder"("userId", "status");

-- CreateIndex
CREATE INDEX "PharmacyOrder_partnerId_status_idx" ON "PharmacyOrder"("partnerId", "status");

-- CreateIndex
CREATE INDEX "DiagnosticsPartner_city_pincode_idx" ON "DiagnosticsPartner"("city", "pincode");

-- CreateIndex
CREATE INDEX "DiagnosticOrder_userId_status_idx" ON "DiagnosticOrder"("userId", "status");

-- CreateIndex
CREATE INDEX "Notification_userId_status_createdAt_idx" ON "Notification"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_patientUserId_createdAt_idx" ON "AuditLog"("patientUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_resourceType_resourceId_idx" ON "AuditLog"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "AIMemoryNode_userId_nodeType_idx" ON "AIMemoryNode"("userId", "nodeType");

-- CreateIndex
CREATE UNIQUE INDEX "AIMemoryEdge_fromNodeId_toNodeId_relation_key" ON "AIMemoryEdge"("fromNodeId", "toNodeId", "relation");

-- CreateIndex
CREATE INDEX "AIJob_jobType_status_createdAt_idx" ON "AIJob"("jobType", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ABDMLinkage_userId_key" ON "ABDMLinkage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ABDMLinkage_abhaAddress_key" ON "ABDMLinkage"("abhaAddress");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceSession" ADD CONSTRAINT "DeviceSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpChallenge" ADD CONSTRAINT "OtpChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyRelation" ADD CONSTRAINT "FamilyRelation_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyRelation" ADD CONSTRAINT "FamilyRelation_subjectUserId_fkey" FOREIGN KEY ("subjectUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderProfile" ADD CONSTRAINT "ProviderProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorProfile" ADD CONSTRAINT "DoctorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorClinic" ADD CONSTRAINT "DoctorClinic_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorClinic" ADD CONSTRAINT "DoctorClinic_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentGrant" ADD CONSTRAINT "ConsentGrant_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentGrant" ADD CONSTRAINT "ConsentGrant_grantedToUserId_fkey" FOREIGN KEY ("grantedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_consentGrantId_fkey" FOREIGN KEY ("consentGrantId") REFERENCES "ConsentGrant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyAccess" ADD CONSTRAINT "EmergencyAccess_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyAccess" ADD CONSTRAINT "EmergencyAccess_accessorUserId_fkey" FOREIGN KEY ("accessorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthRecord" ADD CONSTRAINT "HealthRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_healthRecordId_fkey" FOREIGN KEY ("healthRecordId") REFERENCES "HealthRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "DoctorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_healthRecordId_fkey" FOREIGN KEY ("healthRecordId") REFERENCES "HealthRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticReport" ADD CONSTRAINT "DiagnosticReport_healthRecordId_fkey" FOREIGN KEY ("healthRecordId") REFERENCES "HealthRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticReport" ADD CONSTRAINT "DiagnosticReport_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_healthRecordId_fkey" FOREIGN KEY ("healthRecordId") REFERENCES "HealthRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorUserId_fkey" FOREIGN KEY ("doctorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationSession" ADD CONSTRAINT "ConsultationSession_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationSession" ADD CONSTRAINT "ConsultationSession_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationSession" ADD CONSTRAINT "ConsultationSession_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationSummary" ADD CONSTRAINT "ConsultationSummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentOrder" ADD CONSTRAINT "PaymentOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyOrder" ADD CONSTRAINT "PharmacyOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyOrder" ADD CONSTRAINT "PharmacyOrder_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "PharmacyPartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticOrder" ADD CONSTRAINT "DiagnosticOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticOrder" ADD CONSTRAINT "DiagnosticOrder_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "DiagnosticsPartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_consentGrantId_fkey" FOREIGN KEY ("consentGrantId") REFERENCES "ConsentGrant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIMemoryNode" ADD CONSTRAINT "AIMemoryNode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIMemoryEdge" ADD CONSTRAINT "AIMemoryEdge_fromNodeId_fkey" FOREIGN KEY ("fromNodeId") REFERENCES "AIMemoryNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIMemoryEdge" ADD CONSTRAINT "AIMemoryEdge_toNodeId_fkey" FOREIGN KEY ("toNodeId") REFERENCES "AIMemoryNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIJob" ADD CONSTRAINT "AIJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ABDMLinkage" ADD CONSTRAINT "ABDMLinkage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

