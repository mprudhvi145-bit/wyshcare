# WYSHCARE OS — Product Specification Part 2

> Consultation Workspace · Health Timeline · AI Twin Experience
> Interaction models, workflows, layouts, states, and hierarchy for every screen.

---

## Contents

- [1. Consultation Workspace](#1-consultation-workspace)
- [2. Health Timeline Deep-Dive](#2-health-timeline-deep-dive)
- [3. AI Twin Experience](#3-ai-twin-experience)

---

## 1. Consultation Workspace

### DOC-009: Consultation Workspace (Three-Pane Layout)

The consultation workspace is the most critical screen in the platform — the place where clinical decisions happen. It follows a three-pane architecture inspired by Linear's workspace model, optimized for rapid context switching.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  🩺 Consultation: Rajesh Kumar (M/42)              ⏱ 12:34 elapsed    🟢 Recording     [End] [X] │
│  Dr. Arun Sharma · General Medicine · Jun 4, 2026                                               │
├────────────────────────────────┬─────────────────────────────────┬───────────────────────────────┤
│  PATIENT CONTEXT               │  CLINICAL TOOLS                 │  AI COPILOT                   │
│  ───────────────────────────── │  ──────────────────────────────  │  ───────────────────────────  │
│                                │                                  │                               │
│  🔍 Patient                    │  📝 SOAP Notes                  │  🤖 AI Suggestions            │
│  ┌──────────────────────────┐  │  ┌───────────────────────────┐  │  ┌─────────────────────────┐  │
│  │ Rajesh Kumar             │  │  │ S: "Fever since 3 days,   │  │  │ Based on history +      │  │
│  │ 42 yrs · Male            │  │  │   伴随头痛和身体疼痛。   │  │  │ symptoms:               │  │
│  │ 🆔 #WSP-00421            │  │  │   Temp 101.2°F"          │  │  │                         │  │
│  │                          │  │  │                          │  │  │  💊 DX: Viral Fever     │  │
│  │ ┌──────┬──────┬──────┐  │  │  │ O: Temp 38.4°C, BP       │  │  │     likely Dengue      │  │
│  │ │ 🩺   │ 💊   │ 🔬  │  │  │  │    128/84, HR 92, RR 18  │  │  │     ruled out          │  │
│  │ │Conditions│Rx  │Labs │  │  │  │    Throat: erythematous  │  │  │                         │  │
│  │ │ 2 active │3   │5    │  │  │  │    Lungs: clear          │  │  │  🧪 Recommended:       │  │
│  │ └──────┴──────┴──────┘  │  │  │                          │  │  │     • CBC               │  │
│  │                          │  │  │ A: Viral Upper           │  │  │     • Dengue NS1        │  │
│  │ ──────────────────────   │  │  │    Respiratory Infection │  │  │     • Malaria          │  │
│  │                          │  │  │                          │  │  │                         │  │
│  │ ⚠️ Allergies:           │  │  │ P: 1. Paracetamol 650mg  │  │  │  📋 Draft SOAP ready   │  │
│  │   Penicillin (Severe)   │  │  │        TDS × 5 days      │  │  │  [Apply] [Edit] [X]    │  │
│  │   Sulfa (Mild)          │  │  │    2. CBC + Dengue NS1   │  │  └─────────────────────────┘  │
│  │                          │  │  │    3. Review in 48h     │  │                               │
│  │ 📊 Vitals (Today)       │  │  │    4. Bed rest + fluids  │  │  💬 Quick Responses           │
│  │   BP: 128/84 🟢        │  │  │                          │  │  ┌─────────────────────────┐  │
│  │   HR: 92 🟡 Elevated   │  │  │  [Add Diagnosis] [Add Rx] │  │  │ "Prescribe paracetamol" │  │
│  │   Temp: 38.4°C 🔴 Fever │  │  └───────────────────────────┘  │  │ "Order CBC"             │  │
│  │   SpO2: 98% 🟢         │  │                                  │  │ "Refer to cardiology"   │  │
│  │   RBS: 112 🟢          │  │  📋 Diagnoses                    │  └─────────────────────────┘  │
│  │                          │  │  ┌───────────────────────────┐  │                               │
│  │ 📂 Recent Records       │  │  │ + Add Primary Diagnosis   │  │  📋 Suggested Questions       │
│  │  ┌────────────────────┐  │  │  │ + Add Comorbidity        │  │  ┌─────────────────────────┐  │
│  │  │ Jun 2: CBC Report │  │  │  └───────────────────────────┘  │  │ • "Duration of fever?"  │  │
│  │  │          → Normal │  │  │                                  │  │ • "Any vomiting?"      │  │
│  │  │ May 28: BP Check  │  │  │  💊 Prescriptions               │  │ • "Travel history?"    │  │
│  │  │      128/85       │  │  │  ┌───────────────────────────┐  │  └─────────────────────────┘  │
│  │  │ Apr 15: Visit     │  │  │  │ + Add Medication          │  │                               │
│  │  │   Dr. Mehta       │  │  │  └───────────────────────────┘  │  ⏱ Session Timeline           │
│  │  └────────────────────┘  │  │                                  │  ┌─────────────────────────┐  │
│  │                          │  │  🧪 Lab Orders                  │  │ · Started: 10:30 AM     │  │
│  │  📅 History Summary     │  │  ┌───────────────────────────┐  │  │ · History reviewed      │  │
│  │  ┌──────────────────────┐│  │  │ + Order Lab Test         │  │  │  at 10:32               │  │
│  │  │ HTN since 2019      ││  │  └───────────────────────────┘  │  │ · Vitals noted at       │  │
│  │  │ DM Type 2 since 2021││  │                                  │  │  10:33                  │  │
│  │  │ Seasonal allergies  ││  │  📋 Referrals                   │  │ · SOAP drafted at       │  │
│  │  └──────────────────────┘│  │  ┌───────────────────────────┐  │  │  10:36                  │  │
│  └──────────────────────────┘  │  │ + Refer to Specialist    │  │  └─────────────────────────┘  │
│                                 │  └───────────────────────────┘  │                               │
│  Min-Width: 320px              │                                  │                               │
│  (Collapses to top bar)       │  ┌── Quick Actions ────────────┐  │                               │
│                                 │  │ [📝 Save & Finish] [🖨 Print]│  │                               │
│                                 │  │ [📋 Generate Summary] [⏭ Next]│  │                               │
│                                 │  └──────────────────────────────┘  │                               │
├────────────────────────────────┴─────────────────────────────────┴───────────────────────────────┤
│  SOAP Note Summary: Viral Upper Respiratory Infection · Paracetamol 650mg TDS × 5d · CBC + Dengue  │
│                                                      [View Full Note] [Share with Patient]         │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘

States:
  Pre-Consultation (Patient not yet joined):
    - Pane 1 shows patient context
    - Pane 2 shows "Waiting for patient to join..." with preparation checklist
    - Pane 3 shows pre-consult AI insights based on available data
    - Timer shows "⏳ Awaiting patient"
  
  Active Consultation (Patient joined):
    - Three panes fully active
    - Timer counting up
    - Recording indicator 🟢 (if consented)
    - AI Copilot providing real-time suggestions
  
  Paused (Doctor put on hold):
    - Overlay: "Consultation on hold" with resume button
    - Timer pauses
    - Recording pauses
  
  Ended:
    - Read-only view of all panes
    - "Generate SOAP Note" button converts notes to structured format
    - "Generate Summary" creates patient-facing summary
    - Actions: Print, Share, Email, Add to Timeline
  
  Error / Reconnect:
    - "Connection lost. Reconnecting..." banner at top
    - Optimistic local state preserves notes
    - Auto-reconnect with exponential backoff
```

### Keyboard Shortcuts

```
Navigation:
  ⌘1    Focus patient context pane
  ⌘2    Focus clinical tools pane
  ⌘3    Focus AI copilot pane
  ⌘K    Command palette (search actions, diagnoses, medications)
  ⌘⇧F   Full-screen mode toggle
  ⌘W    Close consultation (with confirmation if unsaved)

Documentation:
  ⌘⏎    Save SOAP note & end consultation
  ⌘D     Add diagnosis
  ⌘R     Add prescription
  ⌘L     Order lab test
  ⌘G     Generate AI SOAP draft
  ⌘⇧S   Generate patient summary
  ⇧⏎     New line in SOAP note (soft return)

AI Copilot:
  ⌘.     Accept AI suggestion (when highlighted)
  ⌘,     Reject AI suggestion
  ⌘⇧.    Cycle through AI suggestions
  ⌘⇧A    Open AI assistant chat

Navigation:
  ⌘⇧[   Previous consultation (if multiple open)
  ⌘⇧]   Next consultation
  ⌘⇧T   Return to triage/dashboard
```

### Pane 1: Patient Context (Left, 320px min / 25% default)

```
┌───────────────────────────────┐
│ 🔍 Search patients...    ⌘K   │
├───────────────────────────────┤
│                               │
│ Rajesh Kumar                  │
│ 42 yrs · Male                 │
│ 🆔 #WSP-00421                 │
│ 📞 +91-98765-43210            │
│ 📧 rajesh.k@email.com        │
│                               │
│ ┌──────┬──────┬──────┬──────┐ │
│ │ 🩺   │ 💊   │ 🔬  │ 🏥  │ │
│ │Conditions│Rx  │Labs │Visits│ │
│ │ 2 active│3   │5    │7    │ │
│ └──────┴──────┴──────┴──────┘ │
│                               │
│ ──── Allergies ────           │
│ ⚠️ Penicillin (Severe)        │
│   Reaction: Anaphylaxis       │
│ ⚠️ Sulfa (Mild)               │
│   Reaction: Rash              │
│                               │
│ ──── Current Vitals ────      │
│ BP   128/84    🟢 Normal      │
│ HR   92        🟡 Elevated    │
│ Temp 38.4°C    🔴 Fever       │
│ SpO2 98%       🟢 Normal      │
│ RBS  112       🟢 Normal      │
│                               │
│ ──── Active Conditions ────   │
│ 🩸 Hypertension      Since 2019│
│    Last A1C: 6.5% (Apr 2026) │
│ 🍬 Type 2 Diabetes   Since 2021│
│    Medications: Metformin     │
│                               │
│ ──── Recent Records ────      │
│ Jun 2 🔬 CBC → Normal        │
│ May 28 🏥 BP Check 128/85    │
│ Apr 15 🩺 Visit Dr. Mehta    │
│ Mar 20 💊 Rx Refill: Metformin│
│ [View All Records →]         │
│                               │
│ ──── Last Visit Summary ──   │
│ Dr. Mehta · Apr 15, 2026      │
│ "Patient complained of...     │
│  Adjusted Metformin to 500mg  │
│  BID. Ordered HbA1c."         │
│                               │
│ ──── AI Summary ────          │
│ 🤖 This patient has ongoing   │
│ HTN + DM2. Last HbA1c was     │
│ 6.5% — controlled but on      │
│ upper bound. Seasonal allergies│
│ managed with antihistamines.  │
└───────────────────────────────┘

Collapsed State (when pane hidden):
┌──────────────────────────────┐
│ 👤 Rajesh K · M/42          │
│ 🩺 DM2 + HTN · ⚠️ PCN Allergy │
└──────────────────────────────┘
```

### Pane 2: Clinical Tools (Center, ~50%)

```
┌──────────────────────────────────────────────────┐
│ 📝 SOAP Notes                    [Templates ▼]    │
├──────────────────────────────────────────────────┤
│ Subjective                                        │
│ ┌──────────────────────────────────────────────┐ │
│ │ Fever since 3 days, associated with headache │ │
│ │ and body pain. No vomiting. Reduced appetite.│ │
│ │                                               │ │
│ │ HPI: Acute onset, intermittent fever up to    │ │
│ │ 101.2°F. Chills present. No cough/sore throat.│ │
│ └──────────────────────────────────────────────┘ │
│                                                   │
│ Objective                                         │
│ ┌──────────────────────────────────────────────┐ │
│ │ Temp: 38.4°C (101.1°F)                       │ │
│ │ BP: 128/84, HR: 92, RR: 18, SpO2: 98%       │ │
│ │ Throat: Erythematous, no exudate             │ │
│ │ Lungs: Clear bilaterally                     │ │
│ │ Abdomen: Soft, non-tender                    │ │
│ └──────────────────────────────────────────────┘ │
│                                                   │
│ Assessment                                        │
│ ┌──────────────────────────────────────────────┐ │
│ │ Primary: J06.9 — Viral Upper Respiratory     │ │
│ │   Infection, unspecified                     │ │
│ │   [Change] [Remove]                          │ │
│ │ Rule out: A90 — Dengue Fever                 │ │
│ └──────────────────────────────────────────────┘ │
│                                                   │
│ Plan                                              │
│ ┌──────────────────────────────────────────────┐ │
│ │ 1. 💊 Paracetamol 650mg TDS × 5 days     [✓]│ │
│ │ 2. 🧪 CBC + Dengue NS1 + Malaria         [✓]│ │
│ │ 3. 📅 Review in 48h / SOS               [✓]│ │
│ │ 4. 🛌 Bed rest, increased fluids         [✓]│ │
│ │ 5. 🚨 ER if: high fever >103°F, confusion, │ │
│ │      breathing difficulty                  │ │
│ │ [+ Add Item]                                │ │
│ └──────────────────────────────────────────────┘ │
│                                                   │
│ ┌──────────────────────────────────────────────┐ │
│ │  Follow-up Notes                             │ │
│ │ ┌──────────────────────────────────────────┐ │
│ │ │                                          │ │
│ │ └──────────────────────────────────────────┘ │
│ └──────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────┤
│ Tab Bar: [SOAP] [Diagnoses] [Rx] [Labs] [Refer]  │
└──────────────────────────────────────────────────┘
```

#### Tab: Diagnoses

```
┌──────────────────────────────────────────────────┐
│ 📋 Diagnoses                                     │
├──────────────────────────────────────────────────┤
│                                                   │
│ Primary Diagnosis                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ 🔍 Search ICD-10 or condition name...        │ │
│ │ ──────────────────────────────────────────── │ │
│ │ J06.9  Viral Upper Respiratory Infection      │ │
│ │        ⭐ Primary                             │ │
│ │ J11.1  Influenza with respiratory symptoms   │ │
│ │ A90     Dengue Fever [R/O]                   │ │
│ │ B54     Unspecified malaria [R/O]            │ │
│ │  ...                                          │ │
│ └──────────────────────────────────────────────┘ │
│                                                   │
│ Comorbidities                                     │
│ ┌──────────────────────────────────────────────┐ │
│ │ I10   Essential Hypertension           Since  │ │
│ │       2019                              [✓]  │ │
│ │ E11.9 Type 2 Diabetes without complications  │ │
│ │       Since 2021                         [✓] │ │
│ │ [+ Add Comorbidity]                           │ │
│ └──────────────────────────────────────────────┘ │
│                                                   │
│ ICD-10 Search Behavior:                           │
│ - Fuzzy search by name, code, or synonym          │
│ - Recent/frequent diagnoses shown first           │
│ - AI suggests diagnoses based on SOAP notes       │
│ - Mark as Primary, Comorbidity, or Rule-Out       │
│ - Supports multiple primary diagnoses             │
└──────────────────────────────────────────────────┘
```

#### Tab: Prescriptions (Rx)

```
┌──────────────────────────────────────────────────┐
│ 💊 Prescriptions                                  │
├──────────────────────────────────────────────────┤
│                                                   │
│ ┌──────────────────────────────────────────────┐ │
│ │ + Add Medication                    [Template]│ │
│ └──────────────────────────────────────────────┘ │
│                                                   │
│ Paracetamol 650mg Tablet                          │
│ ┌──────────────────────────────────────────────┐ │
│ │ 💊 Paracetamol 650mg                         │ │
│ │ Dosage: 1 tablet      Route: Oral            │ │
│ │ Frequency: Three times a day (TDS)           │ │
│ │ Duration: 5 days      Total: 15 tablets      │ │
│ │ Instructions: After food                     │ │
│ │                                               │ │
│ │ ⚠️ Drug Interaction Check: ✓ No interactions │ │
│ │    with active medications                    │ │
│ │ [Remove]  [Edit]  [✓ Dispensed]               │ │
│ └──────────────────────────────────────────────┘ │
│                                                   │
│ ┌── Drug Search ────────────────────────────────┐ │
│ │ 🔍 Search by brand/generic name...            │ │
│ │ ──────────────────────────────────────────── │ │
│ │ 📋 Recent:                                    │ │
│ │  Paracetamol 650mg Tab                       │ │
│ │  Amoxicillin 250mg Capsule                   │ │
│ │  Metformin 500mg Tab                         │ │
│ │  Amlodipine 5mg Tab                          │ │
│ │                                               │ │
│ │ 📋 Categories:                                │ │
│ │  Analgesics | Antibiotics | Antihypertensives │ │
│ │  Antidiabetics | Antihistamines | Vitamins    │ │
│ └──────────────────────────────────────────────┘ │
│                                                   │
│ Rx Summary:                                       │
│ ┌──────────────────────────────────────────────┐ │
│ │ 1. Paracetamol 650mg TDS × 5d — 15 tabs     │ │
│ │ 2. CBC + Dengue NS1 + Malaria (lab order)   │ │
│ │ Total: ₹0 (lab) + ₹45 (medication)           │ │
│ │ [Print Rx] [E-Prescribe] [Send to Pharmacy]  │ │
│ └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘

Drug Search Behavior:
  - Search by generic name, brand name, or category
  - Shows dosage forms (tab/cap/syrup/injection)
  - Shows available strengths
  - Recent prescriptions shown first
  - AI suggests medications based on diagnosis
  - Drug interaction check runs automatically
  - Allergy alerts shown as banner (e.g., ⚠️ PCN Allergy)
```

#### Tab: Lab Orders

```
┌──────────────────────────────────────────────────┐
│ 🧪 Lab Orders                                     │
├──────────────────────────────────────────────────┤
│                                                   │
│ ┌──────────────────────────────────────────────┐ │
│ │ 🔍 Search lab test or panel...         AI ▼  │ │
│ └──────────────────────────────────────────────┘ │
│                                                   │
│ AI-Recommended (based on symptoms + history)      │
│ ┌──────────────────────────────────────────────┐ │
│ │ ☐ Complete Blood Count (CBC)         ₹300    │ │
│ │ ☐ Dengue NS1 Antigen                 ₹600    │ │
│ │ ☐ Malaria Antigen                    ₹350    │ │
│ │ ☐ CRP Quantitative                   ₹400    │ │
│ │ ☐ Liver Function Test                 ₹500    │ │
│ │                                               │ │
│ │ [Add Selected to Order]                       │ │
│ └──────────────────────────────────────────────┘ │
│                                                   │
│ Ordered Tests                                      │
│ ┌──────────────────────────────────────────────┐ │
│ │ ☑ CBC — ₹300    [Remove]  [View Details]    │ │
│ │ ☑ Dengue NS1 — ₹600  [Remove]  [View Details]│ │
│ │ ☑ Malaria — ₹350     [Remove]  [View Details]│ │
│ │                                               │ │
│ │ Total: ₹1,250                                 │ │
│ │ [Place Order]  [Print Lab Form]               │ │
│ └──────────────────────────────────────────────┘ │
│                                                   │
│ Lab Partners:                                     │
│ ┌──────────────┬─────────┬──────────┬──────────┐ │
│ │ Thyrocare    │ ₹1,250  │ 24h      │ ⭐ 4.5   │ │
│ │ Dr. Lal Path │ ₹1,400  │ 24h      │ ⭐ 4.7   │ │
│ │ Apollo Labs  │ ₹1,550  │ 12h      │ ⭐ 4.8   │ │
│ └──────────────┴─────────┴──────────┴──────────┘ │
│ Home Collection: Available 🟢                     │
└──────────────────────────────────────────────────┘
```

#### Tab: Referrals

```
┌──────────────────────────────────────────────────┐
│ 📋 Referrals                                      │
├──────────────────────────────────────────────────┤
│                                                   │
│ Refer to Specialist                                │
│ ┌──────────────────────────────────────────────┐ │
│ │ Specialty: [Cardiology ▼]                    │ │
│ │ Reason:  [Chest pain on exertion             │ │
│ │           with history of HTN + DM2          │ │
│ │ Priority: [Normal] [Urgent] [Emergency]      │ │
│ │                                               │ │
│ │ Available Doctors (In-Network):               │ │
│ │ ┌──────────┬─────────┬──────┬────────┬─────┐ │ │
│ │ │ Dr.      │ Special │ Avail│ Rating │ Cost│ │ │
│ │ ├──────────┼─────────┼──────┼────────┼─────┤ │ │
│ │ │ Mehta    │ Cardio  │ 🟢   │ 4.9★  │ ₹0  │ │ │
│ │ │ Verma    │ Cardio  │ 🟡   │ 4.7★  │ ₹0  │ │ │
│ │ │ Sharma   │ Cardio  │ 🔴   │ 4.8★  │ ₹0  │ │ │
│ │ └──────────┴─────────┴──────┴────────┴─────┘ │ │
│ │                                               │ │
│ │ Notes for specialist:                         │ │
│ │ ┌──────────────────────────────────────────┐ │ │
│ │ │ Patient has HTN+DM2, now reporting       │ │ │
│ │ │ chest pain on exertion. Recent ECG:      │ │ │
│ │ │ normal. Please evaluate for CAD.         │ │ │
│ │ └──────────────────────────────────────────┘ │ │
│ │                                               │ │
│ │ [Send Referral]                               │ │
│ └──────────────────────────────────────────────┘ │
│                                                   │
│ Active Referrals                                   │
│ ┌──────────────────────────────────────────────┐ │
│ │ 🔄 Dr. Mehta (Cardiology) — Awaiting         │ │
│ │    appointment booking     [View Status]      │ │
│ └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### Pane 3: AI Copilot (Right, 320px min / 25% default)

```
┌───────────────────────────────┐
│ 🤖 AI Copilot          ⌘. ⌘, │
├───────────────────────────────┤
│                               │
│ ──── AI Suggestions ────     │
│                               │
│ 🎯 Diagnosis                  │
│ Based on symptoms + vitals:   │
│                               │
│ 💊 Viral Upper Respiratory    │
│    Infection (J06.9)          │
│    Confidence: 87%            │
│    [Apply] [Dismiss]         │
│                               │
│ ─────────────────────────     │
│                               │
│ 🧪 Recommended Labs           │
│ ┌───────────────────────────┐ │
│ │ CBC                        │ │
│ │ Dengue NS1                 │ │
│ │ Malaria                    │ │
│ │ CRP                        │ │
│ └───────────────────────────┘ │
│ [Add All to Lab Orders]      │
│                               │
│ ──── Clinical Context ────   │
│                               │
│ 📊 This patient's risk        │
│ factors:                      │
│ • HTN + DM2 combination       │
│ • Age 42 >40 screening age   │
│ • Last HbA1c (6.5%) at       │
│   upper boundary              │
│ • Seasonal allergy history    │
│                               │
│ ⚠️ Drug Alert: No conflicts   │
│ with current medications     │
│                               │
│ ──── Quick Actions ────      │
│ 📝 "Generate SOAP draft"     │
│ 💊 "Suggest antibiotics"     │
│ 🔬 "Order CBC + Dengue"     │
│ 📋 "Generate referral note"  │
│ 🏥 "Check admission criteria"│
│                               │
│ ──── Consultation Tips ────  │
│ 💡 Consider: Does patient    │
│    have travel history to    │
│    dengue-endemic area?      │
│ 💡 Patient missed last HbA1c │
│    follow-up (due May 15)    │
│                               │
│ ──── Session Summary ────   │
│ Duration: 12:34              │
│ Notes entered: 245 words     │
│ Diagnoses: 1 primary         │
│ Medications: 1 prescribed    │
│ Labs ordered: 3              │
└───────────────────────────────┘

Collapsed State:
┌──────────────────────────────┐
│ 🤖 AI Copilot  3 suggestions │
└──────────────────────────────┘
```

### End-of-Consultation Flow

```
End Consultation
┌──────────────────────────────────────────────────┐
│ 🛑 End Consultation?                              │
│                                                   │
│ Summary (Auto-generated):                         │
│ ┌──────────────────────────────────────────────┐ │
│ │ Patient: Rajesh Kumar (M/42)                 │ │
│ │ Diagnosis: Viral Upper Respiratory Infection │ │
│ │ Treatment: Paracetamol 650mg TDS × 5 days   │ │
│ │ Labs: CBC, Dengue NS1, Malaria              │ │
│ │ Follow-up: 48 hours / SOS if worsens        │ │
│ └──────────────────────────────────────────────┘ │
│                                                   │
│ Post-Consultation Actions:                        │
│ ☑ Generate SOAP Note & Save to EMR               │
│ ☑ Generate Patient Summary (English + Hindi)     │
│ ☑ Send Prescription to Patient App               │
| ☑ Add to Timeline                                │
| ☑ Update Health Graph                            │
| ☑ Send Notification to Patient                   │
| ☑ Bill Consultation (₹350)                       │
|                                                   │
| [End & Save] [Cancel] [Continue Editing]         │
└──────────────────────────────────────────────────┘

Auto-chain on end:
  1. Save structured SOAP note to database
  2. Generate patient-friendly summary via AI
  3. Create prescription record (if any)
  4. Create lab orders (if any)
  5. Push timeline entry to patient's health timeline
  6. Update Health Graph nodes (diagnosis, medication, encounter)
  7. Send notification to patient app
  8. Create AuditLog entry
  9. Update doctor's dashboard counters
 10. Trigger billing workflow
```

### Patient-Facing Summary View (what patient sees in their app)

```
┌──────────────────────────────────────────────────┐
│ 📋 Visit Summary — Dr. Arun Sharma               │
│ June 4, 2026 · 10:30 AM · Video Consultation     │
├──────────────────────────────────────────────────┤
│                                                   │
│ What we discussed:                                │
│   You've been having fever for 3 days with       │
│   headache and body pain. Your temperature was   │
│   101.1°F. Your throat was red but lungs are     │
│   clear.                                          │
│                                                   │
│ Diagnosis: Viral Infection                        │
│                                                   │
│ Treatment Plan:                                    │
│   💊 Paracetamol 650mg — 1 tablet 3 times a day  │
│      after food for 5 days                        │
│   🧪 Blood tests: CBC, Dengue, Malaria          │
│   🛌 Rest and drink plenty of fluids              │
│                                                   │
│ When to seek emergency care:                       │
│   🚨 If fever goes above 103°F                   │
│   🚨 If you feel confused or drowsy              │
│   🚨 If you have difficulty breathing            │
│                                                   │
│ Next Steps:                                        │
│   📅 Follow-up in 48 hours or if not improving    │
│   🔬 Lab technician will contact you for pickup  │
│                                                   │
│ [Download PDF] [Share] [Add Reminder]             │
└──────────────────────────────────────────────────┘

Languages: English | Hindi | Kannada | Tamil | Telugu | Bengali | Marathi
```

---

## 2. Health Timeline Deep-Dive

### Data Model

```
TimelineEntry {
  id: UUID
  patientId: UUID
  tenantId: UUID
  
  // Core
  eventType: TimelineEventType  // 12 types (see below)
  title: string                 // Short human-readable title
  summary: string              // 1-2 sentence description
  timestamp: DateTime           // When the event occurred
  
  // Rich metadata (polymorphic via eventType)
  metadata: JSON {
    // Appointment
    doctorId, doctorName, appointmentType, status, 
    consultationLink, department
    
    // Lab Result
    labName, reportUrl, isAbnormal, criticalFlags[],
    values: [{name, value, unit, referenceRange, flag}]
    
    // Medication
    medicationName, dosage, frequency, duration,
    prescribedBy, adherence: {taken, missed, total}
    
    // Vitals
    bp: {systolic, diastolic}, heartRate, temperature,
    spo2, rbs, weight, height, bmi
    
    // Diagnosis
    icdCode, icdName, severity, isPrimary,
    diagnosedBy, diagnosedAt
    
    // Prescription
    medications: [{name, dosage, frequency, duration}],
    doctorName, pharmacyName, refillsRemaining
    
    // Immunization
    vaccineName, batchNo, administeredBy,
    facilityName, nextDoseDate
    
    // Care Plan
    planName, goals: [{name, status, dueDate}],
    adherence: number
    
    // Encounter
    encounterType, department, doctorName,
    diagnosisSummary, followUpDate
    
    // Document
    documentType, fileUrl, fileSize,
    uploadedBy, verifiedBy
    
    // Procedure
    procedureName, icdCode, performedBy,
    facility, outcome, complications
    
    // Wellness
    category (exercise/sleep/nutrition/mood),
    value, unit, source (manual/device/app)
  }
  
  // Relations
  sourceId: UUID?            // ID of source record (appointment, lab, etc.)
  sourceType: string?        // "appointment", "lab_result", etc.
  relatedEntryIds: UUID[]    // Links to related timeline entries
  parentId: UUID?            // For threaded/reply entries
  
  // Display
  severity: 'info' | 'warning' | 'critical'
  icon: string              // Icon identifier
  isPinned: boolean          // Pinned to top
  tags: string[]             // User-defined tags
  color: string?             // Override color
  
  // Audit
  createdAt: DateTime
  createdBy: UUID
  updatedAt: DateTime
}

TimelineEventType — 12 Types:
  1. appointment        📅  Doctor visit / consultation
  2. lab_result         🔬  Lab test result uploaded
  3. medication         💊  Medication logged / taken
  4. vital              ❤️  Vital sign recorded
  5. diagnosis          🩺  New diagnosis added
  6. prescription       📄  Prescription issued
  7. immunization       💉  Vaccination administered
  8. care_plan          📋  Care plan created / updated
  9. encounter          🏥  Hospital visit / admission
  10. document          📁  Document uploaded / shared
  11. procedure         🔧  Medical procedure performed
  12. wellness          🌿  Wellness data (exercise, sleep, etc.)
```

### Zoom Levels

```
┌─────────────────────────────────────────────────────────────┐
│ Zoom Level Controls                                          │
│                                                               │
│ [Day] [Week] [Month] [Year] [Custom]                          │
│                                                               │
│ ────────────────────────────────────────────────────────────   │
│                                                               │
│ DAY View (default for today):                                 │
│ Grouped by hour                                               │
│ ┌── 6 AM ───────────────────────────────────────────────────┐ │
│ │                                                           │ │
│ └───────────────────────────────────────────────────────────┘ │
│ ┌── 8 AM ───────────────────────────────────────────────────┐ │
│ │                                                           │ │
│ │ 🩺 08:30 ─── Blood Pressure Check — 128/84 🟢            │ │
│ └───────────────────────────────────────────────────────────┘ │
│ ┌── 10 AM ──────────────────────────────────────────────────┐ │
│ │ 💊 10:00 ─── Took Amlodipine 5mg ✓                       │ │
│ │ 🩺 10:30 ─── Consulted Dr. Sharma (Video)                 │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                               │
│ WEEK View:                                                    │
│ Grouped by day, showing event count per day                   │
│ ┌─ Mon ─┬─ Tue ─┬─ Wed ─┬─ Thu ─┬─ Fri ─┬─ Sat ─┬─ Sun ─┐ │
│ │ 3     │ 1     │ 0     │ 2     │ 5     │ 0     │ 0     │ │
│ │ events│ event │       │events │events │       │       │ │
│ └───────┴───────┴───────┴───────┴───────┴───────┴───────┘ │
│ ┌── Jun 1 (Mon) ───────────────────────────────────────────┐ │
│ │ 🔬 Lab: CBC — Normal                                     │ │
│ │ 💊 Took Metformin 500mg ✓                               │ │
│ │ 🩺 BP Check — 126/82 🟢                                 │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│ MONTH View (default):                                         │
│ Calendar grid + dot indicators                                │
│ ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐                │ │
│ │     │  1  │  2  │  3● │  4●●│  5  │  6  │                │ │
│ │     │     │     │     │●    │     │     │                │ │
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                │ │
│ │  7  │  8  │  9● │ 10  │ 11● │ 12  │ 13  │                │ │
│ │     │     │●    │     │●    │     │     │                │ │
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                │ │
│ │ 14● │ 15  │ 16  │ 17● │ 18  │ 19  │ 20  │                │ │
│ │●    │     │     │●    │     │     │     │                │ │
│ └─────┴─────┴─────┴─────┴─────┴─────┴─────┘                │ │
│                                                               │
│ Selected day expands below calendar to show entries           │
│ ┌── Jun 4 ──────────────────────────────────────────────────┐ │
│ │ 💊 Took Amlodipine 5mg ✓                                 │ │
│ │ 🩺 Consultation: Dr. Sharma — Viral Infection             │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│ YEAR View:                                                    │
│ Compact month grid with activity heatmap                      │
│ ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬────┐│
│ │ Jan │ Feb │ Mar │ Apr │ May │ Jun │ Jul │ Aug │ Sep │... ││
│ │ ██░ │ █░░ │ ███ │ ██░ │ ████│ ██░ │     │     │     │    ││
│ │ 12  │ 4   │ 18  │ 8   │ 24  │ 10  │ -   │ -   │ -   │ -  ││
│ └─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴────┘│
│                                                               │
│ CUSTOM View:                                                  │
│ Date range picker: [From: _____] [To: _____] [Apply]        │
│ Zoom: [1d] [7d] [14d] [30d] [90d]                           │
│ Display: same as Month view for selected range               │
└──────────────────────────────────────────────────────────────┘
```

### Timeline Entry Detail (PAT-008)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ←  Timeline Entry                                          [Share] [⋯]      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 🔬 Lab Report: Complete Blood Count                                          │
│ Thyrocare · June 2, 2026 · 08:30 AM                                         │
│                                                                              │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │  Patient: Priya Sharma (F/35)                                         │ │
│ │  Ordered by: Dr. Arun Sharma                                          │ │
│ │  Report ID: TC-CBC-20260602-00421                                     │ │
│ │  Status: Final ✅                                                      │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ Results                                                                      │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ Test                     Value        Reference Range    Flag          │ │
│ │ ────────────────────────────────────────────────────────────────────── │ │
│ │ Hemoglobin               13.2         12.0-15.0         🟢 Normal     │ │
│ │ RBC Count                4.8          4.2-5.4           🟢 Normal     │ │
│ │ WBC Count                11.2         4.0-10.0          🟡 High       │ │
│ │ Neutrophils              78%          40-75%            🟡 High       │ │
│ │ Lymphocytes              15%          20-45%            🟡 Low        │ │
│ │ Platelets                2.5 lakh     1.5-4.5 lakh      🟢 Normal     │ │
│ │ MCV                      89           80-100            🟢 Normal     │ │
│ │ MCH                      29           27-32             🟢 Normal     │ │
│ │ MCHC                     33           31-36             🟢 Normal     │ │
│ │ RDW                      13.5         11.5-14.5         🟢 Normal     │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ AI Interpretation                                                            │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ 🤖  Elevated WBC with neutrophilia suggests bacterial infection.       │ │
│ │     Consistent with clinical diagnosis of upper respiratory infection.  │ │
│ │     No anemia. Platelets normal (dengue less likely).                  │ │
│ │     Recommend correlating with Dengue NS1 results.                     │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ Attachments                                                                  │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ [📄 CBC_Report_Jun2.pdf — 245 KB] [Download] [View]                   │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ Related Entries                                                              │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ 🔗 Related to: Consultation — Dr. Arun Sharma (Jun 4, 2026)           │ │
│ │ 🔗 Part of: Lab Order #LO-20260602-001                                │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ Actions                                                                      │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ [Share with Doctor] [Download PDF] [Add to Records] [Delete]          │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ Timeline Navigation: [← Prev Entry]  [2 of 47]  [Next Entry →]              │
└─────────────────────────────────────────────────────────────────────────────┘

States:
  Loading:  Skeleton card with result table shimmer
  Error:    "Unable to load report details" with retry button
  Degraded: Shows cached data with "Cached from [date] — may be outdated"
  Deleted:  "This entry has been removed" with option to undo (15s window)
  Pending:  "Results pending — lab processing" with estimated completion time
```

### Timeline Filter & Search

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Filter Bar                                                                   │
│ [All] [Medical] [Appointments] [Medications] [Labs] [Pharmacy] [Wellness]   │
│                                                                              │
│ All: Show everything                                                         │
│ Medical: diagnosis + encounter + procedure + immunization                   │
│ Appointments: appointment                                                    │
│ Medications: medication + prescription                                       │
│ Labs: lab_result                                                             │
│ Pharmacy: prescription (with pharmacy orders)                                │
│ Wellness: wellness                                                            │
│                                                                              │
│ Search:                                                                      │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ 🔍 Search timeline entries... (searches title, summary, metadata)      │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ Quick Filters:                                                               │
│ [🔴 Critical Only] [⭐ Pinned] [📅 This Month] [📸 With Photos]            │
│ [📄 With Documents] [⚠️ Abnormal Results]                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Timeline Interaction Model

```
Interaction Behaviors:

Desktop:
  - Scroll: Vertical timeline with infinite scroll
  - Click entry: Opens PAT-008 detail view
  - Right-click: Context menu (Share, Pin, Edit, Delete, Copy Link)
  - Drag: Reorder pinned items
  - Hover: Quick preview tooltip (title, summary, time, severity)
  
Mobile:
  - Scroll: Vertical timeline with pull-to-refresh
  - Tap entry: Opens PAT-008 detail view
  - Swipe left: Reveals quick actions (Share, Pin, Delete)
  - Swipe right: Mark as read/unread
  - Long press: Context menu
  - Pull down: Refresh timeline
  
Keyboard:
  - ↑↓: Navigate between entries
  - ⏎: Open selected entry
  - ⌘F: Focus search bar
  - Esc: Close detail view / clear search
  - ⌘P: Pin/unpin selected entry
  
Animations:
  - New entries: Slide in from bottom with fade
  - Filter switch: Cross-fade between filtered sets
  - Detail view: Slide up from bottom (mobile) / slide in from right (desktop)
  - Delete: Shrink + fade out with undo toast
  - Pin: Flip animation with slight scale bounce
```

---

## 3. AI Twin Experience

### PAT-030: AI Twin Dashboard (Deep-Dive)

The AI Health Twin is the patient's longitudinal health model — a continuously evolving digital representation that combines health records, real-time data, and AI analysis.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ←  AI Health Twin                                       [Last updated: now]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌── Top Section: Health Score ───────────────────────────────────────────┐ │
│  │                                                                         │ │
│  │     ┌──────────────┐                                                    │ │
│  │     │    82         │  Overall Health Score                             │ │
│  │     │   ┌─────┐    │  ━━━━━━━━━━━━━━━━━━━━━━━━━━○───── 82/100         │ │
│  │     │   │ ▲ +4 │   │  📈 Up from 78 last month                         │ │
│  │     │   └─────┘    │  🎯 Target: 85+                                   │ │
│  │     └──────────────┘  Based on: vitals + labs + adherence + risks      │ │
│  │                                                                         │ │
│  │  Factors:                                                               │ │
│  │    🩺 Conditions     ── Controlled (3/3)      ────●── +15 pts          │ │
│  │    💊 Adherence      ── 85%                     ──●──── +12 pts        │ │
│  │    🔬 Labs           ── 2/5 out of range        ──●──── -8 pts         │ │
│  │    📊 Vitals         ── BP elevated              ──●──── -5 pts         │ │
│  │    🏃 Lifestyle      ── Below target             ──●──── -10 pts       │ │
│  │    📈 Trend          ── Stable ↑                 ────●── +3 pts        │ │
│  │                                                                         │ │
│  │  [Health Score Detail →]                                                │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌── Tab Bar ─────────────────────────────────────────────────────────────┐ │
│  │ [📊 Overview] [🩺 Conditions] [💊 Medications] [📈 Trends] [⚠️ Risks] │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌── Overview Tab ────────────────────────────────────────────────────────┐ │
│  │                                                                         │ │
│  │  Health Summary Cards                                                    │ │
│  │  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐ │ │
│  │  │ 🩺 Conditions      │  │ 💊 Medications     │  │ 🔬 Recent Labs    │ │ │
│  │  │ 3 tracked          │  │ 4 active           │  │ 5 total           │ │ │
│  │  │ ─────             │  │ ─────              │  │ ─────             │ │ │
│  │  │ HTN: Controlled    │  │ Amlodipine 5mg     │  │ CBC:    🟢 Normal │ │ │
│  │  │ DM2: On Target     │  │ Metformin 500mg    │  │ HbA1c:  🟡 6.5%  │ │ │
│  │  │ Allergies: Active  │  │ Atorvastatin 10mg  │  │ LFT:    🟢 Normal │ │ │
│  │  │ + Manage →        │  │ Cetirizine 10mg    │  │ + View All →     │ │ │
│  │  └────────────────────┘  └────────────────────┘  └────────────────────┘ │ │
│  │                                                                         │ │
│  │  Medication Adherence — This Week                                       │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│  │  │ Overall: 85% (42/49 doses)                             ▼ 5% ↓     │ │ │
│  │  │                                                                     │ │ │
│  │  │ Amlodipine 5mg     ████████████░░░░░░░  85%  ───●──  Last: Today  │ │ │
│  │  │ Metformin 500mg    ██████████████░░░░░  92%  ──●───  Last: Today  │ │ │
│  │  │ Atorvastatin 10mg  ██████████░░░░░░░░░  72%  ─●────  Last: Yest  │ │ │
│  │  │ Cetirizine 10mg    ██████████████████░  96%  ────●─  Last: Today  │ │ │
│  │  │                                                                     │ │ │
│  │  │ [Log Medication] [View All] [Set Reminder]                          │ │ │
│  │  └────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  │  Upcoming — AI-Recommended Actions                                      │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│  │  │ 🎯 Based on your health profile, consider:                         │ │ │
│  │  │                                                                     │ │ │
│  │  │ 1. 📅 Schedule diabetes follow-up — Last visit 3 months ago       │ │ │
│  │  │    [Schedule Now] [Remind Later] [Dismiss]                        │ │ │
│  │  │ 2. 🔬 Repeat HbA1c — Due this month                               │ │ │
│  │  │    [Book Test] [Remind Later] [Dismiss]                           │ │ │
│  │  │ 3. 👁️ Annual eye exam — Diabetic retinopathy screening             │ │ │
│  │  │    [Book Appointment] [Remind Later] [Dismiss]                    │ │ │
│  │  │ 4. 🏃 Physical activity — Step count dropped 20%                   │ │ │
│  │  │    [Set Goal] [View Tips] [Dismiss]                               │ │ │
│  │  └────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│  │  │ 💬  Ask your AI Twin                                               │ │ │
│  │  │  ┌────────────────────────────────────────────────────────────┐   │ │ │
│  │  │  │                                                             │ 🚀│ │ │
│  │  │  └────────────────────────────────────────────────────────────┘   │ │ │
│  │  │  Quick: [Am I due for any tests?] [How's my BP trend?]            │ │ │
│  │  │         [Check drug interactions] [What should I ask my doctor?]  │ │ │
│  │  └────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  │  Health Trends (6 Months)                                               │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                                                                     │ │ │
│  │  │  BP Systolic  ─────●────●──●────────────────  Avg: 128            │ │ │
│  │  │  BP Diastolic ───●───────●─●────────────────  Avg: 84             │ │ │
│  │  │                                                                     │ │ │
│  │  │  ┌──────┬──────┬──────┬──────┬──────┬──────┐                       │ │ │
│  │  │  │  Jan │  Feb │  Mar │  Apr │  May │  Jun │                       │ │ │
│  │  │  ├──────┼──────┼──────┼──────┼──────┼──────┤                       │ │ │
│  │  │  │ 132  │ 130  │ 128  │ 126  │ 130  │ 128 │   Systolic            │ │ │
│  │  │  │  86  │  84  │  82  │  84  │  86  │  84 │   Diastolic           │ │ │
│  │  │  └──────┴──────┴──────┴──────┴──────┴──────┘                       │ │ │
│  │  │                                                                     │ │ │
│  │  │  HbA1c: 6.8 → 6.6 → 6.5 → 6.5                                     │ │ │
│  │  │                                                                     │ │ │
│  │  │  [View Full Trends →]                                               │ │ │
│  │  └────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🏠 Home  │ 📋 Timeline  │ 🏥 Care  │ 💊 Pharmacy  │ ⚙️ Settings            │
└─────────────────────────────────────────────────────────────────────────────┘

States:
  Loading:   Full-page skeleton — health score circle pulsing with "Analyzing your health data..."
             risk cards shimmering, trend chart placeholder, medication bars loading
  Empty:     "Welcome to your AI Health Twin!" state with illustration
             "The more data you share, the smarter your twin becomes"
             CTA buttons: [Book Your First Appointment] [Upload Medical Record]
             [Connect ABHA (Ayushman Bharat)] [Log Your First Vital]
  Low Data:  Twin works with partial data. Section-level empty states:
             "Start logging medications to track adherence"
             "Upload lab reports for AI-powered analysis"
             "Connect a device to track vitals automatically"
  Error:     "Unable to update your health twin. Showing data from [date]."
             "Some features may be limited until data refreshes."
             Retry button per failed section
  Stale:     "Last updated 3 days ago — Data may be outdated. [Refresh All]"
```

### PAT-031: AI Twin Ask — Chat Interface

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ←  Ask Your AI Twin                                    [New Chat] [History] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Today                                                               │ │
│  │                                                                       │ │
│  │  ┌──────────────────────────────────────────── User ──────────────┐  │ │
│  │  │ What's my blood pressure trend over the last 3 months?          │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                       │ │
│  │  ┌────────────────── AI Twin ──────────────────────────────────────┐  │ │
│  │  │ 📊 Your BP has been stable with slight improvement:              │  │ │
│  │  │                                                                   │  │ │
│  │  │  ┌──────┬──────┬──────┬──────┬──────┬──────┐                     │  │ │
│  │  │  │ Mar  │ Apr  │ May  │ Jun  │ Jul  │ Aug  │                     │  │ │
│  │  │  ├──────┼──────┼──────┼──────┼──────┼──────┤                     │  │ │
│  │  │  │ 132  │ 130  │ 128  │ 126  │ 128  │ 126  │  Systolic         │  │ │
│  │  │  │  86  │  85  │  84  │  82  │  84  │  82  │  Diastolic        │  │ │
│  │  │  └──────┴──────┴──────┴──────┴──────┴──────┘                     │  │ │
│  │  │                                                                   │  │ │
│  │  │ ✅ Your BP is well controlled. Target: <130/80.                   │  │ │
│  │  │ 📈 Trend: Stable with slight improvement.                         │  │ │
│  │  │ 💡 Tip: Consistency with Amlodipine is working well.              │  │ │
│  │  │                                                                   │  │ │
│  │  │ [View in Trends] [Share] [Source: BP Logs + Appointments]        │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                       │ │
│  │  ┌──────────────────────────────────────── User ───────────────────┐  │ │
│  │  │ Am I due for any health screenings?                              │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                       │ │
│  │  ┌────────────────── AI Twin ──────────────────────────────────────┐  │ │
│  │  │ Based on your profile (M/42, HTN, DM2):                          │  │ │
│  │  │                                                                   │  │ │
│  │  │ 🔴 Overdue:                                                       │  │ │
│  │  │  • HbA1c — Due Jun 15 (7 days)              [Book Test]          │  │ │
│  │  │  • Diabetic eye exam — Due this month        [Book Appt]         │  │ │
│  │  │                                                                   │  │ │
│  │  │ 🟡 Due Soon:                                                     │  │ │
│  │  │  • Lipid profile — Due Aug 2026                                   │  │ │
│  │  │  • Microalbuminuria — Due Sep 2026                                │  │ │
│  │  │                                                                   │  │ │
│  │  │ 🟢 Completed:                                                     │  │ │
│  │  │  • CBC — Jun 2, 2026 ✓                                           │  │ │
│  │  │  • ECG — Apr 2026 ✓                                              │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                       │ │
│  │  ┌──────────────────────────────────────── User ───────────────────┐  │ │
│  │  │ Should I be worried about my chest pain?                         │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                       │ │
│  │  ┌────────────────── AI Twin ──────────────────────────────────────┐  │ │
│  │  │ ⚠️ Important Medical Disclaimer                                    │  │ │
│  │  │ I'm an AI assistant, not a doctor. Chest pain requires            │  │ │
│  │  │ immediate medical evaluation.                                     │  │ │
│  │  │                                                                   │  │ │
│  │  │ Based on your records:                                            │  │ │
│  │  │ • You have HTN + DM2 (risk factors for heart disease)             │  │ │
│  │  │ • Last ECG (Apr 2026): Normal                                     │  │ │
│  │  │ • No prior cardiac events recorded                                │  │ │
│  │  │                                                                   │  │ │
│  │  │ 🚨 If you're experiencing chest pain NOW, please:                 │  │ │
│  │  │  • Call emergency services (108)                                  │  │ │
│  │  │  • Go to the nearest emergency room                               │  │ │
│  │  │  • Do not drive yourself                                          │  │ │
│  │  │                                                                   │  │ │
│  │  │ [Book Urgent Appointment] [Call 108] [View ER Locations]          │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                       │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Suggested Questions                                                     │ │
│  │  [What medications am I taking?] [Check my symptoms]                     │ │
│  │  [How is my diabetes?] [What should I ask my doctor?]                    │ │
│  │  [Analyze my lab results] [Health tips for my condition]               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ Type your health question...                                    🎙️ 📎  │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ Responses powered by: Health Graph + Vector Memory + Gemini 2.5 Flash       │
│ Sources include: your medical records, lab results, medications, vitals,     │
│ appointment history, and clinical knowledge graph                            │
└─────────────────────────────────────────────────────────────────────────────┘

Chat Behaviors:
  - Streaming responses (SSE-based typing effect)
  - Source citations with clickable links to records
  - Medical disclaimer on all diagnostic/treatment questions
  - Emergency escalation for urgent symptoms
  - Context window: last 20 messages
  - Suggested follow-up questions generated by AI
  - Voice input support (Web Speech API)
  - File upload: lab reports, prescription images for AI analysis
```

### PAT-032: AI Twin Risks — Risk Analysis View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ←  Risk Analysis                              [Last updated: Jun 4, 2026]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Overall Risk Profile                                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                         │ │
│  │  ┌──────────────┐                                                       │ │
│  │  │  Moderate     │  Risk Level based on: conditions, vitals, labs,     │ │
│  │  │  ┌─────┐     │  lifestyle, family history, age, gender              │ │
│  │  │  │ ⚠️  │     │                                                       │ │
│  │  │  └─────┘     │  2 conditions require monitoring                      │ │
│  │  └──────────────┘  Last assessment: Today · AI-graph fusion             │ │
│  │                                                                         │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Risk Breakdown                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Condition            Score      Level           Trend        Action    │ │
│  │ ────────────────────────────────────────────────────────────────────── │ │
│  │ 🩸 Hypertension      72/100   ⚠️ Moderate      ───●── ↓    [Manage]  │ │
│  │ 🍬 Diabetes Type 2   85/100   🔴 High          ──●─── →    [Manage]  │ │
│  │ ❤️ Cardiac Risk      45/100   🟢 Low           ─●──── →    [View]    │ │
│  │ 🫁 Respiratory       22/100   🟢 Low           ──●─── →    [View]    │ │
│  │ 🧠 Stroke            35/100   🟢 Low           ──●─── →    [View]    │ │
│  │ 🦴 Osteoporosis      12/100   🟢 Low           ──●─── →    [View]    │ │
│  │                                                                         │ │
│  │  Risk Score = Graph traversal (proximity to disease nodes) +           │ │
│  │              Clinical rules (BP >130, HbA1c >7, BMI >30, smoking) +   │ │
│  │              Trend analysis (worsening/stable/improving)               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Hypertension Risk Detail                                                    │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Risk Score: 72/100 — Moderate                                          │ │
│  │  Trend: Improving (▼ 5 pts in 3 months)                                │ │
│  │                                                                         │ │
│  │  Contributing Factors:                                                  │ │
│  │  ✓ BP Systolic: 128 (Target: <130)              ── +15 pts            │ │
│  │  ✓ BP Diastolic: 84 (Target: <80)               ── +20 pts            │ │
│  │  ✓ BMI: 27.5 (Overweight)                        ── +15 pts            │ │
│  │  ✓ Age: 42 (>40 male)                            ── +10 pts            │ │
│  │  ✓ Family history: Father had HTN                ── +12 pts            │ │
│  │                                                                         │ │
│  │  Protective Factors:                                                    │ │
│  │  ✓ Non-smoker                                     ── -15 pts           │ │
│  │  ✓ Regular medication adherence (85%)             ── -10 pts           │ │
│  │  ✓ No salt restriction                            ── -5 pts            │ │
│  │                                                                         │ │
│  │  Recommendations:                                                       │ │
│  │  💊 Continue Amlodipine 5mg daily                                      │ │
│  │  🧂 Reduce sodium intake to <2g/day                                    │ │
│  │  🏃 30 min moderate exercise 5x/week                                   │ │
│  │  📊 Monitor BP daily, log in app                                       │ │
│  │  📅 Follow-up: Dr. Sharma in 3 months                                  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Diabetes Risk Detail                                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Risk Score: 85/100 — High                                             │ │
│  │  Trend: Stable (→ 0 pts in 3 months)                                   │ │
│  │                                                                         │ │
│  │  Contributing Factors:                                                  │ │
│  │  ✓ HbA1c: 6.5% (Target: <7%)                  ── +25 pts              │ │
│  │  ✓ Fasting Glucose: 112 (Target: <100)          ── +20 pts            │ │
│  │  ✓ BMI: 27.5 (Overweight)                       ── +15 pts            │ │
│  │  ✓ DM2 Duration: 5 years                        ── +15 pts            │ │
│  │  ✓ Family history: Mother had DM2                ── +10 pts            │ │
│  │                                                                         │ │
│  │  Protective Factors:                                                    │ │
│  │  ✓ Metformin adherence (92%)                     ── -10 pts            │ │
│  │  ✓ No smoking                                     ── -10 pts           │ │
│  │                                                                         │ │
│  │  Recommendations:                                                       │ │
│  │  💊 Continue Metformin 500mg BID                                       │ │
│  │  📊 Monitor FBS weekly, log in app                                     │ │
│  │  🧪 Repeat HbA1c in 3 months (due Jun 15)                              │ │
│  │  👁️ Annual diabetic eye exam (overdue)                                 │ │
│  │  🦶 Annual foot exam                                                   │ │
│  │  🏃 Target: 10,000 steps/day — currently 6,500 avg                    │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Timeline: Risk Score History                                                 │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Risk Score Over Time                                                    │ │
│  │                                                                         │ │
│  │  90 ┤                    ●─○                                            │ │
│  │  80 ┤           ●──●──●─●──●──●──●                                     │ │
│  │  70 ┤  ●──●──●─●                                                        │ │
│  │  60 ┤─●                                                                │ │
│  │     └─────────────────────────────────────────────────                  │ │
│  │     Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct                    │ │
│  │     ● HTN    ○ DM2                                                     │ │
│  │                                                                         │ │
│  │  Events:                                                                │ │
│  │  Jan: DM2 diagnosis                                                    │ │
│  │  Mar: Started Metformin                                                │ │
│  │  May: Medication adjustment — HbA1c improved                           │ │
│  │  Jun: Current — stable                                                  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🏠 Home  │ 📋 Timeline  │ 🏥 Care  │ 💊 Pharmacy  │ ⚙️ Settings            │
└─────────────────────────────────────────────────────────────────────────────┘

States:
  Loading:  Risk cards shimmer with score placeholders
  Empty:    "Not enough data for risk assessment. Add health records to begin."
  Stable:   All risks within normal range — green checkmark celebration
  Warning:  1+ moderate risks — yellow banner with recommendation
  Critical: 1+ high risks — red banner + urgent action recommendations
  Error:    "Risk assessment temporarily unavailable — showing cached results"
```

### PAT-033: AI Twin Trends — Longitudinal Health Trends

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ←  Health Trends                                [Last updated: Jun 4, 2026] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌── Metric Selector ─────────────────────────────────────────────────────┐ │
│  │ [BP] [Glucose] [HbA1c] [Weight/BMI] [Cholesterol] [Heart Rate] [Custom]│ │
│  │                                                Range: [6M ▼] [Chart ▼] │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Blood Pressure (6 Months)                                                   │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Systolic ─────●────●──●────●─────●─────●──  Avg: 128                  │ │
│  │                   ╲  ╱                                                 │ │
│  │ Diastolic ───●───────●─●────●──────●──────  Avg: 84                   │ │
│  │              Jan  Feb  Mar  Apr  May  Jun                              │ │
│  │                                                                         │ │
│  │ Statistics:  Avg: 128/84  Min: 118/76  Max: 142/92  SD: 6.2          │ │
│  │ Target: <130/80  🟢 Within range (82% of readings)                     │ │
│  │ Trend: Stable with slight improvement (slope: -0.8/month)              │ │
│  │                                                                         │ │
│  │ Insights:                                                               │ │
│  │ 💡 Morning readings (7-9 AM) avg 2-3 pts higher → take meds early     │ │
│  │ 💡 Weekend readings trend lower (avg 124/80 vs 130/85 weekday)        │ │
│  │ 💡 Good consistency over past 3 months                                  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  HbA1c (24 Months)                                                           │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  7.0 ┤                                                                │ │
│  │      │                        ●                                       │ │
│  │  6.8 ┤              ●─────────┤                                        │ │
│  │      │             ●           ╲                                       │ │
│  │  6.6 ┤            ●             ●─────●───                             │ │
│  │      │           ●                     ╲  ╲                            │ │
│  │  6.4 ┤──────────●───────────────────────●──●── Target: 6.5            │ │
│  │      │                                    │  ╲                          │ │
│  │      └────────────────────────────────────┼───┼───────────────────      │ │
│  │       Jul  Sep   Nov   Jan   Mar   May   Jul  Sep                     │ │
│  │                2025                        2026                        │ │
│  │                                                                         │ │
│  │ Values: 6.8 (Jul 25) → 6.6 (Nov 25) → 6.5 (Mar 26) → 6.5 (Jun 26)   │ │
│  │ Target: <7.0%  🟢 Well controlled                                     │ │
│  │ Trend: Improving → Stable (slope: -0.02/month)                         │ │
│  │                                                                         │ │
│  │ Insights:                                                               │ │
│  │ 💡 Metformin + lifestyle changes are working well                      │ │
│  │ 💡 Next target: HbA1c <6.5% (current: 6.5%)                           │ │
│  │ 💡 Maintain current regimen — no adjustment needed                     │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Weight / BMI                                                                │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  80 ┤●                                                                │ │
│  │  78 ┤ ╲  ●──●──●──●──●                                                │ │
│  │  76 ┤──●───────╲─────────●──●──●──●──●                                │ │
│  │  74 ┤──────────────────────╲────────────────●──                        │ │
│  │  72 ┤─────────────────────────────────────────╲──                      │ │
│  │      └────────────────────────────────────────────────                  │ │
│  │       Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep                      │ │
│  │                                                                         │ │
│  │ Current: 76 kg  Starting: 82 kg  Lost: 6 kg (7.3%)                    │ │
│  │ BMI: 27.5 (Overweight)  Target BMI: <25 (69 kg)                       │ │
│  │ Trend: Decreasing (-0.7 kg/month) — On track                           │ │
│  │                                                                         │ │
│  │ Insights:                                                               │ │
│  │ 💡 You've lost 6 kg in 9 months — great progress!                      │ │
│  │ 💡 At current rate, target BMI achieved by Dec 2026                    │ │
│  │ 💡 Weight loss positively correlates with BP improvement               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Correlation View                                                           │ │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                         │ │
│  │  BP vs Weight: Positive correlation (r = 0.72)                         │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │  SYS ┤ ●                                                         │  │ │
│  │  │  140 ┤  ● ●                                                      │  │ │
│  │  │  135 ┤    ● ●    ●                                                │  │ │
│  │  │  130 ┤         ● ● ●    ●                                        │  │ │
│  │  │  125 ┤               ●   ● ●                                     │  │ │
│  │  │  120 ┤                    ●                                       │  │ │
│  │  │      └────────────────────────────────                            │  │ │
│  │  │        74  75  76  77  78  79  80  81  82  kg                     │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  │  As weight decreases, BP improves — each 1kg loss ≈ 1.2 mmHg systolic │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Export Options                                                              │
│  [Download as CSV] [Download as PDF] [Share with Doctor] [Print]             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🏠 Home  │ 📋 Timeline  │ 🏥 Care  │ 💊 Pharmacy  │ ⚙️ Settings            │
└─────────────────────────────────────────────────────────────────────────────┘

Chart Interactions:
  - Hover: Crosshair + tooltip with exact value and date
  - Click: Drill down to see individual readings
  - Drag: Select time range to zoom
  - Pinch (mobile): Zoom in/out
  - Long press: Share chart as image
  - Toggle metrics: Show/hide individual lines
  - Comparison mode: Overlay previous year
```

### AI Twin Recommendation Engine

```
Recommendation Priority Algorithm:
  1. Clinical urgency (overdue screenings > upcoming > lifestyle)
  2. Risk score impact (actions that reduce highest risk first)
  3. Patient readiness (based on past adherence behavior)
  4. Time sensitivity (approaching deadlines first)

Recommendation Types:
  📅 Appointment       — Follow-up, specialist, screening
  🧪 Lab Test          — Repeating overdue tests, new recommended tests
  💊 Medication        — Adherence improvement, dosage review
  🏃 Lifestyle         — Exercise, diet, sleep, stress
  📚 Education         — Condition-specific articles, videos
  🩺 Screening         — Age/gender/condition-based preventive care

Recommendation Cards:
  ┌──────────────────────────────────────────────────────────────┐
  │ 🎯 Schedule Diabetes Follow-Up                                │
  │ Priority: 🔴 High · Due: 3 months overdue                     │
  │                                                               │
  │ Your last diabetes follow-up was 3 months ago.                │
  │ Regular monitoring is essential for managing Type 2 Diabetes. │
  │                                                               │
  │ Impact: Reduces risk score by ~10 pts                         │
  │ Easy: ⭐⭐⭐ · Clinical benefit: ⭐⭐⭐⭐⭐                  │
  │                                                               │
  │ [Schedule with Dr. Sharma] [Book Any Doctor] [Dismiss]       │
  │ [Remind me in 1 week]                                         │
  └──────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────┐
  │ 🏃 Increase Physical Activity                                │
  │ Priority: 🟡 Medium · Based on step count trend              │
  │                                                               │
  │ Your average daily steps dropped from 8,200 to 6,500 (-20%). │
  │ Target: 10,000 steps/day                                     │
  │                                                               │
  │ Impact: Reduces HTN risk by ~5 pts, DM2 risk by ~8 pts       │
  │ Easy: ⭐⭐⭐⭐ · Clinical benefit: ⭐⭐⭐⭐               │
  │                                                               │
  │ [Set Goal: 8,000 steps] [View Walking Plan] [Dismiss]       │
  │ [Remind me tomorrow]                                          │
  └──────────────────────────────────────────────────────────────┘
```

### Health Memory — How the AI Twin Learns

```
Health Memory Architecture:

  Layer 1: Structured Records (Database)
    ┌─────────────────────────────────────────┐
    │  Diagnoses        Medications           │
    │  Lab Results      Vitals                │
    │  Appointments     Procedures            │
    │  Immunizations    Care Plans            │
    └─────────────────────────────────────────┘
    Source: Prisma → Health Graph → Timeline

  Layer 2: Embeddings (Vector Store)  
    ┌─────────────────────────────────────────┐
    │  Consultation Notes (SOAP)              │
    │  Lab Report Interpretations             │
    │  Doctor's Free-text Notes               │
    │  Patient Communication History          │
    │  AI Analysis Results                    │
    └─────────────────────────────────────────┘
    Source: Gemini embeddings → pgvector

  Layer 3: Graph (Relationships)
    ┌─────────────────────────────────────────┐
    │  Disease → Symptom edges               │
    │  Medication → Condition edges          │
    │  Patient → Risk edges                   │
    │  Temporal relationships                 │
    │  Causal pathways                        │
    └─────────────────────────────────────────┘
    Source: Health Graph (17 node types, 21 relations)

  Memory Retrieval:
    - Query: "How's my blood pressure trend?"
    - Step 1: Retrieve structured BP readings (Layer 1)
    - Step 2: Get relevant consultation context (Layer 2)
    - Step 3: Traverse graph for risk assessment (Layer 3)
    - Step 4: Fuse via LLM → natural language response

  Learning over time:
    - Tracks what questions patient asks most
    - Learns communication preferences (detailed vs summary)
    - Remembers previous recommendations and follow-ups
    - Adapts to patient's health literacy level
    - Recognizes patterns (e.g., "You usually ask about BP on Mondays")
```

---

## References

- **Part 1**: `PRODUCT_SPECIFICATION_P1.md` — Screen inventory (118 screens), navigation architecture, 10 detailed screens
- **Part 3**: `PRODUCT_SPECIFICATION_P3.md` — Staff queue engine, Tenant hierarchy, Mobile wireframes, Design system v2, E2E workflows
- **Enterprise Architecture**: `ENTERPRISE_ARCHITECTURE.md` — System architecture, DB schema, RBAC, APIs, events, infra

---

*End of Part 2 — covers Consultation Workspace, Health Timeline, and AI Twin Experience*
