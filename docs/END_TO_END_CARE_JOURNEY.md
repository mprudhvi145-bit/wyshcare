# End-to-End Care Journey: Doctor Discovery → Consultation → Prescription → Pharmacy

> Generated: June 4, 2026
> Design covering: Frontend screens, backend APIs, database models, ABDM touchpoints, audit events, notifications

---

## 1. Journey Overview

```
DISCOVERY → BOOKING → PAYMENT → CONSULTATION → PRESCRIPTION → PHARMACY
    │           │          │           │              │             │
    ▼           ▼          ▼           ▼              ▼             ▼
 Find       Select     Pay for     Video/       Doctor        Order
 Doctor     Slot +     Consult-    In-Person    Issues        Medicines
 + Check    Book       ation       Consult-     Digital       from
 Avail-     Appoint-               ation        Prescription  Pharmacy
 ability    ment                                              + Track
```

---

## 2. Step-by-Step Flow

### Step 1: Doctor Discovery & Search

**User action**: Navigate to `/app/discovery`, search by name/specialty/symptom

**Frontend**: `app/(platform)/app/discovery/page.tsx`
- Search input + filter bar (specialty, language, telemedicine, rating)
- Results list with doctor cards (name, specialty, fee, rating, availability)
- "Book Appointment" CTA on each card

**Backend**:
```
GET /api/v1/discovery?query=cardiology&specialty=Cardiologist&telemedicine=true
├── Controller: DiscoveryController.search()
├── Service: DiscoveryService.search()   → DoctorProfile + User join
├── DB: DoctorProfile (verified=true) + User
└── Response: [{id, name, specialization, rating, fee, telemedicineAvailable}]
```

**ABDM Touchpoint**: UHI `POST /search` → `POST /on_search` (optional — WyshCare as HSPA)

**Audit Event**: `DOCTOR_SEARCHED` (actorUserId, query)

---

### Step 2: Doctor Profile & Availability

**User action**: Select doctor → View full profile + available slots

**Frontend**: Doctor detail sheet/modal (new UI needed — currently not built)
- Doctor info: photo, qualifications, languages, experience, registration number
- Clinic info: address, map
- Available time slots (from `DoctorClinic.slotTemplate` JSON)
- Consultation mode selector: VIDEO / AUDIO / CHAT / IN_PERSON

**Backend** (new endpoints needed):
```
GET /api/v1/doctors/:id           → Doctor profile with clinic mappings
GET /api/v1/doctors/:id/slots?date= → Parse slotTemplate for given date
```

**DB Models**: `DoctorProfile`, `DoctorClinic` (slotTemplate JSON), `Clinic`

**ABDM Touchpoint**: HPR `GET /hpr/v3/professional/details` — optionally verify HPRID

**Audit Event**: `DOCTOR_PROFILE_VIEWED` (actorUserId, doctorId)

---

### Step 3: Appointment Booking

**User action**: Select slot → Confirm booking details → Book

**Frontend**: `app/(platform)/app/discovery/page.tsx` (extend with booking form)
- Patient selects: consultation mode, reason for visit, slot
- Preview: doctor name, date/time, mode, fee
- "Confirm Booking" button

**Backend**:
```
POST /api/v1/telemedicine/appointments
├── Controller: TelemedicineController.createAppointment()
├── Service: TelemedicineService.createAppointment()
│   ├── Validates doctor exists
│   ├── Calculates slotEndAt (default +30min)
│   ├── Creates Appointment (status: CONFIRMED)
│   └── Returns appointment with doctor + clinic info
├── DB: Appointment (patientUserId, doctorProfileId, clinicId, consultationMode, slotStartAt, slotEndAt, status)
└── Response: {id, consultationMode, reason, slotStartAt, status, doctorProfile, clinic}
```

**Validation Needed**:
- Check doctor availability in slotTemplate
- Prevent double-booking (same doctor, overlapping slot)
- Patient must have completed profile

