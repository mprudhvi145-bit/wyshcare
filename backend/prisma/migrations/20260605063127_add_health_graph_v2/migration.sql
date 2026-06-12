--
-- ============================================================================
-- WYSHCARE PLATFORM
-- ============================================================================
--
-- File: backend/prisma/migrations/20260605063127_add_health_graph_v2/migration.sql
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

-- CreateTable
CREATE TABLE "LifestyleProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sleepHoursAvg" DOUBLE PRECISION,
    "sleepQuality" TEXT,
    "activityLevel" TEXT,
    "exerciseDaysPerWeek" INTEGER,
    "dietType" TEXT,
    "waterIntakeL" DOUBLE PRECISION,
    "stressLevel" TEXT,
    "screenTimeHrs" DOUBLE PRECISION,
    "smokingStatus" TEXT,
    "alcoholConsumption" TEXT,
    "occupation" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LifestyleProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SymptomEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symptom" TEXT NOT NULL,
    "severity" INTEGER,
    "duration" TEXT,
    "bodyPart" TEXT,
    "triggers" TEXT[],
    "notes" TEXT,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SymptomEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WearableMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WearableMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "diagnosisAge" INTEGER,
    "isDeceased" BOOLEAN DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreventiveRecommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "riskFactor" TEXT,
    "source" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreventiveRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskPrediction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "riskType" TEXT NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "drivers" TEXT[],
    "recommendedActions" TEXT[],
    "modelVersion" TEXT,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LifestyleProfile_userId_key" ON "LifestyleProfile"("userId");

-- CreateIndex
CREATE INDEX "SymptomEvent_userId_reportedAt_idx" ON "SymptomEvent"("userId", "reportedAt");

-- CreateIndex
CREATE INDEX "SymptomEvent_symptom_reportedAt_idx" ON "SymptomEvent"("symptom", "reportedAt");

-- CreateIndex
CREATE INDEX "WearableMetric_userId_metricType_recordedAt_idx" ON "WearableMetric"("userId", "metricType", "recordedAt");

-- CreateIndex
CREATE INDEX "WearableMetric_userId_source_recordedAt_idx" ON "WearableMetric"("userId", "source", "recordedAt");

-- CreateIndex
CREATE INDEX "FamilyHistory_userId_condition_idx" ON "FamilyHistory"("userId", "condition");

-- CreateIndex
CREATE INDEX "PreventiveRecommendation_userId_status_dueDate_idx" ON "PreventiveRecommendation"("userId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "PreventiveRecommendation_category_status_idx" ON "PreventiveRecommendation"("category", "status");

-- CreateIndex
CREATE INDEX "RiskPrediction_userId_riskType_calculatedAt_idx" ON "RiskPrediction"("userId", "riskType", "calculatedAt");

-- CreateIndex
CREATE INDEX "RiskPrediction_riskLevel_riskType_idx" ON "RiskPrediction"("riskLevel", "riskType");

-- AddForeignKey
ALTER TABLE "LifestyleProfile" ADD CONSTRAINT "LifestyleProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SymptomEvent" ADD CONSTRAINT "SymptomEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WearableMetric" ADD CONSTRAINT "WearableMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyHistory" ADD CONSTRAINT "FamilyHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveRecommendation" ADD CONSTRAINT "PreventiveRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskPrediction" ADD CONSTRAINT "RiskPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
