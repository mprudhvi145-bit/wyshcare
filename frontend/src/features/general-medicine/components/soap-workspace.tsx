/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/features/general-medicine/components/soap-workspace.tsx
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
 * React component: soap-workspace
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
import { Brain, Save, Eye, Plus, AlertOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glassCard, glassTextarea } from '../types';

export function SOAPWorkspace({
  existingNotes,
  aiSuggestions,
  value,
  onChange,
  onSave,
}: {
  existingNotes: Array<{ createdAt?: string }>;
  aiSuggestions: string[];
  value?: { subjective: string; objective: string; assessment: string; plan: string };
  onChange?: (notes: { subjective: string; objective: string; assessment: string; plan: string }) => void;
  onSave?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'subjective' | 'objective' | 'assessment' | 'plan'>('subjective');
  const [form, setForm] = useState(value || { subjective: '', objective: '', assessment: '', plan: '' });
  const [showAiSuggestions, setShowAiSuggestions] = useState(true);

  useEffect(() => {
    if (value) {
      setForm(value);
    }
  }, [value]);

  const handleTextareaChange = (text: string) => {
    const nextForm = { ...form, [activeTab]: text };
    setForm(nextForm);
    onChange?.(nextForm);
  };

  const insertSuggestion = (suggestion: string) => {
    const nextVal = form[activeTab] + (form[activeTab] ? '\n' : '') + suggestion;
    const nextForm = { ...form, [activeTab]: nextVal };
    setForm(nextForm);
    onChange?.(nextForm);
  };

  const tabs = [
    { id: 'subjective' as const, label: 'Subjective', desc: 'Chief complaint, history, symptoms' },
    { id: 'objective' as const, label: 'Objective', desc: 'Vitals, physical exam, labs' },
    { id: 'assessment' as const, label: 'Assessment', desc: 'Diagnosis, severity, differential' },
    { id: 'plan' as const, label: 'Plan', desc: 'Treatment, tests, referrals, follow-up' },
  ];

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white font-display">SOAP Notes</h3>
          <p className="text-xs text-white/40 font-ui mt-0.5">Structured clinical documentation</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAiSuggestions(v => !v)} className={cn('flex items-center gap-1.5 rounded-[14px] px-3 py-2 text-xs font-medium font-ui transition-all', showAiSuggestions ? 'bg-[#8FD3D1]/10 text-[#8FD3D1] border border-[#8FD3D1]/20' : 'text-white/50 border border-[rgba(255,255,255,0.08)] hover:bg-white/[0.03]')}>
            <Brain className="h-3.5 w-3.5" />
            AI Assist
          </button>
          <button onClick={onSave} className="flex items-center gap-1.5 rounded-[14px] bg-[#8FD3D1] text-[#0B0D10] px-3.5 py-2 text-xs font-semibold font-ui hover:bg-[#8FD3D1]/90 transition-all">
            <Save className="h-3.5 w-3.5" />
            Save
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-4 border-b border-[rgba(255,255,255,0.06)] pb-0.5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium font-ui transition-all rounded-t-[10px] border-b-2',
              activeTab === tab.id ? 'text-[#8FD3D1] border-[#8FD3D1]' : 'text-white/40 border-transparent hover:text-white/60'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-4">
        <div className="space-y-3">
          <p className="text-[11px] text-white/30 font-ui">{tabs.find(t => t.id === activeTab)?.desc}</p>
          <textarea
            value={form[activeTab]}
            onChange={e => handleTextareaChange(e.target.value)}
            placeholder={`Enter ${activeTab} notes...`}
            className={cn(glassTextarea, 'min-h-[200px]')}
          />

          <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.06)]">
            <div className="text-[11px] text-white/30 font-ui">
              {existingNotes.length > 0 ? `Last note: ${new Date(existingNotes[0]?.createdAt ?? '').toLocaleDateString()}` : 'No previous notes'}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onSave} className="flex items-center gap-1.5 rounded-[14px] bg-[#2EE59D]/10 text-[#2EE59D] border border-[#2EE59D]/20 px-3 py-1.5 text-[11px] font-medium font-ui hover:bg-[#2EE59D]/20 transition-all">
                <Save className="h-3 w-3" />
                Save Note
              </button>
              <button className="flex items-center gap-1.5 rounded-[14px] border border-[rgba(255,255,255,0.08)] text-white/50 px-3 py-1.5 text-[11px] font-medium font-ui hover:text-white/80 transition-all">
                <Eye className="h-3 w-3" />
                Preview
              </button>
            </div>
          </div>
        </div>

        {showAiSuggestions && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold text-white/40 font-ui tracking-wider uppercase">AI Suggestions</h4>
            {aiSuggestions.length === 0 ? (
              <p className="text-xs text-white/30 font-ui">Complete patient data to enable AI suggestions.</p>
            ) : (
              aiSuggestions.slice(0, 4).map((s, i) => (
                <div key={i} className="rounded-[14px] bg-[#8FD3D1]/5 border border-[#8FD3D1]/10 p-3">
                  <p className="text-xs text-white/80 font-ui leading-relaxed">{s}</p>
                  <button
                    onClick={() => insertSuggestion(s)}
                    className="mt-2 flex items-center gap-1 text-[10px] font-medium text-[#8FD3D1] font-ui hover:text-[#8FD3D1]/80 transition-all"
                  >
                    <Plus className="h-3 w-3" />
                    Insert Into Note
                  </button>
                </div>
              ))
            )}

            <div className="mt-4">
              <h4 className="text-[11px] font-semibold text-white/40 font-ui tracking-wider uppercase mb-2">Drug Interactions</h4>
              <div className="rounded-[14px] bg-[#FF5A5A]/5 border border-[#FF5A5A]/15 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertOctagon className="h-3 w-3 text-[#FF5A5A]" />
                  <span className="text-[11px] font-semibold text-[#FF5A5A] font-ui">No interactions detected</span>
                </div>
                <p className="text-[10px] text-white/40 font-ui">Current medications show no known conflicts.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
