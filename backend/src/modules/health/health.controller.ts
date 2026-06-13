import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { RedisService } from '../../providers/redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get('live')
  getLive() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  async getReady() {
    const checks: Record<string, string> = {};
    let healthy = true;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = 'ok';
    } catch {
      checks.database = 'error';
      healthy = false;
    }

    try {
      const result = await this.redis.healthcheck();
      checks.redis = result.status;
      if (result.status !== 'ok') healthy = false;
    } catch {
      checks.redis = 'error';
      healthy = false;
    }

    return {
      status: healthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    };
  }
}
