import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { SpecialtyBaseService } from '../shared/specialty-base.service';

@Injectable()
export class AnesthesiologyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly base: SpecialtyBaseService,
  ) {}

  getTemplates() {
    return [
      {
        id: 'anesthesia-pre-op',
        name: 'Pre-Anesthesia Assessment',
        description: 'Pre-operative evaluation for anesthesia clearance',
        sections: [
          { id: 'patient-info', title: 'Patient Information', type: 'form' as const, fields: [
            { id: 'age', label: 'Age', type: 'number' },
            { id: 'weight', label: 'Weight (kg)', type: 'number' },
            { id: 'height', label: 'Height (cm)', type: 'number' },
            { id: 'bmi', label: 'BMI', type: 'text' },
          ]},
          { id: 'medical-history', title: 'Medical History', type: 'form', fields: [
            { id: 'comorbidities', label: 'Comorbidities', type: 'textarea', placeholder: 'Hypertension, Diabetes, CAD, CKD, Asthma...' },
            { id: 'previousSurgery', label: 'Previous Surgery / Anesthesia', type: 'textarea' },
            { id: 'familyHistory', label: 'Family History (Anesthesia Complications)', type: 'textarea' },
            { id: 'medications', label: 'Current Medications', type: 'textarea' },
            { id: 'allergies', label: 'Allergies (esp. Latex, Drugs)', type: 'textarea' },
            { id: 'smoking', label: 'Smoking History', type: 'select', options: [
              { label: 'Never', value: 'never' }, { label: 'Former', value: 'former' },
              { label: 'Current', value: 'current' },
            ]},
            { id: 'alcohol', label: 'Alcohol History', type: 'select', options: [
              { label: 'None', value: 'none' }, { label: 'Social', value: 'social' },
              { label: 'Moderate', value: 'moderate' }, { label: 'Heavy', value: 'heavy' },
            ]},
          ]},
          { id: 'airway-exam', title: 'Airway Assessment', type: 'form', fields: [
            { id: 'mallampati', label: 'Mallampati Score', type: 'select', options: [
              { label: 'Class I', value: 'I' }, { label: 'Class II', value: 'II' },
              { label: 'Class III', value: 'III' }, { label: 'Class IV', value: 'IV' },
            ]},
            { id: 'mouthOpening', label: 'Mouth Opening (cm)', type: 'text' },
            { id: 'neckMobility', label: 'Neck Mobility', type: 'select', options: [
              { label: 'Full', value: 'full' }, { label: 'Limited', value: 'limited' },
            ]},
            { id: 'thyromentalDistance', label: 'Thyromental Distance (cm)', type: 'text' },
            { id: 'dentition', label: 'Dentition Issues', type: 'textarea' },
            { id: 'airwaySummary', label: 'Airway Summary', type: 'select', options: [
              { label: 'Likely Easy', value: 'easy' }, { label: 'Likely Difficult', value: 'difficult' },
            ]},
          ]},
          { id: 'asa', title: 'ASA Classification & Plan', type: 'form', fields: [
            { id: 'asaClass', label: 'ASA Physical Status', type: 'select', options: [
              { label: 'ASA I — Normal healthy', value: 'I' },
              { label: 'ASA II — Mild systemic disease', value: 'II' },
              { label: 'ASA III — Severe systemic disease', value: 'III' },
              { label: 'ASA IV — Severe life-threatening disease', value: 'IV' },
              { label: 'ASA V — Moribund, not expected to survive', value: 'V' },
            ]},
            { id: 'anesthesiaPlan', label: 'Anesthesia Plan', type: 'textarea', required: true },
            { id: 'riskFactors', label: 'Risk Factors / Concerns', type: 'textarea' },
            { id: 'preOpInstructions', label: 'Pre-Operative Instructions / NPO Status', type: 'textarea' },
            { id: 'clearance', label: 'Anesthesia Clearance', type: 'select', options: [
              { label: 'Cleared', value: 'cleared' }, { label: 'Cleared with Precautions', value: 'cleared_precautions' },
              { label: 'Deferred / Needs Optimization', value: 'deferred' },
            ]},
          ]},
        ],
        isDefault: true,
      },
      {
        id: 'anesthesia-intra-op',
        name: 'Intra-Operative Anesthesia Record',
        description: 'Intra-operative monitoring and anesthesia details',
        sections: [
          { id: 'procedure', title: 'Procedure & Anesthesia Type', type: 'form', fields: [
            { id: 'anesthesiaType', label: 'Type of Anesthesia', type: 'select', options: [
              { label: 'General', value: 'general' }, { label: 'Spinal', value: 'spinal' },
              { label: 'Epidural', value: 'epidural' }, { label: 'Regional Block', value: 'regional' },
              { label: 'MAC / Sedation', value: 'mac' }, { label: 'Local', value: 'local' },
            ]},
            { id: 'surgicalProcedure', label: 'Surgical Procedure', type: 'text' },
            { id: 'position', label: 'Patient Position', type: 'text' },
          ]},
          { id: 'monitoring', title: 'Monitoring & Medications', type: 'form', fields: [
            { id: 'vitalsMonitoring', label: 'Vitals Monitoring (BP, HR, SpO2, ETCO2, Temp)', type: 'textarea' },
            { id: 'drugsUsed', label: 'Anesthetic Agents & Drugs Used', type: 'textarea' },
            { id: 'fluids', label: 'IV Fluids & Blood Products', type: 'textarea' },
            { id: 'estimatedBloodLoss', label: 'Estimated Blood Loss (mL)', type: 'text' },
            { id: 'urineOutput', label: 'Urine Output (mL)', type: 'text' },
          ]},
          { id: 'recovery', title: 'Recovery & PACU Handover', type: 'form', fields: [
            { id: 'complications', label: 'Intra-Op Complications', type: 'textarea' },
            { id: 'recoveryNotes', label: 'Recovery Notes / PACU Handover', type: 'textarea' },
            { id: 'aldreteScore', label: 'Aldrete Score (PACU Discharge)', type: 'text' },
            { id: 'postOpPainPlan', label: 'Post-Operative Pain Management Plan', type: 'textarea' },
          ]},
        ],
      },
    ];
  }

  async saveEncounter(encounterId: string, patientId: string, providerId: string, data: Record<string, unknown>) {
    const structuredFindings: Array<{
      category: string; findingKey: string; findingValue: Record<string, unknown>;
      severity?: string; status?: string;
    }> = [];

    if (data.asaClass) {
      structuredFindings.push({
        category: 'asa_classification',
        findingKey: 'asa',
        findingValue: { class: data.asaClass as string },
        severity: ['IV', 'V'].includes(data.asaClass as string) ? 'severe' : 'moderate',
        status: 'active',
      });
    }

    if (data.mallampati) {
      structuredFindings.push({
        category: 'airway_assessment',
        findingKey: 'mallampati',
        findingValue: { score: data.mallampati as string, neckMobility: data.neckMobility as string },
        severity: ['III', 'IV'].includes(data.mallampati as string) ? 'moderate' : 'mild',
        status: 'active',
      });
    }

    if (data.anesthesiaPlan) {
      structuredFindings.push({
        category: 'anesthesia_plan',
        findingKey: 'plan',
        findingValue: { plan: data.anesthesiaPlan as string },
        status: 'active',
      });
    }

    if (data.anesthesiaType) {
      structuredFindings.push({
        category: 'anesthesia_type',
        findingKey: data.anesthesiaType as string,
        findingValue: { type: data.anesthesiaType as string },
        status: 'completed',
      });
    }

    if (data.complications) {
      structuredFindings.push({
        category: 'complications',
        findingKey: 'intra_op_complications',
        findingValue: { details: data.complications as string },
        severity: 'severe',
        status: 'active',
      });
    }

    const enrichedFindings = structuredFindings.map(f => ({
      ...f, specialtyCode: 'anesthesiology', encounterId, patientId, providerId,
    }));

    return this.base.saveEncounterWithFindings({
      specialtyCode: 'anesthesiology', encounterId, patientId, providerId,
      templateId: data.templateId as string || 'anesthesia-pre-op',
      formData: data,
      findings: enrichedFindings,
    });
  }

  async getPreOpAssessment(patientId: string) {
    return this.prisma.specialtyFinding.findMany({
      where: { patientId, specialtyCode: 'anesthesiology', category: { in: ['asa_classification', 'airway_assessment', 'anesthesia_plan'] } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  async submitAssessment(body: { encounterId: string; patientId: string; providerId: string; asaClass: string; airwayAssessment: string; anesthesiaPlan: string; riskFactors: string }) {
    return this.base.saveEncounterWithFindings({
      specialtyCode: 'anesthesiology',
      encounterId: body.encounterId,
      patientId: body.patientId,
      providerId: body.providerId,
      templateId: 'anesthesia-pre-op',
      formData: body,
      findings: [
        { specialtyCode: 'anesthesiology', encounterId: body.encounterId, patientId: body.patientId, providerId: body.providerId, category: 'asa_classification', findingKey: 'asa', findingValue: { class: body.asaClass, airwayAssessment: body.airwayAssessment }, severity: 'moderate', status: 'active' },
        { specialtyCode: 'anesthesiology', encounterId: body.encounterId, patientId: body.patientId, providerId: body.providerId, category: 'anesthesia_plan', findingKey: 'plan', findingValue: { plan: body.anesthesiaPlan, riskFactors: body.riskFactors }, status: 'active' },
      ],
    });
  }

  async submitAnesthesiaRecord(body: { encounterId: string; patientId: string; providerId: string; anesthesiaType: string; drugsUsed: string; vitalsMonitoring: string; recoveryNotes: string; complications?: string }) {
    const findings: Array<{ specialtyCode: string; encounterId: string; patientId: string; providerId: string; category: string; findingKey: string; findingValue: Record<string, unknown>; severity?: string; status?: string }> = [
      { specialtyCode: 'anesthesiology', encounterId: body.encounterId, patientId: body.patientId, providerId: body.providerId, category: 'anesthesia_type', findingKey: body.anesthesiaType, findingValue: { type: body.anesthesiaType }, status: 'completed' },
      { specialtyCode: 'anesthesiology', encounterId: body.encounterId, patientId: body.patientId, providerId: body.providerId, category: 'medication_record', findingKey: 'drugs', findingValue: { drugs: body.drugsUsed }, status: 'completed' },
      { specialtyCode: 'anesthesiology', encounterId: body.encounterId, patientId: body.patientId, providerId: body.providerId, category: 'recovery', findingKey: 'pacu_handover', findingValue: { notes: body.recoveryNotes }, status: 'completed' },
    ];

    if (body.complications) {
      findings.push({ specialtyCode: 'anesthesiology', encounterId: body.encounterId, patientId: body.patientId, providerId: body.providerId, category: 'complications', findingKey: 'intra_op_complications', findingValue: { details: body.complications }, severity: 'severe', status: 'active' });
    }

    return this.base.saveEncounterWithFindings({
      specialtyCode: 'anesthesiology',
      encounterId: body.encounterId,
      patientId: body.patientId,
      providerId: body.providerId,
      templateId: 'anesthesia-intra-op',
      formData: body,
      findings,
    });
  }

  async getHistory(patientId: string) {
    return this.base.getPatientHistory(patientId, 'anesthesiology');
  }
}
