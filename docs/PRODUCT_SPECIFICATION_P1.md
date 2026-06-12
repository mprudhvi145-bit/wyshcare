# WYSHCARE OS — Product Specification

> Complete screen-by-screen product specification.
> Interaction models, workflows, layouts, states, and hierarchy for every screen.

---

## Contents

- [1. Screen Inventory](#1-screen-inventory)
- [2. Navigation Architecture](#2-navigation-architecture)
- [3. Patient App Screens](#3-patient-app-screens)
- [4. Doctor App Screens](#4-doctor-app-screens)
- [5. Staff App Screens](#5-staff-app-screens)
- [6. Admin App Screens](#6-admin-app-screens)
- [7. Master Dashboard](#7-master-dashboard)

**See companion files:**
- `PRODUCT_SPECIFICATION_P2.md` — Consultation workspace, Health timeline, AI Twin
- `PRODUCT_SPECIFICATION_P3.md` — Staff queue engine, Tenant hierarchy, Mobile wireframes, Design system v2, Workflows

---

## 1. Screen Inventory

### Patient App — 42 screens

| ID | Screen | Route | Auth | Layout |
|---|---|---|---|---|
| PAT-001 | Splash / Onboarding | `/` | No | Centered |
| PAT-002 | Login | `/login` | No | Centered |
| PAT-003 | Verify OTP | `/verify` | No | Centered |
| PAT-004 | Profile Setup | `/onboarding/profile` | Yes | Centered |
| PAT-005 | ABHA Link | `/onboarding/abha` | Yes | Centered |
| PAT-006 | Home | `/home` | Yes | AppShell |
| PAT-007 | Health Timeline | `/timeline` | Yes | AppShell |
| PAT-008 | Timeline Entry Detail | `/timeline/:id` | Yes | AppShell |
| PAT-009 | Medical Records | `/records` | Yes | AppShell |
| PAT-010 | Record Detail | `/records/:id` | Yes | AppShell |
| PAT-011 | Record Upload | `/records/upload` | Yes | AppShell |
| PAT-012 | Prescriptions | `/prescriptions` | Yes | AppShell |
| PAT-013 | Prescription Detail | `/prescriptions/:id` | Yes | AppShell |
| PAT-014 | Appointments | `/appointments` | Yes | AppShell |
| PAT-015 | Appointment Booking | `/appointments/book` | Yes | AppShell |
| PAT-016 | Appointment Detail | `/appointments/:id` | Yes | AppShell |
| PAT-017 | Telemedicine Room | `/appointments/:id/join` | Yes | Fullscreen |
| PAT-018 | Doctor Discovery | `/discover` | Yes | AppShell |
| PAT-019 | Doctor Profile | `/discover/:id` | Yes | AppShell |
| PAT-020 | Diagnostics | `/diagnostics` | Yes | AppShell |
| PAT-021 | Diagnostics Booking | `/diagnostics/book` | Yes | AppShell |
| PAT-022 | Diagnostics Order Detail | `/diagnostics/orders/:id` | Yes | AppShell |
| PAT-023 | Pharmacy Home | `/pharmacy` | Yes | AppShell |
| PAT-024 | Pharmacy Search | `/pharmacy/search` | Yes | AppShell |
| PAT-025 | Pharmacy Partner | `/pharmacy/partners/:id` | Yes | AppShell |
| PAT-026 | Pharmacy Cart | `/pharmacy/cart` | Yes | AppShell |
| PAT-027 | Pharmacy Checkout | `/pharmacy/checkout` | Yes | AppShell |
| PAT-028 | Pharmacy Orders | `/pharmacy/orders` | Yes | AppShell |
| PAT-029 | Pharmacy Order Detail | `/pharmacy/orders/:id` | Yes | AppShell |
| PAT-030 | AI Twin Dashboard | `/ai-twin` | Yes | AppShell |
| PAT-031 | AI Twin Ask | `/ai-twin/ask` | Yes | AppShell |
| PAT-032 | AI Twin Risks | `/ai-twin/risks` | Yes | AppShell |
| PAT-033 | AI Twin Trends | `/ai-twin/trends` | Yes | AppShell |
| PAT-034 | Family | `/family` | Yes | AppShell |
| PAT-035 | Family Member Detail | `/family/:id` | Yes | AppShell |
| PAT-036 | Add Family Member | `/family/add` | Yes | AppShell |
| PAT-037 | Insurance | `/insurance` | Yes | AppShell |
| PAT-038 | Insurance Claim Detail | `/insurance/claims/:id` | Yes | AppShell |
| PAT-039 | Settings | `/settings` | Yes | AppShell |
| PAT-040 | Security & Sessions | `/settings/security` | Yes | AppShell |
| PAT-041 | Notification Preferences | `/settings/notifications` | Yes | AppShell |
| PAT-042 | Emergency Profile | `/settings/emergency` | Yes | AppShell |

### Doctor App — 28 screens

| ID | Screen | Route | Auth | Layout |
|---|---|---|---|---|
| DOC-001 | Login | `/login` | No | Centered |
| DOC-002 | Verify OTP | `/verify` | No | Centered |
| DOC-003 | Onboarding Profile | `/onboarding` | Yes | Centered |
| DOC-004 | KYC Upload | `/onboarding/kyc` | Yes | Centered |
| DOC-005 | Schedule Setup | `/onboarding/schedule` | Yes | Centered |
| DOC-006 | Dashboard | `/dashboard` | Yes | AppShell |
| DOC-007 | Today's Patients | `/today` | Yes | AppShell |
| DOC-008 | Patient Queue | `/today/queue` | Yes | AppShell |
| DOC-009 | Consultation Workspace | `/consultations/:id` | Yes | ThreePane |
| DOC-010 | Consultation History | `/consultations` | Yes | AppShell |
| DOC-011 | Schedule View | `/schedule` | Yes | AppShell |
| DOC-012 | Schedule Manage | `/schedule/manage` | Yes | AppShell |
| DOC-013 | Patient Registry | `/patients` | Yes | AppShell |
| DOC-014 | Patient Detail | `/patients/:id` | Yes | AppShell |
| DOC-015 | Patient Records | `/patients/:id/records` | Yes | AppShell |
| DOC-016 | Prescriptions | `/prescriptions` | Yes | AppShell |
| DOC-017 | New Prescription | `/prescriptions/create` | Yes | FullWidth |
| DOC-018 | Prescription Detail | `/prescriptions/:id` | Yes | AppShell |
| DOC-019 | AI Copilot | `/ai-copilot` | Yes | Panel |
| DOC-020 | Lab Orders | `/lab-orders` | Yes | AppShell |
| DOC-021 | Lab Order Detail | `/lab-orders/:id` | Yes | AppShell |
| DOC-022 | Messages | `/messages` | Yes | AppShell |
| DOC-023 | Message Thread | `/messages/:id` | Yes | AppShell |
| DOC-024 | Patient Reviews | `/reviews` | Yes | AppShell |
| DOC-025 | Analytics | `/analytics` | Yes | AppShell |
| DOC-026 | Earnings | `/earnings` | Yes | AppShell |
| DOC-027 | Settings | `/settings` | Yes | AppShell |
| DOC-028 | Telemedicine Dashboard | `/tele-dashboard` | Yes | AppShell |

### Staff App — 20 screens

| ID | Screen | Route | Auth | Layout |
|---|---|---|---|---|
| STF-001 | Role Selection | `/` | No | Centered |
| STF-002 | Login | `/login` | No | Centered |
| STF-003 | Reception Dashboard | `/reception` | Yes | AppShell |
| STF-004 | Appointment Queue | `/reception/appointments` | Yes | AppShell |
| STF-005 | Check-In | `/reception/check-in/:id` | Yes | AppShell |
| STF-006 | Walk-In Registration | `/reception/walk-in` | Yes | AppShell |
| STF-007 | Billing Queue | `/reception/billing` | Yes | AppShell |
| STF-008 | Nurse Dashboard | `/nurse` | Yes | AppShell |
| STF-009 | Vitals Entry | `/nurse/vitals/:id` | Yes | AppShell |
| STF-010 | Task List | `/nurse/tasks` | Yes | AppShell |
| STF-011 | Lab Dashboard | `/lab` | Yes | AppShell |
| STF-012 | Sample Collection | `/lab/samples` | Yes | AppShell |
| STF-013 | Processing Queue | `/lab/processing` | Yes | AppShell |
| STF-014 | Report Verification | `/lab/reports` | Yes | AppShell |
| STF-015 | Pharmacy Dashboard | `/pharmacy` | Yes | AppShell |
| STF-016 | Prescription Queue | `/pharmacy/prescriptions` | Yes | AppShell |
| STF-017 | Inventory Management | `/pharmacy/inventory` | Yes | AppShell |
| STF-018 | Delivery Orders | `/pharmacy/deliveries` | Yes | AppShell |
| STF-019 | Staff Schedule | `/schedule` | Yes | AppShell |
| STF-020 | Settings | `/settings` | Yes | AppShell |

### Admin App — 22 screens

| ID | Screen | Route | Auth | Layout |
|---|---|---|---|---|
| ADM-001 | Login | `/login` | No | Centered |
| ADM-002 | Organizations | `/organizations` | Yes | AppShell |
| ADM-003 | Organization Detail | `/organizations/:id` | Yes | AppShell |
| ADM-004 | Users | `/users` | Yes | AppShell |
| ADM-005 | User Detail | `/users/:id` | Yes | AppShell |
| ADM-006 | Roles | `/roles` | Yes | AppShell |
| ADM-007 | Role Detail | `/roles/:id` | Yes | AppShell |
| ADM-008 | Permissions | `/permissions` | Yes | AppShell |
| ADM-009 | Doctors Directory | `/doctors` | Yes | AppShell |
| ADM-010 | Doctor Detail | `/doctors/:id` | Yes | AppShell |
| ADM-011 | Patients Directory | `/patients` | Yes | AppShell |
| ADM-012 | Patient Detail | `/patients/:id` | Yes | AppShell |
| ADM-013 | ABDM Monitoring | `/abdm` | Yes | AppShell |
| ADM-014 | Integrations | `/integrations` | Yes | AppShell |
| ADM-015 | AI Model Registry | `/ai-models` | Yes | AppShell |
| ADM-016 | Payments | `/payments` | Yes | AppShell |
| ADM-017 | Refunds | `/payments/refunds` | Yes | AppShell |
| ADM-018 | Audit Logs | `/audit-logs` | Yes | AppShell |
| ADM-019 | Platform Analytics | `/analytics` | Yes | AppShell |
| ADM-020 | Settings | `/settings` | Yes | AppShell |
| ADM-021 | Compliance | `/compliance` | Yes | AppShell |
| ADM-022 | API Keys | `/settings/api-keys` | Yes | AppShell |

### Master Dashboard — 6 screens

| ID | Screen | Route | Auth | Layout |
|---|---|---|---|---|
| MDB-001 | Workspace Select | `/` | Yes | FullWidth |
| MDB-002 | Recent Activity | `/activity` | Yes | AppShell |
| MDB-003 | Notifications | `/notifications` | Yes | AppShell |
| MDB-004 | Profile | `/profile` | Yes | AppShell |
| MDB-005 | Organization Switcher | `/org-switch` | Yes | Modal |
| MDB-006 | User Menu | `/profile/menu` | Yes | Popover |

---

## 2. Navigation Architecture

### Patient App

```
Bottom Navigation (Mobile):
  ┌─────────┬──────────┬──────────┬──────────┬──────────┐
  │  Home   │ Timeline │  Care    │ Pharmacy │ Settings │
  │  🏠     │  📋      │  🏥     │  💊      │  ⚙️      │
  └─────────┴──────────┴──────────┴──────────┴──────────┘

Sidebar Navigation (Desktop):
  ┌─────────────────────────────────────┐
  │ Logo + App Name                     │
  ├─────────────────────────────────────┤
  │ 🏠 Home                             │
  │ 📋 Health Timeline                  │
  │ 📁 Medical Records                  │
  │ 📄 Prescriptions                    │
  │ 📅 Appointments                     │
  │ 🔬 Diagnostics                      │
  │ 💊 Pharmacy                         │
  │ ─────────────────────────────────── │
  │ 🤖 AI Health Twin        ⭐ NEW    │
  │ ─────────────────────────────────── │
  │ 👨‍👩‍👧‍👦 Family                      │
  │ 🛡️ Insurance                        │
  │ ⚙️ Settings                         │
  └─────────────────────────────────────┘
```

### Doctor App

```
Sidebar Navigation:
  ┌─────────────────────────────────────┐
  │ Logo + "Dr. Name"                   │
  │ Today: 12 patients                  │
  ├─────────────────────────────────────┤
  │ 📊 Dashboard                        │
  │ 👥 Today's Patients      (12)      │
  │ 📅 Schedule                         │
  │ 💬 Consultations                    │
  │ 👤 Patients                         │
  │ 📝 Prescriptions                    │
  │ 🤖 AI Copilot                       │
  │ ─────────────────────────────────── │
  │ 📨 Messages              (3)       │
  │ 📈 Analytics                        │
  │ 💰 Earnings                         │
  │ ⚙️ Settings                         │
  └─────────────────────────────────────┘
```

### Staff App (Role-Based)

```
Receptionist:
  ┌─────────────────────────────────────┐
  │ 🏪 Reception Dashboard              │
  │ 📋 Appointment Queue      (8)      │
  │ ✅ Check-In                         │
  │ ➕ Walk-In Registration             │
  │ 💳 Billing Queue          (3)      │
  │ ⚙️ Settings                         │
  └─────────────────────────────────────┘

Nurse:
  ┌─────────────────────────────────────┐
  │ 🩺 Nurse Dashboard                  │
  │ ❤️ Vitals Entry           (5)      │
  │ 📋 Assigned Tasks         (2)      │
  │ ⚙️ Settings                         │
  └─────────────────────────────────────┘

Lab Staff:
  ┌─────────────────────────────────────┐
  │ 🔬 Lab Dashboard                    │
  │ 🧪 Sample Collection      (4)      │
  │ ⚗️ Processing Queue       (7)      │
  │ ✅ Report Verification    (3)      │
  │ ⚙️ Settings                         │
  └─────────────────────────────────────┘

Pharmacy Staff:
  ┌─────────────────────────────────────┐
  │ 💊 Pharmacy Dashboard               │
  │ 📄 Prescription Queue    (11)      │
  │ 📦 Inventory Management             │
  │ 🚚 Delivery Orders       (5)       │
  │ ⚙️ Settings                         │
  └─────────────────────────────────────┘
```

---

## 3. Patient App Screens

### PAT-006: Home

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🔍 Search doctors, symptoms, medicines...                     🔔 👤          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Good morning, Priya 👋                                      [June 4, 2026] │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Health Summary                           → View AI Twin                │ │
│  │                                                                         │ │
│  │  📊 Overall Health Score: 82/100  ─────●────────────────  Better       │ │
│  │                                                                         │ │
│  │  ⚠️  Medications Due:         Amlodipine 5mg — 2h left                │ │
│  │  📅  Next Appointment:        Dr. Sharma — Tomorrow, 10:30 AM         │ │
│  │  📋  Pending Lab Results:     2 reports ready                         │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Quick Actions                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ 📅       │  │ 🩺       │  │ 💊       │  │ 🔬       │                   │
│  │ Book     │  │ Consult  │  │ Order    │  │ Book     │                   │
│  │ Doctor   │  │ Now      │  │ Medicines│  │ Lab Test │                   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                   │
│                                                                              │
│  Upcoming Appointments                                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 🩺 Dr. Arun Sharma — General Physician                      10:30 AM  │ │
│  │    📍 Video Consultation — 4h 15m left              [Join]  [Resched] │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Recent Activity                                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 📄 Prescription issued    Dr. Mehta     Yesterday         → View      │ │
│  │ 🔬 Lab report uploaded    Blood Test    2 days ago        → View      │ │
│  │ 💊 Order delivered        Apollo Pharma 3 days ago        → Track     │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  AI Health Snapshot                                                          │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 🤖  Your Health at a Glance                                             │ │
│  │                                                                         │ │
│  │  🩺 Conditions: 3 tracked     📊 Risk Level: Moderate                  │ │
│  │  💊 Medications: 4 active     ✅ Adherence: 85%                        │ │
│  │  📈 Trend: Stable             🎯 Next Check: Jul 15                    │ │
│  │                                                                         │ │
│  │  [View Full AI Twin →]                                                  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🏠 Home  │ 📋 Timeline  │ 🏥 Care  │ 💊 Pharmacy  │ ⚙️ Settings            │
└─────────────────────────────────────────────────────────────────────────────┘

States:
  Loading:  Skeleton placeholders for health score, quick actions,
            upcoming appointments, recent activity, AI snapshot
  Empty:    Welcome message for new users: "Welcome to WyshCare!
            Book your first appointment or explore your health twin."
  Error:    "Unable to load your health data. Pull to retry."
            Degraded: show cached data with "Last updated: 2h ago"
```

### PAT-007: Health Timeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ←  Health Timeline                          [Filter ▼] [Search]            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  2026                               [Zoom: Month ▼]                         │
│                                                                              │
│  JUNE 4, 2026 - TODAY                                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 🩺  10:30 AM ─── Consulted Dr. Arun Sharma (Video)                     │ │
│  │     Diagnosis: Hypertension, Seasonal Allergies                        │ │
│  │     [View Prescription →]                                              │ │
│  │                                                     ──●── Timeline Dot │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  JUNE 2, 2026                                                                │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 🔬  Lab Report: Complete Blood Count                                   │ │
│  │     Status: Normal — All values within range                           │ │
│  │     [View Report →]                                                    │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 💊 10:00 AM ─── Took Amlodipine 5mg                                   │ │
│  │     Adherence logged ✓                                                 │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  MAY 28, 2026                                                                │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 🏥  Blood Pressure Check — Self Recorded                               │ │
│  │     128/85 mmHg — Within normal range                                  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 💊  Refill Requested: Metformin 500mg (30 tablets)                     │ │
│  │     Pharmacy: Apollo — Status: FULFILLING                              │ │
│  │     [Track Order →]                                                    │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│  [Load More ▼]                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🏠 Home  │ 📋 Timeline  │ 🏥 Care  │ 💊 Pharmacy  │ ⚙️ Settings            │
└─────────────────────────────────────────────────────────────────────────────┘

Interaction:
  - Vertical timeline — alternating left/right cards (desktop) / single column (mobile)
  - Each entry: icon + title + timestamp + summary + action
  - Swipe left on mobile: reveal actions (View Details, Share, Delete)
  - Pull to refresh | Infinite scroll with "Load More"
  - Filter: All | Medical | Appointments | Medications | Labs | Pharmacy
  - Zoom: Day | Week | Month | Year | Custom Range
  - Long press: context menu (Copy, Share, Save)
```

### PAT-014: Appointments

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ←  Appointments                                        [+ Book New]         │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Upcoming] [Past] [Cancelled]                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Today · June 4                                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 🩺 Dr. Arun Sharma                                 10:30 - 10:45 AM   │ │
│  │    🎥 Video Consultation — 4h 15m away           [Join] [Reschedule]   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Tomorrow · June 5                                                           │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 🩺 Dr. Priya Mehta                               2:00 - 2:15 PM       │ │
│  │    🏥 Apollo Clinic — MG Road, Bangalore                   [Details]   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  June 10                                                                    │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 🔬 Thyrocare — Home Collection                      8:00 - 10:00 AM   │ │
│  │    Lab Tests: Complete Blood Count, Thyroid Profile     [Reschedule]   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🏠 Home  │ 📋 Timeline  │ 🏥 Care  │ 💊 Pharmacy  │ ⚙️ Settings            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### PAT-023: Pharmacy Home

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ←  Pharmacy Marketplace                         [Search Medicines...]      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  📋 Prescription Queue                                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ You have 2 pending prescriptions from Dr. Sharma                      │ │
│  │ [Upload New Prescription]  [Order from Existing]                       │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  🔍 Quick Order — Search any medicine                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ ┌────────────────────────────────────────────────────────────────┐    │ │
│  │ │ Search by medicine name, brand, or category...                 │ 🔍 │ │
│  │ └────────────────────────────────────────────────────────────────┘    │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Featured Pharmacies                                                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │ Apollo Pharmacy   │  │ Netmeds          │  │ 1mg              │         │
│  │ ★ 4.5 · 2km      │  │ ★ 4.3 · 5km      │  │ ★ 4.4 · 3km      │         │
│  │ ⏱ 30 min delivery│  │ ⏱ 45 min delivery│  │ ⏱ 35 min delivery│         │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘         │
│                                                                              │
│  My Orders                                                                   │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 🚚 Order #WSP-1234 — Apollo Pharmacy                     In Transit    │ │
│  │    Paracetamol 500mg, Amoxicillin 250mg                    [Track]     │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🏠 Home  │ 📋 Timeline  │ 🏥 Care  │ 💊 Pharmacy  │ ⚙️ Settings            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### PAT-030: AI Twin Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ←  AI Health Twin                              [Last updated: 2h ago]       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  🤖  Your Health Score                              [What's this?]     │ │
│  │                                                                         │ │
│  │    82                                                                   │ │
│  │    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━○───── 82/100                 │ │
│  │    📈 Up from 78 last month    │    🎯 Target: 85+                      │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ 🩺 Conditions│  │ 💊 Medications│  │ 📊 Risks     │  │ 📈 Trends    │   │
│  │ 3 tracked    │  │ 4 active     │  │ 2 Moderate   │  │ Stable       │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                              │
│  Risk Assessment                                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Condition            Score      Level           Trend                   │ │
│  │ ────────────────────────────────────────────────────────────────────── │ │
│  │ 🩸 Hypertension      72/100   ⚠️ Moderate      ───●──  ↓ Improving    │ │
│  │ 🍬 Diabetes Type 2   85/100   🔴 High          ──●───  → Stable      │ │
│  │ ❤️ Cardiac Risk      45/100   🟢 Low           ─●────  → Stable      │ │
│  │                                                                         │ │
│  │  [View Full Risk Analysis →]                                            │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Medication Adherence                                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ This Week: 85%                          ▼ 5% from last week            │ │
│  │                                                                         │ │
│  │ Amlodipine 5mg    ████████████░░░░  85%  ───●──  Last dose: Today AM │ │
│  │ Metformin 500mg   ██████████████░░  92%  ──●───  Last dose: Today PM │ │
│  │ Atorvastatin 10mg ██████████░░░░░░  72%  ─●────  Last dose: Yesterday│ │
│  │                                                                         │ │
│  │  [View All Medications →]                                               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Health Trends (6 Months)                                                    │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  BP Systolic  ─────●────●──●────●─────●─────  Avg: 128                │ │
│  │                          ╲ ╱                                           │ │
│  │  BP Diastolic ───●───────●─●────●──────●────  Avg: 84                 │ │
│  │  HbA1c        ────●───────────●───────────●─  6.8 → 6.5 → 6.4        │ │
│  │  Jan  Feb  Mar  Apr  May  Jun                                           │ │
│  │                                                                         │ │
│  │  [View Full Trends →]                                                   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  💬  Ask your AI Twin                                                   │ │
│  │  ┌────────────────────────────────────────────────────────────────┐    │ │
│  │  │ What medications am I taking?                                  │ 🚀 │ │
│  │  └────────────────────────────────────────────────────────────────┘    │ │
│  │  Quick Questions: [What is my BP trend?] [Should I worry about pain?]   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Recommendations (AI-Generated)                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 🎯  Personalized recommendations for this month:                       │ │
│  │  1. Schedule a diabetes follow-up — Last visit was 3 months ago       │ │
│  │  2. Repeat HbA1c test — Due this month                                 │ │
│  │  3. Consider annual eye exam — Diabetic patients need regular checks  │ │
│  │  4. Increase physical activity — Your step count dropped 20%           │ │
│  │  [Dismiss All] [Schedule All]                                         │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🏠 Home  │ 📋 Timeline  │ 🏥 Care  │ 💊 Pharmacy  │ ⚙️ Settings            │
└─────────────────────────────────────────────────────────────────────────────┘

States:
  Loading:  Full-page skeleton — health score circle pulsing, risk cards shimmering,
            trend chart placeholder, adherence bar loading
  Empty:    "Welcome to your AI Health Twin!" with [Book Appointment] [Upload Record]
            [Connect ABHA] prompts
  Low Data: Twin works with partial data. Show what's available + prompt to add more
  Error:    "Unable to update your health twin. Showing last known data from [date]."
```

---

## 4. Doctor App Screens

### DOC-006: Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📊 Dashboard                                      Dr. Arun Sharma 🟢       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Today · June 4, 2026                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ 📅           │  │ 🩺           │  │ ⏱            │  │ ⭐           │   │
│  │ Appointments │  │ Patients Seen│  │ Avg Time     │  │ Rating       │   │
│  │ 12           │  │ 8/12         │  │ 12 min       │  │ 4.8 ★       │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                              │
│  Upcoming Patients                                                           │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Time     Patient           Type       Status                Actions    │ │
│  │ ────────────────────────────────────────────────────────────────────── │ │
│  │ 09:15   Rajesh Kumar      🩺 New    🔴 Waiting              [Start]   │ │
│  │ 09:30   Priya Sharma      🩺 F/U    🟢 In Room · Nurse done [Join]   │ │
│  │ 10:00   Amit Singh        🔬 Lab    ⏳ Pending              [Pending] │ │
│  │ 10:30   Sunita Patel      🩺 New    ⏳ Pending              [Pending] │ │
│  │ 11:00   Vikram Joshi      💊 Rx     ⏳ Pending              [Pending] │ │
│  │ 11:15   Ananya Gupta      🩺 F/U    🟢 In Room             [Join]   │ │
│  │                                                                         │ │
│  │ [View Full Schedule →]                                                  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Pending Actions                                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 📝 3 prescriptions pending verification                          ⏰ 1h │ │
│  │ 🔬 2 lab reports to review                                        ⏰ 2h │ │
│  │ 💬 1 patient follow-up message                                    ⏰ 1d │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  AI Copilot Insights                                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 🤖  Today's patient insights                                           │ │
│  │  • Rajesh Kumar: No prior history — New patient                       │ │
│  │  • Priya Sharma: HbA1c increased 6.2% → 6.5% — Consider med adj.     │ │
│  │  • Amit Singh: Last visit 6 months ago — Due for annual check         │ │
│  │  • Sunita Patel: Family history of diabetes — Recommend HbA1c         │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📊 Dash  │ 👥 Queue  │ 📅 Schedule  │ 💬 Consults  │ 👤 Patients          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Staff App Screens

### STF-003: Reception Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🏪 Reception Dashboard                      Apollo Clinic · Jun 4, 2026     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ 📅 Total     │  │ ✅ Checked In│  │ ⏳ Waiting   │  │ ❌ No-show   │   │
│  │ 24           │  │ 8            │  │ 5            │  │ 2            │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                              │
│  ⏱ Current Wait Time: ~14 min avg                    Peak: 10-11 AM        │
│                                                                              │
│  Queue Overview                                                              │
│  ┌──────────┬──────┬──────────────┬────────┬───────────────┬──────────────┐ │
│  │ Queue    │ Count│ Avg Wait     │ Status │ Next Patient  │ Action       │ │
│  ├──────────┼──────┼──────────────┼────────┼───────────────┼──────────────┤ │
│  │ ✅ Check │ 5    │ —            │ Open   │ Rajesh Kumar  │ [Check In]  │ │
│  │ ❤️ Vitals│ 3    │ 5 min        │ Busy   │ Priya Sharma  │ [View]      │ │
│  │ 🩺 Doctor│ 2    │ 8 min        │ Open   │ Ananya Gupta  │ [Call]      │ │
│  │ 💳 Bill  │ 1    │ 3 min        │ Open   │ Vikram Joshi  │ [Process]   │ │
│  └──────────┴──────┴──────────────┴────────┴───────────────┴──────────────┘ │
│                                                                              │
│  [+ Walk-in Registration]  [View All Appointments]  [Export]                │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📋 Queue  │ ✅ Check-In  │ ➕ Walk-In  │ 💳 Billing  │ ⚙️                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Admin App Screens

### ADM-002: Organizations

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Organizations                                          [+ New Organization]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [All] [Active] [Trial] [Suspended] [Expired]              🔍 Search...    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Organization           Type      Status    Users  Patients  Created    │ │
│  │ ────────────────────────────────────────────────────────────────────── │ │
│  │ Apollo Hospitals       ENTERPR   🟢 Active  1,234   45K     Jan 2025 │ │
│  │ Max Healthcare         ENTERPR   🟢 Active  892     32K     Mar 2025 │ │
│  │ Dr. Sharma Clinic      CLINIC    🟢 Active  12      1.2K    Jun 2025 │ │
│  │ City Diagnostics       LAB       🟡 Trial   45      8K      Apr 2026 │ │
│  │ Green Valley Hospital  HOSPITAL  🔴 Susp.   0       0       Dec 2025 │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🏢 Orgs  │ 👥 Users  │ 🔐 Roles  │ 🔧 Settings  │ 📊 Analytics            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Master Dashboard

### MDB-001: Workspace Select

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WYSHCARE OS                          👤 admin@wyshcare   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Welcome back, Admin 👋                                                     │
│  You have access to 4 workspaces                                            │
│                                                                              │
│  ┌────────────────────────────────────┐  ┌────────────────────────────────┐ │
│  │                                    │  │                                │ │
│  │  🏥  Apollo Hospitals             │  │  🏪  Dr. Sharma Clinic         │ │
│  │     Enterprise Plan               │  │     Clinic Plan                │ │
│  │     Last active: 2h ago           │  │     Last active: Yesterday     │ │
│  │                                    │  │                                │ │
│  │  [Launch Patient Workspace]       │  │  [Launch Patient Workspace]    │ │
│  │  [Launch Admin Workspace]         │  │  [Launch Doctor Workspace]     │ │
│  │  [Launch Staff Workspace]         │  │  [Launch Staff Workspace]      │ │
│  │                                    │  │                                │ │
│  └────────────────────────────────────┘  └────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────┐  ┌────────────────────────────────┐ │
│  │                                    │  │                                │ │
│  │  🔬  City Diagnostics            │  │  ➕  Add New Organization      │ │
│  │     Trial Plan (14 days left)     │  │                                │ │
│  │     Setup incomplete              │  │  Onboard a hospital, clinic,  │ │
│  │                                    │  │  or diagnostic lab            │ │
│  │  [Continue Setup →]               │  │                                │ │
│  │                                    │  │  [Create New →]                │ │
│  └────────────────────────────────────┘  └────────────────────────────────┘ │
│                                                                              │
│  Recent Activity (All Workspaces)                                            │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 2h ago  🏥 Apollo — New doctor registered: Dr. Mehta (Cardiology)     │ │
│  │ 5h ago  🏪 Sharma — Subscription upgraded to CLINIC plan              │ │
│  │ 1d ago  🔬 City Diag — Trial started (14 days remaining)              │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```
