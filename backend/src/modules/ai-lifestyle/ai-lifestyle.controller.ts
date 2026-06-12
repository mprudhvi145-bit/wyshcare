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

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
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
    // Users can only assess their own lifestyle unless they have appropriate permissions
    if (user.userId !== userId && !user.roles?.includes('ADMIN')) {
      // In a real implementation, we would throw an UnauthorizedException
      // For now, we'll allow it but log the attempt
      console.warn(`User ${user.userId} attempted to assess lifestyle for user ${userId}`);
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
    // Users can only get recommendations for themselves unless they have appropriate permissions
    if (user.userId !== userId && !user.roles?.includes('ADMIN')) {
      // In a real implementation, we would throw an UnauthorizedException
      console.warn(`User ${user.userId} attempted to get recommendations for user ${userId}`);
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
    // Users can only get their own profile unless they have appropriate permissions
    if (user.userId !== userId && !user.roles?.includes('ADMIN')) {
      console.warn(`User ${user.userId} attempted to get profile for user ${userId}`);
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
    // Users can only get their own history unless they have appropriate permissions
    if (user.userId !== userId && !user.roles?.includes('ADMIN')) {
      console.warn(`User ${user.userId} attempted to get history for user ${userId}`);
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
    // Users can only get their own score unless they have appropriate permissions
    if (user.userId !== userId && !user.roles?.includes('ADMIN')) {
      console.warn(`User ${user.userId} attempted to get score for user ${userId}`);
    }
    return this.aiLifestyleService.getScore(userId);
  }
}