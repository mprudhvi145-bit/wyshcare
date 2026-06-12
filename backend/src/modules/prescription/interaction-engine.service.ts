/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/prescription/interaction-engine.service.ts
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
 * Business logic service for prescription
 *
 * Responsibilities:
 * - Execute business logic for prescription operations
 * - Coordinate data access and external API calls
 *
 * Used By:
 - backend/src/modules/prescription/prescription.service.ts
 - backend/src/providers/storage/storage.module.ts
 - backend/src/modules/abdm/abdm.module.ts
 - backend/src/modules/interoperability/interoperability.module.ts
 - backend/src/modules/digital-twin/digital-twin.service.ts
 - backend/src/main.ts
 - backend/src/modules/health-graph/health-graph.service.ts
 - backend/src/modules/search/search.controller.ts
 *
 * Calls:
 - common
 *
 * Dependencies:
 - common
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Prescription
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

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma/prisma.service';

export interface InteractionResult {
  subjectDrug: string;
  objectDrug: string;
  severity: 'CONTRAINDICATED' | 'HIGH' | 'MODERATE' | 'MINOR' | 'NONE';
  description: string;
  mechanism?: string;
  recommendation?: string;
}

export interface DuplicateTherapyResult {
  drugClass: string;
  drugs: string[];
  severity: 'HIGH' | 'MODERATE' | 'LOW';
  recommendation: string;
}

const DUPLICATE_THERAPY_RULES: Array<{
  drugClass: string;
  therapeuticClass: string;
  severity: 'HIGH' | 'MODERATE' | 'LOW';
  recommendation: string;
}> = [
  { drugClass: 'ANTICOAGULANTS', therapeuticClass: 'Anticoagulant', severity: 'HIGH', recommendation: 'Dual anticoagulation significantly increases bleeding risk. Consider monotherapy unless specific indication (e.g., mechanical heart valve).' },
  { drugClass: 'ANTIPLATELETS', therapeuticClass: 'Antiplatelet', severity: 'HIGH', recommendation: 'Dual antiplatelet therapy (DAPT) increases bleeding risk. Only indicated for specific conditions (e.g., recent PCI, ACS).' },
  { drugClass: 'ACE_INHIBITORS', therapeuticClass: 'ACE Inhibitor', severity: 'MODERATE', recommendation: 'Dual ACE inhibitor therapy may cause hypotension, hyperkalemia, and renal impairment. Select a single agent.' },
  { drugClass: 'ARBS', therapeuticClass: 'ARB', severity: 'MODERATE', recommendation: 'Dual ARB therapy may cause hypotension and renal impairment. Select a single agent.' },
  { drugClass: 'NSAIDS', therapeuticClass: 'NSAID', severity: 'MODERATE', recommendation: 'Dual NSAID use increases risk of GI bleeding and renal injury. Use a single agent at the lowest effective dose.' },
  { drugClass: 'STATINS', therapeuticClass: 'Statin', severity: 'LOW', recommendation: 'Dual statin therapy is rarely indicated. Consider high-intensity monotherapy instead.' },
  { drugClass: 'BENZODIAZEPINES', therapeuticClass: 'Benzodiazepine', severity: 'MODERATE', recommendation: 'Dual benzodiazepine use increases sedation and fall risk. Use a single agent at the lowest effective dose.' },
  { drugClass: 'OPIOIDS', therapeuticClass: 'Opioid', severity: 'HIGH', recommendation: 'Dual opioid therapy increases risk of respiratory depression, sedation, and dependence. Consider monotherapy or alternative analgesics.' },
  { drugClass: 'SSRIS', therapeuticClass: 'SSRI', severity: 'MODERATE', recommendation: 'Dual SSRI therapy increases risk of serotonin syndrome. Select a single agent.' },
  { drugClass: 'BETA_BLOCKERS', therapeuticClass: 'Beta Blocker', severity: 'LOW', recommendation: 'Dual beta-blocker therapy may cause excessive bradycardia. Select a single agent.' },
  { drugClass: 'CALCIUM_CHANNEL_BLOCKERS', therapeuticClass: 'Calcium Channel Blocker', severity: 'MODERATE', recommendation: 'Dual CCB therapy may cause hypotension and bradycardia. Select a single agent.' },
  { drugClass: 'DIURETICS', therapeuticClass: 'Diuretic', severity: 'MODERATE', recommendation: 'Dual diuretic therapy increases risk of electrolyte imbalance and dehydration. Select a single agent.' },
  { drugClass: 'SULFONYLUREAS', therapeuticClass: 'Sulfonylurea', severity: 'HIGH', recommendation: 'Dual sulfonylurea therapy significantly increases hypoglycemia risk. Select a single agent.' },
];

