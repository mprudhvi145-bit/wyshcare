/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/specialties/gynecology/gynecology.service.ts
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
 * Business logic service for gynecology
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
export class GynecologyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly base: SpecialtyBaseService,
  ) {}

  getTemplates() {
    return [
      {
        id: 'gynecology-comprehensive',
        name: 'Obstetrics & Gynecology Evaluation',
        description: 'OB/GYN physical evaluation, history, and pregnancy assessment',
        sections: [
          { id: 'chief-complaint', title: 'Chief Complaint', type: 'form' as const, fields: [
            { id: 'presenting', label: 'Presenting Symptoms', type: 'textarea', required: true, placeholder: 'Pelvic pain, abnormal bleeding, discharge, pregnancy check...' },
            { id: 'gpal', label: 'GPAL (Gravida, Para, Abortus, Living)', type: 'text', placeholder: 'e.g., G2 P1 A0 L1' },
            { id: 'lmp', label: 'Last Menstrual Period Date', type: 'text', placeholder: 'YYYY-MM-DD' },
            { id: 'menstrualHistory', label: 'Menstrual History notes', type: 'textarea', placeholder: 'Regularity, flow severity, dysmenorrhea...' }
          ]},
          { id: 'exam', title: 'Physical & Pelvic Exam', type: 'form', fields: [
            { id: 'abdominal', label: 'Abdominal Examination', type: 'textarea', placeholder: 'Fundal height, tenderness, masses...' },
            { id: 'speculum', label: 'Speculum Exam', type: 'textarea', placeholder: 'Cervix appearance, vaginal discharge...' },
            { id: 'bimanual', label: 'Bimanual Exam', type: 'textarea', placeholder: 'Uterine size, adnexal tenderness/masses...' }
          ]},
          { id: 'diagnostic', title: 'Diagnostic Tests & Screening', type: 'form', fields: [
            { id: 'papSmear', label: 'Pap Smear Status', type: 'select', options: [
              { label: 'Not due', value: 'not_due' }, { label: 'Performed today', value: 'performed_today' },
              { label: 'Abnormal - historical', value: 'abnormal' }, { label: 'Due/Refused', value: 'due' }
            ]},
            { id: 'usgFindings', label: 'Ultrasound (USG) Findings', type: 'textarea', placeholder: 'Gestational sac, CRL, fibroids, ovaries...' },
            { id: 'pregnancyTest', label: 'Urine Pregnancy Test (UPT)', type: 'select', options: [
              { label: 'Not indicated', value: 'na' }, { label: 'Positive', value: 'positive' }, { label: 'Negative', value: 'negative' }
            ]}
          ]},
          { id: 'diagnosis-plan', title: 'Diagnosis & Management', type: 'form', fields: [
            { id: 'diagnosis', label: 'Diagnosis', type: 'textarea', required: true },
            { id: 'management', label: 'Management Plan', type: 'textarea', placeholder: 'Meds, prenatal vitamins, surgical option...' },
            { id: 'contraception', label: 'Contraceptive Counseling', type: 'textarea' },
            { id: 'followUp', label: 'Follow-up Timeframe', type: 'text' }
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

    if (data.menstrualCycleDay !== undefined) {
      structuredFindings.push({
        category: 'menstrual_cycle',
        findingKey: 'menstrual_day',
        findingValue: { day: data.menstrualCycleDay },
        severity: 'mild',
        status: 'active'
      });
    }

    if (data.lmpDate) {
      structuredFindings.push({
        category: 'gestational_age',
        findingKey: 'lmp_date',
        findingValue: { lmp: data.lmpDate },
        severity: 'mild',
        status: 'active'
      });
    }

    const enrichedFindings = structuredFindings.map(f => ({
      ...f,
      specialtyCode: 'gynecology',
      encounterId,
      patientId,
      providerId
    }));

    return this.base.saveEncounterWithFindings({
      specialtyCode: 'gynecology',
      encounterId,
      patientId,
      providerId,
      templateId: 'gynecology-comprehensive',
      formData: data,
      findings: enrichedFindings
    });
  }

  async getHistory(patientId: string) {
    return this.base.getPatientHistory(patientId, 'gynecology');
  }
}
