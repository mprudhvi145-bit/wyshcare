/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/specialties/dermatology/dermatology.service.ts
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
 * Business logic service for dermatology
 *
 * Responsibilities:
 * - Execute business logic for wyshid operations
 * - Coordinate data access and external API calls
 *
 * Used By:
 - backend/src/modules/prescription/prescription.service.ts
 - backend/src/providers/storage/storage.module.ts
 - backend/src/modules/abdm/abdm.module.ts
 - backend/src/modules/prescription/interaction-engine.service.ts
 - backend/src/modules/interoperability/interoperability.module.ts
 - backend/src/modules/digital-twin/digital-twin.service.ts
 - backend/src/main.ts
 - backend/src/modules/health-graph/health-graph.service.ts
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
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { SpecialtyBaseService } from '../shared/specialty-base.service';

const BODY_REGIONS = [
  { id: 'scalp', label: 'Scalp', parent: 'head' },
  { id: 'face', label: 'Face', parent: 'head' },
  { id: 'neck', label: 'Neck', parent: 'head' },
  { id: 'chest', label: 'Chest', parent: 'torso' },
  { id: 'abdomen', label: 'Abdomen', parent: 'torso' },
  { id: 'back-upper', label: 'Upper Back', parent: 'torso' },
  { id: 'back-lower', label: 'Lower Back', parent: 'torso' },
  { id: 'shoulders', label: 'Shoulders', parent: 'torso' },
  { id: 'arms-upper', label: 'Upper Arms', parent: 'arms' },
  { id: 'arms-lower', label: 'Forearms', parent: 'arms' },
  { id: 'hands', label: 'Hands', parent: 'arms' },
  { id: 'legs-upper', label: 'Thighs', parent: 'legs' },
  { id: 'legs-lower', label: 'Lower Legs', parent: 'legs' },
  { id: 'feet', label: 'Feet', parent: 'legs' },
  { id: 'genital', label: 'Genital Area', parent: 'torso' },
  { id: 'nails', label: 'Nails', parent: 'extremities' },
];

const LESION_TYPES = [
  { value: 'macule', label: 'Macule' },
  { value: 'papule', label: 'Papule' },
  { value: 'plaque', label: 'Plaque' },
  { value: 'nodule', label: 'Nodule' },
  { value: 'vesicle', label: 'Vesicle' },
  { value: 'bulla', label: 'Bulla' },
  { value: 'pustule', label: 'Pustule' },
  { value: 'wheal', label: 'Wheal' },
  { value: 'scale', label: 'Scale' },
  { value: 'crust', label: 'Crust' },
  { value: 'erosion', label: 'Erosion' },
  { value: 'ulcer', label: 'Ulcer' },
  { value: 'fissure', label: 'Fissure' },
  { value: 'scar', label: 'Scar' },
  { value: 'atrophy', label: 'Atrophy' },
  { value: 'telangiectasia', label: 'Telangiectasia' },
];

const COSMETIC_PROCEDURES = [
  { code: 'PRP', name: 'Platelet Rich Plasma Therapy', category: 'regenerative' },
  { code: 'GFC', name: 'Growth Factor Concentrate', category: 'regenerative' },
  { code: 'MICRONEEDLING', name: 'Microneedling', category: 'rejuvenation' },
  { code: 'LASER_HAIR_REMOVAL', name: 'Laser Hair Removal', category: 'laser' },
  { code: 'LASER_TATTOO', name: 'Laser Tattoo Removal', category: 'laser' },
  { code: 'LASER_RESURFACING', name: 'Laser Resurfacing', category: 'laser' },
  { code: 'CHEMICAL_PEEL', name: 'Chemical Peel', category: 'rejuvenation' },
  { code: 'BOTOX', name: 'Botulinum Toxin', category: 'injectable' },
  { code: 'FILLER', name: 'Dermal Fillers', category: 'injectable' },
  { code: 'MESOTHERAPY', name: 'Mesotherapy', category: 'injectable' },
  { code: 'RADIOFREQUENCY', name: 'Radiofrequency', category: 'energy' },
  { code: 'HIFU', name: 'High Intensity Focused Ultrasound', category: 'energy' },
  { code: 'CRYOTHERAPY', name: 'Cryotherapy', category: 'treatment' },
  { code: 'ELECTROCAUTERY', name: 'Electrocautery', category: 'treatment' },
  { code: 'EXCISION', name: 'Surgical Excision', category: 'surgical' },
  { code: 'BIOPSY', name: 'Skin Biopsy', category: 'diagnostic' },
  { code: 'PATCH_TEST', name: 'Patch Testing', category: 'diagnostic' },
  { code: 'WOODS_LAMP', name: "Wood's Lamp Examination", category: 'diagnostic' },
  { code: 'DERMATOSCOPY', name: 'Dermatoscopy', category: 'diagnostic' },
];