@Injectable()
export class InteractionEngineService {
  private readonly logger = new Logger(InteractionEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  async checkInteractions(drugIds: string[]): Promise<InteractionResult[]> {
    if (drugIds.length < 2) return [];

    const interactions = await this.prisma.drugInteraction.findMany({
      where: {
        OR: drugIds.flatMap((id) => [
          { subjectDrugId: id, objectDrugId: { in: drugIds.filter((d) => d !== id) } },
          { objectDrugId: id, subjectDrugId: { in: drugIds.filter((d) => d !== id) } },
        ]),
      },
      include: {
        Drug_DrugInteraction_subjectDrugIdToDrug: { select: { id: true, genericName: true } },
        Drug_DrugInteraction_objectDrugIdToDrug: { select: { id: true, genericName: true } },
      },
    });

    return interactions.map((i) => ({
      subjectDrug: i.Drug_DrugInteraction_subjectDrugIdToDrug.genericName,
      objectDrug: i.Drug_DrugInteraction_objectDrugIdToDrug.genericName,
      severity: i.severity as InteractionResult['severity'],
      description: i.description,
      mechanism: i.mechanism ?? undefined,
      recommendation: i.recommendation ?? undefined,
    }));
  }

  async checkDuplicateTherapy(drugIds: string[]): Promise<DuplicateTherapyResult[]> {
    if (drugIds.length < 2) return [];

    const drugs = await this.prisma.drug.findMany({
      where: { id: { in: drugIds } },
      select: { id: true, genericName: true, drugClass: true, therapeuticClass: true },
    });

    const classMap = new Map<string, { drugs: string[]; therapeuticClass: string }>();
    for (const drug of drugs) {
      if (!drug.drugClass) continue;
      const entry = classMap.get(drug.drugClass) ?? { drugs: [], therapeuticClass: drug.therapeuticClass ?? '' };
      entry.drugs.push(drug.genericName);
      classMap.set(drug.drugClass, entry);
    }

    const results: DuplicateTherapyResult[] = [];

    for (const [drugClass, entry] of classMap) {
      if (entry.drugs.length < 2) continue;
      const rule = DUPLICATE_THERAPY_RULES.find((r) => r.drugClass === drugClass);
      results.push({
        drugClass: entry.therapeuticClass || drugClass,
        drugs: entry.drugs,
        severity: rule?.severity ?? 'LOW',
        recommendation: rule?.recommendation ?? `Duplicate ${entry.therapeuticClass || drugClass} therapy detected. Review necessity.`,
      });
    }

    return results;
  }

  async checkPatientDrugs(patientUserId: string, newDrugIds: string[]): Promise<{
    interactions: InteractionResult[];
    duplicateTherapy: DuplicateTherapyResult[];
    activeDrugs: Array<{ id: string; name: string }>;
  }> {
    const activeRxItems = await this.prisma.prescriptionItem.findMany({
      where: {
        Prescription: {
          patientUserId,
          status: 'ACTIVE',
        },
        drugId: { not: null },
      },
      include: {
        Drug: { select: { id: true, genericName: true, drugClass: true } },
      },
    });

    const activeDrugIds = activeRxItems
      .map((item) => item.Drug?.id)
      .filter((id): id is string => !!id);

    const allDrugIds = [...new Set([...activeDrugIds, ...newDrugIds])];

    const [interactions, duplicateTherapy] = await Promise.all([
      this.checkInteractions(allDrugIds),
      this.checkDuplicateTherapy(allDrugIds),
    ]);

    return {
      interactions,
      duplicateTherapy,
      activeDrugs: activeRxItems
        .filter((item) => item.Drug)
        .map((item) => ({ id: item.Drug!.id, name: item.Drug!.genericName })),
    };
  }
}
