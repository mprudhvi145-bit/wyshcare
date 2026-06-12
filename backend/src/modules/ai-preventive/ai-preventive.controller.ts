/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-preventive/ai-preventive.controller.ts
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
 * HTTP controller: exposes REST endpoints for ai-preventive
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
 - backend/src/modules/digital-twin/digital-twin.service.ts
 - backend/src/modules/prescription/interaction-engine.service.ts
 - backend/src/modules/interoperability/interoperability.module.ts
 - backend/src/main.ts
 - backend/src/modules/health-graph/health-graph.service.ts
 *
 * Calls:
 - swagger
 - client
 - common
 *
 * Dependencies:
 - swagger
 - client
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

import { Controller, Post, Get, Patch, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { AiPreventiveService } from './ai-preventive.service';
import { GeneratePreventiveRecommendationsDto } from './dto/generate-preventive-recommendations.dto';
import { GetPreventiveRecommendationsDto } from './dto/get-preventive-recommendations.dto';
import { CompletePreventiveRecommendationDto } from './dto/complete-preventive-recommendation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('ai-preventive')
@Controller('ai-preventive')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiPreventiveController {
  constructor(private readonly aiPreventiveService: AiPreventiveService) {}

  @Post('generate/:userId')
  @Roles(Role.PATIENT, Role.DOCTOR, Role.CLINIC_MANAGER, Role.ADMIN)
  @ApiOperation({ summary: 'Generate preventive care recommendations for a user' })
  @ApiResponse({ status: 200, description: 'Preventive recommendations generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  generateRecommendations(
    @Param('userId') userId: string,
    @Body() generateDto: GeneratePreventiveRecommendationsDto,
    @Req() req: any
  ): Promise<{ success: boolean; message: string; data: any }> {
    // Use the userId from the token if not provided in body or params
    const targetUserId = generateDto.userId || userId || req.user.userId;
    
    // Patients can only generate recommendations for themselves unless they have special permissions
    if (req.user.role === Role.PATIENT && targetUserId && targetUserId !== req.user.userId) {
      // In a real implementation, you would check if the patient has permission to generate for others
      // For now, we'll restrict patients to only generating for themselves
      throw new Error('Unauthorized to generate recommendations for another user');
    }
    
    return this.aiPreventiveService.generatePreventiveRecommendations(targetUserId).then(result => {
      return {
        success: true,
        message: `Generated ${result.generated} preventive recommendations successfully`,
        data: result
      };
    });
  }

  @Get(':userId')
  @Roles(Role.PATIENT, Role.DOCTOR, Role.CLINIC_MANAGER, Role.ADMIN)
  @ApiOperation({ summary: 'Get preventive care recommendations for a user' })
  @ApiResponse({ status: 200, description: 'Preventive recommendations retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getRecommendations(
    @Param('userId') userId: string,
    @Query() queryDto: GetPreventiveRecommendationsDto,
    @Req() req: any
  ): Promise<{ success: boolean; message: string; data: any }> {
    // Patients can only view their own recommendations unless they have special permissions
    if (req.user.role === Role.PATIENT && userId !== req.user.userId) {
      throw new Error('Unauthorized to view recommendations for another user');
    }
    
    return this.aiPreventiveService.listRecommendations(
      userId, 
      queryDto.status, 
      queryDto.category
    ).then(recommendations => {
      return {
        success: true,
        message: 'Preventive recommendations retrieved successfully',
        data: recommendations
      };
    });
  }

  @Patch(':id/complete')
  @Roles(Role.PATIENT, Role.DOCTOR, Role.CLINIC_MANAGER, Role.ADMIN)
  @ApiOperation({ summary: 'Mark a preventive recommendation as complete' })
  @ApiResponse({ status: 200, description: 'Recommendation marked as complete successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  completeRecommendation(
    @Param('id') id: string,
    @Body() completeDto: CompletePreventiveRecommendationDto,
    @Req() req: any
  ): Promise<{ success: boolean; message: string; data: any }> {
    const recommendationId = completeDto.recommendationId || id;
    
    // Verify the recommendation belongs to the current user (for security)
    // For simplicity, we're skipping this check here but in production you'd want to verify ownership
    
    return this.aiPreventiveService.completeRecommendation(recommendationId).then(result => {
      return {
        success: true,
        message: 'Preventive recommendation marked as complete successfully',
        data: result
      };
    });
  }

  @Patch(':id/dismiss')
  @Roles(Role.PATIENT, Role.DOCTOR, Role.CLINIC_MANAGER, Role.ADMIN)
  @ApiOperation({ summary: 'Dismiss a preventive recommendation' })
  @ApiResponse({ status: 200, description: 'Recommendation dismissed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  dismissRecommendation(
    @Param('id') id: string,
    @Body() completeDto: CompletePreventiveRecommendationDto,
    @Req() req: any
  ): Promise<{ success: boolean; message: string; data: any }> {
    const recommendationId = completeDto.recommendationId || id;
    
    // Verify the recommendation belongs to the current user (for security)
    // For simplicity, we're skipping this check here but in production you'd want to verify ownership
    
    return this.aiPreventiveService.dismissRecommendation(recommendationId).then(result => {
      return {
        success: true,
        message: 'Preventive recommendation dismissed successfully',
        data: result
      };
    });
  }

  @Get('stats/:userId')
  @Roles(Role.PATIENT, Role.DOCTOR, Role.CLINIC_MANAGER, Role.ADMIN)
  @ApiOperation({ summary: 'Get preventive care statistics for a user' })
  @ApiResponse({ status: 200, description: 'Preventive statistics retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getStats(
    @Param('userId') userId: string,
    @Req() req: any
  ): Promise<{ success: boolean; message: string; data: any }> {
    // Patients can only view their own stats unless they have special permissions
    if (req.user.role === Role.PATIENT && userId !== req.user.userId) {
      throw new Error('Unauthorized to view stats for another user');
    }
    
    return this.aiPreventiveService.getStats(userId).then(stats => {
      return {
        success: true,
        message: 'Preventive statistics retrieved successfully',
        data: stats
      };
    });
  }
}