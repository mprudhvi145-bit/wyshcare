--
-- ============================================================================
-- WYSHCARE PLATFORM
-- ============================================================================
--
-- File: backend/prisma/migrations/20260604081515_add_medication_adherence_reminder/migration.sql
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
 - INDEX
 - TYPE
 - TABLE
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
CREATE TYPE "AdherenceStatus" AS ENUM ('TAKEN', 'MISSED', 'SKIPPED');

-- CreateTable
CREATE TABLE "MedicationAdherenceLog" (
    "id" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AdherenceStatus" NOT NULL,
    "scheduledTime" TIME(0) NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "MedicationAdherenceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationReminder" (
    "id" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "times" JSONB NOT NULL,
    "daysOfWeek" INTEGER[],
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicationReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MedicationAdherenceLog_medicationId_loggedAt_idx" ON "MedicationAdherenceLog"("medicationId", "loggedAt");

-- CreateIndex
CREATE INDEX "MedicationAdherenceLog_userId_loggedAt_idx" ON "MedicationAdherenceLog"("userId", "loggedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MedicationReminder_medicationId_userId_key" ON "MedicationReminder"("medicationId", "userId");

-- AddForeignKey
ALTER TABLE "MedicationAdherenceLog" ADD CONSTRAINT "MedicationAdherenceLog_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationAdherenceLog" ADD CONSTRAINT "MedicationAdherenceLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationReminder" ADD CONSTRAINT "MedicationReminder_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationReminder" ADD CONSTRAINT "MedicationReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
