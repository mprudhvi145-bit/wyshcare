import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FhirService } from './fhir.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fhir/MedicationRequest')
export class MedicationRequestFhirController {
  constructor(private readonly fhirService: FhirService) {}

  @Roles('PATIENT', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN')
  @Get()
  async search(@Query() query: Record<string, string>) {
    return this.fhirService.searchMedicationRequest(query);
  }

  @Roles('PATIENT', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN')
  @Get(':id')
  async read(@Param('id') id: string) {
    return this.fhirService.readMedicationRequest(id);
  }
}
