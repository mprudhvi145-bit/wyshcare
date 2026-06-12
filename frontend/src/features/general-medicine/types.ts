/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/features/general-medicine/types.ts
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
 * types — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
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

import type { PatientChartResponse, SoapNote } from '@/types';

export const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';
export const glassInput = 'w-full rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/30 font-ui focus:outline-none focus:border-[#8FD3D1]/30 focus:bg-white/[0.05] transition-all';
export const glassTextarea = 'w-full rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] p-3 text-sm text-white placeholder:text-white/30 font-ui focus:outline-none focus:border-[#8FD3D1]/30 focus:bg-white/[0.05] transition-all resize-none';

export const priorityColors: Record<string, string> = {
  HIGH: 'text-[#FF5A5A] bg-[#FF5A5A]/10 border-[#FF5A5A]/20',
  MEDIUM: 'text-[#FFD84D] bg-[#FFD84D]/10 border-[#FFD84D]/20',
  LOW: 'text-[#8FD3D1] bg-[#8FD3D1]/10 border-[#8FD3D1]/20',
};

export const severityMap = (s?: string): 'HIGH' | 'MEDIUM' | 'LOW' => {
  if (!s) return 'LOW';
  const up = s.toUpperCase();
  if (['HIGH', 'CRITICAL', 'SEVERE'].includes(up)) return 'HIGH';
  if (['MEDIUM', 'MODERATE'].includes(up)) return 'MEDIUM';
  return 'LOW';
};

export const accent = '#8FD3D1';
