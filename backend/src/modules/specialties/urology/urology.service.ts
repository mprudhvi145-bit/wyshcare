/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/specialties/urology/urology.service.ts
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
 * Business logic service for urology
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
export class UrologyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly base: SpecialtyBaseService,
  ) {}

  getTemplates() {
    return [
      {
        id: 'urology-comprehensive',
        name: 'Urological Examination',
        description: 'Voiding symptoms, bladder scanner metrics, and prostate evaluation',
        sections: [
          { id: 'chief-complaint', title: 'Chief Complaint', type: 'form' as const, fields: [
            { id: 'presenting', label: 'Presenting Symptoms', type: 'textarea', required: true, placeholder: 'Dysuria, hematuria, frequency, urgency, flank pain, incontinence...' },
            { id: 'duration', label: 'Symptom Duration', type: 'text' }
          ]},
          { id: 'exam', title: 'Physical & Digital Rectal Exam (DRE)', type: 'form', fields: [
            { id: 'flankTenderness', label: 'CVA Flank Tenderness', type: 'select', options: [
              { label: 'None', value: 'none' }, { label: 'Left-sided CVA tenderness', value: 'left' },
              { label: 'Right-sided CVA tenderness', value: 'right' }, { label: 'Bilateral CVA tenderness', value: 'bilateral' }
            ]},
            { id: 'suprapubic', label: 'Suprapubic Palpation', type: 'select', options: [
              { label: 'Nontender, no distension', value: 'normal' }, { label: 'Tender to palpation', value: 'tender' },
              { label: 'Distended (palpable bladder)', value: 'distended' }
            ]},
            { id: 'dreFindings', label: 'DRE Findings (Prostate)', type: 'textarea', placeholder: 'Size (g), symmetry, nodules, consistency, tenderness...' }
          ]},
          { id: 'labs', title: 'Urology Diagnostics & Labs', type: 'form', fields: [
            { id: 'urinalysis', label: 'Urinalysis (Leukocytes, Nitrites, RBCs)', type: 'textarea', placeholder: 'Leukocyte esterase, Nitrite positive/negative, RBCs/HPF...' },
            { id: 'psa', label: 'PSA Level (ng/mL) (if indicated)', type: 'text', placeholder: 'e.g., 1.4 ng/mL' },
            { id: 'pvrUltrasound', label: 'Formal PVR ultrasound summary', type: 'text', placeholder: 'e.g., PVR 60 ml, normal bladder wall thickness' }
          ]},
          { id: 'diagnosis-plan', title: 'Diagnosis & Plan', type: 'form', fields: [
            { id: 'diagnosis', label: 'Urological Diagnosis', type: 'textarea', required: true, placeholder: 'e.g., Benign Prostatic Hyperplasia (BPH) (N40.1), UTI (N39.0)...' },
            { id: 'management', label: 'Treatment & Intervention Plan', type: 'textarea', placeholder: 'Medical management (Alpha blockers, 5-ARIs), antibiotics, scheduling urodynamics...' },
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

    if (data.ipssTotal !== undefined) {
      const severity = data.ipssTotal >= 20 ? 'severe' : data.ipssTotal >= 8 ? 'moderate' : 'mild';
      structuredFindings.push({
        category: 'ipss_score',
        findingKey: 'ipss',
        findingValue: { scores: data.ipssScores, total: data.ipssTotal },
        severity,
        status: 'active'
      });
    }

    if (data.postVoidResidualMl !== undefined) {
      const pvrSev = data.postVoidResidualMl >= 150 ? 'severe' : data.postVoidResidualMl >= 50 ? 'moderate' : 'mild';
      structuredFindings.push({
        category: 'pvr_volume',
        findingKey: 'pvr',
        findingValue: { pvrMl: data.postVoidResidualMl },
        severity: pvrSev,
        status: 'active'
      });
    }

    const enrichedFindings = structuredFindings.map(f => ({
      ...f,
      specialtyCode: 'urology',
      encounterId,
      patientId,
      providerId
    }));

    return this.base.saveEncounterWithFindings({
      specialtyCode: 'urology',
      encounterId,
      patientId,
      providerId,
      templateId: 'urology-comprehensive',
      formData: data,
      findings: enrichedFindings
    });
  }

  async getHistory(patientId: string) {
    return this.base.getPatientHistory(patientId, 'urology');
  }
}
