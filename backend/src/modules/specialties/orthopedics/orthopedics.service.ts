/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/specialties/orthopedics/orthopedics.service.ts
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
 * Business logic service for orthopedics
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
export class OrthopedicsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly base: SpecialtyBaseService,
  ) {}

  getTemplates() {
    return [
      {
        id: 'orthopedics-exam',
        name: 'Comprehensive Orthopedics Exam',
        description: 'Joint physical exam, musculoskeletal pain profile, range of motion, and fracture check',
        sections: [
          { id: 'chief-complaint', title: 'Chief Complaint & Pain', type: 'form' as const, fields: [
            { id: 'presenting', label: 'Presenting Musculoskeletal Concerns', type: 'textarea', required: true, placeholder: 'Joint pain, swelling, deformity, trauma, back pain, sports injury...' },
            { id: 'onset', label: 'Onset Profile', type: 'select', options: [
              { label: 'Acute (trauma/sports injury)', value: 'acute_injury' },
              { label: 'Chronic (degenerative/wear)', value: 'chronic_degenerative' },
              { label: 'Subacute onset', value: 'subacute' }
            ]}
          ]},
          { id: 'range-motion', title: 'Range of Motion & Function', type: 'form', fields: [
            { id: 'romNotes', label: 'Range of Motion (Active/Passive)', type: 'textarea', placeholder: 'Flexion, extension, rotation of affected joints...' },
            { id: 'gait', label: 'Gait Assessment', type: 'select', options: [
              { label: 'Normal gait', value: 'normal' }, { label: 'Antalgic (pain-induced limp)', value: 'antalgic' },
              { label: 'Ataxic / Unsteady', value: 'ataxic' }, { label: 'Non-ambulatory', value: 'non_ambulatory' }
            ]},
            { id: 'neurovascular', label: 'Neurovascular Status (Distal)', type: 'select', options: [
              { label: 'Intact (pulses +2, sensation normal, motor intact)', value: 'intact' },
              { label: 'Impaired sensation distal to injury', value: 'sensory_deficit' },
              { label: 'Weakness / Motor deficit', value: 'motor_deficit' },
              { label: 'Diminished pulses / Vascular concern', value: 'vascular_concern' }
            ]}
          ]},
          { id: 'imaging', title: 'Radiology Reviews', type: 'form', fields: [
            { id: 'xrayFindings', label: 'X-Ray / MRI / CT Findings', type: 'textarea', placeholder: 'Fractures, dislocations, joint space narrowing, ligament tears...' }
          ]},
          { id: 'diagnosis-plan', title: 'Diagnosis & Plan', type: 'form', fields: [
            { id: 'diagnosis', label: 'Orthopedic Diagnosis', type: 'textarea', required: true, placeholder: 'e.g., Right Knee Osteoarthritis, Anterior Cruciate Ligament Tear...' },
            { id: 'splintBrace', label: 'Splinting / Bracing / Casting', type: 'text', placeholder: 'e.g., Knee immobilizer, short leg cast, none...' },
            { id: 'management', label: 'Treatment Details & Physical Therapy', type: 'textarea' },
            { id: 'followUp', label: 'Follow-up / Surgical scheduling', type: 'text' }
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

    const jointConditions = data.jointConditions as Record<string, string> | undefined;
    if (jointConditions) {
      for (const [jointId, condition] of Object.entries(jointConditions)) {
        if (condition && condition !== 'healthy' && condition !== 'normal') {
          const isSevere = ['fractured', 'swollen'].includes(condition);
          structuredFindings.push({
            category: 'joint_condition',
            findingKey: jointId,
            findingValue: { condition },
            severity: isSevere ? 'moderate' : 'mild',
            status: 'active'
          });
        }
      }
    }

    const enrichedFindings = structuredFindings.map(f => ({
      ...f,
      specialtyCode: 'orthopedics',
      encounterId,
      patientId,
      providerId
    }));

    return this.base.saveEncounterWithFindings({
      specialtyCode: 'orthopedics',
      encounterId,
      patientId,
      providerId,
      templateId: 'orthopedics-exam',
      formData: data,
      findings: enrichedFindings
    });
  }

  async getHistory(patientId: string) {
    return this.base.getPatientHistory(patientId, 'orthopedics');
  }
}
