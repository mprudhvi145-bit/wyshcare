/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/common/interfaces/authenticated-user.interface.ts
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
 * authenticated-user.interface — Authentication module
 *
 * Responsibilities:
 * - Support authentication functionality
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

import type { Role } from '@wyshcare/shared';

export interface AuthenticatedUser {
  userId: string;
  phoneNumber: string;
  roles: Role[];
  sessionId?: string;
  tenantId?: string;
  mfaVerified?: boolean;
}
