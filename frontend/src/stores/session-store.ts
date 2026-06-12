/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/stores/session-store.ts
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
 * session-store — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - frontend/src/stores/dental-workspace-store.ts
 - frontend/src/components/ui/toast.tsx
 - frontend/src/stores/patient-store.ts
 *
 * Calls:
 - middleware
 - zustand
 *
 * Dependencies:
 - middleware
 - zustand
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

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Stores only non-sensitive identity data for UI rendering.
 * Tokens are NOT stored here — they live exclusively in httpOnly cookies
 * set by the backend. sessionStorage is used so data is cleared on tab close.
 */
type SessionState = {
  user?: {
    id: string;
    wyshId: string;
    fullName: string;
    roles: string[];
  };
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  setSession: (session: { user: SessionState['user'] }) => void;
  clearSession: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
      setSession: ({ user }) => set({ user }),
      clearSession: () => set({ user: undefined }),
    }),
    {
      name: 'wyshcare-session',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.sessionStorage : localStorage,
      ),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
