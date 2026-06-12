--
-- ============================================================================
-- WYSHCARE PLATFORM
-- ============================================================================
--
-- File: backend/prisma/migrations/20260605070040_add_ehr_core/migration.sql
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
CREATE TYPE "EncounterClass" AS ENUM ('OUTPATIENT', 'INPATIENT', 'EMERGENCY', 'TELEMEDICINE', 'HOME_CARE');

-- CreateEnum
CREATE TYPE "EncounterStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'ON_LEAVE', 'FINISHED', 'CANCELLED', 'ENTERED_IN_ERROR');

-- CreateEnum
CREATE TYPE "EncounterDiagnosisRole" AS ENUM ('ADMITTING', 'PRIMARY', 'SECONDARY', 'DISCHARGE', 'COMORBIDITY');

-- CreateEnum
CREATE TYPE "ClinicalOrderType" AS ENUM ('LAB', 'IMAGING', 'MEDICATION', 'PROCEDURE', 'REFERRAL');

-- CreateEnum
CREATE TYPE "ClinicalOrderStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'ON_HOLD', 'ENTERED_IN_ERROR');

-- CreateEnum
CREATE TYPE "ClinicalOrderPriority" AS ENUM ('ROUTINE', 'URGENT', 'STAT', 'ASAP', 'TIMED');

-- CreateEnum
CREATE TYPE "ClinicalNoteType" AS ENUM ('H_AND_P', 'PROGRESS_NOTE', 'DISCHARGE_SUMMARY', 'OPERATIVE_NOTE', 'PROCEDURE_NOTE', 'REFERRAL_NOTE', 'SOAP');

