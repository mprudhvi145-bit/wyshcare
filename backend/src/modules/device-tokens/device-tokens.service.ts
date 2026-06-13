import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma/prisma.service';

@Injectable()
export class DeviceTokensService {
  private readonly logger = new Logger(DeviceTokensService.name);

  constructor(private readonly prisma: PrismaService) {}

  async register(userId: string, deviceToken: string, platform?: string) {
    const existing = await this.prisma.userDeviceToken.findUnique({
      where: { userId_deviceToken: { userId, deviceToken } },
    });

    if (existing) {
      return this.prisma.userDeviceToken.update({
        where: { id: existing.id },
        data: { platform: platform ?? existing.platform },
      });
    }

    return this.prisma.userDeviceToken.create({
      data: { userId, deviceToken, platform },
    });
  }

  async unregister(userId: string, deviceToken: string) {
    const token = await this.prisma.userDeviceToken.findUnique({
      where: { userId_deviceToken: { userId, deviceToken } },
    });

    if (!token) {
      throw new NotFoundException('Device token not found');
    }

    await this.prisma.userDeviceToken.delete({ where: { id: token.id } });
    return { success: true };
  }

  async getUserTokens(userId: string) {
    return this.prisma.userDeviceToken.findMany({
      where: { userId },
    });
  }

  async removeInvalidToken(deviceToken: string) {
    await this.prisma.userDeviceToken.deleteMany({
      where: { deviceToken },
    });
  }
}
