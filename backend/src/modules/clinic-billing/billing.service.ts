/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/clinic-billing/billing.service.ts
 *
 * Product:
 * WyshCare Healthcare Operating System
 *
 * Brand:
 * WYSH
 *
 * Founder:
 * Vimarshak Prudhvi
 *
 * Purpose:
 * Business logic service for clinic-billing
 *
 * Responsibilities:
 * - Execute business logic for wyshid operations
 * - Coordinate data access and external API calls
 *
 * Used By:
 - backend/src/modules/prescription/prescription.service.ts
 - backend/src/providers/storage/storage.module.ts
 - backend/src/modules/abdm/abdm.module.ts
 - backend/src/modules/digital-twin/digital-twin.service.ts
 - backend/src/modules/prescription/interaction-engine.service.ts
 - backend/src/modules/interoperability/interoperability.module.ts
 - backend/src/main.ts
 - backend/src/modules/health-graph/health-graph.service.ts
 *
 * Calls:
 - crypto
 - client
 - common
 *
 * Dependencies:
 - crypto
 - client
 - common
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
WyshID
 *
 * Last Reviewed:
2026-06-12
 *
 * ============================================================================
 * (c) Wysh Technologies
 * Built by Vimarshak Prudhvi
 * All Rights Reserved
 * ============================================================================
 */

