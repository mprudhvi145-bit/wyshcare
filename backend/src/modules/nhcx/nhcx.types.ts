export interface FhirBundle {
  resourceType: 'Bundle';
  id: string;
  meta?: {
    profile: string[];
    security?: Array<{ system: string; code: string; display: string }>;
    versionId?: string;
    lastUpdated?: string;
  };
  identifier?: { system?: string; value: string };
  type: 'collection';
  timestamp: string;
  entry: FhirBundleEntry[];
}

export interface FhirBundleEntry {
  fullUrl: string;
  resource: Record<string, unknown>;
}

export interface Coding {
  system?: string;
  code?: string;
  display?: string;
}

export interface Money {
  value: number;
  currency: string;
}

export interface Period {
  start?: string;
  end?: string;
}

export interface Reference {
  reference: string;
  display?: string;
  type?: string;
}

// ─── Bundle-specific entry slice types ───

export interface CoverageEligibilityResponseBundleEntry extends FhirBundleEntry {
  resource: {
    resourceType: 'CoverageEligibilityResponse';
    id: string;
    meta?: { profile: string[] };
    status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';
    purpose: Array<'validation' | 'discovery' | 'auth-requirement' | 'benefits'>;
    patient: Reference;
    created: string;
    requestor?: Reference;
    request?: Reference;
    outcome: 'queued' | 'complete' | 'error' | 'partial';
    disposition?: string;
    insurer: Reference;
    insurance: Array<{
      coverage: Reference;
      inforce?: boolean;
      benefitPeriod?: Period;
      item?: Array<{
        category?: Coding;
        benefit?: Array<{
          type: Coding;
          allowedMoney?: Money;
          allowedString?: string;
        }>;
      }>;
    }>;
  };
}

export interface ClaimBundleEntry extends FhirBundleEntry {
  resource: {
    resourceType: 'Claim';
    id: string;
    meta?: { profile: string[] };
    identifier?: Array<{ system?: string; value: string }>;
    status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';
    type: { coding: Coding[] };
    use: 'claim' | 'preauthorization' | 'predetermination';
    patient: Reference;
    billablePeriod?: Period;
    created: string;
    insurer: Reference;
    provider: Reference;
    priority: { coding: Coding[] };
    diagnosis?: Array<{
      sequence: number;
      diagnosisCodeableConcept?: { coding: Coding[] };
      type?: Array<{ coding: Coding[] }>;
    }>;
    procedure?: Array<{
      sequence: number;
      procedureCodeableConcept?: { coding: Coding[] };
    }>;
    insurance: Array<{
      sequence: number;
      focal: boolean;
      coverage: Reference;
    }>;
    item: Array<{
      sequence: number;
      careTeamSequence?: number[];
      productOrService: { coding: Coding[] };
      unitPrice?: Money;
      net?: Money;
    }>;
    total: Money;
  };
}

export interface ClaimResponseBundleEntry extends FhirBundleEntry {
  resource: {
    resourceType: 'ClaimResponse';
    id: string;
    meta?: { profile: string[] };
    status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';
    type: { coding: Coding[] };
    use: 'claim' | 'preauthorization' | 'predetermination';
    patient: Reference;
    created: string;
    insurer: Reference;
    requestor?: Reference;
    request?: Reference;
    outcome: 'queued' | 'complete' | 'error' | 'partial';
    disposition?: string;
    preAuthRef?: string;
    item?: Array<{
      itemSequence: number;
      adjudication: Array<{
        category: { coding: Coding[] };
        amount?: Money;
        reason?: { coding: Coding[] };
      }>;
    }>;
    total?: Array<{
      category: { coding: Coding[] };
      amount: Money;
    }>;
    insurance?: Array<{
      sequence: number;
      focal: boolean;
      coverage: Reference;
    }>;
  };
}

export interface TaskBundleEntry extends FhirBundleEntry {
  resource: {
    resourceType: 'Task';
    id: string;
    meta?: { profile: string[] };
    status: 'requested' | 'accepted' | 'in-progress' | 'completed' | 'failed' | 'rejected' | 'cancelled';
    intent: 'order' | 'proposal' | 'plan' | 'original-order' | 'instance-order' | 'option';
    code?: { coding: Coding[] };
    description?: string;
    authoredOn?: string;
    lastModified?: string;
    requester?: Reference;
    owner?: Reference;
    input?: Array<{
      type: { coding: Coding[] };
      valueString?: string;
      valueReference?: Reference;
    }>;
    output?: Array<{
      type: { coding: Coding[] };
      valueString?: string;
      valueReference?: Reference;
    }>;
  };
}

export interface InsurancePlanBundleEntry extends FhirBundleEntry {
  resource: {
    resourceType: 'InsurancePlan';
    id: string;
    meta?: { profile: string[] };
    identifier?: Array<{ system?: string; value: string }>;
    status: 'active' | 'draft' | 'retired' | 'entered-in-error';
    type?: Array<{ coding: Coding[] }>;
    name?: string;
    period?: Period;
    ownedBy?: Reference;
    administeredBy?: Reference;
    coverage?: Array<{
      type: { coding: Coding[] };
      network?: Reference[];
      benefit: Array<{
        type: { coding: Coding[] };
        requirement?: string;
      }>;
    }>;
    plan?: Array<{
      identifier?: Array<{ system?: string; value: string }>;
      type?: { coding: Coding[] };
      coverageArea?: Reference[];
      network?: Reference[];
      generalCost?: Array<{
        type?: { coding: Coding[] };
        value?: Money;
      }>;
      specificCost?: Array<{
        category?: { coding: Coding[] };
        benefit: Array<{
          type: { coding: Coding[] };
          cost: Array<{
            type?: { coding: Coding[] };
            value?: Money;
          }>;
        }>;
      }>;
    }>;
  };
}