@Injectable()
export class DermatologyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly base: SpecialtyBaseService,
  ) {}

  getBodyRegions() { return BODY_REGIONS; }
  getLesionTypes() { return LESION_TYPES; }
  getCosmeticProcedures(category?: string) {
    if (!category) return COSMETIC_PROCEDURES;
    return COSMETIC_PROCEDURES.filter(p => p.category === category);
  }

  getTemplates() {
    return [
      {
        id: 'dermatology-exam',
        name: 'Comprehensive Skin & Hair Exam',
        description: 'Full dermatological evaluation with body mapping',
        sections: [
          {
            id: 'chief-complaint', title: 'Chief Complaint', type: 'form' as const, fields: [
              { id: 'primaryComplaint', label: 'Primary Skin/Hair Concern', type: 'textarea', required: true },
              { id: 'duration', label: 'Duration', type: 'text' },
              { id: 'symptoms', label: 'Associated Symptoms', type: 'multiselect', options: [
                { label: 'Itching', value: 'itching' }, { label: 'Pain', value: 'pain' },
                { label: 'Burning', value: 'burning' }, { label: 'Bleeding', value: 'bleeding' },
                { label: 'Oozing', value: 'oozing' }, { label: 'Fever', value: 'fever' },
              ]},
              { id: 'triggers', label: 'Triggers', type: 'textarea', placeholder: 'Sun, stress, food, medications...' },
              { id: 'previousTreatment', label: 'Previous Treatment', type: 'textarea' },
            ],
          },
          {
            id: 'body-mapping', title: 'Body Mapping', type: 'diagram', fields: [
              { id: 'affectedAreas', label: 'Affected Body Areas', type: 'textarea' },
              { id: 'bsa', label: 'Body Surface Area (%)', type: 'number' },
              { id: 'distribution', label: 'Distribution Pattern', type: 'select', options: [
                { label: 'Localized', value: 'localized' }, { label: 'Generalized', value: 'generalized' },
                { label: 'Symmetrical', value: 'symmetrical' }, { label: 'Asymmetrical', value: 'asymmetrical' },
                { label: 'Flexural', value: 'flexural' }, { label: 'Extensor', value: 'extensor' },
                { label: 'Seborrheic', value: 'seborrheic' }, { label: 'Photo-distributed', value: 'photo' },
              ]},
            ],
          },
          {
            id: 'lesion-assessment', title: 'Lesion Assessment', type: 'form', fields: [
              { id: 'primaryLesion', label: 'Primary Lesion Type', type: 'select', options: LESION_TYPES },
              { id: 'secondaryLesion', label: 'Secondary Changes', type: 'multiselect', options: [
                { label: 'Scale', value: 'scale' }, { label: 'Crust', value: 'crust' },
                { label: 'Erosion', value: 'erosion' }, { label: 'Ulcer', value: 'ulcer' },
                { label: 'Lichenification', value: 'lichenification' }, { label: 'Excoriation', value: 'excoriation' },
              ]},
              { id: 'color', label: 'Color', type: 'text' },
              { id: 'size', label: 'Size (cm)', type: 'text' },
              { id: 'border', label: 'Border', type: 'select', options: [
                { label: 'Well-defined', value: 'well_defined' }, { label: 'Ill-defined', value: 'ill_defined' },
                { label: 'Irregular', value: 'irregular' }, { label: 'Raised', value: 'raised' },
              ]},
              { id: 'texture', label: 'Texture', type: 'select', options: [
                { label: 'Flat', value: 'flat' }, { label: 'Raised', value: 'raised' },
                { label: 'Hard', value: 'hard' }, { label: 'Soft', value: 'soft' },
                { label: 'Warm', value: 'warm' },
              ]},
              { id: 'dermatoscopy', label: 'Dermatoscopy Findings', type: 'textarea' },
            ],
          },
          {
            id: 'hair-assessment', title: 'Hair & Scalp Assessment', type: 'form', fields: [
              { id: 'hairComplaint', label: 'Hair Concern', type: 'textarea', placeholder: 'Hair fall, thinning, baldness...' },
              { id: 'hairFallSeverity', label: 'Hair Fall Severity', type: 'select', options: [
                { label: 'Mild', value: 'mild' }, { label: 'Moderate', value: 'moderate' },
                { label: 'Severe', value: 'severe' },
              ]},
              { id: 'norwoodScale', label: 'Norwood Scale (Male)', type: 'select', options: [
                { label: 'Type I', value: 'I' }, { label: 'Type II', value: 'II' },
                { label: 'Type III', value: 'III' }, { label: 'Type III Vertex', value: 'IIIv' },
                { label: 'Type IV', value: 'IV' }, { label: 'Type V', value: 'V' },
                { label: 'Type VI', value: 'VI' }, { label: 'Type VII', value: 'VII' },
                { label: 'N/A', value: 'na' },
              ]},
              { id: 'ludwigScale', label: 'Ludwig Scale (Female)', type: 'select', options: [
                { label: 'Grade I', value: 'I' }, { label: 'Grade II', value: 'II' },
                { label: 'Grade III', value: 'III' }, { label: 'N/A', value: 'na' },
              ]},
              { id: 'scalpExam', label: 'Scalp Examination', type: 'select', options: [
                { label: 'Normal', value: 'normal' }, { label: 'Erythema', value: 'erythema' },
                { label: 'Scale', value: 'scale' }, { label: 'Scarring', value: 'scarring' },
                { label: 'Atrophy', value: 'atrophy' }, { label: 'Pustules', value: 'pustules' },
              ]},
              { id: 'hairPullTest', label: 'Hair Pull Test', type: 'select', options: [
                { label: 'Negative (<3 hairs)', value: 'negative' },
                { label: 'Positive (3-5 hairs)', value: 'positive_mild' },
                { label: 'Strongly Positive (>5 hairs)', value: 'positive_strong' },
              ]},
              { id: 'trichoscopy', label: 'Trichoscopy Findings', type: 'textarea' },
            ],
          },
          {
            id: 'cosmetic-procedures', title: 'Cosmetic Procedures', type: 'form', fields: [
              { id: 'procedureType', label: 'Procedure Type', type: 'select', options: COSMETIC_PROCEDURES.map(p => ({ label: p.name, value: p.code })) },
              { id: 'procedureArea', label: 'Treatment Area', type: 'text' },
              { id: 'sessions', label: 'Number of Sessions', type: 'number' },
              { id: 'consentObtained', label: 'Consent Obtained', type: 'boolean' },
              { id: 'notes', label: 'Procedure Notes', type: 'textarea' },
            ],
          },
          {
            id: 'diagnosis-plan', title: 'Diagnosis & Plan', type: 'form', fields: [
              { id: 'diagnosis', label: 'Diagnosis', type: 'textarea', required: true },
              { id: 'icdCode', label: 'ICD-10 Code', type: 'text' },
              { id: 'treatment', label: 'Treatment Plan', type: 'textarea' },
              { id: 'topical', label: 'Topical Medications', type: 'textarea' },
              { id: 'systemic', label: 'Systemic Medications', type: 'textarea' },
              { id: 'phototherapy', label: 'Phototherapy', type: 'boolean' },
              { id: 'lifestyle', label: 'Lifestyle Advice', type: 'textarea' },
              { id: 'followUp', label: 'Follow-up', type: 'text' },
            ],
          },
        ],
        isDefault: true,
      },
    ];
  }

  async saveDermatologyEncounter(encounterId: string, patientId: string, providerId: string, data: Record<string, unknown>) {
    const structuredFindings: Array<{
      category: string; findingKey: string; findingValue: Record<string, unknown>;
      severity?: string; status?: string;
    }> = [];

    const lesions = data['lesions'] as Array<Record<string, unknown>> | undefined;
    if (lesions) {
      lesions.forEach((lesion, i) => {
        structuredFindings.push({
          category: 'lesion',
          findingKey: `lesion_${i}`,
          findingValue: lesion,
          severity: (lesion['diagnosis'] as string)?.toLowerCase().includes('malignant') ? 'severe' : 'mild',
          status: 'active',
        });
      });
    }

    if (data['norwoodScale'] && (data['norwoodScale'] as string) !== 'na') {
      structuredFindings.push({
        category: 'hair_assessment',
        findingKey: 'norwood',
        findingValue: { scale: data['norwoodScale'] as string },
        severity: (data['hairFallSeverity'] as string) === 'severe' ? 'moderate' : 'mild',
        status: 'active',
      });
    }

    if (data['ludwigScale'] && (data['ludwigScale'] as string) !== 'na') {
      structuredFindings.push({
        category: 'hair_assessment',
        findingKey: 'ludwig',
        findingValue: { scale: data['ludwigScale'] as string },
        severity: 'mild',
        status: 'active',
      });
    }

    const enrichedFindings = structuredFindings.map(f => ({
      ...f, specialtyCode: 'dermatology', encounterId, patientId, providerId,
    }));

    return this.base.saveEncounterWithFindings({
      specialtyCode: 'dermatology', encounterId, patientId, providerId,
      templateId: 'dermatology-exam', formData: data,
      findings: enrichedFindings,
    });
  }

  async getDermatologyHistory(patientId: string) {
    return this.base.getPatientHistory(patientId, 'dermatology');
  }
}