import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async createInvoice(clinicId: string, data: {
    patientUserId: string;
    appointmentId?: string;
    items: Array<{
      description: string;
      category?: string;
      quantity?: number;
      unitPrice: number;
      referenceId?: string;
      referenceType?: string;
    }>;
    discountAmount?: number;
    notes?: string;
  }, actorUserId: string) {
    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    let subtotal = 0;
    let taxAmount = 0;

    const invoiceItems = data.items.map((item) => {
      const totalPrice = (item.quantity ?? 1) * item.unitPrice;
      subtotal += totalPrice;
      const itemTax = Math.round(totalPrice * 0.18);
      taxAmount += itemTax;
      return {
        id: randomUUID(),
        description: item.description,
        category: (item.category ?? 'OTHER') as 'CONSULTATION' | 'MEDICATION' | 'LAB_TEST' | 'PROCEDURE' | 'VACCINATION' | 'EMERGENCY' | 'FOLLOWUP' | 'OTHER',

        quantity: item.quantity ?? 1,
        unitPrice: item.unitPrice,
        totalPrice,
        taxPercent: 18,
        taxAmount: itemTax,
        netPrice: totalPrice + itemTax,
        referenceId: item.referenceId,
        referenceType: item.referenceType,
      };
    });

    const discountAmount = data.discountAmount ?? 0;
    const totalAmount = subtotal + taxAmount - discountAmount;

    const invoice = await this.prisma.billingInvoice.create({
      data: {
        id: randomUUID(),
        clinicId,
        patientUserId: data.patientUserId,
        appointmentId: data.appointmentId,
        invoiceNumber,
        status: 'DRAFT',
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        dueAmount: totalAmount,
        notes: data.notes,
        updatedAt: new Date(),
        BillingItem: { create: invoiceItems },
      },
      include: { BillingItem: true, User: { select: { id: true, fullName: true } } },
    });

    await this.auditLog.capture({
      actorUserId,
      patientUserId: data.patientUserId,
      action: 'INVOICE_CREATED',
      resourceType: 'BillingInvoice',
      resourceId: invoice.id,
      metadata: { amount: totalAmount, clinicId },
    });

    return invoice;
  }

  async issueInvoice(invoiceId: string, actorUserId: string) {
    const invoice = await this.prisma.billingInvoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status !== 'DRAFT') throw new BadRequestException('Only draft invoices can be issued');

    const updated = await this.prisma.billingInvoice.update({
      where: { id: invoiceId },
      data: { status: 'PENDING', issuedAt: new Date() },
      include: { BillingItem: true, User: { select: { fullName: true } } },
    });

    await this.auditLog.capture({ actorUserId, patientUserId: invoice.patientUserId, action: 'INVOICE_ISSUED', resourceType: 'BillingInvoice', resourceId: invoiceId });
    return updated;
  }

  async recordPayment(invoiceId: string, data: { amount: number; method: string; reference?: string }, actorUserId: string) {
    const invoice = await this.prisma.billingInvoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status === 'PAID' || invoice.status === 'CANCELLED' || invoice.status === 'REFUNDED') {
      throw new BadRequestException('Invoice cannot accept payments in current status');
    }

    const paidAmount = invoice.paidAmount + data.amount;
    const dueAmount = invoice.totalAmount - paidAmount;
    const newStatus = dueAmount <= 0 ? 'PAID' : 'PARTIALLY_PAID';

    const updated = await this.prisma.billingInvoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount,
        dueAmount,
        status: newStatus,
        paymentMethod: data.method,
        paymentReference: data.reference,
        paidAt: newStatus === 'PAID' ? new Date() : undefined,
      },
      include: { BillingItem: true, User: { select: { fullName: true } } },
    });

    await this.auditLog.capture({
      actorUserId, patientUserId: invoice.patientUserId, action: 'PAYMENT_RECORDED',
      resourceType: 'BillingInvoice', resourceId: invoiceId,
      metadata: { amount: data.amount, method: data.method, newStatus },
    });

    return updated;
  }

  async cancelInvoice(invoiceId: string, reason: string, actorUserId: string) {
    const invoice = await this.prisma.billingInvoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status === 'PAID' || invoice.status === 'REFUNDED') {
      throw new BadRequestException('Paid invoices cannot be cancelled — use refund instead');
    }

    const updated = await this.prisma.billingInvoice.update({
      where: { id: invoiceId },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancellationReason: reason },
    });

    await this.auditLog.capture({ actorUserId, patientUserId: invoice.patientUserId, action: 'INVOICE_CANCELLED', resourceType: 'BillingInvoice', resourceId: invoiceId });
    return updated;
  }

  async getInvoice(invoiceId: string) {
    const invoice = await this.prisma.billingInvoice.findUnique({
      where: { id: invoiceId },
      include: { BillingItem: true, User: { select: { fullName: true, phoneNumber: true } } },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async listInvoices(clinicId: string, status?: string, patientUserId?: string) {
    const where: { clinicId: string; status?: InvoiceStatus; patientUserId?: string } = { clinicId };
    if (status) where.status = status as InvoiceStatus;
    if (patientUserId) where.patientUserId = patientUserId;
    return this.prisma.billingInvoice.findMany({
      where,
      include: { BillingItem: true, User: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getRevenueReport(clinicId: string, days: number = 30) {
    const startDate = new Date(Date.now() - days * 86400000);
    const invoices = await this.prisma.billingInvoice.findMany({
      where: { clinicId, createdAt: { gte: startDate } },
    });

    const totalRevenue = invoices.reduce((s, i) => s + i.paidAmount, 0);
    const totalPending = invoices.filter(i => i.status === 'PENDING').reduce((s, i) => s + i.dueAmount, 0);
    const totalBilled = invoices.reduce((s, i) => s + i.totalAmount, 0);
    const totalPatients = new Set(invoices.map(i => i.patientUserId)).size;

    const byDate: Record<string, { billed: number; collected: number; count: number }> = {};
    for (const inv of invoices) {
      const key = inv.createdAt.toISOString().slice(0, 10);
      if (!byDate[key]) byDate[key] = { billed: 0, collected: 0, count: 0 };
      byDate[key]!.billed += inv.totalAmount;
      byDate[key]!.collected += inv.paidAmount;
      byDate[key]!.count++;
    }

    const statusBreakdown = {
      DRAFT: invoices.filter(i => i.status === 'DRAFT').reduce((s, i) => s + i.totalAmount, 0),
      PENDING: totalPending,
      PAID: invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.totalAmount, 0),
      CANCELLED: invoices.filter(i => i.status === 'CANCELLED').reduce((s, i) => s + i.totalAmount, 0),
    };

    return {
      days,
      period: { start: startDate.toISOString(), end: new Date().toISOString() },
      summary: {
        totalBilled,
        totalCollected: totalRevenue,
        totalPending,
        outstanding: totalPending,
        collectionRate: totalBilled > 0 ? Math.round((totalRevenue / totalBilled) * 100) : 0,
        averagePerPatient: totalPatients > 0 ? Math.round(totalBilled / totalPatients) : 0,
        invoiceCount: invoices.length,
        uniquePatients: totalPatients,
      },
      statusBreakdown,
      dailyRevenue: Object.entries(byDate).map(([date, d]) => ({ date, ...d })),
    };
  }

  async getDoctorRevenue(clinicId: string, days: number = 30) {
    const startDate = new Date(Date.now() - days * 86400000);
    const invoices = await this.prisma.billingInvoice.findMany({
      where: { clinicId, createdAt: { gte: startDate } },
      include: { Appointment: { include: { doctorProfile: { include: { user: { select: { fullName: true } } } } } } },
    });

    const byDoctor: Record<string, { doctorName: string; billed: number; collected: number; count: number }> = {};
    for (const inv of invoices) {
      const doc = inv.Appointment?.doctorProfile;
      const name = doc?.user?.fullName ?? 'Unknown';
      if (!byDoctor[name]) byDoctor[name] = { doctorName: name, billed: 0, collected: 0, count: 0 };
      byDoctor[name]!.billed += inv.totalAmount;
      byDoctor[name]!.collected += inv.paidAmount;
      byDoctor[name]!.count++;
    }

    return Object.values(byDoctor).sort((a, b) => b.billed - a.billed);
  }
}
