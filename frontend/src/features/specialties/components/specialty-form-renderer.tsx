/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/features/specialties/components/specialty-form-renderer.tsx
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
 * React component: specialty-form-renderer
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
 - react
 *
 * Dependencies:
 - utils
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
import { cn } from '@/lib/utils';
import type { SpecialtyTemplate, TemplateSection } from '@/types/specialties';

const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';
const glassInput = 'w-full rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/30 font-ui focus:outline-none focus:border-[#8FD3D1]/30 focus:bg-white/[0.05] transition-all';
const glassTextarea = 'w-full rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] p-3 text-sm text-white placeholder:text-white/30 font-ui focus:outline-none focus:border-[#8FD3D1]/30 focus:bg-white/[0.05] transition-all resize-none';
const glassSelect = 'w-full rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-[#1C2025] px-4 py-2.5 text-sm text-white font-ui focus:outline-none focus:border-[#8FD3D1]/30 transition-all appearance-none';

interface SpecialtyFormRendererProps {
  template: SpecialtyTemplate;
  formData: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  accentColor?: string;
}

export function SpecialtyFormRenderer({ template, formData, onChange, accentColor = '#8FD3D1' }: SpecialtyFormRendererProps) {
  const [activeSection, setActiveSection] = useState(template.sections[0]?.id);

  const updateField = (fieldId: string, value: unknown) => {
    onChange({ ...formData, [fieldId]: value });
  };

  const renderField = (field: TemplateSection['fields'][0]) => {
    const val = formData[field.id] as string | number | boolean | string[] | undefined;

    switch (field.type) {
      case 'textarea':
      case 'richtext':
        return (
          <textarea
            value={val as string ?? ''}
            onChange={e => updateField(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={cn(glassTextarea, 'min-h-[100px]')}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={val as number ?? ''}
            onChange={e => updateField(field.id, e.target.value ? Number(e.target.value) : '')}
            placeholder={field.placeholder}
            className={glassInput}
          />
        );

      case 'select':
        return (
          <select
            value={val as string ?? ''}
            onChange={e => updateField(field.id, e.target.value)}
            className={glassSelect}
          >
            <option value="">Select...</option>
            {field.options?.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        );

      case 'multiselect': {
        const selected = (val as string[]) ?? [];
        return (
          <div className="flex flex-wrap gap-1.5">
            {field.options?.map(o => {
              const isSelected = selected.includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    const next = isSelected ? selected.filter(v => v !== o.value) : [...selected, o.value];
                    updateField(field.id, next);
                  }}
                  className={cn(
                    'rounded-[10px] px-3 py-1.5 text-[11px] font-medium font-ui transition-all border',
                    isSelected
                      ? 'border-[rgba(255,255,255,0.2)] text-white'
                      : 'border-[rgba(255,255,255,0.06)] text-white/50 hover:bg-white/[0.04]',
                  )}
                  style={isSelected ? { backgroundColor: `${accentColor}20`, borderColor: `${accentColor}40`, color: accentColor } : {}}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        );
      }

      case 'boolean':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => updateField(field.id, !val)}
              className={cn(
                'h-5 w-10 rounded-full transition-all relative',
                val ? '' : 'bg-white/[0.08]',
              )}
              style={val ? { backgroundColor: accentColor } : {}}
            >
              <div className={cn(
                'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all',
                val ? 'left-5' : 'left-0.5',
              )} />
            </div>
            <span className="text-sm text-white/70 font-ui">{field.label}</span>
          </label>
        );

      default:
        return (
          <input
            type="text"
            value={val as string ?? ''}
            onChange={e => updateField(field.id, e.target.value)}
            placeholder={field.placeholder ?? field.label}
            className={glassInput}
          />
        );
    }
  };

  return (
    <div className="space-y-5">
      <div className={cn(glassCard, 'p-5')}>
        <h2 className="text-lg font-semibold text-white font-display mb-1">{template.name}</h2>
        <p className="text-sm text-white/50 font-ui">{template.description}</p>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {template.sections.map(s => {
          const isActive = activeSection === s.id;
          const sectionIcon = getSectionIcon(s.type);
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-[14px] text-sm font-medium font-ui transition-all whitespace-nowrap',
                isActive ? 'text-white border' : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03] border border-transparent',
              )}
              style={isActive ? { backgroundColor: `${accentColor}15`, borderColor: `${accentColor}25`, color: accentColor } : {}}
            >
              <span className="h-4 w-4">{sectionIcon}</span>
              {s.title}
            </button>
          );
        })}
      </div>

      {template.sections.filter(s => s.id === activeSection).map(section => (
        <div key={section.id} className={cn(glassCard, 'p-5')}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm">{getSectionIcon(section.type)}</span>
            <h3 className="text-base font-semibold text-white font-display">{section.title}</h3>
            {section.type !== 'form' && (
              <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-white/40 font-ui">{section.type}</span>
            )}
          </div>

          {section.type === 'diagram' && (
            <div className="mb-4 rounded-[16px] border border-dashed border-[rgba(255,255,255,0.1)] p-8 text-center">
              <p className="text-sm text-white/40 font-ui">Interactive diagram component will render here</p>
            </div>
          )}

          <div className="space-y-4">
            {section.fields.map(field => (
              <div key={field.id}>
                <label className={cn(
                  'block text-sm font-medium mb-1.5 font-ui',
                  field.required ? 'text-white/80' : 'text-white/50',
                )}>
                  {field.label}
                  {field.required && <span className="ml-1" style={{ color: accentColor }}>*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function getSectionIcon(type: string): string {
  switch (type) {
    case 'diagram': return '🔬';
    case 'chart': return '📊';
    case 'imaging': return '📷';
    case 'assessment': return '📝';
    case 'measurement': return '📏';
    default: return '📋';
  }
}
