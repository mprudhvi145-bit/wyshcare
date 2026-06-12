--
-- ============================================================================
-- WYSHCARE PLATFORM
-- ============================================================================
--
-- File: backend/prisma/migrations/20260607200000_add_health_services_models/migration.sql
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
--  - IF
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

-- CreateTable health_scores
CREATE TABLE IF NOT EXISTS "health_scores" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "overall_score" INTEGER NOT NULL,
    "physical_score" INTEGER,
    "mental_score" INTEGER,
    "lifestyle_score" INTEGER,
    "adherence_score" INTEGER,
    "sleep_score" INTEGER,
    "nutrition_score" INTEGER,
    "risk_adjustment" INTEGER DEFAULT 0,
    "factors" JSONB DEFAULT '{}',
    "calculated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "period_start" TIMESTAMPTZ,
    "period_end" TIMESTAMPTZ,
    "model_version" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "health_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable health_graph_nodes
CREATE TABLE IF NOT EXISTS "health_graph_nodes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "node_type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "ref_type" TEXT,
    "ref_id" TEXT,
    "source" TEXT DEFAULT 'SYSTEM',
    "metadata" JSONB DEFAULT '{}',
    "occurred_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "health_graph_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable health_graph_edges
CREATE TABLE IF NOT EXISTS "health_graph_edges" (
    "id" TEXT NOT NULL,
    "source_node_id" TEXT NOT NULL,
    "target_node_id" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "weight" DOUBLE PRECISION DEFAULT 1.0,
    "metadata" JSONB DEFAULT '{}',
    "auto_generated" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "health_graph_edges_pkey" PRIMARY KEY ("id")
);

-- CreateTable emergency_profiles
CREATE TABLE IF NOT EXISTS "emergency_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "blood_group" TEXT,
    "organ_donor" BOOLEAN DEFAULT false,
    "advance_directives" JSONB,
    "primary_physician" TEXT,
    "physician_phone" TEXT,
    "insurance_provider" TEXT,
    "insurance_policy" TEXT,
    "emergency_notes" TEXT,
    "emergency_mode" BOOLEAN NOT NULL DEFAULT false,
    "mode_activated_at" TIMESTAMPTZ,
    "mode_expires_at" TIMESTAMPTZ,
    "readiness_score" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "emergency_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable emergency_contacts
CREATE TABLE IF NOT EXISTS "emergency_contacts" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable emergency_locations
CREATE TABLE IF NOT EXISTS "emergency_locations" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "source" TEXT DEFAULT 'GPS',
    "shared_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ,
    CONSTRAINT "emergency_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable ai_recommendations
CREATE TABLE IF NOT EXISTS "ai_recommendations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "reasoning" JSONB DEFAULT '{}',
    "supporting_data" JSONB,
    "source" TEXT DEFAULT 'AI_ENGINE',
    "model_version" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMPTZ,
    "reviewed_at" TIMESTAMPTZ,
    "acted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable notification_deliveries
CREATE TABLE IF NOT EXISTS "notification_deliveries" (
    "id" TEXT NOT NULL,
    "notification_id" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "recipient_id" TEXT,
    "provider_message" TEXT,
    "error_message" TEXT,
    "delivered_at" TIMESTAMPTZ,
    "failed_at" TIMESTAMPTZ,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notification_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable health_analytics
CREATE TABLE IF NOT EXISTS "health_analytics" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "period" TEXT NOT NULL,
    "period_start" TIMESTAMPTZ NOT NULL,
    "period_end" TIMESTAMPTZ NOT NULL,
    "dimension" TEXT DEFAULT 'OVERALL',
    "metadata" JSONB DEFAULT '{}',
    "computed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "health_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE INDEX IF NOT EXISTS "health_scores_user_id_calculated_at_idx" ON "health_scores"("user_id", "calculated_at");
CREATE INDEX IF NOT EXISTS "health_graph_nodes_user_id_node_type_idx" ON "health_graph_nodes"("user_id", "node_type");
CREATE INDEX IF NOT EXISTS "health_graph_nodes_ref_type_ref_id_idx" ON "health_graph_nodes"("ref_type", "ref_id");
CREATE INDEX IF NOT EXISTS "health_graph_edges_source_node_id_idx" ON "health_graph_edges"("source_node_id");
CREATE INDEX IF NOT EXISTS "health_graph_edges_target_node_id_idx" ON "health_graph_edges"("target_node_id");
CREATE INDEX IF NOT EXISTS "health_graph_edges_relationship_idx" ON "health_graph_edges"("relationship");
CREATE UNIQUE INDEX IF NOT EXISTS "emergency_profiles_user_id_key" ON "emergency_profiles"("user_id");
CREATE INDEX IF NOT EXISTS "emergency_contacts_profile_id_idx" ON "emergency_contacts"("profile_id");
CREATE INDEX IF NOT EXISTS "emergency_locations_profile_id_shared_at_idx" ON "emergency_locations"("profile_id", "shared_at");
CREATE INDEX IF NOT EXISTS "ai_recommendations_user_id_status_category_idx" ON "ai_recommendations"("user_id", "status", "category");
CREATE INDEX IF NOT EXISTS "ai_recommendations_priority_status_idx" ON "ai_recommendations"("priority", "status");
CREATE INDEX IF NOT EXISTS "ai_recommendations_expires_at_idx" ON "ai_recommendations"("expires_at");
CREATE INDEX IF NOT EXISTS "notification_deliveries_notification_id_idx" ON "notification_deliveries"("notification_id");
CREATE INDEX IF NOT EXISTS "notification_deliveries_status_idx" ON "notification_deliveries"("status");
CREATE INDEX IF NOT EXISTS "health_analytics_user_id_metric_period_start_idx" ON "health_analytics"("user_id", "metric", "period_start");
CREATE INDEX IF NOT EXISTS "health_analytics_metric_period_idx" ON "health_analytics"("metric", "period");

-- AddForeignKeys
ALTER TABLE "health_scores" ADD CONSTRAINT "health_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "health_graph_nodes" ADD CONSTRAINT "health_graph_nodes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "health_graph_edges" ADD CONSTRAINT "health_graph_edges_source_node_id_fkey" FOREIGN KEY ("source_node_id") REFERENCES "health_graph_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "health_graph_edges" ADD CONSTRAINT "health_graph_edges_target_node_id_fkey" FOREIGN KEY ("target_node_id") REFERENCES "health_graph_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "emergency_profiles" ADD CONSTRAINT "emergency_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "emergency_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "emergency_locations" ADD CONSTRAINT "emergency_locations_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "emergency_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "health_analytics" ADD CONSTRAINT "health_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTrigger for emergency_profiles updated_at
DROP TRIGGER IF EXISTS trigger_emergency_profiles_updated_at ON "emergency_profiles";
CREATE TRIGGER trigger_emergency_profiles_updated_at
    BEFORE UPDATE ON "emergency_profiles"
    FOR EACH ROW
    EXECUTE FUNCTION update_health_goals_updated_at();
