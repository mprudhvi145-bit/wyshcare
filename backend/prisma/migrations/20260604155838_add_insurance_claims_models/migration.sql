--
-- ============================================================================
-- WYSHCARE PLATFORM
-- ============================================================================
--
-- File: backend/prisma/migrations/20260604155838_add_insurance_claims_models/migration.sql
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
CREATE TYPE "InsuranceProviderType" AS ENUM ('GOVT', 'PRIVATE', 'TPA');

-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ADJUDICATED', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'CANCELLED', 'APPEALED');

-- CreateEnum
CREATE TYPE "PreAuthStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "CoverageType" AS ENUM ('ROOM', 'CONSULTATION', 'MEDICATION', 'LAB_TEST', 'PROCEDURE', 'VACCINATION', 'EMERGENCY', 'AMBULANCE', 'DENTAL', 'VISION', 'MATERNITY', 'PRE_EXISTING', 'DAY_CARE', 'HEALTH_CHECKUP', 'OTHER');

-- CreateEnum
CREATE TYPE "ClaimDocumentType" AS ENUM ('PRESCRIPTION', 'DISCHARGE_SUMMARY', 'INVESTIGATION_REPORT', 'INVOICE', 'PAYMENT_RECEIPT', 'ID_PROOF', 'POLICY_DOCUMENT', 'CONSENT_FORM', 'OTHER');

-- CreateTable
CREATE TABLE "InsuranceProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "InsuranceProviderType" NOT NULL DEFAULT 'PRIVATE',
    "logoUrl" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsuranceProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsurancePlan" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    "description" TEXT,
    "maxSumInsured" INTEGER NOT NULL DEFAULT 500000,
    "maxCoveragePercent" INTEGER NOT NULL DEFAULT 100,
    "waitingPeriodDays" INTEGER NOT NULL DEFAULT 30,
    "preExistingWaiting" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsurancePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsurancePolicy" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "PolicyStatus" NOT NULL DEFAULT 'ACTIVE',
    "sumInsured" INTEGER NOT NULL DEFAULT 500000,
    "copayPercent" INTEGER NOT NULL DEFAULT 0,
    "deductible" INTEGER NOT NULL DEFAULT 0,
    "coveragePercent" INTEGER NOT NULL DEFAULT 80,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsurancePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoverageRule" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "category" "CoverageType" NOT NULL,
    "coveragePercent" INTEGER NOT NULL DEFAULT 100,
    "maxAmount" INTEGER,
    "requiresPreAuth" BOOLEAN NOT NULL DEFAULT false,
    "waitingPeriod" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoverageRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EligibilityCheck" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "patientUserId" TEXT NOT NULL,
    "checkDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isEligible" BOOLEAN NOT NULL DEFAULT false,
    "coveragePercent" INTEGER NOT NULL DEFAULT 0,
    "copayAmount" INTEGER NOT NULL DEFAULT 0,
    "deductibleRemaining" INTEGER NOT NULL DEFAULT 0,
    "maxCoverage" INTEGER NOT NULL DEFAULT 0,
    "response" JSONB,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EligibilityCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreAuthorization" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "clinicId" TEXT,
    "patientUserId" TEXT NOT NULL,
    "doctorProfileId" TEXT,
    "appointmentId" TEXT,
    "procedureCode" TEXT,
    "diagnosisCode" TEXT,
    "requestedAmount" INTEGER NOT NULL DEFAULT 0,
    "approvedAmount" INTEGER,
    "status" "PreAuthStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "reviewerNotes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreAuthorization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientUserId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "preAuthorizationId" TEXT,
    "claimNumber" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL DEFAULT 0,
    "claimedAmount" INTEGER NOT NULL DEFAULT 0,
    "approvedAmount" INTEGER,
    "status" "ClaimStatus" NOT NULL DEFAULT 'DRAFT',
    "submissionDate" TIMESTAMP(3),
    "adjudicationDate" TIMESTAMP(3),
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimLineItem" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "billingItemId" TEXT,
    "description" TEXT NOT NULL,
    "category" "CoverageType" NOT NULL DEFAULT 'OTHER',
    "claimedAmount" INTEGER NOT NULL DEFAULT 0,
    "approvedAmount" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimDocument" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "documentType" "ClaimDocumentType" NOT NULL DEFAULT 'OTHER',
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "fileSize" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settlement" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL DEFAULT 'BANK_TRANSFER',
    "reference" TEXT,
    "status" "SettlementStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceProvider_code_key" ON "InsuranceProvider"("code");

