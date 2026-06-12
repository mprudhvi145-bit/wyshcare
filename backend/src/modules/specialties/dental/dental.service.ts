/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/specialties/dental/dental.service.ts
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
 * Business logic service for dental
 *
 * Responsibilities:
 * - Execute business logic for wyshid operations
 * - Coordinate data access and external API calls
 *
 * Used By:
 - backend/src/modules/prescription/prescription.service.ts
 - backend/src/providers/storage/storage.module.ts
 - backend/src/modules/abdm/abdm.module.ts
 - backend/src/modules/prescription/interaction-engine.service.ts
 - backend/src/modules/interoperability/interoperability.module.ts
 - backend/src/modules/digital-twin/digital-twin.service.ts
 - backend/src/main.ts
 - backend/src/modules/health-graph/health-graph.service.ts
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

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { SpecialtyBaseService } from '../shared/specialty-base.service';

const TOOTH_CHART = [
  { number: 18, name: 'Upper Right 3rd Molar', quadrant: 'UR', type: 'molar' },
  { number: 17, name: 'Upper Right 2nd Molar', quadrant: 'UR', type: 'molar' },
  { number: 16, name: 'Upper Right 1st Molar', quadrant: 'UR', type: 'molar' },
  { number: 15, name: 'Upper Right 2nd Premolar', quadrant: 'UR', type: 'premolar' },
  { number: 14, name: 'Upper Right 1st Premolar', quadrant: 'UR', type: 'premolar' },
  { number: 13, name: 'Upper Right Canine', quadrant: 'UR', type: 'canine' },
  { number: 12, name: 'Upper Right Lateral Incisor', quadrant: 'UR', type: 'incisor' },
  { number: 11, name: 'Upper Right Central Incisor', quadrant: 'UR', type: 'incisor' },
  { number: 21, name: 'Upper Left Central Incisor', quadrant: 'UL', type: 'incisor' },
  { number: 22, name: 'Upper Left Lateral Incisor', quadrant: 'UL', type: 'incisor' },
  { number: 23, name: 'Upper Left Canine', quadrant: 'UL', type: 'canine' },
  { number: 24, name: 'Upper Left 1st Premolar', quadrant: 'UL', type: 'premolar' },
  { number: 25, name: 'Upper Left 2nd Premolar', quadrant: 'UL', type: 'premolar' },
  { number: 26, name: 'Upper Left 1st Molar', quadrant: 'UL', type: 'molar' },
  { number: 27, name: 'Upper Left 2nd Molar', quadrant: 'UL', type: 'molar' },
  { number: 28, name: 'Upper Left 3rd Molar', quadrant: 'UL', type: 'molar' },
  { number: 48, name: 'Lower Right 3rd Molar', quadrant: 'LR', type: 'molar' },
  { number: 47, name: 'Lower Right 2nd Molar', quadrant: 'LR', type: 'molar' },
  { number: 46, name: 'Lower Right 1st Molar', quadrant: 'LR', type: 'molar' },
  { number: 45, name: 'Lower Right 2nd Premolar', quadrant: 'LR', type: 'premolar' },
  { number: 44, name: 'Lower Right 1st Premolar', quadrant: 'LR', type: 'premolar' },
  { number: 43, name: 'Lower Right Canine', quadrant: 'LR', type: 'canine' },
  { number: 42, name: 'Lower Right Lateral Incisor', quadrant: 'LR', type: 'incisor' },
  { number: 41, name: 'Lower Right Central Incisor', quadrant: 'LR', type: 'incisor' },
  { number: 31, name: 'Lower Left Central Incisor', quadrant: 'LL', type: 'incisor' },
  { number: 32, name: 'Lower Left Lateral Incisor', quadrant: 'LL', type: 'incisor' },
  { number: 33, name: 'Lower Left Canine', quadrant: 'LL', type: 'canine' },
  { number: 34, name: 'Lower Left 1st Premolar', quadrant: 'LL', type: 'premolar' },
  { number: 35, name: 'Lower Left 2nd Premolar', quadrant: 'LL', type: 'premolar' },
  { number: 36, name: 'Lower Left 1st Molar', quadrant: 'LL', type: 'molar' },
  { number: 37, name: 'Lower Left 2nd Molar', quadrant: 'LL', type: 'molar' },
  { number: 38, name: 'Lower Left 3rd Molar', quadrant: 'LL', type: 'molar' },
];

