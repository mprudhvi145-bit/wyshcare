--
-- ============================================================================
-- WYSHCARE PLATFORM
-- ============================================================================
--
-- File: backend/prisma/migrations/20260605084245_add_digital_twin/migration.sql
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
CREATE TYPE "TwinRiskLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "PredictionType" AS ENUM ('CARDIOVASCULAR_EVENT', 'DIABETES_PROGRESSION', 'HYPERTENSION_RISK', 'KIDNEY_DISEASE', 'LIVER_DISEASE', 'RESPIRATORY_DECLINE', 'MENTAL_HEALTH', 'FALL_RISK', 'READMISSION_RISK', 'MEDICATION_NON_ADHERENCE', 'FRAILTY', 'MORTALITY');

-- CreateEnum
CREATE TYPE "CareGapCategory" AS ENUM ('SCREENING', 'VACCINATION', 'FOLLOW_UP', 'LAB_TEST', 'MEDICATION_REVIEW', 'SPECIALIST_REFERRAL', 'HEALTH_CHECKUP');

-- CreateEnum
CREATE TYPE "RecommendationPriority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "RecommendationCategory" AS ENUM ('MEDICATION', 'LIFESTYLE', 'SCREENING', 'FOLLOW_UP', 'SPECIALIST', 'VACCINATION', 'LAB', 'EDUCATION');

-- CreateEnum
CREATE TYPE "TwinMetricType" AS ENUM ('HEALTH_SCORE', 'RISK_SCORE', 'ADHERENCE_SCORE', 'READINESS_SCORE', 'STEPS', 'HEART_RATE', 'SLEEP_HOURS', 'WEIGHT', 'BLOOD_PRESSURE', 'BLOOD_OXYGEN', 'GLUCOSE', 'BMI');

-- AlterTable
ALTER TABLE "PreventiveRecommendation" ADD COLUMN     "priority" TEXT,
ADD COLUMN     "twinId" TEXT;

-- AlterTable
ALTER TABLE "RiskPrediction" ADD COLUMN     "predictionType" "PredictionType",
ADD COLUMN     "twinId" TEXT;

-- CreateTable
CREATE TABLE "DigitalTwin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "healthScore" INTEGER NOT NULL DEFAULT 0,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "adherenceScore" INTEGER NOT NULL DEFAULT 0,
    "readinessScore" INTEGER NOT NULL DEFAULT 0,
    "lastComputedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "contextSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigitalTwin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareGap" (
    "id" TEXT NOT NULL,
    "twinId" TEXT NOT NULL,
    "category" "CareGapCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "RecommendationPriority" NOT NULL,
    "dueDate" TIMESTAMP(3),
    "overdueBy" INTEGER,
    "sourceGuideline" TEXT,
    "sourceCondition" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "closedAt" TIMESTAMP(3),
    "closedReason" TEXT,
    "completedAt" TIMESTAMP(3),
    "completedVia" TEXT,
    "completedRefId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareGap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwinScoreHistory" (
    "id" TEXT NOT NULL,
    "twinId" TEXT NOT NULL,
    "healthScore" INTEGER NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "adherenceScore" INTEGER NOT NULL,
    "readinessScore" INTEGER NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TwinScoreHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwinMetricHistory" (
    "id" TEXT NOT NULL,
    "twinId" TEXT NOT NULL,
    "metric" "TwinMetricType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TwinMetricHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DigitalTwin_userId_key" ON "DigitalTwin"("userId");

-- CreateIndex
CREATE INDEX "DigitalTwin_userId_idx" ON "DigitalTwin"("userId");

-- CreateIndex
CREATE INDEX "DigitalTwin_healthScore_idx" ON "DigitalTwin"("healthScore");

-- CreateIndex
CREATE INDEX "DigitalTwin_riskScore_idx" ON "DigitalTwin"("riskScore");

-- CreateIndex
CREATE INDEX "CareGap_twinId_status_idx" ON "CareGap"("twinId", "status");

-- CreateIndex
CREATE INDEX "CareGap_twinId_category_status_idx" ON "CareGap"("twinId", "category", "status");

-- CreateIndex
CREATE INDEX "CareGap_dueDate_status_idx" ON "CareGap"("dueDate", "status");

-- CreateIndex
CREATE INDEX "TwinScoreHistory_twinId_recordedAt_idx" ON "TwinScoreHistory"("twinId", "recordedAt");

-- CreateIndex
CREATE INDEX "TwinMetricHistory_twinId_metric_recordedAt_idx" ON "TwinMetricHistory"("twinId", "metric", "recordedAt");

-- CreateIndex
CREATE INDEX "PreventiveRecommendation_twinId_idx" ON "PreventiveRecommendation"("twinId");

-- CreateIndex
CREATE INDEX "RiskPrediction_twinId_idx" ON "RiskPrediction"("twinId");

-- AddForeignKey
ALTER TABLE "RiskPrediction" ADD CONSTRAINT "RiskPrediction_twinId_fkey" FOREIGN KEY ("twinId") REFERENCES "DigitalTwin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalTwin" ADD CONSTRAINT "DigitalTwin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareGap" ADD CONSTRAINT "CareGap_twinId_fkey" FOREIGN KEY ("twinId") REFERENCES "DigitalTwin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwinScoreHistory" ADD CONSTRAINT "TwinScoreHistory_twinId_fkey" FOREIGN KEY ("twinId") REFERENCES "DigitalTwin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwinMetricHistory" ADD CONSTRAINT "TwinMetricHistory_twinId_fkey" FOREIGN KEY ("twinId") REFERENCES "DigitalTwin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