-- CreateIndex
CREATE INDEX "InsuranceProvider_type_isActive_idx" ON "InsuranceProvider"("type", "isActive");

-- CreateIndex
CREATE INDEX "InsurancePlan_isActive_idx" ON "InsurancePlan"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "InsurancePlan_providerId_code_key" ON "InsurancePlan"("providerId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "InsurancePolicy_policyNumber_key" ON "InsurancePolicy"("policyNumber");

-- CreateIndex
CREATE INDEX "InsurancePolicy_userId_status_idx" ON "InsurancePolicy"("userId", "status");

-- CreateIndex
CREATE INDEX "InsurancePolicy_policyNumber_idx" ON "InsurancePolicy"("policyNumber");

-- CreateIndex
CREATE INDEX "InsurancePolicy_endDate_status_idx" ON "InsurancePolicy"("endDate", "status");

-- CreateIndex
CREATE INDEX "CoverageRule_planId_isActive_idx" ON "CoverageRule"("planId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "CoverageRule_planId_category_key" ON "CoverageRule"("planId", "category");

-- CreateIndex
CREATE INDEX "EligibilityCheck_policyId_checkDate_idx" ON "EligibilityCheck"("policyId", "checkDate");

-- CreateIndex
CREATE INDEX "EligibilityCheck_patientUserId_checkDate_idx" ON "EligibilityCheck"("patientUserId", "checkDate");

-- CreateIndex
CREATE INDEX "PreAuthorization_policyId_status_idx" ON "PreAuthorization"("policyId", "status");

-- CreateIndex
CREATE INDEX "PreAuthorization_patientUserId_status_idx" ON "PreAuthorization"("patientUserId", "status");

-- CreateIndex
CREATE INDEX "PreAuthorization_clinicId_status_idx" ON "PreAuthorization"("clinicId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_claimNumber_key" ON "Claim"("claimNumber");

-- CreateIndex
CREATE INDEX "Claim_policyId_status_idx" ON "Claim"("policyId", "status");

-- CreateIndex
CREATE INDEX "Claim_clinicId_status_idx" ON "Claim"("clinicId", "status");

-- CreateIndex
CREATE INDEX "Claim_patientUserId_status_idx" ON "Claim"("patientUserId", "status");

-- CreateIndex
CREATE INDEX "Claim_claimNumber_idx" ON "Claim"("claimNumber");

-- CreateIndex
CREATE INDEX "Claim_preAuthorizationId_idx" ON "Claim"("preAuthorizationId");

-- CreateIndex
CREATE INDEX "ClaimLineItem_claimId_idx" ON "ClaimLineItem"("claimId");

-- CreateIndex
CREATE INDEX "ClaimDocument_claimId_idx" ON "ClaimDocument"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "Settlement_claimId_key" ON "Settlement"("claimId");

-- AddForeignKey
ALTER TABLE "InsurancePlan" ADD CONSTRAINT "InsurancePlan_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "InsuranceProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsurancePolicy" ADD CONSTRAINT "InsurancePolicy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsurancePolicy" ADD CONSTRAINT "InsurancePolicy_planId_fkey" FOREIGN KEY ("planId") REFERENCES "InsurancePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoverageRule" ADD CONSTRAINT "CoverageRule_planId_fkey" FOREIGN KEY ("planId") REFERENCES "InsurancePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EligibilityCheck" ADD CONSTRAINT "EligibilityCheck_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "InsurancePolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EligibilityCheck" ADD CONSTRAINT "EligibilityCheck_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreAuthorization" ADD CONSTRAINT "PreAuthorization_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "InsurancePolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreAuthorization" ADD CONSTRAINT "PreAuthorization_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreAuthorization" ADD CONSTRAINT "PreAuthorization_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "InsurancePolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_preAuthorizationId_fkey" FOREIGN KEY ("preAuthorizationId") REFERENCES "PreAuthorization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimLineItem" ADD CONSTRAINT "ClaimLineItem_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimDocument" ADD CONSTRAINT "ClaimDocument_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;
