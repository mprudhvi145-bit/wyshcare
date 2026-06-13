import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../providers/prisma/prisma.module';
import { SpecialtyBaseModule } from '../shared/specialty-base.module';
import { AnesthesiologyController } from './anesthesiology.controller';
import { AnesthesiologyService } from './anesthesiology.service';

@Module({
  imports: [PrismaModule, SpecialtyBaseModule],
  controllers: [AnesthesiologyController],
  providers: [AnesthesiologyService],
  exports: [AnesthesiologyService],
})
export class AnesthesiologyModule {}
