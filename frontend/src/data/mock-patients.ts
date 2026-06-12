/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/data/mock-patients.ts
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
 * mock-patients — Patient module
 *
 * Responsibilities:
 * - Support patient functionality
 *
 * Used By:
 - Standalone (not imported by other source files)
 *
 * Calls:
 - None identified
 *
 * Dependencies:
 - None identified
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Patient
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

export interface MockPatient {
  id: string;
  fullName: string;
  age: number;
  gender: string;
  bloodGroup: string;
  mrn: string;
  specialty: string;
  condition: string;
  risk: 'low' | 'medium' | 'high';
  lastVisit: string;
  appointmentTime: string;
  status: 'scheduled' | 'checked_in' | 'waiting' | 'with_doctor' | 'completed';
  vitals: { bp: string; hr: number; temp: number; spo2: number };
  allergies: string[];
  medications: string[];
}

export const MOCK_PATIENTS: MockPatient[] = [
  {
    id: 'pat-001',
    fullName: 'Rahul Verma',
    age: 45,
    gender: 'Male',
    bloodGroup: 'B+',
    mrn: 'WYSH-001',
    specialty: 'dental',
    condition: 'Dental Caries #26, Gingivitis, Impacted #18',
    risk: 'low',
    lastVisit: '2026-05-28',
    appointmentTime: '09:30',
    status: 'waiting',
    vitals: { bp: '128/82', hr: 72, temp: 98.6, spo2: 98 },
    allergies: ['Penicillin'],
    medications: ['Amoxicillin', 'Ibuprofen'],
  },
  {
    id: 'pat-002',
    fullName: 'Ananya Sharma',
    age: 32,
    gender: 'Female',
    bloodGroup: 'A+',
    mrn: 'WYSH-002',
    specialty: 'general-medicine',
    condition: 'Hypertension Stage 1, Migraine, Vit D Deficiency',
    risk: 'medium',
    lastVisit: '2026-06-05',
    appointmentTime: '10:00',
    status: 'checked_in',
    vitals: { bp: '142/88', hr: 78, temp: 98.4, spo2: 97 },
    allergies: ['Sulfa'],
    medications: ['Losartan', 'Sumatriptan'],
  },
  {
    id: 'pat-003',
    fullName: 'Dr. Suresh Mehta',
    age: 68,
    gender: 'Male',
    bloodGroup: 'O+',
    mrn: 'WYSH-003',
    specialty: 'ophthalmology',
    condition: 'Cataract OD Grade 2, Glaucoma Suspect, Myopia',
    risk: 'medium',
    lastVisit: '2026-05-15',
    appointmentTime: '11:00',
    status: 'with_doctor',
    vitals: { bp: '134/78', hr: 70, temp: 98.2, spo2: 99 },
    allergies: [],
    medications: ['Latanoprost', 'Timolol'],
  },
  {
    id: 'pat-004',
    fullName: 'Priya Patel',
    age: 29,
    gender: 'Female',
    bloodGroup: 'AB+',
    mrn: 'WYSH-004',
    specialty: 'dermatology',
    condition: 'Acne Vulgaris, Androgenetic Alopecia Ludwig I, Melasma',
    risk: 'low',
    lastVisit: '2026-06-01',
    appointmentTime: '11:30',
    status: 'checked_in',
    vitals: { bp: '118/76', hr: 68, temp: 98.4, spo2: 99 },
    allergies: ['Doxycycline'],
    medications: ['Clindamycin gel', 'Minoxidil'],
  },
  {
    id: 'pat-005',
    fullName: 'Vikram Singh',
    age: 52,
    gender: 'Male',
    bloodGroup: 'B-',
    mrn: 'WYSH-005',
    specialty: 'ent',
    condition: 'Chronic Sinusitis, SNHL Left, Allergic Rhinitis',
    risk: 'medium',
    lastVisit: '2026-05-22',
    appointmentTime: '14:00',
    status: 'scheduled',
    vitals: { bp: '126/80', hr: 74, temp: 98.8, spo2: 96 },
    allergies: ['Aspirin'],
    medications: ['Fluticasone', 'Montelukast'],
  },
  {
    id: 'pat-006',
    fullName: 'Kavita Reddy',
    age: 7,
    gender: 'Female',
    bloodGroup: 'A+',
    mrn: 'WYSH-006',
    specialty: 'pediatrics',
    condition: 'Growth Monitoring, MMR 2nd Dose Due',
    risk: 'low',
    lastVisit: '2026-04-10',
    appointmentTime: '15:00',
    status: 'scheduled',
    vitals: { bp: '100/62', hr: 85, temp: 98.6, spo2: 99 },
    allergies: [],
    medications: [],
  },
  {
    id: 'pat-007',
    fullName: 'Rajesh Kumar',
    age: 55,
    gender: 'Male',
    bloodGroup: 'A+',
    mrn: 'WYSH-007',
    specialty: 'cardiology',
    condition: 'Chest Pain Evaluation, Hypertension',
    risk: 'high',
    lastVisit: '2026-06-08',
    appointmentTime: '09:00',
    status: 'completed',
    vitals: { bp: '156/94', hr: 88, temp: 98.3, spo2: 96 },
    allergies: [],
    medications: ['Metoprolol', 'Atorvastatin'],
  },
  {
    id: 'pat-008',
    fullName: 'Sunita Gupta',
    age: 62,
    gender: 'Female',
    bloodGroup: 'O-',
    mrn: 'WYSH-008',
    specialty: 'orthopedics',
    condition: 'Knee OA Grade 3, Osteoporosis',
    risk: 'medium',
    lastVisit: '2026-06-03',
    appointmentTime: '10:30',
    status: 'completed',
    vitals: { bp: '130/82', hr: 76, temp: 98.5, spo2: 98 },
    allergies: ['NSAIDs'],
    medications: ['Calcium', 'Vit D', 'Alendronate'],
  },
  {
    id: 'pat-009',
    fullName: 'Aakanksha Rao',
    age: 28,
    gender: 'Female',
    bloodGroup: 'O+',
    mrn: 'WYSH-009',
    specialty: 'gynecology',
    condition: 'Prenatal Checkup, G1P0 14 Weeks, Mild Dysmenorrhea',
    risk: 'low',
    lastVisit: '2026-05-12',
    appointmentTime: '12:00',
    status: 'waiting',
    vitals: { bp: '116/70', hr: 74, temp: 98.2, spo2: 99 },
    allergies: [],
    medications: ['Prenatal Vitamins', 'Folic Acid'],
  },
  {
    id: 'pat-010',
    fullName: 'Devendra Joshi',
    age: 58,
    gender: 'Male',
    bloodGroup: 'AB-',
    mrn: 'WYSH-010',
    specialty: 'neurology',
    condition: 'Parkinsonian Tremors, Mild Cognitive Impairment',
    risk: 'medium',
    lastVisit: '2026-05-30',
    appointmentTime: '13:00',
    status: 'checked_in',
    vitals: { bp: '132/84', hr: 68, temp: 98.4, spo2: 97 },
    allergies: ['Levodopa (mild nausea)'],
    medications: ['Carbidopa-Levodopa', 'Donepezil'],
  },
  {
    id: 'pat-011',
    fullName: 'Shreya Iyer',
    age: 24,
    gender: 'Female',
    bloodGroup: 'B+',
    mrn: 'WYSH-011',
    specialty: 'psychiatry',
    condition: 'Major Depressive Disorder (Moderate), GAD',
    risk: 'medium',
    lastVisit: '2026-06-02',
    appointmentTime: '13:30',
    status: 'waiting',
    vitals: { bp: '112/72', hr: 82, temp: 98.6, spo2: 99 },
    allergies: [],
    medications: ['Sertraline', 'Clonazepam'],
  },
  {
    id: 'pat-012',
    fullName: 'Harish Chandra',
    age: 65,
    gender: 'Male',
    bloodGroup: 'A-',
    mrn: 'WYSH-012',
    specialty: 'pulmonology',
    condition: 'COPD GOLD Stage II, Chronic Productive Cough',
    risk: 'high',
    lastVisit: '2026-05-25',
    appointmentTime: '14:30',
    status: 'checked_in',
    vitals: { bp: '138/88', hr: 86, temp: 99.0, spo2: 93 },
    allergies: ['Penicillin'],
    medications: ['Tiotropium', 'Fluticasone/Salmeterol'],
  },
  {
    id: 'pat-013',
    fullName: 'Amit Trivedi',
    age: 41,
    gender: 'Male',
    bloodGroup: 'O+',
    mrn: 'WYSH-013',
    specialty: 'gastroenterology',
    condition: 'Gastroesophageal Reflux Disease (GERD), IBS-D',
    risk: 'low',
    lastVisit: '2026-06-04',
    appointmentTime: '15:30',
    status: 'scheduled',
    vitals: { bp: '124/80', hr: 76, temp: 98.4, spo2: 98 },
    allergies: [],
    medications: ['Omeprazole', 'Dicyclomine'],
  },
  {
    id: 'pat-014',
    fullName: 'Narendra Patil',
    age: 67,
    gender: 'Male',
    bloodGroup: 'B+',
    mrn: 'WYSH-014',
    specialty: 'urology',
    condition: 'Benign Prostatic Hyperplasia (BPH), Nocturia',
    risk: 'medium',
    lastVisit: '2026-06-01',
    appointmentTime: '16:00',
    status: 'scheduled',
    vitals: { bp: '140/86', hr: 72, temp: 98.1, spo2: 98 },
    allergies: ['Sulfa'],
    medications: ['Tamsulosin', 'Finasteride'],
  },
  {
    id: 'pat-015',
    fullName: 'Dr. Veena Nair',
    age: 53,
    gender: 'Female',
    bloodGroup: 'A+',
    mrn: 'WYSH-015',
    specialty: 'endocrinology',
    condition: 'Type 2 Diabetes Mellitus (Uncontrolled), Hypothyroidism',
    risk: 'medium',
    lastVisit: '2026-06-07',
    appointmentTime: '16:30',
    status: 'scheduled',
    vitals: { bp: '130/82', hr: 74, temp: 98.5, spo2: 98 },
    allergies: [],
    medications: ['Metformin', 'Empagliflozin', 'Levothyroxine'],
  },
];
