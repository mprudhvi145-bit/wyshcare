/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/specialties/pulmonology/pulmonology.service.ts
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
 * Business logic service for pulmonology
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
export class PulmonologyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly base: SpecialtyBaseService,
  ) {}

  getTemplates() {
    return [
      {
        id: 'pulmonology-comprehensive',
        name: 'Respiratory & Pulmonology Evaluation',
        description: 'Spirometry, lung sounds, dyspnea grading, and inhaler check',
        sections: [
          { id: 'chief-complaint', title: 'Chief Complaint', type: 'form' as const, fields: [
            { id: 'presenting', label: 'Presenting Complaints', type: 'textarea', required: true, placeholder: 'Cough, dyspnea, wheezing, chest tightness, hemoptysis...' },
            { id: 'mrcGrade', label: 'mMRC Dyspnea Grade', type: 'select', options: [
              { label: 'Grade 0: Dyspnea with strenuous exercise', value: '0' },
              { label: 'Grade 1: Hurrying on level/walking up hill', value: '1' },
              { label: 'Grade 2: Walks slower than peers due to breathlessness', value: '2' },
              { label: 'Grade 3: Stops for breath after 100m or few mins', value: '3' },
              { label: 'Grade 4: Too breathless to leave house / dress', value: '4' }
            ]},
            { id: 'smokingHistory', label: 'Smoking History (Pack-Years)', type: 'text', placeholder: 'e.g., 20 pack-years (ex-smoker)' }
          ]},
          { id: 'exam', title: 'Chest & Respiratory Exam', type: 'form', fields: [
            { id: 'chestInspection', label: 'Inspection / Chest Wall Shape', type: 'select', options: [
              { label: 'Normal', value: 'normal' }, { label: 'Barrel chest', value: 'barrel' },
              { label: 'Pectus excavatum', value: 'excavatum' }
            ]},
            { id: 'breathSounds', label: 'Breath Sounds', type: 'select', options: [
              { label: 'Vesicular (Normal)', value: 'vesicular' }, { label: 'Decreased bilaterally', value: 'decreased' },
              { label: 'Bronchial breath sounds', value: 'bronchial' }
            ]},
            { id: 'adventitious', label: 'Adventitious Sounds', type: 'multiselect', options: [
              { label: 'None', value: 'none' }, { label: 'Wheezing (diffuse)', value: 'wheeze_diffuse' },
              { label: 'Crepitations / Crackles (Fine)', value: 'crackles_fine' }, { label: 'Crepitations / Crackles (Coarse)', value: 'crackles_coarse' }
            ]}
          ]},
          { id: 'diagnostics', title: 'PFT & Imaging Reviews', type: 'form', fields: [
            { id: 'spirometrySummary', label: 'Spirometry Summary findings', type: 'textarea', placeholder: 'FEV1, FVC, ratio after bronchodilator...' },
            { id: 'cxrFindings', label: 'Chest X-Ray / CT Thorax', type: 'textarea', placeholder: 'Hyperinflation, consolidation, pleural effusion, fibrotic changes...' }
          ]},
          { id: 'diagnosis-plan', title: 'Diagnosis & Plan', type: 'form', fields: [
            { id: 'diagnosis', label: 'Pulmonary Diagnosis', type: 'textarea', required: true, placeholder: 'e.g., COPD GOLD Grade B, Mild Intermittent Asthma...' },
            { id: 'medications', label: 'Inhaler / Nebulizer Management', type: 'textarea', placeholder: 'e.g., Budesonide + Formoterol 200/6 DPI twice daily...' },
            { id: 'oxygenTherapy', label: 'Home Oxygen Therapy Details', type: 'text', placeholder: 'e.g., Not indicated / 2 L/min via nasal cannula...' },
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

    if (data.pftFev1 !== undefined && data.pftFvc !== undefined) {
      const isObstruction = data.pftRatio < 70;
      structuredFindings.push({
        category: 'pft_spirometry',
        findingKey: 'spirometry',
        findingValue: {
          fev1: data.pftFev1,
          fvc: data.pftFvc,
          ratio: data.pftRatio
        },
        severity: isObstruction ? 'moderate' : 'mild',
        status: 'active'
      });
    }

    const enrichedFindings = structuredFindings.map(f => ({
      ...f,
      specialtyCode: 'pulmonology',
      encounterId,
      patientId,
      providerId
    }));

    return this.base.saveEncounterWithFindings({
      specialtyCode: 'pulmonology',
      encounterId,
      patientId,
      providerId,
      templateId: 'pulmonology-comprehensive',
      formData: data,
      findings: enrichedFindings
    });
  }

  async getHistory(patientId: string) {
    return this.base.getPatientHistory(patientId, 'pulmonology');
  }
}
