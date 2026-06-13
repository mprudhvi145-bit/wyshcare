import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GeneralSurgeryService } from './general-surgery.service';


@ApiTags('Specialty: General Surgery')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DOCTOR', 'NURSE')
@UseGuards(ThrottlerGuard)
@Controller('specialties/general-surgery')
export class GeneralSurgeryController {
  constructor(private readonly surgery: GeneralSurgeryService) {}

  @Get('templates')
  @ApiOperation({ summary: 'Get general surgery exam templates' })
  getTemplates() { return this.surgery.getTemplates(); }

  @Post('encounters')
  @ApiOperation({ summary: 'Save general surgery encounter findings' })
  saveEncounter(@Body() body: { encounterId: string; patientId: string; providerId: string; data: Record<string, unknown> }) {
    return this.surgery.saveEncounter(body.encounterId, body.patientId, body.providerId, body.data);
  }

  @Get('patients/:id')
  @ApiOperation({ summary: 'Get surgical patient details' })
  getPatient(@Param('id') id: string) { return this.surgery.getPatientDetails(id); }

  @Get('encounters/:id')
  @ApiOperation({ summary: 'Get surgical encounter details' })
  getEncounter(@Param('id') id: string) { return this.surgery.getEncounterDetails(id); }

  @Post('findings')
  @ApiOperation({ summary: 'Save structured surgical findings' })
  saveFindings(@Body() body: { encounterId: string; patientId: string; providerId: string; findings: Array<{ category: string; findingKey: string; findingValue: Record<string, unknown>; severity?: string; status?: string }> }) {
    return this.surgery.saveStructuredFindings(body.encounterId, body.patientId, body.providerId, body.findings);
  }

  @Post('procedures')
  @ApiOperation({ summary: 'Log a surgical procedure' })
  logProcedure(@Body() body: { encounterId: string; patientId: string; providerId: string; procedureCode: string; procedureName: string; notes: string }) {
    return this.surgery.logProcedure(body);
  }

  @Get('history/:patientId')
  @ApiOperation({ summary: 'Get surgical history for patient' })
  getHistory(@Param('patientId') patientId: string) { return this.surgery.getHistory(patientId); }
}
