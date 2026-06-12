/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/specialties/pediatrics/pediatrics.service.ts
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
 * Business logic service for pediatrics
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
export class PediatricsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly base: SpecialtyBaseService,
  ) {}

  getTemplates() {
    return [
      {
        id: 'pediatrics-exam',
        name: 'Comprehensive Pediatrics Exam',
        description: 'Developmental milestones, growth parameters, and vaccine tracker',
        sections: [
          { id: 'chief-complaint', title: 'Chief Complaint', type: 'form' as const, fields: [
            { id: 'presenting', label: 'Presenting Pediatrics Concerns', type: 'textarea', required: true, placeholder: 'Fever, cough, vomiting, rash, routine checkup...' },
            { id: 'duration', label: 'Duration', type: 'text' }
          ]},
          { id: 'growth', title: 'Growth Parameters', type: 'form', fields: [
            { id: 'weightKg', label: 'Weight (kg)', type: 'text' },
            { id: 'heightCm', label: 'Height/Length (cm)', type: 'text' },
            { id: 'headCircumferenceCm', label: 'Head Circumference (cm)', type: 'text' },
            { id: 'percentiles', label: 'Growth Percentiles (WHO)', type: 'text', placeholder: 'e.g., Weight 50th, Height 75th percentile' }
          ]},
          { id: 'milestones', title: 'Developmental Milestones', type: 'form', fields: [
            { id: 'motorMilestones', label: 'Motor Milestones', type: 'select', options: [
              { label: 'Appropriate for age', value: 'appropriate' },
              { label: 'Gross motor delay', value: 'gross_delay' },
              { label: 'Fine motor delay', value: 'fine_delay' }
            ]},
            { id: 'cognitiveLanguage', label: 'Cognitive & Language Milestones', type: 'select', options: [
              { label: 'Appropriate for age', value: 'appropriate' },
              { label: 'Language delay', value: 'language_delay' },
              { label: 'Social/Emotional delay', value: 'social_delay' }
            ]},
            { id: 'developmentalComments', label: 'Developmental Observations', type: 'textarea' }
          ]},
          { id: 'diagnosis-plan', title: 'Diagnosis & Plan', type: 'form', fields: [
            { id: 'diagnosis', label: 'Pediatric Diagnosis', type: 'textarea', required: true },
            { id: 'feedingNutrition', label: 'Feeding & Nutritional Advice', type: 'textarea', placeholder: 'Breastfeeding, formula details, introducing solids...' },
            { id: 'management', label: 'Treatment Plan / Prescriptions', type: 'textarea' },
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

    const checkedVaccines = data.checkedVaccines as string[] | undefined;
    if (checkedVaccines && Array.isArray(checkedVaccines)) {
      checkedVaccines.forEach(vaccineId => {
        structuredFindings.push({
          category: 'vaccination',
          findingKey: vaccineId,
          findingValue: { completed: true },
          severity: 'mild',
          status: 'completed'
        });
      });
    }

    const enrichedFindings = structuredFindings.map(f => ({
      ...f,
      specialtyCode: 'pediatrics',
      encounterId,
      patientId,
      providerId
    }));

    return this.base.saveEncounterWithFindings({
      specialtyCode: 'pediatrics',
      encounterId,
      patientId,
      providerId,
      templateId: 'pediatrics-exam',
      formData: data,
      findings: enrichedFindings
    });
  }

  async getHistory(patientId: string) {
    return this.base.getPatientHistory(patientId, 'pediatrics');
  }
}
