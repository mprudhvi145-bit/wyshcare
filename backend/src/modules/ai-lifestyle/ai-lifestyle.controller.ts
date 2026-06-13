/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-lifestyle/ai-lifestyle.controller.ts
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
 * HTTP controller: exposes REST endpoints for ai-lifestyle
 *
 * Responsibilities:
 * - Handle HTTP requests for ai operations
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
AI
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

import { Body, Controller, ForbiddenException, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { AiLifestyleService } from './ai-lifestyle.service';
import { 
  AssessLifestyleDto, 
  GenerateRecommendationsDto,
  LifestyleScoreDto,
  LifestyleRecommendationDto,
  LifestyleAssessmentHistoryDto
} from './dto/ai-lifestyle.dto';

@ApiTags('ai-lifestyle')
@UseGuards(JwtAuthGuard)
@Controller('ai-lifestyle')
export class AiLifestyleController {
  constructor(private readonly aiLifestyleService: AiLifestyleService) {}

  @Post('assess/:userId')
  @ApiOperation({ summary: 'Assess current lifestyle and generate score' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Lifestyle scores', type: LifestyleScoreDto })
  async assessLifestyle(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string
  ): Promise<LifestyleScoreDto> {
    if (user.userId !== userId && !user.roles?.includes('ADMIN')) {
      throw new ForbiddenException('You can only assess your own lifestyle');
    }
    return this.aiLifestyleService.assessLifestyle(userId);
  }

  @Post('recommendations/:userId')
  @ApiOperation({ summary: 'Generate personalized lifestyle recommendations' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Lifestyle recommendations', type: [LifestyleRecommendationDto] })
  async generateRecommendations(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string,
    @Body() dto: GenerateRecommendationsDto
  ): Promise<LifestyleRecommendationDto[]> {
    if (user.userId !== userId && !user.roles?.includes('ADMIN')) {
      throw new ForbiddenException('You can only generate recommendations for yourself');
    }
    return this.aiLifestyleService.generateRecommendations(userId, dto);
  }

  @Get('profile/:userId')
  @ApiOperation({ summary: 'Get lifestyle profile' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Lifestyle profile' })
  async getProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string
  ) {
    if (user.userId !== userId && !user.roles?.includes('ADMIN')) {
      throw new ForbiddenException('You can only view your own profile');
    }
    return this.aiLifestyleService.getProfile(userId);
  }

  @Get('history/:userId')
  @ApiOperation({ summary: 'Get lifestyle assessment history' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Lifestyle assessment history', type: [LifestyleAssessmentHistoryDto] })
  async getHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string,
    @Param('limit') limit: number = 50
  ) {
    if (user.userId !== userId && !user.roles?.includes('ADMIN')) {
      throw new ForbiddenException('You can only view your own history');
    }
    return this.aiLifestyleService.getHistory(userId, limit);
  }

  @Get('score/:userId')
  @ApiOperation({ summary: 'Get current lifestyle score breakdown' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Current lifestyle scores', type: LifestyleScoreDto })
  async getScore(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string
  ): Promise<LifestyleScoreDto> {
    if (user.userId !== userId && !user.roles?.includes('ADMIN')) {
      throw new ForbiddenException('You can only view your own score');
    }
    return this.aiLifestyleService.getScore(userId);
  }
}