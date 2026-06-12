/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/specialties/specialties.controller.ts
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
 * HTTP controller: exposes REST endpoints for specialties
 *
 * Responsibilities:
 * - Handle HTTP requests for wyshid operations
 * - Validate and transform request/response payloads
 * - Delegate business logic to service layer
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
 - swagger
 - core
 - common
 *
 * Dependencies:
 - swagger
 - core
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

import { Controller, Get, Post, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ModuleRef } from '@nestjs/core';
import { SpecialtyBaseService } from './shared/specialty-base.service';
import { CreateSpecialtyEncounterDto } from './shared/dto/specialty.dto';
import { DentalService } from './dental/dental.service';
import { EntService } from './ent/ent.service';
import { DermatologyService } from './dermatology/dermatology.service';
import { OphthalmologyService } from './ophthalmology/ophthalmology.service';
import { CardiologyService } from './cardiology/cardiology.service';
import { PediatricsService } from './pediatrics/pediatrics.service';
import { OrthopedicsService } from './orthopedics/orthopedics.service';
import { GynecologyService } from './gynecology/gynecology.service';
import { NeurologyService } from './neurology/neurology.service';
import { PsychiatryService } from './psychiatry/psychiatry.service';
import { PulmonologyService } from './pulmonology/pulmonology.service';
import { GastroenterologyService } from './gastroenterology/gastroenterology.service';
import { UrologyService } from './urology/urology.service';
import { EndocrinologyService } from './endocrinology/endocrinology.service';

const SPECIALTIES = [
  { code: 'general-medicine', name: 'General Medicine', icon: 'Stethoscope', description: 'SOAP notes, checkups, preventive care', color: '#8FD3D1' },
  { code: 'ent', name: 'ENT (Ear, Nose, Throat)', icon: 'Ear', description: 'Ear exams, audiometry, nasal endoscopy, throat evaluation', color: '#2EE59D' },
  { code: 'dental', name: 'Dental', icon: 'Bone', description: 'Tooth charting, periodontal exam, procedures, X-rays', color: '#FFD84D' },
  { code: 'dermatology', name: 'Skin & Hair', icon: 'ScanFace', description: 'Body mapping, hair analysis, cosmetic procedures', color: '#FF5A5A' },
  { code: 'ophthalmology', name: 'Ophthalmology', icon: 'Eye', description: 'Vision tests, retina, cornea, cataract, glaucoma', color: '#5856D6' },
  { code: 'cardiology', name: 'Cardiology', icon: 'Heart', description: 'ECG, echocardiography, cardiac assessment', color: '#FF2D55' },
  { code: 'pediatrics', name: 'Pediatrics', icon: 'Baby', description: 'Growth charts, immunization, pediatric SOAP', color: '#34C759' },
  { code: 'orthopedics', name: 'Orthopedics', icon: 'Bone', description: 'Fracture assessment, joint exam, X-ray review', color: '#AF52DE' },
  { code: 'gynecology', name: 'Gynecology', icon: 'Venus', description: 'OB/GYN exams, prenatal care, pap smear', color: '#FF6482' },
  { code: 'neurology', name: 'Neurology', icon: 'Brain', description: 'Neurological exam, reflex assessment, imaging', color: '#9B59B6' },
  { code: 'psychiatry', name: 'Psychiatry', icon: 'Brain', description: 'Mental health assessment, therapy notes, scales', color: '#E67E22' },
  { code: 'pulmonology', name: 'Pulmonology', icon: 'ScanSearch', description: 'PFT, spirometry, respiratory assessment', color: '#3498DB' },
  { code: 'gastroenterology', name: 'Gastroenterology', icon: 'ScanLine', description: 'Endoscopy, GI assessment, liver evaluation', color: '#F39C12' },
  { code: 'urology', name: 'Urology', icon: 'Scan', description: 'Urological exam, diagnostics, procedures', color: '#1ABC9C' },
  { code: 'endocrinology', name: 'Endocrinology', icon: 'Activity', description: 'Hormone assessment, diabetes management, thyroid', color: '#E74C3C' },
];

