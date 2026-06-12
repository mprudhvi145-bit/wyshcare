--
-- ============================================================================
-- WYSHCARE PLATFORM
-- ============================================================================
--
-- File: backend/prisma/migrations/20260604122620_add_pharmacy_marketplace_v2/migration.sql
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
 - INDEX
 - TYPE
 - CONSTRAINT
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

/*
  Warnings:

  - Added the required column `updatedAt` to the `PharmacyPartner` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "AIJobType" ADD VALUE 'PHARMACY_RX_PARSE';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TimelineEventType" ADD VALUE 'ORDER_PLACED';
ALTER TYPE "TimelineEventType" ADD VALUE 'ORDER_FULFILLED';

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_doctorProfileId_fkey";

-- DropIndex
DROP INDEX "UserRole_role_idx";

-- AlterTable
ALTER TABLE "PharmacyOrder" ADD COLUMN     "cancelReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "consultationId" TEXT,
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "deliveryPartner" TEXT,
ADD COLUMN     "estimatedDelivery" TIMESTAMP(3),
ADD COLUMN     "paymentOrderId" TEXT,
ADD COLUMN     "tenantId" TEXT,
ADD COLUMN     "trackingUrl" TEXT;

-- AlterTable
ALTER TABLE "PharmacyPartner" ADD COLUMN     "address" TEXT,
ADD COLUMN     "deliveryRadiusKm" INTEGER DEFAULT 10,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "tenantId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "PharmacyInventory" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "genericName" TEXT,
    "manufacturer" TEXT,
    "dosage" TEXT,
    "form" TEXT,
    "packageSize" INTEGER,
    "unitPrice" INTEGER NOT NULL,
    "mrp" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiresPrescription" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PharmacyInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PharmacyCartItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PharmacyCartItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PharmacyInventory_partnerId_name_idx" ON "PharmacyInventory"("partnerId", "name");

-- CreateIndex
CREATE INDEX "PharmacyInventory_partnerId_isActive_idx" ON "PharmacyInventory"("partnerId", "isActive");

-- CreateIndex
CREATE INDEX "PharmacyInventory_genericName_idx" ON "PharmacyInventory"("genericName");

-- CreateIndex
CREATE INDEX "PharmacyCartItem_userId_partnerId_idx" ON "PharmacyCartItem"("userId", "partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "PharmacyCartItem_userId_inventoryId_key" ON "PharmacyCartItem"("userId", "inventoryId");

-- CreateIndex
CREATE INDEX "PharmacyOrder_tenantId_idx" ON "PharmacyOrder"("tenantId");

-- CreateIndex
CREATE INDEX "PharmacyOrder_prescriptionId_idx" ON "PharmacyOrder"("prescriptionId");

-- CreateIndex
CREATE INDEX "PharmacyPartner_tenantId_idx" ON "PharmacyPartner"("tenantId");

-- CreateIndex
CREATE INDEX "PharmacyPartner_isActive_verificationStatus_idx" ON "PharmacyPartner"("isActive", "verificationStatus");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "DoctorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyInventory" ADD CONSTRAINT "PharmacyInventory_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "PharmacyPartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyCartItem" ADD CONSTRAINT "PharmacyCartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyCartItem" ADD CONSTRAINT "PharmacyCartItem_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "PharmacyPartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyCartItem" ADD CONSTRAINT "PharmacyCartItem_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "PharmacyInventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
