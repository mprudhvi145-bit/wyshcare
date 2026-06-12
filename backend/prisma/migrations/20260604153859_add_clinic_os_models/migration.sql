--
-- ============================================================================
-- WYSHCARE PLATFORM
-- ============================================================================
--
-- File: backend/prisma/migrations/20260604153859_add_clinic_os_models/migration.sql
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
CREATE TYPE "QueueStatus" AS ENUM ('WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'PENDING', 'PAID', 'PARTIALLY_PAID', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BillingCategory" AS ENUM ('CONSULTATION', 'MEDICATION', 'LAB_TEST', 'PROCEDURE', 'VACCINATION', 'EMERGENCY', 'FOLLOWUP', 'OTHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StaffRole" ADD VALUE 'BILLING';
ALTER TYPE "StaffRole" ADD VALUE 'ADMIN';
ALTER TYPE "StaffRole" ADD VALUE 'PHARMACY';
ALTER TYPE "StaffRole" ADD VALUE 'DIAGNOSTICS';

-- AlterTable
ALTER TABLE "Clinic" ADD COLUMN     "email" TEXT,
ADD COLUMN     "facilities" TEXT[],
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "operatingHours" JSONB,
ADD COLUMN     "services" TEXT[],
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "QueueEntry" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientUserId" TEXT NOT NULL,
    "doctorProfileId" TEXT,
    "appointmentId" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "status" "QueueStatus" NOT NULL DEFAULT 'WAITING',
    "source" TEXT NOT NULL DEFAULT 'APPOINTMENT',
    "severityScore" DOUBLE PRECISION,
    "ageScore" DOUBLE PRECISION,
    "waitTimeMinutes" INTEGER,
    "estimatedStart" TIMESTAMP(3),
    "checkedInAt" TIMESTAMP(3),
    "assignedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "noShowAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QueueEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingInvoice" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientUserId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "invoiceNumber" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" INTEGER NOT NULL DEFAULT 0,
    "taxAmount" INTEGER NOT NULL DEFAULT 0,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" INTEGER NOT NULL DEFAULT 0,
    "paidAmount" INTEGER NOT NULL DEFAULT 0,
    "dueAmount" INTEGER NOT NULL DEFAULT 0,
    "paymentMethod" TEXT,
    "paymentReference" TEXT,
    "paymentDetails" JSONB,
    "dueDate" TIMESTAMP(3),
    "issuedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "BillingCategory" NOT NULL DEFAULT 'OTHER',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" INTEGER NOT NULL DEFAULT 0,
    "totalPrice" INTEGER NOT NULL DEFAULT 0,
    "taxPercent" INTEGER NOT NULL DEFAULT 0,
    "taxAmount" INTEGER NOT NULL DEFAULT 0,
    "discountPercent" INTEGER NOT NULL DEFAULT 0,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "netPrice" INTEGER NOT NULL DEFAULT 0,
    "referenceId" TEXT,
    "referenceType" TEXT,

    CONSTRAINT "BillingItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QueueEntry_appointmentId_key" ON "QueueEntry"("appointmentId");

-- CreateIndex
CREATE INDEX "QueueEntry_clinicId_status_priority_idx" ON "QueueEntry"("clinicId", "status", "priority");

-- CreateIndex
CREATE INDEX "QueueEntry_clinicId_doctorProfileId_status_idx" ON "QueueEntry"("clinicId", "doctorProfileId", "status");

-- CreateIndex
CREATE INDEX "QueueEntry_patientUserId_idx" ON "QueueEntry"("patientUserId");

-- CreateIndex
CREATE UNIQUE INDEX "BillingInvoice_invoiceNumber_key" ON "BillingInvoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "BillingInvoice_clinicId_status_createdAt_idx" ON "BillingInvoice"("clinicId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "BillingInvoice_patientUserId_idx" ON "BillingInvoice"("patientUserId");

-- CreateIndex
CREATE INDEX "BillingInvoice_invoiceNumber_idx" ON "BillingInvoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "BillingItem_invoiceId_idx" ON "BillingItem"("invoiceId");

-- AddForeignKey
ALTER TABLE "QueueEntry" ADD CONSTRAINT "QueueEntry_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueEntry" ADD CONSTRAINT "QueueEntry_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueEntry" ADD CONSTRAINT "QueueEntry_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "DoctorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueEntry" ADD CONSTRAINT "QueueEntry_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingInvoice" ADD CONSTRAINT "BillingInvoice_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingInvoice" ADD CONSTRAINT "BillingInvoice_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingInvoice" ADD CONSTRAINT "BillingInvoice_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingItem" ADD CONSTRAINT "BillingItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "BillingInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
