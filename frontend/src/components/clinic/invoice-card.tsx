/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/clinic/invoice-card.tsx
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
 * React component: invoice-card
 *
 * Responsibilities:
 * - Render UI components for Frontend
 * - Handle user interactions and state management
 *
 * Used By:
 - frontend/src/app/insurance/claims/page.tsx
 - frontend/src/app/doctor/emr/dermatology/page.tsx
 - frontend/src/components/ui/glass-card.tsx
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 *
 * Calls:
 - status-badge
 - card
 - utils
 - lucide-react
 - separator
 *
 * Dependencies:
 - status-badge
 - card
 - utils
 - lucide-react
 - separator
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

import { FileText, CalendarDays } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Separator } from '@/components/ui/separator';
import type { BillingInvoice } from '@/types';

interface InvoiceCardProps {
  invoice: BillingInvoice;
  onClick?: () => void;
  className?: string;
}

function InvoiceCard({ invoice, onClick, className }: InvoiceCardProps) {
  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {invoice.invoiceNumber}
            </p>
            <p className="text-xs text-slate-500">{invoice.items.length} items</p>
          </div>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      <Separator className="my-4" />

      {/* Line items */}
      <div className="space-y-2">
        {invoice.items.slice(0, 4).map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{item.description}</span>
            <span className="font-medium text-slate-900">
              ₹{item.netPrice.toLocaleString('en-IN')}
            </span>
          </div>
        ))}
        {invoice.items.length > 4 && (
          <p className="text-xs text-slate-400">
            +{invoice.items.length - 4} more items
          </p>
        )}
      </div>

      <Separator className="my-4" />

      {/* Totals */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Subtotal</span>
          <span className="text-slate-900">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Tax</span>
          <span className="text-slate-900">₹{invoice.taxAmount.toLocaleString('en-IN')}</span>
        </div>
        {invoice.discountAmount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Discount</span>
            <span className="text-emerald-600">
              -₹{invoice.discountAmount.toLocaleString('en-IN')}
            </span>
          </div>
        )}
        <Separator />
        <div className="flex items-center justify-between text-sm font-semibold">
          <span className="text-slate-900">Total</span>
          <span className="text-slate-900">₹{invoice.totalAmount.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Paid</span>
          <span className="text-emerald-600">₹{invoice.paidAmount.toLocaleString('en-IN')}</span>
        </div>
        {invoice.dueAmount > 0 && (
          <div className="flex items-center justify-between text-sm font-medium">
            <span className="text-slate-500">Due</span>
            <span className="text-red-500">₹{invoice.dueAmount.toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>

      {invoice.issuedAt && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <CalendarDays className="h-3 w-3" />
          Issued {new Date(invoice.issuedAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      )}
    </Card>
  );
}

export { InvoiceCard };