-- CreateEnum
CREATE TYPE "CDSAlertType" AS ENUM ('DRUG_INTERACTION', 'DUPLICATE_THERAPY', 'ALLERGY', 'CONTRAINDICATION', 'COVERAGE', 'PREVENTIVE_CARE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TimelineEventType" ADD VALUE 'ENCOUNTER';
ALTER TYPE "TimelineEventType" ADD VALUE 'ALLERGY';
ALTER TYPE "TimelineEventType" ADD VALUE 'CONDITION';
ALTER TYPE "TimelineEventType" ADD VALUE 'PROCEDURE';
ALTER TYPE "TimelineEventType" ADD VALUE 'IMMUNIZATION';
ALTER TYPE "TimelineEventType" ADD VALUE 'CLINICAL_NOTE';
ALTER TYPE "TimelineEventType" ADD VALUE 'CLINICAL_ORDER';
ALTER TYPE "TimelineEventType" ADD VALUE 'CDS_ALERT';
ALTER TYPE "TimelineEventType" ADD VALUE 'DOCUMENT_UPLOAD';
ALTER TYPE "TimelineEventType" ADD VALUE 'ENCOUNTER_CLOSED';
ALTER TYPE "TimelineEventType" ADD VALUE 'ENCOUNTER_DIAGNOSIS';
ALTER TYPE "TimelineEventType" ADD VALUE 'ORDER_COMPLETED';
ALTER TYPE "TimelineEventType" ADD VALUE 'NOTE_SIGNED';

-- CreateTable
CREATE TABLE "Allergy" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "allergen" TEXT NOT NULL,
    "reaction" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'MILD',
    "onsetDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "verifiedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Allergy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Condition" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "icdCode" TEXT,
    "codeSystem" TEXT NOT NULL DEFAULT 'ICD-10-EN',
    "displayName" TEXT NOT NULL,
    "bodySite" TEXT,
    "onsetDate" TIMESTAMP(3),
    "resolutionDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "clinicalStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "severity" TEXT,
    "notes" TEXT,
    "verifiedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Condition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureRecord" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "code" TEXT,
    "codeSystem" TEXT NOT NULL DEFAULT 'SNOMED',
    "displayName" TEXT NOT NULL,
    "bodySite" TEXT,
    "performedDate" TIMESTAMP(3),
    "performerId" TEXT,
    "outcome" TEXT,
    "complications" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcedureRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Immunization" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "vaccineName" TEXT NOT NULL,
    "cvxCode" TEXT,
    "manufacturer" TEXT,
    "lotNumber" TEXT,
    "doseNumber" INTEGER,
    "doseSeries" TEXT,
    "administrationSite" TEXT,
    "route" TEXT,
    "administeredDate" TIMESTAMP(3) NOT NULL,
    "administeredById" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Immunization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalDocument" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "description" TEXT,
    "tags" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "uploadedById" TEXT NOT NULL,
    "encounterId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Encounter" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "encounterClass" "EncounterClass" NOT NULL,
    "status" "EncounterStatus" NOT NULL DEFAULT 'PLANNED',
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3),
    "reason" TEXT,
    "reasonCode" TEXT,
    "location" TEXT,
    "providerId" TEXT,
    "consultationSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Encounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EncounterDiagnosis" (
    "id" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "conditionId" TEXT NOT NULL,
    "role" "EncounterDiagnosisRole" NOT NULL DEFAULT 'PRIMARY',
    "rank" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EncounterDiagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EncounterProcedure" (
    "id" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EncounterProcedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EncounterOrder" (
    "id" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EncounterOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EncounterNote" (
    "id" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "clinicalNoteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EncounterNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalOrder" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "orderType" "ClinicalOrderType" NOT NULL,
    "status" "ClinicalOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "ClinicalOrderPriority" NOT NULL DEFAULT 'ROUTINE',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "orderedById" TEXT NOT NULL,
    "completedById" TEXT,
    "completedAt" TIMESTAMP(3),
    "resultSummary" TEXT,
    "orderDetails" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicalOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalNote" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "noteType" "ClinicalNoteType" NOT NULL,
    "title" TEXT,
    "content" JSONB NOT NULL,
    "authoredById" TEXT NOT NULL,
    "isSigned" BOOLEAN NOT NULL DEFAULT false,
    "signedAt" TIMESTAMP(3),
    "signedById" TEXT,
    "parentNoteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicalNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CDSAlert" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "alertType" "CDSAlertType" NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MODERATE',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "triggeredById" TEXT,
    "triggeredByType" TEXT,
    "orderId" TEXT,
    "dismissedAt" TIMESTAMP(3),
    "dismissedById" TEXT,
    "dismissedReason" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CDSAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Allergy_patientId_idx" ON "Allergy"("patientId");

-- CreateIndex
CREATE INDEX "Allergy_patientId_status_idx" ON "Allergy"("patientId", "status");

-- CreateIndex
CREATE INDEX "Condition_patientId_idx" ON "Condition"("patientId");

-- CreateIndex
CREATE INDEX "Condition_patientId_status_idx" ON "Condition"("patientId", "status");

-- CreateIndex
CREATE INDEX "ProcedureRecord_patientId_idx" ON "ProcedureRecord"("patientId");

-- CreateIndex
CREATE INDEX "Immunization_patientId_idx" ON "Immunization"("patientId");

-- CreateIndex
CREATE INDEX "ClinicalDocument_patientId_idx" ON "ClinicalDocument"("patientId");

-- CreateIndex
CREATE INDEX "ClinicalDocument_patientId_documentType_idx" ON "ClinicalDocument"("patientId", "documentType");

-- CreateIndex
CREATE INDEX "Encounter_patientId_idx" ON "Encounter"("patientId");

-- CreateIndex
CREATE INDEX "Encounter_patientId_status_idx" ON "Encounter"("patientId", "status");

-- CreateIndex
CREATE INDEX "Encounter_providerId_idx" ON "Encounter"("providerId");

-- CreateIndex
CREATE INDEX "Encounter_periodStart_idx" ON "Encounter"("periodStart");

-- CreateIndex
CREATE INDEX "EncounterDiagnosis_encounterId_idx" ON "EncounterDiagnosis"("encounterId");

-- CreateIndex
CREATE INDEX "EncounterDiagnosis_conditionId_idx" ON "EncounterDiagnosis"("conditionId");

-- CreateIndex
CREATE INDEX "EncounterProcedure_encounterId_idx" ON "EncounterProcedure"("encounterId");

-- CreateIndex
CREATE INDEX "EncounterOrder_encounterId_idx" ON "EncounterOrder"("encounterId");

-- CreateIndex
CREATE INDEX "EncounterNote_encounterId_idx" ON "EncounterNote"("encounterId");

-- CreateIndex
CREATE INDEX "ClinicalOrder_patientId_idx" ON "ClinicalOrder"("patientId");

-- CreateIndex
CREATE INDEX "ClinicalOrder_patientId_orderType_idx" ON "ClinicalOrder"("patientId", "orderType");

-- CreateIndex
CREATE INDEX "ClinicalOrder_orderedById_idx" ON "ClinicalOrder"("orderedById");

-- CreateIndex
CREATE INDEX "ClinicalOrder_status_idx" ON "ClinicalOrder"("status");

-- CreateIndex
CREATE INDEX "ClinicalNote_patientId_idx" ON "ClinicalNote"("patientId");

-- CreateIndex
CREATE INDEX "ClinicalNote_patientId_noteType_idx" ON "ClinicalNote"("patientId", "noteType");

-- CreateIndex
CREATE INDEX "ClinicalNote_authoredById_idx" ON "ClinicalNote"("authoredById");

-- CreateIndex
CREATE INDEX "CDSAlert_patientId_idx" ON "CDSAlert"("patientId");

-- CreateIndex
CREATE INDEX "CDSAlert_patientId_alertType_idx" ON "CDSAlert"("patientId", "alertType");

-- CreateIndex
CREATE INDEX "CDSAlert_patientId_severity_idx" ON "CDSAlert"("patientId", "severity");

-- AddForeignKey
ALTER TABLE "Allergy" ADD CONSTRAINT "Allergy_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allergy" ADD CONSTRAINT "Allergy_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureRecord" ADD CONSTRAINT "ProcedureRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureRecord" ADD CONSTRAINT "ProcedureRecord_performerId_fkey" FOREIGN KEY ("performerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Immunization" ADD CONSTRAINT "Immunization_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Immunization" ADD CONSTRAINT "Immunization_administeredById_fkey" FOREIGN KEY ("administeredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalDocument" ADD CONSTRAINT "ClinicalDocument_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalDocument" ADD CONSTRAINT "ClinicalDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalDocument" ADD CONSTRAINT "ClinicalDocument_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncounterDiagnosis" ADD CONSTRAINT "EncounterDiagnosis_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncounterDiagnosis" ADD CONSTRAINT "EncounterDiagnosis_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "Condition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncounterProcedure" ADD CONSTRAINT "EncounterProcedure_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncounterProcedure" ADD CONSTRAINT "EncounterProcedure_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "ProcedureRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncounterOrder" ADD CONSTRAINT "EncounterOrder_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncounterOrder" ADD CONSTRAINT "EncounterOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ClinicalOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncounterNote" ADD CONSTRAINT "EncounterNote_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncounterNote" ADD CONSTRAINT "EncounterNote_clinicalNoteId_fkey" FOREIGN KEY ("clinicalNoteId") REFERENCES "ClinicalNote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalOrder" ADD CONSTRAINT "ClinicalOrder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalOrder" ADD CONSTRAINT "ClinicalOrder_orderedById_fkey" FOREIGN KEY ("orderedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalOrder" ADD CONSTRAINT "ClinicalOrder_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalNote" ADD CONSTRAINT "ClinicalNote_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalNote" ADD CONSTRAINT "ClinicalNote_authoredById_fkey" FOREIGN KEY ("authoredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalNote" ADD CONSTRAINT "ClinicalNote_signedById_fkey" FOREIGN KEY ("signedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalNote" ADD CONSTRAINT "ClinicalNote_parentNoteId_fkey" FOREIGN KEY ("parentNoteId") REFERENCES "ClinicalNote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CDSAlert" ADD CONSTRAINT "CDSAlert_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CDSAlert" ADD CONSTRAINT "CDSAlert_dismissedById_fkey" FOREIGN KEY ("dismissedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