**ABDM Touchpoint**: UHI `POST /confirm` → `POST /on_confirm` (if participating in UHI)

**Notification Events**:
- To patient: `APPOINTMENT_CONFIRMED` (push + in-app)
- To doctor: `NEW_APPOINTMENT` (push)

**Audit Event**: `APPOINTMENT_CREATED` (actorUserId, doctorId, appointmentId, mode, slot)

**DB Impact**: Create `Appointment` record

---

### Step 4: Payment (Consultation Fee)

**User action**: Pay consultation fee

**Frontend**: Payment screen (new UI or integrate with existing)
- Amount display (consultation fee from DoctorProfile)
- Payment method: Razorpay (cards/UPI/net banking)
- Payment status: PENDING → PROCESSING → COMPLETED / FAILED

**Backend**:
```
POST /api/v1/payments/consultations
├── Controller: PaymentsController.createConsultationOrder()
├── Service: PaymentsService.createConsultationOrder()
│   ├── Validates appointment ownership
│   ├── Creates PaymentOrder (type: CONSULTATION, status: PENDING)
│   ├── Creates Razorpay order (amount * 100)
│   ├── Links PaymentOrder to Appointment
│   └── Returns order with razorpay_order_id
├── DB: PaymentOrder, Appointment (paymentOrderId updated)
└── Response: {id, amount, providerReference (razorpay_order_id), status}

POST /api/v1/payments/webhooks/razorpay (gateway callback)
├── Verifies HMAC signature
├── On payment.captured → Updates PaymentOrder to CAPTURED
├── On payment.failed → Updates PaymentOrder to FAILED
└── Sends notification to patient
```

**Notification Events**:
- To patient: `PAYMENT_SUCCESS` / `PAYMENT_FAILED`
- To doctor: `CONSULTATION_PAID`

**Audit Event**: `PAYMENT_CAPTURED` (actorUserId, paymentOrderId, amount)

**DB Impact**: `PaymentOrder` status update, `Appointment.paymentOrderId` linked

---

### Step 5: Consultation (Video Session)

**User action**: Join consultation at scheduled time

**Frontend**: Video consultation page (new UI needed)
- Pre-consultation: waiting room, doctor info, estimated wait
- During consultation: video/audio feed (LiveKit), chat sidebar
- Controls: mute, camera toggle, end call, screen share
- Post-consultation: summary, rating, follow-up options

**Backend**:
```
POST /api/v1/telemedicine/appointments/:id/session
├── Controller: TelemedicineController.createSession()
├── Service: TelemedicineService.createSession()
│   ├── Validates access (patient or doctor)
│   ├── Creates/upserts ConsultationSession with LiveKit room
│   ├── Generates patient LiveKit token (publish + subscribe)
│   ├── Generates doctor LiveKit token (publish + subscribe)
│   └── Returns session + tokens
├── DB: ConsultationSession (appointmentId, livekitRoomName, waitingRoomOpenAt)
└── Response: {session: {id, livekitRoomName}, patientToken, doctorToken}
```

**LiveKit Integration**: `LivekitService.createParticipantToken(identity, roomName)` with `ttl: 20m`

**ABDM Touchpoint**: FHIR `Encounter` resource creation post-consultation

**Notification Events**:
- To patient (reminder): `APPOINTMENT_REMINDER` (15 min before)
- To doctor: `PATIENT_JOINED` / `PATIENT_LEFT`
- To patient: `SESSION_READY` (room is open)

**Audit Event**: `CONSULTATION_STARTED` / `CONSULTATION_ENDED` (actorUserId, sessionId, duration)

**DB Models**: `ConsultationSession`, `ConsultationSummary` (AI-generated)

---

### Step 6: Clinical Notes & Diagnosis

**User action**: Doctor writes clinical notes after consultation

**Frontend**: Doctor workspace (`/doctor` page — needs full implementation)
- Patient summary (name, age, history)
- Vital signs input (BP, heart rate, temperature, etc.)
- Symptoms recorded
- Clinical notes textarea
- Diagnosis code selection (ICD-11 / custom)
- AI-assisted note generation (reuse WyshCare AI module)

