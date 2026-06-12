/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/specialties/dental/radiography-panel.tsx
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
 * React component: radiography-panel
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
 - utils
 - lucide-react
 - react
 *
 * Dependencies:
 - utils
 - lucide-react
 - react
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

import { useState } from 'react';
import { Microscope, Upload, Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const accentColor = '#FFD84D';
const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';

interface Radiograph {
  id: string;
  view: string;
  date: string;
  tooth?: number;
  thumbnail?: string;
}

const MOCK_STUDIES: Radiograph[] = [
  { id: 'rx-001', view: 'Periapical #26', date: '2026-06-11', tooth: 26 },
  { id: 'rx-002', view: 'Bitewings (4 films)', date: '2026-06-11' },
  { id: 'rx-003', view: 'Panoramic', date: '2026-05-28' },
  { id: 'rx-004', view: 'Periapical #18', date: '2026-05-28', tooth: 18 },
  { id: 'rx-005', view: 'Cephalometric', date: '2026-04-15' },
  { id: 'rx-006', view: 'CBCT Mandible', date: '2026-03-20' },
];

export function RadiographyPanel() {
  const [studies] = useState<{ current: Radiograph[]; previous: Radiograph[] }>({
    current: MOCK_STUDIES.filter((s) => s.date >= '2026-06-01'),
    previous: MOCK_STUDIES.filter((s) => s.date < '2026-06-01'),
  });
  const [viewerOpen, setViewerOpen] = useState<Radiograph | null>(null);

  return (
    <>
      <div className={cn(glassCard, 'p-5')}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Microscope className="h-4 w-4" style={{ color: accentColor }} />
            <h3 className="text-base font-semibold text-white font-display">Radiographs</h3>
            <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[9px] text-white/50 font-ui">{MOCK_STUDIES.length} studies</span>
          </div>
          <button className="flex items-center gap-1.5 rounded-[10px] bg-white/[0.05] px-3 py-1.5 text-[10px] font-medium text-white/60 font-ui hover:bg-white/[0.08] transition-all">
            <Upload className="h-3 w-3" />
            Upload
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-[10px] font-semibold text-white/30 font-ui tracking-wider uppercase mb-2">This Visit</h4>
            <div className="grid grid-cols-3 gap-3">
              {studies.current.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setViewerOpen(s)}
                  className="group relative aspect-[4/3] rounded-[14px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] flex flex-col items-center justify-center hover:bg-white/[0.04] hover:border-[#FFD84D]/30 transition-all cursor-pointer"
                >
                  <Microscope className="h-6 w-6 text-white/20 group-hover:text-white/40 mb-1 transition-all" />
                  <span className="text-[9px] text-white/30 font-ui group-hover:text-white/50 transition-all">{s.view}</span>
                  {s.tooth && (
                    <span className="mt-1 rounded-full bg-[#FFD84D]/10 px-1.5 py-0.5 text-[7px] text-[#FFD84D] font-ui">#{s.tooth}</span>
                  )}
                  <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-all">
                    <Maximize2 className="h-3 w-3 text-white/40" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {studies.previous.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold text-white/30 font-ui tracking-wider uppercase mb-2">Previous</h4>
              <div className="space-y-2">
                {studies.previous.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setViewerOpen(s)}
                    className="flex items-center gap-3 w-full rounded-[12px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] px-3 py-2.5 hover:bg-white/[0.04] transition-all text-left"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-white/[0.04]">
                      <Microscope className="h-3.5 w-3.5 text-white/30" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-white/70 font-ui truncate">{s.view}</p>
                      <p className="text-[9px] text-white/30 font-ui">{s.date}</p>
                    </div>
                    {s.tooth && (
                      <span className="rounded-full bg-white/[0.04] px-1.5 py-0.5 text-[8px] text-white/30 font-ui">#{s.tooth}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {viewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setViewerOpen(null)}>
          <div className="relative w-full max-w-3xl mx-4 rounded-2xl bg-[#15181D] border border-[rgba(255,255,255,0.08)] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white font-display">{viewerOpen.view}</h3>
              <button onClick={() => setViewerOpen(null)} className="rounded-lg p-1.5 text-white/30 hover:text-white/60">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="aspect-[4/3] rounded-xl bg-white/[0.02] border border-[rgba(255,255,255,0.06)] flex items-center justify-center">
              <Microscope className="h-12 w-12 text-white/10" />
            </div>
            <div className="flex items-center justify-between mt-4 text-[10px] text-white/40 font-ui">
              <span>Study ID: {viewerOpen.id}</span>
              <span>{viewerOpen.date}</span>
              {viewerOpen.tooth && <span>Tooth #{viewerOpen.tooth}</span>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
