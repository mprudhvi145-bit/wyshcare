/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/nhcx/fhir-mapper.ts
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
 * fhir-mapper — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - Standalone (not imported by other source files)
 *
 * Calls:
 - None identified
 *
 * Dependencies:
 - None identified
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

export interface FhirClaim {
  resourceType: 'Claim';
  identifier: Array<{ system: string; value: string }>;
  status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';
  type: { coding: Array<{ system: string; code: string; display: string }> };
  use: 'claim' | 'preauthorization' | 'predetermination';
  patient: { reference: string };
  created: string;
  insurer: { reference: string };
  provider: { reference: string };
  priority: { coding: Array<{ system: string; code: string }> };
  diagnosis?: Array<{
    sequence: number;
    diagnosisCodeableConcept: { coding: Array<{ system: string; code: string; display: string }> };
  }>;
  item: Array<{
    sequence: number;
    productOrService: { coding: Array<{ system: string; code: string }> };
    unitPrice?: { value: number; currency: string };
    net?: { value: number; currency: string };
    category?: { coding: Array<{ system: string; code: string }> };
  }>;
  total: { value: number; currency: string };
}

export interface FhirClaimResponse {
  resourceType: 'ClaimResponse';
  status: string;
  identifier: Array<{ system: string; value: string }>;
  outcome: 'queued' | 'complete' | 'error' | 'partial';
  disposition?: string;
  item?: Array<{
    sequence: number;
    adjudication: Array<{
      category: { coding: Array<{ system: string; code: string }> };
      amount?: { value: number; currency: string };
    }>;
  }>;
  total?: { value: number; currency: string };
}

const NHCX_ID_SYSTEM = 'https://nhcx.abdm.gov.in/identifier';
const ICD_SYSTEM = 'http://hl7.org/fhir/sid/icd-10';
const CPT_SYSTEM = 'http://www.ama-assn.org/go/cpt';

export function toFhirClaim(params: {
  claimNumber: string;
  patientWyshId: string;
  insurerId: string;
  clinicId: string;
  diagnosisCode?: string;
  items: Array<{ description: string; claimedAmount: number; category: string }>;
  totalAmount: number;
  created: string;
}): FhirClaim {
  return {
    resourceType: 'Claim',
    identifier: [
      { system: NHCX_ID_SYSTEM, value: params.claimNumber },
    ],
    status: 'active',
    type: {
      coding: [
        { system: 'http://terminology.hl7.org/CodeSystem/claim-type', code: 'institutional', display: 'Institutional' },
      ],
    },
    use: 'claim',
    patient: { reference: `Patient/${params.patientWyshId}` },
    created: params.created,
    insurer: { reference: `Organization/${params.insurerId}` },
    provider: { reference: `Organization/${params.clinicId}` },
    priority: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/processpriority', code: 'normal' }] },
    diagnosis: params.diagnosisCode
      ? [{
          sequence: 1,
          diagnosisCodeableConcept: {
            coding: [{ system: ICD_SYSTEM, code: params.diagnosisCode, display: params.diagnosisCode }],
          },
        }]
      : undefined,
    item: params.items.map((item, i) => ({
      sequence: i + 1,
      productOrService: { coding: [{ system: CPT_SYSTEM, code: '99213' }] },
      unitPrice: { value: item.claimedAmount / 100, currency: 'INR' },
      net: { value: item.claimedAmount / 100, currency: 'INR' },
      category: { coding: [{ system: NHCX_ID_SYSTEM, code: item.category }] },
    })),
    total: { value: params.totalAmount / 100, currency: 'INR' },
  };
}

export function fromFhirClaimResponse(fhir: FhirClaimResponse): {
  status: string;
  approvedAmount?: number;
  notes?: string;
} {
  const outcome = fhir.outcome;
  const statusMap: Record<string, string> = {
    queued: 'SUBMITTED',
    complete: 'APPROVED',
    error: 'DENIED',
    partial: 'PARTIALLY_APPROVED',
  };

  const total = fhir.total?.value;
  const adjudicationItems = fhir.item?.flatMap(i => i.adjudication || []);
  const approvedAmount = total
    ? Math.round(total * 100)
    : adjudicationItems?.reduce((sum, adj) => sum + (adj.amount ? Math.round(adj.amount.value * 100) : 0), 0);

  return {
    status: statusMap[outcome] ?? 'SUBMITTED',
    approvedAmount,
    notes: fhir.disposition,
  };
}
