/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-risk/services/assessors/risk-assessor.interface.ts
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
 * risk-assessor.interface — AI module
 *
 * Responsibilities:
 * - Support ai functionality
 *
 * Used By:
 - backend/src/modules/ai-risk/services/assessors/frailty-risk.assessor.ts
 - backend/src/modules/ai-risk/services/assessors/diabetes-risk.assessor.ts
 - backend/src/modules/ai-risk/services/assessors/readmission-risk.assessor.ts
 - backend/src/modules/ai-risk/services/assessors/hypertension-risk.assessor.ts
 - backend/src/modules/ai-risk/services/assessors/kidney-disease-risk.assessor.ts
 - backend/src/modules/ai-risk/services/assessors/mortality-risk.assessor.ts
 - backend/src/modules/ai-risk/services/assessors/cardiovascular-risk.assessor.ts
 - backend/src/modules/ai-risk/services/assessors/mental-health-risk.assessor.ts
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

import { RiskAssessment } from '../../interfaces/ai-risk.interface';

export interface RiskAssessor {
  assess(data: any): Promise<RiskAssessment>;
}