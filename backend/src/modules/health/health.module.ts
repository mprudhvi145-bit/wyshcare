import { Module } from '@nestjs/common';
import { PrismaModule } from '../../providers/prisma/prisma.module';
import { RedisModule } from '../../providers/redis/redis.module';
import { HealthController } from './health.controller';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [HealthController],
})
export class HealthModule {}
