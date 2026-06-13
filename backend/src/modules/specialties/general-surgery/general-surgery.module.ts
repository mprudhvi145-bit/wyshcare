import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../providers/prisma/prisma.module';
import { SpecialtyBaseModule } from '../shared/specialty-base.module';
import { GeneralSurgeryController } from './general-surgery.controller';
import { GeneralSurgeryService } from './general-surgery.service';

@Module({
  imports: [PrismaModule, SpecialtyBaseModule],
  controllers: [GeneralSurgeryController],
  providers: [GeneralSurgeryService],
  exports: [GeneralSurgeryService],
})
export class GeneralSurgeryModule {}