const DENTAL_PROCEDURE_CODES = [
  { code: 'D0120', name: 'Periodic Oral Evaluation', category: 'exam' },
  { code: 'D0150', name: 'Comprehensive Oral Evaluation', category: 'exam' },
  { code: 'D0210', name: 'Intraoral - Complete Series', category: 'imaging' },
  { code: 'D0220', name: 'Intraoral - Periapical First Film', category: 'imaging' },
  { code: 'D0274', name: 'Bitewings - Four Films', category: 'imaging' },
  { code: 'D1110', name: 'Prophylaxis - Adult', category: 'preventive' },
  { code: 'D1206', name: 'Topical Fluoride', category: 'preventive' },
  { code: 'D1351', name: 'Sealant - Per Tooth', category: 'preventive' },
  { code: 'D2140', name: 'Amalgam - One Surface, Primary', category: 'restorative' },
  { code: 'D2150', name: 'Amalgam - Two Surfaces, Primary', category: 'restorative' },
  { code: 'D2160', name: 'Amalgam - Three Surfaces, Primary', category: 'restorative' },
  { code: 'D2330', name: 'Resin - One Surface, Anterior', category: 'restorative' },
  { code: 'D2391', name: 'Resin - One Surface, Posterior', category: 'restorative' },
  { code: 'D2740', name: 'Crown - Porcelain/Ceramic', category: 'prosthodontics' },
  { code: 'D2750', name: 'Crown - Porcelain Fused to Metal', category: 'prosthodontics' },
  { code: 'D2950', name: 'Core Buildup', category: 'prosthodontics' },
  { code: 'D3220', name: 'Therapeutic Pulpotomy', category: 'endodontics' },
  { code: 'D3310', name: 'Root Canal - Anterior', category: 'endodontics' },
  { code: 'D3320', name: 'Root Canal - Premolar', category: 'endodontics' },
  { code: 'D3330', name: 'Root Canal - Molar', category: 'endodontics' },
  { code: 'D4341', name: 'Periodontal Scaling & Root Planing - 4+ Teeth', category: 'periodontics' },
  { code: 'D4355', name: 'Full Mouth Debridement', category: 'periodontics' },
  { code: 'D5110', name: 'Complete Denture - Maxillary', category: 'prosthodontics' },
  { code: 'D5120', name: 'Complete Denture - Mandibular', category: 'prosthodontics' },
  { code: 'D5211', name: 'Partial Denture - Maxillary', category: 'prosthodontics' },
  { code: 'D5212', name: 'Partial Denture - Mandibular', category: 'prosthodontics' },
  { code: 'D6010', name: 'Surgical Implant', category: 'implant' },
  { code: 'D6060', name: 'Implant Abutment', category: 'implant' },
  { code: 'D7140', name: 'Extraction - Erupted Tooth', category: 'oral_surgery' },
  { code: 'D7210', name: 'Extraction - Surgical', category: 'oral_surgery' },
  { code: 'D7240', name: 'Extraction - Impacted', category: 'oral_surgery' },
  { code: 'D8020', name: 'Ortho - Comprehensive', category: 'orthodontics' },
];

