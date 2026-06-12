/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/specialties/specialties.module.ts
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
 * NestJS module: wires providers, controllers, and imports for specialties
 *
 * Responsibilities:
 * - Configure dependency injection for specialties
 * - Register controllers, services, and providers
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
 - common
 *
 * Dependencies:
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

import { Module } from '@nestjs/common';
import { SpecialtiesController } from './specialties.controller';
import { SpecialtyBaseModule } from './shared/specialty-base.module';
import { DentalModule } from './dental/dental.module';
import { EntModule } from './ent/ent.module';
import { DermatologyModule } from './dermatology/dermatology.module';
import { OphthalmologyModule } from './ophthalmology/ophthalmology.module';
import { GeneralMedicineModule } from './general-medicine/general-medicine.module';
import { CardiologyModule } from './cardiology/cardiology.module';
import { PediatricsModule } from './pediatrics/pediatrics.module';
import { OrthopedicsModule } from './orthopedics/orthopedics.module';
import { GynecologyModule } from './gynecology/gynecology.module';
import { NeurologyModule } from './neurology/neurology.module';
import { PsychiatryModule } from './psychiatry/psychiatry.module';
import { PulmonologyModule } from './pulmonology/pulmonology.module';
import { GastroenterologyModule } from './gastroenterology/gastroenterology.module';
import { UrologyModule } from './urology/urology.module';
import { EndocrinologyModule } from './endocrinology/endocrinology.module';

@Module({
  imports: [
    SpecialtyBaseModule,
    DentalModule,
    EntModule,
    DermatologyModule,
    OphthalmologyModule,
    GeneralMedicineModule,
    CardiologyModule,
    PediatricsModule,
    OrthopedicsModule,
    GynecologyModule,
    NeurologyModule,
    PsychiatryModule,
    PulmonologyModule,
    GastroenterologyModule,
    UrologyModule,
    EndocrinologyModule,
  ],
  controllers: [SpecialtiesController],
  exports: [
    SpecialtyBaseModule,
    DentalModule,
    EntModule,
    DermatologyModule,
    OphthalmologyModule,
    GeneralMedicineModule,
    CardiologyModule,
    PediatricsModule,
    OrthopedicsModule,
    GynecologyModule,
    NeurologyModule,
    PsychiatryModule,
    PulmonologyModule,
    GastroenterologyModule,
    UrologyModule,
    EndocrinologyModule,
  ],
})
export class SpecialtiesModule {}
