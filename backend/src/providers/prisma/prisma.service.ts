import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createEncryptionExtension } from './prisma-encryption.middleware';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    Object.assign(this, this.$extends(createEncryptionExtension()));
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
