import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, ClaimStatus } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import { toFhirClaim } from './fhir-mapper';

@Injectable()
export class NHCXService {
  private readonly logger = new Logger(NHCXService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async configure(params: {
    providerId: string;
    insurerId: string;
    apiEndpoint: string;
    clientId: string;
    clientSecret: string;
    webhookSecret?: string;
  }) {
    const provider = await this.prisma.insuranceProvider.findUnique({ where: { id: params.providerId } });
    if (!provider) throw new NotFoundException('Insurance provider not found');

    const config = await this.prisma.nHCXConfiguration.upsert({
      where: { providerId: params.providerId },
      create: {
        id: randomUUID(),
        providerId: params.providerId,
        insurerId: params.insurerId,
        apiEndpoint: params.apiEndpoint,
        clientId: params.clientId,
        clientSecret: params.clientSecret,
        webhookSecret: params.webhookSecret,
        updatedAt: new Date(),
      },
      update: {
        insurerId: params.insurerId,
        apiEndpoint: params.apiEndpoint,
        clientId: params.clientId,
        clientSecret: params.clientSecret,
        webhookSecret: params.webhookSecret,
        updatedAt: new Date(),
      },
    });

    await this.auditLog.capture({ action: 'nhcx.configured', resourceType: 'nhcx', resourceId: params.providerId, metadata: { providerId: params.providerId } });
    return config;
  }

  async getConfiguration(providerId: string) {
    const config = await this.prisma.nHCXConfiguration.findUnique({ where: { providerId } });
    if (!config) throw new NotFoundException('NHCX not configured for this provider');
    return { ...config, clientSecret: '[REDACTED]' };
  }

  // ─── NEW FHIR-Compliant Stubs ───

  async checkEligibility(request: {
    patientId: string;
    patientName?: string;
    insuranceProvider: string;
    insuranceId: string;
    policyNumber?: string;
    purpose: 'validation' | 'discovery' | 'auth-requirement' | 'benefits';
  }): Promise<Record<string, unknown>> {
    const bundleId = `eligibility-${randomUUID()}`;
    const responseId = `cer-${randomUUID()}`;
    const patientUuid = `urn:uuid:${randomUUID()}`;
    const insurerUuid = `urn:uuid:${randomUUID()}`;
    const providerOrgUuid = `urn:uuid:${randomUUID()}`;
    const coverageUuid = `urn:uuid:${randomUUID()}`;
    const requestUuid = `urn:uuid:${randomUUID()}`;
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const yearEnd = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);

    return {
      resourceType: 'Bundle',
      id: bundleId,
      meta: {
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/CoverageEligibilityResponseBundle'],
      },
      identifier: { value: bundleId },
      type: 'collection',
      timestamp: now,
      entry: [
        {
          fullUrl: `urn:uuid:${responseId}`,
          resource: {
            resourceType: 'CoverageEligibilityResponse',
            id: responseId,
            meta: {
              profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/CoverageEligibilityResponse'],
            },
            status: 'active',
            purpose: [request.purpose],
            patient: { reference: patientUuid, display: request.patientName ?? 'Patient' },
            created: today,
            requestor: { reference: providerOrgUuid, display: 'Healthcare Provider' },
            request: { reference: requestUuid, display: 'CoverageEligibilityRequest' },
            outcome: 'complete',
            disposition: 'Policy is currently in-force.',
            insurer: { reference: insurerUuid, display: request.insuranceProvider },
            insurance: [{
              coverage: { reference: coverageUuid, display: request.insuranceId },
              inforce: true,
              benefitPeriod: { start: today, end: yearEnd },
              item: [
                {
                  category: { coding: [{ code: 'office', display: 'Office Visit' }] },
                  benefit: [{ type: { coding: [{ code: 'copay' }] }, allowedMoney: { value: 20, currency: 'INR' } }],
                },
                {
                  category: { coding: [{ code: 'hospital', display: 'Hospital Care' }] },
                  benefit: [{ type: { coding: [{ code: 'benefit' }] }, allowedMoney: { value: 500000, currency: 'INR' } }],
                },
              ],
            }],
          },
        },
        {
          fullUrl: requestUuid,
          resource: {
            resourceType: 'CoverageEligibilityRequest',
            id: requestUuid.replace('urn:uuid:', ''),
            meta: {
              profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/CoverageEligibilityRequest'],
            },
            status: 'active',
            purpose: [request.purpose],
            patient: { reference: patientUuid, display: request.patientName ?? 'Patient' },
            created: now,
            insurer: { reference: insurerUuid, display: request.insuranceProvider },
            insurance: [{ focal: true, coverage: { reference: coverageUuid } }],
          },
        },
        {
          fullUrl: patientUuid,
          resource: {
            resourceType: 'Patient',
            id: patientUuid.replace('urn:uuid:', ''),
            meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient'] },
            identifier: [{ system: 'https://wyshcare.in/identifier', value: request.patientId }],
          },
        },
        {
          fullUrl: insurerUuid,
          resource: {
            resourceType: 'Organization',
            id: insurerUuid.replace('urn:uuid:', ''),
            meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Organization'] },
            type: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/organization-type', code: 'ins', display: 'Insurance Company' }] }],
            name: request.insuranceProvider,
          },
        },
        {
          fullUrl: providerOrgUuid,
          resource: {
            resourceType: 'Organization',
            id: providerOrgUuid.replace('urn:uuid:', ''),
            meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Organization'] },
            type: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/organization-type', code: 'prov', display: 'Healthcare Provider' }] }],
            name: 'WyshCare Healthcare',
          },
        },
        {
          fullUrl: coverageUuid,
          resource: {
            resourceType: 'Coverage',
            id: coverageUuid.replace('urn:uuid:', ''),
            meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Coverage'] },
            identifier: [{ system: 'https://wyshcare.in/policynumber/', value: request.insuranceId }],
            status: 'active',
            type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'HIP', display: 'health insurance plan policy' }] },
            subscriber: { reference: patientUuid },
            subscriberId: request.insuranceId,
            beneficiary: { reference: patientUuid },
            relationship: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/subscriber-relationship', code: 'self' }] },
            period: { end: yearEnd },
            payor: [{ reference: insurerUuid, display: request.insuranceProvider }],
          },
        },
      ],
    };
  }

  async submitClaim(claim: {
    use: 'preauthorization' | 'predetermination' | 'claim';
    patientId: string;
    patientName?: string;
    providerId: string;
    providerName?: string;
    insurerName?: string;
    items: Array<{ productOrService: string; unitPrice: number; quantity: number }>;
  }): Promise<Record<string, unknown>> {
    const bundleId = `claim-response-${randomUUID()}`;
    const responseId = `cr-${randomUUID()}`;
    const claimId = `CLM-${randomUUID().slice(0, 8)}`;
    const patientUuid = `urn:uuid:${randomUUID()}`;
    const insurerUuid = `urn:uuid:${randomUUID()}`;
    const providerOrgUuid = `urn:uuid:${randomUUID()}`;
    const coverageUuid = `urn:uuid:${randomUUID()}`;
    const claimUuid = `urn:uuid:${randomUUID()}`;
    const now = new Date().toISOString();
    const totalValue = claim.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const nowDate = now.slice(0, 10);

    return {
      resourceType: 'Bundle',
      id: bundleId,
      meta: {
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/ClaimResponseBundle'],
      },
      identifier: { value: bundleId },
      type: 'collection',
      timestamp: now,
      entry: [
        {
          fullUrl: `urn:uuid:${responseId}`,
          resource: {
            resourceType: 'ClaimResponse',
            id: responseId,
            meta: {
              profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/ClaimResponse'],
            },
            status: 'active',
            type: {
              coding: [{ system: 'http://terminology.hl7.org/CodeSystem/claim-type', code: claim.use === 'preauthorization' ? 'professional' : 'institutional' }],
            },
            use: claim.use,
            patient: { reference: patientUuid, display: claim.patientName ?? 'Patient' },
            created: now,
            insurer: { reference: insurerUuid, display: claim.insurerName ?? 'NHCX Gateway' },
            requestor: { reference: providerOrgUuid, display: claim.providerName ?? 'Healthcare Provider' },
            request: { reference: claimUuid, display: `Claim ${claimId}` },
            outcome: 'queued',
            disposition: 'Claim submitted to NHCX gateway for processing',
            item: claim.items.map((item, i) => ({
              itemSequence: i + 1,
              adjudication: [
                { category: { coding: [{ code: 'submitted', display: 'Submitted Amount' }] }, amount: { value: item.unitPrice * item.quantity, currency: 'INR' } },
              ],
            })),
            total: [
              { category: { coding: [{ code: 'submitted', display: 'Submitted Amount' }] }, amount: { value: totalValue, currency: 'INR' } },
            ],
            insurance: [{ sequence: 1, focal: true, coverage: { reference: coverageUuid, display: claim.insurerName ?? 'NHCX Gateway' } }],
          },
        },
        {
          fullUrl: claimUuid,
          resource: {
            resourceType: 'Claim',
            id: claimUuid.replace('urn:uuid:', ''),
            meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Claim'] },
            identifier: [{ value: claimId }],
            status: 'active',
            type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/claim-type', code: 'professional', display: 'Professional' }] },
            use: claim.use,
            patient: { reference: patientUuid, display: claim.patientName ?? 'Patient' },
            created: now,
            insurer: { reference: insurerUuid, display: claim.insurerName ?? 'NHCX Gateway' },
            provider: { reference: providerOrgUuid, display: claim.providerName ?? 'Healthcare Provider' },
            priority: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/processpriority', code: 'normal' }] },
            insurance: [{ sequence: 1, focal: true, coverage: { reference: coverageUuid } }],
            item: claim.items.map((item, i) => ({
              sequence: i + 1,
              productOrService: { coding: [{ code: item.productOrService }] },
              unitPrice: { value: item.unitPrice, currency: 'INR' },
              net: { value: item.unitPrice * item.quantity, currency: 'INR' },
            })),
            total: { value: totalValue, currency: 'INR' },
          },
        },
        {
          fullUrl: patientUuid,
          resource: {
            resourceType: 'Patient',
            id: patientUuid.replace('urn:uuid:', ''),
            meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient'] },
            identifier: [{ system: 'https://wyshcare.in/identifier', value: claim.patientId }],
          },
        },
        {
          fullUrl: insurerUuid,
          resource: {
            resourceType: 'Organization',
            id: insurerUuid.replace('urn:uuid:', ''),
            meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Organization'] },
            type: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/organization-type', code: 'ins', display: 'Insurance Company' }] }],
            name: claim.insurerName ?? 'NHCX Gateway',
          },
        },
        {
          fullUrl: providerOrgUuid,
          resource: {
            resourceType: 'Organization',
            id: providerOrgUuid.replace('urn:uuid:', ''),
            meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Organization'] },
            type: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/organization-type', code: 'prov', display: 'Healthcare Provider' }] }],
            name: claim.providerName ?? 'WyshCare Healthcare',
          },
        },
      ],
    };
  }

  async checkClaimStatus(claimId: string, submissionRef?: string): Promise<Record<string, unknown>> {
    const bundleId = `task-${randomUUID()}`;
    const taskId = `task-${randomUUID()}`;
    const requesterUuid = `urn:uuid:${randomUUID()}`;
    const ownerUuid = `urn:uuid:${randomUUID()}`;
    const now = new Date().toISOString();

    return {
      resourceType: 'Bundle',
      id: bundleId,
      meta: {
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/TaskBundle'],
      },
      identifier: { value: bundleId },
      type: 'collection',
      timestamp: now,
      entry: [
        {
          fullUrl: `urn:uuid:${taskId}`,
          resource: {
            resourceType: 'Task',
            id: taskId,
            meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Task'] },
            status: 'in-progress',
            intent: 'order',
            code: { coding: [{ system: 'https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-code', code: 'status', display: 'Status Check' }] },
            description: `Status check for claim ${claimId}`,
            authoredOn: now,
            lastModified: now,
            requester: { reference: requesterUuid, display: 'WyshCare Healthcare' },
            owner: { reference: ownerUuid, display: 'NHCX Gateway' },
            input: [
              { type: { coding: [{ code: 'ClaimNumber' }] }, valueString: claimId },
              ...(submissionRef ? [{ type: { coding: [{ code: 'SubmissionRef' }] }, valueString: submissionRef }] : []),
            ],
            output: [
              { type: { coding: [{ code: 'Status' }] }, valueString: 'PROCESSING' },
              { type: { coding: [{ code: 'Description' }] }, valueString: 'Claim is being processed by the insurer' },
            ],
          },
        },
        {
          fullUrl: requesterUuid,
          resource: {
            resourceType: 'Organization',
            id: requesterUuid.replace('urn:uuid:', ''),
            meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Organization'] },
            type: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/organization-type', code: 'prov', display: 'Healthcare Provider' }] }],
            name: 'WyshCare Healthcare',
          },
        },
        {
          fullUrl: ownerUuid,
          resource: {
            resourceType: 'Organization',
            id: ownerUuid.replace('urn:uuid:', ''),
            meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Organization'] },
            type: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/organization-type', code: 'ins', display: 'Insurance Company' }] }],
            name: 'NHCX Gateway',
          },
        },
      ],
    };
  }

  async getProviderDetails(providerId?: string): Promise<Record<string, unknown>> {
    const bundleId = `insurance-plan-${randomUUID()}`;
    const planId = `ip-${randomUUID()}`;
    const orgUuid = `urn:uuid:${randomUUID()}`;
    const now = new Date().toISOString();

    return {
      resourceType: 'Bundle',
      id: bundleId,
      meta: {
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/InsurancePlanBundle'],
        security: [{
          system: 'http://terminology.hl7.org/CodeSystem/v3-Confidentiality',
          code: 'V',
          display: 'very restricted',
        }],
      },
      identifier: { value: bundleId },
      type: 'collection',
      timestamp: now,
      entry: [
        {
          fullUrl: `urn:uuid:${planId}`,
          resource: {
            resourceType: 'InsurancePlan',
            id: planId,
            meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/InsurancePlan'] },
            identifier: [{ system: 'https://irdai.gov.in', value: providerId ?? 'NHCX-DEFAULT' }],
            status: 'active',
            type: [{ coding: [{ code: 'HOSP', display: 'Hospitalisation Indemnity Policy' }] }],
            name: 'WyshCare Standard Health Plan',
            period: { start: now.slice(0, 10), end: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10) },
            ownedBy: { reference: orgUuid, display: 'WyshCare Insurance' },
            administeredBy: { reference: orgUuid, display: 'WyshCare Insurance' },
            coverage: [
              {
                type: { coding: [{ code: 'inpatient', display: 'Inpatient Care' }] },
                benefit: [{ type: { coding: [{ code: 'room', display: 'Room Charges' }] } }],
              },
              {
                type: { coding: [{ code: 'outpatient', display: 'Outpatient Care' }] },
                benefit: [{ type: { coding: [{ code: 'consultation', display: 'Consultation' }] } }],
              },
            ],
            plan: [
              {
                identifier: [{ value: 'WYSH-STD-IND' }],
                type: { coding: [{ code: 'individual', display: 'Individual' }] },
                generalCost: [{ type: { coding: [{ code: 'premium', display: 'Annual Premium' }] }, value: { value: 15000, currency: 'INR' } }],
                specificCost: [
                  {
                    category: { coding: [{ code: 'room', display: 'Room Charges' }] },
                    benefit: [{ type: { coding: [{ code: 'room' }] }, cost: [{ type: { coding: [{ code: 'fullcoverage' }] }, value: { value: 5000, currency: 'INR' } }] }],
                  },
                ],
              },
            ],
          },
        },
        {
          fullUrl: orgUuid,
          resource: {
            resourceType: 'Organization',
            id: orgUuid.replace('urn:uuid:', ''),
            meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Organization'] },
            identifier: [{ type: { coding: [{ system: 'https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code', code: 'ROHINI', display: 'ROHINI ID' }] }, system: 'https://rohini.iib.gov.in/', value: providerId ?? 'WYSH-001' }],
            type: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/organization-type', code: 'ins', display: 'Insurance Company' }] }],
            name: 'WyshCare Insurance Co. Ltd.',
          },
        },
      ],
    };
  }

  async reprocessClaim(claimId: string, reason?: string): Promise<Record<string, unknown>> {
    const bundleId = `task-reprocess-${randomUUID()}`;
    const taskId = `task-${randomUUID()}`;
    const requesterUuid = `urn:uuid:${randomUUID()}`;
    const ownerUuid = `urn:uuid:${randomUUID()}`;
    const now = new Date().toISOString();

    return {
      resourceType: 'Bundle',
      id: bundleId,
      meta: {
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/TaskBundle'],
      },
      identifier: { value: bundleId },
      type: 'collection',
      timestamp: now,
      entry: [
        {
          fullUrl: `urn:uuid:${taskId}`,
          resource: {
            resourceType: 'Task',
            id: taskId,
            meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Task'] },
            status: 'requested',
            intent: 'order',
            code: { coding: [{ system: 'https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-code', code: 'reprocess', display: 'Reprocess' }] },
            description: reason ?? `Request for reprocessing the claim with number - ${claimId}`,
            authoredOn: now,
            requester: { reference: requesterUuid, display: 'WyshCare Healthcare' },
            owner: { reference: ownerUuid, display: 'NHCX Gateway' },
            input: [
              { type: { coding: [{ code: 'ClaimNumber' }] }, valueString: claimId },
              ...(reason ? [{ type: { coding: [{ code: 'Reason' }] }, valueString: reason }] : []),
            ],
          },
        },
        {
          fullUrl: ownerUuid,
          resource: {
            resourceType: 'Organization',
            id: ownerUuid.replace('urn:uuid:', ''),
            meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Organization'] },
            type: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/organization-type', code: 'ins', display: 'Insurance Company' }] }],
            name: 'NHCX Gateway',
          },
        },
        {
          fullUrl: requesterUuid,
          resource: {
            resourceType: 'Organization',
            id: requesterUuid.replace('urn:uuid:', ''),
            meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Organization'] },
            type: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/organization-type', code: 'prov', display: 'Healthcare Provider' }] }],
            name: 'WyshCare Healthcare',
          },
        },
      ],
    };
  }

  // ─── Existing DB-backed methods ───

  async submitClaimDb(claimId: string) {
    const claim = await this.prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        ClaimLineItem: true,
        InsurancePolicy: { include: { InsurancePlan: { include: { InsuranceProvider: { include: { NHCXConfiguration: true } } } }, User: true } },
      },
    });
    if (!claim) throw new NotFoundException('Claim not found');
    if (claim.status !== 'SUBMITTED') throw new BadRequestException('Claim must be in SUBMITTED status');

    const nhcxConfig = claim.InsurancePolicy.InsurancePlan.InsuranceProvider.NHCXConfiguration;
    if (!nhcxConfig || !nhcxConfig.isActive) {
      throw new BadRequestException('NHCX not configured for this provider');
    }

    const fhirClaim = toFhirClaim({
      claimNumber: claim.claimNumber,
      patientWyshId: claim.InsurancePolicy.User.wyshId,
      insurerId: nhcxConfig.insurerId,
      clinicId: claim.clinicId,
      diagnosisCode: undefined,
      items: claim.ClaimLineItem.map(i => ({
        description: i.description,
        claimedAmount: i.claimedAmount,
        category: i.category,
      })),
      totalAmount: claim.claimedAmount,
      created: claim.createdAt.toISOString(),
    });

    const { submissionRef, responsePayload } = await this.submitToNHCX(nhcxConfig as unknown as Record<string, unknown>, fhirClaim as unknown as Record<string, unknown>);

    const submission = await this.prisma.nHCXClaimSubmission.create({
      data: {
        id: randomUUID(),
        claimId: claim.id,
        submissionRef,
        status: 'PENDING',
        requestPayload: fhirClaim as unknown as Prisma.InputJsonValue,
        responsePayload: (responsePayload ?? undefined) as Prisma.InputJsonValue | undefined,
        submittedAt: new Date(),
        updatedAt: new Date(),
        NHCXLog: {
          create: {
            id: randomUUID(),
            event: 'SUBMIT',
            level: 'INFO',
            message: `Claim ${claim.claimNumber} submitted via NHCX`,
            metadata: { submissionRef, insurerId: nhcxConfig.insurerId },
          },
        },
      },
    });

    await this.prisma.claim.update({
      where: { id: claimId },
      data: {
        status: 'UNDER_REVIEW',
        updatedAt: new Date(),
      },
    });

    await this.auditLog.capture({ action: 'nhcx.submitted', resourceType: 'claim', resourceId: claimId, metadata: { claimId, submissionRef: submission.submissionRef } });

    return {
      submissionId: submission.id,
      submissionRef,
      status: 'SUBMITTED',
      message: 'Claim submitted to NHCX gateway',
    };
  }

  async acknowledgeSubmission(submissionId: string, outcome: string, notes?: string) {
    const submission = await this.prisma.nHCXClaimSubmission.findUnique({
      where: { id: submissionId },
      include: { Claim: true },
    });
    if (!submission) throw new NotFoundException('NHCX submission not found');

    const statusMap: Record<string, string> = {
      ACKNOWLEDGED: 'SUBMITTED',
      ACCEPTED: 'APPROVED',
      REJECTED: 'DENIED',
    };

    const claimStatus = statusMap[outcome] ?? 'SUBMITTED';
    const approvedAmount = outcome === 'ACCEPTED' ? submission.Claim.claimedAmount : undefined;

    await this.prisma.nHCXClaimSubmission.update({
      where: { id: submissionId },
      data: {
        status: outcome,
        acknowledgedAt: new Date(),
        responsePayload: { outcome, notes } as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
    });

    await this.prisma.nHCXLog.create({
      data: {
        id: randomUUID(),
        submissionId,
        event: 'ACKNOWLEDGE',
        level: outcome === 'REJECTED' ? 'ERROR' : 'INFO',
        message: `NHCX acknowledgement received: ${outcome}`,
        metadata: { outcome, notes },
      },
    });

    if (claimStatus !== 'SUBMITTED') {
      await this.prisma.claim.update({
        where: { id: submission.claimId },
        data: {
          status: claimStatus as ClaimStatus,
          approvedAmount,
          updatedAt: new Date(),
        },
      });
    }

    await this.auditLog.capture({ action: 'nhcx.acknowledged', resourceType: 'nhcx', resourceId: submissionId, metadata: { submissionId, outcome } });

    return {
      submissionId,
      outcome,
      claimStatus,
      notes,
    };
  }

  async syncStatus(submissionId: string) {
    const submission = await this.prisma.nHCXClaimSubmission.findUnique({
      where: { id: submissionId },
      include: { Claim: true },
    });
    if (!submission) throw new NotFoundException('NHCX submission not found');

    const syncResult = await this.syncWithNHCX({ submissionRef: submission.submissionRef!, submittedAt: submission.submittedAt });

    await this.prisma.nHCXClaimSubmission.update({
      where: { id: submissionId },
      data: {
        status: syncResult.status,
        syncedAt: new Date(),
        responsePayload: syncResult.payload as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
    });

    await this.prisma.nHCXLog.create({
      data: {
        id: randomUUID(),
        submissionId,
        event: 'SYNC',
        level: syncResult.status === 'REJECTED' ? 'ERROR' : 'INFO',
        message: `Status synced: ${syncResult.status}`,
        metadata: syncResult.payload as Prisma.InputJsonValue,
      },
    });

    return {
      submissionId,
      status: syncResult.status,
      syncedAt: new Date().toISOString(),
    };
  }

  async getStats() {
    const [totalSent, totalThisMonth] = await Promise.all([
      this.prisma.nHCXClaimSubmission.count(),
      this.prisma.nHCXClaimSubmission.count({
        where: { submittedAt: { gte: new Date(new Date().setDate(1)) } },
      }),
    ]);

    const allSubmissions = await this.prisma.nHCXClaimSubmission.findMany({
      select: { status: true },
    });
    const statusCounts: Record<string, number> = {};
    for (const s of allSubmissions) {
      statusCounts[s.status] = (statusCounts[s.status] ?? 0) + 1;
    }

    return {
      totalClaimsSent: totalSent,
      claimsThisMonth: totalThisMonth,
      successRate: totalSent > 0 ? Math.round(((statusCounts.ACCEPTED ?? 0) / totalSent) * 1000) / 10 : 0,
      failureRate: totalSent > 0 ? Math.round(((statusCounts.REJECTED ?? 0) / totalSent) * 1000) / 10 : 0,
      byStatus: statusCounts,
    };
  }

  async getSubmissions(params?: { status?: string; limit?: number }) {
    const where: Prisma.NHCXClaimSubmissionWhereInput = {};
    if (params?.status) where.status = params.status;

    const submissions = await this.prisma.nHCXClaimSubmission.findMany({
      where,
      include: {
        Claim: { select: { claimNumber: true, claimedAmount: true, status: true } },
        NHCXLog: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
      orderBy: { submittedAt: 'desc' },
      take: params?.limit ?? 50,
    });

    return submissions.map(s => ({
      ...s,
      claim: s.Claim,
      logs: s.NHCXLog,
    }));
  }

  // ─── Simulated NHCX Gateway Calls ───

  private async submitToNHCX(config: Record<string, unknown>, _fhirClaim: Record<string, unknown>): Promise<{ submissionRef: string; responsePayload?: Record<string, unknown> }> {
    this.logger.log(`NHCX submit to ${config.apiEndpoint} for insurer ${config.insurerId}`);

    const submissionRef = `NHCX-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 8).toUpperCase()}`;

    return { submissionRef };
  }

  private async syncWithNHCX(submission: { submissionRef: string; submittedAt: Date }): Promise<{ status: string; payload?: Record<string, unknown> }> {
    this.logger.log(`NHCX sync for submission ${submission.submissionRef}`);

    const elapsed = Date.now() - new Date(submission.submittedAt).getTime();
    const hoursSinceSubmission = elapsed / 3600000;

    let status = 'PENDING';
    if (hoursSinceSubmission > 24) status = 'ACCEPTED';
    else if (hoursSinceSubmission > 12) status = 'PROCESSING';

    return {
      status,
      payload: { syncedAt: new Date().toISOString(), elapsedHours: Math.round(hoursSinceSubmission * 10) / 10 },
    };
  }
}
