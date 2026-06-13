import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FhirService } from './fhir.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fhir')
export class FhirController {
  constructor(private readonly fhirService: FhirService) {}

  @Roles('PATIENT', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN')
  @Get('metadata')
  async getCapability() {
    return this.fhirService.getCapability();
  }
}
