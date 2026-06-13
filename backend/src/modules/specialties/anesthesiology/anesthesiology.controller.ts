import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AnesthesiologyService } from './anesthesiology.service';


@ApiTags('Specialty: Anesthesiology')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DOCTOR', 'NURSE')
@UseGuards(ThrottlerGuard)
@Controller('specialties/anesthesiology')
export class AnesthesiologyController {
  constructor(private readonly anesthesia: AnesthesiologyService) {}

  @Get('templates')
  @ApiOperation({ summary: 'Get anesthesiology exam templates' })
  getTemplates() { return this.anesthesia.getTemplates(); }

  @Post('encounters')
  @ApiOperation({ summary: 'Save anesthesiology encounter findings' })
  saveEncounter(@Body() body: { encounterId: string; patientId: string; providerId: string; data: Record<string, unknown> }) {
    return this.anesthesia.saveEncounter(body.encounterId, body.patientId, body.providerId, body.data);
  }

  @Get('pre-op/:patientId')
  @ApiOperation({ summary: 'Get pre-operative assessment for patient' })
  getPreOp(@Param('patientId') patientId: string) { return this.anesthesia.getPreOpAssessment(patientId); }

  @Post('assessment')
  @ApiOperation({ summary: 'Submit pre-anesthesia assessment' })
  submitAssessment(@Body() body: { encounterId: string; patientId: string; providerId: string; asaClass: string; airwayAssessment: string; anesthesiaPlan: string; riskFactors: string }) {
    return this.anesthesia.submitAssessment(body);
  }

  @Post('anesthesia-record')
  @ApiOperation({ summary: 'Submit intra-operative anesthesia record' })
  submitAnesthesiaRecord(@Body() body: { encounterId: string; patientId: string; providerId: string; anesthesiaType: string; drugsUsed: string; vitalsMonitoring: string; recoveryNotes: string; complications?: string }) {
    return this.anesthesia.submitAnesthesiaRecord(body);
  }

  @Get('history/:patientId')
  @ApiOperation({ summary: 'Get anesthesia history for patient' })
  getHistory(@Param('patientId') patientId: string) { return this.anesthesia.getHistory(patientId); }
}