**Backend** (new endpoints needed):
```
POST /api/v1/consultations/:sessionId/notes
├── Body: {clinicalNotes, diagnosis, symptoms[], vitals{}}
├── Auth: JwtAuthGuard + doctor ownership check
├── Creates/updates ConsultationSummary
├── Optionally creates TimelineEvent
└── DB: ConsultationSummary (sessionId, summary, followUpTasks)

POST /api/v1/ai/report-summary
├── Optional: Use Gemini to structure clinical notes
└── Returns summarized clinical notes
```

**ABDM Touchpoint**:
- FHIR `Encounter` (completed) — map to ABDM `OPConsultation` HI type
- FHIR `Condition` — map diagnosis
- FHIR `Observation` — map vitals

**Audit Event**: `CLINICAL_NOTES_SAVED` (doctorUserId, sessionId)

**DB Models**: `ConsultationSummary`, `TimelineEvent` (type: `APPOINTMENT`)

---

### Step 7: Prescription Creation

**User action**: Doctor creates and signs digital prescription

**Frontend**: Doctor workspace — prescription form
- Patient info auto-filled
- Medication entries: name, dosage, frequency, duration, instructions
- Add multiple medications (reuse existing `Medication` model)
- Diagnosis summary (from clinical notes)
- Additional instructions
- Digital signature / e-sign

**Backend** (new endpoints needed):
```
POST /api/v1/prescriptions
├── Controller: PrescriptionController.create()
├── Auth: JwtAuthGuard + RolesGuard(DOCTOR)
├── Body: {appointmentId?, diagnosisSummary, instructions, medications[{name, dosage, frequency, duration, instructions}]}
├── Service: PrescriptionService.create()
│   ├── Creates Prescription linked to appointment
│   ├── Creates Medication entries
│   ├── Optionally links to HealthRecord
│   ├── Creates TimelineEvent (type: PRESCRIPTION_ISSUED)
│   └── Returns prescription with medications
├── DB: Prescription (healthRecordId, doctorProfileId, appointmentId, diagnosisSummary, instructions)
│         Medication (prescriptionId, name, dosage, frequency, duration, instructions)
└── Response: {id, diagnosisSummary, instructions, medications[], doctorProfile}
```

**Prescription Signing**: Digital signature (e.g., DSC/HPR-linked) — store signature hash

**ABDM Touchpoint**:
- FHIR `MedicationRequest` — map each medication
- FHIR `Prescription` — map to ABDM `Prescription` HI type
- Push to care context if patient has ABHA

**Notification Events**:
- To patient: `NEW_PRESCRIPTION` (in-app + push)
- Link from patient dashboard `/app/records`

**Audit Event**: `PRESCRIPTION_CREATED` (doctorUserId, patientUserId, prescriptionId, medicationCount)

**DB Models**: `Prescription` (new table or extend existing), `Medication` (exists), `HealthRecord` (link), `TimelineEvent`

---

### Step 8: Prescription Storage & Patient Access

**User action**: Patient views prescription in their records

**Frontend**: `app/(platform)/app/records/page.tsx` — extends existing
- Prescription card in records list
- Tap to view full prescription details
- Download/print option
- "Order Medicines" CTA → redirects to pharmacy

**Backend** (exists):
```
GET /api/v1/vault/prescriptions
├── Controller: VaultController.listPrescriptions()
├── Auth: JwtAuthGuard
├── Service: VaultService.listPrescriptions()
│   └── Prescriptions with medications + doctor info
└── Response: [{id, diagnosisSummary, instructions, medications[], doctorProfile}]
```

**ABDM Touchpoint**: Prescription FHIR resource available via ABDM data exchange (when patient has given consent)

**Audit Event**: `PRESCRIPTION_VIEWED` (patientUserId, prescriptionId)

---

### Step 9: Pharmacy Fulfillment

**User action**: Patient orders medicines from pharmacy

