/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-risk/interfaces/ai-risk.interface.ts
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
 * ai-risk.interface — AI module
 *
 * Responsibilities:
 * - Support ai functionality
 *
 * Used By:
 - Standalone (not imported by other source files)
 *
 * Calls:
 - None identified
 *
 * Dependencies:
 - None identified
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

export interface RiskAssessment {
  riskScore: number; // 0-1
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  drivers: string[];
  recommendedActions: string[];
  modelVersion: string;
}

export interface RiskAssessments {
  [riskType: string]: RiskAssessment;
}

export interface RiskPredictionData {
  userId: string;
  riskType: string;
  riskScore: number;
  riskLevel: string;
  drivers: string[];
  recommendedActions: string[];
  modelVersion: string;
  predictionType?: string;
  twinId?: string;
  expiresAt: Date | null;
}

export interface RiskHistoryResponse {
  predictions: Array<{
    id: string;
    riskType: string;
    riskScore: number;
    riskLevel: string;
    drivers: string[];
    recommendedActions: string[];
    calculatedAt: Date;
    expiresAt: Date | null;
  }>;
  totalCount: number;
}