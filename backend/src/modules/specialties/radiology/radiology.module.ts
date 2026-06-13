import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../providers/prisma/prisma.module';
import { SpecialtyBaseModule } from '../shared/specialty-base.module';
import { RadiologyController } from './radiology.controller';
import { RadiologyService } from './radiology.service';

@Module({
  imports: [PrismaModule, SpecialtyBaseModule],
  controllers: [RadiologyController],
  providers: [RadiologyService],
  exports: [RadiologyService],
})
export class RadiologyModule {}
