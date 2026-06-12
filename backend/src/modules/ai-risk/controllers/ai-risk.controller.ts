/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-risk/controllers/ai-risk.controller.ts
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
 * HTTP controller: exposes REST endpoints for controllers
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

import { Controller, Post, Get, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AIRiskPredictionService } from '../services/ai-risk-prediction.service';
import { AssessRiskDto } from '../dto/assess-risk.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('ai-risk')
@Controller('ai-risk')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AIRiskController {
  constructor(private readonly aiRiskService: AIRiskPredictionService) {}

  @Post('assess')
  @Roles('PATIENT', 'DOCTOR', 'CLINIC_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Assess all risk types for a user' })
  @ApiResponse({ status: 200, description: 'Risk assessments completed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  assessRisks(
    @Body() assessRiskDto: AssessRiskDto,
    @Req() req: any
  ): Promise<{ success: boolean; message: string; data: any }> {
    // Use the userId from the token if not provided in body
    const userId = assessRiskDto.userId || req.user.userId;
    
    // Patients can only assess their own risks unless they have special permissions
    if (req.user.role === Role.PATIENT && assessRiskDto.userId && assessRiskDto.userId !== req.user.userId) {
      // In a real implementation, you would check if the patient has permission to assess others' risks
      // For now, we'll restrict patients to only assessing their own risks
      throw new Error('Unauthorized to assess risks for another user');
    }
    
    return this.aiRiskService.assessAllRisks(userId).then(assessments => {
      return this.aiRiskService.savePredictions(userId, assessments).then(() => {
        return {
          success: true,
          message: 'Risk assessments completed and saved successfully',
          data: assessments
        };
      });
    });
  }

  @Get('history/:userId')
  @Roles('PATIENT', 'DOCTOR', 'CLINIC_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Get risk history for a user' })
  @ApiResponse({ status: 200, description: 'Risk history retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getRiskHistory(
    @Param('userId') userId: string,
    @Query('limit') limit: number = 50,
    @Req() req: any
  ): Promise<{ success: boolean; message: string; data: any }> {
    // Patients can only view their own history unless they have special permissions
    if (req.user.role === Role.PATIENT && userId !== req.user.userId) {
      throw new Error('Unauthorized to view risk history for another user');
    }
    
    return this.aiRiskService.getHistory(userId, limit).then(history => {
      return {
        success: true,
        message: 'Risk history retrieved successfully',
        data: history
      };
    });
  }

  @Get('latest/:userId')
  @Roles('PATIENT', 'DOCTOR', 'CLINIC_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Get latest risk predictions for a user' })
  @ApiResponse({ status: 200, description: 'Latest risk predictions retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getLatestRisks(
    @Param('userId') userId: string,
    @Req() req: any
  ): Promise<{ success: boolean; message: string; data: any }> {
    // Patients can only view their own latest risks unless they have special permissions
    if (req.user.role === Role.PATIENT && userId !== req.user.userId) {
      throw new Error('Unauthorized to view latest risks for another user');
    }
    
    return this.aiRiskService.getLatest(userId).then(latest => {
      return {
        success: true,
        message: 'Latest risk predictions retrieved successfully',
        data: latest
      };
    });
  }
}