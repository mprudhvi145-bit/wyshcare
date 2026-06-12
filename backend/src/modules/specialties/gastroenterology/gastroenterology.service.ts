/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/specialties/gastroenterology/gastroenterology.service.ts
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
 * Business logic service for gastroenterology
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

@Injectable()
export class GastroenterologyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly base: SpecialtyBaseService,
  ) {}

  getTemplates() {
    return [
      {
        id: 'gastroenterology-comprehensive',
        name: 'Gastrointestinal Evaluation',
        description: 'Abdominal palpation, bowel habits, endoscopy/colonoscopy review',
        sections: [
          { id: 'chief-complaint', title: 'Chief Complaint', type: 'form' as const, fields: [
            { id: 'presenting', label: 'Presenting GI Symptoms', type: 'textarea', required: true, placeholder: 'Abdominal pain, dyspepsia, heartburn, nausea, vomiting, bowel change, bleeding...' },
            { id: 'bowelHabits', label: 'Bowel Habit Frequency', type: 'select', options: [
              { label: 'Normal (1-3x/day or every other day)', value: 'normal' },
              { label: 'Constipation (less than 3x/week)', value: 'constipation' },
              { label: 'Diarrhea / Loose stools', value: 'diarrhea' }
            ]},
            { id: 'alarmingSymptoms', label: 'Alarm Symptoms Checked', type: 'multiselect', options: [
              { label: 'None', value: 'none' }, { label: 'Unintentional Weight Loss', value: 'weight_loss' },
              { label: 'Dysphagia', value: 'dysphagia' }, { label: 'Hematemesis', value: 'hematemesis' },
              { label: 'Melena / Rectal Bleeding', value: 'bleeding' }
            ]}
          ]},
          { id: 'exam', title: 'Physical Examination', type: 'form', fields: [
            { id: 'inspection', label: 'Abdominal Inspection', type: 'select', options: [
              { label: 'Flat, symmetrical', value: 'flat' }, { label: 'Distended (generalized)', value: 'distended' },
              { label: 'Surgical scars present', value: 'scars' }
            ]},
            { id: 'bowelSounds', label: 'Bowel Sounds', type: 'select', options: [
              { label: 'Normal active', value: 'normal' }, { label: 'Hyperactive (borborygmi)', value: 'hyperactive' },
              { label: 'Hypoactive', value: 'hypoactive' }, { label: 'Absent', value: 'absent' }
            ]},
            { id: 'palpationNotes', label: 'Palpation Notes (organomegaly, masses...)', type: 'textarea' }
          ]},
          { id: 'investigations', title: 'Investigations & Scopes', type: 'form', fields: [
            { id: 'egdFindings', label: 'Upper Endoscopy (EGD) Findings (if done)', type: 'textarea', placeholder: 'Esophagitis, gastroduodenal ulcers, H. pylori status...' },
            { id: 'colonoscopyFindings', label: 'Colonoscopy Findings (if done)', type: 'textarea', placeholder: 'Polyps, diverticulosis, colitis status...' },
            { id: 'stoolTests', label: 'Stool Analysis (FOBT, Calprotectin...)', type: 'text' }
          ]},
          { id: 'diagnosis-plan', title: 'Diagnosis & Plan', type: 'form', fields: [
            { id: 'diagnosis', label: 'GI Diagnosis', type: 'textarea', required: true, placeholder: 'e.g., GERD, IBS-D, Peptic Ulcer Disease, Ulcerative Colitis...' },
            { id: 'management', label: 'Management Plan (Meds & Diet)', type: 'textarea', placeholder: 'PPI dosing, low FODMAP diet counseling, follow-up scopes...' },
            { id: 'followUp', label: 'Follow-up', type: 'text' }
          ]}
        ],
        isDefault: true
      }
    ];
  }

  async saveEncounter(encounterId: string, patientId: string, providerId: string, data: Record<string, any>) {
    const structuredFindings: Array<{
      category: string;
      findingKey: string;
      findingValue: Record<string, any>;
      severity?: string;
      status?: string;
    }> = [];

    const abdominalFindings = data.abdominalFindings as Record<string, string> | undefined;
    if (abdominalFindings) {
      for (const [quad, value] of Object.entries(abdominalFindings)) {
        if (value && value !== 'normal') {
          const isSevere = ['rebound', 'guarding'].includes(value);
          structuredFindings.push({
            category: 'abdominal_palpation',
            findingKey: quad,
            findingValue: { finding: value },
            severity: isSevere ? 'severe' : 'moderate',
            status: 'active'
          });
        }
      }
    }

    if (data.bristolStoolType !== undefined && data.bristolStoolType !== null) {
      const isAbnormal = data.bristolStoolType !== 3 && data.bristolStoolType !== 4;
      structuredFindings.push({
        category: 'bristol_stool',
        findingKey: 'bristol_stool',
        findingValue: { type: data.bristolStoolType },
        severity: isAbnormal ? 'moderate' : 'mild',
        status: 'active'
      });
    }

    const enrichedFindings = structuredFindings.map(f => ({
      ...f,
      specialtyCode: 'gastroenterology',
      encounterId,
      patientId,
      providerId
    }));

    return this.base.saveEncounterWithFindings({
      specialtyCode: 'gastroenterology',
      encounterId,
      patientId,
      providerId,
      templateId: 'gastroenterology-comprehensive',
      formData: data,
      findings: enrichedFindings
    });
  }

  async getHistory(patientId: string) {
    return this.base.getPatientHistory(patientId, 'gastroenterology');
  }
}
