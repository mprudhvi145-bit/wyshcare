import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { SpecialtyBaseService } from '../shared/specialty-base.service';

@Injectable()
export class GeneralSurgeryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly base: SpecialtyBaseService,
  ) {}

  getTemplates() {
    return [
      {
        id: 'surgery-pre-op',
        name: 'Pre-Operative Assessment',
        description: 'Pre-operative evaluation including history, exam, and risk assessment',
        sections: [
          { id: 'chief-complaint', title: 'Chief Complaint & History', type: 'form' as const, fields: [
            { id: 'presentingComplaint', label: 'Presenting Complaint', type: 'textarea', required: true },
            { id: 'surgicalHistory', label: 'Past Surgical History', type: 'textarea' },
            { id: 'medicalHistory', label: 'Medical History (Comorbidities)', type: 'textarea' },
            { id: 'medications', label: 'Current Medications', type: 'textarea' },
            { id: 'allergies', label: 'Allergies', type: 'textarea' },
          ]},
          { id: 'exam', title: 'Physical Examination', type: 'form', fields: [
            { id: 'generalExam', label: 'General Examination', type: 'textarea' },
            { id: 'localExam', label: 'Local / Site Examination', type: 'textarea', required: true },
            { id: 'vitals', label: 'Vitals (BP, HR, Temp, SpO2)', type: 'textarea' },
          ]},
          { id: 'investigations', title: 'Investigations', type: 'form', fields: [
            { id: 'labReports', label: 'Lab Reports (CBC, KFT, LFT, Coagulation)', type: 'textarea' },
            { id: 'imaging', label: 'Imaging Findings', type: 'textarea' },
            { id: 'ecg', label: 'ECG / Cardiac Clearance', type: 'textarea' },
          ]},
          { id: 'diagnosis-plan', title: 'Diagnosis & Surgical Plan', type: 'form', fields: [
            { id: 'diagnosis', label: 'Diagnosis', type: 'textarea', required: true },
            { id: 'plannedProcedure', label: 'Planned Procedure', type: 'textarea', required: true },
            { id: 'asaGrade', label: 'ASA Grade', type: 'select', options: [
              { label: 'ASA I', value: 'I' }, { label: 'ASA II', value: 'II' },
              { label: 'ASA III', value: 'III' }, { label: 'ASA IV', value: 'IV' },
              { label: 'ASA V', value: 'V' },
            ]},
            { id: 'consentObtained', label: 'Consent Obtained', type: 'select', options: [
              { label: 'Yes', value: 'yes' }, { label: 'Pending', value: 'pending' },
            ]},
            { id: 'surgicalSiteMarking', label: 'Surgical Site Marking', type: 'select', options: [
              { label: 'Done', value: 'done' }, { label: 'Pending', value: 'pending' },
            ]},
            { id: 'preOpInstructions', label: 'Pre-Operative Instructions', type: 'textarea' },
          ]},
        ],
        isDefault: true,
      },
      {
        id: 'surgery-post-op',
        name: 'Post-Operative Note',
        description: 'Post-operative assessment and recovery tracking',
        sections: [
          { id: 'procedure', title: 'Procedure Details', type: 'form', fields: [
            { id: 'procedurePerformed', label: 'Procedure Performed', type: 'textarea', required: true },
            { id: 'surgeon', label: 'Surgeon', type: 'text' },
            { id: 'assistant', label: 'Assistant', type: 'text' },
            { id: 'anesthesia', label: 'Type of Anesthesia', type: 'text' },
            { id: 'duration', label: 'Procedure Duration (min)', type: 'text' },
            { id: 'bloodLoss', label: 'Estimated Blood Loss (mL)', type: 'text' },
            { id: 'complications', label: 'Intra-Op Complications', type: 'textarea' },
            { id: 'drains', label: 'Drains / Tubes', type: 'textarea' },
            { id: 'specimen', label: 'Specimen Sent For', type: 'textarea' },
          ]},
          { id: 'recovery', title: 'Recovery & Post-Op Plan', type: 'form', fields: [
            { id: 'postOpStatus', label: 'Post-Operative Status', type: 'textarea' },
            { id: 'painScore', label: 'Pain Score (0-10)', type: 'number' },
            { id: 'medications', label: 'Post-Op Medications', type: 'textarea' },
            { id: 'diet', label: 'Diet', type: 'select', options: [
              { label: 'NPO', value: 'npo' }, { label: 'Clear Liquids', value: 'clear_liquids' },
              { label: 'Soft Diet', value: 'soft' }, { label: 'Regular Diet', value: 'regular' },
            ]},
            { id: 'activity', label: 'Activity', type: 'select', options: [
              { label: 'Bed Rest', value: 'bed_rest' }, { label: 'Ambulate with Assistance', value: 'assist' },
              { label: 'Ambulate Freely', value: 'free' },
            ]},
            { id: 'followUp', label: 'Follow-Up Plan', type: 'textarea' },
            { id: 'instructions', label: 'Discharge Instructions', type: 'textarea' },
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

    if (data.asaGrade) {
      structuredFindings.push({
        category: 'asa_grade',
        findingKey: 'asa',
        findingValue: { grade: data.asaGrade },
        severity: ['IV', 'V'].includes(data.asaGrade as string) ? 'severe' : 'moderate',
        status: 'active',
      });
    }

    if (data.plannedProcedure) {
      structuredFindings.push({
        category: 'planned_procedure',
        findingKey: 'planned_procedure',
        findingValue: { procedure: data.plannedProcedure as string },
        status: 'active',
      });
    }

    if (data.complications) {
      structuredFindings.push({
        category: 'complications',
        findingKey: 'complications',
        findingValue: { description: data.complications as string },
        severity: 'severe',
        status: 'active',
      });
    }

    const enrichedFindings = structuredFindings.map(f => ({
      ...f, specialtyCode: 'general-surgery', encounterId, patientId, providerId,
    }));

    return this.base.saveEncounterWithFindings({
      specialtyCode: 'general-surgery', encounterId, patientId, providerId,
      templateId: data.templateId as string || 'surgery-pre-op',
      formData: data,
      findings: enrichedFindings,
    });
  }

  async saveStructuredFindings(
    encounterId: string, patientId: string, providerId: string,
    findings: Array<{ category: string; findingKey: string; findingValue: Record<string, unknown>; severity?: string; status?: string }>,
  ) {
    const enriched = findings.map(f => ({
      ...f, specialtyCode: 'general-surgery', encounterId, patientId, providerId,
    }));
    return this.base.saveFindings(enriched);
  }

  async logProcedure(body: { encounterId: string; patientId: string; providerId: string; procedureCode: string; procedureName: string; notes: string }) {
    return this.base.saveEncounterWithFindings({
      specialtyCode: 'general-surgery',
      encounterId: body.encounterId,
      patientId: body.patientId,
      providerId: body.providerId,
      templateId: 'surgery-post-op',
      formData: body,
      findings: [{
        specialtyCode: 'general-surgery',
        encounterId: body.encounterId,
        patientId: body.patientId,
        providerId: body.providerId,
        category: 'surgical_procedure',
        findingKey: body.procedureCode,
        findingValue: { procedureName: body.procedureName, notes: body.notes },
        severity: 'moderate',
        status: 'completed',
      }],
    });
  }

  async getPatientDetails(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { appointments: { take: 5, orderBy: { slotStartAt: 'desc' } } },
    });
  }

  async getEncounterDetails(id: string) {
    return this.prisma.encounter.findUnique({
      where: { id },
      include: { SpecialtyFinding: true },
    });
  }

  async getHistory(patientId: string) {
    return this.base.getPatientHistory(patientId, 'general-surgery');
  }
}
