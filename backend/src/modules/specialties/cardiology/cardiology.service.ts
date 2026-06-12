/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/specialties/cardiology/cardiology.service.ts
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
 * Business logic service for cardiology
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
export class CardiologyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly base: SpecialtyBaseService,
  ) {}

  getTemplates() {
    return [
      {
        id: 'cardiology-exam',
        name: 'Comprehensive Cardiology Exam',
        description: 'Cardiac physical assessment, ECG interpretation, and echo findings',
        sections: [
          { id: 'chief-complaint', title: 'Chief Complaint', type: 'form' as const, fields: [
            { id: 'presenting', label: 'Presenting Cardiac Symptoms', type: 'textarea', required: true, placeholder: 'Chest pain, dyspnea, palpitations, syncope, edema...' },
            { id: 'nyhaClass', label: 'NYHA Heart Failure Class', type: 'select', options: [
              { label: 'Class I: No limitation of physical activity', value: 'I' },
              { label: 'Class II: Slight limitation of physical activity', value: 'II' },
              { label: 'Class III: Marked limitation of physical activity', value: 'III' },
              { label: 'Class IV: Symptomatic at rest', value: 'IV' },
              { label: 'N/A', value: 'na' }
            ]}
          ]},
          { id: 'physical-exam', title: 'Cardiovascular Physical Exam', type: 'form', fields: [
            { id: 'heartSounds', label: 'Auscultation (Heart Sounds)', type: 'select', options: [
              { label: 'Normal S1/S2, no murmurs', value: 'normal' },
              { label: 'Systolic murmur present', value: 'systolic_murmur' },
              { label: 'Diastolic murmur present', value: 'diastolic_murmur' },
              { label: 'S3 gallop present', value: 's3' },
              { label: 'S4 gallop present', value: 's4' }
            ]},
            { id: 'jvp', label: 'Jugular Venous Pressure (JVP)', type: 'text', placeholder: 'e.g., < 3 cm H2O / elevated at 8 cm' },
            { id: 'edema', label: 'Peripheral Edema', type: 'select', options: [
              { label: 'None', value: 'none' }, { label: 'Trace / 1+', value: '1+' },
              { label: 'Moderate / 2+', value: '2+' }, { label: 'Severe / 3+ or 4+', value: '3+' }
            ]}
          ]},
          { id: 'ecg-echo', title: 'ECG & Echocardiography', type: 'form', fields: [
            { id: 'ecgFindings', label: 'ECG Details & Interpetation', type: 'textarea' },
            { id: 'ef', label: 'Ejection Fraction (EF %)', type: 'text', placeholder: 'e.g., 55-60%' },
            { id: 'echoFindings', label: 'Echo (Valvular/Structural)', type: 'textarea' }
          ]},
          { id: 'diagnosis-plan', title: 'Diagnosis & Plan', type: 'form', fields: [
            { id: 'diagnosis', label: 'Cardiovascular Diagnosis', type: 'textarea', required: true },
            { id: 'management', label: 'Management Plan (Meds/Diet)', type: 'textarea' },
            { id: 'referrals', label: 'Referrals & Next Steps', type: 'text' },
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

    if (data.rhythm) {
      const isSevere = ['vfib', 'afib', 'tachycardia'].includes(data.rhythm);
      structuredFindings.push({
        category: 'ecg_rhythm',
        findingKey: 'rhythm',
        findingValue: { rhythm: data.rhythm },
        severity: isSevere ? 'severe' : 'mild',
        status: 'active'
      });
    }

    const enrichedFindings = structuredFindings.map(f => ({
      ...f,
      specialtyCode: 'cardiology',
      encounterId,
      patientId,
      providerId
    }));

    return this.base.saveEncounterWithFindings({
      specialtyCode: 'cardiology',
      encounterId,
      patientId,
      providerId,
      templateId: 'cardiology-exam',
      formData: data,
      findings: enrichedFindings
    });
  }

  async getHistory(patientId: string) {
    return this.base.getPatientHistory(patientId, 'cardiology');
  }
}