**Frontend**: `app/(platform)/app/pharmacy/page.tsx`
- Select prescription → auto-fill medicine list
- Choose pharmacy partner
- Delivery address input
- Review & place order

**Backend** (exists):
```
POST /api/v1/pharmacy/orders
├── Controller: PharmacyController.createOrder()
├── Auth: JwtAuthGuard
├── Body: {partnerId, prescriptionId, deliveryAddress, medicinePayload}
├── Service: PharmacyService.createOrder()
│   └── Creates PharmacyOrder (status: PENDING_VERIFICATION)
├── DB: PharmacyOrder
└── Response: {id, status}
```

**New: Prescription verification flow**
```
PENDING_VERIFICATION → VERIFIED → PROCESSING → DISPATCHED → DELIVERED
```
- Pharmacist verifies prescription authenticity
- Update stock → mark as PROCESSING
- Dispatch tracking → DISPATCHED
- Delivery confirmation → DELIVERED

**Pharmacy Partner Dashboard** (new — needs build):
- View incoming orders
- Verify prescription
- Update order status
- Communication with patient

**ABDM Touchpoint**: FHIR `MedicationDispense` — map pharmacy fulfillment

**Notification Events**:
- To patient: `ORDER_PLACED`, `ORDER_VERIFIED`, `ORDER_DISPATCHED`, `ORDER_DELIVERED`
- To pharmacy: `NEW_ORDER`, `PATIENT_QUERY`

**Audit Event**: `PHARMACY_ORDER_CREATED` (patientUserId, orderId, partnerId)
`PHARMACY_ORDER_STATUS_CHANGE` (orderId, oldStatus, newStatus)

**DB Models**: `PharmacyOrder`, `PharmacyPartner` (exist)

---

### Step 10: Refill & Follow-up

**User action**: Patient requests prescription refill

**Frontend**: `app/(platform)/app/pharmacy/page.tsx` — refill button on past orders
- View prescription refill eligibility (`Prescription.refillDueAt`)
- Request refill → creates new order with same medicines
- Optional: schedule follow-up appointment

**Backend** (new endpoints needed):
```
POST /api/v1/pharmacy/orders/:orderId/refill
├── Auth: JwtAuthGuard
├── Service: PharmacyService.createRefillOrder()
│   ├── Validates refill eligibility
│   ├── Creates new PharmacyOrder based on previous
│   └── Returns new order
└── DB: PharmacyOrder (new record, linked to original)
```

**Follow-up Scheduling**:
```
POST /api/v1/telemedicine/appointments
├── Reuse existing appointment booking flow
└── Link to previous prescription/appointment
```

**Notification Events**:
- To patient (automated): `REFILL_REMINDER` (before refillDueAt)
- To patient: `FOLLOW_UP_REMINDER` (based on consultation summary)

**Audit Event**: `REFILL_REQUESTED` (patientUserId, prescriptionId, orderId)

---

## 3. Complete Database Model Changes

### New Models Needed

```prisma
model Prescription {
  id               String   @id @default(cuid())
  healthRecordId   String?
  healthRecord     HealthRecord? @relation(fields: [healthRecordId], references: [id])
  doctorProfileId  String
  doctorProfile    DoctorProfile @relation(fields: [doctorProfileId], references: [id])
  appointmentId    String?
  appointment      Appointment? @relation(fields: [appointmentId], references: [id])
  patientUserId    String
  patientUser      User     @relation(fields: [patientUserId], references: [id])
  diagnosisSummary String?
  instructions     String?
  refillDueAt      DateTime?
  signedHash       String?       // Digital signature hash
  status           String   @default("ACTIVE")  // ACTIVE | FULFILLED | EXPIRED
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  medications      Medication[]
  pharmacyOrders   PharmacyOrder[]
}

model ConsultationNote {
  id                String   @id @default(cuid())
  sessionId         String   @unique
  session           ConsultationSession @relation(fields: [sessionId], references: [id])
  doctorUserId      String
  clinicalNotes     String?
  diagnosis         String?  // ICD-11 or custom code
  symptoms          Json?    // Array of symptoms
  vitals            Json?    // {bp, heartRate, temperature, etc}
  followUpRequired  Boolean  @default(false)
  followUpDate      DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

enum PharmacyOrderStatus {
  PENDING_VERIFICATION
  VERIFIED
  PROCESSING
  DISPATCHED
  DELIVERED
  CANCELLED
  REFUNDED
}
```

