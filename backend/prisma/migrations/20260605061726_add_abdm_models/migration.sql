--
-- ============================================================================
-- WYSHCARE PLATFORM
-- ============================================================================
--
-- File: backend/prisma/migrations/20260605061726_add_abdm_models/migration.sql
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
--  - TABLE
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

-- CreateEnum
CREATE TYPE "AbdmConsentStatus" AS ENUM ('REQUESTED', 'GRANTED', 'REVOKED', 'EXPIRED', 'DENIED');

-- CreateEnum
CREATE TYPE "HiType" AS ENUM ('PRESCRIPTION', 'DIAGNOSTIC_REPORT', 'DISCHARGE_SUMMARY', 'CONSULTATION_NOTE', 'IMMUNIZATION', 'HEALTH_DOCUMENT', 'WELLNESS_RECORD', 'LAB_REPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "HirStatus" AS ENUM ('PENDING', 'FULFILLED', 'PARTIALLY_FULFILLED', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "AbhaProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "abhaNumber" TEXT NOT NULL,
    "abhaAddress" TEXT NOT NULL,
    "healthIdNumber" TEXT,
    "name" TEXT,
    "gender" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "photo" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "lastVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbhaProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbdmConsent" (
    "id" TEXT NOT NULL,
    "patientUserId" TEXT NOT NULL,
    "consentId" TEXT NOT NULL,
    "consentManagerId" TEXT NOT NULL,
    "hipId" TEXT,
    "hiuId" TEXT,
    "purpose" TEXT NOT NULL,
    "hiTypes" "HiType"[],
    "permissionDateFrom" TIMESTAMP(3),
    "permissionDateTo" TIMESTAMP(3),
    "permissionFrequency" TEXT,
    "status" "AbdmConsentStatus" NOT NULL DEFAULT 'REQUESTED',
    "signature" TEXT,
    "grantedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbdmConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareContext" (
    "id" TEXT NOT NULL,
    "patientUserId" TEXT NOT NULL,
    "abhaAddress" TEXT NOT NULL,
    "careContextReference" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "healthRecordId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareContext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthInformationRequest" (
    "id" TEXT NOT NULL,
    "consentId" TEXT NOT NULL,
    "requesterUserId" TEXT NOT NULL,
    "patientUserId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "hiTypes" "HiType"[],
    "dateFrom" TIMESTAMP(3),
    "dateTo" TIMESTAMP(3),
    "status" "HirStatus" NOT NULL DEFAULT 'PENDING',
    "keyMaterial" JSONB,
    "responseMetadata" JSONB,
    "errorMessage" TEXT,
    "fulfilledAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthInformationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthInformationTransfer" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "hipId" TEXT,
    "hipName" TEXT,
    "hiuId" TEXT,
    "hiuName" TEXT,
    "careContextReference" TEXT,
    "dataPayload" JSONB,
    "encryptionDetails" JSONB,
    "sizeBytes" INTEGER,
    "checksum" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TRANSFERRED',
    "transferredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthInformationTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbdmAuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "hipId" TEXT,
    "hiuId" TEXT,
    "consentId" TEXT,
    "status" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AbdmAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AbhaProfile_userId_key" ON "AbhaProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AbhaProfile_abhaNumber_key" ON "AbhaProfile"("abhaNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AbhaProfile_abhaAddress_key" ON "AbhaProfile"("abhaAddress");

-- CreateIndex
CREATE INDEX "AbhaProfile_abhaAddress_idx" ON "AbhaProfile"("abhaAddress");

-- CreateIndex
CREATE INDEX "AbhaProfile_abhaNumber_idx" ON "AbhaProfile"("abhaNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AbdmConsent_consentId_key" ON "AbdmConsent"("consentId");

-- CreateIndex
CREATE INDEX "AbdmConsent_patientUserId_status_idx" ON "AbdmConsent"("patientUserId", "status");

-- CreateIndex
CREATE INDEX "AbdmConsent_consentId_idx" ON "AbdmConsent"("consentId");

-- CreateIndex
CREATE INDEX "AbdmConsent_expiresAt_status_idx" ON "AbdmConsent"("expiresAt", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CareContext_careContextReference_key" ON "CareContext"("careContextReference");

-- CreateIndex
CREATE INDEX "CareContext_patientUserId_isActive_idx" ON "CareContext"("patientUserId", "isActive");

-- CreateIndex
CREATE INDEX "CareContext_abhaAddress_idx" ON "CareContext"("abhaAddress");

-- CreateIndex
CREATE INDEX "CareContext_careContextReference_idx" ON "CareContext"("careContextReference");

-- CreateIndex
CREATE INDEX "HealthInformationRequest_consentId_idx" ON "HealthInformationRequest"("consentId");

-- CreateIndex
CREATE INDEX "HealthInformationRequest_requesterUserId_status_idx" ON "HealthInformationRequest"("requesterUserId", "status");

-- CreateIndex
CREATE INDEX "HealthInformationRequest_patientUserId_status_idx" ON "HealthInformationRequest"("patientUserId", "status");

-- CreateIndex
CREATE INDEX "HealthInformationRequest_expiresAt_status_idx" ON "HealthInformationRequest"("expiresAt", "status");

-- CreateIndex
CREATE INDEX "HealthInformationTransfer_requestId_idx" ON "HealthInformationTransfer"("requestId");

-- CreateIndex
CREATE INDEX "HealthInformationTransfer_hipId_idx" ON "HealthInformationTransfer"("hipId");

-- CreateIndex
CREATE INDEX "HealthInformationTransfer_hiuId_idx" ON "HealthInformationTransfer"("hiuId");

-- CreateIndex
CREATE INDEX "AbdmAuditLog_userId_createdAt_idx" ON "AbdmAuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AbdmAuditLog_action_createdAt_idx" ON "AbdmAuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AbdmAuditLog_consentId_idx" ON "AbdmAuditLog"("consentId");

-- AddForeignKey
ALTER TABLE "AbhaProfile" ADD CONSTRAINT "AbhaProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbdmConsent" ADD CONSTRAINT "AbdmConsent_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareContext" ADD CONSTRAINT "CareContext_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthInformationRequest" ADD CONSTRAINT "HealthInformationRequest_consentId_fkey" FOREIGN KEY ("consentId") REFERENCES "AbdmConsent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthInformationRequest" ADD CONSTRAINT "HealthInformationRequest_requesterUserId_fkey" FOREIGN KEY ("requesterUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthInformationRequest" ADD CONSTRAINT "HealthInformationRequest_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthInformationTransfer" ADD CONSTRAINT "HealthInformationTransfer_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "HealthInformationRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbdmAuditLog" ADD CONSTRAINT "AbdmAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
