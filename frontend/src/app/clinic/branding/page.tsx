/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/clinic/branding/page.tsx
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
 * React component: page
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
import { Palette, Save, Plus, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';
const glassInput = 'w-full rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/30 font-ui focus:outline-none focus:border-[#8FD3D1]/30 focus:bg-white/[0.05] transition-all';

const SPECIALTIES = [
  { code: 'general-medicine', name: 'General Medicine' },
  { code: 'ent', name: 'ENT' },
  { code: 'dental', name: 'Dental' },
  { code: 'dermatology', name: 'Dermatology' },
  { code: 'ophthalmology', name: 'Ophthalmology' },
  { code: 'cardiology', name: 'Cardiology' },
  { code: 'pediatrics', name: 'Pediatrics' },
];

interface CustomTemplate {
  id: string;
  specialtyCode: string;
  name: string;
  description: string;
}

export default function ClinicBrandingPage() {
  const [primaryColor, setPrimaryColor] = useState('#8FD3D1');
  const [clinicName, setClinicName] = useState('My Clinic');
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ specialtyCode: '', name: '', description: '' });
  const [saved, setSaved] = useState(false);

  const addTemplate = () => {
    if (!newTemplate.specialtyCode || !newTemplate.name) return;
    setTemplates(prev => [...prev, { ...newTemplate, id: Math.random().toString(36).slice(2) }]);
    setNewTemplate({ specialtyCode: '', name: '', description: '' });
    setShowNewTemplate(false);
  };

  const removeTemplate = (id: string) => setTemplates(prev => prev.filter(t => t.id !== id));

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0D10' }}>
      <div className="mx-auto" style={{ maxWidth: 1200 }}>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px]" style={{ backgroundColor: `${primaryColor}15` }}>
                <Palette className="h-5 w-5" style={{ color: primaryColor }} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-display">Clinic Branding & Templates</h1>
                <p className="text-xs text-white/50 font-ui">Customize your clinic's look and create specialty templates</p>
              </div>
            </div>
            <button onClick={handleSave} className="flex items-center gap-2 rounded-[14px] px-4 py-2.5 text-xs font-semibold font-ui transition-all" style={{ backgroundColor: primaryColor, color: '#0B0D10' }}>
              <Save className="h-3.5 w-3.5" />{saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>

          <div className="grid grid-cols-[1fr_1fr] gap-5">
            <div className={cn(glassCard, 'p-5')}>
              <h3 className="text-base font-semibold text-white font-display mb-4">Brand Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 font-ui mb-1.5 block">Clinic Name</label>
                  <input value={clinicName} onChange={e => setClinicName(e.target.value)} className={glassInput} />
                </div>
                <div>
                  <label className="text-sm text-white/60 font-ui mb-1.5 block">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="h-10 w-16 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-transparent cursor-pointer" />
                    <input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className={cn(glassInput, 'flex-1 font-mono')} />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/60 font-ui mb-1.5 block">Preview</label>
                  <div className="rounded-[16px] p-4 border border-[rgba(255,255,255,0.06)]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-[10px]" style={{ backgroundColor: primaryColor }}>
                        <Eye className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-white">{clinicName}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="rounded-[10px] px-3 py-1.5 text-xs font-medium text-white" style={{ backgroundColor: `${primaryColor}99` }}>Primary</div>
                      <div className="rounded-[10px] px-3 py-1.5 text-xs font-medium bg-white/[0.08] text-white/70">Secondary</div>
                      <div className="rounded-[10px] px-3 py-1.5 text-xs font-medium bg-white/[0.04] text-white/50">Muted</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={cn(glassCard, 'p-5')}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white font-display">Custom Templates</h3>
                <button
                  onClick={() => setShowNewTemplate(true)}
                  className="flex items-center gap-1.5 rounded-[12px] px-3 py-1.5 text-xs font-medium font-ui transition-all border border-[rgba(255,255,255,0.08)] text-white/70 hover:bg-white/[0.04]"
                >
                  <Plus className="h-3 w-3" />Add Template
                </button>
              </div>

              {showNewTemplate && (
                <div className="rounded-[16px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-4 mb-4 space-y-3">
                  <select
                    value={newTemplate.specialtyCode}
                    onChange={e => setNewTemplate(prev => ({ ...prev, specialtyCode: e.target.value }))}
                    className="w-full rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[#1C2025] px-3 py-2 text-sm text-white font-ui"
                  >
                    <option value="">Select Specialty</option>
                    {SPECIALTIES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                  </select>
                  <input
                    value={newTemplate.name}
                    onChange={e => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Template name"
                    className={glassInput}
                  />
                  <textarea
                    value={newTemplate.description}
                    onChange={e => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description (optional)"
                    className="w-full rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] p-3 text-sm text-white font-ui resize-none"
                    rows={2}
                  />
                  <div className="flex items-center gap-2">
                    <button onClick={addTemplate} className="rounded-[12px] px-4 py-2 text-xs font-semibold text-white" style={{ backgroundColor: primaryColor }}>Add</button>
                    <button onClick={() => setShowNewTemplate(false)} className="rounded-[12px] px-4 py-2 text-xs font-medium text-white/50 hover:text-white/70">Cancel</button>
                  </div>
                </div>
              )}

              {templates.length === 0 ? (
                <p className="text-sm text-white/30 font-ui text-center py-8">No custom templates yet. Create your first template.</p>
              ) : (
                <div className="space-y-2">
                  {templates.map(t => (
                    <div key={t.id} className="flex items-center justify-between rounded-[14px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3">
                      <div>
                        <p className="text-sm font-medium text-white font-ui">{t.name}</p>
                        <p className="text-[11px] text-white/40 font-ui">
                          {SPECIALTIES.find(s => s.code === t.specialtyCode)?.name ?? t.specialtyCode}
                          {t.description && ` · ${t.description}`}
                        </p>
                      </div>
                      <button onClick={() => removeTemplate(t.id)} className="p-1.5 rounded-[8px] text-white/30 hover:text-[#FF5A5A] hover:bg-[#FF5A5A]/10 transition-all">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
