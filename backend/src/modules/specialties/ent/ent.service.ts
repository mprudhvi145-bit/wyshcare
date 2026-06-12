/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/specialties/ent/ent.service.ts
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
 * Business logic service for ent
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
export class EntService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly base: SpecialtyBaseService,
  ) {}

  getTemplates() {
    return [
      {
        id: 'ent-comprehensive',
        name: 'Comprehensive ENT Exam',
        description: 'Full ear, nose, throat examination',
        sections: [
          {
            id: 'ear-exam', title: 'Ear Examination', type: 'form' as const, fields: [
              { id: 'hearingComplaint', label: 'Hearing Complaint', type: 'textarea', placeholder: 'Hearing loss, tinnitus, vertigo...' },
              { id: 'otoscopyRight', label: 'Otoscopy - Right Ear', type: 'select', options: [
                { label: 'Normal', value: 'normal' }, { label: 'Wax', value: 'wax' },
                { label: 'Perforation', value: 'perforation' }, { label: 'Retraction', value: 'retraction' },
                { label: 'Bulging', value: 'bulging' }, { label: 'Fluid Level', value: 'fluid' },
                { label: 'Foreign Body', value: 'foreign_body' }, { label: 'Cholesteatoma', value: 'cholesteatoma' },
              ]},
              { id: 'otoscopyLeft', label: 'Otoscopy - Left Ear', type: 'select', options: [
                { label: 'Normal', value: 'normal' }, { label: 'Wax', value: 'wax' },
                { label: 'Perforation', value: 'perforation' }, { label: 'Retraction', value: 'retraction' },
                { label: 'Bulging', value: 'bulging' }, { label: 'Fluid Level', value: 'fluid' },
                { label: 'Foreign Body', value: 'foreign_body' }, { label: 'Cholesteatoma', value: 'cholesteatoma' },
              ]},
              { id: 'tuningForkRinne', label: 'Rinne Test', type: 'select', options: [
                { label: 'Normal', value: 'normal' }, { label: 'Right Negative', value: 'right_negative' },
                { label: 'Left Negative', value: 'left_negative' }, { label: 'Not Done', value: 'not_done' },
              ]},
              { id: 'tuningForkWeber', label: 'Weber Test', type: 'select', options: [
                { label: 'Midline', value: 'midline' }, { label: 'Lateralizes Right', value: 'right' },
                { label: 'Lateralizes Left', value: 'left' }, { label: 'Not Done', value: 'not_done' },
              ]},
              { id: 'whisperTest', label: 'Whisper Test', type: 'select', options: [
                { label: 'Normal', value: 'normal' }, { label: 'Reduced Right', value: 'reduced_right' },
                { label: 'Reduced Left', value: 'reduced_left' }, { label: 'Bilateral Reduction', value: 'bilateral' },
              ]},
            ],
          },
          {
            id: 'nose-exam', title: 'Nose Examination', type: 'form', fields: [
              { id: 'nasalComplaint', label: 'Nasal Complaint', type: 'textarea', placeholder: 'Blockage, discharge, epistaxis, smell...' },
              { id: 'anteriorRhinoscopy', label: 'Anterior Rhinoscopy', type: 'select', options: [
                { label: 'Normal', value: 'normal' }, { label: 'Deviated Septum', value: 'deviated_septum' },
                { label: 'Polyps', value: 'polyps' }, { label: 'Mucosal Swelling', value: 'mucosal_swelling' },
                { label: 'Turbinate Hypertrophy', value: 'turbinate_hypertrophy' },
                { label: 'Perforation', value: 'perforation' }, { label: 'Mass', value: 'mass' },
              ]},
              { id: 'endoscopy', label: 'Nasal Endoscopy', type: 'textarea', placeholder: 'Endoscopic findings...' },
              { id: 'sinusTenderness', label: 'Sinus Tenderness', type: 'select', options: [
                { label: 'None', value: 'none' }, { label: 'Maxillary', value: 'maxillary' },
                { label: 'Frontal', value: 'frontal' }, { label: 'Ethmoid', value: 'ethmoid' },
                { label: 'Multiple', value: 'multiple' },
              ]},
              { id: 'allergyAssessment', label: 'Allergy Assessment', type: 'select', options: [
                { label: 'No Signs', value: 'none' }, { label: 'Mild', value: 'mild' },
                { label: 'Moderate', value: 'moderate' }, { label: 'Severe', value: 'severe' },
              ]},
            ],
          },
          {
            id: 'throat-exam', title: 'Throat Examination', type: 'form', fields: [
              { id: 'throatComplaint', label: 'Throat Complaint', type: 'textarea', placeholder: 'Sore throat, dysphagia, voice change...' },
              { id: 'oropharynx', label: 'Oropharynx', type: 'select', options: [
                { label: 'Normal', value: 'normal' }, { label: 'Erythema', value: 'erythema' },
                { label: 'Exudate', value: 'exudate' }, { label: 'Ulcer', value: 'ulcer' },
                { label: 'Mass', value: 'mass' }, { label: 'Cobblestoning', value: 'cobblestoning' },
              ]},
              { id: 'tonsils', label: 'Tonsils', type: 'select', options: [
                { label: 'Normal', value: 'normal' }, { label: 'Enlarged Grade 1', value: 'grade1' },
                { label: 'Enlarged Grade 2', value: 'grade2' }, { label: 'Enlarged Grade 3', value: 'grade3' },
                { label: 'Enlarged Grade 4', value: 'grade4' }, { label: 'Absent', value: 'absent' },
              ]},
              { id: 'larynx', label: 'Larynx', type: 'select', options: [
                { label: 'Normal', value: 'normal' }, { label: 'Edema', value: 'edema' },
                { label: 'Nodules', value: 'nodules' }, { label: 'Polyps', value: 'polyps' },
                { label: 'Paralysis', value: 'paralysis' }, { label: 'Mass', value: 'mass' },
                { label: 'Not Visualized', value: 'not_visualized' },
              ]},
              { id: 'vocalCords', label: 'Vocal Cord Assessment', type: 'select', options: [
                { label: 'Normal Mobility', value: 'normal' }, { label: 'Reduced Mobility', value: 'reduced' },
                { label: 'Fixed', value: 'fixed' }, { label: 'Not Assessed', value: 'not_assessed' },
              ]},
              { id: 'neckLymphNodes', label: 'Cervical Lymph Nodes', type: 'textarea', placeholder: 'Location, size, consistency...' },
            ],
          },
          {
            id: 'audiology', title: 'Audiometry', type: 'assessment', fields: [
              { id: 'audiogram', label: 'Audiogram Findings', type: 'textarea' },
              { id: 'hearingLevelRight', label: 'Hearing Level - Right (dB)', type: 'number' },
              { id: 'hearingLevelLeft', label: 'Hearing Level - Left (dB)', type: 'number' },
              { id: 'hearingLossType', label: 'Type of Hearing Loss', type: 'select', options: [
                { label: 'Normal', value: 'normal' }, { label: 'Conductive', value: 'conductive' },
                { label: 'Sensorineural', value: 'sensorineural' }, { label: 'Mixed', value: 'mixed' },
              ]},
              { id: 'tympanometry', label: 'Tympanometry', type: 'select', options: [
                { label: 'Type A (Normal)', value: 'A' }, { label: 'Type As (Reduced Compliance)', value: 'As' },
                { label: 'Type Ad (Hypercompliance)', value: 'Ad' }, { label: 'Type B (Flat)', value: 'B' },
                { label: 'Type C (Negative Pressure)', value: 'C' }, { label: 'Not Done', value: 'not_done' },
              ]},
            ],
          },
          {
            id: 'diagnosis-plan', title: 'Diagnosis & Plan', type: 'form', fields: [
              { id: 'diagnosis', label: 'ENT Diagnosis', type: 'textarea', required: true },
              { id: 'icdCode', label: 'ICD-10 Code', type: 'text' },
              { id: 'management', label: 'Management Plan', type: 'textarea' },
              { id: 'medications', label: 'Prescribed Medications', type: 'textarea' },
              { id: 'followUp', label: 'Follow-up', type: 'text', placeholder: 'e.g., 2 weeks' },
              { id: 'referral', label: 'Referral Needed', type: 'select', options: [
                { label: 'No', value: 'no' }, { label: 'Audiology', value: 'audiology' },
                { label: 'Speech Therapy', value: 'speech' }, { label: 'Allergy', value: 'allergy' },
                { label: 'Neurology', value: 'neurology' }, { label: 'Oncology', value: 'oncology' },
              ]},
            ],
          },
        ],
        isDefault: true,
      },
    ];
  }

  async saveEntEncounter(encounterId: string, patientId: string, providerId: string, data: Record<string, unknown>) {
    const structuredFindings: Array<{
      category: string; findingKey: string; findingValue: Record<string, unknown>;
      severity?: string; status?: string;
    }> = [];

    for (const ear of ['right', 'left']) {
      const key = ear === 'right' ? 'otoscopyRight' : 'otoscopyLeft';
      const findingKey = ear === 'right' ? 'right_ear' : 'left_ear';
      const val = data[key] as string;
      if (val && val !== 'normal') {
        structuredFindings.push({
          category: 'otoscopy',
          findingKey,
          findingValue: { finding: val },
          severity: val === 'cholesteatoma' ? 'severe' : val === 'perforation' ? 'moderate' : 'mild',
          status: 'active',
        });
      }
    }

    if (data['audiogramData']) {
      const audiogram = data['audiogramData'] as Array<{ frequency: number; left?: number; right?: number }>;
      audiogram.forEach(point => {
        structuredFindings.push({
          category: 'audiometry',
          findingKey: String(point.frequency),
          findingValue: { left: point.left, right: point.right },
          severity: (point.left ?? point.right ?? 0) > 40 ? 'moderate' : 'mild',
          status: 'active',
        });
      });
    }

    const enrichedFindings = structuredFindings.map(f => ({
      ...f, specialtyCode: 'ent', encounterId, patientId, providerId,
    }));

    return this.base.saveEncounterWithFindings({
      specialtyCode: 'ent', encounterId, patientId, providerId,
      templateId: 'ent-comprehensive', formData: data,
      findings: enrichedFindings,
    });
  }

  async getEntHistory(patientId: string) {
    return this.base.getPatientHistory(patientId, 'ent');
  }
}
