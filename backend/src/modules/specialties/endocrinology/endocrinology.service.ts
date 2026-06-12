/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/specialties/endocrinology/endocrinology.service.ts
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
 * Business logic service for endocrinology
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
export class EndocrinologyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly base: SpecialtyBaseService,
  ) {}

  getTemplates() {
    return [
      {
        id: 'endocrinology-comprehensive',
        name: 'Endocrinology & Diabetes Evaluation',
        description: 'Glycemic assessment, hormone profiles, continuous glucose monitoring reviews',
        sections: [
          { id: 'chief-complaint', title: 'Chief Complaint', type: 'form' as const, fields: [
            { id: 'presenting', label: 'Presenting Endocrine Symptoms', type: 'textarea', required: true, placeholder: 'Polyuria, polydipsia, weight fluctuations, fatigue, heat/cold intolerance...' },
            { id: 'diabetesType', label: 'Diabetes Classification', type: 'select', options: [
              { label: 'Not diabetic', value: 'none' }, { label: 'Type 1 Diabetes Mellitus', value: 't1dm' },
              { label: 'Type 2 Diabetes Mellitus', value: 't2dm' }, { label: 'Gestational Diabetes', value: 'gdm' }
            ]}
          ]},
          { id: 'glycemic', title: 'Glycemic & Home Log Assessment', type: 'form', fields: [
            { id: 'hba1cVal', label: 'Most Recent HbA1c (%)', type: 'text', placeholder: 'e.g., 7.4%' },
            { id: 'logAverage', label: 'Home SMBG / Glucose averages (mg/dL)', type: 'text', placeholder: 'e.g., Fasting: 120, Postprandial: 170...' },
            { id: 'hypoEvents', label: 'Hypoglycemic episodes per week', type: 'select', options: [
              { label: 'None', value: '0' }, { label: '1–2 mild events', value: '1-2' },
              { label: 'Frequent or severe events', value: 'severe' }
            ]}
          ]},
          { id: 'exam', title: 'Physical & Foot Examination', type: 'form', fields: [
            { id: 'thyroidExam', label: 'Thyroid Palpation / Goiter', type: 'select', options: [
              { label: 'Normal / Non-palpable', value: 'normal' }, { label: 'Diffusely enlarged (goiter)', value: 'goiter' },
              { label: 'Nodular thyroid', value: 'nodular' }
            ]},
            { id: 'diabeticFoot', label: 'Diabetic Foot Screen (Sensory/Pulses)', type: 'select', options: [
              { label: 'Not indicated / Not performed', value: 'na' },
              { label: 'Normal (sensory intact, pulses +2)', value: 'normal' },
              { label: 'Impaired monofilament sensation', value: 'impaired' },
              { label: 'Active ulcer or neuropathic changes', value: 'ulcer' }
            ]}
          ]},
          { id: 'diagnosis-plan', title: 'Diagnosis & Plan', type: 'form', fields: [
            { id: 'diagnosis', label: 'Endocrine Diagnosis', type: 'textarea', required: true, placeholder: 'e.g., Type 2 Diabetes uncontrolled, Primary Hypothyroidism...' },
            { id: 'insulinRegimen', label: 'Insulin / Oral Medication Plan', type: 'textarea', placeholder: 'Insulin dosing (basal/bolus), Metformin, GLP-1 agonists...' },
            { id: 'cgmReview', label: 'CGM / Log recommendations', type: 'textarea' },
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

    if (data.cgmPattern) {
      const isAbnormal = data.cgmPattern !== 'optimal';
      structuredFindings.push({
        category: 'cgm_pattern',
        findingKey: 'pattern',
        findingValue: { pattern: data.cgmPattern },
        severity: isAbnormal ? 'moderate' : 'mild',
        status: 'active'
      });
    }

    const enrichedFindings = structuredFindings.map(f => ({
      ...f,
      specialtyCode: 'endocrinology',
      encounterId,
      patientId,
      providerId
    }));

    return this.base.saveEncounterWithFindings({
      specialtyCode: 'endocrinology',
      encounterId,
      patientId,
      providerId,
      templateId: 'endocrinology-comprehensive',
      formData: data,
      findings: enrichedFindings
    });
  }

  async getHistory(patientId: string) {
    return this.base.getPatientHistory(patientId, 'endocrinology');
  }
}
