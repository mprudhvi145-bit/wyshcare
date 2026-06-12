/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/ui/toast.tsx
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
 * React component: toast
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
 - zustand
 - react-toast
 - react
 - utils
 - class-variance-authority
 - lucide-react
 *
 * Dependencies:
 - zustand
 - react-toast
 - react
 - utils
 - class-variance-authority
 - lucide-react
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

import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

import { create } from 'zustand';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-4 right-4 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]',
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.08)] bg-[#15181D]/90 backdrop-blur-xl p-4 shadow-xl transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'text-white',
        success: 'border-[#2EE59D]/30 bg-[#2EE59D]/5 text-[#2EE59D]',
        error: 'border-[#FF5A5A]/30 bg-[#FF5A5A]/5 text-[#FF5A5A]',
        warning: 'border-[#FFD84D]/30 bg-[#FFD84D]/5 text-[#FFD84D]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>,
    VariantProps<typeof toastVariants> {}

const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Root>, ToastProps>(
  ({ className, variant, ...props }, ref) => (
    <ToastPrimitives.Root ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />
  ),
);
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'inline-flex h-9 shrink-0 items-center justify-center rounded-[12px] border border-white/10 bg-transparent px-3 text-xs font-medium text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white disabled:pointer-events-none disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'absolute right-3 top-3 rounded-full p-1 text-white/40 transition-opacity hover:text-white focus:opacity-100 focus:outline-none group-hover:opacity-100',
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="h-3.5 w-3.5" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={cn('text-xs font-semibold font-display', className)} {...props} />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn('text-[10px] text-white/50 font-ui leading-normal', className)} {...props} />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastActionType = 'default' | 'success' | 'error' | 'warning';

interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastActionType;
  duration?: number;
}

interface ToastStore {
  toasts: ToastData[];
  toast: (data: Omit<ToastData, 'id'>) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  toast: (data) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({
      toasts: [...state.toasts, { ...data, id }]
    }));
    const duration = data.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id)
        }));
      }, duration);
    }
  },
  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  }
}));

export function useToast() {
  const toasts = useToastStore((state) => state.toasts);
  const toast = useToastStore((state) => state.toast);
  const dismiss = useToastStore((state) => state.dismiss);
  return { toasts, toast, dismiss };
}

interface ToasterProps {
  toasts: ToastData[];
  dismiss: (id: string) => void;
}

function Toaster({ toasts, dismiss }: ToasterProps) {
  return (
    <ToastProvider>
      {toasts.map((t) => (
        <Toast key={t.id} variant={t.variant} duration={t.duration} onOpenChange={(open) => { if (!open) dismiss(t.id); }}>
          <div className="flex flex-col gap-1">
            {t.title && <ToastTitle>{t.title}</ToastTitle>}
            {t.description && <ToastDescription>{t.description}</ToastDescription>}
          </div>
          <ToastClose onClick={() => dismiss(t.id)} />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}

export { type ToastProps, type ToastActionType, type ToastData, type ToasterProps, ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastAction, ToastClose, Toaster };
