import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { DeviceTokensService } from './device-tokens.service';
import { RegisterDeviceDto } from './dto/register-device.dto';

@ApiTags('devices')
@UseGuards(JwtAuthGuard)
@Controller('devices')
export class DeviceTokensController {
  constructor(private readonly deviceTokens: DeviceTokensService) {}

  @Post('register')
  register(@CurrentUser() user: AuthenticatedUser, @Body() dto: RegisterDeviceDto) {
    return this.deviceTokens.register(user.userId, dto.deviceToken, dto.platform);
  }

  @Delete('unregister')
  unregister(@CurrentUser() user: AuthenticatedUser, @Body() dto: RegisterDeviceDto) {
    return this.deviceTokens.unregister(user.userId, dto.deviceToken);
  }

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.deviceTokens.getUserTokens(user.userId);
  }
}
