/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/specialties/neurology/neurology.service.ts
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
 * Business logic service for neurology
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
export class NeurologyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly base: SpecialtyBaseService,
  ) {}

  getTemplates() {
    return [
      {
        id: 'neurology-comprehensive',
        name: 'Neurological Evaluation',
        description: 'GCS assessment, cranial nerves check, motor/sensory/reflex exams',
        sections: [
          { id: 'chief-complaint', title: 'Chief Complaint', type: 'form' as const, fields: [
            { id: 'presenting', label: 'Presenting Complaints', type: 'textarea', required: true, placeholder: 'Weakness, numbness, seizure, headache, tremor, cognitive decline...' },
            { id: 'onset', label: 'Onset Profile', type: 'select', options: [
              { label: 'Sudden (Strokelike)', value: 'sudden' }, { label: 'Subacute/Paroxysmal', value: 'subacute' },
              { label: 'Gradual Progression', value: 'gradual' }
            ]}
          ]},
          { id: 'mental-status', title: 'Mental Status', type: 'form', fields: [
            { id: 'orientation', label: 'Orientation (Time, Place, Person)', type: 'select', options: [
              { label: 'Fully Oriented (3/3)', value: 'oriented' }, { label: 'Disoriented to Time', value: 'disoriented_time' },
              { label: 'Disoriented to Place', value: 'disoriented_place' }, { label: 'Completely Disoriented', value: 'disoriented_all' }
            ]},
            { id: 'speech', label: 'Speech & Language', type: 'select', options: [
              { label: 'Normal', value: 'normal' }, { label: 'Aphasia (Expressive)', value: 'aphasia_expressive' },
              { label: 'Aphasia (Receptive)', value: 'aphasia_receptive' }, { label: 'Dysarthria', value: 'dysarthria' }
            ]},
            { id: 'cognitiveNotes', label: 'Cognitive exam comments', type: 'textarea' }
          ]},
          { id: 'motor-sensory', title: 'Motor, Sensory & Reflex Exam', type: 'form', fields: [
            { id: 'motorStrength', label: 'Motor Strength (0-5 scale)', type: 'textarea', placeholder: 'RUE, LUE, RLE, LLE muscle groups...' },
            { id: 'sensoryExam', label: 'Sensory Modalities', type: 'textarea', placeholder: 'Pinprick, light touch, vibration, proprioception...' },
            { id: 'reflexes', label: 'Deep Tendon Reflexes (DTR)', type: 'textarea', placeholder: 'Biceps, Brachioradialis, Triceps, Patellar, Achilles (0-4+)...' },
            { id: 'babinski', label: 'Babinski Sign', type: 'select', options: [
              { label: 'Flexor (Normal/Negative)', value: 'negative' }, { label: 'Extensor (Positive/Abnormal) - Left', value: 'positive_left' },
              { label: 'Extensor (Positive/Abnormal) - Right', value: 'positive_right' }, { label: 'Bilateral Extensor', value: 'positive_bilateral' }
            ]}
          ]},
          { id: 'diagnosis-plan', title: 'Diagnosis & Plan', type: 'form', fields: [
            { id: 'diagnosis', label: 'Diagnosis / Localization', type: 'textarea', required: true, placeholder: 'e.g., Left MCA Infarct, Parkinson\'s disease, Migraine...' },
            { id: 'imaging', label: 'Imaging Required', type: 'select', options: [
              { label: 'None', value: 'none' }, { label: 'Brain MRI (without contrast)', value: 'mri_no_con' },
              { label: 'Brain MRI (with/without)', value: 'mri_con' }, { label: 'Brain CT (non-contrast)', value: 'ct_no_con' },
              { label: 'EEG', value: 'eeg' }
            ]},
            { id: 'management', label: 'Management Details', type: 'textarea' },
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

    if (data.gcsTotal !== undefined) {
      const gcsSev = data.gcsTotal < 9 ? 'severe' : data.gcsTotal < 13 ? 'moderate' : 'mild';
      structuredFindings.push({
        category: 'gcs_score',
        findingKey: 'gcs',
        findingValue: {
          eye: data.gcsEye,
          verbal: data.gcsVerbal,
          motor: data.gcsMotor,
          total: data.gcsTotal
        },
        severity: gcsSev,
        status: 'active'
      });
    }

    if (data.cranialNerveDeficits && Array.isArray(data.cranialNerveDeficits)) {
      data.cranialNerveDeficits.forEach((nerveNum: number) => {
        structuredFindings.push({
          category: 'cranial_nerve_deficit',
          findingKey: String(nerveNum),
          findingValue: { deficit: true },
          severity: 'moderate',
          status: 'active'
        });
      });
    }

    const enrichedFindings = structuredFindings.map(f => ({
      ...f,
      specialtyCode: 'neurology',
      encounterId,
      patientId,
      providerId
    }));

    return this.base.saveEncounterWithFindings({
      specialtyCode: 'neurology',
      encounterId,
      patientId,
      providerId,
      templateId: 'neurology-comprehensive',
      formData: data,
      findings: enrichedFindings
    });
  }

  async getHistory(patientId: string) {
    return this.base.getPatientHistory(patientId, 'neurology');
  }
}
