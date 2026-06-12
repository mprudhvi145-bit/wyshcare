/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/specialties/general-medicine/general-medicine.service.ts
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
 * Business logic service for general-medicine
 *
 * Responsibilities:
 * - Execute business logic for wyshid operations
 * - Coordinate data access and external API calls
 *
 * Used By:
 - backend/src/modules/ehr/timeline.service.ts
 - backend/src/modules/ai/ai.service.ts
 - backend/src/modules/ai-risk/services/assessors/hypertension-risk.assessor.ts
 - backend/src/providers/observability/observability.module.ts
 - backend/src/modules/dashboard/dashboard.service.ts
 - backend/src/modules/specialties/ophthalmology/ophthalmology.controller.ts
 - backend/src/modules/consent/consent.controller.ts
 - backend/src/modules/prescription/prescription.module.ts
 *
 * Calls:
 - common
 *
 * Dependencies:
 - common
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
WyshID
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

import { Injectable } from '@nestjs/common';

@Injectable()
export class GeneralMedicineService {
  getTemplates() {
    return [
      {
        id: 'general-soap',
        name: 'Standard SOAP Note',
        description: 'General medicine SOAP note template',
        sections: [
          { id: 'subjective', title: 'Subjective', type: 'form' as const, fields: [
            { id: 'chiefComplaint', label: 'Chief Complaint', type: 'textarea', required: true },
            { id: 'hpi', label: 'History of Present Illness', type: 'textarea', required: true },
            { id: 'pastMedicalHistory', label: 'Past Medical History', type: 'textarea' },
            { id: 'medications', label: 'Current Medications', type: 'textarea' },
            { id: 'allergies', label: 'Allergies', type: 'textarea' },
            { id: 'familyHistory', label: 'Family History', type: 'textarea' },
            { id: 'socialHistory', label: 'Social History', type: 'textarea' },
            { id: 'ros', label: 'Review of Systems', type: 'textarea' },
          ]},
          { id: 'objective', title: 'Objective', type: 'form', fields: [
            { id: 'vitals', label: 'Vitals', type: 'textarea' },
            { id: 'generalExam', label: 'General Examination', type: 'textarea' },
            { id: 'systemicExam', label: 'Systemic Examination', type: 'textarea' },
            { id: 'investigations', label: 'Investigations', type: 'textarea' },
          ]},
          { id: 'assessment', title: 'Assessment', type: 'form', fields: [
            { id: 'diagnosis', label: 'Diagnosis', type: 'textarea', required: true },
            { id: 'differential', label: 'Differential Diagnosis', type: 'textarea' },
            { id: 'severity', label: 'Severity', type: 'select', options: [
              { label: 'Mild', value: 'mild' }, { label: 'Moderate', value: 'moderate' },
              { label: 'Severe', value: 'severe' },
            ]},
          ]},
          { id: 'plan', title: 'Plan', type: 'form', fields: [
            { id: 'treatment', label: 'Treatment Plan', type: 'textarea' },
            { id: 'medications', label: 'Medications', type: 'textarea' },
            { id: 'labs', label: 'Lab/Imaging Orders', type: 'textarea' },
            { id: 'referrals', label: 'Referrals', type: 'textarea' },
            { id: 'followUp', label: 'Follow-up', type: 'text' },
            { id: 'patientEducation', label: 'Patient Education', type: 'textarea' },
          ]},
        ],
        isDefault: true,
      },
      {
        id: 'wellness-checkup',
        name: 'Annual Wellness Checkup',
        description: 'Preventive health checkup template',
        sections: [
          { id: 'vitals-screening', title: 'Vitals & Screening', type: 'form', fields: [
            { id: 'bloodPressure', label: 'Blood Pressure', type: 'text' },
            { id: 'heartRate', label: 'Heart Rate', type: 'text' },
            { id: 'respiratoryRate', label: 'Respiratory Rate', type: 'text' },
            { id: 'temperature', label: 'Temperature', type: 'text' },
            { id: 'oxygenSaturation', label: 'Oxygen Saturation', type: 'text' },
            { id: 'height', label: 'Height', type: 'text' },
            { id: 'weight', label: 'Weight', type: 'text' },
            { id: 'bmi', label: 'BMI', type: 'text' },
          ]},
          { id: 'preventive-screenings', title: 'Preventive Screenings', type: 'form', fields: [
            { id: 'cancerScreenings', label: 'Cancer Screenings', type: 'textarea' },
            { id: 'immunizations', label: 'Immunizations Due', type: 'textarea' },
            { id: 'labPanels', label: 'Recommended Lab Panels', type: 'textarea' },
          ]},
          { id: 'lifestyle-counseling', title: 'Health Counseling', type: 'form', fields: [
            { id: 'diet', label: 'Diet/Nutrition', type: 'textarea' },
            { id: 'exercise', label: 'Physical Activity', type: 'textarea' },
            { id: 'substance', label: 'Tobacco/Alcohol', type: 'textarea' },
            { id: 'mentalHealth', label: 'Mental Health Screening', type: 'textarea' },
            { id: 'goals', label: 'Health Goals', type: 'textarea' },
          ]},
        ],
      },
    ];
  }
}
