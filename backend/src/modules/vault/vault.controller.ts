/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/vault/vault.controller.ts
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
 * HTTP controller: exposes REST endpoints for vault
 *
 * Responsibilities:
 * - Handle HTTP requests for health locker operations
 * - Validate and transform request/response payloads
 * - Delegate business logic to service layer
 *
 * Used By:
 - backend/src/modules/dashboard/dashboard.controller.ts
 - backend/src/modules/insurance/insurance.controller.ts
 - backend/src/modules/pharmacy/pharmacy.controller.ts
 - backend/src/modules/prescription/prescription.controller.ts
 - backend/src/modules/timeline/timeline.controller.ts
 - backend/src/main.ts
 - backend/src/modules/search/search.controller.ts
 - backend/src/modules/consent/consent.controller.ts
 *
 * Calls:
 - swagger
 - platform-express
 *
 * Dependencies:
 - swagger
 - platform-express
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Health Locker
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

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { VaultService } from './vault.service';

@ApiTags('vault')
@UseGuards(JwtAuthGuard)
@Controller('vault')
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Get('records')
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.vaultService.list(user.userId);
  }

  @Post('records')
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: Record<string, string>) {
    return this.vaultService.createRecord(user.userId, body as never);
  }

  @Post('records/upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
    @Query('recordType') recordType = 'OTHER',
    @Query('title') title?: string,
    @Query('description') description?: string,
  ) {
    return this.vaultService.uploadRecord(user.userId, file, {
      recordType,
      title,
      description,
    });
  }

  @Get('records/:recordId/download-url')
  downloadUrl(@CurrentUser() user: AuthenticatedUser, @Param('recordId') recordId: string) {
    return this.vaultService.getDownloadLink(user.userId, recordId);
  }

  @Get('records/:recordId/download')
  @Public()
  async download(
    @Param('recordId') recordId: string,
    @Query('signature') signature: string,
    @Query('expiresAt') expiresAt: string,
    @Res() response: Response,
  ) {
    const { record, body } = await this.vaultService.downloadRecord(recordId, signature, Number(expiresAt));

    response.setHeader('Content-Type', record.mimeType ?? 'application/octet-stream');
    response.setHeader('Content-Length', String(body.byteLength));
    response.setHeader('Content-Disposition', `attachment; filename="${record.title.replace(/"/g, '')}"`);
    response.send(body);
  }

  @Get('prescriptions')
  prescriptions(@CurrentUser() user: AuthenticatedUser) {
    return this.vaultService.listPrescriptions(user.userId);
  }
}
