/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/features/general-medicine/components/report-generator.tsx
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
 * React component: report-generator
 *
 * Responsibilities:
 * - Render UI components for Frontend
 * - Handle user interactions and state management
 *
 * Used By:
 - frontend/src/app/(platform)/app/wallet/page.tsx
 - frontend/src/app/(platform)/app/consent/page.tsx
 - frontend/src/app/admin/page.tsx
 - frontend/src/components/app/notification-bell.tsx
 - frontend/src/app/admin/users/page.tsx
 - frontend/src/app/os/billing/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/os/layout.tsx
 *
 * Calls:
 - react
 - utils
 - lucide-react
 *
 * Dependencies:
 - react
 - utils
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

import { useState, useEffect } from 'react';
import { FileText, Share2, Users, Save, Download, Fingerprint, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glassCard } from '../types';

export function ReportGenerator({
  value,
  onChange,
  onSave,
}: {
  value?: string[];
  onChange?: (sections: string[]) => void;
  onSave?: () => void;
}) {
  const [selectedSections, setSelectedSections] = useState(
    value || [
      'Patient Summary',
      'SOAP Notes',
      'Diagnosis',
      'Lab Results',
      'Medications',
      'AI Recommendations',
      'Treatment Plan',
      'Follow-Up Instructions',
    ]
  );

  useEffect(() => {
    if (value) {
      setSelectedSections(value);
    }
  }, [value]);

  const toggleSection = (s: string) => {
    const nextSections = selectedSections.includes(s)
      ? selectedSections.filter(x => x !== s)
      : [...selectedSections, s];
    setSelectedSections(nextSections);
    onChange?.(nextSections);
  };

  const exportOptions = [
    { icon: Share2, label: 'Share With Patient', color: '#8FD3D1' },
    { icon: Users, label: 'Share With Staff', color: '#8FD3D1' },
    { icon: Save, label: 'Save To EMR', color: '#2EE59D' },
    { icon: Download, label: 'Export PDF', color: '#2EE59D' },
    { icon: Fingerprint, label: 'Send To WyshID', color: '#8FD3D1' },
    { icon: Activity, label: 'Send To Health Timeline', color: '#8FD3D1' },
  ];

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-white font-display">Clinical Report Generator</h3>
          <p className="text-xs text-white/40 font-ui mt-0.5">Automatically compile and export comprehensive clinical reports</p>
        </div>
        <button onClick={onSave} className="flex items-center gap-2 rounded-[14px] bg-[#2EE59D] text-[#0B0D10] px-5 py-2.5 text-sm font-semibold font-ui hover:bg-[#2EE59D]/90 transition-all shadow-lg shadow-[#2EE59D]/20">
          <FileText className="h-4 w-4" />
          Generate Clinical Report
        </button>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-5">
        <div>
          <h4 className="text-[11px] font-semibold text-white/40 font-ui tracking-wider uppercase mb-3">Report Contents</h4>
          <div className="flex flex-wrap gap-1.5">
            {['Patient Summary', 'SOAP Notes', 'Diagnosis', 'Lab Results', 'Medications', 'AI Recommendations', 'Treatment Plan', 'Follow-Up Instructions'].map(s => (
              <button
                key={s}
                onClick={() => toggleSection(s)}
                className={cn(
                  'rounded-[10px] px-3 py-1.5 text-[11px] font-medium font-ui transition-all border',
                  selectedSections.includes(s)
                    ? 'bg-[#8FD3D1]/15 text-[#8FD3D1] border-[#8FD3D1]/25'
                    : 'bg-white/[0.02] text-white/40 border-[rgba(255,255,255,0.06)] hover:bg-white/[0.04] hover:text-white/60'
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-white/30 font-ui mt-3">{selectedSections.length} sections selected</p>
        </div>
        <div>
          <h4 className="text-[11px] font-semibold text-white/40 font-ui tracking-wider uppercase mb-3">Export Options</h4>
          <div className="grid grid-cols-2 gap-2">
            {exportOptions.map((opt, i) => (
              <button
                key={i}
                className="flex items-center gap-2 rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02] px-3.5 py-2.5 text-xs text-white/70 font-ui hover:bg-white/[0.04] hover:text-white transition-all"
              >
                <opt.icon className="h-3.5 w-3.5" style={{ color: opt.color }} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
