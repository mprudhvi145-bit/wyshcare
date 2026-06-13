/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/auth/auth.controller.ts
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
 * HTTP controller: exposes REST endpoints for auth
 *
 * Responsibilities:
 * - Handle HTTP requests for authentication operations
 * - Validate and transform request/response payloads
 * - Delegate business logic to service layer
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
 - swagger
 - common
 *
 * Dependencies:
 - swagger
 - common
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Authentication
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

import { Body, Controller, Get, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { RefreshSessionDto, RequestOtpDto, VerifyOtpDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/request')
  requestOtp(@Body() input: RequestOtpDto) {
    return this.authService.requestOtp(input.phoneNumber, input.purpose);
  }

  @Post('otp/verify')
  async verifyOtp(@Body() input: VerifyOtpDto, @Res({ passthrough: true }) response: Response) {
    const session = await this.authService.verifyOtp(input.phoneNumber, input.otpCode, input.deviceName, input.fullName);
    const cookies = this.authService.getCookieDescriptors(session);

    response.cookie(cookies.access.name, cookies.access.value, cookies.access.options);
    response.cookie(cookies.refresh.name, cookies.refresh.value, cookies.refresh.options);

    return session;
  }

  @Post('refresh')
  async refresh(
    @Body() input: RefreshSessionDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const rawToken = input.refreshToken || request.cookies?.wyshcare_refresh_token;
    const session = await this.authService.refreshSession(rawToken, input.deviceName);
    const cookies = this.authService.getCookieDescriptors(session);

    response.cookie(cookies.access.name, cookies.access.value, cookies.access.options);
    response.cookie(cookies.refresh.name, cookies.refresh.value, cookies.refresh.options);

    return session;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getCurrentUser(user.userId);
  }

  @Post('mfa/setup')
  @UseGuards(JwtAuthGuard)
  setupMfa(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.setupUserMfa(user.userId);
  }

  @Post('mfa/verify')
  @UseGuards(JwtAuthGuard)
  verifyMfa(
    @CurrentUser() user: AuthenticatedUser,
    @Body('totpCode') totpCode: string,
  ) {
    return this.authService.verifyUserMfa(user.userId, totpCode);
  }

  @Post('mfa/disable')
  @UseGuards(JwtAuthGuard)
  disableMfa(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.disableUserMfa(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.logout(
      user.userId,
      request.cookies?.wyshcare_refresh_token,
      user.sessionId,
    );

    for (const cookie of this.authService.clearCookieDescriptors()) {
      response.clearCookie(cookie.name, cookie.options);
    }

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  sessions(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.listSessions(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('sessions/:sessionId/revoke')
  revokeSession(@CurrentUser() user: AuthenticatedUser, @Param('sessionId') sessionId: string) {
    return this.authService.revokeSession(user.userId, sessionId);
  }
}