@Injectable()
export class DentalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly base: SpecialtyBaseService,
  ) {}

  getToothChart() { return TOOTH_CHART; }

  getProcedureCodes(category?: string) {
    if (!category) return DENTAL_PROCEDURE_CODES;
    return DENTAL_PROCEDURE_CODES.filter(p => p.category === category);
  }

  getTemplates() {
    return [
      {
        id: 'dental-exam',
        name: 'Comprehensive Dental Exam',
        description: 'Full oral evaluation with tooth charting',
        sections: [
          { id: 'chief-complaint', title: 'Chief Complaint', type: 'form' as const, fields: [
            { id: 'primaryComplaint', label: 'Primary Complaint', type: 'textarea', required: true },
            { id: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g., 2 weeks' },
            { id: 'painLevel', label: 'Pain Level (1-10)', type: 'number' },
            { id: 'triggers', label: 'Triggers', type: 'text', placeholder: 'Hot/Cold/Sweet' },
          ]},
          { id: 'medical-history', title: 'Medical History', type: 'form', fields: [
            { id: 'medications', label: 'Current Medications', type: 'textarea' },
            { id: 'allergies', label: 'Allergies', type: 'textarea' },
            { id: 'conditions', label: 'Relevant Medical Conditions', type: 'textarea' },
            { id: 'pregnancy', label: 'Pregnant/Nursing', type: 'boolean' },
          ]},
          { id: 'intraoral-exam', title: 'Intraoral Examination', type: 'form', fields: [
            { id: 'softTissue', label: 'Soft Tissue Findings', type: 'textarea' },
            { id: 'periodontal', label: 'Periodontal Status', type: 'textarea' },
            { id: 'occlusion', label: 'Occlusion', type: 'textarea' },
            { id: 'oralHygiene', label: 'Oral Hygiene Assessment', type: 'select', options: [
              { label: 'Good', value: 'good' }, { label: 'Fair', value: 'fair' }, { label: 'Poor', value: 'poor' },
            ]},
          ]},
          { id: 'tooth-chart', title: 'Tooth Chart', type: 'diagram', fields: [
            { id: 'findings', label: 'Tooth Findings', type: 'textarea' },
          ]},
          { id: 'diagnosis', title: 'Diagnosis', type: 'form', fields: [
            { id: 'diagnosis', label: 'Diagnosis', type: 'textarea', required: true },
            { id: 'icdCode', label: 'ICD-10 Code', type: 'text' },
          ]},
          { id: 'treatment-plan', title: 'Treatment Plan', type: 'form', fields: [
            { id: 'procedures', label: 'Recommended Procedures', type: 'textarea' },
            { id: 'priority', label: 'Priority', type: 'select', options: [
              { label: 'Urgent', value: 'urgent' }, { label: 'Elective', value: 'elective' },
            ]},
            { id: 'followUp', label: 'Follow-up', type: 'text', placeholder: 'e.g., 6 months' },
          ]},
        ],
        isDefault: true,
      },
      {
        id: 'periodontal-exam',
        name: 'Periodontal Examination',
        description: 'Periodontal charting with pocket depths',
        sections: [
          { id: 'pocket-depths', title: 'Periodontal Chart', type: 'chart', fields: [
            { id: 'probingDepths', label: 'Probing Depths (mm)', type: 'textarea' },
            { id: 'bleeding', label: 'Bleeding on Probing', type: 'boolean' },
            { id: 'recession', label: 'Gingival Recession', type: 'textarea' },
            { id: 'mobility', label: 'Tooth Mobility', type: 'textarea' },
            { id: 'furcation', label: 'Furcation Involvement', type: 'textarea' },
          ]},
          { id: 'diagnosis', title: 'Periodontal Diagnosis', type: 'form', fields: [
            { id: 'stage', label: 'Stage', type: 'select', options: [
              { label: 'Stage I', value: 'I' }, { label: 'Stage II', value: 'II' },
              { label: 'Stage III', value: 'III' }, { label: 'Stage IV', value: 'IV' },
            ]},
            { id: 'grade', label: 'Grade', type: 'select', options: [
              { label: 'Grade A: Slow', value: 'A' }, { label: 'Grade B: Moderate', value: 'B' },
              { label: 'Grade C: Rapid', value: 'C' },
            ]},
          ]},
        ],
      },
    ];
  }

  async saveToothFindings(encounterId: string, patientId: string, providerId: string, findings: Record<string, unknown>) {
    const structuredFindings: Array<{
      category: string; findingKey: string; findingValue: Record<string, unknown>;
      severity?: string; status?: string;
    }> = [];

    const toothStatuses = findings['toothStatuses'] as Record<string, { condition: string; notes?: string; procedure?: string }> | undefined;
    if (toothStatuses) {
      for (const [toothNum, status] of Object.entries(toothStatuses)) {
        const severity = status.condition === 'caries' || status.condition === 'impacted' ? 'moderate'
          : status.condition === 'missing' || status.condition === 'healthy' ? 'mild' : 'moderate';
        structuredFindings.push({
          category: 'tooth_condition',
          findingKey: toothNum,
          findingValue: { condition: status.condition, notes: status.notes ?? '', procedure: status.procedure ?? '' },
          severity,
          status: status.condition === 'healthy' ? 'resolved' : 'active',
        });
      }
    }

    const treatmentPlan = findings['treatmentPlan'] as Array<Record<string, unknown>> | undefined;
    if (treatmentPlan) {
      treatmentPlan.forEach((item, i) => {
        structuredFindings.push({
          category: 'treatment_plan',
          findingKey: `item_${i}`,
          findingValue: item,
          severity: (item['priority'] as string) === 'urgent' ? 'severe' : 'mild',
          status: item['status'] as string ?? 'planned',
        });
      });
    }

    const enrichedFindings = structuredFindings.map(f => ({
      ...f, specialtyCode: 'dental', encounterId, patientId, providerId,
    }));

    return this.base.saveEncounterWithFindings({
      specialtyCode: 'dental',
      encounterId,
      patientId,
      providerId,
      templateId: 'dental-exam',
      formData: findings,
      findings: enrichedFindings,
    });
  }

  async getDentalHistory(patientId: string) {
    return this.base.getPatientHistory(patientId, 'dental');
  }
}
