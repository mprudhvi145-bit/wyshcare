--
-- ============================================================================
-- WYSHCARE PLATFORM
-- ============================================================================
--
-- File: backend/prisma/migrations/20260604150000_sprint_15_telemedicine/migration.sql
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
--  - CASCADE
 - IF
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

-- Sprint 15: Telemedicine Platform — Clinical Encounter Engine

ALTER TABLE "ConsultationSession" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;

CREATE TABLE IF NOT EXISTS "ConsultationRecording" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "durationSeconds" INTEGER,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConsultationRecording_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ConsultationTranscript" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "transcriptText" TEXT,
    "speakerSegments" JSONB,
    "aiSummary" TEXT,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConsultationTranscript_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ConsultationSOAP" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "subjective" TEXT,
    "objective" TEXT,
    "assessment" TEXT,
    "plan" TEXT,
    "generatedByAI" BOOLEAN NOT NULL DEFAULT false,
    "approvedByDoctor" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConsultationSOAP_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ConsultationRecording_consultationId_idx" ON "ConsultationRecording"("consultationId");
CREATE INDEX IF NOT EXISTS "ConsultationRecording_tenantId_idx" ON "ConsultationRecording"("tenantId");
CREATE INDEX IF NOT EXISTS "ConsultationTranscript_consultationId_idx" ON "ConsultationTranscript"("consultationId");
CREATE INDEX IF NOT EXISTS "ConsultationTranscript_tenantId_idx" ON "ConsultationTranscript"("tenantId");
CREATE INDEX IF NOT EXISTS "ConsultationSOAP_consultationId_idx" ON "ConsultationSOAP"("consultationId");
CREATE INDEX IF NOT EXISTS "ConsultationSOAP_tenantId_idx" ON "ConsultationSOAP"("tenantId");
CREATE INDEX IF NOT EXISTS "ConsultationSession_doctorProfileId_createdAt_idx" ON "ConsultationSession"("doctorProfileId", "createdAt");

ALTER TABLE "ConsultationRecording" ADD CONSTRAINT "ConsultationRecording_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "ConsultationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConsultationTranscript" ADD CONSTRAINT "ConsultationTranscript_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "ConsultationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConsultationSOAP" ADD CONSTRAINT "ConsultationSOAP_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "ConsultationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