### Existing Model Updates

```prisma
model Prescription {
  // Add to existing model (if it exists in schema)
  // If not, create as above
}

model PharmacyOrder {
  // Add status enum update
  status PharmacyOrderStatus @default(PENDING_VERIFICATION)
  // Add tracking fields
  trackingUrl   String?
  deliveredAt   DateTime?
  // Link to prescription
  prescriptionId String?
  prescription  Prescription? @relation(fields: [prescriptionId], references: [id])
}

model ConsultationSummary {
  // Add reference to clinical notes
  clinicalNotesId String?
  clinicalNotes   ConsultationNote? @relation(fields: [clinicalNotesId], references: [id])
}
```

---

## 4. New Frontend Screens Required

| Screen | Route | Priority | Description |
|---|---|---|---|
| Doctor Profile Detail | `/app/discovery/:id` | P0 | Full doctor profile + slot picker + booking |
| Checkout / Payment | `/app/booking/:id/payment` | P0 | Payment flow for consultation |
| Video Consultation | `/app/consultation/:id` | P0 | LiveKit video room |
| Doctor Workspace | `/doctor/appointments` | P0 | Doctor's appointment list + patient context |
| Doctor Clinical Notes | `/doctor/consultation/:id/notes` | P0 | Clinical notes + vitals + diagnosis |
| Doctor Prescription | `/doctor/consultation/:id/prescribe` | P0 | Prescription creation form |
| Prescription View | `/app/records/prescriptions/:id` | P1 | Patient prescription detail view |
| Order Tracking | `/app/pharmacy/orders/:id` | P1 | Pharmacy order tracking |
| Pharmacy Dashboard | `/pharmacy/orders` | P1 | Pharmacy partner order management |
| Refill Request | `/app/pharmacy/refill/:prescriptionId` | P2 | Refill order flow |
| Follow-up Booking | `/app/booking/follow-up/:prescriptionId` | P2 | Schedule follow-up |

---

## 5. New Backend Endpoints Required

| Method | Path | Module | Priority | Description |
|---|---|---|---|---|
| GET | `/api/v1/doctors/:id` | Doctors | P0 | Full doctor profile |
| GET | `/api/v1/doctors/:id/slots` | Doctors | P0 | Available slots for date |
| POST | `/api/v1/consultations/:sessionId/notes` | Telemedicine | P0 | Save clinical notes |
| POST | `/api/v1/prescriptions` | Vault | P0 | Create prescription |
| GET | `/api/v1/prescriptions/:id` | Vault | P0 | Get prescription details |
| PATCH | `/api/v1/pharmacy/orders/:id/status` | Pharmacy | P1 | Update order status (pharmacy) |
| POST | `/api/v1/pharmacy/orders/:id/refill` | Pharmacy | P1 | Request refill |
| GET | `/api/v1/doctors/:id/appointments` | Telemedicine | P1 | Doctor's appointment list |
| POST | `/api/v1/appointments/:id/cancel` | Telemedicine | P1 | Cancel appointment |
| POST | `/api/v1/consultations/:sessionId/end` | Telemedicine | P1 | End consultation, generate summary |

---

## 6. ABDM Integration Points for Care Journey

