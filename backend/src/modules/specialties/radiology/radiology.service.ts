import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { SpecialtyBaseService } from '../shared/specialty-base.service';

interface CreateImagingStudyDto {
  patientId: string;
  encounterId: string;
  providerId: string;
  modality: string;
  bodyPart?: string;
  laterality?: string;
  protocolName?: string;
  clinicalIndication?: string;
  priority?: 'ROUTINE' | 'URGENT' | 'STAT' | 'ASAP' | 'TIMED';
  scheduledAt?: string;
  accessionNumber?: string;
  studyInstanceUid?: string;
}

interface UpdateImagingStudyDto {
  bodyPart?: string;
  laterality?: string;
  protocolName?: string;
  status?: 'ORDERED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ENTERED_IN_ERROR';
  clinicalIndication?: string;
  technique?: string;
  contrastUsed?: boolean;
  contrastAgent?: string;
  dicomTags?: Record<string, unknown>;
  scheduledAt?: string;
  performedAt?: string;
  completedAt?: string;
}

interface AddSeriesDto {
  seriesInstanceUid?: string;
  seriesNumber?: number;
  modality: string;
  bodyPart?: string;
  laterality?: string;
  protocolName?: string;
  description?: string;
  manufacturer?: string;
  deviceModel?: string;
  institutionName?: string;
  dicomTags?: Record<string, unknown>;
  instanceCount?: number;
  startedAt?: string;
  endedAt?: string;
}

interface AddInstanceDto {
  sopInstanceUid?: string;
  instanceNumber?: number;
  dicomTags?: Record<string, unknown>;
  filePath?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  thumbnailUrl?: string;
}

interface SubmitReportDto {
  findings: string;
  impression: string;
  recommendations?: string;
  reportStatus?: 'PENDING' | 'DRAFT' | 'FINAL' | 'AMENDED' | 'CANCELLED';
  reportedById: string;
}