@ApiTags('Specialties')
@ApiBearerAuth()
@Controller('specialties')
export class SpecialtiesController {
  constructor(
    private readonly base: SpecialtyBaseService,
    private readonly moduleRef: ModuleRef,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all available specialties' })
  listAll() { return SPECIALTIES; }

  @Post(':code/encounters')
  @ApiOperation({ summary: 'Save encounter data + structured findings for any specialty' })
  async saveEncounter(
    @Param('code') code: string,
    @Body() body: CreateSpecialtyEncounterDto & { findings?: Array<{
      category: string; findingKey: string; findingValue: Record<string, unknown>;
      severity?: string; status?: string;
    }> },
  ) {
    const validCodes = SPECIALTIES.map(s => s.code);
    if (!validCodes.includes(code)) {
      throw new BadRequestException(`Unknown specialty code: ${code}`);
    }

    // Delegate to specialty-specific services if they exist
    if (code === 'dental') {
      const dentalService = this.moduleRef.get(DentalService, { strict: false });
      return dentalService.saveToothFindings(body.encounterId, body.patientId, body.providerId, body.data);
    }
    if (code === 'ent') {
      const entService = this.moduleRef.get(EntService, { strict: false });
      return entService.saveEntEncounter(body.encounterId, body.patientId, body.providerId, body.data);
    }
    if (code === 'dermatology') {
      const dermService = this.moduleRef.get(DermatologyService, { strict: false });
      return dermService.saveDermatologyEncounter(body.encounterId, body.patientId, body.providerId, body.data);
    }
    if (code === 'ophthalmology') {
      const ophService = this.moduleRef.get(OphthalmologyService, { strict: false });
      return ophService.saveOphthalmologyEncounter(body.encounterId, body.patientId, body.providerId, body.data);
    }

    const serviceMap: Record<string, any> = {
      cardiology: CardiologyService,
      pediatrics: PediatricsService,
      orthopedics: OrthopedicsService,
      gynecology: GynecologyService,
      neurology: NeurologyService,
      psychiatry: PsychiatryService,
      pulmonology: PulmonologyService,
      gastroenterology: GastroenterologyService,
      urology: UrologyService,
      endocrinology: EndocrinologyService,
    };

    const serviceClass = serviceMap[code];
    if (serviceClass) {
      const service = this.moduleRef.get(serviceClass, { strict: false });
      return service.saveEncounter(body.encounterId, body.patientId, body.providerId, body.data);
    }

    const findings = (body.findings ?? []).map(f => ({
      specialtyCode: code,
      encounterId: body.encounterId,
      patientId: body.patientId,
      providerId: body.providerId,
      category: f.category,
      findingKey: f.findingKey,
      findingValue: f.findingValue,
      severity: f.severity,
      status: f.status,
    }));

    return this.base.saveEncounterWithFindings({
      specialtyCode: code,
      encounterId: body.encounterId,
      patientId: body.patientId,
      providerId: body.providerId,
      templateId: body.templateId,
      formData: body.data,
      diagrams: body.diagrams,
      findings,
    });
  }

  @Get(':code/history/:patientId')
  @ApiOperation({ summary: 'Get encounter history for a patient in a specialty' })
  getHistory(@Param('code') code: string, @Param('patientId') patientId: string) {
    return this.base.getPatientHistory(patientId, code);
  }

  @Get(':code/findings/:patientId')
  @ApiOperation({ summary: 'Get structured findings for a patient in a specialty' })
  getFindings(
    @Param('code') code: string,
    @Param('patientId') patientId: string,
    @Query('category') category?: string,
  ) {
    if (category) {
      return this.base.getFindingsByCategory(patientId, code, category);
    }
    return this.base.getFindings(patientId, code);
  }
}
