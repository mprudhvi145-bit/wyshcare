--
-- ============================================================================
-- WYSHCARE PLATFORM
-- ============================================================================
--
-- File: backend/prisma/migrations/20260604120416_sprint_14_5_hardening/migration.sql
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
--  - COLUMN
 - INDEX
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

-- Sprint 14.5: Platform Hardening Architecture
-- Multi-Tenant Foundation, Expanded AIJob, New Job Types

-- AlterEnum: Add new AI job types
ALTER TYPE "AIJobType" ADD VALUE IF NOT EXISTS 'HEALTH_TWIN';
ALTER TYPE "AIJobType" ADD VALUE IF NOT EXISTS 'NOTIFICATION';
ALTER TYPE "AIJobType" ADD VALUE IF NOT EXISTS 'ANALYTICS';
ALTER TYPE "AIJobType" ADD VALUE IF NOT EXISTS 'CARE_PLAN';
ALTER TYPE "AIJobType" ADD VALUE IF NOT EXISTS 'ABDM_SYNC';
ALTER TYPE "AIJobType" ADD VALUE IF NOT EXISTS 'SEARCH_INDEX';

-- DropIndex
DROP INDEX IF EXISTS "AIJob_jobType_status_createdAt_idx";

-- AlterTable: AIJob — add queue, priority, retry, scheduling fields
ALTER TABLE "AIJob" ADD COLUMN IF NOT EXISTS "durationMs" INTEGER;
ALTER TABLE "AIJob" ADD COLUMN IF NOT EXISTS "errorMessage" TEXT;
ALTER TABLE "AIJob" ADD COLUMN IF NOT EXISTS "maxRetries" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "AIJob" ADD COLUMN IF NOT EXISTS "priority" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "AIJob" ADD COLUMN IF NOT EXISTS "queue" TEXT;
ALTER TABLE "AIJob" ADD COLUMN IF NOT EXISTS "retryCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "AIJob" ADD COLUMN IF NOT EXISTS "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "AIJob" ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP(3);

-- AlterTable: Tenant fields
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "Clinic" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "DoctorProfile" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;

-- AlterTable: Set default consultation mode on existing rows
ALTER TABLE "Appointment" ALTER COLUMN "consultationMode" SET DEFAULT 'VIDEO';

-- CreateIndex: New indexes for AIJob
CREATE INDEX IF NOT EXISTS "AIJob_jobType_status_scheduledAt_idx" ON "AIJob"("jobType", "status", "scheduledAt");
CREATE INDEX IF NOT EXISTS "AIJob_queue_status_idx" ON "AIJob"("queue", "status");
CREATE INDEX IF NOT EXISTS "AIJob_userId_createdAt_idx" ON "AIJob"("userId", "createdAt");

-- CreateIndex: Tenant index
CREATE INDEX IF NOT EXISTS "Appointment_tenantId_idx" ON "Appointment"("tenantId");