@Injectable()
export class RadiologyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly base: SpecialtyBaseService,
  ) {}

  getTemplates() {
    return [
      {
        id: 'radiology-xray',
        name: 'X-Ray Report',
        description: 'Plain radiograph reporting template',
        sections: [
          { id: 'exam', title: 'Examination Details', type: 'form' as const, fields: [
            { id: 'modality', label: 'Modality', type: 'select', options: [
              { label: 'X-Ray', value: 'xray' }, { label: 'CT', value: 'ct' },
              { label: 'MRI', value: 'mri' }, { label: 'Ultrasound', value: 'ultrasound' },
              { label: 'Mammography', value: 'mammography' }, { label: 'Fluoroscopy', value: 'fluoroscopy' },
            ]},
            { id: 'bodyPart', label: 'Body Part / Region', type: 'text', required: true },
            { id: 'clinicalIndication', label: 'Clinical Indication', type: 'textarea' },
            { id: 'technique', label: 'Technique', type: 'textarea' },
          ]},
          { id: 'findings', title: 'Radiological Findings', type: 'form', fields: [
            { id: 'findings', label: 'Findings Description', type: 'textarea', required: true },
            { id: 'comparison', label: 'Comparison with Prior Studies', type: 'textarea' },
          ]},
          { id: 'impression', title: 'Impression & Recommendations', type: 'form', fields: [
            { id: 'impression', label: 'Impression / Conclusion', type: 'textarea', required: true },
            { id: 'recommendations', label: 'Recommendations', type: 'textarea' },
            { id: 'criticalFinding', label: 'Critical Finding?', type: 'select', options: [
              { label: 'No', value: 'no' }, { label: 'Yes (Notify Ordering Physician)', value: 'critical' },
            ]},
          ]},
        ],
        isDefault: true,
      },
      {
        id: 'radiology-ct',
        name: 'CT Report',
        description: 'Computed tomography structured report',
        sections: [
          { id: 'exam', title: 'CT Details', type: 'form', fields: [
            { id: 'ctType', label: 'CT Type', type: 'select', options: [
              { label: 'CT Head', value: 'head' }, { label: 'CT Chest', value: 'chest' },
              { label: 'CT Abdomen', value: 'abdomen' }, { label: 'CT Spine', value: 'spine' },
              { label: 'CT Angio', value: 'angio' }, { label: 'CT Other', value: 'other' },
            ]},
            { id: 'contrast', label: 'Contrast', type: 'select', options: [
              { label: 'Non-Contrast', value: 'non_contrast' }, { label: 'Contrast', value: 'contrast' },
            ]},
            { id: 'clinicalIndication', label: 'Clinical Indication', type: 'textarea' },
          ]},
          { id: 'findings', title: 'CT Findings', type: 'form', fields: [
            { id: 'findings', label: 'Detailed Findings', type: 'textarea', required: true },
          ]},
          { id: 'impression', title: 'Impression', type: 'form', fields: [
            { id: 'impression', label: 'Impression', type: 'textarea', required: true },
            { id: 'recommendations', label: 'Recommendations', type: 'textarea' },
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

    if (data.modality) {
      structuredFindings.push({
        category: 'imaging_modality',
        findingKey: data.modality as string,
        findingValue: { bodyPart: data.bodyPart as string, technique: data.technique as string },
        status: 'active',
      });
    }

    if (data.criticalFinding === 'critical') {
      structuredFindings.push({
        category: 'critical_finding',
        findingKey: 'critical_alert',
        findingValue: { details: data.findings as string },
        severity: 'severe',
        status: 'active',
      });
    }

    if (data.impression) {
      structuredFindings.push({
        category: 'radiology_impression',
        findingKey: 'impression',
        findingValue: { text: data.impression as string },
        status: 'active',
      });
    }

    const enrichedFindings = structuredFindings.map(f => ({
      ...f, specialtyCode: 'radiology', encounterId, patientId, providerId,
    }));

    return this.base.saveEncounterWithFindings({
      specialtyCode: 'radiology', encounterId, patientId, providerId,
      templateId: data.templateId as string || 'radiology-xray',
      formData: data,
      findings: enrichedFindings,
    });
  }

  async getPatientStudies(patientId: string) {
    return this.prisma.imagingStudy.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        Series: {
          include: { Instances: true },
          orderBy: { seriesNumber: 'asc' },
        },
      },
    });
  }

  async getStudy(id: string) {
    const study = await this.prisma.imagingStudy.findUnique({
      where: { id },
      include: {
        Series: {
          include: { Instances: true },
          orderBy: { seriesNumber: 'asc' },
        },
        Encounter: { select: { periodStart: true, reason: true } },
      },
    });
    if (!study) throw new NotFoundException('Imaging study not found');
    return study;
  }

  async createStudy(dto: CreateImagingStudyDto) {
    return this.prisma.imagingStudy.create({
      data: {
        patientId: dto.patientId,
        encounterId: dto.encounterId,
        providerId: dto.providerId,
        modality: dto.modality,
        bodyPart: dto.bodyPart,
        laterality: dto.laterality,
        protocolName: dto.protocolName,
        clinicalIndication: dto.clinicalIndication,
        priority: dto.priority as any,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        accessionNumber: dto.accessionNumber,
        studyInstanceUid: dto.studyInstanceUid,
      },
      include: {
        Series: {
          include: { Instances: true },
        },
      },
    });
  }

  async updateStudy(id: string, dto: UpdateImagingStudyDto) {
    const existing = await this.prisma.imagingStudy.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Imaging study not found');

    return this.prisma.imagingStudy.update({
      where: { id },
      data: {
        bodyPart: dto.bodyPart,
        laterality: dto.laterality,
        protocolName: dto.protocolName,
        status: dto.status as any,
        clinicalIndication: dto.clinicalIndication,
        technique: dto.technique,
        contrastUsed: dto.contrastUsed,
        contrastAgent: dto.contrastAgent,
        dicomTags: dto.dicomTags ? (dto.dicomTags as Prisma.InputJsonValue) : undefined,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        performedAt: dto.performedAt ? new Date(dto.performedAt) : undefined,
        completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
      },
      include: {
        Series: {
          include: { Instances: true },
        },
      },
    });
  }

  async addSeries(studyId: string, dto: AddSeriesDto) {
    const study = await this.prisma.imagingStudy.findUnique({ where: { id: studyId } });
    if (!study) throw new NotFoundException('Imaging study not found');

    const series = await this.prisma.imagingSeries.create({
      data: {
        studyId,
        seriesInstanceUid: dto.seriesInstanceUid,
        seriesNumber: dto.seriesNumber,
        modality: dto.modality,
        bodyPart: dto.bodyPart,
        laterality: dto.laterality,
        protocolName: dto.protocolName,
        description: dto.description,
        manufacturer: dto.manufacturer,
        deviceModel: dto.deviceModel,
        institutionName: dto.institutionName,
        dicomTags: dto.dicomTags ? (dto.dicomTags as Prisma.InputJsonValue) : undefined,
        instanceCount: dto.instanceCount ?? 0,
        startedAt: dto.startedAt ? new Date(dto.startedAt) : undefined,
        endedAt: dto.endedAt ? new Date(dto.endedAt) : undefined,
      },
    });

    await this.prisma.imagingStudy.update({
      where: { id: studyId },
      data: { seriesCount: { increment: 1 } },
    });

    return series;
  }

  async addInstance(seriesId: string, dto: AddInstanceDto) {
    const series = await this.prisma.imagingSeries.findUnique({ where: { id: seriesId } });
    if (!series) throw new NotFoundException('Imaging series not found');

    const instance = await this.prisma.dicomInstance.create({
      data: {
        seriesId,
        sopInstanceUid: dto.sopInstanceUid,
        instanceNumber: dto.instanceNumber,
        dicomTags: dto.dicomTags ? (dto.dicomTags as Prisma.InputJsonValue) : undefined,
        filePath: dto.filePath,
        fileSizeBytes: dto.fileSizeBytes,
        mimeType: dto.mimeType ?? 'application/dicom',
        thumbnailUrl: dto.thumbnailUrl,
      },
    });

    await this.prisma.imagingSeries.update({
      where: { id: seriesId },
      data: { instanceCount: { increment: 1 } },
    });

    return instance;
  }

  async submitReport(studyId: string, dto: SubmitReportDto) {
    const study = await this.prisma.imagingStudy.findUnique({ where: { id: studyId } });
    if (!study) throw new NotFoundException('Imaging study not found');

    return this.prisma.imagingStudy.update({
      where: { id: studyId },
      data: {
        findings: dto.findings,
        impression: dto.impression,
        recommendations: dto.recommendations,
        reportStatus: (dto.reportStatus ?? 'FINAL') as any,
        reportText: [dto.findings, dto.impression, dto.recommendations].filter(Boolean).join('\n\n'),
        reportedById: dto.reportedById,
        reportedAt: new Date(),
        status: 'COMPLETED',
        completedAt: new Date(),
      },
      include: {
        Series: {
          include: { Instances: true },
        },
      },
    });
  }

  async saveStructuredFindings(
    encounterId: string, patientId: string, providerId: string,
    findings: Array<{ category: string; findingKey: string; findingValue: Record<string, unknown>; severity?: string; status?: string }>,
  ) {
    const enriched = findings.map(f => ({
      ...f, specialtyCode: 'radiology', encounterId, patientId, providerId,
    }));
    return this.base.saveFindings(enriched);
  }

  async getHistory(patientId: string) {
    return this.base.getPatientHistory(patientId, 'radiology');
  }
}
