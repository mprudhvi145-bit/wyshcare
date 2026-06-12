/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/features/general-medicine/components/rx-prescription.tsx
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
 * React component: rx-prescription
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
import { Plus, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glassCard, glassInput } from '../types';

export function RxPrescription({
  patientName,
  value,
  onChange,
  onSave,
}: {
  patientName: string;
  value?: {
    medications: Array<{ name: string; dose: string; frequency: string; duration: string; instructions: string }>;
    diagnosis: string;
    instructions: string;
  };
  onChange?: (prescription: {
    medications: Array<{ name: string; dose: string; frequency: string; duration: string; instructions: string }>;
    diagnosis: string;
    instructions: string;
  }) => void;
  onSave?: () => void;
}) {
  const [medRows, setMedRows] = useState<Array<{ name: string; dose: string; frequency: string; duration: string; instructions: string }>>(
    value?.medications || [{ name: '', dose: '', frequency: '', duration: '', instructions: '' }]
  );
  const [diagnosis, setDiagnosis] = useState(value?.diagnosis || '');
  const [instructions, setInstructions] = useState(value?.instructions || '');

  useEffect(() => {
    if (value) {
      setMedRows(value.medications || [{ name: '', dose: '', frequency: '', duration: '', instructions: '' }]);
      setDiagnosis(value.diagnosis || '');
      setInstructions(value.instructions || '');
    }
  }, [value]);

  const handleUpdate = (
    nextMeds: typeof medRows,
    nextDiag: string = diagnosis,
    nextInst: string = instructions
  ) => {
    setMedRows(nextMeds);
    setDiagnosis(nextDiag);
    setInstructions(nextInst);
    onChange?.({
      medications: nextMeds,
      diagnosis: nextDiag,
      instructions: nextInst,
    });
  };

  const addRow = () => {
    const nextMeds = [...medRows, { name: '', dose: '', frequency: '', duration: '', instructions: '' }];
    handleUpdate(nextMeds);
  };

  const removeRow = (idx: number) => {
    const nextMeds = medRows.filter((_, i) => i !== idx);
    handleUpdate(nextMeds);
  };

  const updateRow = (idx: number, field: string, val: string) => {
    const nextMeds = medRows.map((r, i) => i === idx ? { ...r, [field]: val } : r);
    handleUpdate(nextMeds);
  };

  return (
    <div className={cn(glassCard, 'p-5')}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white font-display">Rx Prescription</h3>
          <p className="text-xs text-white/40 font-ui mt-0.5">Issue prescription for {patientName}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={addRow} className="flex items-center gap-1.5 rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/70 font-ui hover:bg-white/[0.06] hover:text-white transition-all">
            <Plus className="h-3.5 w-3.5" />
            Add Medication
          </button>
          <button onClick={onSave} className="flex items-center gap-1.5 rounded-[14px] bg-[#2EE59D] text-[#0B0D10] px-3.5 py-2 text-xs font-semibold font-ui hover:bg-[#2EE59D]/90 transition-all">
            <Save className="h-3.5 w-3.5" />
            Issue Prescription
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr_40px] gap-2 px-1">
          {['Medication', 'Dose', 'Frequency', 'Duration', 'Instructions', ''].map(h => (
            <span key={h} className="text-[10px] font-semibold text-white/30 font-ui tracking-wider uppercase">{h}</span>
          ))}
        </div>
        {medRows.map((row, i) => (
          <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr_40px] gap-2 items-center">
            <input value={row.name} onChange={e => updateRow(i, 'name', e.target.value)} placeholder="Drug name" className={glassInput} />
            <input value={row.dose} onChange={e => updateRow(i, 'dose', e.target.value)} placeholder="e.g., 500mg" className={glassInput} />
            <input value={row.frequency} onChange={e => updateRow(i, 'frequency', e.target.value)} placeholder="e.g., BID" className={glassInput} />
            <input value={row.duration} onChange={e => updateRow(i, 'duration', e.target.value)} placeholder="e.g., 7 days" className={glassInput} />
            <input value={row.instructions} onChange={e => updateRow(i, 'instructions', e.target.value)} placeholder="After meals" className={glassInput} />
            <button onClick={() => removeRow(i)} disabled={medRows.length === 1} className="flex h-9 w-9 items-center justify-center rounded-[10px] text-white/30 hover:text-[#FF5A5A] hover:bg-[#FF5A5A]/10 transition-all disabled:opacity-20">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-medium text-white/40 font-ui mb-1.5 block">Diagnosis</label>
            <input value={diagnosis} onChange={e => handleUpdate(medRows, e.target.value, instructions)} placeholder="Diagnosis summary" className={glassInput} />
          </div>
          <div>
            <label className="text-[11px] font-medium text-white/40 font-ui mb-1.5 block">Additional Instructions</label>
            <input value={instructions} onChange={e => handleUpdate(medRows, diagnosis, e.target.value)} placeholder="e.g., Take with food" className={glassInput} />
          </div>
        </div>
      </div>
    </div>
  );
}
