--
-- ============================================================================
-- WYSHCARE PLATFORM
-- ============================================================================
--
-- File: backend/prisma/migrations/20260604151456_add_clinical_medication_intelligence/migration.sql
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

/*
  Warnings:

  - Added the required column `updatedAt` to the `Prescription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PrescriptionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'DISPENSED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "InteractionSeverity" AS ENUM ('CONTRAINDICATED', 'HIGH', 'MODERATE', 'MINOR', 'NONE');

-- AlterTable
ALTER TABLE "Prescription" ADD COLUMN     "consultationId" TEXT,
ADD COLUMN     "diagnosis" JSONB,
ADD COLUMN     "issuedAt" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" "PrescriptionStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "tenantId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Drug" (
    "id" TEXT NOT NULL,
    "genericName" TEXT NOT NULL,
    "brandNames" TEXT[],
    "strength" TEXT NOT NULL,
    "dosageForm" TEXT NOT NULL,
    "manufacturer" TEXT,
    "atcCode" TEXT,
    "rxNormCode" TEXT,
    "drugClass" TEXT,
    "therapeuticClass" TEXT,
    "isPrescriptionRequired" BOOLEAN NOT NULL DEFAULT true,
    "schedule" TEXT,
    "pregnancyCategory" TEXT,
    "contraindications" JSONB,
    "sideEffects" JSONB,
    "warnings" JSONB,
    "halfLife" TEXT,
    "metabolism" TEXT,
    "excretion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Drug_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrugInteraction" (
    "id" TEXT NOT NULL,
    "subjectDrugId" TEXT NOT NULL,
    "objectDrugId" TEXT NOT NULL,
    "severity" "InteractionSeverity" NOT NULL,
    "description" TEXT NOT NULL,
    "mechanism" TEXT,
    "recommendation" TEXT,
    "evidence" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DrugInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationSchedule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prescriptionItemId" TEXT,
    "drugId" TEXT,
    "times" JSONB NOT NULL,
    "daysOfWeek" INTEGER[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "AdherenceStatus",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicationSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdherenceLog" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AdherenceStatus" NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "takenAt" TIMESTAMP(3),
    "delayedBy" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdherenceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrescriptionItem" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "drugId" TEXT,
    "medicationId" TEXT,
    "drugName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "route" TEXT,
    "instructions" TEXT,
    "quantity" INTEGER NOT NULL,
    "refills" INTEGER NOT NULL DEFAULT 0,
    "substitutionAllowed" BOOLEAN NOT NULL DEFAULT true,
    "dispensedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrescriptionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrescriptionVerification" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "qrHash" TEXT NOT NULL,
    "verificationUrl" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "tamperHash" TEXT NOT NULL,
    "isTampered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrescriptionVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Drug_genericName_idx" ON "Drug"("genericName");

-- CreateIndex
CREATE INDEX "Drug_atcCode_idx" ON "Drug"("atcCode");

-- CreateIndex
CREATE INDEX "Drug_rxNormCode_idx" ON "Drug"("rxNormCode");

-- CreateIndex
CREATE INDEX "Drug_drugClass_idx" ON "Drug"("drugClass");

-- CreateIndex
CREATE INDEX "DrugInteraction_severity_idx" ON "DrugInteraction"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "DrugInteraction_subjectDrugId_objectDrugId_key" ON "DrugInteraction"("subjectDrugId", "objectDrugId");

-- CreateIndex
CREATE INDEX "MedicationSchedule_userId_startDate_idx" ON "MedicationSchedule"("userId", "startDate");

-- CreateIndex
CREATE INDEX "MedicationSchedule_prescriptionItemId_idx" ON "MedicationSchedule"("prescriptionItemId");

-- CreateIndex
CREATE INDEX "AdherenceLog_scheduleId_scheduledAt_idx" ON "AdherenceLog"("scheduleId", "scheduledAt");

-- CreateIndex
CREATE INDEX "AdherenceLog_userId_scheduledAt_idx" ON "AdherenceLog"("userId", "scheduledAt");

-- CreateIndex
CREATE INDEX "PrescriptionItem_prescriptionId_idx" ON "PrescriptionItem"("prescriptionId");

-- CreateIndex
CREATE INDEX "PrescriptionItem_drugId_idx" ON "PrescriptionItem"("drugId");

-- CreateIndex
CREATE UNIQUE INDEX "PrescriptionVerification_prescriptionId_key" ON "PrescriptionVerification"("prescriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "PrescriptionVerification_qrHash_key" ON "PrescriptionVerification"("qrHash");

-- CreateIndex
CREATE INDEX "PrescriptionVerification_qrHash_idx" ON "PrescriptionVerification"("qrHash");

-- CreateIndex
CREATE INDEX "Prescription_tenantId_idx" ON "Prescription"("tenantId");

-- CreateIndex
CREATE INDEX "Prescription_status_idx" ON "Prescription"("status");

-- AddForeignKey
ALTER TABLE "DrugInteraction" ADD CONSTRAINT "DrugInteraction_subjectDrugId_fkey" FOREIGN KEY ("subjectDrugId") REFERENCES "Drug"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrugInteraction" ADD CONSTRAINT "DrugInteraction_objectDrugId_fkey" FOREIGN KEY ("objectDrugId") REFERENCES "Drug"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationSchedule" ADD CONSTRAINT "MedicationSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationSchedule" ADD CONSTRAINT "MedicationSchedule_prescriptionItemId_fkey" FOREIGN KEY ("prescriptionItemId") REFERENCES "PrescriptionItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationSchedule" ADD CONSTRAINT "MedicationSchedule_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drug"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdherenceLog" ADD CONSTRAINT "AdherenceLog_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "MedicationSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdherenceLog" ADD CONSTRAINT "AdherenceLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drug"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionVerification" ADD CONSTRAINT "PrescriptionVerification_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
