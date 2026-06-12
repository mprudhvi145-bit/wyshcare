/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/ui/status-badge.tsx
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
 * React component: status-badge
 *
 * Responsibilities:
 * - Render UI components for Frontend
 * - Handle user interactions and state management
 *
 * Used By:
 - frontend/src/app/insurance/claims/page.tsx
 - frontend/src/app/(platform)/health-twin/risk-predictions/page.tsx
 - frontend/src/app/os/reception/page.tsx
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/app/os/billing/page.tsx
 - frontend/src/app/admin/users/page.tsx
 *
 * Calls:
 - badge
 *
 * Dependencies:
 - badge
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Frontend
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

'use client';

import { Badge, type BadgeProps } from '@/components/ui/badge';

type StatusVariant = 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';

const statusVariantMap: Record<string, StatusVariant> = {
  ACTIVE: 'success',
  APPROVED: 'success',
  PAID: 'success',
  COMPLETED: 'success',
  CONFIRMED: 'success',
  PROCESSED: 'success',
  INACTIVE: 'secondary',
  EXPIRED: 'secondary',
  CANCELLED: 'danger',
  REJECTED: 'danger',
  REFUNDED: 'danger',
  NO_SHOW: 'danger',
  FAILED: 'danger',
  DRAFT: 'warning',
  PENDING: 'warning',
  PARTIALLY_PAID: 'warning',
  SCHEDULED: 'warning',
  WAITING: 'warning',
  SUBMITTED: 'default',
  UNDER_REVIEW: 'default',
  CHECKED_IN: 'default',
  IN_PROGRESS: 'default',
};

interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: string;
}

function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const variant = statusVariantMap[status] ?? 'outline';
  const label = status.replace(/_/g, ' ');

  return (
    <Badge variant={variant} className={className} {...props}>
      {label}
    </Badge>
  );
}

export { StatusBadge };
