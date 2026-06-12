--
-- ============================================================================
-- WYSHCARE PLATFORM
-- ============================================================================
--
-- File: backend/prisma/migrations/20260605071419_add_workspace_models/migration.sql
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
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MedAdminStatus" AS ENUM ('SCHEDULED', 'ADMINISTERED', 'SKIPPED', 'REFUSED', 'HELD');

-- CreateEnum
CREATE TYPE "SampleStatus" AS ENUM ('PENDING_COLLECTION', 'COLLECTED', 'PROCESSING', 'ANALYZED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DispenseStatus" AS ENUM ('PENDING', 'DISPENSED', 'PARTIALLY_DISPENSED', 'CANCELLED');

-- CreateTable
CREATE TABLE "VitalsRecord" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "recordedById" TEXT NOT NULL,
    "bpSystolic" INTEGER,
    "bpDiastolic" INTEGER,
    "heartRate" INTEGER,
    "temperature" DOUBLE PRECISION,
    "spo2" INTEGER,
    "respiratoryRate" INTEGER,
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "painScore" INTEGER,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VitalsRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationAdministration" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "medicationOrderId" TEXT,
    "medicationName" TEXT NOT NULL,
    "dose" TEXT NOT NULL,
    "route" TEXT NOT NULL DEFAULT 'ORAL',
    "scheduledTime" TIMESTAMP(3) NOT NULL,
    "administeredTime" TIMESTAMP(3),
    "administeredById" TEXT,
    "status" "MedAdminStatus" NOT NULL DEFAULT 'SCHEDULED',
    "skippedReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicationAdministration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareTask" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "assignedToId" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "completedById" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftHandover" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "ward" TEXT,
    "patientCount" INTEGER,
    "notes" TEXT NOT NULL,
    "criticalAlerts" TEXT,
    "handoverAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShiftHandover_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabSample" (
    "id" TEXT NOT NULL,
    "diagnosticOrderId" TEXT NOT NULL,
    "collectedById" TEXT,
    "sampleType" TEXT NOT NULL,
    "collectionDate" TIMESTAMP(3),
    "receivedDate" TIMESTAMP(3),
    "status" "SampleStatus" NOT NULL DEFAULT 'PENDING_COLLECTION',
    "rejectionReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabSample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabResult" (
    "id" TEXT NOT NULL,
    "diagnosticOrderId" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "unit" TEXT,
    "referenceRange" TEXT,
    "isAbnormal" BOOLEAN NOT NULL DEFAULT false,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DispensingRecord" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT,
    "prescriptionItemId" TEXT,
    "pharmacistId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "medicationName" TEXT NOT NULL,
    "quantityDispensed" INTEGER NOT NULL,
    "batchNumber" TEXT,
    "expiryDate" TIMESTAMP(3),
    "status" "DispenseStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "dispensedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DispensingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcurementOrder" (
    "id" TEXT NOT NULL,
    "pharmacyId" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "totalCost" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ORDERED',
    "orderedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receivedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcurementOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VitalsRecord_patientId_recordedAt_idx" ON "VitalsRecord"("patientId", "recordedAt");

-- CreateIndex
CREATE INDEX "MedicationAdministration_patientId_scheduledTime_idx" ON "MedicationAdministration"("patientId", "scheduledTime");

-- CreateIndex
CREATE INDEX "MedicationAdministration_patientId_status_idx" ON "MedicationAdministration"("patientId", "status");

-- CreateIndex
CREATE INDEX "CareTask_patientId_status_idx" ON "CareTask"("patientId", "status");

-- CreateIndex
CREATE INDEX "CareTask_assignedToId_status_idx" ON "CareTask"("assignedToId", "status");

-- CreateIndex
CREATE INDEX "CareTask_patientId_dueAt_idx" ON "CareTask"("patientId", "dueAt");

-- CreateIndex
CREATE INDEX "ShiftHandover_fromUserId_handoverAt_idx" ON "ShiftHandover"("fromUserId", "handoverAt");

-- CreateIndex
CREATE INDEX "ShiftHandover_toUserId_handoverAt_idx" ON "ShiftHandover"("toUserId", "handoverAt");

-- CreateIndex
CREATE INDEX "LabSample_diagnosticOrderId_idx" ON "LabSample"("diagnosticOrderId");

-- CreateIndex
CREATE INDEX "LabSample_status_idx" ON "LabSample"("status");

-- CreateIndex
CREATE INDEX "LabResult_diagnosticOrderId_idx" ON "LabResult"("diagnosticOrderId");

-- CreateIndex
CREATE INDEX "LabResult_testName_idx" ON "LabResult"("testName");

-- CreateIndex
CREATE INDEX "DispensingRecord_pharmacistId_dispensedAt_idx" ON "DispensingRecord"("pharmacistId", "dispensedAt");

-- CreateIndex
CREATE INDEX "DispensingRecord_patientId_idx" ON "DispensingRecord"("patientId");

-- CreateIndex
CREATE INDEX "DispensingRecord_prescriptionId_idx" ON "DispensingRecord"("prescriptionId");

-- CreateIndex
CREATE INDEX "ProcurementOrder_pharmacyId_status_idx" ON "ProcurementOrder"("pharmacyId", "status");

-- CreateIndex
CREATE INDEX "ProcurementOrder_status_idx" ON "ProcurementOrder"("status");

-- AddForeignKey
ALTER TABLE "VitalsRecord" ADD CONSTRAINT "VitalsRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VitalsRecord" ADD CONSTRAINT "VitalsRecord_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationAdministration" ADD CONSTRAINT "MedicationAdministration_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationAdministration" ADD CONSTRAINT "MedicationAdministration_administeredById_fkey" FOREIGN KEY ("administeredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareTask" ADD CONSTRAINT "CareTask_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareTask" ADD CONSTRAINT "CareTask_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareTask" ADD CONSTRAINT "CareTask_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftHandover" ADD CONSTRAINT "ShiftHandover_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftHandover" ADD CONSTRAINT "ShiftHandover_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabSample" ADD CONSTRAINT "LabSample_diagnosticOrderId_fkey" FOREIGN KEY ("diagnosticOrderId") REFERENCES "DiagnosticOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabSample" ADD CONSTRAINT "LabSample_collectedById_fkey" FOREIGN KEY ("collectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_diagnosticOrderId_fkey" FOREIGN KEY ("diagnosticOrderId") REFERENCES "DiagnosticOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispensingRecord" ADD CONSTRAINT "DispensingRecord_pharmacistId_fkey" FOREIGN KEY ("pharmacistId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispensingRecord" ADD CONSTRAINT "DispensingRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispensingRecord" ADD CONSTRAINT "DispensingRecord_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementOrder" ADD CONSTRAINT "ProcurementOrder_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "PharmacyPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
