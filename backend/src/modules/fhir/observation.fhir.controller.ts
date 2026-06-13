import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FhirService } from './fhir.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fhir/Observation')
export class ObservationFhirController {
  constructor(private readonly fhirService: FhirService) {}

  @Roles('PATIENT', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN')
  @Get()
  async search(@Query() query: Record<string, string>) {
    const category = query.category;
    if (category === 'laboratory' || category === 'lab') {
      return this.fhirService.searchLabObservation(query);
    }
    return this.fhirService.searchObservation(query);
  }

  @Roles('PATIENT', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN')
  @Get(':id')
  async read(@Param('id') id: string) {
    if (id.startsWith('lab-')) {
      return this.fhirService.readLabObservation(id.replace('lab-', ''));
    }
    return this.fhirService.readObservation(id);
  }
}
