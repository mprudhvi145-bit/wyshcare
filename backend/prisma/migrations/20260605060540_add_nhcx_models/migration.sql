--
-- ============================================================================
-- WYSHCARE PLATFORM
-- ============================================================================
--
-- File: backend/prisma/migrations/20260605060540_add_nhcx_models/migration.sql
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
--  - UNIQUE
 - CASCADE
 - TABLE
 - INDEX
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

-- CreateTable
CREATE TABLE "NHCXConfiguration" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "insurerId" TEXT NOT NULL,
    "apiEndpoint" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "webhookSecret" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NHCXConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NHCXClaimSubmission" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "submissionRef" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestPayload" JSONB NOT NULL,
    "responsePayload" JSONB,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "syncedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NHCXClaimSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NHCXLog" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'INFO',
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NHCXLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NHCXConfiguration_providerId_key" ON "NHCXConfiguration"("providerId");

-- CreateIndex
CREATE INDEX "NHCXClaimSubmission_claimId_idx" ON "NHCXClaimSubmission"("claimId");

-- CreateIndex
CREATE INDEX "NHCXClaimSubmission_status_idx" ON "NHCXClaimSubmission"("status");

-- CreateIndex
CREATE INDEX "NHCXClaimSubmission_submissionRef_idx" ON "NHCXClaimSubmission"("submissionRef");

-- CreateIndex
CREATE INDEX "NHCXLog_submissionId_createdAt_idx" ON "NHCXLog"("submissionId", "createdAt");

-- AddForeignKey
ALTER TABLE "NHCXConfiguration" ADD CONSTRAINT "NHCXConfiguration_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "InsuranceProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NHCXClaimSubmission" ADD CONSTRAINT "NHCXClaimSubmission_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NHCXLog" ADD CONSTRAINT "NHCXLog_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "NHCXClaimSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
