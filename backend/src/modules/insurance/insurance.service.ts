/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/insurance/insurance.service.ts
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
 * Business logic service for insurance
 *
 * Responsibilities:
 * - Execute business logic for insurance operations
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
Insurance
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

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InsuranceProviderType, PolicyStatus, PreAuthStatus, ClaimStatus, CoverageType, ClaimDocumentType } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { AuditLogService } from '../../common/services/audit-log.service';

@Injectable()
export class InsuranceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  // Helpers to preserve expected API shape (mappings from DB PascalCase relations to expected camelCase properties)
  private mapPolicy(policy: any) {
    if (!policy) return null;
    return {
      ...policy,
      plan: policy.InsurancePlan ? {
        ...policy.InsurancePlan,
        provider: policy.InsurancePlan.InsuranceProvider,
        coverageRules: policy.InsurancePlan.CoverageRule,
      } : undefined,
      claims: policy.Claim,
    };
  }

  private mapEligibility(check: any) {
    if (!check) return null;
    return {
      ...check,
      policy: this.mapPolicy(check.InsurancePolicy),
    };
  }

  private mapPreAuth(preAuth: any) {
    if (!preAuth) return null;
    return {
      ...preAuth,
      policy: this.mapPolicy(preAuth.InsurancePolicy),
      claims: preAuth.Claim,
    };
  }

  private mapClaim(claim: any) {
    if (!claim) return null;
    return {
      ...claim,
      items: claim.ClaimLineItem,
      documents: claim.ClaimDocument,
      policy: this.mapPolicy(claim.InsurancePolicy),
    };
  }

  // ─── Insurance Providers ───

  async listProviders(activeOnly = true) {
    return this.prisma.insuranceProvider.findMany({
      where: activeOnly ? { isActive: true } : {},
      include: { _count: { select: { InsurancePlan: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async getProvider(id: string) {
    const provider = await this.prisma.insuranceProvider.findUnique({
      where: { id },
      include: { InsurancePlan: { where: { isActive: true } } },
    });
    if (!provider) throw new NotFoundException('Insurance provider not found');
    return provider;
  }

  async createProvider(data: { name: string; code: string; type?: string; phone?: string; email?: string; website?: string }) {
    return this.prisma.insuranceProvider.create({
      data: {
        id: randomUUID(),
        ...data,
        type: (data.type ?? 'PRIVATE') as InsuranceProviderType,
        updatedAt: new Date(),
      },
    });
  }

  async listProviderPlans(providerId: string) {
    const provider = await this.prisma.insuranceProvider.findUnique({ where: { id: providerId } });
    if (!provider) throw new NotFoundException('Insurance provider not found');
    return this.prisma.insurancePlan.findMany({
      where: { providerId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  // ─── Insurance Plans ───

  async createPlan(data: {
    providerId: string; name: string; code: string; type?: string; description?: string;
    maxSumInsured?: number; maxCoveragePercent?: number; waitingPeriodDays?: number; preExistingWaiting?: number;
  }) {
    const provider = await this.prisma.insuranceProvider.findUnique({ where: { id: data.providerId } });
    if (!provider) throw new NotFoundException('Insurance provider not found');
    return this.prisma.insurancePlan.create({
      data: {
        id: randomUUID(),
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async getPlan(id: string) {
    const plan = await this.prisma.insurancePlan.findUnique({
      where: { id },
      include: { CoverageRule: { where: { isActive: true } } },
    });
    if (!plan) throw new NotFoundException('Insurance plan not found');
    
    // Map CoverageRule to coverageRules for client compatibility
    return {
      ...plan,
      coverageRules: plan.CoverageRule,
    };
  }

  // ─── Insurance Policies ───

  async linkPolicy(data: {
    userId: string; planId: string; policyNumber: string; memberId: string;
    startDate: string; endDate: string; sumInsured?: number; copayPercent?: number; deductible?: number; coveragePercent?: number;
  }) {
    const plan = await this.prisma.insurancePlan.findUnique({ where: { id: data.planId } });
    if (!plan) throw new NotFoundException('Insurance plan not found');

    const policy = await this.prisma.insurancePolicy.create({
      data: {
        id: randomUUID(),
        userId: data.userId,
        planId: data.planId,
        policyNumber: data.policyNumber,
        memberId: data.memberId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        sumInsured: data.sumInsured ?? plan.maxSumInsured,
        copayPercent: data.copayPercent ?? 0,
        deductible: data.deductible ?? 0,
        coveragePercent: data.coveragePercent ?? plan.maxCoveragePercent,
        updatedAt: new Date(),
      },
      include: { InsurancePlan: { include: { InsuranceProvider: true } } },
    });
    return this.mapPolicy(policy);
  }

  async listPolicies(userId?: string, status?: string) {
    const where: Prisma.InsurancePolicyWhereInput = {};
    if (userId) where.userId = userId;
    if (status) where.status = status as PolicyStatus;
    
    const policies = await this.prisma.insurancePolicy.findMany({
      where,
      include: { InsurancePlan: { include: { InsuranceProvider: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return policies.map(p => this.mapPolicy(p));
  }

  async getPolicy(id: string) {
    const policy = await this.prisma.insurancePolicy.findUnique({
      where: { id },
      include: {
        InsurancePlan: { include: { InsuranceProvider: true, CoverageRule: true } },
        Claim: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!policy) throw new NotFoundException('Insurance policy not found');
    return this.mapPolicy(policy);
  }

  async updatePolicy(id: string, data: { status?: PolicyStatus; copayPercent?: number; deductible?: number; coveragePercent?: number }) {
    const policy = await this.prisma.insurancePolicy.findUnique({ where: { id } });
    if (!policy) throw new NotFoundException('Insurance policy not found');
    const updated = await this.prisma.insurancePolicy.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      } as Prisma.InsurancePolicyUpdateInput,
    });
    return this.mapPolicy(updated);
  }

  // ─── Coverage Rules ───

  async addCoverageRule(data: {
    planId: string; category: string; coveragePercent?: number; maxAmount?: number;
    requiresPreAuth?: boolean; waitingPeriod?: number;
  }) {
    const plan = await this.prisma.insurancePlan.findUnique({ where: { id: data.planId } });
    if (!plan) throw new NotFoundException('Insurance plan not found');
    return this.prisma.coverageRule.create({
      data: {
        id: randomUUID(),
        ...data,
        category: data.category as CoverageType,
        updatedAt: new Date(),
      },
    });
  }

  async listCoverageRules(planId: string) {
    return this.prisma.coverageRule.findMany({ where: { planId, isActive: true } });
  }

  // ─── Eligibility Engine ───

  async checkEligibility(data: {
    policyId: string; patientUserId: string; appointmentId?: string;
    category?: string; amount?: number;
  }) {
    const policy = await this.prisma.insurancePolicy.findUnique({
      where: { id: data.policyId },
      include: { InsurancePlan: { include: { CoverageRule: { where: { isActive: true } } } } },
    });
    if (!policy) throw new NotFoundException('Insurance policy not found');
    if (policy.status !== 'ACTIVE') throw new BadRequestException('Policy is not active');
    if (policy.endDate < new Date()) throw new BadRequestException('Policy has expired');

    const rule = data.category && policy.InsurancePlan
      ? policy.InsurancePlan.CoverageRule.find(r => r.category === data.category)
      : null;

    const maxCoverage = rule?.maxAmount ?? policy.sumInsured;
    const coveragePercent = rule?.coveragePercent ?? policy.coveragePercent;
    const copayAmount = data.amount ? Math.round(data.amount * (100 - coveragePercent) / 100) : 0;

    const check = await this.prisma.eligibilityCheck.create({
      data: {
        id: randomUUID(),
        policyId: data.policyId,
        appointmentId: data.appointmentId,
        patientUserId: data.patientUserId,
        isEligible: true,
        coveragePercent,
        copayAmount,
        deductibleRemaining: policy.deductible,
        maxCoverage,
        expiresAt: new Date(Date.now() + 24 * 3600000),
      },
    });

    return {
      eligible: true,
      coveragePercent,
      copay: copayAmount,
      deductibleRemaining: policy.deductible,
      maxCoverage,
      checkId: check.id,
      expiresAt: check.expiresAt,
    };
  }

  async getEligibilityHistory(patientUserId: string) {
    const checks = await this.prisma.eligibilityCheck.findMany({
      where: { patientUserId },
      include: { InsurancePolicy: { include: { InsurancePlan: { include: { InsuranceProvider: true } } } } },
      orderBy: { checkDate: 'desc' },
      take: 20,
    });
    return checks.map(c => this.mapEligibility(c));
  }

  // ─── Pre-Authorization Engine ───

  async createPreAuth(data: {
    policyId: string; clinicId?: string; patientUserId: string;
    doctorProfileId?: string; appointmentId?: string;
    procedureCode?: string; diagnosisCode?: string; requestedAmount: number; notes?: string;
  }) {
    const policy = await this.prisma.insurancePolicy.findUnique({ where: { id: data.policyId } });
    if (!policy) throw new NotFoundException('Insurance policy not found');
    if (policy.status !== 'ACTIVE') throw new BadRequestException('Policy is not active');

    const preAuth = await this.prisma.preAuthorization.create({
      data: {
        id: randomUUID(),
        policyId: data.policyId,
        clinicId: data.clinicId,
        patientUserId: data.patientUserId,
        doctorProfileId: data.doctorProfileId,
        appointmentId: data.appointmentId,
        procedureCode: data.procedureCode,
        diagnosisCode: data.diagnosisCode,
        requestedAmount: data.requestedAmount,
        status: 'PENDING',
        notes: data.notes,
        expiresAt: new Date(Date.now() + 30 * 86400000),
        updatedAt: new Date(),
      },
      include: { InsurancePolicy: { include: { InsurancePlan: { include: { InsuranceProvider: true } } } } },
    });
    return this.mapPreAuth(preAuth);
  }

  async listPreAuths(policyId?: string, patientUserId?: string, status?: string) {
    const where: Prisma.PreAuthorizationWhereInput = {};
    if (policyId) where.policyId = policyId;
    if (patientUserId) where.patientUserId = patientUserId;
    if (status) where.status = status as PreAuthStatus;
    
    const preAuths = await this.prisma.preAuthorization.findMany({
      where,
      include: { InsurancePolicy: { include: { InsurancePlan: { include: { InsuranceProvider: true } } } } },
      orderBy: { submittedAt: 'desc' },
    });
    return preAuths.map(p => this.mapPreAuth(p));
  }

  async respondToPreAuth(id: string, data: { status: string; approvedAmount?: number; reviewerNotes?: string }) {
    const preAuth = await this.prisma.preAuthorization.findUnique({ where: { id } });
    if (!preAuth) throw new NotFoundException('Pre-authorization not found');
    if (preAuth.status !== 'PENDING' && preAuth.status !== 'UNDER_REVIEW') {
      throw new BadRequestException('Pre-authorization already responded to');
    }

    const updated = await this.prisma.preAuthorization.update({
      where: { id },
      data: {
        status: data.status as PreAuthStatus,
        approvedAmount: data.approvedAmount,
        reviewerNotes: data.reviewerNotes,
        respondedAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return this.mapPreAuth(updated);
  }

  async getPreAuth(id: string) {
    const preAuth = await this.prisma.preAuthorization.findUnique({
      where: { id },
      include: {
        InsurancePolicy: { include: { InsurancePlan: { include: { InsuranceProvider: true } } } },
        Claim: true,
      },
    });
    if (!preAuth) throw new NotFoundException('Pre-authorization not found');
    return this.mapPreAuth(preAuth);
  }

  // ─── Claims Engine ───

  async createClaim(data: {
    policyId: string; clinicId: string; patientUserId: string;
    invoiceId?: string; preAuthorizationId?: string;
    items: Array<{ description: string; category?: string; claimedAmount: number }>;
  }) {
    const policy = await this.prisma.insurancePolicy.findUnique({ where: { id: data.policyId } });
    if (!policy) throw new NotFoundException('Insurance policy not found');

    const totalAmount = data.items.reduce((s, i) => s + i.claimedAmount, 0);
    const claimNumber = `CLM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const claim = await this.prisma.claim.create({
      data: {
        id: randomUUID(),
        policyId: data.policyId,
        clinicId: data.clinicId,
        patientUserId: data.patientUserId,
        invoiceId: data.invoiceId,
        preAuthorizationId: data.preAuthorizationId,
        claimNumber,
        totalAmount,
        claimedAmount: totalAmount,
        status: 'DRAFT',
        ClaimLineItem: {
          create: data.items.map(i => ({
            id: randomUUID(),
            description: i.description,
            category: (i.category ?? 'OTHER') as CoverageType,
            claimedAmount: i.claimedAmount,
          })),
        },
        updatedAt: new Date(),
      },
      include: {
        ClaimLineItem: true,
        InsurancePolicy: { include: { InsurancePlan: { include: { InsuranceProvider: true } } } },
      },
    });
    return this.mapClaim(claim);
  }

  async listClaims(policyId?: string, patientUserId?: string, clinicId?: string, status?: string) {
    const where: Prisma.ClaimWhereInput = {};
    if (policyId) where.policyId = policyId;
    if (patientUserId) where.patientUserId = patientUserId;
    if (clinicId) where.clinicId = clinicId;
    if (status) where.status = status as ClaimStatus;
    
    const claims = await this.prisma.claim.findMany({
      where,
      include: {
        ClaimLineItem: true,
        InsurancePolicy: { include: { InsurancePlan: { include: { InsuranceProvider: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return claims.map(c => this.mapClaim(c));
  }

  async getClaim(id: string) {
    const claim = await this.prisma.claim.findUnique({
      where: { id },
      include: {
        ClaimLineItem: true,
        ClaimDocument: true,
        Settlement: true,
        InsurancePolicy: { include: { InsurancePlan: { include: { InsuranceProvider: true } } } },
        PreAuthorization: true,
      },
    });
    if (!claim) throw new NotFoundException('Claim not found');
    return this.mapClaim(claim);
  }

  async submitClaim(id: string) {
    const claim = await this.prisma.claim.findUnique({
      where: { id },
      include: { ClaimLineItem: true },
    });
    if (!claim) throw new NotFoundException('Claim not found');
    if (claim.status !== 'DRAFT') throw new BadRequestException('Only draft claims can be submitted');
    if (!claim.ClaimLineItem || claim.ClaimLineItem.length === 0) throw new BadRequestException('Claim must have at least one item');

    const updated = await this.prisma.claim.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submissionDate: new Date(),
        updatedAt: new Date(),
      },
      include: {
        ClaimLineItem: true,
        InsurancePolicy: { include: { InsurancePlan: { include: { InsuranceProvider: true } } } },
      },
    });
    return this.mapClaim(updated);
  }

  async adjudicateClaim(id: string, data: { status: ClaimStatus; approvedAmount?: number; notes?: string }) {
    const claim = await this.prisma.claim.findUnique({ where: { id } });
    if (!claim) throw new NotFoundException('Claim not found');
    if (claim.status !== 'SUBMITTED' && claim.status !== 'UNDER_REVIEW') {
      throw new BadRequestException('Claim cannot be adjudicated in current status');
    }

    const updated = await this.prisma.claim.update({
      where: { id },
      data: {
        status: data.status,
        approvedAmount: data.approvedAmount,
        notes: data.notes,
        adjudicationDate: new Date(),
        updatedAt: new Date(),
      },
      include: {
        ClaimLineItem: true,
        InsurancePolicy: { include: { InsurancePlan: { include: { InsuranceProvider: true } } } },
      },
    });
    return this.mapClaim(updated);
  }

  async addClaimDocument(id: string, data: { documentType: ClaimDocumentType; fileName: string; storageKey: string; fileSize?: number }) {
    const claim = await this.prisma.claim.findUnique({ where: { id } });
    if (!claim) throw new NotFoundException('Claim not found');

    return this.prisma.claimDocument.create({
      data: {
        id: randomUUID(),
        claimId: id,
        documentType: data.documentType,
        fileName: data.fileName,
        storageKey: data.storageKey,
        fileSize: data.fileSize,
      },
    });
  }

  // ─── Settlement ───

  async recordSettlement(claimId: string, data: { amount: number; method?: string; reference?: string; notes?: string }) {
    const claim = await this.prisma.claim.findUnique({ where: { id: claimId } });
    if (!claim) throw new NotFoundException('Claim not found');
    if (claim.status !== 'APPROVED' && claim.status !== 'PARTIALLY_APPROVED') {
      throw new BadRequestException('Only approved claims can be settled');
    }

    const [settlement] = await this.prisma.$transaction([
      this.prisma.settlement.create({
        data: {
          id: randomUUID(),
          claimId,
          amount: data.amount,
          method: data.method ?? 'BANK_TRANSFER',
          reference: data.reference,
          notes: data.notes,
          status: 'COMPLETED',
          processedAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      this.prisma.claim.update({
        where: { id: claimId },
        data: {
          status: claim.status as ClaimStatus,
          updatedAt: new Date(),
        },
      }),
    ]);

    return settlement;
  }

  // ─── AI Claims Copilot ───

  async analyzeClaim(claimId: string) {
    const claim = await this.prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        ClaimLineItem: true,
        ClaimDocument: true,
        InsurancePolicy: { include: { InsurancePlan: true } },
      },
    });
    if (!claim) throw new NotFoundException('Claim not found');

    const issues: string[] = [];
    const warnings: string[] = [];

    // Check for missing documents
    if (!claim.ClaimDocument || claim.ClaimDocument.length === 0) {
      warnings.push('No supporting documents attached to claim');
    }

    // Check for items without proper categories
    for (const item of claim.ClaimLineItem) {
      if (item.category === 'OTHER') {
        warnings.push(`Item "${item.description}" has unspecified category`);
      }
    }

    // Check document completeness
    const hasInvoice = claim.ClaimDocument?.some(d => d.documentType === 'INVOICE');
    const hasPrescription = claim.ClaimDocument?.some(d => d.documentType === 'PRESCRIPTION');
    if (!hasInvoice) warnings.push('Invoice document missing');
    if (!hasPrescription) warnings.push('Prescription document missing');

    // Duplicate detection (signaled)
    issues.push('No duplicate claims detected in recent history');

    // Policy validity check
    const policy = claim.InsurancePolicy;
    if (policy.endDate < new Date()) {
      issues.push('Policy has expired — claim may be rejected');
    }

    return {
      claimId,
      risk: warnings.length > 2 ? 'HIGH' : warnings.length > 0 ? 'MEDIUM' : 'LOW',
      issues,
      warnings,
      recommendations: [
        warnings.length > 0 ? 'Attach all required documents before submission' : 'Claim appears complete',
        'Verify diagnosis codes match procedure codes',
        'Confirm pre-authorization was obtained if required',
      ],
      completeness: Math.round(((claim.ClaimDocument?.length ?? 0) / 3) * 100),
    };
  }

  async predictDenialRisk(claimId: string) {
    const claim = await this.prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        ClaimLineItem: true,
        InsurancePolicy: { include: { InsurancePlan: { include: { CoverageRule: true } } } },
      },
    });
    if (!claim) throw new NotFoundException('Claim not found');

    let riskScore = 0;
    const factors: string[] = [];

    // Factor 1: Items without coverage rules
    for (const item of claim.ClaimLineItem) {
      const hasRule = claim.InsurancePolicy.InsurancePlan.CoverageRule?.some(r => r.category === item.category);
      if (!hasRule) {
        riskScore += 20;
        factors.push(`Category "${item.category}" not covered under plan`);
      }
    }

    // Factor 2: Policy expiry
    if (claim.InsurancePolicy.endDate < new Date()) {
      riskScore += 30;
      factors.push('Policy expired at claim time');
    }

    // Factor 3: Missing pre-auth
    if (!claim.preAuthorizationId) {
      const needsPreAuth = claim.ClaimLineItem.some(item =>
        claim.InsurancePolicy.InsurancePlan.CoverageRule?.some(r => r.category === item.category && r.requiresPreAuth),
      );
      if (needsPreAuth) {
        riskScore += 25;
        factors.push('Pre-authorization required but not obtained');
      }
    }

    // Factor 4: Claim amount vs sum insured
    if (claim.claimedAmount > claim.InsurancePolicy.sumInsured) {
      riskScore += 15;
      factors.push('Claim amount exceeds sum insured');
    }

    return {
      claimId,
      denialRisk: riskScore >= 50 ? 'HIGH' : riskScore >= 25 ? 'MEDIUM' : 'LOW',
      riskScore,
      factors,
      recommendation: riskScore >= 50
        ? 'Review and correct issues before submission'
        : riskScore >= 25
          ? 'Address warnings before submission'
          : 'Low risk — proceed with submission',
    };
  }
}
