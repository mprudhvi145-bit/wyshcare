/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/specialties/psychiatry/psychiatry.service.ts
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
 * Business logic service for psychiatry
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
export class PsychiatryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly base: SpecialtyBaseService,
  ) {}

  getTemplates() {
    return [
      {
        id: 'psychiatry-comprehensive',
        name: 'Psychiatric Evaluation',
        description: 'Mental status examination, risk assessment, and therapeutic charting',
        sections: [
          { id: 'history', title: 'History of Present Illness', type: 'form' as const, fields: [
            { id: 'presenting', label: 'Presenting Psychiatric Symptoms', type: 'textarea', required: true, placeholder: 'Mood changes, anxiety, hallucinations, sleep disturbance, trauma...' },
            { id: 'stressors', label: 'Psychosocial Stressors', type: 'textarea', placeholder: 'Family, work, financial, bereavement...' },
            { id: 'pastPsychHistory', label: 'Past Psychiatric History', type: 'textarea', placeholder: 'Prior diagnoses, hospitalizations, treatments...' }
          ]},
          { id: 'risk-assessment', title: 'Risk Assessment', type: 'form', fields: [
            { id: 'suicidal', label: 'Suicidal Ideation', type: 'select', options: [
              { label: 'Denied / Absent', value: 'denied' }, { label: 'Passive Ideation (no plan)', value: 'passive' },
              { label: 'Active Ideation (has intent/plan)', value: 'active' }
            ]},
            { id: 'homicidal', label: 'Homicidal Ideation', type: 'select', options: [
              { label: 'Denied / Absent', value: 'denied' }, { label: 'Active Ideation / Threatening', value: 'active' }
            ]},
            { id: 'selfHarm', label: 'Self-Harm Behavior', type: 'select', options: [
              { label: 'No history', value: 'none' }, { label: 'Active/Recent self-injury', value: 'active' },
              { label: 'Past history only', value: 'past' }
            ]}
          ]},
          { id: 'mse', title: 'Mental State Examination (Detailed)', type: 'form', fields: [
            { id: 'thoughtContent', label: 'Thought Content', type: 'textarea', placeholder: 'Delusions, obsessions, phobias, suicidal thoughts...' },
            { id: 'perception', label: 'Perceptions', type: 'textarea', placeholder: 'Auditory/visual hallucinations, illusions, depersonalization...' },
            { id: 'insightJudgment', label: 'Insight & Judgment', type: 'select', options: [
              { label: 'Good/Intact', value: 'good' }, { label: 'Fair/Partial', value: 'fair' }, { label: 'Poor/Impaired', value: 'poor' }
            ]}
          ]},
          { id: 'diagnosis-plan', title: 'Diagnosis & Plan', type: 'form', fields: [
            { id: 'diagnosis', label: 'DSM-5 / ICD-10 Diagnoses', type: 'textarea', required: true, placeholder: 'e.g., Major Depressive Disorder (F32.9), GAD (F41.1)...' },
            { id: 'treatment', label: 'Pharmacotherapy & Management', type: 'textarea', placeholder: 'Medications, dosages, therapy type, side effects discussed...' },
            { id: 'safetyPlan', label: 'Safety Plan Details', type: 'textarea', placeholder: 'Emergency contacts, crisis resources shared...' }
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

    if (data.phq9Total !== undefined) {
      const phqSev = data.phq9Total >= 15 ? 'severe' : data.phq9Total >= 10 ? 'moderate' : 'mild';
      structuredFindings.push({
        category: 'phq9_screener',
        findingKey: 'phq9',
        findingValue: { scores: data.phq9Scores, total: data.phq9Total },
        severity: phqSev,
        status: 'active'
      });
    }

    if (data.gad7Score !== undefined) {
      const gadSev = data.gad7Score >= 15 ? 'severe' : data.gad7Score >= 10 ? 'moderate' : 'mild';
      structuredFindings.push({
        category: 'gad7_screener',
        findingKey: 'gad7',
        findingValue: { score: data.gad7Score },
        severity: gadSev,
        status: 'active'
      });
    }

    if (data.mseSelections) {
      structuredFindings.push({
        category: 'mental_status_exam',
        findingKey: 'mse',
        findingValue: data.mseSelections,
        severity: 'mild',
        status: 'active'
      });
    }

    const enrichedFindings = structuredFindings.map(f => ({
      ...f,
      specialtyCode: 'psychiatry',
      encounterId,
      patientId,
      providerId
    }));

    return this.base.saveEncounterWithFindings({
      specialtyCode: 'psychiatry',
      encounterId,
      patientId,
      providerId,
      templateId: 'psychiatry-comprehensive',
      formData: data,
      findings: enrichedFindings
    });
  }

  async getHistory(patientId: string) {
    return this.base.getPatientHistory(patientId, 'psychiatry');
  }
}
