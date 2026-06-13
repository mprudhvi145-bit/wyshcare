import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RadiologyService } from './radiology.service';

@ApiTags('Specialty: Radiology')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
@Roles('DOCTOR', 'NURSE')
@Controller('specialties/radiology')
export class RadiologyController {
  constructor(private readonly radiology: RadiologyService) {}

  @Get('templates')
  @ApiOperation({ summary: 'Get radiology report templates' })
  getTemplates() { return this.radiology.getTemplates(); }

  @Post('encounters')
  @ApiOperation({ summary: 'Save radiology encounter findings' })
  saveEncounter(@Body() body: { encounterId: string; patientId: string; providerId: string; data: Record<string, unknown> }) {
    return this.radiology.saveEncounter(body.encounterId, body.patientId, body.providerId, body.data);
  }

  @Get('studies/:patientId')
  @ApiOperation({ summary: 'Get imaging studies for a patient' })
  getPatientStudies(@Param('patientId') patientId: string) {
    return this.radiology.getPatientStudies(patientId);
  }

  @Get('study/:id')
  @ApiOperation({ summary: 'Get single imaging study with series and instances' })
  getStudy(@Param('id') id: string) {
    return this.radiology.getStudy(id);
  }

  @Post('study')
  @ApiOperation({ summary: 'Create a new imaging study order' })
  createStudy(@Body() body: {
    patientId: string; encounterId: string; providerId: string;
    modality: string; bodyPart?: string; laterality?: string;
    protocolName?: string; clinicalIndication?: string;
    priority?: 'ROUTINE' | 'URGENT' | 'STAT' | 'ASAP' | 'TIMED';
    scheduledAt?: string; accessionNumber?: string; studyInstanceUid?: string;
  }) {
    return this.radiology.createStudy(body);
  }

  @Patch('study/:id')
  @ApiOperation({ summary: 'Update imaging study details' })
  updateStudy(@Param('id') id: string, @Body() body: {
    bodyPart?: string; laterality?: string; protocolName?: string;
    status?: 'ORDERED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ENTERED_IN_ERROR';
    clinicalIndication?: string; technique?: string;
    contrastUsed?: boolean; contrastAgent?: string;
    dicomTags?: Record<string, unknown>;
    scheduledAt?: string; performedAt?: string; completedAt?: string;
  }) {
    return this.radiology.updateStudy(id, body);
  }

  @Post('study/:id/series')
  @ApiOperation({ summary: 'Add a series to an imaging study' })
  addSeries(@Param('id') studyId: string, @Body() body: {
    seriesInstanceUid?: string; seriesNumber?: number;
    modality: string; bodyPart?: string; laterality?: string;
    protocolName?: string; description?: string;
    manufacturer?: string; deviceModel?: string; institutionName?: string;
    dicomTags?: Record<string, unknown>; instanceCount?: number;
    startedAt?: string; endedAt?: string;
  }) {
    return this.radiology.addSeries(studyId, body);
  }

  @Post('series/:id/instance')
  @ApiOperation({ summary: 'Add a DICOM instance to a series' })
  addInstance(@Param('id') seriesId: string, @Body() body: {
    sopInstanceUid?: string; instanceNumber?: number;
    dicomTags?: Record<string, unknown>;
    filePath?: string; fileSizeBytes?: number;
    mimeType?: string; thumbnailUrl?: string;
  }) {
    return this.radiology.addInstance(seriesId, body);
  }

  @Post('study/:id/report')
  @ApiOperation({ summary: 'Submit radiology report for a study' })
  submitReport(@Param('id') studyId: string, @Body() body: {
    findings: string; impression: string; recommendations?: string;
    reportStatus?: 'PENDING' | 'DRAFT' | 'FINAL' | 'AMENDED' | 'CANCELLED';
    reportedById: string;
  }) {
    return this.radiology.submitReport(studyId, body);
  }

  @Post('findings')
  @ApiOperation({ summary: 'Save structured radiology findings' })
  saveFindings(@Body() body: {
    encounterId: string; patientId: string; providerId: string;
    findings: Array<{ category: string; findingKey: string; findingValue: Record<string, unknown>; severity?: string; status?: string }>;
  }) {
    return this.radiology.saveStructuredFindings(body.encounterId, body.patientId, body.providerId, body.findings);
  }

  @Get('history/:patientId')
  @ApiOperation({ summary: 'Get radiology history for patient' })
  getHistory(@Param('patientId') patientId: string) {
    return this.radiology.getHistory(patientId);
  }
}
