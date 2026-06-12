--
-- ============================================================================
-- WYSHCARE PLATFORM
-- ============================================================================
--
-- File: backend/prisma/migrations/20260605062704_add_provider_graph/migration.sql
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
CREATE TYPE "ProviderNodeType" AS ENUM ('DOCTOR', 'CLINIC', 'HOSPITAL', 'LAB', 'PHARMACY', 'INSURANCE_PROVIDER', 'SPECIALITY', 'PROCEDURE', 'DIAGNOSTIC_TEST');

-- CreateEnum
CREATE TYPE "ProviderEdgeType" AS ENUM ('REFERRED_TO', 'WORKS_AT', 'SPECIALIZES_IN', 'ACCEPTS_INSURANCE', 'PARTNERED_WITH', 'REFERRED_BY', 'TREATS_CONDITION', 'ORDERS_TEST', 'DISPENSES_MEDICATION');

-- CreateTable
CREATE TABLE "ProviderGraphNode" (
    "id" TEXT NOT NULL,
    "nodeType" "ProviderNodeType" NOT NULL,
    "externalId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "speciality" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderGraphNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderGraphEdge" (
    "id" TEXT NOT NULL,
    "fromNodeId" TEXT NOT NULL,
    "toNodeId" TEXT NOT NULL,
    "edgeType" "ProviderEdgeType" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderGraphEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "fromProviderId" TEXT NOT NULL,
    "toProviderId" TEXT NOT NULL,
    "patientUserId" TEXT,
    "appointmentId" TEXT,
    "reason" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "referredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderNetwork" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "networkName" TEXT NOT NULL,
    "networkType" TEXT NOT NULL,
    "contractRef" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderNetwork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderScore" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "referralScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "clinicalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "satisfactionScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "availabilityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "networkScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overallScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreFactors" JSONB,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProviderGraphNode_nodeType_isActive_idx" ON "ProviderGraphNode"("nodeType", "isActive");

-- CreateIndex
CREATE INDEX "ProviderGraphNode_city_nodeType_idx" ON "ProviderGraphNode"("city", "nodeType");

-- CreateIndex
CREATE INDEX "ProviderGraphNode_speciality_idx" ON "ProviderGraphNode"("speciality");

-- CreateIndex
CREATE INDEX "ProviderGraphNode_name_idx" ON "ProviderGraphNode"("name");

-- CreateIndex
CREATE INDEX "ProviderGraphEdge_fromNodeId_edgeType_idx" ON "ProviderGraphEdge"("fromNodeId", "edgeType");

-- CreateIndex
CREATE INDEX "ProviderGraphEdge_toNodeId_edgeType_idx" ON "ProviderGraphEdge"("toNodeId", "edgeType");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderGraphEdge_fromNodeId_toNodeId_edgeType_key" ON "ProviderGraphEdge"("fromNodeId", "toNodeId", "edgeType");

-- CreateIndex
CREATE INDEX "Referral_fromProviderId_createdAt_idx" ON "Referral"("fromProviderId", "createdAt");

-- CreateIndex
CREATE INDEX "Referral_toProviderId_status_idx" ON "Referral"("toProviderId", "status");

-- CreateIndex
CREATE INDEX "Referral_patientUserId_idx" ON "Referral"("patientUserId");

-- CreateIndex
CREATE INDEX "ProviderNetwork_nodeId_networkType_idx" ON "ProviderNetwork"("nodeId", "networkType");

-- CreateIndex
CREATE INDEX "ProviderNetwork_networkName_networkType_idx" ON "ProviderNetwork"("networkName", "networkType");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderScore_nodeId_key" ON "ProviderScore"("nodeId");

-- CreateIndex
CREATE INDEX "ProviderScore_overallScore_idx" ON "ProviderScore"("overallScore");

-- AddForeignKey
ALTER TABLE "ProviderGraphEdge" ADD CONSTRAINT "ProviderGraphEdge_fromNodeId_fkey" FOREIGN KEY ("fromNodeId") REFERENCES "ProviderGraphNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderGraphEdge" ADD CONSTRAINT "ProviderGraphEdge_toNodeId_fkey" FOREIGN KEY ("toNodeId") REFERENCES "ProviderGraphNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_fromProviderId_fkey" FOREIGN KEY ("fromProviderId") REFERENCES "ProviderGraphNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_toProviderId_fkey" FOREIGN KEY ("toProviderId") REFERENCES "ProviderGraphNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderNetwork" ADD CONSTRAINT "ProviderNetwork_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "ProviderGraphNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderScore" ADD CONSTRAINT "ProviderScore_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "ProviderGraphNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
