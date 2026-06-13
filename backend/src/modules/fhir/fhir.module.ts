import { Module } from '@nestjs/common';
import { PrismaModule } from '../../providers/prisma/prisma.module';
import { FhirService } from './fhir.service';
import { FhirController } from './fhir.controller';
import { PatientFhirController } from './patient.fhir.controller';
import { ObservationFhirController } from './observation.fhir.controller';
import { MedicationRequestFhirController } from './medication-request.fhir.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    FhirController,
    PatientFhirController,
    ObservationFhirController,
    MedicationRequestFhirController,
  ],
  providers: [FhirService],
  exports: [FhirService],
})
export class FhirModule {}