| Journey Step | ABDM Component | ABDM API | FHIR Resource | Condition |
|---|---|---|---|---|
| Doctor Profile | HPR | `GET /hpr/v3/professional/details` | Practitioner | Doctor has HPRID |
| Clinic Info | HFR | `GET /hfr/v4/facility/{id}` | Organization | Clinic is HFR-registered |
| Appointment | UHI (opt) | `POST /confirm` | Appointment | UHI participant |
| Consultation | M3 Consent | Consent artefact check | Encounter | Patient has ABHA + consent |
| Clinical Notes | M2 Data | Care context update | Observation / Condition | Patient has ABHA |
| Prescription | M2 Data | Care context update | MedicationRequest | Patient has ABHA |
| Prescription FHIR | M3 Data Exchange | `POST /v3/health-information/notify` | Bundle (Prescription) | Consent artefact exists |
| Pharmacy Order | M2 Data | Care context update | MedicationDispense | Patient has ABHA |
| Record Access | M3 Consent | Consent artefact | DocumentReference | Granted consent |

---

## 7. Notification Events Summary

| Event | Trigger | Channel | Recipient |
|---|---|---|---|
| `APPOINTMENT_CONFIRMED` | Booking complete | In-app + Push | Patient |
| `NEW_APPOINTMENT` | Booking complete | In-app + Push | Doctor |
| `APPOINTMENT_REMINDER` | 15min before slot | Push | Patient |
| `PAYMENT_SUCCESS` | Payment captured | In-app | Patient |
| `PAYMENT_FAILED` | Payment failed | In-app | Patient |
| `CONSULTATION_PAID` | Payment captured | In-app | Doctor |
| `SESSION_READY` | Doctor creates room | In-app | Patient |
| `PATIENT_JOINED` | Patient joins room | In-app | Doctor |
| `NEW_PRESCRIPTION` | Prescription issued | In-app + Push | Patient |
| `ORDER_PLACED` | Pharmacy order placed | In-app | Patient |
| `NEW_ORDER` | Pharmacy order placed | In-app | Pharmacy |
| `ORDER_VERIFIED` | Prescription verified | In-app | Patient |
| `ORDER_DISPATCHED` | Order shipped | In-app + Push | Patient |
| `ORDER_DELIVERED` | Delivery confirmed | In-app | Patient |
| `REFILL_REMINDER` | Refill due date approaching | Push | Patient |
| `FOLLOW_UP_REMINDER` | Follow-up date approaching | Push | Patient |

---

## 8. Audit Trail Summary

| Event | Module | Actor | Resource | Details |
|---|---|---|---|---|
| `DOCTOR_SEARCHED` | Discovery | Patient | Query | search query, filters |
| `DOCTOR_PROFILE_VIEWED` | Doctors | Patient | Doctor | doctorId |
| `APPOINTMENT_CREATED` | Telemedicine | Patient | Appointment | doctorId, slot, mode |
| `APPOINTMENT_CANCELLED` | Telemedicine | Patient/Doctor | Appointment | reason |
| `PAYMENT_INITIATED` | Payments | Patient | PaymentOrder | amount, method |
| `PAYMENT_CAPTURED` | Payments | System | PaymentOrder | gatewayRef |
| `CONSULTATION_STARTED` | Telemedicine | System | Session | sessionId |
| `CONSULTATION_ENDED` | Telemedicine | System | Session | duration |
| `CLINICAL_NOTES_SAVED` | Telemedicine | Doctor | Session | noteId |
| `PRESCRIPTION_CREATED` | Prescriptions | Doctor | Prescription | medication count |
| `PRESCRIPTION_VIEWED` | Vault | Patient | Prescription | — |
| `PHARMACY_ORDER_PLACED` | Pharmacy | Patient | Order | partnerId, items |
| `PHARMACY_ORDER_VERIFIED` | Pharmacy | Pharmacist | Order | — |
| `PHARMACY_ORDER_DISPATCHED` | Pharmacy | Pharmacist | Order | trackingUrl |
| `PHARMACY_ORDER_DELIVERED` | Pharmacy | System | Order | — |
| `REFILL_REQUESTED` | Pharmacy | Patient | Order | prescriptionId |
| `FOLLOW_UP_SCHEDULED` | Telemedicine | Patient | Appointment | — |
