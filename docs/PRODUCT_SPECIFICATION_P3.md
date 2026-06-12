# WYSHCARE OS — Product Specification Part 3

> Staff Queue Engine · Tenant Hierarchy · Mobile Wireframes · Design System v2 · E2E Workflows
> Enterprise workflows, multi-tenant architecture, responsive design, interaction models.

---

## Contents

- [1. Staff Queue Engine](#1-staff-queue-engine)
- [2. Hospital Multi-Tenant Hierarchy](#2-hospital-multi-tenant-hierarchy)
- [3. Mobile Wireframes (375px)](#3-mobile-wireframes-375px)
- [4. Design System v2](#4-design-system-v2)
- [5. Complete E2E Workflows](#5-complete-e2e-workflows)

---

## 1. Staff Queue Engine

### Overview

The Staff Queue Engine manages patient flow through a clinical facility: Check-In → Vitals → Doctor → Lab → Pharmacy → Billing. Each station has a dedicated dashboard with real-time WebSocket updates, role-based views, and drag-and-drop queue management.

### Queue Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PATIENT FLOW                                        │
│                                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │ CHECK-IN │───▶│ VITALS   │───▶│ DOCTOR   │───▶│ LAB      │             │
│  │          │    │          │    │          │    │          │             │
│  │ Reception│    │ Nurse    │    │ Doctor   │    │ Lab Tech │             │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘             │
│       │               │               │               │                   │
│       ▼               ▼               ▼               ▼                   │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │ BILLING  │◀───│ PHARMACY │◀───│ DISCHARGE│◀───│ RESULTS  │             │
│  │          │    │          │    │          │    │          │             │
│  │ Cashier  │    │ Pharma   │    │ Staff    │    │ Review   │             │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘             │
│                                                                              │
│  Each station is an independent queue with:                                  │
│  - WebSocket real-time updates                                               │
│  - Role-based access (receptionist, nurse, doctor, lab, pharmacy, cashier)   │
│  - Status transitions (Waiting → In Progress → Completed → Next Station)     │
│  - SLA timers per station                                                    │
│  - Push notifications on status changes                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### STF-003: Reception Dashboard (Queue Command Center)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🏪 Reception Dashboard                      Apollo Clinic · Jun 4, 2026      │
│ Welcome, Priya · Receptionist                     🟢 On Duty                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ 📅 Total     │  │ ✅ Checked In│  │ ⏳ Waiting   │  │ ❌ No-show   │   │
│  │ Today: 24    │  │ 8            │  │ 5            │  │ 2            │   │
│  │ ─────        │  │ ─────        │  │ ─────        │  │ ─────        │   │
│  │ Last: 32     │  │ ↑ 25% from   │  │ ↓ 2 from     │  │ ↑ 1 from     │   │
│  │              │  │ yesterday    │  │ yesterday    │  │ yesterday    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                              │
│  ⏱ Average Wait Times: Check-In: 2m | Vitals: 5m | Doctor: 14m |           │
│                          Lab: 8m | Pharmacy: 4m | Billing: 3m               │
│                          ⚠️ Doctor queue is above threshold (target: <10m)  │
│                                                                              │
│  ┌── Real-Time Queue Board ───────────────────────────────────────────────┐ │
│  │                                                                         │ │
│  │  ┌──────────────┬──────┬──────────┬────────┬──────┬──────┬──────────┐  │ │
│  │  │ Queue        │ Wait │ Count    │ Status │ Next │ SLA  │ Action   │  │ │
│  │  ├──────────────┼──────┼──────────┼────────┼──────┼──────┼──────────┤  │ │
│  │  │ ✅ Check-In  │ 2m   │ 5        │ 🟢     │ R.K. │ 5m   │ [View]  │  │ │
│  │  │ ❤️ Vitals   │ 5m   │ 3        │ 🟡     │ P.S. │ 8m   │ [Call]  │  │ │
│  │  │ 🩺 Doctor    │ 14m  │ 4        │ 🔴     │ A.G. │ 10m  │ [Alert] │  │ │
│  │  │ 🧪 Lab       │ 8m   │ 2        │ 🟡     │ V.J. │ 10m  │ [View]  │  │ │
│  │  │ 💊 Pharmacy  │ 4m   │ 1        │ 🟢     │ S.P. │ 8m   │ [View]  │  │ │
│  │  │ 💳 Billing   │ 3m   │ 2        │ 🟢     │ A.S. │ 5m   │ [View]  │  │ │
│  │  └──────────────┴──────┴──────────┴────────┴──────┴──────┴──────────┘  │ │
│  │                                                                         │ │
│  │  Status Legend: 🟢 Normal 🟡 Approaching SLA 🔴 Exceeded SLA          │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌── Detailed Queue ───────────────────────────────────────────────────────┐ │
│  │  Tab: [🩺 All] [✅ Check-In] [❤️ Vitals] [🩺 Doctor] [🧪 Lab]          │ │
│  │       [💊 Pharmacy] [💳 Billing]                                        │ │
│  │                                                                         │ │
│  │  Dr. Arun Sharma — Waiting Room                      ⏱ 14 min avg     │ │
│  │  ┌────────┬────────────┬────────┬────────┬──────────┬───────────────┐  │ │
│  │  │ Pos    │ Patient     │ Type   │ Wait   │ Status   │ Action        │  │ │
│  │  ├────────┼────────────┼────────┼────────┼──────────┼───────────────┤  │ │
│  │  │ 1      │ Rajesh K.  │ 🩺 New │ 18m 🔴 │ 🔴 Wait  │ [Call] [Skip] │  │ │
│  │  │ 2      │ Priya S.   │ 🩺 F/U │ 12m 🟡 │ 🟡 Wait  │ [Call] [Skip] │  │ │
│  │  │ 3      │ Amit S.    │ 🔬 Lab │ 8m 🟢  │ 🟢 Nurse  │ [Pending]    │  │ │
│  │  │ 4      │ Ananya G.  │ 🩺 F/U │ 5m 🟢  │ 🟢 Nurse  │ [Pending]    │  │ │
│  │  │ 5      │ Sunita P.  │ 🩺 New │ 3m 🟢  │ 🟢 Reg    │ [Pending]    │  │ │
│  │  └────────┴────────────┴────────┴────────┴──────────┴───────────────┘  │ │
│  │                                                                         │ │
│  │  [Check In Patient] [Walk-In Registration] [View All Appointments]     │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌── SLA Alerts ───────────────────────────────────────────────────────────┐ │
│  │  🔴 Dr. Sharma's queue exceeded SLA (14m avg, target 10m)              │ │
│  │  🟡 Vitals queue approaching SLA (5m avg, target 8m)                   │ │
│  │  [Dismiss All]                                                          │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📋 Queue │ ✅ Check-In │ ➕ Walk-In │ 💳 Billing │ ⚙️ Settings             │
└─────────────────────────────────────────────────────────────────────────────┘

Queue Item States (per station):
  📋 Registered      — Patient checked in, not yet at station
  ⏳ Waiting         — In station queue, awaiting service
  🟢 In Progress     — Currently being served
  ✅ Completed       — Service done, moving to next station
  ⏭ Skipped         — Passed over (patient not ready, will return)
  ❌ No Show         — Patient didn't arrive after 3 calls
  🔄 Transfer       — Sent to different station/external referral

WebSocket Events (Real-Time):
  queue.patient.added       — New patient enters a queue
  queue.patient.called      — Staff calls patient to station
  queue.patient.served      - Service started for patient
  queue.patient.completed   — Service completed, moved to next queue
  queue.patient.skipped     — Patient skipped in queue
  queue.patient.no-show     — Patient marked as no-show
  queue.sla.breached        — Station exceeded SLA threshold
  queue.sla.warning         — Station approaching SLA threshold
  queue.stats.updated       — Queue statistics refreshed
```

### STF-005: Check-In Walkthrough

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ✅ Check In Patient                              [Back to Queue]            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌── Search Patient ──────────────────────────────────────────────────────┐ │
│  │ 🔍 Search by name, phone, ABHA, or UHID...                             │ │
│  │                                                                         │ │
│  │ Recent:                                                                 │ │
│  │  Rajesh Kumar    +91-98765-43210    #WSP-00421     [Select]            │ │
│  │  Priya Sharma    +91-87654-32109    #WSP-00422     [Select]            │ │
│  │  Amit Singh      +91-76543-21098    #WSP-00423     [Select]            │ │
│  │                                                                         │ │
│  │ [Register New Patient →]                                                 │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌── Selected: Rajesh Kumar ──────────────────────────────────────────────┐ │
│  │                                                                         │ │
│  │  🧑 Rajesh Kumar  ·  42 yrs  ·  Male                                   │ │
│  │  📞 +91-98765-43210  ·  📧 rajesh.k@email.com                          │ │
│  │  🆔 #WSP-00421  ·  ABHA: 45-6789-0123                                  │ │
│  │                                                                         │ │
│  │  Appointment: 10:30 AM — Dr. Arun Sharma (General Medicine)            │ │
│  │  Visit Type: 🩺 New Consultation                                        │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  │ Consent verified ✓ | Insurance verified ✓ | Previous records: 7   │ │
│  │  └────────────────────────────────────────────────────────────────────┘ │
│  │                                                                         │ │
│  │  ┌── Check-In Details ──────────────────────────────────────────────┐  │ │
│  │  │                                                                   │  │ │
│  │  │ Arrival Mode: [🟢 On Time] [🟡 Late (5m)] [🔴 Late (15m+)]      │  │ │
│  │  │ Wait Time: 18 min so far                                          │  │ │
│  │  │ Route To: [❤️ Vitals] [🩺 Doctor Direct] [🧪 Lab]               │  │ │
│  │  │ Notes: Patient has fasted for lab work                            │  │ │
│  │  │                                                                   │  │ │
│  │  │ [✅ Confirm Check-In]  [Cancel]                                   │  │ │
│  │  └───────────────────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Confirmation Toast: "Rajesh Kumar checked in → Vitals Queue (#2)" [Undo]  │
└─────────────────────────────────────────────────────────────────────────────┘

States:
  Search Empty:    "No patient found. [Register New Patient]"
  Search Results:  List matching patients with key details
  Selected:        Patient detail card with check-in form
  Checked In:      Success toast with queue position + undo button
  Duplicate:       "Patient already checked in today" warning
```

### STF-009: Nurse Vitals Entry

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ❤️ Vitals Entry — Rajesh Kumar                     🟢 In Progress · 2:34   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌── Previous Vitals ─────────────────────────────────────────────────────┐ │
│  │  May 28, 2026: BP 128/85 | HR 88 | Temp 36.8°C | SpO2 99% | RBS 108  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌── Vitals Form ──────────────────────────────────────────────────────────┐ │
│  │                                                                         │ │
│  │  Blood Pressure                Heart Rate                               │ │
│  │  ┌──────────┐ / ┌──────────┐  ┌──────────────────────┐                 │ │
│  │  │ 128      │   │ 84       │  │ 92                   │                 │ │
│  │  └──────────┘   └──────────┘  └──────────────────────┘                 │ │
│  │  Systolic       Diastolic     bpm                                       │ │
│  │  Range: <130    Range: <80    Range: 60-100                            │ │
│  │                                                                         │ │
│  │  Temperature                  Oxygen Saturation                         │ │
│  │  ┌──────────────────────┐    ┌──────────────────────┐                   │ │
│  │  │ 38.4                 │    │ 98                   │                   │ │
│  │  └──────────────────────┘    └──────────────────────┘                   │ │
│  │  °C                         %                                          │ │
│  │  Range: 36.5-37.5 🔴 Fever  Range: 95-100                            │ │
│  │                                                                         │ │
│  │  Respiratory Rate             Random Blood Sugar                        │ │
│  │  ┌──────────────────────┐    ┌──────────────────────┐                  │ │
│  │  │ 18                   │    │ 112                  │                  │ │
│  │  └──────────────────────┘    └──────────────────────┘                  │ │
│  │  breaths/min                 mg/dL                                      │ │
│  │  Range: 12-20                Range: <140                              │ │
│  │                                                                         │ │
│  │  Weight                       Height                                    │ │
│  │  ┌──────────────────────┐    ┌──────────────────────┐                  │ │
│  │  │ 76.0                 │    │ 172                  │                  │ │
│  │  └──────────────────────┘    └──────────────────────┘                  │ │
│  │  kg                           cm                                        │ │
│  │  ─── BMI: 25.7 (Overweight) ───                                        │ │
│  │                                                                         │ │
│  │  ┌── Pain Assessment ──────────────────────────────────────────────┐   │ │
│  │  │ Pain Level: [0] [1] [2] [3] [4] [5] [6] [7] [●8] [9] [10]     │   │ │
│  │  │ Location: [Head ▼]                                             │   │ │
│  │  │ Quality: Throbbing                                             │   │ │
│  │  │ └──────────────────────────────────────────────────────────────┘   │ │
│  │                                                                         │ │
│  │  ┌── flags ──────────────────────────────────────────────────────────┐ │ │
│  │  │ ☐ Needs isolation  ☐ Fall risk  ☐ Requires translator            │ │ │
│  │  └───────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  │  Notes:                                                                 │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │ Patient reports headache since yesterday. BP slightly elevated.  │  │ │
│  │  │ Fever present. Alerted doctor.                                   │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                         │ │
│  │  [Save Vitals & Send to Doctor Queue]  [Save & Stay]  [Discard]        │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ ❤️ Vitals (3) │ 📋 Tasks (2) │ ⚙️ Settings                                 │
└─────────────────────────────────────────────────────────────────────────────┘

States:
  Empty:     "No patients in vitals queue" with idle illustration
  Ready:     Patient assigned, form pre-filled with last vitals
  In Progress: Form active, timer running
  Abnormal:  🔴 Flagged values highlighted with alert icon
  Critical:  🚨 Critical vitals with "Notify Doctor Immediately" CTA
  Complete:  "Vitals saved. Patient moved to Doctor Queue."
```

### STF-012/013: Lab Sample Collection & Processing

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🧪 Sample Collection                                🔬 3 pending / 1 done   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌── Patient: Amit Singh ─────────────────────────────────────────────────┐ │
│  │                                                                         │ │
│  │  Order #LO-20260604-001 · Dr. Arun Sharma · Jun 4, 2026                │ │
│  │                                                                         │ │
│  │  Samples to Collect:                                                    │ │
│  │  ┌──────────┬──────────────┬──────────┬──────────┬──────────────────┐ │ │
│  │  │ Tube     │ Test         │ Volume   │ Status   │ Collected        │ │
│  │  ├──────────┼──────────────┼──────────┼──────────┼──────────────────┤ │ │
│  │  │ 🔴 Red  │ CBC          │ 3 mL     │ □ Pending│ [Collect]        │ │ │
│  │  │ 🟢Green │ Dengue NS1   │ 2 mL     │ □ Pending│ [Collect]        │ │ │
│  │  │ 🟣Purple│ Malaria      │ 2 mL     │ □ Pending│ [Collect]        │ │ │
│  │  │ 🟡Yellow│ CRP          │ 2 mL     │ □ Pending│ [Collect]        │ │ │
│  │  └──────────┴──────────────┴──────────┴──────────┴──────────────────┘ │ │
│  │                                                                         │ │
│  │  Patient ID: Amit Singh ✓ | DOB verified ✓ | Fasting: Yes ✓           │ │
│  │                                                                         │ │
│  │  [Mark All Collected]  [Print Labels]  [Barcode Scan]                   │ │
│  │  Special Instructions: Centrifuge within 30 min for CBC                 │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌── Processing Queue ─────────────────────────────────────────────────────┐ │
│  │  Tab: [📋 Pending] [⚗️ Processing] [✅ Completed] [❌ Rejected]         │ │
│  │                                                                         │ │
│  │  ┌──────────┬──────────┬──────────┬──────────┬──────────┬────────────┐ │ │
│  │  │ Sample   │ Test     │ Patient  │ Time In  │ Status   │ Action     │ │ │
│  │  ├──────────┼──────────┼──────────┼──────────┼──────────┼────────────┤ │ │
│  │  │ #S-001   │ CBC      │ Amit S.  │ 10:45 AM │ ⚗️ Run  │ [Results] │ │ │
│  │  │ #S-002   │ Dengue   │ Amit S.  │ 10:46 AM │ ⏳ Queue │ [Start]   │ │ │
│  │  │ #S-003   │ Malaria  │ Amit S.  │ 10:46 AM │ ⏳ Queue │ [Start]   │ │ │
│  │  │ #S-004   │ CRP      │ Amit S.  │ 10:47 AM │ ⏳ Queue │ [Start]   │ │ │
│  │  └──────────┴──────────┴──────────┴──────────┴──────────┴────────────┘ │ │
│  │                                                                         │ │
│  │  Instrument Assignment:                                                 │ │
│  │  [Sysmex XN-1000 ▼] [Load Sample] [Start Run]                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🧪 Dashboard │ 🧬 Samples │ ⚗️ Processing │ ✅ Reports │ ⚙️                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### STF-017: Pharmacy Inventory Management

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 💊 Pharmacy Inventory                                       [+ Add Stock]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌── Stock Overview ───────────────────────────────────────────────────────┐ │
│  │ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │ │ 📦 Total SKUs│  │ 🟢 In Stock  │  │ 🟡 Low Stock │  │ 🔴 Out Stock │ │ │
│  │ │ 245          │  │ 189          │  │ 42           │  │ 14           │ │ │
│  │ └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌── Low Stock Alerts ─────────────────────────────────────────────────────┐ │
│  │ 🔴 Amoxicillin 250mg       — 12 remaining (threshold: 50)     [Order]  │ │
│  │ 🔴 Metformin 500mg         — 8 remaining  (threshold: 30)     [Order]  │ │
│  │ 🟡 Paracetamol 650mg       — 45 remaining (threshold: 100)   [Order]  │ │
│  │ 🟡 Amlodipine 5mg          — 28 remaining (threshold: 60)    [Order]  │ │
│  │ [Order All Low Stock]                                                   │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌── Search & Filter ──────────────────────────────────────────────────────┐ │
│  │ 🔍 Search by name, brand, or SKU...          [Category ▼] [Supplier ▼] │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌── Inventory Table ──────────────────────────────────────────────────────┐ │
│  │ ┌──────────┬──────────────┬────────┬────────┬──────────┬──────────────┐ │ │
│  │ │ SKU      │ Name         │ Stock  │ Price  │ Expiry   │ Actions      │ │ │
│  │ ├──────────┼──────────────┼────────┼────────┼──────────┼──────────────┤ │ │
│  │ │ MED-001  │ Paracetamol  │ 45 🟡  │ ₹2.50  │ Dec 2026 │ [Edit] [×] │ │ │
│  │ │ MED-002  │ Amoxicillin  │ 12 🔴  │ ₹3.00  │ Aug 2026 │ [Edit] [×] │ │ │
│  │ │ MED-003  │ Metformin    │ 8 🔴   │ ₹1.50  │ Jan 2027 │ [Edit] [×] │ │ │
│  │ │ MED-004  │ Amlodipine   │ 28 🟡  │ ₹2.00  │ Mar 2027 │ [Edit] [×] │ │ │
│  │ │ MED-005  │ Atorvastatin │ 62 🟢  │ ₹4.00  │ Sep 2026 │ [Edit] [×] │ │ │
│  │ └──────────┴──────────────┴────────┴────────┴──────────┴──────────────┘ │ │
│  │                                                                         │ │
│  │ Showing 1-5 of 245  < 1 2 3 ... 49 >                                   │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌── Expiry Alerts ────────────────────────────────────────────────────────┐ │
│  │ 🟡 5 items expiring within 30 days                                     │ │
│  │ 🔴 2 items already expired (flagged for removal)                       │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ 💊 Dashboard │ 📄 Rx Queue │ 📦 Inventory │ 🚚 Deliveries │ ⚙️             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### STF-007: Billing Queue

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 💳 Billing Queue                                     ⏱ 3 min avg wait       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌── Queue ────────────────────────────────────────────────────────────────┐ │
│  │ ┌────────┬────────────┬───────────┬──────────┬──────────┬─────────────┐ │ │
│  │ │ Pos    │ Patient     │ Amount    │ Method   │ Status   │ Action      │ │ │
│  │ ├────────┼────────────┼───────────┼──────────┼──────────┼─────────────┤ │ │
│  │ │ 1      │ Rajesh K.  │ ₹850      │ Cash     │ 🔴 Wait  │ [Process]  │ │ │
│  │ │ 2      │ Priya S.   │ ₹1,200    │ Card     │ 🟡 Wait  │ [Process]  │ │ │
│  │ └────────┴────────────┴───────────┴──────────┴──────────┴─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌── Billing: Rajesh Kumar ───────────────────────────────────────────────┐ │
│  │                                                                         │ │
│  │  Invoice #INV-20260604-001  ·  Jun 4, 2026                             │ │
│  │                                                                         │ │
│  │  ┌── Items ─────────────────────────────────────────────────────────┐  │ │
│  │  │ Item                         Qty      Rate        Amount         │  │ │
│  │  │ ───────────────────────────────────────────────────────────────  │  │ │
│  │  │ Consultation — Dr. Sharma    1        ₹350        ₹350           │  │ │
│  │  │ CBC                          1        ₹300        ₹300           │  │ │
│  │  │ Dengue NS1                   1        ₹600        ₹600           │  │ │
│  │  │ Malaria                      1        ₹350        ₹350           │  │ │
│  │  │ Paracetamol 650mg (15 tabs)  1        ₹50         ₹50            │  │ │
│  │  │ ───────────────────────────────────────────────────────────────  │  │ │
│  │  │                                              Subtotal: ₹1,650   │  │ │
│  │  │                                    Discount (0%): ₹0            │  │ │
│  │  │                                              Total: ₹1,650      │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                         │ │
│  │  Payment Method:                                                        │ │
│  │  [💵 Cash] [💳 Card] [📱 UPI] [🏦 Insurance] [🪙 Credit]              │ │
│  │                                                                         │ │
│  │  ┌── Insurance ─────────────────────────────────────────────────────┐  │ │
│  │  │ Provider: Star Health · Policy #SH-12345-6789                    │  │ │
│  │  │ Coverage: 80% (OPD) · Co-pay: ₹330                              │  │ │
│  │  │ Claim Status: Pre-approved ✅                                    │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                         │ │
│  │  [Process Payment] [Print Receipt] [Send Digital Receipt] [Discard]    │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📋 Queue │ 💳 Billing │ 💰 Settlements │ 📊 Reports │ ⚙️                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Hospital Multi-Tenant Hierarchy

### Tenant Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      WYSHCARE TENANT HIERARCHY                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  PLATFORM (wyshcare.com)                                                │ │
│  │  Master Database | Global Config | Super Admins                        │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                          │
│           ┌────────────────────────┼────────────────────────┐                 │
│           │                        │                        │                 │
│  ┌────────▼────────┐    ┌─────────▼────────┐    ┌──────────▼────────┐        │
│  │ TENANT          │    │ TENANT           │    │ TENANT            │        │
│  │ Apollo Hospitals│    │ Dr. Sharma       │    │ City Diagnostics  │        │
│  │ (ENTERPRISE)    │    │ Clinic (CLINIC)  │    │ Lab (DIAGNOSTICS) │        │
│  └─────────────────┘    └──────────────────┘    └───────────────────┘        │
│           │                        │                        │                 │
│           ▼                        ▼                        ▼                 │
│  ┌─────────────────┐    ┌──────────────────┐    ┌───────────────────┐        │
│  │ HOSPITALS       │    │ HOSPITALS        │    │ DEPARTMENTS       │        │
│  │ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌───────────────┐ │        │
│  │ │ Apollo Main │ │    │ │ Sharma Clin.│ │    │ │ Phlebotomy   │ │        │
│  │ │ Apollo Hebb.│ │    │ └──────────────┘ │    │ │ Biochemistry │ │        │
│  │ │ Apollo Bgr  │ │    │                      │ │ Microbiology  │ │        │
│  │ └─────────────┘ │    │                      │ └───────────────┘ │        │
│  └─────────────────┘    └──────────────────┘    └───────────────────┘        │
│           │                                                                   │
│           ▼                                                                   │
│  ┌─────────────────┐                                                        │
│  │ DEPARTMENTS     │                                                        │
│  │ ┌─────────────┐ │                                                        │
│  │ │ Cardiology  │ │                                                        │
│  │ │ Orthopedics │ │                                                        │
│  │ │ Neurology   │ │                                                        │
│  │ │ Radiology   │ │                                                        │
│  │ └─────────────┘ │                                                        │
│  └─────────────────┘                                                        │
│           │                                                                   │
│           ▼                                                                   │
│  ┌─────────────────┐                                                        │
│  │ TEAMS           │                                                        │
│  │ ┌─────────────┐ │                                                        │
│  │ │ Cardi OPD-1 │ │                                                        │
│  │ │ Cardi OPD-2 │ │                                                        │
│  │ │ ER Team A   │ │                                                        │
│  │ └─────────────┘ │                                                        │
│  └─────────────────┘                                                        │
│           │                                                                   │
│           ▼                                                                   │
│  ┌─────────────────┐                                                        │
│  │ USERS           │                                                        │
│  │ ┌─────────────┐ │                                                        │
│  │ │ Dr. Sharma  │ │  ← Doctor at Cardiology                                │
│  │ │ Nurse Priya │ │  ← Nurse at Cardiology OPD-1                          │
│  │ │ Rajesh      │ │  ← Patient of Dr. Sharma                              │
│  │ └─────────────┘ │                                                        │
│  └─────────────────┘                                                        │
└─────────────────────────────────────────────────────────────────────────────┘

Key Principles:
  - Tenant is the top-level organizational boundary
  - Within tenant: Hospital → Department → Team → User
  - Patients belong to tenant, assigned to doctor via appointments
  - RLS (Row-Level Security) enforced at tenantId
  - Users can belong to multiple teams within same tenant
  - Cross-tenant access requires explicit permission (super admin only)
```

### Row-Level Security (RLS) Design

```
RLS Implementation (PostgreSQL policies):

-- Tenant isolation (applied to ALL telemedicine tables)
CREATE POLICY tenant_isolation ON consultation_session
  USING (tenantId = current_setting('app.current_tenant')::UUID);

-- Department isolation (doctors see only their dept)
CREATE POLICY department_isolation ON consultation_session
  USING (
    tenantId = current_setting('app.current_tenant')::UUID
    AND (
      current_user_role() IN ('super_admin', 'admin')
      OR departmentId = current_setting('app.current_department')::UUID
    )
  );

-- User-level (patients see only their own records)
CREATE POLICY patient_isolation ON consultation_session
  USING (
    tenantId = current_setting('app.current_tenant')::UUID
    AND (
      current_user_role() IN ('super_admin', 'admin', 'doctor', 'staff')
      OR patientId = current_setting('app.current_user')::UUID
    )
  );

Permission Levels:
  Super Admin:    All tenants, all data
  Tenant Admin:   Their tenant only, all departments
  Dept Admin:     Their department, all teams
  Team Lead:      Their team, assigned patients
  Doctor:         Their patients, cross-team within dept
  Nurse:          Today's queue, assigned patients
  Staff:          Queue management, billing, inventory
  Patient:        Their own records only

Data Model:
  Tenant {
    id: UUID
    name: string
    type: TENANT_TYPE (ENTERPRISE / CLINIC / DIAGNOSTICS / PHARMACY / INDIVIDUAL)
    plan: PLAN_TYPE (FREE / STARTER / CLINIC / ENTERPRISE)
    status: TENANT_STATUS (ACTIVE / TRIAL / SUSPENDED / EXPIRED)
    config: JSON { features, limits, branding }
  }

  Hospital {
    id: UUID
    tenantId: UUID
    name: string
    type: HOSPITAL_TYPE (HOSPITAL / CLINIC / DIAGNOSTIC_CENTER / PHARMACY)
    address: JSON
    contact: JSON
    timezone: string
    config: JSON { departments, services }
  }

  Department {
    id: UUID
    hospitalId: UUID
    tenantId: UUID
    name: string
    specialty: SPECIALTY
    headDoctorId: UUID?
  }

  Team {
    id: UUID
    departmentId: UUID
    tenantId: UUID
    name: string
    type: TEAM_TYPE (OPD / IPD / ER / LAB / PHARMACY)
    schedule: JSON
  }

  TeamMembership {
    id: UUID
    teamId: UUID
    userId: UUID
    tenantId: UUID
    role: TEAM_ROLE (LEAD / MEMBER / TRAINEE)
    schedule: JSON
  }

  User {
    id: UUID
    tenantId: UUID
    email: string
    phone: string
    role: GLOBAL_ROLE
    departmentId: UUID?
  }
```

### Workspace Switching & Context

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Workspace Context — Persisted in Zustand store                             │
│                                                                              │
│  Active Context:                                                            │
│  {                                                                          │
│    tenant: { id, name, type, plan },                                        │
│    hospital: { id, name } | null,                                           │
│    department: { id, name, specialty } | null,                              │
│    team: { id, name, type } | null,                                         │
│    user: { id, role, permissions }                                          │
│  }                                                                          │
│                                                                              │
│  Context determines:                                                        │
│  - Which data is visible (RLS filters)                                      │
│  - Which navigation items appear (role + features)                          │
│  - Which actions are allowed (permissions)                                  │
│  - Which theme/branding applies (tenant config)                             │
│                                                                              │
│  Context switching:                                                         │
│  MDB-005: Organization Switcher — Select tenant → Select hospital →         │
│           Select department → Redirect to workspace                         │
│  Stored in cookie + Zustand + API header (X-Tenant-Context)                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### ADM-002/003: Organization & Hospital Management

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🏢 Apollo Hospitals                                         [+ Edit] [⋯]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌── Overview ────────────────────────────────────────────────────────────┐ │
│  │                                                                         │ │
│  │  🏢 Apollo Hospitals · Enterprise Plan                                  │ │
│  │  🆔 TEN-APOLLO-001 · Active since Jan 2025                             │ │
│  │  📍 154, Bannerghatta Road, Bangalore · +91-80-1234-5678               │ │
│  │                                                                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │ │
│  │  │ 🏥 Hospitals │  │ 👥 Users     │  │ 👨‍⚕️ Doctors  │  │ 🧑‍⚕️Patients│ │ │
│  │  │ 3            │  │ 1,234        │  │ 456          │  │ 45K        │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌── Hospitals ────────────────────────────────────────────────────────────┐ │
│  │ ┌──────────┬──────────────┬────────┬──────────┬──────────┬────────────┐ │ │
│  │ │ Hospital │ Location     │ Depts  │ Doctors  │ Patients │ Status     │ │ │
│  │ ├──────────┼──────────────┼────────┼──────────┼──────────┼────────────┤ │ │
│  │ │ Main     │ Bg Road BLR  │ 24     │ 220      │ 22K      │ 🟢 Active │ │ │
│  │ │ Hebbal   │ Hebbal BLR   │ 18     │ 145      │ 15K      │ 🟢 Active │ │ │
│  │ │ Whitefield│ Whitefield  │ 12     │ 91       │ 8K       │ 🟢 Active │ │ │
│  │ └──────────┴──────────────┴────────┴──────────┴──────────┴────────────┘ │ │
│  │ [+ Add Hospital]                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌── Department Setup (Main Hospital) ─────────────────────────────────────┐ │
│  │ ┌──────────┬──────────┬──────────┬──────────┬────────────┬────────────┐  │ │
│  │ │ Dept     │ Head     │ Doctors  │ Nurses   │ Teams      │ Action     │  │ │
│  │ ├──────────┼──────────┼──────────┼──────────┼────────────┼────────────┤  │ │
│  │ │ Cardio   │ Dr.Mehta │ 24       │ 48       │ OPD-1, OPD │ [Manage]   │  │ │
│  │ │ Ortho    │ Dr.Verma │ 18       │ 36       │ OPD-1, ER  │ [Manage]   │  │ │
│  │ │ Neuro    │ Dr.Rao   │ 12       │ 24       │ OPD-1      │ [Manage]   │  │ │
│  │ │ ER       │ Dr.Khan  │ 10       │ 30       │ A, B, C    │ [Manage]   │  │ │
│  │ └──────────┴──────────┴──────────┴──────────┴────────────┴────────────┘  │ │
│  │ [+ Add Department]                                                        │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌── Subscription & Billing ──────────────────────────────────────────────┐ │
│  │  Plan: Enterprise · ₹49,999/month · Next billing: Jul 1, 2026         │ │
│  │  Usage: 1,234/2,000 users · 45K/100K patients · 3/10 hospitals        │ │
│  │  [Change Plan] [View Invoice History] [Download Report]               │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🏢 Overview │ 🏥 Hospitals │ 👥 Users │ 💳 Billing │ 🔐 Security │ ⚙️      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Mobile Wireframes (375px)

### Patient App — Mobile (375 × 812)

```
┌──────────────────────────────────┐
│        12:34    📶   🔋  98%     │
├──────────────────────────────────┤
│ 🔍 Search doctors, symptoms...🔔 │
├──────────────────────────────────┤
│                                  │
│  Good morning, Priya 👋          │
│  June 4, 2026                    │
│                                  │
│  ┌────────────────────────────┐  │
│  │ Health Summary        →    │  │
│  │                            │  │
│  │ Score: 82/100  ▲ +4       │  │
│  │ ⚠️ Meds due: 2h left     │  │
│  │ 📅 Appt: Tomorrow 10:30  │  │
│  └────────────────────────────┘  │
│                                  │
│  Quick Actions                   │
│  ┌─────┐┌─────┐┌─────┐┌─────┐ │
│  │ 📅  ││ 🩺  ││ 💊  ││ 🔬  │ │
│  │ Book││Cons ││Order││ Lab │ │
│  └─────┘└─────┘└─────┘└─────┘ │
│                                  │
│  Upcoming                        │
│  ┌────────────────────────────┐  │
│  │ 🩺 Dr. Arun Sharma         │  │
│  │ General Physician          │  │
│  │ Tomorrow · 10:30 AM        │  │
│  │              [Join] [Resch]│  │
│  └────────────────────────────┘  │
│                                  │
│  Recent Activity                 │
│  ┌────────────────────────────┐  │
│  │ 📄 Prescription issued     │  │
│  │    Dr. Mehta · Yesterday   │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ 🔬 Lab report uploaded     │  │
│  │    CBC · 2 days ago        │  │
│  └────────────────────────────┘  │
│                                  │
├──────────────────────────────────┤
│ 🏠  │ 📋 │ 🏥  │ 💊 │ ⚙️       │
│ Home│Time│Care │Rx  │Settings  │
└──────────────────────────────────┘
```

**Patient App — AI Twin (Mobile)**

```
┌──────────────────────────────────┐
│ ← AI Health Twin       [Refresh] │
├──────────────────────────────────┤
│                                  │
│  ┌────────────────────────────┐  │
│  │  🤖 Your Health Score      │  │
│  │                            │  │
│  │      82                    │  │
│  │  ━━━━━━━━━━━○━━━ 82/100   │  │
│  │  ▲ +4 from last month     │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌──────┐┌──────┐┌──────┐┌───┐ │
│  │ 🩺   ││ 💊   ││ 📊  ││📈 │ │
│  │ Cond ││ Meds ││ Risks││Trd│ │
│  │ 3    ││4 act ││2 Mod ││Stb│ │
│  └──────┘└──────┘└──────┘└───┘ │
│                                  │
│  Risk Assessment                 │
│  ┌────────────────────────────┐  │
│  │ 🩸 HTN    72 🟡 Moderate   │  │
│  │ 🍬 DM2    85 🔴 High      │  │
│  │ ❤️ Cardiac 45 🟢 Low      │  │
│  │                    [Full→] │  │
│  └────────────────────────────┘  │
│                                  │
│  Adherence (This Week)           │
│  ┌────────────────────────────┐  │
│  │ 85% Overall ▼ 5%           │  │
│  │ Amlodipine ████████░░ 85% │  │
│  │ Metformin  ██████████░ 92%│  │
│  │ Atorvastat ██████░░░░ 72%│  │
│  └────────────────────────────┘  │
│                                  │
│  ┌── Ask AI Twin ─────────────┐ │
│  │ What medications am I...?  │ │
│  └────────────────────────────┘ │
│                                  │
├──────────────────────────────────┤
│ 🏠  │ 📋 │ 🏥  │ 💊 │ ⚙️       │
└──────────────────────────────────┘
```

**Patient App — Timeline (Mobile)**

```
┌──────────────────────────────────┐
│ ← Health Timeline   [Filter▼]   │
├──────────────────────────────────┤
│                                  │
│  2026 · Month                    │
│                                  │
│  TODAY · JUNE 4                  │
│  ┌────────────────────────────┐  │
│  │ 🩺 10:30 AM                │  │
│  │ Consulted Dr. Sharma       │  │
│  │ Diagnosis: Viral Infection │  │
│  │               [View Rx→]   │  │
│  └────────────────────────────┘  │
│                    ← swipe →    │
│                                  │
│  JUNE 2                          │
│  ┌────────────────────────────┐  │
│  │ 🔬 Lab: CBC                │  │
│  │ Status: Normal             │  │
│  │               [View→]      │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ 💊 Took Amlodipine ✓      │  │
│  └────────────────────────────┘  │
│                                  │
│  MAY 28                          │
│  ┌────────────────────────────┐  │
│  │ 🏥 BP Check 128/84 🟢     │  │
│  └────────────────────────────┘  │
│                                  │
│  [Load More ▼]                   │
│                                  │
├──────────────────────────────────┤
│ 🏠  │ 📋 │ 🏥  │ 💊 │ ⚙️       │
└──────────────────────────────────┘

Mobile Interaction:
  - Swipe left on card → Reveal: [View Details] [Share] [Delete]
  - Tap card → Timeline entry detail
  - Pull down → Refresh timeline
  - Filter bar: horizontal scrollable chips
  - Infinite scroll with "Load More" at bottom
```

### Doctor App — Mobile (375 × 812)

```
┌──────────────────────────────────┐
│        12:34    📶   🔋  98%     │
├──────────────────────────────────┤
│ 📊 Dashboard    Dr. Sharma 🟢    │
├──────────────────────────────────┤
│                                  │
│  Today · June 4, 2026            │
│                                  │
│  ┌──────┐┌──────┐┌──────┐┌───┐ │
│  │ 📅   ││ 🩺   ││ ⏱   ││ ⭐│ │
│  │ Apps ││ Seen ││ Avg  ││Rat│ │
│  │ 12   ││ 8/12 ││ 12min││4.8│ │
│  └──────┘└──────┘└──────┘└───┘ │
│                                  │
│  Upcoming Patients               │
│  ┌────────────────────────────┐  │
│  │ 09:15 Rajesh Kumar ██████ │  │
│  │              New · Waiting │  │
│  │                      [→]  │  │
│  ├────────────────────────────┤  │
│  │ 09:30 Priya Sharma ██████ │  │
│  │            F/U · Nurse Ok │  │
│  │                      [→]  │  │
│  ├────────────────────────────┤  │
│  │ 10:00 Amit Singh          │  │
│  │            Lab · Pending  │  │
│  │                      [→]  │  │
│  └────────────────────────────┘  │
│                                  │
│  Pending Actions                 │
│  ┌────────────────────────────┐  │
│  │ 📝 3 Rx to verify     ⏰1h │  │
│  │ 🔬 2 lab reports       ⏰2h │  │
│  └────────────────────────────┘  │
│                                  │
├──────────────────────────────────┤
│ 📊  │ 👥 │ 📅 │ 💬 │ 👤        │
│ Dash│Queue│Sched│Msg │Patients  │
└──────────────────────────────────┘
```

**Doctor App — Consultation Workspace (Mobile)**

```
┌──────────────────────────────────┐
│ ← Consults    ⏱ 12:34   🟢Rec   │
├──────────────────────────────────┤
│                                  │
│  ┌── Patient Info (collapsible) │
│  │ 👤 Rajesh Kumar · M/42      │
│  │ 🩺 DM2 + HTN · ⚠️ PCN Aller │
│  └──────────────────────────────┘
│                                  │
│  [📝 SOAP] [📋 DX] [💊 Rx]      │
│  [🧪 Lab] [📋 Refer]           │
│                                  │
│  ┌── SOAP Notes ──────────────┐ │
│  │ S: "Fever since 3 days..." │ │
│  │                            │ │
│  │ O: Temp 38.4°C, BP 128/84 │ │
│  │    HR 92, RR 18, SpO2 98% │ │
│  │                            │ │
│  │ A: Viral URTI (J06.9)     │ │
│  │                            │ │
│  │ P:                        │ │
│  │  1. Paracetamol 650mg TDS │ │
│  │  2. CBC + Dengue + Malaria│ │
│  │  3. Review 48h            │ │
│  └────────────────────────────┘ │
│                                  │
│  ┌── AI Copilot (collapsible)  │
│  │ 🤖 Suggestions: 3           │
│  │ 📋 Draft SOAP ready [Apply] │
│  └──────────────────────────────┘
│                                  │
│  [📝 Save & End]                 │
│                                  │
├──────────────────────────────────┤
│ 📊  │ 👥 │ 📅 │ 💬 │ 👤        │
└──────────────────────────────────┘

Mobile-Specific Behaviors:
  - Patient info pane: Collapsible top bar, tap to expand
  - AI copilot pane: Bottom sheet, swipe up to expand
  - Tab bar for clinical tools: horizontal scrollable
  - Camera access: Scan prescription, capture wound images
  - Microphone: Voice-to-text for SOAP notes
  - Portrait: Three-pane collapses to single-pane with tab navigation
```

### Staff App — Mobile (375 × 812)

```
┌──────────────────────────────────┐
│        12:34    📶   🔋  98%     │
├──────────────────────────────────┤
│ 🏪 Reception · Apollo Clinic     │
├──────────────────────────────────┤
│                                  │
│  ┌──────┐┌──────┐┌──────┐┌───┐ │
│  │ 📅   ││ ✅   ││ ⏳   ││ ❌│ │
│  │Total ││Chk In││Wait  ││NoS│ │
│  │ 24   ││ 8    ││ 5    ││ 2 │ │
│  └──────┘└──────┘└──────┘└───┘ │
│                                  │
│  ⏱ Avg Wait: ~14 min            │
│                                  │
│  Queues                          │
│  ┌────────────────────────────┐  │
│  │ ✅ Check-In    5   2m 🟢  │  │
│  │ ❤️ Vitals      3   5m 🟡  │  │
│  │ 🩺 Doctor      4  14m 🔴  │  │
│  │ 🧪 Lab         2   8m 🟡  │  │
│  │ 💊 Pharmacy    1   4m 🟢  │  │
│  │ 💳 Billing     2   3m 🟢  │  │
│  └────────────────────────────┘  │
│                                  │
│  Dr. Sharma's Queue              │
│  ┌────────────────────────────┐  │
│  │ 1. Rajesh K.   18m 🔴 Call│  │
│  │ 2. Priya S.    12m 🟡 Call│  │
│  │ 3. Amit S.      8m 🟢     │  │
│  │ 4. Ananya G.    5m 🟢     │  │
│  └────────────────────────────┘  │
│                                  │
│  [+ Walk-In] [Check In]         │
│                                  │
├──────────────────────────────────┤
│ 📋  │ ✅ │ ➕ │ 💳 │ ⚙️         │
│Queue│ Chk│Walk│Bill│Settings    │
└──────────────────────────────────┘
```

---

## 4. Design System v2

### Interaction Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  WYSHCARE INTERACTION PRINCIPLES                                            │
│                                                                              │
│  1. Direct Manipulation                                                     │
│     - Every action has an immediate visible result                          │
│     - Drag, swipe, pinch, tap — not just click                             │
│     - Real-time feedback (optimistic UI + server confirmation)              │
│                                                                              │
│  2. Progressive Disclosure                                                  │
│     - Show essentials first, reveal complexity on demand                    │
│     - Collapsible panes, expandable sections, progressive forms             │
│     - "More options" rather than cramming everything visible                │
│                                                                              │
│  3. Context Over Navigation                                                 │
│     - Show what's relevant now, hide what's not                            │
│     - Role-based views, time-based views, location-based views              │
│     - Reduce cognitive load: don't show features the user can't use         │
│                                                                              │
│  4. Forgiveness                                                             │
│     - Undo for destructive actions (15-30s window)                         │
│     - Auto-save drafts (notes, forms, prescriptions)                       │
│     - Confirmation dialogs for irreversible actions                        │
│     - "Are you sure?" with reason why it matters                           │
│                                                                              │
│  5. Predictability                                                          │
│     - Same action, same result, every time                                 │
│     - Consistent placement of controls across screens                       │
│     - Keyboard shortcuts match muscle memory (⌘S save, ⌘Z undo)           │
│                                                                              │
│  6. Speed & Feedback                                                        │
│     - All interactions under 100ms perceived latency                        │
│     - Loading states <300ms: nothing | <1s: skeleton | >1s: progress       │
│     - Toast for success, banner for errors, modal for confirmations        │
│     - Every button press has a micro-interaction (scale, color shift)       │
├─────────────────────────────────────────────────────────────────────────────┤
│  GESTURE MAP (Mobile)                                                       │
│                                                                              │
│  Tap           → Primary action (select, open, confirm)                     │
│  Double Tap    → Quick action (like, zoom, favorite)                        │
│  Long Press    → Context menu (copy, share, delete, edit)                   │
│  Swipe Left    → Reveal actions (delete, archive, mark read)                │
│  Swipe Right   → Mark as read/unread, complete                              │
│  Swipe Up      → Expand sheet, reveal more content                          │
│  Swipe Down    → Dismiss, pull to refresh                                   │
│  Pinch         → Zoom in/out (timeline, charts, images)                     │
│  Drag          → Reorder (queue, pinned items, favorites)                   │
│  Force Touch   → Quick preview, peek & pop                                  │
│                                                                              │
│  KEYBOARD SHORTCUTS (Desktop)                                               │
│  See P2 Section 1 for full Consultation Workspace shortcuts                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Motion Tokens

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  MOTION TOKENS                                                              │
│                                                                              │
│  Duration:                                                                   │
│    instant:   50ms   — Micro-interaction (button press, ripple)             │
│    fast:     150ms   — Element appear/disappear (tooltip, badge)           │
│    normal:   250ms   — Standard transitions (page enter, modal)            │
│    slow:     400ms   — Emphasis transitions (hero enter, score update)     │
│    express:  600ms   — Expressive transitions (onboarding, celebration)    │
│                                                                              │
│  Easing:                                                                     │
│    default:   cubic-bezier(0.16, 1, 0.3, 1)      — Standard ease-out       │
│    enter:     cubic-bezier(0.16, 1, 0.3, 1)      — Spring-like enter       │
│    exit:      cubic-bezier(0.4, 0, 1, 1)         — Accelerate exit         │
│    emphasis:  cubic-bezier(0.34, 1.56, 0.64, 1)  — Overshoot for emphasis  │
│    linear:    cubic-bezier(0, 0, 1, 1)           — Mechanical movement     │
│                                                                              │
│  Stagger:                                                                     │
│    list:     50ms delay between items    — List enter, grid appear          │
│    page:    100ms delay between sections — Page content reveal              │
│    form:     30ms delay between fields   — Form field appear                │
│                                                                              │
│  Transform:                                                                  │
│    scale:    Active button: 0.97x | Hover: 1.02x | Tap: 0.95x             │
│    lift:     Card hover: translateY(-2px) + shadow elevation                │
│    press:    Card tap: translateY(1px) + shadow reduction                    │
│                                                                              │
│  Page Transitions:                                                           │
│    forward:  Slide left → right (next screen enters from right)             │
│    back:     Slide right → left (current screen exits to right)             │
│    modal:    Scale up from center (0.95 → 1) + fade in backdrop            │
│    sheet:    Slide up from bottom (y: 100% → 0%) + drag handle             │
│    drill:    Push current content left, new content slides in from right    │
│    fade:     Cross-fade (tab switches, filter changes)                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Visual Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  VISUAL HIERARCHY PRINCIPLES                                                 │
│                                                                              │
│  1. Size → Color → Position → Density                                       │
│     Most important: Largest, boldest, top-left                              │
│     Secondary: Smaller, lighter, below                                      │
│     Tertiary: Minimal, muted, bottom/right                                  │
│                                                                              │
│  2. Information Density Scale                                                │
│     Sparse:    Onboarding, empty states, error screens                      │
│     Normal:    Detail views, forms, settings                                 │
│     Dense:     Tables, queues, dashboards, timelines                        │
│     Compact:   Sidebars, reference panels, tooltips                         │
│                                                                              │
│  3. Color Hierarchy                                                          │
│     Primary (700):  Actions, active states, key data points                  │
│     Secondary (500): Interactive elements, links, secondary CTAs            │
│     Neutral (600):  Body text, icons                                         │
│     Muted (400):    Labels, metadata, placeholders                           │
│     Subtle (200):   Borders, dividers, backgrounds                           │
│                                                                              │
│  4. Typographic Scale                                                        │
│     Display:   32px/40px — Page titles, hero numbers                        │
│     Heading 1: 24px/32px — Section titles                                   │
│     Heading 2: 20px/28px — Card titles, modal headers                      │
│     Heading 3: 18px/24px — Subsection titles                                │
│     Body:      15px/22px — Paragraphs, descriptions                         │
│     Body Small:13px/18px — Metadata, labels, captions                       │
│     Caption:   12px/16px — Timestamps, tags, footnotes                      │
│                                                                              │
│  5. Spacing Scale (px)                                                       │
│     2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128                  │
│                                                                              │
│  6. Elevation (shadows)                                                      │
│     Level 0:  No shadow — Flat elements, backgrounds                        │
│     Level 1:  Subtle — Cards, small components                              │
│     Level 2:  Medium — Dropdowns, tooltips, popovers                        │
│     Level 3:  High — Modals, sheets, drawers                                │
│     Level 4:  Maximum — Toasts, alerts, FABs                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Variants

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  COMPONENT MATRIX — Variant System                                           │
│                                                                              │
│  BUTTON                                                                      │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐       │
│  │ Variant  │ Solid    │ Outline  │ Ghost    │ Link     │ Danger   │       │
│  ├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤       │
│  │ Default  │ Primary  │ Primary  │ Neutral  │ Blue     │ Red      │       │
│  │ Hover    │ +Shadow  │ Bg fill  │ Bg 5%    │ Underline│ +Shadow  │       │
│  │ Active   │ Scale    │ Scale    │ Scale    │ Opacity  │ Scale    │       │
│  │ Disabled │ 40% opa  │ 40% opa  │ 40% opa  │ 40% opa  │ 40% opa  │       │
│  │ Loading  │ Spinner  │ Spinner  │ Spinner  │ Spinner  │ Spinner  │       │
│  ├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤       │
│  │ Sizes: lg (48px) | md (40px) | sm (32px) | xs (24px)                 │       │
│  │ Icon: leading | trailing | icon-only                                 │       │
│  │ Full-width: mobile, hero CTAs                                         │       │
│  └───────────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│  CARD                                                                        │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐       │
│  │ Variant  │ Default  │ Elevated │ Bordered │ Compact  │ Action   │       │
│  ├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤       │
│  │ Padding  │ 16px     │ 20px     │ 16px     │ 12px     │ 16px     │       │
│  │ Shadow   │ None     │ Level 1  │ None     │ None     │ Level 1  │       │
│  │ Border   │ 1px      │ None     │ 1px      │ 1px      │ None     │       │
│  │ Radius   │ 12px     │ 16px     │ 12px     │ 8px      │ 12px     │       │
│  │ Bg       │ Surface   │ Surface   │ Surface   │ Surface   │ Surface   │       │
│  │ States   │ Static   │ Hover    │ Static   │ Static   │ Hover+Tap│       │
│  └───────────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│  INPUT                                                                       │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐       │
│  │ Variant  │ Default  │ Filled   │ Flushed  │ Group    │ Search   │       │
│  ├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤       │
│  │ Border   │ All      │ Bottom   │ Bottom   │ All      │ Rounded  │       │
│  │ Label    │ Top      │ Top      │ None     │ Left     │ Hidden   │       │
│  │ Bg       │ White    │ Gray 50  │ Transp   │ White    │ Gray 100 │       │
│  │ States: default | hover | focus | filled | error | disabled | read-only│       │
│  └───────────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│  MODAL                                                                       │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐       │
│  │ Variant  │ Center   │ Right    │ Sheet    │ Full     │ Alert    │       │
│  ├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤       │
│  │ Pos      │ Center   │ Right    │ Bottom   │ Full scr │ Center   │       │
│  │ Width    │ 480px    │ 400px    │ 100%     │ 100%     │ 360px    │       │
│  │ Max-H    │ 80vh     │ 100vh    │ 50vh     │ 100vh    │ Auto     │       │
│  │ Animation│ Scale    │ Slide    │ Slide    │ Slide    │ Scale    │       │
│  │ Backdrop │ Dimm 60% │ Dimm 60% │ Dimm 60% │ None     │ Dimm 80% │       │
│  │ Close    │ Esc/X    │ Esc/X    │ Drag/X   │ X        │ Button   │       │
│  └───────────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│  TOAST / SNACKBAR                                                            │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────────────────────┐  │
│  │ Variant  │ Success  │ Error    │ Warning  │ Info                     │  │
│  ├──────────┼──────────┼──────────┼──────────┼──────────────────────────┤  │
│  │ Icon     │ ✅       │ ❌       │ ⚠️       │ ℹ️                       │  │
│  │ Color    │ Green    │ Red      │ Yellow   │ Blue                     │  │
│  │ Duration │ 3s       │ 5s       │ 4s       │ 3s                       │  │
│  │ Undo     │ Optional  │ N/A     │ N/A      │ N/A                      │  │
│  │ Pos      │ Top-right │ Top-right│ Top-right│ Top-right               │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────────────────────┘  │
│                                                                              │
│  SKELETON (Loading States)                                                   │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Variants:                                                              │ │
│  │  Text:     ████████░░░░  (width varies: 40-90%)                       │ │
│  │  Circle:   ⭕  (avatar, icon)                                         │ │
│  │  Rectangle: ████████████████  (card, image, chart area)               │ │
│  │  Table:    Row ██ ████████ ██████ ████                                │ │
│  │  Card:     ████ ████ / ████████████ / ████████                        │ │
│  │                                                                        │ │
│  │ Animation: shimmer (gradient sweep left→right, 1.5s cycle)           │ │
│  │ Color: bg-gray-100 with gray-200 sweep                               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  BADGE / CHIP                                                               │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐       │
│  │ Variant  │ Status   │ Tag      │ Count    │ Priority │ Avatar   │       │
│  ├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤       │
│  │ Use      │ Online/  │ Labeling │ Notifs   │ Severity │ User     │       │
│  │          │ Offline  │          │          │          │          │       │
│  │ Colors   │ 🟢🟡🔴  │ Gray     │ Primary  │ 🟢🟡🔴  │ w/ photo │       │
│  │ Size     │ sm       │ sm       │ md       │ sm       │ md       │       │
│  │ Removable│ No       │ Yes      │ No       │ No       │ No       │       │
│  └──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘       │
│                                                                              │
│  TABS                                                                       │
│  ┌────────────┬──────────┬──────────┬──────────┬────────────────────────┐  │
│  │ Variant    │ Line     │ Pills    │ Segment  │ Icon                   │  │
│  ├────────────┼──────────┼──────────┼──────────┼────────────────────────┤  │
│  │ Indicator  │ Bottom   │ Fill     │ Bg color │ Bottom line             │  │
│  │ Scrollable │ Yes      │ Yes      │ No       │ Yes                    │  │
│  │ Count      │ Optional │ Optional │ Optional │ Optional               │  │
│  │ Mobile     │ Scroll   │ Scroll   │ Fixed    │ Scroll                 │  │
│  └────────────┴──────────┴──────────┴──────────┴────────────────────────┘  │
│                                                                              │
│  LIST / TABLE (Data Display)                                                 │
│  ┌────────────┬──────────┬──────────┬──────────┬────────────────────────┐  │
│  │ Variant    │ Simple   │ Detailed │ Sortable │ Selectable              │  │
│  ├────────────┼──────────┼──────────┼──────────┼────────────────────────┤  │
│  │ Density    │ Compact  │ Normal   │ Normal   │ Normal                  │  │
│  │ Header     │ Optional  │ Fixed    │ Fixed    │ Fixed                  │  │
│  │ Row int    │ Hover    │ Hover    │ Hover    │ Hover+Selected         │  │
│  │ Pagination │ 25       │ 25       │ 50       │ 25                     │  │
│  │ Mobile     │ Card     │ Card     │ Card     │ Card                   │  │
│  │ Empty      │ "No data"│ Illust.  │ "No data"│ "No data"              │  │
│  └────────────┴──────────┴──────────┴──────────┴────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Design System Tailwind Plugin (Reference)

```
// tailwind.config.ts additions for v2

module.exports = {
  theme: {
    extend: {
      animation: {
        // Page transitions
        'slide-in-right': 'slideInRight 0.25s ease-out',
        'slide-out-left': 'slideOutLeft 0.2s ease-in',
        'scale-in': 'scaleIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
        
        // Micro-interactions
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'scale-press': 'scalePress 0.1s ease-out',
        'bounce-in': 'bounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        
        // Status
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'skeleton': 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        scalePress: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.97)' },
          '100%': { transform: 'scale(1)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      
      // Elevation tokens
      boxShadow: {
        'level-0': 'none',
        'level-1': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'level-2': '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)',
        'level-3': '0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.08)',
        'level-4': '0 20px 50px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.1)',
      },
      
      // Spacing
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      
      // Typography
      fontSize: {
        'display': ['2rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h1': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h2': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h3': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        'body': ['0.9375rem', { lineHeight: '1.375rem' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.125rem' }],
        'caption': ['0.75rem', { lineHeight: '1rem' }],
      },
      
      // Border radius
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
};
```

---

## 5. Complete E2E Workflows

### Workflow 1: Appointment → Consultation → Prescription → Pharmacy Order

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PATIENT JOURNEY: Full Care Cycle                                           │
│                                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ BOOK     │───▶│ CONSULT  │───▶│ PRESCRIBE│───▶│ PHARMACY │              │
│  │ APPT     │    │          │    │          │    │ ORDER    │              │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘              │
│                                                                              │
│  Step 1: Book Appointment (Patient App)                                     │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 1. Patient opens app → Home screen → "Book Doctor"                     │ │
│  │ 2. Searches "General Physician" → sees Dr. Arun Sharma ★4.8           │ │
│  │ 3. Selects video consultation → picks time slot (Jun 4, 10:30 AM)    │ │
│  │ 4. Describes symptoms: "Fever since 3 days, headache, body pain"     │ │
│  │ 5. Confirms booking → receives confirmation with join link            │ │
│  │ 6. Event: `appointment.booked` published                              │ │
│  │ 7. Notification: "Appointment confirmed with Dr. Sharma at 10:30 AM" │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Step 2: Join Consultation (Patient + Doctor App)                           │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 1. Patient gets reminder notification 15 min before                    │ │
│  │ 2. Patient opens app → Appointments → [Join]                          │ │
│  │ 3. Doctor opens dashboard → sees Rajesh in queue → [Start]            │ │
│  │ 4. WebRTC connection established via LiveKit                           │ │
│  │ 5. Both enter the 3-pane Consultation Workspace                       │ │
│  │ 6. Patient pane shows: vitals, history, allergies                     │ │
│  │ 7. AI Copilot pane loads: pre-consult insights based on symptoms      │ │
│  │ 8. Recording starts (consent given)                                   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Step 3: Conduct Consultation (Doctor App)                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 1. Doctor reviews patient history in left pane                         │ │
│  │ 2. Takes vitals via nurse (or reviews existing)                       │ │
│  │ 3. Types SOAP notes in center pane (with voice-to-text)               │ │
│  │ 4. AI Copilot suggests: DX → Viral Upper Respiratory Infection        │ │
│  │ 5. Doctor accepts diagnosis (J06.9) via dropdown                      │ │
│  │ 6. AI Copilot suggests medications → Paracetamol 650mg TDS           │ │
│  │ 7. Doctor adds prescription with dosage, frequency, duration          │ │
│  │ 8. AI Copilot suggests labs → CBC, Dengue NS1, Malaria               │ │
│  │ 9. Doctor adds lab orders to plan                                     │ │
│  │ 10. Doctor clicks [Save & End]                                         │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Step 4: End Consultation (Auto-Chain)                                      │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Auto-Executed in sequence:                                              │ │
│  │ 1. Save SOAP note to ConsultationSession                               │ │
│  │ 2. Generate SOAP note via AiCopilotService                             │ │
│  │ 3. Generate patient-facing summary via AI                             │ │
│  │ 4. Create Prescription record in database                              │ │
│  │ 5. Create LabOrder records (3 tests)                                   │ │
│  │ 6. Push TimelineEntry (type: appointment + prescription)               │ │
│  │ 7. Update HealthGraph:                                                 │ │
│  │    - Node: Diagnosis (Viral URTI)                                     │ │
│  │    - Node: Medication (Paracetamol)                                   │ │
│  │    - Node: Encounter (Dr. Sharma)                                     │ │
│  │    - Edge: Patient → Diagnosis                                        │ │
│  │    - Edge: Diagnosis → Medication                                     │ │
│  │ 8. Send notification to patient: "Visit summary ready"                │ │
│  │ 9. Create AuditLog entry                                              │ │
│  │ 10. Update doctor dashboard counters                                   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Step 5: View Prescription & Order (Patient App)                            │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 1. Patient opens app → Notification: "Prescription issued"             │ │
│  │ 2. Views prescription detail: Paracetamol 650mg TDS × 5 days          │ │
│  │ 3. Taps "Order from Pharmacy" → redirected to Pharmacy Marketplace    │ │
│  │ 4. Medicine auto-populated from prescription                          │ │
│  │ 5. Compares prices across 3 pharmacies: Apollo ₹45, Netmeds ₹42,     │ │
│  │    1mg ₹48                                                             │ │
│  │ 6. Selects Apollo Pharmacy (₹45, 30 min delivery)                     │ │
│  │ 7. Orders → receives tracking info                                    │ │
│  │ 8. Event: `pharmacy.order.placed` published                           │ │
│  │ 9. Timeline updated: "💊 Order placed — Apollo Pharmacy"             │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  API Calls in Order:                                                        │ │
│  POST /auth/login              → Login patient                              │ │
│  POST /auth/otp/verify         → Verify OTP                                 │ │
│  GET  /doctors?specialty=...   → Search doctors                             │ │
│  POST /appointments            → Book appointment                           │ │
│  GET  /appointments/:id        → View appointment details                   │ │
│  POST /consultations/session   → Create consultation session                │ │
│  POST /consultations/:id/join  → Join session (doctor)                      │ │
│  POST /consultations/:id/end   → End session + auto-chain                   │ │
│  GET  /consultations/:id/soap  → View generated SOAP                        │ │
│  GET  /prescriptions/:id       → View prescription                          │ │
│  GET  /pharmacy/partners       → List pharmacy partners                     │ │
│  POST /pharmacy/cart           → Create cart                              │ │
│  POST /pharmacy/cart/add       → Add items to cart                          │ │
│  POST /pharmacy/cart/checkout  → Convert cart to order                      │ │
│  GET  /pharmacy/orders/:id     → Track order                                │ │
│  GET  /timeline                → View timeline entry                        │ │
│  GET  /health-graph            → View graph updates                         │ │
│  GET  /notifications           → View notifications                         │ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Workflow 2: AI Twin Monitoring → Risk Alert → Preventive Action

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PATIENT JOURNEY: AI Twin Monitoring                                        │
│                                                                              │
│  Background: Patient Priya (F/35, DM2, HTN) has been using WyshCare for     │
│  6 months. Her AI Twin continuously monitors her health data.               │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 1. Daily Monitoring (Background)                                       │ │
│  │    ┌──────────────────────────────────────────────────────────────┐    │ │
│  │    │ • Priya logs BP: 142/92 (morning) — above her normal        │    │ │
│  │    │ • Medication adherence: Metformin 100%, Amlodipine 0%       │    │ │
│  │    │   (missed 3 days)                                            │    │ │
│  │    │ • No new lab results uploaded in 2 months (HbA1c due)       │    │ │
│  │    │ • Step count dropped: 8,200 → 4,500 avg (45% decrease)      │    │ │
│  │    └──────────────────────────────────────────────────────────────┘    │ │
│  │                                                                         │ │
│  │ 2. Risk Engine Triggers Alert                                           │ │
│  │    ┌──────────────────────────────────────────────────────────────┐    │ │
│  │    │ HealthGraphService.assessRisks() detects:                    │    │ │
│  │    │ • BP spike (142/92) → HTN risk score: 72 → 81 (+9 pts)     │    │ │
│  │    │ • Medication non-adherence → DM2 risk score: 85 → 89        │    │ │
│  │    │ • Missed HbA1c window → preventive care gap flagged         │    │ │
│  │    │ • Graph traversal: "Patient → MissedDose(Metformin)" x3     │    │ │
│  │    │   + "Patient → HighBP" edge adds weight                     │    │ │
│  │    │                                                              │    │ │
│  │    │ Action: Risk score crosses MODERATE → HIGH threshold        │    │ │
│  │    │ Event: `health-twin.risk.alert` published                   │    │ │
│  │    └──────────────────────────────────────────────────────────────┘    │ │
│  │                                                                         │ │
│  │ 3. Patient Notification                                                 │ │
│  │    ┌──────────────────────────────────────────────────────────────┐    │ │
│  │    │ Push notification: "⚠️ Your BP has increased. Check trends."│    │ │
│  │    │ Email: "Priya, your health score dropped 82 → 74 this week" │    │ │
│  │    │ AI Twin Dashboard badge: 🔴 2 alerts                          │    │ │
│  │    └──────────────────────────────────────────────────────────────┘    │ │
│  │                                                                         │ │
│  │ 4. Patient Opens AI Twin Dashboard                                     │ │
│  │    ┌──────────────────────────────────────────────────────────────┐    │ │
│  │    • Sees health score: 74 (▼8 from last week)                    │    │ │
│  │    • Risk section: HTN now HIGH (81/100), DM2 HIGH (89/100)     │    │ │
│  │    • Medication adherence: Amlodipine 0% this week               │    │ │
│  │    • Recommendations:                                              │ │
│  │      🔴 1. Resume Amlodipine — missed 3 doses          [Log]    │ │
│  │      🔴 2. Schedule HbA1c test — overdue                 [Book]  │ │
│  │      🟡 3. Check BP daily for 1 week                    [Set Rem]│ │
│  │      🟡 4. Increase activity — target 7,000 steps/day  [Set Goal]│ │
│  │    • AI Chat: "Why did my health score drop?"                    │ │
│  │    → Response: "Your BP increased (142/92) and you missed       │ │
│  │       3 doses of Amlodipine. Taking it daily should help."      │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  5. Preventive Action Taken                                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ • Patient logs missed Amlodipine doses via "Log Medication"           │ │
│  │ • Books HbA1c test via "Book Lab Test" → Thyrocare, home collection  │ │
│  │ • Sets daily BP reminder at 8 AM                                     │ │
│  │ • Sets step goal: 7,000 steps/day                                   │ │
│  │ • AI Twin: "Great! You've addressed 2 of 4 recommendations"         │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  6. Follow-Up (7 days later)                                                 │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ • BP trend normalizing: avg 132/84 (down from 142/92)                │ │
│  │ • Medication adherence: 100% (Amlodipine resumed)                    │ │
│  │ • Steps: 6,200 avg (improving, not yet at target)                    │ │
│  │ • HbA1c result: 6.3% (improved from 6.5%) 🟢                        │ │
│  │ • Health score: 79 (▲5 from 74)                                      │ │
│  │ • Risk scores: HTN 76 (▼5), DM2 82 (▼7)                            │ │
│  │ • AI Twin: "Your health is improving! Keep up the good work."        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  API Calls in Order:                                                         │ │
│  POST /health-graph/sync           → Sync vitals + adherence                │
│  GET  /health-twin/risks            → Risk assessment with graph traversal   │
│  GET  /health-twin                  → Health score dashboard                 │
│  GET  /health-twin/ask?q=...       → AI Twin chat query                     │
│  POST /medications/log             → Log medication dose                     │
│  POST /diagnostics/orders          → Book HbA1c test                        │
│  PUT  /settings/reminders          → Set BP reminder                        │
│  GET  /health-twin/trends          → View 7-day trend                       │
│  GET  /health-twin/recommendations → View recommendations                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Workflow 3: Lab Ordering Cycle (Doctor Order → Collection → Results → Graph Update)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FULL JOURNEY: Lab Ordering Cycle                                           │
│                                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ DOCTOR   │───▶│ SAMPLE   │───▶│ LAB      │───▶│ RESULTS  │              │
│  │ ORDERS   │    │ COLLECT  │    │ PROCESS  │    │ REVIEW   │              │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘              │
│                                                                              │
│  Step 1: Doctor Orders Lab Tests (During Consultation)                      │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 1. During consultation for Amit Singh (M/35, fever + chills)          │ │
│  │ 2. Doctor goes to "Lab Orders" tab in Consultation Workspace          │ │
│  │ 3. AI Copilot recommends: CBC, Dengue NS1, Malaria, CRP              │ │
│  │ 4. Doctor selects all 4 → picks Thyrocare (₹1,250, 24h turnaround)  │ │
│  │ 5. Doctor marks "Home Collection" (patient prefers)                   │ │
│  │ 6. Doctor ends consultation → lab orders auto-created                 │ │
│  │ 7. Event: `lab.order.created` published                               │ │
│  │ 8. Notification to patient: "Dr. Sharma ordered lab tests"            │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Step 2: Patient Schedules Collection (Patient App)                        │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 1. Patient opens app → notif: "Lab tests ordered — schedule pickup"   │ │
│  │ 2. Views lab order: 4 tests, Thyrocare, ₹1,250                       │ │
│  │ 3. Selects home collection → picks timeslot: Jun 5, 8-10 AM          │ │
│  │ 4. Confirms address → order confirmed                                  │ │
│  │ 5. Patient prepares: fasting required (8h for CBC, 12h for glucose)   │ │
│  │ 6. Event: `lab.collection.scheduled` published                         │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Step 3: Phlebotomist Collects Sample (Staff App)                          │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 1. Phlebotomist receives assignment on Staff App                      │ │
│  │ 2. Views collection route: Amit Singh, 123 MG Road, 8 AM slot        │ │
│  │ 3. Arrives at location → verifies patient ID via QR code              │ │
│  │ 4. Collects samples:                                                  │ │
│  │    🟣 Lavender (CBC) → 3 mL ✓                                        │ │
│  │    🔴 Red (Dengue NS1) → 2 mL ✓                                      │ │
│  │    🟢 Green (Malaria) → 2 mL ✓                                       │ │
│  │    🟡 Yellow (CRP) → 2 mL ✓                                          │ │
│  │ 5. Labels each tube with barcode                                     │ │
│  │ 6. Stores in cold chain bag (2-8°C for CBC)                          │ │
│  │ 7. Marks "All Collected" → status: IN_TRANSIT                        │ │
│  │ 8. Event: `lab.sample.collected` published                            │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Step 4: Lab Processes Samples (Lab Dashboard)                             │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 1. Samples arrive at Thyrocare lab → scanned into system              │ │
│  │ 2. Lab technician assigns to instruments:                             │ │
│  │    - CBC → Sysmex XN-1000 (Hematology Analyzer)                       │ │
│  │    - Dengue NS1 → ELISA Reader                                        │ │
│  │    - Malaria → Rapid test kit + microscopy                            │ │
│  │    - CRP → Biochemistry Analyzer                                      │ │
│  │ 3. Results auto-populate from instruments (LIS integration):          │ │
│  │    - CBC: Normal (WBC 8.2, Hb 14.1, Platelets 2.8 lakh)             │ │
│  │    - Dengue NS1: Negative 🟢                                          │ │
│  │    - Malaria: Negative 🟢                                             │ │
│  │    - CRP: 12 mg/L (elevated, normal <5) 🟡                          │ │
│  │ 4. Pathologist reviews abnormal CRP → approves report                │ │
│  │ 5. Report marked FINAL → available for download                      │ │
│  │ 6. Event: `lab.result.ready` published                                │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Step 5: Results Available (Patient + Doctor)                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Patient View:                                                          │ │
│  │ 1. Notification: "Your lab results are ready"                         │ │
│  │ 2. Opens app → Timeline → sees "🔬 Lab Report: CBC"                  │ │
│  │ 3. Views results with AI interpretation:                              │ │
│  │    "🤖 Your CBC is normal. Dengue and Malaria negative.               │ │
│  │     CRP is slightly elevated, suggesting inflammation.                 │ │
│  │     Your doctor will review and advise."                              │ │
│  │ 4. Downloads PDF report                                               │ │
│  │                                                                        │ │
│  │ Doctor View:                                                           │ │
│  │ 1. Notification: "Lab results ready — Amit Singh"                    │ │
│  │ 2. Opens consultation history → sees results flagged 🟡             │ │
│  │ 3. Reviews CRP elevation → adds note: "Continue current plan,        │ │
│  │    CRP trending down from initial presentation"                       │ │
│  │ 4. Marks as reviewed                                                  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Step 6: Health Graph Update (Automatic)                                   │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ HealthGraphService.syncFromLabResult() triggers:                       │ │
│  │                                                                        │ │
│  │ Node Operations:                                                       │ │
│  │   • Create/Update: LabResult (CBC, Dengue, Malaria, CRP)              │ │
│  │   • Create: LabResult value nodes for abnormal values                 │ │
│  │     → CRP: 12 mg/L (abnormal, flagged)                               │ │
│  │                                                                        │ │
│  │ Edge Operations:                                                       │ │
│  │   • Patient → HAS_LAB_RESULT → CBC (Normal)                          │ │
│  │   • Patient → HAS_LAB_RESULT → CRP (Elevated)                        │ │
│  │   • Diagnosis(Viral URTI) → HAS_LAB_RESULT → CBC                      │ │
│  │   • CRP → INDICATES → Inflammation (clinical rule matched)            │ │
│  │                                                                        │ │
│  │ Risk Assessment (triggered after graph sync):                          │ │
│  │   • BFS traversal from patient node                                   │ │
│  │   • Clinical rule: "CRP >10 + Fever + No Dengue → Bacterial inf."    │ │
│  │   • Risk update: Infection risk score adjusted                        │ │
│  │                                                                        │ │
│  │ Timeline Update:                                                       │ │
│  │   • Entry: "🔬 Lab results: CBC (Normal), CRP (Elevated)"            │ │
│  │   • Links to: Consultation (Dr. Sharma, Jun 4)                       │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  API Calls in Order:                                                         │ │
│  POST /appointments              → Book appointment (if not from consult)   │
│  POST /consultations/session     → Create consultation session              │
│  POST /consultations/:id/labs    → Order lab tests                          │
│  PATCH /lab-orders/:id/schedule  → Schedule collection                     │
│  PATCH /lab-orders/:id/collect   → Mark samples collected                  │
│  PATCH /lab-orders/:id/process   → Process samples in lab                  │
│  PATCH /lab-orders/:id/report    → Upload results / mark final             │
│  GET  /lab-orders/:id            → View results (patient + doctor)         │
│  POST /health-graph/sync/lab     → Sync lab results to graph               │
│  GET  /health-twin/risks         → Updated risk assessment                 │
│  GET  /timeline                  → View timeline entry                     │
│  GET  /notifications             → View notification                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## References

- **Part 1**: `PRODUCT_SPECIFICATION_P1.md` — Screen inventory (118 screens), navigation architecture, 10 detailed screens
- **Part 2**: `PRODUCT_SPECIFICATION_P2.md` — Consultation Workspace, Health Timeline, AI Twin Experience
- **Enterprise Architecture**: `ENTERPRISE_ARCHITECTURE.md` — System architecture, DB schema, RBAC, APIs, events, infra

---

*End of Part 3 — covers Staff Queue Engine, Tenant Hierarchy, Mobile Wireframes, Design System v2, and 3 E2E Workflows*
