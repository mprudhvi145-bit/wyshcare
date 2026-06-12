/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/emergency/emergency.controller.ts
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
 * HTTP controller: exposes REST endpoints for emergency
 *
 * Responsibilities:
 * - Handle HTTP requests for emergency operations
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
 *
 * Dependencies:
 - swagger
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Emergency
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
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { EmergencyService } from './emergency.service';
import { UpdateEmergencyProfileDto } from './dto/update-profile.dto';
import { CreateEmergencyContactDto } from './dto/create-emergency-contact.dto';
import { UpdateEmergencyContactDto } from './dto/update-emergency-contact.dto';
import { ShareLocationDto } from './dto/share-location.dto';
import { GrantAccessDto } from './dto/grant-access.dto';

@ApiTags('Emergency')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('emergency')
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.emergencyService.getOrCreateProfile(user.userId);
  }

  @Put('profile')
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateEmergencyProfileDto,
  ) {
    return this.emergencyService.updateProfile(user.userId, dto);
  }

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  async activateEmergency(@CurrentUser() user: AuthenticatedUser) {
    return this.emergencyService.activateEmergencyMode(user.userId);
  }

  @Post('deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivateEmergency(@CurrentUser() user: AuthenticatedUser) {
    return this.emergencyService.deactivateEmergencyMode(user.userId);
  }

  @Get('contacts')
  async getContacts(@CurrentUser() user: AuthenticatedUser) {
    const profile = await this.emergencyService.getOrCreateProfile(user.userId);
    return this.emergencyService.getContacts(profile.id);
  }

  @Post('contacts')
  async addContact(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateEmergencyContactDto,
  ) {
    const profile = await this.emergencyService.getOrCreateProfile(user.userId);
    return this.emergencyService.addContact(profile.id, user.userId, dto);
  }

  @Put('contacts/:id')
  async updateContact(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') contactId: string,
    @Body() dto: UpdateEmergencyContactDto,
  ) {
    return this.emergencyService.updateContact(contactId, user.userId, dto);
  }

  @Delete('contacts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteContact(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') contactId: string,
  ) {
    await this.emergencyService.deleteContact(contactId, user.userId);
  }

  @Post('location')
  async shareLocation(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ShareLocationDto,
  ) {
    const profile = await this.emergencyService.getOrCreateProfile(user.userId);
    return this.emergencyService.shareLocation(profile.id, user.userId, dto);
  }

  @Get('qr')
  async getEmergencyQR(@CurrentUser() user: AuthenticatedUser) {
    return this.emergencyService.getEmergencyQR(user.userId);
  }

  @Post('access/grant')
  async grantAccess(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: GrantAccessDto,
  ) {
    return this.emergencyService.grantAccess(user.userId, dto);
  }

  @Post('access/revoke/:accessId')
  @HttpCode(HttpStatus.OK)
  async revokeAccess(
    @CurrentUser() user: AuthenticatedUser,
    @Param('accessId') accessId: string,
  ) {
    await this.emergencyService.revokeAccess(accessId, user.userId);
  }
}
