--
-- ============================================================================
-- WYSHCARE PLATFORM
-- ============================================================================
--
-- File: backend/prisma/migrations/20260607150000_add_health_goals/migration.sql
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

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "GoalCategory" AS ENUM ('MEDICAL', 'FITNESS', 'NUTRITION', 'LIFESTYLE', 'MENTAL_HEALTH');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'ARCHIVED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'ACHIEVED', 'SKIPPED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable health_goals
CREATE TABLE "health_goals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "GoalCategory" NOT NULL DEFAULT 'MEDICAL',
    "target_value" DOUBLE PRECISION,
    "current_value" DOUBLE PRECISION DEFAULT 0,
    "unit" TEXT,
    "start_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "target_date" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "health_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable goal_milestones
CREATE TABLE "goal_milestones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "goal_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "target_value" DOUBLE PRECISION,
    "current_value" DOUBLE PRECISION DEFAULT 0,
    "due_date" TIMESTAMPTZ,
    "achieved_at" TIMESTAMPTZ,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goal_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable goal_progress
CREATE TABLE "goal_progress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "goal_id" UUID NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "recorded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goal_progress_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "health_goals" ADD CONSTRAINT "health_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_milestones" ADD CONSTRAINT "goal_milestones_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "health_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_progress" ADD CONSTRAINT "goal_progress_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "health_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "health_goals_user_id_idx" ON "health_goals"("user_id");
CREATE INDEX "health_goals_status_idx" ON "health_goals"("status");
CREATE INDEX "health_goals_category_idx" ON "health_goals"("category");
CREATE INDEX "goal_milestones_goal_id_idx" ON "goal_milestones"("goal_id");
CREATE INDEX "goal_progress_goal_id_idx" ON "goal_progress"("goal_id");

-- CreateTrigger for updated_at
CREATE OR REPLACE FUNCTION update_health_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_health_goals_updated_at ON "health_goals";
CREATE TRIGGER trigger_health_goals_updated_at
    BEFORE UPDATE ON "health_goals"
    FOR EACH ROW
    EXECUTE FUNCTION update_health_goals_updated_at();
