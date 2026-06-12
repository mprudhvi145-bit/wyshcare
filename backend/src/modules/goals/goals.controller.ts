/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/goals/goals.controller.ts
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
 * HTTP controller: exposes REST endpoints for goals
 *
 * Responsibilities:
 * - Handle HTTP requests for wyshid operations
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
 - backend/src/modules/goals/goals.module.ts
 - backend/src/modules/search/search.controller.ts
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
WyshID
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
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { GoalsService } from './goals.service';
import { CreateGoalDto, UpdateGoalProgressDto, CreateMilestoneDto } from './dto/create-goal.dto';

@ApiTags('goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.goalsService.list(user.userId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
    });
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateGoalDto,
  ) {
    return this.goalsService.create(user.userId, dto);
  }

  @Patch(':id')
  updateProgress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateGoalProgressDto,
  ) {
    return this.goalsService.updateProgress(user.userId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.goalsService.remove(user.userId, id);
  }

  @Get(':id/milestones')
  getMilestones(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.goalsService.getMilestones(user.userId, id);
  }

  @Post(':id/milestones')
  addMilestone(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CreateMilestoneDto,
  ) {
    return this.goalsService.addMilestone(user.userId, id, dto);
  }

  @Patch(':id/progress')
  updateGoalProgress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateGoalProgressDto,
  ) {
    return this.goalsService.recordProgress(user.userId, id, dto);
  }
}
